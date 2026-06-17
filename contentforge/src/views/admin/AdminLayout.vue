<template>
  <div class="admin-shell" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- Sidebar -->
    <aside
      class="admin-sidebar"
      :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileSidebarOpen }"
    >
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon" v-show="!sidebarCollapsed">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L7 12L13 4"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="brand-name" v-show="!sidebarCollapsed"
            >ContentForge</span
          >
        </div>
        <button class="collapse-btn" @click="handleCollapseClick">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path v-if="!sidebarCollapsed" d="M15 18l-6-6 6-6" />
            <path v-else d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :title="item.label"
          active-class="router-link-active"
          exact-active-class="router-link-active"
          @click="mobileSidebarOpen = false"
        >
          <span class="nav-icon" v-html="item.icon"></span>
          <span class="nav-label" v-show="!sidebarCollapsed">{{
            item.label
          }}</span>
          <span v-if="item.badge && !sidebarCollapsed" class="nav-badge">{{
            item.badge
          }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar-footer" v-show="!sidebarCollapsed">
        <div class="admin-user">
          <div class="admin-avatar">{{ userInitial }}</div>
          <div class="admin-info">
            <p class="admin-name">{{ userName }}</p>
            <p class="admin-role">{{ t("admin.administrator") }}</p>
          </div>
        </div>
        <button
          @click="authStore.logout()"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-slate-400 hover:text-rose-400 transition-colors w-full mt-2"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {{ t("admin.logout") }}
        </button>
      </div>
    </aside>

    <!-- Mobile backdrop -->
    <div
      v-if="mobileSidebarOpen"
      class="mobile-backdrop"
      @click="mobileSidebarOpen = false"
    ></div>

    <!-- Main -->
    <div class="admin-main">
      <header class="admin-topbar">
        <div class="topbar-left">
          <!-- Mobile hamburger -->
          <button
            class="mobile-menu-btn"
            @click="mobileSidebarOpen = !mobileSidebarOpen"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>

          <div class="page-info">
            <h1 class="page-title">{{ currentPageTitle }}</h1>
            <p class="page-sub">{{ currentPageSub }}</p>
          </div>
        </div>
        <div class="topbar-right">
          <!-- Language switcher -->
          <button @click="switchLang" class="admin-topbar-btn">
            <svg
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"
              />
            </svg>
            <span class="hidden sm:inline">{{
              locale === "en" ? "عربي" : "English"
            }}</span>
            <span class="sm:hidden">{{ locale === "en" ? "ع" : "EN" }}</span>
          </button>

          <!-- Light/Dark toggle -->
          <button
            @click="toggleTheme"
            class="admin-topbar-btn admin-topbar-btn-icon"
            :title="isDark ? t('admin.switchLight') : t('admin.switchDark')"
          >
            <svg
              v-if="isDark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <svg
              v-else
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>

          <!-- Notifications -->
          <div class="relative">
            <button
              @click="showNotifDropdown = !showNotifDropdown"
              class="w-8 h-8 rounded-xl theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors shrink-0 relative"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center"
              >
                {{ unreadCount > 9 ? "9+" : unreadCount }}
              </span>
            </button>

            <!-- Dropdown -->
            <Transition name="dropdown-fade">
              <div
                v-if="showNotifDropdown"
                class="absolute top-full mt-2 w-80 rounded-xl theme-surface theme-border shadow-xl overflow-hidden z-50"
                :class="locale === 'ar' ? 'left-0' : 'right-0'"
                style="border: 1px solid var(--border)"
              >
                <div
                  class="flex items-center justify-between px-4 py-2.5 border-b"
                  style="border-color: var(--border)"
                >
                  <p class="text-xs font-semibold theme-text">
                    {{ t("layout.notifications.title") || "Notifications" }}
                  </p>
                  <button
                    v-if="unreadCount > 0"
                    @click="markAllRead"
                    class="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {{
                      t("layout.notifications.markAllRead") || "Mark all read"
                    }}
                  </button>
                </div>

                <div class="max-h-80 overflow-y-auto">
                  <div
                    v-if="notifications.length === 0"
                    class="px-4 py-8 text-center"
                  >
                    <p class="text-xs theme-muted">
                      {{
                        t("layout.notifications.empty") || "No notifications"
                      }}
                    </p>
                  </div>

                  <div
                    v-for="notif in notifications"
                    :key="notif._id || notif.id"
                    class="px-4 py-3 border-b cursor-pointer transition-colors group relative"
                    :class="[
                      !notif.read ? 'bg-blue-500/5' : '',
                      'hover:bg-blue-500/5',
                    ]"
                    style="border-color: var(--border)"
                    @click="handleNotifClick(notif._id || notif.id)"
                  >
                    <div class="flex items-start gap-2.5">
                      <div
                        class="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        :class="notif.read ? 'bg-transparent' : 'bg-blue-400'"
                      ></div>
                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-medium theme-text truncate">
                          {{ notif.title }}
                        </p>
                        <p
                          class="text-[11px] theme-sub mt-0.5"
                          :class="
                            expandedNotifId === (notif._id || notif.id)
                              ? ''
                              : 'line-clamp-2'
                          "
                        >
                          {{ notif.message }}
                        </p>
                        <p class="text-[10px] theme-muted mt-1">
                          {{
                            notif.time ||
                            new Date(notif.createdAt).toLocaleDateString()
                          }}
                        </p>
                      </div>
                      <button
                        @click.stop="deleteNotif(notif._id || notif.id)"
                        class="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-300 transition-opacity shrink-0"
                      >
                        <svg
                          class="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </header>

      <main class="admin-content">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import api from "../../api/client";

