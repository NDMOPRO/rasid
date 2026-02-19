/**
 * AdminSettings — إعدادات النظام
 * الأقسام: الهوية البصرية | الإعدادات العامة | مزودي API | الثيم والألوان | القوائم والترتيب | القوالب
 * rootAdmin فقط
 */
import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Settings, Palette, Key, Image, FileText, LayoutList,
  Loader2, Save, Plus, Trash2, Edit3, Eye, EyeOff,
  RefreshCw, Check, X, Upload, Download, Copy,
  ChevronRight, Shield, Globe, Zap, AlertTriangle,
  Monitor, Smartphone, Sun, Moon, ToggleLeft, ToggleRight,
  GripVertical, ArrowUp, ArrowDown, ExternalLink, TestTube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ─── Section Navigation ───
const SECTIONS = [
  { id: "brand", label: "الهوية البصرية", icon: Image },
  { id: "general", label: "الإعدادات العامة", icon: Settings },
  { id: "api", label: "مزودي API", icon: Key },
  { id: "theme", label: "الثيم والألوان", icon: Palette },
  { id: "menus", label: "القوائم والترتيب", icon: LayoutList },
  { id: "templates", label: "القوالب", icon: FileText },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export default function AdminSettings() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("brand");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
              <Settings className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">إعدادات النظام</h1>
              <p className="text-sm text-white/50">تكوين المنصة والهوية البصرية والتكاملات</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 flex gap-6">
        {/* Side Navigation */}
        <div className="w-64 shrink-0">
          <div className="sticky top-6 space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                  {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "brand" && <BrandSection />}
          {activeSection === "general" && <GeneralSection />}
          {activeSection === "api" && <ApiProvidersSection />}
          {activeSection === "theme" && <ThemeSection />}
          {activeSection === "menus" && <MenusSection />}
          {activeSection === "templates" && <TemplatesSection />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 1: الهوية البصرية
// ═══════════════════════════════════════════
function BrandSection() {
  const assetsQuery = trpc.adminSettings.getAssets.useQuery();
  const upsertAsset = trpc.adminSettings.upsertAsset.useMutation({
    onSuccess: () => { assetsQuery.refetch(); toast.success("تم تحديث الأصل"); },
  });
  const deleteAsset = trpc.adminSettings.deleteAsset.useMutation({
    onSuccess: () => { assetsQuery.refetch(); toast.success("تم حذف الأصل"); },
  });

  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState({ assetKey: "", assetUrl: "", assetType: "image" as "image" | "svg" | "icon" });

  const assetSlots = [
    { key: "logo_main", label: "الشعار الرئيسي", desc: "يظهر في الشريط الجانبي وصفحة الدخول" },
    { key: "logo_dark", label: "الشعار (الوضع الداكن)", desc: "نسخة الوضع الداكن" },
    { key: "logo_light", label: "الشعار (الوضع الفاتح)", desc: "نسخة الوضع الفاتح" },
    { key: "favicon", label: "الأيقونة المفضلة", desc: "أيقونة التبويب (favicon)" },
    { key: "mascot", label: "شخصية راصد", desc: "صورة المساعد الذكي" },
    { key: "login_bg", label: "خلفية صفحة الدخول", desc: "الخلفية الرئيسية لصفحة تسجيل الدخول" },
  ];

  const assets = assetsQuery.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Image className="w-5 h-5 text-blue-400" />
          الهوية البصرية
        </h2>
        <Button
          size="sm"
          onClick={() => { setEditForm({ assetKey: "", assetUrl: "", assetType: "image" }); setEditDialog(true); }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 ml-1" />
          إضافة أصل
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assetSlots.map((slot) => {
          const asset = assets.find((a: any) => a.assetKey === slot.key);
          return (
            <Card key={slot.key} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-sm">{slot.label}</p>
                    <p className="text-xs text-white/40 mt-1">{slot.desc}</p>
                  </div>
                  {asset && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => {
                        setEditForm({ assetKey: slot.key, assetUrl: (asset as any).assetUrl, assetType: (asset as any).assetType });
                        setEditDialog(true);
                      }}>
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400" onClick={() => deleteAsset.mutate({ assetKey: slot.key })}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                {asset ? (
                  <div className="bg-black/30 rounded-lg p-3 flex items-center justify-center min-h-[80px]">
                    <img src={(asset as any).assetUrl} alt={slot.label} className="max-h-16 max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="bg-black/30 rounded-lg p-3 flex flex-col items-center justify-center min-h-[80px] border-2 border-dashed border-white/10 cursor-pointer hover:border-blue-500/30 transition-colors"
                    onClick={() => { setEditForm({ assetKey: slot.key, assetUrl: "", assetType: "image" }); setEditDialog(true); }}>
                    <Upload className="w-5 h-5 text-white/30 mb-1" />
                    <span className="text-xs text-white/30">اضغط للرفع</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white" dir="rtl">
          <DialogHeader>
            <DialogTitle>{editForm.assetKey ? "تعديل أصل" : "إضافة أصل"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">المعرف (key)</label>
              <Input value={editForm.assetKey} onChange={e => setEditForm(p => ({ ...p, assetKey: e.target.value }))}
                className="bg-white/5 border-white/10" placeholder="logo_main" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">رابط الصورة (URL)</label>
              <Input value={editForm.assetUrl} onChange={e => setEditForm(p => ({ ...p, assetUrl: e.target.value }))}
                className="bg-white/5 border-white/10" placeholder="https://..." />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">النوع</label>
              <Select value={editForm.assetType} onValueChange={(v: any) => setEditForm(p => ({ ...p, assetType: v }))}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">صورة</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                  <SelectItem value="icon">أيقونة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editForm.assetUrl && (
              <div className="bg-black/30 rounded-lg p-3 flex items-center justify-center">
                <img src={editForm.assetUrl} alt="Preview" className="max-h-20 max-w-full object-contain" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialog(false)}>إلغاء</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={!editForm.assetKey || !editForm.assetUrl}
              onClick={() => { upsertAsset.mutate(editForm); setEditDialog(false); }}>
              <Save className="w-4 h-4 ml-1" />حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 2: الإعدادات العامة
// ═══════════════════════════════════════════
function GeneralSection() {
  const settingsQuery = trpc.adminSettings.getPlatformSettings.useQuery();
  const bulkUpdate = trpc.adminSettings.bulkUpdateSettings.useMutation({
    onSuccess: () => { settingsQuery.refetch(); toast.success("تم حفظ الإعدادات"); },
  });

  const [edits, setEdits] = useState<Record<string, string>>({});
  const settings = settingsQuery.data || [];

  const categories = useMemo(() => {
    const map: Record<string, typeof settings> = {};
    settings.forEach((s: any) => {
      const cat = s.category || "general";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [settings]);

  const categoryLabels: Record<string, string> = {
    general: "عام",
    security: "الأمان",
    contact: "التواصل",
    display: "العرض",
    maintenance: "الصيانة",
  };

  const hasChanges = Object.keys(edits).length > 0;

  const handleSave = () => {
    const updates = Object.entries(edits).map(([settingKey, settingValue]) => ({ settingKey, settingValue }));
    bulkUpdate.mutate({ settings: updates });
    setEdits({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          الإعدادات العامة
        </h2>
        {hasChanges && (
          <Button size="sm" onClick={handleSave} disabled={bulkUpdate.isPending} className="bg-green-600 hover:bg-green-700">
            {bulkUpdate.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <Save className="w-4 h-4 ml-1" />}
            حفظ التغييرات ({Object.keys(edits).length})
          </Button>
        )}
      </div>

      {settingsQuery.isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
      ) : (
        Object.entries(categories).map(([cat, items]) => (
          <Card key={cat} className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/70">{categoryLabels[cat] || cat}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(items as any[]).sort((a: any, b: any) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map((s: any) => {
                const currentValue = edits[s.settingKey] ?? s.settingValue ?? "";
                const isEdited = s.settingKey in edits;
                return (
                  <div key={s.settingKey} className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-sm font-medium">{s.label || s.settingKey}</label>
                        {isEdited && <Badge className="bg-amber-500/20 text-amber-400 text-[10px]">معدّل</Badge>}
                        {s.isEditable === 0 && <Badge className="bg-red-500/20 text-red-400 text-[10px]">للقراءة فقط</Badge>}
                      </div>
                      {s.description && <p className="text-xs text-white/40 mb-2">{s.description}</p>}
                      {s.settingType === "boolean" ? (
                        <Switch
                          checked={currentValue === "true"}
                          disabled={s.isEditable === 0}
                          onCheckedChange={(v) => setEdits(p => ({ ...p, [s.settingKey]: String(v) }))}
                        />
                      ) : (
                        <Input
                          value={currentValue}
                          disabled={s.isEditable === 0}
                          onChange={(e) => setEdits(p => ({ ...p, [s.settingKey]: e.target.value }))}
                          className="bg-white/5 border-white/10 max-w-md"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 3: مزودي API
// ═══════════════════════════════════════════
function ApiProvidersSection() {
  const providersQuery = trpc.adminSettings.getApiProviders.useQuery();
  const upsertProvider = trpc.adminSettings.upsertApiProvider.useMutation({
    onSuccess: () => { providersQuery.refetch(); toast.success("تم حفظ المزود"); },
  });
  const deleteProvider = trpc.adminSettings.deleteApiProvider.useMutation({
    onSuccess: () => { providersQuery.refetch(); toast.success("تم حذف المزود"); },
  });
  const testProvider = trpc.adminSettings.testApiProvider.useMutation({
    onSuccess: (data) => {
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
      providersQuery.refetch();
    },
  });

  const [editDialog, setEditDialog] = useState(false);
  const [form, setForm] = useState({
    providerId: "", name: "", type: "llm" as "llm" | "search" | "sms" | "email" | "storage",
    baseUrl: "", apiKey: "", model: "", isActive: true, rateLimit: 0,
  });

  const providers = providersQuery.data || [];

  const typeLabels: Record<string, string> = { llm: "نموذج لغوي", search: "بحث", sms: "رسائل SMS", email: "بريد إلكتروني", storage: "تخزين" };
  const typeColors: Record<string, string> = { llm: "bg-purple-500/20 text-purple-400", search: "bg-blue-500/20 text-blue-400", sms: "bg-green-500/20 text-green-400", email: "bg-amber-500/20 text-amber-400", storage: "bg-cyan-500/20 text-cyan-400" };
  const statusColors: Record<string, string> = { active: "bg-green-500/20 text-green-400", inactive: "bg-gray-500/20 text-gray-400", error: "bg-red-500/20 text-red-400" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Key className="w-5 h-5 text-blue-400" />
          مزودي API
        </h2>
        <Button size="sm" onClick={() => {
          setForm({ providerId: "", name: "", type: "llm", baseUrl: "", apiKey: "", model: "", isActive: true, rateLimit: 0 });
          setEditDialog(true);
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-1" />إضافة مزود
        </Button>
      </div>

      {/* Warning */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-400">تنبيه أمني</p>
          <p className="text-xs text-white/50 mt-1">مفاتيح API يتم تشفيرها بـ AES-256 قبل الحفظ. لا يمكن عرض المفتاح الكامل بعد الحفظ.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(providers as any[]).map((p: any) => (
          <Card key={p.providerId} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.name}</span>
                  <Badge className={typeColors[p.type] || ""}>{typeLabels[p.type] || p.type}</Badge>
                </div>
                <Badge className={statusColors[p.status] || ""}>{p.status === "active" ? "نشط" : p.status === "error" ? "خطأ" : "معطل"}</Badge>
              </div>
              <div className="space-y-2 text-xs text-white/50">
                {p.baseUrl && <p>URL: <span className="text-white/70 font-mono">{p.baseUrl}</span></p>}
                {p.model && <p>النموذج: <span className="text-white/70">{p.model}</span></p>}
                <p>المفتاح: <span className="text-white/70 font-mono">{p._hasKey ? p.keyEncrypted : "غير محدد"}</span></p>
                {p.rateLimit > 0 && <p>الحد: <span className="text-white/70">{p.rateLimit} طلب/يوم</span> | المستخدم: <span className="text-white/70">{p.usedToday || 0}</span></p>}
                {p.lastChecked && <p>آخر فحص: <span className="text-white/70">{new Date(p.lastChecked).toLocaleString("ar-SA")}</span></p>}
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => testProvider.mutate({ providerId: p.providerId })}>
                  {testProvider.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3 ml-1" />}
                  اختبار
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => {
                  setForm({ providerId: p.providerId, name: p.name, type: p.type, baseUrl: p.baseUrl || "", apiKey: "", model: p.model || "", isActive: !!p.isActive, rateLimit: p.rateLimit || 0 });
                  setEditDialog(true);
                }}>
                  <Edit3 className="w-3 h-3 ml-1" />تعديل
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400" onClick={() => deleteProvider.mutate({ providerId: p.providerId })}>
                  <Trash2 className="w-3 h-3 ml-1" />حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-lg" dir="rtl">
          <DialogHeader><DialogTitle>{form.providerId ? "تعديل مزود" : "إضافة مزود جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">المعرف</label>
                <Input value={form.providerId} onChange={e => setForm(p => ({ ...p, providerId: e.target.value }))}
                  className="bg-white/5 border-white/10" placeholder="openai-gpt4" disabled={!!form.providerId && (providers as any[]).some((p: any) => p.providerId === form.providerId)} />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">الاسم</label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-white/5 border-white/10" placeholder="OpenAI GPT-4" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">النوع</label>
                <Select value={form.type} onValueChange={(v: any) => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llm">نموذج لغوي (LLM)</SelectItem>
                    <SelectItem value="search">بحث</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="email">بريد إلكتروني</SelectItem>
                    <SelectItem value="storage">تخزين</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">النموذج</label>
                <Input value={form.model} onChange={e => setForm(p => ({ ...p, model: e.target.value }))}
                  className="bg-white/5 border-white/10" placeholder="gpt-4o" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">Base URL</label>
              <Input value={form.baseUrl} onChange={e => setForm(p => ({ ...p, baseUrl: e.target.value }))}
                className="bg-white/5 border-white/10 font-mono text-xs" placeholder="https://api.openai.com/v1" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">مفتاح API <span className="text-amber-400">(يُشفّر تلقائياً)</span></label>
              <Input type="password" value={form.apiKey} onChange={e => setForm(p => ({ ...p, apiKey: e.target.value }))}
                className="bg-white/5 border-white/10 font-mono text-xs" placeholder="sk-..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">حد الاستخدام اليومي</label>
                <Input type="number" value={form.rateLimit} onChange={e => setForm(p => ({ ...p, rateLimit: parseInt(e.target.value) || 0 }))}
                  className="bg-white/5 border-white/10" />
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} />
                  مفعّل
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialog(false)}>إلغاء</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={!form.providerId || !form.name}
              onClick={() => { upsertProvider.mutate(form); setEditDialog(false); }}>
              <Save className="w-4 h-4 ml-1" />حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 4: الثيم والألوان
// ═══════════════════════════════════════════
function ThemeSection() {
  const themeQuery = trpc.adminSettings.getThemeSettings.useQuery();
  const bulkUpdate = trpc.adminSettings.bulkUpdateTheme.useMutation({
    onSuccess: () => { themeQuery.refetch(); toast.success("تم حفظ الثيم"); },
  });
  const resetTheme = trpc.adminSettings.resetThemeToDefault.useMutation({
    onSuccess: () => { themeQuery.refetch(); toast.success("تم إعادة الثيم للافتراضي"); },
  });

  const [edits, setEdits] = useState<Record<string, string>>({});
  const themeData = themeQuery.data || [];

  const categories = useMemo(() => {
    const map: Record<string, any[]> = {};
    (themeData as any[]).forEach((s: any) => {
      const cat = s.category || "primary";
      if (!map[cat]) map[cat] = [];
      map[cat].push(s);
    });
    return map;
  }, [themeData]);

  const catLabels: Record<string, string> = {
    primary: "الألوان الرئيسية", secondary: "الألوان الثانوية", accent: "ألوان التمييز",
    background: "الخلفيات", text: "النصوص", border: "الحدود", shadow: "الظلال", font: "الخطوط", layout: "التخطيط",
  };

  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-400" />
          الثيم والألوان
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => resetTheme.mutate()} className="border-white/10 text-white/60">
            <RefreshCw className="w-4 h-4 ml-1" />إعادة الافتراضي
          </Button>
          {hasChanges && (
            <Button size="sm" onClick={() => {
              bulkUpdate.mutate({ settings: Object.entries(edits).map(([themeKey, themeValue]) => ({ themeKey, themeValue })) });
              setEdits({});
            }} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 ml-1" />حفظ ({Object.keys(edits).length})
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-white/50">الألوان تُطبق كمتغيرات CSS على <code className="bg-white/10 px-1 rounded">:root</code> وتعمل فوراً على كامل المنصة.</p>

      {themeQuery.isLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
      ) : (
        Object.entries(categories).map(([cat, items]) => (
          <Card key={cat} className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-white/70">{catLabels[cat] || cat}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((s: any) => {
                  const currentValue = edits[s.themeKey] ?? s.themeValue ?? "";
                  const isColor = s.themeType === "color" || s.themeType === "gradient";
                  return (
                    <div key={s.themeKey} className="flex items-center gap-3">
                      {isColor && (
                        <div className="w-8 h-8 rounded-lg border border-white/20 shrink-0" style={{ background: currentValue }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <label className="text-xs text-white/60 block mb-1">{s.label || s.themeKey}</label>
                        {isColor ? (
                          <div className="flex gap-2">
                            <Input type="color" value={currentValue} onChange={e => setEdits(p => ({ ...p, [s.themeKey]: e.target.value }))}
                              className="w-10 h-8 p-0 bg-transparent border-none cursor-pointer" />
                            <Input value={currentValue} onChange={e => setEdits(p => ({ ...p, [s.themeKey]: e.target.value }))}
                              className="bg-white/5 border-white/10 text-xs font-mono h-8 flex-1" />
                          </div>
                        ) : (
                          <Input value={currentValue} onChange={e => setEdits(p => ({ ...p, [s.themeKey]: e.target.value }))}
                            className="bg-white/5 border-white/10 text-xs h-8" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 5: القوائم والترتيب
// ═══════════════════════════════════════════
function MenusSection() {
  const menusQuery = trpc.adminSettings.getMenus.useQuery();
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  const menuItemsQuery = trpc.adminSettings.getMenuItems.useQuery(
    { menuId: selectedMenu || "" },
    { enabled: !!selectedMenu }
  );
  const reorder = trpc.adminSettings.reorderMenuItems.useMutation({
    onSuccess: () => { menuItemsQuery.refetch(); toast.success("تم حفظ الترتيب"); },
  });
  const toggleItem = trpc.adminSettings.toggleMenuItem.useMutation({
    onSuccess: () => { menuItemsQuery.refetch(); },
  });

  const menus = (menusQuery.data || []) as any[];
  const items = (menuItemsQuery.data || []) as any[];

  const moveItem = (index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    reorder.mutate({ items: newItems.map((item: any, i: number) => ({ id: item.id, sortOrder: i })) });
  };

  const locationLabels: Record<string, string> = { sidebar: "الشريط الجانبي", top_nav: "الشريط العلوي", footer: "التذييل", contextual: "سياقي", mobile: "الجوال" };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <LayoutList className="w-5 h-5 text-blue-400" />
        القوائم والترتيب
      </h2>

      {/* Menu Selector */}
      <div className="flex gap-2 flex-wrap">
        {menus.map((m: any) => (
          <Button key={m.id} size="sm" variant={selectedMenu === m.id ? "default" : "outline"}
            onClick={() => setSelectedMenu(m.id)}
            className={selectedMenu === m.id ? "bg-blue-600" : "border-white/10 text-white/60"}>
            {m.menuName}
            <Badge className="mr-2 text-[10px]">{locationLabels[m.menuLocation] || m.menuLocation}</Badge>
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      {selectedMenu && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            {menuItemsQuery.isLoading ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
            ) : items.length === 0 ? (
              <p className="text-center text-white/40 py-10">لا توجد عناصر في هذه القائمة</p>
            ) : (
              <div className="space-y-2">
                {items.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-black/20 rounded-lg border border-white/5">
                    <GripVertical className="w-4 h-4 text-white/30" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.miTitle}</p>
                      {item.miTitleEn && <p className="text-xs text-white/40">{item.miTitleEn}</p>}
                      {item.miLinkTarget && <p className="text-xs text-blue-400/60 font-mono">{item.miLinkTarget}</p>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={index === 0} onClick={() => moveItem(index, "up")}>
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={index === items.length - 1} onClick={() => moveItem(index, "down")}>
                        <ArrowDown className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0"
                        onClick={() => toggleItem.mutate({ id: item.id, status: item.miStatus === "active" ? "disabled" : "active" })}>
                        {item.miStatus === "active" ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4 text-white/30" />}
                      </Button>
                    </div>
                    <Badge className={item.miStatus === "active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                      {item.miStatus === "active" ? "مفعّل" : "معطّل"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedMenu && menus.length > 0 && (
        <p className="text-center text-white/40 py-10">اختر قائمة لعرض عناصرها وإعادة ترتيبها</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 6: القوالب
// ═══════════════════════════════════════════
function TemplatesSection() {
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const templatesQuery = trpc.adminSettings.getTemplates.useQuery(filterType ? { type: filterType as any } : undefined);
  const upsertTemplate = trpc.adminSettings.upsertTemplate.useMutation({
    onSuccess: () => { templatesQuery.refetch(); toast.success("تم حفظ القالب"); },
  });
  const deleteTemplate = trpc.adminSettings.deleteTemplate.useMutation({
    onSuccess: () => { templatesQuery.refetch(); toast.success("تم حذف القالب"); },
  });
  const duplicateTemplate = trpc.adminSettings.duplicateTemplate.useMutation({
    onSuccess: () => { templatesQuery.refetch(); toast.success("تم نسخ القالب"); },
  });

  const [editDialog, setEditDialog] = useState(false);
  const [form, setForm] = useState({
    templateId: "", name: "", nameAr: "",
    type: "report" as "report" | "notification" | "export" | "import",
    format: "pdf" as "pdf" | "docx" | "xlsx" | "csv" | "html" | "email" | "sms",
    content: "", isDefault: false, isActive: true,
  });

  const templates = (templatesQuery.data || []) as any[];
  const typeLabels: Record<string, string> = { report: "تقرير", notification: "إشعار", export: "تصدير", import: "استيراد" };
  const typeColors: Record<string, string> = { report: "bg-blue-500/20 text-blue-400", notification: "bg-amber-500/20 text-amber-400", export: "bg-green-500/20 text-green-400", import: "bg-purple-500/20 text-purple-400" };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          القوالب
        </h2>
        <Button size="sm" onClick={() => {
          setForm({ templateId: "", name: "", nameAr: "", type: "report", format: "pdf", content: "", isDefault: false, isActive: true });
          setEditDialog(true);
        }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 ml-1" />إضافة قالب
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button size="sm" variant={!filterType ? "default" : "outline"} onClick={() => setFilterType(undefined)}
          className={!filterType ? "bg-blue-600" : "border-white/10 text-white/60"}>الكل</Button>
        {Object.entries(typeLabels).map(([k, v]) => (
          <Button key={k} size="sm" variant={filterType === k ? "default" : "outline"} onClick={() => setFilterType(k)}
            className={filterType === k ? "bg-blue-600" : "border-white/10 text-white/60"}>{v}</Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((t: any) => (
          <Card key={t.templateId} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{t.nameAr || t.name}</p>
                  {t.nameAr && t.name !== t.nameAr && <p className="text-xs text-white/40">{t.name}</p>}
                </div>
                <div className="flex gap-1">
                  <Badge className={typeColors[t.type] || ""}>{typeLabels[t.type] || t.type}</Badge>
                  <Badge className="bg-white/10 text-white/60">{t.format}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40 mb-3">
                {t.isDefault === 1 && <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">افتراضي</Badge>}
                {t.isActive !== 1 && <Badge className="bg-red-500/20 text-red-400 text-[10px]">معطّل</Badge>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => {
                  setForm({ templateId: t.templateId, name: t.name, nameAr: t.nameAr || "", type: t.type, format: t.format, content: t.content || "", isDefault: t.isDefault === 1, isActive: t.isActive === 1 });
                  setEditDialog(true);
                }}>
                  <Edit3 className="w-3 h-3 ml-1" />تعديل
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => duplicateTemplate.mutate({ templateId: t.templateId })}>
                  <Copy className="w-3 h-3 ml-1" />نسخ
                </Button>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400" onClick={() => deleteTemplate.mutate({ templateId: t.templateId })}>
                  <Trash2 className="w-3 h-3 ml-1" />حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-2xl" dir="rtl">
          <DialogHeader><DialogTitle>{form.templateId ? "تعديل قالب" : "إضافة قالب جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">المعرف</label>
                <Input value={form.templateId} onChange={e => setForm(p => ({ ...p, templateId: e.target.value }))}
                  className="bg-white/5 border-white/10" placeholder="report-monthly" />
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">الاسم (EN)</label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">الاسم (AR)</label>
              <Input value={form.nameAr} onChange={e => setForm(p => ({ ...p, nameAr: e.target.value }))}
                className="bg-white/5 border-white/10" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-white/60 mb-1 block">النوع</label>
                <Select value={form.type} onValueChange={(v: any) => setForm(p => ({ ...p, type: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-white/60 mb-1 block">الصيغة</label>
                <Select value={form.format} onValueChange={(v: any) => setForm(p => ({ ...p, format: v }))}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["pdf","docx","xlsx","csv","html","email","sms"].map(f => <SelectItem key={f} value={f}>{f.toUpperCase()}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">المحتوى</label>
              <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                className="bg-white/5 border-white/10 min-h-[200px] font-mono text-xs" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.isDefault} onCheckedChange={v => setForm(p => ({ ...p, isDefault: v }))} />افتراضي</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={form.isActive} onCheckedChange={v => setForm(p => ({ ...p, isActive: v }))} />مفعّل</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditDialog(false)}>إلغاء</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" disabled={!form.templateId || !form.name || !form.nameAr}
              onClick={() => { upsertTemplate.mutate(form); setEditDialog(false); }}>
              <Save className="w-4 h-4 ml-1" />حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
