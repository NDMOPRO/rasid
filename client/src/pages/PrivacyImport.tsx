/**
 * PrivacyImport — صفحة استيراد مواقع لمنصة رصد سياسة الخصوصية
 * تدعم: JSON, CSV, XLSX
 * مربوطة بـ API الاستيراد الفعلي عبر FormData upload
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

export default function PrivacyImport() {
  const [, setLocation] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (file.size > 500 * 1024 * 1024) {
      toast.error("حجم الملف يتجاوز 500 ميجابايت");
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
      formData.append("platform", "privacy");

      setStatus("processing");
      const response = await fetch("/api/cms/import/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: `خطأ في الخادم (${response.status})` }));
        throw new Error(errData.error || `خطأ في الخادم (${response.status})`);
      }

      const data: ImportResult = await response.json();
      setStatus("completed");
      setResult(data);
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

  return (
    <div className="overflow-x-hidden max-w-full min-h-screen p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => setLocation("/sites")}
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
                  يدعم: JSON, CSV, XLSX (حتى 500 ميجابايت)
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
                        {selectedFile.size >= 1024 * 1024
                          ? (selectedFile.size / (1024 * 1024)).toFixed(1) + " ميجابايت"
                          : (selectedFile.size / 1024).toFixed(1) + " كيلوبايت"
                        }
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

        {/* Supported Formats */}
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
                الحقول المطلوبة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { field: "domain / النطاق", required: true },
                  { field: "name / اسم الموقع", required: true },
                  { field: "sectorType / نوع القطاع", required: false },
                  { field: "category / الفئة", required: false },
                  { field: "classification / التصنيف", required: false },
                  { field: "siteStatus / حالة الموقع", required: false },
                  { field: "ownerEntity / الجهة المالكة", required: false },
                ].map((item) => (
                  <div key={item.field} className="flex items-center justify-between">
                    <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>{item.field}</span>
                    <Badge variant="outline" className={`text-[9px] ${item.required ? "border-red-500/30 text-red-400" : "border-gray-500/30 text-gray-400"}`}>
                      {item.required ? "مطلوب" : "اختياري"}
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
