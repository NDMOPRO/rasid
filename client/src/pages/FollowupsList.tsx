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
  open: { label: "مفتوحة", variant: "outline" },
  in_progress: { label: "قيد التنفيذ", variant: "secondary" },
  pending_approval: { label: "بانتظار الاعتماد", variant: "destructive" },
  completed: { label: "مكتملة", variant: "default" },
  closed: { label: "مغلقة", variant: "default" },
};

export default function FollowupsList() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  const params = useMemo(() => new URLSearchParams(searchParams), [searchParams]);
  const statusFilter = params.get("status") || undefined;
  const [search, setSearch] = useState("");

  const { data: followups, isLoading } = trpc.followups.list.useQuery({
    status: statusFilter,
    limit: 100,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">المتابعات</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">المتابعات</h1>
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
            placeholder="بحث في المتابعات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        {statusFilter && (
          <Button variant="outline" onClick={() => setLocation("/app/followups")}>
            إزالة التصفية
          </Button>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right">العنوان</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">الأولوية</TableHead>
              <TableHead className="text-right">تاريخ الاستحقاق</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!followups || followups.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  لا توجد متابعات مطابقة
                </TableCell>
              </TableRow>
            ) : (
              followups.map((f: any) => (
                <TableRow
                  key={f.id}
                  className="cursor-pointer border-border/20 hover:bg-accent/50"
                >
                  <TableCell className="font-medium">{f.title || "—"}</TableCell>
                  <TableCell>{f.entityType || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusMap[f.status]?.variant || "outline"}>
                      {statusMap[f.status]?.label || f.status || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={f.priority === "critical" ? "destructive" : f.priority === "high" ? "destructive" : "secondary"}>
                      {f.priority || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {f.dueDate ? new Date(f.dueDate).toLocaleDateString("ar-SA") : "—"}
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
