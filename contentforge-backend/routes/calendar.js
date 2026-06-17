// backend/routes/calendar.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Trend } = require("../models");
const { Brand, Calendar, Post, OriginalCalendar } = require("../models");
const {
  incrementUsage,
  checkCalendarLimit,
  checkCalendarPostsLimit,
} = require("../middleware/subscription");
const {
  generateCalendar,
  generateVariantB,
} = require("../services/geminiService");
const { retrieveRelevantChunks } = require("../services/embeddingService");

// POST /api/calendar/generate
router.post(
  "/generate",
  protect,
  checkCalendarLimit,
  checkCalendarPostsLimit,
  async (req, res) => {
    const { brandId, brief, dialect, platforms, startDate, endDate, duration } =
      req.body;

    console.log(req.body);

    if (!brandId || !brief)
      return res
        .status(400)
        .json({ message: "brandId and brief are required" });

    const brand = await Brand.findById(brandId);
    if (!brand) return res.status(404).json({ message: "Brand not found" });

    // 1. Retrieve relevant RAG chunks
    const chunks = await retrieveRelevantChunks(brandId, brief);

    // 1b. Fetch top posts
    const { TopPost } = require("../models");
    const topPosts = await TopPost.find({ brand: brandId })
      .sort("-stats.engagementRate")
      .limit(5);

    // 2. Live trends
    const trendDocs = await Trend.find({
      region: brand.region || "EG",
    })
      .sort({ velocity: -1 })
      .limit(10);

    const trends = trendDocs.map((t) => t.tag);

    if (!trends.length) {
      return res.status(400).json({
        message: "No trends available. Seed trends first.",
      });
    }

    // 3. Call Gemini to generate posts JSON
    let postsData;
    try {
      postsData = await generateCalendar({
        brief,
        brand,
        trends,
        dialect: dialect || brand.dialects[0] || "Egyptian Arabic",
        platforms: platforms || brand.platforms,
        brandContext: chunks.join("\n\n"),
        topPosts,
        startDate,
        endDate,
        duration,
      });
    } catch (err) {
      return res.status(503).json({
        message:
          "AI service is temporarily busy. Please try again in a few moments.",
      });
    }

    // ✅ التحقق الثاني: بعد AI generation، نتأكد إن العدد الفعلي مش أكبر من المتبقي
    const actualPostsCount = postsData.length;
    if (actualPostsCount > req.remainingPosts) {
      return res.status(403).json({
        message: `AI generated ${actualPostsCount} posts, but you only have ${req.remainingPosts} remaining. Please try a shorter duration.`,
        required: actualPostsCount,
        remaining: req.remainingPosts,
        reason: "posts_limit_exceeded",
      });
    }

    // 4. Create calendar document
    const calendar = await Calendar.create({
      brand: brandId,
      user: req.user._id,
      title: brief.slice(0, 60),
      brief,
      dialect,
      platforms: platforms || brand.platforms,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate
        ? new Date(endDate)
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      trendsUsed: trends,
      status: "ready",
    });

    // 5. Save each post
    const posts = await Post.insertMany(
      postsData.map((p) => ({ ...p, brand: brandId, calendar: calendar._id })),
    );

    // 6. Link posts to calendar
    calendar.posts = posts.map((p) => p._id);
    await calendar.save();

    // 7. ✅ تحديث الـ usage دفعة واحدة (بدلاً من loop)
    try {
      await OriginalCalendar.create({
        calendarId: calendar._id,
        originalCalendarData: calendar.toObject(),
        originalPostsData: posts.map((p) => p.toObject()),
      });

      // ✅ تحديث الـ usage دفعة واحدة
      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          "usage.postsGenerated": actualPostsCount,
          "usage.calendarsCreated": 1,
        },
      });

      console.log(`✅ Updated usage: +${actualPostsCount} posts, +1 calendar`);
    } catch (err) {
      console.error("Failed to snapshot/update usage:", err);
    }

    res.json({ calendar, posts });
  },
);

// GET /api/calendar/brand/:brandId — all calendars for a brand
router.get("/brand/:brandId", protect, async (req, res) => {
  const calendars = await Calendar.find({ brand: req.params.brandId }).sort(
    "-createdAt",
  );
  res.json(calendars);
});

// GET /api/calendar/:id — single calendar with posts
router.get("/:id", protect, async (req, res) => {
  const calendar = await Calendar.findById(req.params.id).populate("posts");
  if (!calendar) return res.status(404).json({ message: "Calendar not found" });
  res.json(calendar);
});

// POST /api/calendar/:id/approve — approve all posts
router.post("/:id/approve", protect, async (req, res) => {
  const calendar = await Calendar.findById(req.params.id);
  if (!calendar) return res.status(404).json({ message: "Calendar not found" });

  await Post.updateMany(
    { calendar: calendar._id, status: { $in: ["draft", "pending_review"] } },
    { status: "approved" },
  );
  calendar.status = "approved";
  await calendar.save();
  res.json({ message: "All posts approved" });
});

// POST /api/calendar/:id/reset
router.post("/:id/reset", protect, async (req, res) => {
  try {
    const calendarId = req.params.id;

    // Find the saved untouched snapshot
    const snapshot = await OriginalCalendar.findOne({ calendarId });
    if (!snapshot) {
      return res
        .status(404)
        .json({ message: "Original snapshot not found for this calendar" });
    }

    // 1. Revert and rewrite all actual posts using snapshot info
    for (const originalPost of snapshot.originalPostsData) {
      await Post.findByIdAndUpdate(
        originalPost._id,
        {
          copyAR: originalPost.copyAR,
          copyEN: originalPost.copyEN,
          hashtags: originalPost.hashtags,
          status: originalPost.status || "draft",
          scheduledAt: originalPost.scheduledAt,
          date: originalPost.date,
          platform: originalPost.platform,
          imagePrompt: originalPost.imagePrompt,
          goal: originalPost.goal,
        },
        { new: true },
      );
    }

    // 2. Restore array positioning or any core metadata traits in the real Calendar document
    const updatedCalendar = await Calendar.findByIdAndUpdate(
      calendarId,
      {
        posts: snapshot.originalCalendarData.posts,
        status: snapshot.originalCalendarData.status || "draft",
      },
      { new: true },
    ).populate("posts");

    res.json(updatedCalendar);
  } catch (error) {
    console.error("Error resetting calendar:", error);
    res
      .status(500)
      .json({ message: "Server error while resetting calendar structure" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const calendarId = req.params.id;

    const calendar = await Calendar.findById(calendarId);
    if (!calendar) {
      return res.status(404).json({ message: "Calendar not found" });
    }

    await Post.deleteMany({ calendar: calendarId });
    await OriginalCalendar.deleteOne({ calendarId });
    await Calendar.findByIdAndDelete(calendarId);

    res.json({
      message: "Calendar, posts, and snapshots deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting calendar assets:", error);
    res
      .status(500)
      .json({ message: "Server error while deleting calendar assets" });
  }
});

module.exports = router;
