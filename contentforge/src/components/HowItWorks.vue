<!-- HowItWorks.vue -->
<template>
  <section id="how-it-works" class="py-24 relative overflow-hidden transition-colors duration-300"
    :class="isDark ? 'bg-forge-950' : 'bg-white'">

    <div class="absolute inset-0 bg-grid opacity-50"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-6">

      <!-- Section header -->
      <div class="text-center mb-16">
        <span class="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4 block">
          {{ t('howItWorks.eyebrow') }}
        </span>
        <h2 class="font-display text-4xl md:text-5xl font-700 mb-4" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ t('howItWorks.heading') }}<br />
          <span class="text-gradient-blue">{{ t('howItWorks.headingAccent') }}</span>
        </h2>
        <p class="max-w-xl mx-auto" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          {{ t('howItWorks.subheading') }}
        </p>
      </div>

      <!-- Step connector line — desktop only -->
      <div class="hidden md:block absolute left-1/2 top-[380px] bottom-24 w-px -translate-x-1/2 z-0" :class="isDark
        ? 'bg-gradient-to-b from-blue-500/30 via-teal-500/20 to-transparent'
        : 'bg-gradient-to-b from-blue-500/20 via-teal-500/20 to-transparent'"></div>

      <!-- Steps -->
      <div class="space-y-8 md:space-y-6">
        <div v-for="(step, i) in steps" :key="step.number"
          class="relative flex flex-col md:flex-row items-center gap-6 md:gap-8"
          :class="i % 2 === 1 ? 'md:flex-row-reverse' : ''">

          <!-- Step content -->
          <div class="flex-1 max-w-md w-full">
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold font-display shrink-0"
                :class="[
                  step.numberClass,
                  isDark ? 'bg-opacity-10' : 'bg-opacity-5'
                ]">
                {{ step.number }}
              </div>
              <span class="text-xs text-slate-500 uppercase tracking-wider">
                {{ t('howItWorks.visual.stepLabel') }} {{ step.number }}
              </span>
            </div>
            <h3 class="font-display text-xl md:text-2xl font-600 mb-3"
              :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t(`howItWorks.steps.${step.key}.title`) }}
            </h3>
            <p class="leading-relaxed mb-4 text-sm md:text-base" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t(`howItWorks.steps.${step.key}.description`) }}
            </p>
            <ul class="space-y-2">
              <li v-for="n in 3" :key="n" class="flex items-start gap-2 text-sm"
                :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                <svg class="w-4 h-4 text-teal-500 dark:text-teal-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                {{ t(`howItWorks.steps.${step.key}.b${n}`) }}
              </li>
            </ul>
          </div>

          <!-- Step visual card -->
          <div class="flex-1 max-w-md w-full">
            <div class="rounded-2xl p-4 md:p-5 transition-all duration-300" :class="isDark
              ? 'border border-white/8 bg-forge-900 ' + step.cardGlow
              : 'border border-slate-200 bg-slate-50 shadow-sm'">
              <component :is="step.visual" :is-dark="isDark" />
            </div>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { defineComponent, h } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'

const { t } = useI18n()
const { isDark } = useTheme()

