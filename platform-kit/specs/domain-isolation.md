# مواصفات عزل المجال (Domain Isolation)

## المبدأ الأساسي

> كل مساعد يعمل في فقاعة معرفية معزولة تماماً. لا يوجد تقاطع في البيانات أو الأدوات أو المعرفة بين المجالين.

---

## المجالات المعرفة

```typescript
type Domain = 'leaks' | 'privacy';
```

| المجال | المساعد | الوصف |
|--------|---------|-------|
| `leaks` | مساعد التسربات | رصد ومتابعة حالات رصد تسرب البيانات الشخصية |
| `privacy` | مساعد الخصوصية | تقييم امتثال سياسات الخصوصية للمادة 12 من PDPL |

---

## متطلبات العزل (GOV-01, GOV-02, GOV-03)

### 1. عزل المعرفة

| المكون | التسربات (`leaks`) | الخصوصية (`privacy`) | مشترك |
|--------|-------------------|---------------------|-------|
| مكتبة المعرفة | ✅ مستقلة | ✅ مستقلة | ❌ |
| مركز التدريب | ✅ مستقل | ✅ مستقل | ❌ |
| Glossary | ✅ مستقل | ✅ مستقل | ❌ |
| Page Descriptors | ✅ مستقلة | ✅ مستقلة | ❌ |
| Evaluation Set | ✅ مستقل | ✅ مستقل | ❌ |
| فهرس RAG | ✅ مستقل | ✅ مستقل | ❌ |
| Task Memory | ✅ مستقلة | ✅ مستقلة | ❌ |
| سجل المحادثات | ✅ مستقل | ✅ مستقل | ❌ |
| Session Summary | ✅ مستقل | ✅ مستقل | ❌ |

### 2. عزل الأدوات

```
مساعد التسربات:
  ✅ get_dashboard_stats (leaks)
  ✅ query_monitoring_cases
  ✅ get_case_details
  ✅ scan_direct / scan_pii
  ✅ create_monitoring_case
  ❌ get_privacy_assessments  ← محظور
  ❌ get_compliance_summary   ← محظور

مساعد الخصوصية:
  ✅ get_compliance_summary
  ✅ get_privacy_assessments
  ✅ get_policy_versions
  ✅ compare_policies
  ❌ query_monitoring_cases   ← محظور
  ❌ get_case_details         ← محظور
```

### 3. عزل البيانات (DB-01, DB-02)

كل جدول يحتوي بيانات مشتركة يجب أن يحمل عمود `domain`:

```sql
-- مثال: جدول المصطلحات
CREATE TABLE glossary_terms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,  -- ← إلزامي
  term VARCHAR(255) NOT NULL,
  synonyms JSON,
  definition TEXT,
  related_page VARCHAR(255),
  example_questions JSON,
  INDEX idx_domain (domain)
);

-- الاستعلام يجب أن يشمل المجال دائماً
SELECT * FROM glossary_terms WHERE domain = 'leaks' AND ...;
```

---

## آلية الفرض (Enforcement)

### على مستوى API (API-01, API-02)

```typescript
// كل طلب يحمل domain
interface AIRequest {
  domain: Domain;        // إلزامي
  message: string;
  conversationId: string;
  pageContext: PageContext;
}

// Middleware يتحقق من العزل
function domainGuard(req: AIRequest) {
  const allowedTools = getToolsForDomain(req.domain);
  const allowedKnowledge = getKnowledgeForDomain(req.domain);

  // رفض أي محاولة وصول لمجال آخر
  if (requestedTool && !allowedTools.includes(requestedTool)) {
    throw new DomainViolationError(
      `الأداة ${requestedTool} غير متاحة في مجال ${req.domain}`
    );
  }
}
```

### على مستوى البرومبت (PR-01)

```
// System Prompt - مساعد التسربات
أنت مساعد متخصص في مجال رصد تسربات البيانات الشخصية.
- لا تجيب على أسئلة تخص سياسات الخصوصية أو الامتثال.
- لا تستخدم أدوات مجال الخصوصية.
- إذا سُئلت عن مجال الخصوصية، أرشد المستخدم لاستخدام مساعد الخصوصية.

// System Prompt - مساعد الخصوصية
أنت مساعد متخصص في تقييم امتثال سياسات الخصوصية.
- لا تجيب على أسئلة تخص تسربات البيانات أو حالات الرصد.
- لا تستخدم أدوات مجال التسربات.
- إذا سُئلت عن مجال التسربات، أرشد المستخدم لاستخدام مساعد التسربات.
```

### على مستوى التدقيق (SEC-01)

```json
{
  "action": "tool_call",
  "domain": "leaks",
  "tool": "query_monitoring_cases",
  "userId": "user_123",
  "timestamp": "2026-02-20T10:30:00Z",
  "result": "success",
  "domainViolation": false
}
```

---

## سيناريوهات الاختبار (T-14, T-15)

| # | السيناريو | النتيجة المتوقعة |
|---|-----------|-----------------|
| 1 | مساعد التسربات يحاول استدعاء `get_privacy_assessments` | رفض مع رسالة خطأ |
| 2 | مساعد الخصوصية يحاول استدعاء `query_monitoring_cases` | رفض مع رسالة خطأ |
| 3 | استعلام RAG للتسربات يبحث في فهرس الخصوصية | لا نتائج (فهرس منفصل) |
| 4 | مركز تدريب التسربات يعرض وثائق الخصوصية | لا تظهر (مفلتر بالمجال) |
| 5 | ذاكرة جلسة التسربات تظهر في جلسة الخصوصية | لا تظهر (معزولة) |
| 6 | مستخدم يسأل مساعد التسربات عن الامتثال | يُرشد للمساعد المناسب |
