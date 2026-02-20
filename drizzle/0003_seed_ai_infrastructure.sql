-- ═══════════════════════════════════════════════════════════════
-- SEED DATA: AI Infrastructure — Glossary, Page Descriptors, Templates
-- DB-01 to DB-13 seed data for Smart Monitor requirements
-- ═══════════════════════════════════════════════════════════════

-- ═══ GLOSSARY TERMS — حالات الرصد (breaches domain) ═══

INSERT INTO `ai_glossary` (`domain`, `term`, `term_en`, `synonyms`, `definition`, `related_page`, `related_entity`, `example_questions`, `is_active`) VALUES
('breaches', 'حالة رصد', 'Detection Case', '["حالات رصد","رصد","حالة"]', 'ادعاء بوجود تسريب بيانات شخصية يتم رصده ومتابعته. لا يُعتبر تسريباً مؤكداً حتى اكتمال التحقق.', '/leaks', 'leak', '["كم حالة رصد جديدة؟","أعرض حالات الرصد واسعة النطاق"]', 1),
('breaches', 'العدد المُدّعى', 'Claimed Count', '["ادعاء البائع","العدد المزعوم"]', 'الرقم الذي يذكره البائع أو الناشر عن حجم البيانات — لم يتم التحقق منه.', '/leaks', 'leak', '["كم العدد المُدّعى؟","ما ادعاء البائع؟"]', 1),
('breaches', 'العينات المتاحة', 'Available Samples', '["عينات","بيانات موثقة"]', 'البيانات التي تم جمعها وتوثيقها فعلياً داخل منصة راصد.', '/leaks', 'leak', '["كم عينة متاحة؟","أعرض العينات"]', 1),
('breaches', 'تسريب مؤكد', 'Confirmed Breach', '["مؤكد","حالة مؤكدة"]', 'حالة رصد تم التحقق منها وتأكيد صحة التسريب — فقط بعد اكتمال التحقق الرسمي.', '/leaks', 'leak', '["هل هذا تسريب مؤكد؟","كم تسريب مؤكد؟"]', 1),
('breaches', 'سلسلة الأدلة', 'Evidence Chain', '["أدلة رقمية","توثيق"]', 'تسلسل موثق للأدلة الرقمية المرتبطة بحالة رصد — يحافظ على سلامة الدليل.', '/evidence-chain', 'evidence', '["وثّق دليل جديد","أعرض سلسلة الأدلة"]', 1),
('breaches', 'الدارك ويب', 'Dark Web', '["الويب المظلم","دارك نت"]', 'مواقع الإنترنت المخفية التي يُتداول فيها البيانات المسربة.', '/dark-web', 'darkweb_listing', '["ما آخر عروض الدارك ويب؟","كم قائمة نشطة؟"]', 1),
('breaches', 'ملف البائع', 'Seller Profile', '["بائع","مهاجم","ملف تعريف"]', 'ملف تعريفي لبائع بيانات مرصود — يتضمن مستوى الخطورة والنشاط.', '/sellers', 'seller', '["من أخطر البائعين؟","كم بائع مرصود؟"]', 1),
('breaches', 'واسعة النطاق', 'Large-Scale', '["critical","كبيرة"]', 'حالة رصد ذات عدد مُدّعى يتجاوز 10,000 سجل — أعلى مستوى تأثير.', '/leaks', 'leak', '["كم حالة رصد واسعة النطاق؟"]', 1);

-- ═══ GLOSSARY TERMS — الخصوصية (privacy domain) ═══

