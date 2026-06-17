import { ref, computed, onMounted, onUnmounted } from 'vue'
import i18n from '../locales/i18n.js'
import api from '../api/client'

const notificationDefs = ref([])
const unreadCount = ref(0)

export function useNotifications() {
  async function fetchFromBackend() {
    if (!localStorage.getItem('cf_token')) return
    try {
      const data = await api.get('/auth/notifications')
      const fetched = data.notifications || []
      fetched.forEach(n => {
        const exists = notificationDefs.value.find(x => x.id === n.id)
        if (!exists) {
          notificationDefs.value.unshift(n)
          if (!n.read) unreadCount.value++
        }
      })
    } catch { /* ignore */ }
  }

  const notifications = computed(() =>
    notificationDefs.value.map(n => ({
      ...n,
      title:   n.title   || (n.titleKey   ? i18n.global.t(n.titleKey)   : ''),
      message: n.message || (n.messageKey ? i18n.global.t(n.messageKey) : ''),
      time:    n.time    || (n.timeKey    ? i18n.global.t(n.timeKey)    : ''),
    }))
  )

  function markRead(id) {
    const n = notificationDefs.value.find(x => x.id === id)
    if (n && !n.read) { n.read = true; unreadCount.value = Math.max(0, unreadCount.value - 1) }
  }

  function markAllRead() {
    notificationDefs.value.forEach(n => n.read = true)
    unreadCount.value = 0
  }

  function addNotification(notif) {
    notificationDefs.value.unshift({ id: Date.now(), read: false, ...notif })
    unreadCount.value++
  }

  let interval = null
  onMounted(() => {
    fetchFromBackend()
    interval = setInterval(fetchFromBackend, 5 * 60 * 1000)
  })
  onUnmounted(() => clearInterval(interval))

  return { notifications, unreadCount, markRead, markAllRead, addNotification }
}