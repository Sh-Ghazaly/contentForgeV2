<template>
  <AppLayout>
    <div class="p-4 sm:p-7 max-w-5xl mx-auto">
      <!-- Page header -->
      <div
        class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8"
      >
        <div>
          <h1 class="font-display text-xl sm:text-2xl font-700 theme-text">
            {{ t("branding.title") }}
          </h1>
          <p class="text-sm theme-sub mt-1">{{ t("branding.subtitle") }}</p>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="saveAll"
            class="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-sm active:scale-95"
          >
            {{ t("branding.saveAndEmbed") }}
          </button>
        </div>
      </div>

      <!-- Tabs -->
      <div
        class="flex gap-1 sm:gap-2 mb-6 sm:mb-8 border-b border-theme pb-1 overflow-x-auto"
      >
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="tab.locked ? $router.push('/payment') : (activeTab = tab.key)"
          class="px-3 sm:px-4 py-2 text-sm font-medium transition-all rounded-t-lg -mb-px whitespace-nowrap flex items-center gap-2"
          :class="[
            activeTab === tab.key && !tab.locked
              ? 'text-blue-500 border-b-2 border-blue-500 font-semibold'
              : tab.locked
              ? 'theme-muted cursor-pointer hover:theme-text opacity-75'
              : 'theme-sub hover:theme-text',
          ]"
        >
          <svg
            v-if="tab.locked"
            class="w-3.5 h-3.5 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>

          {{ t(tab.labelKey) }}

          <span
            v-if="tab.locked"
            class="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
          >
            PRO
          </span>
        </button>
      </div>

      <!-- TAB: Brand Identity -->
      <section
        v-if="activeTab === 'Brand Identity'"
        class="space-y-6"
        aria-label="Brand Identity"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          <!-- Basic Info card -->
          <div
            class="theme-surface rounded-2xl theme-border p-4 sm:p-6 space-y-5"
          >
            <h3
              class="font-display font-600 text-base theme-text flex items-center gap-2"
            >
              🏷️ {{ t("branding.basicInfo") }}
            </h3>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("branding.brandName")
              }}</label>
              <input
                v-model="brand.name"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text focus:outline-none focus:border-blue-500/40 transition-colors"
                :placeholder="t('branding.brandNamePlaceholder')"
              />
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("branding.industry")
              }}</label>
              <input
                v-model="brand.industry"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text focus:outline-none focus:border-blue-500/40 transition-colors"
                :placeholder="t('branding.industryPlaceholder')"
              />
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("branding.primaryMarket")
              }}</label>
              <select
                v-model="brand.market"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text focus:outline-none focus:border-blue-500/40"
              >
                <option
                  v-for="m in marketOptions"
                  :key="m.value"
                  :value="m.value"
                >
                  {{ t(m.labelKey) }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("branding.targetAudience")
              }}</label>
              <textarea
                v-model="brand.audience"
                rows="3"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40 transition-colors"
                :placeholder="t('branding.audiencePlaceholder')"
              ></textarea>
            </div>
          </div>

          <!-- Visual Identity card -->
          <div
            class="theme-surface rounded-2xl theme-border p-4 sm:p-6 space-y-5"
          >
            <h3
              class="font-display font-600 text-base theme-text flex items-center gap-2"
            >
              🎨 {{ t("branding.visualIdentity") }}
            </h3>
            <div>
              <label class="text-xs theme-sub mb-2 block">{{
                t("branding.brandColors")
              }}</label>
              <div class="flex flex-wrap gap-2 mb-3">
                <div
                  v-for="(color, i) in brand.colors"
                  :key="i"
                  class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg theme-border theme-card shadow-sm"
                >
                  <div
                    class="w-4 h-4 rounded-full border border-white/10 shrink-0"
                    :style="`background:${color}`"
                  ></div>
                  <span class="text-xs theme-sub font-mono">{{ color }}</span>
                  <button
                    @click="brand.colors.splice(i, 1)"
                    class="text-muted hover:text-red-400 text-xs font-bold transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div class="flex gap-2">
                <input
                  v-model="newColor"
                  @input="syncColorPicker"
                  type="color"
                  class="w-10 h-9 rounded-xl theme-border cursor-pointer bg-transparent p-0 border-0 shrink-0"
                />
                <input
                  v-model="newColorHex"
                  @input="syncHexInput"
                  type="text"
                  placeholder="#3B82F6"
                  class="flex-1 min-w-0 px-3 py-2 rounded-xl theme-border theme-input text-xs theme-text focus:outline-none focus:border-blue-500/40"
                />
                <button
                  @click="addColor"
                  class="px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-xs hover:bg-blue-500 font-medium transition-colors shrink-0"
                >
                  {{ t("common.add") }}
                </button>
              </div>

              <!-- AI Detected Colors from Logo -->
              <div v-if="detectedColors.length" class="mt-3 pt-3 border-t border-theme">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-medium text-teal-400">{{ t("branding.aiDetectedColors") || "AI Detected Colors" }}</span>
                  <span class="text-[10px] theme-muted">{{ t("branding.fromLogo") || "from your logo" }}</span>
                </div>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="(color, i) in detectedColors"
                    :key="i"
                    @click="addDetectedColor(color)"
                    class="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95"
                    :class="brand.colors.includes(color) ? 'border-teal-500/40 bg-teal-500/10 opacity-50 cursor-default' : 'border-theme theme-card hover:border-teal-500/40'"
                    :disabled="brand.colors.includes(color)"
                  >
                    <div
                      class="w-4 h-4 rounded-full border border-white/10 shrink-0"
                      :style="`background:${color}`"
                    ></div>
                    <span class="text-xs theme-sub font-mono">{{ color }}</span>
                    <span v-if="brand.colors.includes(color)" class="text-[10px] text-teal-400">✓</span>
                    <span v-else class="text-[10px] theme-muted">+</span>
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("branding.brandFont")
              }}</label>
              <input
                v-model="brand.font"
                type="text"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text focus:outline-none focus:border-blue-500/40"
                :placeholder="t('branding.brandFontPlaceholder')"
              />
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("branding.logoUpload")
              }}</label>
              <!-- Logo preview (shown after upload) -->
              <div
                v-if="brand.logoPreview"
                class="relative rounded-xl border border-theme overflow-hidden mb-2 bg-slate-500/5 flex items-center justify-center"
                style="min-height: 100px"
              >
                <img
                  :src="brand.logoPreview"
                  alt="Brand Logo"
                  class="max-h-28 max-w-full object-contain p-3"
                  ref="logoImg"
                />
                <button
                  @click="removeLogo"
                  class="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center text-xs transition-colors shadow"
                >
                  ×
                </button>
              </div>
              <!-- Upload dropzone (shown when no logo yet) -->
              <div
                v-else
                class="border-2 border-dashed border-theme rounded-xl p-4 sm:p-6 text-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
                @click="$refs.logoInput.click()"
              >
                <div class="text-2xl mb-2">🖼️</div>
                <p class="text-xs theme-sub font-medium">
                  {{ t("branding.logoUploadHint") }}
                </p>
                <p class="text-[10px] text-muted mt-1">
                  {{ t("branding.logoUploadMax") }}
                </p>
              </div>
              <input
                ref="logoInput"
                type="file"
                accept="image/png,image/svg+xml,image/jpeg,image/jpg,image/webp"
                class="hidden"
                @change="handleLogo"
              />
            </div>
          </div>
        </div>

        <!-- Brand Voice & Guidelines -->
        <div
          class="theme-surface rounded-2xl theme-border p-4 sm:p-6 space-y-6"
        >
          <h3
            class="font-display font-600 text-base theme-text flex items-center gap-2"
          >
            🎤 {{ t("branding.brandVoice") }}
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("branding.voiceDescription")
              }}</label>
              <textarea
                v-model="brand.voice"
                rows="5"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40 transition-colors"
                :placeholder="t('branding.voicePlaceholder')"
              ></textarea>
            </div>
            <div class="space-y-4">
              <div>
                <label class="text-xs theme-sub mb-2 block font-medium">{{
                  t("branding.toneSliders")
                }}</label>
                <div v-for="tone in tones" :key="tone.leftKey" class="mb-4">
                  <div
                    class="flex justify-between text-[11px] theme-sub mb-1 font-mono"
                  >
                    <span>{{ t(tone.leftKey) }}</span>
                    <span>{{ t(tone.rightKey) }}</span>
                  </div>
                  <input
                    type="range"
                    v-model="tone.value"
                    min="0"
                    max="100"
                    class="w-full h-1.5 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label class="text-xs theme-sub mb-2 block font-medium">{{
                  t("branding.preferredDialect")
                }}</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="d in dialects"
                    :key="d.value"
                    @click="toggleDialect(d.value)"
                    class="px-3 py-1.5 rounded-lg text-xs transition-all border shadow-sm active:scale-95"
                    :class="
                      brand.dialects.includes(d.value)
                        ? 'bg-blue-500/15 text-blue-400 border-blue-500/40 font-medium'
                        : 'theme-border theme-sub hover:theme-text hover:bg-slate-500/5'
                    "
                  >
                    {{ t(d.labelKey) }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Platforms -->
          <div class="pt-2">
            <h3 class="text-xs font-medium theme-sub mb-3 block">
              📱 {{ t("branding.targetPlatforms") }}
            </h3>

            <!-- Active platforms -->
            <div class="mb-3">
              <p
                class="text-[10px] font-semibold text-teal-400 uppercase tracking-wide mb-2"
              >
                {{  t("branding.platformsActive")  }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in activePlatforms"
                  :key="p.name"
                  @click="toggleItem(brand.platforms, p.name)"
                  class="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl border text-sm transition-all active:scale-95 shadow-sm"
                  :class="
                    brand.platforms.includes(p.name)
                      ? 'bg-blue-600/15 border-blue-500/40 text-blue-400 font-medium'
                      : 'theme-card theme-border theme-sub hover:theme-text hover:bg-slate-500/5'
                  "
                >
                  <span
                    class="w-4 h-4 shrink-0 flex items-center justify-center"
                    v-html="p.icon"
                  ></span>
                  {{ t(p.labelKey) }}
                </button>
              </div>
            </div>

            <!-- Coming soon platforms -->
            <div>
              <p
                class="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-2"
              >
                {{ t("branding.platformsComingSoon") }}
              </p>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="p in comingSoonPlatforms"
                  :key="p.name"
                  class="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl border text-sm border-dashed cursor-not-allowed opacity-50 theme-card theme-border theme-sub select-none"
                >
                  <span
                    class="w-4 h-4 shrink-0 flex items-center justify-center"
                    v-html="p.icon"
                  ></span>
                  {{ t(p.labelKey) }}
                  <span
                    class="text-[9px] bg-slate-500/20 text-slate-400 px-1.5 py-0.5 rounded-full font-semibold"
                    >{{ t("branding.soon") }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            <div>
              <label class="text-xs theme-sub mb-1.5 block text-teal-400"
                >🟢 {{ t("branding.topicsInclude") }}</label
              >
              <textarea
                v-model="brand.topicsInclude"
                rows="3"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40"
                :placeholder="t('branding.topicsIncludePlaceholder')"
              ></textarea>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block text-rose-400"
                >🔴 {{ t("branding.topicsExclude") }}</label
              >
              <textarea
                v-model="brand.topicsExclude"
                rows="3"
                class="w-full px-3 py-2.5 rounded-xl theme-border theme-input text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40"
                :placeholder="t('branding.topicsExcludePlaceholder')"
              ></textarea>
            </div>
          </div>

          <!-- Brand Guidelines PDF -->
          <div class="pt-4 border-t border-theme">
            <h4
              class="font-display font-600 text-sm theme-text mb-1 flex items-center gap-2"
            >
              📄 {{ t("branding.uploadGuidelinesTitle") }}
            </h4>
            <p class="text-xs theme-sub mb-4">
              {{ t("branding.uploadGuidelinesDesc") }}
            </p>
            <div
              v-if="uploadedPdfName"
              class="flex items-center gap-3 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 mb-4"
            >
              <span class="text-teal-400 shrink-0">📑</span>
              <span class="text-sm text-teal-300 flex-1 truncate min-w-0">{{
                uploadedPdfName
              }}</span>
              <button
                @click="removePdf"
                class="text-slate-500 hover:text-rose-400 transition-colors shrink-0"
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
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div
              class="border-2 border-dashed border-theme rounded-xl p-6 sm:p-8 text-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
              :class="uploadingPdf ? 'opacity-50 pointer-events-none' : ''"
              @click="$refs.pdfInput.click()"
              @dragover.prevent
              @drop.prevent="handlePdfDrop"
            >
              <div v-if="uploadingPdf" class="flex flex-col items-center gap-2">
                <svg
                  class="w-7 h-7 animate-spin text-blue-400"
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
                <p class="text-xs theme-sub">
                  {{ t("branding.uploadingPdf") }}
                </p>
              </div>
              <template v-else>
                <div class="text-3xl mb-2">📑</div>
                <p class="text-xs theme-sub font-medium">
                  {{ t("branding.dragDropPDF") }}
                </p>
                <p class="text-[11px] text-muted mt-1">
                  {{ t("branding.pdfHint") }}
                </p>
              </template>
              <input
                ref="pdfInput"
                type="file"
                accept=".pdf"
                class="hidden"
                @change="handlePdfUpload"
              />
            </div>
            <p
              v-if="pdfMsg"
              class="text-xs mt-2 text-center"
              :class="
                pdfMsg.type === 'success' ? 'text-teal-400' : 'text-rose-400'
              "
            >
              {{ pdfMsg.text }}
            </p>
          </div>
        </div>
      </section>

      <!-- TAB: Top Posts -->
       <div v-if="activeTab === 'Top Posts' && isFreePlan" class="space-y-6">
        <div
          class="rounded-2xl theme-surface theme-border p-8 sm:p-12 text-center"
        >
          <div class="flex flex-col items-center gap-4">
            <div
              class="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30"
            >
              <svg
                class="w-10 h-10 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div class="space-y-2">
              <h3 class="font-display text-xl font-600 theme-text">
                {{ t("branding.topPostsLocked") || "Top Posts Feature" }}
              </h3>
              <p class="text-sm theme-sub max-w-md mx-auto leading-relaxed">
                {{
                  t("branding.topPostsLockedDesc") ||
                  "This feature is available on Pro and Enterprise plans. Upgrade to analyze your top-performing posts and boost your content strategy."
                }}
              </p>
            </div>
            <RouterLink
              to="/payment"
              class="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
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
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {{ t("branding.upgradeNow") || "Upgrade Now" }}
            </RouterLink>
          </div>
        </div>
      </div>

      <section
        v-if="activeTab === 'Top Posts'"
        class="space-y-6"
        aria-label="Top Posts"
      >
        <div class="theme-surface rounded-2xl theme-border p-4 sm:p-6">
          <!-- Header -->
          <div
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div class="max-w-xl">
              <h3 class="font-display font-600 text-base theme-text">
                📊 {{ t("branding.uploadPostsTitle") }}
              </h3>
              <p class="text-sm theme-sub mt-1 leading-relaxed">
                {{ t("branding.uploadPostsDesc") }}
              </p>
            </div>
            <button
              @click="openAddModal"
              class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all shadow-sm active:scale-95 shrink-0 whitespace-nowrap self-start sm:self-auto w-full sm:w-auto"
            >
              <svg
                class="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>{{ t("branding.addPost") }}</span>
            </button>
          </div>

          <!-- Loading -->
          <div v-if="tpLoading" class="py-12 flex justify-center">
            <svg
              class="w-6 h-6 animate-spin text-blue-400"
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

          <!-- Empty state -->
          <div
            v-else-if="!topPosts.length"
            class="py-14 flex flex-col items-center gap-3 rounded-xl theme-card theme-border text-center px-4"
          >
            <span class="text-4xl opacity-30">📭</span>
            <p class="text-sm theme-sub">{{ t("branding.tpEmpty") }}</p>
            <button
              @click="openAddModal"
              class="mt-1 px-5 py-2 rounded-xl bg-blue-600/15 text-blue-400 text-sm border border-blue-500/20 hover:bg-blue-600/25 transition-all active:scale-95"
            >
              {{ t("branding.tpAddFirst") }}
            </button>
          </div>

          <!-- Posts Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="post in topPosts"
              :key="post._id"
              class="rounded-xl theme-card theme-border overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div>
                <div
                  class="flex items-center gap-2 px-3 sm:px-4 py-3 border-b flex-wrap"
                  style="border-color: var(--border)"
                >
                  <span
                    class="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0"
                    :class="platformBadge(post.platform)"
                    >{{ t(getPlatformKey(post.platform)) }}</span
                  >
                  <span class="text-[11px] theme-muted shrink-0">{{
                    post.date || "—"
                  }}</span>
                  <span
                    v-if="post.embedded"
                    class="flex items-center gap-1 text-[10px] text-teal-400 shrink-0"
                  >
                    <div class="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                    {{ t("branding.embedded") }}
                  </span>
                  <span
                    v-if="post.source !== 'manual'"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 shrink-0"
                  >
                    {{ post.source === "link" ? "🔗" : "📄" }} {{ post.source }}
                  </span>
                  <button
                    @click="removePost(post._id)"
                    class="ms-auto text-slate-400 hover:text-rose-400 transition-colors p-1 shrink-0"
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
                <img
                  v-if="post.imageUrl"
                  :src="post.imageUrl"
                  class="w-full h-32 object-cover"
                />
                <div class="px-3 sm:px-4 py-3">
                  <p class="text-sm theme-text leading-relaxed line-clamp-3">
                    {{ post.content || "—" }}
                  </p>
                  <a
                    v-if="post.postUrl"
                    :href="post.postUrl"
                    target="_blank"
                    class="text-[11px] text-blue-400 hover:underline mt-1 block truncate"
                  >
                    {{ post.postUrl }}
                  </a>
                </div>
              </div>

              <!-- Stats grid -->
              <div
                class="grid grid-cols-3 gap-px border-t"
                style="border-color: var(--border)"
              >
                <!-- Likes -->
                <div class="flex flex-col items-center py-2.5 theme-card">
                  <span class="text-sm font-bold theme-text mb-1">{{
                    formatStat(post.stats?.likes)
                  }}</span>
                  <span class="text-[10px] theme-muted flex items-center gap-1">
                    <svg
                      class="w-3 h-3 text-rose-500 shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z"
                      />
                    </svg>
                    {{ t("branding.statLikes") }}
                  </span>
                </div>

                <!-- Comments -->
                <div class="flex flex-col items-center py-2.5 theme-card">
                  <span class="text-sm font-bold theme-text mb-1">{{
                    formatStat(post.stats?.comments)
                  }}</span>
                  <span class="text-[10px] theme-muted flex items-center gap-1">
                    <svg
                      class="w-3 h-3 text-blue-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2.5"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.92 1.786c-.247.281-.018.72.355.658a7.77 7.77 0 003.147-1.157c.176-.11.385-.136.57-.077 1.102.348 2.278.521 3.489.521z"
                      />
                    </svg>
                    {{ t("branding.statComments") }}
                  </span>
                </div>

                <!-- Shares -->
                <div class="flex flex-col items-center py-2.5 theme-card">
                  <span class="text-sm font-bold theme-text mb-1">{{
                    formatStat(post.stats?.shares)
                  }}</span>
                  <span class="text-[10px] theme-muted flex items-center gap-1">
                    <svg
                      class="w-3 h-3 text-teal-400 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      stroke-width="2.5"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22.032.441.046-.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l-3 3m3-3l3 3"
                      />
                    </svg>
                    {{ t("branding.statShares") }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Embed button -->
          <div
            v-if="topPosts.length"
            class="mt-5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
          >
            <button
              @click="embedAll"
              :disabled="tpEmbedding"
              class="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-50 shadow-sm active:scale-95"
            >
              <svg
                v-if="tpEmbedding"
                class="w-4 h-4 animate-spin"
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
              {{
                tpEmbedding ? t("branding.embedding") : t("branding.embedRAG")
              }}
            </button>
            <p v-if="tpEmbedMsg" class="text-xs text-teal-400">
              {{ tpEmbedMsg }}
            </p>
          </div>
        </div>
      </section>

      <!-- Add Post Modal -->
      <Teleport to="body">
        <Transition name="modal-fade">
          <div
            v-if="showAddModal"
            class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            @click.self="showAddModal = false"
          >
            <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <div
              class="relative w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl theme-surface theme-shadow overflow-hidden flex flex-col transition-all"
              style="border: 1px solid var(--border); max-height: 92vh"
            >
              <div
                class="flex items-center justify-between px-4 sm:px-6 py-4 border-b"
                style="border-color: var(--border)"
              >
                <h3 class="text-sm font-semibold theme-text">
                  {{ t("branding.tpAddTitle") }}
                </h3>
                <button
                  @click="showAddModal = false"
                  class="theme-muted hover:theme-text transition-colors p-1 rounded-lg hover:bg-slate-500/10"
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

              <div
                class="flex border-b bg-slate-500/5"
                style="border-color: var(--border)"
              >
                <button
                  v-for="m in [
                    { id: 'manual', label: t('branding.tpModeManual') },
                    { id: 'link', label: t('branding.tpModeLink') },
                    { id: 'doc', label: t('branding.tpModeDoc') },
                  ]"
                  :key="m.id"
                  @click="addMode = m.id"
                  class="flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-3 text-xs font-medium transition-all border-b-2 -mb-px"
                  :class="
                    addMode === m.id
                      ? 'border-blue-500 text-blue-400 bg-theme'
                      : 'border-transparent theme-sub hover:theme-text'
                  "
                >
                  <span>{{ m.icon }}</span> {{ m.label }}
                </button>
              </div>

              <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                <template v-if="addMode === 'link'">
                  <div class="flex gap-2">
                    <input
                      v-model="linkUrl"
                      type="url"
                      :placeholder="t('branding.tpLinkPlaceholder')"
                      class="flex-1 min-w-0 px-3 py-2.5 rounded-xl theme-input theme-border text-sm theme-text focus:outline-none focus:border-blue-500/40"
                    />
                    <button
                      @click="fetchFromLink"
                      :disabled="addLoading || !linkUrl"
                      class="px-3 sm:px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <svg
                        v-if="addLoading"
                        class="w-4 h-4 animate-spin"
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
                      <span>{{ t("branding.tpFetch") }}</span>
                    </button>
                  </div>
                  <p class="text-[11px] theme-muted">
                    {{ t("branding.tpLinkHint") }}
                  </p>
                </template>

                <template v-if="addMode === 'doc'">
                  <div
                    class="border-2 border-dashed border-theme rounded-xl p-6 sm:p-8 text-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
                    @click="$refs.docInput.click()"
                  >
                    <div class="text-3xl mb-2">📎</div>
                    <p class="text-sm theme-sub font-medium">
                      {{ docFile ? docFile.name : t("branding.tpDocDrop") }}
                    </p>
                    <p class="text-xs theme-muted mt-1">
                      {{ t("branding.docFormatsHint") }}
                    </p>
                    <input
                      ref="docInput"
                      type="file"
                      accept=".pdf,.docx,.doc,.png,.jpg,.jpeg,.webp"
                      class="hidden"
                      @change="handleDocFile"
                    />
                  </div>
                  <button
                    v-if="docFile"
                    @click="extractFromDoc"
                    :disabled="addLoading"
                    class="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <svg
                      v-if="addLoading"
                      class="w-4 h-4 animate-spin"
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
                    <span>{{
                      addLoading
                        ? t("branding.tpExtracting")
                        : t("branding.tpExtract")
                    }}</span>
                  </button>
                </template>

                <template v-if="addMode === 'manual' || newPost.content">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        class="text-[11px] theme-muted mb-1 block font-medium"
                        >{{ t("branding.tpPlatform") }}</label
                      >
                      <select
                        v-model="newPost.platform"
                        class="w-full px-3 py-2 rounded-xl theme-input theme-border text-sm theme-text focus:outline-none focus:border-blue-500/40 bg-transparent"
                      >
                        <option
                          v-for="p in platformOptions"
                          :key="p.name"
                          :value="p.name"
                          class="theme-surface theme-text"
                        >
                          {{ t(p.labelKey) }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        class="text-[11px] theme-muted mb-1 block font-medium"
                        >{{ t("branding.tpDate") }}</label
                      >
                      <input
                        v-model="newPost.date"
                        type="date"
                        class="w-full px-3 py-2 rounded-xl theme-input theme-border text-sm theme-text focus:outline-none focus:border-blue-500/40"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      class="text-[11px] theme-muted mb-1 block font-medium"
                      >{{ t("branding.tpContent") }}</label
                      >
                    <textarea
                      v-model="newPost.content"
                      rows="3"
                      class="w-full px-3 py-2 rounded-xl theme-input theme-border text-sm theme-text resize-none focus:outline-none focus:border-blue-500/40"
                      :placeholder="t('branding.tpContentPlaceholder')"
                    ></textarea>
                  </div>

                  <div>
                    <label
                      class="text-[11px] theme-muted mb-2 block font-semibold"
                      >📊 {{ t("branding.tpStats") }}</label
                    >
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div
                        v-for="stat in ['likes', 'comments', 'shares']"
                        :key="stat"
                      >
                        <label
                          class="text-[10px] theme-muted capitalize block mb-1 font-medium"
                        >
                          {{
                            t(
                              "branding.stat" +
                                stat.charAt(0).toUpperCase() +
                                stat.slice(1),
                            )
                          }}
                        </label>
                        <input
                          v-model.number="newPost.stats[stat]"
                          type="number"
                          min="0"
                          class="w-full px-2 py-2 rounded-xl theme-input theme-border text-sm theme-text focus:outline-none focus:border-blue-500/40 text-center"
                        />
                      </div>
                    </div>
                  </div>
                </template>

                <p
                  v-if="addError"
                  class="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20"
                >
                  {{ addError }}
                </p>
              </div>

              <div
                class="flex gap-3 px-4 sm:px-6 py-4 border-t bg-slate-500/5"
                style="border-color: var(--border)"
              >
                <button
                  @click="showAddModal = false"
                  class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text hover:bg-slate-500/5 transition-colors"
                >
                  {{ t("common.cancel") }}
                </button>
                <button
                  @click="saveNewPost"
                  :disabled="addLoading"
                  class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {{
                    addLoading ? t("branding.saving") : t("branding.tpSavePost")
                  }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

    <!-- Toast Notifications -->
    <Teleport to="body">
      <TransitionGroup name="toast" tag="div"
        class="fixed z-[9999] flex flex-col gap-2 pointer-events-none"
        :class="locale === 'ar' ? 'bottom-5 left-5 items-start' : 'bottom-5 right-5 items-end'">
        <div v-for="toast in toasts" :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-[340px] w-full sm:w-auto"
          :class="[
            toast.type === 'success' ? 'bg-emerald-500 text-white' :
            toast.type === 'warning' ? 'bg-amber-400 text-slate-900' :
            'bg-rose-500 text-white',
            locale === 'ar' ? 'flex-row-reverse text-right' : ''
          ]">
          <span class="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold bg-white/25">
            {{ toast.type === 'success' ? '✓' : toast.type === 'warning' ? '!' : '✕' }}
          </span>
          <p class="text-sm font-semibold leading-snug flex-1 m-0">{{ toast.message }}</p>
          <button @click="removeToast(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
            :class="locale === 'ar' ? 'order-first' : ''">✕</button>
        </div>
      </TransitionGroup>
    </Teleport>

    </div>
  </AppLayout>
</template>
<script setup>
import AppLayout from "../components/AppLayout.vue";
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";
import { useI18n } from "vue-i18n";
import brandApi from "../api/brandApi";
import topPostsApi from "../api/topPostsApi";

const { t, locale } = useI18n();
const toasts = ref([]);
const authStore = useAuthStore();

// Check if user is on Free plan
const isFreePlan = computed(() => {
  const plan = authStore.user?.plan || "free";
  return plan === "free" || plan === "";
});

let toastIdCounter = 0;
function showToast(message, type = 'success', duration = 4000) {
  const id = ++toastIdCounter;
  toasts.value.push({ id, message, type });
  setTimeout(() => removeToast(id), duration);
}
function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id);
}

const activeTab = ref("Brand Identity");

const tabs = computed(() => [
  { key: "Brand Identity", labelKey: "branding.tabIdentity" },
  {
    key: "Top Posts",
    labelKey: "branding.tabPosts",
    locked: isFreePlan.value,
  },
]);

const newColor = ref("#000000");
const newColorHex = ref("#000000");

function syncColorPicker() {
  newColorHex.value = newColor.value.toUpperCase();
}
function syncHexInput() {
  if (newColorHex.value.startsWith("#") && newColorHex.value.length === 7) {
    newColor.value = newColorHex.value;
  }
}

const brand = ref({
  name: "",
  industry: "",
  market: "",
  audience: "",
  colors: [],
  font: "",
  voice: "",
  dialects: [],
  topicsInclude: "",
  topicsExclude: "",
  platforms: [],
  logoPreview: null,
});

// AI Detected colors from logo
const detectedColors = ref([]);
const extractingColors = ref(false);

/**
 * Extract dominant colors from an image using canvas
 * Pure JavaScript - no external libraries needed
 * Uses color quantization and frequency analysis
 */
function extractColorsFromImage(imageSrc) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Resize to max 150px for performance while keeping aspect ratio
        const maxSize = 150;
        let width = img.naturalWidth;
        let height = img.naturalHeight;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = Math.floor(width);
        canvas.height = Math.floor(height);
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const colorMap = new Map();

        // Sample every 4th pixel for performance (step = 4)
        const step = 4;

        for (let i = 0; i < data.length; i += step * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent pixels
          if (a < 128) continue;

          // Skip near-white and near-black (background colors)
          const brightness = (r + g + b) / 3;
          if (brightness > 245 || brightness < 15) continue;

          // Skip low saturation colors (grays)
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          if (saturation < 0.15) continue;

          // Quantize colors to reduce similar colors (round to nearest 24)
          const qr = Math.round(r / 24) * 24;
          const qg = Math.round(g / 24) * 24;
          const qb = Math.round(b / 24) * 24;

          // Clamp to valid RGB range
          const cr = Math.min(255, Math.max(0, qr));
          const cg = Math.min(255, Math.max(0, qg));
          const cb = Math.min(255, Math.max(0, qb));

          const hex = `#${cr.toString(16).padStart(2, '0')}${cg.toString(16).padStart(2, '0')}${cb.toString(16).padStart(2, '0')}`.toUpperCase();

          colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
        }

        // Sort by frequency and get top 6 colors
        const sortedColors = Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([color]) => color);

        resolve(sortedColors);
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
}

