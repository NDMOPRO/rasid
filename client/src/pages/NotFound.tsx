import { Button } from "@/components/ui/button";
import { Home, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { CHARACTER_STANDING, LOGO_CALLIGRAPHY_GOLD } from "@/lib/rasidAssets";
import { ParticleField } from "@/components/ParticleField";
import { WatermarkLogo } from "@/components/WatermarkLogo";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { PremiumPageContainer, PremiumCard } from "@/components/UltraPremiumWrapper";

export default function NotFound() {
  const { playClick, playHover } = useSoundEffects();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0D1529] relative overflow-hidden" dir="rtl">
      {/* Background effects */}
      <ParticleField count={30} />
      
      {/* Gradient orbs */}
      <div
        className="absolute top-20 right-20 w-96 h-96 rounded-full bg-[#273470]/20 blur-3xl"
      />
      <div
        className="absolute bottom-20 left-20 w-80 h-80 rounded-full bg-[#1E3A5F]/20 blur-3xl"
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-2xl">
        {/* Character */}
        <img
          src={CHARACTER_STANDING}
          alt="شخصية راصد"
          className="h-48 w-auto mb-8 drop-shadow-2xl"
          draggable={false}
        />

        {/* 404 Number */}
        <div
          className="relative mb-6"
        >
          <span className="text-[120px] font-black leading-none bg-gradient-to-b from-[#4A7AB5] to-[#273470] bg-clip-text text-transparent">
            404
          </span>
          <div className="absolute inset-0 text-[120px] font-black leading-none text-[#4A7AB5]/10 blur-xl">
            404
          </div>
        </div>

        {/* Logo */}
        <img
          src={LOGO_CALLIGRAPHY_GOLD}
          alt="راصد"
          className="h-12 w-auto mb-6 opacity-60"
          draggable={false}
        />

        {/* Message */}
        <h2
          className="text-2xl font-bold text-[#E1DEF5] mb-3 gradient-text"
        >
          الصفحة غير موجودة
        </h2>

        <p
          className="text-[#E1DEF5]/60 mb-10 text-lg leading-relaxed max-w-md"
        >
          عذراً، الصفحة التي تبحث عنها غير موجودة.
          <br />
          ربما تم نقلها أو حذفها.
        </p>

        {/* Button */}
        <div
        >
          <Button
            onClick={() => setLocation("/")}
            className="bg-gradient-to-l from-[#273470] to-[#1E3A5F] hover:from-[#1E3A5F] hover:to-[#273470] text-white px-8 py-3 rounded-xl text-lg shadow-lg shadow-[#273470]/30 hover:shadow-xl hover:shadow-[#273470]/40 transition-all duration-300 group"
          >
            <Home className="w-5 h-5 ms-2" />
            العودة للرئيسية
            <ArrowRight className="w-4 h-4 me-2 group-hover:-translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
