
<template>
  <div class="flex flex-col gap-6">

    <!-- Settings Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

      <!-- Trial Settings -->
      <div 
        class="rounded-2xl border p-6"
        :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'"
      >
        <div class="flex items-center gap-2 mb-5">
          <svg class="w-4 h-4" :class="isDark ? 'text-slate-400' : 'text-slate-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12,6 12,12 16,14"/>
          </svg>
          <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t('admin.settingsPage.trialSettings') }}
          </h2>
        </div>

        <!-- Trial Duration -->
        <div 
          class="flex items-center justify-between gap-4 py-4 border-b"
          :class="isDark ? 'border-white/5' : 'border-slate-100'"
        >
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.trialDuration') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.trialDurationDesc') }}
            </p>
          </div>
          <div class="flex items-center gap-1.5">
            <input 
              v-model.number="settings.trialDays" 
              type="number" 
              min="1" 
              max="90" 
              class="w-16 px-2.5 py-1.5 rounded-lg text-center text-sm border focus:outline-none focus:border-blue-500/40"
              :class="isDark 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-slate-50 border-slate-200 text-slate-900'"
            />
            <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.days') }}
            </span>
          </div>
        </div>

        <!-- Block by Phone -->
      <!--<div 
          class="flex items-center justify-between gap-4 py-4 border-b"
          :class="isDark ? 'border-white/5' : 'border-slate-100'"
        >
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.blockByPhone') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.blockByPhoneDesc') }}
            </p>
          </div>
          <label class="relative inline-block w-10 h-[22px] shrink-0 cursor-pointer">
            <input type="checkbox" v-model="settings.blockByPhone" class="opacity-0 w-0 h-0"/>
            <span 
              class="absolute inset-0 rounded-full transition-colors"
              :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
              style="transition: background 0.2s;"
            ></span>
            <span 
              class="absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-all"
              :class="[
                settings.blockByPhone 
                  ? 'bg-blue-500 translate-x-[18px]' 
                  : (isDark ? 'bg-slate-500' : 'bg-slate-400')
              ]"
              style="transition: all 0.2s;"
            ></span>
          </label>
        </div>
 -->
      </div>

      <!-- Email Settings -->
      <div 
        class="rounded-2xl border p-6"
        :class="isDark ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'"
      >
        <div class="flex items-center gap-2 mb-5">
          <svg class="w-4 h-4" :class="isDark ? 'text-slate-400' : 'text-slate-600'" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          <h2 class="text-[15px] font-semibold" :class="isDark ? 'text-white' : 'text-slate-900'">
            {{ t('admin.settingsPage.emailOtp') }}
          </h2>
        </div>

        <!-- OTP Expiry -->
        <div 
          class="flex items-center justify-between gap-4 py-4 border-b"
          :class="isDark ? 'border-white/5' : 'border-slate-100'"
        >
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.otpExpiry') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.otpExpiryDesc') }}
            </p>
          </div>
          <div class="flex items-center gap-1.5">
            <input 
              v-model.number="settings.otpExpiryMinutes" 
              type="number" 
              min="1" 
              max="60" 
              class="w-16 px-2.5 py-1.5 rounded-lg text-center text-sm border focus:outline-none focus:border-blue-500/40"
              :class="isDark 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-slate-50 border-slate-200 text-slate-900'"
            />
            <span class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.minutes') }}
            </span>
          </div>
        </div>

        <!-- Send Expiry Warning -->
        <div class="flex items-center justify-between gap-4 py-4">
          <div class="flex-1">
            <p class="text-[13px] font-medium mb-0.5" :class="isDark ? 'text-white' : 'text-slate-900'">
              {{ t('admin.settingsPage.sendExpiryWarning') }}
            </p>
            <p class="text-[12px]" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
              {{ t('admin.settingsPage.sendExpiryWarningDesc') }}
            </p>
          </div>
          <label class="relative inline-block w-10 h-[22px] shrink-0 cursor-pointer">
            <input type="checkbox" v-model="settings.sendExpiryWarning" class="opacity-0 w-0 h-0"/>
            <span 
              class="absolute inset-0 rounded-full transition-colors"
              :class="isDark ? 'bg-white/10' : 'bg-slate-200'"
              style="transition: background 0.2s;"
            ></span>
            <span 
              class="absolute top-[3px] left-[3px] w-4 h-4 rounded-full transition-all"
              :class="[
                settings.sendExpiryWarning 
                  ? 'bg-blue-500 translate-x-[18px]' 
                  : (isDark ? 'bg-slate-500' : 'bg-slate-400')
              ]"
              style="transition: all 0.2s;"
            ></span>
          </label>
        </div>
      </div>

    </div>

    <!-- Save Row -->
    <div class="flex items-center justify-between gap-4">
      <p class="text-xs" :class="isDark ? 'text-slate-400' : 'text-slate-600'">
        {{ saveMsg }}
      </p>
       <button 
    @click="save" 
    :disabled="saving || saved"
    class="px-6 py-2.5 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-teal-400 text-white hover:opacity-85"
  >
    {{ saving ? t('admin.settingsPage.saving') : saved ? t('admin.settingsPage.saved') : t('admin.settingsPage.saveSettings') }}
  </button>
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

