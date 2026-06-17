// backend/services/emailService.js
require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  pool: true,
  maxConnections: 1,
});

transporter.verify((err) => {
  if (err) console.error('Email transporter error:', err);
  else console.log('✅ Email server ready');
});

async function sendVerificationEmail(email, code) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "Verify your email",
    html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${code}</h1>
    `,
  });
}
////////////////////////////////////////////////
const emailServices = {
  // دالة إرسال إيميل رفع الحظر
 async sendUnblockEmail(email, name) {
  try {
    await transporter.sendMail({
      from: `"Admin Team" <${process.env.ADMIN_EMAIL}>`, // إضافة اسم مرسل واضح
      to: email,
      subject: "Account Restored: You're back in!",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          
          <div style="background-color: #4f46e5; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Account Restored</h1>
          </div>

          <div style="padding: 40px 30px; color: #333333;">
            <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 16px; line-height: 1.6;">
              Great news! Your account has been reviewed and successfully <strong>unblocked</strong>. 
            </p>
            <p style="font-size: 16px; line-height: 1.6;">
              You can now log in to your dashboard and continue using our platform as usual.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://your-website.com/login" style="background-color: #4f46e5; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log In Now</a>
            </div>
            
            <p style="font-size: 14px; color: #777; margin-top: 30px;">
              If you have any questions, feel free to reply to this email.
            </p>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
            <p>© ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
          </div>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error("Nodemailer error:", error);
    throw error;
  }
}
};

async function sendPolicyWarningEmail(email, name, reason, expiryDate) {
  const formattedDate = new Date(expiryDate).toLocaleString('ar-EG', {
    dateStyle: 'full',
    timeStyle: 'short'
  });

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "تنبيه هام: مخالفة سياسة الاستخدام لمنصة ContentForge",
    html: `
      <div style="direction: rtl; text-align: right; font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e8ed; padding: 20px; border-radius: 10px;">
        <h2 style="color: #e53e3e;">تنبيه بخصوص حسابك في ContentForge</h2>
        <p>مرحباً ${name}،</p>
        <p>تم رصد مخالفة لسياسة الاستخدام وشروط المنصة في حسابك.</p>
        
        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #e53e3e; margin: 20px 0; border-radius: 4px;">
          <strong>سبب المخالفة المذكور من قبل الإدارة:</strong>
          <p style="margin-top: 5px; color: #4a5568;">"${reason}"</p>
        </div>

        <p style="font-weight: bold; color: #dd6b20;">
          ⚠️ يرجى العلم أنه تم إعطاؤك فترة سماح مدتها 24 ساعة فقط لتصحيح الوضع، وإلا سيتم حظر حسابك تلقائياً وبشكل نهائي.
        </p>
        
        <p>تنتهي المهلة المسموحة لك في: <br><strong style="color: #2d3748;">${formattedDate}</strong></p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #718096;">إذا كنت تعتقد أن هذا الإجراء تم بالخطأ، يرجى مراسلة الدعم الفني فوراً.</p>
      </div>
    `,
  });
}

async function sendDeletionRequestEmail(name, email, reason) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: `طلب حذف حساب — ${name}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 10px;">
        <h2 style="color: #e53e3e;">طلب حذف بيانات جديد</h2>
        <p><strong>الاسم:</strong> ${name}</p>
        <p><strong>الإيميل:</strong> ${email}</p>
        <p><strong>السبب:</strong> ${reason || 'لم يُذكر سبب'}</p>
        <hr/>
        <p style="font-size: 12px; color: #718096;">يرجى مراجعة لوحة الأدمن واتخاذ الإجراء المناسب.</p>
      </div>
    `,
  });
}

async function sendTrialUpdateEmail(email, name, newDays, newEndDate) {
  const formattedDate = new Date(newEndDate).toLocaleString('ar-EG', {
    dateStyle: 'full', timeStyle: 'short'
  });

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: 'تحديث فترة التجربة المجانية — ContentForge',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">تحديث على حسابك في ContentForge</h2>
        <p>مرحباً ${name}،</p>
        <p>تم تحديث فترة التجربة المجانية الخاصة بك.</p>
        <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:16px 0;">
          <p style="margin:0;"><strong>المدة الجديدة:</strong> ${newDays} يوم</p>
          <p style="margin:8px 0 0;"><strong>تنتهي في:</strong> ${formattedDate}</p>
        </div>
        <p style="font-size:12px; color:#718096;">إذا كان لديك أي استفسار، تواصل مع الدعم الفني.</p>
      </div>
    `,
  });
}

