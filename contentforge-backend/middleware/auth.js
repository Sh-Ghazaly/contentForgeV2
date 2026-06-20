// backend/middleware/auth.js
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

    // ✅ CHECK 1: الحظر (isBlocked) - ده مسموح بيه
    if (req.user.isBlocked) {
      return res.status(403).json({ 
        success: false, 
        reason: 'blocked',
        message: 'تم حظر حسابك، يرجى التواصل مع الدعم الفني.' 
      });
    }

    // ✅ CHECK 2: السماح بكل routes الدفع والـ billing دائماً
    const isPaymentOrBillingRoute = 
      req.path.startsWith('/payment') || 
      req.path.startsWith('/billing') ||
      req.path.startsWith('/subscription');
    
    // ✅ لو في route دفع، اسمح بيه فوراً (بعد ما جبت الـ user)
    if (isPaymentOrBillingRoute) {
      console.log(`✅ Allowing payment/billing route: ${req.path}`);
      return next();
    }

    // ✅ CHECK 3: Trial expired (للمستخدمين العاديين)
    if (
      req.user &&
      !req.user.isAdmin &&
      req.user.plan === "free" &&
      req.user.isTrial &&
      Date.now() > new Date(req.user.planEndsAt)
    ) {
      return res.status(403).json({
        success: false,
        message: "Your 14-day free trial has expired. Please subscribe to continue.",
        reason: "trial_expired",
        upgradeUrl: "/trial-expired",
      });
    }
    
    // ✅ CHECK 4: Subscription expired (للمستخدمين العاديين)
    if (
      !req.user.isAdmin && 
      req.user.planEndsAt && 
      new Date() > new Date(req.user.planEndsAt)
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