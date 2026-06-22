// backend/config/passport.js
require("dotenv").config();

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User, PlatformSettings } = require("../models");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "https://content-forge-v2.vercel.app/api/auth/google/callback",
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
          usage: {
            aiImagesGenerated: 0,
            postsGenerated: 0,
            calendarsCreated: 0,
            lastUsageReset: new Date(),
          },
        });

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    },
  ),
);

module.exports = passport;
