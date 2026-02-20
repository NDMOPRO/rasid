/**
 * Admin Control Panel — لوحة التحكم الرئيسية
 * 7 Tabs: المستخدمين | المجموعات | الصفحات | إدارة القائمة | إعدادات التصميم | سجل التدقيق | مركز التدريب
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users, Layers, FileText, ScrollText, GraduationCap, Loader2,
  Shield, Plus, Trash2, Edit, Search, Check, X, ChevronDown,
  ToggleLeft, ToggleRight, BookOpen, Brain, BarChart3, Settings,
  RefreshCw, Eye, EyeOff, Lock, Unlock, Palette, Menu, GripVertical,
  ArrowUp, ArrowDown, Sun, Moon, Image, Type, Hash, Save,
} from "lucide-react";
import { usePlatformSettings } from "@/contexts/PlatformSettingsContext";

type TabId = "users" | "groups" | "pages" | "sidebar" | "design" | "audit" | "training";

const tabs: { id: TabId; label: string; labelEn: string; icon: any }[] = [
  { id: "users", label: "المستخدمين", labelEn: "Users", icon: Users },
  { id: "groups", label: "المجموعات", labelEn: "Groups", icon: Layers },
  { id: "pages", label: "الصفحات", labelEn: "Pages", icon: FileText },
  { id: "sidebar", label: "إدارة القائمة", labelEn: "Sidebar", icon: Menu },
  { id: "design", label: "إعدادات التصميم", labelEn: "Design", icon: Palette },
  { id: "audit", label: "سجل التدقيق", labelEn: "Audit Log", icon: ScrollText },
  { id: "training", label: "مركز التدريب", labelEn: "Training", icon: GraduationCap },
];

// ═══ Tab 1: Users Management ═══
function UsersTab() {
  const { data: users, isLoading } = trpc.admin.users.useQuery();
  const [search, setSearch] = useState("");

  const filteredUsers = (users || []).filter((u: any) =>
    !search || u.displayName?.includes(search) || u.username?.includes(search) || u.email?.includes(search)
  );

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="overflow-x-hidden max-w-full space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث بالاسم أو المعرف..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 bg-gray-800/50 border-gray-700" />
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/80">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-gray-300">#</th>
              <th className="px-4 py-3 text-right font-medium text-gray-300">الاسم</th>
              <th className="px-4 py-3 text-right font-medium text-gray-300">المعرف</th>
              <th className="px-4 py-3 text-right font-medium text-gray-300">البريد</th>
              <th className="px-4 py-3 text-right font-medium text-gray-300">الدور</th>
              <th className="px-4 py-3 text-right font-medium text-gray-300">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filteredUsers.map((user: any, i: number) => (
              <tr key={user.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                <td className="px-4 py-3 text-white font-medium">{user.displayName || user.username}</td>
                <td className="px-4 py-3 text-gray-300 font-mono text-xs">{user.username}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{user.email || "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={
                    user.platformRole === "root_admin" ? "border-red-500/50 text-red-400" :
                    user.platformRole === "admin" ? "border-purple-500/50 text-purple-400" :
                    "border-blue-500/50 text-blue-400"
                  }>
                    {user.platformRole === "root_admin" ? "المسؤول الأعلى" : user.platformRole === "admin" ? "مدير" : "مستخدم"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">نشط</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredUsers.length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد مستخدمين</div>}
    </div>
  );
}

// ═══ Tab 2: Groups Management ═══
function GroupsTab() {
  const { data: groups, isLoading } = trpc.admin.groups.list.useQuery();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap">
        <h3 className="text-lg font-semibold text-white">المجموعات والصلاحيات</h3>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 ml-2" /> إنشاء مجموعة</Button>
      </div>
      <div className="space-y-3">
        {(groups || []).map((group: any) => (
          <Card key={group.id} className="bg-gray-800/50 border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between flex-wrap p-4 cursor-pointer hover:bg-gray-700/30 transition-colors" onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${group.isSystem ? "bg-red-500" : "bg-green-500"}`} />
                <span className="text-white font-medium">{group.groupName}</span>
                <span className="text-gray-400 text-sm">({group.groupNameEn})</span>
                <Badge variant="outline" className={group.isSystem ? "border-amber-500/50 text-amber-400 text-xs" : "border-green-500/50 text-green-400 text-xs"}>
                  {group.isSystem ? "نظام" : "مخصص"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-gray-600 text-gray-400">{group.memberCount || 0} عضو</Badge>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${expandedGroup === group.id ? "rotate-180" : ""}`} />
              </div>
            </div>
            <AnimatePresence>
              {expandedGroup === group.id && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-gray-700">
                  <div className="p-4 space-y-3">
                    <div className="text-sm text-gray-400">{group.groupDescription || "بدون وصف"}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"><Edit className="h-3 w-3 ml-1" /> تعديل الصلاحيات</Button>
                      <Button size="sm" variant="outline" className="border-gray-600 text-gray-400 hover:bg-gray-700"><Users className="h-3 w-3 ml-1" /> إدارة الأعضاء</Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
      {(groups || []).length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد مجموعات</div>}
    </div>
  );
}

// ═══ Tab 3: Pages Management ═══
function PagesTab() {
  const { data: pages, isLoading } = trpc.controlPanel.pages.list.useQuery();
  const utils = trpc.useUtils();
  const toggleMutation = trpc.controlPanel.pages.toggleActive.useMutation({
    onSuccess: () => { utils.controlPanel.pages.list.invalidate(); toast.success("تم تحديث حالة الصفحة"); },
    onError: () => toast.error("فشل تحديث الصفحة"),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">إدارة الصفحات والميزات</h3>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/80">
            <tr>
              <th className="px-4 py-3 text-right font-medium text-gray-300">الصفحة</th>
              <th className="px-4 py-3 text-right font-medium text-gray-300">المسار</th>
              <th className="px-4 py-3 text-right font-medium text-gray-300">التصنيف</th>
              <th className="px-4 py-3 text-center font-medium text-gray-300">نشطة</th>
              <th className="px-4 py-3 text-right font-medium text-gray-300">الترتيب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {(pages || []).map((page: any) => (
              <tr key={page.id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3"><span className="text-white font-medium">{page.nameAr}</span> <span className="text-gray-500 text-xs">({page.nameEn})</span></td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{page.path}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={page.category === "admin" ? "border-red-500/50 text-red-400" : page.category === "monitoring" ? "border-blue-500/50 text-blue-400" : "border-gray-600 text-gray-400"}>
                    {page.category === "admin" ? "إدارة" : page.category === "monitoring" ? "مراقبة" : page.category === "analysis" ? "تحليل" : page.category || "—"}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-center">
                  <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate({ id: page.id, isActive: !page.isActive })} className={page.isActive ? "text-emerald-400" : "text-gray-500"}>
                    {page.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </Button>
                </td>
                <td className="px-4 py-3 text-gray-400">{page.sortOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(pages || []).length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد صفحات مسجلة</div>}
    </div>
  );
}

// ═══ Tab 4: Sidebar Management ═══
function SidebarTab() {
  const workspace = (localStorage.getItem("rasid_workspace") || "leaks") as "leaks" | "privacy";
  const [activePlatform, setActivePlatform] = useState<"leaks" | "privacy">(workspace);
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupNameEn, setNewGroupNameEn] = useState("");
  const [newGroupColor, setNewGroupColor] = useState("#3DB1AC");
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newPageLabel, setNewPageLabel] = useState("");
  const [newPagePath, setNewPagePath] = useState("");
  const [addingPageToGroup, setAddingPageToGroup] = useState<string | null>(null);

  // Sidebar config stored in localStorage for instant effect
  const storageKey = `rasid_sidebar_config_${activePlatform}`;
  const [sidebarConfig, setSidebarConfig] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const defaultLeaksGroups = [
    { id: "lk_main", label: "الرئيسية", labelEn: "Main", color: "#3DB1AC", items: ["راصد الذكي", "لوحة القيادة الرئيسية", "حالات الرصد", "التقارير", "التوصيات"] },
    { id: "lk_dashboards", label: "لوحات المؤشرات", labelEn: "Dashboards", color: "#6459A7", items: ["خريطة التهديدات", "تحليل القطاعات", "تحليل الأثر", "التحليل الجغرافي", "استخبارات المصادر", "تحليل جهات النشر", "أطلس البيانات الشخصية", "رسم المعرفة", "الخط الزمني للحالات", "امتثال PDPL", "مقاييس الدقة", "الملخص التنفيذي", "مقارنة الحالات", "متتبع الحملات"] },
    { id: "lk_operations", label: "المؤشرات التشغيلية", labelEn: "Operations", color: "#f59e0b", items: ["الرصد المباشر", "رصد تليجرام", "رصد الدارك ويب", "مواقع اللصق", "مهام الرصد", "مختبر أنماط البيانات", "سلسلة الأدلة", "قواعد الرصد", "أدوات OSINT", "ملفات المصادر", "قنوات التنبيه", "سجل الحالات", "استيراد البيانات", "تصدير البيانات"] },
  ];

  const defaultPrivacyGroups = [
    { id: "prv_main", label: "الرئيسية", labelEn: "Main", color: "#22c55e", items: ["راصد الذكي", "لوحة القيادة", "التقارير", "التغييرات"] },
    { id: "prv_dashboards", label: "لوحات المؤشرات", labelEn: "Dashboards", color: "#6459A7", items: ["خريطة الامتثال", "لوحة مؤشرات الأداء", "اللوحة الحية", "التحليلات المتقدمة", "مقارنة الامتثال", "المقارنة الزمنية", "مقارنة القطاعات", "تغطية الاستراتيجية", "التقرير التنفيذي", "التقارير المخصصة", "تقارير PDF", "التقارير المجدولة", "التنبيهات الذكية", "منشئ العروض"] },
    { id: "prv_operations", label: "المؤشرات التشغيلية", labelEn: "Operations", color: "#f59e0b", items: ["إدارة المواقع", "الفحص المباشر", "الفحص الجماعي", "الفحص العميق", "مكتبة الفحوصات", "جدولة الفحوصات", "سجل الفحوصات", "البنود الثمانية", "الخطابات", "متتبع التحسين", "البحث المتقدم", "استيراد المواقع", "تصدير البيانات"] },
  ];

  const currentGroups = sidebarConfig.length > 0 ? sidebarConfig : (activePlatform === "leaks" ? defaultLeaksGroups : defaultPrivacyGroups);

  const saveConfig = (groups: any[]) => {
    setSidebarConfig(groups);
    localStorage.setItem(storageKey, JSON.stringify(groups));
    toast.success("تم حفظ إعدادات القائمة الجانبية");
  };

  const moveGroup = (index: number, direction: "up" | "down") => {
    const newGroups = [...currentGroups];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGroups.length) return;
    [newGroups[index], newGroups[targetIndex]] = [newGroups[targetIndex], newGroups[index]];
    saveConfig(newGroups);
  };

  const updateGroupLabel = (index: number, label: string) => {
    const newGroups = [...currentGroups];
    newGroups[index] = { ...newGroups[index], label };
    saveConfig(newGroups);
    setEditingGroup(null);
  };

  const updateGroupColor = (index: number, color: string) => {
    const newGroups = [...currentGroups];
    newGroups[index] = { ...newGroups[index], color };
    saveConfig(newGroups);
  };

  const deleteGroup = (index: number) => {
    const newGroups = currentGroups.filter((_: any, i: number) => i !== index);
    saveConfig(newGroups);
  };

  const addGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroups = [...currentGroups, {
      id: `custom_${Date.now()}`,
      label: newGroupName.trim(),
      labelEn: newGroupNameEn.trim() || newGroupName.trim(),
      color: newGroupColor,
      items: [],
    }];
    saveConfig(newGroups);
    setNewGroupName("");
    setNewGroupNameEn("");
    setShowAddGroup(false);
  };

  const addPageToGroup = (groupIndex: number) => {
    if (!newPageLabel.trim()) return;
    const newGroups = [...currentGroups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      items: [...newGroups[groupIndex].items, newPageLabel.trim()],
    };
    saveConfig(newGroups);
    setNewPageLabel("");
    setNewPagePath("");
    setAddingPageToGroup(null);
  };

  const removePageFromGroup = (groupIndex: number, pageIndex: number) => {
    const newGroups = [...currentGroups];
    newGroups[groupIndex] = {
      ...newGroups[groupIndex],
      items: newGroups[groupIndex].items.filter((_: any, i: number) => i !== pageIndex),
    };
    saveConfig(newGroups);
  };

  const movePageInGroup = (groupIndex: number, pageIndex: number, direction: "up" | "down") => {
    const newGroups = [...currentGroups];
    const items = [...newGroups[groupIndex].items];
    const targetIndex = direction === "up" ? pageIndex - 1 : pageIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    [items[pageIndex], items[targetIndex]] = [items[targetIndex], items[pageIndex]];
    newGroups[groupIndex] = { ...newGroups[groupIndex], items };
    saveConfig(newGroups);
  };

  const resetToDefaults = () => {
    localStorage.removeItem(storageKey);
    setSidebarConfig([]);
    toast.success("تم إعادة القائمة للإعدادات الافتراضية");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">إدارة القائمة الجانبية</h3>
          <p className="text-gray-400 text-xs mt-1">إضافة وحذف وترتيب المجموعات والصفحات وتخصيص الألوان</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Platform Switcher */}
          <div className="flex gap-1 p-0.5 bg-gray-800/50 rounded-lg border border-gray-700">
            <button onClick={() => setActivePlatform("leaks")} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activePlatform === "leaks" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"}`}>
              رصد التسريبات
            </button>
            <button onClick={() => setActivePlatform("privacy")} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activePlatform === "privacy" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}>
              رصد الخصوصية
            </button>
          </div>
          <Button size="sm" variant="outline" className="border-gray-600 text-gray-400 hover:text-white" onClick={resetToDefaults}>
            <RefreshCw className="h-3 w-3 ml-1" /> افتراضي
          </Button>
        </div>
      </div>

      {/* Groups List */}
      <div className="space-y-3">
        {currentGroups.map((group: any, groupIndex: number) => (
          <Card key={group.id || groupIndex} className="bg-gray-800/50 border-gray-700 overflow-hidden">
            <div className="flex items-center justify-between flex-wrap p-4">
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-gray-500 cursor-grab" />
                <div className="w-4 h-4 rounded" style={{ backgroundColor: group.color || "#3DB1AC" }} />
                {editingGroup === group.id ? (
                  <Input
                    value={group.label}
                    onChange={(e) => {
                      const newGroups = [...currentGroups];
                      newGroups[groupIndex] = { ...newGroups[groupIndex], label: e.target.value };
                      setSidebarConfig(newGroups);
                    }}
                    onBlur={() => updateGroupLabel(groupIndex, currentGroups[groupIndex].label)}
                    onKeyDown={(e) => e.key === "Enter" && updateGroupLabel(groupIndex, currentGroups[groupIndex].label)}
                    className="h-7 w-40 bg-gray-700 border-gray-600 text-sm"
                    autoFocus
                  />
                ) : (
                  <span className="text-white font-medium">{group.label}</span>
                )}
                <span className="text-gray-500 text-xs">({group.labelEn})</span>
                <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">{group.items?.length || 0} صفحة</Badge>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="color"
                  value={group.color || "#3DB1AC"}
                  onChange={(e) => updateGroupColor(groupIndex, e.target.value)}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                  title="لون المجموعة"
                />
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-white" onClick={() => setEditingGroup(group.id)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-white" onClick={() => moveGroup(groupIndex, "up")} disabled={groupIndex === 0}>
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-gray-400 hover:text-white" onClick={() => moveGroup(groupIndex, "down")} disabled={groupIndex === currentGroups.length - 1}>
                  <ArrowDown className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-red-400 hover:text-red-300" onClick={() => deleteGroup(groupIndex)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Pages within group */}
            <div className="border-t border-gray-700/50 p-3 space-y-1">
              {(group.items || []).map((page: any, pageIndex: number) => (
                <div key={pageIndex} className="flex items-center justify-between px-3 py-1.5 rounded hover:bg-gray-700/30 transition-colors group">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3 w-3 text-gray-500" />
                    <span className="text-gray-300 text-sm">{typeof page === 'string' ? page : page.label}</span>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-gray-500 hover:text-white" onClick={() => movePageInGroup(groupIndex, pageIndex, "up")} disabled={pageIndex === 0}>
                      <ArrowUp className="h-2.5 w-2.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-gray-500 hover:text-white" onClick={() => movePageInGroup(groupIndex, pageIndex, "down")} disabled={pageIndex === group.items.length - 1}>
                      <ArrowDown className="h-2.5 w-2.5" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-400/60 hover:text-red-400" onClick={() => removePageFromGroup(groupIndex, pageIndex)}>
                      <X className="h-2.5 w-2.5" />
                    </Button>
                  </div>
                </div>
              ))}

              {addingPageToGroup === group.id ? (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <Input
                    placeholder="اسم الصفحة..."
                    value={newPageLabel}
                    onChange={(e) => setNewPageLabel(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addPageToGroup(groupIndex)}
                    className="h-7 bg-gray-700 border-gray-600 text-xs flex-1"
                    autoFocus
                  />
                  <Button size="sm" className="h-7 bg-blue-600 hover:bg-blue-700 px-2" onClick={() => addPageToGroup(groupIndex)}>
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-gray-400" onClick={() => setAddingPageToGroup(null)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingPageToGroup(group.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-500 hover:text-cyan-400 transition-colors"
                >
                  <Plus className="h-3 w-3" /> إضافة صفحة
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Group */}
      {showAddGroup ? (
        <Card className="bg-gray-800/50 border-gray-700 border-dashed">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input placeholder="اسم المجموعة (عربي)..." value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="bg-gray-700 border-gray-600" />
              <Input placeholder="اسم المجموعة (English)..." value={newGroupNameEn} onChange={(e) => setNewGroupNameEn(e.target.value)} className="bg-gray-700 border-gray-600" />
              <div className="flex items-center gap-2">
                <input type="color" value={newGroupColor} onChange={(e) => setNewGroupColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1" onClick={addGroup}><Plus className="h-3 w-3 ml-1" /> إضافة</Button>
                <Button size="sm" variant="ghost" className="text-gray-400" onClick={() => setShowAddGroup(false)}><X className="h-3 w-3" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" className="w-full border-dashed border-gray-600 text-gray-400 hover:text-white hover:border-cyan-500/50" onClick={() => setShowAddGroup(true)}>
          <Plus className="h-4 w-4 ml-2" /> إضافة مجموعة جديدة
        </Button>
      )}
    </div>
  );
}

// ═══ Tab 5: Design Settings ═══
function DesignTab() {
  const workspace = (localStorage.getItem("rasid_workspace") || "leaks") as "leaks" | "privacy";
  const [activePlatform, setActivePlatform] = useState<"leaks" | "privacy">(workspace);
  const { refresh } = usePlatformSettings();
  const upsertMutation = trpc.superAdmin.upsertSetting.useMutation({
    onSuccess: () => { refresh(); toast.success("تم حفظ الإعداد"); },
    onError: () => toast.error("فشل حفظ الإعداد"),
  });
  const upsertThemeMutation = trpc.superAdmin.upsertTheme.useMutation({
    onSuccess: () => { refresh(); toast.success("تم حفظ اللون"); },
    onError: () => toast.error("فشل حفظ اللون"),
  });

  const prefix = activePlatform === "leaks" ? "leaks" : "privacy";

  // Settings state with localStorage fallbacks
  const [settings, setSettings] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(`rasid_design_${prefix}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const updateSetting = (key: string, value: string) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem(`rasid_design_${prefix}`, JSON.stringify(newSettings));
  };

  const saveSetting = (key: string, value: string) => {
    upsertMutation.mutate({ settingKey: `${prefix}_${key}`, settingValue: value, settingType: "string", category: "design", label: key });
  };

  const saveTheme = (themeKey: string, value: string) => {
    upsertThemeMutation.mutate({ themeKey, themeValue: value, category: activePlatform });
  };

  const designSections = [
    {
      title: "عناوين المنصة",
      icon: Type,
      items: [
        { key: "platform_title_ar", label: "عنوان المنصة (عربي)", type: "text", placeholder: activePlatform === "leaks" ? "منصة رصد تسريب البيانات" : "منصة رصد سياسة الخصوصية" },
        { key: "platform_title_en", label: "عنوان المنصة (English)", type: "text", placeholder: activePlatform === "leaks" ? "Data Breach Monitoring" : "Privacy Policy Monitoring" },
        { key: "platform_subtitle", label: "الوصف الفرعي", type: "text", placeholder: "مكتب إدارة البيانات الوطنية - NDMO" },
      ],
    },
    {
      title: "الألوان الأساسية",
      icon: Palette,
      items: [
        { key: "primary_color", label: "اللون الرئيسي", type: "color", placeholder: activePlatform === "leaks" ? "#3DB1AC" : "#22c55e" },
        { key: "secondary_color", label: "اللون الثانوي", type: "color", placeholder: "#6459A7" },
        { key: "accent_color", label: "لون التمييز", type: "color", placeholder: "#273470" },
        { key: "header_bg", label: "لون خلفية الرأس", type: "color", placeholder: "#0d1529" },
        { key: "sidebar_bg", label: "لون خلفية القائمة", type: "color", placeholder: "#0d1529" },
      ],
    },
    {
      title: "الوضع الفاتح والداكن",
      icon: Sun,
      items: [
        { key: "dark_bg", label: "خلفية الوضع الداكن", type: "color", placeholder: "#0d1529" },
        { key: "dark_card_bg", label: "خلفية البطاقات (داكن)", type: "color", placeholder: "#1a2744" },
        { key: "light_bg", label: "خلفية الوضع الفاتح", type: "color", placeholder: "#f8fafc" },
        { key: "light_card_bg", label: "خلفية البطاقات (فاتح)", type: "color", placeholder: "#ffffff" },
      ],
    },
    {
      title: "الشعار والعلامة",
      icon: Image,
      items: [
        { key: "logo_dark_url", label: "رابط الشعار (وضع داكن)", type: "text", placeholder: "/branding/logos/Rased_1_transparent.png" },
        { key: "logo_light_url", label: "رابط الشعار (وضع فاتح)", type: "text", placeholder: "/branding/logos/Rased_1_transparent_1.png" },
        { key: "favicon_url", label: "رابط الأيقونة (Favicon)", type: "text", placeholder: "/favicon.ico" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">إعدادات التصميم</h3>
          <p className="text-gray-400 text-xs mt-1">تخصيص العناوين والألوان والشعارات لكل منصة على حدة</p>
        </div>
        <div className="flex gap-1 p-0.5 bg-gray-800/50 rounded-lg border border-gray-700">
          <button onClick={() => setActivePlatform("leaks")} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activePlatform === "leaks" ? "bg-cyan-600 text-white" : "text-gray-400 hover:text-white"}`}>
            رصد التسريبات
          </button>
          <button onClick={() => setActivePlatform("privacy")} className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${activePlatform === "privacy" ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}>
            رصد الخصوصية
          </button>
        </div>
      </div>

      {designSections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <Card key={section.title} className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <SectionIcon className="h-4 w-4 text-cyan-400" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center gap-3 flex-wrap">
                  <label className="text-gray-300 text-xs w-40 flex-shrink-0">{item.label}</label>
                  <div className="flex items-center gap-2 flex-1">
                    {item.type === "color" ? (
                      <>
                        <input
                          type="color"
                          value={settings[item.key] || item.placeholder}
                          onChange={(e) => updateSetting(item.key, e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-600"
                        />
                        <Input
                          value={settings[item.key] || ""}
                          onChange={(e) => updateSetting(item.key, e.target.value)}
                          placeholder={item.placeholder}
                          className="h-8 bg-gray-700 border-gray-600 text-xs font-mono flex-1"
                        />
                      </>
                    ) : (
                      <Input
                        value={settings[item.key] || ""}
                        onChange={(e) => updateSetting(item.key, e.target.value)}
                        placeholder={item.placeholder}
                        className="h-8 bg-gray-700 border-gray-600 text-xs flex-1"
                      />
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 px-2 text-gray-400 hover:text-cyan-400"
                      onClick={() => {
                        const val = settings[item.key] || item.placeholder;
                        if (item.type === "color") {
                          saveTheme(`${prefix}_${item.key}`, val);
                        } else {
                          saveSetting(item.key, val);
                        }
                      }}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ═══ Tab 6: Audit Log ═══
function AuditTab() {
  const { data: logs, isLoading } = trpc.audit.list.useQuery({ limit: 50 });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap">
        <h3 className="text-lg font-semibold text-white">سجل التدقيق</h3>
        <Badge variant="outline" className="border-gray-600 text-gray-400">آخر {(logs || []).length} إجراء</Badge>
      </div>
      <div className="space-y-2">
        {(logs || []).map((log: any, i: number) => (
          <div key={log.id || i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <ScrollText className="h-4 w-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-white font-medium text-sm">{log.userName || log.action}</span>
              <span className="text-gray-500 text-xs mr-2">{log.action}</span>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{log.details || log.description || "—"}</p>
            </div>
            <span className="text-gray-500 text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleDateString("ar-SA") : "—"}</span>
          </div>
        ))}
      </div>
      {(logs || []).length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد سجلات</div>}
    </div>
  );
}

// ═══ Tab 7: AI Training Center ═══
function TrainingTab() {
  const { data: aiConfigs, isLoading: configLoading } = trpc.controlPanel.aiConfig.list.useQuery();
  const { data: trainingStats, isLoading: statsLoading } = trpc.controlPanel.trainingStats.useQuery();
  const utils = trpc.useUtils();
  const upsertMutation = trpc.controlPanel.aiConfig.upsert.useMutation({
    onSuccess: () => { utils.controlPanel.aiConfig.list.invalidate(); toast.success("تم حفظ الإعدادات"); },
    onError: () => toast.error("فشل حفظ الإعدادات"),
  });

  if (configLoading || statsLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  const configs = aiConfigs || [];
  const stats = trainingStats as any || {};

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">مركز تدريب راصد الذكي</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Brain, color: "text-blue-400", value: stats.knowledgeBaseCount || 0, label: "مقالات قاعدة المعرفة" },
          { icon: BarChart3, color: "text-emerald-400", value: stats.totalConversations || 0, label: "إجمالي المحادثات" },
          { icon: BookOpen, color: "text-purple-400", value: stats.trainingDocsCount || 0, label: "مستندات التدريب" },
          { icon: Settings, color: "text-amber-400", value: configs.length, label: "إعدادات الشخصية" },
        ].map((s, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <s.icon className={`h-8 w-8 ${s.color} mx-auto mb-2`} />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-400">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">إعدادات شخصية راصد الذكي</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {configs.length > 0 ? configs.map((config: any) => (
            <div key={config.id} className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-gray-900/50 border border-gray-700/50">
              <div>
                <div className="text-white text-sm font-medium">{config.configKey}</div>
                <div className="text-gray-400 text-xs">{config.description || "—"}</div>
              </div>
              <Badge variant="outline" className="border-gray-600 text-gray-300 font-mono text-xs max-w-[200px] truncate">{config.configValue}</Badge>
            </div>
          )) : (
            <div className="text-center py-6 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>لم يتم تكوين إعدادات الشخصية بعد</p>
              <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700" onClick={() => {
                [{ key: "assistantName", value: "راصد الذكي", type: "string" as const, description: "اسم المساعد" },
                 { key: "responseStyle", value: "professional", type: "string" as const, description: "أسلوب الرد" },
                 { key: "defaultLanguage", value: "ar", type: "string" as const, description: "اللغة الافتراضية" },
                ].forEach(d => upsertMutation.mutate(d));
              }}><Plus className="h-4 w-4 ml-1" /> تهيئة الإعدادات الافتراضية</Button>
            </div>
          )}
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: BookOpen, color: "text-blue-400", border: "hover:border-blue-500/50", title: "قاعدة المعرفة", desc: "إضافة مقالات وأسئلة شائعة" },
          { icon: Brain, color: "text-purple-400", border: "hover:border-purple-500/50", title: "اختبار المحادثة", desc: "تجربة الإعدادات الحالية" },
          { icon: GraduationCap, color: "text-emerald-400", border: "hover:border-emerald-500/50", title: "مستندات التدريب", desc: "رفع ومعالجة المستندات" },
        ].map((item, i) => (
          <Card key={i} className={`bg-gray-800/50 border-gray-700 ${item.border} transition-colors cursor-pointer`}>
            <CardContent className="p-4 flex items-center gap-3">
              <item.icon className={`h-6 w-6 ${item.color}`} />
              <div>
                <div className="text-white font-medium text-sm">{item.title}</div>
                <div className="text-gray-400 text-xs">{item.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ═══ Main Component ═══
export default function AdminControlPanel() {
  const [activeTab, setActiveTab] = useState<TabId>("users");

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">لوحة التحكم الرئيسية</h1>
          <p className="text-gray-400 text-sm mt-1">إدارة المستخدمين والمجموعات والصلاحيات والتصميم ومركز التدريب</p>
        </div>
      </div>
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl border border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === "users" && <UsersTab />}
          {activeTab === "groups" && <GroupsTab />}
          {activeTab === "pages" && <PagesTab />}
          {activeTab === "sidebar" && <SidebarTab />}
          {activeTab === "design" && <DesignTab />}
          {activeTab === "audit" && <AuditTab />}
          {activeTab === "training" && <TrainingTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