INSERT INTO `ai_glossary` (`domain`, `term`, `term_en`, `synonyms`, `definition`, `related_page`, `related_entity`, `example_questions`, `is_active`) VALUES
('privacy', 'المادة 12', 'Article 12', '["بنود الامتثال","article 12"]', 'المادة 12 من نظام حماية البيانات الشخصية (PDPL) — تتضمن 8 بنود إلزامية.', '/privacy', 'clause', '["كم نسبة الامتثال للمادة 12؟","ما البنود الناقصة؟"]', 1),
('privacy', 'نظام حماية البيانات الشخصية', 'PDPL', '["PDPL","النظام","قانون حماية البيانات"]', 'النظام السعودي لحماية البيانات الشخصية — يُلزم الجهات بحماية خصوصية البيانات.', '/privacy', NULL, '["ما متطلبات PDPL؟","هل الجهة ملتزمة؟"]', 1),
('privacy', 'سياسة الخصوصية', 'Privacy Policy', '["سياسة","إفصاح"]', 'وثيقة إلزامية تُوضح كيفية جمع ومعالجة البيانات الشخصية.', '/sites', 'site', '["هل الموقع يملك سياسة خصوصية؟","حلل سياسة الخصوصية"]', 1),
('privacy', 'حقوق أصحاب البيانات', 'Data Subject Rights', '["DSAR","حقوق","طلبات"]', 'حقوق الأفراد في الوصول لبياناتهم وتعديلها وحذفها وفقاً لـ PDPL.', '/privacy', NULL, '["كم طلب DSAR ورد؟","ما حقوق صاحب البيانات؟"]', 1),
('privacy', 'تقييم الأثر على الخصوصية', 'PIA/DPIA', '["DPIA","PIA","تقييم أثر"]', 'تقييم منهجي لتأثير أنشطة المعالجة على خصوصية البيانات الشخصية.', '/privacy', NULL, '["هل يلزم إجراء DPIA؟","ما نتيجة تقييم الأثر؟"]', 1),
('privacy', 'بند الامتثال', 'Compliance Clause', '["بند","clause","متطلب"]', 'أحد البنود الثمانية في المادة 12 — يُقيّم مدى التزام الجهة.', '/clauses', 'clause', '["ما أكثر البنود نقصاً؟","قارن البنود بين القطاعات"]', 1);

-- ═══ PAGE DESCRIPTORS ═══

INSERT INTO `ai_page_descriptors` (`domain`, `page_id`, `route`, `page_name`, `page_name_en`, `purpose`, `main_elements`, `common_tasks`, `available_actions`, `suggested_questions`, `is_active`) VALUES
('breaches', 'overview_dashboard', '/overview', 'لوحة المعلومات', 'Dashboard', 'عرض ملخص شامل لحالات الرصد والإحصائيات الرئيسية', '["بطاقات KPI","رسم بياني زمني","توزيع القطاعات","آخر حالات الرصد"]', '["عرض الملخص","تصفية بالفترة","تصدير تقرير"]', '["view_stats","filter_by_period","export_report"]', '[{"role":"analyst","question":"أعطني ملخص تنفيذي"},{"role":"manager","question":"ما أبرز حالات الرصد واسعة النطاق؟"}]', 1),
('breaches', 'incidents_list', '/leaks', 'حالات الرصد', 'Detection Cases', 'عرض وإدارة جميع حالات الرصد المكتشفة', '["جدول حالات الرصد","فلاتر التصفية","شريط البحث","أزرار التصدير"]', '["البحث عن حالة","تصفية بالتصنيف","تصدير البيانات","عرض التفاصيل"]', '["view_details","filter","create_case","export"]', '[{"role":"analyst","question":"صنف حالات الرصد حسب القطاع"},{"role":"manager","question":"كم حالة رصد واسعة النطاق؟"}]', 1),
('privacy', 'privacy_dashboard', '/privacy', 'لوحة الخصوصية', 'Privacy Dashboard', 'مؤشرات الامتثال لنظام حماية البيانات الشخصية', '["نسبة الامتثال العامة","توزيع البنود","مقارنة القطاعات","تنبيهات الامتثال"]', '["عرض نسبة الامتثال","مقارنة القطاعات","تحليل البنود"]', '["view_compliance","filter_by_sector","generate_report"]', '[{"role":"compliance_officer","question":"كم نسبة الامتثال العامة؟"},{"role":"manager","question":"ما أكثر البنود نقصاً؟"}]', 1),
('privacy', 'privacy_sites', '/sites', 'المواقع المراقبة', 'Monitored Sites', 'إدارة المواقع الخاضعة لمراقبة سياسات الخصوصية', '["جدول المواقع","حالة الامتثال","تاريخ آخر فحص","أزرار الفحص"]', '["فحص موقع جديد","عرض تفاصيل الموقع","تصدير النتائج"]', '["view_site","filter","scan","export"]', '[{"role":"analyst","question":"كم موقع تم رصده؟"},{"role":"compliance_officer","question":"أي المواقع لا تملك سياسة خصوصية؟"}]', 1),
('breaches', 'smart_rasid_full', '/smart-rasid', 'راصد الذكي', 'Smart Rasid', 'المساعد الذكي الشامل للمنصة — يدعم الاستفسارات والتحليلات والمهام', '["واجهة المحادثة","أزرار الإجراءات السريعة","سجل المحادثات","خطوات التفكير"]', '["طرح سؤال","تحليل بيانات","إنشاء تقرير","طلب دليل"]', '["chat","analyze","generate_report","guide"]', '[{"role":"all","question":"ما الجديد في المنصة؟"},{"role":"all","question":"حلل بياناتي"}]', 1),
('breaches', 'reports_list', '/reports', 'التقارير', 'Reports', 'إنشاء وعرض وتصدير التقارير المهنية', '["جدول التقارير","أزرار الإنشاء","خيارات التصدير","الجدولة"]', '["إنشاء تقرير جديد","عرض تقرير","تصدير PDF","جدولة تقرير"]', '["create_report","view_report","export","schedule"]', '[{"role":"manager","question":"أنشئ تقرير تنفيذي"},{"role":"analyst","question":"كم تقرير تم إنشاؤه هذا الشهر؟"}]', 1),
('breaches', 'dark_web_monitor', '/dark-web', 'مراقبة الويب المظلم', 'Dark Web Monitor', 'رصد التهديدات والعروض في الويب المظلم', '["قوائم الدارك ويب","تفاصيل العروض","مستوى الخطورة"]', '["عرض القوائم النشطة","البحث عن تهديد","تحليل الاتجاهات"]', '["view_listings","search"]', '[{"role":"analyst","question":"ما آخر عروض الدارك ويب؟"},{"role":"analyst","question":"كم قائمة نشطة؟"}]', 1),
('breaches', 'evidence_chain', '/evidence-chain', 'سلسلة الأدلة', 'Evidence Chain', 'توثيق الأدلة الرقمية والحفاظ على سلسلة الحفظ', '["جدول الأدلة","حالة التحقق","ملفات مرفقة","سجل التغييرات"]', '["توثيق دليل جديد","التحقق من سلامة الدليل","عرض السلسلة"]', '["view_evidence","add_evidence","verify"]', '[{"role":"analyst","question":"كم دليل موثق؟"},{"role":"legal","question":"تحقق من سلامة الأدلة"}]', 1);

