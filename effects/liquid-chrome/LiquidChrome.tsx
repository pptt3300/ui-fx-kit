import { useEffect, useCallback } from "react";
import { useWebGL } from "../../hooks";
import type { RGB } from "../../presets/colors";
import { resolvePalette } from "../../presets/resolve";

interface LiquidChromeProps {
  speed?: number;
  mouseStrength?: number;
  palette?: string;
  baseColor?: RGB;
  highlightColor?: RGB;
  shadowColor?: RGB;
  accentColor?: RGB;
  className?: string;
}

const DEFAULT_BASE: RGB = [140, 140, 153];
const DEFAULT_HIGHLIGHT: RGB = [230, 235, 255];
const DEFAULT_SHADOW: RGB = [26, 26, 38];
const DEFAULT_ACCENT: RGB = [115, 128, 204];

const FRAGMENT_SHADER = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_mouseStrength;
uniform vec3 u_base;
uniform vec3 u_highlight;
uniform vec3 u_shadow;
uniform vec3 u_accent;

// Hash noise
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i),            hash(i + vec2(1,0)), u.x),
    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

// Metallic environment gradient lookup
vec3 envGradient(vec2 r) {
  vec3 base = u_base;
  vec3 highlight = u_highlight;
  vec3 shadow = u_shadow;
  vec3 accent = u_accent;

  float t = r.x * 0.5 + 0.5;
  float s = r.y * 0.5 + 0.5;

  vec3 col = mix(shadow, highlight, t);
  col = mix(col, accent, smoothstep(0.4, 0.6, s) * 0.4);
  col = mix(col, base, 0.3);
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  float t = u_time * u_speed;

  // Mouse ripple distortion
  vec2 mouseUV = u_mouse / u_resolution;
  mouseUV.y = 1.0 - mouseUV.y;
  float mouseDist = distance(uv, mouseUV);
  float ripple = u_mouseStrength * sin(mouseDist * 30.0 - t * 5.0) * smoothstep(0.4, 0.0, mouseDist) * 0.03;
  vec2 distortedUV = uv + vec2(ripple);

  // Compute surface normals from noise
  float eps = 0.002;
  float nx = fbm(distortedUV * 3.0 + vec2(t, 0.0));
  float ny = fbm(distortedUV * 3.0 + vec2(0.0, t) + 100.0);
  float nx2 = fbm((distortedUV + vec2(eps, 0.0)) * 3.0 + vec2(t, 0.0));
  float ny2 = fbm((distortedUV + vec2(0.0, eps)) * 3.0 + vec2(0.0, t) + 100.0);

  vec2 n = vec2(nx2 - nx, ny2 - ny) / eps;
  n = n * 2.0 - 1.0;
  vec3 normal = normalize(vec3(n * 1.5, 1.0));

  // Fake view direction (orthographic, slightly tilted)
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));

  // Reflection vector
  vec3 reflectDir = reflect(-viewDir, normal);

  // Environment lookup
  vec3 envColor = envGradient(reflectDir.xy);

  // Metallic specular highlight
  float spec = pow(max(dot(reflectDir, viewDir), 0.0), 32.0);
  vec3 specColor = vec3(1.0, 1.0, 1.0) * spec * 0.5;

  // Fresnel-like edge darkening
  float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.0);
  vec3 fresnelColor = u_accent * fresnel * 0.5;

  vec3 finalColor = envColor + specColor + fresnelColor;

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function LiquidChrome({
  speed = 0.5,
  mouseStrength = 0.3,
  palette,
  baseColor,
  highlightColor,
  shadowColor,
  accentColor,
  className,
}: LiquidChromeProps) {
  const resolvedBase = baseColor ?? resolvePalette(palette, 'surface', DEFAULT_BASE);
  const resolvedHighlight = highlightColor ?? resolvePalette(palette, 'text', DEFAULT_HIGHLIGHT);
  const resolvedShadow = shadowColor ?? resolvePalette(palette, 'muted', DEFAULT_SHADOW);
  const resolvedAccent = accentColor ?? resolvePalette(palette, 'accent', DEFAULT_ACCENT);

  const { canvasRef, setUniform, startLoop } = useWebGL({ fragmentShader: FRAGMENT_SHADER });

  const updateUniforms = useCallback(() => {
    setUniform("u_speed", speed);
    setUniform("u_mouseStrength", mouseStrength);
    setUniform("u_base", [resolvedBase[0] / 255, resolvedBase[1] / 255, resolvedBase[2] / 255]);
    setUniform("u_highlight", [resolvedHighlight[0] / 255, resolvedHighlight[1] / 255, resolvedHighlight[2] / 255]);
    setUniform("u_shadow", [resolvedShadow[0] / 255, resolvedShadow[1] / 255, resolvedShadow[2] / 255]);
    setUniform("u_accent", [resolvedAccent[0] / 255, resolvedAccent[1] / 255, resolvedAccent[2] / 255]);
  }, [speed, mouseStrength, resolvedBase, resolvedHighlight, resolvedShadow, resolvedAccent, setUniform]);

  useEffect(() => {
    updateUniforms();
  }, [updateUniforms]);

  useEffect(() => {
    const cleanup = startLoop();
    return cleanup;
  }, [startLoop]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const dpr = window.devicePixelRatio || 1;
      setUniform("u_mouse", [e.clientX * dpr, e.clientY * dpr]);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [setUniform]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? undefined : { position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  );
}
