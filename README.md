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
