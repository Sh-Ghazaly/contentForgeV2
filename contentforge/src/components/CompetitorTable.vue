<template>
  <section id="competitors" class="py-24 relative overflow-hidden transition-colors duration-300"
    :class="isDark ? 'bg-forge-950' : 'bg-white'">
    <div class="absolute inset-0 bg-grid opacity-40"></div>
    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <!-- Header -->
      <div class="text-center mb-16">
        <span class="text-xs font-medium text-rose-400 uppercase tracking-widest mb-4 block">
          {{ t('competitors.eyebrow') }}
        </span>
        <h2 class="font-display text-4xl md:text-5xl font-700 mb-4"
          :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ t('competitors.heading1') }}<br/>
          <span class="text-gradient-warm">{{ t('competitors.heading2') }}</span>
        </h2>
        <p class="max-w-xl mx-auto"
          :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          {{ t('competitors.subheading') }}
        </p>
      </div>

      <!-- Scroll hint — mobile only -->
      <p class="text-[11px] text-center mb-3 md:hidden flex items-center justify-center gap-1"
        :class="isDark ? 'text-slate-600' : 'text-slate-400'">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
        {{ t('competitors.scrollHint') }}
      </p>

      <!-- Scrollable wrapper -->
      <div class="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
        <div class="min-w-[640px] md:min-w-0 rounded-2xl overflow-hidden transition-colors duration-300"
          :class="isDark
            ? 'border border-white/8 bg-forge-900 card-glow'
            : 'border border-slate-200 bg-slate-50 shadow-sm'">

          <!-- Table header -->
          <div class="grid grid-cols-5"
            :class="isDark ? 'border-b border-white/5' : 'border-b border-slate-200'">
            <div class="p-4 md:p-5 col-span-1">
              <p class="text-xs font-medium uppercase tracking-wider"
                :class="isDark ? 'text-slate-500' : 'text-slate-400'">
                {{ t('competitors.featureCol') }}
              </p>
            </div>
            <div v-for="tool in tools" :key="tool.nameKey"
              class="p-4 md:p-5 text-center"
              :class="[
                isDark ? 'border-l border-white/5' : 'border-l border-slate-200',
                tool.highlight ? (isDark ? 'bg-blue-600/8' : 'bg-blue-50') : ''
              ]">
              <div class="flex flex-col items-center gap-1">
                <span v-if="tool.highlight"
                  class="text-[10px] px-2 py-0.5 rounded-full font-medium mb-1"
                  :class="isDark ? 'bg-blue-600/25 text-blue-400' : 'bg-blue-100 text-blue-600'">
                  {{ t('competitors.yourChoice') }}
                </span>
                <p class="font-display font-600 text-xs md:text-sm"
                  :class="tool.highlight
                    ? (isDark ? 'text-white' : 'text-slate-900')
                    : (isDark ? 'text-slate-400' : 'text-slate-500')">
                  {{ t(tool.nameKey) }}
                </p>
                <p class="text-[10px]"
                  :class="isDark ? 'text-slate-600' : 'text-slate-400'">
                  {{ t(tool.typeKey) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Table rows -->
          <div v-for="(row, i) in tableRows" :key="row.featureKey"
            class="grid grid-cols-5 last:border-0 transition-colors"
            :class="[
              isDark ? 'border-b border-white/5' : 'border-b border-slate-200',
              i % 2 === 0
                ? (isDark ? 'bg-forge-950/30' : 'bg-white')
                : (isDark ? '' : 'bg-slate-50/60')
            ]">
            <div class="p-3 md:p-4 flex items-center">
              <p class="text-xs md:text-sm leading-snug"
                :class="isDark ? 'text-slate-300' : 'text-slate-700'">
                {{ t(row.featureKey) }}
              </p>
            </div>
            <div v-for="(cell, ci) in row.cells" :key="ci"
              class="p-3 md:p-4 flex items-center justify-center"
              :class="[
                isDark ? 'border-l border-white/5' : 'border-l border-slate-200',
                ci === 0 ? (isDark ? 'bg-blue-600/5' : 'bg-blue-50/50') : ''
              ]">
              <span v-if="cell === true"           class="text-teal-500 text-base font-bold">✓</span>
              <span v-else-if="cell === false"     class="text-base"
                :class="isDark ? 'text-slate-700' : 'text-slate-300'">✗</span>
              <span v-else-if="cell === 'partial'" class="text-amber-500 text-base">◑</span>
              <span v-else class="text-[11px] md:text-xs text-center leading-tight"
                :class="isDark ? 'text-slate-400' : 'text-slate-500'">
                {{ t(cell) }}
              </span>
            </div>
          </div>

        </div>
      </div>

      <!-- Key differentiators -->
      <div class="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-8">
        <div v-for="diff in differentiators" :key="diff.titleKey"
          class="p-5 rounded-xl flex gap-4 transition-colors duration-300"
          :class="isDark
            ? 'border border-white/8 bg-forge-900'
            : 'border border-slate-200 bg-slate-50'">
          <div class="text-2xl shrink-0">{{ diff.emoji }}</div>
          <div>
            <h4 class="font-display font-600 text-sm mb-1"
              :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t(diff.titleKey) }}
            </h4>
            <p class="text-xs leading-relaxed"
              :class="isDark ? 'text-slate-500' : 'text-slate-500'">
              {{ t(diff.descKey) }}
            </p>
          </div>
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

const tools = [
  { nameKey: 'competitors.tools.contentforge.name', typeKey: 'competitors.tools.contentforge.type', highlight: true },
  { nameKey: 'competitors.tools.postflex.name',     typeKey: 'competitors.tools.postflex.type',     highlight: false },
  { nameKey: 'competitors.tools.arwriter.name',     typeKey: 'competitors.tools.arwriter.type',     highlight: false },
  { nameKey: 'competitors.tools.jasper.name',       typeKey: 'competitors.tools.jasper.type',       highlight: false },
]

const tableRows = [
  { featureKey: 'competitors.rows.dialect',    cells: ['competitors.cells.dialects', 'partial', true, false] },
  { featureKey: 'competitors.rows.calendar',   cells: [true, false, false, 'partial'] },
  { featureKey: 'competitors.rows.rag',        cells: [true, false, false, 'partial'] },
  { featureKey: 'competitors.rows.trends',     cells: [true, false, false, false] },
  { featureKey: 'competitors.rows.dragdrop',   cells: [true, false, false, false] },
  { featureKey: 'competitors.rows.abcritic',   cells: [true, false, false, false] },
  { featureKey: 'competitors.rows.imagegen',   cells: [true, true, false, true] },
  { featureKey: 'competitors.rows.dashboard',  cells: [true, 'partial', true, true] },
  { featureKey: 'competitors.rows.publishing', cells: [true, false, true, true] },
  { featureKey: 'competitors.rows.affordable', cells: [true, true, true, false] },
]

const differentiators = [
  { emoji: '🇪🇬', titleKey: 'competitors.diff.jasper.title',   descKey: 'competitors.diff.jasper.desc' },
  { emoji: '📝',  titleKey: 'competitors.diff.arwriter.title', descKey: 'competitors.diff.arwriter.desc' },
  { emoji: '📅',  titleKey: 'competitors.diff.postflex.title', descKey: 'competitors.diff.postflex.desc' },
]
</script>