async function sendTrialExpiryWarningEmail(email, name, expiryDate) {
  const formattedDate = new Date(expiryDate).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: "⚠️ تنبيه: قُرب انتهاء الفترة التجريبية - منصة ContentForge",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 10px; direction: rtl; text-align: right;">
        <h2 style="color: #eab308;">تنبيه هام من ContentForge</h2>
        <p>مرحباً ${name}،</p>
        <p>نود تذكيرك بأن فترتك التجريبية المجانية على منصتنا أوشكت على الانتهاء.</p>
        
        <div style="background: #fef9c3; padding: 15px; border-radius: 8px; margin: 16px 0; border-right: 5px solid #eab308;">
          <strong>تاريخ انتهاء التجربة:</strong> ${formattedDate} (متبقي 3 أيام فقط).
        </div>

        <p>لضمان استمرار أعمالك وعدم توقف صناعة المحتوى، يمكنك ترقية حسابك إلى إحدى باقاتنا المميزة في أي وقت من لوحة التحكم.</p>
        
        <a href="${process.env.FRONTEND_URL || '#'}/dashboard/billing" style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px; font-weight: bold;">ترقية الحساب الآن</a>
        
        <hr style="border: 0; border-top: 1px solid #e1e8ed; margin-top: 20px;">
        <p style="font-size: 12px; color: #718096;">إذا كان لديك أي استفسار، رد على هذا الإيميل مباشرة — فريق ContentForge</p>
      </div>
    `,
  });
}

async function sendContactNotificationEmail(name, email, company, subject, message) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: `[Contact] ${subject} — ${name}`,
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">رسالة تواصل جديدة</h2>
        <p><strong>الاسم:</strong> ${name}</p>
        <p><strong>الإيميل:</strong> ${email}</p>
        ${company ? `<p><strong>الشركة:</strong> ${company}</p>` : ''}
        <p><strong>الموضوع:</strong> ${subject}</p>
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:16px 0;"/>
        <p style="white-space:pre-line;">${message}</p>
      </div>
    `,
  });
}

async function sendContactAutoReply(email, name) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: 'تم استلام رسالتك ✉️ — ContentForge',
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">شكراً للتواصل معنا!</h2>
        <p>مرحباً ${name}،</p>
        <p>تم استلام رسالتك بنجاح وسيقوم فريقنا بالرد عليك خلال 24 ساعة.</p>
        <p style="font-size:12px; color:#718096;">— فريق ContentForge</p>
      </div>
    `,
  });
}

async function sendContactReplyEmail(email, name, originalMessage, replyText) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: 'رد من فريق ContentForge',
    html: `
      <div style="font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">رد من فريق الدعم</h2>
        <p>مرحباً ${name}،</p>
        <div style="background:#f0f9ff; padding:15px; border-radius:8px; margin:16px 0; white-space:pre-line;">
          ${replyText}
        </div>
        <hr style="border:0; border-top:1px solid #e2e8f0; margin:16px 0;"/>
        <p style="font-size:12px; color:#718096;"><strong>رسالتك الأصلية:</strong></p>
        <p style="font-size:12px; color:#718096; white-space:pre-line;">${originalMessage}</p>
      </div>
    `,
  });
}

function sendScheduledPostReminderEmail(email, name, posts) {
  const postList = posts.map(p => `
    <tr>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${p.platform}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${p.copyAR || p.copyEN || 'No content'}</td>
    </tr>
  `).join('')

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '📅 تذكير: لديك منشورات مجدولة اليوم — ContentForge',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#3b82f6;">📅 تذكير بمنشورات اليوم</h2>
        <p>مرحباً ${name}،</p>
        <p>لديك <strong>${posts.length}</strong> منشور مجدول اليوم على ContentForge. لا تنسَ نشرها!</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0; text-align:right;">
          <thead>
            <tr style="background:#f7fafc;">
              <th style="padding:8px 12px; border-bottom:2px solid #e2e8f0;">المنصة</th>
              <th style="padding:8px 12px; border-bottom:2px solid #e2e8f0;">المحتوى</th>
            </tr>
          </thead>
          <tbody>${postList}</tbody>
        </table>
        <a href="${process.env.CLIENT_URL}/dashboard" 
          style="display:inline-block; margin-top:8px; padding:10px 20px; background:#3b82f6; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
          افتح التقويم
        </a>
        <p style="font-size:12px; color:#718096; margin-top:20px;">ContentForge — منصة إدارة المحتوى الذكية</p>
      </div>
    `,
  });
}

