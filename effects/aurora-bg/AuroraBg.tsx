import { useRef, useEffect } from "react";

export default function AuroraBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.setTransform(2, 0, 0, 2, 0, 0);
    };
    resize();

    // Very slow, gentle aurora bands
    const bands = [
      { color: [99, 102, 241], alpha: 0.035, yOffset: 0.3,  amplitude: 40, frequency: 0.002,  speed: 0.08,  phase: 0 },
      { color: [139, 92, 246], alpha: 0.03,  yOffset: 0.45, amplitude: 35, frequency: 0.0025, speed: -0.06, phase: 2 },
      { color: [34, 211, 238],  alpha: 0.025, yOffset: 0.55, amplitude: 30, frequency: 0.003,  speed: 0.1,   phase: 4 },
      { color: [167, 139, 250], alpha: 0.02,  yOffset: 0.35, amplitude: 45, frequency: 0.0015, speed: -0.04, phase: 1 },
    ];

    let t = 0;

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      for (const band of bands) {
        ctx.beginPath();

        const baseY = h * band.yOffset;
        ctx.moveTo(0, h);

        for (let x = 0; x <= w; x += 4) {
          const y = baseY
            + Math.sin(x * band.frequency + t * band.speed + band.phase) * band.amplitude
            + Math.sin(x * band.frequency * 0.4 + t * band.speed * 0.7 + band.phase * 1.5) * band.amplitude * 0.5;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, baseY - band.amplitude, 0, h);
        grad.addColorStop(0, `rgba(${band.color[0]},${band.color[1]},${band.color[2]},${band.alpha})`);
        grad.addColorStop(0.4, `rgba(${band.color[0]},${band.color[1]},${band.color[2]},${band.alpha * 0.5})`);
        grad.addColorStop(1, `rgba(${band.color[0]},${band.color[1]},${band.color[2]},0)`);

        ctx.fillStyle = grad;
        ctx.fill();
      }

      t += 0.016; // ~1 per second at 60fps, very slow drift
      animRef.current = requestAnimationFrame(animate);
    };

    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
