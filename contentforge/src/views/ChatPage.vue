<!-- ChatPage.vue -->
<template>
  <AppLayout>
    <div class="flex h-full overflow-hidden relative">

      <!-- Left: Chat -->
      <div class="flex-1 flex flex-col min-w-0">

        <!-- Chat header -->
        <div class="px-4 sm:px-6 py-4 border-b theme-glass flex items-center justify-between shrink-0"
          style="border-color: var(--border)">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-sm">
              🧠
            </div>
            <p class="text-sm font-medium theme-text">ContentForge AI</p>
          </div>
          <div class="flex items-center gap-2">
            <button @click="clearChat"
              class="text-xs theme-muted hover:theme-text px-3 py-1.5 rounded-lg theme-card theme-border transition-colors">
              {{ t('chat.clearChat') }}
            </button>
            <!-- Context toggle — mobile only -->
            <button @click="contextOpen = !contextOpen"
              class="lg:hidden text-xs theme-muted hover:theme-text px-3 py-1.5 rounded-lg theme-card theme-border transition-colors flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div ref="msgContainer" class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">

          <!-- Welcome -->
          <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center py-10">
            <div
              class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-2xl mb-4">
              🧠
            </div>
            <h2 class="font-display text-xl font-600 theme-text mb-2">{{ t('chat.welcomeTitle') }}</h2>
            <p class="text-sm theme-sub max-w-md mb-6">
              {{ brandLoaded ? t('chat.brandLoaded', { name: currentBrand.name }) : t('chat.noBrand') }}
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              <button v-for="s in suggestions" :key="s.key" @click="sendSuggestion(t(s.key))"
                class="text-left px-4 py-3 rounded-xl theme-surface theme-border text-xs theme-sub hover:theme-text hover:border-blue-500/30 transition-all">
                {{ t(s.key) }}
              </button>
            </div>
          </div>

          <!-- Message bubbles -->
          <div v-for="msg in messages" :key="msg.id" class="flex gap-3"
            :class="msg.role === 'user' ? 'flex-row-reverse' : ''">
            <div class="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
              :class="msg.role === 'user' ? 'bg-gradient-to-br from-blue-500 to-teal-400 text-white' : 'bg-blue-600/15 text-blue-400'">
              {{ msg.role === 'user' ? userInitial : '🧠' }}
            </div>
            <div class="max-w-[80%] sm:max-w-[75%] flex flex-col gap-1"
              :class="msg.role === 'user' ? 'items-end' : 'items-start'">
              <div v-if="msg.file"
                class="flex items-center gap-2 px-3 py-2 rounded-xl theme-card theme-border text-xs theme-sub mb-1">
                <span>📎</span>{{ msg.file }}
              </div>
              <div class="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                :class="msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-sm' : 'theme-surface theme-border theme-text rounded-tl-sm'">
                <div v-html="formatMsg(msg.content)"></div>
              </div>
              <div v-if="msg.role === 'ai' && msg.error" class="text-[10px] text-rose-400 px-1">
                ⚠ {{ msg.error }}
              </div>
              <span class="text-[10px] theme-muted px-1">{{ msg.time }}</span>
            </div>
          </div>

          <!-- Typing indicator -->
          <div v-if="isTyping" class="flex gap-3">
            <div class="w-7 h-7 rounded-full bg-blue-600/15 flex items-center justify-center text-xs">🧠</div>
            <div class="px-4 py-3 rounded-2xl theme-surface theme-border rounded-tl-sm">
              <div class="flex gap-1 items-center h-4">
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:0ms"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:150ms"></div>
                <div class="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style="animation-delay:300ms"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Input bar -->
        <div class="px-4 sm:px-6 py-4 border-t shrink-0" style="border-color: var(--border)">
          <div v-if="attachedFiles.length" class="flex gap-2 flex-wrap mb-3">
            <div v-for="(f, i) in attachedFiles" :key="i"
              class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-600/10 text-blue-400 text-xs border border-blue-500/20">
              <span>📎</span>{{ f }}
              <button @click="attachedFiles.splice(i, 1)" class="ml-1 hover:text-blue-200">×</button>
            </div>
          </div>
          <div class="flex gap-2 sm:gap-3 items-end">
            <label
              class="w-9 h-9 rounded-xl theme-card theme-border flex items-center justify-center theme-muted hover:theme-text cursor-pointer transition-colors shrink-0">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              <input type="file" class="hidden" @change="handleFileAttach" multiple
                accept=".pdf,.png,.jpg,.txt,.doc,.docx" />
            </label>
            <textarea v-model="input" @keydown.enter.exact.prevent="sendMessage"
              :placeholder="t('chat.inputPlaceholder')" rows="1"
              class="flex-1 theme-input rounded-xl px-4 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40 resize-none transition-colors"
              style="border-color: var(--border); min-height: 42px; max-height: 120px;" @input="autoGrow"></textarea>
            <button @click="sendMessage" :disabled="(!input.trim() && !attachedFiles.length) || isTyping"
              class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white hover:bg-blue-500 transition-colors shrink-0 disabled:opacity-40">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p class="text-[10px] theme-muted mt-2 text-center">{{ t('chat.sendHint') }}</p>
        </div>
      </div>

      <!-- Mobile backdrop — no change needed -->
      <Transition name="fade">
        <div v-if="contextOpen" class="fixed inset-0 z-30 bg-black/50 lg:hidden" @click="contextOpen = false" />
      </Transition>

      <!-- Right: Context panel -->
      <div
        class="fixed lg:relative top-0 h-full z-40 lg:z-auto w-72 lg:w-64 border-l shrink-0 overflow-y-auto lg:p-4 p-4 pt-16 space-y-4 scrollbar-thin transition-transform duration-300 theme-sidebar"
        :class="[
          locale === 'ar' ? 'left-0 border-r border-l-0' : 'right-0 border-l border-r-0',
          contextOpen || isLargeScreen ? 'translate-x-0' : (locale === 'ar' ? '-translate-x-full' : 'translate-x-full')
        ]" style="border-color: var(--border)">

        <!-- Close — mobile only -->
        <div class="flex items-center justify-between lg:hidden mb-4 pb-3 border-b" style="border-color: var(--border)">
          <p class="text-xs font-semibold theme-text">{{ t('chat.brandContext') }}</p>
          <button @click="contextOpen = false"
            class="w-7 h-7 rounded-lg theme-card theme-border flex items-center justify-center theme-muted hover:theme-text transition-colors">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Brand context -->
        <div class="rounded-xl theme-surface theme-border p-4">
          <p class="text-xs font-medium theme-text mb-3">🧠 {{ t('chat.brandContext') }}</p>
          <div v-if="brandLoaded" class="space-y-2">
            <div v-for="ctx in brandContext" :key="ctx.labelKey" class="flex items-center justify-between">
              <span class="text-[11px] theme-sub">{{ t(ctx.labelKey) }}</span>
              <span class="text-[11px] font-medium" :class="ctx.color">{{ ctx.value }}</span>
            </div>
            <div class="mt-3 pt-3 border-t" style="border-color: var(--border)">
              <p class="text-[10px] theme-muted">
                {{ t('chat.ragChunks') }}:
                <span class="text-blue-400 font-medium">{{ ragChunks }} {{ t('chat.stored') }}</span>
              </p>
            </div>
          </div>
          <div v-else class="text-[11px] theme-muted space-y-2">
            <p>{{ t('chat.noBrandLoaded') }}</p>
            <router-link to="/branding" class="text-blue-400 hover:underline text-[11px]">
              → {{ t('chat.setupBrandVault') }}
            </router-link>
          </div>
        </div>

        <!-- Quick prompts -->
        <div class="rounded-xl theme-surface theme-border p-4">
          <p class="text-xs font-medium theme-text mb-3">⚡ {{ t('chat.quickPrompts') }}</p>
          <div class="space-y-1.5">
            <button v-for="p in quickPrompts" :key="p.key" @click="sendSuggestion(t(p.key)); contextOpen = false"
              class="w-full text-left px-3 py-2 rounded-lg theme-card theme-border text-[11px] theme-sub hover:theme-text hover:border-blue-500/20 transition-all">
              {{ t(p.key) }}
            </button>
          </div>
        </div>

        <!-- Past Conversations -->
        <div class="rounded-xl theme-surface theme-border p-4">
          <p class="text-xs font-medium theme-text mb-3">🕘 {{ t('chat.pastConversations') }}</p>
          <div v-if="pastConversations.length" class="space-y-1.5">
            <button v-for="conv in pastConversations" :key="conv._id"
              @click="loadConversation(conv._id); contextOpen = false"
              class="w-full text-left px-3 py-2 rounded-lg theme-card theme-border text-[11px] theme-sub hover:theme-text hover:border-blue-500/20 transition-all truncate"
              :class="conv._id === conversationId ? 'border-blue-500/30 text-blue-400' : ''">
              {{ conv.preview }}
            </button>
          </div>
          <p v-else class="text-[11px] theme-muted">{{ t('chat.noPastConversations') }}</p>
          <button @click="clearChat"
            class="mt-3 w-full text-[11px] theme-muted hover:theme-text py-1.5 rounded-lg theme-card theme-border transition-colors">
            {{ t('chat.newConversation') }}
          </button>
        </div>
      </div>

    </div>

    <!-- Upload modal -->
    <div v-if="showUpload"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div class="theme-surface rounded-t-2xl sm:rounded-2xl theme-border max-w-md w-full p-6 sm:p-7 theme-shadow">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-lg font-600 theme-text">{{ t('chat.uploadModalTitle') }}</h2>
          <button @click="showUpload = false" class="theme-muted hover:theme-text">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div
          class="border-2 border-dashed rounded-2xl p-8 text-center mb-4 cursor-pointer hover:border-blue-500/40 transition-colors"
          style="border-color: var(--border)" @dragover.prevent @drop.prevent="handleDrop">
          <div class="text-3xl mb-3">📂</div>
          <p class="text-sm font-medium theme-text mb-1">{{ t('chat.uploadDropHint') }}</p>
          <p class="text-xs theme-muted mb-4">{{ t('chat.uploadFormats') }}</p>
          <label
            class="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 cursor-pointer transition-colors">
            {{ t('chat.browseFiles') }}
            <input type="file" class="hidden" multiple @change="handleModalUpload" />
          </label>
        </div>
        <div v-if="pendingFiles.length" class="space-y-2 mb-4">
          <div v-for="f in pendingFiles" :key="f"
            class="flex items-center gap-2 px-3 py-2 rounded-lg theme-card theme-border text-xs theme-sub">
            <span>📄</span>{{ f }}
          </div>
        </div>
        <div class="flex gap-3">
          <button @click="showUpload = false"
            class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors">
            {{ t('common.cancel') }}
          </button>
          <button @click="confirmUpload" :disabled="!pendingFiles.length"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors disabled:opacity-50">
            {{ t('chat.uploadAndEmbed') }}
          </button>
        </div>
      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import AppLayout from "../components/AppLayout.vue";
