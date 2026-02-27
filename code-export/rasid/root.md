# rasid - root

> Auto-extracted source code documentation

---

## `.dockerignore`

```
node_modules
.git
.manus
.manus-logs
*.md
.env
.env.*

```

---

## `.gitattributes`

```
client/public/screenshots/*.png filter=lfs diff=lfs merge=lfs -text
client/public/evidence/**/*.png filter=lfs diff=lfs merge=lfs -text
client/public/evidence/**/*.webp filter=lfs diff=lfs merge=lfs -text
server/seed-data.json.gz filter=lfs diff=lfs merge=lfs -text
server/seed-scans.json.gz filter=lfs diff=lfs merge=lfs -text

```

---

## `.gitignore`

```
node_modules/
.env
.env.local
dist/
.manus-logs/
*.log
server/seed-data.json
screenshots/
client/public/screenshots/

```

---

## `.gitkeep`

```

```

---

## `.prettierignore`

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.dist

# Generated files
*.tsbuildinfo
coverage/

# Package files
package-lock.json
pnpm-lock.yaml

# Database
*.db
*.sqlite
*.sqlite3

# Logs
*.log

# Environment files
.env*

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

```

---

## `.prettierrc`

```
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": false,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "proseWrap": "preserve"
}

```

---

## `ADMIN_CONTROL_NOTES.md`

```markdown
# Admin Control Panel Implementation Notes

## 4 new tables needed:
1. permission_groups
2. permissions
3. user_group_assignments
4. page_registry
5. ai_personality_config

## 5 tabs in AdminControlPanel.tsx:
1. Users management
2. Groups management (with permissions modal)
3. Pages management
4. Audit log (existing, link here)
5. AI Training center

## Key files to create:
- server/permissions.ts (middleware)
- client/src/hooks/usePermission.ts
- client/src/pages/AdminControlPanel.tsx
- Add route /admin/control in DashboardLayout.tsx

## Default groups: root_admin, director, manager, analyst, viewer
## root_admin NEVER restricted
## isSystem groups cannot be deleted

```

---

## `CHANGELOG.md`

```markdown
# Changelog

## [1.0.1] - 2026-02-21
### Added
- إضافة حزمة توثيق كاملة للمشروع تشمل 25 مستنداً ضمن مجلد `docs/`.
- إضافة `README.md` محدث يتضمن نظرة عامة، متطلبات التشغيل، وبنية المشروع.
- إضافة `Database Schema` و`Architecture Diagram` بصيغة Mermaid.

### Updated
- إضافة توثيق تفصيلي لهيكل منصة الخصوصية وهيكل منصة رصد حالات التسريب.
- إضافة مصفوفة وظائف الصفحات لكل منصة لتوضيح الوظائف صفحة بصفحة.

## [1.0.0] - Initial
- الإطلاق الأولي لمنصة Rasid National Platform.

```

---

## `COMPREHENSION_REPORT.md`

```markdown
# تقرير فهم متطلبات منصة راصد الوطنية (COMPREHENSION_REPORT.md)

**التاريخ:** 18 فبراير 2026

**مقدمة:** تم إعداد هذا التقرير بناءً على تحليل شامل لجميع ملفات المتطلبات (P0) والمستندات المرجعية المقدمة. يهدف هذا التقرير إلى توثيق فهمي لنطاق المشروع، وتحديد مراحل التنفيذ، وتوضيح ما هو خارج النطاق، وتحديد معايير القبول لكل مرحلة، وذلك قبل البدء بأي أعمال تنفيذية أو برمجية.

---

## 1. ما تم فهمه عن نطاق المنصة

منصة "راصد" هي منظومة وطنية متكاملة للرصد الذكي، ترتكز على محورين أساسيين، مع الالتزام الصارم بمصطلحات نظام حماية البيانات الشخصية السعودي (PDPL):

1.  **رصد امتثال الخصوصية:** فحص وزحف آلاف المواقع السعودية لاكتشاف صفحات سياسة الخصوصية، ثم تحليل محتواها دلالياً لتقييم مدى استيفائها للبنود الثمانية المحددة في المادة 12 من نظام حماية البيانات الشخصية.
2.  **رصد تسريبات البيانات:** اكتشاف ومتابعة "حالات الرصد" المتعلقة بتسريب البيانات الشخصية، مع استخدام مصطلحات محددة مثل "حالة رصد" و"العدد المُدّعى" بدلاً من "حادثة تسريب" إلى حين اكتمال التحقق الرسمي.
3.  **الذكاء الاصطناعي (راصد الذكي):** استخدام نماذج اللغة المتقدمة (LLM) بشكل عميق في جميع أجزاء المنصة، ليس فقط كأداة مساعدة، بل كمحرك أساسي للتحليل الدلالي، وتقديم الاقتراحات السياقية، وتنفيذ المهام بالنيابة عن المستخدم.
4.  **بنية تحتية ضخمة:** المشروع قائم على بنية برمجية موجودة (React, tRPC, Express, TiDB/MySQL) تحتوي على ما يقارب 138 جدول في قاعدة البيانات و 126 صفحة واجهة مستخدم، مما يعني أن العمل هو استكمال وإصلاح وتوثيق وليس بناء من الصفر.
5.  **لوحات مؤشرات تفاعلية (Down-Drill):** التركيز على أن تكون جميع الأرقام والمؤشرات في لوحات التحكم قابلة للنقر للوصول إلى تفاصيل أعمق، مما يسمح بالتحليل المتدرج للبيانات.
6.  **التخصيص والتحكم (لوحتي والإدارة):** توفير مستوى عالٍ من التخصيص للمستخدم عبر صفحة "لوحتي" (Canvas) التي تتيح بناء لوحات مؤشرات خاصة، بالإضافة إلى لوحة إدارة شاملة للتحكم في كل جوانب المنصة (المظهر، الصلاحيات، الميزات).
7.  **نظام صلاحيات متقدم (RBAC):** وجود حاجة ماسة لتفعيل نظام أدوار وصلاحيات مفصل (13 دور) للتحكم فيمن يرى ماذا، وهو متطلب غير منفذ حالياً.
8.  **التوثيق الفني الشامل:** أحد المتطلبات الأساسية غير المنفذة هو إنشاء 19 وثيقة مواصفات فنية مفصلة (`/specs`) تغطي كل جانب من جوانب النظام، من المعمارية إلى نماذج البيانات وواجهات الـ API.
9.  **الهوية البصرية واللغة:** الالتزام الكامل باللغة العربية (RTL)، استخدام خط "Tajawal" فقط، وتطبيق هوية "راصد" البصرية الرسمية في جميع أنحاء المنصة.

