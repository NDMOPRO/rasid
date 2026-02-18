import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowRight, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";

/* ═══ Rasid Character CDN URLs ═══ */
const RASID_CHARACTER_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/rCKQyRDoubhdjHel.png";

export default function NotFound() {
  const [, setLocation] = useLocation();
  const [showCharacter, setShowCharacter] = useState(false);
  const [glitchText, setGlitchText] = useState("404");

  useEffect(() => {
    // Staggered entrance for character
    const timer = setTimeout(() => setShowCharacter(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Glitch effect on 404 text
  useEffect(() => {
    const glitchChars = "!@#$%^&*()_+{}|:<>?";
    let interval: ReturnType<typeof setInterval>;
    const startGlitch = () => {
      let count = 0;
      interval = setInterval(() => {
        if (count < 6) {
          setGlitchText(
            "404".split("").map(c => Math.random() > 0.5 ? glitchChars[Math.floor(Math.random() * glitchChars.length)] : c).join("")
          );
          count++;
        } else {
          setGlitchText("404");
          clearInterval(interval);
        }
      }, 80);
    };
    // Glitch every 5 seconds
    startGlitch();
    const mainInterval = setInterval(startGlitch, 5000);
    return () => { clearInterval(interval); clearInterval(mainInterval); };
  }, []);

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, #0D1529 0%, #0a1230 30%, #101e45 60%, #1A2550 100%)",
      }}
    >
      {/* Aurora background effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(61, 177, 172, 0.08), transparent 60%), " +
            "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(100, 89, 167, 0.06), transparent 50%), " +
            "radial-gradient(ellipse 50% 30% at 20% 80%, rgba(39, 52, 112, 0.08), transparent 50%)",
        }}
      />

      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(61, 177, 172, 0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none light-particles" />

      <div className="flex flex-col items-center gap-6 max-w-2xl mx-4 relative z-10">
        {/* Rasid Character with floating animation */}
        <div
          className={`relative transition-all duration-1000 ${showCharacter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          {/* Character glow ring */}
          <div
            className="absolute -inset-6 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(61, 177, 172, 0.12) 0%, transparent 70%)",
              animation: "breathing-glow 3s ease-in-out infinite",
            }}
          />
          {/* Shield badge behind character */}
          <div className="absolute -top-3 -right-3 z-10">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(235, 61, 99, 0.15)",
                border: "1px solid rgba(235, 61, 99, 0.3)",
                boxShadow: "0 0 20px rgba(235, 61, 99, 0.2)",
                animation: "breathing-status 2s ease-in-out infinite",
              }}
            >
              <Shield className="w-5 h-5 text-[#EB3D63]" />
            </div>
          </div>
          <img
            src={RASID_CHARACTER_URL}
            alt="شخصية راصد"
            className="w-40 h-40 object-contain character-float drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 8px 24px rgba(61, 177, 172, 0.15))",
            }}
          />
        </div>

        <Card
          className="w-full border-0 relative overflow-hidden"
          style={{
            background: "rgba(26, 37, 80, 0.7)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(61, 177, 172, 0.12)",
            boxShadow: "0 8px 40px rgba(0, 0, 0, 0.4), 0 0 80px rgba(61, 177, 172, 0.04), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        >
          {/* Scan line effect */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute w-full"
              style={{
                height: "30%",
                background: "linear-gradient(transparent, rgba(61, 177, 172, 0.04), transparent)",
                animation: "scan-line 4s ease-in-out infinite",
              }}
            />
          </div>

          <CardContent className="pt-8 pb-8 text-center relative z-[1]">
            {/* Glitch 404 text */}
            <h1
              className="text-7xl font-black mb-2 tracking-wider"
              style={{
                background: "linear-gradient(135deg, #3DB1AC, #6459A7, #EB3D63)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                textShadow: "none",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {glitchText}
            </h1>

            {/* Decorative line */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, rgba(61, 177, 172, 0.4), transparent)" }} />
              <div className="w-2 h-2 rounded-full bg-[#3DB1AC] status-breathing" />
              <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, rgba(61, 177, 172, 0.4), transparent)" }} />
            </div>

            <h2 className="text-xl font-semibold mb-3" style={{ color: "#E1DEF5" }}>
              الصفحة غير موجودة
            </h2>

            <p className="mb-2 text-sm" style={{ color: "rgba(225, 222, 245, 0.5)" }}>
              عذراً، الصفحة التي تبحث عنها غير موجودة.
            </p>
            <p className="mb-6 text-xs" style={{ color: "rgba(225, 222, 245, 0.3)" }}>
              يبدو أن راصد لم يتمكن من العثور على ما تبحث عنه. جرب العودة للرئيسية.
            </p>

            {/* Speech bubble from character */}
            <div
              className="inline-block px-4 py-2 rounded-2xl mb-6 text-sm"
              style={{
                background: "rgba(61, 177, 172, 0.08)",
                border: "1px solid rgba(61, 177, 172, 0.15)",
                color: "#3DB1AC",
              }}
            >
              💬 &ldquo;لا تقلق! سأساعدك في العودة إلى المسار الصحيح&rdquo;
            </div>

            <div
              id="not-found-button-group"
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button
                onClick={handleGoHome}
                className="text-white px-6 py-2.5 rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
                style={{
                  background: "linear-gradient(135deg, #273470 0%, #6459A7 50%, #3DB1AC 100%)",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(61, 177, 172, 0.25)",
                }}
              >
                <Home className="w-4 h-4 ml-2" />
                العودة للرئيسية
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="rounded-xl transition-all duration-300"
                style={{
                  background: "rgba(61, 177, 172, 0.08)",
                  borderColor: "rgba(61, 177, 172, 0.15)",
                  color: "#3DB1AC",
                }}
              >
                <ArrowRight className="w-4 h-4 ml-2" />
                الصفحة السابقة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(400%); }
        }
        @keyframes breathing-glow {
          0%, 100% { opacity: 0.3; transform: scale(2); }
          50% { opacity: 0.6; transform: scale(2.2); }
        }
      `}</style>
    </div>
  );
}
