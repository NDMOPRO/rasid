import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, Shield, Lock, User, AlertCircle, Sun, Moon, Fingerprint, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";

import {
  QL_LOGO_WHITE,
  QL_LOGO_DARK,
  QL_LOGO_MAIN,
  QL_LOGO_OFFICE,
  QL_CHAR_STANDING,
} from "@/lib/rasidAssets";
import AnimatedLogo from "@/components/AnimatedLogo";

/* ═══════════════════════════════════════════════════════════════════
   §1  Hover Light — radial gradient follows mouse cursor
   ═══════════════════════════════════════════════════════════════════ */
function useHoverLight(ref: React.RefObject<HTMLDivElement | null>) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  const [active, setActive] = useState(false);

  const onMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const enter = () => setActive(true);
    const leave = () => setActive(false);
    el.addEventListener("mouseenter", enter);
    el.addEventListener("mouseleave", leave);
    el.addEventListener("mousemove", onMove);
    return () => {
      el.removeEventListener("mouseenter", enter);
      el.removeEventListener("mouseleave", leave);
      el.removeEventListener("mousemove", onMove);
    };
  }, [ref, onMove]);

  return { pos, active };
}

/* ═══════════════════════════════════════════════════════════════════
   §2  Floating Particles — ambient background decoration
   ═══════════════════════════════════════════════════════════════════ */