-- ═══ MESSAGE TEMPLATES — قوالب الرسائل الرسمية (DB-13) ═══

INSERT INTO `ai_message_templates` (`domain`, `template_type`, `title`, `title_en`, `content`, `placeholders`, `example_input`, `example_output`, `is_active`) VALUES
('breaches', 'executive_summary', 'ملخص تنفيذي', 'Executive Summary', '### ملخص تنفيذي — {date}\n\n| المؤشر | القيمة |\n|--------|--------|\n| إجمالي حالات الرصد | {total_cases} |\n| واسعة النطاق | {critical_cases} |\n| العدد المُدّعى الإجمالي | {claimed_total} |\n| أجهزة الرصد النشطة | {active_monitors} |\n\n#### أبرز حالات الرصد\n{top_cases}\n\n#### توصيات\n{recommendations}', '["date","total_cases","critical_cases","claimed_total","active_monitors","top_cases","recommendations"]', 'ملخص تنفيذي ليوم 2026-02-20', NULL, 1),
('breaches', 'incident_notification', 'إشعار حالة رصد', 'Incident Notification', '## 🔴 إشعار حالة رصد جديدة\n\n**المعرّف:** {case_id}\n**التصنيف:** {severity}\n**المصدر:** {source}\n**القطاع:** {sector}\n**العدد المُدّعى:** {claimed_count}\n\n### الوصف\n{description}\n\n### الإجراءات المطلوبة\n{actions}', '["case_id","severity","source","sector","claimed_count","description","actions"]', NULL, NULL, 1),
('privacy', 'compliance_report', 'تقرير امتثال', 'Compliance Report', '### تقرير امتثال — {entity_name}\n\n**التاريخ:** {date}\n**نسبة الامتثال:** {compliance_rate}%\n\n| البند | الحالة | التفاصيل |\n|-------|--------|----------|\n{clauses_table}\n\n#### ملاحظات\n{notes}\n\n#### توصيات التحسين\n{recommendations}', '["entity_name","date","compliance_rate","clauses_table","notes","recommendations"]', NULL, NULL, 1),
('breaches', 'weekly_report', 'تقرير أسبوعي', 'Weekly Report', '### التقرير الأسبوعي — {week_range}\n\n#### ملخص الأسبوع\n- حالات رصد جديدة: {new_cases}\n- حالات تم إغلاقها: {closed_cases}\n- واسعة النطاق: {critical_new}\n\n#### توزيع حسب المصدر\n{source_distribution}\n\n#### توزيع حسب القطاع\n{sector_distribution}\n\n#### الأحداث البارزة\n{highlights}', '["week_range","new_cases","closed_cases","critical_new","source_distribution","sector_distribution","highlights"]', NULL, NULL, 1);

