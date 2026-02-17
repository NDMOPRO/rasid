import { useEffect, useRef, useState } from 'react';

interface ConfettiEffectProps {
  trigger: boolean;
  count?: number;
  duration?: number;
  colors?: string[];
}

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  gravity: number;
}

export function ConfettiEffect({
  trigger,
  count = 60,
  duration = 3000,
  colors = ['#273470', '#6459A7', '#1E3A5F', '#4A7AB5', '#EB3D63', '#2A4F7A'],
}: ConfettiEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    setActive(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: ConfettiParticle[] = Array.from(
      { length: Math.min(count, 100) },
      () => ({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 8,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        width: Math.random() * 8 + 4,
        height: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1,
        gravity: 0.1 + Math.random() * 0.05,
      })
    );

    let animFrame: number;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      if (elapsed > duration) {
        setActive(false);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.vy += p.gravity;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.vx *= 0.99;

        if (elapsed > duration * 0.7) {
          p.opacity = Math.max(0, 1 - (elapsed - duration * 0.7) / (duration * 0.3));
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      });

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrame);
  }, [trigger, count, duration, colors]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
    />
  );
}
