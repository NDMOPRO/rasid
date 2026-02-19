/**
 * Admin CMS — لوحة إدارة المحتوى
 * 7 Tabs: حالات الرصد | المستخدمين | التقارير | قاعدة المعرفة | الاستيراد | التصدير | سجل العمليات
 */
import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield, Users, FileText, BookOpen, Upload, Download, ScrollText,
  Loader2, Search, Plus, Trash2, Edit, Eye, Check, X,
  ChevronDown, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  AlertTriangle, CheckCircle, Clock, Archive, RefreshCw, Filter,
  FileSpreadsheet, FileJson, FileArchive,
} from "lucide-react";

type TabId = "leaks" | "users" | "reports" | "kb" | "import" | "export" | "log";

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "leaks", label: "حالات الرصد", icon: Shield },
  { id: "users", label: "المستخدمين", icon: Users },
  { id: "reports", label: "التقارير", icon: FileText },
  { id: "kb", label: "قاعدة المعرفة", icon: BookOpen },
  { id: "import", label: "الاستيراد", icon: Upload },
  { id: "export", label: "التصدير", icon: Download },
  { id: "log", label: "سجل العمليات", icon: ScrollText },
];

const publishStatusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "مسودة", color: "border-gray-500/50 text-gray-400" },
  pending_review: { label: "قيد المراجعة", color: "border-amber-500/50 text-amber-400" },
  published: { label: "منشور", color: "border-emerald-500/50 text-emerald-400" },
  archived: { label: "مؤرشف", color: "border-blue-500/50 text-blue-400" },
};

