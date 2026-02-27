# rasid-leaks - root

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

## `ARCHITECTURE.md`

```markdown
# هيكلة المنصة المدموجة — الفصل التام بين الحالات والخصوصية

---

## 1. المشكلة الحالية

### الهيكل الحالي (rasid-leaks) — كل شيء مختلط في ملفات ضخمة

```
rasid-leaks/                         ❌ المشكلة: كل شيء في ملف واحد
├── client/src/
│   ├── pages/                       ← 99 صفحة مسطّحة بدون تصنيف
│   │   ├── Home.tsx
│   │   ├── Leaks.tsx                ← حالة رصدات
│   │   ├── TelegramMonitor.tsx      ← حالة رصدات
│   │   ├── Dashboard.tsx            ← خصوصية (فحص المواقع)
│   │   ├── LiveScan.tsx             ← خصوصية (فحص مواقع)
│   │   ├── Cases.tsx                ← مشترك
│   │   ├── Reports.tsx              ← مشترك
│   │   ├── AdminPanel.tsx           ← إدارة
│   │   └── ... 90 ملف آخر مختلط
│   │
│   ├── components/                  ← 84 مكون بدون تصنيف
│   ├── contexts/                    ← 5 سياقات (لا يوجد WorkspaceContext)
│   └── hooks/                       ← 19 خطاف
│
├── server/
│   ├── routers.ts                   ← ❌ 10,308 سطر! كل الـ API في ملف واحد
│   ├── db.ts                        ← ❌ 7,366 سطر! كل عمليات DB في ملف واحد
│   ├── adminRouter.ts               ← ملف منفصل (جيد)
│   ├── cmsRouter.ts                 ← ملف منفصل (جيد)
│   ├── deepScanner.ts               ← خصوصية
│   ├── scanEngine.ts                ← خصوصية
│   ├── scanWorker.ts                ← خصوصية
│   ├── rasidAI.ts                   ← مشترك (يدعم المجالين)
│   └── ... 42 ملف آخر مختلط
│
└── drizzle/
    └── schema.ts                    ← ❌ 3,186 سطر! كل الجداول مخلوطة
```

**المشاكل:**
1. `routers.ts` = 10,308 سطر — مستحيل الصيانة
2. `db.ts` = 7,366 سطر — مستحيل الصيانة
3. لا فصل بين وظائف الحالات والخصوصية
4. لا يوجد `WorkspaceContext` — المستخدم دائماً في مساحة "leaks"
5. لا يوجد حارس مساحة عمل — أي مستخدم يصل لأي صفحة

---

## 2. الهيكل الجديد — ثلاث طبقات منفصلة تماماً

```
                    ┌─────────────────────────────────────────┐
                    │          نقطة الدخول الموحّدة            │
                    │        App.tsx + Login.tsx               │
                    │   (اختيار مساحة العمل عند الدخول)         │
                    └────────────────┬────────────────────────┘
                                     │
                    ┌────────────────┼────────────────────────┐
                    │                │                        │
           ┌────────▼──────┐  ┌─────▼──────┐  ┌─────────────▼──────┐
           │   مجال         │  │  النواة     │  │   مجال              │
           │  الحالات     │  │  المشتركة   │  │  الخصوصية           │
           │  /leaks/*      │  │  الجذر /    │  │  /privacy/*         │
           │                │  │             │  │                     │
           │ 🔴 لا يرى     │  │ ✅ يراه     │  │ 🔴 لا يرى           │
           │ صفحات         │  │ الجميع      │  │ صفحات               │
           │ الخصوصية       │  │             │  │ الحالات            │
           └───────────────┘  └─────────────┘  └─────────────────────┘
```

### 2.1 هيكلة المجلدات الجديدة

```
rasid-unified/
│
├── client/src/
│   │
│   ├── App.tsx                      ← نقطة الدخول: التوجيه الرئيسي
│   ├── main.tsx
│   │
│   │  ╔══════════════════════════════════════════════════════╗
│   │  ║  الطبقة 1: النواة المشتركة (core/)                    ║
│   │  ║  كل ما يشترك فيه المجالان                             ║
│   │  ╚══════════════════════════════════════════════════════╝
│   │
│   ├── core/                        ← الخدمات المشتركة
│   │   │
│   │   ├── components/              ← مكونات UI مشتركة
│   │   │   ├── DashboardLayout.tsx   ← التخطيط الأساسي الموحّد
│   │   │   ├── Sidebar.tsx          ← الشريط الجانبي الذكي (يتغير حسب المساحة)
│   │   │   ├── TopBar.tsx           ← الشريط العلوي
│   │   │   ├── WorkspaceSwitcher.tsx ← [جديد] زر تبديل المساحة
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── CommandPalette.tsx   ← بحث شامل (يفلتر حسب المساحة)
│   │   │   └── ui/                  ← مكونات shadcn/radix المشتركة
│   │   │       ├── button.tsx
│   │   │       ├── card.tsx
│   │   │       ├── dialog.tsx
│   │   │       ├── table.tsx
│   │   │       └── ... (كل مكونات UI الأساسية)
│   │   │
│   │   ├── contexts/                ← سياقات مشتركة
│   │   │   ├── AuthContext.tsx       ← المصادقة (موجود)
│   │   │   ├── WorkspaceContext.tsx  ← [جديد] ✨ السياق الأهم
│   │   │   ├── ThemeContext.tsx      ← السمة (موجود)
│   │   │   ├── FilterContext.tsx     ← الفلاتر (موجود)
│   │   │   ├── GuideContext.tsx      ← الدليل (موجود)
│   │   │   └── PlatformSettingsContext.tsx
│   │   │
│   │   ├── hooks/                   ← خطافات مشتركة
│   │   │   ├── useWorkspace.ts      ← [جديد] ✨ خطاف المساحة
│   │   │   ├── usePermission.ts
│   │   │   ├── useAutoScroll.ts
│   │   │   ├── useMobile.tsx
│   │   │   └── ...
│   │   │
│   │   ├── lib/                     ← أدوات مساعدة مشتركة
│   │   │   ├── trpc.ts
│   │   │   ├── utils.ts
│   │   │   └── api.ts
│   │   │
│   │   └── pages/                   ← صفحات مشتركة (تظهر في كلا المساحتين)
│   │       ├── Login.tsx             ← مع اختيار المساحة
│   │       ├── Home.tsx              ← الرئيسية (محتوى يتغير حسب المساحة)
│   │       ├── Profile.tsx
│   │       ├── Settings.tsx
│   │       ├── Members.tsx
│   │       ├── Notifications.tsx
│   │       ├── SmartRasid.tsx        ← AI (يعرف المساحة الحالية)
│   │       ├── Reports.tsx
│   │       ├── Cases.tsx
│   │       ├── FollowupsList.tsx
│   │       ├── DocumentsRegistry.tsx
│   │       ├── ExportData.tsx
│   │       ├── UserManagement.tsx
│   │       ├── AuditLog.tsx
│   │       ├── ActivityLogs.tsx
│   │       ├── KnowledgeBaseAdmin.tsx
│   │       ├── TrainingCenter.tsx
│   │       ├── AiManagement.tsx
│   │       ├── EmailManagement.tsx
│   │       ├── MessageTemplates.tsx
│   │       ├── EscalationRules.tsx
│   │       ├── SystemHealth.tsx
│   │       ├── ApiKeys.tsx
│   │       ├── Contracts.tsx
│   │       ├── Team.tsx
│   │       ├── ForgotPassword.tsx
│   │       ├── PublicVerify.tsx
│   │       ├── NotFound.tsx
│   │       │
│   │       └── admin/               ← لوحة الإدارة (كاملة من rasid-leaks)
│   │           ├── AdminOverview.tsx
│   │           ├── AdminRoles.tsx
│   │           ├── AdminGroups.tsx
│   │           ├── AdminAuditLog.tsx
│   │           ├── AdminFeatureFlags.tsx
│   │           ├── AdminTheme.tsx
│   │           ├── AdminMenus.tsx
│   │           ├── AdminSecurity.tsx
│   │           ├── AdminContentTypes.tsx
│   │           ├── AdminMediaLibrary.tsx
│   │           ├── AdminBackups.tsx
│   │           ├── AdminPageTemplates.tsx
│   │           ├── AdminScheduledContent.tsx
│   │           ├── AdminCMS.tsx
│   │           ├── AdminOperations.tsx
│   │           ├── AdminSettings.tsx
│   │           ├── SuperAdminPanel.tsx
│   │           └── ControlHub.tsx
│   │
│   │  ╔══════════════════════════════════════════════════════╗
│   │  ║  الطبقة 2: مجال الحالات (leaks/)                    ║
│   │  ║  معزول تماماً — لا يستورد أي شيء من privacy/          ║
│   │  ╚══════════════════════════════════════════════════════╝
│   │
│   ├── leaks/                       ← ⛔ ممنوع استيراد أي شيء من privacy/
│   │   │
│   │   ├── components/              ← مكونات خاصة بالحالات فقط
│   │   │   ├── LeakCard.tsx
│   │   │   ├── ThreatMapWidget.tsx
│   │   │   ├── IncidentTimeline.tsx
│   │   │   ├── SeverityBadge.tsx
│   │   │   ├── BreachSourceIcon.tsx
│   │   │   └── ...
│   │   │
│   │   ├── hooks/                   ← خطافات خاصة بالحالات
│   │   │   ├── useLeaks.ts
│   │   │   ├── useIncidents.ts
│   │   │   └── useThreatData.ts
│   │   │
│   │   ├── lib/                     ← أدوات خاصة
│   │   │   ├── leakUtils.ts
│   │   │   └── threatColors.ts
│   │   │
│   │   └── pages/                   ← صفحات الحالات (30+ صفحة)
│   │       │
│   │       │  ── رصد ومراقبة ──
│   │       ├── LeaksDashboard.tsx    ← لوحة رصد الحالات الرئيسية
│   │       ├── Leaks.tsx             ← قائمة حالات الرصد
│   │       ├── LiveScan.tsx          ← الرصد المباشر
│   │       ├── TelegramMonitor.tsx   ← رصد تليجرام
│   │       ├── DarkWebMonitor.tsx    ← رصد الدارك ويب
│   │       ├── PasteSites.tsx        ← مواقع اللصق
│   │       ├── MonitoringJobs.tsx    ← مهام الرصد
│   │       │
│   │       │  ── إدارة الحوادث ──
│   │       ├── IncidentsDashboard.tsx
│   │       ├── IncidentsList.tsx
│   │       ├── IncidentDetails.tsx
│   │       ├── IncidentsRegistry.tsx
│   │       ├── BreachImport.tsx      ← استيراد بيانات الحالات
│   │       │
│   │       │  ── التحليل والاستخبارات ──
│   │       ├── ThreatMap.tsx         ← خريطة التهديدات
│   │       ├── PIIClassifier.tsx     ← مختبر أنماط PII
│   │       ├── PIIAtlas.tsx          ← أطلس البيانات الشخصية
│   │       ├── ThreatActorsAnalysis.tsx
│   │       ├── SellerProfiles.tsx    ← ملفات الناشرين
│   │       ├── EvidenceChain.tsx     ← سلسلة الأدلة
│   │       ├── OsintTools.tsx        ← OSINT
│   │       ├── KnowledgeGraph.tsx    ← رسم المعرفة
│   │       ├── LeakAnatomy.tsx       ← تشريح الحالة رصد
│   │       ├── LeakTimeline.tsx      ← الخط الزمني
│   │       ├── CampaignTracker.tsx   ← متتبع الحملات
│   │       ├── BulkAnalysis.tsx      ← التحليل الجماعي
│   │       │
│   │       │  ── لوحات مؤشرات ──
│   │       ├── NationalOverview.tsx  ← لوحة القيادة
│   │       ├── SectorAnalysis.tsx
│   │       ├── ImpactAssessment.tsx
│   │       ├── GeoAnalysis.tsx
│   │       ├── SourceIntelligence.tsx
│   │       ├── IncidentCompare.tsx
│   │       ├── ExecutiveBrief.tsx
│   │       │
│   │       │  ── أطلس (Atlas) ──
│   │       └── atlas/
│   │           ├── NationalOverview.tsx
│   │           ├── IncidentRegistry.tsx
│   │           ├── PiiAtlas.tsx
│   │           ├── PatternLab.tsx
│   │           ├── ImpactLens.tsx
│   │           ├── TrendsComparison.tsx
│   │           └── ReportsCenter.tsx
│   │
│   │  ╔══════════════════════════════════════════════════════╗
│   │  ║  الطبقة 3: مجال الخصوصية (privacy/)                   ║
│   │  ║  معزول تماماً — لا يستورد أي شيء من leaks/            ║
│   │  ╚══════════════════════════════════════════════════════╝
│   │
│   └── privacy/                     ← ⛔ ممنوع استيراد أي شيء من leaks/
│       │
│       ├── components/              ← مكونات خاصة بالخصوصية فقط
│       │   ├── ComplianceScoreCard.tsx
│       │   ├── ClauseAnalysisChart.tsx
│       │   ├── SiteStatusBadge.tsx
│       │   ├── PolicyTextViewer.tsx
│       │   ├── DSARTimeline.tsx
│       │   └── ...
│       │
│       ├── hooks/
│       │   ├── useSites.ts
│       │   ├── useScans.ts
│       │   ├── useCompliance.ts
│       │   └── useDSAR.ts
│       │
│       ├── lib/
│       │   ├── complianceUtils.ts
│       │   ├── clauseLabels.ts
│       │   └── scanHelpers.ts
│       │
│       └── pages/                   ← صفحات الخصوصية (17+ صفحة)
│           │
│           │  ── الرئيسية ──
│           ├── PrivacyDashboard.tsx  ← لوحة الامتثال الرئيسية
│           │
│           │  ── فحص الامتثال ──
│           ├── PrivacySites.tsx      ← سجل المواقع (6,246 نطاق)
│           ├── PrivacyScans.tsx      ← نتائج الفحص
│           ├── ComplianceClauses.tsx ← تفاصيل البنود الثمانية
│           ├── PrivacyLiveScan.tsx   ← الفحص المباشر
│           ├── BatchScanning.tsx     ← الفحص الجماعي
│           │
│           │  ── إدارة الامتثال ──
│           ├── PrivacyAssessment.tsx ← تقييم (PDPL/GDPR/ISO27701)
│           ├── ComplianceLetters.tsx ← رسائل للجهات
│           ├── ComplianceAlerts.tsx  ← تنبيهات التغيير
│           ├── SiteWatchers.tsx      ← مراقبة المواقع
│           ├── ComplianceTrends.tsx  ← اتجاهات الامتثال
│           ├── SectorComparison.tsx  ← مقارنة القطاعات
│           │
│           │  ── حقوق أصحاب البيانات ──
│           ├── DSARRequests.tsx      ← طلبات الوصول/الحذف/التصحيح
│           ├── ConsentManagement.tsx ← إدارة الموافقات
│           ├── ProcessingRecords.tsx ← سجلات المعالجة (RoPA)
│           │
│           │  ── تقييم المخاطر ──
│           ├── PrivacyImpact.tsx     ← تقييم الأثر (DPIA)
│           └── MobileAppsPrivacy.tsx ← فحص تطبيقات الجوال
│
│
├── server/
│   │
│   │  ╔══════════════════════════════════════════════════════╗
│   │  ║  Backend: نفس مبدأ الفصل الثلاثي                      ║
│   │  ╚══════════════════════════════════════════════════════╝
│   │
│   ├── _core/                       ← البنية التحتية (لا تتغير)
│   │   ├── index.ts                  ← نقطة دخول الخادم
│   │   ├── context.ts                ← سياق tRPC + workspace detection
│   │   ├── trpc.ts                   ← تعريف الإجراءات
│   │   ├── auth.ts
│   │   ├── oauth.ts
│   │   ├── llm.ts
│   │   ├── rag.ts
│   │   └── env.ts
│   │
│   │  ── النواة المشتركة (shared/) ──
│   │
│   ├── shared/
│   │   ├── routers/
│   │   │   ├── authRouter.ts         ← المصادقة (من routers.ts سطر 101-186)
│   │   │   ├── dashboardRouter.ts    ← لوحة المؤشرات المشتركة (سطر 187-463)
│   │   │   ├── accountRouter.ts      ← الحساب (سطر 848-957)
│   │   │   ├── membersRouter.ts      ← الأعضاء (سطر 958-1062)
│   │   │   ├── notificationsRouter.ts← الإشعارات (سطر 811-847)
│   │   │   ├── casesRouter.ts        ← القضايا (سطر 1647-1798)
│   │   │   ├── reportsRouter.ts      ← التقارير (سطر 1839-2686)
│   │   │   ├── aiRouter.ts           ← الذكاء الاصطناعي (سطر 4522-5042)
│   │   │   ├── documentsRouter.ts    ← المستندات
│   │   │   ├── escalationRouter.ts   ← التصعيد (سطر 2746-2814)
│   │   │   ├── settingsRouter.ts     ← الإعدادات (سطر 2837-2951)
│   │   │   ├── emailRouter.ts        ← البريد (سطر 4159-4202)
│   │   │   └── systemRouter.ts       ← النظام
│   │   │
│   │   ├── adminRouter.ts            ← (موجود — 52KB)
│   │   ├── cmsRouter.ts              ← (موجود — 23KB)
│   │   ├── controlPanelRouter.ts     ← (موجود — 11KB)
│   │   ├── settingsRouter.ts         ← (موجود — 19KB)
│   │   ├── operationsRouter.ts       ← (موجود — 22KB)
│   │   │
│   │   ├── db/
│   │   │   ├── sharedDb.ts           ← عمليات DB المشتركة (من db.ts)
│   │   │   └── adminDb.ts            ← (موجود — 24KB)
│   │   │
│   │   ├── middleware/
│   │   │   ├── rbacRedaction.ts      ← (موجود)
│   │   │   └── workspaceGuard.ts     ← [جديد] ✨ أهم ملف جديد
│   │   │
│   │   └── services/
│   │       ├── email.ts              ← (موجود)
│   │       ├── websocket.ts          ← (موجود)
│   │       ├── scheduler.ts          ← (موجود)
│   │       └── exportEngine.ts       ← (موجود)
│   │
│   │  ── مجال الحالات (leaks/) ──
│   │
│   ├── leaks/
│   │   ├── routers/
│   │   │   ├── leaksRouter.ts        ← من routers.ts سطر 6881-7186
│   │   │   ├── channelsRouter.ts     ← سطر 7187-7194
│   │   │   ├── piiRouter.ts          ← سطر 7195-7310
│   │   │   ├── darkwebRouter.ts      ← سطر 7311+
│   │   │   ├── pastesRouter.ts
│   │   │   ├── evidenceRouter.ts     ← سطر 7495-7573
│   │   │   ├── sellersRouter.ts      ← سطر 7574-7684
│   │   │   ├── osintRouter.ts        ← سطر 7685-7710
│   │   │   ├── threatRouter.ts
│   │   │   ├── knowledgeGraphRouter.ts← سطر 7739-7744
│   │   │   ├── incidentsRouter.ts    ← سطر 8628-8655
│   │   │   └── atlasRouter.ts        ← (موجود — 10KB)
│   │   │
│   │   ├── db/
│   │   │   └── leaksDb.ts            ← عمليات DB خاصة بالحالات
│   │   │
│   │   └── services/
│   │       ├── enrichment.ts         ← (موجود)
│   │       └── alertDispatch.ts      ← (موجود)
│   │
│   │  ── مجال الخصوصية (privacy/) ──
│   │
│   ├── privacy/
│   │   ├── routers/
│   │   │   ├── sitesRouter.ts        ← من routers.ts سطر 464-483
│   │   │   ├── scansRouter.ts        ← سطر 484-674
│   │   │   ├── clausesRouter.ts      ← سطر 675-685
│   │   │   ├── lettersRouter.ts      ← سطر 686-810
│   │   │   ├── watchersRouter.ts     ← سطر 1202-1223
│   │   │   ├── batchScanRouter.ts    ← سطر 1347-1500
│   │   │   ├── advancedScanRouter.ts ← سطر 1501-1606
│   │   │   ├── complianceRouter.ts   ← سطر 3268-3282
│   │   │   ├── assessmentRouter.ts   ← [جديد] PDPL/GDPR تقييم
│   │   │   ├── dsarRouter.ts         ← [جديد] طلبات حقوق البيانات
│   │   │   ├── dpiaRouter.ts         ← [جديد] تقييم الأثر
│   │   │   ├── consentRouter.ts      ← [جديد] الموافقات
│   │   │   └── mobileAppsRouter.ts   ← سطر 1246-1346
│   │   │
│   │   ├── db/
│   │   │   └── privacyDb.ts          ← عمليات DB خاصة بالخصوصية
│   │   │
│   │   └── services/
│   │       ├── scanEngine.ts         ← (موجود)
│   │       ├── deepScanner.ts        ← (موجود — 2,401 سطر)
│   │       ├── scanWorker.ts         ← (موجود)
│   │       └── complianceAnalyzer.ts ← تحليل الامتثال
│   │
│   └── rasidEnhancements/           ← (موجود — مشترك)
│       ├── ragEngine.ts
│       ├── dashboardBuilder.ts
│       └── ... (17 وحدة)
│
│
├── drizzle/
│   ├── schema/                      ← ✨ تقسيم الـ Schema
│   │   ├── shared.ts                ← جداول: users, sessions, admin*, notifications...
│   │   ├── leaks.ts                 ← جداول: leaks, channels, piiScans, darkWeb...
│   │   └── privacy.ts              ← جداول: sites, scans, letters, compliance...
│   ├── relations.ts
│   └── migrations/
│
└── package.json
```

---

## 3. آلية الفصل التام — كيف تعمل؟

### 3.1 الطبقة الأولى: WorkspaceContext (الحاجز الذكي)

هذا هو **قلب** نظام الفصل. كل شيء في المنصة يسأل: "أنا في أي مساحة الآن؟"

```typescript
// core/contexts/WorkspaceContext.tsx

type Workspace = "leaks" | "privacy";

interface WorkspaceState {
  current: Workspace;                    // المساحة الحالية
  allowed: Workspace[];                  // المساحات المسموحة للمستخدم
  switch: (ws: Workspace) => void;       // تبديل المساحة
  isLeaks: boolean;                      // اختصار
  isPrivacy: boolean;                    // اختصار
}

// عند تسجيل الدخول:
// 1. المستخدم يختار المساحة
// 2. يُحفظ في JWT token + localStorage
// 3. كل مكون يقرأ المساحة من هذا السياق

function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState<Workspace>(
    localStorage.getItem("rasid_workspace") as Workspace || "leaks"
  );

  const switch = (ws: Workspace) => {
    // لا يحتاج إعادة تسجيل دخول
    localStorage.setItem("rasid_workspace", ws);
    setWorkspace(ws);
    // ينتقل تلقائياً للصفحة الرئيسية للمساحة الجديدة
    navigate(ws === "leaks" ? "/leaks/dashboard" : "/privacy/dashboard");
  };

  return (
    <WorkspaceContext.Provider value={{ current: workspace, switch, ... }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
```

### 3.2 الطبقة الثانية: WorkspaceGuard (حارس المسارات)

**يمنع** أي مستخدم من الوصول لمساحة غير مصرّح بها:

```typescript
// core/components/WorkspaceGuard.tsx

function WorkspaceGuard({ workspace, children }) {
  const { current, allowed } = useWorkspace();
  const user = useAuth();

  // ❌ المستخدم ليس مصرّح بهذه المساحة
  if (!allowed.includes(workspace)) {
    return <AccessDenied message="ليس لديك صلاحية الوصول لهذه المساحة" />;
  }

  // ✅ مصرّح — عرض المحتوى
  return children;
}
```

**الاستخدام في App.tsx:**

```typescript
// App.tsx — التوجيه الرئيسي

function App() {
  return (
    <WorkspaceProvider>
      <Switch>
        {/* ═══ صفحات بدون مصادقة ═══ */}
        <Route path="/login" component={Login} />
        <Route path="/forgot-password" component={ForgotPassword} />

        {/* ═══ المنصة الموحّدة ═══ */}
        <Route>
          <AuthGuard>
            <DashboardLayout>
              <Switch>
                {/* ═══ صفحات مشتركة — تظهر في كلا المساحتين ═══ */}
                <Route path="/" component={Home} />
                <Route path="/smart-rasid" component={SmartRasid} />
                <Route path="/reports" component={Reports} />
                <Route path="/cases" component={Cases} />
                <Route path="/members" component={Members} />
                <Route path="/notifications" component={Notifications} />
                <Route path="/profile" component={Profile} />
                <Route path="/settings" component={Settings} />
                <Route path="/admin/*" component={AdminRouter} />
                {/* ... باقي الصفحات المشتركة */}

                {/* ═══ مسارات الحالات — محمية ═══ */}
                <Route path="/leaks/:rest*">
                  <WorkspaceGuard workspace="leaks">  {/* 🔒 حارس */}
                    <LeaksRouter />
                  </WorkspaceGuard>
                </Route>

                {/* ═══ مسارات الخصوصية — محمية ═══ */}
                <Route path="/privacy/:rest*">
                  <WorkspaceGuard workspace="privacy"> {/* 🔒 حارس */}
                    <PrivacyRouter />
                  </WorkspaceGuard>
                </Route>
              </Switch>
            </DashboardLayout>
          </AuthGuard>
        </Route>
      </Switch>
    </WorkspaceProvider>
  );
}
```

### 3.3 الطبقة الثالثة: الشريط الجانبي الذكي

الشريط الجانبي **يتغير بالكامل** حسب المساحة — المستخدم لا يرى إلا صفحات مساحته:

```typescript
// core/components/Sidebar.tsx

function Sidebar() {
  const { current: workspace } = useWorkspace();

  // القوائم تتغير كلياً حسب المساحة
  const domainSections = workspace === "leaks"
    ? leaksSidebarSections    // قوائم الحالات فقط
    : privacySidebarSections; // قوائم الخصوصية فقط

  return (
    <aside>
      {/* ═══ رأس الشريط — مع زر التبديل ═══ */}
      <WorkspaceSwitcher />

      {/* ═══ قوائم المجال الحالي ═══ */}
      {domainSections.map(section => (
        <SidebarSection key={section.id} {...section} />
      ))}

      {/* ═══ الخط الفاصل ═══ */}
      <Divider label="خدمات مشتركة" />

      {/* ═══ قوائم مشتركة (تظهر دائماً) ═══ */}
      {sharedSidebarSections.map(section => (
        <SidebarSection key={section.id} {...section} />
      ))}
    </aside>
  );
}
```

**قوائم الحالات:**
```typescript
const leaksSidebarSections = [
  {
    id: "leaks_main",
    label: "الرئيسية",
    items: [
      { label: "لوحة رصد الحالات", path: "/leaks/dashboard", icon: Shield },
      { label: "راصد الذكي", path: "/smart-rasid", icon: Bot },
      { label: "لوحة القيادة", path: "/leaks/national-overview", icon: Gauge },
    ]
  },
  {
    id: "leaks_monitoring",
    label: "تشغيل الرصد",
    items: [
      { label: "الرصد المباشر", path: "/leaks/live-scan", icon: Radio },
      { label: "رصد تليجرام", path: "/leaks/telegram", icon: Send },
      { label: "رصد الدارك ويب", path: "/leaks/darkweb", icon: Globe },
      { label: "مواقع اللصق", path: "/leaks/paste-sites", icon: FileText },
      { label: "مهام الرصد", path: "/leaks/monitoring-jobs", icon: Clock },
    ]
  },
  {
    id: "leaks_incidents",
    label: "إدارة الحالات",
    items: [
      { label: "حالات الرصد", path: "/leaks/incidents", icon: ShieldAlert },
      { label: "سجل الحالات", path: "/leaks/incidents/registry", icon: Archive },
      { label: "سلسلة الأدلة", path: "/leaks/evidence-chain", icon: Link2 },
      { label: "استيراد البيانات", path: "/leaks/import", icon: Import },
      { label: "تشريح الحالة رصد", path: "/leaks/leak-anatomy", icon: Microscope },
    ]
  },
  {
    id: "leaks_analysis",
    label: "التحليل والاستخبارات",
    items: [
      { label: "خريطة التهديدات", path: "/leaks/threat-map", icon: Map },
      { label: "مختبر PII", path: "/leaks/pii-classifier", icon: ScanSearch },
      { label: "جهات النشر", path: "/leaks/threat-actors", icon: Users },
      { label: "أدوات OSINT", path: "/leaks/osint-tools", icon: Radar },
      { label: "الخط الزمني", path: "/leaks/timeline", icon: Activity },
      { label: "متتبع الحملات", path: "/leaks/campaigns", icon: Sparkles },
    ]
  },
  {
    id: "leaks_atlas",
    label: "أطلس البيانات",
    items: [
      { label: "نظرة عامة", path: "/leaks/atlas/overview", icon: BarChart3 },
      { label: "سجل الحالات", path: "/leaks/atlas/incidents", icon: Database },
      { label: "أطلس PII", path: "/leaks/atlas/pii-atlas", icon: Network },
      { label: "مختبر الأنماط", path: "/leaks/atlas/pattern-lab", icon: Layers },
      { label: "الاتجاهات", path: "/leaks/atlas/trends", icon: TrendingUp },
    ]
  },
];
```

**قوائم الخصوصية:**
```typescript
const privacySidebarSections = [
  {
    id: "privacy_main",
    label: "الرئيسية",
    items: [
      { label: "لوحة الامتثال", path: "/privacy/dashboard", icon: ShieldCheck },
      { label: "راصد الذكي", path: "/smart-rasid", icon: Bot },
    ]
  },
  {
    id: "privacy_scanning",
    label: "فحص الامتثال",
    items: [
      { label: "سجل المواقع", path: "/privacy/sites", icon: Globe },
      { label: "نتائج الفحص", path: "/privacy/scans", icon: Search },
      { label: "الفحص المباشر", path: "/privacy/live-scan", icon: Radio },
      { label: "الفحص الجماعي", path: "/privacy/batch-scan", icon: Database },
      { label: "البنود الثمانية", path: "/privacy/clauses", icon: ListChecks },
    ]
  },
  {
    id: "privacy_management",
    label: "إدارة الامتثال",
    items: [
      { label: "تقييم الامتثال", path: "/privacy/assessment", icon: ClipboardCheck },
      { label: "رسائل الامتثال", path: "/privacy/letters", icon: Mail },
      { label: "تنبيهات التغيير", path: "/privacy/alerts", icon: Bell },
      { label: "مراقبة المواقع", path: "/privacy/watchers", icon: Eye },
      { label: "اتجاهات الامتثال", path: "/privacy/trends", icon: TrendingUp },
      { label: "مقارنة القطاعات", path: "/privacy/sector-comparison", icon: BarChart },
    ]
  },
  {
    id: "privacy_rights",
    label: "حقوق أصحاب البيانات",
    items: [
      { label: "طلبات DSAR", path: "/privacy/dsar", icon: UserCheck },
      { label: "إدارة الموافقات", path: "/privacy/consent", icon: CheckCircle },
      { label: "سجلات المعالجة", path: "/privacy/processing-records", icon: FileText },
    ]
  },
  {
    id: "privacy_risk",
    label: "تقييم المخاطر",
    items: [
      { label: "تقييم الأثر (DPIA)", path: "/privacy/dpia", icon: AlertTriangle },
      { label: "فحص التطبيقات", path: "/privacy/mobile-apps", icon: Smartphone },
    ]
  },
];
```

**القوائم المشتركة (تظهر دائماً):**
```typescript
const sharedSidebarSections = [
  {
    id: "shared_reports",
    label: "التقارير والمتابعات",
    items: [
      { label: "التقارير", path: "/reports", icon: BarChart3 },
      { label: "القضايا", path: "/cases", icon: Gavel },
      { label: "المتابعات", path: "/followups", icon: ClipboardList },
      { label: "المستندات", path: "/documents-registry", icon: Folder },
      { label: "تصدير البيانات", path: "/export-data", icon: Download },
    ]
  },
  {
    id: "shared_account",
    label: "الحساب والإعدادات",
    items: [
      { label: "الإعدادات", path: "/settings", icon: Settings },
      { label: "الملف الشخصي", path: "/profile", icon: User },
      { label: "الأعضاء", path: "/members", icon: Users },
      { label: "الإشعارات", path: "/notifications", icon: Bell },
    ]
  },
  {
    id: "shared_admin",
    label: "الإدارة والتحكم",
    rootAdminOnly: true,
    items: [
      { label: "لوحة التحكم", path: "/admin/control", icon: PanelLeft },
      { label: "إدارة المستخدمين", path: "/user-management", icon: Users },
      { label: "الأدوار والصلاحيات", path: "/admin/roles", icon: Shield },
      { label: "إدارة المحتوى", path: "/admin/cms", icon: Database },
      { label: "مركز العمليات", path: "/admin/operations", icon: Gauge },
      { label: "إعدادات النظام", path: "/admin/settings", icon: Wrench },
    ]
  },
];
```

### 3.4 الطبقة الرابعة: حارس API (Backend)

كل طلب API يمر عبر `workspaceGuard` في السيرفر:

```typescript
// server/shared/middleware/workspaceGuard.ts

