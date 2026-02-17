import { LOGO_WATERMARK } from "@/lib/rasidAssets";

interface WatermarkLogoProps {
  opacity?: number;
  size?: string;
  position?: "center" | "bottom-right" | "bottom-left" | "top-right";
}

/**
 * Subtle watermark logo that appears in the background of dashboard pages.
 * Uses the light/faded Rasid calligraphy for a premium branded feel.
 */
export function WatermarkLogo({ 
  opacity = 0.03, 
  size = "400px",
  position = "bottom-right" 
}: WatermarkLogoProps) {
  const positionClasses: Record<string, string> = {
    "center": "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    "bottom-right": "bottom-8 left-8",
    "bottom-left": "bottom-8 right-8",
    "top-right": "top-8 left-8",
  };

  return (
    <div 
      className={`absolute ${positionClasses[position]} pointer-events-none select-none z-0`}
      style={{ opacity }}
    >
      <img 
        src={LOGO_WATERMARK} 
        alt="" 
        className="w-auto h-auto"
        style={{ width: size, height: "auto" }}
        draggable={false}
        aria-hidden="true"
      />
    </div>
  );
}
