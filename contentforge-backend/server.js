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
const cron = require("node-cron");
const { User, PlatformSettings, Notification } = require("./models");
const posterRoutes = require("./routes/posterRouter");
const { checkAndSendExpiryWarnings } = require("./services/cronJobs");
const { createNotification } = require("./services/notificationHelper");
const passport = require("passport");

const app = express();

const {
  sendTrialExpiryWarningEmail,
  sendScheduledPostReminderEmail,
  sendScheduledPostTomorrowEmail,
} = require("./services/emailService");

// ── Passport setup ────────────────────────────────────────────────────────────
require("./config/passport");
app.use(passport.initialize());

// ── Connect to MongoDB Atlas ────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then((conn) => {
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    startTrendScheduler();
  })
  .catch((error) => {
    console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error("👉 Check your MONGO_URI in the .env file");
    process.exit(1);
  });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Stripe webhook needs raw body — MUST be before express.json
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files publicly
app.use("/uploads", express.static("uploads"));

// ── API Routes ────────────────────────────────────────────────────────────────
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
// ✅ Route الجديد للـ Subscription
app.use("/api/subscription", require("./routes/subscription"));

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    service: "ContentForge API",
    timestamp: new Date().toISOString(),
    mongo: "connected",
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});

// ── Cron: Check trial expiry warnings at midnight ────────────────────────────
cron.schedule("0 0 * * *", () => {
  console.log("⏰ جاري تشغيل فحص انتهاء فترات التجربة للمستخدمين...");
  checkAndSendExpiryWarnings();
});

// ── Cron: Send expiry warning emails at 9 AM ─────────────────────────────────
cron.schedule("0 9 * * *", async () => {
  try {
    const settings = await PlatformSettings.findOne();
    if (!settings?.sendExpiryWarning) return;

    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const startOfDay = new Date(threeDaysFromNow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(threeDaysFromNow.setHours(23, 59, 59, 999));

    const users = await User.find({
      isTrial: true,
      trialEndsAt: { $gte: startOfDay, $lte: endOfDay },
    });

    users.forEach((user) => {
      sendTrialExpiryWarningEmail(
        user.email,
        user.name,
        user.trialEndsAt,
      ).catch((err) =>
        console.error(`Expiry email error for ${user.email}:`, err.message),
      );
    });

    console.log(`[Cron] Sent expiry warning to ${users.length} users`);
  } catch (err) {
    console.error("[Cron] Error:", err.message);
  }
});

// ── Cron: Scheduled Post Reminders at 8:00 AM ────────────────────────────────
cron.schedule("0 8 * * *", async () => {
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
    }).populate({
      path: "calendar",
      populate: { path: "user", model: "User" },
    });

    const tomorrowsPosts = await Post.find({
      status: "scheduled",
      scheduledAt: { $gte: tomorrowStart, $lte: tomorrowEnd },
    }).populate({
      path: "calendar",
      populate: { path: "user", model: "User" },
    });

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
      sendScheduledPostReminderEmail(user.email, user.name, posts).catch(
        (err) =>
          console.error(
            `[Cron] Today email failed for ${user.email}:`,
            err.message,
          ),
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

      console.log(
        `[Cron] Today reminder → ${user.email} (${posts.length} posts)`,
      );
    }

    for (const { user, posts } of Object.values(groupByUser(tomorrowsPosts))) {
      sendScheduledPostTomorrowEmail(user.email, user.name, posts).catch(
        (err) =>
          console.error(
            `[Cron] Tomorrow email failed for ${user.email}:`,
            err.message,
          ),
      );

      await Notification.create({
        recipient: user._id,
        recipientRole: "user",
        title: "⏰ منشورات مجدولة غداً",
        message: `لديك ${posts.length} منشور مجدول غداً. استعد لنشرها!`,
        type: "scheduled_tomorrow",
        read: false,
      });

      console.log(
        `[Cron] Tomorrow reminder → ${user.email} (${posts.length} posts)`,
      );
    }
  } catch (err) {
    console.error("[Cron] Scheduled post reminder error:", err.message);
  }
});

// ── Auto-block cron job (every 5 minutes) ─────────────────────────────────
cron.schedule("*/5 * * * *", async () => {
  try {
    console.log(
      "=== [Cron Job] جاري فحص الحسابات المستحقة للحظر التلقائي... ===",
    );
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

      // Notify blocked users
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

      console.log(
        `[Cron Job] تم حظر ${usersToBlock.length} مستخدمين تلقائياً.`,
      );
    }
  } catch (error) {
    console.error("خطأ في الـ Cron Job:", error.message);
  }
});

// ── Clean unverified expired users (hourly) ───────────────────────────────
cron.schedule("0 * * * *", async () => {
  await User.deleteMany({
    isVerified: false,
    verificationCodeExpires: { $lt: new Date() },
  });
  console.log("[Cron] Cleaned unverified expired users");
});


// Cron Job لتصفير الـ Usage شهرياً - أول يوم في كل شهر الساعة 12 بالليل
cron.schedule("0 0 1 * *", async () => {
  console.log("🔄 جاري تصفير عدادات الاستخدام الشهرية...");
  await resetMonthlyUsage();
});

// Cron Job لإعادة المستخدمين للخطة المجانية عند انتهاء الاشتراك
cron.schedule("0 * * * *", async () => {
  // كل ساعة
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
      console.log(
        `🔴 تم إعادة ${expiredUsers.length} مستخدم للخطة المجانية (انتهى اشتراكهم)`,
      );
    }
  } catch (error) {
    console.error("❌ خطأ في فحص الاشتراكات المنتهية:", error.message);
  }
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 ContentForge API running on http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});