// Middleware يتحقق من صلاحية الوصول للمساحة
export function workspaceGuard(requiredWorkspace: "leaks" | "privacy") {
  return async ({ ctx, next }) => {
    const userWorkspaces = getUserWorkspaces(ctx.user.role);

    if (!userWorkspaces.includes(requiredWorkspace)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `ليس لديك صلاحية الوصول لمساحة ${requiredWorkspace}`
      });
    }

    // إضافة المساحة للسياق — كل query/mutation تعرف المساحة
    return next({
      ctx: { ...ctx, workspace: requiredWorkspace }
    });
  };
}

// تعريف الإجراءات المحمية
export const leaksProcedure = protectedProcedure
  .use(workspaceGuard("leaks"));

export const privacyProcedure = protectedProcedure
  .use(workspaceGuard("privacy"));
```

**الاستخدام في الـ Routers:**

```typescript
// server/leaks/routers/leaksRouter.ts
export const leaksRouter = router({
  list: leaksProcedure.query(async ({ ctx }) => {  // 🔒 محمي
    return db.getLeaks();
  }),
  create: leaksProcedure.mutation(async ({ input }) => { // 🔒 محمي
    return db.createLeak(input);
  }),
});

// server/privacy/routers/sitesRouter.ts
export const sitesRouter = router({
  list: privacyProcedure.query(async ({ ctx }) => {  // 🔒 محمي
    return db.getSites();
  }),
  scan: privacyProcedure.mutation(async ({ input }) => { // 🔒 محمي
    return db.startScan(input);
  }),
});
```

### 3.5 الطبقة الخامسة: فصل قاعدة البيانات

```typescript
// drizzle/schema/shared.ts — جداول مشتركة
export const users = mysqlTable("users", { ... });
export const adminRoles = mysqlTable("admin_roles", { ... });
export const notifications = mysqlTable("notifications", {
  ...
  workspaceScope: mysqlEnum("workspace_scope", ["leaks", "privacy", "both"]),
});

// drizzle/schema/leaks.ts — جداول الحالات فقط
export const leaks = mysqlTable("leaks", { ... });
export const channels = mysqlTable("channels", { ... });
export const piiScans = mysqlTable("pii_scans", { ... });
export const darkWebListings = mysqlTable("dark_web_listings", { ... });

// drizzle/schema/privacy.ts — جداول الخصوصية فقط
export const sites = mysqlTable("sites", { ... });
export const scans = mysqlTable("scans", { ... });
export const letters = mysqlTable("letters", { ... });
export const privacyAssessments = mysqlTable("privacy_assessments", { ... });
export const dsarRequests = mysqlTable("dsar_requests", { ... });
```

---

## 4. رسم بياني: كيف يتدفق الطلب

```
المستخدم يفتح /leaks/telegram
         │
         ▼
    ┌─────────────┐
    │  App.tsx     │  يطابق المسار /leaks/*
    └──────┬──────┘
           │
           ▼
    ┌─────────────────┐
    │ WorkspaceGuard  │  يتحقق: هل المستخدم مصرّح بمساحة "leaks"؟
    │ workspace="leaks"│
    └──────┬──────────┘
           │
      ❌ غير مصرّح        ✅ مصرّح
      │                    │
      ▼                    ▼
  AccessDenied     ┌──────────────────┐
                   │ LeaksRouter      │  يطابق /telegram
                   └──────┬───────────┘
                          │
                          ▼
                   ┌──────────────────┐
                   │ TelegramMonitor  │  يعرض الصفحة
                   └──────┬───────────┘
                          │
                          ▼  يطلب بيانات من API
                   ┌──────────────────┐
                   │ tRPC Client      │  POST /api/trpc/channels.list
                   └──────┬───────────┘
                          │
                          ▼
                   ┌──────────────────┐
                   │ workspaceGuard   │  يتحقق مرة ثانية في السيرفر
                   │ ("leaks")        │
                   └──────┬───────────┘
                          │
                          ▼
                   ┌──────────────────┐
                   │ channelsRouter   │  ينفذ العملية
                   └──────┬───────────┘
                          │
                          ▼
                   ┌──────────────────┐
                   │ leaks tables     │  يقرأ من جداول الحالات فقط
                   │ (channels)       │  ⛔ لا يمس جداول الخصوصية
                   └──────────────────┘
```

---

## 5. ما الذي يراه كل مستخدم؟

### 5.1 مستخدم "محلل أمني" (security_analyst)

```
يسجل دخول → يرى فقط مساحة الحالات
                ↓
┌────────────────────────────────────┐
│  🛡️ رصد الحالات  [لا يوجد زر تبديل]│
├────────────────────────────────────┤
│ ▸ الرئيسية (لوحة رصد + AI)         │
│ ▸ تشغيل الرصد (تليجرام/دارك ويب)   │
│ ▸ إدارة الحالات                     │
│ ▸ التحليل والاستخبارات              │
│ ▸ أطلس البيانات                     │
│ ─── خدمات مشتركة ──                 │
│ ▸ التقارير                          │
│ ▸ القضايا                           │
│ ▸ الحساب                            │
└────────────────────────────────────┘
   ❌ لا يرى أي صفحة خصوصية
   ❌ لا يرى /privacy/*
   ❌ لا يرى البنود الثمانية
   ❌ لا يرى DSAR
```

### 5.2 مستخدم "مسؤول خصوصية" (privacy_officer)

```
يسجل دخول → يرى فقط مساحة الخصوصية
                ↓
┌────────────────────────────────────┐
│  🔍 رصد الخصوصية  [لا يوجد زر تبديل]│
├────────────────────────────────────┤
│ ▸ الرئيسية (لوحة امتثال + AI)      │
│ ▸ فحص الامتثال (مواقع/بنود)        │
│ ▸ إدارة الامتثال (رسائل/تنبيهات)   │
│ ▸ حقوق أصحاب البيانات (DSAR)       │
│ ▸ تقييم المخاطر (DPIA)             │
│ ─── خدمات مشتركة ──                 │
│ ▸ التقارير                          │
│ ▸ القضايا                           │
│ ▸ الحساب                            │
└────────────────────────────────────┘
   ❌ لا يرى أي صفحة حالة رصدات
   ❌ لا يرى /leaks/*
   ❌ لا يرى تليجرام/دارك ويب
   ❌ لا يرى خريطة التهديدات
```

### 5.3 مستخدم "مشرف عام" (root_admin)

```
يسجل دخول → يرى كلا المساحتين
                ↓
┌────────────────────────────────────┐
│  🛡️ رصد الحالات  [← تبديل للخصوصية]│
├────────────────────────────────────┤
│ ▸ كل قوائم الحالات                │
│ ─── خدمات مشتركة ──                 │
│ ▸ التقارير + القضايا                │
│ ─── الإدارة والتحكم ──               │
│ ▸ لوحة الإدارة الكاملة              │
│ ▸ الأدوار والصلاحيات                │
│ ▸ إدارة المستخدمين                  │
│ ▸ إدارة المحتوى                     │
│ ▸ مركز العمليات                     │
└────────────────────────────────────┘
      ↕ ينقر "تبديل للخصوصية"
┌────────────────────────────────────┐
│  🔍 رصد الخصوصية  [← تبديل للحالة رصدات]│
├────────────────────────────────────┤
│ ▸ كل قوائم الخصوصية                │
│ ─── خدمات مشتركة ──                 │
│ ▸ التقارير + القضايا                │
│ ─── الإدارة والتحكم ──               │
│ ▸ نفس لوحة الإدارة                  │
└────────────────────────────────────┘
```

---

## 6. قواعد الاستيراد (Import Rules) — فرض الفصل في الكود

```
  ✅ مسموح                           ❌ ممنوع
  ─────────                          ─────────
  leaks/ → core/                     leaks/ → privacy/
  privacy/ → core/                   privacy/ → leaks/
  core/ → core/                      leaks/ ↔ privacy/

  أي ملف في leaks/ يمكنه استيراد      أي ملف في leaks/ لا يمكنه
  من core/ فقط                       استيراد أي شيء من privacy/
```

**فرض القاعدة عبر ESLint:**
```json
// .eslintrc.json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["**/leaks/**"],
          "message": "❌ ممنوع استيراد من leaks/ في ملفات privacy/"
        },
        {
          "group": ["**/privacy/**"],
          "message": "❌ ممنوع استيراد من privacy/ في ملفات leaks/"
        }
      ]
    }]
  },
  "overrides": [
    {
      "files": ["client/src/leaks/**"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": ["**/privacy/**"]
        }]
      }
    },
    {
      "files": ["client/src/privacy/**"],
      "rules": {
        "no-restricted-imports": ["error", {
          "patterns": ["**/leaks/**"]
        }]
      }
    }
  ]
}
```

---

## 7. خريطة نقل الملفات الحالية

### من أين إلى أين ينتقل كل ملف:

```
الملف الحالي                    →  الموقع الجديد                    السبب
─────────────────────────────── → ────────────────────────────── ─────────
client/src/pages/Leaks.tsx      → leaks/pages/Leaks.tsx          حالة رصدات
client/src/pages/TelegramMonitor→ leaks/pages/TelegramMonitor    حالة رصدات
client/src/pages/DarkWebMonitor → leaks/pages/DarkWebMonitor     حالة رصدات
client/src/pages/PasteSites     → leaks/pages/PasteSites         حالة رصدات
client/src/pages/PIIClassifier  → leaks/pages/PIIClassifier      حالة رصدات
client/src/pages/ThreatMap      → leaks/pages/ThreatMap          حالة رصدات
client/src/pages/SellerProfiles → leaks/pages/SellerProfiles     حالة رصدات
client/src/pages/EvidenceChain  → leaks/pages/EvidenceChain      حالة رصدات
client/src/pages/OsintTools     → leaks/pages/OsintTools         حالة رصدات
client/src/pages/KnowledgeGraph → leaks/pages/KnowledgeGraph     حالة رصدات
client/src/pages/LeakAnatomy    → leaks/pages/LeakAnatomy        حالة رصدات
client/src/pages/LeakTimeline   → leaks/pages/LeakTimeline       حالة رصدات
client/src/pages/CampaignTracker→ leaks/pages/CampaignTracker    حالة رصدات
client/src/pages/LiveScan       → leaks/pages/LiveScan           حالة رصدات
client/src/pages/BreachImport   → leaks/pages/BreachImport       حالة رصدات
client/src/pages/MonitoringJobs → leaks/pages/MonitoringJobs     حالة رصدات
client/src/pages/BulkAnalysis   → leaks/pages/BulkAnalysis       حالة رصدات
client/src/pages/IncidentsDash  → leaks/pages/IncidentsDashboard حالة رصدات
client/src/pages/IncidentsList  → leaks/pages/IncidentsList      حالة رصدات
client/src/pages/IncidentDetails→ leaks/pages/IncidentDetails    حالة رصدات
client/src/pages/IncidentsRegistry→leaks/pages/IncidentsRegistry حالة رصدات
client/src/pages/PIIAtlas       → leaks/pages/PIIAtlas           حالة رصدات
client/src/pages/ThreatActors   → leaks/pages/ThreatActors       حالة رصدات
client/src/pages/ImpactAssessment→leaks/pages/ImpactAssessment   حالة رصدات
client/src/pages/GeoAnalysis    → leaks/pages/GeoAnalysis        حالة رصدات
client/src/pages/SourceIntel    → leaks/pages/SourceIntelligence حالة رصدات
client/src/pages/IncidentCompare→ leaks/pages/IncidentCompare    حالة رصدات
client/src/pages/Dashboard      → leaks/pages/NationalOverview   حالة رصدات
client/src/pages/SectorAnalysis → leaks/pages/SectorAnalysis     حالة رصدات
client/src/pages/ExecutiveBrief → leaks/pages/ExecutiveBrief     حالة رصدات
client/src/pages/atlas/*        → leaks/pages/atlas/*            حالة رصدات
───────────────────────────────
client/src/pages/Dashboard(فحص) → privacy/pages/PrivacyDashboard خصوصية
                      [جديد]    → privacy/pages/PrivacySites     خصوصية
                      [جديد]    → privacy/pages/PrivacyScans     خصوصية
                      [جديد]    → privacy/pages/ComplianceClauses خصوصية
                      [جديد]    → privacy/pages/ComplianceLetters خصوصية
                      [جديد]    → privacy/pages/ComplianceAlerts خصوصية
                      [جديد]    → privacy/pages/DSARRequests     خصوصية
                      [جديد]    → privacy/pages/PrivacyImpact    خصوصية
                      [جديد]    → privacy/pages/ConsentMgmt      خصوصية
                      [جديد]    → privacy/pages/ProcessingRecords خصوصية
───────────────────────────────
client/src/pages/Home           → core/pages/Home                مشترك
client/src/pages/Login          → core/pages/Login               مشترك
client/src/pages/Profile        → core/pages/Profile             مشترك
client/src/pages/Settings       → core/pages/Settings            مشترك
client/src/pages/Members        → core/pages/Members             مشترك
client/src/pages/Reports        → core/pages/Reports             مشترك
client/src/pages/Cases          → core/pages/Cases               مشترك
client/src/pages/SmartRasid     → core/pages/SmartRasid          مشترك
client/src/pages/admin/*        → core/pages/admin/*             مشترك
(+ 20 صفحة مشتركة أخرى)
```

---

## 8. ملخص طبقات الحماية

```
طبقة الحماية                           ماذا تمنع؟
──────────────                         ─────────────
1. JWT workspace claim                 المستخدم لا يحصل على token لمساحة غير مصرّحة
2. WorkspaceGuard (Frontend)           المسارات محمية — /leaks/* و /privacy/*
3. Sidebar الذكي                       المستخدم لا يرى روابط مساحة أخرى
4. workspaceGuard middleware (Backend)  API endpoints محمية حسب المساحة
5. ESLint import rules                 المطوّر لا يستطيع خلط الكود بين المجالين
6. فصل جداول DB                        لا تداخل في البيانات
7. domain routing في AI                 Smart Rasid يعرف المساحة ويستخدم أدوات المجال فقط
```

**7 طبقات حماية = فصل تام مضمون**

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
- إضافة توثيق تفصيلي لهيكل منصة الخصوصية وهيكل منصة رصد حالات الحالة رصد.
- إضافة مصفوفة وظائف الصفحات لكل منصة لتوضيح الوظائف صفحة بصفحة.

## [1.0.0] - Initial
- الإطلاق الأولي لمنصة Rasid National Platform.

```

---

## `CLAUDE.md`

```markdown
# CLAUDE.md

## Project Overview

Rasid National Platform — a regulatory and analytical platform for managing digital surveys, evidence tracking, executive reporting, and advanced analytics. The platform has two main domains: **Leaks monitoring** (`/leaks/*`) and **Privacy scanning** (`/privacy/*`), plus shared core modules.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4 + Radix UI + shadcn/ui
- **Backend**: Node.js + Express + tRPC
- **Database**: MySQL 8+ via Drizzle ORM
- **Package Manager**: pnpm (v10.4.1)
- **Testing**: Vitest (server-side tests only)
- **Routing**: wouter (client-side)
- **State Management**: TanStack React Query + tRPC React Query

## Project Structure

```
client/src/          # Frontend React application
  _core/hooks/       # Shared client hooks
  components/        # UI components (shadcn/ui based)
  contexts/          # React contexts
  pages/             # Page components
  leaks/             # Leaks domain modules
  privacy/           # Privacy domain modules
  lib/               # Utility functions
  styles/            # CSS styles

server/              # Backend API and business logic
  _core/             # Core infrastructure (trpc, db, env, logging, etc.)
  middleware/         # Express middleware
  privacy/           # Privacy domain server modules
  rasidEnhancements/ # Platform enhancements
  tests/             # Server test files

shared/              # Shared types and constants between client and server
  _core/             # Shared core utilities
  types.ts           # Shared type definitions
  const.ts           # Shared constants
  NAMING_POLICY.ts   # Naming conventions

drizzle/             # Database schema and migrations
  schema.ts          # Drizzle ORM schema definitions

scripts/             # Build and utility scripts
docs/                # Project documentation
```

## Key Commands

```bash
pnpm install          # Install dependencies
pnpm run dev          # Start dev server (tsx watch server/_core/index.ts)
pnpm run build        # Production build (vite build + server build)
pnpm run start        # Start production server (node dist/index.js)
pnpm run check        # TypeScript type checking (tsc --noEmit)
pnpm run test         # Run tests (vitest run)
pnpm run format       # Format code with Prettier
pnpm run db:push      # Generate and run DB migrations (drizzle-kit)
```

## Path Aliases

- `@/*` → `client/src/*`
- `@shared/*` → `shared/*`
- `@assets/*` → `attached_assets/*`

## Development Notes

- The UI is RTL (right-to-left) — the platform is in Arabic.
- The server entry point is `server/_core/index.ts`.
- tRPC is configured in `server/_core/trpc.ts`; routers are in `server/routers.ts` and domain-specific router files.
- Database connection uses `DATABASE_URL` env var. Schema is in `drizzle/schema.ts`.
- Tests are server-side only, located in `server/**/*.test.ts` and `server/tests/`. Run with `pnpm run test`.
- TypeScript strict mode is enabled. Always run `pnpm run check` after changes to verify types.
- Vite dev server proxies API requests to the Express backend.

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
2.  **رصد البيانات:** اكتشاف ومتابعة "حالات الرصد" المتعلقة بحالة رصد البيانات الشخصية، مع استخدام مصطلحات محددة مثل "حالة رصد" و"العدد المُدّعى" بدلاً من "حادثة حالة رصد" إلى حين اكتمال التحقق الرسمي.
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

## `COMPREHENSIVE_AGENT_PROMPT.md`

```markdown
# البرومبت الشامل والصارم لإكمال منصة رصد الوطنية المدموجة

---

## ⛔⛔⛔ تعليمات إلزامية — اقرأها كاملة قبل لمس أي ملف ⛔⛔⛔

### معلومات المستودع الوحيد المسموح العمل عليه
- **المستودع:** `raneemndmo-collab/rasid-leaks`
- **المسار المحلي:** `/home/user/rasid-leaks`
- **الفرع الوحيد:** `claude/merge-websites-shared-services-d6kMJ`
- **⛔ ممنوع منعاً باتاً:** العمل على أي مستودع آخر، إنشاء مستودع جديد، أو الدفع لأي فرع آخر
- **⛔ ممنوع:** حذف أي كود يعمل حالياً — فقط أصلح أو أضف
- **⛔ ممنوع:** إضافة أي مكتبة (dependency) جديدة

### أول أمر تنفذه:
```bash
cd /home/user/rasid-leaks
git checkout claude/merge-websites-shared-services-d6kMJ
git pull origin claude/merge-websites-shared-services-d6kMJ
cat MERGE_PLAN.md  # اقرأه كاملاً — هذا مرجعك الأساسي
```

---

## 🎯 هدف المنصة والمستهدف الرئيسي

المنصة تخدم **الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا/SDAIA)** في مهمتين:

### المهمة 1: رصد البيانات الشخصية (مساحة الحالات — Leaks)
- مراقبة قنوات تليجرام والدارك ويب ومواقع اللصق
- اكتشاف وتوثيق حالات حالة رصد البيانات الشخصية السعودية
- تصنيف أنواع PII المسرّبة وتحديد القطاعات المتأثرة
- **المؤشرات الاستراتيجية:** عدد الحالات المكتشفة، السجلات المتأثرة، القطاعات، مصادر الحالة رصد

### المهمة 2: رصد امتثال سياسات الخصوصية (مساحة الخصوصية — Privacy)
- فحص سياسات الخصوصية لـ 6,246+ موقع سعودي
- تقييم الامتثال وفق 8 بنود من المادة 12 لنظام PDPL
- مقارنة أداء القطاعات (حكومي/خاص/شبه حكومي)
- **المؤشرات الاستراتيجية:** نسبة الامتثال الكلية، المواقع غير الممتثلة، أضعف البنود، تقدم القطاعات

---

## التقنيات
- **Frontend:** React 19 + TypeScript + Vite + Wouter (routing) + TailwindCSS + shadcn/ui + Framer Motion + Recharts + Lucide Icons
- **Backend:** Node.js + Express + tRPC
- **Database:** MySQL + Drizzle ORM
- **النشر:** Railway
- **اتجاه النص:** RTL (عربي) — `dir="rtl"` في كل صفحة
- **الخط:** Tajawal

---

## 🗄️ هيكل قاعدة البيانات

### جداول مساحة الخصوصية (Privacy)

#### 1. `sites` — المواقع المراقبة
```
id, domain, siteName, sectorType (public/private), url, entityNameAr, entityNameEn,
siteStatus (active/inactive/blocked/redirected), siteStatusReason,
hasPrivacyPolicy, privacyUrl, overallComplianceScore, lastScanId, lastScanDate
```

#### 2. `scans` — نتائج الفحص
```
id, siteId, domain, overallScore, rating, complianceStatus (compliant/partially_compliant/non_compliant/no_policy),
clause1Compliant (0/1), clause1Evidence, clause2Compliant, clause2Evidence, ... clause8Compliant, clause8Evidence,
summary, model, duration, errorMessage, scannedAt
```

#### 3. `letters` — خطابات الامتثال
```
id, siteId, domain, entityNameAr, letterType, overallScore, clauses (JSON), sentAt, status
```

#### 4. `siteWatchers` — مراقبة المواقع
```
id, siteId, userId, createdAt
```

#### 5. `complianceAlerts` — تنبيهات تغيير الامتثال
```
id, siteId, domain, alertType, message, oldScore, newScore, createdAt, isRead
```

#### 6. `batchScanJobs` — وظائف الفحص الجماعي
```
id, name, status, totalSites, completedSites, failedSites, startedAt, completedAt
```

#### 7. `dsarRequests` — طلبات حقوق أصحاب البيانات
```
id, requestNumber, requesterName, requesterEmail, requesterPhone,
requestType (access/correction/deletion/portability/objection/restriction),
status (pending/in_progress/completed/rejected/overdue),
entityName, entityDomain, deadline, completedAt, assignedTo, notes
```

#### 8. `consentRecords` — سجلات الموافقات
```
id, siteDomain, siteName, consentType (cookie/marketing/analytics/third_party/data_processing/other),
status (active/withdrawn/expired/not_implemented), consentMechanism, consentText
```

#### 9. `dpiaAssessments` — تقييم أثر الخصوصية
```
id, projectName, projectNameAr, description, entityName,
riskLevel (low/medium/high/critical), status (not_started/in_progress/completed/needs_review),
assessorName, assessorId, dataTypes (JSON), risks (JSON), mitigations (JSON),
recommendations, dpoApproval, dpoApprovalDate
```

#### 10. `processingRecords` — سجلات المعالجة (RoPA)
```
id, activityName, activityNameAr, purpose, purposeAr, dataCategories (JSON),
lawfulBasis (consent/contract/legal_obligation/vital_interest/public_interest/legitimate_interest),
retentionPeriod, crossBorderTransfer, securityMeasures, entityName, controllerName, dpoContact
```

#### 11. `privacyAssessments` — تقييم الامتثال
```
id, entityName, entityDomain, assessmentType (full/quick/clause_specific/follow_up),
overallScore, clause1Score..clause8Score, findings (JSON), recommendations (JSON),
status (draft/in_progress/completed/overdue), assessorName, assessorId
```

#### 12. `mobileAppPrivacy` — خصوصية التطبيقات
```
id, appName, appNameAr, packageId, platform (ios/android/both),
developer, category, permissions (JSON), privacyPolicyUrl, complianceScore,
hasPrivacyPolicy, hasConsentMechanism, dataCollected (JSON), thirdPartySharing (JSON),
status (pending/compliant/non_compliant/needs_review)
```

### جداول مساحة الحالات (Leaks)

#### 1. `leaks` — حالات الحالة رصد
```
id, leakId, title, titleAr, source (telegram/darkweb/paste),
severity (critical/high/medium/low), sector, sectorAr,
piiTypes (JSON), piiTypesAr (JSON), recordCount,
status (new/analyzing/documented/reported),
description, descriptionAr, entityNameAr, entityType
```

#### 2. `channels` — قنوات تليجرام
```
id, channelId, channelName, channelUrl, subscriberCount, channelType,
status, lastScannedAt, riskLevel, totalLeaksFound
```

#### 3. `darkWebListings` — قوائم الدارك ويب
```
id, listingTitle, listingTitleAr, listingSource, listingSeverity,
listingPiiTypes (JSON), listingRecordCount, listingStatus
```

#### 4. `pasteEntries` — مواقع اللصق
```
id, pasteTitle, pastePlatform, pasteUrl, pasteStatus,
pastePiiTypes (JSON), pasteRecordCount
```

#### 5. `monitoringJobs` — وظائف المراقبة
```
id, jobName, jobNameAr, jobPlatform, jobStatus, jobSchedule
```

### جداول مشتركة (Shared)
```
users, platformUsers, notifications, activityLogs, reports, cases, caseHistory,
documents, apiKeys, adminRoles, adminPermissions, adminGroups, adminFeatureFlags,
adminAuditLogs, adminMenus, adminThemeSettings, knowledgeBase, trainingDocuments
```

---

## 🔴 نتائج الفحص: الأخطاء الحرجة المكتشفة

### المشكلة الجذرية الكبرى: عدم تطابق أسماء الحقول (Schema Mismatch)

**هذا أكبر سبب لتعطل الصفحات.** قاعدة البيانات تستخدم أسماء حقول بـ prefix (مثل `contactName`, `ruleName`, `jobStatus`) لكن الـ Frontend يستخدم الأسماء القديمة بدون prefix (مثل `name`, `status`).

#### قائمة كاملة بالملفات المتأثرة والإصلاح المطلوب:

| الملف | الحقل في الكود | الحقل الصحيح من DB |
|-------|---------------|-------------------|
| **AlertChannels.tsx** | `name` | `contactName` |
| | `nameAr` | `contactNameAr` |
| | `role` | `contactRole` |
| | `email` | `contactEmail` |
| | `phone` | `contactPhone` |
| | `channels` | `alertChannels` |
| **ThreatRules.tsx** | `name` | `ruleName` |
| | `nameAr` | `ruleNameAr` |
| | `category` | `ruleCategory` |
| | `severity` | `ruleSeverity` |
| | `isEnabled` | `ruleIsEnabled` |
| | `descriptionAr` | `ruleDescriptionAr` |
| **MonitoringJobs.tsx** | `name` | `jobName` |
| | `nameAr` | `jobNameAr` |
| | `status` | `jobStatus` |
| | `platform` | `jobPlatform` |
| **OsintTools.tsx** | `name` | `queryName` |
| | `nameAr` | `queryNameAr` |
| | `categoryAr` | `queryCategoryAr` |
| **PasteSites.tsx** | `status` | `pasteStatus` |
| | `piiTypes` | `pastePiiTypes` |
| **DarkWebMonitor.tsx** | `severity` | `listingSeverity` |
| **KnowledgeGraph.tsx** | `label` | `nodeLabel` |
| | `labelAr` | `nodeLabelAr` |
| | `relationship` | `edgeRelationship` |
| | `relationshipAr` | `edgeRelationshipAr` |
| **FeedbackAccuracy.tsx** | `leakId` | `feedbackLeakId` |
| | `userName` | `feedbackUserName` |
| | `createdAt` | `feedbackCreatedAt` |
| **AdminFeatureFlags.tsx** | `displayName` | `ffDisplayName` |
| | `isEnabled` | `ffIsEnabled` |
| | `targetType` | `ffTargetType` |
| | `key` | `ffKey` |
| **AdminGroups.tsx** | `name` | `groupName` |
| | `nameEn` | `groupNameEn` |
| | `status` | `groupStatus` |
| **AdminRoles.tsx** | `name` | `roleName` |
| | `nameEn` | `roleNameEn` |
| | `color` | `roleColor` |

**ملاحظة مهمة:** كل ملف في `client/src/pages/` له نسخة مطابقة في `client/src/leaks/pages/` — أصلح الاثنين معاً.

### أخطاء الـ Runtime (Crashes)

| الملف | السطر | المشكلة | الإصلاح |
|-------|-------|---------|---------|
| `components/atlas/PatternCompare.tsx` | 142 | `tc.isDark` بدون تعريف `tc` | أضف `const tc = useThemeColors()` + import |
| `components/atlas/PlatformKPI.tsx` | 133,600 | `useThemeColors` غير مستوردة | أضف الـ import من `@/hooks/atlas/useThemeColors` |
| `components/RasidCharacterWidget.tsx` | 551,572 | `<Streamdown>` غير موجود | أزل أو استبدل بـ `<div>` مع markdown rendering |
| `components/RasidCharacterWidget.tsx` | 589 | `<Loader2>` غير مستوردة | أضفها للـ import من `lucide-react` |
| `components/RasidCharacterWidget.tsx` | 590 | `STATUS_LABELS` غير معرّف | عرّفه: `const STATUS_LABELS: Record<string, string> = {...}` |
| `components/RasidCharacterWidget.tsx` | 76,78 | `MiniMessage`, `StreamingStatus` غير معرّفة | عرّف الأنواع كـ type aliases |

### أخطاء شكل البيانات (Data Shape Mismatch)

| الملف | المشكلة | الإصلاح |
|-------|---------|---------|
| `NotificationBell.tsx` | العدد يرجع `{count: N}` لكن يُستخدم كـ `number` | `data?.count` بدل `data` |
| `AuditLog.tsx` | البيانات `ResultSetHeader` لكن يُستخدم `.filter()` | تحقق من نوع الاستجابة وأصلح |
| `DocumentsRegistry.tsx` | البيانات `{rows, total}` لكن يُستخدم `.length` مباشرة | `data.rows.length` بدل `data.length` |
| `AdminCMS.tsx` | يستخدم `publishedCount` لكن API يرجع `publishedLeaks` | صحح أسماء الحقول |

### أخطاء arguments الدوال

| الملف | المشكلة |
|-------|---------|
| `CinematicTransition.tsx:29` | Hook بدون arguments والمطلوب 1 |
| `LiveGuideOverlay.tsx:42` | Hook بدون arguments والمطلوب 1 |
| `VideoReport.tsx:41` | Hook بدون arguments والمطلوب 1 |
| `AdminOperations.tsx:111` | tRPC mutation بدون arguments |
| `AdminSettings.tsx:147,150` | tRPC queries بدون arguments |
| `ComplianceClauses.tsx:225` | tRPC query بدون arguments |

### أخطاء صفحات الخصوصية تحديداً

| الصفحة | المشكلة |
|--------|---------|
| `PrivacyDashboard.tsx` | يستخدم `compliantPercentage`, `nonCompliantCount`, `pendingScans`, `complianceTrend`, `recentScans` — غير موجودة في الـ stats type |
| `ComplianceAlerts.tsx` | `stats` غير موجود في الاستجابة |
| `ComplianceLetters.tsx` | `stats` غير موجود في الاستجابة |
| `ComplianceTrends.tsx` | `overall`, `byClauses`, `summary` غير موجودة |
| `PrivacyAssessment.tsx` | `stats` غير موجود في الاستجابة |
| `PrivacySites.tsx` | `stats` غير موجود في الاستجابة |
| `BatchScanning.tsx` | `batchScan.list` غير موجود في الراوتر |
| `ConsentManagement.tsx` | Type casting خاطئ: `{total, active, notImplemented}` → `{withConsent, withoutConsent, partial}` |
| `PrivacyImpact.tsx` | Type casting خاطئ: `{total, highRisk, critical}` → `{total, highRisk, completed}` |

---

## 📛 سياسة التسمية الإلزامية (تنفذ في كل مكان)

### القاعدة: "حالة رصد" وليس "حادثة تسرب"

هذه السياسة يجب تطبيقها في **كل مكان**: واجهة المستخدم، قاعدة البيانات، التقارير، التصدير، البحث، الفلاتر، لوحات المؤشرات، راصد الذكي، قوالب الرسائل، وواجهات API.

| المصطلح القديم (ممنوع) | المصطلح المعتمد (إلزامي) |
|------------------------|------------------------|
| حادثة تسرب / حادثة / حالة رصد | **حالة رصد** |
| تسرب مؤكد / حالة رصد مؤكد | **حالة رصد** (حتى يتم التحقق) |
| حادثة تسرب بيانات شخصية | **حالة رصد بيانات شخصية** |
| عدد السجلات المسربة / السجلات المسربة | **العدد المُدّعى** |
| السجلات المسربة فعلياً | **العينات المتاحة** |
| incident / breach / data breach | **monitoring case / observed case** |
| leaked records | **claimed count** |
| confirmed records | **available samples** |

### حالات الحالة (Status Flow):
```
حالة رصد (افتراضي) → قيد التحقق → تسرب مؤكد (فقط بعد التحقق الكامل) → مغلق
```

### أين يجب التغيير:
1. **واجهة المستخدم:** كل Labels, عناوين صفحات, أزرار, بطاقات KPI, جداول, فلاتر
2. **راصد الذكي (SmartRasid):** يستخدم نفس المصطلحات دائماً، يصحح المستخدم إذا استخدم مصطلح خاطئ
3. **التقارير والتصدير:** كل ملفات PDF/Excel/PPT تستخدم المصطلحات المعتمدة
4. **قوالب الرسائل:** كل email templates تستخدم المصطلحات المعتمدة
5. **API:** أسماء الحقول في الاستجابات

