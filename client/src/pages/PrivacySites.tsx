import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useSearch } from "wouter";
import { useState, useMemo } from "react";
import { Search, ExternalLink, Globe, ChevronLeft, ChevronRight, Landmark, Building, Filter } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  compliant: { label: "ممتثل", variant: "default" },
  partially_compliant: { label: "ممتثل جزئياً", variant: "secondary" },
  partial: { label: "ممتثل جزئياً", variant: "secondary" },
  non_compliant: { label: "غير ممتثل", variant: "destructive" },
  not_working: { label: "لا يعمل", variant: "outline" },
};

export default function PrivacySites() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const complianceFilter = params.get("complianceStatus") || undefined;
  const sectorFilter = params.get("sectorType") || undefined;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const { data, isLoading } = trpc.privacy.sites.useQuery({
    complianceStatus: complianceFilter,
    status: complianceFilter,
    search: search || undefined,
    page,
    limit,
  });

  const siteList = useMemo(() => {
    let list = Array.isArray(data) ? data : Array.isArray((data as any)?.sites) ? (data as any).sites : [];
    if (sectorFilter) {
      list = list.filter((s: any) => s.sectorType === sectorFilter || s.sector === sectorFilter);
    }
    return list;
  }, [data, sectorFilter]);

  const totalCount = (data as any)?.total || siteList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const activeFilters: string[] = [];
  if (complianceFilter) activeFilters.push(statusMap[complianceFilter]?.label || complianceFilter);
  if (sectorFilter) activeFilters.push(sectorFilter === "public" ? "قطاع عام" : "قطاع خاص");

  const clearFilters = () => {
    setLocation("/app/sites");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-2 md:p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-primary" />المواقع السعودية</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          المواقع السعودية
          <Badge variant="outline" className="text-sm font-normal">{totalCount} موقع</Badge>
        </h1>
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {activeFilters.map((f) => (
              <Badge key={f} variant="secondary">{f}</Badge>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>إزالة الفلاتر</Button>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الرابط..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pr-10"
          />
        </div>
        <Tabs value={sectorFilter || "all"} onValueChange={(v) => {
          const p = new URLSearchParams(searchParams);
          if (v === "all") p.delete("sectorType"); else p.set("sectorType", v);
          setLocation(`/app/sites?${p.toString()}`);
        }}>
          <TabsList className="bg-card border">
            <TabsTrigger value="all" className="gap-1"><Globe className="h-3 w-3" />الكل</TabsTrigger>
            <TabsTrigger value="public" className="gap-1"><Landmark className="h-3 w-3" />عام</TabsTrigger>
            <TabsTrigger value="private" className="gap-1"><Building className="h-3 w-3" />خاص</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs value={complianceFilter || "all"} onValueChange={(v) => {
          const p = new URLSearchParams(searchParams);
          if (v === "all") p.delete("complianceStatus"); else p.set("complianceStatus", v);
          setLocation(`/app/sites?${p.toString()}`);
          setPage(1);
        }}>
          <TabsList className="bg-card border">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="compliant" className="text-emerald-500">ممتثل</TabsTrigger>
            <TabsTrigger value="partially_compliant" className="text-amber-500">جزئي</TabsTrigger>
            <TabsTrigger value="non_compliant" className="text-red-500">غير ممتثل</TabsTrigger>
            <TabsTrigger value="not_working" className="text-gray-500">لا يعمل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right w-8">#</TableHead>
              <TableHead className="text-right">اسم الموقع</TableHead>
              <TableHead className="text-right">النطاق</TableHead>
              <TableHead className="text-right">القطاع</TableHead>
              <TableHead className="text-right">الفئة</TableHead>
              <TableHead className="text-right">حالة الامتثال</TableHead>
              <TableHead className="text-right">سياسة الخصوصية</TableHead>
              <TableHead className="text-right">آخر فحص</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {siteList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  لا توجد مواقع مطابقة للبحث
                </TableCell>
              </TableRow>
            ) : (
              siteList.map((site: any, idx: number) => {
                const status = statusMap[site.complianceStatus] || statusMap["not_working"];
                return (
                  <TableRow
                    key={site.id}
                    className="cursor-pointer border-border/20 hover:bg-accent/50 transition-colors"
                    onClick={() => setLocation(`/app/sites/${site.id}`)}
                  >
                    <TableCell className="text-muted-foreground text-xs">{(page - 1) * limit + idx + 1}</TableCell>
                    <TableCell className="font-medium">{site.siteNameAr || site.siteNameEn || site.siteName || "—"}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        {site.domain || site.url || "—"}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {site.sectorType === "public" ? "عام" : site.sectorType === "private" ? "خاص" : site.sector || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{site.category || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={site.hasPrivacyPolicy || site.privacyPageUrl ? "default" : "destructive"} className="text-xs">
                        {site.hasPrivacyPolicy || site.privacyPageUrl ? "موجودة" : "غير موجودة"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {site.lastScanAt ? new Date(site.lastScanAt).toLocaleDateString("ar-SA") : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            عرض {(page - 1) * limit + 1} - {Math.min(page * limit, totalCount)} من {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              <ChevronRight className="h-4 w-4" />السابق
            </Button>
            <span className="text-sm px-2">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              التالي<ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
