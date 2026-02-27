# rasid - client-pages-admin

> Auto-extracted source code documentation

---

## `client/src/pages/admin/AdminAuditLog.tsx`

```tsx
/**
 * Admin Audit Log — Track all administrative changes with rollback support
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ScrollText, Search, Filter, RotateCcw, Loader2, Clock, User, ChevronDown, ChevronUp,
  Shield, Layers, ToggleLeft, Palette, Menu as MenuIcon, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const ACTION_LABELS: Record<string, string> = {
  "role.create": "إنشاء دور",
  "role.update": "تعديل دور",
  "role.delete": "حذف دور",
  "role.setPermissions": "تعيين صلاحيات",
  "group.create": "إنشاء مجموعة",
  "group.delete": "حذف مجموعة",
  "group.addMember": "إضافة عضو",
  "group.removeMember": "إزالة عضو",
  "featureFlag.create": "إنشاء مفتاح ميزة",
  "featureFlag.enable": "تفعيل ميزة",
  "featureFlag.disable": "تعطيل ميزة",
  "theme.update": "تعديل المظهر",
  "menu.create": "إنشاء قائمة",
  "menu.update": "تعديل قائمة",
  "menu.delete": "حذف قائمة",
  "seed": "تهيئة بيانات",
};

const RESOURCE_ICONS: Record<string, typeof Shield> = {
  role: Shield,
  group: Layers,
  feature_flag: ToggleLeft,
  theme: Palette,
  menu: MenuIcon,
  system: AlertTriangle,
};

export default function AdminAuditLog() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rollbackDialog, setRollbackDialog] = useState<any>(null);

  const { data, isLoading } = trpc.admin.auditLogs.list.useQuery({
    limit: 50,
    offset: (page - 1) * 50,
    resourceType: resourceFilter !== "all" ? resourceFilter : undefined,
  });

  const rollbackMutation = trpc.admin.auditLogs.rollback.useMutation({
    onSuccess: () => {
      toast.success("تم التراجع عن العملية بنجاح");
      setRollbackDialog(null);
      utils.admin.auditLogs.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const logs: any[] = Array.isArray(data) ? data : (data as any)?.logs ?? [];
  const totalPages = Math.ceil(logs.length / 50) || 1;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-amber-400" />
          سجل تدقيق الإدارة
        </h1>
        <p className="text-muted-foreground text-sm mt-1">تتبع جميع التغييرات الإدارية مع إمكانية التراجع</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في السجل..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pr-10" />
        </div>
        <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="role">الأدوار</SelectItem>
            <SelectItem value="group">المجموعات</SelectItem>
            <SelectItem value="feature_flag">مفاتيح الميزات</SelectItem>
            <SelectItem value="theme">المظهر</SelectItem>
            <SelectItem value="menu">القوائم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log Entries */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : logs.length === 0 ? (
        <Card className="border border-dashed border-border/50">
          <CardContent className="p-4 sm:p-12 text-center text-muted-foreground">
            <ScrollText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>لا توجد سجلات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any, i: number) => {
            const Icon = RESOURCE_ICONS[log.resourceType] ?? Shield;
            const isExpanded = expandedId === log.id;
            return (
              <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}>
                <Card className="border border-border/30 hover:border-border/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                      <div className="p-2 rounded-lg bg-muted/50 mt-0.5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">
                            {ACTION_LABELS[log.action] ?? log.action}
                          </span>
                          {log.resourceName && (
                            <Badge variant="outline" className="text-xs sm:text-[10px]">{log.resourceName}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs sm:text-[10px]">{log.resourceType}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {log.userName ?? "النظام"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(log.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.isRollbackable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-400 hover:text-amber-300 gap-1 text-xs"
                            onClick={(e) => { e.stopPropagation(); setRollbackDialog(log); }}
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> تراجع
                          </Button>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 pt-3 border-t border-border/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {log.oldValue && (
                            <div>
                              <p className="font-semibold text-red-400 mb-1">القيمة السابقة</p>
                              <pre className="bg-muted/30 p-2 rounded text-muted-foreground overflow-auto max-h-40 text-xs sm:text-[10px]">
                                {JSON.stringify(log.oldValue, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div>
                              <p className="font-semibold text-green-400 mb-1">القيمة الجديدة</p>
                              <pre className="bg-muted/30 p-2 rounded text-muted-foreground overflow-auto max-h-40 text-xs sm:text-[10px]">
                                {JSON.stringify(log.newValue, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        {log.reason && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            <strong>السبب:</strong> {log.reason}
                          </p>
                        )}
                        {log.ipAddress && (
                          <p className="mt-1 text-xs sm:text-[10px] text-muted-foreground/60">IP: {log.ipAddress}</p>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>السابق</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>التالي</Button>
        </div>
      )}

      {/* Rollback Confirmation Dialog */}
      <Dialog open={!!rollbackDialog} onOpenChange={(open) => !open && setRollbackDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <RotateCcw className="w-5 h-5" /> تأكيد التراجع
            </DialogTitle>
          </DialogHeader>
          {rollbackDialog && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                هل أنت متأكد من التراجع عن العملية التالية؟
              </p>
              <Card className="border border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-3 text-sm">
                  <p><strong>العملية:</strong> {ACTION_LABELS[rollbackDialog.action] ?? rollbackDialog.action}</p>
                  <p><strong>المورد:</strong> {rollbackDialog.resourceName}</p>
                  <p><strong>التاريخ:</strong> {formatDate(rollbackDialog.createdAt)}</p>
                </CardContent>
              </Card>
              <p className="text-xs text-amber-400">⚠️ سيتم استعادة القيمة السابقة وتسجيل عملية التراجع في السجل</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackDialog(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => rollbackMutation.mutate({ logId: rollbackDialog.id })} disabled={rollbackMutation.isPending}>
              {rollbackMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد التراجع"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

```