// Theme & Language
import { useTheme } from "../../composables/useTheme.js";
import { useLang } from "../../composables/useLang.js";
import { useI18n } from "vue-i18n";

const { isDark, toggle: toggleTheme } = useTheme();
const { locale, switchLang } = useLang();
const { t } = useI18n();

const auth = useAuthStore();
const sidebarCollapsed = ref(false);
const mobileSidebarOpen = ref(false);
const currentTime = ref("");
const route = useRoute();
const router = useRouter();

// Close mobile sidebar on route change
watch(
  () => route.path,
  () => {
    mobileSidebarOpen.value = false;
  },
);

const showNotifDropdown = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
const notifLoading = ref(false);
const expandedNotifId = ref(null);

// Handle notification click: expand on first click, mark read on second
function handleNotifClick(notifId) {
  if (expandedNotifId.value === notifId) {
    // Already expanded → mark as read
    if (!notifications.value.find((x) => (x._id || x.id) === notifId)?.read) {
      markRead(notifId);
    }
    expandedNotifId.value = null;
  } else {
    // Expand it
    expandedNotifId.value = notifId;
  }
}

async function fetchNotifications() {
  notifLoading.value = true;
  try {
    const res = await api.get("/notifications");
    notifications.value = res.notifications || [];
    unreadCount.value = res.unreadCount || 0;
  } catch (err) {
    console.error("Admin notifications fetch error:", err);
  } finally {
    notifLoading.value = false;
  }
}

async function markRead(notifId) {
  try {
    await api.patch(`/notifications/${notifId}/read`);
    const n = notifications.value.find(
      (x) => x._id === notifId || x.id === notifId,
    );
    if (n) {
      n.read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    }
  } catch (err) {
    console.error("Mark read failed:", err);
  }
}

async function markAllRead() {
  try {
    await api.patch("/notifications/read-all");
    notifications.value.forEach((n) => (n.read = true));
    unreadCount.value = 0;
  } catch (err) {
    console.error("Mark all read failed:", err);
  }
}

async function deleteNotif(notifId) {
  try {
    await api.delete(`/notifications/${notifId}`);
    notifications.value = notifications.value.filter(
      (x) => (x._id || x.id) !== notifId,
    );
    unreadCount.value = notifications.value.filter((n) => !n.read).length;
  } catch (err) {
    console.error("Delete notification failed:", err);
  }
}

// Poll every 30 seconds
let notifInterval;
onMounted(() => {
  fetchNotifications();
  notifInterval = setInterval(fetchNotifications, 30000);
});
onUnmounted(() => {
  if (notifInterval) clearInterval(notifInterval);
});

const userName = computed(() => auth.userName);
const userInitial = computed(() => auth.userInitial);
const authStore = useAuthStore();

const navItems = computed(() => [
  {
    path: "/admin",
    label: t("admin.dashboard"),
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  },
  {
    path: "/admin/users",
    label: t("admin.users"),
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
  },
  {
    path: "/admin/trends",
    label: t("admin.trends"),
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>`,
  },
  {
    path: "/admin/plans",
    label: t("admin.plansTrials"),
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>`,
  },
  {
    path: "/admin/settings",
    label: t("admin.settings"),
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
  },
]);

const pageMeta = computed(() => ({
  "/admin": { title: t("admin.dashboard"), sub: t("admin.dashboardSub") },
  "/admin/users": { title: t("admin.users"), sub: t("admin.usersSub") },
  "/admin/trends": { title: t("admin.trends"), sub: t("admin.trendsSub") },
  "/admin/plans": { title: t("admin.plansTrials"), sub: t("admin.plansSub") },
  "/admin/settings": {
    title: t("admin.settings"),
    sub: t("admin.settingsSub"),
  },
}));

