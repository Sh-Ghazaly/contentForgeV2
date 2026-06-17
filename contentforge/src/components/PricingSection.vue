<template>
  <section id="pricing" class="py-24 relative overflow-hidden transition-colors duration-300"
    :class="isDark ? 'bg-forge-950' : 'bg-white'">
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent">
    </div>
    <div class="absolute inset-0 bg-grid transition-opacity duration-300" :class="isDark ? 'opacity-30' : 'opacity-15'">
    </div>

    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <div class="text-center mb-16">
        <span class="text-xs font-medium uppercase tracking-widest mb-4 block"
          :class="isDark ? 'text-amber-400' : 'text-amber-600'">
          {{ t('pricing.eyebrow') }}
        </span>
        <h2 class="font-display text-4xl md:text-5xl font-700 mb-4" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ t('pricing.heading') }}<br />
          <span class="text-gradient-warm">{{ t('pricing.headingAccent') }}</span>
        </h2>
        <p class="max-w-xl mx-auto" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          {{ t('pricing.subheading') }}
        </p>

        <div class="flex items-center justify-center gap-3 mt-8 flex-wrap select-none">
          <span class="text-sm transition-colors cursor-pointer"
            :class="!annual ? (isDark ? 'text-white font-medium' : 'text-slate-900 font-medium') : 'text-slate-500'"
            @click="annual = false">
            {{ t('pricing.monthly') }}
          </span>

          <button @click="annual = !annual" type="button"
            class="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500/40"
            :class="annual ? 'bg-blue-600' : (isDark ? 'bg-forge-700' : 'bg-slate-200')">
            <span
              class="absolute top-0.5 start-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm"
              :class="toggleKnobClass">
            </span>
          </button>

          <span class="text-sm transition-colors cursor-pointer flex items-center gap-1.5"
            :class="annual ? (isDark ? 'text-white font-medium' : 'text-slate-900 font-medium') : 'text-slate-500'"
            @click="annual = true">
            {{ t('pricing.annual') }}
            <span
              class="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">
              {{ t('pricing.save20') }}
            </span>
          </span>
        </div>
      </div>

      <div class="grid md:grid-cols-3 gap-5 md:gap-6">
        <div v-for="plan in plans" :key="plan.key"
          class="relative rounded-2xl p-5 md:p-7 border transition-all duration-300 flex flex-col" :class="[
            plan.popular
              ? (isDark ? 'bg-blue-600/10 border-blue-500/40 shadow-xl shadow-blue-500/10' : 'bg-blue-50/60 border-blue-200 shadow-lg shadow-blue-500/5')
              : (isDark ? 'bg-forge-950 border-white/8 hover:border-white/15' : 'bg-slate-50/50 border-slate-200 hover:border-slate-300')
          ]">

          <div v-if="plan.popular"
            class="absolute -top-3 left-1/2 -translate-x-1/2 md:translate-x-0 md:start-auto md:end-6 md:top-4 mb-4">
            <span class="text-[10px] px-2.5 py-1 rounded-full font-medium border whitespace-nowrap"
              :class="isDark ? 'bg-blue-600/30 text-blue-300 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200'">
              {{ t('pricing.mostPopular') }}
            </span>
          </div>

          <h3 class="font-display text-xl font-600 mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ plan.name }}
          </h3>
          <p class="text-sm mb-5 md:mb-6" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
            {{ plan.tagline }}
          </p>

          <div class="flex items-baseline gap-1 mb-6 md:mb-7">
            <span class="text-sm" :class="isDark ? 'text-slate-400' : 'text-slate-500'">$</span>
            <span class="font-display text-4xl font-700" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ annual ? plan.annualPrice : plan.monthlyPrice }}
            </span>
            <span class="text-sm" :class="isDark ? 'text-slate-500' : 'text-slate-500'">{{ t('pricing.perMonth')
              }}</span>
            <span v-if="annual && plan.monthlyPrice > 0"
              class="ml-2 text-[11px] text-green-600 dark:text-green-400 font-medium">
              {{ t('pricing.wasPrice', { price: plan.monthlyPrice }) }}
            </span>
          </div>

          <RouterLink v-if="plan.key === 'free'" to="/dashboard"
            class="w-full text-center py-3 rounded-xl text-sm font-medium mb-6 md:mb-8 transition-all duration-200 flex items-center justify-center gap-2 underline"
            :class="plan.popular
              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25'
              : (isDark ? 'border border-white/15 text-slate-300 hover:border-white/30 hover:text-white' : 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50')">
            {{ t('pricing.tryNow', 'Try Now') }}
          </RouterLink>

          <button v-else @click="handlePaidPlanClick($event, plan.key)" :disabled="checkoutLoading === plan.key"
            class="w-full text-center py-3 rounded-xl text-sm font-medium mb-6 md:mb-8 transition-all duration-200 flex items-center justify-center gap-2"
            :class="plan.popular
              ? 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50'
              : (isDark ? 'border border-white/15 text-slate-300 hover:border-white/30 hover:text-white disabled:opacity-50' : 'border border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50')">
            <svg v-if="checkoutLoading === plan.key" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ t('pricing.tryNow', 'Try Now') }}
          </button>

          <ul class="space-y-3 flex-1">
            <li v-for="f in plan.features" :key="f" class="flex items-start gap-2.5 text-sm"
              :class="isDark ? 'text-slate-300' : 'text-slate-700'">
              <svg class="w-4 h-4 mt-0.5 shrink-0 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              {{ f }}
            </li>
          </ul>

        </div>
      </div>

      <p v-if="errorMsg" class="text-center text-sm text-rose-400 mt-6">
        {{ errorMsg }}
      </p>

      <p class="text-center text-sm mt-10" :class="isDark ? 'text-slate-600' : 'text-slate-400'">
        {{ t('pricing.bottomNote') }}
      </p>

    </div>
  </section>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'
