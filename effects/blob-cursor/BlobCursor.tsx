import { useEffect, useRef, useCallback } from "react";
import { useMousePosition } from "../../hooks";
import type { RGB } from "../../presets/colors";

interface BlobCursorProps {
  radius?: number;
  stiffness?: number;
  color?: RGB;
  className?: string;
}

const VERTEX = `
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const FRAGMENT = `
  precision mediump float;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_target;
  uniform float u_radius;
  uniform vec3 u_color;
  uniform float u_squish;

  void main() {
    vec2 px = gl_FragCoord.xy;
    float r = u_radius;

    float squishX = 1.0 + u_squish * 0.4;
    float squishY = 1.0 - u_squish * 0.2;

    // Main blob at cursor
    vec2 d1 = px - u_mouse;
    d1.x /= squishX;
    d1.y /= squishY;
    float f1 = (r * r) / (dot(d1, d1) + 1.0);

    // Lagging blob
    vec2 d2 = px - u_target;
    float r2 = r * 0.85;
    float f2 = (r2 * r2) / (dot(d2, d2) + 1.0);

    float field = f1 + f2;
    float alpha = smoothstep(0.4, 0.9, field);

    vec3 col = u_color / 255.0;
    float core = smoothstep(0.9, 1.5, field);
    vec3 finalCol = mix(col * 0.5, col * 1.2, core);
    gl_FragColor = vec4(finalCol, alpha * 0.9);
  }
`;

export default function BlobCursor({
  radius = 40,
  stiffness = 120,
  color = [99, 102, 241],
  className = "",
}: BlobCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { position } = useMousePosition({ scope: "window" });

  const lagPos = useRef({ x: -9999, y: -9999 });
  const lagVel = useRef({ x: 0, y: 0 });
  const squish = useRef(0);
  const squishVel = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;

    // Compile shaders
    const compile = (src: string, type: number) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
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
    gl.useProgram(prog);

    // Fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    // Uniforms
    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uTarget = gl.getUniformLocation(prog, "u_target");
    const uRadius = gl.getUniformLocation(prog, "u_radius");
    const uColor = gl.getUniformLocation(prog, "u_color");
    const uSquish = gl.getUniformLocation(prog, "u_squish");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();

    const onClick = () => { squish.current = 1.0; squishVel.current = 0; };
    window.addEventListener("click", onClick);
    window.addEventListener("resize", resize);

    let animId = 0;
    let last = performance.now();
    const damp = 2 * Math.sqrt(stiffness) * 0.7;

    const loop = () => {
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const dpr = window.devicePixelRatio || 1;
      const mx = position.current.x * dpr;
      const my = (window.innerHeight - position.current.y) * dpr;

      // Spring physics
      const ax = -stiffness * (lagPos.current.x - mx) - damp * lagVel.current.x;
      const ay = -stiffness * (lagPos.current.y - my) - damp * lagVel.current.y;
      lagVel.current.x += ax * dt;
      lagVel.current.y += ay * dt;
      lagPos.current.x += lagVel.current.x * dt;
      lagPos.current.y += lagVel.current.y * dt;

      // Squish decay
      const sqA = -300 * squish.current - 30 * squishVel.current;
      squishVel.current += sqA * dt;
      squish.current += squishVel.current * dt;
      if (Math.abs(squish.current) < 0.001) squish.current = 0;

      // Set uniforms and draw
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, mx, my);
      gl.uniform2f(uTarget, lagPos.current.x, lagPos.current.y);
      gl.uniform1f(uRadius, radius * dpr);
      gl.uniform3f(uColor, color[0], color[1], color[2]);
      gl.uniform1f(uSquish, squish.current);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [radius, stiffness, color, position]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none z-50 ${className}`}
    />
  );
}