const currentPageTitle = computed(
  () => pageMeta.value[route.path]?.title || t("admin.admin"),
);
const currentPageSub = computed(() => pageMeta.value[route.path]?.sub || "");

let timer;
onMounted(() => {
  const tick = () => {
    currentTime.value = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  tick();
  timer = setInterval(tick, 60000);
});
onUnmounted(() => clearInterval(timer));

function handleCollapseClick() {
  if (window.innerWidth < 768) {
    mobileSidebarOpen.value = false;
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }
}
</script>

<style scoped>
.admin-shell {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
  font-family: "DM Sans", sans-serif;
}

:root.dark .admin-shell {
  background: #0d0f14;
}

/* ── Sidebar ── */
.admin-sidebar {
  width: 240px;
  min-height: 100vh;
  background: #f1f5f9;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition:
    width 0.25s ease,
    transform 0.3s ease;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
}

:root.dark .admin-sidebar {
  background: #13151c;
  border-right-color: rgba(255, 255, 255, 0.06);
}

[dir="rtl"] .admin-sidebar {
  border-right: none;
  border-left: 1px solid #e2e8f0;
}

:root.dark [dir="rtl"] .admin-sidebar {
  border-left-color: rgba(255, 255, 255, 0.06);
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem;
  border-bottom: 1px solid #e2e8f0;
}

:root.dark .sidebar-header {
  border-bottom-color: rgba(255, 255, 255, 0.06);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.brand-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3b82f6, #14b8a6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
}

:root.dark .brand-name {
  color: #f0f2f5;
}

.collapse-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
  border-radius: 6px;
  flex-shrink: 0;
}

:root.dark .collapse-btn {
  color: #6b7280;
}

.collapse-btn:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.05);
}

:root.dark .collapse-btn:hover {
  color: #f0f2f5;
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-badge {
  margin: 0.75rem 1rem;
  padding: 3px 10px;
  background: rgba(59, 130, 246, 0.12);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 20px;
  font-size: 11px;
  color: #3b82f6;
  text-align: center;
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 10px;
  margin-bottom: 2px;
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s ease;
  white-space: nowrap;
  overflow: hidden;
}

:root.dark .nav-item {
  color: #6b7280;
}

.nav-item:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.05);
}

:root.dark .nav-item:hover {
  color: #f0f2f5;
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.router-link-active {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
}

.nav-badge {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  font-weight: 600;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

:root.dark .sidebar-footer {
  border-top-color: rgba(255, 255, 255, 0.06);
}

.admin-user {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.admin-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.admin-name {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  margin: 0;
}

.admin-role {
  font-size: 11px;
  color: #6b7280;
  margin: 0;
}

:root.dark .admin-name {
  color: #f0f2f5;
}

:root.dark .admin-role {
  color: #6b7280;
}

/* ── Main ── */
.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f1f5f9;
  position: sticky;
  top: 0;
  z-index: 10;
}

:root.dark .admin-topbar {
  border-bottom-color: rgba(255, 255, 255, 0.06);
  background: #13151c;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.page-sub {
  font-size: 12px;
  color: #6b7280;
  margin: 2px 0 0;
}

:root.dark .page-title {
  color: #f0f2f5;
}

:root.dark .page-sub {
  color: #6b7280;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* ── Mobile Menu Button ── */
.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  padding: 6px;
  cursor: pointer;
  color: #6b7280;
  border-radius: 6px;
  transition: all 0.15s ease;
}

:root.dark .mobile-menu-btn {
  color: #6b7280;
}

.mobile-menu-btn:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.05);
}

:root.dark .mobile-menu-btn:hover {
  color: #f0f2f5;
  background: rgba(255, 255, 255, 0.05);
}

/* ── Mobile Backdrop ── */
.mobile-backdrop {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  backdrop-filter: blur(2px);
}

/* ── Admin Topbar Buttons ── */
.admin-topbar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 10px;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

:root.dark .admin-topbar-btn {
  border-color: rgba(255, 255, 255, 0.06);
  color: #6b7280;
}

.admin-topbar-btn:hover {
  color: #0f172a;
  background: rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

:root.dark .admin-topbar-btn:hover {
  color: #f0f2f5;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.admin-topbar-btn svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.admin-topbar-btn-icon {
  padding: 6px 8px;
}

/* Dropdown transition */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.admin-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.page-info {
  display: flex;
  flex-direction: column;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  [dir="rtl"] .admin-sidebar {
    left: auto;
    right: 0;
    transform: translateX(100%);
  }

  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }

  .mobile-backdrop {
    display: block;
  }

  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .admin-topbar {
    padding: 1rem;
  }

  .page-title {
    font-size: 16px;
  }

  .admin-content {
    padding: 1rem;
  }
}
</style>
