import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Key, Plus, Copy, Trash2, Ban, Clock, Activity, BookOpen, ExternalLink } from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

export default function ApiKeys() {
  const { playClick, playHover } = useSoundEffects();

  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [keyShown, setKeyShown] = useState(false);

  const { data, isLoading, refetch } = trpc.apiKeys.list.useQuery();
  const createMutation = trpc.apiKeys.create.useMutation({
    onSuccess: (result) => {
      setGeneratedKey(result.key);
      setKeyShown(true);
      refetch();
      toast.success("تم إنشاء المفتاح بنجاح - انسخه الآن");
    },
  });
  const revokeMutation = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("تم إلغاء المفتاح");
    },
  });
  const deleteMutation = trpc.apiKeys.delete.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("تم حذف المفتاح");
    },
  });

  const keys = data?.keys || [];

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    createMutation.mutate({ name: newKeyName.trim() });
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("تم النسخ");
  };

  return (
    <div
      className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Key className="h-6 w-6" /> مفاتيح API</h1>
          <p className="text-muted-foreground mt-1">إدارة مفاتيح الوصول للواجهة البرمجية الخارجية</p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) { setKeyShown(false); setGeneratedKey(""); setNewKeyName(""); } }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 ms-2" /> إنشاء مفتاح جديد</Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>{keyShown ? "المفتاح الجديد" : "إنشاء مفتاح API"}</DialogTitle>
              <DialogDescription>{keyShown ? "انسخ المفتاح الآن - لن يظهر مرة أخرى" : "أدخل اسماً وصفياً للمفتاح"}</DialogDescription>
            </DialogHeader>
            {keyShown ? (
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-lg font-mono text-sm break-all">{generatedKey}</div>
                <Button onClick={() => copyKey(generatedKey)} className="w-full"><Copy className="h-4 w-4 ms-2" /> نسخ المفتاح</Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>اسم المفتاح</Label>
                  <Input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} placeholder="مثال: تكامل نظام الموارد البشرية" />
                </div>
                <DialogFooter>
                  <Button onClick={handleCreate} disabled={!newKeyName.trim() || createMutation.isPending}>
                    {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* API Documentation Card */}
      <Card className="border-blue-200 bg-blue-950/20 border-blue-800 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-600" /> توثيق الواجهة البرمجية</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>يمكنك الوصول إلى بيانات منصة راصد برمجياً عبر REST API. الرابط الأساسي:</p>
          <code className="bg-muted px-2 py-1 rounded text-xs block">{window.location.origin}/api/v1</code>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3 stagger-children">
            <div className="bg-background rounded p-2 border">
              <code className="text-xs text-blue-600">GET /api/v1/sites</code>
              <p className="text-xs text-muted-foreground mt-1">قائمة المواقع المسجلة</p>
            </div>
            <div className="bg-background rounded p-2 border">
              <code className="text-xs text-blue-600">GET /api/v1/sites/:id</code>
              <p className="text-xs text-muted-foreground mt-1">تفاصيل موقع محدد</p>
            </div>
            <div className="bg-background rounded p-2 border">
              <code className="text-xs text-blue-600">GET /api/v1/scans</code>
              <p className="text-xs text-muted-foreground mt-1">قائمة الفحوصات</p>
            </div>
            <div className="bg-background rounded p-2 border">
              <code className="text-xs text-blue-600">GET /api/v1/compliance/status</code>
              <p className="text-xs text-muted-foreground mt-1">حالة الامتثال العامة</p>
            </div>
            <div className="bg-background rounded p-2 border">
              <code className="text-xs text-blue-600">GET /api/v1/stats</code>
              <p className="text-xs text-muted-foreground mt-1">إحصائيات شاملة</p>
            </div>
            <div className="bg-background rounded p-2 border">
              <code className="text-xs text-blue-600">GET /api/v1/docs</code>
              <p className="text-xs text-muted-foreground mt-1">توثيق الواجهة البرمجية</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">أضف المفتاح في رأس الطلب: <code>Authorization: Bearer rsk_...</code></p>
        </CardContent>
      </Card>

      {/* Keys List */}
      <Card className="glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardHeader>
          <CardTitle className="gradient-text">المفاتيح النشطة</CardTitle>
          <CardDescription>{keys.length} مفتاح مسجل</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد مفاتيح API. أنشئ مفتاحاً جديداً للبدء.</div>
          ) : (
            <div className="space-y-3">
              {keys.map((key: any) => (
                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <Key className={`h-5 w-5 ${key.isActive ? "text-emerald-500" : "text-gray-400"}`} />
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {key.name}
                        <Badge variant={key.isActive ? "default" : "secondary"}>
                          {key.isActive ? "نشط" : "ملغى"}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                        <span className="font-mono">{key.keyPrefix}...</span>
                        <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {key.requestCount || 0} طلب</span>
                        {key.lastUsedAt && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> آخر استخدام: {new Date(key.lastUsedAt).toLocaleDateString("ar-SA-u-nu-latn")}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {key.isActive && (
                      <Button variant="outline" size="sm" onClick={() => revokeMutation.mutate({ keyId: key.id })} disabled={revokeMutation.isPending}>
                        <Ban className="h-4 w-4 ms-1" /> إلغاء
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => deleteMutation.mutate({ keyId: key.id })} disabled={deleteMutation.isPending}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
