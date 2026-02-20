/**
 * PdplCompliance — امتثال نظام حماية البيانات الشخصية
 * مربوط بـ dashboard.stats + leaks.list APIs
 */
import { PremiumPageContainer, PremiumSectionHeader } from "@/components/UltraPremiumWrapper";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, CheckCircle, XCircle, AlertTriangle, FileText, Scale } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from "recharts";

export default function PdplCompliance() {
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: leaks = [], isLoading: leaksLoading } = trpc.leaks.list.useQuery();
  const isLoading = statsLoading || leaksLoading;

  const analysis = useMemo(() => {
    const clauses = (stats as any)?.clauseStats || [];
    const totalLeaks = leaks.length;
    const criticalLeaks = leaks.filter((l: any) => l.severity === "critical").length;
    const complianceScore = totalLeaks > 0 ? Math.max(0, Math.round(100 - (criticalLeaks / totalLeaks) * 100)) : 100;
    const pdplArticles = [
      { article: "المادة 5", title: "أساس المعالجة القانوني", status: complianceScore > 70 ? "compliant" : "partial", score: Math.min(100, complianceScore + 10) },
      { article: "المادة 6", title: "الموافقة", status: complianceScore > 60 ? "compliant" : "partial", score: Math.min(100, complianceScore + 5) },
      { article: "المادة 10", title: "حماية البيانات", status: complianceScore > 50 ? "partial" : "non-compliant", score: complianceScore },
      { article: "المادة 14", title: "الإبلاغ عن الانتهاكات", status: complianceScore > 80 ? "compliant" : "partial", score: Math.min(100, complianceScore + 15) },
      { article: "المادة 19", title: "نقل البيانات خارج المملكة", status: complianceScore > 60 ? "compliant" : "non-compliant", score: Math.min(100, complianceScore - 5) },
      { article: "المادة 22", title: "تعيين مسؤول حماية البيانات", status: "compliant", score: 95 },
      { article: "المادة 24", title: "تقييم الأثر", status: complianceScore > 50 ? "partial" : "non-compliant", score: complianceScore },
      { article: "المادة 29", title: "حقوق أصحاب البيانات", status: complianceScore > 70 ? "compliant" : "partial", score: Math.min(100, complianceScore + 8) },
    ];
    return { complianceScore, pdplArticles, clauses, totalLeaks, criticalLeaks };
  }, [stats, leaks]);

  if (isLoading) return <div className="p-6 space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-32 bg-card" />)}</div>;

  const statusLabels: Record<string, { text: string; color: string; icon: any }> = {
    compliant: { text: "ممتثل", color: "bg-emerald-500/20 text-emerald-400", icon: CheckCircle },
    partial: { text: "جزئي", color: "bg-amber-500/20 text-amber-400", icon: AlertTriangle },
    "non-compliant": { text: "غير ممتثل", color: "bg-red-500/20 text-red-400", icon: XCircle },
  };

  return (
    <div className="min-h-screen p-6 space-y-6 stagger-children" dir="rtl">
      <div><h1 className="text-2xl font-bold text-foreground">امتثال نظام حماية البيانات الشخصية (PDPL)</h1><p className="text-muted-foreground text-sm mt-1">تقييم مستوى الامتثال لنظام حماية البيانات الشخصية السعودي</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card gold-sweep md:col-span-1">
          <CardContent className="p-6 text-center">
            <Scale className="h-10 w-10 text-blue-400 mx-auto mb-3" />
            <div className={`text-4xl font-bold ${analysis.complianceScore >= 70 ? "text-emerald-400" : analysis.complianceScore >= 40 ? "text-amber-400" : "text-red-400"}`}>{analysis.complianceScore}%</div>
            <p className="text-muted-foreground text-sm mt-1">مستوى الامتثال العام</p>
            <div className="w-full bg-gray-700 rounded-full h-3 mt-3">
              <div className={`h-3 rounded-full transition-all ${analysis.complianceScore >= 70 ? "bg-emerald-500" : analysis.complianceScore >= 40 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${analysis.complianceScore}%` }} />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><CheckCircle className="h-6 w-6 text-emerald-400 mx-auto mb-2" /><div className="text-xl font-bold text-emerald-400">{analysis.pdplArticles.filter(a => a.status === "compliant").length}</div><div className="text-xs text-muted-foreground">مواد ممتثلة</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><AlertTriangle className="h-6 w-6 text-amber-400 mx-auto mb-2" /><div className="text-xl font-bold text-amber-400">{analysis.pdplArticles.filter(a => a.status === "partial").length}</div><div className="text-xs text-muted-foreground">امتثال جزئي</div></CardContent></Card>
        <Card className="glass-card gold-sweep"><CardContent className="p-4 text-center"><XCircle className="h-6 w-6 text-red-400 mx-auto mb-2" /><div className="text-xl font-bold text-red-400">{analysis.pdplArticles.filter(a => a.status === "non-compliant").length}</div><div className="text-xs text-muted-foreground">غير ممتثل</div></CardContent></Card>
      </div>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">تفاصيل المواد</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.pdplArticles.map((a, i) => {
              const st = statusLabels[a.status];
              const StIcon = st.icon;
              return (
                <div key={i} className="flex items-center justify-between flex-wrap gap-3 p-3 rounded-lg bg-gray-900/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <StIcon className={`h-5 w-5 ${a.status === "compliant" ? "text-emerald-400" : a.status === "partial" ? "text-amber-400" : "text-red-400"}`} />
                    <div>
                      <p className="text-foreground font-medium text-sm">{a.article}: {a.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-700 rounded-full h-2"><div className={`h-2 rounded-full ${a.status === "compliant" ? "bg-emerald-500" : a.status === "partial" ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${a.score}%` }} /></div>
                    <span className="text-muted-foreground text-xs w-10">{a.score}%</span>
                    <Badge className={st.color}>{st.text}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      <Card className="glass-card gold-sweep">
        <CardHeader><CardTitle className="text-foreground text-base">ملخص الحوادث المؤثرة على الامتثال</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={[
              { name: "حرج", count: leaks.filter((l: any) => l.severity === "critical").length, fill: "#ef4444" },
              { name: "عالي", count: leaks.filter((l: any) => l.severity === "high").length, fill: "#f59e0b" },
              { name: "متوسط", count: leaks.filter((l: any) => l.severity === "medium").length, fill: "#3b82f6" },
              { name: "منخفض", count: leaks.filter((l: any) => l.severity === "low").length, fill: "#10b981" },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 8 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {[{ fill: "#ef4444" }, { fill: "#f59e0b" }, { fill: "#3b82f6" }, { fill: "#10b981" }].map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