import api from "../api/client";
import { useI18n } from "vue-i18n";
import brandApi from "../api/brandApi";
import { useLang } from '../composables/useLang.js'


const { locale } = useLang()
const { t } = useI18n();


// ── State ─────────────────────────────────────────────────────────────────────
const input = ref("");
const isTyping = ref(false);
const showUpload = ref(false);
const attachedFiles = ref([]);
const pendingFiles = ref([]);
const msgContainer = ref(null);
const messages = ref([]);
// const sessionFiles = ref([]);
const currentBrand = ref(null);
const brandLoaded = ref(false);
const ragChunks = ref(0);
const userInitial = ref("U");
const contextOpen = ref(false);
const isLargeScreen = ref(window.innerWidth >= 1024);

// ✅ Persist conversationId across page refreshes within the same tab session
const storedConvId = sessionStorage.getItem("cf_conversationId") || crypto.randomUUID();
sessionStorage.setItem("cf_conversationId", storedConvId);
const conversationId = ref(storedConvId);

// Past conversations list for the sidebar
const pastConversations = ref([]);

// chat history نبعته للـ API عشان Gemini يتذكر المحادثة
const chatHistory = ref([]);

function onResize() { isLargeScreen.value = window.innerWidth >= 1024 }
onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// ── Brand context — labelKey instead of hardcoded label ───────────────────────
const brandContext = computed(() => {
  if (!currentBrand.value) return [];
  return [
    { labelKey: "chat.brand", value: currentBrand.value.name, color: "theme-text" },
    { labelKey: "chat.dialect", value: currentBrand.value.dialects?.[0] || "—", color: "text-blue-400" },
    { labelKey: "chat.tone", value: currentBrand.value.tones?.slice(0, 2).join(", ") || "—", color: "text-teal-400" },
    { labelKey: "chat.industry", value: currentBrand.value.industry || "—", color: "theme-muted" },
  ];
});

