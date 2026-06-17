<!--Navbar.vue-->
<template>
  <nav class="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
    :class="[
      isDark ? 'bg-slate-950 border-white/5' : 'bg-white border-slate-200',
      scrolled && 'shadow-sm'
    ]">
    <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

      <!-- Start side: Logo + Hamburger (grouped together) -->
      <div class="flex items-center gap-3">
        <!-- Hamburger — mobile only, grouped with logo -->
        <button @click="menuOpen = !menuOpen"
          class="md:hidden flex items-center justify-center w-9 h-9 rounded-lg transition-colors"
          :class="isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'"
          :aria-label="menuOpen ? t('navbar.closeMenu') : t('navbar.openMenu')">
          <svg v-if="!menuOpen" class="w-5 h-5" :class="isDark ? 'text-slate-400' : 'text-slate-600'" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5" :class="isDark ? 'text-slate-400' : 'text-slate-600'" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2.5 group">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L7 12L13 4" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <span class="font-display font-700 text-lg tracking-tight"
            :class="isDark ? 'text-white' : 'text-slate-900'">ContentForge</span>
        </RouterLink>
      </div>

      <!-- Desktop nav (center) -->
      <div class="hidden md:flex items-center gap-8">
        <div v-for="link in navLinks" :key="link.labelKey" class="contents">
          <RouterLink v-if="link.to" :to="link.to" class="text-sm transition-colors duration-200"
            :class="isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'">
            {{ t(link.labelKey) }}
          </RouterLink>
          <a v-else href="#" @click.prevent="handleNavClick(link)" class="text-sm transition-colors duration-200"
            :class="isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'">
            {{ t(link.labelKey) }}
          </a>
        </div>
      </div>

      <!-- End side: Lang, Theme, CTA -->
      <div class="flex items-center gap-2 sm:gap-3">

        <!-- Lang toggle — desktop only -->
        <button @click="switchLang" class="hidden md:flex items-center gap-1.5 text-sm transition-colors px-2 py-1 rounded-lg"
          :class="isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
          </svg>
          <span>{{ locale === 'en' ? 'عربي' : 'English' }}</span>
        </button>

        <!-- Theme toggle — desktop only -->
        <button @click="toggleTheme" class="hidden md:flex w-8 h-8 rounded-lg items-center justify-center transition-colors"
          :class="isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'"
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

        <!-- Desktop CTA -->
        <RouterLink to="/dashboard"
          class="hidden md:block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20">
          {{ t('navbar.getStarted') }}
        </RouterLink>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="menu">
      <div v-if="menuOpen" class="md:hidden border-t px-6 py-5 flex flex-col gap-4 shadow-xl"
        :class="isDark ? 'bg-slate-950 border-white/10 shadow-black/40' : 'bg-white border-slate-200 shadow-slate-200/60'">

        <!-- Mobile menu links -->
        <div v-for="link in navLinks" :key="link.labelKey" class="contents">
          <RouterLink v-if="link.to" :to="link.to" @click="menuOpen = false" class="text-sm transition-colors py-1"
            :class="isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'">
            {{ t(link.labelKey) }}
          </RouterLink>
          <a v-else href="#" @click.prevent="handleNavClick(link)" @click="menuOpen = false"
            class="text-sm transition-colors py-1"
            :class="isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'">
            {{ t(link.labelKey) }}
          </a>
        </div>

        <div class="h-px" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>

        <!-- Mobile toggle buttons -->
        <div class="flex flex-col gap-1">
          <!-- Lang toggle -->
          <button @click="switchLang"
            class="flex items-center justify-between w-full text-sm transition-colors px-3 py-2.5 rounded-lg"
            :class="isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'">
            <span class="flex items-center gap-2.5">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9" />
              </svg>
              {{ t('navbar.links.language') }}
            </span>
            <span class="text-xs font-medium px-2 py-0.5 rounded-md"
              :class="isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'">
              {{ locale === 'en' ? 'عربي' : 'English' }}
            </span>
          </button>

          <!-- Theme toggle -->
          <button @click="toggleTheme"
            class="flex items-center justify-between w-full text-sm transition-colors px-3 py-2.5 rounded-lg"
            :class="isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'"
            :title="isDark ? t('layout.switchLight') : t('layout.switchDark')">
            <span class="flex items-center gap-2.5">
              <svg v-if="isDark" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              {{ t('navbar.links.theme') }}
            </span>
            <span class="text-xs font-medium px-2 py-0.5 rounded-md"
              :class="isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'">
              {{ isDark ? t('layout.switchLight') : t('layout.switchDark') }}
            </span>
          </button>
        </div>

        <div class="h-px" :class="isDark ? 'bg-white/5' : 'bg-slate-100'"></div>

        <!-- Mobile CTA -->
        <RouterLink to="/dashboard" @click="menuOpen = false"
          class="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium text-center transition-all duration-200">
          {{ t('navbar.getStarted') }}
        </RouterLink>
      </div>
    </Transition>

  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLang } from '../composables/useLang.js'
import { useTheme } from '../composables/useTheme.js'

const { t } = useI18n()
const { locale, switchLang } = useLang()
const { isDark, toggle: toggleTheme } = useTheme()
const router = useRouter()
const route = useRoute()

const scrolled = ref(false)
const menuOpen = ref(false)

const navLinks = [
  { labelKey: 'navbar.links.features', href: '#features' },
  { labelKey: 'navbar.links.howItWorks', href: '#how-it-works' },
  { labelKey: 'navbar.links.competitors', href: '#competitors' },
  { labelKey: 'navbar.links.pricing', href: '#pricing' },
  { labelKey: 'navbar.links.contact', to: '/contact' },
]

function handleNavClick(link) {
  menuOpen.value = false

  if (route.path === '/') {
    const el = document.querySelector(link.href)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  } else {
    router.push({ path: '/', hash: link.href })
  }
}

function handleScroll() {
  scrolled.value = window.scrollY > 40
  if (menuOpen.value) menuOpen.value = false
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<style scoped>
.menu-enter-active,
.menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>