// backend/config/passport.js
require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
const { User, PlatformSettings } = require("../models");

// ── Google Strategy ──────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "https://content-forge-v2.vercel.app/api/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName || "User";

        if (!email) return done(new Error("No email from Google"), null);

        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email }],
        });

        if (user) {
          if (user.isBlocked) {
          // نرسل خطأ إلى Passport بأن المستخدم محظور
          return done(null, false, { message: 'Your account has been blocked. Please contact support.' });
        }
          if (!user.googleId) {
            user.googleId = profile.id;
            user.avatar = avatar || user.avatar;
            await user.save();
          }
          return done(null, user);
        }

        const settings = (await PlatformSettings.findOne()) || {};
        const trialDays = settings.trialDays ?? 14;

        user = await User.create({
          name,
          email,
          googleId: profile.id,
          avatar,
          isVerified: true,
          plan: "free",
          subscriptionType: "none",
          planEndsAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
          isTrial: true,
          hasUsedTrial: true,
          password: Math.random().toString(36).slice(-16),
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);



module.exports = passport;
