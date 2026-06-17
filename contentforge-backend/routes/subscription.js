// backend/routes/subscription.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { User } = require("../models");
const {
  checkPlan,
  checkPosterLimit,
  incrementUsage,
} = require("../middleware/subscription");

// ── GET /api/subscription/usage — عرض الاستخدام الحالي ──────────────────────
router.get("/usage", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

     // ✅ التحقق من انتهاء الاشتراك المدفوع
    if (user.plan !== "free" && user.planEndsAt && new Date(user.planEndsAt) < new Date()) {
      user.plan = "free";
      user.planLimits = {
        maxAiImagesPerMonth: 3, maxPostsPerCalendar: 5, maxCalendarsPerMonth: 1, maxBrands: 1,
        advancedAnalytics: false, multiDialectSupport: false, automatedReels: false, prioritySupport: false
      };
      user.planEndsAt = null;
      await user.save(); // حفظ التغييرات في قاعدة البيانات
    }
    
    res.json({
      success: true,
      usage: {
        aiImagesGenerated: user.usage?.aiImagesGenerated || 0,
        postsGenerated: user.usage?.postsGenerated || 0,
        calendarsCreated: user.usage?.calendarsCreated || 0,
      },
      limits: {
        maxAiImagesPerMonth: user.planLimits?.maxAiImagesPerMonth || 3,
        maxPostsPerCalendar: user.planLimits?.maxPostsPerCalendar || 5,
        maxCalendarsPerMonth: user.planLimits?.maxCalendarsPerMonth || 1,
        maxBrands: user.planLimits?.maxBrands || 1,
      },
      plan: user.plan,
      subscriptionType: user.subscriptionType,
      planEndsAt: user.planEndsAt,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── GET /api/subscription/plans — عرض الخطط المتاحة ─────────────────────────
router.get("/plans", async (req, res) => {
  try {
    const plans = [
      {
        id: "free",
        name: "Free",
        price: 0,
        interval: "month",
        description: "Explore the essential capabilities of our platform",
        features: [
          "AI image generation for up to 3 posts",
          "Standard feature set (Top Posts excluded)",
          "Core Arabic dialects support",
          "Instagram & Facebook publishing only",
        ],
        limits: {
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
      {
        id: "pro",
        name: "Pro",
        price: 19,
        interval: "month",
        description: "Perfect for growing creators and marketing teams",
        features: [
          "Generate 1 tailored image per post (up to 10/month)",
          "Advanced Top Posts performance analytics",
          "Expanded multi-dialect Arabic support",
          "Additional publishing platforms coming soon",
        ],
        limits: {
          maxAiImagesPerMonth: 10,
          maxPostsPerCalendar: 20,
          maxCalendarsPerMonth: 5,
          maxBrands: 3,
          advancedAnalytics: true,
          multiDialectSupport: true,
          automatedReels: false,
          prioritySupport: false,
        },
        popular: true,
      },
      {
        id: "enterprise",
        name: "Enterprise",
        price: 49,
        interval: "month",
        description: "Maximum production value and custom toolsets for scale",
        features: [
          "Generate multiple AI images per post (up to 20/month)",
          "Advanced Top Posts performance analytics",
          "Comprehensive Arabic dialect coverage",
          "Additional publishing platforms coming soon",
          "Automated AI Reels generation per post",
        ],
        limits: {
          maxAiImagesPerMonth: 20,
          maxPostsPerCalendar: 35,
          maxCalendarsPerMonth: 15,
          maxBrands: 10,
          advancedAnalytics: true,
          multiDialectSupport: true,
          automatedReels: true,
          prioritySupport: true,
        },
      },
    ];

    res.json({ success: true, plans });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/subscription/cancel — إلغاء الاشتراك ──────────────────────────
router.post("/cancel", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        message: "No active subscription found",
      });
    }

    // هنا ممكن نضيف logic لإلغاء الاشتراك من Stripe
    // لكن الأفضل استخدام الـ Customer Portal (موجود في payment.js)

    res.json({
      success: true,
      message: "Please use the customer portal to manage your subscription",
      portalUrl: `${process.env.CLIENT_URL}/billing`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── POST /api/subscription/upgrade — ترقية الخطة ────────────────────────────
router.post(
  "/upgrade",
  protect,
  checkPlan(["free", "pro"]),
  async (req, res) => {
    try {
      const { planKey } = req.body; // e.g., 'pro_monthly', 'enterprise_annual'

      // هنا بنحول المستخدم لصفحة الـ Checkout
      // الـ actual upgrade هيحصل في الـ webhook
      res.json({
        success: true,
        message: "Redirecting to checkout...",
        checkoutUrl: `${process.env.CLIENT_URL}/billing?plan=${planKey}`,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  },
);

module.exports = router;