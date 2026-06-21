// src/stores/calendarStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { calendarApi, postsApi } from '../api'
import i18n from '../locales/i18n.js'

export const useCalendarStore = defineStore('calendar', () => {

  const calendar = ref(null)
  const posts = ref([])
  const isGenerating = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  const lastSaved = ref(null)

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

  async function updatePostStatus(postId, status) {
    const post = posts.value.find(p => p._id === postId)
    if (post) {
      const oldStatus = post.status
      post.status = status
      try {
        await postsApi.updateStatus(postId, status)
      } catch (err) {
        post.status = oldStatus
        throw err
      }
    }
  }

  async function updatePost(postId, updates) {
    await postsApi.updatePost(postId, updates)
    const post = posts.value.find(p => p._id === postId)
    if (post) Object.assign(post, updates)
  }

  async function getVariantB(postId) {
    const variantB = await postsApi.generateVariantB(postId)
    const post = posts.value.find(p => p._id === postId)
    if (post) post.variantB = variantB
    return variantB
  }

  async function approveAll() {
    await calendarApi.approveCalendar(calendar.value._id)
    posts.value.forEach(p => { if (p.status === 'pending_review') p.status = 'approved' })
    lastSaved.value = new Date()
  }

  async function deletePost(postId) {
    await postsApi.deletePost(postId)
    posts.value = posts.value.filter(p => p._id !== postId)
  }


  async function movePostDate(postId, newTargetDate) {
    const post = posts.value.find(p => p._id === postId)
    if (!post) return

    const originalDate = post.date || post.scheduledAt

    post.date = newTargetDate
    post.scheduledAt = newTargetDate

    try {
      await postsApi.schedulePost(postId, newTargetDate)
    } catch (err) {
      post.date = originalDate
      post.scheduledAt = originalDate
      error.value = i18n.global.t('dashboard.moveFailed')
      console.error(err)
    }
  }

  async function resetCalendar(calendarId) {
    isLoading.value = true
    error.value = null
    try {
      const updatedCalendarData = await calendarApi.resetCalendar(calendarId)

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
