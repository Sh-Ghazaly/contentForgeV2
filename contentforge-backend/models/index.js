// backend/models/index.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ── contact message ──────────────────────────────────────────────────────────────────────
const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    company: { type: String, default: "" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["new", "read", "replied"], default: "new" },
    replies: [
      {
        text: String,
        repliedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// ── User ──────────────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    // 1. البيانات الأساسية للمستخدم
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    // phone: {
    //   type: String,
    //   required: [true, "Phone number is required"],
    //   unique: true,
    // },
    phone: {
      type: String,
      required: function () {
        // Only require phone for manual registration (not OAuth)
        return !this.googleId && !this.facebookId;
      },
      unique: true,
      sparse: true, // Allows null/undefined values without unique conflict
    },

    // 2. صلاحيات الحساب وحالته العامة
    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    // 3. نظام التحقق وتفعيل الإيميل (OTP)
    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,

    // 4. نظام الاشتراكات والباقات الموحد
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise", ""],
      default: "free",
    },
      // warningSentAt: { type: Date, default: null },
    subscriptionType: {
      type: String,
      enum: ["monthly", "yearly", "none"],
      default: "none",
    },
    planEndsAt: { type: Date, default: null }, // التاريخ الموحد لانتهاء الصلاحية (Trial أو اشتراك مدفوع)//trialEndsAt
    stripeCustomerId: { type: String },

    // 5. نظام تتبع الاستخدام (Usage Tracking)
    usage: {
      aiImagesGenerated: { type: Number, default: 0 },
      postsGenerated: { type: Number, default: 0 },
      calendarsCreated: { type: Number, default: 0 },
      lastUsageReset: { type: Date, default: Date.now },
    },

    // 6. حدود الخطة الحالية (Plan Limits)
    planLimits: {
      maxAiImagesPerMonth: { type: Number, default: 3 }, // Free: 3, Pro: 30, Enterprise: Unlimited
      maxPostsPerCalendar: { type: Number, default: 5 }, // Free: 5, Pro: 15, Enterprise: 30
      maxCalendarsPerMonth: { type: Number, default: 1 }, // Free: 1, Pro: 5, Enterprise: Unlimited
      maxBrands: { type: Number, default: 1 }, // Free: 1, Pro: 3, Enterprise: 10
      advancedAnalytics: { type: Boolean, default: false },
      multiDialectSupport: { type: Boolean, default: false },
      automatedReels: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    // Add inside userSchema, alongside existing fields:
    googleId: { type: String, sparse: true, unique: true },
    facebookId: { type: String, sparse: true, unique: true },
    avatar: { type: String, default: null },

    // حقول تتبع الـ Trial لمنع تكرار الاستخدام المجاني
    isTrial: { type: Boolean, default: true },
    hasUsedTrial: { type: Boolean, default: false },

    // 7. نظام الرقابة وفترة السماح (Moderation & Grace Period)
    moderation: {
      blockStatus: {
        type: String,
        enum: ["none", "warning", "blocked"],
        default: "none",
      },
      restrictionReason: { type: String, default: null },
      gracePeriodExpiresAt: { type: Date, default: null },
      actionTriggeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      }, // الآدمن المسؤول
    },

    // 8. طلبات حذف الحساب
    deletionRequest: {
      isAsked: { type: Boolean, default: false },
      reason: { type: String, default: null },
      isDeleted: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
); // لإنشاء createdAt و updatedAt تلقائياً

// ==========================================
// 🛠️ الـ Indexes وقوانين الـ Database
// ==========================================

// حذف الحسابات غير المفعلة تلقائياً بعد 10 دقائق (600 ثانية) من وقت إنشائها
userSchema.index(
  { createdAt: 1 }, //trialStartDate
  {
    expireAfterSeconds: 600,
    partialFilterExpression: { isVerified: false },
  },
);

// ==========================================
//  تشفير وحماية الباسورد (Security Middleware)
// ==========================================

// 1. تشفير الباسورد تلقائياً قبل الحفظ في الـ DB (في حالة التسجيل أو التغيير فقط)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 2. دالة مخصصة للمقارنة والتحقق من صحة الباسورد عند تسجيل الدخول (Login)
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// ==========================================
// تصدير الموديل (Export)
// ==========================================
const User = mongoose.model("User", userSchema);
module.exports = User;

// models/Settings.js─────────────────────────────────────────────────────────────────────
const platformSettingsSchema = new mongoose.Schema(
  {
    trialDays: { type: Number, default: 14 },
    blockByPhone: { type: Boolean, default: true },
    otpExpiryMinutes: { type: Number, default: 10 },
    sendExpiryWarning: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const PlatformSettings = mongoose.model(
  "PlatformSettings",
  platformSettingsSchema,
);
// ── Brand ─────────────────────────────────────────────────────────────────────
const brandSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    industry: String,
    website: String,
    targetAudience: String,
    marketSize: String,
    dialects: [String],
    tones: [String],
    avoidTopics: String,
    platforms: [String],
    guidelinesFile: String,
    pastPostsFiles: [String],
    ragChunks: [
      {
        content: String,
        embedding: [Number],
        source: { type: String, enum: ["guidelines", "past_posts"] },
        isAdmin: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true },
);
const Brand = mongoose.model("Brand", brandSchema);

// ── Post ──────────────────────────────────────────────────────────────────────
const postSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    calendar: { type: mongoose.Schema.Types.ObjectId, ref: "Calendar" },
    platform: {
      type: String,
      enum: ["Instagram", "Facebook", "LinkedIn", "Twitter/X", "TikTok"],
    },
    dialect: String,
    date: String,
    copyAR: String,
    copyEN: String,
    hashtags: [String],
    imagePrompt: String,
    imageUrl: String,
    goal: String,
    variantB: {
      copyAR: String,
      copyEN: String,
      hashtags: [String],
    },
    status: {
      type: String,
      enum: ["draft", "approved", "scheduled", "published"],
      default: "draft",
    },
    metaPostId: { type: String }, // ← Meta's post ID after publishing
    scheduledAt: Date,
    publishedAt: Date,
  },
  { timestamps: true },
);
const Post = mongoose.model("Post", postSchema);

// ── Calendar ──────────────────────────────────────────────────────────────────
const calendarSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    brief: String,
    dialect: String,
    platforms: [String],
    startDate: Date,
    endDate: Date,
    trendsUsed: [String],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    status: {
      type: String,
      enum: ["generating", "ready", "approved"],
      default: "generating",
    },
  },
  { timestamps: true },
);
const Calendar = mongoose.model("Calendar", calendarSchema);

