import { useEffect, useRef } from "react";
import type { RGB } from "../../presets/colors";
import { resolvePalette } from "../../presets/resolve";

interface MetallicPaintProps {
  palette?: string;
  color?: RGB;
  brushAngle?: number;
  specular?: number;
  className?: string;
}

const DEFAULT_COLOR: RGB = [192, 192, 200];

const VERTEX = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform vec3 u_color;
uniform float u_brush_angle;
uniform float u_specular;

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

  vec2 mouseNorm = u_mouse / u_resolution;
  mouseNorm = mouseNorm * 2.0 - 1.0;
  mouseNorm.x *= aspect;

  vec3 viewDir = normalize(vec3(mouseNorm * 0.4, 1.0));
  vec3 normal = vec3(0.0, 0.0, 1.0);

  vec2 brushDir = vec2(cos(u_brush_angle), sin(u_brush_angle));

  vec2 p = uv;
  p.x *= aspect;

  float streakCoord = dot(p * 20.0, vec2(-brushDir.y, brushDir.x));
  float surfaceNoise = noise(vec2(streakCoord, p.y * 3.0 + u_time * 0.02));
  surfaceNoise = surfaceNoise * 0.5 + noise(vec2(streakCoord * 2.0, p.x * 5.0)) * 0.5;

  vec3 lightDir = normalize(vec3(viewDir.x * 0.5, viewDir.y * 0.5, 1.0));
  vec3 halfVec = normalize(lightDir + viewDir);

  vec3 tangent = normalize(vec3(brushDir, 0.0));
  vec3 bitangent = normalize(vec3(-brushDir.y, brushDir.x, 0.0));

  float tDot = dot(halfVec, tangent);
  float bDot = dot(halfVec, bitangent);
  float normalDot = max(dot(normal, lightDir), 0.0);

  float alphaT = 0.1;
  float alphaB = 0.4;
  float exponent = -(tDot * tDot / (alphaT * alphaT) + bDot * bDot / (alphaB * alphaB));
  float anisotropicSpec = exp(exponent) * normalDot;

  float spec = anisotropicSpec * u_specular;
  spec *= (0.8 + surfaceNoise * 0.4);

  float diffuse = 0.3 + 0.7 * normalDot;
  vec3 baseColor = u_color * diffuse;

  float envReflect = smoothstep(0.2, 0.8, dot(viewDir, normal) * 0.5 + 0.5);
  vec3 reflectTint = mix(u_color * 0.5, u_color * 1.3, envReflect);

  vec3 col = baseColor * 0.6 + reflectTint * 0.4 + vec3(spec);
  col = clamp(col, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
`;

export default function MetallicPaint({
  palette,
  color,
  brushAngle = 0,
  specular = 0.8,
  className,
}: MetallicPaintProps) {
  const resolvedColor = color ?? resolvePalette(palette, 'accent', DEFAULT_COLOR);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false });
    if (!gl) return;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("MetallicPaint shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };

    const vs = compile(VERTEX, gl.VERTEX_SHADER);
    const fs = compile(FRAGMENT, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("MetallicPaint link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uColor = gl.getUniformLocation(prog, "u_color");
    const uBrush = gl.getUniformLocation(prog, "u_brush_angle");
    const uSpec = gl.getUniformLocation(prog, "u_specular");

    gl.uniform3f(uColor, resolvedColor[0] / 255, resolvedColor[1] / 255, resolvedColor[2] / 255);
    gl.uniform1f(uBrush, brushAngle);
    gl.uniform1f(uSpec, specular);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const mouse = { x: canvas.width * 0.5, y: canvas.height * 0.5 };
    const onMove = (e: MouseEvent) => {
      const dpr = window.devicePixelRatio || 1;
      mouse.x = e.clientX * dpr;
      mouse.y = e.clientY * dpr;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", resize);

    let animId = 0;
    const start = performance.now();
    const loop = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [resolvedColor, brushAngle, specular]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? undefined : { position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
