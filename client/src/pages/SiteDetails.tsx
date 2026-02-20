import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useParams } from "wouter";
import { ArrowRight, ExternalLink, Shield, Clock, FileText } from "lucide-react";

export default function SiteDetails() {
  const params = useParams<{ siteId: string }>();
  const siteId = parseInt(params.siteId || "0");
  const [, setLocation] = useLocation();

  const { data: site, isLoading } = trpc.privacy.siteById.useQuery({ id: siteId });
  const { data: requirements } = trpc.privacy.siteRequirements.useQuery({ siteId });
  const { data: scans } = trpc.privacy.siteScans.useQuery({ siteId });
  const { data: versions } = trpc.privacy.policyVersions.useQuery({ siteId });

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">الموقع غير موجود</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/privacy/sites")}>
          العودة للمواقع
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/app/privacy/sites")}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{site.siteNameAr || site.siteNameEn || site.url}</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            {site.url}
            <ExternalLink className="h-3 w-3" />
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 gold-edge">
          <p className="text-sm text-muted-foreground mb-1">حالة الامتثال</p>
          <Badge variant={site.complianceStatus === "compliant" ? "default" : "destructive"}>
            {site.complianceStatus || "غير محدد"}
          </Badge>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">سياسة الخصوصية</p>
          <Badge variant={site.hasPrivacyPolicy ? "default" : "destructive"}>
            {site.hasPrivacyPolicy ? "موجودة" : "غير موجودة"}
          </Badge>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-muted-foreground mb-1">القطاع</p>
          <p className="font-medium">{site.sector || "غير محدد"}</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="summary">ملخص</TabsTrigger>
          <TabsTrigger value="requirements">المتطلبات</TabsTrigger>
          <TabsTrigger value="versions">النسخ</TabsTrigger>
          <TabsTrigger value="scans">سجل الفحص</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <div className="glass-card p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">نوع الجهة</p>
                <p className="font-medium">{site.entityType || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">اسم الجهة</p>
                <p className="font-medium">{site.entityNameAr || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">درجة الامتثال</p>
                <p className="font-medium">{site.complianceScore != null ? `${site.complianceScore}%` : "—"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">آخر فحص</p>
                <p className="font-medium">{site.lastScanAt ? new Date(site.lastScanAt).toLocaleDateString("ar-SA") : "—"}</p>
              </div>
            </div>
            {site.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">ملاحظات</p>
                <p className="text-sm">{site.notes}</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="mt-4">
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-right">رقم البند</TableHead>
                  <TableHead className="text-right">البند</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!requirements || requirements.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      لا توجد متطلبات
                    </TableCell>
                  </TableRow>
                ) : (
                  requirements.map((req: any) => (
                    <TableRow key={req.id} className="border-border/20">
                      <TableCell>{req.clauseNumber}</TableCell>
                      <TableCell>{req.description || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={req.status === "met" ? "default" : req.status === "partial" ? "secondary" : "destructive"}>
                          {req.status === "met" ? "مستوفى" : req.status === "partial" ? "جزئي" : "غير مستوفى"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-right">النسخة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">نوع التغيير</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!versions || versions.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      لا توجد نسخ
                    </TableCell>
                  </TableRow>
                ) : (
                  versions.map((v: any) => (
                    <TableRow key={v.id} className="border-border/20">
                      <TableCell>{v.version}</TableCell>
                      <TableCell>{v.capturedAt ? new Date(v.capturedAt).toLocaleDateString("ar-SA") : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={v.changeType === "major" ? "destructive" : "secondary"}>
                          {v.changeType === "major" ? "جوهري" : v.changeType === "minor" ? "طفيف" : v.changeType || "—"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="scans" className="mt-4">
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">النتيجة</TableHead>
                  <TableHead className="text-right">الدرجة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(!scans || scans.length === 0) ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                      لا يوجد سجل فحص
                    </TableCell>
                  </TableRow>
                ) : (
                  scans.map((scan: any) => (
                    <TableRow key={scan.id} className="border-border/20">
                      <TableCell>{scan.createdAt ? new Date(scan.createdAt).toLocaleDateString("ar-SA") : "—"}</TableCell>
                      <TableCell>
                        <Badge variant={scan.result === "pass" ? "default" : "destructive"}>
                          {scan.result || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>{scan.score != null ? `${scan.score}%` : "—"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
