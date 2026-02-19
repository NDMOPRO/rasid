/**
 * AdminOperations — مركز العمليات
 * الأقسام: صحة النظام | الإشعارات | النسخ الاحتياطي | الجلسات | سجل التدقيق | البذر | تخصيص لوحة القيادة
 * rootAdmin فقط
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Activity, Bell, Database, Users, ClipboardList, Zap, LayoutDashboard,
  Loader2, Save, Plus, Trash2, Edit3, Eye, RefreshCw, Check, X,
  ChevronRight, Shield, AlertTriangle, Clock, Download, Upload,
  Server, Wifi, WifiOff, Heart, HeartPulse, MonitorCheck,
  LogOut, Search, Filter, Calendar, ToggleLeft, ToggleRight,
  GripVertical, ArrowUp, ArrowDown, Cpu, HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ─── Section Navigation ───
const SECTIONS = [
  { id: "health", label: "صحة النظام", icon: HeartPulse },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "backup", label: "النسخ الاحتياطي", icon: Database },
  { id: "sessions", label: "الجلسات", icon: Users },
  { id: "audit", label: "سجل التدقيق", icon: ClipboardList },
  { id: "seed", label: "بيانات البذر", icon: Zap },
  { id: "layouts", label: "تخصيص لوحة القيادة", icon: LayoutDashboard },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

export default function AdminOperations() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId>("health");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" dir="rtl">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl border border-emerald-500/30">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">مركز العمليات</h1>
              <p className="text-sm text-white/50">مراقبة صحة النظام والإشعارات والنسخ الاحتياطي</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-6 flex gap-6">
        {/* Side Navigation */}
        <div className="w-64 shrink-0">
          <div className="sticky top-6 space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                  {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {activeSection === "health" && <HealthSection />}
          {activeSection === "notifications" && <NotificationsSection />}
          {activeSection === "backup" && <BackupSection />}
          {activeSection === "sessions" && <SessionsSection />}
          {activeSection === "audit" && <AuditSection />}
          {activeSection === "seed" && <SeedSection />}
          {activeSection === "layouts" && <LayoutsSection />}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 7: صحة النظام
