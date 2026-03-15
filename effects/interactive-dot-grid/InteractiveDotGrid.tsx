import { useRef, useEffect } from "react";

export default function InteractiveDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cols: number, rows: number;
    const gap = 28;
    const dotRadius = 1.5;
    const influenceRadius = 120;
    const maxDisplacement = 14;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      cols = Math.floor(rect.width / gap);
      rows = Math.floor(rect.height / gap);
    };
    resize();

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const offsetX = (rect.width - (cols - 1) * gap) / 2;
      const offsetY = (rect.height - (rows - 1) * gap) / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const baseX = offsetX + col * gap;
          const baseY = offsetY + row * gap;

          const dx = mx - baseX;
          const dy = my - baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let drawX = baseX;
          let drawY = baseY;
          let scale = 1;
          let alpha = 0.2;

          if (dist < influenceRadius) {
            const force = 1 - dist / influenceRadius;
            const easedForce = force * force; // quadratic easing
            const angle = Math.atan2(dy, dx);

            // push away from cursor
            drawX -= Math.cos(angle) * easedForce * maxDisplacement;
            drawY -= Math.sin(angle) * easedForce * maxDisplacement;
            scale = 1 + easedForce * 2;
            alpha = 0.2 + easedForce * 0.8;
          }

          // color based on position
          const hue = 240 + (col / cols) * 40 + (row / rows) * 20;

          ctx.beginPath();
          ctx.arc(drawX, drawY, dotRadius * scale, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
          ctx.fill();

          // draw connecting lines to nearby displaced dots
          if (dist < influenceRadius && dist > 0) {
            // connect to right neighbor
            if (col < cols - 1) {
              const nx = offsetX + (col + 1) * gap;
              const ny = baseY;
              const ndx = mx - nx;
              const ndy = my - ny;
              const ndist = Math.sqrt(ndx * ndx + ndy * ndy);
              if (ndist < influenceRadius) {
                const nForce = 1 - ndist / influenceRadius;
                const nEased = nForce * nForce;
                const nAngle = Math.atan2(ndy, ndx);
                const nnx = nx - Math.cos(nAngle) * nEased * maxDisplacement;
                const nny = ny - Math.sin(nAngle) * nEased * maxDisplacement;

                ctx.beginPath();
                ctx.moveTo(drawX, drawY);
                ctx.lineTo(nnx, nny);
                ctx.strokeStyle = `hsla(${hue}, 70%, 60%, ${Math.min(alpha, 0.15)})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
              }
            }
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
  }, []);

  const handleMouse = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-500 mb-2 tracking-widest uppercase">05 / Interactive Grid</h2>
        <p className="text-slate-500 mb-8 max-w-lg">
          A grid of dots that reacts to cursor proximity. Each dot is displaced away from the cursor with quadratic easing, and connecting lines form between nearby affected dots.
        </p>
        <div className="rounded-2xl bg-slate-950 overflow-hidden shadow-xl">
          <canvas
            ref={canvasRef}
            className="w-full cursor-crosshair"
            style={{ height: 400 }}
            onMouseMove={handleMouse}
            onMouseLeave={() => { mouseRef.current = { x: -9999, y: -9999 }; }}
          />
        </div>
      </div>
    </section>
  );
}
