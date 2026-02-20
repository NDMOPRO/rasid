import { memo, useMemo } from "react";
import { Streamdown } from "streamdown";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  BarChart3,
  FileText,
  Shield,
  Clock,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

/**
 * FormattedAIResponse — عرض ردود راصد الذكي بتنسيق احترافي
 * يدعم: بطاقات KPI، جداول، روابط Drillthrough، إجراءات مقترحة،
 * مؤشرات الحالة، والتنسيق الغني (UI-04, UI-05, PR-05)
 */

interface FormattedAIResponseProps {
  content: string;
  isStreaming?: boolean;
  toolsUsed?: string[];
  thinkingSteps?: Array<{
    id: string;
    agent: string;
    action: string;
    description: string;
    status: string;
    durationMs?: number;
    toolCategory?: string;
  }>;
  followUpSuggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  navigationRequest?: { route: string; label: string };
  onNavigationConsent?: (route: string, allowed: boolean) => void;
  showToolTrace?: boolean;
}

// Badge colors for tool categories
const TOOL_CATEGORY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  read: { bg: "rgba(14, 165, 233, 0.15)", text: "#0ea5e9", label: "قراءة" },
  execute: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", label: "تنفيذ" },
  analysis: { bg: "rgba(139, 92, 246, 0.15)", text: "#8b5cf6", label: "تحليل" },
  personality: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b", label: "شخصية" },
};