async function handleLogo(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast(t("branding.logoSizeError"), 'warning');
    e.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = async (ev) => {
    brand.value.logoPreview = ev.target.result;

    // Extract colors from logo automatically
    try {
      extractingColors.value = true;
      const colors = await extractColorsFromImage(ev.target.result);
      detectedColors.value = colors;

      if (colors.length > 0) {
        // Auto-add first 2 colors if brand colors are empty
        if (brand.value.colors.length === 0) {
          colors.slice(0, 2).forEach(c => {
            if (!brand.value.colors.includes(c)) {
              brand.value.colors.push(c);
            }
          });
          showToast(t("branding.colorsAutoAdded") || "Colors auto-detected from logo!", 'success');
        } else {
          showToast(t("branding.colorsDetected") || "Logo colors detected - click to add them", 'success');
        }
      }
    } catch (err) {
      console.error("Color extraction failed:", err);
      // Silently fail - colors are optional
    } finally {
      extractingColors.value = false;
    }
  };
  reader.readAsDataURL(file);
  e.target.value = "";
}

function addDetectedColor(color) {
  if (!brand.value.colors.includes(color)) {
    brand.value.colors.push(color);
    showToast(t("branding.colorAdded") || "Color added!", 'success');
  }
}

function removeLogo() {
  brand.value.logoPreview = null;
  detectedColors.value = [];
}

