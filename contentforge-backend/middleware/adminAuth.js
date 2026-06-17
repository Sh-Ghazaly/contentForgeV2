// backend/middleware/adminAuth.js
const protect = require('./auth')

const adminOnly = async (req, res, next) => {
  // بنشغل الـ protect بشكل طبيعي وبنديلها دالة للتعامل مع الـ next
  protect(req, res, async (err) => {
    if (err) return next(err); // لو في إيرور مرريه للـ Express

    // لو الـ protect رفضت وبعتت استجابة خلاص، نوقف هنا
    if (res.headersSent) return; 

    // لو مفيش مستخدم اتعرف (حماية إضافية)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // الشيك بتاع الأدمن
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // لو كله تمام، كمل للـ Route اللي بعده
    next();
  });
};

module.exports = adminOnly;