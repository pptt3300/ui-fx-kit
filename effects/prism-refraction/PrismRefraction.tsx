import { useEffect, useCallback, useRef } from "react";
import type { ReactNode, CSSProperties } from "react";
import { useWebGL, useMousePosition } from "../../hooks";

interface PrismRefractionProps {
  strength?: number;
  dispersion?: number;
  children?: ReactNode;
  className?: string;
}

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_strength;
uniform float u_dispersion;
uniform sampler2D u_texture;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  // Flip Y for canvas coordinate system
  vec2 texUV = vec2(uv.x, 1.0 - uv.y);

  float aspect = u_resolution.x / u_resolution.y;

  // Mouse position in normalized UV space
  vec2 mouseUV = u_mouse / u_resolution;
  mouseUV.y = 1.0 - mouseUV.y;

  // Direction from mouse (prism position) to pixel
  vec2 toPixel = texUV - mouseUV;
  float dist = length(toPixel);

  // Refraction offset direction — radiates from mouse/prism position
  vec2 refractDir = dist > 0.001 ? normalize(toPixel) : vec2(0.0);

  // Chromatic aberration: each channel offset by slightly different amount
  float baseOffset = u_strength * smoothstep(0.8, 0.0, dist);

  vec2 offsetR = refractDir * (baseOffset - u_dispersion);
  vec2 offsetG = refractDir * baseOffset;
  vec2 offsetB = refractDir * (baseOffset + u_dispersion);

  // Edge-of-screen falloff to prevent wrapping artifacts
  float edgeFade = smoothstep(0.0, 0.05, texUV.x)
    * smoothstep(1.0, 0.95, texUV.x)
    * smoothstep(0.0, 0.05, texUV.y)
    * smoothstep(1.0, 0.95, texUV.y);

  offsetR *= edgeFade;
  offsetG *= edgeFade;
  offsetB *= edgeFade;

  float r = texture2D(u_texture, clamp(texUV + offsetR, 0.0, 1.0)).r;
  float g = texture2D(u_texture, clamp(texUV + offsetG, 0.0, 1.0)).g;
  float b = texture2D(u_texture, clamp(texUV + offsetB, 0.0, 1.0)).b;
  float a = texture2D(u_texture, texUV).a;

  gl_FragColor = vec4(r, g, b, a);
}
`;

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
