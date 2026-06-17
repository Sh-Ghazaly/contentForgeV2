const { Notification } = require('../models')

/**
 * Create an in-app notification
 * @param {Object} options
 * @param {string} options.recipientId   - MongoDB user _id
 * @param {string} options.recipientRole - 'user' | 'admin'
 * @param {string} options.type          - notification type from enum
 * @param {string} options.title
 * @param {string} options.message
 * @param {Object} [options.meta]        - optional extra data
 */
async function createNotification({ recipientId, recipientRole = 'user', type, title, message, meta = {} }) {
  try {
    await Notification.create({
      recipient:     recipientId,
      recipientRole,
      type,
      title,
      message,
      meta,
      read: false,
    })
  } catch (err) {
    // never crash the main flow because of a notification failure
    console.error('[Notification] Failed to create:', err.message)
  }
}

module.exports = { createNotification }