---

## 2. مراحل التنفيذ (Phases)

سيتم اتباع مراحل التنفيذ الثمانية المذكورة في البرومت الرئيسي (`rasid_master_prompt_v3_ultra_clear.md`) بالترتيب الإلزامي التالي، مع عدم الانتقال إلى مرحلة قبل إكمال وقبول المرحلة التي تسبقها:

| المرحلة | العنوان | الوصف المختصر |
| :--- | :--- | :--- |
| **Phase 1** | **تأسيس المشروع والنشر** | إصلاح المشاكل الحالية (DNS/SSL)، وضمان عمل المشروع محلياً وعلى بيئة Staging. |
| **Phase 2** | **تقسيم الصفحات + التنقل + RTL/الهوية** | تطبيق هيكل الصفحات والقوائم المحدد، وتطبيق الهوية البصرية والخط العربي بشكل كامل. |
| **Phase 3** | **تغذية الخصوصية الأساسية + سجل الصور** | استيراد بيانات المواقع من ملف Excel وربط صور سياسات الخصوصية بها مع سجل تاريخي. |
| **Phase 4** | **اكتشاف صفحة سياسة الخصوصية بدقة** | تنفيذ محرك الزحف والاكتشاف الذكي للعثور على صفحات الخصوصية. |
| **Phase 5** | **التحليل الدلالي للبنود الثمانية + لوحة الخصوصية** | تحليل محتوى السياسات المكتشفة وتقييمها مقابل بنود المادة 12، وبناء لوحة مؤشرات الخصوصية. |
| **Phase 6** | **"لوحتي" (Canvas سحب/إفلات)** | بناء واجهة "لوحتي" القابلة للتخصيص بالكامل عبر سحب وإفلات الأعمدة والمؤشرات. |
| **Phase 7** | **لوحة الإدارة (تحكم كامل)** | تنفيذ لوحة إدارة شاملة تتيح التحكم في كل جوانب المنصة. |
| **Phase 8** | **راصد الذكي (AI) - تنفيذ كامل** | تفعيل قدرات راصد الذكي بشكل كامل ليكون واعياً بالسياق وقادراً على تنفيذ المهام. |

---

## 3. ما الذي سيتم استبعاده (خارج النطاق)

- **المصطلحات الأمنية والسيبرانية:** سيتم تجنب أي مصطلحات لا تنتمي مباشرة إلى عالم "حماية البيانات الشخصية" و PDPL. الأولوية للمصطلحات القانونية والتنظيمية للخصوصية.
- **البناء من الصفر:** المشروع الحالي هو الأساس، والعمل سيركز على الإصلاح، الاستكمال، التوثيق، والتحسين بناءً على الكود الموجود.
- **تغيير الهوية البصرية:** لن يتم استخدام أي خطوط أو ألوان أو شعارات تختلف عن هوية "راصد" المعتمدة وخط "Tajawal".
- **تجاهل مصدر الحقيقة (P0):** في حال وجود أي تعارض في المتطلبات بين الملفات، تعتبر ملفات P0 (البرومتات الرئيسية) هي المصدر المعتمد للحقيقة، وتُستخدم الملفات الأخرى كمرجع للتدقيق والإضافة فقط.

---

## 4. تعريف "تم الإنجاز" لكل مرحلة (Acceptance Criteria)

لكل مرحلة، لن يتم اعتبارها مكتملة إلا بعد تحقيق "دليل الإنجاز" المحدد لها في البرومت الرئيسي، والذي يمكن تلخيصه كالتالي:

| المرحلة | دليل الإنجاز (Definition of Done) |
| :--- | :--- |
| **Phase 1** | وجود رابط فعال لبيئة Staging، توثيق خطوات التشغيل المحلي، ووجود health endpoint يعمل. |
| **Phase 2** | لقطات شاشة للصفحات الرئيسية الأربع تظهر تطبيق الهوية و RTL والقوائم الصحيحة. |
| **Phase 3** | تقرير إحصائي من قاعدة البيانات يثبت استيراد البيانات، وصفحة تفاصيل موقع تعرض الصور الحالية والقديمة. |
| **Phase 4** | تقرير يوضح نتائج الاكتشاف على عينة من المواقع، مع سجل للمحاولات وصفحة لمراجعة النتائج. |
| **Phase 5** | تطابق الأرقام والنسب في لوحة الخصوصية مع استعلامات مباشرة من قاعدة البيانات، وعمل الـ Drill-down لكل عنصر. |
| **Phase 6** | فيديو أو لقطات شاشة توضح عملية بناء لوحة مؤشرات كاملة في "لوحتي" عبر السحب والإفلات، ثم حفظها واسترجاعها. |
| **Phase 7** | لقطات شاشة وسجلات تدقيق (audit logs) تثبت القدرة على التحكم الكامل في ميزات المنصة من لوحة الإدارة. |
| **Phase 8** | سيناريوهات اختبار موثقة تظهر قدرة "راصد الذكي" على فهم السياق، تقديم اقتراحات، تنفيذ مهام، وتوثيقها. |


---

**الخطوة التالية:** البدء في **Phase 1**، والتي تتضمن أولاً إصلاح المشاكل الثلاث التي تم تحديدها مسبقاً (مشكلة SSL/DNS، مشكلة ربط الدومين بالتطبيق الصحيح، ومشكلة خطأ JavaScript).

```

---

## `Dockerfile`

```
FROM node:20-slim AS base

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Force development mode during build so devDependencies are installed
ENV NODE_ENV=development

# Install dependencies (include patches for pnpm)
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild esbuild

# Copy source code
COPY . .

# Build client (vite) + server (esbuild)
RUN pnpm run build

# Production stage
FROM node:20-slim AS production
WORKDIR /app

# Copy built artifacts and production dependencies
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./package.json
COPY --from=base /app/shared ./shared
COPY --from=base /app/drizzle ./drizzle
COPY --from=base /app/client/public ./client/public
COPY --from=base /app/scripts ./scripts
RUN chmod +x ./scripts/startup.sh

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["bash", "./scripts/startup.sh"]

```

---

## `GAP_ANALYSIS.md`

```markdown
# Gap Analysis - Missing Features

