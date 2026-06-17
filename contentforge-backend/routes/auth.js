// backend/routes/auth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User, DeletionRequest } = require("../models");
const protect = require("../middleware/auth");
const { createNotification } = require("../services/notificationHelper");
const { sendVerificationEmail } = require("../services/emailService");
const { sendDeletionRequestEmail } = require("../services/emailService");
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const { PlatformSettings } = require("../models");

///////////////////////////////////////// Google OAuth Routes ───────────────────────────────

const passport = require('passport');
require('../config/passport'); // Initialize strategies

// ── Google OAuth ─────────────────────────────────────────────────────────────
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false 
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
  (req, res) => {
    const token = signToken(req.user._id);
    // Redirect to frontend with token
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login-success?token=${token}&provider=google`;
    res.redirect(redirectUrl);
  }
);

// ── Facebook OAuth ─────────────────────────────────────────────────────────────
// router.get('/facebook', passport.authenticate('facebook', { 
//   scope: ['email', 'public_profile'],
//   session: false 
// }));

// router.get('/facebook/callback',
//   passport.authenticate('facebook', { session: false, failureRedirect: '/login?error=facebook_auth_failed' }),
//   (req, res) => {
//     const token = signToken(req.user._id);
//     const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login-success?token=${token}&provider=facebook`;
//     res.redirect(redirectUrl);
//   }
// );

// ── Social Login Success Handler (optional API endpoint) ──────────────────────
router.post('/social-login', async (req, res) => {
  // Alternative: if you prefer popup flow with token exchange
  const { token } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        isAdmin: user.isAdmin,
        isTrial: user.isTrial,
        planEndsAt: user.planEndsAt,
        trialExpired: user.isTrial && user.planEndsAt && new Date() > new Date(user.planEndsAt),
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone)
      return res.status(400).json({ message: "All fields required" });

    const settings = (await PlatformSettings.findOne()) || {};
    const blockByPhone = settings.blockByPhone ?? true;
    const otpExpiryMinutes = settings.otpExpiryMinutes ?? 10;

    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });

    if (PlatformSettings.blockByPhone && (await User.findOne({ phone })))
      return res
        .status(400)
        .json({ message: "This phone has already been used for a trial." });

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const trialDays = settings.trialDays ?? 14;
    const calculatedExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      phone,
      verificationCode,
      verificationCodeExpires: Date.now() + otpExpiryMinutes * 60 * 1000,
      isVerified: false,
      plan: "free",
      subscriptionType: "none",
      planEndsAt: calculatedExpiry,
      isTrial: true,
      hasUsedTrial: true,
    });

    await sendVerificationEmail(email, verificationCode);
    res
      .status(201)
      .json({ message: "User created. Please verify your email." });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: "User not found" });

  if (
    user.verificationCode !== code ||
    user.verificationCodeExpires < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired code" });
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;

  await user.save();

  res.json({ message: "Email verified successfully" });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: "Invalid email or password" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Please verify your email first" });

  if (user.isBlocked)
    return res.status(403).json({
      message: "Your account has been blocked. Please contact support.",
    });

  user.lastLoginAt = new Date();
  await user.save();

  const token = signToken(user._id);

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      plan: user.plan,
      isAdmin: user.isAdmin,
      isTrial: user.isTrial,
      planEndsAt: user.planEndsAt,
      trialExpired: user.isTrial && user.planEndsAt && new Date() > new Date(user.planEndsAt),
    },
  });
});

// router.get("/me", protect, async (req, res) => {
//   res.json({ recipient: req.user._id, });
// });

