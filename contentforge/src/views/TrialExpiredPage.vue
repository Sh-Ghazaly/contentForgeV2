<template>
  <div
    class="min-h-screen theme-bg flex flex-col justify-center items-center p-4 sm:p-6 bg-grid overflow-y-auto relative"
    :dir="locale === 'ar' ? 'rtl' : 'ltr'"
  >
    <!-- Language & Theme Switcher -->
    <div
      class="absolute sm:fixed top-4 left-1/2 -translate-x-1/2 sm:translate-x-0 z-50 flex items-center gap-2"
      :class="
        locale === 'ar' ? 'sm:left-4 sm:right-auto' : 'sm:right-4 sm:left-auto'
      "
    >
      <button
        @click="switchLang"
        class="flex items-center gap-1.5 text-xs theme-sub px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors shadow-sm whitespace-nowrap"
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
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"
          />
        </svg>
        {{ locale === "en" ? "عربي" : "English" }}
      </button>

      <button
        @click="toggleTheme"
        class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors theme-card theme-border theme-sub hover:theme-text shadow-sm"
        :title="isDark ? t('layout.switchLight') : t('layout.switchDark')"
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
      </button>
    </div>

    <!-- Background Glow Effect -->
    <div
      class="absolute top-1/4 left-1/2 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-red-600/5 blur-3xl pointer-events-none hidden sm:block"
      :class="locale === 'ar' ? 'translate-x-1/2' : '-translate-x-1/2'"
    ></div>

    <!-- Main Container -->
    <div
      class="w-full max-w-6xl relative z-10 mt-16 sm:mt-8 mb-8 mx-auto px-4 sm:px-6"
    >
      <!-- Header Section -->
      <div class="text-center mb-12">
        <RouterLink
          to="/"
          dir="ltr"
          class="inline-flex items-center gap-2.5 mb-4 sm:mb-6"
        >
          <div
            class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L7 12L13 4"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="font-display font-700 text-xl theme-text"
            >ContentForge</span
          >
        </RouterLink>

        <div
          class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <svg
            class="w-6 h-6 sm:w-7 sm:h-7 text-rose-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium mb-3"
        >
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
          {{ t("trial.badge") }}
        </span>

        <h1
          class="font-display text-xl sm:text-2xl font-700 theme-text mb-2 px-2"
        >
          {{ t("trial.title") }}
        </h1>
        <p
          class="text-xs sm:text-sm theme-sub max-w-md mx-auto leading-relaxed px-4 mb-8"
        >
          {{ t("trial.subtitle") }}
        </p>

        <!-- Toggle Switch Layout Synchronized with image_781dde.png Logic -->
        <div
          class="flex items-center justify-center gap-3 mt-4 flex-wrap select-none"
        >
          <span
            class="text-sm transition-colors cursor-pointer"
            :class="
              !annual
                ? isDark
                  ? 'text-white font-medium'
                  : 'text-slate-900 font-medium'
                : 'text-slate-500'
            "
            @click="annual = false"
          >
            {{ t("pricing.monthly") }}
          </span>

          <button
            @click="annual = !annual"
            type="button"
            role="switch"
            :aria-checked="annual"
            :aria-label="t('pricing.billingToggle')"
            class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500/40"
            :class="
              annual ? 'bg-blue-600' : isDark ? 'bg-forge-700' : 'bg-slate-200'
            "
          >
            <span
              class="absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
              :class="toggleKnobClass"
            >
            </span>
          </button>

          <span
            class="text-sm transition-colors cursor-pointer flex items-center gap-1.5"
            :class="
              annual
                ? isDark
                  ? 'text-white font-medium'
                  : 'text-slate-900 font-medium'
                : 'text-slate-500'
            "
            @click="annual = true"
          >
            {{ t("pricing.annual") }}
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium"
            >
              {{ t("pricing.save20") }}
            </span>
          </span>
        </div>
      </div>

      <!-- Pricing Cards Grid From PricingSection.vue -->
      <div
        class="grid md:grid-cols-2 max-w-4xl mx-auto gap-5 md:gap-6 text-start mb-8"
      >
        <div
          v-for="plan in plans"
          :key="plan.key"
          class="relative rounded-2xl p-5 md:p-7 border transition-all duration-300 flex flex-col"
          :class="[
            plan.popular
              ? isDark
                ? 'bg-blue-600/10 border-blue-500/40 shadow-xl shadow-blue-500/10'
                : 'bg-blue-50/60 border-blue-200 shadow-lg shadow-blue-500/5'
              : isDark
              ? 'bg-forge-950 border-white/8 hover:border-white/15'
              : 'bg-slate-50/50 border-slate-200 hover:border-slate-300',
          ]"
        >
          <!-- Most Popular Badge -->
          <div
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 md:translate-x-0 md:start-auto md:end-6 md:top-4 mb-4"
          >
            <span
              class="text-[10px] px-2.5 py-1 rounded-full font-medium border whitespace-nowrap"
              :class="
                isDark
                  ? 'bg-blue-600/30 text-blue-300 border-blue-500/30'
                  : 'bg-blue-100 text-blue-700 border-blue-200'
              "
            >
              {{ t("pricing.mostPopular") }}
            </span>
          </div>

          <h3
            class="font-display text-xl font-600 mb-1"
            :class="isDark ? 'text-white' : 'text-slate-900'"
          >
            {{ plan.name }}
          </h3>
          <p
            class="text-sm mb-5 md:mb-6"
            :class="isDark ? 'text-slate-500' : 'text-slate-500'"
          >
            {{ plan.tagline }}
          </p>

          <div class="flex items-baseline gap-1 mb-6 md:mb-7">
            <span
              class="text-sm"
              :class="isDark ? 'text-slate-400' : 'text-slate-500'"
              >$</span
            >
            <span
              class="font-display text-4xl font-700"
              :class="isDark ? 'text-white' : 'text-slate-900'"
            >
              {{ annual ? plan.annualPrice : plan.monthlyPrice }}
            </span>
            <span
              class="text-sm"
              :class="isDark ? 'text-slate-500' : 'text-slate-500'"
              >{{ t("pricing.perMonth") }}</span
            >
            <span
              v-if="annual && plan.monthlyPrice > 0"
              class="ml-2 text-[11px] text-green-600 dark:text-green-400 font-medium"
            >
              {{ t("pricing.wasPrice", { price: plan.monthlyPrice }) }}
            </span>
          </div>

          <button
            @click="handlePlanClick(plan)"
            :disabled="checkoutLoading === plan.key"
            class="w-full text-center py-3 rounded-xl text-sm font-medium mb-6 md:mb-8 transition-all duration-200 flex items-center justify-center gap-2"
            :class="
              plan.popular
                ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50'
                : isDark
                ? 'border border-white/15 text-slate-300 hover:border-white/30 hover:text-white disabled:opacity-50'
                : 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50'
            "
          >
            <svg
              v-if="checkoutLoading === plan.key"
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
            {{ t("pricing.tryNow", "Try Now") }}
          </button>

          <!-- Core Feature Mapping Migration -->
          <ul class="space-y-3 flex-1">
            <li
              v-for="f in plan.features"
              :key="f"
              class="flex items-start gap-2.5 text-sm"
              :class="isDark ? 'text-slate-300' : 'text-slate-700'"
            >
              <svg
                class="w-4 h-4 mt-0.5 shrink-0 text-teal-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {{ f }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Error Message Feedback -->
      <p v-if="errorMsg" class="text-sm text-rose-400 text-center mb-6">
        {{ errorMsg }}
      </p>

      <!-- Bottom Action Section (Sign Out) -->
      <div class="w-full max-w-md mx-auto pt-4">
        <div class="flex items-center gap-3 my-5">
          <div class="flex-1 h-px" style="background: var(--border)"></div>
          <span class="text-xs theme-muted">{{ t("common.or") }}</span>
          <div class="flex-1 h-px" style="background: var(--border)"></div>
        </div>

        <button
          @click="logout"
          class="w-full py-3 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors flex items-center justify-center gap-2 shadow-sm"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {{ t("trial.signOut") }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLang } from "../composables/useLang.js";
