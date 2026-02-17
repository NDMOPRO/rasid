import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, ArrowRight, CheckCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";


export default function ForgotPassword() {
  const { playClick, playHover } = useSoundEffects();
  const [, setLocation] = useLocation();
  
  const isDark = true;

  const [step, setStep] = useState<"email" | "token" | "done">("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const requestMutation = trpc.passwordReset.request.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال طلب إعادة التعيين");
      setStep("token");
    },
    onError: (err) => toast.error(err.message),
  });

  const resetMutation = trpc.passwordReset.reset.useMutation({
    onSuccess: () => {
      toast.success("تم إعادة تعيين كلمة المرور بنجاح");
      setStep("done");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("يرجى إدخال البريد الإلكتروني");
      return;
    }
    requestMutation.mutate({ email: email.trim() });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("يرجى إدخال رمز التحقق");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }
    resetMutation.mutate({ token: token.trim(), newPassword });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${
      isDark
        ? "bg-gradient-to-br from-slate-950 via-blue-950/80 to-slate-900"
        : "bg-gradient-to-br from-blue-50 via-white to-indigo-50"
    }`}>
      <Card className="w-full max-w-md glass-card gold-sweep hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl">
            <KeyRound className="w-6 h-6 text-blue-400" />
            استعادة كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === "email" && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                أدخل بريدك الإلكتروني المسجل وسنرسل لك رمز إعادة التعيين
              </p>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative mt-1">
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    className="pe-10"
                  />
                  <Mail className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={requestMutation.isPending}>
                {requestMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ms-2" />
                ) : null}
                إرسال رمز التحقق
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setLocation("/login")}>
                <ArrowRight className="w-4 h-4 ms-2" />
                العودة لتسجيل الدخول
              </Button>
            </form>
          )}

          {step === "token" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                أدخل رمز التحقق الذي تلقيته وكلمة المرور الجديدة
              </p>
              <div>
                <Label htmlFor="token">رمز التحقق</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="أدخل رمز التحقق"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  dir="ltr"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetMutation.isPending}>
                {resetMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin ms-2" />
                ) : null}
                إعادة تعيين كلمة المرور
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
                العودة
              </Button>
            </form>
          )}

          {step === "done" && (
            <div className="text-center space-y-4 py-4">
              <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto" />
              <p className="text-lg font-semibold">تم إعادة تعيين كلمة المرور بنجاح</p>
              <p className="text-sm text-muted-foreground">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة</p>
              <Button className="w-full" onClick={() => setLocation("/login")}>
                تسجيل الدخول
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
