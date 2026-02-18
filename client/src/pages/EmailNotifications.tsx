import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Mail, Bell, BellRing, Shield, ShieldAlert, AlertTriangle, CheckCircle2, Send, Settings2,
  Trash2, TestTube2, Zap, Filter, Save, MailCheck, MailX, Loader2
} from "lucide-react";
import { formatNumber } from "@/lib/formatters";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

export default function EmailNotifications() {
  const { playClick, playHover } = useSoundEffects();
  const { data: prefs, isLoading, refetch } = trpc.emailNotifications.getPrefs.useQuery();
  const saveMutation = trpc.emailNotifications.savePrefs.useMutation();
  const deleteMutation = trpc.emailNotifications.deletePrefs.useMutation();
  const testMutation = trpc.emailNotifications.testEmail.useMutation();

  const [email, setEmail] = useState("");
  const [notifyStatusChange, setNotifyStatusChange] = useState(true);
  const [notifyScoreChange, setNotifyScoreChange] = useState(true);
  const [notifyNewScan, setNotifyNewScan] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [threshold, setThreshold] = useState(10);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (prefs) {
      setEmail(prefs.emailAddress || "");
      setNotifyStatusChange(prefs.notifyOnStatusChange ?? true);
      setNotifyScoreChange(prefs.notifyOnScoreChange ?? true);
      setNotifyNewScan(prefs.notifyOnNewScan ?? false);
      setCriticalOnly(prefs.notifyOnCriticalOnly ?? false);
      setThreshold(prefs.minScoreChangeThreshold ?? 10);
      setIsActive(prefs.isActive ?? true);
    }
  }, [prefs]);

  const handleSave = async () => {
    if (!email || !email.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    try {
      await saveMutation.mutateAsync({
        emailAddress: email,
        notifyOnStatusChange: notifyStatusChange,
        notifyOnScoreChange: notifyScoreChange,
        notifyOnNewScan: notifyNewScan,
        notifyOnCriticalOnly: criticalOnly,
        minScoreChangeThreshold: threshold,
        isActive,
      });
      toast.success("تم حفظ إعدادات الإشعارات بنجاح");
      refetch();
    } catch {
      toast.error("فشل في حفظ الإعدادات");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      toast.success("تم حذف إعدادات الإشعارات");
      setEmail("");
      setNotifyStatusChange(true);
      setNotifyScoreChange(true);
      setNotifyNewScan(false);
      setCriticalOnly(false);
      setThreshold(10);
      setIsActive(true);
      refetch();
    } catch {
      toast.error("فشل في حذف الإعدادات");
    }
  };

  const handleTest = async () => {
    if (!email || !email.includes("@")) {
      toast.error("يرجى إدخال بريد إلكتروني صحيح أولاً");
      return;
    }
    try {
      const result = await testMutation.mutateAsync({ emailAddress: email });
      if (result.success) {
        toast.success("تم إرسال بريد الاختبار بنجاح");
      } else {
        toast.error(result.error || "فشل في إرسال بريد الاختبار");
      }
    } catch {
      toast.error("فشل في إرسال بريد الاختبار");
    }
  };

  if (isLoading) {
    return (
    <div className="p-6 space-y-6">
      <WatermarkLogo />
        <div className="h-8 w-64 bg-muted/50 rounded-lg animate-pulse" />
        <div className="h-96 bg-muted/30 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/25">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">إشعارات البريد الإلكتروني</h1>
            <p className="text-muted-foreground text-sm">إعداد تنبيهات تلقائية عند تغير حالة امتثال المواقع</p>
          </div>
        </div>
        <Badge variant={isActive && prefs ? "default" : "secondary"} className="gap-1 px-3 py-1.5">
          {isActive && prefs ? <BellRing className="h-3.5 w-3.5" /> : <MailX className="h-3.5 w-3.5" />}
          {isActive && prefs ? "مفعّل" : "غير مفعّل"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Address */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MailCheck className="h-5 w-5 text-primary" />
                البريد الإلكتروني
              </CardTitle>
              <CardDescription>أدخل البريد الإلكتروني لاستقبال الإشعارات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  dir="ltr"
                />
                <Button variant="outline" onClick={handleTest} disabled={testMutation.isPending} className="gap-2">
                  {testMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <TestTube2 className="h-4 w-4" />}
                  اختبار
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <Label>تفعيل الإشعارات</Label>
                </div>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
            </CardContent>
          </Card>

          {/* Notification Types */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                أنواع الإشعارات
              </CardTitle>
              <CardDescription>اختر الأحداث التي تريد تلقي إشعارات عنها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-950/30">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <Label className="font-medium">تغيير حالة الامتثال</Label>
                    <p className="text-xs text-muted-foreground">إشعار عند تغير حالة امتثال أي موقع</p>
                  </div>
                </div>
                <Switch checked={notifyStatusChange} onCheckedChange={setNotifyStatusChange} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-950/30">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <Label className="font-medium">تغيير الدرجة</Label>
                    <p className="text-xs text-muted-foreground">إشعار عند تغير درجة الامتثال بنسبة معينة</p>
                  </div>
                </div>
                <Switch checked={notifyScoreChange} onCheckedChange={setNotifyScoreChange} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-950/30">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label className="font-medium">فحص جديد</Label>
                    <p className="text-xs text-muted-foreground">إشعار عند إتمام أي فحص جديد</p>
                  </div>
                </div>
                <Switch checked={notifyNewScan} onCheckedChange={setNotifyNewScan} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/15 btn-glow">
                    <Filter className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label className="font-medium">الحرجة فقط</Label>
                    <p className="text-xs text-muted-foreground">إرسال إشعارات للتغييرات الحرجة فقط</p>
                  </div>
                </div>
                <Switch checked={criticalOnly} onCheckedChange={setCriticalOnly} />
              </div>
            </CardContent>
          </Card>

          {/* Score Threshold */}
          {notifyScoreChange && (
            <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  حد التغيير الأدنى
                </CardTitle>
                <CardDescription>الحد الأدنى لتغيير الدرجة لإرسال إشعار</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الحد الأدنى للتغيير</span>
                  <Badge variant="outline" className="font-bold text-lg px-4 py-1">
                    {formatNumber(threshold)}٪
                  </Badge>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={(v) => setThreshold(v[0])}
                  min={1}
                  max={50}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>١٪ (حساس جداً)</span>
                  <span>٥٠٪ (أقل حساسية)</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <Card className="border-0 shadow-lg animate-in fade-in slide-in-from-left-4 duration-500 glass-card gold-sweep" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
            <CardHeader>
              <CardTitle className="gradient-text text-base">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full gap-2">
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                حفظ الإعدادات
              </Button>
              {prefs && (
                <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending} className="w-full gap-2">
                  {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  حذف الإعدادات
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 from-blue-950/20 to-indigo-950/20 animate-in fade-in slide-in-from-left-4 duration-500 glass-card gold-sweep" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2">
                <BellRing className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-blue-400">كيف يعمل النظام؟</span>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  يراقب النظام تغييرات حالة الامتثال تلقائياً
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  يرسل إشعارات فورية عند اكتشاف تغييرات
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  يمكنك تخصيص أنواع الإشعارات وحساسيتها
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  استخدم زر الاختبار للتأكد من وصول الإشعارات
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
