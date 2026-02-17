import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User, Mail, Phone, Shield, Key, Clock, Save, Loader2, CheckCircle, AlertCircle,
  Bell, BellOff, Monitor, Smartphone, LogOut, Trash2, Activity, BarChart3,
  FileText, Globe, Scan, TrendingUp, Calendar, Award, Zap, Eye
} from "lucide-react";
import { toast } from "sonner";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

import { CHARACTER_STANDING_SHMAGH } from "@/lib/rasidAssets";
const CHARACTER = CHARACTER_STANDING_SHMAGH;

const RASID_ROLE_LABELS: Record<string, string> = {
  root: "مسؤول النظام الرئيسي",
  admin: "مسؤول النظام",
  smart_monitor_manager: "مدير المنصة الذكية",
  monitoring_director: "مدير الرصد",
  monitoring_specialist: "أخصائي رصد",
  monitoring_officer: "مسؤول رصد",
  requester: "مقدم طلب",
  respondent: "مستجيب",
  ndmo_desk: "مكتب NDMO",
  legal_advisor: "مستشار قانوني",
  director: "مدير",
  board_secretary: "أمين مجلس",
  auditor: "مدقق",
};

export default function ProfilePage() {
  const { playClick, playHover } = useSoundEffects();
  const { user: authUser } = useAuth();
  const { data: profile, isLoading, refetch } = trpc.account.profile.useQuery();
  const { data: profileStats } = trpc.account.profileStats.useQuery();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || "");
      setEmail(profile.email || "");
      setMobile(profile.mobile || "");
    }
  }, [profile]);

  const updateProfileMutation = trpc.account.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الملف الشخصي بنجاح");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const changePasswordMutation = trpc.account.changePassword.useMutation({
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({
      displayName: displayName || undefined,
      email: email || undefined,
      mobile: mobile || undefined,
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (isLoading) {
    return (
    <div className="flex items-center justify-center h-64">
      <WatermarkLogo />
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping btn-glow" />
          <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
        </div>
      </div>
    );
  }

  const userInitial = (profile?.displayName || profile?.name || "U").charAt(0).toUpperCase();
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long" })
    : "---";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* ─── Hero Profile Card ─── */}
      <div className="relative overflow-hidden rounded-2xl glass-card gold-sweep border-primary/10">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/15 via-primary/10 to-transparent" />
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl -translate-x-1/2 -translate-y-1/2 btn-glow" />
        <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full bg-primary/10 blur-3xl translate-x-1/4 translate-y-1/4 btn-glow" />

        <div className="relative p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar with animated ring */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary via-primary to-primary animate-spin-slow opacity-60 blur-sm group-hover:opacity-100 transition-opacity" style={{ animationDuration: '6s' }} />
              <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-4 border-background shadow-2xl">
                <img
                  src={CHARACTER}
                  alt="صورة المستخدم"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-3 border-background flex items-center justify-center shadow-lg">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-end">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight gradient-text">
                {profile?.displayName || profile?.name || "مستخدم"}
              </h1>
              <p className="text-muted-foreground mt-1">@{profile?.username || "---"}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/25 transition-colors btn-glow">
                  <Shield className="h-3 w-3 ms-1 card-icon" />
                  {profile?.role === "admin" ? "مسؤول النظام" : "مستخدم"}
                </Badge>
                {profile?.rasidRole && (
                  <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25 transition-colors">
                    <Award className="h-3 w-3 ms-1 card-icon" />
                    {RASID_ROLE_LABELS[profile.rasidRole] || profile.rasidRole}
                  </Badge>
                )}

              </div>

              {/* Quick Stats Row */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  <span>عضو منذ {memberSince}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-primary" />
                  <span>{profile?.loginMethod === "builtin" ? "كلمة مرور" : "OAuth"}</span>
                </div>
                {profile?.lastSignedIn && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span>آخر دخول: {new Date(profile.lastSignedIn).toLocaleDateString("ar-SA-u-nu-latn", { month: "short", day: "numeric" })}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Stats Cards */}
            <div className="grid grid-cols-2 gap-3 shrink-0 stagger-children">
              <ActivityStatCard icon={Scan} label="الفحوصات" value={String(profileStats?.totalScans ?? '--')} color="text-blue-400" bgColor="bg-blue-500/10" />
              <ActivityStatCard icon={FileText} label="الوثائق" value={String(profileStats?.totalDocs ?? '--')} color="text-emerald-400" bgColor="bg-emerald-500/10" />
              <ActivityStatCard icon={Globe} label="المواقع" value={String(profileStats?.totalSites ?? '--')} color="text-amber-400" bgColor="bg-amber-500/10" />
              <ActivityStatCard icon={Activity} label="الأنشطة" value={String(profileStats?.totalActivities ?? '--')} color="text-primary" bgColor="bg-primary/10" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <Tabs defaultValue="info" dir="rtl">
        <TabsList className="glass-card gold-sweep border-primary/10 p-1 h-auto flex-wrap">
          <TabsTrigger value="info" className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary btn-glow">
            <User className="h-3.5 w-3.5" /> المعلومات
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary btn-glow">
            <Shield className="h-3.5 w-3.5" /> الأمان
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary btn-glow">
            <Bell className="h-3.5 w-3.5" /> الإشعارات
          </TabsTrigger>
          <TabsTrigger value="sessions" className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary btn-glow">
            <Monitor className="h-3.5 w-3.5" /> الجلسات
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 data-[state=active]:bg-primary/15 data-[state=active]:text-primary btn-glow">
            <Activity className="h-3.5 w-3.5" /> النشاط
          </TabsTrigger>
        </TabsList>

        {/* ─── Personal Info Tab ─── */}
        <TabsContent value="info" className="space-y-4 mt-4">
          <Card className="glass-card gold-sweep border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary card-icon" />
                المعلومات الشخصية
              </CardTitle>
              <CardDescription>تعديل الاسم المعروض والبريد الإلكتروني ورقم الجوال</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label htmlFor="username" className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" /> اسم المستخدم
                  </Label>
                  <Input id="username" value={profile?.username || ""} disabled className="bg-muted/50 border-border/30" />
                  <p className="text-xs text-muted-foreground">لا يمكن تغيير اسم المستخدم</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" /> الاسم الكامل
                  </Label>
                  <Input id="name" value={profile?.name || ""} disabled className="bg-muted/50 border-border/30" />
                  <p className="text-xs text-muted-foreground">الاسم المسجل في النظام</p>
                </div>
              </div>

              <Separator className="bg-border/30" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-primary" /> الاسم المعروض
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="الاسم الذي يظهر في المنصة"
                    className="border-border/30 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-primary" /> البريد الإلكتروني
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@domain.com"
                    dir="ltr"
                    className="border-border/30 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile" className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-primary" /> رقم الجوال
                  </Label>
                  <Input
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+966XXXXXXXXX"
                    dir="ltr"
                    className="border-border/30 focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={updateProfileMutation.isPending}
                  className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 btn-glow"
                >
                  {updateProfileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 btn-icon" />
                  )}
                  حفظ التغييرات
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Security Tab ─── */}
        <TabsContent value="security" className="space-y-4 mt-4">
          <Card className="glass-card gold-sweep border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="h-5 w-5 text-primary card-icon" />
                تغيير كلمة المرور
              </CardTitle>
              <CardDescription>تأكد من استخدام كلمة مرور قوية لا تقل عن 6 أحرف</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile?.loginMethod !== "builtin" ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm">تم تسجيل دخولك عبر OAuth. لا يمكن تغيير كلمة المرور من هنا.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور الحالية"
                      dir="ltr"
                      className="border-border/30 focus:border-primary/50"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="أدخل كلمة المرور الجديدة"
                        dir="ltr"
                        className="border-border/30 focus:border-primary/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="أعد إدخال كلمة المرور الجديدة"
                        dir="ltr"
                        className="border-border/30 focus:border-primary/50"
                      />
                    </div>
                  </div>
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> كلمة المرور غير متطابقة
                    </p>
                  )}
                  {newPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
                    <p className="text-sm text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> كلمة المرور متطابقة
                    </p>
                  )}
                  <div className="flex justify-end pt-4">
                    <Button
                      onClick={handleChangePassword}
                      disabled={changePasswordMutation.isPending || !currentPassword || !newPassword || newPassword !== confirmPassword}
                      className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 btn-glow"
                    >
                      {changePasswordMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Key className="h-4 w-4 btn-icon" />
                      )}
                      تغيير كلمة المرور
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="glass-card gold-sweep border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary card-icon" />
                معلومات الحساب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <InfoRow label="معرف الحساب" value={String(profile?.id || "---")} mono />
                <InfoRow label="طريقة الدخول" value={profile?.loginMethod === "builtin" ? "كلمة مرور" : "OAuth"} />
                <InfoRow label="تاريخ الإنشاء" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("ar-SA-u-nu-latn") : "---"} />
                <InfoRow label="آخر تسجيل دخول" value={profile?.lastSignedIn ? new Date(profile.lastSignedIn).toLocaleDateString("ar-SA-u-nu-latn") : "---"} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Notifications Tab ─── */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <NotificationPreferences />
        </TabsContent>

        {/* ─── Sessions Tab ─── */}
        <TabsContent value="sessions" className="space-y-4 mt-4">
          <SessionManagement />
        </TabsContent>

        {/* ─── Activity Tab ─── */}
        <TabsContent value="activity" className="space-y-4 mt-4">
          <ActivityLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─── Activity Stat Mini Card ─── */