function addColor() {
  if (newColorHex.value) {
    brand.value.colors.push(newColorHex.value);
  }
}
function toggleDialect(d) {
  const i = brand.value.dialects.indexOf(d);
  i === -1 ? brand.value.dialects.push(d) : brand.value.dialects.splice(i, 1);
}
function toggleItem(arr, item) {
  const i = arr.indexOf(item);
  i === -1 ? arr.push(item) : arr.splice(i, 1);
}

const platformOptions = [
  {
    name: "Instagram",
    labelKey: "branding.platform.instagram",
    icon: `<svg viewBox="0 0 24 24" fill="none" class="w-4 h-4"><defs><radialGradient id="ig1" cx="30%" cy="107%" r="150%"><stop offset="0%" stop-color="#fdf497"/><stop offset="5%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></radialGradient></defs><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig1)"/><path d="M12 7a5 5 0 100 10A5 5 0 0012 7zm0 8a3 3 0 110-6 3 3 0 010 6z" fill="white"/><circle cx="17.5" cy="6.5" r="1.5" fill="white"/></svg>`,
  },
  {
    name: "Facebook",
    labelKey: "branding.platform.facebook",
    icon: `<svg viewBox="0 0 24 24" class="w-4 h-4" fill="#1877F2"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.883v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>`,
  },
  {
    name: "LinkedIn",
    labelKey: "branding.platform.linkedin",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
  },
  {
    name: "X",
    labelKey: "branding.platform.x",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  },
  {
    name: "TikTok",
    labelKey: "branding.platform.tiktok",
    icon: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
  },
];