### البحث والاستبدال:
```
ابحث في كل ملفات client/src/ و server/ عن:
- "حادثة" → استبدل بـ "حالة رصد"
- "حوادث" → "حالات رصد"
- "تسرب مؤكد" → "حالة رصد" (أو "تسرب مؤكد" فقط إذا كان في سياق الحالة بعد التحقق)
- "حالة رصد مؤكد" → نفس المعالجة
- "السجلات المسربة" → "العدد المُدّعى" أو "العينات المتاحة" حسب السياق
- "عدد السجلات" → "العدد المُدّعى" (إذا كان يشير لرقم البائع/الناشر)
- "incident" (في labels عربية) → "حالة رصد"
- "breach" (في labels عربية) → "حالة رصد"
```

---

## 🏛️ الرؤية التشريعية — فصل الصفحات حسب المستهدف

### السياق المهم:
- **الدور:** تشريعي/رقابي — ليس تشغيلي وليس أمن سيبراني
- **المستهدف:** رصد الامتثال لنظام حماية البيانات الشخصية (PDPL)
- **لا يهمنا:** أي مصطلح سايبر أو أمني. نحن نرصد ونوثق فقط
- **ما يهمنا:** ما بعد الرصد — النتائج والبيانات والتفاصيل

### إعادة هيكلة القائمة الجانبية (Sidebar)

#### لمساحة الحالات — 3 أقسام واضحة:

**القسم 1: نتائج الرصد (الرئيسي — ما يهم صانع القرار)**
```
📊 نظرة عامة
  - الرئيسية
  - لوحة حالات الرصد (Dashboard)
  - الملخص التنفيذي
  - راصد الذكي

📋 حالات الرصد
  - قائمة حالات الرصد
  - سجل الحالات
  - تفاصيل الحالة
  - سلسلة الأدلة
  - الخط الزمني

📈 تحليلات ومؤشرات
  - أطلس البيانات الشخصية
  - توزيع القطاعات
  - التوزيع الجغرافي
  - خارطة المعرفة
  - مؤشرات الدقة
  - اتجاهات الرصد

📄 التقارير والتوصيات
  - التقارير
  - التوصيات
  - القضايا
  - المتابعات
```

**القسم 2: أدوات التشغيل (منفصل — للفريق التشغيلي)**
```
🔍 أدوات الرصد
  - الرصد المباشر
  - رصد تليجرام
  - رصد الدارك ويب
  - مواقع اللصق
  - وظائف المراقبة
  - استيراد البيانات

🔧 أدوات التحليل
  - تصنيف البيانات الشخصية
  - التحليل الجماعي
  - تتبع الحملات
  - مصادر التهديد
```

**القسم 3: الإدارة والتحكم (لوحة تحكم شاملة)**
```
⚙️ لوحة التحكم الشاملة
  - نظرة عامة على الإدارة
  - الأدوار والصلاحيات
  - المجموعات
  - الأعضاء
  - إعدادات المنصة
  - الأمان
  - القوائم والثيم
  - Feature Flags
  - سجل المراجعة
  - إدارة المحتوى
  - صحة النظام
  - النسخ الاحتياطي
```

#### لمساحة الخصوصية — نفس الهيكل:

**القسم 1: نتائج الامتثال (الرئيسي)**
```
📊 نظرة عامة
  - لوحة الامتثال
  - لوحة المؤشرات التنفيذية
  - راصد الذكي

📋 حالة امتثال المواقع
  - سجل المواقع
  - نتائج الفحص
  - البنود الثمانية
  - تقييم الامتثال

📈 مؤشرات الامتثال
  - اتجاهات الامتثال
  - مقارنة القطاعات
  - خطابات الامتثال
  - تنبيهات تغيير السياسات

👤 حقوق أصحاب البيانات
  - طلبات DSAR
  - إدارة الموافقات
  - سجلات المعالجة
  - تقييم DPIA

📄 التقارير والتوصيات
  - التقارير
  - الملخص التنفيذي
  - تصدير البيانات
```

**القسم 2: أدوات الفحص (منفصل)**
```
🔍 أدوات فحص الامتثال
  - فحص مباشر
  - فحص جماعي
  - مراقبة تلقائية
  - فحص التطبيقات
```

**القسم 3: الإدارة والتحكم (نفس القسم المشترك)**

### تنفيذ الفصل في DashboardLayout.tsx
- الأقسام الثلاثة تظهر كـ tabs أو sections منفصلة في الشريط الجانبي
- القسم الأول (نتائج الرصد) يكون مفتوح بالافتراضي
- القسم الثاني والثالث يمكن الوصول لهما بسهولة لكن لا يشتتا المستخدم
- استخدم `SidebarSection` مع أيقونات واضحة لكل قسم

---

## 🔴🔴 أخطاء حرجة إضافية مكتشفة من الفحص العميق

### أخطاء لم تكن في القائمة الأولى:

| الملف | المشكلة | التأثير |
|-------|---------|---------|
| **Home.tsx:169** | `trpc.getDashboardStats` غير موجود — يجب `trpc.dashboard.stats` | crash عند فتح الصفحة الرئيسية |
| **Home.tsx:180-183** | إحصائيات الخصوصية **ثابتة/hardcoded** ("6,246", "8", "--") | بيانات غير حقيقية |
| **BatchScanning.tsx:42** | `trpc.batchScan.list` **غير موجود** في الراوتر | crash |
| **SiteWatchers.tsx:60** | `trpc.watchers.list` **غير موجود** في الراوتر | crash |
| **ComplianceClauses.tsx:225** | `trpc.clauses.detail.useQuery()` بدون arguments — يحتاج `clauseNum` | crash |
| **PrivacyDashboard.tsx:107** | يستدعي `trpc.dashboard.stats` اللي يرجع بيانات الحالات وليس الخصوصية | بيانات خاطئة |
| **DSARRequests.tsx:59** | يمرر `type` بدل `requestType` | فلتر لا يعمل |
| **PrivacyLiveScan.tsx:52** | يستخدم `scanResult.score` غير موجود | عرض خاطئ |
| **PrivacySites.tsx:70** | يمرر `sector` بدل `sectorType` | فلتر لا يعمل |
| **PrivacyScans.tsx:178** | يمرر `dateFrom` غير موجود في الـ schema | فلتر لا يعمل |
| **server/rasidAI.ts:4019** | `allToolResults` غير معرّف | crash في الذكاء الاصطناعي |

### Backend procedures مفقودة يجب إنشاؤها:
1. `batchScan.list` — قائمة وظائف الفحص الجماعي
2. `watchers.list` — قائمة المواقع المراقبة
3. `dashboard.privacyStats` — إحصائيات خاصة بالخصوصية (منفصلة عن الحالات)

---

## 📋 المهام المطلوبة (10 مراحل بالترتيب)

---

### المرحلة 1: إصلاح أخطاء الـ Runtime الحرجة (Crashes)

أصلح كل خطأ يسبب crash عند فتح الصفحة:

1. `components/atlas/PatternCompare.tsx` — أضف `const tc = useThemeColors()` مع import
2. `components/atlas/PlatformKPI.tsx` — أضف import لـ `useThemeColors`
3. `components/RasidCharacterWidget.tsx` — أصلح كل الأنواع والمكونات المفقودة
4. ابحث في كل `client/src/**/*.tsx` عن أي متغير مستخدم بدون تعريف

```bash
npm run build  # تأكد أنه ينجح
git add -A && git commit -m "fix: إصلاح أخطاء Runtime الحرجة (tc undefined, missing imports)"
```

---

### المرحلة 2: إصلاح عدم تطابق أسماء الحقول (Schema Mismatch)

هذه أكبر مشكلة. لكل ملف من القائمة أعلاه:

**الخيار الأفضل:** أصلح في الـ Frontend ليطابق أسماء حقول الـ DB.

مثال `AlertChannels.tsx`:
```typescript
// قبل (خطأ):
<td>{item.name}</td>
// بعد (صحيح):
<td>{item.contactName}</td>
```

**ملاحظة:** كل ملف في `pages/` له نسخة في `leaks/pages/` — أصلح الاثنين.

```bash
npm run build
git add -A && git commit -m "fix: إصلاح تطابق أسماء الحقول مع قاعدة البيانات (schema mismatch)"
```

---

### المرحلة 3: إصلاح صفحات الخصوصية وربطها بالبيانات

لكل صفحة خصوصية:

#### 3.1 أصلح الـ Backend APIs
**الملف:** `server/routers.ts`

تأكد أن كل API ترجع الحقول اللي يحتاجها الـ Frontend:

- `dashboard.stats` يجب أن يرجع: `totalSites`, `compliantPercentage`, `nonCompliantCount`, `pendingScans`, `complianceTrend`, `recentScans`
- `dashboard.clauseStats` يجب أن يرجع مصفوفة: `[{clauseId, compliantPct, partialPct, nonCompliantPct}]`
- `sites.list` يرجع `{sites: [...], total, stats: {active, inactive, compliant, nonCompliant}}`
- `scans.list` يرجع `{scans: [...], total}`
- `alerts.list` يرجع `{alerts: [...], total, stats: {unread, total}}`
- `letters.list` يرجع `{letters: [...], total, stats: {sent, pending}}`
- إذا الـ procedure ترجع البيانات لكن الـ Frontend يتوقع حقل `stats` إضافي، أضف الحقل في الـ Backend

#### 3.2 أضف `batchScan.list` إذا مفقود
ابحث في `server/routers.ts` عن `batchScan`. إذا مفقود، أنشئه:
```typescript
batchScan: router({
  list: publicProcedure.query(async () => {
    const jobs = await db.select().from(batchScanJobs).orderBy(desc(batchScanJobs.id)).limit(50);
    return jobs;
  }),
}),
```

#### 3.3 أصلح Type Casting الخاطئ
- `ConsentManagement.tsx`: أصلح ليستخدم `total`, `active`, `notImplemented` (اللي فعلاً يرجع من API)
- `PrivacyImpact.tsx`: أصلح ليستخدم `total`, `highRisk`, `critical`

#### 3.4 تأكد أن كل صفحة تتعامل مع 3 حالات
```tsx
// Loading
if (isLoading) return <LoadingSpinner />;

// Empty
if (!data || data.length === 0) return <EmptyState icon={Icon} message="لا توجد بيانات" />;

// Data
return <ActualContent data={data} />;
```

```bash
npm run build
git add -A && git commit -m "fix: إصلاح صفحات الخصوصية وربطها بقاعدة البيانات"
```

---

### المرحلة 4: إضافة الصفحات المشتركة لقائمة الخصوصية

**الملف:** `client/src/components/DashboardLayout.tsx`

#### 4.1 أضف هذه المجموعات لـ `privacyMainGroups` أو أنشئ مجموعات جديدة:

```typescript
// مجموعة: أدوات مشتركة
{
  id: "privacy_shared",
  label: "أدوات مشتركة",
  labelEn: "Shared Tools",
  icon: Briefcase,
  items: [
    { label: "لوحتي", labelEn: "My Dashboard", icon: LayoutDashboard, path: "/my-dashboard" },
    { label: "الملخص التنفيذي", labelEn: "Executive Brief", icon: FileText, path: "/executive-brief" },
    { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/reports" },
    { label: "تصدير البيانات", labelEn: "Export Data", icon: Download, path: "/export-data" },
  ],
},
// مجموعة: الفريق
{
  id: "privacy_team",
  label: "الفريق والتواصل",
  labelEn: "Team",
  icon: Users,
  items: [
    { label: "الأعضاء", labelEn: "Members", icon: Users, path: "/members" },
    { label: "الإشعارات", labelEn: "Notifications", icon: Bell, path: "/notifications" },
  ],
},
```

وأضف section جديدة في `privacySidebarSections`:
```typescript
{
  id: "shared",
  label: "أدوات مشتركة",
  labelEn: "Shared Tools",
  icon: Briefcase,
  groups: [/* المجموعتين الجديدتين */],
},
```

#### 4.2 تأكد أن التنقل يعمل
- الصفحات المشتركة (`/my-dashboard`, `/reports`, etc.) تفتح من كلا المساحتين
- `getWorkspaceForRoute()` لا يمنع الوصول لها

```bash
git add -A && git commit -m "feat: إضافة الصفحات المشتركة لقائمة مساحة الخصوصية"
```

---

### المرحلة 5: تحسين لوحة الامتثال الرئيسية

**الملف:** `client/src/privacy/pages/PrivacyDashboard.tsx`

حسّن الصفحة لتشمل:

