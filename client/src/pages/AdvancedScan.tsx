import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { ScanSearch, Globe, Search, ListFilter, Link2, FileText, Settings2,
  Loader2, CheckCircle, XCircle, Camera, Zap, Shield, Layers,
  ArrowLeft, Play, ChevronDown, ChevronUp, Info, Rocket,
  Monitor, Clock, Database, Eye, LayoutGrid, Building2,
  Filter, Hash, AlertTriangle, ExternalLink, RefreshCw,
} from "lucide-react";
import ScanExecutionScreen from "@/components/ScanExecutionScreen";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

// Classification labels in Arabic
const CLASSIFICATION_LABELS: Record<string, string> = {
  'سعودي عام': 'سعودي عام',
  'تجاري': 'تجاري',
  'تقني / اتصالات': 'تقني / اتصالات',
  'منظمة / غير ربحي': 'منظمة / غير ربحي',
  'صحي / طبي': 'صحي / طبي',
  'تعليمي': 'تعليمي',
  'حكومي': 'حكومي',
  'مالي / مصرفي': 'مالي / مصرفي',
  'عقاري': 'عقاري',
  'تجارة الكترونية': 'تجارة الكترونية',
  'تقني / شبكات': 'تقني / شبكات',
  'طاقة / نفط': 'طاقة / نفط',
  'غذائي / مطاعم': 'غذائي / مطاعم',
  'نقل / لوجستي': 'نقل / لوجستي',
  'تعليمي / مدرسي': 'تعليمي / مدرسي',
};

const SECTOR_LABELS: Record<string, string> = {
  public: 'القطاع الحكومي',
  private: 'القطاع الخاص',
};

type SiteItem = {
  id: number;
  domain: string;
  siteName: string;
  sectorType: string;
  classification: string;
  screenshotUrl: string | null;
  complianceStatus: string;
  overallScore: number;
};

