/**
 * AdminSettings — إعدادات الإدارة المتقدمة
 * Full admin settings with: Visual Identity, Menus, Roles, Notifications, Backups, Sessions, Data Seeding, Custom Dashboard
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Settings, Palette, Globe, Shield, Bell, Database, Clock,
  Users, RefreshCw, Download, Upload, Trash2, CheckCircle,
  AlertTriangle, Server, Key, HardDrive, Layers, Zap, Eye,
} from "lucide-react";

type TabId = "identity" | "menus" | "roles" | "notifications" | "backups" | "sessions" | "seeding" | "custom_dashboard";

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "identity", label: "الهوية البصرية", icon: Palette },
  { id: "menus", label: "القوائم والصفحات", icon: Globe },
  { id: "roles", label: "الأدوار والصلاحيات", icon: Shield },
  { id: "notifications", label: "الإشعارات المتقدمة", icon: Bell },
  { id: "backups", label: "النسخ الاحتياطية", icon: Database },
  { id: "sessions", label: "الجلسات", icon: Users },
  { id: "seeding", label: "بذر البيانات", icon: Layers },
  { id: "custom_dashboard", label: "لوحة مخصصة", icon: Eye },
];

function IdentityTab() {
  return (
    <div className="overflow-x-hidden max-w-full space-y-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">إعدادات الهوية البصرية</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-gray-400">اسم المنصة</label>
              <input className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm" defaultValue="منصة راصد" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-400">Platform Name (EN)</label>
              <input className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm" defaultValue="Rasid Platform" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "اللون الأساسي", value: "#273470" },
              { label: "اللون الثانوي", value: "#6459A7" },
              { label: "لون التمييز", value: "#3DB1AC" },
            ].map((c) => (
              <div key={c.label} className="space-y-2">
                <label className="text-sm text-gray-400">{c.label}</label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-gray-600" style={{ backgroundColor: c.value }} />
                  <input className="flex-1 bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm" defaultValue={c.value} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">حفظ التغييرات</Button>
            <Button variant="outline" className="border-gray-600 text-gray-300">إعادة تعيين</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">الشعارات</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-dashed border-gray-600 rounded-lg text-center">
              <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">شعار الوضع الداكن</p>
              <Button variant="outline" size="sm" className="mt-2 border-gray-600 text-gray-300">رفع شعار</Button>
            </div>
            <div className="p-4 border border-dashed border-gray-600 rounded-lg text-center">
              <Upload className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">شعار الوضع الفاتح</p>
              <Button variant="outline" size="sm" className="mt-2 border-gray-600 text-gray-300">رفع شعار</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MenusTab() {
  const menus = [
    { name: "القائمة الجانبية الرئيسية", items: 45, status: "active" },
    { name: "قائمة لوحة التحكم", items: 17, status: "active" },
    { name: "قائمة الهاتف المحمول", items: 12, status: "active" },
    { name: "قائمة التذييل", items: 6, status: "disabled" },
  ];
  return (
    <div className="space-y-4">
      {menus.map((menu, i) => (
        <Card key={i} className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 flex items-center justify-between flex-wrap">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-white text-sm font-medium">{menu.name}</p>
                <p className="text-gray-400 text-xs">{menu.items} عنصر</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={menu.status === "active" ? "border-emerald-500/50 text-emerald-400" : "border-gray-600 text-gray-500"}>
                {menu.status === "active" ? "نشط" : "معطل"}
              </Badge>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">تعديل</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RolesTab() {
  const roles = [
    { name: "مشرف عام", nameEn: "Root Admin", users: 1, permissions: "كامل", color: "text-red-400" },
    { name: "مدير", nameEn: "Admin", users: 3, permissions: "إدارة + تحرير", color: "text-amber-400" },
    { name: "محلل", nameEn: "Analyst", users: 8, permissions: "عرض + تحليل", color: "text-blue-400" },
    { name: "مشاهد", nameEn: "Viewer", users: 15, permissions: "عرض فقط", color: "text-gray-400" },
  ];
  return (
    <div className="space-y-4">
      {roles.map((role, i) => (
        <Card key={i} className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 flex items-center justify-between flex-wrap">
            <div className="flex items-center gap-3">
              <Shield className={`h-5 w-5 ${role.color}`} />
              <div>
                <p className="text-white text-sm font-medium">{role.name} <span className="text-gray-500 text-xs">({role.nameEn})</span></p>
                <p className="text-gray-400 text-xs">{role.permissions} — {role.users} مستخدم</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">إدارة الصلاحيات</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NotificationsTab() {
  const channels = [
    { name: "البريد الإلكتروني", icon: Bell, enabled: true, config: "SMTP مُعد" },
    { name: "الرسائل القصيرة (SMS)", icon: Bell, enabled: false, config: "غير مُعد" },
    { name: "إشعارات المتصفح", icon: Bell, enabled: true, config: "مفعّل" },
    { name: "Webhook", icon: Zap, enabled: true, config: "3 نقاط نهاية" },
    { name: "تليجرام", icon: Bell, enabled: false, config: "غير مُعد" },
  ];
  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">قنوات الإشعارات</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {channels.map((ch, i) => (
            <div key={i} className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <ch.icon className={`h-4 w-4 ${ch.enabled ? "text-emerald-400" : "text-gray-500"}`} />
                <div>
                  <p className="text-white text-sm">{ch.name}</p>
                  <p className="text-gray-500 text-xs">{ch.config}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={ch.enabled ? "border-emerald-500/50 text-emerald-400" : "border-gray-600 text-gray-500"}>
                  {ch.enabled ? "مفعّل" : "معطّل"}
                </Badge>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">إعداد</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">قواعد التنبيه</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { rule: "تسرب جديد بخطورة عالية", action: "إشعار فوري + بريد", active: true },
              { rule: "انخفاض نسبة الامتثال عن 70%", action: "بريد إلكتروني", active: true },
              { rule: "فشل فحص مجدول", action: "إشعار + Webhook", active: true },
              { rule: "محاولة دخول مشبوهة", action: "إشعار فوري + SMS", active: false },
            ].map((r, i) => (
              <div key={i} className="flex items-center justify-between flex-wrap p-2 rounded bg-gray-900/30">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${r.active ? "bg-emerald-400" : "bg-gray-500"}`} />
                  <span className="text-sm text-white">{r.rule}</span>
                </div>
                <span className="text-xs text-gray-400">{r.action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BackupsTab() {
  const backups = [
    { date: "2026-02-20 03:00", size: "2.4 GB", status: "success", type: "تلقائي" },
    { date: "2026-02-19 03:00", size: "2.3 GB", status: "success", type: "تلقائي" },
    { date: "2026-02-18 14:30", size: "2.3 GB", status: "success", type: "يدوي" },
    { date: "2026-02-17 03:00", size: "2.2 GB", status: "failed", type: "تلقائي" },
    { date: "2026-02-16 03:00", size: "2.2 GB", status: "success", type: "تلقائي" },
  ];
  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap">
            <CardTitle className="text-white text-base">جدولة النسخ الاحتياطي</CardTitle>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">نشط</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
              <Clock className="h-4 w-4 text-blue-400 mb-1" />
              <p className="text-white text-sm font-medium">كل يوم 3:00 صباحاً</p>
              <p className="text-gray-500 text-xs">الجدولة الحالية</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
              <HardDrive className="h-4 w-4 text-purple-400 mb-1" />
              <p className="text-white text-sm font-medium">30 يوم</p>
              <p className="text-gray-500 text-xs">مدة الاحتفاظ</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
              <Database className="h-4 w-4 text-amber-400 mb-1" />
              <p className="text-white text-sm font-medium">35.2 GB</p>
              <p className="text-gray-500 text-xs">إجمالي المساحة</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white"><Download className="h-4 w-4 ml-1" /> نسخة يدوية الآن</Button>
            <Button variant="outline" className="border-gray-600 text-gray-300">تعديل الجدولة</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">سجل النسخ الاحتياطية</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {backups.map((b, i) => (
              <div key={i} className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
                <div className="flex items-center gap-3">
                  {b.status === "success" ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertTriangle className="h-4 w-4 text-red-400" />}
                  <div>
                    <p className="text-white text-sm">{b.date}</p>
                    <p className="text-gray-500 text-xs">{b.type} — {b.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {b.status === "success" && <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300"><RefreshCw className="h-3 w-3 ml-1" />استعادة</Button>}
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300"><Trash2 className="h-3 w-3" /></Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SessionsTab() {
  const sessions = [
    { user: "محمد الرحيلي", role: "مشرف عام", ip: "10.0.1.15", device: "Chrome / Windows", lastActive: "الآن", status: "active" },
    { user: "سارة العلي", role: "محلل", ip: "10.0.2.22", device: "Safari / macOS", lastActive: "منذ 5 دقائق", status: "active" },
    { user: "أحمد المحمد", role: "مدير", ip: "10.0.3.8", device: "Firefox / Linux", lastActive: "منذ 15 دقيقة", status: "idle" },
    { user: "نورة الخالد", role: "مشاهد", ip: "10.0.4.33", device: "Chrome / Android", lastActive: "منذ ساعة", status: "idle" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Users className="h-6 w-6 text-emerald-400 mx-auto mb-1" /><div className="text-2xl font-bold text-emerald-400">4</div><div className="text-xs text-gray-400">جلسات نشطة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Clock className="h-6 w-6 text-blue-400 mx-auto mb-1" /><div className="text-2xl font-bold text-blue-400">30 دقيقة</div><div className="text-xs text-gray-400">مهلة الخمول</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Key className="h-6 w-6 text-purple-400 mx-auto mb-1" /><div className="text-2xl font-bold text-purple-400">24 ساعة</div><div className="text-xs text-gray-400">مدة الجلسة القصوى</div></CardContent></Card>
      </div>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap">
            <CardTitle className="text-white text-base">الجلسات النشطة</CardTitle>
            <Button variant="outline" size="sm" className="border-red-500/50 text-red-400 hover:bg-red-500/10">إنهاء جميع الجلسات</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${s.status === "active" ? "bg-emerald-400 animate-pulse" : "bg-amber-400"}`} />
                <div>
                  <p className="text-white text-sm font-medium">{s.user} <span className="text-gray-500 text-xs">({s.role})</span></p>
                  <p className="text-gray-500 text-xs">{s.device} — {s.ip} — {s.lastActive}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">إنهاء</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SeedingTab() {
  const [seedStatus, setSeedStatus] = useState<Record<string, string>>({});
  const seedCategories = [
    { id: "patriotic_phrases", label: "العبارات الوطنية", count: "35+ عبارة", icon: "🇸🇦" },
    { id: "keyword_task_map", label: "ربط الكلمات بالمهام", count: "20+ ربط", icon: "🔗" },
    { id: "rate_limits", label: "حدود الاستخدام", count: "13 قاعدة", icon: "⚡" },
    { id: "guide_catalog", label: "كتالوج الأدلة", count: "12 خطوة", icon: "📖" },
    { id: "scenarios", label: "سيناريوهات الذكاء الاصطناعي", count: "15+ سيناريو", icon: "🤖" },
  ];
  const handleSeed = (id: string) => {
    setSeedStatus((prev) => ({ ...prev, [id]: "seeding" }));
    setTimeout(() => setSeedStatus((prev) => ({ ...prev, [id]: "done" })), 2000);
  };
  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white text-base">بذر البيانات الأولية</CardTitle>
          <p className="text-gray-400 text-sm">تعبئة الجداول الجديدة بالبيانات الافتراضية</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {seedCategories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
              <div className="flex items-center gap-3">
                <span className="text-xl">{cat.icon}</span>
                <div>
                  <p className="text-white text-sm font-medium">{cat.label}</p>
                  <p className="text-gray-500 text-xs">{cat.count}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {seedStatus[cat.id] === "done" && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                <Button variant="outline" size="sm" className="border-gray-600 text-gray-300" disabled={seedStatus[cat.id] === "seeding"} onClick={() => handleSeed(cat.id)}>
                  {seedStatus[cat.id] === "seeding" ? <RefreshCw className="h-3 w-3 animate-spin" /> : "بذر"}
                </Button>
              </div>
            </div>
          ))}
          <div className="pt-2">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full" onClick={() => seedCategories.forEach((c) => handleSeed(c.id))}>
              <Layers className="h-4 w-4 ml-1" /> بذر جميع البيانات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CustomDashboardTab() {
  return (
    <div className="space-y-4">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">إعدادات اللوحة المخصصة</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "الودجات الافتراضية", value: "8 ودجات", icon: Eye },
              { label: "التحديث التلقائي", value: "كل 30 ثانية", icon: RefreshCw },
              { label: "حد الودجات للمستخدم", value: "20 ودجة", icon: Layers },
              { label: "القوالب المتاحة", value: "5 قوالب", icon: Server },
            ].map((item, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/50 flex items-center gap-3">
                <item.icon className="h-5 w-5 text-blue-400" />
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">حفظ الإعدادات</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabId>("identity");
  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-400" />
            إعدادات الإدارة
          </h1>
          <p className="text-gray-400 text-sm mt-1">إعدادات متقدمة للمنصة — الهوية، القوائم، الأدوار، الإشعارات، النسخ الاحتياطية</p>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-400/30">لوحة الإدارة</Badge>
      </div>
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl border border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>
      {activeTab === "identity" && <IdentityTab />}
      {activeTab === "menus" && <MenusTab />}
      {activeTab === "roles" && <RolesTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "backups" && <BackupsTab />}
      {activeTab === "sessions" && <SessionsTab />}
      {activeTab === "seeding" && <SeedingTab />}
      {activeTab === "custom_dashboard" && <CustomDashboardTab />}
    </div>
  );
}
