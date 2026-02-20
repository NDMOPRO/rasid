/**
 * Admin Audit Log — Track all administrative changes with rollback support
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ScrollText, Search, Filter, RotateCcw, Loader2, Clock, User, ChevronDown, ChevronUp,
  Shield, Layers, ToggleLeft, Palette, Menu as MenuIcon, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

const ACTION_LABELS: Record<string, string> = {
  "role.create": "إنشاء دور",
  "role.update": "تعديل دور",
  "role.delete": "حذف دور",
  "role.setPermissions": "تعيين صلاحيات",
  "group.create": "إنشاء مجموعة",
  "group.delete": "حذف مجموعة",
  "group.addMember": "إضافة عضو",
  "group.removeMember": "إزالة عضو",
  "featureFlag.create": "إنشاء مفتاح ميزة",
  "featureFlag.enable": "تفعيل ميزة",
  "featureFlag.disable": "تعطيل ميزة",
  "theme.update": "تعديل المظهر",
  "menu.create": "إنشاء قائمة",
  "menu.update": "تعديل قائمة",
  "menu.delete": "حذف قائمة",
  "seed": "تهيئة بيانات",
};

const RESOURCE_ICONS: Record<string, typeof Shield> = {
  role: Shield,
  group: Layers,
  feature_flag: ToggleLeft,
  theme: Palette,
  menu: MenuIcon,
  system: AlertTriangle,
};

export default function AdminAuditLog() {
  const utils = trpc.useUtils();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [resourceFilter, setResourceFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rollbackDialog, setRollbackDialog] = useState<any>(null);

  const { data, isLoading } = trpc.admin.auditLogs.list.useQuery({
    limit: 50,
    offset: (page - 1) * 50,
    resourceType: resourceFilter !== "all" ? resourceFilter : undefined,
  });

  const rollbackMutation = trpc.admin.auditLogs.rollback.useMutation({
    onSuccess: () => {
      toast.success("تم التراجع عن العملية بنجاح");
      setRollbackDialog(null);
      utils.admin.auditLogs.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const logs: any[] = Array.isArray(data) ? data : (data as any)?.logs ?? [];
  const totalPages = Math.ceil(logs.length / 50) || 1;

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-amber-400" />
          سجل تدقيق الإدارة
        </h1>
        <p className="text-muted-foreground text-sm mt-1">تتبع جميع التغييرات الإدارية مع إمكانية التراجع</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="بحث في السجل..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="pr-10" />
        </div>
        <Select value={resourceFilter} onValueChange={(v) => { setResourceFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="role">الأدوار</SelectItem>
            <SelectItem value="group">المجموعات</SelectItem>
            <SelectItem value="feature_flag">مفاتيح الميزات</SelectItem>
            <SelectItem value="theme">المظهر</SelectItem>
            <SelectItem value="menu">القوائم</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log Entries */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : logs.length === 0 ? (
        <Card className="border border-dashed border-border/50">
          <CardContent className="p-4 sm:p-12 text-center text-muted-foreground">
            <ScrollText className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p>لا توجد سجلات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log: any, i: number) => {
            const Icon = RESOURCE_ICONS[log.resourceType] ?? Shield;
            const isExpanded = expandedId === log.id;
            return (
              <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.01 }}>
                <Card className="border border-border/30 hover:border-border/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                      <div className="p-2 rounded-lg bg-muted/50 mt-0.5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">
                            {ACTION_LABELS[log.action] ?? log.action}
                          </span>
                          {log.resourceName && (
                            <Badge variant="outline" className="text-xs sm:text-[10px]">{log.resourceName}</Badge>
                          )}
                          <Badge variant="secondary" className="text-xs sm:text-[10px]">{log.resourceType}</Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" /> {log.userName ?? "النظام"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatDate(log.createdAt)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.isRollbackable && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-400 hover:text-amber-300 gap-1 text-xs"
                            onClick={(e) => { e.stopPropagation(); setRollbackDialog(log); }}
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> تراجع
                          </Button>
                        )}
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 pt-3 border-t border-border/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {log.oldValue && (
                            <div>
                              <p className="font-semibold text-red-400 mb-1">القيمة السابقة</p>
                              <pre className="bg-muted/30 p-2 rounded text-muted-foreground overflow-auto max-h-40 text-xs sm:text-[10px]">
                                {JSON.stringify(log.oldValue, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newValue && (
                            <div>
                              <p className="font-semibold text-green-400 mb-1">القيمة الجديدة</p>
                              <pre className="bg-muted/30 p-2 rounded text-muted-foreground overflow-auto max-h-40 text-xs sm:text-[10px]">
                                {JSON.stringify(log.newValue, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                        {log.reason && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            <strong>السبب:</strong> {log.reason}
                          </p>
                        )}
                        {log.ipAddress && (
                          <p className="mt-1 text-xs sm:text-[10px] text-muted-foreground/60">IP: {log.ipAddress}</p>
                        )}
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>السابق</Button>
          <span className="text-sm text-muted-foreground">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>التالي</Button>
        </div>
      )}

      {/* Rollback Confirmation Dialog */}
      <Dialog open={!!rollbackDialog} onOpenChange={(open) => !open && setRollbackDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-400">
              <RotateCcw className="w-5 h-5" /> تأكيد التراجع
            </DialogTitle>
          </DialogHeader>
          {rollbackDialog && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                هل أنت متأكد من التراجع عن العملية التالية؟
              </p>
              <Card className="border border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-3 text-sm">
                  <p><strong>العملية:</strong> {ACTION_LABELS[rollbackDialog.action] ?? rollbackDialog.action}</p>
                  <p><strong>المورد:</strong> {rollbackDialog.resourceName}</p>
                  <p><strong>التاريخ:</strong> {formatDate(rollbackDialog.createdAt)}</p>
                </CardContent>
              </Card>
              <p className="text-xs text-amber-400">⚠️ سيتم استعادة القيمة السابقة وتسجيل عملية التراجع في السجل</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRollbackDialog(null)}>إلغاء</Button>
            <Button variant="destructive" onClick={() => rollbackMutation.mutate({ logId: rollbackDialog.id })} disabled={rollbackMutation.isPending}>
              {rollbackMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد التراجع"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}