const isDev = import.meta.env.DEV
const saved = ref(false)
const saving = ref(false)
const saveMsg = ref('')
const loading = ref(true)
 
const originalSettings = ref({})  

const settings = ref({
  trialDays: 14,
  otpExpiryMinutes: 10,
  sendExpiryWarning: false,
})

 
onMounted(async () => {
  try {
    const data = await adminApi.getSettings()
    const s = data.settings
    settings.value = {
      trialDays: Number(s.trialDays) || 14,
      otpExpiryMinutes: Number(s.otpExpiryMinutes) || 10,
      sendExpiryWarning: Boolean(s.sendExpiryWarning),
    }
    originalSettings.value = { ...settings.value }
  } catch (err) {
    console.error('Failed to load settings:', err)
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  saveMsg.value = ''
  try {
    const cur = settings.value
    const orig = originalSettings.value
    const results = []

    await adminApi.saveSettings(cur)
    results.push('✓ تم حفظ الإعدادات')

    if (cur.sendExpiryWarning && !orig.sendExpiryWarning) {
      const res = await adminApi.triggerExpiryWarnings()
      results.push(`✓ ${res?.message || 'تم إرسال التحذيرات'}`)
    }

    originalSettings.value = { ...cur }
    saveMsg.value = results.join(' — ')
    saved.value = true
    setTimeout(() => { saved.value = false; saveMsg.value = '' }, 4000)
  } catch (err) {
    saveMsg.value = '✗ ' + (err.response?.data?.message || err.message || 'حدث خطأ')
  } finally {
    saving.value = false
  }
}
// const settingsSaved = ref(false)
// const triggering = ref(false)
// const triggerMsg = ref('')

// async function triggerWarnings() {
//   triggering.value = true
//   triggerMsg.value = ''
//   try {
//     const res = await adminApi.triggerExpiryWarnings()
//     triggerMsg.value = '✓ ' + res.message
//   } catch (err) {
//     triggerMsg.value = '✗ ' + (err.message || 'حدث خطأ')
//   } finally {
//     triggering.value = false
//     setTimeout(() => { triggerMsg.value = '' }, 4000)
//   }
// }
// async function save() {
//   saving.value = true
//   saveMsg.value = ''
//   try {
//     const res = await adminApi.saveSettings(settings.value)
//     saveMsg.value = `✓ ${t('admin.settingsPage.saved')} — ${res.updatedUsers} ${t('admin.settingsPage.trialUsersUpdated')}`
//     saved.value = true
//     settingsSaved.value = true  // ✅ أضيفي السطر ده بس
//     setTimeout(() => { saved.value = false; saveMsg.value = '' }, 3000)
//   } catch (err) {
//     saveMsg.value = err.message || t('admin.settingsPage.saveFailed')
//   } finally {
//     saving.value = false
//   }
// }
</script>
 
<style scoped>
.admin-settings { display: flex; flex-direction: column; gap: 1.5rem; }
.settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
 
.loading-state { opacity: 0.4; text-align: center; padding: 2rem; color: var(--text,#f0f2f5); }
 
.panel { background: var(--surface,#13151c); border: 1px solid var(--border,rgba(255,255,255,0.06)); border-radius: 14px; padding: 1.5rem; }
 
.panel-header { margin-bottom: 1.25rem; }
.panel-title  { font-size: 15px; font-weight: 600; color: var(--text,#f0f2f5); margin: 0; display: flex; align-items: center; gap: 8px; }
 
.setting-row  { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: 1rem 0; border-bottom: 1px solid var(--border,rgba(255,255,255,0.04)); }
.setting-row:last-child { border-bottom: none; }
.setting-info { flex: 1; }
.setting-name { font-size: 13px; font-weight: 500; color: var(--text,#f0f2f5); margin: 0 0 2px; }
.setting-desc { font-size: 12px; color: var(--sub,#6b7280); margin: 0; }
 
.setting-control { display: flex; align-items: center; gap: 6px; }
.num-input {
  width: 64px; padding: 6px 10px; border-radius: 8px;
  background: rgba(255,255,255,0.05); border: 1px solid var(--border,rgba(255,255,255,0.08));
  color: var(--text,#f0f2f5); font-size: 14px; text-align: center; outline: none;
}
.setting-unit { font-size: 12px; color: var(--sub,#6b7280); }
 
.toggle-switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; cursor: pointer; }
.toggle-switch input { opacity: 0; width: 0; height: 0; }
.toggle-track {
  position: absolute; inset: 0; border-radius: 999px;
  background: rgba(255,255,255,0.08); transition: background 0.2s;
}
.toggle-track::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #6b7280; transition: all 0.2s;
}
.toggle-switch input:checked + .toggle-track { background: rgba(59,130,246,0.3); }
.toggle-switch input:checked + .toggle-track::after { background: #60a5fa; transform: translateX(18px); }
 
.save-row  { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.save-note { font-size: 12px; color: var(--sub,#6b7280); margin: 0; }
.save-btn  {
  padding: 10px 24px; border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #14b8a6);
  border: none; color: white; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: opacity 0.15s;
}
.save-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.save-btn:not(:disabled):hover { opacity: 0.85; }
 
@media (max-width: 800px) { .settings-grid { grid-template-columns: 1fr; } }
</style>
