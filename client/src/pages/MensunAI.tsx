import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Bot, Send, User, Sparkles, RefreshCw, ThumbsUp, ThumbsDown,
  Building2, FileText, DollarSign, MapPin, Users, BarChart3,
  Zap, GraduationCap, Shield, ClipboardList, TrendingUp, Copy, Check
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Streamdown } from "streamdown";
import { nanoid } from "nanoid";
import { toast } from "sonner";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  id?: number;
  rating?: number;
}

export default function MensunAI() {
  const { t, lang } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(() => nanoid());
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showTriggers, setShowTriggers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const chatMutation = trpc.ai.chat.useMutation();
  const rateMutation = trpc.ai.rate.useMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isLoading) return;

    setInput("");
    setShowTriggers(false);
    setMessages(prev => [...prev, { role: "user", content: msg, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const result = await chatMutation.mutateAsync({ message: msg, sessionId });
      setMessages(prev => [...prev, { role: "assistant", content: result.content, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: lang === "ar" ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى." : "Sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, chatMutation, sessionId, lang]);

  const handleRate = async (msgIndex: number, rating: number) => {
    const msg = messages[msgIndex];
    if (!msg?.id) {
      // Rate via index since we don't have DB id in this session
      setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, rating } : m));
      toast.success(lang === "ar" ? "شكراً لتقييمك!" : "Thanks for your feedback!");
      return;
    }
    try {
      await rateMutation.mutateAsync({ messageId: msg.id, rating });
      setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, rating } : m));
      toast.success(lang === "ar" ? "شكراً لتقييمك!" : "Thanks for your feedback!");
    } catch {
      toast.error(lang === "ar" ? "فشل التقييم" : "Rating failed");
    }
  };

  const copyMessage = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
    toast.success(lang === "ar" ? "تم النسخ" : "Copied!");
  };

  // Quick commands organized by category
  const quickCommands = [
    { icon: Building2, label: lang === "ar" ? "ملخص المحفظة" : "Portfolio", command: "/portfolio", color: "text-emerald-500" },
    { icon: FileText, label: lang === "ar" ? "العقود المنتهية" : "Expiring", command: "/expiring", color: "text-amber-500" },
    { icon: DollarSign, label: lang === "ar" ? "ملخص مالي" : "Financials", command: "/financials", color: "text-blue-500" },
    { icon: MapPin, label: lang === "ar" ? "حالة المدن" : "City Status", command: "/status all", color: "text-purple-500" },
    { icon: TrendingUp, label: lang === "ar" ? "خط الإنتاج" : "Pipeline", command: "/pipeline", color: "text-cyan-500" },
    { icon: Users, label: lang === "ar" ? "الفريق" : "Team", command: "/team", color: "text-pink-500" },
    { icon: BarChart3, label: lang === "ar" ? "المنافسون" : "Competitors", command: "/competitors", color: "text-orange-500" },
    { icon: Shield, label: lang === "ar" ? "مصفوفة التصعيد" : "Escalation", command: "/escalation", color: "text-red-500" },
  ];

  // Structured triggers
  const triggers = [
    { icon: Zap, label: lang === "ar" ? "تحديث" : "Update", prefix: "Update: ", desc: lang === "ar" ? "سجل تحديث منظم" : "Structured update log", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { icon: ClipboardList, label: lang === "ar" ? "قرار" : "Decision", prefix: "Decision: ", desc: lang === "ar" ? "موجز قرار" : "Decision brief", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { icon: BarChart3, label: lang === "ar" ? "منافس" : "Competitor", prefix: "Competitor: ", desc: lang === "ar" ? "تحليل منافس" : "Competitor analysis", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { icon: GraduationCap, label: lang === "ar" ? "تدريب" : "Train", prefix: "Train: ", desc: lang === "ar" ? "وضع التدريب" : "Training mode", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { icon: FileText, label: lang === "ar" ? "إجراء تشغيلي" : "SOP", prefix: "SOP: ", desc: lang === "ar" ? "إجراء تشغيلي معياري" : "Standard operating procedure", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight">{t("ai.title")}</h1>
              <Badge variant="outline" className="text-[10px] font-medium">v2.0</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === "ar" ? "وكيل التوسع التنفيذي — عربي/إنجليزي — يفهم كل اللهجات" : "Execution-first expansion agent — AR/EN — All dialects"}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => { setMessages([]); }} className="text-muted-foreground">
          <RefreshCw className="h-4 w-4 me-1" />{t("ai.newChat")}
        </Button>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden border-border/50">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4 shadow-inner">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-1">{t("ai.welcome")}</h2>
              <p className="text-sm text-muted-foreground max-w-lg mb-6">
                {lang === "ar"
                  ? "أنا منسون — وكيل التوسع لـ CoBNB KSA. أفهم كل اللهجات العربية والإنجليزي. أقدر أساعدك في العقارات، العقود، المالية، المنافسين، والعمليات. جرب الأوامر السريعة أو اكتب سؤالك."
                  : "I'm Mensun — CoBNB KSA's expansion agent. I understand all Arabic dialects and English. I can help with properties, contracts, financials, competitors, and operations. Try the quick commands or ask anything."}
              </p>

              {/* Quick Commands Grid */}
              <div className="w-full max-w-2xl mb-6">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  {lang === "ar" ? "أوامر سريعة" : "Quick Commands"}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickCommands.map(cmd => (
                    <button
                      key={cmd.command}
                      onClick={() => sendMessage(cmd.command)}
                      className="flex items-center gap-2 p-3 rounded-lg border border-border hover:bg-accent hover:border-primary/20 transition-all text-start group"
                    >
                      <cmd.icon className={`h-4 w-4 ${cmd.color} group-hover:scale-110 transition-transform`} />
                      <span className="text-xs font-medium truncate">{cmd.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Structured Triggers */}
              <div className="w-full max-w-2xl">
                <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                  {lang === "ar" ? "أوامر متقدمة" : "Structured Triggers"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {triggers.slice(0, 3).map(trigger => (
                    <button
                      key={trigger.prefix}
                      onClick={() => { setInput(trigger.prefix); inputRef.current?.focus(); }}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-start ${trigger.color}`}
                    >
                      <trigger.icon className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold">{trigger.label}</p>
                        <p className="text-[10px] opacity-70">{trigger.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""} group`}>
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/80 border border-border/50"
                }`}>
                  {msg.role === "assistant" ? (
                    <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                      <Streamdown>{msg.content}</Streamdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <div className={`flex items-center gap-2 mt-2 ${msg.role === "user" ? "justify-end" : "justify-between"}`}>
                    <p className={`text-[10px] ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => copyMessage(msg.content, i)}
                              className="h-6 w-6 rounded flex items-center justify-center hover:bg-background/80 text-muted-foreground"
                            >
                              {copiedIdx === i ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">{lang === "ar" ? "نسخ" : "Copy"}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleRate(i, 5)}
                              className={`h-6 w-6 rounded flex items-center justify-center hover:bg-background/80 ${msg.rating === 5 ? "text-green-500" : "text-muted-foreground"}`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">{lang === "ar" ? "مفيد" : "Helpful"}</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleRate(i, 1)}
                              className={`h-6 w-6 rounded flex items-center justify-center hover:bg-background/80 ${msg.rating === 1 ? "text-red-500" : "text-muted-foreground"}`}
                            >
                              <ThumbsDown className="h-3 w-3" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">{lang === "ar" ? "غير مفيد" : "Not helpful"}</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0 mt-1">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary animate-pulse" />
              </div>
              <div className="bg-muted/80 border border-border/50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span>{lang === "ar" ? "منسون يفكر..." : "Mensun is thinking..."}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trigger Bar (expandable) */}
        {showTriggers && messages.length > 0 && (
          <div className="border-t border-border/50 px-4 py-2 bg-muted/30">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {triggers.map(trigger => (
                <button
                  key={trigger.prefix}
                  onClick={() => { setInput(trigger.prefix); setShowTriggers(false); inputRef.current?.focus(); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium whitespace-nowrap transition-all ${trigger.color}`}
                >
                  <trigger.icon className="h-3 w-3" />
                  {trigger.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex gap-2 items-center">
            {messages.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => setShowTriggers(!showTriggers)}
                  >
                    <Zap className={`h-4 w-4 ${showTriggers ? "text-primary" : "text-muted-foreground"}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {lang === "ar" ? "أوامر متقدمة" : "Structured triggers"}
                </TooltipContent>
              </Tooltip>
            )}
            <Input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={lang === "ar" ? "اسأل منسون أي شيء... (جرب: وش عندنا من شقق؟)" : "Ask Mensun anything... (try: /portfolio or Update: ...)"}
              disabled={isLoading}
              className="flex-1"
              autoFocus
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
