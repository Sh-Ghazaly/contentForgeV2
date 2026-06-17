// src/api/index.js
// ─────────────────────────────────────────────────────────────────────────────
// One import for the entire app:
//   import { authApi, brandApi, calendarApi, postsApi } from '@/api'
// ─────────────────────────────────────────────────────────────────────────────

export { default as authApi } from "./authApi";
export { default as brandApi } from "./brandApi";
export { default as calendarApi } from "./calendarApi";
export { default as postsApi } from "./postsApi";
export { default as api } from "./client";
export { default as posterApi } from "./posterApi";
export { default as paymentApi } from "./paymentApi";
export { default as subscriptionApi } from "./subscriptionApi";