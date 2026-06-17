import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { createPinia } from "pinia";
import App from "./App.vue";
import i18n from "./locales/i18n.js";
import "./style.css";

import LandingPage from "./views/LandingPage.vue";
import DashboardPreview from "./views/DashboardPreview.vue";
import PostsManagerPage from "./views/PostsManagerPage.vue";
import BrandingPage from "./views/BrandingPage.vue";
import ChatPage from "./views/ChatPage.vue";
import ConnectionsPage from "./views/ConnectionsPage.vue";
import PosterGen from "./views/PosterGenerator.vue";
import LoginPage from "./views/LoginPage.vue";
import TrialExpiredPage from "./views/TrialExpiredPage.vue";
import PaymentPage from "./views/PaymentPage.vue";
import PaymentSuccessPage from "./views/PaymentSuccessPage.vue";
import PaymentCancelPage from "./views/PaymentCancelPage.vue";
import ContactPage from "./views/ContactPage.vue";
import Profile from "./views/Profile.vue";

import AdminLayout from "./views/admin/AdminLayout.vue";
import AdminDashboard from "./views/admin/AdminDashboard.vue";
import AdminUsers from "./views/admin/AdminUsers.vue";
import AdminTrends from "./views/admin/AdminTrends.vue";
import AdminPlans from "./views/admin/AdminPlans.vue";
import AdminSettings from "./views/admin/AdminSettings.vue";
import LoginSuccessPage from "./views/LoginSuccess.vue";
import AiReelsPage from "./views/AiReelPage.vue";

// ── Router ────────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: LandingPage },
    { path: "/login", component: LoginPage },
    { path: "/login-success", component: LoginSuccessPage },
    {
      path: "/dashboard",
      component: DashboardPreview,
      meta: { requiresAuth: true },
    },
    {
      path: "/drafts",
      component: PostsManagerPage,
      meta: { requiresAuth: true },
    },
    {
      path: "/branding",
      component: BrandingPage,
      meta: { requiresAuth: true },
    },
    { path: "/chat", component: ChatPage, meta: { requiresAuth: true } },
    {
      path: "/connections",
      component: ConnectionsPage,
      meta: { requiresAuth: true },
    },
    { path: "/poster", component: PosterGen },
    { path: "/trial-expired", component: TrialExpiredPage },
    { path: "/payment", component: PaymentPage, meta: { requiresAuth: true } },
    {
      path: "/payment/success",
      component: PaymentSuccessPage,
      meta: { requiresAuth: true },
    },
    { path: "/payment/cancel", component: PaymentCancelPage },
    {
      path: "/admin",
      component: AdminLayout,
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: "", component: AdminDashboard },
        { path: "users", component: AdminUsers },
        { path: "trends", component: AdminTrends },
        { path: "plans", component: AdminPlans },
        { path: "settings", component: AdminSettings },
      ],
    },
    { path: "/ai-reels", component: AiReelsPage, meta: { requiresAuth: true } },
    { path: "/contact", component: ContactPage },
    {
      path: "/profile",
      name: "Profile",
      component: Profile,
      meta: { requiresAuth: true },
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: "smooth" };
    return { top: 0 };
  },
});

// ── Route guard — redirect to login if not authenticated ──────────────────────
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem("cf_token");
  const user = JSON.parse(localStorage.getItem("cf_user") || "null");

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next("/login");
  } else if (to.meta.requiresAdmin && !user?.isAdmin) {
    return next("/dashboard");
  } else {
    next();
  }
});

// ── Persist theme on startup ──────────────────────────────────────────────────
const saved = localStorage.getItem("cf-theme") || "dark";
document.documentElement.classList.add(saved);

// ── Mount app ─────────────────────────────────────────────────────────────────
const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);

// ── Persist locale on startup ─────────────────────────────────────────────────
const savedLocale = localStorage.getItem("cf-locale") || "en";
i18n.global.locale.value = savedLocale;
document.documentElement.setAttribute(
  "dir",
  savedLocale === "ar" ? "rtl" : "ltr",
);
document.documentElement.setAttribute("lang", savedLocale);

app.mount("#app");
