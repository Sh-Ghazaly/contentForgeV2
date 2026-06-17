// backend/routes/posterRouter.js
const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { upload, handleUploadError } = require("../middleware/upload");
const { checkPosterLimit } = require("../middleware/subscription");
const {
  createPoster,
  getPosterHistory,
} = require("../controllers/posterController");

// POST /api/posters/generate
// ✅ أضفنا checkPosterLimit قبل التوليد و incrementUsage بعده
router.post(
  "/generate",
  protect,
  checkPosterLimit, // 1. تحقق من الحد المسموح
  upload.single("image"), // 2. ارفع الصورة
  handleUploadError, // 3. تعامل مع أخطاء الرفع
  createPoster, // 4. ولّد البوستر
);

// GET /api/posters/history
router.get("/history", protect, getPosterHistory);

module.exports = router;