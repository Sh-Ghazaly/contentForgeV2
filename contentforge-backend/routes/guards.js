// src/router/guards.js
import { useAuthStore } from "../stores/authStore";

// تعريف صلاحيات كل route
const routePermissions = {
  "/dashboard": { plans: ["free", "pro", "enterprise"] },
  "/drafts": { plans: ["free", "pro", "enterprise"] },
  "/branding": { plans: ["free", "pro", "enterprise"] },
  "/chat": { plans: ["free", "pro", "enterprise"] },
  "/connections": { plans: ["free", "pro", "enterprise"] },
  "/poster": { plans: ["free", "pro", "enterprise"] },
  "/payment": { plans: ["free", "pro", "enterprise"] },
  "/profile": { plans: ["free", "pro", "enterprise"] },

  // صفحات Pro فقط
  "/analytics": { plans: ["pro", "enterprise"] },
  "/reels": { plans: ["enterprise"] },
};

export function setupNavigationGuards(router) {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // التحقق من تسجيل الدخول
    if (!authStore.isAuthenticated && to.path !== "/login") {
      return next("/login");
    }

    // التحقق من صلاحيات الخطة
    const perm = routePermissions[to.path];
    if (perm) {
      const userPlan = authStore.user?.plan || "free";

      if (!perm.plans.includes(userPlan)) {
        // إعادة توجيه لصفحة الدفع مع رسالة
        return next({
          path: "/payment",
          query: {
            upgrade: "true",
            message: `هذه الميزة متاحة لخطط ${perm.plans.join(" و ")} فقط`,
          },
        });
      }
    }

    next();
  });
}