const ACTIVE_PLATFORM_NAMES = ["Instagram", "Facebook"];
const activePlatforms = platformOptions.filter((p) =>
  ACTIVE_PLATFORM_NAMES.includes(p.name),
);
const comingSoonPlatforms = platformOptions.filter(
  (p) => !ACTIVE_PLATFORM_NAMES.includes(p.name),
);

const marketOptions = [
  { value: "Egypt", labelKey: "branding.market.egypt" },
  { value: "Saudi Arabia", labelKey: "branding.market.saudi" },
  { value: "UAE", labelKey: "branding.market.uae" },
  { value: "Kuwait", labelKey: "branding.market.kuwait" },
  { value: "Jordan", labelKey: "branding.market.jordan" },
  { value: "Lebanon", labelKey: "branding.market.lebanon" },
  { value: "GCC (All)", labelKey: "branding.market.gcc" },
  { value: "MENA (All)", labelKey: "branding.market.mena" },
];

const tones = ref([
  { leftKey: "branding.toneForml", rightKey: "branding.toneCasual", value: 70 },
  {
    leftKey: "branding.toneSerious",
    rightKey: "branding.tonePlayful",
    value: 65,
  },
  {
    leftKey: "branding.toneProfessional",
    rightKey: "branding.toneFriendly",
    value: 75,
  },
]);

