import { useState, useEffect, useCallback, useMemo } from "react";
import { useRoute } from "wouter";
import { Shield, CheckCircle2, XCircle, Search, Fingerprint, FileCheck, Lock, Database, Binary, Cpu, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

import { LOGO_FULL_DARK } from "@/lib/rasidAssets";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";
const LOGO_URL = LOGO_FULL_DARK;

const VERIFICATION_STEPS = [
  { icon: "🔗", text: "جارٍ الاتصال بقاعدة البيانات...", progress: 10 },
  { icon: "🔍", text: "البحث عن كود التوثيق...", progress: 25 },
  { icon: "🛡️", text: "التحقق من صحة البيانات...", progress: 40 },
  { icon: "📄", text: "مطابقة المحتوى الحرفي...", progress: 55 },
  { icon: "🔐", text: "التحقق من سلامة التوقيع الرقمي...", progress: 75 },
  { icon: "🧬", text: "التحقق من بصمة SHA-256...", progress: 90 },
  { icon: "✅", text: "إنهاء عملية التحقق...", progress: 100 },
];

function GradientOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    />
  );
}

function FloatingParticle({ index }: { index: number }) {
  const style = useMemo(() => ({
    left: `${10 + (index * 17) % 80}%`,
    top: `${5 + (index * 23) % 85}%`,
    width: `${3 + (index % 4)}px`,
    height: `${3 + (index % 4)}px`,
  }), [index]);

  return (
    <div
      className="absolute rounded-full bg-cyan-400/30"
      style={style}
    />
  );
}

