import { useEffect, useRef } from "react";
import type { RGB } from "../../presets/colors";
import { resolvePalette } from "../../presets/resolve";

interface SilkWavesProps {
  strandCount?: number;
  amplitude?: number;
  mouseReactive?: boolean;
  palette?: string;
  colors?: RGB[];
  className?: string;
}

const DEFAULT_COLORS: RGB[] = [
  [99, 102, 241],
  [139, 92, 246],
  [34, 211, 238],
  [167, 139, 250],
  [244, 114, 182],
];

const VERTEX = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT = `
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_strandCount;
uniform float u_amplitude;
uniform vec3 u_c0, u_c1, u_c2, u_c3, u_c4;
uniform float u_mouseReactive;

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

vec3 getColor(int i) {
  if (i == 0) return u_c0;
  if (i == 1) return u_c1;
  if (i == 2) return u_c2;
  if (i == 3) return u_c3;
  return u_c4;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;

  vec2 mouseUV = u_mouse / u_resolution;
  mouseUV.y = 1.0 - mouseUV.y;

  vec3 color = vec3(0.0);
  float totalAlpha = 0.0;
  float count = clamp(u_strandCount, 1.0, 5.0);

  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    if (fi >= count) break;

    float t = fi / max(count - 1.0, 1.0);
    float yBase = 0.15 + t * 0.7;
    float freq = 2.5 + fi * 0.8;
    float speed = 0.4 + fi * 0.12;
    float noiseScale = 3.0 + fi * 0.5;
    float thickness = 0.045 + fi * 0.005;

    float n = noise(vec2(uv.x * noiseScale + u_time * 0.2, fi * 10.0)) * 2.0 - 1.0;

    float mouseDist = distance(uv, mouseUV);
    float mouseInfluence = u_mouseReactive * smoothstep(0.3, 0.0, mouseDist) * 0.08;
    float mousePush = (uv.y - mouseUV.y) * mouseInfluence;

    float y = yBase
      + sin(uv.x * freq + u_time * speed) * u_amplitude * 0.5
      + sin(uv.x * freq * 0.6 + u_time * speed * 0.7 + 1.5) * u_amplitude * 0.25
      + n * u_amplitude * 0.3
      + mousePush;

    float dist = abs(uv.y - y);
    float alpha = smoothstep(thickness, 0.0, dist);
    alpha *= 0.6 + 0.4 * sin(uv.x * 3.0 + u_time * 0.5 + fi);

    color += getColor(i) * alpha;
    totalAlpha += alpha;
  }

  color = color / max(totalAlpha, 0.001) * min(totalAlpha, 1.0);
  gl_FragColor = vec4(color, min(totalAlpha * 0.8, 0.9));
}
`;

export default function SilkWaves({
  strandCount = 5,
  amplitude = 50,
  mouseReactive = true,
  palette,
  colors,
  className,
}: SilkWavesProps) {
  const resolvedColors = colors ?? resolvePalette(palette, 'particles', DEFAULT_COLORS);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;

    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("SilkWaves shader error:", gl.getShaderInfoLog(s));
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
      console.error("SilkWaves link error:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uCount = gl.getUniformLocation(prog, "u_strandCount");
    const uAmp = gl.getUniformLocation(prog, "u_amplitude");
    const uMouseR = gl.getUniformLocation(prog, "u_mouseReactive");
    const uColors = [
      gl.getUniformLocation(prog, "u_c0"),
      gl.getUniformLocation(prog, "u_c1"),
      gl.getUniformLocation(prog, "u_c2"),
      gl.getUniformLocation(prog, "u_c3"),
      gl.getUniformLocation(prog, "u_c4"),
    ];

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Set static uniforms
    gl.uniform1f(uCount, Math.max(1, Math.min(5, strandCount)));
    gl.uniform1f(uAmp, amplitude / 600);
    gl.uniform1f(uMouseR, mouseReactive ? 1 : 0);
    for (let i = 0; i < 5; i++) {
      const c = resolvedColors[i % resolvedColors.length];
      gl.uniform3f(uColors[i], c[0] / 255, c[1] / 255, c[2] / 255);
    }

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
    if (mouseReactive) window.addEventListener("mousemove", onMove);
    window.addEventListener("resize", resize);

    let animId = 0;
    const start = performance.now();

    const loop = () => {
      const t = (performance.now() - start) / 1000;
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mouse.x, mouse.y);

      gl.clear(gl.COLOR_BUFFER_BIT);
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
  }, [strandCount, amplitude, mouseReactive, resolvedColors]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={className ? undefined : { position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
