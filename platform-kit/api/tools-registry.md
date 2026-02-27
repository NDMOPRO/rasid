# سجل أدوات المساعدين (Tools Registry)

## المبدأ: كل أداة مقيدة بمجال واحد

---

## أ) أدوات مساعد التسربات (domain = 'leaks')

### A-01: أدوات القراءة (Read Tools)

| الأداة | الوصف | المعلمات | الصلاحيات |
|--------|-------|----------|-----------|
| `get_leaks_dashboard_stats` | إحصائيات لوحة المؤشرات | `period`, `filters` | viewer+ |
| `query_monitoring_cases` | استعلام حالات الرصد | `status`, `sector`, `dateRange`, `limit`, `offset` | viewer+ |
| `get_case_details` | تفاصيل حالة رصد | `caseId` | viewer+ |
| `get_case_evidence` | الأدلة الرقمية لحالة | `caseId` | analyst+ |
| `get_channels` | قائمة القنوات | `type`, `status` | viewer+ |
| `get_vendors` | قائمة البائعين | `status`, `limit` | analyst+ |
| `get_alerts` | التنبيهات | `status`, `severity`, `limit` | viewer+ |
| `get_reports_archive` | التقارير والأرشيف | `type`, `dateRange` | viewer+ |
| `get_audit_log` | سجل التدقيق | `action`, `userId`, `dateRange` | admin |
| `get_users` | قائمة المستخدمين | `role`, `status` | admin |
| `search_knowledge_base` | البحث في المعرفة | `query`, `topK` | viewer+ |

### A-02: أدوات التحليل (Analysis Tools)

| الأداة | الوصف | المعلمات | الصلاحيات |
|--------|-------|----------|-----------|
| `analyze_trends` | تحليل اتجاهات حالات الرصد | `metric`, `period`, `groupBy` | analyst+ |
| `analyze_correlations` | تحليل الارتباطات | `dimension1`, `dimension2`, `period` | analyst+ |
| `analyze_user_activity` | تحليل نشاط المستخدمين | `userId`, `period` | admin |

### A-03: أدوات التنفيذ (Execute Tools)

| الأداة | الوصف | المعلمات | الصلاحيات | تأكيد |
|--------|-------|----------|-----------|-------|
| `scan_direct` | فحص مباشر | `target`, `scanType` | analyst+ | ✅ |
| `scan_pii` | فحص PII | `sampleId`, `dataTypes` | analyst+ | ✅ |
| `create_monitoring_case` | إنشاء حالة رصد | `caseName`, `claimedCount`, `source`, `sector` | analyst+ | ✅ |
| `update_case_status` | تحديث حالة | `caseId`, `newStatus`, `reason` | analyst+ | ✅ |
| `generate_report` | إنشاء تقرير | `templateId`, `filters`, `format` | analyst+ | ✅ |
| `create_alert_channel` | إنشاء قناة تنبيه | `name`, `type`, `config` | admin | ✅ |
| `create_alert_rule` | إنشاء قاعدة تنبيه | `name`, `conditions`, `channelId` | admin | ✅ |

### A-04: أدوات السياق والدليل والذاكرة

| الأداة | الوصف | المعلمات | الصلاحيات |
|--------|-------|----------|-----------|
| `get_page_context` | جلب سياق الصفحة | `pageId` | viewer+ |
| `search_glossary` | البحث في القاموس | `query` | viewer+ |
| `start_live_guide` | بدء دليل حي | `guideId` | viewer+ |
| `list_guides` | قائمة الأدلة المتاحة | `role` | viewer+ |
| `guide_step_action` | تنفيذ خطوة في الدليل | `sessionId`, `action` | viewer+ |
| `manage_task_memory` | إدارة ذاكرة المهمة | `action`, `data` | viewer+ |

### A-05: أدوات الأمان والتأكيد

| الأداة | الوصف | المعلمات | الصلاحيات | تأكيد |
|--------|-------|----------|-----------|-------|
| `do_it_for_me` | تنفيذ مهمة بالنيابة | `taskDescription`, `params` | analyst+ | ✅ إلزامي |
| `rollback_action` | التراجع عن إجراء | `actionRunId` | analyst+ | ✅ إلزامي |

---

## ب) أدوات مساعد الخصوصية (domain = 'privacy')

### B-01: أدوات القراءة

| الأداة | الوصف | المعلمات | الصلاحيات |
|--------|-------|----------|-----------|
| `get_compliance_summary` | ملخص الامتثال | `period`, `sector` | viewer+ |
| `query_sites` | قائمة مواقع بفلاتر | `sector`, `status`, `complianceRange`, `limit` | viewer+ |
| `get_site_details` | تفاصيل موقع | `siteId` | viewer+ |
| `get_policy_versions` | نسخ السياسة | `siteId`, `limit` | analyst+ |
| `compare_policies` | مقارنة نسختين | `versionId1`, `versionId2` | analyst+ |
| `get_material_changes` | التغييرات الجوهرية | `siteId`, `dateRange` | analyst+ |
| `get_followups` | المتابعات | `status`, `siteId`, `limit` | viewer+ |
| `get_privacy_reports` | التقارير | `type`, `dateRange` | viewer+ |

### B-02: أدوات التحليل

| الأداة | الوصف | المعلمات | الصلاحيات |
|--------|-------|----------|-----------|
| `analyze_missing_clauses` | أكثر المتطلبات نقصاً | `sector`, `period` | analyst+ |
| `analyze_score_changes` | لماذا تغيرت النتائج | `siteId`, `period` | analyst+ |
| `compare_sectors` | مقارنة قطاعات | `sectors`, `metric`, `period` | analyst+ |
| `executive_summary` | ملخص قيادي | `period` | admin |

### B-03: أدوات التنفيذ

| الأداة | الوصف | المعلمات | الصلاحيات | تأكيد |
|--------|-------|----------|-----------|-------|
| `create_followup` | إنشاء متابعة | `siteId`, `type`, `notes` | analyst+ | ✅ |
| `generate_privacy_report` | إنشاء تقرير | `templateId`, `filters`, `format` | analyst+ | ✅ |
| `schedule_report` | جدولة تقرير | `reportConfig`, `schedule` | admin | ✅ |
| `start_privacy_guide` | بدء دليل حي | `guideId` | viewer+ | ❌ |

---

## آلية التسجيل والتدقيق

كل استدعاء أداة يُسجل تلقائياً:

```typescript
interface ToolCallAudit {
  domain: 'leaks' | 'privacy';
  toolName: string;
  userId: number;
  conversationId: string;
  params: Record<string, any>;
  result: 'success' | 'failure' | 'denied';
  resultSummary: string;
  executionTimeMs: number;
  timestamp: string;
}
```

## آلية التأكيد (للأدوات التنفيذية)

```
1. Plan:    المساعد يعرض ما سيتم تنفيذه
2. Preview: معاينة قبل/بعد (إن أمكن)
3. Confirm: المستخدم يؤكد أو يلغي
4. Execute: تنفيذ العملية
5. Result:  عرض النتيجة
6. Rollback: التراجع (إن أمكن وطلب المستخدم)
```
