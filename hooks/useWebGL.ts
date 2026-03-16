import { useRef, useEffect, useCallback } from "react";

export interface UseWebGLOptions {
  vertexShader?: string;
  fragmentShader: string;
  uniforms?: Record<string, number | number[]>;
}

export interface WebGLState {
  gl: WebGLRenderingContext | null;
  program: WebGLProgram | null;
}

const DEFAULT_VERTEX = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

/**
 * WebGL context setup, shader compilation, and render loop.
 * Renders a fullscreen quad with custom fragment shader.
 *
 * Usage:
 * ```tsx
 * const { canvasRef, setUniform, startLoop } = useWebGL({
 *   fragmentShader: `
 *     precision mediump float;
 *     uniform float u_time;
 *     uniform vec2 u_resolution;
 *     void main() {
 *       vec2 uv = gl_FragCoord.xy / u_resolution;
 *       gl_FragColor = vec4(uv, sin(u_time) * 0.5 + 0.5, 1.0);
 *     }
 *   `,
 * });
 * useEffect(() => startLoop(), [startLoop]);
 * return <canvas ref={canvasRef} />;
 * ```
 */
export function useWebGL(options: UseWebGLOptions) {
  const { vertexShader = DEFAULT_VERTEX, fragmentShader, uniforms: initialUniforms } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformLocations = useRef<Map<string, WebGLUniformLocation>>(new Map());
  const pendingUniforms = useRef<Map<string, number | number[]>>(new Map());
  const readyRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    glRef.current = gl;

    const compileShader = (source: string, type: number): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vertexShader, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentShader, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    programRef.current = program;
    gl.useProgram(program);

    // Fullscreen quad
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const posAttr = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    // Pre-fetch common uniform locations
    uniformLocations.current.clear();
    for (const name of ["u_time", "u_resolution", "u_mouse"]) {
      const loc = gl.getUniformLocation(program, name);
      if (loc) uniformLocations.current.set(name, loc);
    }
    if (initialUniforms) {
      for (const name of Object.keys(initialUniforms)) {
        const loc = gl.getUniformLocation(program, name);
        if (loc) uniformLocations.current.set(name, loc);
      }
    }

    // Resize
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);

    readyRef.current = true;

    // Replay any uniforms that were set before program was ready
    for (const [name, value] of pendingUniforms.current) {
      applyUniform(gl, program, name, value, uniformLocations.current);
    }
    pendingUniforms.current.clear();

    const locs = uniformLocations.current;
    return () => {
      readyRef.current = false;
      programRef.current = null;
      glRef.current = null;
      locs.clear();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [vertexShader, fragmentShader, initialUniforms]);

  // Resize handler
  useEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      const gl = glRef.current;
      if (!canvas || !gl) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const setUniform = useCallback((name: string, value: number | number[]) => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program || !readyRef.current) {
      // Store for replay when program becomes ready
      pendingUniforms.current.set(name, value);
      return;
    }
    applyUniform(gl, program, name, value, uniformLocations.current);
  }, []);

  const startLoop = useCallback(() => {
    let animId = 0;
    const start = performance.now();
    const loop = () => {
      const gl = glRef.current;
      const canvas = canvasRef.current;
      if (!gl || !canvas || !readyRef.current) {
        animId = requestAnimationFrame(loop);
        return;
      }
      const t = (performance.now() - start) / 1000;
      setUniform("u_time", t);
      setUniform("u_resolution", [canvas.width, canvas.height]);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [setUniform]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const gl = glRef.current;
    if (!canvas || !gl) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }, []);

  return { canvasRef, setUniform, startLoop, resize, gl: glRef, program: programRef };
}

function applyUniform(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
  value: number | number[],
  cache: Map<string, WebGLUniformLocation>,
) {
  let loc = cache.get(name);
  if (!loc) {
    loc = gl.getUniformLocation(program, name) ?? undefined;
    if (loc) cache.set(name, loc);
    else return;
  }
  if (typeof value === "number") gl.uniform1f(loc, value);
  else if (value.length === 2) gl.uniform2f(loc, value[0], value[1]);
  else if (value.length === 3) gl.uniform3f(loc, value[0], value[1], value[2]);
  else if (value.length === 4) gl.uniform4f(loc, value[0], value[1], value[2], value[3]);
}
