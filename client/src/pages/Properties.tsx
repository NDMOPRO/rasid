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
import {
  Building2, Plus, Search, MapPin, Bed, Bath, ExternalLink,
  LayoutGrid, List, Home, User, Phone, ChevronRight,
  Sparkles, CheckCircle2, Clock, AlertCircle, XCircle,
  FileText, Zap, Eye
} from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// Status configuration with colors, icons, and gradients
const statusConfig: Record<string, { bg: string; text: string; border: string; icon: any; gradient: string; dot: string }> = {
  prospect: {
    bg: "bg-slate-50 dark:bg-slate-900/40",
    text: "text-slate-600 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-700",
    icon: Eye,
    gradient: "from-slate-400 to-slate-500",
    dot: "bg-slate-400",
  },
  contract_pending: {
    bg: "bg-amber-50 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-200 dark:border-amber-800",
    icon: FileText,
    gradient: "from-amber-400 to-amber-500",
    dot: "bg-amber-400",
  },
  onboarding: {
    bg: "bg-blue-50 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
    icon: Zap,
    gradient: "from-blue-400 to-blue-500",
    dot: "bg-blue-400",
  },
  setup_in_progress: {
    bg: "bg-orange-50 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
    icon: Clock,
    gradient: "from-orange-400 to-orange-500",
    dot: "bg-orange-400",
  },
  ready_for_listing: {
    bg: "bg-purple-50 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
    icon: Sparkles,
    gradient: "from-purple-400 to-purple-500",
    dot: "bg-purple-400",
  },
  live: {
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-200 dark:border-emerald-800",
    icon: CheckCircle2,
    gradient: "from-emerald-400 to-emerald-500",
    dot: "bg-emerald-400",
  },
  suspended: {
    bg: "bg-red-50 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
    icon: AlertCircle,
    gradient: "from-red-400 to-red-500",
    dot: "bg-red-400",
  },
  terminated: {
    bg: "bg-gray-100 dark:bg-gray-800/50",
    text: "text-gray-500 dark:text-gray-500",
    border: "border-gray-200 dark:border-gray-700",
    icon: XCircle,
    gradient: "from-gray-400 to-gray-500",
    dot: "bg-gray-400",
  },
};

// City gradient colors for card top accent
const cityGradients: Record<string, string> = {
  riyadh: "from-emerald-500/80 via-teal-500/60 to-cyan-500/40",
  jeddah: "from-blue-500/80 via-indigo-500/60 to-purple-500/40",
  madinah: "from-amber-500/80 via-orange-500/60 to-rose-500/40",
};

const statuses = ["prospect", "contract_pending", "onboarding", "setup_in_progress", "ready_for_listing", "live", "suspended", "terminated"];
const propertyTypes = ["apartment", "villa", "studio", "penthouse", "duplex"];
const cities = ["riyadh", "jeddah", "madinah"];

function PropertyCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="h-2 bg-muted" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-px w-full mb-4" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-px w-full my-4" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const config = statusConfig[status] || statusConfig.prospect;
  const StatusIcon = config.icon;
  return (
    <Badge
      variant="outline"
      className={`${config.bg} ${config.text} ${config.border} text-[11px] font-medium px-2.5 py-0.5 gap-1.5 rounded-full`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`} />
      {t(`status.${status}`)}
    </Badge>
  );
}

function PropertyCard({ prop, lang, t, coverPhoto, onClick }: { prop: any; lang: string; t: (key: string) => string; coverPhoto?: string; onClick: () => void }) {
  const config = statusConfig[prop.unitStatus] || statusConfig.prospect;
  const gradient = cityGradients[prop.city] || cityGradients.riyadh;

  // Calculate setup progress
  const checklistItems = [
    prop.furnishedStatus, prop.smartLockInstalled, prop.wifiSetup,
    prop.photographyDone, prop.deepCleanDone, prop.amenitiesReady, prop.listingCreated
  ];
  const completedCount = checklistItems.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / checklistItems.length) * 100);

  return (
    <Card
      className="group cursor-pointer overflow-hidden border border-border/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 relative"
      onClick={onClick}
    >
      {/* Cover photo or gradient accent bar */}
      {coverPhoto ? (
        <div className="h-36 overflow-hidden relative">
          <img src={coverPhoto} alt={prop.unitId} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      ) : (
        <div className={`h-1.5 bg-gradient-to-r ${gradient} transition-all duration-300 group-hover:h-2`} />
      )}

      <CardContent className="p-5">
        {/* Header: Unit ID + Status */}
        <div className="flex items-start justify-between mb-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-base tracking-tight group-hover:text-primary transition-colors duration-200 truncate">
              {prop.unitId}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">{t(`city.${prop.city}`)}</span>
            </div>
          </div>
          <StatusBadge status={prop.unitStatus} t={t} />
        </div>

        {/* Divider */}
        <div className="h-px bg-border/60 mb-3" />

        {/* Property Info Grid */}
        <div className="space-y-2.5">
          {prop.buildingName && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-primary/8 dark:bg-primary/15 shrink-0">
                <Building2 className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-foreground/80 truncate">{prop.buildingName}</span>
            </div>
          )}
          {prop.neighborhood && (
            <div className="flex items-center gap-2.5 text-sm">
              <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-blue-500/8 dark:bg-blue-500/15 shrink-0">
                <Home className="h-3.5 w-3.5 text-blue-500" />
              </div>
              <span className="text-foreground/80 truncate">
                {lang === "ar" && prop.neighborhoodAr ? prop.neighborhoodAr : prop.neighborhood}
              </span>
            </div>
          )}

          {/* Bedrooms & Bathrooms row */}
          <div className="flex items-center gap-3">
            {prop.bedrooms != null && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-violet-500/8 dark:bg-violet-500/15 shrink-0">
                  <Bed className="h-3.5 w-3.5 text-violet-500" />
                </div>
                <span className="text-foreground/80">{prop.bedrooms}</span>
              </div>
            )}
            {prop.bathrooms != null && (
              <div className="flex items-center gap-2 text-sm">
                <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-cyan-500/8 dark:bg-cyan-500/15 shrink-0">
                  <Bath className="h-3.5 w-3.5 text-cyan-500" />
                </div>
                <span className="text-foreground/80">{prop.bathrooms}</span>
              </div>
            )}
            {prop.layout && (
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">{prop.layout}</span>
            )}
          </div>
        </div>

        {/* Setup Progress (only for non-live, non-terminated) */}
        {prop.unitStatus !== "live" && prop.unitStatus !== "terminated" && completedCount > 0 && (
          <div className="mt-3 pt-3 border-t border-border/40">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-muted-foreground font-medium">
                {t("properties.setupChecklist")}
              </span>
              <span className="text-[11px] font-semibold text-primary">{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer: Owner + Map Link */}
        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {(prop.ownerNameAr || prop.ownerName) && (
              <>
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted shrink-0">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  {lang === "ar" && prop.ownerNameAr ? prop.ownerNameAr : prop.ownerName || prop.ownerNameAr}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {prop.googleMapsLink && (
              <a
                href={prop.googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {t("properties.map")}
              </a>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-200 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PropertyListRow({ prop, lang, t, coverPhoto, onClick }: { prop: any; lang: string; t: (key: string) => string; coverPhoto?: string; onClick: () => void }) {
  return (
    <div
      className="group flex items-center gap-4 p-4 bg-card border border-border/60 rounded-xl cursor-pointer hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200"
      onClick={onClick}
    >
      {/* Cover photo or status dot */}
      {coverPhoto ? (
        <div className="h-12 w-16 rounded-lg overflow-hidden shrink-0">
          <img src={coverPhoto} alt={prop.unitId} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className={`h-2.5 w-2.5 rounded-full shrink-0 ${(statusConfig[prop.unitStatus] || statusConfig.prospect).dot}`} />
      )}

      {/* Unit ID */}
      <div className="min-w-0 w-44 shrink-0">
        <h3 className="font-bold text-sm group-hover:text-primary transition-colors truncate">{prop.unitId}</h3>
        <p className="text-xs text-muted-foreground">{t(`city.${prop.city}`)}</p>
      </div>

      {/* Building + Neighborhood */}
      <div className="hidden md:flex items-center gap-2 min-w-0 flex-1">
        {prop.buildingName && (
          <span className="text-sm text-foreground/70 truncate">{prop.buildingName}</span>
        )}
        {prop.buildingName && prop.neighborhood && <span className="text-muted-foreground/40">·</span>}
        {prop.neighborhood && (
          <span className="text-sm text-foreground/70 truncate">
            {lang === "ar" && prop.neighborhoodAr ? prop.neighborhoodAr : prop.neighborhood}
          </span>
        )}
      </div>

      {/* Beds/Baths */}
      <div className="hidden lg:flex items-center gap-3 shrink-0">
        {prop.bedrooms != null && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bed className="h-3.5 w-3.5" /> {prop.bedrooms}
          </span>
        )}
        {prop.bathrooms != null && (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Bath className="h-3.5 w-3.5" /> {prop.bathrooms}
          </span>
        )}
      </div>

      {/* Status Badge */}
      <div className="shrink-0">
        <StatusBadge status={prop.unitStatus} t={t} />
      </div>

      {/* Arrow */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary shrink-0 transition-colors rtl:rotate-180" />
    </div>
  );
}

export default function Properties() {
  const [, setLocation] = useLocation();
  const { t, lang } = useI18n();
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: properties, isLoading, refetch } = trpc.properties.list.useQuery({
    search: search || undefined,
    city: cityFilter || undefined,
    status: statusFilter || undefined,
  });

  // Fetch cover photos for all properties
  const propertyIds = useMemo(() => (properties || []).map((p: any) => p.id), [properties]);
  const { data: coverPhotos } = trpc.properties.coverPhotos.useQuery(
    { propertyIds },
    { enabled: propertyIds.length > 0 }
  );

  const createMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم إنشاء العقار بنجاح" : "Property created successfully");
      setShowCreate(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    unitId: "", city: "riyadh" as const, neighborhood: "", neighborhoodAr: "",
    buildingName: "", layout: "", floor: "", bedrooms: 0, bathrooms: 0,
    propertyType: "apartment" as const, ownerName: "", ownerNameAr: "",
    ownerPhone: "", ownerEmail: "", googleMapsLink: "", fullAddress: "", fullAddressAr: "",
    targetAdr: "", notes: "",
  });

  // Status summary counts
  const statusCounts = useMemo(() => {
    if (!properties) return {};
    const counts: Record<string, number> = {};
    properties.forEach((p: any) => {
      counts[p.unitStatus] = (counts[p.unitStatus] || 0) + 1;
    });
    return counts;
  }, [properties]);

  const handleCreate = () => {
    if (!form.unitId) { toast.error(lang === "ar" ? "رقم الوحدة مطلوب" : "Unit ID is required"); return; }
    createMutation.mutate({
      ...form,
      bedrooms: form.bedrooms || undefined,
      bathrooms: form.bathrooms || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("properties.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("properties.subtitle")}
            {properties && (
              <span className="ms-2 text-foreground/60 font-medium">
                ({properties.length} {lang === "ar" ? "عقار" : "units"})
              </span>
            )}
          </p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
              <Plus className="h-4 w-4 me-2" />{t("properties.addNew")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("properties.addNew")}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label>{t("properties.unitId")} *</Label>
                <Input placeholder="RYD-WIZ-2BR-001" value={form.unitId} onChange={e => setForm(f => ({...f, unitId: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.city")} *</Label>
                <Select value={form.city} onValueChange={v => setForm(f => ({...f, city: v as any}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {cities.map(c => <SelectItem key={c} value={c}>{t(`city.${c}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("properties.type")}</Label>
                <Select value={form.propertyType} onValueChange={v => setForm(f => ({...f, propertyType: v as any}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map(pt => <SelectItem key={pt} value={pt}>{t(`propertyType.${pt}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("properties.building")}</Label>
                <Input value={form.buildingName} onChange={e => setForm(f => ({...f, buildingName: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.neighborhood")} (EN)</Label>
                <Input value={form.neighborhood} onChange={e => setForm(f => ({...f, neighborhood: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.neighborhood")} (AR)</Label>
                <Input dir="rtl" value={form.neighborhoodAr} onChange={e => setForm(f => ({...f, neighborhoodAr: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.floor")}</Label>
                <Input value={form.floor} onChange={e => setForm(f => ({...f, floor: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.bedrooms")}</Label>
                <Input type="number" min={0} value={form.bedrooms} onChange={e => setForm(f => ({...f, bedrooms: parseInt(e.target.value) || 0}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.bathrooms")}</Label>
                <Input type="number" min={0} value={form.bathrooms} onChange={e => setForm(f => ({...f, bathrooms: parseInt(e.target.value) || 0}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.ownerName")} (EN)</Label>
                <Input value={form.ownerName} onChange={e => setForm(f => ({...f, ownerName: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.ownerName")} (AR)</Label>
                <Input dir="rtl" value={form.ownerNameAr} onChange={e => setForm(f => ({...f, ownerNameAr: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.ownerPhone")}</Label>
                <Input placeholder="+966-5X-XXX-XXXX" value={form.ownerPhone} onChange={e => setForm(f => ({...f, ownerPhone: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.ownerEmail")}</Label>
                <Input value={form.ownerEmail} onChange={e => setForm(f => ({...f, ownerEmail: e.target.value}))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("properties.address")} (EN)</Label>
                <Input value={form.fullAddress} onChange={e => setForm(f => ({...f, fullAddress: e.target.value}))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("properties.address")} (AR)</Label>
                <Input dir="rtl" value={form.fullAddressAr} onChange={e => setForm(f => ({...f, fullAddressAr: e.target.value}))} />
              </div>
              <div className="space-y-2">
                <Label>{t("properties.targetAdr")} (SAR)</Label>
                <Input value={form.targetAdr} onChange={e => setForm(f => ({...f, targetAdr: e.target.value}))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{t("properties.notes")}</Label>
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

      {/* Status Summary Pills */}
      {properties && properties.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(statusCounts).sort((a, b) => b[1] - a[1]).map(([status, count]) => {
            const config = statusConfig[status] || statusConfig.prospect;
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(isActive ? "" : status)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
                  ${isActive
                    ? `${config.bg} ${config.text} ${config.border} ring-2 ring-offset-1 ring-current/20`
                    : "bg-card text-muted-foreground border-border/60 hover:border-border"
                  }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                {t(`status.${status}`)}
                <span className={`font-bold ${isActive ? "" : "text-foreground/60"}`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("common.search")}
            className="ps-9 bg-card"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={cityFilter} onValueChange={v => setCityFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-44 bg-card">
            <SelectValue placeholder={t("common.all") + " " + t("properties.city")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{t(`city.${c}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-48 bg-card">
            <SelectValue placeholder={t("common.all") + " " + t("common.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {statuses.map(s => <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>)}
          </SelectContent>
        </Select>
        {/* View Toggle */}
        <div className="flex items-center bg-card border border-border/60 rounded-lg p-0.5 shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Property Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <PropertyCardSkeleton key={i} />)}
        </div>
      ) : properties && properties.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((prop: any) => (
              <PropertyCard
                key={prop.id}
                prop={prop}
                lang={lang}
                t={t}
                coverPhoto={coverPhotos?.[prop.id]}
                onClick={() => setLocation(`/properties/${prop.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {properties.map((prop: any) => (
              <PropertyListRow
                key={prop.id}
                prop={prop}
                lang={lang}
                t={t}
                coverPhoto={coverPhotos?.[prop.id]}
                onClick={() => setLocation(`/properties/${prop.id}`)}
              />
            ))}
          </div>
        )
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
              <Building2 className="h-8 w-8 text-primary/60" />
            </div>
            <h3 className="font-semibold text-lg mb-1">{t("properties.noProperties")}</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-sm">{t("properties.addFirst")}</p>
            {!search && !cityFilter && !statusFilter && (
              <Button onClick={() => setShowCreate(true)} size="lg">
                <Plus className="h-4 w-4 me-2" />{t("properties.addNew")}
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
