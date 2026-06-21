// backend/models/index.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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


const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },

    phone: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },

    isAdmin: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    isVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpires: Date,

    plan: {
      type: String,
      enum: ["free", "pro", "enterprise", ""],
      default: "free",
    },
    subscriptionType: {
      type: String,
      enum: ["monthly", "yearly", "none"],
      default: "none",
    },
    planEndsAt: { type: Date, default: null }, 
    stripeCustomerId: { type: String },

    usage: {
      aiImagesGenerated: { type: Number, default: 0 },
      postsGenerated: { type: Number, default: 0 },
      calendarsCreated: { type: Number, default: 0 },
      lastUsageReset: { type: Date, default: Date.now },
    },

    planLimits: {
      maxAiImagesPerMonth: { type: Number, default: 3 }, 
      maxPostsPerCalendar: { type: Number, default: 5 }, 
      maxCalendarsPerMonth: { type: Number, default: 1 },
      maxBrands: { type: Number, default: 1 },
      advancedAnalytics: { type: Boolean, default: false },
      multiDialectSupport: { type: Boolean, default: false },
      automatedReels: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
    },
    googleId: { type: String, sparse: true, unique: true },
    facebookId: { type: String, sparse: true, unique: true },
    avatar: { type: String, default: null },

    isTrial: { type: Boolean, default: true },
    hasUsedTrial: { type: Boolean, default: false },

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
      }, 
    },

    deletionRequest: {
      isAsked: { type: Boolean, default: false },
      reason: { type: String, default: null },
      isDeleted: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

userSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 600,
    partialFilterExpression: { isVerified: false },
  },
);


userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


const User = mongoose.model("User", userSchema);
module.exports = User;

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
    metaPostId: { type: String },
    scheduledAt: Date,
    publishedAt: Date,
  },
  { timestamps: true },
);
const Post = mongoose.model("Post", postSchema);

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

const trendSchema = new mongoose.Schema(
  {
    tag: { type: String, required: true },
    change: { type: String }, 
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

const notificationSchema = new mongoose.Schema(
  {
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
        "new_login",
        "new_brand",
        "subscription_changed",
        "contact_message",
        "deletion_request",
        "illegal_action",
        "plan_updated",
        "trial_extended",
        "account_blocked",
        "account_unblocked",
        "admin_settings_changed",
        "policy_warning",
        "admin_promotion",
        "scheduled_today",
        "scheduled_tomorrow",
        "info",
      ],
      default: "info",
    },

    read: { type: Boolean, default: false },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    meta: { type: Object, default: {} }, 
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
