// src/api/posterApi.js
import api from "./client";

const posterApi = {
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

  async getHistory() {
    return await api.get("/posters/history");
  },
};

export default posterApi;