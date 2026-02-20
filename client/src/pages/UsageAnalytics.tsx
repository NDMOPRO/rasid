import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Activity, Users, Eye, Search, BarChart3, Clock, TrendingUp, Globe, Loader2, RefreshCw } from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { Button } from "@/components/ui/button";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

const COLORS = ["#273470", "#6459A7", "#3DB1AC", "#F59E0B", "#EF4444", "#22C55E", "#8B5CF6"];
const GRADIENT_COLORS = [
  { start: "#273470", end: "#3DB1AC" },
  { start: "#6459A7", end: "#8B5CF6" },
  { start: "#3DB1AC", end: "#22C55E" },
  { start: "#F59E0B", end: "#EF4444" },
];

export default function UsageAnalytics() {
  const [days, setDays] = useState(30);
  const utils = trpc.useUtils();

  const overview = trpc.platformAnalytics.overview.useQuery({ days });
  const dailyTrends = trpc.platformAnalytics.dailyTrends.useQuery({ days });
  const mostVisited = trpc.platformAnalytics.mostVisitedPages.useQuery({ days, limit: 15 });
  const hourly = trpc.platformAnalytics.hourlyActivity.useQuery({ days: 7 });
  const activeUsers = trpc.platformAnalytics.activeUsersDaily.useQuery({ days });
  const scanRate = trpc.platformAnalytics.dailyScanRate.useQuery({ days });

  const dailyChartData = useMemo(() => {
    if (!dailyTrends.data) return [];
    const grouped: Record<string, any> = {};
    for (const row of dailyTrends.data) {
      if (!grouped[row.date]) grouped[row.date] = { date: row.date };
      grouped[row.date][row.eventType] = row.count;
    }
    return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [dailyTrends.data]);

  const hourlyData = useMemo(() => {
    if (!hourly.data) return [];
    const allHours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: 0 }));
    for (const row of hourly.data) {
      allHours[row.hour].count = row.count;
    }
    return allHours;
  }, [hourly.data]);

  const eventTypePieData = useMemo(() => {
    if (!dailyTrends.data) return [];
    const totals: Record<string, number> = {};
    for (const row of dailyTrends.data) {
      totals[row.eventType] = (totals[row.eventType] || 0) + row.count;
    }
    return Object.entries(totals).map(([name, value]) => ({ name: getEventTypeLabel(name), value }));
  }, [dailyTrends.data]);

  const stats = overview.data;

  const handleRefresh = () => {
    utils.platformAnalytics.overview.invalidate();
    utils.platformAnalytics.dailyTrends.invalidate();
    utils.platformAnalytics.mostVisitedPages.invalidate();
    utils.platformAnalytics.hourlyActivity.invalidate();
    utils.platformAnalytics.activeUsersDaily.invalidate();
    utils.platformAnalytics.dailyScanRate.invalidate();
  };

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-6" dir="rtl">
      <WatermarkLogo />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">تحليلات استخدام المنصة</h1>
            <p className="text-muted-foreground mt-1">إحصائيات شاملة عن نشاط المستخدمين واستخدام المنصة</p>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            تحديث
          </Button>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="14">آخر 14 يوم</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
              <SelectItem value="60">آخر 60 يوم</SelectItem>
              <SelectItem value="90">آخر 90 يوم</SelectItem>
              <SelectItem value="365">آخر سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {[
          { icon: Activity, label: "إجمالي الأحداث", value: stats?.totalEvents || 0, gradient: "from-primary to-[#3DB1AC]", bg: "bg-primary/10" },
          { icon: Users, label: "المستخدمون النشطون", value: stats?.uniqueUsers || 0, gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-500/10" },
          { icon: Eye, label: "مشاهدات الصفحات", value: stats?.pageViews || 0, gradient: "from-emerald-500 to-green-600", bg: "bg-emerald-500/10" },
          { icon: Search, label: "عمليات الفحص", value: stats?.scanEvents || 0, gradient: "from-amber-500 to-orange-600", bg: "bg-amber-500/10" },
          { icon: Globe, label: "عمليات الدخول", value: stats?.loginEvents || 0, gradient: "from-purple-500 to-violet-600", bg: "bg-purple-500/10" },
        ].map((item, idx) => (
          <div key={item.label}>
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
              <CardContent className="p-4 relative">
                <div className="flex items-center justify-between flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{item.value.toLocaleString("ar-SA")}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-md`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-5 w-full max-w-2xl glass-card gold-sweep stagger-children">
          <TabsTrigger value="trends">الاتجاهات اليومية</TabsTrigger>
          <TabsTrigger value="users">المستخدمون</TabsTrigger>
          <TabsTrigger value="pages">الصفحات</TabsTrigger>
          <TabsTrigger value="scans">الفحوصات</TabsTrigger>
          <TabsTrigger value="hourly">النشاط بالساعة</TabsTrigger>
        </TabsList>

        {/* Daily Trends */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 stagger-children">
            <Card className="lg:col-span-2 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  الأحداث اليومية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={dailyChartData}>
                    <defs>
                      <linearGradient id="gradView" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#273470" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#273470" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradScan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3DB1AC" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3DB1AC" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradLogin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6459A7" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6459A7" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ direction: "rtl", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }} />
                    <Legend />
                    <Area type="monotone" dataKey="page_view" name="مشاهدات" stroke="#273470" fill="url(#gradView)" strokeWidth={2} />
                    <Area type="monotone" dataKey="scan" name="فحص" stroke="#3DB1AC" fill="url(#gradScan)" strokeWidth={2} />
                    <Area type="monotone" dataKey="login" name="دخول" stroke="#6459A7" fill="url(#gradLogin)" strokeWidth={2} />
                    <Area type="monotone" dataKey="export" name="تصدير" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="search" name="بحث" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader><CardTitle className="text-lg">توزيع الأحداث</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie data={eventTypePieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" animationBegin={200} animationDuration={1200} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {eventTypePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ direction: "rtl", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Active Users */}
        <TabsContent value="users">
          <div>
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  المستخدمون النشطون يومياً
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={activeUsers.data || []}>
                    <defs>
                      <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#273470" />
                        <stop offset="100%" stopColor="#3DB1AC" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ direction: "rtl", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Line type="monotone" dataKey="activeUsers" name="مستخدمون نشطون" stroke="url(#lineGrad)" strokeWidth={3} dot={{ r: 4, fill: "#273470", stroke: "#fff", strokeWidth: 2 }} activeDot={{ r: 7, fill: "#3DB1AC", stroke: "#fff", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Most Visited Pages */}
        <TabsContent value="pages">
          <div>
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  الصفحات الأكثر زيارة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={mostVisited.data || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis dataKey="page" type="category" width={150} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ direction: "rtl", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Legend />
                    <Bar dataKey="count" name="الزيارات" fill="#273470" radius={[0, 4, 4, 0]} animationDuration={1200} />
                    <Bar dataKey="uniqueUsers" name="مستخدمون فريدون" fill="#3DB1AC" radius={[0, 4, 4, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Scan Rate */}
        <TabsContent value="scans">
          <div>
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  معدل الفحص اليومي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={scanRate.data || []}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3DB1AC" stopOpacity={1} />
                        <stop offset="100%" stopColor="#3DB1AC" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ direction: "rtl", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="scans" name="عمليات الفحص" fill="url(#barGrad)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hourly Activity */}
        <TabsContent value="hourly">
          <div>
            <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  النشاط حسب الساعة (آخر 7 أيام)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={hourlyData}>
                    <defs>
                      <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6459A7" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6459A7" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="hour" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <Tooltip contentStyle={{ direction: "rtl", borderRadius: 12, background: "var(--card)", border: "1px solid var(--border)" }} />
                    <Bar dataKey="count" name="الأحداث" fill="url(#hourGrad)" radius={[6, 6, 0, 0]} animationDuration={1200} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    page_view: "مشاهدات",
    scan: "فحص",
    report: "تقارير",
    login: "دخول",
    export: "تصدير",
    search: "بحث",
    api_call: "API",
  };
  return labels[type] || type;
}