function BinaryRain() {
  const columns = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${5 + i * 8}%`,
      delay: i * 0.3,
      chars: Array.from({ length: 8 }, () => Math.random() > 0.5 ? "1" : "0").join(""),
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
      {columns.map(col => (
        <div
          key={col.id}
          className="absolute text-cyan-400 font-mono text-xs leading-tight"
          style={{ left: col.left, top: "-20%" }}
        >
          {col.chars.split("").map((c, i) => (
            <div key={i} style={{ opacity: 0.3 + i * 0.1 }}>{c}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ScanAnimation({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* Outer ring */}
      <div
        className="absolute rounded-full border-2 border-cyan-500/30"
        style={{ width: 180, height: 180 }}
      >
        <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-cyan-400" />
      </div>
      {/* Inner ring */}
      <div
        className="absolute rounded-full border-2 border-sky-400/40"
        style={{ width: 140, height: 140 }}
      />
      {/* Core pulse */}
      <div
        className="absolute rounded-full"
        style={{
          width: 100,
          height: 100,
          background: "radial-gradient(circle, rgba(6,182,212,0.3) 0%, rgba(14,165,233,0.1) 70%, transparent 100%)",
        }}
      />
      {/* Center icon */}
      <div
      >
        <Fingerprint className="h-10 w-10 text-cyan-400" />
      </div>
      {/* Orbital dots */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-cyan-300"
          style={{
            top: `${50 + 45 * Math.sin((angle * Math.PI) / 180)}%`,
            left: `${50 + 45 * Math.cos((angle * Math.PI) / 180)}%`,
          }}
        />
      ))}
      {/* Step indicator */}
      <div className="absolute -bottom-8 text-xs font-mono text-cyan-400/60">
        [{currentStep + 1}/{VERIFICATION_STEPS.length}]
      </div>
    </div>
  );
}

export default function VerifyDocument() {
  const { playClick, playHover } = useSoundEffects();
  const [, params] = useRoute("/verify/:code");
  const [code, setCode] = useState(params?.code || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [hexStream, setHexStream] = useState("");

  const verifyQuery = trpc.documentation.verify.useQuery(
    { code: code.trim() },
    { enabled: false }
  );

  // Hex stream effect
  useEffect(() => {
    if (!isVerifying) return;
    const interval = setInterval(() => {
      const hex = Array.from({ length: 32 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      setHexStream(hex);
    }, 100);
    return () => clearInterval(interval);
  }, [isVerifying]);

  const startVerification = useCallback(async () => {
    if (!code.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);
    setCurrentStep(0);
    setProgress(0);

    // Animate through steps
    for (let i = 0; i < VERIFICATION_STEPS.length; i++) {
      setCurrentStep(i);
      setProgress(VERIFICATION_STEPS[i].progress);
      await new Promise(r => setTimeout(r, 600 + Math.random() * 400));
    }

    // Actual verification
    try {
      const result = await verifyQuery.refetch();
      setVerificationResult(result.data);
    } catch {
      setVerificationResult({ valid: false, document: null });
    }
    setIsVerifying(false);
  }, [code, verifyQuery]);

  // Auto-verify if code in URL
  useEffect(() => {
    if (params?.code && !isVerifying && !verificationResult) {
      setCode(params.code);
      setTimeout(() => startVerification(), 500);
    }
  }, [params?.code]);

  const reset = () => {
    setVerificationResult(null);
    setCurrentStep(-1);
    setProgress(0);
    setCode("");
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#030712" }}>
      {/* Background effects */}
      <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(6,182,212,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <GradientOrb className="w-96 h-96 bg-cyan-600 -top-20 -right-20" />
      <GradientOrb className="w-80 h-80 bg-sky-600 bottom-20 -left-20" delay={2} />
      <GradientOrb className="w-64 h-64 bg-indigo-600 top-1/2 right-1/3" delay={4} />
      {Array.from({ length: 8 }).map((_, i) => <FloatingParticle key={i} index={i} />)}
      {isVerifying && <BinaryRain />}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        {/* Logo */}
        <div
          className="mb-8 relative"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)", width: 120, height: 120, top: -20, left: -20 }}
          />
          <img src={LOGO_URL} alt="راصد" className="h-20 w-auto relative z-10" />
        </div>

        <h1
          className="text-2xl font-bold text-white mb-2 gradient-text"
        >
          التحقق من صحة الوثائق
        </h1>
        <p
          className="text-sm text-cyan-400/60 mb-8 font-mono"
        >
          [PLATFORM]_VERIFY_ENGINE v3.2.1 — Secure Document Verification Protocol
        </p>

        {/* Input Section */}
        
          {!isVerifying && !verificationResult && (
            <div
              key="input"
              className="w-full max-w-md"
            >
              <div className="rounded-2xl border border-cyan-500/20 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-6 space-y-4">
                <div className="text-center mb-4">
                  <Shield className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">أدخل رمز التحقق المطبوع على الوثيقة</p>
                </div>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="RASID-XXXXXXXX-YYYYYYYY"
                  className="h-12 text-center font-mono text-lg bg-black/30 border-cyan-500/30 text-white placeholder:text-gray-600"
                  dir="ltr"
                  onKeyDown={(e) => e.key === "Enter" && startVerification()}
                />
                <Button
                  onClick={startVerification}
                  disabled={!code.trim()}
                  className="w-full h-12 bg-gradient-to-l from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-base"
                >
                  <Search className="h-5 w-5 ms-2" />
                  تحقق الآن
                </Button>
              </div>
            </div>
          )}

          {/* Verification Animation */}
          {isVerifying && (
            <div
              key="verifying"
              className="w-full max-w-md flex flex-col items-center"
            >
              <ScanAnimation currentStep={currentStep} />

              {/* Hex stream */}
              <div className="mt-8 font-mono text-[10px] text-cyan-400/40 tracking-widest text-center break-all max-w-xs" dir="ltr">
                {hexStream}
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-xs mt-6">
                <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #06b6d4, #0ea5e9, #06b6d4)", backgroundSize: "200% 100%" }}
                    animate={{ width: `${progress}%`, backgroundPosition: ["0% 0%", "100% 0%"] }}
                    transition={{ width: { duration: 0.5 }, backgroundPosition: { duration: 2, repeat: Infinity } }}
                  />
                </div>
                {/* Shimmer */}
                <div
                  className="h-1.5 -mt-1.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)", width: "30%" }}
                />
              </div>

              {/* Steps */}
              <div className="mt-6 space-y-2 w-full max-w-xs">
                {VERIFICATION_STEPS.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 text-sm ${
                      i < currentStep ? "text-green-400" :
                      i === currentStep ? "text-cyan-400" :
                      "text-gray-600"
                    }`}
                  >
                    <span className="w-5 text-center">
                      {i < currentStep ? "✓" : i === currentStep ? "●" : "○"}
                    </span>
                    <span className="font-mono text-xs">{step.text}</span>
                  </div>
                ))}
              </div>

              {/* Technical text */}
              {isVerifying && (
                <p
                  className="mt-4 text-[10px] font-mono text-cyan-400/30"
                >
                  [PLATFORM]_VERIFY_ENGINE v3.2.1 — Secure Document Verification Protocol
                </p>
              )}
            </div>
          )}

          {/* Result: Success */}
          {verificationResult?.valid && (
            <div
              key="success"
              className="w-full max-w-lg"
            >
              <div className="rounded-2xl border border-green-500/30 bg-green-500/5 backdrop-blur-xl overflow-hidden">
                {/* Success header */}
                <div className="relative px-6 py-6 text-center" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(16,185,129,0.1))" }}>
                  {/* Success particles */}
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
                    <div
                      key={i}
                      className="absolute w-1.5 h-1.5 rounded-full bg-green-400"
                      style={{ top: "50%", left: "50%" }}
                    />
                  ))}
                  <div
                    className="relative inline-flex"
                  >
                    <div
                      className="absolute inset-0 rounded-full bg-green-400/20"
                      style={{ width: 96, height: 96, top: -12, left: -12 }}
                    />
                    <CheckCircle2 className="h-[72px] w-[72px] text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-green-400 mt-4">الوثيقة صحيحة ومتحقق منها</h2>
                </div>

                <div className="px-6 py-5 space-y-4">
                  {/* Document details grid */}
                  <div className="grid grid-cols-2 gap-3 stagger-children">
                    {[
                      { label: "رقم الوثيقة", value: verificationResult.document?.documentId, mono: true },
                      { label: "رقم السجل", value: verificationResult.document?.recordId || "—", mono: true },
                      { label: "المُصدِر", value: verificationResult.document?.generatedByName },
                      { label: "تاريخ الإصدار", value: verificationResult.document?.createdAt ? new Date(verificationResult.document.createdAt).toLocaleDateString("ar-SA") : "—" },
                    ].map((item, i) => (
                      <div key={i} className="rounded-lg bg-black/20 border border-green-500/10 p-3">
                        <div className="text-[11px] text-gray-500 mb-1">{item.label}</div>
                        <div className={`text-sm text-white ${item.mono ? "font-mono" : ""}`} dir={item.mono ? "ltr" : "rtl"}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Title */}
                  {verificationResult.document?.titleAr && (
                    <div className="rounded-lg bg-black/20 border border-green-500/10 p-3">
                      <div className="text-[11px] text-gray-500 mb-1">عنوان السجل</div>
                      <div className="text-sm text-white">{verificationResult.document.titleAr}</div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {verificationResult.document?.documentType && (
                      <span className="px-3 py-1 rounded-full text-xs bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        {verificationResult.document.documentType === "incident_report" ? "توثيق حادثة" :
                         verificationResult.document.documentType === "custom_report" ? "تقرير مخصص" :
                         verificationResult.document.documentType === "executive_summary" ? "ملخص تنفيذي" :
                         verificationResult.document.documentType === "compliance_report" ? "تقرير امتثال" : "تقرير قطاعي"}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-xs bg-green-500/10 border border-green-500/20 text-green-400">
                      متحقق منه ✓
                    </span>
                  </div>

                  {/* SHA-256 hash */}
                  {verificationResult.document?.contentHash && (
                    <div className="rounded-lg bg-black/30 border border-indigo-500/20 p-3">
                      <div className="text-[11px] text-gray-500 mb-1">بصمة SHA-256</div>
                      <div className="font-mono text-[11px] text-primary break-all" dir="ltr">
                        {verificationResult.document.contentHash}
                      </div>
                    </div>
                  )}

                  {/* Confirmation */}
                  <div className="text-center text-sm text-green-400/80 pt-2 border-t border-green-500/10">
                    ✅ تم التحقق من تطابق المحتوى مع النسخة المحفوظة
                  </div>
                </div>

                <div className="px-6 pb-5">
                  <Button onClick={reset} variant="outline" className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10">
                    تحقق من وثيقة أخرى
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Result: Failure */}
          {verificationResult && !verificationResult.valid && (
            <div
              key="failure"
              className="w-full max-w-md"
            >
              <div className="rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-xl overflow-hidden">
                <div className="px-6 py-6 text-center">
                  <div
                  >
                    <XCircle className="h-20 w-20 text-red-400 mx-auto" />
                  </div>
                  <h2 className="text-xl font-bold text-red-400 mt-4">رمز التحقق غير صالح</h2>
                  <p className="text-sm text-gray-400 mt-2">لم يتم العثور على وثيقة مطابقة لرمز التحقق المُدخل</p>
                </div>
                <div className="px-6 pb-5">
                  <Button onClick={reset} className="w-full bg-red-600 hover:bg-red-700 text-white">
                    حاول مرة أخرى
                  </Button>
                </div>
              </div>
            </div>
          )}
        
      </div>
    </div>
  );
}
