// routes/payment.js
const express = require("express");
const router = express.Router();
const Stripe = require("stripe");
const protect = require("../middleware/auth");
const { User } = require("../models");
const { createNotification } = require("../services/notificationHelper");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// ── Plan config (priceId من Stripe Dashboard) ─────────────────────────────────
const PLANS = {
  pro_monthly: { priceId: process.env.STRIPE_Pro_MONTHLY, plan: "pro" },
  pro_annual: { priceId: process.env.STRIPE_Pro_ANNUAL, plan: "pro" },
  enterprise_monthly: {
    priceId: process.env.STRIPE_Enterprise_MONTHLY,
    plan: "enterprise",
  },
  enterprise_annual: {
    priceId: process.env.STRIPE_Enterprise_ANNUAL,
    plan: "enterprise",
  },
};

// ── POST /api/payment/checkout — create Stripe Checkout session ───────────────
router.post("/checkout", protect, async (req, res) => {
  const { planKey } = req.body;
  const plan = PLANS[planKey];
  if (!plan) return res.status(400).json({ message: "Invalid plan" });

  const user = await User.findById(req.user._id);

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: String(user._id) },
    });
    customerId = customer.id;
    user.stripeCustomerId = customerId;
    await user.save();
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    metadata: { userId: String(user._id), planKey },
    subscription_data: {
      metadata: { userId: String(user._id), planKey },
    },
  });

  res.json({ url: session.url });
});

