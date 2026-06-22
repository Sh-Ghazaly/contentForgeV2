// backend/routes/chat.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const protect = require("../middleware/auth");
const { Brand , ChatMessage   } = require("../models");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { retrieveRelevantChunks } = require("../services/embeddingService");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get("/history/:conversationId", protect, async (req, res) => {
  try {
    const messages = await ChatMessage.find({
      conversationId: req.params.conversationId,
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error("[Chat] History fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});


router.get("/conversations/:brandId", protect, async (req, res) => {
  try {
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          brand: new mongoose.Types.ObjectId(req.params.brandId),
          sender: "user",
        },
      },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$conversationId",
          preview: { $first: "$content" },
          startedAt: { $first: "$createdAt" },
        },
      },
      { $sort: { startedAt: -1 } },
      { $limit: 30 },
    ]);

    res.json({ conversations });
  } catch (err) {
    console.error("[Chat] Conversations fetch error:", err.message);
    res.status(500).json({ message: "Failed to fetch conversations" });
  }
});



router.post("/", protect, async (req, res) => {
  const { message, history, brandId ,conversationId } = req.body;

  if (!message) return res.status(400).json({ message: "message is required" });

  try {
    await ChatMessage.create({
      brand: brandId,
      conversationId,
      sender: "user",
      content: message,
    });
    let brandContext = "";
    let brand = null;

    if (brandId) {
      brand = await Brand.findById(brandId);
      if (brand) {
        const chunks = await retrieveRelevantChunks(brandId, message).catch(
          () => [],
        );
        brandContext = chunks.length
          ? chunks.join("\n\n")
          : `Brand: ${brand.name}. Industry: ${brand.industry}. Audience: ${brand.targetAudience}. Tone: ${brand.tones?.join(", ")}. Avoid: ${brand.avoidTopics || "nothing"}.`;
      }
    }

    const systemPrompt = `You are ContentForge AI, an expert Arabic and bilingual content strategist.
${
  brand
    ? `
BRAND CONTEXT:
${brandContext}

Brand name: ${brand.name}
Dialects: ${brand.dialects?.join(", ") || "Egyptian Arabic"}
Tone: ${brand.tones?.join(", ") || "Warm, Bold"}
Platforms: ${brand.platforms?.join(", ") || "Instagram, Facebook"}
Avoid: ${brand.avoidTopics || "nothing"}
`
    : "No brand loaded yet — ask the user to set up their Brand Vault first."
}

YOUR ALLOWED SCOPE — you may ONLY respond to:
1. Questions or tasks directly related to the brand above (content creation, captions, hashtags, strategy, tone, audience, posting ideas, content calendar suggestions)
2. Questions about trending topics and whether a trend suits this specific brand
3. Questions about how the ContentForge platform works (its features, pages, or how to use the app)

CONTENTFORGE PLATFORM KNOWLEDGE:
ContentForge offers the following subscription plans:
- Free Trial: 7 days, limited to X AI generations, 1 brand
- Basic Plan: $X/month — Y generations, Z brands
- Pro Plan: $X/month — unlimited generations, unlimited brands, priority support

If the user asks about pricing, plans, or subscription features, explain clearly based on the above.

STRICT RULES:
- If the user asks about ANYTHING outside this scope (general news, politics, cooking, science, personal advice, random general knowledge, etc.), you must politely refuse and redirect them back to the brand or platform.
- When refusing, reply in the same language the user used. Use a warm but firm tone, for example: "أنا هنا بس عشان أساعدك في محتوى براند ${brand?.name || "الخاص بك"} وكل ما يخص ContentForge. إيه اللي تحب تعمله للبراند؟"
- Reply in the same language the user writes in (Arabic or English)
- For Arabic, always use the brand's specified dialect: ${brand?.dialects?.[0] || "Modern Standard Arabic"}. Never assume Egyptian dialect unless it's explicitly set in the brand settings.
- When generating posts, always include Arabic copy + hashtags
- Keep responses concise and actionable
- Be concise. Answer ONLY what was asked — do not volunteer extra information about plans, features, or other topics unless explicitly asked.
- Never mention subscription plans unless the user specifically asks about pricing or plans.
- If asked to generate a calendar, remind the user to use the Calendar page for the full interactive experience`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite", systemInstruction: systemPrompt });

    const dbHistory = await ChatMessage.find({
      brand: brandId,
      conversationId,
    }).sort({ createdAt: 1 });

    const geminiHistory = dbHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: geminiHistory,
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();


    await ChatMessage.create({
      brand: brandId,
      conversationId,
      sender: "ai",
      content: reply,
    });

    res.json({ reply });
  } catch (err) {
    console.error("[Chat] Error:", err.message);
    res.status(500).json({ message: "AI generation failed: " + err.message });
  }
});

module.exports = router;
