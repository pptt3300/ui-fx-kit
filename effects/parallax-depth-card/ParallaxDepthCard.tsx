import { useState } from "react";
import { useTilt3D, useMousePosition } from "../../hooks";

interface ParallaxDepthCardProps {
  layers: React.ReactNode[];
  depthScale?: number;
  tilt?: boolean;
  className?: string;
}

export default function ParallaxDepthCard({
  layers,
  depthScale = 10,
  tilt = true,
  className = "",
}: ParallaxDepthCardProps) {
  const { ref, shineRef, handlers: tiltHandlers } = useTilt3D({
    maxRotation: tilt ? 12 : 0,
    stiffness: 250,
    damping: 28,
  });

  const { position, handlers: mouseHandlers } = useMousePosition({
    scope: "element",
    mode: "state",
  });
  const [dims, setDims] = useState({ w: 300, h: 200 });

  const pos = position as { x: number; y: number };
  const nx = (pos?.x ?? dims.w / 2) / dims.w - 0.5;
  const ny = (pos?.y ?? dims.h / 2) / dims.h - 0.5;

  return (
    <div
      ref={ref}
      {...tiltHandlers}
      onMouseMove={(e) => {
        tiltHandlers.onMouseMove(e);
        mouseHandlers.onMouseMove(e);
        if (ref.current) {
          setDims({ w: ref.current.offsetWidth || 300, h: ref.current.offsetHeight || 200 });
        }
      }}
      onMouseLeave={() => {
        tiltHandlers.onMouseLeave();
        mouseHandlers.onMouseLeave();
      }}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
        willChange: "transform",
        borderRadius: "16px",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {layers.map((layer, i) => {
        // Layer 0 = deepest (moves least), last = top (moves most)
        const depth = (i + 1) / layers.length;
        const dx = nx * depthScale * depth;
        const dy = ny * depthScale * depth;
        return (
          <div
            key={i}
            style={{
              position: i === 0 ? "relative" : "absolute",
              inset: i === 0 ? undefined : 0,
              zIndex: i + 1,
              transform: `translate(${dx}px, ${dy}px)`,
              pointerEvents: i === layers.length - 1 ? "auto" : "none",
              willChange: "transform",
            }}
          >
            {layer}
          </div>
        );
      })}

      <div
        ref={shineRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: layers.length + 1,
          borderRadius: "inherit",
        }}
      />
    </div>
  );
}
