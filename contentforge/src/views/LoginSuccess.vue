<<template>
  <div class="login-success">
    <div class="loading-spinner">
      <svg class="spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
    <p>{{ t('auth.loggingYouIn') }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/authStore';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

onMounted(async () => {
  const token = route.query.token;
  const provider = route.query.provider;
  const error = route.query.error;

  if (error) {
    router.push(`/login?error=${error}`);
    return;
  }

  if (token) {
    try {
      // Store token and fetch user data
      localStorage.setItem('cf_token', token);
      
      // Fetch user profile using the token
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch user');
      
      const userData = await response.json();
      
      // Store user data
      localStorage.setItem('cf_user', JSON.stringify({
        ...userData,
        isAdmin: userData.isAdmin,
        trialExpired: userData.isTrial && userData.planEndsAt && new Date() > new Date(userData.planEndsAt),
      }));

      // Update auth store
      authStore.token = token;
      authStore.user = userData;

      // Redirect based on user state
      if (userData.isAdmin) {
        router.push('/admin');
      } else if (userData.isTrial && userData.planEndsAt && new Date() > new Date(userData.planEndsAt)) {
        router.push('/trial-expired');
      } else {
        // Check for payment redirect from query
        const targetPlan = route.query.plan;
        const targetBilling = route.query.billing;
        
        if (targetPlan && targetBilling) {
          try {
            const { default: paymentApi } = await import('../api/paymentApi.js');
            const url = await paymentApi.checkout(`${targetPlan}_${targetBilling}`, { from: 'social_login' });
            if (url) {
              window.location.href = url;
              return;
            }
          } catch (e) {
            console.error('Checkout failed:', e);
          }
        }
        
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Social login error:', err);
      localStorage.removeItem('cf_token');
      localStorage.removeItem('cf_user');
      router.push('/login?error=social_auth_failed');
    }
  } else {
    router.push('/login?error=no_token');
  }
});
</script>

<style scoped>
.login-success {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: var(--bg);
  color: var(--text);
}

.loading-spinner {
  width: 48px;
  height: 48px;
}

.spin {
  width: 100%;
  height: 100%;
  animation: spin 0.8s linear infinite;
  color: #3b82f6;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

p {
  font-size: 14px;
  color: var(--sub);
}
</style>