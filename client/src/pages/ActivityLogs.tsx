import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Search, LogIn, LogOut, KeyRound, UserPlus, UserMinus,
  ShieldCheck, Scan, Filter, ChevronRight, ChevronLeft, Clock,
  Monitor, Globe, RefreshCw
} from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const ACTION_MAP: Record<string, { label: string; icon: typeof Activity; color: string }> = {
  login: { label: "تسجيل دخول", icon: LogIn, color: "bg-green-100 bg-green-900/30 text-green-400" },
  logout: { label: "تسجيل خروج", icon: LogOut, color: "bg-gray-100 bg-gray-800 text-gray-400" },
  change_password: { label: "تغيير كلمة المرور", icon: KeyRound, color: "bg-yellow-100 bg-yellow-900/30 text-yellow-400" },
  create_user: { label: "إنشاء مستخدم", icon: UserPlus, color: "bg-blue-100 bg-blue-900/30 text-blue-400" },
  delete_user: { label: "حذف مستخدم", icon: UserMinus, color: "bg-red-100 bg-red-900/30 text-red-400" },
  update_role: { label: "تعديل صلاحية", icon: ShieldCheck, color: "bg-primary/10 bg-primary/15 text-primary" },
  scan_site: { label: "فحص موقع", icon: Scan, color: "bg-indigo-100 bg-indigo-900/30 text-indigo-400" },
};

export default function ActivityLogs() {
  const { playClick, playHover } = useSoundEffects();
  const [page, setPage] = useState(1);
  const [filterAction, setFilterAction] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, refetch } = trpc.activityLogs.list.useQuery(
    { page, limit: 30, action: filterAction || undefined },
    { refetchInterval: 30000 }
  );

  const filteredLogs = useMemo(() => {
    if (!data?.logs) return [];
    if (!searchTerm) return data.logs;
    return data.logs.filter((log: any) =>
      log.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data?.logs, searchTerm]);

  const formatDate = (ts: number | string) => {
    const d = new Date(typeof ts === 'string' ? ts : ts);
    return d.toLocaleDateString('ar-SA-u-nu-latn', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (ts: number | string) => {
    const d = new Date(typeof ts === 'string' ? ts : ts);
    return d.toLocaleTimeString('ar-SA-u-nu-latn', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const parseUserAgent = (ua: string) => {
    if (!ua) return "غير معروف";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Firefox")) return "Firefox";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Edge")) return "Edge";
    return "متصفح آخر";
  };

  return (
    <div
      className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2D5F8A] flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground gradient-text">سجل النشاطات</h1>
            <p className="text-sm text-muted-foreground">
              تتبع جميع العمليات والإجراءات في المنصة
              {data?.total ? ` (${data.total} سجل)` : ''}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
          تحديث
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث في السجلات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pe-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={filterAction === "" ? "default" : "outline"}
                size="sm"
                onClick={() => { setFilterAction(""); setPage(1); }}
                className={filterAction === "" ? "bg-[#1E3A5F] text-white" : ""}
              >
                <Filter className="w-3.5 h-3.5 ms-1" />
                الكل
              </Button>
              {Object.entries(ACTION_MAP).map(([key, val]) => {
                const Icon = val.icon;
                return (
                  <Button
                    key={key}
                    variant={filterAction === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setFilterAction(key); setPage(1); }}
                    className={filterAction === key ? "bg-[#1E3A5F] text-white" : ""}
                  >
                    <Icon className="w-3.5 h-3.5 ms-1" />
                    {val.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card className="border-border/50 shadow-lg glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#1E3A5F]" />
            السجلات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا توجد سجلات نشاط</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute right-5 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-1">
                {filteredLogs.map((log: any, idx: number) => {
                  const actionInfo = ACTION_MAP[log.action] || { label: log.action, icon: Activity, color: "bg-muted text-muted-foreground" };
                  const Icon = actionInfo.icon;

                  return (
                    <div
                      key={log.id || idx}
                      className="relative flex gap-4 py-3 pe-0 ps-0 group hover:bg-muted/30 rounded-lg transition-colors"
                    >
                      {/* Timeline dot */}
                      <div className="relative z-10 shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${actionInfo.color} shadow-sm group-hover:scale-110 transition-transform`}>
                          <Icon className="w-4.5 h-4.5" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">
                                {log.username || 'مستخدم'}
                              </span>
                              <Badge variant="secondary" className="text-xs font-normal">
                                {actionInfo.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {log.details}
                            </p>
                            <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground/70">
                              {log.ipAddress && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {log.ipAddress}
                                </span>
                              )}
                              {log.userAgent && (
                                <span className="flex items-center gap-1">
                                  <Monitor className="w-3 h-3" />
                                  {parseUserAgent(log.userAgent)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-start shrink-0">
                            <p className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</p>
                            <p className="text-xs text-muted-foreground/70">{formatTime(log.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Pagination */}
          {data && data.total > 30 && (
            <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-[rgba(197,165,90,0.10)]/50">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="gap-1"
              >
                <ChevronRight className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                السابق
              </Button>
              <span className="text-sm text-muted-foreground">
                صفحة {page} من {Math.ceil(data.total / 30)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(data.total / 30)}
                onClick={() => setPage(p => p + 1)}
                className="gap-1"
              >
                التالي
                <ChevronLeft className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
