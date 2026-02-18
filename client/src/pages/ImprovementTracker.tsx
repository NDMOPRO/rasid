import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  TrendingUp, Search, Filter, CheckCircle2, Clock, AlertTriangle,
  ArrowUpRight, Target, Lightbulb, BarChart3, ChevronLeft, ChevronRight,
  Sparkles, RefreshCw, ExternalLink, Shield
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import DrillDownModal, { useDrillDown, type DrillDownFilter } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

type Priority = 'critical' | 'high' | 'medium' | 'low';
type Status = 'pending' | 'in_progress' | 'completed' | 'dismissed';

interface Recommendation {
  id: string;
  domain: string;
  clause: number;
  clauseName: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  impactScore: number;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string }> = {
  critical: { label: 'حرج', color: 'text-red-400', bgColor: 'bg-red-900/30' },
  high: { label: 'عالي', color: 'text-orange-400', bgColor: 'bg-orange-900/30' },
  medium: { label: 'متوسط', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30' },
  low: { label: 'منخفض', color: 'text-blue-400', bgColor: 'bg-blue-900/30' },
};

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending: { label: 'قيد الانتظار', color: 'text-muted-foreground', icon: Clock },
  in_progress: { label: 'قيد التنفيذ', color: 'text-blue-600', icon: RefreshCw },
  completed: { label: 'مكتمل', color: 'text-emerald-600', icon: CheckCircle2 },
  dismissed: { label: 'مرفوض', color: 'text-gray-400', icon: AlertTriangle },
};

const CLAUSE_NAMES: Record<number, string> = {
  1: 'تحديد الغرض من جمع البيانات',
  2: 'تحديد محتوى البيانات المجمعة',
  3: 'تحديد طريقة جمع البيانات',
  4: 'تحديد طريقة حفظ البيانات',
  5: 'تحديد كيفية التخلص من البيانات',
  6: 'تحديد حقوق أصحاب البيانات',
  7: 'تحديد طريقة التواصل',
  8: 'الإفصاح عن مشاركة البيانات مع أطراف ثالثة',
};

