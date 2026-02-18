import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Search, Filter, Save, Trash2, Star, Download, ChevronLeft, ChevronRight,
  SlidersHorizontal, X, BookmarkPlus, RotateCcw, ExternalLink, Share2
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

interface SearchFilters {
  search: string;
  sector: string;
  classification: string;
  complianceStatus: string;
  siteStatus: string;
  dateFrom: string;
  dateTo: string;
  hasPrivacyPolicy: string;
  minScore: string;
  maxScore: string;
  sortBy: string;
  sortOrder: string;
}

const defaultFilters: SearchFilters = {
  search: "",
  sector: "",
  classification: "",
  complianceStatus: "",
  siteStatus: "",
  dateFrom: "",
  dateTo: "",
  hasPrivacyPolicy: "",
  minScore: "",
  maxScore: "",
  sortBy: "name",
  sortOrder: "asc",
};

const complianceStatusLabels: Record<string, string> = {
  compliant: "ممتثل",
  partially_compliant: "ممتثل جزئياً",
  non_compliant: "غير ممتثل",
  no_policy: "غير ممتثل",
  not_working: "لا يعمل",
};

const complianceStatusColors: Record<string, string> = {
  compliant: "bg-emerald-100 text-emerald-800",
  partially_compliant: "bg-amber-100 text-amber-800",
  non_compliant: "bg-red-100 text-red-800",
  no_policy: "bg-red-100 text-red-800",
  not_working: "bg-gray-100 text-gray-800",
};

