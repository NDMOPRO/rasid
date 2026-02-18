import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const paymentStatuses = ["pending", "paid", "overdue", "cancelled"];
const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  paid: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  overdue: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

const categories = [
  "Rent Collection", "Commission", "Maintenance", "Utilities", "Cleaning",
  "FFE Purchase", "Marketing", "Insurance", "Legal Fees", "Staff Salary",
  "Platform Fees", "Security Deposit", "Refund", "Other",
];

export default function Financials() {
  const { t, lang } = useI18n();
  const [showCreate, setShowCreate] = useState(false);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: transactions, isLoading, refetch } = trpc.finance.list.useQuery({
    type: typeFilter || undefined, status: statusFilter || undefined,
  });
  const { data: summary } = trpc.finance.summary.useQuery();

  const createMutation = trpc.finance.create.useMutation({
    onSuccess: () => { toast.success(lang === "ar" ? "تم تسجيل المعاملة" : "Transaction recorded"); setShowCreate(false); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    transactionType: "revenue" as const, category: "Rent Collection",
    amount: "", description: "", transactionDate: new Date().toISOString().split("T")[0],
    paymentStatus: "pending" as const, paymentMethod: "", referenceNumber: "",
  });

  const totalRevenue = parseFloat(summary?.totalRevenue || "0");
  const totalExpenses = parseFloat(summary?.totalExpenses || "0");
  const netIncome = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("finance.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("finance.subtitle")}</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 me-2" />{t("finance.recordTransaction")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t("finance.recordTransaction")}</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("finance.type")}</Label>
                  <Select value={form.transactionType} onValueChange={v => setForm(f => ({...f, transactionType: v as any}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">{t("finance.revenue")}</SelectItem>
                      <SelectItem value="expense">{t("finance.expense")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("finance.category")}</Label>
                  <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>{t("finance.amount")} (SAR) *</Label><Input value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="5000" /></div>
                <div className="space-y-2"><Label>{t("finance.date")} *</Label><Input type="date" value={form.transactionDate} onChange={e => setForm(f => ({...f, transactionDate: e.target.value}))} /></div>
              </div>
              <div className="space-y-2"><Label>{t("finance.description")}</Label><Input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t("finance.paymentStatus")}</Label>
                  <Select value={form.paymentStatus} onValueChange={v => setForm(f => ({...f, paymentStatus: v as any}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{paymentStatuses.map(s => <SelectItem key={s} value={s}>{t(`paymentStatus.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>{t("finance.paymentMethod")}</Label><Input value={form.paymentMethod} onChange={e => setForm(f => ({...f, paymentMethod: e.target.value}))} /></div>
              </div>
              <div className="space-y-2"><Label>{t("finance.referenceNumber")}</Label><Input value={form.referenceNumber} onChange={e => setForm(f => ({...f, referenceNumber: e.target.value}))} placeholder="REF-XXX" /></div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel")}</Button>
              <Button onClick={() => { if (!form.amount) { toast.error(lang === "ar" ? "المبلغ مطلوب" : "Amount is required"); return; } createMutation.mutate(form); }} disabled={createMutation.isPending}>
                {createMutation.isPending ? t("common.loading") : t("common.save")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("finance.totalRevenue")}</p>
                <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{totalRevenue.toLocaleString("en-SA")} <span className="text-sm font-normal">SAR</span></p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center"><ArrowUpRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("finance.totalExpenses")}</p>
                <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{totalExpenses.toLocaleString("en-SA")} <span className="text-sm font-normal">SAR</span></p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center"><ArrowDownRight className="h-5 w-5 text-red-600 dark:text-red-400" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("finance.netIncome")}</p>
                <p className={`text-2xl font-bold mt-1 ${netIncome >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{netIncome.toLocaleString("en-SA")} <span className="text-sm font-normal">SAR</span></p>
              </div>
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${netIncome >= 0 ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                {netIncome >= 0 ? <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder={t("common.all") + " " + t("finance.type")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="revenue">{t("finance.revenue")}</SelectItem>
            <SelectItem value="expense">{t("finance.expense")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t("common.all") + " " + t("common.status")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {paymentStatuses.map(s => <SelectItem key={s} value={s}>{t(`paymentStatus.${s}`)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Transactions */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : transactions && transactions.length > 0 ? (
        <div className="space-y-2">
          {transactions.map((tx: any) => (
            <Card key={tx.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${tx.transactionType === "revenue" ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
                      {tx.transactionType === "revenue" ? <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> : <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.category}</p>
                      <p className="text-xs text-muted-foreground">{tx.description || (lang === "ar" ? "بدون وصف" : "No description")}</p>
                    </div>
                  </div>
                  <div className="text-end">
                    <p className={`font-semibold ${tx.transactionType === "revenue" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {tx.transactionType === "revenue" ? "+" : "-"}{parseFloat(tx.amount).toLocaleString("en-SA")} SAR
                    </p>
                    <div className="flex items-center gap-2 mt-1 justify-end">
                      <Badge variant="outline" className={`text-[10px] ${paymentStatusColors[tx.paymentStatus] || ""}`}>
                        {t(`paymentStatus.${tx.paymentStatus}`)}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{new Date(tx.transactionDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <DollarSign className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">{t("finance.noTransactions")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("finance.addFirst")}</p>
            <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 me-2" />{t("finance.recordTransaction")}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
