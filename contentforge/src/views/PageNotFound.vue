<template>
  <div>
    <Navbar />
    <div class="min-h-screen flex items-center justify-center px-6 py-20"
      :class="isDark ? 'bg-slate-950' : 'bg-white'">
    
    <div class="text-center max-w-lg">
      <div class="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 shadow-xl shadow-blue-500/20">
        <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 class="text-6xl font-display font-800 mb-4" :class="isDark ? 'text-white' : 'text-slate-900'">404</h1>
      <h2 class="text-2xl font-bold mb-4" :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ t('notFound.title') }}
      </h2>
      <p class="mb-8 text-lg" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
        {{ t('notFound.message') }}
      </p>

      <RouterLink to="/"
        class="inline-block px-8 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20">
        {{ t('notFound.backHome') }}
      </RouterLink>
    </div>
    </div>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'
import Navbar from '../components/Navbar.vue'

export default {
  name: 'PageNotFound',
  components: {
    Navbar
  },
  setup() {
    const { t } = useI18n()
    const { isDark } = useTheme()

    return {
      t,
      isDark
    }
  }
}
</script>