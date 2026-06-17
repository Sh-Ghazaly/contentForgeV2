const { User, PlatformSettings } = require('../models');
// هنا بنستدعي الدالة اللي هتبعت الإيميل
const { sendTrialExpiryWarningEmail } = require('./emailService'); 

async function checkAndSendExpiryWarnings() {
  try {
    // 1. نشيك الأول: هل الأدمن مفعّل الزرار من الشاشة؟
    const settings = await PlatformSettings.findOne();
    if (!settings || !settings.sendExpiryWarning) {
      console.log('⛔ ميزة إرسال تحذيرات انتهاء الاشتراكات معطلة من لوحة التحكم.');
      return; 
    }

    // 2. نحسب تاريخ "بعد 3 أيام من دلوقتي" بالظبط
    const now = new Date();
    const threeDaysFromNowStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    threeDaysFromNowStart.setHours(0, 0, 0, 0); // أول اليوم بعد 3 أيام

    const threeDaysFromNowEnd = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    threeDaysFromNowEnd.setHours(23, 59, 59, 999); // آخر اليوم بعد 3 أيام

    // 3. التعديل السحري: ندور في الـ DB بموجب حقل planEndsAt الجديد
    //on_Test_Moode
    const usersToWarn = await User.find({
      // plan: 'free',                     // بنجيب باقات الفري اللي في التجربة حالياً
      isBlocked: { $ne: true },
      'deletionRequest.isDeleted': { $ne: true }, // متوافق مع كائن الـ Soft Delete الجديد
      planEndsAt: { $gte: now, $lte: threeDaysFromNowEnd }, // 🌟 التعديل هنا
      isAdmin: { $ne: true },
      // warningSentAt: null
    });

    if (usersToWarn.length === 0) {
      console.log('[Cron Job] فحص التحذيرات: لا يوجد مستخدمين تنتهي باقاتهم بعد 3 أيام.');
      return;
    }

    console.log(`📢 [Cron Job] جاري إرسال إيميلات تنبيهية لـ ${usersToWarn.length} مستخدم...`);

    // 4. نلف عليهم ونبعت لكل واحد الإيميل التنبيهي
    for (const user of usersToWarn) {
      // باصينا الحقل الجديد planEndsAt للدالة عشان يتبعت التاريخ صح جوه الإيميل
        console.log(`📧 بيبعت لـ: ${user.email}`) // ← أضيفي السطر ده

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

module.exports = { checkAndSendExpiryWarnings };