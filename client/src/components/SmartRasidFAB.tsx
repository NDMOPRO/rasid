import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Bot, Send, Loader2, X, Sparkles, Maximize2, Minimize2,
  ChevronDown, ExternalLink, Navigation, Check, XCircle,
  FileText, AlertTriangle,
} from "lucide-react";
import { Streamdown } from "streamdown";

const CHARACTER_URL = "/branding/characters/Character_3_dark_bg_transparent.png";

type Domain = 'leaks' | 'privacy';
type WidgetSize = 'collapsed' | 'normal' | 'maximized';

interface StreamStatus {
  phase: string;
  message: string;
}

interface NavigationRequest {
  targetPage: string;
  reason: string;
  requestId?: number;
}

function getDomainFromRoute(route: string): Domain {
  if (route.startsWith('/privacy') || route.startsWith('/compliance') || route.startsWith('/pdpl')) {
    return 'privacy';
  }
  return 'leaks';
}

export default function SmartRasidFAB() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [widgetSize, setWidgetSize] = useState<WidgetSize>('normal');
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<StreamStatus | null>(null);
  const [navigationRequest, setNavigationRequest] = useState<NavigationRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Determine domain from current route (GOV-01)
  const domain: Domain = useMemo(() => getDomainFromRoute(location), [location]);

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

  // Navigation consent (API-09, API-10, CHAT-03)
  const requestNavigation = trpc.smartMonitor.requestNavigation.useMutation();
  const respondToNavigation = trpc.smartMonitor.respondToNavigation.useMutation();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming, streamingContent]);

  // SSE streaming handler (API-03, UI-04)
  const sendWithStreaming = useCallback(async (text: string, convId: number) => {
    setIsStreaming(true);
    setStreamingContent("");
    setStreamStatus({ phase: "connecting", message: "جارٍ الاتصال..." });
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/rasid/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          message: text,
          domain,
          conversationId: convId,
          history: (messages || [])
            .filter((m: any) => m.role !== "system")
            .slice(-10)
            .map((m: any) => ({ role: m.role, content: m.content })),
          pageContext: {
            route: location,
            pageId: location.split('/').pop() || 'home',
            domain,
            userRole: user?.role || 'viewer',
            activeFilters: {},
            availableActions: [],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            const eventType = line.slice(7).trim();
            const dataLine = lines[lines.indexOf(line) + 1];
            if (dataLine?.startsWith("data: ")) {
              try {
                const data = JSON.parse(dataLine.slice(6));
                switch (eventType) {
                  case "status":
                    setStreamStatus(data);
                    break;
                  case "token":
                    fullContent += data.text;
                    setStreamingContent(fullContent);
                    break;
                  case "navigation":
                    // Show navigation consent dialog (CHAT-03)
                    setNavigationRequest({
                      targetPage: data.targetPage,
                      reason: data.reason,
                    });
                    break;
                  case "error":
                    // Show error inside widget (CHAT-01, UI-01)
                    setError(data.message);
                    break;
                  case "done":
                    setStreamStatus(null);
                    break;
                }
              } catch {
                // Skip malformed JSON
              }
            }
          } else if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                fullContent += data.text;
                setStreamingContent(fullContent);
              }
            } catch {
              // Skip
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        // Show error inside widget, never navigate to error page (CHAT-01, UI-01)
        setError(err.message || "حدث خطأ في الاتصال");
      }
    } finally {
      setIsStreaming(false);
      setStreamStatus(null);
      abortRef.current = null;
      // Refetch messages to sync with server
      refetchMessages();
    }
  }, [domain, location, messages, user, refetchMessages]);

  const handleSend = async (content?: string) => {
    const text = content || input.trim();
    if (!text) return;
    setInput("");
    setError(null);

    try {
      let convId = conversationId;
      if (!convId) {
        const conv = await createConversation.mutateAsync({
          title: text.slice(0, 50),
          pageContext: location,
        });
        convId = conv.id;
      }

      // Use SSE streaming
      await sendWithStreaming(text, convId!);
    } catch (err: any) {
      // Show error inside widget (CHAT-01)
      setError(err.message || "حدث خطأ");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle navigation consent (CHAT-03, CHAT-04, CHAT-05)
  const handleNavigationApproval = async (approved: boolean) => {
    if (!navigationRequest) return;

    if (navigationRequest.requestId) {
      await respondToNavigation.mutateAsync({
        requestId: navigationRequest.requestId,
        approved,
      });
    }

    if (approved) {
      // Navigate while keeping conversation (CHAT-04)
      setLocation(navigationRequest.targetPage);
    }
    // If denied, continue in widget (CHAT-05)
    setNavigationRequest(null);
  };

  const visibleMessages = useMemo(() => {
    return (messages || []).filter((m: any) => m.role !== "system");
  }, [messages]);

  // Toggle widget size (UI-02)
  const toggleSize = () => {
    if (widgetSize === 'normal') setWidgetSize('maximized');
    else setWidgetSize('normal');
  };

  if (!user) return null;

  // Widget sizing classes (UI-02)
  const sizeClasses = {
    collapsed: "w-96 h-12",
    normal: "w-96 max-w-[calc(100vw-3rem)] h-[32rem] max-h-[calc(100vh-6rem)]",
    maximized: "w-[48rem] max-w-[calc(100vw-3rem)] h-[calc(100vh-6rem)]",
  };

  const domainLabel = domain === 'leaks' ? 'مساعد التسربات' : 'مساعد الخصوصية';
  const domainColor = domain === 'leaks' ? 'gold' : 'emerald';

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

      {/* Chat Panel (UI-01: never opens error page) */}
      {open && (
        <div className={cn(
          "fixed bottom-6 left-6 z-50 rounded-2xl overflow-hidden glass-card flex flex-col shadow-2xl shadow-gold/10 transition-all duration-300",
          sizeClasses[widgetSize]
        )}>
          {/* Header with domain indicator (GOV-01) */}
          <div className="flex items-center justify-between p-3 border-b border-border/30 bg-background/80">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-gold" />
              </div>
              <div>
                <p className="text-sm font-semibold">راصد الذكي</p>
                <p className="text-xs text-muted-foreground">{domainLabel}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Collapse/Minimize (UI-02) */}
              {widgetSize === 'maximized' && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setWidgetSize('normal')}>
                  <Minimize2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {/* Maximize (UI-02) */}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleSize}>
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              {/* Full Page (UI-03) */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => { setOpen(false); setLocation("/app/smart-rasid"); }}
                title="فتح صفحة كاملة"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Navigation Consent Dialog (CHAT-03, UI-08) */}
          {navigationRequest && (
            <div className="p-3 bg-amber-500/10 border-b border-amber-500/30">
              <div className="flex items-start gap-2">
                <Navigation className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-medium">طلب تنقل</p>
                  <p className="text-xs text-muted-foreground mt-1">{navigationRequest.reason}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleNavigationApproval(true)}
                    >
                      <Check className="h-3 w-3" /> سماح
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1"
                      onClick={() => handleNavigationApproval(false)}
                    >
                      <XCircle className="h-3 w-3" /> عدم سماح
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error display inside widget (CHAT-01, UI-01) */}
          {error && (
            <div className="p-2 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
              <p className="text-xs text-red-400 flex-1">{error}</p>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setError(null)}>
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-hidden">
            {visibleMessages.length === 0 && !isStreaming ? (
              <div className="h-full flex flex-col items-center justify-center p-4 text-center">
                <img src={CHARACTER_URL} alt="راصد" className="h-16 mb-3" />
                <p className="text-sm font-medium mb-1">مرحباً{user?.name ? ` ${user.name}` : ""}</p>
                <p className="text-xs text-muted-foreground mb-4">كيف أستطيع مساعدتك؟</p>
                {/* Suggested actions (UI-11) */}
                <div className="space-y-1.5 w-full">
                  {(suggestions || []).slice(0, 6).map((s: string, i: number) => (
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

                  {/* Streaming response (UI-04) */}
                  {isStreaming && (
                    <div className="flex gap-2 justify-start">
                      <div className="h-6 w-6 shrink-0 mt-1 rounded-full bg-gold/10 flex items-center justify-center">
                        <Bot className="h-3 w-3 text-gold" />
                      </div>
                      <div className="max-w-[85%] rounded-lg px-3 py-2 bg-secondary/50">
                        {streamingContent ? (
                          <div className="prose prose-xs prose-invert max-w-none text-sm">
                            <Streamdown>{streamingContent}</Streamdown>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin text-gold" />
                            <span className="text-xs text-muted-foreground">
                              {streamStatus?.message || "جارٍ التحليل..."}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Streaming status bar (API-04) */}
          {streamStatus && (
            <div className="px-3 py-1 border-t border-border/20 bg-gold/5">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin text-gold" />
                <span className="text-xs text-muted-foreground">{streamStatus.message}</span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/30 p-2 flex gap-2 items-end">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل راصد الذكي..."
              className="flex-1 max-h-20 resize-none min-h-[36px] text-sm bg-secondary/30 border-border/30"
              rows={1}
              disabled={isStreaming}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isStreaming}
              className="bg-gold text-gold-foreground hover:bg-gold/90 h-9 w-9 shrink-0"
              size="icon"
            >
              {isStreaming ? (
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