const ThinkingStepsTrace = memo(function ThinkingStepsTrace({
  steps,
}: {
  steps: FormattedAIResponseProps["thinkingSteps"];
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mb-3 rounded-lg overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
        <BarChart3 className="h-3.5 w-3.5 text-[#C5A55A]" />
        <span className="text-[10px] font-medium text-[#D4DDEF]/60">
          خطوات التفكير ({steps.length})
        </span>
      </div>
      <div className="p-2 space-y-1">
        {steps.map((step, i) => (
          <div
            key={step.id || i}
            className="flex items-center gap-2 px-2 py-1 rounded text-[10px]"
          >
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                step.status === "completed"
                  ? "bg-emerald-400"
                  : step.status === "error"
                  ? "bg-red-400"
                  : "bg-amber-400 animate-pulse"
              }`}
            />
            <span className="text-[#D4DDEF]/50 flex-1">{step.description}</span>
            {step.toolCategory && TOOL_CATEGORY_COLORS[step.toolCategory] && (
              <span
                className="px-1.5 py-0.5 rounded text-[9px]"
                style={{
                  background: TOOL_CATEGORY_COLORS[step.toolCategory].bg,
                  color: TOOL_CATEGORY_COLORS[step.toolCategory].text,
                }}
              >
                {TOOL_CATEGORY_COLORS[step.toolCategory].label}
              </span>
            )}
            {step.durationMs !== undefined && (
              <span className="text-[#D4DDEF]/30 flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {step.durationMs}ms
              </span>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
});

const NavigationConsentBanner = memo(function NavigationConsentBanner({
  route,
  label,
  onConsent,
}: {
  route: string;
  label: string;
  onConsent: (route: string, allowed: boolean) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 p-3 rounded-xl"
      style={{
        background: "rgba(197, 165, 90, 0.08)",
        border: "1px solid rgba(197, 165, 90, 0.2)",
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <ExternalLink className="h-4 w-4 text-[#C5A55A]" />
        <span className="text-xs font-medium text-[#D4DDEF]">
          يقترح راصد الذكي الانتقال إلى صفحة أخرى
        </span>
      </div>
      <p className="text-[11px] text-[#D4DDEF]/60 mb-2">
        هل تريد الانتقال إلى: <strong className="text-[#D4DDEF]/80">{label || route}</strong>؟
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onConsent(route, true)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white transition-colors"
          style={{ background: "linear-gradient(135deg, #C5A55A, #b8963f)" }}
        >
          سماح بالانتقال
        </button>
        <button
          onClick={() => onConsent(route, false)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#D4DDEF]/60 bg-white/5 hover:bg-white/10 transition-colors"
        >
          البقاء هنا
        </button>
      </div>
    </motion.div>
  );
});

const FollowUpSuggestions = memo(function FollowUpSuggestions({
  suggestions,
  onSuggestionClick,
}: {
  suggestions: string[];
  onSuggestionClick?: (suggestion: string) => void;
}) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-3 flex flex-wrap gap-1.5"
    >
      {suggestions.map((suggestion, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSuggestionClick?.(suggestion)}
          className="text-[11px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          style={{
            background: "rgba(197, 165, 90, 0.06)",
            border: "1px solid rgba(197, 165, 90, 0.15)",
            color: "#D4DDEF",
          }}
        >
          <ChevronLeft className="h-3 w-3 text-[#C5A55A]" />
          {suggestion}
        </motion.button>
      ))}
    </motion.div>
  );
});

export default memo(function FormattedAIResponse({
  content,
  isStreaming = false,
  toolsUsed,
  thinkingSteps,
  followUpSuggestions,
  onSuggestionClick,
  navigationRequest,
  onNavigationConsent,
  showToolTrace = false,
}: FormattedAIResponseProps) {
  // Detect status indicators in content
  const statusBadge = useMemo(() => {
    if (content.includes("🔴") || content.includes("خطر") || content.includes("واسع النطاق")) {
      return { icon: AlertTriangle, color: "#ef4444", label: "خطر" };
    }
    if (content.includes("🟡") || content.includes("تحذير")) {
      return { icon: AlertTriangle, color: "#f59e0b", label: "تحذير" };
    }
    if (content.includes("🟢") || content.includes("سليم")) {
      return { icon: CheckCircle2, color: "#10b981", label: "سليم" };
    }
    return null;
  }, [content]);

  return (
    <div className="formatted-ai-response">
      {/* Tool Trace (for authorized users) - UI-13 */}
      {showToolTrace && thinkingSteps && thinkingSteps.length > 0 && (
        <ThinkingStepsTrace steps={thinkingSteps} />
      )}

      {/* Main content with Streamdown markdown rendering */}
      <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-[#D4DDEF] prose-p:text-[#D4DDEF]/80 prose-strong:text-[#C5A55A] prose-a:text-[#3DB1AC] prose-code:text-[#C5A55A] prose-table:text-[#D4DDEF]/70 prose-th:text-[#D4DDEF] prose-td:text-[#D4DDEF]/70">
        <Streamdown>{content}</Streamdown>
      </div>

      {/* Streaming indicator */}
      {isStreaming && (
        <motion.div
          className="flex items-center gap-1.5 mt-2"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="h-1 w-1 rounded-full bg-[#C5A55A]" />
          <div className="h-1 w-1 rounded-full bg-[#C5A55A]" style={{ animationDelay: "0.2s" }} />
          <div className="h-1 w-1 rounded-full bg-[#C5A55A]" style={{ animationDelay: "0.4s" }} />
          <span className="text-[10px] text-[#D4DDEF]/40">يكتب...</span>
        </motion.div>
      )}

      {/* Navigation consent dialog (CHAT-03, UI-08) */}
      {navigationRequest && onNavigationConsent && (
        <NavigationConsentBanner
          route={navigationRequest.route}
          label={navigationRequest.label}
          onConsent={onNavigationConsent}
        />
      )}

      {/* Follow-up suggestions (UI-12) */}
      {!isStreaming && (
        <FollowUpSuggestions
          suggestions={followUpSuggestions || []}
          onSuggestionClick={onSuggestionClick}
        />
      )}

      {/* Tools used badge */}
      {!isStreaming && toolsUsed && toolsUsed.length > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[9px] text-[#D4DDEF]/25">
          <Info className="h-2.5 w-2.5" />
          <span>استُخدمت {toolsUsed.length} أداة</span>
        </div>
      )}
    </div>
  );
});