// ── Suggestions & quick prompts — i18n key objects ────────────────────────────
const suggestions = [
  { key: "chat.suggestion1" },
  { key: "chat.suggestion2" },
  { key: "chat.suggestion3" },
  { key: "chat.suggestion4" },
  { key: "chat.suggestion5" },
  { key: "chat.suggestion6" },
];

const quickPrompts = [
  { key: "chat.prompt1" },
  { key: "chat.prompt2" },
  { key: "chat.prompt3" },
  { key: "chat.prompt4" },
  { key: "chat.prompt5" },
  { key: "chat.prompt6" },
];

// ── Load brand on mount ───────────────────────────────────────────────────────
// onMounted(async () => {
//   // جيب الـ user initial من الـ auth
//   try {
//     const me = await api.get("/auth/me");
//     userInitial.value = me?.user?.name?.charAt(0).toUpperCase() || "U";
//   } catch {}

//   // جيب الـ brand
//   let brandId = null;
//   try {
//     const brands = await brandApi.getMyBrands();
//     if (brands?.length) {
//       currentBrand.value = brands[0];
//       brandLoaded.value = true;
//       ragChunks.value = brands[0].ragChunks?.length || 0;
//       brandId = brands[0]._id.toString(); // ✅ ensure plain string, not ObjectId object
//       localStorage.setItem("cf_brandId", brandId);
//     }
//   } catch {}

