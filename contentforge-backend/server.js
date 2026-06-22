// backend/server.js
require("dotenv").config();
require("express-async-errors");

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { startTrendScheduler } = require("./services/trendService");
const chatRoutes = require("./routes/chat");
const { User, PlatformSettings, Notification } = require("./models");
const posterRoutes = require("./routes/posterRouter");
const { checkAndSendExpiryWarnings } = require("./services/cronJobs");
const { createNotification } = require("./services/notificationHelper");
const passport = require("passport");
const { resetMonthlyUsage } = require("./middleware/subscription");

const app = express();

const {
  sendTrialExpiryWarningEmail,
  sendScheduledPostReminderEmail,
  sendScheduledPostTomorrowEmail,
} = require("./services/emailService");

require("./config/passport");
app.use(passport.initialize());

mongoose
  .connect(process.env.MONGODB_URI)
  .then((conn) => {
    console.log(`  MongoDB Connected: ${conn.connection.host}`);
    startTrendScheduler();
  })
  .catch((error) => {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("👉 Check your MONGO_URI in the .env file");
    process.exit(1);
  });

const allowedOrigins = [
  process.env.CLIENT_URL,
  'https://content-forge-v2-frontend.vercel.app',
  'http://localhost:5173',
].filter(Boolean)

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      
      if (allowedOrigins.includes(origin)) return callback(null, true)
      
      if (/https:\/\/content-forge-v2-frontend-.*\.vercel\.app$/.test(origin)) {
        return callback(null, true)
      }

      callback(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
  }),
);

app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static("uploads"));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/brand", require("./routes/brand"));
app.use("/api/calendar", require("./routes/calendar"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/trends", require("./routes/trends"));
app.use("/api/chat", chatRoutes);
app.use("/api/admin", require("./routes/admin"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/connections", require("./routes/connections"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/top-posts", require("./routes/topPosts"));
app.use("/api/posters", posterRoutes);
app.use("/api/notifications", require("./routes/notifications"));
app.use(
  "/uploads/generated",
  express.static(path.join(__dirname, "uploads", "generated")),
);
app.use("/api/subscription", require("./routes/subscription"));

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ContentForge API",
    timestamp: new Date().toISOString(),
    mongo: "connected",
  });
});

