// // services/imageService.js
// // Smart image generation — يختار الـ provider أوتوماتيك:
// //   Development: ComfyUI محلي على Docker
// //   Production:  Replicate API (FLUX on cloud)
// //   Fallback:    null (no error, feature just disabled)

// const http = require("http");
// const https = require("https");
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // ── Detect mode ───────────────────────────────────────────────────────────────
// const MODE = process.env.REPLICATE_API_TOKEN
//   ? "replicate"
//   : process.env.COMFYUI_HOST
//     ? "comfyui"
//     : "disabled";

// console.log(`[ImageService] Mode: ${MODE}`);

// // ── Platform dimensions ───────────────────────────────────────────────────────
// function getDimensions(platform) {
//   return (
//     {
//       Instagram: { width: 1024, height: 1024, ratio: "1:1" },
//       Facebook: { width: 1024, height: 536, ratio: "16:9" },
//       LinkedIn: { width: 1024, height: 536, ratio: "16:9" },
//       "Twitter/X": { width: 1024, height: 512, ratio: "2:1" },
//       TikTok: { width: 576, height: 1024, ratio: "9:16" },
//     }[platform] || { width: 1024, height: 1024, ratio: "1:1" }
//   );
// }

// // ── Build image prompt via Gemini ─────────────────────────────────────────────
// async function buildImagePrompt({ post, brand }) {
//   const dialectStyle =
//     {
//       "Egyptian Arabic":
//         "warm Egyptian café aesthetic, golden hour Cairo vibes",
//       "Gulf Arabic": "luxurious modern Gulf aesthetic, Dubai/Riyadh style",
//       "Levantine Arabic": "Mediterranean Beirut aesthetic, earthy warm tones",
//       "Modern Standard Arabic": "professional pan-Arab aesthetic, clean modern",
//       "Bilingual AR+EN": "cosmopolitan Middle East lifestyle aesthetic",
//     }[post.dialect] || "modern Middle Eastern lifestyle";

//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(`
// You are a creative director for Arabic social media brands.
// POST: ${post.copyAR}
// PLATFORM: ${post.platform}
// HASHTAGS: ${post.hashtags?.join(", ") || ""}
// BRAND: ${brand.name} — ${brand.industry}
// TONE: ${brand.tones?.join(", ") || "Warm, Bold"}
// DIALECT AESTHETIC: ${dialectStyle}

// Write ONE English image prompt for FLUX AI image generator.
// - Photorealistic commercial photography
// - Unique to THIS post's message
// - ${post.platform} optimized composition
// - NO Arabic text, NO calligraphy, NO faces
// - Max 80 words. Output ONLY the prompt.`);
//     return result.response.text().trim();
//   } catch {
//     return `Professional commercial photography, ${brand.industry} product, ${dialectStyle}, soft studio lighting, high quality`;
//   }
// }

// // ── PROVIDER 1: ComfyUI (Development) ────────────────────────────────────────
// async function generateWithComfyUI({ imagePrompt, width, height, seed }) {
//   const COMFYUI_HOST = process.env.COMFYUI_HOST || "localhost";
//   const COMFYUI_PORT = process.env.COMFYUI_PORT || 8188;
//   const COMFYUI_TOKEN = process.env.COMFYUI_TOKEN || "";

//   function httpReq(options, body = null) {
//     return new Promise((resolve, reject) => {
//       const req = http.request(options, (res) => {
//         const chunks = [];
//         res.on("data", (c) => chunks.push(c));
//         res.on("end", () => {
//           const buf = Buffer.concat(chunks);
//           if (res.headers["content-type"]?.includes("image")) {
//             resolve({ buffer: buf });
//           } else {
//             try {
//               resolve(JSON.parse(buf.toString()));
//             } catch {
//               resolve(buf.toString());
//             }
//           }
//         });
//       });
//       req.on("error", reject);
//       if (body) req.write(JSON.stringify(body));
//       req.end();
//     });
//   }

