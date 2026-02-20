/**
 * Home — الصفحة الرئيسية
 * تركز على ما بعد الرصد (منصة التسريبات) وعرض الامتثال (منصة الخصوصية)
 * مع أزرار للوصول لمراكز لوحات المؤشرات والعمليات التشغيلية
 */
import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Activity, ShieldAlert, Shield,
  BarChart3, Loader2, ArrowLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "@/contexts/ThemeContext";

const Dashboard = lazy(() => import("./Dashboard"));
const LeadershipDashboard = lazy(() => import("./LeadershipDashboard"));

function HubNavigationBar({ workspace }: { workspace: string }) {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isBreach = workspace === "leaks";

  const hubs = isBreach
    ? [
        {
          title: "مركز لوحات المؤشرات",
          titleEn: "Dashboards Hub",
          description: "جميع لوحات المؤشرات والتحليلات",
          icon: LayoutDashboard,
          path: "/breach-dashboards",
          color: "from-cyan-500 to-blue-600",
          shadow: "shadow-cyan-500/20",
        },
        {
          title: "مركز العمليات التشغيلية",
          titleEn: "Operations Hub",
          description: "أدوات الرصد والاستيراد والتصدير",
          icon: Activity,
          path: "/breach-operations",
          color: "from-purple-500 to-violet-600",
          shadow: "shadow-purple-500/20",
        },
      ]
    : [
        {
          title: "مركز لوحات المؤشرات",
          titleEn: "Dashboards Hub",
          description: "جميع لوحات المؤشرات والتقارير",
          icon: LayoutDashboard,
          path: "/privacy-dashboards",
          color: "from-green-500 to-emerald-600",
          shadow: "shadow-green-500/20",
        },
        {
          title: "مركز العمليات التشغيلية",
          titleEn: "Operations Hub",
          description: "أدوات الفحص والاستيراد والتصدير",
          icon: Activity,
          path: "/privacy-operations",
          color: "from-teal-500 to-cyan-600",
          shadow: "shadow-teal-500/20",
        },
      ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 px-4 md:px-6">
      {hubs.map((hub, i) => {
        const Icon = hub.icon;
        return (
          <motion.div
            key={hub.path}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Card
              className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${hub.shadow} border ${
                isDark
                  ? "bg-gray-900/60 border-gray-700/50 hover:border-gray-600/50"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setLocation(hub.path)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${hub.color} shadow-lg group-hover:shadow-xl transition-shadow`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base mb-0.5 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {hub.title}
                  </h3>
                  <p className={`text-xs ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    {hub.description}
                  </p>
                </div>
                <ArrowLeft className={`w-5 h-5 transition-transform group-hover:-translate-x-1 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const workspace = localStorage.getItem("rasid_workspace") || "leaks";

  if (workspace === "privacy") {
    return (
      <div className="overflow-x-hidden max-w-full">
        <HubNavigationBar workspace="privacy" />
        <Suspense fallback={
          <div className="flex items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="text-sm text-muted-foreground">جاري تحميل لوحة الخصوصية...</span>
          </div>
        }>
          <LeadershipDashboard />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden max-w-full">
      <HubNavigationBar workspace="leaks" />
      <Suspense fallback={
        <div className="flex items-center justify-center h-64 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <span className="text-sm text-muted-foreground">جاري تحميل لوحة المؤشرات...</span>
        </div>
      }>
        <Dashboard />
      </Suspense>
    </div>
  );
}
