// src/api/paymentApi.js
import api from './client'

export default {
  async checkout(planKey) {
    const data = await api.post('/payment/checkout', { planKey })
    return data.url  
  },

  async openPortal() {
    const data = await api.post('/payment/portal')
    return data.url
  },

  async getStatus() {
    return await api.get('/payment/status')
  },

  async confirmPayment(sessionId) {
    return await api.get(`/payment/confirm?session_id=${sessionId}`)
  }
}
