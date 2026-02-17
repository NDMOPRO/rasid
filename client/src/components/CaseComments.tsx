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
