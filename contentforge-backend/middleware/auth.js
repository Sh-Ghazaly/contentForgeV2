// backend/middleware/auth.js
const jwt  = require('jsonwebtoken')
const { User } = require('../models')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized — no token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    // 1. حظر
    if (req.user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        reason: 'blocked',                                    // ← أضفنا reason
        message: 'تم حظر حسابك، يرجى التواصل مع الدعم الفني.',
        redirectUrl: '/account-suspended'                     // ← الفرونت يعمل redirect
      })
    }

    // 2. Trial expired
    if (
      !req.user.isAdmin &&
      req.user.plan === 'free' &&
      req.user.isTrial &&
      Date.now() > new Date(req.user.planEndsAt)
    ) {
      return res.status(403).json({
        success: false,
        reason: 'trial_expired',
        message: 'Your free trial has expired. Please subscribe to continue.',
        redirectUrl: '/trial-expired'
      })
    }

    // 3. Subscription expired
    if (
      !req.user.isAdmin &&
      req.user.planEndsAt &&
      new Date() > new Date(req.user.planEndsAt)
    ) {
      return res.status(403).json({
        success: false,
        reason: 'subscription_expired',
        message: 'Your subscription has expired. Please renew your plan to continue.',
        redirectUrl: '/billing'
      })
    }

    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Not authorized — invalid or expired token' })
  }
}

module.exports = protect  