export default function AdvancedSearch() {
  const { playClick, playHover } = useSoundEffects();
  const { user } = useAuth();
  const searchString = useSearch();
  // Using sonner toast
  const [filters, setFilters] = useState<SearchFilters>(() => {
    const params = new URLSearchParams(searchString);
    const initial = { ...defaultFilters };
    if (params.get("complianceStatus")) initial.complianceStatus = params.get("complianceStatus")!;
    if (params.get("sector")) initial.sector = params.get("sector")!;
    if (params.get("classification")) initial.classification = params.get("classification")!;
    if (params.get("siteStatus")) initial.siteStatus = params.get("siteStatus")!;
    if (params.get("hasPrivacyPolicy")) initial.hasPrivacyPolicy = params.get("hasPrivacyPolicy")!;
    return initial;
  });
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters>(() => {
    const params = new URLSearchParams(searchString);
    const initial = { ...defaultFilters };
    if (params.get("complianceStatus")) initial.complianceStatus = params.get("complianceStatus")!;
    if (params.get("sector")) initial.sector = params.get("sector")!;
    if (params.get("classification")) initial.classification = params.get("classification")!;
    if (params.get("siteStatus")) initial.siteStatus = params.get("siteStatus")!;
    if (params.get("hasPrivacyPolicy")) initial.hasPrivacyPolicy = params.get("hasPrivacyPolicy")!;
    return initial;
  });
  const [page, setPage] = useState(1);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [filterDescription, setFilterDescription] = useState("");
  const [filterIsShared, setFilterIsShared] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const limit = 25;

  // Build query input from applied filters
  const queryInput = useMemo(() => ({
    search: appliedFilters.search || undefined,
    sector: appliedFilters.sector || undefined,
    classification: appliedFilters.classification || undefined,
    complianceStatus: appliedFilters.complianceStatus || undefined,
    siteStatus: appliedFilters.siteStatus || undefined,
    dateFrom: appliedFilters.dateFrom || undefined,
    dateTo: appliedFilters.dateTo || undefined,
    hasPrivacyPolicy: appliedFilters.hasPrivacyPolicy === "true" ? true : appliedFilters.hasPrivacyPolicy === "false" ? false : undefined,
    minScore: appliedFilters.minScore ? Number(appliedFilters.minScore) : undefined,
    maxScore: appliedFilters.maxScore ? Number(appliedFilters.maxScore) : undefined,
    sortBy: appliedFilters.sortBy || undefined,
    sortOrder: appliedFilters.sortOrder || undefined,
    page,
    limit,
  }), [appliedFilters, page]);

  const { data: searchResults, isLoading } = trpc.advancedSearch.search.useQuery(queryInput);
  const { data: savedFiltersList, refetch: refetchFilters } = trpc.advancedSearch.savedFilters.list.useQuery();
  const createFilter = trpc.advancedSearch.savedFilters.create.useMutation({
    onSuccess: () => {
      refetchFilters();
      setShowSaveDialog(false);
      setFilterName("");
      setFilterDescription("");
      toast.success("تم حفظ القالب بنجاح");
    },
  });
  const deleteFilter = trpc.advancedSearch.savedFilters.delete.useMutation({
    onSuccess: () => {
      refetchFilters();
      toast.success("تم حذف القالب");
    },
  });
  const useFilter = trpc.advancedSearch.savedFilters.use.useMutation();

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
    setPage(1);
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setPage(1);
  }, []);

  const handleLoadFilter = useCallback((savedFilter: any) => {
    const f = savedFilter.filters as Record<string, string>;
    const newFilters: SearchFilters = {
      search: f.search || "",
      sector: f.sector || "",
      classification: f.classification || "",
      complianceStatus: f.complianceStatus || "",
      siteStatus: f.siteStatus || "",
      dateFrom: f.dateFrom || "",
      dateTo: f.dateTo || "",
      hasPrivacyPolicy: f.hasPrivacyPolicy || "",
      minScore: f.minScore || "",
      maxScore: f.maxScore || "",
      sortBy: f.sortBy || "name",
      sortOrder: f.sortOrder || "asc",
    };
    setFilters(newFilters);
    setAppliedFilters(newFilters);
    setPage(1);
    useFilter.mutate({ id: savedFilter.id });
    toast.success(`تم تحميل القالب: ${savedFilter.name}`);
  }, [useFilter, toast]);

  const handleSaveFilter = useCallback(() => {
    if (!filterName.trim()) return;
    createFilter.mutate({
      name: filterName,
      description: filterDescription || undefined,
      filters: filters as any,
      isShared: filterIsShared,
    });
  }, [filterName, filterDescription, filterIsShared, filters, createFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.search) count++;
    if (appliedFilters.sector) count++;
    if (appliedFilters.classification) count++;
    if (appliedFilters.complianceStatus) count++;
    if (appliedFilters.siteStatus) count++;
    if (appliedFilters.dateFrom) count++;
    if (appliedFilters.dateTo) count++;
    if (appliedFilters.hasPrivacyPolicy) count++;
    if (appliedFilters.minScore) count++;
    if (appliedFilters.maxScore) count++;
    return count;
  }, [appliedFilters]);

  const totalPages = Math.ceil((searchResults?.total || 0) / limit);

  return (
    <div
      className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">البحث والتصفية المتقدمة</h1>
          <p className="text-muted-foreground mt-1">بحث متقدم في قاعدة بيانات الجهات مع إمكانية حفظ قوالب التصفية</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 ms-2" />
            {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="me-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Saved Filter Templates */}
      {savedFiltersList && savedFiltersList.length > 0 && (
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              القوالب المحفوظة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedFiltersList.map((sf: any) => (
                <div key={sf.id} className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1.5">
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-sm font-medium" onClick={() => handleLoadFilter(sf)}>
                    {sf.name}
                  </Button>
                  {sf.isShared && <Share2 className="h-3 w-3 text-blue-500" />}
                  <span className="text-xs text-muted-foreground">({sf.usageCount || 0})</span>
                  {sf.userId === user?.id && (
                    <Button variant="ghost" size="sm" className="h-auto p-0 me-1" onClick={() => deleteFilter.mutate({ id: sf.id })}>
                      <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                فلاتر البحث
              </CardTitle>
              <div className="flex items-center gap-2">
                <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <BookmarkPlus className="h-4 w-4 ms-1" />
                      حفظ كقالب
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader>
                      <DialogTitle>حفظ قالب التصفية</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>اسم القالب</Label>
                        <Input value={filterName} onChange={(e) => setFilterName(e.target.value)} placeholder="مثال: الجهات الحكومية غير الممتثلة" />
                      </div>
                      <div>
                        <Label>الوصف (اختياري)</Label>
                        <Input value={filterDescription} onChange={(e) => setFilterDescription(e.target.value)} placeholder="وصف مختصر للقالب" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={filterIsShared} onCheckedChange={setFilterIsShared} />
                        <Label>مشاركة مع الفريق</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
                        <Save className="h-4 w-4 ms-1" />
                        حفظ
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                  <RotateCcw className="h-4 w-4 ms-1" />
                  إعادة تعيين
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
              {/* Search */}
              <div className="lg:col-span-2">
                <Label>بحث نصي</Label>
                <div className="relative">
                  <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pe-10" placeholder="اسم الجهة أو النطاق..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleApplyFilters()} />
                </div>
              </div>

              {/* Sector */}
              <div>
                <Label>القطاع</Label>
                <Select value={filters.sector} onValueChange={(v) => setFilters({ ...filters, sector: v === "all" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="جميع القطاعات" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع القطاعات</SelectItem>
                    <SelectItem value="public">حكومي</SelectItem>
                    <SelectItem value="private">خاص</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Classification */}
              <div>
                <Label>التصنيف</Label>
                <Input placeholder="التصنيف..." value={filters.classification} onChange={(e) => setFilters({ ...filters, classification: e.target.value })} />
              </div>

              {/* Compliance Status */}
              <div>
                <Label>حالة الامتثال</Label>
                <Select value={filters.complianceStatus} onValueChange={(v) => setFilters({ ...filters, complianceStatus: v === "all" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="جميع الحالات" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="compliant">ممتثل</SelectItem>
                    <SelectItem value="partially_compliant">ممتثل جزئياً</SelectItem>
                    <SelectItem value="non_compliant">غير ممتثل</SelectItem>
                    <SelectItem value="not_working">لا يعمل</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Site Status */}
              <div>
                <Label>حالة الموقع</Label>
                <Select value={filters.siteStatus} onValueChange={(v) => setFilters({ ...filters, siteStatus: v === "all" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="جميع الحالات" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="unreachable">غير متاح</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Privacy Policy */}
              <div>
                <Label>سياسة الخصوصية</Label>
                <Select value={filters.hasPrivacyPolicy} onValueChange={(v) => setFilters({ ...filters, hasPrivacyPolicy: v === "all" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="الكل" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="true">يوجد سياسة</SelectItem>
                    <SelectItem value="false">لا يوجد سياسة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Score Range */}
              <div>
                <Label>الحد الأدنى للنتيجة</Label>
                <Input type="number" min="0" max="100" placeholder="0" value={filters.minScore} onChange={(e) => setFilters({ ...filters, minScore: e.target.value })} />
              </div>
              <div>
                <Label>الحد الأقصى للنتيجة</Label>
                <Input type="number" min="0" max="100" placeholder="100" value={filters.maxScore} onChange={(e) => setFilters({ ...filters, maxScore: e.target.value })} />
              </div>

              {/* Date Range */}
              <div>
                <Label>من تاريخ</Label>
                <Input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
              </div>
              <div>
                <Label>إلى تاريخ</Label>
                <Input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
              </div>
            </div>

            <Separator className="my-4" />

            {/* Sort & Apply */}
            <div className="flex items-end gap-4">
              <div className="w-48">
                <Label>ترتيب حسب</Label>
                <Select value={filters.sortBy} onValueChange={(v) => setFilters({ ...filters, sortBy: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">الاسم</SelectItem>
                    <SelectItem value="domain">النطاق</SelectItem>
                    <SelectItem value="score">النتيجة</SelectItem>
                    <SelectItem value="date">تاريخ الفحص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-36">
                <Label>الاتجاه</Label>
                <Select value={filters.sortOrder} onValueChange={(v) => setFilters({ ...filters, sortOrder: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">تصاعدي</SelectItem>
                    <SelectItem value="desc">تنازلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleApplyFilters} className="px-8">
                <Search className="h-4 w-4 ms-2" />
                بحث
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              نتائج البحث
              {searchResults && (
                <span className="text-muted-foreground font-normal me-2">
                  ({searchResults.total.toLocaleString("ar-SA-u-nu-latn")} نتيجة)
                </span>
              )}
            </CardTitle>
            {searchResults && searchResults.total > 0 && (
              <Button variant="outline" size="sm" onClick={() => toast.info("ميزة التصدير قيد التطوير")}>
                <Download className="h-4 w-4 ms-1" />
                تصدير النتائج
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : searchResults && searchResults.results.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-end p-3 font-medium">الجهة</th>
                      <th className="text-end p-3 font-medium">النطاق</th>
                      <th className="text-end p-3 font-medium">القطاع</th>
                      <th className="text-end p-3 font-medium">التصنيف</th>
                      <th className="text-center p-3 font-medium">النتيجة</th>
                      <th className="text-center p-3 font-medium">حالة الامتثال</th>
                      <th className="text-center p-3 font-medium">الحالة</th>
                      <th className="text-center p-3 font-medium">آخر فحص</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.results.map((row: any, idx: number) => (
                      <tr key={row.id || idx} className="border-b hover:bg-[rgba(197,165,90,0.08)] transition-all duration-200">
                        <td className="p-3 font-medium max-w-[200px] truncate">{row.siteName || "—"}</td>
                        <td className="p-3 text-muted-foreground">
                          <a href={`https://${row.domain}`} target="_blank" rel="noopener" className="flex items-center gap-1 hover:text-primary">
                            {row.domain}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="p-3">{row.sectorType === "public" ? "حكومي" : "خاص"}</td>
                        <td className="p-3 text-muted-foreground">{row.classification || "—"}</td>
                        <td className="p-3 text-center">
                          <span className={`font-bold ${Number(row.overallScore) >= 70 ? "text-emerald-600" : Number(row.overallScore) >= 40 ? "text-amber-600" : "text-red-600"}`}>
                            {row.overallScore != null ? `${Math.round(Number(row.overallScore))}%` : "—"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {row.complianceStatus ? (
                            <Badge className={`${complianceStatusColors[row.complianceStatus] || "bg-gray-100 text-gray-800"} text-xs`}>
                              {complianceStatusLabels[row.complianceStatus] || row.complianceStatus}
                            </Badge>
                          ) : "—"}
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant={row.siteStatus === "active" ? "default" : "destructive"} className="text-xs">
                            {row.siteStatus === "active" ? "نشط" : "غير متاح"}
                          </Badge>
                        </td>
                        <td className="p-3 text-center text-muted-foreground text-xs">
                          {row.lastScanDate ? new Date(row.lastScanDate).toLocaleDateString("ar-SA-u-nu-latn") : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    صفحة {page} من {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      <ChevronRight className="h-4 w-4" />
                      السابق
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      التالي
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">لا توجد نتائج</p>
              <p className="text-sm mt-1">جرب تعديل معايير البحث أو استخدم قالب محفوظ</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
