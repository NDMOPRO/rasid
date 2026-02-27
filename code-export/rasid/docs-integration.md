# rasid - docs-integration

> Auto-extracted source code documentation

---

## `docs/integration/API_DOCUMENTATION.md`

```markdown
# API Documentation

## 1. Authentication
### POST `/api/auth/login`
- **الوصف:** تسجيل دخول المستخدم.
- **Body:** `{ username, password }`
- **Response:** `{ token, user }`

### POST `/api/auth/logout`
- **الوصف:** إنهاء الجلسة الحالية.

## 2. Surveys
### GET `/api/surveys`
- **الوصف:** جلب قائمة المسوحات.
- **Query:** `status`, `from`, `to`, `page`, `limit`

### POST `/api/surveys`
- **الوصف:** إنشاء مسح جديد.

### PATCH `/api/surveys/:id`
- **الوصف:** تحديث حالة/بيانات المسح.

## 3. Reports
### POST `/api/reports/pdf`
- **الوصف:** إنشاء تقرير PDF.

### POST `/api/reports/excel`
- **الوصف:** إنشاء تقرير Excel.

## 4. AI
### POST `/api/ai/chat`
- **الوصف:** إرسال رسالة إلى المساعد الذكي.

## 5. أكواد الاستجابة
- `200/201`: نجاح.
- `400`: مدخلات غير صحيحة.
- `401`: غير مصرح.
- `403`: ممنوع.
- `500`: خطأ داخلي.

```

---

## `docs/integration/INTEGRATION_SPECIFICATION.md`

```markdown
# Integration Specification

## الأنظمة المتكاملة
1. نظام الهوية المؤسسي (SSO/LDAP أو OAuth).
2. خدمات تخزين الملفات (S3-compatible).
3. خدمات الإشعارات (Email/SMS).
4. منصات التحليلات الخارجية (اختياري).

## عقود التكامل
- بروتوكول النقل: HTTPS.
- التنسيق: JSON.
- المصادقة: Bearer Token / API Key.
- معدل الطلبات: 100 طلب/دقيقة لكل تكامل افتراضيًا.

## سياسات الاعتمادية
- retries مع exponential backoff.
- dead-letter queue للرسائل الفاشلة.
- circuit breaker عند تعطل الطرف الخارجي.

## أمن التكامل
- تشفير TLS 1.2+.
- تدقيق كامل لطلبات/استجابات الأنظمة الحساسة.
- تدوير مفاتيح الوصول كل 90 يوم.

```

---

