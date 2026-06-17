// src/api/adminApi.js
import api from './client'

const adminApi = {
  getStats:    ()            => api.get('/admin/stats'),
  getUsers:    (params = {}) => api.get('/admin/users',   { params }),
  blockUser:   (id, reason)  => api.put(`/admin/users/${id}/block`, { reason }),
  updateUser:  (id, data)    => api.put(`/admin/users/${id}`, data),
  deleteUser:  (id)          => api.delete(`/admin/users/${id}`),
  getPlans:    ()            => api.get('/admin/plans'),
  getTrends:   ()            => api.get('/admin/trends'),
  approveDeletion: (id) => api.put(`/admin/users/${id}/approve-deletion`),
  getSettings:  ()       => api.get('/admin/settings'),
  saveSettings:    (data)       => api.put('/admin/settings', data).then(r => r.data),
  updateTrialDays: (days)       => api.put('/admin/settings/trial-days', { trialDays: days }).then(r => r.data),
  triggerExpiryWarnings: ()     => api.post('/admin/trigger-expiry-warnings').then(r => r.data),
  // saveSettings: (data)   => api.put('/admin/settings', data),
  // ExpiryWarnings: () => api.post('/admin/settings/expiry-warnings').then(r => r.data),
    // updateTrialDays: (days) => api.put('/admin/settings/trial-days', { trialDays: days }),

}

export default adminApi
