<template>
  <div class="min-h-screen theme-bg flex items-center justify-center p-4 sm:p-6" :dir="locale === 'ar' ? 'rtl' : 'ltr'">

    <div class="fixed top-3 end-3 sm:top-4 sm:end-4 z-10 flex items-center gap-2">
      
      <button @click="switchLang"
        class="text-xs theme-sub px-3 py-1.5 rounded-lg theme-card theme-border hover:theme-text transition-colors flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
        </svg>
        <span class="hidden sm:inline">{{ locale === 'en' ? 'عربي' : 'English' }}</span>
        <span class="sm:hidden">{{ locale === 'en' ? 'ع' : 'EN' }}</span>
      </button>

      <button @click="toggleTheme"
        class="w-8 h-8 rounded-lg theme-card theme-border flex items-center justify-center theme-sub hover:theme-text transition-colors shrink-0"
        :title="isDark ? t('layout.switchLight') : t('layout.switchDark')">
        <svg v-if="isDark" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </div>

    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-lg">

      <div class="theme-card theme-border rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center shadow-2xl shadow-black/40 space-y-7">

        <!-- Loading State -->
        <div v-if="loading" class="space-y-6">
          <div class="relative mx-auto w-fit">
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center mx-auto">
              <svg class="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          </div>
          <div class="space-y-2">
            <h1 class="text-2xl sm:text-3xl font-bold theme-text">{{ t('payment.confirming') || 'Confirming Payment...' }}</h1>
            <p class="text-sm sm:text-base theme-muted leading-relaxed max-w-sm mx-auto">
              {{ t('payment.confirmingMsg') || 'Please wait while we verify your payment.' }}
            </p>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="space-y-6">
          <div class="relative mx-auto w-fit">
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center mx-auto">
              <svg class="w-10 h-10 sm:w-12 sm:h-12 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div class="space-y-2">
            <h1 class="text-2xl sm:text-3xl font-bold theme-text">{{ t('payment.errorTitle') || 'Payment Confirmation Failed' }}</h1>
            <p class="text-sm sm:text-base theme-muted leading-relaxed max-w-sm mx-auto">{{ error }}</p>
          </div>
          <div class="flex flex-col gap-3">
            <button @click="retryConfirm"
              class="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all duration-200">
              {{ t('common.retry') || 'Retry' }}
            </button>
            <button @click="goBack"
              class="w-full px-6 py-3 rounded-xl theme-card theme-border theme-sub text-sm font-semibold hover:theme-text transition-all duration-200">
              {{ t('common.backToDashboard') || 'Back to Dashboard' }}
            </button>
          </div>
        </div>

        <!-- Success State -->
        <div v-else class="space-y-6">
          <div class="relative mx-auto w-fit">
            <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center mx-auto">
              <svg class="w-10 h-10 sm:w-12 sm:h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
            </div>
            <div class="absolute inset-0 rounded-full border border-green-500/20 animate-ping"></div>
          </div>

          <div class="space-y-2">
            <h1 class="text-2xl sm:text-3xl font-bold theme-text">{{ t('payment.successTitle') }}</h1>
            <p class="text-sm sm:text-base theme-muted leading-relaxed max-w-sm mx-auto">{{ t('payment.successMsg') }}</p>
            
            <!-- ✅ عرض الخطة الجديدة -->
            <div v-if="newPlan" class="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <p class="text-xs text-blue-400 font-medium uppercase tracking-wider mb-1">
                {{ t('payment.yourNewPlan') || 'Your New Plan' }}
              </p>
              <p class="text-lg font-bold theme-text capitalize">{{ newPlan }}</p>
            </div>
          </div>        

          <div class="flex flex-col">
            <button @click="goBack"
              class="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25">
              {{ t('common.done') || 'Done' }}
            </button>
          </div>

          <p class="text-xs theme-muted">
            {{ t('payment.needHelp') }}
            <button @click="router.push('/contact')" class="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2 ms-1">
              {{ t('payment.contactSupport') }}
            </button>
          </p>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '../stores/authStore'
import { useTheme } from '../composables/useTheme.js'
import { useLang } from '../composables/useLang.js'
import paymentApi from '../api/paymentApi'
import authApi from '../api/authApi'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { isDark, toggle: toggleTheme } = useTheme()
const { switchLang } = useLang()

const loading = ref(true)
const error = ref('')
const newPlan = ref('')

const goBack = () => {
  router.push('/dashboard')
}

// ✅ دالة تأكيد الدفع
async function confirmPayment() {
  const sessionId = route.query.session_id
  
  if (!sessionId) {
    error.value = t('payment.noSession') || 'No session ID found'
    loading.value = false
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 1️⃣ استدعاء paymentApi.confirmPayment لتحديث الـ Plan في الـ Backend
    const result = await paymentApi.confirmPayment(sessionId)
    
    if (result.success) {
      newPlan.value = result.plan
    }

    // 2️⃣ تحديث بيانات المستخدم في الـ Auth Store باستخدام authApi.getProfile()
    const freshUser = await authApi.getProfile()
    authStore.user = freshUser
    localStorage.setItem('cf_user', JSON.stringify(freshUser))
    
    loading.value = false
  } catch (err) {
    console.error('Payment confirmation error:', err)
    error.value = err.message || t('payment.confirmError') || 'Failed to confirm payment'
    loading.value = false
  }
}

function retryConfirm() {
  confirmPayment()
}

// ── Refresh User Profile Data ──
onMounted(() => {
  confirmPayment()
})
</script>