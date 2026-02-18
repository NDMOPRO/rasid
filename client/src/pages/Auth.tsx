import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Loader2, Eye, EyeOff, Globe } from "lucide-react";
import { toast } from "sonner";

export default function Auth() {
  const { t, lang, setLang } = useI18n();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      window.location.href = "/";
    },
    onError: (err) => {
      toast.error(t("auth.invalidCredentials"));
    },
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      window.location.href = "/";
    },
    onError: (err) => {
      if (err.message.includes("already registered")) {
        toast.error(t("auth.emailExists"));
      } else {
        toast.error(err.message);
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "register") {
      if (password !== confirmPassword) {
        toast.error(t("auth.passwordMismatch"));
        return;
      }
      registerMutation.mutate({ name, email, password });
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "en" ? "ar" : "en")}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-card-foreground hover:bg-accent transition-colors text-sm"
      >
        <Globe className="h-4 w-4" />
        {lang === "en" ? "العربية" : "English"}
      </button>

      <div className="w-full max-w-md space-y-6">
        {/* Logo & Title */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">{t("auth.welcome")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("auth.subtitle")}</p>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">
              {mode === "login" ? t("auth.signIn") : t("auth.signUp")}
            </CardTitle>
            <CardDescription>
              {mode === "login" ? t("auth.signInDesc") : t("auth.signUpDesc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="name">{t("auth.name")}</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder={lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"}
                    dir={lang === "ar" ? "rtl" : "ltr"}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder={lang === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={lang === "ar" ? "أدخل كلمة المرور" : "Enter your password"}
                    dir="ltr"
                    className="pe-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 -translate-y-1/2 end-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t("auth.confirmPassword")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder={lang === "ar" ? "أكد كلمة المرور" : "Confirm your password"}
                    dir="ltr"
                  />
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin me-2" />}
                {mode === "login" ? t("auth.signIn") : t("auth.signUp")}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              {mode === "login" ? (
                <p className="text-muted-foreground">
                  {t("auth.noAccount")}{" "}
                  <button
                    onClick={() => setMode("register")}
                    className="text-primary hover:underline font-medium"
                  >
                    {t("auth.signUp")}
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  {t("auth.hasAccount")}{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    {t("auth.signIn")}
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
