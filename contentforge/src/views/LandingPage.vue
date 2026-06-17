<template>
  <div class="min-h-screen transition-colors duration-300" :class="isDark ? 'bg-forge-950' : 'bg-slate-50'">
    <Navbar />
    <HeroSection />
    <HowItWorks />
    <FeaturesSection />
    <CompetitorTable />
    <PricingSection />

    <!-- CTA Banner -->
    <section id="get-started" class="py-24 relative overflow-hidden transition-colors duration-300"
      :class="isDark ? 'bg-forge-950' : 'bg-slate-50'">
      <div class="absolute inset-0 bg-grid opacity-40"></div>
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] rounded-full blur-3xl pointer-events-none"
        :class="isDark ? 'bg-blue-600/10' : 'bg-blue-400/15'">
      </div>
      <div class="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <h2 class="font-display text-4xl md:text-5xl font-700 mb-5" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ t('landing.cta.title') }}<br />
          <span class="text-gradient-blue">{{ t('landing.cta.titleAccent') }}</span>
        </h2>
        <p class="text-lg mb-10 max-w-xl mx-auto" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          {{ t('landing.cta.subtitle') }}
        </p>
        <p class="text-sm mt-6" :class="isDark ? 'text-slate-600' : 'text-slate-400'">
          {{ t('landing.cta.fine') }}
        </p>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../composables/useTheme.js'
import Navbar from '../components/Navbar.vue'
import HeroSection from '../components/HeroSection.vue'
import HowItWorks from '../components/HowItWorks.vue'
import FeaturesSection from '../components/FeaturesSection.vue'
import CompetitorTable from '../components/CompetitorTable.vue'
import PricingSection from '../components/PricingSection.vue'
import Footer from '../components/Footer.vue'

const { t } = useI18n()
const { isDark } = useTheme()
</script>