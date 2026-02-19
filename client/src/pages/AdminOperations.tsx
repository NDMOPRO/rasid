/**
 * Admin Operations — مركز العمليات
 */
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity, Server, Bell, Clock, BarChart3,
  CheckCircle, Zap, Globe,
} from "lucide-react";

type TabId = "health" | "jobs" | "alerts" | "logs" | "performance";

const tabs: { id: TabId; label: string; icon: any }[] = [
  { id: "health", label: "صحة النظام", icon: Activity },
  { id: "jobs", label: "المهام", icon: Clock },
  { id: "alerts", label: "التنبيهات", icon: Bell },
  { id: "logs", label: "السجلات", icon: Server },
  { id: "performance", label: "الأداء", icon: BarChart3 },
];

function HealthTab() {
  const services = [
    { name: "الخادم الرئيسي", status: "online", uptime: "99.9%" },
    { name: "قاعدة البيانات", status: "online", uptime: "99.8%" },
    { name: "محرك الذكاء الاصطناعي", status: "online", uptime: "98.5%" },
    { name: "محرك الرصد", status: "online", uptime: "99.7%" },
    { name: "نظام التنبيهات", status: "online", uptime: "99.9%" },
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><CheckCircle className="h-8 w-8 text-emerald-400 mx-auto mb-2" /><div className="text-2xl font-bold text-emerald-400">5/5</div><div className="text-xs text-gray-400">خدمات نشطة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Zap className="h-8 w-8 text-blue-400 mx-auto mb-2" /><div className="text-2xl font-bold text-blue-400">45ms</div><div className="text-xs text-gray-400">متوسط الاستجابة</div></CardContent></Card>
        <Card className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 text-center"><Globe className="h-8 w-8 text-purple-400 mx-auto mb-2" /><div className="text-2xl font-bold text-purple-400">99.9%</div><div className="text-xs text-gray-400">وقت التشغيل</div></CardContent></Card>
      </div>
      <div className="space-y-2">
        {services.map((s, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50">
            <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-white text-sm">{s.name}</span></div>
            <div className="flex items-center gap-3"><span className="text-gray-400 text-xs">وقت التشغيل: {s.uptime}</span><Badge variant="outline" className="border-emerald-500/50 text-emerald-400">نشط</Badge></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { label: "استخدام المعالج", value: "23%", color: "text-emerald-400" },
        { label: "استخدام الذاكرة", value: "512 MB", color: "text-blue-400" },
        { label: "مساحة التخزين", value: "2.1 GB", color: "text-purple-400" },
        { label: "الاتصالات النشطة", value: "12", color: "text-amber-400" },
      ].map((m, i) => (
        <Card key={i} className="bg-gray-800/50 border-gray-700"><CardContent className="p-4 flex items-center justify-between"><span className="text-gray-400 text-sm">{m.label}</span><span className={`text-xl font-bold ${m.color}`}>{m.value}</span></CardContent></Card>
      ))}
    </div>
  );
}

export default function AdminOperations() {
  const [activeTab, setActiveTab] = useState<TabId>("health");
  return (
    <div className="min-h-screen p-6 space-y-6" dir="rtl">
      <div><h1 className="text-2xl font-bold text-white">مركز العمليات</h1><p className="text-gray-400 text-sm mt-1">مراقبة صحة النظام والمهام والأداء</p></div>
      <div className="flex gap-1 p-1 bg-gray-800/50 rounded-xl border border-gray-700 overflow-x-auto">
        {tabs.map((tab) => { const Icon = tab.icon; return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-400 hover:text-white hover:bg-gray-700/50"}`}><Icon className="h-4 w-4" />{tab.label}</button>
        ); })}
      </div>
      {activeTab === "health" && <HealthTab />}
      {activeTab === "jobs" && <div className="text-center py-12 text-gray-500">لا يوجد مهام نشطة حالياً</div>}
      {activeTab === "alerts" && <div className="text-center py-12 text-gray-500">لا يوجد تنبيهات جديدة</div>}
      {activeTab === "logs" && <div className="text-center py-12 text-gray-500">السجلات فارغة</div>}
      {activeTab === "performance" && <PerformanceTab />}
    </div>
  );
}
