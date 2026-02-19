/**
 * SmartRasidTrainingWidget — المركز التدريبي لراصد الذكي
 * يظهر في أسفل لوحة القيادة الرئيسية
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Play, CheckCircle2, Clock, Star,
  Brain, Shield, Search, Database, FileSearch, Zap,
  ChevronLeft, Award, TrendingUp, Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  level: "مبتدئ" | "متوسط" | "متقدم";
  progress: number;
  lessons: number;
  completedLessons: number;
  locked: boolean;
}

const modules: TrainingModule[] = [
  { id: "t1", title: "أساسيات رصد البيانات", description: "تعلم كيفية استخدام أدوات الرصد الأساسية وفهم مصادر البيع", icon: Search, duration: "45 دقيقة", level: "مبتدئ", progress: 100, lessons: 6, completedLessons: 6, locked: false },
  { id: "t2", title: "تحليل بيانات الدارك ويب", description: "فهم بنية الدارك ويب وكيفية تتبع حالات الرصد عبر المنتديات والأسواق", icon: Database, duration: "60 دقيقة", level: "متوسط", progress: 67, lessons: 9, completedLessons: 6, locked: false },
  { id: "t3", title: "تصنيف البيانات الشخصية (PII)", description: "تعلم تصنيف أنواع البيانات الشخصية وفقاً لنظام PDPL", icon: FileSearch, duration: "30 دقيقة", level: "مبتدئ", progress: 100, lessons: 4, completedLessons: 4, locked: false },
  { id: "t4", title: "استخدام راصد الذكي (AI)", description: "إتقان استخدام المساعد الذكي لتحليل حالات الرصد وإنشاء التقارير", icon: Brain, duration: "90 دقيقة", level: "متقدم", progress: 33, lessons: 12, completedLessons: 4, locked: false },
  { id: "t5", title: "إدارة حالات الرصد والاستجابة", description: "بروتوكولات الاستجابة لحالات الرصد وإدارة دورة حياة حالة الرصد", icon: Shield, duration: "75 دقيقة", level: "متقدم", progress: 0, lessons: 8, completedLessons: 0, locked: false },
  { id: "t6", title: "التحليل الجنائي الرقمي", description: "تقنيات متقدمة في التحليل الجنائي الرقمي وسلسلة الأدلة", icon: Zap, duration: "120 دقيقة", level: "متقدم", progress: 0, lessons: 15, completedLessons: 0, locked: true },
];

const levelColors: Record<string, string> = {
  "مبتدئ": "bg-green-500/10 text-green-500 border-green-500/20",
  "متوسط": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "متقدم": "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function SmartRasidTrainingWidget() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalProgress = Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length);
  const completedModules = modules.filter((m) => m.progress === 100).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl overflow-hidden gold-border-card"
    >
      {/* Header */}
      <div className={`p-5 ${isDark ? 'bg-gradient-to-l from-[#C5A55A]/5 to-transparent' : 'bg-gradient-to-l from-[#1e3a8a]/5 to-transparent'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C5A55A]/10 ring-1 ring-[#C5A55A]/20' : 'bg-[#1e3a8a]/10 ring-1 ring-[#1e3a8a]/20'}`}>
              <GraduationCap className={`w-6 h-6 ${isDark ? 'text-[#C5A55A]' : 'text-[#1e3a8a]'}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold">المركز التدريبي لراصد الذكي</h2>
              <p className="text-xs text-muted-foreground">تطوير مهاراتك في رصد وتحليل حالات الرصد</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalProgress}%</div>
              <div className="text-[10px] text-muted-foreground">التقدم الكلي</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Award className={`w-4 h-4 ${isDark ? 'text-[#C5A55A]' : 'text-[#1e3a8a]'}`} />
                <span className="text-lg font-bold">{completedModules}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">مكتمل</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full ${isDark ? 'bg-gradient-to-r from-[#C5A55A] to-[#D4AF37]' : 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]'}`}
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((mod, idx) => {
          const ModIcon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                mod.locked
                  ? "opacity-50 border-border/30"
                  : mod.progress === 100
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-border/50 hover:border-primary/30 bg-muted/20 hover:bg-muted/40"
              }`}
              onClick={() => {
                if (mod.locked) {
                  toast.info("يجب إكمال الوحدات السابقة أولاً");
                } else {
                  toast.info(`فتح الوحدة: ${mod.title} — قريباً`);
                }
              }}
            >
              {mod.locked && (
                <div className="absolute top-2 left-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  mod.progress === 100
                    ? "bg-emerald-500/10"
                    : isDark ? "bg-[#C5A55A]/10" : "bg-[#1e3a8a]/10"
                }`}>
                  <ModIcon className={`w-4 h-4 ${
                    mod.progress === 100
                      ? "text-emerald-500"
                      : isDark ? "text-[#C5A55A]" : "text-[#1e3a8a]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-0.5 truncate">{mod.title}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{mod.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] py-0 ${levelColors[mod.level]}`}>{mod.level}</Badge>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{mod.duration}</span>
                </div>
                <span>{mod.completedLessons}/{mod.lessons} درس</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    mod.progress === 100
                      ? "bg-emerald-500"
                      : isDark ? "bg-[#C5A55A]" : "bg-[#1e3a8a]"
                  }`}
                  style={{ width: `${mod.progress}%` }}
                />
              </div>
              {mod.progress === 100 && (
                <div className="absolute top-2 left-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