export default function ImprovementTracker() {
  const { playClick, playHover } = useSoundEffects();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();

  // Get scan data to generate recommendations
  const { data: dashData } = trpc.dashboard.stats.useQuery();
  // Use dashboard stats which includes clause compliance data
  const { data: clauseData } = (trpc as any).dashboard?.clauseStats?.useQuery?.() ?? { data: null };

  // Generate AI recommendations from scan data
  const generateRecommendations = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const recs: Recommendation[] = [];
      let id = 0;

      // Generate recommendations based on clause compliance data
      if (clauseData && Array.isArray(clauseData)) {
        (clauseData as any[]).forEach((clause: any) => {
          const complianceRate = clause.total > 0 ? (clause.compliant / clause.total) * 100 : 100;
          if (complianceRate < 100) {
            const priority: Priority = complianceRate < 30 ? 'critical' : complianceRate < 50 ? 'high' : complianceRate < 75 ? 'medium' : 'low';
            recs.push({
              id: `rec-${++id}`,
              domain: 'جميع المواقع',
              clause: clause.clause || id,
              clauseName: CLAUSE_NAMES[clause.clause || id] || clause.name || `البند ${id}`,
              title: `تحسين الامتثال للبند ${clause.clause || id}`,
              description: `نسبة الامتثال الحالية ${Math.round(complianceRate)}% - يوجد ${clause.total - clause.compliant} موقع غير ممتثل. يُنصح بمراجعة سياسات الخصوصية وإضافة البنود المطلوبة.`,
              priority,
              status: 'pending',
              impactScore: Math.round((100 - complianceRate) * 0.8),
            });
          }
        });
      }

      // Add general recommendations
      if (dashData) {
        const stats = dashData as any;
        if (Number(stats.nonCompliant) > 0) {
          recs.push({
            id: `rec-${++id}`,
            domain: 'المواقع غير الممتثلة',
            clause: 0,
            clauseName: 'عام',
            title: 'معالجة المواقع غير الممتثلة بالكامل',
            description: `يوجد ${stats.nonCompliant} موقع غير ممتثل بالكامل. يُنصح بالتواصل مع مسؤولي هذه المواقع وتزويدهم بنموذج سياسة خصوصية متوافق.`,
            priority: 'critical',
            status: 'pending',
            impactScore: 95,
          });
        }
        if (Number(stats.noPolicy) > 0) {
          recs.push({
            id: `rec-${++id}`,
            domain: 'المواقع بدون سياسة',
            clause: 0,
            clauseName: 'عام',
            title: 'إضافة سياسة خصوصية للمواقع التي لا تملك سياسة',
            description: `يوجد ${stats.noPolicy} موقع لا يملك صفحة سياسة خصوصية. هذا يمثل مخالفة صريحة لنظام حماية البيانات الشخصية.`,
            priority: 'critical',
            status: 'pending',
            impactScore: 100,
          });
        }
      }

      // Sort by impact score
      recs.sort((a, b) => b.impactScore - a.impactScore);
      setRecommendations(recs);
      setIsGenerating(false);
      toast.success('تم توليد التوصيات', { description: `تم إنشاء ${recs.length} توصية تحسين` });
    }, 2000);
  };

  const updateStatus = (recId: string, newStatus: Status) => {
    setRecommendations(prev =>
      prev.map(r => r.id === recId ? { ...r, status: newStatus } : r)
    );
    toast.success('تم تحديث الحالة');
  };

  const filtered = useMemo(() => {
    return recommendations.filter(r => {
      if (searchTerm && !r.title.includes(searchTerm) && !r.domain.includes(searchTerm) && !r.clauseName.includes(searchTerm)) return false;
      if (filterPriority && r.priority !== filterPriority) return false;
      if (filterStatus && r.status !== filterStatus) return false;
      return true;
    });
  }, [recommendations, searchTerm, filterPriority, filterStatus]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paged = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: recommendations.length,
    critical: recommendations.filter(r => r.priority === 'critical').length,
    completed: recommendations.filter(r => r.status === 'completed').length,
    avgImpact: recommendations.length > 0 ? Math.round(recommendations.reduce((s, r) => s + r.impactScore, 0) / recommendations.length) : 0,
  }), [recommendations]);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 gradient-text">
              <TrendingUp className="h-7 w-7 text-primary" />
              متتبع التحسينات
            </h1>
            <p className="text-muted-foreground mt-1">
              توصيات ذكية لتحسين مستوى الامتثال بناءً على نتائج الفحوصات
            </p>
          </div>
          <Button onClick={generateRecommendations} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 ms-2 animate-spin" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 ms-2" />
                توليد التوصيات
              </>
            )}
          </Button>
        </div>

        {/* KPI Cards */}
        {recommendations.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            <Card
              className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              onClick={() => openDrillDown({ title: 'إجمالي التوصيات', subtitle: 'جميع التوصيات التي تم إنشاؤها لتحسين الامتثال' })}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-950/30">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">إجمالي التوصيات</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              onClick={() => openDrillDown({ title: 'التوصيات الحرجة', subtitle: 'التوصيات ذات الأولوية القصوى التي تتطلب إجراءً فوريًا', classification: 'critical' })}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-950/30">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.critical}</p>
                  <p className="text-xs text-muted-foreground">حرجة</p>
                </div>
              </CardContent>
            </Card>
            <Card
              className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              onClick={() => openDrillDown({ title: 'التوصيات المكتملة', subtitle: 'التوصيات التي تم تنفيذها وإغلاقها بنجاح', classification: 'completed' })}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/30">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                  <p className="text-xs text-muted-foreground">مكتملة</p>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-950/30">
                  <BarChart3 className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.avgImpact}%</p>
                  <p className="text-xs text-muted-foreground">متوسط التأثير</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        {recommendations.length > 0 && (
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث في التوصيات..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                className="pe-10"
              />
            </div>
            <select
              className="border rounded-lg px-3 py-2 text-sm bg-background"
              value={filterPriority}
              onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
            >
              <option value="">جميع الأولويات</option>
              <option value="critical">حرج</option>
              <option value="high">عالي</option>
              <option value="medium">متوسط</option>
              <option value="low">منخفض</option>
            </select>
            <select
              className="border rounded-lg px-3 py-2 text-sm bg-background"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            >
              <option value="">جميع الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="in_progress">قيد التنفيذ</option>
              <option value="completed">مكتمل</option>
              <option value="dismissed">مرفوض</option>
            </select>
          </div>
        )}

        {/* Recommendations Table */}
        {paged.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-end">
              <thead className="text-xs text-muted-foreground uppercase bg-card/20">
                <tr>
                  <th className="px-4 py-3">التوصية</th>
                  <th className="px-4 py-3">البند</th>
                  <th className="px-4 py-3">الأولوية</th>
                  <th className="px-4 py-3">الحالة</th>
                  <th className="px-4 py-3">تأثير</th>
                  <th className="px-4 py-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((rec) => (
                  <tr
                    key={rec.id}
                    className="border-b border-border/50 hover:bg-card/30 cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all"
                    onClick={() => openDrillDown({ title: rec.title, subtitle: rec.description, clauseIndex: rec.clause, classification: rec.priority })}
                  >
                    <td className="px-4 py-4 max-w-[350px]">
                      <p className="font-semibold text-foreground">{rec.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{rec.description}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="font-mono">{rec.clauseName}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`${PRIORITY_CONFIG[rec.priority].bgColor} ${PRIORITY_CONFIG[rec.priority].color} border-none`}>
                        {PRIORITY_CONFIG[rec.priority].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`flex items-center gap-2 text-xs ${STATUS_CONFIG[rec.status].color}`}>
                        {(() => { const Icon = STATUS_CONFIG[rec.status].icon; return <Icon className="h-3.5 w-3.5" />; })()}
                        {STATUS_CONFIG[rec.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-foreground">{rec.impactScore}</span>
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); updateStatus(rec.id, 'in_progress'); }}>بدء التنفيذ</Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); updateStatus(rec.id, 'completed'); }}>إكمال</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-card/20 rounded-lg">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">لا توجد توصيات بعد</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              انقر على زر "توليد التوصيات" لبدء تحليل بيانات الامتثال وإنشاء خطة تحسين.
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <span className="text-sm text-muted-foreground">الصفحة {page} من {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              التالي
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </PageTransition>
  );
}

