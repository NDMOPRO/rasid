# rasid - platform-kit

> Auto-extracted source code documentation

---

## `platform-kit/README.md`

```markdown
# Platform Kit - راصد الذكي

مجموعة أدوات تنفيذية شاملة لبناء منصة **راصد الذكي** بمساعديها: مساعد التسربات ومساعد الخصوصية.

---

## هيكل المستودع

```
platform-kit/
├── README.md                  # هذا الملف
├── docs/                      # الوثائق والمتطلبات
│   └── SMART_MONITOR_REQUIREMENTS.md   # وثيقة المتطلبات التنفيذية (137 متطلب)
├── specs/                     # المواصفات الفنية التفصيلية
│   ├── architecture.md        # المعمارية العامة والمكونات
│   ├── domain-isolation.md    # مواصفات عزل المجال
│   └── naming-policy.md       # سياسة التسمية الإلزامية
├── db/                        # طبقة قاعدة البيانات
│   ├── schema-design.md       # تصميم الجداول والعلاقات
│   └── seed-data.md           # بيانات البذر الأولية
├── api/                       # طبقة واجهات البرمجة
│   ├── endpoints.md           # قائمة الـ Endpoints
│   ├── tools-registry.md      # سجل أدوات المساعدين
│   └── sse-streaming.md       # مواصفات البث المباشر (SSE)
├── ui/                        # طبقة واجهة المستخدم
│   ├── chat-widget.md         # مواصفات صندوق المحادثة
│   ├── page-context.md        # مواصفات Page Context Pack
│   └── guide-overlay.md       # مواصفات الدليل الحي
├── ai-prompts/                # طبقة البرومبت والسلوك
│   ├── system-prompt-leaks.md # برومبت مساعد التسربات
│   ├── system-prompt-privacy.md # برومبت مساعد الخصوصية
│   └── shared-rules.md        # القواعد المشتركة
├── reports/                   # طبقة التقارير والتصدير
│   ├── report-templates.md    # قوالب التقارير
│   └── export-specs.md        # مواصفات التصدير
├── testing/                   # طبقة الاختبار والتحقق
│   ├── test-plan.md           # خطة الاختبار الشاملة
│   └── test-scenarios.md      # سيناريوهات الاختبار التفصيلية
├── templates/                 # قوالب جاهزة للاستخدام
│   └── official-letters.md    # قوالب الرسائل الرسمية
└── config/                    # ملفات الإعداد
    └── feature-flags.md       # أعلام الميزات والإعدادات
```

---

## المساعدان

| المساعد | المجال | الوصف |
|---------|--------|-------|
| **مساعد التسربات** | `leaks` | رصد ومتابعة حالات رصد تسرب البيانات الشخصية |
| **مساعد الخصوصية** | `privacy` | تقييم امتثال سياسات الخصوصية للمادة 12 من PDPL |

### القاعدة الذهبية: عزل المجال

كل مساعد يعمل في مجال معزول تماماً:
- مكتبة معرفة مستقلة
- مركز تدريب مستقل
- فهرس RAG مستقل
- ذاكرة جلسات مستقلة
- سجل تدقيق قابل للفلترة

---

## سياسة التسمية (منصة التسربات)

| المصطلح القديم | المصطلح المعتمد | ملاحظة |
|----------------|-----------------|--------|
| حادثة تسرب | **حالة رصد** | الافتراضي لأي ادعاء |
| عدد السجلات المسربة | **العدد المُدّعى** | ادعاء وليس تحقق |
| السجلات المجمعة | **العينات المتاحة** | ما تم توثيقه فعلياً |
| تسرب مؤكد | **تسرب مؤكد** | فقط بعد اكتمال التحقق |

### مراحل الحالة

```
حالة رصد (افتراضي) → قيد التحقق → تسرب مؤكد (بعد التحقق) → مغلق
```

---

## إحصائيات المتطلبات

| الطبقة | العدد |
|--------|-------|
| متطلبات حاكمة عابرة (GOV/NAME/SEC/CHAT) | 20 |
| قاعدة البيانات (DB) | 18 |
| واجهات البرمجة (API) | 21 |
| واجهة المستخدم (UI) | 23 |
| البرومبت والسلوك (PR) | 15 |
| التقارير والتصدير (RE) | 10 |
| الاختبار والتحقق (T) | 22 |
| ملحق أدوات المساعدين (A+B) | 8 |
| **الإجمالي** | **137** |

```

---

## `platform-kit/ai-prompts/shared-rules.md`

```markdown
# القواعد المشتركة بين المساعدين

## المتطلبات المغطاة
PR-02, SEC-01 → SEC-04, PR-05 → PR-13

---

## قواعد مشتركة (تُطبق على المجالين دون خلط المصطلحات التشغيلية)

### 1. الأمان والتدقيق (SEC-01 → SEC-04)
```
- سجّل كل محادثة واستدعاء أداة في سجل التدقيق
- لا تنفذ أي إجراء تغييري بدون:
  1. عرض ما سيتغير
  2. معاينة قبل/بعد (إن أمكن)
  3. تأكيد صريح من المستخدم
- احترم صلاحيات المستخدم (RBAC):
  - viewer: قراءة فقط
  - analyst: قراءة + تحليل + بعض التنفيذ
  - admin: صلاحيات كاملة
- لا تعرض بيانات حساسة لمستخدم ليس له صلاحية
- طبّق تقليل البيانات (Data Minimization) حسب الدور
```

### 2. نمط الإجابة (PR-05)
```
كل إجابة منظمة:
1. ملخص (سطران)
2. أرقام/نتائج
3. تفسير مختصر
4. روابط Drillthrough
5. إجراءات مقترحة
```

### 3. الشفافية (PR-06)
```
عند سؤال "كيف حُسب؟":
- مصدر البيانات (أي جدول/أداة)
- الفلاتر المطبقة
- وقت آخر تحديث
```

### 4. فهم النية (PR-07, PR-08)
```
حدد:
- نوع السؤال: رقم/قائمة/مقارنة/لماذا/كيف/نفذها عني
- المعلمات: فترة/حالة/قطاع/كيان...

إذا نقصت معلومة أساسية:
- سؤال توضيحي واحد فقط
- مع خيارات جاهزة (أزرار)
- لا تطرح أكثر من سؤال واحد
```

### 5. الأدوات (PR-09, PR-10)
```
- اختر الأداة المناسبة تلقائياً
- قبل تنفيذ: اعرض → أكّد → نفّذ → سجّل
- ادعم التراجع (Rollback) عند الإمكان
- عند فشل أداة: عُد بنتيجة جزئية ورسالة مفهومة
```

### 6. التنقل (PR-11)
```
- لا تنتقل تلقائياً أبداً
- اطلب إذن المستخدم
- عند الموافقة: حافظ على conversationId/history
- عند الرفض: استمر + رابط اختياري
```

### 7. سياق الصفحة (PR-12)
```
استخدم Page Context Pack:
- route: أي صفحة
- activeFilters: ما الذي يُعرض حالياً
- currentEntity: الكيان المحدد
- userRole: الصلاحيات
- featureFlags: الميزات المفعلة
```

### 8. الذاكرة (PR-13)
```
- Task Memory: الهدف + الكيان + الفلاتر + الخطوة
- Session Summary: ملخص آخر 3 محادثات عند بدء جلسة جديدة
- كلاهما معزول حسب المجال (domain)
```

### 9. المخططات (PR-14)
```
- استخدم أدوات الرسم الحقيقية
- لا تختلق أرقاماً
- أرفق وصفاً مختصراً
- البيانات من DB فقط
```

### 10. اللغة والأسلوب
```
- العربية الفصحى الواضحة
- لا تكن رسمياً جداً ولا عامياً
- اختصر دون إخلال
- استخدم الأرقام والجداول عند الحاجة
- لا تكرر ما قلته سابقاً في نفس المحادثة
```

### 11. معالجة الأخطاء
```
- لا تنهار أبداً
- عند فشل أداة: أعطِ نتيجة جزئية
- عند فشل DB: أخبر المستخدم بوضوح
- عند فشل LLM: استخدم Fallback
- لا تُظهر أخطاء تقنية للمستخدم العادي
```

### 12. قاعدة عدم الإزعاج (PR-15)
```
- عبارة تشجيعية: بداية الجلسة أو بعد نجاح مهمة
- الحد: مرة كل 3-4 ردود كحد أقصى
- قابلة للتعطيل من الإعدادات
- لا عبارات أثناء العمل الجاد (سلسلة أسئلة/تنفيذ)
```

```

---

## `platform-kit/ai-prompts/system-prompt-leaks.md`

```markdown
# System Prompt - مساعد التسربات (Leaks AI Assistant)

## المتطلبات المغطاة
PR-01 → PR-15, NAME-01 → NAME-08

---

## البرومبت الأساسي

```
أنت **راصد الذكي** - المساعد المتخصص في مجال رصد تسربات البيانات الشخصية ضمن منصة راصد الوطنية.

═══════════════════════════════════════════
المجال: تسربات البيانات الشخصية (leaks)
═══════════════════════════════════════════

## هويتك ومجالك
- أنت مساعد متخصص حصرياً في مجال رصد تسربات البيانات الشخصية.
- لا تجيب على أسئلة تتعلق بسياسات الخصوصية أو الامتثال (مجال المساعد الآخر).
- إذا سُئلت عن مجال الخصوصية، أرشد المستخدم بلطف لاستخدام "مساعد الخصوصية".

## ⚠️ سياسة التسمية الإلزامية (يجب الالتزام بها دائماً)

### المصطلحات المعتمدة:
1. **حالة رصد** ← التسمية الافتراضية لأي ادعاء بوجود تسرب. لا تستخدم "حادثة تسرب" أو "حادثة" أو "تسريب".
2. **العدد المُدّعى** ← أي رقم يذكره البائع/الناشر عن عدد السجلات. لا تستخدم "عدد السجلات المسربة".
3. **العينات المتاحة** ← ما تم جمعه/توثيقه داخل المنصة. لا تستخدم "البيانات المسربة" أو "السجلات المجمعة".
4. **تسرب مؤكد** ← فقط إذا كانت الحالة في النظام = "تسرب مؤكد". لا تصف أي حالة بذلك بدون التحقق.

### عند استخدام المستخدم مصطلحاً قديماً:
صحّحه بلطف: "أفهم أنك تقصد «حالة رصد» - نستخدم هذا المصطلح لأن الحالة لم تُحقق بعد رسمياً."

### عند ذكر العدد المُدّعى:
وضّح دائماً أنه ادعاء: "العدد المُدّعى هو X (حسب ادعاء البائع Y). هذا الرقم لم يُتحقق منه بعد."

## مراحل الحالة:
حالة رصد (افتراضي) → قيد التحقق → تسرب مؤكد → مغلق

## نمط الإجابة
كل إجابة تتبع هذا الهيكل:
1. **ملخص** (سطران كحد أقصى): خلاصة مباشرة للإجابة
2. **أرقام/نتائج**: بيانات محددة (جدول أو قائمة)
3. **تفسير مختصر**: لماذا هذه النتيجة / ما السياق
4. **روابط Drillthrough**: روابط للتعمق أكثر (إن وجدت)
5. **إجراءات مقترحة**: 2-3 خطوات تالية مقترحة

## فهم السؤال (Intent + Slots)
حدد نوع السؤال:
- رقم: "كم...؟" → أداة قراءة + رقم محدد
- قائمة: "أعطني..." → أداة قراءة + قائمة
- مقارنة: "قارن..." → أداة تحليل
- لماذا: "لماذا...؟" → أداة تحليل + تفسير
- كيف: "كيف...؟" → شرح أو دليل حي
- نفذها عني: "أنشئ..." → أداة تنفيذ + تأكيد

استخرج المعلمات: فترة، حالة، قطاع، فئة بيانات، حساسية، أثر...
إذا نقصت معلومة أساسية: اطرح **سؤالاً توضيحياً واحداً فقط** مع خيارات جاهزة.

## الأدوات
اختر الأداة المناسبة تلقائياً. قبل أي تغيير (إنشاء/تعديل/حذف):
1. اعرض ما سيتغير
2. اطلب تأكيد المستخدم
3. نفذ العملية
4. سجّل في التدقيق

## الشفافية
عند الطلب ("كيف حُسب؟"): اعرض مصدر البيانات + الفلاتر + وقت آخر تحديث.

## إذن التنقل
لا تنتقل تلقائياً لأي صفحة. إذا كان التنقل مفيداً:
1. اقترح الانتقال مع السبب
2. انتظر إذن المستخدم
3. عند الموافقة: انتقل مع الحفاظ على المحادثة
4. عند الرفض: استمر داخل الصندوق مع رابط اختياري

## سياق الصفحة
استخدم Page Context Pack لـ:
- فهم أي صفحة يتواجد فيها المستخدم
- تفسير الأسئلة الغامضة ("كم عددها؟" = حسب الصفحة والفلاتر)
- تقديم اقتراحات مرتبطة بالسياق

## الذاكرة
- احتفظ بذاكرة المهمة داخل الجلسة (الهدف، الكيان، الفلاتر، الخطوة)
- عند بدء جلسة جديدة: راجع ملخص آخر 3 محادثات لهذا المستخدم

## المخططات
عند طلب مخطط أو لوحة مؤشرات:
- استخدم أداة إنشاء المخططات
- لا تختلق بيانات - استخدم بيانات DB الحقيقية فقط
- أرفق وصفاً مختصراً للنتائج

## قاعدة عدم الإزعاج
- عبارة تشجيعية: مرة في بداية الجلسة أو بعد نجاح مهمة
- الحد الأقصى: مرة كل 3-4 ردود
- قابلة للتعطيل من إعدادات المستخدم
```

```

---

## `platform-kit/ai-prompts/system-prompt-privacy.md`

```markdown
# System Prompt - مساعد الخصوصية (Privacy AI Assistant)

## المتطلبات المغطاة
PR-01, PR-02, PR-05 → PR-14

---

## البرومبت الأساسي

```
أنت **راصد الذكي** - المساعد المتخصص في تقييم امتثال سياسات الخصوصية ضمن منصة راصد الوطنية.

═══════════════════════════════════════════
المجال: سياسات الخصوصية والامتثال (privacy)
═══════════════════════════════════════════

## هويتك ومجالك
- أنت مساعد متخصص حصرياً في تقييم امتثال سياسات الخصوصية للمادة 12 من نظام حماية البيانات الشخصية (PDPL).
- لا تجيب على أسئلة تتعلق بتسربات البيانات أو حالات الرصد (مجال المساعد الآخر).
- إذا سُئلت عن مجال التسربات، أرشد المستخدم بلطف لاستخدام "مساعد التسربات".

## مصطلحات المجال
استخدم المصطلحات الصحيحة لمجال الخصوصية:
- **تقييم الامتثال**: عملية تقييم مدى التزام سياسة الخصوصية بالبنود الثمانية
- **البنود الثمانية**: بنود المادة 12 من PDPL التي يجب استيفاؤها
- **نسبة الامتثال**: النسبة المئوية لاستيفاء البنود
- **التغيير الجوهري**: تغيير في السياسة يؤثر على حقوق أصحاب البيانات
- **المتابعة**: إجراء يُتخذ بعد اكتشاف نقص في الامتثال
- **الزحف**: عملية آلية لاكتشاف صفحة سياسة الخصوصية

⚠️ لا تستخدم مصطلحات مجال التسربات (حالة رصد، العدد المُدّعى، العينات المتاحة) - فهي خاصة بمجال التسربات فقط.

## البنود الثمانية (المادة 12 من PDPL)
1. الأساس النظامي لمعالجة البيانات الشخصية
2. الغرض من جمع البيانات الشخصية
3. البيانات الشخصية المطلوب جمعها
4. طريقة جمع البيانات الشخصية
5. وسيلة حفظ البيانات الشخصية ومدة الاحتفاظ بها
6. حقوق صاحب البيانات الشخصية
7. كيفية ممارسة صاحب البيانات لحقوقه
8. معلومات التواصل مع جهة التحكم

## نمط الإجابة
كل إجابة تتبع هذا الهيكل:
1. **ملخص** (سطران كحد أقصى)
2. **أرقام/نتائج** (جدول أو قائمة)
3. **تفسير مختصر**
4. **روابط Drillthrough** (إن وجدت)
5. **إجراءات مقترحة** (2-3 خطوات)

## فهم السؤال
حدد نوع السؤال واستخرج المعلمات:
- القطاع، نوع الجهة، الفترة، البند المحدد، الموقع...
- إذا نقصت معلومة: **سؤال توضيحي واحد** مع خيارات جاهزة

## الأدوات
- استخدم أدوات القراءة للإحصائيات والتقييمات
- استخدم أدوات التحليل للمقارنات والاتجاهات
- قبل أي تنفيذ: اعرض ما سيتغير واطلب تأكيداً
- لا تختلق بيانات

## إذن التنقل
- لا تنتقل تلقائياً
- اقترح واطلب إذن المستخدم
- حافظ على المحادثة عبر التنقل

## سياق الصفحة
استخدم Page Context Pack لفهم السياق وتقديم اقتراحات دقيقة.

## الذاكرة
- Task Memory داخل الجلسة
- Session Summary لآخر 3 محادثات عند بدء جلسة جديدة
```

```

---

## `platform-kit/api/endpoints.md`

```markdown
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

```

---

## `platform-kit/api/sse-streaming.md`

```markdown
# مواصفات البث المباشر SSE - راصد الذكي

## المبدأ (API-03, API-04)

الردود تُبث عبر Server-Sent Events (SSE) مع حالات واضحة ودعم fallback.

---

## أنواع الأحداث (Event Types)

### 1. `status` - حالة المعالجة

```
event: status
data: {"type": "status", "status": "understanding", "message": "جارٍ فهم السؤال..."}

event: status
data: {"type": "status", "status": "fetching", "message": "جارٍ جلب بيانات..."}

event: status
data: {"type": "status", "status": "executing", "message": "جارٍ تنفيذ إجراء..."}

event: status
data: {"type": "status", "status": "generating_report", "message": "جارٍ إعداد تقرير..."}

event: status
data: {"type": "status", "status": "generating_chart", "message": "جارٍ إنشاء مخطط..."}
```

### 2. `token` - محتوى الرد

```
event: token
data: {"type": "token", "content": "حالات"}

event: token
data: {"type": "token", "content": " الرصد"}

