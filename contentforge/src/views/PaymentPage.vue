<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 class="text-2xl font-bold theme-text">{{ t("payment.title") }}</h1>
        <p class="text-sm theme-muted mt-1">{{ t("payment.subtitle") }}</p>
      </div>

      <div class="rounded-2xl theme-surface theme-border p-6">
        <div class="flex items-start justify-between gap-4 flex-wrap">
          <div>
  <p class="text-xs theme-muted mb-1">
    {{ t("payment.currentPlan") }}
  </p>
  <div class="flex items-center gap-2">
    <span class="text-xl font-bold theme-text capitalize">{{ planLabel }}</span>
    
    <!-- ✅ Badge للإلغاء المجدول -->
    <span 
      v-if="subscription?.cancelAtPeriodEnd"
      class="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 font-medium"
    >
      {{ t("payment.cancelsAtEnd") || "Cancels at period end" }}
    </span>
  </div>
  
  <p
    v-if="subscription?.currentPeriodEnd"
    class="text-xs theme-muted mt-1.5"
  >
    <template v-if="subscription.cancelAtPeriodEnd">
      {{ t("payment.accessUntil") || "Access until" }}
    </template>
    <template v-else>
      {{ t("payment.renewsOn") || "Renews on" }}
    </template>
    {{ formatDate(subscription.currentPeriodEnd) }}
  </p>
</div>
          <div
            v-if="subscription?.card"
            class="flex items-center gap-3 px-4 py-3 rounded-xl theme-card theme-border"
          >
            <svg
              class="w-8 h-5 text-blue-400"
              viewBox="0 0 32 20"
              fill="currentColor"
            >
              <rect
                width="32"
                height="20"
                rx="3"
                fill="currentColor"
                opacity=".15"
              />
              <rect
                y="6"
                width="32"
                height="5"
                fill="currentColor"
                opacity=".4"
              />
            </svg>
            <div>
              <p class="text-xs font-medium theme-text capitalize">
                {{ subscription.card.brand }} •••• {{ subscription.card.last4 }}
              </p>
              <p class="text-[10px] theme-muted">
                {{ subscription.card.expMonth }}/{{ subscription.card.expYear }}
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mt-5">
          <button
            v-if="currentPlan !== 'free'"
            @click="openPortal"
            :disabled="portalLoading"
            class="flex items-center gap-2 px-4 py-2 rounded-xl theme-card theme-border theme-sub text-sm hover:theme-text transition-colors disabled:opacity-50"
          >
            <svg
              v-if="portalLoading"
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {{ t("payment.manageSubscription") }}
          </button>
        </div>
      </div>

      <!-- Usage Stats - أضف الكود ده هنا -->
      <div class="rounded-2xl theme-surface theme-border p-6">
        <h3 class="text-sm font-semibold theme-text mb-4">
          {{ t("payment.usageStats") }}
        </h3>

        <div class="space-y-4">
          <!-- AI Images -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs theme-sub">{{
                t("payment.aiImagesUsed")
              }}</span>
              <span class="text-xs font-medium theme-text">
                {{ usage.aiImagesGenerated }} / {{ limits.maxAiImagesPerMonth }}
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                class="h-full bg-blue-500 transition-all duration-300"
                :style="{
                  width: `${Math.min(usagePercentage.aiImages, 100)}%`,
                }"
              ></div>
            </div>
          </div>

          <!-- Posts -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs theme-sub">{{
                t("payment.postsGenerated")
              }}</span>
              <span class="text-xs font-medium theme-text">
                {{ usage.postsGenerated }} / {{ limits.maxPostsPerCalendar }}
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                class="h-full bg-green-500 transition-all duration-300"
                :style="{ width: `${Math.min(usagePercentage.posts, 100)}%` }"
              ></div>
            </div>
          </div>

          <!-- Calendars -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs theme-sub">{{
                t("payment.calendarsCreated")
              }}</span>
              <span class="text-xs font-medium theme-text">
                {{ usage.calendarsCreated }} / {{ limits.maxCalendarsPerMonth }}
              </span>
            </div>
            <div class="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
              <div
                class="h-full bg-purple-500 transition-all duration-300"
                :style="{
                  width: `${Math.min(usagePercentage.calendars, 100)}%`,
                }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-center gap-3 select-none">
        <span
          class="text-sm transition-colors cursor-pointer"
          :class="!annual ? 'theme-text font-medium' : 'theme-muted'"
          @click="annual = false"
        >
          {{ t("pricing.monthly") }}
        </span>

        <button
          @click="annual = !annual"
          type="button"
          class="relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500/40"
          :class="annual ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-white/10'"
        >
          <span
            class="absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out shadow-sm"
            :class="toggleKnobClass"
          ></span>
        </button>

        <span
          class="text-sm transition-colors cursor-pointer flex items-center gap-1.5"
          :class="annual ? 'theme-text font-medium' : 'theme-muted'"
          @click="annual = true"
        >
          {{ t("pricing.annual") }}
          <span
            class="text-[11px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-400 border border-green-500/20 font-medium"
          >
            {{ t("pricing.save20") }}
          </span>
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          v-for="plan in plans"
          :key="plan.key"
          class="relative rounded-2xl p-5 flex flex-col gap-4 transition-all border"
          :class="[
            plan.popular
              ? 'theme-surface border-blue-500/40'
              : 'theme-card theme-border',
            currentPlan === plan.key && plan.key !== 'free'
              ? 'ring-2 ring-blue-500/50'
              : '',
          ]"
        >
          <div
            v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] px-3 py-0.5 rounded-full bg-blue-600 text-white font-medium whitespace-nowrap"
          >
            {{ t("pricing.mostPopular") }}
          </div>

          <div>
            <p class="text-base font-bold theme-text">{{ plan.name }}</p>
            <p class="text-xs theme-muted mt-0.5">{{ plan.tagline }}</p>
          </div>

          <div class="flex items-end gap-1">
            <span class="text-3xl font-bold theme-text"
              >${{ annual ? plan.annualPrice : plan.monthlyPrice }}</span
            >
            <span class="text-xs theme-muted mb-1">{{
              t("pricing.perMonth")
            }}</span>
            <span
              v-if="annual && plan.monthlyPrice > 0"
              class="ml-auto text-[11px] text-green-400 line-through-none"
            >
              {{ t("pricing.wasPrice", { price: plan.monthlyPrice }) }}
            </span>
          </div>

          <ul class="space-y-1.5 flex-1">
            <li
              v-for="f in plan.features"
              :key="f"
              class="flex items-start gap-2 text-xs theme-sub"
            >
              <svg
                class="w-3.5 h-3.5 text-green-400 shrink-0 mt-px"
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

          <button
  @click="subscribe(plan.key)"
  :disabled="currentPlan === plan.key || checkoutLoading === plan.key"
  class="w-full py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  :class="[
    currentPlan === plan.key && plan.key !== 'free'
      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
      : 'bg-blue-600 text-white hover:bg-blue-500'
  ]"