// ═══════════════════════════════════════════
function HealthSection() {
  const healthQuery = trpc.operations.getHealthStatus.useQuery();
  const runCheck = trpc.operations.runHealthCheck.useMutation({
    onSuccess: () => { healthQuery.refetch(); toast.success("تم فحص صحة النظام"); },
  });
  const historyQuery = trpc.operations.getHealthHistory.useQuery({ limit: 20 });

  const services = healthQuery.data?.services || [];
  const history = (historyQuery.data || []) as any[];

  const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
    healthy: { color: "text-green-400", bg: "bg-green-500/20", label: "سليم" },
    degraded: { color: "text-amber-400", bg: "bg-amber-500/20", label: "متدهور" },
    down: { color: "text-red-400", bg: "bg-red-500/20", label: "متوقف" },
    inactive: { color: "text-gray-400", bg: "bg-gray-500/20", label: "غير مفعّل" },
    unknown: { color: "text-gray-400", bg: "bg-gray-500/20", label: "غير معروف" },
  };

  const serviceLabels: Record<string, string> = {
    database: "قاعدة البيانات", llm: "النموذج اللغوي", api: "واجهة API", railway: "الخادم",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <HeartPulse className="w-5 h-5 text-emerald-400" />
          صحة النظام
        </h2>
        <Button size="sm" onClick={() => runCheck.mutate()} disabled={runCheck.isPending}
          className="bg-emerald-600 hover:bg-emerald-700">
          {runCheck.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <RefreshCw className="w-4 h-4 ml-1" />}
          فحص الآن
        </Button>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((svc: any) => {
          const cfg = statusConfig[svc.status] || statusConfig.unknown;
          return (
            <Card key={svc.service} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium">{serviceLabels[svc.service] || svc.service}</span>
                  <Badge className={cfg.bg + " " + cfg.color}>{cfg.label}</Badge>
                </div>
                <div className="space-y-1 text-xs text-white/50">
                  {svc.responseTime !== null && (
                    <p>زمن الاستجابة: <span className="text-white/70 font-mono">{svc.responseTime}ms</span></p>
                  )}
                  {svc.lastChecked && (
                    <p>آخر فحص: <span className="text-white/70">{new Date(svc.lastChecked).toLocaleString("ar-SA")}</span></p>
                  )}
                  {svc.errorMessage && (
                    <p className="text-red-400">{svc.errorMessage}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* History */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-sm text-white/70">سجل الفحوصات الأخيرة</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 border-b border-white/5">
                  <th className="text-right py-2 px-3">الخدمة</th>
                  <th className="text-right py-2 px-3">الحالة</th>
                  <th className="text-right py-2 px-3">الاستجابة</th>
                  <th className="text-right py-2 px-3">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, 15).map((h: any, i: number) => {
                  const cfg = statusConfig[h.status] || statusConfig.unknown;
                  return (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 px-3">{serviceLabels[h.service] || h.service}</td>
                      <td className="py-2 px-3"><Badge className={cfg.bg + " " + cfg.color + " text-[10px]"}>{cfg.label}</Badge></td>
                      <td className="py-2 px-3 font-mono text-white/60">{h.responseTime}ms</td>
                      <td className="py-2 px-3 text-white/40">{h.checkedAt ? new Date(h.checkedAt).toLocaleString("ar-SA") : "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 8: الإشعارات
// ═══════════════════════════════════════════
function NotificationsSection() {
  const rulesQuery = trpc.operations.getNotificationRules.useQuery();
  const logQuery = trpc.operations.getNotificationLog.useQuery({ limit: 30 });
  const upsertRule = trpc.operations.upsertNotificationRule.useMutation({
    onSuccess: () => { rulesQuery.refetch(); toast.success("تم حفظ القاعدة"); },
  });
  const deleteRule = trpc.operations.deleteNotificationRule.useMutation({
    onSuccess: () => { rulesQuery.refetch(); toast.success("تم حذف القاعدة"); },
  });

  const [tab, setTab] = useState<"rules" | "log">("rules");
  const rules = (rulesQuery.data || []) as any[];
  const logs = (logQuery.data || []) as any[];

  const triggerLabels: Record<string, string> = {
    new_leak: "حالة رصد جديدة", status_change: "تغيير حالة", high_severity: "خطورة عالية",
    scan_complete: "اكتمال فحص", backup_complete: "اكتمال نسخ احتياطي", system_error: "خطأ نظام",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Bell className="w-5 h-5 text-emerald-400" />
          الإشعارات المتقدمة
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant={tab === "rules" ? "default" : "outline"} onClick={() => setTab("rules")}
            className={tab === "rules" ? "bg-emerald-600" : "border-white/10 text-white/60"}>القواعد</Button>
          <Button size="sm" variant={tab === "log" ? "default" : "outline"} onClick={() => setTab("log")}
            className={tab === "log" ? "bg-emerald-600" : "border-white/10 text-white/60"}>السجل</Button>
        </div>
      </div>

      {tab === "rules" ? (
        <div className="space-y-3">
          {rules.map((r: any) => (
            <Card key={r.ruleId} className="bg-white/5 border-white/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{r.nameAr || r.name}</span>
                    <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">{triggerLabels[r.trigger] || r.trigger}</Badge>
                    <Badge className={r.isActive ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                      {r.isActive ? "مفعّل" : "معطّل"}
                    </Badge>
                  </div>
                  <div className="flex gap-2 text-xs text-white/40">
                    {r.channels && <span>القنوات: {JSON.stringify(r.channels)}</span>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400" onClick={() => deleteRule.mutate({ ruleId: r.ruleId })}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {rules.length === 0 && <p className="text-center text-white/40 py-10">لا توجد قواعد إشعارات</p>}
        </div>
      ) : (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 border-b border-white/5">
                    <th className="text-right py-2 px-3">القناة</th>
                    <th className="text-right py-2 px-3">المستلم</th>
                    <th className="text-right py-2 px-3">الحالة</th>
                    <th className="text-right py-2 px-3">الوقت</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((l: any, i: number) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 px-3">{l.channel}</td>
                      <td className="py-2 px-3 text-white/60 font-mono text-xs">{l.recipient}</td>
                      <td className="py-2 px-3">
                        <Badge className={l.status === "sent" ? "bg-green-500/20 text-green-400" : l.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}>
                          {l.status === "sent" ? "مرسل" : l.status === "failed" ? "فشل" : "معلق"}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-white/40 text-xs">{l.sentAt ? new Date(l.sentAt).toLocaleString("ar-SA") : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 9: النسخ الاحتياطي
// ═══════════════════════════════════════════
function BackupSection() {
  const backupsQuery = trpc.operations.getBackups.useQuery();
  const createBackup = trpc.operations.createBackup.useMutation({
    onSuccess: () => { backupsQuery.refetch(); toast.success("تم إنشاء النسخة الاحتياطية"); },
  });
  const deleteBackup = trpc.operations.deleteBackup.useMutation({
    onSuccess: () => { backupsQuery.refetch(); toast.success("تم حذف النسخة"); },
  });

  const backups = (backupsQuery.data || []) as any[];

  const typeLabels: Record<string, string> = { full: "كامل", incremental: "تزايدي", config_only: "إعدادات فقط" };
  const statusColors: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400", pending: "bg-amber-500/20 text-amber-400",
    failed: "bg-red-500/20 text-red-400", running: "bg-blue-500/20 text-blue-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          النسخ الاحتياطي
        </h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => createBackup.mutate({ type: "full" })} disabled={createBackup.isPending}
            className="bg-emerald-600 hover:bg-emerald-700">
            {createBackup.isPending ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : <HardDrive className="w-4 h-4 ml-1" />}
            نسخ كامل
          </Button>
          <Button size="sm" variant="outline" onClick={() => createBackup.mutate({ type: "config_only" })}
            className="border-white/10 text-white/60">
            إعدادات فقط
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {backups.map((b: any) => (
          <Card key={b.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex items-center gap-4">
              <Database className="w-8 h-8 text-white/20" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{b.name}</span>
                  <Badge className="bg-white/10 text-white/60 text-[10px]">{typeLabels[b.type] || b.type}</Badge>
                  <Badge className={statusColors[b.status] || ""}>
                    {b.status === "completed" ? "مكتمل" : b.status === "pending" ? "قيد الانتظار" : b.status === "running" ? "جاري" : "فشل"}
                  </Badge>
                </div>
                <div className="flex gap-4 text-xs text-white/40">
                  {b.sizeBytes && <span>الحجم: {(b.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>}
                  <span>التاريخ: {b.createdAt ? new Date(b.createdAt).toLocaleString("ar-SA") : "-"}</span>
                </div>
              </div>
              <div className="flex gap-1">
                {b.fileUrl && (
                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => window.open(b.fileUrl, "_blank")}>
                    <Download className="w-3 h-3 ml-1" />تحميل
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400" onClick={() => deleteBackup.mutate({ id: b.id })}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {backups.length === 0 && <p className="text-center text-white/40 py-10">لا توجد نسخ احتياطية</p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 10: إدارة الجلسات
// ═══════════════════════════════════════════
function SessionsSection() {
  const sessionsQuery = trpc.operations.getActiveSessions.useQuery();
  const sessionSettings = trpc.operations.getSessionSettings.useQuery();
  const terminateSession = trpc.operations.terminateSession.useMutation({
    onSuccess: () => { sessionsQuery.refetch(); toast.success("تم إنهاء الجلسة"); },
  });
  const terminateAll = trpc.operations.terminateAllSessions.useMutation({
    onSuccess: () => { sessionsQuery.refetch(); toast.success("تم إنهاء جميع الجلسات"); },
  });
  const updateSettings = trpc.operations.updateSessionSettings.useMutation({
    onSuccess: () => { sessionSettings.refetch(); toast.success("تم حفظ الإعدادات"); },
  });

  const sessions = (sessionsQuery.data || []) as any[];
  const settings = sessionSettings.data || { sessionDuration: 8, maxDevices: 3, autoLogoutMinutes: 30 };
  const [editSettings, setEditSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(settings);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-emerald-400" />
          إدارة الجلسات
          <Badge className="bg-emerald-500/20 text-emerald-400">{sessions.length} نشطة</Badge>
        </h2>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => { setSettingsForm(settings); setEditSettings(true); }}
            className="border-white/10 text-white/60">إعدادات الجلسات</Button>
          <Button size="sm" variant="destructive" onClick={() => terminateAll.mutate({})} disabled={terminateAll.isPending}>
            <LogOut className="w-4 h-4 ml-1" />إنهاء الكل
          </Button>
        </div>
      </div>

      {/* Settings Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{settings.sessionDuration}h</p>
            <p className="text-xs text-white/40">مدة الجلسة</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{settings.maxDevices}</p>
            <p className="text-xs text-white/40">أقصى أجهزة</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-400">{settings.autoLogoutMinutes}m</p>
            <p className="text-xs text-white/40">خروج تلقائي</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      <div className="space-y-2">
        {sessions.map((s: any) => (
          <Card key={s.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4 flex items-center gap-4">
              <MonitorCheck className="w-6 h-6 text-white/20" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">المستخدم #{s.userId}</p>
                <div className="flex gap-4 text-xs text-white/40">
                  {s.deviceInfo && <span>{s.deviceInfo}</span>}
                  {s.ipAddress && <span className="font-mono">{s.ipAddress}</span>}
                  <span>آخر نشاط: {s.lastActivity ? new Date(s.lastActivity).toLocaleString("ar-SA") : "-"}</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400"
                onClick={() => terminateSession.mutate({ sessionId: s.id })}>
                <LogOut className="w-3 h-3 ml-1" />إنهاء
              </Button>
            </CardContent>
          </Card>
        ))}
        {sessions.length === 0 && <p className="text-center text-white/40 py-10">لا توجد جلسات نشطة</p>}
      </div>

      {/* Settings Dialog */}
      <Dialog open={editSettings} onOpenChange={setEditSettings}>
        <DialogContent className="bg-slate-900 border-white/10 text-white" dir="rtl">
          <DialogHeader><DialogTitle>إعدادات الجلسات</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-1 block">مدة الجلسة (ساعات)</label>
              <Input type="number" value={settingsForm.sessionDuration}
                onChange={e => setSettingsForm(p => ({ ...p, sessionDuration: parseInt(e.target.value) || 8 }))}
                className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">أقصى عدد أجهزة لكل مستخدم</label>
              <Input type="number" value={settingsForm.maxDevices}
                onChange={e => setSettingsForm(p => ({ ...p, maxDevices: parseInt(e.target.value) || 3 }))}
                className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-white/60 mb-1 block">الخروج التلقائي بعد (دقائق)</label>
              <Input type="number" value={settingsForm.autoLogoutMinutes}
                onChange={e => setSettingsForm(p => ({ ...p, autoLogoutMinutes: parseInt(e.target.value) || 30 }))}
                className="bg-white/5 border-white/10" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditSettings(false)}>إلغاء</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => { updateSettings.mutate(settingsForm); setEditSettings(false); }}>
              <Save className="w-4 h-4 ml-1" />حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 11: سجل التدقيق المتقدم
// ═══════════════════════════════════════════
function AuditSection() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const auditQuery = trpc.operations.getAuditLogs.useQuery({ page, limit: 30, search: search || undefined });
  const retentionQuery = trpc.operations.getAuditRetentionSettings.useQuery();
  const updateRetention = trpc.operations.updateAuditRetention.useMutation({
    onSuccess: () => { retentionQuery.refetch(); toast.success("تم تحديث سياسة الاحتفاظ"); },
  });

  const data = auditQuery.data || { logs: [], total: 0 };
  const logs = data.logs as any[];
  const totalPages = Math.ceil(data.total / 30);
  const retention = retentionQuery.data || { retentionDays: 365, autoDelete: true };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-emerald-400" />
          سجل التدقيق
          <Badge className="bg-white/10 text-white/60">{data.total} سجل</Badge>
        </h2>
        <div className="flex items-center gap-2 text-xs text-white/40">
          <span>الاحتفاظ: {retention.retentionDays} يوم</span>
          <span>|</span>
          <span>الحذف التلقائي: {retention.autoDelete ? "مفعّل" : "معطّل"}</span>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="bg-white/5 border-white/10 pr-10" placeholder="بحث في السجلات..." />
        </div>
      </div>

      {/* Audit Table */}
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/40 border-b border-white/10">
                  <th className="text-right py-3 px-4">المستخدم</th>
                  <th className="text-right py-3 px-4">الإجراء</th>
                  <th className="text-right py-3 px-4">المورد</th>
                  <th className="text-right py-3 px-4">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l: any, i: number) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">{l.aalUserName || `#${l.aalUserId}`}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-blue-500/20 text-blue-400 text-[10px]">{l.aalAction}</Badge>
                    </td>
                    <td className="py-3 px-4 text-white/60">{l.aalResourceName || "-"}</td>
                    <td className="py-3 px-4 text-white/40 text-xs">
                      {l.aalCreatedAt ? new Date(l.aalCreatedAt).toLocaleString("ar-SA") : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="border-white/10 text-white/60">السابق</Button>
          <span className="text-sm text-white/40">{page} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            className="border-white/10 text-white/60">التالي</Button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 12: بيانات البذر
// ═══════════════════════════════════════════
function SeedSection() {
  const dbStats = trpc.operations.getDbStats.useQuery();
  const deleteAllLeaks = trpc.operations.deleteAllLeaks.useMutation({
    onSuccess: () => { dbStats.refetch(); toast.success("تم حذف جميع حالات الرصد"); },
  });
  const deleteTestData = trpc.operations.deleteTestData.useMutation({
    onSuccess: () => { dbStats.refetch(); toast.success("تم حذف بيانات الاختبار"); },
  });

  const [confirmDialog, setConfirmDialog] = useState<"all" | "test" | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const stats = dbStats.data || { tables: 0, leaksCount: 0, usersCount: 0 };

  const confirmPhrases = {
    all: "أؤكد حذف جميع حالات الرصد",
    test: "أؤكد حذف بيانات الاختبار",
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Zap className="w-5 h-5 text-emerald-400" />
        بيانات البذر وإدارة البيانات
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{stats.tables}</p>
            <p className="text-xs text-white/40">جدول</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{stats.leaksCount}</p>
            <p className="text-xs text-white/40">حالة رصد</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{stats.usersCount}</p>
            <p className="text-xs text-white/40">مستخدم</p>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="bg-red-500/5 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            منطقة الخطر
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <p className="text-sm font-medium">حذف بيانات الاختبار</p>
              <p className="text-xs text-white/40">يحذف فقط السجلات التي مصدرها test أو seed</p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => { setConfirmText(""); setConfirmDialog("test"); }}>
              حذف الاختبار
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
            <div>
              <p className="text-sm font-medium text-red-400">حذف جميع حالات الرصد</p>
              <p className="text-xs text-white/40">تحذير: هذا الإجراء لا يمكن التراجع عنه</p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => { setConfirmText(""); setConfirmDialog("all"); }}>
              حذف الكل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white" dir="rtl">
          <DialogHeader><DialogTitle className="text-red-400">تأكيد الحذف</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              اكتب العبارة التالية للتأكيد:
            </p>
            <p className="text-sm font-mono bg-red-500/10 p-2 rounded text-red-400">
              {confirmDialog ? confirmPhrases[confirmDialog] : ""}
            </p>
            <Input value={confirmText} onChange={e => setConfirmText(e.target.value)}
              className="bg-white/5 border-white/10" placeholder="اكتب عبارة التأكيد..." />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDialog(null)}>إلغاء</Button>
            <Button variant="destructive"
              disabled={!confirmDialog || confirmText !== confirmPhrases[confirmDialog]}
              onClick={() => {
                if (confirmDialog === "all") deleteAllLeaks.mutate({ confirmPhrase: confirmPhrases.all as any });
                else if (confirmDialog === "test") deleteTestData.mutate({ confirmPhrase: confirmPhrases.test as any });
                setConfirmDialog(null);
              }}>
              تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════
// القسم 13: تخصيص لوحة القيادة
// ═══════════════════════════════════════════
function LayoutsSection() {
  const layoutsQuery = trpc.operations.getDashboardLayouts.useQuery();
  const deleteLayout = trpc.operations.deleteDashboardLayout.useMutation({
    onSuccess: () => { layoutsQuery.refetch(); toast.success("تم حذف التخطيط"); },
  });

  const layouts = (layoutsQuery.data || []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-emerald-400" />
          تخصيص لوحة القيادة
        </h2>
      </div>

      <p className="text-sm text-white/50">
        التخطيطات تتحكم في ترتيب وحجم وإظهار الودجات في لوحة القيادة الرئيسية. التخطيط الافتراضي يُطبق على جميع المستخدمين ما لم يكن لديهم تخطيط خاص.
      </p>

      <div className="space-y-3">
        {layouts.map((l: any) => (
          <Card key={l.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{l.nameAr || l.name}</span>
                  {l.isDefault === 1 && <Badge className="bg-blue-500/20 text-blue-400">افتراضي</Badge>}
                  {l.isTemplate === 1 && <Badge className="bg-purple-500/20 text-purple-400">قالب</Badge>}
                  {l.isLocked === 1 && <Badge className="bg-red-500/20 text-red-400">مقفل</Badge>}
                  {l.targetRole && <Badge className="bg-green-500/20 text-green-400">{l.targetRole}</Badge>}
                </div>
                <Button size="sm" variant="ghost" className="h-7 text-xs text-red-400"
                  onClick={() => deleteLayout.mutate({ id: l.id })}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              {l.layout && (
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(l.layout) ? l.layout : []).map((w: any, i: number) => (
                    <Badge key={i} className={`text-[10px] ${w.visible !== false ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400 line-through"}`}>
                      {w.widgetId} ({w.size})
                    </Badge>
                  ))}
                </div>
              )}
              {l.dataSource && <p className="text-xs text-white/30 mt-2">مصدر البيانات: {l.dataSource}</p>}
            </CardContent>
          </Card>
        ))}
        {layouts.length === 0 && <p className="text-center text-white/40 py-10">لا توجد تخطيطات مخصصة</p>}
      </div>
    </div>
  );
}
