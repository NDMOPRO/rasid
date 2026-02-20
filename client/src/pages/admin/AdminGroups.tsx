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
