<template>
  <div class="login-page" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
    <!-- Left panel -->
    <div class="login-left">
      <div class="login-left-inner">
        <RouterLink to="/" class="brand">
          <div class="brand-icon">
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L7 12L13 4"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <span class="brand-name">ContentForge</span>
        </RouterLink>

        <div class="left-body">
          <h2 class="left-headline">
            {{ t("auth.leftHeadline") }}<br />
            <span class="left-accent">{{ t("auth.leftAccent") }}</span>
          </h2>
          <p class="left-sub">{{ t("auth.leftSub") }}</p>

          <div class="feature-list">
            <div class="feature-item">
              <div class="feature-dot blue"></div>
              <span>{{ t("auth.feature1") }}</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot teal"></div>
              <span>{{ t("auth.feature2") }}</span>
            </div>
            <div class="feature-item">
              <div class="feature-dot purple"></div>
              <span>{{ t("auth.feature3") }}</span>
            </div>
          </div>
        </div>

        <p class="left-footer">{{ t("auth.copyright") }}</p>
      </div>
    </div>
    <!-- Right panel -->
    <div class="login-right">
      <!-- Back to home — mobile only -->
      <RouterLink to="/" class="back-btn">
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            :d="locale === 'ar' ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'"
          />
        </svg>
        {{ t("auth.backHome") }}
      </RouterLink>

      <div class="top-controls">
        <button @click="switchLang" class="lang-toggle">
          <svg
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zm0 0c-4.97 0-9-4.03-9-9m9 9c4.97 0 9-4.03 9-9M3 12h18M12 3c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9M12 3c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9"
            />
          </svg>
          {{ locale === "en" ? "عربي" : "English" }}
        </button>

        <button
          @click="toggleTheme"
          class="theme-toggle"
          :title="isDark ? t('layout.switchLight') : t('layout.switchDark')"
        >
          <svg
            v-if="isDark"
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <svg
            v-else
            width="15"
            height="15"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        </button>
      </div>

      <div class="form-wrap">
        <!-- OTP view (registration) -->
        <div v-if="showOTP" class="form-inner">
          <div class="form-head">
            <div class="form-icon">📬</div>
            <h1 class="form-title">{{ t("auth.confirmEmail") }}</h1>
            <p class="form-sub">{{ t("auth.otpSubtitle") }}</p>
          </div>

          <div v-if="error" class="alert alert-error">
            <svg
              class="alert-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ error }}
          </div>

          <div v-if="successKey" class="alert alert-success">
            <svg
              class="alert-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ t(successKey) }}
          </div>

          <div class="otp-row" dir="ltr">
            <input
              v-for="(digit, index) in 6"
              :key="index"
              ref="inputRefs"
              v-model="otpInputs[index]"
              type="text"
              maxlength="1"
              class="otp-input"
              @input="handleOtpInput(index, $event)"
              @keydown="handleOtpKeyDown(index, $event)"
            />
          </div>

          <button @click="verifyEmail" :disabled="loading" class="btn-primary">
            <svg v-if="loading" class="spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ loading ? t("auth.verifying") : t("auth.verifyCode") }}
          </button>

          <div class="resend-row">
            <span class="resend-text">{{ t("auth.didntReceive") }}</span>
            <button
              @click="resendOtp"
              :disabled="resendLoading || resendCooldown > 0"
              class="resend-btn"
            >
              <span v-if="resendCooldown > 0"
                >{{ t("auth.resendIn") }} {{ resendCooldown
                }}{{ t("auth.seconds") }}</span
              >
              <span v-else>{{
                resendLoading ? t("auth.sending") : t("auth.resendCode")
              }}</span>
            </button>
          </div>
        </div>

        <!-- FORGOT: Step 1 : Email -->
        <div v-else-if="forgotStep === 'email'" class="form-inner">
          <div class="form-head">
            <div class="form-icon">🔑</div>
            <h1 class="form-title">{{ t("auth.forgotTitle") }}</h1>
            <p class="form-sub">{{ t("auth.forgotSubtitle") }}</p>
          </div>

          <div v-if="error" class="alert alert-error">
            <svg
              class="alert-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ error }}
          </div>

          <div class="field">
            <label>{{ t("auth.email") }}</label>
            <input
              v-model="forgotEmail"
              type="email"
              :placeholder="t('auth.emailPlaceholder')"
              @keyup.enter="sendForgotOtp"
            />
          </div>

          <button
            @click="sendForgotOtp"
            :disabled="loading"
            class="btn-primary"
          >
            <svg v-if="loading" class="spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ loading ? t("auth.sending") : t("auth.sendResetCode") }}
          </button>

          <p class="switch-mode">
            <button
              @click="
                forgotStep = null;
                error = null;
              "
            >
              ← {{ t("auth.backToLogin") }}
            </button>
          </p>
        </div>

        <!-- FORGOT: Step 2 : OTP (reuses verify-email endpoint) -->
        <div v-else-if="forgotStep === 'otp'" class="form-inner">
          <div class="form-head">
            <div class="form-icon">📬</div>
            <h1 class="form-title">{{ t("auth.confirmEmail") }}</h1>
            <p class="form-sub">{{ t("auth.otpSubtitle") }}</p>
          </div>

          <div v-if="error" class="alert alert-error">
            <svg
              class="alert-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ error }}
          </div>

          <div class="otp-row" dir="ltr">
            <input
              v-for="(digit, index) in 6"
              :key="index"
              ref="forgotOtpRefs"
              v-model="forgotOtpInputs[index]"
              type="text"
              maxlength="1"
              class="otp-input"
              @input="handleForgotOtpInput(index, $event)"
              @keydown="handleForgotOtpKeyDown(index, $event)"
            />
          </div>

          <button
            @click="verifyForgotOtp"
            :disabled="loading"
            class="btn-primary"
          >
            <svg v-if="loading" class="spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ loading ? t("auth.verifying") : t("auth.verifyCode") }}
          </button>

          <!-- Resend OTP row -->
          <div class="resend-row">
            <span class="resend-text">{{ t("auth.didntReceive") }}</span>
            <button
              @click="resendForgotOtp"
              :disabled="forgotResendLoading || forgotResendCooldown > 0"
              class="resend-btn"
            >
              <span v-if="forgotResendCooldown > 0"
                >{{ t("auth.resendIn") }} {{ forgotResendCooldown
                }}{{ t("auth.seconds") }}</span
              >
              <span v-else>{{
                forgotResendLoading ? t("auth.sending") : t("auth.resendCode")
              }}</span>
            </button>
          </div>

          <p class="switch-mode">
            <button
              @click="
                forgotStep = 'email';
                error = null;
              "
            >
              ← {{ t("auth.backToLogin") }}
            </button>
          </p>
        </div>

        <!-- FORGOT: Step 3 : New password (reuses change-password endpoint) -->
        <div v-else-if="forgotStep === 'reset'" class="form-inner">
          <div class="form-head">
            <div class="form-icon">🔒</div>
            <h1 class="form-title">{{ t("auth.newPasswordTitle") }}</h1>
            <p class="form-sub">{{ t("auth.newPasswordSubtitle") }}</p>
          </div>

          <div v-if="error" class="alert alert-error">
            <svg
              class="alert-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ error }}
          </div>

          <div class="field">
            <label>{{ t("profile.newPassword") }}</label>
            <div class="pass-wrap">
              <input
                v-model="resetForm.newPassword"
                :type="showResetPass ? 'text' : 'password'"
                :placeholder="t('auth.passwordPlaceholder')"
                @keyup.enter="submitReset"
                :style="
                  locale === 'ar'
                    ? 'padding: 12px 14px 12px 38px'
                    : 'padding: 12px 38px 12px 14px'
                "
              />
              <button
                @click="showResetPass = !showResetPass"
                type="button"
                class="pass-toggle"
                :style="
                  locale === 'ar'
                    ? 'right: auto; left: 12px'
                    : 'right: 12px; left: auto'
                "
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <template v-if="showResetPass">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </template>
                  <template v-else>
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </template>
                </svg>
              </button>
            </div>
          </div>

          <div class="field">
            <label>{{ t("profile.confirmPassword") }}</label>
            <div class="pass-wrap">
              <input
                v-model="resetForm.confirmPassword"
                :type="showResetConfirm ? 'text' : 'password'"
                :placeholder="t('auth.confirmPasswordPlaceholder')"
                @keyup.enter="submitReset"
                :style="
                  locale === 'ar'
                    ? 'padding: 12px 14px 12px 38px'
                    : 'padding: 12px 38px 12px 14px'
                "
              />
              <button
                @click="showResetConfirm = !showResetConfirm"
                type="button"
                class="pass-toggle"
                :style="
                  locale === 'ar'
                    ? 'right: auto; left: 12px'
                    : 'right: 12px; left: auto'
                "
              >
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <template v-if="showResetConfirm">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </template>
                  <template v-else>
                    <path
                      d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                    />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </template>
                </svg>
              </button>
            </div>
          </div>

          <button @click="submitReset" :disabled="loading" class="btn-primary">
            <svg v-if="loading" class="spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ loading ? t("auth.resetting") : t("auth.resetPassword") }}
          </button>
        </div>

        <!-- Login / Register view -->
        <div v-else class="form-inner">
          <div class="form-head">
            <h1 class="form-title">
              {{ isRegister ? t("auth.createAccount") : t("auth.welcomeBack") }}
            </h1>
            <p class="form-sub">
              {{
                isRegister
                  ? t("auth.registerSubtitle")
                  : t("auth.loginSubtitle")
              }}
            </p>
          </div>

          <div v-if="error" class="alert alert-error">
            <svg
              class="alert-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ error }}
          </div>

          <div v-if="successKey" class="alert alert-success">
            <svg
              class="alert-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ t(successKey) }}
          </div>

          <div class="fields">
            <div v-if="isRegister" class="field-row">
              <div class="field">
                <label>{{ t("auth.fullName") }}</label>
                <input
                  v-model="form.name"
                  type="text"
                  :placeholder="t('auth.fullNamePlaceholder')"
                  @keyup.enter="submit"
                />
              </div>
              <div class="field">
                <label>{{ t("auth.phone") }}</label>
                <input
                  v-model="form.phone"
                  type="tel"
                  :placeholder="t('auth.phonePlaceholder')"
                  @keyup.enter="submit"
                />
              </div>
            </div>

            <div class="field">
              <label>{{ t("auth.email") }}</label>
              <input
                v-model="form.email"
                type="email"
                :placeholder="t('auth.emailPlaceholder')"
                @keyup.enter="submit"
              />
            </div>

            <div class="field">
              <label>{{ t("auth.password") }}</label>
              <div class="pass-wrap">
                <input
                  v-model="form.password"
                  :type="showPass ? 'text' : 'password'"
                  :placeholder="t('auth.passwordPlaceholder')"
                  @keyup.enter="submit"
                  :style="
                    locale === 'ar'
                      ? 'padding: 12px 14px 12px 38px'
                      : 'padding: 12px 38px 12px 14px'
                  "
                />
                <button
                  @click="showPass = !showPass"
                  type="button"
                  class="pass-toggle"
                  :style="
                    locale === 'ar'
                      ? 'right: auto; left: 12px'
                      : 'right: 12px; left: auto'
                  "
                >
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <template v-if="showPass">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </template>
                    <template v-else>
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                      />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </template>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Forgot password link — login only -->
            <div
              v-if="!isRegister"
              class="flex justify-end"
              style="margin-top: -6px"
            >
              <button
                @click="
                  forgotStep = 'email';
                  error = null;
                "
                type="button"
                class="forgot-link"
              >
                {{ t("auth.forgotPassword") }}
              </button>
            </div>

            <div class="field" v-if="isRegister">
              <label>{{ t("auth.confirmPassword") }}</label>
              <div class="pass-wrap">
                <input
                  v-model="form.confirmPassword"
                  :type="showConfirmPass ? 'text' : 'password'"
                  :placeholder="t('auth.confirmPasswordPlaceholder')"
                  @keyup.enter="submit"
                  :style="
                    locale === 'ar'
                      ? 'padding: 12px 14px 12px 38px'
                      : 'padding: 12px 38px 12px 14px'
                  "
                />
                <button
                  @click="showConfirmPass = !showConfirmPass"
                  type="button"
                  class="pass-toggle"
                  :style="
                    locale === 'ar'
                      ? 'right: auto; left: 12px'
                      : 'right: 12px; left: auto'
                  "
                >
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <template v-if="showConfirmPass">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </template>
                    <template v-else>
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                      />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </template>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <button @click="submit" :disabled="loading" class="btn-primary">
            <svg v-if="loading" class="spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{
              loading
                ? isRegister
                  ? t("auth.creatingAccount")
                  : t("auth.signingIn")
                : isRegister
                  ? t("auth.createAccountBtn")
                  : t("auth.signIn")
            }}
          </button>

          <p class="switch-mode">
            {{
              isRegister ? t("auth.alreadyHaveAccount") : t("auth.noAccount")
            }}
            <button
              @click="
                isRegister = !isRegister;
                error = null;
                successKey = null;
              "
            >
              {{ isRegister ? t("auth.signInLink") : t("auth.createOne") }}
            </button>
          </p>
        </div>
        <SocialLoginButtons v-if="!showOTP && !forgotStep" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/authStore";
