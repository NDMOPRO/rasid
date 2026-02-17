import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearch } from "wouter";
import { Shield, CheckCircle2, XCircle, Search, QrCode, FileCheck, Lock, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

import { LOGO_FULL_DARK } from "@/lib/rasidAssets";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { ParticleField } from "@/components/ParticleField";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";
const LOGO_URL = LOGO_FULL_DARK;

function GradientOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-15 ${className}`}
    />
  );
}

export default function PublicVerify() {
  const { playClick, playHover } = useSoundEffects();
  const searchString = useSearch();
  const urlParams = useMemo(() => new URLSearchParams(searchString), [searchString]);
  const codeFromUrl = urlParams.get("code") || "";

  const [code, setCode] = useState(codeFromUrl);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const verifyQuery = trpc.documentation.verify.useQuery(
    { code: code.trim() },
    { enabled: false }
  );

  const startVerification = useCallback(async () => {
    if (!code.trim()) return;
    setIsVerifying(true);
    setVerificationResult(null);

    // Brief animation delay for UX
    await new Promise(r => setTimeout(r, 1500));

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
    if (codeFromUrl && !isVerifying && !verificationResult) {
      setCode(codeFromUrl);
      setTimeout(() => startVerification(), 500);
    }
  }, [codeFromUrl]);

  const reset = () => {
    setVerificationResult(null);
    setCode("");
  };

  const docTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      incident_report: "توثيق حادثة",
      custom_report: "تقرير مخصص",
      executive_summary: "ملخص تنفيذي",
      compliance_report: "تقرير امتثال",
      sector_report: "تقرير قطاعي",
    };
    return map[type] || type;
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a, #020617)" }}>
      {/* Background */}
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(rgba(6,182,212,0.04) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
      <GradientOrb className="w-80 h-80 bg-cyan-600 -top-10 -right-10" />
      <GradientOrb className="w-60 h-60 bg-sky-600 bottom-10 -left-10" delay={2} />

      {/* Header */}
      <header className="relative z-10 border-b border-[#C5A55A]/8 dark:border-white/5 bg-white dark:bg-white/[0.02] backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="راصد" className="h-10 w-auto" />
            <div>
              <h1 className="text-base font-bold text-white">منصة راصد</h1>
              <p className="text-[11px] text-gray-500">خدمة التحقق من الوثائق الرسمية</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <Lock className="h-3.5 w-3.5 text-green-400" />
            <span>اتصال آمن</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        
          {/* Input Form */}
          {!isVerifying && !verificationResult && (
            <div
              key="input"
              className="w-full max-w-md"
            >
              <div className="text-center mb-8">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 mb-4"
                >
                  <QrCode className="h-8 w-8 text-cyan-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">التحقق من صحة الوثيقة</h2>
                <p className="text-sm text-gray-400 leading-relaxed">
                  أدخل رمز التحقق المطبوع على الوثيقة الرسمية الصادرة من منصة راصد
                  للتأكد من صحتها وعدم التلاعب بمحتواها
                </p>
              </div>

              <div className="rounded-2xl border border-[#C5A55A]/10 dark:border-white/10 bg-[#C5A55A]/[0.03] dark:bg-white/5 backdrop-blur-xl p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">رمز التحقق</label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="أدخل رمز التحقق هنا..."
                    className="h-12 text-center font-mono text-base bg-black/30 border-[#C5A55A]/10 dark:border-white/10 text-white placeholder:text-gray-600"
                    dir="ltr"
                    onKeyDown={(e) => e.key === "Enter" && startVerification()}
                  />
                </div>
                <Button
                  onClick={startVerification}
                  disabled={!code.trim()}
                  className="w-full h-12 bg-gradient-to-l from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold"
                >
                  <Search className="h-5 w-5 ms-2" />
                  تحقق الآن
                </Button>
              </div>

              {/* Info cards */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#C5A55A]/8 dark:border-white/5 bg-white dark:bg-white/[0.02] p-3 text-center">
                  <Shield className="h-5 w-5 text-cyan-400 mx-auto mb-1.5" />
                  <p className="text-[11px] text-gray-400">تشفير SHA-256</p>
                </div>
                <div className="rounded-xl border border-[#C5A55A]/8 dark:border-white/5 bg-white dark:bg-white/[0.02] p-3 text-center">
                  <FileCheck className="h-5 w-5 text-green-400 mx-auto mb-1.5" />
                  <p className="text-[11px] text-gray-400">توثيق رقمي معتمد</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {isVerifying && (
            <div
              key="loading"
              className="text-center"
            >
              <div
                className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 mx-auto"
              />
              <p className="text-sm text-gray-400 mt-4">جارٍ التحقق من صحة الوثيقة...</p>
              <p className="text-xs text-gray-600 mt-1 font-mono" dir="ltr">Verifying document integrity...</p>
            </div>
          )}

          {/* Success Result */}
          {verificationResult?.valid && (
            <div
              key="success"
              className="w-full max-w-lg"
            >
              <div className="rounded-2xl border border-green-500/20 bg-green-500/5 backdrop-blur-xl overflow-hidden">
                <div className="px-6 py-6 text-center" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(16,185,129,0.05))" }}>
                  <div
                  >
                    <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto" />
                  </div>
                  <h2 className="text-lg font-bold text-green-400 mt-3">✅ الوثيقة صحيحة ومتحقق منها</h2>
                  <p className="text-sm text-gray-400 mt-1">تم التحقق من صحة الوثيقة وتطابق محتواها مع النسخة الأصلية</p>
                </div>

                <div className="px-6 py-5 space-y-3">
                  <div className="grid grid-cols-2 gap-3 stagger-children">
                    <div className="rounded-lg bg-black/20 border border-green-500/10 p-3">
                      <div className="text-[11px] text-gray-500 mb-1">رقم الوثيقة</div>
                      <div className="text-sm text-white font-mono" dir="ltr">{verificationResult.document?.documentId}</div>
                    </div>
                    <div className="rounded-lg bg-black/20 border border-green-500/10 p-3">
                      <div className="text-[11px] text-gray-500 mb-1">نوع الوثيقة</div>
                      <div className="text-sm text-white">{docTypeLabel(verificationResult.document?.documentType)}</div>
                    </div>
                    <div className="rounded-lg bg-black/20 border border-green-500/10 p-3">
                      <div className="text-[11px] text-gray-500 mb-1">المُصدِر</div>
                      <div className="text-sm text-white">{verificationResult.document?.generatedByName}</div>
                    </div>
                    <div className="rounded-lg bg-black/20 border border-green-500/10 p-3">
                      <div className="text-[11px] text-gray-500 mb-1">تاريخ الإصدار</div>
                      <div className="text-sm text-white">
                        {verificationResult.document?.createdAt
                          ? new Date(verificationResult.document.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
                          : "—"}
                      </div>
                    </div>
                  </div>

                  {verificationResult.document?.titleAr && (
                    <div className="rounded-lg bg-black/20 border border-green-500/10 p-3">
                      <div className="text-[11px] text-gray-500 mb-1">عنوان الوثيقة</div>
                      <div className="text-sm text-white">{verificationResult.document.titleAr}</div>
                    </div>
                  )}

                  {verificationResult.document?.contentHash && (
                    <div className="rounded-lg bg-black/30 border border-indigo-500/10 p-3">
                      <div className="text-[11px] text-gray-500 mb-1">بصمة التحقق SHA-256</div>
                      <div className="font-mono text-[10px] text-primary break-all" dir="ltr">
                        {verificationResult.document.contentHash}
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-6 pb-5">
                  <Button onClick={reset} variant="outline" className="w-full border-[#C5A55A]/10 dark:border-white/10 text-gray-300 hover:bg-[#C5A55A]/[0.03] dark:bg-white/5">
                    تحقق من وثيقة أخرى
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Failure Result */}
          {verificationResult && !verificationResult.valid && (
            <div
              key="failure"
              className="w-full max-w-md"
            >
              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 backdrop-blur-xl overflow-hidden">
                <div className="px-6 py-6 text-center">
                  <div
                  >
                    <XCircle className="h-16 w-16 text-red-400 mx-auto" />
                  </div>
                  <h2 className="text-lg font-bold text-red-400 mt-3">❌ رمز التحقق غير صالح</h2>
                  <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                    لم يتم العثور على وثيقة مطابقة لرمز التحقق المُدخل.
                    يرجى التأكد من صحة الرمز والمحاولة مرة أخرى.
                  </p>
                </div>
                <div className="px-6 pb-5 space-y-3">
                  <Button onClick={reset} className="w-full bg-red-600 hover:bg-red-700 text-white">
                    حاول مرة أخرى
                  </Button>
                </div>
              </div>
            </div>
          )}
        
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#C5A55A]/8 dark:border-white/5 bg-white/95 dark:bg-white/[0.01] py-4">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-[11px] text-gray-600">
            منصة راصد — مكتب إدارة البيانات الوطنية — خدمة التحقق من الوثائق الرسمية
          </p>
        </div>
      </footer>
    </div>
  );
}
