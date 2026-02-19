import { Badge } from "@/components/ui/badge";
import { Settings, Palette, Globe, Shield, Bell, Database } from "lucide-react";

const settingsSections = [
  { icon: Palette, label: "الهوية البصرية", description: "اسم المنصة، الشعار، الألوان، النصوص العامة" },
  { icon: Globe, label: "القوائم والصفحات", description: "إدارة القوائم، ترتيب الصفحات، إظهار/إخفاء" },
  { icon: Shield, label: "الأدوار والصلاحيات", description: "إدارة الأدوار، تعيين الصلاحيات، سياسات الواجهة" },
  { icon: Bell, label: "الإشعارات", description: "إعدادات الإشعارات، قنوات التنبيه" },
  { icon: Database, label: "النسخ الاحتياطية", description: "جدولة النسخ، سجل النسخ، الاستعادة" },
];

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-gold" />
          <h1 className="text-2xl font-bold">الإعدادات</h1>
        </div>
        <Badge variant="outline" className="text-gold border-gold/30">لوحة الإدارة</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {settingsSections.map((section) => (
          <div key={section.label} className="glass-card p-6 cursor-pointer hover:border-gold/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gold/10">
                <section.icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">{section.label}</h3>
                <p className="text-sm text-muted-foreground">{section.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
