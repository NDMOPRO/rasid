import { useState, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings2, Globe, Palette, Users, FileText, Database, Activity, Shield,
  Plus, Trash2, Edit, Save, Download, Upload, Eye, EyeOff, GripVertical,
  BarChart3, Loader2, RefreshCw, Search, Crown, Check, X,
  Image, Type, Layout, Layers, Monitor, LogIn, PanelLeft, Bell,
  LayoutGrid, Table2, FormInput, MessageSquare, FileBarChart, Mail,
  FileDown, BellRing, Gauge, Wrench, Lock, Link2, Sparkles,
  AlertTriangle, Bot, Megaphone, Scan, BookOpen, History, Clock, Undo2, ExternalLink
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { PremiumPageContainer } from "@/components/UltraPremiumWrapper";

// ============================================
// Category metadata for all 29 categories
// ============================================
const CATEGORY_META: Record<string, { label: string; labelEn: string; icon: any; color: string }> = {
  branding: { label: "العلامة التجارية", labelEn: "Branding", icon: Sparkles, color: "text-amber-400" },
  theme: { label: "الألوان والثيم", labelEn: "Theme", icon: Palette, color: "text-pink-400" },
  typography: { label: "الخطوط والطباعة", labelEn: "Typography", icon: Type, color: "text-indigo-400" },
  layout: { label: "التخطيط والتصميم", labelEn: "Layout", icon: Layout, color: "text-cyan-400" },
  pages: { label: "الصفحات والتنقل", labelEn: "Pages", icon: Layers, color: "text-blue-400" },
  content: { label: "المحتوى العام", labelEn: "Content", icon: FileText, color: "text-green-400" },
  login_page: { label: "صفحة تسجيل الدخول", labelEn: "Login Page", icon: LogIn, color: "text-violet-400" },
  sidebar: { label: "الشريط الجانبي", labelEn: "Sidebar", icon: PanelLeft, color: "text-slate-400" },
  header: { label: "الشريط العلوي", labelEn: "Header", icon: Monitor, color: "text-sky-400" },
  stats_cards: { label: "كروت الإحصائيات", labelEn: "Stats Cards", icon: LayoutGrid, color: "text-emerald-400" },
  tables: { label: "الجداول", labelEn: "Tables", icon: Table2, color: "text-orange-400" },
  forms: { label: "النماذج", labelEn: "Forms", icon: FormInput, color: "text-lime-400" },
  dialogs: { label: "الحوارات", labelEn: "Dialogs", icon: MessageSquare, color: "text-fuchsia-400" },
  reports: { label: "التقارير", labelEn: "Reports", icon: FileBarChart, color: "text-teal-400" },
  letters: { label: "الخطابات", labelEn: "Letters", icon: Mail, color: "text-rose-400" },
  scans: { label: "الفحوصات", labelEn: "Scans", icon: Scan, color: "text-purple-400" },
  ai_assistant: { label: "راصد الذكي", labelEn: "AI Assistant", icon: Bot, color: "text-yellow-400" },
  error_pages: { label: "صفحات الأخطاء", labelEn: "Error Pages", icon: AlertTriangle, color: "text-red-400" },
  email_templates: { label: "قوالب الإيميلات", labelEn: "Email Templates", icon: Mail, color: "text-blue-300" },
  export: { label: "التصدير", labelEn: "Export", icon: FileDown, color: "text-green-300" },
  in_app_notifications: { label: "الإشعارات الداخلية", labelEn: "In-App Notifications", icon: BellRing, color: "text-amber-300" },
  executive_dashboard: { label: "لوحة المؤشرات القيادية", labelEn: "Executive Dashboard", icon: Gauge, color: "text-cyan-300" },
  advanced: { label: "إعدادات متقدمة", labelEn: "Advanced", icon: Wrench, color: "text-gray-400" },
  seo: { label: "SEO وميتاداتا", labelEn: "SEO & Metadata", icon: Link2, color: "text-indigo-300" },
  dashboard: { label: "لوحة المعلومات", labelEn: "Dashboard", icon: BarChart3, color: "text-blue-400" },
  notifications: { label: "إعدادات الإشعارات", labelEn: "Notifications", icon: Bell, color: "text-orange-300" },
  security: { label: "الأمان", labelEn: "Security", icon: Lock, color: "text-red-300" },
  members: { label: "الأعضاء", labelEn: "Members", icon: Users, color: "text-purple-300" },
  data_transfer: { label: "تصدير واستيراد البيانات", labelEn: "Data Transfer", icon: Database, color: "text-teal-300" },
};

// Tab groups for the main navigation
const TAB_GROUPS = [
  { value: "overview", label: "نظرة عامة", icon: Monitor },
  { value: "branding_identity", label: "الهوية", icon: Sparkles },
  { value: "ui_design", label: "التصميم", icon: Palette },
  { value: "pages_content", label: "المحتوى", icon: Layers },
  { value: "components", label: "المكونات", icon: LayoutGrid },
  { value: "features", label: "الميزات", icon: Scan },
  { value: "system", label: "النظام", icon: Settings2 },
  { value: "members_tab", label: "الأعضاء", icon: Users },
  { value: "data_tab", label: "البيانات", icon: Database },
  { value: "preview_tab", label: "معاينة حية", icon: Eye },
  { value: "audit_tab", label: "سجل التغييرات", icon: History },
];

// Map tab groups to their categories
const TAB_CATEGORIES: Record<string, string[]> = {
  branding_identity: ["branding", "login_page", "seo"],
  ui_design: ["theme", "typography", "layout", "sidebar", "header"],
  pages_content: ["pages", "content", "error_pages"],
  components: ["stats_cards", "tables", "forms", "dialogs"],
  features: ["scans", "reports", "letters", "ai_assistant", "executive_dashboard", "export", "email_templates"],
  system: ["dashboard", "notifications", "in_app_notifications", "security", "advanced"],
};

// ============================================
// Reusable Setting Editor Component
// ============================================
function SettingEditor({ setting, onSave, saving }: { setting: any; onSave: (key: string, value: string) => void; saving: boolean }) {
  const [value, setValue] = useState(setting.settingValue || "");
  const [dirty, setDirty] = useState(false);

  const handleChange = (newVal: string) => {
    setValue(newVal);
    setDirty(newVal !== (setting.settingValue || ""));
  };

  const handleSave = () => {
    onSave(setting.settingKey, value);
    setDirty(false);
  };

  const settingType = setting.settingType || "string";

  return (
    <div className="overflow-x-hidden max-w-full flex items-start gap-3 p-3 rounded-lg bg-card/30 border border-border/30 hover:border-primary/20 transition-colors">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{setting.label || setting.settingKey}</Label>
          {setting.labelEn && <span className="text-xs text-muted-foreground">({setting.labelEn})</span>}
          <Badge variant="outline" className="text-xs sm:text-[10px] px-1.5 py-0">{settingType}</Badge>
        </div>
        {setting.description && <p className="text-xs text-muted-foreground">{setting.description}</p>}

        {settingType === "boolean" ? (
          <div className="flex items-center gap-2 pt-1">
            <Switch
              checked={value === "true"}
              onCheckedChange={(checked) => handleChange(checked ? "true" : "false")}
            />
            <span className="text-xs text-muted-foreground">{value === "true" ? "مفعّل" : "معطّل"}</span>
          </div>
        ) : settingType === "color" ? (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value.startsWith("#") ? value : "#000000"}
              onChange={(e) => handleChange(e.target.value)}
              className="w-8 h-8 rounded border border-border cursor-pointer"
            />
            <Input value={value} onChange={(e) => handleChange(e.target.value)} className="flex-1 h-8 text-xs font-mono" />
          </div>
        ) : settingType === "json" ? (
          <Textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="text-xs font-mono min-h-[60px]"
            dir="ltr"
          />
        ) : settingType === "image" ? (
          <div className="space-y-2">
            <Input value={value} onChange={(e) => handleChange(e.target.value)} placeholder="رابط الصورة (URL)" className="h-8 text-xs" dir="ltr" />
            {value && (
              <div className="w-16 h-16 rounded border border-border overflow-hidden bg-card/50">
                <img src={value} alt="" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
            )}
          </div>
        ) : settingType === "number" ? (
          <Input type="number" value={value} onChange={(e) => handleChange(e.target.value)} className="h-8 text-xs max-w-[200px]" dir="ltr" />
        ) : value.length > 100 ? (
          <Textarea value={value} onChange={(e) => handleChange(e.target.value)} className="text-xs min-h-[60px]" />
        ) : (
          <Input value={value} onChange={(e) => handleChange(e.target.value)} className="h-8 text-xs" />
        )}
      </div>

      {dirty && (
        <Button size="sm" onClick={handleSave} disabled={saving} className="mt-6 shrink-0">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 me-1" />}
          حفظ
        </Button>
      )}
    </div>
  );
}

