<template>
  <div
    class="min-h-screen flex flex-col transition-colors duration-300"
    :class="isDark ? 'bg-forge-950' : 'bg-slate-50'"
  >
    <!-- Navbar -->
    <Navbar />

    <!-- Background glow -->
    <div
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-20"
      :class="reason === 'blocked'
        ? (isDark ? 'bg-rose-600/30' : 'bg-rose-400/20')
        : (isDark ? 'bg-amber-600/30' : 'bg-amber-400/20')"
    />

    <!-- Content -->
    <div class="flex-1 flex flex-col items-center justify-center px-6 py-24">

      <!-- Card -->
      <div
        class="relative z-10 w-full max-w-md rounded-2xl p-8 text-center flex flex-col items-center gap-5 transition-colors duration-300"
        :class="isDark
          ? 'bg-forge-900 border border-forge-700'
          : 'bg-white border border-slate-200 shadow-lg'"
      >

        <!-- BLOCKED -->
        <template v-if="reason === 'blocked'">
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
            :class="isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-50 text-rose-600'"
          >
            <i class="ti ti-lock"></i>
          </div>
          <div>
            <h1
              class="font-display text-2xl font-bold mb-2"
              :class="isDark ? 'text-white' : 'text-slate-900'"
            >
              {{ t('suspended.blocked.title') }}
            </h1>
            <p
              class="text-sm leading-relaxed"
              :class="isDark ? 'text-slate-400' : 'text-slate-500'"
            >
              {{ t('suspended.blocked.subtitle') }}
            </p>
          </div>
          <router-link to="/contact"
            class="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-85 bg-rose-500"
          >
            <i class="ti ti-mail"></i>
            {{ t('suspended.blocked.cta') }}
          </router-link>
        </template>

      </div>

      <!-- Logout -->
      <button
        @click="logout"
        class="mt-6 flex items-center gap-2 text-sm transition-colors duration-200"
        :class="isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-400 hover:text-slate-600'"
      >
        <i class="ti ti-logout"></i>
        {{ t('suspended.logout') }}
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '@/composables/useTheme.js'
import { useAuthStore } from '@/stores/authStore'
import Navbar from '@/components/Navbar.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { isDark } = useTheme()
const authStore = useAuthStore()

const reason = computed(() => route.query.reason || '')

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>
