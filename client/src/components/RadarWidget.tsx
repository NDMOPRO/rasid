import { useEffect, useRef, useState } from 'react';

interface RadarDot {
  angle: number;
  distance: number;
  color: string;
  label?: string;
  size?: number;
}

interface RadarWidgetProps {
  dots?: RadarDot[];
  size?: number;
  sweepColor?: string;
  ringColor?: string;
  className?: string;
}

export function RadarWidget({
  dots = [],
  size = 200,
  sweepColor = 'rgba(39, 52, 112, 0.4)',
  ringColor = 'rgba(39, 52, 112, 0.15)',
  className = '',
}: RadarWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const angleRef = useRef(0);
  const animRef = useRef<number>(0);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const maxR = size / 2 - 10;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Draw rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (maxR / 4) * i, 0, Math.PI * 2);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw cross lines
      ctx.beginPath();
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.strokeStyle = ringColor;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Draw sweep beam
      angleRef.current += 0.015;
      const sweepAngle = angleRef.current;
      const gradient = ctx.createConicGradient(sweepAngle, cx, cy);
      gradient.addColorStop(0, sweepColor);
      gradient.addColorStop(0.15, 'transparent');
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR, sweepAngle - 0.5, sweepAngle);
      ctx.closePath();
      ctx.fillStyle = sweepColor;
      ctx.fill();

      // Draw sweep line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(sweepAngle) * maxR,
        cy + Math.sin(sweepAngle) * maxR
      );
      ctx.strokeStyle = sweepColor.replace('0.4', '0.8');
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw dots
      dots.forEach((dot, i) => {
        const rad = (dot.angle * Math.PI) / 180;
        const dist = (dot.distance / 100) * maxR;
        const x = cx + Math.cos(rad) * dist;
        const y = cy + Math.sin(rad) * dist;
        const dotSize = dot.size || 3;

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, dotSize + 3, 0, Math.PI * 2);
        ctx.fillStyle = dot.color.replace(')', ', 0.3)').replace('rgb', 'rgba');
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, dotSize, 0, Math.PI * 2);
        ctx.fillStyle = dot.color;
        ctx.fill();

        // Pulse effect when sweep passes
        const dotAngle = Math.atan2(y - cy, x - cx);
        const angleDiff = Math.abs(sweepAngle % (Math.PI * 2) - ((dotAngle + Math.PI * 2) % (Math.PI * 2)));
        if (angleDiff < 0.3) {
          ctx.beginPath();
          ctx.arc(x, y, dotSize + 6, 0, Math.PI * 2);
          ctx.fillStyle = dot.color.replace(')', ', 0.15)').replace('rgb', 'rgba');
          ctx.fill();
        }
      });

      // Center dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = sweepColor.replace('0.4', '0.8');
      ctx.fill();

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [dots, size, sweepColor, ringColor]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size }}
        className="rounded-full"
      />
    </div>
  );
}
