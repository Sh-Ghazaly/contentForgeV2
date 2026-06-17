<template>
  <AppLayout>
    <div class="flex flex-col h-full">
      <!-- Page toolbar -->
      <div
        class="px-4 sm:px-6 py-3 sm:py-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between sticky top-0 z-10 theme-glass gap-3"
        style="border-color: var(--border)"
      >
        <!-- ROW 1: Title and Date Range (Tuck inside a row wrapper that handles mobile distribution) -->
        <div class="flex items-center justify-between sm:contents w-full">
          <div class="min-w-0">
            <h1
              class="font-display text-base sm:text-lg font-600 theme-text truncate"
            >
              {{ t("dashboard.title") }}
            </h1>
            <p class="text-xs theme-sub mt-0.5 whitespace-normal sm:truncate">
              <template v-if="currentCalendar">
                {{ calendarDateRange }} · {{ store.posts?.length || 0 }}
                {{ t("dashboard.postsPlanned") }}
              </template>
              <template v-else>{{ t("dashboard.noCalendar") }}</template>
            </p>
          </div>
        </div>

        <!-- ROW 2 (Mobile): Action Buttons -->
        <!-- Using flex-row-reverse globally keeps the green check/actions consistently ordered relative to the language direction, while self-end / sm:justify-end handles proper container placement -->
        <div
          class="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap self-end sm:self-auto justify-end flex-row"
        >
          <!-- Top trend badge — hidden on mobile -->
          <span
            v-if="topTrend"
            class="hidden sm:inline text-[11px] px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 cursor-default"
            :title="`${t('dashboard.trending')} ${topTrend.change}`"
          >
            ✦ {{ topTrend.tag }}
          </span>

          <template v-if="currentCalendar">
            <!-- Approve -->
            <button
              @click="approvePlan"
              :disabled="approving || planApproved"
              class="group px-2.5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-500 transition-all duration-200 disabled:opacity-50 flex items-center overflow-hidden"
            >
              <svg
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span
                class="max-w-0 group-hover:max-w-[7rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
              >
                {{
                  approving
                    ? t("dashboard.approving")
                    : t("dashboard.approvePlan")
                }}
              </span>
            </button>

            <div class="w-px h-5 bg-white/10 hidden sm:block"></div>

            <!-- Reset -->
            <button
              @click="confirmReset"
              class="group px-2.5 py-2 rounded-xl border border-zinc-600/50 text-zinc-400 hover:bg-zinc-700/40 transition-all duration-200 flex items-center overflow-hidden"
            >
              <svg
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3v5h5"
                />
              </svg>
              <span
                class="max-w-0 group-hover:max-w-[8rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
              >
                {{ t("dashboard.resetCalendar") }}
              </span>
            </button>

            <div class="w-px h-5 bg-white/10 hidden sm:block"></div>

            <!-- Delete -->
            <button
              @click="confirmDelete"
              class="group px-2.5 py-2 rounded-xl bg-rose-600/10 text-rose-400 border border-rose-500/20 hover:bg-rose-600/20 transition-all duration-200 flex items-center overflow-hidden"
            >
              <svg
                class="w-3.5 h-3.5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span
                class="max-w-0 group-hover:max-w-[8rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
              >
                {{ t("dashboard.deleteCalendar") }}
              </span>
            </button>
          </template>

          <div class="w-px h-5 bg-white/10 hidden sm:block"></div>

          <!-- Generate -->
          <button
            v-if="!currentCalendar"
            @click="showModal = true"
            class="px-3 sm:px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors flex items-center gap-1.5"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span class="hidden sm:inline"
              ><strong>{{ t("dashboard.generatePlan") }}</strong></span
            >
            <span class="sm:hidden"
              ><strong>{{ t("dashboard.generatePlan") }}</strong></span
            >
          </button>

          <!-- Regenerate -->
          <button
            v-if="currentCalendar"
            @click="openRegenerate"
            class="group px-2.5 py-2 rounded-xl theme-card theme-border theme-sub hover:theme-text transition-all duration-200 flex items-center overflow-hidden"
          >
            <svg
              class="w-3.5 h-3.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span
              class="max-w-0 group-hover:max-w-[8rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
            >
              {{ t("dashboard.regenerateCalendar") }}
            </span>
          </button>

          <!-- Add Post button — يظهر بس لو في calendar ومتناسق مع باقي الزراير في الهوفر -->
          <button
            v-if="currentCalendar"
            @click="showAddPostModal = true"
            class="group px-2.5 py-2 rounded-xl theme-card theme-border theme-sub hover:theme-text transition-all duration-200 flex items-center overflow-hidden"
          >
            <svg
              class="w-3.5 h-3.5 shrink-0"
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

            <span
              class="max-w-0 group-hover:max-w-[7rem] overflow-hidden transition-all duration-200 whitespace-nowrap text-xs font-medium group-hover:ml-1.5"
            >
              {{ t("branding.addPost") }}
            </span>
          </button>

          <!-- Trends toggle — mobile/tablet only -->
          <button
            @click="trendsOpen = !trendsOpen"
            class="lg:hidden px-2.5 py-2 rounded-xl theme-card theme-border theme-sub hover:theme-text transition-colors flex items-center gap-1.5 text-xs"
          >
            🔥
          </button>
        </div>
      </div>

      <div class="flex flex-1 overflow-hidden">
        <!-- Calendar area -->
        <div class="flex-1 overflow-auto p-3 sm:p-6">
          <!-- Day labels — horizontal scroll on mobile -->
          <div class="overflow-x-auto">
            <div
              class="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3 min-w-[560px]"
            >
              <div
                v-for="d in weekDays"
                :key="d"
                class="text-center text-[10px] sm:text-[11px] theme-muted font-medium py-1"
              >
                {{ d }}
              </div>
            </div>

            <!-- Empty state -->
            <div
              v-if="filteredWeeks.length === 0 && !loadingCalendar"
              class="flex flex-col items-center justify-center py-24 theme-sub gap-3"
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {{ t("dashboard.generatePlan") }}
            </div>

            <!-- Loading state -->
            <div
              v-if="loadingCalendar"
              class="flex flex-col items-center justify-center py-24 gap-3 theme-sub"
            >
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
              <p class="text-sm">{{ t("dashboard.generating") }}</p>
              <p class="text-xs opacity-60">
                {{ t("dashboard.generatingHint") }}
              </p>
            </div>

            <!-- Weeks -->
            <div
              v-if="!loadingCalendar"
              class="space-y-2 sm:space-y-3 min-w-[560px]"
            >
              <div
                v-for="week in filteredWeeks"
                :key="week.id"
                class="grid grid-cols-7 gap-1.5 sm:gap-3"
              >
                <div
                  v-for="dayCell in week.cells"
                  :key="dayCell.id"
                  @dragover.prevent
                  @dragenter="dragOverId = dayCell.rawDate"
                  @dragleave="dragOverId = null"
                  @drop="onDrop(dayCell)"
                  class="rounded-xl border p-1.5 sm:p-2 flex flex-col min-h-[100px] sm:min-h-[160px] transition-all theme-card relative overflow-hidden"
                  :class="[
                    dragOverId === dayCell.rawDate && dayCell.rawDate
                      ? 'ring-2 ring-amber-400/50 border-amber-400/50 bg-amber-500/5 scale-[1.01]'
                      : '',
                    dayCell.cellClass,
                  ]"
                  style="border-color: var(--border)"
                >
                  <div
                    class="flex items-center justify-between mb-1 sm:mb-2 px-0.5 sm:px-1"
                  >
                    <span
                      class="text-[9px] sm:text-[11px] font-semibold tracking-wide"
                      :class="
                        dayCell.posts && dayCell.posts.length > 0
                          ? 'theme-text'
                          : 'theme-muted'
                      "
                    >
                      {{ dayCell.date }}
                    </span>
                    <span
                      v-if="dayCell.posts && dayCell.posts.length > 1"
                      class="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium"
                    >
                      {{ dayCell.posts.length }}
                    </span>
                  </div>

                  <div
                    class="flex flex-col gap-1 sm:gap-2 flex-1 overflow-y-scroll overflow-x-hidden max-h-[200px] sm:max-h-[340px] no-scrollbar"
                  >
                    <template v-if="dayCell.posts && dayCell.posts.length > 0">
                      <div
                        v-for="post in dayCell.posts"
                        :key="post._id || post.id"
                        draggable="true"
                        @dragstart="onDragStart(post)"
                        @click.stop="selectPost(post)"
                        class="relative rounded-lg border p-1.5 sm:p-2.5 flex flex-col justify-between transition-all duration-200 ease-in-out w-full aspect-square cursor-grab shadow-sm shrink-0 select-none active:cursor-grabbing active:scale-[0.97]"
                        :class="[
                          statusToClass(post.status),
                          getHoverStatusClass(post.status),
                        ]"
                      >
                        <div class="flex items-start justify-between">
                          <span
                            class="text-[7px] sm:text-[9px] font-mono opacity-60 text-left"
                          >
                            {{ dayCell.date }}
                          </span>
                          <span
                            v-if="post.platform"
                            class="text-[7px] sm:text-[8px] px-1 py-0.5 rounded font-medium transform -mt-0.5"
                            :class="platformBadge(post.platform)"
                          >
                            {{
                              t(
                                `dashboard.platformName.${post.platform}`,
                                post.platform,
                              )
                            }}
                          </span>
                        </div>
                        <p
                          class="text-[8px] sm:text-[10px] leading-snug theme-sub flex-1 line-clamp-2 sm:line-clamp-3 mt-1 text-left"
                        >
                          {{ post.copyAR || post.copy || post.text }}
                        </p>
                        <div
                          class="flex items-center justify-between mt-1 pt-1 border-t border-white/5"
                        >
                          <span
                            v-if="post.status"
                            class="text-[7px] sm:text-[8px] font-medium tracking-wide"
                            :class="statusColor(post.status)"
                          >
                            ●
                            {{
                              t(
                                `dashboard.statusName.${post.status}`,
                                post.status,
                              )
                            }}
                          </span>
                        </div>
                      </div>
                    </template>
                    <div
                      v-else-if="dayCell.rawDate"
                      class="text-[9px] sm:text-[10px] theme-muted flex-1 flex items-center justify-center opacity-40 italic py-2 sm:py-4"
                    >
                      —
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div
            v-if="filteredWeeks.length > 0"
            class="flex items-center gap-3 sm:gap-5 flex-wrap mt-4 sm:mt-5 pt-4 border-t"
            style="border-color: var(--border)"
          >
            <p class="text-[11px] theme-muted font-medium">
              {{ t("dashboard.status") }}:
            </p>
            <div
              v-for="s in legend"
              :key="s.labelKey"
              class="flex items-center gap-1.5"
            >
              <div class="w-1.5 h-1.5 rounded-full" :class="s.dot"></div>
              <span class="text-[10px] theme-sub">{{ t(s.labelKey) }}</span>
            </div>
          </div>
        </div>

        <!-- Trends panel — hidden on mobile, toggle button shows it -->
        <!-- Mobile backdrop -->
        <Transition name="fade">
          <div
            v-if="trendsOpen"
            class="fixed inset-0 z-30 bg-black/50 lg:hidden"
            :class="locale === 'ar' ? 'left-0' : 'right-0'"
            @click="trendsOpen = false"
          />
        </Transition>

        <div
          class="fixed lg:relative top-0 h-full z-40 lg:z-auto w-64 lg:w-52 lg:p-4 pt-20 p-4 space-y-3 overflow-y-auto transition-transform duration-300 theme-sidebar"
          :class="[
            locale === 'ar' ? 'left-0 border-r' : 'right-0 border-l',
            trendsOpen || isTrendsAlwaysVisible
              ? 'translate-x-0'
              : locale === 'ar'
                ? '-translate-x-full'
                : 'translate-x-full',
          ]"
          style="border-color: var(--border)"
        >
          <div class="flex items-center justify-between lg:hidden mb-2">
            <p class="text-xs font-medium theme-text">
              🔥 {{ t("dashboard.trendingNow") }}
            </p>
            <button
              @click="trendsOpen = false"
              class="theme-muted hover:theme-text p-1 rounded-lg"
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

          <div class="rounded-xl theme-surface theme-border p-3">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-medium theme-text hidden lg:block">
                🔥 {{ t("dashboard.trendingNow") }}
              </p>
              <span v-if="trendsLastUpdated" class="text-[9px] theme-muted">{{
                trendsLastUpdated
              }}</span>
            </div>
            <div class="space-y-2">
              <div
                v-for="trend in trends"
                :key="trend.tag"
                class="flex items-center justify-between"
              >
                <span class="text-[11px] theme-sub">{{ trend.tag }}</span>
                <span class="text-[10px]" :class="trend.color">{{
                  trend.change
                }}</span>
              </div>
            </div>
            <button
              @click="injectTrend"
              class="w-full mt-3 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] hover:theme-text transition-colors"
            >
              {{ t("dashboard.injectTrend") }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Post Detail Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="selectedPost"
          class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6"
          @click.self="selectedPost = null"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div
            class="relative w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl theme-surface theme-shadow overflow-hidden"
            style="border: 1px solid var(--border)"
          >
            <!-- Modal Header -->
            <div
              class="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b shrink-0 flex-wrap"
              style="border-color: var(--border)"
            >
              <span
                class="text-[11px] px-2.5 py-1 rounded-full font-medium"
                :class="platformBadge(selectedPost.platform)"
              >
                {{
                  t(
                    `dashboard.platformName.${selectedPost.platform}`,
                    selectedPost.platform,
                  )
                }}
              </span>
              <span
                class="text-[11px] px-2.5 py-1 rounded-full theme-card theme-border theme-muted"
              >
                {{ selectedPost.dialect || t("dashboard.arabic") }}
              </span>
              <span
                class="text-[11px] px-2.5 py-1 rounded-full font-medium"
                :class="
                  statuses
                    .find((s) => s.value === selectedPost.status)
                    ?.dot?.replace('bg-', 'bg-')
                    ?.replace('-500', '-500/20') || 'bg-slate-500/20'
                "
              >
                {{
                  t(
                    statuses.find((s) => s.value === selectedPost.status)
                      ?.labelKey || "",
                    selectedPost.status,
                  )
                }}
              </span>
              <span class="text-[11px] theme-muted">
                {{
                  selectedPost.scheduledDate
                    ? new Date(selectedPost.scheduledDate).toLocaleDateString(
                        locale === "ar" ? "ar-EG" : "en-GB",
                        { day: "numeric", month: "short" },
                      )
                    : ""
                }}
              </span>
              <button
                @click="selectedPost = null"
                class="w-8 h-8 rounded-xl theme-card theme-border flex items-center justify-center theme-muted hover:theme-text transition-colors ml-auto"
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

            <!-- Tabs -->
            <div
              class="flex gap-0 border-b shrink-0 overflow-x-auto"
              style="border-color: var(--border)"
            >
              <button
                v-for="tab in modalTabs"
                :key="tab.id"
                @click="activeModalTab = tab.id"
                class="flex items-center gap-1.5 px-4 sm:px-5 py-3 text-xs font-medium transition-all border-b-2 -mb-px whitespace-nowrap"
                :class="
                  activeModalTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent theme-sub hover:theme-text'
                "
              >
                {{ tab.icon }} {{ tab.label }}
              </button>
            </div>

            <!-- Scrollable Body -->
            <div class="flex-1 overflow-y-auto">
              <!-- TAB: Edit -->
              <div
                v-if="activeModalTab === 'edit'"
                class="p-4 sm:p-6 space-y-5"
              >
                <div>
                  <label
                    class="text-xs font-medium theme-sub mb-2 flex items-center gap-1.5"
                  >
                    {{ t("dashboard.editPost") }}
                  </label>
                  <textarea
                    v-model="editCopy"
                    rows="4"
                    dir="auto"
                    class="text-start w-full theme-input rounded-xl p-3.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40 resize-none leading-relaxed"
                    style="border-color: var(--border)"
                  ></textarea>
                </div>
                <div v-if="selectedPost.copyAR">
                  <label
                    class="text-xs font-medium theme-sub mb-2 flex items-center gap-1.5"
                  >
                    {{ t("dashboard.arabic") }}
                  </label>
                  <p
                    class="text-sm theme-sub leading-relaxed text-start p-3.5 rounded-xl theme-card theme-border font-arabic"
                    dir="auto"
                  >
                    {{ selectedPost.copyAR }}
                  </p>
                </div>
                <div>
                  <label class="text-xs font-medium theme-sub mb-2 block"
                    ># {{ t("dashboard.hashtags") }}</label
                  >
                  <div
                    class="flex flex-wrap gap-1.5 p-3 rounded-xl theme-card theme-border"
                  >
                    <span
                      v-for="tag in selectedPost.hashtags"
                      :key="tag"
                      class="text-xs px-2 py-0.5 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/20"
                    >
                      #{{ tag }}
                    </span>
                    <span
                      v-if="!selectedPost.hashtags?.length"
                      class="text-xs theme-muted"
                      >—</span
                    >
                  </div>
                </div>
                <div>
                  <!-- Platform Selection -->
                  <label class="text-xs font-medium theme-sub mb-2 block">{{
                    t("dashboard.platform") || "Platform"
                  }}</label>
                  <div class="flex gap-2">
                    <button
                      v-for="p in ['Instagram', 'Facebook']"
                      :key="p"
                      @click="selectedPost.platform = p"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border"
                      :class="
                        selectedPost.platform === p
                          ? 'bg-blue-600/15 text-blue-400 border-blue-500/20'
                          : 'theme-sub border-transparent theme-card hover:theme-text'
                      "
                    >
                      <!-- Instagram Real SVG Logo -->
                      <svg
                        v-if="p === 'Instagram'"
                        class="w-4 h-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                        />
                      </svg>

                      <!-- Facebook Real SVG Logo -->
                      <svg
                        v-else
                        class="w-4 h-4 shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path
                          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        />
                      </svg>

                      <!-- Localized Platform Name -->
                      {{ t(`dashboard.platformName.${p}`) }}
                    </button>
                  </div>
                </div>
                <div>
                  <label class="text-xs font-medium theme-sub mb-2 block">{{
                    t("dashboard.status")
                  }}</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="s in statuses"
                      :key="s.labelKey"
                      @click="selectedPost.status = s.value"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all border"
                      :class="
                        selectedPost.status === s.value
                          ? 'bg-blue-600/15 text-blue-400 border-blue-500/20'
                          : 'theme-sub border-transparent theme-card hover:theme-text'
                      "
                    >
                      <div
                        class="w-1.5 h-1.5 rounded-full shrink-0"
                        :class="s.dot"
                      ></div>
                      {{ t(s.labelKey) }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- TAB: A/B Critic -->
              <div v-if="activeModalTab === 'ab'" class="p-4 sm:p-6">
                <div
                  class="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5"
                >
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-lg">⚡</span>
                    <p class="text-sm font-medium text-amber-300">
                      {{ t("dashboard.abCritic") }}
                    </p>
                  </div>
                  <p
                    v-if="!variantB"
                    class="text-sm theme-sub leading-relaxed mb-5"
                  >
                    {{ t("dashboard.abHint") }}
                  </p>
                  <div v-if="variantB" class="space-y-3 mb-5">
                    <div
                      v-if="variantB.copyAR"
                      class="p-4 rounded-xl theme-card theme-border"
                    >
                      <p
                        class="text-[10px] text-amber-400/70 mb-2 uppercase tracking-wider"
                      >
                        {{ t("dashboard.variantBArabic") }}
                      </p>

                      <p
                        class="text-sm theme-text leading-relaxed text-right font-arabic"
                        dir="rtl"
                      >
                        {{ variantB.copyAR }}
                      </p>
                    </div>
                    <div
                      v-if="variantB.copyEN"
                      class="p-4 rounded-xl theme-card theme-border"
                    >
                      <p
                        class="text-[10px] text-amber-400/70 mb-2 uppercase tracking-wider"
                      >
                        {{ t("dashboard.variantBEnglish") }}
                      </p>
                      <p class="text-sm theme-text leading-relaxed">
                        {{ variantB.copyEN }}
                      </p>
                    </div>
                    <div
                      v-if="variantB.hashtags?.length"
                      class="flex flex-wrap gap-1.5"
                    >
                      <span
                        v-for="tag in variantB.hashtags"
                        :key="tag"
                        class="text-xs text-amber-400"
                        >#{{ tag.replace("#", "") }}</span
                      >
                    </div>
                    <div class="flex gap-3 pt-2">
                      <button
                        @click="applyVariantB"
                        class="flex-1 py-2.5 rounded-xl bg-amber-500/15 text-amber-400 text-sm hover:bg-amber-500/25 border border-amber-500/20 transition-colors font-medium"
                      >
                        ✓ {{ t("dashboard.useB") }}
                      </button>
                      <button
                        @click="variantB = null"
                        class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-muted text-sm hover:theme-text transition-colors"
                      >
                        {{ t("dashboard.keepA") }}
                      </button>
                    </div>
                  </div>
                  <button
                    @click="generateVariantB"
                    :disabled="loadingVariant"
                    class="w-full py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors disabled:opacity-50"
                  >
                    {{
                      loadingVariant
                        ? t("dashboard.generatingVariant")
                        : t("dashboard.generateVariantB")
                    }}
                  </button>
                </div>
              </div>

              <!-- TAB: AI Image -->
              <div v-if="activeModalTab === 'image'" class="p-4 sm:p-6">
                <div
                  class="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 sm:p-5"
                >
                  <div class="flex items-center gap-2 mb-4">
                    <span class="text-lg">🎨</span>
                    <p class="text-sm font-medium text-blue-300">
                      {{ t("dashboard.aiImageGenerator") }}
                    </p>
                    <span
                      class="text-[10px] px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/20 ml-auto"
                      >FLUX</span
                    >
                  </div>
                  <div
                    class="w-full h-[220px] sm:h-[300px] mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-slate-950/40 border border-blue-500/10"
                  >
                    <div
                      v-if="selectedPost.imageUrl"
                      class="w-full h-full p-1 flex items-center justify-center"
                    >
                      <img
                        :src="selectedPost.imageUrl"
                        :alt="t('dashboard.generatedImage')"
                        class="max-w-full max-h-full rounded-lg object-contain opacity-95 hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div
                      v-else-if="!generatingImage"
                      class="w-full h-full flex flex-col items-center justify-center gap-2 text-center p-4"
                    >
                      <span class="text-3xl opacity-25">🖼️</span>
                      <p class="text-sm theme-muted">
                        {{ t("dashboard.noImageYet") }}<br /><span
                          class="text-xs opacity-60"
                          >{{ t("dashboard.generateHint") }}</span
                        >
                      </p>
                    </div>
                    <div
                      v-else-if="generatingImage"
                      class="w-full h-full flex flex-col items-center justify-center gap-3 p-4"
                    >
                      <div class="relative flex items-center justify-center">
                        <svg
                          class="w-9 h-9 animate-spin text-blue-500"
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
                        <span class="absolute text-xs scale-75 animate-pulse"
                          >🪄</span
                        >
                      </div>
                      <div class="text-center">
                        <p
                          class="text-sm font-medium text-blue-300 animate-pulse"
                        >
                          {{ t("dashboard.generatingImage") }}
                        </p>
                        <p class="text-[11px] theme-muted opacity-60 mt-0.5">
                          {{ t("dashboard.generationTime") }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p
                    v-if="imageError"
                    class="text-xs text-rose-400 mb-3 text-center bg-rose-500/10 py-1.5 px-3 rounded-lg border border-rose-500/15"
                  >
                    {{ imageError }}
                  </p>
                  <button
                    @click="generateImage"
                    :disabled="generatingImage"
                    class="w-full py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 shadow-md"
                    :class="
                      selectedPost.imageUrl
                        ? 'theme-card theme-border theme-sub hover:theme-text'
                        : 'bg-blue-600 text-white hover:bg-blue-500'
                    "
                  >
                    {{
                      generatingImage
                        ? t("dashboard.generatingBtnImage")
                        : selectedPost.imageUrl
                          ? t("dashboard.regenerateBtnImage")
                          : t("dashboard.generateBtnImage")
                    }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Modal Footer -->
            <div
              class="flex flex-col gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t shrink-0"
              style="border-color: var(--border)"
            >
              <div class="flex items-center justify-between gap-3">
                <button
                  @click="selectedPost = null"
                  class="px-4 sm:px-5 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
                >
                  {{ t("common.cancel") || "Cancel" }}
                </button>
                <div class="flex gap-2">
                  <!-- Save Changes -->
                  <button
                    @click="savePost"
                    :disabled="saving"
                    class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg
                      v-if="saving"
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
                      saving
                        ? t("dashboard.saving")
                        : t("dashboard.saveChanges")
                    }}
                  </button>
                  <!-- Publish Now -->
                  <button
                    @click="publishPost"
                    :disabled="
                      publishing || selectedPost?.status === 'published'
                    "
                    class="px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg
                      v-if="publishing"
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
                      publishing
                        ? t("dashboard.publishing")
                        : selectedPost?.status === "published"
                          ? t("dashboard.published")
                          : t("dashboard.publish")
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Generate / Regenerate Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        class="theme-surface rounded-t-2xl sm:rounded-2xl theme-border max-w-lg w-full p-5 sm:p-7 theme-shadow max-h-[95vh] overflow-y-auto"
      >
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-display text-lg sm:text-xl font-600 theme-text">
            {{
              isRegenerate
                ? t("dashboard.regenerateCalendar")
                : t("dashboard.generateNewPlan")
            }}
          </h2>
          <button
            @click="showModal = false"
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
        <div
          v-if="isRegenerate"
          class="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs"
        >
          ⚠️ {{ t("dashboard.regenerateWarning") }}
        </div>
        <div
          v-if="!brandId"
          class="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs"
        >
          ⚠️ {{ t("dashboard.noBrandWarning") }}
        </div>
        <div class="space-y-4">
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.campaignBrief")
            }}</label>
            <textarea
              v-model="brief"
              rows="3"
              :placeholder="t('dashboard.briefPlaceholder')"
              class="w-full theme-input rounded-xl p-3.5 text-sm theme-text border resize-none focus:outline-none focus:border-blue-500/40"
              style="border-color: var(--border)"
            ></textarea>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("dashboard.dialectLabel")
              }}</label>
              <select
                v-model="selectedDialect"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)"
              >
                <option
                  v-for="d in dialectOptions"
                  :key="d.value"
                  :value="d.value"
                >
                  {{ t(d.labelKey) }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("dashboard.startDate")
              }}</label>
              <input
                type="date"
                v-model="startDate"
                @change="validateDates"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
                style="border-color: var(--border)"
                :min="todayDate"
              />
            </div>
          </div>
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.endDate")
            }}</label>
            <input
              type="date"
              v-model="endDate"
              @change="validateDates"
              class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none"
              style="border-color: var(--border)"
              :min="startDate || todayDate"
            />
            <p class="text-[10px] theme-muted mt-1">{{ durationLabel }}</p>
            <p
              v-if="errorMessage"
              class="text-xs text-rose-400 font-medium mt-2"
            >
              {{ errorMessage }}
            </p>
          </div>
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.platforms")
            }}</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="p in platforms"
                :key="p.name"
                @click="p.on = !p.on"
                class="px-3 py-1.5 rounded-lg text-xs border transition-all"
                :class="
                  p.on
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                    : 'theme-border theme-muted hover:theme-text'
                "
              >
                {{ t(p.labelKey) }}
              </button>
            </div>
          </div>
          <div
            v-if="trends.length"
            class="p-3 rounded-xl bg-amber-500/5 border border-amber-500/15"
          >
            <p class="text-[11px] text-amber-400 font-medium mb-1">
              ✦ {{ t("dashboard.trendsInjected") }}
            </p>
            <p class="text-[11px] theme-muted">
              {{
                trends
                  .slice(0, 3)
                  .map((t) => `${t.tag} (${t.change})`)
                  .join(" · ")
              }}
            </p>
          </div>
          <p v-if="generateError" class="text-xs text-rose-400">
            {{ generateError }}
          </p>
        </div>
        <div class="flex gap-3 mt-6">
          <button
            @click="showModal = false"
            class="flex-1 py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="doGenerate"
            :disabled="
              generating || !brief || !brandId || !startDate || !endDate
            "
            class="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {{
              generating
                ? t("dashboard.generatingLong")
                : isRegenerate
                  ? t("dashboard.regenerateBtn")
                  : t("dashboard.generateBtn")
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Confirm -->
    <Teleport to="body">
      <div
        v-if="showResetConfirm"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      >
        <div
          class="theme-surface rounded-t-2xl sm:rounded-2xl theme-border max-w-sm w-full p-5 sm:p-6 theme-shadow"
        >
          <h2 class="font-display text-lg font-600 theme-text mb-2">
            {{ t("dashboard.resetTitle") }}
          </h2>
          <p class="text-sm theme-sub mb-6">{{ t("dashboard.resetDesc") }}</p>
          <div class="flex gap-3">
            <button
              @click="showResetConfirm = false"
              class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              @click="resetCalendar"
              :disabled="resetting"
              class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 transition-colors disabled:opacity-50"
            >
              {{
                resetting ? t("dashboard.resetting") : t("dashboard.resetBtn")
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Delete Confirm -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      >
        <div
          class="theme-surface rounded-t-2xl sm:rounded-2xl theme-border max-w-sm w-full p-5 sm:p-6 theme-shadow"
        >
          <h2 class="font-display text-lg font-600 theme-text mb-2">
            {{ t("dashboard.deleteTitle") }}
          </h2>
          <p class="text-sm theme-sub mb-6">{{ t("dashboard.deleteDesc") }}</p>
          <div class="flex gap-3">
            <button
              @click="showDeleteConfirm = false"
              class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
            >
              {{ t("common.cancel") }}
            </button>
            <button
              @click="deleteCalendar"
              :disabled="deleting"
              class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm hover:bg-rose-500 transition-colors disabled:opacity-50"
            >
              {{
                deleting ? t("dashboard.deleting") : t("dashboard.deleteBtn")
              }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Toast Notifications -->
    <Teleport to="body">
      <TransitionGroup
        name="toast"
        tag="div"
        class="fixed z-[9999] flex flex-col gap-2 pointer-events-none"
        :class="
          locale === 'ar'
            ? 'bottom-5 left-5 items-start'
            : 'bottom-5 right-5 items-end'
        "
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-[340px] w-full sm:w-auto"
          :class="[
            toast.type === 'success'
              ? 'bg-emerald-500 text-white'
              : toast.type === 'warning'
                ? 'bg-amber-400 text-slate-900'
                : 'bg-rose-500 text-white',
            locale === 'ar' ? 'flex-row-reverse text-right' : '',
          ]"
        >
          <span
            class="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold bg-white/25"
          >
            {{
              toast.type === "success"
                ? "✓"
                : toast.type === "warning"
                  ? "!"
                  : "✕"
            }}
          </span>
          <p class="text-sm font-semibold leading-snug flex-1 m-0">
            {{ toast.message }}
          </p>
          <button
            @click="removeToast(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
            :class="locale === 'ar' ? 'order-first' : ''"
          >
            ✕
          </button>
        </div>
      </TransitionGroup>
    </Teleport>

    <!-- Add Post Modal -->
    <div
      v-if="showAddPostModal"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
    >
      <div
        class="theme-surface w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl theme-border max-h-[90vh] overflow-y-auto theme-shadow"
      >
        <!-- Header -->
        <div
          class="sticky top-0 theme-surface z-10 flex items-center justify-between px-6 py-4 border-b"
          style="border-color: var(--border)"
        >
          <h2 class="font-display text-lg font-600 theme-text">
            {{ t("dashboard.addPostTitle") }}
          </h2>
          <button
            @click="
              showAddPostModal = false;
              resetNewPost();
            "
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
          <!-- Platform + Status row -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs theme-sub mb-1.5 block">
                {{ $t("drafts.platformLabel") }}
              </label>
              <select
                v-model="newPost.platform"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40"
                style="border-color: var(--border)"
              >
                <option v-for="p in platforms" :key="p.name" :value="p.name">
                  {{ $t(p.labelKey) }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-xs theme-sub mb-1.5 block">{{
                t("dashboard.dialectLabel")
              }}</label>
              <select
                v-model="newPost.dialect"
                class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40"
                style="border-color: var(--border)"
              >
                <option
                  v-for="d in dialectOptions"
                  :key="d.value"
                  :value="d.value"
                >
                  {{ $t(d.labelKey) }}
                </option>
              </select>
            </div>
          </div>

          <!-- Scheduled Date -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.startDate")
            }}</label>
            <input
              type="date"
              v-model="newPost.scheduledDate"
              :min="todayStr()"
              class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40"
              style="border-color: var(--border)"
            />
          </div>

          <!-- Arabic Copy -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block"
              >{{ t("dashboard.caption") }}
            </label>
            <textarea
              v-model="newPost.copyAR"
              rows="3"
              dir="auto"
              :placeholder="t('dashboard.briefPlaceholder')"
              class="text-start w-full theme-input rounded-xl p-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40 resize-none"
              style="border-color: var(--border)"
            ></textarea>
          </div>

          <!-- English Copy -->
          <div style="display: none;">
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.editPostEN")
            }}</label>
            <textarea
              v-model="newPost.copyEN"
              rows="2"
              class="w-full theme-input rounded-xl p-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40 resize-none"
              style="border-color: var(--border)"
            ></textarea>
          </div>
          <!-- Hashtags -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.hashtags")
            }}</label>
            <input
              type="text"
              v-model="newPost.hashtagsInput"
              placeholder="#hashtag1 #hashtag2"
              class="w-full theme-input rounded-xl px-3 py-2.5 text-sm theme-text border focus:outline-none focus:border-blue-500/40"
              style="border-color: var(--border)"
            />
            <p class="text-[10px] theme-muted mt-1">
              {{ t("dashboard.addPostHashtagHint") }}
            </p>
          </div>

          <!-- Status -->
          <div>
            <label class="text-xs theme-sub mb-1.5 block">{{
              t("dashboard.status")
            }}</label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="s in statuses"
                :key="s.value"
                @click="newPost.status = s.value"
                class="px-3 py-1.5 rounded-lg text-xs border transition-all"
                :class="
                  newPost.status === s.value
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500/30'
                    : 'theme-border theme-muted hover:theme-text'
                "
              >
                {{ t(`${s.labelKey}`) }}
              </button>
            </div>
          </div>

          <p v-if="addPostError" class="text-xs text-rose-400">
            {{ addPostError }}
          </p>
        </div>

        <!-- Footer -->
        <div
          class="sticky bottom-0 theme-surface border-t px-6 py-4 flex gap-3"
          style="border-color: var(--border)"
        >
          <button
            @click="
              showAddPostModal = false;
              resetNewPost();
            "
            class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
          >
            {{ t("common.cancel") }}
          </button>
          <button
            @click="createPost"
            :disabled="addingPost || !newPost.copyAR || !newPost.scheduledDate"
            class="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {{ addingPost ? t("dashboard.saving") : t("dashboard.addPostBtn") }}
          </button>
        </div>
      </div>
    </div>

    <!-- Publish Date Confirm Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showPublishConfirm"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style="background: rgba(0, 0, 0, 0.7)"
        >
          <div
            class="theme-surface rounded-2xl theme-border max-w-sm w-full p-6 theme-shadow space-y-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl shrink-0"
              >
                ⚠️
              </div>
              <div>
                <h3 class="font-semibold theme-text text-sm">
                  {{ t("dashboard.wrongPublishDate") }}
                </h3>
                <p class="text-xs theme-sub mt-0.5">
                  {{ t("dashboard.scheduledDifferentDay") }}
                </p>
              </div>
            </div>
            <p class="text-sm theme-sub leading-relaxed">
              {{ t("dashboard.postScheduledFor") }}
              <span class="text-amber-400 font-medium">{{
                publishConfirmDate
              }}</span
              >.
              {{ t("dashboard.publishTodayConfirm") }}
            </p>
            <div class="flex gap-3 pt-1">
              <button
                @click="cancelPublish"
                class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
              >
                {{ t("common.cancel") }}
              </button>
              <button
                @click="confirmPublishAnyway"
                class="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition-colors"
              >
                {{ t("dashboard.publishAnyway") }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Usage Warning Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div
          v-if="showUsageWarning"
          class="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style="background: rgba(0, 0, 0, 0.7)"
        >
          <div
            class="theme-surface rounded-2xl theme-border max-w-sm w-full p-6 theme-shadow space-y-4"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-xl shrink-0"
              >
                ⚠️
              </div>
              <div>
                <h3 class="font-semibold theme-text text-sm">
                  {{ t("dashboard.lowPostsWarning") }}
                </h3>
                <p class="text-xs theme-sub mt-0.5">
                  {{ t("dashboard.remainingPostsInfo") }}
                </p>
              </div>
            </div>
            <p class="text-sm theme-sub leading-relaxed">
              {{ t("dashboard.youHaveOnly") }}
              <span class="text-amber-400 font-bold">{{
                remainingPostsCount
              }}</span>
              {{ t("dashboard.postsRemaining") }}
            </p>
            <div class="flex gap-3 pt-1">
              <button
                @click="cancelUsageWarning"
                class="flex-1 py-2.5 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors"
              >
                {{ t("common.cancel") }}
              </button>
              <button
                @click="confirmUsageWarning"
                class="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-400 transition-colors"
              >
                {{ t("dashboard.continueAnyway") }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import AppLayout from "../components/AppLayout.vue";
import calendarApi from "../api/calendarApi";
import postsApi from "../api/postsApi";
import brandApi from "../api/brandApi";
import subscriptionApi from "../api/subscriptionApi";
import api from "../api/client";
import { useI18n } from "vue-i18n";
import { useCalendarStore } from "../stores/calendarStore";

const { t, locale } = useI18n();

// ── State ─────────────────────────────────────────────────────────────────────
const brandId = ref(localStorage.getItem("cf_brandId") || "");
const activeFilter = ref("All");
const selectedPost = ref(null);
const editCopy = ref("");
const activeModalTab = ref("edit");

// Publish State
const publishing = ref(false);
const publishMsg = ref("");
const showPublishConfirm = ref(false);
const publishConfirmDate = ref("");
const pendingPublishId = ref(null);
const pendingPublishPlatform = ref(null);

const showUsageWarning = ref(false);
const remainingPostsCount = ref(0);
let resolveUsageWarning = null; // دالة لحل الـ Promise

// Reset tab when opening a new post
watch(selectedPost, (val) => {
  if (val) activeModalTab.value = "edit";
});

const modalTabs = computed(() => [
  { id: "edit", icon: "✏️", label: t("dashboard.editPost") || "Edit" },
  { id: "ab", icon: "⚡", label: t("dashboard.abCritic") || "A/B Critic" },
  { id: "image", icon: "🎨", label: "AI Image" },
]);

const showModal = ref(false);
const showAddPostModal = ref(false);
const showDeleteConfirm = ref(false);
const showResetConfirm = ref(false);
const isRegenerate = ref(false);
const brief = ref("");
const selectedDialect = ref("Egyptian Arabic");
const todayDate = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});
const startDate = ref("");
const endDate = ref("");
const generating = ref(false);
const generateError = ref("");
const loadingCalendar = ref(false);
const saving = ref(false);
const saveMsg = ref("");
const approving = ref(false);
const approveMsg = ref("");
const deleting = ref(false);
const resetting = ref(false);
const variantB = ref(null);
const loadingVariant = ref(false);
const generatingImage = ref(false);
const imageError = ref("");
const errorMessage = ref("");
const currentCalendar = ref(null);
const trends = ref([]);
const trendsLastUpdated = ref("");
const store = useCalendarStore();
const planApproved = ref(false);
const trendsOpen = ref(false);
const isTrendsAlwaysVisible = ref(window.innerWidth >= 1024);
const addingPost = ref(false);
const addPostError = ref("");

