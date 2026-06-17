const express  = require('express')
const router   = express.Router()
const auth     = require('../middleware/auth')
const adminAuth = require('../middleware/adminAuth')
const { Notification, User } = require('../models')

// ── GET /api/notifications
// Returns notifications for the logged-in user (or admin)
router.get('/', auth, async (req, res) => {
  try {
    const notifs = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const unreadCount = notifs.filter(n => !n.read).length

    res.json({ notifications: notifs, unreadCount })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications' })
  }
})

// ── PATCH /api/notifications/:id/read
// Mark a single notification as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read' })
  }
})

// ── PATCH /api/notifications/read-all
// Mark all notifications as read for the logged-in user
router.patch('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all as read' })
  }
})

// ── DELETE /api/notifications/:id
// Delete a single notification
router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, recipient: req.user._id })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification' })
  }
})

module.exports = router