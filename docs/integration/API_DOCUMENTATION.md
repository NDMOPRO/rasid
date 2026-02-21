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
