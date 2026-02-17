import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Shield, Target, BarChart3, Layers, RefreshCw, Loader2,
  CheckCircle2, XCircle, AlertTriangle, Globe, Cpu, Search,
  FileText, Link2, Code, Eye, Bot
} from "lucide-react";

const strategyIcons: Record<string, any> = {
  direct_url: Link2,
  link_text_match: Search,
  footer_link: FileText,
  sitemap: Layers,
  robots_txt: Code,
  google_search: Globe,
  cms_specific: Cpu,
  common_paths: Target,
  puppeteer_dom: Bot,
  deep_crawl: Eye,
};

export default function StrategyCoverage() {

  const [rescanFilter, setRescanFilter] = useState<string>("all");
  const [rescanLimit, setRescanLimit] = useState<number>(100);

  const { data: coverage, isLoading } = trpc.strategyReport.coverage.useQuery();
  const { data: recentScans } = trpc.strategyReport.recentScans.useQuery({ limit: 50 });
  
  const massRescan = trpc.massRescan.start.useMutation({
    onSuccess: (data) => {
      toast.success(`تم بدء إعادة الفحص الجماعي - ${data.totalSites} موقع (مهمة: ${data.jobId})`);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleMassRescan = () => {
    massRescan.mutate({
      filter: rescanFilter as any,
      limit: rescanLimit,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalScans = coverage?.totalScans || 0;
  const withPrivacy = coverage?.totalWithPrivacy || 0;
  const withoutPrivacy = coverage?.totalWithoutPrivacy || 0;
  const discoveryRate = totalScans > 0 ? Math.round((withPrivacy / totalScans) * 100) : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-amber-500" />
            تقرير تغطية الاستراتيجيات
          </h1>
          <p className="text-muted-foreground mt-1">
            تحليل فعالية استراتيجيات اكتشاف صفحات الخصوصية (21 استراتيجية)
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card gold-sweep">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي عمليات الفحص</p>
                <p className="text-3xl font-bold mt-1">{totalScans.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card gold-sweep">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تم اكتشاف سياسة خصوصية</p>
                <p className="text-3xl font-bold mt-1 text-green-500">{withPrivacy.toLocaleString()}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card gold-sweep">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">بدون سياسة خصوصية</p>
                <p className="text-3xl font-bold mt-1 text-red-500">{withoutPrivacy.toLocaleString()}</p>
              </div>
              <XCircle className="h-10 w-10 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card gold-sweep">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">نسبة الاكتشاف</p>
                <p className="text-3xl font-bold mt-1 text-amber-500">{discoveryRate}%</p>
              </div>
              <Target className="h-10 w-10 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Strategy Coverage Table */}
      <Card className="glass-card gold-sweep">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-amber-500" />
            تفاصيل الاستراتيجيات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-right py-3 px-4 font-semibold">#</th>
                  <th className="text-right py-3 px-4 font-semibold">الاستراتيجية</th>
                  <th className="text-right py-3 px-4 font-semibold">الاسم التقني</th>
                  <th className="text-center py-3 px-4 font-semibold">عدد الاستخدامات</th>
                  <th className="text-center py-3 px-4 font-semibold">النسبة</th>
                  <th className="text-center py-3 px-4 font-semibold">ممتثل</th>
                  <th className="text-center py-3 px-4 font-semibold">جزئي</th>
                  <th className="text-center py-3 px-4 font-semibold">غير ممتثل</th>
                  <th className="text-center py-3 px-4 font-semibold">متوسط النتيجة</th>
                </tr>
              </thead>
              <tbody>
                {coverage?.strategies.map((strategy, index) => {
                  const Icon = strategyIcons[strategy.name] || Shield;
                  return (
                    <tr key={strategy.name} className="border-b border-border/20 hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200">
                      <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">{strategy.arabicName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-xs bg-muted/50 px-2 py-1 rounded">{strategy.name}</code>
                      </td>
                      <td className="text-center py-3 px-4 font-bold">{strategy.count.toLocaleString()}</td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-500 rounded-full transition-all"
                              style={{ width: `${Math.min(strategy.percentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{strategy.percentage}%</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                          {strategy.compliant}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                          {strategy.partial}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">
                          {strategy.nonCompliant}
                        </Badge>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className={`font-bold ${strategy.avgScore >= 60 ? 'text-green-500' : strategy.avgScore >= 30 ? 'text-amber-500' : 'text-red-500'}`}>
                          {strategy.avgScore}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {(!coverage?.strategies || coverage.strategies.length === 0) && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-muted-foreground">
                      <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      لا توجد بيانات استراتيجيات بعد. قم بإجراء عمليات فحص لتظهر البيانات.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CMS Coverage */}
      <Card className="glass-card gold-sweep">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-amber-500" />
            تغطية أنظمة إدارة المحتوى (CMS)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {coverage?.cmsCoverage.map((cms) => (
              <div key={cms.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
                <span className="text-sm font-medium truncate">{cms.name}</span>
                <Badge variant="secondary" className="mr-2 shrink-0">{cms.count.toLocaleString()}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mass Re-scan Section */}
      <Card className="glass-card gold-sweep border-amber-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-amber-500" />
            إعادة الفحص الجماعي
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            أعد فحص المواقع باستخدام المحرك المتقدم (v4.1) مع 21 استراتيجية اكتشاف + Puppeteer Headless Browser
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">فلتر المواقع</label>
              <Select value={rescanFilter} onValueChange={setRescanFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المواقع</SelectItem>
                  <SelectItem value="no_policy">بدون سياسة خصوصية</SelectItem>
                  <SelectItem value="non_compliant">غير ممتثل</SelectItem>
                  <SelectItem value="unreachable">غير قابل للوصول</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">عدد المواقع</label>
              <Select value={rescanLimit.toString()} onValueChange={(v) => setRescanLimit(parseInt(v))}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 موقع</SelectItem>
                  <SelectItem value="100">100 موقع</SelectItem>
                  <SelectItem value="500">500 موقع</SelectItem>
                  <SelectItem value="1000">1,000 موقع</SelectItem>
                  <SelectItem value="5000">5,000 موقع</SelectItem>
                  <SelectItem value="10000">10,000 موقع</SelectItem>
                  <SelectItem value="25000">25,000 موقع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleMassRescan}
              disabled={massRescan.isPending}
              className="gold-btn"
            >
              {massRescan.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري البدء...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 ml-2" />
                  بدء إعادة الفحص
                </>
              )}
            </Button>
          </div>
          {massRescan.data && (
            <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-green-500 font-medium">
                ✓ تم بدء إعادة الفحص الجماعي - رقم المهمة: {massRescan.data.jobId} ({massRescan.data.totalSites} موقع)
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                يمكنك متابعة التقدم من صفحة الفحص الدفعي
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans with Strategy */}
      <Card className="glass-card gold-sweep">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-amber-500" />
            آخر عمليات الفحص مع الاستراتيجية المستخدمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-right py-3 px-4 font-semibold">الموقع</th>
                  <th className="text-right py-3 px-4 font-semibold">الاستراتيجية</th>
                  <th className="text-center py-3 px-4 font-semibold">حالة الامتثال</th>
                  <th className="text-center py-3 px-4 font-semibold">النتيجة</th>
                  <th className="text-center py-3 px-4 font-semibold">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentScans?.slice(0, 20).map((scan) => (
                  <tr key={scan.id} className="border-b border-border/20 hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200">
                    <td className="py-3 px-4 font-medium">{scan.domain}</td>
                    <td className="py-3 px-4">
                      {scan.privacyDiscoveryMethod ? (
                        <code className="text-xs bg-amber-500/10 text-amber-500 px-2 py-1 rounded">
                          {scan.privacyDiscoveryMethod}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge
                        variant="outline"
                        className={
                          scan.complianceStatus === 'compliant' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                          scan.complianceStatus === 'partially_compliant' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' :
                          scan.complianceStatus === 'no_policy' ? 'bg-gray-500/10 text-gray-500 border-gray-500/30' :
                          'bg-red-500/10 text-red-500 border-red-500/30'
                        }
                      >
                        {scan.complianceStatus === 'compliant' ? 'ممتثل' :
                         scan.complianceStatus === 'partially_compliant' ? 'جزئي' :
                         scan.complianceStatus === 'no_policy' ? 'بدون سياسة' : 'غير ممتثل'}
                      </Badge>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-bold ${(scan.overallScore || 0) >= 60 ? 'text-green-500' : (scan.overallScore || 0) >= 30 ? 'text-amber-500' : 'text-red-500'}`}>
                        {scan.overallScore || 0}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-muted-foreground text-xs">
                      {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString('ar-SA-u-nu-latn') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
