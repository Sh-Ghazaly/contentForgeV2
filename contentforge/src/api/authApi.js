// src/api/authApi.js
import api from './client'

const authApi = {

  async register({ name, email, password, phone }) {
    const data = await api.post('/auth/register', { name, email, password, phone })
    return data
  },

  async login({ email, password }) {
    const data = await api.post('/auth/login', { email, password })
    localStorage.setItem('cf_token', data.token)
    localStorage.setItem('cf_user', JSON.stringify(data.user))
    return data
  },

  

  logout() {
    localStorage.removeItem('cf_token');
    localStorage.removeItem('cf_user');
    localStorage.removeItem("cf_brandId");
    localStorage.removeItem("cf-locale");
    window.location.href = '/login'
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('cf_user')) || null
    } catch {
      return null
    }
  },

  isLoggedIn() {
    return !!localStorage.getItem('cf_token')
  },

  async getProfile() {
    return await api.get('/auth/me')
  },

  async sendResetOtp({ email }) {
    return await api.post('/auth/send-reset-otp', { email })
  },

  async resetPassword({ email, otp, newPassword }) {
    const data = await api.post('/auth/reset-password', { email, otp, newPassword })
  
    if (data.token) {
      localStorage.setItem('cf_token', data.token)
      localStorage.setItem('cf_user', JSON.stringify(data.user))
    }
    return data
  },

  async verifyResetOtp({ email, otp }) {
    return await api.post('/auth/verify-reset-otp', { email, otp })
  },
}

export default authApi
