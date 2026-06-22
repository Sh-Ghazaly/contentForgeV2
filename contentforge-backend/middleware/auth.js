// backend/middleware/auth.js
const jwt  = require('jsonwebtoken')
const { User } = require('../models')

const protect = async (req, res, next) => {
  let token

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' })
    }

    if (req.user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
      });
    }
    const isPaymentRoute = req.originalUrl.includes('/payment');

    const isExemptRoute = isPaymentRoute || req.originalUrl.includes('/auth/me');

    if (
      req.user &&
      !req.user.isAdmin &&
      req.user.plan === "free" &&
      req.user.isTrial &&
      Date.now() > new Date(req.user.planEndsAt) &&
      !isExemptRoute
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your 14-day free trial has expired. Please subscribe to continue.",
        reason: "trial_expired", 
        upgradeUrl: "/trial-expired", 
      });
    }
    if (
      !req.user.isAdmin && 
      req.user.planEndsAt && 
      new Date() > new Date(req.user.planEndsAt)&&
      !isExemptRoute
    ) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please renew your plan to continue.",
        reason: "subscription_expired", 
        upgradeUrl: "/billing" 
      });
    }

    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — invalid or expired token' })
  }
}

module.exports = protect