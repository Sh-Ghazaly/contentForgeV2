const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Trend } = require("../models");
const {
  getRegionForDialect,
  fetchAndSaveTrends,
} = require("../services/trendService");

// ✅ تعديل: يقبل region أو dialect كـ query parameter
router.get("/", protect, async (req, res) => {
  try {
    const region =
      req.query.region || getRegionForDialect(req.query.dialect) || "EG";

    const trends = await Trend.find({ region: region })
      .sort({ velocity: -1 })
      .limit(10);

    if (!trends.length) {
      // لو مفيش ترندات، اجلبها فوراً
      await fetchAndSaveTrends(region);
      const freshTrends = await Trend.find({ region: region })
        .sort({ velocity: -1 })
        .limit(10);

      return res.json({
        trends: freshTrends,
        lastUpdated: freshTrends[0]?.updatedAt || new Date().toISOString(),
        source: "database",
        region: region,
      });
    }

    res.json({
      trends,
      lastUpdated: trends[0]?.updatedAt || new Date().toISOString(),
      source: "database",
      region: region,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/seed", protect, async (req, res) => {
  const { trends, region = "EG" } = req.body;
  await Trend.deleteMany({ region: region });
  const saved = await Trend.insertMany(trends.map((t) => ({ ...t, region })));
  res.json({ inserted: saved.length, region });
});

module.exports = router;