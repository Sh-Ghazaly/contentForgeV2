// Validates requests, calls service layer, returns JSON responses
// backend/controllers/posterController.js
// ─────────────────────────────────────────────────────────────────────────────
// Poster Generator Controller
// Handles HTTP requests for AI poster generation
// Follows MVC pattern: Controller → Service → External API
// ─────────────────────────────────────────────────────────────────────────────

const { generatePoster } = require("../services/posterService");
const { User } = require("../models");
const fs = require("fs");

/**
 * POST /api/posters/generate
 * Generates an AI marketing poster from uploaded product image + prompt
 * @param {Express.Request} req — req.file (image), req.body.prompt
 * @param {Express.Response} res — JSON response with generated poster URL
 */
async function createPoster(req, res) {
  try {
    // ── Validation: Check if image was uploaded ─────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded. Please provide a product image.",
      });
    }

    // ── Validation: Check if prompt exists ────────────────────────────────
    const { prompt } = req.body;
    if (!prompt || prompt.trim().length === 0) {
      // Clean up uploaded file since validation failed
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Prompt is required. Please describe your desired poster.",
      });
    }

    // ── Validation: Prompt length check ───────────────────────────────────
    if (prompt.trim().length > 1000) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Prompt too long. Maximum 1000 characters allowed.",
      });
    }

    console.log(
      `[PosterController] Generating poster for: ${req.file.originalname}`,
    );
    console.log(`[PosterController] Prompt: ${prompt.substring(0, 100)}...`);

    // ── Call service layer ──────────────────────────────────────────────────
    const result = await generatePoster(req.file.path, prompt.trim());

    // ── Increment usage count for subscription limits ───────────────────
    // ── ✅ Increment usage count directly (بدون middleware) ─────────────────
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "usage.aiImagesGenerated": 1 },
    });

    // ── Success response ──────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: "Poster generated successfully",
      data: {
        imageUrl: result.imageUrl,
        prompt: result.prompt,
        originalImage: result.originalImage,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("[PosterController] Error:", error.message);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to generate poster. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

/**
 * GET /api/posters/history
 * Returns previously generated posters for the logged-in user
 * (Optional — implement if you want history tracking)
 */
async function getPosterHistory(req, res) {
  // Implementation depends on your DB schema
  // You could store generated poster metadata in MongoDB
  res.json({
    success: true,
    message: "History feature — implement with DB storage",
    data: [],
  });
}

module.exports = { createPoster, getPosterHistory };