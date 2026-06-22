// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const adminOnly = require("../middleware/adminAuth");
const { User, Post, Brand, Trend, PlatformSettings } = require("../models");
const { createNotification } = require("../services/notificationHelper");
const {
  sendPolicyWarningEmail,
  sendAdminPromotionEmail,
  sendPlanUpdateByAdminEmail,
  sendTrialUpdateEmail,
  emailServices
} = require("../services/emailService");

router.get("/stats", adminOnly, async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now - 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const prevWeek = new Date(now - 14 * 24 * 60 * 60 * 1000);

    const realUsers = {
      isAdmin: { $ne: true },
      "deletionRequest.isDeleted": { $ne: true },
    };

    const totalUsers = await User.countDocuments({
      "deletionRequest.isDeleted": { $ne: true },
    });
    const blockedCount = await User.countDocuments({
      ...realUsers,
      isBlocked: true,
    });
    const warnedCount = await User.countDocuments({
      ...realUsers,
      isBlocked: { $ne: true },
      "moderation.blockStatus": "warning",
    });
    const isAskToDeleteCount = await User.countDocuments({
      ...realUsers,
      "deletionRequest.isAsked": true,
    });
    const deletedCount = await User.countDocuments({
      isAdmin: { $ne: true },
      "deletionRequest.isDeleted": true,
    });
    const adminCount = await User.countDocuments({ isAdmin: true });

    const activeCount = await User.countDocuments({
      ...realUsers,
      isVerified: true,
      isBlocked: false,
      planEndsAt: { $gt: now },
      "deletionRequest.isAsked": { $ne: true },
      "moderation.blockStatus": { $ne: "warning" },
    });

    const expiredCount = await User.countDocuments({
      ...realUsers,
      planEndsAt: { $lte: now },
    });

    const activeTrialUsers = await User.countDocuments({
      ...realUsers,
      plan: "free",
      planEndsAt: { $gt: now },
    });
    const pendingVerifications = await User.countDocuments({
      ...realUsers,
      isVerified: false,
    });
    const newUsersThisWeek = await User.countDocuments({
      ...realUsers,
      createdAt: { $gte: lastWeek },
    });
    const newUsersPrevWeek = await User.countDocuments({
      ...realUsers,
      createdAt: { $gte: prevWeek, $lt: lastWeek },
    });

    const registrationGrowth =
      newUsersPrevWeek > 0
        ? Math.round(
            ((newUsersThisWeek - newUsersPrevWeek) / newUsersPrevWeek) * 100,
          )
        : newUsersThisWeek > 0
          ? 100
          : 0;

    res.json({
      totalUsers,
      newUsers24h: await User.countDocuments({
        ...realUsers,
        createdAt: { $gte: last24h },
      }),
      pendingVerifications,
      activeTrialUsers,
      newPostsLast24h: await Post?.countDocuments({
        createdAt: { $gte: last24h },
      }).catch(() => 0),
      newUsersThisWeek,
      registrationGrowth,
      warnedCount,
      isAskToDeleteCount,
      activeCount,
      blockedCount,
      deletedCount,
      adminCount,
      expiredCount,
      serverUptime: Math.floor(process.uptime()),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/settings", adminOnly, async (req, res) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) settings = await PlatformSettings.create({});
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/settings", adminOnly, async (req, res) => {
  try {
    const { trialDays, otpExpiryMinutes, sendExpiryWarning } = req.body;

    let settings = await PlatformSettings.findOne();
    if (!settings) settings = await PlatformSettings.create({});

    const trialDaysChanged = Number(settings.trialDays) !== Number(trialDays);

    settings.trialDays = trialDays;
    settings.otpExpiryMinutes = otpExpiryMinutes;
    settings.sendExpiryWarning = sendExpiryWarning;
    await settings.save();


    let updatedUsers = 0;

    if (trialDaysChanged) {
      const trialUsers = await User.find({ isTrial: true, plan: "free", isAdmin: { $ne: true } });
      await Promise.all(
        trialUsers.map(async (user) => {
          const start = new Date(user.createdAt);
          const newEnd = new Date(start);
          newEnd.setDate(newEnd.getDate() + trialDays);
          user.planEndsAt = newEnd;
          await user.save();

          try {
            await sendTrialUpdateEmail(user.email, user.name, trialDays, newEnd);
          } catch (err) {
            console.error(`Failed to send trial update email to ${user.email}:`, err.message);
          }

          try {
            await createNotification({
              recipientId: user._id,
              recipientRole: "user",
              type: "trial_extended",
              title: "Trial Extended",
              message: `Your free trial has been extended to ${trialDays} days.`,
              meta: { newDays: trialDays, newEndDate: newEnd },
            });
          } catch (err) { console.error(err.message); }
        })
      );
      updatedUsers = trialUsers.length;
    }

    try {
  const allUsers = await User.find({ 
    isAdmin: { $ne: true }, 
    "deletionRequest.isDeleted": { $ne: true } ,
    isTrial: true,
     plan: "free"
  });

  Promise.all(allUsers.map(u => 
    createNotification({
      recipientId: u._id,
      recipientRole: "user",
      type: "admin_settings_changed",
      title: "Platform Settings Updated",
      message: "The platform settings have been updated.",
    }).catch(err => console.error("فشل إشعار مستخدم:", err.message))
  ));

} catch (err) { 
  console.error("خطأ في جلب المستخدمين:", err.message); 
}
    res.json({ message: "Settings saved", updatedUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/users", adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "", plan } = req.query;

    const query = {
      "deletionRequest.isDeleted": { $ne: true },
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (plan) query.plan = plan;

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -verificationCode -verificationCodeExpires")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      User.countDocuments(query),
    ]);

    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.put("/users/:id/block", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin)
      return res.status(403).json({ message: "Cannot block an admin" });

    if (user.isBlocked || user.moderation.blockStatus === "blocked" || user.moderation.blockStatus === "warning") {
      user.isBlocked = false;
      user.moderation.blockStatus = "none";
      user.moderation.restrictionReason = null;
      user.moderation.gracePeriodExpiresAt = null;
      user.moderation.actionTriggeredBy = null;
      await user.save();

      try {
        await createNotification({
          recipientId: user._id,
          recipientRole: "user",
          type: "account_unblocked",
          title: "Account Restored",
          message:
            "Your account has been restored. All restrictions have been removed.",
          meta: { unblockedBy: req.user?._id, unblockedAt: new Date() },
        });
        try {
        await emailServices.sendUnblockEmail(user.email, user.name);
        console.log(`[Email] تم إرسال إيميل رفع الحظر إلى: ${user.email}`);
    } catch (err) {
        console.error("خطأ في إرسال إيميل رفع الحظر:", err.message);
    }
      } catch (err) {
        console.error("[Notify] Unblock notification failed:", err.message);
      }

      return res.json({
        message: "User is now active",
        isBlocked: false,
        blockStatus: "none",
      });
    }

    const { reason } = req.body;
    if (!reason)
      return res.status(400).json({ message: "Please provide a reason" });

    const gracePeriod = new Date();
    gracePeriod.setHours(gracePeriod.getHours() + 24);

    user.moderation.blockStatus = "warning";
    user.moderation.restrictionReason = reason;
    user.moderation.gracePeriodExpiresAt = gracePeriod;
    user.moderation.actionTriggeredBy = req.user?._id || null;
    await user.save();

    try {
      await createNotification({
        recipientId: user._id,
        recipientRole: "user",
        type: "policy_warning",
        title: "Account Warning",
        message: `Your account has received a warning. Reason: ${reason}. You have 24 hours before automatic blocking.`,
        meta: {
          reason,
          gracePeriodExpiresAt: gracePeriod,
          warnedBy: req.user?._id,
        },
      });
    } catch (err) {
      console.error("[Notify] Warning notification failed:", err.message);
    }

    res.json({
      message: "Warning issued.",
      isBlocked: false,
      blockStatus: "warning",
      gracePeriodExpiresAt: gracePeriod,
    });

    sendPolicyWarningEmail(user.email, user.name, reason, gracePeriod)
      .then(() => console.log(`[Email] تم الإرسال إلى: ${user.email}`))
      .catch((err) => console.error("خطأ في الإيميل:", err.message));
  } catch (err) {
    console.error("خطأ في حظر المستخدم:", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.delete("/users/:id", adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isAdmin)
      return res.status(403).json({ message: "Cannot delete an admin" });
    await user.deleteOne();
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/plans", adminOnly, async (req, res) => {
  try {
    const now = new Date();

    const [freeActive, proActive, enterpriseActive, expiredUsers] =
      await Promise.all([
        User.countDocuments({
          isAdmin: { $ne: true },
          plan: "free",
          planEndsAt: { $gt: now },
          "deletionRequest.isDeleted": { $ne: true },
        }),
        User.countDocuments({
          isAdmin: { $ne: true },
          plan: "pro",
          planEndsAt: { $gt: now },
          "deletionRequest.isDeleted": { $ne: true },
        }),
        User.countDocuments({
          isAdmin: { $ne: true },
          plan: "enterprise",
          planEndsAt: { $gt: now },
          "deletionRequest.isDeleted": { $ne: true },
        }),
        User.countDocuments({
          isAdmin: { $ne: true },
          planEndsAt: { $lt: now },
          "deletionRequest.isDeleted": { $ne: true },
        }),
      ]);

    const trialUsersList = await User.find({
      isAdmin: { $ne: true },
      "deletionRequest.isDeleted": { $ne: true },
    })
      .select("name email plan planEndsAt isTrial isBlocked createdAt")
      .sort({ planEndsAt: -1 })
      .limit(100);

    res.json({
      counts: {
        free: freeActive,
        pro: proActive,
        enterprise: enterpriseActive,
        expired: expiredUsers,
      },
      trialUsersList,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.get("/trends", adminOnly, async (req, res) => {
  try {
    const trends = await Trend.find().sort({ velocity: -1 }).limit(20);
    return res.json({ trends });
  } catch (err) {
    return res.json({
      trends: [
        {
          tag: "#رمضان_2026",
          velocity: 95,
          change: "up",
          region: "EG",
          source: "fallback",
        },
        {
          tag: "#التسويق_الإلكتروني",
          velocity: 82,
          change: "up",
          region: "EG",
          source: "fallback",
        },
        {
          tag: "#رياضة",
          velocity: 74,
          change: "same",
          region: "EG",
          source: "fallback",
        },
      ],
      source: "fallback",
    });
  }
});

router.put("/users/:id/approve-deletion", adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        "deletionRequest.isAsked": false,
        "deletionRequest.isDeleted": true,
      },
      { new: true },
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Approved & Soft Deleted Successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/trigger-expiry-warnings', adminOnly, async (req, res) => {
  try {
    const settings = await PlatformSettings.findOne()
    if (!settings?.sendExpiryWarning)
      return res.status(400).json({ message: 'ميزة التحذيرات معطّلة من الإعدادات' })

    const { checkAndSendExpiryWarnings } = require('../services/cronJobs')
    await checkAndSendExpiryWarnings()

    res.json({ message: 'تم فحص المستخدمين وإرسال التحذيرات بنجاح' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.put("/users/:id", adminOnly, async (req, res) => {
  try {
    const {
      plan,
      isVerified,
      isAdmin,
      subscriptionType,
      startDate,
      isTrial,
      planLimits
    } = req.body;

    const settings = await PlatformSettings.findOne();
    const defaultTrialDays = settings?.trialDays || 14;

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: "User not found" });
    if (targetUser.isAdmin && !isAdmin)
      return res.status(403).json({ message: "Cannot demote the only admin via this endpoint" });

    const updateData = { isVerified, isAdmin, subscriptionType };
    const PLANS = {
    free: {
      maxAiImagesPerMonth: 3,
      maxPostsPerCalendar: 5, 
      maxCalendarsPerMonth: 1, 
      maxBrands: 1, 
      advancedAnalytics: false, 
      multiDialectSupport: false, 
      automatedReels: false,
      prioritySupport: false,
    },
    pro: {
      maxAiImagesPerMonth: 10,
      maxPostsPerCalendar: 20,
      maxCalendarsPerMonth: 5,
      maxBrands: 3,
      advancedAnalytics: true, 
      multiDialectSupport: true, 
      automatedReels: false,
      prioritySupport: false,
    },
    enterprise: {
      maxAiImagesPerMonth: 20, 
      maxPostsPerCalendar: 35,
      maxCalendarsPerMonth: 15,
      maxBrands: 10,
      advancedAnalytics: true, 
      multiDialectSupport: true,
      automatedReels: true, 
      prioritySupport: true,
    }
  };
    if (!isAdmin) {
      updateData.plan = plan;
      updateData.isTrial = plan === "free" ? true : (isTrial ?? false);
      updateData.startDate = startDate;
      updateData.planLimits= PLANS[plan]

      if (plan !== "free" && startDate && subscriptionType) {
        const start = new Date(startDate);
        const newEnd = new Date(start);

        if (subscriptionType === "monthly") {
          newEnd.setMonth(newEnd.getMonth() + 1);
        } else if (subscriptionType === "yearly") {
          newEnd.setFullYear(newEnd.getFullYear() + 1);
        }
        updateData.planEndsAt = newEnd;
      } else {
        const start = new Date(startDate || Date.now());
        const newEnd = new Date(start);
        newEnd.setDate(newEnd.getDate() + defaultTrialDays);
        updateData.planEndsAt = newEnd;
      }
    } else {
      updateData.planEndsAt = null;
      updateData.isTrial = false;
      updateData.plan = "enterprise";
      updateData.subscriptionType = "yearly";
      updateData.planLimits = PLANS.enterprise;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      select: "-password",
    });

    res.json({ user });

    if (user) {
      if (user.isAdmin && !targetUser.isAdmin) {
        sendAdminPromotionEmail(user.email, user.name).catch((err) =>
          console.error("[Admin Promotion Email Error]:", err.message),
        );
      } else {
        sendPlanUpdateByAdminEmail(
          user.email,
          user.name,
          user.plan,
          user.isTrial,
          user.planEndsAt,
        ).catch((err) =>
          console.error("[Plan Update Email Error]:", err.message),
        );
      }
    }

    if (!isAdmin && plan) {
      try {
        await createNotification({
          recipientId: user._id,
          recipientRole: "user",
          type: "plan_updated",
          title: "Subscription Updated",
          message: `Your plan has been updated to ${plan}. ${user.isTrial ? "This is a trial period." : ""}`,
          meta: {
            plan,
            isTrial: user.isTrial,
            planEndsAt: user.planEndsAt,
            updatedBy: req.user?._id,
          },
        });
      } catch (err) {
        console.error("[Notify] Plan update notification failed:", err.message);
      }
    }

    try {
      await createNotification({
        recipientId: req.user._id,
        recipientRole: "admin",
        type: "admin_settings_changed",
        title: "User Profile Updated",
        message: `You updated ${user.name}'s (${user.email}) profile.`,
        meta: {
          targetUserId: user._id,
          changes: { plan, isVerified, isAdmin, subscriptionType },
          updatedBy: req.user?._id,
        },
      });
    } catch (err) {
      console.error("[Notify] Admin self-notification failed:", err.message);
    }
  } catch (err) {
    console.error("=== خطأ في تعديل المستخدم ===", err.message);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