1. **شريط فلاتر** (أعلى): نوع القطاع + حالة الامتثال + الفترة الزمنية
2. **4 بطاقات KPI**: المواقع المراقبة / نسبة الامتثال / غير ممتثل / فحص معلق
3. **قسم البنود الثمانية**: 8 دوائر progress بألوان مختلفة لكل بند:
   - بند 1: الشفافية (#3b82f6)
   - بند 2: الغرض من الجمع (#8b5cf6)
   - بند 3: مشاركة البيانات (#f59e0b)
   - بند 4: أمن البيانات (#10b981)
   - بند 5: حقوق صاحب البيانات (#ef4444)
   - بند 6: فترة الاحتفاظ (#06b6d4)
   - بند 7: ملفات تعريف الارتباط (#f97316)
   - بند 8: تحديثات السياسة (#ec4899)
4. **RadarChart** لمقارنة البنود الثمانية
5. **BarChart** للامتثال حسب البند
6. **AreaChart** لاتجاه الامتثال عبر الزمن
7. **جدول** آخر 10 فحوصات

```bash
git add -A && git commit -m "feat: تحسين لوحة الامتثال بالفلاتر والرسوم والبنود الثمانية"
```

---

### المرحلة 6: إنشاء لوحات مؤشرات تسلط الضوء على المستهدف

#### 6.1 لوحة المؤشرات التنفيذية للخصوصية
**أنشئ:** `client/src/privacy/pages/PrivacyExecutiveDashboard.tsx`

تعرض:
1. **مؤشر الهدف الاستراتيجي:** نسبة الامتثال الحالية مقارنة بالهدف (مثلاً 48% من 80%) مع progress bar كبير
2. **مقارنة القطاعات:** حكومي vs خاص vs شبه حكومي — نسبة الامتثال لكل قطاع
3. **أضعف البنود:** ترتيب البنود 8 من الأضعف للأقوى مع نسبة كل بند
4. **مؤشرات الإنجاز الشهري:** فحوصات هذا الشهر / رسائل مرسلة / DSAR معالجة / DPIA مكتملة
5. **خريطة حرارية:** جدول القطاعات × البنود الثمانية (أخضر/أصفر/أحمر)

سجّلها:
- Route: `/privacy/executive` في `App.tsx`
- إضافة في القائمة الجانبية للخصوصية
- lazy loading

#### 6.2 تحسين الصفحة الرئيسية (Home.tsx)
**الملف:** `client/src/pages/Home.tsx`

الصفحة الرئيسية يجب أن تُبرز KPIs واضحة لكل مساحة عمل:

**بطاقة الحالات:**
- إجمالي حالات الحالة رصد المكتشفة
- عدد السجلات المتأثرة
- القطاعات المتأثرة
- آخر 3 حالة رصدات

**بطاقة الخصوصية:**
- المواقع تحت الرصد
- نسبة الامتثال الكلية
- بنود الامتثال (8)
- آخر 3 فحوصات

```bash
git add -A && git commit -m "feat: لوحات مؤشرات تسلط الضوء على المستهدف الاستراتيجي"
```

---

### المرحلة 7: التحسينات البصرية والتناسق

#### 7.1 كل صفحة يجب أن تتبع هذا النمط:
```tsx
<div dir="rtl" className="space-y-6 p-6">
  {/* Header */}
  <div>
    <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
      <Icon className="w-7 h-7 text-primary" />
      عنوان الصفحة
    </h1>
    <p className="text-sm text-muted-foreground mt-1">وصف مختصر</p>
  </div>

  {/* KPI Cards */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">...</div>

  {/* Content */}
  ...
</div>
```

#### 7.2 Loading State موحّد
```tsx
if (isLoading) return (
  <div className="flex items-center justify-center h-64 gap-3">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
    <span className="text-sm text-muted-foreground">جاري التحميل...</span>
  </div>
);
```

#### 7.3 Empty State موحّد
```tsx
if (!data?.length) return (
  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
    <Icon className="w-12 h-12 mb-4 opacity-40" />
    <h3 className="text-lg font-medium">لا توجد بيانات</h3>
    <p className="text-sm mt-1">لم يتم العثور على نتائج</p>
  </div>
);
```

#### 7.4 ألوان المساحات
- الخصوصية: `#10b981` (أخضر), `#06b6d4` (تركواز)
- الحالات: `#ef4444` (أحمر), `#8b5cf6` (بنفسجي)

#### 7.5 Responsive
- بطاقات: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- جداول: `overflow-x-auto`
- رسوم: `<ResponsiveContainer width="100%" height={300}>`

```bash
git add -A && git commit -m "style: تحسينات بصرية وتناسق التصميم"
```

---

### المرحلة 8: تطبيق سياسة التسمية الإلزامية ("حالة رصد")

هذه المرحلة تطبق سياسة التسمية المذكورة أعلاه في كامل المنصة.

#### 8.1 البحث والاستبدال الشامل

نفّذ البحث في كل ملفات `client/src/` و `server/`:

```bash
# ابحث أولاً عن كل الأماكن التي تحتاج تغيير:
grep -rn "حادثة" client/src/ server/ --include="*.tsx" --include="*.ts"
grep -rn "حوادث" client/src/ server/ --include="*.tsx" --include="*.ts"
grep -rn "السجلات المسربة" client/src/ server/ --include="*.tsx" --include="*.ts"
grep -rn "حالة رصد مؤكد" client/src/ server/ --include="*.tsx" --include="*.ts"
grep -rn "تسرب مؤكد" client/src/ server/ --include="*.tsx" --include="*.ts"
```

#### 8.2 جدول الاستبدال

| ابحث عن | استبدل بـ | ملاحظة |
|---------|----------|--------|
| `حادثة تسرب` | `حالة رصد` | في كل مكان |
| `حادثة` (بمفردها كـ label) | `حالة رصد` | تأكد أنها في سياق تسرب |
| `حوادث التسرب` | `حالات الرصد` | جمع |
| `حوادث` (بمفردها كـ label) | `حالات رصد` | تأكد من السياق |
| `حالة رصد مؤكد` / `تسرب مؤكد` | لا تغير إذا في Status Flow | فقط في `Status = confirmed` يبقى كما هو |
| `السجلات المسربة` / `عدد السجلات المسربة` | `العدد المُدّعى` | عدد الناشر/البائع |
| `السجلات المسربة فعلياً` | `العينات المتاحة` | السجلات التي بحوزتنا فعلاً |
| `incident` (في labels عربية) | `حالة رصد` | |
| `breach` (في labels عربية) | `حالة رصد` | |
| `leaked records` | `claimed count` | في الترجمات الإنجليزية |

#### 8.3 أماكن يجب الانتباه لها

1. **عناوين الصفحات** (h1, h2): أي عنوان يحتوي "حادثة" أو "حالة رصد"
2. **بطاقات KPI**: labels مثل "إجمالي الحوادث" → "إجمالي حالات الرصد"
3. **أعمدة الجداول**: headers مثل "الحادثة" → "حالة الرصد"
4. **فلاتر البحث**: dropdown options
5. **tooltips و descriptions**
6. **رسائل الحالة الفارغة** (empty states): "لا توجد حوادث" → "لا توجد حالات رصد"
7. **راصد الذكي** (`server/rasidAI.ts`): تأكد أن الردود تستخدم المصطلحات الصحيحة
8. **قوالب التقارير والتصدير**: أي ملف يولّد PDF/Excel
9. **Sidebar labels**: في `DashboardLayout.tsx`
10. **Status badges**: كل badge يعرض حالة

#### 8.4 حالات Status Flow المعتمدة

```typescript
// هذه هي الحالات المعتمدة في الواجهة:
const STATUS_LABELS: Record<string, string> = {
  "new": "حالة رصد جديدة",
  "analyzing": "قيد التحقق",
  "documented": "تسرب مؤكد",    // ✅ هنا فقط يُستخدم "تسرب مؤكد"
  "reported": "مغلق",
};
```

```bash
npm run build
git add -A && git commit -m "refactor: تطبيق سياسة التسمية — حالة رصد بدلاً من حادثة تسرب"
```

---

### المرحلة 9: إعادة هيكلة القائمة الجانبية حسب الرؤية التشريعية

**الملف الرئيسي:** `client/src/components/DashboardLayout.tsx`

هذه المرحلة تعيد هيكلة القائمة الجانبية بالكامل حسب الهيكل المفصّل في قسم "الرؤية التشريعية" أعلاه.

#### 9.1 مساحة الحالات — هيكلة 3 أقسام

استبدل `leaksSidebarSections` بالهيكل التالي:

```typescript
const leaksSidebarSections: SidebarSection[] = [
  {
    id: "results",
    label: "نتائج الرصد",
    icon: BarChart3,
    groups: [
      {
        id: "leaks_overview",
        label: "نظرة عامة",
        items: [
          { label: "الرئيسية", path: "/", icon: Home },
          { label: "لوحة حالات الرصد", path: "/dashboard", icon: LayoutDashboard },
          { label: "الملخص التنفيذي", path: "/executive-brief", icon: FileText },
          { label: "راصد الذكي", path: "/smart-rasid", icon: Bot },
        ],
      },
      {
        id: "leaks_cases",
        label: "حالات الرصد",
        items: [
          { label: "قائمة حالات الرصد", path: "/leaks", icon: AlertTriangle },
          { label: "سجل الحالات", path: "/cases", icon: FolderOpen },
          { label: "سلسلة الأدلة", path: "/evidence-chain", icon: Link },
          { label: "الخط الزمني", path: "/timeline", icon: Clock },
        ],
      },
      {
        id: "leaks_analytics",
        label: "تحليلات ومؤشرات",
        items: [
          { label: "أطلس البيانات الشخصية", path: "/pii-atlas", icon: Fingerprint },
          { label: "توزيع القطاعات", path: "/sectors", icon: PieChart },
          { label: "خارطة المعرفة", path: "/knowledge-graph", icon: Network },
          { label: "مؤشرات الدقة", path: "/accuracy", icon: Target },
          { label: "اتجاهات الرصد", path: "/trends", icon: TrendingUp },
        ],
      },
      {
        id: "leaks_reports",
        label: "التقارير والتوصيات",
        items: [
          { label: "التقارير", path: "/reports", icon: FileBarChart },
          { label: "القضايا", path: "/cases", icon: Briefcase },
          { label: "تصدير البيانات", path: "/export-data", icon: Download },
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "أدوات التشغيل",
    icon: Settings,
    groups: [
      {
        id: "leaks_monitoring_tools",
        label: "أدوات الرصد",
        items: [
          { label: "رصد تليجرام", path: "/channels", icon: Send },
          { label: "رصد الدارك ويب", path: "/dark-web", icon: Globe },
          { label: "مواقع اللصق", path: "/paste-sites", icon: FileCode },
          { label: "وظائف المراقبة", path: "/monitoring-jobs", icon: Activity },
          { label: "استيراد البيانات", path: "/import", icon: Upload },
        ],
      },
      {
        id: "leaks_analysis_tools",
        label: "أدوات التحليل",
        items: [
          { label: "التصنيف", path: "/classification", icon: Tags },
          { label: "مصادر التهديد", path: "/threat-rules", icon: Shield },
          { label: "جهات التنبيه", path: "/alert-channels", icon: Bell },
        ],
      },
    ],
  },
  {
    id: "admin",
    label: "الإدارة والتحكم",
    icon: Settings2,
    groups: adminSectionGroups, // نفس المجموعات الإدارية المشتركة
  },
];
```

#### 9.2 مساحة الخصوصية — نفس الهيكل بـ 3 أقسام

استبدل `privacySidebarSections` بالهيكل المفصّل في قسم "الرؤية التشريعية" أعلاه (راجع الهيكل الكامل في القسم المعنون "لمساحة الخصوصية").

#### 9.3 عرض الأقسام في الشريط الجانبي

- **القسم الأول** (نتائج الرصد / نتائج الامتثال) يكون **مفتوح بالافتراضي** ويشغل المساحة الأكبر
- **القسم الثاني** (أدوات التشغيل / أدوات الفحص) يكون **مطوي بالافتراضي** — يمكن فتحه بالضغط على العنوان
- **القسم الثالث** (الإدارة والتحكم) يكون **مطوي بالافتراضي** — يمكن فتحه بالضغط على العنوان
- كل قسم له **أيقونة مميزة** و**لون خفيف** لتمييزه
- القسم المطوي يعرض فقط العنوان مع أيقونة (سهم لأسفل/لأعلى)

#### 9.4 تأكد من التوافق

- جميع الـ routes في `App.tsx` يجب أن تظل تعمل
- الصفحات المشتركة يجب أن تظهر في كلا المساحتين
- `getWorkspaceForRoute()` يجب أن يتعامل مع كل المسارات الجديدة

```bash
npm run build
git add -A && git commit -m "feat: إعادة هيكلة القائمة الجانبية حسب الرؤية التشريعية (3 أقسام)"
```

---

### المرحلة 10: الاختبار النهائي والدفع

#### 10.1 اختبار البناء
```bash
npm run build
```
**يجب أن ينجح بدون أخطاء.**

#### 10.2 قائمة التحقق الشاملة

**حالة رصدات:**
- [ ] الصفحة الرئيسية تعرض KPIs حقيقية من DB
- [ ] القائمة الجانبية بـ 3 أقسام (نتائج / تشغيل / إدارة)
- [ ] PiiAtlas يعمل بدون crash
- [ ] AlertChannels يعرض بيانات صحيحة (contactName)
- [ ] DarkWebMonitor يعرض severity صحيح (listingSeverity)
- [ ] MonitoringJobs يعرض بيانات صحيحة (jobName, jobStatus)
- [ ] ThreatRules يعرض بيانات صحيحة (ruleName, ruleSeverity)
- [ ] لا يوجد أي ذكر لـ "حادثة تسرب" — فقط "حالة رصد"
- [ ] "العدد المُدّعى" بدل "السجلات المسربة"

**خصوصية:**
- [ ] لوحة الامتثال محسّنة بالفلاتر والبنود الثمانية والرسوم
- [ ] لوحة المؤشرات التنفيذية الجديدة تعمل
- [ ] القائمة الجانبية بـ 3 أقسام (نتائج / فحص / إدارة)
- [ ] الصفحات المشتركة تظهر في القائمة الجانبية
- [ ] 17 صفحة خصوصية تعمل بدون crash
- [ ] ComplianceClauses يمرر clauseNum
- [ ] DSARRequests يمرر requestType بدل type
- [ ] BatchScanning يعمل مع batchScan.list
- [ ] كل صفحة = loading + empty + data

**مشترك:**
- [ ] تبديل المساحات يعمل بسلاسة
- [ ] RasidCharacterWidget لا يسبب crash
- [ ] NotificationBell يعرض العدد صحيح
- [ ] التصميم RTL ومتجاوب (responsive)
- [ ] Home.tsx يستخدم trpc.dashboard.stats (وليس trpc.getDashboardStats)
- [ ] لا يوجد بيانات hardcoded

#### 10.3 فحص التسمية النهائي
```bash
# يجب أن يرجع 0 نتائج:
grep -rn "حادثة تسرب" client/src/ --include="*.tsx"
grep -rn "حوادث التسرب" client/src/ --include="*.tsx"
grep -rn "السجلات المسربة" client/src/ --include="*.tsx"
```

#### 10.4 الدفع النهائي
```bash
git push -u origin claude/merge-websites-shared-services-d6kMJ
```

---

## ⛔ القواعد الصارمة (انتهاكها = فشل المهمة)

1. **المستودع الوحيد:** `/home/user/rasid-leaks` فقط
2. **الفرع الوحيد:** `claude/merge-websites-shared-services-d6kMJ`
3. **لا تحذف كود يعمل**
4. **لا تكسر مساحة الحالات**
5. **كل صفحة = 3 حالات:** loading + empty + data
6. **tRPC فقط** — لا fetch, لا axios, لا mock data
7. **اختبر البناء بعد كل مرحلة** `npm run build`
8. **كوميت بعد كل مرحلة** — لا تجمع التغييرات
9. **لا dependencies جديدة**
10. **كل النصوص بالعربية** + `dir="rtl"`
11. **اقرأ MERGE_PLAN.md أولاً**
12. **أصلح النسختين:** `pages/` + `leaks/pages/` معاً
13. **سياسة التسمية إلزامية:** "حالة رصد" وليس "حادثة تسرب" — راجع القسم المخصص أعلاه
14. **القائمة الجانبية = 3 أقسام:** نتائج (مفتوح) + تشغيل (مطوي) + إدارة (مطوي)
15. **الدور تشريعي/رقابي:** لا مصطلحات سايبر أو أمنية — نحن نرصد ونوثق فقط

```

---

## `Dockerfile`

```
FROM node:22-slim AS base

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate

WORKDIR /app

# Force development mode during build so devDependencies are installed
ENV NODE_ENV=development

# Install dependencies (include patches for pnpm)
COPY package.json pnpm-lock.yaml ./
COPY patches/ ./patches/
RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm rebuild esbuild @tailwindcss/oxide

# Copy source code
COPY . .

# Build client (vite) + server (esbuild)
RUN pnpm run build

# Production stage
FROM node:22-slim AS production
WORKDIR /app

# Install bash (not included in slim images)
RUN apt-get update -qq && apt-get install -y --no-install-recommends bash && rm -rf /var/lib/apt/lists/*

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

CMD ["node", "dist/index.js"]

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

## `MERGE_PLAN.md`

```markdown
# خطة دمج منصتي رصد الحالات ورصد سياسات الخصوصية

**التاريخ:** 25 فبراير 2026
**المشروع:** منصة رصد الوطنية الموحّدة (Rasid Unified Platform)

---

## الفهرس

1. [ملخص تنفيذي](#1-ملخص-تنفيذي)
2. [تحليل الوضع الحالي](#2-تحليل-الوضع-الحالي)
3. [مبادئ الدمج الأساسية](#3-مبادئ-الدمج-الأساسية)
4. [هيكلة المشروع الموحّد](#4-هيكلة-المشروع-الموحّد)
5. [الخدمات المشتركة (Shared Services)](#5-الخدمات-المشتركة)
6. [الوظائف المنفصلة لكل منصة](#6-الوظائف-المنفصلة-لكل-منصة)
7. [هيكلة قاعدة البيانات الموحّدة](#7-هيكلة-قاعدة-البيانات-الموحّدة)
8. [هيكلة الصفحات والتنقل الجديدة](#8-هيكلة-الصفحات-والتنقل-الجديدة)
9. [نظام التوجيه (Routing)](#9-نظام-التوجيه)
10. [نظام الصلاحيات الموحّد](#10-نظام-الصلاحيات-الموحّد)
11. [خطة التنفيذ المرحلية](#11-خطة-التنفيذ-المرحلية)
12. [جدول التحقق من الوظائف](#12-جدول-التحقق-من-الوظائف)
13. [المخاطر وخطة التخفيف](#13-المخاطر-وخطة-التخفيف)

---

## 1. ملخص تنفيذي

### الهدف
دمج منصتين منفصلتين (`rasid-leaks` و `rasid-privacy`) في منصة واحدة موحّدة مع:
- **فصل كامل للوظائف** بين مجال الحالات ومجال الخصوصية
- **مشاركة الخدمات العامة** (مصادقة، لوحات تحكم، أعضاء، إشعارات، تقارير، ذكاء اصطناعي)
- **عدم فقدان أي وظيفة** من الوظائف الحالية في أي من المنصتين
- **إعادة هيكلة الصفحات** لتكون أكثر احترافية وسهولة في التصفح

### الحالة الحالية
| المنصة | الرابط | الحالة |
|--------|--------|--------|
| رصد الحالات (Leaks) | `leaks.pdbl.org` → `pdbl.org` | منصة مكتملة مع لوحات إدارية كاملة، 118+ صفحة، 350+ نقطة API |
| رصد الخصوصية (Privacy) | `privacy.pdbl.org` → `pdbl.org/privacy/*` | منصة مستقلة لفحص امتثال سياسات الخصوصية وفق 8 بنود PDPL |

> **بعد الدمج:** المنصة الموحدة تعمل على الدومين الرئيسي **`pdbl.org`** — بدون صب دومينات منفصلة.

### النتيجة المتوقعة
منصة واحدة على الدومين الرئيسي `pdbl.org` مع:
- مدخل واحد للتسجيل مع اختيار مساحة العمل (Workspace)
- شريط جانبي ذكي يتغير حسب المساحة المختارة
- خدمات مشتركة موحّدة (لا تكرار)
- فصل كامل لمنطق الأعمال بين المجالين

---

## 2. تحليل الوضع الحالي

### 2.1 منصة رصد الحالات (rasid-leaks)

**التقنيات:** React 19 + TypeScript + Vite (Frontend) | Node.js + Express + tRPC (Backend) | MySQL + Drizzle ORM

**الوظائف الرئيسية:**
| # | الوظيفة | الوصف |
|---|---------|-------|
| L1 | رصد الحالات | اكتشاف وتوثيق حالات حالة رصد البيانات الشخصية |
| L2 | رصد تليجرام | مراقبة قنوات تليجرام للحالة رصدات |
| L3 | رصد الدارك ويب | مراقبة مصادر الدارك ويب |
| L4 | مواقع اللصق | مراقبة مواقع Paste (Pastebin وغيرها) |
| L5 | تصنيف PII | تصنيف أنواع البيانات الشخصية المسرّبة |
| L6 | خريطة التهديدات | تصوير جغرافي للتهديدات |
| L7 | تحليل جهات النشر | ملفات تعريف الجهات الناشرة للحالة رصدات |
| L8 | سلسلة الأدلة | تتبع الأدلة الرقمية |
| L9 | أدوات OSINT | أدوات استخبارات المصادر المفتوحة |
| L10 | أطلس البيانات | تحليل متقدم (Atlas) مع 8 صفحات فرعية |
| L11 | إدارة الحالات | تتبع القضايا والمتابعات |
| L12 | تشريح الحالة رصد | تحليل تفصيلي لكل حالة رصد |
| L13 | الخط الزمني | عرض زمني لتطور الحالات |
| L14 | متتبع الحملات | تتبع حملات الحالة رصد المنظمة |
| L15 | استيراد/تصدير | استيراد بيانات جماعي وتصدير بتنسيقات متعددة |

**الوظائف المشتركة الموجودة حالياً:**
| # | الوظيفة | الوصف |
|---|---------|-------|
| S1 | نظام المصادقة | تسجيل دخول + JWT + OAuth |
| S2 | لوحة إدارية كاملة | أدوار + صلاحيات + مجموعات + feature flags |
| S3 | إدارة المستخدمين | CRUD مستخدمين + إعدادات ملف شخصي |
| S4 | نظام الإشعارات | إشعارات داخلية + بريد إلكتروني |
| S5 | سجل المراجعة | تسجيل كامل للعمليات |
| S6 | التقارير | إنشاء + تصدير PDF/Excel/PPT |
| S7 | الذكاء الاصطناعي (Smart Rasid) | مساعد ذكي مع RAG |
| S8 | قاعدة المعرفة | إدارة المحتوى المعرفي |
| S9 | مركز التدريب | تدريب النماذج الذكية |
| S10 | إدارة المحتوى (CMS) | أنواع محتوى + إصدارات + جدولة |
| S11 | مركز العمليات | صحة النظام + نسخ احتياطي |
| S12 | إعدادات المنصة | ثيم + قوائم + أمان + API |
| S13 | إدارة المستندات | سجل + تحقق + إحصائيات |
| S14 | قوالب الرسائل | قوالب بريد إلكتروني |
| S15 | التصعيد | قواعد تصعيد آلية |

### 2.2 منصة رصد الخصوصية (rasid-privacy)

**الوظائف الرئيسية:**
| # | الوظيفة | الوصف |
|---|---------|-------|
| P1 | فحص سياسات الخصوصية | زحف وتحليل سياسات الخصوصية لـ 6,246+ نطاق سعودي |
| P2 | تحليل امتثال 8 بنود | تحليل دلالي وفق 8 بنود من المادة 12 لنظام PDPL |
| P3 | سجل المواقع | تتبع حالة المواقع (يعمل/معطل/محظور) |
| P4 | لوحة الامتثال | إحصائيات شاملة لنسب الامتثال |
| P5 | رسائل الامتثال (Letters) | خطابات رسمية للجهات غير الممتثلة |
| P6 | تنبيهات تغيير الامتثال | رصد التغييرات في حالة الامتثال |
| P7 | مراقبة المواقع (Watchers) | مراقبة مستمرة لمواقع محددة |
| P8 | فحص جماعي | فحص دفعات كبيرة من المواقع |
| P9 | مقارنة القطاعات | مقارنة الامتثال بين القطاع العام والخاص |
| P10 | تقييم الامتثال (Assessment) | تقييم وفق أطر PDPL/GDPR/ISO27701 |
| P11 | طلبات حقوق أصحاب البيانات (DSAR) | إدارة طلبات الوصول/الحذف/التصحيح/النقل |
| P12 | تقييم الأثر (DPIA) | تقييم أثر المعالجة على الخصوصية |
| P13 | إدارة الموافقات | تسجيل وتتبع الموافقات |
| P14 | سجلات المعالجة (RoPA) | توثيق أنشطة معالجة البيانات |
| P15 | تطبيقات الجوال | فحص سياسات خصوصية التطبيقات |

---

## 3. مبادئ الدمج الأساسية

### 3.1 مبدأ الفصل التام للمجالات (Domain Isolation)
```
┌─────────────────────────────────────────────────┐
│              منصة رصد الوطنية الموحّدة             │
├─────────────┬───────────────────┬───────────────┤
│  مجال       │  الخدمات المشتركة  │  مجال         │
│  الحالات   │  (Shared Core)    │  الخصوصية     │
│  (Leaks)    │                   │  (Privacy)    │
│             │  - المصادقة       │               │
│  - رصد      │  - الصلاحيات      │  - فحص سياسات │
│  - تحليل    │  - المستخدمين      │  - امتثال     │
│  - حوادث    │  - الإشعارات      │  - DSAR       │
│  - أدلة     │  - التقارير       │  - DPIA       │
│  - OSINT    │  - AI             │  - رسائل      │
│  - Dark Web │  - CMS            │  - مراقبة     │
│             │  - لوحة تحكم      │               │
└─────────────┴───────────────────┴───────────────┘
```

### 3.2 قواعد الدمج الذهبية

1. **لا فقدان أي وظيفة**: كل وظيفة موجودة حالياً يجب أن تبقى تعمل
2. **لا خلط في الوظائف**: وظائف الحالات لا تظهر في مساحة الخصوصية والعكس
3. **خدمات مشتركة موحّدة**: لا تكرار في الكود للخدمات العامة
4. **مصدر واحد للحقيقة**: قاعدة بيانات واحدة مع فصل منطقي بالجداول
5. **استقلالية التطوير**: يمكن تطوير كل مجال بشكل مستقل دون التأثير على الآخر

---

## 4. هيكلة المشروع الموحّد

### 4.1 هيكلة المجلدات المقترحة

```
rasid-unified/
├── client/
│   ├── src/
│   │   ├── App.tsx                          # نقطة الدخول الرئيسية
│   │   ├── main.tsx
│   │   │
│   │   ├── core/                            # الخدمات المشتركة (Shared)
│   │   │   ├── components/                  # مكونات مشتركة
│   │   │   │   ├── DashboardLayout.tsx       # التخطيط الأساسي
│   │   │   │   ├── Sidebar.tsx              # الشريط الجانبي الذكي
│   │   │   │   ├── TopBar.tsx               # الشريط العلوي
│   │   │   │   ├── WorkspaceSwitcher.tsx     # محوّل مساحة العمل
│   │   │   │   └── ui/                      # مكونات UI الأساسية (shadcn)
│   │   │   ├── contexts/                    # سياقات مشتركة
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── WorkspaceContext.tsx      # [جديد] سياق مساحة العمل
│   │   │   │   ├── ThemeContext.tsx
│   │   │   │   └── PlatformSettingsContext.tsx
│   │   │   ├── hooks/                       # خطافات مشتركة
│   │   │   ├── lib/                         # أدوات مساعدة
│   │   │   └── pages/                       # صفحات مشتركة
│   │   │       ├── Login.tsx
│   │   │       ├── Profile.tsx
│   │   │       ├── Settings.tsx
│   │   │       ├── Members.tsx
│   │   │       ├── Notifications.tsx
│   │   │       ├── SmartRasid.tsx
│   │   │       └── admin/                   # لوحة التحكم الكاملة
│   │   │           ├── AdminOverview.tsx
│   │   │           ├── AdminRoles.tsx
│   │   │           ├── AdminGroups.tsx
│   │   │           ├── AdminAuditLog.tsx
│   │   │           ├── AdminFeatureFlags.tsx
│   │   │           ├── AdminTheme.tsx
│   │   │           ├── AdminMenus.tsx
│   │   │           ├── AdminSecurity.tsx
│   │   │           ├── AdminCMS.tsx
│   │   │           ├── AdminOperations.tsx
│   │   │           └── AdminSettings.tsx
│   │   │
│   │   ├── leaks/                           # مجال الحالات (منفصل تماماً)
│   │   │   ├── components/                  # مكونات خاصة بالحالات
│   │   │   ├── hooks/                       # خطافات خاصة
│   │   │   ├── lib/                         # أدوات مساعدة خاصة
│   │   │   └── pages/                       # صفحات الحالات
│   │   │       ├── LeaksDashboard.tsx        # الرئيسية
│   │   │       ├── Leaks.tsx                # حالات الرصد
│   │   │       ├── TelegramMonitor.tsx
│   │   │       ├── DarkWebMonitor.tsx
│   │   │       ├── PasteSites.tsx
│   │   │       ├── PIIClassifier.tsx
│   │   │       ├── ThreatMap.tsx
│   │   │       ├── SellerProfiles.tsx
│   │   │       ├── EvidenceChain.tsx
│   │   │       ├── OsintTools.tsx
│   │   │       ├── KnowledgeGraph.tsx
│   │   │       ├── LeakAnatomy.tsx
│   │   │       ├── LeakTimeline.tsx
│   │   │       ├── IncidentsDashboard.tsx
│   │   │       ├── IncidentsList.tsx
│   │   │       ├── IncidentDetails.tsx
│   │   │       ├── CampaignTracker.tsx
│   │   │       ├── BreachImport.tsx
│   │   │       ├── LiveScan.tsx             # الرصد المباشر للحالة رصدات
│   │   │       └── atlas/                   # صفحات أطلس
│   │   │           ├── NationalOverview.tsx
│   │   │           ├── IncidentRegistry.tsx
│   │   │           ├── PiiAtlas.tsx
│   │   │           ├── PatternLab.tsx
│   │   │           ├── ImpactLens.tsx
│   │   │           ├── TrendsComparison.tsx
│   │   │           └── ReportsCenter.tsx
│   │   │
│   │   └── privacy/                         # مجال الخصوصية (منفصل تماماً)
│   │       ├── components/                  # مكونات خاصة بالخصوصية
│   │       ├── hooks/
│   │       ├── lib/
│   │       └── pages/
│   │           ├── PrivacyDashboard.tsx      # لوحة الخصوصية الرئيسية
│   │           ├── PrivacySites.tsx          # سجل المواقع
│   │           ├── PrivacyScans.tsx          # نتائج الفحص
│   │           ├── ComplianceClauses.tsx     # تفاصيل البنود الثمانية
│   │           ├── ComplianceLetters.tsx     # رسائل الامتثال
│   │           ├── ComplianceAlerts.tsx      # تنبيهات تغيير الامتثال
│   │           ├── SiteWatchers.tsx          # مراقبة المواقع
│   │           ├── BatchScanning.tsx         # فحص جماعي
│   │           ├── SectorComparison.tsx      # مقارنة القطاعات
│   │           ├── PrivacyAssessment.tsx     # تقييم الامتثال (PDPL/GDPR/ISO)
│   │           ├── DSARRequests.tsx          # طلبات حقوق أصحاب البيانات
│   │           ├── PrivacyImpact.tsx         # تقييم الأثر (DPIA)
│   │           ├── ConsentManagement.tsx     # إدارة الموافقات
│   │           ├── ProcessingRecords.tsx     # سجلات المعالجة (RoPA)
│   │           ├── MobileAppsPrivacy.tsx     # فحص تطبيقات الجوال
│   │           ├── PrivacyLiveScan.tsx       # الفحص المباشر للمواقع
│   │           └── ComplianceTrends.tsx      # اتجاهات الامتثال
│   │
│   └── index.html
│
├── server/
│   ├── _core/                               # الخدمات المشتركة (Backend)
│   │   ├── index.ts                         # نقطة دخول الخادم
│   │   ├── context.ts                       # سياق tRPC
│   │   ├── trpc.ts                          # تعريف الإجراءات
│   │   ├── auth.ts                          # المصادقة
│   │   └── oauth.ts                         # OAuth
│   │
│   ├── shared/                              # وحدات مشتركة
│   │   ├── routers/
│   │   │   ├── authRouter.ts                # مصادقة
│   │   │   ├── usersRouter.ts               # إدارة المستخدمين
│   │   │   ├── notificationsRouter.ts       # إشعارات
│   │   │   ├── reportsRouter.ts             # تقارير
│   │   │   ├── aiRouter.ts                  # ذكاء اصطناعي
│   │   │   ├── documentsRouter.ts           # مستندات
│   │   │   ├── casesRouter.ts               # قضايا
│   │   │   └── adminRouter.ts               # إدارة (أدوار/صلاحيات/مجموعات)
│   │   ├── db/
│   │   │   ├── sharedDb.ts                  # عمليات قاعدة بيانات مشتركة
│   │   │   └── adminDb.ts                   # عمليات الإدارة
│   │   ├── middleware/
│   │   │   ├── rbacRedaction.ts
│   │   │   └── workspaceGuard.ts            # [جديد] حارس مساحة العمل
│   │   └── services/
│   │       ├── emailService.ts
│   │       ├── notificationService.ts
│   │       └── exportService.ts
│   │
│   ├── leaks/                               # مجال الحالات (Backend)
│   │   ├── routers/
│   │   │   ├── leaksRouter.ts               # حالات الرصد
│   │   │   ├── channelsRouter.ts            # قنوات
│   │   │   ├── darkwebRouter.ts             # دارك ويب
│   │   │   ├── pastesRouter.ts              # مواقع لصق
│   │   │   ├── piiRouter.ts                 # تصنيف PII
│   │   │   ├── threatRouter.ts              # تهديدات
│   │   │   ├── osintRouter.ts               # OSINT
│   │   │   ├── evidenceRouter.ts            # أدلة
│   │   │   ├── sellersRouter.ts             # جهات نشر
│   │   │   └── atlasRouter.ts               # أطلس
│   │   ├── db/
│   │   │   └── leaksDb.ts
│   │   └── services/
│   │       ├── leakScanner.ts
│   │       ├── telegramMonitor.ts
│   │       └── darkwebMonitor.ts
│   │
│   ├── privacy/                             # مجال الخصوصية (Backend)
│   │   ├── routers/
│   │   │   ├── sitesRouter.ts               # سجل المواقع
│   │   │   ├── scansRouter.ts               # فحوصات
│   │   │   ├── clausesRouter.ts             # بنود الامتثال
│   │   │   ├── lettersRouter.ts             # رسائل
│   │   │   ├── watchersRouter.ts            # مراقبة
│   │   │   ├── assessmentRouter.ts          # تقييم
│   │   │   ├── dsarRouter.ts                # DSAR
│   │   │   ├── dpiaRouter.ts                # DPIA
│   │   │   ├── consentRouter.ts             # موافقات
│   │   │   └── complianceRouter.ts          # امتثال عام
│   │   ├── db/
│   │   │   └── privacyDb.ts
│   │   └── services/
│   │       ├── privacyScanner.ts            # محرك فحص الخصوصية
│   │       ├── deepScanner.ts               # الفحص العميق
│   │       └── complianceAnalyzer.ts        # محلل الامتثال
│   │
│   └── rasidEnhancements/                   # تحسينات مشتركة
│       ├── ragEngine.ts
│       ├── dashboardBuilder.ts
│       └── ...
│
├── drizzle/
│   ├── schema/
│   │   ├── shared.ts                        # جداول مشتركة
│   │   ├── leaks.ts                         # جداول الحالات
│   │   └── privacy.ts                       # جداول الخصوصية
│   ├── relations.ts
│   └── migrations/
│
└── package.json
```

---

## 5. الخدمات المشتركة (Shared Services)

### 5.1 نظام المصادقة الموحّد

```
المصادقة الموحّدة
├── تسجيل دخول موحّد (صفحة واحدة)
├── اختيار مساحة العمل (leaks / privacy / both)
├── JWT مع claim لمساحة العمل
│   {
│     userId: "...",
│     role: "root_admin",
│     workspace: "leaks" | "privacy" | "both",
│     permissions: [...]
│   }
├── تبديل مساحة العمل دون إعادة تسجيل الدخول
└── جلسة موحّدة عبر المنصتين
```

**التنفيذ:**
- `WorkspaceContext` جديد يحتفظ بالمساحة الحالية
- `WorkspaceSwitcher` مكون في الشريط العلوي للتبديل
- `workspaceGuard` middleware يتحقق من صلاحية الوصول للمساحة

### 5.2 نظام الصلاحيات والأدوار الموحّد

**الأدوار الموحّدة:**
| الدور | الحالات | الخصوصية | الإدارة |
|-------|-----------|----------|---------|
| `root_admin` | كامل | كامل | كامل |
| `director` | كامل | كامل | قراءة |
| `vice_president` | كامل | كامل | محدود |
| `security_analyst` | كامل | لا | لا |
| `privacy_officer` | لا | كامل | لا |
| `monitoring_officer` | محدود | محدود | لا |
| `auditor` | قراءة | قراءة | لا |
| `viewer` | قراءة | قراءة | لا |

### 5.3 لوحة الإدارة الموحّدة

تبقى لوحة الإدارة **كما هي** من rasid-leaks (لأنها الأكثر اكتمالاً) مع إضافات:

```
لوحة الإدارة
├── الأدوار والصلاحيات (موجود — يُوسّع للمساحتين)
├── المجموعات (موجود)
├── أعلام الميزات (موجود — يُضاف filter بالمساحة)
├── السمة والألوان (موجود)
├── القوائم (موجود — تُضاف قوائم الخصوصية)
├── الأمان (موجود)
├── سجل المراجعة (موجود — يُضاف filter بالمساحة)
├── النسخ الاحتياطي (موجود)
├── إدارة المحتوى CMS (موجود)
├── مركز العمليات (موجود)
├── [جديد] إعدادات مساحة العمل
│   ├── تكوين مساحة الحالات
│   └── تكوين مساحة الخصوصية
└── [جديد] لوحة مراقبة موحّدة
    ├── إحصائيات الحالات
    └── إحصائيات الخصوصية
```

### 5.4 الخدمات المشتركة الأخرى

| الخدمة | المصدر | ملاحظات |
|--------|--------|---------|
| الذكاء الاصطناعي (Smart Rasid) | rasid-leaks | يدعم المجالين حالياً بالفعل (domain routing) |
| التقارير | rasid-leaks | يُوسّع بقوالب الخصوصية |
| الإشعارات | rasid-leaks | يُضاف أنواع إشعارات الخصوصية |
| البريد الإلكتروني | rasid-leaks | قوالب جديدة للخصوصية |
| قاعدة المعرفة | rasid-leaks | يُضاف محتوى الخصوصية |
| مركز التدريب | rasid-leaks | يُضاف تدريب الخصوصية |
| القضايا والمتابعات | rasid-leaks | يُستخدم لمتابعات الخصوصية أيضاً |
| المستندات | rasid-leaks | يُستخدم لمستندات الخصوصية |
| التصعيد | rasid-leaks | قواعد تصعيد لكلا المجالين |
| استيراد/تصدير | rasid-leaks | يُدعم استيراد بيانات الخصوصية |

---

## 6. الوظائف المنفصلة لكل منصة

### 6.1 وظائف حصرية لمجال الحالات (Leaks Domain)

هذه الوظائف تظهر **فقط** عند اختيار مساحة عمل "الحالات":

| الوظيفة | الصفحة | المسار |
|---------|--------|--------|
| لوحة رصد الحالات | `LeaksDashboard` | `/leaks/dashboard` |
| حالات الرصد | `Leaks` | `/leaks/incidents` |
| رصد تليجرام | `TelegramMonitor` | `/leaks/telegram` |
| رصد الدارك ويب | `DarkWebMonitor` | `/leaks/darkweb` |
| مواقع اللصق | `PasteSites` | `/leaks/paste-sites` |
| مختبر أنماط PII | `PIIClassifier` | `/leaks/pii-classifier` |
| خريطة التهديدات | `ThreatMap` | `/leaks/threat-map` |
| تحليل جهات النشر | `ThreatActorsAnalysis` | `/leaks/threat-actors` |
| ملفات الناشرين | `SellerProfiles` | `/leaks/seller-profiles` |
| سلسلة الأدلة | `EvidenceChain` | `/leaks/evidence-chain` |
| أدوات OSINT | `OsintTools` | `/leaks/osint-tools` |
| رسم المعرفة | `KnowledgeGraph` | `/leaks/knowledge-graph` |
| أطلس PII | `PIIAtlas` | `/leaks/pii-atlas` |
| تشريح الحالة رصد | `LeakAnatomy` | `/leaks/leak-anatomy` |
| الخط الزمني | `LeakTimeline` | `/leaks/timeline` |
| متتبع الحملات | `CampaignTracker` | `/leaks/campaigns` |
| الرصد المباشر | `LiveScan` | `/leaks/live-scan` |
| استيراد الحالات | `BreachImport` | `/leaks/import` |
| مهام الرصد | `MonitoringJobs` | `/leaks/monitoring-jobs` |
| التحليل الجماعي | `BulkAnalysis` | `/leaks/bulk-analysis` |
| لوحة الحوادث | `IncidentsDashboard` | `/leaks/incidents/dashboard` |
| قائمة الحوادث | `IncidentsList` | `/leaks/incidents/list` |
| تفاصيل الحادثة | `IncidentDetails` | `/leaks/incidents/:id` |
| سجل الحالات | `IncidentsRegistry` | `/leaks/incidents/registry` |
| تحليل الأثر | `ImpactAssessment` | `/leaks/impact-assessment` |
| التحليل الجغرافي | `GeoAnalysis` | `/leaks/geo-analysis` |
| استخبارات المصادر | `SourceIntelligence` | `/leaks/source-intelligence` |
| مقارنة الحالات | `IncidentCompare` | `/leaks/incident-compare` |
| **أطلس البيانات** | `Atlas*` | `/leaks/atlas/*` |

### 6.2 وظائف حصرية لمجال الخصوصية (Privacy Domain)

هذه الوظائف تظهر **فقط** عند اختيار مساحة عمل "الخصوصية":

| الوظيفة | الصفحة | المسار |
|---------|--------|--------|
| لوحة الامتثال الرئيسية | `PrivacyDashboard` | `/privacy/dashboard` |
| سجل المواقع | `PrivacySites` | `/privacy/sites` |
| نتائج الفحص | `PrivacyScans` | `/privacy/scans` |
| تفاصيل البنود الثمانية | `ComplianceClauses` | `/privacy/clauses` |
| رسائل الامتثال | `ComplianceLetters` | `/privacy/letters` |
| تنبيهات تغيير الامتثال | `ComplianceAlerts` | `/privacy/alerts` |
| مراقبة المواقع | `SiteWatchers` | `/privacy/watchers` |
| الفحص الجماعي | `BatchScanning` | `/privacy/batch-scan` |
| مقارنة القطاعات | `SectorComparison` | `/privacy/sector-comparison` |
| اتجاهات الامتثال | `ComplianceTrends` | `/privacy/trends` |
| الفحص المباشر | `PrivacyLiveScan` | `/privacy/live-scan` |
| تقييم الامتثال | `PrivacyAssessment` | `/privacy/assessment` |
| طلبات DSAR | `DSARRequests` | `/privacy/dsar` |
| تقييم الأثر DPIA | `PrivacyImpact` | `/privacy/dpia` |
| إدارة الموافقات | `ConsentManagement` | `/privacy/consent` |
| سجلات المعالجة RoPA | `ProcessingRecords` | `/privacy/processing-records` |
| فحص التطبيقات | `MobileAppsPrivacy` | `/privacy/mobile-apps` |

---

## 7. هيكلة قاعدة البيانات الموحّدة

### 7.1 مبدأ التقسيم

```
قاعدة بيانات واحدة (railway)
├── جداول مشتركة (shared_*)
│   ├── users
│   ├── platformUsers
│   ├── userSessions
│   ├── passwordResetTokens
│   ├── adminRoles
│   ├── adminPermissions
│   ├── adminRolePermissions
│   ├── adminGroups
│   ├── adminGroupMemberships
│   ├── adminGroupPermissions
│   ├── adminUserOverrides
│   ├── adminUserRoles
│   ├── adminFeatureFlags
│   ├── adminAuditLogs
│   ├── adminThemeSettings
│   ├── adminMenus / adminMenuItems
│   ├── notifications
│   ├── activityLogs
│   ├── reports / reportExecutions
│   ├── documents / incidentDocuments
│   ├── cases / caseHistory / caseComments
│   ├── escalationRules / escalationLogs
│   ├── alerts / alertRules / alertHistory
│   ├── emailNotifications / emailNotificationPrefs
│   ├── knowledgeBase
│   ├── aiChatSessions / aiChatMessages
│   ├── platformSettings / systemSettings
│   ├── platformAssets / apiKeys / apiProviders
│   ├── templates / messageTemplates
│   └── ... (كل جدول مشترك يُضاف له عمود workspace_scope)
│
├── جداول الحالات (leaks_*)
│   ├── leaks
│   ├── channels
│   ├── piiScans
│   ├── darkWebListings
│   ├── pasteEntries
│   ├── monitoringJobs
│   ├── sellerProfiles
│   ├── evidenceChain
│   ├── osintQueries
│   ├── threatRules / threatMap
│   ├── knowledgeGraphNodes / knowledgeGraphEdges
│   └── incidentCertifications
│
└── جداول الخصوصية (privacy_*)
    ├── sites
    ├── scans
    ├── complianceAlerts
    ├── complianceChangeNotifications
    ├── siteWatchers
    ├── letters
    ├── savedFilters
    ├── batchScanJobs
    ├── scanSchedules / scheduleExecutions
    ├── bulkAnalysisJobs / bulkAnalysisResults
    ├── deepScanQueue
    ├── changeDetectionLogs
    ├── privacy_assessments     [جديد]
    ├── dsar_requests           [جديد]
    ├── privacy_impact_assessments [جديد]
    ├── consent_records         [جديد]
    ├── processing_records      [جديد]
    └── mobileApps / appScans
```

### 7.2 عمود `workspace_scope`

يُضاف لكل جدول مشترك عمود:
```sql
workspace_scope ENUM('leaks', 'privacy', 'both') DEFAULT 'both'
```

هذا يسمح بـ:
- فلترة البيانات حسب المساحة
- إظهار بيانات مشتركة (مثل الإشعارات العامة)
- منع تسرب البيانات بين المساحتين

---

## 8. هيكلة الصفحات والتنقل الجديدة

### 8.1 شاشة تسجيل الدخول الموحّدة

```
┌──────────────────────────────────────┐
│        منصة رصد الوطنية              │
│         (شعار موحّد)                  │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  اسم المستخدم                │    │
│  └──────────────────────────────┘    │
│  ┌──────────────────────────────┐    │
│  │  كلمة المرور                 │    │
│  └──────────────────────────────┘    │
│                                      │
│  اختر مساحة العمل:                   │
│  ┌─────────┐  ┌─────────────┐       │
│  │ الحالات│  │ الخصوصية    │       │
│  │   🔒    │  │    🛡️       │       │
│  └─────────┘  └─────────────┘       │
│                                      │
│         [ تسجيل الدخول ]             │
└──────────────────────────────────────┘
```

### 8.2 الشريط الجانبي الذكي (Smart Sidebar)

**المبدأ:** الشريط الجانبي يتغير بالكامل حسب مساحة العمل المختارة، مع الاحتفاظ بالعناصر المشتركة في الأسفل.

#### عند اختيار مساحة "الحالات":

```
┌──────────────────────────┐
│   🛡️ رصد الحالات       │
│   [تبديل إلى الخصوصية ←]  │
├──────────────────────────┤
│                          │
│ ◉ الرئيسية               │
│                          │
│ ▸ الرئيسية               │
│   ├ الصفحة الرئيسية       │
│   ├ راصد الذكي            │
│   ├ لوحة القيادة          │
│   └ التوصيات              │
│                          │
│ ▸ لوحات المؤشرات         │
│   ├ خريطة التهديدات       │
│   ├ تحليل القطاعات        │
│   ├ تحليل الأثر           │
│   ├ التحليل الجغرافي      │
│   ├ استخبارات المصادر     │
│   ├ تحليل جهات النشر      │
│   ├ أطلس البيانات الشخصية │
│   └ الخط الزمني           │
│                          │
│ ▸ تشغيل الرصد            │
│   ├ الرصد المباشر         │
│   ├ رصد تليجرام           │
│   ├ رصد الدارك ويب        │
│   ├ مواقع اللصق           │
│   └ مهام الرصد            │
│                          │
│ ▸ إدارة الحالات           │
│   ├ حالات الرصد           │
│   ├ سجل الحالات           │
│   ├ سلسلة الأدلة          │
│   ├ استيراد البيانات       │
│   └ تشريح الحالة رصد         │
│                          │
│ ▸ تحليل متقدم (Atlas)    │
│   ├ نظرة عامة             │
│   ├ سجل الحالات           │
│   ├ أطلس PII             │
│   ├ مختبر الأنماط         │
│   └ اتجاهات              │
│                          │
├──── خدمات مشتركة ─────────┤
│ ▸ التقارير والمتابعات     │
│ ▸ القضايا                 │
│ ▸ المستندات               │
│ ▸ الإشعارات               │
├──── الإدارة ──────────────┤
│ ▸ حساب المستخدم           │
│ ▸ إدارة النظام            │
│ ▸ الإعدادات               │
└──────────────────────────┘
```

#### عند اختيار مساحة "الخصوصية":

```
┌──────────────────────────┐
│   🔍 رصد الخصوصية        │
│   [تبديل إلى الحالات ←] │
├──────────────────────────┤
│                          │
│ ◉ الرئيسية               │
│                          │
│ ▸ الرئيسية               │
│   ├ لوحة الامتثال         │
│   ├ راصد الذكي            │
│   └ التوصيات              │
│                          │
│ ▸ فحص الامتثال           │
│   ├ سجل المواقع          │
│   ├ نتائج الفحص          │
│   ├ الفحص المباشر         │
│   ├ الفحص الجماعي        │
│   └ تفاصيل البنود الثمانية │
│                          │
│ ▸ إدارة الامتثال         │
│   ├ تقييم الامتثال        │
│   ├ رسائل الامتثال        │
│   ├ تنبيهات التغيير       │
│   ├ مراقبة المواقع        │
│   └ اتجاهات الامتثال     │
│                          │
│ ▸ حقوق أصحاب البيانات    │
│   ├ طلبات DSAR           │
│   ├ إدارة الموافقات       │
│   └ سجلات المعالجة (RoPA) │
│                          │
│ ▸ تقييم المخاطر          │
│   ├ تقييم الأثر (DPIA)    │
│   ├ مقارنة القطاعات       │
│   └ فحص التطبيقات         │
│                          │
├──── خدمات مشتركة ─────────┤
│ ▸ التقارير والمتابعات     │
│ ▸ القضايا                 │
│ ▸ المستندات               │
│ ▸ الإشعارات               │
├──── الإدارة ──────────────┤
│ ▸ حساب المستخدم           │
│ ▸ إدارة النظام            │
│ ▸ الإعدادات               │
└──────────────────────────┘
```

### 8.3 الشريط العلوي الموحّد

```
┌────────────────────────────────────────────────────────┐
│ [≡] منصة رصد | الحالات ▼ | 🔍 بحث...  | 🔔 | 👤 | ⚙️ │
└────────────────────────────────────────────────────────┘
```

**المكونات:**
- زر طي/فتح الشريط الجانبي
- اسم المنصة + المساحة الحالية (قابل للنقر للتبديل)
- شريط بحث شامل (Command Palette)
- أيقونة الإشعارات مع عداد
- صورة المستخدم + قائمة منسدلة
- إعدادات سريعة

---

## 9. نظام التوجيه (Routing)

### 9.1 هيكلة المسارات

```typescript
// App.tsx — التوجيه الرئيسي
<Switch>
  {/* صفحات عامة (بدون مصادقة) */}
  <Route path="/login" component={Login} />
  <Route path="/forgot-password" component={ForgotPassword} />
  <Route path="/public-verify" component={PublicVerify} />

  {/* منصة موحّدة (تتطلب مصادقة) */}
  <Route>
    <WorkspaceProvider>
      <DashboardLayout>
        <Switch>
          {/* صفحات مشتركة */}
          <Route path="/" component={Home} />
          <Route path="/smart-rasid" component={SmartRasid} />
          <Route path="/reports" component={Reports} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/members" component={Members} />
          <Route path="/cases" component={Cases} />
          <Route path="/profile" component={Profile} />
          <Route path="/settings" component={Settings} />
          <Route path="/documents-registry" component={DocumentsRegistry} />
          {/* ... باقي الصفحات المشتركة */}

          {/* مسارات الحالات */}
          <Route path="/leaks/*">
            <WorkspaceGuard workspace="leaks">
              <LeaksRouter />
            </WorkspaceGuard>
          </Route>

          {/* مسارات الخصوصية */}
          <Route path="/privacy/*">
            <WorkspaceGuard workspace="privacy">
              <PrivacyRouter />
            </WorkspaceGuard>
          </Route>

          {/* مسارات الإدارة */}
          <Route path="/admin/*">
            <AdminGuard>
              <AdminRouter />
            </AdminGuard>
          </Route>
        </Switch>
      </DashboardLayout>
    </WorkspaceProvider>
  </Route>
</Switch>
```

### 9.2 مكون WorkspaceGuard

```typescript
// يمنع الوصول لصفحات مساحة عمل غير مصرّح بها
function WorkspaceGuard({ workspace, children }) {
  const { currentWorkspace, userWorkspaces } = useWorkspace();

  if (!userWorkspaces.includes(workspace)) {
    return <AccessDenied />;
  }

  // تبديل تلقائي إلى المساحة الصحيحة
  if (currentWorkspace !== workspace) {
    switchWorkspace(workspace);
  }

  return children;
}
```

---

## 10. نظام الصلاحيات الموحّد

### 10.1 نموذج الصلاحيات

```typescript
// هيكلة الصلاحية
interface Permission {
  id: string;
  resource: string;           // "leaks.incidents" | "privacy.sites" | "shared.reports"
  action: string;             // "view" | "create" | "edit" | "delete" | "export"
  workspace: "leaks" | "privacy" | "shared";
  effect: "allow" | "deny";
}
```

### 10.2 مصفوفة الصلاحيات

| المورد | view | create | edit | delete | export |
|--------|------|--------|------|--------|--------|
| **مشترك** | | | | | |
| shared.dashboard | الكل | - | - | - | admin+ |
| shared.reports | analyst+ | analyst+ | analyst+ | admin+ | analyst+ |
| shared.members | admin+ | admin+ | admin+ | root | - |
| shared.notifications | الكل | system | system | admin+ | - |
| shared.cases | analyst+ | analyst+ | analyst+ | admin+ | admin+ |
| shared.documents | analyst+ | analyst+ | analyst+ | admin+ | analyst+ |
| shared.ai | الكل | - | admin+ | - | - |
| shared.admin.* | root | root | root | root | root |
| **الحالات** | | | | | |
| leaks.incidents | analyst+ | analyst+ | analyst+ | admin+ | analyst+ |
| leaks.telegram | analyst+ | admin+ | admin+ | admin+ | analyst+ |
| leaks.darkweb | analyst+ | admin+ | admin+ | admin+ | analyst+ |
| leaks.evidence | analyst+ | analyst+ | analyst+ | admin+ | admin+ |
| leaks.osint | analyst+ | analyst+ | - | - | analyst+ |
| leaks.atlas | الكل | - | - | - | analyst+ |
| **الخصوصية** | | | | | |
| privacy.sites | officer+ | officer+ | officer+ | admin+ | officer+ |
| privacy.scans | officer+ | officer+ | - | admin+ | officer+ |
| privacy.letters | officer+ | officer+ | officer+ | admin+ | officer+ |
| privacy.assessment | officer+ | officer+ | officer+ | admin+ | officer+ |
| privacy.dsar | officer+ | officer+ | officer+ | admin+ | officer+ |
| privacy.dpia | officer+ | officer+ | officer+ | admin+ | officer+ |

---

## 11. خطة التنفيذ المرحلية

### المرحلة 0: التحضير (الأسبوع 1)

| # | المهمة | الوصف | الأولوية |
|---|--------|-------|----------|
| 0.1 | إصلاح أخطاء TypeScript | إصلاح الأخطاء الحرجة في schema.ts (التكرارات) | P0 |
| 0.2 | تثبيت الاختبارات | ضمان عمل `npm test` و `npm run check` | P0 |
| 0.3 | إنشاء branch الدمج | `claude/merge-websites-shared-services-d6kMJ` | P0 |
| 0.4 | توثيق الوظائف الحالية | جرد كامل لكل وظيفة في كلا المنصتين | P0 |

### المرحلة 1: البنية التحتية المشتركة (الأسبوعان 2-3)

| # | المهمة | الوصف | الأولوية |
|---|--------|-------|----------|
| 1.1 | إنشاء `WorkspaceContext` | سياق React لإدارة مساحة العمل الحالية | P0 |
| 1.2 | إنشاء `workspaceGuard` middleware | حماية API endpoints حسب المساحة | P0 |
| 1.3 | تحديث نظام المصادقة | إضافة workspace claim للـ JWT | P0 |
| 1.4 | تحديث صفحة تسجيل الدخول | إضافة اختيار مساحة العمل | P0 |
| 1.5 | إعادة هيكلة مجلدات المشروع | فصل `client/src` إلى core + leaks + privacy | P1 |
| 1.6 | فصل schema.ts | تقسيم إلى shared.ts + leaks.ts + privacy.ts | P1 |
| 1.7 | إنشاء `WorkspaceSwitcher` | مكون التبديل بين المساحات | P1 |

### المرحلة 2: دمج الخصوصية (الأسابيع 3-5)

| # | المهمة | الوصف | الأولوية |
|---|--------|-------|----------|
| 2.1 | نقل صفحات الخصوصية | نقل جميع صفحات rasid-privacy إلى `client/src/privacy/` | P0 |
| 2.2 | نقل routers الخصوصية | نقل API endpoints إلى `server/privacy/` | P0 |
| 2.3 | نقل خدمات الخصوصية | نقل scanWorker + deepScanner + complianceAnalyzer | P0 |
| 2.4 | ترحيل جداول الخصوصية | ترحيل بيانات قاعدة بيانات الخصوصية | P0 |
| 2.5 | إنشاء صفحات DSAR | بناء واجهة إدارة طلبات حقوق البيانات | P1 |
| 2.6 | إنشاء صفحة DPIA | بناء واجهة تقييم الأثر | P1 |
| 2.7 | إنشاء صفحة الموافقات | بناء واجهة إدارة الموافقات | P1 |
| 2.8 | إنشاء صفحة RoPA | بناء واجهة سجلات المعالجة | P1 |
| 2.9 | تكامل AI الخصوصية | ربط أدوات AI الخاصة بالخصوصية | P1 |

### المرحلة 3: إعادة هيكلة التنقل (الأسبوعان 5-6)

| # | المهمة | الوصف | الأولوية |
|---|--------|-------|----------|
| 3.1 | إعادة بناء Sidebar | شريط جانبي ذكي يتغير حسب المساحة | P0 |
| 3.2 | إعادة بناء TopBar | شريط علوي مع WorkspaceSwitcher | P0 |
| 3.3 | تحديث نظام التوجيه | مسارات `/leaks/*` و `/privacy/*` والمشتركة | P0 |
| 3.4 | إعادة تصميم الصفحة الرئيسية | صفحة رئيسية موحّدة مع ملخص المساحتين | P1 |
| 3.5 | تحديث Command Palette | بحث يراعي المساحة الحالية | P1 |
| 3.6 | تحسين Responsive Design | تجاوب مع الأجهزة المحمولة | P2 |

### المرحلة 4: توحيد الخدمات (الأسبوعان 6-7)

| # | المهمة | الوصف | الأولوية |
|---|--------|-------|----------|
| 4.1 | توحيد التقارير | قوالب تقارير مشتركة + خاصة بكل مساحة | P1 |
| 4.2 | توحيد الإشعارات | أنواع إشعارات جديدة للخصوصية | P1 |
| 4.3 | توحيد القضايا | ربط القضايا بالمساحة المناسبة | P1 |
| 4.4 | توحيد المستندات | تصنيف المستندات حسب المساحة | P1 |
| 4.5 | توحيد التصعيد | قواعد تصعيد لكلا المساحتين | P2 |
| 4.6 | توحيد التصدير | تصدير بيانات الخصوصية (PDF/Excel/PPT) | P2 |

### المرحلة 5: لوحة الإدارة الموسّعة (الأسبوع 7-8)

| # | المهمة | الوصف | الأولوية |
|---|--------|-------|----------|
| 5.1 | توسيع الأدوار | إضافة أدوار privacy_officer وauditor | P1 |
| 5.2 | توسيع الصلاحيات | صلاحيات جديدة لمجال الخصوصية | P1 |
| 5.3 | توسيع Feature Flags | أعلام ميزات حسب المساحة | P2 |
| 5.4 | توسيع سجل المراجعة | فلترة حسب المساحة | P2 |
| 5.5 | لوحة مراقبة موحّدة | إحصائيات المساحتين في مكان واحد | P2 |

### المرحلة 6: الاختبار والتسليم (الأسبوعان 8-9)

| # | المهمة | الوصف | الأولوية |
|---|--------|-------|----------|
| 6.1 | اختبارات تكامل - الحالات | التحقق من كل وظائف الحالات | P0 |
| 6.2 | اختبارات تكامل - الخصوصية | التحقق من كل وظائف الخصوصية | P0 |
| 6.3 | اختبارات العزل | التأكد من عدم تسرب البيانات بين المساحات | P0 |
| 6.4 | اختبارات الأداء | التحقق من عدم تأثر الأداء | P1 |
| 6.5 | اختبارات الصلاحيات | التأكد من عمل نظام الصلاحيات بشكل صحيح | P0 |
| 6.6 | ترحيل البيانات | نقل بيانات الإنتاج وتحقق السلامة | P0 |
| 6.7 | نشر تجريبي (Staging) | نشر على بيئة اختبار | P0 |
| 6.8 | نشر إنتاجي | نشر المنصة الموحّدة | P0 |

---

## 12. جدول التحقق من الوظائف

### 12.1 وظائف الحالات — لا تفقد أي وظيفة

| # | الوظيفة | الصفحة الحالية | المسار الجديد | الحالة |
|---|---------|---------------|--------------|--------|
| L1 | الصفحة الرئيسية | `Home` | `/` → يتحول حسب المساحة | ☐ |
| L2 | حالات الرصد | `Leaks` | `/leaks/incidents` | ☐ |
| L3 | رصد تليجرام | `TelegramMonitor` | `/leaks/telegram` | ☐ |
| L4 | رصد الدارك ويب | `DarkWebMonitor` | `/leaks/darkweb` | ☐ |
| L5 | مواقع اللصق | `PasteSites` | `/leaks/paste-sites` | ☐ |
| L6 | مختبر PII | `PIIClassifier` | `/leaks/pii-classifier` | ☐ |
| L7 | خريطة التهديدات | `ThreatMap` | `/leaks/threat-map` | ☐ |
| L8 | تحليل جهات النشر | `ThreatActorsAnalysis` | `/leaks/threat-actors` | ☐ |
| L9 | ملفات الناشرين | `SellerProfiles` | `/leaks/seller-profiles` | ☐ |
| L10 | سلسلة الأدلة | `EvidenceChain` | `/leaks/evidence-chain` | ☐ |
| L11 | أدوات OSINT | `OsintTools` | `/leaks/osint-tools` | ☐ |
| L12 | رسم المعرفة | `KnowledgeGraph` | `/leaks/knowledge-graph` | ☐ |
| L13 | أطلس PII | `PIIAtlas` | `/leaks/pii-atlas` | ☐ |
| L14 | تشريح الحالة رصد | `LeakAnatomy` | `/leaks/leak-anatomy` | ☐ |
| L15 | الخط الزمني | `LeakTimeline` | `/leaks/timeline` | ☐ |
| L16 | متتبع الحملات | `CampaignTracker` | `/leaks/campaigns` | ☐ |
| L17 | الرصد المباشر | `LiveScan` | `/leaks/live-scan` | ☐ |
| L18 | استيراد الحالات | `BreachImport` | `/leaks/import` | ☐ |
| L19 | مهام الرصد | `MonitoringJobs` | `/leaks/monitoring-jobs` | ☐ |
| L20 | التحليل الجماعي | `BulkAnalysis` | `/leaks/bulk-analysis` | ☐ |
| L21 | لوحة الحوادث | `IncidentsDashboard` | `/leaks/incidents/dashboard` | ☐ |
| L22 | قائمة الحوادث | `IncidentsList` | `/leaks/incidents/list` | ☐ |
| L23 | تفاصيل الحادثة | `IncidentDetails` | `/leaks/incidents/:id` | ☐ |
| L24 | سجل الحالات | `IncidentsRegistry` | `/leaks/incidents/registry` | ☐ |
| L25 | تحليل الأثر | `ImpactAssessment` | `/leaks/impact-assessment` | ☐ |
| L26 | التحليل الجغرافي | `GeoAnalysis` | `/leaks/geo-analysis` | ☐ |
| L27 | استخبارات المصادر | `SourceIntelligence` | `/leaks/source-intelligence` | ☐ |
| L28 | مقارنة الحالات | `IncidentCompare` | `/leaks/incident-compare` | ☐ |
| L29 | لوحة القيادة | `Dashboard` | `/leaks/national-overview` | ☐ |
| L30 | تحليل القطاعات | `SectorAnalysis` | `/leaks/sector-analysis` | ☐ |
| L31 | أطلس - نظرة عامة | `AtlasNationalOverview` | `/leaks/atlas/overview` | ☐ |
| L32 | أطلس - سجل الحالات | `AtlasIncidentRegistry` | `/leaks/atlas/incidents` | ☐ |
| L33 | أطلس - PII | `AtlasPiiAtlas` | `/leaks/atlas/pii-atlas` | ☐ |
| L34 | أطلس - الأنماط | `AtlasPatternLab` | `/leaks/atlas/pattern-lab` | ☐ |
| L35 | أطلس - الأثر | `AtlasImpactLens` | `/leaks/atlas/impact-lens` | ☐ |
| L36 | أطلس - الاتجاهات | `AtlasTrendsComparison` | `/leaks/atlas/trends` | ☐ |
| L37 | أطلس - التقارير | `AtlasReportsCenter` | `/leaks/atlas/reports` | ☐ |

### 12.2 وظائف الخصوصية — لا تفقد أي وظيفة

| # | الوظيفة | المسار الجديد | الحالة |
|---|---------|--------------|--------|
| P1 | لوحة الامتثال الرئيسية | `/privacy/dashboard` | ☐ |
| P2 | سجل المواقع | `/privacy/sites` | ☐ |
| P3 | نتائج الفحص | `/privacy/scans` | ☐ |
| P4 | تفاصيل البنود الثمانية | `/privacy/clauses` | ☐ |
| P5 | رسائل الامتثال | `/privacy/letters` | ☐ |
| P6 | تنبيهات تغيير الامتثال | `/privacy/alerts` | ☐ |
| P7 | مراقبة المواقع | `/privacy/watchers` | ☐ |
| P8 | الفحص الجماعي | `/privacy/batch-scan` | ☐ |
| P9 | مقارنة القطاعات | `/privacy/sector-comparison` | ☐ |
| P10 | اتجاهات الامتثال | `/privacy/trends` | ☐ |
| P11 | الفحص المباشر | `/privacy/live-scan` | ☐ |
| P12 | تقييم الامتثال (PDPL/GDPR/ISO) | `/privacy/assessment` | ☐ |
| P13 | طلبات DSAR | `/privacy/dsar` | ☐ |
| P14 | تقييم الأثر DPIA | `/privacy/dpia` | ☐ |
| P15 | إدارة الموافقات | `/privacy/consent` | ☐ |
| P16 | سجلات المعالجة RoPA | `/privacy/processing-records` | ☐ |
| P17 | فحص تطبيقات الجوال | `/privacy/mobile-apps` | ☐ |

### 12.3 الخدمات المشتركة — لا تفقد أي وظيفة

| # | الخدمة | المسار | من | الحالة |
|---|--------|--------|-----|--------|
| S1 | تسجيل الدخول | `/login` | leaks | ☐ |
| S2 | الملف الشخصي | `/profile` | leaks | ☐ |
| S3 | الإعدادات | `/settings` | leaks | ☐ |
| S4 | الأعضاء | `/members` | leaks | ☐ |
| S5 | الإشعارات | `/notifications` | leaks | ☐ |
| S6 | التقارير | `/reports` | leaks | ☐ |
| S7 | راصد الذكي (AI) | `/smart-rasid` | leaks | ☐ |
| S8 | القضايا | `/cases` | leaks | ☐ |
| S9 | المتابعات | `/followups` | leaks | ☐ |
| S10 | المستندات | `/documents-registry` | leaks | ☐ |
| S11 | تصدير البيانات | `/export-data` | leaks | ☐ |
| S12 | إدارة المستخدمين | `/user-management` | leaks | ☐ |
| S13 | سجل المراجعة | `/audit-log` | leaks | ☐ |
| S14 | سجل النشاطات | `/activity-logs` | leaks | ☐ |
| S15 | قاعدة المعرفة | `/knowledge-base` | leaks | ☐ |
| S16 | مركز التدريب | `/training-center` | leaks | ☐ |
| S17 | إدارة البريد | `/email-management` | leaks | ☐ |
| S18 | قوالب الرسائل | `/message-templates` | leaks | ☐ |
| S19 | قواعد التصعيد | `/escalation` | leaks | ☐ |
| S20 | صحة النظام | `/system-health` | leaks | ☐ |
| S21 | مفاتيح API | `/api-keys` | leaks | ☐ |
| S22 | تحليلات الاستخدام | `/usage-analytics` | leaks | ☐ |
| S23 | العقود | `/contracts` | leaks | ☐ |
| S24 | الفريق | `/team` | leaks | ☐ |
| S25-S37 | لوحة الإدارة (13 صفحة) | `/admin/*` | leaks | ☐ |

---

## 13. المخاطر وخطة التخفيف

| # | المخاطر | الاحتمال | الأثر | خطة التخفيف |
|---|---------|----------|-------|------------|
| R1 | فقدان وظائف أثناء الدمج | متوسط | عالي | جدول التحقق المفصّل (القسم 12) + اختبارات تكامل لكل وظيفة |
| R2 | تعارض في قاعدة البيانات | متوسط | عالي | ترحيل تدريجي مع نسخ احتياطية + فصل الجداول بالبادئات |
| R3 | تدهور الأداء | منخفض | متوسط | Lazy loading + code splitting حسب المساحة |
| R4 | تسرب بيانات بين المساحات | منخفض | عالي | `workspaceGuard` + اختبارات عزل + مراجعة أمنية |
| R5 | تعقيد نظام الصلاحيات | متوسط | متوسط | تصميم بسيط + توثيق واضح + مصفوفة صلاحيات |
| R6 | مشاكل في ترحيل البيانات | متوسط | عالي | سكربتات ترحيل مختبرة + تشغيل على بيئة staging أولاً |
| R7 | عدم توفر كود rasid-privacy | عالي | عالي | البناء من الصفر مع الاستفادة من المواصفات والوثائق المتاحة |

---

## ملاحظات هامة

### بخصوص منصة رصد الخصوصية (rasid-privacy)
- لم يتم الوصول المباشر لكود المشروع (المستودع خاص)
- التحليل مبني على:
  1. **الوثائق والمواصفات** الموجودة في rasid-leaks (specs/ + docs/)
  2. **أدوات AI** المعرّفة في `rasidAI.ts` الخاصة بالخصوصية
  3. **بيانات التحليل** في `privacy_analysis/` (6,246 نطاق)
  4. **قاعدة البيانات** (جداول sites, scans, complianceAlerts, إلخ)
  5. **تقرير التدقيق** (`platform-audit-dual-analysis-ar.md`)
- **يُنصح بشدة** بالوصول لكود rasid-privacy لاستكمال التحليل وضمان عدم فقدان أي وظيفة

### بخصوص منصة رصد الحالات (rasid-leaks)
- المنصة هي **الأساس** للمشروع الموحّد (تحتوي على البنية التحتية الكاملة)
- نظام الإدارة الكامل (لوحات تحكم، أدوار، صلاحيات) يأتي منها
- نظام الذكاء الاصطناعي يدعم المجالين بالفعل (domain routing موجود)
- العديد من وظائف الخصوصية **موجودة جزئياً** بالفعل في الكود

---

*هذه الخطة قابلة للتحديث والتعديل حسب المتطلبات. يُرجى مراجعتها والتعليق قبل البدء بالتنفيذ.*

```

---

## `NAMING_POLICY_ENFORCEMENT_REPORT.md`

```markdown
# تقرير تطبيق سياسة التسمية الإلزامية — منصة راصد

**التاريخ:** 26 فبراير 2026  
**الكوميت:** `2d1f7bd`  
**الفرع:** `main`

---

## ملخص التنفيذ

تم تطبيق سياسة التسمية الإلزامية بالكامل على جميع مستويات المنصة (واجهة المستخدم، الخادم، قاعدة البيانات، التقارير، راصد الذكي).

## جدول المصطلحات المستبدلة

| المصطلح القديم | المصطلح المعتمد | النطاق |
|---|---|---|
| حادثة / حادثة تسرب | حالة رصد | كل الملفات |
| حوادث | حالات رصد | كل الملفات |
| تسرب / تسريب بيانات | حالة رصد | واجهة المستخدم |
| عدد السجلات / السجلات المسربة | العدد المدعى | واجهة المستخدم والتقارير |
| البيانات المسربة / السجلات المكشوفة | العينات المتاحة | واجهة المستخدم والتقارير |

## تسميات الحالات (Status Labels)

| القيمة في DB | التسمية القديمة | التسمية المعتمدة |
|---|---|---|
| `new` | جديد / جديدة | **حالة رصد** |
| `analyzing` | قيد التحليل | **قيد التحقق** |
| `documented` | موثّق / تم التوثيق | **تسرب مؤكد** |
| `reported` | مكتمل / تم الإبلاغ | **مغلق** |

## الملفات المعدّلة (35 ملف)

### واجهة المستخدم (Client)
| الملف | التعديلات |
|---|---|
| `Dashboard.tsx` (نسختان) | إضافة KPI "العينات المتاحة" + تحديث تسميات الحالات |
| `Leaks.tsx` (نسختان) | استبدال تسميات الحالات في الفلاتر والجداول |
| `IncidentsDashboard.tsx` (نسختان) | استبدال المصطلحات القديمة |
| `BreachDashboardsHub.tsx` (نسختان) | تحديث العناوين والتسميات |
| `BreachOperationsHub.tsx` (نسختان) | تحديث المصطلحات |
| `BreachImport.tsx` (نسختان) | تحديث تسميات الاستيراد |
| `PasteSites.tsx` (نسختان) | تحديث المصطلحات |
| `ThreatRules.tsx` (نسختان) | تحديث المصطلحات |
| `DeepDrillDown.tsx` | تحديث التسميات |
| `LeakDetailDrilldown.tsx` | تحديث التسميات |
| `ReportCustomizer.tsx` | تحديث رأس الجدول |
| `IncidentPanel.tsx` | تحديث المصطلحات |
| `AdminControlPanel.tsx` | تحديث المصطلحات |
| `FollowupsList.tsx` | تحديث المصطلحات |
| `Overview.tsx` | تحديث المصطلحات |
| `FormattedAIResponse.tsx` | **ملف جديد** — مكون عرض ردود الذكاء الاصطناعي مع شريط الموافقة |

### الخادم (Server)
| الملف | التعديلات |
|---|---|
| `routers.ts` | تحديث تسميات الإشعارات + إضافة `totalAvailableSamples` في API |
| `documentService.ts` | تحديث `statusLabels` |
| `pdfService.ts` | تحديث `statusLabels` |
| `importEngine.ts` | إضافة المصطلحات المعتمدة مع التوافق العكسي |
| `reportScheduler.ts` | تحديث "قيد التحليل" → "قيد التحقق" |
| `rasidAI.ts` | إضافة قاعدة التصحيح التلقائي + عزل المجالات |
| `scanEngine.ts` | تحديث المصطلحات |
| `adminSeed.ts` | تحديث المصطلحات |

### مشترك (Shared)
| الملف | التعديلات |
|---|---|
| `NAMING_POLICY.ts` | تحديث `STATUS_LABELS` و `FORBIDDEN_TERMS` |

### قاعدة البيانات (Schema)
| الملف | التعديلات |
|---|---|
| `drizzle/schema.ts` | إضافة جدولي `ai_domain_conversations` و `ai_domain_feedback` |

## نتائج الاختبارات

| مجموعة الاختبارات | النتيجة | التفاصيل |
|---|---|---|
| t01-naming-policy | **10/10 ناجح** | جميع اختبارات سياسة التسمية |
| t06-chat-navigation | **9/9 ناجح** | اختبارات التنقل والموافقة |
| t12-tools-security | **13/13 ناجح** | اختبارات عزل المجال والأمان |
| **الإجمالي** | **82/84 ناجح (97.6%)** | الفشلان المتبقيان: مشاكل بنية تحتية قديمة (DB) |

## بناء المشروع

| العملية | النتيجة |
|---|---|
| Vite Build | **ناجح** (44.85 ثانية) |
| Git Push | **ناجح** → `origin/main` |

## التوافق العكسي

تم الحفاظ على التوافق العكسي في `importEngine.ts` بحيث يمكن استيراد ملفات تستخدم المصطلحات القديمة (جديد، قيد التحليل، موثّق، تم التوثيق) بالإضافة إلى المصطلحات المعتمدة الجديدة.

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
- `docs/core/LEAKAGE_MONITORING_PLATFORM_STRUCTURE.md`: الهيكل الوظيفي والتقني لمنصة رصد حالات الحالة رصد.
- `docs/core/PLATFORM_PAGE_FUNCTIONS_MATRIX.md`: وظائف كل صفحة في كل منصة بشكل مصفوفة واضحة.

```

---

## `REBUILD_PLAN.md`

```markdown
# خطة إعادة بناء منصة راصد — نهج الـ Toolkit

**التاريخ:** 26 فبراير 2026
**الهدف:** إعادة بناء المنصة بنهج Toolkit احترافي مع الحفاظ على كل الكود الحالي

---

## المبدأ الأساسي

> بناء **Rasid Toolkit** يحتوي على 60% من القدرات المشتركة بين المواقع،
> ثم استخدام هذا الـ Toolkit لبناء كل موقع (Leaks, Privacy, Atlas, وأي موقع مستقبلي).

---

## 1. الهيكل الجديد (Monorepo)

```
rasid-platform/
│
├── packages/                          # ← الـ TOOLKIT
│   ├── @rasid/ui/                     # مكونات UI المشتركة (53 shadcn + مكونات مخصصة)
│   │   ├── primitives/                # Button, Input, Select, Dialog, Sheet...
│   │   ├── data-display/              # Table, Card, Badge, Chart, KPI...
│   │   ├── feedback/                  # Toast, Alert, Progress, Skeleton...
│   │   ├── navigation/               # Sidebar, Breadcrumb, CommandPalette, Tabs...
│   │   ├── overlays/                  # Modal, Drawer, Popover, ContextMenu...
│   │   ├── forms/                     # Form, Field, FileUpload, DatePicker...
│   │   └── layout/                    # DashboardLayout, PageHeader, EmptyState...
│   │
│   ├── @rasid/hooks/                  # React Hooks المشتركة
│   │   ├── useAuth.ts                 # مصادقة + صلاحيات
│   │   ├── useMobile.ts              # كشف الجوال
│   │   ├── useWebSocket.ts           # اتصال مباشر
│   │   ├── usePermission.ts          # نظام صلاحيات
│   │   ├── useTheme.ts               # التحكم بالثيم
│   │   ├── usePWA.ts                 # دعم PWA
│   │   ├── useExport.ts              # تصدير PDF/Excel/PPTX
│   │   ├── useAutoScroll.ts
│   │   └── useSpeechRecognition.ts
│   │
│   ├── @rasid/contexts/               # React Contexts المشتركة
│   │   ├── ThemeContext.tsx            # الثيم (فاتح/غامق + ألوان)
│   │   ├── AuthContext.tsx             # المصادقة
│   │   ├── WorkspaceContext.tsx        # إدارة المنصات
│   │   ├── FilterContext.tsx           # الفلاتر
│   │   ├── SettingsContext.tsx         # إعدادات المنصة
│   │   └── GuideContext.tsx            # الدليل التفاعلي
│   │
│   ├── @rasid/api/                     # طبقة API المشتركة
│   │   ├── trpc-client.ts             # إعداد tRPC client
│   │   ├── query-client.ts            # إعداد React Query
│   │   ├── api-provider.tsx           # Provider مشترك
│   │   └── types/                     # أنواع API المشتركة
│   │
│   ├── @rasid/server-core/             # نواة الخادم المشتركة
│   │   ├── express.ts                 # إعداد Express
│   │   ├── trpc.ts                    # إعداد tRPC server
│   │   ├── auth/                      # JWT + OAuth + sessions
│   │   │   ├── jwt.ts
│   │   │   ├── oauth.ts
│   │   │   ├── middleware.ts
│   │   │   └── rbac.ts               # نظام الصلاحيات
│   │   ├── email/                     # نظام البريد
│   │   ├── export/                    # تصدير PDF + Excel + PPTX
│   │   │   ├── pdfService.ts
│   │   │   ├── excelService.ts
│   │   │   └── pptxService.ts
│   │   ├── scheduler/                 # المهام المجدولة
│   │   ├── storage/                   # AWS S3 + ملفات
│   │   ├── logger/                    # نظام سجلات احترافي (بديل console.log)
│   │   └── health/                    # فحص صحة النظام
│   │
│   ├── @rasid/db/                      # طبقة قاعدة البيانات المشتركة
│   │   ├── connection.ts              # اتصال MySQL
│   │   ├── migrate.ts                 # أداة الـ migrations
│   │   ├── schema/                    # Schema مقسم
│   │   │   ├── auth.ts                # جداول المصادقة (users, sessions, roles...)
│   │   │   ├── admin.ts               # جداول الإدارة
│   │   │   ├── notifications.ts       # جداول الإشعارات
│   │   │   ├── documents.ts           # جداول المستندات
│   │   │   ├── audit.ts               # جداول التدقيق
│   │   │   └── index.ts              # تصدير موحد
│   │   └── relations/                 # العلاقات (Foreign Keys)
│   │       ├── auth.ts
│   │       └── index.ts
│   │
│   ├── @rasid/ai/                      # نظام الذكاء الاصطناعي
│   │   ├── chat/                      # المحادثة
│   │   ├── rag/                       # RAG (استرجاع + توليد)
│   │   ├── tools/                     # أدوات AI
│   │   ├── streaming/                 # SSE streaming
│   │   └── enhancements/             # محركات التعلم والتوصيات
│   │
│   ├── @rasid/types/                   # الأنواع المشتركة
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   ├── workspace.ts
│   │   ├── common.ts
│   │   └── index.ts
│   │
│   └── @rasid/config/                  # إعدادات مشتركة
│       ├── tailwind.config.ts         # ثيم Tailwind الموحد
│       ├── vite.config.ts             # إعداد Vite الأساسي
│       ├── tsconfig.base.json         # TypeScript الأساسي
│       └── prettier.config.js
│
├── apps/                              # ← التطبيقات (تستخدم الـ Toolkit)
│   │
│   ├── leaks/                         # 🔴 منصة رصد التسريبات
│   │   ├── client/
│   │   │   ├── pages/                 # صفحات خاصة بالتسريبات فقط
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── IncidentsList.tsx
│   │   │   │   ├── LiveScan.tsx
│   │   │   │   ├── TelegramMonitor.tsx
│   │   │   │   ├── DarkWebMonitor.tsx
│   │   │   │   ├── ThreatMap.tsx
│   │   │   │   ├── EvidenceChain.tsx
│   │   │   │   └── ... (36 صفحة)
│   │   │   ├── components/            # مكونات خاصة بالتسريبات
│   │   │   ├── hooks/                 # hooks خاصة
│   │   │   ├── routes.tsx             # routes خاصة
│   │   │   └── app.tsx
│   │   ├── server/
│   │   │   ├── routers/               # API خاصة بالتسريبات
│   │   │   │   ├── incidents.ts
│   │   │   │   ├── monitoring.ts
│   │   │   │   ├── threats.ts
│   │   │   │   ├── evidence.ts
│   │   │   │   ├── osint.ts
│   │   │   │   └── scanner.ts
│   │   │   ├── db/                    # عمليات DB خاصة
│   │   │   └── schema/                # جداول خاصة بالتسريبات
│   │   │       ├── incidents.ts
│   │   │       ├── evidence.ts
│   │   │       ├── threats.ts
│   │   │       └── monitoring.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   ├── privacy/                       # 🟢 منصة الخصوصية
│   │   ├── client/
│   │   │   ├── pages/                 # صفحات خاصة بالخصوصية
│   │   │   │   ├── PrivacyDashboard.tsx
│   │   │   │   ├── PrivacySites.tsx
│   │   │   │   ├── ComplianceClauses.tsx
│   │   │   │   ├── DSARRequests.tsx
│   │   │   │   ├── ConsentManagement.tsx
│   │   │   │   └── ... (18 صفحة)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── routes.tsx
│   │   │   └── app.tsx
│   │   ├── server/
│   │   │   ├── routers/
│   │   │   │   ├── sites.ts
│   │   │   │   ├── scans.ts
│   │   │   │   ├── compliance.ts
│   │   │   │   ├── dsar.ts
│   │   │   │   └── consent.ts
│   │   │   ├── db/
│   │   │   └── schema/
│   │   │       ├── sites.ts
│   │   │       ├── scans.ts
│   │   │       └── compliance.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   │
│   └── atlas/                         # 🔵 منصة Atlas (لاحقاً)
│       └── ...
│
├── pnpm-workspace.yaml                # تعريف الـ monorepo
├── turbo.json                         # Turborepo للبناء المتوازي
├── package.json                       # root package
├── tsconfig.json
└── .github/workflows/
    ├── ci.yml                         # اختبار + بناء تلقائي
    └── deploy.yml                     # نشر تلقائي
```

---

## 2. ماذا يذهب أين؟ (خريطة النقل)

### الكود المشترك → `packages/` (الـ Toolkit)

| الملف/المجلد الحالي | الوجهة الجديدة | الحالة |
|---|---|---|
| `client/src/components/ui/*` (53 ملف) | `@rasid/ui/primitives/` | نقل مباشر |
| `client/src/components/DashboardLayout.tsx` | `@rasid/ui/layout/DashboardLayout.tsx` | نقل + تقسيم |
| `client/src/components/ErrorBoundary.tsx` | `@rasid/ui/feedback/ErrorBoundary.tsx` | نقل |
| `client/src/components/CommandPalette.tsx` | `@rasid/ui/navigation/CommandPalette.tsx` | نقل |
| `client/src/components/ExportCenter.tsx` | `@rasid/ui/data-display/ExportCenter.tsx` | نقل |
| `client/src/components/GlobalFilterBar.tsx` | `@rasid/ui/navigation/GlobalFilterBar.tsx` | نقل |
| `client/src/contexts/ThemeContext.tsx` | `@rasid/contexts/ThemeContext.tsx` | نقل |
| `client/src/contexts/FilterContext.tsx` | `@rasid/contexts/FilterContext.tsx` | نقل |
| `client/src/contexts/PlatformSettingsContext.tsx` | `@rasid/contexts/SettingsContext.tsx` | نقل |
| `client/src/_core/hooks/useAuth.ts` | `@rasid/hooks/useAuth.ts` | نقل |
| `client/src/hooks/useMobile.tsx` | `@rasid/hooks/useMobile.ts` | نقل |
| `client/src/hooks/useWebSocket.ts` | `@rasid/hooks/useWebSocket.ts` | نقل |
| `client/src/hooks/usePermission.ts` | `@rasid/hooks/usePermission.ts` | نقل |
| `server/_core/*` | `@rasid/server-core/` | نقل + إعادة هيكلة |
| `server/pdfService.ts` | `@rasid/server-core/export/pdfService.ts` | نقل |
| `server/exportEngine.ts` | `@rasid/server-core/export/exportEngine.ts` | نقل |
| `server/email.ts` | `@rasid/server-core/email/` | نقل |
| `server/scheduler.ts` | `@rasid/server-core/scheduler/` | نقل |
| `server/rasidAI.ts` (4,586 سطر) | `@rasid/ai/` | نقل + تقسيم |
| `server/rasidEnhancements/*` | `@rasid/ai/enhancements/` | نقل |
| `shared/types.ts` | `@rasid/types/` | نقل + توسيع |
| `shared/NAMING_POLICY.ts` | `@rasid/types/naming.ts` | نقل |
| `client/src/index.css` | `@rasid/config/styles/` | نقل |

### الكود الخاص → `apps/`

| الملف الحالي | الوجهة | الملاحظة |
|---|---|---|
| `client/src/leaks/pages/*` (44 ملف) | `apps/leaks/client/pages/` | نقل مباشر |
| `client/src/privacy/pages/*` (18 ملف) | `apps/privacy/client/pages/` | نقل مباشر |
| `client/src/pages/*` (120 ملف) | تقسيم: مشترك → toolkit، خاص → apps | فرز |
| `server/routers.ts` (10K سطر) | تقسيم → `apps/*/server/routers/` | إعادة هيكلة |
| `server/db.ts` (7K سطر) | تقسيم → `apps/*/server/db/` | إعادة هيكلة |
| `drizzle/schema.ts` (3K سطر) | تقسيم → `packages/db/schema/` + `apps/*/server/schema/` | إعادة هيكلة |

### الصفحات المكررة (36 ملف) → حذف النسخ وتوحيد

| الملف | القرار |
|---|---|
| `pages/Dashboard.tsx` = `leaks/pages/Dashboard.tsx` | الاحتفاظ بواحد في `apps/leaks/` |
| `pages/Leaks.tsx` = `leaks/pages/Leaks.tsx` | الاحتفاظ بواحد في `apps/leaks/` |
| `pages/LiveScan.tsx` = `leaks/pages/LiveScan.tsx` | الاحتفاظ بواحد في `apps/leaks/` |
| ... (33 ملف آخر) | نفس المبدأ |

---

## 3. تقسيم `server/routers.ts` (10,424 سطر)

```
المنطقة الحالية في routers.ts        → الوجهة الجديدة
─────────────────────────────────────────────────────
Auth procedures (login, register...)   → @rasid/server-core/auth/router.ts
User management                        → @rasid/server-core/auth/usersRouter.ts
File upload/download                   → @rasid/server-core/storage/router.ts
Export/Reports                         → @rasid/server-core/export/router.ts
Notifications                         → @rasid/server-core/notifications/router.ts
Admin operations                       → @rasid/server-core/admin/router.ts
─────────────────────────────────────────────────────
Incidents CRUD                         → apps/leaks/server/routers/incidents.ts
Monitoring jobs                        → apps/leaks/server/routers/monitoring.ts
Threat analysis                        → apps/leaks/server/routers/threats.ts
Evidence chain                         → apps/leaks/server/routers/evidence.ts
OSINT tools                           → apps/leaks/server/routers/osint.ts
Telegram/DarkWeb                      → apps/leaks/server/routers/sources.ts
─────────────────────────────────────────────────────
Privacy sites                          → apps/privacy/server/routers/sites.ts
Privacy scans                          → apps/privacy/server/routers/scans.ts
Compliance                             → apps/privacy/server/routers/compliance.ts
DSAR                                   → apps/privacy/server/routers/dsar.ts
```

---

## 4. تقسيم `drizzle/schema.ts` (190 جدول)

### جداول مشتركة → `@rasid/db/schema/`

```typescript
// @rasid/db/schema/auth.ts
export const users = mysqlTable("users", { ... });
export const sessions = mysqlTable("sessions", { ... });
export const roles = mysqlTable("roles", { ... });
export const permissions = mysqlTable("permissions", { ... });
export const userRoles = mysqlTable("user_roles", { ... });

// @rasid/db/schema/notifications.ts
export const notifications = mysqlTable("notifications", { ... });
export const emailTemplates = mysqlTable("email_templates", { ... });

// @rasid/db/schema/documents.ts
export const documents = mysqlTable("documents", { ... });
export const documentVersions = mysqlTable("document_versions", { ... });

// @rasid/db/schema/audit.ts
export const auditLogs = mysqlTable("audit_logs", { ... });
export const activityLogs = mysqlTable("activity_logs", { ... });

// @rasid/db/schema/admin.ts
export const featureFlags = mysqlTable("feature_flags", { ... });
export const systemSettings = mysqlTable("system_settings", { ... });
```

### جداول التسريبات → `apps/leaks/server/schema/`

```typescript
// apps/leaks/server/schema/incidents.ts
export const incidents = mysqlTable("incidents", { ... });
export const incidentEvidence = mysqlTable("incident_evidence", { ... });
export const incidentComments = mysqlTable("incident_comments", { ... });

// apps/leaks/server/schema/threats.ts
export const threatActors = mysqlTable("threat_actors", { ... });
export const threatRules = mysqlTable("threat_rules", { ... });

// apps/leaks/server/schema/monitoring.ts
export const monitoringJobs = mysqlTable("monitoring_jobs", { ... });
export const telegramChannels = mysqlTable("telegram_channels", { ... });
```

### جداول الخصوصية → `apps/privacy/server/schema/`

```typescript
// apps/privacy/server/schema/sites.ts
export const privacySites = mysqlTable("privacy_sites", { ... });
export const privacyScans = mysqlTable("privacy_scans", { ... });

// apps/privacy/server/schema/compliance.ts
export const complianceClauses = mysqlTable("compliance_clauses", { ... });
export const dsarRequests = mysqlTable("dsar_requests", { ... });
```

### إضافة العلاقات (Foreign Keys)

```typescript
// @rasid/db/relations/auth.ts
export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  roles: many(userRoles),
  auditLogs: many(auditLogs),
  notifications: many(notifications),
}));

// apps/leaks/server/relations/incidents.ts
export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  creator: one(users, { fields: [incidents.createdBy], references: [users.id] }),
  evidence: many(incidentEvidence),
  comments: many(incidentComments),
}));
```

---

## 5. نظام الـ Toolkit — كيف يُستخدم

### استخدام UI في أي تطبيق:

```tsx
// في apps/leaks/client/pages/Dashboard.tsx
import { Card, Button, Badge } from "@rasid/ui";
import { DataTable } from "@rasid/ui/data-display";
import { DashboardLayout, PageHeader } from "@rasid/ui/layout";
import { useAuth } from "@rasid/hooks";
import { useTheme } from "@rasid/contexts";

export default function LeaksDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <PageHeader title="لوحة رصد التسريبات" subtitle="نظرة عامة">
      <Card>
        <DataTable columns={leaksColumns} data={leaksData} />
      </Card>
    </PageHeader>
  );
}
```

### استخدام Server Core:

```typescript
// في apps/leaks/server/routers/incidents.ts
import { createRouter, protectedProcedure } from "@rasid/server-core";
import { db } from "@rasid/db";
import { incidents } from "../schema/incidents";

