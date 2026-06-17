<template>
  <footer class="transition-colors duration-300 py-12 md:py-16">

    <div class="max-w-6xl mx-auto px-6">

      <!-- Bottom row -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 text-center md:text-start"
        :class="isDark ? 'border-t border-white/5' : 'border-t border-slate-200'">
        
        <div class="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <p class="text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
            {{ t('footer.copyright') }}
          </p>
          <span class="hidden md:inline text-xs" :class="isDark ? 'text-slate-700' : 'text-slate-300'">|</span>
          <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-slate-500'">
            {{ t('footer.builtWith') }}
          </span>
        </div>

        <!-- Back to Top Button -->
        <RouterLink to="/" 
          class="text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          :class="isDark 
            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' 
            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 hover:text-slate-900'">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          {{ t('footer.backToTop') }}
        </RouterLink>

      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'

const { t } = useI18n()
const { isDark } = useTheme()

const footerLinks = [
  {
    titleKey: 'footer.support.title',
    links: [
      { key: 'footer.support.contact', to: '/contact' }
    ],
  },
]
</script>