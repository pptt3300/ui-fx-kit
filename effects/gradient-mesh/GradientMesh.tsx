import { useEffect, useRef } from "react";
import { useGradientMesh } from "../../hooks";
import type { RGB } from "../../presets/colors";

interface GradientMeshProps {
  count?: number;
  colors?: RGB[];
  speed?: number;
  className?: string;
}

export default function GradientMesh({
  count = 4,
  colors,
  speed = 0.3,
  className,
}: GradientMeshProps) {
  const resolvedColors = colors ?? undefined;

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
