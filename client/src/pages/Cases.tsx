import { useState } from "react";
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { FolderKanban, Plus, Search, Clock, CheckCircle2, XCircle, AlertTriangle, ArrowRight, MessageSquare, Loader2 } from "lucide-react";
import CaseComments from "@/components/CaseComments";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const statusLabels: Record<string, string> = {
  open: "مفتوحة",
  in_progress: "قيد المعالجة",
  pending_response: "بانتظار الرد",
  resolved: "تم الحل",
  closed: "مغلقة",
  escalated: "مصعّدة",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  pending_response: "bg-primary/10 text-primary border-primary/20",
  resolved: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  closed: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  escalated: "bg-red-500/10 text-red-600 border-red-500/20",
};

const priorityLabels: Record<string, string> = {
  low: "منخفضة",
  medium: "متوسطة",
  high: "عالية",
  critical: "حرجة",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-amber-100 text-amber-600",
  critical: "bg-red-100 text-red-600",
};

export default function Cases() {
  const { playClick, playHover } = useSoundEffects();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);
  const [detailCase, setDetailCase] = useState<any>(null);
  const [noteText, setNoteText] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "critical",
    siteId: undefined as number | undefined,
  });

  const { data, isLoading, refetch } = trpc.cases.list.useQuery({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });

  const createMutation = trpc.cases.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحالة بنجاح");
      setAddOpen(false);
      setFormData({ title: "", description: "", priority: "medium" as const, siteId: undefined });
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateStageMutation = trpc.cases.updateStage.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الحالة");
      refetch();
      if (detailCase) setDetailCase(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleCreate = () => {
    if (!formData.title) {
      toast.error("يرجى إدخال عنوان الحالة");
      return;
    }
    createMutation.mutate(formData);
  };

  // Count by status
  const statusCounts = data?.cases?.reduce((acc: Record<string, number>, c: any) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div
      className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
            <FolderKanban className="h-7 w-7 text-primary" />
            إدارة الحالات
          </h1>
          <p className="text-muted-foreground mt-1">متابعة حالات عدم الامتثال وإدارة سير العمل</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              حالة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إنشاء حالة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>عنوان الحالة *</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="عنوان مختصر للحالة" />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="وصف تفصيلي للحالة..." rows={4} />
              </div>
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v as "low" | "medium" | "high" | "critical" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفضة</SelectItem>
                    <SelectItem value="medium">متوسطة</SelectItem>
                    <SelectItem value="high">عالية</SelectItem>
                    <SelectItem value="critical">حرجة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                إنشاء الحالة
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3 stagger-children">
        {Object.entries(statusLabels).map(([key, label], i) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${statusFilter === key ? "ring-2 ring-primary" : ""}`}
           
            onClick={() => setStatusFilter(statusFilter === key ? "" : key)}
          >
            <CardContent className="p-3 text-center">
              <div className={`text-xl font-bold ${statusColors[key]?.split(" ")[1] || ""}`}>{statusCounts[key] || 0}</div>
              <div className="text-xs sm:text-[10px] text-muted-foreground mt-0.5">{label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            placeholder="بحث في الحالات..."
            className="pe-10"
          />
        </div>
        <Button variant="outline" onClick={() => { setSearch(searchInput); setPage(1); }}>بحث</Button>
      </div>

      {/* Cases List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4 h-24" /></Card>
          ))}
        </div>
      ) : data?.cases && data.cases.length > 0 ? (
        <div className="space-y-3">
          {data.cases.map((c: any, i: number) => (
            <Card
              key={c.id}
              className="cursor-pointer hover:shadow-md transition-all duration-200"
             
              onClick={() => { setDetailCase(c); openDrillDown({ title: c.title, subtitle: `حالة: ${c.siteName || 'غير محدد'}`, status: c.status, priority: c.priority }); }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                      <Badge variant="outline" className={priorityColors[c.priority] || ""}>
                        {priorityLabels[c.priority] || c.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{c.description || "بدون وصف"}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(c.created_at).toLocaleDateString("ar-SA-u-nu-latn")}
                      </span>
                      {c.assigned_to_name && (
                        <span>مسند إلى: {c.assigned_to_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={statusColors[c.status] || statusColors.open}>
                      {statusLabels[c.status] || c.status}
                    </Badge>
                    {c.status === 'escalated' && (
                      <span className="flex items-center gap-1 text-xs sm:text-[10px] text-red-500 font-medium">
                        <AlertTriangle className="h-3 w-3" />
                        تصعيد تلقائي
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderKanban className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">لا توجد حالات</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">أنشئ حالة جديدة للبدء</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.total > 10 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">صفحة {page} من {Math.ceil(data.total / 10)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 10)} onClick={() => setPage(p => p + 1)}>التالي</Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailCase} onOpenChange={(o) => !o && setDetailCase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {detailCase && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderKanban className="h-5 w-5 text-primary" />
                  {detailCase.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={statusColors[detailCase.status]}>{statusLabels[detailCase.status]}</Badge>
                  <Badge variant="outline" className={priorityColors[detailCase.priority]}>{priorityLabels[detailCase.priority]}</Badge>
                  <span className="text-xs text-muted-foreground">
                    أنشئت: {new Date(detailCase.created_at).toLocaleDateString("ar-SA-u-nu-latn")}
                  </span>
                </div>

                {detailCase.status === 'escalated' && (
                  <div className="bg-red-950/30 border border-red-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-400">تم تصعيد هذه الحالة تلقائياً</p>
                      <p className="text-xs text-red-400/70 mt-0.5">تجاوزت الحالة المدة الزمنية المحددة دون استجابة وتم تصعيدها وفقاً لقواعد التصعيد التلقائي</p>
                    </div>
                  </div>
                )}

                {detailCase.description && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{detailCase.description}</p>
                  </div>
                )}

                {/* Status Actions */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium self-center">تغيير الحالة:</span>
                  {["submission", "review", "assignment", "investigation", "resolution", "registered", "closed"].filter(s => s !== detailCase.stage).map((stage) => (
                    <Button
                      key={stage}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => updateStageMutation.mutate({ caseId: detailCase.id, newStage: stage, comment: noteText || undefined })}
                      disabled={updateStageMutation.isPending}
                    >
                      {stage === "submission" ? "تقديم" : stage === "review" ? "مراجعة" : stage === "assignment" ? "تعيين" : stage === "investigation" ? "تحقيق" : stage === "resolution" ? "حل" : stage === "registered" ? "تسجيل" : "إغلاق"}
                    </Button>
                  ))}
                </div>

                {/* Stage Change Note */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    ملاحظة تغيير المرحلة
                  </h4>
                  <Textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="اكتب ملاحظة (اختياري)..."
                    rows={2}
                  />
                </div>

                {/* Internal Comments System */}
                <div className="border-t pt-4">
                  <CaseComments caseId={detailCase.id} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
