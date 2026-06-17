// src/composables/useLang.js
import { useI18n } from 'vue-i18n'

export function useLang() {
  const { locale } = useI18n()

  function switchLang() {
    const newLang = locale.value === 'en' ? 'ar' : 'en'
    locale.value = newLang
    localStorage.setItem('cf-locale', newLang)
    document.documentElement.setAttribute('dir', newLang === 'ar' ? 'rtl' : 'ltr')
    document.documentElement.setAttribute('lang', newLang)
  }

  return { locale, switchLang }
}