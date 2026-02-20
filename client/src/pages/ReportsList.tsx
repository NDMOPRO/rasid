import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReportsList() {
  const { data: reports, isLoading } = trpc.reports.list.useQuery({ limit: 100 });

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <h1 className="text-2xl font-bold">التقارير</h1>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap">
        <h1 className="text-2xl font-bold">التقارير</h1>
        <Button onClick={() => toast.info("ميزة إنشاء التقارير قيد التطوير")} className="bg-gold text-gold-foreground hover:bg-gold/90">
          <FileText className="ml-2 h-4 w-4" />
          تقرير جديد
        </Button>
      </div>

      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/30 hover:bg-transparent">
              <TableHead className="text-right">عنوان التقرير</TableHead>
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!reports || reports.length === 0) ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  لا توجد تقارير
                </TableCell>
              </TableRow>
            ) : (
              reports.map((r: any) => (
                <TableRow key={r.id} className="border-border/20">
                  <TableCell className="font-medium">{r.title || "—"}</TableCell>
                  <TableCell>{r.type || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.status === "published" ? "default" : "secondary"}>
                      {r.status || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-SA") : "—"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => toast.info("ميزة التحميل قيد التطوير")}>
                      <Download className="h-4 w-4" />
                    </Button>
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
