<template>
  <section id="features" class="py-24 relative overflow-hidden transition-colors duration-300"
    :class="isDark ? 'bg-forge-900' : 'bg-slate-50'">
    
    <!-- Background Effects -->
    <div class="absolute inset-0 bg-grid opacity-30 pointer-events-none"></div>
    <div class="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500/5 blur-3xl pointer-events-none"></div>
    
    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <!-- Section Header -->
      <div class="text-center mb-16">
        <span class="text-xs font-medium text-teal-500 dark:text-teal-400 uppercase tracking-widest mb-4 block">
          {{ t('features.eyebrow') }}
        </span>
        <h2 class="font-display text-4xl md:text-5xl font-700 mb-4"
          :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ t('features.heading') }}<br />
          <span class="text-gradient-arabic">{{ t('features.headingAccent') }}</span>
        </h2>
        <p class="max-w-xl mx-auto text-lg"
          :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          {{ t('features.subheading') }}
        </p>
      </div>

      <!-- Big Features Grid -->
      <div class="grid md:grid-cols-2 gap-5 mb-5">
        <div v-for="feat in bigFeatures" :key="feat.key"
          class="rounded-2xl transition-all duration-300 group p-5 md:p-7"
          :class="[
            isDark 
              ? 'border border-white/8 bg-forge-950 hover:border-white/15 ' + feat.glow
              : 'border border-slate-200 bg-white hover:border-slate-300 shadow-sm'
          ]">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center mb-4 md:mb-5 text-xl" :class="feat.iconBg">
            {{ feat.emoji }}
          </div>
          <h3 class="font-display text-lg md:text-xl font-600 mb-2 md:mb-3"
            :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t(`features.big.${feat.key}.title`) }}
          </h3>
          <p class="text-sm leading-relaxed mb-4 md:mb-5"
            :class="isDark ? 'text-slate-400' : 'text-slate-600'">
            {{ t(`features.big.${feat.key}.description`) }}
          </p>
          <div class="space-y-2">
            <div v-for="(_, i) in Array.from({ length: feat.pointCount })" :key="i"
              class="flex items-center gap-2 text-sm"
              :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              <div class="w-1.5 h-1.5 rounded-full shrink-0" :class="feat.dotColor"></div>
              {{ t(`features.big.${feat.key}.points.p${i + 1}`) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Small Features Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        <div v-for="feat in smallFeatures" :key="feat.key"
          class="rounded-2xl transition-all duration-300 p-4 md:p-6"
          :class="[
            isDark 
              ? 'border border-white/8 bg-forge-950 hover:border-white/15' 
              : 'border border-slate-200 bg-white hover:border-slate-300 shadow-sm'
          ]">
          <div class="w-9 h-9 rounded-xl flex items-center justify-center mb-3 md:mb-4 text-lg" :class="feat.iconBg">
            {{ feat.emoji }}
          </div>
          <h3 class="font-display text-sm md:text-base font-600 mb-2"
            :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t(`features.small.${feat.key}.title`) }}
          </h3>
          <p class="text-xs md:text-sm leading-relaxed"
            :class="isDark ? 'text-slate-500' : 'text-slate-600'">
            {{ t(`features.small.${feat.key}.description`) }}
          </p>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'
 
const { t } = useI18n()
const { isDark } = useTheme()

const bigFeatures = [
  {
    key: 'arabicIntelligence',
    emoji: '🌍',
    pointCount: 4,
    iconBg: 'bg-blue-500/15 text-blue-500 dark:text-blue-300',
    dotColor: 'bg-blue-500 dark:bg-blue-400',
    glow: 'card-glow', // Ensure you have a .card-glow class in your global CSS if desired
  },
  {
    key: 'ragBrandVoice',
    emoji: '🧠',
    pointCount: 4,
    iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-300',
    dotColor: 'bg-purple-500 dark:bg-purple-400',
    glow: '',
  },
]
 
const smallFeatures = [
  { key: 'calendar',    emoji: '🗓️', iconBg: 'bg-teal-500/15 text-teal-600 dark:text-teal-300' },
  { key: 'imageGen',    emoji: '🎨', iconBg: 'bg-rose-500/15 text-rose-500 dark:text-rose-300' },
  { key: 'abCritic',    emoji: '⚡', iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-300' },
  { key: 'publishing',  emoji: '📤', iconBg: 'bg-green-500/15 text-green-600 dark:text-green-300' },
  { key: 'dashboard',   emoji: '💾', iconBg: 'bg-blue-500/15 text-blue-500 dark:text-blue-300' },
  { key: 'workflow',    emoji: '🚀', iconBg: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300' },
]
</script>