## MISSING (Must Implement):

### 1. Chat Widget Input Field (RasidCharacterWidget.tsx)
- Widget has NO text input field - only buttons (محادثة جديدة, تحليل سريع, التقارير الذكية)
- Need: Add input field + send button + quick action buttons

### 2. Dual Platform System Prompt (rasidAI.ts)
- System prompt only mentions "رصد حالات رصد البيانات الشخصية" (monitoring only)
- Need: Update to mention BOTH platforms (monitoring + privacy/compliance)

### 3. Privacy Tools in RASID_TOOLS (rasidAI.ts)
- ZERO privacy tools defined (get_privacy_assessments, get_dsar_requests, etc.)
- Need: Add all 10 privacy tool definitions

### 4. Privacy Tool Execution Cases (rasidAI.ts executeTool)
- No case statements for privacy tools
- Need: Add case handlers for all 10 privacy tools

### 5. Privacy Data Functions (db.ts or new file)
- No privacy data functions exist
- Need: Add getPrivacyAssessments, getDsarRequests, etc.

### 6. FormattedAIResponse Component (SmartRasid.tsx)
- Uses Streamdown but no FormattedAIResponse with rich formatting
- Need: Add formatted response with colors, badges, icons

### 7. TTS / Voice (SmartRasid.tsx)
- No speechSynthesis or speak functionality
- Need: Add SpeakButton with Web Speech API

### 8. Welcome Message
- No welcome message on first load
- Need: Add smart welcome with user name + alerts

### 9. Avatar Animation Enhancement
- Basic bounce exists but no speaking/thinking states
- Need: Enhanced avatar animation states

## EXISTING (Already Implemented):
- Auto-scroll + Auto-focus ✅
- Streaming (SSE) ✅
- Conversation Save/History ✅
- Suggested Actions (followUpSuggestions) ✅
- Drillthrough Links ✅
- Audit Logging ✅
- Response Formatter ✅
- RAG Engine ✅
- Interactive Tutorial System ✅
- Export/Email System ✅
- Guardrails ✅
- Learning Engine ✅
- Performance Metrics ✅
- Circuit Breaker ✅
- Recommendation Engine ✅
- Smart Chart Engine ✅
- Chart Data Engine ✅
- Admin CMS ✅
- Admin Control Panel ✅
- Settings Router ✅
- Operations Router ✅
- Deep Scanner/Crawler ✅
- generate_report tool ✅
- Privacy pages (PrivacyDashboard, PrivacySites) ✅

```

---

## `NAV_INVENTORY_LEAKS.md`

```markdown
# جرد صفحات حالات الرصد (Monitoring Cases Inventory)

> تاريخ التحديث: 2026-02-18

## القائمة الجانبية — حالات الرصد

### المجموعة: لوحة حالات الرصد
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/national-overview` | لوحة حالات الرصد | نعم |

### المجموعة: الحالات
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/leaks` | سجل الحالات | نعم |
| `/incidents-registry` | سجل الحالات المتقدم | نعم |

### المجموعة: تحليل الحالات
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/leak-anatomy` | تشريح الحالات | نعم |
| `/sector-analysis` | القطاعات المتضررة | نعم |
| `/leak-timeline` | الخط الزمني | نعم |
| `/impact-assessment` | تحليل الأثر | نعم |
| `/geo-analysis` | التحليل الجغرافي | نعم |

### المجموعة: مصادر النشر
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/source-intelligence` | المصادر | نعم |
| `/threat-actors-analysis` | جهات النشر | نعم |
| `/seller-profiles` | ملفات المصادر | نعم |

### المجموعة: الرصد المباشر
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/live-scan` | الرصد المباشر | نعم |
| `/telegram` | رصد المنصات | نعم |
| `/darkweb` | مواقع النشر | نعم |
| `/paste-sites` | مواقع اللصق | نعم |

### المجموعة: أدوات الرصد
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/osint-tools` | أدوات البحث | نعم |
| `/threat-rules` | قواعد الرصد | نعم |
| `/knowledge-graph` | رسم المعرفة | نعم |
| `/threat-map` | خريطة الرصد | نعم |

### المجموعة: الامتثال والتقارير
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/executive-brief` | التقارير التنفيذية | نعم |
| `/incident-compare` | المقارنة | نعم |
| `/campaign-tracker` | الحملات | نعم |
| `/recommendations-hub` | التوصيات | نعم |
| `/pdpl-compliance` | الامتثال PDPL | نعم |
| `/report-approval` | المصادقة على التقارير | نعم |

### المجموعة: تحليل البيانات
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/pii-atlas` | أطلس البيانات الشخصية | نعم |
| `/pii-classifier` | مختبر الأنماط | نعم |
| `/evidence-chain` | عدسة الأثر والحقوق | نعم |
| `/feedback-accuracy` | الاتجاهات والمقارنات | نعم |

## المسارات غير المعروضة بالقائمة (لكنها تعمل)
| المسار | الصفحة/الوظيفة | ملاحظة |
|--------|----------------|--------|
| `/app/incidents` | عرض حالات الرصد (App) | مسار بديل |
| `/app/incidents/:incidentId` | تفاصيل حالة الرصد | يفتح من الجدول |
| `/app/incidents/list` | قائمة حالات الرصد | مسار بديل |
| `/scan-execution/:jobId` | تنفيذ الفحص | يفتح من المهام |

```

---

## `NAV_INVENTORY_PRIVACY.md`

```markdown
# جرد صفحات الخصوصية (Privacy Inventory)

> تاريخ التحديث: 2026-02-18

## القائمة الجانبية — الخصوصية

### المجموعة: لوحة الخصوصية
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/leadership` | لوحة الخصوصية | نعم |

### المجموعة: المواقع
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/sites` | المواقع | نعم |
| `/change-detection` | رصد التغييرات | نعم |

### المجموعة: البنود الثمانية (المادة 12)
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/clauses` | البنود الثمانية | نعم |

### المجموعة: الاستيراد والفحص
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/scan` | الفحص | نعم |
| `/batch-scan` | الفحص الجماعي | نعم |
| `/advanced-scan` | الفحص المتقدم | نعم |
| `/deep-scan` | الفحص العميق | نعم |
| `/live-scan` | الفحص المباشر | نعم |
| `/scan-library` | مكتبة الفحوصات | نعم |
| `/scan-schedules` | جدولة الفحوصات | نعم |

