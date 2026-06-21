// src/api/postsApi.js
import api from "./client";

const postsApi = {
  async updateStatus(postId, status) {
    return await api.patch(`/posts/${postId}/status`, { status });
  },

  async approvePost(postId) {
    return await api.patch(`/posts/${postId}/approve`);
  },


  async updatePost(postId, updates) {
    return await api.patch(`/posts/${postId}`, updates);
  },


  async generateVariantB(postId) {
    return await api.post(`/posts/${postId}/variant-b`);
  },

  async applyVariantB(postId) {
    return await api.post(`/posts/${postId}/apply-variant-b`);
  },


  async schedulePost(postId, scheduledAt) {
    return await api.patch(`/posts/${postId}/schedule`, { scheduledAt });
  },


  async getAllPosts(brandId) {
    return await api.get(`/posts/all/${brandId}`);
  },


  async getDrafts(brandId) {
    return await api.get(`/posts/drafts/${brandId}`);
  },

  async deletePost(postId) {
    return await api.delete(`/posts/${postId}`);
  },


  async publishPost(postId, platform) {
    const p = platform.toLowerCase();
    return await api.post(`/posts/${postId}/publish/${p}`);
  },

  async updateDate(postId, date) {
    return await api.patch(`/posts/${postId}/date`, { date });
  },


  async generateImage(postId) {
    return await api.post(`/posts/${postId}/generate-image`);
  },


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
