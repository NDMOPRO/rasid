/**
 * PrivacyImport — صفحة استيراد مواقع لمنصة رصد سياسة الخصوصية
 * تدعم: JSON, CSV, XLSX
 * مربوطة بـ REST API للاستيراد الفعلي
 * الأعمدة المدعومة: 25 عمود — الإلزامي فقط: النطاق
 */
import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Upload, FileText, FileSpreadsheet, Download,
  CheckCircle, XCircle, Loader2, ChevronLeft, AlertTriangle,
  Info, RefreshCw, Trash2, FileJson, Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { trpc } from "@/lib/trpc";

type ImportStatus = "idle" | "uploading" | "processing" | "completed" | "error";

interface ImportResult {
  jobId: string;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  errors: Array<{ record: number; error: string }>;
}

const SUPPORTED_FORMATS = [
  { ext: "json", label: "JSON", icon: FileJson, color: "text-amber-400", description: "ملف JSON بمصفوفة نطاقات/مواقع" },
  { ext: "csv", label: "CSV", icon: FileText, color: "text-green-400", description: "ملف CSV مع أعمدة النطاق والاسم والقطاع" },
  { ext: "xlsx", label: "Excel", icon: FileSpreadsheet, color: "text-blue-400", description: "ملف Excel مع بيانات المواقع" },
];

/** الأعمدة المدعومة في الاستيراد */
const IMPORT_COLUMNS = [
  { field: "النطاق", fieldEn: "domain", required: true },
  { field: "الحالة", fieldEn: "status", required: false },
  { field: "الرابط الفعال", fieldEn: "workingUrl", required: false },
  { field: "اسم الموقع بالعربية", fieldEn: "nameAr", required: false },
  { field: "اسم الموقع بالإنجليزية", fieldEn: "nameEn", required: false },
  { field: "العنوان", fieldEn: "title", required: false },
  { field: "الوصف", fieldEn: "description", required: false },
  { field: "الفئة", fieldEn: "category", required: false },
  { field: "البريد الإلكتروني", fieldEn: "email", required: false },
  { field: "أرقام الهاتف", fieldEn: "phone", required: false },
  { field: "سجلات MX", fieldEn: "mxRecords", required: false },
  { field: "نظام إدارة المحتوى", fieldEn: "cms", required: false },
  { field: "حالة SSL", fieldEn: "sslStatus", required: false },
  { field: "رابط السياسة", fieldEn: "policyUrl", required: false },
  { field: "عنوان السياسة", fieldEn: "policyTitle", required: false },
  { field: "كود الحالة", fieldEn: "policyStatusCode", required: false },
  { field: "لغة السياسة", fieldEn: "policyLanguage", required: false },
  { field: "اسم الجهة", fieldEn: "entityName", required: false },
  { field: "البريد", fieldEn: "entityEmail", required: false },
  { field: "الهاتف", fieldEn: "entityPhone", required: false },
  { field: "مسؤول حماية البيانات", fieldEn: "dpo", required: false },
  { field: "نموذج الاتصال", fieldEn: "contactForm", required: false },
  { field: "طريقة الاكتشاف", fieldEn: "discoveryMethod", required: false },
  { field: "مسار لقطة الشاشة", fieldEn: "screenshotUrl", required: false },
  { field: "مسار النص الكامل", fieldEn: "fullTextPath", required: false },
];