event: token
data: {"type": "token", "content": " الجديدة"}
```

### 3. `tool_call` - استدعاء أداة (شفافية)

```
event: tool_call
data: {"type": "tool_call", "tool": "query_monitoring_cases", "params": {"status": "حالة رصد", "limit": 10}, "startTime": 1708420800000}

event: tool_result
data: {"type": "tool_result", "tool": "query_monitoring_cases", "summary": "تم جلب 10 حالات رصد", "duration": 230}
```

### 4. `suggestion` - اقتراحات المتابعة

```
event: suggestion
data: {"type": "suggestion", "suggestions": [
  {"text": "أعطني التفاصيل", "action": "details"},
  {"text": "صدّر كتقرير", "action": "export"},
  {"text": "أنشئ مخطط بياني", "action": "chart"}
]}
```

### 5. `navigate` - طلب إذن تنقل

```
event: navigate
data: {"type": "navigate", "targetRoute": "/app/leaks/cases/123", "targetLabel": "تفاصيل حالة الرصد #123", "reason": "لعرض التفاصيل الكاملة"}
```

### 6. `chart` - مخطط بياني

```
event: chart
data: {"type": "chart", "chartId": "chart_abc123", "url": "/api/ai/leaks/charts/chart_abc123", "description": "مخطط اتجاه حالات الرصد - آخر 6 أشهر"}
```

### 7. `done` - انتهاء الرد

```
event: done
data: {"type": "done", "messageId": "msg_123", "tokensUsed": 150, "toolsCalled": 2, "totalDuration": 1200}
```

### 8. `error` - خطأ

```
event: error
data: {"type": "error", "code": "TOOL_FAILURE", "message": "تعذر جلب البيانات. سأحاول تقديم إجابة جزئية.", "recoverable": true}
```

---

## Fallback (API-03)

عند عدم دعم SSE أو فشل الاتصال:

```json
POST /api/ai/:domain/chat?stream=false

Response:
{
  "messageId": "msg_123",
  "content": "النص الكامل للرد...",
  "toolsCalled": [...],
  "suggestions": [...],
  "tokensUsed": 150,
  "duration": 1200
}
```

---

## التنفيذ (TypeScript)

### Server Side

```typescript
// Express SSE handler
app.post('/api/ai/:domain/chat', authenticate, async (req, res) => {
  const { domain } = req.params;
  const { message, conversationId, pageContext } = req.body;
  const stream = req.query.stream !== 'false';

  // Domain guard
  validateDomain(domain, req.user);

  if (stream) {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    const emitter = createSSEEmitter(res);

    try {
      emitter.status('understanding', 'جارٍ فهم السؤال...');
      // ... process and stream
      emitter.done({ messageId, tokensUsed, toolsCalled });
    } catch (error) {
      emitter.error('INTERNAL', 'حدث خطأ أثناء المعالجة', true);
    }
  } else {
    // Fallback: non-streaming response
    const result = await processMessage(domain, message, conversationId, pageContext);
    res.json(result);
  }
});
```

### Client Side

```typescript
// React Hook for SSE
function useAIChat(domain: 'leaks' | 'privacy') {
  const [status, setStatus] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  const sendMessage = async (message: string, pageContext: PageContext) => {
    const eventSource = new EventSource(
      `/api/ai/${domain}/chat`,
      { /* POST body via fetch */ }
    );

    eventSource.addEventListener('status', (e) => {
      const data = JSON.parse(e.data);
      setStatus(data.message);
    });

    eventSource.addEventListener('token', (e) => {
      const data = JSON.parse(e.data);
      setContent(prev => prev + data.content);
    });

    eventSource.addEventListener('suggestion', (e) => {
      const data = JSON.parse(e.data);
      setSuggestions(data.suggestions);
    });

    eventSource.addEventListener('done', (e) => {
      setStatus('');
      eventSource.close();
    });

    eventSource.addEventListener('error', (e) => {
      // Fallback to non-streaming
      fallbackFetch(domain, message, pageContext);
    });
  };

  return { status, content, suggestions, sendMessage };
}
```

---

## الحالات الواضحة (API-04)

| الحالة | الرسالة العربية | متى تظهر |
|--------|----------------|----------|
| `understanding` | جارٍ فهم السؤال... | بداية المعالجة |
| `fetching` | جارٍ جلب بيانات... | عند استدعاء أداة قراءة |
| `analyzing` | جارٍ التحليل... | عند استدعاء أداة تحليل |
| `executing` | جارٍ تنفيذ إجراء... | عند استدعاء أداة تنفيذ |
| `generating_report` | جارٍ إعداد تقرير... | عند إنشاء تقرير |
| `generating_chart` | جارٍ إنشاء مخطط... | عند إنشاء مخطط بياني |
| `waiting_confirm` | بانتظار تأكيدك... | عند طلب تأكيد إجراء |

```

---

## `platform-kit/api/tools-registry.md`

```markdown
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

```

---

## `platform-kit/config/feature-flags.md`

```markdown
# أعلام الميزات والإعدادات - راصد الذكي

---

## 1. أعلام الميزات (Feature Flags)

```typescript
interface SmartMonitorFeatureFlags {
  // المساعد الذكي - عام
  ai_assistant_enabled: boolean;          // تفعيل/تعطيل المساعد بالكامل
  ai_streaming_enabled: boolean;          // SSE streaming
  ai_fallback_enabled: boolean;           // Fallback للأسئلة الشائعة

  // مساعد التسربات
  ai_leaks_enabled: boolean;              // تفعيل مساعد التسربات
  ai_leaks_execute_tools: boolean;        // السماح بأدوات التنفيذ
  ai_leaks_bulk_import: boolean;          // الاستيراد الجماعي
  ai_leaks_charts: boolean;              // إنشاء المخططات
  ai_leaks_pii_scan: boolean;            // فحص PII
  ai_leaks_direct_scan: boolean;         // الفحص المباشر

  // مساعد الخصوصية
  ai_privacy_enabled: boolean;            // تفعيل مساعد الخصوصية
  ai_privacy_execute_tools: boolean;      // السماح بأدوات التنفيذ
  ai_privacy_charts: boolean;            // إنشاء المخططات
  ai_privacy_reassess: boolean;          // إعادة التقييم

  // الأدلة الحية
  ai_guides_enabled: boolean;            // تفعيل الأدلة الحية
  ai_guide_auto_resume: boolean;         // استعادة الجلسة تلقائياً

  // المبادرة
  ai_proactive_enabled: boolean;         // المبادرة بعد 60 ثانية
  ai_proactive_interval_ms: number;      // الفاصل بين المبادرات (افتراضي: 300000)

  // الصوت
  ai_voice_stt_enabled: boolean;         // Speech-to-Text
  ai_voice_tts_enabled: boolean;         // Text-to-Speech

  // العبارات التشجيعية
  ai_encouragement_enabled: boolean;      // عبارات تشجيعية

  // مركز التدريب
  ai_training_center_enabled: boolean;    // مركز التدريب
  ai_training_triggers_enabled: boolean;  // ربط الكلمات بمهام

  // الرسائل الرسمية
  ai_letter_templates_enabled: boolean;   // قوالب الرسائل

  // التقارير
  ai_report_generation_enabled: boolean;  // إنشاء التقارير
  ai_report_pdf_enabled: boolean;        // تصدير PDF
  ai_report_excel_enabled: boolean;      // تصدير Excel
  ai_report_charts_in_report: boolean;   // إدراج مخططات في التقارير
}
```

---

## 2. إعدادات قابلة للتحكم من لوحة الإدارة

```typescript
interface SmartMonitorSettings {
  // LLM Provider
  llm_provider: 'openai' | 'anthropic' | 'azure' | 'custom';
  llm_model: string;
  llm_api_key: string;           // مشفر
  llm_base_url?: string;
  llm_timeout_ms: number;        // افتراضي: 30000
  llm_max_retries: number;       // افتراضي: 3
  llm_max_tokens: number;        // افتراضي: 4096

  // Circuit Breaker
  cb_failure_threshold: number;   // افتراضي: 5
  cb_recovery_timeout_ms: number; // افتراضي: 60000
  cb_half_open_max: number;       // افتراضي: 2

  // RAG
  rag_top_k: number;             // افتراضي: 5
  rag_similarity_threshold: number; // افتراضي: 0.7
  rag_auto_refresh: boolean;     // افتراضي: true
  rag_refresh_interval_ms: number; // افتراضي: 3600000

  // المحادثات
  chat_max_history: number;       // افتراضي: 50 رسالة
  chat_session_timeout_ms: number; // افتراضي: 1800000
  chat_summary_last_n: number;    // افتراضي: 3 محادثات

  // سياسات الاحتفاظ
  retention_conversations_days: number;  // افتراضي: 90
  retention_audit_days: number;          // افتراضي: 365
  retention_reports_days: number;        // افتراضي: 180
  retention_training_docs_days: number;  // افتراضي: -1 (بلا حد)

  // المبادرة
  proactive_idle_threshold_ms: number;  // افتراضي: 60000
  proactive_cooldown_ms: number;        // افتراضي: 300000

  // العبارات التشجيعية
  encouragement_frequency: number;      // كل N ردود (افتراضي: 4)
  encouragement_on_session_start: boolean; // افتراضي: true
  encouragement_on_task_success: boolean;  // افتراضي: true

  // التصدير
  export_max_rows: number;        // افتراضي: 100000
  export_include_metadata: boolean; // افتراضي: true
}
```

---

## 3. إعدادات المستخدم الشخصية

```typescript
interface UserAIPreferences {
  // عام
  ai_enabled: boolean;                    // تفعيل المساعد لهذا المستخدم
  preferred_response_length: 'short' | 'balanced' | 'detailed';

  // المبادرة
  proactive_enabled: boolean;             // تفعيل المبادرة
  proactive_custom_threshold_ms?: number; // عتبة مخصصة

  // العبارات التشجيعية
  encouragement_enabled: boolean;         // تفعيل العبارات

  // الصوت
  voice_stt_enabled: boolean;            // تفعيل STT
  voice_tts_enabled: boolean;            // تفعيل TTS
  voice_tts_speed: number;               // سرعة القراءة (0.5-2.0)

  // العرض
  show_tool_trace: boolean;              // عرض الأدوات المستدعاة
  show_thinking_steps: boolean;          // عرض خطوات التفكير
  auto_expand_charts: boolean;           // تكبير المخططات تلقائياً
}
```

---

## 4. القيم الافتراضية

```json
{
  "featureFlags": {
    "ai_assistant_enabled": true,
    "ai_streaming_enabled": true,
    "ai_fallback_enabled": true,
    "ai_leaks_enabled": true,
    "ai_privacy_enabled": true,
    "ai_guides_enabled": true,
    "ai_proactive_enabled": true,
    "ai_voice_stt_enabled": false,
    "ai_voice_tts_enabled": false,
    "ai_encouragement_enabled": true,
    "ai_training_center_enabled": true,
    "ai_report_generation_enabled": true
  },
  "settings": {
    "llm_timeout_ms": 30000,
    "llm_max_retries": 3,
    "cb_failure_threshold": 5,
    "rag_top_k": 5,
    "chat_max_history": 50,
    "retention_conversations_days": 90,
    "proactive_idle_threshold_ms": 60000,
    "proactive_cooldown_ms": 300000
  }
}
```

```

---

## `platform-kit/db/schema-design.md`

```markdown
# تصميم قاعدة البيانات - راصد الذكي

## المبدأ: كل جدول مشترك يحمل `domain`

---

## 1. جداول المعرفة والفهم

### 1.1 Glossary (قاموس المصطلحات) - DB-03

```sql
CREATE TABLE ai_glossary_terms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  term VARCHAR(255) NOT NULL,
  synonyms JSON COMMENT 'مرادفات المصطلح ["حالة رصد", "كيس مراقبة"]',
  definition TEXT NOT NULL,
  related_page VARCHAR(255) COMMENT 'الصفحة المرتبطة (route)',
  related_entity VARCHAR(255) COMMENT 'الكيان المرتبط',
  example_questions JSON COMMENT '["كم عدد حالات الرصد؟", "ما آخر حالة رصد؟"]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_term (term),
  UNIQUE KEY uk_domain_term (domain, term)
);
```

### 1.2 Page Descriptors (واصفات الصفحات) - DB-04

```sql
CREATE TABLE ai_page_descriptors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  page_id VARCHAR(255) NOT NULL COMMENT 'معرف الصفحة الفريد',
  route VARCHAR(255) NOT NULL COMMENT 'المسار /app/leaks/dashboard',
  page_purpose TEXT NOT NULL COMMENT 'هدف الصفحة',
  main_elements JSON COMMENT '["جدول حالات الرصد", "فلتر الحالة", "مؤشرات KPI"]',
  common_tasks JSON COMMENT '["عرض حالات الرصد الجديدة", "فلترة حسب القطاع"]',
  available_actions JSON COMMENT '["إنشاء حالة رصد", "تصدير", "فلترة"]',
  drillthrough_links JSON COMMENT '[{"label": "تفاصيل الحالة", "route": "/app/leaks/cases/:id"}]',
  suggested_questions_by_role JSON COMMENT '{"admin": ["كم حالة رصد جديدة؟"], "analyst": ["ما أعلى حالة خطورة؟"]}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  UNIQUE KEY uk_domain_page (domain, page_id)
);
```

---

## 2. جداول الدليل الحي (Guide)

### 2.1 Guide Catalog (كتالوج الأدلة) - DB-05

```sql
CREATE TABLE ai_guide_catalog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  purpose TEXT NOT NULL COMMENT 'هدف الدليل',
  visibility_roles JSON COMMENT '["admin", "analyst", "viewer"]',
  visibility_conditions JSON COMMENT '{"minRole": "analyst", "requiresFeature": "guides"}',
  steps_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain)
);
```

### 2.2 Guide Steps (خطوات الدليل) - DB-06

```sql
CREATE TABLE ai_guide_steps (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guide_id INT NOT NULL,
  step_number INT NOT NULL,
  route VARCHAR(255) NOT NULL COMMENT 'الصفحة التي تُنفذ فيها الخطوة',
  selector VARCHAR(500) COMMENT 'CSS selector للعنصر المستهدف',
  step_text TEXT NOT NULL COMMENT 'نص الخطوة الموجّه للمستخدم',
  action_type ENUM('click', 'type', 'select', 'scroll', 'wait', 'observe') NOT NULL,
  highlight_type ENUM('spotlight', 'border', 'pulse', 'arrow') DEFAULT 'spotlight',
  action_data JSON COMMENT '{"value": "test", "delay": 500}',
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (guide_id) REFERENCES ai_guide_catalog(id) ON DELETE CASCADE,
  UNIQUE KEY uk_guide_step (guide_id, step_number)
);
```

### 2.3 Guide Sessions (جلسات الدليل) - DB-07

```sql
CREATE TABLE ai_guide_sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  guide_id INT NOT NULL,
  user_id INT NOT NULL,
  domain ENUM('leaks', 'privacy') NOT NULL,
  status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
  current_step INT DEFAULT 1,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  abandoned_at TIMESTAMP NULL,
  FOREIGN KEY (guide_id) REFERENCES ai_guide_catalog(id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_domain (domain)
);
```

---

## 3. جداول الذاكرة والمحادثات

### 3.1 Task Memory (ذاكرة المهمة) - DB-08

```sql
CREATE TABLE ai_task_memory (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  user_id INT NOT NULL,
  conversation_id VARCHAR(255) NOT NULL,
  objective TEXT COMMENT 'هدف المهمة الحالية',
  current_entity_type VARCHAR(100) COMMENT 'نوع الكيان: case/site/report',
  current_entity_id VARCHAR(255) COMMENT 'معرف الكيان',
  active_filters JSON COMMENT '{"status": "حالة رصد", "sector": "بنوك"}',
  current_step VARCHAR(255) COMMENT 'الخطوة الحالية',
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP COMMENT 'وقت انتهاء صلاحية الذاكرة',
  INDEX idx_domain_user (domain, user_id),
  INDEX idx_conversation (conversation_id)
);
```

### 3.2 Conversations (المحادثات) - DB-09

```sql
CREATE TABLE ai_conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id VARCHAR(255) NOT NULL UNIQUE,
  domain ENUM('leaks', 'privacy') NOT NULL,
  user_id INT NOT NULL,
  title VARCHAR(500) COMMENT 'عنوان ذكي مُولّد',
  tags JSON COMMENT '["حالات رصد", "تقارير", "إحصائيات"]',
  context_page VARCHAR(255) COMMENT 'الصفحة التي بدأت منها المحادثة',
  context_entity_id VARCHAR(255) COMMENT 'الكيان المرتبط',
  message_count INT DEFAULT 0,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain_user (domain, user_id),
  INDEX idx_created (created_at DESC)
);
```

### 3.3 Conversation Messages (رسائل المحادثات)

```sql
CREATE TABLE ai_conversation_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id VARCHAR(255) NOT NULL,
  role ENUM('user', 'assistant', 'system', 'tool') NOT NULL,
  content TEXT NOT NULL,
  tool_calls JSON COMMENT 'استدعاءات الأدوات إن وجدت',
  tool_results JSON COMMENT 'نتائج الأدوات',
  page_context JSON COMMENT 'Page Context Pack عند إرسال الرسالة',
  tokens_used INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_conversation (conversation_id),
  INDEX idx_created (created_at)
);
```

### 3.4 Session Summary (ملخص الجلسات) - DB-10

```sql
CREATE TABLE ai_session_summaries (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  user_id INT NOT NULL,
  conversation_id VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL COMMENT 'ملخص المحادثة',
  key_topics JSON COMMENT '["حالات رصد جديدة", "تقرير شهري"]',
  last_entity_type VARCHAR(100),
  last_entity_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain_user (domain, user_id),
  INDEX idx_created (created_at DESC)
);
```

---

## 4. جداول مركز التدريب

### 4.1 Training Documents (وثائق التدريب) - DB-11

```sql
CREATE TABLE ai_training_documents (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  doc_type ENUM('guide', 'procedure', 'scenario', 'faq', 'policy') NOT NULL,
  tags JSON,
  is_active BOOLEAN DEFAULT TRUE,
  version INT DEFAULT 1,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_type (doc_type)
);
```

### 4.2 Custom Action Triggers (ربط الكلمات بمهام) - DB-11

```sql
CREATE TABLE ai_action_triggers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  trigger_phrases JSON NOT NULL COMMENT '["أنشئ حالة رصد", "سجّل حالة جديدة"]',
  action_type VARCHAR(100) NOT NULL COMMENT 'create_case / generate_report / ...',
  action_config JSON COMMENT '{"defaultStatus": "حالة رصد", "requireConfirm": true}',
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_priority (priority DESC)
);
```

### 4.3 Feedback (ملاحظات المستخدمين) - DB-12

```sql
CREATE TABLE ai_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  conversation_id VARCHAR(255),
  message_id INT,
  tool_name VARCHAR(100),
  user_id INT NOT NULL,
  rating ENUM('helpful', 'not_helpful') NOT NULL,
  reason VARCHAR(500),
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_conversation (conversation_id),
  INDEX idx_rating (rating)
);
```

---

## 5. جداول القوالب والرسائل

### 5.1 Official Letter Templates (قوالب الرسائل الرسمية) - DB-13

```sql
CREATE TABLE ai_letter_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  template_type VARCHAR(100) NOT NULL COMMENT 'notification/warning/response/report',
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL COMMENT 'المحتوى مع placeholders',
  placeholders JSON COMMENT '[{"key": "{{entity_name}}", "description": "اسم الجهة"}]',
  tone ENUM('brief', 'balanced', 'very_formal') DEFAULT 'balanced',
  example_input JSON COMMENT 'مثال إدخال',
  example_output TEXT COMMENT 'مثال إخراج',
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_type (template_type)
);
```

---

## 6. جداول الأحداث والمعرفة

### 6.1 System Events (أحداث النظام) - DB-14

```sql
CREATE TABLE ai_system_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  event_type ENUM('create', 'update', 'delete') NOT NULL,
  entity_type VARCHAR(100) NOT NULL COMMENT 'page/template/column/setting/...',
  entity_id VARCHAR(255),
  changes JSON COMMENT '{"before": {...}, "after": {...}}',
  triggered_by INT COMMENT 'المستخدم أو النظام',
  processed BOOLEAN DEFAULT FALSE COMMENT 'هل تم تحديث RAG؟',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_processed (processed),
  INDEX idx_created (created_at)
);
```

### 6.2 Knowledge Refresh Status (حالة تحديث المعرفة) - DB-15

```sql
CREATE TABLE ai_knowledge_refresh (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  source_type VARCHAR(100) NOT NULL COMMENT 'glossary/pages/training/...',
  source_id VARCHAR(255),
  status ENUM('idle', 'running', 'completed', 'error') DEFAULT 'idle',
  last_refresh TIMESTAMP NULL,
  next_refresh TIMESTAMP NULL,
  error_message TEXT,
  items_processed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_domain_source (domain, source_type, source_id),
  INDEX idx_status (status)
);
```

---

## 7. جداول التدقيق والتأكيد

### 7.1 Audit Log (سجل التدقيق) - SEC-01

```sql
CREATE TABLE ai_audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL COMMENT 'chat/tool_call/create/update/delete/export',
  target_type VARCHAR(100) COMMENT 'case/report/template/...',
  target_id VARCHAR(255),
  details JSON COMMENT '{"tool": "query_cases", "params": {...}, "result_count": 5}',
  before_state JSON COMMENT 'الحالة قبل التغيير',
  after_state JSON COMMENT 'الحالة بعد التغيير',
  result ENUM('success', 'failure', 'denied', 'cancelled') NOT NULL,
  ip_address VARCHAR(45),
  conversation_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);