const UploadVisual = defineComponent({
  props: { isDark: Boolean },
  setup(props) { return { t: useI18n().t, isDark: props.isDark } },
  render() {
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs font-medium mb-3 ' + (this.isDark ? 'text-slate-500' : 'text-slate-600') }, this.t('howItWorks.visual.brandVaultSetup')),
      h('div', { class: 'flex gap-2 flex-wrap' }, [
        // UPDATED: Replaced hardcoded '📄 Brand Guidelines.pdf'
        h('div', { class: 'px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 ' + (this.isDark ? 'bg-blue-600/15 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700') }, ['📄 ', this.t('howItWorks.visual.brandGuidelinesPdf')]),
        
        // UPDATED: Replaced fragile .includes('Brand') fallback with direct translation key
        h('div', { class: 'px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 ' + (this.isDark ? 'bg-teal-600/15 border-teal-500/20 text-teal-400' : 'bg-teal-50 border-teal-200 text-teal-700') }, ['🖼️ ', this.t('howItWorks.visual.top10Posts')]),
        
        // UPDATED: Replaced fragile .includes('Brand') fallback with direct translation key
        h('div', { class: 'px-3 py-1.5 rounded-lg border text-xs flex items-center gap-1.5 ' + (this.isDark ? 'bg-purple-600/15 border-purple-500/20 text-purple-400' : 'bg-purple-50 border-purple-200 text-purple-700') }, ['🎨 ', this.t('howItWorks.visual.brandColors')]),
      ]),
      h('div', { class: 'mt-4 p-3 rounded-lg border ' + (this.isDark ? 'bg-forge-950/60 border-white/5' : 'bg-white border-slate-200') }, [
        h('p', { class: 'text-xs mb-1 ' + (this.isDark ? 'text-slate-500' : 'text-slate-400') }, this.t('howItWorks.visual.dialectPreference')),
        h('div', { class: 'flex gap-2' }, [
          h('span', { class: 'px-2 py-1 rounded-md text-xs ' + (this.isDark ? 'bg-blue-600/20 text-blue-300' : 'bg-blue-100 text-blue-700 font-medium') }, this.t('howItWorks.visual.egyptian')),
          h('span', { class: 'px-2 py-1 rounded-md text-xs ' + (this.isDark ? 'bg-forge-800 text-slate-500' : 'bg-slate-100 text-slate-400') }, this.t('howItWorks.visual.gulf')),
          h('span', { class: 'px-2 py-1 rounded-md text-xs ' + (this.isDark ? 'bg-forge-800 text-slate-500' : 'bg-slate-100 text-slate-400') }, this.t('howItWorks.visual.levantine')),
        ]),
      ]),
    ])
  }
})

const BriefVisual = defineComponent({
  props: { isDark: Boolean },
  setup(props) { return { t: useI18n().t, isDark: props.isDark } },
  render() {
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs mb-3 ' + (this.isDark ? 'text-slate-500' : 'text-slate-600') }, this.t('howItWorks.visual.campaignBrief')),
      h('div', { class: 'p-3 rounded-lg border ' + (this.isDark ? 'bg-forge-950/60 border-white/5' : 'bg-white border-slate-200') }, [
        h('p', { class: 'text-xs italic ' + (this.isDark ? 'text-slate-400' : 'text-slate-600') }, this.t('howItWorks.visual.briefQuote')),
      ]),
      h('div', { class: 'flex items-center gap-2 text-xs rounded-lg px-3 py-2 border ' + (this.isDark ? 'text-amber-400 bg-amber-500/10 border-amber-500/15' : 'text-amber-800 bg-amber-50 border-amber-200 font-medium') }, [
        h('span', {}, '✦'),
        h('span', {}, this.t('howItWorks.visual.trendDetected')),
      ]),
    ])
  }
})

const CalendarVisual = defineComponent({
  props: { isDark: Boolean },
  setup(props) { return { t: useI18n().t, isDark: props.isDark } },
  render() {
    const days = ['mon', 'tue', 'wed', 'thu'].map(d => this.t(`howItWorks.visual.${d}`))
    const row1Keys = ['igStory', 'fbPost', 'rest', 'liArticle']
    const row1Labels = ['suhoor', 'iftar', null, 'brandStoryLabel']
    const row2Keys = ['twThread', 'igReel', 'fbCover', 'rest']

    return h('div', { class: 'space-y-2' }, [
      h('p', { class: 'text-xs mb-3 ' + (this.isDark ? 'text-slate-500' : 'text-slate-600') }, this.t('howItWorks.visual.generatedCalendar')),
      h('div', { class: 'grid grid-cols-4 gap-1.5' }, [
        ...days.map(d => h('div', { class: 'text-center text-[10px] pb-1 ' + (this.isDark ? 'text-slate-600' : 'text-slate-400') }, d)),
        ...row1Keys.map((key, i) => {
          const isRest = key === 'rest'
          const colorClass = isRest
            ? (this.isDark ? 'border-white/5 bg-transparent text-slate-600' : 'border-slate-200 bg-transparent text-slate-400') + ' items-center justify-center'
            : i === 0 ? (this.isDark ? 'border-pink-500/25 bg-pink-500/5 text-pink-400' : 'border-pink-200 bg-pink-50 text-pink-700')
              : i === 1 ? (this.isDark ? 'border-blue-500/25 bg-blue-500/5 text-blue-400' : 'border-blue-200 bg-blue-50 text-blue-700')
                : (this.isDark ? 'border-blue-600/25 bg-blue-600/5 text-blue-300' : 'border-indigo-200 bg-indigo-50 text-indigo-700')
          return h('div', { class: `rounded-lg p-1.5 text-[9px] min-h-[48px] flex flex-col gap-0.5 border ${colorClass}` }, [
            h('span', { class: 'font-medium' }, isRest ? '—' : this.t(`howItWorks.visual.${key}`)),
            !isRest && row1Labels[i] && h('span', { class: 'leading-tight ' + (this.isDark ? 'text-slate-500' : 'text-slate-500') }, this.t(`howItWorks.visual.${row1Labels[i]}`)),
          ])
        }),
        ...row2Keys.map((key, i) => {
          const isRest = key === 'rest'
          const cardStyle = isRest
            ? (this.isDark ? 'border-white/5 bg-transparent text-slate-600' : 'border-slate-200 bg-transparent text-slate-400') + ' items-center justify-center'
            : (this.isDark ? 'border-teal-500/25 bg-teal-500/5 text-teal-400' : 'border-teal-200 bg-teal-50 text-teal-700')
          return h('div', { class: `rounded-lg p-1.5 text-[9px] min-h-[48px] flex flex-col gap-0.5 border ${cardStyle}` }, [
            h('span', { class: 'font-medium' }, isRest ? '—' : this.t(`howItWorks.visual.${key}`)),
            !isRest && h('span', { class: 'leading-tight ' + (this.isDark ? 'text-slate-500' : 'text-slate-500') }, this.t('howItWorks.visual.arabicContent')),
          ])
        }),
      ]),
    ])
  }
})

