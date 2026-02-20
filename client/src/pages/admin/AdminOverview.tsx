/**
 * Admin Overview — System dashboard showing key metrics
 */
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Shield, Users, Layers, ToggleLeft, ScrollText, Palette, Menu as MenuIcon,
  Loader2, AlertTriangle, CheckCircle, RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import AnimatedCounter from "@/components/AnimatedCounter";

const statCards = [
  { key: "totalRoles", label: "الأدوار", labelEn: "Roles", icon: Shield, color: "from-blue-500/20 to-blue-600/10 border-blue-500/30", textColor: "text-blue-400", link: "/admin/roles" },
  { key: "totalGroups", label: "المجموعات", labelEn: "Groups", icon: Layers, color: "from-purple-500/20 to-purple-600/10 border-purple-500/30", textColor: "text-purple-400", link: "/admin/groups" },
  { key: "totalPermissions", label: "الصلاحيات", labelEn: "Permissions", icon: Shield, color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30", textColor: "text-emerald-400", link: "/admin/roles" },
  { key: "totalUsers", label: "المستخدمين", labelEn: "Users", icon: Users, color: "from-amber-500/20 to-amber-600/10 border-amber-500/30", textColor: "text-amber-400", link: "/user-management" },
  { key: "activeFeatureFlags", label: "ميزات مفعلة", labelEn: "Active Flags", icon: ToggleLeft, color: "from-green-500/20 to-green-600/10 border-green-500/30", textColor: "text-green-400", link: "/admin/feature-flags" },
  { key: "disabledFeatureFlags", label: "ميزات معطلة", labelEn: "Disabled Flags", icon: AlertTriangle, color: "from-red-500/20 to-red-600/10 border-red-500/30", textColor: "text-red-400", link: "/admin/feature-flags" },
] as const;

export default function AdminOverview() {
  const { data: overview, isLoading } = trpc.admin.overview.useQuery();
  const seedMutation = trpc.admin.seed.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        toast.success("تم تهيئة البيانات الافتراضية بنجاح", { description: result.message });
      } else {
        toast.error("فشل في التهيئة", { description: result.message });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="overflow-x-hidden max-w-full space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم الإدارية</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة شاملة للأدوار والصلاحيات والميزات والمظهر</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="gap-2"
        >
          {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          تهيئة البيانات الافتراضية
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={card.link}>
              <Card className={`cursor-pointer border bg-gradient-to-br ${card.color} hover:scale-[1.02] transition-transform`}>
                <CardContent className="p-4 text-center">
                  <card.icon className={`w-8 h-8 mx-auto mb-2 ${card.textColor}`} />
                  <div className={`text-2xl font-bold ${card.textColor}`}>
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                    ) : (
                      <AnimatedCounter value={overview?.[card.key] ?? 0} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "إدارة الأدوار والصلاحيات", titleEn: "Roles & Permissions", desc: "إنشاء وتعديل الأدوار وتعيين الصلاحيات لكل دور", icon: Shield, link: "/admin/roles", color: "text-blue-400" },
          { title: "إدارة المجموعات", titleEn: "Groups", desc: "إنشاء مجموعات وإضافة أعضاء وتعيين صلاحيات جماعية", icon: Layers, link: "/admin/groups", color: "text-purple-400" },
          { title: "مفاتيح الميزات", titleEn: "Feature Flags", desc: "تفعيل/تعطيل الميزات والصفحات بدون تعديل الكود", icon: ToggleLeft, link: "/admin/feature-flags", color: "text-green-400" },
          { title: "سجل تدقيق الإدارة", titleEn: "Admin Audit Log", desc: "تتبع جميع التغييرات الإدارية مع إمكانية التراجع", icon: ScrollText, link: "/admin/audit-log", color: "text-amber-400" },
          { title: "إعدادات المظهر", titleEn: "Theme Settings", desc: "تخصيص الألوان والخطوط والتخطيط والظلال", icon: Palette, link: "/admin/theme", color: "text-pink-400" },
          { title: "إدارة القوائم", titleEn: "Menu Management", desc: "تخصيص قوائم التنقل والشريط الجانبي", icon: MenuIcon, link: "/admin/menus", color: "text-cyan-400" },
        ].map((action, i) => (
          <motion.div
            key={action.link}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Link href={action.link}>
              <Card className="cursor-pointer border border-border/50 hover:border-primary/30 bg-card/50 hover:bg-card/80 transition-all group">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-muted/50 group-hover:bg-muted transition-colors ${action.color}`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{action.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* System Status */}
      <Card className="border border-border/50 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            حالة النظام
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">محرك الصلاحيات</span>
              <span className="text-green-400 mr-auto">نشط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">Feature Flags</span>
              <span className="text-green-400 mr-auto">نشط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">سجل التدقيق</span>
              <span className="text-green-400 mr-auto">نشط</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-muted-foreground">RBAC Engine</span>
              <span className="text-green-400 mr-auto">نشط</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
