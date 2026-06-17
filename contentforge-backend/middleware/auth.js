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

    // ----------------------------------------------------
    // الحتة السحرية الجديدة هنا:
    // بنشيك لو الحساب لسه في فترة التجربة (isTrial) والتاريخ الحالي أحدث من تاريخ الانتهاء
    if (
      req.user &&
      !req.user.isAdmin &&
      req.user.plan === "free" &&
      req.user.isTrial &&
      Date.now() > new Date(req.user.planEndsAt)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your 14-day free trial has expired. Please subscribe to continue.",
        reason: "trial_expired", // ← أضف ده
        upgradeUrl: "/trial-expired", // ← أضف ده
      });
    }
    // ----------------------------------------------------

    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — invalid or expired token' })
  }
}

module.exports = protect // متنساش تعملها export لو مش معمولة
