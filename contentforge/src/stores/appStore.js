import { reactive, computed } from 'vue'
import { i18n } from '@/i18n'

const _notificationDefs = reactive([
  { id: 1, type: 'success', titleKey: 'notifications.calendarGenerated.title', messageKey: 'notifications.calendarGenerated.message', timeKey: 'notifications.time.2minAgo', read: false, icon: '🗓️' },
  { id: 2, type: 'trend',   titleKey: 'notifications.trending.title',          messageKey: 'notifications.trending.message',          timeKey: 'notifications.time.15minAgo', read: false, icon: '🔥' },
  { id: 3, type: 'info',    titleKey: 'notifications.postScheduled.title',     messageKey: 'notifications.postScheduled.message',     timeKey: 'notifications.time.1hrAgo',   read: false, icon: '⏰' },
  { id: 4, type: 'warning', titleKey: 'notifications.reviewNeeded.title',      messageKey: 'notifications.reviewNeeded.message',      timeKey: 'notifications.time.3hrAgo',   read: true,  icon: '⚠️' },
  { id: 5, type: 'success', titleKey: 'notifications.brandVault.title',        messageKey: 'notifications.brandVault.message',        timeKey: 'notifications.time.1dayAgo',  read: true,  icon: '🧠' },
])

export const appStore = reactive({
  // Theme
  darkMode: true,

  // User
  user: { name: 'Noura', brand: 'Araby Coffee', plan: 'pro' },

  // Sidebar collapsed state
  sidebarCollapsed: false,

  // Notifications — resolved computed, re-runs on locale switch
  notifications: computed(() => {
    const t = i18n.global.t
    return _notificationDefs.map(n => ({
      ...n,
      title:   t(n.titleKey),
      message: t(n.messageKey),
      time:    t(n.timeKey),
    }))
  }),

  // Methods
  toggleTheme() {
    this.darkMode = !this.darkMode
    document.documentElement.classList.toggle('dark', this.darkMode)
    document.documentElement.classList.toggle('light', !this.darkMode)
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light')
  },

  markRead(id) {
    const n = _notificationDefs.find(n => n.id === id)
    if (n) n.read = true
  },

  markAllRead() {
    _notificationDefs.forEach(n => n.read = true)
  },

  addNotification({ titleKey, messageKey, timeKey = 'notifications.time.justNow', type = 'info', icon = '🔔' }) {
    _notificationDefs.unshift({
      id: crypto.randomUUID(),
      type,
      icon,
      titleKey,
      messageKey,
      timeKey,
      read: false,
    });

    if (_notificationDefs.length > 50) {
      _notificationDefs.pop();
    }
  },

  get unreadCount() {
    return _notificationDefs.filter(n => !n.read).length
  },

  initTheme() {
    const saved = localStorage.getItem('theme')
    if (saved) {
      this.darkMode = saved === "dark";
    } else {
      // ✅ إذا لم يختر المستخدم ثيم، نستخدم تفضيلات نظام التشغيل
      this.darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    document.documentElement.classList.toggle('dark', this.darkMode)
    document.documentElement.classList.toggle('light', !this.darkMode)
  }
})