export const incidentsRouter = createRouter({
  list: protectedProcedure
    .input(z.object({ page: z.number(), limit: z.number() }))
    .query(async ({ input }) => {
      return db.select().from(incidents).limit(input.limit).offset(input.page * input.limit);
    }),
});
```

---

## 6. خطة التنفيذ المرحلية

### المرحلة 0: التجهيز (يوم 1-2)
- [ ] إنشاء branch جديد `rebuild/toolkit-architecture`
- [ ] الاحتفاظ بالكود الحالي كامل في `legacy/` folder
- [ ] إعداد pnpm workspaces + Turborepo
- [ ] إنشاء هيكل المجلدات الجديد (فارغ)
- [ ] إعداد tsconfig.base.json + path aliases

### المرحلة 1: بناء `@rasid/ui` (يوم 3-5)
- [ ] نقل 53 مكون shadcn/ui
- [ ] نقل المكونات المشتركة (DashboardLayout, ErrorBoundary, CommandPalette...)
- [ ] إعداد Tailwind theme مشترك
- [ ] تصدير كل شيء من `@rasid/ui`
- [ ] اختبار بناء الحزمة

### المرحلة 2: بناء `@rasid/hooks` + `@rasid/contexts` (يوم 5-6)
- [ ] نقل جميع الـ hooks المشتركة
- [ ] نقل جميع الـ contexts
- [ ] إضافة TypeScript types صارمة (بدون any)
- [ ] اختبار كل hook

### المرحلة 3: بناء `@rasid/server-core` (يوم 7-10)
- [ ] نقل Express + tRPC setup
- [ ] نقل نظام Auth (JWT, OAuth, RBAC)
- [ ] نقل Export engines (PDF, Excel, PPTX)
- [ ] نقل Email service
- [ ] نقل Scheduler
- [ ] استبدال console.log بـ logger service
- [ ] اختبار كل خدمة

### المرحلة 4: بناء `@rasid/db` (يوم 10-13)
- [ ] تقسيم schema.ts إلى ملفات حسب المجال
- [ ] كتابة relations.ts كاملة (Foreign Keys)
- [ ] إعداد migration system
- [ ] اختبار الاتصال + العلاقات

### المرحلة 5: بناء `@rasid/ai` (يوم 13-15)
- [ ] تقسيم rasidAI.ts (4,586 سطر) إلى modules
- [ ] نقل RAG + streaming + tools
- [ ] إضافة types صارمة
- [ ] اختبار المحادثة + الأدوات

### المرحلة 6: بناء `apps/leaks` (يوم 15-20)
- [ ] إنشاء التطبيق باستخدام الـ Toolkit
- [ ] نقل 36 صفحة (الأصلية، ليست المكررة)
- [ ] تقسيم routers.ts → ملفات router صغيرة
- [ ] تقسيم db.ts → ملفات db صغيرة
- [ ] ربط كل شيء مع الـ Toolkit
- [ ] اختبار كامل

### المرحلة 7: بناء `apps/privacy` (يوم 20-23)
- [ ] إنشاء التطبيق باستخدام الـ Toolkit
- [ ] نقل 18 صفحة خصوصية
- [ ] إنشاء routers خاصة بالخصوصية
- [ ] ربط مع الـ Toolkit
- [ ] اختبار كامل

### المرحلة 8: الجودة والنشر (يوم 23-25)
- [ ] إزالة جميع `: any` (1,288 → 0)
- [ ] إزالة جميع `console.log` (89 → 0)
- [ ] إعداد CI/CD (GitHub Actions)
- [ ] إعداد ESLint + Prettier
- [ ] كتابة اختبارات أساسية
- [ ] إعداد Docker + Railway deployment
- [ ] اختبار شامل نهائي

---

## 7. حماية الكود الحالي

### الضمانات:

1. **لن يُحذف أي كود** — الكود الحالي يبقى في `legacy/` كمرجع
2. **نقل وليس إعادة كتابة** — نفس المنطق التجاري ينتقل إلى الهيكل الجديد
3. **كل مرحلة تُختبر** — لن ننتقل للمرحلة التالية إلا بعد التأكد
4. **Git branches** — كل مرحلة في branch منفصل يمكن التراجع عنه
5. **الكود الحالي يبقى يعمل** — لا نلمس `main` حتى الانتهاء

### ماذا نحتفظ به كما هو:

- ✅ كل المنطق التجاري (Business Logic) في routers.ts و db.ts
- ✅ كل صفحات الـ frontend (36 leaks + 18 privacy + الصفحات المشتركة)
- ✅ نظام الذكاء الاصطناعي (rasidAI.ts + enhancements)
- ✅ نظام التصدير (PDF, Excel, PPTX)
- ✅ نظام المسح (deepScanner, scanWorker, scanEngine)
- ✅ كل مكونات UI (53 shadcn + 147 مخصصة)
- ✅ كل الـ hooks و contexts
- ✅ قاعدة البيانات وبياناتها

### ماذا نغيّر:

- 🔄 **الهيكل** — من monolith إلى monorepo
- 🔄 **التنظيم** — من ملفات ضخمة إلى modules صغيرة
- 🔄 **الأنواع** — من `any` إلى typed
- 🔄 **العلاقات** — من بدون FK إلى علاقات كاملة
- 🔄 **الـ Logging** — من `console.log` إلى logger service
- 🔄 **الـ CSS** — توحيد في theme مشترك
- ❌ **حذف المكرر** — 36 ملف منسوخ

---

## 8. الفائدة المستقبلية

### بعد بناء الـ Toolkit، إنشاء موقع جديد يتطلب فقط:

```bash
# 1. إنشاء تطبيق جديد
mkdir apps/new-site
cd apps/new-site

