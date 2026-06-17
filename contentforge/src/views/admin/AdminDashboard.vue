<template>
  <div class="flex flex-col gap-6">

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="s in statCards" :key="s.label"
        class="relative group flex gap-4 items-start rounded-2xl border p-5 transition-all hover:shadow-lg" :class="isDark
          ? 'bg-slate-800 border-white/5 hover:border-white/10'
          : 'bg-white border-slate-200 hover:border-slate-300'">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :style="{ background: s.iconBg }">
          <span v-html="s.icon" :class="isDark ? 'text-slate-300' : 'text-slate-600'"></span>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs mb-1" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ s.label }}</p>
          <p class="text-2xl font-bold leading-none mb-1" :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ loading ? '—' : s.value }}
          </p>
          <p v-if="s.sub" class="text-[11px]" :class="subColorClass(s.subColor)">{{ s.sub }}</p>
        </div>

        <!-- Details Tooltip -->
        <div v-if="s.hasDetails && !loading && s.details"
          class="absolute z-50 top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 p-3 rounded-lg shadow-xl border invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200"
          :class="isDark
            ? 'bg-slate-950 text-slate-200 border-slate-800'
            : 'bg-white text-slate-700 border-slate-200'">
          <div class="flex flex-col gap-2 min-w-[170px]">
            <div class="flex justify-between items-center pb-1.5 mb-0.5 border-b"
              :class="isDark ? 'border-slate-800/60' : 'border-slate-200'">
              <span class="text-blue-400 font-medium flex items-center gap-1.5 text-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {{ t('admin.stats.admins') }}
              </span>
              <span class="font-bold text-blue-300 text-xs">{{ s.details.admin }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-green-400 font-medium flex items-center gap-1.5 text-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                {{ t('admin.stats.active') }}
              </span>
              <span class="font-bold text-green-300 text-xs">{{ s.details.active }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-amber-400 font-medium flex items-center gap-1.5 text-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                {{ t('admin.stats.warned') }}
              </span>
              <span class="font-bold text-amber-300 text-xs">{{ s.details.warned }}</span>
            </div>
            <div class="flex justify-between items-center pb-1.5 my-0.5 border-b"
              :class="isDark ? 'border-slate-800/60' : 'border-slate-200'">
              <span class="text-rose-400 font-medium flex items-center gap-1.5 text-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {{ t('admin.stats.pendingDelete') }}
              </span>
              <span class="font-bold text-rose-300 text-xs">{{ s.details.isAskToDelete }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-red-500 font-medium flex items-center gap-1.5 text-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                {{ t('admin.stats.blocked') }}
              </span>
              <span class="font-bold text-red-400 text-xs">{{ s.details.blocked }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-orange-400 font-medium flex items-center gap-1.5 text-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                {{ t('admin.stats.expired') }}
              </span>
              <span class="font-bold text-orange-300 text-xs">{{ s.details.expired }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-slate-400 font-medium flex items-center gap-1.5 text-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                {{ t('admin.stats.deleted') }}
              </span>
              <span class="font-bold text-slate-300 text-xs">{{ s.details.deleted }}</span>
            </div>
          </div>
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent"
            :class="isDark ? 'border-b-slate-950' : 'border-b-white'"></div>
        </div>
      </div>
    </div>

    <!-- Middle Row -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

      <!-- Recent Users -->
      <div class="rounded-2xl border p-6" :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t('admin.recentUsers') }}
          </h2>
          <RouterLink to="/admin/users" class="text-xs text-blue-400 hover:underline">
            {{ t('admin.viewAll') }} →
          </RouterLink>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th class="text-start text-[11px] font-medium uppercase tracking-wider pb-2.5 px-3"
                  :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('admin.table.user') }}
                </th>
                <th class="text-start text-[11px] font-medium uppercase tracking-wider pb-2.5 px-3"
                  :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('admin.table.plan') }}
                </th>
                <th class="text-start text-[11px] font-medium uppercase tracking-wider pb-2.5 px-3"
                  :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('admin.table.verified') }}
                </th>
                <th class="text-start text-[11px] font-medium uppercase tracking-wider pb-2.5 px-3"
                  :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('admin.table.joined') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="text-center py-8" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('common.loading') }}
                </td>
              </tr>
              <tr v-else-if="!recentUsers.length">
                <td colspan="5" class="text-center py-8" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
                  {{ t('admin.noUsers') }}
                </td>
              </tr>
              <tr v-else v-for="u in recentUsers" :key="u._id">
                <td class="py-2.5 px-3 border-t text-start"
                  :class="isDark ? 'border-white/5 text-white' : 'border-slate-200 text-slate-900'">
                  <div class="flex items-center gap-2.5">
                    <div
                      class="w-[30px] h-[30px] rounded-full shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
                      {{ u.name?.[0]?.toUpperCase() }}
                    </div>
                    <div>
                      <p class="text-[13px] font-medium m-0" :class="isDark ? 'text-white' : 'text-slate-900'">{{ u.name
                        }}</p>
                      <p class="text-[11px] m-0" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{
                        obfuscate(u.email) }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-2.5 px-3 border-t text-start"
                  :class="isDark ? 'border-white/5 text-white' : 'border-slate-200 text-slate-900'">
                  <span class="text-[11px] px-2 py-0.5 rounded-full font-medium" :class="planClass(u)">{{ planLabel(u)
                    }}</span>
                </td>
                <td class="py-2.5 px-3 border-t text-center"
                  :class="isDark ? 'border-white/5 text-white' : 'border-slate-200 text-slate-900'">
                  <span
                    class="w-[22px] h-[22px] rounded-full inline-flex items-center justify-center text-[11px] font-bold"
                    :class="u.isVerified
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'">
                    {{ u.isVerified ? '✓' : '!' }}
                  </span>
                </td>
                <td class="py-2.5 px-3 border-t text-start"
                  :class="isDark ? 'border-white/5 text-slate-400' : 'border-slate-200 text-slate-600'">
                  {{ formatDate(u.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Platform Health -->
      <div class="rounded-2xl border p-6" :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t('admin.platformHealth') }}
          </h2>
        </div>
        <div class="flex flex-col gap-4 mb-5">
          <div>
            <div class="flex justify-between text-xs mb-1.5" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              <span>{{ t('admin.serverUptime') }}</span>
              <span class="font-semibold text-emerald-400">{{ uptimeStr }}</span>
            </div>
            <div class="h-[5px] rounded-full overflow-hidden" :class="isDark ? 'bg-white/5' : 'bg-slate-200'">
              <div class="h-full rounded-full bg-emerald-400 transition-all duration-600" style="width:99.8%"></div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1.5" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              <span>{{ t('admin.activeTrials') }}</span>
              <span class="font-semibold text-blue-400">{{ stats.activeTrialUsers ?? '—' }}</span>
            </div>
            <div class="h-[5px] rounded-full overflow-hidden" :class="isDark ? 'bg-white/5' : 'bg-slate-200'">
              <div class="h-full rounded-full bg-blue-400 transition-all duration-600"
                :style="{ width: stats.totalUsers ? (stats.activeTrialUsers / stats.totalUsers * 100) + '%' : '0%' }">
              </div>
            </div>
          </div>
          <div>
            <div class="flex justify-between text-xs mb-1.5" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              <span>{{ t('admin.pendingVerifications') }}</span>
              <span class="font-semibold text-amber-400">{{ stats.pendingVerifications ?? '—' }}</span>
            </div>
            <div class="h-[5px] rounded-full overflow-hidden" :class="isDark ? 'bg-white/5' : 'bg-slate-200'">
              <div class="h-full rounded-full bg-amber-400 transition-all duration-600"
                :style="{ width: stats.totalUsers ? Math.min(stats.pendingVerifications / stats.totalUsers * 100, 100) + '%' : '0%' }">
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3 mt-4">
          <div class="rounded-xl border p-3 text-center"
            :class="isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'">
            <p class="text-lg font-bold m-0 mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ stats.newUsersThisWeek ?? '—' }}
            </p>
            <p class="text-[10px] m-0" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.newThisWeek') }}
            </p>
          </div>
          <div class="rounded-xl border p-3 text-center"
            :class="isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'">
            <p class="text-lg font-bold m-0 mb-0.5"
              :class="stats.registrationGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'">
              {{ stats.registrationGrowth >= 0 ? '+' : '' }}{{ stats.registrationGrowth ?? '—' }}%
            </p>
            <p class="text-[10px] m-0" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.vsLastWeek') }}
            </p>
          </div>
          <div class="rounded-xl border p-3 text-center"
            :class="isDark ? 'bg-white/3 border-white/5' : 'bg-slate-50 border-slate-200'">
            <p class="text-lg font-bold m-0 mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ stats.totalUsers ?? '—' }}
            </p>
            <p class="text-[10px] m-0" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.totalUsers') }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Trends Row -->
    <div class="rounded-2xl border p-6" :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
          {{ t('admin.topTrends') }}
        </h2>
        <RouterLink to="/admin/trends" class="text-xs text-blue-400 hover:underline">
          {{ t('admin.manage') }} →
        </RouterLink>
      </div>
      <div class="flex flex-col gap-2">
        <div v-if="loadingTrends" class="text-center py-8" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
          {{ t('common.loading') }}
        </div>
        <div v-else v-for="(t, i) in trends" :key="t._id"
          class="grid grid-cols-[28px_1fr_90px_120px_36px_24px] items-center gap-3 py-2 border-b"
          :class="isDark ? 'border-white/4' : 'border-slate-100'">
          <span class="text-xs font-semibold" :class="isDark ? 'text-slate-400' : 'text-slate-600'">#{{ i + 1 }}</span>
          <span class="text-sm font-medium text-right" dir="rtl" :class="isDark ? 'text-white' : 'text-slate-900'">{{
            t.tag }}</span>
          <span class="text-[11px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t.category }}</span>
          <div class="h-1.5 rounded-full overflow-hidden" :class="isDark ? 'bg-white/5' : 'bg-slate-200'">
            <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
              :style="{ width: t.velocity + '%' }"></div>
          </div>
          <span class="text-xs text-right" :class="isDark ? 'text-slate-400' : 'text-slate-600'">{{ t.velocity }}</span>
          <span class="text-[13px] font-bold" :class="{
            'text-emerald-400': t.change === 'up',
            'text-rose-400': t.change === 'down',
            'text-slate-400': t.change === 'same'
          }">
            {{ t.change === 'up' ? '↑' : t.change === 'down' ? '↓' : '→' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <Teleport to="body">
      <TransitionGroup name="toast" tag="div"
        class="fixed z-[9999] flex flex-col gap-2 pointer-events-none"
        :class="locale === 'ar'
          ? 'bottom-5 left-5 items-start'
          : 'bottom-5 right-5 items-end'">
        <div v-for="toast in toasts" :key="toast.id"
          class="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl max-w-[340px] w-full sm:w-auto"
          :class="[
            toast.type === 'success' ? 'bg-emerald-500 text-white' :
            'bg-rose-500 text-white',
            locale === 'ar' ? 'flex-row-reverse text-right' : ''
          ]">
          <span class="shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold bg-white/25">
            {{ toast.type === 'success' ? '✓' : '✕' }}
          </span>
          <p class="text-sm font-semibold leading-snug flex-1 m-0">{{ toast.message }}</p>
          <button @click="removeToast(toast.id)"
            class="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-xs leading-none"
            :class="locale === 'ar' ? 'order-first' : ''">✕</button>
        </div>
      </TransitionGroup>
    </Teleport>

    <!-- Block Warning Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showReasonModal" class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal">
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div class="relative w-full max-w-md rounded-2xl p-6 shadow-xl border"
            :class="isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'">
            <h3 class="text-lg font-semibold mb-2" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.issueWarning') }}
            </h3>
            <p class="text-sm mb-6" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.warningDesc') }}
            </p>

            <textarea v-model="blockReason" :placeholder="t('admin.warningPlaceholder')" rows="3"
              class="w-full rounded-xl px-4 py-3 text-sm border resize-none focus:outline-none focus:border-blue-500/40 mb-4"
              :class="isDark
                ? 'bg-slate-900 border-white/10 text-white placeholder-slate-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'"></textarea>

            <div class="flex gap-3">
              <button class="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors" :class="isDark
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'" @click="closeModal">
                {{ t('common.cancel') }}
              </button>
              <button
                class="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-500 transition-colors disabled:opacity-50"
                :disabled="!blockReason.trim()" @click="submitBlockWarning">
                {{ t('admin.confirmWarning') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTheme } from '../../composables/useTheme.js'
import adminApi from '../../api/adminApi'

const { t, locale } = useI18n()
const { isDark } = useTheme()

const loading = ref(true)
const loadingTrends = ref(true)
const stats = ref({})
const recentUsers = ref([])
const trends = ref([])
const showReasonModal = ref(false)
const blockReason = ref('')
const selectedUser = ref(null)
const toasts = ref([])
let toastIdCounter = 0

function showToast(message, type = 'success', duration = 4000) {
  const id = ++toastIdCounter
  toasts.value.push({ id, message, type })
  setTimeout(() => removeToast(id), duration)
}

function removeToast(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

const uptimeStr = computed(() => {
  const s = stats.value.serverUptime || 0
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
})

const statCards = computed(() => [
  {
    label: t('admin.stats.totalUsers'),
    value: stats.value.totalUsers?.toLocaleString() ?? '—',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>`,
    iconBg: 'rgba(59,130,246,0.12)',
    sub: `+${stats.value.newUsersThisWeek ?? 0} ${t('admin.thisWeek')}`,
    subColor: 'green',
    hasDetails: true,
    details: {
      active: stats.value.activeCount ?? 0,
      warned: stats.value.warnedCount ?? 0,
      isAskToDelete: stats.value.isAskToDeleteCount ?? 0,
      blocked: stats.value.blockedCount ?? 0,
      expired: stats.value.expiredCount ?? 0,
      deleted: stats.value.deletedCount ?? 0,
      admin: stats.value.adminCount ?? 0
    }
  },
  {
    label: t('admin.stats.newUsers24h'),
    value: stats.value.newUsers24h ?? '—',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>`,
    iconBg: 'rgba(168,85,247,0.12)',
    sub: t('admin.registered24h'),
    subColor: 'muted',
  },
  {
    label: t('admin.stats.pendingVerification'),
    value: stats.value.pendingVerifications ?? '—',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.08 6.08l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`,
    iconBg: 'rgba(245,158,11,0.12)',
    sub: t('admin.awaitingOTP'),
    subColor: 'amber',
  },
  {
    label: t('admin.stats.newPosts24h'),
    value: stats.value.newPostsLast24h?.toLocaleString() ?? '—',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>`,
    iconBg: 'rgba(139,92,246,0.12)',
    sub: t('admin.contentGenerated'),
    subColor: 'muted',
  },
])

function subColorClass(color) {
  const colors = {
    green: 'text-emerald-400',
    amber: 'text-amber-400',
    muted: isDark.value ? 'text-slate-400' : 'text-slate-600'
  }
  return colors[color] || colors.muted
}

function obfuscate(email) {
  if (!email) return ''
  const [user, domain] = email.split('@')
  return user.slice(0, 2) + '****@' + domain
}

function planLabel(u) {
  if (u.isTrial) {
    const days = Math.ceil((new Date(u.planEndsAt) - Date.now()) / 86400000)
    return days > 0 
      ? `${t('admin.trial')} (${t('admin.plans.daysLeft', { days })})` 
      : t('admin.trialExpired')
  }
  return u.plan ? t(`auth.plan.${u.plan}`) : t('auth.plan.free')
}

function planClass(u) {
  if (u.isTrial) return isDark.value ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700'
  if (u.plan === 'pro') return isDark.value ? 'bg-blue-500/15 text-blue-400' : 'bg-blue-100 text-blue-700'
  if (u.plan === 'enterprise') return isDark.value ? 'bg-purple-500/15 text-purple-400' : 'bg-purple-100 text-purple-700'
  return isDark.value ? 'bg-slate-500/15 text-slate-400' : 'bg-slate-100 text-slate-700'
}

function formatDate(d) {
  const dateLocale = locale.value === 'ar' ? 'ar-EG' : 'en-GB'
  return d ? new Date(d).toLocaleDateString(dateLocale, { day: '2-digit', month: 'short' }) : '—'
}

async function submitBlockWarning() {
  if (!blockReason.value.trim() || !selectedUser.value) return

  try {
    await adminApi.blockUser(selectedUser.value._id, blockReason.value.trim())
    selectedUser.value.blockStatus = 'warning'
    selectedUser.value.isBlocked = false
    showReasonModal.value = false
    blockReason.value = ''
    closeModal()
    showToast(t('admin.warningSuccess'), 'success')
  } catch (error) {
    showToast(error.response?.data?.message || t('admin.warningFailed'), 'error')
  }
}

function closeModal() {
  showReasonModal.value = false
  selectedUser.value = null
  blockReason.value = ''
}

onMounted(async () => {
  try {
    const [statsRes, usersRes] = await Promise.all([
      adminApi.getStats(),
      adminApi.getUsers({ limit: 6 }),
    ])
    stats.value = statsRes
    recentUsers.value = usersRes.users || []
  } finally {
    loading.value = false
  }

  try {
    const t = await adminApi.getTrends()
    trends.value = t.trends || []
  } finally {
    loadingTrends.value = false
  }
})
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

.toast-move {
  transition: transform 0.3s ease;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>