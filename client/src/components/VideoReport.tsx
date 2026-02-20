/**
 * VideoReport — Generates animated video-style reports from dashboard data.
 * Uses Canvas API to create frame-by-frame animated presentations.
 * Can export as WebM video or animated GIF.
 */
import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ReportSlide {
  title: string;
  content: string;
  value?: string | number;
  icon?: string;
  color?: string;
}

interface VideoReportProps {
  slides: ReportSlide[];
  title?: string;
  className?: string;
  width?: number;
  height?: number;
  fps?: number;
  slideDuration?: number; // seconds per slide
}

export function VideoReport({
  slides,
  title = "تقرير راصد الذكي",
  className,
  width = 1280,
  height = 720,
  fps = 30,
  slideDuration = 4,
}: VideoReportProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number>();

  const drawSlide = useCallback(
    (ctx: CanvasRenderingContext2D, slideIdx: number, frameProgress: number) => {
      const slide = slides[slideIdx];
      if (!slide) return;

      // Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0a0e1a");
      gradient.addColorStop(1, "#1a1e2e");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Aurora effect
      const auroraGradient = ctx.createRadialGradient(
        width * 0.3 + Math.sin(frameProgress * Math.PI * 2) * 50,
        height * 0.3,
        0,
        width * 0.5,
        height * 0.5,
        width * 0.6
      );
      auroraGradient.addColorStop(0, `${slide.color || "#06b6d4"}15`);
      auroraGradient.addColorStop(1, "transparent");
      ctx.fillStyle = auroraGradient;
      ctx.fillRect(0, 0, width, height);

      // Slide number
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "16px Tajawal, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${slideIdx + 1} / ${slides.length}`, 40, height - 30);

      // Title bar
      ctx.fillStyle = "rgba(255,255,255,0.05)";
      ctx.fillRect(0, 0, width, 80);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.font = "bold 24px Tajawal, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(title, width - 40, 50);

      // Animated entrance
      const slideIn = Math.min(1, frameProgress * 3);
      const alpha = Math.min(1, frameProgress * 2);
      const offsetX = (1 - slideIn) * 100;

      ctx.globalAlpha = alpha;

      // Slide title
      ctx.fillStyle = slide.color || "#06b6d4";
      ctx.font = "bold 48px Tajawal, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(slide.title, width - 60 + offsetX, height * 0.35);

      // Value (if present)
      if (slide.value !== undefined) {
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.font = "bold 80px Tajawal, sans-serif";
        ctx.fillText(String(slide.value), width - 60 + offsetX, height * 0.55);
      }

      // Content
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "24px Tajawal, sans-serif";
      const contentY = slide.value !== undefined ? height * 0.68 : height * 0.5;
      ctx.fillText(slide.content, width - 60 + offsetX, contentY);

      // Progress bar
      const totalProgress = (slideIdx + frameProgress) / slides.length;
      ctx.globalAlpha = 1;
      ctx.fillStyle = "rgba(255,255,255,0.1)";
      ctx.fillRect(0, height - 4, width, 4);
      ctx.fillStyle = slide.color || "#06b6d4";
      ctx.fillRect(0, height - 4, width * totalProgress, 4);

      // Decorative elements
      ctx.strokeStyle = `${slide.color || "#06b6d4"}33`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(100, height * 0.5, 150 + Math.sin(frameProgress * Math.PI * 4) * 20, 0, Math.PI * 2);
      ctx.stroke();
    },
    [slides, title, width, height]
  );

  const playPreview = useCallback(() => {
    if (!canvasRef.current || isPlaying) return;
    setIsPlaying(true);

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const totalFrames = slides.length * slideDuration * fps;
    let frame = 0;

    const animate = () => {
      if (frame >= totalFrames) {
        setIsPlaying(false);
        setCurrentSlide(0);
        setProgress(0);
        return;
      }

      const slideIdx = Math.floor(frame / (slideDuration * fps));
      const frameInSlide = (frame % (slideDuration * fps)) / (slideDuration * fps);

      setCurrentSlide(slideIdx);
      setProgress(frame / totalFrames);
      drawSlide(ctx, slideIdx, frameInSlide);

      frame++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  }, [slides, fps, slideDuration, isPlaying, drawSlide]);

  const stopPreview = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsPlaying(false);
  }, []);

  const exportVideo = useCallback(async () => {
    if (!canvasRef.current) return;
    setIsGenerating(true);

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    try {
      const stream = canvasRef.current.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5000000,
      });

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rasid-report-${new Date().toISOString().split("T")[0]}.webm`;
        a.click();
        URL.revokeObjectURL(url);
        setIsGenerating(false);
      };

      mediaRecorder.start();

      // Render all frames
      const totalFrames = slides.length * slideDuration * fps;
      for (let frame = 0; frame < totalFrames; frame++) {
        const slideIdx = Math.floor(frame / (slideDuration * fps));
        const frameInSlide = (frame % (slideDuration * fps)) / (slideDuration * fps);
        drawSlide(ctx, slideIdx, frameInSlide);
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }

      mediaRecorder.stop();
    } catch (err) {
      console.error("Video export failed:", err);
      setIsGenerating(false);
    }
  }, [slides, fps, slideDuration, drawSlide]);

  // Draw initial slide
  React.useEffect(() => {
    if (!canvasRef.current || isPlaying) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) drawSlide(ctx, 0, 0.5);
  }, [drawSlide, isPlaying]);

  return (
    <div className={cn("relative rounded-xl bg-slate-900/50 p-4 border border-white/10", className)} dir="rtl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-white/90">تقرير فيديو</h3>
        <div className="flex gap-2">
          <button
            onClick={isPlaying ? stopPreview : playPreview}
            className="px-4 py-2 rounded-lg text-sm bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
          >
            {isPlaying ? "⏹ إيقاف" : "▶ معاينة"}
          </button>
          <button
            onClick={exportVideo}
            disabled={isGenerating || isPlaying}
            className="px-4 py-2 rounded-lg text-sm bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50"
          >
            {isGenerating ? "جاري التصدير..." : "⬇ تصدير فيديو"}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full rounded-lg border border-white/5"
        style={{ aspectRatio: `${width}/${height}` }}
      />

      {/* Progress */}
      {(isPlaying || isGenerating) && (
        <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default VideoReport;
