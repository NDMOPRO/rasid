import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Users, Shield, UserCog, Eye, UserCheck, Crown, Loader2, UserPlus, Trash2, Phone, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const rasidRoleLabels: Record<string, string> = {
  root: "روت راصد",
  admin: "مدير النظام",
  smart_monitor_manager: "مدير راصد الذكي",
  monitoring_director: "مدير إدارة الرصد",
  monitoring_specialist: "أخصائي رصد",
  monitoring_officer: "مسؤول رصد",
};

const rasidRoleIcons: Record<string, any> = {
  root: Crown,
  admin: Shield,
  smart_monitor_manager: UserCog,
  monitoring_director: UserCog,
  monitoring_specialist: Eye,
  monitoring_officer: UserCheck,
};

const rasidRoleColors: Record<string, string> = {
  root: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  admin: "text-red-400 bg-red-500/10 border-red-500/30",
  smart_monitor_manager: "text-primary bg-primary/10 border-primary/30",
  monitoring_director: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  monitoring_specialist: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  monitoring_officer: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30",
};

export default function Members() {
  const { playClick, playHover } = useSoundEffects();
  const { user: currentUser } = useAuth();
  const { data: members, isLoading, refetch } = trpc.members.list.useQuery();
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "", password: "", name: "", displayName: "",
    email: "", mobile: "", rasidRole: "monitoring_officer",
  });

  const updateRole = trpc.members.updateRole.useMutation({
    onSuccess: () => { toast.success("تم تحديث الصلاحية بنجاح"); refetch(); },
    onError: (err) => { toast.error(err.message); },
  });

  const createUser = trpc.members.createUser.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المستخدم بنجاح");
      setCreateOpen(false);
      setNewUser({ username: "", password: "", name: "", displayName: "", email: "", mobile: "", rasidRole: "monitoring_officer" });
      refetch();
    },
    onError: (err) => { toast.error(err.message); },
  });

  const deleteUser = trpc.members.deleteUser.useMutation({
    onSuccess: () => { toast.success("تم حذف المستخدم بنجاح"); refetch(); },
    onError: (err) => { toast.error(err.message); },
  });

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "root_admin";

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.name || !newUser.displayName || !newUser.email) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    createUser.mutate(newUser);
  };

  return (
    <div
      className="overflow-x-hidden max-w-full space-y-6 p-6" dir="rtl">
      <WatermarkLogo />
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2D5F8A] flex items-center justify-center shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground gradient-text">العضويات</h1>
            <p className="text-sm text-muted-foreground">إدارة الأعضاء والصلاحيات</p>
          </div>
        </div>
        {isAdmin && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-l from-[#1E3A5F] to-[#2D5F8A] text-white hover:opacity-90">
                <UserPlus className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                إضافة مستخدم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-[#1E3A5F]" />
                  إنشاء مستخدم جديد
                </DialogTitle>
                <DialogDescription>
                  أدخل بيانات المستخدم الجديد لإضافته إلى المنصة
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 stagger-children">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      اسم المستخدم *
                    </Label>
                    <Input
                      placeholder="مثال: username"
                      value={newUser.username}
                      onChange={(e) => setNewUser(p => ({ ...p, username: e.target.value }))}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5" />
                      كلمة المرور *
                    </Label>
                    <Input
                      type="password"
                      placeholder="6 أحرف على الأقل"
                      value={newUser.password}
                      onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
                      required
                      minLength={6}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 stagger-children">
                  <div className="space-y-2">
                    <Label>الاسم الكامل *</Label>
                    <Input
                      placeholder="الاسم الكامل"
                      value={newUser.name}
                      onChange={(e) => setNewUser(p => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>الاسم المعروض *</Label>
                    <Input
                      placeholder="الاسم المعروض في المنصة"
                      value={newUser.displayName}
                      onChange={(e) => setNewUser(p => ({ ...p, displayName: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 stagger-children">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      البريد الإلكتروني *
                    </Label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                      required
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      الجوال
                    </Label>
                    <Input
                      placeholder="+966XXXXXXXXX"
                      value={newUser.mobile}
                      onChange={(e) => setNewUser(p => ({ ...p, mobile: e.target.value }))}
                      dir="ltr"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الصلاحية *</Label>
                  <Select
                    value={newUser.rasidRole}
                    onValueChange={(v) => setNewUser(p => ({ ...p, rasidRole: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(rasidRoleLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                    إلغاء
                  </Button>
                  <Button
                    type="submit"
                    disabled={createUser.isPending}
                    className="bg-gradient-to-l from-[#1E3A5F] to-[#2D5F8A] text-white"
                  >
                    {createUser.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الإنشاء...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                        إنشاء المستخدم
                      </span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Role Legend */}
      <Card className="border-border/50 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-3">مستويات الصلاحيات</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 stagger-children">
            {Object.entries(rasidRoleLabels).map(([key, label]) => {
              const Icon = rasidRoleIcons[key] || Users;
              const colorClass = rasidRoleColors[key] || "";
              return (
                <div key={key} className={`flex items-center gap-2 text-xs p-2 rounded-lg border ${colorClass}`}>
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="font-medium">{label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Members Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        <Card className="border-border/50 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[#1E3A5F]">{members?.length || 0}</div>
            <div className="text-xs text-muted-foreground mt-1">إجمالي الأعضاء</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">
              {members?.filter((m: any) => m.rasidRole === 'admin' || m.rasidRole === 'root').length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">مديرون</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 glass-card gold-sweep">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-500">
              {members?.filter((m: any) => m.rasidRole === 'monitoring_specialist').length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">أخصائيون</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 glass-card gold-sweep">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-zinc-500">
              {members?.filter((m: any) => m.rasidRole === 'monitoring_officer').length || 0}
            </div>
            <div className="text-xs text-muted-foreground mt-1">مسؤولون</div>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card className="border-border/50 shadow-lg glass-card gold-sweep">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-3 sm:p-8 text-center text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              جاري التحميل...
            </div>
          ) : members?.length === 0 ? (
            <div className="p-4 sm:p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا يوجد أعضاء</h3>
              <p className="text-sm text-muted-foreground">سيظهر الأعضاء هنا عند تسجيل دخولهم</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(197,165,90,0.12)] bg-[rgba(197,165,90,0.04)]">
                    <th className="text-end py-3 px-4 font-medium text-muted-foreground">#</th>
                    <th className="text-end py-3 px-4 font-medium text-muted-foreground">الاسم</th>
                    <th className="text-end py-3 px-4 font-medium text-muted-foreground">اسم المستخدم</th>
                    <th className="text-end py-3 px-4 font-medium text-muted-foreground">البريد</th>
                    <th className="text-end py-3 px-4 font-medium text-muted-foreground">الجوال</th>
                    <th className="text-end py-3 px-4 font-medium text-muted-foreground">الصلاحية</th>
                    <th className="text-end py-3 px-4 font-medium text-muted-foreground">آخر دخول</th>
                    {isAdmin && <th className="text-end py-3 px-4 font-medium text-muted-foreground">تعديل</th>}
                    {isAdmin && <th className="text-end py-3 px-4 font-medium text-muted-foreground">إجراء</th>}
                  </tr>
                </thead>
                <tbody>
                  {(members || []).map((member: any, idx: number) => {
                    const role = member.rasidRole || "monitoring_officer";
                    const Icon = rasidRoleIcons[role] || Users;
                    const colorClass = rasidRoleColors[role] || "";
                    const colorParts = colorClass.split(" ");
                    const isSelf = member.openId === currentUser?.openId;
                    return (
                      <tr key={member.id} className="border-b border-border/30 hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200">
                        <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${colorParts[1] || 'bg-zinc-500/10'}`}>
                              {(member.displayName || member.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-medium block">{member.displayName || member.name || "-"}</span>
                              {member.displayName && member.name && member.displayName !== member.name && (
                                <span className="text-xs text-muted-foreground">{member.name}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs font-mono">{member.username || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">{member.email || "-"}</td>
                        <td className="py-3 px-4 text-muted-foreground text-xs" dir="ltr">{member.mobile || "-"}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`gap-1 ${colorParts[0] || ''} ${colorParts[2] || ''}`}>
                            <Icon className="h-3 w-3" />
                            {rasidRoleLabels[role] || role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {member.lastSignedIn ? new Date(member.lastSignedIn).toLocaleDateString("ar-SA-u-nu-latn") : "-"}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4">
                            <Select
                              value={role}
                              onValueChange={(newRole) => {
                                updateRole.mutate({ userId: member.id, rasidRole: newRole });
                              }}
                              disabled={isSelf}
                            >
                              <SelectTrigger className="w-44 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(rasidRoleLabels).map(([key, label]) => (
                                  <SelectItem key={key} value={key}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        )}
                        {isAdmin && (
                          <td className="py-3 px-4">
                            {!isSelf ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-900/20 h-8 w-8 p-0">
                                    <Trash2 className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent dir="rtl">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>حذف المستخدم</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      هل أنت متأكد من حذف المستخدم "{member.displayName || member.name}"؟ لا يمكن التراجع عن هذا الإجراء.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-2 sm:gap-0">
                                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteUser.mutate({ userId: member.id })}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      حذف
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
