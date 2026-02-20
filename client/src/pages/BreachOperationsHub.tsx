/**
 * BreachOperationsHub — صفحة مركز العمليات التشغيلية لمنصة رصد تسريب البيانات
 * يحتوي على أدوات ما قبل الرصد والعمليات التشغيلية
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Send, Globe, FileText, Radio, ScanSearch, Bell,
  Crosshair, Radar, Link2, UserX, Brain, Network,
  Shield, FileCheck, Search, ChevronLeft, Import,
  Archive, CalendarClock, Eye, Activity, Upload,
  Database, Settings, Download,
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
  // ── أدوات الرصد (ما قبل الرصد) ──
  {
    id: "live-scan",
    title: "الرصد المباشر",
    titleEn: "Live Scan",
    description: "بدء رصد مباشر للمصادر والقنوات",
    icon: Radio,
    path: "/live-scan",
    color: "from-red-500 to-rose-600",
    category: "أدوات الرصد",
  },
  {
    id: "telegram",
    title: "رصد تليجرام",
    titleEn: "Telegram Monitor",
    description: "مراقبة قنوات ومجموعات تليجرام",
    icon: Send,
    path: "/telegram",
    color: "from-sky-500 to-blue-600",
    category: "أدوات الرصد",
  },
  {
    id: "darkweb",
    title: "رصد الدارك ويب",
    titleEn: "Dark Web Monitor",
    description: "مراقبة منتديات ومواقع الدارك ويب",
    icon: Globe,
    path: "/darkweb",
    color: "from-purple-500 to-violet-600",
    category: "أدوات الرصد",
  },
  {
    id: "paste-sites",
    title: "مواقع اللصق",
    titleEn: "Paste Sites",
    description: "مراقبة مواقع اللصق مثل Pastebin",
    icon: FileText,
    path: "/paste-sites",
    color: "from-amber-500 to-orange-600",
    category: "أدوات الرصد",
  },
  {
    id: "monitoring-jobs",
    title: "مهام الرصد",
    titleEn: "Monitoring Jobs",
    description: "إدارة وجدولة مهام الرصد المختلفة",
    icon: CalendarClock,
    path: "/monitoring-jobs",
    color: "from-indigo-500 to-blue-600",
    category: "أدوات الرصد",
  },
  // ── أدوات التحليل ──
  {
    id: "pii-classifier",
    title: "مختبر أنماط البيانات",
    titleEn: "PII Classifier",
    description: "تصنيف أنواع البيانات الشخصية المسربة",
    icon: ScanSearch,
    path: "/pii-classifier",
    color: "from-cyan-500 to-teal-600",
    category: "أدوات التحليل",
  },
  {
    id: "evidence-chain",
    title: "سلسلة الأدلة",
    titleEn: "Evidence Chain",
    description: "تتبع وتوثيق الأدلة المرتبطة بالحالات",
    icon: Link2,
    path: "/evidence-chain",
    color: "from-emerald-500 to-green-600",
    category: "أدوات التحليل",
  },
  {
    id: "threat-rules",
    title: "قواعد الرصد",
    titleEn: "Threat Rules",
    description: "إدارة وتكوين قواعد الكشف والرصد",
    icon: Crosshair,
    path: "/threat-rules",
    color: "from-rose-500 to-pink-600",
    category: "أدوات التحليل",
  },
  {
    id: "osint-tools",
    title: "أدوات OSINT",
    titleEn: "OSINT Tools",
    description: "أدوات الاستخبارات مفتوحة المصدر",
    icon: Radar,
    path: "/osint-tools",
    color: "from-teal-500 to-cyan-600",
    category: "أدوات التحليل",
  },
  // ── إدارة البيانات ──
  {
    id: "seller-profiles",
    title: "ملفات المصادر",
    titleEn: "Seller Profiles",
    description: "إدارة ملفات بائعي البيانات المسربة",
    icon: UserX,
    path: "/seller-profiles",
    color: "from-pink-500 to-rose-600",
    category: "إدارة البيانات",
  },
  {
    id: "alert-channels",
    title: "قنوات التنبيه",
    titleEn: "Alert Channels",
    description: "تكوين قنوات ووسائل التنبيه",
    icon: Bell,
    path: "/alert-channels",
    color: "from-yellow-500 to-amber-600",
    category: "إدارة البيانات",
  },
  {
    id: "incidents-registry",
    title: "سجل الحالات",
    titleEn: "Incidents Registry",
    description: "السجل الكامل لجميع حالات التسريب",
    icon: Archive,
    path: "/incidents-registry",
    color: "from-slate-500 to-gray-600",
    category: "إدارة البيانات",
  },
  {
    id: "verify-document",
    title: "التحقق من التوثيق",
    titleEn: "Verify Document",
    description: "التحقق من صحة الوثائق والتقارير",
    icon: FileCheck,
    path: "/verify",
    color: "from-blue-500 to-indigo-600",
    category: "إدارة البيانات",
  },
  // ── الاستيراد والتصدير ──
  {
    id: "import-data",
    title: "استيراد البيانات",
    titleEn: "Import Data",
    description: "استيراد بيانات حالات التسريب من ملفات خارجية",
    icon: Upload,
    path: "/breach-import",
    color: "from-green-500 to-emerald-600",
    category: "استيراد وتصدير",
  },
  {
    id: "export-data",
    title: "تصدير البيانات",
    titleEn: "Export Data",
    description: "تصدير البيانات والتقارير بصيغ مختلفة",
    icon: Download,
    path: "/export-data",
    color: "from-violet-500 to-purple-600",
    category: "استيراد وتصدير",
  },
];

const CATEGORIES = ["الكل", "أدوات الرصد", "أدوات التحليل", "إدارة البيانات", "استيراد وتصدير"];

export default function BreachOperationsHub() {
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
            <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-gray-500"}`}>
              منصة رصد تسريب البيانات — أدوات الرصد والعمليات التشغيلية
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
