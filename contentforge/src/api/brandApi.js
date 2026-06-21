// src/api/brandApi.js
import api from './client'

const brandApi = {
  async saveBrand(formData) {
    return await api.post("/brand", formData);
  },

  async getBrand(brandId) {
    return await api.get(`/brand/${brandId}`);
  },

  async getMyBrands() {
    return await api.get("/brand");
  },

  async uploadGuidelines(brandId, file) {
    const form = new FormData();
    form.append("guidelines", file);
    return await api.post(`/brand/${brandId}/upload-guidelines`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        console.log(`Upload: ${Math.round((e.loaded / e.total) * 100)}%`);
      },
    });
  },

  async uploadPastPosts(brandId, files) {
    const form = new FormData();
    files.forEach((file) => form.append("posts", file));
    return await api.post(`/brand/${brandId}/upload-posts`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async embedBrand(brandId) {
    return await api.post(`/brand/${brandId}/embed`);
  },

  async deleteBrand(brandId) {
    return await api.delete(`/brand/${brandId}`);
  },

  async updateBrand(brandId, formData) {
    return await api.put(`/brand/${brandId}`, formData);
  },
};

export default brandApi