-- ═══ GUIDE CATALOG — أدلة استرشادية (DB-05) ═══

INSERT INTO `ai_guide_catalog` (`domain`, `title`, `title_en`, `purpose`, `visibility_roles`, `is_active`, `sort_order`) VALUES
('breaches', 'التعرف على لوحة المعلومات', 'Dashboard Tour', 'جولة سريعة في لوحة المعلومات الرئيسية', '["admin","analyst","manager","viewer"]', 1, 1),
('breaches', 'تحليل حالة رصد', 'Analyze Detection Case', 'كيفية تحليل حالة رصد وتوثيق الأدلة', '["admin","analyst"]', 1, 2),
('breaches', 'إنشاء تقرير تنفيذي', 'Create Executive Report', 'خطوات إنشاء تقرير تنفيذي مهني', '["admin","analyst","manager"]', 1, 3),
('privacy', 'فحص امتثال موقع', 'Site Compliance Scan', 'كيفية فحص موقع إلكتروني لمعرفة حالة الامتثال', '["admin","compliance_officer","analyst"]', 1, 4),
('privacy', 'مقارنة امتثال القطاعات', 'Sector Compliance Comparison', 'مقارنة نسب الامتثال بين القطاعات المختلفة', '["admin","manager","compliance_officer"]', 1, 5);

-- ═══ GUIDE STEPS — خطوات الأدلة (DB-06) ═══

-- Guide 1: Dashboard Tour
INSERT INTO `ai_guide_steps` (`guide_id`, `step_order`, `route`, `selector`, `step_text`, `action_type`, `highlight_type`) VALUES
(1, 1, '/app/overview', '[data-testid="kpi-cards"]', 'هذه بطاقات المؤشرات الرئيسية — تعرض إجمالي حالات الرصد، حالات الرصد واسعة النطاق، والعدد المُدّعى الإجمالي', 'observe', 'border'),
(1, 2, '/app/overview', '[data-testid="chart-timeline"]', 'الرسم البياني الزمني يعرض توزيع حالات الرصد عبر الزمن — يمكنك تغيير الفترة', 'observe', 'pulse'),
(1, 3, '/app/overview', '[data-testid="recent-leaks"]', 'جدول آخر حالات الرصد — اضغط على أي حالة لعرض تفاصيلها الكاملة', 'click', 'border');

-- Guide 2: Analyze Detection Case
INSERT INTO `ai_guide_steps` (`guide_id`, `step_order`, `route`, `selector`, `step_text`, `action_type`, `highlight_type`) VALUES
(2, 1, '/app/leaks', '[data-testid="leaks-table"]', 'اختر حالة رصد من الجدول لبدء التحليل', 'click', 'border'),
(2, 2, '/app/leaks', '[data-testid="leak-details"]', 'هنا تجد كل تفاصيل حالة الرصد: المصدر، التصنيف، العدد المُدّعى، والعينات المتاحة', 'observe', 'overlay'),
(2, 3, '/app/evidence-chain', '[data-testid="add-evidence"]', 'اضغط هنا لتوثيق دليل رقمي جديد — احرص على رفع لقطات الشاشة والملفات', 'click', 'pulse');

