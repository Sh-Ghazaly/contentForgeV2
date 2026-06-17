// src/api/posterApi.js
// AI Poster Generator API — upload product image + prompt, get generated poster
import api from "./client";

const posterApi = {
  // ── Generate AI marketing poster ──────────────────────────────────────────
  // POST /api/posters/generate
  // Body: FormData { image: File, prompt: string }
  // Returns: { success, message, data: { imageUrl, prompt, originalImage, generatedAt } }
  async generatePoster(imageFile, prompt) {
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("prompt", prompt.trim());

    return await api.post("/posters/generate", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes — AI generation can be slow
    });
  },

  // ── Get poster generation history ─────────────────────────────────────────
  // GET /api/posters/history
  async getHistory() {
    return await api.get("/posters/history");
  },
};

export default posterApi;