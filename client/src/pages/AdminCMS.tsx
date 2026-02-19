/**
 * AdminCMS — Content Management System for Rasid Platform
 * Tabs: حالات الرصد | المستخدمين | التقارير | قاعدة المعرفة | الاستيراد | التصدير | سجل العمليات
 */
import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Database, Search, Download, Upload, Eye, Edit3, Trash2,
  CheckCircle, XCircle, Clock, Archive, FileText, Users,
  BarChart3, BookOpen, Settings2, Loader2, Plus, Filter,
  ArrowUpDown, RefreshCw, AlertTriangle, Shield, Send,
  Globe, ChevronDown, X, Check, FileUp, FileDown,
  Zap, Package, Calendar, Hash, MapPin, User, Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─── Publish Status Config ──────────────────────────────────────
const publishStatusConfig = {
  draft: { label: "مسودة", color: "bg-gray-500/20 text-gray-300 border-gray-500/30", icon: Edit3 },
  pending_review: { label: "قيد المراجعة", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30", icon: Clock },
  published: { label: "منشور", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: CheckCircle },
  archived: { label: "مؤرشف", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: Archive },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "واسع النطاق", color: "bg-red-500/20 text-red-300" },
  high: { label: "مرتفع التأثير", color: "bg-orange-500/20 text-orange-300" },
  medium: { label: "متوسط التأثير", color: "bg-yellow-500/20 text-yellow-300" },
  low: { label: "محدود التأثير", color: "bg-blue-500/20 text-blue-300" },
};

const sourceConfig: Record<string, { label: string; icon: any }> = {
  telegram: { label: "تليجرام", icon: Send },
  darkweb: { label: "دارك ويب", icon: Globe },
  paste: { label: "مواقع اللصق", icon: FileText },
};