>
  <svg
    v-if="checkoutLoading === plan.key"
    class="w-4 h-4 animate-spin inline mr-2"
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
  
  <!-- ✅ عرض نص مختلف حسب الحالة -->
  <template v-if="currentPlan === plan.key && plan.key !== 'free'">
    ✓ {{ t("pricing.currentPlan") || "Current Plan" }}
  </template>
  <template v-else-if="plan.key === 'free' && currentPlan !== 'free'">
    {{ t("pricing.downgrade") || "Downgrade" }}
  </template>
  <template v-else>
    {{ plan.cta }}
  </template>
</button>
        </div>
      </div>

      <p v-if="errorMsg" class="text-sm text-rose-400 text-center">
        {{ errorMsg }}
      </p>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import AppLayout from "../components/AppLayout.vue";
import paymentApi from "../api/paymentApi";
import subscriptionApi from "../api/subscriptionApi";
import { useAuthStore } from "../stores/authStore";
import { useLang } from "../composables/useLang.js";

const { t, locale } = useI18n();
const authStore = useAuthStore();
const { locale: langLocale } = useLang();
const router = useRouter();

// ── State ──────────────────────────────────────────────────────────────────────
const annual = ref(false);
const subscription = ref(null);
const currentPlan = ref(authStore.user?.plan || "free");
const subStatus = ref("free");
const checkoutLoading = ref(null);
const portalLoading = ref(false);
const errorMsg = ref("");

// ✅ أضف الـ state ده:
const usage = ref({
  aiImagesGenerated: 0,
  postsGenerated: 0,
  calendarsCreated: 0,
});

const limits = ref({
  maxAiImagesPerMonth: 3,
  maxPostsPerCalendar: 5,
  maxCalendarsPerMonth: 1,
  maxBrands: 1,
});

