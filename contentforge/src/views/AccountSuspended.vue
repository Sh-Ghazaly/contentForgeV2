<template>
  <div class="suspended-page">
    <!-- Blocked -->
    <div v-if="reason === 'blocked'" class="state-card blocked">
      <div class="icon-wrap blocked-icon">
        <i class="ti ti-lock"></i>
      </div>
      <h1>Your account has been suspended</h1>
      <p class="subtitle">
            Your account has been suspended by the administration. If you believe this is an error, please contact support.      </p>
      <a href="cforge124@gmail.com" class="action-btn blocked-btn">
        <i class="ti ti-mail"></i>
            Contact Support
      </a>
    </div>

    <!-- Plan Expired -->
    <div v-else-if="reason === 'plan_expired'" class="state-card expired">
      <div class="icon-wrap expired-icon">
        <i class="ti ti-calendar-off"></i>
      </div>
      <h1>Subscription Expired</h1>
      <p class="subtitle">
          Your subscription has expired. Please upgrade your plan to continue using ContentForge.
      </p>
      <router-link to="/PaymentPage" class="action-btn expired-btn">
        <i class="ti ti-sparkles"></i>
        Renew Subscription
      </router-link>
    </div>

    <!-- Fallback -->
    <!-- <div v-else class="state-card">
      <div class="icon-wrap">
        <i class="ti ti-alert-circle"></i>
      </div>
      <h1>الوصول مقيّد</h1>
      <p class="subtitle">لا تملك صلاحية الوصول حالياً.</p>
    </div> -->

    <button @click="logout" class="logout-link">
      <i class="ti ti-logout"></i>
      Log out
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore' 

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const reason = computed(() => route.query.reason || '')

async function logout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.suspended-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: #faf9ff;
  font-family: 'Cairo', sans-serif;
  direction: rtl;
}

.state-card {
  background: #fff;
  border: 0.5px solid #e2e0f0;
  border-radius: 20px;
  padding: 3rem 2.5rem;
  max-width: 440px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
}

.blocked-icon { background: #fbeaf0; color: #993556; }
.expired-icon { background: #faeeda; color: #854f0b; }

h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.subtitle {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.8;
  margin: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.75rem 1.75rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  margin-top: 0.5rem;
  transition: opacity 0.2s;
}
.action-btn:hover { opacity: 0.85; }

.blocked-btn { background: #993556; color: #fff; }
.expired-btn { background: #7c3aed; color: #fff; }

.logout-link {
  margin-top: 1.5rem;
  background: none;
  border: none;
  color: #999;
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: 'Cairo', sans-serif;
  transition: color 0.2s;
}
.logout-link:hover { color: #666; }
</style>