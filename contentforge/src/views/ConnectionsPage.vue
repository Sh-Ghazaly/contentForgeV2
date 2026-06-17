<template>
  <AppLayout>
    <div class="p-4 sm:p-7 max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">
          {{ t("connections.title") }}
        </h1>
        <p class="text-sm theme-sub mt-1">{{ t("connections.subtitle") }}</p>
      </div>

      <!-- ACTIVE PLATFORMS -->
      <div class="mb-8">
        <h2 class="text-xs font-semibold theme-muted uppercase tracking-wider mb-3">
          {{ t("connections.activePlatforms") }}
        </h2>
        <div class="grid md:grid-cols-2 gap-4">
          <div
            v-for="platform in activePlatforms"
            :key="platform.name"
            class="rounded-2xl theme-surface theme-border p-5 flex flex-col gap-4"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center"
                  :class="[platform.iconBg, platform.iconColor]"
                >
                  <div class="w-5 h-5" v-html="platform.icon"></div>
                </div>
                <div>
                  <p class="font-medium theme-text text-sm">
                    {{ t(platform.nameKey) }}
                  </p>
                  <p class="text-[11px] theme-muted">
                    {{ platform.handle || t("connections.notConnected") }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex items-center gap-1.5">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :class="platform.connected ? 'bg-green-400' : 'bg-slate-600'"
                  ></div>
                  <span
                    class="text-[11px]"
                    :class="platform.connected ? 'text-green-400' : 'theme-muted'"
                  >
                    {{
                      platform.connected
                        ? t("connections.connected")
                        : t("connections.disconnected")
                    }}
                  </span>
                </div>
                <button
                  @click="togglePlatform(platform)"
                  :disabled="platform.loading"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                  :class="
                    platform.connected
                      ? 'bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20'
                      : 'bg-blue-600 text-white hover:bg-blue-500'
                  "
                >
                  <span v-if="platform.loading">...</span>
                  <span v-else>{{
                    platform.connected
                      ? t("connections.disconnect")
                      : t("connections.connect")
                  }}</span>
                </button>
              </div>
            </div>

            <!-- Live stats -->
            <div
              v-if="platform.connected"
              class="mt-2 pt-3 border-t"
              style="border-color: var(--border)"
            >
              <p class="text-[10px] theme-muted mb-2">
                {{ t("connections.liveStats") }}
              </p>
              <div
                class="grid gap-2 text-center"
                :class="statsGridCols(platform.name)"
              >
                <div>
                  <p class="text-sm font-semibold theme-text">
                    {{
                      platformStats[platform.name]?.followers?.toLocaleString() ??
                      "—"
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">
                    {{ t("connections.followers") }}
                  </p>
                </div>
                <div>
                  <p class="text-sm font-semibold theme-text">
                    {{
                      platformStats[platform.name]?.totalPosts?.toLocaleString() ??
                      "—"
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">
                    {{ t("connections.posts") }}
                  </p>
                </div>
                <div v-if="platformStats[platform.name]?.following !== undefined">
                  <p class="text-sm font-semibold theme-text">
                    {{
                      platformStats[platform.name]?.following?.toLocaleString() ??
                      "—"
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">
                    {{ t("connections.following") }}
                  </p>
                </div>
                <div v-if="platformStats[platform.name]?.likes !== undefined">
                  <p class="text-sm font-semibold theme-text">
                    {{
                      platformStats[platform.name]?.likes?.toLocaleString() ?? "—"
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">
                    {{ t("connections.stat.likes") }}
                  </p>
                </div>
                <div v-if="platformStats[platform.name]?.reach !== undefined">
                  <p class="text-sm font-semibold theme-text">
                    {{
                      platformStats[platform.name]?.reach?.toLocaleString() ?? "—"
                    }}
                  </p>
                  <p class="text-[10px] theme-muted">
                    {{ t("connections.stat.reach") }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Permissions -->
            <div
              v-if="platform.connected && platform.permissions?.length"
              class="flex flex-wrap gap-1.5"
            >
              <span
                v-for="p in platform.permissionKeys"
                :key="p"
                class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/15"
              >
                ✓ {{ t(p) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- COMING SOON -->
      <div>
        <h2 class="text-xs font-semibold theme-muted uppercase tracking-wider mb-3">
          {{ t("connections.comingSoonHeader") }}
        </h2>
        <div class="grid grid-cols-2 md:grid-cols-2 gap-4">
          <div
            v-for="platform in comingSoonPlatforms"
            :key="platform.name"
            class="rounded-2xl theme-surface theme-border p-5 flex flex-col gap-3 opacity-50"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="[platform.iconBg, platform.iconColor]"
              >
                <div class="w-5 h-5" v-html="platform.icon"></div>
              </div>
              <div>
                <p class="font-medium theme-text text-sm">
                  {{ t(platform.nameKey) }}
                </p>
                <p class="text-[11px] theme-muted">
                  {{ t("connections.integrationInDev") }}
                </p>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span
                class="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/15"
              >
                🔜 {{ t("connections.comingSoonBadge") }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- CONNECT MODAL -->
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center"
        style="background: rgba(0, 0, 0, 0.6)"
        @click.self="closeModal"
      >
        <div
          class="rounded-2xl theme-surface theme-border p-6 w-full max-w-md mx-4 flex flex-col gap-5"
          style="max-height: 90vh"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div
                class="w-9 h-9 rounded-xl flex items-center justify-center"
                :class="[activePlatform?.iconBg, activePlatform?.iconColor]"
              >
                <div class="w-5 h-5" v-html="activePlatform?.icon"></div>
              </div>
              <div>
                <p class="font-medium theme-text text-sm">
                  {{
                    t("connections.modalTitle", {
                      name: t(activePlatform?.nameKey ?? " "),
                    })
                  }}
                </p>
                <p class="text-[11px] theme-muted">
                  {{ t("connections.modalSubtitle") }}
                </p>
              </div>
            </div>
            <button
              @click="closeModal"
              class="text-xl theme-muted hover:theme-text transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- Dynamic Form Fields -->
          <div class="flex flex-col gap-3 overflow-y-auto" style="max-height: 55vh">
            <div v-for="field in currentFields" :key="field.key">
              <label class="text-xs theme-sub mb-1.5 block">{{
                t(field.labelKey)
              }}</label>
              <input
                v-model="formData[field.key]"
                :type="field.type || 'text'"
                :placeholder="t(field.placeholderKey)"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40 transition-colors"
                style="border-color: var(--border)"
              />
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="flex gap-3 pt-2 border-t" style="border-color: var(--border)">
            <button
              @click="closeModal"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors disabled:opacity-50"
            >
              {{ t("common.cancel") }}
            </button>
B            <button
              @click="submitForm"
              :disabled="isSubmitting"
              class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <span
                v-if="isSubmitting"
                class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              <span>{{
                isSubmitting
                  ? t("connections.connecting")
                  : t("connections.connectConfirm")
              }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import AppLayout from "../components/AppLayout.vue";
import api from "../api/client";
import postsApi from "../api/postsApi";
import { useRoute } from "vue-router";
import { useToast } from "vue-toastification";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const toast = useToast();
const route = useRoute();

const platformStats = ref({ Facebook: null, Instagram: null });
let statsInterval = null;

const showModal = ref(false);
const activePlatform = ref(null);
const formData = ref({});
const isSubmitting = ref(false);

// ── All platforms data ────────────────────────────────────────────────────────
const allPlatforms = ref([
  {
    name: "Instagram",
    nameKey: "connections.platforms.instagram",
    icon: `<svg viewBox="0 0 24 24 " fill="none" class="w-5 h-5"><defs><radialGradient id="ig1" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fdf497"/><stop offset="5%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></radialGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig1)"/><path d="M12 7a5 5 0 100 10A5 5 0 0012 7zm0 8a3 3 0 110-6 3 3 0 010 6z" fill="white"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>`,
    // iconColor: "text-pink-500",
    // iconBg: "bg-pink-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: false,
    permissions: ["Read posts", "Publish", "Analytics"],
    permissionKeys: [
      "connections.permissions.read",
      "connections.permissions.publish",
      "connections.permissions.analytics",
    ],
    stats: [],
  },
  {
    name: "Facebook",
    nameKey: "connections.platforms.facebook",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    iconColor: "text-blue-600",
    // iconBg: "bg-blue-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: false,
    permissions: ["Read", "Publish", "Insights"],
    permissionKeys: [
      "connections.permissions.read",
      "connections.permissions.publish",
      "connections.permissions.insights",
    ],
    stats: [],
  },
  {
    name: "LinkedIn",
    nameKey: "connections.platforms.linkedin",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    // iconColor: "text-blue-700",
    // iconBg: "bg-blue-700/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    permissionKeys: [],
    stats: [],
  },
  {
    name: "Twitter/X",
    nameKey: "connections.platforms.twitter",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
    // iconColor: "text-sky-500",
    // iconBg: "bg-sky-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    permissionKeys: [],
    stats: [],
  },
  {
    name: "TikTok",
    nameKey: "connections.platforms.tiktok",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    // iconColor: "text-rose-500",
    // iconBg: "bg-rose-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    permissionKeys: [],
    stats: [],
  },
  {
    name: "YouTube",
    nameKey: "connections.platforms.youtube",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
    // iconColor: "text-red-600",
    // iconBg: "bg-red-500/15",
    connected: false,
    handle: null,
    loading: false,
    comingSoon: true,
    permissions: [],
    permissionKeys: [],
    stats: [],
  },
]);

const activePlatforms = computed(() =>
  allPlatforms.value.filter((p) => !p.comingSoon),
);
const comingSoonPlatforms = computed(() =>
  allPlatforms.value.filter((p) => p.comingSoon),
);

// ── Platform fields (for manual-connect modal, kept for future use) ───────────
const platformFields = {
  LinkedIn: [
    {
      key: "profileUrl",
      labelKey: "connections.fields.profileUrl",
      placeholderKey: "connections.fields.profileUrlPlaceholder",
      type: "url",
    },
    {
      key: "email",
      labelKey: "connections.fields.email",
      placeholderKey: "connections.fields.emailPlaceholder",
      type: "email",
    },
  ],
  "Twitter/X": [
    {
      key: "username",
      labelKey: "connections.fields.username",
      placeholderKey: "connections.fields.usernamePlaceholder",
      type: "text",
    },
    {
      key: "email",
      labelKey: "connections.fields.email",
      placeholderKey: "connections.fields.emailPlaceholder",
      type: "email",
    },
  ],
  TikTok: [
    {
      key: "username",
      labelKey: "connections.fields.username",
      placeholderKey: "connections.fields.tiktokUsernamePlaceholder",
      type: "text",
    },
    {
      key: "email",
      labelKey: "connections.fields.email",
      placeholderKey: "connections.fields.emailPlaceholder",
      type: "email",
    },
  ],
  YouTube: [
    {
      key: "channelName",
      labelKey: "connections.fields.channelName",
      placeholderKey: "connections.fields.channelNamePlaceholder",
      type: "text",
    },
    {
      key: "email",
      labelKey: "connections.fields.email",
      placeholderKey: "connections.fields.emailPlaceholder",
      type: "email",
    },
  ],
};

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  // Check if we're in the popup after OAuth redirect
  if (window.opener && route.query.success === "true") {
    window.opener.postMessage("oauth-success", "*");
    window.close();
    return;
  }

  await refreshConnections();
  await fetchPlatformStats();

  // Poll stats every 30 seconds
  statsInterval = setInterval(() => {
    fetchPlatformStats();
  }, 30_000);

  // Also refresh connections every 60s
  setInterval(refreshConnections, 60_000);
});

onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval);
});

// ── Data Loading ──────────────────────────────────────────────────────────────
async function refreshConnections() {
  try {
    const data = await api.get("/connections");
    if (data?.connections) {
      data.connections.forEach((conn) => {
        const p = allPlatforms.value.find((x) => x.name === conn.platform);
        if (p) {
          p.connected = conn.connected;
          p.handle = conn.handle || null;
          p.stats = conn.stats || [];
        }
      });
    }
  } catch {
    // backend not reachable — keep current UI state
  }
}

async function fetchPlatformStats() {
  for (const platform of ["facebook", "instagram"]) {
    try {
      const data = await api.get(`/posts/stats/${platform}`);
      const key = platform.charAt(0).toUpperCase() + platform.slice(1);
      platformStats.value[key] = data;
    } catch (err) {
      console.log(`[Stats] ${platform}: not connected or error`, err.message);
    }
  }
}

function statsGridCols(name) {
  const s = platformStats.value[name];
  if (!s) return "grid-cols-2";
  const count = [
    s.followers,
    s.totalPosts,
    s.following,
    s.likes,
    s.reach,
  ].filter((v) => v !== undefined).length;
  if (count <= 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-3";
  return "grid-cols-4";
}
// ── Connect / Disconnect ──────────────────────────────────────────────────────
async function togglePlatform(platform) {
  platform.loading = true;

  try {
    if (!platform.connected) {
      // Facebook & Instagram → Meta OAuth popup
      if (platform.name === "Facebook" || platform.name === "Instagram") {
        const data = await api.get("/connections/meta/auth");
        if (data?.authUrl) {
          const popup = window.open(
            data.authUrl,
            "meta-oauth",
            "width=600,height=700",
          );

          // Listen for success message from popup
          const messageHandler = async (event) => {
            if (event.data === "oauth-success") {
              window.removeEventListener("message", messageHandler);
              popup.close();
              await refreshConnections();
              await fetchPlatformStats();
              toast.success(
                t("connections.toast.connected", { name: t(platform.nameKey) }),
              );
            }
          };
          window.addEventListener("message", messageHandler);

          // Fallback: poll if popup closes without message
          const timer = setInterval(async () => {
            if (popup?.closed) {
              clearInterval(timer);
              window.removeEventListener("message", messageHandler);
              await refreshConnections();
              await fetchPlatformStats();
              platform.loading = false;
            }
          }, 500);
          return;
        }
      }
    } else {
      // Disconnect
      await api.delete(`/connections/${platform.name.toLowerCase()}`);
      platform.connected = false;
      platform.handle = null;
      platform.stats = [];
      platformStats.value[platform.name] = null;
      toast.info(
        t("connections.toast.disconnected", { name: t(platform.nameKey) }),
      );
    }
  } catch (err) {
    console.error(`[${platform.name}] togglePlatform error:`, err);
    toast.error(
      t("connections.toast.error", {
        action: platform.connected
          ? t("connections.disconnect")
          : t("connections.connect"),
        name: t(platform.nameKey),
      }),
    );
  } finally {
    platform.loading = false;
  }
}

// ── Modal form submission (for future manual platforms) ───────────────────────
async function submitForm() {
  if (!activePlatform.value) return;
  isSubmitting.value = true;
  try {
    await api.post("/connections", {
      platform: activePlatform.value.name,
      handle:
        formData.value.username ||
        formData.value.pageName ||
        formData.value.channelName ||
        "",
      email: formData.value.email || null,
      connected: true,
    });
    await refreshConnections();
    closeModal();
    toast.success(
      t("connections.toast.connected", {
        name: t(activePlatform.value.nameKey),
      }),
    );
  } catch (err) {
    console.error("submitForm error:", err);
    toast.error(t("connections.toast.submitError"));
  } finally {
    isSubmitting.value = false;
  }
}
</script>
