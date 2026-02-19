import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Bell, Mail, Send, CheckCircle, XCircle, Clock, Settings,
  AlertTriangle, RefreshCw, TestTube, Wifi, WifiOff
} from "lucide-react";
import { toast } from "sonner";

export default function Notifications() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingExpiry, setSendingExpiry] = useState(false);

  const { data: smtpStatus, isLoading: smtpLoading } = trpc.notifications.smtpStatus.useQuery(undefined, { enabled: isAdmin });
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = trpc.notifications.history.useQuery({ limit: 50 });

  const sendExpiryEmails = trpc.notifications.sendExpiryEmails.useMutation({
    onSuccess: (data) => {
      toast.success(
        lang === "ar"
          ? `تم إرسال ${data.sent} إشعار بنجاح${data.failed > 0 ? ` (${data.failed} فشل)` : ""}`
          : `${data.sent} notification(s) sent${data.failed > 0 ? ` (${data.failed} failed)` : ""}`
      );
      refetchHistory();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const sendTestEmail = trpc.notifications.sendTest.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(lang === "ar" ? "تم إرسال البريد التجريبي بنجاح" : "Test email sent successfully");
      } else {
        toast.error(data.error || "Failed to send test email");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSendExpiry = async () => {
    setSendingExpiry(true);
    try {
      await sendExpiryEmails.mutateAsync({ lang });
    } finally {
      setSendingExpiry(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) return;
    setSendingTest(true);
    try {
      await sendTestEmail.mutateAsync({ to: testEmail });
    } finally {
      setSendingTest(false);
    }
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
      case "failed": return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      default: return <Clock className="h-3.5 w-3.5 text-amber-500" />;
    }
  };

  const typeLabel = (type: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      contract_expiry_30d: { en: "30-Day Warning", ar: "تحذير 30 يوم" },
      contract_expiry_15d: { en: "15-Day Warning", ar: "تحذير 15 يوم" },
      contract_expiry_7d: { en: "7-Day Urgent", ar: "عاجل 7 أيام" },
      contract_expired: { en: "Expired", ar: "منتهي" },
      payment_reminder: { en: "Payment Reminder", ar: "تذكير دفع" },
      general: { en: "General", ar: "عام" },
    };
    return labels[type]?.[lang] || type;
  };

  const typeColor = (type: string) => {
    if (type.includes("7d")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    if (type.includes("15d")) return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
    if (type.includes("30d")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            {lang === "ar" ? "الإشعارات" : "Notifications"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {lang === "ar" ? "إدارة إشعارات البريد الإلكتروني وتنبيهات العقود" : "Manage email notifications and contract alerts"}
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={handleSendExpiry}
            disabled={sendingExpiry || !smtpStatus?.configured}
            className="gap-2"
          >
            {sendingExpiry ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {lang === "ar" ? "إرسال تنبيهات الانتهاء" : "Send Expiry Alerts"}
          </Button>
        )}
      </div>

      {/* SMTP Status & Test (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Settings className="h-4 w-4" />
                {lang === "ar" ? "حالة SMTP" : "SMTP Status"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {smtpLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {smtpStatus?.configured ? (
                      <div className="flex items-center gap-2 text-emerald-600">
                        <Wifi className="h-4 w-4" />
                        <span className="text-sm font-medium">{lang === "ar" ? "متصل" : "Connected"}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-600">
                        <WifiOff className="h-4 w-4" />
                        <span className="text-sm font-medium">{lang === "ar" ? "غير مُعد" : "Not Configured"}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>{lang === "ar" ? "الخادم" : "Host"}: {smtpStatus?.host || "N/A"}</p>
                    <p>{lang === "ar" ? "المرسل" : "From"}: {smtpStatus?.from || "N/A"}</p>
                  </div>
                  {!smtpStatus?.configured && (
                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
                      <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3 w-3" />
                        {lang === "ar"
                          ? "قم بإعداد متغيرات SMTP_HOST, SMTP_USER, SMTP_PASS في الإعدادات"
                          : "Set SMTP_HOST, SMTP_USER, SMTP_PASS in environment settings"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TestTube className="h-4 w-4" />
                {lang === "ar" ? "إرسال بريد تجريبي" : "Send Test Email"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={lang === "ar" ? "أدخل البريد الإلكتروني" : "Enter email address"}
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="text-sm"
                />
                <Button
                  size="sm"
                  onClick={handleSendTest}
                  disabled={sendingTest || !testEmail || !smtpStatus?.configured}
                  className="shrink-0"
                >
                  {sendingTest ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification History */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              {lang === "ar" ? "سجل الإشعارات" : "Notification History"}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => refetchHistory()} className="h-8 w-8 p-0">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((notif: any) => (
                <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/30 transition-colors">
                  <div className="mt-0.5">{statusIcon(notif.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{notif.subject}</span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${typeColor(notif.notificationType)}`}>
                        {typeLabel(notif.notificationType)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {notif.recipientEmail}
                      </span>
                      {notif.recipientName && <span>{notif.recipientName}</span>}
                    </div>
                    {notif.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">{notif.errorMessage}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-SA", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    }) : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                {lang === "ar" ? "لا توجد إشعارات مرسلة بعد" : "No notifications sent yet"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "ar"
                  ? "اضغط على 'إرسال تنبيهات الانتهاء' لإرسال إشعارات للعقود المنتهية"
                  : "Click 'Send Expiry Alerts' to notify owners about expiring contracts"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
