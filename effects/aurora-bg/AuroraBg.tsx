import { useEffect, useRef } from "react";
import { useCanvasSetup } from "../../hooks";
import type { RGB } from "../../presets";

interface AuroraBgProps {
  speed?: number;    // multiplier on animation speed, default 1
  colors?: RGB[];    // band colors, default [[99,102,241],[139,92,246],[34,211,238],[167,139,250]]
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [167, 139, 250],
];

const BANDS_META = [
  { alpha: 0.25, yOffset: 0.3,  amplitude: 40, frequency: 0.002,  speed: 0.08,  phase: 0 },
  { alpha: 0.2,  yOffset: 0.45, amplitude: 35, frequency: 0.0025, speed: -0.06, phase: 2 },
  { alpha: 0.18, yOffset: 0.55, amplitude: 30, frequency: 0.003,  speed: 0.1,   phase: 4 },
  { alpha: 0.15, yOffset: 0.35, amplitude: 45, frequency: 0.0015, speed: -0.04, phase: 1 },
];

export default function AuroraBg({ speed = 1, colors = DEFAULT_COLORS, className }: AuroraBgProps) {
  const { canvasRef, startLoop } = useCanvasSetup({ dpr: 2 });
  const tRef = useRef(0);
  const propsRef = useRef({ speed, colors });
  useEffect(() => { propsRef.current = { speed, colors }; });

  useEffect(() => {
    return startLoop((ctx) => {
      const { speed: s, colors: c } = propsRef.current;
      const canvas = ctx.canvas;
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      ctx.clearRect(0, 0, w, h);

      const t = tRef.current;

      for (let i = 0; i < BANDS_META.length; i++) {
        const band = BANDS_META[i];
        const color = c[i] ?? c[0];
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
        grad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},${band.alpha})`);
        grad.addColorStop(0.4, `rgba(${color[0]},${color[1]},${color[2]},${band.alpha * 0.5})`);
        grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);

        ctx.fillStyle = grad;
        ctx.fill();
      }

      tRef.current += 0.016 * s;
    });
  }, [startLoop]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? undefined : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
