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


router.post(
  "/generate",
  protect,
  checkPosterLimit, 
  upload.single("image"), 
  handleUploadError,
  createPoster,
);

router.get("/history", protect, getPosterHistory);

module.exports = router;