export default function PrivacyImport() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useUtils();

  const [status, setStatus] = useState<ImportStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["json", "csv", "xlsx"].includes(ext || "")) {
      toast.error("صيغة ملف غير مدعومة. يرجى استخدام JSON, CSV, أو XLSX");
      return;
    }
    setSelectedFile(file);
    setStatus("idle");
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setStatus("uploading");
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      setStatus("processing");
      const response = await fetch("/api/cms/import/privacy", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `فشل الاستيراد: ${response.statusText}`);
      }

      const data = await response.json();
      setStatus("completed");
      setResult(data);

      // Invalidate tRPC cache so privacy pages show the new data immediately
      utils.privacyDomains.list.invalidate();
      utils.privacyDomains.stats.invalidate();

      toast.success(`تم استيراد ${data.successRecords} من ${data.totalRecords} موقع بنجاح`);
    } catch (err: any) {
      setStatus("error");
      toast.error(`فشل الاستيراد: ${err.message}`);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setStatus("idle");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = () => {
    const headers = IMPORT_COLUMNS.map((c) => c.field);
    const csvContent = "\uFEFF" + headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "privacy_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("تم تحميل قالب الاستيراد");
  };

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setLocation("/privacy-operations")}
          className={`p-2 rounded-xl transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            استيراد مواقع للفحص
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-emerald-400/70" : "text-green-600"}`}>
            تغذية منصة رصد سياسة الخصوصية بمواقع جديدة
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <div className="lg:col-span-2">
          <Card className={`${isDark ? "bg-gray-900/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                رفع الملف
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Drag & Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
                  ${dragActive
                    ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
                    : isDark
                      ? "border-gray-700 hover:border-gray-600 bg-gray-800/30"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv,.xlsx"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <Globe className={`w-12 h-12 mx-auto mb-4 ${isDark ? "text-gray-500" : "text-gray-400"}`} />
                <p className={`font-medium ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                  اسحب ملف المواقع هنا أو انقر للاختيار
                </p>
                <p className={`text-xs mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                  يدعم: JSON, CSV, XLSX (حتى 50 ميجابايت)
                </p>
              </div>

              {/* Selected File */}
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mt-4 p-4 rounded-xl flex items-center justify-between ${
                    isDark ? "bg-gray-800/50 border border-gray-700/50" : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>{selectedFile.name}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        {(selectedFile.size / 1024).toFixed(1)} كيلوبايت
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || status === "uploading" || status === "processing"}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  {status === "uploading" || status === "processing" ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      {status === "uploading" ? "جاري الرفع..." : "جاري المعالجة..."}
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 ml-2" />
                      بدء الاستيراد
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="w-4 h-4 ml-2" />
                  تحميل القالب
                </Button>
                {result && (
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="w-4 h-4 ml-2" />
                    استيراد جديد
                  </Button>
                )}
              </div>

              {/* Results */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6"
                >
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className={`p-4 rounded-xl text-center ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-green-50 border border-green-200"}`}>
                      <CheckCircle className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                      <p className="text-2xl font-bold text-emerald-500">{result.successRecords}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>نجح</p>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDark ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                      <XCircle className="w-6 h-6 mx-auto mb-1 text-red-500" />
                      <p className="text-2xl font-bold text-red-500">{result.failedRecords}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>فشل</p>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${isDark ? "bg-blue-500/10 border border-blue-500/20" : "bg-blue-50 border border-blue-200"}`}>
                      <Info className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                      <p className="text-2xl font-bold text-blue-500">{result.totalRecords}</p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>إجمالي</p>
                    </div>
                  </div>

                  {/* Navigate to privacy sites */}
                  {result.successRecords > 0 && (
                    <Button
                      className="w-full mt-4"
                      onClick={() => setLocation("/app/privacy/sites")}
                    >
                      <Globe className="w-4 h-4 ml-2" />
                      عرض المواقع المستوردة ({result.successRecords.toLocaleString("ar-SA")} موقع)
                    </Button>
                  )}

                  {result.errors.length > 0 && (
                    <div className={`p-4 rounded-xl ${isDark ? "bg-red-500/5 border border-red-500/20" : "bg-red-50 border border-red-200"}`}>
                      <p className="text-sm font-medium text-red-500 mb-2">
                        <AlertTriangle className="w-4 h-4 inline-block ml-1" />
                        أخطاء ({result.errors.length})
                      </p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {result.errors.slice(0, 20).map((err, i) => (
                          <p key={i} className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                            سجل #{err.record}: {err.error}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Formats + Fields */}
        <div>
          <Card className={`${isDark ? "bg-gray-900/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                الصيغ المدعومة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SUPPORTED_FORMATS.map((fmt) => {
                const Icon = fmt.icon;
                return (
                  <div
                    key={fmt.ext}
                    className={`p-3 rounded-xl ${isDark ? "bg-gray-800/50 border border-gray-700/50" : "bg-gray-50 border border-gray-200"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${fmt.color}`} />
                      <span className={`font-medium text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        {fmt.label}
                      </span>
                      <Badge variant="outline" className="text-[9px]">.{fmt.ext}</Badge>
                    </div>
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      {fmt.description}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Field Mapping Guide */}
          <Card className={`mt-4 ${isDark ? "bg-gray-900/50 border-gray-700/50" : "bg-white border-gray-200"}`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isDark ? "text-white" : "text-gray-900"}`}>
                الأعمدة المدعومة
              </CardTitle>
              <p className={`text-xs mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                العمود الإلزامي الوحيد هو <span className="text-red-400 font-bold">النطاق</span>
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
                {IMPORT_COLUMNS.map((item) => (
                  <div key={item.fieldEn} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>{item.field}</span>
                      <span className={`text-[10px] mr-1 ${isDark ? "text-gray-500" : "text-gray-400"}`}>({item.fieldEn})</span>
                    </div>
                    <Badge variant="outline" className={`text-[9px] flex-shrink-0 ${item.required ? "border-red-500/30 text-red-400" : "border-gray-500/30 text-gray-400"}`}>
                      {item.required ? "إلزامي" : "اختياري"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
