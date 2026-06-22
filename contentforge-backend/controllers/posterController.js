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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image uploaded. Please provide a product image.",
      });
    }

    const { prompt } = req.body;
    if (!prompt || prompt.trim().length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Prompt is required. Please describe your desired poster.",
      });
    }

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

    const result = await generatePoster(req.file.path, prompt.trim());


    await User.findByIdAndUpdate(req.user._id, {
      $inc: { "usage.aiImagesGenerated": 1 },
    });

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

async function getPosterHistory(req, res) {

  res.json({
    success: true,
    message: "History feature — implement with DB storage",
    data: [],
  });
}

module.exports = { createPoster, getPosterHistory };