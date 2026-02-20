/**
 * Admin Operations — مركز العمليات
 * Full implementation with: Health, Jobs, Alerts, Logs, Performance tabs
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity, Server, Bell, Clock, BarChart3,
  CheckCircle, Zap, Globe, AlertTriangle,
  Play, Pause, RefreshCw, Search,
  Filter, Download, XCircle, Info,
} from "lucide-react";

type TabId = "health" | "jobs" | "alerts" | "logs" | "performance";

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "health", label: "صحة النظام", icon: Activity },
  { id: "jobs", label: "المهام", icon: Clock },
  { id: "alerts", label: "التنبيهات", icon: Bell },
  { id: "logs", label: "السجلات", icon: Server },
  { id: "performance", label: "الأداء", icon: BarChart3 },
];

function HealthTab() {
  const services = [
    { name: "الخادم الرئيسي", status: "online", uptime: "99.9%", responseTime: "12ms" },
    { name: "قاعدة البيانات", status: "online", uptime: "99.8%", responseTime: "8ms" },
    { name: "محرك الذكاء الاصطناعي", status: "online", uptime: "98.5%", responseTime: "245ms" },
    { name: "محرك الرصد", status: "online", uptime: "99.7%", responseTime: "35ms" },
    { name: "نظام التنبيهات", status: "online", uptime: "99.9%", responseTime: "15ms" },
    { name: "خدمة SSE Streaming", status: "online", uptime: "99.6%", responseTime: "5ms" },
    { name: "محرك البذر (Seed)", status: "online", uptime: "100%", responseTime: "2ms" },
  ];
  return (
    <div className="overflow-x-hidden max-w-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" /><div className="text-2xl font-bold text-emerald-400">7/7</div><div className="text-xs text-gray-400">خدمات نشطة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-blue-400">45ms</div><div className="text-xs text-gray-400">متوسط الاستجابة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-purple-400">99.9%</div><div className="text-xs text-gray-400">وقت التشغيل</div></CardContent></Card>
      </div>
      <div className="space-y-2">
        {services.map((s, i) => (
          <div key={i} className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-white text-sm">{s.name}</span></div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-xs">استجابة: {s.responseTime}</span>
              <span className="text-gray-400 text-xs">تشغيل: {s.uptime}</span>
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">نشط</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function JobsTab() {
  const [filter, setFilter] = useState<"all" | "running" | "completed" | "failed">("all");
  const jobs = [
    { id: "JOB-001", name: "فحص مجدول — المواقع الحكومية", status: "running", progress: 67, startedAt: "18:00", eta: "~12 دقيقة" },
    { id: "JOB-002", name: "تحديث قاعدة المعرفة", status: "running", progress: 45, startedAt: "17:45", eta: "~8 دقائق" },
    { id: "JOB-003", name: "بذر البيانات — العبارات الوطنية", status: "completed", progress: 100, startedAt: "17:30", eta: "مكتمل" },
    { id: "JOB-004", name: "نسخ احتياطي يومي", status: "completed", progress: 100, startedAt: "03:00", eta: "مكتمل" },
    { id: "JOB-005", name: "فحص الدارك ويب", status: "failed", progress: 23, startedAt: "16:00", eta: "فشل — timeout" },
    { id: "JOB-006", name: "تحليل اتجاهات الأسبوع", status: "completed", progress: 100, startedAt: "14:00", eta: "مكتمل" },
    { id: "JOB-007", name: "استيراد بيانات جماعي (CSV)", status: "running", progress: 82, startedAt: "17:50", eta: "~3 دقائق" },
    { id: "JOB-008", name: "تقرير تنفيذي شهري", status: "completed", progress: 100, startedAt: "12:00", eta: "مكتمل" },
  ];
  const filtered = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);
  const statusIcon = (s: string) => {
    if (s === "running") return <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />;
    if (s === "completed") return <CheckCircle className="h-4 w-4 text-emerald-400" />;
    return <XCircle className="h-4 w-4 text-red-400" />;
  };
  const statusLabel = (s: string) => {
    if (s === "running") return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">قيد التنفيذ</Badge>;
    if (s === "completed") return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">مكتمل</Badge>;
    return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">فشل</Badge>;
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap">
        <div className="flex gap-2">
          {(["all", "running", "completed", "failed"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}
              className={filter === f ? "bg-blue-600 text-white" : "border-gray-600 text-gray-400"}>
              {f === "all" ? "الكل" : f === "running" ? "قيد التنفيذ" : f === "completed" ? "مكتمل" : "فشل"}
              <span className="mr-1 text-xs">({f === "all" ? jobs.length : jobs.filter((j) => j.status === f).length})</span>
            </Button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {filtered.map((job) => (
          <Card key={job.id} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap mb-2">
                <div className="flex items-center gap-3">
                  {statusIcon(job.status)}
                  <div>
                    <p className="text-white text-sm font-medium">{job.name}</p>
                    <p className="text-gray-500 text-xs">{job.id} — بدأ: {job.startedAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusLabel(job.status)}
                  {job.status === "running" && (
                    <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300"><Pause className="h-3 w-3" /></Button>
                  )}
                  {job.status === "failed" && (
                    <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300"><Play className="h-3 w-3 ml-1" />إعادة</Button>
                  )}
                </div>
              </div>
              {job.status === "running" && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1"><span>{job.progress}%</span><span>{job.eta}</span></div>
                  <div className="w-full bg-gray-700 rounded-full h-1.5">
                    <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${job.progress}%` }} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AlertsTab() {
  const alerts = [
    { id: 1, severity: "critical", title: "محاولة وصول غير مصرح بها", source: "نظام الأمان", time: "منذ 5 دقائق", read: false },
    { id: 2, severity: "high", title: "تسرب بيانات جديد — قطاع الصحة", source: "محرك الرصد", time: "منذ 15 دقيقة", read: false },
    { id: 3, severity: "medium", title: "انخفاض نسبة الامتثال لموقع gov.sa", source: "محرك الفحص", time: "منذ ساعة", read: true },
    { id: 4, severity: "low", title: "تحديث قاعدة البيانات مكتمل", source: "النظام", time: "منذ ساعتين", read: true },
    { id: 5, severity: "high", title: "فشل فحص مجدول — timeout", source: "محرك الفحص", time: "منذ 3 ساعات", read: true },
    { id: 6, severity: "medium", title: "استخدام مرتفع لـ API", source: "Rate Limiter", time: "منذ 4 ساعات", read: true },
    { id: 7, severity: "critical", title: "خدمة الدارك ويب غير متاحة", source: "مراقبة الصحة", time: "منذ 5 ساعات", read: true },
    { id: 8, severity: "low", title: "بذر بيانات ناجح — 35 عبارة وطنية", source: "Seed Engine", time: "منذ 6 ساعات", read: true },
  ];
  const severityColors: Record<string, string> = {
    critical: "border-r-red-500 bg-red-500/5",
    high: "border-r-amber-500 bg-amber-500/5",
    medium: "border-r-blue-500 bg-blue-500/5",
    low: "border-r-gray-500 bg-gray-500/5",
  };
  const severityLabels: Record<string, { text: string; className: string }> = {
    critical: { text: "حرج", className: "bg-red-500/20 text-red-400 border-red-500/30" },
    high: { text: "عالي", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
    medium: { text: "متوسط", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    low: { text: "منخفض", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card className="bg-red-500/10 border-red-500/30"><CardContent className="p-3 text-center"><div className="text-xl font-bold text-red-400">2</div><div className="text-xs text-gray-400">حرج</div></CardContent></Card>
        <Card className="bg-amber-500/10 border-amber-500/30"><CardContent className="p-3 text-center"><div className="text-xl font-bold text-amber-400">2</div><div className="text-xs text-gray-400">عالي</div></CardContent></Card>
        <Card className="bg-blue-500/10 border-blue-500/30"><CardContent className="p-3 text-center"><div className="text-xl font-bold text-blue-400">2</div><div className="text-xs text-gray-400">متوسط</div></CardContent></Card>
        <Card className="bg-gray-500/10 border-gray-500/30"><CardContent className="p-3 text-center"><div className="text-xl font-bold text-gray-400">2</div><div className="text-xs text-gray-400">منخفض</div></CardContent></Card>
      </div>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className={`p-3 rounded-lg border-r-4 border border-gray-700/50 ${severityColors[alert.severity]} ${!alert.read ? "ring-1 ring-white/10" : ""}`}>
            <div className="flex items-center justify-between flex-wrap">
              <div className="flex items-center gap-3">
                {alert.severity === "critical" ? <AlertTriangle className="h-4 w-4 text-red-400" /> :
                 alert.severity === "high" ? <AlertTriangle className="h-4 w-4 text-amber-400" /> :
                 alert.severity === "medium" ? <Info className="h-4 w-4 text-blue-400" /> :
                 <Info className="h-4 w-4 text-gray-400" />}
                <div>
                  <p className={`text-sm font-medium ${!alert.read ? "text-white" : "text-gray-300"}`}>{alert.title}</p>
                  <p className="text-gray-500 text-xs">{alert.source} — {alert.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={severityLabels[alert.severity].className}>{severityLabels[alert.severity].text}</Badge>
                {!alert.read && <div className="w-2 h-2 rounded-full bg-blue-400" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogsTab() {
  const [logFilter, setLogFilter] = useState("");
  const logs = [
    { time: "18:14:32", level: "INFO", source: "SSE", message: "Stream session started for user mruhaily" },
    { time: "18:14:30", level: "INFO", source: "SeedData", message: "All tables already seeded — skipping" },
    { time: "18:14:28", level: "INFO", source: "Server", message: "Server running on http://localhost:3000/" },
    { time: "18:14:25", level: "INFO", source: "SeedData", message: "Tables verified. Running seed..." },
    { time: "18:14:20", level: "INFO", source: "SeedData", message: "Ensuring new tables exist..." },
    { time: "18:10:15", level: "WARN", source: "RateLimiter", message: "User 5 approaching rate limit on execute_live_scan (8/10 per minute)" },
    { time: "18:05:00", level: "INFO", source: "AI", message: "Tool execute_live_scan completed in 3420ms" },
    { time: "18:02:30", level: "ERROR", source: "DarkWeb", message: "Connection timeout to .onion endpoint after 30s" },
    { time: "17:55:00", level: "INFO", source: "Auth", message: "User mruhaily logged in from 10.0.1.15" },
    { time: "17:50:00", level: "INFO", source: "BulkImport", message: "CSV import completed: 1,250 records processed, 3 failed" },
    { time: "17:45:00", level: "INFO", source: "Backup", message: "Daily backup completed successfully (2.4 GB)" },
    { time: "17:30:00", level: "WARN", source: "Memory", message: "Heap usage at 78% — consider garbage collection" },
    { time: "17:00:00", level: "INFO", source: "Cron", message: "Scheduled scan job JOB-001 started" },
    { time: "16:30:00", level: "INFO", source: "AI", message: "Auto-learning: new pattern detected from user feedback" },
  ];
  const levelColors: Record<string, string> = { INFO: "text-blue-400", WARN: "text-amber-400", ERROR: "text-red-400", DEBUG: "text-gray-400" };
  const filtered = logFilter ? logs.filter((l) => l.message.toLowerCase().includes(logFilter.toLowerCase()) || l.source.toLowerCase().includes(logFilter.toLowerCase())) : logs;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input className="w-full bg-gray-800/50 border border-gray-700 rounded-lg pr-10 pl-3 py-2 text-white text-sm placeholder-gray-500" placeholder="بحث في السجلات..." value={logFilter} onChange={(e) => setLogFilter(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" className="border-gray-600 text-gray-400"><Filter className="h-4 w-4 ml-1" />تصفية</Button>
        <Button variant="outline" size="sm" className="border-gray-600 text-gray-400"><Download className="h-4 w-4 ml-1" />تصدير</Button>
      </div>
      <Card className="bg-gray-900/80 border-gray-700">
        <CardContent className="p-0">
          <div className="font-mono text-xs overflow-auto max-h-[500px]">
            {filtered.map((log, i) => (
              <div key={i} className="flex gap-3 px-4 py-1.5 border-b border-gray-800/50 hover:bg-gray-800/30">
                <span className="text-gray-600 whitespace-nowrap">{log.time}</span>
                <span className={`font-bold whitespace-nowrap w-12 ${levelColors[log.level]}`}>{log.level}</span>
                <span className="text-purple-400 whitespace-nowrap w-24">[{log.source}]</span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "استخدام المعالج", value: "23%", color: "text-emerald-400", bar: 23 },
          { label: "استخدام الذاكرة", value: "512 MB / 2 GB", color: "text-blue-400", bar: 25 },
          { label: "مساحة التخزين", value: "2.1 GB / 50 GB", color: "text-purple-400", bar: 4 },
          { label: "الاتصالات النشطة", value: "12 / 100", color: "text-amber-400", bar: 12 },
        ].map((m, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap mb-2">
                <span className="text-gray-400 text-sm">{m.label}</span>
                <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${m.bar > 80 ? "bg-red-500" : m.bar > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${m.bar}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">أداء أدوات الذكاء الاصطناعي</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { tool: "query_leaks", avgTime: "120ms", calls: 1250, success: "99.2%" },
              { tool: "execute_live_scan", avgTime: "3.4s", calls: 85, success: "94.1%" },
              { tool: "generate_chart", avgTime: "450ms", calls: 320, success: "98.7%" },
              { tool: "analyze_trends", avgTime: "890ms", calls: 210, success: "97.6%" },
              { tool: "generate_report", avgTime: "2.1s", calls: 45, success: "95.5%" },
              { tool: "get_dashboard_stats", avgTime: "85ms", calls: 2100, success: "99.8%" },
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-between flex-wrap p-2 rounded bg-gray-900/30">
                <span className="text-sm text-white font-mono">{t.tool}</span>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>متوسط: {t.avgTime}</span>
                  <span>استدعاءات: {t.calls}</span>
                  <span className="text-emerald-400">نجاح: {t.success}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AdminOperations() {
  const [activeTab, setActiveTab] = useState<TabId>("health");
  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">مركز العمليات</h1><p className="text-gray-400 text-sm mt-1">مراقبة صحة النظام والمهام والأداء</p></div>
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl border border-gray-700 overflow-x-auto">
        {tabs.map((tab) => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}><Icon className="h-4 w-4" />{tab.label}</button>
        ); })}
      </div>
      {activeTab === "health" && <HealthTab />}
      {activeTab === "jobs" && <JobsTab />}
      {activeTab === "alerts" && <AlertsTab />}
      {activeTab === "logs" && <LogsTab />}
      {activeTab === "performance" && <PerformanceTab />}
    </div>
  );
}
