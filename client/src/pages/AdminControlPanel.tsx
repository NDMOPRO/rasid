/**
 * Admin Control Panel — لوحة التحكم الرئيسية
 * 5 Tabs: المستخدمين | المجموعات | الصفحات | سجل التدقيق | مركز التدريب
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
  RefreshCw, Eye, EyeOff, Lock, Unlock,
} from "lucide-react";

type TabId = "users" | "groups" | "pages" | "audit" | "training";

const tabs: { id: TabId; label: string; labelEn: string; icon: any }[] = [
  { id: "users", label: "المستخدمين", labelEn: "Users", icon: Users },
  { id: "groups", label: "المجموعات", labelEn: "Groups", icon: Layers },
  { id: "pages", label: "الصفحات", labelEn: "Pages", icon: FileText },
  { id: "audit", label: "سجل التدقيق", labelEn: "Audit Log", icon: ScrollText },
  { id: "training", label: "مركز التدريب", labelEn: "Training", icon: GraduationCap },
];

// ═══ Tab 1: Users Management ═══
function UsersTab() {
  const { data: users, isLoading } = trpc.admin.users.useQuery();
  const { data: groups } = trpc.admin.groups.list.useQuery();
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

// ═══ Tab 4: Audit Log ═══
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

// ═══ Tab 5: AI Training Center ═══
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
          <p className="text-gray-400 text-sm mt-1">إدارة المستخدمين والمجموعات والصلاحيات ومركز التدريب</p>
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
          {activeTab === "audit" && <AuditTab />}
          {activeTab === "training" && <TrainingTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