//   // ✅ Load existing messages for the current conversationId
//   try {
//     if (brandId) {
//       const { messages: history } = await api.get(
//         `/chat/history/${conversationId.value}`
//       );
//       if (history?.length) {
//         messages.value = history.map((m) => ({
//           id: m._id,
//           role: m.sender, // "user" | "ai"
//           time: new Date(m.createdAt).toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//           content: m.content,
//         }));
//       }
//     }
//   } catch {}

//   // ✅ Load past conversations list for the sidebar
//   // try {
//     if (brandId) {
//       // 1. Show cached conversations instantly from localStorage
//       const cached = localStorage.getItem("cf_conversations");
//       if (cached) {
//         try {
//           pastConversations.value = JSON.parse(cached);
//         } 
//         catch {
//           pastConversations.value = [];
//         }
//       }

//       // 2. Fetch fresh from API and update both UI + localStorage
//           try {
//         const { conversations } = await api.get(
//           `/chat/conversations/${brandId}`
//         );

//         if (conversations?.length) {
//           pastConversations.value = conversations;

//           // update cache
//           localStorage.setItem(
//             "cf_conversations",
//             JSON.stringify(conversations)
//           );
//         }
//       } catch (err) {
//         console.error("Failed to refresh conversations", err);
//       }
//     }

//   // Show welcome message only if no history was loaded
//   if (messages.value.length === 0) {
//     if (brandLoaded.value) {
//       messages.value.push({
//         id: 1,
//         role: "ai",
//         time: now(),
//         content: `مرحباً! I'm your ContentForge AI — I have your **${
//           currentBrand.value.name
//         }** brand voice loaded (${
//           currentBrand.value.dialects?.[0] || "Arabic"
//         }). Ask me to generate posts, plan a campaign, or analyze your content.`,
//       });
//     } else {
//       messages.value.push({
//         id: 1,
//         role: "ai",
//         time: now(),
//         content:
//           "مرحباً! I'm ContentForge AI. It looks like you haven't set up your Brand Vault yet. Head to the Brand Vault page to upload your brand guidelines and get personalized content.",
//       });
//     }
//   }
// });

