<template>
  <AppLayout>
    <div class="p-7 max-w-5xl mx-auto">

      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">
          ✨ {{ t('poster.title') }}
        </h1>
        <p class="text-sm theme-sub mt-1">{{ t('poster.subtitle') }}</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-6">

        <!-- LEFT: Input Panel -->
        <div class="space-y-5">

          <!-- Image Upload Zone -->
          <div
            class="rounded-2xl theme-surface theme-border p-6 transition-all"
            :class="{ 'border-blue-500/40 ring-2 ring-blue-500/20': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop">
            <h3 class="font-display font-600 text-base theme-text mb-4 flex items-center gap-2">
              📸 {{ t('poster.productImage') }}
            </h3>

            <!-- Upload State -->
            <div v-if="!previewUrl"
              class="border-2 border-dashed border-theme rounded-xl p-10 text-center cursor-pointer hover:border-blue-500/40 transition-colors"
              @click="$refs.fileInput.click()">
              <div class="text-4xl mb-3">🖼️</div>
              <p class="text-sm font-medium theme-text mb-1">{{ t('poster.uploadHint') }}</p>
              <p class="text-xs theme-muted">{{ t('poster.uploadFormats') }}</p>
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp,image/jpg"
                class="hidden" @change="handleFileSelect" />
            </div>

            <!-- Preview State -->
            <div v-else class="relative rounded-xl overflow-hidden">
              <img :src="previewUrl" :alt="t('poster.previewAlt')"
                class="w-full h-64 object-contain bg-forge-950/50" />
              <button @click="clearImage"
                class="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 transition-colors shadow-lg"
                :title="t('poster.removeImage')">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
              <div class="absolute bottom-2 left-2 text-[10px] theme-muted bg-black/50 px-2 py-1 rounded">
                {{ selectedFile?.name }} · {{ formatFileSize(selectedFile?.size) }}
              </div>
            </div>
          </div>

          <!-- Prompt Input -->
          <div class="rounded-2xl theme-surface theme-border p-6">
            <h3 class="font-display font-600 text-base theme-text mb-4 flex items-center gap-2">
              ✍️ {{ t('poster.describeTitle') }}
            </h3>
            <textarea v-model="prompt" rows="5"
              :placeholder="t('poster.promptPlaceholder')"
              class="w-full theme-input rounded-xl p-3.5 text-sm theme-text border resize-none focus:outline-none focus:border-blue-500/40 transition-colors"
              style="border-color: var(--border)"
              :disabled="isGenerating"></textarea>
            <div class="flex items-center justify-between mt-2">
              <p class="text-[10px] theme-muted">
                {{ t('poster.charCount', { count: prompt.length }) }}
              </p>
              <div class="flex gap-1.5 flex-wrap">
                <button v-for="tag in quickPrompts" :key="tag.key"
                  @click="appendPrompt(t(tag.key))"
                  class="text-[10px] px-2 py-1 rounded-full theme-card theme-border theme-muted hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                  :disabled="isGenerating">
                  {{ t(tag.key) }}
                </button>
              </div>
            </div>
          </div>

          <!-- Generate Button -->
          <button @click="generatePoster" :disabled="!canGenerate || isGenerating"
            class="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 text-white font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2">
            <svg v-if="isGenerating" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span v-if="isGenerating">{{ t('poster.generating') }}</span>
            <span v-else>✨ {{ t('poster.generateBtn') }}</span>
          </button>

          <!-- Error Message -->
          <div v-if="error"
            class="px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
            <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {{ error }}
          </div>
        </div>

        <!-- RIGHT: Output Panel -->
        <div class="space-y-5">

          <div class="rounded-2xl theme-surface theme-border p-6 min-h-[500px] flex flex-col">
            <h3 class="font-display font-600 text-base theme-text mb-4 flex items-center gap-2">
              🎨 {{ t('poster.generatedTitle') }}
            </h3>

            <!-- Empty State -->
            <div v-if="!generatedImageUrl && !isGenerating"
              class="flex-1 flex flex-col items-center justify-center text-center py-16">
              <div class="w-20 h-20 rounded-2xl bg-blue-600/10 flex items-center justify-center text-3xl mb-4">🎨</div>
              <p class="text-sm theme-sub mb-1">{{ t('poster.emptyState') }}</p>
              <p class="text-xs theme-muted max-w-xs">{{ t('poster.emptyStateSub') }}</p>
            </div>

            <!-- Generating State -->
            <div v-if="isGenerating && !generatedImageUrl"
              class="flex-1 flex flex-col items-center justify-center py-16">
              <div class="relative w-24 h-24 mb-4">
                <div class="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
                <div class="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
                <div class="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
              </div>
              <p class="text-sm theme-text font-medium mb-1">{{ t('poster.generatingMsg') }}</p>
              <p class="text-xs theme-muted">{{ t('poster.generatingDuration') }}</p>

              <!-- Progress Steps -->
              <div class="flex items-center gap-3 mt-6">
                <div v-for="(step, i) in generationSteps" :key="step.key" class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                    :class="i <= currentStep ? 'bg-blue-600 text-white' : 'bg-forge-800 text-slate-500'">
                    {{ i < currentStep ? '✓' : i + 1 }}
                  </div>
                  <span class="text-[10px] transition-colors"
                    :class="i <= currentStep ? 'text-blue-400' : 'theme-muted'">
                    {{ t(step.key) }}
                  </span>
                  <div v-if="i < generationSteps.length - 1" class="w-6 h-px transition-colors"
                    :class="i < currentStep ? 'bg-blue-500' : 'bg-forge-800'"></div>
                </div>
              </div>
            </div>

            <!-- Result State -->
            <div v-if="generatedImageUrl" class="space-y-4">
              <div class="rounded-xl overflow-hidden border border-white/10 bg-forge-950/50">
                <img :src="generatedImageUrl" :alt="t('poster.generatedAlt')"
                  class="w-full object-contain" @load="onImageLoad"/>
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-3">
                <button @click="downloadPoster"
                  class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  {{ t('poster.downloadBtn') }}
                </button>
                <button @click="regenerate"
                  class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  {{ t('poster.regenerateBtn') }}
                </button>
              </div>

              <!-- Prompt Display -->
              <div class="p-3 rounded-xl theme-card theme-border">
                <p class="text-[10px] theme-muted mb-1">{{ t('poster.promptUsed') }}</p>
                <p class="text-xs theme-sub italic">{{ usedPrompt }}</p>
              </div>
            </div>
          </div>

          <!-- Tips Card -->
          <div class="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h4 class="text-xs font-medium text-amber-400 mb-2 flex items-center gap-1.5">
              <span>💡</span> {{ t('poster.tipsTitle') }}
            </h4>
            <ul class="space-y-1.5">
              <li v-for="tip in tips" :key="tip.key" class="text-[11px] theme-sub flex items-start gap-2">
                <span class="text-amber-400 mt-0.5">•</span>
                {{ t(tip.key) }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed } from "vue";