const cronAuth = (req, res, next) => {
  const secret = req.headers["x-cron-secret"];
  if (!secret || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

app.get("/api/cron/check-expiry", cronAuth, async (req, res) => {
  try {
    console.log("⏰ جاري تشغيل فحص انتهاء فترات التجربة للمستخدمين...");
    await checkAndSendExpiryWarnings();
    res.json({ ok: true, job: "check-expiry" });
  } catch (err) {
    console.error("[Cron] check-expiry error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/cron/expiry-emails", cronAuth, async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne();
    if (!settings?.sendExpiryWarning) {
      return res.json({ ok: true, skipped: true });
    }

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

    const users = await User.find({
      isTrial: true,
      trialEndsAt: { $gte: startOfDay, $lte: endOfDay },
    });

    users.forEach((user) => {
      sendTrialExpiryWarningEmail(user.email, user.name, user.trialEndsAt).catch(
        (err) => console.error(`Expiry email error for ${user.email}:`, err.message),
      );
    });

    console.log(`[Cron] Sent expiry warning to ${users.length} users`);
    res.json({ ok: true, usersNotified: users.length });
  } catch (err) {
    console.error("[Cron] expiry-emails error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/cron/post-reminders", cronAuth, async (req, res) => {
  try {
    const { Post } = require("./models");

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const tomorrowStart = new Date();
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date();
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const todaysPosts = await Post.find({
      status: "scheduled",
      scheduledAt: { $gte: todayStart, $lte: todayEnd },
    }).populate({ path: "calendar", populate: { path: "user", model: "User" } });

    const tomorrowsPosts = await Post.find({
      status: "scheduled",
      scheduledAt: { $gte: tomorrowStart, $lte: tomorrowEnd },
    }).populate({ path: "calendar", populate: { path: "user", model: "User" } });

    function groupByUser(posts) {
      const byUser = {};
      for (const post of posts) {
        const user = post.calendar?.user;
        if (!user) continue;
        const uid = user._id.toString();
        if (!byUser[uid]) byUser[uid] = { user, posts: [] };
        byUser[uid].posts.push(post);
      }
      return byUser;
    }

    for (const { user, posts } of Object.values(groupByUser(todaysPosts))) {
      sendScheduledPostReminderEmail(user.email, user.name, posts).catch((err) =>
        console.error(`[Cron] Today email failed for ${user.email}:`, err.message),
      );
      await Notification.create({
        recipient: user._id,
        recipientRole: "user",
        title: "📅 منشورات مجدولة اليوم",
        message: `لديك ${posts.length} منشور مجدول اليوم. لا تنسَ نشرها!`,
        type: "scheduled_today",
        read: false,
        postId: posts[0]._id,
      });
    }

    for (const { user, posts } of Object.values(groupByUser(tomorrowsPosts))) {
      sendScheduledPostTomorrowEmail(user.email, user.name, posts).catch((err) =>
        console.error(`[Cron] Tomorrow email failed for ${user.email}:`, err.message),
      );
      await Notification.create({
        recipient: user._id,
        recipientRole: "user",
        title: "⏰ منشورات مجدولة غداً",
        message: `لديك ${posts.length} منشور مجدول غداً. استعد لنشرها!`,
        type: "scheduled_tomorrow",
        read: false,
      });
    }

    res.json({ ok: true, today: todaysPosts.length, tomorrow: tomorrowsPosts.length });
  } catch (err) {
    console.error("[Cron] post-reminders error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/cron/auto-block", cronAuth, async (req, res) => {
  try {
    const now = new Date();
    const usersToBlock = await User.find({
      "moderation.blockStatus": "warning",
      "moderation.gracePeriodExpiresAt": { $lte: now },
      isBlocked: { $ne: true },
    });

    if (usersToBlock.length > 0) {
      const userIds = usersToBlock.map((user) => user._id);
      await User.updateMany(
        { _id: { $in: userIds } },
        {
          $set: {
            "moderation.blockStatus": "blocked",
            isBlocked: true,
            "moderation.gracePeriodExpiresAt": null,
          },
        },
      );

      for (const user of usersToBlock) {
        try {
          await createNotification({
            recipientId: user._id,
            recipientRole: "user",
            type: "account_blocked",
            title: "Account Blocked",
            message: "Your account has been automatically blocked due to policy violation. Please contact support.",
            meta: { blockedAt: new Date(), reason: user.moderation.restrictionReason },
          });
        } catch (err) {
          console.error("[Notify] Auto-block notification failed:", err.message);
        }
      }
    }

    res.json({ ok: true, blocked: usersToBlock.length });
  } catch (err) {
    console.error("[Cron] auto-block error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/cron/clean-unverified", cronAuth, async (req, res) => {
  try {
    const result = await User.deleteMany({
      isVerified: false,
      verificationCodeExpires: { $lt: new Date() },
    });
    console.log("[Cron] Cleaned unverified expired users");
    res.json({ ok: true, deleted: result.deletedCount });
  } catch (err) {
    console.error("[Cron] clean-unverified error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/cron/reset-monthly-usage", cronAuth, async (req, res) => {
  try {
    console.log("🔄 جاري تصفير عدادات الاستخدام الشهرية...");
    await resetMonthlyUsage();
    res.json({ ok: true, job: "reset-monthly-usage" });
  } catch (err) {
    console.error("[Cron] reset-monthly-usage error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/api/cron/check-subscriptions", cronAuth, async (req, res) => {
  try {
    const now = new Date();
    const expiredUsers = await User.find({
      plan: { $in: ["pro", "enterprise"] },
      planEndsAt: { $lt: now, $ne: null },
      isTrial: false,
    });

    if (expiredUsers.length > 0) {
      await User.updateMany(
        { _id: { $in: expiredUsers.map((u) => u._id) } },
        {
          $set: {
            plan: "free",
            subscriptionType: "none",
            planLimits: {
              maxAiImagesPerMonth: 3,
              maxPostsPerCalendar: 5,
              maxCalendarsPerMonth: 1,
              maxBrands: 1,
              advancedAnalytics: false,
              multiDialectSupport: false,
              automatedReels: false,
              prioritySupport: false,
            },
          },
        },
      );
      console.log(`🔴 تم إعادة ${expiredUsers.length} مستخدم للخطة المجانية`);
    }

    res.json({ ok: true, downgraded: expiredUsers.length });
  } catch (err) {
    console.error("[Cron] check-subscriptions error:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

module.exports = app;