const dialects = [
  { value: "Arabic (EGY)", labelKey: "branding.dialect.egy" },
  { value: "Arabic (Gulf)", labelKey: "branding.dialect.gulf" },
  { value: "Levantine Arabic", labelKey: "branding.dialect.levantine" },
  { value: "English", labelKey: "branding.dialect.english" },
  { value: "Bilingual", labelKey: "branding.dialect.bilingual" },
];

const topPosts = ref([]);
const tpLoading = ref(false);
const tpEmbedding = ref(false);
const tpEmbedMsg = ref("");

const showAddModal = ref(false);
const addMode = ref("manual");
const addLoading = ref(false);
const addError = ref("");
const linkUrl = ref("");
const docFile = ref(null);
const newPost = ref({
  platform: "",
  content: "",
  imageUrl: "",
  postUrl: "",
  date: "",
  stats: { likes: 0, comments: 0, shares: 0 },
});

async function loadTopPosts() {
  if (!currentBrandId.value) return;
  tpLoading.value = true;
  try {
    topPosts.value = await topPostsApi.getAll(currentBrandId.value);
  } catch {
    /* silent */
  } finally {
    tpLoading.value = false;
  }
}

function openAddModal() {
  addMode.value = "manual";
  addError.value = "";
  linkUrl.value = "";
  docFile.value = null;
  newPost.value = {
    platform: "",
    content: "",
    imageUrl: "",
    postUrl: "",
    date: "",
    stats: {
      likes: 0,
      comments: 0,
      shares: 0,
      reach: 0,
      saves: 0,
      engagementRate: 0,
    },
  };
  showAddModal.value = true;
}

