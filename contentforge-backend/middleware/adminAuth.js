// backend/middleware/adminAuth.js
const protect = require('./auth')

const adminOnly = async (req, res, next) => {
  protect(req, res, async (err) => {
    if (err) return next(err);

    if (res.headersSent) return; 

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  });
};

module.exports = adminOnly;