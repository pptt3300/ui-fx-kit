import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  size: number;
  colorIdx: number;
}

interface Ghost {
  x: number;
  y: number;
  size: number;
  color: [number, number, number];
  alpha: number;
}

function gradientColor(t: number): [number, number, number] {
  const left: [number, number, number] = [99, 102, 241];
  const mid: [number, number, number] = [139, 92, 246];
  const right: [number, number, number] = [34, 211, 238];

  let r: number, g: number, b: number;
  if (t < 0.5) {
    const s = t * 2;
    r = left[0] + (mid[0] - left[0]) * s;
    g = left[1] + (mid[1] - left[1]) * s;
    b = left[2] + (mid[2] - left[2]) * s;
  } else {
    const s = (t - 0.5) * 2;
    r = mid[0] + (right[0] - mid[0]) * s;
    g = mid[1] + (right[1] - mid[1]) * s;
    b = mid[2] + (right[2] - mid[2]) * s;
  }
  return [Math.round(r), Math.round(g), Math.round(b)];
}

interface Props {
  text: string;
  collapsed: boolean;
}

export default function ParticleTitle({ text, collapsed }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const ghostsRef = useRef<Ghost[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);
  const collapsedRef = useRef(collapsed);
  const frameRef = useRef(0);
  useEffect(() => { collapsedRef.current = collapsed; });

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.setTransform(2, 0, 0, 2, 0, 0);

    const fontSize = Math.min(rect.width / (text.length * 0.58), 52);
    ctx.fillStyle = "#000";
    ctx.font = `800 ${fontSize}px "Inter", "SF Pro Display", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, rect.width / 2, rect.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles: Particle[] = [];
    const gap = 3;

    for (let y = 0; y < canvas.height; y += gap) {
      for (let x = 0; x < canvas.width; x += gap) {
        const i = (y * canvas.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          const px = x / 2;
          const py = y / 2;
          // Scatter from far away for entrance animation
          const angle = Math.random() * Math.PI * 2;
          const dist = 200 + Math.random() * 300;
          particles.push({
            x: px + Math.cos(angle) * dist,
            y: py + Math.sin(angle) * dist,
            originX: px,
            originY: py,
            vx: 0,
            vy: 0,
            size: 1.0 + Math.random() * 0.8,
            colorIdx: rect.width > 0 ? px / rect.width : 0,
          });
        }
      }
    }
    particlesRef.current = particles;
    ghostsRef.current = [];
  }, [text]);

  useEffect(() => {
    initParticles();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      ctx.clearRect(0, 0, w, rect.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const isCollapsed = collapsedRef.current;
      const radius = 70;
      const springK = isCollapsed ? 0.15 : 0.045;
      const damping = isCollapsed ? 0.82 : 0.88;
      const ghosts = ghostsRef.current;
      frameRef.current++;

      // Draw and fade ghosts (trails)
      for (let i = ghosts.length - 1; i >= 0; i--) {
        const g = ghosts[i];
        g.alpha *= 0.88;
        if (g.alpha < 0.02) {
          ghosts.splice(i, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${g.color[0]},${g.color[1]},${g.color[2]},${g.alpha})`;
        ctx.fill();
      }

      // Update and draw particles
      for (const p of particlesRef.current) {
        const prevX = p.x;
        const prevY = p.y;

        if (!isCollapsed) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < radius) {
            const force = (radius - dist) / radius;
            const angle = Math.atan2(dy, dx);
            p.vx -= Math.cos(angle) * force * 5;
            p.vy -= Math.sin(angle) * force * 5;
          }
        }

        p.vx += (p.originX - p.x) * springK;
        p.vy += (p.originY - p.y) * springK;
        p.vx *= damping;
        p.vy *= damping;
        p.x += p.vx;
        p.y += p.vy;

        const displacement = Math.sqrt(
          (p.x - p.originX) ** 2 + (p.y - p.originY) ** 2
        );

        const currentT = w > 0 ? Math.max(0, Math.min(1, p.x / w)) : p.colorIdx;
        const [cr, cg, cb] = gradientColor(currentT);

        // Spawn ghost trail when moving fast
        const speed = Math.sqrt((p.x - prevX) ** 2 + (p.y - prevY) ** 2);
        if (speed > 1.5 && !isCollapsed && frameRef.current % 2 === 0) {
          ghosts.push({
            x: prevX,
            y: prevY,
            size: p.size,
            color: [cr, cg, cb],
            alpha: Math.min(0.4, speed * 0.05),
          });
        }

        const alpha = isCollapsed
          ? Math.min(1, 0.7 + (1 - Math.min(displacement / 20, 1)) * 0.3)
          : 0.75 + Math.min(displacement / 25, 0.25);

        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect on fast-moving particles
        if (speed > 3 && !isCollapsed) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${Math.min(0.12, speed * 0.01)})`;
          ctx.fill();
        }
      }

      // Cap ghost count
      if (ghosts.length > 2000) {
        ghosts.splice(0, ghosts.length - 2000);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => initParticles();
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [initParticles]);

  const handleMouse = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full transition-opacity duration-500"
      style={{ height: 72, cursor: collapsed ? "default" : "crosshair" }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; }}
    />
  );
}