import { useI18n } from "vue-i18n";
import { useLang } from "../composables/useLang.js";
import { useTheme } from "../composables/useTheme.js";
import api from "../api/client";
import authApi from "../api/authApi";
import paymentApi from "../api/paymentApi.js";
import SocialLoginButtons from "../components/SocialLoginButtons.vue";

const { t } = useI18n();
const { locale, switchLang } = useLang();
const { isDark, toggle: toggleTheme } = useTheme();
const router = useRouter();
const route = useRoute();

const targetPlan = route.query.plan; 
const targetBilling = route.query.billing; 
const redirectPath = route.query.redirect; 

const authStore = useAuthStore();

const showOTP = ref(false);
const otpCode = ref("");
const isRegister = ref(false);
const showPass = ref(false);
const showConfirmPass = ref(false);
const loading = ref(false);
const error = ref(null);
const successKey = ref(null);
const serverOnline = ref(false);
const apiUrl =
  import.meta.env.VITE_API_URL || "https://content-forge-v2.vercel.app/api";
const form = ref({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
});
const otpInputs = ref(["", "", "", "", "", ""]);
const inputRefs = ref([]);

const resendLoading = ref(false);
const resendCooldown = ref(0);
let cooldownTimer = null;

const forgotStep = ref(null); 
const forgotEmail = ref("");
const forgotOtpInputs = ref(["", "", "", "", "", ""]);
const forgotOtpRefs = ref([]);
const forgotResendLoading = ref(false);
const forgotResendCooldown = ref(0);
let forgotCooldownTimer = null;