import { useTheme } from "../composables/useTheme.js";
import paymentApi from "../api/paymentApi.js";

const { t } = useI18n();
const { locale, switchLang } = useLang();
const { isDark, toggle: toggleTheme } = useTheme();

const router = useRouter();

const annual = ref(false);
const checkoutLoading = ref(null);
const errorMsg = ref("");

// RTL Localization support logic
const isRtl = computed(() => locale.value === "ar");

const toggleKnobClass = computed(() => {
  if (annual.value) {
    return isRtl.value ? "-translate-x-5" : "translate-x-5";
  }
  return "translate-x-0";
});

// Synced Plans Computed Hook structures directly from PricingSection.vue
const plans = computed(() => [
  {
    key: "pro",
    name: t("pricing.plans.pro.name", "Pro"),
    tagline: t(
      "pricing.plans.pro.tagline",
      "Perfect for growing creators and marketing teams"
    ),
    monthlyPrice: 19,
    annualPrice: 15,
    popular: true,
    features: [
      t("pricing.plans.pro.f1"),
      t("pricing.plans.pro.f2"),
      t("pricing.plans.pro.f3"),
      t("pricing.plans.pro.f4"),
    ],
  },
  {
    key: "enterprise",
    name: t("pricing.plans.enterprise.name", "Enterprise"),
    tagline: t(
      "pricing.plans.enterprise.tagline",
      "Maximum production value and custom toolsets for scale"
    ),
    monthlyPrice: 49,
    annualPrice: 39,
    popular: false,
    features: [
      t("pricing.plans.enterprise.f1"),
      t("pricing.plans.enterprise.f2"),
      t("pricing.plans.enterprise.f3"),
      t("pricing.plans.enterprise.f4"),
      t("pricing.plans.enterprise.f5"),
    ],
  },
]);

function resetCheckoutState(event) {
  if (event.persisted || !checkoutLoading.value) {
    checkoutLoading.value = null;
    errorMsg.value = "";
  }
}

onMounted(() => {
  window.addEventListener("pageshow", resetCheckoutState);
});

onUnmounted(() => {
  window.removeEventListener("pageshow", resetCheckoutState);
});

// Unified Payment handler method from PricingSection.vue
async function handlePlanClick(plan) {
  const token = localStorage.getItem("cf_token");

  if (!token) {
    router.push({
      path: "/login",
      query: {
        redirect: router.currentRoute.value.fullPath,
        plan: plan.key,
        billing: annual.value ? "annual" : "monthly",
      },
    });
    return;
  }

  if (checkoutLoading.value) return;

  checkoutLoading.value = plan.key;
  errorMsg.value = "";

  try {
    const billingSuffix = annual.value ? "annual" : "monthly";
    const planKey = `${plan.key}_${billingSuffix}`;

    // Tag origin parameter context
    const url = await paymentApi.checkout(planKey);

    if (url) {
      window.location.href = url;
    } else {
      throw new Error(
        t(
          "payment.errorGeneric",
          "تأخر استجابة بوابة الدفع، يرجى المحاولة مرة أخرى."
        )
      );
    }
  } catch (e) {
    errorMsg.value = e.message || t("payment.errorGeneric");
    checkoutLoading.value = null;
  }
}

function logout() {
  localStorage.removeItem("cf_token");
  localStorage.removeItem("cf_user");
  router.push("/login");
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>