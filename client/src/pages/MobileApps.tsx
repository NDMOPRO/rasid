import { useState } from "react";
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
import { Smartphone, Plus, Search, ExternalLink, Shield, AlertTriangle, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const platformLabels: Record<string, string> = {
  android: "أندرويد",
  ios: "آيفون",
  huawei: "هواوي",
};

const complianceColors: Record<string, string> = {
  compliant: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  non_compliant: "bg-red-500/10 text-red-600 border-red-500/20",
  partially_compliant: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  no_policy: "bg-red-500/10 text-red-600 border-red-500/20",
  not_working: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  not_scanned: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const complianceLabels: Record<string, string> = {
  compliant: "ممتثل",
  non_compliant: "غير ممتثل",
  partially_compliant: "ممتثل جزئياً",
  no_policy: "غير ممتثل",
  not_working: "لا يعمل",
  not_scanned: "لم يُفحص",
};

export default function MobileApps() {
  const { playClick, playHover } = useSoundEffects();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [platform, setPlatform] = useState<string>("");
  const [addOpen, setAddOpen] = useState(false);
  const [scanningId, setScanningId] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    appName: "",
    packageName: "",
    platform: "android" as string,
    storeUrl: "",
    developer: "",
    sectorType: "private" as string,
    classification: "other",
  });

  const { data, isLoading, refetch } = trpc.mobileApps.list.useQuery({
    page,
    limit: 12,
    search: search || undefined,
    platform: platform || undefined,
  });

  const { data: stats } = trpc.mobileApps.stats.useQuery();

  const scanMutation = trpc.mobileApps.scan.useMutation({
    onSuccess: () => {
      toast.success("تم فحص التطبيق بنجاح");
      setScanningId(null);
      setAddOpen(false);
      setFormData({ appName: "", packageName: "", platform: "android", storeUrl: "", developer: "", sectorType: "private", classification: "other" });
      refetch();
    },
    onError: (err: any) => {
      toast.error(err.message);
      setScanningId(null);
    },
  });

  const handleAdd = () => {
    if (!formData.storeUrl) {
      toast.error("يرجى إدخال رابط المتجر");
      return;
    }
    setScanningId(-1);
    scanMutation.mutate({
      storeUrl: formData.storeUrl,
      platform: formData.platform as "android" | "ios" | "huawei",
      sectorType: formData.sectorType as "public" | "private" | undefined,
      entityName: formData.appName || undefined,
    });
  };

  const handleScan = (app: any) => {
    setScanningId(app.id);
    scanMutation.mutate({
      storeUrl: app.store_url,
      platform: app.platform,
    });
  };

  return (
    <div
      className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Smartphone className="h-7 w-7 text-primary" />
            رصد تطبيقات الأجهزة الذكية
          </h1>
          <p className="text-muted-foreground mt-1">فحص امتثال تطبيقات الهواتف الذكية لنظام حماية البيانات الشخصية</p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              إضافة تطبيق
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة تطبيق جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label>اسم التطبيق *</Label>
                  <Input value={formData.appName} onChange={(e) => setFormData({ ...formData, appName: e.target.value })} placeholder="اسم التطبيق" />
                </div>
                <div className="space-y-2">
                  <Label>المنصة</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="android">Google Play</SelectItem>
                      <SelectItem value="ios">App Store</SelectItem>
                      <SelectItem value="huawei">Huawei AppGallery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>رابط المتجر *</Label>
                <Input value={formData.storeUrl} onChange={(e) => setFormData({ ...formData, storeUrl: e.target.value })} placeholder="https://play.google.com/store/apps/details?id=..." dir="ltr" />
              </div>
              <div className="grid grid-cols-2 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label>اسم الحزمة</Label>
                  <Input value={formData.packageName} onChange={(e) => setFormData({ ...formData, packageName: e.target.value })} placeholder="com.example.app" dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>المطور</Label>
                  <Input value={formData.developer} onChange={(e) => setFormData({ ...formData, developer: e.target.value })} placeholder="اسم المطور" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 stagger-children">
                <div className="space-y-2">
                  <Label>القطاع</Label>
                  <Select value={formData.sectorType} onValueChange={(v) => setFormData({ ...formData, sectorType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">حكومي</SelectItem>
                      <SelectItem value="private">خاص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>التصنيف</Label>
                  <Select value={formData.classification} onValueChange={(v) => setFormData({ ...formData, classification: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="health">صحي</SelectItem>
                      <SelectItem value="education">تعليمي</SelectItem>
                      <SelectItem value="commercial">تجاري</SelectItem>
                      <SelectItem value="financial">مالي</SelectItem>
                      <SelectItem value="government">حكومي</SelectItem>
                      <SelectItem value="telecom">اتصالات</SelectItem>
                      <SelectItem value="other">أخرى</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                <Button onClick={handleAdd} disabled={scanMutation.isPending} className="w-full">
                {scanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ms-2" /> : null}
                إضافة وفحص التطبيق
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
          {[
            { label: "إجمالي التطبيقات", value: stats.total, color: "text-blue-600", bg: "bg-blue-950/30" },
            { label: "ممتثل", value: stats.compliant, color: "text-emerald-600", bg: "bg-emerald-950/30" },
            { label: "غير ممتثل", value: stats.nonCompliant, color: "text-red-600", bg: "bg-red-950/30" },
            { label: "ممتثل جزئياً", value: stats.partial, color: "text-amber-600", bg: "bg-amber-950/30" },
            { label: "لا يعمل", value: stats.noPolicy, color: "text-gray-600", bg: "bg-gray-950/30" },
          ].map((s, i) => (
            <Card key={i} className={`${s.bg} border-none`}>
              <CardContent className="p-4 text-center">
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
            placeholder="بحث عن تطبيق..."
            className="pe-10"
          />
        </div>
        <Select value={platform} onValueChange={(v) => setPlatform(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="جميع المنصات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع المنصات</SelectItem>
            <SelectItem value="android">Google Play</SelectItem>
            <SelectItem value="ios">App Store</SelectItem>
            <SelectItem value="huawei">Huawei</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearch(searchInput); setPage(1); }}>بحث</Button>
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6 h-48" /></Card>
          ))}
        </div>
      ) : data?.apps && data.apps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {data.apps.map((app: any, i: number) => (
            <Card key={app.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {app.icon_url ? (
                      <img src={app.icon_url} alt="" className="w-12 h-12 rounded-xl shadow-sm" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <Smartphone className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="gradient-text text-sm leading-tight">{app.app_name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{app.developer || "غير محدد"}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs sm:text-[10px]">{platformLabels[app.platform] || app.platform}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between flex-wrap">
                  <Badge className={complianceColors[app.compliance_status || "not_scanned"]}>
                    {app.compliance_status === "compliant" && <CheckCircle2 className="h-3 w-3 ms-1" />}
                    {app.compliance_status === "non_compliant" && <XCircle className="h-3 w-3 ms-1" />}
                    {app.compliance_status === "partially_compliant" && <AlertTriangle className="h-3 w-3 ms-1" />}
                    {complianceLabels[app.compliance_status || "not_scanned"]}
                  </Badge>
                  {app.overall_score != null && (
                    <span className="text-sm font-semibold">{app.overall_score}%</span>
                  )}
                </div>
                {app.package_name && (
                  <p className="text-xs text-muted-foreground font-mono truncate" dir="ltr">{app.package_name}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={() => handleScan(app)}
                    disabled={scanningId === app.id}
                  >
                    {scanningId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
                    فحص
                  </Button>
                  {app.store_url && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={app.store_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Smartphone className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">لا توجد تطبيقات</h3>
            <p className="text-sm text-muted-foreground/70 mt-1">أضف تطبيقات للبدء في فحص امتثالها</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {data && data.total > 12 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>السابق</Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            صفحة {page} من {Math.ceil(data.total / 12)}
          </span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(data.total / 12)} onClick={() => setPage(p => p + 1)}>التالي</Button>
        </div>
      )}
    </div>
  );
}