const showResetPass = ref(false);
const showResetConfirm = ref(false);
const resetForm = ref({ newPassword: "", confirmPassword: "" });

const handleOtpInput = (index, event) => {
  if (event.target.value && index < 5) inputRefs.value[index + 1].focus();
};
const handleOtpKeyDown = (index, event) => {
  if (event.key === "Backspace" && !otpInputs.value[index] && index > 0)
    inputRefs.value[index - 1].focus();
};

function handleForgotOtpInput(index, event) {
  if (event.target.value && index < 5) forgotOtpRefs.value[index + 1]?.focus();
}
function handleForgotOtpKeyDown(index, event) {
  if (event.key === "Backspace" && !forgotOtpInputs.value[index] && index > 0)
    forgotOtpRefs.value[index - 1]?.focus();
}



onMounted(async () => {
  try {
    await api.get("/health");
    serverOnline.value = true;
  } catch {
    serverOnline.value = false;
  }
});

async function resendOtp() {
  resendLoading.value = true;
  error.value = null;
  try {
    await api.post("/auth/resend-otp", { email: form.value.email });
    successKey.value = "auth.otpResent";
    otpInputs.value = ["", "", "", "", "", ""];
    setTimeout(() => inputRefs.value[0]?.focus(), 50);
    resendCooldown.value = 10;
    cooldownTimer = setInterval(() => {
      resendCooldown.value--;
      if (resendCooldown.value <= 0) clearInterval(cooldownTimer);
    }, 1000);
  } catch (err) {
    error.value = err.message;
  } finally {
    resendLoading.value = false;
  }
}

