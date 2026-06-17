// backend/services/embeddingService.js
const { OpenAI } = require("openai"); // استيراد مكتبة OpenAI
const { Brand } = require("../models");
const { pipeline } = require("@xenova/transformers");
// تعريف الـ Client وقراءة الـ Key تلقائياً من الـ .env (اسم المتغير لازم يكون OPENAI_API_KEY)
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// ── Split text into ~300-word chunks ─────────────────────────────────────────
function chunkText(text, maxWords = 300) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(" "));
  }
  return chunks;
}

// ── Embed a single string with OpenAI ────────────────────────────────────────
// async function embedText(text) {
//   if (!text || text.trim() === "") return [];

//   try {
//     const response = await openai.embeddings.create({
//       model: "text-embedding-3-small", // الموديل الأحدث والأوفر من OpenAI
//       input: text,
//     });

//     // OpenAI بترجع الـ vector جوه data[0].embedding
//     return response.data[0].embedding;
//   } catch (error) {
//     console.error("OpenAI Embedding Error:", error);
//     throw error;
//   }
// }

async function embedText(text) {
  if (!text || text.trim() === "") return [];

  try {
    // تحميل الموديل محلياً (بيتحمل أول مرة بس وبيتحفظ عندك)
    const extractor = await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2",
    );

    // توليد الـ Embedding
    const output = await extractor(text, { pooling: "mean", normalize: true });

    // تحويل الناتج لـ Array عادي علشان الـ MongoDB والـ Cosine Similarity
    return Array.from(output.data);
  } catch (error) {
    console.error("Local Embedding Error:", error);
    throw error;
  }
}

// ── Embed brand vault and save to MongoDB ─────────────────────────────────────
async function embedBrandVault(brandId, guidelinesText, pastPostsText) {
  const chunks = [];

  for (const chunk of chunkText(guidelinesText)) {
    const embedding = await embedText(chunk);
    chunks.push({ content: chunk, embedding, source: "guidelines" });
  }

  for (const chunk of chunkText(pastPostsText)) {
    const embedding = await embedText(chunk);
    chunks.push({ content: chunk, embedding, source: "past_posts" });
  }

  await Brand.findByIdAndUpdate(brandId, { ragChunks: chunks });
  return chunks.length;
}

// ── Cosine similarity ──────────────────────────────────────────────────────────
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magA = Math.sqrt(a.reduce((s, ai) => s + ai * ai, 0));
  const magB = Math.sqrt(b.reduce((s, bi) => s + bi * bi, 0));
  return dot / (magA * magB);
}

// ── Retrieve top-K most relevant chunks for a query ───────────────────────────
async function retrieveRelevantChunks(brandId, query, topK = 4) {
  const brand = await Brand.findById(brandId);
  if (!brand?.ragChunks?.length) return [];

  const queryVec = await embedText(query);

  return brand.ragChunks
    .map((chunk) => ({
      content: chunk.content,
      score: cosineSimilarity(queryVec, chunk.embedding),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((c) => c.content);
}

module.exports = { embedBrandVault, retrieveRelevantChunks };