import paymentApi from '../api/paymentApi.js'

const { t, locale } = useI18n()
const { isDark } = useTheme()
const router = useRouter()

const annual = ref(false)
const isLoggedIn = ref(false)
const checkoutLoading = ref(null)
const errorMsg = ref("")

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem('cf_token')
})

const isRtl = computed(() => {
  return locale.value === "ar";
});

const toggleKnobClass = computed(() => {
  if (annual.value) {
    return isRtl.value ? "-translate-x-5" : "translate-x-5";
  }
  return "translate-x-0";
});

/**
 * Handles clicks on paid plan buttons.
 * If not logged in -> redirect to /login (like the free plan flow).
 * If logged in -> call the payment API and redirect to checkout.
 */
const handlePaidPlanClick = async (event, planKey) => {
  const token = localStorage.getItem('cf_token')

  if (!token) {
    router.push({
      path: '/login',
      query: {
        redirect: router.currentRoute.value.fullPath,
        plan: planKey,
        billing: annual.value ? 'annual' : 'monthly'
      }
    })
    return
  }

  if (checkoutLoading.value) return

  checkoutLoading.value = planKey
  errorMsg.value = ""

  try {
    const billingSuffix = annual.value ? 'annual' : 'monthly'
    const paymentKey = `${planKey}_${billingSuffix}`

    // Pass an origin identifier to your payment checkout API
    const url = await paymentApi.checkout(paymentKey, { from: 'pricing' })

    if (url) {
      window.location.href = url
    } else {
      throw new Error(t("payment.errorGeneric", "تأخر استجابة بوابة الدفع، يرجى المحاولة مرة أخرى."));
    }
  } catch (e) {
    errorMsg.value = e.message || t("payment.errorGeneric")
    checkoutLoading.value = null
  }
}


const plans = computed(() => [
  {
    key: "free",
    name: t("pricing.plans.free.name", "Free"),
    tagline: t("pricing.plans.free.tagline", "Explore the essential capabilities of our platform"),
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
    name: t("pricing.plans.pro.name", "Pro"),
    tagline: t("pricing.plans.pro.tagline", "Perfect for growing creators and marketing teams"),
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
    tagline: t("pricing.plans.enterprise.tagline", "Maximum production value and custom toolsets for scale"),
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
</script>