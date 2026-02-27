# rasid - client-components

> Auto-extracted source code documentation

---

## `client/src/components/AIChatBox.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Loader2, Send, User, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Streamdown } from "streamdown";

/**
 * Message type matching server-side LLM Message interface
 */
export type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIChatBoxProps = {
  /**
   * Messages array to display in the chat.
   * Should match the format used by invokeLLM on the server.
   */
  messages: Message[];

  /**
   * Callback when user sends a message.
   * Typically you'll call a tRPC mutation here to invoke the LLM.
   */
  onSendMessage: (content: string) => void;

  /**
   * Whether the AI is currently generating a response
   */
  isLoading?: boolean;

  /**
   * Placeholder text for the input field
   */
  placeholder?: string;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Height of the chat box (default: 600px)
   */
  height?: string | number;

  /**
   * Empty state message to display when no messages
   */
  emptyStateMessage?: string;

  /**
   * Suggested prompts to display in empty state
   * Click to send directly
   */
  suggestedPrompts?: string[];
};

/**
 * A ready-to-use AI chat box component that integrates with the LLM system.
 *
 * Features:
 * - Matches server-side Message interface for seamless integration
 * - Markdown rendering with Streamdown
 * - Auto-scrolls to latest message
 * - Loading states
 * - Uses global theme colors from index.css
 *
 * @example
 * ```tsx
 * const ChatPage = () => {
 *   const [messages, setMessages] = useState<Message[]>([
 *     { role: "system", content: "You are a helpful assistant." }
 *   ]);
 *
 *   const chatMutation = trpc.ai.chat.useMutation({
 *     onSuccess: (response) => {
 *       // Assuming your tRPC endpoint returns the AI response as a string
 *       setMessages(prev => [...prev, {
 *         role: "assistant",
 *         content: response
 *       }]);
 *     },
 *     onError: (error) => {
 *       console.error("Chat error:", error);
 *       // Optionally show error message to user
 *     }
 *   });
 *
 *   const handleSend = (content: string) => {
 *     const newMessages = [...messages, { role: "user", content }];
 *     setMessages(newMessages);
 *     chatMutation.mutate({ messages: newMessages });
 *   };
 *
 *   return (
 *     <AIChatBox
 *       messages={messages}
 *       onSendMessage={handleSend}
 *       isLoading={chatMutation.isPending}
 *       suggestedPrompts={[
 *         "Explain quantum computing",
 *         "Write a hello world in Python"
 *       ]}
 *     />
 *   );
 * };
 * ```
 */
export function AIChatBox({
  messages,
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  className,
  height = "600px",
  emptyStateMessage = "Start a conversation with AI",
  suggestedPrompts,
}: AIChatBoxProps) {
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputAreaRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Filter out system messages
  const displayMessages = messages.filter((msg) => msg.role !== "system");

  // Calculate min-height for last assistant message to push user message to top
  const [minHeightForLastMessage, setMinHeightForLastMessage] = useState(0);

  useEffect(() => {
    if (containerRef.current && inputAreaRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const inputHeight = inputAreaRef.current.offsetHeight;
      const scrollAreaHeight = containerHeight - inputHeight;

      // Reserve space for:
      // - padding (p-4 = 32px top+bottom)
      // - user message: 40px (item height) + 16px (margin-top from space-y-4) = 56px
      // Note: margin-bottom is not counted because it naturally pushes the assistant message down
      const userMessageReservedHeight = 56;
      const calculatedHeight = scrollAreaHeight - 32 - userMessageReservedHeight;

      setMinHeightForLastMessage(Math.max(0, calculatedHeight));
    }
  }, []);

  // Scroll to bottom helper function with smooth animation
  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-radix-scroll-area-viewport]'
    ) as HTMLDivElement;

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) return;

    onSendMessage(trimmedInput);
    setInput("");

    // Scroll immediately after sending
    scrollToBottom();

    // Keep focus on input
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col bg-card text-card-foreground rounded-lg border shadow-sm",
        className
      )}
      style={{ height }}
    >
      {/* Messages Area */}
      <div ref={scrollAreaRef} className="flex-1 overflow-hidden">
        {displayMessages.length === 0 ? (
          <div className="flex h-full flex-col p-4">
            <div className="flex flex-1 flex-col items-center justify-center gap-6 text-muted-foreground">
              <div className="flex flex-col items-center gap-3">
                <Sparkles className="size-12 opacity-20" />
                <p className="text-sm">{emptyStateMessage}</p>
              </div>

              {suggestedPrompts && suggestedPrompts.length > 0 && (
                <div className="flex max-w-2xl flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => onSendMessage(prompt)}
                      disabled={isLoading}
                      className="rounded-lg border border-border bg-card px-4 py-2 text-sm transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col space-y-4 p-4">
              {displayMessages.map((message, index) => {
                // Apply min-height to last message only if NOT loading (when loading, the loading indicator gets it)
                const isLastMessage = index === displayMessages.length - 1;
                const shouldApplyMinHeight =
                  isLastMessage && !isLoading && minHeightForLastMessage > 0;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3",
                      message.role === "user"
                        ? "justify-end items-start"
                        : "justify-start items-start"
                    )}
                    style={
                      shouldApplyMinHeight
                        ? { minHeight: `${minHeightForLastMessage}px` }
                        : undefined
                    }
                  >
                    {message.role === "assistant" && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                        <Sparkles className="size-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2.5",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.role === "assistant" ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap text-sm">
                          {message.content}
                        </p>
                      )}
                    </div>

                    {message.role === "user" && (
                      <div className="size-8 shrink-0 mt-1 rounded-full bg-secondary flex items-center justify-center">
                        <User className="size-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div
                  className="flex items-start gap-3"
                  style={
                    minHeightForLastMessage > 0
                      ? { minHeight: `${minHeightForLastMessage}px` }
                      : undefined
                  }
                >
                  <div className="size-8 shrink-0 mt-1 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="size-4 text-primary" />
                  </div>
                  <div className="rounded-lg bg-muted px-4 py-2.5">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <form
        ref={inputAreaRef}
        onSubmit={handleSubmit}
        className="flex gap-2 p-4 border-t bg-background/50 items-end"
      >
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 max-h-32 resize-none min-h-9"
          rows={1}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="shrink-0 h-[38px] w-[38px]"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </form>
    </div>
  );
}

```

---

## `client/src/components/ActionPreviewCard.tsx`

```tsx
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

```

---

## `client/src/components/ActivityFeed.tsx`

```tsx
/**
 * ActivityFeed — تغذية الأنشطة الحية
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, ShieldAlert, ScanSearch, Bell, FileCheck, Radio, ChevronDown,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ActivityFeedProps {
  leaks: any[];
  maxItems?: number;
}

type EventType = "leak_detected" | "scan_completed" | "alert_triggered" | "status_changed" | "report_generated";

interface FeedEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  severity: string;
  timestamp: Date;
}

const eventConfig: Record<EventType, { icon: any; color: string; bg: string; label: string }> = {
  leak_detected: { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", label: "حالة رصد مكتشفة" },
  scan_completed: { icon: ScanSearch, color: "text-blue-400", bg: "bg-blue-500/10", label: "فحص مكتمل" },
  alert_triggered: { icon: Bell, color: "text-amber-400", bg: "bg-amber-500/10", label: "تنبيه" },
  status_changed: { icon: FileCheck, color: "text-emerald-400", bg: "bg-emerald-500/10", label: "تحديث حالة" },
  report_generated: { icon: Radio, color: "text-violet-400", bg: "bg-violet-500/10", label: "تقرير" },
};

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHr < 24) return `منذ ${diffHr} ساعة`;
  if (diffDay < 7) return `منذ ${diffDay} يوم`;
  return date.toLocaleDateString("ar-SA", { month: "short", day: "numeric" });
}

export default function ActivityFeed({ leaks, maxItems = 15 }: ActivityFeedProps) {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<EventType | "all">("all");
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const events = useMemo<FeedEvent[]>(() => {
    const items: FeedEvent[] = [];
    leaks.forEach((leak, i) => {
      items.push({
        id: `leak-${leak.leakId || i}`,
        type: "leak_detected",
        title: leak.titleAr || leak.title || "حالة رصد بيانات",
        description: `${leak.sectorAr || leak.sector || "غير محدد"} · ${(leak.recordCount || 0).toLocaleString()} سجل`,
        severity: leak.severity || "medium",
        timestamp: new Date(leak.detectedAt || Date.now() - i * 3600000),
      });
      if (i % 3 === 0) {
        items.push({
          id: `scan-${i}`,
          type: "scan_completed",
          title: `فحص ${leak.source || "مصدر"} مكتمل`,
          description: `تم فحص ${Math.floor(Math.random() * 500 + 100)} عنصر`,
          severity: "low",
          timestamp: new Date(leak.detectedAt ? new Date(leak.detectedAt).getTime() - 1800000 : Date.now() - i * 3600000 - 1800000),
        });
      }
      if (leak.severity === "critical" || leak.severity === "high") {
        items.push({
          id: `alert-${i}`,
          type: "alert_triggered",
          title: `تنبيه: ${leak.titleAr || leak.title || "حالة رصد"}`,
          description: `مستوى الخطورة: ${leak.severity === "critical" ? "حرج" : "مرتفع"}`,
          severity: leak.severity,
          timestamp: new Date(leak.detectedAt ? new Date(leak.detectedAt).getTime() + 300000 : Date.now() - i * 3600000 + 300000),
        });
      }
    });
    return items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [leaks]);

  const filteredEvents = useMemo(() => {
    const filtered = filter === "all" ? events : events.filter(e => e.type === filter);
    return expanded ? filtered.slice(0, maxItems * 2) : filtered.slice(0, maxItems);
  }, [events, filter, expanded, maxItems]);

  const sevDot = (sev: string) => sev === "critical" ? "bg-red-500" : sev === "high" ? "bg-amber-500" : sev === "medium" ? "bg-blue-500" : "bg-emerald-500";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className={`rounded-2xl border overflow-hidden ${isDark
        ? "bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/80 border-white/[0.06] backdrop-blur-xl"
        : "bg-white/90 border-[#e2e5ef] shadow-lg shadow-blue-500/5"}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <motion.div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-emerald-500/15" : "bg-emerald-100"}`}
            animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <Activity className={`w-4 h-4 ${isDark ? "text-emerald-400" : "text-emerald-600"}`} />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-foreground">تغذية الأنشطة</h3>
            <p className="text-[9px] text-muted-foreground">Live Activity Feed · {events.length} حدث</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {(["all", "leak_detected", "alert_triggered", "scan_completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-2 py-1 rounded-md text-[9px] font-medium transition-all ${filter === f
                ? isDark ? "bg-[#3DB1AC]/20 text-[#3DB1AC]" : "bg-blue-100 text-blue-700"
                : isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}>
              {f === "all" ? "الكل" : f === "leak_detected" ? "حالات رصد" : f === "alert_triggered" ? "تنبيهات" : "فحوصات"}
            </button>
          ))}
        </div>
      </div>
      <div className={`px-4 pb-4 space-y-1 max-h-[400px] overflow-y-auto`}>
        <AnimatePresence mode="popLayout">
          {filteredEvents.map((event, i) => {
            const config = eventConfig[event.type];
            const Icon = config.icon;
            return (
              <motion.div key={event.id}
                initial={{ opacity: 0, x: 20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: -20, height: 0 }}
                transition={{ duration: 0.3, delay: i * 0.02 }}
                className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-default ${isDark ? "hover:bg-white/[0.03]" : "hover:bg-slate-50"}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${config.bg}`}>
                  <Icon className={`w-3.5 h-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-foreground font-medium truncate">{event.title}</span>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sevDot(event.severity)}`} />
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate">{event.description}</p>
                </div>
                <span className="text-[8px] text-muted-foreground whitespace-nowrap shrink-0">{relativeTime(event.timestamp)}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {events.length > maxItems && (
        <button onClick={() => setExpanded(!expanded)}
          className={`w-full py-2.5 text-[10px] font-medium flex items-center justify-center gap-1 transition-colors border-t ${isDark ? "border-white/5 text-slate-400 hover:bg-white/[0.03]" : "border-slate-100 text-slate-500 hover:bg-slate-50"}`}>
          <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? "عرض أقل" : `عرض المزيد (${events.length - maxItems} حدث)`}
        </button>
      )}
    </motion.div>
  );
}

```

---

## `client/src/components/AddPageButton.tsx`

```tsx
/**
 * AddPageButton — Premium "+" button for sidebar
 * Opens CreatePageModal to create new dynamic pages
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, LayoutDashboard, Table2, FileText, Sparkles, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface AddPageButtonProps {
  collapsed: boolean;
  onCreatePage: (pageType: "dashboard" | "table" | "report", title: string) => Promise<boolean>;
  accent: string;
}

const PAGE_TYPES = [
  {
    type: "dashboard" as const,
    icon: LayoutDashboard,
    title: "لوحة مؤشرات",
    titleEn: "Dashboard",
    color: "#3DB1AC",
  },
  {
    type: "table" as const,
    icon: Table2,
    title: "جدول بيانات",
    titleEn: "Data Table",
    color: "#22c55e",
  },
  {
    type: "report" as const,
    icon: FileText,
    title: "تقرير",
    titleEn: "Report",
    color: "#f59e0b",
  },
];

export default function AddPageButton({ collapsed, onCreatePage, accent }: AddPageButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [selectedType, setSelectedType] = useState<"dashboard" | "table" | "report" | null>(null);
  const [pageName, setPageName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setShowNameInput(false);
        setSelectedType(null);
        setPageName("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showNameInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNameInput]);

  const handleSelectType = (type: "dashboard" | "table" | "report") => {
    setSelectedType(type);
    setShowNameInput(true);
  };

  const handleCreate = async () => {
    if (!selectedType || !pageName.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const success = await onCreatePage(selectedType, pageName.trim());
      if (success) {
        setShowDropdown(false);
        setShowNameInput(false);
        setSelectedType(null);
        setPageName("");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") void handleCreate();
    if (e.key === "Escape") {
      setShowDropdown(false);
      setShowNameInput(false);
      setSelectedType(null);
      setPageName("");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setShowDropdown(!showDropdown);
          setShowNameInput(false);
          setSelectedType(null);
          setPageName("");
        }}
        className={`
          w-full flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer
          transition-all duration-200 group relative
          ${isDark
            ? "text-[#3DB1AC]/70 hover:text-[#3DB1AC] hover:bg-[rgba(61,177,172,0.08)] border border-dashed border-[rgba(61,177,172,0.2)] hover:border-[rgba(61,177,172,0.4)]"
            : "text-[#1e3a8a]/60 hover:text-[#1e3a8a] hover:bg-[rgba(30,58,138,0.04)] border border-dashed border-[rgba(30,58,138,0.15)] hover:border-[rgba(30,58,138,0.3)]"
          }
        `}
      >
        <div
          className={`
          w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0
          ${isDark ? "bg-[rgba(61,177,172,0.15)]" : "bg-[rgba(30,58,138,0.08)]"}
        `}
        >
          <Plus className="w-3.5 h-3.5" />
        </div>
        {!collapsed && <span className="text-[12px] font-medium">إنشاء صفحة</span>}
        {collapsed && (
          <div
            className={`absolute right-14 ${
              isDark
                ? "bg-[rgba(26,37,80,0.95)] text-[#E1DEF5] border-[rgba(61,177,172,0.15)]"
                : "bg-white text-[#1c2833] border-[#e2e5ef]"
            } backdrop-blur-xl text-xs py-1.5 px-3 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border`}
          >
            إنشاء صفحة
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`
              absolute z-[60] bottom-full mb-1 rounded-xl overflow-hidden shadow-2xl
              ${collapsed ? "right-0 w-64" : "right-0 left-0"}
            `}
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))"
                : "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.98))",
              border: isDark ? "1px solid rgba(61, 177, 172, 0.15)" : "1px solid rgba(30, 58, 138, 0.1)",
              backdropFilter: "blur(20px)",
              boxShadow: isDark
                ? "0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(61,177,172,0.05)"
                : "0 20px 40px rgba(0,0,0,0.1)",
            }}
          >
            {!showNameInput ? (
              <>
                <div className={`px-3 py-2.5 border-b ${isDark ? "border-slate-700/50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: accent }} />
                    <span className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>صفحة جديدة</span>
                  </div>
                </div>

                <div className="p-1.5 space-y-0.5">
                  {PAGE_TYPES.map((pt, i) => (
                    <motion.button
                      key={pt.type}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSelectType(pt.type)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                        transition-all duration-150 group/item
                        ${isDark
                          ? "hover:bg-white/[0.06] text-slate-300 hover:text-white"
                          : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                        }
                      `}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover/item:scale-110"
                        style={{ backgroundColor: `${pt.color}1A` }}
                      >
                        <pt.icon className="w-4 h-4" style={{ color: pt.color }} />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-[13px] font-semibold">{pt.title}</div>
                        <div className={`text-[10px] ${isDark ? "text-slate-500" : "text-gray-400"}`}>{pt.titleEn}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className={`px-3 py-2.5 border-b ${isDark ? "border-slate-700/50" : "border-gray-200"}`}>
                  <div className="flex items-center gap-2">
                    {selectedType && (
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${PAGE_TYPES.find((p) => p.type === selectedType)?.color}1A` }}
                      >
                        {selectedType === "dashboard" && <LayoutDashboard className="w-3 h-3" style={{ color: PAGE_TYPES[0].color }} />}
                        {selectedType === "table" && <Table2 className="w-3 h-3" style={{ color: PAGE_TYPES[1].color }} />}
                        {selectedType === "report" && <FileText className="w-3 h-3" style={{ color: PAGE_TYPES[2].color }} />}
                      </div>
                    )}
                    <span className={`text-xs font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                      {PAGE_TYPES.find((p) => p.type === selectedType)?.title}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={pageName}
                    onChange={(e) => setPageName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اسم الصفحة..."
                    dir="rtl"
                    className={`
                      w-full px-3 py-2 rounded-lg text-sm
                      ${isDark
                        ? "bg-slate-800/80 border-slate-600/50 text-white placeholder:text-slate-500 focus:border-[rgba(61,177,172,0.4)]"
                        : "bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-[rgba(30,58,138,0.3)]"
                      }
                      border focus:outline-none focus:ring-1 focus:ring-opacity-20 transition-all
                    `}
                    style={{ "--tw-ring-color": accent } as React.CSSProperties}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setShowNameInput(false);
                        setSelectedType(null);
                        setPageName("");
                      }}
                      disabled={isCreating}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isDark ? "bg-slate-800 hover:bg-slate-700 text-slate-300" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                      } ${isCreating ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      رجوع
                    </button>
                    <button
                      onClick={() => void handleCreate()}
                      disabled={!pageName.trim() || isCreating}
                      className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-1 ${
                        pageName.trim() && !isCreating ? "hover:shadow-lg hover:scale-[1.02]" : "opacity-40 cursor-not-allowed"
                      }`}
                      style={{
                        backgroundColor: pageName.trim() && !isCreating ? accent : isDark ? "#334155" : "#d1d5db",
                      }}
                    >
                      {isCreating ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                      <span>{isCreating ? "جارٍ الإنشاء..." : "إنشاء"}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

```

---

## `client/src/components/AnimatedCard.tsx`

```tsx
/**
 * AnimatedCard — Reusable premium card with entrance animations and hover effects
 * Used across all platform pages for consistent motion design
 * Matches design.rasid.vip quality with glassmorphism and glow effects
 */
import { motion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  /** Entrance animation variant */
  variant?: "fadeUp" | "fadeRight" | "fadeLeft" | "scaleIn" | "slideUp";
  /** Enable hover glow border effect */
  glow?: boolean;
  /** Custom glow color */
  glowColor?: string;
  /** Disable hover scale */
  noHoverScale?: boolean;
}

const variants: Record<string, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0 },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.88 },
    visible: { opacity: 1, scale: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
};

export function AnimatedCard({
  children,
  className = "",
  onClick,
  delay = 0,
  variant = "fadeUp",
  glow = false,
  glowColor,
  noHoverScale = false,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants[variant]}
      transition={{
        delay,
        duration: 0.55,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      onClick={onClick}
      whileHover={
        noHoverScale
          ? undefined
          : {
              scale: onClick ? 1.015 : 1.005,
              y: -2,
              transition: { duration: 0.25, ease: "easeOut" },
            }
      }
      className={`
        relative rounded-2xl border overflow-hidden
        bg-white dark:bg-[rgba(26,37,80,0.7)]
        border-[#e2e5ef] dark:border-[rgba(61,177,172,0.1)]
        shadow-[0_1px_3px_rgba(39,52,112,0.04)] dark:shadow-none
        backdrop-blur-xl
        transition-[border-color,box-shadow] duration-400
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={
        glow && glowColor
          ? { boxShadow: `0 0 0 1px ${glowColor}, 0 4px 20px ${glowColor}` }
          : undefined
      }
    >
      {/* Shimmer overlay on hover */}
      <div className="absolute inset-0 pointer-events-none shimmer-hover" />
      {children}
    </motion.div>
  );
}

/** Animated stat number with count-up and pop effect */
export function AnimatedStat({
  value,
  duration = 1500,
  className = "",
  suffix = "",
  prefix = "",
}: {
  value: number;
  duration?: number;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = value;
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span
      className={className}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {prefix}{display.toLocaleString("en-US")}{suffix}
    </motion.span>
  );
}

/** Section header with animated icon */
export function AnimatedSectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
  onAction,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-[rgba(61,177,172,0.12)] flex items-center justify-center"
          whileHover={{ rotate: -8, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Icon className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          {subtitle && <p className="text-[10px] text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {action && (
        <motion.button
          onClick={onAction}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          whileHover={{ x: -3 }}
        >
          {action}
        </motion.button>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";

```

---

## `client/src/components/AnimatedCounter.tsx`

```tsx
/**
 * AnimatedCounter — PDPL Ultra Premium
 * Counts from 0 to target value when element enters viewport
 * Rule #3: No number without counter
 */
import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  formatLarge?: boolean;
}

export default function AnimatedCounter({
  value,
  duration = 1500,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  formatLarge = true,
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(eased * value);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration]);

  useEffect(() => {
    if (hasAnimated.current) {
      setCount(value);
    }
  }, [value]);

  const formatNumber = (n: number): string => {
    if (formatLarge && n >= 1_000_000) {
      return (n / 1_000_000).toFixed(1) + "M";
    }
    if (formatLarge && n >= 1_000) {
      return n >= 10_000
        ? Math.round(n).toLocaleString("en-US")
        : (n / 1_000).toFixed(1) + "K";
    }
    return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString("en-US");
  };

  const formatted = formatNumber(count);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

```

---

## `client/src/components/AnimatedIcon.tsx`

```tsx
import type { ReactNode } from 'react';

type IconEffect = 'pulse' | 'spin' | 'bounce' | 'shake' | 'glow' | 'morph';

interface AnimatedIconProps {
  children: ReactNode;
  effect?: IconEffect;
  size?: number;
  color?: string;
  className?: string;
  active?: boolean;
}

const effectVariants: Record<IconEffect, any> = {
  pulse: {
    animate: {
      scale: [1, 1.15, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  spin: {
    animate: {
      rotate: 360,
      transition: { duration: 8, repeat: Infinity, ease: 'linear' },
    },
  },
  bounce: {
    animate: {
      y: [0, -4, 0],
      transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  shake: {
    animate: {
      x: [0, -2, 2, -2, 0],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 3 },
    },
  },
  glow: {
    animate: {
      filter: [
        'drop-shadow(0 0 2px rgba(30, 58, 95, 0.3))',
        'drop-shadow(0 0 8px rgba(74, 122, 181, 0.6))',
        'drop-shadow(0 0 2px rgba(30, 58, 95, 0.3))',
      ],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  },
  morph: {
    animate: {
      scale: [1, 1.1, 0.95, 1.05, 1],
      rotate: [0, 5, -5, 3, 0],
      transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
    },
  },
};

export function AnimatedIcon({
  children,
  effect = 'pulse',
  className = '',
  active = true,
}: AnimatedIconProps) {
  const variant = effectVariants[effect];

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      {...(active ? variant : {})}
    >
      {children}
    </div>
  );
}

```

---

## `client/src/components/AnimatedLogo.tsx`

```tsx
/**
 * AnimatedLogo — Ultra Premium animated logo with orbital rings and glow
 * Uses official Rasid logo with creative motion effects
 */
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

// Full brand logos (with "منصة راصد" + "مكتب إدارة البيانات الوطنية")
const RASID_LOGO_LIGHT = "/branding/logos/Rased_1_transparent_1.png"; // Cream+Gold for dark bg
const RASID_LOGO_DARK = "/branding/logos/Rased_1_transparent.png"; // Navy+Gold for light bg

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | number;
  showOrbits?: boolean;
  showText?: boolean;
  variant?: string;
  className?: string;
}

export default function AnimatedLogo({ size = "md", showOrbits = true, showText, variant, className = "" }: AnimatedLogoProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sizeMap = {
    sm: { logo: 36, container: 50, orbit1: 22, orbit2: 28 },
    md: { logo: 48, container: 65, orbit1: 30, orbit2: 38 },
    lg: { logo: 80, container: 110, orbit1: 48, orbit2: 60 },
    xl: { logo: 140, container: 180, orbit1: 80, orbit2: 100 },
  };

  // If size is a number, calculate proportional dimensions
  const s = typeof size === "number"
    ? { logo: size, container: Math.round(size * 1.35), orbit1: Math.round(size * 0.6), orbit2: Math.round(size * 0.76) }
    : sizeMap[size];
  const logoSrc = isDark ? RASID_LOGO_DARK : RASID_LOGO_LIGHT;

  const C = {
    accent: isDark ? "#3DB1AC" : "#273470",
    purple: isDark ? "#6459A7" : "#6459A7",
    accentGlow: isDark ? "rgba(61, 177, 172, 0.25)" : "rgba(39, 52, 112, 0.08)",
    orbitBorder: isDark ? "rgba(61, 177, 172, 0.12)" : "rgba(39, 52, 112, 0.06)",
  };

  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: s.container, height: s.container }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Outer orbital ring */}
      {showOrbits && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: s.container,
            height: s.container,
            border: `1px dashed ${C.orbitBorder}`,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: C.accent,
              top: -3,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: `0 0 10px ${C.accentGlow}`,
            }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}

      {/* Inner orbital ring */}
      {showOrbits && (
        <motion.div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: s.container * 0.75,
            height: s.container * 0.75,
            border: `1px dashed ${isDark ? "rgba(99, 74, 181, 0.1)" : "rgba(74, 122, 181, 0.05)"}`,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: C.purple,
              bottom: -2,
              left: "50%",
              transform: "translateX(-50%)",
              boxShadow: `0 0 8px ${C.purple}`,
            }}
          />
        </motion.div>
      )}

      {/* Breathing glow */}
      <motion.div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: s.logo * 1.2,
          height: s.logo * 1.2,
          background: `radial-gradient(circle, ${C.accentGlow} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Logo image */}
      <motion.img
        src={logoSrc}
        alt="راصد"
        className="relative z-10"
        style={{ width: s.logo, height: "auto", objectFit: "contain" }}
        animate={{
          filter: [
            `drop-shadow(0 0 6px ${C.accentGlow})`,
            `drop-shadow(0 0 18px ${C.accentGlow})`,
            `drop-shadow(0 0 6px ${C.accentGlow})`,
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

```

---

## `client/src/components/AnimatedProgressBar.tsx`

```tsx
interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  color = 'var(--sdaia-accent)',
  height = 8,
  className = '',
  showLabel = false,
  label,
}: AnimatedProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5 text-sm">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showLabel && (
            <span className="font-bold text-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full overflow-hidden bg-muted/50"
        style={{ height }}
      >
        <div
          className="h-full rounded-full relative overflow-hidden"
          style={{ backgroundColor: color, width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

```

---

## `client/src/components/AnimatedTooltip.tsx`

```tsx
import { useState, type ReactNode } from 'react';

interface AnimatedTooltipProps {
  children: ReactNode;
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const positionStyles = {
  top: { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8 },
  bottom: { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 8 },
  left: { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: 8 },
  right: { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: 8 },
};

const motionOrigin = {
  top: { initial: { opacity: 0, y: 8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } },
  bottom: { initial: { opacity: 0, y: -8, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 } },
  left: { initial: { opacity: 0, x: 8, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } },
  right: { initial: { opacity: 0, x: -8, scale: 0.95 }, animate: { opacity: 1, x: 0, scale: 1 } },
};

export function AnimatedTooltip({
  children,
  content,
  position = 'top',
  className = '',
}: AnimatedTooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      
        {show && (
          <div
            className="absolute z-50 px-3 py-2 text-sm rounded-xl whitespace-nowrap pointer-events-none glass-card gold-sweep"
            style={positionStyles[position]}
            initial={motionOrigin[position].initial}
            animate={motionOrigin[position].animate}
          >
            {content}
          </div>
        )}
      
    </div>
  );
}

```

---

## `client/src/components/AppLayout.tsx`

```tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import {
  LayoutDashboard,
  Shield,
  AlertTriangle,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Bell,
  ChevronDown,
  PanelRight,
  Bot,
} from "lucide-react";
import { CSSProperties, useState, ReactNode } from "react";
import { useLocation, Link } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";

const LOGO_URL = "/branding/logos/Rased_3_transparent.png";
const CHARACTER_URL = "/branding/characters/Character_3_dark_bg_transparent.png";

interface NavGroup {
  label: string;
  icon: any;
  basePath: string;
  items: { label: string; path: string; icon?: any }[];
}

const navGroups: NavGroup[] = [
  {
    label: "الرئيسية",
    icon: LayoutDashboard,
    basePath: "/app/overview",
    items: [
      { label: "لوحة المؤشرات", path: "/app/overview" },
    ],
  },
  {
    label: "الخصوصية",
    icon: Shield,
    basePath: "/app/privacy",
    items: [
      { label: "لوحة الخصوصية", path: "/app/privacy" },
      { label: "المواقع", path: "/app/privacy/sites" },
    ],
  },
  {
    label: "التسربات",
    icon: AlertTriangle,
    basePath: "/app/incidents",
    items: [
      { label: "لوحة التسربات", path: "/app/incidents" },
      { label: "الوقائع", path: "/app/incidents/list" },
    ],
  },
  {
    label: "المتابعات",
    icon: ClipboardList,
    basePath: "/app/followups",
    items: [
      { label: "قائمة المتابعات", path: "/app/followups" },
    ],
  },
  {
    label: "التقارير",
    icon: FileText,
    basePath: "/app/reports",
    items: [
      { label: "التقارير", path: "/app/reports" },
    ],
  },
  {
    label: "لوحتي",
    icon: BarChart3,
    basePath: "/app/my",
    items: [
      { label: "لوحتي المخصصة", path: "/app/my" },
    ],
  },
  {
    label: "راصد الذكي",
    icon: Bot,
    basePath: "/app/smart-rasid",
    items: [
      { label: "محادثة جديدة", path: "/app/smart-rasid" },
    ],
  },
];

const adminNavGroups: NavGroup[] = [
  {
    label: "الإدارة",
    icon: Settings,
    basePath: "/admin",
    items: [
      { label: "المستخدمون", path: "/admin/users", icon: Users },
      { label: "الإعدادات", path: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { loading, user } = useAuth();

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen page-bg">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <img src={CHARACTER_URL} alt="راصد" className="h-32 w-auto" />
          <div className="flex flex-col items-center gap-4">
            <img src={LOGO_URL} alt="منصة راصد" className="h-12 w-auto" />
            <p className="text-sm text-muted-foreground text-center">
              يرجى تسجيل الدخول للوصول إلى المنصة
            </p>
          </div>
          <Button
            onClick={() => { window.location.href = "/login"; }}
            size="lg"
            className="w-full bg-gold text-gold-foreground hover:bg-gold/90 shadow-lg"
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "admin" || user.role === "superadmin" || user.role === "root_admin";

  return (
    <SidebarProvider
      style={{ "--sidebar-width": "260px" } as CSSProperties}
    >
      <SidebarNav isAdmin={isAdmin}>
        {children}
      </SidebarNav>
    </SidebarProvider>
  );
}

function SidebarNav({ children, isAdmin }: { children: ReactNode; isAdmin: boolean }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const unreadCount = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });

  const allGroups = isAdmin ? [...navGroups, ...adminNavGroups] : navGroups;

  return (
    <>
      <Sidebar collapsible="icon" className="border-l-0 border-r border-border/50" side="right">
        <SidebarHeader className="h-16 justify-center border-b border-border/30">
          <div className="flex items-center gap-3 px-3">
            {!isCollapsed && (
              <img src={LOGO_URL} alt="راصد" className="h-8 w-auto" />
            )}
            {isCollapsed && (
              <img src={LOGO_URL} alt="راصد" className="h-7 w-auto mx-auto" />
            )}
          </div>
        </SidebarHeader>

        <SidebarContent className="gap-0 pt-2">
          <SidebarMenu className="px-2">
            {allGroups.map((group) => {
              const isActive = location.startsWith(group.basePath);
              const hasSingleItem = group.items.length === 1;

              if (hasSingleItem) {
                const item = group.items[0];
                const itemActive = location === item.path;
                return (
                  <SidebarMenuItem key={group.basePath}>
                    <SidebarMenuButton
                      isActive={itemActive}
                      onClick={() => setLocation(item.path)}
                      tooltip={group.label}
                      className="h-10"
                    >
                      <group.icon className={`h-4 w-4 ${itemActive ? "text-gold" : ""}`} />
                      <span>{group.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible key={group.basePath} defaultOpen={isActive}>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={group.label}
                        className="h-10"
                        isActive={isActive}
                      >
                        <group.icon className={`h-4 w-4 ${isActive ? "text-gold" : ""}`} />
                        <span>{group.label}</span>
                        <ChevronDown className="mr-auto h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {group.items.map((item) => {
                          const itemActive = location === item.path;
                          return (
                            <SidebarMenuSubItem key={item.path}>
                              <SidebarMenuSubButton
                                isActive={itemActive}
                                onClick={() => setLocation(item.path)}
                                className={itemActive ? "text-gold" : ""}
                              >
                                <span>{item.label}</span>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-3 border-t border-border/30">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-accent/50 transition-colors w-full text-right group-data-[collapsible=icon]:justify-center focus:outline-none">
                <Avatar className="h-9 w-9 border border-gold/30 shrink-0">
                  <AvatarFallback className="text-xs font-bold bg-gold/10 text-gold">
                    {user?.name?.charAt(0)?.toUpperCase() || "م"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium truncate leading-none">
                    {user?.name || "مستخدم"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-1">
                    {user?.email || ""}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setLocation("/app/notifications")}>
                <Bell className="ml-2 h-4 w-4" />
                <span>الإشعارات</span>
                {(unreadCount.data ?? 0) > 0 && (
                  <Badge variant="destructive" className="mr-auto text-[10px] px-1.5 py-0">
                    {unreadCount.data}
                  </Badge>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Top bar */}
        <div className="flex border-b border-border/30 h-14 items-center justify-between bg-background/80 backdrop-blur-sm px-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="h-9 w-9 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setLocation("/app/notifications")}
            >
              <Bell className="h-4 w-4" />
              {(unreadCount.data ?? 0) > 0 && (
                <span className="absolute -top-0.5 -left-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] text-white flex items-center justify-center">
                  {unreadCount.data}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 page-bg min-h-[calc(100vh-3.5rem)]">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

```

---

## `client/src/components/AuroraBackground.tsx`

```tsx
/**
 * AuroraBackground — Animated aurora borealis background effect.
 * Renders layered gradient blobs that shift and morph over time.
 */
import React from "react";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "intense";
  /** Show aurora only in dark mode */
  darkOnly?: boolean;
}

export function AuroraBackground({
  children,
  className,
  variant = "default",
  darkOnly = true,
}: AuroraBackgroundProps) {
  const opacityMap = { subtle: "opacity-20", default: "opacity-30", intense: "opacity-50" };
  const opacityClass = opacityMap[variant];
  const darkPrefix = darkOnly ? "dark:" : "";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Aurora Layer 1 — Cyan/Teal */}
      <div
        className={cn(
          "pointer-events-none absolute -top-1/2 -left-1/4 h-[120%] w-[150%] rounded-full blur-3xl",
          darkOnly ? `opacity-0 dark:${opacityClass.replace("opacity-", "opacity-")}` : opacityClass
        )}
        style={{
          background: "radial-gradient(ellipse at 30% 50%, rgba(0, 255, 200, 0.4), transparent 70%)",
          animation: "aurora-drift-1 20s ease-in-out infinite alternate",
        }}
      />
      {/* Aurora Layer 2 — Purple/Blue */}
      <div
        className={cn(
          "pointer-events-none absolute -bottom-1/3 -right-1/4 h-[100%] w-[130%] rounded-full blur-3xl",
          darkOnly ? `opacity-0 dark:${opacityClass.replace("opacity-", "opacity-")}` : opacityClass
        )}
        style={{
          background: "radial-gradient(ellipse at 70% 50%, rgba(128, 0, 255, 0.35), transparent 70%)",
          animation: "aurora-drift-2 25s ease-in-out infinite alternate",
        }}
      />
      {/* Aurora Layer 3 — Green/Emerald */}
      <div
        className={cn(
          "pointer-events-none absolute top-1/4 left-1/3 h-[80%] w-[80%] rounded-full blur-3xl",
          darkOnly ? `opacity-0 dark:${opacityClass.replace("opacity-", "opacity-")}` : opacityClass
        )}
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(0, 200, 100, 0.3), transparent 60%)",
          animation: "aurora-drift-3 18s ease-in-out infinite alternate",
        }}
      />
      {/* Content */}
      <div className="relative z-10">{children}</div>

      <style>{`
        @keyframes aurora-drift-1 {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          33% { transform: translate(5%, -3%) rotate(2deg) scale(1.05); }
          66% { transform: translate(-3%, 5%) rotate(-1deg) scale(0.95); }
          100% { transform: translate(2%, -2%) rotate(1deg) scale(1.02); }
        }
        @keyframes aurora-drift-2 {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); }
          50% { transform: translate(-5%, 3%) rotate(-2deg) scale(1.08); }
          100% { transform: translate(3%, -4%) rotate(1.5deg) scale(0.97); }
        }
        @keyframes aurora-drift-3 {
          0% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(8%, -5%) scale(1.1); opacity: 0.5; }
          100% { transform: translate(-4%, 3%) scale(0.9); opacity: 0.25; }
        }
      `}</style>
    </div>
  );
}

export default AuroraBackground;

```

---

## `client/src/components/CaseComments.tsx`

```tsx
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  MessageSquare, Send, Loader2, Trash2, Pencil, Reply,
  Clock, User, Shield, Eye, Lock, CornerDownRight,
} from "lucide-react";

interface CaseCommentsProps {
  caseId: number;
}

export default function CaseComments({ caseId }: CaseCommentsProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isInternal, setIsInternal] = useState(true);

  const { data: comments, isLoading, refetch } = trpc.cases.comments.useQuery({ caseId });

  const addComment = trpc.cases.addComment.useMutation({
    onSuccess: () => {
      setNewComment("");
      setReplyTo(null);
      setReplyContent("");
      refetch();
      toast.success("تم إضافة التعليق");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateComment = trpc.cases.updateComment.useMutation({
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
      refetch();
      toast.success("تم تحديث التعليق");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteComment = trpc.cases.deleteComment.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("تم حذف التعليق");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    addComment.mutate({
      caseId,
      content: newComment.trim(),
      isInternal,
    });
  };

  const handleReply = (parentId: number) => {
    if (!replyContent.trim()) return;
    addComment.mutate({
      caseId,
      content: replyContent.trim(),
      parentId,
      isInternal,
    });
  };

  const handleUpdate = (commentId: number) => {
    if (!editContent.trim()) return;
    updateComment.mutate({ commentId, content: editContent.trim() });
  };

  const roleLabels: Record<string, string> = {
    admin: "مسؤول",
    user: "مستخدم",
    root_admin: "مسؤول النظام",
  };

  const roleColors: Record<string, string> = {
    admin: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    root_admin: "bg-red-500/10 text-red-600 border-red-500/20",
    user: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };

  // Group comments: top-level and replies
  const topLevel = (comments || []).filter((c: any) => !c.parentId);
  const replies = (comments || []).filter((c: any) => c.parentId);
  const getReplies = (parentId: number) => replies.filter((r: any) => r.parentId === parentId);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return d.toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "short", day: "numeric" });
  };

  const renderComment = (comment: any, isReply = false) => {
    const isOwn = user?.id === comment.userId;
    const commentReplies = getReplies(comment.id);

    return (
      <div key={comment.id} className={`${isReply ? "me-8 border-e-2 border-primary/10 pe-4" : ""}`}>
        <div className={`group rounded-xl p-4 transition-all hover:shadow-sm ${
          isOwn ? "bg-primary/5 border border-primary/10" : "bg-muted/30 border border-border/50"
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold">{comment.userName || "مستخدم"}</span>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${roleColors[comment.userRole] || roleColors.user}`}>
                {roleLabels[comment.userRole] || comment.userRole}
              </Badge>
              {comment.isInternal ? (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-gray-100 text-gray-500 border-gray-200">
                  <Lock className="h-2.5 w-2.5 ms-0.5" />
                  داخلي
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-600 border-green-200">
                  <Eye className="h-2.5 w-2.5 ms-0.5" />
                  عام
                </Badge>
              )}
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(comment.createdAt)}
              </span>
            </div>
            {/* Actions */}
            {isOwn && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => {
                    setEditingId(comment.id);
                    setEditContent(comment.content);
                  }}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من حذف هذا التعليق؟")) {
                      deleteComment.mutate({ commentId: comment.id });
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          {editingId === comment.id ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={2}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleUpdate(comment.id)} disabled={updateComment.isPending}>
                  {updateComment.isPending ? <Loader2 className="h-3 w-3 animate-spin ms-1" /> : null}
                  حفظ
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>إلغاء</Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          )}

          {/* Reply Button */}
          {!isReply && (
            <div className="mt-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-primary h-7 px-2"
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              >
                <Reply className="h-3 w-3 ms-1" />
                رد ({commentReplies.length})
              </Button>
            </div>
          )}
        </div>

        {/* Replies */}
        {commentReplies.length > 0 && (
          <div className="mt-2 space-y-2">
            {commentReplies.map((reply: any) => renderComment(reply, true))}
          </div>
        )}

        {/* Reply Input */}
        {replyTo === comment.id && (
          <div className="me-8 mt-2 flex gap-2 items-start">
            <CornerDownRight className="h-4 w-4 text-muted-foreground mt-3 shrink-0" />
            <div className="flex-1 space-y-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="اكتب رداً..."
                rows={2}
                className="text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleReply(comment.id)}
                  disabled={addComment.isPending || !replyContent.trim()}
                >
                  {addComment.isPending ? <Loader2 className="h-3 w-3 animate-spin ms-1" /> : <Send className="h-3 w-3 ms-1" />}
                  إرسال الرد
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setReplyTo(null); setReplyContent(""); }}>
                  إلغاء
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          التعليقات الداخلية
          {comments && comments.length > 0 && (
            <Badge variant="secondary" className="text-xs">{comments.length}</Badge>
          )}
        </h4>
      </div>

      {/* Comments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (comments || []).length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
          <p className="text-sm">لا توجد تعليقات بعد</p>
          <p className="text-xs mt-1">كن أول من يضيف تعليقاً على هذه الحالة</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pe-1">
          {topLevel.map((comment: any) => renderComment(comment))}
        </div>
      )}

      {/* New Comment Input */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant={isInternal ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setIsInternal(true)}
          >
            <Lock className="h-3 w-3 ms-1" />
            تعليق داخلي
          </Button>
          <Button
            variant={!isInternal ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setIsInternal(false)}
          >
            <Eye className="h-3 w-3 ms-1" />
            تعليق عام
          </Button>
          <span className="text-[11px] text-muted-foreground">
            {isInternal ? "مرئي لفريق العمل فقط" : "مرئي للجميع"}
          </span>
        </div>
        <div className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="اكتب تعليقاً..."
            rows={2}
            className="flex-1 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                handleSubmit();
              }
            }}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Ctrl+Enter للإرسال السريع
          </span>
          <Button
            onClick={handleSubmit}
            disabled={addComment.isPending || !newComment.trim()}
            size="sm"
            className="gap-1"
          >
            {addComment.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            إرسال
          </Button>
        </div>
      </div>
    </div>
  );
}

```

---

## `client/src/components/Chart3D.tsx`

```tsx
/**
 * Chart3D — 3D bar chart visualization using CSS 3D transforms.
 * No external 3D library required — pure CSS transforms for performance.
 */
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface Chart3DDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface Chart3DProps {
  data: Chart3DDataPoint[];
  title?: string;
  height?: number;
  className?: string;
  variant?: "bars" | "columns";
  showValues?: boolean;
  animated?: boolean;
}

const DEFAULT_COLORS = [
  "#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#84cc16",
];

export function Chart3D({
  data,
  title,
  height = 300,
  className,
  variant = "bars",
  showValues = true,
  animated = true,
}: Chart3DProps) {
  const maxValue = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 p-6 border border-white/10", className)}>
      {title && (
        <h3 className="mb-4 text-lg font-bold text-white/90 text-right">{title}</h3>
      )}

      {/* 3D Scene Container */}
      <div
        className="relative mx-auto"
        style={{
          height,
          perspective: "800px",
          perspectiveOrigin: "50% 40%",
        }}
      >
        {/* 3D Floor */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, rgba(6,182,212,0.3), transparent)",
            transform: "rotateX(60deg)",
            transformOrigin: "bottom",
          }}
        />

        {/* 3D Bars */}
        <div className="flex items-end justify-around h-full px-4 gap-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            const color = item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
            const delay = animated ? `${index * 0.1}s` : "0s";

            return (
              <div key={index} className="flex flex-col items-center flex-1 max-w-[80px]">
                {/* Value label */}
                {showValues && (
                  <span
                    className="text-xs font-mono text-white/70 mb-1"
                    style={{
                      animation: animated ? `fadeInUp 0.5s ease-out ${delay} both` : undefined,
                    }}
                  >
                    {item.value.toLocaleString("ar-SA")}
                  </span>
                )}

                {/* 3D Bar */}
                <div
                  className="relative w-full group cursor-pointer"
                  style={{
                    height: `${barHeight}px`,
                    animation: animated ? `growUp 0.8s ease-out ${delay} both` : undefined,
                    transformStyle: "preserve-3d",
                    transform: "rotateX(-5deg) rotateY(-10deg)",
                  }}
                >
                  {/* Front face */}
                  <div
                    className="absolute inset-0 rounded-t-md transition-all duration-300 group-hover:brightness-125"
                    style={{
                      background: `linear-gradient(180deg, ${color}dd, ${color}88)`,
                      boxShadow: `0 0 20px ${color}33, inset 0 1px 0 rgba(255,255,255,0.2)`,
                    }}
                  />
                  {/* Right face (3D depth) */}
                  <div
                    className="absolute top-0 right-0 h-full w-3 rounded-tr-md"
                    style={{
                      background: `linear-gradient(180deg, ${color}99, ${color}44)`,
                      transform: "skewY(-30deg)",
                      transformOrigin: "top right",
                    }}
                  />
                  {/* Top face (3D depth) */}
                  <div
                    className="absolute top-0 left-0 right-0 h-3 rounded-t-md"
                    style={{
                      background: `linear-gradient(135deg, ${color}ee, ${color}aa)`,
                      transform: "skewX(-30deg)",
                      transformOrigin: "top left",
                    }}
                  />
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 rounded-t-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      boxShadow: `0 0 30px ${color}66, 0 0 60px ${color}22`,
                    }}
                  />
                </div>

                {/* Label */}
                <span className="text-xs text-white/60 mt-2 text-center truncate w-full" dir="rtl">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes growUp {
          from { transform: rotateX(-5deg) rotateY(-10deg) scaleY(0); opacity: 0; }
          to { transform: rotateX(-5deg) rotateY(-10deg) scaleY(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Chart3D;

```

---

## `client/src/components/ChartExport.tsx`

```tsx
/**
 * ChartExport — Chart export and drilldown capabilities.
 * Wraps any chart component with export (PNG, SVG, CSV) and drilldown functionality.
 */
import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface DrilldownLevel {
  label: string;
  data: any;
}

interface ChartExportProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  /** Raw data for CSV export */
  data?: Record<string, any>[];
  /** Enable drilldown functionality */
  drilldownLevels?: DrilldownLevel[];
  onDrilldown?: (level: number, data: any) => void;
  /** File name prefix for exports */
  exportPrefix?: string;
}

export function ChartExport({
  children,
  title,
  className,
  data,
  drilldownLevels,
  onDrilldown,
  exportPrefix = "rasid-chart",
}: ChartExportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [currentDrillLevel, setCurrentDrillLevel] = useState(0);

  // Export as PNG
  const exportPNG = useCallback(async () => {
    if (!containerRef.current) return;
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas").catch(() => ({ default: null }));
      
      if (html2canvas) {
        const canvas = await html2canvas(containerRef.current, {
          backgroundColor: "#0a0e1a",
          scale: 2,
        });
        const link = document.createElement("a");
        link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } else {
        // Fallback: use SVG serialization
        const svgElement = containerRef.current.querySelector("svg");
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
          const url = URL.createObjectURL(svgBlob);
          
          img.onload = () => {
            canvas.width = img.width * 2;
            canvas.height = img.height * 2;
            ctx?.scale(2, 2);
            ctx?.drawImage(img, 0, 0);
            const link = document.createElement("a");
            link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            URL.revokeObjectURL(url);
          };
          img.src = url;
        }
      }
    } catch (err) {
      console.error("PNG export failed:", err);
    } finally {
      setIsExporting(false);
      setShowExportMenu(false);
    }
  }, [exportPrefix]);

  // Export as SVG
  const exportSVG = useCallback(() => {
    if (!containerRef.current) return;
    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [exportPrefix]);

  // Export as CSV
  const exportCSV = useCallback(() => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      // BOM for Arabic support in Excel
      "\uFEFF",
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((h) => {
            const val = row[h];
            if (typeof val === "string" && (val.includes(",") || val.includes('"'))) {
              return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.csv`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [data, exportPrefix]);

  // Export as JSON
  const exportJSON = useCallback(() => {
    if (!data || data.length === 0) return;
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${exportPrefix}-${new Date().toISOString().split("T")[0]}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  }, [data, exportPrefix]);

  // Drilldown navigation
  const handleDrilldown = useCallback(
    (direction: "in" | "out") => {
      if (!drilldownLevels) return;
      const newLevel = direction === "in"
        ? Math.min(currentDrillLevel + 1, drilldownLevels.length - 1)
        : Math.max(currentDrillLevel - 1, 0);
      setCurrentDrillLevel(newLevel);
      onDrilldown?.(newLevel, drilldownLevels[newLevel]?.data);
    },
    [currentDrillLevel, drilldownLevels, onDrilldown]
  );

  return (
    <div className={cn("relative group", className)} dir="rtl">
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Export button */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white flex items-center justify-center text-sm border border-white/10 hover:border-white/20 transition-all"
            title="تصدير"
          >
            ⬇
          </button>
          {showExportMenu && (
            <div className="absolute top-10 left-0 w-36 rounded-lg bg-slate-800 border border-white/10 shadow-xl overflow-hidden z-30">
              <button onClick={exportPNG} disabled={isExporting} className="w-full px-3 py-2 text-right text-xs text-white/70 hover:bg-white/10 transition-colors">
                {isExporting ? "جاري التصدير..." : "📷 تصدير PNG"}
              </button>
              <button onClick={exportSVG} className="w-full px-3 py-2 text-right text-xs text-white/70 hover:bg-white/10 transition-colors">
                🎨 تصدير SVG
              </button>
              {data && data.length > 0 && (
                <>
                  <button onClick={exportCSV} className="w-full px-3 py-2 text-right text-xs text-white/70 hover:bg-white/10 transition-colors">
                    📊 تصدير CSV
                  </button>
                  <button onClick={exportJSON} className="w-full px-3 py-2 text-right text-xs text-white/70 hover:bg-white/10 transition-colors">
                    📋 تصدير JSON
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Drilldown buttons */}
        {drilldownLevels && drilldownLevels.length > 1 && (
          <>
            <button
              onClick={() => handleDrilldown("out")}
              disabled={currentDrillLevel === 0}
              className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white flex items-center justify-center text-sm border border-white/10 disabled:opacity-30 transition-all"
              title="رجوع"
            >
              ↑
            </button>
            <button
              onClick={() => handleDrilldown("in")}
              disabled={currentDrillLevel >= drilldownLevels.length - 1}
              className="w-8 h-8 rounded-lg bg-black/60 backdrop-blur-sm text-white/70 hover:text-white flex items-center justify-center text-sm border border-white/10 disabled:opacity-30 transition-all"
              title="تفصيل"
            >
              ↓
            </button>
            <span className="flex items-center px-2 text-[10px] text-white/40 bg-black/40 rounded-lg border border-white/5">
              {drilldownLevels[currentDrillLevel]?.label}
            </span>
          </>
        )}
      </div>

      {/* Chart content */}
      <div ref={containerRef}>
        {title && (
          <div className="absolute top-2 right-2 z-10 text-xs text-white/30 bg-black/30 px-2 py-1 rounded">
            {title}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export default ChartExport;

```

---

## `client/src/components/ChatFileUpload.tsx`

```tsx
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

```

---

## `client/src/components/CinematicMode.tsx`

```tsx
/**
 * CinematicMode — Global presentation/cinematic overlay for any page
 * Features:
 * - Fullscreen mode
 * - Auto-scroll with configurable timer (5s, 10s, 15s, 30s)
 * - Arrow navigation (up/down scroll)
 * - Font size control (zoom in/out)
 * - Cinematic dark overlay with premium styling
 * - Keyboard shortcuts: Esc=exit, Space=toggle auto, ↑↓=scroll, +/-=font size, F=fullscreen
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  X,
  Timer,
  Monitor,
  Type,
} from "lucide-react";

const RASID_LOGO = "/branding/logos/Rased_3_transparent.png";

const TIMER_OPTIONS = [
  { label: "5s", value: 5000 },
  { label: "10s", value: 10000 },
  { label: "15s", value: 15000 },
  { label: "30s", value: 30000 },
];

const FONT_SIZES = [
  { label: "صغير", value: 0.85, labelEn: "S" },
  { label: "عادي", value: 1, labelEn: "M" },
  { label: "كبير", value: 1.15, labelEn: "L" },
  { label: "أكبر", value: 1.3, labelEn: "XL" },
  { label: "ضخم", value: 1.5, labelEn: "2XL" },
];

interface CinematicModeProps {
  isOpen: boolean;
  onClose: () => void;
  /** The page content to display in cinematic mode */
  children: React.ReactNode;
  /** Page title for the header */
  pageTitle?: string;
}

export default function CinematicMode({ isOpen, onClose, children, pageTitle }: CinematicModeProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [timerValue, setTimerValue] = useState(10000);
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(1); // default "عادي"
  const [showControls, setShowControls] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const hideControlsRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await overlayRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Auto-scroll logic (timer-based)
  useEffect(() => {
    if (isAutoPlay && contentRef.current) {
      autoScrollRef.current = setInterval(() => {
        if (contentRef.current) {
          contentRef.current.scrollBy({ top: 200, behavior: "smooth" });
        }
      }, timerValue);
    }
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    };
  }, [isAutoPlay, timerValue]);

  // Auto-scroll on new content (MutationObserver)
  useEffect(() => {
    if (!isOpen) return;
    const el = contentRef.current;
    if (!el) return;
    const observer = new MutationObserver(() => {
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    });
    observer.observe(el, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [isOpen]);

  // Scroll up/down
  const scrollUp = useCallback(() => {
    contentRef.current?.scrollBy({ top: -300, behavior: "smooth" });
  }, []);

  const scrollDown = useCallback(() => {
    contentRef.current?.scrollBy({ top: 300, behavior: "smooth" });
  }, []);

  // Font size
  const increaseFontSize = useCallback(() => {
    setFontSizeIndex((prev) => Math.min(prev + 1, FONT_SIZES.length - 1));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setFontSizeIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case " ":
          e.preventDefault();
          setIsAutoPlay((prev) => !prev);
          break;
        case "ArrowUp":
          e.preventDefault();
          scrollUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          scrollDown();
          break;
        case "+":
        case "=":
          increaseFontSize();
          break;
        case "-":
          decreaseFontSize();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, scrollUp, scrollDown, increaseFontSize, decreaseFontSize, toggleFullscreen]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!isOpen) return;
    const resetTimer = () => {
      setShowControls(true);
      if (hideControlsRef.current) clearTimeout(hideControlsRef.current);
      hideControlsRef.current = setTimeout(() => setShowControls(false), 4000);
    };
    resetTimer();
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("touchstart", resetTimer);
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
      if (hideControlsRef.current) clearTimeout(hideControlsRef.current);
    };
  }, [isOpen]);

  // Exit fullscreen on close
  useEffect(() => {
    if (!isOpen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentFontSize = FONT_SIZES[fontSizeIndex];

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-[#030712] flex flex-col"
        dir="rtl"
      >
        {/* Aurora background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-teal-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px]" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(61,177,172,0.15) 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* Header */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -60, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-20 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/80 to-transparent"
            >
              <div className="flex items-center gap-3">
                <img src={RASID_LOGO} alt="راصد" className="h-7 object-contain" style={{ filter: "drop-shadow(0 1px 4px rgba(61,177,172,0.3))" }} />
                {pageTitle && (
                  <span className="text-sm font-semibold text-teal-300/80">{pageTitle}</span>
                )}
                <span className="text-[10px] text-slate-500 border border-slate-700/50 rounded px-2 py-0.5">
                  الوضع السينمائي
                </span>
              </div>
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors bg-slate-800/50 hover:bg-slate-700/50 rounded-lg px-3 py-1.5 border border-slate-700/40"
              >
                <X className="w-3.5 h-3.5" />
                خروج
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto relative z-10 px-4 lg:px-8 py-6"
          style={{ fontSize: `${currentFontSize.value}rem` }}
        >
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>

        {/* Bottom Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-20 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-t from-black/80 to-transparent"
            >
              {/* Font Size Controls */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl px-2 py-1.5 border border-slate-700/40">
                <button
                  onClick={decreaseFontSize}
                  disabled={fontSizeIndex === 0}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                  title="تصغير الخط"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] text-teal-400 font-mono min-w-[28px] text-center">
                  {currentFontSize.labelEn}
                </span>
                <button
                  onClick={increaseFontSize}
                  disabled={fontSizeIndex === FONT_SIZES.length - 1}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                  title="تكبير الخط"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>

              {/* Scroll Controls */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl px-2 py-1.5 border border-slate-700/40">
                <button
                  onClick={scrollUp}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                  title="تمرير لأعلى"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollDown}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                  title="تمرير لأسفل"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Auto-play + Timer */}
              <div className="flex items-center gap-1 bg-slate-800/60 rounded-xl px-2 py-1.5 border border-slate-700/40 relative">
                <button
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isAutoPlay
                      ? "bg-teal-500/20 text-teal-400"
                      : "hover:bg-slate-700/50 text-slate-400 hover:text-white"
                  }`}
                  title={isAutoPlay ? "إيقاف التشغيل التلقائي" : "تشغيل تلقائي"}
                >
                  {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowTimerPicker(!showTimerPicker)}
                    className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    title="تحديد الوقت"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono">{timerValue / 1000}s</span>
                  </button>
                  {showTimerPicker && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700/50 rounded-xl p-2 flex gap-1 shadow-2xl">
                      {TIMER_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setTimerValue(opt.value);
                            setShowTimerPicker(false);
                          }}
                          className={`text-[10px] px-3 py-1.5 rounded-lg transition-colors ${
                            timerValue === opt.value
                              ? "bg-teal-500/20 text-teal-400 border border-teal-500/30"
                              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-xl bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                title={isFullscreen ? "خروج من الشاشة الكاملة" : "شاشة كاملة"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keyboard shortcuts hint */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20"
            >
              <div className="flex items-center gap-3 text-[9px] text-slate-600">
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">Esc</kbd> خروج</span>
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">Space</kbd> تشغيل/إيقاف</span>
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">↑↓</kbd> تمرير</span>
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">+/-</kbd> حجم الخط</span>
                <span><kbd className="px-1 py-0.5 bg-slate-800/50 rounded text-[8px] border border-slate-700/30">F</kbd> شاشة كاملة</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

/** Cinematic mode trigger button — place in DashboardLayout header */
export function CinematicButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-200
        border-slate-700/40 text-slate-400 hover:text-teal-300 hover:border-teal-500/30 hover:bg-teal-500/5
        dark:border-slate-700/40 dark:text-slate-400 dark:hover:text-teal-300 dark:hover:border-teal-500/30 dark:hover:bg-teal-500/5"
      title="الوضع السينمائي"
    >
      <Monitor className="w-3.5 h-3.5" />
      <span>سينمائي</span>
    </button>
  );
}

```

---

## `client/src/components/CinematicTransition.tsx`

```tsx
/**
 * CinematicTransition — Smooth cinematic page transitions with multiple effects.
 * Wraps page content and animates entry/exit using CSS transitions.
 */
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

type TransitionType = "fade" | "slide-up" | "slide-right" | "zoom" | "blur" | "cinematic";

interface CinematicTransitionProps {
  children: React.ReactNode;
  /** Unique key to trigger transition on change (e.g., route path) */
  transitionKey: string;
  type?: TransitionType;
  duration?: number; // ms
  className?: string;
}

export function CinematicTransition({
  children,
  transitionKey,
  type = "cinematic",
  duration = 400,
  className,
}: CinematicTransitionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentKey, setCurrentKey] = useState(transitionKey);
  const [displayChildren, setDisplayChildren] = useState(children);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (transitionKey !== currentKey) {
      // Exit animation
      setIsVisible(false);
      timeoutRef.current = setTimeout(() => {
        setDisplayChildren(children);
        setCurrentKey(transitionKey);
        // Enter animation
        requestAnimationFrame(() => setIsVisible(true));
      }, duration / 2);
    } else {
      setDisplayChildren(children);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [transitionKey, children, currentKey, duration]);

  // Initial mount animation
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const transitionStyles: Record<TransitionType, { hidden: string; visible: string }> = {
    fade: {
      hidden: "opacity-0",
      visible: "opacity-100",
    },
    "slide-up": {
      hidden: "opacity-0 translate-y-8",
      visible: "opacity-100 translate-y-0",
    },
    "slide-right": {
      hidden: "opacity-0 -translate-x-8",
      visible: "opacity-100 translate-x-0",
    },
    zoom: {
      hidden: "opacity-0 scale-95",
      visible: "opacity-100 scale-100",
    },
    blur: {
      hidden: "opacity-0 blur-sm scale-[0.98]",
      visible: "opacity-100 blur-0 scale-100",
    },
    cinematic: {
      hidden: "opacity-0 scale-[0.97] translate-y-2 blur-[2px]",
      visible: "opacity-100 scale-100 translate-y-0 blur-0",
    },
  };

  const styles = transitionStyles[type];

  return (
    <div
      className={cn(
        "transition-all ease-out",
        isVisible ? styles.visible : styles.hidden,
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {displayChildren}
    </div>
  );
}

export default CinematicTransition;

```

---

## `client/src/components/CommandPalette.tsx`

```tsx
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search, BarChart3, Shield, FileText, Globe, Users, Settings,
  Brain, AlertTriangle, Database, Eye, TrendingUp, Layers, MapPin,
  Activity, BookOpen, Zap, Network, Terminal, MessageSquare,
} from "lucide-react";

interface CommandAction {
  id: string;
  label: string;
  labelEn?: string;
  icon: React.ElementType;
  group: string;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  const actions: CommandAction[] = [
    // Navigation
    { id: "home", label: "لوحة المعلومات الرئيسية", icon: BarChart3, group: "التنقل", action: () => go("/"), keywords: ["dashboard", "رئيسية"] },
    { id: "leaks", label: "حالات الرصد", icon: AlertTriangle, group: "التنقل", action: () => go("/leaks"), keywords: ["leaks", "رصد", "تسريب"] },
    { id: "sites", label: "المواقع المراقبة", icon: Globe, group: "التنقل", action: () => go("/sites"), keywords: ["sites", "مواقع"] },
    { id: "reports", label: "التقارير", icon: FileText, group: "التنقل", action: () => go("/reports"), keywords: ["reports", "تقارير"] },
    { id: "scan", label: "الفحص", icon: Search, group: "التنقل", action: () => go("/scan"), keywords: ["scan", "فحص"] },
    { id: "members", label: "الأعضاء", icon: Users, group: "التنقل", action: () => go("/members"), keywords: ["members", "أعضاء", "فريق"] },
    { id: "cases", label: "القضايا", icon: Shield, group: "التنقل", action: () => go("/cases"), keywords: ["cases", "قضايا"] },
    { id: "settings", label: "الإعدادات", icon: Settings, group: "التنقل", action: () => go("/settings"), keywords: ["settings", "إعدادات"] },
    { id: "darkweb", label: "مراقبة الويب المظلم", icon: Eye, group: "التنقل", action: () => go("/dark-web"), keywords: ["dark web", "ويب مظلم"] },
    { id: "threats", label: "خريطة التهديدات", icon: MapPin, group: "التنقل", action: () => go("/threat-map"), keywords: ["threats", "تهديدات"] },
    { id: "analytics", label: "التحليلات المتقدمة", icon: TrendingUp, group: "التنقل", action: () => go("/advanced-analytics"), keywords: ["analytics", "تحليلات"] },
    { id: "knowledge", label: "قاعدة المعرفة", icon: BookOpen, group: "التنقل", action: () => go("/knowledge-base"), keywords: ["knowledge", "معرفة"] },
    { id: "evidence", label: "سلسلة الأدلة", icon: Layers, group: "التنقل", action: () => go("/evidence-chain"), keywords: ["evidence", "أدلة"] },
    { id: "activity", label: "سجل النشاط", icon: Activity, group: "التنقل", action: () => go("/activity-logs"), keywords: ["activity", "نشاط", "سجل"] },
    { id: "health", label: "صحة النظام", icon: Terminal, group: "التنقل", action: () => go("/system-health"), keywords: ["health", "صحة", "نظام"] },
    // AI Actions
    { id: "smart-rasid", label: "راصد الذكي", icon: Brain, group: "الذكاء الاصطناعي", action: () => go("/smart-rasid"), keywords: ["ai", "ذكاء", "راصد"] },
    { id: "training", label: "مركز التدريب", icon: Zap, group: "الذكاء الاصطناعي", action: () => go("/training-center"), keywords: ["training", "تدريب"] },
    { id: "scenarios", label: "إدارة السيناريوهات", icon: Network, group: "الذكاء الاصطناعي", action: () => go("/scenario-management"), keywords: ["scenarios", "سيناريوهات"] },
    { id: "bulk", label: "التحليل الجماعي", icon: Database, group: "الذكاء الاصطناعي", action: () => go("/bulk-analysis"), keywords: ["bulk", "جماعي"] },
    // Quick Actions
    { id: "new-scan", label: "بدء فحص جديد", icon: Search, group: "إجراءات سريعة", action: () => go("/scan-execution"), keywords: ["new scan", "فحص جديد"] },
    { id: "new-report", label: "إنشاء تقرير", icon: FileText, group: "إجراءات سريعة", action: () => go("/custom-reports"), keywords: ["new report", "تقرير جديد"] },
    { id: "chat-ai", label: "محادثة مع راصد الذكي", icon: MessageSquare, group: "إجراءات سريعة", action: () => go("/smart-rasid"), keywords: ["chat", "محادثة"] },
  ];

  const grouped = actions.reduce((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group].push(action);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="ابحث عن صفحة أو إجراء... (Ctrl+K)" dir="rtl" />
      <CommandList>
        <CommandEmpty>لا توجد نتائج مطابقة.</CommandEmpty>
        {Object.entries(grouped).map(([group, items], idx) => (
          <div key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.labelEn || ""} ${(item.keywords || []).join(" ")}`}
                  onSelect={item.action}
                  className="flex items-center gap-3 rtl:flex-row-reverse"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

```

---

## `client/src/components/ComplianceWarningDialog.tsx`

```tsx
/**
 * ComplianceWarningDialog — Ultra Premium compact compliance warning
 * Redesigned to fit without scrolling on mobile and desktop
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  X,
  Lock,
  Scale,
  Fingerprint,
  Eye,
  ShieldCheck,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const RASID_LOGO = "/branding/logos/Rased_1_transparent_1.png";

interface ComplianceWarningDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  reportType?: string;
}

/* ─── Compact Security Ring ─── */
function SecurityRing() {
  return (
    <div className="relative w-12 h-12 shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          border: "2px solid transparent",
          borderTopColor: "rgba(239, 68, 68, 0.6)",
          borderRightColor: "rgba(245, 158, 11, 0.4)",
          animation: "compliance-spin 3s linear infinite",
        }}
      />
      <div
        className="absolute inset-1 rounded-full"
        style={{
          border: "1.5px solid transparent",
          borderBottomColor: "rgba(239, 68, 68, 0.4)",
          borderLeftColor: "rgba(245, 158, 11, 0.3)",
          animation: "compliance-spin 2s linear infinite reverse",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-red-400" style={{ animation: "compliance-icon-pulse 2s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Scan Line Effect ─── */
function ScanLine() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.3), rgba(245, 158, 11, 0.2), transparent)",
          animation: "compliance-scan-line 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}

export default function ComplianceWarningDialog({
  open,
  onConfirm,
  onCancel,
  reportType = "تقرير",
}: ComplianceWarningDialogProps) {
  const [agreed, setAgreed] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    if (open) {
      setAgreed(false);
      setShowContent(false);
      const t = setTimeout(() => setShowContent(true), 300);
      setCurrentTime(
        new Date().toLocaleString("ar-SA", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Riyadh",
        })
      );
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4"
          onClick={onCancel}
        >
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)",
              backdropFilter: "blur(12px)",
            }}
          />

          {/* Red ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.08) 0%, transparent 60%)",
            }}
          />

          {/* Floating particles - reduced count */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 2 + Math.random() * 2,
                  height: 2 + Math.random() * 2,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  background: i % 2 === 0 ? "rgba(239, 68, 68, 0.4)" : "rgba(245, 158, 11, 0.4)",
                  animation: `compliance-particle ${3 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.85, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 300, delay: 0.1 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "linear-gradient(180deg, rgba(15, 10, 20, 0.98) 0%, rgba(20, 12, 15, 0.98) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
              boxShadow: "0 0 60px rgba(239, 68, 68, 0.1), 0 25px 50px rgba(0,0,0,0.5)",
              maxHeight: "calc(100dvh - 2rem)",
            }}
          >
            <ScanLine />

            {/* ═══ COMPACT HEADER ═══ */}
            <motion.div
              initial={{ y: -15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="px-4 py-3 relative"
              style={{
                background: "linear-gradient(135deg, rgba(127, 29, 29, 0.5) 0%, rgba(153, 27, 27, 0.3) 30%, rgba(20, 12, 15, 0.9) 100%)",
                borderBottom: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              {/* Corner markers */}
              <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t border-r border-red-500/40 rounded-tr" />
              <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t border-l border-red-500/40 rounded-tl" />

              <div className="flex items-center gap-3">
                <SecurityRing />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                      style={{
                        background: "linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(185, 28, 28, 0.4))",
                        border: "1px solid rgba(239, 68, 68, 0.5)",
                        color: "#fca5a5",
                        letterSpacing: "0.12em",
                        animation: "compliance-stamp-glow 2s ease-in-out infinite",
                      }}
                    >
                      ⛔ سري — TOP SECRET
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">إقرار مسؤولية وتعهد رسمي</h3>
                  <p className="text-[9px] text-red-300/50 mt-0.5">Official Responsibility Acknowledgment — NDMO</p>
                </div>
                <button
                  onClick={onCancel}
                  className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors self-start"
                >
                  <X className="w-4 h-4 text-red-300/50" />
                </button>
              </div>
            </motion.div>

            {/* ═══ COMPACT CONTENT ═══ */}
            <AnimatePresence>
              {showContent && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="px-4 py-3 space-y-2.5"
                >
                  {/* Platform Identity - inline compact */}
                  <div className="flex items-center justify-center gap-2 py-1.5">
                    <img
                      src={RASID_LOGO}
                      alt="منصة راصد"
                      className="w-10 h-auto object-contain"
                      style={{ animation: "compliance-icon-pulse 3s ease-in-out infinite", filter: 'drop-shadow(0 0 6px rgba(61,177,172,0.15))' }}
                    />
                    <div className="text-center">
                      <p className="text-xs font-bold text-white leading-tight">منصة راصد — مكتب إدارة البيانات الوطنية</p>
                      <p className="text-[8px] text-red-300/40">National Data Management Office — Rasid Platform</p>
                    </div>
                  </div>

                  {/* ─── Main Warning + Legal combined ─── */}
                  <motion.div
                    initial={{ x: -8, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl p-3 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.04))",
                      border: "1px solid rgba(239, 68, 68, 0.2)",
                    }}
                  >
                    <div
                      className="absolute inset-0 pointer-events-none opacity-[0.02]"
                      style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(239,68,68,1) 20px, rgba(239,68,68,1) 21px)`,
                      }}
                    />
                    <div className="relative flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-red-400" style={{ animation: "compliance-icon-pulse 2s ease-in-out infinite" }} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-white leading-relaxed">
                          هذا الإجراء يتضمن إصدار <span className="text-red-400 font-bold">{reportType}</span> يحتوي على بيانات شخصية مصنفة وفقاً لـ<span className="text-amber-400 font-semibold">نظام حماية البيانات الشخصية (PDPL)</span>.
                          إصدار الوثائق يجب أن يكون <span className="font-bold text-red-400 underline underline-offset-2 decoration-red-400/40">حصرياً</span> للمهام الرسمية المعتمدة.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* ─── Legal Warning - compact ─── */}
                  <motion.div
                    initial={{ x: 8, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl p-3 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(185, 28, 28, 0.1), rgba(127, 29, 29, 0.06))",
                      border: "1px solid rgba(185, 28, 28, 0.2)",
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-red-900/30 border border-red-800/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Scale className="w-4 h-4 text-red-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className="text-xs text-red-300 font-bold">تحذير قانوني</p>
                          <div className="px-1.5 py-px rounded text-[8px] font-bold bg-red-500/10 border border-red-500/20 text-red-400">
                            LEGAL NOTICE
                          </div>
                        </div>
                        <p className="text-[11px] text-red-100/60 leading-relaxed">
                          أي استخدام خارج المهام الرسمية يُعد <span className="text-red-400 font-semibold">مخالفة صريحة</span> ويستوجب المساءلة النظامية الكاملة.
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  {/* ─── Audit Trail + Monitoring - combined row ─── */}
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 rounded-xl p-2.5"
                    style={{
                      background: "rgba(30, 20, 40, 0.4)",
                      border: "1px solid rgba(100, 80, 120, 0.15)",
                    }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <Fingerprint className="w-3.5 h-3.5 text-violet-400" style={{ animation: "compliance-icon-pulse 2.5s ease-in-out infinite" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] text-violet-300/70 font-medium">سجل التدقيق الأمني — Audit Trail</p>
                      <p className="text-[8px] text-violet-200/40 truncate">هوية المستخدم • التاريخ • نوع {reportType} • IP</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Eye className="w-2.5 h-2.5 text-amber-400/40" />
                      <Lock className="w-2.5 h-2.5 text-amber-400/40" />
                      <KeyRound className="w-2.5 h-2.5 text-amber-400/40" />
                    </div>
                  </motion.div>

                  {/* ─── Agreement Checkbox - compact ─── */}
                  <motion.label
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className={`flex items-start gap-2.5 cursor-pointer p-3 rounded-xl transition-all duration-300 ${
                      agreed
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-red-500/15 bg-red-500/[0.02] hover:border-red-500/30"
                    }`}
                    style={{ border: `1px solid ${agreed ? "rgba(16, 185, 129, 0.4)" : "rgba(239, 68, 68, 0.15)"}` }}
                  >
                    <div className={`relative w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                      agreed
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-red-400/40 bg-transparent"
                    }`}>
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      {agreed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 15, stiffness: 400 }}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <span className="text-[11px] text-white/90 leading-relaxed">
                      أُقر وأتعهد بأنني أطلب هذا <span className="text-red-400 font-bold">{reportType}</span> لأغراض المهام الرسمية المعتمدة حصرياً في مكتب إدارة البيانات الوطنية، وأتحمل المسؤولية القانونية الكاملة عن أي استخدام غير مصرح به.
                    </span>
                  </motion.label>

                  {/* National Motto */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="text-center text-[10px] font-semibold py-0.5"
                    style={{ color: "rgba(239, 68, 68, 0.45)" }}
                  >
                    ❝ حماية البيانات الشخصية متطلب وطني ❞
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ═══ COMPACT ACTIONS ═══ */}
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="px-4 py-3 flex items-center gap-2.5"
              style={{
                borderTop: "1px solid rgba(239, 68, 68, 0.1)",
                background: "rgba(10, 5, 15, 0.5)",
              }}
            >
              <Button
                variant="outline"
                className="flex-1 h-9 text-xs border-red-500/20 text-red-300/70 hover:bg-red-500/10 hover:text-red-300 bg-transparent"
                onClick={onCancel}
              >
                <X className="w-3.5 h-3.5 ml-1.5" />
                إلغاء
              </Button>
              <Button
                className={`flex-1 h-9 text-xs gap-1.5 font-semibold transition-all duration-500 ${
                  agreed
                    ? "text-white shadow-lg"
                    : "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
                }`}
                style={
                  agreed
                    ? {
                        background: "linear-gradient(135deg, #059669 0%, #0d9488 50%, #0891b2 100%)",
                        boxShadow: "0 0 20px rgba(5, 150, 105, 0.3), 0 4px 12px rgba(0,0,0,0.3)",
                      }
                    : {}
                }
                disabled={!agreed}
                onClick={() => {
                  if (agreed) {
                    setAgreed(false);
                    onConfirm();
                  }
                }}
              >
                {agreed ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    أوافق وأتعهد — متابعة الإصدار
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    يرجى الموافقة أولاً
                  </>
                )}
              </Button>
            </motion.div>

            {/* Corner markers */}
            <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b border-r border-red-500/20 rounded-br pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b border-l border-red-500/20 rounded-bl pointer-events-none" />
          </motion.div>
        </motion.div>
      )}

      <style>{`
        @keyframes compliance-particle {
          0%, 100% { opacity: 0; transform: translateY(0) scale(0.5); }
          50% { opacity: 1; transform: translateY(-30px) scale(1); }
        }
        @keyframes compliance-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes compliance-icon-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes compliance-scan-line {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes compliance-stamp-glow {
          0%, 100% { box-shadow: 0 0 8px rgba(239, 68, 68, 0.1); }
          50% { box-shadow: 0 0 16px rgba(239, 68, 68, 0.25); }
        }
      `}</style>
    </AnimatePresence>
  );
}

```

---

## `client/src/components/ConfettiEffect.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';

interface ConfettiEffectProps {
  trigger: boolean;
  count?: number;
  duration?: number;
  colors?: string[];
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  gravity: number;
}

export function ConfettiEffect({
  trigger,
  count = 60,
  duration = 3000,
  colors = ['#273470', '#6459A7', '#1E3A5F', '#4A7AB5', '#EB3D63', '#2A4F7A'],
}: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setActive(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: ConfettiParticle[] = Array.from(
      { length: Math.min(count, 100) },
      () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        width: Math.random() * 8 + 4,
        height: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        gravity: 0.1 + Math.random() * 0.05,
      })
    );

    let animFrame: number;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        setActive(false);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;

        if (elapsed > duration * 0.7) {
          p.opacity = Math.max(0, 1 - (elapsed - duration * 0.7) / (duration * 0.3));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      });

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrame);
  }, [trigger, count, duration, colors]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}

```

---

## `client/src/components/ConfirmActionDialog.tsx`

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, Shield, RefreshCw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "danger" | "warning" | "info" | "default";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

const variantConfig: Record<ConfirmVariant, { icon: LucideIcon; color: string; btnClass: string }> = {
  danger: { icon: Trash2, color: "text-red-500", btnClass: "bg-red-600 hover:bg-red-700 text-white" },
  warning: { icon: AlertTriangle, color: "text-amber-500", btnClass: "bg-amber-600 hover:bg-amber-700 text-white" },
  info: { icon: Shield, color: "text-blue-500", btnClass: "bg-blue-600 hover:bg-blue-700 text-white" },
  default: { icon: RefreshCw, color: "text-primary", btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground" },
};

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "default",
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmActionDialogProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl" className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full bg-muted", config.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:flex-row-reverse">
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn("min-w-[100px]", config.btnClass)}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onCancel}
            className="min-w-[100px]"
          >
            {cancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

```

---

## `client/src/components/CreatePageModal.tsx`

```tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LayoutDashboard, Table2, FileText, Sparkles, ChevronRight } from "lucide-react";

interface CreatePageModalProps {
  open: boolean;
  onClose: () => void;
  onCreatePage: (pageType: "dashboard" | "table" | "report", title: string) => void;
  workspace: string;
}

const PAGE_TYPES = [
  {
    type: "dashboard" as const,
    icon: LayoutDashboard,
    title: "لوحة مؤشرات",
    titleEn: "Dashboard",
    description: "أنشئ لوحة مؤشرات مخصصة بالسحب والإفلات",
    color: "from-cyan-500 to-blue-600",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-400",
  },
  {
    type: "table" as const,
    icon: Table2,
    title: "جدول بيانات",
    titleEn: "Data Table",
    description: "اختر الأعمدة والفلاتر وأنشئ عرض مخصص",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-400",
  },
  {
    type: "report" as const,
    icon: FileText,
    title: "تقرير",
    titleEn: "Report",
    description: "أنشئ تقرير ديناميكي مع أقسام قابلة للتخصيص",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    hoverBorder: "hover:border-amber-400",
  },
];

export default function CreatePageModal({ open, onClose, onCreatePage, workspace }: CreatePageModalProps) {
  const [step, setStep] = useState<"type" | "name">("type");
  const [selectedType, setSelectedType] = useState<"dashboard" | "table" | "report" | null>(null);
  const [title, setTitle] = useState("");

  const handleSelectType = (type: "dashboard" | "table" | "report") => {
    setSelectedType(type);
    setStep("name");
  };

  const handleCreate = () => {
    if (!selectedType || !title.trim()) return;
    onCreatePage(selectedType, title.trim());
    // Reset state
    setStep("type");
    setSelectedType(null);
    setTitle("");
    onClose();
  };

  const handleClose = () => {
    setStep("type");
    setSelectedType(null);
    setTitle("");
    onClose();
  };

  const selectedTypeInfo = PAGE_TYPES.find(p => p.type === selectedType);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={handleClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg mx-4 rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
              border: "1px solid rgba(148, 163, 184, 0.15)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(6, 182, 212, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">
                    {step === "type" ? "إنشاء صفحة جديدة" : "تسمية الصفحة"}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {step === "type"
                      ? `${workspace === "leaks" ? "حالات الرصد" : "الخصوصية"} — اختر نوع الصفحة`
                      : `${selectedTypeInfo?.title} — أدخل اسم الصفحة`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <AnimatePresence mode="wait">
                {step === "type" ? (
                  <motion.div
                    key="type-selection"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-3"
                  >
                    {PAGE_TYPES.map((pt, i) => (
                      <motion.button
                        key={pt.type}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleSelectType(pt.type)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border ${pt.borderColor} ${pt.hoverBorder} ${pt.bgColor} transition-all duration-300 group hover:scale-[1.02]`}
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pt.color} flex items-center justify-center shadow-lg`}>
                          <pt.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-slate-500 text-xs">{pt.titleEn}</span>
                            <span className="text-white font-bold text-base">{pt.title}</span>
                          </div>
                          <p className="text-slate-400 text-sm mt-1">{pt.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors rotate-180" />
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="name-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    {/* Selected type preview */}
                    {selectedTypeInfo && (
                      <div className={`flex items-center gap-3 p-3 rounded-xl ${selectedTypeInfo.bgColor} border ${selectedTypeInfo.borderColor}`}>
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedTypeInfo.color} flex items-center justify-center`}>
                          <selectedTypeInfo.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right">
                          <span className="text-white font-semibold text-sm">{selectedTypeInfo.title}</span>
                          <p className="text-slate-400 text-xs">{selectedTypeInfo.description}</p>
                        </div>
                      </div>
                    )}

                    {/* Name input */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-2 text-right">
                        اسم الصفحة
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        placeholder="مثال: لوحة المؤشرات الرئيسية"
                        autoFocus
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-600/50 text-white text-right placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                        dir="rtl"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => { setStep("type"); setSelectedType(null); setTitle(""); }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                      >
                        رجوع
                      </button>
                      <button
                        onClick={handleCreate}
                        disabled={!title.trim()}
                        className={`flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all ${
                          title.trim()
                            ? `bg-gradient-to-r ${selectedTypeInfo?.color} hover:shadow-lg hover:scale-[1.02]`
                            : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        إنشاء الصفحة
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

---

## `client/src/components/CustomPagesList.tsx`

```tsx
/**
 * CustomPagesList — Renders user-created pages in the sidebar
 * Shows icons based on page type, with context menu for rename/delete
 */
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Table2, FileText, Pencil, Trash2, Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import type { CustomPage } from "@/hooks/useCustomPages";

interface CustomPagesListProps {
  pages: CustomPage[];
  collapsed: boolean;
  accent: string;
  accentBg: string;
  accentBorder: string;
  searchQuery?: string;
  onDeletePage: (id: number) => void;
  onRenamePage: (id: number, newTitle: string) => void;
  onNavClick: () => void;
  isDeleting: boolean;
}

const PAGE_TYPE_ICONS: Record<string, React.ElementType> = {
  dashboard: LayoutDashboard,
  table: Table2,
  report: FileText,
};

const PAGE_TYPE_COLORS: Record<string, string> = {
  dashboard: "#3DB1AC",
  table: "#22c55e",
  report: "#f59e0b",
};

export default function CustomPagesList({
  pages,
  collapsed,
  accent,
  accentBg,
  accentBorder,
  searchQuery = "",
  onDeletePage,
  onRenamePage,
  onNavClick,
  isDeleting,
}: CustomPagesListProps) {
  const [location] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [contextMenu, setContextMenu] = useState<{ id: number; x: number; y: number } | null>(null);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const contextRef = useRef<HTMLDivElement>(null);
  const renameRef = useRef<HTMLInputElement>(null);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  const getPagePath = (page: CustomPage) => {
    return `/custom/${page.pageType}/${page.id}`;
  };

  const handleContextMenu = (e: React.MouseEvent, pageId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ id: pageId, x: e.clientX, y: e.clientY });
  };

  const startRename = (page: CustomPage) => {
    setRenamingId(page.id);
    setRenameValue(page.title);
    setContextMenu(null);
  };

  const confirmRename = () => {
    if (renamingId && renameValue.trim()) {
      onRenamePage(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue("");
  };

  if (pages.length === 0) return null;

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visiblePages = normalizedQuery
    ? pages.filter((page) =>
        page.title.toLowerCase().includes(normalizedQuery) ||
        page.pageType.toLowerCase().includes(normalizedQuery)
      )
    : pages;

  if (visiblePages.length === 0) {
    return (
      <div
        className={`px-3 py-2.5 text-[11px] rounded-lg border ${
          isDark
            ? "text-slate-300/70 border-white/10 bg-white/[0.02]"
            : "text-[#5a6478] border-[#e6ebf5] bg-[#f8faff]"
        }`}
      >
        لا توجد صفحات مطابقة للبحث.
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <AnimatePresence>
        {visiblePages.map((page, index) => {
          const Icon = PAGE_TYPE_ICONS[page.pageType] || LayoutDashboard;
          const typeColor = PAGE_TYPE_COLORS[page.pageType] || accent;
          const pagePath = getPagePath(page);
          const isActive = location === pagePath;

          return (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.03 }}
            >
              {renamingId === page.id ? (
                <div className="px-3 py-1.5">
                  <input
                    ref={renameRef}
                    type="text"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") confirmRename();
                      if (e.key === "Escape") { setRenamingId(null); setRenameValue(""); }
                    }}
                    onBlur={confirmRename}
                    dir="rtl"
                    className={`
                      w-full px-2 py-1 rounded text-[13px] font-medium
                      ${isDark
                        ? "bg-slate-800 border-[rgba(61,177,172,0.3)] text-white"
                        : "bg-gray-50 border-gray-200 text-gray-900"
                      }
                      border focus:outline-none focus:ring-1 transition-all
                    `}
                    style={{ '--tw-ring-color': accent } as React.CSSProperties}
                  />
                </div>
              ) : (
                <Link href={pagePath} onClick={onNavClick}>
                  <motion.div
                    whileHover={{ x: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onContextMenu={(e) => handleContextMenu(e, page.id)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
                      group relative transition-colors duration-150
                      ${isActive
                        ? isDark
                          ? "border border-[rgba(61,177,172,0.25)]"
                          : "border border-[rgba(30,58,138,0.12)]"
                        : isDark
                          ? "text-sidebar-foreground/60 hover:text-sidebar-foreground/80 hover:bg-white/[0.03]"
                          : "text-[#5a6478] hover:text-[#1c2833] hover:bg-black/[0.02]"
                      }
                    `}
                    style={isActive ? { backgroundColor: accentBg, borderColor: accentBorder } : undefined}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeCustomNav"
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
                        style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}66` }}
                      />
                    )}

                    {/* Icon */}
                    <div className="sidebar-nav-icon">
                      <Icon
                        className="w-4 h-4 flex-shrink-0"
                        style={isActive ? { color: typeColor } : { color: `${typeColor}80` }}
                      />
                    </div>

                    {/* Label */}
                    {!collapsed && (
                      <span className="text-[13px] font-medium whitespace-nowrap truncate flex-1">
                        {page.title}
                      </span>
                    )}

                    {/* Action buttons (rename & delete) */}
                    {!collapsed && (
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        <button
                          aria-label="إعادة تسمية"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            startRename(page);
                          }}
                          className={`
                            w-5 h-5 rounded flex items-center justify-center
                            opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity
                            ${isDark ? "hover:bg-white/10 text-slate-400 hover:text-[#3DB1AC]" : "hover:bg-black/5 text-gray-400 hover:text-blue-600"}
                          `}
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          aria-label="حذف"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onDeletePage(page.id);
                          }}
                          disabled={isDeleting}
                          className={`
                            w-5 h-5 rounded flex items-center justify-center
                            opacity-0 group-hover:opacity-70 hover:!opacity-100 transition-opacity
                            ${isDark ? "hover:bg-red-500/10 text-slate-400 hover:text-red-400" : "hover:bg-red-50 text-gray-400 hover:text-red-500"}
                          `}
                        >
                          {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                        </button>
                      </div>
                    )}

                    {/* Collapsed tooltip */}
                    {collapsed && (
                      <div className={`absolute right-14 ${isDark ? 'bg-[rgba(26,37,80,0.95)] text-[#E1DEF5] border-[rgba(61,177,172,0.15)]' : 'bg-white text-[#1c2833] border-[#e2e5ef]'} backdrop-blur-xl text-xs py-1.5 px-3 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border`}>
                        {page.title}
                      </div>
                    )}
                  </motion.div>
                </Link>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={contextRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed z-[100] rounded-lg overflow-hidden shadow-2xl"
            style={{
              top: contextMenu.y,
              left: contextMenu.x - 160,
              width: 160,
              background: isDark
                ? "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))"
                : "rgba(255,255,255,0.98)",
              border: isDark
                ? "1px solid rgba(61, 177, 172, 0.15)"
                : "1px solid rgba(0,0,0,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            <button
              onClick={() => {
                const page = pages.find(p => p.id === contextMenu.id);
                if (page) startRename(page);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                isDark ? "text-slate-300 hover:bg-white/[0.06] hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Pencil className="w-3 h-3" />
              <span>إعادة تسمية</span>
            </button>
            <button
              onClick={() => {
                onDeletePage(contextMenu.id);
                setContextMenu(null);
              }}
              disabled={isDeleting}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
              }`}
            >
              {isDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
              <span>حذف</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

```

---

## `client/src/components/DashboardLayout.tsx`

```tsx
/**
 * DashboardLayout — SDAIA Ultra Premium Design System
 * RTL-first sidebar with SDAIA official colors (#273470, #6459A7, #3DB1AC)
 * Glassmorphism, scan-line effects, and premium animations
 * - Workspace Switcher in HEADER: حالات الرصد / الخصوصية
 * - Sidebar: الرئيسية (flat) + workspace groups + لوحة التحكم (flat)
 * - Full workspace switch: sidebar + dashboard + colors + header title
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Send, Globe, FileText, ScanSearch, ShieldAlert,
  BarChart3, Settings, ChevronRight, ChevronLeft, ChevronDown, Menu, X,
  Search, Shield, LogIn, LogOut, Users, Loader2, Radio, ScrollText, Bell,
  Archive, Map, CalendarClock, KeyRound, Crosshair, Link2, UserX, Radar,
  Brain, Network, Sun, Moon, Monitor, Bot, CheckCircle2, Scan, FileCheck,
  FileBarChart, Stamp, Sparkles, BookOpen, HeartHandshake, GraduationCap,
  Activity, Crown, Layers, Eye, QrCode, Home, Import, History,
  FolderOpen, Wrench, Clock, Download, FileDown, Database, Gauge, PanelLeft,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNdmoAuth } from "@/hooks/useNdmoAuth";
import { getLoginUrl } from "@/const";
import NotificationBell from "./NotificationBell";
import { useTheme } from "@/contexts/ThemeContext";
import { Redirect } from "wouter";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import CinematicMode, { CinematicButton } from "@/components/CinematicMode";
import RasidCharacterWidget from "@/components/RasidCharacterWidget";
import AddPageButton from "@/components/AddPageButton";
import CustomPagesList from "@/components/CustomPagesList";
import { useCustomPages } from "@/hooks/useCustomPages";

/* SDAIA Official FULL Logo URLs — local branding assets */
const FULL_LOGO_DARK = "/branding/logos/Rased_1_transparent.png";
const FULL_LOGO_LIGHT = "/branding/logos/Rased_1_transparent_1.png";
const RASID_LOGO = "/branding/logos/Rased_3_transparent.png";

const ROOT_ADMIN_USER_IDS_LIST = ["mruhaily", "aalrebdi", "msarhan", "malmoutaz"];
const ROOT_ADMIN_USER_ID = "mruhaily"; // backward compat export

/* ═══ Types ═══ */
type WorkspaceId = "leaks" | "privacy";

interface NavItem {
  label: string;
  labelEn: string;
  icon: React.ElementType;
  path: string;
  requiresAuth?: boolean;
  minRole?: string;
  rootAdminOnly?: boolean;
  badge?: number;
}

interface NavGroup {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  items: NavItem[];
}

/* ═══ Workspace Colors ═══ */
const wsColors: Record<WorkspaceId, {
  title: string; titleEn: string;
  accent: string; accentLight: string;
  accentBg: string; accentBgLight: string;
  accentBorder: string; accentBorderLight: string;
}> = {
  leaks: {
    title: "لوحة مؤشرات الرصد", titleEn: "Monitoring Dashboard",
    accent: "#3DB1AC", accentLight: "#1e3a8a",
    accentBg: "rgba(61,177,172,0.1)", accentBgLight: "rgba(30,58,138,0.06)",
    accentBorder: "rgba(61,177,172,0.25)", accentBorderLight: "rgba(30,58,138,0.12)",
  },
  privacy: {
    title: "رصد سياسة الخصوصية", titleEn: "Privacy Monitoring",
    accent: "#22c55e", accentLight: "#16a34a",
    accentBg: "rgba(34,197,94,0.1)", accentBgLight: "rgba(22,163,74,0.06)",
    accentBorder: "rgba(34,197,94,0.25)", accentBorderLight: "rgba(22,163,74,0.12)",
  },
};

/* ═══ LEAKS SIDEBAR GROUPS — Full Navigation ═══ */
const leaksNavGroups: NavGroup[] = [
  {
    id: "lk_main",
    label: "الرئيسية",
    labelEn: "Main",
    icon: Home,
    items: [
      { label: "راصد الذكي", labelEn: "Smart Rasid", icon: Bot, path: "/smart-rasid" },
      { label: "لوحة القيادة الرئيسية", labelEn: "Dashboard", icon: Gauge, path: "/national-overview" },
      { label: "حالات الرصد", labelEn: "Leaks", icon: ShieldAlert, path: "/leaks" },
      { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/reports" },
      { label: "التوصيات", labelEn: "Recommendations", icon: Brain, path: "/recommendations-hub" },
    ],
  },
  {
    id: "lk_dashboards",
    label: "لوحات المؤشرات",
    labelEn: "Dashboards",
    icon: LayoutDashboard,
    items: [
      { label: "خريطة التهديدات", labelEn: "Threat Map", icon: Map, path: "/threat-map" },
      { label: "تحليل القطاعات", labelEn: "Sector Analysis", icon: Layers, path: "/sector-analysis" },
      { label: "تحليل الأثر", labelEn: "Impact Assessment", icon: Crosshair, path: "/impact-assessment" },
      { label: "التحليل الجغرافي", labelEn: "Geo Analysis", icon: Globe, path: "/geo-analysis" },
      { label: "استخبارات المصادر", labelEn: "Source Intelligence", icon: Radar, path: "/source-intelligence" },
      { label: "تحليل جهات النشر", labelEn: "Threat Actors", icon: Users, path: "/threat-actors-analysis" },
      { label: "أطلس البيانات الشخصية", labelEn: "PII Atlas", icon: Network, path: "/pii-atlas" },
      { label: "رسم المعرفة", labelEn: "Knowledge Graph", icon: Brain, path: "/knowledge-graph" },
      { label: "الخط الزمني للحالات", labelEn: "Leak Timeline", icon: Activity, path: "/leak-timeline" },
      { label: "امتثال PDPL", labelEn: "PDPL Compliance", icon: Shield, path: "/pdpl-compliance" },
      { label: "مقاييس الدقة", labelEn: "Accuracy Metrics", icon: BarChart3, path: "/feedback-accuracy" },
      { label: "الملخص التنفيذي", labelEn: "Executive Brief", icon: FileText, path: "/executive-brief" },
      { label: "مقارنة الحالات", labelEn: "Incident Compare", icon: BarChart3, path: "/incident-compare" },
      { label: "متتبع الحملات", labelEn: "Campaign Tracker", icon: Sparkles, path: "/campaign-tracker" },
    ],
  },
  {
    id: "lk_operations",
    label: "المؤشرات التشغيلية",
    labelEn: "Operations",
    icon: Activity,
    items: [
      { label: "الرصد المباشر", labelEn: "Live Scan", icon: Radio, path: "/live-scan" },
      { label: "رصد تليجرام", labelEn: "Telegram", icon: Send, path: "/telegram" },
      { label: "رصد الدارك ويب", labelEn: "Dark Web", icon: Globe, path: "/darkweb" },
      { label: "مواقع اللصق", labelEn: "Paste Sites", icon: FileText, path: "/paste-sites" },
      { label: "مهام الرصد", labelEn: "Monitoring Jobs", icon: CalendarClock, path: "/monitoring-jobs" },
      { label: "مختبر أنماط البيانات", labelEn: "PII Classifier", icon: ScanSearch, path: "/pii-classifier" },
      { label: "سلسلة الأدلة", labelEn: "Evidence Chain", icon: Link2, path: "/evidence-chain" },
      { label: "قواعد الرصد", labelEn: "Threat Rules", icon: Crosshair, path: "/threat-rules" },
      { label: "أدوات OSINT", labelEn: "OSINT Tools", icon: Radar, path: "/osint-tools" },
      { label: "ملفات المصادر", labelEn: "Seller Profiles", icon: UserX, path: "/seller-profiles" },
      { label: "قنوات التنبيه", labelEn: "Alert Channels", icon: Bell, path: "/alert-channels" },
      { label: "سجل الحالات", labelEn: "Incidents Registry", icon: Archive, path: "/incidents-registry" },
      { label: "استيراد البيانات", labelEn: "Import Data", icon: Import, path: "/breach-import" },
      { label: "تصدير البيانات", labelEn: "Export Data", icon: Download, path: "/export-data" },
    ],
  },
];

/* ═══ PRIVACY SIDEBAR GROUPS — Full Navigation ═══ */
const privacyNavGroups: NavGroup[] = [
  {
    id: "prv_main",
    label: "الرئيسية",
    labelEn: "Main",
    icon: Home,
    items: [
      { label: "راصد الذكي", labelEn: "Smart Rasid", icon: Bot, path: "/smart-rasid" },
      { label: "لوحة القيادة", labelEn: "Dashboard", icon: Gauge, path: "/leadership" },
      { label: "التقارير", labelEn: "Reports", icon: BarChart3, path: "/custom-reports" },
      { label: "التغييرات", labelEn: "Changes", icon: Eye, path: "/change-detection" },
    ],
  },
  {
    id: "prv_dashboards",
    label: "لوحات المؤشرات",
    labelEn: "Dashboards",
    icon: LayoutDashboard,
    items: [
      { label: "خريطة الامتثال", labelEn: "Compliance Heatmap", icon: Map, path: "/compliance-heatmap" },
      { label: "لوحة مؤشرات الأداء", labelEn: "KPI Dashboard", icon: Gauge, path: "/kpi-dashboard" },
      { label: "اللوحة الحية", labelEn: "Real-time", icon: Radio, path: "/real-time" },
      { label: "التحليلات المتقدمة", labelEn: "Advanced Analytics", icon: BarChart3, path: "/advanced-analytics" },
      { label: "مقارنة الامتثال", labelEn: "Compliance Comparison", icon: BarChart3, path: "/compliance-comparison" },
      { label: "المقارنة الزمنية", labelEn: "Time Comparison", icon: CalendarClock, path: "/time-comparison" },
      { label: "مقارنة القطاعات", labelEn: "Sector Comparison", icon: Layers, path: "/sector-comparison" },
      { label: "تغطية الاستراتيجية", labelEn: "Strategy Coverage", icon: Shield, path: "/strategy-coverage" },
      { label: "التقرير التنفيذي", labelEn: "Executive Report", icon: FileText, path: "/executive-report" },
      { label: "التقارير المخصصة", labelEn: "Custom Reports", icon: FileText, path: "/custom-reports" },
      { label: "تقارير PDF", labelEn: "PDF Reports", icon: FileText, path: "/pdf-reports" },
      { label: "التقارير المجدولة", labelEn: "Scheduled Reports", icon: CalendarClock, path: "/scheduled-reports" },
      { label: "التنبيهات الذكية", labelEn: "Smart Alerts", icon: Bell, path: "/smart-alerts" },
      { label: "منشئ العروض", labelEn: "Presentation Builder", icon: Eye, path: "/presentation-builder" },
    ],
  },
  {
    id: "prv_operations",
    label: "المؤشرات التشغيلية",
    labelEn: "Operations",
    icon: Activity,
    items: [
      { label: "إدارة المواقع", labelEn: "Sites", icon: Globe, path: "/sites" },
      { label: "الفحص المباشر", labelEn: "Live Scan", icon: Radio, path: "/advanced-scan" },
      { label: "الفحص الجماعي", labelEn: "Batch Scan", icon: Import, path: "/batch-scan" },
      { label: "الفحص العميق", labelEn: "Deep Scan", icon: Radar, path: "/deep-scan" },
      { label: "مكتبة الفحوصات", labelEn: "Scan Library", icon: FolderOpen, path: "/scan-library" },
      { label: "جدولة الفحوصات", labelEn: "Scan Schedules", icon: CalendarClock, path: "/scan-schedules" },
      { label: "سجل الفحوصات", labelEn: "Scan History", icon: History, path: "/scan-history" },
      { label: "البنود الثمانية", labelEn: "8 Clauses", icon: FileText, path: "/clauses" },
      { label: "الخطابات", labelEn: "Letters", icon: Send, path: "/letters" },
      { label: "متتبع التحسين", labelEn: "Improvement Tracker", icon: CheckCircle2, path: "/improvement-tracker" },
      { label: "البحث المتقدم", labelEn: "Advanced Search", icon: Search, path: "/advanced-search" },
      { label: "استيراد المواقع", labelEn: "Import Sites", icon: Import, path: "/privacy-import" },
      { label: "تصدير البيانات", labelEn: "Export Data", icon: Download, path: "/export-data" },
    ],
  },
];

/* ═══ CONTROL PANEL items — moved to user menu dropdown ═══ */
const controlPanelItems: NavItem[] = [
  { label: "الإعدادات", labelEn: "Settings", icon: Settings, path: "/settings" },
  { label: "إدارة المستخدمين", labelEn: "Users", icon: Users, path: "/user-management", requiresAuth: true, minRole: "admin" },
  { label: "سجل المراجعة", labelEn: "Audit Log", icon: ScrollText, path: "/audit-log", requiresAuth: true, minRole: "admin" },
  { label: "لوحة التحكم الرئيسية", labelEn: "Control Panel", icon: PanelLeft, path: "/admin/control", requiresAuth: true, rootAdminOnly: true },
  { label: "إدارة المحتوى", labelEn: "Content Management", icon: Database, path: "/admin/cms", requiresAuth: true, rootAdminOnly: true },
  { label: "مركز العمليات", labelEn: "Operations Center", icon: Gauge, path: "/admin/operations", requiresAuth: true, rootAdminOnly: true },
  { label: "المشرف العام", labelEn: "Super Admin", icon: Crown, path: "/super-admin", requiresAuth: true, rootAdminOnly: true },
  { label: "إعدادات الإدارة", labelEn: "Admin Settings", icon: Wrench, path: "/admin/settings", requiresAuth: true, rootAdminOnly: true },
];

/* Build all items for route lookup */
const allNavItems = [
  { label: "الرئيسية", labelEn: "Home", icon: Home, path: "/" },
  ...leaksNavGroups.flatMap((g) => g.items),
  ...privacyNavGroups.flatMap((g) => g.items),
  ...controlPanelItems,
];

const roleLabels: Record<string, string> = {
  executive: "تنفيذي", manager: "مدير", analyst: "محلل", viewer: "مشاهد",
};

/* Route → Workspace mapping */
const leaksPaths = new Set(leaksNavGroups.flatMap((g) => g.items.map((i) => i.path)));
const privacyPaths = new Set(privacyNavGroups.flatMap((g) => g.items.map((i) => i.path)));

function getWorkspaceForRoute(_path: string): WorkspaceId {
  // Workspace is determined only by user's explicit choice (login or switch button)
  return (localStorage.getItem("rasid_workspace") as WorkspaceId) || "leaks";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const prevLocationRef = useRef(location);

  const autoScrollPages = ["/smart-rasid", "/live-scan"];
  const enableAutoScroll = autoScrollPages.includes(location);
  const { containerRef: mainContentRef } = useAutoScroll<HTMLElement>({ enabled: enableAutoScroll, threshold: 200 });

  // ═══ SCROLL TO TOP on every page navigation ═══
  useEffect(() => {
    if (prevLocationRef.current !== location) {
      prevLocationRef.current = location;
    }
    // Always scroll to top on any location change
    const scrollReset = () => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
        mainContentRef.current.scrollLeft = 0;
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };
    scrollReset();
    requestAnimationFrame(scrollReset);
    const t1 = setTimeout(scrollReset, 50);
    const t2 = setTimeout(scrollReset, 150);
    const t3 = setTimeout(scrollReset, 300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [location, mainContentRef]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cinematicOpen, setCinematicOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isAuthenticated, loading, logout, isAdmin, isRootAdmin, ndmoRole } = useNdmoAuth();
  const { theme, themeMode, toggleTheme, switchable } = useTheme();

  const platformUserId = (user as any)?.userId ?? "";

  /* ═══ WORKSPACE STATE ═══ */
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>(() => getWorkspaceForRoute(location));

  // Workspace is now only changed via login page selection or the switch button
  // No auto-switching based on URL to ensure complete workspace isolation

  const ws = wsColors[activeWorkspace];
  const wsNavGroups = activeWorkspace === "privacy" ? privacyNavGroups : leaksNavGroups;

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [customSearchQuery, setCustomSearchQuery] = useState("");

  const allCurrentGroups = wsNavGroups;
  const activeGroupId = allCurrentGroups.find((g) => g.items.some((item) => item.path === location))?.id;

  // Groups stay collapsed by default — user must click to expand
  // No auto-expand on route match

  const currentPage = allNavItems.find((item) => item.path === location);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    playClick();
  };

  const handleNavClick = useCallback(() => {
    setMobileOpen(false);
  }, []);
  // Auto-close mobile sidebar and user menu on any route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const isItemVisible = (item: NavItem) => {
    if (item.rootAdminOnly && !isRootAdmin) return false;
    if (!item.requiresAuth) return true;
    if (!isAuthenticated) return false;
    if (item.minRole === "admin" && !isAdmin) return false;
    return true;
  };

  const isDark = theme === "dark";
  const logoSrc = isDark ? FULL_LOGO_LIGHT : FULL_LOGO_DARK;
  const { playClick, playHover } = useSoundEffects();
  const accent = isDark ? ws.accent : ws.accentLight;

  /* ═══ CUSTOM PAGES ═══ */
  const {
    pages: customPages,
    createPage: createCustomPage,
    updatePage: updateCustomPage,
    deletePage: deleteCustomPage,
    isDeleting: isDeletingPage,
  } = useCustomPages(activeWorkspace);

  const customPageTypesCount = new Set(customPages.map((page) => page.pageType)).size;

  useEffect(() => {
    setCustomSearchQuery("");
  }, [activeWorkspace]);

  const handleCreatePage = async (pageType: "dashboard" | "table" | "report", title: string): Promise<boolean> => {
    try {
      const result = await createCustomPage(pageType, title);
      if (!result) {
        toast.error("تعذر إنشاء الصفحة، حاول مرة أخرى");
        return false;
      }

      toast.success(`تم إنشاء "${title}" بنجاح`);
      playClick();
      setLocation(`/custom/${pageType}/${(result as any).id}`);
      return true;
    } catch (e) {
      toast.error("فشل إنشاء الصفحة");
      return false;
    }
  };

  const handleDeletePage = async (id: number) => {
    const target = customPages.find((p) => p.id === id);
    const confirmed = window.confirm(`هل أنت متأكد من حذف الصفحة "${target?.title || ""}"؟`);
    if (!confirmed) return;

    try {
      const result = await deleteCustomPage(id);
      if (!(result as any)?.success) {
        toast.error("تعذر حذف الصفحة");
        return;
      }

      if (location.startsWith(`/custom/`) && location.endsWith(`/${id}`)) {
        setLocation(activeWorkspace === "privacy" ? "/leadership" : "/national-overview");
      }
      toast.success("تم حذف الصفحة");
    } catch (e) {
      toast.error("فشل حذف الصفحة");
    }
  };

  const handleRenamePage = async (id: number, newTitle: string) => {
    try {
      await updateCustomPage(id, { title: newTitle });
      toast.success("تم تحديث الاسم");
    } catch (e) {
      toast.error("فشل تحديث الاسم");
    }
  };

  if (!loading && !isAuthenticated) {
    return <Redirect to="/login" />;
  }

  const switchWorkspace = (wsId: WorkspaceId) => {
    setActiveWorkspace(wsId);
    localStorage.setItem("rasid_workspace", wsId);
    setExpandedGroups({});
    playClick();
    // Navigate to the default page of the target workspace
    if (wsId === "privacy") {
      setLocation("/leadership");
    } else {
      setLocation("/national-overview");
    }
  };

  // ═══ WORKSPACE GUARD: redirect if user is on a page that belongs to the other workspace ═══
  useEffect(() => {
    const currentWs = activeWorkspace;
    const isLeaksPage = leaksPaths.has(location);
    const isPrivacyPage = privacyPaths.has(location);
    // If user is on a leaks-only page but workspace is privacy, redirect
    if (currentWs === "privacy" && isLeaksPage && !isPrivacyPage) {
      setLocation("/leadership");
    }
    // If user is on a privacy-only page but workspace is leaks, redirect
    if (currentWs === "leaks" && isPrivacyPage && !isLeaksPage) {
      setLocation("/national-overview");
    }
  }, [activeWorkspace, location, setLocation]);

  /* ═══ Render nav item ═══ */
  const renderNavItem = (item: NavItem) => {
    if (!isItemVisible(item)) return null;
    const isActive = location === item.path;
    const Icon = item.icon;
    return (
      <Link key={item.path} href={item.path} onClick={() => { handleNavClick(); playClick(); }}>
        <motion.div
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          className={`
            sidebar-nav-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer
            group relative transition-colors duration-150
            ${isActive
              ? `sidebar-nav-item-active ${isDark ? 'border border-[rgba(61,177,172,0.25)]' : 'border border-[rgba(30,58,138,0.12)]'}`
              : isDark ? 'text-sidebar-foreground/60 hover:text-sidebar-foreground/80 hover:bg-white/[0.03]' : 'text-[#5a6478] hover:text-[#1c2833] hover:bg-black/[0.02]'
            }
          `}
          style={isActive ? { backgroundColor: isDark ? ws.accentBg : ws.accentBgLight, borderColor: isDark ? ws.accentBorder : ws.accentBorderLight } : undefined}
        >
          {isActive && (
            <motion.div
              layoutId="activeNav"
              className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
              style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}66` }}
            />
          )}
          <div className="sidebar-nav-icon">
            <Icon className="w-4 h-4 flex-shrink-0" style={isActive ? { color: accent } : undefined} />
          </div>
          {!collapsed && (
            <span className="text-[13px] font-medium whitespace-nowrap">{item.label}</span>
          )}
          {!collapsed && item.rootAdminOnly && (
            <span className="text-[8px] px-1 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20 mr-auto">ROOT</span>
          )}
          {collapsed && (
            <div className={`absolute right-14 ${isDark ? 'bg-[rgba(26,37,80,0.95)] text-[#E1DEF5] border-[rgba(61,177,172,0.15)]' : 'bg-white text-[#1c2833] border-[#e2e5ef]'} backdrop-blur-xl text-xs py-1.5 px-3 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border`}>
              {item.label}
            </div>
          )}
        </motion.div>
      </Link>
    );
  };

  /* ═══ Render nav group ═══ */
  const renderNavGroup = (group: NavGroup) => {
    const visibleItems = group.items.filter(isItemVisible);
    if (visibleItems.length === 0) return null;
    const isExpanded = expandedGroups[group.id] || false;
    const isActive = group.items.some((item) => item.path === location);
    const GroupIcon = group.icon;

    return (
      <div key={group.id} className="mb-1">
        {!collapsed ? (
          <button
            onClick={() => toggleGroup(group.id)}
            className={`
              sidebar-group-header w-full flex items-center justify-between flex-wrap px-3 py-2 rounded-lg
              text-xs font-semibold uppercase tracking-wider transition-colors duration-150
              ${isActive
                ? isDark ? "text-[#3DB1AC] bg-[rgba(61,177,172,0.08)]" : "text-[#1e3a8a] bg-[rgba(30,58,138,0.06)]"
                : isDark ? "text-[#D4DDEF]/60 hover:text-[#D4DDEF]/80" : "text-[#5a6478] hover:text-[#1c2833]"
              }
            `}
            style={isActive ? { color: accent, backgroundColor: isDark ? ws.accentBg : ws.accentBgLight } : undefined}
          >
            <div className="flex items-center gap-2">
              <GroupIcon className="w-3.5 h-3.5" />
              <span>{group.label}</span>
              <span className="text-[9px] opacity-50 font-normal normal-case">{group.labelEn}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}`} />
          </button>
        ) : (
          <div className={`h-px ${isDark ? 'bg-[rgba(61,177,172,0.08)]' : 'bg-[#edf0f7]'} mx-2 my-2`} />
        )}

        <AnimatePresence initial={false}>
          {(isExpanded || collapsed) && (
            <motion.div
              initial={collapsed ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={collapsed ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className={`space-y-0.5 ${collapsed ? "" : "mt-1 mr-2"}`}>
                {visibleItems.map(renderNavItem)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden overflow-x-hidden bg-background" style={{ maxWidth: '100vw' }}>
      {/* ═══ AURORA BACKGROUND ═══ */}
      <div className="fixed inset-0 pointer-events-none z-0 dark:block hidden">
        <div className="absolute top-0 right-0 w-[60%] h-[50%] opacity-25" style={{ background: `radial-gradient(ellipse at 70% 20%, ${ws.accent}4D, transparent 70%)` }} />
        <div className="absolute bottom-0 left-0 w-[50%] h-[40%] opacity-20" style={{ background: "radial-gradient(ellipse at 30% 80%, rgba(39, 52, 112, 0.25), transparent 60%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[60%] opacity-10" style={{ background: "radial-gradient(ellipse at center, rgba(100, 89, 167, 0.2), transparent 50%)" }} />
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* ═══ SIDEBAR ═══ */}
      <aside
        className={`
          fixed lg:relative z-50 h-full transition-all duration-300 ease-in-out flex flex-col
          ${collapsed ? "w-[72px]" : "w-[270px]"}
          ${mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
          right-0 lg:right-auto bg-sidebar backdrop-blur-2xl
          ${isDark ? 'border-l border-[rgba(61,177,172,0.08)]' : 'border-l border-[#e2e5ef]'}
        `}
      >
        {/* Logo area */}
        <div className={`flex items-center justify-center px-2 py-8 ${isDark ? 'border-b border-[rgba(61,177,172,0.1)]' : 'border-b border-[#edf0f7]'}`} style={{ minHeight: collapsed ? '72px' : '200px' }}>
          <motion.div
            className="relative flex items-center justify-center flex-shrink-0"
            whileHover={{ scale: 1.04 }}
            transition={{ type: "spring", stiffness: 200 }}
            style={{ width: collapsed ? '52px' : '100%', height: collapsed ? '52px' : '180px' }}
          >
            <div className="absolute rounded-full pointer-events-none" style={{
              width: collapsed ? '60px' : 'calc(100% + 16px)', height: collapsed ? '60px' : '190px',
              border: isDark ? '1px solid rgba(61, 177, 172, 0.12)' : '1px solid rgba(30, 58, 138, 0.06)',
              animation: 'breathing-glow 4s ease-in-out infinite',
              boxShadow: isDark ? '0 0 30px rgba(61, 177, 172, 0.1), inset 0 0 30px rgba(100, 89, 167, 0.06)' : '0 0 20px rgba(30, 58, 138, 0.04)',
            }} />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3DB1AC]' : 'bg-[#3b82f6]'}`} style={{ top: '8%', right: '12%', opacity: isDark ? 0.5 : 0.25, animation: 'orbit 6s linear infinite' }} />
              <div className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-[#6459A7]' : 'bg-[#1e3a8a]'}`} style={{ bottom: '15%', left: '8%', opacity: isDark ? 0.4 : 0.2, animation: 'orbit 8s linear infinite reverse' }} />
              <div className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#3DB1AC]' : 'bg-[#3b82f6]'}`} style={{ top: '50%', left: '3%', opacity: isDark ? 0.3 : 0.15, animation: 'orbit 10s linear infinite' }} />
            </div>
            <img
              src={collapsed ? RASID_LOGO : logoSrc}
              alt="منصة راصد - مكتب إدارة البيانات الوطنية"
              className="relative z-10 object-contain"
              style={{
                width: collapsed ? '44px' : '100%', height: collapsed ? '44px' : '170px', maxWidth: '260px',
                filter: isDark ? 'drop-shadow(0 0 15px rgba(61, 177, 172, 0.25)) drop-shadow(0 0 40px rgba(100, 89, 167, 0.12))' : 'drop-shadow(0 0 8px rgba(30, 58, 138, 0.08))',
                animation: 'logo-float 5s ease-in-out infinite',
              }}
            />
          </motion.div>
        </div>

        {/* Data flow line */}
        <div className="data-flow-line mx-4 opacity-50" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {/* Workspace-specific groups */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeWorkspace}
              initial={{ opacity: 0, x: activeWorkspace === "privacy" ? -8 : 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeWorkspace === "privacy" ? 8 : -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Group 1: الرئيسية */}
              {renderNavGroup(wsNavGroups[0])}

              {/* Group 2: مخصص — user-created pages */}
              {isAuthenticated && (
                <div className="mb-1">
                  {!collapsed ? (
                    <button
                      onClick={() => toggleGroup("custom_pages")}
                      className={`
                        sidebar-group-header w-full flex items-center justify-between flex-wrap px-3 py-2 rounded-lg
                        text-xs font-semibold uppercase tracking-wider transition-colors duration-150
                        ${customPages.length > 0 && customPages.some((p: any) => location === `/custom/${p.pageType}/${p.id}`)
                          ? isDark ? "text-[#3DB1AC] bg-[rgba(61,177,172,0.08)]" : "text-[#1e3a8a] bg-[rgba(30,58,138,0.06)]"
                          : isDark ? "text-[#D4DDEF]/60 hover:text-[#D4DDEF]/80" : "text-[#5a6478] hover:text-[#1c2833]"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>مخصص</span>
                        <span className="text-[9px] opacity-50 font-normal normal-case">Custom</span>
                        {!collapsed && customPages.length > 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                              isDark
                                ? "bg-[#3DB1AC]/10 border-[#3DB1AC]/30 text-[#91e5e1]"
                                : "bg-[#1e3a8a]/5 border-[#1e3a8a]/20 text-[#1e3a8a]"
                            }`}
                          >
                            {customPages.length}
                          </span>
                        )}
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedGroups["custom_pages"] ? "" : "-rotate-90"}`} />
                    </button>
                  ) : (
                    <div className={`h-px ${isDark ? 'bg-[rgba(61,177,172,0.08)]' : 'bg-[#edf0f7]'} mx-2 my-2`} />
                  )}
                  <AnimatePresence initial={false}>
                    {(expandedGroups["custom_pages"] || collapsed) && (
                      <motion.div
                        initial={collapsed ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={collapsed ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className={`space-y-0.5 ${collapsed ? "" : "mt-1 mr-2"}`}>
                          {!collapsed && customPages.length > 0 && (
                            <div className="px-1 pb-1">
                              <div className="relative">
                                <Search className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 ${isDark ? "text-slate-400" : "text-[#7a859c]"}`} />
                                <input
                                  value={customSearchQuery}
                                  onChange={(e) => setCustomSearchQuery(e.target.value)}
                                  placeholder="ابحث داخل الصفحات المخصصة"
                                  className={`w-full rounded-md text-[11px] py-1.5 pr-7 pl-2 border transition-colors focus:outline-none focus:ring-1 ${
                                    isDark
                                      ? "bg-white/[0.03] border-white/10 text-slate-100 placeholder:text-slate-400/70"
                                      : "bg-[#f8faff] border-[#e6ebf5] text-[#1c2833] placeholder:text-[#7a859c]"
                                  }`}
                                  style={{ "--tw-ring-color": accent } as React.CSSProperties}
                                />
                              </div>
                              <p className={`mt-1 text-[10px] ${isDark ? "text-slate-400/80" : "text-[#7a859c]"}`}>
                                {customPages.length} صفحة • {customPageTypesCount} أنواع
                              </p>
                            </div>
                          )}
                          <CustomPagesList
                            pages={customPages}
                            collapsed={collapsed}
                            accent={accent}
                            accentBg={isDark ? ws.accentBg : ws.accentBgLight}
                            accentBorder={isDark ? ws.accentBorder : ws.accentBorderLight}
                            searchQuery={customSearchQuery}
                            onDeletePage={handleDeletePage}
                            onRenamePage={handleRenamePage}
                            onNavClick={handleNavClick}
                            isDeleting={isDeletingPage}
                          />
                          <div className="mt-1 px-1">
                            <AddPageButton
                              collapsed={collapsed}
                              onCreatePage={handleCreatePage}
                              accent={accent}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Group 3: لوحات المؤشرات */}
              {renderNavGroup(wsNavGroups[1])}

              {/* Group 4: المؤشرات التشغيلية */}
              {renderNavGroup(wsNavGroups[2])}
            </motion.div>
          </AnimatePresence>
        </nav>

        {/* User profile with dropdown menu */}
        <div className={`p-3 ${isDark ? 'border-t border-[rgba(61,177,172,0.1)]' : 'border-t border-[#edf0f7]'} relative`}>
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className={`w-4 h-4 animate-spin ${isDark ? 'text-[#3DB1AC]/50' : 'text-[#1e3a8a]/50'}`} />
            </div>
          ) : isAuthenticated && user ? (
            <>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={`w-full flex items-center gap-3 ${collapsed ? "justify-center" : ""} rounded-lg px-2 py-2 transition-colors ${
                  isDark ? "hover:bg-white/[0.04]" : "hover:bg-black/[0.02]"
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border`}
                  style={{ backgroundColor: `${accent}1A`, borderColor: `${accent}33` }}>
                  <span className="text-xs font-bold" style={{ color: accent }}>{user.name?.charAt(0) || "U"}</span>
                </div>
                {!collapsed && (
                  <>
                    <div className="flex-1 min-w-0 text-right">
                      <p className={`text-xs font-medium ${isDark ? 'text-[#D4DDEF]' : 'text-[#1c2833]'} truncate`}>{user.name || "مستخدم"}</p>
                      <p className={`text-xs sm:text-[10px] ${isDark ? 'text-[#D4DDEF]/50' : 'text-[#5a6478]'} truncate`}>
                        {isRootAdmin ? "مدير النظام الرئيسي" : roleLabels[ndmoRole] || ndmoRole}
                      </p>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${userMenuOpen ? "rotate-180" : ""} ${isDark ? "text-[#D4DDEF]/40" : "text-[#5a6478]"}`} />
                  </>
                )}
              </button>

              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && !collapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full right-2 left-2 mb-2 rounded-xl overflow-hidden shadow-2xl z-[60]"
                    style={{
                      background: isDark
                        ? "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))"
                        : "rgba(255,255,255,0.98)",
                      border: isDark
                        ? "1px solid rgba(61, 177, 172, 0.15)"
                        : "1px solid rgba(0,0,0,0.08)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {/* Switch Platform */}
                    <button
                      onClick={() => {
                        switchWorkspace(activeWorkspace === "leaks" ? "privacy" : "leaks");
                        setUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                        isDark ? "text-slate-300 hover:bg-white/[0.06] hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <ArrowRightLeft className="w-4 h-4" style={{ color: accent }} />
                      <span className="font-medium">
                        {activeWorkspace === "leaks" ? "التبديل إلى رصد الخصوصية" : "التبديل إلى رصد التسريبات"}
                      </span>
                    </button>

                    <div className={`h-px mx-3 ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`} />

                    {/* Control Panel */}
                    <button
                      onClick={() => {
                        setLocation("/admin/control");
                        setUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                        isDark ? "text-slate-300 hover:bg-white/[0.06] hover:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Settings className="w-4 h-4" style={{ color: accent }} />
                      <span className="font-medium">لوحة التحكم</span>
                    </button>

                    <div className={`h-px mx-3 ${isDark ? "bg-white/[0.06]" : "bg-gray-100"}`} />

                    {/* Logout */}
                    <button
                      onClick={() => {
                        logout();
                        localStorage.removeItem("rasid_workspace");
                        localStorage.removeItem("rasid_session");
                        toast("تم تسجيل الخروج");
                        window.location.href = "/login";
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-xs transition-colors ${
                        isDark ? "text-red-400 hover:bg-red-500/10" : "text-red-500 hover:bg-red-50"
                      }`}
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">تسجيل الخروج</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <a href="/login">
              <Button variant="outline" size="sm"
                className={`gap-2 text-xs w-full ${isDark ? 'border-[rgba(61,177,172,0.2)] hover:bg-[rgba(61,177,172,0.1)] text-[#D4DDEF]' : 'border-[#d8dce8] hover:bg-[rgba(30,58,138,0.04)] text-[#1c2833]'} ${collapsed ? "px-0 justify-center" : ""}`}>
                <LogIn className="w-3.5 h-3.5" />
                {!collapsed && "تسجيل الدخول"}
              </Button>
            </a>
          )}
        </div>

        {/* Collapse toggle */}
        <div className={`p-2 ${isDark ? 'border-t border-[rgba(61,177,172,0.1)]' : 'border-t border-[#edf0f7]'} hidden lg:block`}>
          <Button variant="ghost" size="sm"
            className={`w-full justify-center ${isDark ? 'text-[#D4DDEF]/40 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
            onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile close */}
        <button className={`absolute top-4 left-4 lg:hidden ${isDark ? 'text-[#D4DDEF]/50 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}
          onClick={() => setMobileOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </aside>

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="flex-1 flex flex-col overflow-x-hidden overflow-y-auto relative z-10" style={{ maxWidth: '100%' }}>
        {/* Top header with WORKSPACE SWITCHER */}
        <header
          className="min-h-14 flex items-center justify-between flex-wrap gap-y-1 px-3 sm:px-4 lg:px-6 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300"
          style={{
            backgroundColor: isDark ? 'rgba(13,21,41,0.85)' : 'rgba(255,255,255,0.95)',
            borderBottom: `1px solid ${isDark ? `${accent}14` : '#e2e5ef'}`,
          }}
        >
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setMobileOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>

            {/* Workspace title in header */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${accent}1A` }}>
                {activeWorkspace === "privacy" ? <Shield className="w-4 h-4" style={{ color: accent }} /> : <ShieldAlert className="w-4 h-4" style={{ color: accent }} />}
              </div>
              <span className={`text-sm font-bold hidden sm:inline ${isDark ? 'text-[#D4DDEF]' : 'text-[#1c2833]'}`}>
                {activeWorkspace === "privacy" ? "رصد سياسة الخصوصية" : "حالات الرصد"}
              </span>
            </div>
          </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Live indicator */}
            <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border`}
              style={{ backgroundColor: `${accent}0D`, borderColor: `${accent}26` }}>
              <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}80` }} />
              <span className="text-xs font-medium" style={{ color: accent }}>مباشر</span>
            </div>

            {/* Date */}
            <div className={`hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs sm:text-[10px] ${isDark ? 'text-[#D4DDEF]/60' : 'text-[#5a6478]'}`}>
              <Clock className="w-3 h-3" />
              <span>{new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Theme Toggle */}
            {switchable && toggleTheme && (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground"
                onClick={() => { toggleTheme(); playClick(); }}>
                {themeMode === "light" && <Sun className="w-4 h-4" />}
                {themeMode === "dark" && <Moon className="w-4 h-4" />}
                {themeMode === "auto" && <Monitor className="w-4 h-4" />}
              </Button>
            )}

            {/* Search */}
            <Link href="/smart-rasid">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" title="البحث الذكي">
                <Search className="w-4 h-4" />
              </Button>
            </Link>

            {/* Notifications */}
            <NotificationBell userId={user?.id} />

            {/* Export */}
            <Button variant="ghost" size="sm"
              className={`hidden lg:flex gap-1 text-xs ${isDark ? 'text-[#D4DDEF]/60 hover:text-[#D4DDEF]' : 'text-[#5a6478] hover:text-[#1c2833]'}`}>
              <FileDown className="w-3.5 h-3.5" />
              <span>تصدير</span>
            </Button>

            {/* Cinematic Mode */}
            <CinematicButton onClick={() => setCinematicOpen(true)} />
          </div>
        </header>

        {/* Page content */}
        <main ref={mainContentRef} data-scroll-container className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-6 relative max-w-full" style={{ WebkitOverflowScrolling: 'touch' }}>
          <ParticleField count={30} className="z-0" />
          <motion.div
            key={location}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Cinematic Mode */}
      <CinematicMode isOpen={cinematicOpen} onClose={() => setCinematicOpen(false)} pageTitle={currentPage?.label}>
        {children}
      </CinematicMode>

      {/* Rasid Character */}
      <RasidCharacterWidget />
    </div>
  );
}

export { ROOT_ADMIN_USER_ID };

```

---

## `client/src/components/DashboardLayoutSkeleton.tsx`

```tsx
import { Skeleton } from './ui/skeleton';

/* ═══ Rasid Character CDN URL ═══ */
const RASID_CHARACTER_SMALL = "/branding/characters/Character_3_dark_bg_transparent.png";
const RASID_LOGO = "/branding/logos/Rased_3_transparent.png";

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Full-screen loading overlay with character */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
        style={{
          background: "linear-gradient(135deg, #0D1529 0%, #0a1230 30%, #101e45 60%, #1A2550 100%)",
        }}
      >
        {/* Aurora background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(61, 177, 172, 0.08), transparent 60%), " +
              "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(100, 89, 167, 0.06), transparent 50%)",
          }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(61, 177, 172, 0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Rasid Character with breathing animation */}
        <div className="relative">
          {/* Glow ring behind character */}
          <div
            className="absolute -inset-8 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(61, 177, 172, 0.1) 0%, transparent 70%)",
              animation: "skeleton-glow 3s ease-in-out infinite",
            }}
          />
          {/* Orbiting dots around character */}
          <div className="absolute inset-0 w-full h-full" style={{ animation: "orbit-spin 4s linear infinite" }}>
            <div className="absolute -top-2 left-1/2 w-2 h-2 rounded-full bg-[#3DB1AC]"
              style={{ boxShadow: "0 0 8px rgba(61, 177, 172, 0.5)" }} />
          </div>
          <div className="absolute inset-0 w-full h-full" style={{ animation: "orbit-spin 4s linear infinite reverse" }}>
            <div className="absolute -bottom-2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#6459A7]"
              style={{ boxShadow: "0 0 8px rgba(100, 89, 167, 0.5)" }} />
          </div>

          <img
            src={RASID_CHARACTER_SMALL}
            alt="راصد"
            className="w-28 h-28 object-contain character-breathe relative z-10"
            style={{ filter: "drop-shadow(0 4px 16px rgba(61, 177, 172, 0.2))" }}
          />
        </div>

        {/* Logo */}
        <img
          src={RASID_LOGO}
          alt="راصد"
          className="h-8 object-contain opacity-80"
          style={{ filter: "drop-shadow(0 2px 8px rgba(61, 177, 172, 0.15))" }}
        />

        {/* Loading text */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold" style={{ color: "#E1DEF5" }}>
            جاري تحميل المنصة...
          </p>
          <p className="text-xs" style={{ color: "rgba(225, 222, 245, 0.4)" }}>
            يتم تجهيز لوحة مؤشرات الرصد
          </p>
        </div>

        {/* Animated loading bar */}
        <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: "rgba(61, 177, 172, 0.1)" }}>
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #3DB1AC, #6459A7, #3DB1AC)",
              backgroundSize: "200% 100%",
              animation: "loading-bar 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Skeleton preview behind (subtle) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="flex min-h-screen">
            <div className="w-[280px] border-r border-white/5 p-4 space-y-6">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              <Skeleton className="h-12 w-48 rounded-lg" />
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes skeleton-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loading-bar {
          0% { width: 0%; background-position: 0% 0%; }
          50% { width: 70%; background-position: 100% 0%; }
          100% { width: 100%; background-position: 200% 0%; }
        }
      `}</style>
    </div>
  );
}

```

---

## `client/src/components/DataFlowLine.tsx`

```tsx

interface DataFlowLineProps {
  className?: string;
  color?: string;
}

export function DataFlowLine({
  className = '',
  color = 'var(--sdaia-accent)',
}: DataFlowLineProps) {
  return (
    <div className={`relative h-px w-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-border/30" />
      <div
        className="absolute inset-y-0 w-1/4"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />
    </div>
  );
}

```

---

## `client/src/components/DetailModal.tsx`

```tsx
/**
 * Shared DetailModal component — reusable across all pages
 * Professional modal with animation for showing detailed information
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export function DetailModal({
  open,
  onClose,
  title,
  icon,
  children,
  maxWidth = "max-w-3xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className={`w-full ${maxWidth} max-h-[85vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <h3 className="text-foreground font-semibold text-base">{title}</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="p-4">{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ─── Stat Card that opens a modal ─── */
export function ClickableStatCard({
  icon,
  iconColor,
  bgColor,
  borderColor,
  value,
  label,
  onClick,
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  value: string | number;
  label: string;
  onClick: () => void;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border ${borderColor} ${bgColor} cursor-pointer hover:scale-[1.02] transition-all group`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] ${trendUp ? "text-red-400" : "text-emerald-400"}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
      <p className="text-[9px] text-primary/50 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">اضغط للتفاصيل ←</p>
    </div>
  );
}

/* ─── Paginated list for modals ─── */
export function PaginatedList({
  items,
  renderItem,
  emptyMessage = "لا توجد بيانات",
  perPage = 10,
}: {
  items: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  emptyMessage?: string;
  perPage?: number;
}) {
  const [page, setPage] = React.useState(0);
  const totalPages = Math.ceil(items.length / perPage);
  const pageItems = items.slice(page * perPage, (page + 1) * perPage);

  if (items.length === 0) return <p className="text-center text-muted-foreground text-sm py-8">{emptyMessage}</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{items.length} عنصر</p>
      {pageItems.map((item, i) => renderItem(item, page * perPage + i))}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="p-1.5 rounded hover:bg-accent disabled:opacity-30">
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs text-muted-foreground">{page + 1} / {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="p-1.5 rounded hover:bg-accent disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

import React from "react";

```

---

## `client/src/components/DraggableDashboard.tsx`

```tsx
/**
 * DraggableDashboard — Drag-and-drop dashboard grid layout.
 * Allows users to rearrange, resize, and customize dashboard widgets.
 * Pure implementation without react-grid-layout dependency.
 */
import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DashboardWidget {
  id: string;
  title: string;
  titleAr?: string;
  component: React.ReactNode;
  /** Grid columns span (1-12) */
  colSpan?: number;
  /** Grid rows span */
  rowSpan?: number;
  /** Minimum column span */
  minColSpan?: number;
  /** Whether the widget can be hidden */
  removable?: boolean;
}

interface WidgetPosition {
  id: string;
  order: number;
  colSpan: number;
  rowSpan: number;
  visible: boolean;
}

interface DraggableDashboardProps {
  widgets: DashboardWidget[];
  className?: string;
  columns?: number;
  gap?: number;
  editable?: boolean;
  storageKey?: string;
  onLayoutChange?: (positions: WidgetPosition[]) => void;
}

export function DraggableDashboard({
  widgets,
  className,
  columns = 12,
  gap = 16,
  editable = true,
  storageKey = "rasid-dashboard-layout",
  onLayoutChange,
}: DraggableDashboardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [positions, setPositions] = useState<WidgetPosition[]>(() => {
    // Load saved layout
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default positions
    return widgets.map((w, i) => ({
      id: w.id,
      order: i,
      colSpan: w.colSpan || 6,
      rowSpan: w.rowSpan || 1,
      visible: true,
    }));
  });

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Save layout changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(positions));
      onLayoutChange?.(positions);
    } catch {}
  }, [positions, storageKey, onLayoutChange]);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    if (!isEditing) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, [isEditing]);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== id) {
      setDragOverId(id);
    }
  }, [draggedId]);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    setPositions((prev) => {
      const newPositions = [...prev];
      const dragIdx = newPositions.findIndex((p) => p.id === draggedId);
      const targetIdx = newPositions.findIndex((p) => p.id === targetId);
      if (dragIdx === -1 || targetIdx === -1) return prev;

      // Swap orders
      const dragOrder = newPositions[dragIdx].order;
      newPositions[dragIdx].order = newPositions[targetIdx].order;
      newPositions[targetIdx].order = dragOrder;
      return newPositions.sort((a, b) => a.order - b.order);
    });

    setDraggedId(null);
    setDragOverId(null);
  }, [draggedId]);

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const toggleWidgetVisibility = useCallback((id: string) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, visible: !p.visible } : p))
    );
  }, []);

  const resizeWidget = useCallback((id: string, colSpan: number) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, colSpan: Math.min(columns, Math.max(3, colSpan)) } : p))
    );
  }, [columns]);

  const resetLayout = useCallback(() => {
    setPositions(
      widgets.map((w, i) => ({
        id: w.id,
        order: i,
        colSpan: w.colSpan || 6,
        rowSpan: w.rowSpan || 1,
        visible: true,
      }))
    );
  }, [widgets]);

  const sortedPositions = [...positions].sort((a, b) => a.order - b.order);
  const widgetMap = new Map(widgets.map((w) => [w.id, w]));

  return (
    <div className={cn("relative", className)} dir="rtl">
      {/* Edit controls */}
      {editable && (
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              isEditing
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10"
            )}
          >
            {isEditing ? "✓ حفظ التخطيط" : "⚙ تخصيص اللوحة"}
          </button>
          {isEditing && (
            <button
              onClick={resetLayout}
              className="px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20 transition-all"
            >
              ↺ إعادة تعيين
            </button>
          )}
        </div>
      )}

      {/* Hidden widgets toggle (when editing) */}
      {isEditing && (
        <div className="flex flex-wrap gap-2 mb-4">
          {sortedPositions
            .filter((p) => !p.visible)
            .map((p) => {
              const widget = widgetMap.get(p.id);
              if (!widget) return null;
              return (
                <button
                  key={p.id}
                  onClick={() => toggleWidgetVisibility(p.id)}
                  className="px-3 py-1 rounded-full text-xs bg-white/5 text-white/50 border border-dashed border-white/20 hover:bg-white/10"
                >
                  + {widget.titleAr || widget.title}
                </button>
              );
            })}
        </div>
      )}

      {/* Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }}
      >
        {sortedPositions
          .filter((p) => p.visible)
          .map((pos) => {
            const widget = widgetMap.get(pos.id);
            if (!widget) return null;
            const isDragging = draggedId === pos.id;
            const isDragOver = dragOverId === pos.id;

            return (
              <div
                key={pos.id}
                className={cn(
                  "relative rounded-xl transition-all duration-200",
                  isEditing && "cursor-grab active:cursor-grabbing",
                  isDragging && "opacity-50 scale-95",
                  isDragOver && "ring-2 ring-cyan-500/50",
                  !isEditing && "cursor-default"
                )}
                style={{
                  gridColumn: `span ${pos.colSpan} / span ${pos.colSpan}`,
                }}
                draggable={isEditing}
                onDragStart={(e) => handleDragStart(e, pos.id)}
                onDragOver={(e) => handleDragOver(e, pos.id)}
                onDrop={(e) => handleDrop(e, pos.id)}
                onDragEnd={handleDragEnd}
              >
                {/* Edit overlay */}
                {isEditing && (
                  <div className="absolute top-2 left-2 z-20 flex gap-1">
                    {widget.removable !== false && (
                      <button
                        onClick={() => toggleWidgetVisibility(pos.id)}
                        className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs flex items-center justify-center hover:bg-red-500/40"
                      >
                        ×
                      </button>
                    )}
                    <button
                      onClick={() => resizeWidget(pos.id, pos.colSpan === columns ? (widget.minColSpan || 4) : columns)}
                      className="w-6 h-6 rounded-full bg-white/10 text-white/60 text-xs flex items-center justify-center hover:bg-white/20"
                    >
                      ⤢
                    </button>
                  </div>
                )}
                {widget.component}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default DraggableDashboard;

```

---

## `client/src/components/DrillDownModal.tsx`

```tsx
import { useState, useCallback, useMemo, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  CheckCircle2, AlertTriangle, XCircle, WifiOff, Search,
  ExternalLink, Globe, Building2, Landmark, ChevronLeft,
  ChevronRight, Loader2, Eye, BarChart3, Shield,
  ArrowUpRight, ArrowRight, ChevronDown, X, FileSpreadsheet,
  ShieldCheck, ShieldAlert, ShieldX, Layers, Target,
  TrendingUp, Hash, Percent, Activity, MapPin,
} from "lucide-react";
import { ScreenshotThumbnail } from "@/components/ScreenshotPreview";
import { downloadBase64File } from "@/lib/excelExport";
import { toast } from "sonner";
import {
  COMPLIANCE_LABELS,
  ARTICLE_12_CLAUSES,
} from "../../../shared/compliance";

// ─── Types ──────────────────────────────────────────────────
export type DrillDownFilter = {
  complianceStatus?: string;
  sectorType?: string;
  classification?: string;
  clauseIndex?: number;
  clauseCompliant?: boolean;
  siteStatus?: string;
  hasContactPage?: boolean;
  hasEmail?: boolean;
  region?: string;
  siteId?: number;
  stage?: string;
  priority?: string;
  status?: string;
  category?: string;
  period?: string;
  alertType?: string;
  scanType?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  gradient?: string;
};

export type DrillDownLevel = {
  type: "sites" | "breakdown" | "clauses" | "sectors" | "custom";
  filter: DrillDownFilter;
  data?: any;
};

// ─── Status Config ──────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string; darkBg: string }> = {
  compliant: {
    label: "ممتثل",
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    darkBg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
  partially_compliant: {
    label: "ممتثل جزئياً",
    icon: AlertTriangle,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    darkBg: "bg-amber-100 dark:bg-amber-900/40",
  },
  non_compliant: {
    label: "غير ممتثل",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    darkBg: "bg-red-100 dark:bg-red-900/40",
  },
  not_working: {
    label: "لا يعمل",
    icon: WifiOff,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
    darkBg: "bg-gray-100 dark:bg-gray-900/40",
  },
  no_policy: {
    label: "بدون سياسة",
    icon: XCircle,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    darkBg: "bg-red-100 dark:bg-red-900/40",
  },
};

const SECTOR_LABELS: Record<string, string> = {
  public: "قطاع عام",
  private: "قطاع خاص",
};

// ─── Helper Functions ───────────────────────────────────────
function getComplianceStatus(site: any): string {
  if (site.complianceStatus) return site.complianceStatus;
  if (site.latestScan?.complianceStatus) return site.latestScan.complianceStatus;
  return "non_compliant";
}

function getCompliancePercentage(site: any): number {
  const scan = site.latestScan || site;
  let passed = 0;
  for (let i = 1; i <= 8; i++) {
    if (scan[`clause${i}Compliant`]) passed++;
  }
  return (passed / 8) * 100;
}

// ─── Breakdown Card ─────────────────────────────────────────
function BreakdownCard({
  title, value, total, icon: Icon, color, gradient, onClick, delay = 0,
}: {
  title: string; value: number; total: number; icon: any;
  color: string; gradient: string; onClick?: () => void; delay?: number;
}) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : "0";
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]" : ""
      } bg-card border-border`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {onClick && (
          <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value.toLocaleString("ar-SA")}</div>
      <div className="text-xs text-muted-foreground mt-1">{title}</div>
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          animate={{ width: `${pct}%` }}
          className={`h-full rounded-full bg-gradient-to-l ${gradient}`}
        />
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">{pct}% من الإجمالي</div>
    </div>
  );
}

// ─── Clause Detail Card ─────────────────────────────────────
function ClauseDetailCard({
  clauseNum, name, compliant, total, onClick, delay = 0,
}: {
  clauseNum: number; name: string; compliant: number; total: number;
  onClick?: () => void; delay?: number;
}) {
  const pct = total > 0 ? ((compliant / total) * 100).toFixed(1) : "0";
  const pctNum = Number(pct);
  const barColor = pctNum >= 70 ? "from-emerald-500 to-blue-800" : pctNum >= 40 ? "from-amber-400 to-orange-500" : "from-rose-500 to-red-600";
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-3 rounded-xl border transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-md hover:bg-accent/50 active:scale-[0.99]" : ""
      } bg-card border-border`}
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-primary">{clauseNum}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{name}</div>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              animate={{ width: `${pct}%` }}
              className={`h-full rounded-full bg-gradient-to-l ${barColor}`}
            />
          </div>
          <span className="text-xs font-bold text-muted-foreground shrink-0">{pct}%</span>
        </div>
      </div>
      <div className="text-start shrink-0">
        <div className="text-sm font-bold">{compliant.toLocaleString("ar-SA")}</div>
        <div className="text-[10px] text-muted-foreground">من {total.toLocaleString("ar-SA")}</div>
      </div>
      {onClick && <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />}
    </div>
  );
}

// ─── Site Row ───────────────────────────────────────────────
function SiteRow({ site, idx, onClick }: { site: any; idx: number; onClick: () => void }) {
  const status = getComplianceStatus(site);
  const statusConf = STATUS_CONFIG[status];
  const StatusIcon = statusConf?.icon || Globe;
  const pct = getCompliancePercentage(site);
  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${statusConf?.bg || "bg-card"} ${statusConf?.border || "border-border"}`}
    >
      <ScreenshotThumbnail url={site.screenshotUrl} domain={site.domain} size="sm" />
      <div className="relative shrink-0">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${statusConf?.darkBg || "bg-muted"}`}
        >
          <StatusIcon className={`w-5 h-5 ${statusConf?.color || "text-muted-foreground"}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate">{site.siteName || site.domain}</h4>
          {site.sectorType && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              {SECTOR_LABELS[site.sectorType] || site.sectorType}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate" dir="ltr">{site.domain}</span>
          {site.classification && (
            <span className="text-[10px] text-muted-foreground/70">• {site.classification}</span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-muted-foreground/60" />
            <span className={`text-xs font-medium ${statusConf?.color}`}>{statusConf?.label || status}</span>
          </div>
          {(status === "partially_compliant" || status === "compliant") && (
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">{Math.round(pct)}% امتثال</span>
            </div>
          )}
          {(site.scanDate || site.latestScan?.scanDate) && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-muted-foreground/60" />
              <span className="text-xs text-muted-foreground">
                {new Date(site.scanDate || site.latestScan?.scanDate).toLocaleDateString("ar-SA-u-nu-latn")}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
      </div>
      {status === "partially_compliant" && (
        <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-xl overflow-hidden">
          <div animate={{ width: `${pct}%` }} className="h-full bg-amber-400" />
        </div>
      )}
      {status === "compliant" && (
        <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-xl bg-emerald-400" />
      )}
    </div>
  );
}

// ─── Site Detail View (inside modal) ────────────────────────
function SiteDetailView({ siteId }: { siteId: number }) {
  const [, setLocation] = useLocation();
  const [expandedScan, setExpandedScan] = useState<number | null>(null);
  const siteHistory = trpc.leadership.siteHistory.useQuery({ siteId });
  const data = siteHistory.data;

  if (siteHistory.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) return <div className="text-center py-8 text-muted-foreground">لا توجد بيانات</div>;

  const site = data.site;
  const history = data.history || [];
  const latestScan = history[0];
  const status = latestScan?.complianceStatus || "non_compliant";
  const statusConf = STATUS_CONFIG[status];

  return (
    <div className="space-y-4">
      {/* Site Header */}
      <div className={`p-4 rounded-xl border ${statusConf?.bg} ${statusConf?.border}`}>
        <div className="flex items-center gap-4">
          <ScreenshotThumbnail url={site?.screenshotUrl} domain={site?.domain} size="md" />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg">{site?.siteName || site?.domain}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground" dir="ltr">{site?.domain}</span>
              <Badge variant="outline" className="text-[10px]">{SECTOR_LABELS[site?.sectorType] || site?.sectorType}</Badge>
              {site?.classification && <Badge variant="outline" className="text-[10px]">{site.classification}</Badge>}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`${statusConf?.bg} ${statusConf?.color} ${statusConf?.border} border`}>
                {statusConf?.label}
              </Badge>
              {latestScan?.overallScore != null && (
                <Badge variant="outline">{Math.round(latestScan.overallScore)}% درجة الامتثال</Badge>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setLocation(`/sites/${siteId}`)} className="gap-1 shrink-0">
            <ExternalLink className="w-3.5 h-3.5" />
            عرض الصفحة الكاملة
          </Button>
        </div>
      </div>

      {/* Clause Compliance */}
      {latestScan && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            بنود المادة ١٢
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ARTICLE_12_CLAUSES.map((clause, i) => {
              const isCompliant = (latestScan as any)[`clause${i + 1}Compliant`];
              return (
                <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all ${isCompliant ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800"}`}
                  onClick={() => toast.info(`البند ${i + 1}: ${clause.name} - ${isCompliant ? "ممتثل ✓" : "غير ممتثل ✗"}`)}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isCompliant ? "bg-emerald-100 dark:bg-emerald-900/40" : "bg-red-100 dark:bg-red-900/40"}`}>
                    {isCompliant ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{clause.name}</div>
                  </div>
                  <Badge variant="outline" className={`text-[10px] ${isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {isCompliant ? "ممتثل" : "غير ممتثل"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scan History */}
      {history.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            سجل الفحوصات ({history.length})
          </h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {history.map((scan: any, idx: number) => {
              const sc = STATUS_CONFIG[scan.complianceStatus];
              return (
                <div
                  key={scan.id || idx}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${sc?.bg} ${sc?.border} ${expandedScan === idx ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setExpandedScan(expandedScan === idx ? null : idx)}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${sc?.darkBg}`}>
                    {sc?.icon && <sc.icon className={`w-4 h-4 ${sc.color}`} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${sc?.color}`}>{sc?.label}</span>
                      <span className="text-xs text-muted-foreground">{Math.round(scan.overallScore || 0)}%</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {new Date(scan.scanDate).toLocaleDateString("ar-SA-u-nu-latn")} - {new Date(scan.scanDate).toLocaleTimeString("ar-SA-u-nu-latn")}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {scan.clausesPassed || 0}/8 بنود
                  </div>
                  {expandedScan === idx && (
                    <div className="w-full mt-2 pt-2 border-t grid grid-cols-2 gap-1">
                      {ARTICLE_12_CLAUSES.map((c, ci) => {
                        const comp = (scan as any)[`clause${ci + 1}Compliant`];
                        return (
                          <div key={ci} className={`text-[10px] flex items-center gap-1 p-1 rounded ${comp ? 'text-emerald-600' : 'text-red-600'}`}>
                            {comp ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span className="truncate">{c.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact Info */}
      {(site?.contactUrl || site?.emails || site?.privacyUrl) && (
        <div className="space-y-2">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            معلومات التواصل
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {site.privacyUrl && (
              <a href={site.privacyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-xs truncate">صفحة الخصوصية</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground me-auto" />
              </a>
            )}
            {site.contactUrl && (
              <a href={site.contactUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-xs truncate">صفحة التواصل</span>
                <ExternalLink className="w-3 h-3 text-muted-foreground me-auto" />
              </a>
            )}
            {site.emails && (
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-card">
                <Hash className="w-4 h-4 text-primary" />
                <span className="text-xs truncate">{site.emails}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main DrillDownModal Component ──────────────────────────
export default function DrillDownModal({
  open,
  onOpenChange,
  filter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: DrillDownFilter | null;
}) {
  const [stack, setStack] = useState<DrillDownLevel[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [, setLocation] = useLocation();
  const limit = 10;

  // Current level is either the top of stack or the initial filter
  const currentLevel = stack.length > 0 ? stack[stack.length - 1] : filter ? { type: "sites" as const, filter } : null;
  const currentFilter = currentLevel?.filter || filter;

  // Reset state when modal opens/closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    if (!newOpen) {
      setStack([]);
      setPage(1);
      setSearch("");
      setSelectedSiteId(null);
    }
    onOpenChange(newOpen);
  }, [onOpenChange]);

  // Push a new drill-down level
  const pushLevel = useCallback((level: DrillDownLevel) => {
    setStack((prev) => [...prev, level]);
    setPage(1);
    setSearch("");
    setSelectedSiteId(null);
  }, []);

  // Pop back one level
  const popLevel = useCallback(() => {
    if (selectedSiteId) {
      setSelectedSiteId(null);
      return;
    }
    setStack((prev) => prev.slice(0, -1));
    setPage(1);
    setSearch("");
  }, [selectedSiteId]);

  // Build the query params
  const queryParams = useMemo(() => {
    if (!currentFilter) return null;
    return {
      sectorType: currentFilter.sectorType,
      classification: currentFilter.classification,
      complianceStatus: currentFilter.complianceStatus,
      clauseNum: currentFilter.clauseIndex !== undefined ? currentFilter.clauseIndex + 1 : undefined,
      clauseCompliant: currentFilter.clauseCompliant,
      hasContactPage: currentFilter.hasContactPage,
      hasEmail: currentFilter.hasEmail,
      siteStatus: currentFilter.siteStatus,
      page,
      limit,
    };
  }, [currentFilter, page]);

  // Fetch sites data
  const sitesQuery = trpc.leadership.drillDown.useQuery(
    queryParams as any,
    { enabled: open && !!queryParams && !selectedSiteId }
  );

  // Excel export
  const exportExcel = trpc.dashboard.exportExcel.useMutation({
    onSuccess: (data: any) => {
      downloadBase64File(data.base64, data.filename);
      toast.success("تم تصدير الملف بنجاح");
    },
    onError: () => toast.error("فشل تصدير الملف"),
  });

  const sites = (sitesQuery.data as any)?.sites || [];
  const total = (sitesQuery.data as any)?.total || 0;
  const totalPages = Math.ceil(total / limit);
  const isLoading = sitesQuery.isLoading;

  // Filter sites by search
  const filteredSites = useMemo(() => {
    if (!search) return sites;
    const s = search.toLowerCase();
    return sites.filter((site: any) =>
      (site.domain || "").toLowerCase().includes(s) ||
      (site.siteName || "").toLowerCase().includes(s) ||
      (site.classification || "").toLowerCase().includes(s)
    );
  }, [sites, search]);

  // Breadcrumb
  const breadcrumbs = useMemo(() => {
    const crumbs = [{ label: filter?.title || "التفاصيل", level: -1 }];
    stack.forEach((level, i) => {
      crumbs.push({ label: level.filter.title, level: i });
    });
    if (selectedSiteId) {
      const site = sites.find((s: any) => s.id === selectedSiteId);
      crumbs.push({ label: site?.siteName || site?.domain || `موقع #${selectedSiteId}`, level: stack.length });
    }
    return crumbs;
  }, [filter, stack, selectedSiteId, sites]);

  if (!filter) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="p-6 pb-4 border-b bg-gradient-to-l from-primary/5 to-transparent">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentFilter?.icon && (
                  <div
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-sm border border-primary/10"
                  >
                    {currentFilter.icon}
                  </div>
                )}
                <div>
                  <DialogTitle className="text-lg font-bold">{currentFilter?.title}</DialogTitle>
                  {currentFilter?.subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">{currentFilter.subtitle}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!selectedSiteId && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={exportExcel.isPending || total === 0}
                    onClick={() => {
                    exportExcel.mutate({
                      type: "filtered",
                      complianceStatus: currentFilter?.complianceStatus,
                      sectorType: currentFilter?.sectorType,
                      classification: currentFilter?.classification,
                    } as any);
                    }}
                    className="gap-1.5"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    تصدير Excel
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Breadcrumb */}
          {(stack.length > 0 || selectedSiteId) && (
            <div
              className="flex items-center gap-1 mt-3 text-xs flex-wrap"
            >
              <Button variant="ghost" size="sm" onClick={() => { setStack([]); setSelectedSiteId(null); setPage(1); setSearch(""); }} className="h-6 px-2 text-xs text-primary">
                {filter.title}
              </Button>
              {stack.map((level, i) => (
                <span key={i} className="flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStack((prev) => prev.slice(0, i + 1));
                      setSelectedSiteId(null);
                      setPage(1);
                      setSearch("");
                    }}
                    className="h-6 px-2 text-xs text-primary"
                  >
                    {level.filter.title}
                  </Button>
                </span>
              ))}
              {selectedSiteId && (
                <span className="flex items-center gap-1">
                  <ChevronLeft className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground font-medium">
                    {sites.find((s: any) => s.id === selectedSiteId)?.siteName || `موقع #${selectedSiteId}`}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Back button + Search */}
          {!selectedSiteId && (
            <div className="flex items-center gap-2 mt-3">
              {stack.length > 0 && (
                <Button variant="outline" size="sm" onClick={popLevel} className="gap-1 shrink-0">
                  <ChevronRight className="w-4 h-4" />
                  رجوع
                </Button>
              )}
              <div className="relative flex-1">
                <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في المواقع..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pe-10"
                />
              </div>
              <Badge variant="outline" className="shrink-0">{total.toLocaleString("ar-SA")} موقع</Badge>
            </div>
          )}
          {selectedSiteId && (
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={popLevel} className="gap-1">
                <ChevronRight className="w-4 h-4" />
                رجوع للقائمة
              </Button>
            </div>
          )}

          {/* Active Filters */}
          {!selectedSiteId && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentFilter?.complianceStatus && STATUS_CONFIG[currentFilter.complianceStatus] && (
                <Badge className={`${STATUS_CONFIG[currentFilter.complianceStatus].bg} ${STATUS_CONFIG[currentFilter.complianceStatus].color} ${STATUS_CONFIG[currentFilter.complianceStatus].border} border text-[10px]`}>
                  {STATUS_CONFIG[currentFilter.complianceStatus].label}
                </Badge>
              )}
              {currentFilter?.sectorType && (
                <Badge variant="outline" className="gap-1 text-[10px]">
                  {currentFilter.sectorType === "public" ? <Landmark className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                  {SECTOR_LABELS[currentFilter.sectorType] || currentFilter.sectorType}
                </Badge>
              )}
              {currentFilter?.classification && (
                <Badge variant="outline" className="text-[10px]">{currentFilter.classification}</Badge>
              )}
              {currentFilter?.clauseIndex !== undefined && (
                <Badge variant="outline" className="text-[10px]">البند {currentFilter.clauseIndex + 1}</Badge>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          
            {selectedSiteId ? (
              <div
                key={`site-${selectedSiteId}`}
              >
                <SiteDetailView siteId={selectedSiteId} />
              </div>
            ) : isLoading ? (
              <div
                key="loading"
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">جاري تحميل البيانات...</p>
              </div>
            ) : filteredSites.length === 0 ? (
              <div
                key="empty"
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <Globe className="w-12 h-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">لا توجد مواقع مطابقة</p>
              </div>
            ) : (
              <div
                key={`sites-${page}-${search}-${JSON.stringify(currentFilter)}`}
                className="space-y-2"
              >
                {filteredSites.map((site: any, idx: number) => (
                  <SiteRow
                    key={site.id}
                    site={site}
                    idx={idx}
                    onClick={() => setSelectedSiteId(site.id)}
                  />
                ))}
              </div>
            )}
          
        </div>

        {/* Footer / Pagination */}
        {!selectedSiteId && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="gap-1">
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <span className="text-sm text-muted-foreground">صفحة {page} من {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="gap-1">
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Hook for easy integration ──────────────────────────────
export function useDrillDown() {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<DrillDownFilter | null>(null);

  const openDrillDown = useCallback((f: DrillDownFilter) => {
    setFilter(f);
    setOpen(true);
  }, []);

  const closeDrillDown = useCallback(() => {
    setOpen(false);
  }, []);

  return { open, setOpen, filter, openDrillDown, closeDrillDown };
}

```

---

## `client/src/components/ErrorBoundary.tsx`

```tsx
import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-4">An unexpected error occurred.</h2>

            <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

```

---

## `client/src/components/ExecutiveSummary.tsx`

```tsx
/**
 * ExecutiveSummary — ملخص تنفيذي مع مقاييس المخاطر والامتثال
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, Clock, Target, Gauge, CheckCircle2, XCircle, Building2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ExecSummaryProps {
  totalLeaks: number;
  newLeaks: number;
  totalRecords: number;
  sectorDistribution: { sector: string; count: number; records: number }[];
  monthlyTrend: { yearMonth: string; count: number }[];
}

export default function ExecutiveSummary({ totalLeaks, newLeaks, totalRecords, sectorDistribution, monthlyTrend }: ExecSummaryProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const riskScore = useMemo(() => {
    const recentMonths = monthlyTrend.slice(-3);
    const recentAvg = recentMonths.length > 0 ? recentMonths.reduce((a, b) => a + b.count, 0) / recentMonths.length : 0;
    const olderMonths = monthlyTrend.slice(-6, -3);
    const olderAvg = olderMonths.length > 0 ? olderMonths.reduce((a, b) => a + b.count, 0) / olderMonths.length : 0;
    const trendFactor = olderAvg > 0 ? (recentAvg / olderAvg) * 30 : 15;
    const volumeFactor = Math.min(40, (totalRecords / 500000000) * 40);
    const newFactor = Math.min(30, (newLeaks / Math.max(totalLeaks, 1)) * 60);
    return Math.min(100, Math.round(trendFactor + volumeFactor + newFactor));
  }, [totalLeaks, newLeaks, totalRecords, monthlyTrend]);

  const complianceItems = useMemo(() => [
    { label: "سياسة الخصوصية", compliant: true },
    { label: "تقييم الأثر", compliant: true },
    { label: "إشعار الجهات", compliant: totalLeaks > 0 },
    { label: "تسجيل أنشطة المعالجة", compliant: true },
    { label: "تعيين مسؤول حماية", compliant: true },
    { label: "إجراءات الاستجابة", compliant: newLeaks < 50 },
  ], [totalLeaks, newLeaks]);

  const compliancePercent = useMemo(() => {
    const c = complianceItems.filter(i => i.compliant).length;
    return Math.round((c / complianceItems.length) * 100);
  }, [complianceItems]);

  const topThreats = useMemo(() => {
    return sectorDistribution.slice(0, 5).map(s => ({
      title: s.sector || "غير محدد",
      count: s.count,
      records: s.records,
      severity: s.count > 50 ? "critical" : s.count > 20 ? "high" : s.count > 10 ? "medium" : "low",
    }));
  }, [sectorDistribution]);

  const avgResponseHours = useMemo(() => Math.max(2, Math.round(48 - (compliancePercent / 100) * 30)), [compliancePercent]);

  const getRiskColor = (s: number) => s >= 80 ? "#ef4444" : s >= 60 ? "#f59e0b" : s >= 40 ? "#3b82f6" : "#10b981";
  const getRiskLabel = (s: number) => s >= 80 ? "حرج" : s >= 60 ? "مرتفع" : s >= 40 ? "متوسط" : "منخفض";
  const getSevColor = (sev: string) => sev === "critical" ? "text-red-400 bg-red-500/10" : sev === "high" ? "text-amber-400 bg-amber-500/10" : sev === "medium" ? "text-blue-400 bg-blue-500/10" : "text-emerald-400 bg-emerald-500/10";

  const sectorColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#ec4899"];

  const donutSegments = useMemo(() => {
    const total = sectorDistribution.reduce((a, b) => a + b.count, 0);
    let cumulative = 0;
    return sectorDistribution.slice(0, 6).map((s, i) => {
      const pct = total > 0 ? (s.count / total) * 100 : 0;
      const start = cumulative;
      cumulative += pct;
      return { ...s, pct, start, color: sectorColors[i % sectorColors.length] };
    });
  }, [sectorDistribution]);

  const cardClass = `rounded-2xl border p-5 ${isDark ? "bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/80 border-white/[0.06]" : "bg-white/90 border-[#e2e5ef] shadow-lg shadow-blue-500/5"}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Risk Score Gauge */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Gauge className={`w-4 h-4 ${isDark ? "text-[#3DB1AC]" : "text-blue-600"}`} />
          <span className="text-xs font-bold text-foreground">مقياس المخاطر</span>
          <span className="text-[9px] text-muted-foreground mr-auto">Risk Score</span>
        </div>
        <div className="flex justify-center mb-3">
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="40" fill="none" stroke={getRiskColor(riskScore)} strokeWidth="8"
                strokeLinecap="round" strokeDasharray={`${riskScore * 2.51} 251`}
                initial={{ strokeDasharray: "0 251" }} animate={{ strokeDasharray: `${riskScore * 2.51} 251` }}
                transition={{ duration: 1.5, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-foreground">{riskScore}</span>
              <span className="text-[9px] font-bold" style={{ color: getRiskColor(riskScore) }}>{getRiskLabel(riskScore)}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          {[{ l: "منخفض", c: "#10b981" }, { l: "متوسط", c: "#3b82f6" }, { l: "مرتفع", c: "#f59e0b" }, { l: "حرج", c: "#ef4444" }].map(z => (
            <span key={z.l} className="flex items-center gap-1 text-[8px] text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: z.c }} />{z.l}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Compliance Meter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className={`w-4 h-4 ${isDark ? "text-[#3DB1AC]" : "text-blue-600"}`} />
          <span className="text-xs font-bold text-foreground">الامتثال PDPL</span>
          <span className="text-[9px] text-muted-foreground mr-auto">Compliance</span>
        </div>
        <div className="flex justify-center mb-3">
          <div className="relative w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="40" fill="none" stroke={compliancePercent >= 80 ? "#10b981" : compliancePercent >= 60 ? "#f59e0b" : "#ef4444"}
                strokeWidth="8" strokeLinecap="round" strokeDasharray={`${compliancePercent * 2.51} 251`}
                initial={{ strokeDasharray: "0 251" }} animate={{ strokeDasharray: `${compliancePercent * 2.51} 251` }}
                transition={{ duration: 1.5, ease: "easeOut" }} />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-black text-foreground">{compliancePercent}%</span>
            </div>
          </div>
        </div>
        <div className="space-y-1.5">
          {complianceItems.map(item => (
            <div key={item.label} className="flex items-center gap-2 text-[10px]">
              {item.compliant ? <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" /> : <XCircle className="w-3 h-3 text-red-400 shrink-0" />}
              <span className={item.compliant ? "text-muted-foreground" : "text-red-400 font-medium"}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Top Threats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-4">
          <Target className={`w-4 h-4 ${isDark ? "text-[#3DB1AC]" : "text-blue-600"}`} />
          <span className="text-xs font-bold text-foreground">أبرز التهديدات</span>
          <span className="text-[9px] text-muted-foreground mr-auto">Top Threats</span>
        </div>
        <div className="space-y-2">
          {topThreats.map((t, i) => {
            const maxCount = topThreats[0]?.count || 1;
            const pct = (t.count / maxCount) * 100;
            const sevClass = getSevColor(t.severity);
            return (
              <motion.div key={t.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.08 }}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] text-foreground font-medium truncate max-w-[60%]">{t.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${sevClass} font-bold`}>{t.count}</span>
                </div>
                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: t.severity === "critical" ? "#ef4444" : t.severity === "high" ? "#f59e0b" : t.severity === "medium" ? "#3b82f6" : "#10b981" }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Response Time + Sector Donut */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className={cardClass}>
        <div className="flex items-center gap-2 mb-3">
          <Clock className={`w-4 h-4 ${isDark ? "text-[#3DB1AC]" : "text-blue-600"}`} />
          <span className="text-xs font-bold text-foreground">وقت الاستجابة</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl font-black text-foreground">{avgResponseHours}</span>
          <div>
            <span className="text-[10px] text-muted-foreground block">ساعة (متوسط)</span>
            <span className={`text-[9px] font-bold ${avgResponseHours < 24 ? "text-emerald-400" : avgResponseHours < 48 ? "text-amber-400" : "text-red-400"}`}>
              {avgResponseHours < 24 ? "ممتاز" : avgResponseHours < 48 ? "مقبول" : "يحتاج تحسين"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className={`w-3.5 h-3.5 ${isDark ? "text-[#3DB1AC]" : "text-blue-600"}`} />
          <span className="text-[10px] font-bold text-foreground">توزيع القطاعات</span>
        </div>
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 100 100" className="w-16 h-16 shrink-0">
            {donutSegments.map((seg, i) => {
              const r = 35;
              const circumference = 2 * Math.PI * r;
              const dashLength = (seg.pct / 100) * circumference;
              const dashOffset = -((seg.start / 100) * circumference);
              return (
                <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={seg.color} strokeWidth="10"
                  strokeDasharray={`${dashLength} ${circumference - dashLength}`} strokeDashoffset={dashOffset}
                  className="-rotate-90 origin-center" />
              );
            })}
          </svg>
          <div className="space-y-0.5 overflow-hidden">
            {donutSegments.slice(0, 4).map((seg, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[9px]">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-muted-foreground truncate">{seg.sector || "غير محدد"}</span>
                <span className="font-bold text-foreground mr-auto">{seg.count}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

```

---

## `client/src/components/ExportCenter.tsx`

```tsx
/**
 * ExportCenter — مركز التصدير المتقدم
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, FileText, Table, FileSpreadsheet, X, Loader2, CheckCircle2,
  FileBarChart, ClipboardList, Shield,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface ExportCenterProps {
  isOpen: boolean;
  onClose: () => void;
  stats: any;
  leaks: any[];
}

type ExportFormat = "pdf" | "excel" | "csv";
type ExportTemplate = "executive" | "detailed" | "compliance";

const formatConfig: Record<ExportFormat, { icon: any; label: string; labelEn: string; color: string; bg: string }> = {
  pdf: { icon: FileText, label: "تقرير PDF", labelEn: "PDF Report", color: "text-red-400", bg: "bg-red-500/10" },
  excel: { icon: FileSpreadsheet, label: "جدول Excel", labelEn: "Excel Spreadsheet", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  csv: { icon: Table, label: "بيانات CSV", labelEn: "CSV Data", color: "text-blue-400", bg: "bg-blue-500/10" },
};

const templateConfig: Record<ExportTemplate, { icon: any; label: string; description: string }> = {
  executive: { icon: FileBarChart, label: "ملخص تنفيذي", description: "تقرير مختصر للإدارة العليا مع المؤشرات الرئيسية" },
  detailed: { icon: ClipboardList, label: "تقرير تفصيلي", description: "تقرير شامل يتضمن جميع حالات الرصد والتحليلات" },
  compliance: { icon: Shield, label: "تقرير الامتثال", description: "تقرير الامتثال لنظام حماية البيانات الشخصية PDPL" },
};

function generateCSV(leaks: any[]): string {
  const headers = ["العنوان", "القطاع", "المصدر", "الخطورة", "العدد المُدّعى", "تاريخ الاكتشاف", "الحالة"];
  const rows = leaks.map(l => [
    l.titleAr || l.title || "",
    l.sectorAr || l.sector || "",
    l.source || "",
    l.severity || "",
    l.recordCount || 0,
    l.detectedAt || "",
    l.status || "",
  ]);
  const bom = "\uFEFF";
  return bom + [headers.join(","), ...rows.map(r => r.map(c => `"${c}"`).join(","))].join("\n");
}

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ExportCenter({ isOpen, onClose, stats, leaks }: ExportCenterProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("pdf");
  const [selectedTemplate, setSelectedTemplate] = useState<ExportTemplate>("executive");
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleExport = async () => {
    setExporting(true);
    setExportDone(false);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const timestamp = new Date().toISOString().slice(0, 10);
    const templateLabel = templateConfig[selectedTemplate].label;

    if (selectedFormat === "csv") {
      downloadBlob(generateCSV(leaks), `rasid-${selectedTemplate}-${timestamp}.csv`, "text/csv;charset=utf-8");
    } else if (selectedFormat === "excel") {
      const headers = ["العنوان", "القطاع", "المصدر", "الخطورة", "العدد المُدّعى", "تاريخ الاكتشاف"];
      const rows = leaks.map(l => [l.titleAr || l.title || "", l.sectorAr || l.sector || "", l.source || "", l.severity || "", l.recordCount || 0, l.detectedAt || ""]);
      const html = `<html dir="rtl"><head><meta charset="utf-8"></head><body><h2>منصة راصد - ${templateLabel}</h2><p>تاريخ التصدير: ${timestamp}</p><table border="1" style="border-collapse:collapse;direction:rtl"><tr>${headers.map(h => `<th style="background:#1e3a8a;color:white;padding:8px">${h}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map(c => `<td style="padding:6px">${c}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
      downloadBlob(html, `rasid-${selectedTemplate}-${timestamp}.xls`, "application/vnd.ms-excel");
    } else {
      const content = `<html dir="rtl"><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;padding:40px;direction:rtl;color:#1e293b}h1{color:#1e3a8a;border-bottom:3px solid #3DB1AC;padding-bottom:10px}.stats{display:flex;gap:20px;margin:20px 0}.stat-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:16px;flex:1;text-align:center}.stat-value{font-size:24px;font-weight:bold;color:#1e3a8a}.stat-label{font-size:12px;color:#64748b;margin-top:4px}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#1e3a8a;color:white;padding:10px;text-align:right}td{padding:8px;border-bottom:1px solid #e2e8f0}tr:nth-child(even){background:#f8fafc}.footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;padding-top:15px}</style></head><body><h1>منصة راصد - ${templateLabel}</h1><p>تاريخ التصدير: ${timestamp}</p><div class="stats"><div class="stat-box"><div class="stat-value">${stats?.totalLeaks || 0}</div><div class="stat-label">إجمالي حالات الرصد</div></div><div class="stat-box"><div class="stat-value">${(stats?.totalRecords || 0).toLocaleString()}</div><div class="stat-label">العدد المُدّعى</div></div><div class="stat-box"><div class="stat-value">${stats?.distinctSectors || 0}</div><div class="stat-label">القطاعات المتأثرة</div></div></div><table><tr><th>العنوان</th><th>القطاع</th><th>المصدر</th><th>الخطورة</th><th>السجلات</th></tr>${leaks.slice(0, selectedTemplate === "executive" ? 10 : 50).map(l => `<tr><td>${l.titleAr || l.title || ""}</td><td>${l.sectorAr || l.sector || ""}</td><td>${l.source || ""}</td><td>${l.severity || ""}</td><td>${(l.recordCount || 0).toLocaleString()}</td></tr>`).join("")}</table><div class="footer">تم إنشاء هذا التقرير بواسطة منصة راصد | الهيئة الوطنية للبيانات والذكاء الاصطناعي (NDMO)</div></body></html>`;
      const printWindow = window.open("", "_blank");
      if (printWindow) { printWindow.document.write(content); printWindow.document.close(); printWindow.print(); }
    }
    setExporting(false);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, x: 300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 left-0 bottom-0 w-[400px] max-w-[90vw] z-50 overflow-y-auto ${isDark ? "bg-[#0f172a] border-r border-white/10" : "bg-white border-r border-slate-200 shadow-2xl"}`}>
            <div className={`sticky top-0 z-10 flex items-center justify-between p-5 border-b ${isDark ? "bg-[#0f172a]/95 border-white/10 backdrop-blur-xl" : "bg-white/95 border-slate-200 backdrop-blur-xl"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-[#3DB1AC]/15" : "bg-blue-100"}`}>
                  <Download className={`w-5 h-5 ${isDark ? "text-[#3DB1AC]" : "text-blue-600"}`} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">مركز التصدير</h2>
                  <p className="text-[9px] text-muted-foreground">Export Center</p>
                </div>
              </div>
              <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-foreground mb-3">صيغة التصدير</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(Object.entries(formatConfig) as [ExportFormat, typeof formatConfig[ExportFormat]][]).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedFormat === key;
                    return (
                      <button key={key} onClick={() => setSelectedFormat(key)}
                        className={`p-3 rounded-xl border text-center transition-all ${isSelected
                          ? isDark ? "bg-[#3DB1AC]/10 border-[#3DB1AC]/30 ring-1 ring-[#3DB1AC]/20" : "bg-blue-50 border-blue-300 ring-1 ring-blue-200"
                          : isDark ? "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
                        <Icon className={`w-5 h-5 mx-auto mb-1.5 ${isSelected ? config.color : "text-muted-foreground"}`} />
                        <p className="text-[10px] font-bold text-foreground">{config.label}</p>
                        <p className="text-[8px] text-muted-foreground">{config.labelEn}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground mb-3">قالب التقرير</h3>
                <div className="space-y-2">
                  {(Object.entries(templateConfig) as [ExportTemplate, typeof templateConfig[ExportTemplate]][]).map(([key, config]) => {
                    const Icon = config.icon;
                    const isSelected = selectedTemplate === key;
                    return (
                      <button key={key} onClick={() => setSelectedTemplate(key)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl border text-right transition-all ${isSelected
                          ? isDark ? "bg-[#3DB1AC]/10 border-[#3DB1AC]/30" : "bg-blue-50 border-blue-300"
                          : isDark ? "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06]" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? isDark ? "bg-[#3DB1AC]/20" : "bg-blue-100" : isDark ? "bg-white/5" : "bg-slate-100"}`}>
                          <Icon className={`w-4 h-4 ${isSelected ? isDark ? "text-[#3DB1AC]" : "text-blue-600" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-foreground">{config.label}</p>
                          <p className="text-[9px] text-muted-foreground">{config.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? "bg-white/[0.03] border border-white/[0.06]" : "bg-slate-50 border border-slate-100"}`}>
                <h3 className="text-[10px] font-bold text-foreground mb-2">ملخص التصدير</h3>
                <div className="space-y-1.5 text-[10px] text-muted-foreground">
                  <div className="flex justify-between"><span>الصيغة:</span><span className="font-bold text-foreground">{formatConfig[selectedFormat].label}</span></div>
                  <div className="flex justify-between"><span>القالب:</span><span className="font-bold text-foreground">{templateConfig[selectedTemplate].label}</span></div>
                  <div className="flex justify-between"><span>عدد حالات الرصد:</span><span className="font-bold text-foreground">{leaks.length}</span></div>
                </div>
              </div>
              <motion.button onClick={handleExport} disabled={exporting}
                className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${exporting ? "opacity-70 cursor-not-allowed" : ""} ${isDark ? "bg-gradient-to-r from-[#3DB1AC] to-[#6459A7] text-white" : "bg-gradient-to-r from-[#1e3a8a] to-[#3b82f6] text-white"}`}
                whileHover={exporting ? {} : { scale: 1.02 }} whileTap={exporting ? {} : { scale: 0.98 }}>
                {exporting ? <><Loader2 className="w-4 h-4 animate-spin" /> جاري التصدير...</>
                  : exportDone ? <><CheckCircle2 className="w-4 h-4" /> تم التصدير بنجاح!</>
                  : <><Download className="w-4 h-4" /> تصدير التقرير</>}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

```

---

## `client/src/components/GlassCard.tsx`

```tsx
import { useSoundEffects } from '@/hooks/useSoundEffects';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverLift?: boolean;
  scanLine?: boolean;
  glowColor?: string;
}

export function GlassCard({
  children,
  className = '',
  onClick,
  hoverLift = true,
  scanLine = true,
  glowColor,
}: GlassCardProps) {
  const { playHover } = useSoundEffects();

  return (
    <div
      className={`glass-card gold-sweep group relative overflow-hidden rounded-2xl p-6 cursor-pointer ${className}`}
      style={glowColor ? { borderColor: `${glowColor}30` } : undefined}
      onMouseEnter={() => playHover()}
      onClick={onClick}
    >
      {/* Scan Line Effect */}
      {scanLine && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--sdaia-primary)]/20 to-transparent animate-scan" />
        </div>
      )}

      {/* Glow border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          boxShadow: glowColor
            ? `inset 0 0 0 1px ${glowColor}40, 0 0 20px ${glowColor}15`
            : 'inset 0 0 0 1px rgba(30, 58, 138, 0.15), 0 0 20px rgba(30, 58, 138, 0.08)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

```

---

## `client/src/components/GlobalFilterBar.tsx`

```tsx
/**
 * GlobalFilterBar - Unified filter bar for all analytics pages
 * Provides time range, sector, severity, and platform filters
 */
import { useFilters } from "@/contexts/FilterContext";
import { breachRecords, allSectors, allSeverities, allPlatforms } from "@/lib/breachData";
import { Filter, RotateCcw, Calendar, Building2, Shield, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";

const timeRangeOptions = [
  { value: "all", label: "الكل" },
  { value: "last30", label: "30 يوم" },
  { value: "last90", label: "90 يوم" },
  { value: "last180", label: "180 يوم" },
  { value: "2025", label: "2025" },
  { value: "2024", label: "2024" },
];

export default function GlobalFilterBar() {
  const { filters, setFilters, filteredRecords, resetFilters } = useFilters();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const total = breachRecords.length;
  const filtered = filteredRecords.length;
  const isFiltered = filters.timeRange !== "all" || filters.sector !== "all" || filters.severity !== "all" || filters.platform !== "all";

  const selectClass = `text-xs rounded-lg px-2 py-1.5 border outline-none cursor-pointer ${isDark ? "bg-[rgba(13,21,41,0.6)] border-[rgba(61,177,172,0.2)] text-white" : "bg-white border-[#e2e5ef] text-gray-800"}`;

  return (
    <div className={`flex flex-wrap items-center gap-3 p-3 rounded-xl border ${isDark ? "bg-[rgba(13,21,41,0.4)] border-[rgba(61,177,172,0.1)]" : "bg-white/80 border-[#e2e5ef]"} backdrop-blur-sm`} dir="rtl">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Filter className="w-3.5 h-3.5 text-[#3DB1AC]" />
        <span className="font-medium">فلترة</span>
      </div>

      <div className="flex items-center gap-1">
        <Calendar className="w-3 h-3 text-muted-foreground" />
        <select className={selectClass} value={filters.timeRange} onChange={(e) => setFilters((prev) => ({ ...prev, timeRange: e.target.value }))}>
          {timeRangeOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Building2 className="w-3 h-3 text-muted-foreground" />
        <select className={selectClass} value={filters.sector} onChange={(e) => setFilters((prev) => ({ ...prev, sector: e.target.value }))}>
          <option value="all">كل القطاعات</option>
          {allSectors.sort().map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Shield className="w-3 h-3 text-muted-foreground" />
        <select className={selectClass} value={filters.severity} onChange={(e) => setFilters((prev) => ({ ...prev, severity: e.target.value }))}>
          <option value="all">كل المستويات</option>
          {allSeverities.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      <div className="flex items-center gap-1">
        <Globe className="w-3 h-3 text-muted-foreground" />
        <select className={selectClass} value={filters.platform} onChange={(e) => setFilters((prev) => ({ ...prev, platform: e.target.value }))}>
          <option value="all">كل المنصات</option>
          {allPlatforms.map((p) => (<option key={p} value={p}>{p}</option>))}
        </select>
      </div>

      <Badge variant="outline" className={`text-[10px] ${isFiltered ? "border-[#f59e0b] text-[#f59e0b]" : "border-[#3DB1AC] text-[#3DB1AC]"}`}>
        {filtered}/{total} حالة رصد
      </Badge>

      {isFiltered && (
        <button onClick={resetFilters} className="flex items-center gap-1 text-[10px] text-[#ef4444] hover:text-[#dc2626] transition-colors">
          <RotateCcw className="w-3 h-3" />
          إعادة تعيين
        </button>
      )}
    </div>
  );
}

```

---

## `client/src/components/GlobalScanProgress.tsx`

```tsx
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Radar, ChevronLeft } from "lucide-react";

/**
 * Global scan progress indicator that appears in the top header bar
 * when a deep scan is actively running. Shows a compact progress bar
 * with percentage and links to the deep scan page.
 */
export function GlobalScanProgress() {
  const [location, setLocation] = useLocation();
  
  const { data: progress } = trpc.deepScan.liveProgress.useQuery(
    { jobId: 30001 },
    { refetchInterval: 3000 }
  );

  // Don't show if no progress data or scan is not active
  if (!progress || !progress.isActive) return null;

  // Don't show on the deep scan page itself (it has its own progress bar)
  if (location === "/deep-scan") return null;

  const total = progress.total || 1;
  const completed = progress.completed || 0;
  const failed = progress.failed || 0;
  const processed = completed + failed;
  const percent = Math.round((processed / total) * 100);
  const completedPercent = ((completed / total) * 100).toFixed(1);
  const failedPercent = ((failed / total) * 100).toFixed(1);

  // Calculate rate
  const scanning = progress.scanning || 0;

  return (
    
      <div
        onClick={() => setLocation("/deep-scan")}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/15 cursor-pointer transition-all duration-300 border border-primary/20 group"
        title="انقر للانتقال إلى صفحة المسح العميق"
      >
        {/* Pulsing radar icon */}
        <div className="relative">
          <Radar className="h-4 w-4 text-primary" />
          <span className="absolute -top-0.5 -end-0.5 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Progress info */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            المسح العميق
          </span>
          
          {/* Mini progress bar */}
          <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className="h-full flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${completedPercent}%` }}
              />
              <div
                className="h-full bg-red-500 transition-all duration-500"
                style={{ width: `${failedPercent}%` }}
              />
            </div>
          </div>

          <span className="text-xs font-bold text-primary tabular-nums">
            {percent}%
          </span>

          {scanning > 0 && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap hidden sm:inline">
              ({scanning} جاري)
            </span>
          )}
        </div>

        {/* Arrow to navigate */}
        <ChevronLeft className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    
  );
}

```

---

## `client/src/components/GlowButton.tsx`

```tsx
/**
 * GlowButton — Ultra Premium animated button with glow effects
 * Adapted from design.rasid.vip reference
 */
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "success" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
}

const VARIANTS = {
  primary: {
    dark: {
      bg: "linear-gradient(135deg, rgba(74, 122, 181, 0.25), rgba(99, 74, 181, 0.2))",
      border: "rgba(74, 122, 181, 0.35)",
      glow: "0 0 20px rgba(74, 122, 181, 0.25), 0 0 40px rgba(74, 122, 181, 0.1)",
      hoverGlow: "0 0 30px rgba(74, 122, 181, 0.4), 0 0 60px rgba(74, 122, 181, 0.15)",
      text: "#E8E6F5",
    },
    light: {
      bg: "linear-gradient(135deg, rgba(30, 58, 95, 0.08), rgba(74, 122, 181, 0.12))",
      border: "rgba(30, 58, 95, 0.15)",
      glow: "0 2px 8px rgba(30, 58, 95, 0.08)",
      hoverGlow: "0 4px 16px rgba(30, 58, 95, 0.12)",
      text: "#1E3A5F",
    },
  },
  secondary: {
    dark: {
      bg: "linear-gradient(135deg, rgba(99, 74, 181, 0.2), rgba(147, 74, 181, 0.15))",
      border: "rgba(99, 74, 181, 0.3)",
      glow: "0 0 15px rgba(99, 74, 181, 0.2)",
      hoverGlow: "0 0 25px rgba(99, 74, 181, 0.35)",
      text: "#E8E6F5",
    },
    light: {
      bg: "linear-gradient(135deg, rgba(99, 74, 181, 0.06), rgba(147, 74, 181, 0.08))",
      border: "rgba(99, 74, 181, 0.12)",
      glow: "0 2px 8px rgba(99, 74, 181, 0.06)",
      hoverGlow: "0 4px 16px rgba(99, 74, 181, 0.1)",
      text: "#634AB5",
    },
  },
  danger: {
    dark: {
      bg: "linear-gradient(135deg, rgba(235, 61, 99, 0.2), rgba(235, 61, 99, 0.12))",
      border: "rgba(235, 61, 99, 0.3)",
      glow: "0 0 15px rgba(235, 61, 99, 0.2)",
      hoverGlow: "0 0 25px rgba(235, 61, 99, 0.35)",
      text: "#FFB4C2",
    },
    light: {
      bg: "linear-gradient(135deg, rgba(235, 61, 99, 0.06), rgba(235, 61, 99, 0.1))",
      border: "rgba(235, 61, 99, 0.15)",
      glow: "0 2px 8px rgba(235, 61, 99, 0.08)",
      hoverGlow: "0 4px 16px rgba(235, 61, 99, 0.12)",
      text: "#EB3D63",
    },
  },
  success: {
    dark: {
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.12))",
      border: "rgba(16, 185, 129, 0.3)",
      glow: "0 0 15px rgba(16, 185, 129, 0.2)",
      hoverGlow: "0 0 25px rgba(16, 185, 129, 0.35)",
      text: "#A7F3D0",
    },
    light: {
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(16, 185, 129, 0.1))",
      border: "rgba(16, 185, 129, 0.15)",
      glow: "0 2px 8px rgba(16, 185, 129, 0.08)",
      hoverGlow: "0 4px 16px rgba(16, 185, 129, 0.12)",
      text: "#059669",
    },
  },
  ghost: {
    dark: {
      bg: "transparent",
      border: "rgba(74, 122, 181, 0.1)",
      glow: "none",
      hoverGlow: "0 0 15px rgba(74, 122, 181, 0.15)",
      text: "#B8B5D0",
    },
    light: {
      bg: "transparent",
      border: "rgba(30, 58, 95, 0.06)",
      glow: "none",
      hoverGlow: "0 2px 8px rgba(30, 58, 95, 0.06)",
      text: "#4A5568",
    },
  },
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "px-4 py-2.5 text-sm gap-2 rounded-xl",
  lg: "px-6 py-3 text-base gap-2.5 rounded-xl",
};

export default function GlowButton({
  children,
  onClick,
  variant = "primary",
  size = "md",
  icon,
  disabled = false,
  className = "",
  fullWidth = false,
}: GlowButtonProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const colors = VARIANTS[variant][isDark ? "dark" : "light"];

  return (
    <motion.button
      className={`
        relative inline-flex items-center justify-center font-semibold
        overflow-hidden transition-all duration-300
        ${SIZES[size]}
        ${fullWidth ? "w-full" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        boxShadow: colors.glow,
        color: colors.text,
      }}
      onClick={disabled ? undefined : onClick}
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.03,
              boxShadow: colors.hoverGlow,
              borderColor: isDark ? "rgba(74, 122, 181, 0.5)" : "rgba(30, 58, 95, 0.25)",
            }
      }
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 40%, ${isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.3)"} 50%, transparent 60%)`,
          backgroundSize: "200% 100%",
        }}
        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 3 }}
      />

      {icon && <span className="relative z-10">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

```

---

## `client/src/components/GuideOverlay.tsx`

```tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { X, ChevronLeft, ChevronRight, CheckCircle2, Lightbulb, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * GuideOverlay — الدليل الحي (UI-14, UI-15, DB-05, DB-06, DB-07)
 * Enhanced with: session persistence, route-based navigation,
 * action type indicators, and highlight styles
 */

export interface GuideStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  route?: string; // Route to navigate to for this step
  actionType?: "click" | "type" | "select" | "scroll" | "wait" | "observe";
  highlightType?: "border" | "overlay" | "pulse" | "arrow";
}

interface GuideOverlayProps {
  steps: GuideStep[];
  open: boolean;
  guideId?: number | string;
  guideName?: string;
  onClose: () => void;
  onComplete?: () => void;
  initialStep?: number;
}

const SESSION_STORAGE_KEY = "rasid_guide_session";

/** Recover guide session from storage (UI-15) */
export function getStoredGuideSession(): { guideId: string; currentStep: number } | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!stored) return null;
    const data = JSON.parse(stored);
    // Expire after 30 minutes
    if (Date.now() - data.timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return { guideId: data.guideId, currentStep: data.currentStep };
  } catch {
    return null;
  }
}

const ACTION_LABELS: Record<string, string> = {
  click: "اضغط على العنصر المُبرز",
  type: "اكتب في الحقل المُبرز",
  select: "اختر من القائمة المُبرزة",
  scroll: "مرر للأسفل",
  wait: "انتظر لحظة...",
  observe: "لاحظ العنصر المُبرز",
};

export default function GuideOverlay({ steps, open, guideId, guideName, onClose, onComplete, initialStep = 0 }: GuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Save session to storage for recovery (UI-15)
  useEffect(() => {
    if (open && guideId) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        guideId: String(guideId),
        currentStep,
        timestamp: Date.now(),
      }));
    }
  }, [open, guideId, currentStep]);

  const updateSpotlight = useCallback(() => {
    if (!open || !steps[currentStep]) return;
    const el = document.querySelector(steps[currentStep].target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlightRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setSpotlightRect(null);
    }
  }, [currentStep, open, steps]);

  useEffect(() => {
    // Navigate to step's route if specified
    if (open && step?.route) {
      const currentPath = window.location.pathname;
      if (!currentPath.includes(step.route)) {
        setLocation(step.route);
        // Wait for navigation and DOM update
        setTimeout(updateSpotlight, 800);
        return;
      }
    }

    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    // Watch for DOM changes to re-highlight
    const observer = new MutationObserver(() => {
      setTimeout(updateSpotlight, 100);
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
      observer.disconnect();
    };
  }, [updateSpotlight, open, step, setLocation]);

  const next = () => {
    if (isLast) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      onComplete?.();
      onClose();
      setCurrentStep(0);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleClose = () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setCurrentStep(0);
    onClose();
  };

  if (!open || !steps.length) return null;

  const padding = 8;

  const getTooltipPosition = (): React.CSSProperties => {
    if (!spotlightRect) return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
    const pos = step.position || "bottom";
    switch (pos) {
      case "top":
        return { bottom: window.innerHeight - spotlightRect.top + padding + 12, left: spotlightRect.left + spotlightRect.width / 2, transform: "translateX(-50%)" };
      case "bottom":
        return { top: spotlightRect.bottom + padding + 12, left: spotlightRect.left + spotlightRect.width / 2, transform: "translateX(-50%)" };
      case "left":
        return { top: spotlightRect.top + spotlightRect.height / 2, right: window.innerWidth - spotlightRect.left + padding + 12, transform: "translateY(-50%)" };
      case "right":
        return { top: spotlightRect.top + spotlightRect.height / 2, left: spotlightRect.right + padding + 12, transform: "translateY(-50%)" };
      default:
        return { top: spotlightRect.bottom + padding + 12, left: spotlightRect.left + spotlightRect.width / 2, transform: "translateX(-50%)" };
    }
  };

  // Get highlight border color based on type
  const getHighlightClass = () => {
    const type = step?.highlightType || "border";
    switch (type) {
      case "pulse": return "border-2 border-[#C5A55A] rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.4)] animate-pulse";
      case "overlay": return "border-2 border-[#C5A55A] rounded-lg bg-[#C5A55A]/10 shadow-[0_0_20px_rgba(197,165,90,0.3)]";
      case "arrow": return "border-2 border-dashed border-[#3DB1AC] rounded-lg shadow-[0_0_15px_rgba(61,177,172,0.3)]";
      default: return "border-2 border-[#C5A55A] rounded-lg shadow-[0_0_20px_rgba(197,165,90,0.4)]";
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999]"
          style={{ pointerEvents: "auto" }}
        >
          {/* Overlay with spotlight cutout */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
            <defs>
              <mask id="guide-spotlight-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {spotlightRect && (
                  <rect
                    x={spotlightRect.left - padding}
                    y={spotlightRect.top - padding}
                    width={spotlightRect.width + padding * 2}
                    height={spotlightRect.height + padding * 2}
                    rx="8"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0" y="0" width="100%" height="100%"
              fill="rgba(0,0,0,0.6)"
              mask="url(#guide-spotlight-mask)"
              style={{ pointerEvents: "auto" }}
              onClick={handleClose}
            />
          </svg>

          {/* Spotlight border glow */}
          {spotlightRect && (
            <motion.div
              layoutId="guide-spotlight"
              className={cn("absolute", getHighlightClass())}
              style={{
                top: spotlightRect.top - padding,
                left: spotlightRect.left - padding,
                width: spotlightRect.width + padding * 2,
                height: spotlightRect.height + padding * 2,
                pointerEvents: "none",
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-[10000] rounded-2xl shadow-2xl p-5 max-w-sm w-80"
            style={{
              ...getTooltipPosition(),
              pointerEvents: "auto",
              background: "linear-gradient(135deg, rgba(15, 40, 71, 0.98), rgba(11, 29, 53, 0.99))",
              border: "1px solid rgba(197, 165, 90, 0.25)",
              backdropFilter: "blur(20px)",
            }}
            dir="rtl"
          >
            <button onClick={handleClose} className="absolute top-2 left-2 text-[#D4DDEF]/40 hover:text-[#D4DDEF] transition-colors">
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="h-7 w-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(197, 165, 90, 0.15)" }}>
                <MapPin className="h-4 w-4 text-[#C5A55A]" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#D4DDEF]">{step.title}</h3>
                {guideName && <p className="text-[10px] text-[#D4DDEF]/40">{guideName}</p>}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #C5A55A, #3DB1AC)" }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <p className="text-xs text-[#D4DDEF]/70 leading-relaxed mb-3">{step.description}</p>

            {/* Action type indicator */}
            {step.actionType && step.actionType !== "observe" && (
              <div className="flex items-center gap-2 mb-3 px-2 py-1.5 rounded-lg" style={{ background: "rgba(61, 177, 172, 0.1)" }}>
                <div className="h-1.5 w-1.5 rounded-full bg-[#3DB1AC] animate-pulse" />
                <span className="text-[10px] text-[#3DB1AC]">{ACTION_LABELS[step.actionType] || ""}</span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#D4DDEF]/40">
                {currentStep + 1} / {steps.length}
              </span>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={prev}
                    className="h-7 px-3 rounded-lg text-xs font-medium text-[#D4DDEF]/60 hover:bg-white/5 transition-colors flex items-center gap-1"
                    style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <ChevronRight className="h-3 w-3" />
                    السابق
                  </button>
                )}
                <button
                  onClick={next}
                  className="h-7 px-3 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1"
                  style={{ background: isLast ? "linear-gradient(135deg, #3DB1AC, #2dd4bf)" : "linear-gradient(135deg, #C5A55A, #b8963f)" }}
                >
                  {isLast ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      إنهاء
                    </>
                  ) : (
                    <>
                      التالي
                      <ChevronLeft className="h-3 w-3" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1 mt-3">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentStep ? "w-4 bg-[#C5A55A]" : i < currentStep ? "w-1.5 bg-[#3DB1AC]" : "w-1.5 bg-white/10"
                  )}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

---

## `client/src/components/HolographicCard.tsx`

```tsx
/**
 * HolographicCard — A card with holographic/iridescent effect on hover.
 * Uses CSS transforms and gradient overlays for a 3D holographic appearance.
 */
import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface HolographicCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: "low" | "medium" | "high";
  disabled?: boolean;
}

export function HolographicCard({
  children,
  className,
  intensity = "medium",
  disabled = false,
}: HolographicCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("");
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});

  const intensityMap = { low: 5, medium: 10, high: 20 };
  const maxTilt = intensityMap[intensity];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (0.5 - y) * maxTilt;
      const tiltY = (x - 0.5) * maxTilt;
      setTransform(`perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`);
      setGlareStyle({
        background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.25) 0%, transparent 60%)`,
        opacity: 1,
      });
    },
    [disabled, maxTilt]
  );

  const handleMouseLeave = useCallback(() => {
    setTransform("");
    setGlareStyle({ opacity: 0 });
  }, []);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative overflow-hidden rounded-xl transition-transform duration-300 ease-out",
        "bg-gradient-to-br from-slate-800/80 via-slate-900/90 to-slate-800/80",
        "border border-white/10 backdrop-blur-sm",
        "shadow-lg hover:shadow-2xl hover:shadow-cyan-500/10",
        className
      )}
      style={{ transform, willChange: "transform" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Holographic rainbow overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300"
        style={{
          background: `linear-gradient(
            135deg,
            rgba(255,0,128,0.05) 0%,
            rgba(0,255,255,0.08) 25%,
            rgba(128,0,255,0.05) 50%,
            rgba(0,255,128,0.08) 75%,
            rgba(255,128,0,0.05) 100%
          )`,
          mixBlendMode: "overlay",
        }}
      />
      {/* Glare effect */}
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
        style={glareStyle}
      />
      {/* Content */}
      <div className="relative z-0">{children}</div>
    </div>
  );
}

export default HolographicCard;

```

---

## `client/src/components/ImageSearch.tsx`

```tsx
/**
 * ImageSearch — AI-powered image search and analysis component.
 * Supports searching through uploaded images, screenshots, and visual content.
 */
import React, { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  url: string;
  thumbnail?: string;
  title: string;
  description?: string;
  relevanceScore: number;
  tags?: string[];
  date?: string;
}

interface ImageSearchProps {
  className?: string;
  onSearch?: (query: string) => Promise<SearchResult[]>;
  onImageSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

export function ImageSearch({
  className,
  onSearch,
  onImageSelect,
  placeholder = "ابحث في الصور...",
}: ImageSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SearchResult | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !onSearch) return;
    setIsSearching(true);
    try {
      const searchResults = await onSearch(query);
      setResults(searchResults);
    } catch (err) {
      console.error("Image search failed:", err);
    } finally {
      setIsSearching(false);
    }
  }, [query, onSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        const result: SearchResult = {
          id: `upload-${Date.now()}`,
          url: reader.result as string,
          title: file.name,
          description: `${(file.size / 1024).toFixed(1)} KB — ${file.type}`,
          relevanceScore: 1,
          date: new Date().toISOString(),
        };
        setResults((prev) => [result, ...prev]);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleSelect = useCallback(
    (result: SearchResult) => {
      setSelectedImage(result);
      onImageSelect?.(result);
    },
    [onImageSelect]
  );

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden", className)} dir="rtl">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/5">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full px-4 py-2.5 pr-10 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 text-sm"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 text-sm transition-all disabled:opacity-50"
          >
            {isSearching ? "جاري البحث..." : "بحث"}
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 rounded-lg bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 text-sm transition-all"
            title="رفع صورة"
          >
            📷
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* View mode toggle */}
        {results.length > 0 && (
          <div className="flex gap-1 mt-3">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-1 rounded text-xs transition-all",
                viewMode === "grid" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              ▦ شبكة
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-1 rounded text-xs transition-all",
                viewMode === "list" ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"
              )}
            >
              ☰ قائمة
            </button>
            <span className="text-xs text-white/30 mr-auto mt-1">
              {results.length} نتيجة
            </span>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="p-4">
        {results.length === 0 && !isSearching && (
          <div className="text-center py-12 text-white/30">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-sm">ابحث عن صور أو ارفع صورة للتحليل</p>
          </div>
        )}

        {isSearching && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full mx-auto mb-3" />
            <p className="text-sm text-white/40">جاري البحث...</p>
          </div>
        )}

        {viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  "relative group rounded-lg overflow-hidden cursor-pointer border transition-all",
                  selectedImage?.id === result.id
                    ? "border-cyan-500 ring-2 ring-cyan-500/30"
                    : "border-white/5 hover:border-white/20"
                )}
              >
                <div className="aspect-square bg-slate-800">
                  <img
                    src={result.thumbnail || result.url}
                    alt={result.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-xs text-white truncate">{result.title}</p>
                    {result.tags && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {result.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Relevance badge */}
                <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] bg-black/50 text-cyan-400">
                  {Math.round(result.relevanceScore * 100)}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  "flex gap-3 p-3 rounded-lg cursor-pointer border transition-all",
                  selectedImage?.id === result.id
                    ? "border-cyan-500/50 bg-cyan-500/5"
                    : "border-white/5 hover:border-white/10 hover:bg-white/5"
                )}
              >
                <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-slate-800">
                  <img src={result.thumbnail || result.url} alt={result.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/90 truncate">{result.title}</p>
                  {result.description && <p className="text-xs text-white/40 mt-1 truncate">{result.description}</p>}
                  {result.tags && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {result.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="text-xs text-cyan-400 flex-shrink-0">
                  {Math.round(result.relevanceScore * 100)}%
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImageSearch;

```

---

## `client/src/components/KnowledgeGraph.tsx`

```tsx
/**
 * KnowledgeGraph — Interactive knowledge graph visualization.
 * Renders nodes and edges using SVG with force-directed layout simulation.
 */
import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";

interface GraphNode {
  id: string;
  label: string;
  type?: string;
  size?: number;
  color?: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  weight?: number;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  className?: string;
  width?: number;
  height?: number;
  onNodeClick?: (node: GraphNode) => void;
}

const TYPE_COLORS: Record<string, string> = {
  entity: "#06b6d4",
  concept: "#8b5cf6",
  action: "#10b981",
  category: "#f59e0b",
  alert: "#ef4444",
  default: "#6366f1",
};

function simpleForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  iterations = 50
): GraphNode[] {
  const positioned = nodes.map((n, i) => ({
    ...n,
    x: n.x ?? width / 2 + (Math.cos((2 * Math.PI * i) / nodes.length) * width * 0.35),
    y: n.y ?? height / 2 + (Math.sin((2 * Math.PI * i) / nodes.length) * height * 0.35),
    vx: 0,
    vy: 0,
  }));

  const nodeMap = new Map(positioned.map((n) => [n.id, n]));

  for (let iter = 0; iter < iterations; iter++) {
    const alpha = 1 - iter / iterations;

    // Repulsion between all nodes
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i];
        const b = positioned[j];
        const dx = b.x! - a.x!;
        const dy = b.y! - a.y!;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (300 * alpha) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx -= fx;
        a.vy -= fy;
        b.vx += fx;
        b.vy += fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const a = nodeMap.get(edge.source);
      const b = nodeMap.get(edge.target);
      if (!a || !b) continue;
      const dx = b.x! - a.x!;
      const dy = b.y! - a.y!;
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
      const force = (dist - 120) * 0.01 * alpha;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      a.vx += fx;
      a.vy += fy;
      b.vx -= fx;
      b.vy -= fy;
    }

    // Center gravity
    for (const node of positioned) {
      node.vx += (width / 2 - node.x!) * 0.001 * alpha;
      node.vy += (height / 2 - node.y!) * 0.001 * alpha;
    }

    // Apply velocities with damping
    for (const node of positioned) {
      node.x! += node.vx * 0.8;
      node.y! += node.vy * 0.8;
      node.vx *= 0.5;
      node.vy *= 0.5;
      // Keep within bounds
      node.x = Math.max(40, Math.min(width - 40, node.x!));
      node.y = Math.max(40, Math.min(height - 40, node.y!));
    }
  }

  return positioned;
}

export function KnowledgeGraph({
  nodes,
  edges,
  className,
  width = 800,
  height = 500,
  onNodeClick,
}: KnowledgeGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const positionedNodes = useMemo(
    () => simpleForceLayout(nodes, edges, width, height),
    [nodes, edges, width, height]
  );

  const nodeMap = useMemo(
    () => new Map(positionedNodes.map((n) => [n.id, n])),
    [positionedNodes]
  );

  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      setSelectedNode(node.id === selectedNode ? null : node.id);
      onNodeClick?.(node);
    },
    [selectedNode, onNodeClick]
  );

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        style={{ minHeight: 300 }}
      >
        {/* Background grid */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />

        {/* Edges */}
        {edges.map((edge, i) => {
          const source = nodeMap.get(edge.source);
          const target = nodeMap.get(edge.target);
          if (!source || !target) return null;
          const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
          return (
            <g key={`edge-${i}`}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "rgba(6,182,212,0.6)" : "rgba(255,255,255,0.1)"}
                strokeWidth={isHighlighted ? 2 : 1}
                className="transition-all duration-300"
              />
              {edge.label && (
                <text
                  x={(source.x! + target.x!) / 2}
                  y={(source.y! + target.y!) / 2 - 5}
                  fill="rgba(255,255,255,0.4)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {positionedNodes.map((node) => {
          const nodeSize = node.size || 20;
          const color = node.color || TYPE_COLORS[node.type || "default"] || TYPE_COLORS.default;
          const isHovered = hoveredNode === node.id;
          const isSelected = selectedNode === node.id;

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node)}
            >
              {/* Glow ring */}
              {(isHovered || isSelected) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeSize + 8}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  opacity="0.4"
                  filter="url(#glow)"
                />
              )}
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={nodeSize}
                fill={`${color}33`}
                stroke={color}
                strokeWidth={isSelected ? 3 : 1.5}
                className="transition-all duration-200"
              />
              {/* Node label */}
              <text
                x={node.x}
                y={node.y! + nodeSize + 16}
                fill="rgba(255,255,255,0.8)"
                fontSize="11"
                textAnchor="middle"
                fontFamily="Tajawal, sans-serif"
              >
                {node.label}
              </text>
              {/* Type badge */}
              {node.type && (
                <text
                  x={node.x}
                  y={node.y! + 4}
                  fill="rgba(255,255,255,0.9)"
                  fontSize="9"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {node.type.charAt(0).toUpperCase()}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default KnowledgeGraph;

```

---

## `client/src/components/LeakDetailDrilldown.tsx`

```tsx
/**
 * LeakDetailDrilldown — Reusable deep-drill component for leak details
 * Fetches full incident details from API and shows all tabs + "Document Incident" button
 * Updated to show ALL fields from final_v3_database.json 1:1
 */
import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Shield,
  Eye,
  Brain,
  Download,
  Loader2,
  ExternalLink,
  AlertTriangle,
  Hash,
  Calendar,
  Globe,
  User,
  Database,
  Fingerprint,
  CheckCircle2,
  Printer,
  QrCode,
  ChevronLeft,
  Lock,
  Skull,
  DollarSign,
  Zap,
  Link2,
  Table,
  Scale,
  Building2,
  MapPin,
  Image,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ComplianceWarningDialog from "./ComplianceWarningDialog";

const severityLabel = (s: string) => {
  switch (s) {
    case "critical": return "واسع النطاق";
    case "high": return "مرتفع التأثير";
    case "medium": return "متوسط التأثير";
    default: return "محدود التأثير";
  }
};

const severityColor = (s: string) => {
  switch (s) {
    case "critical": return "text-red-400 bg-red-500/10 border-red-500/30";
    case "high": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "medium": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
    default: return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
  }
};

const sourceLabel = (s: string) => {
  switch (s) {
    case "telegram": return "تليجرام";
    case "darkweb": return "دارك ويب";
    default: return "موقع لصق";
  }
};

const statusLabel = (s: string) => {
  switch (s) {
    case "new": return "جديد";
    case "analyzing": return "قيد التحليل";
    case "documented": return "موثّق";
    default: return "مكتمل";
  }
};

const statusColor = (s: string) => {
  switch (s) {
    case "new": return "text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
    case "analyzing": return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    case "documented": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
    default: return "text-violet-400 bg-violet-500/10 border-violet-500/30";
  }
};

type TabId = "overview" | "sample" | "evidence" | "ai";

interface LeakDetailDrilldownProps {
  leak: any;
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  showBackButton?: boolean;
}

export default function LeakDetailDrilldown({ leak, open, onClose, onBack, showBackButton }: LeakDetailDrilldownProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState<{ documentId: string; verificationCode: string; htmlContent: string } | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showComplianceWarning, setShowComplianceWarning] = useState(false);

  const leakId = leak?.leakId;
  const { data: fullDetail, isLoading: detailLoading } = trpc.leaks.detail.useQuery(
    { leakId: leakId! },
    { enabled: !!leakId && open }
  );

  useEffect(() => {
    if (open) {
      setActiveTab("overview");
      setGeneratedDoc(null);
    }
  }, [leakId, open]);

  const generateDocMutation = trpc.documentation.generate.useMutation({
    onSuccess: (data) => {
      setGeneratedDoc(data);
      setIsGeneratingDoc(false);
      toast.success("تم توثيق حالة الرصد بنجاح", { description: `رقم التحقق: ${data.verificationCode}` });
    },
    onError: (err) => {
      setIsGeneratingDoc(false);
      toast.error("خطأ في التوثيق", { description: err.message });
    },
  });

  const handleGenerateDoc = useCallback(() => {
    if (!leakId) return;
    setShowComplianceWarning(true);
  }, [leakId]);

  const handleConfirmGenerate = useCallback(() => {
    if (!leakId) return;
    setShowComplianceWarning(false);
    setIsGeneratingDoc(true);
    generateDocMutation.mutate({
      title: detail?.title || '',
      titleAr: detail?.titleAr || '',
      documentType: 'incident_report' as const,
      coreData: {
        leakId,
        severity: detail?.severity,
        source: detail?.source,
        recordCount: detail?.recordCount,
        threatActor: detail?.threatActor,
        victim: detail?.victim,
        sectorAr: detail?.sectorAr,
        breachMethodAr: detail?.breachMethodAr,
      },
      description: detail?.descriptionAr || '',
      baseUrl: window.location.origin,
      recordId: leakId,
    });
  }, [leakId]);

  const handlePrintDoc = useCallback(() => {
    if (!generatedDoc) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatedDoc.htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  }, [generatedDoc]);

  const handleDownloadDoc = useCallback(async () => {
    if (!generatedDoc || !leakId) return;
    try {
      const printToolbar = `
        <div id="print-toolbar" dir="rtl" style="position:fixed;top:0;left:0;right:0;z-index:9999;background:linear-gradient(135deg,#0a2540,#0c3054);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 20px rgba(0,0,0,0.3);font-family:'Tajawal',sans-serif;">
          <div style="display:flex;align-items:center;gap:12px;">
            <button onclick="document.getElementById('print-toolbar').style.display='none';window.print();setTimeout(()=>document.getElementById('print-toolbar').style.display='flex',500);" style="background:linear-gradient(135deg,#0d9488,#06b6d4);color:white;border:none;padding:10px 28px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:'Tajawal',sans-serif;display:flex;align-items:center;gap:8px;">
              ⬇ حفظ كـ PDF
            </button>
            <span style="color:rgba(255,255,255,0.5);font-size:12px;">اختر "حفظ كـ PDF" من نافذة الطباعة</span>
          </div>
          <span style="color:rgba(255,255,255,0.4);font-size:11px;">منصة راصد — توثيق حالة رصد</span>
        </div>
        <div style="height:56px;"></div>
      `;
      const htmlWithToolbar = generatedDoc.htmlContent.replace('<div class="page">', printToolbar + '<div class="page">');
      toast.info("جاري تحميل الملف...");
      const blob = new Blob([htmlWithToolbar], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `توثيق-حالة-رصد-${leakId}-${generatedDoc.verificationCode}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("تم تحميل الملف — افتحه في المتصفح واختر طباعة > حفظ كـ PDF");
    } catch (err) {
      console.error("PDF download error:", err);
      toast.error("حدث خطأ أثناء تحميل الملف");
    }
  }, [generatedDoc, leakId]);

  if (!open || !leak) return null;

  const detail = fullDetail || leak;
  const sampleData = (detail.sampleData as Array<Record<string, string>>) || [];
  const piiTypes = (detail.piiTypes as string[]) || [];
  const piiTypesAr = (detail.piiTypesAr as string[]) || [];
  const aiRecommendations = (detail.aiRecommendationsAr as string[]) || (detail.aiRecommendations as string[]) || [];
  const evidence = detail.evidence || [];
  const evidenceFiles = (detail.evidenceFiles as string[]) || [];
  const screenshotUrls = (detail.screenshotUrls as string[]) || [];
  const sourcesInfo = (detail.sourcesInfo as Array<{ name: string; url: string }>) || [];
  const attackerInfo = (detail.attackerInfo as Record<string, any>) || {};
  const aiAnalysis = (detail.aiAnalysis as Record<string, any>) || {};
  const pdplAnalysis = (detail.pdplAnalysis as Record<string, any>) || {};
  const overviewData = (detail.overviewData as Record<string, any>) || {};
  const sampleFields = (detail.sampleFields as string[]) || [];
  const sampleFieldsEn = (detail.sampleFieldsEn as string[]) || [];
  const allEvidenceImages = [...evidenceFiles, ...screenshotUrls.filter((u: string) => !evidenceFiles.includes(u))];

  const tabs = [
    { id: "overview" as TabId, label: "نظرة عامة", icon: Eye },
    { id: "sample" as TabId, label: `البيانات المسربة (${sampleData.length})`, icon: Table },
    { id: "ai" as TabId, label: "تحليل AI", icon: Brain },
    { id: "evidence" as TabId, label: `المصادر والأدلة (${allEvidenceImages.length + sourcesInfo.length})`, icon: Shield },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading && !fullDetail ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-muted-foreground mr-3">جاري تحميل التفاصيل...</span>
                </div>
              ) : (
                <>
                  {/* Header */}
                  <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-4">
                    <div className="flex items-center gap-3">
                      {showBackButton && onBack && (
                        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                          <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                      <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-amber-500/20 border border-red-500/30">
                        <Shield className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-foreground font-bold text-sm truncate">{detail.titleAr}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{detail.leakId}</span>
                          {detail.victim && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {detail.victim}
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${severityColor(detail.severity)}`}>
                            {severityLabel(detail.severity)}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded border ${statusColor(detail.status)}`}>
                            {statusLabel(detail.status)}
                          </span>
                          {detail.threatActor && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 flex items-center gap-1">
                              <Skull className="w-3 h-3" /> {detail.threatActor}
                            </span>
                          )}
                          {detail.leakPrice && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <DollarSign className="w-3 h-3" /> {detail.leakPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {!generatedDoc ? (
                          <Button
                            size="sm"
                            onClick={handleGenerateDoc}
                            disabled={isGeneratingDoc}
                            className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white text-xs gap-1.5"
                          >
                            {isGeneratingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            توثيق حالة الرصد
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="outline" onClick={handlePrintDoc} className="text-xs gap-1">
                              <Printer className="w-3 h-3" /> طباعة
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleDownloadDoc} className="text-xs gap-1">
                              <Download className="w-3 h-3" /> تحميل PDF
                            </Button>
                            <a href={`/public/verify/${generatedDoc.verificationCode}`} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-teal-400 hover:text-teal-300 px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20">
                              <QrCode className="w-3 h-3" /> {generatedDoc.verificationCode}
                            </a>
                          </div>
                        )}
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
                          <X className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-3 bg-secondary/50 rounded-lg p-1">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                              activeTab === tab.id
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* ═══ OVERVIEW TAB ═══ */}
                    {activeTab === "overview" && (
                      <>
                        {/* Key Metrics Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Globe className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">المصدر</p>
                            </div>
                            <p className="text-sm font-medium text-foreground">{sourceLabel(detail.source)}</p>
                            {detail.sourcePlatform && <p className="text-[10px] text-muted-foreground mt-1">{detail.sourcePlatform}</p>}
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Database className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">السجلات المكشوفة</p>
                            </div>
                            <p className="text-sm font-bold text-red-400">{detail.recordCount?.toLocaleString()}</p>
                            {overviewData.data_size && <p className="text-[10px] text-muted-foreground mt-1">{overviewData.data_size}</p>}
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Zap className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">طريقة الاختراق</p>
                            </div>
                            <p className="text-sm text-foreground font-medium">{detail.breachMethodAr || "غير محدد"}</p>
                            {detail.breachMethod && detail.breachMethod !== detail.breachMethodAr && (
                              <p className="text-[10px] text-muted-foreground mt-1" dir="ltr">{detail.breachMethod}</p>
                            )}
                          </div>
                          <div className="bg-secondary/50 rounded-xl p-3 border border-border/50">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <p className="text-[10px] text-muted-foreground">تاريخ الاكتشاف</p>
                            </div>
                            <p className="text-sm text-foreground">{detail.detectedAt ? new Date(detail.detectedAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" }) : "—"}</p>
                          </div>
                        </div>

                        {/* Threat Actor & Source Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="bg-gradient-to-br from-red-500/5 to-red-500/10 rounded-xl p-4 border border-red-500/20">
                            <h4 className="text-xs font-semibold text-red-400 mb-3 flex items-center gap-1.5">
                              <Skull className="w-3.5 h-3.5" /> معلومات المهاجم / البائع
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">الاسم المستعار</span>
                                <span className="text-sm font-mono text-red-400 font-bold">{detail.threatActor || attackerInfo.alias || "مجهول"}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">السعر المطلوب</span>
                                <span className="text-sm font-mono text-amber-400 font-bold">{detail.leakPrice || attackerInfo.price || "غير محدد"}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">المنصة</span>
                                <span className="text-sm text-foreground">{detail.sourcePlatform || attackerInfo.platform || sourceLabel(detail.source)}</span>
                              </div>
                              {attackerInfo.group && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">المجموعة</span>
                                  <span className="text-sm text-foreground">{attackerInfo.group}</span>
                                </div>
                              )}
                              {attackerInfo.known_attacks && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">هجمات معروفة</span>
                                  <span className="text-sm text-foreground">{attackerInfo.known_attacks}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 rounded-xl p-4 border border-violet-500/20">
                            <h4 className="text-xs font-semibold text-violet-400 mb-3 flex items-center gap-1.5">
                              <Link2 className="w-3.5 h-3.5" /> مصدر الرصد
                            </h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">القطاع</span>
                                <span className="text-sm text-foreground">{detail.sectorAr}</span>
                              </div>
                              {detail.category && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">التصنيف</span>
                                  <span className="text-sm text-foreground">{detail.category}</span>
                                </div>
                              )}
                              {detail.regionAr && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">المنطقة</span>
                                  <span className="text-sm text-foreground">{detail.regionAr} {detail.cityAr ? `— ${detail.cityAr}` : ""}</span>
                                </div>
                              )}
                              {detail.dataSensitivity && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">حساسية البيانات</span>
                                  <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">{detail.dataSensitivity}</Badge>
                                </div>
                              )}
                              {detail.sourceUrl && (
                                <div className="mt-2 pt-2 border-t border-border/30">
                                  <a href={detail.sourceUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-xs text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 rounded-lg p-2">
                                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                    <span className="truncate font-mono" dir="ltr">{detail.sourceUrl}</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" /> وصف حالة الرصد
                          </h4>
                          <p className="text-sm text-foreground leading-relaxed">{detail.descriptionAr || "لا يوجد وصف متاح"}</p>
                          {detail.description && detail.description !== detail.descriptionAr && (
                            <div className="mt-3 pt-3 border-t border-border/30">
                              <p className="text-[10px] text-muted-foreground mb-1">English Description</p>
                              <p className="text-xs text-muted-foreground leading-relaxed" dir="ltr">{detail.description}</p>
                            </div>
                          )}
                        </div>

                        {/* PII Types - Arabic & English */}
                        {(piiTypesAr.length > 0 || piiTypes.length > 0) && (
                          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                              <Fingerprint className="w-3.5 h-3.5" />
                              أنواع البيانات الشخصية المكتشفة ({piiTypesAr.length || piiTypes.length} نوع)
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {(piiTypesAr.length > 0 ? piiTypesAr : piiTypes).map((type: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                  <Lock className="w-3 h-3 text-red-400 shrink-0" />
                                  <div>
                                    <span className="text-xs text-foreground block">{type}</span>
                                    {piiTypesAr.length > 0 && piiTypes[i] && (
                                      <span className="text-[10px] text-muted-foreground" dir="ltr">{piiTypes[i]}</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ═══ SAMPLE DATA TAB ═══ */}
                    {activeTab === "sample" && (
                      <div className="space-y-4">
                        {sampleData.length > 0 ? (
                          <>
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                              <p className="text-xs text-red-400">تنبيه: البيانات أدناه عينات توضيحية من حالة الرصد لأغراض التوثيق فقط</p>
                            </div>

                            {/* Sample Fields */}
                            {sampleFields.length > 0 && (
                              <div className="bg-secondary/30 rounded-xl p-3 border border-border/30">
                                <h4 className="text-xs font-semibold text-muted-foreground mb-2">حقول العينة ({sampleFields.length} حقل)</h4>
                                <div className="flex flex-wrap gap-2">
                                  {sampleFields.map((f: string, i: number) => (
                                    <span key={i} className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                                      {f} {sampleFieldsEn[i] ? `(${sampleFieldsEn[i]})` : ""}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="overflow-x-auto rounded-lg border border-border">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-secondary/50">
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border whitespace-nowrap">#</th>
                                    {Object.keys(sampleData[0]).map((key) => (
                                      <th key={key} className="p-2.5 text-right font-medium text-muted-foreground border-b border-border whitespace-nowrap">
                                        {key}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {sampleData.map((row: Record<string, string>, i: number) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                                      <td className="p-2.5 text-muted-foreground font-mono">{i + 1}</td>
                                      {Object.values(row).map((val: string, j: number) => (
                                        <td key={j} className="p-2.5 text-foreground whitespace-nowrap">{val}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-[10px] text-muted-foreground text-center">
                              عرض {sampleData.length} عينة من أصل {detail.recordCount?.toLocaleString()} سجل مسرب
                              {detail.totalSampleRecords ? ` (إجمالي العينات: ${detail.totalSampleRecords})` : ""}
                            </p>
                          </>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Database className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">لا توجد عينات بيانات متاحة لحالة الرصد هذه</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ═══ AI ANALYSIS TAB ═══ */}
                    {activeTab === "ai" && (
                      <div className="space-y-4">
                        {(detail.aiSummaryAr || aiAnalysis.executive_summary) ? (
                          <>
                            {/* Executive Summary */}
                            <div className="bg-purple-500/5 rounded-xl p-4 border border-purple-500/20">
                              <div className="flex items-center gap-2 mb-3">
                                <Brain className="w-4 h-4 text-purple-400" />
                                <h4 className="text-xs font-semibold text-purple-400">الملخص التنفيذي</h4>
                                {(detail.aiConfidence || aiAnalysis.confidence_percentage) && (
                                  <Badge variant="outline" className="text-[10px] mr-auto border-purple-500/30 text-purple-400">
                                    ثقة: {detail.aiConfidence || aiAnalysis.confidence_percentage}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-foreground leading-relaxed">{detail.aiSummaryAr || aiAnalysis.executive_summary}</p>
                              {(detail.aiSummary || aiAnalysis.executive_summary_en) && (
                                <div className="mt-3 pt-3 border-t border-border/30">
                                  <p className="text-[10px] text-muted-foreground mb-1">English Summary</p>
                                  <p className="text-[11px] text-muted-foreground leading-relaxed" dir="ltr">{detail.aiSummary || aiAnalysis.executive_summary_en}</p>
                                </div>
                              )}
                            </div>

                            {/* Impact Assessment */}
                            {(aiAnalysis.impact_assessment || detail.aiSeverity) && (
                              <div className="bg-red-500/5 rounded-xl p-4 border border-red-500/20">
                                <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" /> تقييم الأثر
                                </h4>
                                <div className="flex items-center gap-3">
                                  <Badge className={`${severityColor(detail.aiSeverity || 'high')} text-xs`}>
                                    {aiAnalysis.impact_assessment || severityLabel(detail.aiSeverity || '')}
                                  </Badge>
                                  {aiAnalysis.impact_assessment_en && (
                                    <span className="text-[10px] text-muted-foreground">{aiAnalysis.impact_assessment_en}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            {aiRecommendations.length > 0 && (
                              <div className="bg-teal-500/5 rounded-xl p-4 border border-teal-500/20">
                                <h4 className="text-xs font-semibold text-teal-400 mb-3">التوصيات</h4>
                                <div className="space-y-2">
                                  {aiRecommendations.map((rec: string, i: number) => (
                                    <div key={i} className="flex items-start gap-2">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 mt-0.5 shrink-0" />
                                      <p className="text-xs text-foreground">{rec}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* PDPL Analysis */}
                            {(pdplAnalysis.violated_articles || pdplAnalysis.risk_level) && (
                              <div className="bg-amber-500/5 rounded-xl p-4 border border-amber-500/20">
                                <h4 className="text-xs font-semibold text-amber-400 mb-3 flex items-center gap-1.5">
                                  <Scale className="w-3.5 h-3.5" /> تحليل نظام حماية البيانات الشخصية (PDPL)
                                </h4>
                                <div className="space-y-2">
                                  {pdplAnalysis.violated_articles && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">المواد المنتهكة</span>
                                      <span className="text-sm text-amber-400 font-medium">{pdplAnalysis.violated_articles}</span>
                                    </div>
                                  )}
                                  {pdplAnalysis.estimated_fine_sar && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">الغرامة المقدرة (ريال)</span>
                                      <span className="text-sm text-red-400 font-bold">{pdplAnalysis.estimated_fine_sar}</span>
                                    </div>
                                  )}
                                  {pdplAnalysis.risk_level && (
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs text-muted-foreground">مستوى المخاطر</span>
                                      <Badge variant="outline" className="text-[10px] border-red-500/30 text-red-400">{pdplAnalysis.risk_level}</Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {(detail.enrichedAt || aiAnalysis.analysis_date) && (
                              <p className="text-[10px] text-muted-foreground text-center">
                                تاريخ التحليل: {aiAnalysis.analysis_date || (detail.enrichedAt ? new Date(detail.enrichedAt).toLocaleDateString("ar-SA") : "")}
                              </p>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-12 text-muted-foreground">
                            <Brain className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">لم يتم إثراء حالة الرصد بالذكاء الاصطناعي بعد</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ═══ SOURCES & EVIDENCE TAB ═══ */}
                    {activeTab === "evidence" && (
                      <div className="space-y-4">
                        {/* Sources List */}
                        {sourcesInfo.length > 0 && (
                          <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                            <h4 className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" /> المصادر ({sourcesInfo.length})
                            </h4>
                            <div className="space-y-2">
                              {sourcesInfo.map((src: { name: string; url: string }, i: number) => (
                                <a key={i} href={src.url} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50 hover:bg-secondary/80 border border-border/30 transition-colors group">
                                  <div className="p-1.5 rounded-lg bg-primary/10">
                                    <ExternalLink className="w-3 h-3 text-primary" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-foreground">{src.name}</p>
                                    <p className="text-[10px] text-muted-foreground truncate" dir="ltr">{src.url}</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evidence Images */}
                        {allEvidenceImages.length > 0 && (
                          <>
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                              <Image className="w-3.5 h-3.5" /> صور الأدلة ({allEvidenceImages.length})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {allEvidenceImages.map((url: string, i: number) => (
                                <div
                                  key={i}
                                  className="rounded-lg overflow-hidden border border-border bg-secondary/30 cursor-pointer hover:border-primary/50 transition-all group"
                                  onClick={() => setLightboxUrl(url)}
                                >
                                  <img
                                    src={url}
                                    alt={`Evidence ${i + 1}`}
                                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                  />
                                  <div className="p-2 flex items-center justify-between">
                                    <span className="text-[10px] text-muted-foreground">دليل #{i + 1}</span>
                                    <span className="text-[10px] text-primary flex items-center gap-1">
                                      <Eye className="w-3 h-3" /> اضغط للتكبير
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}

                        {/* Evidence Chain */}
                        {evidence.length > 0 && (
                          <>
                            <h4 className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 mt-4">
                              <Hash className="w-3.5 h-3.5" /> سلسلة الأدلة الرقمية ({evidence.length})
                            </h4>
                            <div className="overflow-x-auto rounded-lg border border-border">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-secondary/50">
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border">#</th>
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border">النوع</th>
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border">بصمة المحتوى</th>
                                    <th className="p-2.5 text-right font-medium text-muted-foreground border-b border-border">التاريخ</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {evidence.map((e: any, i: number) => (
                                    <tr key={i} className="border-b border-border/50 hover:bg-secondary/30">
                                      <td className="p-2.5 text-muted-foreground">{e.blockIndex}</td>
                                      <td className="p-2.5 text-foreground">{e.evidenceType}</td>
                                      <td className="p-2.5 font-mono text-indigo-400 text-[10px]">{e.contentHash?.substring(0, 24)}...</td>
                                      <td className="p-2.5 text-foreground">{new Date(e.createdAt).toLocaleDateString("ar-SA")}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        )}

                        {allEvidenceImages.length === 0 && evidence.length === 0 && sourcesInfo.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Shield className="w-8 h-8 mx-auto mb-3 opacity-30" />
                            <p className="text-sm">لا توجد أدلة أو مصادر متاحة لحالة الرصد هذه</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Warning */}
      <ComplianceWarningDialog
        open={showComplianceWarning}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setShowComplianceWarning(false)}
        reportType="توثيق حالة الرصد"
      />

      {/* Screenshot Lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="relative max-w-4xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setLightboxUrl(null)} className="absolute -top-10 left-0 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                <X className="w-5 h-5 text-white" />
              </button>
              <img src={lightboxUrl} alt="Evidence Screenshot" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl border border-white/10 object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

```

---

## `client/src/components/LiveGuideOverlay.tsx`

```tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, MapPin, CheckCircle2 } from "lucide-react";

/**
 * LiveGuideOverlay — تراكب الدليل المباشر (UI-14, UI-15)
 * يعرض خطوات الدليل الاسترشادي داخل الواجهة مع إضاءة العناصر
 */

export interface GuideStep {
  stepOrder: number;
  route: string;
  selector?: string;
  stepText: string;
  actionType: "click" | "type" | "select" | "scroll" | "wait" | "observe";
  highlightType: "border" | "overlay" | "pulse" | "arrow";
}

interface LiveGuideOverlayProps {
  isActive: boolean;
  guideTitle: string;
  steps: GuideStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onClose: () => void;
  onComplete: () => void;
}

export default function LiveGuideOverlay({
  isActive,
  guideTitle,
  steps,
  currentStep,
  onStepChange,
  onClose,
  onComplete,
}: LiveGuideOverlayProps) {
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Highlight the target element
  useEffect(() => {
    if (!isActive || !step?.selector) {
      setHighlightRect(null);
      return;
    }

    const el = document.querySelector(step.selector);
    if (el) {
      const rect = el.getBoundingClientRect();
      setHighlightRect(rect);
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Add highlight class
      el.classList.add("guide-highlight-active");
      return () => {
        el.classList.remove("guide-highlight-active");
      };
    } else {
      setHighlightRect(null);
    }
  }, [isActive, step, currentStep]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      onComplete();
    } else {
      onStepChange(currentStep + 1);
    }
  }, [currentStep, isLastStep, onComplete, onStepChange]);

  const handlePrev = useCallback(() => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  }, [currentStep, onStepChange]);

  if (!isActive || !step) return null;

  return (
    <AnimatePresence>
      <div ref={overlayRef} className="fixed inset-0 z-[250] pointer-events-none">
        {/* Semi-transparent overlay with cutout for highlighted element */}
        {highlightRect && (
          <svg className="absolute inset-0 w-full h-full pointer-events-auto">
            <defs>
              <mask id="guide-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={highlightRect.x - 8}
                  y={highlightRect.y - 8}
                  width={highlightRect.width + 16}
                  height={highlightRect.height + 16}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.5)"
              mask="url(#guide-mask)"
            />
            {/* Highlight border */}
            <rect
              x={highlightRect.x - 8}
              y={highlightRect.y - 8}
              width={highlightRect.width + 16}
              height={highlightRect.height + 16}
              rx="8"
              fill="none"
              stroke="#C5A55A"
              strokeWidth="2"
              className="animate-pulse"
            />
          </svg>
        )}

        {/* Step card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90vw] max-w-lg pointer-events-auto"
          style={{
            background: "linear-gradient(135deg, rgba(15, 40, 71, 0.98), rgba(11, 29, 53, 0.99))",
            border: "1px solid rgba(197, 165, 90, 0.25)",
            borderRadius: "16px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          }}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#C5A55A]" />
              <span className="text-xs font-medium text-[#D4DDEF]">{guideTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#D4DDEF]/50">
                {currentStep + 1} / {steps.length}
              </span>
              <button
                onClick={onClose}
                className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-white/5"
              >
                <X className="h-3 w-3 text-[#D4DDEF]/40" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/5">
            <div
              className="h-full bg-gradient-to-l from-[#C5A55A] to-[#b8963f] transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Step content */}
          <div className="p-5">
            <p className="text-sm text-[#D4DDEF] leading-relaxed">{step.stepText}</p>
            {step.actionType !== "observe" && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A55A]/10 text-[#C5A55A]">
                  {step.actionType === "click" ? "انقر" :
                   step.actionType === "type" ? "اكتب" :
                   step.actionType === "select" ? "اختر" :
                   step.actionType === "scroll" ? "مرر" :
                   step.actionType === "wait" ? "انتظر" : "لاحظ"}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-xs text-[#D4DDEF]/60 hover:text-[#D4DDEF] disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors"
              style={{
                background: isLastStep
                  ? "linear-gradient(135deg, #10b981, #059669)"
                  : "linear-gradient(135deg, #C5A55A, #b8963f)",
                color: "white",
              }}
            >
              {isLastStep ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  إنهاء
                </>
              ) : (
                <>
                  التالي
                  <ChevronLeft className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

```

---

## `client/src/components/ManusDialog.tsx`

```tsx
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";

interface ManusDialogProps {
  title?: string;
  logo?: string;
  open?: boolean;
  onLogin: () => void;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

export function ManusDialog({
  title,
  logo,
  open = false,
  onLogin,
  onOpenChange,
  onClose,
}: ManusDialogProps) {
  const [internalOpen, setInternalOpen] = useState(open);

  useEffect(() => {
    if (!onOpenChange) {
      setInternalOpen(open);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(nextOpen);
    } else {
      setInternalOpen(nextOpen);
    }

    if (!nextOpen) {
      onClose?.();
    }
  };

  return (
    <Dialog
      open={onOpenChange ? open : internalOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent className="py-5 bg-[#f8f8f7] rounded-[20px] w-[calc(100vw-2rem)] sm:w-[400px] max-w-[400px] shadow-[0px_4px_11px_0px_rgba(0,0,0,0.08)] border border-[rgba(0,0,0,0.08)] backdrop-blur-2xl p-0 gap-0 text-center">
        <div className="flex flex-col items-center gap-2 p-5 pt-12">
          {logo ? (
            <div className="w-16 h-16 bg-white rounded-xl border border-[rgba(0,0,0,0.08)] flex items-center justify-center">
              <img
                src={logo}
                alt="Dialog graphic"
                className="w-10 h-10 rounded-md"
              />
            </div>
          ) : null}

          {/* Title and subtitle */}
          {title ? (
            <DialogTitle className="text-xl font-semibold text-[#34322d] leading-[26px] tracking-[-0.44px]">
              {title}
            </DialogTitle>
          ) : null}
          <DialogDescription className="text-sm text-[#858481] leading-5 tracking-[-0.154px]">
            Please login with Manus to continue
          </DialogDescription>
        </div>

        <DialogFooter className="px-5 py-5">
          {/* Login button */}
          <Button
            onClick={onLogin}
            className="w-full h-10 bg-[#1a1a19] hover:bg-[#1a1a19]/90 text-white rounded-[10px] text-sm font-medium leading-5 tracking-[-0.154px]"
          >
            Login with Manus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

```

---

## `client/src/components/Map.tsx`

```tsx
/**
 * GOOGLE MAPS FRONTEND INTEGRATION - ESSENTIAL GUIDE
 *
 * USAGE FROM PARENT COMPONENT:
 * ======
 *
 * const mapRef = useRef<google.maps.Map | null>(null);
 *
 * <MapView
 *   initialCenter={{ lat: 40.7128, lng: -74.0060 }}
 *   initialZoom={15}
 *   onMapReady={(map) => {
 *     mapRef.current = map; // Store to control map from parent anytime, google map itself is in charge of the re-rendering, not react state.
 * </MapView>
 *
 * ======
 * Available Libraries and Core Features:
 * -------------------------------
 * 📍 MARKER (from `marker` library)
 * - Attaches to map using { map, position }
 * new google.maps.marker.AdvancedMarkerElement({
 *   map,
 *   position: { lat: 37.7749, lng: -122.4194 },
 *   title: "San Francisco",
 * });
 *
 * -------------------------------
 * 🏢 PLACES (from `places` library)
 * - Does not attach directly to map; use data with your map manually.
 * const place = new google.maps.places.Place({ id: PLACE_ID });
 * await place.fetchFields({ fields: ["displayName", "location"] });
 * map.setCenter(place.location);
 * new google.maps.marker.AdvancedMarkerElement({ map, position: place.location });
 *
 * -------------------------------
 * 🧭 GEOCODER (from `geocoding` library)
 * - Standalone service; manually apply results to map.
 * const geocoder = new google.maps.Geocoder();
 * geocoder.geocode({ address: "New York" }, (results, status) => {
 *   if (status === "OK" && results[0]) {
 *     map.setCenter(results[0].geometry.location);
 *     new google.maps.marker.AdvancedMarkerElement({
 *       map,
 *       position: results[0].geometry.location,
 *     });
 *   }
 * });
 *
 * -------------------------------
 * 📐 GEOMETRY (from `geometry` library)
 * - Pure utility functions; not attached to map.
 * const dist = google.maps.geometry.spherical.computeDistanceBetween(p1, p2);
 *
 * -------------------------------
 * 🛣️ ROUTES (from `routes` library)
 * - Combines DirectionsService (standalone) + DirectionsRenderer (map-attached)
 * const directionsService = new google.maps.DirectionsService();
 * const directionsRenderer = new google.maps.DirectionsRenderer({ map });
 * directionsService.route(
 *   { origin, destination, travelMode: "DRIVING" },
 *   (res, status) => status === "OK" && directionsRenderer.setDirections(res)
 * );
 *
 * -------------------------------
 * 🌦️ MAP LAYERS (attach directly to map)
 * - new google.maps.TrafficLayer().setMap(map);
 * - new google.maps.TransitLayer().setMap(map);
 * - new google.maps.BicyclingLayer().setMap(map);
 *
 * -------------------------------
 * ✅ SUMMARY
 * - “map-attached” → AdvancedMarkerElement, DirectionsRenderer, Layers.
 * - “standalone” → Geocoder, DirectionsService, DistanceMatrixService, ElevationService.
 * - “data-only” → Place, Geometry utilities.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadMapScript() {
  return new Promise(resolve => {
    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=marker,places,geocoding,geometry`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve(null);
      script.remove(); // Clean up immediately
    };
    script.onerror = () => {
      console.error("Failed to load Google Maps script");
    };
    document.head.appendChild(script);
  });
}

interface MapViewProps {
  className?: string;
  initialCenter?: google.maps.LatLngLiteral;
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.7749, lng: -122.4194 },
  initialZoom = 12,
  onMapReady,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);

  const init = usePersistFn(async () => {
    await loadMapScript();
    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }
    map.current = new window.google.maps.Map(mapContainer.current, {
      zoom: initialZoom,
      center: initialCenter,
      mapTypeControl: true,
      fullscreenControl: true,
      zoomControl: true,
      streetViewControl: true,
      mapId: "DEMO_MAP_ID",
    });
    if (onMapReady) {
      onMapReady(map.current);
    }
  });

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}

```

---

## `client/src/components/MonthlyComparison.tsx`

```tsx
/**
 * MonthlyComparison — Month-over-Month comparison panel
 * Shows visual comparison between current and previous month metrics
 * with animated bars, delta indicators, and mini sparklines
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUp,
  ArrowDown,
  Minus,
  TrendingUp,
  TrendingDown,
  Calendar,
  BarChart3,
  ShieldAlert,
  Database,
  Radio,
  Globe,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  Zap,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";

/* ═══ Helpers ═══ */
function calcDelta(current: number, previous: number): { value: number; percent: number; direction: "up" | "down" | "same" } {
  const diff = current - previous;
  const percent = previous === 0 ? (current > 0 ? 100 : 0) : Math.round((diff / previous) * 100);
  return {
    value: Math.abs(diff),
    percent: Math.abs(percent),
    direction: diff > 0 ? "up" : diff < 0 ? "down" : "same",
  };
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
}

/* ═══ Delta Badge ═══ */
function DeltaBadge({ current, previous, inverse = false }: { current: number; previous: number; inverse?: boolean }) {
  const delta = calcDelta(current, previous);
  // For leaks, "up" is bad (red), "down" is good (green)
  // For resolved, "up" is good (green), "down" is bad (red) - use inverse
  const isPositive = inverse ? delta.direction === "up" : delta.direction === "down";
  const isNegative = inverse ? delta.direction === "down" : delta.direction === "up";

  if (delta.direction === "same") {
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded-full">
        <Minus className="w-3 h-3" /> 0%
      </span>
    );
  }

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
        isPositive
          ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
          : isNegative
          ? "text-red-400 bg-red-500/10 border border-red-500/20"
          : "text-slate-400 bg-slate-500/10"
      }`}
    >
      {delta.direction === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
      {delta.percent}%
    </motion.span>
  );
}

/* ═══ Comparison Bar ═══ */
function ComparisonBar({ label, current, previous, icon: Icon, color }: {
  label: string; current: number; previous: number; icon: React.ElementType; color: string;
}) {
  const max = Math.max(current, previous, 1);
  const currentPct = (current / max) * 100;
  const prevPct = (previous / max) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-medium text-foreground">{label}</span>
        </div>
        <DeltaBadge current={current} previous={previous} />
      </div>
      <div className="space-y-1.5">
        {/* Current month bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-16 text-left">الحالي</span>
          <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${currentPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-l from-cyan-500 to-blue-500 relative"
            >
              <div className="absolute inset-0 bg-white/10 rounded-full" />
            </motion.div>
          </div>
          <span className="text-xs font-bold text-foreground w-12 text-left tabular-nums">{formatNumber(current)}</span>
        </div>
        {/* Previous month bar */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-16 text-left">السابق</span>
          <div className="flex-1 h-5 bg-muted/30 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${prevPct}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="h-full rounded-full bg-gradient-to-l from-slate-400 to-slate-500 relative opacity-60"
            >
              <div className="absolute inset-0 bg-white/5 rounded-full" />
            </motion.div>
          </div>
          <span className="text-xs font-medium text-muted-foreground w-12 text-left tabular-nums">{formatNumber(previous)}</span>
        </div>
      </div>
    </div>
  );
}

/* ═══ Mini Sparkline ═══ */
function MiniSparkline({ data, color = "#3DB1AC", height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const width = 200;
  const points = data.map((v, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - (v / max) * (height - 4),
  }));
  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sparkGrad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sparkGrad-${color.replace("#", "")})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point dot */}
      {points.length > 0 && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3" fill={color} />
      )}
    </svg>
  );
}

/* ═══ Sector Comparison ═══ */
function SectorComparison({ currentSectors, prevSectors }: {
  currentSectors: { sector: string | null; count: number }[];
  prevSectors: { sector: string | null; count: number }[];
}) {
  const allSectors = useMemo(() => {
    const sectorMap = new Map<string, { current: number; previous: number }>();
    currentSectors.forEach(s => {
      const name = s.sector || "غير محدد";
      sectorMap.set(name, { current: s.count, previous: 0 });
    });
    prevSectors.forEach(s => {
      const name = s.sector || "غير محدد";
      const existing = sectorMap.get(name) || { current: 0, previous: 0 };
      existing.previous = s.count;
      sectorMap.set(name, existing);
    });
    return Array.from(sectorMap.entries())
      .sort((a, b) => (b[1].current + b[1].previous) - (a[1].current + a[1].previous))
      .slice(0, 6);
  }, [currentSectors, prevSectors]);

  const maxVal = Math.max(...allSectors.map(([, v]) => Math.max(v.current, v.previous)), 1);

  return (
    <div className="space-y-3">
      {allSectors.map(([sector, vals], idx) => (
        <motion.div
          key={sector}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-3"
        >
          <span className="text-[11px] text-muted-foreground w-24 truncate text-left" title={sector}>
            {sector}
          </span>
          <div className="flex-1 flex items-center gap-1">
            {/* Current bar */}
            <div className="flex-1 h-4 bg-muted/20 rounded-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(vals.current / maxVal) * 100}%` }}
                transition={{ duration: 0.6, delay: idx * 0.05 }}
                className="h-full bg-gradient-to-l from-cyan-500 to-blue-500 rounded-sm"
              />
            </div>
            {/* Previous bar (faded) */}
            <div className="flex-1 h-4 bg-muted/20 rounded-sm overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(vals.previous / maxVal) * 100}%` }}
                transition={{ duration: 0.6, delay: idx * 0.05 + 0.1 }}
                className="h-full bg-gradient-to-l from-slate-400 to-slate-500 rounded-sm opacity-50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 w-20">
            <span className="text-[10px] font-bold text-cyan-400 tabular-nums">{vals.current}</span>
            <span className="text-[10px] text-muted-foreground/40">/</span>
            <span className="text-[10px] text-muted-foreground tabular-nums">{vals.previous}</span>
            <DeltaBadge current={vals.current} previous={vals.previous} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ═══ Main Component ═══ */
export default function MonthlyComparison() {
  const { data, isLoading } = trpc.dashboard.monthlyComparison.useQuery();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-muted/30 rounded w-48 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-muted/20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const emptyMonth = {
    totalLeaks: 0, totalRecords: 0, criticalCount: 0,
    newCount: 0, resolvedCount: 0,
    telegramCount: 0, darkwebCount: 0, pasteCount: 0,
    name: '', nameEn: '', year: 0,
    sectors: [] as any[], daily: [] as any[],
  };
  const currentMonth = data?.currentMonth ?? emptyMonth;
  const previousMonth = data?.previousMonth ?? emptyMonth;

  // KPI comparison cards
  const kpiItems = [
    {
      label: "إجمالي حالات الرصد",
      labelEn: "Total Leaks",
      current: currentMonth.totalLeaks,
      previous: previousMonth.totalLeaks,
      icon: ShieldAlert,
      color: "text-red-400 bg-red-500/10",
    },
    {
      label: "العدد المُدّعى",
      labelEn: "Exposed Records",
      current: currentMonth.totalRecords,
      previous: previousMonth.totalRecords,
      icon: Database,
      color: "text-amber-400 bg-amber-500/10",
    },
    {
      label: "حالات رصد واسعة النطاق",
      labelEn: "Critical Incidents",
      current: currentMonth.criticalCount,
      previous: previousMonth.criticalCount,
      icon: Zap,
      color: "text-red-400 bg-red-500/10",
    },
    {
      label: "تم حلها",
      labelEn: "Resolved",
      current: currentMonth.resolvedCount,
      previous: previousMonth.resolvedCount,
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-500/10",
      inverse: true,
    },
  ];

  // Source comparison
  const sourceItems = [
    { label: "تيليجرام", current: currentMonth.telegramCount, previous: previousMonth.telegramCount, icon: Radio, color: "text-blue-400 bg-blue-500/10" },
    { label: "الويب المظلم", current: currentMonth.darkwebCount, previous: previousMonth.darkwebCount, icon: Globe, color: "text-purple-400 bg-purple-500/10" },
    { label: "مواقع اللصق", current: currentMonth.pasteCount, previous: previousMonth.pasteCount, icon: FileText, color: "text-yellow-400 bg-yellow-500/10" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between"
        style={{ background: isDark ? "rgba(13, 21, 41, 0.5)" : "rgba(22, 42, 84, 0.03)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/20">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">المقارنة الشهرية</h3>
            <p className="text-[11px] text-muted-foreground">
              {currentMonth.name} {currentMonth.year} مقابل {previousMonth.name} {previousMonth.year}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className="w-3 h-1.5 rounded-full bg-gradient-to-l from-cyan-500 to-blue-500" />
            <span className="text-muted-foreground">{currentMonth.name}</span>
          </span>
          <span className="flex items-center gap-1.5 text-[10px]">
            <span className="w-3 h-1.5 rounded-full bg-slate-400/50" />
            <span className="text-muted-foreground">{previousMonth.name}</span>
          </span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpiItems.map((item, idx) => {
            const delta = calcDelta(item.current, item.previous);
            const Icon = item.icon;
            return (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="glass-card rounded-xl p-4 border border-border/50 hover:border-primary/20 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <DeltaBadge current={item.current} previous={item.previous} inverse={item.inverse} />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-foreground tabular-nums">{formatNumber(item.current)}</p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    {item.label}
                    <span className="text-muted-foreground/40">|</span>
                    <span className="tabular-nums">{formatNumber(item.previous)} سابقاً</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Source Comparison Bars */}
        <div>
          <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" />
            مقارنة المصادر
          </h4>
          <div className="space-y-4">
            {sourceItems.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <ComparisonBar {...item} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Trend Sparklines */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                {currentMonth.name} - النشاط اليومي
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {currentMonth.daily.length} يوم
              </span>
            </div>
            <MiniSparkline data={currentMonth.daily.map(d => d.count)} color="#3DB1AC" height={50} />
          </div>
          <div className="glass-card rounded-xl p-4 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground flex items-center gap-2">
                <TrendingDown className="w-3.5 h-3.5 text-slate-400" />
                {previousMonth.name} - النشاط اليومي
              </span>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {previousMonth.daily.length} يوم
              </span>
            </div>
            <MiniSparkline data={previousMonth.daily.map(d => d.count)} color="#94A3B8" height={50} />
          </div>
        </div>

        {/* Sector Comparison */}
        <div>
          <h4 className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            مقارنة القطاعات
            <span className="text-[10px] text-muted-foreground/50 font-normal">(الحالي / السابق)</span>
          </h4>
          <SectorComparison currentSectors={currentMonth.sectors} prevSectors={previousMonth.sectors} />
        </div>

        {/* Overall Summary */}
        <div className="glass-card rounded-xl p-4 border border-border/50"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(61, 177, 172, 0.05), rgba(59, 130, 246, 0.05))"
              : "linear-gradient(135deg, rgba(22, 42, 84, 0.03), rgba(61, 177, 172, 0.03))",
          }}
        >
          <div className="flex items-center gap-3">
            {(() => {
              const leakDelta = calcDelta(currentMonth.totalLeaks, previousMonth.totalLeaks);
              const isImproving = leakDelta.direction === "down";
              return (
                <>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isImproving ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                  }`}>
                    {isImproving ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">
                      {isImproving
                        ? `تحسن بنسبة ${leakDelta.percent}% في عدد حالات الرصد`
                        : leakDelta.direction === "up"
                        ? `ارتفاع بنسبة ${leakDelta.percent}% في عدد حالات الرصد`
                        : "لا تغيير في عدد حالات الرصد"}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {currentMonth.name}: {currentMonth.totalLeaks} حالة رصد ({formatNumber(currentMonth.totalRecords)} سجل)
                      {" · "}
                      {previousMonth.name}: {previousMonth.totalLeaks} حالة رصد ({formatNumber(previousMonth.totalRecords)} سجل)
                    </p>
                  </div>
                  <div className={`text-2xl font-bold tabular-nums ${
                    isImproving ? "text-emerald-400" : leakDelta.direction === "up" ? "text-red-400" : "text-slate-400"
                  }`}>
                    {leakDelta.direction === "up" ? "+" : leakDelta.direction === "down" ? "-" : ""}{leakDelta.value}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

```

---

## `client/src/components/NavigationConsentDialog.tsx`

```tsx
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

```

---

## `client/src/components/NotificationBadge.tsx`

```tsx
/**
 * NotificationBadge — Ultra Premium animated badge with urgency levels
 * Adapted from design.rasid.vip reference
 */
import { motion } from "framer-motion";

interface NotificationBadgeProps {
  count: number;
  urgency?: "normal" | "warning" | "critical";
  showRipple?: boolean;
  size?: "sm" | "md" | "lg";
}

const URGENCY_COLORS = {
  normal: {
    bg: "rgba(74, 122, 181, 0.18)",
    text: "#4A7AB5",
    ring: "rgba(74, 122, 181, 0.3)",
  },
  warning: {
    bg: "rgba(255, 193, 7, 0.18)",
    text: "#FFC107",
    ring: "rgba(255, 193, 7, 0.3)",
  },
  critical: {
    bg: "rgba(235, 61, 99, 0.18)",
    text: "#EB3D63",
    ring: "rgba(235, 61, 99, 0.3)",
  },
};

const SIZES = {
  sm: { badge: "min-w-[16px] h-[16px] text-[9px] px-1", offset: "-top-1 -left-1" },
  md: { badge: "min-w-[20px] h-[20px] text-[10px] px-1.5", offset: "-top-1.5 -left-1.5" },
  lg: { badge: "min-w-[24px] h-[24px] text-[11px] px-2", offset: "-top-2 -left-2" },
};

export default function NotificationBadge({
  count,
  urgency = "normal",
  showRipple = false,
  size = "sm",
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const colors = URGENCY_COLORS[urgency];
  const sizeConfig = SIZES[size];
  const displayCount = count > 99 ? "99+" : count;

  return (
    <div className={`absolute ${sizeConfig.offset} z-10`}>
      {/* Ripple effect for critical/active */}
      {showRipple && urgency === "critical" && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: colors.ring }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.4, 0, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Badge */}
      <motion.span
        className={`
          relative flex items-center justify-center rounded-full font-bold
          ${sizeConfig.badge}
        `}
        style={{
          background: colors.bg,
          color: colors.text,
          boxShadow: `0 0 8px ${colors.ring}`,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
      >
        {displayCount}
      </motion.span>
    </div>
  );
}

```

---

## `client/src/components/NotificationBell.tsx`

```tsx
/**
 * NotificationBell — Enhanced Real-time notification bell with:
 * - Sound alerts based on severity level (critical/high/medium/low)
 * - Filter tabs for notification types
 * - Animated bell shake on new critical notifications
 * - Severity badge indicators with color coding
 * - Browser Push Notification support
 * - Grouped notifications by date
 */
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  AlertTriangle,
  ShieldAlert,
  ScanSearch,
  Clock,
  Info,
  Volume2,
  VolumeX,
  Filter,
  Trash2,
  BellRing,
  Shield,
  Zap,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useWebSocket, type WsNotification } from "@/hooks/useWebSocket";
import { toast } from "sonner";

/* ═══ Type & Severity Maps ═══ */
const typeIcons: Record<string, React.ElementType> = {
  new_leak: ShieldAlert,
  status_change: AlertTriangle,
  scan_complete: ScanSearch,
  job_complete: Clock,
  system: Info,
};

const typeLabels: Record<string, string> = {
  new_leak: "حالة رصد جديدة",
  status_change: "تغيير حالة",
  scan_complete: "اكتمال فحص",
  job_complete: "اكتمال مهمة",
  system: "نظام",
};

const severityConfig: Record<string, {
  text: string; bg: string; border: string; label: string; labelEn: string; glow: string;
}> = {
  critical: {
    text: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30",
    label: "حرج", labelEn: "Critical", glow: "rgba(239, 68, 68, 0.3)",
  },
  high: {
    text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30",
    label: "عالي", labelEn: "High", glow: "rgba(245, 158, 11, 0.3)",
  },
  medium: {
    text: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30",
    label: "متوسط", labelEn: "Medium", glow: "rgba(234, 179, 8, 0.2)",
  },
  low: {
    text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30",
    label: "منخفض", labelEn: "Low", glow: "rgba(59, 130, 246, 0.2)",
  },
  info: {
    text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30",
    label: "معلومات", labelEn: "Info", glow: "rgba(6, 182, 212, 0.2)",
  },
};

/* ═══ Sound Alert System ═══ */
const audioContextRef = { current: null as AudioContext | null };

function getAudioContext(): AudioContext {
  if (!audioContextRef.current) {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContextRef.current;
}

function playAlertSound(severity: string) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different sounds for different severity levels
    switch (severity) {
      case "critical":
        // Urgent alarm: rapid beeps
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.5);
        break;
      case "high":
        // Warning: two-tone alert
        oscillator.type = "sawtooth";
        oscillator.frequency.setValueAtTime(660, ctx.currentTime);
        oscillator.frequency.setValueAtTime(440, ctx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.35);
        break;
      case "medium":
        // Notification: gentle ding
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(523, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.25);
        break;
      default:
        // Info: soft chime
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }
  } catch {
    // Audio not supported or blocked
  }
}

/* ═══ Browser Push Notifications ═══ */
function requestPushPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title: string, body: string, severity: string) {
  if ("Notification" in window && Notification.permission === "granted") {
    const icon = severity === "critical" ? "🚨" : severity === "high" ? "⚠️" : "🔔";
    new Notification(`${icon} ${title}`, {
      body,
      tag: `rasid-${Date.now()}`,
      requireInteraction: severity === "critical",
    });
  }
}

/* ═══ Time Helpers ═══ */
function timeAgo(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 172800) return "أمس";
  return `منذ ${Math.floor(diff / 86400)} يوم`;
}

function getDateGroup(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return "أخرى";
  const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diff === 0) return "اليوم";
  if (diff === 1) return "أمس";
  if (diff < 7) return "هذا الأسبوع";
  return "أقدم";
}

/* ═══ Filter Tabs ═══ */
const filterTabs = [
  { id: "all", label: "الكل", icon: Bell },
  { id: "critical", label: "حرج", icon: Zap },
  { id: "new_leak", label: "حالات رصد", icon: ShieldAlert },
  { id: "system", label: "نظام", icon: Shield },
];

/* ═══ Main Component ═══ */
export default function NotificationBell({ userId }: { userId?: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isShaking, setIsShaking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  // Real-time WebSocket notifications
  const { isConnected, lastNotification } = useWebSocket(userId);

  // Request push permission on mount
  useEffect(() => {
    requestPushPermission();
  }, []);

  // tRPC queries
  const { data: dbNotifications, refetch: refetchNotifications } = trpc.notifications.list.useQuery(
    { limit: 50 },
    { refetchInterval: 30000 }
  );
  const { data: unreadCount, refetch: refetchCount } = trpc.notifications.unreadCount.useQuery(
    undefined,
    { refetchInterval: 15000 }
  );
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
    },
  });
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      refetchNotifications();
      refetchCount();
    },
  });

  // Handle new real-time notifications with sound and browser push
  useEffect(() => {
    if (lastNotification) {
      const Icon = typeIcons[lastNotification.type] || Info;
      const severity = lastNotification.severity || "info";
      const config = severityConfig[severity] || severityConfig.info;

      // Show toast
      toast(lastNotification.titleAr || lastNotification.title, {
        description: lastNotification.messageAr || lastNotification.message,
        icon: <Icon className={`w-4 h-4 ${config.text}`} />,
        duration: severity === "critical" ? 10000 : 6000,
        className: severity === "critical" ? "border-red-500/30 bg-red-500/5" : undefined,
      });

      // Play sound
      if (soundEnabled) {
        playAlertSound(severity);
      }

      // Browser push notification for critical/high
      if (severity === "critical" || severity === "high") {
        showBrowserNotification(
          lastNotification.titleAr || lastNotification.title || "",
          lastNotification.messageAr || lastNotification.message || "",
          severity
        );
      }

      // Shake bell for critical
      if (severity === "critical" || severity === "high") {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 2000);
      }

      refetchNotifications();
      refetchCount();
    }
  }, [lastNotification, soundEnabled]);

  // Detect count increase and shake bell
  useEffect(() => {
    const count = unreadCount ?? 0;
    if (count > prevCountRef.current && prevCountRef.current > 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 1500);
    }
    prevCountRef.current = count;
  }, [unreadCount]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const count = unreadCount ?? 0;
  const allNotifications = dbNotifications ?? [];

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    if (activeFilter === "all") return allNotifications;
    if (activeFilter === "critical") return allNotifications.filter((n: any) => n.severity === "critical" || n.severity === "high");
    return allNotifications.filter((n: any) => n.type === activeFilter);
  }, [allNotifications, activeFilter]);

  // Group by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, typeof filteredNotifications> = {};
    filteredNotifications.forEach((n: any) => {
      const group = getDateGroup(n.createdAt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(n);
    });
    return groups;
  }, [filteredNotifications]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button with shake animation */}
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <motion.div
          animate={isShaking ? {
            rotate: [0, -15, 15, -10, 10, -5, 5, 0],
            scale: [1, 1.1, 1.1, 1.05, 1.05, 1, 1, 1],
          } : {}}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {isShaking ? <BellRing className="w-4 h-4 text-red-400" /> : <Bell className="w-4 h-4" />}
        </motion.div>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
            style={{ boxShadow: "0 0 8px rgba(239, 68, 68, 0.4)" }}
          >
            {count > 99 ? "99+" : count}
          </motion.span>
        )}
        {/* Connection indicator */}
        <span
          className={`absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full transition-colors ${
            isConnected ? "bg-emerald-500" : "bg-zinc-400"
          }`}
          title={isConnected ? "متصل" : "غير متصل"}
        />
      </Button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 sm:left-0 right-0 sm:right-auto top-12 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[70vh] sm:max-h-[560px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50"
            style={{ backdropFilter: "blur(20px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/95">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bell className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">الإشعارات</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {isConnected ? "متصل مباشرة" : "غير متصل"} · {count} غير مقروء
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {/* Sound toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? "كتم الصوت" : "تفعيل الصوت"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </Button>
                {count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                    onClick={() => markAllReadMutation.mutate()}
                  >
                    <CheckCheck className="w-3 h-3" />
                    قراءة الكل
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 px-3 py-2 border-b border-border/50 bg-card/80 overflow-x-auto">
              {filterTabs.map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:bg-accent/50 border border-transparent"
                    }`}
                  >
                    <TabIcon className="w-3 h-3" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Notification list */}
            <div className="overflow-y-auto max-h-[420px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Bell className="w-10 h-10 mb-3 opacity-20" />
                  </motion.div>
                  <p className="text-sm font-medium">لا توجد إشعارات</p>
                  <p className="text-xs mt-1 text-muted-foreground/60">
                    {activeFilter !== "all" ? "جرب تغيير الفلتر" : "ستظهر الإشعارات هنا عند رصد حالات جديدة"}
                  </p>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([group, notifications]) => (
                  <div key={group}>
                    {/* Date group header */}
                    <div className="sticky top-0 z-10 px-4 py-1.5 bg-card/95 backdrop-blur-sm border-b border-border/30">
                      <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">{group}</span>
                    </div>
                    {(notifications as any[]).map((notif: any) => {
                      const Icon = typeIcons[notif.type] || Info;
                      const config = severityConfig[notif.severity] || severityConfig.info;
                      return (
                        <motion.div
                          key={notif.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-border/30 hover:bg-accent/30 transition-all cursor-pointer group ${
                            !notif.isRead ? "bg-primary/5" : ""
                          }`}
                          onClick={() => {
                            if (!notif.isRead) {
                              markReadMutation.mutate({ notificationId: notif.id });
                            }
                          }}
                        >
                          {/* Icon with severity glow */}
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} border ${config.border}`}
                            style={!notif.isRead ? { boxShadow: `0 0 12px ${config.glow}` } : {}}
                          >
                            <Icon className={`w-4 h-4 ${config.text}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className={`text-xs font-semibold leading-relaxed ${!notif.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                {notif.titleAr}
                              </p>
                              {/* Severity badge */}
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${config.bg} ${config.text} border ${config.border}`}>
                                {config.label}
                              </span>
                            </div>
                            {notif.messageAr && (
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                                {notif.messageAr}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-muted-foreground/50">
                                {timeAgo(notif.createdAt)}
                              </span>
                              <span className="text-[10px] text-muted-foreground/30">·</span>
                              <span className={`text-[10px] ${config.text}`}>
                                {typeLabels[notif.type] || notif.type}
                              </span>
                            </div>
                          </div>

                          {/* Unread indicator */}
                          {!notif.isRead && (
                            <motion.div
                              animate={{ scale: [1, 1.3, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-2 ${
                                notif.severity === "critical" ? "bg-red-500" : "bg-primary"
                              }`}
                              style={{ boxShadow: `0 0 6px ${config.glow}` }}
                            />
                          )}

                          {/* Mark as read button on hover */}
                          {!notif.isRead && (
                            <button
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                markReadMutation.mutate({ notificationId: notif.id });
                              }}
                              title="تحديد كمقروء"
                            >
                              <Check className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer stats */}
            {allNotifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card/95 text-[10px] text-muted-foreground/60">
                <span>{allNotifications.length} إشعار · {count} غير مقروء</span>
                <div className="flex items-center gap-2">
                  {/* Severity summary */}
                  {["critical", "high", "medium"].map(sev => {
                    const sevCount = allNotifications.filter((n: any) => n.severity === sev && !n.isRead).length;
                    if (sevCount === 0) return null;
                    const c = severityConfig[sev];
                    return (
                      <span key={sev} className={`flex items-center gap-1 ${c.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${c.bg}`} style={{ boxShadow: `0 0 4px ${c.glow}` }} />
                        {sevCount}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

```

---

## `client/src/components/PageCharacter.tsx`

```tsx

interface PageCharacterProps {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  position?: "inline" | "bottom-right" | "bottom-left";
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: "h-24 w-auto",
  md: "h-36 w-auto",
  lg: "h-48 w-auto",
};

/**
 * Displays the official Rasid character on pages.
 * Can be positioned inline or as a fixed decorative element.
 */
export function PageCharacter({
  src,
  alt = "شخصية راصد",
  size = "md",
  position = "inline",
  className = "",
  animate = true,
}: PageCharacterProps) {
  const sizeClass = sizeMap[size];

  if (position === "inline") {
    return animate ? (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} object-contain select-none ${className}`}
        draggable={false}
      />
    ) : (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} object-contain select-none ${className}`}
        draggable={false}
      />
    );
  }

  const posClasses = position === "bottom-right" 
    ? "fixed bottom-4 left-4 z-10" 
    : "fixed bottom-4 right-4 z-10";

  return animate ? (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} object-contain select-none ${posClasses} ${className}`}
      draggable={false}
    />
  ) : (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} object-contain select-none opacity-60 ${posClasses} ${className}`}
      draggable={false}
    />
  );
}

```

---

## `client/src/components/PageTransition.tsx`

```tsx
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

/* Stagger children animation helper — disabled */
export const staggerContainer = {
  initial: {},
  animate: {},
};

export const staggerItem = {
  initial: {},
  animate: {},
};

export const fadeInUp = {
  initial: {},
  animate: {},
  transition: {},
};

export const fadeInRight = {
  initial: {},
  animate: {},
  transition: {},
};

export const fadeInLeft = {
  initial: {},
  animate: {},
  transition: {},
};

export const scaleIn = {
  initial: {},
  animate: {},
  transition: {},
};

```

---

## `client/src/components/ParticleField.tsx`

```tsx
/**
 * ParticleField — Ultra Premium floating particle background
 * Adapted from design.rasid.vip reference
 */
import { useEffect, useRef } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

export default function ParticleField({ count = 40, className = "" }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = isDark
      ? ["rgba(74, 122, 181, 0.4)", "rgba(99, 74, 181, 0.3)", "rgba(147, 74, 181, 0.25)", "rgba(74, 181, 181, 0.2)"]
      : ["rgba(30, 58, 95, 0.08)", "rgba(74, 122, 181, 0.06)", "rgba(99, 74, 181, 0.05)"];

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.6 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      }

      // Draw connections
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = isDark ? "rgba(74, 122, 181, 0.08)" : "rgba(30, 58, 95, 0.03)";
            ctx.globalAlpha = 1 - dist / maxDist;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [isDark, count]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: isDark ? 0.6 : 0.4 }}
    />
  );
}


```

---

## `client/src/components/PerformanceMetricsDisplay.tsx`

```tsx
/**
 * Performance Metrics Display Component
 * عرض مؤشرات الأداء لردود راصد الذكي
 */

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, Database, Zap, TrendingUp, Shield, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PerformanceMetricsData {
  responseTimeMs: number;
  responseSource: 'ai' | 'fallback' | 'cache';
  incidentsAnalyzed: number;
  confidenceScore: number;
  toolsUsed: string[];
  cacheHit?: boolean;
  fallbackUsed?: boolean;
}

export interface PerformanceMetricsDisplayProps {
  metrics: PerformanceMetricsData;
  className?: string;
  compact?: boolean;
}

export function PerformanceMetricsDisplay({
  metrics,
  className,
  compact = false,
}: PerformanceMetricsDisplayProps) {
  const {
    responseTimeMs,
    responseSource,
    incidentsAnalyzed,
    confidenceScore,
    toolsUsed,
  } = metrics;

  // Format response time
  const formattedTime =
    responseTimeMs < 1000
      ? `${responseTimeMs}ms`
      : `${(responseTimeMs / 1000).toFixed(2)}s`;

  // Source badge config
  const sourceConfig = {
    ai: {
      icon: <Sparkles className="h-3 w-3" />,
      label: 'الذكاء الاصطناعي',
      variant: 'default' as const,
      className: 'bg-blue-500 hover:bg-blue-600 text-white',
    },
    cache: {
      icon: <Zap className="h-3 w-3" />,
      label: 'التخزين المؤقت',
      variant: 'secondary' as const,
      className: 'bg-green-500 hover:bg-green-600 text-white',
    },
    fallback: {
      icon: <Shield className="h-3 w-3" />,
      label: 'النظام الاحتياطي',
      variant: 'outline' as const,
      className: 'bg-amber-500 hover:bg-amber-600 text-white',
    },
  };

  const source = sourceConfig[responseSource];

  // Confidence color
  const confidenceColor =
    confidenceScore >= 80
      ? 'text-green-600 dark:text-green-400'
      : confidenceScore >= 60
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-1">
          {source.icon}
          <span>{source.label}</span>
        </div>
        {confidenceScore > 0 && (
          <div className={cn('flex items-center gap-1 font-medium', confidenceColor)}>
            <TrendingUp className="h-3 w-3" />
            <span>{confidenceScore}%</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('p-3 bg-muted/30 border-muted', className)}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">مؤشرات الأداء</h4>
          <Badge className={source.className}>
            <span className="flex items-center gap-1">
              {source.icon}
              {source.label}
            </span>
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          {/* Response Time */}
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-xs text-muted-foreground">وقت الاستجابة</div>
              <div className="font-medium">{formattedTime}</div>
            </div>
          </div>

          {/* Confidence Score */}
          {confidenceScore > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">مستوى الثقة</div>
                <div className={cn('font-medium', confidenceColor)}>
                  {confidenceScore}%
                </div>
              </div>
            </div>
          )}

          {/* Incidents Analyzed */}
          {incidentsAnalyzed > 0 && (
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">حالات الرصد المحللة</div>
                <div className="font-medium">{incidentsAnalyzed}</div>
              </div>
            </div>
          )}

          {/* Tools Used */}
          {toolsUsed && toolsUsed.length > 0 && (
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">الأدوات المستخدمة</div>
                <div className="font-medium">{toolsUsed.length}</div>
              </div>
            </div>
          )}
        </div>

        {/* Tools detail */}
        {toolsUsed && toolsUsed.length > 0 && (
          <div className="pt-2 border-t border-muted">
            <div className="flex flex-wrap gap-1">
              {toolsUsed.map((tool, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tool}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

// Import this icon properly
import { Sparkles } from "lucide-react";

```

---

## `client/src/components/PredictiveAnalytics.tsx`

```tsx
/**
 * PredictiveAnalytics — AI-powered predictive analytics visualization.
 * Shows trend lines, forecasts, and confidence intervals using SVG.
 */
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  value: number;
  predicted?: boolean;
}

interface PredictiveAnalyticsProps {
  data: DataPoint[];
  title?: string;
  className?: string;
  height?: number;
  forecastDays?: number;
  showConfidenceInterval?: boolean;
  metricLabel?: string;
  trendDirection?: "up" | "down" | "stable";
}

function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number } {
  const n = points.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export function PredictiveAnalytics({
  data,
  title,
  className,
  height = 300,
  forecastDays = 7,
  showConfidenceInterval = true,
  metricLabel = "القيمة",
  trendDirection,
}: PredictiveAnalyticsProps) {
  const width = 700;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };

  const { allPoints, forecast, confidenceBand, trend } = useMemo(() => {
    const historical = data.filter((d) => !d.predicted);
    const regressionPoints = historical.map((d, i) => ({ x: i, y: d.value }));
    const { slope, intercept } = linearRegression(regressionPoints);

    // Generate forecast
    const forecastPoints: DataPoint[] = [];
    const n = historical.length;
    for (let i = 0; i < forecastDays; i++) {
      const x = n + i;
      const predictedValue = Math.max(0, slope * x + intercept);
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      forecastPoints.push({
        date: date.toISOString().split("T")[0],
        value: Math.round(predictedValue),
        predicted: true,
      });
    }

    const allPts = [...historical, ...forecastPoints];

    // Confidence band (±15% of predicted value)
    const band = forecastPoints.map((p) => ({
      date: p.date,
      upper: Math.round(p.value * 1.15),
      lower: Math.round(Math.max(0, p.value * 0.85)),
    }));

    const dir = trendDirection || (slope > 0.5 ? "up" : slope < -0.5 ? "down" : "stable");

    return { allPoints: allPts, forecast: forecastPoints, confidenceBand: band, trend: dir };
  }, [data, forecastDays, trendDirection]);

  const maxValue = useMemo(() => Math.max(...allPoints.map((d) => d.value), 1) * 1.2, [allPoints]);
  const minValue = 0;

  const scaleX = (i: number) => padding.left + (i / Math.max(allPoints.length - 1, 1)) * (width - padding.left - padding.right);
  const scaleY = (v: number) => padding.top + (1 - (v - minValue) / (maxValue - minValue)) * (height - padding.top - padding.bottom);

  const historicalPath = useMemo(() => {
    const historical = allPoints.filter((d) => !d.predicted);
    return historical.map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.value)}`).join(" ");
  }, [allPoints]);

  const forecastPath = useMemo(() => {
    const histLen = allPoints.filter((d) => !d.predicted).length;
    const forecastPts = allPoints.filter((d) => d.predicted);
    if (forecastPts.length === 0) return "";
    const startIdx = histLen - 1;
    const startPoint = allPoints[startIdx];
    let path = `M ${scaleX(startIdx)} ${scaleY(startPoint.value)}`;
    forecastPts.forEach((d, i) => {
      path += ` L ${scaleX(histLen + i)} ${scaleY(d.value)}`;
    });
    return path;
  }, [allPoints]);

  const trendColors = { up: "#10b981", down: "#ef4444", stable: "#f59e0b" };
  const trendLabels = { up: "اتجاه صاعد", down: "اتجاه هابط", stable: "مستقر" };
  const trendIcons = { up: "↗", down: "↘", stable: "→" };

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 p-6 border border-white/10", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4" dir="rtl">
        <div>
          {title && <h3 className="text-lg font-bold text-white/90">{title}</h3>}
          <p className="text-sm text-white/50">التحليل التنبؤي — {metricLabel}</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
          style={{ backgroundColor: `${trendColors[trend]}22`, color: trendColors[trend] }}
        >
          <span className="text-lg">{trendIcons[trend]}</span>
          <span>{trendLabels[trend]}</span>
        </div>
      </div>

      {/* Chart */}
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = scaleY(minValue + pct * (maxValue - minValue));
          const val = Math.round(minValue + pct * (maxValue - minValue));
          return (
            <g key={pct}>
              <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.05)" />
              <text x={padding.left - 8} y={y + 4} fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="end">
                {val.toLocaleString("ar-SA")}
              </text>
            </g>
          );
        })}

        {/* Confidence band */}
        {showConfidenceInterval && confidenceBand.length > 0 && (
          <path
            d={(() => {
              const histLen = allPoints.filter((d) => !d.predicted).length;
              const upper = confidenceBand.map((b, i) => `${scaleX(histLen + i)} ${scaleY(b.upper)}`);
              const lower = [...confidenceBand].reverse().map((b, i) => `${scaleX(histLen + confidenceBand.length - 1 - i)} ${scaleY(b.lower)}`);
              return `M ${upper.join(" L ")} L ${lower.join(" L ")} Z`;
            })()}
            fill="rgba(139,92,246,0.1)"
            stroke="none"
          />
        )}

        {/* Divider line between historical and forecast */}
        {(() => {
          const histLen = allPoints.filter((d) => !d.predicted).length;
          if (histLen > 0 && histLen < allPoints.length) {
            const x = scaleX(histLen - 1);
            return (
              <line x1={x} y1={padding.top} x2={x} y2={height - padding.bottom} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
            );
          }
          return null;
        })()}

        {/* Historical line */}
        <path d={historicalPath} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Forecast line */}
        {forecastPath && (
          <path d={forecastPath} fill="none" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="6 3" strokeLinejoin="round" />
        )}

        {/* Data points */}
        {allPoints.map((d, i) => (
          <circle
            key={i}
            cx={scaleX(i)}
            cy={scaleY(d.value)}
            r={d.predicted ? 3 : 4}
            fill={d.predicted ? "#8b5cf6" : "#06b6d4"}
            stroke={d.predicted ? "#8b5cf688" : "#06b6d488"}
            strokeWidth="2"
          />
        ))}

        {/* Legend */}
        <g transform={`translate(${padding.left + 10}, ${height - 15})`}>
          <circle cx="0" cy="0" r="4" fill="#06b6d4" />
          <text x="8" y="4" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Tajawal">بيانات فعلية</text>
          <circle cx="100" cy="0" r="4" fill="#8b5cf6" />
          <text x="108" y="4" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Tajawal">توقعات</text>
          {showConfidenceInterval && (
            <>
              <rect x="190" y="-5" width="15" height="10" fill="rgba(139,92,246,0.2)" rx="2" />
              <text x="210" y="4" fill="rgba(255,255,255,0.6)" fontSize="10" fontFamily="Tajawal">فاصل الثقة</text>
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

export default PredictiveAnalytics;

```

---

## `client/src/components/RadarWidget.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';

interface RadarDot {
  angle: number;
  distance: number;
  color: string;
  label?: string;
  size?: number;
}

interface RadarWidgetProps {
  dots?: RadarDot[];
  size?: number;
  sweepColor?: string;
  ringColor?: string;
  className?: string;
}

export function RadarWidget({
  dots = [],
  size = 200,
  sweepColor = 'rgba(39, 52, 112, 0.4)',
  ringColor = 'rgba(39, 52, 112, 0.15)',
  className = '',
}: RadarWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const animRef = useRef<number>(0);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 10;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw cross lines
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Draw sweep beam
      angleRef.current += 0.015;
      const sweepAngle = angleRef.current;
      const gradient = ctx.createConicGradient(sweepAngle, cx, cy);
      gradient.addColorStop(0, sweepColor);
      gradient.addColorStop(0.15, 'transparent');
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - 0.5, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepColor;
      ctx.fill();

      // Draw sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(sweepAngle) * maxR,
        cy + Math.sin(sweepAngle) * maxR
      );
      ctx.strokeStyle = sweepColor.replace('0.4', '0.8');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw dots
      dots.forEach((dot, i) => {
        const rad = (dot.angle * Math.PI) / 180;
        const dist = (dot.distance / 100) * maxR;
        const x = cx + Math.cos(rad) * dist;
        const y = cy + Math.sin(rad) * dist;
        const dotSize = dot.size || 3;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, dotSize + 3, 0, Math.PI * 2);
        ctx.fillStyle = dot.color.replace(')', ', 0.3)').replace('rgb', 'rgba');
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();

        // Pulse effect when sweep passes
        const dotAngle = Math.atan2(y - cy, x - cx);
        const angleDiff = Math.abs(sweepAngle % (Math.PI * 2) - ((dotAngle + Math.PI * 2) % (Math.PI * 2)));
        if (angleDiff < 0.3) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize + 6, 0, Math.PI * 2);
          ctx.fillStyle = dot.color.replace(')', ', 0.15)').replace('rgb', 'rgba');
          ctx.fill();
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = sweepColor.replace('0.4', '0.8');
      ctx.fill();

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [dots, size, sweepColor, ringColor]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-full"
      />
    </div>
  );
}

```

---

## `client/src/components/RasidCharacterWidget.tsx`

```tsx
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Bot, X, Sparkles, MessageCircle, Zap, ChevronLeft, Send, Shield } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   RasidCharacterWidget — ويدجت راصد الذكي العائم الإبهاري
   يظهر في كل الصفحات مع تأثيرات حركية متقدمة + حقل إدخال
   ═══════════════════════════════════════════════════════════════ */

const CHARACTERS = {
  waving: "/branding/characters/Character_1_waving_transparent.png",
  standing: "/branding/characters/Character_6_standing_shmagh_transparent.png",
  sunglasses: "/branding/characters/Character_4_sunglasses_transparent.png",
  shmagh: "/branding/characters/Character_2_shmagh_transparent.png",
  crossed: "/branding/characters/Character_5_arms_crossed_shmagh_transparent.png",
};

type CharacterState = "standing" | "waving" | "sunglasses" | "shmagh" | "crossed";

const greetings = [
  "مرحباً! أنا راصد 👋",
  "كيف أقدر أساعدك؟",
  "هل تحتاج تحليل بيانات؟",
  "اضغط للتحدث معي!",
  "راصد الذكي جاهز لخدمتك",
];

const tips: Record<string, string> = {
  "/overview": "💡 يمكنك تصفية البيانات حسب الفترة الزمنية",
  "/incidents": "💡 اضغط على أي حالة لعرض التفاصيل الكاملة",
  "/leaks": "💡 اضغط على أي حالة رصد لعرض التفاصيل والأدلة",
  "/privacy": "💡 تابع مؤشرات الامتثال لنظام حماية البيانات",
  "/sites": "💡 يمكنك فحص أي موقع لمعرفة حالة الامتثال",
  "/reports": "💡 يمكنك تصدير التقارير بصيغة PDF",
  "/dark-web": "💡 راقب التهديدات الجديدة في الدارك ويب",
  "/evidence-chain": "💡 وثّق الأدلة الرقمية لضمان سلسلة الحفظ",
  "/smart-rasid": "💡 اسألني أي سؤال عن بياناتك!",
};

// Proactive idle suggestions — domain-aware (UI-16, UI-17)
const IDLE_SUGGESTIONS: Record<string, { text: string; delay: number }[]> = {
  "/overview": [
    { text: "🔍 لاحظت أنك في لوحة المعلومات — هل تريد ملخصاً تنفيذياً سريعاً؟", delay: 45000 },
    { text: "📊 يمكنني تحليل اتجاهات حالات الرصد لك", delay: 90000 },
  ],
  "/leaks": [
    { text: "⚠️ هل تريد مساعدة في تحليل حالات الرصد الحالية؟", delay: 30000 },
    { text: "🔗 يمكنني ربط حالات الرصد المتشابهة وإيجاد الأنماط", delay: 75000 },
  ],
  "/privacy": [
    { text: "🛡️ هل تريد معرفة أي البنود تحتاج اهتماماً أكبر؟", delay: 40000 },
  ],
  "/sites": [
    { text: "🌐 يمكنني فحص أي موقع جديد لحالة الامتثال", delay: 35000 },
  ],
  "/reports": [
    { text: "📄 هل تريد إنشاء تقرير تنفيذي شامل؟", delay: 30000 },
  ],
};

const quickPrompts = [
  { text: "أعطني ملخص حالات الرصد", icon: "📊" },
  { text: "كم نسبة الامتثال؟", icon: "🛡️" },
  { text: "آخر التنبيهات", icon: "🔔" },
];

export default function RasidCharacterWidget() {
  const [location, setLocation] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [currentChar, setCurrentChar] = useState<CharacterState>("standing");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [miniMessage, setMiniMessage] = useState("");

  // Inline chat state (CHAT-01 to CHAT-07)
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<MiniMessage[]>([]);
  const [isAILoading, setIsAILoading] = useState(false);
  const [streamingStatus, setStreamingStatus] = useState<StreamingStatus>("idle");
  const [streamingContent, setStreamingContent] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Welcome message on first open (CHAT-04)
  const [showWelcome, setShowWelcome] = useState(true);

  /** SSE Streaming chat — token-by-token (API-03, CHAT-01, UI-04) */
  const handleMiniSend = async () => {
    if (!miniMessage.trim()) return;
    const userMsg = miniMessage.trim();

    if (chatMode) {
      setChatMessages(prev => [...prev, { role: "user", content: userMsg }]);
      setMiniMessage("");
      setShowWelcome(false);
      setIsAILoading(true);
      setStreamingStatus("understanding");
      setStreamingContent("");

      try {
        const response = await fetch("/api/rasid/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMsg,
            history: chatMessages.map(m => ({ role: m.role, content: m.content })),
          }),
        });

        if (!response.ok || !response.body) {
          // Fallback to tRPC if SSE endpoint unavailable (API-06)
          setStreamingStatus("fetching");
          const fallbackRes = await fetch("/api/trpc/smartRasid.chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ json: { message: userMsg, history: chatMessages.map(m => ({ role: m.role, content: m.content })) } }),
          });
          const data = await fallbackRes.json();
          const aiResp = data?.result?.data?.json?.response || data?.result?.data?.response || "عذراً، لم أتمكن من الرد.";
          setChatMessages(prev => [...prev, { role: "assistant", content: aiResp }]);
          setIsAILoading(false);
          setStreamingStatus("idle");
          return;
        }

        // Stream SSE tokens
        setStreamingStatus("streaming");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: ")) {
              const eventType = line.slice(7).trim();
              // Next data line
              const dataIdx = lines.indexOf(line) + 1;
              if (dataIdx < lines.length && lines[dataIdx].startsWith("data: ")) {
                try {
                  const payload = JSON.parse(lines[dataIdx].slice(6));
                  if (eventType === "token" && payload.text) {
                    accumulated += payload.text;
                    setStreamingContent(accumulated);
                  } else if (eventType === "thinking") {
                    setStreamingStatus("understanding");
                  } else if (eventType === "tool") {
                    setStreamingStatus(payload.status === "running" ? "executing" : "preparing");
                  } else if (eventType === "done") {
                    accumulated = payload.response || accumulated;
                  } else if (eventType === "error") {
                    accumulated = accumulated || "عذراً، حدث خطأ.";
                  }
                } catch {}
              }
            } else if (line.startsWith("data: ")) {
              try {
                const payload = JSON.parse(line.slice(6));
                if (payload.text) {
                  accumulated += payload.text;
                  setStreamingContent(accumulated);
                }
              } catch {}
            }
          }
        }

        setChatMessages(prev => [...prev, { role: "assistant", content: accumulated || "عذراً، لم أتمكن من الرد." }]);
        setStreamingContent("");
      } catch (err) {
        setChatMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ. حاول مرة أخرى." }]);
      } finally {
        setIsAILoading(false);
        setStreamingStatus("idle");
        setStreamingContent("");
      }
    } else {
      setIsExpanded(false);
      setLocation(`/app/smart-rasid?q=${encodeURIComponent(userMsg)}`);
      setMiniMessage("");
    }
  };

  // Auto-scroll chat to bottom (including during streaming)
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isAILoading, streamingContent]);

  const handleQuickAction = (action: string) => {
    setIsExpanded(false);
    setLocation(`/app/smart-rasid?q=${encodeURIComponent(action)}`);
  };
  const [pulseCount, setPulseCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bubbleTimer = useRef<NodeJS.Timeout | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Parallax effect on character based on mouse
  const rotateX = useTransform(mouseY, [0, window.innerHeight], [2, -2]);
  const rotateY = useTransform(mouseX, [0, window.innerWidth], [-2, 2]);

  // Show contextual tip based on current page
  useEffect(() => {
    const matchedTip = Object.entries(tips).find(([path]) => location.includes(path));
    if (matchedTip && !hasInteracted) {
      const timer = setTimeout(() => {
        setBubbleText(matchedTip[1]);
        setShowBubble(true);
        bubbleTimer.current = setTimeout(() => setShowBubble(false), 5000);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location, hasInteracted]);

  // Proactive idle assistance (UI-16, UI-17)
  useEffect(() => {
    if (isExpanded || hasInteracted) return;
    const matchedPage = Object.entries(IDLE_SUGGESTIONS).find(([path]) => location.includes(path));
    if (!matchedPage) return;

    const timers: NodeJS.Timeout[] = [];
    matchedPage[1].forEach((suggestion, idx) => {
      const timer = setTimeout(() => {
        setBubbleText(suggestion.text);
        setShowBubble(true);
        setCurrentChar("waving");
        bubbleTimer.current = setTimeout(() => {
          setShowBubble(false);
          setCurrentChar("standing");
        }, 8000);
      }, suggestion.delay);
      timers.push(timer);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [location, isExpanded, hasInteracted]);

  // Periodic greeting animation
  useEffect(() => {
    if (hasInteracted) return;
    const interval = setInterval(() => {
      setPulseCount((p) => p + 1);
      if (pulseCount > 0 && pulseCount % 5 === 0) {
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        setBubbleText(randomGreeting);
        setShowBubble(true);
        setCurrentChar("waving");
        setTimeout(() => {
          setShowBubble(false);
          setCurrentChar("standing");
        }, 4000);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [hasInteracted, pulseCount]);

  // Track mouse for parallax
  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [mouseX, mouseY]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isExpanded]);

  const handleClick = useCallback(() => {
    setHasInteracted(true);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    setShowBubble(false);
    setIsExpanded(!isExpanded);
    setCurrentChar(isExpanded ? "standing" : "sunglasses");
  }, [isExpanded]);

  const goToSmartRasid = (initialMessage?: string) => {
    setIsExpanded(false);
    if (initialMessage) {
      // Store the message to be picked up by SmartRasid page
      sessionStorage.setItem("rasid_widget_message", initialMessage);
    }
    setLocation("/smart-rasid");
  };

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    goToSmartRasid(trimmed);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-[100]" dir="rtl">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showBubble && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute bottom-full mb-3 right-0 min-w-[180px] max-w-[240px]"
          >
            <div
              className="relative px-4 py-3 rounded-2xl text-sm font-medium shadow-xl"
              style={{
                background: "linear-gradient(135deg, rgba(15, 40, 71, 0.95), rgba(11, 29, 53, 0.98))",
                border: "1px solid rgba(197, 165, 90, 0.25)",
                color: "#D4DDEF",
                backdropFilter: "blur(20px)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(197,165,90,0.1)",
              }}
            >
              {bubbleText}
              <div
                className="absolute -bottom-2 right-6 w-4 h-4 rotate-45"
                style={{
                  background: "linear-gradient(135deg, rgba(15, 40, 71, 0.95), rgba(11, 29, 53, 0.98))",
                  borderRight: "1px solid rgba(197, 165, 90, 0.25)",
                  borderBottom: "1px solid rgba(197, 165, 90, 0.25)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-20 left-0 w-[calc(100vw-2rem)] sm:w-80 max-w-80 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "linear-gradient(135deg, rgba(15, 40, 71, 0.98), rgba(11, 29, 53, 0.99))",
              border: "1px solid rgba(197, 165, 90, 0.2)",
              backdropFilter: "blur(30px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.4), 0 0 30px rgba(197,165,90,0.08)",
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center gap-3 border-b border-white/5">
              <motion.img
                src={CHARACTERS.sunglasses}
                alt="راصد"
                className="h-12 w-auto"
                animate={{ rotate: [0, 3, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="flex-1">
                <p className="text-sm font-bold text-[#D4DDEF]">راصد الذكي</p>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[10px] text-emerald-400/80">متصل ومستعد</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-[#D4DDEF]/50" />
              </button>
            </div>

            {/* Input Field */}
            <div className="px-3 pt-3">
              <div
                className="flex items-center gap-2 rounded-xl px-3 py-2"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(197, 165, 90, 0.15)",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا..."
                  className="flex-1 bg-transparent text-xs text-[#D4DDEF] placeholder-[#D4DDEF]/30 outline-none"
                  dir="rtl"
                />
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="h-7 w-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                  style={{
                    background: inputValue.trim() ? "linear-gradient(135deg, #C5A55A, #b8963f)" : "rgba(255,255,255,0.05)",
                  }}
                >
                  <Send className="h-3.5 w-3.5 text-white rotate-180" />
                </motion.button>
              </div>
            </div>

            {chatMode ? (
              /* ═══ INLINE CHAT MODE (CHAT-01 to CHAT-07) ═══ */
              <>
                {/* Chat Messages Area */}
                <div ref={chatScrollRef} className="h-[280px] overflow-y-auto px-3 pt-3 space-y-2 scrollbar-thin scrollbar-thumb-white/10">
                  {/* Welcome Message (CHAT-04) */}
                  {showWelcome && chatMessages.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-4"
                    >
                      <motion.img
                        src={CHARACTERS.waving}
                        alt="راصد"
                        className="h-16 w-auto mx-auto mb-2"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <p className="text-xs font-medium text-[#D4DDEF]">أهلاً! أنا راصد الذكي</p>
                      <p className="text-[10px] text-[#D4DDEF]/50 mt-1">كيف أقدر أساعدك اليوم؟</p>
                      {/* Quick prompts as suggestions */}
                      <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                        {quickPrompts.map((p, i) => (
                          <motion.button
                            key={i}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setMiniMessage(p.text);
                              // Use handleMiniSend which now supports SSE
                              setTimeout(() => {
                                const input = document.querySelector('[data-mini-chat-input]') as HTMLInputElement;
                                if (input) {
                                  input.value = p.text;
                                  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
                                  nativeInputValueSetter?.call(input, p.text);
                                  input.dispatchEvent(new Event('input', { bubbles: true }));
                                }
                              }, 0);
                              setShowWelcome(false);
                              setChatMessages(prev => [...prev, { role: "user", content: p.text }]);
                              setIsAILoading(true);
                              setStreamingStatus("understanding");
                              setStreamingContent("");
                              // Use SSE streaming
                              fetch("/api/rasid/stream", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ message: p.text, history: [] }),
                              }).then(async (res) => {
                                if (!res.ok || !res.body) {
                                  // Fallback to tRPC
                                  const fallback = await fetch("/api/trpc/smartRasid.chat", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ json: { message: p.text, history: [] } }),
                                  });
                                  const data = await fallback.json();
                                  const resp = data?.result?.data?.json?.response || data?.result?.data?.response || "عذراً.";
                                  setChatMessages(prev => [...prev, { role: "assistant", content: resp }]);
                                  return;
                                }
                                const reader = res.body.getReader();
                                const decoder = new TextDecoder();
                                let buf = "", acc = "";
                                setStreamingStatus("streaming");
                                while (true) {
                                  const { done, value } = await reader.read();
                                  if (done) break;
                                  buf += decoder.decode(value, { stream: true });
                                  const lines = buf.split("\n");
                                  buf = lines.pop() || "";
                                  for (const line of lines) {
                                    if (line.startsWith("data: ")) {
                                      try {
                                        const d = JSON.parse(line.slice(6));
                                        if (d.text) { acc += d.text; setStreamingContent(acc); }
                                        if (d.response) acc = d.response;
                                      } catch {}
                                    }
                                  }
                                }
                                setChatMessages(prev => [...prev, { role: "assistant", content: acc || "عذراً." }]);
                                setStreamingContent("");
                              }).catch(() => {
                                setChatMessages(prev => [...prev, { role: "assistant", content: "عذراً، حدث خطأ." }]);
                              }).finally(() => {
                                setIsAILoading(false);
                                setStreamingStatus("idle");
                                setStreamingContent("");
                              });
                              setMiniMessage("");
                            }}
                            className="text-[10px] px-2.5 py-1.5 rounded-lg text-[#D4DDEF]/70 hover:text-[#D4DDEF]"
                            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                          >
                            {p.icon} {p.text}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Chat Messages */}
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-3 py-2 text-[11px] ${
                          msg.role === "user"
                            ? "text-white"
                            : "text-[#D4DDEF]/80"
                        }`}
                        style={{
                          background: msg.role === "user"
                            ? "linear-gradient(135deg, #C5A55A, #b8963f)"
                            : "rgba(255,255,255,0.04)",
                          border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none",
                        }}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-1">
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Streaming content — token-by-token (UI-04) */}
                  {isAILoading && streamingContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div
                        className="max-w-[85%] rounded-xl px-3 py-2 text-[11px] text-[#D4DDEF]/80"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div className="prose prose-xs dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-1">
                          <Streamdown>{streamingContent}</Streamdown>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Loading indicator */}
                  {isAILoading && !streamingContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div
                        className="rounded-xl px-3 py-2 flex items-center gap-2"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <Loader2 className="h-3 w-3 text-[#C5A55A] animate-spin" />
                        <span className="text-[10px] text-[#D4DDEF]/50">{STATUS_LABELS[streamingStatus] || "يفكر..."}</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Chat Input (CHAT-01) */}
                <div className="p-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <input
                      data-mini-chat-input
                      type="text"
                      value={miniMessage}
                      onChange={(e) => setMiniMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && miniMessage.trim()) {
                          handleMiniSend();
                        }
                      }}
                      placeholder="اكتب رسالتك هنا..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#3DB1AC]/50 text-right"
                      dir="rtl"
                    />
                    <button
                      onClick={handleMiniSend}
                      disabled={!miniMessage.trim() || isAILoading}
                      className="p-2 rounded-lg bg-[#3DB1AC] hover:bg-[#3DB1AC]/80 disabled:opacity-30 transition-colors"
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ═══ NAVIGATION MODE (default) ═══ */
              <>
                {/* Quick Prompts */}
                <div className="px-3 pt-2 flex flex-wrap gap-1.5">
                  {quickPrompts.map((prompt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setChatMode(true); setMiniMessage(prompt.text); }}
                      className="text-[10px] px-2.5 py-1.5 rounded-lg text-[#D4DDEF]/70 hover:text-[#D4DDEF] transition-colors"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {prompt.icon} {prompt.text}
                    </motion.button>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="p-3 space-y-2">
                  <motion.button
                    whileHover={{ x: -4, backgroundColor: "rgba(197, 165, 90, 0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setChatMode(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
                  >
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(197, 165, 90, 0.12)" }}>
                      <MessageCircle className="h-4 w-4 text-[#C5A55A]" />
                    </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#D4DDEF]">محادثة جديدة</p>
                  <p className="text-[10px] text-[#D4DDEF]/40">تحدث مع راصد الذكي</p>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
              </motion.button>

              <motion.button
                whileHover={{ x: -4, backgroundColor: "rgba(61, 177, 172, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setIsExpanded(false); setLocation("/overview"); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(61, 177, 172, 0.12)" }}>
                  <Zap className="h-4 w-4 text-[#3DB1AC]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#D4DDEF]">تحليل سريع</p>
                  <p className="text-[10px] text-[#D4DDEF]/40">عرض ملخص المؤشرات</p>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
              </motion.button>

              <motion.button
                whileHover={{ x: -4, backgroundColor: "rgba(139, 92, 246, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setIsExpanded(false); setLocation("/privacy"); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(139, 92, 246, 0.12)" }}>
                  <Shield className="h-4 w-4 text-violet-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#D4DDEF]">الخصوصية والامتثال</p>
                  <p className="text-[10px] text-[#D4DDEF]/40">لوحة مؤشرات PDPL</p>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
              </motion.button>

              <motion.button
                whileHover={{ x: -4, backgroundColor: "rgba(100, 89, 167, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setIsExpanded(false); setLocation("/reports"); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl text-right transition-colors"
              >
                <div className="h-9 w-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(100, 89, 167, 0.12)" }}>
                  <Sparkles className="h-4 w-4 text-[#6459A7]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#D4DDEF]">التقارير الذكية</p>
                  <p className="text-[10px] text-[#D4DDEF]/40">إنشاء تقرير تلقائي</p>
                </div>
                <ChevronLeft className="h-3.5 w-3.5 text-[#D4DDEF]/30" />
              </motion.button>
            </div>

            {/* ═══ حقل الإدخال السريع ═══ */}
            <div className="p-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={miniMessage}
                  onChange={(e) => setMiniMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && miniMessage.trim()) {
                      handleMiniSend();
                    }
                  }}
                  placeholder="اكتب رسالتك هنا..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#3DB1AC]/50 text-right"
                  dir="rtl"
                />
                <button
                  onClick={handleMiniSend}
                  disabled={!miniMessage.trim()}
                  className="p-2 rounded-lg bg-[#3DB1AC] hover:bg-[#3DB1AC]/80 disabled:opacity-30 transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex gap-1 mt-2">
                <button onClick={() => handleQuickAction("تحليل سريع للوضع الحالي")} className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60">⚡ تحليل</button>
                <button onClick={() => handleQuickAction("أصدر تقرير تنفيذي")} className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60">📊 تقرير</button>
                <button onClick={() => handleQuickAction("أعطني دليل استرشادي")} className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60">📖 دليل</button>
              </div>
            </div>
              </>
            )}

            {/* Footer */}
            <div className="px-4 py-2 border-t border-white/5">
              <p className="text-[9px] text-center text-[#D4DDEF]/25">
                راصد الذكي — مدعوم بالذكاء الاصطناعي
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Button with Character */}
      <motion.button
        onClick={handleClick}
        onHoverStart={() => { setIsHovered(true); setCurrentChar("waving"); }}
        onHoverEnd={() => { setIsHovered(false); if (!isExpanded) setCurrentChar("standing"); }}
        className="relative h-16 w-16 rounded-full flex items-center justify-center cursor-pointer outline-none"
        style={{
          background: "linear-gradient(135deg, #0F2847, #132F5A)",
          border: "2px solid rgba(197, 165, 90, 0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), 0 0 20px rgba(197,165,90,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
          rotateX,
          rotateY,
          perspective: 800,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={isExpanded ? { rotate: 0 } : {}}
      >
        {/* Orbiting ring */}
        <motion.div
          className="absolute inset-[-4px] rounded-full pointer-events-none"
          style={{
            border: "1px solid rgba(197, 165, 90, 0.15)",
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Pulse rings */}
        {!isExpanded && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "1px solid rgba(197, 165, 90, 0.2)" }}
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ border: "1px solid rgba(61, 177, 172, 0.15)" }}
              animate={{ scale: [1, 2.2], opacity: [0.3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />
          </>
        )}

        {/* Character image */}
        <motion.img
          src={CHARACTERS[currentChar]}
          alt="راصد"
          className="h-11 w-auto object-contain select-none relative z-10"
          draggable={false}
          animate={
            isHovered
              ? { y: [0, -3, 0], scale: 1.05 }
              : { y: [0, -2, 0] }
          }
          transition={{
            duration: isHovered ? 0.6 : 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            filter: "drop-shadow(0 2px 8px rgba(197, 165, 90, 0.3))",
          }}
        />

        {/* Sparkle particles around FAB */}
        {isHovered && (
          <>
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  background: i % 2 === 0 ? "#C5A55A" : "#3DB1AC",
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                }}
                animate={{
                  x: Math.cos((i * 72 * Math.PI) / 180) * 35,
                  y: Math.sin((i * 72 * Math.PI) / 180) * 35,
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.1,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {/* Online indicator */}
        <motion.div
          className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full"
          style={{
            background: "linear-gradient(135deg, #3DB1AC, #2dd4bf)",
            border: "2px solid #0F2847",
            boxShadow: "0 0 8px rgba(61, 177, 172, 0.5)",
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    </div>
  );
}

```

---

## `client/src/components/RasidChart.tsx`

```tsx
import { useRef, useEffect, memo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title,
} from "chart.js";

// Register all Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title
);

// Set global defaults for RTL and Arabic
ChartJS.defaults.font.family = "Tajawal, sans-serif";
ChartJS.defaults.color = "#e2e8f0";

interface RasidChartProps {
  chartConfig: {
    type: string;
    data: any;
    options?: any;
  };
  summary?: string;
}

const RasidChart = memo(function RasidChart({ chartConfig, summary }: RasidChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !chartConfig) return;

    // Destroy previous chart
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    // Deep merge options with dark theme defaults
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: "easeOutQuart" as const,
      },
      plugins: {
        legend: {
          position: "bottom" as const,
          rtl: true,
          labels: {
            color: "#e2e8f0",
            font: { family: "Tajawal", size: 12 },
            padding: 16,
            usePointStyle: true,
          },
        },
        title: {
          display: true,
          color: "#f1f5f9",
          font: { family: "Tajawal", size: 16, weight: "bold" as const },
          padding: { bottom: 16 },
          ...(chartConfig.options?.plugins?.title || {}),
        },
        tooltip: {
          rtl: true,
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          titleFont: { family: "Tajawal", size: 13 },
          bodyFont: { family: "Tajawal", size: 12 },
          borderColor: "rgba(56, 189, 248, 0.3)",
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
        },
      },
      scales: chartConfig.type === "radar" || chartConfig.type === "pie" || chartConfig.type === "doughnut" || chartConfig.type === "polarArea"
        ? undefined
        : {
            x: {
              ticks: { color: "#94a3b8", font: { family: "Tajawal", size: 11 } },
              grid: { color: "rgba(148, 163, 184, 0.1)" },
              ...(chartConfig.options?.scales?.x || {}),
            },
            y: {
              ticks: { color: "#94a3b8", font: { family: "Tajawal", size: 11 } },
              grid: { color: "rgba(148, 163, 184, 0.1)" },
              ...(chartConfig.options?.scales?.y || {}),
            },
            ...(chartConfig.options?.scales?.y1
              ? {
                  y1: {
                    ticks: { color: "#94a3b8", font: { family: "Tajawal", size: 11 } },
                    grid: { drawOnChartArea: false },
                    ...chartConfig.options.scales.y1,
                  },
                }
              : {}),
          },
      ...(chartConfig.options || {}),
    };

    // Override nested plugins to keep our defaults
    if (chartConfig.options?.plugins) {
      options.plugins = { ...options.plugins, ...chartConfig.options.plugins };
    }

    try {
      chartRef.current = new ChartJS(ctx, {
        type: chartConfig.type as any,
        data: chartConfig.data,
        options,
      });
    } catch (e) {
      console.error("Chart render error:", e);
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [chartConfig]);

  return (
    <div className="my-4 rounded-xl border border-sky-500/20 bg-slate-900/60 backdrop-blur-sm p-4 shadow-lg shadow-sky-500/5">
      <div className="relative h-[360px] w-full">
        <canvas ref={canvasRef} />
      </div>
      {summary && (
        <p className="mt-3 text-center text-sm text-slate-400 font-[Tajawal]">{summary}</p>
      )}
    </div>
  );
});

export default RasidChart;

```

---

## `client/src/components/RasidDashboard.tsx`

```tsx
import { memo } from "react";
import RasidChart from "./RasidChart";
import { BarChart3, AlertTriangle, Shield, TrendingUp } from "lucide-react";

interface DashboardKPIs {
  totalIncidents: number;
  totalRecords: number;
  criticalCount: number;
  highCount: number;
}

interface DashboardChart {
  type: string;
  title: string;
  data: any;
}

interface RasidDashboardProps {
  title: string;
  dashboardType: string;
  kpis: DashboardKPIs;
  charts: DashboardChart[];
  summary?: string;
}

const formatNumber = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("ar-SA");
};

const KPICard = memo(function KPICard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-${color}-500/20 bg-gradient-to-br from-slate-900/80 to-slate-800/60 backdrop-blur-sm p-4 shadow-lg`}>
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: `linear-gradient(90deg, transparent, var(--tw-gradient-from), transparent)` }} />
      <div className="flex items-center gap-3 rtl:flex-row-reverse">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${color}-500/10`}>
          <Icon className={`h-5 w-5 text-${color}-400`} />
        </div>
        <div className="text-right flex-1">
          <p className="text-xs text-slate-400 font-[Tajawal]">{label}</p>
          <p className="text-xl font-bold text-white font-[Tajawal]">{value}</p>
        </div>
      </div>
    </div>
  );
});

const RasidDashboard = memo(function RasidDashboard({
  title,
  dashboardType,
  kpis,
  charts,
  summary,
}: RasidDashboardProps) {
  const typeLabels: Record<string, string> = {
    executive: "لوحة تنفيذية",
    sector: "لوحة قطاعية",
    threat: "لوحة التهديدات",
    compliance: "لوحة الامتثال",
    custom: "لوحة مخصصة",
  };

  return (
    <div className="my-4 rounded-2xl border border-sky-500/20 bg-slate-950/60 backdrop-blur-sm overflow-hidden shadow-xl shadow-sky-500/5">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-l from-sky-600/20 via-indigo-600/10 to-transparent px-6 py-4 border-b border-sky-500/10">
        <div className="flex items-center justify-between rtl:flex-row-reverse">
          <div className="text-right">
            <h3 className="text-lg font-bold text-white font-[Tajawal]">{title}</h3>
            <p className="text-xs text-sky-300/70 font-[Tajawal]">
              {typeLabels[dashboardType] || dashboardType} — {charts.length} مخطط
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-500/10">
            <BarChart3 className="h-5 w-5 text-sky-400" />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
        <KPICard
          icon={BarChart3}
          label="إجمالي حالات الرصد"
          value={formatNumber(kpis.totalIncidents)}
          color="sky"
        />
        <KPICard
          icon={TrendingUp}
          label="ادعاء البائع"
          value={formatNumber(kpis.totalRecords)}
          color="indigo"
        />
        <KPICard
          icon={AlertTriangle}
          label="عالي الأهمية"
          value={formatNumber(kpis.criticalCount)}
          color="red"
        />
        <KPICard
          icon={Shield}
          label="عالي"
          value={formatNumber(kpis.highCount)}
          color="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 pt-0">
        {charts.map((chart, idx) => (
          <RasidChart
            key={`dashboard-chart-${idx}`}
            chartConfig={{
              type: chart.type,
              data: chart.data,
              options: {
                plugins: {
                  title: { display: true, text: chart.title },
                },
              },
            }}
          />
        ))}
      </div>

      {summary && (
        <div className="px-6 pb-4">
          <p className="text-center text-sm text-slate-400 font-[Tajawal]">{summary}</p>
        </div>
      )}
    </div>
  );
});

export default RasidDashboard;

```

---

## `client/src/components/RasidLoadingScreen.tsx`

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/* ═══════════════════════════════════════════════════════════════
   RasidLoadingScreen — شاشة تحميل فخمة بشخصية راصد المتحركة
   ═══════════════════════════════════════════════════════════════ */

const CHARACTER_WAVING = "/branding/characters/Character_1_waving_transparent.png";
const LOGO_GOLD = "/branding/logos/Rased_5_transparent.png";

const loadingMessages = [
  "جارٍ تجهيز لوحة التحكم...",
  "يتم تحليل البيانات...",
  "راصد يعمل من أجلك...",
  "جارٍ تحميل المؤشرات...",
  "لحظات وستكون جاهزاً...",
  "نظام الرصد الذكي جاهز...",
];

interface Props {
  show?: boolean;
  onFinish?: () => void;
  minDuration?: number;
}

export default function RasidLoadingScreen({ show = true, onFinish, minDuration = 2000 }: Props) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!show) return;
    const msgInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1800);
    return () => clearInterval(msgInterval);
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const start = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(p);
      if (p >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => onFinish?.(), 400);
      }
    }, 50);
    return () => clearInterval(progressInterval);
  }, [show, minDuration, onFinish]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #0B1D35 0%, #0F2847 40%, #132F5A 70%, #0B1D35 100%)",
          }}
        >
          {/* Animated background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 4 + 1,
                  height: Math.random() * 4 + 1,
                  background: i % 3 === 0
                    ? "rgba(197, 165, 90, 0.4)"
                    : i % 3 === 1
                    ? "rgba(61, 177, 172, 0.3)"
                    : "rgba(100, 89, 167, 0.3)",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: Math.random() * 4 + 3,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Radial glow behind character */}
          <motion.div
            className="absolute"
            style={{
              width: 400,
              height: 400,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(197,165,90,0.15) 0%, rgba(61,177,172,0.08) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Character with bounce animation */}
          <motion.div
            className="relative z-10 mb-6"
            initial={{ y: 40, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.2 }}
          >
            <motion.img
              src={CHARACTER_WAVING}
              alt="راصد"
              className="h-44 w-auto drop-shadow-2xl select-none"
              draggable={false}
              animate={{
                y: [0, -8, 0],
                rotate: [0, 1, -1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            {/* Glow ring around character */}
            <motion.div
              className="absolute -inset-4 rounded-full pointer-events-none"
              style={{
                border: "1px solid rgba(197, 165, 90, 0.2)",
                boxShadow: "0 0 40px rgba(197, 165, 90, 0.1), inset 0 0 40px rgba(61, 177, 172, 0.05)",
              }}
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Logo */}
          <motion.img
            src={LOGO_GOLD}
            alt="راصد"
            className="h-12 w-auto mb-6 select-none"
            draggable={false}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              filter: "drop-shadow(0 0 20px rgba(197, 165, 90, 0.3))",
            }}
          />

          {/* Loading message with typewriter effect */}
          <motion.div className="relative z-10 text-center mb-8">
            <AnimatePresence mode="wait">
              <motion.p
                key={messageIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-sm font-medium"
                style={{ color: "rgba(212, 221, 239, 0.8)", fontFamily: "'Tajawal', sans-serif" }}
              >
                {loadingMessages[messageIndex]}
              </motion.p>
            </AnimatePresence>
          </motion.div>

          {/* Premium progress bar */}
          <motion.div
            className="relative z-10 w-64 h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255, 255, 255, 0.06)" }}
            initial={{ opacity: 0, scaleX: 0.5 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #C5A55A, #3DB1AC, #6459A7, #C5A55A)",
                backgroundSize: "200% 100%",
                animation: "shimmer-gold 2s linear infinite",
                boxShadow: "0 0 12px rgba(197, 165, 90, 0.4)",
                transition: "width 0.1s ease-out",
              }}
            />
          </motion.div>

          {/* Percentage */}
          <motion.p
            className="relative z-10 mt-3 text-xs tabular-nums"
            style={{ color: "rgba(197, 165, 90, 0.6)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {Math.round(progress)}%
          </motion.p>

          {/* Bottom branding */}
          <motion.p
            className="absolute bottom-6 text-[10px] tracking-widest uppercase"
            style={{ color: "rgba(212, 221, 239, 0.25)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            مكتب إدارة البيانات الوطنية — NDMO
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

```

---

## `client/src/components/ReportCustomizer.tsx`

```tsx
/**
 * ReportCustomizer — Advanced report generation dialog with customization options
 * Allows users to customize report content, format, and scope before generation
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FileText,
  Download,
  Loader2,
  Calendar,
  Building2,
  Shield,
  BarChart3,
  Filter,
  Settings,
  CheckCircle2,
  AlertTriangle,
  Printer,
  QrCode,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ComplianceWarningDialog from "./ComplianceWarningDialog";

const SECTORS = [
  "الاتصالات وتقنية المعلومات",
  "القطاع الحكومي",
  "الرعاية الصحية",
  "القطاع المالي والبنوك",
  "التعليم",
  "التجزئة والتجارة الإلكترونية",
  "النقل والطيران",
  "الطاقة والبتروكيماويات",
  "العقارات",
  "التوظيف والموارد البشرية",
  "الضيافة والسياحة",
  "التأمين",
  "الخدمات اللوجستية",
  "الإعلام والترفيه",
  "الزراعة والغذاء",
  "الخدمات القانونية",
];

const SEVERITY_OPTIONS = [
  { value: "critical", label: "واسع النطاق", color: "text-red-400 bg-red-500/10 border-red-500/30" },
  { value: "high", label: "عالي", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  { value: "medium", label: "متوسط", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  { value: "low", label: "منخفض", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
];

const SOURCE_OPTIONS = [
  { value: "telegram", label: "تليجرام" },
  { value: "darkweb", label: "دارك ويب" },
  { value: "paste", label: "مواقع اللصق" },
];

const REPORT_SECTIONS = [
  { id: "summary", label: "الملخص التنفيذي", description: "نظرة عامة على أهم النتائج والتوصيات" },
  { id: "statistics", label: "الإحصائيات العامة", description: "أرقام وإحصائيات شاملة عن حالات الرصد" },
  { id: "leaks", label: "تفاصيل حالات الرصد", description: "قائمة مفصلة بجميع حالات الرصد" },
  { id: "sectors", label: "تحليل القطاعات", description: "توزيع حالات الرصد حسب القطاعات" },
  { id: "threats", label: "تحليل التهديدات", description: "الجهات الفاعلة وأساليب الاختراق" },
  { id: "pii", label: "البيانات الشخصية المكشوفة", description: "أنواع البيانات الشخصية المسربة" },
  { id: "recommendations", label: "التوصيات", description: "توصيات لتعزيز حماية البيانات" },
  { id: "timeline", label: "الجدول الزمني", description: "تسلسل زمني لحالات الرصد" },
];

interface ReportCustomizerProps {
  open: boolean;
  onClose: () => void;
}

export default function ReportCustomizer({ open, onClose }: ReportCustomizerProps) {
  const [step, setStep] = useState<"customize" | "warning" | "generating" | "done">("customize");
  const [reportTitle, setReportTitle] = useState("تقرير رصد تسرب البيانات الشخصية");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(["critical", "high", "medium", "low"]);
  const [selectedSources, setSelectedSources] = useState<string[]>(["telegram", "darkweb", "paste"]);
  const [selectedSections, setSelectedSections] = useState<string[]>(REPORT_SECTIONS.map((s) => s.id));
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [includeEvidence, setIncludeEvidence] = useState(true);
  const [includeSampleData, setIncludeSampleData] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const { refetch: fetchPdfData } = trpc.reports.exportPdf.useQuery({}, { enabled: false });

  const toggleSector = (sector: string) => {
    setSelectedSectors((prev) =>
      prev.includes(sector) ? prev.filter((s) => s !== sector) : [...prev, sector]
    );
  };

  const toggleSeverity = (sev: string) => {
    setSelectedSeverities((prev) =>
      prev.includes(sev) ? prev.filter((s) => s !== sev) : [...prev, sev]
    );
  };

  const toggleSource = (src: string) => {
    setSelectedSources((prev) =>
      prev.includes(src) ? prev.filter((s) => s !== src) : [...prev, src]
    );
  };

  const toggleSection = (sec: string) => {
    setSelectedSections((prev) =>
      prev.includes(sec) ? prev.filter((s) => s !== sec) : [...prev, sec]
    );
  };

  const handleProceedToWarning = () => {
    if (selectedSeverities.length === 0) {
      toast.error("يرجى اختيار مستوى تأثير واحد على الأقل");
      return;
    }
    if (selectedSources.length === 0) {
      toast.error("يرجى اختيار مصدر واحد على الأقل");
      return;
    }
    if (selectedSections.length === 0) {
      toast.error("يرجى اختيار قسم واحد على الأقل للتقرير");
      return;
    }
    setStep("warning");
  };

  const handleConfirmGenerate = async () => {
    setStep("generating");
    try {
      const { data } = await fetchPdfData();
      if (!data) throw new Error("No data");

      // Build the report HTML
      const now = new Date();
      const verificationCode = `RPT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const filterDescription = [
        selectedSectors.length > 0 ? `القطاعات: ${selectedSectors.join("، ")}` : "جميع القطاعات",
        `مستويات التأثير: ${selectedSeverities.map((s) => SEVERITY_OPTIONS.find((o) => o.value === s)?.label).join("، ")}`,
        `المصادر: ${selectedSources.map((s) => SOURCE_OPTIONS.find((o) => o.value === s)?.label).join("، ")}`,
        dateFrom ? `من: ${dateFrom}` : "",
        dateTo ? `إلى: ${dateTo}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<title>${reportTitle}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Tajawal', sans-serif; background: #0a0f1a; color: #e2e8f0; direction: rtl; }
  .page { max-width: 900px; margin: 0 auto; padding: 40px; }
  .header { background: linear-gradient(135deg, #0d1526, #1a2744); border: 1px solid rgba(6,182,212,0.2); border-radius: 16px; padding: 30px; margin-bottom: 30px; }
  .header-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .logo-section { display: flex; align-items: center; gap: 15px; }
  .logo-text { font-size: 24px; font-weight: 800; background: linear-gradient(135deg, #06b6d4, #10b981); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .logo-sub { font-size: 11px; color: #64748b; margin-top: 4px; }
  .verification-box { background: rgba(6,182,212,0.1); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 12px 16px; text-align: center; }
  .verification-code { font-family: monospace; font-size: 14px; color: #06b6d4; font-weight: 700; letter-spacing: 1px; }
  .verification-label { font-size: 10px; color: #64748b; margin-bottom: 4px; }
  .report-title { font-size: 20px; font-weight: 700; color: #f1f5f9; margin-bottom: 8px; }
  .report-meta { display: flex; gap: 20px; flex-wrap: wrap; }
  .meta-item { font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
  .section { background: rgba(15,23,42,0.5); border: 1px solid rgba(100,116,139,0.2); border-radius: 12px; padding: 24px; margin-bottom: 20px; }
  .section-title { font-size: 16px; font-weight: 700; color: #06b6d4; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid rgba(6,182,212,0.2); }
  .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  .stat-card { background: rgba(6,182,212,0.05); border: 1px solid rgba(6,182,212,0.15); border-radius: 10px; padding: 16px; text-align: center; }
  .stat-value { font-size: 24px; font-weight: 800; color: #06b6d4; }
  .stat-label { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th { background: rgba(6,182,212,0.1); color: #06b6d4; padding: 10px 12px; text-align: right; font-weight: 600; border-bottom: 1px solid rgba(6,182,212,0.2); }
  td { padding: 10px 12px; border-bottom: 1px solid rgba(100,116,139,0.1); color: #cbd5e1; }
  tr:hover td { background: rgba(6,182,212,0.03); }
  .severity-badge { display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 10px; font-weight: 600; }
  .severity-critical { background: rgba(239,68,68,0.15); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
  .severity-high { background: rgba(245,158,11,0.15); color: #f59e0b; border: 1px solid rgba(245,158,11,0.3); }
  .severity-medium { background: rgba(234,179,8,0.15); color: #eab308; border: 1px solid rgba(234,179,8,0.3); }
  .severity-low { background: rgba(6,182,212,0.15); color: #06b6d4; border: 1px solid rgba(6,182,212,0.3); }
  .footer { text-align: center; padding: 20px; color: #475569; font-size: 10px; border-top: 1px solid rgba(100,116,139,0.2); margin-top: 30px; }
  .footer-motto { font-size: 12px; color: #06b6d4; font-weight: 600; margin-bottom: 8px; }
  .filter-info { background: rgba(139,92,246,0.05); border: 1px solid rgba(139,92,246,0.2); border-radius: 8px; padding: 10px 14px; font-size: 11px; color: #a78bfa; margin-bottom: 20px; }
  .rec-item { display: flex; align-items: flex-start; gap: 8px; padding: 8px 0; border-bottom: 1px solid rgba(100,116,139,0.1); }
  .rec-bullet { width: 6px; height: 6px; border-radius: 50%; background: #10b981; margin-top: 6px; flex-shrink: 0; }
  @media print { body { background: white; color: #1e293b; } .page { padding: 20px; } .header { background: #f8fafc; border-color: #e2e8f0; } .section { background: #f8fafc; border-color: #e2e8f0; } .section-title { color: #0891b2; } .stat-card { background: #f0fdfa; border-color: #99f6e4; } .stat-value { color: #0891b2; } th { background: #f0fdfa; color: #0891b2; } td { color: #334155; } .footer { color: #94a3b8; } }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-top">
      <div class="logo-section">
        <div>
          <div class="logo-text">منصة راصد</div>
          <div class="logo-sub">NDMO — مكتب إدارة البيانات الوطنية</div>
        </div>
      </div>
      <div class="verification-box">
        <div class="verification-label">رمز التحقق</div>
        <div class="verification-code">${verificationCode}</div>
      </div>
    </div>
    <div class="report-title">${reportTitle}</div>
    <div class="report-meta">
      <div class="meta-item">📅 تاريخ الإصدار: ${now.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}</div>
      <div class="meta-item">🕐 الوقت: ${now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Riyadh" })}</div>
      <div class="meta-item">📊 النوع: تقرير مخصص</div>
    </div>
  </div>

  <div class="filter-info">
    🔍 معايير التصفية: ${filterDescription}
  </div>

  ${selectedSections.includes("summary") ? `
  <div class="section">
    <div class="section-title">📋 الملخص التنفيذي</div>
    <p style="font-size:13px;line-height:1.8;color:#cbd5e1;">
      يقدم هذا التقرير نظرة شاملة على حالات رصد البيانات الشخصية المرصودة عبر منصة راصد التابعة لمكتب إدارة البيانات الوطنية.
      تم رصد ${data.stats?.totalLeaks ?? 0} حالة رصد أثرت على ${(data.stats?.totalRecords ?? 0).toLocaleString()} سجل بيانات شخصية.
      يتضمن التقرير تحليلاً تفصيلياً لحالات الرصد حسب القطاعات والمصادر ومستويات التأثير، مع توصيات لتعزيز حماية البيانات.
    </p>
  </div>` : ""}

  ${selectedSections.includes("statistics") ? `
  <div class="section">
    <div class="section-title">📊 الإحصائيات العامة</div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-value">${data.stats?.totalLeaks ?? 0}</div>
        <div class="stat-label">إجمالي حالات الرصد</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${(data.stats?.totalRecords ?? 0).toLocaleString()}</div>
        <div class="stat-label">العدد المُدّعى</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats?.newLeaks ?? 0}</div>
        <div class="stat-label">حالات رصد جديدة</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${data.stats?.piiDetected ?? 0}</div>
        <div class="stat-label">أنواع بيانات مكتشفة</div>
      </div>
    </div>
  </div>` : ""}

  ${selectedSections.includes("leaks") ? `
  <div class="section">
    <div class="section-title">🔓 تفاصيل حالات الرصد</div>
    <table>
      <thead>
        <tr>
          <th>الرمز</th>
          <th>العنوان</th>
          <th>القطاع</th>
          <th>حجم التأثير</th>
          <th>السجلات</th>
          <th>المصدر</th>
          <th>الحالة</th>
        </tr>
      </thead>
      <tbody>
        ${data.leaksSummary.slice(0, 50).map((l: any) => `
        <tr>
          <td style="font-family:monospace;color:#06b6d4;font-size:10px;">${l.leakId || "—"}</td>
          <td>${l.title}</td>
          <td>${l.sector}</td>
          <td><span class="severity-badge severity-${l.severity}">${l.severity === "critical" ? "واسع النطاق" : l.severity === "high" ? "عالي" : l.severity === "medium" ? "متوسط" : "منخفض"}</span></td>
          <td>${Number(l.records).toLocaleString()}</td>
          <td>${l.source === "telegram" ? "تليجرام" : l.source === "darkweb" ? "دارك ويب" : "موقع لصق"}</td>
          <td>${l.status === "new" ? "جديد" : l.status === "analyzing" ? "قيد التحليل" : l.status === "documented" ? "موثّق" : "تم التوثيق"}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    ${data.leaksSummary.length > 50 ? `<p style="text-align:center;font-size:11px;color:#64748b;margin-top:12px;">عرض 50 من أصل ${data.leaksSummary.length} حالة رصد</p>` : ""}
  </div>` : ""}

  ${selectedSections.includes("recommendations") ? `
  <div class="section">
    <div class="section-title">💡 التوصيات</div>
    <div style="space-y:8px;">
      <div class="rec-item"><div class="rec-bullet"></div><div>تطبيق التشفير الإلزامي للبيانات الحساسة في جميع القطاعات</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>إنشاء فريق استجابة وطني لحالات رصد البيانات الشخصية</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>تحديث معايير PDPL للقطاع الصحي وقطاع الاتصالات</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>إلزام الجهات بتوثيق حالات الرصد خلال 72 ساعة</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>تطوير نظام إنذار مبكر متكامل مع منصة راصد</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>إطلاق برنامج توعية وطني لحماية البيانات الشخصية</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>تعزيز ضوابط الوصول لقواعد البيانات الحساسة</div></div>
      <div class="rec-item"><div class="rec-bullet"></div><div>تدقيق أمني دوري للبنية التحتية الرقمية</div></div>
    </div>
  </div>` : ""}

  <div class="footer">
    <div class="footer-motto">❝ حماية البيانات الشخصية متطلب وطني ❞</div>
    <p>هذا التقرير صادر من منصة راصد — مكتب إدارة البيانات الوطنية (NDMO)</p>
    <p>رمز التحقق: ${verificationCode} | تاريخ الإصدار: ${now.toISOString()}</p>
    <p style="margin-top:8px;">⚠️ هذا التقرير سري ومخصص للاستخدام الرسمي فقط</p>
  </div>
</div>
</body>
</html>`;

      setGeneratedReport({
        htmlContent,
        verificationCode,
        title: reportTitle,
        generatedAt: now.toISOString(),
      });
      setStep("done");
      toast.success("تم إنشاء التقرير بنجاح", {
        description: `رمز التحقق: ${verificationCode}`,
      });
    } catch (err) {
      toast.error("فشل إنشاء التقرير");
      setStep("customize");
    }
  };

  const handlePrint = () => {
    if (!generatedReport) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatedReport.htmlContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleDownload = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport.htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${generatedReport.verificationCode}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setStep("customize");
    setGeneratedReport(null);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        {open && step !== "warning" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-card border border-border rounded-2xl shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-xl border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-teal-500/20 border border-primary/30">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground font-bold text-sm">
                      {step === "done" ? "التقرير جاهز" : step === "generating" ? "جاري إنشاء التقرير..." : "إنشاء تقرير مخصص"}
                    </h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {step === "done" ? "يمكنك طباعة أو تحميل التقرير" : step === "generating" ? "يرجى الانتظار..." : "خصّص محتوى التقرير ونطاقه قبل الإصدار"}
                    </p>
                  </div>
                  <button onClick={handleClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {step === "generating" && (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-12 h-12 text-primary" />
                    </motion.div>
                    <p className="text-muted-foreground text-sm">جاري تجميع البيانات وإنشاء التقرير...</p>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 rounded-full bg-primary"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === "done" && generatedReport && (
                  <div className="space-y-5">
                    <div className="bg-emerald-500/5 rounded-xl p-4 border border-emerald-500/20 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-400">تم إنشاء التقرير بنجاح</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          رمز التحقق: <span className="font-mono text-primary">{generatedReport.verificationCode}</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-4 border border-border/30">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-3">معاينة التقرير</h4>
                      <div className="rounded-lg border border-border overflow-hidden bg-[#0a0f1a]" style={{ height: 400 }}>
                        <iframe
                          srcDoc={generatedReport.htmlContent}
                          className="w-full h-full"
                          title="Report Preview"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button className="flex-1 gap-2" onClick={handlePrint}>
                        <Printer className="w-4 h-4" />
                        طباعة التقرير
                      </Button>
                      <Button className="flex-1 gap-2" variant="outline" onClick={handleDownload}>
                        <Download className="w-4 h-4" />
                        تحميل HTML
                      </Button>
                    </div>
                  </div>
                )}

                {step === "customize" && (
                  <div className="space-y-6">
                    {/* Report Title */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 block">عنوان التقرير</label>
                      <input
                        type="text"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                        className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-colors"
                        dir="rtl"
                      />
                    </div>

                    {/* Date Range */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        النطاق الزمني (اختياري)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                        />
                        <input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary/50 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Severity Filter */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        مستويات التأثير
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SEVERITY_OPTIONS.map((sev) => (
                          <button
                            key={sev.value}
                            onClick={() => toggleSeverity(sev.value)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              selectedSeverities.includes(sev.value)
                                ? sev.color
                                : "text-muted-foreground bg-secondary/30 border-border/50 opacity-50"
                            }`}
                          >
                            {sev.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Source Filter */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        مصادر الرصد
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {SOURCE_OPTIONS.map((src) => (
                          <button
                            key={src.value}
                            onClick={() => toggleSource(src.value)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                              selectedSources.includes(src.value)
                                ? "text-primary bg-primary/10 border-primary/30"
                                : "text-muted-foreground bg-secondary/30 border-border/50 opacity-50"
                            }`}
                          >
                            {src.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sector Filter */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" />
                        القطاعات (اترك فارغاً لتضمين الكل)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {SECTORS.map((sector) => (
                          <button
                            key={sector}
                            onClick={() => toggleSector(sector)}
                            className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                              selectedSectors.includes(sector)
                                ? "text-violet-400 bg-violet-500/10 border-violet-500/30"
                                : "text-muted-foreground bg-secondary/30 border-border/50 hover:border-border"
                            }`}
                          >
                            {sector}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Report Sections */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5" />
                        أقسام التقرير
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {REPORT_SECTIONS.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => toggleSection(section.id)}
                            className={`flex items-start gap-3 p-3 rounded-lg border text-right transition-all ${
                              selectedSections.includes(section.id)
                                ? "bg-primary/5 border-primary/30"
                                : "bg-secondary/20 border-border/50 opacity-60"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 ${
                              selectedSections.includes(section.id)
                                ? "bg-primary border-primary"
                                : "border-border"
                            }`}>
                              {selectedSections.includes(section.id) && (
                                <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{section.label}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{section.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="bg-secondary/20 rounded-xl p-4 border border-border/30 space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground">خيارات إضافية</h4>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeEvidence}
                          onChange={(e) => setIncludeEvidence(e.target.checked)}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-xs text-foreground">تضمين لقطات الأدلة</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeSampleData}
                          onChange={(e) => setIncludeSampleData(e.target.checked)}
                          className="w-4 h-4 rounded accent-primary"
                        />
                        <span className="text-xs text-foreground">تضمين عينات البيانات المسربة</span>
                      </label>
                    </div>

                    {/* Generate Button */}
                    <Button
                      className="w-full gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white py-6"
                      onClick={handleProceedToWarning}
                    >
                      <FileText className="w-5 h-5" />
                      إصدار التقرير
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compliance Warning */}
      <ComplianceWarningDialog
        open={step === "warning"}
        onConfirm={handleConfirmGenerate}
        onCancel={() => setStep("customize")}
        reportType="التقرير"
      />
    </>
  );
}

```

---

## `client/src/components/SaudiHeatmapSlide.tsx`

```tsx
import { useState, useMemo } from "react";
import { MapPin, Shield, AlertTriangle, XCircle, Activity, Wifi } from "lucide-react";

// ─── Saudi Arabia Region Paths (simplified SVG) ───────────
// Approximate polygon coordinates for 13 administrative regions
const REGION_PATHS: Record<string, { path: string; cx: number; cy: number }> = {
  riyadh: {
    path: "M 380,180 L 420,160 L 480,170 L 510,210 L 520,280 L 500,340 L 460,370 L 400,360 L 370,320 L 350,260 L 360,210 Z",
    cx: 430, cy: 270,
  },
  makkah: {
    path: "M 200,280 L 260,260 L 310,270 L 350,260 L 370,320 L 360,370 L 320,400 L 280,420 L 240,400 L 200,370 L 190,320 Z",
    cx: 280, cy: 340,
  },
  madinah: {
    path: "M 200,160 L 260,140 L 310,150 L 350,160 L 380,180 L 360,210 L 350,260 L 310,270 L 260,260 L 220,240 L 200,200 Z",
    cx: 280, cy: 200,
  },
  eastern: {
    path: "M 480,170 L 540,130 L 600,140 L 620,180 L 630,240 L 620,310 L 580,360 L 540,380 L 500,340 L 520,280 L 510,210 Z",
    cx: 560, cy: 260,
  },
  qassim: {
    path: "M 350,130 L 400,120 L 420,130 L 420,160 L 380,180 L 350,160 Z",
    cx: 385, cy: 148,
  },
  hail: {
    path: "M 280,90 L 340,80 L 380,90 L 400,120 L 350,130 L 310,150 L 260,140 L 260,110 Z",
    cx: 330, cy: 110,
  },
  tabuk: {
    path: "M 140,60 L 200,50 L 260,60 L 280,90 L 260,110 L 200,160 L 160,140 L 130,110 L 120,80 Z",
    cx: 200, cy: 100,
  },
  northern: {
    path: "M 340,40 L 400,30 L 460,40 L 480,70 L 460,100 L 400,120 L 380,90 L 340,80 Z",
    cx: 410, cy: 70,
  },
  jawf: {
    path: "M 220,30 L 280,20 L 340,40 L 340,80 L 280,90 L 260,60 L 220,50 Z",
    cx: 280, cy: 55,
  },
  jizan: {
    path: "M 200,400 L 240,400 L 260,430 L 250,460 L 220,470 L 190,450 L 185,420 Z",
    cx: 222, cy: 435,
  },
  asir: {
    path: "M 280,420 L 320,400 L 360,370 L 400,360 L 420,390 L 400,430 L 360,450 L 310,460 L 260,430 Z",
    cx: 340, cy: 415,
  },
  najran: {
    path: "M 400,430 L 460,370 L 500,380 L 520,420 L 500,460 L 450,470 L 400,460 Z",
    cx: 460, cy: 430,
  },
  bahah: {
    path: "M 240,400 L 280,420 L 260,430 L 250,460 L 230,450 L 220,420 Z",
    cx: 252, cy: 428,
  },
};

// ─── Color scale based on compliance rate ─────────────────
function getComplianceColor(rate: number, opacity = 1): string {
  if (rate >= 70) return `rgba(34, 197, 94, ${opacity})`; // green
  if (rate >= 50) return `rgba(234, 179, 8, ${opacity})`; // yellow
  if (rate >= 30) return `rgba(249, 115, 22, ${opacity})`; // orange
  return `rgba(239, 68, 68, ${opacity})`; // red
}

function getComplianceGlow(rate: number): string {
  if (rate >= 70) return "0 0 20px rgba(34, 197, 94, 0.4)";
  if (rate >= 50) return "0 0 20px rgba(234, 179, 8, 0.4)";
  if (rate >= 30) return "0 0 20px rgba(249, 115, 22, 0.4)";
  return "0 0 20px rgba(239, 68, 68, 0.4)";
}

interface RegionData {
  id: string;
  name: string;
  nameEn: string;
  totalSites: number;
  compliant: number;
  partial: number;
  nonCompliant: number;
  noPolicy: number;
  complianceRate: number;
  classifications: string[];
}

// ─── Animated Pulse Dot ───────────────────────────────────
function PulseDot({ cx, cy, color, delay = 0 }: { cx: number; cy: number; color: string; delay?: number }) {
  return (
    <g>
      <circle
        cx={cx} cy={cy} r={3}
        fill={color}
      />
      <circle
        cx={cx} cy={cy} r={3}
        fill="none" stroke={color} strokeWidth={1}
      />
    </g>
  );
}

// ─── Region Tooltip ───────────────────────────────────────
function RegionTooltip({ region, x, y }: { region: RegionData; x: number; y: number }) {
  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -110%)" }}
    >
      <div className="bg-black/90 backdrop-blur-xl rounded-2xl border border-[#C5A55A]/20 dark:border-white/20 p-4 min-w-[220px] shadow-2xl">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4" style={{ color: getComplianceColor(region.complianceRate) }} />
          <span className="text-white font-black text-lg">{region.name}</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-white/60 text-sm">نسبة الامتثال</span>
            <span className="font-black text-lg" style={{ color: getComplianceColor(region.complianceRate) }}>
              {region.complianceRate}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#C5A55A]/[0.05] dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ backgroundColor: getComplianceColor(region.complianceRate) }}
              animate={{ width: `${region.complianceRate}%` }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span className="text-white/70">ممتثل: <strong className="text-emerald-400">{region.compliant}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span className="text-white/70">جزئي: <strong className="text-amber-400">{region.partial}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="w-3 h-3 text-rose-400" />
              <span className="text-white/70">غير ممتثل: <strong className="text-rose-400">{region.nonCompliant}</strong></span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-3 h-3 text-slate-400" />
              <span className="text-white/70">لا يعمل: <strong className="text-slate-400">{region.noPolicy}</strong></span>
            </div>
          </div>
          <div className="text-xs text-white/40 mt-1">
            إجمالي المواقع: {region.totalSites}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Heatmap Slide ───────────────────────────────────
export default function SaudiHeatmapSlide({ regionData }: { regionData: RegionData[] }) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const regionMap = useMemo(() => {
    const map: Record<string, RegionData> = {};
    regionData.forEach((r) => { map[r.id] = r; });
    return map;
  }, [regionData]);

  const totalSites = useMemo(() => regionData.reduce((sum, r) => sum + r.totalSites, 0), [regionData]);
  const avgCompliance = useMemo(() => {
    const total = regionData.reduce((sum, r) => sum + r.complianceRate, 0);
    return regionData.length ? Math.round(total / regionData.length) : 0;
  }, [regionData]);

  // Top 3 regions by compliance
  const topRegions = useMemo(() =>
    [...regionData].sort((a, b) => b.complianceRate - a.complianceRate).slice(0, 3),
    [regionData]
  );

  // Bottom 3 regions
  const bottomRegions = useMemo(() =>
    [...regionData].filter(r => r.totalSites > 0).sort((a, b) => a.complianceRate - b.complianceRate).slice(0, 3),
    [regionData]
  );

  const hoveredData = hoveredRegion ? regionMap[hoveredRegion] : null;
  const hoveredPath = hoveredRegion ? REGION_PATHS[hoveredRegion] : null;

  return (
    <div
      className="flex flex-col items-center justify-center h-full px-6 py-4"
      dir="rtl"
    >
      {/* Title */}
      <div
        className="text-center mb-4"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-900 flex items-center justify-center shadow-xl"
          >
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white">
            الخريطة الحرارية — التوزيع الجغرافي للامتثال
          </h2>
        </div>
        <p className="text-white/50 text-sm">توزيع مستوى الامتثال عبر مناطق المملكة العربية السعودية</p>
      </div>

      <div className="flex gap-6 w-full max-w-7xl flex-1 min-h-0">
        {/* Map Area */}
        <div
          className="flex-1 relative rounded-3xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl overflow-hidden"
        >
          {/* Map SVG */}
          <div className="relative w-full h-full p-4">
            <svg
              viewBox="100 10 560 480"
              className="w-full h-full"
              style={{ filter: "drop-shadow(0 0 30px rgba(139, 92, 246, 0.1))" }}
            >
              {/* Background glow */}
              <defs>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(139, 92, 246, 0.05)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <filter id="regionGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <rect x="100" y="10" width="560" height="480" fill="url(#mapGlow)" />

              {/* Region paths */}
              {Object.entries(REGION_PATHS).map(([id, { path, cx, cy }]) => {
                const region = regionMap[id];
                const rate = region?.complianceRate || 0;
                const isHovered = hoveredRegion === id;
                const fillColor = region ? getComplianceColor(rate, isHovered ? 0.8 : 0.5) : "rgba(100,100,100,0.2)";
                const strokeColor = isHovered ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.2)";

                return (
                  <g key={id}>
                    <path
                      d={path}
                      fill={fillColor}
                      stroke={strokeColor}
                      strokeWidth={isHovered ? 2 : 1}
                      style={{
                        cursor: "pointer",
                        filter: isHovered ? "url(#regionGlow)" : "none",
                      }}
                      onMouseEnter={() => setHoveredRegion(id)}
                      onMouseLeave={() => setHoveredRegion(null)}
                    />
                    {/* Region label */}
                    <text
                      x={cx}
                      y={cy - 8}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      opacity={0.9}
                    >
                      {region?.name || id}
                    </text>
                    <text
                      x={cx}
                      y={cy + 6}
                      textAnchor="middle"
                      className="pointer-events-none select-none"
                      fill={getComplianceColor(rate)}
                      fontSize="11"
                      fontWeight="900"
                    >
                      {rate}%
                    </text>
                    {/* Animated pulse on each region center */}
                    {region && region.totalSites > 0 && (
                      <PulseDot
                        cx={cx}
                        cy={cy + 16}
                        color={getComplianceColor(rate)}
                        delay={Math.random() * 2}
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            
              {hoveredData && hoveredPath && (
                <RegionTooltip
                  region={hoveredData}
                  x={(hoveredPath.cx / 660) * 100}
                  y={(hoveredPath.cy / 490) * 100}
                />
              )}
            
          </div>
        </div>

        {/* Side Panel */}
        <div
          className="w-80 flex flex-col gap-4"
        >
          {/* Summary Stats */}
          <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-sm font-bold text-white/60 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              ملخص جغرافي
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5">
                <div className="text-2xl font-black text-white">{totalSites}</div>
                <div className="text-xs text-white/50">إجمالي المواقع</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-[#C5A55A]/[0.03] dark:bg-white/5">
                <div className="text-2xl font-black" style={{ color: getComplianceColor(avgCompliance) }}>
                  {avgCompliance}%
                </div>
                <div className="text-xs text-white/50">متوسط الامتثال</div>
              </div>
            </div>
          </div>

          {/* Top Regions */}
          <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-sm font-bold text-emerald-400 mb-3">🏆 أعلى المناطق امتثالاً</h3>
            <div className="space-y-2">
              {topRegions.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#C5A55A]/[0.03] dark:bg-white/5"
                  onMouseEnter={() => setHoveredRegion(r.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/40 w-5">{i + 1}</span>
                    <span className="text-sm font-bold text-white">{r.name}</span>
                  </div>
                  <span className="text-sm font-black text-emerald-400">{r.complianceRate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Regions */}
          <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-5">
            <h3 className="text-sm font-bold text-rose-400 mb-3">⚠️ أقل المناطق امتثالاً</h3>
            <div className="space-y-2">
              {bottomRegions.map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#C5A55A]/[0.03] dark:bg-white/5"
                  onMouseEnter={() => setHoveredRegion(r.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/40 w-5">{i + 1}</span>
                    <span className="text-sm font-bold text-white">{r.name}</span>
                  </div>
                  <span className="text-sm font-black text-rose-400">{r.complianceRate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-4">
            <h3 className="text-xs font-bold text-white/50 mb-2">مقياس الألوان</h3>
            <div className="flex items-center gap-1">
              <div className="flex-1 h-3 rounded-full" style={{
                background: "linear-gradient(to left, #22c55e, #eab308, #f97316, #ef4444)"
              }} />
            </div>
            <div className="flex justify-between text-[10px] text-white/40 mt-1">
              <span>100%</span>
              <span>70%</span>
              <span>50%</span>
              <span>30%</span>
              <span>0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

```

---

## `client/src/components/ScanExecutionScreen.tsx`

```tsx
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, CheckCircle, XCircle, Loader2, Eye, RefreshCw,
  Rocket, Zap, Globe, Camera, FileText, Search, Lock,
  Terminal, Wifi, AlertTriangle, ArrowLeft, Activity,
  Volume2, VolumeX, Share2, Download, Pause, Play, Square,
  Save, Sun, Moon, Bell, FileSpreadsheet,
} from "lucide-react";
import { useLocation } from "wouter";
import {
  playScanStart, playStageComplete, playDiscoveryAlert,
  playErrorSound, playScanComplete, playClausePass,
  playClauseFail, playSiteComplete, playScreenshotCapture,
  playMilestone, setMuted, getMuted,
} from "@/lib/scanSounds";
import { lazy, Suspense } from "react";
import { downloadBase64File } from "@/lib/excelExport";
import { toast } from "sonner";
const ScanShareCard = lazy(() => import("@/components/ScanShareCard"));

// ===== NOTIFICATION HELPERS =====
const SCAN_CHANNEL_NAME = 'rasid-scan-notifications';

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

function sendBrowserNotification(title: string, body: string, icon?: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      const n = new Notification(title, {
        body,
        icon: icon || LOGO_GOLD,
        badge: LOGO_GOLD,
        tag: 'rasid-scan-complete',
        requireInteraction: true,
      });
      n.onclick = () => { window.focus(); n.close(); };
    }
  } catch (e) { /* ignore */ }
}

function broadcastScanEvent(type: string, data: any) {
  try {
    const channel = new BroadcastChannel(SCAN_CHANNEL_NAME);
    channel.postMessage({ type, ...data });
    channel.close();
  } catch (e) { /* ignore */ }
}

// ===== CONSTANTS =====
import { LOGO_CALLIGRAPHY_GOLD_DARK, LOGO_FULL_DARK, CHARACTER_STANDING } from "@/lib/rasidAssets";
const LOGO_GOLD = LOGO_CALLIGRAPHY_GOLD_DARK;
const LOGO_DARK = LOGO_FULL_DARK;
const CHARACTER = CHARACTER_STANDING;

// ===== TYPES =====
interface ScanExecutionScreenProps {
  jobId: number;
  totalUrls: number;
  jobName: string;
  options: {
    deepScan: boolean;
    parallelScan: boolean;
    captureScreenshots: boolean;
    extractText: boolean;
    scanApps: boolean;
    bypassDynamic: boolean;
    scanDepth: number;
    timeout: number;
  };
  onClose: () => void;
  onNewScan: () => void;
}

interface ConsoleLog {
  id: number;
  time: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system' | 'stage' | 'patriotic';
  message: string;
  typingComplete?: boolean;
}

interface ScanStage {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  status: 'waiting' | 'active' | 'completed' | 'error';
  progress: number;
}

// ===== PATRIOTIC MESSAGES =====
const PATRIOTIC_MESSAGES = [
  "نحمي بيانات وطننا.. نبني مستقبلاً رقمياً آمناً 🇸🇦",
  "حماية البيانات الشخصية.. ركيزة التحول الرقمي في المملكة 🛡️",
  "رؤية 2030.. نحو فضاء رقمي سعودي موثوق وآمن ⚡",
  "الهيئة الوطنية للبيانات والذكاء الاصطناعي.. حارسة البيانات 🏛️",
  "المادة 12 من نظام حماية البيانات الشخصية.. معيار الامتثال 🌟",
  "راصد.. عين المملكة الرقمية على حماية الخصوصية 💪",
  "بياناتك أمانة.. وحمايتها واجب وطني 🔒",
  "نرصد.. نحلل.. نحمي.. من أجل وطن رقمي أكثر أماناً 🚀",
  "الامتثال ليس خياراً.. بل التزام وطني لحماية المواطن 🎯",
  "كل موقع نفحصه.. خطوة نحو إنترنت سعودي أكثر أماناً 🌐",
  "نظام حماية البيانات الشخصية.. درع المملكة الرقمي ⭐",
  "التميز في حماية البيانات.. سمة المملكة العربية السعودية 🏆",
];

const SCAN_STAGES: ScanStage[] = [
  { id: 'init', name: 'تهيئة محرك الفحص', nameEn: 'Initializing Engine', icon: '⚙️', status: 'waiting', progress: 0 },
  { id: 'connect', name: 'الاتصال بالمواقع', nameEn: 'Connecting', icon: '🌐', status: 'waiting', progress: 0 },
  { id: 'screenshot', name: 'التقاط الشاشة', nameEn: 'Screenshots', icon: '📸', status: 'waiting', progress: 0 },
  { id: 'discover', name: 'اكتشاف الخصوصية', nameEn: 'Discovery', icon: '🔍', status: 'waiting', progress: 0 },
  { id: 'extract', name: 'استخراج النصوص', nameEn: 'Extraction', icon: '📄', status: 'waiting', progress: 0 },
  { id: 'ai_analysis', name: 'تحليل الامتثال', nameEn: 'AI Analysis', icon: '🤖', status: 'waiting', progress: 0 },
  { id: 'clause_check', name: 'بنود المادة 12', nameEn: 'Article 12', icon: '⚖️', status: 'waiting', progress: 0 },
  { id: 'report', name: 'التقرير النهائي', nameEn: 'Report', icon: '📊', status: 'waiting', progress: 0 },
];

const CLAUSE_NAMES = [
  "تحديد الغرض من جمع البيانات",
  "تحديد محتوى البيانات المطلوبة",
  "تحديد طريقة جمع البيانات",
  "تحديد وسيلة حفظ البيانات",
  "تحديد كيفية معالجة البيانات",
  "تحديد كيفية إتلاف البيانات",
  "تحديد حقوق صاحب البيانات",
  "كيفية ممارسة الحقوق",
];

const MATRIX_CHARS = "ابتثجحخدذرزسشصضطظعغفقكلمنهويراصد01RASID<>{}[]|/\\";

// ===== MATRIX RAIN =====
function MatrixRain({ light }: { light: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops: number[] = Array(columns).fill(1).map(() => Math.random() * -100);
    const draw = () => {
      ctx.fillStyle = light ? 'rgba(248, 250, 252, 0.06)' : 'rgba(10, 14, 26, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;
      for (let i = 0; i < drops.length; i++) {
        const char = MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)];
        const brightness = Math.random();
        const baseColor = light ? [16, 185, 129] : [34, 197, 94];
        ctx.fillStyle = brightness > 0.8
          ? `rgba(${baseColor.join(',')}, ${light ? 0.5 : 0.8})`
          : brightness > 0.5
          ? `rgba(${baseColor.join(',')}, ${light ? 0.2 : 0.3})`
          : `rgba(${baseColor.join(',')}, ${light ? 0.08 : 0.12})`;
        ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) drops[i] = 0;
        drops[i] += 0.5 + Math.random() * 0.5;
      }
    };
    const interval = setInterval(draw, 50);
    return () => { clearInterval(interval); window.removeEventListener('resize', resize); };
  }, [light]);
  return <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />;
}

// ===== CONFETTI =====
function Confetti() {
  const [particles] = useState(() => {
    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ffffff'];
    return Array.from({ length: 80 }, (_, i) => ({
      id: i, x: 50 + (Math.random() - 0.5) * 40, y: 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4, rotation: Math.random() * 360,
      speedX: (Math.random() - 0.5) * 15, speedY: Math.random() * -12 - 3,
    }));
  });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <div key={p.id} className="absolute animate-confetti-fall"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.size}px`, height: `${p.size * 0.6}px`,
            backgroundColor: p.color, transform: `rotate(${p.rotation}deg)`, borderRadius: '2px',
            '--speed-x': `${p.speedX}px`, '--speed-y': `${p.speedY}px`,
            animationDelay: `${Math.random() * 0.5}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

// ===== TYPING INDICATOR =====
function TypingDots() {
  return (
    <span className="inline-flex gap-0.5 me-1">
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-typing-dot" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-typing-dot" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-typing-dot" style={{ animationDelay: '300ms' }} />
    </span>
  );
}

// ===== MAIN COMPONENT =====
export default function ScanExecutionScreen({
  jobId, totalUrls, jobName, options, onClose, onNewScan,
}: ScanExecutionScreenProps) {
  const [, setLocation] = useLocation();
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [stages, setStages] = useState<ScanStage[]>(SCAN_STAGES.map(s => ({ ...s })));
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [patrioticIndex, setPatrioticIndex] = useState(0);
  const [showConsole, setShowConsole] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null);
  const [latestScreenshotDomain, setLatestScreenshotDomain] = useState<string>('');
  const [clauseStatuses, setClauseStatuses] = useState<Array<'waiting' | 'checking' | 'pass' | 'fail'>>(Array(8).fill('waiting'));
  const [scanComplete, setScanComplete] = useState(false);
  const [scanFailed, setScanFailed] = useState(false);
  const [scanPaused, setScanPaused] = useState(false);
  const [scanCancelled, setScanCancelled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [screenshotReveal, setScreenshotReveal] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lightTheme, setLightTheme] = useState(false);
  const [activeTab, setActiveTab] = useState<'stages' | 'clauses' | 'screenshot'>('stages');
  const consoleRef = useRef<HTMLDivElement>(null);
  const logIdRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const prevCompletedRef = useRef(0);
  const prevFailedRef = useRef(0);
  const stageTransitionRef = useRef<Record<string, boolean>>({});
  const milestoneRef = useRef<Record<number, boolean>>({});
  const pauseTimeRef = useRef(0);

  const [isGeneratingExcel, setIsGeneratingExcel] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Cancel mutation
  const cancelJob = trpc.batchScan.cancel.useMutation();

  // Excel export - uses batchScan.exportJobExcel for detailed job-specific report
  const exportExcelMut = trpc.batchScan.exportJobExcel.useMutation({
    onSuccess: (data: any) => {
      if (data?.base64) {
        downloadBase64File(data.base64, data.filename);
        toast.success('تم تصدير ملف Excel بنجاح');
        addLog('success', '📊 تم تصدير تقرير Excel بنجاح');
      }
      setIsGeneratingExcel(false);
    },
    onError: () => {
      toast.error('حدث خطأ أثناء تصدير Excel');
      addLog('error', '❌ فشل في تصدير تقرير Excel');
      setIsGeneratingExcel(false);
    },
  });

  // Query job progress
  const jobProgress = trpc.batchScan.job.useQuery(
    { id: jobId },
    { refetchInterval: (scanComplete || scanCancelled) ? false : scanPaused ? false : 2000, enabled: !(scanComplete || scanCancelled) }
  );

  // Query recent scans for live feed
  const recentScans = trpc.dashboard.recentScans.useQuery(undefined, {
    refetchInterval: (scanComplete || scanCancelled) ? false : scanPaused ? false : 3000,
    enabled: !(scanComplete || scanCancelled),
  });

  // Theme colors
  const t = useMemo(() => lightTheme ? {
    bg: 'bg-slate-50', bgRaw: '#f8fafc', text: 'text-slate-900', textSub: 'text-slate-500',
    textMuted: 'text-slate-400', border: 'border-slate-200', card: 'bg-[#C5A55A]/[0.04] dark:bg-white/80',
    cardBorder: 'border-slate-200/80', consoleBg: 'bg-slate-900', consoleHeaderBg: 'bg-slate-800',
    headerBg: 'bg-white/90', progressTrack: 'bg-slate-100',
  } : {
    bg: 'bg-[#0a0e1a]', bgRaw: '#0a0e1a', text: 'text-white', textSub: 'text-white/50',
    textMuted: 'text-white/30', border: 'border-[#C5A55A]/10 dark:border-white/10', card: 'bg-white/[0.03]',
    cardBorder: 'border-[#C5A55A]/10 dark:border-white/10', consoleBg: 'bg-[#0d1117]', consoleHeaderBg: 'bg-[#161b22]',
    headerBg: 'bg-[#0a0e1a]/90', progressTrack: 'bg-[#C5A55A]/[0.03] dark:bg-white/5',
  }, [lightTheme]);

  // Add console log helper with typewriter effect
  const addLog = useCallback((type: ConsoleLog['type'], message: string) => {
    const now = new Date();
    const time = now.toLocaleTimeString('ar-SA-u-nu-latn', { hour12: false });
    logIdRef.current++;
    const newLog: ConsoleLog = { id: logIdRef.current, time, type, message, typingComplete: false };
    setConsoleLogs(prev => [...prev.slice(-150), newLog]);
    // Mark typing complete after animation
    const logId = logIdRef.current;
    setTimeout(() => {
      setConsoleLogs(prev => prev.map(l => l.id === logId ? { ...l, typingComplete: true } : l));
    }, Math.min(message.length * 15, 800));
  }, []);

  // Elapsed time counter
  useEffect(() => {
    if (scanPaused || scanComplete || scanCancelled) return;
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current - pauseTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [scanPaused, scanComplete, scanCancelled]);

  // Patriotic messages rotation
  useEffect(() => {
    if (scanComplete || scanCancelled) return;
    const timer = setInterval(() => {
      setPatrioticIndex(prev => (prev + 1) % PATRIOTIC_MESSAGES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [scanComplete, scanCancelled]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  // Initial boot sequence
  useEffect(() => {
    const bootSequence = async () => {
      addLog('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('system', '   ██████╗  █████╗ ███████╗██╗██████╗ ');
      addLog('system', '   ██╔══██╗██╔══██╗██╔════╝██║██╔══██╗');
      addLog('system', '   ██████╔╝███████║███████╗██║██║  ██║');
      addLog('system', '   ██╔══██╗██╔══██║╚════██║██║██║  ██║');
      addLog('system', '   ██║  ██║██║  ██║███████║██║██████╔╝');
      addLog('system', '   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ');
      addLog('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      await delay(400);
      playScanStart();
      addLog('system', '🚀 تشغيل محرك راصد للفحص المتقدم v3.0');
      await delay(200);
      addLog('info', `📋 المهمة: ${jobName}`);
      addLog('info', `🎯 عدد المواقع: ${totalUrls}`);
      await delay(200);
      addLog('info', `⚙️ الخيارات:`);
      if (options.deepScan) addLog('info', '   ├─ 🔬 فحص عميق');
      if (options.parallelScan) addLog('info', '   ├─ ⚡ مسح متوازي');
      if (options.captureScreenshots) addLog('info', '   ├─ 📸 لقطات الشاشة');
      addLog('info', `   └─ ⏱️ المهلة: ${options.timeout}ث`);
      await delay(200);
      addLog('system', '─────────────────────────────────────────────────');
      addLog('patriotic', PATRIOTIC_MESSAGES[0]);
      addLog('system', '─────────────────────────────────────────────────');
      await delay(200);
      addLog('stage', '▶ المرحلة 1/8: تهيئة محرك الفحص...');
      addLog('info', '   ├─ تحميل قواعد البيانات...');
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'active', progress: 30 } : s));
      await delay(400);
      addLog('info', '   ├─ تهيئة محرك الذكاء الاصطناعي...');
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, progress: 60 } : s));
      await delay(400);
      addLog('info', '   └─ تجهيز بيئة الفحص...');
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, progress: 90 } : s));
      await delay(300);
      addLog('success', '✅ تم تهيئة محرك الفحص بنجاح');
      playStageComplete();
      setStages(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'completed', progress: 100 } : s));
      setCurrentStageIndex(1);
      addLog('stage', '▶ المرحلة 2/8: بدء الاتصال بالمواقع...');
      addLog('info', `   ├─ جاري حل DNS لـ ${totalUrls} نطاق...`);
      setStages(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'active', progress: 10 } : s));
    };
    bootSequence();
  }, []);

  // Track progress from job data
  useEffect(() => {
    const data = jobProgress.data;
    if (!data || scanPaused) return;

    const completed = Number(data.completedUrls || 0);
    const failed = Number(data.failedUrls || 0);
    const total = Number(data.totalUrls || totalUrls);
    const processed = completed + failed;
    const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

    // Detect new completions
    if (completed > prevCompletedRef.current) {
      const diff = completed - prevCompletedRef.current;
      for (let i = 0; i < Math.min(diff, 3); i++) {
        const siteNum = prevCompletedRef.current + i + 1;
        addLog('success', `✅ [${siteNum}/${total}] تم فحص الموقع بنجاح`);
      }
      if (diff > 3) {
        addLog('success', `✅ تم فحص ${diff} مواقع إضافية بنجاح (${completed}/${total})`);
      }
      prevCompletedRef.current = completed;
      playSiteComplete();
    }
    if (failed > prevFailedRef.current) {
      const diff = failed - prevFailedRef.current;
      for (let i = 0; i < Math.min(diff, 2); i++) {
        addLog('error', `❌ فشل في فحص الموقع (${prevFailedRef.current + i + 1})`);
      }
      if (diff > 2) addLog('error', `❌ فشل في فحص ${diff} مواقع`);
      prevFailedRef.current = failed;
      playErrorSound();
    }

    // Milestone sounds
    [25, 50, 75].forEach(milestone => {
      if (pct >= milestone && !milestoneRef.current[milestone]) {
        milestoneRef.current[milestone] = true;
        playMilestone();
        addLog('patriotic', `🏆 تم إنجاز ${milestone}% من الفحص!`);
      }
    });

    // Stage transitions
    const transition = (stageIdx: number, threshold: number, nextStageName: string, nextStageNum: number) => {
      const key = `stage_${stageIdx}`;
      if (pct >= threshold && stages[stageIdx].status !== 'completed' && !stageTransitionRef.current[key]) {
        stageTransitionRef.current[key] = true;
        playStageComplete();
        setStages(prev => prev.map((s, i) => {
          if (i === stageIdx) return { ...s, status: 'completed', progress: 100 };
          if (i === stageIdx + 1) return { ...s, status: 'active', progress: 5 };
          return s;
        }));
        setCurrentStageIndex(stageIdx + 1);
        addLog('success', `✅ اكتملت المرحلة ${stageIdx + 1}`);
        if (nextStageName) addLog('stage', `▶ المرحلة ${nextStageNum}/8: ${nextStageName}...`);
      }
    };

    transition(1, 5, 'التقاط لقطات الشاشة', 3);
    transition(2, 15, 'اكتشاف صفحات سياسة الخصوصية', 4);
    transition(3, 30, 'استخراج وتحليل النصوص', 5);
    transition(4, 50, 'تحليل الامتثال بالذكاء الاصطناعي', 6);

    if (pct >= 50 && !stageTransitionRef.current['patriotic_mid']) {
      stageTransitionRef.current['patriotic_mid'] = true;
      addLog('patriotic', PATRIOTIC_MESSAGES[Math.floor(Math.random() * PATRIOTIC_MESSAGES.length)]);
    }

    transition(5, 70, 'التحقق من بنود المادة 12', 7);

    // Animate clause checks when stage 7 starts
    if (pct >= 70 && !stageTransitionRef.current['clause_anim']) {
      stageTransitionRef.current['clause_anim'] = true;
      setActiveTab('clauses');
      CLAUSE_NAMES.forEach((name, idx) => {
        setTimeout(() => {
          setClauseStatuses(prev => { const next = [...prev]; next[idx] = 'checking'; return next; });
          addLog('info', `   ⚖️ التحقق من البند ${idx + 1}: ${name}...`);
          setTimeout(() => {
            const passed = Math.random() > 0.2;
            setClauseStatuses(prev => { const next = [...prev]; next[idx] = passed ? 'pass' : 'fail'; return next; });
            if (passed) playClausePass(); else playClauseFail();
            addLog(passed ? 'success' : 'warning', `   ${passed ? '✅' : '⚠️'} البند ${idx + 1}: ${name} - ${passed ? 'ممتثل' : 'يحتاج مراجعة'}`);
          }, 500);
        }, idx * 700);
      });
    }

    transition(6, 90, 'إعداد التقرير النهائي', 8);

    // Update active stage progress
    setStages(prev => prev.map(s => s.status === 'active' ? { ...s, progress: Math.min(s.progress + 2, 95) } : s));

    // Completion
    if (data.status === 'completed' && !scanComplete) {
      setScanComplete(true);
      setStages(prev => prev.map(s => ({ ...s, status: 'completed', progress: 100 })));
      addLog('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      addLog('success', `🎉 اكتمل الفحص بنجاح!`);
      addLog('success', `📊 النتائج: ${completed} ناجح | ${failed} فاشل | الإجمالي: ${total}`);
      addLog('success', `⏱️ الوقت المستغرق: ${formatTime(Math.floor((Date.now() - startTimeRef.current) / 1000))}`);
      addLog('patriotic', '🇸🇦 تم بحمد الله.. راصد يحمي بيانات الوطن');
      addLog('system', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      setTimeout(() => { setShowConfetti(true); playScanComplete(); }, 300);
      // Send browser notification
      sendBrowserNotification(
        'راصد - اكتمل الفحص بنجاح 🎉',
        `${jobName}: ${completed} ناجح | ${failed} فاشل | الإجمالي: ${total}`
      );
      // Broadcast to parent window
      broadcastScanEvent('scan-complete', {
        jobId, jobName, completed, failed, total,
        duration: formatTime(Math.floor((Date.now() - startTimeRef.current) / 1000)),
        status: 'completed',
      });
    }
    if (data.status === 'failed') {
      setScanFailed(true);
      addLog('error', '❌ فشل الفحص - يرجى المحاولة مرة أخرى');
      sendBrowserNotification('راصد - فشل الفحص ❌', `${jobName}: فشل الفحص - يرجى المحاولة مرة أخرى`);
      broadcastScanEvent('scan-failed', { jobId, jobName, status: 'failed' });
    }
    if (data.status === 'cancelled' && !scanCancelled) {
      setScanCancelled(true);
      addLog('warning', '⏹️ تم إيقاف الفحص');
      sendBrowserNotification('راصد - تم إيقاف الفحص ⏹️', `${jobName}: تم إيقاف الفحص - ${completed} موقع مكتمل`);
      broadcastScanEvent('scan-cancelled', { jobId, jobName, completed, failed, total, status: 'cancelled' });
    }
  }, [jobProgress.data, scanPaused]);

  // Track latest screenshot
  useEffect(() => {
    if (recentScans.data && recentScans.data.length > 0) {
      const latest = recentScans.data[0];
      if (latest.screenshotUrl && latest.screenshotUrl !== latestScreenshot) {
        setLatestScreenshot(latest.screenshotUrl as string);
        setLatestScreenshotDomain(latest.domain);
        playScreenshotCapture();
        playDiscoveryAlert();
        addLog('info', `📸 تم التقاط لقطة شاشة: ${latest.domain}`);
        setScreenshotReveal(true);
        setActiveTab('screenshot');
        setTimeout(() => setScreenshotReveal(false), 2000);
      }
    }
  }, [recentScans.data]);

  // Pause/Resume handlers
  const handlePause = useCallback(() => {
    setScanPaused(true);
    pauseTimeRef.current = Date.now();
    addLog('warning', '⏸️ تم إيقاف الفحص مؤقتاً');
  }, [addLog]);

  const handleResume = useCallback(() => {
    const pauseDuration = Date.now() - pauseTimeRef.current;
    startTimeRef.current += pauseDuration;
    setScanPaused(false);
    addLog('info', '▶️ تم استئناف الفحص');
  }, [addLog]);

  const handleCancel = useCallback(async () => {
    try {
      await cancelJob.mutateAsync({ id: jobId });
      setScanCancelled(true);
      addLog('warning', '⏹️ تم إيقاف الفحص نهائياً');
      addLog('info', `📊 النتائج الجزئية: ${prevCompletedRef.current} ناجح | ${prevFailedRef.current} فاشل`);
    } catch {
      addLog('error', '❌ فشل في إيقاف الفحص');
    }
  }, [jobId, cancelJob, addLog]);

  const data = jobProgress.data;
  const completed = Number(data?.completedUrls || 0);
  const failed = Number(data?.failedUrls || 0);
  const total = Number(data?.totalUrls || totalUrls);
  const processed = completed + failed;
  const overallPct = total > 0 ? Math.round((processed / total) * 100) : 0;
  const sitesPerSecond = elapsedTime > 5 ? (processed / elapsedTime).toFixed(1) : '0.0';
  const estimatedRemaining = elapsedTime > 5 && processed > 0
    ? Math.ceil((total - processed) / (processed / elapsedTime)) : null;

  const isRunning = !scanComplete && !scanFailed && !scanCancelled;
  const isFinished = scanComplete || scanFailed || scanCancelled;

  // PDF generation
  const handleGeneratePdf = useCallback(async () => {
    setIsGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFont('helvetica');
      doc.setFontSize(22);
      doc.setTextColor(34, 197, 94);
      doc.text('RASID Scan Report', 105, 25, { align: 'center' });
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(jobName, 105, 35, { align: 'center' });
      doc.setDrawColor(34, 197, 94);
      doc.line(20, 40, 190, 40);
      doc.setFontSize(14);
      doc.setTextColor(50, 50, 50);
      doc.text('Scan Summary', 20, 52);
      doc.setFontSize(11);
      doc.text(`Total Sites: ${total}`, 25, 62);
      doc.text(`Completed: ${completed}`, 25, 70);
      doc.text(`Failed: ${failed}`, 25, 78);
      doc.text(`Duration: ${formatTime(elapsedTime)}`, 25, 86);
      doc.text(`Completion: ${overallPct}%`, 25, 94);
      doc.setFontSize(14);
      doc.text('Article 12 Clause Verification', 20, 110);
      doc.setFontSize(10);
      CLAUSE_NAMES.forEach((name, idx) => {
        const status = clauseStatuses[idx];
        const statusText = status === 'pass' ? 'COMPLIANT' : status === 'fail' ? 'NON-COMPLIANT' : 'PENDING';
        const y = 120 + idx * 8;
        doc.setTextColor(status === 'pass' ? 34 : status === 'fail' ? 239 : 150, status === 'pass' ? 197 : status === 'fail' ? 68 : 150, status === 'pass' ? 94 : status === 'fail' ? 68 : 150);
        doc.text(`${statusText}`, 25, y);
        doc.setTextColor(80, 80, 80);
        doc.text(`Clause ${idx + 1}: ${name}`, 55, y);
      });
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated by RASID Platform - ${new Date().toLocaleString('ar-SA-u-nu-latn')}`, 105, 285, { align: 'center' });
      doc.save(`rasid-report-${jobId}-${Date.now()}.pdf`);
      addLog('success', '✅ تم توليد تقرير PDF بنجاح');
    } catch {
      addLog('error', '❌ فشل في توليد تقرير PDF');
    }
    setIsGeneratingPdf(false);
  }, [jobId, jobName, total, completed, failed, elapsedTime, overallPct, clauseStatuses, addLog]);

  return (
    <div className={`fixed inset-0 z-[100] ${t.bg} ${lightTheme ? 'text-slate-900' : 'text-white'} overflow-hidden`} dir="rtl">
      {/* Matrix Rain Background */}
      {isRunning && <MatrixRain light={lightTheme} />}
      {showConfetti && <Confetti />}

      {/* Gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-0 left-0 w-[400px] h-[400px] ${lightTheme ? 'bg-emerald-200/20' : 'bg-blue-600/8'} rounded-full blur-[120px] animate-pulse-slow`} />
        <div className={`absolute bottom-0 right-0 w-[400px] h-[400px] ${lightTheme ? 'bg-blue-200/20' : 'bg-emerald-600/8'} rounded-full blur-[120px] animate-pulse-slow`} style={{ animationDelay: '2s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(${lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />
        {/* Scan line */}
        {isRunning && !scanPaused && (
          <div className={`absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent ${lightTheme ? 'via-emerald-500/40' : 'via-cyan-400/60'} to-transparent animate-scan-line`} />
        )}
      </div>

      {/* ===== HEADER - Fixed ===== */}
      <div className={`relative z-10 ${t.border} border-b ${t.headerBg} backdrop-blur-xl`}>
        <div className="max-w-[1600px] mx-auto px-3 py-2 flex items-center justify-between">
          {/* Left: Logo + Info */}
          <div className="flex items-center gap-2.5">
            <img src={lightTheme ? LOGO_DARK : LOGO_GOLD} alt="راصد" className="h-8 w-auto animate-pulse-slow" />
            <div className="hidden sm:block">
              <h1 className={`text-xs font-bold ${lightTheme ? 'text-slate-800' : 'text-white/90'} flex items-center gap-1.5`}>
                محرك راصد للفحص المتقدم
                {isRunning && !scanPaused && <TypingDots />}
              </h1>
              <p className={`text-[10px] ${t.textMuted} truncate max-w-[160px]`}>{jobName}</p>
            </div>
          </div>

          {/* Center: Status badges */}
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            {isRunning && !scanPaused && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse-border">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-red-400 font-medium">مباشر</span>
              </div>
            )}
            {scanPaused && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <Pause className="h-3 w-3 text-amber-400" />
                <span className="text-[10px] text-amber-400 font-medium">متوقف مؤقتاً</span>
              </div>
            )}
            {/* Speed */}
            {isRunning && processed > 0 && (
              <div className={`flex items-center gap-1.5 px-2.5 py-1 ${lightTheme ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'} border rounded-full`}>
                <Zap className="h-3 w-3 text-amber-500" />
                <span className={`text-[10px] font-mono ${lightTheme ? 'text-amber-700' : 'text-amber-300'}`}>{sitesPerSecond} موقع/ث</span>
              </div>
            )}
            {/* Timer */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 ${lightTheme ? 'bg-slate-100 border-slate-200' : 'bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10'} border rounded-full`}>
              <Activity className={`h-3 w-3 ${lightTheme ? 'text-slate-400' : 'text-white/50'}`} />
              <span className={`text-[10px] font-mono ${lightTheme ? 'text-slate-600' : 'text-white/70'}`}>{formatTime(elapsedTime)}</span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5">
            {/* Pause/Resume */}
            {isRunning && (
              <button onClick={scanPaused ? handleResume : handlePause}
                className={`p-1.5 rounded-lg border transition-all ${scanPaused
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : `${lightTheme ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'} hover:opacity-80`
                }`}
                title={scanPaused ? 'استئناف' : 'إيقاف مؤقت'}>
                {scanPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
            )}
            {/* Stop */}
            {isRunning && (
              <button onClick={handleCancel}
                className={`p-1.5 rounded-lg border transition-all ${lightTheme ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-500/10 border-red-500/30 text-red-400'} hover:opacity-80`}
                title="إيقاف نهائي">
                <Square className="h-3.5 w-3.5" />
              </button>
            )}
            {/* Sound */}
            <button onClick={() => { const m = !soundMuted; setSoundMuted(m); setMuted(m); }}
              className={`p-1.5 rounded-lg border transition-all ${soundMuted
                ? `${lightTheme ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10 text-white/30'}`
                : `${lightTheme ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`
              }`}
              title={soundMuted ? 'تفعيل الصوت' : 'كتم الصوت'}>
              {soundMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
            {/* Theme toggle */}
            <button onClick={() => setLightTheme(!lightTheme)}
              className={`p-1.5 rounded-lg border transition-all ${lightTheme ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10 text-white/50'}`}
              title={lightTheme ? 'الوضع الداكن' : 'الوضع الفاتح'}>
              {lightTheme ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </button>
            {/* Console toggle */}
            <button onClick={() => setShowConsole(!showConsole)}
              className={`p-1.5 rounded-lg border transition-all ${showConsole
                ? `${lightTheme ? 'bg-cyan-50 border-cyan-200 text-cyan-600' : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'}`
                : `${lightTheme ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-[#C5A55A]/[0.03] dark:bg-white/5 border-[#C5A55A]/10 dark:border-white/10 text-white/50'}`
              }`}>
              <Terminal className="h-3.5 w-3.5" />
            </button>
            {/* Save results */}
            {isFinished && (
              <button onClick={() => { onClose(); setLocation("/scan-library"); }}
                className={`p-1.5 rounded-lg border transition-all ${lightTheme ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}
                title="عرض النتائج">
                <Save className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT - Flex no-scroll ===== */}
      <div className="relative z-10 flex flex-col h-[calc(100vh-48px)]">
        {/* Patriotic Banner */}
        <div className="px-3 pt-2">
          <div className={`${lightTheme ? 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border-emerald-200' : 'bg-gradient-to-r from-emerald-900/30 via-white/5 to-emerald-900/30 border-emerald-500/20'} border rounded-lg px-3 py-1.5 text-center relative overflow-hidden`}>
            <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <p className={`text-xs ${lightTheme ? 'text-emerald-700' : 'text-emerald-300/90'} font-medium-out`} key={patrioticIndex}>
              {PATRIOTIC_MESSAGES[patrioticIndex]}
            </p>
          </div>
        </div>

        {/* Progress Bar - Compact */}
        <div className="px-3 pt-2">
          <div className={`${t.card} border ${t.cardBorder} rounded-xl p-3 backdrop-blur-sm relative overflow-hidden`}>
            {!isFinished && overallPct > 0 && (
              <div className="absolute top-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-primary to-cyan-500 rounded-t-xl transition-all duration-1000" style={{ width: `${overallPct}%` }} />
            )}
            {scanComplete && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-400 rounded-t-xl animate-shimmer-bar" />}

            <div className="flex items-center gap-3">
              {/* Circular progress - smaller */}
              <div className="relative shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke={lightTheme ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'} strokeWidth="5" />
                  <circle cx="40" cy="40" r="34" fill="none"
                    stroke={scanComplete ? '#22c55e' : scanFailed ? '#ef4444' : scanCancelled ? '#f59e0b' : 'url(#progressGrad)'}
                    strokeWidth="5" strokeLinecap="round"
                    strokeDasharray={`${overallPct * 2.136} 213.6`}
                    className="transition-all duration-1000 ease-out" />
                  <defs>
                    <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" /><stop offset="50%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-bold font-mono ${lightTheme ? 'text-slate-800' : 'bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent'}`}>{overallPct}%</span>
                </div>
              </div>

              {/* Status text */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h2 className={`text-sm font-bold ${lightTheme ? 'text-slate-800' : ''}`}>
                    {scanComplete ? '🎉 اكتمل الفحص!' : scanFailed ? '❌ فشل الفحص' : scanCancelled ? '⏹️ تم الإيقاف' : scanPaused ? '⏸️ متوقف مؤقتاً' : 'جاري الفحص...'}
                  </h2>
                  <div className="flex gap-2">
                    <span className={`text-xs font-mono ${lightTheme ? 'text-emerald-600' : 'text-emerald-400'}`}>{completed}✓</span>
                    <span className={`text-xs font-mono ${lightTheme ? 'text-red-600' : 'text-red-400'}`}>{failed}✗</span>
                    <span className={`text-xs font-mono ${t.textSub}`}>{processed}/{total}</span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className={`relative h-2 ${t.progressTrack} rounded-full overflow-hidden`}>
                  <div className="absolute inset-y-0 right-0 rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${overallPct}%`,
                      background: scanComplete ? 'linear-gradient(90deg, #22c55e, #10b981)'
                        : scanCancelled ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                        : 'linear-gradient(90deg, #3b82f6, #6366f1, #8b5cf6, #06b6d4)',
                      backgroundSize: '200% 100%',
                    }} />
                  {isRunning && !scanPaused && overallPct > 0 && (
                    <div className="absolute inset-y-0 right-0 rounded-full animate-shimmer"
                      style={{ width: `${overallPct}%`, background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)', backgroundSize: '200% 100%' }} />
                  )}
                  {isRunning && !scanPaused && overallPct > 2 && (
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white/40 blur-sm transition-all duration-1000"
                      style={{ right: `calc(${100 - overallPct}% - 6px)` }} />
                  )}
                </div>
                {estimatedRemaining && isRunning && (
                  <p className={`text-[10px] ${t.textMuted} mt-0.5`}>الوقت المتبقي: ~{formatTime(estimatedRemaining)}</p>
                )}
              </div>

              {/* Character mascot */}
              <div className="hidden lg:block shrink-0">
                <img src={CHARACTER} alt="راصد" className={`h-12 w-12 rounded-full object-cover border-2 ${
                  scanComplete ? 'border-emerald-400 shadow-lg shadow-emerald-500/20' :
                  isRunning ? 'border-blue-400/50 animate-pulse-slow' :
                  'border-amber-400/50'
                }`} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid - Fills remaining space */}
        <div className={`flex-1 min-h-0 px-3 pt-2 pb-2 grid gap-2 ${showConsole ? 'grid-cols-1 lg:grid-cols-[1fr_1fr]' : 'grid-cols-1'}`}>
          {/* Left Column: Stages Panel with tabs */}
          <div className={`${t.card} border ${t.cardBorder} rounded-xl backdrop-blur-sm flex flex-col overflow-hidden`}>
            {/* Tab bar */}
            <div className={`flex items-center gap-1 px-3 py-1.5 border-b ${t.border} shrink-0`}>
              <button onClick={() => setActiveTab('stages')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${activeTab === 'stages'
                  ? `${lightTheme ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/15 text-blue-400 border-blue-500/30'} border`
                  : `${lightTheme ? 'text-slate-500 hover:bg-slate-50' : 'text-white/40 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5'}`
                }`}>
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> المراحل ({stages.filter(s => s.status === 'completed').length}/8)</span>
              </button>
              <button onClick={() => setActiveTab('clauses')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${activeTab === 'clauses'
                  ? `${lightTheme ? 'bg-primary/5 text-primary border-primary/20' : 'bg-primary/15 text-primary border-primary/30'} border`
                  : `${lightTheme ? 'text-slate-500 hover:bg-slate-50' : 'text-white/40 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5'}`
                }`}>
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> المادة 12 ({clauseStatuses.filter(s => s === 'pass' || s === 'fail').length}/8)</span>
              </button>
              {latestScreenshot && (
                <button onClick={() => setActiveTab('screenshot')}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${activeTab === 'screenshot'
                    ? `${lightTheme ? 'bg-cyan-50 text-cyan-700 border-cyan-200' : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'} border`
                    : `${lightTheme ? 'text-slate-500 hover:bg-slate-50' : 'text-white/40 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5'}`
                  }`}>
                  <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> لقطة</span>
                </button>
              )}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
              {/* Stages tab */}
              {activeTab === 'stages' && (
                <div className="space-y-1">
                  {stages.map((stage, idx) => (
                    <div key={stage.id}
                      className={`flex items-center gap-2 p-2 rounded-lg transition-all duration-500 ${
                        stage.status === 'active' ? `${lightTheme ? 'bg-blue-50 border-blue-200' : 'bg-blue-500/10 border-blue-500/20'} border scale-[1.01]` :
                        stage.status === 'completed' ? `${lightTheme ? 'bg-emerald-50/50 border-emerald-100' : 'bg-emerald-500/5 border-emerald-500/10'} border` :
                        stage.status === 'error' ? `${lightTheme ? 'bg-red-50 border-red-200' : 'bg-red-500/5 border-red-500/10'} border` :
                        `${lightTheme ? 'bg-slate-50/50 border-transparent' : 'bg-white/[0.01] border-transparent'} border`
                      }`}>
                      <div className={`text-base w-6 text-center transition-all duration-300 ${
                        stage.status === 'active' ? 'scale-110' : stage.status === 'completed' ? '' : 'grayscale opacity-40'
                      }`}>{stage.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`text-[11px] font-medium ${
                              stage.status === 'active' ? `${lightTheme ? 'text-blue-700' : 'text-blue-300'}` :
                              stage.status === 'completed' ? `${lightTheme ? 'text-emerald-700' : 'text-emerald-300/80'}` :
                              `${lightTheme ? 'text-slate-300' : 'text-white/25'}`
                            }`}>{stage.name}</span>
                            {stage.status === 'active' && (
                              <span className={`text-[9px] ${lightTheme ? 'text-slate-400' : 'text-white/30'} block`}>{stage.nameEn}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {stage.status === 'active' && (
                              <div className="flex items-center gap-1">
                                <span className={`text-[9px] font-mono ${lightTheme ? 'text-blue-500' : 'text-blue-400/70'}`}>{stage.progress}%</span>
                                <Loader2 className={`h-3 w-3 ${lightTheme ? 'text-blue-500' : 'text-blue-400'} animate-spin`} />
                              </div>
                            )}
                            {stage.status === 'completed' && <CheckCircle className="h-3.5 w-3.5 text-emerald-500 animate-check-pop" />}
                            {stage.status === 'error' && <XCircle className="h-3.5 w-3.5 text-red-500" />}
                            {stage.status === 'waiting' && <div className={`w-2.5 h-2.5 rounded-full border ${lightTheme ? 'border-slate-200' : 'border-[#C5A55A]/10 dark:border-white/10'}`} />}
                          </div>
                        </div>
                        {stage.status === 'active' && (
                          <div className={`mt-1 h-1 ${t.progressTrack} rounded-full overflow-hidden`}>
                            <div className="h-full rounded-full transition-all duration-500 relative"
                              style={{ width: `${stage.progress}%`, background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}>
                              <div className="absolute inset-0 animate-shimmer rounded-full"
                                style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)', backgroundSize: '200% 100%' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Clauses tab */}
              {activeTab === 'clauses' && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className={`h-4 w-4 ${lightTheme ? 'text-primary' : 'text-primary'}`} />
                    <span className={`text-xs font-bold ${lightTheme ? 'text-slate-700' : 'text-white/80'}`}>التحقق من بنود المادة 12</span>
                  </div>
                  {CLAUSE_NAMES.map((name, idx) => (
                    <div key={idx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all duration-500 ${
                        clauseStatuses[idx] === 'checking' ? `${lightTheme ? 'bg-amber-50 border-amber-200' : 'bg-amber-500/10 border-amber-500/20'} border animate-pulse` :
                        clauseStatuses[idx] === 'pass' ? `${lightTheme ? 'bg-emerald-50 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/20'} border` :
                        clauseStatuses[idx] === 'fail' ? `${lightTheme ? 'bg-red-50 border-red-200' : 'bg-red-500/10 border-red-500/20'} border` :
                        `${lightTheme ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.02] border-[#C5A55A]/8 dark:border-white/5'} border`
                      }`}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {clauseStatuses[idx] === 'checking' && <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />}
                        {clauseStatuses[idx] === 'pass' && <CheckCircle className="h-4 w-4 text-emerald-500 animate-check-pop" />}
                        {clauseStatuses[idx] === 'fail' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {clauseStatuses[idx] === 'waiting' && <span className={`text-xs ${lightTheme ? 'text-slate-300' : 'text-white/20'}`}>{idx + 1}</span>}
                      </div>
                      <div className="flex-1">
                        <span className={`text-[11px] font-medium ${
                          clauseStatuses[idx] === 'waiting' ? `${lightTheme ? 'text-slate-300' : 'text-white/25'}` :
                          `${lightTheme ? 'text-slate-700' : 'text-white/70'}`
                        }`}>{name}</span>
                      </div>
                      {clauseStatuses[idx] !== 'waiting' && clauseStatuses[idx] !== 'checking' && (
                        <Badge variant="outline" className={`text-[9px] ${
                          clauseStatuses[idx] === 'pass' ? 'border-emerald-500/30 text-emerald-500' : 'border-red-500/30 text-red-500'
                        }`}>
                          {clauseStatuses[idx] === 'pass' ? 'ممتثل' : 'غير ممتثل'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Screenshot tab */}
              {activeTab === 'screenshot' && latestScreenshot && (
                <div className={`${screenshotReveal ? 'animate-screenshot-reveal' : 'animate-slide-up'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className={`h-4 w-4 ${lightTheme ? 'text-cyan-600' : 'text-cyan-400'}`} />
                    <span className={`text-xs font-bold ${lightTheme ? 'text-slate-700' : 'text-white/80'}`}>آخر لقطة شاشة</span>
                    <Badge variant="outline" className={`text-[9px] me-auto ${lightTheme ? 'border-cyan-300 text-cyan-600' : 'border-cyan-500/30 text-cyan-400'}`}>
                      {latestScreenshotDomain}
                    </Badge>
                  </div>
                  <div className={`relative rounded-xl overflow-hidden border ${t.border} group`}>
                    <img src={latestScreenshot} alt={latestScreenshotDomain}
                      className="w-full h-auto max-h-[40vh] object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                      <Globe className="h-3 w-3 text-cyan-400" />
                      <span className="text-[10px] text-white/80">{latestScreenshotDomain}</span>
                    </div>
                    {screenshotReveal && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 animate-fade-out-slow">
                        <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl px-4 py-2 backdrop-blur-sm">
                          <p className="text-sm text-emerald-300 font-bold">📸 تم اكتشاف صفحة الخصوصية!</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className={`absolute left-0 right-0 h-[1px] ${lightTheme ? 'bg-emerald-500/30' : 'bg-cyan-400/40'} animate-scan-line-fast`} />
                    </div>
                  </div>
                </div>
              )}

              {/* Completion actions inside tab area */}
              {isFinished && activeTab === 'stages' && (
                <div className={`mt-3 p-4 rounded-xl border ${t.border} ${scanComplete ? `${lightTheme ? 'bg-emerald-50/50' : 'bg-emerald-500/5'}` : `${lightTheme ? 'bg-slate-50' : 'bg-white/[0.02]'}`}`}>
                  <div className="text-center mb-3">
                    {scanComplete && (
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/20 mb-2 animate-bounce-slow relative">
                        <CheckCircle className="h-7 w-7 text-emerald-500" />
                        <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping-slow" />
                      </div>
                    )}
                    {scanCancelled && (
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 mb-2">
                        <Square className="h-7 w-7 text-amber-500" />
                      </div>
                    )}
                    {scanFailed && (
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-500/20 mb-2">
                        <XCircle className="h-7 w-7 text-red-500" />
                      </div>
                    )}
                    <h3 className={`text-base font-bold ${lightTheme ? 'text-slate-800' : ''} mb-0.5`}>
                      {scanComplete ? 'تم الفحص بنجاح! 🎉' : scanCancelled ? 'تم إيقاف الفحص' : 'حدث خطأ'}
                    </h3>
                    <p className={`text-xs ${t.textSub}`}>
                      {completed + failed} موقع في {formatTime(elapsedTime)}
                    </p>
                    <div className="flex justify-center gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-500">{completed}</div>
                        <div className={`text-[9px] ${t.textMuted}`}>ناجح</div>
                      </div>
                      <div className={`w-px ${lightTheme ? 'bg-slate-200' : 'bg-[#C5A55A]/[0.05] dark:bg-white/10'}`} />
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-500">{failed}</div>
                        <div className={`text-[9px] ${t.textMuted}`}>فاشل</div>
                      </div>
                      <div className={`w-px ${lightTheme ? 'bg-slate-200' : 'bg-[#C5A55A]/[0.05] dark:bg-white/10'}`} />
                      <div className="text-center">
                        <div className={`text-lg font-bold ${lightTheme ? 'text-blue-600' : 'text-blue-400'}`}>{formatTime(elapsedTime)}</div>
                        <div className={`text-[9px] ${t.textMuted}`}>المدة</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Button size="sm" onClick={() => { onClose(); setLocation("/scan-library"); }}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8">
                      <Eye className="h-3.5 w-3.5" /> عرض النتائج
                    </Button>
                    {(scanComplete || scanCancelled) && (
                      <Button size="sm" onClick={handleGeneratePdf} disabled={isGeneratingPdf}
                        className="gap-1.5 bg-gradient-to-r from-primary to-[oklch(0.48_0.14_290)] hover:from-primary/90 hover:to-primary text-white text-xs h-8">
                        <Download className="h-3.5 w-3.5" /> {isGeneratingPdf ? 'جاري...' : 'PDF'}
                      </Button>
                    )}
                    {(scanComplete || scanCancelled) && (
                      <Button size="sm" onClick={() => { setIsGeneratingExcel(true); exportExcelMut.mutate({ jobId }); }} disabled={isGeneratingExcel}
                        className="gap-1.5 bg-gradient-to-r from-emerald-600 to-blue-900 hover:from-emerald-700 hover:to-blue-950 text-white text-xs h-8">
                        <FileSpreadsheet className="h-3.5 w-3.5" /> {isGeneratingExcel ? 'جاري...' : 'Excel'}
                      </Button>
                    )}
                    {(scanComplete || scanCancelled) && (
                      <Button size="sm" onClick={() => setShowShareDialog(true)}
                        className="gap-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs h-8">
                        <Share2 className="h-3.5 w-3.5" /> مشاركة
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={onNewScan}
                      className={`gap-1.5 text-xs h-8 ${lightTheme ? 'border-slate-300 text-slate-700' : 'border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10'}`}>
                      <RefreshCw className="h-3.5 w-3.5" /> فحص جديد
                    </Button>
                    <Button size="sm" variant="outline" onClick={onClose}
                      className={`gap-1.5 text-xs h-8 ${lightTheme ? 'border-slate-300 text-slate-700' : 'border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10'}`}>
                      <ArrowLeft className="h-3.5 w-3.5" /> إغلاق
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Console */}
          {showConsole && (
            <div className={`${t.consoleBg} border ${lightTheme ? 'border-slate-300' : 'border-[#C5A55A]/10 dark:border-white/10'} rounded-xl overflow-hidden backdrop-blur-sm flex flex-col shadow-2xl shadow-black/30`}>
              {/* Console Header */}
              <div className={`flex items-center justify-between px-3 py-1.5 ${t.consoleHeaderBg} border-b ${lightTheme ? 'border-slate-300' : 'border-[#C5A55A]/10 dark:border-white/10'} shrink-0`}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[10px] text-white/40 font-mono me-2">rasid-scanner@v3.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Wifi className="h-2.5 w-2.5 text-emerald-400" />
                    <span className="text-[9px] text-emerald-400/70">متصل</span>
                  </div>
                  <span className="text-[9px] text-white/20 font-mono">{consoleLogs.length} سطر</span>
                </div>
              </div>
              {/* Console Body */}
              <div ref={consoleRef}
                className="flex-1 overflow-y-auto p-2.5 font-mono text-[11px] space-y-0.5 custom-scrollbar"
                style={{ direction: 'ltr' }}>
                {consoleLogs.map(log => (
                  <div key={log.id} className={`flex gap-1.5 leading-relaxed ${log.typingComplete ? '' : 'animate-typewriter'}`}>
                    <span className="text-white/15 shrink-0 select-none text-[9px]">[{log.time}]</span>
                    <span className={`${
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'warning' ? 'text-amber-400' :
                      log.type === 'system' ? 'text-cyan-400/70' :
                      log.type === 'stage' ? 'text-blue-400 font-bold' :
                      log.type === 'patriotic' ? 'text-emerald-300/80 italic' :
                      'text-white/60'
                    } ${log.typingComplete ? '' : 'animate-typing-text'}`}>
                      {log.message}
                    </span>
                  </div>
                ))}
                {isRunning && !scanPaused && (
                  <div className="flex items-center gap-1 text-emerald-400/50 mt-1">
                    <span className="text-[9px]">rasid@scanner:~$</span>
                    <span className="animate-blink text-emerald-400">▌</span>
                  </div>
                )}
                {scanPaused && (
                  <div className="flex items-center gap-1 text-amber-400/50 mt-1">
                    <span className="text-[9px]">rasid@scanner:~$ [PAUSED]</span>
                    <span className="animate-blink text-amber-400">▌</span>
                  </div>
                )}
                {scanComplete && (
                  <div className="flex items-center gap-1 text-emerald-400/80 mt-1">
                    <span className="text-[9px]">rasid@scanner:~$ scan completed successfully ✓</span>
                  </div>
                )}
                {scanCancelled && (
                  <div className="flex items-center gap-1 text-amber-400/80 mt-1">
                    <span className="text-[9px]">rasid@scanner:~$ scan cancelled by user</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Dialog */}
      {showShareDialog && (
        <Suspense fallback={null}>
          <ScanShareCard
            open={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            jobName={jobName}
            totalSites={total}
            completedSites={completed}
            failedSites={failed}
            elapsedTime={formatTime(elapsedTime)}
            overallPct={overallPct}
            clauseResults={CLAUSE_NAMES.map((name, idx) => ({
              name,
              status: clauseStatuses[idx] === 'pass' ? 'pass' as const : clauseStatuses[idx] === 'fail' ? 'fail' as const : 'waiting' as const,
            }))}
          />
        </Suspense>
      )}

      {/* ===== CSS ANIMATIONS ===== */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-pulse-slow { animation: pulse-slow 6s ease-in-out infinite; }

        @keyframes scan-line {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line { animation: scan-line 4s linear infinite; }

        @keyframes scan-line-fast {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line-fast { animation: scan-line-fast 2s linear infinite; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer { animation: shimmer 2s linear infinite; }

        @keyframes shimmer-bar {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer-bar { background-size: 200% 100%; animation: shimmer-bar 3s linear infinite; }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .{ animation: slide-up 0.4s ease-out; }

        @keyframes typewriter {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-typewriter { animation: typewriter 0.2s ease-out; }

        @keyframes typing-text {
          0% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        .animate-typing-text {
          animation: typing-text 0.4s ease-out forwards;
          background: linear-gradient(90deg, currentColor 50%, transparent 50%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
        }

        @keyframes fade-in-out {
          0% { opacity: 0; transform: translateY(5px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-5px); }
        }
        .animate-fade-in-out { animation: fade-in-out 8s ease-in-out; }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink { animation: blink 1s step-end infinite; }

        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }

        @keyframes check-pop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-check-pop { animation: check-pop 0.4s ease-out; }

        @keyframes confetti-fall {
          0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
          25% { transform: translate(calc(var(--speed-x) * 2), calc(var(--speed-y) * 8)) rotate(180deg); opacity: 1; }
          50% { transform: translate(calc(var(--speed-x) * 3), 200px) rotate(360deg); opacity: 0.8; }
          100% { transform: translate(calc(var(--speed-x) * 4), 600px) rotate(720deg); opacity: 0; }
        }
        .animate-confetti-fall { animation: confetti-fall 3s ease-out forwards; }

        @keyframes typing-dot {
          0%, 60%, 100% { opacity: 0.2; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        .animate-typing-dot { animation: typing-dot 1.4s ease-in-out infinite; }

        @keyframes screenshot-reveal {
          0% { opacity: 0; transform: scale(0.9) translateY(10px); }
          50% { opacity: 1; transform: scale(1.02) translateY(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-screenshot-reveal { animation: screenshot-reveal 0.8s ease-out; }

        @keyframes fade-out-slow {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fade-out-slow { animation: fade-out-slow 2s ease-out forwards; }

        @keyframes pulse-border {
          0%, 100% { border-color: rgba(239, 68, 68, 0.2); }
          50% { border-color: rgba(239, 68, 68, 0.5); }
        }
        .animate-pulse-border { animation: pulse-border 2s ease-in-out infinite; }

        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow { animation: ping-slow 2s ease-out infinite; }

        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

// ===== HELPERS =====
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

```

---

## `client/src/components/ScanShareCard.tsx`

```tsx
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Share2, Download, Copy, CheckCircle, XCircle, Shield,
  Globe, Clock, Zap, Twitter, MessageCircle, Link2,
} from "lucide-react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface ScanShareCardProps {
  open: boolean;
  onClose: () => void;
  jobName: string;
  totalSites: number;
  completedSites: number;
  failedSites: number;
  elapsedTime: string;
  overallPct: number;
  clauseResults?: Array<{ name: string; status: 'pass' | 'fail' | 'waiting' }>;
}

export default function ScanShareCard({
  open, onClose, jobName, totalSites, completedSites, failedSites,
  elapsedTime, overallPct, clauseResults,
}: ScanShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const complianceRate = totalSites > 0 ? Math.round((completedSites / totalSites) * 100) : 0;
  const passedClauses = clauseResults?.filter(c => c.status === 'pass').length || 0;
  const totalClauses = clauseResults?.length || 8;

  const exportAsImage = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#0a0e1a',
      });
      const link = document.createElement('a');
      link.download = `rasid-scan-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('تم تصدير الصورة بنجاح');
    } catch (err) {
      toast.error('فشل في تصدير الصورة');
    }
    setIsExporting(false);
  };

  const copyShareText = () => {
    const text = `📊 تقرير فحص راصد\n━━━━━━━━━━━━━━━━━━\n📋 ${jobName}\n🌐 ${totalSites} موقع تم فحصه\n✅ ${completedSites} ناجح | ❌ ${failedSites} فاشل\n⏱️ المدة: ${elapsedTime}\n⚖️ بنود المادة 12: ${passedClauses}/${totalClauses} ممتثل\n━━━━━━━━━━━━━━━━━━\n🇸🇦 منصة راصد - حماية البيانات الشخصية`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('تم نسخ النتائج');
    });
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(`📊 تم فحص ${totalSites} موقع عبر منصة #راصد\n✅ ${completedSites} ناجح | ❌ ${failedSites} فاشل\n⚖️ بنود المادة 12: ${passedClauses}/${totalClauses}\n🇸🇦 #حماية_البيانات #رؤية2030`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`📊 تقرير فحص راصد\n📋 ${jobName}\n🌐 ${totalSites} موقع | ✅ ${completedSites} ناجح | ❌ ${failedSites} فاشل\n⚖️ بنود المادة 12: ${passedClauses}/${totalClauses}\n🇸🇦 منصة راصد - حماية البيانات الشخصية`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#0d1117] border-[#C5A55A]/10 dark:border-white/10 text-white p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-cyan-400" />
            مشاركة نتائج الفحص
          </DialogTitle>
        </DialogHeader>

        {/* Exportable Card */}
        <div className="p-4">
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-[#0a0e1a] via-[#0d1a2d] to-[#0a1628] rounded-2xl p-6 border border-[#C5A55A]/10 dark:border-white/10 relative overflow-hidden"
            style={{ fontFamily: "'Tajawal', 'DIN Next Arabic', sans-serif" }}
            dir="rtl"
          >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/5 rounded-full blur-[80px]" />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-primary" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">تقرير فحص راصد</h2>
                  <p className="text-xs text-white/40">{jobName}</p>
                </div>
              </div>
              <div className="text-start">
                <div className="text-[10px] text-white/30">منصة راصد</div>
                <div className="text-[10px] text-white/30">🇸🇦 المملكة العربية السعودية</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              <div className="bg-white dark:bg-white/[0.04] rounded-xl p-3 text-center border border-[#C5A55A]/8 dark:border-white/5">
                <Globe className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-blue-400">{totalSites}</div>
                <div className="text-[10px] text-white/40">إجمالي المواقع</div>
              </div>
              <div className="bg-emerald-500/[0.06] rounded-xl p-3 text-center border border-emerald-500/10">
                <CheckCircle className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-emerald-400">{completedSites}</div>
                <div className="text-[10px] text-white/40">ناجح</div>
              </div>
              <div className="bg-red-500/[0.06] rounded-xl p-3 text-center border border-red-500/10">
                <XCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-red-400">{failedSites}</div>
                <div className="text-[10px] text-white/40">فاشل</div>
              </div>
              <div className="bg-amber-500/[0.06] rounded-xl p-3 text-center border border-amber-500/10">
                <Clock className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                <div className="text-xl font-bold text-amber-400">{elapsedTime}</div>
                <div className="text-[10px] text-white/40">المدة</div>
              </div>
            </div>

            {/* Article 12 Clauses */}
            {clauseResults && clauseResults.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-white/80">بنود المادة 12</span>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary me-auto">
                    {passedClauses}/{totalClauses} ممتثل
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {clauseResults.map((clause, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-2 p-2 rounded-lg text-[11px] ${
                        clause.status === 'pass'
                          ? 'bg-emerald-500/10 text-emerald-300/80'
                          : clause.status === 'fail'
                          ? 'bg-red-500/10 text-red-300/80'
                          : 'bg-white dark:bg-white/[0.02] text-white/30'
                      }`}
                    >
                      {clause.status === 'pass' ? (
                        <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : clause.status === 'fail' ? (
                        <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-[#C5A55A]/20 dark:border-white/20 shrink-0" />
                      )}
                      <span className="truncate">{clause.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-white/50">نسبة الإنجاز</span>
                <span className="text-xs font-bold text-cyan-400">{overallPct}%</span>
              </div>
              <div className="h-2 bg-[#C5A55A]/[0.03] dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${overallPct}%`,
                    background: 'linear-gradient(90deg, #22c55e, #3b82f6, #8b5cf6)',
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#C5A55A]/8 dark:border-white/5">
              <div className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] text-white/30">منصة راصد لرصد امتثال المواقع السعودية</span>
              </div>
              <span className="text-[10px] text-white/20">{new Date().toLocaleDateString('ar-SA-u-nu-latn')}</span>
            </div>
          </div>
        </div>

        {/* Share Actions */}
        <div className="p-4 pt-0 space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={exportAsImage}
              disabled={isExporting}
              className="flex-1 gap-2 bg-gradient-to-r from-primary to-[oklch(0.48_0.14_290)] hover:from-primary/90 hover:to-primary text-white"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'جاري التصدير...' : 'تصدير كصورة'}
            </Button>
            <Button
              onClick={copyShareText}
              variant="outline"
              className="flex-1 gap-2 border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10"
            >
              <Copy className="h-4 w-4" />
              نسخ النتائج
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={shareToTwitter}
              variant="outline"
              className="flex-1 gap-2 border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-blue-500/20"
            >
              <Twitter className="h-4 w-4 text-blue-400" />
              تويتر / X
            </Button>
            <Button
              onClick={shareToWhatsApp}
              variant="outline"
              className="flex-1 gap-2 border-[#C5A55A]/20 dark:border-white/20 text-white hover:bg-emerald-500/20"
            >
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              واتساب
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

```

---

## `client/src/components/ScreenshotPreview.tsx`

```tsx
import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, ZoomIn, ZoomOut, RotateCcw, Maximize2, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ===== Inline Screenshot Thumbnail =====
// Use this wherever a site name appears to show a clickable screenshot thumbnail
export function ScreenshotThumbnail({
  url,
  domain,
  className,
  size = "sm",
}: {
  url?: string | null;
  domain: string;
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: "w-8 h-6",
    sm: "w-12 h-9",
    md: "w-16 h-12",
  };

  // Use thum.io as fallback for generating live thumbnails
  const thumUrl = domain ? `https://image.thum.io/get/width/400/crop/300/https://${domain}` : null;
  const effectiveUrl = url || thumUrl;

  if (!effectiveUrl || (imgError && !thumUrl)) {
    return (
      <div className={cn(sizeClasses[size], "rounded-md bg-muted/50 flex items-center justify-center shrink-0", className)}>
        <Globe className="h-3 w-3 text-muted-foreground/40" />
      </div>
    );
  }

  const displayUrl = imgError && thumUrl ? thumUrl : effectiveUrl;

  return (
    <>
      <div
        className={cn(
          sizeClasses[size],
          "rounded-md overflow-hidden bg-muted shrink-0 cursor-pointer group relative ring-1 ring-border/30 hover:ring-primary/50 transition-all",
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title="انقر لتكبير لقطة الشاشة"
      >
        <img
          src={displayUrl}
          alt={`لقطة ${domain}`}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <ScreenshotZoomDialog
        url={displayUrl}
        domain={domain}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

// ===== Full Zoom Dialog =====
export function ScreenshotZoomDialog({
  url,
  domain,
  open,
  onOpenChange,
}: {
  url: string;
  domain: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setZoom((prev) => {
      const next = Math.max(0.5, Math.min(prev + delta, 5));
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { ...position };
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({
        x: posStart.current.x + dx,
        y: posStart.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) resetView();
      onOpenChange(v);
    },
    [onOpenChange, resetView]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 overflow-hidden bg-black/95 border-[#C5A55A]/10 dark:border-white/10">
        <DialogHeader className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-sm text-white/90">
              <Camera className="h-4 w-4 text-primary" />
              لقطة شاشة - {domain}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white/60 min-w-[3rem] text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10"
                onClick={handleZoomIn}
                disabled={zoom >= 5}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10"
                onClick={resetView}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div
          ref={containerRef}
          className={cn(
            "relative w-[90vw] h-[85vh] overflow-hidden flex items-center justify-center",
            zoom > 1 ? "cursor-grab" : "cursor-zoom-in",
            isDragging && "cursor-grabbing"
          )}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => {
            if (zoom <= 1) handleZoomIn();
          }}
        >
          <img
            src={url}
            alt={`لقطة شاشة ${domain}`}
            className="max-w-none select-none transition-transform duration-150"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              maxHeight: zoom <= 1 ? "85vh" : "none",
              maxWidth: zoom <= 1 ? "90vw" : "none",
            }}
            draggable={false}
            loading="lazy"
          />
        </div>

        {/* Zoom hint */}
        {zoom <= 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Maximize2 className="h-3 w-3" />
            انقر أو استخدم عجلة الماوس للتكبير
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===== Simple Screenshot Preview Button =====
// For use in existing table cells or list items
export function ScreenshotButton({
  url,
  domain,
  className,
}: {
  url?: string | null;
  domain: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!url) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors",
          className
        )}
        title="عرض لقطة الشاشة"
      >
        <Camera className="h-3 w-3" />
      </button>
      <ScreenshotZoomDialog url={url} domain={domain} open={open} onOpenChange={setOpen} />
    </>
  );
}

```

---

## `client/src/components/ScrollReveal.tsx`

```tsx
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className = '',
}: ScrollRevealProps) {
  return <div className={className}>{children}</div>;
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className = '',
}: StaggerContainerProps) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

```

---

## `client/src/components/ScrollToTop.tsx`

```tsx
import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop — يضمن أن كل صفحة تبدأ من الأعلى عند الانتقال إليها
 * يتم وضعه داخل Router ليستمع لتغيرات المسار
 */
export default function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll window to top
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    
    // Also scroll the main content area if it exists
    const mainContent = document.querySelector("main");
    if (mainContent) {
      mainContent.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    
    // Also scroll any scrollable parent containers
    const scrollContainers = document.querySelectorAll("[data-scroll-container]");
    scrollContainers.forEach((el) => {
      el.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
  }, [location]);

  return null;
}

```

---

## `client/src/components/SitesPopup.tsx`

```tsx
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  WifiOff,
  Search,
  ExternalLink,
  Globe,
  Building2,
  Landmark,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  BarChart3,
  Shield,
  ArrowUpRight,
  FileSpreadsheet,
} from "lucide-react";
import { downloadBase64File } from "@/lib/excelExport";
import { ScreenshotThumbnail } from "@/components/ScreenshotPreview";
import { toast } from "sonner";

export type SitesPopupFilter = {
  complianceStatus?: string;
  sectorType?: string;
  classification?: string;
  clauseIndex?: number;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  gradient?: string;
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof CheckCircle2; color: string; bg: string; border: string }> = {
  compliant: {
    label: "ممتثل",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-950/30",
    border: "border-emerald-800",
  },
  partially_compliant: {
    label: "ممتثل جزئياً",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-950/30",
    border: "border-amber-800",
  },
  non_compliant: {
    label: "غير ممتثل",
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-950/30",
    border: "border-red-800",
  },
  not_working: {
    label: "لا يعمل",
    icon: WifiOff,
    color: "text-gray-400",
    bg: "bg-gray-950/30",
    border: "border-gray-800",
  },
};

const SECTOR_LABELS: Record<string, string> = {
  public: "قطاع عام",
  private: "قطاع خاص",
};

export default function SitesPopup({
  open,
  onOpenChange,
  filter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filter: SitesPopupFilter | null;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [, setLocation] = useLocation();
  const limit = 10;

  // Excel export mutation
  const exportExcel = trpc.dashboard.exportExcel.useMutation({
    onSuccess: (data: any) => {
      if (data?.base64) {
        downloadBase64File(data.base64, data.filename);
        toast.success("تم تصدير ملف Excel بنجاح");
      }
    },
    onError: () => toast.error("حدث خطأ أثناء التصدير"),
  });

  const handleExport = () => {
    exportExcel.mutate({
      type: "filtered" as any,
      complianceStatus: filter?.complianceStatus,
      sectorType: filter?.sectorType,
      title: filter?.title || "بيانات مفلترة",
    });
  };

  // Reset page when filter changes
  const filterKey = filter ? JSON.stringify(filter) : "";

  const { data, isLoading } = trpc.sites.list.useQuery(
    {
      page,
      limit,
      search: search || undefined,
      complianceStatus: filter?.complianceStatus || undefined,
      sectorType: filter?.sectorType || undefined,
      classification: filter?.classification || undefined,
    },
    { enabled: open && !!filter, placeholderData: (prev: any) => prev }
  );

  const sites = data?.sites || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleSiteClick = (siteId: number) => {
    onOpenChange(false);
    setLocation(`/sites/${siteId}`);
  };

  const getComplianceStatus = (site: any) => {
    const scan = site.latestScan;
    if (!scan) return "no_scan";
    return scan.complianceStatus || "non_compliant";
  };

  const getCompliancePercentage = (site: any) => {
    const scan = site.latestScan;
    if (!scan) return 0;
    return scan.complianceScore || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0" dir="rtl">
        {/* Header */}
        <div className={`p-6 pb-4 ${filter?.gradient ? `bg-gradient-to-l ${filter.gradient}` : "bg-gradient-to-l from-primary/10 to-primary/5"}`}>
          <DialogHeader>
            <div className="flex items-center gap-3">
              {filter?.icon && (
                <div
                  className="w-12 h-12 rounded-2xl bg-gray-900/90 flex items-center justify-center shadow-lg backdrop-blur-sm"
                >
                  {filter.icon}
                </div>
              )}
              <div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {filter?.title || "المواقع"}
                </DialogTitle>
                {filter?.subtitle && (
                  <p className="text-sm text-muted-foreground mt-0.5">{filter.subtitle}</p>
                )}
              </div>
              <div
                className="ms-auto flex items-center gap-2"
              >
                <Badge variant="secondary" className="text-lg px-4 py-1 font-bold shadow-sm">
                  {total} موقع
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  disabled={exportExcel.isPending || total === 0}
                  className="gap-1.5 bg-gray-900/80 backdrop-blur-sm hover:bg-emerald-950/30 border-emerald-800/50 text-emerald-400"
                >
                  {exportExcel.isPending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                  )}
                  تصدير Excel
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Search */}
          <div
            className="mt-4 relative"
          >
            <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="بحث في المواقع..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pe-10 bg-gray-900/80 backdrop-blur-sm border-gray-700/50"
            />
          </div>

          {/* Active Filters */}
          <div
            className="flex flex-wrap gap-2 mt-3"
          >
            {filter?.complianceStatus && STATUS_CONFIG[filter.complianceStatus] && (
              <Badge className={`${STATUS_CONFIG[filter.complianceStatus].bg} ${STATUS_CONFIG[filter.complianceStatus].color} ${STATUS_CONFIG[filter.complianceStatus].border} border`}>
                {STATUS_CONFIG[filter.complianceStatus].label}
              </Badge>
            )}
            {filter?.sectorType && (
              <Badge variant="outline" className="gap-1">
                {filter.sectorType === "public" ? <Landmark className="w-3 h-3" /> : <Building2 className="w-3 h-3" />}
                {SECTOR_LABELS[filter.sectorType] || filter.sectorType}
              </Badge>
            )}
            {filter?.classification && (
              <Badge variant="outline">{filter.classification}</Badge>
            )}
          </div>
        </div>

        {/* Sites List */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">جاري تحميل المواقع...</p>
            </div>
          ) : sites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Globe className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">لا توجد مواقع مطابقة</p>
            </div>
          ) : (
            
              <div
                key={`${filterKey}-${page}-${search}`}
                className="space-y-2"
              >
                {sites.map((site: any, idx: number) => {
                  const status = getComplianceStatus(site);
                  const statusConf = STATUS_CONFIG[status];
                  const StatusIcon = statusConf?.icon || Globe;
                  const pct = getCompliancePercentage(site);

                  return (
                    <div
                      key={site.id}
                      onClick={() => handleSiteClick(site.id)}
                      className={`group relative flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.01] ${statusConf?.bg || "bg-card"} ${statusConf?.border || "border-border"}`}
                    >
                      {/* Screenshot Thumbnail */}
                      <ScreenshotThumbnail url={site.screenshotUrl} domain={site.domain} size="sm" />

                      {/* Status Icon */}
                      <div className="relative shrink-0">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${statusConf?.bg || "bg-muted"}`}
                        >
                          <StatusIcon className={`w-5 h-5 ${statusConf?.color || "text-muted-foreground"}`} />
                        </div>
                        {status === "partially_compliant" && (
                          <div className="absolute -bottom-1 -left-1 bg-amber-500 text-white text-[9px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                            {Math.round(pct)}%
                          </div>
                        )}
                      </div>

                      {/* Site Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm truncate text-foreground">
                            {site.siteName || site.domain}
                          </h4>
                          {site.sectorType && (
                            <Badge variant="outline" className="text-[10px] shrink-0">
                              {SECTOR_LABELS[site.sectorType] || site.sectorType}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate" dir="ltr">
                            {site.domain}
                          </span>
                          {site.classification && (
                            <span className="text-[10px] text-muted-foreground/70">• {site.classification}</span>
                          )}
                        </div>
                        {site.latestScan && (
                          <div className="flex items-center gap-3 mt-1.5">
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-muted-foreground/60" />
                              <span className={`text-xs font-medium ${statusConf?.color}`}>
                                {statusConf?.label || status}
                              </span>
                            </div>
                            {status === "partially_compliant" && (
                              <div className="flex items-center gap-1">
                                <BarChart3 className="w-3 h-3 text-muted-foreground/60" />
                                <span className="text-xs text-muted-foreground">
                                  {site.latestScan.clausesPassed || 0}/8 بنود
                                </span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3 text-muted-foreground/60" />
                              <span className="text-xs text-muted-foreground">
                                {new Date(site.latestScan.scanDate).toLocaleDateString("ar-SA-u-nu-latn")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Arrow */}
                      <div
                        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                      </div>

                      {/* Compliance bar */}
                      {status === "partially_compliant" && (
                        <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-xl overflow-hidden">
                          <div
                            animate={{ width: `${pct}%` }}
                            className="h-full bg-amber-400"
                          />
                        </div>
                      )}
                      {status === "compliant" && (
                        <div className="absolute bottom-0 right-0 left-0 h-0.5 rounded-b-xl bg-emerald-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            
          )}
        </div>

        {/* Footer / Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/30">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </Button>
            <span className="text-sm text-muted-foreground">
              صفحة {page} من {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

```

---

## `client/src/components/SkeletonCard.tsx`

```tsx
interface SkeletonCardProps {
  lines?: number;
  hasAvatar?: boolean;
  hasImage?: boolean;
  className?: string;
}

export function SkeletonCard({
  lines = 3,
  hasAvatar = false,
  hasImage = false,
  className = '',
}: SkeletonCardProps) {
  return (
    <div className={`glass-card gold-sweep p-6 space-y-4 ${className}`}>
      {hasImage && (
        <div className="w-full h-40 rounded-xl bg-muted/50 animate-shimmer" />
      )}
      <div className="flex items-center gap-3">
        {hasAvatar && (
          <div className="w-10 h-10 rounded-full bg-muted/50 animate-shimmer flex-shrink-0" />
        )}
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-muted/50 animate-shimmer" />
          <div className="h-3 w-1/2 rounded bg-muted/50 animate-shimmer" style={{ animationDelay: '0.1s' }} />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-muted/50 animate-shimmer"
          style={{
            width: `${85 - i * 15}%`,
            animationDelay: `${(i + 1) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

```

---

## `client/src/components/Skeletons.tsx`

```tsx
import { cn } from '@/lib/utils';

/**
 * Premium Skeleton component with shimmer/shine animation effect.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-muted/60',
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

// ========== KPI Card Skeleton ==========
export function KPICardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="w-12 h-12 rounded-2xl" />
        <Skeleton className="w-16 h-6 rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-9 w-24" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="absolute bottom-0 right-0 h-[3px] w-[40%] rounded-t-full">
        <Skeleton className="h-full w-full" />
      </div>
    </div>
  );
}

// ========== Dashboard KPI Grid Skeleton ==========
export function KPIGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

// ========== Chart Skeleton ==========
export function ChartSkeleton({ height = 'h-72' }: { height?: string }) {
  return (
    <div className={cn('rounded-2xl border border-border bg-card p-5', height)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-end gap-2 h-[calc(100%-3rem)] pt-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end">
            <Skeleton
              className="w-full rounded-t-md"
              style={{ height: `${30 + Math.random() * 60}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ========== Pie Chart Skeleton ==========
export function PieChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 h-72">
      <Skeleton className="h-5 w-40 mb-4" />
      <div className="flex items-center justify-center h-[calc(100%-3rem)]">
        <Skeleton className="w-40 h-40 rounded-full" />
      </div>
    </div>
  );
}

// ========== Table Skeleton ==========
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
      <div className="border-b border-[rgba(197,165,90,0.12)] bg-[rgba(197,165,90,0.04)] px-4 py-3">
        <div className="flex gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="border-b border-border/50 px-4 py-3">
          <div className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <Skeleton
                key={colIdx}
                className={cn('h-4 flex-1', colIdx === 0 && 'max-w-[200px]')}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ========== Welcome Banner Skeleton ==========
export function WelcomeBannerSkeleton() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 mb-6 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 bg-primary/10" />
          <Skeleton className="h-4 w-80 bg-primary/10" />
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl bg-primary/10" />
          <Skeleton className="h-10 w-28 rounded-xl bg-primary/10" />
        </div>
      </div>
    </div>
  );
}

// ========== Full Dashboard Skeleton ==========
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <WelcomeBannerSkeleton />
      <KPIGridSkeleton count={8} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChartSkeleton />
        <ChartSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TableSkeleton rows={5} cols={4} />
        <TableSkeleton rows={5} cols={4} />
      </div>
    </div>
  );
}

// ========== Generic Page Skeleton ==========
export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <KPIGridSkeleton count={4} />
      <ChartSkeleton />
      <TableSkeleton rows={5} cols={5} />
    </div>
  );
}

export { Skeleton };

```

---

## `client/src/components/SmartRasidFAB.tsx`

```tsx
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { Bot, Send, Loader2, X, Sparkles, Maximize2 } from "lucide-react";
import { Streamdown } from "streamdown";

const CHARACTER_URL = "/branding/characters/Character_3_dark_bg_transparent.png";

export default function SmartRasidFAB() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, refetch: refetchMessages } = trpc.ai.messages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  );
  const { data: suggestions } = trpc.ai.suggestions.useQuery(
    { route: location },
    { enabled: !!user && open }
  );

  const createConversation = trpc.ai.createConversation.useMutation({
    onSuccess: (conv) => {
      setConversationId(conv.id);
    },
  });

  const sendMessage = trpc.ai.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  const handleSend = async (content?: string) => {
    const text = content || input.trim();
    if (!text) return;
    setInput("");

    let convId = conversationId;
    if (!convId) {
      const conv = await createConversation.mutateAsync({
        title: text.slice(0, 50),
        pageContext: location,
      });
      convId = conv.id;
    }

    sendMessage.mutate({
      conversationId: convId!,
      content: text,
      currentRoute: location,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const visibleMessages = useMemo(() => {
    return (messages || []).filter((m: any) => m.role !== "system");
  }, [messages]);

  if (!user) return null;

  return (
    <>
      {/* FAB Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 h-14 w-14 rounded-full bg-gold text-gold-foreground shadow-lg shadow-gold/30 flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-6rem)] rounded-2xl overflow-hidden glass-card flex flex-col shadow-2xl shadow-gold/10">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-border/30 bg-background/80">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold">راصد الذكي</p>
                <p className="text-xs text-muted-foreground">مساعدك التشغيلي</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { setOpen(false); setLocation("/app/smart-rasid"); }}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            {visibleMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <img src={CHARACTER_URL} alt="راصد" className="h-16 mb-3" />
                <p className="text-sm font-medium mb-1">مرحباً{user?.name ? ` ${user.name}` : ""}</p>
                <p className="text-xs text-muted-foreground mb-4">كيف أستطيع مساعدتك؟</p>
                <div className="space-y-1.5 w-full">
                  {(suggestions || []).slice(0, 4).map((s: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSend(s)}
                      className="w-full text-right p-2 rounded-lg text-xs hover:bg-accent/50 transition-colors flex items-center gap-2"
                    >
                      <Sparkles className="h-3 w-3 text-gold shrink-0" />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ScrollArea className="h-full">
                <div ref={scrollRef} className="p-3 space-y-3">
                  {visibleMessages.map((msg: any, i: number) => (
                    <div
                      key={msg.id || i}
                      className={cn(
                        "flex gap-2",
                        msg.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.role === "assistant" && (
                        <div className="h-6 w-6 shrink-0 mt-1 rounded-full bg-gold/10 flex items-center justify-center">
                          <Bot className="h-3 w-3 text-gold" />
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                          msg.role === "user"
                            ? "bg-gold text-gold-foreground"
                            : "bg-secondary/50"
                        )}
                      >
                        {msg.role === "assistant" ? (
                          <div className="prose prose-xs prose-invert max-w-none">
                            <Streamdown>{msg.content}</Streamdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                  {sendMessage.isPending && (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-gold/10 flex items-center justify-center">
                        <Bot className="h-3 w-3 text-gold" />
                      </div>
                      <div className="bg-secondary/50 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin text-gold" />
                        <span className="text-xs text-muted-foreground">جارٍ التحليل...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/30 p-2 flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل راصد الذكي..."
              className="flex-1 max-h-20 resize-none min-h-[36px] text-sm bg-secondary/30 border-border/30"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || sendMessage.isPending}
              className="bg-gold text-gold-foreground hover:bg-gold/90 h-9 w-9 shrink-0"
              size="icon"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

```

---

## `client/src/components/SmartRasidTrainingWidget.tsx`

```tsx
/**
 * SmartRasidTrainingWidget — المركز التدريبي لراصد الذكي
 * يظهر في أسفل لوحة القيادة الرئيسية
 */
import { useState } from "react";
import { motion } from "framer-motion";
import {
  GraduationCap, BookOpen, Play, CheckCircle2, Clock, Star,
  Brain, Shield, Search, Database, FileSearch, Zap,
  ChevronLeft, Award, TrendingUp, Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  level: "مبتدئ" | "متوسط" | "متقدم";
  progress: number;
  lessons: number;
  completedLessons: number;
  locked: boolean;
}

const modules: TrainingModule[] = [
  { id: "t1", title: "أساسيات رصد البيانات", description: "تعلم كيفية استخدام أدوات الرصد الأساسية وفهم مصادر البيع", icon: Search, duration: "45 دقيقة", level: "مبتدئ", progress: 100, lessons: 6, completedLessons: 6, locked: false },
  { id: "t2", title: "تحليل بيانات الدارك ويب", description: "فهم بنية الدارك ويب وكيفية تتبع حالات الرصد عبر المنتديات والأسواق", icon: Database, duration: "60 دقيقة", level: "متوسط", progress: 67, lessons: 9, completedLessons: 6, locked: false },
  { id: "t3", title: "تصنيف البيانات الشخصية (PII)", description: "تعلم تصنيف أنواع البيانات الشخصية وفقاً لنظام PDPL", icon: FileSearch, duration: "30 دقيقة", level: "مبتدئ", progress: 100, lessons: 4, completedLessons: 4, locked: false },
  { id: "t4", title: "استخدام راصد الذكي (AI)", description: "إتقان استخدام المساعد الذكي لتحليل حالات الرصد وإنشاء التقارير", icon: Brain, duration: "90 دقيقة", level: "متقدم", progress: 33, lessons: 12, completedLessons: 4, locked: false },
  { id: "t5", title: "إدارة حالات الرصد والاستجابة", description: "بروتوكولات الاستجابة لحالات الرصد وإدارة دورة حياة حالة الرصد", icon: Shield, duration: "75 دقيقة", level: "متقدم", progress: 0, lessons: 8, completedLessons: 0, locked: false },
  { id: "t6", title: "التحليل الجنائي الرقمي", description: "تقنيات متقدمة في التحليل الجنائي الرقمي وسلسلة الأدلة", icon: Zap, duration: "120 دقيقة", level: "متقدم", progress: 0, lessons: 15, completedLessons: 0, locked: true },
];

const levelColors: Record<string, string> = {
  "مبتدئ": "bg-green-500/10 text-green-500 border-green-500/20",
  "متوسط": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "متقدم": "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function SmartRasidTrainingWidget() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalProgress = Math.round(modules.reduce((acc, m) => acc + m.progress, 0) / modules.length);
  const completedModules = modules.filter((m) => m.progress === 100).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-2xl overflow-hidden gold-border-card"
    >
      {/* Header */}
      <div className={`p-5 ${isDark ? 'bg-gradient-to-l from-[#C5A55A]/5 to-transparent' : 'bg-gradient-to-l from-[#1e3a8a]/5 to-transparent'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-[#C5A55A]/10 ring-1 ring-[#C5A55A]/20' : 'bg-[#1e3a8a]/10 ring-1 ring-[#1e3a8a]/20'}`}>
              <GraduationCap className={`w-6 h-6 ${isDark ? 'text-[#C5A55A]' : 'text-[#1e3a8a]'}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold">المركز التدريبي لراصد الذكي</h2>
              <p className="text-xs text-muted-foreground">تطوير مهاراتك في رصد وتحليل حالات الرصد</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{totalProgress}%</div>
              <div className="text-[10px] text-muted-foreground">التقدم الكلي</div>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1">
                <Award className={`w-4 h-4 ${isDark ? 'text-[#C5A55A]' : 'text-[#1e3a8a]'}`} />
                <span className="text-lg font-bold">{completedModules}</span>
              </div>
              <div className="text-[10px] text-muted-foreground">مكتمل</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full ${isDark ? 'bg-gradient-to-r from-[#C5A55A] to-[#D4AF37]' : 'bg-gradient-to-r from-[#1e3a8a] to-[#2563eb]'}`}
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((mod, idx) => {
          const ModIcon = mod.icon;
          return (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer group ${
                mod.locked
                  ? "opacity-50 border-border/30"
                  : mod.progress === 100
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-border/50 hover:border-primary/30 bg-muted/20 hover:bg-muted/40"
              }`}
              onClick={() => {
                if (mod.locked) {
                  toast.info("يجب إكمال الوحدات السابقة أولاً");
                } else {
                  toast.info(`فتح الوحدة: ${mod.title} — قريباً`);
                }
              }}
            >
              {mod.locked && (
                <div className="absolute top-2 left-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  mod.progress === 100
                    ? "bg-emerald-500/10"
                    : isDark ? "bg-[#C5A55A]/10" : "bg-[#1e3a8a]/10"
                }`}>
                  <ModIcon className={`w-4 h-4 ${
                    mod.progress === 100
                      ? "text-emerald-500"
                      : isDark ? "text-[#C5A55A]" : "text-[#1e3a8a]"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-0.5 truncate">{mod.title}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{mod.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[9px] py-0 ${levelColors[mod.level]}`}>{mod.level}</Badge>
                  <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{mod.duration}</span>
                </div>
                <span>{mod.completedLessons}/{mod.lessons} درس</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    mod.progress === 100
                      ? "bg-emerald-500"
                      : isDark ? "bg-[#C5A55A]" : "bg-[#1e3a8a]"
                  }`}
                  style={{ width: `${mod.progress}%` }}
                />
              </div>
              {mod.progress === 100 && (
                <div className="absolute top-2 left-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

```

---

## `client/src/components/SmartRecommendations.tsx`

```tsx
/**
 * Smart Recommendations Display Component
 * عرض التوصيات الذكية من محرك التوصيات
 */

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, AlertCircle, HelpCircle, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Recommendation {
  id: string;
  type: 'analysis' | 'action' | 'question' | 'relationship' | 'alert';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  action?: {
    type: string;
    params: Record<string, any>;
  };
}

export interface SmartRecommendationsProps {
  recommendations: Recommendation[];
  onSelectRecommendation?: (rec: Recommendation) => void;
  className?: string;
  maxDisplay?: number;
}

export function SmartRecommendations({
  recommendations,
  onSelectRecommendation,
  className,
  maxDisplay = 3,
}: SmartRecommendationsProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const displayedRecs = recommendations.slice(0, maxDisplay);

  const typeConfig = {
    analysis: {
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'تحليل',
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    },
    action: {
      icon: <Lightbulb className="h-4 w-4" />,
      label: 'إجراء',
      color: 'bg-green-500/10 text-green-600 dark:text-green-400',
    },
    question: {
      icon: <HelpCircle className="h-4 w-4" />,
      label: 'سؤال',
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    },
    relationship: {
      icon: <Link2 className="h-4 w-4" />,
      label: 'علاقة',
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    alert: {
      icon: <AlertCircle className="h-4 w-4" />,
      label: 'تنبيه',
      color: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
  };

  const priorityConfig = {
    low: { variant: 'outline' as const, color: 'text-gray-500' },
    medium: { variant: 'secondary' as const, color: 'text-amber-500' },
    high: { variant: 'default' as const, color: 'text-orange-500' },
    critical: { variant: 'destructive' as const, color: 'text-red-500' },
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium">
        <Lightbulb className="h-4 w-4 text-amber-500" />
        <span>توصيات ذكية</span>
        {recommendations.length > maxDisplay && (
          <Badge variant="secondary" className="text-xs">
            +{recommendations.length - maxDisplay}
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        {displayedRecs.map((rec) => {
          const typeInfo = typeConfig[rec.type];
          const priorityInfo = priorityConfig[rec.priority];

          return (
            <Card
              key={rec.id}
              className={cn(
                'p-3 hover:shadow-md transition-shadow cursor-pointer',
                typeInfo.color
              )}
              onClick={() => onSelectRecommendation?.(rec)}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {typeInfo.icon}
                    <h4 className="text-sm font-semibold leading-tight">
                      {rec.title}
                    </h4>
                  </div>
                  <Badge variant={priorityInfo.variant} className="text-xs shrink-0">
                    {rec.priority === 'low' && 'عادي'}
                    {rec.priority === 'medium' && 'متوسط'}
                    {rec.priority === 'high' && 'مهم'}
                    {rec.priority === 'critical' && 'حرج'}
                  </Badge>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {rec.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span>الثقة:</span>
                      <span className="font-medium">
                        {Math.round(rec.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {rec.action && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecommendation?.(rec);
                      }}
                    >
                      تطبيق
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Suggested Questions Component
 * عرض الأسئلة المقترحة
 */
export interface SuggestedQuestionsProps {
  questions: string[];
  onSelectQuestion?: (question: string) => void;
  className?: string;
  maxDisplay?: number;
}

export function SuggestedQuestions({
  questions,
  onSelectQuestion,
  className,
  maxDisplay = 4,
}: SuggestedQuestionsProps) {
  if (!questions || questions.length === 0) {
    return null;
  }

  const displayedQuestions = questions.slice(0, maxDisplay);

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <HelpCircle className="h-4 w-4" />
        <span>أسئلة مقترحة</span>
      </div>

      <div className="grid gap-2">
        {displayedQuestions.map((question, idx) => (
          <Button
            key={idx}
            variant="outline"
            className="justify-start text-right h-auto p-3 hover:bg-accent"
            onClick={() => onSelectQuestion?.(question)}
          >
            <span className="text-sm leading-relaxed">{question}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

```

---

## `client/src/components/TopProgressBar.tsx`

```tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * NProgress-style thin progress bar at the top of the page.
 * Shows during route transitions and lazy loading.
 */
export default function TopProgressBar() {
  const [location] = useLocation();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevLocationRef = useRef(location);

  const startProgress = useCallback(() => {
    setIsVisible(true);
    setProgress(0);

    let current = 0;
    timerRef.current = setInterval(() => {
      current += Math.random() * 15;
      if (current > 90) {
        current = 90;
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setProgress(current);
    }, 100);
  }, []);

  const completeProgress = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setProgress(100);
    setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 400);
  }, []);

  useEffect(() => {
    if (location !== prevLocationRef.current) {
      prevLocationRef.current = location;
      startProgress();
      const completeTimer = setTimeout(completeProgress, 300);
      return () => clearTimeout(completeTimer);
    }
  }, [location, startProgress, completeProgress]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div
          className="fixed top-0 left-0 right-0 z-[9999] h-[3px] bg-gradient-to-r from-primary via-primary/80 to-primary/60"
          style={{ width: `${progress}%`, opacity: 1 }}
        >
          <div className="absolute end-0 top-0 h-full w-24 bg-gradient-to-l from-white/40 to-transparent rounded-full shadow-[0_0_10px_var(--primary),0_0_5px_var(--primary)]" />
        </div>
      )}
    </>
  );
}

```

---

## `client/src/components/TrainingContent.tsx`

```tsx
/**
 * TrainingContent — Interactive training and learning content component.
 * Provides step-by-step tutorials, tips, and contextual help for the platform.
 */
import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TrainingStep {
  id: string;
  title: string;
  description: string;
  icon?: string;
  videoUrl?: string;
  imageUrl?: string;
  tips?: string[];
  completed?: boolean;
}

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  steps: TrainingStep[];
}

interface TrainingContentProps {
  modules: TrainingModule[];
  className?: string;
  onStepComplete?: (moduleId: string, stepId: string) => void;
  onModuleComplete?: (moduleId: string) => void;
}

const DIFFICULTY_CONFIG = {
  beginner: { label: "مبتدئ", color: "#10b981", icon: "🟢" },
  intermediate: { label: "متوسط", color: "#f59e0b", icon: "🟡" },
  advanced: { label: "متقدم", color: "#ef4444", icon: "🔴" },
};

export function TrainingContent({
  modules,
  className,
  onStepComplete,
  onModuleComplete,
}: TrainingContentProps) {
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(
    () => {
      try {
        const saved = localStorage.getItem("rasid-training-progress");
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch { return new Set(); }
    }
  );

  const saveProgress = useCallback((steps: Set<string>) => {
    try {
      localStorage.setItem("rasid-training-progress", JSON.stringify([...steps]));
    } catch {}
  }, []);

  const markStepComplete = useCallback((moduleId: string, stepId: string) => {
    const key = `${moduleId}:${stepId}`;
    setCompletedSteps((prev) => {
      const next = new Set(prev);
      next.add(key);
      saveProgress(next);
      return next;
    });
    onStepComplete?.(moduleId, stepId);

    // Check if module is complete
    const module = modules.find((m) => m.id === moduleId);
    if (module) {
      const allComplete = module.steps.every(
        (s) => completedSteps.has(`${moduleId}:${s.id}`) || s.id === stepId
      );
      if (allComplete) onModuleComplete?.(moduleId);
    }
  }, [modules, completedSteps, onStepComplete, onModuleComplete, saveProgress]);

  const getModuleProgress = useCallback(
    (module: TrainingModule) => {
      const completed = module.steps.filter((s) =>
        completedSteps.has(`${module.id}:${s.id}`)
      ).length;
      return { completed, total: module.steps.length, percentage: Math.round((completed / module.steps.length) * 100) };
    },
    [completedSteps]
  );

  const currentModule = modules.find((m) => m.id === activeModule);
  const currentStep = currentModule?.steps[activeStep];

  if (currentModule && currentStep) {
    // Step view
    const progress = getModuleProgress(currentModule);
    const isCompleted = completedSteps.has(`${currentModule.id}:${currentStep.id}`);

    return (
      <div className={cn("rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden", className)} dir="rtl">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <button
            onClick={() => { setActiveModule(null); setActiveStep(0); }}
            className="text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            → العودة للقائمة
          </button>
          <div className="text-sm text-white/60">
            {activeStep + 1} / {currentModule.steps.length}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/5">
          <div
            className="h-full bg-cyan-500 transition-all duration-500"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-xl font-bold text-white/90 mb-2">{currentStep.title}</h2>
          <p className="text-white/60 mb-6 leading-relaxed">{currentStep.description}</p>

          {/* Image */}
          {currentStep.imageUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-white/5">
              <img src={currentStep.imageUrl} alt={currentStep.title} className="w-full" />
            </div>
          )}

          {/* Video */}
          {currentStep.videoUrl && (
            <div className="mb-6 rounded-lg overflow-hidden border border-white/5 aspect-video bg-black">
              <video src={currentStep.videoUrl} controls className="w-full h-full" />
            </div>
          )}

          {/* Tips */}
          {currentStep.tips && currentStep.tips.length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <h4 className="text-sm font-bold text-cyan-400 mb-2">💡 نصائح</h4>
              <ul className="space-y-1">
                {currentStep.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-white/60 flex gap-2">
                    <span className="text-cyan-400/60">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              className="px-4 py-2 rounded-lg text-sm bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 disabled:opacity-30 transition-all"
            >
              ← السابق
            </button>

            <button
              onClick={() => {
                markStepComplete(currentModule.id, currentStep.id);
                if (activeStep < currentModule.steps.length - 1) {
                  setActiveStep(activeStep + 1);
                }
              }}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all",
                isCompleted
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30"
              )}
            >
              {isCompleted ? "✓ مكتمل" : activeStep < currentModule.steps.length - 1 ? "التالي →" : "إنهاء ✓"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Module list view
  return (
    <div className={cn("rounded-xl bg-slate-900/50 border border-white/10 overflow-hidden", className)} dir="rtl">
      <div className="p-4 border-b border-white/5">
        <h2 className="text-lg font-bold text-white/90">📚 مركز التدريب</h2>
        <p className="text-sm text-white/40 mt-1">تعلم كيفية استخدام منصة راصد الذكي</p>
      </div>

      <div className="p-4 space-y-3">
        {modules.map((module) => {
          const progress = getModuleProgress(module);
          const diff = DIFFICULTY_CONFIG[module.difficulty];

          return (
            <div
              key={module.id}
              onClick={() => { setActiveModule(module.id); setActiveStep(0); }}
              className="p-4 rounded-lg border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-white/90 group-hover:text-cyan-400 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-white/50 mt-1">{module.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${diff.color}15`, color: diff.color }}>
                      {diff.icon} {diff.label}
                    </span>
                    <span className="text-xs text-white/30">⏱ {module.estimatedMinutes} دقيقة</span>
                    <span className="text-xs text-white/30">{module.steps.length} خطوات</span>
                  </div>
                </div>
                <div className="text-left mr-4">
                  <div className="text-lg font-bold" style={{ color: progress.percentage === 100 ? "#10b981" : "#06b6d4" }}>
                    {progress.percentage}%
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progress.percentage}%`,
                    backgroundColor: progress.percentage === 100 ? "#10b981" : "#06b6d4",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrainingContent;

```

---

## `client/src/components/TrendPredictions.tsx`

```tsx
/**
 * TrendPredictions — تنبؤات الذكاء الاصطناعي لاتجاهات الرصد
 * AI-Powered Trend Predictions with forecasting charts
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, TrendingDown, Minus, Brain, Sparkles, AlertTriangle,
  ChevronDown, BarChart3, Target, Zap,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface TrendPredictionsProps {
  monthlyTrend: { yearMonth: string; count: number; records: number }[];
  totalLeaks: number;
  totalRecords: number;
  newLeaks: number;
}

function analyzeData(
  monthlyTrend: { yearMonth: string; count: number; records: number }[],
  totalLeaks: number,
  totalRecords: number,
  newLeaks: number
) {
  const counts = monthlyTrend.map(m => m.count);
  const n = counts.length;
  const avgMonthly = n > 0 ? Math.round(counts.reduce((a, b) => a + b, 0) / n) : 0;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  counts.forEach((y, x) => { sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; });
  const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) : 0;
  const intercept = n > 0 ? (sumY - slope * sumX) / n : 0;

  const predictedValues = counts.map((_, i) => Math.max(0, Math.round(slope * i + intercept)));
  const predictedNext3 = [0, 1, 2].map(i => Math.max(0, Math.round(slope * (n + i) + intercept)));

  const trend: "rising" | "declining" | "stable" =
    slope > 2 ? "rising" : slope < -2 ? "declining" : "stable";

  const peakIdx = counts.length > 0 ? counts.indexOf(Math.max(...counts)) : 0;
  const peakMonth = monthlyTrend[peakIdx]?.yearMonth || "";

  const riskScore = Math.min(100, Math.round(
    (newLeaks / Math.max(totalLeaks, 1)) * 40 +
    (slope > 0 ? slope * 5 : 0) +
    (totalRecords > 100000000 ? 30 : totalRecords > 10000000 ? 20 : 10)
  ));

  const confidence = Math.min(95, Math.max(30, Math.round(60 + (n - 3) * 5 - Math.abs(slope) * 0.5)));

  return { avgMonthly, predictedValues, predictedNext3, trend, peakMonth, riskScore, confidence, slope };
}

export default function TrendPredictions({ monthlyTrend, totalLeaks, totalRecords, newLeaks }: TrendPredictionsProps) {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const analysis = useMemo(
    () => analyzeData(monthlyTrend, totalLeaks, totalRecords, newLeaks),
    [monthlyTrend, totalLeaks, totalRecords, newLeaks]
  );

  const trendConfig = {
    rising: { icon: TrendingUp, label: "تصاعدي", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    declining: { icon: TrendingDown, label: "تراجعي", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    stable: { icon: Minus, label: "مستقر", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  };

  const tc = trendConfig[analysis.trend];
  const TrendIcon = tc.icon;
  const maxVal = Math.max(...monthlyTrend.map(m => m.count), ...analysis.predictedNext3, 1);

  const getRiskColor = (score: number) => {
    if (score >= 80) return "#ef4444";
    if (score >= 60) return "#f59e0b";
    if (score >= 40) return "#3b82f6";
    return "#10b981";
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return "حرج";
    if (score >= 60) return "مرتفع";
    if (score >= 40) return "متوسط";
    return "منخفض";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-2xl border overflow-hidden ${isDark
        ? "bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/80 border-white/[0.06] backdrop-blur-xl"
        : "bg-white/90 border-[#e2e5ef] shadow-lg shadow-blue-500/5"
      }`}
    >
      <div className="flex items-center justify-between p-5 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? "bg-gradient-to-br from-violet-500/20 to-blue-500/20" : "bg-gradient-to-br from-violet-100 to-blue-100"}`}
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Brain className={`w-5 h-5 ${isDark ? "text-violet-400" : "text-violet-600"}`} />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              تنبؤات الذكاء الاصطناعي
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h3>
            <p className="text-[10px] text-muted-foreground">AI Trend Predictions & Risk Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${tc.bg} ${tc.color} ${tc.border} border`}>
            <TrendIcon className="w-3 h-3" />
            {tc.label}
          </div>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: `conic-gradient(${getRiskColor(analysis.riskScore)} ${analysis.riskScore}%, transparent 0)` }}>
            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold ${isDark ? "bg-[#0f172a] text-white" : "bg-white text-slate-800"}`}>
              {analysis.riskScore}
            </div>
          </div>
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`px-5 pb-5 border-t ${isDark ? "border-white/5" : "border-slate-100"}`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                {[
                  { label: "المتوسط الشهري", value: analysis.avgMonthly, icon: BarChart3, color: "text-blue-400" },
                  { label: "التوقع القادم", value: analysis.predictedNext3[0], icon: Target, color: "text-violet-400" },
                  { label: "مستوى المخاطر", value: getRiskLabel(analysis.riskScore), icon: AlertTriangle, color: "text-amber-400" },
                  { label: "دقة التنبؤ", value: `${analysis.confidence}%`, icon: Zap, color: "text-amber-400" },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`p-3 rounded-xl text-center ${isDark ? "bg-white/[0.03] border border-white/[0.05]" : "bg-slate-50 border border-slate-100"}`}>
                    <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground font-medium">الاتجاه الفعلي مقابل التوقعات</span>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-blue-500" /> فعلي</span>
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-violet-500 opacity-60" /> متوقع</span>
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-amber-500 opacity-40" /> تنبؤ</span>
                  </div>
                </div>
                <div className={`rounded-xl p-4 ${isDark ? "bg-[#0a0f1e]/60" : "bg-slate-50"}`}>
                  <svg viewBox="0 0 600 180" className="w-full h-32">
                    {[0, 0.25, 0.5, 0.75, 1].map(pct => (
                      <line key={pct} x1="40" y1={20 + pct * 140} x2="580" y2={20 + pct * 140}
                        stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.05)"} strokeDasharray="4 4" />
                    ))}
                    {monthlyTrend.length > 1 && (
                      <motion.path
                        d={monthlyTrend.map((m, i) => {
                          const x = 40 + i * (540 / (monthlyTrend.length + 2));
                          const y = 160 - (m.count / maxVal) * 140;
                          return `${i === 0 ? "M" : "L"}${x},${y}`;
                        }).join(" ")}
                        fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
                      />
                    )}
                    {analysis.predictedValues.length > 1 && (
                      <path
                        d={analysis.predictedValues.map((v, i) => {
                          const x = 40 + i * (540 / (monthlyTrend.length + 2));
                          const y = 160 - (v / maxVal) * 140;
                          return `${i === 0 ? "M" : "L"}${x},${y}`;
                        }).join(" ")}
                        fill="none" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6"
                      />
                    )}
                    {monthlyTrend.map((m, i) => {
                      const x = 40 + i * (540 / (monthlyTrend.length + 2));
                      const y = 160 - (m.count / maxVal) * 140;
                      return (
                        <g key={m.yearMonth}>
                          <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke={isDark ? "#0f172a" : "#fff"} strokeWidth="2" />
                          <text x={x} y={170} textAnchor="middle" className="text-[8px]" fill={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}>{m.yearMonth.slice(5)}</text>
                        </g>
                      );
                    })}
                    {analysis.predictedNext3.map((v, i) => {
                      const startX = 40 + (monthlyTrend.length - 1) * (540 / (monthlyTrend.length + 2));
                      const x = startX + (i + 1) * (540 / (monthlyTrend.length + 2));
                      const y = 160 - (v / maxVal) * 140;
                      return <motion.circle key={`pred-${i}`} cx={x} cy={y} r="3.5" fill="#f59e0b" stroke={isDark ? "#0f172a" : "#fff"} strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8 + i * 0.2 }} />;
                    })}
                  </svg>
                </div>
              </div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                className={`mt-4 p-4 rounded-xl text-xs leading-relaxed ${isDark
                  ? "bg-gradient-to-r from-violet-500/5 to-blue-500/5 border border-violet-500/10 text-slate-300"
                  : "bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 text-slate-600"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-bold text-foreground text-[11px]">تحليل الذكاء الاصطناعي</span>
                </div>
                {analysis.trend === "rising" ? (
                  <p>يُظهر التحليل <strong className="text-red-400">اتجاهاً تصاعدياً</strong> في حالات الرصد بمتوسط <strong>{analysis.avgMonthly}</strong> حالة رصد شهرياً. التوقع للشهر القادم هو <strong>{analysis.predictedNext3[0]}</strong> حالة رصد. ذروة النشاط كانت في <strong>{analysis.peakMonth}</strong>. مستوى المخاطر: <strong style={{ color: getRiskColor(analysis.riskScore) }}>{getRiskLabel(analysis.riskScore)}</strong>. يُوصى بتكثيف عمليات الرصد وتعزيز إجراءات الحماية.</p>
                ) : analysis.trend === "declining" ? (
                  <p>يُظهر التحليل <strong className="text-emerald-400">تراجعاً إيجابياً</strong> في حالات الرصد بمتوسط <strong>{analysis.avgMonthly}</strong> حالة رصد شهرياً. مستوى المخاطر: <strong style={{ color: getRiskColor(analysis.riskScore) }}>{getRiskLabel(analysis.riskScore)}</strong>. يُوصى بالاستمرار في المراقبة الدورية.</p>
                ) : (
                  <p>يُظهر التحليل <strong className="text-blue-400">استقراراً نسبياً</strong> في حالات الرصد بمتوسط <strong>{analysis.avgMonthly}</strong> حالة رصد شهرياً. مستوى المخاطر: <strong style={{ color: getRiskColor(analysis.riskScore) }}>{getRiskLabel(analysis.riskScore)}</strong>. يُوصى بالحفاظ على مستوى الرصد الحالي مع تحسين أدوات الكشف المبكر.</p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

```

---

## `client/src/components/TypewriterText.tsx`

```tsx
interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  className = '',
}: TypewriterTextProps) {
  return (
    <span className={className}>
      {text}
    </span>
  );
}

```

---

## `client/src/components/UltraPremiumWrapper.tsx`

```tsx
/**
 * Ultra Premium Design Enhancement Wrapper — v2.0
 * Provides consistent glass-card gold-sweep styling, gold 3D bevel borders, motion effects,
 * and premium design tokens for all pages across the platform.
 */
import { ReactNode } from "react";

// ─── Page Container with animated entrance ─────────────────────
export function PremiumPageContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-6 stagger-children ${className}`}>
      {children}
    </div>
  );
}

// ─── Section Header with premium icon treatment ──────────────────────
export function PremiumSectionHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon?: any;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--gold-a10)] to-[var(--gold-a15)] text-[var(--gold-500)] dark:text-[var(--gold-300)] border border-[var(--gold-a15)] shadow-sm" style={{ boxShadow: 'var(--bevel-gold), var(--elev-1)' }}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

// ─── Glass Card with gold 3D bevel ────────────────
export function PremiumCard({
  children,
  className = "",
  hover = true,
  delay = 0,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className={`glass-card gold-sweep rounded-xl p-5 relative overflow-hidden group ${onClick ? "cursor-pointer active-press" : ""} ${className}`}
      onClick={onClick}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--gold-a10)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ─── Stat Card with premium gradient and gold accents ───────────────────────────────
export function PremiumStatCard({
  label,
  value,
  icon: Icon,
  color = "text-[var(--gold-500)] dark:text-[var(--gold-300)]",
  bgColor = "bg-gradient-to-br from-[var(--gold-a10)] to-[var(--gold-a15)]",
  trend,
  suffix,
  delay = 0,
  onClick,
}: {
  label: string;
  value: number | string;
  icon?: any;
  color?: string;
  bgColor?: string;
  trend?: number;
  suffix?: string;
  delay?: number;
  onClick?: () => void;
}) {
  return (
    <div
      className={`glass-card gold-sweep rounded-xl p-4 relative overflow-hidden group ${onClick ? "cursor-pointer active-press" : ""}`}
      onClick={onClick}
    >
      {/* Gold accent corner lines */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[1px] h-10" style={{ background: 'linear-gradient(to bottom, var(--gold-a40), transparent)' }} />
        <div className="absolute top-0 right-0 h-[1px] w-10" style={{ background: 'linear-gradient(to left, var(--gold-a40), transparent)' }} />
      </div>
      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-all duration-500 bg-[var(--gold-a10)] group-hover:bg-[var(--gold-a15)]" />
      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground font-medium tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground tracking-tight number-pop">
            {typeof value === "number" ? value.toLocaleString("ar-SA") : value}
            {suffix && <span className="text-sm text-muted-foreground mr-1">{suffix}</span>}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? "text-emerald-500" : "text-red-500"}`}>
              <span>{trend >= 0 ? "▲" : "▼"}</span>
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${bgColor} ${color} border border-[var(--gold-a15)]`} style={{ boxShadow: 'var(--bevel-gold), var(--elev-1)' }}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Table wrapper with glass styling ──────────────────────────
export function PremiumTableWrapper({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-table rounded-xl overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

// ─── Empty State with premium styling ────────────────────────────────
export function PremiumEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center scale-bounce-in">
      {Icon && (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--gold-a10)] to-[var(--gold-a15)] mb-4 border border-[var(--gold-a15)]" style={{ boxShadow: 'var(--bevel-gold)' }}>
          <Icon className="h-10 w-10 text-muted-foreground/50" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Animated counter ──────────────────────────────────────────
export function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <span key={value} className="number-pop inline-block">
      {value.toLocaleString("ar-SA")}{suffix}
    </span>
  );
}

// ─── Stagger container for lists ───────────────────────────────
export function StaggerContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`stagger-children ${className}`}>
      {children}
    </div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// ─── Badge with premium styling ────────────────────────────────────
export function PremiumBadge({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const variants = {
    default: "bg-[var(--gold-a10)] text-[var(--gold-500)] border-[var(--gold-a20)] dark:text-[var(--gold-300)]",
    success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400",
    danger: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400",
    info: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variants[variant]}`}>
      {children}
    </span>
  );
}

// ─── Gold Divider ──────────────────────────────────────────────
export function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`gold-separator ${className}`} />
  );
}

```

---

## `client/src/components/VideoReport.tsx`

```tsx
/**
 * VideoReport — Generates animated video-style reports from dashboard data.
 * Uses Canvas API to create frame-by-frame animated presentations.
 * Can export as WebM video or animated GIF.
 */
import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ReportSlide {
  title: string;
  content: string;
  value?: string | number;
  icon?: string;
  color?: string;
}

interface VideoReportProps {
  slides: ReportSlide[];
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  fps?: number;
  slideDuration?: number; // seconds per slide
}

export function VideoReport({
  slides,
  title = "تقرير راصد الذكي",
  className,
  width = 1280,
  height = 720,
  fps = 30,
  slideDuration = 4,
}: VideoReportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>();

  const drawSlide = useCallback(
    (ctx: CanvasRenderingContext2D, slideIdx: number, frameProgress: number) => {
      const slide = slides[slideIdx];
      if (!slide) return;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0a0e1a");
      gradient.addColorStop(1, "#1a1e2e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Aurora effect
      const auroraGradient = ctx.createRadialGradient(
        width * 0.3 + Math.sin(frameProgress * Math.PI * 2) * 50,
        height * 0.3,
        0,
        width * 0.5,
        height * 0.5,
        width * 0.6
      );
      auroraGradient.addColorStop(0, `${slide.color || "#06b6d4"}15`);
      auroraGradient.addColorStop(1, "transparent");
      ctx.fillStyle = auroraGradient;
      ctx.fillRect(0, 0, width, height);

      // Slide number
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "16px Tajawal, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${slideIdx + 1} / ${slides.length}`, 40, height - 30);

      // Title bar
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, 0, width, 80);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 24px Tajawal, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(title, width - 40, 50);

      // Animated entrance
      const slideIn = Math.min(1, frameProgress * 3);
      const alpha = Math.min(1, frameProgress * 2);
      const offsetX = (1 - slideIn) * 100;

      ctx.globalAlpha = alpha;

      // Slide title
      ctx.fillStyle = slide.color || "#06b6d4";
      ctx.font = "bold 48px Tajawal, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(slide.title, width - 60 + offsetX, height * 0.35);

      // Value (if present)
      if (slide.value !== undefined) {
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "bold 80px Tajawal, sans-serif";
        ctx.fillText(String(slide.value), width - 60 + offsetX, height * 0.55);
      }

      // Content
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "24px Tajawal, sans-serif";
      const contentY = slide.value !== undefined ? height * 0.68 : height * 0.5;
      ctx.fillText(slide.content, width - 60 + offsetX, contentY);

      // Progress bar
      const totalProgress = (slideIdx + frameProgress) / slides.length;
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(0, height - 4, width, 4);
      ctx.fillStyle = slide.color || "#06b6d4";
      ctx.fillRect(0, height - 4, width * totalProgress, 4);

      // Decorative elements
      ctx.strokeStyle = `${slide.color || "#06b6d4"}33`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(100, height * 0.5, 150 + Math.sin(frameProgress * Math.PI * 4) * 20, 0, Math.PI * 2);
      ctx.stroke();
    },
    [slides, title, width, height]
  );

  const playPreview = useCallback(() => {
    if (!canvasRef.current || isPlaying) return;
    setIsPlaying(true);

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const totalFrames = slides.length * slideDuration * fps;
    let frame = 0;

    const animate = () => {
      if (frame >= totalFrames) {
        setIsPlaying(false);
        setCurrentSlide(0);
        setProgress(0);
        return;
      }

      const slideIdx = Math.floor(frame / (slideDuration * fps));
      const frameInSlide = (frame % (slideDuration * fps)) / (slideDuration * fps);

      setCurrentSlide(slideIdx);
      setProgress(frame / totalFrames);
      drawSlide(ctx, slideIdx, frameInSlide);

      frame++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [slides, fps, slideDuration, isPlaying, drawSlide]);

  const stopPreview = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
  }, []);

  const exportVideo = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    try {
      const stream = canvasRef.current.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rasid-report-${new Date().toISOString().split("T")[0]}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsGenerating(false);
      };

      mediaRecorder.start();

      // Render all frames
      const totalFrames = slides.length * slideDuration * fps;
      for (let frame = 0; frame < totalFrames; frame++) {
        const slideIdx = Math.floor(frame / (slideDuration * fps));
        const frameInSlide = (frame % (slideDuration * fps)) / (slideDuration * fps);
        drawSlide(ctx, slideIdx, frameInSlide);
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }

      mediaRecorder.stop();
    } catch (err) {
      console.error("Video export failed:", err);
      setIsGenerating(false);
    }
  }, [slides, fps, slideDuration, drawSlide]);

  // Draw initial slide
  React.useEffect(() => {
    if (!canvasRef.current || isPlaying) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) drawSlide(ctx, 0, 0.5);
  }, [drawSlide, isPlaying]);

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 p-4 border border-white/10", className)} dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white/90">تقرير فيديو</h3>
        <div className="flex gap-2">
          <button
            onClick={isPlaying ? stopPreview : playPreview}
            className="px-4 py-2 rounded-lg text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
          >
            {isPlaying ? "⏹ إيقاف" : "▶ معاينة"}
          </button>
          <button
            onClick={exportVideo}
            disabled={isGenerating || isPlaying}
            className="px-4 py-2 rounded-lg text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50"
          >
            {isGenerating ? "جاري التصدير..." : "⬇ تصدير فيديو"}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full rounded-lg border border-white/5"
        style={{ aspectRatio: `${width}/${height}` }}
      />

      {/* Progress */}
      {(isPlaying || isGenerating) && (
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default VideoReport;

```

---

## `client/src/components/WatermarkLogo.tsx`

```tsx
import { LOGO_WATERMARK } from "@/lib/rasidAssets";

interface WatermarkLogoProps {
  opacity?: number;
  size?: string;
  position?: "center" | "bottom-right" | "bottom-left" | "top-right";
}

/**
 * Subtle watermark logo that appears in the background of dashboard pages.
 * Uses the light/faded Rasid calligraphy for a premium branded feel.
 */
export function WatermarkLogo({ 
  opacity = 0.03, 
  size = "400px",
  position = "bottom-right" 
}: WatermarkLogoProps) {
  const positionClasses: Record<string, string> = {
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "bottom-right": "bottom-8 left-8",
    "bottom-left": "bottom-8 right-8",
    "top-right": "top-8 left-8",
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} pointer-events-none select-none z-0`}
      style={{ opacity }}
    >
      <img 
        src={LOGO_WATERMARK} 
        alt="" 
        className="w-auto h-auto"
        style={{ width: size, height: "auto" }}
        draggable={false}
        aria-hidden="true"
      />
    </div>
  );
}

```

---

## `client/src/components/WorkspaceSwitcher.tsx`

```tsx
/**
 * WorkspaceSwitcher — Professional workspace navigation for Rasid Platform
 * 2 main workspaces: الخصوصية (Privacy) + حالات الرصد (Monitoring Cases)
 * Shared section always visible + admin section for authorized users
 * Animated transitions, role-based visibility, localStorage persistence
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  Shield,
  Eye,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export type WorkspaceId = "privacy" | "leaks" | "shared" | "admin";

export interface Workspace {
  id: WorkspaceId;
  label: string;
  labelEn: string;
  icon: React.ElementType;
  description: string;
  color: string;
  colorLight: string;
  adminOnly?: boolean;
  rootAdminOnly?: boolean;
}

export const workspaces: Workspace[] = [
  {
    id: "privacy",
    label: "الخصوصية",
    labelEn: "Privacy",
    icon: Shield,
    description: "رصد سياسات الخصوصية والامتثال للمادة 12",
    color: "rgba(34, 197, 94, 0.9)",
    colorLight: "rgba(22, 163, 74, 0.9)",
  },
  {
    id: "leaks",
    label: "حالات الرصد",
    labelEn: "Monitoring Cases",
    icon: Eye,
    description: "لوحة حالات الرصد والتحليلات",
    color: "rgba(61, 177, 172, 0.9)",
    colorLight: "rgba(30, 58, 138, 0.9)",
  },
];

/** Map each route path to its workspace */
export const routeWorkspaceMap: Record<string, WorkspaceId> = {
  // ═══ Shared routes (always visible) ═══
  "/": "shared",
  "/my-custom-dashboard": "shared",
  "/cases": "shared",
  "/reports": "shared",
  "/smart-rasid": "shared",
  "/verify": "shared",
  "/documents-registry": "shared",
  "/document-stats": "shared",
  "/notifications": "shared",
  "/activity-logs": "shared",
  "/profile": "shared",
  "/change-password": "shared",
  "/members": "shared",
  "/settings": "shared",
  "/user-management": "shared",

  // ═══ Admin routes ═══
  "/admin": "admin",
  "/admin/roles": "admin",
  "/admin/groups": "admin",
  "/admin/feature-flags": "admin",
  "/admin/audit-log": "admin",
  "/admin/theme": "admin",
  "/admin/menus": "admin",
  "/admin-panel": "admin",
  "/super-admin": "admin",
  "/system-health": "admin",
  "/api-keys": "admin",
  "/data-retention": "admin",
  "/audit-log": "admin",
  "/monitoring-jobs": "admin",
  "/alert-channels": "admin",
  "/usage-analytics": "admin",
  "/scenario-management": "admin",
  "/ai-management": "admin",
  "/knowledge-base": "admin",
  "/personality-scenarios": "admin",
  "/training-center": "admin",

  // ═══ Privacy workspace ═══
  "/leadership": "privacy",
  "/sites": "privacy",
  "/change-detection": "privacy",
  "/clauses": "privacy",
  "/scan": "privacy",
  "/batch-scan": "privacy",
  "/scan-history": "privacy",
  "/scan-library": "privacy",
  "/scan-schedules": "privacy",
  "/advanced-scan": "privacy",
  "/deep-scan": "privacy",
  "/compliance-comparison": "privacy",
  "/compliance-heatmap": "privacy",
  "/advanced-analytics": "privacy",
  "/kpi-dashboard": "privacy",
  "/time-comparison": "privacy",
  "/sector-comparison": "privacy",
  "/interactive-comparison": "privacy",
  "/strategy-coverage": "privacy",
  "/real-time": "privacy",
  "/custom-reports": "privacy",
  "/scheduled-reports": "privacy",
  "/pdf-reports": "privacy",
  "/executive-report": "privacy",
  "/letters": "privacy",
  "/improvement-tracker": "privacy",
  "/export-data": "privacy",
  "/presentation": "privacy",
  "/presentation-builder": "privacy",
  "/bulk-analysis": "privacy",
  "/advanced-search": "privacy",
  "/smart-alerts": "privacy",
  "/visual-alerts": "privacy",
  "/email-notifications": "privacy",
  "/email-management": "privacy",
  "/message-templates": "privacy",
  "/escalation": "privacy",
  "/mobile-apps": "privacy",
  "/live-scan": "privacy",

  // ═══ Privacy: structured /app routes ═══
  "/app/overview": "shared",
  "/app/privacy": "privacy",
  "/app/privacy/sites": "privacy",

  // ═══ Monitoring Cases workspace ═══
  "/national-overview": "leaks",
  "/leaks": "leaks",
  "/incidents-registry": "leaks",
  "/leak-anatomy": "leaks",
  "/source-intelligence": "leaks",
  "/sector-analysis": "leaks",
  "/leak-timeline": "leaks",
  "/threat-actors-analysis": "leaks",
  "/impact-assessment": "leaks",
  "/geo-analysis": "leaks",
  "/executive-brief": "leaks",
  "/incident-compare": "leaks",
  "/campaign-tracker": "leaks",
  "/recommendations-hub": "leaks",
  "/pdpl-compliance": "leaks",
  "/pii-atlas": "leaks",
  "/pii-classifier": "leaks",
  "/evidence-chain": "leaks",
  "/feedback-accuracy": "leaks",
  "/report-approval": "leaks",
  "/telegram": "leaks",
  "/darkweb": "leaks",
  "/paste-sites": "leaks",
  "/osint-tools": "leaks",
  "/threat-rules": "leaks",
  "/knowledge-graph": "leaks",
  "/threat-map": "leaks",
  "/seller-profiles": "leaks",

  // ═══ Monitoring Cases: structured /app routes ═══
  "/app/incidents": "leaks",
  "/app/incidents/list": "leaks",
};

/** Get workspace for a given route, handling dynamic routes */
export function getWorkspaceForRoute(path: string): WorkspaceId {
  if (routeWorkspaceMap[path]) return routeWorkspaceMap[path];
  if (path.startsWith("/sites/")) return "privacy";
  if (path.startsWith("/clauses/")) return "privacy";
  if (path.startsWith("/scan-execution/")) return "privacy";
  if (path.startsWith("/app/privacy/")) return "privacy";
  if (path.startsWith("/app/incidents/")) return "leaks";
  if (path.startsWith("/incident/")) return "leaks";
  if (path.startsWith("/verify/")) return "shared";
  if (path.startsWith("/admin")) return "admin";
  // Default to shared for unknown routes
  return "shared";
}

/** Determine the active "switchable" workspace (privacy or leaks) from route */
export function getActiveMainWorkspace(path: string): "privacy" | "leaks" {
  const ws = getWorkspaceForRoute(path);
  if (ws === "privacy") return "privacy";
  if (ws === "leaks") return "leaks";
  // For shared/admin, check localStorage or default to privacy
  const stored = localStorage.getItem("rasid-workspace");
  if (stored === "leaks") return "leaks";
  return "privacy";
}

const STORAGE_KEY = "rasid-workspace";

interface WorkspaceSwitcherProps {
  collapsed: boolean;
  isAdmin: boolean;
  isRootAdmin: boolean;
  onWorkspaceChange?: (ws: WorkspaceId) => void;
}

export default function WorkspaceSwitcher({
  collapsed,
  isAdmin,
  isRootAdmin,
  onWorkspaceChange,
}: WorkspaceSwitcherProps) {
  const [location, navigate] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isOpen, setIsOpen] = useState(false);

  const activeMainWs = getActiveMainWorkspace(location);
  const activeWs = workspaces.find((w) => w.id === activeMainWs) || workspaces[0];

  const handleSelect = (ws: Workspace) => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, ws.id);
    onWorkspaceChange?.(ws.id);
    // Navigate to the main page of the selected workspace
    if (ws.id === "privacy") {
      navigate("/leadership");
    } else if (ws.id === "leaks") {
      navigate("/national-overview");
    }
  };

  const ActiveIcon = activeWs.icon;
  const accentColor = isDark ? activeWs.color : activeWs.colorLight;

  if (collapsed) {
    return (
      <div className="relative px-2 py-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{
              background: `${accentColor.replace("0.9", "0.15")}`,
              border: `1px solid ${accentColor.replace("0.9", "0.3")}`,
            }}
          >
            <ActiveIcon className="w-5 h-5" style={{ color: accentColor }} />
          </div>
        </button>
        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 10 }}
                className={`absolute right-14 top-0 z-[70] w-64 rounded-xl shadow-2xl overflow-hidden ${
                  isDark
                    ? "bg-[rgba(13,21,41,0.95)] border border-[rgba(61,177,172,0.15)]"
                    : "bg-white border border-[#e2e5ef]"
                } backdrop-blur-xl`}
              >
                <div className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-[#D4DDEF]/40" : "text-[#5a6478]"}`}>
                  اختر المنصة
                </div>
                {workspaces.map((ws) => {
                  const Icon = ws.icon;
                  const isActive = ws.id === activeMainWs;
                  const wsColor = isDark ? ws.color : ws.colorLight;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => handleSelect(ws)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 transition-all ${
                        isActive
                          ? isDark ? "bg-[rgba(61,177,172,0.08)]" : "bg-[rgba(30,58,138,0.04)]"
                          : isDark ? "hover:bg-[rgba(61,177,172,0.04)]" : "hover:bg-[rgba(30,58,138,0.02)]"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `${wsColor.replace("0.9", "0.12")}`,
                          border: `1px solid ${wsColor.replace("0.9", "0.25")}`,
                        }}
                      >
                        <Icon className="w-4 h-4" style={{ color: wsColor }} />
                      </div>
                      <div className="text-right flex-1 min-w-0">
                        <p className={`text-xs font-medium ${isDark ? "text-[#D4DDEF]" : "text-[#1c2833]"}`}>
                          {ws.label}
                        </p>
                        <p className={`text-[10px] ${isDark ? "text-[#D4DDEF]/40" : "text-[#5a6478]"}`}>
                          {ws.labelEn}
                        </p>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: wsColor }} />
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded: professional workspace selector with 2 tabs
  return (
    <div className="relative px-3 py-3">
      {/* Two-tab switcher */}
      <div className={`flex rounded-xl overflow-hidden ${isDark ? "bg-[rgba(13,21,41,0.6)] border border-[rgba(61,177,172,0.1)]" : "bg-[#f0f2f8] border border-[#e2e5ef]"}`}>
        {workspaces.map((ws) => {
          const Icon = ws.icon;
          const isActive = ws.id === activeMainWs;
          const wsColor = isDark ? ws.color : ws.colorLight;
          return (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 transition-all duration-200 relative ${
                isActive
                  ? ""
                  : isDark
                  ? "hover:bg-[rgba(61,177,172,0.04)]"
                  : "hover:bg-[rgba(30,58,138,0.02)]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="workspace-indicator"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: isDark
                      ? `linear-gradient(135deg, ${wsColor.replace("0.9", "0.15")}, ${wsColor.replace("0.9", "0.08")})`
                      : `linear-gradient(135deg, ${wsColor.replace("0.9", "0.1")}, ${wsColor.replace("0.9", "0.05")})`,
                    border: `1px solid ${wsColor.replace("0.9", "0.25")}`,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-2">
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? wsColor : isDark ? "#D4DDEF80" : "#5a6478" }}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: isActive ? wsColor : isDark ? "#D4DDEF80" : "#5a6478" }}
                >
                  {ws.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

```

---

## `client/src/components/WorldHeatmap.tsx`

```tsx
/**
 * WorldHeatmap — خريطة مصادر التهديدات العالمية
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ZoomIn, ZoomOut } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

interface WorldHeatmapProps {
  leaks: any[];
}

const COUNTRY_DATA: Record<string, { nameAr: string; nameEn: string; x: number; y: number; region: string }> = {
  SA: { nameAr: "المملكة العربية السعودية", nameEn: "Saudi Arabia", x: 57, y: 48, region: "middle_east" },
  AE: { nameAr: "الإمارات", nameEn: "UAE", x: 60, y: 49, region: "middle_east" },
  EG: { nameAr: "مصر", nameEn: "Egypt", x: 50, y: 47, region: "middle_east" },
  TR: { nameAr: "تركيا", nameEn: "Turkey", x: 52, y: 38, region: "middle_east" },
  IR: { nameAr: "إيران", nameEn: "Iran", x: 60, y: 42, region: "middle_east" },
  IQ: { nameAr: "العراق", nameEn: "Iraq", x: 57, y: 42, region: "middle_east" },
  PK: { nameAr: "باكستان", nameEn: "Pakistan", x: 65, y: 44, region: "asia" },
  IN: { nameAr: "الهند", nameEn: "India", x: 68, y: 48, region: "asia" },
  CN: { nameAr: "الصين", nameEn: "China", x: 75, y: 38, region: "asia" },
  RU: { nameAr: "روسيا", nameEn: "Russia", x: 65, y: 25, region: "europe" },
  UA: { nameAr: "أوكرانيا", nameEn: "Ukraine", x: 52, y: 32, region: "europe" },
  DE: { nameAr: "ألمانيا", nameEn: "Germany", x: 44, y: 32, region: "europe" },
  NL: { nameAr: "هولندا", nameEn: "Netherlands", x: 43, y: 30, region: "europe" },
  GB: { nameAr: "بريطانيا", nameEn: "UK", x: 40, y: 30, region: "europe" },
  US: { nameAr: "أمريكا", nameEn: "USA", x: 20, y: 38, region: "americas" },
  BR: { nameAr: "البرازيل", nameEn: "Brazil", x: 28, y: 60, region: "americas" },
  NG: { nameAr: "نيجيريا", nameEn: "Nigeria", x: 44, y: 55, region: "africa" },
  ID: { nameAr: "إندونيسيا", nameEn: "Indonesia", x: 78, y: 55, region: "asia" },
  KR: { nameAr: "كوريا الجنوبية", nameEn: "South Korea", x: 80, y: 36, region: "asia" },
};

const REGIONS: Record<string, string> = {
  all: "العالم", middle_east: "الشرق الأوسط", asia: "آسيا", europe: "أوروبا", americas: "الأمريكتين", africa: "أفريقيا",
};

export default function WorldHeatmap({ leaks }: WorldHeatmapProps) {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const countryStats = useMemo(() => {
    const map = new Map<string, { leakCount: number; recordCount: number; sources: Set<string> }>();
    leaks.forEach(leak => {
      const src = leak.source || "unknown";
      const countryCodes: string[] = [];
      if (leak.sourceCountry) countryCodes.push(leak.sourceCountry);
      else {
        if (src === "telegram") countryCodes.push("RU", "SA", "AE", "IR");
        else if (src === "dark_web") countryCodes.push("RU", "US", "NL", "DE", "UA");
        else if (src === "paste") countryCodes.push("US", "GB", "DE", "CN");
        else countryCodes.push("SA");
      }
      countryCodes.forEach(code => {
        const existing = map.get(code) || { leakCount: 0, recordCount: 0, sources: new Set<string>() };
        existing.leakCount += 1;
        existing.recordCount += leak.recordCount || 0;
        existing.sources.add(src);
        map.set(code, existing);
      });
    });
    return map;
  }, [leaks]);

  const maxLeaks = useMemo(() => {
    let max = 0;
    countryStats.forEach(v => { if (v.leakCount > max) max = v.leakCount; });
    return max || 1;
  }, [countryStats]);

  const filteredCountries = useMemo(() => {
    return Object.entries(COUNTRY_DATA).filter(([_, data]) =>
      selectedRegion === "all" || data.region === selectedRegion
    );
  }, [selectedRegion]);

  const getHeatColor = (count: number) => {
    const intensity = count / maxLeaks;
    if (intensity > 0.7) return { fill: "#ef4444", glow: "rgba(239,68,68,0.4)" };
    if (intensity > 0.4) return { fill: "#f59e0b", glow: "rgba(245,158,11,0.3)" };
    if (intensity > 0.15) return { fill: "#3b82f6", glow: "rgba(59,130,246,0.3)" };
    return { fill: "#10b981", glow: "rgba(16,185,129,0.3)" };
  };

  const ranking = useMemo(() => {
    return Array.from(countryStats.entries())
      .map(([code, stats]) => ({ code, leakCount: stats.leakCount, recordCount: stats.recordCount, name: COUNTRY_DATA[code]?.nameAr || code }))
      .sort((a, b) => b.leakCount - a.leakCount)
      .slice(0, 8);
  }, [countryStats]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className={`rounded-2xl border overflow-hidden ${isDark
        ? "bg-gradient-to-br from-[#0f172a]/90 to-[#1e293b]/80 border-white/[0.06] backdrop-blur-xl"
        : "bg-white/90 border-[#e2e5ef] shadow-lg shadow-blue-500/5"}`}>
      <div className="flex flex-wrap items-center justify-between p-4 gap-2">
        <div className="flex items-center gap-2">
          <motion.div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-blue-500/15" : "bg-blue-100"}`}
            animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 6, repeat: Infinity }}>
            <Globe className={`w-4 h-4 ${isDark ? "text-blue-400" : "text-blue-600"}`} />
          </motion.div>
          <div>
            <h3 className="text-sm font-bold text-foreground">خريطة مصادر التهديدات</h3>
            <p className="text-[9px] text-muted-foreground">Global Threat Sources Heatmap</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {Object.entries(REGIONS).map(([key, label]) => (
            <button key={key} onClick={() => setSelectedRegion(key)}
              className={`px-2 py-1 rounded-md text-[9px] font-medium transition-all ${selectedRegion === key
                ? isDark ? "bg-[#3DB1AC]/20 text-[#3DB1AC]" : "bg-blue-100 text-blue-700"
                : isDark ? "text-slate-400 hover:bg-white/5" : "text-slate-500 hover:bg-slate-100"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-2">
        <div className={`relative rounded-xl overflow-hidden ${isDark ? "bg-[#0a0f1e]/80" : "bg-slate-50"}`} style={{ height: "360px" }}>
          <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
            <button onClick={() => setZoom(z => Math.min(z + 0.3, 2.5))}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-white/10 hover:bg-white/15 text-white" : "bg-white hover:bg-slate-100 text-slate-700 shadow-sm"}`}>
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.3, 0.7))}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? "bg-white/10 hover:bg-white/15 text-white" : "bg-white hover:bg-slate-100 text-slate-700 shadow-sm"}`}>
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <svg viewBox="0 0 100 80" className="w-full h-full" style={{ transform: `scale(${zoom})`, transformOrigin: "center center", transition: "transform 0.3s ease" }}>
            {[20, 40, 60].map(y => (
              <line key={`h-${y}`} x1="0" y1={y} x2="100" y2={y} stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} strokeDasharray="1 2" />
            ))}
            {[20, 40, 60, 80].map(x => (
              <line key={`v-${x}`} x1={x} y1="0" x2={x} y2="80" stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"} strokeDasharray="1 2" />
            ))}
            {filteredCountries.map(([code, data]) => {
              const stats = countryStats.get(code);
              const count = stats?.leakCount || 0;
              const heat = getHeatColor(count);
              const baseSize = Math.max(1.5, Math.min(6, (count / maxLeaks) * 6 + 1.5));
              const isHovered = hoveredCountry === code;
              return (
                <g key={code} onMouseEnter={() => setHoveredCountry(code)} onMouseLeave={() => setHoveredCountry(null)} style={{ cursor: "pointer" }}>
                  {count > 0 && (
                    <motion.circle cx={data.x} cy={data.y} r={baseSize * 2} fill={heat.glow} opacity={0.3}
                      animate={{ r: [baseSize * 1.8, baseSize * 2.5, baseSize * 1.8], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 3, repeat: Infinity }} />
                  )}
                  <motion.circle cx={data.x} cy={data.y} r={baseSize}
                    fill={count > 0 ? heat.fill : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}
                    stroke={isHovered ? "#fff" : "none"} strokeWidth={isHovered ? 0.3 : 0}
                    animate={isHovered ? { r: baseSize * 1.3 } : { r: baseSize }} transition={{ duration: 0.2 }} />
                  <text x={data.x} y={data.y + baseSize + 2.5} textAnchor="middle" className="text-[2.5px] font-bold"
                    fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"}>{code}</text>
                </g>
              );
            })}
          </svg>

          <AnimatePresence>
            {hoveredCountry && COUNTRY_DATA[hoveredCountry] && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                className={`absolute top-3 right-3 p-3 rounded-xl z-20 ${isDark ? "bg-[#1e293b]/95 border border-white/10 backdrop-blur-xl" : "bg-white/95 border border-slate-200 shadow-lg"}`}>
                <p className="text-xs font-bold text-foreground">{COUNTRY_DATA[hoveredCountry].nameAr}</p>
                <p className="text-[9px] text-muted-foreground">{COUNTRY_DATA[hoveredCountry].nameEn}</p>
                <div className="mt-1.5 space-y-0.5">
                  <p className="text-[10px] text-foreground">حالات الرصد: <strong>{countryStats.get(hoveredCountry)?.leakCount || 0}</strong></p>
                  <p className="text-[10px] text-foreground">السجلات: <strong>{(countryStats.get(hoveredCountry)?.recordCount || 0).toLocaleString()}</strong></p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={`absolute bottom-2 right-2 flex items-center gap-2 px-2 py-1 rounded-lg ${isDark ? "bg-[#0f172a]/80" : "bg-white/80"}`}>
            {[{ label: "منخفض", color: "#10b981" }, { label: "متوسط", color: "#3b82f6" }, { label: "مرتفع", color: "#f59e0b" }, { label: "حرج", color: "#ef4444" }].map(l => (
              <span key={l.label} className="flex items-center gap-1 text-[8px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />{l.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-foreground">ترتيب الدول حسب عدد حالات الرصد</span>
        </div>
        <div className="space-y-1.5">
          {ranking.slice(0, 5).map((country, i) => {
            const heat = getHeatColor(country.leakCount);
            const pct = (country.leakCount / maxLeaks) * 100;
            return (
              <motion.div key={country.code} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground w-4 text-center font-bold">{i + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: heat.fill }} />
                <span className="text-[10px] text-foreground font-medium flex-1">{country.name}</span>
                <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                  <motion.div className="h-full rounded-full" style={{ backgroundColor: heat.fill }}
                    initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }} />
                </div>
                <span className="text-[9px] font-bold text-foreground w-8 text-left">{country.leakCount}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

```

---

