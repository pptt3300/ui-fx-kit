import "../../css/glitch-effect.css";
import { useMousePosition } from "../hooks";

interface GlitchTextProps {
  text: string;
  intensity?: number;
  mode?: "continuous" | "hover";
  hoverMultiplier?: number;
  className?: string;
}

export default function GlitchText({
  text,
  intensity = 0.5,
  mode = "continuous",
  hoverMultiplier = 2,
  className,
}: GlitchTextProps) {
  const { position, handlers } = useMousePosition({ scope: "element", mode: "state" });
  const mousePos = position as { x: number; y: number };

  // Compute direction from element center to mouse (normalized -1..1)
  const dx = mousePos.x === -9999 ? 0 : (mousePos.x - 100) / 100;
  const dy = mousePos.y === -9999 ? 0 : (mousePos.y - 20) / 20;

  const isHovered = mousePos.x !== -9999;
  const activeIntensity = mode === "hover"
    ? (isHovered ? intensity * hoverMultiplier : 0)
    : intensity;

  const style: React.CSSProperties = {
    "--glitch-intensity": activeIntensity,
    "--glitch-dx": `${dx * 4}px`,
    "--glitch-dy": `${dy * 2}px`,
  } as React.CSSProperties;

  return (
    <span
      className={`fx-glitch${className ? ` ${className}` : ""}`}
      data-text={text}
      style={style}
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
    >
      {text}
    </span>
  );
}
