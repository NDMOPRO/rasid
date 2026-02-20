/**
 * PrivacyDashboardsHub — صفحة مركز لوحات المؤشرات لمنصة رصد سياسة الخصوصية
 * تجمع كل لوحات المؤشرات والتحليلات في صفحة واحدة مخصصة
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Map, Activity, TrendingUp,
  Globe, Shield, Layers, Brain, Eye, FileText, Search,
  Sparkles, ChevronLeft, Radio, CalendarClock, Gauge,
  PieChart, Bell, Presentation, FileBarChart,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import AddPageButton from "@/components/AddPageButton";
import { useCustomPages } from "@/hooks/useCustomPages";

interface DashboardCard {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  category: string;
}

const DASHBOARD_CARDS: DashboardCard[] = [
  {
    id: "privacy-leadership",
    title: "لوحة القيادة",
    titleEn: "Leadership Dashboard",
    description: "نظرة شاملة على امتثال المواقع لسياسات الخصوصية",
    icon: LayoutDashboard,
    path: "/leadership",
    color: "from-green-500 to-emerald-600",
    category: "رئيسية",
  },
  {
    id: "compliance-heatmap",
    title: "خريطة الامتثال",
    titleEn: "Compliance Heatmap",
    description: "خريطة حرارية لمستوى امتثال المواقع",
    icon: Map,
    path: "/compliance-heatmap",
    color: "from-emerald-500 to-teal-600",
    category: "رئيسية",
  },
  {
    id: "kpi-dashboard",
    title: "لوحة مؤشرات الأداء",
    titleEn: "KPI Dashboard",
    description: "مؤشرات الأداء الرئيسية لمراقبة الخصوصية",
    icon: Gauge,
    path: "/kpi-dashboard",
    color: "from-blue-500 to-indigo-600",
    category: "رئيسية",
  },
  {
    id: "real-time",
    title: "اللوحة الحية",
    titleEn: "Real-time Dashboard",
    description: "مراقبة مباشرة لحالة الامتثال في الوقت الفعلي",
    icon: Radio,
    path: "/real-time",
    color: "from-red-500 to-rose-600",
    category: "رئيسية",
  },
  {
    id: "advanced-analytics",
    title: "التحليلات المتقدمة",
    titleEn: "Advanced Analytics",
    description: "تحليلات عميقة لبيانات الامتثال والاتجاهات",
    icon: BarChart3,
    path: "/advanced-analytics",
    color: "from-purple-500 to-violet-600",
    category: "تحليلية",
  },
  {
    id: "compliance-comparison",
    title: "مقارنة الامتثال",
    titleEn: "Compliance Comparison",
    description: "مقارنة مستويات الامتثال بين المواقع والقطاعات",
    icon: TrendingUp,
    path: "/compliance-comparison",
    color: "from-cyan-500 to-blue-600",
    category: "تحليلية",
  },
  {
    id: "time-comparison",
    title: "المقارنة الزمنية",
    titleEn: "Time Comparison",
    description: "تتبع تطور الامتثال عبر الزمن",
    icon: CalendarClock,
    path: "/time-comparison",
    color: "from-amber-500 to-orange-600",
    category: "تحليلية",
  },
  {
    id: "sector-comparison",
    title: "مقارنة القطاعات",
    titleEn: "Sector Comparison",
    description: "مقارنة أداء القطاعات المختلفة في الامتثال",
    icon: Layers,
    path: "/sector-comparison",
    color: "from-pink-500 to-rose-600",
    category: "تحليلية",
  },
  {
    id: "strategy-coverage",
    title: "تغطية الاستراتيجية",
    titleEn: "Strategy Coverage",
    description: "مدى تغطية الاستراتيجية الوطنية للخصوصية",
    icon: Shield,
    path: "/strategy-coverage",
    color: "from-indigo-500 to-blue-600",
    category: "تحليلية",
  },
  {
    id: "executive-report",
    title: "التقرير التنفيذي",
    titleEn: "Executive Report",
    description: "تقرير تنفيذي شامل لصناع القرار",
    icon: FileBarChart,
    path: "/executive-report",
    color: "from-slate-500 to-gray-600",
    category: "تقارير",
  },
  {
    id: "custom-reports",
    title: "التقارير المخصصة",
    titleEn: "Custom Reports",
    description: "إنشاء تقارير مخصصة حسب الحاجة",
    icon: FileText,
    path: "/custom-reports",
    color: "from-teal-500 to-emerald-600",
    category: "تقارير",
  },
  {
    id: "pdf-reports",
    title: "تقارير PDF",
    titleEn: "PDF Reports",
    description: "إنشاء وتصدير تقارير PDF احترافية",
    icon: FileText,
    path: "/pdf-reports",
    color: "from-sky-500 to-blue-600",
    category: "تقارير",
  },
  {
    id: "scheduled-reports",
    title: "التقارير المجدولة",
    titleEn: "Scheduled Reports",
    description: "جدولة التقارير الدورية وإرسالها تلقائيًا",
    icon: CalendarClock,
    path: "/scheduled-reports",
    color: "from-violet-500 to-purple-600",
    category: "تقارير",
  },
  {
    id: "smart-alerts",
    title: "التنبيهات الذكية",
    titleEn: "Smart Alerts",
    description: "نظام تنبيهات ذكي لمراقبة التغييرات",
    icon: Bell,
    path: "/smart-alerts",
    color: "from-orange-500 to-red-600",
    category: "متقدمة",
  },
  {
    id: "presentation-builder",
    title: "منشئ العروض",
    titleEn: "Presentation Builder",
    description: "إنشاء عروض تقديمية من بيانات المنصة",
    icon: Presentation,
    path: "/presentation-builder",
    color: "from-fuchsia-500 to-pink-600",
    category: "تقارير",
  },
];

const CATEGORIES = ["الكل", "رئيسية", "تحليلية", "متقدمة", "تقارير", "مخصصة"];

export default function PrivacyDashboardsHub() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { pages: customPages, createPage } = useCustomPages("privacy");

  const filteredCards = DASHBOARD_CARDS.filter((card) => {
    const matchesCategory = activeCategory === "الكل" || card.category === activeCategory;
    const matchesSearch = !searchQuery ||
      card.title.includes(searchQuery) ||
      card.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const customDashboardPages = (customPages || []).filter(
    (p: any) => p.pageType === "dashboard"
  );

  const handleCreatePage = async (pageType: "dashboard" | "table" | "report", title: string) => {
    const result = await createPage(pageType, title);
    if (result) {
      setLocation(`/custom/${pageType}/${(result as any).id}`);
    }
  };

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLocation("/")}
            className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              مركز لوحات المؤشرات
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-emerald-400/70" : "text-green-600"}`}>
              منصة رصد سياسة الخصوصية — جميع لوحات المؤشرات والتحليلات
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في اللوحات..."
              className={`pr-10 pl-4 py-2 rounded-xl border text-sm w-64 ${
                isDark
                  ? "bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>
          <AddPageButton
            collapsed={false}
            onCreatePage={handleCreatePage}
            accent="#22c55e"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/25"
                : isDark
                  ? "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700/50 hover:border-emerald-500/30 hover:shadow-emerald-500/10"
                    : "bg-white border-gray-200 hover:border-green-300 hover:shadow-green-100"
                }`}
                onClick={() => setLocation(card.path)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} shadow-lg`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${isDark ? "border-gray-600 text-gray-400" : "border-gray-300 text-gray-500"}`}>
                      {card.category}
                    </Badge>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {card.title}
                  </h3>
                  <p className={`text-xs leading-relaxed line-clamp-2 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Custom Dashboard Pages */}
        {(activeCategory === "الكل" || activeCategory === "مخصصة") &&
          customDashboardPages.map((page: any, i: number) => (
            <motion.div
              key={`custom-${page.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (filteredCards.length + i) * 0.05, duration: 0.3 }}
            >
              <Card
                className={`group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border ${
                  isDark
                    ? "bg-gray-900/50 border-gray-700/50 hover:border-emerald-500/30 hover:shadow-emerald-500/10"
                    : "bg-white border-gray-200 hover:border-green-300 hover:shadow-green-100"
                }`}
                onClick={() => setLocation(`/custom/dashboard/${page.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 shadow-lg">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${isDark ? "border-emerald-500/30 text-emerald-400" : "border-green-300 text-green-500"}`}>
                      مخصصة
                    </Badge>
                  </div>
                  <h3 className={`font-bold text-sm mb-1 ${isDark ? "text-white" : "text-gray-900"}`}>
                    {page.title}
                  </h3>
                  <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-gray-500"}`}>
                    لوحة مؤشرات مخصصة
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))
        }
      </div>

      {filteredCards.length === 0 && customDashboardPages.length === 0 && (
        <div className="text-center py-16">
          <LayoutDashboard className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            لا توجد لوحات مؤشرات مطابقة
          </p>
        </div>
      )}
    </div>
  );
}
