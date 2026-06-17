// src/api/paymentApi.js
import api from './client'

export default {
  // فتح Stripe Checkout للاشتراك
  async checkout(planKey) {
    const data = await api.post('/payment/checkout', { planKey })
    return data.url   // redirect to Stripe
  },

  // فتح Stripe Customer Portal (إدارة / إلغاء)
  async openPortal() {
    const data = await api.post('/payment/portal')
    return data.url
  },

  // جلب حالة الاشتراك الحالية
  async getStatus() {
    return await api.get('/payment/status')
  },

  async confirmPayment(sessionId) {
    return await api.get(`/payment/confirm?session_id=${sessionId}`)
  }
}
