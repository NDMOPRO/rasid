import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus, Trash2, Edit2, Brain, Sparkles, BookOpen, MessageSquare,
  FileText, ThumbsUp, ThumbsDown, Search, RefreshCw, Upload,
  Zap, Settings, BarChart3, Clock, CheckCircle2, XCircle,
  AlertCircle, Loader2, Play, Eye, ChevronDown, Activity,
  Bot, Users, Database, Shield
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

// ===== Types =====
const SCENARIO_TYPES = [
  { value: "welcome_first", label: "ترحيب أول زيارة", icon: "👋", color: "bg-emerald-500/10 text-emerald-600 border-emerald-200" },
  { value: "welcome_return", label: "ترحيب عودة", icon: "🔄", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { value: "leader_respect", label: "احترام القادة", icon: "👑", color: "bg-primary/10 text-primary border-primary/20" },
  { value: "farewell", label: "وداع", icon: "👋", color: "bg-amber-500/10 text-amber-600 border-amber-200" },
  { value: "encouragement", label: "تشجيع", icon: "💪", color: "bg-green-500/10 text-green-600 border-green-200" },
  { value: "occasion", label: "مناسبات", icon: "🎉", color: "bg-pink-500/10 text-pink-600 border-pink-200" },
] as const;

const ACTION_TYPES = [
  { value: "call_function", label: "استدعاء وظيفة" },
  { value: "custom_code", label: "كود مخصص" },
  { value: "redirect", label: "إعادة توجيه" },
  { value: "api_call", label: "استدعاء API" },
] as const;

const KNOWLEDGE_TYPES = [
  { value: "qa", label: "سؤال وجواب" },
  { value: "document", label: "مستند" },
  { value: "feedback", label: "ملاحظات" },
] as const;

// ===== Stats Card Component =====
function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string; value: number | string; icon: any; color: string; subtitle?: string }) {
  return (
    <Card className="relative overflow-hidden glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1 gradient-text">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Knowledge Base Tab =====
function KnowledgeBaseTab() {
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ type: "qa" as string, question: "", answer: "", content: "", source: "" });

  const knowledgeQuery = trpc.trainingCenter.listKnowledge.useQuery();
  const createMutation = trpc.trainingCenter.createKnowledge.useMutation({
    onSuccess: () => { utils.trainingCenter.listKnowledge.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تمت الإضافة بنجاح"); setShowAddDialog(false); resetForm(); },
    onError: () => toast.error("حدث خطأ أثناء الإضافة"),
  });
  const updateMutation = trpc.trainingCenter.updateKnowledge.useMutation({
    onSuccess: () => { utils.trainingCenter.listKnowledge.invalidate(); toast.success("تم التحديث بنجاح"); setEditItem(null); resetForm(); },
    onError: () => toast.error("حدث خطأ أثناء التحديث"),
  });
  const deleteMutation = trpc.trainingCenter.deleteKnowledge.useMutation({
    onSuccess: () => { utils.trainingCenter.listKnowledge.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تم الحذف"); },
  });

  function resetForm() { setForm({ type: "qa", question: "", answer: "", content: "", source: "" }); }

  const filteredItems = useMemo(() => {
    let items = knowledgeQuery.data || [];
    if (filterType !== "all") items = items.filter((i: any) => i.type === filterType);
    if (search) items = items.filter((i: any) => (i.question || "").includes(search) || (i.answer || "").includes(search) || (i.content || "").includes(search));
    return items;
  }, [knowledgeQuery.data, filterType, search]);

  return (
    <div
      className="space-y-4">
      <WatermarkLogo />
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="بحث في قاعدة المعرفة..." value={search} onChange={e => setSearch(e.target.value)} className="pe-10" />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              {KNOWLEDGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}><Plus className="h-4 w-4 ms-2" />إضافة معرفة</Button>
      </div>

      {knowledgeQuery.isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filteredItems.length === 0 ? (
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Brain className="h-12 w-12 mb-3 opacity-50" />
          <p>لا توجد عناصر في قاعدة المعرفة</p>
          <Button variant="outline" className="mt-3" onClick={() => { resetForm(); setShowAddDialog(true); }}><Plus className="h-4 w-4 ms-2" />إضافة أول عنصر</Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filteredItems.map((item: any) => (
            <Card key={item.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">{KNOWLEDGE_TYPES.find(t => t.value === item.type)?.label || item.type}</Badge>
                      {item.source && <Badge variant="secondary" className="text-xs">{item.source}</Badge>}
                    </div>
                    {item.question && <p className="font-medium text-sm mb-1">{item.question}</p>}
                    {item.answer && <p className="text-sm text-muted-foreground line-clamp-2">{item.answer}</p>}
                    {item.content && !item.question && <p className="text-sm text-muted-foreground line-clamp-2">{item.content}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                      setEditItem(item);
                      setForm({ type: item.type, question: item.question || "", answer: item.answer || "", content: item.content || "", source: item.source || "" });
                    }}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => {
                      if (confirm("هل أنت متأكد من الحذف؟")) deleteMutation.mutate({ id: item.id });
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>إضافة معرفة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>النوع</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KNOWLEDGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.type === "qa" && (
              <>
                <div><Label>السؤال</Label><Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="اكتب السؤال..." /></div>
                <div><Label>الإجابة</Label><Textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="اكتب الإجابة..." rows={4} /></div>
              </>
            )}
            {(form.type === "document" || form.type === "feedback") && (
              <div><Label>المحتوى</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="اكتب المحتوى..." rows={6} /></div>
            )}
            <div><Label>المصدر (اختياري)</Label><Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} placeholder="مثال: نظام حماية البيانات الشخصية" /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={() => createMutation.mutate(form as any)} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <Plus className="h-4 w-4 ms-2" />}إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={v => { if (!v) setEditItem(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>تعديل المعرفة</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {form.type === "qa" && (
              <>
                <div><Label>السؤال</Label><Input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} /></div>
                <div><Label>الإجابة</Label><Textarea value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} rows={4} /></div>
              </>
            )}
            {(form.type === "document" || form.type === "feedback") && (
              <div><Label>المحتوى</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={6} /></div>
            )}
            <div><Label>المصدر</Label><Input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={() => editItem && updateMutation.mutate({ id: editItem.id, ...form })} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Custom Actions Tab =====
function CustomActionsTab() {
  const utils = trpc.useUtils();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState({ triggerPhrase: "", actionType: "call_function" as string, actionTarget: "", description: "", aliases: "" });

  const actionsQuery = trpc.trainingCenter.listActions.useQuery();
  const createMutation = trpc.trainingCenter.createAction.useMutation({
    onSuccess: () => { utils.trainingCenter.listActions.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تمت الإضافة"); setShowAddDialog(false); resetForm(); },
  });
  const updateMutation = trpc.trainingCenter.updateAction.useMutation({
    onSuccess: () => { utils.trainingCenter.listActions.invalidate(); toast.success("تم التحديث"); setEditItem(null); },
  });
  const deleteMutation = trpc.trainingCenter.deleteAction.useMutation({
    onSuccess: () => { utils.trainingCenter.listActions.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تم الحذف"); },
  });
  const toggleMutation = trpc.trainingCenter.toggleAction.useMutation({
    onSuccess: () => { utils.trainingCenter.listActions.invalidate(); toast.success("تم التبديل"); },
  });

  function resetForm() { setForm({ triggerPhrase: "", actionType: "call_function", actionTarget: "", description: "", aliases: "" }); }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">الأوامر المخصصة التي يمكن لراصد الذكي تنفيذها عند التعرف على عبارات معينة</p>
        <Button onClick={() => { resetForm(); setShowAddDialog(true); }}><Plus className="h-4 w-4 ms-2" />إضافة أمر</Button>
      </div>

      {actionsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (actionsQuery.data || []).length === 0 ? (
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Zap className="h-12 w-12 mb-3 opacity-50" />
          <p>لا توجد أوامر مخصصة</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {(actionsQuery.data || []).map((action: any) => (
            <Card key={action.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-sm">{action.triggerPhrase}</span>
                      <Badge variant="outline" className="text-xs">{ACTION_TYPES.find(t => t.value === action.actionType)?.label}</Badge>
                    </div>
                    {action.description && <p className="text-xs text-muted-foreground me-6">{action.description}</p>}
                    {action.actionTarget && <p className="text-xs text-muted-foreground me-6 font-mono mt-1">{action.actionTarget}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={action.isActive} onCheckedChange={() => toggleMutation.mutate({ id: action.id })} />
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => {
                      setEditItem(action);
                      setForm({ triggerPhrase: action.triggerPhrase, actionType: action.actionType, actionTarget: action.actionTarget || "", description: action.description || "", aliases: (action.aliases || []).join(", ") });
                    }}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                      if (confirm("هل أنت متأكد؟")) deleteMutation.mutate({ id: action.id });
                    }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editItem} onOpenChange={v => { if (!v) { setShowAddDialog(false); setEditItem(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "تعديل الأمر" : "إضافة أمر جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>عبارة التفعيل</Label><Input value={form.triggerPhrase} onChange={e => setForm(f => ({ ...f, triggerPhrase: e.target.value }))} placeholder="مثال: أرسل تقرير الامتثال" /></div>
            <div><Label>عبارات بديلة (مفصولة بفاصلة)</Label><Input value={form.aliases} onChange={e => setForm(f => ({ ...f, aliases: e.target.value }))} placeholder="مثال: تقرير الامتثال, إرسال التقرير" /></div>
            <div>
              <Label>نوع الإجراء</Label>
              <Select value={form.actionType} onValueChange={v => setForm(f => ({ ...f, actionType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>الهدف</Label><Textarea value={form.actionTarget} onChange={e => setForm(f => ({ ...f, actionTarget: e.target.value }))} placeholder="اسم الوظيفة أو الكود أو الرابط" rows={3} /></div>
            <div><Label>الوصف</Label><Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف مختصر للأمر" /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={() => {
              const payload = { ...form, aliases: form.aliases ? form.aliases.split(",").map(s => s.trim()).filter(Boolean) : [] };
              if (editItem) updateMutation.mutate({ id: editItem.id, ...payload } as any);
              else createMutation.mutate(payload as any);
            }} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
              {editItem ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Training Documents Tab =====
function TrainingDocumentsTab() {
  const utils = trpc.useUtils();
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadForm, setUploadForm] = useState({ fileName: "", fileUrl: "", mimeType: "text/plain" });

  const docsQuery = trpc.trainingCenter.listDocuments.useQuery();
  const uploadMutation = trpc.trainingCenter.uploadDocument.useMutation({
    onSuccess: () => { utils.trainingCenter.listDocuments.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تم رفع المستند"); setShowUploadDialog(false); },
  });
  const processMutation = trpc.trainingCenter.processDocument.useMutation({
    onSuccess: () => { utils.trainingCenter.listDocuments.invalidate(); toast.success("بدأت المعالجة"); },
  });
  const deleteMutation = trpc.trainingCenter.deleteDocument.useMutation({
    onSuccess: () => { utils.trainingCenter.listDocuments.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تم الحذف"); },
  });

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: "في الانتظار", color: "bg-yellow-500/10 text-yellow-600", icon: Clock },
    processing: { label: "قيد المعالجة", color: "bg-blue-500/10 text-blue-600", icon: Loader2 },
    completed: { label: "مكتمل", color: "bg-green-500/10 text-green-600", icon: CheckCircle2 },
    failed: { label: "فشل", color: "bg-red-500/10 text-red-600", icon: XCircle },
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">المستندات التي يتم تدريب راصد الذكي عليها لتحسين إجاباته</p>
        <Button onClick={() => setShowUploadDialog(true)}><Upload className="h-4 w-4 ms-2" />رفع مستند</Button>
      </div>

      {docsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (docsQuery.data || []).length === 0 ? (
        <Card className="glass-card gold-sweep"><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mb-3 opacity-50" />
          <p>لا توجد مستندات تدريب</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {(docsQuery.data || []).map((doc: any) => {
            const status = statusConfig[doc.status] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <Card key={doc.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{doc.fileName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${status.color}`}>
                            <StatusIcon className={`h-3 w-3 ms-1 ${doc.status === 'processing' ? 'animate-spin' : ''}`} />
                            {status.label}
                          </Badge>
                          {doc.fileSize && <span className="text-xs text-muted-foreground">{(doc.fileSize / 1024).toFixed(1)} KB</span>}
                          {doc.chunksCount > 0 && <span className="text-xs text-muted-foreground">{doc.chunksCount} أجزاء</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {doc.status === "pending" && (
                        <Button variant="outline" size="sm" onClick={() => processMutation.mutate({ id: doc.id })} disabled={processMutation.isPending}>
                          <Play className="h-3 w-3 ms-1" />معالجة
                        </Button>
                      )}
                      {doc.fileUrl && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(doc.fileUrl, '_blank')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                        if (confirm("هل أنت متأكد؟")) deleteMutation.mutate({ id: doc.id });
                      }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>رفع مستند تدريب</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>اسم الملف</Label><Input value={uploadForm.fileName} onChange={e => setUploadForm(f => ({ ...f, fileName: e.target.value }))} placeholder="مثال: نظام حماية البيانات الشخصية.pdf" /></div>
            <div><Label>رابط الملف</Label><Input value={uploadForm.fileUrl} onChange={e => setUploadForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." /></div>
            <div>
              <Label>نوع الملف</Label>
              <Select value={uploadForm.mimeType} onValueChange={v => setUploadForm(f => ({ ...f, mimeType: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text/plain">نص عادي</SelectItem>
                  <SelectItem value="application/pdf">PDF</SelectItem>
                  <SelectItem value="text/markdown">Markdown</SelectItem>
                  <SelectItem value="application/json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={() => uploadMutation.mutate(uploadForm)} disabled={uploadMutation.isPending || !uploadForm.fileName || !uploadForm.fileUrl}>
              {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <Upload className="h-4 w-4 ms-2" />}رفع
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Feedback Tab =====
function FeedbackTab() {
  const feedbackQuery = trpc.trainingCenter.listFeedback.useQuery({ limit: 100 });
  const statsQuery = trpc.trainingCenter.feedbackStats.useQuery();

  return (
    <div className="space-y-4">
      {statsQuery.data && (
        <div className="grid grid-cols-3 gap-3 stagger-children">
          <StatCard title="إجمالي التقييمات" value={statsQuery.data.total} icon={BarChart3} color="bg-blue-500/10 text-blue-600" />
          <StatCard title="تقييمات إيجابية" value={statsQuery.data.good} icon={ThumbsUp} color="bg-green-500/10 text-green-600" subtitle={statsQuery.data.total > 0 ? `${((statsQuery.data.good / statsQuery.data.total) * 100).toFixed(0)}%` : undefined} />
          <StatCard title="تقييمات سلبية" value={statsQuery.data.bad} icon={ThumbsDown} color="bg-red-500/10 text-red-600" subtitle={statsQuery.data.total > 0 ? `${((statsQuery.data.bad / statsQuery.data.total) * 100).toFixed(0)}%` : undefined} />
        </div>
      )}

      {feedbackQuery.isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (feedbackQuery.data || []).length === 0 ? (
        <Card className="glass-card gold-sweep"><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mb-3 opacity-50" />
          <p>لا توجد تقييمات بعد</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {(feedbackQuery.data || []).map((fb: any) => (
            <Card key={fb.id}>
              <CardContent className="p-3 flex items-center gap-3">
                {fb.rating === "good" ? <ThumbsUp className="h-4 w-4 text-green-500 shrink-0" /> : <ThumbsDown className="h-4 w-4 text-red-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {fb.category && <Badge variant="outline" className="text-xs">{fb.category}</Badge>}
                    <span className="text-xs text-muted-foreground">{new Date(fb.createdAt).toLocaleDateString('ar-SA')}</span>
                  </div>
                  {fb.notes && <p className="text-sm text-muted-foreground mt-1 truncate">{fb.notes}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Personality Scenarios Tab =====
function PersonalityScenariosTab() {
  const utils = trpc.useUtils();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [form, setForm] = useState({ type: "welcome_first" as string, triggerKeyword: "", textAr: "" });

  const scenariosQuery = trpc.trainingCenter.listScenarios.useQuery();
  const createMutation = trpc.trainingCenter.createScenario.useMutation({
    onSuccess: () => { utils.trainingCenter.listScenarios.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تمت الإضافة"); setShowAddDialog(false); resetForm(); },
  });
  const updateMutation = trpc.trainingCenter.updateScenario.useMutation({
    onSuccess: () => { utils.trainingCenter.listScenarios.invalidate(); toast.success("تم التحديث"); setEditItem(null); },
  });
  const deleteMutation = trpc.trainingCenter.deleteScenario.useMutation({
    onSuccess: () => { utils.trainingCenter.listScenarios.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تم الحذف"); },
  });
  const toggleMutation = trpc.trainingCenter.toggleScenario.useMutation({
    onSuccess: () => { utils.trainingCenter.listScenarios.invalidate(); toast.success("تم التبديل"); },
  });
  const seedMutation = trpc.trainingCenter.seedScenarios.useMutation({
    onSuccess: () => { utils.trainingCenter.listScenarios.invalidate(); utils.trainingCenter.getStats.invalidate(); toast.success("تم إضافة البيانات الأولية"); },
  });

  function resetForm() { setForm({ type: "welcome_first", triggerKeyword: "", textAr: "" }); }

  const filteredScenarios = useMemo(() => {
    let items = scenariosQuery.data || [];
    if (filterType !== "all") items = items.filter((s: any) => s.type === filterType);
    return items;
  }, [scenariosQuery.data, filterType]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            {SCENARIO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          {(scenariosQuery.data || []).length === 0 && (
            <Button variant="outline" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
              {seedMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : <Database className="h-4 w-4 ms-2" />}تحميل بيانات أولية
            </Button>
          )}
          <Button onClick={() => { resetForm(); setShowAddDialog(true); }}><Plus className="h-4 w-4 ms-2" />إضافة سيناريو</Button>
        </div>
      </div>

      {scenariosQuery.isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : filteredScenarios.length === 0 ? (
        <Card className="glass-card gold-sweep"><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Sparkles className="h-12 w-12 mb-3 opacity-50" />
          <p>لا توجد سيناريوهات</p>
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {filteredScenarios.map((scenario: any) => {
            const typeConfig = SCENARIO_TYPES.find(t => t.value === scenario.type);
            return (
              <Card key={scenario.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`text-xs border ${typeConfig?.color || ''}`}>{typeConfig?.icon} {typeConfig?.label}</Badge>
                        {scenario.triggerKeyword && <Badge variant="secondary" className="text-xs">{scenario.triggerKeyword}</Badge>}
                        {!scenario.isActive && <Badge variant="destructive" className="text-xs">معطل</Badge>}
                      </div>
                      <p className="text-sm">{scenario.textAr}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Switch checked={scenario.isActive} onCheckedChange={() => toggleMutation.mutate({ id: scenario.id })} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100" onClick={() => {
                        setEditItem(scenario);
                        setForm({ type: scenario.type, triggerKeyword: scenario.triggerKeyword || "", textAr: scenario.textAr });
                      }}><Edit2 className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100" onClick={() => {
                        if (confirm("هل أنت متأكد؟")) deleteMutation.mutate({ id: scenario.id });
                      }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={showAddDialog || !!editItem} onOpenChange={v => { if (!v) { setShowAddDialog(false); setEditItem(null); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editItem ? "تعديل السيناريو" : "إضافة سيناريو جديد"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>النوع</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCENARIO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {(form.type === "leader_respect" || form.type === "occasion") && (
              <div><Label>الكلمة المفتاحية</Label><Input value={form.triggerKeyword} onChange={e => setForm(f => ({ ...f, triggerKeyword: e.target.value }))} placeholder={form.type === "leader_respect" ? "مثال: المعالي" : "مثال: اليوم الوطني"} /></div>
            )}
            <div><Label>النص</Label><Textarea value={form.textAr} onChange={e => setForm(f => ({ ...f, textAr: e.target.value }))} placeholder="اكتب نص السيناريو..." rows={4} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={() => {
              if (editItem) updateMutation.mutate({ id: editItem.id, ...form } as any);
              else createMutation.mutate(form as any);
            }} disabled={createMutation.isPending || updateMutation.isPending || !form.textAr}>
              {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
              {editItem ? "حفظ" : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Training Logs Tab =====
function TrainingLogsTab() {
  const logsQuery = trpc.trainingCenter.listLogs.useQuery({ limit: 100 });

  const actionLabels: Record<string, string> = {
    knowledge_added: "إضافة معرفة",
    knowledge_updated: "تحديث معرفة",
    knowledge_deleted: "حذف معرفة",
    document_uploaded: "رفع مستند",
    document_processed: "معالجة مستند",
    scenario_added: "إضافة سيناريو",
    scenario_updated: "تحديث سيناريو",
    action_added: "إضافة أمر",
    action_updated: "تحديث أمر",
    feedback_received: "تقييم مستلم",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">سجل جميع عمليات التدريب والتعديل على راصد الذكي</p>
      {logsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (logsQuery.data || []).length === 0 ? (
        <Card className="glass-card gold-sweep"><CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mb-3 opacity-50" />
          <p>لا توجد سجلات بعد</p>
        </CardContent></Card>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {(logsQuery.data || []).map((log: any) => (
              <Card key={log.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <Activity className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{actionLabels[log.action] || log.action}</Badge>
                      <span className="text-xs text-muted-foreground">{log.entityType}</span>
                    </div>
                    {log.details && <p className="text-xs text-muted-foreground mt-1 truncate">{log.details}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(log.createdAt).toLocaleDateString('ar-SA')}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

// ===== Main Training Center Page =====
export default function TrainingCenter() {
  const { playClick, playHover } = useSoundEffects();
  const statsQuery = trpc.trainingCenter.getStats.useQuery();
  const stats = statsQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            مركز تدريب راصد الذكي
          </h1>
          <p className="text-muted-foreground mt-1">إدارة وتدريب المساعد الذكي لمنصة راصد</p>
        </div>
        <Button variant="outline" onClick={() => statsQuery.refetch()}>
          <RefreshCw className={`h-4 w-4 ms-2 ${statsQuery.isFetching ? 'animate-spin' : ''}`} />تحديث
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 stagger-children">
          <StatCard title="قاعدة المعرفة" value={stats.knowledge} icon={BookOpen} color="bg-blue-500/10 text-blue-600" />
          <StatCard title="السيناريوهات" value={stats.scenarios} icon={Sparkles} color="bg-primary/10 text-primary" />
          <StatCard title="الأوامر" value={stats.actions} icon={Zap} color="bg-amber-500/10 text-amber-600" />
          <StatCard title="المستندات" value={stats.documents} icon={FileText} color="bg-cyan-500/10 text-cyan-600" />
          <StatCard title="تقييم إيجابي" value={stats.feedbackGood} icon={ThumbsUp} color="bg-green-500/10 text-green-600" />
          <StatCard title="تقييم سلبي" value={stats.feedbackBad} icon={ThumbsDown} color="bg-red-500/10 text-red-600" />
          <StatCard title="المحادثات" value={stats.chats} icon={MessageSquare} color="bg-indigo-500/10 text-indigo-600" />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="knowledge" dir="rtl">
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="knowledge" className="gap-1"><BookOpen className="h-4 w-4" />قاعدة المعرفة</TabsTrigger>
          <TabsTrigger value="actions" className="gap-1"><Zap className="h-4 w-4" />الأوامر المخصصة</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1"><FileText className="h-4 w-4" />مستندات التدريب</TabsTrigger>
          <TabsTrigger value="feedback" className="gap-1"><MessageSquare className="h-4 w-4" />التقييمات</TabsTrigger>
          <TabsTrigger value="scenarios" className="gap-1"><Sparkles className="h-4 w-4" />الشخصية والسيناريوهات</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1"><Activity className="h-4 w-4" />سجل التدريب</TabsTrigger>
        </TabsList>

        <TabsContent value="knowledge" className="mt-4"><KnowledgeBaseTab /></TabsContent>
        <TabsContent value="actions" className="mt-4"><CustomActionsTab /></TabsContent>
        <TabsContent value="documents" className="mt-4"><TrainingDocumentsTab /></TabsContent>
        <TabsContent value="feedback" className="mt-4"><FeedbackTab /></TabsContent>
        <TabsContent value="scenarios" className="mt-4"><PersonalityScenariosTab /></TabsContent>
        <TabsContent value="logs" className="mt-4"><TrainingLogsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
