import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import {
  Sparkles, Send, Loader2, Plus, MessageSquare, Trash2,
  ChevronLeft, ChevronRight, Bot
} from "lucide-react";
import { Streamdown } from "streamdown";

const CHARACTER_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663331132774/bplMgZcUFrzRMDas.png";

export default function SmartRasid() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations, refetch: refetchConversations } = trpc.ai.conversations.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: messages, refetch: refetchMessages } = trpc.ai.messages.useQuery(
    { conversationId: activeConversationId! },
    { enabled: !!activeConversationId }
  );
  const { data: suggestions } = trpc.ai.suggestions.useQuery(
    { route: location },
    { enabled: !!user }
  );

  const createConversation = trpc.ai.createConversation.useMutation({
    onSuccess: (conv) => {
      setActiveConversationId(conv.id);
      refetchConversations();
    },
  });

  const sendMessage = trpc.ai.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
    },
  });

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sendMessage.isPending]);

  const handleSend = async (content?: string) => {
    const text = content || input.trim();
    if (!text) return;
    setInput("");

    let convId = activeConversationId;
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

  const handleNewChat = () => {
    setActiveConversationId(null);
  };

  const visibleMessages = useMemo(() => {
    return (messages || []).filter((m: any) => m.role !== "system");
  }, [messages]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden -m-6">
      {/* Sidebar - Conversations */}
      <div className={cn(
        "border-l border-border/30 bg-background/50 transition-all duration-300 flex flex-col",
        sidebarOpen ? "w-72" : "w-0 overflow-hidden"
      )}>
        <div className="p-3 border-b border-border/30 flex items-center justify-between">
          <h3 className="text-sm font-semibold">المحادثات</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations?.map((conv: any) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={cn(
                  "w-full text-right p-2.5 rounded-lg text-sm transition-colors flex items-center gap-2",
                  activeConversationId === conv.id
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "hover:bg-accent/50 text-muted-foreground"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{conv.title || "محادثة جديدة"}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Toggle Sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="w-6 flex items-center justify-center border-l border-border/30 hover:bg-accent/50 transition-colors"
      >
        {sidebarOpen ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden">
          {!activeConversationId && visibleMessages.length === 0 ? (
            /* Welcome Screen */
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <img src={CHARACTER_URL} alt="راصد الذكي" className="h-32 mb-6 drop-shadow-lg" />
              <h2 className="text-2xl font-bold mb-2">
                مرحباً{user?.name ? ` ${user.name}` : ""}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                أنا راصد الذكي، مساعدك التشغيلي في المنصة. أستطيع مساعدتك في تحليل البيانات، إنشاء التقارير، وتنفيذ المهام.
              </p>

              {/* Suggestions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                {(suggestions || []).slice(0, 6).map((s: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    className="glass-card p-3 text-sm text-right hover:border-gold/30 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span>{s}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages */
            <ScrollArea className="h-full">
              <div ref={scrollRef} className="max-w-3xl mx-auto p-6 space-y-6">
                {visibleMessages.map((msg: any, i: number) => (
                  <div
                    key={msg.id || i}
                    className={cn(
                      "flex gap-3",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-8 w-8 shrink-0 mt-1 rounded-full bg-gold/10 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gold" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl px-4 py-3",
                        msg.role === "user"
                          ? "bg-gold text-gold-foreground"
                          : "glass-card"
                      )}
                    >
                      {msg.role === "assistant" ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <Streamdown>{msg.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))}

                {sendMessage.isPending && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 shrink-0 mt-1 rounded-full bg-gold/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-gold" />
                    </div>
                    <div className="glass-card px-4 py-3 flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-gold" />
                      <span className="text-sm text-muted-foreground">جارٍ التحليل...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/30 p-4 bg-background/50">
          <div className="max-w-3xl mx-auto flex gap-3 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="اسأل راصد الذكي..."
              className="flex-1 max-h-32 resize-none min-h-[44px] bg-secondary/50 border-border/30"
              rows={1}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || sendMessage.isPending}
              className="bg-gold text-gold-foreground hover:bg-gold/90 h-[44px] w-[44px] shrink-0"
              size="icon"
            >
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
