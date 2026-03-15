import { useEffect } from "react";
import { useTilt3D, useMousePosition, useCanvasSetup, useParticles } from "../hooks";
import "../../css/holographic.css";

interface HolographicCardProps {
  children: React.ReactNode;
  sparkles?: boolean;
  tiltMax?: number;
  className?: string;
}

interface Sparkle {
  x: number;
  y: number;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

export default function HolographicCard({
  children,
  sparkles = true,
  tiltMax = 15,
  className = "",
}: HolographicCardProps) {
  const { ref, shineRef, handlers: tiltHandlers } = useTilt3D({ maxRotation: tiltMax });
  const { position, handlers: mouseHandlers } = useMousePosition({ scope: "element", mode: "state" });

  const { canvasRef, startLoop } = useCanvasSetup({ dpr: 1 });

  const particles = useParticles<Sparkle>({
    spawn: () => {
      const pos = position as { x: number; y: number };
      const cx = pos?.x ?? 0;
      const cy = pos?.y ?? 0;
      const maxLife = 0.4 + Math.random() * 0.4;
      return {
        x: cx + (Math.random() - 0.5) * 80,
        y: cy + (Math.random() - 0.5) * 80,
        size: 1 + Math.random() * 2,
        life: 0,
        maxLife,
        alpha: 1,
      };
    },
    update: (p, dt) => {
      p.life += dt;
      const t = p.life / p.maxLife;
      p.alpha = t < 0.5 ? t * 2 : (1 - t) * 2;
      return p.life < p.maxLife;
    },
    maxCount: 200,
  });

  const lastMouseRef = { x: -1, y: -1 };

  useEffect(() => {
    if (!sparkles) return;
    return startLoop((ctx, dt) => {
      const canvas = ctx.canvas;
      ctx.clearRect(0, 0, canvas.width / 1, canvas.height / 1);

      const pos = position as { x: number; y: number };
      const mx = pos?.x ?? -1;
      const my = pos?.y ?? -1;

      const moved =
        Math.abs(mx - lastMouseRef.x) > 2 || Math.abs(my - lastMouseRef.y) > 2;
      lastMouseRef.x = mx;
      lastMouseRef.y = my;

      if (moved && mx > 0) {
        particles.emit(2);
      }

      particles.tick(dt);

      particles.forEach(ctx, (c, p) => {
        c.save();
        c.globalAlpha = p.alpha * 0.9;
        c.fillStyle = "#ffffff";
        c.beginPath();
        c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        c.fill();
        c.restore();
      });
    });
  }, [sparkles, startLoop, particles]);

  const hx = `${((position as { x: number; y: number })?.x ?? 0) / ((ref.current?.offsetWidth ?? 1) || 1) * 100}%`;
  const hy = `${((position as { x: number; y: number })?.y ?? 0) / ((ref.current?.offsetHeight ?? 1) || 1) * 100}%`;

  return (
    <div
      ref={ref}
      {...tiltHandlers}
      onMouseMove={(e) => {
        tiltHandlers.onMouseMove(e);
        mouseHandlers.onMouseMove(e);
      }}
      onMouseLeave={(e) => {
        tiltHandlers.onMouseLeave();
        mouseHandlers.onMouseLeave();
      }}
      className={`fx-holo ${className}`}
      style={{
        position: "relative",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "16px",
        padding: "24px",
        cursor: "default",
        willChange: "transform",
        "--holo-x": hx,
        "--holo-y": hy,
      } as React.CSSProperties}
    >
      {sparkles && (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      )}
      <div
        ref={shineRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 4,
          borderRadius: "inherit",
        }}
      />
      <div style={{ position: "relative", zIndex: 5 }}>{children}</div>
    </div>
  );
}
