import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Image, X, Loader2, File } from "lucide-react";

/**
 * ChatFileUpload — رفع الملفات في المحادثة (UI-20, UI-21)
 * يدعم: CSV, JSON, XLSX, PDF, PNG, JPG
 * يقوم بقراءة الملف وتحويله لنص يُرسل مع الرسالة
 */

interface ChatFileUploadProps {
  onFileContent: (content: string, fileName: string, fileType: string) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  "text/csv",
  "application/json",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
];

const ACCEPTED_EXTENSIONS = ".csv,.json,.xlsx,.pdf,.png,.jpg,.jpeg,.txt";

const FILE_ICONS: Record<string, typeof FileText> = {
  csv: FileText,
  json: FileText,
  xlsx: FileText,
  pdf: FileText,
  png: Image,
  jpg: Image,
  jpeg: Image,
  txt: FileText,
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export default function ChatFileUpload({ onFileContent, disabled }: ChatFileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string; size: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: globalThis.File) => {
    setError(null);

    if (file.size > MAX_FILE_SIZE) {
      setError("حجم الملف يتجاوز 10 ميغابايت");
      return;
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    setSelectedFile({ name: file.name, type: ext, size: file.size });
    setIsProcessing(true);

    try {
      let content = "";

      if (ext === "csv" || ext === "txt" || ext === "json") {
        content = await file.text();
        if (ext === "json") {
          // Pretty-print JSON
          try {
            content = JSON.stringify(JSON.parse(content), null, 2);
          } catch {
            // Keep as-is if invalid JSON
          }
        }
        // Truncate if too long
        if (content.length > 50000) {
          content = content.substring(0, 50000) + "\n\n... (تم اقتطاع الملف — حجمه كبير)";
        }
      } else if (ext === "png" || ext === "jpg" || ext === "jpeg") {
        // Convert image to base64 data URI
        const reader = new FileReader();
        content = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        content = `[صورة مرفقة: ${file.name}]\n${content.substring(0, 200)}...`;
      } else if (ext === "xlsx") {
        content = `[ملف إكسل مرفق: ${file.name}، الحجم: ${(file.size / 1024).toFixed(1)} كيلوبايت]\nلتحليل محتويات هذا الملف، يُرجى استخدام واجهة الاستيراد في المنصة أو رفعه عبر صفحة التقارير.`;
      } else if (ext === "pdf") {
        content = `[ملف PDF مرفق: ${file.name}، الحجم: ${(file.size / 1024).toFixed(1)} كيلوبايت]\nلتحليل محتويات هذا الملف، يُرجى استخدام واجهة الاستيراد.`;
      } else {
        content = `[ملف مرفق: ${file.name}]`;
      }

      onFileContent(content, file.name, ext);
    } catch (err) {
      setError("فشل في قراءة الملف");
    } finally {
      setIsProcessing(false);
    }
  }, [onFileContent]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input
    if (inputRef.current) inputRef.current.value = "";
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setError(null);
  }, []);

  const FileIcon = selectedFile ? (FILE_ICONS[selectedFile.type] || File) : Upload;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {/* Upload button */}
      <button
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        disabled={disabled || isProcessing}
        className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5 disabled:opacity-40"
        title="رفع ملف (CSV, JSON, PDF, صور)"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 text-[#C5A55A] animate-spin" />
        ) : (
          <Upload className="h-4 w-4 text-[#D4DDEF]/50 hover:text-[#C5A55A]" />
        )}
      </button>

      {/* Selected file indicator */}
      <AnimatePresence>
        {selectedFile && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full mb-1 right-0 flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px]"
            style={{ background: "rgba(197, 165, 90, 0.1)", border: "1px solid rgba(197, 165, 90, 0.2)" }}
          >
            <FileIcon className="h-3 w-3 text-[#C5A55A]" />
            <span className="text-[#D4DDEF]/70 max-w-[120px] truncate">{selectedFile.name}</span>
            <button onClick={clearFile} className="hover:text-red-400 transition-colors">
              <X className="h-2.5 w-2.5 text-[#D4DDEF]/40" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full mb-1 right-0 px-2 py-1 rounded-lg text-[10px] text-red-400"
            style={{ background: "rgba(239, 68, 68, 0.1)" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
