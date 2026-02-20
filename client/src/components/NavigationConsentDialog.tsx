import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, X } from "lucide-react";

/**
 * NavigationConsentDialog — حوار طلب إذن التنقل (CHAT-03, UI-08, API-09)
 * يظهر عندما يقترح راصد الذكي الانتقال لصفحة أخرى
 * المستخدم يختار: سماح (مع حفظ المحادثة) أو عدم سماح (استمرار في الصندوق)
 */

interface NavigationConsentDialogProps {
  isOpen: boolean;
  route: string;
  label: string;
  onConsent: (allowed: boolean) => void;
}

export default function NavigationConsentDialog({
  isOpen,
  route,
  label,
  onConsent,
}: NavigationConsentDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-[90vw] max-w-md rounded-2xl p-6 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(15, 40, 71, 0.98), rgba(11, 29, 53, 0.99))",
              border: "1px solid rgba(197, 165, 90, 0.2)",
            }}
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(197, 165, 90, 0.12)" }}
              >
                <ExternalLink className="h-5 w-5 text-[#C5A55A]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#D4DDEF]">
                  طلب انتقال لصفحة أخرى
                </h3>
                <p className="text-[11px] text-[#D4DDEF]/50">
                  راصد الذكي يقترح الانتقال
                </p>
              </div>
              <button
                onClick={() => onConsent(false)}
                className="mr-auto h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <X className="h-4 w-4 text-[#D4DDEF]/40" />
              </button>
            </div>

            {/* Body */}
            <div
              className="p-4 rounded-xl mb-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-xs text-[#D4DDEF]/70 mb-2">
                يقترح راصد الذكي الانتقال إلى:
              </p>
              <p className="text-sm font-medium text-[#C5A55A]">{label || route}</p>
              <p className="text-[10px] text-[#D4DDEF]/40 mt-1">
                المسار: {route}
              </p>
            </div>

            <p className="text-[11px] text-[#D4DDEF]/50 mb-4">
              سيتم الحفاظ على محادثتك الحالية عند الانتقال. يمكنك المتابعة من حيث توقفت.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => onConsent(true)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors"
                style={{ background: "linear-gradient(135deg, #C5A55A, #b8963f)" }}
              >
                سماح بالانتقال
              </button>
              <button
                onClick={() => onConsent(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#D4DDEF]/70 transition-colors hover:bg-white/5"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                البقاء هنا
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
