<template >
        <!-- ROW 2 (Mobile): Action Buttons -->
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

          <!-- Add Post button-->
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
</template>