router.get("/me", protect, async (req, res) => {
  try {
    // req.user موجود بالفعل من الـ protect middleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      plan: user.plan,
      subscriptionType: user.subscriptionType,
      planEndsAt: user.planEndsAt,
      isTrial: user.isTrial,
      isAdmin: user.isAdmin,
      usage: user.usage,
      planLimits: user.planLimits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/notifications", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "moderation.blockStatus moderation.restrictionReason moderation.gracePeriodExpiresAt",
  );

  const notifs = [];

  if (user.moderation?.blockStatus === "warning") {
    notifs.push({
      id: "warning-1",
      type: "warning",
      icon: "⚠️",
      title: "تحذير: مخالفة سياسة الاستخدام",
      message: `سبب التحذير: ${user.moderation.restrictionReason}. لديك حتى ${new Date(user.moderation.gracePeriodExpiresAt).toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" })} قبل الحظر النهائي.`,
      time: "Just now",
      read: false,
    });
  }

  try {
    const { Notification } = require("../models");
    const dbNotifs = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    dbNotifs.forEach((n) => {
      const localTime = new Date(n.createdAt).toLocaleString("ar-EG", {
        timeZone: "Asia/Dubai",
        dateStyle: "short",
        timeStyle: "short",
      });

      notifs.push({
        id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        time: localTime,
        read: n.read,
      });
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
  }

  res.json({ notifications: notifs });
});

router.patch("/notifications/:id/read", protect, async (req, res) => {
  try {
    const { Notification } = require("../models");

    if (req.params.id.startsWith("warning-")) {
      return res.json({
        success: true,
        message: "Warning marked as read (client-side only)",
      });
    }

    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.patch("/notifications/read-all", protect, async (req, res) => {
  try {
    const { Notification } = require("../models");

    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true },
    );
    res.json({ success: true });
  } catch (err) {
    console.error("MARK ALL READ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/deletion-request", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.isAskToDelete)
      return res.status(400).json({ message: "Request already submitted" });

    user.isAskToDelete = true;
    user.deletionReason = req.body.reason || null;
    await user.save();

    sendDeletionRequestEmail(user.name, user.email, req.body.reason).catch(
      (err) => console.error("Email error:", err.message),
    );

    try {
      const admins = await User.find({ isAdmin: true });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          recipientRole: "admin",
          type: "deletion_request",
          title: "Account Deletion Requested",
          message: `${user.name} (${user.email}) requested account deletion. Reason: ${req.body.reason || "Not provided"}`,
          meta: { userId: user._id },
        });
      }
    } catch (err) {
      console.error("[Notify] Deletion notification failed:", err.message);
    }

    res.json({ message: "Request submitted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Already verified" });

    const settings = await PlatformSettings.findOne();
    const otpExpiryMinutes = settings?.otpExpiryMinutes ?? 10;

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + otpExpiryMinutes * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.json({ message: "New OTP sent successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/verify-reset-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      user.verificationCode !== otp ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("VERIFY RESET OTP ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/send-reset-otp", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ message: "User not found with this email" });

    const settings = await PlatformSettings.findOne();
    const otpExpiryMinutes = settings?.otpExpiryMinutes ?? 10;

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = Date.now() + otpExpiryMinutes * 60 * 1000;
    await user.save();

    await sendVerificationEmail(email, verificationCode);

    res.json({ message: "Reset code sent successfully" });
  } catch (err) {
    console.error("SEND RESET OTP ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      user.verificationCode !== otp ||
      user.verificationCodeExpires < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired code" });
    }

    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.password = newPassword;
    await user.save();

    const token = signToken(user._id);

    res.json({
      message: "Password reset successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        plan: user.plan,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.put("/change-password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("CHANGE PASSWORD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/test-notification", protect, async (req, res) => {
  const { Notification } = require("../models");
  await Notification.create({
    recipient: req.user._id,
    recipientRole: "user",
    title: "📅 منشورات مجدولة اليوم",
    message: "لديك 3 منشورات مجدولة اليوم. لا تنسَ نشرها!",
    type: "scheduled_today",
    read: false,
  });
  await Notification.create({
    recipient: req.user._id,
    recipientRole: "user",
    title: "⏰ منشورات مجدولة غداً",
    message: "لديك 2 منشور مجدول غداً. استعد لنشرها!",
    type: "scheduled_tomorrow",
    read: false,
  });
  res.json({ message: "Test notifications created ✅" });
});

router.post("/test-email-simple", protect, async (req, res) => {
  const { transporter } = require("../services/emailService");

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: req.user.email,
      subject: "Test Email from ContentForge",
      text: "If you see this, email is working!",
    });
    res.json({ message: "Test email sent! Check your inbox." });
  } catch (err) {
    console.error("Test email failed:", err);
    res.status(500).json({ message: err.message, code: err.code });
  }
});

module.exports = router;
