
import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { downloadBase64File } from "@/lib/excelExport";
import {
  History,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Search,
  ExternalLink,
  Eye,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  Activity,
  Globe,
  Shield,
  AlertTriangle,
  Play,
  Square,
  Ban,
  Download,
  FileSpreadsheet,
  Bell,
  BellOff,
  Rocket,
} from "lucide-react";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const SCAN_CHANNEL_NAME = 'rasid-scan-notifications';

const statusConfig: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
  pending: { label: "في الانتظار", color: "text-blue-600", icon: Clock, bgColor: "bg-blue-500/10" },
  running: { label: "قيد التنفيذ", color: "text-amber-600", icon: Loader2, bgColor: "bg-amber-500/10" },
  processing: { label: "جاري المعالجة", color: "text-amber-600", icon: Loader2, bgColor: "bg-amber-500/10" },
  completed: { label: "مكتمل", color: "text-emerald-600", icon: CheckCircle2, bgColor: "bg-emerald-500/10" },
  failed: { label: "فشل", color: "text-red-600", icon: XCircle, bgColor: "bg-red-500/10" },
  cancelled: { label: "ملغي", color: "text-slate-500", icon: Ban, bgColor: "bg-slate-500/10" },
};

function formatDuration(start: string | null, end: string | null): string {
  if (!start) return "-";
  const s = new Date(start).getTime();
  const e = end ? new Date(end).getTime() : Date.now();
  const diff = Math.floor((e - s) / 1000);
  const m = Math.floor(diff / 60);
  const sec = diff % 60;
  if (m > 60) {
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
  }
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

export default function ScanHistory() {
  const { playClick, playHover } = useSoundEffects();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedJob, setExpandedJob] = useState<number | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  const { data, isLoading, refetch } = trpc.batchScan.jobs.useQuery({ page, limit: 15 });
  const [exportingJobId, setExportingJobId] = useState<number | null>(null);
  const exportJobExcel = trpc.batchScan.exportJobExcel.useMutation({
    onSuccess: (data: any) => {
      if (data?.base64) {
        downloadBase64File(data.base64, data.filename);
        toast.success('تم تصدير ملف Excel بنجاح');
      }
      setExportingJobId(null);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تصدير Excel');
      setExportingJobId(null);
    },
  });

  // Listen for scan completion broadcasts
  useEffect(() => {
    try {
      const channel = new BroadcastChannel(SCAN_CHANNEL_NAME);
      channel.onmessage = (event) => {
        const { type, jobName, completed, failed, total, status } = event.data;
        if (type === 'scan-complete') {
          toast.success(`اكتمل الفحص: ${jobName}`, {
            description: `${completed} ناجح | ${failed} فاشل | الإجمالي: ${total}`,
            duration: 10000,
          });
          refetch();
        } else if (type === 'scan-failed') {
          toast.error(`فشل الفحص: ${jobName}`, { duration: 8000 });
          refetch();
        } else if (type === 'scan-cancelled') {
          toast.warning(`تم إيقاف الفحص: ${jobName}`, {
            description: `${completed} موقع مكتمل من ${total}`,
            duration: 8000,
          });
          refetch();
        }
      };
      return () => channel.close();
    } catch { /* BroadcastChannel not supported */ }
  }, [refetch]);

  // Auto-refresh for running jobs
  const hasRunningJobs = data?.jobs?.some((j: any) => j.status === 'running' || j.status === 'processing');
  useEffect(() => {
    if (!hasRunningJobs) return;
    const interval = setInterval(() => refetch(), 5000);
    return () => clearInterval(interval);
  }, [hasRunningJobs, refetch]);

  // Enable browser notifications
  const toggleNotifications = useCallback(() => {
    if (!notificationsEnabled) {
      if ('Notification' in window) {
        Notification.requestPermission().then(perm => {
          if (perm === 'granted') {
            setNotificationsEnabled(true);
            toast.success('تم تفعيل الإشعارات');
          } else {
            toast.error('تم رفض إذن الإشعارات من المتصفح');
          }
        });
      } else {
        toast.error('المتصفح لا يدعم الإشعارات');
      }
    } else {
      setNotificationsEnabled(false);
      toast.info('تم إيقاف الإشعارات');
    }
  }, [notificationsEnabled]);

  // Open scan execution popup
  const openScanPopup = useCallback((job: any) => {
    const params = new URLSearchParams({
      totalUrls: (job.totalUrls || job.total_urls || 0).toString(),
      jobName: job.jobName || job.job_name || 'فحص',
      deepScan: '0',
      parallelScan: '1',
      captureScreenshots: '1',
      extractText: '1',
      scanApps: '0',
      bypassDynamic: '0',
      scanDepth: '1',
      timeout: '30',
    });
    const url = `/scan-execution/${job.id}?${params.toString()}`;
    const width = Math.min(1400, window.screen.availWidth - 100);
    const height = Math.min(900, window.screen.availHeight - 100);
    const left = Math.round((window.screen.availWidth - width) / 2);
    const top = Math.round((window.screen.availHeight - height) / 2);
    const popup = window.open(
      url,
      `rasid_scan_${job.id}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`
    );
    if (!popup || popup.closed) {
      // Fallback: navigate to the scan execution page
      window.location.href = url;
    } else {
      popup.focus();
    }
  }, []);

  // Filter jobs
  const filteredJobs = (data?.jobs || []).filter((job: any) => {
    const name = job.jobName || job.job_name || job.file_name || '';
    const matchesSearch = !searchQuery || name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalJobs = data?.total || 0;
  const runningCount = (data?.jobs || []).filter((j: any) => j.status === 'running' || j.status === 'processing').length;
  const completedCount = (data?.jobs || []).filter((j: any) => j.status === 'completed').length;
  const failedCount = (data?.jobs || []).filter((j: any) => j.status === 'failed' || j.status === 'cancelled').length;

  return (
    <div
      className="overflow-x-hidden max-w-full space-y-6">
      <WatermarkLogo />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
            <History className="h-7 w-7 text-primary" />
            سجل الفحوصات
          </h1>
          <p className="text-muted-foreground mt-1">متابعة جميع عمليات الفحص السابقة وإعادة فتح شاشات التنفيذ</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={notificationsEnabled ? "default" : "outline"}
            size="sm"
            onClick={toggleNotifications}
            className="gap-2"
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {notificationsEnabled ? 'الإشعارات مفعلة' : 'تفعيل الإشعارات'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children">
        <Card
          className="bg-gradient-to-br from-blue-50 from-blue-950/30 to-blue-900/20 border-blue-800/30 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
          onClick={() => openDrillDown({ title: 'إجمالي الفحوصات', subtitle: 'جميع الفحوصات التي تم إنشاؤها' })}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalJobs}</div>
            <div className="text-xs text-blue-600/70 mt-1">إجمالي الفحوصات</div>
          </CardContent>
        </Card>
        <Card
          className="bg-gradient-to-br from-amber-50 from-amber-950/30 to-amber-900/20 border-amber-800/30 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
          onClick={() => openDrillDown({ title: 'الفحوصات قيد التنفيذ', subtitle: 'الفحوصات التي تعمل حالياً' })}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{runningCount}</div>
            <div className="text-xs text-amber-600/70 mt-1">قيد التنفيذ</div>
            {runningCount > 0 && <div className="mt-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" /></div>}
          </CardContent>
        </Card>
        <Card
          className="bg-gradient-to-br from-emerald-50 from-emerald-950/30 to-emerald-900/20 border-emerald-800/30 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
          onClick={() => openDrillDown({ title: 'الفحوصات المكتملة', subtitle: 'الفحوصات التي انتهت بنجاح', complianceStatus: 'compliant' })}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{completedCount}</div>
            <div className="text-xs text-emerald-600/70 mt-1">مكتمل</div>
          </CardContent>
        </Card>
        <Card
          className="bg-gradient-to-br from-red-50 from-red-950/30 to-red-900/20 border-red-800/30 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep"
          onClick={() => openDrillDown({ title: 'الفحوصات الفاشلة أو الملغاة', subtitle: 'الفحوصات التي لم تكتمل أو تم إلغاؤها', complianceStatus: 'non_compliant' })}
        >
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
            <div className="text-xs text-red-600/70 mt-1">فاشل / ملغي</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث باسم الفحص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pe-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'running', label: 'قيد التنفيذ' },
            { value: 'completed', label: 'مكتمل' },
            { value: 'failed', label: 'فاشل' },
            { value: 'cancelled', label: 'ملغي' },
          ].map(f => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
              className="text-xs"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-24" /></Card>
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-3">
          {filteredJobs.map((job: any, i: number) => {
            const config = statusConfig[job.status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedJob === job.id;
            const isRunning = job.status === 'running' || job.status === 'processing';
            const totalUrls = job.totalUrls || job.total_urls || 0;
            const completedUrls = job.completedUrls || job.completed_urls || 0;
            const failedUrls = job.failedUrls || job.failed_urls || 0;
            const progressPct = totalUrls > 0 ? Math.round(((completedUrls + failedUrls) / totalUrls) * 100) : 0;
            const jobName = job.jobName || job.job_name || job.file_name || `فحص #${job.id}`;

            return (
              <Card
                key={job.id}
                className={`transition-all duration-300 hover:shadow-lg ${isRunning ? 'ring-1 ring-amber-400/30' : ''}`}
               
              >
                <CardContent
                  className="p-4 cursor-pointer hover:scale-[1.005] transition-all"
                  onClick={() => openDrillDown({ title: `تفاصيل الفحص: ${jobName}`, subtitle: `عرض جميع المواقع المرتبطة بهذا الفحص` })}
                >
                  {/* Main Row */}
                  <div className="flex items-center gap-3">
                    {/* Status Icon */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${config.bgColor}`}>
                      <StatusIcon className={`h-5 w-5 ${config.color} ${isRunning ? 'animate-spin' : ''}`} />
                    </div>

                    {/* Job Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-semibold text-sm truncate">{jobName}</h3>
                        <Badge
                          variant="outline"
                          className={`text-xs sm:text-[10px] shrink-0 ${config.color} border-current/20 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all`}
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `الفحوصات بحالة: ${config.label}` }); }}
                        >
                          {config.label}
                        </Badge>
                        {isRunning && (
                          <span className="text-xs sm:text-[10px] text-amber-500 animate-pulse font-medium">● مباشر</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(job.createdAt || job.created_at).toLocaleDateString("ar-SA-u-nu-latn", {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        <span
                          className="flex items-center gap-1 cursor-pointer hover:text-primary transition-all"
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `جميع المواقع في الفحص: ${jobName}` }); }}
                        >
                          <Globe className="h-3 w-3" />
                          {totalUrls} موقع
                        </span>
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {formatDuration(job.startedAt || job.started_at, job.completedAt || job.completed_at)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {(isRunning || job.status === 'completed' || job.status === 'cancelled') && (
                        <Button
                          size="sm"
                          variant={isRunning ? "default" : "outline"}
                          onClick={(e) => { e.stopPropagation(); openScanPopup(job); }}
                          className={`gap-1.5 text-xs ${isRunning ? 'bg-amber-600 hover:bg-amber-700 text-white animate-pulse' : ''}`}
                        >
                          {isRunning ? <Play className="h-3.5 w-3.5" /> : <ExternalLink className="h-3.5 w-3.5" />}
                          {isRunning ? 'متابعة' : 'فتح'}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); setExpandedJob(isExpanded ? null : job.id); }}
                        className="h-8 w-8 p-0"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar for running jobs */}
                  {isRunning && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span
                          className="cursor-pointer hover:text-primary transition-all"
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `المواقع المكتملة في الفحص: ${jobName}` }); }}
                        >التقدم: {completedUrls + failedUrls} / {totalUrls}</span>
                        <span>{progressPct}%</span>
                      </div>
                      <Progress value={progressPct} className="h-2" />
                    </div>
                  )}

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[rgba(197,165,90,0.10)]/50">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 stagger-children">
                        <div
                          className="text-center p-3 rounded-lg bg-muted/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `المواقع الناجحة في الفحص: ${jobName}`, complianceStatus: 'compliant' }); }}
                        >
                          <div className="text-lg font-bold text-emerald-600">{completedUrls}</div>
                          <div className="text-xs sm:text-[10px] text-muted-foreground">ناجح</div>
                        </div>
                        <div
                          className="text-center p-3 rounded-lg bg-muted/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `المواقع الفاشلة في الفحص: ${jobName}`, complianceStatus: 'non_compliant' }); }}
                        >
                          <div className="text-lg font-bold text-red-600">{failedUrls}</div>
                          <div className="text-xs sm:text-[10px] text-muted-foreground">فاشل</div>
                        </div>
                        <div
                          className="text-center p-3 rounded-lg bg-muted/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `كل المواقع في الفحص: ${jobName}` }); }}
                        >
                          <div className="text-lg font-bold text-blue-600">{totalUrls}</div>
                          <div className="text-xs sm:text-[10px] text-muted-foreground">الإجمالي</div>
                        </div>
                        <div
                          className="text-center p-3 rounded-lg bg-muted/50 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `نسبة الإنجاز للفحص: ${jobName}` }); }}
                        >
                          <div className="text-lg font-bold text-primary">{progressPct}%</div>
                          <div className="text-xs sm:text-[10px] text-muted-foreground">نسبة الإنجاز</div>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-muted-foreground mb-3 stagger-children">
                        <div className="flex items-center gap-1.5">
                          <Rocket className="h-3 w-3 text-blue-500" />
                          <span>البدء: {job.startedAt || job.started_at ? new Date(job.startedAt || job.started_at).toLocaleString("ar-SA-u-nu-latn") : '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                          <span>الانتهاء: {job.completedAt || job.completed_at ? new Date(job.completedAt || job.completed_at).toLocaleString("ar-SA-u-nu-latn") : '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Activity className="h-3 w-3 text-primary" />
                          <span>المدة: {formatDuration(job.startedAt || job.started_at, job.completedAt || job.completed_at)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => { e.stopPropagation(); openScanPopup(job); }}
                          className="gap-1.5 text-xs"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          فتح شاشة التنفيذ
                        </Button>
                        {(job.status === 'completed' || job.status === 'cancelled') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); window.location.href = '/scan-library'; }}
                            className="gap-1.5 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            عرض النتائج
                          </Button>
                        )}
                        {(job.status === 'completed' || job.status === 'cancelled') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); setExportingJobId(job.id); exportJobExcel.mutate({ jobId: job.id }); }}
                            disabled={exportingJobId === job.id}
                            className="gap-1.5 text-xs"
                          >
                            <FileSpreadsheet className="h-3.5 w-3.5" />
                            {exportingJobId === job.id ? 'جاري...' : 'تصدير Excel'}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-dashed glass-card gold-sweep">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <History className="h-14 w-14 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">لا توجد فحوصات</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchQuery || statusFilter !== 'all'
                ? 'لا توجد نتائج تطابق معايير البحث'
                : 'ابدأ فحصاً جديداً من صفحة الفحص المتقدم'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.total > 15 && (
        <div className="flex justify-center items-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            السابق
          </Button>
          <span className="text-sm text-muted-foreground">
            صفحة {page} من {Math.ceil(data.total / 15)}
          </span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 15)} onClick={() => setPage(p => p + 1)}>
            التالي
          </Button>
        </div>
      )}

      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