const severityLabels: Record<string, { label: string; color: string }> = {
  critical: { label: "حرج", color: "bg-red-500/20 text-red-400 border-red-500/30" },
  high: { label: "مرتفع", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  medium: { label: "متوسط", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  low: { label: "منخفض", color: "bg-green-500/20 text-green-400 border-green-500/30" },
};

// ═══ Tab 1: Leaks Management ═══
function LeaksTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [publishFilter, setPublishFilter] = useState<string | undefined>();
  const [severityFilter, setSeverityFilter] = useState<string | undefined>();
  const [selected, setSelected] = useState<number[]>([]);

  const { data, isLoading, refetch } = trpc.cms.leaks.listAll.useQuery({
    page, limit: 50, search: search || undefined,
    publishStatus: publishFilter as any, severity: severityFilter,
  });

  const { data: stats } = trpc.cms.stats.useQuery();
  const utils = trpc.useUtils();

  const publishMutation = trpc.cms.leaks.updatePublishStatus.useMutation({
    onSuccess: () => { utils.cms.leaks.listAll.invalidate(); utils.cms.stats.invalidate(); toast.success("تم تحديث الحالة"); },
    onError: () => toast.error("فشل التحديث"),
  });

  const deleteMutation = trpc.cms.leaks.bulkDelete.useMutation({
    onSuccess: () => { utils.cms.leaks.listAll.invalidate(); utils.cms.stats.invalidate(); setSelected([]); toast.success("تم الحذف"); },
    onError: () => toast.error("فشل الحذف"),
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  const toggleSelect = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelected(items.map((i: any) => i.id));
  const clearSelection = () => setSelected([]);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "إجمالي", value: stats?.totalLeaks || 0, color: "text-white" },
          { label: "منشور", value: stats?.publishedCount || 0, color: "text-emerald-400" },
          { label: "مسودة", value: stats?.draftCount || 0, color: "text-gray-400" },
          { label: "قيد المراجعة", value: stats?.pendingCount || 0, color: "text-amber-400" },
          { label: "مؤرشف", value: stats?.archivedCount || 0, color: "text-blue-400" },
        ].map((s, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="بحث بالمعرف أو العنوان..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pr-10 bg-gray-800/50 border-gray-700" />
        </div>
        <select value={publishFilter || ""} onChange={(e) => { setPublishFilter(e.target.value || undefined); setPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
          <option value="">كل الحالات</option>
          <option value="draft">مسودة</option>
          <option value="pending_review">قيد المراجعة</option>
          <option value="published">منشور</option>
          <option value="archived">مؤرشف</option>
        </select>
        <select value={severityFilter || ""} onChange={(e) => { setSeverityFilter(e.target.value || undefined); setPage(1); }} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
          <option value="">كل المستويات</option>
          <option value="critical">حرج</option>
          <option value="high">مرتفع</option>
          <option value="medium">متوسط</option>
          <option value="low">منخفض</option>
        </select>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600">{selected.length} محدد</Badge>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => selected.forEach(id => publishMutation.mutate({ id, publishStatus: "published" }))}>
              <Check className="h-3 w-3 ml-1" /> نشر
            </Button>
            <Button size="sm" variant="outline" className="border-gray-600" onClick={() => selected.forEach(id => publishMutation.mutate({ id, publishStatus: "draft" }))}>
              سحب
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { if (confirm("هل أنت متأكد من حذف المحدد؟")) deleteMutation.mutate({ ids: selected }); }}>
              <Trash2 className="h-3 w-3 ml-1" /> حذف
            </Button>
            <Button size="sm" variant="ghost" onClick={clearSelection}><X className="h-3 w-3" /></Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/80">
            <tr>
              <th className="px-3 py-3 text-right"><input type="checkbox" onChange={(e) => e.target.checked ? selectAll() : clearSelection()} checked={selected.length === items.length && items.length > 0} className="rounded" /></th>
              <th className="px-3 py-3 text-right font-medium text-gray-300">المعرف</th>
              <th className="px-3 py-3 text-right font-medium text-gray-300">العنوان</th>
              <th className="px-3 py-3 text-right font-medium text-gray-300">الخطورة</th>
              <th className="px-3 py-3 text-right font-medium text-gray-300">القطاع</th>
              <th className="px-3 py-3 text-right font-medium text-gray-300">النشر</th>
              <th className="px-3 py-3 text-center font-medium text-gray-300">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {items.map((leak: any) => {
              const ps = publishStatusLabels[leak.publishStatus] || publishStatusLabels.draft;
              const sv = severityLabels[leak.severity] || severityLabels.medium;
              return (
                <tr key={leak.id} className={`hover:bg-gray-800/40 transition-colors ${selected.includes(leak.id) ? "bg-blue-900/20" : ""}`}>
                  <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(leak.id)} onChange={() => toggleSelect(leak.id)} className="rounded" /></td>
                  <td className="px-3 py-3 font-mono text-xs text-blue-400">{leak.leakId}</td>
                  <td className="px-3 py-3 text-white text-xs max-w-[250px] truncate">{leak.titleAr || leak.title}</td>
                  <td className="px-3 py-3"><Badge variant="outline" className={sv.color}>{sv.label}</Badge></td>
                  <td className="px-3 py-3 text-gray-400 text-xs">{leak.sectorAr || leak.sector || "—"}</td>
                  <td className="px-3 py-3"><Badge variant="outline" className={ps.color}>{ps.label}</Badge></td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      {leak.publishStatus !== "published" ? (
                        <Button size="sm" variant="ghost" className="text-emerald-400 h-7 px-2" onClick={() => publishMutation.mutate({ id: leak.id, publishStatus: "published" })}>
                          <Check className="h-3 w-3" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-gray-400 h-7 px-2" onClick={() => publishMutation.mutate({ id: leak.id, publishStatus: "draft" })}>
                          <Archive className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="border-gray-700"><ChevronRight className="h-4 w-4" /></Button>
          <span className="text-gray-400 text-sm">{page} / {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="border-gray-700"><ChevronLeft className="h-4 w-4" /></Button>
        </div>
      )}

      {items.length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد حالات رصد</div>}
    </div>
  );
}

// ═══ Tab 2: Users ═══
function UsersTab() {
  const { data: users, isLoading } = trpc.cms.users.list.useQuery();
  const [search, setSearch] = useState("");
  const filtered = (users || []).filter((u: any) => !search || u.displayName?.includes(search) || u.username?.includes(search));

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-10 bg-gray-800/50 border-gray-700" />
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-800/80">
            <tr>
              <th className="px-4 py-3 text-right text-gray-300">الاسم</th>
              <th className="px-4 py-3 text-right text-gray-300">المعرف</th>
              <th className="px-4 py-3 text-right text-gray-300">الدور</th>
              <th className="px-4 py-3 text-right text-gray-300">تاريخ الإنشاء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {filtered.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-800/40">
                <td className="px-4 py-3 text-white">{u.displayName || u.username}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{u.username}</td>
                <td className="px-4 py-3"><Badge variant="outline" className="border-blue-500/50 text-blue-400">{u.platformRole}</Badge></td>
                <td className="px-4 py-3 text-gray-500 text-xs">{u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-SA") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد مستخدمين</div>}
    </div>
  );
}

// ═══ Tab 3: Reports ═══
function ReportsTab() {
  const { data: reports, isLoading } = trpc.cms.reports.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.cms.reports.delete.useMutation({
    onSuccess: () => { utils.cms.reports.list.invalidate(); toast.success("تم الحذف"); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">التقارير المحفوظة</h3>
      <div className="space-y-2">
        {(reports || []).map((r: any) => (
          <div key={r.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-400" />
              <div>
                <div className="text-white text-sm font-medium">{r.title || r.name || `تقرير #${r.id}`}</div>
                <div className="text-gray-500 text-xs">{r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-SA") : ""}</div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => { if (confirm("حذف التقرير؟")) deleteMutation.mutate({ id: r.id }); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {(reports || []).length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد تقارير</div>}
    </div>
  );
}

// ═══ Tab 4: Knowledge Base ═══
function KBTab() {
  const { data: articles, isLoading } = trpc.cms.knowledgeBase.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.cms.knowledgeBase.delete.useMutation({
    onSuccess: () => { utils.cms.knowledgeBase.list.invalidate(); toast.success("تم الحذف"); },
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">قاعدة المعرفة</h3>
      <div className="space-y-2">
        {(articles || []).map((a: any) => (
          <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-purple-400" />
              <div>
                <div className="text-white text-sm font-medium">{a.title || a.question || `مقال #${a.id}`}</div>
                <div className="text-gray-500 text-xs">{a.category || "عام"}</div>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => { if (confirm("حذف المقال؟")) deleteMutation.mutate({ id: a.id }); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      {(articles || []).length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد مقالات</div>}
    </div>
  );
}

// ═══ Tab 5: Import ═══
function ImportTab() {
  const { data: jobs, isLoading } = trpc.cms.import.getJobs.useQuery();
  const [uploading, setUploading] = useState(false);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/json", "application/zip", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(json|zip|csv|xlsx)$/i)) {
      toast.error("صيغة غير مدعومة. يُقبل: ZIP, JSON, XLSX, CSV");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/cms/import/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error("فشل الرفع");
      const data = await res.json();
      toast.success(`تم بدء الاستيراد — Job: ${data.jobId}`);
    } catch (err) {
      toast.error("فشل رفع الملف");
    } finally {
      setUploading(false);
    }
  }, []);

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <Card className="bg-gray-800/50 border-gray-700 border-dashed border-2">
        <CardContent className="p-8 text-center">
          <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4 opacity-60" />
          <h3 className="text-white font-semibold mb-2">رفع ملف للاستيراد</h3>
          <p className="text-gray-400 text-sm mb-4">يُقبل: ZIP, JSON, XLSX, CSV — حتى 500 MB</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {uploading ? "جاري الرفع..." : "اختر ملف"}
            <input type="file" className="hidden" accept=".zip,.json,.xlsx,.csv" onChange={handleUpload} disabled={uploading} />
          </label>
        </CardContent>
      </Card>

      {/* Import History */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">سجل الاستيراد</h3>
        <div className="space-y-2">
          {(jobs || []).map((job: any) => (
            <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
              <div className="flex items-center gap-3">
                {job.status === "completed" ? <CheckCircle className="h-5 w-5 text-emerald-400" /> :
                 job.status === "failed" ? <AlertTriangle className="h-5 w-5 text-red-400" /> :
                 <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
                <div>
                  <div className="text-white text-sm">{job.fileName}</div>
                  <div className="text-gray-500 text-xs">{job.importedRecords || 0} / {job.totalRecords || 0} سجل</div>
                </div>
              </div>
              <Badge variant="outline" className={
                job.status === "completed" ? "border-emerald-500/50 text-emerald-400" :
                job.status === "failed" ? "border-red-500/50 text-red-400" :
                "border-blue-500/50 text-blue-400"
              }>{job.status}</Badge>
            </div>
          ))}
        </div>
        {(jobs || []).length === 0 && <div className="text-center py-6 text-gray-500">لا يوجد عمليات استيراد سابقة</div>}
      </div>
    </div>
  );
}

// ═══ Tab 6: Export ═══
function ExportTab() {
  const { data: jobs, isLoading } = trpc.cms.export.getJobs.useQuery();
  const utils = trpc.useUtils();
  const startExport = trpc.cms.export.start.useMutation({
    onSuccess: (data) => { utils.cms.export.getJobs.invalidate(); toast.success(`بدأ التصدير: ${data.jobId}`); },
    onError: () => toast.error("فشل بدء التصدير"),
  });

  const [exportType, setExportType] = useState("full_platform");
  const [exportFormat, setExportFormat] = useState("json");

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-blue-400" /></div>;

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader><CardTitle className="text-white text-base">تصدير جديد</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">النطاق</label>
              <select value={exportType} onChange={(e) => setExportType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
                <option value="full_platform">كامل المنصة</option>
                <option value="section">قسم معين</option>
                <option value="page">صفحة معينة</option>
                <option value="custom_query">استعلام مخصص</option>
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">الصيغة</label>
              <select value={exportFormat} onChange={(e) => setExportFormat(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-300">
                <option value="json">JSON</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="csv">CSV</option>
                <option value="zip">ZIP (كامل)</option>
              </select>
            </div>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => startExport.mutate({ exportType: exportType as any, exportFormat: exportFormat as any })} disabled={startExport.isPending}>
            {startExport.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <Download className="h-4 w-4 ml-2" />}
            بدء التصدير
          </Button>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-lg font-semibold text-white mb-3">سجل التصدير</h3>
        <div className="space-y-2">
          {(jobs || []).map((job: any) => (
            <div key={job.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
              <div className="flex items-center gap-3">
                {job.status === "completed" ? <CheckCircle className="h-5 w-5 text-emerald-400" /> :
                 job.status === "failed" ? <AlertTriangle className="h-5 w-5 text-red-400" /> :
                 <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />}
                <div>
                  <div className="text-white text-sm">{job.exportType} — {job.exportFormat}</div>
                  <div className="text-gray-500 text-xs">{job.totalRecords || 0} سجل</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={job.status === "completed" ? "border-emerald-500/50 text-emerald-400" : "border-blue-500/50 text-blue-400"}>{job.status}</Badge>
                {job.status === "completed" && job.fileUrl && (
                  <a href={job.fileUrl} download className="text-blue-400 hover:text-blue-300"><Download className="h-4 w-4" /></a>
                )}
              </div>
            </div>
          ))}
        </div>
        {(jobs || []).length === 0 && <div className="text-center py-6 text-gray-500">لا يوجد عمليات تصدير سابقة</div>}
      </div>
    </div>
  );
}

// ═══ Tab 7: Operations Log ═══
function LogTab() {
  const { data: importJobs } = trpc.cms.import.getJobs.useQuery();
  const { data: exportJobs } = trpc.cms.export.getJobs.useQuery();

  const allOps = [
    ...(importJobs || []).map((j: any) => ({ ...j, opType: "import" as const })),
    ...(exportJobs || []).map((j: any) => ({ ...j, opType: "export" as const })),
  ].sort((a, b) => new Date(b.startedAt || 0).getTime() - new Date(a.startedAt || 0).getTime());

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">سجل العمليات</h3>
      <div className="space-y-2">
        {allOps.map((op, i) => (
          <div key={`${op.opType}-${op.id || i}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center gap-3">
              {op.opType === "import" ? <Upload className="h-5 w-5 text-blue-400" /> : <Download className="h-5 w-5 text-purple-400" />}
              <div>
                <div className="text-white text-sm">{op.opType === "import" ? "استيراد" : "تصدير"}: {op.fileName || op.exportType || "—"}</div>
                <div className="text-gray-500 text-xs">{op.startedAt ? new Date(op.startedAt).toLocaleString("ar-SA") : "—"}</div>
              </div>
            </div>
            <Badge variant="outline" className={
              op.status === "completed" ? "border-emerald-500/50 text-emerald-400" :
              op.status === "failed" ? "border-red-500/50 text-red-400" :
              "border-amber-500/50 text-amber-400"
            }>{op.status}</Badge>
          </div>
        ))}
      </div>
      {allOps.length === 0 && <div className="text-center py-8 text-gray-500">لا يوجد عمليات</div>}
    </div>
  );
}

// ═══ Main Component ═══
export default function AdminCMS() {
  const [activeTab, setActiveTab] = useState<TabId>("leaks");

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">إدارة المحتوى</h1>
        <p className="text-gray-400 text-sm mt-1">إدارة كاملة لمحتوى المنصة — إضافة وتعديل وحذف ونشر واستيراد وتصدير</p>
      </div>
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl border border-gray-700 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}>
              <Icon className="h-4 w-4" />{tab.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {activeTab === "leaks" && <LeaksTab />}
          {activeTab === "users" && <UsersTab />}
          {activeTab === "reports" && <ReportsTab />}
          {activeTab === "kb" && <KBTab />}
          {activeTab === "import" && <ImportTab />}
          {activeTab === "export" && <ExportTab />}
          {activeTab === "log" && <LogTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