export default function AdminCMS() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leaks");

  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">إدارة المحتوى</h1>
            <p className="text-sm text-gray-400">إدارة وتحكم كامل في بيانات المنصة</p>
          </div>
        </div>
        <CMSStats />
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-800/50 border border-gray-700/50 p-1 flex flex-wrap gap-1">
          <TabsTrigger value="leaks" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2">
            <Shield className="w-4 h-4" /> حالات الرصد
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2">
            <Users className="w-4 h-4" /> المستخدمين
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2">
            <BarChart3 className="w-4 h-4" /> التقارير
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2">
            <BookOpen className="w-4 h-4" /> قاعدة المعرفة
          </TabsTrigger>
          <TabsTrigger value="import" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2">
            <Upload className="w-4 h-4" /> الاستيراد
          </TabsTrigger>
          <TabsTrigger value="export" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2">
            <Download className="w-4 h-4" /> التصدير
          </TabsTrigger>
          <TabsTrigger value="operations" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white gap-2">
            <Settings2 className="w-4 h-4" /> سجل العمليات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaks"><LeaksTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="reports"><ReportsTab /></TabsContent>
        <TabsContent value="knowledge"><KnowledgeTab /></TabsContent>
        <TabsContent value="import"><ImportTab /></TabsContent>
        <TabsContent value="export"><ExportTab /></TabsContent>
        <TabsContent value="operations"><OperationsTab /></TabsContent>
      </Tabs>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ CMS Stats Component ════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function CMSStats() {
  const { data: stats } = trpc.cms.stats.useQuery();
  if (!stats) return null;

  const items = [
    { label: "إجمالي", value: stats.totalLeaks, color: "text-white" },
    { label: "منشور", value: stats.publishedLeaks, color: "text-emerald-400" },
    { label: "مسودة", value: stats.draftLeaks, color: "text-gray-400" },
    { label: "قيد المراجعة", value: stats.pendingLeaks, color: "text-yellow-400" },
  ];

  return (
    <div className="flex gap-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className={`text-xl font-bold ${item.color}`}>{(item.value ?? 0).toLocaleString()}</div>
          <div className="text-xs text-gray-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Leaks Tab ══════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function LeaksTab() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [publishFilter, setPublishFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingLeak, setEditingLeak] = useState<any>(null);

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.cms.leaks.listAll.useQuery({
    page,
    limit: 50,
    search: search || undefined,
    publishStatus: publishFilter !== "all" ? publishFilter as any : undefined,
    severity: severityFilter !== "all" ? severityFilter : undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
  });

  const updatePublishMutation = trpc.cms.leaks.updatePublishStatus.useMutation({
    onSuccess: () => {
      utils.cms.leaks.listAll.invalidate();
      utils.cms.stats.invalidate();
      setSelectedIds([]);
      toast.success("تم تحديث حالة النشر بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = trpc.cms.leaks.bulkDelete.useMutation({
    onSuccess: () => {
      utils.cms.leaks.listAll.invalidate();
      utils.cms.stats.invalidate();
      setSelectedIds([]);
      toast.success("تم الحذف بنجاح");
    },
    onError: (err) => toast.error(err.message),
  });

  const items = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i: any) => i.id));
    }
  };

  const handleBulkPublish = (status: "draft" | "pending_review" | "published" | "archived") => {
    if (selectedIds.length === 0) return toast.error("اختر سجلات أولاً");
    updatePublishMutation.mutate({ ids: selectedIds, status });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return toast.error("اختر سجلات أولاً");
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.length} سجل؟`)) return;
    deleteMutation.mutate({ ids: selectedIds });
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Filters */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="بحث بالعنوان أو المعرف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-gray-900/50 border-gray-600"
              />
            </div>
            <Select value={publishFilter} onValueChange={setPublishFilter}>
              <SelectTrigger className="w-[160px] bg-gray-900/50 border-gray-600">
                <SelectValue placeholder="حالة النشر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="draft">مسودة</SelectItem>
                <SelectItem value="pending_review">قيد المراجعة</SelectItem>
                <SelectItem value="published">منشور</SelectItem>
                <SelectItem value="archived">مؤرشف</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[160px] bg-gray-900/50 border-gray-600">
                <SelectValue placeholder="الخطورة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="critical">واسع النطاق</SelectItem>
                <SelectItem value="high">مرتفع التأثير</SelectItem>
                <SelectItem value="medium">متوسط التأثير</SelectItem>
                <SelectItem value="low">محدود التأثير</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[140px] bg-gray-900/50 border-gray-600">
                <SelectValue placeholder="المصدر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="telegram">تليجرام</SelectItem>
                <SelectItem value="darkweb">دارك ويب</SelectItem>
                <SelectItem value="paste">مواقع اللصق</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 bg-cyan-900/30 border border-cyan-700/50 rounded-lg"
        >
          <span className="text-cyan-300 text-sm font-medium">
            {selectedIds.length} محدد
          </span>
          <Button size="sm" variant="outline" onClick={() => handleBulkPublish("published")} className="border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/20">
            <CheckCircle className="w-3 h-3 ml-1" /> نشر
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkPublish("draft")} className="border-gray-500/50 text-gray-300 hover:bg-gray-500/20">
            <Edit3 className="w-3 h-3 ml-1" /> مسودة
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleBulkPublish("archived")} className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20">
            <Archive className="w-3 h-3 ml-1" /> أرشفة
          </Button>
          <Button size="sm" variant="outline" onClick={handleBulkDelete} className="border-red-500/50 text-red-300 hover:bg-red-500/20">
            <Trash2 className="w-3 h-3 ml-1" /> حذف
          </Button>
        </motion.div>
      )}

      {/* Table */}
      <Card className="bg-gray-800/50 border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50 bg-gray-900/30">
                <th className="p-3 text-right">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === items.length && items.length > 0}
                    onChange={selectAll}
                    className="rounded border-gray-600"
                  />
                </th>
                <th className="p-3 text-right text-gray-400 font-medium">المعرف</th>
                <th className="p-3 text-right text-gray-400 font-medium">العنوان</th>
                <th className="p-3 text-right text-gray-400 font-medium">المصدر</th>
                <th className="p-3 text-right text-gray-400 font-medium">الخطورة</th>
                <th className="p-3 text-right text-gray-400 font-medium">حالة النشر</th>
                <th className="p-3 text-right text-gray-400 font-medium">العدد المُدّعى</th>
                <th className="p-3 text-right text-gray-400 font-medium">التاريخ</th>
                <th className="p-3 text-right text-gray-400 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-gray-500">
                    لا توجد سجلات
                  </td>
                </tr>
              ) : (
                items.map((leak: any) => {
                  const severity = severityConfig[leak.severity] || severityConfig.medium;
                  const source = sourceConfig[leak.source] || sourceConfig.paste;
                  const publish = publishStatusConfig[leak.publishStatus as keyof typeof publishStatusConfig] || publishStatusConfig.draft;
                  const PublishIcon = publish.icon;

                  return (
                    <tr
                      key={leak.id}
                      className="border-b border-gray-800/50 hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(leak.id)}
                          onChange={() => toggleSelect(leak.id)}
                          className="rounded border-gray-600"
                        />
                      </td>
                      <td className="p-3 text-cyan-400 font-mono text-xs">{leak.leakId}</td>
                      <td className="p-3 text-white max-w-[300px] truncate">{leak.titleAr || leak.title}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-xs gap-1">
                          {source.label}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs ${severity.color}`}>{severity.label}</Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={`text-xs gap-1 ${publish.color}`}>
                          <PublishIcon className="w-3 h-3" />
                          {publish.label}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-300">{(leak.recordCount ?? 0).toLocaleString()}</td>
                      <td className="p-3 text-gray-400 text-xs">
                        {leak.detectedAt ? new Date(leak.detectedAt).toLocaleDateString("ar-SA") : "-"}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0"
                            onClick={() => setEditingLeak(leak)}
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t border-gray-700/50">
            <span className="text-sm text-gray-400">
              {total} سجل — صفحة {page} من {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                السابق
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                التالي
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      {editingLeak && (
        <LeakDetailDialog leak={editingLeak} onClose={() => setEditingLeak(null)} />
      )}
    </div>
  );
}

