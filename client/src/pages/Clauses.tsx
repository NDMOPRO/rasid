import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, CheckCircle, XCircle } from "lucide-react";
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PageSkeleton } from "@/components/Skeletons";
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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 300, damping: 25 } },
};

export default function Clauses() {
  const { data: clauseStats, isLoading } = trpc.dashboard.clauseStats.useQuery();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const { playClick, playHover } = useSoundEffects();

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div
      className="relative space-y-6"
    >
      <ParticleField count={30} opacity={0.3} />
      <WatermarkLogo />

      <div className="relative z-10">
        <h1
          className="text-2xl font-bold gradient-text"
        >
          بنود المادة 12
        </h1>
        <p
          className="text-muted-foreground text-sm mt-1"
        >
          تحليل امتثال المواقع لكل بند من بنود المادة 12 من نظام حماية البيانات الشخصية
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 stagger-children"
      >
        {clauseStats?.map((clause) => (
          <div key={clause.clause}>
            <Card
              className="glass-card gold-sweep group hover:border-primary/30 transition-all cursor-pointer"
              onClick={() => {
                playClick();
                openDrillDown({
                  title: `مواقع البند ${clause.clause}`,
                  subtitle: clause.name,
                  icon: <Shield />,
                  clauseIndex: clause.clause,
                });
              }}
              onMouseEnter={() => playHover()}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 btn-glow"
                  >
                    <span className="text-lg font-bold text-primary">{clause.clause}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">{clause.name}</h3>
                    <div className="flex items-center gap-3 mb-2">
                      <Progress value={clause.percentage} className="h-2 flex-1" />
                      <span className="text-sm font-bold tabular-nums" style={{ color: getScoreColor(clause.percentage) }}>
                        <AnimatedCounter value={clause.percentage} suffix="%" decimals={0} />
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span
                        className="flex items-center gap-1 cursor-pointer hover:text-emerald-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          openDrillDown({ title: "المواقع الممتثلة", subtitle: `البند ${clause.clause}: ${clause.name}`, icon: <CheckCircle />, clauseIndex: clause.clause, complianceStatus: "compliant" });
                        }}
                      >
                        <CheckCircle className="h-3 w-3 text-emerald-400 icon-animate" />
                        <AnimatedCounter value={clause.compliant} /> ممتثل
                      </span>
                      <span
                        className="flex items-center gap-1 cursor-pointer hover:text-red-500 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          playClick();
                          openDrillDown({ title: "المواقع غير الممتثلة", subtitle: `البند ${clause.clause}: ${clause.name}`, icon: <XCircle />, clauseIndex: clause.clause, complianceStatus: "non_compliant" });
                        }}
                      >
                        <XCircle className="h-3 w-3 text-red-400 icon-animate" />
                        <AnimatedCounter value={clause.total - clause.compliant} /> غير ممتثل
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}

function getScoreColor(score: number) {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#f59e0b";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}
