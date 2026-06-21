// src/api/calendarApi.js
import api from './client'

const calendarApi = {

  async generate({ brandId, brief, dialect, platforms, startDate, endDate, duration }) {
    return await api.post('/calendar/generate', {
      brandId, brief, dialect, platforms,
      startDate, 
      endDate, 
      duration
    })
  },

  async getCalendar(calendarId) {
    return await api.get(`/calendar/${calendarId}`)
  },

  async getBrandCalendars(brandId) {
    return await api.get(`/calendar/brand/${brandId}`)
  },

  async approveCalendar(calendarId) {
    return await api.post(`/calendar/${calendarId}/approve`)
  },

  async deleteCalendar(calendarId) {
    return await api.delete(`/calendar/${calendarId}`)
  },

  async resetCalendar(calendarId) {
    return await api.post(`/calendar/${calendarId}/reset`)
  },
}

export default calendarApi