### المجموعة: السجل
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/scan-history` | سجل الفحوصات | نعم |

### المجموعة: التحليلات والمقارنات
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/compliance-comparison` | مقارنة الامتثال | نعم |
| `/compliance-heatmap` | خريطة الامتثال | نعم |
| `/advanced-analytics` | التحليلات المتقدمة | نعم |
| `/kpi-dashboard` | لوحة المؤشرات | نعم |
| `/time-comparison` | المقارنة الزمنية | نعم |
| `/sector-comparison` | مقارنة القطاعات | نعم |
| `/interactive-comparison` | المقارنة التفاعلية | نعم |
| `/strategy-coverage` | تغطية الاستراتيجية | نعم |
| `/real-time` | اللوحة الحية | نعم |

### المجموعة: التقارير المتخصصة
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/custom-reports` | التقارير المخصصة | نعم |
| `/scheduled-reports` | التقارير المجدولة | نعم |
| `/pdf-reports` | تقارير PDF | نعم |
| `/executive-report` | التقرير التنفيذي | نعم |
| `/letters` | الخطابات | نعم |

### المجموعة: أدوات إضافية
| المسار | الصفحة/الوظيفة | يظهر بالقائمة؟ |
|--------|----------------|----------------|
| `/improvement-tracker` | متتبع التحسين | نعم |
| `/export-data` | تصدير البيانات | نعم |
| `/presentation` | وضع العرض | نعم |
| `/presentation-builder` | منشئ العروض | نعم |
| `/bulk-analysis` | التحليل الجماعي | نعم |
| `/advanced-search` | البحث المتقدم | نعم |
| `/smart-alerts` | التنبيهات الذكية | نعم |
| `/visual-alerts` | التنبيهات المرئية | نعم |
| `/email-notifications` | إشعارات البريد | نعم |
| `/email-management` | إدارة البريد | نعم |
| `/message-templates` | قوالب الرسائل | نعم |
| `/escalation` | قواعد التصعيد | نعم |
| `/mobile-apps` | التطبيقات | نعم |

## المسارات غير المعروضة بالقائمة (لكنها تعمل)
| المسار | الصفحة/الوظيفة | ملاحظة |
|--------|----------------|--------|
| `/sites/:id` | تفاصيل الموقع | يفتح من جدول المواقع |
| `/clauses/:num` | تفاصيل البند | يفتح من جدول البنود |
| `/app/privacy` | عرض الخصوصية (App) | مسار بديل |
| `/app/privacy/sites` | مواقع الخصوصية (App) | مسار بديل |
| `/app/privacy/sites/:siteId` | تفاصيل موقع (App) | مسار بديل |

```

---

## `NAV_MAPPING.md`

