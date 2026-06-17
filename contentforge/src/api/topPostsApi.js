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

  // 🔥 تعديل دالة الرفع للتأكيد على إرسال الـ boundary والـ Content-Type الصحيح للملفات
  fromDoc(brandId, file) {
    const form = new FormData();
    form.append("file", file); // التأكد من مطابقة الاسم تماماً مع الباك إند

    return api.post(`${BASE(brandId)}/from-doc`, form, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