```

### 7.2 Action Runs (سجل الإجراءات) - API-08

```sql
CREATE TABLE ai_action_runs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  domain ENUM('leaks', 'privacy') NOT NULL,
  conversation_id VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL,
  plan JSON NOT NULL COMMENT 'ما الذي سيتغير',
  preview JSON COMMENT 'معاينة قبل/بعد',
  status ENUM('pending', 'confirmed', 'cancelled', 'executed', 'rolled_back', 'failed') DEFAULT 'pending',
  executed_at TIMESTAMP NULL,
  rollback_data JSON COMMENT 'بيانات التراجع إن أمكن',
  rolled_back_at TIMESTAMP NULL,
  result JSON COMMENT 'نتيجة التنفيذ',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_domain (domain),
  INDEX idx_conversation (conversation_id),
  INDEX idx_status (status)
);
```

---

## ملخص الجداول

| # | الجدول | الوصف | المتطلب |
|---|--------|-------|---------|
| 1 | `ai_glossary_terms` | قاموس المصطلحات | DB-03 |
| 2 | `ai_page_descriptors` | واصفات الصفحات | DB-04 |
| 3 | `ai_guide_catalog` | كتالوج الأدلة | DB-05 |
| 4 | `ai_guide_steps` | خطوات الأدلة | DB-06 |
| 5 | `ai_guide_sessions` | جلسات الأدلة | DB-07 |
| 6 | `ai_task_memory` | ذاكرة المهمة | DB-08 |
| 7 | `ai_conversations` | المحادثات | DB-09 |
| 8 | `ai_conversation_messages` | رسائل المحادثات | DB-09 |
| 9 | `ai_session_summaries` | ملخصات الجلسات | DB-10 |
| 10 | `ai_training_documents` | وثائق التدريب | DB-11 |
| 11 | `ai_action_triggers` | ربط الكلمات بمهام | DB-11 |
| 12 | `ai_feedback` | ملاحظات المستخدمين | DB-12 |
| 13 | `ai_letter_templates` | قوالب الرسائل | DB-13 |
| 14 | `ai_system_events` | أحداث النظام | DB-14 |
| 15 | `ai_knowledge_refresh` | حالة تحديث المعرفة | DB-15 |
| 16 | `ai_audit_log` | سجل التدقيق | SEC-01 |
| 17 | `ai_action_runs` | سجل الإجراءات | API-08 |

```

---

## `platform-kit/db/seed-data.md`

```markdown
# بيانات البذر الأولية - راصد الذكي

## 1. Glossary - مساعد التسربات (domain = 'leaks')

```sql
INSERT INTO ai_glossary_terms (domain, term, synonyms, definition, related_page, example_questions) VALUES
('leaks', 'حالة رصد', '["كيس رصد", "حالة مراقبة", "monitoring case"]', 'التسمية الافتراضية لأي ادعاء بوجود تسرب بيانات شخصية قبل التحقق الرسمي.', '/app/leaks/cases', '["كم عدد حالات الرصد؟", "ما آخر حالة رصد؟", "أعطني حالات الرصد الجديدة"]'),
('leaks', 'العدد المُدّعى', '["الرقم المُدّعى", "claimed count"]', 'الرقم الذي يذكره البائع أو الناشر عن عدد السجلات. هذا ادعاء وليس تحقق.', '/app/leaks/cases/:id', '["ما العدد المُدّعى لهذه الحالة؟", "أعلى عدد مُدّعى"]'),
('leaks', 'العينات المتاحة', '["العينات", "available samples"]', 'ما تم جمعه وتوثيقه فعلياً داخل المنصة وفق الصلاحيات.', '/app/leaks/cases/:id', '["كم العينات المتاحة؟", "أرني العينات"]'),
('leaks', 'تسرب مؤكد', '["تسريب مؤكد", "confirmed breach"]', 'حالة رصد تم التحقق منها رسمياً وثبت وجود تسرب فعلي للبيانات الشخصية.', '/app/leaks/cases', '["كم تسرب مؤكد هذا الشهر؟"]'),
('leaks', 'قيد التحقق', '["تحت التحقق", "under verification"]', 'حالة رصد بدأ فريق التحقق بالعمل عليها ولم تُحسم بعد.', '/app/leaks/cases', '["كم حالة قيد التحقق؟"]'),
('leaks', 'البائع', '["الناشر", "vendor", "seller"]', 'الطرف الذي يدّعي امتلاك أو عرض بيانات مسربة.', '/app/leaks/vendors', '["من أنشط البائعين؟", "بائعون جدد"]'),
('leaks', 'الدارك ويب', '["الشبكة المظلمة", "dark web"]', 'شبكات إنترنت مخفية يُراقبها النظام لرصد حالات التسرب.', '/app/leaks/darkweb', '["ما آخر نشاط على الدارك ويب؟"]'),
('leaks', 'الأدلة الرقمية', '["أدلة", "digital evidence"]', 'المستندات والصور والملفات التي توثق حالة الرصد.', '/app/leaks/cases/:id/evidence', '["ما الأدلة المرفقة بهذه الحالة؟"]'),
('leaks', 'OSINT', '["استخبارات مفتوحة المصدر", "open source intelligence"]', 'معلومات استخباراتية مستقاة من مصادر مفتوحة ومتاحة للجمهور.', '/app/leaks/osint', '["ما آخر نتائج OSINT؟"]'),
('leaks', 'التنبيه', '["إنذار", "alert"]', 'إشعار تلقائي يُرسل عند استيفاء شروط قاعدة تنبيه محددة.', '/app/leaks/alerts', '["كم تنبيه غير مقروء؟", "آخر التنبيهات"]');
```

## 2. Glossary - مساعد الخصوصية (domain = 'privacy')

```sql
INSERT INTO ai_glossary_terms (domain, term, synonyms, definition, related_page, example_questions) VALUES
('privacy', 'تقييم الامتثال', '["نتيجة التقييم", "compliance assessment"]', 'عملية تقييم مدى التزام سياسة الخصوصية بالمادة 12 من PDPL.', '/app/privacy/dashboard', '["ما نسبة الامتثال الكلية؟"]'),
('privacy', 'المادة 12', '["البنود الثمانية", "Article 12"]', 'مادة من نظام حماية البيانات الشخصية تحدد 8 بنود يجب أن تتضمنها سياسة الخصوصية.', '/app/privacy/dashboard', '["ما أكثر بند ناقص؟"]'),
('privacy', 'سياسة الخصوصية', '["صفحة الخصوصية", "privacy policy"]', 'الصفحة التي يُفصح فيها الموقع عن ممارسات جمع واستخدام البيانات الشخصية.', '/app/privacy/sites/:id', '["أرني سياسة خصوصية الموقع"]'),
('privacy', 'التغيير الجوهري', '["تغيير مادي", "material change"]', 'تغيير في سياسة الخصوصية يؤثر على حقوق أصحاب البيانات أو التزامات الجهة.', '/app/privacy/changes', '["ما التغييرات الجوهرية الأخيرة؟"]'),
('privacy', 'المتابعة', '["follow-up", "إجراء متابعة"]', 'إجراء يُتخذ بعد اكتشاف نقص في الامتثال، مثل مراسلة الجهة أو إعادة التقييم.', '/app/privacy/followups', '["كم متابعة مفتوحة؟"]'),
('privacy', 'نسخة السياسة', '["إصدار السياسة", "policy version"]', 'نسخة محفوظة من سياسة الخصوصية في تاريخ محدد لغرض المقارنة والتتبع.', '/app/privacy/sites/:id/versions', '["قارن آخر نسختين"]'),
('privacy', 'الزحف', '["crawling", "فحص الموقع"]', 'عملية آلية لاكتشاف صفحة سياسة الخصوصية في الموقع.', '/app/privacy/sites', '["متى آخر زحف؟"]'),
('privacy', 'القطاع', '["sector", "نوع الجهة"]', 'تصنيف الجهة المالكة للموقع (حكومي، خاص، بنوك، اتصالات...).', '/app/privacy/dashboard', '["ما أقل قطاع امتثالاً؟"]');
```

## 3. Page Descriptors - مساعد التسربات

```sql
INSERT INTO ai_page_descriptors (domain, page_id, route, page_purpose, main_elements, common_tasks, available_actions, drillthrough_links, suggested_questions_by_role) VALUES
('leaks', 'leaks_dashboard', '/app/leaks/dashboard', 'لوحة مؤشرات رئيسية تعرض ملخص حالات الرصد والإحصائيات',
  '["مؤشرات KPI", "مخطط الاتجاهات", "توزيع الحالات حسب الحالة", "آخر حالات الرصد"]',
  '["مراجعة المؤشرات", "الاطلاع على حالات جديدة", "تحليل الاتجاهات"]',
  '["فلترة حسب الفترة", "تصدير", "إنشاء تقرير"]',
  '[{"label": "تفاصيل حالة", "route": "/app/leaks/cases/:id"}, {"label": "قائمة الحالات", "route": "/app/leaks/cases"}]',
  '{"admin": ["كم حالة رصد جديدة هذا الأسبوع؟", "ما أعلى العدد المُدّعى؟"], "analyst": ["أعطني ملخص اليوم", "ما الحالات قيد التحقق؟"]}'
),
('leaks', 'leaks_cases', '/app/leaks/cases', 'قائمة جميع حالات الرصد مع فلترة وبحث',
  '["جدول حالات الرصد", "فلاتر متقدمة", "بحث", "أزرار الإجراءات"]',
  '["البحث عن حالة", "فلترة حسب الحالة/القطاع/الفترة", "إنشاء حالة جديدة"]',
  '["إنشاء حالة رصد", "تصدير القائمة", "حذف جماعي"]',
  '[{"label": "تفاصيل حالة", "route": "/app/leaks/cases/:id"}]',
  '{"admin": ["كم حالة رصد إجمالاً؟", "أنشئ حالة رصد جديدة"], "analyst": ["فلتر الحالات قيد التحقق", "صدّر القائمة"]}'
),
('leaks', 'leaks_case_detail', '/app/leaks/cases/:id', 'تفاصيل حالة رصد محددة مع الأدلة والجدول الزمني',
  '["معلومات الحالة", "العدد المُدّعى", "العينات المتاحة", "الأدلة الرقمية", "الجدول الزمني", "سجل التدقيق"]',
  '["مراجعة التفاصيل", "إضافة دليل", "تحديث الحالة", "إنشاء تقرير"]',
  '["تحديث الحالة", "إضافة دليل", "إنشاء تقرير", "إرسال إشعار"]',
  '[{"label": "الأدلة", "route": "/app/leaks/cases/:id/evidence"}, {"label": "التقارير", "route": "/app/leaks/reports"}]',
  '{"admin": ["ما تفاصيل هذه الحالة؟", "حدّث الحالة إلى قيد التحقق"], "analyst": ["ما العدد المُدّعى؟", "كم العينات المتاحة؟"]}'
);
```

## 4. Page Descriptors - مساعد الخصوصية

```sql
INSERT INTO ai_page_descriptors (domain, page_id, route, page_purpose, main_elements, common_tasks, available_actions, drillthrough_links, suggested_questions_by_role) VALUES
('privacy', 'privacy_dashboard', '/app/privacy/dashboard', 'لوحة مؤشرات امتثال الخصوصية مع البنود الثمانية',
  '["نسبة الامتثال الكلية", "توزيع البنود الثمانية", "أقل القطاعات امتثالاً", "آخر التقييمات"]',
  '["مراجعة نسب الامتثال", "تحديد النقاط الضعيفة", "تصدير تقرير"]',
  '["فلترة حسب القطاع/الفترة", "تصدير", "إنشاء تقرير"]',
  '[{"label": "تفاصيل موقع", "route": "/app/privacy/sites/:id"}, {"label": "قائمة المواقع", "route": "/app/privacy/sites"}]',
  '{"admin": ["ما نسبة الامتثال الكلية؟", "ما أكثر بند ناقص؟"], "analyst": ["أقل القطاعات امتثالاً", "المواقع التي تراجعت"]}'
),
('privacy', 'privacy_sites', '/app/privacy/sites', 'قائمة المواقع المراقبة ونتائج تقييمها',
  '["جدول المواقع", "فلاتر متقدمة", "بحث", "نسبة الامتثال لكل موقع"]',
  '["البحث عن موقع", "فلترة حسب القطاع/النتيجة", "مراجعة المواقع المتدنية"]',
  '["إضافة موقع", "إعادة تقييم", "تصدير"]',
  '[{"label": "تفاصيل موقع", "route": "/app/privacy/sites/:id"}]',
  '{"admin": ["كم موقع إجمالاً؟", "المواقع غير الممتثلة"], "analyst": ["فلتر القطاع الحكومي", "المواقع بدون سياسة"]}'
);
```

## 5. Guide Catalog - أدلة أولية

```sql
INSERT INTO ai_guide_catalog (domain, title, description, purpose, visibility_roles, steps_count, is_active) VALUES
('leaks', 'دليل إنشاء حالة رصد جديدة', 'يرشدك خطوة بخطوة لإنشاء حالة رصد جديدة في المنصة', 'تعليم المستخدم كيفية إنشاء حالة رصد مع تعبئة جميع الحقول المطلوبة', '["admin", "analyst"]', 5, TRUE),
('leaks', 'دليل تصدير تقرير حالات الرصد', 'يرشدك لتصدير تقرير شامل عن حالات الرصد', 'تعليم المستخدم كيفية إنشاء وتصدير تقرير PDF/Excel', '["admin", "analyst", "viewer"]', 4, TRUE),
('privacy', 'دليل مراجعة نتائج الامتثال', 'يرشدك لمراجعة نتائج تقييم الامتثال للمواقع', 'تعليم المستخدم كيفية قراءة نتائج التقييم والبنود الثمانية', '["admin", "analyst"]', 4, TRUE),
('privacy', 'دليل مقارنة نسخ السياسات', 'يرشدك لمقارنة نسختين من سياسة الخصوصية', 'تعليم المستخدم كيفية اكتشاف التغييرات الجوهرية بين النسخ', '["admin", "analyst"]', 3, TRUE);
```

## 6. Letter Templates - قوالب أولية

```sql
INSERT INTO ai_letter_templates (domain, template_type, title, content, placeholders, tone, is_active) VALUES
('leaks', 'notification', 'إشعار حالة رصد جديدة', 'سعادة {{recipient_title}} {{recipient_name}},\n\nنود إبلاغكم بأنه تم رصد حالة رصد جديدة تتعلق بـ {{entity_name}}.\n\nالعدد المُدّعى: {{claimed_count}} (حسب ادعاء {{claim_source}})\nملاحظة: هذا الرقم يمثل ادعاء المصدر ولم يتم التحقق منه بعد.\n\nالحالة الحالية: {{status}}\n\nنأمل اتخاذ الإجراءات اللازمة.\n\nمع التقدير,\nفريق راصد',
  '[{"key": "{{recipient_title}}", "description": "لقب المستلم"}, {"key": "{{recipient_name}}", "description": "اسم المستلم"}, {"key": "{{entity_name}}", "description": "اسم الجهة"}, {"key": "{{claimed_count}}", "description": "العدد المُدّعى"}, {"key": "{{claim_source}}", "description": "مصدر الادعاء"}, {"key": "{{status}}", "description": "حالة الرصد"}]',
  'balanced', TRUE),
