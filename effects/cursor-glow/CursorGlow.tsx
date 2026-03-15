import { useRef, useEffect } from "react";

interface Trail {
  x: number;
  y: number;
  age: number;
  vx: number;
  vy: number;
  size: number;
  color: [number, number, number];
}

const COLORS: [number, number, number][] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [167, 139, 250],
  [129, 140, 248],
];

export default function CursorGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100 });
  const prevMouseRef = useRef({ x: -100, y: -100 });
  const trailsRef = useRef<Trail[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    };
    resize();

    const onMouseMove = (e: MouseEvent) => {
      prevMouseRef.current = { ...mouseRef.current };
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const px = prevMouseRef.current.x;
      const py = prevMouseRef.current.y;
      const speed = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);

      // Spawn trail particles based on movement speed
      const spawnCount = Math.min(Math.floor(speed * 0.4), 6);
      for (let i = 0; i < spawnCount; i++) {
        const angle = Math.atan2(my - py, mx - px) + (Math.random() - 0.5) * 2;
        const v = speed * 0.15 + Math.random() * 1.5;
        trailsRef.current.push({
          x: mx + (Math.random() - 0.5) * 4,
          y: my + (Math.random() - 0.5) * 4,
          age: 0,
          vx: -Math.cos(angle) * v + (Math.random() - 0.5) * 0.5,
          vy: -Math.sin(angle) * v + (Math.random() - 0.5) * 0.5 - 0.3,
          size: 1.5 + Math.random() * 2.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }

      // Update and draw trails
      const trails = trailsRef.current;
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        t.age += 1;
        t.x += t.vx;
        t.y += t.vy;
        t.vx *= 0.96;
        t.vy *= 0.96;
        t.size *= 0.985;

        const maxAge = 50;
        if (t.age > maxAge || t.size < 0.2) {
          trails.splice(i, 1);
          continue;
        }

        const life = 1 - t.age / maxAge;
        const alpha = life * life * 0.6;

        ctx.beginPath();
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${t.color[0]},${t.color[1]},${t.color[2]},${alpha})`;
        ctx.fill();
      }

      // Main cursor glow
      if (mx > 0 && my > 0) {
        const glowRadius = 20 + Math.min(speed * 0.3, 15);
        const grad = ctx.createRadialGradient(mx, my, 0, mx, my, glowRadius);
        grad.addColorStop(0, "rgba(139,92,246,0.15)");
        grad.addColorStop(0.4, "rgba(99,102,241,0.06)");
        grad.addColorStop(1, "rgba(34,211,238,0)");
        ctx.beginPath();
        ctx.arc(mx, my, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Tiny bright center dot
        ctx.beginPath();
        ctx.arc(mx, my, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
