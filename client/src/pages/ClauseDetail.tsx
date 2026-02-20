import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, CheckCircle, XCircle, Search } from "lucide-react";
import { ScreenshotThumbnail } from "@/components/ScreenshotPreview";
import { useRoute, useLocation } from "wouter";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const clauseNames = [
  "تحديد الغرض من جمع البيانات الشخصية",
  "تحديد محتوى البيانات الشخصية المطلوب جمعها",
  "تحديد طريقة جمع البيانات الشخصية",
  "تحديد وسيلة حفظ البيانات الشخصية",
  "تحديد كيفية معالجة البيانات الشخصية",
  "تحديد كيفية إتلاف البيانات الشخصية",
  "تحديد حقوق صاحب البيانات الشخصية",
  "كيفية ممارسة صاحب البيانات لحقوقه",
];

export default function ClauseDetail() {
  const { playClick, playHover } = useSoundEffects();
  const [match, params] = useRoute("/clauses/:num");
  const [, setLocation] = useLocation();
  const clauseNum = parseInt(params?.num || "1");
  const [search, setSearch] = useState("");

  const { data: clauseStats } = trpc.dashboard.clauseStats.useQuery();
  const { data: clauseData, isLoading } = trpc.clauses.detail.useQuery({ clauseNum });
  const scansList = clauseData?.scans || [];

  const clause = clauseStats?.find((c) => c.clause === clauseNum);
  const clauseKey = `clause${clauseNum}Compliant` as string;
  const compliantSites = scansList.filter((s: any) => (s as any)[clauseKey]) || [];
  const nonCompliantSites = scansList.filter((s: any) => !(s as any)[clauseKey]) || [];

  const filterSites = (list: any[]) =>
    list.filter((s: any) => !search || s.domain?.includes(search));

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      <Button variant="ghost" size="sm" onClick={() => setLocation("/clauses")} className="gap-2">
        <ArrowRight className="h-4 w-4" />
        العودة للبنود
      </Button>

      <Card className="glass-card gold-sweep">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center btn-glow">
              <span className="text-2xl font-bold text-primary gradient-text">{clauseNum}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">البند {clauseNum}</h1>
              <p className="text-sm text-muted-foreground mt-1">{clauseNames[clauseNum - 1]}</p>
            </div>
          </div>
          <div className="flex gap-6 mt-4 pt-4 border-t border-[rgba(197,165,90,0.10)]">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: getScoreColor(clause?.percentage || 0) }}>
                {Math.round(clause?.percentage || 0)}%
              </div>
              <div className="text-xs text-muted-foreground">نسبة الامتثال</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{compliantSites.length}</div>
              <div className="text-xs text-muted-foreground">ممتثل</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{nonCompliantSites.length}</div>
              <div className="text-xs text-muted-foreground">غير ممتثل</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="relative">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="بحث في المواقع..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pe-10"
        />
      </div>

      <Tabs defaultValue="non_compliant" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="non_compliant" className="gap-2">
            <XCircle className="h-4 w-4" />
            غير ممتثل ({nonCompliantSites.length})
          </TabsTrigger>
          <TabsTrigger value="compliant" className="gap-2">
            <CheckCircle className="h-4 w-4" />
            ممتثل ({compliantSites.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="non_compliant" className="mt-4">
          <SiteList sites={filterSites(nonCompliantSites)} compliant={false} onNavigate={setLocation} />
        </TabsContent>
        <TabsContent value="compliant" className="mt-4">
          <SiteList sites={filterSites(compliantSites)} compliant={true} onNavigate={setLocation} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SiteList({ sites, compliant, onNavigate }: { sites: any[]; compliant: boolean; onNavigate: (path: string) => void }) {
  if (sites.length === 0) {
    return <div className="p-3 sm:p-8 text-center text-muted-foreground">لا توجد مواقع</div>;
  }

  return (
    <Card className="glass-card gold-sweep">
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[rgba(197,165,90,0.12)] bg-[rgba(197,165,90,0.04)]">
              <th className="text-end py-3 px-4 font-medium text-muted-foreground">النطاق</th>
              <th className="text-end py-3 px-4 font-medium text-muted-foreground">الاسم</th>
              <th className="text-end py-3 px-4 font-medium text-muted-foreground">الدليل</th>
            </tr>
          </thead>
          <tbody>
            {sites.slice(0, 100).map((site) => (
              <tr
                key={site.siteId}
                className="border-b border-border/30 hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200 cursor-pointer"
                onClick={() => onNavigate(`/sites/${site.siteId}`)}
              >
                <td className="py-3 px-4 font-medium">
                  <div className="flex items-center gap-2">
                    <ScreenshotThumbnail url={(site as any).screenshotUrl} domain={site.domain} size="xs" />
                    <span>{site.domain}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{site.siteName || "-"}</td>
                <td className="py-3 px-4 text-xs text-muted-foreground max-w-[300px] truncate">{site.evidence || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {sites.length > 100 && (
          <div className="p-3 text-center text-xs text-muted-foreground border-t border-[rgba(197,165,90,0.10)]">
            يُعرض أول 100 من أصل {sites.length}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getScoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}