async function fetchFromLink() {
  if (!linkUrl.value) return;
  addLoading.value = true;
  addError.value = "";
  try {
    const data = await topPostsApi.fromLink(
      currentBrandId.value,
      linkUrl.value,
    );
    Object.assign(newPost.value, data);
  } catch (e) {
    addError.value = e.message || t("branding.tpLinkError");
  } finally {
    addLoading.value = false;
  }
}

async function handleDocFile(e) {
  docFile.value = e.target.files[0] || null;
}

async function extractFromDoc() {
  if (!docFile.value) return;
  addLoading.value = true;
  addError.value = "";
  try {
    const data = await topPostsApi.fromDoc(currentBrandId.value, docFile.value);
    Object.assign(newPost.value, data);
    addMode.value = "manual";
  } catch (e) {
    addError.value = e.message || t("branding.tpDocError");
  } finally {
    addLoading.value = false;
  }
}

async function saveNewPost() {
  if (!newPost.value.content && !newPost.value.postUrl) {
    addError.value = t("branding.tpContentRequired");
    return;
  }
  addLoading.value = true;
  addError.value = "";
  try {
    const saved = newPost.value.source
      ? await topPostsApi.saveExtracted(currentBrandId.value, newPost.value)
      : await topPostsApi.saveManual(currentBrandId.value, newPost.value);
    topPosts.value.unshift(saved);
    showAddModal.value = false;
  } catch (e) {
    addError.value = e.message;
  } finally {
    addLoading.value = false;
  }
}

