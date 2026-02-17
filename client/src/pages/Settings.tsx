import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Shield, Bell, Scan, Scale, Loader2, Save, RefreshCw, CheckCircle, Mail, Send, Server, Lock, Eye, EyeOff, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const categoryConfig: Record<string, { label: string; icon: any; color: string }> = {
  general: { label: "عام", icon: Settings2, color: "text-blue-400" },
  scanning: { label: "الفحص", icon: Scan, color: "text-emerald-400" },
  compliance: { label: "الامتثال", icon: Scale, color: "text-amber-400" },
  escalation: { label: "التصعيد", icon: Shield, color: "text-red-400" },
  notifications: { label: "الإشعارات", icon: Bell, color: "text-primary" },
  security: { label: "الأمان", icon: Shield, color: "text-rose-400" },
  email: { label: "البريد الإلكتروني", icon: Mail, color: "text-cyan-400" },
};

export default function SettingsPage() {
  const { playClick, playHover } = useSoundEffects();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { data: settings, isLoading, refetch } = trpc.settings.list.useQuery({});
  const { data: emailStatus, refetch: refetchEmail } = trpc.settings.emailStatus.useQuery();
  const seedMutation = trpc.settings.seed.useMutation({
    onSuccess: () => { toast.success("تم تحميل الإعدادات الافتراضية"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const updateMutation = trpc.settings.update.useMutation({
    onSuccess: () => { toast.success("تم حفظ الإعداد"); refetch(); },
    onError: (err: any) => toast.error(err.message),
  });
  const saveSmtpMutation = trpc.settings.saveSmtpConfig.useMutation({
    onSuccess: () => { toast.success("تم حفظ إعدادات SMTP بنجاح"); refetchEmail(); },
    onError: (err: any) => toast.error(err.message),
  });
  const verifySmtpMutation = trpc.settings.verifySmtp.useMutation({
    onSuccess: (data: any) => {
      if (data.success) toast.success("✅ الاتصال بخادم SMTP ناجح");
      else toast.error(`❌ فشل الاتصال: ${data.error}`);
    },
    onError: (err: any) => toast.error(err.message),
  });
  const sendTestMutation = trpc.settings.sendTestEmail.useMutation({
    onSuccess: (data: any) => {
      if (data.success) toast.success("✅ تم إرسال البريد الاختباري بنجاح");
      else toast.error(`❌ فشل الإرسال: ${data.error}`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("general");
  const [showPassword, setShowPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // SMTP form state
  const [smtpForm, setSmtpForm] = useState({
    host: "",
    port: 587,
    user: "",
    pass: "",
    from: "noreply@rasid.sa",
    fromName: "منصة راصد",
    secure: false,
  });

  useEffect(() => {
    if (settings) {
      const vals: Record<string, string> = {};
      settings.forEach((s: any) => { vals[s.settingKey] = s.settingValue || ""; });
      setEditValues(vals);
      // Load SMTP settings from system settings
      const smtpHost = vals["smtp_host"];
      const smtpPort = vals["smtp_port"];
      const smtpUser = vals["smtp_user"];
      const smtpFrom = vals["smtp_from"];
      const smtpFromName = vals["smtp_from_name"];
      const smtpSecure = vals["smtp_secure"];
      if (smtpHost || smtpPort || smtpUser) {
        setSmtpForm(prev => ({
          ...prev,
          host: smtpHost || prev.host,
          port: smtpPort ? parseInt(smtpPort) : prev.port,
          user: smtpUser || prev.user,
          from: smtpFrom || prev.from,
          fromName: smtpFromName || prev.fromName,
          secure: smtpSecure === "true",
        }));
      }
    }
  }, [settings]);

  // Load from emailStatus
  useEffect(() => {
    if (emailStatus && emailStatus.host) {
      setSmtpForm(prev => ({
        ...prev,
        host: emailStatus.host || prev.host,
        port: emailStatus.port || prev.port,
        from: emailStatus.from || prev.from,
        fromName: emailStatus.fromName || prev.fromName,
        secure: emailStatus.secure ?? prev.secure,
      }));
    }
  }, [emailStatus]);

  const categories = Object.keys(categoryConfig);
  const grouped = settings?.reduce((acc: Record<string, any[]>, s: any) => {
    const cat = s.category || "general";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, any[]>) || {};

  const handleSave = (key: string) => {
    const setting = settings?.find((s: any) => s.settingKey === key);
    updateMutation.mutate({
      key,
      value: editValues[key] || "",
      type: setting?.settingType || undefined,
      category: setting?.category || undefined,
      label: setting?.label || undefined,
      description: setting?.description || undefined,
    });
  };

  const handleSaveSmtp = () => {
    if (!smtpForm.host || !smtpForm.user || !smtpForm.pass) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    saveSmtpMutation.mutate(smtpForm);
  };

  if (isLoading) {
    return (
    <div className="flex items-center justify-center h-64">
      <WatermarkLogo />
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">إعدادات النظام</h1>
          <p className="text-muted-foreground mt-1">إدارة إعدادات المنصة والتكوينات</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (!settings || settings.length === 0) && (
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : <RefreshCw className="w-4 h-4 ms-2" />}
              تحميل الإعدادات الافتراضية
            </Button>
          )}
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto p-1">
          {categories.map((cat) => {
            const cfg = categoryConfig[cat];
            const Icon = cfg.icon;
            const count = cat === "email" ? undefined : (grouped[cat]?.length || 0);
            return (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${cfg.color}`} />
                <span>{cfg.label}</span>
                {count !== undefined && count > 0 && <Badge variant="secondary" className="text-xs">{count}</Badge>}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Email/SMTP Configuration Tab */}
        <TabsContent value="email" className="space-y-4 mt-4">
          {/* Status Card */}
          <Card className={emailStatus?.configured ? "border-emerald-500/30 bg-emerald-500/5" : "border-amber-500/30 bg-amber-500/5"}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {emailStatus?.configured ? (
                    <Wifi className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p className="font-semibold text-sm">
                      {emailStatus?.configured ? "خدمة البريد الإلكتروني متصلة" : "خدمة البريد الإلكتروني غير مهيأة"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {emailStatus?.configured
                        ? `متصل بـ ${emailStatus.host} (المستخدم: ${emailStatus.user})`
                        : "يرجى ضبط إعدادات SMTP لتفعيل إرسال البريد الإلكتروني"}
                    </p>
                  </div>
                </div>
                <Badge variant={emailStatus?.configured ? "default" : "secondary"}>
                  {emailStatus?.configured ? "متصل" : "غير متصل"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* SMTP Configuration Form */}
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5 text-blue-500" />
                إعدادات خادم SMTP
              </CardTitle>
              <CardDescription>
                قم بإدخال بيانات خادم SMTP لتفعيل إرسال البريد الإلكتروني. يمكنك استخدام خدمات مثل Gmail, Outlook, SendGrid, أو أي خادم SMTP آخر.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label>خادم SMTP <span className="text-red-500">*</span></Label>
                  <Input
                    dir="ltr"
                    placeholder="smtp.gmail.com"
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm(prev => ({ ...prev, host: e.target.value }))}
                    disabled={!isAdmin}
                  />
                  <p className="text-xs text-muted-foreground">مثال: smtp.gmail.com, smtp.office365.com</p>
                </div>
                <div className="space-y-2">
                  <Label>المنفذ <span className="text-red-500">*</span></Label>
                  <Input
                    dir="ltr"
                    type="number"
                    placeholder="587"
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm(prev => ({ ...prev, port: parseInt(e.target.value) || 587 }))}
                    disabled={!isAdmin}
                  />
                  <p className="text-xs text-muted-foreground">587 (TLS) أو 465 (SSL) أو 25 (غير آمن)</p>
                </div>
                <div className="space-y-2">
                  <Label>اسم المستخدم <span className="text-red-500">*</span></Label>
                  <Input
                    dir="ltr"
                    placeholder="user@example.com"
                    value={smtpForm.user}
                    onChange={(e) => setSmtpForm(prev => ({ ...prev, user: e.target.value }))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      dir="ltr"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={smtpForm.pass}
                      onChange={(e) => setSmtpForm(prev => ({ ...prev, pass: e.target.value }))}
                      disabled={!isAdmin}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 transition-transform duration-300 hover:scale-110" /> : <Eye className="w-4 h-4 transition-transform duration-300 hover:scale-110" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">لـ Gmail: استخدم كلمة مرور التطبيقات (App Password)</p>
                </div>
                <div className="space-y-2">
                  <Label>بريد المرسل</Label>
                  <Input
                    dir="ltr"
                    placeholder="noreply@rasid.sa"
                    value={smtpForm.from}
                    onChange={(e) => setSmtpForm(prev => ({ ...prev, from: e.target.value }))}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم المرسل</Label>
                  <Input
                    placeholder="منصة راصد"
                    value={smtpForm.fromName}
                    onChange={(e) => setSmtpForm(prev => ({ ...prev, fromName: e.target.value }))}
                    disabled={!isAdmin}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={smtpForm.secure}
                  onCheckedChange={(checked) => setSmtpForm(prev => ({ ...prev, secure: checked }))}
                  disabled={!isAdmin}
                />
                <div>
                  <Label className="cursor-pointer">اتصال آمن (SSL/TLS)</Label>
                  <p className="text-xs text-muted-foreground">تفعيل للمنفذ 465، تعطيل للمنفذ 587</p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button onClick={handleSaveSmtp} disabled={saveSmtpMutation.isPending}>
                    {saveSmtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : <Save className="w-4 h-4 ms-2" />}
                    حفظ الإعدادات
                  </Button>
                  <Button variant="outline" onClick={() => verifySmtpMutation.mutate()} disabled={verifySmtpMutation.isPending}>
                    {verifySmtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : <Wifi className="w-4 h-4 ms-2" />}
                    اختبار الاتصال
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Email */}
          {isAdmin && emailStatus?.configured && (
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-500" />
                  إرسال بريد اختباري
                </CardTitle>
                <CardDescription>
                  أرسل بريداً اختبارياً للتأكد من عمل الخدمة بشكل صحيح
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Input
                    dir="ltr"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="max-w-sm"
                  />
                  <Button
                    onClick={() => {
                      if (!testEmail) { toast.error("يرجى إدخال بريد إلكتروني"); return; }
                      sendTestMutation.mutate({ to: testEmail });
                    }}
                    disabled={sendTestMutation.isPending || !testEmail}
                  >
                    {sendTestMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : <Send className="w-4 h-4 ms-2" />}
                    إرسال
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Tips */}
          <Card className="border-blue-500/20 bg-blue-500/5 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium text-sm">نصائح لإعداد البريد الإلكتروني</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li><strong>Gmail:</strong> استخدم smtp.gmail.com، المنفذ 587، وكلمة مرور التطبيقات</li>
                    <li><strong>Outlook/Office 365:</strong> استخدم smtp.office365.com، المنفذ 587</li>
                    <li><strong>SendGrid:</strong> استخدم smtp.sendgrid.net، المنفذ 587</li>
                    <li><strong>Amazon SES:</strong> استخدم email-smtp.{"{region}"}.amazonaws.com، المنفذ 587</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other category tabs */}
        {categories.filter(c => c !== "email").map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-4 mt-4">
            {(!grouped[cat] || grouped[cat].length === 0) ? (
              <Card className="glass-card gold-sweep">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>لا توجد إعدادات في هذا القسم</p>
                  {isAdmin && (
                    <Button variant="outline" className="mt-4" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                      تحميل الإعدادات الافتراضية
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              grouped[cat]?.map((setting: any) => (
                <Card key={setting.settingKey} className="transition-all hover:shadow-md">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Label className="text-base font-semibold">{setting.label || setting.settingKey}</Label>
                          <Badge variant="outline" className="text-xs">{setting.settingType}</Badge>
                        </div>
                        {setting.description && (
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {setting.settingType === "boolean" ? (
                            <Switch
                              checked={editValues[setting.settingKey] === "true"}
                              onCheckedChange={(checked) => {
                                setEditValues(prev => ({ ...prev, [setting.settingKey]: checked ? "true" : "false" }));
                              }}
                              disabled={!isAdmin || !setting.isEditable}
                            />
                          ) : (
                            <Input
                              type={setting.settingType === "number" ? "number" : "text"}
                              value={editValues[setting.settingKey] || ""}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [setting.settingKey]: e.target.value }))}
                              disabled={!isAdmin || !setting.isEditable}
                              className="max-w-sm"
                              dir={setting.settingType === "number" ? "ltr" : "rtl"}
                            />
                          )}
                          {isAdmin && setting.isEditable && (
                            <Button
                              size="sm"
                              onClick={() => handleSave(setting.settingKey)}
                              disabled={updateMutation.isPending}
                            >
                              {updateMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4 ms-1" />
                              )}
                              حفظ
                            </Button>
                          )}
                        </div>
                      </div>
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded" dir="ltr">
                        {setting.settingKey}
                      </code>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Info Card */}
      <Card className="border-blue-500/20 bg-blue-500/5 glass-card gold-sweep">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <p className="font-medium text-sm">ملاحظة</p>
              <p className="text-sm text-muted-foreground mt-1">
                التغييرات في الإعدادات تسري فوراً. بعض الإعدادات مثل مهلة الجلسة قد تتطلب إعادة تسجيل الدخول لتطبيقها.
                يتم تسجيل جميع التغييرات في سجل النشاطات.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
