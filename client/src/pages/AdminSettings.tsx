/**
 * AdminSettings — إعدادات الإدارة المتقدمة
 * مربوط بـ adminSettings.* + admin.* + operations.* APIs
 */
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Settings, Palette, Globe, Shield, Bell, Database, Clock,
  Users, RefreshCw, Download, Upload, Trash2, CheckCircle,
  AlertTriangle, Server, Key, HardDrive, Layers, Zap, Eye, Save,
} from "lucide-react";

type TabId = "identity" | "api_keys" | "roles" | "seeding" | "db_stats" | "theme";
const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "identity", label: "الهوية البصرية", icon: Palette },
  { id: "api_keys", label: "مفاتيح API", icon: Key },
  { id: "roles", label: "الأدوار", icon: Shield },
  { id: "seeding", label: "بذر البيانات", icon: Database },
  { id: "db_stats", label: "قاعدة البيانات", icon: Server },
  { id: "theme", label: "الثيم", icon: Eye },
];

function IdentityTab() {
  const { data: assets, isLoading } = trpc.adminSettings.getAssets.useQuery();
  if (isLoading) return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 bg-gray-800" />)}</div>;
  const assetList = Array.isArray(assets) ? assets : [];
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">أصول الهوية البصرية ({assetList.length})</h3>
      {assetList.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-8 text-center text-gray-400">لا توجد أصول مسجلة بعد</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assetList.map((a: any, i: number) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Palette className="h-5 w-5 text-purple-400" />
                  <span className="text-white font-medium">{a.name || a.key || `أصل ${i + 1}`}</span>
                </div>
                {a.url && <img src={a.url} alt={a.name} className="h-16 object-contain rounded bg-gray-900 p-2" />}
                <p className="text-gray-400 text-xs mt-2">{a.type || "صورة"} • {a.updatedAt ? new Date(a.updatedAt).toLocaleString("ar-SA") : ""}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ApiKeysTab() {
  const { data: providers, isLoading } = trpc.adminSettings.getProviders.useQuery();
  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-gray-800" />)}</div>;
  const providerList = Array.isArray(providers) ? providers : [];
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">مزودي الخدمات ({providerList.length})</h3>
      {providerList.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-8 text-center text-gray-400">لا توجد مزودي خدمات مسجلين</CardContent></Card>
      ) : providerList.map((p: any, i: number) => (
        <Card key={i} className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-amber-400" />
              <div>
                <p className="text-white text-sm font-medium">{p.name || p.provider || `مزود ${i + 1}`}</p>
                <p className="text-gray-500 text-xs">{p.type || "API"} • مفتاح: {p.maskedKey || "••••••••"}</p>
              </div>
            </div>
            <Badge className={p.isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}>
              {p.isActive ? "نشط" : "معطل"}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RolesTab() {
  const { data: roles, isLoading } = trpc.admin.roles.list.useQuery();
  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-gray-800" />)}</div>;
  const roleList = Array.isArray(roles) ? roles : [];
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">الأدوار والصلاحيات ({roleList.length})</h3>
      {roleList.length === 0 ? (
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-8 text-center text-gray-400">لا توجد أدوار مسجلة</CardContent></Card>
      ) : roleList.map((r: any, i: number) => (
        <Card key={i} className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <Shield className={`h-5 w-5 ${r.isSystem ? "text-amber-400" : "text-blue-400"}`} />
              <div>
                <p className="text-white text-sm font-medium">{r.nameAr || r.name || `دور ${i + 1}`}</p>
                <p className="text-gray-500 text-xs">{r.description || r.descriptionAr || ""} • {r.permissionCount || 0} صلاحية</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {r.isSystem && <Badge className="bg-amber-500/20 text-amber-400">نظامي</Badge>}
              <Badge className="bg-blue-500/20 text-blue-400">{r.userCount || 0} مستخدم</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SeedingTab() {
  const { data: dbStats } = trpc.operations.getDbStats.useQuery();
  const deleteLeaks = trpc.operations.deleteAllLeaks.useMutation({
    onSuccess: () => toast.success("تم حذف جميع التسريبات"),
    onError: () => toast.error("فشل حذف التسريبات"),
  });
  const deleteTest = trpc.operations.deleteTestData.useMutation({
    onSuccess: () => toast.success("تم حذف بيانات الاختبار"),
    onError: () => toast.error("فشل حذف بيانات الاختبار"),
  });
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">إدارة البيانات</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3"><Database className="h-5 w-5 text-blue-400" /><span className="text-white font-medium">حالة البيانات</span></div>
            {dbStats ? (
              <div className="space-y-2 text-sm">
                {Object.entries(dbStats as Record<string, any>).filter(([, v]) => typeof v === "number").slice(0, 6).map(([key, val], i) => (
                  <div key={i} className="flex justify-between"><span className="text-gray-400">{key}</span><span className="text-white font-bold">{(val as number).toLocaleString("ar-SA")}</span></div>
                ))}
              </div>
            ) : <p className="text-gray-400 text-sm">جاري التحميل...</p>}
          </CardContent>
        </Card>
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-3"><Trash2 className="h-5 w-5 text-red-400" /><span className="text-white font-medium">عمليات الحذف</span></div>
            <Button variant="destructive" size="sm" className="w-full" onClick={() => deleteLeaks.mutate()} disabled={deleteLeaks.isPending}>
              <Trash2 className="h-4 w-4 ml-2" />{deleteLeaks.isPending ? "جاري الحذف..." : "حذف جميع التسريبات"}
            </Button>
            <Button variant="outline" size="sm" className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={() => deleteTest.mutate()} disabled={deleteTest.isPending}>
              <Trash2 className="h-4 w-4 ml-2" />{deleteTest.isPending ? "جاري الحذف..." : "حذف بيانات الاختبار"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DbStatsTab() {
  const { data: dbStats, isLoading } = trpc.operations.getDbStats.useQuery();
  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20 bg-gray-800" />)}</div>;
  if (!dbStats) return <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-8 text-center text-gray-400">لا توجد بيانات</CardContent></Card>;
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">إحصائيات قاعدة البيانات</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(dbStats as Record<string, any>).map(([key, val], i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4 text-center">
              <p className="text-gray-400 text-xs mb-1">{key}</p>
              <p className="text-white font-bold text-xl">{typeof val === "number" ? val.toLocaleString("ar-SA") : String(val)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ThemeTab() {
  const { data: theme, isLoading } = trpc.admin.theme.get.useQuery();
  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 bg-gray-800" />)}</div>;
  return (
    <div className="space-y-4">
      <h3 className="text-white font-medium">إعدادات الثيم</h3>
      {theme ? (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4 space-y-3">
            {Object.entries(theme as Record<string, any>).filter(([k]) => !k.startsWith("id") && !k.startsWith("created")).map(([key, val], i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded bg-gray-900/30">
                <span className="text-gray-400 text-sm">{key}</span>
                <span className="text-white text-sm font-medium">{typeof val === "boolean" ? (val ? "مفعّل" : "معطّل") : String(val || "---")}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-8 text-center text-gray-400">لا توجد إعدادات ثيم</CardContent></Card>}
    </div>
  );
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabId>("identity");
  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">إعدادات الإدارة</h1><p className="text-gray-400 text-sm mt-1">الهوية البصرية والأدوار ومفاتيح API وقاعدة البيانات</p></div>
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl border border-gray-700 overflow-x-auto">
        {tabs.map((tab) => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}><Icon className="h-4 w-4" />{tab.label}</button>
        ); })}
      </div>
      {activeTab === "identity" && <IdentityTab />}
      {activeTab === "api_keys" && <ApiKeysTab />}
      {activeTab === "roles" && <RolesTab />}
      {activeTab === "seeding" && <SeedingTab />}
      {activeTab === "db_stats" && <DbStatsTab />}
      {activeTab === "theme" && <ThemeTab />}
    </div>
  );
}
