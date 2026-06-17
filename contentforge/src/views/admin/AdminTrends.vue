<template>
  <div class="flex flex-col gap-6">
    <div 
      class="rounded-2xl border p-6"
      :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-5">
        <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ t('admin.trendsPage.topArabicTrends') }}
        </h2>
        <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          {{ trends.length }} {{ t('admin.trendsPage.topics') }}
        </span>
      </div>

      <!-- Loading State -->
      <div 
        v-if="loading" 
        class="text-center py-8 text-sm" 
        :class="isDark ? 'text-slate-400' : 'text-slate-600'"
      >
        {{ t('common.loading') }}
      </div>

      <!-- Trends List -->
      <div v-else class="overflow-x-auto">
        <!-- min-w ensures the grid doesn't break on very small mobile screens -->
        <div class="min-w-[500px] flex flex-col">
          <div 
            v-for="(trend, i) in trends" 
            :key="trend._id" 
            class="grid grid-cols-[32px_1fr_140px_40px_24px] items-center gap-3.5 py-3 border-b last:border-b-0"
            :class="isDark ? 'border-white/5' : 'border-slate-100'"
          >
            <!-- Rank -->
            <span class="text-xs font-bold" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              #{{ i + 1 }}
            </span>

            <!-- Info (Topic & Category) -->
            <div class="flex flex-col gap-0.5 min-w-0">
              <!-- dir="rtl" ensures Arabic hashtags always read correctly, even in English mode -->
              <span class="text-sm font-medium truncate" dir="rtl" :class="isDark ? 'text-white' : 'text-slate-900'">
                {{ trend.tag }}
              </span>
              <span class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ trend.category }}
              </span>
            </div>

            <!-- Velocity Bar -->
            <div class="h-1.5 rounded-full overflow-hidden" :class="isDark ? 'bg-white/5' : 'bg-slate-200'">
              <div 
                class="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-500" 
                :style="{ width: trend.velocity + '%' }"
              ></div>
            </div>

            <!-- Score (text-end automatically flips for RTL/LTR) -->
            <span class="text-xs text-end" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ trend.velocity }}
            </span>

            <!-- Change Icon -->
            <span 
              class="text-[13px] font-bold text-center"
              :class="{
                'text-emerald-400': trend.change === 'up',
                'text-rose-400': trend.change === 'down',
                'text-slate-400': trend.change === 'same' || !trend.change
              }"
            >
              {{ trend.change === 'up' ? '↑' : trend.change === 'down' ? '↓' : '→' }}
            </span>
          </div>

          <!-- Empty State -->
          <div 
            v-if="!trends.length" 
            class="text-center py-8 text-sm" 
            :class="isDark ? 'text-slate-400' : 'text-slate-600'"
          >
            {{ t('admin.trendsPage.noTrends') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../../composables/useTheme.js'
import adminApi from '../../api/adminApi'

const { t } = useI18n()
const { isDark } = useTheme()

const trends = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const r = await adminApi.getTrends()
    trends.value = r.trends || []
  } finally {
    loading.value = false
  }
})
</script>