// ============================================
// Tab 1: System Overview
// ============================================
function SystemOverviewTab() {
  const { data: overview, isLoading } = trpc.superAdmin.getSystemOverview.useQuery();
  const { data: allSettings } = trpc.superAdmin.getSettings.useQuery();

  const categoryCounts = useMemo(() => {
    if (!allSettings) return {};
    const counts: Record<string, number> = {};
    allSettings.forEach((s: any) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [allSettings]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const entityStats = [
    { label: "المواقع", value: overview?.sites ?? 0, icon: Globe, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "الفحوصات", value: overview?.scans ?? 0, icon: Shield, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "الأعضاء", value: overview?.users ?? 0, icon: Users, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "الخطابات", value: overview?.letters ?? 0, icon: FileText, color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "الحالات", value: overview?.cases ?? 0, icon: Activity, color: "text-red-400", bg: "bg-red-500/10" },
  ];

  const configStats = [
    { label: "إجمالي الإعدادات", value: overview?.settings ?? 0, icon: Settings2, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "الصفحات", value: overview?.pages ?? 0, icon: Layout, color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "إعدادات المظهر", value: overview?.themes ?? 0, icon: Palette, color: "text-pink-400", bg: "bg-pink-500/10" },
    { label: "كتل المحتوى", value: overview?.contentBlocks ?? 0, icon: Layers, color: "text-indigo-400", bg: "bg-indigo-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Entity Stats */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">بيانات المنصة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {entityStats.map((s) => (
            <Card key={s.label} className="glass-card gold-sweep border-border/30 hover:border-primary/20 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{Number(s.value).toLocaleString("ar-SA")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Config Stats */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">إعدادات التحكم</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {configStats.map((s) => (
            <Card key={s.label} className="glass-card gold-sweep border-border/30 hover:border-primary/20 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${s.bg} ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-xl font-bold">{Number(s.value).toLocaleString("ar-SA")}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Categories Breakdown */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">توزيع الإعدادات حسب الفئة ({Object.keys(categoryCounts).length} فئة)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]).map(([cat, count]) => {
            const meta = CATEGORY_META[cat] || { label: cat, icon: Settings2, color: "text-gray-400" };
            const Icon = meta.icon;
            return (
              <div key={cat} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/30 border border-border/20">
                <Icon className={`h-4 w-4 ${meta.color} shrink-0`} />
                <span className="text-xs truncate flex-1">{meta.label}</span>
                <Badge variant="secondary" className="text-xs sm:text-[10px] shrink-0">{count}</Badge>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Category Settings Panel (reusable for any category group)
// ============================================
function CategorySettingsPanel({ categories }: { categories: string[] }) {
  const utils = trpc.useUtils();
  const { data: allSettings, isLoading } = trpc.superAdmin.getSettings.useQuery();
  const upsertMutation = trpc.superAdmin.upsertSetting.useMutation({
    onSuccess: () => { utils.superAdmin.getSettings.invalidate(); utils.superAdmin.getAllConfig.invalidate(); toast.success("تم حفظ الإعداد"); },
    onError: (e: any) => toast.error(e.message),
  });
  const trackedMutation = trpc.superAdmin.trackedUpdateSetting.useMutation({
    onSuccess: () => { utils.superAdmin.getSettings.invalidate(); utils.superAdmin.getAllConfig.invalidate(); toast.success("تم حفظ الإعداد مع تسجيل التغيير"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = trpc.superAdmin.deleteSetting.useMutation({
    onSuccess: () => { utils.superAdmin.getSettings.invalidate(); toast.success("تم حذف الإعداد"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState({ settingKey: "", settingValue: "", settingType: "string", category: categories[0] || "branding", label: "", labelEn: "", description: "" });

  const settingsByCategory = useMemo(() => {
    if (!allSettings) return {};
    const grouped: Record<string, any[]> = {};
    allSettings.forEach((s: any) => {
      if (!categories.includes(s.category)) return;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = (s.settingKey || "").toLowerCase().includes(q) ||
          (s.label || "").toLowerCase().includes(q) ||
          (s.labelEn || "").toLowerCase().includes(q) ||
          (s.settingValue || "").toLowerCase().includes(q);
        if (!match) return;
      }
      if (!grouped[s.category]) grouped[s.category] = [];
      grouped[s.category].push(s);
    });
    // Sort by sortOrder
    Object.values(grouped).forEach(arr => arr.sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0)));
    return grouped;
  }, [allSettings, categories, searchQuery]);

  const handleSave = useCallback((key: string, value: string) => {
    // Find the category for this setting
    const setting = allSettings?.find((s: any) => s.settingKey === key);
    const cat = setting?.category || categories[0] || 'branding';
    trackedMutation.mutate({ settingKey: key, settingValue: value, category: cat });
  }, [trackedMutation, allSettings, categories]);

  const handleAddNew = () => {
    if (!addForm.settingKey) { toast.error("المفتاح مطلوب"); return; }
    upsertMutation.mutate({
      settingKey: addForm.settingKey,
      settingValue: addForm.settingValue,
      settingType: addForm.settingType,
      category: addForm.category,
      label: addForm.label,
      description: addForm.description,
    });
    setShowAddDialog(false);
    setAddForm({ settingKey: "", settingValue: "", settingType: "string", category: categories[0] || "branding", label: "", labelEn: "", description: "" });
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const totalCount = Object.values(settingsByCategory).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الإعدادات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 h-9"
          />
        </div>
        <Badge variant="secondary" className="text-xs">{totalCount} إعداد</Badge>
        <Button size="sm" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-3.5 w-3.5 me-1" /> إضافة إعداد
        </Button>
      </div>

      {/* Accordion for each category */}
      <Accordion type="multiple" defaultValue={categories} className="space-y-2">
        {categories.map((cat) => {
          const items = settingsByCategory[cat] || [];
          const meta = CATEGORY_META[cat] || { label: cat, icon: Settings2, color: "text-gray-400" };
          const Icon = meta.icon;
          if (items.length === 0 && searchQuery) return null;

          return (
            <AccordionItem key={cat} value={cat} className="border border-border/30 rounded-xl overflow-hidden bg-card/20">
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-card/30">
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${meta.color}`} />
                  <span className="font-semibold text-sm">{meta.label}</span>
                  <span className="text-xs text-muted-foreground">({meta.labelEn})</span>
                  <Badge variant="outline" className="text-xs sm:text-[10px] ml-2">{items.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">لا توجد إعدادات في هذه الفئة</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((s: any) => (
                      <div key={s.settingKey} className="relative group">
                        <SettingEditor setting={s} onSave={handleSave} saving={upsertMutation.isPending} />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 left-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm("هل أنت متأكد من حذف هذا الإعداد؟")) {
                              deleteMutation.mutate({ key: s.settingKey });
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة إعداد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">المفتاح (settingKey)</Label>
              <Input value={addForm.settingKey} onChange={(e) => setAddForm(f => ({ ...f, settingKey: e.target.value }))} className="h-8 text-xs" dir="ltr" placeholder="e.g. branding_new_setting" />
            </div>
            <div>
              <Label className="text-xs">القيمة</Label>
              <Input value={addForm.settingValue} onChange={(e) => setAddForm(f => ({ ...f, settingValue: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">النوع</Label>
                <Select value={addForm.settingType} onValueChange={(v) => setAddForm(f => ({ ...f, settingType: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">نص</SelectItem>
                    <SelectItem value="number">رقم</SelectItem>
                    <SelectItem value="boolean">منطقي</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="image">صورة</SelectItem>
                    <SelectItem value="color">لون</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">الفئة</Label>
                <Select value={addForm.category} onValueChange={(v) => setAddForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{CATEGORY_META[c]?.label || c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">التسمية (عربي)</Label>
              <Input value={addForm.label} onChange={(e) => setAddForm(f => ({ ...f, label: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div>
              <Label className="text-xs">الوصف</Label>
              <Input value={addForm.description} onChange={(e) => setAddForm(f => ({ ...f, description: e.target.value }))} className="h-8 text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button size="sm" onClick={handleAddNew} disabled={upsertMutation.isPending}>
              {upsertMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin me-1" /> : <Plus className="h-3 w-3 me-1" />}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// Theme Settings Panel
// ============================================
function ThemeSettingsPanel() {
  const utils = trpc.useUtils();
  const { data: themes, isLoading } = trpc.superAdmin.getTheme.useQuery();
  const upsertMutation = trpc.superAdmin.upsertTheme.useMutation({
    onSuccess: () => { utils.superAdmin.getTheme.invalidate(); utils.superAdmin.getAllConfig.invalidate(); toast.success("تم حفظ إعداد المظهر"); },
    onError: (e: any) => toast.error(e.message),
  });
  const trackedThemeMutation = trpc.superAdmin.trackedUpdateTheme.useMutation({
    onSuccess: () => { utils.superAdmin.getTheme.invalidate(); utils.superAdmin.getAllConfig.invalidate(); toast.success("تم حفظ إعداد المظهر مع تسجيل التغيير"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [searchQuery, setSearchQuery] = useState("");

  const themesByCategory = useMemo(() => {
    if (!themes) return {};
    const grouped: Record<string, any[]> = {};
    themes.forEach((t: any) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match = (t.themeKey || "").toLowerCase().includes(q) || (t.label || "").toLowerCase().includes(q) || (t.themeValue || "").toLowerCase().includes(q);
        if (!match) return;
      }
      const cat = t.category || "primary";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(t);
    });
    return grouped;
  }, [themes, searchQuery]);

  const themeCatLabels: Record<string, string> = {
    primary: "الألوان الأساسية",
    secondary: "الألوان الثانوية",
    accent: "ألوان التمييز",
    background: "ألوان الخلفية",
    text: "ألوان النصوص",
    border: "ألوان الحدود",
    shadow: "الظلال",
    font: "الخطوط",
    layout: "التخطيط",
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث في إعدادات المظهر..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-9 h-9" />
        </div>
        <Badge variant="secondary" className="text-xs">{themes?.length || 0} إعداد</Badge>
      </div>

      <Accordion type="multiple" defaultValue={Object.keys(themesByCategory)} className="space-y-2">
        {Object.entries(themesByCategory).map(([cat, items]) => (
          <AccordionItem key={cat} value={cat} className="border border-border/30 rounded-xl overflow-hidden bg-card/20">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-card/30">
              <div className="flex items-center gap-3">
                <Palette className="h-4 w-4 text-pink-400" />
                <span className="font-semibold text-sm">{themeCatLabels[cat] || cat}</span>
                <Badge variant="outline" className="text-xs sm:text-[10px]">{items.length}</Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-3">
                {items.map((t: any) => (
                  <ThemeSettingEditor key={t.themeKey} theme={t} onSave={(key, value) => trackedThemeMutation.mutate({ themeKey: key, themeValue: value, category: t.category || 'primary' })} saving={trackedThemeMutation.isPending} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function ThemeSettingEditor({ theme, onSave, saving }: { theme: any; onSave: (key: string, value: string) => void; saving: boolean }) {
  const [value, setValue] = useState(theme.themeValue || "");
  const [dirty, setDirty] = useState(false);

  const handleChange = (newVal: string) => {
    setValue(newVal);
    setDirty(newVal !== (theme.themeValue || ""));
  };

  const isColor = theme.themeType === "color" || theme.themeType === "gradient";

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-card/30 border border-border/30 hover:border-primary/20 transition-colors">
      {isColor && (
        <div className="w-10 h-10 rounded-lg border border-border shrink-0" style={{ background: value.startsWith("linear") ? value : value }} />
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">{theme.label || theme.themeKey}</Label>
          {theme.cssVariable && <Badge variant="outline" className="text-xs sm:text-[10px] px-1.5 font-mono">{theme.cssVariable}</Badge>}
        </div>
        {theme.themeType === "color" ? (
          <div className="flex items-center gap-2">
            <input type="color" value={value.startsWith("#") ? value : "#000000"} onChange={(e) => handleChange(e.target.value)} className="w-7 h-7 rounded border border-border cursor-pointer" />
            <Input value={value} onChange={(e) => handleChange(e.target.value)} className="flex-1 h-7 text-xs font-mono" dir="ltr" />
          </div>
        ) : (
          <Input value={value} onChange={(e) => handleChange(e.target.value)} className="h-7 text-xs font-mono" dir="ltr" />
        )}
      </div>
      {dirty && (
        <Button size="sm" onClick={() => { onSave(theme.themeKey, value); setDirty(false); }} disabled={saving} className="shrink-0">
          {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3 me-1" />}
          حفظ
        </Button>
      )}
    </div>
  );
}

// ============================================
// Members Management Tab
// ============================================
function MembersManagementTab() {
  const utils = trpc.useUtils();
  const { data: members, isLoading } = trpc.superAdmin.getMembers.useQuery();
  const updateRole = trpc.superAdmin.updateMemberRole.useMutation({
    onSuccess: () => { utils.superAdmin.getMembers.invalidate(); toast.success("تم تحديث الدور"); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMember = trpc.superAdmin.deleteMember.useMutation({
    onSuccess: () => { utils.superAdmin.getMembers.invalidate(); toast.success("تم حذف العضو"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    if (!members) return [];
    if (!searchQuery) return members;
    const q = searchQuery.toLowerCase();
    return members.filter((m: any) =>
      (m.name || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.displayName || "").toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو البريد..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pr-9 h-9" />
        </div>
        <Badge variant="secondary" className="text-xs">{members?.length || 0} عضو</Badge>
      </div>

      <Card className="glass-card gold-sweep border-border/30 overflow-hidden">
        <ScrollArea className="max-h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">البريد</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">تاريخ الانضمام</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m: any) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{m.displayName || m.name || "—"}</p>
                      <p className="text-xs text-muted-foreground">{m.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs" dir="ltr">{m.email || "—"}</TableCell>
                  <TableCell>
                    <Select
                      value={m.role || "user"}
                      onValueChange={(v) => updateRole.mutate({ userId: m.id, role: v })}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مشرف</SelectItem>
                        <SelectItem value="user">مستخدم</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs">{m.createdAt ? new Date(m.createdAt).toLocaleDateString("ar-SA") : "—"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm(`هل أنت متأكد من حذف ${m.displayName || m.name}؟`)) {
                          deleteMember.mutate({ userId: m.id });
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">لا يوجد أعضاء</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
}

// ============================================
// Data Transfer Tab
// ============================================
function DataTransferTab() {
  const utils = trpc.useUtils();
  const { data: logs, isLoading: logsLoading } = trpc.superAdmin.getTransferLogs.useQuery();
  const [lastExportSection, setLastExportSection] = useState("all");
  const exportMutation = trpc.superAdmin.exportData.useMutation({
    onSuccess: (data) => {
      toast.success("تم التصدير بنجاح");
      utils.superAdmin.getTransferLogs.invalidate();
      // Download JSON
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rasid_export_${lastExportSection}_${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const importMutation = trpc.superAdmin.importData.useMutation({
    onSuccess: () => { utils.superAdmin.getTransferLogs.invalidate(); toast.success("تم الاستيراد بنجاح"); },
    onError: (e: any) => toast.error(e.message),
  });

  const [importSection, setImportSection] = useState("settings");

  const sections = [
    { value: "all", label: "الكل (دفعة واحدة)", icon: Database },
    { value: "settings", label: "الإعدادات", icon: Settings2 },
    { value: "pages", label: "الصفحات", icon: Layout },
    { value: "themes", label: "المظهر", icon: Palette },
    { value: "content", label: "المحتوى", icon: Layers },
    { value: "members", label: "الأعضاء", icon: Users },
  ];

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        importMutation.mutate({ section: importSection, data });
      } catch {
        toast.error("ملف JSON غير صالح");
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="glass-card gold-sweep border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Download className="h-5 w-5 text-green-400" /> تصدير البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sections.map((s) => (
              <Button
                key={s.value}
                variant="outline"
                className="h-auto py-3 flex-col gap-1.5 border-border/30 hover:border-primary/30"
                onClick={() => { setLastExportSection(s.value); exportMutation.mutate({ section: s.value as any }); }}
                disabled={exportMutation.isPending}
              >
                <s.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs">{s.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card className="glass-card gold-sweep border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-5 w-5 text-blue-400" /> استيراد البيانات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Select value={importSection} onValueChange={setImportSection}>
              <SelectTrigger className="w-48 h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {sections.filter(s => s.value !== "all").map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleImport} disabled={importMutation.isPending} size="sm">
              {importMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin me-1" /> : <Upload className="h-3.5 w-3.5 me-1" />}
              اختيار ملف واستيراد
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transfer Logs */}
      <Card className="glass-card gold-sweep border-border/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-5 w-5 text-amber-400" /> سجل عمليات النقل
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logsLoading ? (
            <div className="flex items-center justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">العملية</TableHead>
                    <TableHead className="text-right">القسم</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">السجلات</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الخطأ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(logs || []).map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant={log.transferType === "export" ? "default" : "secondary"} className="text-xs sm:text-[10px]">
                          {log.transferType === "export" ? <><Download className="h-3 w-3 me-1" />تصدير</> : <><Upload className="h-3 w-3 me-1" />استيراد</>}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{log.dataSection || log.section || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === "completed" ? "default" : log.status === "failed" ? "destructive" : "secondary"} className="text-xs sm:text-[10px]">
                          {log.status === "completed" ? "مكتمل" : log.status === "failed" ? "فشل" : "قيد المعالجة"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{log.recordCount?.toLocaleString("ar-SA") || "—"}</TableCell>
                      <TableCell className="text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleString("ar-SA") : "—"}</TableCell>
                      <TableCell className="text-xs text-destructive max-w-[150px] truncate">{log.errorMessage || "—"}</TableCell>
                    </TableRow>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد عمليات نقل بعد</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Live Preview Tab
// ============================================
function LivePreviewTab() {
  const { data: configData, isLoading } = trpc.superAdmin.getAllConfig.useQuery();
  const [previewMode, setPreviewMode] = useState<"sidebar" | "card" | "header" | "login">("sidebar");

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  // Build lookup maps
  const settings: Record<string, string> = {};
  const themes: Record<string, any> = {};
  (configData?.settings as any[] || []).forEach((s: any) => { settings[s.settingKey] = s.settingValue; });
  (configData?.themes as any[] || []).forEach((t: any) => { themes[t.themeKey] = t; });

  const get = (key: string, fallback = "") => settings[key] || fallback;
  const getTheme = (key: string, fallback = "") => themes[key]?.themeValue || fallback;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          معاينة حية
        </h3>
        <p className="text-xs text-muted-foreground">شاهد تأثير التغييرات قبل الحفظ</p>
        <div className="flex-1" />
        {(["sidebar", "card", "header", "login"] as const).map((mode) => (
          <Button
            key={mode}
            size="sm"
            variant={previewMode === mode ? "default" : "outline"}
            onClick={() => setPreviewMode(mode)}
            className="text-xs"
          >
            {mode === "sidebar" ? "الشريط الجانبي" : mode === "card" ? "الكروت" : mode === "header" ? "الهيدر" : "صفحة الدخول"}
          </Button>
        ))}
      </div>

      <Card className="overflow-hidden border-primary/20">
        <CardContent className="p-0">
          {/* Sidebar Preview */}
          {previewMode === "sidebar" && (
            <div className="flex h-[500px]">
              <div
                className="w-64 flex flex-col p-4 border-l border-border/30"
                style={{
                  background: getTheme("theme_gradient_sidebar", "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)"),
                  color: getTheme("theme_text_primary", "#f8fafc"),
                }}
              >
                {/* Logo */}
                <div className="flex items-center gap-3 mb-6">
                  {get("branding_logo") && (
                    <img src={get("branding_logo")} alt="" className="h-10 w-10 object-contain" />
                  )}
                  <div>
                    <div className="font-bold text-sm" style={{ color: getTheme("theme_primary", "#C5A55A") }}>
                      {get("branding_platform_name_ar", "منصة راصد")}
                    </div>
                    <div className="text-xs sm:text-[10px] opacity-60">{get("branding_platform_name_en", "Rasid Platform")}</div>
                  </div>
                </div>
                {/* Nav items */}
                {["الرئيسية", "المواقع", "الفحوصات", "الخطابات", "القضايا", "التقارير"].map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-sm transition-colors ${
                      i === 0 ? "font-semibold" : "opacity-70 hover:opacity-100"
                    }`}
                    style={i === 0 ? {
                      background: `${getTheme("theme_primary", "#C5A55A")}20`,
                      color: getTheme("theme_primary", "#C5A55A"),
                    } : {}}
                  >
                    <div className="w-4 h-4 rounded bg-current opacity-30" />
                    {item}
                  </div>
                ))}
                <div className="flex-1" />
                {/* Footer */}
                <div className="text-xs sm:text-[10px] opacity-40 text-center">
                  {get("branding_copyright", "© 2026 جميع الحقوق محفوظة")}
                </div>
              </div>
              {/* Main area */}
              <div className="flex-1 p-6" style={{ background: getTheme("theme_bg_main", "#0f172a") }}>
                <div className="text-lg font-bold mb-4" style={{ color: getTheme("theme_text_primary", "#f8fafc") }}>الرئيسية</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["المواقع", "الفحوصات", "الخطابات"].map((label, i) => (
                    <div key={i} className="rounded-xl p-4 border" style={{
                      background: getTheme("theme_bg_card", "#1e293b"),
                      borderColor: getTheme("theme_border_color", "#1e293b"),
                    }}>
                      <div className="text-xs opacity-60" style={{ color: getTheme("theme_text_secondary", "#94a3b8") }}>{label}</div>
                      <div className="text-2xl font-bold mt-1" style={{ color: getTheme("theme_primary", "#C5A55A") }}>{(i + 1) * 12}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Card Preview */}
          {previewMode === "card" && (
            <div className="p-6 min-h-[400px]" style={{ background: getTheme("theme_bg_main", "#0f172a") }}>
              <div className="grid grid-cols-2 gap-4">
                {["primary", "secondary", "accent", "destructive"].map((variant) => {
                  const colorKey = variant === "primary" ? "theme_primary" : variant === "secondary" ? "theme_secondary" : variant === "accent" ? "theme_accent" : "theme_destructive_color";
                  const color = getTheme(colorKey, "#C5A55A");
                  return (
                    <div key={variant} className="rounded-xl p-5 border" style={{
                      background: getTheme("theme_bg_card", "#1e293b"),
                      borderColor: getTheme("theme_border_color", "#1e293b"),
                    }}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg" style={{ background: `${color}20` }}>
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-5 h-5 rounded" style={{ background: color }} />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold" style={{ color: getTheme("theme_text_primary", "#f8fafc") }}>{variant}</div>
                          <div className="text-xs" style={{ color: getTheme("theme_text_secondary", "#94a3b8") }}>{color}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ background: color }}>زر أساسي</div>
                        <div className="px-3 py-1.5 rounded-lg text-xs font-medium border" style={{ borderColor: color, color }}>زر ثانوي</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Header Preview */}
          {previewMode === "header" && (
            <div style={{ background: getTheme("theme_bg_main", "#0f172a") }}>
              <div className="flex items-center justify-between flex-wrap px-6 py-3 border-b" style={{
                borderColor: getTheme("theme_border_color", "#1e293b"),
                background: getTheme("theme_bg_card", "#1e293b"),
              }}>
                <div className="flex items-center gap-4">
                  <div className="text-sm font-bold" style={{ color: getTheme("theme_text_primary", "#f8fafc") }}>
                    {get("header_welcome_text", "مرحباً بك في منصة راصد")}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {get("header_show_search", "true") === "true" && (
                    <div className="w-48 h-8 rounded-lg border px-3 flex items-center" style={{
                      borderColor: getTheme("theme_border_input", "#334155"),
                      background: `${getTheme("theme_bg_main", "#0f172a")}80`,
                    }}>
                      <Search className="h-3 w-3 opacity-40" style={{ color: getTheme("theme_text_secondary", "#94a3b8") }} />
                      <span className="text-xs ms-2 opacity-40" style={{ color: getTheme("theme_text_secondary", "#94a3b8") }}>بحث...</span>
                    </div>
                  )}
                  {get("header_show_notifications", "true") === "true" && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${getTheme("theme_primary", "#C5A55A")}15` }}>
                      <Bell className="h-4 w-4" style={{ color: getTheme("theme_primary", "#C5A55A") }} />
                    </div>
                  )}
                  {get("header_show_theme_toggle", "true") === "true" && (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${getTheme("theme_primary", "#C5A55A")}15` }}>
                      <Monitor className="h-4 w-4" style={{ color: getTheme("theme_primary", "#C5A55A") }} />
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full" style={{ background: getTheme("theme_primary", "#C5A55A") }} />
                    <span className="text-xs" style={{ color: getTheme("theme_text_primary", "#f8fafc") }}>المشرف</span>
                  </div>
                </div>
              </div>
              <div className="p-6 min-h-[350px]">
                <div className="text-sm opacity-40" style={{ color: getTheme("theme_text_secondary", "#94a3b8") }}>محتوى الصفحة</div>
              </div>
            </div>
          )}

          {/* Login Preview */}
          {previewMode === "login" && (
            <div className="flex h-[500px]">
              <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-8" style={{ background: getTheme("theme_bg_card", "#1e293b") }}>
                {get("login_page_logo") && (
                  <img src={get("login_page_logo")} alt="" className="h-16 mb-4 object-contain" />
                )}
                <div className="text-xl font-bold mb-2" style={{ color: getTheme("theme_text_primary", "#f8fafc") }}>
                  {get("login_page_title", "تسجيل الدخول")}
                </div>
                <div className="text-sm mb-6 opacity-60" style={{ color: getTheme("theme_text_secondary", "#94a3b8") }}>
                  {get("login_page_welcome_text", "أدخل بيانات الاعتماد للوصول إلى لوحة التحكم")}
                </div>
                <div className="w-full max-w-xs space-y-3">
                  <div className="h-10 rounded-lg border" style={{ borderColor: getTheme("theme_border_input", "#334155"), background: `${getTheme("theme_bg_main", "#0f172a")}60` }} />
                  <div className="h-10 rounded-lg border" style={{ borderColor: getTheme("theme_border_input", "#334155"), background: `${getTheme("theme_bg_main", "#0f172a")}60` }} />
                  <div className="h-10 rounded-lg text-white text-sm font-medium flex items-center justify-center" style={{ background: getTheme("theme_primary", "#C5A55A") }}>
                    {get("login_page_button_text", "تسجيل الدخول")}
                  </div>
                </div>
              </div>
              <div className="w-1/2 flex items-center justify-center" style={{ background: getTheme("theme_bg_main", "#0f172a") }}>
                {get("login_page_character") ? (
                  <img src={get("login_page_character")} alt="" className="max-h-80 object-contain" />
                ) : get("branding_character") ? (
                  <img src={get("branding_character")} alt="" className="max-h-80 object-contain" />
                ) : (
                  <div className="text-center">
                    {get("branding_logo") && <img src={get("branding_logo")} alt="" className="h-24 mx-auto mb-4 object-contain" />}
                    <div className="text-lg font-bold" style={{ color: getTheme("theme_primary", "#C5A55A") }}>
                      {get("branding_platform_name_ar", "منصة راصد")}
                    </div>
                    <div className="text-xs opacity-60 mt-1" style={{ color: getTheme("theme_text_secondary", "#94a3b8") }}>
                      {get("branding_description_ar", "")}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// Audit Log Tab
// ============================================
function AuditLogTab() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(0);
  const pageSize = 30;
  const { data, isLoading } = trpc.superAdmin.getAuditLogs.useQuery({ limit: pageSize, offset: page * pageSize });
  const rollbackMutation = trpc.superAdmin.rollbackSetting.useMutation({
    onSuccess: () => {
      utils.superAdmin.getAuditLogs.invalidate();
      utils.superAdmin.getAllConfig.invalidate();
      utils.superAdmin.getSettings.invalidate();
      utils.superAdmin.getTheme.invalidate();
      toast.success("تم التراجع عن التغيير بنجاح");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const changeTypeLabels: Record<string, { label: string; color: string }> = {
    create: { label: "إنشاء", color: "text-green-400 bg-green-400/10" },
    update: { label: "تعديل", color: "text-blue-400 bg-blue-400/10" },
    delete: { label: "حذف", color: "text-red-400 bg-red-400/10" },
    rollback: { label: "تراجع", color: "text-amber-400 bg-amber-400/10" },
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const logs = (data?.logs || []) as any[];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          سجل التغييرات
        </h3>
        <Badge variant="secondary" className="text-xs">{total} تغيير</Badge>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => utils.superAdmin.getAuditLogs.invalidate()}>
          <RefreshCw className="h-3.5 w-3.5 me-1" /> تحديث
        </Button>
      </div>

      {logs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <History className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد تغييرات مسجلة بعد</p>
            <p className="text-xs text-muted-foreground/60 mt-1">ستظهر التغييرات هنا عند تعديل أي إعداد</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right w-[100px]">النوع</TableHead>
                    <TableHead className="text-right">الجدول</TableHead>
                    <TableHead className="text-right">المفتاح</TableHead>
                    <TableHead className="text-right">القيمة السابقة</TableHead>
                    <TableHead className="text-right">القيمة الجديدة</TableHead>
                    <TableHead className="text-right">المستخدم</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right w-[80px]">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => {
                    const ct = changeTypeLabels[log.change_type] || { label: log.change_type, color: "text-gray-400 bg-gray-400/10" };
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs sm:text-[10px] ${ct.color}`}>{ct.label}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{log.table_name}</TableCell>
                        <TableCell className="text-xs font-mono max-w-[150px] truncate" title={log.record_key}>{log.record_key}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate text-red-400/70" title={log.old_value || "-"}>{log.old_value || "-"}</TableCell>
                        <TableCell className="text-xs max-w-[120px] truncate text-green-400/70" title={log.new_value || "-"}>{log.new_value || "-"}</TableCell>
                        <TableCell className="text-xs">{log.user_name || "-"}</TableCell>
                        <TableCell className="text-xs">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 opacity-40" />
                            {log.created_at ? new Date(log.created_at).toLocaleString("ar-SA") : "-"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.change_type !== "rollback" && log.old_value && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-amber-400 hover:text-amber-300"
                              onClick={() => rollbackMutation.mutate({ auditLogId: log.id })}
                              disabled={rollbackMutation.isPending}
                            >
                              <Undo2 className="h-3 w-3 me-1" />
                              تراجع
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>السابق</Button>
          <span className="text-xs text-muted-foreground">صفحة {page + 1} من {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>التالي</Button>
        </div>
      )}
    </div>
  );
}

// ============================================
// Main Super Admin Panel
// ============================================
export default function SuperAdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <PremiumPageContainer>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30">
                <Crown className="h-6 w-6 text-yellow-400" />
              </div>
              لوحة التحكم الشاملة
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">تحكم كامل في جميع جوانب منصة راصد — 29 فئة إعدادات</p>
          </div>
          <Badge variant="outline" className="text-xs py-1 px-3 border-yellow-500/30 text-yellow-400">
            <Shield className="h-3 w-3 me-1" />
            Super Admin
          </Badge>
        </div>

        <Separator className="opacity-20" />

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
          <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-card/50 p-1.5 rounded-xl">
            {TAB_GROUPS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-1.5 text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <SystemOverviewTab />
          </TabsContent>

          <TabsContent value="branding_identity" className="mt-4">
            <CategorySettingsPanel categories={TAB_CATEGORIES.branding_identity} />
          </TabsContent>

          <TabsContent value="ui_design" className="mt-4">
            <div className="space-y-6">
              <ThemeSettingsPanel />
              <Separator className="opacity-20" />
              <h3 className="text-sm font-semibold text-muted-foreground">إعدادات التصميم الإضافية</h3>
              <CategorySettingsPanel categories={["typography", "layout", "sidebar", "header"]} />
            </div>
          </TabsContent>

          <TabsContent value="pages_content" className="mt-4">
            <CategorySettingsPanel categories={TAB_CATEGORIES.pages_content} />
          </TabsContent>

          <TabsContent value="components" className="mt-4">
            <CategorySettingsPanel categories={TAB_CATEGORIES.components} />
          </TabsContent>

          <TabsContent value="features" className="mt-4">
            <CategorySettingsPanel categories={TAB_CATEGORIES.features} />
          </TabsContent>

          <TabsContent value="system" className="mt-4">
            <CategorySettingsPanel categories={TAB_CATEGORIES.system} />
          </TabsContent>

          <TabsContent value="members_tab" className="mt-4">
            <MembersManagementTab />
          </TabsContent>

          <TabsContent value="data_tab" className="mt-4">
            <DataTransferTab />
          </TabsContent>

          <TabsContent value="preview_tab" className="mt-4">
            <LivePreviewTab />
          </TabsContent>

          <TabsContent value="audit_tab" className="mt-4">
            <AuditLogTab />
          </TabsContent>
        </Tabs>
      </div>
    </PremiumPageContainer>
  );
}
