import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation, useSearch } from "wouter";
import { useState, useMemo } from "react";
import { Search, ExternalLink, Globe, ChevronLeft, ChevronRight, Filter, ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: any }> = {
  compliant: { label: "متوافق", variant: "default", icon: ShieldCheck },
  partially_compliant: { label: "متوافق جزئياً", variant: "secondary", icon: ShieldAlert },
  non_compliant: { label: "غير متوافق", variant: "destructive", icon: ShieldX },
  no_policy: { label: "بدون سياسة", variant: "outline", icon: ShieldOff },
};

export default function PrivacySites() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const complianceFilter = params.get("complianceStatus") || undefined;
  const categoryFilter = params.get("category") || undefined;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  // Pull from privacyDomains (the new 24,983 domains table)
  const { data, isLoading } = trpc.privacyDomains.list.useQuery({
    complianceStatus: complianceFilter,
    search: search || undefined,
    category: categoryFilter,
    page,
    limit,
  });

  const siteList = useMemo(() => {
    if (!data) return [];
    return Array.isArray(data) ? data : Array.isArray((data as any)?.domains) ? (data as any).domains : [];
  }, [data]);

  const totalCount = (data as any)?.total || siteList.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  const activeFilters: string[] = [];
  if (complianceFilter) activeFilters.push(statusMap[complianceFilter]?.label || complianceFilter);
  if (categoryFilter) activeFilters.push(categoryFilter);

  const clearFilters = () => {
    setLocation("/app/privacy/sites");
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6 p-2 md:p-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="h-6 w-6 text-primary" />المواقع السعودية</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 md:p-6 overflow-x-hidden">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Globe className="h-6 w-6 text-primary" />
          المواقع السعودية
          <Badge variant="outline" className="text-sm font-normal">{totalCount.toLocaleString("ar-SA")} موقع</Badge>
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

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالنطاق أو الاسم..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pr-10"
          />
        </div>
        <Tabs value={complianceFilter || "all"} onValueChange={(v) => {
          const p = new URLSearchParams(searchParams);
          if (v === "all") p.delete("complianceStatus"); else p.set("complianceStatus", v);
          setLocation(`/app/privacy/sites?${p.toString()}`);
          setPage(1);
        }}>
          <TabsList className="bg-card border">
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="compliant" className="text-emerald-500">متوافق</TabsTrigger>
            <TabsTrigger value="partially_compliant" className="text-amber-500">جزئي</TabsTrigger>
            <TabsTrigger value="non_compliant" className="text-red-500">غير متوافق</TabsTrigger>
            <TabsTrigger value="no_policy" className="text-gray-500">بدون سياسة</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right w-8">#</TableHead>
              <TableHead className="text-right">النطاق</TableHead>
              <TableHead className="text-right">اسم الموقع</TableHead>
              <TableHead className="text-right">التصنيف</TableHead>
              <TableHead className="text-right">CMS</TableHead>
              <TableHead className="text-right">SSL</TableHead>
              <TableHead className="text-right">حالة الامتثال</TableHead>
              <TableHead className="text-right">النتيجة</TableHead>
              <TableHead className="text-right">سياسة الخصوصية</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {siteList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                  لا توجد مواقع مطابقة للبحث
                </TableCell>
              </TableRow>
            ) : (
              siteList.map((site: any, idx: number) => {
                const status = statusMap[site.complianceStatus] || statusMap["no_policy"];
                const StatusIcon = status.icon;
                const score = site.complianceScore || 0;
                return (
                  <TableRow
                    key={site.id}
                    className="cursor-pointer border-border/20 hover:bg-accent/50 transition-colors"
                    onClick={() => setLocation(`/app/privacy/sites/${site.id}`)}
                  >
                    <TableCell className="text-muted-foreground text-xs">{(page - 1) * limit + idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-sm">{site.domain}</span>
                        {site.workingUrl && (
                          <a href={site.workingUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-primary" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {site.nameAr || site.nameEn || site.title || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{site.category || "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{site.cms || "—"}</TableCell>
                    <TableCell>
                      {site.sslStatus === "صالح" ? (
                        <Badge variant="default" className="text-xs bg-emerald-600">صالح</Badge>
                      ) : site.sslStatus === "غير متاح" ? (
                        <Badge variant="outline" className="text-xs">غير متاح</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">{site.sslStatus || "—"}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : score > 0 ? 'bg-red-500' : 'bg-gray-400'}`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono">{score}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {site.policyUrl && site.policyUrl !== "لم يتم العثور" ? (
                        <Badge variant="default" className="text-xs bg-emerald-600">موجودة</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">غير موجودة</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between flex-wrap">
          <p className="text-sm text-muted-foreground">
            عرض {((page - 1) * limit + 1).toLocaleString("ar-SA")} - {Math.min(page * limit, totalCount).toLocaleString("ar-SA")} من {totalCount.toLocaleString("ar-SA")}
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
