import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Send, User, Loader2, Sparkles, MessageSquare, Upload, RotateCcw,
  History, Star, Download, BookOpen, Trash2, Plus, Clock, FileText
} from "lucide-react";
import { Streamdown } from "streamdown";
import { CHARACTER_SUNGLASSES } from "@/lib/rasidAssets";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { toast } from "sonner";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const RASID_AVATAR = CHARACTER_SUNGLASSES;

interface ChatMessage {
  messageId?: string;
  role: "user" | "assistant";
  content: string;
  sources?: { id: number; title: string; score: number }[];
  rating?: number;
  timestamp: Date;
}

export default function SmartRasid() {
  const { playClick } = useSoundEffects();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showSessions, setShowSessions] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const greetingQuery = trpc.ai.getGreeting.useQuery(undefined, { enabled: !!user });
  const ragChatMutation = trpc.ai.ragChat.useMutation();
  const rateMessageMutation = trpc.ai.rateMessage.useMutation();
  const sessionsQuery = trpc.ai.getSessions.useQuery(undefined, { enabled: showSessions && !!user });
  const uploadMutation = trpc.ai.uploadDocument.useMutation();
  const deleteSessionMutation = trpc.ai.deleteSession.useMutation();
  const utils = trpc.useUtils();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (greetingQuery.data && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: greetingQuery.data.greeting,
        timestamp: new Date(),
      }]);
    }
  }, [greetingQuery.data]);

  const handleSend = useCallback(async () => {
    const msg = input.trim();
    if (!msg || isTyping) return;
    playClick();

    const userMsg: ChatMessage = { role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Build history from recent messages (last 8)
      const history = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .slice(-8)
        .map(m => ({ role: m.role, content: m.content }));

      const result = await ragChatMutation.mutateAsync({
        message: msg,
        sessionId: sessionId || undefined,
        history,
      });

      if (!sessionId && result.sessionId) {
        setSessionId(result.sessionId);
      }

      setMessages(prev => [...prev, {
        messageId: result.messageId,
        role: "assistant",
        content: result.response,
        sources: result.sources,
        timestamp: new Date(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, sessionId, messages, ragChatMutation, playClick]);

  const handleRate = async (msgIndex: number, rating: number) => {
    const msg = messages[msgIndex];
    if (!msg?.messageId || !sessionId) return;
    try {
      await rateMessageMutation.mutateAsync({
        messageId: msg.messageId,
        sessionId,
        rating,
      });
      setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, rating } : m));
      toast.success("شكراً لتقييمك!");
    } catch { /* ignore */ }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const content = ev.target?.result as string;
      if (content && content.length > 10) {
        try {
          const result = await uploadMutation.mutateAsync({ content, source: file.name });
          setMessages(prev => [...prev, {
            role: "assistant",
            content: result.success
              ? `تم تحميل المستند "${file.name}" بنجاح! تمت إضافة ${result.entriesAdded} فقرة إلى قاعدة المعرفة.`
              : "فشل تحميل المستند. يرجى المحاولة مرة أخرى.",
            timestamp: new Date(),
          }]);
        } catch {
          setMessages(prev => [...prev, {
            role: "assistant", content: "حدث خطأ أثناء تحميل المستند.", timestamp: new Date(),
          }]);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const startNewChat = () => {
    playClick();
    setMessages([]);
    setSessionId(null);
    if (greetingQuery.data) {
      setMessages([{ role: "assistant", content: greetingQuery.data.greeting, timestamp: new Date() }]);
    }
  };

  const loadSession = async (sid: string) => {
    setShowSessions(false);
    setSessionId(sid);
    setMessages([]);
    try {
      const msgs = await utils.ai.getSessionMessages.fetch({ sessionId: sid });
      setMessages(msgs.map((m: any) => ({
        messageId: m.messageId,
        role: m.role as "user" | "assistant",
        content: m.content,
        sources: m.sources,
        timestamp: new Date(m.createdAt),
      })));
    } catch {
      toast.error("فشل تحميل المحادثة");
    }
  };

  const handleDeleteSession = async (sid: string) => {
    try {
      await deleteSessionMutation.mutateAsync({ sessionId: sid });
      utils.ai.getSessions.invalidate();
      if (sessionId === sid) startNewChat();
      toast.success("تم حذف المحادثة");
    } catch {
      toast.error("فشل حذف المحادثة");
    }
  };

  const handleExport = async (format: "json" | "markdown") => {
    if (!sessionId) return;
    try {
      const result = await utils.ai.exportSession.fetch({ sessionId, format });
      const blob = new Blob([result.data], { type: result.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rasid-chat-${sessionId}.${format === "json" ? "json" : "md"}`;
      a.click();
      URL.revokeObjectURL(url);
      setShowExport(false);
      toast.success("تم تصدير المحادثة بنجاح");
    } catch {
      toast.error("فشل تصدير المحادثة");
    }
  };

  // Star rating component
  const StarRating = ({ rating, onRate, size = 14 }: { rating?: number; onRate: (r: number) => void; size?: number }) => (
    <div className="flex gap-0.5 items-center">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => onRate(star)}
          className="transition-all duration-200 hover:scale-125"
        >
          <Star
            size={size}
            className={`${star <= (rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/40 hover:text-yellow-400/60"} transition-colors`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative">
          <img src={RASID_AVATAR} alt="راصد الذكي" className="w-14 h-14 rounded-full border-2 border-primary shadow-lg object-cover bg-white logo-animated" />
          <span className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background" />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            راصد الذكي
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">RAG</Badge>
          </h1>
          <p className="text-sm text-muted-foreground">مساعدك الذكي المعزز بقاعدة المعرفة والبحث الدلالي</p>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowSessions(!showSessions)}>
                  <History className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>جلسات المحادثة</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {sessionId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowExport(true)}>
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تصدير المحادثة</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={startNewChat}>
                  <Plus className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>محادثة جديدة</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <Separator />

      {/* Sessions Panel */}
      
        {showSessions && (
          <div
            className="overflow-hidden"
          >
            <Card className="glass-card gold-sweep my-3 p-3 max-h-48 overflow-y-auto">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
                <MessageSquare className="w-4 h-4" /> جلسات المحادثة
              </h3>
              {sessionsQuery.isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : !sessionsQuery.data?.length ? (
                <p className="text-xs text-muted-foreground text-center py-2">لا توجد جلسات سابقة</p>
              ) : (
                <div className="space-y-1.5">
                  {sessionsQuery.data.map((s: any) => (
                    <div
                      key={s.sessionId}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors text-xs ${sessionId === s.sessionId ? "bg-primary/10 border border-primary/20" : ""}`}
                    >
                      <div className="flex-1 min-w-0" onClick={() => loadSession(s.sessionId)}>
                        <p className="font-medium truncate" dir="rtl">{s.title || "محادثة"}</p>
                        <div className="flex items-center gap-2 text-muted-foreground mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(s.updatedAt).toLocaleDateString("ar-SA")}</span>
                          <span>•</span>
                          <span>{s.messageCount} رسالة</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost" size="icon" className="h-6 w-6 text-destructive/60 hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.sessionId); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      

      {/* Chat Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4 px-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className="flex-shrink-0">
                {msg.role === "assistant" ? (
                  <img src={RASID_AVATAR} alt="راصد" className="w-9 h-9 rounded-full border border-primary/30 object-cover bg-white" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
              </div>
              <div className={`max-w-[85%] ${msg.role === "user" ? "text-end" : ""}`}>
                <Card className={`p-3 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                  {msg.role === "assistant" ? (
                    <div className="text-end" dir="rtl">
                      {/* Sources badges */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5 pb-2 border-b border-border/50">
                          <BookOpen className="w-3 h-3 text-muted-foreground mt-0.5 ms-1" />
                          <span className="text-[10px] text-muted-foreground ms-1 leading-5">المصادر:</span>
                          {msg.sources.map((src, si) => (
                            <span key={si} className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium">
                              {src.title} ({(src.score * 100).toFixed(0)}%)
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Rich markdown content */}
                      <div className="prose prose-sm dark:prose-invert max-w-none [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:bg-primary/10 [&_th]:p-2 [&_th]:text-end [&_td]:p-2 [&_td]:border-b [&_td]:border-border/30 [&_h1]:text-lg [&_h2]:text-base [&_h3]:text-sm [&_h3]:font-bold [&_ul]:pe-4 [&_ol]:pe-4 [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:rounded-lg [&_blockquote]:border-e-2 [&_blockquote]:border-primary [&_blockquote]:pe-3 [&_blockquote]:me-0 [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_strong]:text-foreground [&_hr]:border-border/50">
                        <Streamdown>{msg.content}</Streamdown>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap" dir="rtl">{msg.content}</p>
                  )}
                </Card>
                {/* Star Rating for assistant messages */}
                {msg.role === "assistant" && msg.messageId && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <StarRating rating={msg.rating} onRate={(r) => handleRate(i, r)} />
                    <span className="text-[10px] text-muted-foreground">
                      {msg.rating ? `${msg.rating}/5` : "قيّم الإجابة"}
                    </span>
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground mt-0.5 block">
                  {msg.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div
              className="flex gap-3"
            >
              <img src={RASID_AVATAR} alt="راصد" className="w-9 h-9 rounded-full border border-primary/30 object-cover bg-white" />
              <Card className="glass-card gold-sweep p-3 bg-muted/50">
                <div className="flex gap-1.5 items-center">
                  <span className="text-sm text-muted-foreground">راصد الذكي يبحث في قاعدة المعرفة ويحلل...</span>
                  <span className="flex gap-0.5">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t pt-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل راصد الذكي عن أي شيء: بيانات المواقع، نتائج الفحص، المادة 12..."
              className="min-h-[44px] max-h-32 resize-none pe-3 text-end"
              dir="rtl"
              disabled={isTyping}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Button onClick={handleSend} disabled={!input.trim() || isTyping} size="icon" className="h-10 w-10">
              {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10 relative" disabled={uploadMutation.isPending}>
                    <Upload className="w-4 h-4" />
                    <input type="file" accept=".txt,.md,.csv,.json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>رفع مستند للتعلم</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {[
            "أعطني إحصائيات المنصة",
            "ابحث عن موقع sdaia.gov.sa",
            "ما هي نسبة الامتثال لكل بند؟",
            "قارن بين القطاعات",
            "ما هو نظام حماية البيانات الشخصية؟",
          ].map((q, i) => (
            <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors text-xs"
              onClick={() => { setInput(q); textareaRef.current?.focus(); }}>
              {q}
            </Badge>
          ))}
        </div>
      </div>

      {/* Export Dialog */}
      <Dialog open={showExport} onOpenChange={setShowExport}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              تصدير المحادثة
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4 stagger-children">
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExport("markdown")}>
              <FileText className="w-8 h-8 text-blue-500" />
              <span className="text-sm font-medium">Markdown</span>
              <span className="text-[10px] text-muted-foreground">تقرير مقروء</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExport("json")}>
              <FileText className="w-8 h-8 text-green-500" />
              <span className="text-sm font-medium">JSON</span>
              <span className="text-[10px] text-muted-foreground">بيانات كاملة</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
