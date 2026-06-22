// routes/topPosts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
const protect = require("../middleware/auth");
const { TopPost, Brand } = require("../models");
const { embedBrandVault } = require("../services/embeddingService");
const he = require("he");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

router.get("/:brandId", protect, async (req, res) => {
  const posts = await TopPost.find({ brand: req.params.brandId }).sort(
    "-createdAt",
  );
  res.json(posts);
});

router.post("/:brandId/manual", protect, async (req, res) => {
  const post = await TopPost.create({
    brand: req.params.brandId,
    platform: req.body.platform,
    content: req.body.content,
    imageUrl: req.body.imageUrl || "",
    postUrl: req.body.postUrl || "",
    date: req.body.date || "",
    stats: req.body.stats || {},
    source: "manual",
  });
  res.json(post);
});


router.post("/:brandId/from-link", protect, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "URL required" });

  try {
    const html = await fetchHtml(url);
    const meta = extractOgMeta(html);

    const platform = detectPlatform(url);

    const rawContent = meta.description || meta.title || "";
    const cleanContent = he.decode(rawContent);

    res.json({
      platform,
      content: cleanContent, 
      imageUrl: meta.image || "",
      postUrl: url,
      stats: {
        likes: 0,
        comments: 0,
        shares: 0,
        reach: 0,
        saves: 0,
        engagementRate: 0,
      },
      source: "link",
    });
  } catch (err) {
    res.status(422).json({
      message: "Could not fetch URL. Try manual entry.",
      error: err.message,
    });
  }
});


router.post(
  "/:brandId/from-doc",
  protect,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded. Check FormData key name." });
    }

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();

      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        const imageData = fs.readFileSync(req.file.path).toString("base64");

        console.log(
          "[AI] Analyzing screenshot with Gemini 2.5 Flash Vision...",
        );
        const extractedData = await extractPostDataFromImageWithAI(
          imageData,
          ext,
        );

        return res.json({ ...extractedData, source: "doc" });
      }

      let text = "";

      if (ext === ".pdf") {
        const pdfParse = require("pdf-parse");
        const buffer = fs.readFileSync(req.file.path);
        const parsed = await pdfParse(buffer);
        text = parsed.text;
      } else if (ext === ".docx") {
        const mammoth = require("mammoth");
        const result = await mammoth.extractRawText({ path: req.file.path });
        text = result.value;
      }

      if (!text.trim()) {
        return res
          .status(422)
          .json({ message: "Could not extract text from document" });
      }

      const extracted = await extractPostDataFromImageWithAI(text);
      res.json({ ...extracted, source: "doc" });
    } catch (err) {
      console.error("from-doc error:", err);
      res
        .status(500)
        .json({ message: "AI Extraction failed", error: err.message });
    } finally {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, () => {});
      }
    }
  },
);


router.post("/:brandId/save-extracted", protect, async (req, res) => {
  const post = await TopPost.create({
    brand: req.params.brandId,
    platform: req.body.platform,
    content: req.body.content,
    imageUrl: req.body.imageUrl || "",
    postUrl: req.body.postUrl || "",
    date: req.body.date || "",
    stats: req.body.stats || {},
    source: req.body.source || "manual",
  });
  res.json(post);
});


router.post("/:brandId/embed", protect, async (req, res) => {
  const [brand, posts] = await Promise.all([
    Brand.findById(req.params.brandId),
    TopPost.find({ brand: req.params.brandId }),
  ]);
  if (!brand) return res.status(404).json({ message: "Brand not found" });

  const guidelinesText = `
    Brand: ${brand.name}. Industry: ${brand.industry}.
    Target audience: ${brand.targetAudience}.
    Tone: ${brand.tones?.join(", ")}.
    Avoid: ${brand.avoidTopics || "nothing"}.
    Platforms: ${brand.platforms?.join(", ")}.
  `;

  const postsText = posts.length
    ? posts
        .map(
          (p, i) => `
Top Post #${i + 1} [${p.platform}] — ${p.date || "Unknown date"}
Content: ${p.content || "—"}
Stats: Likes=${p.stats.likes}, Comments=${p.stats.comments}, Shares=${p.stats.shares}, Reach=${p.stats.reach}, Saves=${p.stats.saves}, Engagement=${p.stats.engagementRate}%
Why it worked: High engagement post — use similar tone and structure.
    `,
        )
        .join("\n---\n")
    : `No top posts yet for ${brand.name}.`;

  const count = await embedBrandVault(brand._id, guidelinesText, postsText);

  await TopPost.updateMany({ brand: req.params.brandId }, { embedded: true });

  res.json({ message: `Embedded ${count} chunks`, postsCount: posts.length });
});

router.delete("/:id", protect, async (req, res) => {
  await TopPost.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

router.put("/:id", protect, async (req, res) => {
  const post = await TopPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(post);
});

async function fetchHtml(url) {
  const { data } = await axios.get(url, {
    timeout: 8000,
    headers: { "User-Agent": "Mozilla/5.0 (compatible; ContentForgeBot/1.0)" },
    maxRedirects: 5,
  });
  return data;
}

function extractOgMeta(html) {
  const get = (prop) => {
    const m =
      html.match(
        new RegExp(
          `<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`,
          "i",
        ),
      ) ||
      html.match(
        new RegExp(
          `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`,
          "i",
        ),
      );
    return m?.[1] || "";
  };
  return {
    title: get("og:title") || get("title"),
    description: get("og:description") || get("description"),
    image: get("og:image"),
  };
}

function detectPlatform(url) {
  if (url.includes("instagram.com")) return "Instagram";
  if (url.includes("facebook.com") || url.includes("fb.com")) return "Facebook";
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("twitter.com") || url.includes("x.com")) return "Twitter/X";
  if (url.includes("tiktok.com")) return "TikTok";
  return "Instagram";
}

async function extractTextFromImage(base64Data, ext) {
  const mimeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent([
    {
      inlineData: { data: base64Data, mimeType: mimeMap[ext] || "image/jpeg" },
    },
    "Extract all text visible in this social media post screenshot. Return only the raw text.",
  ]);
  return result.response.text();
}

async function extractPostDataFromImageWithAI(base64Data, ext) {
  const mimeMap = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genai.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
  Analyze this social media post screenshot. Extract the text content and any visible engagement stats (likes, comments, shares).
  Return ONLY a valid JSON object matching this schema (no markdown, no backticks):
  {
    "platform": "Facebook",
    "content": "the actual text content of the post in Arabic/English",
    "date": "2026-06",
    "stats": {
      "likes": 120,
      "comments": 45,
      "shares": 12,
      "reach": 0,
      "saves": 0,
      "engagementRate": 5.4
    }
  }
  If stats are not visible, set them to 0.
  `;

  const result = await model.generateContent([
    {
      inlineData: { data: base64Data, mimeType: mimeMap[ext] || "image/jpeg" },
    },
    prompt,
  ]);

  const text = result.response
    .text()
    .replace(/```json|```/g, "")
    .trim();
  return JSON.parse(text);
}

module.exports = router;
