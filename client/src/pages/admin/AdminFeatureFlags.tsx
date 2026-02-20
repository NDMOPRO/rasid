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