```markdown
# خريطة الصفحات والتصنيف (NAV_MAPPING)

## تصنيف الصفحات

### A) مشتركة (تظهر في المنصتين - القسم الثابت)

| المسار | الاسم الجديد | المجموعة |
|--------|-------------|----------|
| `/` | الرئيسية | الرئيسية |
| `/my-custom-dashboard` | لوحتي | لوحتي |
| `/cases` | المتابعات | المتابعات |
| `/reports` | التقارير | التقارير |
| `/smart-rasid` | راصد الذكي | راصد الذكي |
| `/verify/:code?` | التوثيق والتحقق (QR) | التوثيق والتحقق |
| `/documents-registry` | سجل التوثيقات | التوثيق والتحقق |
| `/document-stats` | إحصائيات التوثيق | التوثيق والتحقق |
| `/admin` | الإدارة | الإدارة |
| `/admin/roles` | الأدوار والصلاحيات | الإدارة |
| `/admin/groups` | المجموعات | الإدارة |
| `/admin/feature-flags` | مفاتيح الميزات | الإدارة |
| `/admin/theme` | إعدادات المظهر | الإدارة |
| `/admin/menus` | إدارة القوائم | الإدارة |
| `/admin/audit-log` | سجل تدقيق الإدارة | الإدارة |
| `/notifications` | الإشعارات | مشترك |
| `/activity-logs` | سجل النشاط | مشترك |
| `/profile` | الملف الشخصي | مشترك |
| `/change-password` | تغيير كلمة المرور | مشترك |
| `/members` | الأعضاء | مشترك |
| `/settings` | الإعدادات | مشترك |
| `/user-management` | إدارة المستخدمين | الإدارة |

### B) خاصة بالخصوصية

| المسار | الاسم الجديد | المجموعة الجديدة |
|--------|-------------|-----------------|
| `/leadership` | لوحة الخصوصية | لوحة الخصوصية |
| `/sites` | المواقع | المواقع |
| `/sites/:id` | تفاصيل الموقع | المواقع |
| `/change-detection` | التغييرات | التغييرات |
| `/clauses` | البنود الثمانية (المادة 12) | البنود |
| `/clauses/:num` | تفاصيل البند | البنود |
| `/scan` | الفحص | الاستيراد |
| `/batch-scan` | الفحص الجماعي | الاستيراد |
| `/scan-history` | السجل | السجل |

**أدوات إضافية (خصوصية):**

| المسار | الاسم | ملاحظة |
|--------|-------|--------|
| `/scan-library` | مكتبة الفحوصات | أدوات إضافية |
| `/scan-schedules` | جدولة الفحوصات | أدوات إضافية |
| `/advanced-scan` | الفحص المتقدم | أدوات إضافية |
| `/deep-scan` | الفحص العميق | أدوات إضافية |
| `/compliance-comparison` | مقارنة الامتثال | أدوات إضافية |
| `/compliance-heatmap` | خريطة الامتثال | أدوات إضافية |
| `/advanced-analytics` | التحليلات المتقدمة | أدوات إضافية |
| `/kpi-dashboard` | لوحة المؤشرات | أدوات إضافية |
| `/time-comparison` | المقارنة الزمنية | أدوات إضافية |
| `/sector-comparison` | مقارنة القطاعات | أدوات إضافية |
| `/interactive-comparison` | المقارنة التفاعلية | أدوات إضافية |
| `/strategy-coverage` | تغطية الاستراتيجية | أدوات إضافية |
| `/real-time` | اللوحة الحية | أدوات إضافية |
| `/custom-reports` | التقارير المخصصة | أدوات إضافية |
| `/scheduled-reports` | التقارير المجدولة | أدوات إضافية |
| `/pdf-reports` | تقارير PDF | أدوات إضافية |
| `/executive-report` | التقرير التنفيذي | أدوات إضافية |
| `/letters` | الخطابات | أدوات إضافية |
| `/improvement-tracker` | متتبع التحسين | أدوات إضافية |
| `/export-data` | تصدير البيانات | أدوات إضافية |
| `/presentation` | وضع العرض | أدوات إضافية |
| `/presentation-builder` | منشئ العروض | أدوات إضافية |
| `/bulk-analysis` | التحليل الجماعي | أدوات إضافية |
| `/advanced-search` | البحث المتقدم | أدوات إضافية |
| `/smart-alerts` | التنبيهات الذكية | أدوات إضافية |
| `/visual-alerts` | التنبيهات المرئية | أدوات إضافية |
| `/email-notifications` | إشعارات البريد | أدوات إضافية |
| `/email-management` | إدارة البريد | أدوات إضافية |
| `/message-templates` | قوالب الرسائل | أدوات إضافية |
| `/escalation` | قواعد التصعيد | أدوات إضافية |
| `/mobile-apps` | التطبيقات | أدوات إضافية |

### C) خاصة بحالات الرصد

| المسار | الاسم الجديد | المجموعة الجديدة |
|--------|-------------|-----------------|
| `/national-overview` | لوحة حالات الرصد | لوحة حالات الرصد |
| `/leaks` | الحالات | الحالات |
| `/incidents-registry` | سجل الحالات | الحالات |
| `/leak-anatomy` | تحليل الحالات | تحليل الحالات |
| `/source-intelligence` | مصادر النشر | مصادر النشر |
| `/scan-history` | السجل | السجل |

**أدوات إضافية (حالات رصد):**

| المسار | الاسم | ملاحظة |
|--------|-------|--------|
| `/sector-analysis` | القطاعات المتضررة | أدوات إضافية |
| `/leak-timeline` | الخط الزمني | أدوات إضافية |
| `/threat-actors-analysis` | جهات النشر | أدوات إضافية |
| `/impact-assessment` | تحليل الأثر | أدوات إضافية |
| `/geo-analysis` | التحليل الجغرافي | أدوات إضافية |
| `/executive-brief` | التقارير التنفيذية | أدوات إضافية |
| `/incident-compare` | المقارنة | أدوات إضافية |
| `/campaign-tracker` | الحملات | أدوات إضافية |
| `/recommendations-hub` | التوصيات | أدوات إضافية |
| `/pdpl-compliance` | الامتثال PDPL | أدوات إضافية |
| `/pii-atlas` | أطلس البيانات الشخصية | أدوات إضافية |
| `/pii-classifier` | مختبر الأنماط | أدوات إضافية |
| `/evidence-chain` | عدسة الأثر والحقوق | أدوات إضافية |
| `/feedback-accuracy` | الاتجاهات والمقارنات | أدوات إضافية |
| `/report-approval` | المصادقة على التقارير | أدوات إضافية |
| `/live-scan` | الرصد المباشر | أدوات إضافية |
| `/telegram` | رصد المنصات | أدوات إضافية |
| `/darkweb` | مواقع النشر | أدوات إضافية |
| `/paste-sites` | مواقع اللصق | أدوات إضافية |
| `/osint-tools` | أدوات البحث | أدوات إضافية |
| `/threat-rules` | قواعد الرصد | أدوات إضافية |
| `/knowledge-graph` | رسم المعرفة | أدوات إضافية |
| `/threat-map` | خريطة الرصد | أدوات إضافية |
| `/seller-profiles` | ملفات المصادر | أدوات إضافية |

### D) صفحات إدارية/نظامية (تظهر فقط في الإدارة)

| المسار | الاسم | ملاحظة |
|--------|-------|--------|
| `/super-admin` | المشرف العام | إدارة فقط |
| `/admin-panel` | لوحة الإدارة | إدارة فقط |
| `/system-health` | صحة النظام | إدارة فقط |
| `/api-keys` | مفاتيح API | إدارة فقط |
| `/data-retention` | الاحتفاظ بالبيانات | إدارة فقط |
| `/audit-log` | سجل التدقيق | إدارة فقط |
| `/monitoring-jobs` | مهام الرصد | إدارة فقط |
| `/alert-channels` | قنوات التنبيه | إدارة فقط |
| `/usage-analytics` | تحليلات الاستخدام | إدارة فقط |
| `/scenario-management` | إدارة السيناريوهات | إدارة فقط |
| `/ai-management` | إدارة الذكاء الاصطناعي | إدارة فقط |
| `/knowledge-base` | قاعدة المعرفة | إدارة فقط |
| `/personality-scenarios` | سيناريوهات الشخصية | إدارة فقط |
| `/training-center` | مركز التدريب | إدارة فقط |

---

## سياسة عدم فقد الصفحات

جميع المسارات القديمة تبقى تعمل. لم يتم حذف أي مسار. الصفحات التي لا تظهر في القائمة الرئيسية الجديدة توضع ضمن:
1. مجموعة "أدوات إضافية" (مغلقة افتراضياً) في كل workspace
2. صفحة "خريطة الصفحات" في الإدارة

```

---

## `README.md`

```markdown
# Rasid National Platform

منصة **Rasid National Platform** هي منصة رقابية وتحليلية لإدارة مسوحات رقمية، تتبّع الأدلة، إعداد تقارير تنفيذية، وإتاحة تحليلات متقدمة لصناع القرار.

## نظرة عامة
- الواجهة الأمامية: React + Vite + TypeScript.
- الواجهة الخلفية: Node.js + Express + tRPC.
- قاعدة البيانات: MySQL عبر Drizzle ORM.
- الاستخدامات: إدارة المسوحات، التحليلات، لوحات المؤشرات، التصدير إلى PDF/Excel، ومساعد ذكي.

## المتطلبات
- Node.js 20+
- npm أو pnpm
- MySQL 8+
- ملف إعداد بيئة `.env`

## التشغيل المحلي
```bash
npm install
npm run dev
```

## البناء والتشغيل الإنتاجي
```bash
npm run build
npm run start
```

## الفحص والاختبار
```bash
npm run check
npm run test
```

## بنية المشروع
- `client/`: تطبيق الواجهة الأمامية.
- `server/`: خدمات API ومنطق الأعمال.
- `drizzle/`: مخططات قاعدة البيانات وملفات الترحيل.
- `docs/`: جميع المستندات الرسمية للمشروع.

## المستندات
تم إضافة حزمة مستندات كاملة في مجلد `docs/` تغطي التحليل، التصميم، التكامل، الاختبار، إدارة المشروع، التشغيل، والوثائق الأساسية.

### مستندات المنصات التفصيلية
- `docs/core/PRIVACY_PLATFORM_STRUCTURE.md`: الهيكل الوظيفي والتقني لمنصة الخصوصية.
- `docs/core/LEAKAGE_MONITORING_PLATFORM_STRUCTURE.md`: الهيكل الوظيفي والتقني لمنصة رصد حالات التسريب.
- `docs/core/PLATFORM_PAGE_FUNCTIONS_MATRIX.md`: وظائف كل صفحة في كل منصة بشكل مصفوفة واضحة.

```

