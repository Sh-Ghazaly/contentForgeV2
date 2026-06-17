// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authApi from '../api/authApi'
import i18n from '../locales/i18n.js'

export const useAuthStore = defineStore('auth', () => {

  // ── State ─────────────────────────────────────────────────────────────────
  const user = ref(authApi.getUser())   // Load from localStorage on start
  const loading = ref(false)
  const error = ref(null)

  // ── Getters ───────────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!user.value)
  const userName = computed(() => {
    void i18n.global.locale.value
    return user.value?.name || i18n.global.t('auth.guest')
  })
  const userPlan = computed(() => {
    void i18n.global.locale.value
    const plan = user.value?.plan || 'free'
    return i18n.global.t(`auth.plan.${plan}`, plan)
  })

  const userInitial = computed(() => user.value?.name?.[0]?.toUpperCase() || '?')

  // ── Actions ───────────────────────────────────────────────────────────────
  async function login(credentials) {
    loading.value = true
    error.value = null
    try {
      const data = await authApi.login(credentials)
      user.value = data.user

      // ← الإضافة هنا
      if (data.user?.isAdmin) {
        window.location.href = '/admin'
      } else {
        window.location.href = '/dashboard'
      }

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(credentials) {
    loading.value = true
    error.value = null
    try {
      const data = await authApi.register(credentials)
      user.value = data.user
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function refreshUser() {
    try {
      const freshUser = await authApi.getProfile();
      user.value = freshUser;

      // تحديث localStorage
      localStorage.setItem("cf_user", JSON.stringify(freshUser));

      console.log("✅ User data refreshed:", freshUser.plan);
      return freshUser;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      throw err;
    }
  }

  function logout() {
    user.value = null
    authApi.logout()
  }

  return { user, loading, error, isLoggedIn, userName, userPlan, userInitial, login, register, logout, refreshUser }
})
