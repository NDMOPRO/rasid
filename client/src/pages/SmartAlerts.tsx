import { useState } from "react";
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  BrainCircuit,
  AlertTriangle,
  AlertOctagon,
  Info,
  ShieldAlert,
  TrendingDown,
  CheckCircle2,
  Loader2,
  Zap,
  Eye,
  Sparkles,
  Activity,
  BarChart3,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const RISK_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; border: string }> = {
  critical: { label: "حرج", color: "text-red-600", bg: "bg-red-950/30", icon: AlertOctagon, border: "border-red-800" },
  high: { label: "مرتفع", color: "text-orange-600", bg: "bg-orange-950/30", icon: AlertTriangle, border: "border-orange-800" },
  medium: { label: "متوسط", color: "text-amber-600", bg: "bg-amber-950/30", icon: ShieldAlert, border: "border-amber-800" },
  low: { label: "منخفض", color: "text-blue-600", bg: "bg-blue-950/30", icon: Info, border: "border-blue-800" },
};

export default function SmartAlerts() {
  const { playClick, playHover } = useSoundEffects();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const [filter, setFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const utils = trpc.useUtils();
  const alerts = trpc.smartAlerts.list.useQuery(
    filter === "all" ? { isActive: true } : { riskLevel: filter, isActive: true }
  );
  const stats = trpc.smartAlerts.stats.useQuery();
  const acknowledge = trpc.smartAlerts.acknowledge.useMutation({
    onSuccess: () => {
      utils.smartAlerts.list.invalidate();
      utils.smartAlerts.stats.invalidate();
      setSelectedAlert(null);
      toast.success("تم تأكيد استلام التنبيه");
    },
    onError: (e) => toast.error(e.message),
  });
  const runAnalysis = trpc.smartAlerts.runAnalysis.useMutation({
    onSuccess: (data) => {
      utils.smartAlerts.list.invalidate();
      utils.smartAlerts.stats.invalidate();
      toast.success(`تم تحليل البيانات - ${data.alertsCreated} تنبيه جديد`);
    },
    onError: (e) => toast.error(e.message),
  });
  const runAiAnalysis = trpc.smartAlerts.runAiAnalysis.useMutation({
    onSuccess: (data) => {
      utils.smartAlerts.list.invalidate();
      utils.smartAlerts.stats.invalidate();
      if (data.success) toast.success(`تحليل الذكاء الاصطناعي - ${data.alertsCreated} تنبيه جديد`);
      else toast.error(data.message || "فشل التحليل");
    },
    onError: (e) => toast.error(e.message),
  });

  const alertList = alerts.data || [];
  const statsData = stats.data;

  return (
    <div className="overflow-x-hidden max-w-full p-6 space-y-6" dir="rtl">
      <WatermarkLogo />
      {/* Header */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 gradient-text">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.48_0.14_290)] to-primary flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-white" />
              </div>
              التنبيهات الذكية
            </h1>
            <p className="text-muted-foreground mt-1">تحليل استباقي للجهات المعرضة لانخفاض الامتثال باستخدام الذكاء الاصطناعي</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => runAnalysis.mutate()}
              disabled={runAnalysis.isPending}
              className="gap-2"
            >
              {runAnalysis.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
              تحليل البيانات
            </Button>
            <Button
              onClick={() => runAiAnalysis.mutate()}
              disabled={runAiAnalysis.isPending}
              className="gap-2 bg-gradient-to-r from-[oklch(0.48_0.14_290)] to-primary hover:from-primary/90 hover:to-primary"
            >
              {runAiAnalysis.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              تحليل بالذكاء الاصطناعي
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {statsData && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-children">
            {[
              { label: "إجمالي التنبيهات", value: statsData.total, icon: BrainCircuit, color: "text-primary", bg: "bg-primary/15" },
              { label: "حرج", value: statsData.critical, icon: AlertOctagon, color: "text-red-600", bg: "bg-red-950/30" },
              { label: "مرتفع", value: statsData.high, icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-950/30" },
              { label: "متوسط", value: statsData.medium, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-950/30" },
              { label: "منخفض", value: statsData.low, icon: Info, color: "text-blue-600", bg: "bg-blue-950/30" },
            ].map((item, idx) => (
              <div key={item.label}>
                <Card className={`${item.bg} border-none cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => setFilter(idx === 0 ? "all" : ["all", "critical", "high", "medium", "low"][idx])}>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <item.icon className={`w-8 h-8 ${item.color}`} />
                      <div>
                        <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                        <div className="text-xs text-muted-foreground">{item.label}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "الكل" },
            { value: "critical", label: "حرج" },
            { value: "high", label: "مرتفع" },
            { value: "medium", label: "متوسط" },
            { value: "low", label: "منخفض" },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
              className="gap-1"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        
          {alertList.map((alert: any, idx: number) => {
            const risk = RISK_CONFIG[alert.riskLevel] || RISK_CONFIG.medium;
            const RiskIcon = risk.icon;
            const factors = (() => { try { return JSON.parse(alert.factors || "[]"); } catch { return []; } })();
            const recommendations = (() => { try { return JSON.parse(alert.recommendations || "[]"); } catch { return []; } })();

            return (
              <div
                key={alert.id}
              >
                <Card className={`${risk.bg} border ${risk.border} hover:shadow-lg transition-shadow cursor-pointer`}
                  onClick={() => { setSelectedAlert(alert); openDrillDown({ title: alert.title, subtitle: alert.entityName || '', alertType: alert.alertType, priority: alert.severity || '' }); }}>
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${risk.bg}`}>
                        <RiskIcon className={`w-6 h-6 ${risk.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`${risk.color} ${risk.bg} border ${risk.border}`}>
                            {risk.label} - {alert.riskScore?.toFixed(0)}%
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            موقع #{alert.siteId}
                          </span>
                        </div>
                        <p className="text-sm font-medium mb-2">{alert.predictedChange}</p>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {factors.slice(0, 3).map((f: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {f.description}
                            </Badge>
                          ))}
                          {factors.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{factors.length - 3} عوامل أخرى</Badge>
                          )}
                        </div>
                        {recommendations.length > 0 && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {recommendations.length} توصيات متاحة
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Button variant="outline" size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); setSelectedAlert(alert); }}>
                          <Eye className="w-3 h-3" />
                          التفاصيل
                        </Button>
                        <span className="text-xs sm:text-[10px] text-muted-foreground">
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString("ar-SA-u-nu-latn") : ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        

        {alertList.length === 0 && !alerts.isLoading && (
          <Card className="text-center py-12 cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all glass-card gold-sweep">
            <CardContent>
              <BrainCircuit className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد تنبيهات ذكية</h3>
              <p className="text-muted-foreground mb-4">قم بتشغيل التحليل لاكتشاف الجهات المعرضة لخطر انخفاض الامتثال</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => runAnalysis.mutate()} disabled={runAnalysis.isPending} className="gap-2">
                  <Activity className="w-4 h-4" />
                  تحليل البيانات
                </Button>
                <Button onClick={() => runAiAnalysis.mutate()} disabled={runAiAnalysis.isPending} className="gap-2">
                  <Sparkles className="w-4 h-4" />
                  تحليل بالذكاء الاصطناعي
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {alerts.isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => { if (!open) setSelectedAlert(null); }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" dir="rtl">
          {selectedAlert && (() => {
            const risk = RISK_CONFIG[selectedAlert.riskLevel] || RISK_CONFIG.medium;
            const RiskIcon = risk.icon;
            const factors = (() => { try { return JSON.parse(selectedAlert.factors || "[]"); } catch { return []; } })();
            const recommendations = (() => { try { return JSON.parse(selectedAlert.recommendations || "[]"); } catch { return []; } })();
            const analysisData = (() => { try { return JSON.parse(selectedAlert.analysisData || "{}"); } catch { return {}; } })();

            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <RiskIcon className={`w-6 h-6 ${risk.color}`} />
                    تفاصيل التنبيه الذكي
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                  {/* Risk Summary */}
                  <div className={`p-4 rounded-xl ${risk.bg} border ${risk.border}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${risk.color} ${risk.bg} border ${risk.border} text-sm`}>
                        مستوى الخطر: {risk.label}
                      </Badge>
                      <Badge variant="outline">درجة الخطر: {selectedAlert.riskScore?.toFixed(0)}%</Badge>
                      <Badge variant="outline">موقع #{selectedAlert.siteId}</Badge>
                    </div>
                    <p className="text-sm font-medium">{selectedAlert.predictedChange}</p>
                  </div>

                  {/* Factors */}
                  {factors.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4 text-red-500" />
                        العوامل المؤثرة
                      </h4>
                      <div className="space-y-2">
                        {factors.map((f: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-bold text-red-600">{Math.round(f.weight * 100)}%</span>
                            </div>
                            <div>
                              <div className="text-sm font-medium">{f.description}</div>
                              <div className="text-xs text-muted-foreground">{f.factor}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        التوصيات
                      </h4>
                      <div className="space-y-2">
                        {recommendations.map((rec: string, i: number) => (
                          <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-emerald-950/20">
                            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="text-sm">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Analysis Data */}
                  {analysisData && Object.keys(analysisData).length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-500" />
                        بيانات التحليل
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 stagger-children">
                        {analysisData.latestScore !== undefined && (
                          <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <div className="text-lg font-bold text-primary">{analysisData.latestScore?.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">آخر نسبة</div>
                          </div>
                        )}
                        {analysisData.avgScore !== undefined && (
                          <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <div className="text-lg font-bold text-primary">{analysisData.avgScore?.toFixed(1)}%</div>
                            <div className="text-xs text-muted-foreground">المتوسط</div>
                          </div>
                        )}
                        {analysisData.trend !== undefined && (
                          <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <div className={`text-lg font-bold ${analysisData.trend >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                              {analysisData.trend >= 0 ? "+" : ""}{analysisData.trend?.toFixed(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">الاتجاه</div>
                          </div>
                        )}
                        {analysisData.missingClauses !== undefined && (
                          <div className="p-3 rounded-lg bg-muted/50 text-center">
                            <div className="text-lg font-bold text-amber-600">{analysisData.missingClauses}/8</div>
                            <div className="text-xs text-muted-foreground">بنود مفقودة</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => acknowledge.mutate({ id: selectedAlert.id })}
                      disabled={acknowledge.isPending}
                      className="gap-2 flex-1"
                    >
                      {acknowledge.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      تأكيد الاستلام وإغلاق التنبيه
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                      إغلاق
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
