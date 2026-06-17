<!-- PostsManagerPage.vue -->
<template>
  <AppLayout>
    <div class="p-4 sm:p-7">
      <!-- Header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7"
      >
        <div>
          <h1 class="font-display text-xl font-600 theme-text">
            {{ t("posts.title") }}
          </h1>
          <p class="text-xs theme-sub mt-0.5">
            {{ t("posts.subtitle", { count: filteredPosts.length }) }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <!-- Status filter tabs -->
          <div
            class="flex items-center gap-1 p-1 rounded-xl theme-card theme-border overflow-x-auto"
          >
            <button
              v-for="f in filters"
              :key="f.value"
              @click="activeFilter = f.value"
              class="px-2.5 sm:px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap"
              :class="
                activeFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'theme-sub hover:theme-text'
              "
            >
              {{ t(f.labelKey) }}
              <span
                v-if="statusCount(f.value) > 0"
                class="ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium"
                :class="
                  activeFilter === f.value
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-500/20 theme-muted'
                "
              >
                {{ statusCount(f.value) }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Bulk actions bar -->
      <div
        v-if="selected.length"
        class="mb-5 flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-blue-600/10 border border-blue-500/20"
      >
        <span class="text-xs text-blue-400 font-medium">{{
          t("posts.selected", { count: selected.length })
        }}</span>
        <button
          @click="approveSelected"
          class="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs hover:bg-green-500 transition-colors"
        >
          {{ t("posts.approveAll") }}
        </button>
        <button
          @click="deleteSelected"
          class="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-400 text-xs hover:bg-rose-600/30 transition-colors border border-rose-500/20"
        >
          {{ t("common.delete") }}
        </button>
        <button
          @click="selected = []"
          class="ml-auto text-xs theme-muted hover:theme-text"
        >
          {{ t("posts.clearSelection") }}
        </button>
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && filteredPosts.length === 0"
        class="flex flex-col items-center justify-center py-20 gap-3 theme-sub"
      >
        <svg
          class="w-12 h-12 opacity-20"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p class="text-sm">{{ t("posts.empty") }}</p>
        <p class="text-xs theme-muted">{{ t("posts.emptyHint") }}</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-20">
        <svg
          class="w-8 h-8 animate-spin text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>

      <!-- Posts list -->
      <div class="space-y-3">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="rounded-2xl theme-surface theme-border hover:border-blue-500/25 transition-all group"
          :class="
            selected.includes(post.id) ? 'border-blue-500/40 bg-blue-500/5' : ''
          "
        >
          <!-- Card Body Wrapper — تدمج المحتوى والصورة في تصميم مرن -->
          <div
            class="flex flex-col lg:flex-row lg:items-stretch justify-between"
          >
            <!-- Left Side: Content & Actions -->
            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div class="flex items-start gap-3 sm:gap-4">
                <!-- Checkbox -->
                <div
                  @click="toggleSelect(post.id)"
                  class="w-5 h-5 rounded-md border-2 flex items-center justify-center cursor-pointer shrink-0 mt-0.5 transition-colors"
                  :class="
                    selected.includes(post.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-600 hover:border-blue-400'
                  "
                >
                  <svg
                    v-if="selected.includes(post.id)"
                    class="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <!-- Meta row -->
                  <div class="flex items-center gap-2 mb-2 flex-wrap">
                    <span
  class="text-[10px] px-2 py-0.5 rounded-full font-medium"
  :class="platformClass(post.platform)"
>
  {{ t(`posts.platform.${post.platform}`, post.platform) }}
</span>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded-full theme-card theme-border theme-muted"
                    >
                      {{ t(`posts.dialect.${post.dialectKey}`, post.dialect) }}
                    </span>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      :class="statusClass(post.status)"
                    >
                      {{ t(`posts.status.${post.status}`, post.status) }}
                    </span>
                    <span class="text-[10px] theme-muted ml-auto shrink-0">{{
                      post.date
                    }}</span>
                  </div>

                  <!-- Copy -->
                  <p
                    class="text-sm theme-text leading-relaxed mb-1 line-clamp-3"
                  >
                    {{ post.copy }}
                  </p>
                  <p
                    v-if="post.arabic"
                    class="text-sm theme-sub leading-relaxed mb-2 font-arabic text-right line-clamp-3"
                  >
                    {{ post.arabic }}
                  </p>

                  <!-- Hashtags -->
                  <div class="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      v-for="tag in post.hashtags.slice(0, 4)"
                      :key="tag"
                      class="text-[10px] text-blue-400"
                      >#{{ tag }}</span
                    >
                    <span
                      v-if="post.hashtags.length > 4"
                      class="text-[10px] theme-muted"
                      >+{{ post.hashtags.length - 4 }}</span
                    >
                  </div>
                </div>

                <!-- Desktop actions — visible on hover -->
                <div
                  class="hidden sm:flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <button
                    v-if="
                      post.status !== 'Approved' && post.status !== 'Published'
                    "
                    @click="approvePost(post.id)"
                    class="px-3 py-1.5 rounded-lg bg-green-600/15 text-green-400 text-[11px] hover:bg-green-600/25 transition-colors border border-green-500/20"
                  >
                    {{ t("posts.approve") }}
                  </button>
                  <button
                    @click="editPost(post)"
                    class="px-3 py-1.5 rounded-lg theme-card theme-border theme-sub text-[11px] hover:theme-text transition-colors"
                  >
                    {{ t("posts.edit") }}
                  </button>
                  <button
                    @click="deletePost(post.id)"
                    class="px-3 py-1.5 rounded-lg bg-rose-600/10 text-rose-400 text-[11px] hover:bg-rose-600/20 transition-colors border border-rose-500/15"
                  >
                    {{ t("common.delete") }}
                  </button>
                </div>
              </div>

              <!-- Mobile actions -->
              <div
                class="flex sm:hidden items-center gap-2 mt-3 pt-3 border-t"
                style="border-color: var(--border)"
              >
                <button
                  v-if="
                    post.status !== 'Approved' && post.status !== 'Published'
                  "
                  @click="approvePost(post.id)"
                  class="flex-1 py-1.5 rounded-lg bg-green-600/15 text-green-400 text-[11px] hover:bg-green-600/25 transition-colors border border-green-500/20"
                >
                  {{ t("posts.approve") }}
                </button>
                <button
                  @click="editPost(post)"
                  class="flex-1 py-1.5 rounded-lg theme-card theme-border theme-sub text-[11px] hover:theme-text transition-colors"
                >
                  {{ t("posts.edit") }}
                </button>
                <button
                  @click="deletePost(post.id)"
                  class="flex-1 py-1.5 rounded-lg bg-rose-600/10 text-rose-400 text-[11px] hover:bg-rose-600/20 transition-colors border border-rose-500/15"
                >
                  {{ t("common.delete") }}
                </button>
              </div>
            </div>

            <!-- Right Side: Beautifully integrated Image Preview -->
            <div
              v-if="post.imageUrl"
              class="p-4 lg:p-5 lg:pl-0 flex items-center justify-center lg:w-[320px] shrink-0"
            >
              <div
                class="w-full h-full max-h-[280px] lg:max-h-full aspect-square overflow-hidden rounded-xl border theme-border bg-slate-950/10 flex items-center justify-center"
              >
                <img
                  :src="post.imageUrl"
                  :alt="t('posts.generatedImage')"
                  class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
          </div>

          <!-- A/B Variant Card -->
          <div
            v-if="post.variantB"
            class="mx-4 sm:mx-5 mb-4 sm:mb-5 rounded-xl bg-amber-500/5 border border-amber-500/20 overflow-hidden"
          >
            <!-- Header -->
            <div
              class="flex items-center justify-between px-3 py-2 border-b border-amber-500/15"
            >
              <span
                class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium"
              >
                ⚡ {{ t("posts.variantBLabel") }}
              </span>
              <button
                @click="applyVariantB(post.id)"
                class="text-[10px] px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors border border-amber-500/25 font-medium"
              >
                {{ t("posts.useVariantB") }}
              </button>
            </div>
            <!-- Content -->
            <div class="p-3 space-y-1.5">
              <p
                v-if="post.variantB.copyEN"
                class="text-xs theme-text leading-relaxed"
              >
                {{ post.variantB.copyEN }}
              </p>
              <p
                v-if="post.variantB.copyAR"
                class="text-xs theme-sub leading-relaxed text-right font-arabic"
                dir="rtl"
              >
                {{ post.variantB.copyAR }}
              </p>
              <div
                v-if="post.variantB.hashtags?.length"
                class="flex flex-wrap gap-1 pt-1"
              >
                <span
                  v-for="tag in post.variantB.hashtags.slice(0, 4)"
                  :key="tag"
                  class="text-[10px] text-amber-400/70"
                  >#{{ tag }}</span
                >
                <span
                  v-if="post.variantB.hashtags.length > 4"
                  class="text-[10px] theme-muted"
                  >+{{ post.variantB.hashtags.length - 4 }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Edit Modal ── -->
    <div
      v-if="editingPost"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        class="theme-surface sm:rounded-2xl rounded-t-2xl theme-border w-full sm:max-w-lg max-h-[90vh] overflow-y-auto theme-shadow"
      >
        <div
          class="sticky top-0 theme-surface z-10 flex items-center justify-between px-6 py-4 border-b"
          style="border-color: var(--border)"
        >
          <h2 class="font-display text-lg font-600 theme-text">
            {{ t("posts.editPost") }}
          </h2>
          <button
            @click="editingPost = null"
            class="theme-muted hover:theme-text"
          >
            <svg
              class="w-5 h-5"
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

        <div class="p-6 space-y-4">
          <!-- Status badge -->
          <div class="flex items-center gap-2">
            <span
  class="text-[10px] px-2 py-0.5 rounded-full font-medium"
  :class="platformClass(editingPost.platform)"
>
  {{ t(`posts.platform.${editingPost.platform}`, editingPost.platform) }}
</span>
            <span
              class="text-[10px] px-2 py-0.5 rounded-full font-medium"
              :class="statusClass(editingPost.status)"
            >
              {{ t(`posts.status.${editingPost.status}`, editingPost.status) }}
            </span>
          </div>

          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("posts.copyEN")
            }}</label>
            <textarea
              v-model="editingPost.copy"
              rows="3"
              class="w-full theme-input rounded-xl p-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              style="border-color: var(--border)"
            ></textarea>
          </div>
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("posts.copyAR")
            }}</label>
            <textarea
              v-model="editingPost.arabic"
              rows="3"
              dir="rtl"
              class="w-full theme-input rounded-xl p-3 text-sm theme-text border focus:outline-none focus:border-blue-500/50 transition-colors resize-none text-right"
              style="border-color: var(--border)"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("posts.platformLabel")
              }}</label>
              <select
                v-model="editingPost.platform"
                class="w-full theme-input rounded-xl p-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)"
              >
                <option
                  v-for="p in platformOptions"
                  :key="p.value"
                  :value="p.value"
                >
                  {{ t(p.labelKey) }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("posts.statusLabel")
              }}</label>
              <select
                v-model="editingPost.status"
                class="w-full theme-input rounded-xl p-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)"
              >
                <option
                  v-for="s in statusOptions"
                  :key="s.value"
                  :value="s.value"
                >
                  {{ t(s.labelKey) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Hashtags -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("posts.hashtags")
            }}</label>
            <input
              v-model="hashtagsInput"
              type="text"
              class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/50"
              style="border-color: var(--border)"
              placeholder="#hashtag1 #hashtag2"
            />
          </div>

          <!-- Save feedback -->
          <p
            v-if="saveMsg"
            class="text-xs text-center"
            :class="
              saveMsg.type === 'success' ? 'text-green-400' : 'text-rose-400'
            "
          >
            {{ saveMsg.text }}
          </p>
        </div>

        <div
          class="sticky bottom-0 theme-surface border-t px-6 py-4 flex gap-3"
          style="border-color: var(--border)"
        >
          <button
            @click="editingPost = null"
            class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="savePost"
            :disabled="saving"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {{ saving ? t("posts.saving") : t("posts.savePost") }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Delete Confirm ── -->
    <div
      v-if="confirmDeleteId"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <div
        class="theme-surface rounded-2xl theme-border max-w-sm w-full p-6 theme-shadow"
      >
        <h2 class="font-display text-lg font-600 theme-text mb-2">
          {{ t("posts.deleteConfirmTitle") }}
        </h2>
        <p class="text-sm theme-sub mb-6">{{ t("posts.deleteConfirmMsg") }}</p>
        <div class="flex gap-3">
          <button
            @click="confirmDeleteId = null"
            class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="confirmDelete"
            class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 transition-colors"
          >
            {{ t("common.delete") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast notification -->
    <div
      v-if="toast"
      class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all"
      :class="toast.type === 'success' ? 'bg-green-600' : 'bg-rose-600'"
    >
      {{ toast.text }}
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import AppLayout from "../components/AppLayout.vue";
import postsApi from "../api/postsApi.js";

const { t } = useI18n();

// ── State ─────────────────────────────────────────────────────────────────────
const loading = ref(false);
const saving = ref(false);
const activeFilter = ref("All");
const selected = ref([]);
const editingPost = ref(null);
const confirmDeleteId = ref(null);
const hashtagsInput = ref("");
const saveMsg = ref(null);
const toast = ref(null);

const filters = [
  { value: "All", labelKey: "posts.filterAll" },
  { value: "Draft", labelKey: "posts.filterDraft" },
  { value: "Approved", labelKey: "posts.filterApproved" },
  { value: "Scheduled", labelKey: "posts.filterScheduled" },
  { value: "Published", labelKey: "posts.filterPublished" },
];

const platformOptions = [
  { value: "Instagram", labelKey: "posts.platform.Instagram" },
  { value: "Facebook", labelKey: "posts.platform.Facebook" },
  { value: "LinkedIn", labelKey: "posts.platform.LinkedIn" },
  { value: "Twitter/X", labelKey: "posts.platform.TwitterX" },
  { value: "TikTok", labelKey: "posts.platform.TikTok" },
];

const statusOptions = [
  { value: "Draft", labelKey: "posts.status.Draft" },
  // { value: "Pending", labelKey: "posts.status.Pending" },
  { value: "Approved", labelKey: "posts.status.Approved" },
  { value: "Scheduled", labelKey: "posts.status.Scheduled" },
];

// ── Posts data ────────────────────────────────────────────────────────────────
const posts = ref([]);

function mapPost(p) {
  const dialect = p.dialect || "Arabic (EGY)";
  return {
    id: p._id || p.id,
    platform: p.platform || "Instagram",
    dialect,
    dialectKey: toDialectKey(dialect),
    status: normalizeStatus(p.status),
    date: new Date(p.scheduledDate || p.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    copy: p.copyEN || p.copy || "",
    arabic: p.copyAR || null,
    hashtags: p.hashtags || [],
    variantB: p.variantB?.copyAR || p.variantB?.copyEN ? p.variantB : null,
    imageUrl: p.imageUrl || null,
  };
}

function normalizeStatus(s) {
  if (!s) return "Draft";
  const map = {
    draft: "Draft",
    // pending_review: "Pending",
    approved: "Approved",
    scheduled: "Scheduled",
    published: "Published",
  };
  return map[s.toLowerCase()] || s.charAt(0).toUpperCase() + s.slice(1);
}

function toDialectKey(d) {
  return (
    {
      "Arabic (EGY)": "egy",
      "Arabic (Gulf)": "gulf",
      Levantine: "levantine",
      English: "english",
      Bilingual: "bilingual",
    }[d] || "egy"
  );
}

// ── Load posts on mount ───────────────────────────────────────────────────────
onMounted(async () => {
  loading.value = true;
  try {
    const brandId = localStorage.getItem("cf_brandId");
    if (!brandId) return;
    const data = await postsApi.getAllPosts(brandId);
    if (data?.length) posts.value = data.map(mapPost);
  } catch {
    // Keep empty state
  } finally {
    loading.value = false;
  }
});

// ── Computed ──────────────────────────────────────────────────────────────────
const filteredPosts = computed(() =>
  activeFilter.value === "All"
    ? posts.value
    : posts.value.filter((p) => p.status === activeFilter.value)
);

function statusCount(status) {
  if (status === "All") return 0;
  return posts.value.filter((p) => p.status === status).length;
}

// ── Selection ─────────────────────────────────────────────────────────────────
function toggleSelect(id) {
  const i = selected.value.indexOf(id);
  if (i === -1) selected.value.push(id);
  else selected.value.splice(i, 1);
}

// ── Approve ───────────────────────────────────────────────────────────────────
async function approvePost(id) {
  const p = posts.value.find((x) => x.id === id);
  if (!p) return;
  p.status = "Approved";
  try {
    await postsApi.updatePost(id, { status: "approved" });
    showToast(t("posts.toastApproved"), "success");
  } catch {
    // p.status = "Pending";
    showToast(t("posts.toastError"), "error");
  }
}

async function approveSelected() {
  for (const id of selected.value) {
    await approvePost(id);
  }
  selected.value = [];
}

// ── Delete ────────────────────────────────────────────────────────────────────
function deletePost(id) {
  confirmDeleteId.value = id;
}

async function confirmDelete() {
  const id = confirmDeleteId.value;
  posts.value = posts.value.filter((p) => p.id !== id);
  confirmDeleteId.value = null;
  try {
    await postsApi.deletePost(id);
    showToast(t("posts.toastDeleted"), "success");
  } catch {
    showToast(t("posts.toastError"), "error");
  }
}

function deleteSelected() {
  const ids = [...selected.value];
  posts.value = posts.value.filter((p) => !ids.includes(p.id));
  selected.value = [];
  ids.forEach((id) => postsApi.deletePost(id).catch(() => {}));
  showToast(t("posts.toastDeleted"), "success");
}

// ── Edit / Save ───────────────────────────────────────────────────────────────
// ── Apply Variant B ───────────────────────────────────────────────────────────
async function applyVariantB(id) {
  const p = posts.value.find((x) => x.id === id);
  if (!p || !p.variantB) return;
  const prev = { copy: p.copy, arabic: p.arabic, hashtags: [...p.hashtags] };
  p.copy = p.variantB.copyEN || p.copy;
  p.arabic = p.variantB.copyAR || p.arabic;
  p.hashtags = p.variantB.hashtags?.length ? p.variantB.hashtags : p.hashtags;
  p.variantB = null;
  try {
    await postsApi.updatePost(id, {
      copyEN: p.copy,
      copyAR: p.arabic,
      hashtags: p.hashtags,
    });
    showToast(t("posts.variantBApplied"), "success");
  } catch {
    Object.assign(p, prev);
    showToast(t("posts.toastError"), "error");
  }
}

function editPost(post) {
  editingPost.value = { ...post };
  hashtagsInput.value = post.hashtags.join(" ");
  saveMsg.value = null;
}

async function savePost() {
  if (!editingPost.value) return;
  saving.value = true;
  saveMsg.value = null;
  const hashtags = hashtagsInput.value
    .split(/\s+/)
    .map((h) => h.replace("#", ""))
    .filter(Boolean);
  const updated = { ...editingPost.value, hashtags };
  const i = posts.value.findIndex((x) => x.id === updated.id);
  if (i !== -1) posts.value[i] = updated;
  try {
    await postsApi.updatePost(updated.id, {
      copyEN: updated.copy,
      copyAR: updated.arabic,
      hashtags,
      status: updated.status.toLowerCase().replace(" ", "_"),
      platform: updated.platform,
    });
    saveMsg.value = { type: "success", text: t("posts.saveSuccess") };
    setTimeout(() => {
      editingPost.value = null;
    }, 800);
  } catch {
    saveMsg.value = { type: "error", text: t("posts.saveError") };
  } finally {
    saving.value = false;
  }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(text, type = "success") {
  toast.value = { text, type };
  setTimeout(() => (toast.value = null), 3000);
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function platformClass(p) {
  return (
    {
      Instagram: "bg-pink-500/15 text-pink-400",
      Facebook: "bg-blue-500/15 text-blue-400",
      LinkedIn: "bg-blue-700/15 text-blue-300",
      "Twitter/X": "bg-sky-500/15 text-sky-400",
      TikTok: "bg-rose-500/15 text-rose-400",
    }[p] || "bg-slate-500/15 text-slate-400"
  );
}

function statusClass(s) {
  return (
    {
      Draft: "bg-slate-500/15 text-slate-400",
      // Pending: "bg-amber-500/15 text-amber-400",
      Approved: "bg-green-500/15 text-green-400",
      Scheduled: "bg-blue-500/15 text-blue-400",
      Published: "bg-teal-500/15 text-teal-400",
    }[s] || ""
  );
}
</script>