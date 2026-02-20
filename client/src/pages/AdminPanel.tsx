import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { formatNumber, formatPercent } from "@/lib/formatters";
import {
  Users, Shield, UserCog, Crown, Loader2, UserPlus, Trash2, Phone, Mail, User,
  Activity, Settings, Search, Edit, Key, CheckCircle2, XCircle, Clock,
  BarChart3, Globe, ScanSearch, AlertTriangle, TrendingUp, Eye, FileText,
  Download, RefreshCw, Lock, Unlock, ChevronLeft, ChevronRight
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const rasidRoleLabels: Record<string, string> = {
  root_admin: "مدير النظام الرئيسي", root: "روت راصد", admin: "مدير النظام", smart_monitor_manager: "مدير راصد الذكي",
  monitoring_director: "مدير إدارة الرصد", monitoring_specialist: "أخصائي رصد",
  monitoring_officer: "مسؤول رصد", requester: "مقدم طلب", respondent: "مستجيب",
  ndmo_desk: "مكتب NDMO", legal_advisor: "مستشار قانوني", director: "مدير",
  board_secretary: "أمين مجلس", auditor: "مراجع",
};

const rasidRoleColors: Record<string, string> = {
  root_admin: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40",
  root: "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40",
  admin: "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-300 border-red-500/40",
  smart_monitor_manager: "bg-gradient-to-r from-primary/20 to-[oklch(0.48_0.14_290)]/20 text-primary border-primary/40",
  monitoring_director: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/40",
  monitoring_specialist: "bg-gradient-to-r from-emerald-500/20 to-blue-800/20 text-emerald-300 border-emerald-500/40",
  monitoring_officer: "bg-gradient-to-r from-zinc-500/20 to-slate-500/20 text-zinc-300 border-zinc-500/40",
};

const getRoleIcon = (role: string) => {
  const icons: Record<string, any> = { root_admin: Crown, root: Crown, admin: Shield, smart_monitor_manager: UserCog, monitoring_director: UserCog, monitoring_specialist: Eye, monitoring_officer: User };
  return icons[role] || User;
};

// Animated stat card
function StatCard({ icon: Icon, label, value, color, delay = 0 }: { icon: any; label: string; value: string | number; color: string; delay?: number }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 p-5 backdrop-blur-xl transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl`}
      style={{ animationDelay: `${delay}ms`, background: `linear-gradient(135deg, ${color}15, ${color}08)` }}>
      <WatermarkLogo />
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl" style={{ background: `${color}20` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <div className="text-end flex-1">
          <p className="text-base sm:text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl sm:text-2xl font-bold mt-1 gradient-text" style={{ color }}>{typeof value === 'number' ? formatNumber(value) : value}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { playClick, playHover } = useSoundEffects();
  const { user: currentUser } = useAuth();
  const { data: members, isLoading: membersLoading, refetch: refetchMembers } = trpc.members.list.useQuery();
  const { data: logs, isLoading: logsLoading } = trpc.activityLogs.list.useQuery({ limit: 50 });
  const { data: dashStats } = trpc.dashboard.stats.useQuery();

  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser, setEditUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", displayName: "", email: "", mobile: "", rasidRole: "" });
  const [resetPassUser, setResetPassUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: "", password: "", name: "", displayName: "", email: "", mobile: "", rasidRole: "monitoring_officer" });

  const updateDetails = trpc.adminUsers.updateDetails.useMutation({
    onSuccess: () => { toast.success("تم تحديث البيانات بنجاح"); setEditUser(null); refetchMembers(); },
    onError: (err) => toast.error(err.message),
  });
  const resetPassword = trpc.adminUsers.resetPassword.useMutation({
    onSuccess: () => { toast.success("تم إعادة تعيين كلمة المرور"); setResetPassUser(null); setNewPassword(""); },
    onError: (err) => toast.error(err.message),
  });
  const createUser = trpc.members.createUser.useMutation({
    onSuccess: () => { toast.success("تم إنشاء المستخدم بنجاح"); setCreateOpen(false); setNewUser({ username: "", password: "", name: "", displayName: "", email: "", mobile: "", rasidRole: "monitoring_officer" }); refetchMembers(); },
    onError: (err) => toast.error(err.message),
  });
  const deleteUser = trpc.members.deleteUser.useMutation({
    onSuccess: () => { toast.success("تم حذف المستخدم"); refetchMembers(); },
    onError: (err) => toast.error(err.message),
  });
  const updateRole = trpc.members.updateRole.useMutation({
    onSuccess: () => { toast.success("تم تحديث الصلاحية"); refetchMembers(); },
    onError: (err) => toast.error(err.message),
  });

  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "root_admin";

  const filteredMembers = useMemo(() => {
    if (!members) return [];
    return members.filter((m: any) => {
      const matchSearch = !searchQuery || m.name?.toLowerCase().includes(searchQuery.toLowerCase()) || m.username?.toLowerCase().includes(searchQuery.toLowerCase()) || m.email?.toLowerCase().includes(searchQuery.toLowerCase()) || m.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = roleFilter === "all" || m.rasidRole === roleFilter;
      return matchSearch && matchRole;
    });
  }, [members, searchQuery, roleFilter]);

  const stats = useMemo(() => {
    if (!members) return { total: 0, admins: 0, active: 0, roles: {} as Record<string, number> };
    const roles: Record<string, number> = {};
    members.forEach((m: any) => { roles[m.rasidRole || "monitoring_officer"] = (roles[m.rasidRole || "monitoring_officer"] || 0) + 1; });
    return {
      total: members.length,
      admins: members.filter((m: any) => m.role === "admin" || m.role === "root_admin").length,
      active: members.length,
      roles,
    };
  }, [members]);

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-3 sm:p-8 text-center border-red-500/30 bg-red-500/5 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-400">غير مصرح</h2>
          <p className="text-muted-foreground mt-2">هذه الصفحة متاحة فقط للمشرفين</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 overflow-x-hidden max-w-full" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-l from-blue-400 via-indigo-400 to-blue-800 bg-clip-text text-transparent">
            لوحة تحكم المشرف
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">إدارة المستخدمين والصلاحيات ومراقبة نشاط المنصة</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-gradient-to-l from-blue-600 to-cyan-600 hover:from-primary/90 hover:to-cyan-700 gap-2 w-full sm:w-auto">
          <UserPlus className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
          إضافة مستخدم
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard icon={Users} label="إجمالي المستخدمين" value={stats.total} color="#3b82f6" delay={0} />
        <StatCard icon={Shield} label="المشرفون" value={stats.admins} color="#ef4444" delay={100} />
        <StatCard icon={Globe} label="إجمالي المواقع" value={dashStats?.totalSites || 0} color="#10b981" delay={200} />
        <StatCard icon={ScanSearch} label="إجمالي الفحوصات" value={dashStats?.totalScans || 0} color="#8b5cf6" delay={300} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl">
        <TabsList className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border border-[#C5A55A]/10 dark:border-white/10 p-1 rounded-xl w-full justify-start gap-1">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 rounded-lg">
            <BarChart3 className="w-4 h-4 transition-transform duration-300 hover:scale-110" /> نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 rounded-lg">
            <Users className="w-4 h-4 transition-transform duration-300 hover:scale-110" /> المستخدمون
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 rounded-lg">
            <Activity className="w-4 h-4 transition-transform duration-300 hover:scale-110" /> سجل النشاط
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2 data-[state=active]:bg-gradient-to-l data-[state=active]:from-blue-600/20 data-[state=active]:to-cyan-600/20 rounded-lg">
            <Key className="w-4 h-4 transition-transform duration-300 hover:scale-110" /> الصلاحيات
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Role Distribution */}
          <Card className="border-[#C5A55A]/10 dark:border-white/10 bg-white dark:bg-white/[0.02] backdrop-blur-xl glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-blue-400" />
                توزيع الأدوار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 stagger-children">
                {Object.entries(stats.roles).map(([role, count], i) => {
                  const RoleIcon = getRoleIcon(role);
                  return (
                    <div key={role} className="relative overflow-hidden rounded-xl border border-[#C5A55A]/10 dark:border-white/10 p-4 hover:border-[#C5A55A]/20 dark:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                     >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${rasidRoleColors[role] || 'bg-zinc-500/10'}`}>
                          <RoleIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-end">
                          <p className="text-xs text-muted-foreground">{rasidRoleLabels[role] || role}</p>
                          <p className="text-xl font-bold">{formatNumber(count)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-[#C5A55A]/10 dark:border-white/10 bg-white dark:bg-white/[0.02] backdrop-blur-xl glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-emerald-400" />
                آخر النشاطات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {((logs as any)?.logs || []).slice(0, 15).map((log: any, i: number) => (
                    <div key={log.id || i} className="flex items-center gap-3 p-3 rounded-xl border border-[#C5A55A]/8 dark:border-white/5 hover:border-[#C5A55A]/10 dark:border-white/10 transition-all duration-200 hover:bg-white dark:bg-white/[0.02]">
                      <div className={`p-2 rounded-lg ${log.action?.includes('login') ? 'bg-emerald-500/10 text-emerald-400' : log.action?.includes('delete') ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                        {log.action?.includes('login') ? <CheckCircle2 className="w-4 h-4" /> : log.action?.includes('delete') ? <Trash2 className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.details || log.action}</p>
                        <p className="text-xs text-muted-foreground">{log.username} • {log.createdAt ? new Date(log.createdAt).toLocaleString('ar-SA-u-nu-latn') : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4 mt-6">
          {/* Search & Filter */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="بحث بالاسم أو اسم المستخدم أو البريد..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="pe-10 bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px] bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10">
                <SelectValue placeholder="فلتر حسب الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                {Object.entries(rasidRoleLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* User Cards */}
          {membersLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {filteredMembers.map((member: any, i: number) => {
                const RoleIcon = getRoleIcon(member.rasidRole || "monitoring_officer");
                return (
                  <Card key={member.id} className="border-[#C5A55A]/10 dark:border-white/10 bg-white dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden hover:border-[#C5A55A]/20 dark:border-white/20 transition-all duration-300 hover:scale-[1.01]"
                   >
                    <div className="h-1 bg-gradient-to-l from-blue-500 via-cyan-500 to-blue-800" />
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${rasidRoleColors[member.rasidRole] || 'bg-zinc-500/10'}`}>
                          <RoleIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg truncate">{member.displayName || member.name}</h3>
                          <p className="text-sm text-muted-foreground">@{member.username}</p>
                          <Badge variant="outline" className={`mt-2 text-xs ${rasidRoleColors[member.rasidRole] || ''}`}>
                            {rasidRoleLabels[member.rasidRole] || member.rasidRole || "مسؤول رصد"}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        {member.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{member.email}</span>
                          </div>
                        )}
                        {member.mobile && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            <span dir="ltr">{member.mobile}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4 pt-4 border-t border-[#C5A55A]/8 dark:border-white/5">
                        <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs border-[#C5A55A]/10 dark:border-white/10 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5"
                          onClick={() => { setEditUser(member); setEditForm({ name: member.name || "", displayName: member.displayName || "", email: member.email || "", mobile: member.mobile || "", rasidRole: member.rasidRole || "monitoring_officer" }); }}>
                          <Edit className="w-3 h-3" /> تعديل
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs border-[#C5A55A]/10 dark:border-white/10 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5"
                          onClick={() => setResetPassUser(member)}>
                          <Key className="w-3 h-3" /> كلمة المرور
                        </Button>
                        {member.username !== currentUser?.name && (
                          <Button size="sm" variant="outline" className="gap-1 text-xs border-red-500/20 text-red-400 hover:bg-red-500/10"
                            onClick={() => { if (confirm(`هل أنت متأكد من حذف ${member.displayName || member.name}؟`)) deleteUser.mutate({ userId: member.id }); }}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4 mt-6">
          <Card className="border-[#C5A55A]/10 dark:border-white/10 bg-white dark:bg-white/[0.02] backdrop-blur-xl glass-card gold-sweep">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                سجل النشاطات الكامل
              </CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></div>
              ) : (
                <div className="space-y-2">
                  {((logs as any)?.logs || []).map((log: any, i: number) => {
                    const actionColors: Record<string, string> = {
                      login: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                      logout: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
                      scan_start: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      scan_complete: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
                      user_create: "bg-primary/10 text-primary border-primary/20",
                      user_update: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                      user_delete: "bg-red-500/10 text-red-400 border-red-500/20",
                      password_reset_admin: "bg-orange-500/10 text-orange-400 border-orange-500/20",
                    };
                    const actionLabels: Record<string, string> = {
                      login: "تسجيل دخول", logout: "تسجيل خروج", scan_start: "بدء فحص",
                      scan_complete: "اكتمال فحص", user_create: "إنشاء مستخدم", user_update: "تحديث مستخدم",
                      user_delete: "حذف مستخدم", password_reset_admin: "إعادة تعيين كلمة مرور",
                      password_change: "تغيير كلمة مرور", case_create: "إنشاء حالة",
                    };
                    return (
                      <div key={log.id || i} className="flex items-center gap-3 p-3 rounded-xl border border-[#C5A55A]/8 dark:border-white/5 hover:border-[#C5A55A]/10 dark:border-white/10 transition-all duration-200">
                        <Badge variant="outline" className={`text-xs ${actionColors[log.action] || 'bg-zinc-500/10 text-zinc-400'}`}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{log.details || '-'}</p>
                        </div>
                        <div className="text-end">
                          <p className="text-xs font-medium">{log.username}</p>
                          <p className="text-xs text-muted-foreground">{log.createdAt ? new Date(log.createdAt).toLocaleString('ar-SA-u-nu-latn') : ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions" className="space-y-4 mt-6">
          <Card className="border-[#C5A55A]/10 dark:border-white/10 bg-white dark:bg-white/[0.02] backdrop-blur-xl glass-card gold-sweep">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                إدارة الصلاحيات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {members?.map((member: any) => {
                  const RoleIcon = getRoleIcon(member.rasidRole || "monitoring_officer");
                  return (
                    <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl border border-[#C5A55A]/8 dark:border-white/5 hover:border-[#C5A55A]/10 dark:border-white/10 transition-all">
                      <div className={`p-2 rounded-lg ${rasidRoleColors[member.rasidRole] || 'bg-zinc-500/10'}`}>
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{member.displayName || member.name}</p>
                        <p className="text-xs text-muted-foreground">@{member.username}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Select value={member.rasidRole || "monitoring_officer"}
                          onValueChange={(val) => updateRole.mutate({ userId: member.id, rasidRole: val })}>
                          <SelectTrigger className="w-[180px] bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(rasidRoleLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Badge variant={member.role === "admin" || member.role === "root_admin" ? "destructive" : "secondary"} className="text-xs">
                          {member.role === "root_admin" ? "مدير رئيسي" : member.role === "admin" ? "مشرف" : "مستخدم"}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-400" />
              تعديل بيانات المستخدم
            </DialogTitle>
            <DialogDescription>تعديل بيانات {editUser?.displayName || editUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>الاسم</Label><Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" /></div>
            <div><Label>الاسم المعروض</Label><Input value={editForm.displayName} onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" /></div>
            <div><Label>البريد الإلكتروني</Label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" /></div>
            <div><Label>الجوال</Label><Input value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" dir="ltr" /></div>
            <div>
              <Label>الدور</Label>
              <Select value={editForm.rasidRole} onValueChange={(val) => setEditForm({ ...editForm, rasidRole: val })}>
                <SelectTrigger className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(rasidRoleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>إلغاء</Button>
            <Button className="bg-gradient-to-l from-blue-600 to-cyan-600" onClick={() => updateDetails.mutate({ userId: editUser.id, ...editForm })}
              disabled={updateDetails.isPending}>
              {updateDetails.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetPassUser} onOpenChange={() => setResetPassUser(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              إعادة تعيين كلمة المرور
            </DialogTitle>
            <DialogDescription>إعادة تعيين كلمة مرور {resetPassUser?.displayName || resetPassUser?.name}</DialogDescription>
          </DialogHeader>
          <div>
            <Label>كلمة المرور الجديدة</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="أدخل كلمة المرور الجديدة" className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPassUser(null)}>إلغاء</Button>
            <Button className="bg-gradient-to-l from-amber-600 to-orange-600" onClick={() => resetPassword.mutate({ userId: resetPassUser.id, newPassword })}
              disabled={resetPassword.isPending || newPassword.length < 6}>
              {resetPassword.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "تعيين"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              إضافة مستخدم جديد
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); createUser.mutate(newUser); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-3 stagger-children">
              <div><Label>اسم المستخدم *</Label><Input value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" /></div>
              <div><Label>كلمة المرور *</Label><Input type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3 stagger-children">
              <div><Label>الاسم *</Label><Input value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" /></div>
              <div><Label>الاسم المعروض *</Label><Input value={newUser.displayName} onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" /></div>
            </div>
            <div><Label>البريد الإلكتروني *</Label><Input value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" /></div>
            <div><Label>الجوال</Label><Input value={newUser.mobile} onChange={(e) => setNewUser({ ...newUser, mobile: e.target.value })} className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10" dir="ltr" /></div>
            <div>
              <Label>الدور</Label>
              <Select value={newUser.rasidRole} onValueChange={(val) => setNewUser({ ...newUser, rasidRole: val })}>
                <SelectTrigger className="bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(rasidRoleLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>إلغاء</Button>
              <Button type="submit" className="bg-gradient-to-l from-emerald-600 to-blue-900" disabled={createUser.isPending}>
                {createUser.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
