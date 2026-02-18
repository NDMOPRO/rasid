import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Plus, Trash2, MessageSquare, BookOpen, Brain, Sparkles,
  Search, Filter, RefreshCw
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const SCENARIO_TYPES = [
  { value: "welcome_first", label: "ترحيب أول زيارة", color: "bg-green-500" },
  { value: "welcome_return", label: "ترحيب عودة", color: "bg-blue-500" },
  { value: "leader_respect", label: "احترام القادة", color: "bg-primary/50" },
  { value: "farewell", label: "وداع", color: "bg-orange-500" },
  { value: "encouragement", label: "تشجيع", color: "bg-yellow-500" },
  { value: "occasion", label: "مناسبات", color: "bg-pink-500" },
] as const;

const KNOWLEDGE_TYPES = [
  { value: "qa", label: "سؤال وجواب" },
  { value: "document", label: "مستند" },
  { value: "feedback", label: "ملاحظات" },
] as const;

export default function ScenarioManagement() {
  const { playClick, playHover } = useSoundEffects();
  const [activeTab, setActiveTab] = useState("scenarios");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [newScenarioOpen, setNewScenarioOpen] = useState(false);
  const [newScenarioType, setNewScenarioType] = useState<string>("welcome_first");
  const [newScenarioText, setNewScenarioText] = useState("");
  const [newScenarioTrigger, setNewScenarioTrigger] = useState("");

  const [newKnowledgeOpen, setNewKnowledgeOpen] = useState(false);
  const [newKnowledgeType, setNewKnowledgeType] = useState<string>("qa");
  const [newKnowledgeQuestion, setNewKnowledgeQuestion] = useState("");
  const [newKnowledgeAnswer, setNewKnowledgeAnswer] = useState("");

  const scenariosQuery = trpc.ai.getScenarios.useQuery(
    filterType !== "all" ? { type: filterType } : undefined
  );
  const knowledgeQuery = trpc.ai.getKnowledgeEntries.useQuery({ type: filterType !== "all" ? filterType : undefined });
  const utils = trpc.useUtils();

  const addScenarioMut = trpc.ai.addScenario.useMutation({
    onSuccess: () => {
      utils.ai.getScenarios.invalidate();
      setNewScenarioOpen(false);
      setNewScenarioText("");
      setNewScenarioTrigger("");
      toast.success("تم إضافة السيناريو بنجاح");
    },
  });

  const deleteScenarioMut = trpc.ai.deleteScenario.useMutation({
    onSuccess: () => {
      utils.ai.getScenarios.invalidate();
      toast.success("تم حذف السيناريو");
    },
  });

  const toggleScenarioMut = trpc.ai.toggleScenario.useMutation({
    onSuccess: () => { utils.ai.getScenarios.invalidate(); },
  });

  const addKnowledgeMut = trpc.ai.addKnowledge.useMutation({
    onSuccess: () => {
      utils.ai.getKnowledgeEntries.invalidate();
      setNewKnowledgeOpen(false);
      setNewKnowledgeQuestion("");
      setNewKnowledgeAnswer("");
      toast.success("تم إضافة المعرفة بنجاح");
    },
  });

  const deleteKnowledgeMut = trpc.ai.deleteKnowledge.useMutation({
    onSuccess: () => {
      utils.ai.getKnowledgeEntries.invalidate();
      toast.success("تم حذف عنصر المعرفة");
    },
  });

  const filteredScenarios = (scenariosQuery.data || []).filter((s: any) =>
    !searchQuery || (s.textAr || "").includes(searchQuery) || (s.triggerKeyword || "").includes(searchQuery)
  );

  const filteredKnowledge = (knowledgeQuery.data || []).filter((k: any) =>
    !searchQuery || (k.question || "").includes(searchQuery) || (k.answer || "").includes(searchQuery) || (k.content || "").includes(searchQuery)
  );

  return (
    <div
      className="p-6 max-w-6xl mx-auto space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
            <Brain className="w-6 h-6 text-primary" />
            مركز تدريب وإدارة راصد الذكي
          </h1>
          <p className="text-muted-foreground mt-1">إدارة سيناريوهات الشخصية وقاعدة المعرفة</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { scenariosQuery.refetch(); knowledgeQuery.refetch(); }}>
          <RefreshCw className="w-4 h-4 ms-1" /> تحديث
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 stagger-children">
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10"><MessageSquare className="w-5 h-5 text-green-500" /></div>
          <div><p className="text-2xl font-bold">{scenariosQuery.data?.length || 0}</p><p className="text-xs text-muted-foreground">سيناريو شخصية</p></div>
        </CardContent></Card>
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10"><BookOpen className="w-5 h-5 text-blue-500" /></div>
          <div><p className="text-2xl font-bold">{knowledgeQuery.data?.length || 0}</p><p className="text-xs text-muted-foreground">عنصر معرفة</p></div>
        </CardContent></Card>
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10 btn-glow"><Sparkles className="w-5 h-5 text-primary" /></div>
          <div><p className="text-2xl font-bold">{(scenariosQuery.data || []).filter((s: any) => s.isActive).length}</p><p className="text-xs text-muted-foreground">سيناريو نشط</p></div>
        </CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-500/10"><Filter className="w-5 h-5 text-orange-500" /></div>
          <div><p className="text-2xl font-bold">{SCENARIO_TYPES.length}</p><p className="text-xs text-muted-foreground">نوع سيناريو</p></div>
        </CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scenarios"><MessageSquare className="w-4 h-4 ms-1" /> سيناريوهات الشخصية</TabsTrigger>
          <TabsTrigger value="knowledge"><BookOpen className="w-4 h-4 ms-1" /> قاعدة المعرفة</TabsTrigger>
        </TabsList>

        <div className="flex gap-3 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="بحث..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pe-9 text-end" />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48"><SelectValue placeholder="فلتر حسب النوع" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              {activeTab === "scenarios"
                ? SCENARIO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)
                : KNOWLEDGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)
              }
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="scenarios" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={newScenarioOpen} onOpenChange={setNewScenarioOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 ms-1" /> إضافة سيناريو</Button></DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader><DialogTitle>إضافة سيناريو جديد</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>النوع</Label>
                    <Select value={newScenarioType} onValueChange={setNewScenarioType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{SCENARIO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {newScenarioType === "leader_respect" && (
                    <div>
                      <Label>الكلمة المفتاحية (اسم القائد)</Label>
                      <Input value={newScenarioTrigger} onChange={(e) => setNewScenarioTrigger(e.target.value)} placeholder="مثال: المعالي" className="text-end" />
                    </div>
                  )}
                  <div>
                    <Label>النص العربي</Label>
                    <Textarea value={newScenarioText} onChange={(e) => setNewScenarioText(e.target.value)} placeholder="اكتب نص السيناريو هنا..." className="text-end min-h-[100px]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => addScenarioMut.mutate({ type: newScenarioType as any, textAr: newScenarioText, triggerKeyword: newScenarioTrigger || undefined })} disabled={!newScenarioText.trim() || addScenarioMut.isPending}>
                    {addScenarioMut.isPending ? <RefreshCw className="w-4 h-4 animate-spin ms-1" /> : <Plus className="w-4 h-4 ms-1" />} إضافة
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {scenariosQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : filteredScenarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد سيناريوهات</div>
          ) : (
            <div className="space-y-3">
              {filteredScenarios.map((scenario: any) => {
                const typeInfo = SCENARIO_TYPES.find(t => t.value === scenario.type);
                return (
                  <Card key={scenario.id} className={`transition-all ${!scenario.isActive ? "opacity-50" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              <span className={`w-2 h-2 rounded-full ${typeInfo?.color || "bg-gray-500"} ms-1 inline-block`} />
                              {typeInfo?.label || scenario.type}
                            </Badge>
                            {scenario.triggerKeyword && <Badge variant="outline" className="text-xs">🔑 {scenario.triggerKeyword}</Badge>}
                          </div>
                          <p className="text-sm leading-relaxed">{scenario.textAr}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Switch checked={scenario.isActive} onCheckedChange={(checked) => toggleScenarioMut.mutate({ id: scenario.id, isActive: checked })} />
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteScenarioMut.mutate({ id: scenario.id })}>
                            <Trash2 className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={newKnowledgeOpen} onOpenChange={setNewKnowledgeOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 ms-1" /> إضافة معرفة</Button></DialogTrigger>
              <DialogContent dir="rtl">
                <DialogHeader><DialogTitle>إضافة عنصر معرفة جديد</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>النوع</Label>
                    <Select value={newKnowledgeType} onValueChange={setNewKnowledgeType}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{KNOWLEDGE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>السؤال</Label>
                    <Input value={newKnowledgeQuestion} onChange={(e) => setNewKnowledgeQuestion(e.target.value)} placeholder="اكتب السؤال..." className="text-end" />
                  </div>
                  <div>
                    <Label>الإجابة</Label>
                    <Textarea value={newKnowledgeAnswer} onChange={(e) => setNewKnowledgeAnswer(e.target.value)} placeholder="اكتب الإجابة..." className="text-end min-h-[100px]" />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => addKnowledgeMut.mutate({ type: newKnowledgeType as any, question: newKnowledgeQuestion || undefined, answer: newKnowledgeAnswer || undefined })} disabled={(!newKnowledgeQuestion.trim() && !newKnowledgeAnswer.trim()) || addKnowledgeMut.isPending}>
                    {addKnowledgeMut.isPending ? <RefreshCw className="w-4 h-4 animate-spin ms-1" /> : <Plus className="w-4 h-4 ms-1" />} إضافة
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {knowledgeQuery.isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : filteredKnowledge.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد عناصر معرفة</div>
          ) : (
            <div className="space-y-3">
              {filteredKnowledge.map((entry: any) => {
                const typeInfo = KNOWLEDGE_TYPES.find(t => t.value === entry.type);
                return (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">{typeInfo?.label || entry.type}</Badge>
                            {entry.source && <Badge variant="outline" className="text-xs">📄 {entry.source}</Badge>}
                          </div>
                          {entry.question && <p className="text-sm font-medium mb-1">❓ {entry.question}</p>}
                          {entry.answer && <p className="text-sm text-muted-foreground">💡 {entry.answer}</p>}
                          {entry.content && !entry.question && <p className="text-sm text-muted-foreground line-clamp-3">{entry.content}</p>}
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive flex-shrink-0" onClick={() => deleteKnowledgeMut.mutate({ id: entry.id })}>
                          <Trash2 className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
