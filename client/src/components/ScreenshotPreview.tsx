import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, ZoomIn, ZoomOut, RotateCcw, Maximize2, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ===== Inline Screenshot Thumbnail =====
// Use this wherever a site name appears to show a clickable screenshot thumbnail
export function ScreenshotThumbnail({
  url,
  domain,
  className,
  size = "sm",
}: {
  url?: string | null;
  domain: string;
  className?: string;
  size?: "xs" | "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: "w-8 h-6",
    sm: "w-12 h-9",
    md: "w-16 h-12",
  };

  // Use thum.io as fallback for generating live thumbnails
  const thumUrl = domain ? `https://image.thum.io/get/width/400/crop/300/https://${domain}` : null;
  const effectiveUrl = url || thumUrl;

  if (!effectiveUrl || (imgError && !thumUrl)) {
    return (
      <div className={cn(sizeClasses[size], "rounded-md bg-muted/50 flex items-center justify-center shrink-0", className)}>
        <Globe className="h-3 w-3 text-muted-foreground/40" />
      </div>
    );
  }

  const displayUrl = imgError && thumUrl ? thumUrl : effectiveUrl;

  return (
    <>
      <div
        className={cn(
          sizeClasses[size],
          "rounded-md overflow-hidden bg-muted shrink-0 cursor-pointer group relative ring-1 ring-border/30 hover:ring-primary/50 transition-all",
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title="انقر لتكبير لقطة الشاشة"
      >
        <img
          src={displayUrl}
          alt={`لقطة ${domain}`}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <ZoomIn className="h-3 w-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      <ScreenshotZoomDialog
        url={displayUrl}
        domain={domain}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}

// ===== Full Zoom Dialog =====
export function ScreenshotZoomDialog({
  url,
  domain,
  open,
  onOpenChange,
}: {
  url: string;
  domain: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const resetView = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const next = Math.max(prev - 0.5, 0.5);
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.25 : 0.25;
    setZoom((prev) => {
      const next = Math.max(0.5, Math.min(prev + delta, 5));
      if (next <= 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom <= 1) return;
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { ...position };
    },
    [zoom, position]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({
        x: posStart.current.x + dx,
        y: posStart.current.y + dy,
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleOpenChange = useCallback(
    (v: boolean) => {
      if (!v) resetView();
      onOpenChange(v);
    },
    [onOpenChange, resetView]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto p-0 overflow-hidden bg-black/95 border-[#C5A55A]/10 dark:border-white/10">
        <DialogHeader className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-sm text-white/90">
              <Camera className="h-4 w-4 text-primary" />
              لقطة شاشة - {domain}
            </DialogTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs text-white/60 min-w-[3rem] text-center font-mono">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10"
                onClick={handleZoomIn}
                disabled={zoom >= 5}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/70 hover:text-white hover:bg-[#C5A55A]/[0.05] dark:bg-white/10"
                onClick={resetView}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div
          ref={containerRef}
          className={cn(
            "relative w-[90vw] h-[85vh] overflow-hidden flex items-center justify-center",
            zoom > 1 ? "cursor-grab" : "cursor-zoom-in",
            isDragging && "cursor-grabbing"
          )}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => {
            if (zoom <= 1) handleZoomIn();
          }}
        >
          <img
            src={url}
            alt={`لقطة شاشة ${domain}`}
            className="max-w-none select-none transition-transform duration-150"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              maxHeight: zoom <= 1 ? "85vh" : "none",
              maxWidth: zoom <= 1 ? "90vw" : "none",
            }}
            draggable={false}
            loading="lazy"
          />
        </div>

        {/* Zoom hint */}
        {zoom <= 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <Maximize2 className="h-3 w-3" />
            انقر أو استخدم عجلة الماوس للتكبير
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ===== Simple Screenshot Preview Button =====
// For use in existing table cells or list items
export function ScreenshotButton({
  url,
  domain,
  className,
}: {
  url?: string | null;
  domain: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!url) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={cn(
          "inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors",
          className
        )}
        title="عرض لقطة الشاشة"
      >
        <Camera className="h-3 w-3" />
      </button>
      <ScreenshotZoomDialog url={url} domain={domain} open={open} onOpenChange={setOpen} />
    </>
  );
}
