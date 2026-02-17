/**
 * ReportApproval — صفحة المصادقة على التقارير
 * تتيح للمسؤولين مراجعة التقارير والمصادقة عليها أو رفضها
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck, FileX, Clock, CheckCircle2, XCircle, Eye, Download,
  Search, ChevronDown, ChevronUp, User, Calendar, FileText,
  Shield, AlertTriangle, Stamp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useNdmoAuth } from "@/hooks/useNdmoAuth";
import { toast } from "sonner";

type ApprovalStatus = "pending" | "approved" | "rejected" | "all";

interface ReportItem {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  author: string;
  status: "pending" | "approved" | "rejected";
  priority: "critical" | "high" | "medium" | "low";
  summary: string;
  leakCount: number;
  affectedEntities: number;
}

const mockReports: ReportItem[] = [
  { id: "RPT-2026-001", title: "تقرير حالات رصد القطاع المالي - يناير 2026", type: "شهري", createdAt: "2026-01-28", author: "msarhan", status: "pending", priority: "critical", summary: "تقرير شامل يغطي 23 حالة رصد في القطاع المالي خلال شهر يناير، بما في ذلك 3 حوادث عالية الأهمية تتعلق ببيانات بطاقات ائتمانية.", leakCount: 23, affectedEntities: 8 },
  { id: "RPT-2026-002", title: "تقرير الرصد الأسبوعي - الأسبوع 4", type: "أسبوعي", createdAt: "2026-01-25", author: "malmoutaz", status: "pending", priority: "high", summary: "رصد 15 حادثة جديدة على الدارك ويب تتضمن بيانات شخصية لمواطنين سعوديين، منها 5 حوادث تتعلق ببيانات صحية.", leakCount: 15, affectedEntities: 5 },
  { id: "RPT-2026-003", title: "تقرير تحليل أنماط التهديدات - Q4 2025", type: "ربع سنوي", createdAt: "2026-01-15", author: "aalrebdi", status: "approved", priority: "medium", summary: "تحليل معمق لأنماط التهديدات خلال الربع الرابع من 2025، يكشف عن ارتفاع بنسبة 34% في استهداف القطاع الصحي.", leakCount: 67, affectedEntities: 22 },
  { id: "RPT-2026-004", title: "تقرير الامتثال لنظام PDPL - ديسمبر", type: "شهري", createdAt: "2026-01-10", author: "msarhan", status: "approved", priority: "high", summary: "تقييم مستوى الامتثال لنظام حماية البيانات الشخصية لدى 45 جهة حكومية، مع توصيات تحسين لـ 12 جهة.", leakCount: 0, affectedEntities: 45 },
  { id: "RPT-2026-005", title: "تقرير حادثة طوارئ - حالة رصد بيانات صحية", type: "طوارئ", createdAt: "2026-01-08", author: "aalrebdi", status: "rejected", priority: "critical", summary: "تقرير طوارئ حول حالة رصد بيانات 50,000 سجل صحي. تم رفض التقرير لعدم اكتمال تحليل الأثر وطلب إعادة المراجعة.", leakCount: 1, affectedEntities: 3 },
  { id: "RPT-2026-006", title: "تقرير رصد تليجرام - يناير", type: "شهري", createdAt: "2026-01-30", author: "malmoutaz", status: "pending", priority: "medium", summary: "رصد 42 قناة تليجرام نشطة في تداول بيانات شخصية سعودية، مع تحديد 8 قنوات جديدة خلال الشهر.", leakCount: 42, affectedEntities: 12 },
];

const priorityConfig = {
  critical: { label: "عالي الأهمية", color: "bg-red-500/10 text-red-500 border-red-500/20", dot: "bg-red-500" },
  high: { label: "عالي", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", dot: "bg-orange-500" },
  medium: { label: "متوسط", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", dot: "bg-yellow-500" },
  low: { label: "منخفض", color: "bg-green-500/10 text-green-500 border-green-500/20", dot: "bg-green-500" },
};

const statusConfig = {
  pending: { label: "بانتظار المصادقة", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
  approved: { label: "تمت المصادقة", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
  rejected: { label: "مرفوض", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
};

export default function ReportApproval() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [filter, setFilter] = useState<ApprovalStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [reports, setReports] = useState(mockReports);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState<string | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return r.title.includes(q) || r.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [reports, filter, searchQuery]);

  const stats = useMemo(() => ({
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    approved: reports.filter((r) => r.status === "approved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
  }), [reports]);

  const handleApprove = (id: string) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" as const } : r));
    toast.success("تمت المصادقة على التقرير بنجاح");
  };

  const handleReject = (id: string) => {
    setReports((prev) => prev.map((r) => r.id === id ? { ...r, status: "rejected" as const } : r));
    setShowRejectDialog(null);
    setRejectReason("");
    toast.error("تم رفض التقرير");
  };

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C5A55A]/10' : 'bg-[#1e3a8a]/10'}`}>
              <Stamp className={`w-6 h-6 ${isDark ? 'text-[#C5A55A]' : 'text-[#1e3a8a]'}`} />
            </div>
            المصادقة على التقارير
          </h1>
          <p className="text-muted-foreground text-sm mt-1">مراجعة التقارير والمصادقة عليها أو إعادتها للمراجعة</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "إجمالي التقارير", value: stats.total, icon: FileText, color: isDark ? "text-blue-400" : "text-blue-600" },
          { label: "بانتظار المصادقة", value: stats.pending, icon: Clock, color: "text-amber-500" },
          { label: "تمت المصادقة", value: stats.approved, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "مرفوض", value: stats.rejected, icon: XCircle, color: "text-red-500" },
        ].map((stat, i) => {
          const SIcon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-4 gold-border-card"
            >
              <div className="flex items-center justify-between mb-2">
                <SIcon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-2xl font-bold">{stat.value}</span>
              </div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث في التقارير..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pr-10 pl-4 rounded-lg border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          {(["all", "pending", "approved", "rejected"] as ApprovalStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === s
                  ? isDark ? "bg-[#C5A55A]/20 text-[#C5A55A] border border-[#C5A55A]/30" : "bg-[#1e3a8a]/10 text-[#1e3a8a] border border-[#1e3a8a]/20"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "all" ? "الكل" : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-3">
        {filteredReports.map((report, idx) => {
          const isExpanded = expandedReport === report.id;
          const statusCfg = statusConfig[report.status];
          const priorityCfg = priorityConfig[report.priority];
          const StatusIcon = statusCfg.icon;

          return (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card rounded-xl overflow-hidden gold-border-card"
            >
              <div
                className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedReport(isExpanded ? null : report.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="text-xs font-mono text-muted-foreground">{report.id}</span>
                      <Badge variant="outline" className={`text-[10px] ${priorityCfg.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot} mr-1`} />
                        {priorityCfg.label}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${statusCfg.bg} ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusCfg.label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{report.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{report.author}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{report.createdAt}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" />{report.type}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-border/50 pt-4">
                      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{report.summary}</p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-muted/30">
                          <span className="text-xs text-muted-foreground">عدد حالات الرصد</span>
                          <p className="text-lg font-bold">{report.leakCount}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/30">
                          <span className="text-xs text-muted-foreground">الجهات المتأثرة</span>
                          <p className="text-lg font-bold">{report.affectedEntities}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        {report.status === "pending" && (
                          <>
                            <Button size="sm" onClick={() => handleApprove(report.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                              <FileCheck className="w-4 h-4" /> مصادقة
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowRejectDialog(report.id)} className="text-red-500 border-red-500/30 hover:bg-red-500/10 gap-2">
                              <FileX className="w-4 h-4" /> رفض
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.info("عرض التقرير الكامل - قريباً")}>
                          <Eye className="w-4 h-4" /> عرض التقرير
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => toast.info("تحميل التقرير - قريباً")}>
                          <Download className="w-4 h-4" /> تحميل
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>لا توجد تقارير مطابقة للفلتر المحدد</p>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <AnimatePresence>
        {showRejectDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRejectDialog(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                رفض التقرير
              </h3>
              <p className="text-sm text-muted-foreground mb-4">يرجى إدخال سبب الرفض لإعلام كاتب التقرير</p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="سبب الرفض..."
                className="w-full h-24 p-3 rounded-lg border border-border bg-background text-sm resize-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
              />
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={() => setShowRejectDialog(null)}>إلغاء</Button>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleReject(showRejectDialog)}>تأكيد الرفض</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
