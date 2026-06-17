<<template>
  <div class="ai-reels-page" :class="{ 'is-light': !isDark }" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    
    <!-- Page Header -->
    <div class="page-header">
      <RouterLink to="/dashboard" class="back-link">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" 
            :d="locale === 'ar' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
        </svg>
        {{ t('aiReels.backToDashboard') }}
      </RouterLink>
    </div>

    <!-- LOCKED: Upgrade Required (for non-Enterprise) -->
    <div v-if="!isEnterprise" class="coming-soon-container">
      <div class="coming-soon-card locked-card">
        <div class="icon-wrapper locked-icon">
          <div class="main-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
        </div>

        <div class="locked-badge">
          <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
          </svg>
          {{ t('aiReels.enterpriseOnly') }}
        </div>

        <h1 class="coming-soon-title">{{ t('aiReels.lockedTitle') }}</h1>
        <p class="coming-soon-subtitle">{{ t('aiReels.lockedSubtitle') }}</p>
        <p class="coming-soon-description">{{ t('aiReels.lockedDescription') }}</p>

        <div class="locked-features">
          <div v-for="(feature, index) in lockedFeatures" :key="index" class="locked-feature">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {{ feature }}
          </div>
        </div>

        <RouterLink to="/payment" class="upgrade-btn">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          {{ t('aiReels.upgradeBtn') }}
        </RouterLink>
      </div>
    </div>

    <!-- UNLOCKED: Coming Soon (for Enterprise only) -->
    <div v-else class="coming-soon-container">
      <div class="coming-soon-card">
        <div class="icon-wrapper">
          <div class="pulse-ring"></div>
          <div class="pulse-ring delay-1"></div>
          <div class="pulse-ring delay-2"></div>
          <div class="main-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
        </div>

        <div class="soon-badge">
          <span class="soon-dot"></span>
          {{ t('aiReels.comingSoonBadge') }}
        </div>

        <h1 class="coming-soon-title">{{ t('aiReels.title') }}</h1>
        <p class="coming-soon-subtitle">{{ t('aiReels.subtitle') }}</p>
        <p class="coming-soon-description">{{ t('aiReels.description') }}</p>

        <div class="feature-tags">
          <span v-for="(feature, index) in features" :key="index" class="tag">
            {{ feature }}
          </span>
        </div>

        <div class="notify-section">
          <p class="notify-text">{{ t('aiReels.notifyText') }}</p>
          <div class="notify-form">
            <input 
              v-model="notifyEmail" 
              type="email" 
              :placeholder="t('aiReels.emailPlaceholder')"
              class="notify-input"
              @keyup.enter="notifyMe"
            />
            <button 
              @click="notifyMe" 
              :disabled="notifyLoading || !isValidEmail"
              class="notify-btn"
            >
              <svg v-if="notifyLoading" class="spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ notifyLoading ? t('aiReels.sending') : t('aiReels.notifyBtn') }}
            </button>
          </div>
          <Transition name="fade-up">
            <p v-if="notifySuccess" class="notify-success">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {{ t('aiReels.notifySuccess') }}
            </p>
          </Transition>
          <p v-if="notifyError" class="notify-error">{{ notifyError }}</p>
        </div>

        <div class="timeline-badge">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ t('aiReels.timeline') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useLang } from '../composables/useLang.js'
import { useAuthStore } from '../stores/authStore'
import { useTheme } from '../composables/useTheme.js'

const { t } = useI18n()
const { locale } = useLang()
const authStore = useAuthStore()
const { isDark } = useTheme()

const isEnterprise = computed(() => {
  return authStore.user?.plan === 'enterprise'
})

const notifyEmail = ref('')
const notifyLoading = ref(false)
const notifySuccess = ref(false)
const notifyError = ref('')

const isValidEmail = computed(() => {
  return notifyEmail.value && notifyEmail.value.includes('@') && notifyEmail.value.includes('.')
})

const features = computed(() => [
  t('aiReels.feature1'),
  t('aiReels.feature2'),
  t('aiReels.feature3'),
  t('aiReels.feature4'),
])

const lockedFeatures = computed(() => [
  t('aiReels.lockedFeature1'),
  t('aiReels.lockedFeature2'),
  t('aiReels.lockedFeature3'),
  t('aiReels.lockedFeature4'),
])

async function notifyMe() {
  if (!isValidEmail.value) {
    notifyError.value = t('aiReels.invalidEmail')
    return
  }
  
  notifyError.value = ''
  notifyLoading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    notifySuccess.value = true
    notifyEmail.value = ''
    setTimeout(() => notifySuccess.value = false, 5000)
  } catch (err) {
    notifyError.value = err.message || t('aiReels.errorGeneric')
  } finally {
    notifyLoading.value = false
  }
}
</script>

<style scoped>
/* ============================================
   DARK MODE (default)
   ============================================ */
.ai-reels-page {
  --page-bg: #0a0a0a;
  --card-bg: #141414;
  --text-primary: #e5e7eb;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  --border-color: rgba(255, 255, 255, 0.08);
  --input-bg: rgba(255, 255, 255, 0.04);
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  min-height: 100vh;
  background: var(--page-bg);
  color: var(--text-primary);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: background 0.3s ease, color 0.3s ease;
}

