/**
 * PIIClassifier — Enhanced PII detection and classification tool
 * 18 Saudi-specific PII patterns + InfoStealer + Smart Detection
 * Dark Observatory Theme — Uses tRPC API
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScanSearch,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Play,
  RotateCcw,
  FileText,
  Hash,
  Phone,
  Mail,
  CreditCard,
  User,
  History,
  Loader2,
  Bug,
  Database,
  Key,
  MapPin,
  Calendar,
  Stethoscope,
  Receipt,
  Car,
  BookOpen,
  Binary,
  Lock,
  Eye,
  DollarSign,
  Fingerprint,
  Globe,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { DetailModal } from "@/components/DetailModal";
import AnimatedCounter from "@/components/AnimatedCounter";

const sampleData = `=== عينة بيانات شخصية سعودية شاملة ===

محمد بن عبدالله الشمري
رقم الهوية: 1098765432
رقم الجوال: 0512345678
البريد: mohammed@company.sa
IBAN: SA0380000000608010167519
رقم جواز السفر: A12345678
رقم الرخصة: DL-2345678901
العنوان الوطني: RKAH8765 - الرياض 12345
تاريخ الميلاد: 1990/03/15
الراتب: 15,500 ريال
الرقم الضريبي: 300012345600003
رقم دفتر العائلة: 1234567890

فاطمة أحمد العتيبي
رقم الإقامة: 2087654321
رقم الجوال: 0598765432
البريد: fatima@hospital.sa
رقم السجل الطبي: MRN-2024-00456
IP: 192.168.1.100
بطاقة ائتمان: 4111-2222-3333-4444

=== بيانات InfoStealer (RedLine) ===
URL: https://banking.sa/login
Username: user@bank.sa
Password: P@ssw0rd123!

=== SQL Database Dump ===
SELECT national_id, phone, email FROM customers WHERE region='riyadh';
INSERT INTO users (iqama_no, salary) VALUES ('2098765432', 12000);

=== بيانات مقنّعة ===
هاتف: 05XX-XXX-1234
هوية: 10XXXXXXX2

=== Base64 Encoded ===
MTEyMjMzNDQ1NQ==`;

interface DetectedPII {
  type: string;
  typeAr: string;
  value: string;
  line: number;
  icon: React.ElementType;
  color: string;
  confidence: number;
  position: [number, number];
  category: string;
}

// 18 Saudi-specific PII patterns + InfoStealer + Smart Detection
const piiRegexPatterns = [
  // === Identity Data ===
  { type: "National ID", typeAr: "رقم الهوية الوطنية", regex: /\b1\d{9}\b/g, icon: Hash, color: "text-red-400", category: "identity", confidence: 0.98 },
  { type: "Iqama Number", typeAr: "رقم الإقامة", regex: /\b2\d{9}\b/g, icon: FileText, color: "text-amber-400", category: "identity", confidence: 0.97 },
  { type: "Passport", typeAr: "رقم جواز السفر", regex: /\b[A-Z]\d{8}\b/g, icon: Globe, color: "text-indigo-400", category: "identity", confidence: 0.85 },
  { type: "Family Book", typeAr: "رقم دفتر العائلة", regex: /\b\d{10}\b/g, icon: BookOpen, color: "text-pink-400", category: "identity", confidence: 0.60 },
  { type: "Driving License", typeAr: "رقم رخصة القيادة", regex: /\bDL[-]?\d{10}\b/gi, icon: Car, color: "text-orange-400", category: "identity", confidence: 0.92 },

  // === Contact Data ===
  { type: "Saudi Phone", typeAr: "رقم جوال سعودي", regex: /\b05\d{8}\b/g, icon: Phone, color: "text-cyan-400", category: "contact", confidence: 0.96 },
  { type: "Saudi Email", typeAr: "بريد إلكتروني سعودي", regex: /[\w.-]+@[\w.-]+\.sa\b/gi, icon: Mail, color: "text-violet-400", category: "contact", confidence: 0.95 },
  { type: "National Address", typeAr: "العنوان الوطني", regex: /\b[A-Z]{4}\d{4}\b/g, icon: MapPin, color: "text-teal-400", category: "contact", confidence: 0.88 },

  // === Financial Data ===
  { type: "IBAN", typeAr: "رقم الحساب البنكي", regex: /\bSA\d{22}\b/g, icon: CreditCard, color: "text-emerald-400", category: "financial", confidence: 0.99 },
  { type: "Credit Card", typeAr: "بطاقة ائتمان", regex: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, icon: CreditCard, color: "text-yellow-400", category: "financial", confidence: 0.90 },
  { type: "Tax Number", typeAr: "الرقم الضريبي", regex: /\b3\d{14}\b/g, icon: Receipt, color: "text-lime-400", category: "financial", confidence: 0.93 },
  { type: "Salary", typeAr: "الراتب", regex: /(?:راتب|salary|أجر)[:\s]*[\d,]+(?:\s*(?:ريال|SAR|SR))?/gi, icon: DollarSign, color: "text-green-400", category: "financial", confidence: 0.85 },

  // === Sensitive Data ===
  { type: "Date of Birth", typeAr: "تاريخ الميلاد", regex: /\b(?:19|20)\d{2}[\/\-]\d{2}[\/\-]\d{2}\b/g, icon: Calendar, color: "text-blue-400", category: "sensitive", confidence: 0.80 },
  { type: "Medical Record", typeAr: "السجل الطبي", regex: /\bMRN[-]?\d{4}[-]?\d{5}\b/gi, icon: Stethoscope, color: "text-rose-400", category: "sensitive", confidence: 0.94 },
  { type: "IP Address", typeAr: "عنوان IP", regex: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g, icon: Globe, color: "text-sky-400", category: "technical", confidence: 0.92 },

  // === Smart Detection: InfoStealer ===
  { type: "Credentials", typeAr: "بيانات تسجيل الدخول", regex: /(?:password|passwd|pass|كلمة.?(?:المرور|السر))[:\s]+\S+/gi, icon: Key, color: "text-red-500", category: "stealer", confidence: 0.95 },
  { type: "InfoStealer URL", typeAr: "رابط InfoStealer", regex: /(?:URL|Host)[:\s]+https?:\/\/[^\s]+(?:login|auth|bank|pay)/gi, icon: Bug, color: "text-red-600", category: "stealer", confidence: 0.90 },

  // === Smart Detection: SQL/Code ===
  { type: "SQL Pattern", typeAr: "نمط SQL", regex: /\b(?:SELECT|INSERT|UPDATE|DELETE|DROP)\b.*(?:national_id|phone|email|iqama|salary|password)/gi, icon: Database, color: "text-purple-400", category: "code", confidence: 0.88 },

  // === Smart Detection: Masked Data ===
  { type: "Masked Data", typeAr: "بيانات مقنّعة", regex: /\b(?:05|10|20)\d*X{3,}\d*\b/g, icon: Eye, color: "text-zinc-500", category: "masked", confidence: 0.75 },

  // === Smart Detection: Base64 ===
  { type: "Base64 Encoded", typeAr: "بيانات مشفرة Base64", regex: /\b[A-Za-z0-9+/]{20,}={1,2}\b/g, icon: Binary, color: "text-fuchsia-400", category: "encoded", confidence: 0.70 },
];

const categoryInfo: Record<string, { label: string; labelEn: string; color: string; icon: React.ElementType }> = {
  identity: { label: "بيانات الهوية", labelEn: "Identity Data", color: "border-red-500/30 bg-red-500/5", icon: Hash },
  contact: { label: "بيانات الاتصال", labelEn: "Contact Data", color: "border-cyan-500/30 bg-cyan-500/5", icon: Phone },
  financial: { label: "البيانات المالية", labelEn: "Financial Data", color: "border-emerald-500/30 bg-emerald-500/5", icon: CreditCard },
  sensitive: { label: "البيانات الحساسة", labelEn: "Sensitive Data", color: "border-amber-500/30 bg-amber-500/5", icon: Shield },
  technical: { label: "البيانات التقنية", labelEn: "Technical Data", color: "border-sky-500/30 bg-sky-500/5", icon: Globe },
  stealer: { label: "InfoStealer", labelEn: "InfoStealer Logs", color: "border-red-600/30 bg-red-600/5", icon: Bug },
  code: { label: "أنماط الكود", labelEn: "Code Patterns", color: "border-purple-500/30 bg-purple-500/5", icon: Database },
  masked: { label: "بيانات مقنّعة", labelEn: "Masked Data", color: "border-zinc-500/30 bg-zinc-500/5", icon: Eye },
  encoded: { label: "بيانات مشفرة", labelEn: "Encoded Data", color: "border-fuchsia-500/30 bg-fuchsia-500/5", icon: Binary },
};

const piiTypeColors: Record<string, string> = {
  "National ID": "text-red-400 bg-red-500/10 border-red-500/30",
  "Iqama Number": "text-amber-400 bg-amber-500/10 border-amber-500/30",
  "Phone Number": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  "Saudi Phone": "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  "Email": "text-violet-400 bg-violet-500/10 border-violet-500/30",
  "Saudi Email": "text-violet-400 bg-violet-500/10 border-violet-500/30",
  "IBAN": "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  "Full Name": "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "Passport": "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  "Credit Card": "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  "Credentials": "text-red-500 bg-red-500/10 border-red-500/30",
  "InfoStealer URL": "text-red-600 bg-red-600/10 border-red-600/30",
  "SQL Pattern": "text-purple-400 bg-purple-500/10 border-purple-500/30",
  "Masked Data": "text-zinc-500 bg-zinc-500/10 border-zinc-500/30",
  "Base64 Encoded": "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30",
  "National Address": "text-teal-400 bg-teal-500/10 border-teal-500/30",
  "Date of Birth": "text-blue-400 bg-blue-500/10 border-blue-500/30",
  "Medical Record": "text-rose-400 bg-rose-500/10 border-rose-500/30",
  "IP Address": "text-sky-400 bg-sky-500/10 border-sky-500/30",
  "Tax Number": "text-lime-400 bg-lime-500/10 border-lime-500/30",
  "Salary": "text-green-400 bg-green-500/10 border-green-500/30",
  "Family Book": "text-pink-400 bg-pink-500/10 border-pink-500/30",
  "Driving License": "text-orange-400 bg-orange-500/10 border-orange-500/30",
};

export default function PIIClassifier() {
  const [inputText, setInputText] = useState(sampleData);
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [apiResults, setApiResults] = useState<{
    results: Array<{ type: string; typeAr: string; value: string; line: number }>;
    totalMatches: number;
  } | null>(null);

  const { data: history, isLoading: historyLoading } = trpc.pii.history.useQuery();
  const scanMutation = trpc.pii.scan.useMutation();

  // Local regex scan with all 20 patterns
  const detectedPII = useMemo(() => {
    if (!hasScanned) return [];
    const results: DetectedPII[] = [];
    const lines = inputText.split("\n");

    lines.forEach((line, lineIdx) => {
      piiRegexPatterns.forEach((pattern) => {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        let match;
        while ((match = regex.exec(line)) !== null) {
          results.push({
            type: pattern.type,
            typeAr: pattern.typeAr,
            value: match[0],
            line: lineIdx + 1,
            icon: pattern.icon,
            color: pattern.color,
            confidence: pattern.confidence,
            position: [match.index, match.index + match[0].length],
            category: pattern.category,
          });
        }
      });
    });

    return results;
  }, [inputText, hasScanned]);

  const piiSummary = useMemo(() => {
    const summary: Record<string, number> = {};
    detectedPII.forEach((pii) => {
      summary[pii.typeAr] = (summary[pii.typeAr] || 0) + 1;
    });
    return summary;
  }, [detectedPII]);

  const categorySummary = useMemo(() => {
    const summary: Record<string, DetectedPII[]> = {};
    detectedPII.forEach((pii) => {
      if (!summary[pii.category]) summary[pii.category] = [];
      summary[pii.category].push(pii);
    });
    return summary;
  }, [detectedPII]);

  const handleScan = async () => {
    if (!inputText.trim()) {
      toast.error("الرجاء إدخال نص للفحص");
      return;
    }
    setIsScanning(true);
    setHasScanned(true);
    try {
      const result = await scanMutation.mutateAsync({ text: inputText });
      setApiResults(result);
      toast.success(`تم اكتشاف ${result.totalMatches} بيانات شخصية`, {
        description: "PII detection complete",
      });
    } catch {
      // Fall back to local scan
      toast.success(`تم اكتشاف ${detectedPII.length} بيانات شخصية (محلي)`, {
        description: "PII detection complete (local)",
      });
    } finally {
      setIsScanning(false);
      // Trigger global auto-scroll for main container
      setTimeout(() => window.dispatchEvent(new Event("rasid-auto-scroll")), 300);
    }
  };

  const handleReset = () => {
    setInputText(sampleData);
    setHasScanned(false);
    setApiResults(null);
    setExpandedCategory(null);
  };

  const matchCount = apiResults?.totalMatches ?? detectedPII.length;
  const riskScore = matchCount > 15 ? 95 : matchCount > 10 ? 85 : matchCount > 5 ? 70 : matchCount > 2 ? 50 : 20;
  const hasStealerData = detectedPII.some(p => p.category === "stealer");
  const hasSQLPatterns = detectedPII.some(p => p.category === "code");

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative rounded-xl overflow-hidden h-40"
      >
        <div className="absolute inset-0 bg-gradient-to-l from-emerald-500/10 via-background to-background dot-grid" />
        <div className="relative h-full flex flex-col justify-center px-6 lg:px-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <ScanSearch className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">مصنّف البيانات الشخصية المتقدم</h1>
              <p className="text-xs text-muted-foreground">Advanced PII Classifier — 20 Pattern • InfoStealer • Smart Detection</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-lg">
            محرك كشف متقدم يدعم 20 نمطاً سعودياً + كشف InfoStealer + أنماط SQL + Base64 + البيانات المقنّعة
          </p>
        </div>
      </motion.div>

      {/* Stats bar — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { key: "patterns", label: "نمط كشف", value: 20, color: "text-cyan-400", borderColor: "border-cyan-500/20", bgColor: "bg-cyan-500/5" },
          { key: "identity", label: "بيانات هوية", value: 5, color: "text-red-400", borderColor: "border-red-500/20", bgColor: "bg-red-500/5" },
          { key: "financial", label: "بيانات مالية", value: 4, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/5" },
          { key: "stealer", label: "InfoStealer", value: 2, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/5" },
          { key: "smart", label: "كشف ذكي", value: 3, color: "text-purple-400", borderColor: "border-purple-500/20", bgColor: "bg-purple-500/5" },
        ].map((stat) => (
          <div
            key={stat.key}
            className={`p-3 rounded-lg ${stat.bgColor} border ${stat.borderColor} text-center cursor-pointer hover:scale-[1.02] transition-all group`}
            onClick={() => setActiveModal(stat.key)}
          >
            <p className={`text-2xl font-bold ${stat.color}`}><AnimatedCounter value={typeof stat.value === "number" ? stat.value : 0} /></p>
            <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="scanner" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="scanner">الماسح التفاعلي</TabsTrigger>
          <TabsTrigger value="patterns">أنماط الكشف (20)</TabsTrigger>
          <TabsTrigger value="categories">التصنيفات</TabsTrigger>
          <TabsTrigger value="history">سجل الفحوصات</TabsTrigger>
        </TabsList>

        {/* Scanner tab */}
        <TabsContent value="scanner" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    النص المدخل
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleReset} className="gap-1.5 h-7 text-xs">
                      <RotateCcw className="w-3 h-3" />
                      إعادة تعيين
                    </Button>
                    <Button size="sm" onClick={handleScan} disabled={isScanning} className="gap-1.5 h-7 text-xs bg-primary text-primary-foreground">
                      {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                      فحص شامل
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={inputText}
                  onChange={(e) => { setInputText(e.target.value); setHasScanned(false); setApiResults(null); }}
                  className="w-full h-80 p-4 rounded-lg bg-black/30 border border-border text-sm font-mono text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="الصق النص هنا لفحص البيانات الشخصية..."
                  dir="auto"
                />
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  نتائج الكشف
                  {hasScanned && (
                    <Badge variant="outline" className="mr-2 bg-primary/10 border-primary/30 text-primary text-xs">
                      {matchCount} نتيجة
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!hasScanned ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ScanSearch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">اضغط "فحص شامل" لبدء الكشف عن البيانات الشخصية</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">20 نمط كشف + InfoStealer + SQL + Base64</p>
                    </div>
                  </div>
                ) : isScanning ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">جارٍ الفحص بـ 20 نمطاً...</p>
                    </div>
                  </div>
                ) : detectedPII.length === 0 ? (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
                      <p className="text-sm">لم يتم اكتشاف بيانات شخصية</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Risk score + alerts */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border">
                        <span className="text-sm text-foreground">درجة التأثير</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-2 rounded-full bg-secondary/50 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${riskScore}%` }}
                              transition={{ duration: 0.8 }}
                              className={`h-full rounded-full ${riskScore >= 80 ? "bg-red-500" : riskScore >= 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                            />
                          </div>
                          <span className={`text-sm font-bold ${riskScore >= 80 ? "text-red-400" : riskScore >= 50 ? "text-amber-400" : "text-emerald-400"}`}>
                            {riskScore}%
                          </span>
                        </div>
                      </div>

                      {/* InfoStealer alert */}
                      {hasStealerData && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
                        >
                          <Bug className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-red-400">تحذير: بيانات InfoStealer مكتشفة!</p>
                            <p className="text-[10px] text-red-400/70">تم اكتشاف بيانات تسجيل دخول مسروقة — يُحتمل أنها من برمجيات RedLine/Vidar</p>
                          </div>
                        </motion.div>
                      )}

                      {/* SQL alert */}
                      {hasSQLPatterns && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center gap-3"
                        >
                          <Database className="w-5 h-5 text-purple-400 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-semibold text-purple-400">تحذير: أنماط SQL مكتشفة!</p>
                            <p className="text-[10px] text-purple-400/70">تم اكتشاف استعلامات SQL تحتوي على أسماء أعمدة بيانات شخصية</p>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Category summary */}
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(categorySummary).map(([cat, items]) => {
                        const info = categoryInfo[cat];
                        if (!info) return null;
                        return (
                          <Badge key={cat} variant="outline" className={`${info.color} text-xs cursor-pointer`}
                            onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}>
                            {info.label}: {items.length}
                          </Badge>
                        );
                      })}
                    </div>

                    {/* Detailed results */}
                    <div className="h-40 overflow-y-auto space-y-2">
                      {detectedPII.map((pii, i) => {
                        const Icon = pii.icon;
                        return (
                          <motion.div
                            key={`${pii.type}-${pii.value}-${i}`}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/30 border border-border"
                          >
                            <Icon className={`w-4 h-4 ${pii.color} flex-shrink-0`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{pii.typeAr}</p>
                              <p className="text-[10px] text-muted-foreground">سطر {pii.line} • ثقة {Math.round(pii.confidence * 100)}%</p>
                            </div>
                            <code className="text-xs font-mono text-primary bg-primary/5 px-2 py-0.5 rounded truncate max-w-[200px]">
                              {pii.value}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                navigator.clipboard.writeText(pii.value);
                                toast("تم النسخ");
                              }}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patterns tab — all 20 patterns */}
        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {piiRegexPatterns.map((pattern, i) => {
              const Icon = pattern.icon;
              const catInfo = categoryInfo[pattern.category];
              return (
                <motion.div key={pattern.type} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                  <Card className="border-border hover:border-primary/30 transition-colors h-full">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                          <Icon className={`w-4.5 h-4.5 ${pattern.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-foreground truncate">{pattern.typeAr}</h3>
                          <p className="text-[10px] text-muted-foreground">{pattern.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className={`text-[9px] ${catInfo?.color || ""}`}>
                          {catInfo?.label || pattern.category}
                        </Badge>
                        <Badge variant="outline" className="text-[9px]">
                          ثقة {Math.round(pattern.confidence * 100)}%
                        </Badge>
                      </div>
                      <div className="p-2 rounded bg-black/30 border border-border">
                        <code className="text-[10px] font-mono text-primary break-all" dir="ltr">{pattern.regex.source}</code>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        {/* Categories tab — PDPL classification */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const Icon = info.icon;
              const patterns = piiRegexPatterns.filter(p => p.category === key);
              if (patterns.length === 0) return null;
              return (
                <Card key={key} className={`border ${info.color}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {info.label}
                      <Badge variant="outline" className="text-[10px] mr-auto">{patterns.length} أنماط</Badge>
                    </CardTitle>
                    <p className="text-[10px] text-muted-foreground">{info.labelEn}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {patterns.map((p) => {
                        const PIcon = p.icon;
                        return (
                          <div key={p.type} className="flex items-center gap-2 p-2 rounded bg-secondary/20 border border-border/50">
                            <PIcon className={`w-3.5 h-3.5 ${p.color} flex-shrink-0`} />
                            <span className="text-xs text-foreground flex-1">{p.typeAr}</span>
                            <span className="text-[9px] text-muted-foreground">{Math.round(p.confidence * 100)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* PDPL Compliance Categories */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                تصنيف البيانات حسب نظام حماية البيانات الشخصية (PDPL)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { category: "بيانات الهوية الشخصية", categoryEn: "Personal Identity Data", items: ["رقم الهوية الوطنية", "رقم الإقامة", "رقم جواز السفر", "رقم دفتر العائلة", "رقم رخصة القيادة"], color: "border-red-500/30", icon: "🪪" },
                  { category: "بيانات الاتصال", categoryEn: "Contact Data", items: ["رقم الجوال السعودي", "البريد الإلكتروني", "العنوان الوطني"], color: "border-cyan-500/30", icon: "📱" },
                  { category: "البيانات المالية", categoryEn: "Financial Data", items: ["رقم الحساب البنكي (IBAN)", "بطاقة الائتمان", "الرقم الضريبي", "الراتب والأجور"], color: "border-emerald-500/30", icon: "💳" },
                  { category: "البيانات الحساسة", categoryEn: "Sensitive Data", items: ["تاريخ الميلاد", "السجل الطبي", "البيانات البيومترية"], color: "border-amber-500/30", icon: "🔒" },
                  { category: "البيانات التقنية", categoryEn: "Technical Data", items: ["عنوان IP", "بيانات تسجيل الدخول", "بيانات InfoStealer"], color: "border-sky-500/30", icon: "🖥️" },
                  { category: "الكشف الذكي", categoryEn: "Smart Detection", items: ["أنماط SQL/قواعد البيانات", "البيانات المقنّعة", "البيانات المشفرة Base64"], color: "border-purple-500/30", icon: "🧠" },
                ].map((cat) => (
                  <div key={cat.category} className={`p-4 rounded-lg bg-secondary/20 border ${cat.color}`}>
                    <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                      <span>{cat.icon}</span> {cat.category}
                    </h4>
                    <p className="text-[10px] text-muted-foreground mb-2">{cat.categoryEn}</p>
                    <ul className="space-y-1">
                      {cat.items.map((item) => (
                        <li key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                سجل الفحوصات السابقة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : (history && history.length > 0) ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">التاريخ</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">حجم النص</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">النتائج</th>
                        <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">التأثير</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((scan) => {
                        const mc = scan.totalMatches ?? (scan.results?.length ?? 0);
                        const risk = mc > 15 ? 95 : mc > 10 ? 85 : mc > 5 ? 70 : mc > 2 ? 50 : 20;
                        return (
                          <tr key={scan.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString("ar-SA") : "—"}
                            </td>
                            <td className="py-3 px-4 text-xs text-foreground">{scan.inputText.length} حرف</td>
                            <td className="py-3 px-4 text-xs text-foreground font-medium">{mc} نتيجة</td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] px-2 py-1 rounded border ${
                                risk >= 80 ? "text-red-400 bg-red-500/10 border-red-500/30" :
                                risk >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
                                "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
                              }`}>
                                {risk}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">لا توجد فحوصات سابقة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ═══ MODALS ═══ */}
      <DetailModal open={activeModal === "patterns"} onClose={() => setActiveModal(null)} title="أنماط الكشف المتقدمة" icon={<ScanSearch className="w-5 h-5 text-cyan-400" />}>
        <div className="space-y-3">
          <div className="bg-cyan-500/10 rounded-xl p-3 border border-cyan-500/20 text-center">
            <p className="text-2xl font-bold text-cyan-400">20</p>
            <p className="text-xs text-muted-foreground">نمط كشف متقدم</p>
          </div>
          <p className="text-xs text-muted-foreground">يدعم المحرك 20 نمطاً للكشف عن البيانات الشخصية السعودية، تشمل بيانات الهوية والاتصال والبيانات المالية والحساسة، بالإضافة إلى الكشف الذكي عن InfoStealer وأنماط SQL والبيانات المشفرة.</p>
          <div className="space-y-2">
            {Object.entries(categoryInfo).map(([key, info]) => {
              const count = piiRegexPatterns.filter(p => p.category === key).length;
              if (count === 0) return null;
              const Icon = info.icon;
              return (
                <div key={key} className={`p-3 rounded-lg border ${info.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-2"><Icon className="w-4 h-4" /><span className="text-sm text-foreground">{info.label}</span></div>
                  <span className="text-sm font-bold text-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </DetailModal>

      <DetailModal open={activeModal === "identity"} onClose={() => setActiveModal(null)} title="أنماط بيانات الهوية" icon={<Hash className="w-5 h-5 text-red-400" />}>
        <div className="space-y-3">
          {piiRegexPatterns.filter(p => p.category === "identity").map(p => {
            const Icon = p.icon;
            return (
              <div key={p.type} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${p.color}`} /><span className="text-sm font-medium text-foreground">{p.typeAr}</span></div>
                <p className="text-[10px] text-muted-foreground">{p.type} • ثقة {Math.round(p.confidence * 100)}%</p>
                <code className="text-[10px] font-mono text-primary mt-1 block" dir="ltr">{p.regex.source}</code>
              </div>
            );
          })}
        </div>
      </DetailModal>

      <DetailModal open={activeModal === "financial"} onClose={() => setActiveModal(null)} title="أنماط البيانات المالية" icon={<CreditCard className="w-5 h-5 text-emerald-400" />}>
        <div className="space-y-3">
          {piiRegexPatterns.filter(p => p.category === "financial").map(p => {
            const Icon = p.icon;
            return (
              <div key={p.type} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${p.color}`} /><span className="text-sm font-medium text-foreground">{p.typeAr}</span></div>
                <p className="text-[10px] text-muted-foreground">{p.type} • ثقة {Math.round(p.confidence * 100)}%</p>
                <code className="text-[10px] font-mono text-primary mt-1 block" dir="ltr">{p.regex.source}</code>
              </div>
            );
          })}
        </div>
      </DetailModal>

      <DetailModal open={activeModal === "stealer"} onClose={() => setActiveModal(null)} title="أنماط InfoStealer" icon={<Bug className="w-5 h-5 text-amber-400" />}>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <p className="text-xs text-red-400">تكشف هذه الأنماط عن بيانات تسجيل الدخول المسروقة بواسطة برمجيات مثل RedLine و Vidar و Raccoon</p>
          </div>
          {piiRegexPatterns.filter(p => p.category === "stealer").map(p => {
            const Icon = p.icon;
            return (
              <div key={p.type} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${p.color}`} /><span className="text-sm font-medium text-foreground">{p.typeAr}</span></div>
                <p className="text-[10px] text-muted-foreground">{p.type} • ثقة {Math.round(p.confidence * 100)}%</p>
              </div>
            );
          })}
        </div>
      </DetailModal>

      <DetailModal open={activeModal === "smart"} onClose={() => setActiveModal(null)} title="الكشف الذكي" icon={<Zap className="w-5 h-5 text-purple-400" />}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">يشمل الكشف الذكي اكتشاف أنماط SQL التي تحتوي على أسماء أعمدة بيانات شخصية، والبيانات المقنّعة جزئياً، والبيانات المشفرة بـ Base64.</p>
          {piiRegexPatterns.filter(p => ["code", "masked", "encoded"].includes(p.category)).map(p => {
            const Icon = p.icon;
            return (
              <div key={p.type} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1"><Icon className={`w-4 h-4 ${p.color}`} /><span className="text-sm font-medium text-foreground">{p.typeAr}</span></div>
                <p className="text-[10px] text-muted-foreground">{p.type} • ثقة {Math.round(p.confidence * 100)}%</p>
              </div>
            );
          })}
        </div>
      </DetailModal>
    </div>
  );
}