//   const workflow = {
//     1: {
//       class_type: "UNETLoader",
//       inputs: {
//         unet_name: "flux1-schnell-Q4_K_S.gguf",
//         weight_dtype: "default",
//       },
//     },
//     2: { class_type: "VAELoader", inputs: { vae_name: "ae.safetensors" } },
//     3: {
//       class_type: "CLIPLoader",
//       inputs: { clip_name: "t5xxl_fp8_e4m3fn.safetensors", type: "flux" },
//     },
//     4: {
//       class_type: "CLIPTextEncode",
//       inputs: { clip: ["3", 0], text: imagePrompt },
//     },
//     5: {
//       class_type: "EmptySD3LatentImage",
//       inputs: { width: width, height: height, batch_size: 1 },
//     },
//     6: {
//       class_type: "KSampler",
//       inputs: {
//         model: ["1", 0],
//         positive: ["4", 0],
//         negative: ["4", 0],
//         latent_image: ["5", 0],
//         seed: seed,
//         steps: 4,
//         cfg: 1,
//         sampler_name: "euler",
//         scheduler: "simple",
//         denoise: 1,
//       },
//     },
//     7: {
//       class_type: "VAEDecode",
//       inputs: { samples: ["6", 0], vae: ["2", 0] },
//     },
//     8: {
//       class_type: "SaveImage",
//       inputs: { images: ["7", 0], filename_prefix: "contentforge" },
//     },
//   };

//   const headers = { "Content-Type": "application/json" };
//   if (COMFYUI_TOKEN) headers["Authorization"] = `Bearer ${COMFYUI_TOKEN}`;

//   // Submit
//   const body = JSON.stringify({ prompt: workflow });
//   const submit = await httpReq(
//     {
//       host: COMFYUI_HOST,
//       port: COMFYUI_PORT,
//       path: "/prompt",
//       method: "POST",
//       headers: { ...headers, "Content-Length": Buffer.byteLength(body) },
//     },
//     workflow,
//   );
//   if (!submit.prompt_id)
//     throw new Error("ComfyUI rejected: " + JSON.stringify(submit));

//   // Poll
//   const start = Date.now();
//   while (Date.now() - start < 120000) {
//     await new Promise((r) => setTimeout(r, 2000));
//     const history = await httpReq({
//       host: COMFYUI_HOST,
//       port: COMFYUI_PORT,
//       path: `/history/${submit.prompt_id}`,
//       method: "GET",
//       headers,
//     });
//     if (history[submit.prompt_id]?.outputs) {
//       for (const nodeId of Object.keys(history[submit.prompt_id].outputs)) {
//         const images = history[submit.prompt_id].outputs[nodeId]?.images;
//         if (images?.length) {
//           const { filename, subfolder, type } = images[0];
//           const img = await httpReq({
//             host: COMFYUI_HOST,
//             port: COMFYUI_PORT,
//             path: `/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder || "")}&type=${type || "output"}`,
//             method: "GET",
//             headers,
//           });
//           if (img.buffer)
//             return `data:image/png;base64,${img.buffer.toString("base64")}`;
//         }
//       }
//     }
//   }
//   throw new Error("ComfyUI timeout");
// }

// // ── PROVIDER 2: Replicate (Production on Render) ──────────────────────────────
// async function generateWithReplicate({ imagePrompt, ratio }) {
//   const token = process.env.REPLICATE_API_TOKEN;

//   function httpsPost(url, body) {
//     return new Promise((resolve, reject) => {
//       const data = JSON.stringify(body);
//       const urlObj = new URL(url);
//       const req = https.request(
//         {
//           hostname: urlObj.hostname,
//           path: urlObj.pathname,
//           method: "POST",
//           headers: {
//             Authorization: `Token ${token}`,
//             "Content-Type": "application/json",
//             "Content-Length": Buffer.byteLength(data),
//           },
//         },
//         (res) => {
//           const chunks = [];
//           res.on("data", (c) => chunks.push(c));
//           res.on("end", () =>
//             resolve(JSON.parse(Buffer.concat(chunks).toString())),
//           );
//         },
//       );
//       req.on("error", reject);
//       req.write(data);
//       req.end();
//     });
//   }

