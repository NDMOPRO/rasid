/**
 * BreachDashboardsHub — صفحة مركز لوحات المؤشرات لمنصة رصد تسريب البيانات
 * تجمع كل لوحات المؤشرات والتحليلات في صفحة واحدة مخصصة
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BarChart3, Map, Activity, TrendingUp,
  Globe, Shield, Layers, Brain, Users, Target, Eye,
  Radar, Network, FileText, Search, Plus, Sparkles,
  ArrowLeft, PieChart, Gauge, ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";
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
    id: "national-overview",
    title: "لوحة القيادة الرئيسية",
    titleEn: "National Overview",
    description: "نظرة شاملة على حالات التسريب على المستوى الوطني مع مؤشرات رئيسية",
    icon: LayoutDashboard,
    path: "/national-overview",
    color: "from-cyan-500 to-blue-600",
    category: "رئيسية",
  },
  {
    id: "threat-map",
    title: "خريطة التهديدات",
    titleEn: "Threat Map",
    description: "خريطة تفاعلية لمصادر التهديدات وتوزيعها الجغرافي",
    icon: Map,
    path: "/threat-map",
    color: "from-red-500 to-rose-600",
    category: "رئيسية",
  },
  {
    id: "sector-analysis",
    title: "تحليل القطاعات",
    titleEn: "Sector Analysis",
    description: "تحليل تفصيلي لحالات التسريب حسب القطاعات",
    icon: Layers,
    path: "/sector-analysis",
    color: "from-purple-500 to-violet-600",
    category: "تحليلية",
  },
  {
    id: "impact-assessment",
    title: "تحليل الأثر",
    titleEn: "Impact Assessment",
    description: "تقييم الأثر المحتمل لحالات التسريب على الجهات المتأثرة",
    icon: Target,
    path: "/impact-assessment",
    color: "from-orange-500 to-amber-600",
    category: "تحليلية",
  },
  {
    id: "geo-analysis",
    title: "التحليل الجغرافي",
    titleEn: "Geo Analysis",
    description: "تحليل جغرافي لمصادر ومناطق التسريب",
    icon: Globe,
    path: "/geo-analysis",
    color: "from-emerald-500 to-green-600",
    category: "تحليلية",
  },
  {
    id: "source-intelligence",
    title: "استخبارات المصادر",
    titleEn: "Source Intelligence",
    description: "تحليل مصادر النشر والأنماط المتكررة",
    icon: Radar,
    path: "/source-intelligence",
    color: "from-sky-500 to-cyan-600",
    category: "تحليلية",
  },
  {
    id: "threat-actors",
    title: "تحليل جهات النشر",
    titleEn: "Threat Actors",
    description: "تحليل جهات التهديد ونشاطاتها وأنماطها",
    icon: Users,
    path: "/threat-actors-analysis",
    color: "from-pink-500 to-rose-600",
    category: "تحليلية",
  },
  {
    id: "pii-atlas",
    title: "أطلس البيانات الشخصية",
    titleEn: "PII Atlas",
    description: "خريطة شاملة لأنواع البيانات الشخصية المسربة",
    icon: Network,
    path: "/pii-atlas",
    color: "from-indigo-500 to-blue-600",
    category: "متقدمة",
  },
  {
    id: "knowledge-graph",
    title: "رسم المعرفة",
    titleEn: "Knowledge Graph",
    description: "شبكة العلاقات بين الحالات والمصادر والجهات",
    icon: Brain,
    path: "/knowledge-graph",
    color: "from-violet-500 to-purple-600",
    category: "متقدمة",
  },
  {
    id: "leak-timeline",
    title: "الخط الزمني للحالات",
    titleEn: "Leak Timeline",
    description: "عرض زمني متسلسل لحالات التسريب",
    icon: Activity,
    path: "/leak-timeline",
    color: "from-teal-500 to-emerald-600",
    category: "تحليلية",
  },
  {
    id: "pdpl-compliance",
    title: "امتثال PDPL",
    titleEn: "PDPL Compliance",
    description: "مؤشرات الامتثال لنظام حماية البيانات الشخصية",
    icon: Shield,
    path: "/pdpl-compliance",
    color: "from-blue-500 to-indigo-600",
    category: "متقدمة",
  },
  {
    id: "feedback-accuracy",
    title: "مقاييس الدقة",
    titleEn: "Accuracy Metrics",
    description: "قياس دقة الرصد والتصنيف مع التحسين المستمر",
    icon: TrendingUp,
    path: "/feedback-accuracy",
    color: "from-amber-500 to-yellow-600",
    category: "متقدمة",
  },
  {
    id: "executive-brief",
    title: "الملخص التنفيذي",
    titleEn: "Executive Brief",
    description: "ملخص تنفيذي شامل لصناع القرار",
    icon: FileText,
    path: "/executive-brief",
    color: "from-slate-500 to-gray-600",
    category: "تقارير",
  },
  {
    id: "incident-compare",
    title: "مقارنة الحالات",
    titleEn: "Incident Compare",
    description: "مقارنة بين حالات التسريب المختلفة",
    icon: BarChart3,
    path: "/incident-compare",
    color: "from-cyan-500 to-teal-600",
    category: "تقارير",
  },
  {
    id: "campaign-tracker",
    title: "متتبع الحملات",
    titleEn: "Campaign Tracker",
    description: "تتبع حملات التسريب المنظمة والمترابطة",
    icon: Sparkles,
    path: "/campaign-tracker",
    color: "from-rose-500 to-pink-600",
    category: "متقدمة",
  },
];

const CATEGORIES = ["الكل", "رئيسية", "تحليلية", "متقدمة", "تقارير", "مخصصة"];

export default function BreachDashboardsHub() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const { pages: customPages, createPage } = useCustomPages("leaks");

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

  const handleCreatePage = async (pageType: "dashboard" | "table" | "report", title: string): Promise<boolean> => {
    const result = await createPage(pageType, title);
    if (result) {
      setLocation(`/custom/${pageType}/${(result as any).id}`);
      return true;
    }
    return false;
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
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              منصة رصد تسريب البيانات الشخصية — جميع لوحات المؤشرات والتحليلات
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
            accent="#3DB1AC"
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
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
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
                    ? "bg-gray-900/50 border-gray-700/50 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100"
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
                    ? "bg-gray-900/50 border-gray-700/50 hover:border-cyan-500/30 hover:shadow-cyan-500/10"
                    : "bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-100"
                }`}
                onClick={() => setLocation(`/custom/dashboard/${page.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 shadow-lg">
                      <LayoutDashboard className="w-5 h-5 text-white" />
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${isDark ? "border-cyan-500/30 text-cyan-400" : "border-blue-300 text-blue-500"}`}>
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
          <p className={`text-sm mt-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            جرب تغيير معايير البحث أو الفئة
          </p>
        </div>
      )}
    </div>
  );
}
