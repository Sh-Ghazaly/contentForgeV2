const { User, PlatformSettings } = require('../models');
const { sendTrialExpiryWarningEmail } = require('./emailService'); 

async function checkAndSendExpiryWarnings() {
  try {
    const settings = await PlatformSettings.findOne();
    if (!settings || !settings.sendExpiryWarning) {
      console.log('⛔ ميزة إرسال تحذيرات انتهاء الاشتراكات معطلة من لوحة التحكم.');
      return; 
    }

    const now = new Date();
    const threeDaysFromNowStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    threeDaysFromNowStart.setHours(0, 0, 0, 0); 

    const threeDaysFromNowEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999); 

    const usersToWarn = await User.find({
      isBlocked: { $ne: true },
      'deletionRequest.isDeleted': { $ne: true },
      planEndsAt: { $gte: now, $lte: threeDaysFromNowEnd }, 
      isAdmin: { $ne: true },
    });

    if (usersToWarn.length === 0) {
      console.log('[Cron Job] فحص التحذيرات: لا يوجد مستخدمين تنتهي باقاتهم بعد 3 أيام.');
      return;
    }

    console.log(`📢 [Cron Job] جاري إرسال إيميلات تنبيهية لـ ${usersToWarn.length} مستخدم...`);

    for (const user of usersToWarn) {
        console.log(`📧 بيبعت لـ: ${user.email}`)

    await sendTrialExpiryWarningEmail(user.email, user.name, user.planEndsAt)
        .catch(err => console.error(`خطأ أثناء الإرسال لـ ${user.email}:`, err.message));
        user.warningSentAt = new Date();
        await user.save();
    }

    console.log(`[Cron Job] تم إنهاء إرسال التحذيرات بنجاح.`);

  } catch (error) {
    console.error('خطأ في سكريبت فحص فترات التجربة والاشتراكات:', error.message);
  }
}

async function autoBlockWarnedUsers() {
  try {
    const now = new Date();

    const usersToBlock = await User.find({
      'moderation.blockStatus': 'warning',
      'moderation.gracePeriodExpiresAt': { $lte: now },
      isAdmin: { $ne: true },
      'deletionRequest.isDeleted': { $ne: true },
    });

    if (usersToBlock.length === 0) {
      console.log('[Cron Job] لا يوجد مستخدمين لحظرهم تلقائياً.');
      return;
    }

    console.log(`🔒 [Cron Job] جاري حظر ${usersToBlock.length} مستخدم تلقائياً...`);

    for (const user of usersToBlock) {
      user.isBlocked = true;
      user.moderation.blockStatus = 'blocked';
      await user.save();

      console.log(`🚫 تم حظر: ${user.email}`);
    }

    console.log('[Cron Job] تم الحظر التلقائي بنجاح.');
  } catch (error) {
    console.error('خطأ في الحظر التلقائي:', error.message);
  }
}

module.exports = { checkAndSendExpiryWarnings, autoBlockWarnedUsers };
