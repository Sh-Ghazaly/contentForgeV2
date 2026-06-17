import { ref } from 'vue'

const isDark = ref(document.documentElement.classList.contains('dark') || !document.documentElement.classList.contains('light'))

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
