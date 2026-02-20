import { motion } from "framer-motion";
import { Shield, Check, X, RotateCcw, AlertTriangle } from "lucide-react";

/**
 * ActionPreviewCard — بطاقة معاينة وتأكيد الإجراء (SEC-02, API-07, UI-08)
 * تعرض ملخص الإجراء المطلوب مع خيارات: تأكيد / إلغاء / معلومات إضافية
 */

interface ActionPreviewCardProps {
  actionType: string;
  description: string;
  previewData: Record<string, any>;
  actionRunId: number;
  status: "pending" | "confirmed" | "cancelled" | "executed" | "rolled_back" | "failed";
  onConfirm: (actionRunId: number) => void;
  onCancel: (actionRunId: number) => void;
  onRollback?: (actionRunId: number) => void;
}

const ACTION_LABELS: Record<string, string> = {
  create_leak: "إنشاء حالة رصد",
  update_status: "تحديث الحالة",
  create_report: "إنشاء تقرير",
  create_alert: "إنشاء تنبيه",
  delete_record: "حذف سجل",
  bulk_update: "تحديث جماعي",
  execute_scan: "تنفيذ فحص",
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: "rgba(245, 158, 11, 0.1)", text: "#f59e0b", label: "بانتظار التأكيد" },
  confirmed: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981", label: "تم التأكيد" },
  executed: { bg: "rgba(16, 185, 129, 0.1)", text: "#10b981", label: "تم التنفيذ" },
  cancelled: { bg: "rgba(107, 114, 128, 0.1)", text: "#6b7280", label: "ملغى" },
  rolled_back: { bg: "rgba(139, 92, 246, 0.1)", text: "#8b5cf6", label: "تم التراجع" },
  failed: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444", label: "فشل" },
};

export default function ActionPreviewCard({
  actionType,
  description,
  previewData,
  actionRunId,
  status,
  onConfirm,
  onCancel,
  onRollback,
}: ActionPreviewCardProps) {
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden my-3"
      style={{
        background: "rgba(15, 40, 71, 0.6)",
        border: `1px solid ${statusStyle.text}33`,
      }}
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: statusStyle.bg }}>
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4" style={{ color: statusStyle.text }} />
          <span className="text-xs font-medium" style={{ color: statusStyle.text }}>
            {ACTION_LABELS[actionType] || actionType}
          </span>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ background: `${statusStyle.text}20`, color: statusStyle.text }}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Description */}
      <div className="px-4 py-3">
        <p className="text-xs text-[#D4DDEF]/80 mb-2">{description}</p>

        {/* Preview data */}
        {previewData && Object.keys(previewData).length > 0 && (
          <div className="p-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <p className="text-[10px] text-[#D4DDEF]/40 mb-1.5">التغييرات المتوقعة:</p>
            <div className="space-y-1">
              {Object.entries(previewData).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="text-[10px] text-[#D4DDEF]/50 min-w-[80px]">{key}:</span>
                  <span className="text-[10px] text-[#D4DDEF]/80">{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      {status === "pending" && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/5">
          <button
            onClick={() => onConfirm(actionRunId)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
            style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}
          >
            <Check className="h-3 w-3" />
            تأكيد التنفيذ
          </button>
          <button
            onClick={() => onCancel(actionRunId)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium text-[#D4DDEF]/60 hover:text-[#D4DDEF] transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <X className="h-3 w-3" />
            إلغاء
          </button>
        </div>
      )}

      {status === "executed" && onRollback && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-t border-white/5">
          <button
            onClick={() => onRollback(actionRunId)}
            className="flex items-center gap-1.5 text-xs text-[#8b5cf6] hover:text-[#a78bfa] transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            التراجع عن الإجراء
          </button>
        </div>
      )}

      {status === "failed" && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-t border-white/5">
          <AlertTriangle className="h-3 w-3 text-red-400" />
          <span className="text-[10px] text-red-400">فشل تنفيذ الإجراء. حاول مرة أخرى أو تواصل مع المسؤول.</span>
        </div>
      )}
    </motion.div>
  );
}
