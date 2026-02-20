import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Mail, Plus, Edit, Trash2, Eye, Copy, Loader2, FileText } from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const typeLabels: Record<string, string> = {
  non_compliance_notice: "إشعار عدم امتثال",
  partial_compliance: "امتثال جزئي",
  compliance_achieved: "تحقيق الامتثال",
  follow_up: "متابعة",
  escalation: "تصعيد",
  reminder: "تذكير",
  acknowledgment: "إقرار",
  investigation: "تحقيق",
  closure: "إغلاق",
  general: "عام",
};

const typeColors: Record<string, string> = {
  non_compliance_notice: "bg-red-500/10 text-red-600",
  partial_compliance: "bg-amber-500/10 text-amber-600",
  compliance_achieved: "bg-emerald-500/10 text-emerald-600",
  follow_up: "bg-blue-500/10 text-blue-600",
  escalation: "bg-primary/10 text-primary",
  reminder: "bg-cyan-500/10 text-cyan-600",
  acknowledgment: "bg-blue-800/10 text-blue-900",
  investigation: "bg-orange-500/10 text-orange-600",
  closure: "bg-gray-500/10 text-gray-600",
  general: "bg-indigo-500/10 text-indigo-600",
};

export default function MessageTemplates() {
  const { playClick, playHover } = useSoundEffects();
  const [addOpen, setAddOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  const [formData, setFormData] = useState({
    templateKey: "",
    nameAr: "",
    category: "general" as string,
    subject: "",
    body: "",
  });

  const { data: templates, isLoading, refetch } = trpc.messageTemplates.list.useQuery();

  const createMutation = trpc.messageTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء القالب بنجاح");
      setAddOpen(false);
      resetForm();
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = trpc.messageTemplates.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث القالب");
      setEditingTemplate(null);
      resetForm();
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.messageTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف القالب");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetForm = () => {
    setFormData({ templateKey: "", nameAr: "", category: "general", subject: "", body: "" });
  };

  const handleCreate = () => {
    if (!formData.nameAr || !formData.body) {
      toast.error("يرجى إدخال اسم القالب والمحتوى");
      return;
    }
    // Extract variables from template like {{variable_name}}
    const vars = Array.from(formData.body.matchAll(/\{\{(\w+)\}\}/g)).map(m => m[1]);
    createMutation.mutate({
      templateKey: formData.templateKey || formData.nameAr.replace(/\s+/g, '_').toLowerCase(),
      nameAr: formData.nameAr,
      subject: formData.subject,
      body: formData.body,
      variables: vars,
      category: formData.category,
    });
  };

  const handleUpdate = () => {
    if (!editingTemplate) return;
    updateMutation.mutate({
      id: editingTemplate.id,
      nameAr: formData.nameAr,
      subject: formData.subject,
      body: formData.body,
    });
  };

  const startEdit = (t: any) => {
    setFormData({
      templateKey: t.template_key || "",
      nameAr: t.name_ar || t.name || "",
      category: t.category || "general",
      subject: t.subject || "",
      body: t.body || t.body_template || "",
    });
    setEditingTemplate(t);
  };

  const copyTemplate = (body: string) => {
    navigator.clipboard.writeText(body || "");
    toast.success("تم نسخ القالب");
  };

  return (
    <div
      className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
            <Mail className="h-7 w-7 text-primary" />
            قوالب الرسائل
          </h1>
          <p className="text-muted-foreground mt-1">إدارة قوالب الرسائل والإشعارات الآلية</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="h-4 w-4" />
              قالب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء قالب جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label>اسم القالب *</Label>
                  <Input value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} placeholder="مثال: إشعار عدم امتثال" />
                </div>
                <div className="space-y-2">
                  <Label>النوع</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>الموضوع</Label>
                <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="موضوع الرسالة" />
              </div>
              <div className="space-y-2">
                <Label>محتوى القالب *</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder={"السلام عليكم {{entity_name}},\n\nنود إبلاغكم بأن موقعكم {{site_url}} ...\n\nاستخدم {{variable}} لإدراج متغيرات"}
                  rows={10}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">استخدم {"{{variable_name}}"} لإدراج متغيرات ديناميكية</p>
              </div>
              <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                إنشاء القالب
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-40" /></Card>
          ))}
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
          {templates.map((t: any, i: number) => (
            <Card key={t.id} className="hover:shadow-md transition-all duration-200 group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[t.type] || typeColors.general}`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">{t.name_ar || t.name}</h3>
                      <Badge variant="outline" className={`text-xs sm:text-[10px] ${typeColors[t.category] || typeColors.general}`}>
                        {typeLabels[t.category] || t.category || "عام"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setPreviewTemplate(t)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyTemplate(t.body || t.body_template)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(t)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => { if (confirm("هل تريد حذف هذا القالب؟")) deleteMutation.mutate({ id: t.id }); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {t.subject && <p className="text-xs text-muted-foreground mb-2">الموضوع: {t.subject}</p>}
                <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{t.body || t.body_template}</p>
                {t.variables && t.variables.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {t.variables.map((v: string) => (
                      <Badge key={v} variant="secondary" className="text-xs sm:text-[10px]">{`{{${v}}}`}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Mail className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">لا توجد قوالب</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">أنشئ قالب رسالة جديد للبدء</p>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(o) => !o && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl">
          {previewTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-primary" />
                  معاينة: {previewTemplate.name}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-4">
                {previewTemplate.subject && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <span className="text-xs font-medium text-muted-foreground">الموضوع:</span>
                    <p className="text-sm font-medium mt-1">{previewTemplate.subject}</p>
                  </div>
                )}
                <div className="bg-muted/30 rounded-lg p-4 border">
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed" dir="rtl">{previewTemplate.body || previewTemplate.body_template}</pre>
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={() => copyTemplate(previewTemplate.body || previewTemplate.body_template)}>
                  <Copy className="h-4 w-4" />
                  نسخ المحتوى
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(o) => { if (!o) { setEditingTemplate(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {editingTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>تعديل القالب</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4 stagger-children">
                  <div className="space-y-2">
                    <Label>اسم القالب</Label>
                    <Input value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>النوع</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(typeLabels).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>الموضوع</Label>
                  <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>محتوى القالب</Label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending} className="w-full">
                  {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                  حفظ التعديلات
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
