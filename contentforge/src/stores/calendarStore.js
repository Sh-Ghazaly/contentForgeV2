// src/stores/calendarStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { calendarApi, postsApi } from '../api'
import i18n from '../locales/i18n.js'

export const useCalendarStore = defineStore('calendar', () => {

  // ── State ─────────────────────────────────────────────────────────────────
  const calendar = ref(null)
  const posts = ref([])
  const isGenerating = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const lastSaved = ref(null)

  // ── Generate a new calendar from the backend ──────────────────────────────
  async function generate(payload) {
    isGenerating.value = true
    error.value = null
    try {
      const data = await calendarApi.generate(payload)
      calendar.value = data.calendar
      posts.value = data.posts
      lastSaved.value = new Date()
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isGenerating.value = false
    }
  }

  // ── Load an existing calendar ─────────────────────────────────────────────
  async function loadCalendar(calendarId) {
    isLoading.value = true
    error.value = null
    try {
      const data = await calendarApi.getCalendar(calendarId)
      calendar.value = data
      posts.value = data.posts || []
    } catch (err) {
      error.value = err.message
    } finally {
      isLoading.value = false
    }
  }

  // ── Update a post's status (optimistic update) ────────────────────────────
  async function updatePostStatus(postId, status) {
    // 1. Update locally first so UI feels instant
    const post = posts.value.find(p => p._id === postId)
    if (post) {
      const oldStatus = post.status
      post.status = status
      try {
        // 2. Confirm with server
        await postsApi.updateStatus(postId, status)
      } catch (err) {
        // 3. Revert if server fails
        post.status = oldStatus
        throw err
      }
    }
  }

  // ── Update post copy ──────────────────────────────────────────────────────
  async function updatePost(postId, updates) {
    await postsApi.updatePost(postId, updates)
    const post = posts.value.find(p => p._id === postId)
    if (post) Object.assign(post, updates)
  }

  // ── Get A/B variant B for a post ─────────────────────────────────────────
  async function getVariantB(postId) {
    const variantB = await postsApi.generateVariantB(postId)
    const post = posts.value.find(p => p._id === postId)
    if (post) post.variantB = variantB
    return variantB
  }

  // ── Approve all posts ─────────────────────────────────────────────────────
  async function approveAll() {
    await calendarApi.approveCalendar(calendar.value._id)
    posts.value.forEach(p => { if (p.status === 'pending_review') p.status = 'approved' })
    lastSaved.value = new Date()
  }

  // ── Delete a post ─────────────────────────────────────────────────────────
  async function deletePost(postId) {
    await postsApi.deletePost(postId)
    posts.value = posts.value.filter(p => p._id !== postId)
  }


  // ── Move a post to a new date (drag-and-drop) ──────────────────────────
  async function movePostDate(postId, newTargetDate) {
    const post = posts.value.find(p => p._id === postId)
    if (!post) return

    // 1. Keep track of the original date for potential rollback
    const originalDate = post.date || post.scheduledAt

    // 2. Update in memory instantly (optimistic update)
    post.date = newTargetDate
    post.scheduledAt = newTargetDate

    try {
      // 3. Persist the change to the database
      await postsApi.schedulePost(postId, newTargetDate)
    } catch (err) {
      // 4. Revert both if server fails
      post.date = originalDate
      post.scheduledAt = originalDate
      error.value = i18n.global.t('dashboard.moveFailed')
      console.error(err)
    }
  }

  // ── Reset Calendar State ────────────────────────────────────────────────
  async function resetCalendar(calendarId) {
    isLoading.value = true // reusing isLoading indicator
    error.value = null
    try {
      const updatedCalendarData = await calendarApi.resetCalendar(calendarId)

      // Replace active Pinia memory arrays with fresh restored payloads from DB
      calendar.value = updatedCalendarData
      posts.value = updatedCalendarData.posts || []
      lastSaved.value = new Date()

      return updatedCalendarData
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    calendar, posts, isGenerating, isLoading, error, lastSaved,
    generate, loadCalendar, updatePostStatus, updatePost, getVariantB, approveAll, deletePost, movePostDate, resetCalendar
  }
})
