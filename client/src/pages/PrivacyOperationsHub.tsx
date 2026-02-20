/**
 * PrivacyOperationsHub — صفحة مركز العمليات التشغيلية لمنصة رصد سياسة الخصوصية
 * يحتوي على أدوات الفحص والعمليات التشغيلية
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Globe, FileText, Radio, ScanSearch, Bell, Eye,
  Import, Send, CalendarClock, FolderOpen, History,
  Radar, Link2, CheckCircle2, Layers, Shield,
  Search, ChevronLeft, Activity, Upload, Download,
  Settings,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

interface OperationCard {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  category: string;
}

const OPERATION_CARDS: OperationCard[] = [
  // ── أدوات الفحص ──
  {
    id: "sites",
    title: "إدارة المواقع",
    titleEn: "Sites Management",
    description: "إضافة وإدارة المواقع المستهدفة للفحص",
    icon: Globe,
    path: "/sites",
    color: "from-green-500 to-emerald-600",
    category: "أدوات الفحص",
  },
  {
    id: "advanced-scan",
    title: "الفحص المباشر",
    titleEn: "Live Scan",
    description: "فحص مباشر لسياسات الخصوصية في المواقع",
    icon: Radio,
    path: "/advanced-scan",
    color: "from-red-500 to-rose-600",
    category: "أدوات الفحص",
  },
  {
    id: "batch-scan",
    title: "الفحص الجماعي",
    titleEn: "Batch Scan",
    description: "فحص دفعات كبيرة من المواقع دفعة واحدة",
    icon: Import,
    path: "/batch-scan",
    color: "from-blue-500 to-indigo-600",
    category: "أدوات الفحص",
  },
  {
    id: "deep-scan",
    title: "الفحص العميق",
    titleEn: "Deep Scan",
    description: "فحص تفصيلي عميق لسياسات الخصوصية",
    icon: Radar,
    path: "/deep-scan",
    color: "from-purple-500 to-violet-600",
    category: "أدوات الفحص",
  },
  {
    id: "scan-library",
    title: "مكتبة الفحوصات",
    titleEn: "Scan Library",
    description: "أرشيف كامل لجميع نتائج الفحوصات",
    icon: FolderOpen,
    path: "/scan-library",
    color: "from-amber-500 to-orange-600",
    category: "أدوات الفحص",
  },
  {
    id: "scan-schedules",
    title: "جدولة الفحوصات",
    titleEn: "Scan Schedules",
    description: "جدولة فحوصات دورية تلقائية",
    icon: CalendarClock,
    path: "/scan-schedules",
    color: "from-indigo-500 to-blue-600",
    category: "أدوات الفحص",
  },
  {
    id: "scan-history",
    title: "سجل الفحوصات",
    titleEn: "Scan History",
    description: "عرض وتصفح تاريخ الفحوصات السابقة",
    icon: History,
    path: "/scan-history",
    color: "from-slate-500 to-gray-600",
    category: "أدوات الفحص",
  },
  // ── العمليات التنفيذية ──
  {
    id: "change-detection",
    title: "رصد التغييرات",
    titleEn: "Change Detection",
    description: "تتبع التغييرات في سياسات الخصوصية",
    icon: Eye,
    path: "/change-detection",
    color: "from-teal-500 to-emerald-600",
    category: "العمليات",
  },
  {
    id: "clauses",
    title: "البنود الثمانية (المادة 12)",
    titleEn: "8 Clauses",
    description: "فحص مدى التزام المواقع ببنود المادة 12",
    icon: FileText,
    path: "/clauses",
    color: "from-cyan-500 to-blue-600",
    category: "العمليات",
  },
  {
    id: "letters",
    title: "الخطابات",
    titleEn: "Letters",
    description: "إنشاء وإدارة خطابات التنبيه للجهات",
    icon: Send,
    path: "/letters",
    color: "from-pink-500 to-rose-600",
    category: "العمليات",
  },
  {
    id: "improvement-tracker",
    title: "متتبع التحسين",
    titleEn: "Improvement Tracker",
    description: "تتبع إجراءات التحسين والمتابعة مع الجهات",
    icon: CheckCircle2,
    path: "/improvement-tracker",
    color: "from-emerald-500 to-green-600",
    category: "العمليات",
  },
  // ── الاستيراد والتصدير ──
  {
    id: "import-data",
    title: "استيراد المواقع",
    titleEn: "Import Sites",
    description: "استيراد قائمة مواقع جديدة للفحص",
    icon: Upload,
    path: "/privacy-import",
    color: "from-green-500 to-teal-600",
    category: "استيراد وتصدير",
  },
  {
    id: "export-data",
    title: "تصدير البيانات",
    titleEn: "Export Data",
    description: "تصدير نتائج الفحوصات والتقارير",
    icon: Download,
    path: "/export-data",
    color: "from-violet-500 to-purple-600",
    category: "استيراد وتصدير",
  },
  {
    id: "advanced-search",
    title: "البحث المتقدم",
    titleEn: "Advanced Search",
    description: "بحث متقدم في بيانات الفحوصات والمواقع",
    icon: Search,
    path: "/advanced-search",
    color: "from-sky-500 to-cyan-600",
    category: "العمليات",
  },
];

const CATEGORIES = ["الكل", "أدوات الفحص", "العمليات", "استيراد وتصدير"];

export default function PrivacyOperationsHub() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const filteredCards = OPERATION_CARDS.filter((card) => {
    const matchesCategory = activeCategory === "الكل" || card.category === activeCategory;
    const matchesSearch = !searchQuery ||
      card.title.includes(searchQuery) ||
      card.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

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
              مركز العمليات التشغيلية
            </h1>
            <p className={`text-sm mt-1 ${isDark ? "text-emerald-400/70" : "text-green-600"}`}>
              منصة رصد سياسة الخصوصية — أدوات الفحص والعمليات التشغيلية
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"}`} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في الأدوات..."
              className={`pr-10 pl-4 py-2 rounded-xl border text-sm w-64 ${
                isDark
                  ? "bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
                  : "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              }`}
            />
          </div>
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

      {/* Operations Cards Grid */}
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
      </div>

      {filteredCards.length === 0 && (
        <div className="text-center py-16">
          <Activity className={`w-16 h-16 mx-auto mb-4 ${isDark ? "text-gray-600" : "text-gray-300"}`} />
          <p className={`text-lg font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            لا توجد أدوات مطابقة
          </p>
        </div>
      )}
    </div>
  );
}
