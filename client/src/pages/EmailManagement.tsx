import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Mail, Settings2, Send, CheckCircle2, XCircle, Loader2,
  Shield, Server, Users, Bell, TestTube, Zap, MailCheck,
  AlertTriangle, RefreshCw
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

export default function EmailManagement() {
  const { playClick, playHover } = useSoundEffects();
  const [testEmail, setTestEmail] = useState("");
  const [smtpForm, setSmtpForm] = useState({
    host: "",
    port: 587,
    user: "",
    pass: "",
    from: "",
    fromName: "منصة راصد",
    secure: false,
  });
  const [bulkForm, setBulkForm] = useState({
    subject: "",
    message: "",
    type: "info" as "info" | "warning" | "success" | "error",
    recipientType: "all" as "all" | "admins" | "specific",
    specificEmails: "",
  });

  const { data: smtpConfig, isLoading: configLoading, refetch: refetchConfig } = trpc.enhancedEmail.getSmtpConfig.useQuery();
  const { data: emailStats } = trpc.enhancedEmail.getStats.useQuery();

  const updateSmtpMutation = trpc.enhancedEmail.updateSmtpConfig.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث إعدادات SMTP بنجاح");
      refetchConfig();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const verifyMutation = trpc.enhancedEmail.verifyConnection.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("تم التحقق من الاتصال بنجاح ✅");
      } else {
        toast.error(`فشل التحقق: ${data.error}`);
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const testEmailMutation = trpc.enhancedEmail.sendTestEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success("تم إرسال البريد الاختباري بنجاح ✅");
      } else {
        toast.error(`فشل الإرسال: ${data.error}`);
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const bulkMutation = trpc.enhancedEmail.sendBulkNotification.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`تم إرسال ${data.sent} من ${data.total} رسالة بنجاح`);
        setBulkForm({ subject: "", message: "", type: "info", recipientType: "all", specificEmails: "" });
      } else {
        toast.error(`فشل الإرسال: ${data.error}`);
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleUpdateSmtp = () => {
    if (!smtpForm.host || !smtpForm.user || !smtpForm.pass || !smtpForm.from) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }
    updateSmtpMutation.mutate(smtpForm);
  };

  const handleSendBulk = () => {
    if (!bulkForm.subject || !bulkForm.message) {
      toast.error("يرجى ملء الموضوع والرسالة");
      return;
    }
    const specificEmails = bulkForm.recipientType === "specific"
      ? bulkForm.specificEmails.split(",").map(e => e.trim()).filter(Boolean)
      : undefined;
    if (bulkForm.recipientType === "specific" && (!specificEmails || specificEmails.length === 0)) {
      toast.error("يرجى إدخال عناوين البريد الإلكتروني");
      return;
    }
    bulkMutation.mutate({
      subject: bulkForm.subject,
      message: bulkForm.message,
      type: bulkForm.type,
      recipientType: bulkForm.recipientType,
      specificEmails,
    });
  };

  return (
    <div className="space-y-6">
      <WatermarkLogo />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
            <Mail className="h-7 w-7 text-primary" />
            إدارة البريد الإلكتروني
          </h1>
          <p className="text-muted-foreground mt-1">إعداد وإدارة إشعارات البريد الإلكتروني وخدمة SMTP</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        <div>
          <Card className="bg-gradient-to-bl from-primary/5 to-transparent glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center btn-glow">
                  <Server className={`h-6 w-6 ${smtpConfig?.isConfigured ? "text-green-500" : "text-red-500"}`} />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">حالة SMTP</div>
                  <div className="text-lg font-bold">
                    {configLoading ? "..." : smtpConfig?.isConfigured ? (
                      <span className="text-green-600">مُعد ✅</span>
                    ) : (
                      <span className="text-red-500">غير مُعد</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-bl from-blue-500/5 to-transparent glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">المشتركون النشطون</div>
                  <div className="text-lg font-bold">{emailStats?.activeSubscribers || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gradient-to-bl from-amber-500/5 to-transparent glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Bell className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">مستخدمون مفعّلو الإشعارات</div>
                  <div className="text-lg font-bold">{emailStats?.usersWithEmailEnabled || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="smtp" className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="smtp" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            إعدادات SMTP
          </TabsTrigger>
          <TabsTrigger value="test" className="gap-1.5">
            <TestTube className="h-3.5 w-3.5" />
            اختبار الإرسال
          </TabsTrigger>
          <TabsTrigger value="bulk" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            إرسال جماعي
          </TabsTrigger>
        </TabsList>

        {/* SMTP Settings Tab */}
        <TabsContent value="smtp">
          <Card className="glass-card gold-sweep">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-5 w-5" />
                إعدادات خادم البريد (SMTP)
              </CardTitle>
              <CardDescription>
                أدخل بيانات خادم SMTP لتفعيل إرسال البريد الإلكتروني التلقائي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {smtpConfig?.isConfigured && (
                <div className="bg-green-900/20 border border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-400 font-medium mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    SMTP مُعد حالياً
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-400/80 stagger-children">
                    <div>الخادم: {smtpConfig.host}:{smtpConfig.port}</div>
                    <div>المستخدم: {smtpConfig.user}</div>
                    <div>البريد المرسل: {smtpConfig.from}</div>
                    <div>اسم المرسل: {smtpConfig.fromName}</div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-green-700 border-green-300"
                      onClick={() => verifyMutation.mutate()}
                      disabled={verifyMutation.isPending}
                    >
                      {verifyMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                      اختبار الاتصال
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label>خادم SMTP *</Label>
                  <Input
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm({ ...smtpForm, host: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>المنفذ *</Label>
                  <Input
                    type="number"
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm({ ...smtpForm, port: Number(e.target.value) })}
                    placeholder="587"
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم المستخدم *</Label>
                  <Input
                    value={smtpForm.user}
                    onChange={(e) => setSmtpForm({ ...smtpForm, user: e.target.value })}
                    placeholder="user@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>كلمة المرور *</Label>
                  <Input
                    type="password"
                    value={smtpForm.pass}
                    onChange={(e) => setSmtpForm({ ...smtpForm, pass: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label>البريد المرسل *</Label>
                  <Input
                    type="email"
                    value={smtpForm.from}
                    onChange={(e) => setSmtpForm({ ...smtpForm, from: e.target.value })}
                    placeholder="noreply@rasid.sa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم المرسل</Label>
                  <Input
                    value={smtpForm.fromName}
                    onChange={(e) => setSmtpForm({ ...smtpForm, fromName: e.target.value })}
                    placeholder="منصة راصد"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={smtpForm.secure}
                  onCheckedChange={(v) => setSmtpForm({ ...smtpForm, secure: v })}
                />
                <Label>استخدام SSL/TLS (المنفذ 465)</Label>
              </div>

              <Button onClick={handleUpdateSmtp} disabled={updateSmtpMutation.isPending} className="w-full gap-2">
                {updateSmtpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                حفظ الإعدادات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Test Email Tab */}
        <TabsContent value="test">
          <Card className="glass-card gold-sweep">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                إرسال بريد اختباري
              </CardTitle>
              <CardDescription>
                أرسل بريداً اختبارياً للتأكد من عمل إعدادات SMTP بشكل صحيح
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!smtpConfig?.isConfigured && (
                <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-400 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    يرجى إعداد SMTP أولاً من تبويب "إعدادات SMTP"
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>البريد الإلكتروني المستلم</Label>
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <Button
                onClick={() => {
                  if (!testEmail) {
                    toast.error("يرجى إدخال بريد إلكتروني");
                    return;
                  }
                  testEmailMutation.mutate({ to: testEmail });
                }}
                disabled={testEmailMutation.isPending || !smtpConfig?.isConfigured}
                className="gap-2"
              >
                {testEmailMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                إرسال بريد اختباري
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bulk Send Tab */}
        <TabsContent value="bulk">
          <Card className="glass-card gold-sweep">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Send className="h-5 w-5" />
                إرسال إشعار جماعي
              </CardTitle>
              <CardDescription>
                أرسل إشعاراً بالبريد الإلكتروني لجميع المستخدمين أو مجموعة محددة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label>نوع الإشعار</Label>
                  <Select value={bulkForm.type} onValueChange={(v) => setBulkForm({ ...bulkForm, type: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">📋 إشعار عام</SelectItem>
                      <SelectItem value="warning">⚠️ تنبيه</SelectItem>
                      <SelectItem value="success">✅ نجاح</SelectItem>
                      <SelectItem value="error">❌ خطأ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المستلمون</Label>
                  <Select value={bulkForm.recipientType} onValueChange={(v) => setBulkForm({ ...bulkForm, recipientType: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المستخدمين</SelectItem>
                      <SelectItem value="admins">المشرفون فقط</SelectItem>
                      <SelectItem value="specific">عناوين محددة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {bulkForm.recipientType === "specific" && (
                <div className="space-y-2">
                  <Label>عناوين البريد (مفصولة بفاصلة)</Label>
                  <Input
                    value={bulkForm.specificEmails}
                    onChange={(e) => setBulkForm({ ...bulkForm, specificEmails: e.target.value })}
                    placeholder="user1@example.com, user2@example.com"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>الموضوع *</Label>
                <Input
                  value={bulkForm.subject}
                  onChange={(e) => setBulkForm({ ...bulkForm, subject: e.target.value })}
                  placeholder="عنوان الإشعار"
                />
              </div>

              <div className="space-y-2">
                <Label>الرسالة *</Label>
                <Textarea
                  value={bulkForm.message}
                  onChange={(e) => setBulkForm({ ...bulkForm, message: e.target.value })}
                  placeholder="نص الرسالة..."
                  rows={5}
                />
              </div>

              <Button
                onClick={handleSendBulk}
                disabled={bulkMutation.isPending || !smtpConfig?.isConfigured}
                className="w-full gap-2"
              >
                {bulkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                إرسال الإشعار
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