//   function httpsGet(url) {
//     return new Promise((resolve, reject) => {
//       const urlObj = new URL(url);
//       https
//         .get(
//           {
//             hostname: urlObj.hostname,
//             path: urlObj.pathname + urlObj.search,
//             headers: { Authorization: `Token ${token}` },
//           },
//           (res) => {
//             const chunks = [];
//             res.on("data", (c) => chunks.push(c));
//             res.on("end", () =>
//               resolve(JSON.parse(Buffer.concat(chunks).toString())),
//             );
//           },
//         )
//         .on("error", reject);
//     });
//   }

//   function downloadImage(url) {
//     return new Promise((resolve, reject) => {
//       https
//         .get(url, (res) => {
//           const chunks = [];
//           res.on("data", (c) => chunks.push(c));
//           res.on("end", () => resolve(Buffer.concat(chunks)));
//         })
//         .on("error", reject);
//     });
//   }

//   // Create prediction
//   const prediction = await httpsPost(
//     "https://api.replicate.com/v1/models/black-forest-labs/flux-schnell/predictions",
//     {
//       input: {
//         prompt: imagePrompt,
//         num_outputs: 1,
//         aspect_ratio: ratio,
//         output_format: "webp",
//       },
//     },
//   );

//   if (!prediction.id)
//     throw new Error("Replicate error: " + JSON.stringify(prediction));

//   // Poll until done
//   const start = Date.now();
//   while (Date.now() - start < 120000) {
//     await new Promise((r) => setTimeout(r, 3000));
//     const status = await httpsGet(
//       `https://api.replicate.com/v1/predictions/${prediction.id}`,
//     );

//     if (status.status === "succeeded" && status.output?.[0]) {
//       const imageBuffer = await downloadImage(status.output[0]);
//       return `data:image/webp;base64,${imageBuffer.toString("base64")}`;
//     }
//     if (status.status === "failed")
//       throw new Error("Replicate generation failed: " + status.error);
//   }
//   throw new Error("Replicate timeout");
// }

// // ── Main function ─────────────────────────────────────────────────────────────
// async function generatePostImage({ post, brand }) {
//   if (MODE === "disabled") {
//     console.log(
//       "[ImageService] Disabled — set COMFYUI_HOST or REPLICATE_API_TOKEN",
//     );
//     return { imagePrompt: null, imageUrl: null };
//   }

//   console.log(`[ImageService] Generating via ${MODE} for post ${post._id}`);

//   const imagePrompt = await buildImagePrompt({ post, brand });
//   const { width, height, ratio } = getDimensions(post.platform);
//   const seed =
//     parseInt(post._id?.toString().slice(-8), 16) % 999999999 ||
//     Math.floor(Math.random() * 999999999);

//   let imageUrl;
//   if (MODE === "comfyui") {
//     imageUrl = await generateWithComfyUI({ imagePrompt, width, height, seed });
//   } else {
//     imageUrl = await generateWithReplicate({ imagePrompt, ratio });
//   }

//   console.log(`[ImageService] Done!`);
//   return { imagePrompt, imageUrl };
// }

// module.exports = { generatePostImage };

// services/imageService.js
// بيولد صور بـ Hugging Face Router — شغال من مصر ومن Render
// مش محتاج ComfyUI أو Docker

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const HF_TOKEN = process.env.HF_API_TOKEN;
const HF_URL = "https://router.huggingface.co/nscale/v1/images/generations";
const MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

// ── Platform dimensions ───────────────────────────────────────────────────────
function getDimensions(platform) {
  return (
    {
      Instagram: { width: 1024, height: 1024 },
      Facebook: { width: 1024, height: 576 },
      LinkedIn: { width: 1024, height: 576 },
      "Twitter/X": { width: 1024, height: 512 },
      TikTok: { width: 576, height: 1024 },
    }[platform] || { width: 1024, height: 1024 }
  );
}

