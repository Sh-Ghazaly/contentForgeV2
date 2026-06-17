// backend/routes/brand.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const protect = require("../middleware/auth");
const { Brand, User } = require("../models");
const { embedBrandVault } = require("../services/embeddingService");
const { createNotification } = require("../services/notificationHelper");

// Multer config — save uploads to /uploads folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB max

// POST /api/brand — create or update brand profile
router.post("/", protect, async (req, res) => {
  try {
    const existing = await Brand.findOne({ user: req.user._id });

    const brandData = {
      user: req.user._id,
      name: req.body.name,
      industry: req.body.industry,
      website: req.body.website,
      targetAudience: req.body.targetAudience,
      dialects: req.body.dialects || [],
      tones: req.body.tones || [],
      platforms: req.body.platforms || [],
      avoidTopics: req.body.avoidTopics,
    };

    let brand;
    if (existing) {
      brand = await Brand.findByIdAndUpdate(existing._id, brandData, {
        new: true,
      });
    } else {
      brand = await Brand.create(brandData);
    }

    // Notify admins about new/updated brand (BEFORE sending response)
    try {
      const admins = await User.find({ isAdmin: true });
      for (const admin of admins) {
        await createNotification({
          recipientId: admin._id,
          recipientRole: "admin",
          type: "new_brand",
          title: existing ? "Brand Updated" : "New Brand Created",
          message: `${req.user.name} ${existing ? 'updated' : 'created'} a brand: "${brand.name}"`,
          meta: { brandId: brand._id, brandName: brand.name, userId: req.user._id },
        });
      }
    } catch (err) {
      console.error("[Notify] Brand notification failed:", err.message);
    }

    res.json({ brand, message: "Brand saved successfully" });
  } catch (err) {
    console.error("Brand save error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/brand — get all brands for user
router.get("/", protect, async (req, res) => {
  const brands = await Brand.find({ user: req.user._id });
  res.json(brands);
});

// GET /api/brand/:id
router.get("/:id", protect, async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return res.status(404).json({ message: "Brand not found" });
  res.json(brand);
});

// POST /api/brand/:id/upload-guidelines — upload PDF
router.post(
  "/:id/upload-guidelines",
  protect,
  upload.single("guidelines"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    await Brand.findByIdAndUpdate(req.params.id, {
      guidelinesFile: req.file.path,
    });
    res.json({ message: "Guidelines uploaded", file: req.file.path });
  },
);

// POST /api/brand/:id/upload-posts — upload past post images
router.post(
  "/:id/upload-posts",
  protect,
  upload.array("posts", 10),
  async (req, res) => {
    if (!req.files?.length)
      return res.status(400).json({ message: "No files uploaded" });
    const paths = req.files.map((f) => f.path);
    await Brand.findByIdAndUpdate(req.params.id, {
      $push: { pastPostsFiles: { $each: paths } },
    });
    res.json({ message: `${paths.length} files uploaded`, files: paths });
  },
);

// POST /api/brand/:id/embed — trigger RAG embedding
router.post("/:id/embed", protect, async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return res.status(404).json({ message: "Brand not found" });

  const guidelinesText = `
    Brand: ${brand.name}. Industry: ${brand.industry}.
    Target audience: ${brand.targetAudience}.
    Tone: ${brand.tones.join(", ")}.
    Avoid: ${brand.avoidTopics || "nothing"}.
    Platforms: ${brand.platforms.join(", ")}.
  `;
  const pastPostsText = `Top performing posts from ${brand.name} on ${brand.platforms.join(", ")}.`;

  const count = await embedBrandVault(brand._id, guidelinesText, pastPostsText);
  res.json({ message: `Brand embedded — ${count} chunks stored in MongoDB` });
});

// DELETE /api/brand/:id
router.delete("/:id", protect, async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.json({ message: "Brand deleted" });
});

// PUT /api/brand/:id — update brand
router.put("/:id", protect, async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        industry: req.body.industry,
        website: req.body.website,
        targetAudience: req.body.targetAudience,
        dialects: req.body.dialects || [],
        tones: req.body.tones || [],
        platforms: req.body.platforms || [],
        avoidTopics: req.body.avoidTopics,
      },
      { new: true },
    );
    if (!brand) return res.status(404).json({ message: "Brand not found" });
    res.json({ brand, message: "Brand updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
