/**
 * Admin Theme Settings — Customize platform appearance
 */
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Palette, Save, Loader2, RotateCcw, Sun, Moon, Type, Layout, Eye,
} from "lucide-react";
import { toast } from "sonner";

interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  fontSizeBase: number;
  borderRadius: number;
  sidebarWidth: number;
  headerHeight: number;
  enableAnimations: boolean;
  enableGlassmorphism: boolean;
  enableParticles: boolean;
  logoUrl: string;
  logoUrlLight: string;
  faviconUrl: string;
}

const DEFAULT_THEME: ThemeConfig = {
  primaryColor: "#273470",
  secondaryColor: "#6459A7",
  accentColor: "#3DB1AC",
  backgroundColor: "#0A192F",
  surfaceColor: "#112240",
  textColor: "#E2E8F0",
  fontFamily: "Tajawal",
  fontSizeBase: 16,
  borderRadius: 12,
  sidebarWidth: 280,
  headerHeight: 64,
  enableAnimations: true,
  enableGlassmorphism: true,
  enableParticles: true,
  logoUrl: "",
  logoUrlLight: "",
  faviconUrl: "",
};

const FONT_OPTIONS = [
  { value: "Tajawal", label: "Tajawal" },
  { value: "Cairo", label: "Cairo" },
  { value: "IBM Plex Sans Arabic", label: "IBM Plex Sans Arabic" },
  { value: "Noto Sans Arabic", label: "Noto Sans Arabic" },
  { value: "DIN Next Arabic", label: "DIN Next Arabic" },
];

