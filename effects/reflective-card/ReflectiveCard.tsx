import { useState } from "react";
import { useTilt3D, useMousePosition } from "../../hooks";
import "../../css/iridescent.css";

interface ReflectiveCardProps {
  children: React.ReactNode;
  type?: "glass" | "metallic";
  tiltMax?: number;
  className?: string;
}

export default function ReflectiveCard({
  children,
  type = "glass",
  tiltMax = 10,
  className = "",
}: ReflectiveCardProps) {
  const { ref, shineRef, handlers: tiltHandlers } = useTilt3D({
    maxRotation: tiltMax,
    stiffness: 250,
    damping: 28,
    shine: false,
  });

  const { position, handlers: mouseHandlers } = useMousePosition({
    scope: "element",
    mode: "state",
  });
  const [dims, setDims] = useState({ w: 300, h: 200 });

  const pos = position as { x: number; y: number };
  const nx = (pos?.x ?? dims.w / 2) / dims.w;
  const ny = (pos?.y ?? dims.h / 2) / dims.h;

  // Angle from center, 0–360
  const angle = Math.atan2(ny - 0.5, nx - 0.5) * (180 / Math.PI) + 180;

  const reflectionStyle: React.CSSProperties =
    type === "glass"
      ? {
          background: `radial-gradient(ellipse at ${nx * 100}% ${ny * 100}%, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 50%, transparent 70%)`,
          backdropFilter: "blur(0px)",
        }
      : {
          background: `linear-gradient(${angle}deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.0) 100%)`,
        };

  const baseStyle: React.CSSProperties =
    type === "glass"
      ? {
          background: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.18)",
        }
      : {
          background: "linear-gradient(135deg, #1c1c2e 0%, #2a2a3e 50%, #1c1c2e 100%)",
          border: "1px solid rgba(255,255,255,0.12)",
        };

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
      className={type === "metallic" ? `fx-iridescent ${className}` : className}
      style={{
        ...baseStyle,
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        willChange: "transform",
        ...(type === "metallic"
          ? { "--iri-angle": `${angle}deg` } as React.CSSProperties
          : {}),
      }}
    >
      {/* Reflection overlay */}
      <div
        ref={shineRef}
        style={{
          ...reflectionStyle,
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          borderRadius: "inherit",
          transition: "background 0.05s linear",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
