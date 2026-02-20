import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { isAdminUser } from "@/lib/permissions";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Plus, Trash2, Edit2, Brain, Sparkles, BookOpen, MessageSquare,
  Search, RefreshCw, BarChart3, Loader2, Activity, Bot, Database,
  Star, TrendingUp, AlertTriangle, FileText, Command, Zap
} from "lucide-react";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

// ===== Stats Card =====
function StatCard({ title, value, icon: Icon, color, subtitle }: { title: string; value: number | string; icon: any; color: string; subtitle?: string }) {
  return (
    <Card className="glass-card gold-sweep relative overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===== Knowledge Types =====
const KNOWLEDGE_TYPES = [
  { value: "qa", label: "سؤال وجواب" },
  { value: "document", label: "مستند" },
  { value: "feedback", label: "ملاحظات" },
  { value: "article", label: "مقال" },
  { value: "faq", label: "أسئلة شائعة" },
  { value: "regulation", label: "لائحة/نظام" },
  { value: "term", label: "مصطلح" },
  { value: "guide", label: "دليل إرشادي" },
] as const;

const SCENARIO_TYPES = [
  { value: "greeting", label: "ترحيب" },
  { value: "farewell", label: "وداع" },
  { value: "help", label: "مساعدة" },
  { value: "error", label: "خطأ" },
  { value: "report", label: "تقرير" },
  { value: "custom_command", label: "أمر مخصص" },
  { value: "persona", label: "شخصية" },
  { value: "escalation", label: "تصعيد" },
  { value: "vip_response", label: "استجابة VIP" },
] as const;

export default function AiManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Queries
  const isAdmin = isAdminUser(user);
  const chatStats = trpc.ai.getChatStats.useQuery(undefined, { enabled: isAdmin });
  const searchStats = trpc.ai.getSearchStats.useQuery(undefined, { enabled: isAdmin });
  const knowledgeEntries = trpc.ai.getKnowledgeEntries.useQuery(undefined, { enabled: isAdmin });
  const enhancedScenarios = trpc.ai.getEnhancedScenarios.useQuery(undefined, { enabled: isAdmin });
  const customCommands = trpc.ai.getCustomCommands.useQuery(undefined, { enabled: isAdmin });
  const allSessions = trpc.ai.getAllSessions.useQuery(undefined, { enabled: isAdmin && activeTab === "sessions" });

  // Mutations
  const addKnowledge = trpc.ai.addKnowledge.useMutation({ onSuccess: () => { knowledgeEntries.refetch(); toast.success("تمت الإضافة"); } });
  const deleteKnowledge = trpc.ai.deleteKnowledge.useMutation({ onSuccess: () => { knowledgeEntries.refetch(); toast.success("تم الحذف"); } });
  const regenerateEmbeddings = trpc.ai.regenerateEmbeddings.useMutation();
  const createScenario = trpc.ai.createEnhancedScenario.useMutation({ onSuccess: () => { enhancedScenarios.refetch(); toast.success("تمت الإضافة"); } });
  const deleteScenario = trpc.ai.deleteEnhancedScenario.useMutation({ onSuccess: () => { enhancedScenarios.refetch(); toast.success("تم الحذف"); } });
  const createCommand = trpc.ai.createCustomCommand.useMutation({ onSuccess: () => { customCommands.refetch(); toast.success("تمت الإضافة"); } });
  const deleteCommand = trpc.ai.deleteCustomCommand.useMutation({ onSuccess: () => { customCommands.refetch(); toast.success("تم الحذف"); } });

  // Dialog states
  const [showAddKnowledge, setShowAddKnowledge] = useState(false);
  const [showAddScenario, setShowAddScenario] = useState(false);
  const [showAddCommand, setShowAddCommand] = useState(false);
  const [knowledgeForm, setKnowledgeForm] = useState({ type: "qa" as string, title: "", question: "", answer: "", content: "", source: "", category: "", tags: "" });
  const [scenarioForm, setScenarioForm] = useState({ name: "", type: "greeting" as string, triggerPattern: "", systemPrompt: "", responseTemplate: "", priority: 0 });
  const [commandForm, setCommandForm] = useState({ command: "", description: "", handler: "", exampleUsage: "" });

  const handleAddKnowledge = () => {
    addKnowledge.mutate({
      type: knowledgeForm.type as any,
      title: knowledgeForm.title || undefined,
      question: knowledgeForm.question || undefined,
      answer: knowledgeForm.answer || undefined,
      content: knowledgeForm.content || undefined,
      source: knowledgeForm.source || undefined,
      category: knowledgeForm.category || undefined,
      tags: knowledgeForm.tags ? knowledgeForm.tags.split(",").map(t => t.trim()) : undefined,
    });
    setShowAddKnowledge(false);
    setKnowledgeForm({ type: "qa", title: "", question: "", answer: "", content: "", source: "", category: "", tags: "" });
  };

  const handleAddScenario = () => {
    createScenario.mutate({
      name: scenarioForm.name,
      type: scenarioForm.type as any,
      triggerPattern: scenarioForm.triggerPattern || undefined,
      systemPrompt: scenarioForm.systemPrompt || undefined,
      responseTemplate: scenarioForm.responseTemplate || undefined,
      priority: scenarioForm.priority,
    });
    setShowAddScenario(false);
    setScenarioForm({ name: "", type: "greeting", triggerPattern: "", systemPrompt: "", responseTemplate: "", priority: 0 });
  };

  const handleAddCommand = () => {
    createCommand.mutate({
      command: commandForm.command,
      description: commandForm.description || undefined,
      handler: commandForm.handler,
      exampleUsage: commandForm.exampleUsage || undefined,
    });
    setShowAddCommand(false);
    setCommandForm({ command: "", description: "", handler: "", exampleUsage: "" });
  };

  const handleRegenEmbeddings = async () => {
    toast.info("جاري إعادة توليد التضمينات...");
    try {
      const result = await regenerateEmbeddings.mutateAsync();
      toast.success(`تم معالجة ${result.processed} من ${result.total} (فشل: ${result.failed})`);
    } catch {
      toast.error("فشل إعادة التوليد");
    }
  };

  if (!isAdmin) {
    return (
      <div className="overflow-x-hidden max-w-full flex items-center justify-center h-[60vh]">
        <Card className="glass-card gold-sweep p-3 sm:p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">صلاحيات غير كافية</h2>
          <p className="text-muted-foreground">هذه الصفحة متاحة فقط للمشرفين</p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="space-y-6 p-4 max-w-7xl mx-auto"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            إدارة الذكاء الاصطناعي
          </h1>
          <p className="text-muted-foreground text-sm mt-1">إحصائيات البحث الدلالي، قاعدة المعرفة، السيناريوهات والأوامر المخصصة</p>
        </div>
        <Button onClick={handleRegenEmbeddings} disabled={regenerateEmbeddings.isPending} variant="outline">
          {regenerateEmbeddings.isPending ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : <RefreshCw className="w-4 h-4 ms-2" />}
          إعادة توليد التضمينات
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="knowledge">قاعدة المعرفة</TabsTrigger>
          <TabsTrigger value="scenarios">السيناريوهات</TabsTrigger>
          <TabsTrigger value="commands">الأوامر المخصصة</TabsTrigger>
          <TabsTrigger value="sessions">الجلسات</TabsTrigger>
        </TabsList>

        {/* ===== Overview Tab ===== */}
        <TabsContent value="overview" className="space-y-6">
          {/* Chat Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            <StatCard title="إجمالي الجلسات" value={chatStats.data?.totalSessions || 0} icon={MessageSquare} color="bg-blue-500/10 text-blue-600" />
            <StatCard title="إجمالي الرسائل" value={chatStats.data?.totalMessages || 0} icon={Activity} color="bg-green-500/10 text-green-600" />
            <StatCard title="متوسط التقييم" value={chatStats.data?.avgRating ? Number(chatStats.data.avgRating).toFixed(1) : "0"} icon={Star} color="bg-yellow-500/10 text-yellow-600" subtitle={`${chatStats.data?.totalRatings || 0} تقييم`} />
            <StatCard title="إجمالي التوكنات" value={chatStats.data?.totalTokens || 0} icon={Zap} color="bg-purple-500/10 text-purple-600" />
          </div>

          {/* Search Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                إحصائيات البحث الدلالي
              </CardTitle>
              <CardDescription>أداء البحث في قاعدة المعرفة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-primary">{searchStats.data?.totalSearches || 0}</p>
                  <p className="text-sm text-muted-foreground">إجمالي عمليات البحث</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-green-600">{Number(searchStats.data?.averageResultsCount || 0).toFixed(1)}</p>
                  <p className="text-sm text-muted-foreground">متوسط النتائج</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-blue-600">{(Number(searchStats.data?.averageTopScore || 0) * 100).toFixed(0)}%</p>
                  <p className="text-sm text-muted-foreground">متوسط الدقة</p>
                </div>
              </div>

              {/* Top Queries */}
              {searchStats.data?.topQueries && searchStats.data.topQueries.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> أكثر الاستعلامات شيوعاً
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchStats.data.topQueries.slice(0, 10).map((q: any, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {q.query} <span className="ms-1 text-muted-foreground">({q.searchCount})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Knowledge Gaps */}
              {searchStats.data?.knowledgeGaps && searchStats.data.knowledgeGaps.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1 text-destructive">
                    <AlertTriangle className="w-4 h-4" /> فجوات المعرفة (بدون نتائج)
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {searchStats.data.knowledgeGaps.slice(0, 10).map((q: any, i: number) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {q.query}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Sessions */}
          {chatStats.data?.recentSessions && chatStats.data.recentSessions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  أحدث الجلسات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chatStats.data.recentSessions.map((s: any) => (
                    <div key={s.sessionId} className="flex items-center justify-between flex-wrap p-2 rounded-lg bg-muted/30 text-sm">
                      <div>
                        <span className="font-medium">{s.title || "محادثة"}</span>
                        <span className="text-muted-foreground ms-2">({s.userName})</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-xs">
                        <span>{s.messageCount} رسالة</span>
                        <span>{new Date(s.updatedAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== Knowledge Base Tab ===== */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              قاعدة المعرفة ({knowledgeEntries.data?.length || 0} مدخل)
            </h3>
            <Button onClick={() => setShowAddKnowledge(true)}>
              <Plus className="w-4 h-4 ms-2" /> إضافة مدخل
            </Button>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {knowledgeEntries.data?.map((entry: any) => (
                <Card key={entry.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">{KNOWLEDGE_TYPES.find(t => t.value === entry.type)?.label || entry.type}</Badge>
                        {entry.source && <span className="text-xs text-muted-foreground">{entry.source}</span>}
                      </div>
                      {entry.question && <p className="text-sm font-medium">{entry.question}</p>}
                      {entry.answer && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.answer}</p>}
                      {entry.content && !entry.question && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.content}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive h-8 w-8"
                      onClick={() => deleteKnowledge.mutate({ id: entry.id })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {(!knowledgeEntries.data || knowledgeEntries.data.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد مدخلات في قاعدة المعرفة</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ===== Scenarios Tab ===== */}
        <TabsContent value="scenarios" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              السيناريوهات المحسّنة ({enhancedScenarios.data?.length || 0})
            </h3>
            <Button onClick={() => setShowAddScenario(true)}>
              <Plus className="w-4 h-4 ms-2" /> إضافة سيناريو
            </Button>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {enhancedScenarios.data?.map((scenario: any) => (
                <Card key={scenario.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{scenario.name}</span>
                        <Badge variant="outline" className="text-xs">{SCENARIO_TYPES.find(t => t.value === scenario.type)?.label || scenario.type}</Badge>
                        {scenario.isEnabled ? (
                          <Badge className="text-xs bg-green-500/10 text-green-600">مفعّل</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">معطّل</Badge>
                        )}
                        <Badge variant="secondary" className="text-xs">أولوية: {scenario.priority}</Badge>
                      </div>
                      {scenario.triggerPattern && <p className="text-xs text-muted-foreground">النمط: {scenario.triggerPattern}</p>}
                      {scenario.responseTemplate && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{scenario.responseTemplate}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive h-8 w-8"
                      onClick={() => deleteScenario.mutate({ id: scenario.id })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {(!enhancedScenarios.data || enhancedScenarios.data.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد سيناريوهات محسّنة</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ===== Custom Commands Tab ===== */}
        <TabsContent value="commands" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Command className="w-5 h-5" />
              الأوامر المخصصة ({customCommands.data?.length || 0})
            </h3>
            <Button onClick={() => setShowAddCommand(true)}>
              <Plus className="w-4 h-4 ms-2" /> إضافة أمر
            </Button>
          </div>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {customCommands.data?.map((cmd: any) => (
                <Card key={cmd.id} className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{cmd.command}</code>
                        {cmd.isEnabled ? (
                          <Badge className="text-xs bg-green-500/10 text-green-600">مفعّل</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">معطّل</Badge>
                        )}
                      </div>
                      {cmd.description && <p className="text-xs text-muted-foreground">{cmd.description}</p>}
                      {cmd.exampleUsage && <p className="text-xs text-muted-foreground mt-1">مثال: {cmd.exampleUsage}</p>}
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive/60 hover:text-destructive h-8 w-8"
                      onClick={() => deleteCommand.mutate({ id: cmd.id })}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {(!customCommands.data || customCommands.data.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Command className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد أوامر مخصصة</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* ===== Sessions Tab ===== */}
        <TabsContent value="sessions" className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            جميع جلسات المحادثة ({allSessions.data?.length || 0})
          </h3>

          <ScrollArea className="h-[500px]">
            <div className="space-y-2">
              {allSessions.data?.map((session: any) => (
                <Card key={session.sessionId} className="p-3">
                  <div className="flex items-center justify-between flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{session.title || "محادثة"}</span>
                        <Badge variant="outline" className="text-xs">{session.userName}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{session.messageCount} رسالة</span>
                        <span>{session.totalTokens || 0} توكن</span>
                        <span>{new Date(session.updatedAt).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {(!allSessions.data || allSessions.data.length === 0) && (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>لا توجد جلسات محادثة</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* ===== Add Knowledge Dialog ===== */}
      <Dialog open={showAddKnowledge} onOpenChange={setShowAddKnowledge}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" /> إضافة مدخل لقاعدة المعرفة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>النوع</Label>
              <Select value={knowledgeForm.type} onValueChange={v => setKnowledgeForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {KNOWLEDGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>العنوان</Label>
              <Input value={knowledgeForm.title} onChange={e => setKnowledgeForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان المدخل" />
            </div>
            {(knowledgeForm.type === "qa" || knowledgeForm.type === "faq") && (
              <>
                <div>
                  <Label>السؤال</Label>
                  <Input value={knowledgeForm.question} onChange={e => setKnowledgeForm(f => ({ ...f, question: e.target.value }))} placeholder="السؤال" />
                </div>
                <div>
                  <Label>الإجابة</Label>
                  <Textarea value={knowledgeForm.answer} onChange={e => setKnowledgeForm(f => ({ ...f, answer: e.target.value }))} placeholder="الإجابة" rows={3} />
                </div>
              </>
            )}
            <div>
              <Label>المحتوى</Label>
              <Textarea value={knowledgeForm.content} onChange={e => setKnowledgeForm(f => ({ ...f, content: e.target.value }))} placeholder="محتوى المدخل" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3 stagger-children">
              <div>
                <Label>المصدر</Label>
                <Input value={knowledgeForm.source} onChange={e => setKnowledgeForm(f => ({ ...f, source: e.target.value }))} placeholder="المصدر" />
              </div>
              <div>
                <Label>التصنيف</Label>
                <Input value={knowledgeForm.category} onChange={e => setKnowledgeForm(f => ({ ...f, category: e.target.value }))} placeholder="التصنيف" />
              </div>
            </div>
            <div>
              <Label>الوسوم (مفصولة بفاصلة)</Label>
              <Input value={knowledgeForm.tags} onChange={e => setKnowledgeForm(f => ({ ...f, tags: e.target.value }))} placeholder="خصوصية, بيانات, نظام" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleAddKnowledge} disabled={addKnowledge.isPending}>
              {addKnowledge.isPending ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : <Plus className="w-4 h-4 ms-2" />}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Add Scenario Dialog ===== */}
      <Dialog open={showAddScenario} onOpenChange={setShowAddScenario}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" /> إضافة سيناريو محسّن
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الاسم</Label>
              <Input value={scenarioForm.name} onChange={e => setScenarioForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم السيناريو" />
            </div>
            <div>
              <Label>النوع</Label>
              <Select value={scenarioForm.type} onValueChange={v => setScenarioForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SCENARIO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نمط التفعيل (Regex)</Label>
              <Input value={scenarioForm.triggerPattern} onChange={e => setScenarioForm(f => ({ ...f, triggerPattern: e.target.value }))} placeholder="مرحبا|أهلا|السلام" />
            </div>
            <div>
              <Label>System Prompt</Label>
              <Textarea value={scenarioForm.systemPrompt} onChange={e => setScenarioForm(f => ({ ...f, systemPrompt: e.target.value }))} placeholder="تعليمات النظام" rows={3} />
            </div>
            <div>
              <Label>قالب الاستجابة</Label>
              <Textarea value={scenarioForm.responseTemplate} onChange={e => setScenarioForm(f => ({ ...f, responseTemplate: e.target.value }))} placeholder="قالب الرد" rows={3} />
            </div>
            <div>
              <Label>الأولوية</Label>
              <Input type="number" value={scenarioForm.priority} onChange={e => setScenarioForm(f => ({ ...f, priority: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleAddScenario} disabled={createScenario.isPending}>
              {createScenario.isPending ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : <Plus className="w-4 h-4 ms-2" />}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== Add Command Dialog ===== */}
      <Dialog open={showAddCommand} onOpenChange={setShowAddCommand}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="w-5 h-5" /> إضافة أمر مخصص
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الأمر</Label>
              <Input value={commandForm.command} onChange={e => setCommandForm(f => ({ ...f, command: e.target.value }))} placeholder="/scan أو /report" dir="ltr" />
            </div>
            <div>
              <Label>الوصف</Label>
              <Input value={commandForm.description} onChange={e => setCommandForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف الأمر" />
            </div>
            <div>
              <Label>المعالج (Handler)</Label>
              <Textarea value={commandForm.handler} onChange={e => setCommandForm(f => ({ ...f, handler: e.target.value }))} placeholder="اسم الوظيفة أو الكود" rows={3} dir="ltr" />
            </div>
            <div>
              <Label>مثال الاستخدام</Label>
              <Input value={commandForm.exampleUsage} onChange={e => setCommandForm(f => ({ ...f, exampleUsage: e.target.value }))} placeholder="/scan sdaia.gov.sa" dir="ltr" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">إلغاء</Button></DialogClose>
            <Button onClick={handleAddCommand} disabled={createCommand.isPending}>
              {createCommand.isPending ? <Loader2 className="w-4 h-4 animate-spin ms-2" /> : <Plus className="w-4 h-4 ms-2" />}
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
