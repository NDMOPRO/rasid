import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useSearch } from "wouter";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  investigating: { label: "قيد التحقق", variant: "secondary" },
  confirmed: { label: "مؤكدة", variant: "destructive" },
  contained: { label: "محتواة", variant: "outline" },
  resolved: { label: "تم الحل", variant: "default" },
  closed: { label: "مغلقة", variant: "default" },
};

export default function IncidentsList() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const statusFilter = params.get("status") || undefined;
  const [search, setSearch] = useState("");

  const { data: incidents, isLoading } = trpc.incidents.list.useQuery({
    status: statusFilter,
    search: search || undefined,
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <h1 className="text-2xl font-bold">الوقائع</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">الوقائع</h1>
        {statusFilter && (
          <Badge variant="outline" className="text-gold border-gold/30">
            تصفية: {statusMap[statusFilter]?.label || statusFilter}
          </Badge>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الوقائع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        {statusFilter && (
          <Button variant="outline" onClick={() => setLocation("/app/incidents/list")}>
            إزالة التصفية
          </Button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right">عنوان الواقعة</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الحساسية</TableHead>
              <TableHead className="text-right">تقدير الحجم</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!incidents || incidents.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  لا توجد وقائع مطابقة
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((inc: any) => (
                <TableRow
                  key={inc.id}
                  className="cursor-pointer border-border/20 hover:bg-accent/50"
                  onClick={() => setLocation(`/app/incidents/${inc.id}`)}
                >
                  <TableCell className="font-medium">{inc.title || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[inc.status]?.variant || "outline"}>
                      {statusMap[inc.status]?.label || inc.status || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>{inc.sensitivityLevel || "—"}</TableCell>
                  <TableCell>{inc.estimatedRecords?.toLocaleString("ar-SA") || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {inc.discoveredAt ? new Date(inc.discoveredAt).toLocaleDateString("ar-SA") : "—"}
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