// ── Drag & Drop state ─────────────────────────────────────────────────────
const draggedCell = ref(null);
const dragOverId = ref(null);

// ── Toast system ───────────────────────────────────────────────────────────────
const toasts = ref([]);
let toastIdCounter = 0;
function showToast(message, type = "success", duration = 4000) {
  const id = ++toastIdCounter;
  toasts.value.push({ id, message, type });
  setTimeout(() => removeToast(id), duration);
}
function removeToast(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

// weekDays use i18n keys — reactive to locale switching
const weekDays = computed(() => [
  t("dashboard.day.mon"),
  t("dashboard.day.tue"),
  t("dashboard.day.wed"),
  t("dashboard.day.thu"),
  t("dashboard.day.fri"),
  t("dashboard.day.sat"),
  t("dashboard.day.sun"),
]);

// Statuses: value stays English (used for API/logic), labelKey for display
const statuses = [
  { value: "Draft", labelKey: "dashboard.statusDraft", dot: "bg-slate-500" },
  {
    value: "Approved",
    labelKey: "dashboard.statusApproved",
    dot: "bg-green-400",
  },
  {
    value: "Scheduled",
    labelKey: "dashboard.statusScheduled",
    dot: "bg-blue-400",
  },
];

const legend = [
  { labelKey: "dashboard.statusDraft", dot: "bg-slate-500" },
  { labelKey: "dashboard.statusApproved", dot: "bg-green-400" },
  { labelKey: "dashboard.statusScheduled", dot: "bg-blue-400" },
  { labelKey: "dashboard.statusPublished", dot: "bg-indigo-400" },
];

const platforms = ref([
  { name: "Instagram", labelKey: "dashboard.platformName.Instagram", on: true },
  { name: "Facebook", labelKey: "dashboard.platformName.Facebook", on: true },
  { name: "LinkedIn", labelKey: "dashboard.platformName.LinkedIn", on: false },
  {
    name: "Twitter/X",
    labelKey: "dashboard.platformName.Twitter/X",
    on: false,
  },
  { name: "TikTok", labelKey: "dashboard.platformName.TikTok", on: false },
]);

// Dialect select options — value stays English for API, labelKey for display
const dialectOptions = [
  { value: "Egyptian Arabic", labelKey: "dashboard.dialect.egyptian" },
  { value: "Gulf Arabic", labelKey: "dashboard.dialect.gulf" },
  { value: "Levantine Arabic", labelKey: "dashboard.dialect.levantine" },
  { value: "Modern Standard Arabic", labelKey: "dashboard.dialect.msa" },
  { value: "Bilingual AR+EN", labelKey: "dashboard.dialect.bilingual" },
];

// ── Computed ──────────────────────────────────────────────────────────────────
const topTrend = computed(() => trends.value[0] || null);

const duration = computed(() => {
  if (!startDate.value || !endDate.value) return 0;
  return Math.round(
    (new Date(endDate.value) - new Date(startDate.value)) /
      (1000 * 60 * 60 * 24),
  );
});

const durationLabel = computed(() => {
  if (!startDate.value || !endDate.value) return "";
  if (duration.value <= 0) return t("dashboard.dateError");
  return t("dashboard.durationLabel", {
    days: duration.value,
    posts: Math.round(duration.value * 0.65),
  });
});

// Re-built reactively based on Pinia store array state
const calendarWeeks = computed(() => {
  const startStr = currentCalendar.value?.startDate || startDate.value;
  const endStr = currentCalendar.value?.endDate || endDate.value;
  if (!startStr || !endStr) return [];

  const start = new Date(startStr);
  const end = new Date(endStr);

  const dateSlots = [];
  let current = new Date(start);
  while (current <= end) {
    dateSlots.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  const initialDay = new Date(dateSlots[0]).getDay();
  const offset = initialDay === 0 ? 6 : initialDay - 1;
  for (let i = 0; i < offset; i++) {
    dateSlots.unshift(null);
  }

  const weeks = [];
  let weekCells = [];
  let weekId = 0;

  dateSlots.forEach((dateStr, index) => {
    if (dateStr === null) {
      weekCells.push({
        id: `pad-${index}`,
        date: "",
        rawDate: null,
        posts: [],
        cellClass:
          "bg-transparent opacity-30 border-transparent pointer-events-none",
      });
    } else {
      const dayPosts = (store.posts || []).filter((p) => {
        const pDate = p.date || p.scheduledAt;
        return pDate && pDate.substring(0, 10) === dateStr;
      });

      const [y, mo, d] = dateStr.split("-").map(Number);
      const formattedDate = new Date(y, mo - 1, d).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      });

      weekCells.push({
        id: `cell-${dateStr}`,
        date: formattedDate,
        rawDate: dateStr,
        posts: dayPosts,
        cellClass:
          dayPosts.length > 0
            ? ""
            : "bg-slate-900/10 border-dashed border-slate-700/30",
      });
    }

    if (weekCells.length === 7 || index === dateSlots.length - 1) {
      while (weekCells.length < 7) {
        weekCells.push({
          id: `fill-${index}-${weekCells.length}`,
          date: "",
          rawDate: null,
          posts: [],
          cellClass: "bg-transparent",
        });
      }
      weeks.push({ id: weekId++, cells: weekCells });
      weekCells = [];
    }
  });

  return weeks;
});