---

## `WORK_NOTES.md`

```markdown
# Work Notes

## Dual Platform (rasidAI.ts + db.ts)
- [x] buildSystemPrompt updated (already done)
- [ ] Add 10 privacy tools to RASID_TOOLS array (before line 959 ];)
- [ ] Add 10 executeTool cases (in executeTool function around line 965)
- [ ] Add getPDPLArticleInfo function at end of rasidAI.ts
- [ ] Add agentMap entries for new tools
- [ ] Add 8 privacy functions to db.ts

## UX Overhaul (SmartRasid.tsx)
- [ ] Chat widget: add input field
- [ ] Auto-scroll + auto-focus after messages
- [ ] FormattedAIResponse component
- [ ] Report download links in formatted responses
- [ ] StatsCards component
- [ ] SpeakButton (TTS)
- [ ] RasidAvatar animation
- [ ] Welcome message

```

---

## `asset-urls.md`

```markdown
# Rasid Brand Asset CDN URLs

## Logos
- Rased(6) - Full logo with text (gold/cream): https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/eAXbruiTdhpCTGaH.png
- Rased(5) - Calligraphy only (gold outline): https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/rlTszMWitrWjHXqY.png
- Rased(7) - Calligraphy only (cream/light): https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/rSKUhWaEVHeEqaoq.png
- Rased(1)(1) - Full logo dark text: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/ANUzRqkxgngNoNDu.png
- Rased(1) - Full logo dark text v2: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/lQwuunEiQqivDwSn.png
- Rased(4)(1) - Calligraphy dark: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/sXcwTvWShiiGWaTj.png
- Rased(4) - Calligraphy dark v2: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/amREUfZVdKbfNAan.png
- Rased(2)(1) - Calligraphy navy+gold: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/XFxdFtqYgOWxcrWZ.png
- Rased(3)(1) - Full logo navy+gold: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/WUSUGpXFerAYincR.png
- Rased(3) - Full logo navy+gold v2: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/JpPQRgdjxpZQfyzd.png

## Characters (Smart Rasid mascot)
- Character 1 - Waving: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/bplMgZcUFrzRMDas.png
- Character 2 - Shmagh: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/tlOPkBOhjVSKDeWE.png
- Character 3 - Hands on hips (1): https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/ESspIUObdZrnPBmv.png
- Character 3 - Hands on hips (2): https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/XMrdLqxIzjGWkRSX.png
- Character 4 - Sunglasses: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/KENRCGYjPbTblPqw.png
- Character 5 - Arms crossed shmagh: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/DglLYYWytLennlcO.png
- Character 6 - Standing shmagh: https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/DUxQSCKgtZeiqTpw.png

```

---

## `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "css": "client/src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}

```

---

## `current-state.md`

```markdown
# Current State - Login Page Working

- Login page shows with local auth (username/password)
- Rasid character on right side
- Gold Rasid logo visible
- Dark blue background
- Need to fix: background more royal blue, logo animation, character image

## Server Status
- Running on port 3000
- 994 TS errors (mostly from merged code - need cleanup)
- Server starts and responds correctly

## Next Steps
1. Fix background to royal dark blue
2. Add logo animation
3. Fix Rasid character image (currently shows blank paper)
4. Apply all user requested changes

```

---

## `design-notes.md`

```markdown
# Design Notes

## Landing Page Status
- Dark navy background with gold accents - working correctly
- Rasid character mascot displayed on left side
- Arabic RTL layout with Tajawal font - working
- "منصة راصد الوطنية" title in gold
- Two CTAs: "الدخول للمنصة" (gold) and "التحقق من وثيقة" (outline)
- Smart Rasid FAB button visible in bottom-left corner (gold circle with bot icon)
- "مساحات العمل" section visible below fold

## Server Status
- 0 TypeScript errors
- Server running on port 3000
- No console errors after restart
- All 42 database tables created

## Remaining Work
- Seed user data
- Write tests
- Polish remaining pages
- Ensure all navigation works

```

---

## `drizzle.config.ts`

```typescript
import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});

```

---

## `notes_images.md`

```markdown
# ملاحظات الصور المرفقة

## صور تصميم نافذة تفاصيل الرصد (4 صور)
- pasted_file_L4PFvx: نافذة تفاصيل حالة رصد - تبويبات (نظرة عامة، البيانات المسربة، تحليل AI، المصادر والأدلة) - تصميم بطاقات مع خريطة وتوزيع جغرافي
- pasted_file_Jy4weV: تبويب البيانات المسربة - جدول عينات البيانات مع حقول مقنعة + أنواع البيانات المسربة
- pasted_file_K8pvRm: تبويب تحليل AI - ملخص تنفيذي + تقييم الأثر + توصيات + تحليل PDPL
- pasted_file_oQ5NDH: تبويب المصادر والأدلة - قائمة المصادر + صور الأدلة

## الشعارات الرسمية (7 نسخ)
- Rased(1)_transparent.png, Rased(1)_transparent(1).png
- Rased(2)_transparent(1).png
- Rased(3)_transparent.png, Rased(3)_transparent(1).png
- Rased(4)_transparent.png, Rased(4)_transparent(1).png
- Rased(5)_transparent.png
- Rased(6)_transparent.png
- Rased(7)_transparent.png

## الشخصيات الرسمية (6 شخصيات)
- Character_1_waving_transparent.png - شخصية تلوح
- Character_2_shmagh_transparent.png - شخصية بشماغ
- Character_3_dark_bg_transparent.png, Character_3_dark_bg_transparent(1).png - خلفية داكنة
- Character_4_sunglasses_transparent.png - نظارات شمسية
- Character_5_arms_crossed_shmagh_transparent.png - أذرع متقاطعة بشماغ
- Character_6_standing_shmagh_transparent.png - واقف بشماغ

