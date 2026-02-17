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

const CHARACTER_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/bplMgZcUFrzRMDas.png";

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