async function resendForgotOtp() {
  forgotResendLoading.value = true;
  error.value = null;
  try {
    await authApi.sendResetOtp({ email: forgotEmail.value });
    forgotOtpInputs.value = ["", "", "", "", "", ""];
    await nextTick();
    forgotOtpRefs.value[0]?.focus();
    forgotResendCooldown.value = 10;
    forgotCooldownTimer = setInterval(() => {
      forgotResendCooldown.value--;
      if (forgotResendCooldown.value <= 0) clearInterval(forgotCooldownTimer);
    }, 1000);
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || t("auth.errorGeneric");
  } finally {
    forgotResendLoading.value = false;
  }
}


async function handlePostLoginRedirect(user) {
  const targetPlan = route.query.plan;
  const targetBilling = route.query.billing;
  const targetRedirect = route.query.redirect;

  if (user?.isAdmin) { router.push("/admin"); return; }

  if (user?.trialExpired) { router.push("/trial-expired"); return; }

  if (targetPlan && targetPlan !== 'free' && targetBilling) {
    try {
      const paymentKey = `${targetPlan}_${targetBilling}`;
      const url = await paymentApi.checkout(paymentKey, { from: "login_redirect" });
      if (url) { window.location.href = url; return; }
    } catch (e) { console.error("Checkout failed:", e); }
  }

  if (targetRedirect && typeof targetRedirect === 'string' && targetRedirect.startsWith('/')) {
    router.push(targetRedirect);
  } else {
    router.push("/dashboard");
  }
}