('privacy', 'followup', 'متابعة نقص الامتثال', 'سعادة {{recipient_title}} {{recipient_name}},\n\nبناءً على تقييم موقعكم {{site_url}} بتاريخ {{assessment_date}}، تبين وجود نقص في الامتثال للبنود التالية من المادة 12:\n\n{{missing_clauses}}\n\nنأمل مراجعة سياسة الخصوصية وتحديثها لاستيفاء البنود المذكورة.\n\nمع التقدير,\nفريق راصد',
  '[{"key": "{{recipient_title}}", "description": "لقب المستلم"}, {"key": "{{recipient_name}}", "description": "اسم المستلم"}, {"key": "{{site_url}}", "description": "رابط الموقع"}, {"key": "{{assessment_date}}", "description": "تاريخ التقييم"}, {"key": "{{missing_clauses}}", "description": "البنود الناقصة"}]',
  'balanced', TRUE);
```

```

---

## `platform-kit/docs/SMART_MONITOR_REQUIREMENTS.md`

```markdown
# متطلبات راصد الذكي - وثيقة تنفيذية قابلة للتتبع (Checklist)

**التاريخ:** 20 فبراير 2026
**الإصدار:** 1.0
**الحالة:** مسودة أولية

---

## 0) نطاق الوثيقة

| # | الوصف | الحالة |
|---|-------|--------|
| 0.1 | هذه الوثيقة تجمع متطلبات «راصد الذكي» بصيغة تنفيذية قابلة للتتبع (Checklist) عبر الطبقات: DB / API / UI / AI Prompt / Reports & Exports / Testing. | ☐ |
| 0.2 | يوجد مساعدان منفصلان: **(أ)** راصد الذكي لمنصة تسربات البيانات الشخصية، **(ب)** راصد الذكي لمنصة سياسات الخصوصية. يشتركان في القدرات العامة، مع عزل المعرفة والتدريب والأدوات لكل منصة. | ☐ |
| 0.3 | سياسة التسمية (حالة رصد / العدد المُدّعى / العينات المتاحة) إلزامية على كامل منصة التسربات عبر كل الطبقات. المساعد الخاص بالخصوصية يلتزم بمصطلحات مجال الخصوصية ولا يختلط بمجال التسربات. | ☐ |

---

## 1) متطلبات حاكمة عابرة للطبقات

### 1.1 فصل المساعدين وعزل المعرفة

| المعرّف | المتطلب | الطبقة | الحالة |
|---------|---------|--------|--------|
| GOV-01 | تأكد أن مساعد التسربات منفصل منطقياً وتشغيلياً عن مساعد الخصوصية (Domain Isolation) وأن أي بيانات تدريب/ذاكرة/مصادر معرفة/فهرس RAG لا تتشارك بينهما. | ALL | ☐ |
| GOV-02 | تأكد أن لكل مساعد: (1) مكتبة معرفة مستقلة، (2) مركز تدريب مستقل، (3) Glossary مستقل، (4) Page Descriptors مستقلة، (5) Evaluation Set مستقل، (6) Telemetry/Audit مستقل قابل للفلترة حسب المجال. | ALL | ☐ |
| GOV-03 | تأكد أن أي مكوّن مشترك (واجهة/خدمة/SDK) مُعلّم بالمجال `domain` ويمنع عرض أو استدعاء مصادر/أدوات خارج مجاله. | ALL | ☐ |

### 1.2 سياسة التسمية لمنصة التسربات (إلزامية)

| المعرّف | المتطلب | الطبقة | الحالة |
|---------|---------|--------|--------|
| NAME-01 | التسمية الافتراضية لأي ادعاء بوجود تسرب بيانات شخصية هي **«حالة رصد»** وليس «حادثة تسرب»، بغض النظر عن مصداقية البائع/الناشر. | ALL | ☐ |
| NAME-02 | لا يُستخدم مصطلح «حادثة تسرب» أو «تسرب بيانات شخصية» أو «تسرب مؤكد» إلا بعد اكتمال التحقق وفق إجراءات المنصة. قبل التحقق تبقى **«حالة رصد»**. | ALL | ☐ |
| NAME-03 | أي رقم يذكره البائع/الناشر عن عدد السجلات يسمى دائماً **«العدد المُدّعى»** وليس «عدد السجلات المسربة». | ALL | ☐ |
| NAME-04 | **«العينات المتاحة»** هي التعريف الوحيد لما تم جمعه/توثيقه داخل المنصة (وفق الصلاحيات). ويجب أن يظهر اسمها في كل مكان: «العينات المتاحة». | ALL | ☐ |
| NAME-05 | تأكد من تعديل المسميات والحقول والمؤشرات لتتوافق مع: (حادثة → حالة رصد) و(عدد السجلات → العدد المُدّعى) وإضافة/إبراز (العينات المتاحة) كمؤشر/حقل رئيسي. | ALL | ☐ |
| NAME-06 | تأكد أن حالات Status تشمل على الأقل: **«حالة رصد»** (افتراضي) → **«قيد التحقق»** → **«تسرب مؤكد»** (بعد التحقق فقط) → **«مغلق»**. | ALL | ☐ |
| NAME-07 | راصد الذكي ملزم بالسياسة: يستخدم المصطلحات المعتمدة دائماً، يصحح المستخدم تلقائياً عند استخدام المصطلحات القديمة، ولا يصف أي حالة بأنها «تسرب مؤكد» إلا إذا كانت حالة DB = «تسرب مؤكد». | AI/API | ☐ |
| NAME-08 | التقارير والتصديرات ملزمة بالسياسة: تظهر المصطلحات المعتمدة، وتوضح أن «العدد المُدّعى» ادعاء وليس تحقق، ولا تُقدّم الادعاء كحقيقة. | Reports | ☐ |

### 1.3 الأمان والحوكمة

| المعرّف | المتطلب | الطبقة | الحالة |
|---------|---------|--------|--------|
| SEC-01 | تأكد أن كل محادثة وكل استدعاء أداة وكل إجراء (إنشاء/تعديل/حذف/تصدير/نشر) مسجل في سجل تدقيق مع: **من/متى/ماذا/النتيجة/قبل-بعد** إن أمكن. | API/DB | ☐ |
| SEC-02 | تأكد أن أي إجراء تنفيذي لا يتم قبل: (1) عرض ما الذي سيتغير، (2) معاينة قبل/بعد إن أمكن، (3) طلب تأكيد صريح (تأكيد/إلغاء). | API/UI | ☐ |
| SEC-03 | تأكد من تطبيق RBAC على كل أداة/بيان مع Redaction وتقليل البيانات حسب الدور، ومنع عرض أي بيانات حساسة دون صلاحية. | API/UI | ☐ |
| SEC-04 | تأكد من سياسات الاحتفاظ (Retention) للمحادثات/وثائق التدريب/مخرجات التقارير، وإمكانية إدارتها من لوحة الإدارة. | DB/API/UI | ☐ |

### 1.4 تجربة المحادثة والتنقل بإذن المستخدم

| المعرّف | المتطلب | الطبقة | الحالة |
|---------|---------|--------|--------|
| CHAT-01 | تأكد أن الرد يظهر داخل نفس صندوق محادثة راصد الذكي ولا يفتح صفحة خطأ تحت أي ظرف. | UI | ☐ |
| CHAT-02 | تأكد أن صندوق المحادثة يدعم: تكبير/تصغير + تكبير كامل داخل الصفحة (Maximize) + خيار فتح صفحة راصد الذكي (Full Page) بإرادة المستخدم فقط. | UI | ☐ |
| CHAT-03 | تأكد أن أي انتقال لصفحة داخل المنصة لا يحدث تلقائياً: راصد الذكي يطلب الإذن أولاً (سماح/عدم سماح). | UI/AI | ☐ |
| CHAT-04 | عند سماح المستخدم بالانتقال: يتم التنقل مع الحفاظ على نفس المحادثة (`conversationId`/`history`) وعدم فقد تسلسل الحديث، وإرسال Page Context Pack بعد الانتقال. | UI/API | ☐ |
| CHAT-05 | عند عدم السماح: يستمر راصد الذكي بالرد داخل الصندوق مع رابط اختياري فقط دون تغيير الصفحة. | UI/AI | ☐ |

---

## 2) متطلبات قاعدة البيانات (DB)

### 2.1 عزل المجال (Domain Isolation) على مستوى البيانات

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-01 | تأكد أن جميع بيانات المعرفة/التدريب/الذاكرة/الاختبارات تحمل معرف المجال `domain` (تسربات/خصوصية) لمنع الاختلاط. | ☐ |
| DB-02 | تأكد أن الاستعلامات الإدارية (Training/Knowledge/Audit) يمكن فلترتها حسب المجال وأن أي نتائج مشتركة تُعزل حسب `domain`. | ☐ |

### 2.2 المعرفة والفهم (Glossary + Page Descriptors)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-03 | تأكد من وجود **Glossary** في DB لكل مجال يحتوي: المصطلح + المرادفات + التعريف + الصفحة/الكيان المرتبط + أمثلة أسئلة. | ☐ |
| DB-04 | تأكد من وجود **Page Descriptors** في DB لكل صفحة في كل مجال تشمل: هدف الصفحة، العناصر الرئيسية، المهام الشائعة، الإجراءات المتاحة، روابط Drillthrough الأساسية، وأسئلة مقترحة حسب الدور. | ☐ |

### 2.3 الدليل الحي (Guide Catalog)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-05 | تأكد من وجود كتالوج أدلة (Guide Catalog) قابل للإدارة لكل مجال: عنوان الدليل، الهدف، شروط الظهور حسب الدور. | ☐ |
| DB-06 | تأكد من وجود خطوات الدليل (Guide Steps) لكل دليل: `route` + `selector` + نص خطوة + نوع إجراء (`click`/`type`/`select`/`scroll`/`wait`) + نوع إبراز. | ☐ |
| DB-07 | تأكد من وجود جلسات الدليل (Guide Sessions) لتتبع تقدم المستخدم (نشط/مكتمل/متروك). | ☐ |

### 2.4 ذاكرة المهمة وسجل المحادثات

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-08 | تأكد من وجود **Task Memory** (حالة المهمة) لكل مجال: الهدف، الكيان الحالي، الفلاتر النشطة، الخطوة الحالية، آخر نشاط، وقت انتهاء. | ☐ |
| DB-09 | تأكد من حفظ المحادثات مع: عنوان ذكي، وسوم، وربط بالسياق (صفحة/كيان) لكل مجال بشكل مستقل. | ☐ |
| DB-10 | تأكد من دعم ملخص آخر 3 محادثات (**Session Summary**) وإضافته كسياق عند بدء جلسة جديدة لكل مجال بشكل مستقل. | ☐ |

### 2.5 مركز التدريب والإجراءات المخصصة

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-11 | تأكد من وجود مكونات **Training Center**: وثائق تدريب، إجراءات/سيناريوهات، وربط الكلمات بمهام (Custom Action Triggers) مع أولوية وتفعيل/تعطيل. | ☐ |
| DB-12 | تأكد من وجود **Feedback** (مفيد/غير مفيد + سبب) وتخزينه وربطه بالمجال وبالمحادثة/الأداة. | ☐ |

### 2.6 قوالب الرسائل الرسمية

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-13 | تأكد من وجود مكتبة قوالب رسائل رسمية مع: النوع، المحتوى، placeholders، أمثلة إدخال/إخراج، إصدار/نسخ، تفعيل/تعطيل. | ☐ |

### 2.7 سجل الأحداث والتعلم التلقائي

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-14 | تأكد من وجود **System Events** تسجل إنشاء/تعديل/حذف لكل ما يؤثر على المعرفة: صفحات، قوالب، أعمدة/كتالوجات، تصنيفات، إعدادات، متطلبات. | ☐ |
| DB-15 | تأكد من وجود **Knowledge Refresh Status** لعرض آخر تحديث لكل مصدر ونتيجة التحديث (`idle`/`running`/`completed`/`error`). | ☐ |

### 2.8 منصة التسربات - كيانات تشغيلية للمساعد

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-16 | تأكد من توفر البيانات التي يحتاجها مساعد التسربات: حالات الرصد، الأدلة الرقمية، القنوات، الدارك ويب/اللصق، البائعين، قواعد التهديد، OSINT، التنبيهات، التقارير/الأرشيف، المستخدمين، وسجل التدقيق. | ☐ |
| DB-17 | تأكد من دعم الاستيراد/التعديل/الحذف الجماعي لهذه الكيانات مع تدقيق وصلاحيات. | ☐ |

### 2.9 منصة الخصوصية - كيانات تشغيلية للمساعد

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| DB-18 | تأكد من توفر البيانات التي يحتاجها مساعد الخصوصية: سجل المواقع/التطبيقات، نتائج التقييم، نسخ السياسات، المقارنات/التغييرات الجوهرية، الأدلة (لقطات/HTML/PDF)، المتابعات والتقارير الخاصة بالامتثال. | ☐ |

---

## 3) متطلبات واجهات البرمجة (API)

### 3.1 فصل واجهات المساعدين

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-01 | تأكد من وجود مسار/سلوك منفصل لكل مساعد (أو Domain Parameter صارم) مع عزل الأدوات والمصادر حسب المجال. | ☐ |
| API-02 | تأكد أن أي استدعاء RAG/Tools/Training/Audit يحمل `domain` ويُرفض إذا حاول الوصول لموارد مجال آخر. | ☐ |

### 3.2 Streaming (SSE)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-03 | تأكد من دعم SSE للردود (`token`/`status`/`done`/`error`) مع توافق fallback (رد غير مبثوث) دون كسر تجربة الدردشة. | ☐ |
| API-04 | تأكد من إرسال حالات واضحة: جارٍ فهم السؤال، جارٍ جلب بيانات، جارٍ تنفيذ إجراء، جارٍ إعداد تقرير. | ☐ |

### 3.3 أدوات القراءة/التحليل/التنفيذ + RBAC

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-05 | تأكد من توفر أدوات قراءة/تحليل/تنفيذ بحسب المجال، وكل أداة تتحقق من الصلاحيات وتُسجل في التدقيق. | ☐ |
| API-06 | تأكد من أن فشل أداة أو DB لا يقطع المحادثة: يعود المساعد بنتيجة جزئية ورسالة مفهومة. | ☐ |

### 3.4 التأكيد قبل التنفيذ + التراجع

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-07 | تأكد من تدفق موحد للأعمال التنفيذية: **Plan/Preview → Confirm/Cancel → Execute → Rollback** (عند الإمكان). | ☐ |
| API-08 | تأكد من وجود سجل **Action Runs** لكل إجراء يتطلب تأكيداً، وربطه بالمحادثة والمستخدم والمجال. | ☐ |

### 3.5 إذن التنقل (Navigation Consent)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-09 | تأكد من واجهة/آلية تطلب إذن المستخدم قبل أي تنقل داخل المنصة. | ☐ |
| API-10 | عند الموافقة: يتم التنقل مع الحفاظ على `conversationId`/`history` واستدعاء نفس المحادثة في الوجهة الجديدة. | ☐ |

### 3.6 RAG والتحديث التزايدي

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-11 | تأكد من بناء فهرس RAG لكل مجال بشكل مستقل وتحديثه تزايدياً عبر System Events. | ☐ |
| API-12 | تأكد أن الاسترجاع ينتج سياقاً صغيراً (Top-K) ويطبق مرشحات سياقية قبل اختيار المقاطع. | ☐ |

### 3.7 الاعتمادية (Fallback + Circuit Breaker + Provider Compatibility)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-13 | تأكد من وجود **Fallback** قواعد فورية للأسئلة الشائعة لتقليل التكلفة وتحسين السرعة. | ☐ |
| API-14 | تأكد من وجود **Circuit Breaker** (`CLOSED`/`OPEN`/`HALF_OPEN`) مع حدود فشل وزمن إعادة محاولة. | ☐ |
| API-15 | تأكد من معالجة توافق مزود LLM: عدم إرسال `thinking` مع `tools` إذا كان غير مدعوم، وتجنب `json_schema` إذا كان غير مدعوم، وتفعيل timeouts/retries وتسجيل أخطاء HTTP بدقة. | ☐ |

### 3.8 الرسوم البيانية ولوحات المؤشرات

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-16 | تأكد من دعم إنشاء المخططات ولوحات المؤشرات عبر أدوات مخصصة، وحفظ PNG وتقديمها عبر مسار ثابت. | ☐ |
| API-17 | تأكد أن المخططات تعتمد على بيانات حقيقية من DB فقط ولا تستخدم بيانات وهمية. | ☐ |

### 3.9 الاستيراد/التعديل/الحذف الجماعي

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-18 | تأكد من دعم رفع ZIP/CSV/JSON/XLSX ومعالجة `insert`/`upsert`/`update` والحذف الجماعي مع صلاحيات وتأكيد وتدقيق. | ☐ |
| API-19 | تأكد من إرجاع تقرير نتائج واضح: `inserted`/`updated`/`skipped`/`errors` مع تفاصيل الأخطاء. | ☐ |

### 3.10 مركز التدريب والتخصيص

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-20 | تأكد من APIs لإدارة: وثائق التدريب، triggers، القوالب، العبارات التشجيعية، feedback، evaluation، حالة المعرفة. | ☐ |

### 3.11 صحة النظام

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| API-21 | تأكد من Endpoint للصحة يعرض: جاهزية الفهرس، متوسط زمن الاستجابة، حالة Circuit Breaker، آخر تحديث للمعرفة، وأخطاء حرجة إن وجدت. | ☐ |

---

## 4) متطلبات واجهة المستخدم (UI)

### 4.1 صندوق المحادثة (Widget) + صفحة راصد (Full Page)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-01 | تأكد أن الرد يظهر داخل الصندوق ولا يفتح صفحة خطأ إطلاقاً (إصلاح التوجيه/الـrouting/أخطاء العرض). | ☐ |
| UI-02 | تأكد من دعم **Expand/Collapse** و **Maximize** داخل نفس الصفحة. | ☐ |
| UI-03 | تأكد من إتاحة فتح صفحة راصد الذكي (Full Page) كخيار للمستخدم فقط، مع إبقاء نفس المحادثة والهيستوري. | ☐ |

### 4.2 عرض Streaming والحالات

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-04 | تأكد من عرض token-by-token مع status واضح، وإظهار error بدون كسر الواجهة، وإغلاق `done` بشكل صحيح. | ☐ |
| UI-05 | تأكد من دعم نمط الرد المنظم: **ملخص → أرقام → تفسير → روابط → إجراءات مقترحة**. | ☐ |

### 4.3 Page Context Pack

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-06 | تأكد أن كل رسالة تتضمن `route`/`pageId` + `activeFilters` + `currentEntityId` + `availableActions` + `userRole` + feature flags المؤثرة. | ☐ |
| UI-07 | تأكد من تحديث Page Context Pack تلقائياً عند تغيير الصفحة أو الفلاتر أو اختيار كيان. | ☐ |

### 4.4 التنقل بإذن المستخدم + حفظ التاريخ

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-08 | تأكد من Dialog إذن التنقل (سماح/عدم سماح) قبل أي انتقال يقترحه المساعد. | ☐ |
| UI-09 | عند السماح: نفذ التنقل مع الحفاظ على `conversationId`/`history` وعدم فقد تسلسل الحديث. | ☐ |
| UI-10 | عند عدم السماح: استمر داخل الصندوق مع رابط اختياري فقط. | ☐ |

### 4.5 الاقتراحات والشفافية

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-11 | تأكد من عرض **3-6 Suggested Actions** مرتبطة بالصفحة والدور. | ☐ |
| UI-12 | تأكد من عرض **Follow-up suggestions** بعد الرد (أزرار جاهزة). | ☐ |
| UI-13 | تأكد من عرض الأدوات المستدعاة وزمنها وملخص نتائجها (**Thinking Steps/Tool Trace**) للمخولين. | ☐ |

### 4.6 الدليل الحي (Guide Overlay)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-14 | تأكد من Overlay: Highlight للعنصر + خطوة X/Y + التالي/السابق/إنهاء + تنقل تلقائي بين الصفحات عند الحاجة. | ☐ |
| UI-15 | تأكد من استعادة جلسة الدليل عند إعادة تحميل الصفحة (إن كانت فعالة) دون فقد التقدم. | ☐ |

### 4.7 المبادرة بعد دقيقة (Proactive Assistance)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-16 | تأكد من رصد Idle لمدة 60 ثانية بشكل منضبط (لا أثناء الكتابة/التمرير النشط)، وعدم التكرار المزعج (مرة كل 5 دقائق مثلاً). | ☐ |
| UI-17 | تأكد من احترام إعدادات المستخدم لإيقاف المبادرة أو تعديل حدها الزمني. | ☐ |

### 4.8 المخططات ولوحات المؤشرات داخل الدردشة

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-18 | تأكد من عرض المخططات كصور داخل الدردشة مع إمكانية التكبير، وإظهار وصف مختصر للنتائج. | ☐ |
| UI-19 | تأكد من عرض لوحة مؤشرات كمجموعة مخططات مترابطة داخل الدردشة. | ☐ |

### 4.9 رفع الملفات داخل المحادثة (Bulk)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-20 | تأكد من إتاحة إرفاق الملفات داخل الدردشة، وإظهار تقدم المعالجة ونتيجة الاستيراد داخل نفس الصندوق. | ☐ |
| UI-21 | تأكد من عدم تنفيذ حذف/تعديل جماعي دون تأكيد صريح داخل الواجهة. | ☐ |

### 4.10 الصوت (اختياري)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-22 | تأكد من دعم **Speech-to-Text** و **Text-to-Speech** وفق تفضيلات المستخدم (تمكين/تعطيل). | ☐ |

### 4.11 مركز التدريب

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| UI-23 | تأكد من وجود واجهة مركز تدريب تشمل: مستندات التدريب، ربط الكلمات بمهام (Triggers) مع اختبار فوري، وملاحظات المستخدمين/التقييم. | ☐ |

---

## 5) متطلبات البرومبت وسلوك المساعد (AI Prompt)

### 5.1 فصل المجال

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-01 | تأكد من **System Prompt** منفصل لكل مجال، ومنع أي أداة/معرفة/رد يعبر إلى مجال آخر. | ☐ |
| PR-02 | تأكد أن أي مكوّن مشترَك في البرومبت (قالب الإجابة/قواعد الأمان) يُطبق على المجالين دون خلط المصطلحات التشغيلية. | ☐ |

### 5.2 سياسة التسمية (منصة التسربات)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-03 | تأكد أن مساعد التسربات يستخدم دائماً: **حالة رصد** / **العدد المُدّعى** / **العينات المتاحة**، ويصحح المصطلحات الخاطئة تلقائياً. | ☐ |
| PR-04 | تأكد أنه لا يصف «تسرب مؤكد» إلا إذا كانت الحالة في DB = تسرب مؤكد. | ☐ |

### 5.3 نمط الإجابة

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-05 | تأكد أن كل إجابة منظمة: **ملخص** (سطران) → **أرقام/نتائج** → **تفسير مختصر** → **روابط Drillthrough** → **إجراءات مقترحة**. | ☐ |
| PR-06 | تأكد أن المساعد يعرض «كيف حُسب؟» للمخولين: مصدر البيانات + الفلاتر + وقت آخر تحديث. | ☐ |

### 5.4 الفهم (Intent + Slots) + سؤال توضيحي واحد

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-07 | تأكد من تحديد نوع السؤال (رقم/قائمة/مقارنة/لماذا/كيف/نفذها عني) واستخراج المعلمات (فترة/حالة/قطاع/فئة بيانات/حساسية/أثر...). | ☐ |
| PR-08 | تأكد أنه إذا نقصت معلومة يطرح **سؤالاً توضيحياً واحداً فقط** مع خيارات جاهزة. | ☐ |

### 5.5 الأدوات والتنفيذ بأمان

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-09 | تأكد أن المساعد يختار الأداة المناسبة تلقائياً، ويطلب تأكيداً قبل أي تغيير، ويسجل التدقيق. | ☐ |
| PR-10 | تأكد من دعم **Rollback** عندما يكون ممكناً (خصوصاً القوالب/الإعدادات/الكتالوجات). | ☐ |

### 5.6 إذن التنقل

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-11 | تأكد أن المساعد لا ينتقل تلقائياً: يطلب إذن المستخدم أولاً، وعند الموافقة يحافظ على نفس المحادثة والهيستوري. | ☐ |

### 5.7 الوعي بسياق الصفحة

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-12 | تأكد أن المساعد يستخدم **Page Context Pack** لتفسير السؤال وتقديم اقتراحات مرتبطة بالصفحة والدور. | ☐ |

### 5.8 الذاكرة والاستمرارية

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-13 | تأكد من **Task Memory** داخل الجلسة، و **Session Summary** لآخر 3 محادثات عند بدء جلسة جديدة لكل مجال. | ☐ |

### 5.9 المخططات واللوحات

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-14 | تأكد أن المساعد يستخدم أدوات الرسم عند طلب مخطط/لوحة، ولا يختلق بيانات. | ☐ |

### 5.10 العبارات التشجيعية (اختياري)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| PR-15 | تأكد من قواعد عدم الإزعاج: عبارة وطنية/تشجيعية في بداية الجلسة أو بعد نجاح مهمة، مرة كل 3-4 ردود كحد أقصى، وقابلة للتعطيل. | ☐ |

---

## 6) متطلبات التقارير والتصدير (Reports & Exports)

### 6.1 سياسة التسمية داخل التقارير والتصديرات

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| RE-01 | تأكد أن كل تقرير/تصدير/قالب رسالة يستخدم: **حالة رصد** / **العدد المُدّعى** / **العينات المتاحة**. | ☐ |
| RE-02 | تأكد أن «العدد المُدّعى» يظهر كادعاء مع مصدره (بائع/ناشر/منصة) وليس كحقيقة متحققة. | ☐ |
| RE-03 | تأكد من عدم تقديم الادعاء على أنه تحقق أو تأكيد. | ☐ |

### 6.2 إنشاء التقارير والأرشفة

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| RE-04 | تأكد أن المساعد يستطيع إنشاء تقرير من قالب وتوليد ملف (PDF/Excel/CSV) وحفظه بالأرشيف وإرجاع رابط داخلي. | ☐ |
| RE-05 | تأكد من تسجيل التدقيق لكل تقرير/تصدير (من/متى/ما الذي تم تصديره/النتيجة). | ☐ |

### 6.3 مكتبة قوالب الرسائل الرسمية

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| RE-06 | تأكد من دعم كتابة نص رسمي مع 3 خيارات: **مختصر/متوازن/رسمي جداً**، وربطه بقوالب قابلة للحفظ في المكتبة. | ☐ |
| RE-07 | تأكد من **versioning** للقوالب وإدارة placeholders وأمثلة إدخال/إخراج. | ☐ |

### 6.4 إدراج المخططات (إن وجدت)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| RE-08 | تأكد من إمكانية إدراج مخططات/صور ضمن تقارير الملخص التنفيذي والتحليلات عند الحاجة. | ☐ |

### 6.5 الاستيراد/التصدير الجماعي

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| RE-09 | تأكد من أن التصدير الجماعي يعكس سياسة التسمية، ويُرفق سجل أخطاء/تحذيرات إن وجدت. | ☐ |
| RE-10 | تأكد أن نتائج الاستيراد تُوثق وتظهر للمستخدم، وكل حذف/تعديل جماعي يتطلب تأكيداً وتدقيقاً. | ☐ |

---

## 7) متطلبات الاختبار والتحقق الفعلي (Testing)

### 7.1 اختبار سياسة التسمية (إلزامي)

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| T-01 | افتح أهم الصفحات/اللوحات وابحث عن أي ظهور لكلمة «حادثة» أو «عدد السجلات» بصيغتها القديمة. | ☐ |
| T-02 | تأكد أن كل ظهور تم استبداله بالمصطلحات المعتمدة (**حالة رصد** / **العدد المُدّعى** / **العينات المتاحة**). | ☐ |
| T-03 | جرّب إنشاء حالة جديدة وتحقق أن الاسم الافتراضي «حالة رصد» وأن Status يبدأ بالقيم المعتمدة. | ☐ |
| T-04 | جرّب التصدير وتأكد أن المصطلحات المعتمدة تظهر وأن الادعاء لا يُعرض كحقيقة. | ☐ |
| T-05 | وثّق النتائج بلقطات شاشة أو سجل اختبار مختصر. | ☐ |

### 7.2 اختبار صندوق المحادثة والتنقل

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| T-06 | اختبر أن الرد يبقى داخل صندوق المحادثة دائماً ولا يفتح صفحة خطأ. | ☐ |
| T-07 | اختبر Expand/Collapse/Maximize وفتح صفحة راصد (اختياري) مع استمرار نفس المحادثة. | ☐ |
| T-08 | اختبر سيناريو طلب التنقل: المساعد يطلب الإذن → المستخدم يوافق → يتم التنقل مع الحفاظ على `conversationId`/`history`. | ☐ |
| T-09 | اختبر رفض الإذن: يستمر داخل الصندوق مع رابط اختياري دون تنقل. | ☐ |

### 7.3 اختبار Streaming وFallback

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| T-10 | اختبر SSE token streaming والحالات `status` والـ `done`/`error`. | ☐ |
| T-11 | اختبر Fallback (رد غير مبثوث) دون كسر الواجهة. | ☐ |

### 7.4 اختبار الأدوات والصلاحيات والتدقيق

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| T-12 | اختبر كل أداة: صلاحيات صحيحة + نتائج صحيحة + تدقيق مسجل. | ☐ |
| T-13 | اختبر الأفعال التنفيذية: **Plan/Preview → Confirm/Cancel → Execute → Rollback** (عند الإمكان). | ☐ |

### 7.5 اختبار عزل المجال

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| T-14 | اختبر أن مساعد التسربات لا يعرض/يستدعي معرفة أو أدوات الخصوصية والعكس. | ☐ |
| T-15 | اختبر أن فهرس RAG ومركز التدريب والذاكرة منفصلان بين المجالين. | ☐ |

### 7.6 اختبار الاعتمادية والأعطال

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| T-16 | اختبر فشل DB: يجب أن يستمر المساعد برد جزئي دون انهيار. | ☐ |
| T-17 | اختبر فشل مزود LLM: Circuit Breaker + Fallback ورسالة مفهومة. | ☐ |
| T-18 | اختبر timeouts/retries وتسجيل تفاصيل الخطأ (`status`/`body`) عند الفشل. | ☐ |

### 7.7 اختبار المخططات ولوحات المؤشرات

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| T-19 | اختبر إنشاء مخطط/لوحة: PNG تُنشأ وتُعرض داخل الدردشة مع وصف. | ☐ |
| T-20 | اختبر أن بيانات المخطط مستمدة من DB فقط وأنها تطبق الفلاتر/السياق. | ☐ |

### 7.8 اختبار Bulk Import

| المعرّف | المتطلب | الحالة |
|---------|---------|--------|
| T-21 | اختبر رفع CSV/JSON/XLSX/ZIP: parsing صحيح + كشف الكيان + `upsert`/`update`/`insert`. | ☐ |
| T-22 | اختبر الحذف الجماعي: صلاحيات + تأكيد صريح + تدقيق + تقرير نتائج. | ☐ |

---

## ملحق A) قائمة أدوات الحد الأدنى - مساعد التسربات

| المعرّف | الفئة | الأدوات | الحالة |
|---------|-------|---------|--------|
| A-01 | **أدوات القراءة** | إحصائيات اللوحة، الاستعلام عن حالات الرصد، تفاصيل حالة، القنوات، الأدلة، البائعين، التنبيهات، التقارير/الأرشيف، سجل التدقيق، المستخدمين، البحث في قاعدة المعرفة. | ☐ |
| A-02 | **أدوات التحليل** | تحليل الاتجاهات، الارتباطات، تحليل نشاط المستخدم. | ☐ |
| A-03 | **أدوات التنفيذ** | فحص مباشر، فحص PII، إنشاء حالة رصد، تحديث حالة، إنشاء تقرير، إنشاء قناة تنبيه، إنشاء قاعدة تنبيه. | ☐ |
| A-04 | **أدوات السياق/الدليل/الذاكرة** | `get_page_context`، `search_glossary`، `start_live_guide`، `list_guides`، `guide_step_action`، `manage_task_memory`. | ☐ |
| A-05 | **أدوات الأمان والتأكيد** | `do_it_for_me` مع تأكيد، `rollback_action` عند الإمكان، وتسجيل التدقيق لكل خطوة. | ☐ |

---

## ملحق B) قائمة أدوات الحد الأدنى - مساعد الخصوصية

| المعرّف | الفئة | الأدوات | الحالة |
|---------|-------|---------|--------|
| B-01 | **أدوات القراءة** | ملخص الامتثال، قوائم مواقع وفق فلاتر، تفاصيل موقع، نسخ السياسة والمقارنة، التغييرات الجوهرية، المتابعات، التقارير. | ☐ |
| B-02 | **أدوات التحليل** | أكثر المتطلبات نقصاً، لماذا تغيرت النتائج، المقارنات بين فترات/قطاعات/أنواع جهات، ملخص قيادي. | ☐ |
| B-03 | **أدوات التنفيذ** | إنشاء متابعة، إنشاء تقرير، جدولة تقرير، بدء دليل حي داخل الصفحات (للمخولين فقط). | ☐ |

---

## ملخص إحصائي

| الطبقة | عدد المتطلبات |
|--------|---------------|
| متطلبات حاكمة عابرة (GOV/NAME/SEC/CHAT) | 20 |
| قاعدة البيانات (DB) | 18 |
| واجهات البرمجة (API) | 21 |
| واجهة المستخدم (UI) | 23 |
| البرومبت والسلوك (PR) | 15 |
| التقارير والتصدير (RE) | 10 |
| الاختبار والتحقق (T) | 22 |
| ملحق أدوات التسربات (A) | 5 |
| ملحق أدوات الخصوصية (B) | 3 |
| **الإجمالي** | **137** |

---

## سجل التغييرات

| التاريخ | الإصدار | الوصف |
|---------|---------|-------|
| 2026-02-20 | 1.0 | الإصدار الأولي - جمع كامل المتطلبات بصيغة Checklist تنفيذية |

```

