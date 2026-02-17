import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HeartHandshake,
  Plus,
  Trash2,
  Edit3,
  Crown,
  MessageSquare,
  Sparkles,
  Star,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type ScenarioType = "greeting_first" | "greeting_return" | "leader_respect" | "custom";

const typeLabels: Record<ScenarioType, { label: string; icon: typeof Crown; color: string; bgColor: string }> = {
  greeting_first: { label: "ترحيب أول", icon: MessageSquare, color: "text-emerald-400", bgColor: "bg-emerald-500/10 border-emerald-500/20" },
  greeting_return: { label: "ترحيب عائد", icon: Sparkles, color: "text-blue-400", bgColor: "bg-blue-500/10 border-blue-500/20" },
  leader_respect: { label: "احترام القادة", icon: Crown, color: "text-amber-400", bgColor: "bg-amber-500/10 border-amber-500/20" },
  custom: { label: "مخصص", icon: Star, color: "text-cyan-400", bgColor: "bg-cyan-500/10 border-cyan-500/20" },
};

export default function PersonalityScenarios() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [formType, setFormType] = useState<ScenarioType>("greeting_first");
  const [formTrigger, setFormTrigger] = useState("");
  const [formResponse, setFormResponse] = useState("");
  const [formActive, setFormActive] = useState(true);

  const utils = trpc.useUtils();

  // Use the correct nested tRPC path: personality.scenarios.list
  const { data: scenarios, isLoading } = trpc.personality.scenarios.list.useQuery();

  const createMutation = trpc.personality.scenarios.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء السيناريو بنجاح");
      utils.personality.scenarios.list.invalidate();
      resetForm();
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = trpc.personality.scenarios.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث السيناريو بنجاح");
      utils.personality.scenarios.list.invalidate();
      resetForm();
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.personality.scenarios.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف السيناريو");
      utils.personality.scenarios.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormType("greeting_first");
    setFormTrigger("");
    setFormResponse("");
    setFormActive(true);
    setEditingId(null);
  };

  const openEditDialog = (scenario: any) => {
    setEditingId(scenario.id);
    setFormType(scenario.scenarioType);
    setFormTrigger(scenario.triggerKeyword || "");
    setFormResponse(scenario.responseTemplate);
    setFormActive(scenario.isActive);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formResponse.trim()) {
      toast.error("يرجى إدخال نص الاستجابة");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        scenarioType: formType,
        triggerKeyword: formTrigger || undefined,
        responseTemplate: formResponse,
        isActive: formActive,
      });
    } else {
      createMutation.mutate({
        scenarioType: formType,
        triggerKeyword: formTrigger || undefined,
        responseTemplate: formResponse,
        isActive: formActive,
      });
    }
  };

  const allScenarios = scenarios || [];
  const filteredScenarios = filterType === "all"
    ? allScenarios
    : allScenarios.filter((s: any) => s.scenarioType === filterType);

  const groupedByType = filteredScenarios.reduce((acc: Record<string, any[]>, s: any) => {
    const key = s.scenarioType || "custom";
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">سيناريوهات الشخصية</h1>
            <p className="text-sm text-muted-foreground">إدارة سيناريوهات الترحيب واحترام القادة لراصد الذكي</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="جميع الأنواع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="greeting_first">ترحيب أول</SelectItem>
              <SelectItem value="greeting_return">ترحيب عائد</SelectItem>
              <SelectItem value="leader_respect">احترام القادة</SelectItem>
              <SelectItem value="custom">مخصص</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                إضافة سيناريو
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-right">
                  {editingId ? "تعديل السيناريو" : "إضافة سيناريو جديد"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">نوع السيناريو</label>
                  <Select value={formType} onValueChange={(v) => setFormType(v as ScenarioType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            <val.icon className={`w-4 h-4 ${val.color}`} />
                            {val.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    كلمة التفعيل
                    <span className="text-muted-foreground text-xs mr-1">(اختياري)</span>
                  </label>
                  <Input
                    value={formTrigger}
                    onChange={(e) => setFormTrigger(e.target.value)}
                    placeholder="مثال: ولي العهد، الملك، مرحبا..."
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    الكلمة أو العبارة التي تفعّل هذا السيناريو عند ذكرها
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">نص الاستجابة</label>
                  <Textarea
                    value={formResponse}
                    onChange={(e) => setFormResponse(e.target.value)}
                    placeholder="نص الاستجابة الذي سيستخدمه راصد الذكي..."
                    rows={4}
                    dir="rtl"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    يمكنك استخدام {"{{user_name}}"} لإدراج اسم المستخدم تلقائياً
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFormActive(!formActive)}
                    className={`w-10 h-6 rounded-full transition-colors ${formActive ? "bg-emerald-500" : "bg-muted"} relative`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${formActive ? "right-1" : "right-5"}`} />
                  </button>
                  <span className="text-sm">{formActive ? "مفعّل" : "معطّل"}</span>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  )}
                  {editingId ? "تحديث السيناريو" : "إنشاء السيناريو"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(typeLabels).map(([key, val]) => {
          const count = allScenarios.filter((s: any) => s.scenarioType === key).length;
          const activeCount = allScenarios.filter((s: any) => s.scenarioType === key && s.isActive).length;
          return (
            <Card key={key} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg ${val.bgColor} border flex items-center justify-center`}>
                    <val.icon className={`w-4 h-4 ${val.color}`} />
                  </div>
                  <span className="text-sm font-medium">{val.label}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-xs text-muted-foreground">({activeCount} مفعّل)</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scenarios List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredScenarios.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <HeartHandshake className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-1">لا توجد سيناريوهات</p>
            <p className="text-sm text-muted-foreground/60 mb-4">أضف سيناريوهات ترحيب واحترام القادة لتخصيص شخصية راصد الذكي</p>
            <Button onClick={() => setDialogOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة أول سيناريو
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByType).map(([type, items]) => {
            const typeInfo = typeLabels[type as ScenarioType] || typeLabels.custom;
            const TypeIcon = typeInfo.icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                  <h3 className="text-sm font-semibold">{typeInfo.label}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{items.length}</span>
                </div>
                <div className="grid gap-3">
                  {items.map((scenario: any) => (
                    <motion.div
                      key={scenario.id}
                      layout
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className={`border-border/50 ${!scenario.isActive ? "opacity-50" : ""}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {scenario.isActive ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                )}
                                {scenario.triggerKeyword && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border font-mono">
                                    {scenario.triggerKeyword}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
                                {scenario.responseTemplate}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditDialog(scenario)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => {
                                  if (confirm("هل أنت متأكد من حذف هذا السيناريو؟")) {
                                    deleteMutation.mutate({ id: scenario.id });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