async function submit() {
  error.value = null;
  if (!form.value.email || !form.value.password) { error.value = t("auth.errorFillAll"); return; }
  
  if (isRegister.value) {
    if (!form.value.name || !form.value.phone || !form.value.confirmPassword) { error.value = t("auth.errorFillAll"); return; }
    if (!form.value.email.includes("@")) { error.value = t("auth.wrongMail"); return; }
    if (form.value.password !== form.value.confirmPassword) { error.value = t("auth.errorPasswordMismatch"); return; }
  }

  loading.value = true;
  try {
    if (isRegister.value) {
      await authStore.register(form.value);
      successKey.value = "auth.checkEmail";
      showOTP.value = true;
    } else {
      await authStore.login(form.value);
      await nextTick();
      
      if (localStorage.getItem("cf_token")) {
        const user = JSON.parse(localStorage.getItem("cf_user") || "{}");
        await handlePostLoginRedirect(user);
      } else {
        error.value = t("auth.errorTokenMissing");
      }
    }
  } catch (err) {
    error.value = err.message || t("auth.errorGeneric");
  } finally {
    loading.value = false;
  }
}


async function verifyEmail() {
  error.value = null;
  loading.value = true;
  try {
    await api.post("/auth/verify-email", {
      email: form.value.email,
      code: otpInputs.value.join(""),
    });
    successKey.value = "auth.verifiedSuccess";
    
    await authStore.login(form.value); 
    await nextTick();
    
    if (localStorage.getItem("cf_token")) {
      const user = JSON.parse(localStorage.getItem("cf_user") || "{}");
      await handlePostLoginRedirect(user); 
    }
  } catch (err) {
    error.value = err.response?.data?.message || t("auth.errorInvalidCode");
  } finally {
    loading.value = false;
  }
}

async function sendForgotOtp() {
  if (!forgotEmail.value) {
    error.value = t("auth.errorFillAll");
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    await authApi.sendResetOtp({ email: forgotEmail.value });
    forgotStep.value = "otp";
    forgotOtpInputs.value = ["", "", "", "", "", ""];
    forgotResendCooldown.value = 10;
    forgotCooldownTimer = setInterval(() => {
      forgotResendCooldown.value--;
      if (forgotResendCooldown.value <= 0) clearInterval(forgotCooldownTimer);
    }, 1000);
    await nextTick();
    forgotOtpRefs.value[0]?.focus();
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || t("auth.errorGeneric");
  } finally {
    loading.value = false;
  }
}

async function verifyForgotOtp() {
  const otp = forgotOtpInputs.value.join("");
  if (otp.length < 6) {
    error.value = t("auth.errorFillAll");
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    await authApi.verifyResetOtp({
      email: forgotEmail.value,
      otp: otp,
    });
    forgotStep.value = "reset";
    error.value = null;
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || t("auth.errorInvalidCode");
  } finally {
    loading.value = false;
  }
}

async function submitReset() {
  if (!resetForm.value.newPassword || !resetForm.value.confirmPassword) {
    error.value = t("auth.errorFillAll");
    return;
  }
  if (resetForm.value.newPassword !== resetForm.value.confirmPassword) {
    error.value = t("auth.errorPasswordMismatch");
    return;
  }
  if (resetForm.value.newPassword.length < 6) {
    error.value = t("profile.passwordTooShort");
    return;
  }

  loading.value = true;
  error.value = null;
  try {
    await authApi.resetPassword({
      email: forgotEmail.value,
      otp: forgotOtpInputs.value.join(""),
      newPassword: resetForm.value.newPassword,
    });

    localStorage.removeItem("cf_token");
    localStorage.removeItem("cf_user");

    window.location.href = "/login?reset=success";
  } catch (err) {
    error.value =
      err.response?.data?.message || err.message || t("auth.errorGeneric");
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg);
}

.resend-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 12px;
}