---

## `platform-kit/reports/export-specs.md`

```markdown
# مواصفات التصدير - راصد الذكي

## المتطلبات المغطاة
RE-04, RE-05, RE-09, RE-10, API-18, API-19

---

## 1. صيغ التصدير المدعومة

| الصيغة | الاستخدام | الحد الأقصى |
|--------|----------|-------------|
| PDF | تقارير رسمية، ملخصات تنفيذية | غير محدود |
| Excel (.xlsx) | بيانات تحليلية، جداول مفصلة | 100,000 صف |
| CSV | بيانات خام للمعالجة | 500,000 صف |
| JSON | تكامل مع أنظمة أخرى | 100,000 سجل |

---

## 2. تدفق التصدير

```
1. المستخدم يطلب التصدير (عبر الواجهة أو المساعد)
   │
2. التحقق من الصلاحيات (RBAC)
   │
3. تطبيق الفلاتر وسياسة التسمية
   │
4. إنشاء الملف
   │
5. حفظ في الأرشيف + إنشاء رابط تحميل
   │
6. تسجيل التدقيق: من/متى/ماذا/النتيجة
   │
7. إرجاع الرابط للمستخدم
```

---

## 3. أعمدة التصدير (منصة التسربات)

| العمود | الوصف | ملاحظة |
|--------|-------|--------|
| رقم حالة الرصد | معرف الحالة | |
| اسم حالة الرصد | عنوان الحالة | ليس "حادثة" |
| الحالة | حالة رصد / قيد التحقق / تسرب مؤكد / مغلق | |
| العدد المُدّعى | الرقم المُدّعى | عمود مُعنون بـ "العدد المُدّعى" |
| مصدر الادعاء | البائع/الناشر/المنصة | |
| العينات المتاحة | عدد العينات الموثقة | |
| القطاع | القطاع المتأثر | |
| تاريخ الرصد | تاريخ إنشاء الحالة | |
| آخر تحديث | تاريخ آخر تعديل | |

---

## 4. تقرير نتائج الاستيراد (API-19)

```json
{
  "jobId": "import_abc123",
  "status": "completed",
  "summary": {
    "total": 200,
    "inserted": 150,
    "updated": 30,
    "skipped": 15,
    "errors": 5
  },
  "errors": [
    {
      "row": 45,
      "field": "claimedCount",
      "value": "abc",
      "error": "يجب أن يكون رقماً"
    },
    {
      "row": 78,
      "field": "status",
      "value": "حادثة",
      "error": "قيمة غير معتمدة. القيم المقبولة: حالة رصد، قيد التحقق، تسرب مؤكد، مغلق"
    }
  ],
  "warnings": [
    {
      "row": 12,
      "message": "العدد المُدّعى كبير جداً (> 1,000,000) - يرجى التحقق"
    }
  ],
  "duration": 3200,
  "exportedBy": "user_123",
  "timestamp": "2026-02-20T10:30:00Z"
}
```

---

## 5. تسجيل التدقيق للتصدير (RE-05)

```json
{
  "action": "export",
  "domain": "leaks",
  "userId": 123,
  "format": "excel",
  "filters": {"status": "حالة رصد", "period": "last_30_days"},
  "recordCount": 150,
  "fileSize": "2.3 MB",
  "result": "success",
  "timestamp": "2026-02-20T10:00:00Z"
}
```

```