function sendScheduledPostTomorrowEmail(email, name, posts) {
  const postList = posts.map(p => `
    <tr>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${p.platform}</td>
      <td style="padding:8px 12px; border-bottom:1px solid #e2e8f0;">${p.copyAR || p.copyEN || 'No content'}</td>
    </tr>
  `).join('')

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '⏰ تذكير: لديك منشورات مجدولة غداً — ContentForge',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:20px; border:1px solid #e1e8ed; border-radius:10px;">
        <h2 style="color:#f59e0b;">⏰ تذكير بمنشورات الغد</h2>
        <p>مرحباً ${name}،</p>
        <p>لديك <strong>${posts.length}</strong> منشور مجدول <strong>غداً</strong> على ContentForge. استعد لنشرها!</p>
        <table style="width:100%; border-collapse:collapse; margin:16px 0; text-align:right;">
          <thead>
            <tr style="background:#f7fafc;">
              <th style="padding:8px 12px; border-bottom:2px solid #e2e8f0;">المنصة</th>
              <th style="padding:8px 12px; border-bottom:2px solid #e2e8f0;">المحتوى</th>
            </tr>
          </thead>
          <tbody>${postList}</tbody>
        </table>
        <a href="${process.env.CLIENT_URL}/dashboard"
          style="display:inline-block; margin-top:8px; padding:10px 20px; background:#f59e0b; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
          افتح التقويم
        </a>
        <p style="font-size:12px; color:#718096; margin-top:20px;">ContentForge — منصة إدارة المحتوى الذكية</p>
      </div>
    `,
  });
}

async function sendAdminPromotionEmail(email, name) {
  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: '🎉 تهانينا! تمت ترقيتك لمسؤول — ContentForge',
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #e1e8ed; border-radius:12px;">
        <h2 style="color:#7c3aed;">🎉 تهانينا ${name}!</h2>
        <p>تم منحك صلاحيات <strong>مسؤول (Admin)</strong> على منصة ContentForge.</p>
        <div style="background:#f5f3ff; padding:16px; border-radius:8px; margin:16px 0; border-right:4px solid #7c3aed;">
          <p style="margin:0; color:#4c1d95;">أصبح بإمكانك الآن الوصول إلى لوحة التحكم الكاملة وإدارة المستخدمين والإعدادات.</p>
        </div>
        <p style="font-size:12px; color:#718096;">إذا كان لديك أي استفسار، تواصل مع فريق الدعم — ContentForge</p>
      </div>
    `,
  });
}

const planPrices = { free: 'مجانية', pro: '99 جنيه / شهر', enterprise: '299 جنيه / شهر' }

async function sendPlanUpdateByAdminEmail(email, name, plan, isTrial, planEndsAt) {
  const formattedDate = planEndsAt
    ? new Date(planEndsAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : '—'

  const planLabel = isTrial ? `تجربة مجانية (${plan})` : plan
  const price     = planPrices[plan] || '—'
  const color     = plan === 'pro' ? '#3b82f6' : plan === 'enterprise' ? '#7c3aed' : '#f59e0b'

  await transporter.sendMail({
    from: process.env.ADMIN_EMAIL,
    to: email,
    subject: `تحديث باقتك على ContentForge — ${planLabel}`,
    html: `
      <div style="direction:rtl; text-align:right; font-family:sans-serif; max-width:600px; margin:0 auto; padding:24px; border:1px solid #e1e8ed; border-radius:12px;">
        <h2 style="color:${color};">تحديث على حسابك في ContentForge</h2>
        <p>مرحباً ${name}،</p>
        <p>تم تحديث باقتك من قِبل الإدارة، وفيما يلي تفاصيل حسابك الجديدة:</p>

        <div style="background:#f8fafc; padding:16px; border-radius:8px; margin:16px 0; border-right:4px solid ${color};">
          <p style="margin:0 0 8px;"><strong>الباقة:</strong> ${planLabel}</p>
          <p style="margin:0 0 8px;"><strong>السعر:</strong> ${price}</p>
          <p style="margin:0;"><strong>تاريخ الانتهاء:</strong> ${formattedDate}</p>
        </div>

        ${isTrial ? `<p style="color:#d97706;">⚠️ هذه فترة تجريبية مجانية — قم بالترقية قبل انتهائها للاستمرار في استخدام المنصة.</p>` : ''}

        <a href="${process.env.CLIENT_URL || '#'}/dashboard" 
          style="display:inline-block; margin-top:8px; padding:10px 24px; background:${color}; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">
          الذهاب للوحة التحكم
        </a>

        <p style="font-size:12px; color:#718096; margin-top:20px;">إذا كان لديك أي استفسار، تواصل مع فريق الدعم — ContentForge</p>
      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPolicyWarningEmail,
  sendDeletionRequestEmail,
  sendTrialUpdateEmail,
  sendTrialExpiryWarningEmail,
  sendContactNotificationEmail,
  sendContactAutoReply,
  sendContactReplyEmail,
  sendScheduledPostTomorrowEmail,
  sendScheduledPostReminderEmail,
  sendAdminPromotionEmail,
  sendPlanUpdateByAdminEmail,
  emailServices,
  transporter,
};