import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Building2, MapPin, User, Phone, Mail, Bed, Bath,
  Edit, Save, X, ExternalLink, FileText, Trash2, Camera,
  CheckCircle2, Circle, Wifi, Lock, Sparkles, Paintbrush,
  Sofa, Image, Globe, DollarSign, Calendar, Clock,
  ChevronLeft, ChevronRight, Eye, Zap, AlertCircle, XCircle,
  Upload, BarChart3, Target, TrendingUp
} from "lucide-react";
import { useState, useCallback, useRef, useMemo } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import { MapView } from "@/components/Map";

const statuses = ["prospect", "contract_pending", "onboarding", "setup_in_progress", "ready_for_listing", "live", "suspended", "terminated"];

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: any; gradient: string; dot: string }> = {
  prospect: { bg: "bg-slate-50 dark:bg-slate-900/40", text: "text-slate-600 dark:text-slate-400", border: "border-slate-200 dark:border-slate-700", icon: Eye, gradient: "from-slate-400 to-slate-500", dot: "bg-slate-400" },
  contract_pending: { bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800", icon: FileText, gradient: "from-amber-400 to-amber-500", dot: "bg-amber-400" },
  onboarding: { bg: "bg-blue-50 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800", icon: Zap, gradient: "from-blue-400 to-blue-500", dot: "bg-blue-400" },
  setup_in_progress: { bg: "bg-orange-50 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", border: "border-orange-200 dark:border-orange-800", icon: Clock, gradient: "from-orange-400 to-orange-500", dot: "bg-orange-400" },
  ready_for_listing: { bg: "bg-purple-50 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800", icon: Sparkles, gradient: "from-purple-400 to-purple-500", dot: "bg-purple-400" },
  live: { bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800", icon: CheckCircle2, gradient: "from-emerald-400 to-emerald-500", dot: "bg-emerald-400" },
  suspended: { bg: "bg-red-50 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", border: "border-red-200 dark:border-red-800", icon: AlertCircle, gradient: "from-red-400 to-red-500", dot: "bg-red-400" },
  terminated: { bg: "bg-gray-100 dark:bg-gray-800/50", text: "text-gray-500 dark:text-gray-500", border: "border-gray-200 dark:border-gray-700", icon: XCircle, gradient: "from-gray-400 to-gray-500", dot: "bg-gray-400" },
};

const cityGradients: Record<string, string> = {
  riyadh: "from-emerald-500 via-teal-500 to-cyan-500",
  jeddah: "from-blue-500 via-indigo-500 to-purple-500",
  madinah: "from-amber-500 via-orange-500 to-rose-500",
};

// Setup checklist items configuration
const checklistItems = [
  { key: "furnishedStatus", icon: Sofa, labelKey: "properties.furnished" },
  { key: "smartLockInstalled", icon: Lock, labelKey: "properties.smartLock" },
  { key: "wifiSetup", icon: Wifi, labelKey: "properties.wifi" },
  { key: "photographyDone", icon: Camera, labelKey: "properties.photography" },
  { key: "deepCleanDone", icon: Paintbrush, labelKey: "properties.deepClean" },
  { key: "amenitiesReady", icon: Sparkles, labelKey: "properties.amenities" },
  { key: "listingCreated", icon: Globe, labelKey: "properties.listing" },
];

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="h-1 w-full bg-muted rounded-full" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function PropertyDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const propertyId = parseInt(params.id || "0");

  const { data: property, isLoading, refetch } = trpc.properties.getById.useQuery(
    { id: propertyId },
    { enabled: !!params.id }
  );

  const { data: linkedContracts } = trpc.properties.contracts.useQuery(
    { propertyId },
    { enabled: !!params.id }
  );

  const { data: photos } = trpc.documents.list.useQuery(
    { propertyId, type: "photo" },
    { enabled: !!params.id }
  );

  const updateMutation = trpc.properties.update.useMutation({
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم تحديث العقار" : "Property updated");
      setEditing(false);
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Delete not available in API - would need to add to routers.ts
  const handleDelete = () => {
    toast.error(lang === "ar" ? "الحذف غير متاح حالياً" : "Delete not available yet");
  };

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success(lang === "ar" ? "تم رفع الصورة" : "Photo uploaded");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleMapReady = useCallback((map: google.maps.Map) => {
    if (!property) return;
    const lat = parseFloat(property.gpsLat || "0");
    const lng = parseFloat(property.gpsLng || "0");
    if (lat && lng) {
      map.setCenter({ lat, lng });
      map.setZoom(16);
      new google.maps.marker.AdvancedMarkerElement({ position: { lat, lng }, map, title: property.unitId });
    } else if (property.fullAddress || property.neighborhood) {
      const geocoder = new google.maps.Geocoder();
      const address = property.fullAddress || `${property.neighborhood}, ${property.city}, Saudi Arabia`;
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          map.setCenter(results[0].geometry.location);
          map.setZoom(16);
          new google.maps.marker.AdvancedMarkerElement({ position: results[0].geometry.location, map, title: property.unitId });
        }
      });
    }
  }, [property]);

  // Setup progress calculation
  const setupProgress = useMemo(() => {
    if (!property) return { completed: 0, total: 7, percent: 0 };
    const items = [
      property.furnishedStatus, property.smartLockInstalled, property.wifiSetup,
      property.photographyDone, property.deepCleanDone, property.amenitiesReady, property.listingCreated
    ];
    const completed = items.filter(Boolean).length;
    return { completed, total: items.length, percent: Math.round((completed / items.length) * 100) };
  }, [property]);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(lang === "ar" ? `${file.name}: حجم الملف أكبر من 5MB` : `${file.name}: File size exceeds 5MB`);
        return false;
      }
      if (!file.type.startsWith("image/")) {
        toast.error(lang === "ar" ? `${file.name}: نوع الملف غير مدعوم` : `${file.name}: Unsupported file type`);
        return false;
      }
      return true;
    });

    let uploaded = 0;
    const total = validFiles.length;
    if (total === 0) return;

    toast.info(lang === "ar" ? `جاري رفع ${total} صورة...` : `Uploading ${total} photo(s)...`);

    validFiles.forEach((file) => {
      setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
      const reader = new FileReader();
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setUploadProgress(prev => ({ ...prev, [file.name]: Math.round((e.loaded / e.total) * 50) }));
        }
      };
      reader.onload = () => {
        setUploadProgress(prev => ({ ...prev, [file.name]: 75 }));
        const base64 = (reader.result as string).split(",")[1];
        uploadMutation.mutate(
          { propertyId, documentType: "photo", fileName: file.name, fileData: base64, mimeType: file.type },
          {
            onSuccess: () => {
              uploaded++;
              setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
              setTimeout(() => setUploadProgress(prev => { const n = { ...prev }; delete n[file.name]; return n; }), 1500);
              if (uploaded === total) {
                toast.success(lang === "ar" ? `تم رفع ${total} صورة بنجاح` : `${total} photo(s) uploaded successfully`);
              }
            },
            onError: () => {
              setUploadProgress(prev => { const n = { ...prev }; delete n[file.name]; return n; });
            }
          }
        );
      };
      reader.readAsDataURL(file);
    });
  }, [lang, propertyId, uploadMutation]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  if (isLoading) return <DetailSkeleton />;

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <Building2 className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h3 className="font-semibold text-lg mb-1">{t("properties.noProperties")}</h3>
        <p className="text-sm text-muted-foreground mb-6">Property not found or has been deleted</p>
        <Button variant="outline" onClick={() => setLocation("/properties")}>
          <ArrowLeft className="h-4 w-4 me-2" />{t("common.back")}
        </Button>
      </div>
    );
  }

  const config = statusConfig[property.unitStatus] || statusConfig.prospect;
  const StatusIcon = config.icon;
  const gradient = cityGradients[property.city] || cityGradients.riyadh;

  const startEdit = () => {
    setEditData({
      unitStatus: property.unitStatus,
      ownerName: property.ownerName || "",
      ownerNameAr: property.ownerNameAr || "",
      ownerPhone: property.ownerPhone || "",
      ownerEmail: property.ownerEmail || "",
      googleMapsLink: property.googleMapsLink || "",
      targetAdr: property.targetAdr || "",
      targetOccupancy: property.targetOccupancy || "",
      monthlyGuarantee: property.monthlyGuarantee || "",
      ffeBudget: property.ffeBudget || "",
      notes: property.notes || "",
      furnishedStatus: property.furnishedStatus || false,
      smartLockInstalled: property.smartLockInstalled || false,
      wifiSetup: property.wifiSetup || false,
      photographyDone: property.photographyDone || false,
      deepCleanDone: property.deepCleanDone || false,
      amenitiesReady: property.amenitiesReady || false,
      listingCreated: property.listingCreated || false,
    });
    setEditing(true);
  };

  const saveEdit = () => {
    updateMutation.mutate({ id: property.id, data: editData });
  };

  const photoList = photos?.filter((d: any) => d.documentType === "photo") || [];

  return (
    <div className="space-y-6">
      {/* ─── Hero Header ─────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        {/* Gradient accent */}
        <div className={`h-2 bg-gradient-to-r ${gradient}`} />

        <div className="p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-xl hover:bg-muted"
                onClick={() => setLocation("/properties")}
              >
                <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{property.unitId}</h1>
                  <Badge
                    variant="outline"
                    className={`${config.bg} ${config.text} ${config.border} text-xs font-medium px-2.5 py-0.5 gap-1.5 rounded-full`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`} />
                    {t(`status.${property.unitStatus}`)}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground flex-wrap">
                  {property.buildingName && (
                    <>
                      <Building2 className="h-3.5 w-3.5 shrink-0" />
                      <span>{property.buildingName}</span>
                      <span className="text-border">·</span>
                    </>
                  )}
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>{lang === "ar" && property.neighborhoodAr ? property.neighborhoodAr : property.neighborhood || ""}, {t(`city.${property.city}`)}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {!editing ? (
                <>
                  <Button variant="outline" size="sm" onClick={startEdit} className="gap-1.5">
                    <Edit className="h-3.5 w-3.5" />{t("common.edit")}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30">
                        <Trash2 className="h-3.5 w-3.5" />{t("common.delete")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("properties.deleteConfirm")}</AlertDialogTitle>
                        <AlertDialogDescription>{t("properties.deleteWarning")}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={handleDelete}
                        >
                          {t("common.delete")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => setEditing(false)} className="gap-1.5">
                    <X className="h-3.5 w-3.5" />{t("common.cancel")}
                  </Button>
                  <Button size="sm" onClick={saveEdit} disabled={updateMutation.isPending} className="gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    {updateMutation.isPending ? t("common.loading") : t("common.save")}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50 flex-wrap">
            {property.propertyType && (
              <div className="flex items-center gap-1.5 text-sm">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{t(`propertyType.${property.propertyType}`)}</span>
              </div>
            )}
            {property.bedrooms != null && (
              <div className="flex items-center gap-1.5 text-sm">
                <Bed className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{property.bedrooms} BR</span>
              </div>
            )}
            {property.bathrooms != null && (
              <div className="flex items-center gap-1.5 text-sm">
                <Bath className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">{property.bathrooms} BA</span>
              </div>
            )}
            {property.areaSqm && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">{property.areaSqm} m²</span>
              </div>
            )}
            {property.floor && (
              <div className="flex items-center gap-1.5 text-sm">
                <span className="text-muted-foreground">Floor {property.floor}</span>
              </div>
            )}
            {property.layout && (
              <Badge variant="outline" className="text-xs font-normal">{property.layout}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* ─── Tabbed Content ──────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-card border w-full sm:w-auto justify-start overflow-x-auto">
          <TabsTrigger value="overview" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" />{t("properties.overview")}
          </TabsTrigger>
          <TabsTrigger value="photos" className="gap-1.5">
            <Camera className="h-3.5 w-3.5" />{t("properties.photoGallery")}
            {photoList.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px] ms-1">{photoList.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="setup" className="gap-1.5">
            <Zap className="h-3.5 w-3.5" />{t("properties.setupProgress")}
          </TabsTrigger>
          <TabsTrigger value="financials" className="gap-1.5">
            <DollarSign className="h-3.5 w-3.5" />{t("properties.financials")}
          </TabsTrigger>
        </TabsList>

        {/* ─── Overview Tab ──────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Map + Location */}
            <div className="lg:col-span-2 space-y-6">
              {/* Google Map */}
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="h-72 sm:h-80">
                    <MapView onMapReady={handleMapReady} />
                  </div>
                  {(property.fullAddress || property.googleMapsLink) && (
                    <div className="p-4 border-t bg-muted/30">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          {property.fullAddress && (
                            <p className="text-sm text-foreground/80 truncate">
                              {lang === "ar" && property.fullAddressAr ? property.fullAddressAr : property.fullAddress}
                            </p>
                          )}
                          {property.gpsLat && property.gpsLng && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {property.gpsLat}, {property.gpsLng}
                            </p>
                          )}
                        </div>
                        {property.googleMapsLink && (
                          <a
                            href={property.googleMapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 font-medium shrink-0 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            {lang === "ar" ? "خرائط جوجل" : "Google Maps"}
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Linked Contracts */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    {t("properties.linkedContracts")}
                    {linkedContracts && linkedContracts.length > 0 && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{linkedContracts.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {linkedContracts && linkedContracts.length > 0 ? (
                    <div className="space-y-2">
                      {linkedContracts.map((contract: any) => (
                        <div
                          key={contract.id}
                          className="group flex items-center justify-between p-3.5 rounded-xl border border-border/60 hover:border-primary/30 hover:shadow-sm cursor-pointer transition-all duration-200"
                          onClick={() => setLocation(`/contracts/${contract.id}`)}
                        >
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm group-hover:text-primary transition-colors">{contract.contractNumber}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {contract.contractTitle || (lang === "ar" ? contract.ownerNameAr : contract.ownerNameEn)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2.5 shrink-0">
                            <Badge variant="outline" className="text-[11px]">{t(`contractStatus.${contract.contractStatus}`)}</Badge>
                            {contract.monthlyRent && (
                              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{contract.monthlyRent} SAR</span>
                            )}
                            <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors rtl:rotate-180" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                        <FileText className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium">{lang === "ar" ? "لا توجد عقود مرتبطة" : "No linked contracts"}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">{lang === "ar" ? "أضف عقد من صفحة العقود" : "Add a contract from the Contracts page"}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Property Info + Owner */}
            <div className="space-y-6">
              {/* Property Details Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    {t("properties.details")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <DetailRow label={t("properties.type")} value={property.propertyType ? t(`propertyType.${property.propertyType}`) : undefined} />
                    <DetailRow label={t("properties.unitNumber")} value={property.unitNumber} />
                    <DetailRow label={t("properties.layout")} value={property.layout} />
                    <DetailRow label={t("properties.floor")} value={property.floor} />
                    <DetailRow label={t("properties.area")} value={property.areaSqm ? `${property.areaSqm} m²` : undefined} />
                    <DetailRow label={t("properties.bedrooms")} value={property.bedrooms?.toString()} icon={<Bed className="h-3.5 w-3.5" />} />
                    <DetailRow label={t("properties.bathrooms")} value={property.bathrooms?.toString()} icon={<Bath className="h-3.5 w-3.5" />} />
                    <DetailRow label={t("properties.neighborhood")} value={lang === "ar" && property.neighborhoodAr ? property.neighborhoodAr : property.neighborhood} icon={<MapPin className="h-3.5 w-3.5" />} />
                  </div>

                  {/* Listing URLs */}
                  {(property.airbnbUrl || property.bookingUrl || property.gatherinUrl) && (
                    <>
                      <Separator className="my-4" />
                      <p className="text-xs font-medium text-muted-foreground mb-2.5">{t("properties.listingUrls")}</p>
                      <div className="space-y-2">
                        {property.airbnbUrl && (
                          <a href={property.airbnbUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                            <Globe className="h-3.5 w-3.5" /> Airbnb <ExternalLink className="h-3 w-3 ms-auto" />
                          </a>
                        )}
                        {property.bookingUrl && (
                          <a href={property.bookingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                            <Globe className="h-3.5 w-3.5" /> Booking.com <ExternalLink className="h-3 w-3 ms-auto" />
                          </a>
                        )}
                        {property.gatherinUrl && (
                          <a href={property.gatherinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                            <Globe className="h-3.5 w-3.5" /> Gatherin <ExternalLink className="h-3 w-3 ms-auto" />
                          </a>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Owner Details Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    {t("properties.ownerDetails")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.ownerName")} (EN)</Label>
                        <Input size={32} value={editData.ownerName} onChange={e => setEditData(d => ({...d, ownerName: e.target.value}))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.ownerName")} (AR)</Label>
                        <Input dir="rtl" value={editData.ownerNameAr} onChange={e => setEditData(d => ({...d, ownerNameAr: e.target.value}))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.ownerPhone")}</Label>
                        <Input value={editData.ownerPhone} onChange={e => setEditData(d => ({...d, ownerPhone: e.target.value}))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">{t("properties.ownerEmail")}</Label>
                        <Input value={editData.ownerEmail} onChange={e => setEditData(d => ({...d, ownerEmail: e.target.value}))} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {(lang === "ar" ? property.ownerNameAr : property.ownerName) || property.ownerNameAr || property.ownerName || t("common.notSpecified")}
                          </p>
                          <p className="text-xs text-muted-foreground">{t("properties.owner")}</p>
                        </div>
                      </div>
                      {property.ownerPhone && (
                        <a href={`tel:${property.ownerPhone}`} className="flex items-center gap-2.5 text-sm text-foreground/80 hover:text-primary transition-colors">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span dir="ltr">{property.ownerPhone}</span>
                        </a>
                      )}
                      {property.ownerEmail && (
                        <a href={`mailto:${property.ownerEmail}`} className="flex items-center gap-2.5 text-sm text-foreground/80 hover:text-primary transition-colors">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{property.ownerEmail}</span>
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{t("properties.notes")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <Textarea
                      value={editData.notes}
                      onChange={e => setEditData(d => ({...d, notes: e.target.value}))}
                      rows={4}
                      placeholder={lang === "ar" ? "أضف ملاحظات..." : "Add notes..."}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {property.notes || (lang === "ar" ? "لا توجد ملاحظات" : "No notes")}
                    </p>
                  )}
                  <Separator className="my-3" />
                  <div className="flex gap-4 text-xs text-muted-foreground/70">
                    <span>{t("common.created")}: {new Date(property.createdAt).toLocaleDateString()}</span>
                    <span>{t("common.updated")}: {new Date(property.updatedAt).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ─── Photos Tab ────────────────────────────────────────────────── */}
        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="h-4 w-4 text-primary" />
                  {t("properties.photoGallery")}
                  {photoList.length > 0 && (
                    <Badge variant="secondary" className="text-xs">{photoList.length}</Badge>
                  )}
                </CardTitle>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadMutation.isPending}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    {uploadMutation.isPending ? t("common.loading") : t("properties.uploadPhotos")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Upload Progress Indicators */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="mb-4 space-y-2">
                  {Object.entries(uploadProgress).map(([name, progress]) => (
                    <div key={name} className="flex items-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                        <Upload className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{name}</p>
                        <Progress value={progress} className="h-1.5 mt-1" />
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">{progress}%</span>
                    </div>
                  ))}
                </div>
              )}

              {photoList.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-muted border">
                    <img
                      src={photoList[selectedPhotoIdx]?.fileUrl}
                      alt={photoList[selectedPhotoIdx]?.fileName}
                      className="w-full h-full object-cover"
                    />
                    {photoList.length > 1 && (
                      <>
                        <button
                          className="absolute start-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                          onClick={() => setSelectedPhotoIdx(i => (i - 1 + photoList.length) % photoList.length)}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                          className="absolute end-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                          onClick={() => setSelectedPhotoIdx(i => (i + 1) % photoList.length)}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                          {photoList.map((_: any, idx: number) => (
                            <button
                              key={idx}
                              className={`h-1.5 rounded-full transition-all ${idx === selectedPhotoIdx ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                              onClick={() => setSelectedPhotoIdx(idx)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                    {/* Photo counter */}
                    <div className="absolute top-2 end-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                      {selectedPhotoIdx + 1} / {photoList.length}
                    </div>
                  </div>
                  {/* Thumbnails */}
                  {photoList.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {photoList.map((photo: any, idx: number) => (
                        <button
                          key={photo.id}
                          className={`shrink-0 h-16 w-24 rounded-lg overflow-hidden border-2 transition-all ${idx === selectedPhotoIdx ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-border"}`}
                          onClick={() => setSelectedPhotoIdx(idx)}
                        >
                          <img src={photo.fileUrl} alt={photo.fileName} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Drag & Drop Zone for adding more photos */}
                  <div
                    ref={dropZoneRef}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                      isDragging
                        ? "border-primary bg-primary/5 scale-[1.01]"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3">
                      <Upload className={`h-5 w-5 ${isDragging ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
                      <p className="text-sm text-muted-foreground">
                        {isDragging
                          ? (lang === "ar" ? "أفلت الصور هنا..." : "Drop photos here...")
                          : (lang === "ar" ? "اسحب وأفلت صور إضافية أو اضغط للاختيار" : "Drag & drop more photos or click to browse")
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state with drag & drop */
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`text-center py-16 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border/40 hover:border-primary/30"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                    isDragging ? "bg-primary/10" : "bg-muted"
                  }`}>
                    <Image className={`h-8 w-8 ${isDragging ? "text-primary animate-bounce" : "text-muted-foreground/40"}`} />
                  </div>
                  <h3 className="font-semibold text-base mb-1">
                    {isDragging
                      ? (lang === "ar" ? "أفلت الصور هنا" : "Drop photos here")
                      : t("properties.noPhotos")
                    }
                  </h3>
                  <p className="text-sm text-muted-foreground mb-5">{t("properties.uploadFirst")}</p>
                  <Button
                    variant="outline"
                    className="gap-1.5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {t("properties.uploadPhotos")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Setup Progress Tab ────────────────────────────────────────── */}
        <TabsContent value="setup" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  {t("properties.setupProgress")}
                </CardTitle>
                <Badge
                  variant="outline"
                  className={`text-xs ${setupProgress.percent === 100 ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800" : ""}`}
                >
                  {setupProgress.completed} {t("properties.of")} {setupProgress.total} {t("properties.completed")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{t("properties.setupChecklist")}</span>
                  <span className={`text-sm font-bold ${setupProgress.percent === 100 ? "text-emerald-600" : "text-primary"}`}>
                    {setupProgress.percent}%
                  </span>
                </div>
                <Progress value={setupProgress.percent} className="h-2.5" />
              </div>

              {/* Checklist Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {checklistItems.map(item => {
                  const isComplete = property[item.key as keyof typeof property] as boolean;
                  const ItemIcon = item.icon;
                  return (
                    <div
                      key={item.key}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                        editing ? "cursor-pointer hover:border-primary/40" : ""
                      } ${isComplete
                        ? "bg-emerald-50/50 border-emerald-200/60 dark:bg-emerald-900/20 dark:border-emerald-800/40"
                        : "bg-card border-border/60"
                      }`}
                      onClick={() => {
                        if (editing) {
                          setEditData(d => ({...d, [item.key]: !d[item.key]}));
                        }
                      }}
                    >
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isComplete
                          ? "bg-emerald-100 dark:bg-emerald-900/40"
                          : "bg-muted"
                      }`}>
                        {(editing ? editData[item.key] : isComplete) ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${isComplete ? "text-emerald-700 dark:text-emerald-400" : "text-foreground/80"}`}>
                          {t(item.labelKey)}
                        </p>
                      </div>
                      <ItemIcon className={`h-4 w-4 shrink-0 ${isComplete ? "text-emerald-500/60" : "text-muted-foreground/30"}`} />
                    </div>
                  );
                })}
              </div>

              {/* Go Live Date */}
              {property.goLiveDate && (
                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">{t("properties.goLiveDate")}:</span>
                  <span className="font-medium">{new Date(property.goLiveDate).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ─── Financials Tab ────────────────────────────────────────────── */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FinancialCard
              icon={<Target className="h-5 w-5" />}
              label={t("properties.targetAdr")}
              value={property.targetAdr ? `${property.targetAdr} SAR` : undefined}
              editing={editing}
              editValue={editData.targetAdr}
              onEditChange={v => setEditData(d => ({...d, targetAdr: v}))}
              color="text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400"
            />
            <FinancialCard
              icon={<BarChart3 className="h-5 w-5" />}
              label={t("properties.targetOccupancy")}
              value={property.targetOccupancy ? `${property.targetOccupancy}%` : undefined}
              editing={editing}
              editValue={editData.targetOccupancy}
              onEditChange={v => setEditData(d => ({...d, targetOccupancy: v}))}
              color="text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400"
            />
            <FinancialCard
              icon={<DollarSign className="h-5 w-5" />}
              label={t("properties.monthlyGuarantee")}
              value={property.monthlyGuarantee ? `${property.monthlyGuarantee} SAR` : undefined}
              editing={editing}
              editValue={editData.monthlyGuarantee}
              onEditChange={v => setEditData(d => ({...d, monthlyGuarantee: v}))}
              color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400"
            />
            <FinancialCard
              icon={<TrendingUp className="h-5 w-5" />}
              label={t("properties.ffeBudget")}
              value={property.ffeBudget ? `${property.ffeBudget} SAR` : undefined}
              editing={editing}
              editValue={editData.ffeBudget}
              onEditChange={v => setEditData(d => ({...d, ffeBudget: v}))}
              color="text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400"
            />
          </div>

          {/* FF&E Actual if available */}
          {property.ffeActual && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t("properties.ffeActual")}</p>
                      <p className="font-bold text-lg">{property.ffeActual} SAR</p>
                    </div>
                  </div>
                  {property.ffeBudget && (
                    <div className="text-end">
                      <p className="text-xs text-muted-foreground">{lang === "ar" ? "الفرق" : "Variance"}</p>
                      <p className={`font-semibold ${parseFloat(property.ffeActual) <= parseFloat(property.ffeBudget) ? "text-emerald-600" : "text-red-600"}`}>
                        {(parseFloat(property.ffeActual) - parseFloat(property.ffeBudget)).toFixed(2)} SAR
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Helper Components ──────────────────────────────────────────────────────

function DetailRow({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon && <span className="text-muted-foreground/60">{icon}</span>}
        {label}
      </div>
      <span className="text-sm font-medium text-foreground/80">{value || "—"}</span>
    </div>
  );
}

function FinancialCard({
  icon, label, value, editing, editValue, onEditChange, color
}: {
  icon: React.ReactNode; label: string; value?: string; editing: boolean;
  editValue?: string; onEditChange: (v: string) => void; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            {editing ? (
              <Input
                value={editValue || ""}
                onChange={e => onEditChange(e.target.value)}
                className="h-8 text-sm"
              />
            ) : (
              <p className="font-bold text-lg truncate">{value || "—"}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