export default function AdvancedScan() {
  const { playClick, playHover } = useSoundEffects();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("manual");
  const [showOptions, setShowOptions] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [lastJobId, setLastJobId] = useState<number | null>(null);

  // Manual input
  const [manualUrl, setManualUrl] = useState("");

  // Category selection
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedClassification, setSelectedClassification] = useState<string>("");
  const [categorySelectedSites, setCategorySelectedSites] = useState<Set<number>>(new Set());
  const [selectAllCategory, setSelectAllCategory] = useState(false);

  // Search
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSelectedSites, setSearchSelectedSites] = useState<Set<number>>(new Set());

  // URL input
  const [urlsText, setUrlsText] = useState("");

  // Scan options
  const [options, setOptions] = useState({
    deepScan: false,
    parallelScan: true,
    captureScreenshots: true,
    extractText: true,
    scanApps: false,
    bypassDynamic: false,
    scanDepth: 1,
    timeout: 30,
  });

  // Data queries
  const classificationCounts = trpc.advancedScan.classificationCounts.useQuery(undefined, {
    staleTime: 60000,
  });
  const sectorCounts = trpc.advancedScan.sectorCounts.useQuery(undefined, {
    staleTime: 60000,
  });

  const filteredSites = trpc.advancedScan.filteredSites.useQuery(
    {
      sectorType: selectedSector || undefined,
      classification: selectedClassification || undefined,
      limit: 500,
    },
    {
      enabled: activeTab === "category" && (!!selectedSector || !!selectedClassification),
      staleTime: 30000,
    }
  );

  const searchResults = trpc.advancedScan.searchSites.useQuery(
    { keyword: searchQuery, limit: 50 },
    {
      enabled: !!searchQuery && searchQuery.length >= 1,
      staleTime: 30000,
    }
  );

  const openScanPopupRef = useRef<((jobId: number, totalUrls: number) => void) | null>(null);

  const executeMutation = trpc.advancedScan.execute.useMutation({
    onSuccess: (data) => {
      setShowConfirmDialog(false);
      openScanPopupRef.current?.(data.jobId, data.totalUrls);
    },
    onError: (err) => {
      toast.error(`خطأ: ${err.message}`);
    },
  });

  // Compute selected sites count
  const getSelectedCount = useCallback(() => {
    switch (activeTab) {
      case "manual":
        return manualUrl.trim() ? 1 : 0;
      case "category":
        return categorySelectedSites.size;
      case "search":
        return searchSelectedSites.size;
      case "urls":
        return urlsText.split('\n').filter(l => l.trim()).length;
      default:
        return 0;
    }
  }, [activeTab, manualUrl, categorySelectedSites, searchSelectedSites, urlsText]);

  // Handle category select all
  useEffect(() => {
    if (selectAllCategory && filteredSites.data) {
      const allIds = new Set(filteredSites.data.sites.map(s => s.id));
      setCategorySelectedSites(allIds);
    }
  }, [selectAllCategory, filteredSites.data]);

  // Build scan payload
  const buildPayload = () => {
    const siteIds: number[] = [];
    const urls: string[] = [];

    switch (activeTab) {
      case "manual":
        if (manualUrl.trim()) urls.push(manualUrl.trim());
        break;
      case "category":
        siteIds.push(...Array.from(categorySelectedSites));
        break;
      case "search":
        siteIds.push(...Array.from(searchSelectedSites));
        break;
      case "urls":
        urlsText.split('\n').forEach(l => {
          const u = l.trim();
          if (u) urls.push(u);
        });
        break;
    }

    return { inputMethod: activeTab, siteIds, urls, options };
  };

  // Job name for cinematic screen
  const jobNameLabel = useMemo(() => {
    const count = getSelectedCount();
    const tabLabels: Record<string, string> = {
      manual: 'فحص يدوي',
      category: `فحص حسب التصنيف`,
      search: `فحص بالبحث`,
      urls: 'فحص روابط متعددة',
    };
    return `${tabLabels[activeTab] || 'فحص'} - ${count} موقع`;
  }, [activeTab, getSelectedCount]);

  // Helper to open scan execution in popup window
  const openScanPopup = useCallback((jobId: number, totalUrls: number) => {
    const params = new URLSearchParams({
      totalUrls: totalUrls.toString(),
      jobName: jobNameLabel,
      deepScan: options.deepScan ? '1' : '0',
      parallelScan: options.parallelScan ? '1' : '0',
      captureScreenshots: options.captureScreenshots ? '1' : '0',
      extractText: options.extractText ? '1' : '0',
      scanApps: options.scanApps ? '1' : '0',
      bypassDynamic: options.bypassDynamic ? '1' : '0',
      scanDepth: options.scanDepth.toString(),
      timeout: options.timeout.toString(),
    });
    const url = `/scan-execution/${jobId}?${params.toString()}`;
    const width = Math.min(1400, window.screen.availWidth - 100);
    const height = Math.min(900, window.screen.availHeight - 100);
    const left = Math.round((window.screen.availWidth - width) / 2);
    const top = Math.round((window.screen.availHeight - height) / 2);
    const popup = window.open(
      url,
      `rasid_scan_${jobId}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`
    );
    // If popup was blocked, fallback to inline
    if (!popup || popup.closed) {
      setLastJobId(jobId);
      setShowProgressDialog(true);
      toast.info('تم فتح شاشة التنفيذ - لم يتم فتح النافذة المنبثقة (قد تكون محظورة)');
    } else {
      popup.focus();
      toast.success(`تم فتح نافذة التنفيذ - يمكنك متابعة العمل في المنصة`);
    }
  }, [jobNameLabel, options]);

  // Keep ref updated so mutation callback can access it
  openScanPopupRef.current = openScanPopup;

  const handleStartScan = () => {
    const count = getSelectedCount();
    if (count === 0) {
      toast.error("الرجاء تحديد مواقع للفحص");
      return;
    }
    setShowConfirmDialog(true);
  };

  const handleConfirmScan = () => {
    const payload = buildPayload();
    executeMutation.mutate(payload);
  };

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      setSearchQuery(searchKeyword.trim());
    }
  };

  // Classification counts grouped
  const classificationGroups = useMemo(() => {
    if (!classificationCounts.data) return [];
    const map = new Map<string, { classification: string; total: number; public: number; private: number }>();
    for (const item of classificationCounts.data) {
      const existing = map.get(item.classification) || { classification: item.classification, total: 0, public: 0, private: 0 };
      existing.total += item.siteCount;
      if (item.sectorType === 'public') existing.public += item.siteCount;
      else existing.private += item.siteCount;
      map.set(item.classification, existing);
    }
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [classificationCounts.data]);

  const totalSitesInDb = useMemo(() => {
    return classificationGroups.reduce((sum, g) => sum + g.total, 0);
  }, [classificationGroups]);

  const toggleCategorySite = (id: number) => {
    setCategorySelectedSites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setSelectAllCategory(false);
  };

  const toggleSearchSite = (id: number) => {
    setSearchSelectedSites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-emerald-600 bg-emerald-50';
      case 'partially_compliant': return 'text-amber-600 bg-amber-50';
      case 'non_compliant': return 'text-red-600 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'compliant': return 'ممتثل';
      case 'partially_compliant': return 'جزئي';
      case 'non_compliant': return 'غير ممتثل';
      default: return 'غير مفحوص';
    }
  };

  const SiteRow = ({ site, selected, onToggle }: { site: SiteItem; selected: boolean; onToggle: () => void }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 ${
        selected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border'
      }`}
      onClick={onToggle}
    >
      <Checkbox checked={selected} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{site.siteName || site.domain}</span>
          <Badge variant="outline" className={`text-xs sm:text-[10px] px-1.5 py-0 ${getStatusColor(site.complianceStatus)}`}>
            {getStatusLabel(site.complianceStatus)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{site.domain}</span>
          {site.classification && (
            <span className="text-xs sm:text-[10px] text-muted-foreground">• {site.classification}</span>
          )}
        </div>
      </div>
      {site.overallScore > 0 && (
        <span className="text-xs font-bold" style={{ color: site.overallScore >= 60 ? '#22c55e' : site.overallScore >= 40 ? '#f59e0b' : '#ef4444' }}>
          {site.overallScore}%
        </span>
      )}
    </div>
  );

  return (
    <div
      className="overflow-x-hidden max-w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 gradient-text">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            الفحص المتقدم
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            فحص ذكي ومتقدم لمواقع الويب مع خيارات متعددة للإدخال والتحليل
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5 px-3 py-1.5">
            <Database className="h-3.5 w-3.5" />
            {totalSitesInDb.toLocaleString('ar-SA-u-nu-latn')} موقع في القاعدة
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 stagger-children">
        {/* Left: Input Methods */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ListFilter className="h-5 w-5 text-primary" />
                طريقة الإدخال
              </CardTitle>
              <CardDescription>اختر طريقة تحديد المواقع المراد فحصها</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full mb-4 stagger-children">
                  <TabsTrigger value="manual" className="gap-1.5 text-xs">
                    <Globe className="h-3.5 w-3.5" />
                    يدوي
                  </TabsTrigger>
                  <TabsTrigger value="category" className="gap-1.5 text-xs">
                    <LayoutGrid className="h-3.5 w-3.5" />
                    التصنيفات
                  </TabsTrigger>
                  <TabsTrigger value="search" className="gap-1.5 text-xs">
                    <Search className="h-3.5 w-3.5" />
                    بحث
                  </TabsTrigger>
                  <TabsTrigger value="urls" className="gap-1.5 text-xs">
                    <Link2 className="h-3.5 w-3.5" />
                    روابط
                  </TabsTrigger>
                </TabsList>

                {/* Manual Input Tab */}
                <TabsContent value="manual" className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                    <Label className="text-sm font-medium mb-2 block">أدخل رابط الموقع مباشرة</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Globe className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="مثال: example.com.sa أو https://example.com"
                          value={manualUrl}
                          onChange={(e) => setManualUrl(e.target.value)}
                          className="pe-10"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      يمكنك إدخال النطاق فقط أو الرابط الكامل. سيتم إضافة https:// تلقائياً
                    </p>
                  </div>
                </TabsContent>

                {/* Category Selection Tab */}
                <TabsContent value="category" className="space-y-4">
                  {/* Sector Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">القطاع</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedSector === "" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setSelectedSector(""); setCategorySelectedSites(new Set()); setSelectAllCategory(false); }}
                        className="gap-1.5"
                      >
                        الكل
                        <Badge variant="secondary" className="text-xs sm:text-[10px] px-1.5 py-0">
                          {totalSitesInDb}
                        </Badge>
                      </Button>
                      {sectorCounts.data?.map(s => (
                        <Button
                          key={s.sectorType}
                          variant={selectedSector === s.sectorType ? "default" : "outline"}
                          size="sm"
                          onClick={() => { setSelectedSector(s.sectorType); setCategorySelectedSites(new Set()); setSelectAllCategory(false); }}
                          className="gap-1.5"
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {SECTOR_LABELS[s.sectorType] || s.sectorType}
                          <Badge variant="secondary" className="text-xs sm:text-[10px] px-1.5 py-0">
                            {s.siteCount}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Classification Filter */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">التصنيف</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={selectedClassification === "" ? "default" : "outline"}
                        size="sm"
                        onClick={() => { setSelectedClassification(""); setCategorySelectedSites(new Set()); setSelectAllCategory(false); }}
                      >
                        الكل
                      </Button>
                      {classificationGroups.map(g => (
                        <Button
                          key={g.classification}
                          variant={selectedClassification === g.classification ? "default" : "outline"}
                          size="sm"
                          onClick={() => { setSelectedClassification(g.classification); setCategorySelectedSites(new Set()); setSelectAllCategory(false); }}
                          className="gap-1.5"
                        >
                          {CLASSIFICATION_LABELS[g.classification] || g.classification}
                          <Badge variant="secondary" className="text-xs sm:text-[10px] px-1.5 py-0">
                            {selectedSector ? (selectedSector === 'public' ? g.public : g.private) : g.total}
                          </Badge>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Sites List */}
                  {(selectedSector || selectedClassification) && (
                    <div className="border rounded-lg">
                      <div className="flex items-center justify-between flex-wrap p-3 bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectAllCategory}
                            onCheckedChange={(checked) => {
                              setSelectAllCategory(!!checked);
                              if (!checked) setCategorySelectedSites(new Set());
                            }}
                          />
                          <span className="text-sm font-medium">
                            تحديد الكل
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {filteredSites.data?.total || 0} موقع
                          </Badge>
                        </div>
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {categorySelectedSites.size} محدد
                        </Badge>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="p-2 space-y-1.5">
                          {filteredSites.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              <span className="text-sm text-muted-foreground me-2">جاري التحميل...</span>
                            </div>
                          ) : filteredSites.data?.sites.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              لا توجد مواقع في هذا التصنيف
                            </div>
                          ) : (
                            filteredSites.data?.sites.map(site => (
                              <SiteRow
                                key={site.id}
                                site={site}
                                selected={categorySelectedSites.has(site.id)}
                                onToggle={() => toggleCategorySite(site.id)}
                              />
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>

                {/* Search Tab */}
                <TabsContent value="search" className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                    <Label className="text-sm font-medium mb-2 block">البحث عن مواقع بكلمة مفتاحية</Label>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute end-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="ابحث باسم الموقع أو النطاق..."
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                          className="pe-10"
                        />
                      </div>
                      <Button onClick={handleSearch} size="default" className="gap-1.5">
                        <Search className="h-4 w-4" />
                        بحث
                      </Button>
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="border rounded-lg">
                      <div className="flex items-center justify-between flex-wrap p-3 bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            نتائج البحث عن "{searchQuery}"
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {searchResults.data?.length || 0} نتيجة
                          </Badge>
                        </div>
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {searchSelectedSites.size} محدد
                        </Badge>
                      </div>
                      <ScrollArea className="h-[300px]">
                        <div className="p-2 space-y-1.5">
                          {searchResults.isLoading ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : searchResults.data?.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              لا توجد نتائج مطابقة
                            </div>
                          ) : (
                            searchResults.data?.map(site => (
                              <SiteRow
                                key={site.id}
                                site={site}
                                selected={searchSelectedSites.has(site.id)}
                                onToggle={() => toggleSearchSite(site.id)}
                              />
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </TabsContent>

                {/* URL Input Tab */}
                <TabsContent value="urls" className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded-lg border border-dashed">
                    <Label className="text-sm font-medium mb-2 block">أدخل روابط المواقع (رابط واحد في كل سطر)</Label>
                    <Textarea
                      placeholder={`example1.com.sa\nexample2.com\nhttps://example3.gov.sa\n...`}
                      value={urlsText}
                      onChange={(e) => setUrlsText(e.target.value)}
                      className="min-h-[200px] font-mono text-sm"
                      dir="ltr"
                    />
                    <div className="flex items-center justify-between flex-wrap mt-2">
                      <p className="text-xs text-muted-foreground">
                        أدخل رابط واحد في كل سطر. يمكنك إدخال النطاق فقط أو الرابط الكامل.
                      </p>
                      <Badge variant="outline" className="gap-1">
                        <Hash className="h-3 w-3" />
                        {urlsText.split('\n').filter(l => l.trim()).length} رابط
                      </Badge>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right: Scan Options & Actions */}
        <div className="space-y-4">
          {/* Scan Options */}
          <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
            <CardHeader className="pb-3 cursor-pointer" onClick={() => setShowOptions(!showOptions)}>
              <CardTitle className="text-lg flex items-center justify-between flex-wrap">
                <span className="flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-primary" />
                  خيارات الفحص
                </span>
                {showOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </CardTitle>
            </CardHeader>
            {showOptions && (
              <CardContent className="space-y-4">
                {/* Deep Scan */}
                <div className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-900/30 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">فحص عميق</Label>
                      <p className="text-xs sm:text-[11px] text-muted-foreground">البحث في مسارات إضافية عن صفحة الخصوصية</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.deepScan}
                    onCheckedChange={(v) => setOptions(o => ({ ...o, deepScan: v }))}
                  />
                </div>

                {/* Parallel Scan */}
                <div className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center btn-glow">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">مسح متوازي</Label>
                      <p className="text-xs sm:text-[11px] text-muted-foreground">فحص 5 مواقع في نفس الوقت لتسريع العملية</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.parallelScan}
                    onCheckedChange={(v) => setOptions(o => ({ ...o, parallelScan: v }))}
                  />
                </div>

                {/* Screenshots */}
                <div className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                      <Camera className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">لقطات الشاشة</Label>
                      <p className="text-xs sm:text-[11px] text-muted-foreground">التقاط صورة للموقع أثناء الفحص</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.captureScreenshots}
                    onCheckedChange={(v) => setOptions(o => ({ ...o, captureScreenshots: v }))}
                  />
                </div>

                {/* Extract Text */}
                <div className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-900/30 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">استخراج النصوص</Label>
                      <p className="text-xs sm:text-[11px] text-muted-foreground">استخراج محتوى صفحة الخصوصية النصي</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.extractText}
                    onCheckedChange={(v) => setOptions(o => ({ ...o, extractText: v }))}
                  />
                </div>

                {/* Scan Apps */}
                <div className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-900/30 flex items-center justify-center">
                      <Monitor className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">فحص التطبيقات</Label>
                      <p className="text-xs sm:text-[11px] text-muted-foreground">البحث عن تطبيقات الموقع في المتاجر</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.scanApps}
                    onCheckedChange={(v) => setOptions(o => ({ ...o, scanApps: v }))}
                  />
                </div>

                {/* Bypass Dynamic */}
                <div className="flex items-center justify-between flex-wrap p-3 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-900/30 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium">تجاوز المواقع الديناميكية</Label>
                      <p className="text-xs sm:text-[11px] text-muted-foreground">محاولة تحميل المحتوى الديناميكي (SPA)</p>
                    </div>
                  </div>
                  <Switch
                    checked={options.bypassDynamic}
                    onCheckedChange={(v) => setOptions(o => ({ ...o, bypassDynamic: v }))}
                  />
                </div>

                <Separator />

                {/* Timeout */}
                <div className="flex items-center justify-between flex-wrap">
                  <Label className="text-sm">مهلة الاتصال (ثانية)</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setOptions(o => ({ ...o, timeout: Math.max(10, o.timeout - 5) }))}
                    >-</Button>
                    <span className="text-sm font-mono w-8 text-center">{options.timeout}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => setOptions(o => ({ ...o, timeout: Math.min(120, o.timeout + 5) }))}
                    >+</Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Action Card */}
          <Card className="glass-card gold-sweep border-primary/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap">
                <span className="text-sm font-medium">المواقع المحددة</span>
                <Badge variant={getSelectedCount() > 0 ? "default" : "secondary"} className="text-lg px-3 py-1">
                  {getSelectedCount()}
                </Badge>
              </div>

              {/* Active options summary */}
              <div className="flex flex-wrap gap-1.5">
                {options.deepScan && <Badge variant="outline" className="text-xs sm:text-[10px] gap-1"><Layers className="h-2.5 w-2.5" /> عميق</Badge>}
                {options.parallelScan && <Badge variant="outline" className="text-xs sm:text-[10px] gap-1"><Zap className="h-2.5 w-2.5" /> متوازي</Badge>}
                {options.captureScreenshots && <Badge variant="outline" className="text-xs sm:text-[10px] gap-1"><Camera className="h-2.5 w-2.5" /> لقطات</Badge>}
                {options.extractText && <Badge variant="outline" className="text-xs sm:text-[10px] gap-1"><FileText className="h-2.5 w-2.5" /> نصوص</Badge>}
                {options.scanApps && <Badge variant="outline" className="text-xs sm:text-[10px] gap-1"><Monitor className="h-2.5 w-2.5" /> تطبيقات</Badge>}
                {options.bypassDynamic && <Badge variant="outline" className="text-xs sm:text-[10px] gap-1"><Shield className="h-2.5 w-2.5" /> ديناميكي</Badge>}
              </div>

              <Button
                onClick={handleStartScan}
                disabled={getSelectedCount() === 0 || executeMutation.isPending}
                className="w-full gap-2 h-12 text-base"
                size="lg"
              >
                {executeMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري البدء...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    بدء الفحص
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setLocation("/batch-scan")}
              >
                <Clock className="h-4 w-4" />
                عرض سجل الفحوصات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              تأكيد بدء الفحص
            </DialogTitle>
            <DialogDescription>
              سيتم فحص <strong>{getSelectedCount()}</strong> موقع بالخيارات التالية:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <div className="flex flex-wrap gap-1.5">
              {options.deepScan && <Badge variant="secondary" className="gap-1"><Layers className="h-3 w-3" /> فحص عميق</Badge>}
              {options.parallelScan && <Badge variant="secondary" className="gap-1"><Zap className="h-3 w-3" /> مسح متوازي</Badge>}
              {options.captureScreenshots && <Badge variant="secondary" className="gap-1"><Camera className="h-3 w-3" /> لقطات شاشة</Badge>}
              {options.extractText && <Badge variant="secondary" className="gap-1"><FileText className="h-3 w-3" /> استخراج نصوص</Badge>}
              {options.scanApps && <Badge variant="secondary" className="gap-1"><Monitor className="h-3 w-3" /> فحص تطبيقات</Badge>}
              {options.bypassDynamic && <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> تجاوز ديناميكي</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">
              الوقت المتوقع: ~{Math.ceil(getSelectedCount() * (options.parallelScan ? 6 : 30) / 60)} دقيقة
            </p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>إلغاء</Button>
            <Button onClick={handleConfirmScan} disabled={executeMutation.isPending} className="gap-2">
              {executeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              تأكيد وبدء الفحص
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fallback: Inline Scan Execution Screen (when popup is blocked) */}
      {showProgressDialog && lastJobId && (
        <ScanExecutionScreen
          jobId={lastJobId}
          totalUrls={getSelectedCount()}
          jobName={jobNameLabel}
          options={options}
          onClose={() => setShowProgressDialog(false)}
          onNewScan={() => {
            setShowProgressDialog(false);
            setLastJobId(null);
          }}
        />
      )}
    </div>
  );
}
