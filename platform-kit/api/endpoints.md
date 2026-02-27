# قائمة الـ Endpoints - راصد الذكي API

## المبادئ العامة
- كل endpoint يحمل `domain` parameter أو يُحدد من المسار
- RBAC على كل endpoint
- تسجيل تدقيق لكل عملية تنفيذية
- SSE للردود المبثوثة

---

## 1. Chat & Conversation

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| POST | `/api/ai/:domain/chat` | إرسال رسالة (SSE response) | ✅ |
| GET | `/api/ai/:domain/conversations` | قائمة المحادثات | ✅ |
| GET | `/api/ai/:domain/conversations/:id` | تفاصيل محادثة | ✅ |
| DELETE | `/api/ai/:domain/conversations/:id` | حذف محادثة | ✅ |
| GET | `/api/ai/:domain/conversations/:id/messages` | رسائل محادثة | ✅ |
| POST | `/api/ai/:domain/conversations/:id/feedback` | إضافة ملاحظة | ✅ |

## 2. Tools Execution

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| POST | `/api/ai/:domain/tools/execute` | تنفيذ أداة | ✅ |
| GET | `/api/ai/:domain/tools` | قائمة الأدوات المتاحة (حسب الدور) | ✅ |
| POST | `/api/ai/:domain/actions/confirm` | تأكيد إجراء تنفيذي | ✅ |
| POST | `/api/ai/:domain/actions/cancel` | إلغاء إجراء | ✅ |
| POST | `/api/ai/:domain/actions/rollback` | التراجع عن إجراء | ✅ |
| GET | `/api/ai/:domain/actions/:id` | حالة إجراء | ✅ |

## 3. Knowledge & RAG

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| GET | `/api/ai/:domain/glossary` | قائمة المصطلحات | ✅ |
| POST | `/api/ai/:domain/glossary` | إضافة مصطلح | admin |
| PUT | `/api/ai/:domain/glossary/:id` | تعديل مصطلح | admin |
| DELETE | `/api/ai/:domain/glossary/:id` | حذف مصطلح | admin |
| GET | `/api/ai/:domain/page-descriptors` | واصفات الصفحات | ✅ |
| POST | `/api/ai/:domain/page-descriptors` | إضافة واصف | admin |
| PUT | `/api/ai/:domain/page-descriptors/:id` | تعديل واصف | admin |
| GET | `/api/ai/:domain/knowledge/status` | حالة تحديث المعرفة | admin |
| POST | `/api/ai/:domain/knowledge/refresh` | تحديث المعرفة يدوياً | admin |

## 4. Training Center

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| GET | `/api/ai/:domain/training/documents` | قائمة وثائق التدريب | admin |
| POST | `/api/ai/:domain/training/documents` | إضافة وثيقة | admin |
| PUT | `/api/ai/:domain/training/documents/:id` | تعديل وثيقة | admin |
| DELETE | `/api/ai/:domain/training/documents/:id` | حذف وثيقة | admin |
| GET | `/api/ai/:domain/training/triggers` | قائمة triggers | admin |
| POST | `/api/ai/:domain/training/triggers` | إضافة trigger | admin |
| PUT | `/api/ai/:domain/training/triggers/:id` | تعديل trigger | admin |
| POST | `/api/ai/:domain/training/triggers/test` | اختبار trigger | admin |
| GET | `/api/ai/:domain/training/evaluation` | نتائج التقييم | admin |
| POST | `/api/ai/:domain/training/evaluation/run` | تشغيل تقييم | admin |

## 5. Templates

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| GET | `/api/ai/:domain/templates` | قائمة القوالب | analyst+ |
| POST | `/api/ai/:domain/templates` | إنشاء قالب | admin |
| PUT | `/api/ai/:domain/templates/:id` | تعديل قالب | admin |
| DELETE | `/api/ai/:domain/templates/:id` | حذف قالب | admin |
| POST | `/api/ai/:domain/templates/:id/generate` | توليد نص من قالب | analyst+ |
| GET | `/api/ai/:domain/templates/:id/versions` | إصدارات القالب | admin |

## 6. Guides

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| GET | `/api/ai/:domain/guides` | قائمة الأدلة المتاحة | ✅ |
| POST | `/api/ai/:domain/guides` | إنشاء دليل | admin |
| PUT | `/api/ai/:domain/guides/:id` | تعديل دليل | admin |
| POST | `/api/ai/:domain/guides/:id/start` | بدء جلسة دليل | ✅ |
| PUT | `/api/ai/:domain/guide-sessions/:id` | تحديث جلسة (خطوة/حالة) | ✅ |
| GET | `/api/ai/:domain/guide-sessions/active` | الجلسة النشطة | ✅ |

## 7. Bulk Operations

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| POST | `/api/ai/:domain/bulk/import` | استيراد جماعي (CSV/JSON/XLSX/ZIP) | admin |
| POST | `/api/ai/:domain/bulk/update` | تعديل جماعي | admin |
| POST | `/api/ai/:domain/bulk/delete` | حذف جماعي (يتطلب تأكيد) | admin |
| GET | `/api/ai/:domain/bulk/jobs/:id` | حالة عملية جماعية | admin |

## 8. Reports & Export

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| POST | `/api/ai/:domain/reports/generate` | إنشاء تقرير | analyst+ |
| GET | `/api/ai/:domain/reports` | قائمة التقارير | viewer+ |
| GET | `/api/ai/:domain/reports/:id/download` | تحميل تقرير (PDF/Excel/CSV) | viewer+ |
| POST | `/api/ai/:domain/export` | تصدير بيانات | analyst+ |

## 9. Charts & Dashboards

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| POST | `/api/ai/:domain/charts/generate` | إنشاء مخطط (PNG) | analyst+ |
| GET | `/api/ai/:domain/charts/:id` | جلب صورة مخطط | viewer+ |
| POST | `/api/ai/:domain/dashboards/generate` | إنشاء لوحة مؤشرات | analyst+ |

## 10. Navigation Consent

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| POST | `/api/ai/:domain/navigate/request` | طلب إذن تنقل | ✅ |
| POST | `/api/ai/:domain/navigate/consent` | استجابة الإذن (سماح/رفض) | ✅ |

## 11. System Health

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| GET | `/api/ai/health` | صحة النظام الشاملة | admin |
| GET | `/api/ai/:domain/health` | صحة المجال | admin |

### استجابة Health (API-21)

```json
{
  "status": "healthy",
  "domain": "leaks",
  "indexReady": true,
  "avgResponseMs": 450,
  "circuitBreaker": "CLOSED",
  "lastKnowledgeRefresh": "2026-02-20T08:00:00Z",
  "criticalErrors": [],
  "uptime": "5d 12h 30m"
}
```

## 12. Audit

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| GET | `/api/ai/:domain/audit` | سجل التدقيق | admin |
| GET | `/api/ai/:domain/audit/export` | تصدير سجل التدقيق | admin |

## 13. Settings & Preferences

| Method | Path | الوصف | Auth |
|--------|------|-------|------|
| GET | `/api/ai/settings` | إعدادات المساعد الذكي | ✅ |
| PUT | `/api/ai/settings` | تحديث الإعدادات | ✅ |
| GET | `/api/ai/settings/proactive` | إعدادات المبادرة | ✅ |
| PUT | `/api/ai/settings/proactive` | تحديث إعدادات المبادرة | ✅ |
| GET | `/api/ai/settings/retention` | سياسات الاحتفاظ | admin |
| PUT | `/api/ai/settings/retention` | تحديث سياسات الاحتفاظ | admin |