function ActivityStatCard({ icon: Icon, label, value, color, bgColor }: {
  icon: any; label: string; value: string; color: string; bgColor: string;
}) {
  return (
    <div className="glass-card gold-sweep rounded-xl p-3 border-primary/5 text-center min-w-[90px] group hover:border-primary/20 transition-all duration-300">
      <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center mx-auto mb-1.5`}>
        <Icon className={`h-4 w-4 ${color} card-icon`} />
      </div>
      <p className="text-lg font-bold stat-number">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

/* ─── Info Row ─── */
function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between p-3 rounded-xl glass-surface border-primary/5 hover:border-primary/15 transition-colors">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono text-xs" : ""}>{value}</span>
    </div>
  );
}

/* ─── Activity Log ─── */
function ActivityLog() {
  const { data: activities, isLoading } = trpc.activityLogs.list.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <Card className="glass-card gold-sweep border-primary/10">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          جاري تحميل سجل النشاط...
        </CardContent>
      </Card>
    );
  }

  const logs = (activities && 'logs' in activities ? activities.logs : activities) || [];

  return (
    <Card className="glass-card gold-sweep border-primary/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary card-icon" />
          سجل النشاط
        </CardTitle>
        <CardDescription>آخر 20 نشاط على حسابك</CardDescription>
      </CardHeader>
      <CardContent>
        {(logs as any[]).length === 0 ? (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">لا يوجد نشاط مسجل</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(logs as any[]).map((log: any, idx: number) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 rounded-xl glass-surface border-primary/5 hover:border-primary/15 transition-all duration-300 group"
               
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors btn-glow">
                  <Zap className="h-4 w-4 text-primary card-icon" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{log.action}</span>
                    <span className="text-xs text-muted-foreground">
                      {log.createdAt ? new Date(log.createdAt).toLocaleDateString("ar-SA-u-nu-latn", {
                        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                      }) : ""}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Notification Preferences ─── */
function NotificationPreferences() {
  const { data: profile, refetch } = trpc.account.profile.useQuery();
  const utils = trpc.useUtils();

  const updateNotificationsMutation = trpc.account.updateEmailNotifications.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث إعدادات الإشعارات");
      refetch();
      utils.account.profile.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const emailEnabled = (profile as any)?.emailNotifications ?? false;

  return (
    <Card className="glass-card gold-sweep border-primary/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary card-icon" />
          إعدادات الإشعارات
        </CardTitle>
        <CardDescription>التحكم في إشعارات البريد الإلكتروني التلقائية</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-xl glass-surface border-primary/5 hover:border-primary/15 transition-all">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl transition-colors ${emailEnabled ? 'bg-emerald-500/15' : 'bg-muted/50'}`}>
              {emailEnabled ? <Bell className="h-5 w-5 text-emerald-400 card-icon" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
            </div>
            <div>
              <p className="font-medium text-sm">إشعارات تغيّر الامتثال</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                استلام بريد إلكتروني عند تغيّر حالة امتثال المواقع المراقبة
              </p>
            </div>
          </div>
          <Button
            variant={emailEnabled ? "default" : "outline"}
            size="sm"
            onClick={() => updateNotificationsMutation.mutate({ enabled: !emailEnabled })}
            disabled={updateNotificationsMutation.isPending}
            className={`gap-2 ${emailEnabled ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20' : ''}`}
          >
            {updateNotificationsMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : emailEnabled ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
            {emailEnabled ? "مفعّل" : "معطّل"}
          </Button>
        </div>

        <div className="p-4 rounded-xl glass-surface border-primary/5 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            ما الذي ستتلقاه؟
          </p>
          <ul className="list-disc list-inside space-y-1 me-2">
            <li>تنبيه عند تحسّن أو تراجع حالة امتثال موقع مراقب</li>
            <li>تفاصيل التغيير (الحالة السابقة والجديدة ونسبة التغيير)</li>
            <li>تنبيهات خاصة عند اكتشاف مواقع غير ممتثلة أو لا تعمل</li>
          </ul>
          <p className="text-xs mt-3">
            <strong>ملاحظة:</strong> يجب إضافة بريد إلكتروني صحيح في المعلومات الشخصية لاستلام الإشعارات.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Session Management ─── */
function SessionManagement() {
  const { data: sessions, isLoading, refetch } = trpc.account.sessions.useQuery();

  const terminateSessionMutation = trpc.account.terminateSession.useMutation({
    onSuccess: () => {
      toast.success("تم إنهاء الجلسة بنجاح");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const terminateAllMutation = trpc.account.terminateAllSessions.useMutation({
    onSuccess: () => {
      toast.success("تم إنهاء جميع الجلسات");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <Card className="glass-card gold-sweep border-primary/10">
        <CardContent className="p-8 text-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
          جاري تحميل الجلسات...
        </CardContent>
      </Card>
    );
  }

  const sessionList = sessions || [];

  const getDeviceIcon = (deviceInfo: string) => {
    const lower = (deviceInfo || '').toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return <Smartphone className="h-4 w-4 text-primary" />;
    }
    return <Monitor className="h-4 w-4 text-primary" />;
  };

  const getDeviceName = (deviceInfo: string) => {
    if (!deviceInfo) return 'جهاز غير معروف';
    if (deviceInfo.includes('Chrome')) return 'Google Chrome';
    if (deviceInfo.includes('Firefox')) return 'Mozilla Firefox';
    if (deviceInfo.includes('Safari') && !deviceInfo.includes('Chrome')) return 'Safari';
    if (deviceInfo.includes('Edge')) return 'Microsoft Edge';
    return deviceInfo.substring(0, 50);
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card gold-sweep border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary card-icon" />
                الجلسات النشطة
              </CardTitle>
              <CardDescription>إدارة الأجهزة المتصلة بحسابك</CardDescription>
            </div>
            {sessionList.length > 1 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => terminateAllMutation.mutate()}
                disabled={terminateAllMutation.isPending}
                className="gap-2 shadow-lg shadow-red-500/20"
              >
                {terminateAllMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                إنهاء الكل
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {sessionList.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد جلسات نشطة مسجلة</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessionList.map((session: any) => (
                <div key={session.id} className="flex items-center justify-between p-4 rounded-xl glass-surface border-primary/5 hover:border-primary/15 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors btn-glow">
                      {getDeviceIcon(session.deviceInfo)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{getDeviceName(session.deviceInfo)}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span>{session.ipAddress || 'IP غير معروف'}</span>
                        <span className="text-border">|</span>
                        <span>آخر نشاط: {session.lastActivity ? new Date(session.lastActivity).toLocaleDateString("ar-SA-u-nu-latn", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "---"}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => terminateSessionMutation.mutate({ sessionId: session.id })}
                    disabled={terminateSessionMutation.isPending}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1"
                  >
                    <LogOut className="h-4 w-4" />
                    إنهاء
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
