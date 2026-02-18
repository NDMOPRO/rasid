import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export type Lang = "en" | "ar";

const translations = {
  // ─── Common ──────────────────────────────────────────────────────────
  "app.name": { en: "CoBNB KSA", ar: "CoBNB KSA" },
  "common.save": { en: "Save", ar: "حفظ" },
  "common.cancel": { en: "Cancel", ar: "إلغاء" },
  "common.delete": { en: "Delete", ar: "حذف" },
  "common.edit": { en: "Edit", ar: "تعديل" },
  "common.create": { en: "Create", ar: "إنشاء" },
  "common.search": { en: "Search...", ar: "بحث..." },
  "common.filter": { en: "Filter", ar: "تصفية" },
  "common.all": { en: "All", ar: "الكل" },
  "common.loading": { en: "Loading...", ar: "جاري التحميل..." },
  "common.noData": { en: "No data available", ar: "لا توجد بيانات" },
  "common.actions": { en: "Actions", ar: "إجراءات" },
  "common.status": { en: "Status", ar: "الحالة" },
  "common.back": { en: "Back", ar: "رجوع" },
  "common.submit": { en: "Submit", ar: "إرسال" },
  "common.close": { en: "Close", ar: "إغلاق" },
  "common.yes": { en: "Yes", ar: "نعم" },
  "common.no": { en: "No", ar: "لا" },
  "common.add": { en: "Add", ar: "إضافة" },
  "common.update": { en: "Update", ar: "تحديث" },
  "common.view": { en: "View", ar: "عرض" },
  "common.details": { en: "Details", ar: "التفاصيل" },
  "common.export": { en: "Export", ar: "تصدير" },
  "common.comingSoon": { en: "Feature coming soon", ar: "الميزة قادمة قريباً" },
  "common.notSpecified": { en: "Not specified", ar: "غير محدد" },
  "common.notSet": { en: "Not set", ar: "غير محدد" },
  "common.created": { en: "Created", ar: "تاريخ الإنشاء" },
  "common.updated": { en: "Updated", ar: "تاريخ التحديث" },

  // ─── Auth ────────────────────────────────────────────────────────────
  "auth.signIn": { en: "Sign In", ar: "تسجيل الدخول" },
  "auth.signUp": { en: "Sign Up", ar: "إنشاء حساب" },
  "auth.signOut": { en: "Sign Out", ar: "تسجيل الخروج" },
  "auth.email": { en: "Email", ar: "البريد الإلكتروني" },
  "auth.password": { en: "Password", ar: "كلمة المرور" },
  "auth.confirmPassword": { en: "Confirm Password", ar: "تأكيد كلمة المرور" },
  "auth.name": { en: "Full Name", ar: "الاسم الكامل" },
  "auth.noAccount": { en: "Don't have an account?", ar: "ليس لديك حساب؟" },
  "auth.hasAccount": { en: "Already have an account?", ar: "لديك حساب بالفعل؟" },
  "auth.welcome": { en: "Welcome to CoBNB KSA", ar: "مرحباً بك في CoBNB KSA" },
  "auth.subtitle": { en: "Property Management System", ar: "نظام إدارة العقارات" },
  "auth.signInDesc": { en: "Sign in to access your dashboard", ar: "سجل دخولك للوصول إلى لوحة التحكم" },
  "auth.signUpDesc": { en: "Create your account to get started", ar: "أنشئ حسابك للبدء" },
  "auth.invalidCredentials": { en: "Invalid email or password", ar: "البريد الإلكتروني أو كلمة المرور غير صحيحة" },
  "auth.passwordMismatch": { en: "Passwords do not match", ar: "كلمات المرور غير متطابقة" },
  "auth.emailExists": { en: "Email already registered", ar: "البريد الإلكتروني مسجل بالفعل" },

  // ─── Navigation ──────────────────────────────────────────────────────
  "nav.dashboard": { en: "Dashboard", ar: "لوحة التحكم" },
  "nav.properties": { en: "Properties", ar: "العقارات" },
  "nav.contracts": { en: "Contracts", ar: "العقود" },
  "nav.team": { en: "Team", ar: "الفريق" },
  "nav.financials": { en: "Financials", ar: "المالية" },
  "nav.mensunAi": { en: "Mensun AI", ar: "منسون AI" },
  "nav.reports": { en: "Reports", ar: "التقارير" },
  "nav.ownerDashboard": { en: "Owner Portal", ar: "بوابة المالك" },
  "nav.notifications": { en: "Notifications", ar: "الإشعارات" },

  // ─── Dashboard ───────────────────────────────────────────────────────
  "dashboard.title": { en: "Dashboard", ar: "لوحة التحكم" },
  "dashboard.subtitle": { en: "Overview of your property portfolio", ar: "نظرة عامة على محفظتك العقارية" },
  "dashboard.totalProperties": { en: "Total Properties", ar: "إجمالي العقارات" },
  "dashboard.activeContracts": { en: "Active Contracts", ar: "العقود النشطة" },
  "dashboard.netIncome": { en: "Net Income", ar: "صافي الدخل" },
  "dashboard.expiringSoon": { en: "Expiring Soon", ar: "عقود قريبة الانتهاء" },
  "dashboard.propertiesByCity": { en: "Properties by City", ar: "العقارات حسب المدينة" },
  "dashboard.propertyStatus": { en: "Property Status", ar: "حالة العقارات" },
  "dashboard.contractStatus": { en: "Contract Status", ar: "حالة العقود" },
  "dashboard.recentActivity": { en: "Recent Activity", ar: "النشاط الأخير" },
  "dashboard.quickActions": { en: "Quick Actions", ar: "إجراءات سريعة" },
  "dashboard.addProperty": { en: "Add Property", ar: "إضافة عقار" },
  "dashboard.newContract": { en: "New Contract", ar: "عقد جديد" },
  "dashboard.recordPayment": { en: "Record Payment", ar: "تسجيل دفعة" },
  "dashboard.askMensun": { en: "Ask Mensun AI", ar: "اسأل منسون" },
  "dashboard.noProperties": { en: "No properties yet", ar: "لا توجد عقارات بعد" },
  "dashboard.addFirstProperty": { en: "Add your first property to see city distribution", ar: "أضف أول عقار لعرض التوزيع حسب المدينة" },
  "dashboard.noStatusData": { en: "No status data", ar: "لا توجد بيانات حالة" },
  "dashboard.noContracts": { en: "No contracts yet", ar: "لا توجد عقود بعد" },
  "dashboard.noActivity": { en: "No recent activity", ar: "لا يوجد نشاط حديث" },
  "dashboard.activityHint": { en: "Actions will appear here as you use the system", ar: "ستظهر الإجراءات هنا عند استخدام النظام" },
  "dashboard.units": { en: "units", ar: "وحدات" },

  // ─── Properties ──────────────────────────────────────────────────────
  "properties.title": { en: "Properties", ar: "العقارات" },
  "properties.subtitle": { en: "Property Stock Register", ar: "سجل مخزون العقارات" },
  "properties.addNew": { en: "Add Property", ar: "إضافة عقار" },
  "properties.unitId": { en: "Unit ID", ar: "رقم الوحدة" },
  "properties.city": { en: "City", ar: "المدينة" },
  "properties.building": { en: "Building", ar: "المبنى" },
  "properties.type": { en: "Type", ar: "النوع" },
  "properties.owner": { en: "Owner", ar: "المالك" },
  "properties.noProperties": { en: "No properties found", ar: "لم يتم العثور على عقارات" },
  "properties.addFirst": { en: "Add your first property to get started", ar: "أضف أول عقار للبدء" },
  "properties.neighborhood": { en: "Neighborhood", ar: "الحي" },
  "properties.floor": { en: "Floor", ar: "الطابق" },
  "properties.bedrooms": { en: "Bedrooms", ar: "غرف النوم" },
  "properties.bathrooms": { en: "Bathrooms", ar: "الحمامات" },
  "properties.area": { en: "Area (sqm)", ar: "المساحة (م²)" },
  "properties.ownerName": { en: "Owner Name", ar: "اسم المالك" },
  "properties.ownerPhone": { en: "Owner Phone", ar: "هاتف المالك" },
  "properties.ownerEmail": { en: "Owner Email", ar: "بريد المالك" },
  "properties.address": { en: "Address", ar: "العنوان" },
  "properties.location": { en: "Location", ar: "الموقع" },
  "properties.setupChecklist": { en: "Setup Checklist", ar: "قائمة التجهيز" },
  "properties.furnished": { en: "Furnished", ar: "مفروش" },
  "properties.smartLock": { en: "Smart Lock", ar: "قفل ذكي" },
  "properties.wifi": { en: "WiFi Setup", ar: "إعداد الواي فاي" },
  "properties.photography": { en: "Photography", ar: "التصوير" },
  "properties.deepClean": { en: "Deep Clean", ar: "تنظيف عميق" },
  "properties.amenities": { en: "Amenities Ready", ar: "المرافق جاهزة" },
  "properties.listing": { en: "Listing Created", ar: "تم إنشاء الإعلان" },
  "properties.financials": { en: "Financial Details", ar: "التفاصيل المالية" },
  "properties.targetAdr": { en: "Target ADR", ar: "متوسط السعر اليومي المستهدف" },
  "properties.targetOccupancy": { en: "Target Occupancy", ar: "نسبة الإشغال المستهدفة" },
  "properties.monthlyGuarantee": { en: "Monthly Guarantee", ar: "الضمان الشهري" },
  "properties.ffeBudget": { en: "FF&E Budget", ar: "ميزانية التأثيث" },
  "properties.notes": { en: "Notes", ar: "ملاحظات" },
  "properties.map": { en: "Map", ar: "الخريطة" },
  "properties.details": { en: "Property Details", ar: "تفاصيل العقار" },
  "properties.ownerDetails": { en: "Owner Details", ar: "تفاصيل المالك" },
  "properties.financialTargets": { en: "Financial Targets", ar: "الأهداف المالية" },
  "properties.statusNotes": { en: "Status & Notes", ar: "الحالة والملاحظات" },
  "properties.linkedContracts": { en: "Linked Contracts", ar: "العقود المرتبطة" },
  "properties.layout": { en: "Layout", ar: "التخطيط" },

  // ─── Cities ──────────────────────────────────────────────────────────
  "city.riyadh": { en: "Riyadh", ar: "الرياض" },
  "city.jeddah": { en: "Jeddah", ar: "جدة" },
  "city.madinah": { en: "Madinah", ar: "المدينة المنورة" },

  // ─── Property Types ──────────────────────────────────────────────────
  "propertyType.apartment": { en: "Apartment", ar: "شقة" },
  "propertyType.villa": { en: "Villa", ar: "فيلا" },
  "propertyType.studio": { en: "Studio", ar: "استوديو" },
  "propertyType.penthouse": { en: "Penthouse", ar: "بنتهاوس" },
  "propertyType.duplex": { en: "Duplex", ar: "دوبلكس" },

  // ─── Property Status ─────────────────────────────────────────────────
  "status.prospect": { en: "Prospect", ar: "محتمل" },
  "status.contract_pending": { en: "Contract Pending", ar: "بانتظار العقد" },
  "status.onboarding": { en: "Onboarding", ar: "تأهيل" },
  "status.setup_in_progress": { en: "Setup In Progress", ar: "قيد التجهيز" },
  "status.ready_for_listing": { en: "Ready for Listing", ar: "جاهز للإدراج" },
  "status.live": { en: "Live", ar: "نشط" },
  "status.suspended": { en: "Suspended", ar: "معلق" },
  "status.terminated": { en: "Terminated", ar: "منتهي" },

  // ─── Contracts ───────────────────────────────────────────────────────
  "contracts.title": { en: "Contracts", ar: "العقود" },
  "contracts.subtitle": { en: "Contract Registry", ar: "سجل العقود" },
  "contracts.addNew": { en: "New Contract", ar: "عقد جديد" },
  "contracts.contractNumber": { en: "Contract Number", ar: "رقم العقد" },
  "contracts.contractTitle": { en: "Contract Title", ar: "عنوان العقد" },
  "contracts.contractType": { en: "Contract Type", ar: "نوع العقد" },
  "contracts.ownerInfo": { en: "Owner Information", ar: "معلومات المالك" },
  "contracts.terms": { en: "Contract Terms", ar: "شروط العقد" },
  "contracts.startDate": { en: "Start Date", ar: "تاريخ البداية" },
  "contracts.endDate": { en: "End Date", ar: "تاريخ الانتهاء" },
  "contracts.duration": { en: "Duration (months)", ar: "المدة (أشهر)" },
  "contracts.autoRenewal": { en: "Auto Renewal", ar: "تجديد تلقائي" },
  "contracts.monthlyRent": { en: "Monthly Rent", ar: "الإيجار الشهري" },
  "contracts.commission": { en: "Commission %", ar: "نسبة العمولة" },
  "contracts.deposit": { en: "Security Deposit", ar: "مبلغ التأمين" },
  "contracts.paymentTerms": { en: "Payment Terms", ar: "شروط الدفع" },
  "contracts.revenueSplit": { en: "Revenue Split", ar: "تقسيم الإيرادات" },
  "contracts.specialConditions": { en: "Special Conditions", ar: "شروط خاصة" },
  "contracts.linkedProperty": { en: "Linked Property", ar: "العقار المرتبط" },
  "contracts.selectProperty": { en: "Select Property", ar: "اختر العقار" },
  "contracts.noContracts": { en: "No contracts found", ar: "لم يتم العثور على عقود" },
  "contracts.addFirst": { en: "Create your first contract to get started", ar: "أنشئ أول عقد للبدء" },
  "contracts.ownerName": { en: "Owner Name", ar: "اسم المالك" },
  "contracts.ownerIdNumber": { en: "Owner ID Number", ar: "رقم هوية المالك" },
  "contracts.ownerPhone": { en: "Owner Phone", ar: "هاتف المالك" },
  "contracts.ownerEmail": { en: "Owner Email", ar: "بريد المالك" },
  "contracts.period": { en: "Contract Period", ar: "مدة العقد" },
  "contracts.financialTerms": { en: "Financial Terms", ar: "الشروط المالية" },
  "contracts.securityDeposit": { en: "Security Deposit", ar: "مبلغ التأمين" },
  "contracts.notes": { en: "Notes", ar: "ملاحظات" },
  "contracts.ongoing": { en: "Ongoing", ar: "مستمر" },

  // ─── Contract Types ──────────────────────────────────────────────────
  "contractType.management_agreement": { en: "Management Agreement", ar: "اتفاقية إدارة" },
  "contractType.master_lease": { en: "Master Lease", ar: "إيجار رئيسي" },
  "contractType.revenue_share": { en: "Revenue Share", ar: "مشاركة إيرادات" },
  "contractType.hybrid": { en: "Hybrid", ar: "مختلط" },

  // ─── Contract Status ─────────────────────────────────────────────────
  "contractStatus.draft": { en: "Draft", ar: "مسودة" },
  "contractStatus.under_review": { en: "Under Review", ar: "قيد المراجعة" },
  "contractStatus.pending_signature": { en: "Pending Signature", ar: "بانتظار التوقيع" },
  "contractStatus.active": { en: "Active", ar: "نشط" },
  "contractStatus.expired": { en: "Expired", ar: "منتهي" },
  "contractStatus.terminated": { en: "Terminated", ar: "ملغي" },
  "contractStatus.renewed": { en: "Renewed", ar: "مجدد" },

  // ─── Team ────────────────────────────────────────────────────────────
  "team.title": { en: "Team Management", ar: "إدارة الفريق" },
  "team.subtitle": { en: "Manage your team members and roles", ar: "إدارة أعضاء الفريق والأدوار" },
  "team.addMember": { en: "Add Member", ar: "إضافة عضو" },
  "team.nameAr": { en: "Name (Arabic)", ar: "الاسم (عربي)" },
  "team.nameEn": { en: "Name (English)", ar: "الاسم (إنجليزي)" },
  "team.role": { en: "Role", ar: "الدور" },
  "team.accessLevel": { en: "Access Level", ar: "مستوى الوصول" },
  "team.permissions": { en: "Permissions", ar: "الصلاحيات" },
  "team.editContracts": { en: "Edit Contracts", ar: "تعديل العقود" },
  "team.viewFinancials": { en: "View Financials", ar: "عرض المالية" },
  "team.manageTeam": { en: "Manage Team", ar: "إدارة الفريق" },
  "team.assignedCities": { en: "Assigned Cities", ar: "المدن المخصصة" },
  "team.active": { en: "Active", ar: "نشط" },
  "team.inactive": { en: "Inactive", ar: "غير نشط" },
  "team.noMembers": { en: "No team members", ar: "لا يوجد أعضاء فريق" },
  "team.addFirst": { en: "Add your first team member", ar: "أضف أول عضو في الفريق" },
  "team.email": { en: "Email", ar: "البريد الإلكتروني" },
  "team.phone": { en: "Phone", ar: "الهاتف" },
  "team.canEditContracts": { en: "Edit Contracts", ar: "تعديل العقود" },
  "team.canViewFinancials": { en: "View Financials", ar: "عرض المالية" },
  "team.canManageTeam": { en: "Manage Team", ar: "إدارة الفريق" },

  // ─── Team Roles ──────────────────────────────────────────────────────
  "teamRole.super_admin": { en: "Super Admin", ar: "مدير عام" },
  "teamRole.admin": { en: "Admin", ar: "مدير" },
  "teamRole.ops_manager": { en: "Ops Manager", ar: "مدير عمليات" },
  "teamRole.field_agent": { en: "Field Agent", ar: "وكيل ميداني" },
  "teamRole.viewer": { en: "Viewer", ar: "مشاهد" },
  "teamRole.finance": { en: "Finance", ar: "مالية" },
  "teamRole.owner_portal": { en: "Owner Portal", ar: "بوابة المالك" },

  // ─── Access Levels ───────────────────────────────────────────────────
  "accessLevel.full_access": { en: "Full Access", ar: "وصول كامل" },
  "accessLevel.edit_view": { en: "Edit & View", ar: "تعديل وعرض" },
  "accessLevel.view_only": { en: "View Only", ar: "عرض فقط" },
  "accessLevel.restricted": { en: "Restricted", ar: "مقيد" },

  // ─── Financials ──────────────────────────────────────────────────────
  "finance.title": { en: "Financials", ar: "المالية" },
  "finance.subtitle": { en: "Financial Tracking", ar: "التتبع المالي" },
  "finance.recordTransaction": { en: "Record Transaction", ar: "تسجيل معاملة" },
  "finance.type": { en: "Type", ar: "النوع" },
  "finance.revenue": { en: "Revenue", ar: "إيرادات" },
  "finance.expense": { en: "Expense", ar: "مصروفات" },
  "finance.totalRevenue": { en: "Total Revenue", ar: "إجمالي الإيرادات" },
  "finance.totalExpenses": { en: "Total Expenses", ar: "إجمالي المصروفات" },
  "finance.netIncome": { en: "Net Income", ar: "صافي الدخل" },
  "finance.category": { en: "Category", ar: "الفئة" },
  "finance.amount": { en: "Amount", ar: "المبلغ" },
  "finance.date": { en: "Date", ar: "التاريخ" },
  "finance.paymentStatus": { en: "Payment Status", ar: "حالة الدفع" },
  "finance.paymentMethod": { en: "Payment Method", ar: "طريقة الدفع" },
  "finance.referenceNumber": { en: "Reference Number", ar: "رقم المرجع" },
  "finance.description": { en: "Description", ar: "الوصف" },
  "finance.noTransactions": { en: "No transactions found", ar: "لم يتم العثور على معاملات" },
  "finance.addFirst": { en: "Record your first transaction", ar: "سجل أول معاملة" },
  "financials.title": { en: "Financials", ar: "المالية" },
  "financials.subtitle": { en: "Financial tracking and reporting", ar: "التتبع المالي والتقارير" },
  "financials.addTransaction": { en: "Add Transaction", ar: "إضافة معاملة" },
  "financials.revenue": { en: "Revenue", ar: "إيرادات" },
  "financials.expense": { en: "Expense", ar: "مصروفات" },
  "financials.totalRevenue": { en: "Total Revenue", ar: "إجمالي الإيرادات" },
  "financials.totalExpenses": { en: "Total Expenses", ar: "إجمالي المصروفات" },
  "financials.netIncome": { en: "Net Income", ar: "صافي الدخل" },
  "financials.pendingPayments": { en: "Pending Payments", ar: "مدفوعات معلقة" },
  "financials.category": { en: "Category", ar: "الفئة" },
  "financials.amount": { en: "Amount", ar: "المبلغ" },
  "financials.date": { en: "Date", ar: "التاريخ" },
  "financials.paymentStatus": { en: "Payment Status", ar: "حالة الدفع" },
  "financials.paymentMethod": { en: "Payment Method", ar: "طريقة الدفع" },
  "financials.reference": { en: "Reference", ar: "المرجع" },
  "financials.description": { en: "Description", ar: "الوصف" },
  "financials.noTransactions": { en: "No transactions found", ar: "لم يتم العثور على معاملات" },
  "financials.addFirst": { en: "Record your first transaction", ar: "سجل أول معاملة" },

  // ─── Payment Status ──────────────────────────────────────────────────
  "paymentStatus.pending": { en: "Pending", ar: "معلق" },
  "paymentStatus.paid": { en: "Paid", ar: "مدفوع" },
  "paymentStatus.overdue": { en: "Overdue", ar: "متأخر" },
  "paymentStatus.cancelled": { en: "Cancelled", ar: "ملغي" },

  // ─── Mensun AI ───────────────────────────────────────────────────────
  "ai.title": { en: "Mensun AI", ar: "منسون AI" },
  "ai.subtitle": { en: "Your intelligent property management assistant", ar: "مساعدك الذكي لإدارة العقارات" },
  "ai.placeholder": { en: "Type your message...", ar: "اكتب رسالتك..." },
  "ai.inputPlaceholder": { en: "Ask Mensun anything...", ar: "اسأل منسون أي شيء..." },
  "ai.send": { en: "Send", ar: "إرسال" },
  "ai.thinking": { en: "Thinking...", ar: "جاري التفكير..." },
  "ai.welcome": { en: "Welcome to Mensun AI", ar: "مرحباً بك في منسون" },
  "ai.welcomeDesc": { en: "I can help you with property management, contracts, financials, and operations across Riyadh, Jeddah, and Madinah.", ar: "يمكنني مساعدتك في إدارة العقارات والعقود والمالية والعمليات في الرياض وجدة والمدينة المنورة." },
  "ai.newChat": { en: "New Chat", ar: "محادثة جديدة" },

  // ─── Reports ─────────────────────────────────────────────────────────
  "reports.title": { en: "Reports", ar: "التقارير" },
  "reports.subtitle": { en: "Generate and export reports", ar: "إنشاء وتصدير التقارير" },
  "reports.portfolio": { en: "Portfolio Summary", ar: "ملخص المحفظة" },
  "reports.contractReport": { en: "Contract Status Report", ar: "تقرير حالة العقود" },
  "reports.financialReport": { en: "Financial Performance", ar: "الأداء المالي" },
  "reports.generate": { en: "Generate Report", ar: "إنشاء التقرير" },
  "reports.exportPdf": { en: "Export PDF", ar: "تصدير PDF" },
  "reports.exportExcel": { en: "Export Excel", ar: "تصدير Excel" },
  "reports.period": { en: "Period", ar: "الفترة" },
  "reports.monthly": { en: "Monthly", ar: "شهري" },
  "reports.quarterly": { en: "Quarterly", ar: "ربع سنوي" },
  "reports.yearly": { en: "Yearly", ar: "سنوي" },
  "reports.exportExcelTooltip": { en: "Download as Excel spreadsheet (.xlsx)", ar: "تحميل كملف Excel (.xlsx)" },
  "reports.exportPdfTooltip": { en: "Download as PDF document", ar: "تحميل كملف PDF" },
  "reports.exportSuccess": { en: "Export Successful", ar: "تم التصدير بنجاح" },
  "reports.fileDownloaded": { en: "file downloaded successfully", ar: "تم تحميل الملف بنجاح" },
  "reports.exportError": { en: "Export failed. Please try again.", ar: "فشل التصدير. حاول مرة أخرى." },
  "reports.print": { en: "Print", ar: "طباعة" },
  "common.records": { en: "records", ar: "سجلات" },

  // ─── User ────────────────────────────────────────────────────────────
  "user.administrator": { en: "Administrator", ar: "مدير النظام" },
  "user.teamMember": { en: "Team Member", ar: "عضو فريق" },
  "user.profile": { en: "Profile", ar: "الملف الشخصي" },
  "user.settings": { en: "Settings", ar: "الإعدادات" },

  // ─── Enhanced Property Detail ─────────────────────────────────────
  "properties.overview": { en: "Overview", ar: "نظرة عامة" },
  "properties.setupProgress": { en: "Setup Progress", ar: "تقدم التجهيز" },
  "properties.photoGallery": { en: "Photo Gallery", ar: "معرض الصور" },
  "properties.uploadPhotos": { en: "Upload Photos", ar: "رفع صور" },
  "properties.noPhotos": { en: "No photos uploaded yet", ar: "لم يتم رفع صور بعد" },
  "properties.uploadFirst": { en: "Upload property photos to showcase the unit", ar: "ارفع صور العقار لعرض الوحدة" },
  "properties.listingUrls": { en: "Listing URLs", ar: "روابط الإعلانات" },
  "properties.airbnb": { en: "Airbnb", ar: "Airbnb" },
  "properties.booking": { en: "Booking.com", ar: "Booking.com" },
  "properties.gatherin": { en: "Gatherin", ar: "Gatherin" },
  "properties.goLiveDate": { en: "Go Live Date", ar: "تاريخ الإطلاق" },
  "properties.ffeActual": { en: "FF&E Actual", ar: "التأثيث الفعلي" },
  "properties.deleteConfirm": { en: "Are you sure you want to delete this property?", ar: "هل أنت متأكد من حذف هذا العقار؟" },
  "properties.deleteWarning": { en: "This action cannot be undone.", ar: "لا يمكن التراجع عن هذا الإجراء." },
  "properties.quickActions": { en: "Quick Actions", ar: "إجراءات سريعة" },
  "properties.changeStatus": { en: "Change Status", ar: "تغيير الحالة" },
  "properties.unitNumber": { en: "Unit Number", ar: "رقم الوحدة" },
  "properties.completed": { en: "completed", ar: "مكتمل" },
  "properties.of": { en: "of", ar: "من" },
  "properties.steps": { en: "steps", ar: "خطوات" },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("cobnb-lang");
    return (saved as Lang) || "en";
  });

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem("cobnb-lang", newLang);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback((key: string): string => {
    const entry = translations[key as TranslationKey];
    if (!entry) return key;
    return entry[lang] || entry.en || key;
  }, [lang]);

  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <I18nContext.Provider value={{ lang, setLang, t, dir }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}
