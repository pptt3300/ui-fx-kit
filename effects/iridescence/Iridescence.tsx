import { useEffect, useCallback, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";
import { useWebGL, useMousePosition } from "../../hooks";

interface IridescenceProps {
  intensity?: number;
  children?: ReactNode;
  className?: string;
}

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_intensity;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  // Mouse → viewing angle
  vec2 mouseNorm = u_mouse / u_resolution;
  mouseNorm = mouseNorm * 2.0 - 1.0;

  // Center-relative vector for each pixel
  vec2 center = vec2(0.5 * aspect, 0.5);
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 toPixel = p - center;

  // Viewing angle varies with mouse + pixel position
  float viewAngle = length(mouseNorm) * 1.5 + length(toPixel) * 0.8;
  viewAngle += u_time * 0.1;

  // Thin-film interference: each RGB channel at slightly different thickness
  float thickness = 3.0 + u_intensity * 4.0;
  float r = cos(viewAngle * thickness * 1.0) * 0.5 + 0.5;
  float g = cos(viewAngle * thickness * 1.3 + 2.094) * 0.5 + 0.5;
  float b = cos(viewAngle * thickness * 1.7 + 4.189) * 0.5 + 0.5;

  // Gentle mouse-based tilt: shift angle by mouse direction
  float mouseTilt = dot(normalize(mouseNorm + vec2(0.001)), normalize(toPixel + vec2(0.001)));
  float tiltMix = mouseTilt * 0.5 + 0.5;
  r = mix(r, 1.0 - r, tiltMix * 0.3);
  b = mix(b, 1.0 - b, tiltMix * 0.3);

  vec3 col = vec3(r, g, b);
  col = mix(vec3(0.5), col, u_intensity);

  // Semi-transparent overlay
  float alpha = 0.55 * u_intensity;
  gl_FragColor = vec4(col, alpha);
}
`;

export default function Iridescence({
  intensity = 1,
  children,
  className,
}: IridescenceProps) {
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });
  const { position } = useMousePosition({ scope: "window" });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateUniforms = useCallback(() => {
    setUniform("u_intensity", intensity);
  }, [intensity, setUniform]);

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
        setUniform("u_mouse", [pos.x - rect.left, pos.y - rect.top]);
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
        className={className ?? "absolute inset-0 w-full h-full pointer-events-none"}
        style={{ mixBlendMode: "screen" }}
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