// ─── Leak Detail Dialog ─────────────────────────────────────────
function LeakDetailDialog({ leak, onClose }: { leak: any; onClose: () => void }) {
  const utils = trpc.useUtils();
  const updateMutation = trpc.cms.leaks.updatePublishStatus.useMutation({
    onSuccess: () => {
      utils.cms.leaks.listAll.invalidate();
      utils.cms.stats.invalidate();
      toast.success("تم التحديث");
      onClose();
    },
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            {leak.titleAr || leak.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">المعرف:</span>
              <span className="text-cyan-400 font-mono mr-2">{leak.leakId}</span>
            </div>
            <div>
              <span className="text-gray-400">المصدر:</span>
              <span className="text-white mr-2">{sourceConfig[leak.source]?.label || leak.source}</span>
            </div>
            <div>
              <span className="text-gray-400">الخطورة:</span>
              <Badge className={`mr-2 text-xs ${severityConfig[leak.severity]?.color}`}>
                {severityConfig[leak.severity]?.label}
              </Badge>
            </div>
            <div>
              <span className="text-gray-400">العدد المُدّعى:</span>
              <span className="text-white mr-2">{(leak.recordCount ?? 0).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">القطاع:</span>
              <span className="text-white mr-2">{leak.sectorAr || leak.sector}</span>
            </div>
            <div>
              <span className="text-gray-400">الحالة:</span>
              <span className="text-white mr-2">{leak.status}</span>
            </div>
          </div>

          {leak.descriptionAr && (
            <div>
              <span className="text-gray-400 text-sm">الوصف:</span>
              <p className="text-gray-300 text-sm mt-1 leading-relaxed">{leak.descriptionAr}</p>
            </div>
          )}

          {leak.aiSummaryAr && (
            <div>
              <span className="text-gray-400 text-sm">ملخص AI:</span>
              <p className="text-gray-300 text-sm mt-1 leading-relaxed">{leak.aiSummaryAr}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => updateMutation.mutate({ ids: [leak.id], status: "published" })}
            className="border-emerald-500/50 text-emerald-300"
            disabled={leak.publishStatus === "published"}
          >
            <CheckCircle className="w-4 h-4 ml-1" /> نشر
          </Button>
          <Button
            variant="outline"
            onClick={() => updateMutation.mutate({ ids: [leak.id], status: "draft" })}
            className="border-gray-500/50 text-gray-300"
            disabled={leak.publishStatus === "draft"}
          >
            <Edit3 className="w-4 h-4 ml-1" /> مسودة
          </Button>
          <Button
            variant="outline"
            onClick={() => updateMutation.mutate({ ids: [leak.id], status: "archived" })}
            className="border-yellow-500/50 text-yellow-300"
            disabled={leak.publishStatus === "archived"}
          >
            <Archive className="w-4 h-4 ml-1" /> أرشفة
          </Button>
          <Button variant="ghost" onClick={onClose}>إغلاق</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Users Tab ══════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function UsersTab() {
  const { data: users, isLoading } = trpc.cms.users.list.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.cms.users.update.useMutation({
    onSuccess: () => {
      utils.cms.users.list.invalidate();
      toast.success("تم تحديث المستخدم");
    },
  });

  const roleLabels: Record<string, string> = {
    root_admin: "المسؤول الأعلى",
    director: "المدير العام",
    vice_president: "نائب الرئيس",
    manager: "مدير قسم",
    analyst: "محلل",
    viewer: "مشاهد",
  };

  const roleColors: Record<string, string> = {
    root_admin: "bg-red-500/20 text-red-300",
    director: "bg-purple-500/20 text-purple-300",
    vice_president: "bg-indigo-500/20 text-indigo-300",
    manager: "bg-blue-500/20 text-blue-300",
    analyst: "bg-cyan-500/20 text-cyan-300",
    viewer: "bg-gray-500/20 text-gray-300",
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 mt-4">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          إدارة المستخدمين
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="p-3 text-right text-gray-400">#</th>
                <th className="p-3 text-right text-gray-400">الاسم</th>
                <th className="p-3 text-right text-gray-400">المعرف</th>
                <th className="p-3 text-right text-gray-400">البريد</th>
                <th className="p-3 text-right text-gray-400">الدور</th>
                <th className="p-3 text-right text-gray-400">الحالة</th>
                <th className="p-3 text-right text-gray-400">آخر دخول</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" /></td></tr>
              ) : (users || []).map((u: any, idx: number) => (
                <tr key={u.id} className="border-b border-gray-800/50 hover:bg-gray-700/20">
                  <td className="p-3 text-gray-500">{idx + 1}</td>
                  <td className="p-3 text-white">{u.displayName || u.name}</td>
                  <td className="p-3 text-cyan-400 font-mono text-xs">{u.userId}</td>
                  <td className="p-3 text-gray-300">{u.email || "-"}</td>
                  <td className="p-3">
                    <Badge className={`text-xs ${roleColors[u.platformRole] || ""}`}>
                      {roleLabels[u.platformRole] || u.platformRole}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge className={u.status === "active" ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"}>
                      {u.status === "active" ? "نشط" : u.status === "inactive" ? "غير نشط" : "موقوف"}
                    </Badge>
                  </td>
                  <td className="p-3 text-gray-400 text-xs">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString("ar-SA") : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Reports Tab ════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function ReportsTab() {
  const { data: reports, isLoading } = trpc.cms.reports.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.cms.reports.delete.useMutation({
    onSuccess: () => {
      utils.cms.reports.list.invalidate();
      toast.success("تم حذف التقرير");
    },
  });

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 mt-4">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          إدارة التقارير
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="p-3 text-right text-gray-400">#</th>
                  <th className="p-3 text-right text-gray-400">العنوان</th>
                  <th className="p-3 text-right text-gray-400">النوع</th>
                  <th className="p-3 text-right text-gray-400">التاريخ</th>
                  <th className="p-3 text-right text-gray-400">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {(reports || []).map((r: any, idx: number) => (
                  <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-700/20">
                    <td className="p-3 text-gray-500">{idx + 1}</td>
                    <td className="p-3 text-white">{r.titleAr || r.title || "تقرير"}</td>
                    <td className="p-3 text-gray-300">{r.type || "-"}</td>
                    <td className="p-3 text-gray-400 text-xs">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("ar-SA") : "-"}
                    </td>
                    <td className="p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-red-400 hover:text-red-300"
                        onClick={() => {
                          if (confirm("حذف هذا التقرير؟")) deleteMutation.mutate({ id: r.id });
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Knowledge Tab ══════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function KnowledgeTab() {
  const { data: entries, isLoading } = trpc.cms.knowledgeBase.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.cms.knowledgeBase.delete.useMutation({
    onSuccess: () => {
      utils.cms.knowledgeBase.list.invalidate();
      toast.success("تم الحذف");
    },
  });

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 mt-4">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          قاعدة المعرفة
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
        ) : (
          <div className="grid gap-3">
            {(entries || []).map((entry: any) => (
              <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
                <div>
                  <h4 className="text-white text-sm font-medium">{entry.title || entry.question || "بدون عنوان"}</h4>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-1">{entry.content || entry.answer || ""}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="outline" className="text-xs">{entry.category || "عام"}</Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-red-400"
                    onClick={() => {
                      if (confirm("حذف هذا العنصر؟")) deleteMutation.mutate({ id: entry.id });
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
            {(entries || []).length === 0 && (
              <p className="text-center text-gray-500 py-8">لا توجد عناصر في قاعدة المعرفة</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Import Tab ═════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function ImportTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const { data: jobs, isLoading } = trpc.cms.import.getJobs.useQuery();
  const utils = trpc.useUtils();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [".zip", ".json", ".xlsx", ".csv"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!allowedTypes.includes(ext)) {
      toast.error("صيغة غير مدعومة. الصيغ المدعومة: ZIP, JSON, XLSX, CSV");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/cms/import/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "فشل الاستيراد");

      setUploadResult(result);
      utils.cms.import.getJobs.invalidate();
      utils.cms.leaks.listAll.invalidate();
      utils.cms.stats.invalidate();
      toast.success(`تم استيراد ${result.successRecords} سجل بنجاح`);
    } catch (err: any) {
      toast.error(err.message || "فشل الاستيراد");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Upload Area */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-gray-600 rounded-xl hover:border-cyan-500/50 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">رفع ملف للاستيراد</h3>
            <p className="text-sm text-gray-400 mb-4">
              الصيغ المدعومة: ZIP (PDPL_Package), JSON, XLSX, CSV — حد أقصى 500 MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.json,.xlsx,.csv"
              onChange={handleUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري الاستيراد...</>
              ) : (
                <><FileUp className="w-4 h-4 ml-2" /> اختر ملف</>
              )}
            </Button>
          </div>

          {/* Upload Result */}
          {uploadResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50"
            >
              <h4 className="text-white font-medium mb-2">نتيجة الاستيراد</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{uploadResult.totalRecords}</div>
                  <div className="text-gray-400">إجمالي</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-400">{uploadResult.successRecords}</div>
                  <div className="text-gray-400">ناجح</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{uploadResult.failedRecords}</div>
                  <div className="text-gray-400">فاشل</div>
                </div>
              </div>
              <p className="text-xs text-yellow-400 mt-3">
                جميع السجلات المستوردة تبدأ كمسودة — يجب نشرها يدوياً من تبويب حالات الرصد
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Import History */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            سجل الاستيراد
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
          ) : (jobs || []).length === 0 ? (
            <p className="text-center text-gray-500 py-4">لا توجد عمليات استيراد سابقة</p>
          ) : (
            <div className="space-y-2">
              {(jobs || []).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-white text-sm">{job.fileName}</span>
                      <div className="text-xs text-gray-400">
                        {job.successRecords}/{job.totalRecords} سجل — {job.importedByName || "Admin"}
                      </div>
                    </div>
                  </div>
                  <Badge className={
                    job.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                    job.status === "failed" ? "bg-red-500/20 text-red-300" :
                    "bg-yellow-500/20 text-yellow-300"
                  }>
                    {job.status === "completed" ? "مكتمل" : job.status === "failed" ? "فشل" : "جاري"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Export Tab ══════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function ExportTab() {
  const [exportType, setExportType] = useState<string>("full_platform");
  const [exportFormat, setExportFormat] = useState<string>("zip");
  const [exportScope, setExportScope] = useState<string>("leaks");

  const { data: jobs, isLoading: jobsLoading } = trpc.cms.export.getJobs.useQuery();
  const utils = trpc.useUtils();

  const exportMutation = trpc.cms.export.start.useMutation({
    onSuccess: (result) => {
      utils.cms.export.getJobs.invalidate();
      toast.success(`تم التصدير — ${result.totalRecords} سجل`);
    },
    onError: (err) => toast.error(err.message),
  });

  const handleExport = () => {
    exportMutation.mutate({
      type: exportType as any,
      format: exportFormat as any,
      scope: exportScope,
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Export Options */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <FileDown className="w-5 h-5 text-cyan-400" />
            تصدير البيانات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">نطاق التصدير</label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger className="bg-gray-900/50 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_platform">كامل المنصة</SelectItem>
                  <SelectItem value="section">قسم معين</SelectItem>
                  <SelectItem value="custom_query">استعلام مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportType !== "full_platform" && (
              <div>
                <label className="text-sm text-gray-400 mb-1 block">القسم</label>
                <Select value={exportScope} onValueChange={setExportScope}>
                  <SelectTrigger className="bg-gray-900/50 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="leaks">حالات الرصد</SelectItem>
                    <SelectItem value="users">المستخدمين</SelectItem>
                    <SelectItem value="reports">التقارير</SelectItem>
                    <SelectItem value="audit">سجل التدقيق</SelectItem>
                    <SelectItem value="knowledge_base">قاعدة المعرفة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm text-gray-400 mb-1 block">الصيغة</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger className="bg-gray-900/50 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zip">ZIP</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleExport}
            disabled={exportMutation.isPending}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {exportMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin ml-2" /> جاري التصدير...</>
            ) : (
              <><Download className="w-4 h-4 ml-2" /> بدء التصدير</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Export History */}
      <Card className="bg-gray-800/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            سجل التصدير
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>
          ) : (jobs || []).length === 0 ? (
            <p className="text-center text-gray-500 py-4">لا توجد عمليات تصدير سابقة</p>
          ) : (
            <div className="space-y-2">
              {(jobs || []).map((job: any) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileDown className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-white text-sm">
                        {job.exportType === "full_platform" ? "تصدير كامل" : `تصدير ${job.scope || "قسم"}`}
                      </span>
                      <div className="text-xs text-gray-400">
                        {job.totalRecords} سجل — {job.exportFormat?.toUpperCase()} — {job.exportedByName || "Admin"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.fileUrl && job.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => window.open(job.fileUrl, "_blank")}
                      >
                        <Download className="w-3 h-3 ml-1" /> تحميل
                      </Button>
                    )}
                    <Badge className={
                      job.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                      job.status === "failed" ? "bg-red-500/20 text-red-300" :
                      "bg-yellow-500/20 text-yellow-300"
                    }>
                      {job.status === "completed" ? "مكتمل" : job.status === "failed" ? "فشل" : "جاري"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ═══ Operations Log Tab ═════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
function OperationsTab() {
  const { data: importJobs } = trpc.cms.import.getJobs.useQuery();
  const { data: exportJobs } = trpc.cms.export.getJobs.useQuery();

  const allOps = useMemo(() => {
    const ops: Array<{ type: string; date: string; details: string; status: string }> = [];

    (importJobs || []).forEach((j: any) => {
      ops.push({
        type: "استيراد",
        date: j.createdAt || "",
        details: `${j.fileName} — ${j.successRecords}/${j.totalRecords} سجل`,
        status: j.status,
      });
    });

    (exportJobs || []).forEach((j: any) => {
      ops.push({
        type: "تصدير",
        date: j.createdAt || "",
        details: `${j.exportType} — ${j.totalRecords} سجل — ${j.exportFormat}`,
        status: j.status,
      });
    });

    return ops.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [importJobs, exportJobs]);

  return (
    <Card className="bg-gray-800/50 border-gray-700/50 mt-4">
      <CardHeader>
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <Settings2 className="w-5 h-5 text-cyan-400" />
          سجل العمليات
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allOps.length === 0 ? (
          <p className="text-center text-gray-500 py-8">لا توجد عمليات مسجلة</p>
        ) : (
          <div className="space-y-2">
            {allOps.map((op, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  {op.type === "استيراد" ? (
                    <Upload className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Download className="w-5 h-5 text-emerald-400" />
                  )}
                  <div>
                    <span className="text-white text-sm">{op.type}</span>
                    <div className="text-xs text-gray-400">{op.details}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {op.date ? new Date(op.date).toLocaleDateString("ar-SA") : "-"}
                  </span>
                  <Badge className={
                    op.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                    op.status === "failed" ? "bg-red-500/20 text-red-300" :
                    "bg-yellow-500/20 text-yellow-300"
                  }>
                    {op.status === "completed" ? "مكتمل" : op.status === "failed" ? "فشل" : "جاري"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