---

## `platform-kit/reports/report-templates.md`

```markdown
# قوالب التقارير والرسائل الرسمية

## المتطلبات المغطاة
RE-01 → RE-08, DB-13

---

## 1. أنواع التقارير

### 1.1 تقارير منصة التسربات

| النوع | الوصف | الصيغ |
|-------|-------|------|
| ملخص تنفيذي | نظرة عامة على حالات الرصد | PDF |
| تقرير حالة رصد | تفاصيل حالة رصد محددة | PDF |
| تقرير إحصائي | إحصائيات وتحليلات شاملة | PDF, Excel |
| تصدير بيانات | بيانات خام للتحليل | CSV, Excel, JSON |
| تقرير تدقيق | سجل الإجراءات والتغييرات | PDF, CSV |

### 1.2 تقارير منصة الخصوصية

| النوع | الوصف | الصيغ |
|-------|-------|------|
| ملخص امتثال | نظرة عامة على نسب الامتثال | PDF |
| تقرير موقع | تفاصيل تقييم موقع محدد | PDF |
| تقرير قطاعي | مقارنة بين القطاعات | PDF, Excel |
| تقرير تغييرات | التغييرات الجوهرية في السياسات | PDF |
| تصدير بيانات | بيانات التقييم الخام | CSV, Excel |

---

## 2. سياسة التسمية في التقارير (RE-01, RE-02, RE-03)

### القواعد الإلزامية:

```
✅ صحيح في التقارير:
─────────────────────
"حالة الرصد رقم 123"
"العدد المُدّعى: 10,000 سجل (مصدر الادعاء: البائع XYZ على منتدى ABC)"
"ملاحظة: العدد المُدّعى يمثل ادعاء المصدر ولم يتم التحقق منه"
"العينات المتاحة: 150 سجل (تم توثيقها داخل المنصة)"

❌ خطأ في التقارير:
─────────────────────
"حادثة التسرب رقم 123"
"عدد السجلات المسربة: 10,000"
"البيانات المسربة: 150 سجل"
```

### تنسيق العدد المُدّعى في التقارير:

```
┌──────────────────────────────────────────────────┐
│ العدد المُدّعى                                   │
│ ══════════════                                   │
│ الرقم: 10,000 سجل                               │
│ مصدر الادعاء: البائع "DarkSeller" على منتدى XYZ │
│ تاريخ الادعاء: 2026-02-15                        │
│                                                  │
│ ⚠️ هذا الرقم يمثل ادعاء المصدر المذكور أعلاه    │
│ ولم يتم التحقق منه من قِبل فريق المنصة بعد.    │
└──────────────────────────────────────────────────┘
```

---

## 3. قوالب الرسائل الرسمية (RE-06, RE-07)

### 3.1 مستويات الأسلوب

| المستوى | الوصف | الاستخدام |
|---------|-------|----------|
| **مختصر** | رسالة مباشرة بأقل كلمات | إشعارات داخلية، متابعات سريعة |
| **متوازن** | رسالة رسمية متوسطة | مراسلات رسمية عادية |
| **رسمي جداً** | رسالة رسمية مفصلة | مخاطبات جهات عليا، تقارير رسمية |

### 3.2 هيكل القالب

```json
{
  "id": 1,
  "domain": "leaks",
  "templateType": "notification",
  "title": "إشعار حالة رصد جديدة",
  "content": "سعادة {{recipient_title}} {{recipient_name}},\n\nنود إبلاغكم...",
  "placeholders": [
    {
      "key": "{{recipient_title}}",
      "description": "لقب المستلم (سعادة/معالي/...)",
      "required": true,
      "defaultValue": "سعادة"
    },
    {
      "key": "{{recipient_name}}",
      "description": "اسم المستلم",
      "required": true
    },
    {
      "key": "{{entity_name}}",
      "description": "اسم الجهة المعنية",
      "required": true
    },
    {
      "key": "{{claimed_count}}",
      "description": "العدد المُدّعى",
      "required": false
    },
    {
      "key": "{{claim_source}}",
      "description": "مصدر الادعاء",
      "required": false
    }
  ],
  "tone": "balanced",
  "version": 1,
  "isActive": true,
  "exampleInput": {
    "recipient_title": "سعادة",
    "recipient_name": "م. أحمد الشمري",
    "entity_name": "بنك ABC",
    "claimed_count": "10,000",
    "claim_source": "البائع XYZ"
  },
  "exampleOutput": "سعادة م. أحمد الشمري,\n\nنود إبلاغكم بأنه تم رصد حالة رصد جديدة تتعلق ببنك ABC.\n\nالعدد المُدّعى: 10,000 سجل (حسب ادعاء البائع XYZ)\nملاحظة: هذا الرقم يمثل ادعاء المصدر ولم يتم التحقق منه.\n\nمع التقدير,\nفريق راصد"
}
```

### 3.3 Versioning (RE-07)

```
القالب v1 → تعديل → القالب v2 (النسخة القديمة تبقى للرجوع)
                    → القالب v3 (آخر إصدار نشط)
```

---

## 4. إدراج المخططات في التقارير (RE-08)

عند إنشاء تقرير يتضمن مخططاً:

```
1. المساعد يُنشئ المخطط عبر أداة generate_chart
2. يُحفظ كـ PNG في مسار ثابت
3. يُدرج في التقرير (PDF) في المكان المناسب
4. يُرفق وصف نصي للمخطط (إمكانية الوصول)
```

---

## 5. تصدير البيانات الجماعي (RE-09, RE-10)

### هيكل ملف التصدير:

```
📁 export_2026-02-20_leaks_cases.zip
├── data.csv              ← البيانات (بمصطلحات معتمدة)
├── metadata.json         ← معلومات التصدير
├── errors_warnings.csv   ← أخطاء/تحذيرات (إن وجدت)
└── README.txt            ← توضيح المصطلحات والسياسة
```

### metadata.json:
```json
{
  "exportDate": "2026-02-20T10:00:00Z",
  "domain": "leaks",
  "exportedBy": "user_123",
  "totalRecords": 150,
  "filters": {"status": "حالة رصد", "period": "last_30_days"},
  "namingPolicy": {
    "note": "هذا التصدير يستخدم سياسة التسمية المعتمدة",
    "terms": {
      "حالة رصد": "التسمية الافتراضية لأي ادعاء بوجود تسرب",
      "العدد المُدّعى": "ادعاء البائع/الناشر - غير متحقق منه",
      "العينات المتاحة": "ما تم توثيقه فعلياً داخل المنصة"
    }
  }
}
```

```

---

## `platform-kit/specs/architecture.md`

```markdown
# المعمارية العامة - راصد الذكي

## نظرة عامة

راصد الذكي هو نظام مساعد ذكي مبني على نماذج اللغة الكبيرة (LLM) يعمل ضمن منصة راصد الوطنية. يتكون من مساعدين منفصلين منطقياً وتشغيلياً، يشتركان في البنية التحتية العامة مع عزل كامل للمعرفة والبيانات.

---

## المكونات الرئيسية

```
┌─────────────────────────────────────────────────────────┐
│                    واجهة المستخدم (UI)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Chat Widget   │  │  Full Page   │  │ Guide Overlay │  │
│  │ (صندوق محادثة)│  │ (صفحة كاملة) │  │ (دليل حي)    │  │
│  └──────┬───────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                 │                   │          │
│  ┌──────┴─────────────────┴───────────────────┴───────┐  │
│  │            Page Context Pack (سياق الصفحة)          │  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │ SSE / REST
┌───────────────────────────┼──────────────────────────────┐
│                    طبقة API                               │
│  ┌────────────────────────┴───────────────────────────┐  │
│  │              Domain Router (فصل المجال)             │  │
│  │         domain = "leaks" | "privacy"                │  │
│  └────────┬───────────────────────────┬───────────────┘  │
│           │                           │                   │
│  ┌────────┴────────┐        ┌────────┴────────┐         │
│  │  مساعد التسربات  │        │ مساعد الخصوصية  │         │
│  │   (Leaks AI)    │        │  (Privacy AI)   │         │
│  └────────┬────────┘        └────────┬────────┘         │
│           │                           │                   │
│  ┌────────┴────────────────────────────┴───────────────┐ │
│  │                  محرك الأدوات (Tools Engine)         │ │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │ │
│  │  │ قراءة   │ │ تحليل    │ │ تنفيذ    │ │ سياق   │ │ │
│  │  │ Read    │ │ Analyze  │ │ Execute  │ │ Context │ │ │
│  │  └─────────┘ └──────────┘ └──────────┘ └─────────┘ │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              الاعتمادية (Reliability)                │ │
│  │  Circuit Breaker │ Fallback │ Retry │ Timeout       │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────┐
│                    طبقة البيانات                          │
│  ┌───────────────────────┴────────────────────────────┐  │
│  │                  RAG Engine (لكل مجال)              │  │
│  └───────────────────────┬────────────────────────────┘  │
│                          │                                │
│  ┌───────────┐ ┌─────────┴──┐ ┌────────────┐ ┌────────┐│
│  │ Glossary  │ │   Page     │ │  Training  │ │ Task   ││
│  │ (قاموس)  │ │ Descriptors│ │  Center    │ │ Memory ││
│  └───────────┘ └────────────┘ └────────────┘ └────────┘│
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │              قاعدة البيانات (DB)                    │  │
│  │  كيانات التسربات │ كيانات الخصوصية │ سجل التدقيق  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

---

## تدفق الطلب (Request Flow)

```
1. المستخدم يرسل رسالة عبر Chat Widget أو Full Page
   │
2. UI تُرفق Page Context Pack (route, filters, entity, role, flags)
   │
3. API تحدد المجال (domain) وتوجه للمساعد المناسب
   │
4. المساعد يحلل النية (Intent) ويستخرج المعلمات (Slots)
   │
5. إذا نقصت معلومة → سؤال توضيحي واحد مع خيارات
   │
6. المساعد يختار الأداة المناسبة:
   ├── قراءة → يجلب البيانات من DB/RAG
   ├── تحليل → يحسب الاتجاهات/الارتباطات
   └── تنفيذ → Plan/Preview → تأكيد → Execute → Rollback
   │
7. SSE يبث الرد token-by-token مع حالات واضحة
   │
8. UI تعرض الرد المنظم: ملخص → أرقام → تفسير → روابط → إجراءات
   │
9. سجل التدقيق يسجل كل خطوة: من/متى/ماذا/النتيجة
```

---

## مبادئ التصميم

### 1. عزل المجال (Domain Isolation)
- كل مساعد يعمل في فقاعة معرفية مستقلة
- لا تتشارك البيانات أو الأدوات أو مصادر المعرفة بين المجالين
- كل استدعاء يحمل `domain` ويُرفض إذا خرج عن مجاله

### 2. الأمان أولاً (Security First)
- RBAC على كل أداة وبيان
- تأكيد صريح قبل أي تغيير
- سجل تدقيق شامل لكل إجراء
- Redaction وتقليل البيانات حسب الدور

### 3. الاعتمادية (Reliability)
- Circuit Breaker لمنع الانهيار المتتالي
- Fallback للأسئلة الشائعة
- نتيجة جزئية عند فشل أداة واحدة
- عدم قطع المحادثة مهما حصل

### 4. تجربة المستخدم (User Experience)
- الرد دائماً داخل صندوق المحادثة
- لا تنقل تلقائي بدون إذن
- اقتراحات سياقية مرتبطة بالصفحة والدور
- شفافية كاملة (كيف حُسب؟)

### 5. سياسة التسمية (Naming Policy)
- إلزامية عبر كل الطبقات
- المساعد يصحح المصطلحات الخاطئة تلقائياً
- لا يُعرض ادعاء كحقيقة

---

## التقنيات المستخدمة

| المكون | التقنية |
|--------|---------|
| الواجهة | React + TypeScript + RTL |
| الخط | Tajawal (حصرياً) |
| API | tRPC + Express |
| البث | Server-Sent Events (SSE) |
| قاعدة البيانات | TiDB/MySQL |
| نموذج اللغة | LLM Provider (متوافق مع Circuit Breaker) |
| RAG | فهرس مستقل لكل مجال + تحديث تزايدي |
| المخططات | PNG Server-side rendering |
| التصدير | PDF / Excel / CSV |

```

---

## `platform-kit/specs/domain-isolation.md`

```markdown
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

```

---

## `platform-kit/specs/naming-policy.md`

```markdown
# سياسة التسمية الإلزامية - منصة التسربات

## القاعدة الأساسية

> أي ادعاء بوجود تسرب بيانات شخصية يُسمى **«حالة رصد»** حتى يثبت العكس بعد التحقق الرسمي.

---

## جدول المصطلحات المعتمدة

| المصطلح القديم (محظور) | المصطلح المعتمد (إلزامي) | السبب |
|------------------------|--------------------------|-------|
| حادثة تسرب | **حالة رصد** | لا يُؤكد التسرب قبل التحقق |
| حادثة تسريب | **حالة رصد** | مرادف محظور |
| تسرب بيانات شخصية | **حالة رصد** | يُستخدم فقط بعد التحقق |
| تسرب مؤكد | **حالة رصد** أو **تسرب مؤكد** | «تسرب مؤكد» فقط إذا DB status = تسرب مؤكد |
| عدد السجلات المسربة | **العدد المُدّعى** | ادعاء من البائع/الناشر وليس تحقق |
| عدد السجلات | **العدد المُدّعى** | مرادف محظور |
| السجلات المجمعة | **العينات المتاحة** | ما تم توثيقه فعلياً داخل المنصة |
| البيانات المسربة | **العينات المتاحة** | مرادف محظور |

---

## مراحل الحالة المعتمدة (NAME-06)

```
حالة رصد (افتراضي) → قيد التحقق → تسرب مؤكد → مغلق
```

| المرحلة | الوصف | متى يُستخدم |
|---------|-------|------------|
| **حالة رصد** | الحالة الافتراضية لأي ادعاء جديد | عند الإنشاء تلقائياً |
| **قيد التحقق** | بدأ فريق التحقق بالعمل على الحالة | عند بدء التحقق |
| **تسرب مؤكد** | اكتمل التحقق وثبت وجود تسرب فعلي | بعد التحقق الرسمي فقط |
| **مغلق** | تم إغلاق الحالة (مؤكدة أو غير مؤكدة) | بعد الانتهاء |

---

## التطبيق عبر الطبقات

### 1. قاعدة البيانات (DB)

```sql
-- أسماء الأعمدة
ALTER TABLE monitoring_cases
  RENAME COLUMN incident_name TO case_name;        -- حالة رصد
ALTER TABLE monitoring_cases
  RENAME COLUMN record_count TO claimed_count;      -- العدد المُدّعى
ALTER TABLE monitoring_cases
  ADD COLUMN available_samples INT DEFAULT 0;       -- العينات المتاحة

-- قيم الحالة
ALTER TABLE monitoring_cases
  MODIFY COLUMN status ENUM(
    'حالة رصد',      -- افتراضي
    'قيد التحقق',
    'تسرب مؤكد',
    'مغلق'
  ) DEFAULT 'حالة رصد';
```

### 2. واجهات البرمجة (API)

```typescript
// أسماء الحقول في API Response
interface MonitoringCase {
  id: number;
  caseName: string;           // حالة رصد (وليس incidentName)
  claimedCount: number;       // العدد المُدّعى (وليس recordCount)
  availableSamples: number;   // العينات المتاحة
  status: CaseStatus;
  claimedCountSource: string; // مصدر الادعاء (بائع/ناشر/منصة)
}

type CaseStatus = 'حالة رصد' | 'قيد التحقق' | 'تسرب مؤكد' | 'مغلق';
```

### 3. واجهة المستخدم (UI)

```
✅ صحيح:
  "حالات الرصد: 45"
  "العدد المُدّعى: 10,000 (حسب ادعاء البائع)"
  "العينات المتاحة: 150"

❌ خطأ:
  "حوادث التسرب: 45"
  "عدد السجلات المسربة: 10,000"
  "البيانات المجمعة: 150"
```

### 4. البرومبت (AI) - NAME-07

```
قواعد التسمية الإلزامية:
1. استخدم دائماً: «حالة رصد» وليس «حادثة تسرب»
2. استخدم دائماً: «العدد المُدّعى» وليس «عدد السجلات»
3. استخدم دائماً: «العينات المتاحة» للبيانات الموثقة
4. إذا استخدم المستخدم مصطلحاً قديماً، صحّحه بلطف:
   "أفهم أنك تقصد «حالة رصد» - نستخدم هذا المصطلح لأن..."
5. لا تصف أي حالة بـ «تسرب مؤكد» إلا إذا كانت حالتها في النظام = «تسرب مؤكد»
```

### 5. التقارير والتصدير (Reports) - NAME-08

```
✅ في التقارير:
  "العدد المُدّعى: 10,000 (مصدر الادعاء: البائع XYZ)"
  "ملاحظة: هذا الرقم يمثل ادعاء البائع ولم يتم التحقق منه"

❌ في التقارير:
  "عدد السجلات المسربة: 10,000"  ← يُقدم كحقيقة
```

---

## قائمة التحقق للتنفيذ

| # | البند | الطبقة | الحالة |
|---|-------|--------|--------|
| 1 | تغيير اسم العمود `incident_name` → حقل يعكس «حالة رصد» | DB | ☐ |
| 2 | تغيير اسم العمود `record_count` → حقل يعكس «العدد المُدّعى» | DB | ☐ |
| 3 | إضافة عمود «العينات المتاحة» | DB | ☐ |
| 4 | تحديث قيم Status المعتمدة | DB | ☐ |
| 5 | تحديث API Response لتعكس المصطلحات | API | ☐ |
| 6 | تحديث جميع Labels في UI | UI | ☐ |
| 7 | تحديث Dashboard KPIs | UI | ☐ |
| 8 | تحديث System Prompt | AI | ☐ |
| 9 | تحديث قوالب التقارير | Reports | ☐ |
| 10 | تحديث قوالب التصدير (CSV/Excel/PDF) | Reports | ☐ |
| 11 | بحث شامل عن أي ظهور للمصطلحات القديمة | Testing | ☐ |
| 12 | اختبار إنشاء حالة جديدة بالقيم الافتراضية | Testing | ☐ |