/* ============================================
   LIGHT MODE - uses .is-light class on root
   ============================================ */
.ai-reels-page.is-light {
  --page-bg: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --input-bg: #f1f5f9;
  --shadow-card: 0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* ============================================
   HEADER
   ============================================ */
.page-header {
  margin-bottom: 1.5rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.15s;
}

.back-link:hover {
  color: var(--text-primary);
}

/* ============================================
   MAIN CONTAINER
   ============================================ */
.coming-soon-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}

.coming-soon-card {
  max-width: 560px;
  width: 100%;
  text-align: center;
  padding: 3rem 2rem;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--shadow-card);
}

.coming-soon-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #ec4899, #8b5cf6, #3b82f6);
}

.locked-card::before {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}

/* ============================================
   ANIMATED ICON
   ============================================ */
.icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.locked-icon {
  width: 100px;
  height: 100px;
  margin-bottom: 1.25rem;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(236, 72, 153, 0.3);
  animation: pulse 2s ease-out infinite;
}

.pulse-ring.delay-1 {
  animation-delay: 0.5s;
}

.pulse-ring.delay-2 {
  animation-delay: 1s;
}

@keyframes pulse {
  0% { transform: scale(0.8); opacity: 1; }
  100% { transform: scale(1.4); opacity: 0; }
}

.main-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  position: relative;
  z-index: 1;
  box-shadow: 0 0 40px rgba(236, 72, 153, 0.3);
}

.locked-icon .main-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
}

/* ============================================
   BADGES
   ============================================ */
.soon-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(236, 72, 153, 0.1);
  border: 1px solid rgba(236, 72, 153, 0.2);
  color: #ec4899;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 1.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.is-light .soon-badge {
  background: rgba(236, 72, 153, 0.08);
  border-color: rgba(236, 72, 153, 0.15);
}

.locked-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.is-light .locked-badge {
  background: rgba(245, 158, 11, 0.08);
  border-color: rgba(245, 158, 11, 0.15);
}

.soon-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ec4899;
  animation: blink 2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* ============================================
   TYPOGRAPHY
   ============================================ */
.coming-soon-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.locked-card .coming-soon-title {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.coming-soon-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px;
}

.coming-soon-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 auto 24px;
  max-width: 420px;
}

/* ============================================
   LOCKED FEATURES LIST
   ============================================ */
.locked-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.locked-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.05);
  border: 1px solid rgba(245, 158, 11, 0.1);
  color: var(--text-secondary);
  font-size: 13px;
  transition: background 0.3s ease;
}

.is-light .locked-feature {
  background: rgba(245, 158, 11, 0.04);
  border-color: rgba(245, 158, 11, 0.08);
}

.locked-feature svg {
  color: #f59e0b;
  flex-shrink: 0;
}

/* ============================================
   UPGRADE BUTTON
   ============================================ */
.upgrade-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s;
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2);
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 30px rgba(245, 158, 11, 0.3);
}

/* ============================================
   FEATURE TAGS
   ============================================ */
.feature-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-bottom: 28px;
}

.tag {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.2);
  color: #a78bfa;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.is-light .tag {
  background: rgba(139, 92, 246, 0.06);
  border-color: rgba(139, 92, 246, 0.12);
}

/* ============================================
   NOTIFY SECTION
   ============================================ */
.notify-section {
  margin-bottom: 24px;
}

.notify-text {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0 0 12px;
}

.notify-form {
  display: flex;
  gap: 8px;
  max-width: 360px;
  margin: 0 auto;
}

.notify-input {
  flex: 1;
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s, background 0.3s ease;
}

.notify-input:focus {
  border-color: rgba(236, 72, 153, 0.4);
}

.notify-input::placeholder {
  color: var(--text-muted);
}

.notify-btn {
  padding: 12px 20px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ec4899, #8b5cf6);
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.notify-btn:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.notify-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.notify-success {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 13px;
  color: #10b981;
  margin-top: 12px;
}

.notify-error {
  font-size: 12px;
  color: #f87171;
  margin-top: 8px;
}

/* ============================================
   TIMELINE BADGE
   ============================================ */
.timeline-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  font-size: 13px;
  font-weight: 500;
  transition: background 0.3s ease, border-color 0.3s ease;
}

.is-light .timeline-badge {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.12);
}

/* ============================================
   LOADING SPINNER
   ============================================ */
.spin {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   TRANSITIONS
   ============================================ */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (max-width: 640px) {
  .ai-reels-page {
    padding: 1rem;
  }
  
  .coming-soon-card {
    padding: 2rem 1.25rem;
  }
  
  .coming-soon-title {
    font-size: 22px;
  }
  
  .notify-form {
    flex-direction: column;
  }
  
  .notify-btn {
    width: 100%;
    justify-content: center;
  }
  
  .icon-wrapper {
    width: 100px;
    height: 100px;
  }
  
  .main-icon {
    width: 60px;
    height: 60px;
  }
  
  .main-icon svg {
    width: 32px;
    height: 32px;
  }
  
  .locked-features {
    max-width: 100%;
  }
}
</style>