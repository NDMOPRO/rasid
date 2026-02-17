import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useSearch } from "wouter";
import { useState, useMemo } from "react";
import { Search, ExternalLink, Filter } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  compliant: { label: "ممتثل", variant: "default" },
  partial: { label: "جزئي", variant: "secondary" },
  non_compliant: { label: "غير ممتثل", variant: "destructive" },
  not_working: { label: "لا يعمل", variant: "outline" },
};

export default function PrivacySites() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const statusFilter = params.get("status") || undefined;
  const [search, setSearch] = useState("");

  const { data: sites, isLoading } = trpc.privacy.sites.useQuery({
    status: statusFilter,
    search: search || undefined,
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">المواقع</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">المواقع</h1>
        {statusFilter && (
          <Badge variant="outline" className="text-gold border-gold/30">
            تصفية: {statusMap[statusFilter]?.label || statusFilter}
          </Badge>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في المواقع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        {statusFilter && (
          <Button variant="outline" onClick={() => setLocation("/app/privacy/sites")}>
            إزالة التصفية
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right">اسم الموقع</TableHead>
              <TableHead className="text-right">الرابط</TableHead>
              <TableHead className="text-right">القطاع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">سياسة الخصوصية</TableHead>
              <TableHead className="text-right">آخر فحص</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!sites || sites.length === 0) ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  لا توجد مواقع مطابقة
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site: any) => (
                <TableRow
                  key={site.id}
                  className="cursor-pointer border-border/20 hover:bg-accent/50"
                  onClick={() => setLocation(`/app/privacy/sites/${site.id}`)}
                >
                  <TableCell className="font-medium">{site.siteNameAr || site.siteNameEn || "—"}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      {site.url}
                      <ExternalLink className="h-3 w-3" />
                    </span>
                  </TableCell>
                  <TableCell>{site.sector || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[site.complianceStatus]?.variant || "outline"}>
                      {statusMap[site.complianceStatus]?.label || site.complianceStatus || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.hasPrivacyPolicy ? "default" : "destructive"}>
                      {site.hasPrivacyPolicy ? "موجودة" : "غير موجودة"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {site.lastScanAt ? new Date(site.lastScanAt).toLocaleDateString("ar-SA") : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