## ملاحظة المستخدم
- المسميات في صور التصميم غير صحيحة - الصحيحة هي المنفذة حالياً في المنصة
- يجب استخدام الشعار الرسمي في كل الصفحات والتقارير

```

---

## `package.json`

```json
{
  "name": "rasid-national-platform",
  "version": "1.0.0",
  "type": "module",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/_core/index.ts",
    "build": "vite build && esbuild server/_core/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc --noEmit",
    "format": "prettier --write .",
    "test": "vitest run",
    "db:push": "drizzle-kit generate && drizzle-kit migrate"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.693.0",
    "@aws-sdk/s3-request-presigner": "^3.693.0",
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-accordion": "^1.2.12",
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-aspect-ratio": "^1.1.7",
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-collapsible": "^1.1.12",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-hover-card": "^1.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-menubar": "^1.1.16",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-radio-group": "^1.3.8",
    "@radix-ui/react-scroll-area": "^1.2.10",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slider": "^1.3.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.6",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-toggle": "^1.1.10",
    "@radix-ui/react-toggle-group": "^1.1.11",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tanstack/react-query": "^5.90.2",
    "@trpc/client": "^11.6.0",
    "@trpc/react-query": "^11.6.0",
    "@trpc/server": "^11.6.0",
    "@types/bcryptjs": "^3.0.0",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node-cron": "^3.0.11",
    "@types/qrcode": "^1.5.6",
    "@types/ws": "^8.18.1",
    "adm-zip": "^0.5.16",
    "archiver": "^7.0.1",
    "axios": "^1.12.0",
    "bcryptjs": "^3.0.3",
    "chart.js": "^4.5.1",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "cmdk": "^1.1.1",
    "cookie": "^1.0.2",
    "csv-parser": "^3.2.0",
    "date-fns": "^4.1.0",
    "dotenv": "^17.2.2",
    "drizzle-orm": "^0.44.5",
    "embla-carousel-react": "^8.6.0",
    "exceljs": "^4.4.0",
    "express": "^4.21.2",
    "framer-motion": "^12.23.22",
    "html-to-image": "^1.11.13",
    "html2canvas": "^1.4.1",
    "html2canvas-pro": "^1.6.7",
    "input-otp": "^1.4.2",
    "jose": "6.1.0",
    "jsonwebtoken": "^9.0.3",
    "jspdf": "^4.1.0",
    "jspdf-autotable": "^5.0.7",
    "jsqr": "^1.4.0",
    "lucide-react": "^0.453.0",
    "multer": "^2.0.2",
    "mysql2": "^3.15.0",
    "nanoid": "^5.1.5",
    "next-themes": "^0.4.6",
    "node-cron": "^4.2.1",
    "nodemailer": "^8.0.1",
    "pdfjs-dist": "^5.4.624",
    "pptxgenjs": "^4.0.1",
    "qrcode": "^1.5.4",
    "react": "^19.2.1",
    "react-countup": "^6.5.3",
    "react-day-picker": "^9.11.1",
    "react-dom": "^19.2.1",
    "react-hook-form": "^7.64.0",
    "react-resizable-panels": "^3.0.6",
    "recharts": "^2.15.4",
    "socket.io-client": "^4.8.3",
    "sonner": "^2.0.7",
    "streamdown": "^1.6.11",
    "superjson": "^1.13.3",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "vaul": "^1.1.2",
    "wouter": "^3.3.5",
    "ws": "^8.19.0",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "@builder.io/vite-plugin-jsx-loc": "^0.1.1",
    "@tailwindcss/typography": "^0.5.15",
    "@tailwindcss/vite": "^4.1.3",
    "@types/adm-zip": "^0.5.7",
    "@types/archiver": "^7.0.0",
    "@types/express": "4.17.21",
    "@types/google.maps": "^3.58.1",
    "@types/multer": "^2.0.0",
    "@types/node": "^24.7.0",
    "@types/react": "^19.2.1",
    "@types/react-dom": "^19.2.1",
    "@vitejs/plugin-react": "^5.0.4",
    "add": "^2.0.6",
    "autoprefixer": "^10.4.20",
    "drizzle-kit": "^0.31.4",
    "esbuild": "^0.25.0",
    "pnpm": "^10.15.1",
    "postcss": "^8.4.47",
    "prettier": "^3.6.2",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.19.1",
    "tw-animate-css": "^1.4.0",
    "typescript": "5.9.3",
    "vite": "^7.1.7",
    "vite-plugin-manus-runtime": "^0.0.57",
    "vitest": "^2.1.4"
  },
  "packageManager": "pnpm@10.4.1+sha512.c753b6c3ad7afa13af388fa6d808035a008e30ea9993f58c6663e2bc5ff21679aa834db094987129aa4d488b86df57f7b634981b2f827cdcacc698cc0cfb88af",
  "pnpm": {
    "patchedDependencies": {
      "wouter@3.7.1": "patches/wouter@3.7.1.patch"
    },
    "overrides": {
      "tailwindcss>nanoid": "3.3.7"
    }
  }
}

```

---

## `railway.toml`

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "bash ./scripts/startup.sh"
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

```

---

## `seed-users.md`

```markdown
# Platform Users

## Domain: alruhaily.app

| User ID | Name | DisplayName | Email | Role |
|---------|------|-------------|-------|------|
| MRUHAILY | Muhammed ALRuhaily | Admin Rasid System | prog.muhammed@gmail.com | superadmin |
| aalrebdi | Alrebdi Fahad Alrebdi | NDMO's president/director | aalrebdi@ndmo.gov.sa | admin |
| msarhan | Mashal Abdullah Alsarhan | Vice President of NDMO | msarhan@nic.gov.sa | admin |
| malmoutaz | Manal Mohammed Almoutaz | Manager of Smart Rasid Platform | malmoutaz@ndmo.gov.sa | admin |

```

---

## `todo.md`

