import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanSearch, Loader2, CheckCircle, XCircle, Globe, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const clauseNames = [
  "تحديد الغرض من جمع البيانات",
  "محتوى البيانات المطلوب جمعها",
  "طريقة جمع البيانات",
  "وسيلة حفظ البيانات",
  "كيفية معالجة البيانات",
  "كيفية إتلاف البيانات",
  "حقوق صاحب البيانات",
  "ممارسة الحقوق",
];

export default function Scan() {
  const { playClick, playHover } = useSoundEffects();
  const [url, setUrl] = useState("");
  const [, setLocation] = useLocation();

  const scanMutation = trpc.scans.newScan.useMutation({
    onSuccess: (data) => {
      toast.success(`تم فحص ${data.domain} بنجاح`);
    },
    onError: (err) => {
      toast.error(`خطأ في الفحص: ${err.message}`);
    },
  });

  const handleScan = () => {
    if (!url.trim()) {
      toast.error("الرجاء إدخال رابط الموقع");
      return;
    }
    let fullUrl = url.trim();
    if (!fullUrl.startsWith("http")) fullUrl = "https://" + fullUrl;
    scanMutation.mutate({ url: fullUrl });
  };

  const result = scanMutation.data;

  return (
    <div className="space-y-6">
      <WatermarkLogo />
      <div>
        <h1 className="text-2xl font-bold gradient-text">فحص جديد</h1>
        <p className="text-muted-foreground text-sm mt-1">
          أدخل رابط الموقع لفحص مدى امتثاله لنظام حماية البيانات الشخصية
        </p>
      </div>

      {/* Scan Input */}
      <Card className="glass-card gold-sweep">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Globe className="absolute end-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="أدخل رابط الموقع مثل: example.com.sa"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleScan(); }}
                className="pe-11 text-base h-12"
                disabled={scanMutation.isPending}
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={scanMutation.isPending}
              size="lg"
              className="h-12 px-8 gap-2"
            >
              {scanMutation.isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جاري الفحص...
                </>
              ) : (
                <>
                  <ScanSearch className="h-5 w-5" />
                  فحص الموقع
                </>
              )}
            </Button>
          </div>
          {scanMutation.isPending && (
            <div className="mt-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <div>
                  <p className="text-sm font-medium">جاري فحص الموقع...</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    يتم الزحف على الموقع والبحث عن صفحة سياسة الخصوصية وتحليلها بالذكاء الاصطناعي
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <div className="space-y-4">
          <Card className="glass-card gold-sweep">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center btn-glow">
                    <Globe className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">{result.domain}</h2>
                    {result.privacyUrl && (
                      <a href={result.privacyUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                        {result.privacyUrl}
                      </a>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold" style={{ color: getScoreColor(result.score) }}>
                    {Math.round(result.score)}%
                  </div>
                  <Badge variant="outline" className={getStatusBadgeClass(result.status)}>
                    {getStatusLabel(result.status)}
                  </Badge>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setLocation(`/sites/${result.siteId}`)}
                className="gap-2"
              >
                عرض التفاصيل الكاملة
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "compliant": return "badge-compliant";
    case "partially_compliant": return "badge-partial";
    case "non_compliant": return "badge-non-compliant";
    case "no_policy": return "badge-non-compliant";
    case "not_working": return "badge-no-policy";
    default: return "";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "compliant": return "ممتثل";
    case "partially_compliant": return "ممتثل جزئياً";
    case "non_compliant": return "غير ممتثل";
    case "no_policy": return "غير ممتثل";
    case "not_working": return "لا يعمل";
    default: return status;
  }
}