const ApproveVisual = defineComponent({
  props: { isDark: Boolean },
  setup(props) { return { t: useI18n().t, isDark: props.isDark } },
  render() {
    const posts = [
      { titleKey: 'suhoorPost', metaKey: 'igEgy', statusKey: 'approved', statusClass: this.isDark ? 'bg-green-500/15 text-green-400' : 'bg-green-100 text-green-800' },
      { titleKey: 'iftarPromo', metaKey: 'fbBilingual', statusKey: 'pending', statusClass: this.isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-800' },
      { titleKey: 'brandStory', metaKey: 'liEnglish', statusKey: 'draft', statusClass: this.isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-200 text-slate-600' },
    ]
    return h('div', { class: 'space-y-3' }, [
      h('p', { class: 'text-xs mb-3 ' + (this.isDark ? 'text-slate-500' : 'text-slate-600') }, this.t('howItWorks.visual.reviewApprove')),
      h('div', { class: 'space-y-2' }, posts.map(p =>
        h('div', { class: 'flex items-center justify-between p-2.5 rounded-lg border ' + (this.isDark ? 'bg-forge-950/40 border-white/5' : 'bg-white border-slate-200') }, [
          h('div', {}, [
            h('p', { class: 'text-xs ' + (this.isDark ? 'text-slate-300' : 'text-slate-800') }, this.t(`howItWorks.visual.${p.titleKey}`)),
            h('p', { class: 'text-[10px] ' + (this.isDark ? 'text-slate-500' : 'text-slate-400') }, this.t(`howItWorks.visual.${p.metaKey}`)),
          ]),
          h('span', { class: `text-[9px] px-2 py-1 rounded-full font-medium ${p.statusClass}` }, this.t(`howItWorks.visual.${p.statusKey}`)),
        ])
      )),
      h('button', { class: 'w-full mt-3 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-colors' }, this.t('howItWorks.visual.approveAll')),
    ])
  }
})

const steps = [
  { key: 's01', number: '01', numberClass: 'border-blue-500/40 text-blue-500 dark:text-blue-400 bg-blue-500', cardGlow: 'card-glow', visual: UploadVisual },
  { key: 's02', number: '02', numberClass: 'border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500', cardGlow: 'card-glow-warm', visual: BriefVisual },
  { key: 's03', number: '03', numberClass: 'border-teal-500/40 text-teal-600 dark:text-teal-400 bg-teal-500', cardGlow: '', visual: CalendarVisual },
  { key: 's04', number: '04', numberClass: 'border-green-500/40 text-green-600 dark:text-green-400 bg-green-500', cardGlow: '', visual: ApproveVisual },
]
</script>