# حزمة استخراج الكود الكاملة - Complete Code Extraction Package
# مشروع رصد (Rasid) و رصد للتسريبات (Rasid-Leaks)

> تم استخراج كامل الكود المصدري من المشروعين بدون أي استثناء
> All source code has been fully extracted from both projects without any exceptions

---

## هيكل الحزمة / Package Structure

```
code-export/
├── INDEX.md                          (هذا الملف - فهرس المحتويات)
├── rasid-leaks/                      (مشروع رصد للتسريبات)
│   ├── client-*.md                   (كود الواجهة الأمامية)
│   ├── server-*.md                   (كود الخادم)
│   ├── shared-*.md                   (الكود المشترك)
│   ├── drizzle-*.md                  (قاعدة البيانات)
│   ├── docs-*.md                     (التوثيق)
│   ├── specs.md                      (المواصفات)
│   ├── scripts.md                    (السكربتات)
│   ├── static-export-part-*.md       (الصفحات الثابتة المصدرة)
│   ├── theme-pages.md                (صفحات القوالب)
│   ├── privacy-analysis-*.md         (تحليل الخصوصية)
│   └── root.md                       (ملفات الجذر)
└── rasid/                            (مشروع رصد الرئيسي)
    ├── client-*.md                   (كود الواجهة الأمامية)
    ├── server-*.md                   (كود الخادم)
    ├── shared-*.md                   (الكود المشترك)
    ├── drizzle-*.md                  (قاعدة البيانات)
    ├── docs-*.md                     (التوثيق)
    ├── specs.md                      (المواصفات)
    ├── platform-kit.md               (حزمة المنصة)
    ├── scripts.md                    (السكربتات)
    └── root.md                       (ملفات الجذر)
```

---

## إحصائيات الاستخراج / Extraction Statistics

### مشروع rasid-leaks
- **إجمالي الملفات المستخرجة:** 2,925 ملف
- **عدد مستندات MD:** 52 مستند
- **يشمل:** TypeScript, TSX, JavaScript, HTML, CSS, SQL, Python, JSON, YAML, Shell Scripts, Markdown

### مشروع rasid
- **إجمالي الملفات المستخرجة:** 586 ملف
- **عدد مستندات MD:** 38 مستند
- **يشمل:** TypeScript, TSX, JavaScript, HTML, CSS, SQL, JSON, YAML, Shell Scripts, Markdown

### ملاحظات
- تم استبعاد الملفات الثنائية فقط (صور PNG/JPG/WebP، خطوط، أرشيفات مضغوطة)
- تم تضمين جميع ملفات الكود والإعدادات والتوثيق بالكامل
- الملفات الكبيرة جداً (> 500KB) تم تضمين أول 500 سطر منها

---

## محتويات مفصلة / Detailed Contents


### مشروع rasid-leaks (رصد للتسريبات)

