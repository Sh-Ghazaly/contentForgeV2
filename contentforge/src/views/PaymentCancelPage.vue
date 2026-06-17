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
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl"></div>
    </div>

    <div class="relative w-full max-w-lg">

      <div class="theme-card theme-border rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center shadow-2xl shadow-black/40 space-y-7">

        <div class="relative mx-auto w-fit">
          <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto">
            <svg class="w-9 h-9 sm:w-11 sm:h-11 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </div>
          <div class="absolute inset-0 rounded-full border border-red-500/20 animate-ping"></div>
        </div>

        <div class="space-y-2">
          <h1 class="text-2xl sm:text-3xl font-bold theme-text">{{ t('payment.cancelTitle') }}</h1>
          <p class="text-sm sm:text-base theme-muted leading-relaxed max-w-sm mx-auto">{{ t('payment.cancelMsg') }}</p>
        </div>        

        <div class="flex flex-col">
          <button @click="goBack"
            class="w-full px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20">
            {{ t('common.back') || 'Back' }}
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
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLang } from '@/composables/useLang'
import { useTheme } from '@/composables/useTheme'

const { t, locale } = useI18n()
const router = useRouter()
const { switchLang } = useLang()
const { isDark, toggle: toggleTheme } = useTheme()

const goBack = () => {
  const token = localStorage.getItem('cf_token')
  const userStr = localStorage.getItem('cf_user')
  const user = userStr ? JSON.parse(userStr) : {}

  if (token) {
    // 🌟 1. Admins have no expiration. Check this FIRST to guarantee correct routing.
    if (user?.isAdmin) {
      router.push('/admin')
      return
    }

    // 🌟 2. If a regular user's trial is expired, send them back to the trial expired page
    if (user?.trialExpired) {
      router.push('/trial-expired')
      return
    }

    // 🌟 3. Normal active logged-in user: send to payment page to view status or try again
    router.push('/payment')
  } else {
    router.push('/login')
  }
}
</script>