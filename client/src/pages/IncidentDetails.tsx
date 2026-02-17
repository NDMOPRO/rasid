import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useParams } from "wouter";
import { ArrowRight, AlertTriangle } from "lucide-react";

export default function IncidentDetails() {
  const params = useParams<{ incidentId: string }>();
  const incidentId = parseInt(params.incidentId || "0");
  const [, setLocation] = useLocation();

  const { data: incident, isLoading } = trpc.incidents.byId.useQuery({ id: incidentId });
  const { data: datasets } = trpc.incidents.datasets.useQuery({ incidentId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">الواقعة غير موجودة</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/incidents/list")}>
          العودة للوقائع
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/app/incidents/list")}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{incident.title || "واقعة"}</h1>
          <p className="text-sm text-muted-foreground">{incident.referenceNumber || ""}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 gold-edge">
          <p className="text-sm text-muted-foreground mb-1">الحالة</p>
          <Badge variant={incident.status === "confirmed" ? "destructive" : incident.status === "closed" ? "default" : "secondary"}>
            {incident.status || "—"}
          </Badge>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">الحساسية</p>
          <p className="font-medium">{incident.sensitivityLevel || "—"}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">تقدير الحجم</p>
          <p className="font-medium">{incident.estimatedRecords?.toLocaleString("ar-SA") || "—"}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">تاريخ الاكتشاف</p>
          <p className="font-medium">{incident.discoveredAt ? new Date(incident.discoveredAt).toLocaleDateString("ar-SA") : "—"}</p>
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="summary">ملخص</TabsTrigger>
          <TabsTrigger value="datasets">فئات البيانات</TabsTrigger>
          <TabsTrigger value="impact">الأثر</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <div className="glass-card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">الجهة المتأثرة</p>
                <p className="font-medium">{incident.entityNameAr || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">القطاع</p>
                <p className="font-medium">{incident.sector || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مستوى الأثر</p>
                <p className="font-medium">{incident.impactLevel || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">المصدر</p>
                <p className="font-medium">{incident.source || "—"}</p>
              </div>
            </div>
            {incident.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">الوصف</p>
                <p className="text-sm">{incident.description}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="datasets" className="mt-4">
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-right">فئة البيانات</TableHead>
                  <TableHead className="text-right">العدد التقديري</TableHead>
                  <TableHead className="text-right">الحساسية</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!datasets || datasets.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      لا توجد فئات بيانات
                    </TableCell>
                  </TableRow>
                ) : (
                  datasets.map((ds: any) => (
                    <TableRow key={ds.id} className="border-border/20">
                      <TableCell className="font-medium">{ds.categoryNameAr || ds.categoryNameEn || "—"}</TableCell>
                      <TableCell>{ds.estimatedCount?.toLocaleString("ar-SA") || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={ds.sensitivityLevel === "high" ? "destructive" : "secondary"}>
                          {ds.sensitivityLevel || "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="impact" className="mt-4">
          <div className="glass-card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">مستوى الأثر</p>
                <p className="font-medium text-lg">{incident.impactLevel || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي السجلات المتأثرة</p>
                <p className="font-medium text-lg">{incident.estimatedRecords?.toLocaleString("ar-SA") || "—"}</p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
