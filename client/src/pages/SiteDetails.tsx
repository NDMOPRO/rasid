import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLocation, useParams } from "wouter";
import {
  ArrowRight, ExternalLink, Shield, Clock, FileText, Globe, Lock, Mail,
  Phone, MapPin, User, Search, CheckCircle, XCircle, AlertTriangle,
  Eye, Server, Link2, BookOpen, Scale, Users, ShieldCheck, Cookie,
  Baby, Database, Target, Gavel, Trash2, Building2, Fingerprint
} from "lucide-react";

function StatusBadge({ value, trueLabel = "نعم", falseLabel = "لا" }: { value: any; trueLabel?: string; falseLabel?: string }) {
  const isTrue = value === 1 || value === true || value === "نعم" || value === "yes";
  return (
    <Badge variant={isTrue ? "default" : "outline"} className={isTrue ? "bg-emerald-600/80" : "bg-red-900/30 text-red-400 border-red-800/50"}>
      {isTrue ? (
        <><CheckCircle className="h-3 w-3 ml-1" />{trueLabel}</>
      ) : (
        <><XCircle className="h-3 w-3 ml-1" />{falseLabel}</>
      )}
    </Badge>
  );
}

function InfoRow({ icon: Icon, label, value, isLink, isList }: { icon: any; label: string; value: any; isLink?: boolean; isList?: boolean }) {
  if (value === null || value === undefined || value === "") return null;
  const strVal = String(value);

  if (isList && strVal.includes("|")) {
    const items = strVal.split("|").filter(Boolean);
    return (
      <div className="flex gap-3 py-3 border-b border-border/20 last:border-0">
        <Icon className="h-4 w-4 text-amber-400 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground mb-1">{label}</p>
          <div className="flex flex-wrap gap-1.5">
            {items.map((item, i) => (
              <Badge key={i} variant="secondary" className="text-xs font-normal bg-secondary/60">
                {item.trim()}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 py-3 border-b border-border/20 last:border-0">
      <Icon className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        {isLink ? (
          <a href={strVal} target="_blank" rel="noopener noreferrer" className="text-sm text-cyan-400 hover:underline break-all flex items-center gap-1">
            {strVal} <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <p className="text-sm font-medium break-all">{strVal}</p>
        )}
      </div>
    </div>
  );
}

function ComplianceScoreBar({ score }: { score: number }) {
  const color = score >= 75 ? "bg-emerald-500" : score >= 38 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span>درجة الامتثال</span>
        <span className="font-bold">{score}%</span>
      </div>
      <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function complianceLabel(status: string | null | undefined) {
  switch (status) {
    case "compliant": return { text: "ممتثل", variant: "default" as const, className: "bg-emerald-600/80" };
    case "partially_compliant": return { text: "ممتثل جزئياً", variant: "secondary" as const, className: "bg-amber-600/80" };
    case "non_compliant": return { text: "غير ممتثل", variant: "destructive" as const, className: "bg-red-600/80" };
    case "no_policy": return { text: "بدون سياسة", variant: "outline" as const, className: "bg-gray-600/50" };
    default: return { text: status || "غير محدد", variant: "outline" as const, className: "" };
  }
}

function statusLabel(status: string | null | undefined) {
  switch (status) {
    case "يعمل": return { text: "يعمل", className: "bg-emerald-600/80" };
    case "لا يعمل": return { text: "لا يعمل", className: "bg-red-600/80" };
    default: return { text: status || "غير محدد", className: "bg-gray-600/50" };
  }
}

export default function SiteDetails() {
  const params = useParams<{ siteId: string }>();
  const siteId = parseInt(params.siteId || "0");
  const [, setLocation] = useLocation();

  const { data: site, isLoading } = trpc.privacy.siteById.useQuery({ id: siteId });

  if (isLoading) {
    return (
      <div className="overflow-x-hidden max-w-full space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="text-center py-20">
        <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-lg">الموقع غير موجود</p>
        <Button variant="outline" className="mt-4" onClick={() => setLocation("/app/privacy/sites")}>
          <ArrowRight className="h-4 w-4 ml-2" />
          العودة للمواقع
        </Button>
      </div>
    );
  }

  const s: any = site;
  const comp = complianceLabel(s.complianceStatus);
  const st = statusLabel(s.status);

  // PDPL clauses check
  const pdplClauses = [
    { label: "أنواع البيانات المجمعة", key: "mentionsDataTypes", icon: Database, list: s.dataTypesList },
    { label: "أغراض المعالجة", key: "mentionsPurpose", icon: Target, list: s.purposeList },
    { label: "الأساس القانوني", key: "mentionsLegalBasis", icon: Gavel, list: null },
    { label: "حقوق أصحاب البيانات", key: "mentionsRights", icon: Scale, list: s.rightsList },
    { label: "فترة الاحتفاظ", key: "mentionsRetention", icon: Clock, list: null },
    { label: "الأطراف الثالثة", key: "mentionsThirdParties", icon: Users, list: s.thirdPartiesList },
    { label: "النقل عبر الحدود", key: "mentionsCrossBorder", icon: Globe, list: null },
    { label: "التدابير الأمنية", key: "mentionsSecurity", icon: ShieldCheck, list: null },
    { label: "ملفات تعريف الارتباط", key: "mentionsCookies", icon: Cookie, list: null },
    { label: "حماية الأطفال", key: "mentionsChildren", icon: Baby, list: null },
  ];

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/app/privacy/sites")}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{s.nameAr || s.nameEn || s.title || s.domain}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <a href={s.workingUrl || s.finalUrl || `https://${s.domain}`} target="_blank" rel="noopener noreferrer"
              className="text-sm text-cyan-400 hover:underline flex items-center gap-1">
              {s.domain} <ExternalLink className="h-3 w-3" />
            </a>
            {s.classification && (
              <Badge variant="secondary" className="text-xs">{s.classification}</Badge>
            )}
            <Badge className={st.className}>{st.text}</Badge>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4 gold-edge">
          <p className="text-xs text-muted-foreground mb-2">حالة الامتثال</p>
          <Badge className={comp.className + " text-sm"}>{comp.text}</Badge>
          {s.complianceScore != null && (
            <div className="mt-3"><ComplianceScoreBar score={s.complianceScore} /></div>
          )}
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-2">سياسة الخصوصية</p>
          <StatusBadge value={s.policyUrl && s.policyUrl !== "لم يتم العثور"} trueLabel="موجودة" falseLabel="غير موجودة" />
          {s.policyWordCount && (
            <p className="text-xs text-muted-foreground mt-2">{Number(s.policyWordCount).toLocaleString("ar-SA")} كلمة</p>
          )}
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-2">شهادة SSL</p>
          <Badge className={s.sslStatus === "صالح" ? "bg-emerald-600/80" : "bg-red-600/80"}>
            <Lock className="h-3 w-3 ml-1" />
            {s.sslStatus || "غير متاح"}
          </Badge>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground mb-2">نظام إدارة المحتوى</p>
          <p className="font-medium text-sm">{s.cms || "غير محدد"}</p>
          {s.crawlStatus && (
            <Badge variant="outline" className="mt-2 text-xs">{s.crawlStatus}</Badge>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pdpl" className="w-full">
        <TabsList className="bg-secondary/50 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="pdpl">تحليل PDPL</TabsTrigger>
          <TabsTrigger value="site">معلومات الموقع</TabsTrigger>
          <TabsTrigger value="privacy">سياسة الخصوصية</TabsTrigger>
          <TabsTrigger value="contact">بيانات التواصل</TabsTrigger>
          <TabsTrigger value="technical">التفاصيل التقنية</TabsTrigger>
        </TabsList>

        {/* PDPL Analysis Tab */}
        <TabsContent value="pdpl" className="mt-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-400" />
              تحليل الامتثال لنظام حماية البيانات الشخصية (PDPL)
            </h3>
            <div className="space-y-3">
              {pdplClauses.map((clause) => (
                <div key={clause.key} className="glass-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <clause.icon className="h-4 w-4 text-amber-400" />
                      <span className="font-medium text-sm">{clause.label}</span>
                    </div>
                    <StatusBadge value={s[clause.key]} trueLabel="مذكور" falseLabel="غير مذكور" />
                  </div>
                  {clause.list && String(clause.list).includes("|") && (
                    <div className="flex flex-wrap gap-1.5 mt-2 pr-6">
                      {String(clause.list).split("|").filter(Boolean).map((item, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal bg-secondary/60">
                          {item.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {clause.list && !String(clause.list).includes("|") && (
                    <p className="text-xs text-muted-foreground mt-1 pr-6">{String(clause.list)}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Site Info Tab */}
        <TabsContent value="site" className="mt-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-400" />
              معلومات الموقع
            </h3>
            <InfoRow icon={Globe} label="النطاق" value={s.domain} />
            <InfoRow icon={Globe} label="الرابط العامل" value={s.workingUrl} isLink />
            <InfoRow icon={Globe} label="الرابط النهائي" value={s.finalUrl} isLink />
            <InfoRow icon={FileText} label="الاسم بالعربي" value={s.nameAr} />
            <InfoRow icon={FileText} label="الاسم بالإنجليزي" value={s.nameEn} />
            <InfoRow icon={FileText} label="العنوان (title)" value={s.title} />
            <InfoRow icon={FileText} label="الوصف" value={s.description} />
            <InfoRow icon={Building2} label="التصنيف" value={s.classification} />
            <InfoRow icon={Building2} label="الفئة" value={s.category} />
            <InfoRow icon={Server} label="نظام إدارة المحتوى" value={s.cms} />
            <InfoRow icon={Lock} label="حالة SSL" value={s.sslStatus} />
            <InfoRow icon={Mail} label="سجلات MX" value={s.mxRecords} isList />

            {/* HTTP Status Codes */}
            {(s.httpsWww || s.httpsNoWww || s.httpWww || s.httpNoWww) && (
              <div className="mt-4 pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground mb-3">أكواد استجابة HTTP</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { label: "HTTPS + www", val: s.httpsWww },
                    { label: "HTTPS بدون www", val: s.httpsNoWww },
                    { label: "HTTP + www", val: s.httpWww },
                    { label: "HTTP بدون www", val: s.httpNoWww },
                  ].map((item, i) => (
                    <div key={i} className="bg-secondary/30 rounded-lg p-2 text-center">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={`font-mono font-bold ${item.val === "200" ? "text-emerald-400" : "text-red-400"}`}>
                        {item.val || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Privacy Policy Tab */}
        <TabsContent value="privacy" className="mt-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-amber-400" />
              سياسة الخصوصية
            </h3>
            <InfoRow icon={Link2} label="رابط سياسة الخصوصية" value={s.policyUrl} isLink />
            <InfoRow icon={Link2} label="الرابط النهائي للسياسة" value={s.policyFinalUrl} isLink />
            <InfoRow icon={FileText} label="عنوان السياسة" value={s.policyTitle} />
            <InfoRow icon={Server} label="كود الاستجابة" value={s.policyStatusCode} />
            <InfoRow icon={Globe} label="لغة السياسة" value={s.policyLanguage} />
            <InfoRow icon={Clock} label="آخر تحديث" value={s.policyLastUpdate} />
            <InfoRow icon={Search} label="طريقة الاكتشاف" value={s.discoveryMethod} />
            <InfoRow icon={Fingerprint} label="درجة الثقة" value={s.policyConfidence ? `${s.policyConfidence}%` : null} />
            <InfoRow icon={FileText} label="عدد الكلمات" value={s.policyWordCount ? Number(s.policyWordCount).toLocaleString("ar-SA") : null} />
            <InfoRow icon={FileText} label="عدد الأحرف" value={s.policyCharCount ? Number(s.policyCharCount).toLocaleString("ar-SA") : null} />
            <InfoRow icon={Server} label="حالة Robots" value={s.robotsStatus} />
            <InfoRow icon={Link2} label="الروابط الداخلية" value={s.internalLinks} isList />
          </div>
        </TabsContent>

        {/* Contact Info Tab */}
        <TabsContent value="contact" className="mt-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-amber-400" />
              بيانات التواصل
            </h3>

            <div className="mb-6">
              <h4 className="text-sm font-bold text-muted-foreground mb-3">بيانات الموقع</h4>
              <InfoRow icon={Mail} label="البريد الإلكتروني" value={s.email} isList />
              <InfoRow icon={Phone} label="الهاتف" value={s.phone} isList />
            </div>

            <div className="border-t border-border/20 pt-4">
              <h4 className="text-sm font-bold text-muted-foreground mb-3">بيانات من سياسة الخصوصية</h4>
              <InfoRow icon={Building2} label="اسم الجهة" value={s.entityName} />
              <InfoRow icon={Mail} label="البريد الإلكتروني (السياسة)" value={s.entityEmail} isList />
              <InfoRow icon={Phone} label="الهاتف (السياسة)" value={s.entityPhone} isList />
              <InfoRow icon={MapPin} label="العنوان" value={s.entityAddress} />
              <InfoRow icon={User} label="مسؤول حماية البيانات (DPO)" value={s.dpo} />
              <InfoRow icon={Link2} label="نموذج التواصل" value={s.contactForm} isLink />
            </div>
          </div>
        </TabsContent>

        {/* Technical Tab */}
        <TabsContent value="technical" className="mt-4">
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Server className="h-5 w-5 text-amber-400" />
              التفاصيل التقنية
            </h3>
            <InfoRow icon={Eye} label="حالة الزحف" value={s.crawlStatus} />
            <InfoRow icon={Server} label="حالة الموقع" value={s.status} />
            <InfoRow icon={Server} label="نظام إدارة المحتوى" value={s.cms} />
            <InfoRow icon={Lock} label="شهادة SSL" value={s.sslStatus} />
            <InfoRow icon={Mail} label="سجلات MX" value={s.mxRecords} isList />
            <InfoRow icon={Server} label="حالة Robots" value={s.robotsStatus} />
            <InfoRow icon={FileText} label="مسار لقطة الشاشة" value={s.screenshotUrl} />
            <InfoRow icon={FileText} label="مسار النص الكامل" value={s.fullTextPath} />

            {s.importedAt && (
              <InfoRow icon={Clock} label="تاريخ الاستيراد" value={new Date(s.importedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} />
            )}
            {s.lastScanAt && (
              <InfoRow icon={Clock} label="آخر فحص" value={new Date(s.lastScanAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