onMounted(async () => {

  window.addEventListener('resize', onResize)

  let brandId = localStorage.getItem("cf_brandId");

  // 🧠 1. LOAD CACHE FIRST (always instant)
  const cacheKey = `cf_conversations_${brandId}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      pastConversations.value = JSON.parse(cached);
    } catch {
      pastConversations.value = [];
    }
  }

  // 🧠 2. IF NO BRAND → fetch brand
  if (!brandId) {
    try {
      const brands = await brandApi.getMyBrands();
      if (brands?.length) {
        brandId = brands[0]._id.toString();
        localStorage.setItem("cf_brandId", brandId);
        currentBrand.value = brands[0];
        brandLoaded.value = true;
      }
    } catch { }
  }

  // 🧠 3. FETCH LATEST FROM API
  if (brandId) {
    try {
      const { conversations } = await api.get(
        `/chat/conversations/${brandId}`
      );

      pastConversations.value = conversations || [];

      localStorage.setItem(
        cacheKey,
        JSON.stringify(pastConversations.value)
      );
    } catch (err) {
      console.error(err);
    }
  }
});
// ── Send message → Gemini API ─────────────────────────────────────────────────
async function sendMessage() {
  if (!input.value.trim() && !attachedFiles.value.length) return;

  const userText = input.value || t('chat.seeAttachedFile');
  const file = attachedFiles.value[0] || null;

  messages.value.push({ id: Date.now(), role: "user", time: now(), content: userText, file });
  chatHistory.value.push({ role: "user", content: userText });

  input.value = "";
  attachedFiles.value = [];
  isTyping.value = true;
  await nextTick();
  scrollBottom();

  try {
    const brandId = localStorage.getItem("cf_brandId") || null;
    const data = await api.post("/chat", {
      message: userText,
      brandId,
      conversationId: conversationId.value,
    });

    const reply = data.reply || t('chat.errorNoResponse');

    messages.value.push({ id: Date.now() + 1, role: "ai", time: now(), content: reply });
    chatHistory.value.push({ role: "ai", content: reply });

    if (brandId) {
      try {
        const { conversations } = await api.get(`/chat/conversations/${brandId}`);
        pastConversations.value = conversations || [];
        localStorage.setItem("cf_conversations", JSON.stringify(pastConversations.value));
      } catch { }
    }
  } catch (err) {
    messages.value.push({
      id: Date.now() + 1,
      role: "ai",
      time: now(),
      content: t('chat.errorNoResponse'),
      error: err.message || t('chat.errorBackendOffline'),
    });
  } finally {
    isTyping.value = false;
    await nextTick();
    scrollBottom();
  }
}

// ── Load a past conversation ──────────────────────────────────────────────────
async function loadConversation(id) {
  conversationId.value = id;
  sessionStorage.setItem("cf_conversationId", id);
  chatHistory.value = [];
  try {
    const { messages: history } = await api.get(`/chat/history/${id}`);
    messages.value = (history || []).map((m) => ({
      id: m._id,
      role: m.sender,
      time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      content: m.content,
    }));
    await nextTick();
    scrollBottom();
  } catch { }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function sendSuggestion(s) {
  input.value = s;
  sendMessage();
}

function clearChat() {
  messages.value = [];
  chatHistory.value = [];
  const newId = crypto.randomUUID();
  conversationId.value = newId;
  sessionStorage.setItem("cf_conversationId", newId);
  if (brandLoaded.value) {
    messages.value.push({
      id: Date.now(),
      role: "ai",
      time: now(),
      content: t('chat.clearWelcome', { name: currentBrand.value.name }),
    });
  }
}

function scrollBottom() {
  if (msgContainer.value)
    msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
}
function now() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function formatMsg(text) {
  return text
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}
function autoGrow(e) {
  e.target.style.height = "auto";
  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
}

function handleFileAttach(e) {
  [...e.target.files].forEach((f) => attachedFiles.value.push(f.name));
  e.target.value = "";
}
function handleSideUpload(e) {
  [...e.target.files].forEach((f) =>
    sessionFiles.value.unshift({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(1) + " MB",
      icon: "📄",
    })
  );
  e.target.value = "";
}
function handleModalUpload(e) {
  [...e.target.files].forEach((f) => pendingFiles.value.push(f.name));
  e.target.value = "";
}
function handleDrop(e) {
  [...e.dataTransfer.files].forEach((f) => pendingFiles.value.push(f.name));
}

// async function confirmUpload() {
//   // أضيف للـ session files
//   pendingFiles.value.forEach((n) =>
//     sessionFiles.value.unshift({ name: n, size: "—", icon: "📄" })
//   );

//   // لو في brandId ارفع للـ backend
//   const brandId = localStorage.getItem("cf_brandId");
//   if (brandId && pendingFiles.value.length) {
//     try {
//       await brandApi.uploadGuidelines(brandId, pendingFiles.value[0]);
//     } catch {}
//   }

//   pendingFiles.value = [];
//   showUpload.value = false;
// }
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>