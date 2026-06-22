// backend/middleware/subscription.js
const { User } = require("../models");

const DEFAULT_LIMITS = {
  maxAiImagesPerMonth: 3,
  maxPostsPerCalendar: 5,
  maxCalendarsPerMonth: 1,
  maxBrands: 1,
};

function getEffectiveLimits(user) {
  const limits = user.planLimits || DEFAULT_LIMITS;
  const isYearly = user.subscriptionType === "yearly";

  return {
    maxAiImagesPerMonth: isYearly
      ? (limits.maxAiImagesPerMonth || DEFAULT_LIMITS.maxAiImagesPerMonth) * 12
      : limits.maxAiImagesPerMonth || DEFAULT_LIMITS.maxAiImagesPerMonth,
    maxPostsPerCalendar:
      limits.maxPostsPerCalendar || DEFAULT_LIMITS.maxPostsPerCalendar,
    maxCalendarsPerMonth: isYearly
      ? (limits.maxCalendarsPerMonth || DEFAULT_LIMITS.maxCalendarsPerMonth) *
        12
      : limits.maxCalendarsPerMonth || DEFAULT_LIMITS.maxCalendarsPerMonth,
    maxBrands: limits.maxBrands || DEFAULT_LIMITS.maxBrands,
  };
}

const checkPlan = (requiredPlans) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!requiredPlans.includes(user.plan)) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${requiredPlans.join(" or ")} plan.`,
          reason: "feature_locked",
          currentPlan: user.plan,
          upgradeRequired: true,
          upgradeUrl: "/payment",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hasFeature = user.planLimits?.[featureName] === true;

      if (!hasFeature) {
        return res.status(403).json({
          success: false,
          message: `This feature requires a plan with ${featureName} enabled.`,
          reason: "feature_locked",
          currentPlan: user.plan,
          upgradeRequired: true,
          upgradeUrl: "/payment",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

const checkPosterLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const effectiveLimits = getEffectiveLimits(user);
    const limit = effectiveLimits.maxAiImagesPerMonth;
    const usage = user.usage?.aiImagesGenerated || 0;

    if (usage >= limit) {
      return res.status(403).json({
        success: false,
        message: `You have reached your poster generation limit (${usage}/${limit}). Please upgrade your plan.`,
        reason: "posts_limit_exceeded",
        currentUsage: usage,
        limit: limit,
        currentPlan: user.plan,
        upgradeRequired: true,
        upgradeUrl: "/payment",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkCalendarLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const effectiveLimits = getEffectiveLimits(user);
    const maxCalendarsPerMonth = effectiveLimits.maxCalendarsPerMonth;
    const calendarsCreated = user.usage?.calendarsCreated || 0;
    const remainingCalendars = maxCalendarsPerMonth - calendarsCreated;

    if (remainingCalendars <= 0) {
      return res.status(403).json({
        success: false,
        message: `You have reached your calendar limit (${calendarsCreated}/${maxCalendarsPerMonth}). Please upgrade your plan.`,
        reason: "calendar_limit_exceeded",
        currentUsage: calendarsCreated,
        limit: maxCalendarsPerMonth,
        remaining: 0,
        currentPlan: user.plan,
        upgradeRequired: true,
        upgradeUrl: "/payment",
      });
    }

    req.remainingCalendars = remainingCalendars;
    next();
  } catch (err) {
    console.error("[checkCalendarLimit] Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const checkPostsLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const effectiveLimits = getEffectiveLimits(user);
    const limit = effectiveLimits.maxPostsPerCalendar;
    const usage = user.usage?.postsGenerated || 0;
    const remainingPosts = limit - usage;

    if (remainingPosts <= 0) {
      return res.status(403).json({
        success: false,
        message: `You have reached your posts generation limit (${usage}/${limit}). Please upgrade your plan.`,
        reason: "posts_limit_exceeded",
        currentUsage: usage,
        limit: limit,
        remaining: 0,
        currentPlan: user.plan,
        upgradeRequired: true,
        upgradeUrl: "/payment",
      });
    }

    req.remainingPosts = remainingPosts;
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkCalendarPostsLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const maxPostsPerCalendar = user.planLimits?.maxPostsPerCalendar || 5;
    const postsGenerated = user.usage?.postsGenerated || 0;
    const remainingPosts = maxPostsPerCalendar - postsGenerated;

    const { duration } = req.body;


    const estimatedPosts = duration ? Math.ceil(duration * 0.75) : 10;

    if (remainingPosts <= 0) {
      return res.status(403).json({
        success: false,
        message:
          "You have reached your posts limit for this month. Please upgrade your plan.",
        reason: "posts_limit_exceeded",
        currentUsage: postsGenerated,
        limit: maxPostsPerCalendar,
        remaining: 0,
        required: estimatedPosts,
        currentPlan: user.plan,
        upgradeRequired: true,
        upgradeUrl: "/payment",
      });
    }

    if (estimatedPosts >= remainingPosts) {
      return res.status(403).json({
        success: false,
        message: `This calendar requires approximately ${estimatedPosts} posts, but you only have ${remainingPosts} remaining. Please choose a shorter duration or upgrade your plan.`,
        reason: "posts_limit_exceeded",
        currentUsage: postsGenerated,
        limit: maxPostsPerCalendar,
        remaining: remainingPosts,
        required: estimatedPosts,
        currentPlan: user.plan,
        upgradeRequired: true,
        upgradeUrl: "/payment",
      });
    }

    req.remainingPosts = remainingPosts;
    req.estimatedPosts = estimatedPosts;
    next();
  } catch (err) {
    console.error("[checkCalendarPostsLimit] Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const checkBrandsLimit = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const effectiveLimits = getEffectiveLimits(user);
    const maxBrands = effectiveLimits.maxBrands;

    const { Brand } = require("../models");
    const brandsCount = await Brand.countDocuments({ user: user._id });
    const remainingBrands = maxBrands - brandsCount;

    if (remainingBrands <= 0) {
      return res.status(403).json({
        success: false,
        message: `You have reached your brands limit (${brandsCount}/${maxBrands}). Please upgrade your plan.`,
        reason: "brands_limit_exceeded",
        currentUsage: brandsCount,
        limit: maxBrands,
        remaining: 0,
        currentPlan: user.plan,
        upgradeRequired: true,
        upgradeUrl: "/payment",
      });
    }

    req.remainingBrands = remainingBrands;
    next();
  } catch (err) {
    console.error("[checkBrandsLimit] Error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const incrementUsage = (field = "aiImagesGenerated", amount = 1) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.usage[field] = (user.usage[field] || 0) + amount;
      await user.save();

      console.log(
        `✅ Incremented ${field} by ${amount} for user ${user.email}. New value: ${user.usage[field]}`,
      );
      next();
    } catch (error) {
      console.error(`[incrementUsage] Error:`, error.message);
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

const resetMonthlyUsage = async () => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const users = await User.find({});

    for (const user of users) {
      const lastReset = user.usage.lastUsageReset || new Date(0);
      const lastResetMonth = lastReset.getMonth();
      const lastResetYear = lastReset.getFullYear();

      const shouldReset =
        currentMonth !== lastResetMonth || currentYear !== lastResetYear;

      if (shouldReset) {
        user.usage.aiImagesGenerated = 0;
        user.usage.postsGenerated = 0;
        user.usage.calendarsCreated = 0;
        user.usage.lastUsageReset = now;
        await user.save();
        console.log(`🔄 Reset usage for user: ${user.email}`);
      }
    }
  } catch (error) {
    console.error("Error resetting monthly usage:", error);
  }
};

module.exports = {
  checkPlan,
  checkFeature,
  checkPosterLimit,
  checkCalendarLimit,
  checkPostsLimit,
  checkCalendarPostsLimit,
  checkBrandsLimit,
  incrementUsage,
  resetMonthlyUsage,
  getEffectiveLimits,
};