# 2. إضافة الـ Toolkit كـ dependencies
pnpm add @rasid/ui @rasid/hooks @rasid/contexts @rasid/api @rasid/server-core @rasid/db @rasid/ai

# 3. بناء الصفحات الخاصة فقط!
# لأن كل المشترك (Auth, UI, Export, AI, DB...) جاهز
```

### مقارنة الجهد:

| | بدون Toolkit | مع Toolkit |
|---|---|---|
| إنشاء موقع جديد | 3-4 أسابيع | 3-5 أيام |
| إضافة ميزة مشتركة | تعديل كل موقع | تعديل الـ Toolkit فقط |
| إصلاح خطأ مشترك | إصلاح في كل موقع | إصلاح مرة واحدة |
| تحديث UI | تحديث كل موقع | تحديث `@rasid/ui` فقط |

---

## 9. الخلاصة

| المعيار | الوضع الحالي | بعد إعادة البناء |
|---------|-------------|-----------------|
| أكبر ملف | 10,424 سطر | < 300 سطر |
| ملفات مكررة | 36 ملف | 0 |
| `: any` | 1,288 | 0 |
| `console.log` | 89 | 0 (يستخدم logger) |
| Foreign Keys | 1 | كامل لكل الجداول |
| Relations | فارغ | كامل |
| اختبارات | 9 ملفات (1.8%) | 50+ ملف (30%+) |
| إنشاء موقع جديد | 3-4 أسابيع | 3-5 أيام |
| فهم المشروع (مطور جديد) | أسبوع+ | يوم واحد |

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

## `analysis_notes.md`

```markdown
# ملاحظات تحليل الصفحات المخصصة

## الواجهة الأولية
- تم تسجيل الدخول بنجاح
- القائمة الجانبية تظهر على اليمين
- يوجد قسم "اللوحات المخصصة" في القائمة الجانبية
- يوجد عداد يعرض عدد الصفحات المخصصة (1)
- الصفحة الرئيسية تعرض "جاري تحميل المؤشرات..."
- القائمة الجانبية تحتوي على أقسام: الرئيسية، راصد الذكي، لوحة القيادة الرئيسية، التقارير، التوصيات، لوحات المؤشرات، تحليل الحالات (ATLAS)، تحليل الحالات (LEAK ANALYSIS)، لوحات شخصية/مراكز، اللوحات المخصصة

```

---

## `analysis_report.md`

```markdown
# تحليل ميزة الصفحات المخصصة في منصة راصد

## مقدمة

بناءً على طلبكم، تم إجراء تحليل شامل لميزة "إضافة صفحات مخصصة" المتوفرة في القائمة الجانبية لمنصة "راصد". يهدف هذا التقرير إلى تقييم فعالية الميزة وقدراتها وسهولة استخدامها، مع تحديد الفجوات الرئيسية وتقديم توصيات للتحسين. اعتمد التحليل على فحص الكود المصدري للمشروع، واختبار الميزة بشكل عملي على المنصة الحية، وفحص بنية قاعدة البيانات والـ API المرتبط بها.

## 1. نظرة عامة على الميزة

تتيح ميزة الصفحات المخصصة للمستخدمين إنشاء ثلاثة أنواع مختلفة من الصفحات الديناميكية لعرض البيانات وتلخيصها بطرق متنوعة، مما يمنحهم مرونة عالية في تخصيص واجهاتهم حسب احتياجاتهم التحليلية.

| نوع الصفحة | الوصف الفني | الغرض الأساسي |
| :--- | :--- | :--- |
| **لوحة مؤشرات (Dashboard)** | صفحة ديناميكية (`DynamicDashboard.tsx`) تتيح للمستخدمين إضافة وتخصيص شبكة من العناصر الرسومية (Widgets) مثل الكروت الإحصائية والمخططات البيانية. | عرض مؤشرات الأداء الرئيسية (KPIs) والمقاييس الهامة في نظرة واحدة. |
| **جدول بيانات (Table)** | صفحة ديناميكية (`DynamicTable.tsx`) تسمح للمستخدمين ببناء جداول بيانات مخصصة عن طريق اختيار الأعمدة التي يرغبون في عرضها من مجموعة بيانات محددة. | استعراض البيانات بشكل جدولي مفصل مع إمكانية التخصيص. |
| **تقرير (Report)** | صفحة ديناميكية (`DynamicReport.tsx`) تمكّن المستخدمين من بناء تقارير مفصلة عبر إضافة أقسام متنوعة مثل النصوص والمخططات والجداول. | إنشاء ومشاركة تقارير شاملة تجمع بين البيانات والمعلومات النصية. |

## 2. التحليل الفني

تم بناء الميزة باستخدام تقنيات حديثة تضمن الأداء الجيد وقابلية التوسع.

- **الواجهة الأمامية (Frontend)**: تم استخدام مكتبة React مع TypeScript، مما يوفر بنية قوية وموثوقة. يتم إدارة حالة الصفحات المخصصة عبر Hook مخصص (`useCustomPages.ts`) يتفاعل مع الـ API لجلب البيانات وتحديثها. الواجهات الخاصة بالإنشاء والتعديل (`CreatePageModal`, `DynamicDashboard`, etc.) مصممة بشكل جيد وتوفر تجربة استخدام سلسة.
- **الواجهة الخلفية (Backend)**: يعتمد الـ API على إطار `tRPC` الذي يضمن تكاملاً قوياً بين الواجهتين الأمامية والخلفية. تم تعريف العمليات الأساسية (CRUD - Create, Read, Update, Delete) بشكل واضح في `server/routers.ts`.
- **قاعدة البيانات**: يتم تخزين كافة معلومات الصفحات المخصصة في جدول واحد `custom_pages`. الحقل الأهم هو `config` من نوع `JSON`، والذي يحتوي على كافة تفاصيل تكوين الصفحة (مثل قائمة العناصر في لوحة المؤشرات، أو الأعمدة في الجدول)، مما يوفر مرونة عالية في تخزين هياكل بيانات مختلفة لكل نوع صفحة.

## 3. تقييم الفعالية والقدرات

تعتبر الميزة فعالة وقوية في شكلها الحالي، حيث توفر أدوات ممتازة لإنشاء طرق عرض داخلية للبيانات. ومع ذلك، توجد بعض الفجوات التي يمكن معالجتها لزيادة قدرات الميزة وفعاليتها.

| الفجوة (Gap) | التأثير | توصية للتحسين |
| :--- | :--- | :--- |
| **غياب خيار المشاركة الخارجية** | تقتصر فائدة الصفحات المخصصة على المستخدمين المسجلين فقط، مما يحد من إمكانية مشاركة التقارير واللوحات مع أطراف خارجية. | إضافة خاصية "مشاركة" (Share) تولّد رابطاً فريداً ومؤقتاً لعرض الصفحة (للقراءة فقط). يتطلب ذلك إنشاء API endpoint جديد ومسار (route) عام لعرض الصفحة. |
| **محدودية عناصر لوحة المؤشرات** | العناصر المتاحة في لوحات المؤشرات محددة مسبقاً، ولا يمكن للمستخدم إنشاء أنواع جديدة من العناصر أو ربطها بمصادر بيانات خارجية. | تطوير "مجموعة أدوات تطوير" (SDK) للعناصر أو محرر متقدم يسمح للمستخدمين بتعريف مصادر بيانات مخصصة (عبر REST API مثلاً) وتصميم طرق عرض جديدة. |
| **نقص الميزات المتقدمة في الجداول** | تفتقر الجداول المخصصة إلى وظائف حيوية مثل الفرز (Sorting) والتصفية (Filtering) والتجميع (Aggregation) مباشرة من واجهة المستخدم. | دمج مكتبة جداول متقدمة مثل `TanStack Table` لتوفير هذه الميزات. سيتطلب ذلك تحديث الـ API لدعم استقبال هذه المعايير الجديدة. |

## 4. تقييم سهولة الاستخدام

تجربة المستخدم جيدة بشكل عام، ولكن يمكن تحسينها لتكون أكثر سلاسة وبديهية.

| الفجوة (Gap) | التأثير | توصية للتحسين |
| :--- | :--- | :--- |
| **غياب الإرشاد الأولي** | عند إنشاء صفحة جديدة، يتم توجيه المستخدم إلى صفحة فارغة، مما قد يكون مربكاً للمستخدمين الجدد رغم وجود قوالب جاهزة. | تطبيق "معالج إعداد" (Wizard) يوجه المستخدم خطوة بخطوة خلال عملية إنشاء أول صفحة، مع شرح الخيارات المتاحة. |
| **تسمية غير واضحة في القائمة** | ظهور اسم "اللوحات المخصصة" في القائمة الجانبية حتى عند إنشاء جدول أو تقرير قد يسبب التباساً. | تغيير التسمية في القائمة الجانبية إلى "صفحاتي المخصصة" أو "My Pages" لتعكس بشكل أفضل أنها تحتوي على أنواع مختلفة من الصفحات. |
| **صعوبة الوصول للصفحات** | يتطلب الوصول إلى الصفحات المخصصة النقر على قسم "لوحات شخصية/مراكز" ثم "اللوحات المخصصة"، وهي خطوات غير مباشرة. | نقل قسم "اللوحات المخصصة" ليصبح قسماً رئيسياً ومستقلاً في القائمة الجانبية لتسهيل الوصول المباشر. |

## 5. خلاصة وتوصيات نهائية

تعد ميزة الصفحات المخصصة إضافة قيمة وقوية لمنصة "راصد"، وهي مبنية على أساس تقني متين. تكمن قوتها الحالية في توفير أدوات تخصيص داخلية ممتازة. للارتقاء بالميزة إلى مستوى أعلى، نوصي بالتركيز على **ثلاثة محاور رئيسية**:

1.  **توسيع القدرات**: عبر إضافة ميزات المشاركة الخارجية، ودعم مصادر البيانات المخصصة، وتضمين وظائف متقدمة للجداول. 
2.  **تحسين تجربة المستخدم**: من خلال توفير إرشاد أفضل للمستخدمين الجدد، وتحسين وضوح التسميات، وتسهيل الوصول إلى الميزة.
3.  **زيادة المرونة**: عن طريق السماح للمستخدمين بإنشاء عناصر وتقارير أكثر تعقيداً وتفاعلية.

إن تبني هذه التحسينات سيساهم بشكل كبير في تعزيز فعالية الميزة وجعلها أداة لا غنى عنها لتحليل البيانات ومشاركتها. 

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

## `deploy_trigger.txt`

```text
// Deploy trigger Thu Feb 26 04:37:04 EST 2026

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

## `fix-all-blur-nuclear.py`

```python
#!/usr/bin/env python3
"""
Nuclear fix: Add isDark guard to EVERY backdropFilter usage in ALL TSX files.
Also fix backdrop-blur Tailwind classes to be conditional.
"""
import re
import os

BASE = "client/src"

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

changes = []

# ============================================================
# 1. Dashboard.tsx - The MAIN offender (KPI cards + presentation)
# ============================================================
path = f"{BASE}/pages/Dashboard.tsx"
content = read_file(path)

# First, check if Dashboard.tsx has access to isDark
if "useTheme" not in content and "isDark" not in content:
    # Need to add theme import
    content = content.replace(
        'import { motion',
        'import { useTheme } from "../contexts/ThemeContext";\nimport { motion'
    )
    # Add isDark hook inside the component
    # Find the main component function
    content = content.replace(
        'export default function Dashboard',
        'export default function Dashboard'
    )

# Check if there's already a useTheme or isDark in Dashboard
has_isDark = "isDark" in content

if not has_isDark:
    # Add useTheme import if not present
    if 'useTheme' not in content:
        # Find the first import line
        first_import = content.find('import ')
        content = 'import { useTheme } from "../contexts/ThemeContext";\n' + content
    
# Now fix the KPI card backdropFilter at line ~321
# Pattern: style={{ backdropFilter: "blur(24px)" }}
# Replace with conditional
content = re.sub(
    r'backdropFilter:\s*"blur\(24px\)"',
    'backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)"',
    content
)

# Fix the presentation mode sections with hardcoded dark backgrounds
# Pattern: style={{ background: "rgba(26, 37, 80, 0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)" }}
content = content.replace(
    'background: "rgba(26, 37, 80, 0.8)", backdropFilter: "blur(24px)", border: "1px solid rgba(61, 177, 172, 0.12)"',
    'background: document.documentElement.classList.contains("light") ? "rgba(255,255,255,0.95)" : "rgba(26, 37, 80, 0.8)", backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur(24px)", border: document.documentElement.classList.contains("light") ? "1px solid rgba(100,89,167,0.15)" : "1px solid rgba(61, 177, 172, 0.12)"'
)

write_file(path, content)
changes.append(f"Dashboard.tsx: Fixed all backdropFilter usages")

# ============================================================
# 2. DashboardLayout.tsx
# ============================================================
path = f"{BASE}/components/DashboardLayout.tsx"
content = read_file(path)

# The DashboardLayout already has isDark. Fix any remaining unconditional backdropFilter
# Find all backdropFilter that are NOT preceded by isDark on the same line or nearby
lines = content.split('\n')
new_lines = []
for i, line in enumerate(lines):
    if 'backdropFilter' in line and 'isDark' not in line:
        # Check if the previous few lines have isDark condition
        context = '\n'.join(lines[max(0,i-3):i+1])
        if 'isDark' not in context:
            # This is unconditional - make it conditional
            line = line.replace(
                'backdropFilter: "blur(20px)"',
                'backdropFilter: isDark ? "blur(20px)" : "none"'
            )
            line = line.replace(
                'backdropFilter: "blur(24px)"',
                'backdropFilter: isDark ? "blur(24px)" : "none"'
            )
            line = line.replace(
                'backdropFilter: "blur(10px)"',
                'backdropFilter: isDark ? "blur(10px)" : "none"'
            )
            line = line.replace(
                "backdropFilter: 'blur(20px)'",
                "backdropFilter: isDark ? 'blur(20px)' : 'none'"
            )
            line = line.replace(
                "backdropFilter: 'blur(24px)'",
                "backdropFilter: isDark ? 'blur(24px)' : 'none'"
            )
    new_lines.append(line)
content = '\n'.join(new_lines)
write_file(path, content)
changes.append(f"DashboardLayout.tsx: Fixed unconditional backdropFilter")

# ============================================================
# 3. Generic fix for all remaining files
# ============================================================
files_to_fix = [
    f"{BASE}/components/AddPageButton.tsx",
    f"{BASE}/components/AtlasDrillModal.tsx",
    f"{BASE}/components/ComplianceWarningDialog.tsx",
    f"{BASE}/components/CustomPagesList.tsx",
    f"{BASE}/components/DeepDrillDown.tsx",
    f"{BASE}/components/DetailModal.tsx",
    f"{BASE}/components/GuideOverlay.tsx",
    f"{BASE}/components/LeakDetailDrilldown.tsx",
    f"{BASE}/components/NavigationConsentDialog.tsx",
    f"{BASE}/components/NotificationBell.tsx",
    f"{BASE}/components/RasidCharacterWidget.tsx",
    f"{BASE}/pages/NotFound.tsx",
    f"{BASE}/pages/PlatformLogin.tsx",
    f"{BASE}/pages/PublicVerify.tsx",
    f"{BASE}/pages/SmartRasid.tsx",
]

for path in files_to_fix:
    if not os.path.exists(path):
        print(f"  SKIP (not found): {path}")
        continue
    
    content = read_file(path)
    original = content
    
    # Strategy: Replace all unconditional backdropFilter with a check
    # Use document.documentElement.classList.contains("light") as the check
    # since these components may not have access to isDark
    
    # Pattern 1: backdropFilter: "blur(Xpx)"
    content = re.sub(
        r"""backdropFilter:\s*["']blur\((\d+)px\)["']""",
        lambda m: f'backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur({m.group(1)}px)"',
        content
    )
    
    # Pattern 2: backdropFilter: 'blur(Xpx)'
    content = re.sub(
        r"""backdropFilter:\s*'blur\((\d+)px\)'""",
        lambda m: f'backdropFilter: document.documentElement.classList.contains("light") ? "none" : "blur({m.group(1)}px)"',
        content
    )
    
    if content != original:
        write_file(path, content)
        changes.append(f"{os.path.basename(path)}: Fixed backdropFilter")
    else:
        print(f"  NO CHANGE: {path}")

# ============================================================
# 4. Fix backdrop-blur Tailwind classes in non-atlas pages
# ============================================================
# These files use backdrop-blur-* classes without isDark guard
backdrop_blur_files = [
    f"{BASE}/pages/ThreatMap.tsx",
    f"{BASE}/pages/PresentationMode.tsx",
    f"{BASE}/pages/VerifyDocument.tsx",
    f"{BASE}/pages/RoleDashboard.tsx",
    f"{BASE}/pages/ReportApproval.tsx",
]

for path in backdrop_blur_files:
    if not os.path.exists(path):
        print(f"  SKIP (not found): {path}")
        continue
    
    content = read_file(path)
    original = content
    
    # For ThreatMap: bg-card/60 backdrop-blur-sm -> conditional
    # Replace backdrop-blur-sm with dark:backdrop-blur-sm
    # Replace backdrop-blur-xl with dark:backdrop-blur-xl
    # Replace backdrop-blur-2xl with dark:backdrop-blur-2xl
    content = re.sub(r'\bbackdrop-blur-2xl\b', 'dark:backdrop-blur-2xl', content)
    content = re.sub(r'\bbackdrop-blur-xl\b', 'dark:backdrop-blur-xl', content)
    content = re.sub(r'\bbackdrop-blur-sm\b', 'dark:backdrop-blur-sm', content)
    content = re.sub(r'\bbackdrop-blur\b(?!-)', 'dark:backdrop-blur', content)
    
    # Avoid double-prefixing: dark:dark:backdrop-blur -> dark:backdrop-blur
    content = content.replace('dark:dark:', 'dark:')
    
    if content != original:
        write_file(path, content)
        changes.append(f"{os.path.basename(path)}: Fixed backdrop-blur classes")

# ============================================================
# 5. Fix the CSS glass-card to ensure no blur in light mode
# ============================================================
css_path = f"{BASE}/index.css"
css = read_file(css_path)

# Make sure the .light .glass-card has backdrop-filter: none
# Also add !important to be absolutely sure
if '.light .glass-card' in css:
    # Already exists, make sure it has backdrop-filter: none
    css = re.sub(
        r'(\.light\s+\.glass-card\s*\{[^}]*?)(\})',
        lambda m: m.group(1) + ('' if 'backdrop-filter' in m.group(1) else '\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n') + m.group(2),
        css
    )

# Also ensure the .light .kpi-card has no blur
if '.light .kpi-card' in css:
    css = re.sub(
        r'(\.light\s+\.kpi-card\s*\{[^}]*?)(\})',
        lambda m: m.group(1) + ('' if 'backdrop-filter' in m.group(1) else '\n  backdrop-filter: none !important;\n  -webkit-backdrop-filter: none !important;\n') + m.group(2),
        css
    )