async function removePost(id) {
  await topPostsApi.remove(id);
  topPosts.value = topPosts.value.filter((p) => p._id !== id);
}

async function embedAll() {
  if (!currentBrandId.value) return;
  tpEmbedding.value = true;
  tpEmbedMsg.value = "";
  try {
    const res = await topPostsApi.embed(currentBrandId.value);
    topPosts.value.forEach((p) => (p.embedded = true));
    tpEmbedMsg.value = t("branding.tpEmbedDone", { count: res.postsCount });
  } catch (e) {
    tpEmbedMsg.value = e.message;
  } finally {
    tpEmbedding.value = false;
  }
}

const currentBrandId = ref(localStorage.getItem("cf_brandId") || null);

onMounted(async () => {
  try {
    const brands = await brandApi.getMyBrands();
    if (brands?.length) {
      const b = brands[0];
      currentBrandId.value = b._id;
      localStorage.setItem("cf_brandId", b._id);
      brand.value = {
        name: b.name || "",
        industry: b.industry || "",
        website: b.website || "",
        audience: b.targetAudience || "",
        dialects: b.dialects || [],
        tones: b.tones || [],
        platforms: b.platforms || [],
        avoidTopics: b.avoidTopics || "",
        colors: b.colors || [],
        font: b.font || "",
        voice: b.voice || "",
        market: b.market || "",
        topicsInclude: b.topicsInclude || "",
        topicsExclude: b.topicsExclude || "",
        logoPreview: b.logoPreview || null,
      };
    } else {
      currentBrandId.value = null;
      localStorage.removeItem("cf_brandId");
    }
    await loadTopPosts();
  } catch (err) {
    console.error("Brand load error:", err);
  }
});

