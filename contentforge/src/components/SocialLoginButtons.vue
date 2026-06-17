<<template>
  <div class="social-login" :class="{ 'is-dark': isDark }">
    <div class="divider">
      <span class="divider-line"></span>
      <span class="divider-text">{{ t("auth.orContinueWith") }}</span>
      <span class="divider-line"></span>
    </div>

    <div class="social-buttons">
      <!-- Google Button -->
      <button
        @click="loginWithGoogle"
        class="social-btn google"
        :disabled="loading"
      >
        <svg
          class="social-icon"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        <span class="btn-text">{{
          loading && provider === "google"
            ? t("auth.connecting")
            : t("auth.googleSignIn")
        }}</span>
      </button>

      <!-- Facebook Button -->
      <!-- <button 
        @click="loginWithFacebook" 
        class="social-btn facebook"
        :disabled="loading"
      >
        <svg class="social-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
        </svg>
        <span class="btn-text">{{ loading && provider === 'facebook' ? t('auth.connecting') : t('auth.facebookSignIn') }}</span>
      </button> -->
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "../composables/useTheme.js";

const { t } = useI18n();
const { isDark } = useTheme();
const loading = ref(false);
const provider = ref(null);

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function loginWithGoogle() {
  provider.value = "google";
  loading.value = true;
  window.location.href = `${apiUrl}/auth/google`;
}

function loginWithFacebook() {
  provider.value = "facebook";
  loading.value = true;
  window.location.href = `${apiUrl}/auth/facebook`;
}
</script>

<style scoped>
.social-login {
  width: 100%;
}

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: var(--border, #e5e7eb);
}

.divider-text {
  font-size: 13px;
  color: var(--sub, #6b7280);
  white-space: nowrap;
}

.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  direction: ltr;
}

.social-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.social-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.btn-text {
  font-weight: 500;
}

/* ============================================
   LIGHT MODE (default)
   ============================================ */
.social-btn.google {
  background: #ffffff;
  color: #3c4043;
  border: 1px solid #dadce0;
}

.social-btn.google:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #d2e3fc;
  box-shadow: 0 1px 3px rgba(60, 64, 67, 0.08);
}

.social-btn.facebook {
  background: #1877f2;
  color: #ffffff;
  border: 1px solid #1877f2;
}

.social-btn.facebook:hover:not(:disabled) {
  background: #166fe5;
  border-color: #166fe5;
}

/* ============================================
   DARK MODE - .is-dark class on parent
   ============================================ */
.is-dark .social-btn.google {
  background: #1a1a1a;
  color: #e5e7eb;
  border-color: #333;
}

.is-dark .social-btn.google:hover:not(:disabled) {
  background: #2a2a2a;
  border-color: #444;
}

.is-dark .social-btn.facebook {
  background: #1877f2;
  color: #ffffff;
  border-color: #1877f2;
}

.is-dark .social-btn.facebook:hover:not(:disabled) {
  background: #166fe5;
  border-color: #166fe5;
}

/* Divider in dark mode */
.is-dark .divider-line {
  background: #333;
}

.is-dark .divider-text {
  color: #9ca3af;
}
</style>