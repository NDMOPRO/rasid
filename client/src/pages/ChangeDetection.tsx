import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, GitCompare, TrendingUp, TrendingDown, AlertTriangle, FileText, ArrowUpRight, ArrowDownRight, Minus, Plus, X } from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const changeTypeLabels: Record<string, { label: string; color: string; icon: any }> = {
  added: { label: "تمت إضافة سياسة", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: Plus },
  removed: { label: "تمت إزالة سياسة", color: "text-red-400 bg-red-500/10 border-red-500/30", icon: X },
  modified: { label: "تعديل", color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: GitCompare },
  no_change: { label: "لا تغيير", color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/30", icon: Minus },
};

export default function ChangeDetection() {
  const { playClick, playHover } = useSoundEffects();
  const [significantOnly, setSignificantOnly] = useState(false);
  const { data: stats, isLoading: statsLoading } = trpc.changeDetection.stats.useQuery();
  const { data: logs, isLoading: logsLoading } = trpc.changeDetection.logs.useQuery({
    significantOnly,
    limit: 50,
  });

  const isLoading = statsLoading || logsLoading;

  if (isLoading) {
    return (
    <div className="overflow-x-hidden max-w-full flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
          <GitCompare className="w-7 h-7 text-blue-400" />
          كشف التغييرات
        </h1>
        <p className="text-muted-foreground mt-1">مراقبة التغييرات في سياسات الخصوصية بين الفحوصات المتتالية</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold">{stats?.total || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">إجمالي التغييرات</p>
          </CardContent>
        </Card>
        <Card className="border-amber-500/20 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-amber-400">{stats?.significant || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">تغييرات جوهرية</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/20 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-emerald-400">{stats?.policyAdded || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">سياسات مضافة</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 glass-card gold-sweep">
          <CardContent className="py-4 text-center">
            <p className="text-3xl font-bold text-red-400">{stats?.policyRemoved || 0}</p>
            <p className="text-sm text-muted-foreground mt-1">سياسات محذوفة</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Switch checked={significantOnly} onCheckedChange={setSignificantOnly} />
        <Label>عرض التغييرات الجوهرية فقط</Label>
      </div>

      {/* Logs */}
      <div className="space-y-3">
        {(!logs || logs.length === 0) ? (
          <Card className="glass-card gold-sweep">
            <CardContent className="py-12 text-center text-muted-foreground">
              <GitCompare className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-lg">لا توجد تغييرات مسجلة بعد</p>
              <p className="text-sm mt-1">سيتم تسجيل التغييرات تلقائياً عند إعادة فحص المواقع</p>
            </CardContent>
          </Card>
        ) : (
          logs.map((log: any) => {
            const ct = changeTypeLabels[log.changeType] || changeTypeLabels.no_change;
            const Icon = ct.icon;
            const scoreDelta = log.scoreDelta || 0;
            return (
              <Card key={log.id} className={`transition-all hover:shadow-md ${log.significantChange ? 'border-amber-500/30' : ''}`}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${ct.color}`}>
                        <Icon className="w-5 h-5 transition-transform duration-300 hover:scale-110" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={ct.color}>{ct.label}</Badge>
                          {log.significantChange && (
                            <Badge variant="outline" className="text-amber-400 bg-amber-500/10 border-amber-500/30">
                              <AlertTriangle className="w-3 h-3 ms-1" />
                              جوهري
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{log.textDiffSummary}</p>
                        {log.clauseChanges && Array.isArray(log.clauseChanges) && log.clauseChanges.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {log.clauseChanges.map((c: any, i: number) => (
                              <Badge key={i} variant="outline" className={c.to ? "text-emerald-400 border-emerald-500/30" : "text-red-400 border-red-500/30"}>
                                البند {c.clause}: {c.from ? "✅" : "❌"} → {c.to ? "✅" : "❌"}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-start shrink-0">
                      <div className="flex items-center gap-1">
                        {scoreDelta > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        ) : scoreDelta < 0 ? (
                          <ArrowDownRight className="w-4 h-4 text-red-400" />
                        ) : null}
                        <span className={`text-lg font-bold ${scoreDelta > 0 ? 'text-emerald-400' : scoreDelta < 0 ? 'text-red-400' : ''}`}>
                          {scoreDelta > 0 ? '+' : ''}{scoreDelta.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground" dir="ltr">
                        {(log.previousScore || 0).toFixed(1)}% → {(log.newScore || 0).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.detectedAt).toLocaleDateString('ar-SA-u-nu-latn')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
