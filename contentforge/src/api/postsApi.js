// src/api/postsApi.js
// Individual post operations: status updates, A/B variants, scheduling
import api from "./client";

const postsApi = {
  // ── Update post status ──────────────────────────────────────────────────────
  // PATCH /api/posts/:id/status
  // Body: { status: 'draft' | 'pending_review' | 'approved' | 'scheduled' | 'published' }
  async updateStatus(postId, status) {
    return await api.patch(`/posts/${postId}/status`, { status });
  },

  // ── Approve a single post ───────────────────────────────────────────────────
  // PATCH /api/posts/:id/approve
  async approvePost(postId) {
    return await api.patch(`/posts/${postId}/approve`);
  },

  // ── Update post copy (Arabic or English) ───────────────────────────────────
  // PATCH /api/posts/:id
  // Body: { copyAR, copyEN, hashtags[] }
  async updatePost(postId, updates) {
    return await api.patch(`/posts/${postId}`, updates);
  },

  // ── Generate A/B variant B using Gemini ────────────────────────────────────
  // POST /api/posts/:id/variant-b
  // Returns: { copyAR, copyEN, hashtags }
  async generateVariantB(postId) {
    return await api.post(`/posts/${postId}/variant-b`);
  },

  // ── Apply variant B (replace current copy with B) ──────────────────────────
  // POST /api/posts/:id/apply-variant-b
  async applyVariantB(postId) {
    return await api.post(`/posts/${postId}/apply-variant-b`);
  },

  // ── Schedule a post for a specific date/time ────────────────────────────────
  // PATCH /api/posts/:id/schedule
  // Body: { scheduledAt: ISO date string }
  async schedulePost(postId, scheduledAt) {
    return await api.patch(`/posts/${postId}/schedule`, { scheduledAt });
  },

  // ── Get ALL posts for a brand (all statuses) ────────────────────────────────
  // GET /api/posts/all/:brandId
  async getAllPosts(brandId) {
    return await api.get(`/posts/all/${brandId}`);
  },

  // ── Get all drafts for a brand ──────────────────────────────────────────────
  // GET /api/posts/drafts/:brandId
  async getDrafts(brandId) {
    return await api.get(`/posts/drafts/${brandId}`);
  },

  // ── Delete a post ───────────────────────────────────────────────────────────
  // DELETE /api/posts/:id
  async deletePost(postId) {
    return await api.delete(`/posts/${postId}`);
  },

  // ── Publish a post immediately to social platform ───────────────────────────
  // POST /api/posts/:id/publish
  async publishPost(postId, platform) {
    const p = platform.toLowerCase();
    return await api.post(`/posts/${postId}/publish/${p}`);
  },

  // ── Swap post date (drag-and-drop) ──────────────────────────────────────────
  // PATCH /api/posts/:id/date
  // Body: { date: ISO date string }
  async updateDate(postId, date) {
    return await api.patch(`/posts/${postId}/date`, { date });
  },

  // ── Generate AI image for a post ───────────────────────────────────────────
  // POST /api/posts/:id/generate-image
  // Gemini builds a unique prompt → FLUX generates the image → saved in DB
  // Returns: { imageUrl, imagePrompt }
  async generateImage(postId) {
    return await api.post(`/posts/${postId}/generate-image`);
  },

  // ── Quick publish directly (no calendar post needed) ────────────────────────
  // POST /api/posts/quick-publish
  async quickPublish(platform, message, imageUrl = null, brandId = null) {
    return await api.post("/posts/quick-publish", {
      platform,
      message,
      imageUrl,
      brandId,
    });
  },

  async createPost(data) {
    return await api.post("/posts", data);
  },
};

export default postsApi;