async function saveAll() {
  try {
    if (currentBrandId.value) {
      await brandApi.updateBrand(currentBrandId.value, brand.value);
      await brandApi.embedBrand(currentBrandId.value);
    } else {
      const result = await brandApi.saveBrand(brand.value);
      currentBrandId.value = result.brand._id;
      localStorage.setItem("cf_brandId", result.brand._id);
      await brandApi.embedBrand(result.brand._id);
    }
    showToast(t("branding.savedSuccess"), 'success');
  } catch (err) {
    showToast(t("branding.saveFailed", { msg: err.message }), 'error');
  }
}

function platformBadge(platform) {
  const map = {
    Instagram: "bg-pink-500/15 text-pink-400 border border-pink-500/20",
    Facebook: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    LinkedIn: "bg-sky-500/15 text-sky-400 border border-sky-500/20",
    "Twitter/X": "bg-slate-500/15 text-slate-300 border border-slate-500/20",
    TikTok: "bg-teal-500/15 text-teal-400 border border-teal-500/20",
  };
  return map[platform] || "bg-slate-500/15 text-slate-400";
}

function formatStat(n) {
  if (!n) return "0";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return String(n);
}

const uploadedPdfName = ref(null);
const uploadingPdf = ref(false);
const pdfMsg = ref(null);

async function handlePdfUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  await uploadPdf(file);
  e.target.value = "";
}

function handlePdfDrop(e) {
  const file = e.dataTransfer.files[0];
  if (file?.type === "application/pdf") uploadPdf(file);
}

async function uploadPdf(file) {
  uploadingPdf.value = true;
  pdfMsg.value = null;
  try {
    if (!currentBrandId.value) {
      pdfMsg.value = {
        type: "info",
        text: t("branding.savingBrandFirst"),
      };
      const result = await brandApi.saveBrand(brand.value);
      currentBrandId.value = result.brand._id;
      localStorage.setItem("cf_brandId", result.brand._id);
    }
    await brandApi.uploadGuidelines(currentBrandId.value, file);
    uploadedPdfName.value = file.name;
    pdfMsg.value = { type: "success", text: t("branding.pdfUploaded") };
  } catch (err) {
    pdfMsg.value = {
      type: "error",
      text: err.message || t("branding.pdfError"),
    };
  } finally {
    uploadingPdf.value = false;
  }
}

function removePdf() {
  uploadedPdfName.value = null;
  pdfMsg.value = null;
}

function getPlatformKey(platformName) {
  const match = platformOptions.find(
    (p) =>
      p.name === platformName ||
      (platformName === "Twitter/X" && p.name === "X"),
  );
  return match ? match.labelKey : "branding.platform.instagram";
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.toast-move {
  transition: transform 0.3s ease;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>