# مواصفات Page Context Pack - راصد الذكي

## المتطلبات المغطاة
UI-06, UI-07, PR-12

---

## المبدأ

كل رسالة يرسلها المستخدم تُرفق بها معلومات سياقية عن الصفحة الحالية، مما يمكّن المساعد من فهم السياق وتقديم إجابات دقيقة.

---

## هيكل Page Context Pack

```typescript
interface PageContextPack {
  // معلومات الصفحة
  route: string;                    // "/app/leaks/cases"
  pageId: string;                   // "leaks_cases"
  domain: 'leaks' | 'privacy';     // المجال

  // الفلاتر النشطة
  activeFilters: Record<string, any>; // {"status": "حالة رصد", "sector": "بنوك"}

  // الكيان الحالي (إن وجد)
  currentEntityId?: string;         // "case_123"
  currentEntityType?: string;       // "monitoring_case"

  // الإجراءات المتاحة في الصفحة
  availableActions: string[];       // ["create", "export", "filter", "delete"]

  // معلومات المستخدم
  userRole: string;                 // "admin" | "analyst" | "viewer"
  userId: number;

  // أعلام الميزات المؤثرة
  featureFlags: Record<string, boolean>; // {"guides_enabled": true, "bulk_import": true}

  // بيانات إضافية
  visibleColumns?: string[];        // الأعمدة المرئية في الجدول
  sortBy?: string;                  // ترتيب حالي
  selectedItems?: string[];         // العناصر المحددة
}
```

---

## أمثلة حسب الصفحة

### 1. لوحة مؤشرات التسربات

```json
{
  "route": "/app/leaks/dashboard",
  "pageId": "leaks_dashboard",
  "domain": "leaks",
  "activeFilters": {
    "period": "last_7_days"
  },
  "currentEntityId": null,
  "currentEntityType": null,
  "availableActions": ["filter", "export", "generate_report"],
  "userRole": "admin",
  "userId": 1,
  "featureFlags": {
    "charts_enabled": true,
    "proactive_assistance": true
  }
}
```

### 2. تفاصيل حالة رصد

```json
{
  "route": "/app/leaks/cases/123",
  "pageId": "leaks_case_detail",
  "domain": "leaks",
  "activeFilters": {},
  "currentEntityId": "123",
  "currentEntityType": "monitoring_case",
  "availableActions": ["update_status", "add_evidence", "generate_report", "send_notification"],
  "userRole": "analyst",
  "userId": 5,
  "featureFlags": {
    "pii_scan": true,
    "direct_scan": true
  }
}
```

### 3. قائمة مواقع الخصوصية

```json
{
  "route": "/app/privacy/sites",
  "pageId": "privacy_sites",
  "domain": "privacy",
  "activeFilters": {
    "sector": "حكومي",
    "complianceRange": "0-50"
  },
  "currentEntityId": null,
  "currentEntityType": null,
  "availableActions": ["filter", "export", "reassess", "create_followup"],
  "userRole": "analyst",
  "userId": 5,
  "featureFlags": {
    "bulk_reassess": true
  },
  "visibleColumns": ["siteName", "domain", "sector", "complianceScore", "lastAssessment"],
  "sortBy": "complianceScore:asc"
}
```

---

## التحديث التلقائي (UI-07)

يتم تحديث Page Context Pack تلقائياً عند:

| الحدث | التحديث |
|-------|---------|
| تغيير الصفحة (route change) | كامل |
| تغيير الفلاتر | `activeFilters` |
| اختيار كيان (نقر على صف) | `currentEntityId` + `currentEntityType` |
| تغيير الأعمدة المرئية | `visibleColumns` |
| تغيير الترتيب | `sortBy` |
| تحديد عناصر متعددة | `selectedItems` |

### التنفيذ

```typescript
// React Hook لإدارة Page Context
function usePageContext(domain: 'leaks' | 'privacy') {
  const location = useLocation();
  const { user } = useAuth();
  const { featureFlags } = useFeatureFlags();
  const [context, setContext] = useState<PageContextPack>(buildInitialContext());

  // تحديث عند تغيير الصفحة
  useEffect(() => {
    setContext(prev => ({
      ...prev,
      route: location.pathname,
      pageId: resolvePageId(location.pathname),
      domain,
      activeFilters: {},
      currentEntityId: extractEntityId(location.pathname),
      currentEntityType: extractEntityType(location.pathname),
      availableActions: getActionsForPage(location.pathname, user.role),
      userRole: user.role,
      userId: user.id,
      featureFlags: getRelevantFlags(location.pathname, featureFlags)
    }));
  }, [location.pathname, domain, user]);

  // تحديث الفلاتر
  const updateFilters = (filters: Record<string, any>) => {
    setContext(prev => ({ ...prev, activeFilters: filters }));
  };

  // تحديث الكيان المحدد
  const selectEntity = (entityId: string, entityType: string) => {
    setContext(prev => ({
      ...prev,
      currentEntityId: entityId,
      currentEntityType: entityType
    }));
  };

  return { context, updateFilters, selectEntity };
}
```

---

## كيف يستخدمه المساعد (PR-12)

```
المستخدم في صفحة: /app/leaks/cases
الفلاتر: status = "حالة رصد", sector = "بنوك"
السؤال: "كم عددها؟"

→ المساعد يفهم:
  "كم عدد حالات الرصد في قطاع البنوك؟"
  (بناءً على route + activeFilters)

→ يستدعي: query_monitoring_cases({status: "حالة رصد", sector: "بنوك"})

→ يقدم اقتراحات مرتبطة:
  "عرض التفاصيل" | "فلترة بفترة مختلفة" | "إنشاء تقرير"
```