function FloatingParticles() {
  const particles = useMemo(() => Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 4,
    dur: 6 + Math.random() * 16,
    delay: Math.random() * 8,
    isGold: Math.random() > 0.35,
    drift: 10 + Math.random() * 30,
    opacity: 0.3 + Math.random() * 0.5,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.isGold ? `rgba(197,165,90,${p.opacity})` : `rgba(61,177,172,${p.opacity * 0.7})`,
            boxShadow: p.isGold
              ? `0 0 ${p.size * 5}px rgba(197,165,90,${p.opacity * 0.5})`
              : `0 0 ${p.size * 4}px rgba(61,177,172,${p.opacity * 0.4})`,
            animation: `float ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      {/* Larger ambient orbs */}
      {[0,1,2].map(i => (
        <div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: 6 + i * 3,
            height: 6 + i * 3,
            left: `${20 + i * 30}%`,
            top: `${15 + i * 25}%`,
            background: `radial-gradient(circle, rgba(197,165,90,0.4) 0%, transparent 70%)`,
            boxShadow: `0 0 ${20 + i * 10}px rgba(197,165,90,0.15)`,
            animation: `float ${10 + i * 4}s ease-in-out ${i * 2}s infinite, pulse-glow ${6 + i * 2}s ease-in-out ${i}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   §3  Gold 3D Edge Frame — CSS-only luxury border
   ═══════════════════════════════════════════════════════════════════ */
function GoldEdge({ children, className = "", intensity = "normal" }: {
  children: React.ReactNode;
  className?: string;
  intensity?: "subtle" | "normal" | "strong";
}) {
  const opacityMap = { subtle: 0.25, normal: 0.45, strong: 0.65 };
  const op = opacityMap[intensity];
  return (
    <div className={`relative ${className}`}>
      {/* Gold gradient border */}
      <div
        className="absolute inset-[-1.5px] rounded-[inherit] pointer-events-none"
        style={{
          padding: "1.5px",
          background: `linear-gradient(135deg, 
            rgba(245,230,163,${op}) 0%, 
            rgba(197,165,90,${op * 1.2}) 25%, 
            rgba(139,115,50,${op * 0.8}) 50%, 
            rgba(197,165,90,${op * 1.2}) 75%, 
            rgba(245,230,163,${op}) 100%)`,
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   §4  Main Login Component
   ═══════════════════════════════════════════════════════════════════ */
export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const { playClick, playSuccess, playError } = useSoundEffects();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const cardRef = useRef<HTMLDivElement>(null);
  const { pos, active: hoverActive } = useHoverLight(cardRef);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);



  const loginMutation = trpc.platformAuth.login.useMutation({
    onSuccess: (data) => {
      playSuccess();
      localStorage.setItem("rasid_session", JSON.stringify({ displayName: data.displayName, role: data.role }));
      toast.success("تم تسجيل الدخول بنجاح");
      window.location.href = "/";
    },
    onError: (err) => {
      playError();
      setError(err.message || "خطأ في تسجيل الدخول");
      toast.error(err.message || "خطأ في تسجيل الدخول");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    if (!username.trim() || !password.trim()) {
      playError();
      setError("يرجى إدخال اسم المستخدم وكلمة المرور");
      return;
    }
    setError("");
    loginMutation.mutate({ userId: username.trim(), password });
  };

  /* ── Shared gold tokens ── */
  const gold = {
    primary: "#C5A55A",
    light: "#F5E6A3",
    dark: "#8B7332",
    glow: "rgba(197,165,90,0.15)",
    ring: "rgba(197,165,90,0.35)",
    shimmer: "rgba(245,230,163,0.08)",
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" dir="rtl">

      {/* ── Background: Deep Navy Gradient ── */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#050D1A] via-[#0A192F] to-[#0d1f3c]" />
        {/* Warm ambient orbs */}
        <div className="absolute top-[-15%] right-[-5%] w-[700px] h-[700px] rounded-full bg-[#1e40af]/8 blur-[150px]" />
        <div className="absolute bottom-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full bg-[#C5A55A]/[0.05] blur-[130px]" />
        <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#3DB1AC]/[0.04] blur-[100px]" />
      </div>

      {/* ── Floating Particles ── */}
      <FloatingParticles />

      {/* ── Geometric Grid Pattern ── */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="login-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#C5A55A" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#login-grid)" />
        </svg>
      </div>

      {/* ── Top Gold Accent Line ── */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A55A]/40 to-transparent z-20" />

      {/* ── Theme Toggle ── */}
      <button
        onClick={() => { toggleTheme?.(); playClick(); }}
        className="absolute top-6 left-6 z-50 p-3 rounded-xl backdrop-blur-md transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: "rgba(197,165,90,0.05)",
          border: "1px solid rgba(197,165,90,0.15)",
          boxShadow: "inset 0 1px 0 0 rgba(245,230,163,0.1), 0 2px 8px rgba(0,0,0,0.2)",
        }}
        title={isDark ? "تبديل للثيم الفاتح" : "تبديل للثيم الداكن"}
      >
        
          {isDark ? (
            <div key="sun">
              <Sun className="h-5 w-5 text-amber-400" />
            </div>
          ) : (
            <div key="moon">
              <Moon className="h-5 w-5 text-[#C5A55A]/80" />
            </div>
          )}
        
      </button>

      {/* ═══════════════════════════════════════════════════════════════
         MAIN CONTAINER — Two columns
         ═══════════════════════════════════════════════════════════════ */}
      <div
        className={`relative z-10 w-full max-w-[1200px] mx-4 flex rounded-3xl overflow-hidden transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{
          minHeight: "680px",
          boxShadow: `
            0 0 0 1px rgba(197,165,90,0.08),
            0 25px 60px -12px rgba(0,0,0,0.5),
            0 12px 28px -8px rgba(0,0,0,0.3)
          `,
        }}
      >

        {/* ═══════════════════════════════════════════════════════════
           LEFT COLUMN — Branding / Features (Desktop only)
           ═══════════════════════════════════════════════════════════ */}
        <div className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center p-12 overflow-hidden">
          {/* Glass background with deeper gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(135deg, rgba(7,20,40,0.97) 0%, rgba(12,28,52,0.95) 30%, rgba(10,25,47,0.97) 60%, rgba(7,20,40,0.98) 100%)",
              backdropFilter: "blur(30px) saturate(1.5)",
            }}
          />

          {/* Ambient glow orbs for depth */}
          <div className="absolute top-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-[#C5A55A]/[0.04] blur-[120px]" />
          <div className="absolute bottom-[15%] left-[10%] w-[250px] h-[250px] rounded-full bg-[#3DB1AC]/[0.03] blur-[100px]" />

          {/* Gold accent line top — stronger */}
          <div className="absolute top-0 left-0 right-0 h-[2px]">
            <div className="h-full" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(139,115,50,0.40) 20%, rgba(197,165,90,0.70) 35%, rgba(245,230,163,0.90) 50%, rgba(197,165,90,0.70) 65%, rgba(139,115,50,0.40) 80%, transparent 95%)' }} />
          </div>

          {/* Animated orbital rings */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full border border-[#C5A55A]/[0.06]"
              style={{ transform: 'translate(-50%, -50%)', animation: 'orbital-spin 30s linear infinite' }}
            />
            <div
              className="absolute top-[50%] left-[50%] w-[500px] h-[500px] rounded-full border border-[#C5A55A]/[0.04]"
              style={{ transform: 'translate(-50%, -50%)', animation: 'orbital-spin-reverse 40s linear infinite' }}
            />
            <div
              className="absolute top-[50%] left-[50%] w-[300px] h-[300px] rounded-full"
              style={{ transform: 'translate(-50%, -50%)', animation: 'orbital-spin 20s linear infinite', border: '1px dashed rgba(197,165,90,0.06)' }}
            />
            {/* Corner decorative elements */}
            <div className="absolute top-8 right-8 w-20 h-20 border border-[#C5A55A]/[0.08] rounded-xl rotate-45" style={{ animation: 'gold-pulse 4s ease-in-out infinite' }} />
            <div className="absolute bottom-12 left-10 w-16 h-16 border border-[#3DB1AC]/[0.08] rounded-full" style={{ animation: 'gold-pulse 5s ease-in-out 1s infinite' }} />
            {/* Vertical gold line — left edge */}
            <div className="absolute left-0 top-[10%] bottom-[10%] w-[1px]" style={{ background: 'linear-gradient(180deg, transparent, rgba(197,165,90,0.25), rgba(245,230,163,0.35), rgba(197,165,90,0.25), transparent)' }} />
          </div>

          {/* Logo */}
          <div
            className="relative z-10 mb-2"
          >
            <AnimatedLogo size={150} showText={false} variant="login" />
          </div>

          {/* Character with enhanced glow */}
          <div
            className="relative z-10 mb-6"
          >
            <div className="absolute inset-[-20%] bg-[#C5A55A]/[0.06] rounded-full blur-[80px]" style={{ animation: 'gold-pulse 5s ease-in-out infinite' }} />
            <div className="absolute inset-[-10%] bg-[#3DB1AC]/[0.03] rounded-full blur-[60px]" style={{ animation: 'gold-pulse 7s ease-in-out 2s infinite' }} />
            <img
              src={QL_CHAR_STANDING}
              alt="شخصية راصد"
              className="relative h-[260px] object-contain"
              style={{ 
                filter: "drop-shadow(0 20px 60px rgba(197,165,90,0.20)) drop-shadow(0 5px 15px rgba(0,0,0,0.3))",
                animation: 'subtle-float 6s ease-in-out infinite',
              }}
            />
          </div>

          {/* Title & Description */}
          <div
            className="relative z-10 text-center"
          >
            <h2 className="text-2xl font-bold mb-3 tracking-tight"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F5E6A3 40%, #C5A55A 60%, #F5E6A3 80%, #FFFFFF 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gold-shimmer-sweep 6s ease-in-out infinite',
              }}
            >
              مكتب إدارة البيانات الوطنية
            </h2>
            <p className="text-[#8892b0] text-sm leading-relaxed max-w-sm mx-auto">
              منصة راصد الذكية لإدارة البيانات الوطنية والامتثال لنظام حماية البيانات الشخصية
            </p>
          </div>

          {/* Badges */}
          <div
            className="relative z-10 mt-8 flex gap-4"
          >
            {[
              { icon: Shield, label: "نظام آمن", color: "#3DB1AC" },
              { icon: Lock, label: "تشفير متقدم", color: "#C5A55A" },
            ].map((badge, i) => (
              <GoldEdge key={i} className="rounded-full" intensity="subtle">
                <div
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md transition-all duration-200 hover:scale-105"
                  style={{
                    background: "rgba(197,165,90,0.04)",
                    boxShadow: "inset 0 1px 0 0 rgba(245,230,163,0.08), 0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <badge.icon className="w-4 h-4" style={{ color: badge.color }} />
                  <span className="text-xs text-[#a8b2d1] font-medium">{badge.label}</span>
                </div>
              </GoldEdge>
            ))}
          </div>

          {/* Gold accent line bottom — premium metallic */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]">
            <div className="h-full" style={{ background: 'linear-gradient(90deg, transparent 5%, rgba(139,115,50,0.40) 20%, rgba(197,165,90,0.70) 35%, rgba(245,230,163,0.90) 50%, rgba(197,165,90,0.70) 65%, rgba(139,115,50,0.40) 80%, transparent 95%)' }} />
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════
           RIGHT COLUMN — Login Form Card
           ═══════════════════════════════════════════════════════════ */}
        <div
          ref={cardRef}
          className="w-full lg:w-[45%] relative flex flex-col justify-center p-8 lg:p-12"
          style={{
            background: isDark
              ? "linear-gradient(160deg, rgba(10,20,38,0.98) 0%, rgba(7,18,35,0.99) 50%, rgba(10,20,38,0.98) 100%)"
              : "linear-gradient(160deg, rgba(255,255,255,0.97) 0%, rgba(248,249,252,0.98) 100%)",
            boxShadow: isDark
              ? "inset 1px 0 0 0 rgba(197,165,90,0.15), inset 0 0 80px rgba(197,165,90,0.02)"
              : "inset 1px 0 0 0 rgba(197,165,90,0.10)",
            backdropFilter: isDark ? "blur(30px) saturate(1.4)" : "none",
          }}
        >
          {/* Hover Light Effect */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-none"
            style={{
              background: hoverActive
                ? `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(197,165,90,${isDark ? 0.06 : 0.04}), transparent 60%)`
                : "none",
              opacity: hoverActive ? 1 : 0,
            }}
          />

          {/* Gold top accent on card */}
          <div className="absolute top-0 left-[10%] right-[10%] h-[2px]">
            <div
              className="h-full rounded-b-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(197,165,90,0.5), transparent)" }}
            />
          </div>

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <AnimatedLogo size={100} showText variant="login" />
          </div>

          {/* Header */}
          <div
            className="mb-8 relative z-10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${gold.primary}20, ${gold.primary}10)`,
                  border: `1px solid ${gold.primary}25`,
                  boxShadow: `inset 0 1px 0 0 rgba(245,230,163,0.15), 0 2px 6px rgba(197,165,90,0.1)`,
                }}
              >
                <Fingerprint className="w-5 h-5" style={{ color: gold.primary }} />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-[#0A192F]"}`}>
                  تسجيل الدخول
                </h1>
              </div>
            </div>
            <p className={`text-sm ${isDark ? "text-[#8892b0]" : "text-[#64748b]"} mr-[52px]`}>
              أدخل بيانات الاعتماد للوصول إلى لوحة التحكم
            </p>
          </div>

          {/* Error message */}
          
            {error && (
              <div
                className="mb-6 relative z-10"
              >
                <GoldEdge className="rounded-xl" intensity="subtle">
                  <div
                    className="flex items-center gap-3 p-4 rounded-xl text-sm"
                    style={{
                      background: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.05)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      boxShadow: "inset 0 1px 0 0 rgba(239,68,68,0.05)",
                    }}
                  >
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400" />
                    <span className={isDark ? "text-red-300" : "text-red-700"}>{error}</span>
                  </div>
                </GoldEdge>
              </div>
            )}
          



          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">

            {/* Username */}
            <div
            >
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-[#a8b2d1]" : "text-[#334155]"}`}>
                اسم المستخدم
              </label>
              <div className="relative group">
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isDark ? "text-[#4a5568] group-focus-within:text-[#C5A55A]" : "text-[#94a3b8] group-focus-within:text-[#C5A55A]"}`}>
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="أدخل اسم المستخدم"
                  className="w-full h-13 pr-12 pl-4 rounded-xl outline-none text-sm transition-all duration-200"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    border: `1.5px solid ${isDark ? "rgba(197,165,90,0.12)" : "rgba(197,165,90,0.15)"}`,
                    color: isDark ? "#E1DEF5" : "#0A192F",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 0 rgba(245,230,163,0.04)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(197,165,90,0.5)";
                    e.target.style.boxShadow = `0 0 0 3px rgba(197,165,90,0.12), inset 0 1px 2px rgba(0,0,0,0.06), 0 0 12px rgba(197,165,90,0.08)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? "rgba(197,165,90,0.12)" : "rgba(197,165,90,0.15)";
                    e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 0 rgba(245,230,163,0.04)";
                  }}
                  autoComplete="username"
                  dir="ltr"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div
            >
              <label className={`block text-sm font-medium mb-2 ${isDark ? "text-[#a8b2d1]" : "text-[#334155]"}`}>
                كلمة المرور
              </label>
              <div className="relative group">
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isDark ? "text-[#4a5568] group-focus-within:text-[#C5A55A]" : "text-[#94a3b8] group-focus-within:text-[#C5A55A]"}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="أدخل كلمة المرور"
                  className="w-full h-13 pr-12 pl-12 rounded-xl outline-none text-sm transition-all duration-200"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.04)" : "#f8fafc",
                    border: `1.5px solid ${isDark ? "rgba(197,165,90,0.12)" : "rgba(197,165,90,0.15)"}`,
                    color: isDark ? "#E1DEF5" : "#0A192F",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 0 rgba(245,230,163,0.04)",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(197,165,90,0.5)";
                    e.target.style.boxShadow = `0 0 0 3px rgba(197,165,90,0.12), inset 0 1px 2px rgba(0,0,0,0.06), 0 0 12px rgba(197,165,90,0.08)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = isDark ? "rgba(197,165,90,0.12)" : "rgba(197,165,90,0.15)";
                    e.target.style.boxShadow = "inset 0 1px 2px rgba(0,0,0,0.06), 0 1px 0 0 rgba(245,230,163,0.04)";
                  }}
                  autoComplete="current-password"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-110 ${isDark ? "text-[#4a5568] hover:text-[#C5A55A]" : "text-[#94a3b8] hover:text-[#C5A55A]"}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div
              className="flex items-center justify-between"
            >
              <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="w-[18px] h-[18px] rounded-md border-[1.5px] transition-all duration-200 flex items-center justify-center peer-checked:border-[#C5A55A] peer-checked:bg-[#C5A55A]/15 peer-focus:ring-2 peer-focus:ring-[#C5A55A]/20"
                    style={{
                      borderColor: isDark ? "rgba(197,165,90,0.2)" : "rgba(197,165,90,0.25)",
                      background: rememberMe ? "rgba(197,165,90,0.1)" : "transparent",
                    }}
                  >
                    {rememberMe && (
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path d="M2 6l3 3 5-5" stroke="#C5A55A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className={`text-sm transition-colors duration-200 ${isDark ? "text-[#8892b0] group-hover:text-[#a8b2d1]" : "text-[#64748b] group-hover:text-[#334155]"}`}>
                  تذكرني
                </span>
              </label>
              <button
                type="button"
                onClick={() => { playClick(); setLocation("/forgot-password"); }}
                className="text-sm transition-all duration-200 hover:underline underline-offset-4"
                style={{ color: `${gold.primary}99` }}
                onMouseEnter={(e) => (e.currentTarget.style.color = gold.primary)}
                onMouseLeave={(e) => (e.currentTarget.style.color = `${gold.primary}99`)}
              >
                نسيت كلمة المرور؟
              </button>
            </div>

            {/* Submit Button */}
            <div
              className="pt-2"
            >
              <GoldEdge className="rounded-xl" intensity="normal">
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full h-13 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 relative overflow-hidden transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{
                    background: "linear-gradient(135deg, #0A192F 0%, #112240 40%, #1a3050 70%, #0A192F 100%)",
                    color: "#F5E6A3",
                    boxShadow: `
                      inset 0 1px 0 0 rgba(245,230,163,0.20),
                      inset 0 -1px 0 0 rgba(0,0,0,0.25),
                      0 4px 16px rgba(10,25,47,0.5),
                      0 8px 30px rgba(10,25,47,0.25),
                      0 0 0 1px rgba(197,165,90,0.12)
                    `,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `
                      inset 0 1px 0 0 rgba(245,230,163,0.25),
                      inset 0 -1px 0 0 rgba(0,0,0,0.2),
                      0 8px 20px rgba(10,25,47,0.5),
                      0 12px 32px rgba(10,25,47,0.25),
                      0 0 20px rgba(197,165,90,0.1)
                    `;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `
                      inset 0 1px 0 0 rgba(245,230,163,0.15),
                      inset 0 -1px 0 0 rgba(0,0,0,0.2),
                      0 4px 12px rgba(10,25,47,0.4),
                      0 8px 24px rgba(10,25,47,0.2)
                    `;
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "translateY(1px)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                >
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

                  {loginMutation.isPending ? (
                    <span className="flex items-center gap-2.5 relative z-10">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2.5 relative z-10">
                      <Shield className="w-5 h-5" />
                      <span>تسجيل الدخول</span>
                    </span>
                  )}
                </button>
              </GoldEdge>
            </div>
          </form>

          {/* ── Gold Separator ── */}
          <div
            className="mt-8 mb-6 relative z-10"
          >
            <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C5A55A]/25 to-transparent" />
          </div>

          {/* ── Footer ── */}
          <div
            className="relative z-10"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <img src={QL_LOGO_MAIN} alt="راصد" className="h-7 object-contain opacity-50 hover:opacity-80 transition-opacity duration-200" />
              <div className="w-[1px] h-5 bg-gradient-to-b from-transparent via-[#C5A55A]/20 to-transparent" />
              <img src={QL_LOGO_OFFICE} alt="مكتب إدارة البيانات" className="h-7 object-contain opacity-50 hover:opacity-80 transition-opacity duration-200" />
            </div>
            <p className={`text-center text-xs ${isDark ? "text-[#4a5568]" : "text-[#94a3b8]"}`}>
              منصة راصد الذكية - مكتب إدارة البيانات الوطنية
            </p>
            <p className={`text-center text-xs mt-1 ${isDark ? "text-[#4a5568]" : "text-[#94a3b8]"}`}>
              © {new Date().getFullYear()} جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Gold Accent Line ── */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C5A55A]/30 to-transparent z-20" />
    </div>
  );
}
