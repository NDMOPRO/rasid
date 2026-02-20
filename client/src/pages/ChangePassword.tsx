import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, ShieldCheck, KeyRound } from "lucide-react";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import ParticleField from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

export default function ChangePassword() {
  const { playClick, playHover } = useSoundEffects();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const changePassword = trpc.account.changePassword.useMutation({
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return { label: "", color: "", width: "0%" };
    if (pw.length < 6) return { label: "ضعيفة", color: "bg-red-500", width: "25%" };
    if (pw.length < 8) return { label: "متوسطة", color: "bg-yellow-500", width: "50%" };
    if (/[A-Z]/.test(pw) && /[0-9]/.test(pw) && pw.length >= 10) return { label: "قوية جداً", color: "bg-green-500", width: "100%" };
    if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) return { label: "جيدة", color: "bg-blue-500", width: "75%" };
    return { label: "متوسطة", color: "bg-yellow-500", width: "50%" };
  };

  const strength = passwordStrength(newPassword);

  return (
    <div
      className="overflow-x-hidden max-w-full p-6 max-w-xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E3A5F] to-[#2D5F8A] flex items-center justify-center shadow-lg">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold gradient-text text-foreground">تغيير كلمة المرور</h1>
          <p className="text-sm text-muted-foreground">قم بتحديث كلمة المرور الخاصة بك لتأمين حسابك</p>
        </div>
      </div>

      <Card className="border-border/50 shadow-lg glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1E3A5F]" />
            <CardTitle className="gradient-text text-lg">تحديث كلمة المرور</CardTitle>
          </div>
          <CardDescription>
            تأكد من استخدام كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <Label htmlFor="current" className="flex items-center gap-2">
                <Lock className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                كلمة المرور الحالية
              </Label>
              <div className="relative">
                <Input
                  id="current"
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الحالية"
                  className="ps-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4 transition-transform duration-300 hover:scale-110" /> : <Eye className="w-4 h-4 transition-transform duration-300 hover:scale-110" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="new" className="flex items-center gap-2">
                <Lock className="w-4 h-4 transition-transform duration-300 hover:scale-110" />
                كلمة المرور الجديدة
              </Label>
              <div className="relative">
                <Input
                  id="new"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة (6 أحرف على الأقل)"
                  className="ps-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4 transition-transform duration-300 hover:scale-110" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} rounded-full transition-all duration-500`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    قوة كلمة المرور: <span className="font-medium">{strength.label}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                تأكيد كلمة المرور الجديدة
              </Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  className="ps-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500">كلمة المرور غير متطابقة</p>
              )}
              {confirmPassword.length > 0 && newPassword === confirmPassword && (
                <p className="text-xs text-green-500">كلمة المرور متطابقة</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={changePassword.isPending || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-l from-[#1E3A5F] to-[#2D5F8A] hover:from-[#2D5F8A] hover:to-[#1E3A5F] text-white h-11 text-base font-medium transition-all duration-300"
            >
              {changePassword.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري التحديث...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  تحديث كلمة المرور
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="mt-6 border-border/50 bg-muted/30 glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1E3A5F]" />
            نصائح لحماية الحساب
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] mt-2 shrink-0" />
              استخدم كلمة مرور لا تقل عن 8 أحرف
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] mt-2 shrink-0" />
              اجمع بين الأحرف الكبيرة والصغيرة والأرقام والرموز
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] mt-2 shrink-0" />
              لا تستخدم نفس كلمة المرور في أكثر من موقع
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1E3A5F] mt-2 shrink-0" />
              قم بتغيير كلمة المرور بشكل دوري كل 3 أشهر
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
