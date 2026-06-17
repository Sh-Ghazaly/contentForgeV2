<template>
  <AppLayout>
    <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full">
      
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="font-display text-2xl font-700 theme-text">{{ t('profile.title') }}</h1>
        <p class="text-sm theme-sub mt-1">{{ t('profile.subtitle') }}</p>
      </div>

      <!-- Profile Identity Card -->
      <div class="theme-surface theme-border rounded-2xl p-6 sm:p-8 mb-6">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div class="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-3xl font-bold text-white shrink-0 shadow-lg shadow-blue-500/20">
            {{ authStore.userInitial }}
          </div>
          <div class="flex-1 text-center sm:text-start">
            <h2 class="font-display text-xl font-600 theme-text">{{ authStore.user?.name || t('profile.defaultUser') }}</h2>
            <p class="text-sm theme-sub mt-1">{{ authStore.user?.email }}</p>
            <div class="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/20 font-medium">
  {{ authStore.userPlan || t('profile.freePlan') }}
</span>
              <span class="text-[11px] px-2.5 py-1 rounded-full bg-green-600/15 text-green-400 border border-green-500/20 font-medium">
                ✓ {{ t('profile.activeAccount') }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- My Brands Section -->
      <div class="theme-surface theme-border rounded-2xl p-6 sm:p-8 mb-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="font-display text-lg font-600 theme-text mb-1">{{ t('profile.myBrands') }}</h3>
            <p class="text-xs theme-sub">{{ t('profile.myBrandsDesc') }}</p>
          </div>
          <span 
            v-if="brands.length"
            class="text-[11px] px-2.5 py-1 rounded-full bg-blue-600/15 text-blue-400 border border-blue-500/20 font-medium"
          >
            {{ brands.length }} {{ t('profile.brandsCount') }}
          </span>
        </div>

        <!-- Loading State -->
        <div v-if="brandsLoading" class="flex items-center justify-center py-12">
          <svg class="w-6 h-6 animate-spin text-blue-400" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>

        <!-- Empty State -->
        <div v-else-if="!brands.length" class="text-center py-12">
          <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-500/10 flex items-center justify-center">
            <svg class="w-8 h-8 theme-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p class="text-sm theme-sub mb-1">{{ t('profile.noBrands') }}</p>
          <p class="text-xs theme-muted">{{ t('profile.noBrandsHint') }}</p>
        </div>

        <!-- Brands List -->
        <div v-else class="space-y-3">
          <div 
            v-for="brand in brands" 
            :key="brand._id"
            class="flex items-center gap-4 p-4 rounded-xl border transition-colors"
            style="border-color: var(--border)"
          >
            <!-- Brand Avatar -->
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-400 flex items-center justify-center text-lg font-bold text-white shrink-0">
              {{ brand.name?.[0]?.toUpperCase() || 'B' }}
            </div>

            <!-- Brand Info -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium theme-text truncate">{{ brand.name }}</p>
              <p class="text-xs theme-sub truncate mt-0.5">
                {{ brand.industry || t('profile.noIndustry') }}
                <span v-if="brand.dialects?.length" class="mx-1.5">·</span>
                {{ brand.dialects?.join(', ') }}
              </p>
            </div>

            <!-- Delete Button -->
            <button 
              @click="confirmDeleteBrand(brand)"
              class="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors theme-sub hover:text-rose-400 hover:bg-rose-500/10"
              :title="t('profile.deleteBrand')"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Profile Form -->
      <div class="theme-surface theme-border rounded-2xl p-6 sm:p-8 mb-6">
        <h3 class="font-display text-lg font-600 theme-text mb-1">{{ t('profile.accountInfo') }}</h3>
        <p class="text-xs theme-sub mb-6">{{ t('profile.accountInfoDesc') }}</p>
        
        <form @submit.prevent="updateProfile" class="space-y-5">
          <div>
            <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.fullName') }}</label>
            <input 
              type="text" 
              v-model="profileForm.name" 
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40"
              style="border-color: var(--border)"
            />
          </div>
          <div>
            <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.emailAddress') }}</label>
            <input 
              type="email" 
              :value="authStore.user?.email" 
              disabled
              class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border opacity-60 cursor-not-allowed"
              style="border-color: var(--border)"
            />
            <p class="text-[10px] theme-muted mt-1.5">{{ t('profile.emailReadonly') }}</p>
          </div>

          <div v-if="profileMsg" 
            class="text-xs py-2.5 px-4 rounded-xl border"
            :class="profileMsg.type === 'success' 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' 
              : 'text-rose-400 bg-rose-500/10 border-rose-500/15'">
            {{ profileMsg.text }}
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              :disabled="profileLoading"
              class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="profileLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ profileLoading ? t('common.saving') : t('profile.saveChanges') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password Form -->
      <div class="theme-surface theme-border rounded-2xl p-6 sm:p-8 mb-6">
        <h3 class="font-display text-lg font-600 theme-text mb-1">{{ t('profile.changePassword') }}</h3>
        <p class="text-xs theme-sub mb-6">{{ t('profile.changePasswordDesc') }}</p>
        
        <form @submit.prevent="updatePassword" class="space-y-5">
          <!-- Current Password -->
          <div>
            <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.currentPassword') }}</label>
            <div class="relative">
              <input 
                :type="showCurrentPass ? 'text' : 'password'" 
                v-model="passwordForm.current" 
                class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40 pr-12"
                style="border-color: var(--border)"
              />
              <button 
                type="button" 
                @click="showCurrentPass = !showCurrentPass" 
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                <svg v-if="showCurrentPass" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- New Password -->
            <div>
              <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.newPassword') }}</label>
              <div class="relative">
                <input 
                  :type="showNewPass ? 'text' : 'password'" 
                  v-model="passwordForm.new" 
                  class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40 pr-12"
                  style="border-color: var(--border)"
                />
                <button 
                  type="button" 
                  @click="showNewPass = !showNewPass" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg v-if="showNewPass" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.confirmPassword') }}</label>
              <div class="relative">
                <input 
                  :type="showConfirmPass ? 'text' : 'password'" 
                  v-model="passwordForm.confirm" 
                  class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border focus:outline-none focus:border-blue-500/40 pr-12"
                  style="border-color: var(--border)"
                />
                <button 
                  type="button" 
                  @click="showConfirmPass = !showConfirmPass" 
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg v-if="showConfirmPass" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="passwordMsg" 
            class="text-xs py-2.5 px-4 rounded-xl border"
            :class="passwordMsg.type === 'success' 
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' 
              : 'text-rose-400 bg-rose-500/10 border-rose-500/15'">
            {{ passwordMsg.text }}
          </div>

          <div class="flex justify-end pt-2">
            <button 
              type="submit" 
              :disabled="passwordLoading"
              class="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <svg v-if="passwordLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {{ passwordLoading ? t('common.updating') : t('profile.updatePassword') }}
            </button>
          </div>
        </form>
      </div>

      <!-- Danger Zone -->
      <div class="theme-surface theme-border rounded-2xl p-6 sm:p-8 mb-6 border-rose-500/20">
        <h3 class="font-display text-lg font-600 text-rose-400 mb-1">{{ t('profile.dangerZone') }}</h3>
        <p class="text-xs theme-sub mb-6">{{ t('profile.dangerZoneDesc') }}</p>
        
        <div class="flex items-center justify-between p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <div>
            <p class="text-sm font-medium theme-text">{{ t('profile.deleteAccount') }}</p>
            <p class="text-xs theme-sub mt-1">{{ t('profile.deleteAccountDesc') }}</p>
          </div>
          <button 
            @click="showDeleteModal = true"
            class="px-4 py-2 rounded-xl bg-rose-600 text-white text-sm font-medium hover:bg-rose-500 transition-colors shrink-0 ms-4"
          >
            {{ t('profile.deleteAccount') }}
          </button>
        </div>
      </div>

    </div>

    <!-- Delete Brand Confirmation Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div 
          v-if="deleteBrandTarget" 
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="deleteBrandTarget = null"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div 
            class="relative w-full max-w-md rounded-2xl p-6 shadow-xl theme-surface theme-border"
            style="border: 1px solid var(--border)"
          >
            <div class="flex items-start gap-4 mb-6">
              <div class="flex-shrink-0 w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-lg font-600 theme-text">
                  {{ t('profile.deleteBrandTitle') }}
                </h3>
                <p class="text-sm theme-sub leading-relaxed mt-1">
                  {{ t('profile.deleteBrandDesc', { name: deleteBrandTarget.name }) }}
                </p>
              </div>
            </div>

            <div class="flex gap-3">
              <button 
                @click="deleteBrandTarget = null"
                class="flex-1 py-3 rounded-xl theme-card theme-border theme-sub text-sm font-semibold hover:theme-text transition-colors"
              >
                {{ t('common.cancel') }}
              </button>
              <button 
                @click="deleteBrand" 
                :disabled="brandDeleting"
                class="flex-1 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="brandDeleting" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ brandDeleting ? t('profile.deleting') : t('profile.confirmDelete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Account Modal -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div 
          v-if="showDeleteModal" 
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="showDeleteModal = false"
        >
          <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div 
            class="relative w-full max-w-md rounded-2xl p-6 shadow-xl theme-surface theme-border"
            style="border: 1px solid var(--border)"
          >
            <div class="flex items-start gap-4 mb-6">
              <div class="flex-shrink-0 w-11 h-11 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <svg class="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-display text-lg font-600 theme-text">
                  {{ t('profile.deleteAccountTitle') }}
                </h3>
                <p class="text-sm theme-sub leading-relaxed mt-1">
                  {{ t('profile.deleteAccountWarning') }}
                </p>
              </div>
            </div>

            <div class="space-y-2 mb-6">
              <label class="text-xs font-medium theme-sub mb-1.5 block">{{ t('profile.deleteReason') }}</label>
              <textarea 
                v-model="deleteReason" 
                rows="4" 
                :placeholder="t('profile.deleteReasonPlaceholder')"
                class="w-full theme-input rounded-xl px-4 py-3 text-sm theme-text border resize-none focus:outline-none focus:border-rose-500/40 leading-relaxed"
                style="border-color: var(--border)" 
              />
            </div>

            <p v-if="deleteError"
              class="text-sm text-rose-400 mb-6 bg-rose-500/10 py-2.5 px-4 rounded-xl border border-rose-500/15">
              {{ deleteError }}
            </p>

            <div v-if="deleteSuccess"
              class="text-sm text-emerald-400 mb-6 bg-emerald-500/10 py-2.5 px-4 rounded-xl border border-emerald-500/15">
              {{ t('profile.deleteSuccess') }}
            </div>

            <div class="flex gap-3">
              <button 
                @click="closeDeleteModal"
                class="flex-1 py-3 rounded-xl theme-card theme-border theme-sub text-sm font-semibold hover:theme-text transition-colors"
              >
                {{ t('common.cancel') }}
              </button>
              <button 
                @click="submitDeletion" 
                :disabled="deleteLoading || deleteSuccess"
                class="flex-1 py-3 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-500 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg v-if="deleteLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {{ deleteLoading ? t('profile.deleting') : t('profile.confirmDelete') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import AppLayout from '../components/AppLayout.vue'
import { useAuthStore } from '../stores/authStore'
import api from '../api/client'
import brandApi from '../api/brandApi'

const { t } = useI18n()
const authStore = useAuthStore()

// Password visibility toggles
const showCurrentPass = ref(false)
const showNewPass = ref(false)
const showConfirmPass = ref(false)

// Profile Form State
const profileForm = ref({ name: '' })
const profileLoading = ref(false)
const profileMsg = ref(null)

// Password Form State
const passwordForm = ref({ current: '', new: '', confirm: '' })
const passwordLoading = ref(false)
const passwordMsg = ref(null)

// Brands State
const brands = ref([])
const brandsLoading = ref(true)
const deleteBrandTarget = ref(null)
const brandDeleting = ref(false)

// Delete Account State
const showDeleteModal = ref(false)
const deleteReason = ref('')
const deleteLoading = ref(false)
const deleteError = ref(null)
const deleteSuccess = ref(false)

const toasts = ref([])
let toastId = 0
function showToast(message, type = 'success') {
  const id = ++toastId
  toasts.value.push({ id, message, type })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

onMounted(async () => {
  if (authStore.user) {
    profileForm.value.name = authStore.user.name || ''
  }
  await fetchBrands()
})

// Fetch user's brands
async function fetchBrands() {
  brandsLoading.value = true
  try {
    const response = await brandApi.getMyBrands()
    brands.value = Array.isArray(response) ? response : []
  } catch (err) {
    console.error('Failed to fetch brands:', err)
    brands.value = []
  } finally {
    brandsLoading.value = false
  }
}

// Confirm brand deletion
function confirmDeleteBrand(brand) {
  deleteBrandTarget.value = brand
}

// Delete brand
async function deleteBrand() {
  if (!deleteBrandTarget.value) return
  
  brandDeleting.value = true
  try {
    await brandApi.deleteBrand(deleteBrandTarget.value._id)
    brands.value = brands.value.filter(b => b._id !== deleteBrandTarget.value._id)
    deleteBrandTarget.value = null
  } catch (err) {
    console.error('Failed to delete brand:', err)
    showToast(t('profile.deleteBrandFailed'), 'error')
  } finally {
    brandDeleting.value = false
  }
}

// Update Profile Name
async function updateProfile() {
  profileLoading.value = true
  profileMsg.value = null
  try {
    await api.put('/auth/profile', { name: profileForm.value.name })
    
    if (authStore.user) authStore.user.name = profileForm.value.name
    
    profileMsg.value = { type: 'success', text: t('profile.updateSuccess') }
  } catch (err) {
    profileMsg.value = { type: 'error', text: err.response?.data?.message || err.message || t('profile.updateFailed') }
  } finally {
    profileLoading.value = false
    setTimeout(() => { profileMsg.value = null }, 4000)
  }
}

// Update Password
async function updatePassword() {
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    passwordMsg.value = { type: 'error', text: t('profile.passwordMismatch') }
    setTimeout(() => { passwordMsg.value = null }, 4000)
    return
  }
  if (passwordForm.value.new.length < 6) {
    passwordMsg.value = { type: 'error', text: t('profile.passwordTooShort') }
    setTimeout(() => { passwordMsg.value = null }, 4000)
    return
  }

  passwordLoading.value = true
  passwordMsg.value = null
  try {
    await api.put('/auth/change-password', {
      currentPassword: passwordForm.value.current,
      newPassword: passwordForm.value.new
    })
    passwordMsg.value = { type: 'success', text: t('profile.passwordSuccess') }
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (err) {
    passwordMsg.value = { type: 'error', text: err.response?.data?.message || err.message || t('profile.passwordFailed') }
  } finally {
    passwordLoading.value = false
    setTimeout(() => { passwordMsg.value = null }, 4000)
  }
}

// Delete Account functions
function closeDeleteModal() {
  showDeleteModal.value = false
  deleteReason.value = ''
  deleteError.value = null
  deleteSuccess.value = false
}

async function submitDeletion() {
  deleteLoading.value = true
  deleteError.value = null
  try {
    await api.post('/auth/deletion-request', { reason: deleteReason.value })
    deleteSuccess.value = true
    setTimeout(() => {
      closeDeleteModal()
    }, 2000)
  } catch (err) {
    deleteError.value = err.response?.data?.message || err.message || t('profile.deleteFailed')
  } finally {
    deleteLoading.value = false
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