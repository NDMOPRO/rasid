import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ShieldCheck, X } from "lucide-react";

interface NavigationConsentDialogProps {
  isOpen: boolean;
  route: string;
  label: string;
  onConsent: (allowed: boolean) => void;
}

export default function NavigationConsentDialog({ isOpen, route, label, onConsent }: NavigationConsentDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center"
          style={{ backdropFilter: "blur(6px)", background: "rgba(0,0,0,0.5)" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(15, 40, 71, 0.98), rgba(11, 29, 53, 0.99))",
              border: "1px solid rgba(197, 165, 90, 0.25)",
            }}
            dir="rtl"
          >
            <button
              onClick={() => onConsent(false)}
              className="absolute top-3 left-3 text-[#D4DDEF]/40 hover:text-[#D4DDEF] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(61, 177, 172, 0.15)" }}>
                <ShieldCheck className="h-5 w-5 text-[#3DB1AC]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#D4DDEF]">طلب انتقال</h3>
                <p className="text-[10px] text-[#D4DDEF]/50">يقترح راصد الذكي الانتقال لصفحة أخرى</p>
              </div>
            </div>

            <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="text-xs text-[#D4DDEF]/70 mb-1">{label}</p>
              <div className="flex items-center gap-1.5 text-[#3DB1AC]">
                <ExternalLink className="h-3 w-3" />
                <span className="text-xs font-mono" dir="ltr">{route}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onConsent(true)}
                className="flex-1 h-9 rounded-xl text-xs font-medium text-white transition-colors"
                style={{ background: "linear-gradient(135deg, #3DB1AC, #2dd4bf)" }}
              >
                السماح بالانتقال
              </button>
              <button
                onClick={() => onConsent(false)}
                className="flex-1 h-9 rounded-xl text-xs font-medium text-[#D4DDEF]/60 hover:bg-white/5 transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
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