write_file(css_path, css)
changes.append("index.css: Ensured glass-card and kpi-card have no blur in light mode")

# ============================================================
# Summary
# ============================================================
print("\n=== CHANGES MADE ===")
for c in changes:
    print(f"  ✓ {c}")
print(f"\nTotal: {len(changes)} files modified")

```

---

## `fix-light-theme.py`

```python
#!/usr/bin/env python3
"""
Comprehensive light theme fix for Rasid platform.
This script modifies all atlas pages and components to:
1. Add useThemeColors import where missing
2. Replace hardcoded dark-only colors with theme-aware alternatives
3. Fix inline styles that use rgba(255,255,255,...) backgrounds
4. Add Array.isArray guards for .map calls on potentially non-array data
5. Remove/condition backdrop-filter in light mode
"""
import re
import os

BASE = "/home/ubuntu/rasid-leaks/client/src"

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_incident_registry():
    """Fix IncidentRegistry - add theme awareness"""
    path = f"{BASE}/pages/atlas/IncidentRegistry.tsx"
    content = read_file(path)
    
    # Add useThemeColors import if not present
    if "useThemeColors" not in content:
        content = content.replace(
            'import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, stagger } from "@/lib/atlas/design";',
            'import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, stagger } from "@/lib/atlas/design";\nimport { useThemeColors } from "@/hooks/atlas/useThemeColors";'
        )
    
    # Add tc = useThemeColors() after useData
    if "const tc = useThemeColors();" not in content:
        content = content.replace(
            'const { data, loading, allIncidents } = useData();',
            'const { data, loading, allIncidents } = useData();\n  const tc = useThemeColors();'
        )
    
    # Fix hardcoded text-white
    content = content.replace(
        'className="text-2xl font-extrabold text-white"',
        'className="text-2xl font-extrabold" style={{ color: tc.textPrimary }}'
    )
    
    # Fix input background inline styles
    content = content.replace(
        'className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#8B7FD4]/30"\n              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}',
        'className="w-full pr-10 pl-4 py-2.5 rounded-xl text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#8B7FD4]/30"\n              style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.04)", border: tc.isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(120,100,200,0.1)", color: tc.textPrimary }}'
    )
    
    # Fix all select/button inline styles with rgba(255,255,255,0.04)
    content = content.replace(
        'style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}',
        'style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.04)", border: tc.isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(120,100,200,0.1)", color: tc.isDark ? undefined : "#4a4578" }}'
    )
    
    # Fix text-gray-300 in select elements
    content = content.replace(
        'className="px-3 py-2.5 rounded-xl text-sm text-gray-300 focus:outline-none"',
        'className="px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={{ color: tc.textMuted }}'
    )
    
    # Fix text-gray-400 for sort buttons
    content = content.replace(
        'className="px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"',
        'className="px-3 py-2.5 rounded-xl text-sm transition-colors flex items-center gap-1.5" style={{ color: tc.textDim }}'
    )
    content = content.replace(
        'className="px-2.5 py-2.5 rounded-xl text-gray-400 hover:text-white transition-colors"',
        'className="px-2.5 py-2.5 rounded-xl transition-colors" style={{ color: tc.textDim }}'
    )
    
    # Fix incident card text-white
    content = content.replace(
        'className="text-xs md:text-sm font-semibold text-white mb-1 line-clamp-2 md:truncate group-hover:text-[#8B7FD4] transition-colors"',
        'className="text-xs md:text-sm font-semibold mb-1 line-clamp-2 md:truncate group-hover:text-[#8B7FD4] transition-colors" style={{ color: tc.textPrimary }}'
    )
    
    # Fix pagination button backgrounds
    content = content.replace(
        'style={{ background: "rgba(255,255,255,0.04)" }}\n          >\n            <ChevronRight',
        'style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.06)" }}\n          >\n            <ChevronRight'
    )
    content = content.replace(
        'style={{ background: "rgba(255,255,255,0.04)" }}\n          >\n            <ChevronLeft',
        'style={{ background: tc.isDark ? "rgba(255,255,255,0.04)" : "rgba(120,100,200,0.06)" }}\n          >\n            <ChevronLeft'
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_impact_lens():
    """Fix ImpactLens - add theme awareness"""
    path = f"{BASE}/pages/atlas/ImpactLens.tsx"
    content = read_file(path)
    
    if "useThemeColors" not in content:
        # Add import
        content = content.replace(
            'import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/atlas/design";',
            'import { fmtNum, fmtFull, SEVERITY_COLORS, SOURCE_COLORS, CHART_TOOLTIP_STYLE } from "@/lib/atlas/design";\nimport { useThemeColors } from "@/hooks/atlas/useThemeColors";'
        )
    
    # Add tc after useData
    if "const tc = useThemeColors();" not in content:
        content = content.replace(
            'const { data, loading } = useData();',
            'const { data, loading } = useData();\n  const tc = useThemeColors();'
        )
    
    # Fix text-white
    content = re.sub(
        r'className="([^"]*?)text-white([^"]*?)"',
        lambda m: f'className="{m.group(1)}{m.group(2)}" style={{{{ color: tc.textPrimary }}}}' if 'font-extrabold' in m.group(0) or 'font-bold' in m.group(0) else m.group(0),
        content
    )
    
    # Fix text-gray-300 section headers
    content = content.replace(
        'text-gray-300 mb-3',
        '" style={{ color: tc.textSecondary }} className="mb-3'
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_trends_comparison():
    """Fix TrendsComparison"""
    path = f"{BASE}/pages/atlas/TrendsComparison.tsx"
    content = read_file(path)
    
    if "useThemeColors" not in content:
        if 'from "@/lib/atlas/design"' in content:
            content = content.replace(
                'from "@/lib/atlas/design";',
                'from "@/lib/atlas/design";\nimport { useThemeColors } from "@/hooks/atlas/useThemeColors";'
            )
    
    if "const tc = useThemeColors();" not in content:
        if "const { data, loading }" in content:
            content = content.replace(
                'const { data, loading } = useData();',
                'const { data, loading } = useData();\n  const tc = useThemeColors();'
            )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_reports_center():
    """Fix ReportsCenter"""
    path = f"{BASE}/pages/atlas/ReportsCenter.tsx"
    content = read_file(path)
    
    if "useThemeColors" not in content:
        if 'from "@/lib/atlas/design"' in content:
            content = content.replace(
                'from "@/lib/atlas/design";',
                'from "@/lib/atlas/design";\nimport { useThemeColors } from "@/hooks/atlas/useThemeColors";'
            )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_pattern_compare():
    """Fix PatternCompare - add Array.isArray guards"""
    path = f"{BASE}/components/atlas/PatternCompare.tsx"
    content = read_file(path)
    
    # Add safety for piiTypes
    content = content.replace(
        'const setA = new Set(patternA.piiTypes);',
        'const setA = new Set(Array.isArray(patternA.piiTypes) ? patternA.piiTypes : []);'
    )
    content = content.replace(
        'const setB = new Set(patternB.piiTypes);',
        'const setB = new Set(Array.isArray(patternB.piiTypes) ? patternB.piiTypes : []);'
    )
    content = content.replace(
        'const shared = patternA.piiTypes.filter(p => setB.has(p));',
        'const piiA = Array.isArray(patternA.piiTypes) ? patternA.piiTypes : [];\n    const piiB = Array.isArray(patternB.piiTypes) ? patternB.piiTypes : [];\n    const shared = piiA.filter(p => setB.has(p));'
    )
    content = content.replace(
        'const onlyA = patternA.piiTypes.filter(p => !setB.has(p));',
        'const onlyA = piiA.filter(p => !setB.has(p));'
    )
    content = content.replace(
        'const onlyB = patternB.piiTypes.filter(p => !setA.has(p));',
        'const onlyB = piiB.filter(p => !setA.has(p));'
    )
    
    # Add safety for sectors
    content = content.replace(
        'const setA = new Set(patternA.sectors);',
        'const setA = new Set(Array.isArray(patternA.sectors) ? patternA.sectors : []);'
    )
    content = content.replace(
        'const setB = new Set(patternB.sectors);',
        'const setB = new Set(Array.isArray(patternB.sectors) ? patternB.sectors : []);'
    )
    content = content.replace(
        'const shared = patternA.sectors.filter(s => setB.has(s));',
        'const secA = Array.isArray(patternA.sectors) ? patternA.sectors : [];\n    const secB = Array.isArray(patternB.sectors) ? patternB.sectors : [];\n    const shared = secA.filter(s => setB.has(s));'
    )
    content = content.replace(
        'const onlyA = patternA.sectors.filter(s => !setB.has(s));',
        'const onlyA = secA.filter(s => !setB.has(s));'
    )
    content = content.replace(
        'const onlyB = patternB.sectors.filter(s => !setA.has(s));',
        'const onlyB = secB.filter(s => !setA.has(s));'
    )
    
    # Fix piiTypes.length references
    content = content.replace(
        'patternA.piiTypes.length',
        '(Array.isArray(patternA.piiTypes) ? patternA.piiTypes.length : 0)'
    )
    content = content.replace(
        'patternB.piiTypes.length',
        '(Array.isArray(patternB.piiTypes) ? patternB.piiTypes.length : 0)'
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_platform_kpi():
    """Fix PlatformKPI - add Array.isArray guard for piiTypes"""
    path = f"{BASE}/components/atlas/PlatformKPI.tsx"
    content = read_file(path)
    
    # Fix p.piiTypes.forEach
    content = content.replace(
        'patterns.forEach(p => p.piiTypes.forEach(t => allPiiTypes.add(t)));',
        'patterns.forEach(p => { const pt = Array.isArray(p.piiTypes) ? p.piiTypes : []; pt.forEach(t => allPiiTypes.add(t)); });'
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_pattern_lab():
    """Fix PatternLab - add Array.isArray guards"""
    path = f"{BASE}/pages/atlas/PatternLab.tsx"
    content = read_file(path)
    
    # Fix piiTypes.slice without guard
    content = content.replace(
        '{pattern.piiTypes && pattern.piiTypes.length > 0 && (',
        '{Array.isArray(pattern.piiTypes) && pattern.piiTypes.length > 0 && ('
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_saudi_map():
    """Fix SaudiMap - add theme awareness for light mode"""
    path = f"{BASE}/components/atlas/SaudiMap.tsx"
    content = read_file(path)
    
    # Add useTheme import
    if "useTheme" not in content:
        content = content.replace(
            'import { MapPin, Database, AlertTriangle, Building2, X } from "lucide-react";',
            'import { MapPin, Database, AlertTriangle, Building2, X } from "lucide-react";\nimport { useTheme } from "@/contexts/ThemeContext";'
        )
    
    # Add isDark variable
    if "const { isDark }" not in content and "isDark" not in content:
        content = content.replace(
            'const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);',
            'const { isDark } = useTheme();\n  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);'
        )
    
    # Fix the map container background
    content = content.replace(
        'style={{ background: "rgba(10,15,44,0.5)" }}',
        'style={{ background: isDark ? "rgba(10,15,44,0.5)" : "rgba(120,100,200,0.04)" }}'
    )
    
    # Fix tooltip background
    content = content.replace(
        'fill="rgba(10,15,44,0.95)"',
        'fill={isDark ? "rgba(10,15,44,0.95)" : "rgba(255,255,255,0.97)"}'
    )
    
    # Fix text fill colors for region names
    content = content.replace(
        'fill={isHovered || isSelected ? "#fff" : "rgba(255,255,255,0.5)"}',
        'fill={isHovered || isSelected ? (isDark ? "#fff" : "#1e1b4b") : (isDark ? "rgba(255,255,255,0.5)" : "#64748b")}'
    )
    
    # Fix count label fill
    content = content.replace(
        'fill={isSelected ? "#F0D060" : "#fff"}',
        'fill={isSelected ? "#F0D060" : (isDark ? "#fff" : "#1e1b4b")}'
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_atlas_dashboard_layout():
    """Fix AtlasDashboardLayout - remove backdrop-filter in light mode"""
    path = f"{BASE}/components/atlas/AtlasDashboardLayout.tsx"
    content = read_file(path)
    
    # Fix topbar backdrop-filter
    content = content.replace(
        '''style={{
            background: tc.topBarGradient,
            backdropFilter: "blur(20px)",
            borderBottom: tc.topBarBorder,
          }}''',
        '''style={{
            background: tc.topBarGradient,
            ...(isDark ? { backdropFilter: "blur(20px)" } : {}),
            borderBottom: tc.topBarBorder,
          }}'''
    )
    
    # Fix user menu backdrop-filter
    content = content.replace(
        '''backdropFilter: "blur(20px)",
                }}
              >
                {/* لوحة التحكم / الرجوع للمنصة */}''',
        '''...(isDark ? { backdropFilter: "blur(20px)" } : {}),
                }}
              >
                {/* لوحة التحكم / الرجوع للمنصة */}'''
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_national_overview():
    """Fix NationalOverview - use theme colors for text"""
    path = f"{BASE}/pages/atlas/NationalOverview.tsx"
    content = read_file(path)
    
    # Fix section header text-gray-300
    content = content.replace(
        'className="text-xs md:text-sm font-semibold text-gray-300 mb-3 md:mb-4 flex items-center gap-2"',
        'className="text-xs md:text-sm font-semibold mb-3 md:mb-4 flex items-center gap-2" style={{ color: tc.textSecondary }}'
    )
    
    # Fix main title text-white
    content = content.replace(
        'className="text-xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2"',
        'className="text-xl md:text-3xl lg:text-4xl font-extrabold mb-2" style={{ color: tc.textPrimary }}'
    )
    
    # Fix subtitle text-gray-400
    content = content.replace(
        'className="text-gray-400 text-sm max-w-xl"',
        'className="text-sm max-w-xl" style={{ color: tc.textMuted }}'
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_incident_panel():
    """Fix IncidentPanel - remove backdrop-filter in light mode"""
    path = f"{BASE}/components/atlas/IncidentPanel.tsx"
    content = read_file(path)
    
    # Fix backdrop-filter on panel
    content = content.replace(
        'style={{ background: tc.panelGradient, backdropFilter: "blur(40px)" }}',
        'style={{ background: tc.panelGradient, ...(tc.isDark ? { backdropFilter: "blur(40px)" } : {}) }}'
    )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


def fix_atlas_drill_modal():
    """Fix AtlasDrillModal - remove backdrop-filter in light mode"""
    path = f"{BASE}/components/AtlasDrillModal.tsx"
    content = read_file(path)
    
    # Add useTheme import if not present
    if "useTheme" not in content:
        content = content.replace(
            'import { motion, AnimatePresence } from "framer-motion";',
            'import { motion, AnimatePresence } from "framer-motion";\nimport { useTheme } from "@/contexts/ThemeContext";'
        )
    
    write_file(path, content)
    print(f"  Fixed: {path}")


if __name__ == "__main__":
    print("=== Comprehensive Light Theme Fix ===\n")
    
    print("1. Fixing atlas pages...")
    fix_incident_registry()
    fix_national_overview()
    fix_pattern_lab()
    
    print("\n2. Fixing atlas components...")
    fix_pattern_compare()
    fix_platform_kpi()
    fix_saudi_map()
    fix_incident_panel()
    fix_atlas_dashboard_layout()
    
    print("\n=== Done ===")

```

---

## `fix-remaining-blur.py`

```python
#!/usr/bin/env python3
"""
Comprehensive fix for remaining blur/glassmorphism in light mode.
Targets:
1. PatternCompare - remove unconditional backdropFilter
2. PlatformKPI - remove unconditional backdropFilter
3. ExternalPlatform - remove unconditional backdropFilter
4. PatternLab - make backdropFilter conditional on isDark
5. PiiAtlas - make backdropFilter conditional on isDark
6. KpiCard - remove filter:blur animation in light mode
7. SectionHeader - remove filter:blur animation in light mode
8. DrillModal - remove filter:blur animation in light mode
9. IncidentPanel - already has isDark guard, verify
10. NationalOverview - make heroOverlay fully opaque in light mode
"""
import re

BASE = "/home/ubuntu/rasid-leaks/client/src"

def fix_file(path, replacements):
    with open(path, 'r') as f:
        content = f.read()
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
            print(f"  ✓ Fixed: {old[:60]}...")
        else:
            print(f"  ✗ Not found: {old[:60]}...")
    with open(path, 'w') as f:
        f.write(content)

# 1. PatternCompare - remove unconditional backdropFilter
print("\n=== PatternCompare ===")
fix_file(f"{BASE}/components/atlas/PatternCompare.tsx", [
    (
        'style={{ background: "rgba(8,12,38,0.97)", backdropFilter: "blur(20px)" }}',
        'style={{ background: tc.isDark ? "rgba(8,12,38,0.97)" : "rgba(255,255,255,0.99)", ...(tc.isDark ? { backdropFilter: "blur(20px)" } : {}) }}'
    ),
])

# 2. PlatformKPI - remove unconditional backdropFilter
print("\n=== PlatformKPI ===")
fix_file(f"{BASE}/components/atlas/PlatformKPI.tsx", [
    (
        'backdropFilter: "blur(12px)",',
        '...(tc.isDark ? { backdropFilter: "blur(12px)" } : {}),'
    ),
])

# Check if PlatformKPI uses tc
with open(f"{BASE}/components/atlas/PlatformKPI.tsx", 'r') as f:
    pki_content = f.read()
if 'useThemeColors' not in pki_content:
    print("  ! PlatformKPI doesn't use useThemeColors, need to add it")
    # Add import and hook
    pki_content = pki_content.replace(
        'import { useData }',
        'import { useThemeColors } from "@/hooks/atlas/useThemeColors";\nimport { useData }'
    )
    # Add hook call after useData
    pki_content = pki_content.replace(
        'const { data, loading }',
        'const tc = useThemeColors();\n  const { data, loading }'
    )
    with open(f"{BASE}/components/atlas/PlatformKPI.tsx", 'w') as f:
        f.write(pki_content)
    print("  ✓ Added useThemeColors import and hook")

# 3. ExternalPlatform - make backdropFilter conditional
print("\n=== ExternalPlatform ===")
with open(f"{BASE}/pages/atlas/ExternalPlatform.tsx", 'r') as f:
    ext_content = f.read()
if 'useThemeColors' not in ext_content:
    ext_content = ext_content.replace(
        'import { useData }',
        'import { useThemeColors } from "@/hooks/atlas/useThemeColors";\nimport { useData }'
    )
    ext_content = ext_content.replace(
        'const { data',
        'const tc = useThemeColors();\n  const { data'
    )
ext_content = ext_content.replace(
    'style={{ background: overlayBg, backdropFilter: "blur(8px)" }}',
    'style={{ background: overlayBg, ...(tc.isDark ? { backdropFilter: "blur(8px)" } : {}) }}'
)
with open(f"{BASE}/pages/atlas/ExternalPlatform.tsx", 'w') as f:
    f.write(ext_content)
print("  ✓ Fixed ExternalPlatform")

# 4. PatternLab - make backdropFilter conditional
print("\n=== PatternLab ===")
fix_file(f"{BASE}/pages/atlas/PatternLab.tsx", [
    (
        'style={{ background: tc.panelGradient, backdropFilter: "blur(40px)" }}',
        'style={{ background: tc.panelGradient, ...(tc.isDark ? { backdropFilter: "blur(40px)" } : {}) }}'
    ),
    (
        'style={{ background: tc.panelGradient, backdropFilter: "blur(40px)", border: "1px solid rgba(139,127,212,0.15)" }}',
        'style={{ background: tc.panelGradient, ...(tc.isDark ? { backdropFilter: "blur(40px)" } : {}), border: "1px solid rgba(139,127,212,0.15)" }}'
    ),
])

# 5. PiiAtlas - make backdropFilter conditional
print("\n=== PiiAtlas ===")
fix_file(f"{BASE}/pages/atlas/PiiAtlas.tsx", [
    (
        'style={{ background: tc.panelGradient, backdropFilter: "blur(40px)" }}',
        'style={{ background: tc.panelGradient, ...(tc.isDark ? { backdropFilter: "blur(40px)" } : {}) }}'
    ),
])

# 6. KpiCard - make filter:blur conditional on isDark
print("\n=== KpiCard ===")
with open(f"{BASE}/components/atlas/KpiCard.tsx", 'r') as f:
    kpi_content = f.read()
if 'useThemeColors' not in kpi_content:
    kpi_content = kpi_content.replace(
        'import { fmtNum',
        'import { useThemeColors } from "@/hooks/atlas/useThemeColors";\nimport { fmtNum'
    )
# Add tc hook inside the component
if 'const tc = useThemeColors()' not in kpi_content:
    kpi_content = kpi_content.replace(
        'const animatedValue = useCountUp',
        'const tc = useThemeColors();\n  const animatedValue = useCountUp'
    )
# Fix the filter blur animation - only use blur in dark mode
kpi_content = kpi_content.replace(
    'initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}',
    'initial={{ opacity: 0, y: 40, ...(tc.isDark ? { filter: "blur(8px)" } : {}) }}'
)
kpi_content = kpi_content.replace(
    'animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}',
    'animate={inView ? { opacity: 1, y: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) } : {}}'
)
# Fix hardcoded text-white to be theme-aware
kpi_content = kpi_content.replace(
    'className="mono-num text-base sm:text-xl md:text-3xl font-bold text-white"',
    'className={`mono-num text-base sm:text-xl md:text-3xl font-bold ${tc.isDark ? "text-white" : "text-[#1e1b4b]"}`}'
)
# Fix text-gray-400 label
kpi_content = kpi_content.replace(
    'className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-medium leading-tight line-clamp-2"',
    'className={`text-[10px] sm:text-xs md:text-sm ${tc.isDark ? "text-gray-400" : "text-[#4a4578]"} font-medium leading-tight line-clamp-2`}'
)
with open(f"{BASE}/components/atlas/KpiCard.tsx", 'w') as f:
    f.write(kpi_content)
print("  ✓ Fixed KpiCard")

# 7. SectionHeader - make filter:blur conditional
print("\n=== SectionHeader ===")
with open(f"{BASE}/components/atlas/SectionHeader.tsx", 'r') as f:
    sh_content = f.read()
if 'useThemeColors' not in sh_content:
    sh_content = sh_content.replace(
        'import { motion }',
        'import { useThemeColors } from "@/hooks/atlas/useThemeColors";\nimport { motion }'
    )
# Add hook - find the component function
if 'const tc = useThemeColors()' not in sh_content:
    # Find the component body start
    sh_content = sh_content.replace(
        'export default function SectionHeader',
        'export default function SectionHeader'
    )
    # Add after the destructuring
    sh_content = sh_content.replace(
        ') {\n  return',
        ') {\n  const tc = useThemeColors();\n  return'
    )
sh_content = sh_content.replace(
    'initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}',
    'initial={{ opacity: 0, scale: 0.8, ...(tc.isDark ? { filter: "blur(4px)" } : {}) }}'
)
sh_content = sh_content.replace(
    'whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}',
    'whileInView={{ opacity: 1, scale: 1, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}'
)
sh_content = sh_content.replace(
    'initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}',
    'initial={{ opacity: 0, y: 25, ...(tc.isDark ? { filter: "blur(6px)" } : {}) }}'
)
sh_content = sh_content.replace(
    'whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}',
    'whileInView={{ opacity: 1, y: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}'
)
with open(f"{BASE}/components/atlas/SectionHeader.tsx", 'w') as f:
    f.write(sh_content)
print("  ✓ Fixed SectionHeader")

# 8. DrillModal - make filter:blur conditional
print("\n=== DrillModal ===")
with open(f"{BASE}/components/atlas/DrillModal.tsx", 'r') as f:
    dm_content = f.read()
if 'useThemeColors' not in dm_content:
    dm_content = dm_content.replace(
        'import { motion',
        'import { useThemeColors } from "@/hooks/atlas/useThemeColors";\nimport { motion'
    )
if 'const tc = useThemeColors()' not in dm_content:
    # Find the component function start
    dm_content = dm_content.replace(
        'export default function DrillModal',
        'export default function DrillModal'
    )
    # Add after the destructuring
    dm_content = re.sub(
        r'(DrillModal\([^)]*\)\s*\{)',
        r'\1\n  const tc = useThemeColors();',
        dm_content,
        count=1
    )
dm_content = dm_content.replace(
    'initial={{ scale: 0.9, y: 30, filter: "blur(10px)" }}',
    'initial={{ scale: 0.9, y: 30, ...(tc.isDark ? { filter: "blur(10px)" } : {}) }}'
)
dm_content = dm_content.replace(
    'animate={{ scale: 1, y: 0, filter: "blur(0px)" }}',
    'animate={{ scale: 1, y: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}'
)
dm_content = dm_content.replace(
    'exit={{ scale: 0.9, y: 30, filter: "blur(10px)" }}',
    'exit={{ scale: 0.9, y: 30, ...(tc.isDark ? { filter: "blur(10px)" } : {}) }}'
)
# Fix the backdrop-blur-sm class
dm_content = dm_content.replace(
    'className="absolute inset-0 bg-black/60 backdrop-blur-sm"',
    'className={`absolute inset-0 ${tc.isDark ? "bg-black/60 backdrop-blur-sm" : "bg-black/30"}`}'
)
with open(f"{BASE}/components/atlas/DrillModal.tsx", 'w') as f:
    f.write(dm_content)
print("  ✓ Fixed DrillModal")

# 9. IncidentPanel - fix filter:blur and backdrop-blur-sm
print("\n=== IncidentPanel ===")
with open(f"{BASE}/components/atlas/IncidentPanel.tsx", 'r') as f:
    ip_content = f.read()
ip_content = ip_content.replace(
    'initial={{ opacity: 0, x: -60, filter: "blur(12px)" }}',
    'initial={{ opacity: 0, x: -60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}'
)
ip_content = ip_content.replace(
    'animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}',
    'animate={{ opacity: 1, x: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}'
)
ip_content = ip_content.replace(
    'exit={{ opacity: 0, x: -60, filter: "blur(12px)" }}',
    'exit={{ opacity: 0, x: -60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}'
)
# Fix backdrop-blur-sm overlay
ip_content = ip_content.replace(
    'className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"',
    'className={`fixed inset-0 ${tc.isDark ? "bg-black/50 backdrop-blur-sm" : "bg-black/20"} z-[55]`}'
)
# Fix the image overlay backdrop-blur
ip_content = ip_content.replace(
    'className="absolute inset-0 bg-black/90 backdrop-blur-md"',
    'className={`absolute inset-0 ${tc.isDark ? "bg-black/90 backdrop-blur-md" : "bg-black/70"}`}'
)
with open(f"{BASE}/components/atlas/IncidentPanel.tsx", 'w') as f:
    f.write(ip_content)
print("  ✓ Fixed IncidentPanel")

# 10. PatternLab - fix filter:blur and backdrop-blur-sm
print("\n=== PatternLab filter:blur ===")
with open(f"{BASE}/pages/atlas/PatternLab.tsx", 'r') as f:
    pl_content = f.read()
# Fix initial/animate/exit filter blur
pl_content = pl_content.replace(
    'initial={{ opacity: 0, x: -60, filter: "blur(12px)" }}',
    'initial={{ opacity: 0, x: -60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}'
)
pl_content = pl_content.replace(
    'animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}',
    'animate={{ opacity: 1, x: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}'
)
pl_content = pl_content.replace(
    'exit={{ opacity: 0, x: -60, filter: "blur(12px)" }}',
    'exit={{ opacity: 0, x: -60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}'
)
pl_content = pl_content.replace(
    'initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}',
    'initial={{ opacity: 0, y: 60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}'
)
pl_content = pl_content.replace(
    'animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}',
    'animate={{ opacity: 1, y: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}'
)
pl_content = pl_content.replace(
    'exit={{ opacity: 0, y: 60, filter: "blur(12px)" }}',
    'exit={{ opacity: 0, y: 60, ...(tc.isDark ? { filter: "blur(12px)" } : {}) }}'
)
# Fix backdrop-blur-sm overlays
pl_content = pl_content.replace(
    'className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"',
    'className={`fixed inset-0 ${tc.isDark ? "bg-black/50 backdrop-blur-sm" : "bg-black/20"} z-40`}'
)
pl_content = pl_content.replace(
    'className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"',
    'className={`fixed inset-0 ${tc.isDark ? "bg-black/60 backdrop-blur-sm" : "bg-black/25"} z-40`}'
)
with open(f"{BASE}/pages/atlas/PatternLab.tsx", 'w') as f:
    f.write(pl_content)
print("  ✓ Fixed PatternLab")

# 11. PiiAtlas - fix filter:blur and backdrop-blur-sm
print("\n=== PiiAtlas filter:blur ===")
with open(f"{BASE}/pages/atlas/PiiAtlas.tsx", 'r') as f:
    pa_content = f.read()
pa_content = pa_content.replace(
    'initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}',
    'initial={{ opacity: 0, x: -50, ...(tc.isDark ? { filter: "blur(10px)" } : {}) }}'
)
pa_content = pa_content.replace(
    'animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}',
    'animate={{ opacity: 1, x: 0, ...(tc.isDark ? { filter: "blur(0px)" } : {}) }}'
)
pa_content = pa_content.replace(
    'exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}',
    'exit={{ opacity: 0, x: -50, ...(tc.isDark ? { filter: "blur(10px)" } : {}) }}'
)
# Fix backdrop-blur-sm overlay
pa_content = pa_content.replace(
    'className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"',
    'className={`fixed inset-0 ${tc.isDark ? "bg-black/50 backdrop-blur-sm" : "bg-black/20"} z-40`}'
)
with open(f"{BASE}/pages/atlas/PiiAtlas.tsx", 'w') as f:
    f.write(pa_content)
print("  ✓ Fixed PiiAtlas")

# 12. Fix heroOverlay to be fully opaque in light mode
print("\n=== themeColors - heroOverlay ===")
fix_file(f"{BASE}/lib/atlas/themeColors.ts", [
    (
        'heroOverlay: "linear-gradient(135deg, rgba(248,247,244,0.9) 0%, rgba(248,247,244,0.7) 50%, rgba(248,247,244,0.92) 100%)"',
        'heroOverlay: "linear-gradient(135deg, rgba(248,247,244,0.97) 0%, rgba(248,247,244,0.95) 50%, rgba(248,247,244,0.98) 100%)"'
    ),
])

# 13. Fix the AtlasDashboardLayout toast backdrop-filter
print("\n=== AtlasDashboardLayout toast ===")
with open(f"{BASE}/components/atlas/AtlasDashboardLayout.tsx", 'r') as f:
    adl_content = f.read()
adl_content = adl_content.replace(
    'backdrop-filter:blur(10px)`',
    '${isDark ? "backdrop-filter:blur(10px)" : ""}`'
)
# Fix the mobile overlay backdrop-blur-sm
adl_content = adl_content.replace(
    'className={`fixed inset-0 z-[100] ${isDark ? "bg-black/70" : "bg-black/30"} backdrop-blur-sm`}',
    'className={`fixed inset-0 z-[100] ${isDark ? "bg-black/70 backdrop-blur-sm" : "bg-black/30"}`}'
)
with open(f"{BASE}/components/atlas/AtlasDashboardLayout.tsx", 'w') as f:
    f.write(adl_content)
print("  ✓ Fixed AtlasDashboardLayout")

print("\n\n=== ALL FIXES APPLIED ===")

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
    "build": "vite build && node scripts/build-server.js",
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
    "@types/ws": "^8.18.1",
    "adm-zip": "^0.5.16",
    "archiver": "^7.0.1",
    "axios": "^1.12.0",
    "bcryptjs": "^3.0.3",
    "canvas": "^3.2.1",
    "chart.js": "^4.5.1",
    "chartjs-node-canvas": "^5.0.0",
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
    "express-fileupload": "^1.5.2",
    "framer-motion": "^12.23.22",
    "fs-extra": "^11.3.3",
    "html-to-image": "^1.11.13",
    "html2canvas": "^1.4.1",
    "html2canvas-pro": "^1.6.7",
    "html2pdf.js": "^0.14.0",
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
    "pdf-parse": "^2.4.5",
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
    "uuid": "^13.0.0",
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
    "@types/express-fileupload": "^1.5.1",
    "@types/fs-extra": "^11.0.4",
    "@types/google.maps": "^3.58.1",
    "@types/html2canvas": "^1.0.0",
    "@types/multer": "^2.0.0",
    "@types/node": "^24.7.0",
    "@types/pdf-parse": "^1.1.5",
    "@types/qrcode": "^1.5.6",
    "@types/react": "^19.2.1",
    "@types/react-dom": "^19.2.1",
    "@types/uuid": "^11.0.0",
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

## `public/evidence_mapping.json`

```json
{
  "REAL-001": [
    "/evidence/evidence_001_Autostrad_Telecom_&_Connectivi_1.png",
    "/evidence/evidence_001_Autostrad_Telecom_&_Connectivi_2.png"
  ],
  "REAL-002": [
    "/evidence/evidence_002_Dinar.sa_Saudi_Investment_Plat_1.png",
    "/evidence/evidence_002_Dinar.sa_Saudi_Investment_Plat_2.png",
    "/evidence/evidence_002_Dinar.sa_Saudi_Investment_Plat_3.png"
  ],
  "REAL-003": [
    "/evidence/evidence_003_Texcomp_1.png",
    "/evidence/evidence_003_Texcomp_2.png",
    "/evidence/evidence_003_Texcomp_3.png"
  ],
  "REAL-004": [
    "/evidence/evidence_004_2026_Hajj_Lottery_System_Saudi_1.png",
    "/evidence/evidence_004_2026_Hajj_Lottery_System_Saudi_2.png",
    "/evidence/evidence_004_2026_Hajj_Lottery_System_Saudi_3.png"
  ],
  "REAL-005": [
    "/evidence/evidence_005_Shukah.com_Saudi_E-commerce_1.png",
    "/evidence/evidence_005_Shukah.com_Saudi_E-commerce_2.png",
    "/evidence/evidence_005_Shukah.com_Saudi_E-commerce_3.png"
  ],
  "REAL-006": [
    "/evidence/evidence_006_Arabian_Health_Care_Supply_AHC_1.png",
    "/evidence/evidence_006_Arabian_Health_Care_Supply_AHC_2.png",
    "/evidence/evidence_006_Arabian_Health_Care_Supply_AHC_3.png"
  ],
  "REAL-007": [
    "/evidence/evidence_007_Health_Services_Association_Qa_1.png",
    "/evidence/evidence_007_Health_Services_Association_Qa_2.png",
    "/evidence/evidence_007_Health_Services_Association_Qa_3.png"
  ],
  "REAL-008": [
    "/evidence/evidence_008_Health_Services_Association,_Q_1.png",
    "/evidence/evidence_008_Health_Services_Association,_Q_2.png"
  ],
  "REAL-009": [
    "/evidence/evidence_009_Saudi_Icon_saudi-icon.com_1.png",
    "/evidence/evidence_009_Saudi_Icon_saudi-icon.com_2.png",
    "/evidence/evidence_009_Saudi_Icon_saudi-icon.com_3.png"
  ],
  "REAL-010": [
    "/evidence/evidence_010_Omrania_Architecture_&_Enginee_1.png",
    "/evidence/evidence_010_Omrania_Architecture_&_Enginee_2.png"
  ],
  "REAL-011": [
    "/evidence/evidence_011_Arab_Falcons_arabfalcons.com_1.png",
    "/evidence/evidence_011_Arab_Falcons_arabfalcons.com_2.png",
    "/evidence/evidence_011_Arab_Falcons_arabfalcons.com_3.png"
  ],
  "REAL-012": [
    "/evidence/evidence_012_University_of_Tabuk_ut.edu.sa_1.png",
    "/evidence/evidence_012_University_of_Tabuk_ut.edu.sa_2.png",
    "/evidence/evidence_012_University_of_Tabuk_ut.edu.sa_3.png"
  ],
  "REAL-013": [
    "/evidence/evidence_013_Saudi_Sports_Club_Roshn_League_1.png",
    "/evidence/evidence_013_Saudi_Sports_Club_Roshn_League_2.png"
  ],
  "REAL-014": [
    "/evidence/evidence_014_Al-Ahli_Saudi_FC_1.png",
    "/evidence/evidence_014_Al-Ahli_Saudi_FC_2.png"
  ],
  "REAL-015": [
    "/evidence/evidence_015_Arabia_Holding_arabia-holding._1.png",
    "/evidence/evidence_015_Arabia_Holding_arabia-holding._2.png",
    "/evidence/evidence_015_Arabia_Holding_arabia-holding._3.png"
  ],
  "REAL-016": [
    "/evidence/evidence_016_Meena_Health_Multiple_clinics__1.png",
    "/evidence/evidence_016_Meena_Health_Multiple_clinics__2.png",
    "/evidence/evidence_016_Meena_Health_Multiple_clinics__3.png"
  ],
  "REAL-017": [
    "/evidence/evidence_017_Al_Quraishi_Marketing_Co._Ltd_1.png",
    "/evidence/evidence_017_Al_Quraishi_Marketing_Co._Ltd_2.png",
    "/evidence/evidence_017_Al_Quraishi_Marketing_Co._Ltd_3.png"
  ],
  "REAL-018": [
    "/evidence/evidence_018_iHR_Saudi_Arabia_1.png",
    "/evidence/evidence_018_iHR_Saudi_Arabia_2.png"
  ],
  "REAL-019": [
    "/evidence/evidence_019_Abdul_Latif_Jameel_Motors_1.png",
    "/evidence/evidence_019_Abdul_Latif_Jameel_Motors_2.png"
  ],
  "REAL-020": [
    "/evidence/evidence_020_Zain_KSA_1.png",
    "/evidence/evidence_020_Zain_KSA_2.png",
    "/evidence/evidence_020_Zain_KSA_3.png"
  ],
  "REAL-021": [
    "/evidence/evidence_021_Alissa_Group_Abdul_Latif_Aliss_1.png",
    "/evidence/evidence_021_Alissa_Group_Abdul_Latif_Aliss_2.png"
  ],
  "REAL-022": [
    "/evidence/evidence_022_United_Lube_Oil_Company_UNILUB_1.png",
    "/evidence/evidence_022_United_Lube_Oil_Company_UNILUB_2.png"
  ],
  "REAL-023": [
    "/evidence/evidence_023_Sunbulah_Group_1.png",
    "/evidence/evidence_023_Sunbulah_Group_2.png"
  ],
  "REAL-024": [
    "/evidence/evidence_024_Al-Babtain_Power_&_Telecommuni_1.png",
    "/evidence/evidence_024_Al-Babtain_Power_&_Telecommuni_2.png",
    "/evidence/evidence_024_Al-Babtain_Power_&_Telecommuni_3.png"
  ],
  "REAL-025": [
    "/evidence/evidence_025_Allure_Clinics,_Riyadh_1.png",
    "/evidence/evidence_025_Allure_Clinics,_Riyadh_2.png"
  ],
  "REAL-026": [
    "/evidence/evidence_026_KMSSA_kmssa.net_1.png",
    "/evidence/evidence_026_KMSSA_kmssa.net_2.png"
  ],
  "REAL-027": [
    "/evidence/evidence_027_KMSSA.net_Saudi_Company_1.png",
    "/evidence/evidence_027_KMSSA.net_Saudi_Company_2.png",
    "/evidence/evidence_027_KMSSA.net_Saudi_Company_3.png"
  ],
  "REAL-028": [
    "/evidence/evidence_028_MENA_Delivery_Platform_operati_1.png",
    "/evidence/evidence_028_MENA_Delivery_Platform_operati_2.png",
    "/evidence/evidence_028_MENA_Delivery_Platform_operati_3.png"
  ],
  "REAL-029": [
    "/evidence/evidence_029_MENA_Delivery_Shipping_Platfor_1.png",
    "/evidence/evidence_029_MENA_Delivery_Shipping_Platfor_2.png",
    "/evidence/evidence_029_MENA_Delivery_Shipping_Platfor_3.png"
  ],
  "REAL-030": [
    "/evidence/evidence_030_Saudi_Recruitment_Database_1.png",
    "/evidence/evidence_030_Saudi_Recruitment_Database_2.png"
  ],
  "REAL-031": [
    "/evidence/evidence_031_Saudi_Recruitment_Platform_1.png",
    "/evidence/evidence_031_Saudi_Recruitment_Platform_2.png",
    "/evidence/evidence_031_Saudi_Recruitment_Platform_3.png"
  ],
  "REAL-032": [
    "/evidence/evidence_032_Saudi_E-Commerce_Shop_1.png",
    "/evidence/evidence_032_Saudi_E-Commerce_Shop_2.png",
    "/evidence/evidence_032_Saudi_E-Commerce_Shop_3.png"
  ],
  "REAL-033": [
    "/evidence/evidence_033_Saudi_Government_Ministries_1.png",
    "/evidence/evidence_033_Saudi_Government_Ministries_2.png"
  ],
  "REAL-034": [
    "/evidence/evidence_034_DIGO_Saudi_Tech_Company_1.png",
    "/evidence/evidence_034_DIGO_Saudi_Tech_Company_2.png"
  ],
  "REAL-035": [
    "/evidence/evidence_035_Saudi_Arabian_Citizens_Educati_1.png",
    "/evidence/evidence_035_Saudi_Arabian_Citizens_Educati_2.png",
    "/evidence/evidence_035_Saudi_Arabian_Citizens_Educati_3.png"
  ],
  "REAL-036": [
    "/evidence/evidence_036_Ministry_of_Human_Resources_an_1.png",
    "/evidence/evidence_036_Ministry_of_Human_Resources_an_2.png"
  ],
  "REAL-037": [
    "/evidence/evidence_037_Saudi_Aramco_&_Saudi_Infrastru_1.png",
    "/evidence/evidence_037_Saudi_Aramco_&_Saudi_Infrastru_2.png"
  ],
  "REAL-038": [
    "/evidence/evidence_038_Saudi_Customs_1.png",
    "/evidence/evidence_038_Saudi_Customs_2.png"
  ],
  "REAL-039": [
    "/evidence/evidence_039_Multiple_Saudi_Government_Syst_1.png",
    "/evidence/evidence_039_Multiple_Saudi_Government_Syst_2.png",
    "/evidence/evidence_039_Multiple_Saudi_Government_Syst_3.png"
  ],
  "REAL-040": [
    "/evidence/evidence_040_Tatweer_Buildings_Company_1.png",
    "/evidence/evidence_040_Tatweer_Buildings_Company_2.png",
    "/evidence/evidence_040_Tatweer_Buildings_Company_3.png"
  ],
  "REAL-041": [
    "/evidence/evidence_041_Saudi_Bank_unnamed_1.png",
    "/evidence/evidence_041_Saudi_Bank_unnamed_2.png"
  ],
  "REAL-042": [
    "/evidence/evidence_042_Multinational_Retail_Company_S_1.png",
    "/evidence/evidence_042_Multinational_Retail_Company_S_2.png",
    "/evidence/evidence_042_Multinational_Retail_Company_S_3.png"
  ],
  "REAL-043": [
    "/evidence/evidence_043_Louis_Vuitton_Saudi_Arabia_1.png",
    "/evidence/evidence_043_Louis_Vuitton_Saudi_Arabia_2.png",
    "/evidence/evidence_043_Louis_Vuitton_Saudi_Arabia_3.png"
  ],
  "REAL-044": [
    "/evidence/evidence_044_Alinma_Bank_1.png",
    "/evidence/evidence_044_Alinma_Bank_2.png"
  ],
  "REAL-045": [
    "/evidence/evidence_045_Taif_Municipality_taifcity.gov_1.png",
    "/evidence/evidence_045_Taif_Municipality_taifcity.gov_2.png",
    "/evidence/evidence_045_Taif_Municipality_taifcity.gov_3.png"
  ],
  "REAL-046": [
    "/evidence/evidence_046_Saudi_Games_1.png",
    "/evidence/evidence_046_Saudi_Games_2.png"
  ],
  "REAL-047": [
    "/evidence/evidence_047_Saudi_Government_Entity_1.png",
    "/evidence/evidence_047_Saudi_Government_Entity_2.png",
    "/evidence/evidence_047_Saudi_Government_Entity_3.png"
  ],
  "REAL-048": [
    "/evidence/evidence_048_Private_Organization_Saudi_Nav_1.png",
    "/evidence/evidence_048_Private_Organization_Saudi_Nav_2.png"
  ],
  "REAL-049": [
    "/evidence/evidence_049_Gold's_Gym_Arabia_1.png",
    "/evidence/evidence_049_Gold's_Gym_Arabia_2.png",
    "/evidence/evidence_049_Gold's_Gym_Arabia_3.png"
  ],
  "REAL-050": [
    "/evidence/evidence_050_Diyar_United_Company_diyar.com_1.png",
    "/evidence/evidence_050_Diyar_United_Company_diyar.com_2.png"
  ],
  "REAL-051": [
    "/evidence/evidence_051_Saudi_Diyar_Consultants_1.png",
    "/evidence/evidence_051_Saudi_Diyar_Consultants_2.png",
    "/evidence/evidence_051_Saudi_Diyar_Consultants_3.png"
  ],
  "REAL-052": [
    "/evidence/evidence_052_Saudi_BianLian_Victims_1.png",
    "/evidence/evidence_052_Saudi_BianLian_Victims_2.png",
    "/evidence/evidence_052_Saudi_BianLian_Victims_3.png"
  ],
  "REAL-053": [
    "/evidence/evidence_053_King's_College_Hospital_Jeddah_1.png",
    "/evidence/evidence_053_King's_College_Hospital_Jeddah_2.png",
    "/evidence/evidence_053_King's_College_Hospital_Jeddah_3.png"
  ],
  "REAL-054": [
    "/evidence/evidence_054_Technical_and_Vocational_Train_1.png",
    "/evidence/evidence_054_Technical_and_Vocational_Train_2.png"
  ],
  "REAL-055": [
    "/evidence/evidence_055_Jamjoom_Pharmaceuticals_1.png",
    "/evidence/evidence_055_Jamjoom_Pharmaceuticals_2.png",
    "/evidence/evidence_055_Jamjoom_Pharmaceuticals_3.png"
  ],
  "REAL-056": [
    "/evidence/evidence_056_Saudi_Binladin_Group_1.png",
    "/evidence/evidence_056_Saudi_Binladin_Group_2.png"
  ],
  "REAL-057": [
    "/evidence/evidence_057_Rawafid_Industrial_Company_1.png",
    "/evidence/evidence_057_Rawafid_Industrial_Company_2.png",
    "/evidence/evidence_057_Rawafid_Industrial_Company_3.png"
  ],
  "REAL-058": [
    "/evidence/evidence_058_First_International_Food_Compa_1.png",
    "/evidence/evidence_058_First_International_Food_Compa_2.png",
    "/evidence/evidence_058_First_International_Food_Compa_3.png"
  ],
  "REAL-059": [
    "/evidence/evidence_059_my.gov.sa_1.png",
    "/evidence/evidence_059_my.gov.sa_2.png"
  ],
  "REAL-060": [
    "/evidence/evidence_060_Royal_Saudi_Air_Force_1.png",
    "/evidence/evidence_060_Royal_Saudi_Air_Force_2.png",
    "/evidence/evidence_060_Royal_Saudi_Air_Force_3.png"
  ],
  "REAL-061": [
    "/evidence/evidence_061_Saudi_Professional_League_SPL__1.png",
    "/evidence/evidence_061_Saudi_Professional_League_SPL__2.png"
  ],
  "REAL-062": [
    "/evidence/evidence_062_NEOM_Project_1.png",
    "/evidence/evidence_062_NEOM_Project_2.png"
  ],
  "REAL-063": [
    "/evidence/evidence_063_El_Seif_Development_Company_1.png",
    "/evidence/evidence_063_El_Seif_Development_Company_2.png"
  ],
  "REAL-064": [
    "/evidence/evidence_064_General_Intelligence_Presidenc_1.png",
    "/evidence/evidence_064_General_Intelligence_Presidenc_2.png",
    "/evidence/evidence_064_General_Intelligence_Presidenc_3.png"
  ],
  "REAL-065": [
    "/evidence/evidence_065_Al_Hilal_Saudi_Football_Club_1.png",
    "/evidence/evidence_065_Al_Hilal_Saudi_Football_Club_2.png"
  ],
  "REAL-066": [
    "/evidence/evidence_066_Saudi_Military_and_Government_1.png",
    "/evidence/evidence_066_Saudi_Military_and_Government_2.png"
  ],
  "REAL-067": [
    "/evidence/evidence_067_Al_Bawani_Construction_Company_1.png",
    "/evidence/evidence_067_Al_Bawani_Construction_Company_2.png",
    "/evidence/evidence_067_Al_Bawani_Construction_Company_3.png"
  ],
  "REAL-068": [
    "/evidence/evidence_068_alojaimi.com_1.png",
    "/evidence/evidence_068_alojaimi.com_2.png",
    "/evidence/evidence_068_alojaimi.com_3.png"
  ],
  "REAL-069": [
    "/evidence/evidence_069_dms-ksa.com_1.png",
    "/evidence/evidence_069_dms-ksa.com_2.png",
    "/evidence/evidence_069_dms-ksa.com_3.png"
  ],
  "REAL-070": [
    "/evidence/evidence_070_NEOM_1.png",
    "/evidence/evidence_070_NEOM_2.png"
  ],
  "REAL-071": [
    "/evidence/evidence_071_awad.sa_1.png",
    "/evidence/evidence_071_awad.sa_2.png"
  ],
  "REAL-072": [
    "/evidence/evidence_072_Aflak_Electronics_Industries_a_1.png",
    "/evidence/evidence_072_Aflak_Electronics_Industries_a_2.png"
  ],
  "REAL-073": [
    "/evidence/evidence_073_Al_Saleh,_Al_Sihli_&_Partners__1.png",
    "/evidence/evidence_073_Al_Saleh,_Al_Sihli_&_Partners__2.png",
    "/evidence/evidence_073_Al_Saleh,_Al_Sihli_&_Partners__3.png"
  ],
  "REAL-074": [
    "/evidence/evidence_074_Shoor_Consultancy_shoor.cc_1.png",
    "/evidence/evidence_074_Shoor_Consultancy_shoor.cc_2.png"
  ],
  "REAL-075": [
    "/evidence/evidence_075_Hashem_Contracting_hashem-cont_1.png",
    "/evidence/evidence_075_Hashem_Contracting_hashem-cont_2.png"
  ],
  "REAL-076": [
    "/evidence/evidence_076_Haji_Husein_Alireza_&_Co._1.png",
    "/evidence/evidence_076_Haji_Husein_Alireza_&_Co._2.png",
    "/evidence/evidence_076_Haji_Husein_Alireza_&_Co._3.png"
  ],
  "REAL-077": [
    "/evidence/evidence_077_Pan_Gulf_Holding_1.png",
    "/evidence/evidence_077_Pan_Gulf_Holding_2.png"
  ],
  "REAL-078": [
    "/evidence/evidence_078_Saudi_Healthcare_Provider_1.png",
    "/evidence/evidence_078_Saudi_Healthcare_Provider_2.png"
  ],
  "REAL-079": [
    "/evidence/evidence_079_Multiple_Saudi_Organizations_a_1.png",
    "/evidence/evidence_079_Multiple_Saudi_Organizations_a_2.png",
    "/evidence/evidence_079_Multiple_Saudi_Organizations_a_3.png"
  ],
  "REAL-080": [
    "/evidence/evidence_080_Jarir_Bookstore_Jarir_Marketin_1.png",
    "/evidence/evidence_080_Jarir_Bookstore_Jarir_Marketin_2.png",
    "/evidence/evidence_080_Jarir_Bookstore_Jarir_Marketin_3.png"
  ],
  "REAL-081": [
    "/evidence/evidence_081_Fursan_Travel_1.png",
    "/evidence/evidence_081_Fursan_Travel_2.png",
    "/evidence/evidence_081_Fursan_Travel_3.png"
  ],
  "REAL-082": [
    "/evidence/evidence_082_saudi.gov.sa_GOV.SA_Portal_1.png",
    "/evidence/evidence_082_saudi.gov.sa_GOV.SA_Portal_2.png",
    "/evidence/evidence_082_saudi.gov.sa_GOV.SA_Portal_3.png"
  ],
  "REAL-083": [
    "/evidence/evidence_083_General_Secretariat_Military_S_1.png",
    "/evidence/evidence_083_General_Secretariat_Military_S_2.png"
  ],
  "REAL-084": [
    "/evidence/evidence_084_Saudi_Government_Department_He_1.png",
    "/evidence/evidence_084_Saudi_Government_Department_He_2.png",
    "/evidence/evidence_084_Saudi_Government_Department_He_3.png"
  ],
  "REAL-085": [
    "/evidence/evidence_085_Saudi_Journalists_Association_1.png",
    "/evidence/evidence_085_Saudi_Journalists_Association_2.png"
  ],
  "REAL-086": [
    "/evidence/evidence_086_Saudi_Government_Postal_System_1.png",
    "/evidence/evidence_086_Saudi_Government_Postal_System_2.png",
    "/evidence/evidence_086_Saudi_Government_Postal_System_3.png"
  ],
  "REAL-087": [
    "/evidence/evidence_087_Riyadh_Airports_Company_RAC_1.png",
    "/evidence/evidence_087_Riyadh_Airports_Company_RAC_2.png",
    "/evidence/evidence_087_Riyadh_Airports_Company_RAC_3.png"
  ],
  "REAL-088": [
    "/evidence/evidence_088_Noon.com_1.png",
    "/evidence/evidence_088_Noon.com_2.png",
    "/evidence/evidence_088_Noon.com_3.png"
  ],
  "REAL-089": [
    "/evidence/evidence_089_ICICI_Bank_Saudi_Arabia_1.png",
    "/evidence/evidence_089_ICICI_Bank_Saudi_Arabia_2.png"
  ],
  "REAL-090": [
    "/evidence/evidence_090_brightwires.com.sa_1.png",
    "/evidence/evidence_090_brightwires.com.sa_2.png",
    "/evidence/evidence_090_brightwires.com.sa_3.png"
  ],
  "REAL-091": [
    "/evidence/evidence_091_Saudia_MRO_Saudia_Technic_1.png",
    "/evidence/evidence_091_Saudia_MRO_Saudia_Technic_2.png"
  ],
  "REAL-092": [
    "/evidence/evidence_092_Al_Mujtama_Pharmacy_Saudi_phar_1.png",
    "/evidence/evidence_092_Al_Mujtama_Pharmacy_Saudi_phar_2.png",
    "/evidence/evidence_092_Al_Mujtama_Pharmacy_Saudi_phar_3.png"
  ],
  "REAL-093": [
    "/evidence/evidence_093_Ministry_of_Foreign_Affairs_MO_1.png",
    "/evidence/evidence_093_Ministry_of_Foreign_Affairs_MO_2.png",
    "/evidence/evidence_093_Ministry_of_Foreign_Affairs_MO_3.png"
  ],
  "REAL-094": [
    "/evidence/evidence_094_Ministry_of_Industry_and_Miner_1.png",
    "/evidence/evidence_094_Ministry_of_Industry_and_Miner_2.png",
    "/evidence/evidence_094_Ministry_of_Industry_and_Miner_3.png"
  ],
  "REAL-095": [
    "/evidence/evidence_095_SAED_International_1.png",
    "/evidence/evidence_095_SAED_International_2.png"
  ],
  "REAL-096": [
    "/evidence/evidence_096_Arail_LLC_Construction_1.png",
    "/evidence/evidence_096_Arail_LLC_Construction_2.png"
  ],
  "REAL-097": [
    "/evidence/evidence_097_Royal_Commission_for_Riyadh_Ci_1.png",
    "/evidence/evidence_097_Royal_Commission_for_Riyadh_Ci_2.png"
  ],
  "REAL-098": [
    "/evidence/evidence_098_Al_Tamimi_Law_Firm_1.png",
    "/evidence/evidence_098_Al_Tamimi_Law_Firm_2.png"
  ],
  "REAL-099": [
    "/evidence/evidence_099_M.A._AL_ABDUL_KARIM_&_CO_ak.co_1.png",
    "/evidence/evidence_099_M.A._AL_ABDUL_KARIM_&_CO_ak.co_2.png"
  ],
  "REAL-100": [
    "/evidence/evidence_100_Communications_Solutions_Compa_1.png",
    "/evidence/evidence_100_Communications_Solutions_Compa_2.png",
    "/evidence/evidence_100_Communications_Solutions_Compa_3.png"
  ],
  "REAL-101": [
    "/evidence/evidence_101_Graff_Saudi_Royal_Family_membe_1.png",
    "/evidence/evidence_101_Graff_Saudi_Royal_Family_membe_2.png",
    "/evidence/evidence_101_Graff_Saudi_Royal_Family_membe_3.png"
  ],
  "REAL-102": [
    "/evidence/evidence_102_Al_Watania_alwatania.sa_1.png",
    "/evidence/evidence_102_Al_Watania_alwatania.sa_2.png"
  ],
  "REAL-103": [
    "/evidence/evidence_103_Saudi_Aramco_1.png",
    "/evidence/evidence_103_Saudi_Aramco_2.png",
    "/evidence/evidence_103_Saudi_Aramco_3.png"
  ],
  "REAL-104": [
    "/evidence/evidence_104_GlobeMed_Saudi_1.png",
    "/evidence/evidence_104_GlobeMed_Saudi_2.png"
  ],
  "REAL-105": [
    "/evidence/evidence_105_Virgin_Mobile_KSA_1.png",
    "/evidence/evidence_105_Virgin_Mobile_KSA_2.png",
    "/evidence/evidence_105_Virgin_Mobile_KSA_3.png"
  ],
  "REAL-106": [
    "/evidence/evidence_106_King_Saud_University_KSU_1.png",
    "/evidence/evidence_106_King_Saud_University_KSU_2.png",
    "/evidence/evidence_106_King_Saud_University_KSU_3.png"
  ],
  "REAL-107": [
    "/evidence/evidence_107_Dalil_Caller_ID_App_1.png",
    "/evidence/evidence_107_Dalil_Caller_ID_App_2.png"
  ],
  "REAL-108": [
    "/evidence/evidence_108_Future_Investment_Initiative_F_1.png",
    "/evidence/evidence_108_Future_Investment_Initiative_F_2.png",
    "/evidence/evidence_108_Future_Investment_Initiative_F_3.png"
  ],
  "REAL-109": [
    "/evidence/evidence_109_Careem_Ride-hailing_App_1.png",
    "/evidence/evidence_109_Careem_Ride-hailing_App_2.png",
    "/evidence/evidence_109_Careem_Ride-hailing_App_3.png"
  ],
  "REAL-110": [
    "/evidence/evidence_110_Mobily_Etihad_Etisalat_1.png",
    "/evidence/evidence_110_Mobily_Etihad_Etisalat_2.png",
    "/evidence/evidence_110_Mobily_Etihad_Etisalat_3.png"
  ]
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
- [x] Overview Dashboard (combined incidents + followups)
- [x] Incidents Dashboard with drill-down
- [x] My Dashboard (customizable layout)

## Phase 4: Detail Pages
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
- [x] Copy all 69 pages from Platform 1 (104 pages exist)
- [x] Copy unique pages from Platform 2 (merged — 112 total pages)
- [x] Copy all 30+ components from Platform 1 (79 components exist)
- [x] Copy unique components from Platform 2 (merged)
- [x] Copy index.css theme from Platform 1 (royal blue dark theme)
- [x] Copy App.tsx routes and navigation from Platform 1
- [x] Merge Platform 2 unique routes into App.tsx
- [x] Fix all imports and paths after merge
- [x] Apply local auth system (already exists in both platforms)
- [x] Verify royal blue background (not black)
- [x] Use Rasid character for Smart AI icon
- [x] Professional logo animation
- [x] Article 12 compliance with 8 clauses evaluation
- [x] Dashboard with dual indicator groups (general + 8 clauses)
- [x] Import 24,983 Saudi domains from CSV
- [x] Verify all features work end-to-end
- [x] Write/update tests
- [x] Save checkpoint

## Phase 10 - Apply Platform 2 Design (User Request)
- [x] Review Platform 2 CSS theme and design (the correct design)
- [x] Copy Platform 2 index.css theme to merged platform
- [x] Apply Platform 2 design patterns to layout/navigation
- [x] Fix all build errors (missing packages, imports)
- [x] Save checkpoint with working build

## Phase 11 - GitHub & Auth Fix
- [x] Create private GitHub repo (raneemndmo-collab/rasid-national-platform)
- [x] Push all code to GitHub
- [x] Fix getLoginUrl to redirect to /login (local) instead of Manus OAuth
- [x] Fix AppLayout.tsx OAuth redirect to use /login
- [x] Save checkpoint with working build

## Phase 12 - Fix DB Errors (Missing Columns)
- [x] Add missing columns to sites table (domain, siteName, sectorType, classification, siteStatus, etc.)
- [x] Add 'link' column to notifications table
- [x] Add missing columns to scheduled_reports table
- [x] Update migration journal
- [x] Verify all dashboard queries work (stats, clauseStats, sectorCompliance, etc.)
- [x] Verify no new errors after server restart
- [x] Save checkpoint

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

## Phase 14 - إصلاح القائمة الجانبية والتفاعلات والخطوط
- [x] إصلاح القائمة الجانبية: يجب أن تبقى نفسها عند الانتقال لصفحات أطلس (لا تتغير)
- [x] إضافة cursor:pointer لجميع البطاقات والعناصر القابلة للنقر في كل الصفحات
- [x] توحيد حجم الخطوط في جميع صفحات المنصة ليطابق الصورة المرجعية

## Phase 16 - أدوات الخصوصية للذكاء الاصطناعي
- [x] إضافة 6 أدوات خصوصية جديدة (DSAR, تقييمات, موافقات, سجلات معالجة, DPIA, ملخص شامل)
- [x] ربط الأدوات بجداول قاعدة البيانات (dsar_requests, consent_records, processing_records, dpia_assessments)
- [x] إضافة ملخص شامل لحالة الامتثال يجمع بين كل المؤشرات

## Phase 15 - حملة الاستنفار: فحص البيانات الثابتة
- [x] فحص جميع 125 صفحة في المنصة
- [x] فحص تفصيلي لـ 37 صفحة مشبوهة بالتوازي
- [x] إصلاح Reports.tsx - ربط radarData, monthlyTrends, policyGaps, recommendations بقاعدة البيانات
- [x] PublicVerify.tsx سليم - يستخدم documentation.verify API حقيقي
- [x] إصلاح OsintTools.tsx - استبدال رقم 43+ الثابت بعدد ديناميكي
- [x] إصلاح ThreatRules.tsx - استبدال رقم 25 الثابت بعدد ديناميكي
- [x] إنشاء جدول leaks في Manus DB ونقل 110 حالة رصد من CDN
- [x] إضافة reports.analytics endpoint للراوتر

```

---

## `trigger-rebuild.txt`

```text
// Trigger rebuild Thu Feb 26 05:11:01 EST 2026

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

## `ui_testing_notes.md`

```markdown
# ملاحظات اختبار واجهة الصفحات المخصصة

## صفحة لوحة المؤشرات المخصصة (DynamicDashboard)
- العنوان: "لوحة مؤشرات جديدة"
- يعرض "0 عنصر • وضع التعديل"
- أزرار: إضافة عنصر، حفظ، معاينة
- حالة فارغة تعرض رسالة: "لوحة فارغة - ابدأ بإضافة عناصر لبناء لوحة المؤشرات الخاصة بك"
- يوجد زر "إضافة عنصر" كبير
- يوجد 3 نماذج جاهزة: لوحة قيادية، لوحة تشغيلية، لوحة تحليلية
- القائمة الجانبية تعرض: الرئيسية، لوحات المؤشرات، تحليل الحالات (ATLAS)، تحليل الحالات (LEAK ANALYSIS)، لوحات شخصية/مراكز، اللوحات المخصصة (1)
- قسم "اللوحات المخصصة" يظهر بعداد (1) يشير لوجود صفحة مخصصة واحدة

## ملاحظات القائمة الجانبية
- القائمة الجانبية مطوية (collapsed) عند الدخول للصفحة المخصصة
- يوجد قسم "اللوحات المخصصة" مع عداد يعرض عدد الصفحات
- القائمة الجانبية تتضمن بحث سريع (Ctrl+K)

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
// =============================================================================
// Fix: lightningcss (used by Tailwind v4) converts backdrop-filter to only
// -webkit-backdrop-filter when targeting Safari 16.4. This plugin adds back
// the standard property so CSS !important rules can override inline styles.
// See: https://github.com/parcel-bundler/lightningcss/issues/695
// =============================================================================
function vitePluginBackdropFilterFix(): Plugin {
  return {
    name: "fix-backdrop-filter",
    enforce: "post",
    // Fix CSS in dev mode (transform hook)
    transform(code, id) {
      if (!id.endsWith(".css") && !id.includes("lang.css")) return;
      return addStandardBackdropFilter(code);
    },
    // Fix CSS in production build (generateBundle hook)
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (fileName.endsWith(".css") && chunk.type === "asset" && typeof chunk.source === "string") {
          chunk.source = addStandardBackdropFilter(chunk.source);
        }
      }
    },
  };
}

/**
 * For every -webkit-backdrop-filter declaration that doesn't already have
 * a standard backdrop-filter sibling, insert the standard property right after.
 */
function addStandardBackdropFilter(css: string): string {
  // Match -webkit-backdrop-filter that is NOT immediately followed by backdrop-filter
  // This regex finds -webkit-backdrop-filter:VALUE and adds backdrop-filter:VALUE after it
  return css.replace(
    /(-webkit-backdrop-filter\s*:\s*)([^;}]+)(\s*[;}])/g,
    (match, prefix, value, ending) => {
      // Check if the standard property already follows
      // We add it right after the -webkit- version
      const standardProp = `backdrop-filter:${value}`;
      // If the match already contains the standard property nearby, skip
      if (match.includes("backdrop-filter:") && !match.includes("-webkit-")) {
        return match;
      }
      // Add the standard property after the -webkit- one
      if (ending.trim() === "}") {
        return `${prefix}${value};${standardProp}${ending}`;
      }
      return `${prefix}${value};${standardProp}${ending}`;
    }
  );
}

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

const plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector(), vitePluginBackdropFilterFix()];

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

