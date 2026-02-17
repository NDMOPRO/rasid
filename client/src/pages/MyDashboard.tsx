import { Badge } from "@/components/ui/badge";
import { BarChart3, Layers, Info } from "lucide-react";

export default function MyDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">لوحتي</h1>
        <Badge variant="outline" className="text-gold border-gold/30">مساحة مخصصة</Badge>
      </div>

      <div className="glass-card p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="p-4 rounded-full bg-gold/10 mb-6">
          <BarChart3 className="h-12 w-12 text-gold" />
        </div>
        <h2 className="text-xl font-semibold mb-3">لوحة المؤشرات المخصصة</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          هذه المساحة مخصصة لك. يمكنك سحب وإفلات الأعمدة والمؤشرات من الكتالوج لبناء لوحة مؤشرات خاصة بك.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>ميزة السحب والإفلات قيد التطوير</span>
        </div>
      </div>
    </div>
  );
}