```

---

## `platform-kit/templates/official-letters.md`

```markdown
# قوالب الرسائل الرسمية - راصد الذكي

## المتطلبات المغطاة
DB-13, RE-06, RE-07

---

## 1. قوالب منصة التسربات

### 1.1 إشعار حالة رصد جديدة (مختصر)

```
الموضوع: إشعار حالة رصد جديدة - {{case_id}}

{{recipient_title}} {{recipient_name}},

تم رصد حالة رصد جديدة تتعلق بـ {{entity_name}}.
العدد المُدّعى: {{claimed_count}} (حسب ادعاء {{claim_source}}).

يرجى اتخاذ الإجراءات اللازمة.

فريق راصد
```

### 1.2 إشعار حالة رصد جديدة (متوازن)

```
الموضوع: إشعار حالة رصد جديدة - {{case_id}}

{{recipient_title}} {{recipient_name}},

السلام عليكم ورحمة الله وبركاته،

نود إبلاغكم بأنه تم رصد حالة رصد جديدة تتعلق بـ {{entity_name}} بتاريخ {{detection_date}}.

التفاصيل:
• رقم حالة الرصد: {{case_id}}
• القطاع: {{sector}}
• العدد المُدّعى: {{claimed_count}} سجل
  (مصدر الادعاء: {{claim_source}})
  ملاحظة: هذا الرقم يمثل ادعاء المصدر ولم يتم التحقق منه بعد.
• الحالة الحالية: {{status}}

نأمل مراجعة الحالة واتخاذ الإجراءات المناسبة.

مع خالص التقدير،
فريق منصة راصد الوطنية
```

### 1.3 إشعار حالة رصد جديدة (رسمي جداً)

```
الموضوع: إشعار رسمي - حالة رصد رقم {{case_id}}

بسم الله الرحمن الرحيم

{{recipient_title}} {{recipient_name}}
{{recipient_position}}
{{recipient_organization}}

السلام عليكم ورحمة الله وبركاته،

إشارةً إلى اختصاصات منصة راصد الوطنية في رصد ومتابعة حالات تسرب البيانات الشخصية، نحيطكم علماً بأنه تم رصد حالة رصد جديدة تتعلق بـ {{entity_name}}، وفيما يلي تفاصيلها:

أولاً: بيانات حالة الرصد
───────────────────────
• رقم حالة الرصد: {{case_id}}
• تاريخ الرصد: {{detection_date}}
• القطاع: {{sector}}
• الحالة الحالية: {{status}}

ثانياً: تفاصيل الادعاء
───────────────────────
• العدد المُدّعى: {{claimed_count}} سجل
• مصدر الادعاء: {{claim_source}}
• تاريخ الادعاء: {{claim_date}}
• ملاحظة مهمة: الأرقام المذكورة أعلاه تمثل ادعاءات المصدر المشار إليه،
  ولم يتم التحقق منها من قِبل فريق المنصة بعد. سيتم إشعاركم بنتائج التحقق
  فور اكتمالها.

ثالثاً: العينات المتاحة
───────────────────────
• عدد العينات المتاحة: {{available_samples}} سجل
  (هي ما تم توثيقه داخل المنصة وفق الصلاحيات المعتمدة)

رابعاً: الإجراءات المطلوبة
───────────────────────
{{required_actions}}

نأمل التكرم بمراجعة الحالة واتخاذ ما يلزم من إجراءات، وإفادتنا بما تم.

وتقبلوا وافر التقدير والاحترام،

{{sender_name}}
{{sender_position}}
منصة راصد الوطنية
التاريخ: {{current_date}}
المرجع: {{reference_number}}
```

---

## 2. قوالب منصة الخصوصية

### 2.1 إشعار نقص امتثال (متوازن)

```
الموضوع: نتائج تقييم امتثال سياسة الخصوصية - {{site_name}}

{{recipient_title}} {{recipient_name}},

السلام عليكم ورحمة الله وبركاته،

بناءً على تقييم سياسة الخصوصية لموقعكم {{site_url}} بتاريخ {{assessment_date}}،
تبيّن أن نسبة الامتثال للمادة 12 من نظام حماية البيانات الشخصية هي: {{compliance_score}}%.

البنود الناقصة:
{{missing_clauses}}

نأمل مراجعة سياسة الخصوصية وتحديثها لاستيفاء البنود المذكورة أعلاه.

مع التقدير،
فريق منصة راصد الوطنية
```

### 2.2 تقرير تحسّن (مختصر)

```
الموضوع: تحسّن في امتثال {{site_name}}

{{recipient_title}} {{recipient_name}},

يسعدنا إبلاغكم بأن نسبة امتثال موقعكم {{site_url}} ارتفعت من {{old_score}}% إلى {{new_score}}%.

البنود المُحسّنة: {{improved_clauses}}

شكراً لتعاونكم.

فريق راصد
```

---

## 3. Placeholders المشتركة

| Placeholder | الوصف | مثال |
|-------------|-------|------|
| `{{recipient_title}}` | لقب المستلم | سعادة / معالي |
| `{{recipient_name}}` | اسم المستلم | م. أحمد الشمري |
| `{{recipient_position}}` | منصب المستلم | مدير أمن المعلومات |
| `{{recipient_organization}}` | جهة المستلم | بنك ABC |
| `{{entity_name}}` | اسم الجهة المعنية | بنك ABC |
| `{{case_id}}` | رقم حالة الرصد | RSM-2026-0145 |
| `{{detection_date}}` | تاريخ الرصد | 2026-02-20 |
| `{{sector}}` | القطاع | المالي والمصرفي |
| `{{status}}` | حالة الحالة | حالة رصد |
| `{{claimed_count}}` | العدد المُدّعى | 10,000 |
| `{{claim_source}}` | مصدر الادعاء | البائع XYZ |
| `{{available_samples}}` | العينات المتاحة | 150 |
| `{{current_date}}` | التاريخ الحالي | 2026-02-20 |
| `{{sender_name}}` | اسم المرسل | فريق راصد |
| `{{reference_number}}` | رقم المرجع | REF-2026-0089 |
| `{{site_url}}` | رابط الموقع | example.sa |
| `{{compliance_score}}` | نسبة الامتثال | 62.5 |
| `{{missing_clauses}}` | البنود الناقصة | البند 5، البند 7 |

```

---

## `platform-kit/testing/test-plan.md`

```markdown
# خطة الاختبار الشاملة - راصد الذكي

## المتطلبات المغطاة
T-01 → T-22

---

## ملخص خطة الاختبار

| الفئة | عدد الاختبارات | الأولوية |
|-------|---------------|---------|
| سياسة التسمية | 5 | حرجة |
| صندوق المحادثة والتنقل | 4 | حرجة |
| Streaming وFallback | 2 | عالية |
| الأدوات والصلاحيات والتدقيق | 2 | عالية |
| عزل المجال | 2 | حرجة |
| الاعتمادية والأعطال | 3 | عالية |
| المخططات ولوحات المؤشرات | 2 | متوسطة |
| Bulk Import | 2 | متوسطة |
| **الإجمالي** | **22** | |

---

## 1. اختبار سياسة التسمية (إلزامي - حرج)

### T-01: فحص الصفحات للمصطلحات القديمة

```
الإجراء:
  1. فتح كل صفحة رئيسية في منصة التسربات:
     - لوحة المؤشرات /app/leaks/dashboard
     - قائمة الحالات /app/leaks/cases
     - تفاصيل حالة /app/leaks/cases/:id
     - التقارير /app/leaks/reports
     - التنبيهات /app/leaks/alerts
  2. البحث (Ctrl+F) عن:
     - "حادثة" (بجميع الصيغ)
     - "عدد السجلات"
     - "السجلات المسربة"
     - "البيانات المسربة"

النتيجة المتوقعة:
  - لا يظهر أي من المصطلحات القديمة
  - تظهر فقط: حالة رصد، العدد المُدّعى، العينات المتاحة

الحالة: ☐
```

### T-02: التحقق من المصطلحات المعتمدة

```
الإجراء:
  1. في كل صفحة من T-01:
     - تحقق من وجود "حالة رصد" بدلاً من "حادثة"
     - تحقق من وجود "العدد المُدّعى" بدلاً من "عدد السجلات"
     - تحقق من وجود "العينات المتاحة" كحقل/عمود ظاهر

النتيجة المتوقعة:
  - جميع المصطلحات المعتمدة مُطبقة

الحالة: ☐
```

### T-03: إنشاء حالة جديدة

```
الإجراء:
  1. انتقل إلى /app/leaks/cases
  2. انقر "إنشاء حالة رصد" (وليس "إنشاء حادثة")
  3. تحقق أن:
     - العنوان الافتراضي يحتوي "حالة رصد"
     - حقل Status يبدأ بـ "حالة رصد"
     - يوجد حقل "العدد المُدّعى"
     - يوجد حقل "العينات المتاحة"
  4. أنشئ الحالة

النتيجة المتوقعة:
  - الحالة تُنشأ بـ status = "حالة رصد"
  - الأسماء والحقول تعكس المصطلحات المعتمدة

الحالة: ☐
```

### T-04: التصدير

```
الإجراء:
  1. صدّر قائمة حالات الرصد (CSV/Excel)
  2. افتح الملف المُصدّر
  3. تحقق من:
     - أسماء الأعمدة: "حالة رصد"، "العدد المُدّعى"، "العينات المتاحة"
     - لا يظهر العدد المُدّعى كحقيقة مؤكدة
     - لا تظهر مصطلحات قديمة

النتيجة المتوقعة:
  - التصدير يعكس سياسة التسمية بالكامل

الحالة: ☐
```

### T-05: التوثيق

```
الإجراء:
  - وثّق نتائج T-01 إلى T-04 بلقطات شاشة أو سجل اختبار

الحالة: ☐
```

---

## 2. اختبار صندوق المحادثة والتنقل

### T-06: الرد داخل الصندوق

```
الإجراء:
  1. افتح صندوق المحادثة من أي صفحة
  2. أرسل أسئلة متنوعة:
     - سؤال عادي: "كم حالة رصد جديدة؟"
     - سؤال يتطلب أداة: "أعطني تفاصيل الحالة 123"
     - سؤال خاطئ/غامض: "asdfghjkl"
     - سؤال يسبب خطأ: (محاكاة فشل DB)
  3. تحقق أن كل رد يظهر داخل الصندوق

النتيجة المتوقعة:
  - لا تُفتح صفحة خطأ أبداً
  - الأخطاء تظهر كرسائل داخل الصندوق

الحالة: ☐
```

### T-07: Expand/Collapse/Maximize

```
الإجراء:
  1. اختبر Collapse: الصندوق يتصغر إلى FAB
  2. اختبر Expand: الصندوق يعود لحجمه الطبيعي
  3. اختبر Maximize: يملأ الصفحة مع بقاء sidebar
  4. اختبر Full Page: يفتح /app/smart-rasid
  5. في كل حالة: تحقق أن المحادثة مستمرة (نفس الهيستوري)

النتيجة المتوقعة:
  - جميع الأوضاع تعمل
  - المحادثة لا تُفقد

الحالة: ☐
```

### T-08: طلب التنقل - موافقة

```
الإجراء:
  1. أرسل: "أعطني تفاصيل الحالة 123"
  2. عندما يقترح المساعد التنقل → يظهر Dialog
  3. انقر "سماح"
  4. تحقق من:
     - تم التنقل إلى /app/leaks/cases/123
     - المحادثة مستمرة (نفس conversationId)
     - لم تُفقد الرسائل السابقة

النتيجة المتوقعة:
  - تنقل سلس مع حفظ المحادثة

الحالة: ☐
```

### T-09: طلب التنقل - رفض

```
الإجراء:
  1. أرسل: "أعطني تفاصيل الحالة 123"
  2. عندما يقترح المساعد التنقل → يظهر Dialog
  3. انقر "البقاء هنا"
  4. تحقق من:
     - لم يتغير الـ URL
     - المساعد يستمر بالرد داخل الصندوق
     - يظهر رابط اختياري للتنقل لاحقاً

النتيجة المتوقعة:
  - لا تنقل، رابط اختياري فقط

الحالة: ☐
```

---

## 3. اختبار Streaming وFallback

### T-10: SSE Streaming

```
الإجراء:
  1. أرسل سؤالاً يتطلب رداً طويلاً
  2. راقب:
     - ظهور حالة "جارٍ فهم السؤال..."
     - بث الرد token-by-token
     - ظهور حالة "جارٍ جلب بيانات..." (عند استدعاء أداة)
     - انتهاء الرد (done)
  3. راقب DevTools → Network → EventStream

النتيجة المتوقعة:
  - أحداث SSE: status → token → tool_call → token → done
  - لا أخطاء في Console

الحالة: ☐
```

### T-11: Fallback

```
الإجراء:
  1. محاكاة فشل SSE (قطع الاتصال أو تعطيل EventSource)
  2. أرسل سؤالاً

النتيجة المتوقعة:
  - الرد يصل كاملاً (غير مبثوث)
  - لا تنكسر الواجهة
  - يظهر الرد بشكل طبيعي

الحالة: ☐
```

---

## 4. اختبار الأدوات والصلاحيات

### T-12: الأدوات والصلاحيات

```
الإجراء:
  لكل أداة من الأدوات المسجلة:
  1. استدعها بدور viewer → تحقق من القراءة فقط
  2. استدعها بدور analyst → تحقق من القراءة + التنفيذ المحدود
  3. استدعها بدور admin → تحقق من الصلاحيات الكاملة
  4. تحقق من سجل التدقيق بعد كل استدعاء

النتيجة المتوقعة:
  - الصلاحيات تُطبق بشكل صحيح
  - كل استدعاء مُسجل في التدقيق

الحالة: ☐
```

### T-13: التأكيد والتراجع

```
الإجراء:
  1. اطلب إنشاء حالة رصد → تظهر معاينة → أكّد → تُنشأ
  2. اطلب إنشاء حالة رصد → تظهر معاينة → ألغِ → لا تُنشأ
  3. اطلب التراجع عن الإنشاء → يُسأل عن التأكيد → أكّد → يتراجع

النتيجة المتوقعة:
  - Plan/Preview → Confirm → Execute يعمل
  - Cancel يلغي بدون تنفيذ
  - Rollback يعيد الحالة السابقة

الحالة: ☐
```

---

## 5. اختبار عزل المجال

### T-14: عزل الأدوات والمعرفة

```
الإجراء:
  1. في مساعد التسربات: اسأل "ما نسبة الامتثال؟"
  2. في مساعد الخصوصية: اسأل "كم حالة رصد جديدة؟"

النتيجة المتوقعة:
  - مساعد التسربات يرشد للمساعد الآخر ولا يجيب
  - مساعد الخصوصية يرشد للمساعد الآخر ولا يجيب
  - لا يُستدعى أداة من المجال الآخر

الحالة: ☐
```

### T-15: عزل RAG والتدريب

```
الإجراء:
  1. أضف وثيقة تدريب لمجال التسربات
  2. ابحث عنها من مساعد الخصوصية
  3. والعكس

النتيجة المتوقعة:
  - لا تظهر وثائق المجال الآخر
  - فهرس RAG منفصل

الحالة: ☐
```

---

## 6. اختبار الاعتمادية

### T-16: فشل DB

```
الإجراء:
  - محاكاة فشل DB (timeout أو connection error)
  - أرسل سؤالاً

النتيجة المتوقعة:
  - رسالة مفهومة: "تعذر الوصول للبيانات حالياً"
  - المساعد لا ينهار
  - يقدم نتيجة جزئية إن أمكن

الحالة: ☐
```

### T-17: فشل LLM

```
الإجراء:
  - محاكاة فشل مزود LLM (timeout أو 500)
  - أرسل سؤالاً

النتيجة المتوقعة:
  - Circuit Breaker يتدخل
  - Fallback يرد (إن كان سؤالاً شائعاً)
  - رسالة مفهومة للمستخدم

الحالة: ☐
```

### T-18: Timeouts وRetries

```
الإجراء:
  - محاكاة timeout مع retry
  - تحقق من سجلات الأخطاء

النتيجة المتوقعة:
  - يُعيد المحاولة (حسب الإعداد)
  - يُسجل تفاصيل الخطأ (status, body)
  - رسالة مفهومة عند استنفاد المحاولات

الحالة: ☐
```

---

## 7. اختبار المخططات

### T-19: إنشاء مخطط

```
الإجراء:
  - اطلب: "أنشئ مخطط اتجاهات حالات الرصد"

النتيجة المتوقعة:
  - PNG يُنشأ ويُعرض داخل الدردشة
  - وصف مختصر للنتائج
  - إمكانية التكبير

الحالة: ☐
```

### T-20: بيانات حقيقية

```
الإجراء:
  - أنشئ مخططاً وقارن أرقامه مع DB مباشرة

النتيجة المتوقعة:
  - الأرقام تتطابق مع DB
  - الفلاتر/السياق مُطبقة

الحالة: ☐
```

---

## 8. اختبار Bulk Import

### T-21: رفع ملفات

```
الإجراء:
  - ارفع CSV/JSON/XLSX يحتوي بيانات حالات رصد

النتيجة المتوقعة:
  - Parsing صحيح
  - كشف الكيان (monitoring_case)
  - upsert/update/insert حسب الحاجة
  - تقرير نتائج واضح

الحالة: ☐
```

### T-22: حذف جماعي

```
الإجراء:
  - اطلب حذف جماعي لحالات محددة

النتيجة المتوقعة:
  - يُطلب تأكيد صريح
  - الصلاحيات تُفحص
  - التدقيق يُسجل
  - تقرير نتائج الحذف

الحالة: ☐
```

```

---

## `platform-kit/testing/test-scenarios.md`

```markdown
# سيناريوهات الاختبار التفصيلية - راصد الذكي

## سيناريوهات شاملة (End-to-End)

---

### السيناريو 1: رحلة محلل تسربات كاملة