-- Guide 4: Site Compliance Scan
INSERT INTO `ai_guide_steps` (`guide_id`, `step_order`, `route`, `selector`, `step_text`, `action_type`, `highlight_type`) VALUES
(4, 1, '/app/sites', '[data-testid="scan-button"]', 'اضغط هنا لبدء فحص موقع جديد', 'click', 'border'),
(4, 2, '/app/sites', '[data-testid="scan-url-input"]', 'أدخل رابط الموقع المراد فحصه', 'type', 'pulse'),
(4, 3, '/app/sites', '[data-testid="scan-results"]', 'نتائج الفحص تظهر هنا — تشمل البنود الثمانية ونسبة الامتثال', 'observe', 'overlay');

-- ═══ TRAINING DOCUMENTS — وثائق تدريب (DB-11) ═══

INSERT INTO `ai_training_documents` (`domain`, `title`, `title_en`, `content`, `category`, `is_active`) VALUES
('breaches', 'سياسة التسمية المعتمدة', 'Naming Policy', 'سياسة التسمية المعتمدة لمنصة راصد:\n\n1. «حالة رصد» — التسمية الوحيدة لأي ادعاء بتسريب بيانات\n2. «العدد المُدّعى» — التسمية الوحيدة لأي رقم يذكره البائع\n3. «العينات المتاحة» — التسمية الوحيدة لما تم توثيقه\n4. مراحل الحالة: حالة رصد → قيد التحقق → تسريب مؤكد → مغلق\n5. لا يُوصف أي حدث بـ «تسريب مؤكد» إلا بعد التحقق الرسمي\n6. إذا استخدم المستخدم مصطلحاً قديماً، يُصحح بلطف', 'policy', 1),
('breaches', 'مستويات تأثير حالات الرصد', 'Severity Levels', 'مستويات تأثير حالات الرصد:\n\n- واسع النطاق (critical): العدد المُدّعى أكثر من 10,000 سجل\n- كبير (high): العدد المُدّعى بين 1,000 و 10,000 سجل\n- متوسط (medium): العدد المُدّعى أقل من 1,000 سجل\n- محدود (low): تأثير محدود أو عينات قليلة', 'reference', 1),
('privacy', 'بنود المادة 12 — PDPL', 'Article 12 Clauses', 'بنود المادة 12 من نظام حماية البيانات الشخصية:\n\n1. الإفصاح عن الهوية — تعريف الجهة المسؤولة\n2. غرض المعالجة — توضيح أسباب جمع البيانات\n3. نطاق البيانات — تحديد أنواع البيانات المجموعة\n4. حقوق صاحب البيانات — إبلاغ الأفراد بحقوقهم\n5. مدة الاحتفاظ — تحديد فترة حفظ البيانات\n6. الإفصاح لأطراف ثالثة — الشفافية في مشاركة البيانات\n7. النقل خارج المملكة — سياسة النقل الدولي\n8. آليات الحماية — الإجراءات التقنية والتنظيمية', 'reference', 1),
('breaches', 'مصادر الرصد المدعومة', 'Supported Sources', 'مصادر الرصد المدعومة في منصة راصد:\n\n1. تليجرام — رصد القنوات والمجموعات المشبوهة\n2. الدارك ويب — رصد المنتديات والأسواق\n3. مواقع اللصق — رصد Pastebin وأشباهها\n4. الرصد المباشر — فحص فوري باستخدام APIs متعددة\n5. OSINT — أدوات استخبارات مفتوحة المصدر', 'reference', 1);

-- ═══ KNOWLEDGE REFRESH STATUS — حالة تحديث المعرفة (DB-15) ═══

INSERT INTO `ai_knowledge_refresh_status` (`domain`, `source_name`, `source_type`, `status`, `item_count`) VALUES
('breaches', 'قاعدة المعرفة', 'knowledge_base', 'completed', 0),
('breaches', 'وثائق التدريب', 'training_documents', 'completed', 0),
('breaches', 'المصطلحات', 'glossary', 'completed', 0),
('privacy', 'قاعدة المعرفة', 'knowledge_base', 'completed', 0),
('privacy', 'وثائق التدريب', 'training_documents', 'completed', 0),
('privacy', 'المصطلحات', 'glossary', 'completed', 0);
