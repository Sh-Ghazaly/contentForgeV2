const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { Brand, Calendar, Post } = require("../models");

// GET /api/stats — sidebar quick stats for the logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // كل البراندز بتاعت اليوزر
    const brands = await Brand.find({ user: userId }).select("_id");
    const brandIds = brands.map((b) => b._id);

    // عدد الكالندرز
    const calendars = await Calendar.countDocuments({ user: userId });

    // إحصائيات البوستات حسب الستاتس
    const [generated, approved, scheduled, published, drafts] =
      await Promise.all([
        Post.countDocuments({ brand: { $in: brandIds } }),
        Post.countDocuments({ brand: { $in: brandIds }, status: "approved" }),
        Post.countDocuments({ brand: { $in: brandIds }, status: "scheduled" }),
        Post.countDocuments({ brand: { $in: brandIds }, status: "published" }),
        Post.countDocuments({
          brand: { $in: brandIds },
          status: { $in: ["draft", "pending_review"] },
        }),
      ]);

    res.json({ calendars, generated, approved, scheduled, published, drafts });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;