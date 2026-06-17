// seed.js
const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const { User, Brand, Post, Calendar, Trend, ChatMessage } = require('./models/index'); // اتأكدي من المسار الصح للموديلز في مشروعك

// مصطلحات مناسبة للبزنس والسوشيال ميديا في مصر والوطن العربي
const dialects = ['Egyptian Arabic', 'Gulf Arabic', 'Levantine Arabic', 'Modern Standard Arabic', 'Bilingual AR+EN'];
const platforms = ['Instagram', 'Facebook', 'LinkedIn', 'Twitter/X', 'TikTok'];
const plans = ['free', 'pro', 'enterprise'];
const postStatuses = ['draft', 'approved', 'scheduled', 'published'];

async function seedDB() {
  try {
    // 1. الاتصال بقاعدة البيانات (تم الحفاظ على الـ URI الخاص بكِ)
    await mongoose.connect(
      "mongodb://Noura:jnkZSqcX2bJ3LLitit2026@ac-vmdhgeq-shard-00-00.diacuvs.mongodb.net:27017,ac-vmdhgeq-shard-00-01.diacuvs.mongodb.net:27017,ac-vmdhgeq-shard-00-02.diacuvs.mongodb.net:27017/?ssl=true&replicaSet=atlas-usupgm-shard-0&authSource=admin&appName=Cluster0",
    );
    console.log('🔌 Connected to MongoDB successfully...');

    // 2. تنظيف الداتا القديمة بالكامل
    await Promise.all([
      User.deleteMany({}),
      Brand.deleteMany({}),
      Post.deleteMany({}),
      Calendar.deleteMany({}),
      Trend.deleteMany({}),
      ChatMessage.deleteMany({})
    ]);
    console.log('🧹 Cleaned up existing data completely.');

    // 3. توليد Trends فريش متناسقة مع الـ trendService الجديد
    console.log('📈 Generating Trends...');
    const trends = [];
    const now = new Date();
    
    const sampleTags = ['#رمضان_كريم', '#قهوة_الصباح', 'Cold brew Egypt', '#سحور', '#إفطار', '#ذكاء_اصطناعي', '#تجارة_إلكترونية', '#صناع_المحتوى'];
    
    for (let i = 0; i < 10; i++) {
      trends.push({
        tag: faker.helpers.arrayElement(sampleTags) + `_${faker.number.int({ min: 10, max: 99 })}`,
        change: `+${faker.number.int({ min: 50, max: 500 })}%`,
        velocity: faker.number.int({ min: 50, max: 400 }),
        region: 'EG',
        source: faker.helpers.arrayElement(['google', 'manual']),
        lastUpdated: now, // الحقل ده مهم جداً للـ Scheduler الجديد
      });
    }
    const createdTrends = await Trend.insertMany(trends);
    console.log(`📈 Inserted ${createdTrends.length} Dummy Trends.`);

    // 4. توليد مستخدمين (Users) متوافقين مع سكيما الـ 14 يوم تجربة والـ OTP
    console.log('👥 Generating Users...');
    const usersData = [];
    
    // إضافة الـ Admin أولاً
    usersData.push({
      name: 'Super Admin',
      email: 'admin@app.com',
      password: 'password123', // الـ pre-save hook هيعملها hash تلقائي
      plan: 'enterprise',
      subscriptionType: 'yearly',
      isVerified: true,
      phone: '+201000000000',
      isTrial: false,
      planEndsAt: null, // الأدمن مش بيحتاج تاريخ انتهاء
      hasUsedTrial: true,
      isAdmin: true,
    });

    // توليد 10 مستخدمين عاديين للتجربة والاختبار
    for (let i = 1; i <= 10; i++) {
      // نحدد الـ plan الأول، وبعدين نبني باقي الحقول عليه بمنطق صح
      const plan = faker.helpers.arrayElement(plans);

      let subscriptionType, planEndsAt, isTrial;

      if (plan === 'free') {
        // الـ free دايماً trial، مفيش اشتراك مدفوع
        subscriptionType = 'none';
        isTrial = true;
        planEndsAt = faker.datatype.boolean(0.7)
          ? new Date(Date.now() + faker.number.int({ min: 1, max: 14 }) * 24 * 60 * 60 * 1000)  // active trial
          : new Date(Date.now() - faker.number.int({ min: 1, max: 7 })  * 24 * 60 * 60 * 1000); // expired trial
      } else {
        // pro أو enterprise = اشتراك مدفوع، مش trial
        subscriptionType = faker.helpers.arrayElement(['monthly', 'yearly']);
        isTrial = false;
        const months = subscriptionType === 'yearly' ? 12 : 1;
        planEndsAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
      }

      usersData.push({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123', 
        plan,
        subscriptionType,
        isVerified: faker.datatype.boolean(0.8),
        phone: faker.phone.number({ style: 'international' }),
        isTrial,
        planEndsAt,
        hasUsedTrial: true,
        isAdmin: false,
        isBlocked: faker.datatype.boolean(0.05),
      });
    }

    // حفظ المستخدمين فرداً فرداً لتفعيل الـ pre-save hook الخاص بـ Bcrypt لباسورد نظيف
    const createdUsers = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      createdUsers.push(user);
    }
    console.log(`👥 Successfully created ${createdUsers.length} Users.`);

    // 5. توليد البراندات (Brands) مرتبطة بالـ Users
    console.log('🏢 Generating Brands...');
    const createdBrands = [];
    for (const user of createdUsers) {
      if (user.isAdmin) continue; // تخطي حساب الأدمن

      // كل يوزر يكريت براند أو اتنين
      const numBrands = faker.number.int({ min: 1, max: 2 });
      for (let b = 0; b < numBrands; b++) {
        const brand = await Brand.create({
          user: user._id,
          name: faker.company.name(),
          industry: faker.company.buzzNoun(),
          website: faker.internet.url(),
          targetAudience: 'شباب من سن 18 لـ 35 مهتمين بالتسوق والتكنولوجيا في الشرق الأوسط',
          marketSize: faker.helpers.arrayElement(['Small', 'Medium', 'Enterprise']),
          dialects: faker.helpers.arrayElements(dialects, { min: 1, max: 2 }),
          tones: faker.helpers.arrayElements(['احترافي', 'حماسي', 'تعليمي', 'قريب للجمهور'], { min: 1, max: 2 }),
          avoidTopics: 'السياسة والمناقشات الدينية الجدلية',
          platforms: faker.helpers.arrayElements(platforms, { min: 2, max: 4 }),
          guidelinesFile: faker.system.filePath(),
          ragChunks: [
            { content: 'نحن براند متخصص في تقديم حلول مبتكرة وبجودة استثنائية تناسب احتياج السوق.', source: 'guidelines' },
            { content: 'كابشن سابق ناجح: لأن يومك ميكملش من غير قهوتك، عملنالك عرض ميتفوتش!', source: 'past_posts' }
          ]
        });
        createdBrands.push(brand);
      }
    }
    console.log(`🏢 Successfully created ${createdBrands.length} Brands.`);

    // 6. توليد الكالندر، البوستات، والمحادثات
    console.log('📅 Generating Calendars, Posts, and Chat Messages...');
    
    for (const brand of createdBrands) {
      // أ) محادثات ذكاء اصطناعي تجريبية لكل براند لملء الـ Dashboard Analytics
      for (let c = 0; c < 3; c++) {
        const convId = faker.string.uuid();
        await ChatMessage.create({
          brand: brand._id,
          sender: 'user',
          content: 'عايز أفكار كابشن إبداعي لمنتج قهوة جديد',
          conversationId: convId
        });
        await ChatMessage.create({
          brand: brand._id,
          sender: 'ai',
          content: 'بالتأكيد! إليك مقترح لكابشن تسويقي يركز على الانتعاش وبلهجة براندك المفضلة...',
          conversationId: convId
        });
      }

      // ب) إنشاء تقويم محتوى (Calendar) للبراند
      const calendar = await Calendar.create({
        brand: brand._id,
        user: brand.user,
        title: `خطة محتوى مخصصة لشهر ${faker.date.month()}`,
        brief: 'خطة تسويقية متكاملة لزيادة التفاعل وبناء هوية بصرية قوية',
        dialect: faker.helpers.arrayElement(brand.dialects),
        platforms: brand.platforms,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // خطة لمدة 14 يوم
        status: faker.helpers.arrayElement(['generating', 'ready', 'approved']),
        posts: [] // سيتم ربطها بالـ Object IDs تالياً
      });

      // جـ) توليد منشورات (Posts) عشوائية وتوزيعها داخل الكالندر
      const postIds = [];
      const numPosts = faker.number.int({ min: 3, max: 6 });

      for (let p = 0; p < numPosts; p++) {
        const post = await Post.create({
          brand: brand._id,
          calendar: calendar._id,
          platform: faker.helpers.arrayElement(brand.platforms),
          dialect: calendar.dialect,
          date: faker.date.future().toISOString().split('T')[0],
          copyAR: 'هذا منشور تسويقي تجريبي عالي الجودة لزيادة التفاعل والوصول إلى شريحة أوسع! ✨',
          copyEN: 'This is the optimized English context layout generated for your modern brand audience.',
          hashtags: ['#تسويق_رقمي', '#صناعة_محتوى', brand.name.replace(/\s+/g, '')],
          imagePrompt: 'Premium minimalist product display, studio warm ambient lighting, highly detailed 4k rendering',
          imageUrl: faker.image.url({ width: 800, height: 600 }),
          goal: faker.helpers.arrayElement(['Awareness', 'Conversion', 'Engagement']),
          variantB: {
            copyAR: 'نسخة بديلة أصلح للاختبار (A/B Testing) للتركيز على العرض المباشر والـ Call To Action 💥',
            copyEN: 'Alternative version B copy with a direct engagement trigger question.',
            hashtags: ['#عروض', '#تطوير_أعمال']
          },
          status: faker.helpers.arrayElement(postStatuses),
          scheduledAt: faker.date.future(),
          publishedAt: faker.datatype.boolean(0.3) ? faker.date.past() : null
        });
        postIds.push(post._id);
      }

      // ربط المصفوفة بالكالندر وحفظ التحديثات
      calendar.posts = postIds;
      await calendar.save();
    }

    console.log('🚀 DONE! Database has been successfully seeded with clean and updated dummy data.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDB();