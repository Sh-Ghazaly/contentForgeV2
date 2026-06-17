// src/api/brandApi.js
// All brand vault operations: create, update, upload files, embed RAG
import api from './client'

const brandApi = {
  // ── Save / update brand form ────────────────────────────────────────────────
  // POST /api/brand
  // Body: { name, industry, website, targetAudience, dialects[], tones[], platforms[], avoidTopics }
  // Returns: { brand, message }
  async saveBrand(formData) {
    return await api.post("/brand", formData);
  },

  // ── Get brand by ID ─────────────────────────────────────────────────────────
  // GET /api/brand/:id
  async getBrand(brandId) {
    return await api.get(`/brand/${brandId}`);
  },

  // ── Get all brands for logged-in user ───────────────────────────────────────
  // GET /api/brand
  async getMyBrands() {
    return await api.get("/brand");
  },

  // ── Upload brand guidelines PDF ─────────────────────────────────────────────
  // POST /api/brand/:id/upload-guidelines
  // Sends as multipart/form-data (file upload)
  async uploadGuidelines(brandId, file) {
    const form = new FormData();
    form.append("guidelines", file);
    return await api.post(`/brand/${brandId}/upload-guidelines`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        // e.loaded / e.total gives upload percentage (use for progress bar)
        console.log(`Upload: ${Math.round((e.loaded / e.total) * 100)}%`);
      },
    });
  },

  // ── Upload top 10 past posts (images) ──────────────────────────────────────
  // POST /api/brand/:id/upload-posts
  async uploadPastPosts(brandId, files) {
    const form = new FormData();
    files.forEach((file) => form.append("posts", file));
    return await api.post(`/brand/${brandId}/upload-posts`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ── Trigger RAG re-embedding ────────────────────────────────────────────────
  // POST /api/brand/:id/embed
  // Sends all uploaded brand files through Google Embedding API → stores in MongoDB
  async embedBrand(brandId) {
    return await api.post(`/brand/${brandId}/embed`);
  },

  // ── Delete a brand ──────────────────────────────────────────────────────────
  // DELETE /api/brand/:id
  async deleteBrand(brandId) {
    return await api.delete(`/brand/${brandId}`);
  },

  // ── Update brand profile (same as saveBrand but with PUT and brandId) ───────
  // PUT /api/brand/:id
  async updateBrand(brandId, formData) {
    return await api.put(`/brand/${brandId}`, formData);
  },
};

export default brandApi