// ── Plans data ────────────────────────────────────────────────────────────────
const plans = computed(() => [
  {
    key: "free",
    name: t("pricing.plans.free.name"),
    tagline: t("pricing.plans.free.tagline"),
    cta: t("pricing.plans.free.cta"),
    monthlyPrice: 0,
    annualPrice: 0,
    popular: false,
    features: [
      t("pricing.plans.free.f1"),
      t("pricing.plans.free.f2"),
      t("pricing.plans.free.f3"),
      t("pricing.plans.free.f4"),
    ],
  },
  {
    key: "pro",
    name: t("pricing.plans.pro.name"),
    tagline: t("pricing.plans.pro.tagline"),
    cta: t("pricing.plans.pro.cta"),
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
    name: t("pricing.plans.enterprise.name"),
    tagline: t("pricing.plans.enterprise.tagline"),
    cta: t("pricing.plans.enterprise.cta"),
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

// ── Computed ──────────────────────────────────────────────────────────────────
const usagePercentage = computed(() => {
  return {
    aiImages: Math.round((usage.value.aiImagesGenerated / limits.value.maxAiImagesPerMonth) * 100),
    posts: Math.round((usage.value.postsGenerated / limits.value.maxPostsPerCalendar) * 100),
    calendars: Math.round((usage.value.calendarsCreated / limits.value.maxCalendarsPerMonth) * 100),
  };
});

const isRtl = computed(() => {
  const current = locale.value || langLocale.value || "en";
  return current === "ar";
});

const toggleKnobClass = computed(() => {
  if (annual.value) {
    return isRtl.value ? "-translate-x-5" : "translate-x-5";
  }
  return "translate-x-0";
});

const planLabel = computed(() => {
  const map = {
    free: "Free",
    pro: "pro",
    enterprise: "enterprise",
  };
  return map[currentPlan.value] || currentPlan.value;
});

const statusLabel = computed(() => {
  // لو الخطة pro أو enterprise، اعرض "Active" مش "Free"
  if (currentPlan.value === 'pro' || currentPlan.value === 'enterprise') {
    return t("payment.statusActive");
  }
  
  const map = {
    active: t("payment.statusActive"),
    trialing: t("payment.statusTrial"),
    past_due: t("payment.statusPastDue"),
    canceled: t("payment.statusCanceled"),
    free: t("payment.statusFree"),
  };
  return map[subStatus.value] || subStatus.value;
});

const statusBadgeClass = computed(
  () =>
    ({
      active: "bg-green-500/15 text-green-400 border border-green-500/20",
      trialing: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
      past_due: "bg-rose-500/15  text-rose-400  border border-rose-500/20",
      canceled: "bg-slate-500/15 text-slate-400 border border-slate-500/20",
      free: "bg-slate-500/15 text-slate-400 border border-slate-500/20",
    }[subStatus.value] || "bg-slate-500/15 text-slate-400")
);

// ── Methods ───────────────────────────────────────────────────────────────────
function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

async function subscribe(planKey) {
  // If clicking the free plan card, re-route to login instead of checkout
  if (planKey === "free") {
    router.push("/login"); // Adjust route destination if your login path differs
    return;
  }

  if (currentPlan.value === planKey) return;
  checkoutLoading.value = planKey;
  errorMsg.value = "";
  try {
    const key = annual.value ? `${planKey}_annual` : `${planKey}_monthly`;

    // Tag origin parameter context
    const url = await paymentApi.checkout(key, { from: "payment" });

    window.location.href = url;
  } catch (e) {
    errorMsg.value = e.message || t("payment.errorGeneric");
  } finally {
    checkoutLoading.value = null;
  }
}

async function openPortal() {
  portalLoading.value = true;
  errorMsg.value = "";
  try {
    const url = await paymentApi.openPortal();
    window.location.href = url;
  } catch (e) {
    errorMsg.value = e.message || t("payment.errorGeneric");
  } finally {
    portalLoading.value = false;
  }
}

async function loadStatus() {
  try {
    const [paymentData, usageData] = await Promise.all([
      paymentApi.getStatus(),
      subscriptionApi.getUsage(),
    ]);
    
    currentPlan.value = paymentData.plan;
    subStatus.value = paymentData.status;
    subscription.value = paymentData.subscription;
    
    if (usageData.success) {
      usage.value = usageData.usage;
      limits.value = usageData.limits;
    }
  } catch (err) {
    console.error("Failed to load status:", err);
  }
}

onMounted(loadStatus);
</script>