import AppLayout from "../components/AppLayout.vue";
import { posterApi } from "../api";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// ── State ─────────────────────────────────────────────────────────────────────
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref("");
const prompt = ref("");
const isGenerating = ref(false);
const generatedImageUrl = ref("");
const usedPrompt = ref("");
const error = ref("");
const isDragging = ref(false);
const currentStep = ref(0);
const imageLoaded = ref(false);

// ── Constants ─────────────────────────────────────────────────────────────────
const quickPrompts = [
  { key: "poster.quick.luxury" },
  { key: "poster.quick.minimalist" },
  { key: "poster.quick.ramadan" },
  { key: "poster.quick.boldColors" },
  { key: "poster.quick.elegant" },
  { key: "poster.quick.socialAd" },
];

const generationSteps = [
  { key: "poster.steps.uploading" },
  { key: "poster.steps.analyzing" },
  { key: "poster.steps.generating" },
  { key: "poster.steps.finalizing" },
];

const tips = [
  { key: "poster.tips.1" },
  { key: "poster.tips.2" },
  { key: "poster.tips.3" },
  { key: "poster.tips.4" },
  { key: "poster.tips.5" },
];

// ── Computed ──────────────────────────────────────────────────────────────────
const canGenerate = computed(() => {
  return selectedFile.value && prompt.value.trim().length > 10;
});

// ── Methods ───────────────────────────────────────────────────────────────────
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) processFile(file);
}

function handleDrop(event) {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
    processFile(file);
  } else {
    error.value = t('poster.errorInvalidDrop');
  }
}

function processFile(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (!allowedTypes.includes(file.type)) {
    error.value = t('poster.errorInvalidType');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    error.value = t('poster.errorFileTooLarge');
    return;
  }
  selectedFile.value = file;
  error.value = "";
  previewUrl.value = URL.createObjectURL(file);
}

function clearImage() {
  selectedFile.value = null;
  previewUrl.value = "";
  generatedImageUrl.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

function appendPrompt(tag) {
  if (prompt.value) {
    prompt.value += ", " + tag.toLowerCase();
  } else {
    prompt.value = tag;
  }
}

async function generatePoster() {
  if (!canGenerate.value) return;

  error.value = "";
  isGenerating.value = true;
  generatedImageUrl.value = "";
  imageLoaded.value = false;
  currentStep.value = 0;

  const stepInterval = setInterval(() => {
    if (currentStep.value < generationSteps.length - 1) {
      currentStep.value++;
    }
  }, 8000);

  try {
    const response = await posterApi.generatePoster(selectedFile.value, prompt.value);
    if (response.success && response.data?.imageUrl) {
      generatedImageUrl.value = response.data.imageUrl;
      usedPrompt.value = response.data.prompt;
      currentStep.value = generationSteps.length - 1;
    } else {
      throw new Error(response.message || t('poster.errorGenerationFailed'));
    }
  } catch (err) {
    console.error("[PosterGenerator] Generation failed:", err);
    error.value =
      err.response?.data?.message ||
      err.message ||
      t('poster.errorGenerate');
  } finally {
    clearInterval(stepInterval);
    isGenerating.value = false;
  }
}

function regenerate() {
  generatedImageUrl.value = "";
  generatePoster();
}

async function downloadPoster() {
  if (!generatedImageUrl.value) return;
  
  try {
    // تحميل الصورة كـ Blob
    const response = await fetch(generatedImageUrl.value);
    const blob = await response.blob();
    
    // إنشاء رابط مؤقت للتحميل
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `contentforge-poster-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // تنظيف الـ URL المؤقت
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[PosterGenerator] Download failed:", err);
   error.value = t('poster.error.download');
  }
}

function onImageLoad() {
  imageLoaded.value = true;
}

function formatFileSize(bytes) {
  if (!bytes) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
</script>

<style scoped>
.border-dashed {
  transition: all 0.2s ease;
}
img {
  animation: fadeIn 0.5s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