```markdown
# Project TODO - Rasid National Platform

## Phase 1: Database & Backend
- [x] Create merged database schema (42 tables from both platforms)
- [x] Create database helper functions (db.ts)
- [x] Create tRPC routers with all procedures
- [x] Push database migrations
- [x] Seed user accounts (4 admin/superadmin users)
- [x] Seed glossary terms (10 terms)
- [x] Seed page descriptors (9 pages)

## Phase 2: Theme & Layout
- [x] Set up dark theme (Quantum Leap Navy/Gold)
- [x] Configure RTL + Tajawal font
- [x] Build AppLayout with 7 workspaces sidebar
- [x] Upload and integrate brand assets (logos + characters)
- [x] Custom scrollbar, glass-card, stat-card utilities
- [x] Page background with radial gradients

## Phase 3: Main Dashboards
- [x] Overview Dashboard (combined privacy + incidents + followups)
- [x] Privacy Compliance Dashboard with drill-down
- [x] Incidents Dashboard with drill-down
- [x] My Dashboard (customizable layout)

## Phase 4: Detail Pages
- [x] Privacy Sites list page
- [x] Privacy Site detail page with tabs
- [x] Incidents list page
- [x] Incident detail page with tabs
- [x] Follow-ups list page
- [x] Reports list page

## Phase 5: Admin Panel
- [x] Users management page
- [x] Platform settings page

## Phase 6: Smart Rasid AI
- [x] AI chat full page (/app/smart-rasid)
- [x] Floating AI assistant (FAB) on all pages
- [x] Context-aware suggestions per route
- [x] LLM integration with platform data
- [x] Conversation history management
- [x] Page context awareness
- [x] Professional Arabic language responses

## Phase 7: Supporting Features
- [x] QR verification system (public page)
- [x] Notifications system (unread count + list)
- [x] Public landing page with brand assets

## Phase 8: Testing & Polish
- [x] Write Vitest tests (20 tests passing)
- [x] Verify all routes work
- [x] Check RTL consistency
- [x] 0 TypeScript errors
- [x] Save checkpoint

## Phase 9 - ACTUAL MERGE from Existing Platforms (Priority)
- [x] Copy schema.ts from Platform 1 (1108 lines - the complete one)
- [x] Merge unique tables from Platform 2 schema into merged schema (39 unique tables added, total 1710 lines)
- [x] Copy db.ts from Platform 1 (5843 lines) and merge Platform 2 db.ts (94 unique functions added, total 6868 lines)
- [x] Copy routers.ts from Platform 1 (7431 lines) and merge Platform 2 routers.ts (25 unique routers added, total 8749 lines)
- [ ] Copy all 69 pages from Platform 1
- [ ] Copy unique pages from Platform 2 (52 pages, merge non-duplicates)
- [ ] Copy all 30+ components from Platform 1
- [ ] Copy unique components from Platform 2
- [ ] Copy index.css theme from Platform 1 (royal blue dark theme)
- [ ] Copy App.tsx routes and navigation from Platform 1
- [ ] Merge Platform 2 unique routes into App.tsx
- [ ] Fix all imports and paths after merge
- [ ] Apply local auth system (already exists in both platforms)
- [ ] Verify royal blue background (not black)
- [ ] Use Rasid character for Smart AI icon
- [ ] Professional logo animation
- [ ] Article 12 compliance with 8 clauses evaluation
- [ ] Dashboard with dual indicator groups (general + 8 clauses)
- [ ] Import 24,983 Saudi domains from CSV
- [ ] Verify all features work end-to-end
- [ ] Write/update tests
- [ ] Save checkpoint

## Phase 10 - Apply Platform 2 Design (User Request)
- [ ] Review Platform 2 CSS theme and design (the correct design)
- [ ] Copy Platform 2 index.css theme to merged platform
- [ ] Apply Platform 2 design patterns to layout/navigation
- [ ] Fix all build errors (missing packages, imports)
- [ ] Save checkpoint with working build

## Phase 11 - GitHub & Auth Fix
- [x] Create private GitHub repo (raneemndmo-collab/rasid-national-platform)
- [x] Push all code to GitHub
- [x] Fix getLoginUrl to redirect to /login (local) instead of Manus OAuth
- [x] Fix AppLayout.tsx OAuth redirect to use /login
- [ ] Save checkpoint with working build

## Phase 12 - Fix DB Errors (Missing Columns)
- [x] Add missing columns to sites table (domain, siteName, sectorType, classification, siteStatus, etc.)
- [x] Add 'link' column to notifications table
- [x] Add missing columns to scheduled_reports table
- [x] Update migration journal
- [x] Verify all dashboard queries work (stats, clauseStats, sectorCompliance, etc.)
- [x] Verify no new errors after server restart
- [ ] Save checkpoint

## Phase 13 - Fix Merged Platform Errors & Push to New Repo
- [x] Add tinyint, bigint, boolean imports to schema.ts
- [x] Add alertRules table to schema.ts
- [x] Add all type exports for 104+ tables in schema.ts
- [x] Fix db.ts imports to include all P1 tables
- [x] Create 10 stub server modules (scheduler, enrichment, retention, etc.)
- [x] Copy adminRouter.ts, adminDb.ts, permissionEngine.ts, adminSeed.ts from P1
- [x] Add missing imports and top-level routers to routers.ts
- [x] Add missing ai sub-procedures (messages, suggestions, createConversation, sendMessage)
- [x] Add missing alerts sub-routers (contacts, rules, history, stats)
- [x] Fix notifications.list for unauthenticated users
- [x] Create alert_rules table in database
- [x] Server running cleanly - zero runtime errors
- [x] Push to new GitHub repo (raneemndmo-collab/rasid)
- [x] Save checkpoint

```

---

## `tsconfig.json`

```json
{
  "include": ["client/src/**/*", "shared/**/*", "server/**/*"],
  "exclude": ["node_modules", "build", "dist", "**/*.test.ts"],
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./node_modules/typescript/tsbuildinfo",
    "noEmit": true,
    "module": "ESNext",
    "target": "ES2022",
    "strict": true,
    "lib": ["esnext", "dom", "dom.iterable"],
    "jsx": "preserve",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "types": ["node", "vite/client"],
    "paths": {
      "@/*": ["./client/src/*"],
      "@shared/*": ["./shared/*"]
    }
  }
}

```

---

## `vite.config.ts`

```typescript
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

```

---

## `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

const templateRoot = path.resolve(import.meta.dirname);

export default defineConfig({
  root: templateRoot,
  resolve: {
    alias: {
      "@": path.resolve(templateRoot, "client", "src"),
      "@shared": path.resolve(templateRoot, "shared"),
      "@assets": path.resolve(templateRoot, "attached_assets"),
    },
  },
  test: {
    environment: "node",
    include: ["server/**/*.test.ts", "server/**/*.spec.ts"],
  },
});

```

---

