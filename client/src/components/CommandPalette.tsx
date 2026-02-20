import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search, BarChart3, Shield, FileText, Globe, Users, Settings,
  Brain, AlertTriangle, Database, Eye, TrendingUp, Layers, MapPin,
  Activity, BookOpen, Zap, Network, Terminal, MessageSquare,
} from "lucide-react";

interface CommandAction {
  id: string;
  label: string;
  labelEn?: string;
  icon: React.ElementType;
  group: string;
  action: () => void;
  keywords?: string[];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  const actions: CommandAction[] = [
    // Navigation
    { id: "home", label: "لوحة المعلومات الرئيسية", icon: BarChart3, group: "التنقل", action: () => go("/"), keywords: ["dashboard", "رئيسية"] },
    { id: "leaks", label: "حالات الرصد", icon: AlertTriangle, group: "التنقل", action: () => go("/leaks"), keywords: ["leaks", "رصد", "تسريب"] },
    { id: "sites", label: "المواقع المراقبة", icon: Globe, group: "التنقل", action: () => go("/sites"), keywords: ["sites", "مواقع"] },
    { id: "reports", label: "التقارير", icon: FileText, group: "التنقل", action: () => go("/reports"), keywords: ["reports", "تقارير"] },
    { id: "scan", label: "الفحص", icon: Search, group: "التنقل", action: () => go("/scan"), keywords: ["scan", "فحص"] },
    { id: "members", label: "الأعضاء", icon: Users, group: "التنقل", action: () => go("/members"), keywords: ["members", "أعضاء", "فريق"] },
    { id: "cases", label: "القضايا", icon: Shield, group: "التنقل", action: () => go("/cases"), keywords: ["cases", "قضايا"] },
    { id: "settings", label: "الإعدادات", icon: Settings, group: "التنقل", action: () => go("/settings"), keywords: ["settings", "إعدادات"] },
    { id: "darkweb", label: "مراقبة الويب المظلم", icon: Eye, group: "التنقل", action: () => go("/dark-web"), keywords: ["dark web", "ويب مظلم"] },
    { id: "threats", label: "خريطة التهديدات", icon: MapPin, group: "التنقل", action: () => go("/threat-map"), keywords: ["threats", "تهديدات"] },
    { id: "analytics", label: "التحليلات المتقدمة", icon: TrendingUp, group: "التنقل", action: () => go("/advanced-analytics"), keywords: ["analytics", "تحليلات"] },
    { id: "knowledge", label: "قاعدة المعرفة", icon: BookOpen, group: "التنقل", action: () => go("/knowledge-base"), keywords: ["knowledge", "معرفة"] },
    { id: "evidence", label: "سلسلة الأدلة", icon: Layers, group: "التنقل", action: () => go("/evidence-chain"), keywords: ["evidence", "أدلة"] },
    { id: "activity", label: "سجل النشاط", icon: Activity, group: "التنقل", action: () => go("/activity-logs"), keywords: ["activity", "نشاط", "سجل"] },
    { id: "health", label: "صحة النظام", icon: Terminal, group: "التنقل", action: () => go("/system-health"), keywords: ["health", "صحة", "نظام"] },
    // AI Actions
    { id: "smart-rasid", label: "راصد الذكي", icon: Brain, group: "الذكاء الاصطناعي", action: () => go("/smart-rasid"), keywords: ["ai", "ذكاء", "راصد"] },
    { id: "training", label: "مركز التدريب", icon: Zap, group: "الذكاء الاصطناعي", action: () => go("/training-center"), keywords: ["training", "تدريب"] },
    { id: "scenarios", label: "إدارة السيناريوهات", icon: Network, group: "الذكاء الاصطناعي", action: () => go("/scenario-management"), keywords: ["scenarios", "سيناريوهات"] },
    { id: "bulk", label: "التحليل الجماعي", icon: Database, group: "الذكاء الاصطناعي", action: () => go("/bulk-analysis"), keywords: ["bulk", "جماعي"] },
    // Quick Actions
    { id: "new-scan", label: "بدء فحص جديد", icon: Search, group: "إجراءات سريعة", action: () => go("/scan-execution"), keywords: ["new scan", "فحص جديد"] },
    { id: "new-report", label: "إنشاء تقرير", icon: FileText, group: "إجراءات سريعة", action: () => go("/custom-reports"), keywords: ["new report", "تقرير جديد"] },
    { id: "chat-ai", label: "محادثة مع راصد الذكي", icon: MessageSquare, group: "إجراءات سريعة", action: () => go("/smart-rasid"), keywords: ["chat", "محادثة"] },
  ];

  const grouped = actions.reduce((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group].push(action);
    return acc;
  }, {} as Record<string, CommandAction[]>);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="ابحث عن صفحة أو إجراء... (Ctrl+K)" dir="rtl" />
      <CommandList>
        <CommandEmpty>لا توجد نتائج مطابقة.</CommandEmpty>
        {Object.entries(grouped).map(([group, items], idx) => (
          <div key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={`${item.label} ${item.labelEn || ""} ${(item.keywords || []).join(" ")}`}
                  onSelect={item.action}
                  className="flex items-center gap-3 rtl:flex-row-reverse"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
