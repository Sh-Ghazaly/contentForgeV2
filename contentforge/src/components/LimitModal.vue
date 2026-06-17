<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style="background: rgba(0, 0, 0, 0.7)"
        @click.self="hide"
      >
        <div
          class="theme-surface rounded-2xl theme-border max-w-md w-full p-6 theme-shadow space-y-5"
          style="border: 1px solid var(--border)"
        >
          <!-- Icon -->
          <div class="flex justify-center">
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              :class="iconClass"
            >
              {{ icon }}
            </div>
          </div>

          <!-- Title -->
          <h3 class="font-display text-xl font-600 theme-text text-center">
            {{ modalData.title }}
          </h3>

          <!-- Message -->
          <p class="text-sm theme-sub leading-relaxed text-center">
            {{ modalData.message }}
          </p>

          <!-- Info Box -->
          <div class="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p class="text-xs text-blue-400 text-center">
              {{ t('limitModal.infoMessage') || 'Upgrade your plan or resubscribe to continue using all features without limits.' }}
            </p>
          </div>

          <!-- Buttons -->
          <div class="flex flex-col gap-3 pt-2">
            <!-- Upgrade Plan Button -->
            <button
              @click="upgradePlan"
              class="w-full py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {{ t('limitModal.upgradePlan') || 'Upgrade Plan' }}
            </button>

            <!-- Resubscription Button -->
            <button
              @click="resubscribe"
              class="w-full py-3 rounded-xl theme-card theme-border theme-sub text-sm font-semibold hover:theme-text transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {{ t('limitModal.resubscribe') || 'Resubscribe' }}
            </button>

            <!-- Cancel Button -->
            <button
              @click="hide"
              class="w-full py-2.5 rounded-xl text-xs theme-muted hover:theme-text transition-colors"
            >
              {{ t('common.cancel') || 'Cancel' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLimitModal } from '../composables/useLimitModal'

const router = useRouter()
const { t } = useI18n()
const { isVisible, modalData, hide } = useLimitModal()

// ✅ أيقونة ديناميكية حسب نوع الـ modal
const icon = computed(() => {
  const icons = {
    trial_expired: '⏰',
    feature_locked: '🔒',
    posts_limit: '📝',
    calendar_limit: '📅',
    brands_limit: '🏷️',
    general: '⚠️',
  }
  return icons[modalData.value.type] || '⚠️'
})

// ✅ لون الأيقونة ديناميكي
const iconClass = computed(() => {
  const classes = {
    trial_expired: 'bg-amber-500/15 text-amber-400',
    feature_locked: 'bg-rose-500/15 text-rose-400',
    posts_limit: 'bg-blue-500/15 text-blue-400',
    calendar_limit: 'bg-purple-500/15 text-purple-400',
    brands_limit: 'bg-teal-500/15 text-teal-400',
    general: 'bg-amber-500/15 text-amber-400',
  }
  return classes[modalData.value.type] || 'bg-amber-500/15 text-amber-400'
})

// ✅ Upgrade Plan → يوجه لصفحة /payment
function upgradePlan() {
  hide()
  router.push('/payment')
}

// ✅ Resubscription → يوجه لـ Stripe Portal (لو عنده اشتراك سابق)
async function resubscribe() {
  hide()
  try {
    const { default: paymentApi } = await import('../api/paymentApi')
    const url = await paymentApi.openPortal()
    window.location.href = url
  } catch (err) {
    // لو مفيش اشتراك سابق، يوجه لصفحة /payment
    console.warn('No active subscription, redirecting to /payment')
    router.push('/payment')
  }
}
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>