<template>
  <div
    class="rounded-2xl theme-surface theme-border theme-shadow overflow-hidden select-none"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <!-- Top Navbar -->
    <header
      class="theme-glass border-b h-[52px] px-3 sm:px-4 flex items-center justify-between"
      style="border-color: var(--border)"
    >
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <div
          class="lg:hidden w-8 h-8 rounded-lg theme-card theme-border flex items-center justify-center theme-sub shrink-0"
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
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </div>
        <div
          class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path
              d="M3 8L7 12L13 4"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <span class="font-display font-700 text-sm sm:text-base theme-text truncate"
          >ContentForge</span
        >
        <span style="color: var(--border)" class="hidden sm:inline shrink-0">|</span>
        <span class="hidden sm:inline text-xs theme-sub truncate">{{
          t("layout.nav.calendar")
        }}</span>
      </div>

      <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span
          class="hidden md:flex text-[11px] theme-sub px-3 py-1.5 rounded-lg theme-card theme-border items-center gap-1.5"
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
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          {{ t("layout.contactUs") }}
        </span>

        <span
          class="text-[11px] theme-sub px-2.5 sm:px-3 py-1.5 rounded-lg theme-card theme-border flex items-center gap-1.5"
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
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"
            />
          </svg>
          <span class="hidden sm:inline">{{
            locale === "en" ? "عربي" : "English"
          }}</span>
        </span>

        <div
          class="w-8 h-8 rounded-xl theme-card theme-border flex items-center justify-center theme-sub shrink-0"
        >
          <svg
            v-if="isDark"
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            class="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </div>

        <div
          class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-xs font-bold text-white shrink-0"
        >
          M
        </div>
      </div>
    </header>

    <div class="flex">
      <!-- Sidebar (desktop only) -->
      <aside
        class="hidden lg:flex w-52 border-e flex-col py-4 px-3 shrink-0 theme-sidebar"
        style="border-color: var(--border)"
      >
        <nav class="space-y-0.5 flex-1">
          <div
            v-for="item in navItems"
            :key="item.key"
            class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all border"
            :class="
              item.active
                ? 'bg-blue-600/15 text-blue-400 border-blue-500/20'
                : 'theme-sub border-transparent'
            "
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
                stroke-width="1.5"
                :d="item.icon"
              />
            </svg>
            {{ t(item.labelKey) }}
            <span
              v-if="item.badge"
              class="ms-auto text-[9px] px-1.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400"
            >
              {{ item.badge }}
            </span>
          </div>
        </nav>

        <!-- Quick stats -->
        <div class="mt-4 p-3 rounded-xl theme-card theme-border space-y-2">
          <p
            class="text-[10px] theme-muted font-medium uppercase tracking-wider mb-1"
          >
            {{ currentMonthLabel }}
          </p>
          <div
            v-for="s in quickStats"
            :key="s.labelKey"
            class="flex justify-between items-center"
          >
            <span class="text-[11px] theme-sub">{{ t(s.labelKey) }}</span>
            <span class="text-[11px] font-medium" :class="s.color">{{
              s.value
            }}</span>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 min-w-0">
        <!-- Toolbar -->
        <div
          class="px-3 sm:px-5 py-3 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5"
          style="border-color: var(--border)"
        >
          <div class="min-w-0 w-full sm:w-auto text-start">
            <h2 class="font-display text-sm sm:text-base font-600 theme-text">
              {{ t("dashboard.title") }}
            </h2>
            <p class="text-[11px] theme-sub mt-0.5">
              {{ dateRangeLabel }} · 9 {{ t("dashboard.postsPlanned") }}
            </p>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-end">
            <span
              class="hidden sm:inline-flex text-[10px] px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 items-center gap-1"
            >
              ✦ {{ topTrendTag }}
            </span>

            <span
              class="px-2.5 py-2 rounded-xl bg-green-600 text-white flex items-center"
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </span>

            <span
              class="px-2.5 py-2 rounded-xl border theme-sub flex items-center"
              style="border-color: var(--border)"
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
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3v5h5"
                />
              </svg>
            </span>

            <span
              class="px-2.5 py-2 rounded-xl bg-rose-600/10 text-rose-400 border border-rose-500/20 flex items-center"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </span>

            <span
              class="px-2.5 py-2 rounded-xl theme-card theme-border theme-sub flex items-center"
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
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </span>

            <span
              class="px-2.5 py-2 rounded-xl theme-card theme-border theme-sub flex items-center"
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
            </span>

            <span
              class="lg:hidden px-2.5 py-2 rounded-xl theme-card theme-border theme-sub flex items-center text-xs"
            >
              🔥
            </span>
          </div>
        </div>

        <div class="flex">
          <!-- Calendar -->
          <div class="flex-1 overflow-hidden p-2.5 sm:p-4">
            <div class="overflow-x-auto">
              <div
                class="grid grid-cols-7 gap-1 sm:gap-2 mb-2 min-w-[520px]"
              >
                <div
                  v-for="d in weekDays"
                  :key="d"
                  class="text-center text-[10px] theme-muted font-medium py-1"
                >
                  {{ d }}
                </div>
              </div>

              <div class="space-y-1.5 sm:space-y-2 min-w-[520px]">
                <div
                  v-for="(week, wi) in weeks"
                  :key="wi"
                  class="grid grid-cols-7 gap-1.5 sm:gap-2"
                >
                  <div
                    v-for="(cell, ci) in week"
                    :key="ci"
                    class="rounded-xl border p-1.5 flex flex-col min-h-[78px] sm:min-h-[120px] theme-card relative overflow-hidden"
                    style="border-color: var(--border)"
                  >
                    <div
                      v-if="cell.date"
                      class="flex items-center justify-between mb-1 px-0.5"
                    >
                      <span
                        class="text-[9px] sm:text-[10px] font-semibold tracking-wide"
                        :class="cell.post ? 'theme-text' : 'theme-muted'"
                      >
                        {{ cell.date }}
                      </span>
                    </div>

                    <div
                      v-if="cell.post"
                      class="relative rounded-lg border p-1.5 flex flex-col justify-between flex-1 shadow-sm"
                      :class="statusToClass(cell.post.status)"
                    >
                      <div class="flex items-start justify-between gap-1">
                        <span
                          class="text-[7px] sm:text-[8px] font-mono opacity-60"
                        >
                          {{ cell.date }}
                        </span>
                        <span
                          class="text-[7px] sm:text-[8px] px-1 py-0.5 rounded font-medium"
                          :class="platformBadge(cell.post.platform)"
                        >
                          {{
                            t(`dashboard.platformName.${cell.post.platform}`)
                          }}
                        </span>
                      </div>
                      <p
                        class="text-[7px] sm:text-[9px] leading-snug theme-sub flex-1 line-clamp-2 mt-1"
                        dir="rtl"
                      >
                        {{ cell.post.copy }}
                      </p>
                      <div
                        class="flex items-center justify-between mt-1 pt-1 border-t border-white/5"
                      >
                        <span
                          class="text-[7px] sm:text-[8px] font-medium"
                          :class="statusColor(cell.post.status)"
                        >
                          ● {{ t(`dashboard.statusName.${cell.post.status}`) }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-else-if="cell.date"
                      class="flex-1 flex items-center justify-center text-[10px] theme-muted opacity-40 italic"
                    >
                      —
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div
              class="flex items-center gap-3 sm:gap-5 flex-wrap mt-3 sm:mt-4 pt-3 border-t"
              style="border-color: var(--border)"
            >
              <p class="text-[11px] theme-muted font-medium">
                {{ t("dashboard.status") }}:
              </p>
              <div
                v-for="s in legend"
                :key="s.key"
                class="flex items-center gap-1.5"
              >
                <div class="w-1.5 h-1.5 rounded-full" :class="s.dot"></div>
                <span class="text-[10px] theme-sub">{{
                  t(`dashboard.statusName.${s.key}`)
                }}</span>
              </div>
            </div>
          </div>

          <!-- Trends panel (desktop only) -->
          <div
            class="hidden lg:block w-52 p-3 space-y-3 theme-sidebar border-s"
            style="border-color: var(--border)"
          >
            <div class="rounded-xl theme-surface theme-border p-3">
              <div class="flex items-center justify-between mb-3">
                <p class="text-xs font-medium theme-text">
                  🔥 {{ t("dashboard.trendingNow") }}
                </p>
              </div>
              <div class="space-y-2">
                <div
                  v-for="trend in trends"
                  :key="trend.tag"
                  class="flex items-center justify-between"
                >
                  <span class="text-[11px] theme-sub truncate">{{
                    trend.tag
                  }}</span>
                  <span class="text-[10px] shrink-0" :class="trend.color">{{
                    trend.change
                  }}</span>
                </div>
              </div>
              <span
                class="block w-full mt-3 py-1.5 rounded-lg theme-card theme-border theme-muted text-[10px] text-center"
              >
                {{ t("dashboard.injectTrend") }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "../composables/useTheme.js";
import { useLang } from "../composables/useLang.js";

const { t } = useI18n();
const { isDark } = useTheme();
const { locale } = useLang();

const dateRangeLabel = computed(() =>
  locale.value === 'ar' ? t('mockup.dateRange.ar') : t('mockup.dateRange.en')
);

const currentMonthLabel = computed(() =>
  locale.value === 'ar' ? t('mockup.monthLabel.ar') : t('mockup.monthLabel.en')
);

const weekDays = computed(() => [
  t("dashboard.day.mon"),
  t("dashboard.day.tue"),
  t("dashboard.day.wed"),
  t("dashboard.day.thu"),
  t("dashboard.day.fri"),
  t("dashboard.day.sat"),
  t("dashboard.day.sun"),
]);

const navItems = [
  {
    key: "calendar",
    labelKey: "layout.nav.calendar",
    active: true,
    badge: 1,
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    key: "posts",
    labelKey: "mockup.postsManager",
    active: false,
    badge: 9,
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    key: "brand",
    labelKey: "mockup.nav.brandVault",
    active: false,
    badge: null,
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  },
  {
    key: "chat",
    labelKey: "layout.nav.chat",
    active: false,
    badge: null,
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    key: "connections",
    labelKey: "layout.nav.connections",
    active: false,
    badge: null,
    icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1",
  },
  {
    key: "poster",
    labelKey: "layout.nav.poster",
    active: false,
    badge: null,
    icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    key: "billing",
    labelKey: "layout.nav.payment",
    active: false,
    badge: null,
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
];

const quickStats = [
  { labelKey: "layout.stats.generated", value: "9", color: "text-blue-400" },
  { labelKey: "layout.stats.approved", value: "0", color: "text-green-400" },
  { labelKey: "layout.stats.scheduled", value: "0", color: "text-blue-400" },
  { labelKey: "layout.stats.published", value: "0", color: "text-teal-400" },
];

const trends = [
  { tag: "سلاح ذووي", change: "+170%", color: "text-emerald-400" },
  { tag: "#تركيا", change: "+140%", color: "text-emerald-400" },
  { tag: "محمد أبو تريكة", change: "+80%", color: "text-emerald-400" },
  { tag: "منتخب كوريا الجنوبية", change: "+95%", color: "text-emerald-400" },
  { tag: "اذان الفجر", change: "+200%", color: "text-emerald-400" },
  { tag: "بنك مركزي", change: "+155%", color: "text-emerald-400" },
];

const topTrendTag = "سلاح ذووي";

// 7 columns x rows, with posts on Jun 12,13,15,16,18,19,22,24
const postCopies = {
  12: "أحلى لحظة بعد أذان الفجر هي قهوة كوريا التي تنظفك من الداخل، ابدأ يومك بنشاط...",
  13: "الكل يسأل عن أسعار الذهب اليوم 11/6/2026، بس عرابي كوفي القهوة المثالية لي أي نوع...",
  15: "القدة في رمضان مكملة بالة الحبيب وفنجان القهوة المظبوط من أكثر شخص...",
  16: "يومك مش بيبدأ غير بقهوة عظيمة ال#رياضات والمصارف، عرابي كوفي بدون عليك...",
  18: "ضوقنا ماكس جنوب كوريا حماس ومنتجات بطيق ع عرابي كوفي يلملي رمضان...",
  19: "أبو تريكة دايماً بيرسم البسمة على وحدا، زي وحدا، عرابي كوفي من بهجة فيكم...",
  22: "الناس بتسأل عن أسعار الذهب البياك المركزي، وإحنا بنسأل عن وصفة القهوة التركي...",
  24: "آخر أيام رمضان بهيل، استمتعوا بكل لحظة ومعكم عرابي كوفي أكبر جزء من ذكرى...",
};

const platformByDate = {
  12: "Instagram",
  13: "Facebook",
  15: "Instagram",
  16: "Facebook",
  18: "Instagram",
  19: "Facebook",
  22: "Facebook",
  24: "Instagram",
};

function buildWeeks() {
  // June 2026: Jun 1 = Monday
  const weeks = [];
  let day = 1;
  for (let w = 0; w < 4 && day <= 30; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      if (day > 30) {
        row.push({ date: null, post: null });
      } else {
        const hasPost = postCopies[day];
        row.push({
          date: day,
          post: hasPost
            ? {
                copy: postCopies[day],
                platform: platformByDate[day],
                status: "draft",
              }
            : null,
        });
        day++;
      }
    }
    weeks.push(row);
  }
  return weeks.slice(1, 4); // show weeks containing Jun 8 - Jun 28 (matches preview range roughly)
}

const weeks = buildWeeks();

const legend = [
  { key: "draft", dot: "bg-slate-400" },
  { key: "approved", dot: "bg-green-400" },
  { key: "scheduled", dot: "bg-cyan-400" },
  { key: "published", dot: "bg-indigo-400" },
];

function platformBadge(p) {
  return (
    {
      Instagram: "bg-pink-500/20 text-pink-400",
      Facebook: "bg-blue-500/20 text-blue-400",
    }[p] || "bg-slate-500/20 text-slate-400"
  );
}

function statusColor(status) {
  switch (status) {
    case "approved":
      return "text-green-400";
    case "scheduled":
      return "text-cyan-400";
    case "published":
      return "text-indigo-400";
    default:
      return "text-slate-400";
  }
}

function statusToClass(status) {
  switch (status) {
    case "approved":
      return "border-green-500/20 bg-green-500/5";
    case "scheduled":
      return "border-cyan-500/20 bg-cyan-500/5";
    case "published":
      return "border-indigo-500/20 bg-indigo-500/5";
    default:
      return "border-slate-500/20 theme-surface";
  }
}
</script>