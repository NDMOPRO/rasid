/**
 * Admin Menu Management — Manage navigation menus and items
 */
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Menu as MenuIcon, Plus, Edit, Trash2, Loader2, GripVertical, Eye, EyeOff,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown, Link2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminMenus() {
  const utils = trpc.useUtils();
  const { data: menus, isLoading } = trpc.admin.menus.list.useQuery();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [newMenu, setNewMenu] = useState({
    name: "", nameEn: "", location: "sidebar" as "sidebar" | "top_nav" | "footer" | "contextual" | "mobile",
  });

  const { data: menuDetail } = trpc.admin.menus.getById.useQuery(
    { id: selectedMenuId! },
    { enabled: !!selectedMenuId }
  );

  const createMutation = trpc.admin.menus.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء القائمة بنجاح");
      setShowCreateDialog(false);
      setNewMenu({ name: "", nameEn: "", location: "sidebar" });
      utils.admin.menus.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = trpc.admin.menus.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف القائمة");
      setSelectedMenuId(null);
      utils.admin.menus.list.invalidate();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const MENU_TYPE_LABELS: Record<string, string> = {
    sidebar: "شريط جانبي",
    header: "رأس الصفحة",
    footer: "تذييل الصفحة",
    context: "قائمة سياقية",
    mobile: "قائمة الجوال",
  };

  return (
    <div className="space-y-6 p-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-cyan-400" />
            إدارة القوائم
          </h1>
          <p className="text-muted-foreground text-sm mt-1">تخصيص قوائم التنقل والشريط الجانبي</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> إنشاء قائمة</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إنشاء قائمة جديدة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالعربية</label>
                <Input value={newMenu.name} onChange={(e) => setNewMenu({ ...newMenu, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الاسم بالإنجليزية</label>
                <Input value={newMenu.nameEn} onChange={(e) => setNewMenu({ ...newMenu, nameEn: e.target.value })} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الموقع</label>
                <Select value={newMenu.location} onValueChange={(v) => setNewMenu({ ...newMenu, location: v as typeof newMenu.location })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sidebar">شريط جانبي</SelectItem>
                    <SelectItem value="top_nav">رأس الصفحة</SelectItem>
                    <SelectItem value="footer">تذييل الصفحة</SelectItem>
                    <SelectItem value="contextual">قائمة سياقية</SelectItem>
                    <SelectItem value="mobile">قائمة الجوال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>إلغاء</Button>
              <Button onClick={() => createMutation.mutate(newMenu)} disabled={createMutation.isPending || !newMenu.name}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنشاء"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menus List */}
        <div className="lg:col-span-1 space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !menus || menus.length === 0 ? (
            <Card className="border border-dashed border-border/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                <MenuIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>لا توجد قوائم مخصصة</p>
                <p className="text-xs mt-1">القوائم الافتراضية تُدار من الكود</p>
              </CardContent>
            </Card>
          ) : (
            menus.map((menu: any, i: number) => (
              <motion.div key={menu.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <Card
                  className={`border cursor-pointer transition-all ${selectedMenuId === menu.id ? "border-primary/50 bg-primary/5" : "border-border/50 hover:border-border"}`}
                  onClick={() => setSelectedMenuId(menu.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{menu.name}</h3>
                          {!menu.isActive && <Badge variant="secondary" className="text-[10px]">معطل</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{MENU_TYPE_LABELS[menu.location] ?? menu.location}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={(e) => { e.stopPropagation(); deleteMutation.mutate({ id: menu.id }); }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Menu Detail / Items */}
        <div className="lg:col-span-2">
          {selectedMenuId && menuDetail ? (
            <Card className="border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MenuIcon className="w-5 h-5 text-cyan-400" />
                    {(menuDetail as any).name}
                  </span>
                  <Badge variant={(menuDetail as any).isActive ? "default" : "secondary"}>
                    {(menuDetail as any).isActive ? "نشط" : "معطل"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p>النوع: {MENU_TYPE_LABELS[(menuDetail as any).menuType] ?? (menuDetail as any).menuType}</p>
                  {(menuDetail as any).workspace && <p>مساحة العمل: {(menuDetail as any).workspace}</p>}
                  {(menuDetail as any).description && <p>الوصف: {(menuDetail as any).description}</p>}
                </div>

                <div className="border-t border-border/30 pt-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Link2 className="w-4 h-4" /> عناصر القائمة
                  </h3>
                  {(menuDetail as any).items && (menuDetail as any).items.length > 0 ? (
                    <div className="space-y-2">
                      {(menuDetail as any).items.map((item: any) => (
                        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                          <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.path ?? item.url ?? ""}</p>
                          </div>
                          {item.isVisible ? (
                            <Eye className="w-4 h-4 text-green-400" />
                          ) : (
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">لا توجد عناصر في هذه القائمة</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border border-dashed border-border/50">
              <CardContent className="p-12 text-center text-muted-foreground">
                <MenuIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">اختر قائمة لعرض التفاصيل</p>
                <p className="text-xs mt-2">أو أنشئ قائمة جديدة لتخصيص التنقل</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