| الملف | الحجم | الوصف |
|-------|-------|-------|
| [`client-charts.md`](rasid-leaks/client-charts.md) | 17K | مكونات الرسوم البيانية |
| [`client-components.md`](rasid-leaks/client-components.md) | 1.1M | مكونات React الرئيسية |
| [`client-contexts.md`](rasid-leaks/client-contexts.md) | 77K | سياقات React |
| [`client-core.md`](rasid-leaks/client-core.md) | 2.5K | النواة الأساسية للعميل |
| [`client-hooks.md`](rasid-leaks/client-hooks.md) | 41K | خطافات React المخصصة |
| [`client-leaks.md`](rasid-leaks/client-leaks.md) | 850K | صفحات ومكونات التسريبات |
| [`client-lib.md`](rasid-leaks/client-lib.md) | 110K | مكتبات ومساعدات العميل |
| [`client-pages-admin.md`](rasid-leaks/client-pages-admin.md) | 145K | صفحات لوحة الإدارة |
| [`client-pages.md`](rasid-leaks/client-pages.md) | 2.3M | جميع صفحات التطبيق |
| [`client-rasid-features.md`](rasid-leaks/client-rasid-features.md) | 1.5K | ميزات رصد الخاصة |
| [`client-root.md`](rasid-leaks/client-root.md) | 47K | ملفات جذر العميل |
| [`client-src.md`](rasid-leaks/client-src.md) | 378K | ملفات مصدر العميل |
| [`client-styles.md`](rasid-leaks/client-styles.md) | 97K | ملفات الأنماط CSS |
| [`client-ui-components.md`](rasid-leaks/client-ui-components.md) | 181K | مكونات واجهة المستخدم |
| [`data.md`](rasid-leaks/data.md) | 51K | ملفات البيانات JSON |
| [`docs-core.md`](rasid-leaks/docs-core.md) | 8.0K | التوثيق |
| [`docs-design.md`](rasid-leaks/docs-design.md) | 4.0K | التوثيق |
| [`docs-integration.md`](rasid-leaks/docs-integration.md) | 2.5K | التوثيق |
| [`docs-management.md`](rasid-leaks/docs-management.md) | 3.0K | التوثيق |
| [`docs-operations.md`](rasid-leaks/docs-operations.md) | 2.5K | التوثيق |
| [`docs-other.md`](rasid-leaks/docs-other.md) | 16K | التوثيق |
| [`docs-planning.md`](rasid-leaks/docs-planning.md) | 5.5K | التوثيق |
| [`docs-testing.md`](rasid-leaks/docs-testing.md) | 3.0K | التوثيق |
| [`drizzle-meta.md`](rasid-leaks/drizzle-meta.md) | 289K | بيانات تعريف قاعدة البيانات |
| [`drizzle.md`](rasid-leaks/drizzle.md) | 251K | مخططات وترحيلات قاعدة البيانات |
| [`github-workflows.md`](rasid-leaks/github-workflows.md) | 1.0K | إعدادات GitHub CI/CD |
| [`manus-db.md`](rasid-leaks/manus-db.md) | 99K | استعلامات قاعدة بيانات Manus |
| [`patches.md`](rasid-leaks/patches.md) | 1.5K | تصحيحات الحزم |
| [`privacy-analysis-json.md`](rasid-leaks/privacy-analysis-json.md) | 195K | بيانات تحليل الخصوصية |
| [`privacy-analysis-texts-part-aa.md`](rasid-leaks/privacy-analysis-texts-part-aa.md) | 10M | بيانات تحليل الخصوصية |
| [`privacy-analysis-texts-part-ab.md`](rasid-leaks/privacy-analysis-texts-part-ab.md) | 10M | بيانات تحليل الخصوصية |
| [`privacy-analysis-texts-part-ac.md`](rasid-leaks/privacy-analysis-texts-part-ac.md) | 5.7M | بيانات تحليل الخصوصية |
| [`privacy-analysis.md`](rasid-leaks/privacy-analysis.md) | 196K | بيانات تحليل الخصوصية |
| [`root.md`](rasid-leaks/root.md) | 315K | ملفات الجذر والإعدادات |
| [`scripts.md`](rasid-leaks/scripts.md) | 97K | سكربتات البناء والنشر |
| [`server-core-types.md`](rasid-leaks/server-core-types.md) | 2.0K | أنواع TypeScript للخادم |
| [`server-core.md`](rasid-leaks/server-core.md) | 117K | النواة الأساسية للخادم |
| [`server-middleware.md`](rasid-leaks/server-middleware.md) | 11K | وسيطات الخادم |
| [`server-privacy.md`](rasid-leaks/server-privacy.md) | 21K | وحدة الخصوصية |
| [`server-rasid-enhancements.md`](rasid-leaks/server-rasid-enhancements.md) | 177K | تحسينات رصد الذكية |
| [`server-tests.md`](rasid-leaks/server-tests.md) | 27K | اختبارات الخادم |
| [`server.md`](rasid-leaks/server.md) | 1.9M | كود الخادم الرئيسي |
| [`shared-core.md`](rasid-leaks/shared-core.md) | 1.0K | النواة المشتركة |
| [`shared.md`](rasid-leaks/shared.md) | 12K | الكود المشترك |
| [`specs.md`](rasid-leaks/specs.md) | 63K | المواصفات التقنية |
| [`static-export-part-aa.md`](rasid-leaks/static-export-part-aa.md) | 50M | صفحات HTML المصدرة |
| [`static-export-part-ab.md`](rasid-leaks/static-export-part-ab.md) | 50M | صفحات HTML المصدرة |
| [`static-export-part-ac.md`](rasid-leaks/static-export-part-ac.md) | 50M | صفحات HTML المصدرة |
| [`static-export-part-ad.md`](rasid-leaks/static-export-part-ad.md) | 50M | صفحات HTML المصدرة |
| [`static-export-part-ae.md`](rasid-leaks/static-export-part-ae.md) | 50M | صفحات HTML المصدرة |
| [`static-export-part-af.md`](rasid-leaks/static-export-part-af.md) | 50M | صفحات HTML المصدرة |
| [`static-export-part-ag.md`](rasid-leaks/static-export-part-ag.md) | 18M | صفحات HTML المصدرة |
| [`theme-pages.md`](rasid-leaks/theme-pages.md) | 1.2M | صفحات القوالب |

