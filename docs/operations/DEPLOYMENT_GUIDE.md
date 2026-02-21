# Deployment Guide

## 1. المتطلبات
- Node.js 20+
- MySQL 8+
- متغيرات بيئة محدثة

## 2. إعداد البيئة
```bash
npm install
npm run check
```

## 3. إعداد قاعدة البيانات
```bash
npm run db:push
```

## 4. البناء
```bash
npm run build
```

## 5. التشغيل
```bash
npm run start
```

## 6. التحقق بعد النشر
- التأكد من صحة `/health` أو مسار مكافئ.
- التحقق من تسجيل الدخول.
- التحقق من تحميل Dashboard وتصدير تقرير.
