import { Skeleton } from './ui/skeleton';

/* ═══ Rasid Character CDN URL ═══ */
const RASID_CHARACTER_SMALL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/nceygigNBuUkNsBp.png";
const RASID_LOGO = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663296955420/DnIAzRZfiCrhzgYz.svg";

export function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background relative overflow-hidden">
      {/* Full-screen loading overlay with character */}
      <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-6"
        style={{
          background: "linear-gradient(135deg, #0D1529 0%, #0a1230 30%, #101e45 60%, #1A2550 100%)",
        }}
      >
        {/* Aurora background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(61, 177, 172, 0.08), transparent 60%), " +
              "radial-gradient(ellipse 60% 40% at 80% 20%, rgba(100, 89, 167, 0.06), transparent 50%)",
          }}
        />

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(61, 177, 172, 0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Rasid Character with breathing animation */}
        <div className="relative">
          {/* Glow ring behind character */}
          <div
            className="absolute -inset-8 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(61, 177, 172, 0.1) 0%, transparent 70%)",
              animation: "skeleton-glow 3s ease-in-out infinite",
            }}
          />
          {/* Orbiting dots around character */}
          <div className="absolute inset-0 w-full h-full" style={{ animation: "orbit-spin 4s linear infinite" }}>
            <div className="absolute -top-2 left-1/2 w-2 h-2 rounded-full bg-[#3DB1AC]"
              style={{ boxShadow: "0 0 8px rgba(61, 177, 172, 0.5)" }} />
          </div>
          <div className="absolute inset-0 w-full h-full" style={{ animation: "orbit-spin 4s linear infinite reverse" }}>
            <div className="absolute -bottom-2 left-1/2 w-1.5 h-1.5 rounded-full bg-[#6459A7]"
              style={{ boxShadow: "0 0 8px rgba(100, 89, 167, 0.5)" }} />
          </div>

          <img
            src={RASID_CHARACTER_SMALL}
            alt="راصد"
            className="w-28 h-28 object-contain character-breathe relative z-10"
            style={{ filter: "drop-shadow(0 4px 16px rgba(61, 177, 172, 0.2))" }}
          />
        </div>

        {/* Logo */}
        <img
          src={RASID_LOGO}
          alt="راصد"
          className="h-8 object-contain opacity-80"
          style={{ filter: "drop-shadow(0 2px 8px rgba(61, 177, 172, 0.15))" }}
        />

        {/* Loading text */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold" style={{ color: "#E1DEF5" }}>
            جاري تحميل المنصة...
          </p>
          <p className="text-xs" style={{ color: "rgba(225, 222, 245, 0.4)" }}>
            يتم تجهيز لوحة مؤشرات الرصد
          </p>
        </div>

        {/* Animated loading bar */}
        <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: "rgba(61, 177, 172, 0.1)" }}>
          <div
            className="h-full rounded-full"
            style={{
              background: "linear-gradient(90deg, #3DB1AC, #6459A7, #3DB1AC)",
              backgroundSize: "200% 100%",
              animation: "loading-bar 1.5s ease-in-out infinite",
            }}
          />
        </div>

        {/* Skeleton preview behind (subtle) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="flex min-h-screen">
            <div className="w-[280px] border-r border-white/5 p-4 space-y-6">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              <Skeleton className="h-12 w-48 rounded-lg" />
              <div className="grid gap-4 md:grid-cols-3">
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
                <Skeleton className="h-32 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes skeleton-glow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes loading-bar {
          0% { width: 0%; background-position: 0% 0%; }
          50% { width: 70%; background-position: 100% 0%; }
          100% { width: 100%; background-position: 200% 0%; }
        }
      `}</style>
    </div>
  );
}
