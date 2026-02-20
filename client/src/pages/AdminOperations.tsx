/**
 * Admin Operations — مركز العمليات
 * مربوط بـ operations.* + systemHealth.* APIs
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Activity, Server, Bell, Clock, BarChart3,
  CheckCircle, Zap, Globe, AlertTriangle,
  RefreshCw, Search, XCircle,
  Database, Cpu, HardDrive, Users, Shield, Trash2, Wifi,
} from "lucide-react";

type TabId = "health" | "sessions" | "audit" | "backups" | "notifications" | "performance";
const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "health", label: "صحة النظام", icon: Activity },
  { id: "sessions", label: "الجلسات", icon: Users },
  { id: "audit", label: "سجل التدقيق", icon: Shield },
  { id: "backups", label: "النسخ الاحتياطية", icon: Database },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "performance", label: "الأداء", icon: BarChart3 },
];

const statusColors: Record<string, string> = { healthy: "text-emerald-400", degraded: "text-amber-400", down: "text-red-400", unknown: "text-muted-foreground" };
const statusLabels: Record<string, string> = { healthy: "يعمل بشكل طبيعي", degraded: "أداء منخفض", down: "متوقف", unknown: "غير معروف" };

function HealthTab() {
  const { data: health, isLoading, refetch } = trpc.operations.getHealthStatus.useQuery();
  const { data: metrics } = trpc.systemHealth.metrics.useQuery();
  const runCheck = trpc.operations.runHealthCheck.useMutation({
    onSuccess: () => { toast.success("تم فحص صحة النظام بنجاح"); refetch(); },
    onError: () => toast.error("فشل فحص صحة النظام"),
  });
  if (isLoading) return <div className="space-y-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 bg-card" />)}</div>;
  const serviceLabels: Record<string, string> = { database: "قاعدة البيانات", llm: "الذكاء الاصطناعي", api: "واجهة API", railway: "الاستضافة" };
  const serviceIconMap: Record<string, any> = { database: Database, llm: Cpu, api: Wifi, railway: Server };
  const healthyCount = (health?.services || []).filter((s: any) => s.status === "healthy").length;
  const totalServices = (health?.services || []).length || 1;
  const avgResponse = Math.round((health?.services || []).reduce((s: number, svc: any) => s + (svc.responseTime || 0), 0) / totalServices);
  return (
    <div className="overflow-x-hidden max-w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">آخر فحص: {health?.lastCheck ? new Date(health.lastCheck).toLocaleString("ar-SA") : "لم يتم الفحص بعد"}</div>
        <Button onClick={() => runCheck.mutate()} disabled={runCheck.isPending} size="sm" className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className={`h-4 w-4 ml-2 ${runCheck.isPending ? "animate-spin" : ""}`} />{runCheck.isPending ? "جاري الفحص..." : "فحص الآن"}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" /><div className="text-2xl font-bold text-emerald-400">{healthyCount}/{totalServices}</div><div className="text-xs text-muted-foreground">خدمات نشطة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-blue-400">{avgResponse}ms</div><div className="text-xs text-muted-foreground">متوسط الاستجابة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-purple-400">{metrics?.server?.uptimeFormatted || "---"}</div><div className="text-xs text-muted-foreground">وقت التشغيل</div></CardContent></Card>
      </div>
      <div className="space-y-2">
        {(health?.services || []).map((svc: any, i: number) => {
          const SvcIcon = serviceIconMap[svc.service] || Server;
          return (
            <div key={i} className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-card/30 border border-border/50">
              <div className="flex items-center gap-3">
                <SvcIcon className={`h-5 w-5 ${statusColors[svc.status] || "text-muted-foreground"}`} />
                <span className="text-foreground text-sm">{serviceLabels[svc.service] || svc.service}</span>
              </div>
              <div className="flex items-center gap-4">
                {svc.responseTime !== null && <span className="text-muted-foreground text-xs">استجابة: {svc.responseTime}ms</span>}
                {svc.errorMessage && <span className="text-red-400 text-xs">{svc.errorMessage}</span>}
                <Badge className={`${svc.status === "healthy" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : svc.status === "degraded" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}`}>
                  {statusLabels[svc.status] || svc.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
      {metrics?.server && (
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">معلومات الخادم</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div><p className="text-muted-foreground text-xs">الذاكرة</p><p className="text-foreground font-bold">{metrics.server.memoryUsed} MB / {metrics.server.memoryTotal} MB</p></div>
              <div><p className="text-muted-foreground text-xs">Node.js</p><p className="text-foreground font-bold">{metrics.server.nodeVersion}</p></div>
              <div><p className="text-muted-foreground text-xs">المنصة</p><p className="text-foreground font-bold">{metrics.server.platform}</p></div>
              <div><p className="text-muted-foreground text-xs">PID</p><p className="text-foreground font-bold">{metrics.server.pid}</p></div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">استخدام الذاكرة</span><span className="text-blue-400">{Math.round((metrics.server.memoryUsed / metrics.server.memoryTotal) * 100)}%</span></div>
              <div className="w-full bg-gray-700 rounded-full h-2"><div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.round((metrics.server.memoryUsed / metrics.server.memoryTotal) * 100)}%` }} /></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SessionsTab() {
  const { data: sessions, isLoading, refetch } = trpc.operations.getActiveSessions.useQuery();
  const terminateAll = trpc.operations.terminateAllSessions.useMutation({ onSuccess: () => { toast.success("تم إنهاء جميع الجلسات"); refetch(); } });
  const terminateOne = trpc.operations.terminateSession.useMutation({ onSuccess: () => { toast.success("تم إنهاء الجلسة"); refetch(); } });
  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-card" />)}</div>;
  const sessionList = Array.isArray(sessions) ? sessions : [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{sessionList.length} جلسة نشطة</p>
        <Button variant="destructive" size="sm" onClick={() => terminateAll.mutate()} disabled={terminateAll.isPending}><Trash2 className="h-4 w-4 ml-2" />إنهاء الكل</Button>
      </div>
      {sessionList.length === 0 ? (
        <Card className="glass-card gold-sweep"><CardContent className="p-8 text-center text-muted-foreground">لا توجد جلسات نشطة</CardContent></Card>
      ) : sessionList.map((s: any, i: number) => (
        <Card key={i} className="glass-card gold-sweep">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-foreground text-sm font-medium">{s.userName || s.userEmail || "مستخدم"}</p>
                <p className="text-muted-foreground text-xs">{s.ip || "غير معروف"} • {s.userAgent ? s.userAgent.substring(0, 50) : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{s.lastActivity ? new Date(s.lastActivity).toLocaleString("ar-SA") : ""}</span>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => terminateOne.mutate({ sessionId: s.id })}><XCircle className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AuditTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { data, isLoading } = trpc.operations.getAuditLogs.useQuery({ page, limit: 20, search: search || undefined });
  if (isLoading) return <div className="space-y-3">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 bg-card" />)}</div>;
  const logs = data?.logs || [];
  const total = data?.total || 0;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Input placeholder="بحث في السجلات..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="glass-card gold-sweep text-foreground max-w-xs" />
        <Badge className="bg-gray-700 text-muted-foreground">{total} سجل</Badge>
      </div>
      <Card className="bg-gray-900/80 border-border">
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[500px]">
            {logs.length === 0 ? <div className="p-8 text-center text-muted-foreground">لا توجد سجلات</div> : logs.map((log: any, i: number) => (
              <div key={i} className="flex gap-3 px-4 py-2 border-b border-gray-800/50 hover:bg-card/30 text-sm">
                <span className="text-muted-foreground whitespace-nowrap text-xs">{log.createdAt ? new Date(log.createdAt).toLocaleString("ar-SA") : ""}</span>
                <Badge className={`text-xs ${log.action?.includes("delete") ? "bg-red-500/20 text-red-400" : log.action?.includes("create") ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>{log.action || "عملية"}</Badge>
                <span className="text-purple-400 text-xs">{log.performedBy || log.userName || ""}</span>
                <span className="text-muted-foreground text-xs flex-1">{log.details || log.description || ""}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {total > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border-border text-muted-foreground">السابق</Button>
          <span className="text-muted-foreground text-sm py-1">صفحة {page} من {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="border-border text-muted-foreground">التالي</Button>
        </div>
      )}
    </div>
  );
}

function BackupsTab() {
  const { data: backups, isLoading, refetch } = trpc.operations.getBackups.useQuery();
  const createBackup = trpc.operations.createBackup.useMutation({
    onSuccess: () => { toast.success("تم إنشاء النسخة الاحتياطية"); refetch(); },
    onError: () => toast.error("فشل إنشاء النسخة الاحتياطية"),
  });
  const deleteBackup = trpc.operations.deleteBackup.useMutation({ onSuccess: () => { toast.success("تم حذف النسخة"); refetch(); } });
  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-card" />)}</div>;
  const backupList = Array.isArray(backups) ? backups : [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{backupList.length} نسخة احتياطية</p>
        <Button onClick={() => createBackup.mutate({ type: "full", description: "نسخة يدوية" })} disabled={createBackup.isPending} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
          <HardDrive className="h-4 w-4 ml-2" />{createBackup.isPending ? "جاري الإنشاء..." : "إنشاء نسخة"}
        </Button>
      </div>
      {backupList.length === 0 ? (
        <Card className="glass-card gold-sweep"><CardContent className="p-8 text-center text-muted-foreground">لا توجد نسخ احتياطية</CardContent></Card>
      ) : backupList.map((b: any, i: number) => (
        <Card key={i} className="glass-card gold-sweep">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <HardDrive className="h-5 w-5 text-emerald-400" />
              <div>
                <p className="text-foreground text-sm font-medium">{b.description || b.type || "نسخة احتياطية"}</p>
                <p className="text-muted-foreground text-xs">{b.createdAt ? new Date(b.createdAt).toLocaleString("ar-SA") : ""} {b.size ? `• ${(b.size / 1024 / 1024).toFixed(1)} MB` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${b.status === "completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{b.status === "completed" ? "مكتمل" : b.status || "جاري"}</Badge>
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => deleteBackup.mutate({ id: b.id })}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function NotificationsTab() {
  const { data: rules, isLoading } = trpc.operations.getNotificationRules.useQuery();
  const { data: logs } = trpc.operations.getNotificationLog.useQuery({ limit: 20 });
  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-card" />)}</div>;
  const ruleList = Array.isArray(rules) ? rules : [];
  const logList = Array.isArray(logs) ? logs : (logs as any)?.logs || [];
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-foreground font-medium mb-3">قواعد الإشعارات ({ruleList.length})</h3>
        {ruleList.length === 0 ? (
          <Card className="glass-card gold-sweep"><CardContent className="p-6 text-center text-muted-foreground">لا توجد قواعد إشعارات</CardContent></Card>
        ) : <div className="space-y-2">{ruleList.map((r: any, i: number) => (
          <Card key={i} className="glass-card gold-sweep">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2"><Bell className={`h-4 w-4 ${r.enabled ? "text-blue-400" : "text-gray-600"}`} /><span className="text-foreground text-sm">{r.name || r.event || "قاعدة"}</span></div>
              <Badge className={r.enabled ? "bg-emerald-500/20 text-emerald-400" : "bg-gray-600/20 text-muted-foreground"}>{r.enabled ? "مفعّل" : "معطّل"}</Badge>
            </CardContent>
          </Card>
        ))}</div>}
      </div>
      <div>
        <h3 className="text-foreground font-medium mb-3">سجل الإشعارات</h3>
        {logList.length === 0 ? (
          <Card className="glass-card gold-sweep"><CardContent className="p-6 text-center text-muted-foreground">لا توجد إشعارات مرسلة</CardContent></Card>
        ) : <div className="space-y-2">{logList.slice(0, 10).map((l: any, i: number) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded bg-card/30 text-sm">
            <span className="text-muted-foreground text-xs">{l.sentAt ? new Date(l.sentAt).toLocaleString("ar-SA") : ""}</span>
            <Badge className="text-xs bg-blue-500/20 text-blue-400">{l.channel || "email"}</Badge>
            <span className="text-muted-foreground text-xs flex-1">{l.subject || l.message || ""}</span>
          </div>
        ))}</div>}
      </div>
    </div>
  );
}

function PerformanceTab() {
  const { data: metrics } = trpc.systemHealth.metrics.useQuery();
  const { data: dbStats } = trpc.operations.getDbStats.useQuery();
  const memPercent = metrics?.server ? Math.round((metrics.server.memoryUsed / metrics.server.memoryTotal) * 100) : 0;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "استخدام الذاكرة", value: metrics?.server ? `${metrics.server.memoryUsed} MB / ${metrics.server.memoryTotal} MB` : "---", color: "text-blue-400", bar: memPercent },
          { label: "ذاكرة RSS", value: metrics?.server ? `${metrics.server.memoryRss} MB` : "---", color: "text-purple-400", bar: metrics?.server ? Math.min(Math.round(metrics.server.memoryRss / 1024 * 100), 100) : 0 },
          { label: "وقت التشغيل", value: metrics?.server?.uptimeFormatted || "---", color: "text-emerald-400", bar: 100 },
          { label: "PID", value: metrics?.server?.pid?.toString() || "---", color: "text-amber-400", bar: 0 },
        ].map((m, i) => (
          <Card key={i} className="glass-card gold-sweep">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap mb-2">
                <span className="text-muted-foreground text-sm">{m.label}</span>
                <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
              </div>
              {m.bar > 0 && <div className="w-full bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full transition-all ${m.bar > 80 ? "bg-red-500" : m.bar > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${m.bar}%` }} /></div>}
            </CardContent>
          </Card>
        ))}
      </div>
      {dbStats && (
        <Card className="glass-card gold-sweep">
          <CardHeader><CardTitle className="text-foreground text-base">إحصائيات قاعدة البيانات</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dbStats as Record<string, any>).filter(([, v]) => typeof v === "number" || typeof v === "string").slice(0, 8).map(([key, val], i) => (
                <div key={i} className="text-center p-3 rounded bg-gray-900/50">
                  <p className="text-muted-foreground text-xs">{key}</p>
                  <p className="text-foreground font-bold text-lg">{typeof val === "number" ? val.toLocaleString("ar-SA") : String(val)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AdminOperations() {
  const [activeTab, setActiveTab] = useState<TabId>("health");
  return (
    <div className="min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">مركز العمليات</h1><p className="text-muted-foreground text-sm mt-1">مراقبة صحة النظام والجلسات والأداء</p></div>
      <div className="flex gap-1 p-1 bg-card/50 rounded-xl border border-border overflow-x-auto">
        {tabs.map((tab) => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-blue-600 text-foreground shadow-lg shadow-blue-500/20" : "text-muted-foreground hover:text-foreground hover:bg-gray-700/50"}`}><Icon className="h-4 w-4" />{tab.label}</button>
        ); })}
      </div>
      {activeTab === "health" && <HealthTab />}
      {activeTab === "sessions" && <SessionsTab />}
      {activeTab === "audit" && <AuditTab />}
      {activeTab === "backups" && <BackupsTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "performance" && <PerformanceTab />}
    </div>
  );
}
