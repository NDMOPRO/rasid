import { useState, useRef, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Upload, Play, Pause, StopCircle, RefreshCw, Download, Search,
  Globe, Shield, ShieldCheck, ShieldX, ShieldAlert, AlertTriangle,
  FileText, Mail, Phone, ExternalLink, Eye, BarChart3, Loader2,
  CheckCircle2, XCircle, Clock, Zap, ChevronLeft, ChevronRight,
  Brain, FileWarning, Activity, Sparkles, Radio
} from "lucide-react";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

function statusBadge(status: string) {
  switch (status) {
    case 'compliant': return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">ممتثل</Badge>;
    case 'partially_compliant': return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">ممتثل جزئياً</Badge>;
    case 'non_compliant': return <Badge className="bg-red-500/20 text-red-600 border-red-500/30">غير ممتثل</Badge>;
    case 'no_policy': return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30">لا توجد سياسة</Badge>;
    case 'error': return <Badge className="bg-red-800/20 text-red-800 border-red-800/30">خطأ</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

function scanStatusBadge(status: string) {
  switch (status) {
    case 'pending': return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />قيد الانتظار</Badge>;
    case 'scanning': return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30 gap-1"><Loader2 className="h-3 w-3 animate-spin" />جاري المسح</Badge>;
    case 'completed': return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 gap-1"><CheckCircle2 className="h-3 w-3" />مكتمل</Badge>;
    case 'failed': return <Badge className="bg-red-500/20 text-red-600 border-red-500/30 gap-1"><XCircle className="h-3 w-3" />فشل</Badge>;
    case 'skipped': return <Badge className="bg-gray-500/20 text-gray-500 border-gray-500/30">تم تخطيه</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
}

export default function DeepScan() {
  const [activeTab, setActiveTab] = useState("jobs");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [jobName, setJobName] = useState("");
  const [csvText, setCsvText] = useState("");
  const [concurrency, setConcurrency] = useState(3);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [detailItem, setDetailItem] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const jobsQuery = trpc.deepScan.listJobs.useQuery(undefined, { refetchInterval: 5000 });

  // LLM Analysis queries
  const llmStatusQuery = trpc.deepScan.llmAnalysisStatus.useQuery(
    { jobId: selectedJobId! },
    { enabled: !!selectedJobId, refetchInterval: 5000 }
  );

  // Live progress query (always active)
  const liveProgressQuery = trpc.deepScan.liveProgress.useQuery(
    { jobId: selectedJobId || undefined },
    { refetchInterval: 2000 }
  );
  const statusQuery = trpc.deepScan.getStatus.useQuery(
    { jobId: selectedJobId! },
    { enabled: !!selectedJobId, refetchInterval: 3000 }
  );
  const resultsQuery = trpc.deepScan.getResults.useQuery(
    { jobId: selectedJobId!, limit: 50, offset: page * 50, status: statusFilter !== 'all' ? statusFilter : undefined, search: searchTerm || undefined },
    { enabled: !!selectedJobId && activeTab === 'results', refetchInterval: 10000 }
  );

  // Mutations
  const importMutation = trpc.deepScan.importDomains.useMutation({
    onSuccess: (data) => {
      toast.success(`تم استيراد ${data.totalDomains} نطاق بنجاح`);
      setSelectedJobId(data.jobId);
      setImportDialogOpen(false);
      jobsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const startMutation = trpc.deepScan.startJob.useMutation({
    onSuccess: () => { toast.success("تم بدء المسح العميق"); jobsQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const pauseMutation = trpc.deepScan.pauseJob.useMutation({
    onSuccess: () => toast.info("تم إيقاف المسح مؤقتاً"),
  });

  const resumeMutation = trpc.deepScan.resumeJob.useMutation({
    onSuccess: () => toast.success("تم استئناف المسح"),
  });

  const cancelMutation = trpc.deepScan.cancelJob.useMutation({
    onSuccess: () => { toast.warning("تم إلغاء المسح"); jobsQuery.refetch(); },
  });

  const retryMutation = trpc.deepScan.retryFailed.useMutation({
    onSuccess: () => toast.success("تم إعادة تعيين العناصر الفاشلة"),
  });

  // LLM Analysis mutation
  const startLLMMutation = trpc.deepScan.startLLMAnalysis.useMutation({
    onSuccess: (data) => { toast.success(data.message); llmStatusQuery.refetch(); },
    onError: (err) => toast.error(err.message),
  });

  // Failure Report mutation
  const failureReportMutation = trpc.deepScan.exportFailureReport.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([Uint8Array.from(atob(data.base64), c => c.charCodeAt(0))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = data.filename; a.click();
      URL.revokeObjectURL(url);
      toast.success(`تم تصدير تقرير الفشل (${data.total} موقع)`);
    },
    onError: (err) => toast.error(err.message),
  });

  const exportMutation = trpc.deepScan.exportExcel.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([Uint8Array.from(atob(data.base64), c => c.charCodeAt(0))], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = data.filename; a.click();
      URL.revokeObjectURL(url);
      toast.success("تم تصدير النتائج");
    },
  });

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      // Auto-set job name from file name
      if (!jobName) setJobName(file.name.replace(/\.[^.]+$/, ''));
    };
    reader.readAsText(file);
  }, [jobName]);

  const handleImport = useCallback(() => {
    if (!jobName.trim()) { toast.error("أدخل اسم المهمة"); return; }
    if (!csvText.trim()) { toast.error("أدخل النطاقات أو ارفع ملف CSV"); return; }

    // Parse CSV - extract domains from each line
    const lines = csvText.split('\n').map(l => l.trim()).filter(Boolean);
    const domains: string[] = [];
    for (const line of lines) {
      // Handle CSV with multiple columns - take first column or find domain-like value
      const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
      for (const part of parts) {
        const cleaned = part.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '').trim();
        if (cleaned && cleaned.includes('.') && !cleaned.includes(' ') && cleaned.length > 3) {
          domains.push(cleaned);
          break;
        }
      }
    }

    const uniqueDomains = Array.from(new Set(domains));
    if (uniqueDomains.length === 0) { toast.error("لم يتم العثور على نطاقات صالحة"); return; }

    importMutation.mutate({ jobName, domains: uniqueDomains });
  }, [jobName, csvText, importMutation]);

  const stats = statusQuery.data?.stats;
  const clauseStats = statusQuery.data?.clauseStats;
  const progressPercent = stats ? Math.round(((stats.completed + stats.failed + stats.skipped) / Math.max(stats.total, 1)) * 100) : 0;

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold gradient-text">المسح العميق الشامل</h1>
          <p className="text-muted-foreground mt-1">مسح فعلي عميق وذكي لجميع المواقع مع استخراج سياسات الخصوصية وتحليل الامتثال</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Upload className="h-4 w-4" />استيراد نطاقات</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>استيراد نطاقات للمسح العميق</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">اسم المهمة</label>
                  <Input value={jobName} onChange={e => setJobName(e.target.value)} placeholder="مثال: مسح المواقع السعودية 2026" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">ملف CSV</label>
                  <input ref={fileInputRef} type="file" accept=".csv,.txt" onChange={handleFileUpload} className="block w-full text-sm file:me-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">أو الصق النطاقات (نطاق واحد لكل سطر)</label>
                  <textarea value={csvText} onChange={e => setCsvText(e.target.value)} rows={6} className="w-full rounded-md border bg-background p-2 text-sm font-mono" placeholder={"example.com\nexample.sa\nsite.gov.sa"} />
                </div>
                {csvText && (
                  <p className="text-sm text-muted-foreground">
                    تم اكتشاف ~{csvText.split('\n').filter(l => l.trim()).length} سطر
                  </p>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
                <Button onClick={handleImport} disabled={importMutation.isPending}>
                  {importMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin me-2" /> : null}
                  استيراد وبدء
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs" className="gap-1"><BarChart3 className="h-4 w-4" />المهام</TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-1" disabled={!selectedJobId}><Shield className="h-4 w-4" />لوحة المتابعة</TabsTrigger>
          <TabsTrigger value="results" className="gap-1" disabled={!selectedJobId}><Globe className="h-4 w-4" />النتائج</TabsTrigger>
        </TabsList>

        {/* Jobs Tab */}
        <TabsContent value="jobs" className="space-y-4">
          {jobsQuery.isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid gap-4">
              {(jobsQuery.data || []).length === 0 && (
                <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Globe className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold">لا توجد مهام مسح عميق</h3>
                    <p className="text-muted-foreground mt-1">استورد ملف CSV يحتوي على النطاقات لبدء المسح العميق</p>
                    <Button className="mt-4" onClick={() => setImportDialogOpen(true)}>
                      <Upload className="h-4 w-4 me-2" />استيراد نطاقات
                    </Button>
                  </CardContent>
                </Card>
              )}
              {(jobsQuery.data || []).map((job: any) => (
                <Card key={job.id} className={`glass-card gold-sweep cursor-pointer transition-all hover:shadow-lg ${selectedJobId === job.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => { setSelectedJobId(job.id); setActiveTab('dashboard'); }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${job.status === 'running' ? 'bg-blue-500/20' : job.status === 'completed' ? 'bg-emerald-500/20' : 'bg-muted'}`}>
                          {job.status === 'running' ? <Loader2 className="h-5 w-5 text-blue-500 animate-spin" /> :
                           job.status === 'completed' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
                           <Clock className="h-5 w-5 text-muted-foreground" />}
                        </div>
                        <div>
                          <h3 className="font-semibold">{job.jobName || `مهمة #${job.id}`}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.totalUrls?.toLocaleString()} نطاق • {job.completedUrls?.toLocaleString() || 0} مكتمل • {job.failedUrls?.toLocaleString() || 0} فاشل
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant={job.status === 'running' ? 'default' : job.status === 'completed' ? 'secondary' : 'outline'}>
                          {job.status === 'running' ? 'جاري التنفيذ' : job.status === 'completed' ? 'مكتمل' : job.status === 'cancelled' ? 'ملغي' : 'في الانتظار'}
                        </Badge>
                        {job.totalUrls > 0 && (
                          <div className="w-24">
                            <Progress value={Math.round(((job.completedUrls || 0) + (job.failedUrls || 0)) / job.totalUrls * 100)} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {selectedJobId && statusQuery.data && (
            <>
              {/* Control Bar */}
              <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <h2 className="font-bold text-lg">{statusQuery.data.job.jobName || `مهمة #${selectedJobId}`}</h2>
                      <Badge variant={statusQuery.data.isActive ? 'default' : 'outline'}>
                        {statusQuery.data.isActive ? (statusQuery.data.isPaused ? 'متوقف مؤقتاً' : 'جاري التنفيذ') : statusQuery.data.job.status === 'completed' ? 'مكتمل' : 'في الانتظار'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      {!statusQuery.data.isActive && statusQuery.data.job.status !== 'completed' && (
                        <Button size="sm" onClick={() => startMutation.mutate({ jobId: selectedJobId, concurrency })} disabled={startMutation.isPending}>
                          <Play className="h-4 w-4 me-1" />بدء المسح
                        </Button>
                      )}
                      {statusQuery.data.isActive && !statusQuery.data.isPaused && (
                        <Button size="sm" variant="outline" onClick={() => pauseMutation.mutate()}>
                          <Pause className="h-4 w-4 me-1" />إيقاف مؤقت
                        </Button>
                      )}
                      {statusQuery.data.isActive && statusQuery.data.isPaused && (
                        <Button size="sm" onClick={() => resumeMutation.mutate()}>
                          <Play className="h-4 w-4 me-1" />استئناف
                        </Button>
                      )}
                      {statusQuery.data.isActive && (
                        <Button size="sm" variant="destructive" onClick={() => cancelMutation.mutate()}>
                          <StopCircle className="h-4 w-4 me-1" />إلغاء
                        </Button>
                      )}
                      {stats && stats.failed > 0 && !statusQuery.data.isActive && (
                        <Button size="sm" variant="outline" onClick={() => retryMutation.mutate({ jobId: selectedJobId })}>
                          <RefreshCw className="h-4 w-4 me-1" />إعادة الفاشلة ({stats.failed})
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => exportMutation.mutate({ jobId: selectedJobId })} disabled={exportMutation.isPending}>
                        <Download className="h-4 w-4 me-1" />تصدير Excel
                      </Button>
                      {stats && stats.failed > 0 && (
                        <Button size="sm" variant="outline" className="text-red-500 border-red-500/30" onClick={() => failureReportMutation.mutate({ jobId: selectedJobId })} disabled={failureReportMutation.isPending}>
                          {failureReportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin me-1" /> : <FileWarning className="h-4 w-4 me-1" />}
                          تقرير الفشل
                        </Button>
                      )}
                    </div>
                  </div>

                        {/* Live Progress Bar with Animation */}
                  {stats && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <div className="flex items-center gap-2">
                          {statusQuery.data?.isActive && (
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                            </span>
                          )}
                          <span className="text-muted-foreground">{statusQuery.data?.isActive ? 'المسح جارٍ...' : 'التقدم'}</span>
                        </div>
                        <span className="font-mono font-bold text-lg">{progressPercent}%</span>
                      </div>
                      {/* Multi-segment progress bar */}
                      <div className="relative h-4 rounded-full bg-muted overflow-hidden">
                        <div className="absolute inset-0 flex">
                          <div className="bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${Math.round(stats.completed / Math.max(stats.total, 1) * 100)}%` }} />
                          <div className="bg-red-500/70 transition-all duration-1000 ease-out" style={{ width: `${Math.round(stats.failed / Math.max(stats.total, 1) * 100)}%` }} />
                          <div className="bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${Math.round(stats.scanning / Math.max(stats.total, 1) * 100)}%` }} />
                        </div>
                        {statusQuery.data?.isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
                        )}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" /><span className="text-muted-foreground">الإجمالي: {stats.total.toLocaleString()}</span></span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /><span className="text-emerald-500">مكتمل: {stats.completed.toLocaleString()}</span></span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" /><span className="text-red-500">فاشل: {stats.failed.toLocaleString()}</span></span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /><span className="text-blue-500">جاري: {stats.scanning.toLocaleString()}</span></span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-muted inline-block border" /><span className="text-muted-foreground">في الانتظار: {stats.pending.toLocaleString()}</span></span>
                      </div>
                      {/* Estimated time */}
                      {statusQuery.data?.isActive && stats.pending > 0 && stats.completed > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          الوقت المتبقي التقريبي: {Math.round(stats.pending / Math.max(20, 1))} دقيقة (~20 موقع/دقيقة)
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stats Cards */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                  <Card className="glass-card gold-sweep scan-effect">
                    <CardContent className="p-4 text-center">
                      <ShieldCheck className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
                      <div className="text-2xl font-bold text-emerald-500">{stats.compliant.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">ممتثل</div>
                    </CardContent>
                  </Card>
                  <Card className="glass-card gold-sweep scan-effect">
                    <CardContent className="p-4 text-center">
                      <ShieldAlert className="h-8 w-8 mx-auto text-amber-500 mb-2" />
                      <div className="text-2xl font-bold text-amber-500">{stats.partiallyCompliant.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">ممتثل جزئياً</div>
                    </CardContent>
                  </Card>
                  <Card className="glass-card gold-sweep scan-effect">
                    <CardContent className="p-4 text-center">
                      <ShieldX className="h-8 w-8 mx-auto text-red-500 mb-2" />
                      <div className="text-2xl font-bold text-red-500">{stats.nonCompliant.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">غير ممتثل</div>
                    </CardContent>
                  </Card>
                  <Card className="glass-card gold-sweep scan-effect">
                    <CardContent className="p-4 text-center">
                      <AlertTriangle className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                      <div className="text-2xl font-bold text-gray-500">{stats.noPolicy.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">بدون سياسة</div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Clause Stats */}
              {clauseStats && Number(clauseStats.total) > 0 && (
                <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-lg">تحليل البنود الثمانية (المادة 12)</CardTitle>
                    <CardDescription>نسبة الامتثال لكل بند من بنود المادة 12 من نظام حماية البيانات الشخصية</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
                      {[
                        { num: 1, label: 'الغرض من الجمع', val: clauseStats.c1 },
                        { num: 2, label: 'محتوى البيانات', val: clauseStats.c2 },
                        { num: 3, label: 'طريقة الجمع', val: clauseStats.c3 },
                        { num: 4, label: 'وسيلة الحفظ', val: clauseStats.c4 },
                        { num: 5, label: 'كيفية المعالجة', val: clauseStats.c5 },
                        { num: 6, label: 'كيفية الإتلاف', val: clauseStats.c6 },
                        { num: 7, label: 'حقوق صاحب البيانات', val: clauseStats.c7 },
                        { num: 8, label: 'ممارسة الحقوق', val: clauseStats.c8 },
                      ].map(c => {
                        const pct = Math.round((Number(c.val) / Number(clauseStats.total)) * 100);
                        return (
                          <div key={c.num} className="p-3 rounded-lg bg-muted/50">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium">البند {c.num}</span>
                              <span className="text-sm font-bold">{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-2 mb-1" />
                            <p className="text-xs text-muted-foreground">{c.label}</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Average Score */}
              {stats && stats.avgScore > 0 && (
                <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl sm:text-4xl font-bold gradient-text mb-2">{Math.round(stats.avgScore)}%</div>
                    <div className="text-muted-foreground">متوسط درجة الامتثال</div>
                  </CardContent>
                </Card>
              )}

              {/* LLM Analysis Card */}
              {llmStatusQuery.data && (
                <Card className="glass-card gold-sweep border-purple-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        <CardTitle className="text-lg">تحليل الامتثال بالذكاء الاصطناعي</CardTitle>
                      </div>
                      {llmStatusQuery.data.needsAnalysis > 0 && (
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 gap-1"
                          onClick={() => startLLMMutation.mutate({ jobId: selectedJobId!, batchSize: 20 })}
                          disabled={startLLMMutation.isPending}
                        >
                          {startLLMMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                          بدء التحليل
                        </Button>
                      )}
                    </div>
                    <CardDescription>
                      تحليل نصوص سياسات الخصوصية المستخرجة وتقييم مدى امتثالها للمادة 12
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center stagger-children">
                      <div className="p-3 rounded-lg bg-purple-500/10">
                        <div className="text-2xl font-bold text-purple-500">{llmStatusQuery.data.needsAnalysis}</div>
                        <div className="text-xs text-muted-foreground mt-1">بحاجة لتحليل</div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/10">
                        <div className="text-2xl font-bold text-emerald-500">{llmStatusQuery.data.alreadyAnalyzed}</div>
                        <div className="text-xs text-muted-foreground mt-1">تم تحليلها</div>
                      </div>
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <div className="text-2xl font-bold text-blue-500">{llmStatusQuery.data.totalCompleted}</div>
                        <div className="text-xs text-muted-foreground mt-1">إجمالي المكتمل</div>
                      </div>
                    </div>
                    {llmStatusQuery.data.needsAnalysis === 0 && llmStatusQuery.data.alreadyAnalyzed > 0 && (
                      <div className="mt-3 p-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm text-center flex items-center justify-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        تم تحليل جميع سياسات الخصوصية المستخرجة
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Failure Summary Card */}
              {stats && stats.failed > 0 && (
                <Card className="glass-card gold-sweep border-red-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap">
                      <div className="flex items-center gap-2">
                        <FileWarning className="h-5 w-5 text-red-500" />
                        <CardTitle className="text-lg">المواقع الفاشلة</CardTitle>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 border-red-500/30 gap-1"
                        onClick={() => failureReportMutation.mutate({ jobId: selectedJobId! })}
                        disabled={failureReportMutation.isPending}
                      >
                        {failureReportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        تصدير تقرير مفصل
                      </Button>
                    </div>
                    <CardDescription>
                      {stats.failed.toLocaleString()} موقع فشل مسحها - يمكنك تصدير تقرير مفصل بأسباب الفشل مصنفة (DNS، خطأ خادم، انتهاء مهلة، إلخ)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4">
                      <div className="text-3xl font-bold text-red-500">{stats.failed.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground mt-1">موقع فاشل من أصل {stats.total.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground mt-1">({Math.round(stats.failed / Math.max(stats.total, 1) * 100)}% من الإجمالي)</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results" className="space-y-4">
          {selectedJobId && (
            <>
              {/* Filters */}
              <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(0); }} placeholder="بحث بالنطاق..." className="pe-10" />
                </div>
                <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(0); }}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="حالة المسح" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="failed">فاشل</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="scanning">جاري المسح</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results Table */}
              {resultsQuery.isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <>
                  <div className="rounded-lg border overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/50 border-b">
                          <th className="p-3 text-start font-medium">النطاق</th>
                          <th className="p-3 text-start font-medium">الحالة</th>
                          <th className="p-3 text-start font-medium">الخصوصية</th>
                          <th className="p-3 text-start font-medium">الدرجة</th>
                          <th className="p-3 text-start font-medium">الامتثال</th>
                          <th className="p-3 text-start font-medium">البريد</th>
                          <th className="p-3 text-center font-medium">تفاصيل</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(resultsQuery.data?.results || []).map((item: any) => (
                          <tr key={item.id} className="border-b hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <a href={`https://${item.domain}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">
                                  {item.domain}
                                </a>
                              </div>
                              {item.siteName && item.siteName !== item.domain && (
                                <p className="text-xs text-muted-foreground mt-0.5 ms-6">{item.siteName}</p>
                              )}
                            </td>
                            <td className="p-3">{scanStatusBadge(item.status)}</td>
                            <td className="p-3">
                              {item.privacyUrl ? (
                                <a href={item.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline text-xs flex items-center gap-1">
                                  <FileText className="h-3 w-3" />موجودة
                                </a>
                              ) : item.status === 'completed' ? (
                                <span className="text-red-500 text-xs">غير موجودة</span>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </td>
                            <td className="p-3">
                              <span className={`font-bold ${item.overallScore >= 60 ? 'text-emerald-500' : item.overallScore >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                {item.overallScore > 0 ? `${Math.round(item.overallScore)}%` : '-'}
                              </span>
                            </td>
                            <td className="p-3">{item.complianceStatus ? statusBadge(item.complianceStatus) : '-'}</td>
                            <td className="p-3">
                              {item.contactEmails ? (
                                <span className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" />{item.contactEmails.split(',')[0]}</span>
                              ) : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <Button size="sm" variant="ghost" onClick={() => setDetailItem(item)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="flex items-center justify-between flex-wrap">
                    <span className="text-sm text-muted-foreground">
                      إجمالي: {resultsQuery.data?.total?.toLocaleString() || 0} نتيجة
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                        <ChevronRight className="h-4 w-4" />السابق
                      </Button>
                      <span className="text-sm flex items-center px-2">صفحة {page + 1}</span>
                      <Button size="sm" variant="outline" disabled={(resultsQuery.data?.results?.length || 0) < 50} onClick={() => setPage(p => p + 1)}>
                        التالي<ChevronLeft className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!detailItem} onOpenChange={(open) => { if (!open) setDetailItem(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {detailItem.domain}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-3 text-sm stagger-children">
                  <div><span className="text-muted-foreground">اسم الموقع:</span> <span className="font-medium">{detailItem.siteName || '-'}</span></div>
                  <div><span className="text-muted-foreground">HTTP:</span> <span className="font-mono">{detailItem.httpStatus || '-'}</span></div>
                  <div><span className="text-muted-foreground">الدرجة:</span> <span className="font-bold">{detailItem.overallScore ? `${Math.round(detailItem.overallScore)}%` : '-'}</span></div>
                  <div><span className="text-muted-foreground">التقييم:</span> {detailItem.complianceStatus ? statusBadge(detailItem.complianceStatus) : '-'}</div>
                  <div><span className="text-muted-foreground">مدة المسح:</span> <span>{detailItem.scanDuration ? `${(detailItem.scanDuration / 1000).toFixed(1)}s` : '-'}</span></div>
                  <div><span className="text-muted-foreground">طريقة الاكتشاف:</span> <span>{detailItem.privacyMethod || '-'}</span></div>
                </div>

                {/* Privacy URL */}
                {detailItem.privacyUrl && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-emerald-500" />
                      <span className="font-medium text-sm">صفحة الخصوصية</span>
                    </div>
                    <a href={detailItem.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all flex items-center gap-1">
                      {detailItem.privacyUrl} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Contact Info */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">معلومات التواصل</h4>
                  <div className="space-y-1 text-sm">
                    {detailItem.contactEmails && (
                      <div className="flex items-center gap-2"><Mail className="h-3 w-3" />{detailItem.contactEmails}</div>
                    )}
                    {detailItem.contactPhones && (
                      <div className="flex items-center gap-2"><Phone className="h-3 w-3" />{detailItem.contactPhones}</div>
                    )}
                    {detailItem.contactUrl && (
                      <a href={detailItem.contactUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                        <ExternalLink className="h-3 w-3" />صفحة التواصل
                      </a>
                    )}
                    {detailItem.socialLinks && Object.keys(detailItem.socialLinks).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(detailItem.socialLinks as Record<string, string>).map(([platform, url]) => (
                          <a key={platform} href={url} target="_blank" rel="noopener noreferrer">
                            <Badge variant="outline" className="text-xs">{platform}</Badge>
                          </a>
                        ))}
                      </div>
                    )}
                    {!detailItem.contactEmails && !detailItem.contactPhones && !detailItem.contactUrl && (
                      <span className="text-muted-foreground">لم يتم العثور على معلومات تواصل</span>
                    )}
                  </div>
                </div>

                {/* Clause Analysis */}
                {detailItem.overallScore > 0 && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm mb-3">تحليل البنود الثمانية</h4>
                    <div className="space-y-2">
                      {[
                        { num: 1, label: 'الغرض من الجمع', ok: detailItem.clause1Compliant, ev: detailItem.clause1Evidence },
                        { num: 2, label: 'محتوى البيانات', ok: detailItem.clause2Compliant, ev: detailItem.clause2Evidence },
                        { num: 3, label: 'طريقة الجمع', ok: detailItem.clause3Compliant, ev: detailItem.clause3Evidence },
                        { num: 4, label: 'وسيلة الحفظ', ok: detailItem.clause4Compliant, ev: detailItem.clause4Evidence },
                        { num: 5, label: 'كيفية المعالجة', ok: detailItem.clause5Compliant, ev: detailItem.clause5Evidence },
                        { num: 6, label: 'كيفية الإتلاف', ok: detailItem.clause6Compliant, ev: detailItem.clause6Evidence },
                        { num: 7, label: 'حقوق صاحب البيانات', ok: detailItem.clause7Compliant, ev: detailItem.clause7Evidence },
                        { num: 8, label: 'ممارسة الحقوق', ok: detailItem.clause8Compliant, ev: detailItem.clause8Evidence },
                      ].map(c => (
                        <div key={c.num} className="flex items-start gap-2 text-sm">
                          {c.ok ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />}
                          <div>
                            <span className="font-medium">البند {c.num}: {c.label}</span>
                            {c.ev && <p className="text-xs text-muted-foreground mt-0.5">{c.ev}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {detailItem.summary && (
                  <div className="p-3 rounded-lg bg-muted/50">
                    <h4 className="font-medium text-sm mb-1">الملخص</h4>
                    <p className="text-sm text-muted-foreground">{detailItem.summary}</p>
                  </div>
                )}

                {/* Screenshot */}
                {detailItem.screenshotUrl && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">لقطة الشاشة</h4>
                    <img src={detailItem.screenshotUrl} alt={detailItem.domain} className="rounded-lg border w-full" />
                  </div>
                )}

                {/* Error */}
                {detailItem.errorMessage && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <div className="flex items-center gap-2 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">{detailItem.errorMessage}</span>
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
