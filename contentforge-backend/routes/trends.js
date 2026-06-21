const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Trend } = require("../models");

router.get("/", protect, async (req, res) => {
  try {
    const trends = await Trend.find({ region: "EG" })
      .sort({ velocity: -1 })
      .limit(10);

    if (!trends.length) {
      return res.json({
        trends: [],
        lastUpdated: null,
        source: "database",
      });
    }
    res.json({
      trends,
      lastUpdated: trends[0]?.updatedAt || new Date().toISOString(),
      source: "database",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/seed", protect, async (req, res) => {
  const { trends } = req.body; 
  await Trend.deleteMany({ region: "EG" });
  const saved = await Trend.insertMany(trends);
  res.json({ inserted: saved.length });
});

module.exports = router;