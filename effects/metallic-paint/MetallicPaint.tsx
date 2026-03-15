import { useEffect, useCallback } from "react";
import { useWebGL, useMousePosition } from "../../hooks";
import type { RGB } from "../../presets";

interface MetallicPaintProps {
  color?: RGB;
  brushAngle?: number;
  specular?: number;
  className?: string;
}

const DEFAULT_COLOR: RGB = [192, 192, 200];

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_color;
uniform float u_brush_angle;
uniform float u_specular;

// Simple hash-based noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float aspect = u_resolution.x / u_resolution.y;

  // Mouse → viewing angle (normalized -1 to 1)
  vec2 mouseNorm = u_mouse / u_resolution;
  mouseNorm = mouseNorm * 2.0 - 1.0;
  mouseNorm.x *= aspect;

  // View direction approximation from mouse
  vec3 viewDir = normalize(vec3(mouseNorm * 0.4, 1.0));
  vec3 normal = vec3(0.0, 0.0, 1.0);

  // Brush direction for anisotropy
  float bAngle = u_brush_angle;
  vec2 brushDir = vec2(cos(bAngle), sin(bAngle));

  // Pixel position in aspect-corrected space
  vec2 p = uv;
  p.x *= aspect;

  // Surface noise for imperfections — streaks along brush direction
  float streakCoord = dot(p * 20.0, vec2(-brushDir.y, brushDir.x));
  float surfaceNoise = noise(vec2(streakCoord, p.y * 3.0 + u_time * 0.02));
  surfaceNoise = surfaceNoise * 0.5 + noise(vec2(streakCoord * 2.0, p.x * 5.0)) * 0.5;

  // Anisotropic specular: half-vector projected onto brush tangent/bitangent
  vec3 lightDir = normalize(vec3(viewDir.x * 0.5, viewDir.y * 0.5, 1.0));
  vec3 halfVec = normalize(lightDir + viewDir);

  // Tangent and bitangent in surface space
  vec3 tangent = normalize(vec3(brushDir, 0.0));
  vec3 bitangent = normalize(vec3(-brushDir.y, brushDir.x, 0.0));

  float tDot = dot(halfVec, tangent);
  float bDot = dot(halfVec, bitangent);
  float normalDot = max(dot(normal, lightDir), 0.0);

  // Ward anisotropic BRDF approximation
  float alphaT = 0.1;  // tight along brush
  float alphaB = 0.4;  // wide across brush
  float exponent = -(tDot * tDot / (alphaT * alphaT) + bDot * bDot / (alphaB * alphaB));
  float anisotropicSpec = exp(exponent) * normalDot;

  // Add surface noise perturbation to specular
  float spec = anisotropicSpec * u_specular;
  spec *= (0.8 + surfaceNoise * 0.4);

  // Base metallic color with slight diffuse shading
  float diffuse = 0.3 + 0.7 * normalDot;
  vec3 baseColor = u_color * diffuse;

  // Metallic environment reflection tint — shifts with view
  float envReflect = smoothstep(0.2, 0.8, dot(viewDir, normal) * 0.5 + 0.5);
  vec3 reflectTint = mix(u_color * 0.5, u_color * 1.3, envReflect);

  // Final composite
  vec3 col = baseColor * 0.6 + reflectTint * 0.4 + vec3(spec);
  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function MetallicPaint({
  color = DEFAULT_COLOR,
  brushAngle = 0,
  specular = 0.8,
  className,
}: MetallicPaintProps) {
  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });
  const { position } = useMousePosition({ scope: "window" });

  const updateUniforms = useCallback(() => {
    setUniform("u_color", [color[0] / 255, color[1] / 255, color[2] / 255]);
    setUniform("u_brush_angle", brushAngle);
    setUniform("u_specular", specular);
  }, [color, brushAngle, specular, setUniform]);

  useEffect(() => {
    updateUniforms();
  }, [updateUniforms]);

  useEffect(() => startLoop(), [startLoop]);

  useEffect(() => {
    let animId = 0;
    const tick = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const pos = position.current;
        // Convert CSS coords to canvas pixel coords to match u_resolution
        const mx = pos.x < 0 ? rect.width * 0.5 : pos.x;
        const my = pos.y < 0 ? rect.height * 0.5 : pos.y;
        const dpr = canvas.width / rect.width;
        setUniform("u_mouse", [mx * dpr, my * dpr]);
      }
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [position, setUniform, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "absolute inset-0 w-full h-full"}
    />
  );
}
