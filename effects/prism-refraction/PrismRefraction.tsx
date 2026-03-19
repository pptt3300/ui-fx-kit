import { useEffect, useCallback, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";
import { useWebGL, useMousePosition } from "../../hooks";

interface PrismRefractionProps {
  strength?: number;
  dispersion?: number;
  children?: ReactNode;
  className?: string;
}

// When no texture is available we still show the chromatic split as a tint overlay
const FALLBACK_FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_strength;
uniform float u_dispersion;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  vec2 mouseUV = u_mouse / u_resolution;
  vec2 center = vec2(0.5, 0.5);

  vec2 toPixel = uv - mouseUV;
  float dist = length(toPixel);
  vec2 refractDir = dist > 0.001 ? normalize(toPixel) : vec2(0.0);

  // Prismatic rainbow fringe based on dispersion angle
  float angle = atan(refractDir.y, refractDir.x);
  float hue = fract(angle / (2.0 * 3.14159) + u_time * 0.05);

  // Simple HSV-to-RGB for rainbow
  vec3 rainbow = clamp(abs(mod(hue * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);

  // Intensity based on distance from mouse and strength
  float intensity = u_strength * smoothstep(0.5, 0.0, dist) * 0.6;

  gl_FragColor = vec4(rainbow * intensity, intensity * 0.8);
}
`;

export default function PrismRefraction({
  strength = 0.1,
  dispersion = 0.02,
  children,
  className,
}: PrismRefractionProps) {
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FALLBACK_FRAGMENT_SHADER });
  const { position } = useMousePosition({ scope: "window" });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateUniforms = useCallback(() => {
    setUniform("u_strength", strength);
    setUniform("u_dispersion", dispersion);
  }, [strength, dispersion, setUniform]);

  useEffect(() => {
    updateUniforms();
  }, [updateUniforms]);

  useEffect(() => startLoop(), [startLoop]);

  useEffect(() => {
    let animId = 0;
    const tick = () => {
      const pos = position.current;
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const mx = pos.x < 0 ? canvas.width * 0.5 : (pos.x - rect.left) * dpr;
        const my = pos.y < 0 ? canvas.height * 0.5 : (pos.y - rect.top) * dpr;
        setUniform("u_mouse", [mx, my]);
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [position, setUniform, canvasRef]);

  const containerStyle: CSSProperties = {
    position: "relative",
    overflow: "hidden",
  };

  const canvasStyle: CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    mixBlendMode: "screen",
  };

  if (!children) {
    return (
      <canvas
        ref={canvasRef}
        className={className}
        style={className ? { mixBlendMode: "screen" } : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", mixBlendMode: "screen" }}
      />
    );
  }

  return (
    <div ref={containerRef} className={className} style={containerStyle}>
      {children}
      <canvas ref={canvasRef} style={canvasStyle} />
    </div>
  );
}
