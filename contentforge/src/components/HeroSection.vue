<template>
  <section class="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-grid pt-24 pb-16 transition-colors duration-300"
    :class="isDark ? 'bg-forge-950' : 'bg-white'">

    <!-- Ambient orbs -->
    <div class="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-colors duration-300"
      :class="isDark ? 'bg-blue-600/8' : 'bg-blue-400/10'"></div>
    <div class="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-colors duration-300"
      :class="isDark ? 'bg-teal-500/6' : 'bg-teal-400/8'"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none transition-colors duration-300"
      :class="isDark ? 'bg-blue-900/10' : 'bg-blue-200/15'"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center w-full overflow-hidden">

      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs mb-8 animate-fade-up"
        :class="isDark
          ? 'border border-white/8 bg-white/3 text-slate-400'
          : 'border border-slate-200 bg-slate-50 text-slate-600 shadow-sm'">
        <span class="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse-slow"></span>
        {{ t('hero.badge') }}
      </div>

      <!-- Headline -->
      <h1 class="font-display text-3xl sm:text-5xl md:text-7xl font-800 leading-[1.1] tracking-tight mb-6 animate-fade-up animate-delay-100 break-words"
        :class="isDark ? 'text-white' : 'text-slate-900'">
        {{ t('hero.heading') }}<br />
        <span class="text-gradient-blue">{{ t('hero.headingAccent') }}</span><br />
        {{ t('hero.headingSuffix') }}
      </h1>

      <!-- Subheadline -->
      <p class="text-sm sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up animate-delay-200 px-2"
        :class="isDark ? 'text-slate-400' : 'text-slate-600'">
        {{ t('hero.subheading') }}
      </p>
      
      <!-- Trust bar -->
      <div class="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-8 animate-fade-up animate-delay-400">
        <span v-for="trust in trustItems" :key="trust.key"
          class="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm"
          :class="isDark ? 'text-slate-500' : 'text-slate-500'">
          <span class="text-teal-500 shrink-0">✦</span>
          {{ t(trust.key) }}
        </span>
      </div>

      <!-- Dashboard preview -->
      <div class="mt-12 md:mt-16 animate-fade-up animate-delay-500">
        <DashboardMockup />
      </div>

    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useTheme } from '../composables/useTheme.js'
import DashboardMockup from './DashboardMockup.vue'

const { t } = useI18n()
const { isDark } = useTheme()

const trustItems = [
  { key: 'hero.trust.dialectAI' },
  { key: 'hero.trust.ragMemory' },
  { key: 'hero.trust.calendar' },
  { key: 'hero.trust.dragDrop' },
  { key: 'hero.trust.directPublish' },
]
</script>