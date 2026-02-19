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
import { FileText, Plus, Search, Calendar, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const contractStatuses = ["draft", "under_review", "pending_signature", "active", "expired", "terminated", "renewed"];
const contractTypes = ["management_agreement", "master_lease", "revenue_share", "hybrid"];

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  under_review: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  pending_signature: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  expired: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  terminated: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  renewed: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function Contracts() {
  const [, setLocation] = useLocation();
  const { t, lang } = useI18n();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: contracts, isLoading, refetch } = trpc.contracts.list.useQuery({
    search: search || undefined, status: statusFilter || undefined, type: typeFilter || undefined,
  });

  const { data: allProperties } = trpc.properties.getAll.useQuery();

  const generateNumber = trpc.contracts.generateNumber.useMutation();
  const createMutation = trpc.contracts.create.useMutation({
    onSuccess: () => { toast.success(lang === "ar" ? "تم إنشاء العقد" : "Contract created"); setShowCreate(false); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    contractNumber: "", contractTitle: "", contractType: "management_agreement" as const,
    contractStatus: "draft" as const, propertyId: undefined as number | undefined,
    ownerNameAr: "", ownerNameEn: "", ownerIdNumber: "",
    ownerPhone: "", ownerEmail: "", startDate: "", endDate: "", durationMonths: 12,
    monthlyRent: "", commissionPercent: "", securityDeposit: "", paymentTerms: "", notes: "",
  });

  const handleGenerateNumber = async () => {
    const result = await generateNumber.mutateAsync({ city: "riyadh" });
    setForm(f => ({ ...f, contractNumber: result.contractNumber }));
  };

  // Auto-generate contract number when dialog opens
  useEffect(() => {
    if (showCreate) {
      // Reset form when opening
      setForm({
        contractNumber: "", contractTitle: "", contractType: "management_agreement",
        contractStatus: "draft", propertyId: undefined,
        ownerNameAr: "", ownerNameEn: "", ownerIdNumber: "",
        ownerPhone: "", ownerEmail: "", startDate: "", endDate: "", durationMonths: 12,
        monthlyRent: "", commissionPercent: "", securityDeposit: "", paymentTerms: "", notes: "",
      });
      // Auto-generate number
      generateNumber.mutateAsync({ city: "riyadh" }).then(result => {
        setForm(f => ({ ...f, contractNumber: result.contractNumber }));
      }).catch(() => {});
    }
  }, [showCreate]);

  const handleCreate = () => {
    if (!form.contractNumber) { toast.error(lang === "ar" ? "رقم العقد مطلوب" : "Contract number is required"); return; }
    createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("contracts.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("contracts.subtitle")}</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 me-2" />{t("contracts.addNew")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{t("contracts.addNew")}</DialogTitle></DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>{t("contracts.contractNumber")} *</Label>
                <div className="flex gap-2">
                  <Input value={form.contractNumber} onChange={e => setForm(f => ({...f, contractNumber: e.target.value}))} placeholder="COBNB-RYD-2026-001" />
                  <Button variant="outline" size="sm" onClick={handleGenerateNumber} disabled={generateNumber.isPending}>
                    {lang === "ar" ? "تلقائي" : "Auto"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.contractTitle")}</Label>
                <Input value={form.contractTitle} onChange={e => setForm(f => ({...f, contractTitle: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.linkedProperty")}</Label>
                <Select value={form.propertyId?.toString() || "none"} onValueChange={v => setForm(f => ({...f, propertyId: v === "none" ? undefined : parseInt(v)}))}>
                  <SelectTrigger><SelectValue placeholder={lang === "ar" ? "اختر عقار" : "Select property"} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{lang === "ar" ? "بدون ربط" : "No link"}</SelectItem>
                    {allProperties?.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.unitId} - {t(`city.${p.city}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.contractType")}</Label>
                <Select value={form.contractType} onValueChange={v => setForm(f => ({...f, contractType: v as any}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {contractTypes.map(ct => <SelectItem key={ct} value={ct}>{t(`contractType.${ct}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.ownerName")} (AR)</Label>
                <Input dir="rtl" value={form.ownerNameAr} onChange={e => setForm(f => ({...f, ownerNameAr: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.ownerName")} (EN)</Label>
                <Input value={form.ownerNameEn} onChange={e => setForm(f => ({...f, ownerNameEn: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.ownerIdNumber")}</Label>
                <Input value={form.ownerIdNumber} onChange={e => setForm(f => ({...f, ownerIdNumber: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.ownerPhone")}</Label>
                <Input value={form.ownerPhone} onChange={e => setForm(f => ({...f, ownerPhone: e.target.value}))} placeholder="+966-5X-XXX-XXXX" />
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.startDate")}</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(f => ({...f, startDate: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.endDate")}</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(f => ({...f, endDate: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.monthlyRent")} (SAR)</Label>
                <Input value={form.monthlyRent} onChange={e => setForm(f => ({...f, monthlyRent: e.target.value}))} placeholder="5000" />
              </div>
              <div className="space-y-2">
                <Label>{t("contracts.commission")} %</Label>
                <Input value={form.commissionPercent} onChange={e => setForm(f => ({...f, commissionPercent: e.target.value}))} placeholder="15" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("contracts.notes")}</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreate(false)}>{t("common.cancel")}</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? t("common.loading") : t("common.create")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder={t("common.search")} className="ps-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t("common.all") + " " + t("common.status")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {contractStatuses.map(s => <SelectItem key={s} value={s}>{t(`contractStatus.${s}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={v => setTypeFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder={t("common.all") + " " + t("contracts.contractType")} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {contractTypes.map(ct => <SelectItem key={ct} value={ct}>{t(`contractType.${ct}`)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Contract List */}
      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>
      ) : contracts && contracts.length > 0 ? (
        <div className="space-y-3">
          {contracts.map((contract: any) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation(`/contracts/${contract.id}`)}>
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 className="font-semibold text-sm">{contract.contractNumber}</h3>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[contract.contractStatus] || ""}`}>
                        {t(`contractStatus.${contract.contractStatus}`)}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {t(`contractType.${contract.contractType}`)}
                      </Badge>
                    </div>
                    {contract.contractTitle && <p className="text-sm text-muted-foreground truncate">{contract.contractTitle}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                      {(contract.ownerNameAr || contract.ownerNameEn) && (
                        <span>{t("contracts.ownerName")}: {lang === "ar" ? (contract.ownerNameAr || contract.ownerNameEn) : (contract.ownerNameEn || contract.ownerNameAr)}</span>
                      )}
                      {contract.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(contract.startDate).toLocaleDateString()} — {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : t("contracts.ongoing")}
                        </span>
                      )}
                      {contract.monthlyRent && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />{contract.monthlyRent} SAR/{lang === "ar" ? "شهر" : "mo"}
                        </span>
                      )}
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
            <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-semibold text-lg mb-1">{t("contracts.noContracts")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{t("contracts.addFirst")}</p>
            {!search && !statusFilter && !typeFilter && (
              <Button onClick={() => setShowCreate(true)}><Plus className="h-4 w-4 me-2" />{t("contracts.addNew")}</Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
