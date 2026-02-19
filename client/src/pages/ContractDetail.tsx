import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, User, Phone, Mail, Calendar, Edit, Save, X, Building2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

const contractStatuses = ["draft", "under_review", "pending_signature", "active", "expired", "terminated", "renewed"];
const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  under_review: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400",
  pending_signature: "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  active: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  expired: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  terminated: "bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  renewed: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function ContractDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});

  const { data: contract, isLoading, refetch } = trpc.contracts.getById.useQuery(
    { id: parseInt(params.id || "0") }, { enabled: !!params.id }
  );

  const updateMutation = trpc.contracts.update.useMutation({
    onSuccess: () => { toast.success(lang === "ar" ? "تم تحديث العقد" : "Contract updated"); setEditing(false); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  // Fetch linked property if contract has one
  const { data: linkedProperty } = trpc.properties.getById.useQuery(
    { id: contract?.propertyId || 0 },
    { enabled: !!contract?.propertyId }
  );

  if (isLoading) return <div className="space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-64 w-full" /></div>;

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h3 className="font-semibold text-lg">{t("contracts.noContracts")}</h3>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/contracts")}><ArrowLeft className="h-4 w-4 me-2" />{t("common.back")}</Button>
      </div>
    );
  }

  const startEdit = () => {
    setEditData({
      contractStatus: contract.contractStatus,
      ownerNameAr: contract.ownerNameAr || "", ownerNameEn: contract.ownerNameEn || "",
      ownerPhone: contract.ownerPhone || "", ownerEmail: contract.ownerEmail || "",
      monthlyRent: contract.monthlyRent || "", commissionPercent: contract.commissionPercent || "",
      notes: contract.notes || "",
      startDate: contract.startDate ? new Date(contract.startDate).toISOString().split("T")[0] : "",
      endDate: contract.endDate ? new Date(contract.endDate).toISOString().split("T")[0] : "",
    });
    setEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/contracts")}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{contract.contractNumber}</h1>
              <Badge className={statusColors[contract.contractStatus ?? ""] || ""}>{t(`contractStatus.${contract.contractStatus}`)}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {t(`contractType.${contract.contractType}`)}
              {contract.contractTitle && ` · ${contract.contractTitle}`}
            </p>
          </div>
        </div>
        {!editing ? (
          <Button variant="outline" onClick={startEdit}><Edit className="h-4 w-4 me-2" />{t("common.edit")}</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(false)}><X className="h-4 w-4 me-2" />{t("common.cancel")}</Button>
            <Button onClick={() => updateMutation.mutate({ id: contract.id, data: editData })} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 me-2" />{updateMutation.isPending ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        )}
      </div>

      {/* Linked Property Banner */}
      {linkedProperty && (
        <Card className="border-primary/20 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setLocation(`/properties/${linkedProperty.id}`)}>
          <CardContent className="p-4 flex items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">{t("contracts.linkedProperty")}: {linkedProperty.unitId}</p>
              <p className="text-xs text-muted-foreground">{t(`city.${linkedProperty.city}`)} · {linkedProperty.buildingName || ""}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Owner Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t("contracts.ownerInfo")}</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">{t("contracts.ownerName")} (AR)</Label><Input dir="rtl" value={editData.ownerNameAr} onChange={e => setEditData(d => ({...d, ownerNameAr: e.target.value}))} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t("contracts.ownerName")} (EN)</Label><Input value={editData.ownerNameEn} onChange={e => setEditData(d => ({...d, ownerNameEn: e.target.value}))} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5"><Label className="text-xs">{t("contracts.ownerPhone")}</Label><Input value={editData.ownerPhone} onChange={e => setEditData(d => ({...d, ownerPhone: e.target.value}))} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">{t("contracts.ownerEmail")}</Label><Input value={editData.ownerEmail} onChange={e => setEditData(d => ({...d, ownerEmail: e.target.value}))} /></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{(lang === "ar" ? contract.ownerNameAr : contract.ownerNameEn) || contract.ownerNameAr || contract.ownerNameEn || t("common.notSpecified")}</span></div>
                {contract.ownerIdNumber && <div className="text-muted-foreground">{t("contracts.ownerIdNumber")}: {contract.ownerIdNumber}</div>}
                {contract.ownerPhone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><a href={`tel:${contract.ownerPhone}`} className="text-primary hover:underline">{contract.ownerPhone}</a></div>}
                {contract.ownerEmail && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><a href={`mailto:${contract.ownerEmail}`} className="text-primary hover:underline">{contract.ownerEmail}</a></div>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Dates */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t("contracts.period")}</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">{t("contracts.startDate")}</Label><Input type="date" value={editData.startDate} onChange={e => setEditData(d => ({...d, startDate: e.target.value}))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t("contracts.endDate")}</Label><Input type="date" value={editData.endDate} onChange={e => setEditData(d => ({...d, endDate: e.target.value}))} /></div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{t("contracts.startDate")}: {contract.startDate ? new Date(contract.startDate).toLocaleDateString() : t("common.notSet")}</span></div>
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{t("contracts.endDate")}: {contract.endDate ? new Date(contract.endDate).toLocaleDateString() : t("common.notSet")}</span></div>
                {contract.durationMonths && <div className="text-muted-foreground">{t("contracts.duration")}: {contract.durationMonths} {lang === "ar" ? "شهر" : "months"}</div>}
                <div className="text-muted-foreground">{t("contracts.autoRenewal")}: {contract.autoRenewal ? (lang === "ar" ? "نعم" : "Yes") : (lang === "ar" ? "لا" : "No")}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t("contracts.financialTerms")}</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs">{t("contracts.monthlyRent")} (SAR)</Label><Input value={editData.monthlyRent} onChange={e => setEditData(d => ({...d, monthlyRent: e.target.value}))} /></div>
                <div className="space-y-1.5"><Label className="text-xs">{t("contracts.commission")} %</Label><Input value={editData.commissionPercent} onChange={e => setEditData(d => ({...d, commissionPercent: e.target.value}))} /></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-muted-foreground">{t("contracts.monthlyRent")}</p><p className="font-semibold text-lg">{contract.monthlyRent ? `${contract.monthlyRent} SAR` : "N/A"}</p></div>
                <div><p className="text-muted-foreground">{t("contracts.commission")}</p><p className="font-semibold text-lg">{contract.commissionPercent ? `${contract.commissionPercent}%` : "N/A"}</p></div>
                <div><p className="text-muted-foreground">{t("contracts.securityDeposit")}</p><p className="font-semibold">{contract.securityDeposit ? `${contract.securityDeposit} SAR` : "N/A"}</p></div>
                <div><p className="text-muted-foreground">{t("contracts.revenueSplit")}</p><p className="font-semibold">{contract.revenueSplit || "N/A"}</p></div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes & Status */}
        <Card>
          <CardHeader><CardTitle className="text-base">{t("contracts.notes")}</CardTitle></CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">{t("common.status")}</Label>
                  <Select value={editData.contractStatus} onValueChange={v => setEditData(d => ({...d, contractStatus: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{contractStatuses.map(s => <SelectItem key={s} value={s}>{t(`contractStatus.${s}`)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">{t("contracts.notes")}</Label><Input value={editData.notes} onChange={e => setEditData(d => ({...d, notes: e.target.value}))} /></div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <p className="text-muted-foreground">{contract.notes || (lang === "ar" ? "لا توجد ملاحظات" : "No notes")}</p>
                {contract.specialConditions && <p className="text-muted-foreground">{t("contracts.specialConditions")}: {contract.specialConditions}</p>}
                <p className="text-xs text-muted-foreground">{t("common.created")}: {new Date(contract.createdAt).toLocaleDateString()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
