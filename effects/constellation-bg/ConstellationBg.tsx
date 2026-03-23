import { useRef, useEffect } from "react";
import { colorAtPosition } from "../../presets/colors";
import type { RGB } from "../../presets/colors";
import { resolvePalette } from "../../presets/resolve";

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface ConstellationBgProps {
  count?: number;
  linkDist?: number;
  mouseRadius?: number;
  palette?: string;
  colors?: [RGB, RGB, RGB];
  className?: string;
}

export default function ConstellationBg({
  count = 70,
  linkDist = 140,
  mouseRadius = 160,
  palette,
  colors,
  className,
}: ConstellationBgProps) {
  const DEFAULT_PARTICLES: [RGB, RGB, RGB] = [[99, 102, 241], [139, 92, 246], [34, 211, 238]];
  const resolvedParticles = colors ?? resolvePalette(palette, 'particles', DEFAULT_PARTICLES) as [RGB, RGB, RGB];
  const stops = resolvedParticles;
  const colorAt = (x: number, y: number, w: number, h: number) =>
    colorAtPosition(x, y, w, h, stops);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);

  // Refs for props so the animation loop always reads latest values
  const countRef = useRef(count);
  const linkDistRef = useRef(linkDist);
  const mouseRadiusRef = useRef(mouseRadius);
  countRef.current = count;
  linkDistRef.current = linkDist;
  mouseRadiusRef.current = mouseRadius;

  // Re-seed stars when count changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: 1 + Math.random() * 1.5,
      });
    }
    starsRef.current = stars;
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const MOUSE_PUSH = 0.8;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);

      if (starsRef.current.length === 0) {
        const stars: Star[] = [];
        for (let i = 0; i < countRef.current; i++) {
          stars.push({
            x: Math.random() * rect.width,
            y: Math.random() * rect.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: 1 + Math.random() * 1.5,
          });
        }
        starsRef.current = stars;
      }
    };
    resize();

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const stars = starsRef.current;
      const LINK_DIST = linkDistRef.current;
      const MOUSE_RADIUS = mouseRadiusRef.current;

      for (const s of stars) {
        const dx = s.x - mx;
        const dy = s.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_PUSH;
          s.vx += (dx / dist) * force;
          s.vy += (dy / dist) * force;
        }

        s.vx *= 0.98;
        s.vy *= 0.98;
        if (Math.abs(s.vx) < 0.1) s.vx += (Math.random() - 0.5) * 0.02;
        if (Math.abs(s.vy) < 0.1) s.vy += (Math.random() - 0.5) * 0.02;

        s.x += s.vx;
        s.y += s.vy;

        if (s.x < -10) s.x = w + 10;
        if (s.x > w + 10) s.x = -10;
        if (s.y < -10) s.y = h + 10;
        if (s.y > h + 10) s.y = -10;

        // Position-based color
        const [cr, cg, cb] = colorAt(s.x, s.y, w, h);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.35)`;
        ctx.fill();
      }

      // Links between nearby stars — gradient colored
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            const alpha = (1 - dist / LINK_DIST) * 0.15;
            const [r1, g1, b1] = colorAt(stars[i].x, stars[i].y, w, h);
            const [r2, g2, b2] = colorAt(stars[j].x, stars[j].y, w, h);

            const grad = ctx.createLinearGradient(stars[i].x, stars[i].y, stars[j].x, stars[j].y);
            grad.addColorStop(0, `rgba(${r1},${g1},${b1},${alpha})`);
            grad.addColorStop(1, `rgba(${r2},${g2},${b2},${alpha})`);

            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Mouse links — radiate from cursor in its local color
      if (mx > 0 && my > 0) {
        const [mr, mg, mb] = colorAt(mx, my, w, h);
        for (const s of stars) {
          const dx = s.x - mx;
          const dy = s.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS) {
            const alpha = (1 - dist / MOUSE_RADIUS) * 0.25;
            const [sr, sg, sb] = colorAt(s.x, s.y, w, h);

            const grad = ctx.createLinearGradient(mx, my, s.x, s.y);
            grad.addColorStop(0, `rgba(${mr},${mg},${mb},${alpha})`);
            grad.addColorStop(1, `rgba(${sr},${sg},${sb},${alpha * 0.5})`);

            ctx.beginPath();
            ctx.moveTo(mx, my);
            ctx.lineTo(s.x, s.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- props read via refs, loop must not restart
  }, []);

  const handleMouse = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? { pointerEvents: "auto" } : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "auto" }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; }}
    />
  );
}
