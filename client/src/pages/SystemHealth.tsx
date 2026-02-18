import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Server, Database, Activity, Cpu, HardDrive, Clock,
  BarChart3, Shield, AlertTriangle, Key, RefreshCw,
  TrendingUp, Globe, Users, FileText, Bell, Layers
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

export default function SystemHealth() {
  const { playClick, playHover } = useSoundEffects();
  const [scanDays, setScanDays] = useState(30);
  const { data: metrics, isLoading, refetch } = trpc.systemHealth.metrics.useQuery();
  const { data: scanActivity } = trpc.systemHealth.scanActivity.useQuery({ days: scanDays });

  if (isLoading) {
    return (
    <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Server className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">صحة النظام</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6"><div className="h-16 bg-muted rounded" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-6">
        <div className="text-center py-12 text-muted-foreground">
          <Server className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا يمكن الوصول إلى بيانات صحة النظام</p>
        </div>
      </div>
    );
  }

  const { server, database, api, scanning, operations } = metrics;

  // Memory usage percentage
  const memPercent = server.memoryTotal > 0 ? Math.round((server.memoryUsed / server.memoryTotal) * 100) : 0;
  const memStatus = memPercent < 70 ? "success" : memPercent < 90 ? "warning" : "danger";

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">لوحة مراقبة صحة النظام</h1>
            <p className="text-sm text-muted-foreground">مراقبة أداء الخوادم وقاعدة البيانات واستخدام API</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 ms-2" />
          تحديث
        </Button>
      </div>

      {/* Server Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <Card className="border-green-500/30 bg-green-500/5 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">حالة الخادم</p>
                <p className="text-lg font-bold text-green-600">يعمل</p>
                <p className="text-xs text-muted-foreground mt-1">PID: {server.pid}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">وقت التشغيل</p>
                <p className="text-lg font-bold">{server.uptimeFormatted}</p>
                <p className="text-xs text-muted-foreground mt-1">Node {server.nodeVersion}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={memStatus === "danger" ? "border-red-500/30 bg-red-500/5" : memStatus === "warning" ? "border-yellow-500/30 bg-yellow-500/5" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">استخدام الذاكرة</p>
                <p className="text-lg font-bold">{server.memoryUsed} MB / {server.memoryTotal} MB</p>
                <div className="w-full h-2 bg-muted rounded-full mt-2">
                  <div
                    className={`h-full rounded-full ${memStatus === "danger" ? "bg-red-500" : memStatus === "warning" ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${memPercent}%` }}
                  />
                </div>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center btn-glow">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">RSS الذاكرة</p>
                <p className="text-lg font-bold">{server.memoryRss} MB</p>
                <p className="text-xs text-muted-foreground mt-1">{server.platform}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 ms-1" />
            قاعدة البيانات
          </TabsTrigger>
          <TabsTrigger value="scanning">
            <Globe className="h-4 w-4 ms-1" />
            الفحوصات
          </TabsTrigger>
          <TabsTrigger value="api">
            <Key className="h-4 w-4 ms-1" />
            استخدام API
          </TabsTrigger>
          <TabsTrigger value="operations">
            <Shield className="h-4 w-4 ms-1" />
            العمليات
          </TabsTrigger>
        </TabsList>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <Globe className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{database.totalSites}</p>
                <p className="text-xs text-muted-foreground">المواقع</p>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{database.totalScans}</p>
                <p className="text-xs text-muted-foreground">الفحوصات</p>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">{database.totalUsers}</p>
                <p className="text-xs text-muted-foreground">المستخدمون</p>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <FileText className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{database.totalCases}</p>
                <p className="text-xs text-muted-foreground">الحالات</p>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <Layers className="h-6 w-6 mx-auto mb-2 text-blue-800" />
                <p className="text-2xl font-bold">{database.totalLetters}</p>
                <p className="text-xs text-muted-foreground">الخطابات</p>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <Bell className="h-6 w-6 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">{database.totalNotifications}</p>
                <p className="text-xs text-muted-foreground">الإشعارات</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scanning Tab */}
        <TabsContent value="scanning" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            <Card className="border-blue-500/30 glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">{scanning.scansLast24h}</p>
                <p className="text-sm text-muted-foreground">آخر 24 ساعة</p>
              </CardContent>
            </Card>
            <Card className="border-green-500/30 glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">{scanning.scansLast7d}</p>
                <p className="text-sm text-muted-foreground">آخر 7 أيام</p>
              </CardContent>
            </Card>
            <Card className="border-primary/30 glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">{scanning.scansLast30d}</p>
                <p className="text-sm text-muted-foreground">آخر 30 يوم</p>
              </CardContent>
            </Card>
            <Card className="border-orange-500/30 glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">{scanning.activeSchedules}</p>
                <p className="text-sm text-muted-foreground">جدولات نشطة</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card gold-sweep">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="gradient-text text-base">نشاط الفحوصات اليومي</CardTitle>
                <Select value={String(scanDays)} onValueChange={(v) => setScanDays(Number(v))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 أيام</SelectItem>
                    <SelectItem value="14">14 يوم</SelectItem>
                    <SelectItem value="30">30 يوم</SelectItem>
                    <SelectItem value="60">60 يوم</SelectItem>
                    <SelectItem value="90">90 يوم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {scanActivity && scanActivity.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={scanActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" name="الفحوصات" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>لا توجد بيانات فحص في الفترة المحددة</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <Key className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <p className="text-3xl font-bold">{api.totalApiKeys}</p>
                <p className="text-sm text-muted-foreground">إجمالي المفاتيح</p>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-3xl font-bold">{api.activeApiKeys}</p>
                <p className="text-sm text-muted-foreground">مفاتيح نشطة</p>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold">{api.totalApiRequests}</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger-children">
            <Card className={operations.recentEscalations > 0 ? "border-yellow-500/30 bg-yellow-500/5" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-7 w-7 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{operations.recentEscalations}</p>
                    <p className="text-sm text-muted-foreground">تصعيدات (آخر 7 أيام)</p>
                  </div>
                  {operations.recentEscalations > 0 && (
                    <Badge variant="outline" className="me-auto border-yellow-500 text-yellow-600">تحتاج متابعة</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className={operations.openCases > 5 ? "border-red-500/30 bg-red-500/5" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <FileText className="h-7 w-7 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold">{operations.openCases}</p>
                    <p className="text-sm text-muted-foreground">حالات مفتوحة</p>
                  </div>
                  {operations.openCases > 5 && (
                    <Badge variant="outline" className="me-auto border-red-500 text-red-600">حمل عمل مرتفع</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
