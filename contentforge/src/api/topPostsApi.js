import api from "./client";

const BASE = (brandId) => `/top-posts/${brandId}`;

export default {
  getAll: (brandId) => api.get(BASE(brandId)),
  saveManual: (brandId, data) => api.post(`${BASE(brandId)}/manual`, data),
  saveExtracted: (brandId, data) =>
    api.post(`${BASE(brandId)}/save-extracted`, data),
  fromLink: (brandId, url) => api.post(`${BASE(brandId)}/from-link`, { url }),
  embed: (brandId) => api.post(`${BASE(brandId)}/embed`),
  update: (id, data) => api.put(`/top-posts/${id}`, data),
  remove: (id) => api.delete(`/top-posts/${id}`),


  fromDoc(brandId, file) {
    const form = new FormData();
    form.append("file", file); 

    return api.post(`${BASE(brandId)}/from-doc`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
