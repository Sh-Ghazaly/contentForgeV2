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

// ── Multer for doc/image uploads ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// ── GET /api/top-posts/:brandId ───────────────────────────────────────────────
router.get("/:brandId", protect, async (req, res) => {
  const posts = await TopPost.find({ brand: req.params.brandId }).sort(
    "-createdAt",
  );
  res.json(posts);
});

// ── POST /api/top-posts/:brandId/manual ──────────────────────────────────────
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

// ── POST /api/top-posts/:brandId/from-link ────────────────────────────────────
// يجيب OG metadata من الـ link ويرجع بيانات جاهزة لليوزر يراجعها
router.post("/:brandId/from-link", protect, async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ message: "URL required" });

  try {
    // نجيب الـ HTML ونستخرج OG tags
    const html = await fetchHtml(url);
    const meta = extractOgMeta(html);

    // نحدد المنصة من الـ URL
    const platform = detectPlatform(url);

    // 🌟 التعديل السحري هنا: بنمرر النص على دالة he.decode عشان يرجع عربي طبيعي
    const rawContent = meta.description || meta.title || "";
    const cleanContent = he.decode(rawContent);

    res.json({
      platform,
      content: cleanContent, // نرسل النص النظيف والخالي من الرموز المشوهة
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

// ── POST /api/top-posts/:brandId/from-doc ─────────────────────────────────────
// يرفع ملف (PDF / DOCX / صورة سكرين شوت) والـ AI يستخرج البيانات منه
router.post(
  "/:brandId/from-doc",
  protect,
  upload.single("file"), // الـ key هنا يجب أن يكون 'file' في الـ FormData بالفرونت إند
  async (req, res) => {
    // إذا وصلنا هنا ورأينا الرسالة، فالمشكلة حُلت
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded. Check FormData key name." });
    }

    try {
      const ext = path.extname(req.file.originalname).toLowerCase();

      // 🔥 1. إذا كان الملف سكرين شوت (صورة)، نتوجّه مباشرة للدالة الذكية الجديدة
      if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
        const imageData = fs.readFileSync(req.file.path).toString("base64");

        console.log(
          "[AI] Analyzing screenshot with Gemini 2.5 Flash Vision...",
        );
        const extractedData = await extractPostDataFromImageWithAI(
          imageData,
          ext,
        );

        // نرسل الـ JSON المستخرج مباشرة للفرونت إند
        return res.json({ ...extractedData, source: "doc" });
      }

      // ── 2. معالجة المستندات النصية (PDF / DOCX) ──
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

      // استخراج البيانات المنظمة للمستندات النصية
      const extracted = await extractPostDataFromImageWithAI(text);
      res.json({ ...extracted, source: "doc" });
    } catch (err) {
      console.error("from-doc error:", err);
      res
        .status(500)
        .json({ message: "AI Extraction failed", error: err.message });
    } finally {
      // حذف الملف المؤقت دائماً لحفظ مساحة السيرفر
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlink(req.file.path, () => {});
      }
    }
  },
);

// ── POST /api/top-posts/:brandId/save-extracted ───────────────────────────────
// بعد ما اليوزر يراجع البيانات المستخرجة يحفظها
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

// ── POST /api/top-posts/:brandId/embed ────────────────────────────────────────
// يعمل re-embed للـ RAG بعد إضافة / تعديل البوستات
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

  // نبني نص RAG من كل البوستات + stats
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

  // نحدد كل البوستات كـ embedded
  await TopPost.updateMany({ brand: req.params.brandId }, { embedded: true });

  res.json({ message: `Embedded ${count} chunks`, postsCount: posts.length });
});

// ── DELETE /api/top-posts/:id ─────────────────────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  await TopPost.findByIdAndDelete(req.params.id);
  res.json({ message: "Post deleted" });
});

// ── PUT /api/top-posts/:id ────────────────────────────────────────────────────
router.put("/:id", protect, async (req, res) => {
  const post = await TopPost.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(post);
});

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// تعديل الدالة المساعدة في أسفل الملف لتستخرج الـ JSON مباشرة من الصورة!
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
