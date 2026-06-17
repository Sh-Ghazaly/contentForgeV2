// src/api/calendarApi.js
// Calendar generation and management — the core of ContentForge
import api from './client'

const calendarApi = {

  // ── Generate a new 2-week content calendar ──────────────────────────────────
  // POST /api/calendar/generate
  // Body: { brandId, brief, dialect, platforms[], startDate }
  // Returns: { calendar, posts[] }
  // ⚠️ This calls Gemini 2.5 — may take 10-20 seconds
  async generate({ brandId, brief, dialect, platforms, startDate, endDate, duration }) {
    return await api.post('/calendar/generate', {
      brandId, brief, dialect, platforms,
      startDate, 
      endDate, 
      duration
    })
  },

  // ── Load a calendar by ID (with all posts populated) ───────────────────────
  // GET /api/calendar/:id
  async getCalendar(calendarId) {
    return await api.get(`/calendar/${calendarId}`)
  },

  // ── Get all calendars for a brand ──────────────────────────────────────────
  // GET /api/calendar/brand/:brandId
  async getBrandCalendars(brandId) {
    return await api.get(`/calendar/brand/${brandId}`)
  },

  // ── Approve entire calendar (saves all posts permanently) ──────────────────
  // POST /api/calendar/:id/approve
  async approveCalendar(calendarId) {
    return await api.post(`/calendar/${calendarId}/approve`)
  },

  // ── Delete a calendar ───────────────────────────────────────────────────────
  // DELETE /api/calendar/:id
  async deleteCalendar(calendarId) {
    return await api.delete(`/calendar/${calendarId}`)
  },

  // POST /api/calendar/:id/reset
  async resetCalendar(calendarId) {
    return await api.post(`/calendar/${calendarId}/reset`)
  },
}

export default calendarApi
