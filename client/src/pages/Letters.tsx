import { trpc } from "@/lib/trpc";
import DrillDownModal, { useDrillDown } from "@/components/DrillDownModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Mail, Send, Clock, CheckCircle, AlertTriangle, FileText, Eye, Loader2,
  Calendar, StickyNote, ArrowUpCircle, Timer, BarChart3, XCircle,
  MessageSquare, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const statusLabels: Record<string, string> = {
  draft: "مسودة",
  sent: "مُرسل",
  delivered: "تم التسليم",
  read: "مقروء",
  responded: "تم الرد",
  escalated: "مُصعّد",
};

const statusIcons: Record<string, any> = {
  draft: FileText,
  sent: Send,
  delivered: CheckCircle,
  read: Eye,
  responded: MessageSquare,
  escalated: AlertTriangle,
};

const statusBadgeClass: Record<string, string> = {
  draft: "text-zinc-500 border-zinc-500/30 bg-zinc-500/10",
  sent: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  delivered: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
  read: "text-blue-800 border-blue-800/30 bg-blue-800/10",
  responded: "text-primary border-primary/30 bg-primary/10",
  escalated: "text-red-500 border-red-500/30 bg-red-500/10",
};

export default function Letters() {
  const { playClick, playHover } = useSoundEffects();
  const { open: drillOpen, setOpen: setDrillOpen, filter: drillFilter, openDrillDown } = useDrillDown();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeadlineDialog, setShowDeadlineDialog] = useState(false);
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState("");
  const [notesText, setNotesText] = useState("");
  const [targetLetterId, setTargetLetterId] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.letters.list.useQuery({
    page,
    limit: 20,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const stats = trpc.letters.stats.useQuery();
  const overdueLetters = trpc.letters.overdue.useQuery();

  const sendLetter = trpc.letters.sendLetter.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الخطاب بنجاح");
      setShowPreview(false);
      refetch();
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const updateStatus = trpc.letters.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الحالة");
      refetch();
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const setDeadline = trpc.letters.setDeadline.useMutation({
    onSuccess: () => {
      toast.success("تم تحديد الموعد النهائي");
      setShowDeadlineDialog(false);
      refetch();
      overdueLetters.refetch();
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const addNotes = trpc.letters.addNotes.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الملاحظات");
      setShowNotesDialog(false);
      refetch();
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const escalateLetter = trpc.letters.escalate.useMutation({
    onSuccess: () => {
      toast.success("تم تصعيد الخطاب");
      refetch();
      stats.refetch();
    },
    onError: (err) => toast.error(`خطأ: ${err.message}`),
  });

  const handleViewLetter = (letter: any) => {
    setSelectedLetter(letter);
    setShowPreview(true);
  };

  const handleSend = (id: number) => {
    sendLetter.mutate({ id });
  };

  const openDeadlineDialog = (id: number) => {
    setTargetLetterId(id);
    setDeadlineDate("");
    setShowDeadlineDialog(true);
  };

  const openNotesDialog = (id: number, existingNotes?: string) => {
    setTargetLetterId(id);
    setNotesText(existingNotes || "");
    setShowNotesDialog(true);
  };

  const handleSetDeadline = () => {
    if (!targetLetterId || !deadlineDate) return;
    setDeadline.mutate({ id: targetLetterId, deadline: new Date(deadlineDate) });
  };

  const handleAddNotes = () => {
    if (!targetLetterId) return;
    addNotes.mutate({ id: targetLetterId, notes: notesText });
  };

  const isOverdue = (letter: any) => {
    if (!letter.deadline || letter.status === "responded") return false;
    return new Date(letter.deadline) < new Date();
  };

  const daysUntilDeadline = (letter: any) => {
    if (!letter.deadline) return null;
    const diff = new Date(letter.deadline).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">الخطابات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            مركز إدارة الخطابات والمراسلات مع المواقع - تتبع الحالة والمواعيد النهائية
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats.data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 stagger-children">
          {[
            { label: "الإجمالي", value: stats.data.total, icon: Mail, color: "text-foreground", bg: "bg-muted/50" },
            { label: "مسودات", value: stats.data.draft, icon: FileText, color: "text-zinc-500", bg: "bg-zinc-500/10" },
            { label: "مُرسلة", value: stats.data.sent, icon: Send, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "تم التسليم", value: stats.data.delivered, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "تم الرد", value: stats.data.responded, icon: MessageSquare, color: "text-primary", bg: "bg-primary/10" },
            { label: "مُصعّدة", value: stats.data.escalated, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "متأخرة", value: stats.data.overdue, icon: Timer, color: "text-orange-500", bg: "bg-orange-500/10" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
              >
                <Card className="glass-card gold-sweep cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs sm:text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {/* Overdue Alert Banner */}
      {overdueLetters.data && overdueLetters.data.length > 0 && (
        <div
          className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <Timer className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-orange-400">
                {overdueLetters.data.length} خطاب متأخر عن الموعد النهائي
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                يرجى مراجعة الخطابات المتأخرة واتخاذ الإجراء المناسب (تصعيد أو إعادة إرسال)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="all">الكل</TabsTrigger>
          <TabsTrigger value="draft">مسودات</TabsTrigger>
          <TabsTrigger value="sent">مُرسلة</TabsTrigger>
          <TabsTrigger value="delivered">تم التسليم</TabsTrigger>
          <TabsTrigger value="responded">تم الرد</TabsTrigger>
          <TabsTrigger value="escalated">مُصعّدة</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Letters Table */}
      <Card className="glass-card gold-sweep cursor-pointer hover:shadow-lg hover:scale-[1.01] transition-all">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-3 sm:p-8 text-center text-muted-foreground">جاري التحميل...</div>
          ) : data?.letters?.length === 0 ? (
            <div className="p-4 sm:p-12 text-center">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">لا توجد خطابات</h3>
              <p className="text-sm text-muted-foreground">
                يمكنك إنشاء خطابات جديدة من صفحة تفاصيل الموقع عبر زر "إنشاء خطاب"
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[rgba(197,165,90,0.12)] bg-[rgba(197,165,90,0.04)]">
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">#</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">البريد</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">الموضوع</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">الموعد النهائي</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">التاريخ</th>
                      <th className="text-end py-3 px-4 font-medium text-muted-foreground">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.letters?.map((letter: any, idx: number) => {
                      const StatusIcon = statusIcons[letter.status || "draft"] || FileText;
                      const badgeClass = statusBadgeClass[letter.status || "draft"] || "";
                      const overdue = isOverdue(letter);
                      const daysLeft = daysUntilDeadline(letter);
                      return (
                        <tr
                          key={letter.id}
                          className={`border-b border-border/30 hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200 ${overdue ? "bg-orange-500/5" : ""}`}
                        >
                          <td className="py-3 px-4 text-muted-foreground">
                            {(page - 1) * 20 + idx + 1}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {letter.recipientEmail || "-"}
                          </td>
                          <td className="py-3 px-4 truncate max-w-[200px]">
                            {letter.subject || "-"}
                            {letter.notes && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <StickyNote className="h-3 w-3 text-amber-500" />
                                <span className="text-xs sm:text-[10px] text-amber-500 truncate">{letter.notes}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className={`gap-1 ${badgeClass}`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusLabels[letter.status || "draft"] || letter.status}
                            </Badge>
                            {letter.escalationLevel > 0 && (
                              <Badge variant="outline" className="text-[9px] me-1 text-red-500 border-red-500/30">
                                مستوى {letter.escalationLevel}
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {letter.deadline ? (
                              <div className={`text-xs ${overdue ? "text-orange-500 font-bold" : daysLeft !== null && daysLeft <= 3 ? "text-amber-500" : "text-muted-foreground"}`}>
                                <div className="flex items-center gap-1">
                                  {overdue ? <Timer className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                                  {new Date(letter.deadline).toLocaleDateString("ar-SA-u-nu-latn")}
                                </div>
                                {overdue && <span className="text-xs sm:text-[10px]">متأخر</span>}
                                {!overdue && daysLeft !== null && daysLeft <= 7 && (
                                  <span className="text-xs sm:text-[10px]">باقي {daysLeft} يوم</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground text-xs">
                            {letter.createdAt
                              ? new Date(letter.createdAt).toLocaleDateString("ar-SA-u-nu-latn")
                              : "-"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={() => { handleViewLetter(letter); openDrillDown({ title: letter.subject || 'تفاصيل الخطاب', subtitle: `الموقع: ${letter.siteName || ''}`, status: letter.status || '' }); }}
                                title="معاينة"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              {letter.status === "draft" && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-blue-500 hover:text-blue-400"
                                  onClick={() => handleSend(letter.id)}
                                  disabled={sendLetter.isPending}
                                  title="إرسال"
                                >
                                  {sendLetter.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Send className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-amber-500 hover:text-amber-400"
                                onClick={() => openDeadlineDialog(letter.id)}
                                title="تحديد موعد نهائي"
                              >
                                <Calendar className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-primary hover:text-primary"
                                onClick={() => openNotesDialog(letter.id, letter.notes)}
                                title="ملاحظات"
                              >
                                <StickyNote className="h-3.5 w-3.5" />
                              </Button>
                              {(letter.status === "sent" || letter.status === "delivered") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-400"
                                  onClick={() => escalateLetter.mutate({ id: letter.id })}
                                  disabled={escalateLetter.isPending}
                                  title="تصعيد"
                                >
                                  <ArrowUpCircle className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data && data.total > 20 && (
                <div className="flex justify-center gap-2 p-4 border-t border-[rgba(197,165,90,0.10)]/30">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                    السابق
                  </Button>
                  <span className="flex items-center text-sm text-muted-foreground px-3">
                    صفحة {page} من {Math.ceil(data.total / 20)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= data.total}
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Letter Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">معاينة الخطاب</DialogTitle>
          </DialogHeader>
          {selectedLetter && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm stagger-children">
                <div>
                  <span className="text-muted-foreground">إلى:</span>
                  <span className="me-2 font-medium">{selectedLetter.recipientEmail || "-"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge
                    variant="outline"
                    className={`me-2 gap-1 ${statusBadgeClass[selectedLetter.status || "draft"] || ""}`}
                  >
                    {statusLabels[selectedLetter.status || "draft"]}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">الموضوع:</span>
                  <span className="me-2 font-medium">{selectedLetter.subject}</span>
                </div>
                {selectedLetter.deadline && (
                  <div>
                    <span className="text-muted-foreground">الموعد النهائي:</span>
                    <span className={`me-2 font-medium ${isOverdue(selectedLetter) ? "text-orange-500" : ""}`}>
                      {new Date(selectedLetter.deadline).toLocaleDateString("ar-SA-u-nu-latn")}
                      {isOverdue(selectedLetter) && " (متأخر)"}
                    </span>
                  </div>
                )}
                {selectedLetter.escalationLevel > 0 && (
                  <div>
                    <span className="text-muted-foreground">مستوى التصعيد:</span>
                    <Badge variant="outline" className="me-2 text-red-500 border-red-500/30">
                      المستوى {selectedLetter.escalationLevel}
                    </Badge>
                  </div>
                )}
              </div>

              {selectedLetter.notes && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <StickyNote className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-amber-400">ملاحظات</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedLetter.notes}</p>
                </div>
              )}

              <div className="border border-border/50 rounded-lg p-4 bg-muted/20">
                <pre className="whitespace-pre-wrap text-sm leading-7 font-[Tajawal]">
                  {selectedLetter.body}
                </pre>
              </div>

              {selectedLetter.sentAt && (
                <div className="text-xs text-muted-foreground">
                  تاريخ الإرسال: {new Date(selectedLetter.sentAt).toLocaleDateString("ar-SA-u-nu-latn")}
                </div>
              )}
              {selectedLetter.respondedAt && (
                <div className="text-xs text-muted-foreground">
                  تاريخ الرد: {new Date(selectedLetter.respondedAt).toLocaleDateString("ar-SA-u-nu-latn")}
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {selectedLetter?.status === "draft" && (
              <Button
                onClick={() => handleSend(selectedLetter.id)}
                disabled={sendLetter.isPending}
                className="gap-2"
              >
                {sendLetter.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                إرسال الخطاب
              </Button>
            )}
            {(selectedLetter?.status === "sent" || selectedLetter?.status === "delivered") && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    updateStatus.mutate({ id: selectedLetter.id, status: "responded" });
                    setShowPreview(false);
                  }}
                  className="gap-2 text-emerald-500"
                >
                  <CheckCircle className="h-4 w-4" />
                  تم الرد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    escalateLetter.mutate({ id: selectedLetter.id });
                    setShowPreview(false);
                  }}
                  className="gap-2 text-red-500"
                >
                  <ArrowUpCircle className="h-4 w-4" />
                  تصعيد
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deadline Dialog */}
      <Dialog open={showDeadlineDialog} onOpenChange={setShowDeadlineDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              تحديد الموعد النهائي
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              حدد الموعد النهائي للرد على هذا الخطاب. سيتم تنبيهك عند اقتراب الموعد.
            </p>
            <Input
              type="date"
              value={deadlineDate}
              onChange={(e) => setDeadlineDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="text-center"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleSetDeadline}
              disabled={!deadlineDate || setDeadline.isPending}
              className="gap-2"
            >
              {setDeadline.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              تحديد
            </Button>
            <Button variant="outline" onClick={() => setShowDeadlineDialog(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-primary" />
              ملاحظات الخطاب
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={notesText}
              onChange={(e) => setNotesText(e.target.value)}
              placeholder="أضف ملاحظاتك هنا..."
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={handleAddNotes}
              disabled={addNotes.isPending}
              className="gap-2"
            >
              {addNotes.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <StickyNote className="h-4 w-4" />}
              حفظ
            </Button>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DrillDownModal open={drillOpen} onOpenChange={setDrillOpen} filter={drillFilter} />
    </div>
  );
}