export default function AdminTheme() {
  const utils = trpc.useUtils();
  const { data: themeSettings, isLoading } = trpc.admin.theme.getAll.useQuery();
  const [config, setConfig] = useState<ThemeConfig>(DEFAULT_THEME);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (themeSettings) {
      const settings: Record<string, any> = {};
      themeSettings.forEach((s: any) => {
        settings[s.settingKey] = s.settingValue;
      });
      setConfig({
        primaryColor: settings.primaryColor ?? DEFAULT_THEME.primaryColor,
        secondaryColor: settings.secondaryColor ?? DEFAULT_THEME.secondaryColor,
        accentColor: settings.accentColor ?? DEFAULT_THEME.accentColor,
        backgroundColor: settings.backgroundColor ?? DEFAULT_THEME.backgroundColor,
        surfaceColor: settings.surfaceColor ?? DEFAULT_THEME.surfaceColor,
        textColor: settings.textColor ?? DEFAULT_THEME.textColor,
        fontFamily: settings.fontFamily ?? DEFAULT_THEME.fontFamily,
        fontSizeBase: Number(settings.fontSizeBase ?? DEFAULT_THEME.fontSizeBase),
        borderRadius: Number(settings.borderRadius ?? DEFAULT_THEME.borderRadius),
        sidebarWidth: Number(settings.sidebarWidth ?? DEFAULT_THEME.sidebarWidth),
        headerHeight: Number(settings.headerHeight ?? DEFAULT_THEME.headerHeight),
        enableAnimations: settings.enableAnimations === "true" || settings.enableAnimations === true || settings.enableAnimations === undefined,
        enableGlassmorphism: settings.enableGlassmorphism === "true" || settings.enableGlassmorphism === true || settings.enableGlassmorphism === undefined,
        enableParticles: settings.enableParticles === "true" || settings.enableParticles === true || settings.enableParticles === undefined,
        logoUrl: settings.logoUrl ?? "",
        logoUrlLight: settings.logoUrlLight ?? "",
        faviconUrl: settings.faviconUrl ?? "",
      });
    }
  }, [themeSettings]);

  const saveMutation = trpc.admin.theme.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ إعدادات المظهر بنجاح");
      setHasChanges(false);
      utils.admin.theme.getAll.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleChange = (key: keyof ThemeConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const entries = Object.entries(config);
    for (const [key, value] of entries) {
      const category = key.includes("Color") || key.includes("color") ? "colors" as const
        : key.includes("font") || key.includes("Font") ? "typography" as const
        : key.includes("enable") ? "animations" as const
        : key.includes("logo") || key.includes("favicon") ? "layout" as const
        : "layout" as const;
      await saveMutation.mutateAsync({ id: `theme-${key}`, category, key, value: String(value) });
    }
  };

  const handleReset = () => {
    setConfig(DEFAULT_THEME);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Palette className="w-6 h-6 text-pink-400" />
            إعدادات المظهر
          </h1>
          <p className="text-muted-foreground text-sm mt-1">تخصيص ألوان وخطوط وتخطيط المنصة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> استعادة الافتراضي
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending || !hasChanges} className="gap-2">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Colors */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-400" /> الألوان
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "primaryColor" as const, label: "اللون الأساسي", labelEn: "Primary" },
                { key: "secondaryColor" as const, label: "اللون الثانوي", labelEn: "Secondary" },
                { key: "accentColor" as const, label: "لون التمييز", labelEn: "Accent" },
                { key: "backgroundColor" as const, label: "لون الخلفية", labelEn: "Background" },
                { key: "surfaceColor" as const, label: "لون السطح", labelEn: "Surface" },
                { key: "textColor" as const, label: "لون النص", labelEn: "Text" },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={config[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.labelEn}</p>
                  </div>
                  <Input
                    value={config[item.key]}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="w-28 font-mono text-xs"
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Typography */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Type className="w-4 h-4 text-blue-400" /> الخطوط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">نوع الخط</label>
                <Select value={config.fontFamily} onValueChange={(v) => handleChange("fontFamily", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">حجم الخط الأساسي (px)</label>
                <Input type="number" value={config.fontSizeBase} onChange={(e) => handleChange("fontSizeBase", Number(e.target.value))} min={12} max={24} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">نصف قطر الحواف (px)</label>
                <Input type="number" value={config.borderRadius} onChange={(e) => handleChange("borderRadius", Number(e.target.value))} min={0} max={24} />
              </div>
            </CardContent>
          </Card>

          {/* Layout */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Layout className="w-4 h-4 text-green-400" /> التخطيط
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">عرض الشريط الجانبي (px)</label>
                <Input type="number" value={config.sidebarWidth} onChange={(e) => handleChange("sidebarWidth", Number(e.target.value))} min={200} max={400} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">ارتفاع الرأس (px)</label>
                <Input type="number" value={config.headerHeight} onChange={(e) => handleChange("headerHeight", Number(e.target.value))} min={48} max={96} />
              </div>
            </CardContent>
          </Card>

          {/* Effects */}
          <Card className="border border-border/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-400" /> التأثيرات
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: "enableAnimations" as const, label: "الحركات والانتقالات", desc: "تفعيل الحركات والانتقالات في الواجهة" },
                { key: "enableGlassmorphism" as const, label: "تأثير الزجاج", desc: "تفعيل تأثير الشفافية الزجاجية" },
                { key: "enableParticles" as const, label: "تأثير الجسيمات", desc: "تفعيل خلفية الجسيمات المتحركة" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch checked={config[item.key]} onCheckedChange={(v) => handleChange(item.key, v)} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Branding */}
          <Card className="border border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" /> العلامة التجارية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">رابط الشعار (الوضع الداكن)</label>
                  <Input value={config.logoUrl} onChange={(e) => handleChange("logoUrl", e.target.value)} placeholder="https://..." dir="ltr" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">رابط الشعار (الوضع الفاتح)</label>
                  <Input value={config.logoUrlLight} onChange={(e) => handleChange("logoUrlLight", e.target.value)} placeholder="https://..." dir="ltr" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">رابط الأيقونة (Favicon)</label>
                  <Input value={config.faviconUrl} onChange={(e) => handleChange("faviconUrl", e.target.value)} placeholder="https://..." dir="ltr" />
                </div>
              </div>
              {/* Preview */}
              <div className="flex gap-4 mt-2">
                {config.logoUrl && (
                  <div className="p-3 rounded-lg bg-gray-900 border border-border/30">
                    <img src={config.logoUrl} alt="Logo Dark" className="h-10 object-contain" />
                  </div>
                )}
                {config.logoUrlLight && (
                  <div className="p-3 rounded-lg bg-gray-100 border border-border/30">
                    <img src={config.logoUrlLight} alt="Logo Light" className="h-10 object-contain" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card className="border border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" /> معاينة حية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-xl overflow-hidden border border-border/30"
                style={{
                  backgroundColor: config.backgroundColor,
                  fontFamily: config.fontFamily,
                  fontSize: config.fontSizeBase,
                  borderRadius: config.borderRadius,
                }}
              >
                {/* Mini header */}
                <div className="flex items-center justify-between p-3 border-b" style={{ backgroundColor: config.surfaceColor, height: config.headerHeight * 0.6 }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: config.primaryColor }} />
                    <span style={{ color: config.textColor, fontSize: 12 }}>منصة راصد</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: config.accentColor }} />
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: config.secondaryColor }} />
                  </div>
                </div>
                {/* Mini content */}
                <div className="p-4 flex gap-3">
                  <div className="w-16 rounded-lg p-2" style={{ backgroundColor: config.surfaceColor }}>
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-2 rounded mb-2" style={{ backgroundColor: config.primaryColor + "40" }} />
                    ))}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: config.primaryColor }} />
                    <div className="h-2 rounded w-3/4" style={{ backgroundColor: config.textColor + "30" }} />
                    <div className="flex gap-2 mt-3">
                      <div className="px-3 py-1 rounded text-xs" style={{ backgroundColor: config.accentColor, color: "#fff" }}>زر رئيسي</div>
                      <div className="px-3 py-1 rounded text-xs border" style={{ borderColor: config.secondaryColor, color: config.secondaryColor }}>زر ثانوي</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
