// src/api/client.js

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ أضف هذا: REQUEST interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("cf_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// RESPONSE interceptor (الكود الموجود لديك)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;
    const message = data?.message || error.message || "Something went wrong";
    const reason = data?.reason;
    const upgradeUrl = data?.upgradeUrl;

    if (status === 401) {
      localStorage.removeItem("cf_token");
      localStorage.removeItem("cf_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    if (status === 403) {
      const currentPath = window.location.pathname;

      // ✅ حالة 1: Trial Expired → توجيه إجباري (مش modal!)
      // لأن المستخدم لم يعد قادراً على استخدام الموقع أصلاً
      if (reason === "trial_expired") {
        if (currentPath !== "/trial-expired" && currentPath !== "/payment") {
          window.location.href = "/trial-expired";
        }
        return Promise.reject({ status, message, reason });
      }

      // ✅ باقي الحالات → Modal (المستخدم لسه يقدر يستخدم الموقع)
      const modalTypeMap = {
        feature_locked: { type: "feature_locked", title: "Feature Locked" },
        posts_limit_exceeded: {
          type: "posts_limit",
          title: "Posts Limit Reached",
        },
        calendar_limit_exceeded: {
          type: "calendar_limit",
          title: "Calendar Limit Reached",
        },
        brands_limit_exceeded: {
          type: "brands_limit",
          title: "Brands Limit Reached",
        },
      };

      const modalConfig = modalTypeMap[reason] || {
        type: "general",
        title: "Access Denied",
      };

      window.dispatchEvent(
        new CustomEvent("show-limit-modal", {
          detail: {
            type: modalConfig.type,
            title: modalConfig.title,
            message: message,
            reason: reason,
          },
        }),
      );

      return Promise.reject({ status, message, reason });
    }

    if (status === 429) {
      console.warn("Rate limited — slow down requests");
    }

    return Promise.reject({ status, message });
  },
);

export default api;