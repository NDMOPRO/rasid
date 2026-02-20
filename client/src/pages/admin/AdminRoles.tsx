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
