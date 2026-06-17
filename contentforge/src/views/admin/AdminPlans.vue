<template>
  <div class="flex flex-col gap-6">

    <!-- Trial Users Table -->
    <div class="rounded-2xl border overflow-hidden"
      :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'">
      <!-- Panel Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b"
        :class="isDark ? 'border-white/5' : 'border-slate-200'">
        <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ t('admin.plans.trialUsers') }}
        </h2>

        <!-- Tabs -->
        <div class="flex gap-1">
          <button class="text-xs px-3 py-1.5 rounded-lg transition-colors" :class="[
            tab === 'active'
              ? (isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-700 font-medium')
              : (isDark ? 'text-slate-400 hover:text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
          ]" @click="tab = 'active'">
            {{ t('admin.plans.active') }}
          </button>
          <button class="text-xs px-3 py-1.5 rounded-lg transition-colors" :class="[
            tab === 'expired'
              ? (isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-200 text-blue-700 font-medium')
              : (isDark ? 'text-slate-400 hover:text-slate-300 hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')
          ]" @click="tab = 'expired'">
            {{ t('admin.plans.expired') }}
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-[13px]">
          <thead>
            <tr>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4"
                :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('admin.plans.table.user') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4"
                :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('admin.plans.table.trialEnds') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4"
                :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('admin.plans.table.daysLeft') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4"
                :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('admin.plans.table.status') }}
              </th>
              <th class="text-start text-[11px] font-medium uppercase tracking-wider py-3 px-4"
                :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('admin.plans.table.action') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- Loading State -->
            <tr v-if="loading">
              <td colspan="5" class="text-center py-10" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('common.loading') }}
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-else-if="!filteredTrialUsers.length">
              <td colspan="5" class="text-center py-10" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                {{ t('admin.plans.noUsers', {
                  tab: tab === 'active' ? t('admin.plans.active') : t('admin.plans.expired')
                }) }}
              </td>
            </tr>

            <!-- User Rows -->
            <tr v-else v-for="u in filteredTrialUsers" :key="u._id">
              <!-- User Column -->
              <td class="py-3 px-4 border-t"
                :class="isDark ? 'border-white/5 text-white' : 'border-slate-200 text-slate-900'">
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-[30px] h-[30px] rounded-full shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                    {{ u.name?.[0]?.toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-[13px] font-medium m-0" :class="isDark ? 'text-white' : 'text-slate-900'">{{ u.name
                      }}</p>
                    <p class="text-[11px] m-0" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ u.email }}</p>
                  </div>
                </div>
              </td>

              <!-- Trial Ends Column -->
              <td class="py-3 px-4 border-t text-[12px]"
                :class="isDark ? 'border-white/5 text-slate-400' : 'border-slate-200 text-slate-600'">
                {{ formatDate(u.planEndsAt) }}
              </td>

              <!-- Days Left Column -->
              <td class="py-3 px-4 border-t text-[12px] font-medium"
                :class="isDark ? 'border-white/5' : 'border-slate-200'">
                <span :class="daysClass(u)">{{ daysLeft(u) }}</span>
              </td>

              <!-- Status Column -->
              <td class="py-3 px-4 border-t"
                :class="isDark ? 'border-white/5 text-white' : 'border-slate-200 text-slate-900'">
                <span class="text-[11px] px-2 py-0.5 rounded-full font-medium" :class="isExpired(u)
                  ? (isDark ? 'bg-rose-500/15 text-rose-400' : 'bg-rose-100 text-rose-700')
                  : (isDark ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700')">
                  {{ isExpired(u) ? t('admin.plans.status.expired') : t('admin.plans.status.active') }}
                </span>
              </td>

              <!-- Action Column -->
              <td class="py-3 px-4 border-t"
                :class="isDark ? 'border-white/5 text-white' : 'border-slate-200 text-slate-900'">
                <button class="text-[11px] px-2.5 py-1 rounded-md border font-medium transition-colors" :class="isDark
                  ? 'border-teal-500/20 text-teal-400 hover:bg-teal-500/10'
                  : 'border-teal-200 text-teal-700 hover:bg-teal-50'" @click="extendTrial(u)">
                  {{ t('admin.plans.extend7Days') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../../composables/useTheme.js'
import adminApi from '../../api/adminApi'

const { t } = useI18n()
const { isDark } = useTheme()

const loading = ref(true)
const counts = ref({})
const trialUsers = ref([])
const tab = ref('active')

const countCards = computed(() => [
  { label: t('admin.plans.counts.freeUsers'), value: counts.value.free ?? '—', color: 'gray' },
  { label: t('admin.plans.counts.activeTrials'), value: counts.value.trial ?? '—', color: 'amber' },
  { label: t('admin.plans.counts.proUsers'), value: counts.value.pro ?? '—', color: 'blue' },
  { label: t('admin.plans.counts.enterprise'), value: counts.value.enterprise ?? '—', color: 'purple' },
  { label: t('admin.plans.counts.expiredTrials'), value: counts.value.expiredTrials ?? '—', color: 'red' },
])

const filteredTrialUsers = computed(() =>
  trialUsers.value
    .filter(u => !u.isBlocked && !u.deletionRequest?.isDeleted)
    .filter(u => tab.value === 'expired' ? isExpired(u) : !isExpired(u))
)

function isExpired(u) {
  return new Date(u.planEndsAt) < new Date()
}

function daysLeft(u) {
  const d = Math.ceil((new Date(u.planEndsAt) - Date.now()) / 86400000)
  return isExpired(u)
    ? t('admin.plans.daysAgo', { days: Math.abs(d) })
    : t('admin.plans.daysLeft', { days: d })
}

function daysClass(u) {
  if (isExpired(u)) return isDark.value ? 'text-rose-400' : 'text-rose-600'
  const d = Math.ceil((new Date(u.planEndsAt) - Date.now()) / 86400000)
  return d <= 3
    ? (isDark.value ? 'text-amber-400' : 'text-amber-600')
    : (isDark.value ? 'text-emerald-400' : 'text-emerald-600')
}

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'
}

async function extendTrial(u) {
  const newEnd = new Date(Math.max(new Date(u.planEndsAt), Date.now()))
  newEnd.setDate(newEnd.getDate() + 7)
  await adminApi.updateUser(u._id, { planEndsAt: newEnd, isTrial: true })
  u.planEndsAt = newEnd.toISOString()
}

onMounted(async () => {
  try {
    const res = await adminApi.getPlans()
    counts.value = res.counts || {}
    trialUsers.value = res.trialUsersList || []
    console.log('trialUsers:', trialUsers.value)
  } finally {
    loading.value = false
  }
})
</script>