// ── POST /api/payment/portal ─────────────────────────────────────────────────
router.post("/portal", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user.stripeCustomerId)
    return res.status(400).json({ message: "No active subscription found" });

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${process.env.CLIENT_URL}/dashboard`,
  });
  res.json({ url: session.url });
});

// ── GET /api/payment/status — current subscription info ──────────────────────
router.get("/status", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // لو مفيش Stripe Customer ID، رجع free plan
    if (!user.stripeCustomerId) {
      return res.json({ 
        plan: user.plan || "free", 
        status: "free", 
        subscription: null 
      });
    }

    // ✅ استخدام Stripe API مع try-catch
    let subscriptions;
    try {
      subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        status: "all",
        limit: 1,
        expand: ["data.default_payment_method"],
      });
    } catch (stripeErr) {
      console.error("[Stripe] Error fetching subscriptions:", stripeErr.message);
      // لو الـ Customer ID مش صالح في Stripe، رجع free
      return res.json({ 
        plan: user.plan || "free", 
        status: "free", 
        subscription: null 
      });
    }

    const sub = subscriptions?.data?.[0];
    
    if (!sub) {
      return res.json({ 
        plan: user.plan || "free", 
        status: "free", 
        subscription: null 
      });
    }

    // ✅ استخراج بيانات الكارت بأمان
    const pm = sub.default_payment_method;
    const cardInfo = pm?.card ? {
      brand: pm.card.brand || "unknown",
      last4: pm.card.last4 || "0000",
      expMonth: pm.card.exp_month || 0,
      expYear: pm.card.exp_year || 0,
    } : null;

    // ✅ استخراج الـ interval بأمان (متوافق مع Stripe SDK الجديد)
    const interval = sub.items?.data?.[0]?.price?.recurring?.interval 
                  || sub.items?.data?.[0]?.plan?.interval 
                  || "month";

    // ✅ التحقق من current_period_end قبل إنشاء Date
    let currentPeriodEnd = null;
    if (sub.current_period_end && typeof sub.current_period_end === 'number') {
      try {
        currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
      } catch (dateErr) {
        console.error("[Date] Invalid current_period_end:", sub.current_period_end);
        currentPeriodEnd = null;
      }
    }

    res.json({
      plan: user.plan || "free",
      status: sub.status || "active",
      subscription: {
        id: sub.id || null,
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: sub.cancel_at_period_end || false,
        interval: interval,
        card: cardInfo,
      },
    });
  } catch (err) {
    console.error("[Payment Status Error]:", err.message);
    console.error("[Stack]:", err.stack);
    
    // ✅ إرجاع free plan بدلاً من 500 error
    res.json({ 
      plan: "free", 
      status: "free", 
      subscription: null,
      error: "Failed to fetch subscription status"
    });
  }
});

// ── POST /api/payment/webhook ─────────────────────────────────────────────────
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("Webhook signature failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const data = event.data.object;

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const userId = data.metadata?.userId;
  const currentPriceId = data.items?.data?.[0]?.price?.id;
  const planEntry = Object.entries(PLANS).find(([key, val]) => val.priceId === currentPriceId);
  const planKey = planEntry ? planEntry[0] : data.metadata?.planKey;
  const planName = PLANS[planKey]?.plan;

  if (!userId || !planName) break;

  if (data.status === "active" || data.status === "trialing") {
    // ✅ تحديد نوع الاشتراك
    const subscriptionType = planKey.includes("annual") || planKey.includes("yearly") ? "yearly" : "monthly";
    const isYearly = subscriptionType === "yearly";

    let planLimits = {};
    
    if (planName === "pro") {
      planLimits = {
        maxAiImagesPerMonth: isYearly ? 10 * 12 : 10,
        maxPostsPerCalendar: isYearly ? 20 * 12 : 20,
        maxCalendarsPerMonth: isYearly ? 5 * 12 : 5,
        maxBrands: 3,
        advancedAnalytics: true,
        multiDialectSupport: true,
        automatedReels: false,
        prioritySupport: false,
      };
    } else if (planName === "enterprise") {
      planLimits = {
        maxAiImagesPerMonth: isYearly ? 20 * 12 : 20,
        maxPostsPerCalendar: isYearly ? 35 * 12 : 35,
        maxCalendarsPerMonth: isYearly ? 15 * 12 : 15,
        maxBrands: 10,
        advancedAnalytics: true,
        multiDialectSupport: true,
        automatedReels: true,
        prioritySupport: true,
      };
    }

    await User.findByIdAndUpdate(userId, {
      plan: planName,
      subscriptionType: subscriptionType,
      planLimits: planLimits,
      planEndsAt: new Date(data.current_period_end * 1000),
      isTrial: data.status === "trialing",
      "usage.aiImagesGenerated": 0,
    });

    console.log(`✅ User ${userId} set to ${planName} (${subscriptionType})`);
  }
        // ✅ حالة 2: الإلغاء المجدول (cancel_at_period_end = true)
        // ⚠️ مهم: لا نحول للـ free هنا! المستخدم يبقى على الخطة حتى نهاية الفترة
        else if (data.status === "active" && data.cancel_at_period_end) {
          console.log(
            `⚠️ User ${userId} scheduled cancellation at period end (${new Date(data.current_period_end * 1000).toISOString()})`,
          );
          // لا نفعل شيء - المستخدم يبقى على الخطة حتى current_period_end
        }
        // ✅ حالة 3: انتهاء الصلاحية أو فشل الدفع
        else if (
          ["past_due", "unpaid", "incomplete_expired"].includes(data.status)
        ) {
          await User.findByIdAndUpdate(userId, {
            plan: "free",
            subscriptionType: null,
            planEndsAt: null,
            isTrial: false,
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
          });
          console.log(
            `⚠️ User ${userId} subscription ${data.status}, downgraded to free`,
          );
        }
        break;
      }

      // ✅ حالة 4: الحذف الفعلي للاشتراك (بعد نهاية الفترة)
      case "customer.subscription.deleted": {
        const userId = data.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            plan: "free",
            subscriptionType: null,
            planEndsAt: null,
            isTrial: false,
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
          });
          console.log(
            `🗑️ User ${userId} subscription deleted, downgraded to free`,
          );
        }
        break;
      }

      // 4. حالة الحذف النهائي للاشتراك (يحدث أحياناً بدلاً من canceled)
      case "customer.subscription.deleted": {
        const userId = data.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            plan: "free",
            subscriptionType: null,
            planEndsAt: null,
            isTrial: false,
          });
          console.log(
            `🗑️ User ${userId} subscription deleted, downgraded to free`,
          );
        }
        break;
      }

      case "invoice.paid": {
        const userId =
          data.metadata?.userId || data.subscription_details?.metadata?.userId;
        if (userId) {
          await User.findByIdAndUpdate(userId, {
            $set: {
              "usage.aiImagesGenerated": 0,
              "usage.postsGenerated": 0,
              "usage.calendarsCreated": 0,
            },
          });
          console.log(
            `♻️ Usage reset for user ${userId} after successful payment`,
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        console.warn(`⚠️ Payment failed for customer: ${data.customer}`);
        break;
      }
    }

    res.json({ received: true });
  },
);

// ── GET /api/payment/confirm ─────────────────────────────────────────────────
router.get("/confirm", protect, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ message: "Session ID is required" });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription'],
    });

    if (session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    const userId = session.metadata?.userId || req.user._id;
    const planKey = session.metadata?.planKey;
    const planName = PLANS[planKey]?.plan;

    if (!planName) return res.status(400).json({ message: "Invalid plan" });

    // ✅ تحديد نوع الاشتراك
    const subscriptionType = planKey.includes("annual") || planKey.includes("yearly") ? "yearly" : "monthly";
    const isYearly = subscriptionType === "yearly";

    // ✅ تحديد الـ limits حسب الخطة ونوع الاشتراك
    let planLimits = {};
    
    if (planName === "pro") {
      planLimits = {
        maxAiImagesPerMonth: isYearly ? 10 * 12 : 10, // ✅ 120 للسنوي
        maxPostsPerCalendar: isYearly ? 20 * 12 : 20, // ❌ لا يتغير
        maxCalendarsPerMonth: isYearly ? 5 * 12 : 5, // ✅ 60 للسنوي
        maxBrands: 3, // ❌ لا يتغير
        advancedAnalytics: true, // ❌ ثابت
        multiDialectSupport: true, // ❌ ثابت
        automatedReels: false, // ❌ ثابت
        prioritySupport: false, // ❌ ثابت
      };
    } else if (planName === "enterprise") {
      planLimits = {
        maxAiImagesPerMonth: isYearly ? 20 * 12 : 20,        // ✅ 240 للسنوي
        maxPostsPerCalendar: isYearly ? 35 * 12 : 35,                              // ❌ لا يتغير
        maxCalendarsPerMonth: isYearly ? 15 * 12 : 15,       // ✅ 180 للسنوي
        maxBrands: 10,                                        // ❌ لا يتغير
        advancedAnalytics: true,                              // ❌ ثابت
        multiDialectSupport: true,                            // ❌ ثابت
        automatedReels: true,                                 // ❌ ثابت
        prioritySupport: true,                                // ❌ ثابت
      };
    } else {
      // Free plan
      planLimits = {
        maxAiImagesPerMonth: 3,
        maxPostsPerCalendar: 5,
        maxCalendarsPerMonth: 1,
        maxBrands: 1,
        advancedAnalytics: false,
        multiDialectSupport: false,
        automatedReels: false,
        prioritySupport: false,
      };
    }

    // حساب تاريخ الانتهاء
    let planEndsAt = new Date();
    if (session.subscription && session.subscription.current_period_end) {
      planEndsAt = new Date(session.subscription.current_period_end * 1000);
    } else {
      if (isYearly) planEndsAt.setFullYear(planEndsAt.getFullYear() + 1);
      else planEndsAt.setMonth(planEndsAt.getMonth() + 1);
    }

    // تحديث المستخدم
    await User.findByIdAndUpdate(userId, {
      plan: planName,
      subscriptionType: subscriptionType,
      planLimits: planLimits,
      planEndsAt: planEndsAt,
      isTrial: false,
      $set: { "usage.aiImagesGenerated": 0 },
    });

    res.json({ 
      success: true, 
      plan: planName,
      subscriptionType: subscriptionType,
      limits: planLimits,
      message: "Plan updated successfully" 
    });
  } catch (err) {
    console.error("Payment confirm error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