// Refactored filters matching Option 1 properties
const filteredWeeks = computed(() => {
  if (activeFilter.value === "All") return calendarWeeks.value;
  return calendarWeeks.value.map((week) => ({
    ...week,
    cells: week.cells.map((cell) => ({
      ...cell,
      posts: cell.posts.filter((p) => {
        const cleanStatus = p.status
          ? p.status.toLowerCase().replace("_", " ")
          : "";
        return cleanStatus === activeFilter.value.toLowerCase();
      }),
    })),
  }));
});

const calendarDateRange = computed(() => {
  if (!currentCalendar.value) return "";
  const s = new Date(currentCalendar.value.startDate);
  const e = new Date(currentCalendar.value.endDate);
  return `${s.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })} – ${e.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
});

// ── Helpers for dates ─────────────────────────────────────────────────────────
function validateDates() {
  errorMessage.value = "";
  if (startDate.value && startDate.value < todayDate.value) {
    startDate.value = todayDate.value;
    errorMessage.value = t("dashboard.pastDateError");
  }
  if (endDate.value && startDate.value && endDate.value < startDate.value) {
    endDate.value = startDate.value;
  }
}

watch(
  todayDate,
  (newDate) => {
    if (!startDate.value) startDate.value = newDate;
  },
  { immediate: true },
);

// ── Load on mount ─────────────────────────────────────────────────────────────
onMounted(async () => {
  // 1️⃣ تعيين مستمع لحجم الشاشة (كودك الحالي)
  window.addEventListener("resize", () => {
    isTrendsAlwaysVisible.value = window.innerWidth >= 1024;
  });

  // 2️⃣ جلب الـ Trends (كودك الحالي)
  try {
    const data = await api.get("/trends");
    trends.value = data.trends.map((t) => ({
      ...t,
      color: t.velocity > 200 ? "text-green-400" : "text-teal-400",
    }));
    trendsLastUpdated.value = new Date(data.lastUpdated).toLocaleTimeString(
      "ar-EG",
    );
  } catch (err) {
    console.error("Trends Fetch Error:", err);
  }

  // 3️⃣ 🔥 الحل الجديد: جلب براندات اليوزر المسجل أولاً واستخراج الـ ID
  try {
    console.log("[Dashboard] Fetching user brands...");
    const brands = await brandApi.getMyBrands();

    // نتحقق من أن اليوزر يمتلك براند واحد على الأقل مسجل باسمه
    if (brands && brands.length > 0) {
      const activeBrand = brands[0]; // نأخذ البراند الأول المتاح له
      brandId.value = activeBrand._id; // حفظ الـ ID في الـ ref الخاص بالصفحة

      console.log(
        `[Dashboard] Found Active Brand: ${activeBrand.name} (ID: ${activeBrand._id})`,
      );

      // 4️⃣ الآن نقوم بجلب الكالندر الخاص بهذا البراند بأمان
      const calendars = await calendarApi.getBrandCalendars(brandId.value);
      console.log("Fetched Calendars for this Brand:", calendars);

      if (calendars?.length) {
        const latest = await calendarApi.getCalendar(calendars[0]._id);
        currentCalendar.value = latest;
        store.posts = latest.posts || [];
      } else {
        console.warn("[Dashboard] This brand has no calendars created yet.");
      }
    } else {
      console.warn(
        "[Dashboard] No brands associated with this logged-in user.",
      );
      // هنا يمكنك توجيه المستخدم لصفحة إنشاء براند إذا كان النظام يتطلب ذلك أولاً
    }
  } catch (err) {
    console.error("[Dashboard Setup Error]:", err);
  }
});

// ── Usage Warning Functions ───────────────────────────────────────────────────────
function showUsageConfirm(count) {
  return new Promise((resolve) => {
    remainingPostsCount.value = count;
    showUsageWarning.value = true;
    resolveUsageWarning = resolve;
  });
}

function confirmUsageWarning() {
  showUsageWarning.value = false;
  if (resolveUsageWarning) {
    resolveUsageWarning(true);
    resolveUsageWarning = null;
  }
}

function cancelUsageWarning() {
  showUsageWarning.value = false;
  if (resolveUsageWarning) {
    resolveUsageWarning(false);
    resolveUsageWarning = null;
  }
}

// ── Generate / Regenerate ─────────────────────────────────────────────────────
function openRegenerate() {
  isRegenerate.value = true;
  showModal.value = true;
}

async function doGenerate() {
  if (!brief.value || !brandId.value || !startDate.value || !endDate.value)
    return;
  generateError.value = "";
  generating.value = true;
  loadingCalendar.value = true;
  showModal.value = false;

  // ✅ تحقق من الـ remaining posts قبل الـ generate
  try {
    const usageData = await subscriptionApi.getUsage();
    const remainingPosts =
      usageData.limits.maxPostsPerCalendar - usageData.usage.postsGenerated;

    if (remainingPosts <= 0) {
      generateError.value = `You have reached your posts limit. Please upgrade your plan.`;
      return;
    }

    if (remainingPosts < 5) {
      // اعرض تحذير لو العدد قليل
      const shouldContinue = await showUsageConfirm(remainingPosts);
      if (!shouldContinue) {
        return;
      }
    }
  } catch (err) {
    console.error("Failed to check usage:", err);
  }

  try {
    validateDates();
    if (isRegenerate.value && currentCalendar.value) {
      await calendarApi
        .deleteCalendar(currentCalendar.value._id)
        .catch(() => {});
      currentCalendar.value = null;
      store.posts = [];
    }
    const result = await calendarApi.generate({
      brandId: brandId.value,
      brief: brief.value,
      dialect: selectedDialect.value,
      platforms: platforms.value.filter((p) => p.on).map((p) => p.name),
      startDate: startDate.value,
      endDate: endDate.value,
      duration: duration.value,
    });
    currentCalendar.value = result.calendar;
    store.posts = result.posts || [];
    brief.value = "";
    isRegenerate.value = false;
    planApproved.value = false;
  } catch (err) {
    generateError.value = err.message || t("dashboard.generationFailed");
    showModal.value = true;
  } finally {
    generating.value = false;
    loadingCalendar.value = false;
  }
}

// ── Approve Plan ──────────────────────────────────────────────────────────────
async function approvePlan() {
  if (!currentCalendar.value) return;
  approving.value = true;
  try {
    await calendarApi.approveCalendar(currentCalendar.value._id);
    store.posts = store.posts.map((p) => ({ ...p, status: "approved" }));
    planApproved.value = true;
    showToast(t("dashboard.allApproved"), "success");
  } catch (err) {
    showToast(t("dashboard.approveFailed") + ": " + err.message, "error");
  } finally {
    approving.value = false;
  }
}

// ── Delete Calendar ───────────────────────────────────────────────────────────
function confirmDelete() {
  showDeleteConfirm.value = true;
}

async function deleteCalendar() {
  if (!currentCalendar.value) return;
  deleting.value = true;
  try {
    await calendarApi.deleteCalendar(currentCalendar.value._id);
    currentCalendar.value = null;
    store.posts = [];
    selectedPost.value = null;
    showDeleteConfirm.value = false;
    isRegenerate.value = false;
  } catch (err) {
    showToast(t("dashboard.deleteFailed") + ": " + err.message, "error");
  } finally {
    deleting.value = false;
  }
}

// ── Reset Calendar ────────────────────────────────────────────────────────────
function confirmReset() {
  showResetConfirm.value = true;
}

async function resetCalendar() {
  if (!currentCalendar.value) return;
  resetting.value = true;
  try {
    await store.resetCalendar(currentCalendar.value._id);
    currentCalendar.value = store.calendar;
    selectedPost.value = null;
    variantB.value = null;
    planApproved.value = false;
    showResetConfirm.value = false;
  } catch (err) {
    showToast(t("dashboard.resetFailed") + ": " + err.message, "error");
  } finally {
    resetting.value = false;
  }
}

// ── Create Post manually ──────────────────────────────────────────────────────────
function todayStr() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

const newPost = ref({
  platform: "Instagram",
  dialect: "Egyptian Arabic",
  scheduledDate: "",
  copyAR: "",
  copyEN: "",
  hashtagsInput: "",
  status: "Draft",
});

async function createPost() {
  if (!newPost.value.copyAR || !newPost.value.scheduledDate) return;
  addingPost.value = true;
  addPostError.value = "";
  try {
    const hashtags = newPost.value.hashtagsInput
      .split(/\s+/)
      .map((h) => h.replace("#", ""))
      .filter(Boolean);
    console.log(
      "Current Calendar ID:",
      currentCalendar.value?._id || currentCalendar.value?.id,
    );
    const payload = {
      brand: brandId.value,
      calendar: currentCalendar.value?._id || currentCalendar.value?.id, // نضمن إرسال الـ ID صح
      dialect: newPost.value.dialect,
      platform: newPost.value.platform,
      scheduledDate: new Date(newPost.value.scheduledDate).toISOString(),
      copyAR: newPost.value.copyAR,
      copyEN: newPost.value.copyEN || "",
      hashtags,
      status: newPost.value.status.toLowerCase(),
    };

    const created = await postsApi.createPost(payload);

    // نضمن إن الـ created object عنده date string بصيغة YYYY-MM-DD
    if (
      !created.date &&
      (created.scheduledAt || created.scheduledDate || payload.scheduledDate)
    ) {
      const raw =
        created.scheduledAt || created.scheduledDate || payload.scheduledDate;
      created.date = new Date(raw).toISOString().split("T")[0];
    }

    // ✅ الحل الصحيح 1: تحديث الـ Store الرئيسي المسؤول عن عرض الكالندر بالـ Spread Operator
    if (store.posts) {
      store.posts = [...store.posts, created];
    } else {
      store.posts = [created];
    }

    // ✅ الحل الصحيح 2: تحديث مصفوفة الـ posts داخل الـ currentCalendar لضمان المزامنة
    if (currentCalendar.value) {
      if (!currentCalendar.value.posts) currentCalendar.value.posts = [];
      currentCalendar.value.posts.push(created);
    }

    // ✅ الحل الصحيح 3: إعادة بناء الأسابيع بناءً على الـ Store المحدث بالكامل
    if (typeof buildWeeks === "function") {
      calendarWeeks.value = buildWeeks(store.posts);
    }

    showAddPostModal.value = false;
    resetNewPost();
    showToast(t("dashboard.postAdded"));
  } catch (err) {
    addPostError.value = err.message || t("dashboard.addPostError");
  } finally {
    addingPost.value = false;
  }
}

function resetNewPost() {
  newPost.value = {
    platform: "Instagram",
    dialect: "Egyptian Arabic",
    scheduledDate: "",
    copyAR: "",
    copyEN: "",
    hashtagsInput: "",
    status: "Draft",
  };
  addPostError.value = "";
}

// ── Build weeks grid ──────────────────────────────────────────────────────────
function buildWeeks(posts) {
  if (!currentCalendar.value || !posts) return [];
  const start = new Date(currentCalendar.value.startDate);
  const end = new Date(currentCalendar.value.endDate);
  const dateSlots = [];
  let current = new Date(start);
  while (current <= end) {
    dateSlots.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  const initialDay = new Date(dateSlots[0]).getDay();
  const offset = initialDay === 0 ? 6 : initialDay - 1;
  for (let i = 0; i < offset; i++) dateSlots.unshift(null);
  const weeks = [];
  let weekCells = [];
  let weekId = 0;
  dateSlots.forEach((dateStr, index) => {
    if (dateStr === null) {
      weekCells.push({
        id: `pad-${index}`,
        date: "",
        rawDate: null,
        copy: null,
        cellClass:
          "bg-transparent opacity-30 border-transparent pointer-events-none",
      });
    } else {
      const post = posts.find((p) => {
        const pDate = p.date || p.scheduledAt || p.scheduledDate;
        return pDate && pDate.startsWith(dateStr);
      });
      if (post) {
        const [y, mo, d] = dateStr.split("-").map(Number);
        weekCells.push({
          id: post._id,
          date: new Date(y, mo - 1, d).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          }),
          rawDate: dateStr,
          platform: (post.platform || "").slice(0, 2).toUpperCase(),
          copy: post.copyAR || post.copy || "",
          dialect: post.dialect || "",
          status: post.status
            ? post.status.charAt(0).toUpperCase() +
              post.status.slice(1).replace("_", " ")
            : "Draft",
          hashtags: post.hashtags || [],
          cellClass: statusToClass(post.status),
        });
      } else {
        const [ey, em, ed] = dateStr.split("-").map(Number);
        weekCells.push({
          id: `empty-${dateStr}`,
          date: new Date(ey, em - 1, ed).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
          }),
          rawDate: dateStr,
          platform: null,
          copy: null,
          status: null,
          hashtags: [],
          cellClass: "bg-slate-900/10 border-dashed border-slate-700/30",
        });
      }
    }
    if (weekCells.length === 7 || index === dateSlots.length - 1) {
      while (weekCells.length < 7)
        weekCells.push({
          id: `fill-${index}-${weekCells.length}`,
          date: "",
          rawDate: null,
          copy: null,
          cellClass: "bg-transparent",
        });
      weeks.push({ id: weekId++, cells: weekCells });
      weekCells = [];
    }
  });
  return weeks;
}

function statusToClass(status) {
  if (!status) return "bg-slate-500/5 border-slate-500/20 text-slate-400";

  switch (status.toLowerCase()) {
    case "approved":
      return "bg-green-500/10 border-green-500/20 text-green-400";

    case "scheduled":
      // المجدول: أزرق سيان ناصع
      return "bg-cyan-500/10 border-cyan-500/20 text-cyan-400";

    case "published":
      // المنشور: تم التغيير إلى البنفسجي المضيء ليكون واضحاً ومختلفاً عن المجدول
      return "bg-indigo-500/15 border-indigo-500/25 text-indigo-300";

    case "pending":
      // الانتظار: تم التغيير إلى البرتقالي/الذهبي الواضح ليفترق عن الرمادي
      return "bg-amber-500/10 border-amber-500/20 text-amber-400";

    case "draft":
    default:
      return "bg-slate-500/5 border-slate-500/20 theme-sub";
  }
}

// 3. تحديث تأثير الـ Hover المتناسق مع الألوان الجديدة
function getHoverStatusClass(status) {
  if (!status) return "";

  switch (status.toLowerCase()) {
    case "approved":
      return "hover:bg-green-500/20 hover:border-green-500/60 hover:shadow-green-500/10";
    case "scheduled":
      return "hover:bg-cyan-500/20 hover:border-cyan-500/60 hover:shadow-cyan-500/10";
    case "published":
      // هوفر ناصع جداً للمنشور
      return "hover:bg-indigo-500/25 hover:border-indigo-400/70 hover:shadow-indigo-500/15 hover:brightness-110";
    case "pending":
      // هوفر دافئ ومضيء للانتظار
      return "hover:bg-amber-500/20 hover:border-amber-400/60 hover:shadow-amber-500/10";
    case "draft":
    default:
      return "hover:bg-slate-500/20 hover:border-slate-400/60 hover:shadow-slate-400/10 hover:brightness-125";
  }
}

// ── Post editor ───────────────────────────────────────────────────────────────
function selectPost(post) {
  selectedPost.value = post;
  editCopy.value = post.copyAR || post.copy || post.text || "";
  variantB.value = null;
  saveMsg.value = "";
}

async function savePost() {
  if (!selectedPost.value) return;
  saving.value = true;
  saveMsg.value = "";
  const postId = selectedPost.value._id || selectedPost.value.id;
  const formattedStatus = selectedPost.value.status
    .toLowerCase()
    .replace(" ", "_");
  try {
    await postsApi.updatePost(postId, {
      copyAR: editCopy.value,
      status: formattedStatus,
    });
    store.posts = store.posts.map((p) =>
      p._id === postId || p.id === postId
        ? {
            ...p,
            copyAR: editCopy.value,
            copy: editCopy.value,
            status: formattedStatus,
          }
        : p,
    );
    saveMsg.value = "";
    selectedPost.value.copyAR = editCopy.value;
    selectedPost.value.status = formattedStatus;
    showToast(t("dashboard.saved"), "success");
    setTimeout(() => {
      selectedPost.value = null;
    }, 800);
  } catch {
    showToast(t("dashboard.savedLocally"), "warning");
  } finally {
    saving.value = false;
  }
}

// ── Publish post ───────────────────────────────────────────────────────────────
async function publishPost() {
  if (!selectedPost.value) return;
  const platform = selectedPost.value.platform;
  if (!["Instagram", "Facebook"].includes(platform)) {
    showToast(t("dashboard.unsupportedPlatform"), "warning");
    return;
  }

  const postDate = selectedPost.value.date || selectedPost.value.scheduledAt;
  const today = new Date().toISOString().split("T")[0];
  const scheduledDay = postDate ? String(postDate).substring(0, 10) : null;
  const postId = selectedPost.value._id || selectedPost.value.id;

  // Wrong date → show custom confirm modal
  if (scheduledDay && scheduledDay !== today) {
    publishConfirmDate.value = new Date(
      scheduledDay + "T12:00:00",
    ).toLocaleDateString(locale.value === "ar" ? "ar-EG" : "en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    pendingPublishId.value = postId;
    pendingPublishPlatform.value = platform;
    showPublishConfirm.value = true;
    return;
  }

  // Today's post → publish directly
  await doPublish(postId, platform);
}

async function doPublish(postId, platform) {
  publishing.value = true;
  const today = new Date().toISOString().split("T")[0];
  try {
    const arabicText = selectedPost.value?.copyAR;
    if (arabicText) {
      await postsApi.updatePost(postId, { copy: arabicText });
    }
    await postsApi.publishPost(postId, platform);
    await postsApi.updateDate(postId, today);
    store.posts = store.posts.map((p) =>
      p._id === postId || p.id === postId
        ? { ...p, status: "published", date: today }
        : p,
    );
    selectedPost.value.status = "published";
    selectedPost.value.date = today;
    showToast(t("dashboard.publishedSuccess"), "success");
    setTimeout(() => {
      selectedPost.value = null;
    }, 1000);
  } catch (err) {
    showToast(err.message || t("dashboard.publishFailed"), "error");
  } finally {
    publishing.value = false;
  }
}

async function confirmPublishAnyway() {
  showPublishConfirm.value = false;
  await doPublish(pendingPublishId.value, pendingPublishPlatform.value);
  pendingPublishId.value = null;
  pendingPublishPlatform.value = null;
}

function cancelPublish() {
  showPublishConfirm.value = false;
  pendingPublishId.value = null;
  pendingPublishPlatform.value = null;
  publishConfirmDate.value = "";
}
// ── A/B Variant ───────────────────────────────────────────────────────────────

async function generateVariantB() {
  if (!selectedPost.value) return;
  loadingVariant.value = true;
  variantB.value = null;
  try {
    const postId = selectedPost.value._id || selectedPost.value.id;
    const r = await postsApi.generateVariantB(postId);

    // فحص ذكي جدا لشكل الـ Response وحقنه داخل الكائن ليتطابق مع طريقة العرض
    if (r && typeof r === "object") {
      variantB.value = {
        copyAR: r.copyAR || r.text || r.copy || r.output || "",
        hashtags: r.hashtags || [],
      };
    } else if (typeof r === "string") {
      variantB.value = {
        copyAR: r,
        hashtags: [],
      };
    }
  } catch (err) {
    console.error(err);
    variantB.value = {
      copyAR: "Could not generate variant, please try again.",
      hashtags: [],
    };
  } finally {
    loadingVariant.value = false;
  }
}

async function applyVariantB() {
  if (!selectedPost.value || !variantB.value) return;

  editCopy.value = variantB.value.copyAR;
  selectedPost.value.copyAR = variantB.value.copyAR;
  selectedPost.value.copy = variantB.value.copyAR;
  selectedPost.value.hashtags = variantB.value.hashtags;

  const postId = selectedPost.value._id || selectedPost.value.id;

  // تحديث الـ Store بالـ Copy الجديد فوراً
  store.posts = store.posts.map((p) =>
    p._id === postId || p.id === postId
      ? {
          ...p,
          copyAR: variantB.value.copyAR,
          copy: variantB.value.copyAR,
          hashtags: variantB.value.hashtags,
        }
      : p,
  );

  variantB.value = null;
  try {
    await postsApi.applyVariantB(postId);
  } catch (err) {
    console.error(err);
  }
}

// ── Generate Image ────────────────────────────────────────────────────────────
async function generateImage() {
  if (!selectedPost.value) return;
  generatingImage.value = true;
  imageError.value = "";
  const postId = selectedPost.value._id || selectedPost.value.id;
  try {
    const data = await postsApi.generateImage(postId);
    selectedPost.value.imageUrl = data.imageUrl;
    selectedPost.value.imagePrompt = data.imagePrompt;

    store.posts = store.posts.map((p) =>
      p._id === postId || p.id === postId
        ? { ...p, imageUrl: data.imageUrl, imagePrompt: data.imagePrompt }
        : p,
    );
  } catch (err) {
    imageError.value = err.message?.includes("loading")
      ? "Model warming up — try again in 30s"
      : "Failed: " + (err.message || "Unknown error");
  } finally {
    generatingImage.value = false;
  }
}

// ── Inject trend ──────────────────────────────────────────────────────────────
function injectTrend() {
  if (!selectedPost.value || !trends.value[0]) return;
  const tag = trends.value[0].tag;
  if (!editCopy.value.includes(tag)) editCopy.value += " " + tag;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function platformBadge(p) {
  return (
    {
      IG: "bg-pink-500/20 text-pink-400",
      FB: "bg-blue-500/20 text-blue-400",
      LI: "bg-blue-700/20 text-blue-300",
      TW: "bg-sky-500/20 text-sky-400",
      TI: "bg-rose-500/20 text-rose-400",
    }[p] || "bg-slate-500/20 text-slate-400"
  );
}

// 2. تحديث ألوان نقطة الحالة والنص السفلي (Status Dot)
function statusColor(status) {
  if (!status) return "text-slate-400";
  switch (status.toLowerCase()) {
    case "approved":
      return "text-green-400";
    case "scheduled":
      return "text-cyan-400";
    case "published":
      return "text-indigo-400"; // تفتيح المنشور
    case "pending":
      return "text-amber-400"; // تمييز الانتظار
    case "draft":
    default:
      return "text-slate-400";
  }
}

// ── Drag & Drop Handlers ───────────────────────────────────────────────────
function onDragStart(cell) {
  draggedCell.value = cell;
}

async function onDrop(targetCell) {
  dragOverId.value = null;
  if (!draggedCell.value || !targetCell.rawDate) return;
  planApproved.value = false;
  const currentPostDate =
    draggedCell.value.date || draggedCell.value.scheduledAt;
  if (currentPostDate?.substring(0, 10) === targetCell.rawDate) {
    draggedCell.value = null;
    return;
  }
  const postId = draggedCell.value._id || draggedCell.value.id;
  const newDate = targetCell.rawDate;
  const wasApproved = draggedCell.value.status === "approved";
  try {
    await store.movePostDate(postId, newDate);
    if (wasApproved) {
      await postsApi.updatePost(postId, { status: "draft" });
      store.posts = store.posts.map((p) =>
        p._id === postId || p.id === postId ? { ...p, status: "draft" } : p,
      );
    }
  } catch (err) {
    showToast(t("dashboard.moveFailed") + ": " + err.message, "error");
  } finally {
    draggedCell.value = null;
  }
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
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition: transform 0.2s ease;
}

.modal-fade-enter-from .relative,
.modal-fade-leave-to .relative {
  transform: scale(0.97) translateY(8px);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(15, 23, 42, 0.3);
}

::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.3);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(148, 163, 184, 0.5);
}

.aspect-square {
  aspect-ratio: 1 / 1;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

/* إخفاء شريط التمرير لمتصفح فايرفوكس وإنترنت إكسبلورر */
.no-scrollbar {
  -ms-overflow-style: none;
  /* IE and Edge */
  scrollbar-width: none;
  /* Firefox */
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
