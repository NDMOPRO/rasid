import { useState, useRef, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FileSearch, Upload, Play, Pause, XCircle, Trash2, Download,
  Loader2, CheckCircle2, AlertTriangle, FileSpreadsheet, Eye,
  ArrowRight, BarChart3, Shield, Clock, RefreshCw, ChevronLeft,
  ChevronRight, Filter, Database, Zap, TrendingUp, FileText,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const clauseNames = [
  "تحديد الغرض من جمع البيانات الشخصية",
  "تحديد محتوى البيانات الشخصية المطلوب جمعها",
  "تحديد طريقة جمع البيانات الشخصية",
  "تحديد وسيلة حفظ البيانات الشخصية",
  "تحديد كيفية معالجة البيانات الشخصية",
  "تحديد كيفية إتلاف البيانات الشخصية",
  "تحديد حقوق صاحب البيانات الشخصية",
  "تحديد كيفية ممارسة صاحب البيانات لحقوقه",
];

const clauseShortNames = [
  "الغرض", "المحتوى", "طريقة الجمع", "وسيلة الحفظ",
  "المعالجة", "الإتلاف", "الحقوق", "ممارسة الحقوق",
];

const statusLabels: Record<string, string> = {
  pending: "في الانتظار",
  running: "جاري التحليل",
  paused: "متوقف مؤقتاً",
  completed: "مكتمل",
  failed: "فشل",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  running: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  paused: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

const complianceLabels: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  no_policy: "لا يوجد سياسة",
  error: "خطأ",
};

const complianceColors: Record<string, string> = {
  compliant: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  partially_compliant: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  non_compliant: "bg-red-500/10 text-red-400 border-red-500/20",
  no_policy: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function BulkAnalysis() {
  const { playClick, playHover } = useSoundEffects();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [jobName, setJobName] = useState("");
  const [importJobName, setImportJobName] = useState("تحليل المواقع المكتشفة");
  const [csvUrls, setCsvUrls] = useState<{ domain: string; privacyUrl: string }[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const PAGE_SIZE = 50;

  const { data: jobs, isLoading: jobsLoading, refetch: refetchJobs } = trpc.bulkAnalysis.listJobs.useQuery();
  
  const { data: jobStats, refetch: refetchStats } = trpc.bulkAnalysis.getJobStats.useQuery(
    { jobId: selectedJobId! },
    { enabled: !!selectedJobId, refetchInterval: 5000 }
  );

  const { data: resultsData, isLoading: resultsLoading, refetch: refetchResults } = trpc.bulkAnalysis.getResults.useQuery(
    { jobId: selectedJobId!, limit: PAGE_SIZE, offset: page * PAGE_SIZE, status: statusFilter === "all" ? undefined : statusFilter },
    { enabled: !!selectedJobId, refetchInterval: 10000 }
  );

  const createJob = trpc.bulkAnalysis.createJob.useMutation({
    onSuccess: (data) => {
      toast.success("تم إنشاء وظيفة التحليل بنجاح");
      setShowCreateDialog(false);
      setJobName("");
      setCsvUrls([]);
      refetchJobs();
      setSelectedJobId(data.jobId);
    },
    onError: (err) => toast.error(err.message),
  });

  const importCrawl = trpc.bulkAnalysis.importCrawlResults.useMutation({
    onSuccess: (data) => {
      toast.success(`تم استيراد ${data.count} موقع بنجاح`);
      setShowImportDialog(false);
      refetchJobs();
      setSelectedJobId(data.jobId);
    },
    onError: (err) => toast.error(err.message),
  });

  const startJob = trpc.bulkAnalysis.startJob.useMutation({
    onSuccess: () => {
      toast.success("بدأ التحليل");
      refetchJobs();
      refetchStats();
    },
    onError: (err) => toast.error(err.message),
  });

  const pauseJob = trpc.bulkAnalysis.pauseJob.useMutation({
    onSuccess: () => {
      toast.success("تم إيقاف التحليل مؤقتاً");
      refetchJobs();
    },
  });

  const cancelJob = trpc.bulkAnalysis.cancelJob.useMutation({
    onSuccess: () => {
      toast.success("تم إلغاء التحليل");
      refetchJobs();
    },
  });

  const deleteJob = trpc.bulkAnalysis.deleteJob.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الوظيفة");
      setSelectedJobId(null);
      refetchJobs();
    },
  });

  const exportExcel = trpc.bulkAnalysis.exportExcel.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([Uint8Array.from(atob(data.base64 as any), c => c.charCodeAt(0))], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير التقرير بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCsvUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter(l => l.trim());
      const urls: { domain: string; privacyUrl: string }[] = [];
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",");
        if (parts.length >= 2) {
          const domain = parts[0].trim().replace(/^["']|["']$/g, '');
          const privacyUrl = parts[1].trim().replace(/^["']|["']$/g, '');
          if (domain) urls.push({ domain, privacyUrl });
        }
      }
      setCsvUrls(urls);
      toast.success(`تم تحميل ${urls.length} رابط`);
    };
    reader.readAsText(file);
  }, []);

  const selectedJob = useMemo(() => {
    if (!selectedJobId || !jobs) return null;
    return jobs.find((j: any) => j.id === selectedJobId) || jobStats?.job || null;
  }, [selectedJobId, jobs, jobStats]);

  const progressPercent = useMemo(() => {
    if (!selectedJob) return 0;
    const total = selectedJob.totalUrls || 1;
    const done = (selectedJob.analyzedUrls || 0) + (selectedJob.failedUrls || 0);
    return Math.round((done / total) * 100);
  }, [selectedJob]);

  const totalPages = useMemo(() => {
    if (!resultsData?.total) return 1;
    return Math.ceil(resultsData.total / PAGE_SIZE);
  }, [resultsData]);

  // ─── Job List View ───
  if (!selectedJobId) {
    return (
    <div className="space-y-6 p-1">
      <WatermarkLogo />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-3">
              <FileSearch className="h-7 w-7 text-primary" />
              تحليل سياسات الخصوصية الجماعي
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              تحليل تلقائي لسياسات الخصوصية باستخدام الذكاء الاصطناعي وفقاً للمادة 12 من نظام حماية البيانات الشخصية
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Database className="h-4 w-4" />
                  استيراد من المواقع المكتشفة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>استيراد المواقع المكتشفة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    سيتم استيراد جميع المواقع التي تم اكتشاف رابط سياسة خصوصية لها من قاعدة البيانات
                  </p>
                  <Input
                    value={importJobName}
                    onChange={(e) => setImportJobName(e.target.value)}
                    placeholder="اسم الوظيفة"
                    dir="rtl"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => importCrawl.mutate({ jobName: importJobName })}
                    disabled={importCrawl.isPending || !importJobName}
                    className="gap-2"
                  >
                    {importCrawl.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                    استيراد وإنشاء
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="gap-2 btn-glow">
                  <Upload className="h-4 w-4" />
                  رفع ملف CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>إنشاء وظيفة تحليل جديدة</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Input
                    value={jobName}
                    onChange={(e) => setJobName(e.target.value)}
                    placeholder="اسم الوظيفة"
                    dir="rtl"
                  />
                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
                      ${csvUrls.length > 0 ? "border-emerald-500/50 bg-emerald-500/5" : "border-border hover:border-primary/50"}`}
                    onClick={() => fileRef.current?.click()}
                  >
                    <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvUpload} />
                    {csvUrls.length > 0 ? (
                      <div className="space-y-2">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                        <p className="text-emerald-400 font-medium">{csvUrls.length} رابط جاهز للتحليل</p>
                        <p className="text-xs text-muted-foreground">اضغط لاختيار ملف آخر</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">اسحب ملف CSV هنا أو اضغط للاختيار</p>
                        <p className="text-xs text-muted-foreground">الصيغة: domain,privacy_url</p>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={() => createJob.mutate({ jobName, urls: csvUrls, sourceType: "csv_import" })}
                    disabled={createJob.isPending || !jobName || csvUrls.length === 0}
                    className="gap-2"
                  >
                    {createJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    إنشاء ({csvUrls.length} رابط)
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        {jobs && jobs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-primary">{jobs.length}</div>
                <div className="text-xs text-muted-foreground mt-1">إجمالي الوظائف</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-emerald-400">
                  {jobs.filter((j: any) => j.status === "completed").length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">مكتملة</div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-amber-400">
                  {jobs.filter((j: any) => j.status === "running").length}
                </div>
                <div className="text-xs text-muted-foreground mt-1">قيد التنفيذ</div>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {jobs.reduce((sum: number, j: any) => sum + (j.totalUrls || 0), 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground mt-1">إجمالي المواقع</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Jobs List */}
        {jobsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="py-20 text-center">
              <FileSearch className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">لا توجد وظائف تحليل</h3>
              <p className="text-sm text-muted-foreground/70 mt-2">
                ابدأ بإنشاء وظيفة جديدة عبر رفع ملف CSV أو استيراد المواقع المكتشفة
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <Card
                key={job.id}
                className="bg-card/50 border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => { setSelectedJobId(job.id); setPage(0); setStatusFilter("all"); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <FileSearch className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold truncate">{job.jobName}</h3>
                          <Badge variant="outline" className={statusColors[job.status] || ""}>
                            {statusLabels[job.status] || job.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                          <span>{job.totalUrls?.toLocaleString()} موقع</span>
                          <span>•</span>
                          <span>{new Date(job.createdAt).toLocaleDateString("ar-SA")}</span>
                          {job.status === "completed" && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">متوسط: {Math.round(job.avgScore || 0)}%</span>
                            </>
                          )}
                        </div>
                        {(job.status === "running" || job.status === "completed") && (
                          <div className="mt-2">
                            <Progress
                              value={Math.round(((job.analyzedUrls || 0) + (job.failedUrls || 0)) / (job.totalUrls || 1) * 100)}
                              className="h-1.5"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === "completed" && (
                        <div className="flex gap-1.5 text-xs">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">{job.compliantCount} ممتثل</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">{job.partialCount} جزئي</span>
                          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400">{job.nonCompliantCount} غير ممتثل</span>
                        </div>
                      )}
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── Job Detail View ───
  const job = selectedJob || jobStats?.job;
  const cs = jobStats?.clauseStats;

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setSelectedJobId(null)}>
            <ArrowRight className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
              {job?.jobName || "وظيفة التحليل"}
              {job && (
                <Badge variant="outline" className={statusColors[job.status] || ""}>
                  {statusLabels[job.status] || job.status}
                </Badge>
              )}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {job?.totalUrls?.toLocaleString()} موقع • أُنشئت {job ? new Date(job.createdAt).toLocaleDateString("ar-SA") : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {job?.status === "pending" && (
            <Button onClick={() => startJob.mutate({ jobId: selectedJobId! })} className="gap-2 btn-glow" disabled={startJob.isPending}>
              {startJob.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              بدء التحليل
            </Button>
          )}
          {job?.status === "running" && (
            <Button variant="outline" onClick={() => pauseJob.mutate({ jobId: selectedJobId! })} className="gap-2">
              <Pause className="h-4 w-4" />
              إيقاف مؤقت
            </Button>
          )}
          {job?.status === "paused" && (
            <Button onClick={() => startJob.mutate({ jobId: selectedJobId! })} className="gap-2">
              <Play className="h-4 w-4" />
              استئناف
            </Button>
          )}
          {(job?.status === "running" || job?.status === "paused") && (
            <Button variant="destructive" onClick={() => cancelJob.mutate({ jobId: selectedJobId! })} className="gap-2">
              <XCircle className="h-4 w-4" />
              إلغاء
            </Button>
          )}
          {job?.status === "completed" && (
            <Button
              variant="outline"
              onClick={() => exportExcel.mutate({ jobId: selectedJobId! })}
              disabled={exportExcel.isPending}
              className="gap-2"
            >
              {exportExcel.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              تصدير Excel
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { refetchStats(); refetchResults(); refetchJobs(); }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-400 hover:text-red-300"
            onClick={() => { if (confirm("هل أنت متأكد من حذف هذه الوظيفة؟")) deleteJob.mutate({ jobId: selectedJobId! }); }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {job && (job.status === "running" || job.status === "paused") && (
        <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">تقدم التحليل</span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>تم تحليل {((job.analyzedUrls || 0) + (job.failedUrls || 0)).toLocaleString()} من {job.totalUrls?.toLocaleString()}</span>
              {job.status === "running" && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  جاري التحليل...
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {job && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 stagger-children">
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-blue-400">{job.totalUrls?.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">إجمالي المواقع</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{(job.analyzedUrls || 0).toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">تم تحليلها</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-emerald-400">{(job.compliantCount || 0).toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">ممتثل</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">{(job.partialCount || 0).toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">ممتثل جزئياً</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-red-400">{(job.nonCompliantCount || 0).toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">غير ممتثل</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-gray-400">{(job.noPolicyCount || 0).toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">لا يوجد سياسة</div>
            </CardContent>
          </Card>
          <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
            <CardContent className="p-3 text-center">
              <div className="text-2xl font-bold text-primary">{Math.round(job.avgScore || 0)}%</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">متوسط النتيجة</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Clause-Level Compliance Chart */}
      {cs && cs.total > 0 && (
        <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              نسبة الامتثال حسب البنود (المادة 12)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
              {clauseNames.map((name, i) => {
                const val = Number(cs[`c${i + 1}` as keyof typeof cs]) || 0;
                const pct = cs.total > 0 ? Math.round((val / cs.total) * 100) : 0;
                return (
                  <div key={i} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="text-muted-foreground truncate max-w-[180px]">
                              {i + 1}. {clauseShortNames[i]}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p className="text-xs max-w-xs">{name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className={`font-medium ${pct >= 60 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-red-400"}`}>
                        {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="text-[10px] text-muted-foreground">{val} من {cs.total}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card className="glass-card gold-sweep bg-card/50 border-border/50 elev-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              نتائج التحليل
              {resultsData && <span className="text-xs text-muted-foreground font-normal">({resultsData.total} نتيجة)</span>}
            </CardTitle>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 ms-2" />
                <SelectValue placeholder="تصفية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="compliant">ممتثل</SelectItem>
                <SelectItem value="partially_compliant">ممتثل جزئياً</SelectItem>
                <SelectItem value="non_compliant">غير ممتثل</SelectItem>
                <SelectItem value="no_policy">لا يوجد سياسة</SelectItem>
                <SelectItem value="error">خطأ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {resultsLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : !resultsData?.results?.length ? (
            <div className="text-center py-10 text-muted-foreground">
              لا توجد نتائج
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-end py-2 px-3 text-xs text-muted-foreground font-medium">النطاق</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">النتيجة</th>
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">الحالة</th>
                      {clauseShortNames.map((name, i) => (
                        <th key={i} className="text-center py-2 px-1 text-xs text-muted-foreground font-medium">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <span className="text-[10px]">ب{i + 1}</span>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <p className="text-xs">{clauseNames[i]}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </th>
                      ))}
                      <th className="text-center py-2 px-2 text-xs text-muted-foreground font-medium">تفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultsData.results.map((r: any) => (
                      <tr key={r.id} className="border-b border-border/30 hover:bg-accent/5 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs truncate max-w-[200px]">{r.domain}</span>
                            {r.privacyUrl && (
                              <a href={r.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                <FileText className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <span className={`font-bold text-xs ${
                            (r.overallScore || 0) >= 60 ? "text-emerald-400" :
                            (r.overallScore || 0) >= 40 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {r.overallScore || 0}%
                          </span>
                        </td>
                        <td className="text-center py-2.5 px-2">
                          <Badge variant="outline" className={`text-[10px] ${complianceColors[r.complianceStatus] || ""}`}>
                            {complianceLabels[r.complianceStatus] || r.complianceStatus}
                          </Badge>
                        </td>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <td key={n} className="text-center py-2.5 px-1">
                            {r[`clause${n}`] ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400/50 mx-auto" />
                            )}
                          </td>
                        ))}
                        <td className="text-center py-2.5 px-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setSelectedResult(r)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(197,165,90,0.10)]/30">
                <div className="text-xs text-muted-foreground">
                  صفحة {page + 1} من {totalPages}
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Result Detail Dialog */}
      <Dialog open={!!selectedResult} onOpenChange={() => setSelectedResult(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedResult && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  تفاصيل تحليل: {selectedResult.domain}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Score & Status */}
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${
                      (selectedResult.overallScore || 0) >= 60 ? "text-emerald-400" :
                      (selectedResult.overallScore || 0) >= 40 ? "text-amber-400" : "text-red-400"
                    }`}>
                      {selectedResult.overallScore || 0}%
                    </span>
                  </div>
                  <div>
                    <Badge variant="outline" className={complianceColors[selectedResult.complianceStatus] || ""}>
                      {complianceLabels[selectedResult.complianceStatus] || selectedResult.complianceStatus}
                    </Badge>
                    {selectedResult.privacyUrl && (
                      <a href={selectedResult.privacyUrl} target="_blank" rel="noopener noreferrer"
                        className="block text-xs text-primary hover:underline mt-1 truncate max-w-md">
                        {selectedResult.privacyUrl}
                      </a>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {selectedResult.summary && (
                  <div className="p-3 rounded-lg bg-accent/5 border border-border/30">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">الملخص</h4>
                    <p className="text-sm">{selectedResult.summary}</p>
                  </div>
                )}

                {/* Clause Details */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">تفصيل البنود</h4>
                  {clauseNames.map((name, i) => {
                    const n = i + 1;
                    const compliant = selectedResult[`clause${n}`];
                    const evidence = selectedResult[`clause${n}Evidence`];
                    return (
                      <div key={i} className={`p-3 rounded-lg border ${compliant ? "border-emerald-500/20 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                        <div className="flex items-center gap-2">
                          {compliant ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                          )}
                          <span className="text-xs font-medium">البند {n}: {name}</span>
                        </div>
                        {evidence && (
                          <p className="text-xs text-muted-foreground mt-1 me-6">{evidence}</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Error Message */}
                {selectedResult.errorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-xs text-red-400">{selectedResult.errorMessage}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
