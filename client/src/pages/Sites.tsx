import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { ScreenshotThumbnail } from "@/components/ScreenshotPreview";
import { useState } from "react";
import { useLocation } from "wouter";
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const statusLabels: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  no_policy: "غير ممتثل",
  not_working: "لا يعمل",
};

const classifications = [
  "الكل", "حكومي", "تجاري", "تقني / اتصالات", "صحي / طبي",
  "تعليمي", "مالي / مصرفي", "منظمة / غير ربحي", "عقاري",
  "تجارة إلكترونية", "طاقة / نفط", "نقل / لوجستي", "سعودي عام",
];

export default function Sites() {
  const { playClick, playHover } = useSoundEffects();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [classification, setClassification] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("all");
  const [, setLocation] = useLocation();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  const { data, isLoading } = trpc.sites.list.useQuery({
    page,
    limit: 25,
    search: search || undefined,
    classification: classification === "الكل" ? undefined : classification,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const totalPages = Math.ceil((data?.total || 0) / 25);

  const handleRowClick = (siteId: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a, button')) {
      e.stopPropagation();
      return;
    }
    setLocation(`/sites/${siteId}`);
  };

  return (
    <div className="space-y-6">
      <WatermarkLogo />
      <div>
        <h1 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, #C5A55A, #F5E6A3, #C5A55A)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gold-shimmer-sweep 5s ease-in-out infinite' }}>المواقع</h1>
        <p className="text-muted-foreground text-sm mt-1">
          قائمة بجميع المواقع السعودية المرصودة (
          <span
            onClick={() => openDrillDown({ title: "جميع المواقع المرصودة" })}
            className="font-bold cursor-pointer hover:underline transition-all"
          >
            {data?.total?.toLocaleString("ar-SA-u-nu-latn") || "..."}
          </span> موقع)
        </p>
      </div>

      {/* Filters */}
      <Card className="glass-card gold-sweep">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالنطاق أو اسم الموقع..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                className="pe-10"
              />
            </div>
            <Select value={classification} onValueChange={(v) => { setClassification(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                {classifications.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="unreachable">غير متاح</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setSearch(searchInput); setPage(1); }} className="shrink-0">
              بحث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sites Table */}
      <Card className="glass-card gold-sweep">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(197,165,90,0.12)] bg-[rgba(197,165,90,0.04)]">
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">#</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">النطاق</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">الاسم</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">التصنيف</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">الامتثال</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">النتيجة</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">البريد</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.sites?.map((site, idx) => (
                      <tr
                        key={site.id}
                        className="border-b border-[rgba(197,165,90,0.06)] hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200 cursor-pointer"
                        onClick={(e) => handleRowClick(site.id, e)}
                      >
                        <td className="py-3 px-4 text-muted-foreground">{(page - 1) * 25 + idx + 1}</td>
                        <td className="py-3 px-4 font-medium">
                          <div className="flex items-center gap-2">
                            <ScreenshotThumbnail url={site.screenshotUrl} domain={site.domain} size="xs" />
                            <span>{site.domain}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground truncate max-w-[200px]">{site.siteName || "-"}</td>
                        <td 
                          className="py-3 px-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `مواقع مصنفة كـ ${site.classification}`, classification: site.classification || undefined }); }}
                        >
                          <Badge variant="outline" className="text-xs">{site.classification || "-"}</Badge>
                        </td>
                        <td 
                          className="py-3 px-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                          onClick={(e) => { e.stopPropagation(); openDrillDown({ title: `المواقع ${site.siteStatus === "active" ? "النشطة" : "غير المتاحة"}`, siteStatus: site.siteStatus }); }}
                        >
                          <Badge variant="outline" className={site.siteStatus === "active" ? "badge-compliant" : "badge-no-policy"}>
                            {site.siteStatus === "active" ? "نشط" : "غير متاح"}
                          </Badge>
                        </td>
                        <td 
                          className="py-3 px-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                          onClick={(e) => { e.stopPropagation(); site.latestScan && openDrillDown({ title: `مواقع بحالة امتثال ${statusLabels[site.latestScan.complianceStatus]}`, complianceStatus: site.latestScan.complianceStatus as any }); }}
                        >
                          {site.latestScan ? (
                            <Badge variant="outline" className={getStatusBadgeClass(site.latestScan.complianceStatus || "")}>
                              {statusLabels[site.latestScan.complianceStatus || ""] || "-"}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">لم يُفحص</span>
                          )}
                        </td>
                        <td 
                          className="py-3 px-4 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                          onClick={(e) => { e.stopPropagation(); site.latestScan && openDrillDown({ title: `مواقع بنتيجة ${Math.round(site.latestScan.overallScore || 0)}%`, subtitle: "عرض المواقع ذات النتائج المماثلة" }); }}
                        >
                          {site.latestScan ? (
                            <span className="font-bold" style={{ color: getScoreColor(site.latestScan.overallScore || 0) }}>
                              {Math.round(site.latestScan.overallScore || 0)}%
                            </span>
                          ) : "-"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground truncate max-w-[150px] text-xs">
                          {site.emails || "-"}
                        </td>
                        <td className="py-3 px-4">
                           <button onClick={(e) => { e.stopPropagation(); window.open(site.privacyUrl, '_blank'); }} className="text-primary hover:underline">
                              <ExternalLink className="h-4 w-4" />
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-4 border-t border-[rgba(197,165,90,0.10)]">
                <span className="text-sm text-muted-foreground">
                  صفحة {page} من {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    التالي
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
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
    case "no_policy": return "badge-no-policy";
    default: return "";
  }
}

