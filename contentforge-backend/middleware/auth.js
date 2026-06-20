// // backend/middleware/auth.js
// const jwt  = require('jsonwebtoken')
// const { User } = require('../models')

// const protect = async (req, res, next) => {
//   let token

//   if (req.headers.authorization?.startsWith('Bearer')) {
//     token = req.headers.authorization.split(' ')[1]
//   }

//   if (!token) {
//     return res.status(401).json({ message: 'Not authorized — no token provided' })
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET)
//     req.user = await User.findById(decoded.id).select('-password')
    
//     if (!req.user) {
//       return res.status(401).json({ message: 'User not found' })
//     }

//     // 1. حظر
//     if (req.user.isBlocked) {
//       return res.status(403).json({ 
//         success: false, 
//         // reason: 'blocked',                                    // ← أضفنا reason
//         // redirectUrl: '/account-suspended'                     // ← الفرونت يعمل redirect
//       })
//     }

//     // 2. Trial expired
//     if (
//       !req.user.isAdmin &&
//       req.user.plan === 'free' &&
//       req.user.isTrial &&
//       Date.now() > new Date(req.user.planEndsAt)
//     ) {
//       return res.status(403).json({
//         success: false,
//         reason: 'trial_expired',
//         // message: 'Your free trial has expired. Please subscribe to continue.',
//         redirectUrl: '/trial-expired'
//       })
//     }

//     // 3. Subscription expired
//     if (
//       !req.user.isAdmin &&
//       req.user.planEndsAt &&
//       new Date() > new Date(req.user.planEndsAt)
//     ) {
//       return res.status(403).json({
//         success: false,
//         reason: 'subscription_expired',
//         message: 'Your subscription has expired. Please renew your plan to continue.',
//         redirectUrl: '/billing'
//       })
//     }

//     next()
//   } catch (err) {
//     return res.status(401).json({ success: false, message: 'Not authorized — invalid or expired token' })
//   }
// }

// module.exports = protect  

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

    // 1. التحقق من الحظر (isBlocked)
    if (req.user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        // message: 'تم حظر حسابك، يرجى التواصل مع الدعم الفني.' 
      });
    }

    // ✅ ALLOW payment routes even if trial/subscription expired
    const isPaymentRoute = req.path.startsWith('/payment');
     
    // ----------------------------------------------------
    // الحتة السحرية الجديدة هنا:
    // بنشيك لو الحساب لسه في فترة التجربة (isTrial) والتاريخ الحالي أحدث من تاريخ الانتهاء
    if (
      req.user &&
      !req.user.isAdmin &&
      req.user.plan === "free" &&
      req.user.isTrial &&
      Date.now() > new Date(req.user.planEndsAt) &&
      !isPaymentRoute
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your 14-day free trial has expired. Please subscribe to continue.",
        reason: "trial_expired", // ← أضف ده
        upgradeUrl: "/trial-expired", // ← أضف ده
      });
    }
    if (
      !req.user.isAdmin && 
      req.user.planEndsAt && 
      new Date() > new Date(req.user.planEndsAt)&&
      !isPaymentRoute
    ) {
      return res.status(403).json({
        success: false,
        message: "Your subscription has expired. Please renew your plan to continue.",
        reason: "subscription_expired", 
        upgradeUrl: "/billing" // توجيه لصفحة الدفع أو تجديد الباقة
      });
    }
    // ----------------------------------------------------

    next()
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized — invalid or expired token' })
  }
}

module.exports = protect // متنساش تعملها export لو مش معمولة
