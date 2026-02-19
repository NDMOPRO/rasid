/**
 * AdminControlPanel — Main Admin Control Panel for Rasid Platform
 * Tabs: نظرة عامة | الصفحات | المجموعات والصلاحيات | شخصية AI | مركز التدريب | سجل التدقيق
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard, FileStack, Users, Shield, Brain, BookOpen,
  ClipboardList, Settings, ToggleLeft, ToggleRight, Edit3,
  Trash2, Plus, Save, Loader2, Eye, EyeOff, Lock, Unlock,
  ChevronDown, ChevronUp, RefreshCw, Search, X, Check,
  Zap, Sparkles, MessageSquare, Star, BarChart3, Activity,
  Globe, AlertTriangle, Database, Package, Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminControlPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
            <p className="text-sm text-gray-400">إدارة الصفحات والصلاحيات وشخصية الذكاء الاصطناعي</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-700/50 p-1 flex flex-wrap gap-1">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2">
            <LayoutDashboard className="w-4 h-4" /> نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="pages" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2">
            <FileStack className="w-4 h-4" /> الصفحات
          </TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2">
            <Users className="w-4 h-4" /> المجموعات والصلاحيات
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2">
            <Brain className="w-4 h-4" /> شخصية AI
          </TabsTrigger>
          <TabsTrigger value="training" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2">
            <BookOpen className="w-4 h-4" /> مركز التدريب
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white gap-2">
            <ClipboardList className="w-4 h-4" /> سجل التدقيق
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="pages"><PagesTab /></TabsContent>
        <TabsContent value="groups"><GroupsTab /></TabsContent>
        <TabsContent value="ai"><AIPersonalityTab /></TabsContent>
        <TabsContent value="training"><TrainingCenterTab /></TabsContent>
        <TabsContent value="audit"><AuditLogTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Overview Tab ═══════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function OverviewTab() {
  const { data: overview } = trpc.controlPanel.overview.useQuery();
  const { data: cmsStats } = trpc.cms.stats.useQuery();

  const cards = [
    { label: "المستخدمين", value: overview?.totalUsers ?? 0, icon: Users, color: "from-blue-500 to-cyan-500" },
    { label: "المجموعات", value: overview?.totalGroups ?? 0, icon: Shield, color: "from-purple-500 to-indigo-500" },
    { label: "الصفحات", value: overview?.totalPages ?? 0, icon: FileStack, color: "from-emerald-500 to-teal-500" },
    { label: "الصلاحيات", value: overview?.totalPermissions ?? 0, icon: Lock, color: "from-orange-500 to-red-500" },
    { label: "حالات الرصد", value: cmsStats?.totalLeaks ?? 0, icon: Database, color: "from-cyan-500 to-blue-500" },
    { label: "المنشورة", value: cmsStats?.publishedLeaks ?? 0, icon: Check, color: "from-emerald-500 to-green-500" },
    { label: "عمليات الاستيراد", value: cmsStats?.totalImports ?? 0, icon: Package, color: "from-indigo-500 to-purple-500" },
    { label: "عمليات التصدير", value: cmsStats?.totalExports ?? 0, icon: BarChart3, color: "from-pink-500 to-rose-500" },
  ];

  return (
    <div className="mt-4 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-white">{card.value.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-400">{card.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "تصدير كامل المنصة", icon: Package, desc: "ZIP شامل" },
              { label: "مراجعة المسودات", icon: Edit3, desc: `${cmsStats?.draftLeaks ?? 0} مسودة` },
              { label: "إعدادات AI", icon: Brain, desc: "تخصيص الشخصية" },
              { label: "إدارة الصفحات", icon: FileStack, desc: "تفعيل/إخفاء" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <div
                  key={action.label}
                  className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-purple-500/30 cursor-pointer transition-all group"
                >
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-purple-400 mb-2 transition-colors" />
                  <h4 className="text-white text-sm font-medium">{action.label}</h4>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Pages Tab ══════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function PagesTab() {
  const { data: pages, isLoading } = trpc.controlPanel.pages.list.useQuery();
  const utils = trpc.useUtils();

  const toggleMutation = trpc.controlPanel.pages.toggleActive.useMutation({
    onSuccess: () => {
      utils.controlPanel.pages.list.invalidate();
      toast.success("تم تحديث حالة الصفحة");
    },
    onError: (err) => toast.error(err.message),
  });

  const workspaceLabels: Record<string, string> = {
    main: "الرئيسية",
    leaks: "حالات الرصد",
    smart_rasid: "راصد الذكي",
    admin: "الإدارة",
    settings: "الإعدادات",
  };

  return (
    <div className="mt-4 space-y-4">
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <FileStack className="w-5 h-5 text-purple-400" />
            سجل الصفحات
            <Badge variant="outline" className="mr-2">{(pages || []).length} صفحة</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
          ) : (
            <div className="space-y-2">
              {(pages || []).map((page: any) => (
                <motion.div
                  key={page.id}
                  layout
                  className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 hover:border-gray-600/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${page.isActive ? "bg-emerald-400" : "bg-gray-600"}`} />
                    <div>
                      <h4 className="text-white text-sm font-medium">{page.titleAr || page.slug}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-mono">/{page.slug}</span>
                        <Badge variant="outline" className="text-xs">
                          {workspaceLabels[page.workspace] || page.workspace}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">ترتيب: {page.sortOrder}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleMutation.mutate({ id: page.id, isActive: !page.isActive })}
                      className={page.isActive ? "text-emerald-400 hover:text-emerald-300" : "text-gray-500 hover:text-gray-400"}
                    >
                      {page.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </Button>
                  </div>
                </motion.div>
              ))}
              {(pages || []).length === 0 && (
                <p className="text-center text-gray-500 py-8">لا توجد صفحات مسجلة — سيتم بذرها تلقائياً</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Groups & Permissions Tab ═══════════════════════════════
// ═══════════════════════════════════════════════════════════════
function GroupsTab() {
  const { data: groups, isLoading } = trpc.controlPanel.groups.listWithMembers.useQuery();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const roleColors: Record<string, string> = {
    root_admin: "from-red-500 to-rose-600",
    director: "from-purple-500 to-indigo-600",
    vice_president: "from-indigo-500 to-blue-600",
    manager: "from-blue-500 to-cyan-600",
    analyst: "from-cyan-500 to-teal-600",
    viewer: "from-gray-500 to-gray-600",
  };

  return (
    <div className="mt-4 space-y-4">
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400" />
            المجموعات والصلاحيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
          ) : (
            <div className="space-y-3">
              {(groups || []).map((group: any) => (
                <div key={group.id} className="bg-gray-900/50 rounded-lg border border-gray-700/30 overflow-hidden">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-800/30 transition-colors"
                    onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleColors[group.roleLevel] || roleColors.viewer} flex items-center justify-center`}>
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white text-sm font-medium">{group.nameAr || group.name}</h4>
                        <p className="text-xs text-gray-400">{group.descriptionAr || group.description || ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        {group.memberCount} عضو
                      </Badge>
                      {expandedGroup === group.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedGroup === group.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-700/30"
                      >
                        <div className="p-4 space-y-3">
                          {/* Members */}
                          <div>
                            <h5 className="text-sm text-gray-400 mb-2">الأعضاء</h5>
                            {group.members.length === 0 ? (
                              <p className="text-xs text-gray-500">لا يوجد أعضاء</p>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                {group.members.map((m: any) => (
                                  <Badge key={m.id} variant="outline" className="text-xs gap-1">
                                    <Users className="w-3 h-3" />
                                    {m.displayName || m.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Permissions Summary */}
                          <div>
                            <h5 className="text-sm text-gray-400 mb-2">الصلاحيات</h5>
                            <GroupPermissions groupId={group.id} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              {(groups || []).length === 0 && (
                <p className="text-center text-gray-500 py-8">لا توجد مجموعات — سيتم بذرها تلقائياً</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function GroupPermissions({ groupId }: { groupId: string }) {
  const { data: permissions, isLoading } = trpc.controlPanel.groups.getPermissions.useQuery({ groupId });

  if (isLoading) return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
  if (!permissions || permissions.length === 0) return <p className="text-xs text-gray-500">لا توجد صلاحيات مخصصة</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {permissions.map((p: any) => (
        <Badge
          key={p.id}
          className={p.gpEffect === "allow" ? "bg-emerald-500/20 text-emerald-300 text-xs" : "bg-red-500/20 text-red-300 text-xs"}
        >
          {p.gpEffect === "allow" ? <Check className="w-3 h-3 ml-1" /> : <X className="w-3 h-3 ml-1" />}
          {p.gpPermissionId}
        </Badge>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ AI Personality Tab ═════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function AIPersonalityTab() {
  const { data: configs, isLoading } = trpc.controlPanel.aiConfig.list.useQuery();
  const utils = trpc.useUtils();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<string>("string");
  const [newDesc, setNewDesc] = useState("");

  const upsertMutation = trpc.controlPanel.aiConfig.upsert.useMutation({
    onSuccess: () => {
      utils.controlPanel.aiConfig.list.invalidate();
      setEditingKey(null);
      setShowAddDialog(false);
      toast.success("تم الحفظ");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.controlPanel.aiConfig.delete.useMutation({
    onSuccess: () => {
      utils.controlPanel.aiConfig.list.invalidate();
      toast.success("تم الحذف");
    },
  });

  const defaultConfigs = [
    { key: "system_prompt", label: "System Prompt", desc: "التعليمات الأساسية لراصد الذكي", icon: Cpu },
    { key: "personality_tone", label: "نبرة الشخصية", desc: "رسمي / ودود / تقني", icon: MessageSquare },
    { key: "language_preference", label: "اللغة المفضلة", desc: "ar / en / auto", icon: Globe },
    { key: "max_response_length", label: "طول الرد الأقصى", desc: "عدد الأحرف", icon: Edit3 },
    { key: "creativity_level", label: "مستوى الإبداع", desc: "0.0 - 1.0 (temperature)", icon: Sparkles },
    { key: "domain_focus", label: "التركيز المجالي", desc: "أمن سيبراني / خصوصية / حوكمة", icon: Shield },
  ];

  return (
    <div className="mt-4 space-y-4">
      {/* Current Configs */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            إعدادات شخصية الذكاء الاصطناعي
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 ml-1" /> إضافة إعداد
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div>
          ) : (configs || []).length === 0 ? (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm mb-4">لم يتم تكوين أي إعدادات بعد. الإعدادات المقترحة:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {defaultConfigs.map((cfg) => {
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={cfg.key}
                      className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 border-dashed hover:border-purple-500/30 cursor-pointer transition-all"
                      onClick={() => {
                        setNewKey(cfg.key);
                        setNewDesc(cfg.desc);
                        setShowAddDialog(true);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm font-medium">{cfg.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{cfg.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(configs || []).map((cfg: any) => (
                <div key={cfg.configKey} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white text-sm font-medium font-mono">{cfg.configKey}</span>
                      {cfg.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{cfg.description}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => {
                          setEditingKey(cfg.configKey);
                          setEditValue(cfg.configValue);
                        }}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-400"
                        onClick={() => {
                          if (confirm("حذف هذا الإعداد؟")) deleteMutation.mutate({ configKey: cfg.configKey });
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {editingKey === cfg.configKey ? (
                    <div className="flex gap-2 mt-2">
                      <Textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="bg-gray-800 border-gray-600 text-sm flex-1"
                        rows={3}
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          size="sm"
                          onClick={() => upsertMutation.mutate({
                            configKey: cfg.configKey,
                            configValue: editValue,
                            configType: cfg.configType,
                          })}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingKey(null)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-1 p-2 bg-gray-800/50 rounded text-sm text-gray-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {cfg.configValue}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{cfg.configType}</Badge>
                    {cfg.updatedAt && (
                      <span className="text-xs text-gray-500">
                        آخر تحديث: {new Date(cfg.updatedAt).toLocaleDateString("ar-SA")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>إضافة إعداد جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">المفتاح</label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="مثال: system_prompt"
                className="bg-gray-800 border-gray-600 font-mono"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">القيمة</label>
              <Textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="أدخل القيمة..."
                className="bg-gray-800 border-gray-600"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">النوع</label>
                <Select value={newType} onValueChange={setNewType}>
                  <SelectTrigger className="bg-gray-800 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">نص</SelectItem>
                    <SelectItem value="number">رقم</SelectItem>
                    <SelectItem value="boolean">منطقي</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">الوصف</label>
                <Input
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="وصف مختصر"
                  className="bg-gray-800 border-gray-600"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button
              onClick={() => {
                if (!newKey || !newValue) return toast.error("المفتاح والقيمة مطلوبان");
                upsertMutation.mutate({
                  configKey: newKey,
                  configValue: newValue,
                  configType: newType as any,
                  description: newDesc,
                });
              }}
              className="bg-purple-600 hover:bg-purple-700"
              disabled={upsertMutation.isPending}
            >
              <Save className="w-4 h-4 ml-1" /> حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Training Center Tab ════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function TrainingCenterTab() {
  const { data: stats } = trpc.controlPanel.trainingStats.useQuery();

  const trainingCards = [
    { label: "مقالات قاعدة المعرفة", value: stats?.totalKnowledgeEntries ?? 0, icon: BookOpen, color: "text-blue-400" },
    { label: "أوامر مخصصة", value: stats?.totalCustomActions ?? 0, icon: Zap, color: "text-yellow-400" },
    { label: "مستندات التدريب", value: stats?.totalTrainingDocs ?? 0, icon: FileStack, color: "text-emerald-400" },
    { label: "متوسط التقييم", value: stats?.avgRating ?? 0, icon: Star, color: "text-orange-400" },
    { label: "إجمالي المحادثات", value: stats?.totalConversations ?? 0, icon: MessageSquare, color: "text-purple-400" },
  ];

  return (
    <div className="mt-4 space-y-4">
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            مركز تدريب الذكاء الاصطناعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {trainingCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${card.color}`} />
                  <div className="text-2xl font-bold text-white">{card.value}</div>
                  <p className="text-xs text-gray-400 mt-1">{card.label}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              تحسينات مقترحة
            </h4>
            <div className="space-y-2">
              {[
                "إضافة مقالات جديدة لقاعدة المعرفة لتحسين دقة الإجابات",
                "مراجعة تقييمات المستخدمين السلبية وتحسين الردود",
                "تحديث بيانات التدريب بأحدث التهديدات السيبرانية",
                "إضافة سيناريوهات جديدة للأوامر المخصصة",
              ].map((tip, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                  <span className="text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Audit Log Tab ══════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function AuditLogTab() {
  // Use the existing admin audit log from the admin router
  const [search, setSearch] = useState("");

  return (
    <div className="mt-4 space-y-4">
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-purple-400" />
              سجل التدقيق
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="بحث في السجل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-gray-900/50 border-gray-600"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-center text-gray-500 py-8">
              سجل التدقيق يعرض جميع العمليات الإدارية. يتم تسجيل كل إجراء تلقائياً.
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <Activity className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                <h4 className="text-white text-sm">عمليات CMS</h4>
                <p className="text-xs text-gray-400">استيراد، تصدير، نشر</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <Shield className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                <h4 className="text-white text-sm">تغييرات الصلاحيات</h4>
                <p className="text-xs text-gray-400">أدوار، مجموعات، أعضاء</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-lg">
                <Settings className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                <h4 className="text-white text-sm">إعدادات النظام</h4>
                <p className="text-xs text-gray-400">صفحات، AI، تكوينات</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