### مشروع rasid (رصد الرئيسي)

| الملف | الحجم | الوصف |
|-------|-------|-------|
| [`client-charts.md`](rasid/client-charts.md) | 17K | مكونات الرسوم البيانية |
| [`client-components.md`](rasid/client-components.md) | 786K | مكونات React الرئيسية |
| [`client-contexts.md`](rasid/client-contexts.md) | 19K | سياقات React |
| [`client-core.md`](rasid/client-core.md) | 2.5K | النواة الأساسية للعميل |
| [`client-hooks.md`](rasid/client-hooks.md) | 36K | خطافات React المخصصة |
| [`client-lib.md`](rasid/client-lib.md) | 84K | مكتبات ومساعدات العميل |
| [`client-pages-admin.md`](rasid/client-pages-admin.md) | 93K | صفحات لوحة الإدارة |
| [`client-pages.md`](rasid/client-pages.md) | 2.9M | جميع صفحات التطبيق |
| [`client-rasid-features.md`](rasid/client-rasid-features.md) | 1.5K | ميزات رصد الخاصة |
| [`client-root.md`](rasid/client-root.md) | 35K | ملفات جذر العميل |
| [`client-src.md`](rasid/client-src.md) | 90K | ملفات مصدر العميل |
| [`client-styles.md`](rasid/client-styles.md) | 4.0K | ملفات الأنماط CSS |
| [`client-ui-components.md`](rasid/client-ui-components.md) | 181K | مكونات واجهة المستخدم |
| [`data.md`](rasid/data.md) | 55K | ملفات البيانات JSON |
| [`docs-core.md`](rasid/docs-core.md) | 11K | التوثيق |
| [`docs-design.md`](rasid/docs-design.md) | 4.0K | التوثيق |
| [`docs-integration.md`](rasid/docs-integration.md) | 2.5K | التوثيق |
| [`docs-management.md`](rasid/docs-management.md) | 3.0K | التوثيق |
| [`docs-operations.md`](rasid/docs-operations.md) | 2.5K | التوثيق |
| [`docs-other.md`](rasid/docs-other.md) | 16K | التوثيق |
| [`docs-planning.md`](rasid/docs-planning.md) | 5.5K | التوثيق |
| [`docs-testing.md`](rasid/docs-testing.md) | 3.0K | التوثيق |
| [`drizzle-meta.md`](rasid/drizzle-meta.md) | 289K | بيانات تعريف قاعدة البيانات |
| [`drizzle.md`](rasid/drizzle.md) | 231K | مخططات وترحيلات قاعدة البيانات |
| [`manus-db.md`](rasid/manus-db.md) | 99K | استعلامات قاعدة بيانات Manus |
| [`patches.md`](rasid/patches.md) | 1.5K | تصحيحات الحزم |
| [`platform-kit.md`](rasid/platform-kit.md) | 183K | حزمة أدوات المنصة |
| [`root.md`](rasid/root.md) | 59K | ملفات الجذر والإعدادات |
| [`scripts.md`](rasid/scripts.md) | 21K | سكربتات البناء والنشر |
| [`server-core-types.md`](rasid/server-core-types.md) | 2.0K | أنواع TypeScript للخادم |
| [`server-core.md`](rasid/server-core.md) | 117K | النواة الأساسية للخادم |
| [`server-middleware.md`](rasid/server-middleware.md) | 9.0K | وسيطات الخادم |
| [`server-rasid-enhancements.md`](rasid/server-rasid-enhancements.md) | 157K | تحسينات رصد الذكية |
| [`server-tests.md`](rasid/server-tests.md) | 27K | اختبارات الخادم |
| [`server.md`](rasid/server.md) | 1.7M | كود الخادم الرئيسي |
| [`shared-core.md`](rasid/shared-core.md) | 1.0K | النواة المشتركة |
| [`shared.md`](rasid/shared.md) | 3.5K | الكود المشترك |
| [`specs.md`](rasid/specs.md) | 63K | المواصفات التقنية |
