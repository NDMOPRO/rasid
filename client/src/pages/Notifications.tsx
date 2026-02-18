import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Info, AlertTriangle, CheckCircle, XCircle, CheckCheck, Trash2, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const TYPE_CONFIG: Record<string, { icon: typeof Info; label: string; bgColor: string; textColor: string; badgeClass: string }> = {
  info: { icon: Info, label: "معلومات", bgColor: "bg-blue-900/30", textColor: "text-blue-400", badgeClass: "bg-blue-100 bg-blue-900/30 text-blue-400" },
  warning: { icon: AlertTriangle, label: "تحذير", bgColor: "bg-amber-900/30", textColor: "text-amber-400", badgeClass: "bg-amber-100 bg-amber-900/30 text-amber-400" },
  success: { icon: CheckCircle, label: "نجاح", bgColor: "bg-emerald-900/30", textColor: "text-emerald-400", badgeClass: "bg-emerald-100 bg-emerald-900/30 text-emerald-400" },
  error: { icon: XCircle, label: "خطأ", bgColor: "bg-red-900/30", textColor: "text-red-400", badgeClass: "bg-red-100 bg-red-900/30 text-red-400" },
};

function formatTime(timestamp: string | Date) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `منذ ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `منذ ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-SA-u-nu-latn", { year: "numeric", month: "long", day: "numeric" });
}

export default function Notifications() {
  const { playClick, playHover } = useSoundEffects();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const utils = trpc.useUtils();

  const { data: notifs, isLoading } = trpc.notifications.list.useQuery(undefined, { refetchInterval: 30000 });
  const { data: unreadData } = trpc.notifications.unreadCount.useQuery();

  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => { utils.notifications.list.invalidate(); utils.notifications.unreadCount.invalidate(); },
  });
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => { utils.notifications.list.invalidate(); utils.notifications.unreadCount.invalidate(); toast.success("تم تحديد جميع الإشعارات كمقروءة"); },
  });
  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => { utils.notifications.list.invalidate(); utils.notifications.unreadCount.invalidate(); toast.success("تم حذف الإشعار"); },
  });
  const deleteAllMutation = trpc.notifications.deleteAll.useMutation({
    onSuccess: () => { utils.notifications.list.invalidate(); utils.notifications.unreadCount.invalidate(); toast.success("تم حذف جميع الإشعارات"); },
  });

  const allNotifs = notifs || [];
  const unreadCount = unreadData?.count || 0;
  const filteredNotifs = activeTab === "all" ? allNotifs : activeTab === "unread" ? allNotifs.filter((n: any) => !n.isRead) : allNotifs.filter((n: any) => n.type === activeTab);
  const countByType = allNotifs.reduce((acc: Record<string, number>, n: any) => { const t = n.type || "info"; acc[t] = (acc[t] || 0) + 1; return acc; }, {} as Record<string, number>);

  return (
    <div
      className="space-y-6">
      <WatermarkLogo />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">مركز الإشعارات</h1>
          <p className="text-muted-foreground text-sm mt-1">{unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : "لا توجد إشعارات جديدة"}</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => markAllReadMutation.mutate()}><CheckCheck className="h-4 w-4 ms-2" /> قراءة الكل</Button>}
          {allNotifs.length > 0 && <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600" onClick={() => deleteAllMutation.mutate()}><Trash2 className="h-4 w-4 ms-2" /> حذف الكل</Button>}
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 stagger-children">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" onClick={() => setActiveTab("all")}><CardContent className="p-3 text-center"><div className="text-xl font-bold">{allNotifs.length}</div><div className="text-xs text-muted-foreground">الإجمالي</div></CardContent></Card>
        <Card className="cursor-pointer hover:border-primary/50 transition-colors glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300" onClick={() => setActiveTab("unread")}><CardContent className="p-3 text-center"><div className="text-xl font-bold text-blue-500">{unreadCount}</div><div className="text-xs text-muted-foreground">غير مقروء</div></CardContent></Card>
        {Object.entries(TYPE_CONFIG).map(([type, config]) => (
          <Card key={type} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setActiveTab(type)}><CardContent className="p-3 text-center"><div className={`text-xl font-bold ${config.textColor}`}>{countByType[type] || 0}</div><div className="text-xs text-muted-foreground">{config.label}</div></CardContent></Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList><TabsTrigger value="all">الكل</TabsTrigger><TabsTrigger value="unread">غير مقروء</TabsTrigger><TabsTrigger value="info">معلومات</TabsTrigger><TabsTrigger value="warning">تحذيرات</TabsTrigger><TabsTrigger value="success">نجاح</TabsTrigger><TabsTrigger value="error">أخطاء</TabsTrigger></TabsList>
      </Tabs>

      {isLoading ? (
        <div className="p-8 text-center text-muted-foreground">جاري التحميل...</div>
      ) : filteredNotifs.length === 0 ? (
        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"><CardContent className="p-12 text-center"><Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" /><h3 className="text-lg font-medium mb-2">لا توجد إشعارات</h3><p className="text-sm text-muted-foreground">{activeTab === "all" ? "ستظهر الإشعارات هنا عند وجود أحداث جديدة" : "لا توجد إشعارات في هذا التصنيف"}</p></CardContent></Card>
      ) : (
        <div className="space-y-2">
          {filteredNotifs.map((notif: any) => {
            const config = TYPE_CONFIG[notif.type || "info"] || TYPE_CONFIG.info;
            const Icon = config.icon;
            return (
              <Card key={notif.id} className={`transition-all hover:shadow-md cursor-pointer ${!notif.isRead ? "border-e-4 border-e-blue-500 bg-blue-950/10" : ""}`}
                onClick={() => { if (!notif.isRead) markReadMutation.mutate({ id: notif.id }); if (notif.link) navigate(notif.link); }}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${config.bgColor}`}><Icon className={`h-5 w-5 ${config.textColor}`} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{notif.title}</h3>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${config.badgeClass}`}>{config.label}</Badge>
                        {!notif.isRead && <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0">جديد</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{notif.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">{formatTime(notif.createdAt)}</span>
                        <div className="flex gap-1">
                          {notif.link && <Button variant="ghost" size="sm" className="h-6 text-xs"><ExternalLink className="h-3 w-3 ms-1" /> عرض</Button>}
                          <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-600" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: notif.id }); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