---

## `client/src/pages/admin/AdminFeatureFlags.tsx`

```tsx
/**
 * Admin Feature Flags — Toggle features/pages on/off without code changes
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ToggleLeft, Plus, Loader2, Search, Eye, EyeOff, Settings, Globe, Zap, Filter,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_LABELS: Record<string, { ar: string; icon: typeof Globe }> = {
  all: { ar: "الكل", icon: Globe },
  roles: { ar: "أدوار", icon: Zap },
  groups: { ar: "مجموعات", icon: Settings },
  users: { ar: "مستخدمين", icon: Settings },
  percentage: { ar: "نسبة", icon: Settings },
};

export default function AdminFeatureFlags() {
  const utils = trpc.useUtils();
  const { data: flags, isLoading } = trpc.admin.featureFlags.list.useQuery();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newFlag, setNewFlag] = useState({
    key: "", displayName: "", displayNameEn: "", description: "",
    isEnabled: true, targetType: "all" as "all" | "roles" | "groups" | "users" | "percentage",
  });

  const createMutation = trpc.admin.featureFlags.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء مفتاح الميزة بنجاح");
      setShowCreateDialog(false);
      setNewFlag({ key: "", displayName: "", displayNameEn: "", description: "", isEnabled: true, targetType: "all" as const });
      utils.admin.featureFlags.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const toggleMutation = trpc.admin.featureFlags.toggle.useMutation({
    onMutate: async ({ id, enabled }) => {
      await utils.admin.featureFlags.list.cancel();
      const prev = utils.admin.featureFlags.list.getData();
      utils.admin.featureFlags.list.setData(undefined, (old) =>
        old?.map((f) => (f.id === id ? { ...f, isEnabled: enabled } : f))
      );
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) utils.admin.featureFlags.list.setData(undefined, ctx.prev);
      toast.error(err.message);
    },
    onSettled: () => utils.admin.featureFlags.list.invalidate(),
  });

  const filteredFlags = useMemo(() => {
    if (!flags) return [];
    let result = flags;
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((f) => f.displayName.includes(s) || (f.displayNameEn ?? "").toLowerCase().includes(s) || f.key.includes(s));
    }
    if (categoryFilter !== "all") {
      result = result.filter((f) => f.targetType === categoryFilter);
    }
    return result;
  }, [flags, search, categoryFilter]);

  const stats = useMemo(() => {
    if (!flags) return { total: 0, enabled: 0, disabled: 0 };
    return {
      total: flags.length,
      enabled: flags.filter((f) => f.isEnabled).length,
      disabled: flags.filter((f) => !f.isEnabled).length,
    };
  }, [flags]);

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ToggleLeft className="w-6 h-6 text-green-400" />
            مفاتيح الميزات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">تفعيل وتعطيل الميزات والصفحات بدون تعديل الكود</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> إنشاء مفتاح</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء مفتاح ميزة جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">المفتاح (key)</label>
                <Input value={newFlag.key} onChange={(e) => setNewFlag({ ...newFlag, key: e.target.value.toLowerCase().replace(/\s/g, "_") })} placeholder="e.g. dark_web_monitor" className="font-mono text-sm" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالعربية</label>
                <Input value={newFlag.displayName} onChange={(e) => setNewFlag({ ...newFlag, displayName: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالإنجليزية</label>
                <Input value={newFlag.displayNameEn} onChange={(e) => setNewFlag({ ...newFlag, displayNameEn: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الفئة</label>
                <Select value={newFlag.targetType} onValueChange={(v) => setNewFlag({ ...newFlag, targetType: v as typeof newFlag.targetType })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="roles">أدوار محددة</SelectItem>
                    <SelectItem value="groups">مجموعات محددة</SelectItem>
                    <SelectItem value="users">مستخدمين محددين</SelectItem>
                    <SelectItem value="percentage">نسبة مئوية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الوصف</label>
                <Input value={newFlag.description} onChange={(e) => setNewFlag({ ...newFlag, description: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={newFlag.isEnabled} onCheckedChange={(v) => setNewFlag({ ...newFlag, isEnabled: v })} />
                <span className="text-sm">{newFlag.isEnabled ? "مفعل" : "معطل"}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
              <Button onClick={() => createMutation.mutate(newFlag)} disabled={createMutation.isPending || !newFlag.key || !newFlag.displayName}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-border/50 bg-card/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">إجمالي المفاتيح</p>
          </CardContent>
        </Card>
        <Card className="border border-green-500/30 bg-green-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.enabled}</p>
            <p className="text-xs text-muted-foreground">مفعل</p>
          </CardContent>
        </Card>
        <Card className="border border-red-500/30 bg-red-500/5">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{stats.disabled}</p>
            <p className="text-xs text-muted-foreground">معطل</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="page">صفحات</SelectItem>
            <SelectItem value="feature">ميزات</SelectItem>
            <SelectItem value="component">مكونات</SelectItem>
            <SelectItem value="api">API</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Flags List */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filteredFlags.length === 0 ? (
        <Card className="border border-dashed border-border/50">
          <CardContent className="p-4 sm:p-12 text-center text-muted-foreground">
            <ToggleLeft className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>لا توجد مفاتيح ميزات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredFlags.map((flag, i) => {
            const cat = CATEGORY_LABELS[flag.targetType] ?? { ar: flag.targetType, icon: Settings };
            return (
              <motion.div key={flag.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card className={`border transition-all ${flag.isEnabled ? "border-green-500/20 bg-green-500/[0.02]" : "border-border/30 opacity-70"}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={flag.isEnabled}
                        onCheckedChange={(v) => toggleMutation.mutate({ id: flag.id, enabled: v })}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{flag.displayName}</h3>
                          <span className="text-xs text-muted-foreground">({flag.displayNameEn})</span>
                          <Badge variant="outline" className="text-xs sm:text-[10px] gap-1">
                            <cat.icon className="w-3 h-3" /> {cat.ar}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{flag.description}</p>
                        <code className="text-xs sm:text-[10px] text-muted-foreground/70 font-mono">{flag.key}</code>
                      </div>
                      <div className="flex items-center gap-2">
                        {flag.isEnabled ? (
                          <Eye className="w-4 h-4 text-green-400" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

```

---

## `client/src/pages/admin/AdminGroups.tsx`

```tsx
/**
 * Admin Groups — Group management with members and permissions
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Layers, Plus, Edit, Trash2, Loader2, Search, Users, UserPlus, UserMinus, Shield,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminGroups() {
  const utils = trpc.useUtils();
  const { data: groups, isLoading } = trpc.admin.groups.list.useQuery();
  const { data: allUsers } = trpc.users.list.useQuery();
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: "", nameEn: "", description: "", descriptionEn: "" });
  const [addMemberUserId, setAddMemberUserId] = useState<string>("");

  const { data: groupDetail } = trpc.admin.groups.getById.useQuery(
    { id: selectedGroupId! },
    { enabled: !!selectedGroupId }
  );

  const createMutation = trpc.admin.groups.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المجموعة بنجاح");
      setShowCreateDialog(false);
      setNewGroup({ name: "", nameEn: "", description: "", descriptionEn: "" });
      utils.admin.groups.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.groups.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المجموعة");
      setSelectedGroupId(null);
      utils.admin.groups.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const addMemberMutation = trpc.admin.groups.addMember.useMutation({
    onSuccess: () => {
      toast.success("تمت إضافة العضو");
      setAddMemberUserId("");
      utils.admin.groups.getById.invalidate({ id: selectedGroupId! });
      utils.admin.groups.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const removeMemberMutation = trpc.admin.groups.removeMember.useMutation({
    onSuccess: () => {
      toast.success("تمت إزالة العضو");
      utils.admin.groups.getById.invalidate({ id: selectedGroupId! });
      utils.admin.groups.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    if (!search) return groups;
    const s = search.toLowerCase();
    return groups.filter((g) => g.name.includes(s) || g.nameEn.toLowerCase().includes(s));
  }, [groups, search]);

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-purple-400" />
            إدارة المجموعات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إنشاء مجموعات وإدارة الأعضاء والصلاحيات الجماعية</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> إنشاء مجموعة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء مجموعة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالعربية</label>
                <Input value={newGroup.name} onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })} placeholder="مثال: فريق التحليل" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالإنجليزية</label>
                <Input value={newGroup.nameEn} onChange={(e) => setNewGroup({ ...newGroup, nameEn: e.target.value })} placeholder="e.g. Analysis Team" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الوصف</label>
                <Input value={newGroup.description} onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
              <Button onClick={() => createMutation.mutate(newGroup)} disabled={createMutation.isPending || !newGroup.name || !newGroup.nameEn}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="بحث في المجموعات..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Groups List */}
        <div className="lg:col-span-1 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : filteredGroups.length === 0 ? (
            <Card className="border border-dashed border-border/50">
              <CardContent className="p-3 sm:p-8 text-center text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد مجموعات بعد</p>
              </CardContent>
            </Card>
          ) : (
            filteredGroups.map((group, i) => (
              <motion.div key={group.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  className={`border cursor-pointer transition-all ${selectedGroupId === group.id ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-border"}`}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap">
                      <div>
                        <h3 className="font-semibold text-foreground">{group.name}</h3>
                        <p className="text-xs text-muted-foreground">{group.nameEn}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs gap-1">
                          <Users className="w-3 h-3" /> {group.memberCount}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: group.id }); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Group Detail */}
        <div className="lg:col-span-2">
          {selectedGroupId && groupDetail ? (
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap">
                  <span className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-purple-400" />
                    {groupDetail.name}
                  </span>
                  <Badge variant={groupDetail.status === "active" ? "default" : "secondary"}>
                    {groupDetail.status === "active" ? "نشط" : "معطل"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Members */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4" /> الأعضاء ({groupDetail.members.length})
                  </h3>
                  <div className="flex gap-2 mb-3">
                    <Select value={addMemberUserId} onValueChange={setAddMemberUserId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="اختر مستخدم لإضافته..." />
                      </SelectTrigger>
                      <SelectContent>
                        {allUsers?.filter((u: any) => !groupDetail.members.some((m) => m.userId === u.id)).map((u: any) => (
                          <SelectItem key={u.id} value={String(u.id)}>{u.displayName} ({u.userId})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (addMemberUserId) {
                          addMemberMutation.mutate({ groupId: selectedGroupId, userId: Number(addMemberUserId) });
                        }
                      }}
                      disabled={!addMemberUserId || addMemberMutation.isPending}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {groupDetail.members.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">لا يوجد أعضاء</p>
                    ) : (
                      groupDetail.members.map((member) => {
                        const user = allUsers?.find((u: any) => u.id === member.userId);
                        return (
                          <div key={member.id} className="flex items-center justify-between flex-wrap p-2 rounded-lg bg-muted/30 border border-border/30">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                {(user?.name ?? "?").charAt(0)}
                              </div>
                              <div>
                                <p className="text-sm font-medium">{user?.name ?? `User #${member.userId}`}</p>
                                <p className="text-xs sm:text-[10px] text-muted-foreground">{user?.email ?? ""}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => removeMemberMutation.mutate({ groupId: selectedGroupId, userId: member.userId })}
                            >
                              <UserMinus className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Group Permissions Summary */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> صلاحيات المجموعة ({groupDetail.permissions.length})
                  </h3>
                  {groupDetail.permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">لم يتم تعيين صلاحيات بعد</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {groupDetail.permissions.map((gp) => (
                        <Badge
                          key={gp.id}
                          variant={gp.effect === "allow" ? "default" : "destructive"}
                          className="text-xs sm:text-[10px]"
                        >
                          {gp.permissionId.replace("perm-", "").replace(/-/g, " ")}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-dashed border-border/50">
              <CardContent className="p-4 sm:p-12 text-center text-muted-foreground">
                <Layers className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">اختر مجموعة لعرض التفاصيل</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

```

---

## `client/src/pages/admin/AdminMenus.tsx`

```tsx
/**
 * Admin Menu Management — Manage navigation menus and items
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Menu as MenuIcon, Plus, Edit, Trash2, Loader2, GripVertical, Eye, EyeOff,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Link2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminMenus() {
  const utils = trpc.useUtils();
  const { data: menus, isLoading } = trpc.admin.menus.list.useQuery();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [newMenu, setNewMenu] = useState({
    name: "", nameEn: "", location: "sidebar" as "sidebar" | "top_nav" | "footer" | "contextual" | "mobile",
  });

  const { data: menuDetail } = trpc.admin.menus.getById.useQuery(
    { id: selectedMenuId! },
    { enabled: !!selectedMenuId }
  );

  const createMutation = trpc.admin.menus.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء القائمة بنجاح");
      setShowCreateDialog(false);
      setNewMenu({ name: "", nameEn: "", location: "sidebar" });
      utils.admin.menus.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.menus.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف القائمة");
      setSelectedMenuId(null);
      utils.admin.menus.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const MENU_TYPE_LABELS: Record<string, string> = {
    sidebar: "شريط جانبي",
    header: "رأس الصفحة",
    footer: "تذييل الصفحة",
    context: "قائمة سياقية",
    mobile: "قائمة الجوال",
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-cyan-400" />
            إدارة القوائم
          </h1>
          <p className="text-muted-foreground text-sm mt-1">تخصيص قوائم التنقل والشريط الجانبي</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> إنشاء قائمة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء قائمة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالعربية</label>
                <Input value={newMenu.name} onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالإنجليزية</label>
                <Input value={newMenu.nameEn} onChange={(e) => setNewMenu({ ...newMenu, nameEn: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الموقع</label>
                <Select value={newMenu.location} onValueChange={(v) => setNewMenu({ ...newMenu, location: v as typeof newMenu.location })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sidebar">شريط جانبي</SelectItem>
                    <SelectItem value="top_nav">رأس الصفحة</SelectItem>
                    <SelectItem value="footer">تذييل الصفحة</SelectItem>
                    <SelectItem value="contextual">قائمة سياقية</SelectItem>
                    <SelectItem value="mobile">قائمة الجوال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
              <Button onClick={() => createMutation.mutate(newMenu)} disabled={createMutation.isPending || !newMenu.name}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menus List */}
        <div className="lg:col-span-1 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !menus || menus.length === 0 ? (
            <Card className="border border-dashed border-border/50">
              <CardContent className="p-3 sm:p-8 text-center text-muted-foreground">
                <MenuIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد قوائم مخصصة</p>
                <p className="text-xs mt-1">القوائم الافتراضية تُدار من الكود</p>
              </CardContent>
            </Card>
          ) : (
            menus.map((menu: any, i: number) => (
              <motion.div key={menu.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  className={`border cursor-pointer transition-all ${selectedMenuId === menu.id ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-border"}`}
                  onClick={() => setSelectedMenuId(menu.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{menu.name}</h3>
                          {!menu.isActive && <Badge variant="secondary" className="text-xs sm:text-[10px]">معطل</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{MENU_TYPE_LABELS[menu.location] ?? menu.location}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: menu.id }); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Menu Detail / Items */}
        <div className="lg:col-span-2">
          {selectedMenuId && menuDetail ? (
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between flex-wrap">
                  <span className="flex items-center gap-2">
                    <MenuIcon className="w-5 h-5 text-cyan-400" />
                    {(menuDetail as any).name}
                  </span>
                  <Badge variant={(menuDetail as any).isActive ? "default" : "secondary"}>
                    {(menuDetail as any).isActive ? "نشط" : "معطل"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>النوع: {MENU_TYPE_LABELS[(menuDetail as any).menuType] ?? (menuDetail as any).menuType}</p>
                  {(menuDetail as any).workspace && <p>مساحة العمل: {(menuDetail as any).workspace}</p>}
                  {(menuDetail as any).description && <p>الوصف: {(menuDetail as any).description}</p>}
                </div>

                <div className="border-t border-border/30 pt-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4" /> عناصر القائمة
                  </h3>
                  {(menuDetail as any).items && (menuDetail as any).items.length > 0 ? (
                    <div className="space-y-2">
                      {(menuDetail as any).items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs sm:text-[10px] text-muted-foreground">{item.path ?? item.url ?? ""}</p>
                          </div>
                          {item.isVisible ? (
                            <Eye className="w-4 h-4 text-green-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد عناصر في هذه القائمة</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-dashed border-border/50">
              <CardContent className="p-4 sm:p-12 text-center text-muted-foreground">
                <MenuIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">اختر قائمة لعرض التفاصيل</p>
                <p className="text-xs mt-2">أو أنشئ قائمة جديدة لتخصيص التنقل</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

```

---

## `client/src/pages/admin/AdminOverview.tsx`

```tsx
/**
 * Admin Overview — System dashboard showing key metrics
 */
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield, Users, Layers, ToggleLeft, ScrollText, Palette, Menu as MenuIcon,
  Loader2, AlertTriangle, CheckCircle, RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import AnimatedCounter from "@/components/AnimatedCounter";

const statCards = [
  { key: "totalRoles", label: "الأدوار", labelEn: "Roles", icon: Shield, color: "from-blue-500/20 to-blue-600/10 border-blue-500/30", textColor: "text-blue-400", link: "/admin/roles" },
  { key: "totalGroups", label: "المجموعات", labelEn: "Groups", icon: Layers, color: "from-purple-500/20 to-purple-600/10 border-purple-500/30", textColor: "text-purple-400", link: "/admin/groups" },
  { key: "totalPermissions", label: "الصلاحيات", labelEn: "Permissions", icon: Shield, color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30", textColor: "text-emerald-400", link: "/admin/roles" },
  { key: "totalUsers", label: "المستخدمين", labelEn: "Users", icon: Users, color: "from-amber-500/20 to-amber-600/10 border-amber-500/30", textColor: "text-amber-400", link: "/user-management" },
  { key: "activeFeatureFlags", label: "ميزات مفعلة", labelEn: "Active Flags", icon: ToggleLeft, color: "from-green-500/20 to-green-600/10 border-green-500/30", textColor: "text-green-400", link: "/admin/feature-flags" },
  { key: "disabledFeatureFlags", label: "ميزات معطلة", labelEn: "Disabled Flags", icon: AlertTriangle, color: "from-red-500/20 to-red-600/10 border-red-500/30", textColor: "text-red-400", link: "/admin/feature-flags" },
] as const;

export default function AdminOverview() {
  const { data: overview, isLoading } = trpc.admin.overview.useQuery();
  const seedMutation = trpc.admin.seed.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("تم تهيئة البيانات الافتراضية بنجاح", { description: result.message });
      } else {
        toast.error("فشل في التهيئة", { description: result.message });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم الإدارية</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة شاملة للأدوار والصلاحيات والميزات والمظهر</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="gap-2"
        >
          {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          تهيئة البيانات الافتراضية
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={card.link}>
              <Card className={`cursor-pointer border bg-gradient-to-br ${card.color} hover:scale-[1.02] transition-transform`}>
                <CardContent className="p-4 text-center">
                  <card.icon className={`w-8 h-8 mx-auto mb-2 ${card.textColor}`} />
                  <div className={`text-2xl font-bold ${card.textColor}`}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <AnimatedCounter value={overview?.[card.key] ?? 0} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "إدارة الأدوار والصلاحيات", titleEn: "Roles & Permissions", desc: "إنشاء وتعديل الأدوار وتعيين الصلاحيات لكل دور", icon: Shield, link: "/admin/roles", color: "text-blue-400" },
          { title: "إدارة المجموعات", titleEn: "Groups", desc: "إنشاء مجموعات وإضافة أعضاء وتعيين صلاحيات جماعية", icon: Layers, link: "/admin/groups", color: "text-purple-400" },
          { title: "مفاتيح الميزات", titleEn: "Feature Flags", desc: "تفعيل/تعطيل الميزات والصفحات بدون تعديل الكود", icon: ToggleLeft, link: "/admin/feature-flags", color: "text-green-400" },
          { title: "سجل تدقيق الإدارة", titleEn: "Admin Audit Log", desc: "تتبع جميع التغييرات الإدارية مع إمكانية التراجع", icon: ScrollText, link: "/admin/audit-log", color: "text-amber-400" },
          { title: "إعدادات المظهر", titleEn: "Theme Settings", desc: "تخصيص الألوان والخطوط والتخطيط والظلال", icon: Palette, link: "/admin/theme", color: "text-pink-400" },
          { title: "إدارة القوائم", titleEn: "Menu Management", desc: "تخصيص قوائم التنقل والشريط الجانبي", icon: MenuIcon, link: "/admin/menus", color: "text-cyan-400" },
        ].map((action, i) => (
          <motion.div
            key={action.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Link href={action.link}>
              <Card className="cursor-pointer border border-border/50 hover:border-primary/30 bg-card/50 hover:bg-card/80 transition-all group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors ${action.color}`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* System Status */}
      <Card className="border border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            حالة النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">محرك الصلاحيات</span>
              <span className="text-green-400 mr-auto">نشط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">Feature Flags</span>
              <span className="text-green-400 mr-auto">نشط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">سجل التدقيق</span>
              <span className="text-green-400 mr-auto">نشط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">RBAC Engine</span>
              <span className="text-green-400 mr-auto">نشط</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

```

---

## `client/src/pages/admin/AdminRoles.tsx`

```tsx
/**
 * Admin Roles & Permissions — Full CRUD for roles with permission matrix
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield, Plus, Edit, Trash2, Loader2, Search, Lock, Unlock, Users, ChevronDown, ChevronUp, Save,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminRoles() {
  const utils = trpc.useUtils();
  const { data: roles, isLoading: rolesLoading } = trpc.admin.roles.list.useQuery();
  const { data: permissions, isLoading: permsLoading } = trpc.admin.permissions.list.useQuery();
  const [search, setSearch] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [newRole, setNewRole] = useState({ name: "", nameEn: "", description: "", descriptionEn: "", priority: 50, color: "#3b82f6" });

  // Permission matrix state
  const { data: rolePerms } = trpc.admin.roles.getPermissions.useQuery(
    { roleId: selectedRoleId! },
    { enabled: !!selectedRoleId }
  );
  const [permChanges, setPermChanges] = useState<Map<string, "allow" | "deny" | null>>(new Map());

  const createMutation = trpc.admin.roles.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الدور بنجاح");
      setShowCreateDialog(false);
      setNewRole({ name: "", nameEn: "", description: "", descriptionEn: "", priority: 50, color: "#3b82f6" });
      utils.admin.roles.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateMutation = trpc.admin.roles.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الدور بنجاح");
      setEditingRole(null);
      utils.admin.roles.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.roles.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الدور");
      utils.admin.roles.list.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const setPermsMutation = trpc.admin.roles.setPermissions.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الصلاحيات");
      setPermChanges(new Map());
      utils.admin.roles.getPermissions.invalidate({ roleId: selectedRoleId! });
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    if (!search) return roles;
    const s = search.toLowerCase();
    return roles.filter((r) => r.name.includes(s) || r.nameEn.toLowerCase().includes(s));
  }, [roles, search]);

  // Group permissions by resource type
  const permsByType = useMemo(() => {
    if (!permissions) return {};
    const grouped: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      if (!grouped[p.resourceType]) grouped[p.resourceType] = [];
      grouped[p.resourceType].push(p);
    }
    return grouped;
  }, [permissions]);

  // Build effective permission map for selected role
  const effectivePerms = useMemo(() => {
    const map = new Map<string, "allow" | "deny">();
    if (rolePerms) {
      for (const rp of rolePerms) {
        map.set(rp.permissionId, rp.effect);
      }
    }
    // Apply local changes
    Array.from(permChanges.entries()).forEach(([permId, effect]) => {
      if (effect === null) {
        map.delete(permId);
      } else {
        map.set(permId, effect);
      }
    });
    return map;
  }, [rolePerms, permChanges]);

  const handleSavePermissions = () => {
    if (!selectedRoleId) return;
    const perms: Array<{ permissionId: string; effect: "allow" | "deny" }> = [];
    Array.from(effectivePerms.entries()).forEach(([permId, effect]) => {
      perms.push({ permissionId: permId, effect });
    });
    setPermsMutation.mutate({ roleId: selectedRoleId, permissions: perms });
  };

  const togglePerm = (permId: string) => {
    const current = effectivePerms.get(permId);
    const newMap = new Map(permChanges);
    if (!current) {
      newMap.set(permId, "allow");
    } else if (current === "allow") {
      newMap.set(permId, "deny");
    } else {
      newMap.set(permId, null);
    }
    setPermChanges(newMap);
  };

  const RESOURCE_TYPE_LABELS: Record<string, string> = {
    page: "الصفحات",
    section: "الأقسام",
    component: "المكونات",
    content_type: "أنواع المحتوى",
    task: "المهام",
    feature: "الميزات",
    api: "واجهات API",
    menu: "القوائم",
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            إدارة الأدوار والصلاحيات
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إنشاء وتعديل الأدوار وتعيين الصلاحيات التفصيلية</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> إنشاء دور جديد</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء دور جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالعربية</label>
                <Input value={newRole.name} onChange={(e) => setNewRole({ ...newRole, name: e.target.value })} placeholder="مثال: محلل بيانات" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالإنجليزية</label>
                <Input value={newRole.nameEn} onChange={(e) => setNewRole({ ...newRole, nameEn: e.target.value })} placeholder="e.g. Security Analyst" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الوصف</label>
                <Input value={newRole.description} onChange={(e) => setNewRole({ ...newRole, description: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground">الأولوية</label>
                  <Input type="number" value={newRole.priority} onChange={(e) => setNewRole({ ...newRole, priority: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">اللون</label>
                  <Input type="color" value={newRole.color} onChange={(e) => setNewRole({ ...newRole, color: e.target.value })} className="w-16 h-9" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
              <Button onClick={() => createMutation.mutate(newRole)} disabled={createMutation.isPending || !newRole.name || !newRole.nameEn}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">الأدوار</TabsTrigger>
          <TabsTrigger value="matrix" disabled={!selectedRoleId}>مصفوفة الصلاحيات</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث في الأدوار..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10" />
          </div>

          {rolesLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-3">
              {filteredRoles.map((role, i) => (
                <motion.div key={role.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className={`border transition-all cursor-pointer ${selectedRoleId === role.id ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-border"}`}
                    onClick={() => setSelectedRoleId(role.id)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (role.color ?? "#3b82f6") + "20", color: role.color ?? "#3b82f6" }}>
                          <Shield className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{role.name}</h3>
                            <span className="text-xs text-muted-foreground">({role.nameEn})</span>
                            {role.isSystem && <Badge variant="secondary" className="text-xs sm:text-[10px]">نظامي</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">أولوية: {role.priority}</Badge>
                          {!role.isSystem && (
                            <>
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditingRole(role); }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: role.id }); }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrix" className="space-y-4">
          {selectedRoleId && (
            <>
              <div className="flex items-center justify-between flex-wrap">
                <h2 className="text-lg font-semibold">
                  مصفوفة الصلاحيات — {roles?.find((r) => r.id === selectedRoleId)?.name}
                </h2>
                <Button onClick={handleSavePermissions} disabled={setPermsMutation.isPending || permChanges.size === 0} className="gap-2">
                  {setPermsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  حفظ التغييرات {permChanges.size > 0 && `(${permChanges.size})`}
                </Button>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-4 mb-2">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" /> مسموح</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" /> ممنوع</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-muted border border-border" /> غير محدد (ممنوع افتراضياً)</span>
              </div>

              {permsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(permsByType).map(([type, perms]) => (
                    <PermissionGroup
                      key={type}
                      type={type}
                      label={RESOURCE_TYPE_LABELS[type] ?? type}
                      permissions={perms}
                      effectivePerms={effectivePerms}
                      onToggle={togglePerm}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Role Dialog */}
      <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الدور</DialogTitle>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالعربية</label>
                <Input value={editingRole.name} onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالإنجليزية</label>
                <Input value={editingRole.nameEn} onChange={(e) => setEditingRole({ ...editingRole, nameEn: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الوصف</label>
                <Input value={editingRole.description ?? ""} onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm text-muted-foreground">الأولوية</label>
                  <Input type="number" value={editingRole.priority} onChange={(e) => setEditingRole({ ...editingRole, priority: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">اللون</label>
                  <Input type="color" value={editingRole.color ?? "#3b82f6"} onChange={(e) => setEditingRole({ ...editingRole, color: e.target.value })} className="w-16 h-9" />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRole(null)}>إلغاء</Button>
            <Button onClick={() => updateMutation.mutate(editingRole)} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PermissionGroup({
  type, label, permissions, effectivePerms, onToggle,
}: {
  type: string;
  label: string;
  permissions: Array<{ id: string; resourceId: string; resourceName: string; resourceNameEn: string | null; action: string }>;
  effectivePerms: Map<string, "allow" | "deny">;
  onToggle: (permId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);

  // Group by resourceId
  const byResource = useMemo(() => {
    const map = new Map<string, typeof permissions>();
    for (const p of permissions) {
      if (!map.has(p.resourceId)) map.set(p.resourceId, []);
      map.get(p.resourceId)!.push(p);
    }
    return map;
  }, [permissions]);

  return (
    <Card className="border border-border/50">
      <CardHeader className="p-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between flex-wrap">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {label}
            <Badge variant="outline" className="text-xs sm:text-[10px]">{permissions.length}</Badge>
          </CardTitle>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </CardHeader>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {Array.from(byResource.entries()).map(([resourceId, perms]) => (
                  <div key={resourceId} className="flex items-center gap-2 py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-sm min-w-[140px] text-foreground">{perms[0].resourceName}</span>
                    <span className="text-xs sm:text-[10px] text-muted-foreground min-w-[100px]">{perms[0].resourceNameEn}</span>
                    <div className="flex gap-1 mr-auto">
                      {perms.map((p) => {
                        const effect = effectivePerms.get(p.id);
                        return (
                          <button
                            key={p.id}
                            onClick={() => onToggle(p.id)}
                            className={`px-2 py-0.5 rounded text-xs sm:text-[10px] font-medium border transition-all ${
                              effect === "allow"
                                ? "bg-green-500/20 border-green-500/50 text-green-400"
                                : effect === "deny"
                                ? "bg-red-500/20 border-red-500/50 text-red-400"
                                : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
                            }`}
                            title={`${p.action}: ${effect ?? "غير محدد"}`}
                          >
                            {p.action === "view" ? "عرض" : p.action === "edit" ? "تعديل" : p.action === "enable" ? "تفعيل" : p.action === "disable" ? "تعطيل" : p.action === "manage" ? "إدارة" : p.action}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

```

---

## `client/src/pages/admin/AdminTheme.tsx`

```tsx
/**
 * Admin Theme Settings — Customize platform appearance
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Palette, Save, Loader2, RotateCcw, Sun, Moon, Type, Layout, Eye,
} from "lucide-react";
import { toast } from "sonner";

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  fontSizeBase: number;
  borderRadius: number;
  sidebarWidth: number;
  headerHeight: number;
  enableAnimations: boolean;
  enableGlassmorphism: boolean;
  enableParticles: boolean;
  logoUrl: string;
  logoUrlLight: string;
  faviconUrl: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "#273470",
  secondaryColor: "#6459A7",
  accentColor: "#3DB1AC",
  backgroundColor: "#0A192F",
  surfaceColor: "#112240",
  textColor: "#E2E8F0",
  fontFamily: "Tajawal",
  fontSizeBase: 16,
  borderRadius: 12,
  sidebarWidth: 280,
  headerHeight: 64,
  enableAnimations: true,
  enableGlassmorphism: true,
  enableParticles: true,
  logoUrl: "",
  logoUrlLight: "",
  faviconUrl: "",
};

const FONT_OPTIONS = [
  { value: "Tajawal", label: "Tajawal" },
  { value: "Cairo", label: "Cairo" },
  { value: "IBM Plex Sans Arabic", label: "IBM Plex Sans Arabic" },
  { value: "Noto Sans Arabic", label: "Noto Sans Arabic" },
  { value: "DIN Next Arabic", label: "DIN Next Arabic" },
];

export default function AdminTheme() {
  const utils = trpc.useUtils();
  const { data: themeSettings, isLoading } = trpc.admin.theme.getAll.useQuery();
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_THEME);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (themeSettings) {
      const settings: Record<string, any> = {};
      themeSettings.forEach((s: any) => {
        settings[s.settingKey] = s.settingValue;
      });
      setConfig({
        primaryColor: settings.primaryColor ?? DEFAULT_THEME.primaryColor,
        secondaryColor: settings.secondaryColor ?? DEFAULT_THEME.secondaryColor,
        accentColor: settings.accentColor ?? DEFAULT_THEME.accentColor,
        backgroundColor: settings.backgroundColor ?? DEFAULT_THEME.backgroundColor,
        surfaceColor: settings.surfaceColor ?? DEFAULT_THEME.surfaceColor,
        textColor: settings.textColor ?? DEFAULT_THEME.textColor,
        fontFamily: settings.fontFamily ?? DEFAULT_THEME.fontFamily,
        fontSizeBase: Number(settings.fontSizeBase ?? DEFAULT_THEME.fontSizeBase),
        borderRadius: Number(settings.borderRadius ?? DEFAULT_THEME.borderRadius),
        sidebarWidth: Number(settings.sidebarWidth ?? DEFAULT_THEME.sidebarWidth),
        headerHeight: Number(settings.headerHeight ?? DEFAULT_THEME.headerHeight),
        enableAnimations: settings.enableAnimations === "true" || settings.enableAnimations === true || settings.enableAnimations === undefined,
        enableGlassmorphism: settings.enableGlassmorphism === "true" || settings.enableGlassmorphism === true || settings.enableGlassmorphism === undefined,
        enableParticles: settings.enableParticles === "true" || settings.enableParticles === true || settings.enableParticles === undefined,
        logoUrl: settings.logoUrl ?? "",
        logoUrlLight: settings.logoUrlLight ?? "",
        faviconUrl: settings.faviconUrl ?? "",
      });
    }
  }, [themeSettings]);

  const saveMutation = trpc.admin.theme.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ إعدادات المظهر بنجاح");
      setHasChanges(false);
      utils.admin.theme.getAll.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleChange = (key: keyof ThemeConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const entries = Object.entries(config);
    for (const [key, value] of entries) {
      const category = key.includes("Color") || key.includes("color") ? "colors" as const
        : key.includes("font") || key.includes("Font") ? "typography" as const
        : key.includes("enable") ? "animations" as const
        : key.includes("logo") || key.includes("favicon") ? "layout" as const
        : "layout" as const;
      await saveMutation.mutateAsync({ id: `theme-${key}`, category, key, value: String(value) });
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_THEME);
    setHasChanges(true);
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Palette className="w-6 h-6 text-pink-400" />
            إعدادات المظهر
          </h1>
          <p className="text-muted-foreground text-sm mt-1">تخصيص ألوان وخطوط وتخطيط المنصة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> استعادة الافتراضي
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending || !hasChanges} className="gap-2">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colors */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" /> الألوان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "primaryColor" as const, label: "اللون الأساسي", labelEn: "Primary" },
                { key: "secondaryColor" as const, label: "اللون الثانوي", labelEn: "Secondary" },
                { key: "accentColor" as const, label: "لون التمييز", labelEn: "Accent" },
                { key: "backgroundColor" as const, label: "لون الخلفية", labelEn: "Background" },
                { key: "surfaceColor" as const, label: "لون السطح", labelEn: "Surface" },
                { key: "textColor" as const, label: "لون النص", labelEn: "Text" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={config[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{item.labelEn}</p>
                  </div>
                  <Input
                    value={config[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="w-28 font-mono text-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Typography */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-400" /> الخطوط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">نوع الخط</label>
                <Select value={config.fontFamily} onValueChange={(v) => handleChange("fontFamily", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">حجم الخط الأساسي (px)</label>
                <Input type="number" value={config.fontSizeBase} onChange={(e) => handleChange("fontSizeBase", Number(e.target.value))} min={12} max={24} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">نصف قطر الحواف (px)</label>
                <Input type="number" value={config.borderRadius} onChange={(e) => handleChange("borderRadius", Number(e.target.value))} min={0} max={24} />
              </div>
            </CardContent>
          </Card>

          {/* Layout */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layout className="w-4 h-4 text-green-400" /> التخطيط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">عرض الشريط الجانبي (px)</label>
                <Input type="number" value={config.sidebarWidth} onChange={(e) => handleChange("sidebarWidth", Number(e.target.value))} min={200} max={400} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ارتفاع الرأس (px)</label>
                <Input type="number" value={config.headerHeight} onChange={(e) => handleChange("headerHeight", Number(e.target.value))} min={48} max={96} />
              </div>
            </CardContent>
          </Card>

          {/* Effects */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" /> التأثيرات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "enableAnimations" as const, label: "الحركات والانتقالات", desc: "تفعيل الحركات والانتقالات في الواجهة" },
                { key: "enableGlassmorphism" as const, label: "تأثير الزجاج", desc: "تفعيل تأثير الشفافية الزجاجية" },
                { key: "enableParticles" as const, label: "تأثير الجسيمات", desc: "تفعيل خلفية الجسيمات المتحركة" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between flex-wrap">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs sm:text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={config[item.key]} onCheckedChange={(v) => handleChange(item.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Branding */}
          <Card className="border border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> العلامة التجارية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">رابط الشعار (الوضع الداكن)</label>
                  <Input value={config.logoUrl} onChange={(e) => handleChange("logoUrl", e.target.value)} placeholder="https://..." dir="ltr" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">رابط الشعار (الوضع الفاتح)</label>
                  <Input value={config.logoUrlLight} onChange={(e) => handleChange("logoUrlLight", e.target.value)} placeholder="https://..." dir="ltr" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">رابط الأيقونة (Favicon)</label>
                  <Input value={config.faviconUrl} onChange={(e) => handleChange("faviconUrl", e.target.value)} placeholder="https://..." dir="ltr" />
                </div>
              </div>
              {/* Preview */}
              <div className="flex gap-4 mt-2">
                {config.logoUrl && (
                  <div className="p-3 rounded-lg bg-gray-900 border border-border/30">
                    <img src={config.logoUrl} alt="Logo Dark" className="h-10 object-contain" />
                  </div>
                )}
                {config.logoUrlLight && (
                  <div className="p-3 rounded-lg bg-gray-100 border border-border/30">
                    <img src={config.logoUrlLight} alt="Logo Light" className="h-10 object-contain" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="border border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" /> معاينة حية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-xl overflow-hidden border border-border/30"
                style={{
                  backgroundColor: config.backgroundColor,
                  fontFamily: config.fontFamily,
                  fontSize: config.fontSizeBase,
                  borderRadius: config.borderRadius,
                }}
              >
                {/* Mini header */}
                <div className="flex items-center justify-between flex-wrap p-3 border-b" style={{ backgroundColor: config.surfaceColor, height: config.headerHeight * 0.6 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: config.primaryColor }} />
                    <span style={{ color: config.textColor, fontSize: 12 }}>منصة راصد</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: config.accentColor }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: config.secondaryColor }} />
                  </div>
                </div>
                {/* Mini content */}
                <div className="p-4 flex gap-3">
                  <div className="w-16 rounded-lg p-2" style={{ backgroundColor: config.surfaceColor }}>
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-2 rounded mb-2" style={{ backgroundColor: config.primaryColor + "40" }} />
                    ))}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: config.primaryColor }} />
                    <div className="h-2 rounded w-3/4" style={{ backgroundColor: config.textColor + "30" }} />
                    <div className="flex gap-2 mt-3">
                      <div className="px-3 py-1 rounded text-xs" style={{ backgroundColor: config.accentColor, color: "#fff" }}>زر رئيسي</div>
                      <div className="px-3 py-1 rounded text-xs border" style={{ borderColor: config.secondaryColor, color: config.secondaryColor }}>زر ثانوي</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

```

---