.resend-text {
  font-size: 12px;
  color: var(--sub, #6b7280);
}

.resend-btn {
  font-size: 12px;
  color: #60a5fa;
  background: none;
  border: none;
  cursor: pointer;
}

.resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.login-left {
  background: var(--surface);
  border-inline-end: 1px solid var(--border);
  display: flex;
  align-items: stretch;
  position: relative;
}

.login-left::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.06);
  pointer-events: none;
}

.login-left-inner {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 2.5rem 3rem;
  width: 100%;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #14b8a6);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
}

.left-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  padding: 3rem 0;
}

.left-headline {
  font-size: 32px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.25;
  margin: 0;
}

.left-accent {
  color: #60a5fa;
}

.left-sub {
  font-size: 15px;
  color: var(--sub);
  line-height: 1.7;
  margin: 0;
  max-width: 340px;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--muted);
}

.feature-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.feature-dot.blue {
  background: #3b82f6;
}

.feature-dot.teal {
  background: #14b8a6;
}

.feature-dot.purple {
  background: #8b5cf6;
}

.left-footer {
  font-size: 12px;
  color: var(--muted);
}

.login-right {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--surface);
}

.top-controls {
  position: absolute;
  top: 1.25rem;
  inset-inline-end: 1.25rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.lang-toggle,
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--sub);
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.lang-toggle:hover,
.theme-toggle:hover {
  color: var(--text);
  border-color: var(--border-hover, rgba(255, 255, 255, 0.2));
}

.theme-toggle {
  padding: 6px 8px;
}

.form-wrap {
  width: 100%;
  max-width: 420px;
}

.form-inner {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-head {
  margin-bottom: 0.25rem;
}

.form-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  margin: 0 0 6px;
}

.form-sub {
  font-size: 14px;
  color: var(--sub);
  margin: 0;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
}

.alert-error {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #f87171;
}

.alert-success {
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #059669;
}

.alert-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field label {
  font-size: 12px;
  font-weight: 500;
  color: var(--sub);
}

.field input,
.pass-wrap input {
  width: 100%;
  padding: 12px 38px 12px 14px;
  border-radius: 10px;
  background: var(--input, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}

.login-page[dir="rtl"] .field input,
.login-page[dir="rtl"] .pass-wrap input {
  padding: 12px 14px 12px 38px;
}

.field input:focus,
.pass-wrap input:focus {
  border-color: rgba(59, 130, 246, 0.5);
}

.field input::placeholder,
.pass-wrap input::placeholder {
  color: var(--muted);
}

.pass-wrap {
  position: relative;
}

.pass-toggle {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: var(--sub);
  padding: 0;
  display: flex;
  align-items: center;
  width: 20px;
  height: 20px;
}

.pass-toggle:hover {
  color: var(--text);
}

.pass-toggle svg {
  width: 20px;
  height: 20px;
}

.btn-primary {
  width: 100%;
  padding: 13px;
  border-radius: 10px;
  background: #2563eb;
  border: none;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary:hover:not(:disabled) {
  background: #3b82f6;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.forgot-link {
  font-size: 12px;
  color: #60a5fa;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s;
}

.forgot-link:hover {
  color: #93c5fd;
}

.switch-mode {
  text-align: center;
  font-size: 13px;
  color: var(--sub);
  margin: 0;
}

.switch-mode button {
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  margin-inline-start: 4px;
}

.switch-mode button:hover {
  color: #93c5fd;
}

.otp-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.otp-input {
  width: 52px;
  height: 56px;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  border-radius: 10px;
  background: var(--input, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--border);
  color: var(--text);
  outline: none;
  transition: border-color 0.15s;
}

.otp-input:focus {
  border-color: rgba(99, 102, 241, 0.6);
}

.spin {
  width: 16px;
  height: 16px;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.back-btn {
  display: none;
}

@media (max-width: 768px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .login-left {
    display: none;
  }

  .login-right {
    min-height: 100vh;
    padding: 2rem 1.5rem;
    align-items: flex-start;
    padding-top: 4.5rem;
  }

  .form-wrap {
    max-width: 100%;
  }

  .field-row {
    grid-template-columns: 1fr;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    position: absolute;
    top: 1.25rem;
    inset-inline-start: 1.25rem;
    font-size: 13px;
    color: var(--sub);
    text-decoration: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 10px;
    transition: all 0.15s;
  }

  .back-btn:hover {
    color: var(--text);
    border-color: var(--border-hover, rgba(255, 255, 255, 0.2));
  }
}
</style>
