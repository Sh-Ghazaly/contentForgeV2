const express = require('express')
const router  = express.Router()
const { body, validationResult } = require('express-validator')
const { sendContactNotificationEmail, sendContactAutoReply } = require('../services/emailService')
const { createNotification } = require('../services/notificationHelper')
const { ContactMessage, User } = require('../models')

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('subject').notEmpty().withMessage('Subject is required'),
    body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  ],
  async (req, res) => {
    const errs = validationResult(req)
    if (!errs.isEmpty()) {
      return res.status(400).json({ errors: errs.array() })
    }

    const { name, email, company, subject, message } = req.body

    try {
      // 1. Save to database
      await ContactMessage.create({ name, email, company, subject, message })
      console.log('[Contact] Message saved to DB')

      // 2. Send email to admin (fire-and-forget, don't block response)
      sendContactNotificationEmail(name, email, company, subject, message)
        .then(() => console.log('[Contact] Admin email sent'))
        .catch(err => console.error('[Contact] Admin email failed:', err.message))

      // 3. Send auto-reply to user (fire-and-forget)
      sendContactAutoReply(email, name)
        .then(() => console.log('[Contact] Auto-reply sent'))
        .catch(err => console.error('[Contact] Auto-reply failed:', err.message))

      // 4. Notify admins in-app (fire-and-forget, completely non-blocking)
      ;(async () => {
        try {
          const admins = await User.find({ isAdmin: true })
          console.log(`[Contact] Found ${admins.length} admins to notify`)
          
          for (const admin of admins) {
            try {
              await createNotification({
                recipientId: admin._id,
                recipientRole: 'admin',
                type: 'contact_message',
                title: 'New Contact Message Received',
                message: `${name} (${email}) sent a message about "${subject}".`,
                meta: { 
                  contactName: name,
                  contactEmail: email,
                  contactSubject: subject,
                  contactMessage: message,
                  company: company || null
                },
              })
              console.log(`[Contact] Notification sent to admin ${admin._id}`)
            } catch (notifyErr) {
              console.error(`[Contact] Failed to notify admin ${admin._id}:`, notifyErr.message)
            }
          }
        } catch (adminErr) {
          console.error('[Contact] Admin notification block failed:', adminErr.message)
        }
      })()

      // Return success immediately, don't wait for emails/notifications
      res.status(200).json({ message: 'Message sent successfully' })
    } catch (err) {
      console.error('[Contact] CRITICAL ERROR:', err)
      res.status(500).json({ error: err.message || 'Internal server error' })
    }
  }
)

module.exports = router