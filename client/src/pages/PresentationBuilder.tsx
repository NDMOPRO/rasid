import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Plus, Trash2, Download, Save, FileText, LayoutTemplate,
  ChevronRight, ChevronLeft, Eye, GripVertical, Presentation,
  Palette, Type, AlignRight, AlignCenter, Loader2, FileDown,
  Copy, ArrowLeft, Maximize, Minimize, Play, Pause
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Types ──────────────────────────────────────────────────
interface SlideData {
  id: string;
  type: "cover" | "content" | "stats" | "closing";
  title: string;
  subtitle: string;
  content: string;
  bgColor: string;
  textColor: string;
  layout: "center" | "right" | "left";
}

// ─── Sortable Slide Thumbnail ───────────────────────────────
function SortableSlide({ slide, index, isActive, onClick }: {
  slide: SlideData; index: number; isActive: boolean; onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slide.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto' as any,
  };

  return (
    <div ref={setNodeRef} style={style} className={`group relative rounded-lg border-2 transition-all cursor-pointer ${isActive ? "border-primary shadow-lg" : "border-border hover:border-primary/50"}`}>
      <div className="flex items-center">
        <button {...attributes} {...listeners} className="p-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none">
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 p-2" onClick={onClick}>
          <div className="aspect-[16/9] rounded overflow-hidden mb-1" style={{ backgroundColor: slide.bgColor }}>
            <div className="w-full h-full flex items-center justify-center p-2">
              <span className="text-[8px] font-bold truncate" style={{ color: slide.textColor }}>
                {slide.title || `شريحة ${index + 1}`}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between flex-wrap">
            <span className="text-xs sm:text-[10px] text-muted-foreground">{index + 1}</span>
            <span className="text-xs sm:text-[10px] text-muted-foreground capitalize">{slide.type}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Slide Preview ──────────────────────────────────────────
function SlidePreview({ slide, scale = 1 }: { slide: SlideData; scale?: number }) {
  return (
    <div
      className="overflow-x-hidden max-w-full aspect-[16/9] rounded-xl overflow-hidden shadow-xl border border-border/50"
      style={{ backgroundColor: slide.bgColor, transform: `scale(${scale})`, transformOrigin: "top center" }}
    >
      <div className={`w-full h-full flex flex-col p-3 sm:p-8 ${slide.layout === "center" ? "items-center justify-center text-center" : "items-start justify-start"}`} dir="rtl">
        {slide.title && (
          <h2
            className={`font-bold mb-3 ${slide.type === "cover" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}
            style={{ color: slide.textColor }}
          >
            {slide.title}
          </h2>
        )}
        {slide.subtitle && (
          <h3
            className={`mb-4 ${slide.type === "cover" ? "text-xl opacity-80 italic" : "text-lg opacity-70"}`}
            style={{ color: slide.textColor }}
          >
            {slide.subtitle}
          </h3>
        )}
        {slide.content && (
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap max-h-[60%] overflow-hidden"
            style={{ color: slide.textColor, opacity: 0.9 }}
          >
            {slide.content}
          </div>
        )}
        {/* Footer */}
        <div className="absolute bottom-3 left-0 right-0 text-center">
          <span className="text-xs sm:text-[10px] opacity-30" style={{ color: slide.textColor }}>
            منصة راصد - الهيئة السعودية للبيانات والذكاء الاصطناعي
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Template Card ──────────────────────────────────────────
function TemplateCard({ template, onSelect }: { template: any; onSelect: () => void }) {
  const categoryLabels: Record<string, string> = {
    business_plan: "خطة عمل",
    report: "تقرير",
    sales_pitch: "عرض مبيعات",
    compliance: "امتثال",
    executive: "تنفيذي",
    custom: "مخصص",
  };
  const categoryColors: Record<string, string> = {
    business_plan: "bg-blue-500/10 text-blue-600",
    report: "bg-emerald-500/10 text-emerald-600",
    sales_pitch: "bg-amber-500/10 text-amber-600",
    compliance: "bg-purple-500/10 text-purple-600",
    executive: "bg-rose-500/10 text-rose-600",
    custom: "bg-gray-500/10 text-gray-600",
  };

  const slides = typeof template.slides === "string" ? JSON.parse(template.slides) : template.slides;
  const firstSlide = slides?.[0];

  return (
    <Card className="group hover:shadow-lg transition-all cursor-pointer border-border/50 hover:border-primary/50" onClick={onSelect}>
      <CardContent className="p-4">
        {/* Preview thumbnail */}
        <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 border border-border/30" style={{ backgroundColor: firstSlide?.bgColor || "#0B1D35" }}>
          <div className="w-full h-full flex items-center justify-center p-4">
            <span className="text-sm font-bold" style={{ color: firstSlide?.textColor || "#fff" }}>
              {firstSlide?.title || template.name}
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap">
            <h3 className="font-bold text-sm">{template.name}</h3>
            <span className={`text-xs sm:text-[10px] px-2 py-0.5 rounded-full font-medium ${categoryColors[template.category] || categoryColors.custom}`}>
              {categoryLabels[template.category] || template.category}
            </span>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
          <div className="flex items-center justify-between flex-wrap text-xs text-muted-foreground">
            <span>{slides?.length || 0} شرائح</span>
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
              <Plus className="w-3 h-3" /> استخدام
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Color Presets ──────────────────────────────────────────
const COLOR_PRESETS = [
  { bg: "#0B1D35", text: "#ffffff", label: "كحلي داكن" },
  { bg: "#0B1D35", text: "#C5A55A", label: "كحلي + ذهبي" },
  { bg: "#1a5276", text: "#ffffff", label: "أزرق ملكي" },
  { bg: "#ffffff", text: "#0B1D35", label: "أبيض + كحلي" },
  { bg: "#f8f9fa", text: "#0B1D35", label: "رمادي فاتح" },
  { bg: "#f0f4f8", text: "#0B1D35", label: "أزرق فاتح" },
  { bg: "#1e3a8a", text: "#ffffff", label: "أزرق داكن" },
  { bg: "#064e3b", text: "#ffffff", label: "أخضر داكن" },
  { bg: "#7c2d12", text: "#ffffff", label: "بني داكن" },
  { bg: "#581c87", text: "#ffffff", label: "بنفسجي" },
];

// ─── Main Component ─────────────────────────────────────────
export default function PresentationBuilder() {
  const params = useParams<{ id?: string }>();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // State
  const [mode, setMode] = useState<"templates" | "editor" | "preview">("templates");
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [title, setTitle] = useState("عرض تقديمي جديد");
  const [description, setDescription] = useState("");
  const [presentationId, setPresentationId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [previewSlideIndex, setPreviewSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [templateCategory, setTemplateCategory] = useState("all");

  // tRPC
  const templatesQuery = trpc.presentationBuilder.listTemplates.useQuery({ category: templateCategory === "all" ? undefined : templateCategory });
  const presentationsQuery = trpc.presentationBuilder.list.useQuery(undefined, { enabled: mode === "templates" });
  const seedTemplates = trpc.presentationBuilder.seedTemplates.useMutation({
    onSuccess: () => { templatesQuery.refetch(); toast.success("تم تحميل القوالب بنجاح"); },
  });
  const createPresentation = trpc.presentationBuilder.create.useMutation();
  const updatePresentation = trpc.presentationBuilder.update.useMutation();
  const deletePresentation = trpc.presentationBuilder.delete.useMutation();
  const exportPptx = trpc.presentationBuilder.exportPptx.useMutation();

  // Load existing presentation
  const existingPresentation = trpc.presentationBuilder.get.useQuery(
    { id: Number(params.id) },
    { enabled: !!params.id }
  );

  useEffect(() => {
    if (existingPresentation.data) {
      const pres = existingPresentation.data;
      setTitle(pres.title);
      setDescription(pres.description || "");
      setPresentationId(pres.id);
      const parsedSlides = typeof pres.slides === "string" ? JSON.parse(pres.slides) : pres.slides;
      setSlides(parsedSlides);
      setMode("editor");
    }
  }, [existingPresentation.data]);

  // Seed templates on first load
  useEffect(() => {
    if (templatesQuery.data && templatesQuery.data.length === 0 && !seedTemplates.isPending) {
      seedTemplates.mutate();
    }
  }, [templatesQuery.data]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Active slide
  const activeSlide = slides[activeSlideIndex];

  // Handlers
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSlides((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update active index
        if (activeSlideIndex === oldIndex) setActiveSlideIndex(newIndex);
        else if (activeSlideIndex >= Math.min(oldIndex, newIndex) && activeSlideIndex <= Math.max(oldIndex, newIndex)) {
          setActiveSlideIndex(oldIndex < newIndex ? activeSlideIndex - 1 : activeSlideIndex + 1);
        }
        return newItems;
      });
    }
  }, [activeSlideIndex]);

  const addSlide = useCallback((type: SlideData["type"] = "content") => {
    const newSlide: SlideData = {
      id: `s${Date.now()}`,
      type,
      title: type === "cover" ? "عنوان الشريحة" : type === "closing" ? "شكراً لكم" : "عنوان جديد",
      subtitle: "",
      content: "",
      bgColor: type === "cover" || type === "closing" ? "#0B1D35" : "#ffffff",
      textColor: type === "cover" || type === "closing" ? "#ffffff" : "#0B1D35",
      layout: type === "cover" || type === "closing" || type === "stats" ? "center" : "right",
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  }, [slides.length]);

  const duplicateSlide = useCallback(() => {
    if (!activeSlide) return;
    const dup = { ...activeSlide, id: `s${Date.now()}` };
    const newSlides = [...slides];
    newSlides.splice(activeSlideIndex + 1, 0, dup);
    setSlides(newSlides);
    setActiveSlideIndex(activeSlideIndex + 1);
  }, [activeSlide, activeSlideIndex, slides]);

  const deleteSlide = useCallback(() => {
    if (slides.length <= 1) { toast.error("لا يمكن حذف آخر شريحة"); return; }
    setSlides((prev) => prev.filter((_, i) => i !== activeSlideIndex));
    setActiveSlideIndex(Math.max(0, activeSlideIndex - 1));
  }, [activeSlideIndex, slides.length]);

  const updateSlide = useCallback((field: keyof SlideData, value: string) => {
    setSlides((prev) => prev.map((s, i) => i === activeSlideIndex ? { ...s, [field]: value } : s));
  }, [activeSlideIndex]);

  const selectTemplate = useCallback((template: any) => {
    const parsedSlides = typeof template.slides === "string" ? JSON.parse(template.slides) : template.slides;
    setSlides(parsedSlides);
    setTitle(template.name);
    setDescription(template.description || "");
    setActiveSlideIndex(0);
    setMode("editor");
    setShowTemplateDialog(false);
    toast.success(`تم تحميل قالب "${template.name}"`);
  }, []);

  const openExistingPresentation = useCallback((pres: any) => {
    const parsedSlides = typeof pres.slides === "string" ? JSON.parse(pres.slides) : pres.slides;
    setSlides(parsedSlides);
    setTitle(pres.title);
    setDescription(pres.description || "");
    setPresentationId(pres.id);
    setActiveSlideIndex(0);
    setMode("editor");
  }, []);

  const handleSave = useCallback(async () => {
    if (!title.trim()) { toast.error("يرجى إدخال عنوان العرض"); return; }
    setIsSaving(true);
    try {
      if (presentationId) {
        await updatePresentation.mutateAsync({ id: presentationId, title, description, slides });
        toast.success("تم حفظ التغييرات");
      } else {
        const result = await createPresentation.mutateAsync({ title, description, slides });
        setPresentationId(result.id);
        toast.success("تم إنشاء العرض بنجاح");
      }
      presentationsQuery.refetch();
    } catch (err: any) {
      toast.error(err.message || "خطأ في الحفظ");
    } finally {
      setIsSaving(false);
    }
  }, [title, description, slides, presentationId]);

  const handleExportPptx = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await exportPptx.mutateAsync({
        slides,
        title,
      });
      // Download the file
      const a = document.createElement("a");
      a.href = result.url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("تم تصدير العرض كملف PowerPoint");
    } catch (err: any) {
      toast.error(err.message || "خطأ في التصدير");
    } finally {
      setIsExporting(false);
    }
  }, [slides, title]);

  const handleDeletePresentation = useCallback(async (id: number) => {
    try {
      await deletePresentation.mutateAsync({ id });
      presentationsQuery.refetch();
      toast.success("تم حذف العرض");
    } catch {
      toast.error("خطأ في الحذف");
    }
  }, []);

  // Auto-advance in preview mode
  useEffect(() => {
    if (mode !== "preview" || !isPlaying) return;
    const timer = setInterval(() => {
      setPreviewSlideIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [mode, isPlaying, slides.length]);

  // Keyboard navigation in preview
  useEffect(() => {
    if (mode !== "preview") return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setPreviewSlideIndex((p) => (p + 1) % slides.length);
      else if (e.key === "ArrowRight") setPreviewSlideIndex((p) => (p - 1 + slides.length) % slides.length);
      else if (e.key === "Escape") setMode("editor");
      else if (e.key === " ") { e.preventDefault(); setIsPlaying((p) => !p); }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mode, slides.length]);

  const slideIds = useMemo(() => slides.map((s) => s.id), [slides]);

  // ─── Templates View ───────────────────────────────────────
  if (mode === "templates") {
    return (
      <div className="p-6 space-y-6" dir="rtl">
        <div className="flex items-center justify-between flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 gradient-text">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-[oklch(0.48_0.14_290)] flex items-center justify-center">
                <Presentation className="w-5 h-5 text-white" />
              </div>
              منشئ العروض التقديمية
            </h1>
            <p className="text-muted-foreground mt-1">أنشئ عروض تقديمية احترافية من القوالب الجاهزة أو من الصفر</p>
          </div>
          <Button onClick={() => { setSlides([{ id: "s1", type: "cover", title: "عنوان العرض", subtitle: "العنوان الفرعي", content: "", bgColor: "#0B1D35", textColor: "#ffffff", layout: "center" }]); setMode("editor"); }} className="gap-2">
            <Plus className="w-4 h-4" /> عرض جديد فارغ
          </Button>
        </div>

        {/* Templates Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap">
            <h2 className="text-lg font-bold">القوالب الجاهزة</h2>
            <div className="flex gap-2">
              {[
                { value: "all", label: "الكل" },
                { value: "business_plan", label: "خطة عمل" },
                { value: "report", label: "تقرير" },
                { value: "sales_pitch", label: "عرض مبيعات" },
              ].map((cat) => (
                <Button
                  key={cat.value}
                  variant={templateCategory === cat.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTemplateCategory(cat.value)}
                  className="text-xs"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          {templatesQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(templatesQuery.data || []).map((template: any) => (
                <TemplateCard key={template.id} template={template} onSelect={() => selectTemplate(template)} />
              ))}
            </div>
          )}
        </div>

        {/* My Presentations */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold">عروضي التقديمية</h2>
          {presentationsQuery.isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (presentationsQuery.data || []).length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">لا توجد عروض تقديمية بعد</p>
                <p className="text-xs mt-1">اختر قالباً أو أنشئ عرضاً جديداً</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(presentationsQuery.data || []).map((pres: any) => {
                const presSlides = typeof pres.slides === "string" ? JSON.parse(pres.slides) : pres.slides;
                const firstSlide = presSlides?.[0];
                return (
                  <Card key={pres.id} className="group hover:shadow-lg transition-all cursor-pointer border-border/50 hover:border-primary/50" onClick={() => openExistingPresentation(pres)}>
                    <CardContent className="p-4">
                      <div className="aspect-[16/9] rounded-lg overflow-hidden mb-3 border border-border/30" style={{ backgroundColor: firstSlide?.bgColor || "#0B1D35" }}>
                        <div className="w-full h-full flex items-center justify-center p-4">
                          <span className="text-sm font-bold" style={{ color: firstSlide?.textColor || "#fff" }}>
                            {firstSlide?.title || pres.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between flex-wrap">
                        <div>
                          <h3 className="font-bold text-sm">{pres.title}</h3>
                          <p className="text-xs text-muted-foreground">{presSlides?.length || 0} شرائح</p>
                        </div>
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); handleDeletePresentation(pres.id); }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Preview Mode ─────────────────────────────────────────
  if (mode === "preview") {
    const previewSlide = slides[previewSlideIndex];
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col" dir="rtl">
        <div className="flex-1 flex items-center justify-center p-4">
          {previewSlide && (
            <div className="w-full max-w-[95vw] sm:max-w-5xl">
              <SlidePreview slide={previewSlide} />
            </div>
          )}
        </div>
        <div className="flex items-center justify-between flex-wrap px-6 py-3 bg-black/80 border-t border-white/10">
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setPreviewSlideIndex(i)} className={`w-2 h-2 rounded-full transition-all ${i === previewSlideIndex ? "bg-primary w-6" : "bg-white/30 hover:bg-white/50"}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setPreviewSlideIndex((p) => (p - 1 + slides.length) % slides.length)} className="text-white/60 hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)} className="text-white/60 hover:text-white">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setPreviewSlideIndex((p) => (p + 1) % slides.length)} className="text-white/60 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">{previewSlideIndex + 1} / {slides.length}</span>
            <Button variant="ghost" size="sm" onClick={() => setMode("editor")} className="text-white/60 hover:text-white gap-1">
              <ArrowLeft className="w-4 h-4" /> رجوع للمحرر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Editor Mode ──────────────────────────────────────────
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col" dir="rtl">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between flex-wrap px-4 py-2 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => { setMode("templates"); setPresentationId(null); }} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> القوالب
          </Button>
          <div className="h-6 w-px bg-border" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 w-64 text-sm font-bold border-none bg-transparent focus-visible:ring-1"
            placeholder="عنوان العرض"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { setPreviewSlideIndex(activeSlideIndex); setMode("preview"); }} className="gap-1">
            <Eye className="w-4 h-4" /> معاينة
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving} className="gap-1">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPptx} disabled={isExporting} className="gap-1">
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            تصدير PPTX
          </Button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Slide List with DnD */}
        <div className="w-48 border-l border-border bg-card/30 overflow-y-auto p-2 space-y-2">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
              {slides.map((slide, index) => (
                <SortableSlide
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={index === activeSlideIndex}
                  onClick={() => setActiveSlideIndex(index)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Add Slide Buttons */}
          <div className="pt-2 border-t border-border space-y-1">
            <Button variant="ghost" size="sm" onClick={() => addSlide("content")} className="w-full justify-start text-xs gap-1">
              <Plus className="w-3 h-3" /> شريحة محتوى
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addSlide("stats")} className="w-full justify-start text-xs gap-1">
              <Plus className="w-3 h-3" /> شريحة إحصائيات
            </Button>
            <Button variant="ghost" size="sm" onClick={() => addSlide("cover")} className="w-full justify-start text-xs gap-1">
              <Plus className="w-3 h-3" /> شريحة غلاف
            </Button>
          </div>
        </div>

        {/* Center: Slide Preview */}
        <div className="flex-1 flex items-center justify-center p-3 sm:p-8 bg-muted/30 overflow-auto">
          {activeSlide ? (
            <div className="w-full max-w-[95vw] sm:max-w-3xl">
              <SlidePreview slide={activeSlide} />
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <Presentation className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>أضف شريحة للبدء</p>
            </div>
          )}
        </div>

        {/* Right: Properties Panel */}
        {activeSlide && (
          <div className="w-80 border-r border-border bg-card/30 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap">
              <h3 className="font-bold text-sm">خصائص الشريحة</h3>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={duplicateSlide} title="نسخ">
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={deleteSlide} title="حذف">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Slide Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">نوع الشريحة</label>
              <Select value={activeSlide.type} onValueChange={(v) => updateSlide("type", v)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">غلاف</SelectItem>
                  <SelectItem value="content">محتوى</SelectItem>
                  <SelectItem value="stats">إحصائيات</SelectItem>
                  <SelectItem value="closing">ختام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">العنوان</label>
              <Input value={activeSlide.title} onChange={(e) => updateSlide("title", e.target.value)} className="h-8 text-sm" placeholder="عنوان الشريحة" />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">العنوان الفرعي</label>
              <Input value={activeSlide.subtitle} onChange={(e) => updateSlide("subtitle", e.target.value)} className="h-8 text-sm" placeholder="العنوان الفرعي" />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">المحتوى</label>
              <Textarea value={activeSlide.content} onChange={(e) => updateSlide("content", e.target.value)} className="text-sm min-h-[120px]" placeholder="محتوى الشريحة..." />
            </div>

            {/* Layout */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">المحاذاة</label>
              <div className="flex gap-1">
                {(["right", "center", "left"] as const).map((l) => (
                  <Button
                    key={l}
                    variant={activeSlide.layout === l ? "default" : "outline"}
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={() => updateSlide("layout", l)}
                  >
                    {l === "right" ? <><AlignRight className="w-3 h-3 ml-1" /> يمين</> : l === "center" ? <><AlignCenter className="w-3 h-3 ml-1" /> وسط</> : <><AlignRight className="w-3 h-3 ml-1 rotate-180" /> يسار</>}
                  </Button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Palette className="w-3 h-3" /> الألوان
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {COLOR_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 ${activeSlide.bgColor === preset.bg && activeSlide.textColor === preset.text ? "border-primary ring-2 ring-primary/30" : "border-border"}`}
                    style={{ backgroundColor: preset.bg }}
                    onClick={() => { updateSlide("bgColor", preset.bg); updateSlide("textColor", preset.text); }}
                    title={preset.label}
                  >
                    <span className="text-[8px] font-bold" style={{ color: preset.text }}>أ</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <div className="flex-1 space-y-1">
                  <label className="text-xs sm:text-[10px] text-muted-foreground">خلفية</label>
                  <div className="flex items-center gap-1">
                    <input type="color" value={activeSlide.bgColor} onChange={(e) => updateSlide("bgColor", e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                    <Input value={activeSlide.bgColor} onChange={(e) => updateSlide("bgColor", e.target.value)} className="h-7 text-xs sm:text-[10px] font-mono" />
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs sm:text-[10px] text-muted-foreground">النص</label>
                  <div className="flex items-center gap-1">
                    <input type="color" value={activeSlide.textColor} onChange={(e) => updateSlide("textColor", e.target.value)} className="w-6 h-6 rounded cursor-pointer" />
                    <Input value={activeSlide.textColor} onChange={(e) => updateSlide("textColor", e.target.value)} className="h-7 text-xs sm:text-[10px] font-mono" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
