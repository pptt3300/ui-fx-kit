import { useEffect, useRef } from "react";
import { useGradientMesh } from "../../hooks";
import type { RGB } from "../../presets/colors";
import { resolvePalette } from "../../presets/resolve";

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [167, 139, 250],
];

interface GradientMeshProps {
  count?: number;
  palette?: string;
  colors?: RGB[];
  speed?: number;
  className?: string;
}

export default function GradientMesh({
  count = 4,
  palette,
  colors,
  speed = 0.3,
  className,
}: GradientMeshProps) {
  const resolvedColors = colors ?? resolvePalette(palette, 'background', DEFAULT_COLORS);

  const mesh = useGradientMesh({ count, colors: resolvedColors, speed });
  const divRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const loop = (now: number) => {
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      mesh.tick(dt);
      el.style.background = mesh.toCSS();
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mesh]);

  return (
    <div
      ref={divRef}
      className={className}
      style={className ? undefined : { position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
