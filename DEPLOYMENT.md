# 🚀 دليل النشر (Deployment Guide)

## الخطوة 1: إعداد Turso Database

### 1.1 تثبيت Turso CLI

```bash
# Windows (PowerShell)
irm https://get.turso.tech/install.ps1 | iex

# أو باستخدام npm
npm install -g @turso/cli
```

### 1.2 إنشاء Database

```bash
# تسجيل الدخول (سيفتح المتصفح)
turso auth login

# إنشاء database جديدة
turso db create employee-management-saas --location ams

# الحصول على DATABASE_URL
turso db show employee-management-saas --url

# سينتج شيء مثل:
# libsql://employee-management-saas-[username].turso.io
```

### 1.3 الحصول على Auth Token (اختياري لـ Turso)

```bash
# إنشاء token
turso db tokens create employee-management-saas

# انسخ القيمة الناتجة
```

### 1.4 تطبيق Migrations (باستخدام السكريبت)

بما أن Prisma CLI لا يدعم الاتصال المباشر بـ Turso حالياً لنشر الجداول، قمنا بإنشاء سكريبت خاص لذلك.

1. قم بتعيين متغيرات البيئة (في PowerShell):
```powershell
$env:DATABASE_URL="libsql://Example-....turso.io"
$env:DATABASE_AUTH_TOKEN="ey..."
```

2. قم بتثبيت التبعيات وتشغيل السكريبت:
```bash
npm install dotenv @libsql/client
node scripts/deploy-db.js
```

ستظهر رسائل تفيد بنجاح تطبيق الجداول (`✅ Applied: ...`).

---

## الخطوة 2: النشر على Vercel

### 2.1 ربط GitHub مع Vercel

1. افتح https://vercel.com
2. سجل دخول بـ GitHub
3. انقر **Add New Project**
4. اختر `employee-management-saas`
5. انقر **Import**

### 2.2 إعدادات المشروع

**Framework Preset:** Next.js  
**Root Directory:** `./`  
**Build Command:** `npm run build`  
**Output Directory:** `.next`

### 2.3 إضافة Environment Variables

في صفحة الإعدادات، أضف:

```env
DATABASE_URL=libsql://employee-management-saas-[username].turso.io
JWT_SECRET=<قيمة-عشوائية-قوية-جداً>
NODE_ENV=production
```

**لإنشاء JWT_SECRET قوي:**
```bash
openssl rand -base64 32
```

### 2.4 Deploy

انقر **Deploy** وانتظر اكتمال النشر (2-3 دقائق)

---

## الخطوة 3: اختبار ما بعد النشر

### 3.1 فتح الموقع

بعد النشر، ستحصل على رابط مثل:
```
https://employee-management-saas-[random].vercel.app
```

### 3.2 اختبار أساسي

1. ✅ افتح الموقع - يجب أن تظهر landing page
2. ✅ انتقل إلى `/register-tenant`
3. ✅ سجل شركة جديدة
4. ✅ تحقق من إنشاء الحساب والتوجيه إلى `/dashboard`

### 3.3 اختبار Multi-Tenancy

1. افتح متصفح آخر (Firefox/Edge)
2. سجل شركة ثانية
3. تأكد من عزل البيانات بين الشركتين

---

## الخطوة 4: Troubleshooting

### مشكلة: Build فشل على Vercel

**الحل:**
- تحقق من Logs في Vercel
- غالباً بسبب TypeScript errors
- تأكد من `npm run build` يعمل محلياً

### مشكلة: Database connection error

**الحل:**
```bash
# تأكد من DATABASE_URL صحيح
turso db show employee-management-saas --url

# تأكد من تطبيق migrations
npx prisma db push
```

### مشكلة: JWT لا يعمل

**الحل:**
- تحقق من أن `JWT_SECRET` موجود في Vercel Environment Variables
- القيمة يجب أن تكون على الأقل 32 حرف

---

## Vercel Commands (مفيدة)

```bash
# إعادة النشر يدوياً
vercel --prod

# عرض logs
vercel logs <deployment-url>

# إلغاء deployment
vercel remove <deployment-name>
```

---

## ملاحظات مهمة

- ✅ Turso Free Tier: 500MB, 1B rows, 1B row reads/month
- ✅ Vercel Free Tier: 100GB bandwidth, unlimited deployments
- ⚠️ لا ترفع `.env` إلى Git
- ⚠️ استخدم `JWT_SECRET` مختلف في Production
- ⚠️ SQLite المحلي لا يعمل على Vercel (استخدم Turso)

---

## الخطوات التالية (اختياري)

- [ ] ربط Custom Domain
- [ ] إضافة Analytics
- [ ] إعداد Monitoring (Sentry)
- [ ] تفعيل HTTPS (تلقائي في Vercel)
