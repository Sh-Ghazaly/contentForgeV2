// backend/services/geminiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ── Build top posts context block (only if posts exist) ───────────────────────
function buildTopPostsContext(topPosts) {
  if (!topPosts?.length) return "";

  const lines = topPosts.map((p, i) => {
    const s = p.stats || {};
    const engStr = [
      s.likes ? `Likes: ${s.likes}` : "",
      s.comments ? `Comments: ${s.comments}` : "",
      s.shares ? `Shares: ${s.shares}` : "",
      s.reach ? `Reach: ${s.reach}` : "",
      s.saves ? `Saves: ${s.saves}` : "",
      s.engagementRate ? `Eng.Rate: ${s.engagementRate}%` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    return `
Post #${i + 1} [${p.platform}${p.date ? " • " + p.date : ""}]
${p.content ? `Content: ${p.content}` : ""}${p.postUrl ? `\nURL: ${p.postUrl}` : ""}
Stats: ${engStr || "N/A"}`.trim();
  });

  return `
TOP PERFORMING POSTS (learn from these — replicate what worked):
${lines.join("\n---\n")}

Key takeaways to apply:
- Use similar hooks, tone, and structure that drove high engagement
- Mirror hashtag patterns from high-performing posts
- Replicate content length and formatting that resonated with the audience
`.trim();
}

// ── Generate calendar ─────────────────────────────────────────────────────────
async function generateCalendar({
  brief,
  brand,
  trends,
  dialect,
  platforms,
  brandContext,
  topPosts,
  startDate,
  endDate,
  duration,
}) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const topPostsBlock = buildTopPostsContext(topPosts);

  const prompt = `
You are ContentForge, an AI content strategist for Arabic and bilingual brands.

BRAND CONTEXT (from RAG memory):
${brandContext || `Brand: ${brand.name}. Industry: ${brand.industry}. Audience: ${brand.targetAudience}.`}

${topPostsBlock ? topPostsBlock + "\n" : ""}
BRAND SETTINGS:
- Name: ${brand.name}
- Dialect: ${dialect}
- Tone: ${brand.tones?.join(", ") || "Warm, Community-first"}
- Avoid: ${brand.avoidTopics || "nothing specified"}

CAMPAIGN BRIEF:
${brief}

TRENDING NOW (inject naturally into posts):
${trends.join(", ")}

STRICT TIMEFRAME CONSTRAINTS:
- Start Date: ${startDate}
- End Date: ${endDate}
- Plan Duration: Exactly ${duration} days.

TASK: Generate a sequential content calendar spanning from ${startDate} to ${endDate} (${duration} days total) for: ${platforms.join(", ")}.
Each post MUST have an accurate "date" parameter corresponding to a day within this explicit range.
Include roughly 2 rest days per week (for empty days, simply do not generate an object for that specific date in the array).
${topPostsBlock ? "IMPORTANT: The top performing posts above are real data — let them guide your content style, hook structure, and tone." : ""}

RESPOND ONLY with a JSON array, no extra text, no markdown fences. Example format:
[
  {
    "date": "${startDate}",
    "platform": "${platforms[0] || "Instagram"}",
    "dialect": "${dialect}",
    "copyAR": "Arabic caption text here",
    "copyEN": "English translation here",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
    "imagePrompt": "Professional product photo of coffee cup with warm lighting, Arabic calligraphy in background",
    "goal": "Engagement"
  }
]
`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

// ── Generate A/B variant ──────────────────────────────────────────────────────
async function generateVariantB({ post, brand, topPosts }) {
  const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });

  const topPostsBlock = buildTopPostsContext(topPosts);

  const prompt = `
You are an A/B Critic Agent for ContentForge.

Original ${post.platform} post (${post.dialect}):
Arabic: ${post.copyAR}
English: ${post.copyEN}

Brand tone: ${brand.tones?.join(", ") || "Warm, Bold"}

${
  topPostsBlock
    ? `${topPostsBlock}

INSTRUCTIONS: Study the top performing posts above carefully.
Extract the hooks, sentence structures, CTAs, and emotional triggers that drove high engagement.
Apply those exact patterns to craft Version B — don't just rephrase, rebuild with what actually worked.
`
    : `Create Version B with a STRONGER hook — lead with the offer or a question.
Use a different CTA. Keep same brand voice and dialect.`
}

RESPOND ONLY with JSON, no extra text:
{
  "copyAR": "...",
  "copyEN": "...",
  "hashtags": ["...", "..."]
}
`;

  const result = await model.generateContent(prompt);
  let text = result.response.text();
  text = text.replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

module.exports = { generateCalendar, generateVariantB };
