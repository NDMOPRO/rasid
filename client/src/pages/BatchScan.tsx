import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { FileSpreadsheet, Upload, Download, Clock, CheckCircle2, XCircle, Loader2, AlertTriangle, FileDown } from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const statusLabels: Record<string, string> = {
  pending: "في الانتظار",
  processing: "جاري المعالجة",
  completed: "مكتمل",
  failed: "فشل",
};

const statusColors: Record<string, string> = {
  pending: "bg-blue-500/10 text-blue-600",
  processing: "bg-amber-500/10 text-amber-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  failed: "bg-red-500/10 text-red-600",
};

export default function BatchScan() {
  const { playClick, playHover } = useSoundEffects();
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const { data, isLoading, refetch } = trpc.batchScan.jobs.useQuery({ page, limit: 10 });

  const uploadMutation = trpc.batchScan.upload.useMutation({
    onSuccess: () => {
      toast.success("تم بدء الفحص الدفعي بنجاح");
      setUploading(false);
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message);
      setUploading(false);
    },
  });

  const handleFileUpload = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      toast.error("يرجى رفع ملف Excel أو CSV");
      return;
    }

    setUploading(true);
    try {
      // Read file and parse URLs
      const text = await file.text();
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
      
      // Try to extract URLs from each line (CSV format)
      const urls: string[] = [];
      for (const line of lines) {
        const parts = line.split(",").map(p => p.trim().replace(/"/g, ""));
        for (const part of parts) {
          if (part.match(/^https?:\/\//) || part.match(/^[a-zA-Z0-9][-a-zA-Z0-9]*\.[a-zA-Z]{2,}/)) {
            urls.push(part.startsWith("http") ? part : `https://${part}`);
            break;
          }
        }
      }

      if (urls.length === 0) {
        toast.error("لم يتم العثور على روابط في الملف");
        setUploading(false);
        return;
      }

      uploadMutation.mutate({
        jobName: file.name,
        urls: urls.map(u => ({ url: u })),
      });
    } catch {
      toast.error("فشل في قراءة الملف");
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const downloadTemplate = () => {
    const csv = "الرابط,القطاع,التصنيف\nhttps://example.com.sa,حكومي,صحي\nhttps://example2.com.sa,خاص,تجاري\n";
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rasid_batch_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      <WatermarkLogo />
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
            <FileSpreadsheet className="h-7 w-7 text-primary" />
            الفحص الدفعي
          </h1>
          <p className="text-muted-foreground mt-1">فحص مواقع متعددة دفعة واحدة عبر رفع ملف Excel أو CSV</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="gap-2">
          <FileDown className="h-4 w-4" />
          تحميل القالب
        </Button>
      </div>

      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-all duration-300 ${dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/20 hover:border-primary/50"}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h3 className="text-lg font-semibold">جاري معالجة الملف...</h3>
              <p className="text-sm text-muted-foreground mt-1">يتم استخراج الروابط وبدء الفحص</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 animate-float btn-glow">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">اسحب وأفلت الملف هنا</h3>
              <p className="text-sm text-muted-foreground mt-1">أو انقر لاختيار ملف Excel أو CSV</p>
              <Button
                variant="outline"
                className="mt-4 gap-2"
                onClick={() => fileRef.current?.click()}
              >
                <FileSpreadsheet className="h-4 w-4" />
                اختيار ملف
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file);
                }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Jobs List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">سجل عمليات الفحص الدفعي</h2>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse"><CardContent className="p-4 h-20" /></Card>
            ))}
          </div>
        ) : data?.jobs && data.jobs.length > 0 ? (
          <div className="space-y-3">
            {data.jobs.map((job: any, i: number) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusColors[job.status] || statusColors.pending}`}>
                        {job.status === "completed" && <CheckCircle2 className="h-5 w-5" />}
                        {job.status === "processing" && <Loader2 className="h-5 w-5 animate-spin" />}
                        {job.status === "pending" && <Clock className="h-5 w-5" />}
                        {job.status === "failed" && <XCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{job.file_name || "فحص دفعي"}</h3>
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.created_at).toLocaleDateString("ar-SA-u-nu-latn")} - {job.total_urls} رابط
                        </p>
                      </div>
                    </div>
                    <Badge className={statusColors[job.status] || statusColors.pending}>
                      {statusLabels[job.status] || job.status}
                    </Badge>
                  </div>
                  {(job.status === "processing" || job.status === "completed") && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>التقدم</span>
                        <span>{job.processed_urls || 0} / {job.total_urls}</span>
                      </div>
                      <Progress value={job.total_urls > 0 ? ((job.processed_urls || 0) / job.total_urls) * 100 : 0} className="h-2" />
                    </div>
                  )}
                  {job.status === "completed" && (
                    <div className="flex gap-4 mt-3 text-xs">
                      <span className="text-emerald-600">ممتثل: {job.compliant_count || 0}</span>
                      <span className="text-red-600">غير ممتثل: {job.non_compliant_count || 0}</span>
                      <span className="text-amber-600">ممتثل جزئياً: {job.partial_count || 0}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-dashed glass-card gold-sweep">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-lg font-semibold text-muted-foreground">لا توجد عمليات فحص دفعي</h3>
              <p className="text-sm text-muted-foreground/70 mt-1">ارفع ملف Excel للبدء</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {data && data.total > 10 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">صفحة {page} من {Math.ceil(data.total / 10)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 10)} onClick={() => setPage(p => p + 1)}>التالي</Button>
        </div>
      )}
    </div>
  );
}
