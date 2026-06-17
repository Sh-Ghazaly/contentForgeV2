// backend/services/posterService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const sharp = require("sharp");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const HF_TOKEN = process.env.HF_API_TOKEN;

// ── إعدادات Hugging Face ────────────────────────────────────
const HF_GENERATION_URL =
  "https://router.huggingface.co/nscale/v1/images/generations";
const HF_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";
const HF_RM_BG_URL =
  "https://api-inference.huggingface.co/models/not-lain/background-removal";

// ── 1. إزالة خلفية الشعار تلقائياً (Free via Hugging Face) ──
async function removeBackgroundWithRemoveBG(imageBuffer) {
  if (!process.env.REMOVE_BG_API_KEY) {
    console.warn("[PosterService] REMOVE_BG_API_KEY not found");
    return imageBuffer;
  }

  try {
    const formData = new FormData();
    formData.append("image_file", new Blob([imageBuffer]), "logo.png");
    formData.append("size", "auto");

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`remove.bg API Error: ${response.status}`);
    }

    const resultBuffer = await response.arrayBuffer();
    return Buffer.from(resultBuffer);
  } catch (error) {
    console.error("[PosterService] remove.bg failed:", error.message);
    return imageBuffer;
  }
}

// ── 2. تحليل الصورة واستخراج البرومبت عبر Gemini ─────────────
async function buildPosterPrompt(imagePath, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

    const mimeType = mime.lookup(imagePath) || "image/jpeg";
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const systemInstruction = `
      You are an expert Art Director and Graphic Designer. Analyze the attached logo/product image.
      Extract: primary colors, visual style (e.g., minimalist, luxury, vibrant), and overall mood.

      Based on this analysis, and the user's request: "${userPrompt || "Create an attractive marketing poster"}", 
      write a highly detailed prompt in ENGLISH for the Stable Diffusion XL image generation model.

      STRICT RULES FOR THE PROMPT:
      1. It must reflect the colors and brand identity extracted from the image.
      2. It must describe professional lighting and a cinematic composition.
      3. CRITICAL: The prompt MUST include the exact phrase: "clean uncluttered negative space in the bottom right corner for logo placement".
      4. NO text, NO typography, NO letters, and NO logos should be generated inside the image.
      5. Output ONLY the final English prompt. No introductions, no explanations, no markdown formatting.
    `;

    const result = await model.generateContent([
      { text: systemInstruction },
      { inlineData: { data: base64Image, mimeType: mimeType } },
    ]);

    const aiPrompt = result.response.text().trim();
    console.log("[PosterService] Gemini Generated Prompt:", aiPrompt);
    return aiPrompt;
  } catch (error) {
    console.error("[PosterService] Gemini Analysis Error:", error);
    throw new Error("فشل في تحليل هوية البراند من الصورة.");
  }
}

// ── 3. توليد خلفية البوستر عبر HF Router (NScale) ───────────
async function generateBackground(prompt, width = 1024, height = 1024) {
  if (!HF_TOKEN) throw new Error("HF_API_TOKEN غير موجود في ملف .env");

  console.log(
    `[PosterService] Generating ${width}x${height} background via HF Router...`,
  );

  const response = await fetch(HF_GENERATION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HF_MODEL,
      prompt: prompt,
      response_format: "b64_json",
      width: width,
      height: height,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Hugging Face API Error ${response.status}: ${err}`);
  }

  const result = await response.json();

  if (result.data && result.data[0] && result.data[0].b64_json) {
    return Buffer.from(result.data[0].b64_json, "base64");
  } else if (result.images && result.images[0] && result.images[0].b64_json) {
    return Buffer.from(result.images[0].b64_json, "base64");
  } else {
    console.error("[PosterService] Unexpected HF Response:", result);
    throw new Error("فشل في قراءة الصورة المولدة من Hugging Face.");
  }
}

// ── 4. دمج الشعار الأصلي فوق البوستر المولد باستخدام Sharp ──
async function compositeLogo(backgroundBuffer, originalLogoPath, outputDir) {
  try {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let logoBuffer = fs.readFileSync(originalLogoPath);

    // ✨ الخطوة الجديدة: محاولة إزالة الخلفية تلقائياً
    console.log("[PosterService] Attempting to remove logo background...");
    logoBuffer = await removeBackgroundWithRemoveBG(logoBuffer);

    const bgMetadata = await sharp(backgroundBuffer).metadata();
    const logoResizeWidth = Math.floor(bgMetadata.width * 0.25); // 25% من عرض البوستر

    const processedLogo = await sharp(logoBuffer)
      .resize(logoResizeWidth, null, { fit: "inside" })
      .toBuffer();

    const finalImagePath = path.join(outputDir, `poster-${Date.now()}.png`);

    await sharp(backgroundBuffer)
      .composite([
        {
          input: processedLogo,
          gravity: "southeast",
          top: 35, // offset من الأسفل للأعلى
          left: 35, // offset من اليمين لليسار
        },
      ])
      .png({ quality: 90 })
      .toFile(finalImagePath);

    console.log(
      "[PosterService] Logo composited successfully at:",
      finalImagePath,
    );
    return finalImagePath;
  } catch (error) {
    console.error("[PosterService] Sharp Compositing Error:", error);
    throw new Error("فشل في دمج الشعار مع البوستر.");
  }
}

// ── الدالة الرئيسية التي يستدعيها الـ Controller ─────────────
async function generatePoster(imagePath, userPrompt) {
  console.log("[PosterService] Starting poster generation pipeline...");

  const prompt = await buildPosterPrompt(imagePath, userPrompt);
  const backgroundBuffer = await generateBackground(prompt, 1024, 1024);

  const outputDir = path.join(__dirname, "..", "uploads", "posters");
  const finalImagePath = await compositeLogo(
    backgroundBuffer,
    imagePath,
    outputDir,
  );

  const baseUrl =
    process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const fullUrl = `${baseUrl}/uploads/posters/${path.basename(finalImagePath)}`;

  return {
    imageUrl: fullUrl, // ✅ الرابط الكامل
    prompt: prompt,
  };
}

module.exports = { generatePoster };
