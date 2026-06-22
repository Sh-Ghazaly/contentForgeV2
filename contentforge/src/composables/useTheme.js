import { ref } from 'vue'

const stored = localStorage.getItem('cf-theme')
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
const initialDark = stored ? stored === 'dark' : prefersDark

const isDark = ref(initialDark)

if (isDark.value) {
  document.documentElement.classList.add('dark')
  document.documentElement.classList.remove('light')
} else {
  document.documentElement.classList.add('light')
  document.documentElement.classList.remove('dark')
}

export function useTheme() {
  function toggle() {
    const html = document.documentElement
    if (isDark.value) {
      html.classList.remove('dark')
      html.classList.add('light')
      localStorage.setItem('cf-theme', 'light')
    } else {
      html.classList.remove('light')
      html.classList.add('dark')
      localStorage.setItem('cf-theme', 'dark')
    }
    isDark.value = !isDark.value
  }
  return { isDark, toggle }
}