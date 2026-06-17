const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Trend } = require("../models");

// GET /api/trends — return latest trends from DB
router.get("/", protect, async (req, res) => {
  try {
    const trends = await Trend.find({ region: "EG" })
      .sort({ velocity: -1 })
      .limit(10);

    // لو الـ DB فاضي، رجع fallback
    // if (!trends.length) {
    //   return res.json({
    //     trends: [
    //       { tag: "#رمضان_كريم", change: "+340%", velocity: 340, region: "EG" },
    //       { tag: "#قهوة_الصباح", change: "+89%", velocity: 89, region: "EG" },
    //       {
    //         tag: "Cold brew Egypt",
    //         change: "+210%",
    //         velocity: 210,
    //         region: "EG",
    //       },
    //       { tag: "#سحور", change: "+167%", velocity: 167, region: "EG" },
    //       { tag: "#إفطار", change: "+290%", velocity: 290, region: "EG" },
    //     ],
    //     lastUpdated: new Date().toISOString(),
    //     source: "fallback",
    //   });
    // }
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

// POST /api/trends/seed — يدوياً تضيف trends (للتجربة)
router.post("/seed", protect, async (req, res) => {
  const { trends } = req.body; // [{ tag, change, velocity, region }]
  await Trend.deleteMany({ region: "EG" });
  const saved = await Trend.insertMany(trends);
  res.json({ inserted: saved.length });
});

module.exports = router;