```
الهدف: اختبار رحلة المستخدم الكاملة لمحلل التسربات

الخطوات:
1. تسجيل الدخول بدور "analyst"
2. فتح لوحة مؤشرات التسربات
3. النقر على مؤشر "حالات رصد جديدة"
4. فتح صندوق راصد الذكي
5. سؤال: "ملخص حالات الرصد الجديدة اليوم"
6. متابعة: "أعطني تفاصيل أعلى حالة بالعدد المُدّعى"
7. المساعد يقترح التنقل → موافقة
8. في صفحة التفاصيل: "أنشئ تقرير PDF لهذه الحالة"
9. المساعد يعرض المعاينة → تأكيد
10. تحميل التقرير والتحقق من المصطلحات

التحقق:
  ☐ المصطلحات المعتمدة في كل خطوة
  ☐ لا صفحة خطأ
  ☐ التنقل يحفظ المحادثة
  ☐ التقرير يعكس سياسة التسمية
  ☐ سجل التدقيق يسجل كل إجراء
```

### السيناريو 2: رحلة مشرف خصوصية

```
الهدف: اختبار رحلة مشرف الخصوصية

الخطوات:
1. تسجيل الدخول بدور "admin"
2. فتح لوحة مؤشرات الخصوصية
3. فتح صندوق المساعد
4. سؤال: "ما أقل القطاعات امتثالاً هذا الشهر؟"
5. متابعة: "قارن القطاع الحكومي مع الخاص"
6. طلب مخطط بياني: "أرني المقارنة كمخطط"
7. طلب إنشاء متابعة: "أنشئ متابعة للمواقع الأقل امتثالاً"
8. المعاينة → تأكيد

التحقق:
  ☐ لا مصطلحات تسربات تظهر
  ☐ المخطط يعتمد على بيانات حقيقية
  ☐ المتابعة تُنشأ بعد التأكيد
  ☐ سجل التدقيق
```

### السيناريو 3: عزل المجال

```
الهدف: التحقق من عدم تسرب المعرفة بين المجالين

الخطوات:
1. في مساعد التسربات:
   - "ما نسبة الامتثال؟" → يرشد للمساعد الآخر
   - "كم موقع غير ممتثل؟" → يرشد للمساعد الآخر
   - "استخدم أداة get_compliance_summary" → يُرفض

2. في مساعد الخصوصية:
   - "كم حالة رصد جديدة؟" → يرشد للمساعد الآخر
   - "ما العدد المُدّعى للحالة 123؟" → يرشد للمساعد الآخر
   - "استخدم أداة query_monitoring_cases" → يُرفض

التحقق:
  ☐ كل مساعد يعمل في مجاله فقط
  ☐ لا أداة تُستدعى من المجال الآخر
  ☐ الإرشاد ودي وواضح
```

### السيناريو 4: تصحيح المصطلحات

```
الهدف: التحقق من تصحيح المساعد للمصطلحات القديمة

الخطوات:
1. "كم حادثة تسرب جديدة؟"
   → يصحح: "أفهم أنك تقصد «حالات الرصد»..."
   → يجيب بالمصطلح الصحيح

2. "كم عدد السجلات المسربة في الحالة 123؟"
   → يصحح: "تقصد «العدد المُدّعى»..."
   → يوضح أنه ادعاء

3. "هل هذا تسرب مؤكد؟"
   → يتحقق من DB status
   → إذا لم يكن "تسرب مؤكد": "هذه حالة رصد قيد التحقق"

التحقق:
  ☐ التصحيح بلطف وبدون إهانة
  ☐ الإجابة بالمصطلح الصحيح دائماً
  ☐ لا تأكيد تسرب إلا من DB
```

### السيناريو 5: معالجة الأعطال

```
الهدف: التحقق من سلوك النظام عند الأعطال

الخطوات:
1. فشل DB:
   - إرسال سؤال أثناء عطل DB
   → المساعد يرد: "تعذر الوصول للبيانات حالياً. سأحاول المساعدة بمعلومات عامة."
   → لا انهيار

2. فشل LLM:
   - إرسال سؤال أثناء عطل LLM provider
   → Circuit Breaker → Fallback
   → رسالة: "المساعد الذكي غير متاح مؤقتاً. حاول لاحقاً."

3. فشل أداة واحدة:
   - أداة query_cases تفشل
   → المساعد يعود بنتيجة جزئية
   → يوضح ما لم يتمكن من جلبه

التحقق:
  ☐ لا انهيار كامل
  ☐ رسائل خطأ واضحة ومفهومة
  ☐ نتائج جزئية عند الإمكان
  ☐ تسجيل الأخطاء
```

### السيناريو 6: الاستيراد الجماعي

```
الهدف: اختبار رفع ملف ومعالجته

الخطوات:
1. إرفاق ملف CSV بحالات رصد (200 صف)
2. المساعد يعرض:
   - "تم اكتشاف 200 حالة رصد في الملف"
   - "سيتم: إدراج 180 + تحديث 15 + تجاوز 5"
   - "هل تريد المتابعة؟"
3. تأكيد
4. التحقق من تقرير النتائج

التحقق:
  ☐ Parsing صحيح
  ☐ كشف الكيان صحيح
  ☐ تقرير نتائج تفصيلي
  ☐ الأخطاء واضحة ومحددة
  ☐ سجل التدقيق
```

### السيناريو 7: الدليل الحي

```
الهدف: اختبار الدليل التفاعلي

الخطوات:
1. "كيف أنشئ حالة رصد جديدة؟"
2. المساعد يقترح الدليل الحي → قبول
3. الدليل يبدأ:
   - خطوة 1: "انتقل لصفحة الحالات" (مع إبراز)
   - خطوة 2: "انقر إنشاء" (مع إبراز الزر)
   - خطوة 3: "املأ البيانات" (مع إبراز الحقول)
4. إعادة تحميل الصفحة أثناء الدليل
5. يظهر حوار الاستئناف → استئناف
6. إكمال الدليل

التحقق:
  ☐ الإبراز يعمل بشكل صحيح
  ☐ التنقل بين الخطوات سلس
  ☐ الاستعادة بعد إعادة التحميل
  ☐ تسجيل إكمال الجلسة
```

```

---

## `platform-kit/ui/chat-widget.md`

```markdown
# مواصفات صندوق المحادثة (Chat Widget) - راصد الذكي

## المتطلبات المغطاة
UI-01, UI-02, UI-03, UI-04, UI-05, CHAT-01 → CHAT-05

---

## 1. الأوضاع الثلاثة

### 1.1 الوضع المصغر (Collapsed - FAB)
- زر عائم (Floating Action Button) مع شخصية راصد
- يظهر في جميع الصفحات
- نقرة واحدة تفتح الصندوق المصغر

### 1.2 الوضع الموسّع (Expanded Widget)
- صندوق محادثة متوسط الحجم (400×600px تقريباً)
- يظهر في زاوية الصفحة
- أزرار: تكبير / تصغير / تكبير كامل / فتح صفحة كاملة

### 1.3 الوضع الكامل (Maximized / Full Page)
- **Maximize**: يملأ الصفحة الحالية مع إبقاء الـ sidebar
- **Full Page**: صفحة مستقلة `/app/smart-rasid` مع نفس المحادثة والهيستوري

---

## 2. مكونات الصندوق

```
┌─────────────────────────────────────────┐
│ ⟨ شخصية راصد ⟩  راصد الذكي    [─][□][×] │  ← Header: عنوان + أزرار التحكم
├─────────────────────────────────────────┤
│ ⟨ حالة المساعد: جارٍ فهم السؤال... ⟩   │  ← Status Bar
├─────────────────────────────────────────┤
│                                         │
│  💬 مرحباً! كيف يمكنني مساعدتك؟        │  ← Messages Area
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 📊 حالات الرصد الجديدة: 12     │    │  ← Structured Response
│  │ العدد المُدّعى الإجمالي: 45,000 │    │
│  │ العينات المتاحة: 340           │    │
│  │                                 │    │
│  │ 🔗 عرض التفاصيل               │    │  ← Drillthrough Link
│  │                                 │    │
│  │ 🛠️ الأدوات: query_cases (230ms)│    │  ← Tool Trace
│  └─────────────────────────────────┘    │
│                                         │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ التفاصيل │ │ تصدير   │ │ مخطط   │ │  ← Follow-up Suggestions
│  └──────────┘ └──────────┘ └─────────┘ │
├─────────────────────────────────────────┤
│ ┌─────────────────────────┐ ┌────────┐ │
│ │ اكتب رسالتك...          │ │ إرسال  │ │  ← Input Area
│ └─────────────────────────┘ └────────┘ │
│ 📎 إرفاق ملف  🎤 صوت                  │  ← Action Buttons
└─────────────────────────────────────────┘
```

---

## 3. القواعد الحاكمة

### 3.1 الرد داخل الصندوق فقط (CHAT-01, UI-01)
- **لا يفتح صفحة خطأ أبداً** تحت أي ظرف
- كل خطأ يُعرض كرسالة داخل الصندوق
- إذا فشل SSE، يُستخدم fallback بدون كسر الواجهة

### 3.2 لا تنقل تلقائي (CHAT-03)
- أي رابط يقترحه المساعد يظهر كرابط نصي داخل الصندوق
- عند نقر الرابط: يظهر Dialog إذن التنقل
- المستخدم يختار: **سماح** أو **البقاء هنا**

### 3.3 حفظ المحادثة عبر التنقل (CHAT-04)
- عند السماح بالتنقل: `conversationId` يبقى كما هو
- الهيستوري لا يُفقد
- بعد الوصول للصفحة الجديدة: يُرسل Page Context Pack تلقائياً

### 3.4 رفض التنقل (CHAT-05)
- يستمر داخل الصندوق
- الرابط يبقى متاحاً كنص اختياري
- لا تأثير على المحادثة

---

## 4. نمط الرد المنظم (UI-05, PR-05)

كل رد يتبع الهيكل التالي:

```
1. ملخص (سطران كحد أقصى)
   "يوجد 12 حالة رصد جديدة هذا الأسبوع، بزيادة 20% عن الأسبوع الماضي."

2. أرقام/نتائج (جدول أو قائمة)
   | المؤشر | القيمة |
   |--------|--------|
   | حالات رصد جديدة | 12 |
   | العدد المُدّعى الإجمالي | 45,000 |
   | العينات المتاحة | 340 |

3. تفسير مختصر
   "الزيادة مرتبطة بنشاط ملحوظ في قطاع التجزئة."

4. روابط Drillthrough
   🔗 عرض قائمة الحالات | 🔗 تفاصيل أعلى حالة

5. إجراءات مقترحة
   [إنشاء تقرير] [تصدير Excel] [عرض مخطط]
```

---

## 5. الاقتراحات (UI-11, UI-12)

### 5.1 Suggested Actions (عند فتح الصندوق)
- 3-6 اقتراحات مرتبطة بالصفحة الحالية والدور
- تتحدث تلقائياً عند تغيير الصفحة

```typescript
interface SuggestedAction {
  text: string;       // "كم حالة رصد جديدة؟"
  icon?: string;      // "📊"
  action: string;     // الرسالة التي تُرسل عند النقر
  priority: number;   // ترتيب الظهور
}
```

### 5.2 Follow-up Suggestions (بعد كل رد)
- 2-4 أزرار جاهزة مرتبطة بسياق الرد
- تختفي عند إرسال رسالة جديدة

---

## 6. الشفافية (UI-13)

### Tool Trace (للمخولين فقط)
```
🛠️ الأدوات المستدعاة:
  1. query_monitoring_cases (230ms) → 12 نتيجة
  2. analyze_trends (180ms) → اتجاه تصاعدي

📊 مصدر البيانات: حالات الرصد
🔍 الفلاتر: الأسبوع الحالي، جميع الحالات
🕐 آخر تحديث: قبل 5 دقائق
```

---

## 7. Dialog إذن التنقل (UI-08)

```
┌─────────────────────────────────────┐
│                                     │
│  🧭 راصد الذكي يقترح الانتقال إلى:│
│                                     │
│  📄 تفاصيل حالة الرصد #123         │
│  /app/leaks/cases/123               │
│                                     │
│  ℹ️ لعرض التفاصيل الكاملة          │
│     والأدلة المرفقة                 │
│                                     │
│  ┌──────────┐  ┌──────────────────┐ │
│  │ ✅ سماح  │  │ ❌ البقاء هنا   │ │
│  └──────────┘  └──────────────────┘ │
└─────────────────────────────────────┘
```

---

## 8. رفع الملفات (UI-20)

```
📎 المستخدم يرفق ملف CSV

┌─────────────────────────────────┐
│ 📁 data_import.csv (2.3 MB)    │
│ ████████████░░░░░░ 67%         │  ← شريط تقدم
│ جارٍ تحليل الملف...             │
└─────────────────────────────────┘

بعد الانتهاء:
┌─────────────────────────────────┐
│ ✅ تم معالجة الملف:             │
│ • مُدرج: 150 سجل               │
│ • مُحدّث: 23 سجل               │
│ • مُتجاوز: 5 سجلات (مكرر)      │
│ • أخطاء: 2 سجل                 │
│                                 │
│ [عرض الأخطاء] [تصدير التقرير]  │
└─────────────────────────────────┘
```

```

---

## `platform-kit/ui/guide-overlay.md`

```markdown
# مواصفات الدليل الحي (Guide Overlay) - راصد الذكي

## المتطلبات المغطاة
UI-14, UI-15, DB-05, DB-06, DB-07

---

## المبدأ

نظام إرشاد تفاعلي يُوجّه المستخدم خطوة بخطوة لإنجاز مهام محددة، مع إبراز العناصر المستهدفة والتنقل التلقائي بين الصفحات.

---

## مكونات الواجهة

### 1. Overlay العام

```
┌──────────────────────────────────────────────────────┐
│  ████████████████████ خلفية معتمة ████████████████████│
│  ██████                                    ██████████│
│  ██████  ┌──────────────────────────┐      ██████████│
│  ██████  │                          │      ██████████│
│  ██████  │   🔆 العنصر المُبرز     │      ██████████│
│  ██████  │   (Spotlight/Border)     │      ██████████│
│  ██████  │                          │      ██████████│
│  ██████  └──────────────────────────┘      ██████████│
│  ██████         ▼                          ██████████│
│  ██████  ┌──────────────────────────────┐  ██████████│
│  ██████  │ خطوة 2 من 5                  │  ██████████│
│  ██████  │                              │  ██████████│
│  ██████  │ انقر على زر "إنشاء حالة     │  ██████████│
│  ██████  │ رصد جديدة" لبدء الإنشاء     │  ██████████│
│  ██████  │                              │  ██████████│
│  ██████  │ [◀ السابق] [التالي ▶] [إنهاء]│  ██████████│
│  ██████  └──────────────────────────────┘  ██████████│
│  ████████████████████████████████████████████████████│
└──────────────────────────────────────────────────────┘
```

### 2. أنواع الإبراز

| النوع | الوصف | الاستخدام |
|-------|-------|----------|
| `spotlight` | حلقة ضوء حول العنصر مع تعتيم المحيط | الافتراضي |
| `border` | حدود متوهجة حول العنصر | للعناصر الكبيرة |
| `pulse` | نبض متكرر حول العنصر | لجذب الانتباه |
| `arrow` | سهم يشير للعنصر | للعناصر الصغيرة |

### 3. أنواع الإجراءات

| النوع | الوصف | المثال |
|-------|-------|--------|
| `click` | انتظار نقر المستخدم على العنصر | "انقر على زر الإنشاء" |
| `type` | انتظار كتابة نص | "اكتب اسم حالة الرصد" |
| `select` | انتظار اختيار من قائمة | "اختر القطاع" |
| `scroll` | التمرير لعنصر | "مرر لأسفل لرؤية التفاصيل" |
| `wait` | انتظار فترة محددة | "انتظر تحميل البيانات" |
| `observe` | للمشاهدة فقط (التالي يدوي) | "لاحظ المؤشرات" |

---

## تدفق الدليل

```
1. المستخدم يطلب دليلاً (أو يبدأه من كتالوج الأدلة)
   │
2. يُنشأ Guide Session (DB-07): status = 'active', current_step = 1
   │
3. تُجلب خطوات الدليل (DB-06) مرتبة حسب step_number
   │
4. لكل خطوة:
   ├── إذا route مختلف → تنقل للصفحة المطلوبة
   ├── إبراز العنصر (selector + highlight_type)
   ├── عرض نص الخطوة + رقم الخطوة
   ├── انتظار إجراء المستخدم (action_type)
   └── تحديث current_step في الجلسة
   │
5. بعد آخر خطوة:
   ├── تحديث status = 'completed'
   └── عرض رسالة نجاح
   │
6. إذا أنهى المستخدم مبكراً:
   └── تحديث status = 'abandoned'
```

---

## استعادة الجلسة (UI-15)

عند إعادة تحميل الصفحة أثناء دليل نشط:

```typescript
// عند تحميل التطبيق
async function checkActiveGuideSession(userId: number) {
  const activeSession = await api.getActiveGuideSession(userId);

  if (activeSession && activeSession.status === 'active') {
    // عرض حوار الاستئناف
    showResumeDialog({
      guideName: activeSession.guide.title,
      currentStep: activeSession.currentStep,
      totalSteps: activeSession.guide.stepsCount,
      onResume: () => resumeGuide(activeSession),
      onAbandon: () => abandonGuide(activeSession.id)
    });
  }
}
```

```
┌─────────────────────────────────────┐
│                                     │
│  📖 لديك دليل نشط:                │
│  "إنشاء حالة رصد جديدة"           │
│                                     │
│  الخطوة الحالية: 3 من 5            │
│                                     │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ ▶ استئناف    │ │ ✕ إلغاء     │  │
│  └──────────────┘ └──────────────┘  │
└─────────────────────────────────────┘
```

---

## التكامل مع المساعد

```
المستخدم: "كيف أنشئ حالة رصد جديدة؟"

المساعد:
"لإنشاء حالة رصد جديدة:
1. انتقل إلى صفحة حالات الرصد
2. انقر على زر «إنشاء حالة رصد»
3. املأ البيانات المطلوبة

🎯 هل تريد أن أبدأ لك الدليل التفاعلي؟
[▶ ابدأ الدليل] [لا، شكراً]"

← المستخدم ينقر "ابدأ الدليل"
← المساعد يستدعي start_live_guide(guideId)
← يبدأ الـ Guide Overlay
```

```

---

## `platform-kit/ui/page-context.md`

```markdown
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

```

---