// ── Build image prompt via Gemini ─────────────────────────────────────────────
async function buildImagePrompt({ post, brand, regenerate = false }) {
  const dialectStyle =
    {
      "Egyptian Arabic":
        "warm Egyptian café aesthetic, golden Cairo vibes, warm amber tones",
      "Gulf Arabic":
        "luxurious Gulf aesthetic, modern Dubai style, cool blues and gold",
      "Levantine Arabic":
        "Mediterranean Beirut aesthetic, earthy warm tones, natural light",
      "Modern Standard Arabic":
        "professional pan-Arab aesthetic, clean corporate modern",
      "Bilingual AR+EN":
        "cosmopolitan Middle East lifestyle, modern urban aesthetic",
    }[post.dialect] || "modern Middle Eastern lifestyle";

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const result = await model.generateContent(`
You are a creative director and designer for Arabic social media brands.
POST: ${post.copyAR}
PLATFORM: ${post.platform}
HASHTAGS: ${post.hashtags?.join(", ") || ""}
BRAND: ${brand.name} — ${brand.industry}
TONE: ${brand.tones?.join(", ") || "Warm, Bold"}
AUDIENCE: ${brand.targetAudience}
DIALECT AESTHETIC: ${dialectStyle}

Write ONE English Social Media Poster prompt for Stable Diffusion XL.
Requirements:
- Photorealistic commercial photography style
- Unique to THIS post's specific message and hashtags
- Reflects ${brand.industry} industry visually
- Optimized for ${post.platform} format
- Specific lighting, mood, color palette, subject, composition
- NO Arabic text, NO calligraphy, NO people's faces
- Max 80 words

Output ONLY the prompt, nothing else.`);
      console.log("Gemini response:", result.response.text());
    return result.response.text().trim();
  } catch {
    // Fallback local prompt لو Gemini مش متاح
    return `Professional designer for social media, ${brand.industry} product, ${dialectStyle}, soft studio lighting, high quality 4k, brand aesthetic for ${post.platform}, cinematic composition`;
  }
}

// ── Generate image via HF Router ──────────────────────────────────────────────
async function callHuggingFace(prompt, width, height) {
  if (!HF_TOKEN) throw new Error("HF_API_TOKEN not set in .env");

  const response = await fetch(HF_URL, {
    method: "POST",
    headers: {
      'Authorization': `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      prompt,
      response_format: "b64_json",
      width,
      height,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`HF API error ${response.status}: ${err}`);
  }

  const result = await response.json();
  const item = result.data?.[0];
  const base64 = item?.b64_json || item?.image || item?.b64;

  if (!base64 || typeof base64 !== "string") {
    throw new Error(
      "No valid base64 image in response: " + JSON.stringify(result),
    );
  }

  return base64;
}

// ── Main function ─────────────────────────────────────────────────────────────
async function generatePostImage({ post, brand, regenerate = false }) {
  if (!HF_TOKEN) {
    console.log(
      "[ImageService] HF_API_TOKEN not set — image generation disabled",
    );
    return { imagePrompt: null, imageUrl: null };
  }

  console.log(
    `[ImageService] Generating image for post ${post._id} (${post.platform})`,
  );

  // 1. Build prompt
  const imagePrompt = await buildImagePrompt({ post, brand, regenerate });
  console.log(`[ImageService] Prompt: ${imagePrompt.slice(0, 80)}...`);

  // 2. Get dimensions
  const { width, height } = getDimensions(post.platform);

  // 3. Generate
  const base64 = await callHuggingFace(imagePrompt, width, height);
  const imageUrl = `data:image/png;base64,${base64}`;

  console.log("[ImageService] Image generated successfully!");
  return { imagePrompt, imageUrl };
}

module.exports = { generatePostImage };