// ── Original Calendar (snapshot for reset) ────────────────────────────────────
const originalCalendarSchema = new mongoose.Schema(
  {
    calendarId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Calendar",
      required: true,
      unique: true,
    },
    originalCalendarData: { type: Object, required: true },
    originalPostsData: [{ type: Object, required: true }],
  },
  { timestamps: true },
);

const OriginalCalendar = mongoose.model(
  "OriginalCalendar",
  originalCalendarSchema,
);

// ── Trend Model ───────────────────────────────────────────────────────────────
const trendSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true },
    change: { type: String }, // e.g. "+340%"
    velocity: { type: Number, default: 0 },
    region: { type: String, default: "EG" },
    source: {
      type: String,
      enum: ["google", "twitter", "manual"],
      default: "google",
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Trend = mongoose.model("Trend", trendSchema);

// ── Chat Message Model ────────────────────────────────────────────────────────
const chatMessageSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    sender: { type: String, enum: ["user", "ai"], required: true },
    content: { type: String, required: true },
    conversationId: { type: String, required: true },
  },
  { timestamps: true },
);

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

// ── TopPost ───────────────────────────────────────────────────────────────────
const TopPostSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    platform: {
      type: String,
      enum: ["Instagram", "Facebook", "LinkedIn", "Twitter/X", "TikTok"],
    },
    content: { type: String },
    imageUrl: { type: String },
    postUrl: { type: String },
    date: { type: String },
    stats: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
    },
    source: {
      type: String,
      enum: ["manual", "link", "doc"],
      default: "manual",
    },
    embedded: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const TopPost = mongoose.model("TopPost", TopPostSchema);
const ContactMessage = mongoose.model("ContactMessage", contactMessageSchema);

// module.exports = { User, Brand, Post, Calendar, Trend, ChatMessage, OriginalCalendar, TopPost, PlatformSettings, ContactMessage }

// // وأضيفيها في الـ exports
// module.exports = { User, Brand, Post, Calendar, Trend, ChatMessage, OriginalCalendar}
// ── Connection ────────────────────────────────────────────────────────────────
const connectionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    platform: { type: String, required: true },
    handle: String,
    pageId: String,
    igId: String,
    accessToken: String,
    tokenType: String,
    connected: { type: Boolean, default: false },
    stats: [{ label: String, value: String }],
    rawData: { type: Object },
  },
  { timestamps: true },
);

const Connection = mongoose.model("Connection", connectionSchema);

// ── Notification ──────────────────────────────────────────────────────────────
// const notificationSchema = new mongoose.Schema({
//   user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   title:   { type: String, required: true },
//   message: { type: String, required: true },
//   type:    { type: String, enum: ['scheduled_today', 'scheduled_tomorrow', 'info'], default: 'info' },
//   read:    { type: Boolean, default: false },
//   postId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
// }, { timestamps: true })

// const Notification = mongoose.model('Notification', notificationSchema)
const notificationSchema = new mongoose.Schema(
  {
    // who receives this notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientRole: { type: String, enum: ["user", "admin"], default: "user" },

    title: { type: String, required: true },
    message: { type: String, required: true },

    type: {
      type: String,
      enum: [
        // → admin receives these (user did something)
        "new_login",
        "new_brand",
        "subscription_changed",
        "contact_message",
        "deletion_request",
        "illegal_action",
        // → user receives these (admin did something)
        "plan_updated",
        "trial_extended",
        "account_blocked",
        "account_unblocked",
        "admin_settings_changed",
        "policy_warning",
        "admin_promotion",
        // → cron/system
        "scheduled_today",
        "scheduled_tomorrow",
        "info",
      ],
      default: "info",
    },

    read: { type: Boolean, default: false },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    meta: { type: Object, default: {} }, // any extra data (brandName, planName, etc.)
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = {
  User,
  Brand,
  Post,
  Calendar,
  Trend,
  ChatMessage,
  OriginalCalendar,
  TopPost,
  PlatformSettings,
  ContactMessage,
  Connection,
  Notification,
};
