"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";
import { buildDefaults, type ControlDef } from "@demo/components/PlaygroundDrawer";
import { hexToRgb, rgbToHex } from "@demo/lib/colorUtils";

const AuroraBg = dynamic(() => import("@effects/aurora-bg/AuroraBg"), { ssr: false });
const ConstellationBg = dynamic(() => import("@effects/constellation-bg/ConstellationBg"), { ssr: false });
const GradientMesh = dynamic(() => import("@effects/gradient-mesh/GradientMesh"), { ssr: false });
const MatrixRain = dynamic(() => import("@effects/matrix-rain/MatrixRain"), { ssr: false });
const RippleWave = dynamic(() => import("@effects/ripple-wave/RippleWave"), { ssr: false });
const StarfieldWarp = dynamic(() => import("@effects/starfield-warp/StarfieldWarp"), { ssr: false });
const GeometricMorph = dynamic(() => import("@effects/geometric-morph/GeometricMorph"), { ssr: false });
const NoiseFlowField = dynamic(() => import("@effects/noise-flow-field/NoiseFlowField"), { ssr: false });
const SilkWaves = dynamic(() => import("@effects/silk-waves/SilkWaves"), { ssr: false });
const PlasmaShader = dynamic(() => import("@effects/plasma-shader/PlasmaShader"), { ssr: false });
const LightningBolts = dynamic(() => import("@effects/lightning-bolts/LightningBolts"), { ssr: false });
const LightRays = dynamic(() => import("@effects/light-rays/LightRays"), { ssr: false });
const GridDistortion = dynamic(() => import("@effects/grid-distortion/GridDistortion"), { ssr: false });
const LiquidChrome = dynamic(() => import("@effects/liquid-chrome/LiquidChrome"), { ssr: false });

/* ─── Aurora ─── */

const AURORA_CONTROLS: ControlDef[] = [
  { key: "speed", label: "Speed", type: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
  { key: "color0", label: "Color 1", type: "color", default: "#6366f1" },
  { key: "color1", label: "Color 2", type: "color", default: "#8b5cf6" },
  { key: "color2", label: "Color 3", type: "color", default: "#22d3ee" },
  { key: "color3", label: "Color 4", type: "color", default: "#a78bfa" },
];
const AURORA_DEFAULTS = buildDefaults(AURORA_CONTROLS);

export function AuroraBgSection() {
  const [values, setValues] = useState(AURORA_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="aurora-bg"
      title="Aurora Background"
      description="Soft flowing aurora bands in indigo, violet, and cyan. Minimal canvas animation."
      category="Background"
      hooks={["useCanvasSetup"]}
      controls={AURORA_CONTROLS}
      values={values}
      defaultValues={AURORA_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2", "color3"] }}
    >
      <AuroraBg
        speed={values.speed as number}
        colors={[
          hexToRgb(values.color0 as string),
          hexToRgb(values.color1 as string),
          hexToRgb(values.color2 as string),
          hexToRgb(values.color3 as string),
        ]}
      />
    </EffectSection>
  );
}

/* ─── Constellation ─── */

const CONSTELLATION_CONTROLS: ControlDef[] = [
  { key: "count", label: "Stars", type: "slider", min: 20, max: 200, step: 10, default: 70 },
  { key: "linkDist", label: "Link Distance", type: "slider", min: 50, max: 300, step: 10, default: 140 },
  { key: "mouseRadius", label: "Mouse Radius", type: "slider", min: 50, max: 400, step: 10, default: 160 },
];
const CONSTELLATION_DEFAULTS = buildDefaults(CONSTELLATION_CONTROLS);

export function ConstellationBgSection() {
  const [values, setValues] = useState(CONSTELLATION_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="constellation-bg"
      title="Constellation"
      description="Interactive star field with proximity-based constellation lines."
      category="Background"
      controls={CONSTELLATION_CONTROLS}
      values={values}
      defaultValues={CONSTELLATION_DEFAULTS}
      onChange={onChange}
    >
      <ConstellationBg
        count={values.count as number}
        linkDist={values.linkDist as number}
        mouseRadius={values.mouseRadius as number}
      />
    </EffectSection>
  );
}

/* ─── Gradient Mesh ─── */

const GRADIENT_MESH_CONTROLS: ControlDef[] = [
  { key: "count", label: "Blobs", type: "slider", min: 2, max: 8, step: 1, default: 4 },
  { key: "speed", label: "Speed", type: "slider", min: 0.1, max: 1, step: 0.05, default: 0.3 },
  { key: "color0", label: "Color 1", type: "color", default: "#6366f1" },
  { key: "color1", label: "Color 2", type: "color", default: "#8b5cf6" },
  { key: "color2", label: "Color 3", type: "color", default: "#22d3ee" },
];
const GRADIENT_MESH_DEFAULTS = buildDefaults(GRADIENT_MESH_CONTROLS);

export function GradientMeshSection() {
  const [values, setValues] = useState(GRADIENT_MESH_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="gradient-mesh"
      title="Gradient Mesh"
      description="Drifting radial gradient blobs. Stripe/iOS wallpaper style."
      category="Background"
      hooks={["useGradientMesh"]}
      controls={GRADIENT_MESH_CONTROLS}
      values={values}
      defaultValues={GRADIENT_MESH_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2"] }}
    >
      <GradientMesh
        count={values.count as number}
        speed={values.speed as number}
        colors={[
          hexToRgb(values.color0 as string),
          hexToRgb(values.color1 as string),
          hexToRgb(values.color2 as string),
        ]}
      />
    </EffectSection>
  );
}

/* ─── Matrix Rain ─── */

const MATRIX_RAIN_CONTROLS: ControlDef[] = [
  { key: "charset", label: "Charset", type: "select", options: ["katakana", "latin", "binary"], default: "katakana" },
  { key: "speed", label: "Speed", type: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
  { key: "density", label: "Density", type: "slider", min: 0.1, max: 1, step: 0.05, default: 0.7 },
  { key: "color0", label: "Color", type: "color", default: rgbToHex([34, 211, 153]) },
];
const MATRIX_RAIN_DEFAULTS = buildDefaults(MATRIX_RAIN_CONTROLS);

export function MatrixRainSection() {
  const [values, setValues] = useState(MATRIX_RAIN_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="matrix-rain"
      title="Matrix Rain"
      description="Classic digital rain with falling katakana and latin characters."
      category="Background"
      controls={MATRIX_RAIN_CONTROLS}
      values={values}
      defaultValues={MATRIX_RAIN_DEFAULTS}
      onChange={onChange}
    >
      <MatrixRain
        charset={values.charset as string}
        speed={values.speed as number}
        density={values.density as number}
        color={hexToRgb(values.color0 as string)}
      />
    </EffectSection>
  );
}

/* ─── Ripple Wave ─── */

const RIPPLE_WAVE_CONTROLS: ControlDef[] = [
  { key: "source", label: "Source", type: "select", options: ["click", "center"], default: "click" },
  { key: "waveSpeed", label: "Wave Speed", type: "slider", min: 50, max: 500, step: 10, default: 200 },
  { key: "gridSize", label: "Grid Size", type: "slider", min: 10, max: 80, step: 5, default: 40 },
  { key: "color0", label: "Color 1", type: "color", default: rgbToHex([99, 102, 241]) },
  { key: "color1", label: "Color 2", type: "color", default: rgbToHex([139, 92, 246]) },
  { key: "color2", label: "Color 3", type: "color", default: rgbToHex([34, 211, 238]) },
];
const RIPPLE_WAVE_DEFAULTS = buildDefaults(RIPPLE_WAVE_CONTROLS);

export function RippleWaveSection() {
  const [values, setValues] = useState(RIPPLE_WAVE_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="ripple-wave"
      title="Ripple Wave"
      description="Mouse-triggered ripple waves propagating across the canvas."
      category="Background"
      controls={RIPPLE_WAVE_CONTROLS}
      values={values}
      defaultValues={RIPPLE_WAVE_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2"] }}
    >
      <RippleWave
        source={values.source as "click" | "center"}
        waveSpeed={values.waveSpeed as number}
        gridSize={values.gridSize as number}
        colors={[
          hexToRgb(values.color0 as string),
          hexToRgb(values.color1 as string),
          hexToRgb(values.color2 as string),
        ]}
      />
    </EffectSection>
  );
}

/* ─── Starfield Warp ─── */

const STARFIELD_CONTROLS: ControlDef[] = [
  { key: "speed", label: "Speed", type: "slider", min: 0.5, max: 8, step: 0.5, default: 2 },
  { key: "count", label: "Count", type: "slider", min: 200, max: 2000, step: 100, default: 800 },
  { key: "mouseReactive", label: "Mouse", type: "toggle", default: true },
  { key: "color0", label: "Color 1", type: "color", default: "#6366f1" },
  { key: "color1", label: "Color 2", type: "color", default: "#c4b5fd" },
  { key: "color2", label: "Color 3", type: "color", default: "#22d3ee" },
];
const STARFIELD_DEFAULTS = buildDefaults(STARFIELD_CONTROLS);

export function StarfieldWarpSection() {
  const [values, setValues] = useState(STARFIELD_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="starfield-warp"
      title="Starfield Warp"
      description="Warp-speed star tunnel with dynamic speed and color controls."
      category="Background"
      hooks={["useCanvasSetup", "useMousePosition"]}
      controls={STARFIELD_CONTROLS}
      values={values}
      defaultValues={STARFIELD_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2"] }}
    >
      <StarfieldWarp
        speed={values.speed as number}
        count={values.count as number}
        mouseReactive={values.mouseReactive as boolean}
        colors={[
          hexToRgb(values.color0 as string),
          hexToRgb(values.color1 as string),
          hexToRgb(values.color2 as string),
        ]}
      />
    </EffectSection>
  );
}

/* ─── Geometric Morph ─── */

const GEOMETRIC_MORPH_CONTROLS: ControlDef[] = [
  { key: "duration", label: "Duration (ms)", type: "slider", min: 500, max: 5000, step: 100, default: 2000 },
  { key: "distortRadius", label: "Distort Radius", type: "slider", min: 20, max: 200, step: 10, default: 100 },
  { key: "color0", label: "Color", type: "color", default: rgbToHex([139, 92, 246]) },
];
const GEOMETRIC_MORPH_DEFAULTS = buildDefaults(GEOMETRIC_MORPH_CONTROLS);

export function GeometricMorphSection() {
  const [values, setValues] = useState(GEOMETRIC_MORPH_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="geometric-morph"
      title="Geometric Morph"
      description="SVG polygon morphing between shapes with smooth interpolation."
      category="Background"
      controls={GEOMETRIC_MORPH_CONTROLS}
      values={values}
      defaultValues={GEOMETRIC_MORPH_DEFAULTS}
      onChange={onChange}
    >
      <GeometricMorph
        duration={values.duration as number}
        distortRadius={values.distortRadius as number}
        color={hexToRgb(values.color0 as string)}
      />
    </EffectSection>
  );
}

/* ─── Noise Flow Field ─── */

const NOISE_FLOW_CONTROLS: ControlDef[] = [
  { key: "count", label: "Particles", type: "slider", min: 500, max: 5000, step: 250, default: 2000 },
  { key: "noiseScale", label: "Noise Scale", type: "slider", min: 0.001, max: 0.02, step: 0.001, default: 0.005 },
  { key: "speed", label: "Speed", type: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
  { key: "turbulence", label: "Turbulence", type: "slider", min: 1, max: 8, step: 0.5, default: 3 },
  { key: "color0", label: "Color 1", type: "color", default: rgbToHex([99, 102, 241]) },
  { key: "color1", label: "Color 2", type: "color", default: rgbToHex([139, 92, 246]) },
  { key: "color2", label: "Color 3", type: "color", default: rgbToHex([34, 211, 238]) },
  { key: "color3", label: "Color 4", type: "color", default: rgbToHex([244, 114, 182]) },
];
const NOISE_FLOW_DEFAULTS = buildDefaults(NOISE_FLOW_CONTROLS);

export function NoiseFlowFieldSection() {
  const [values, setValues] = useState(NOISE_FLOW_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="noise-flow-field"
      title="Noise Flow Field"
      description="Perlin noise-driven particle flow field — generative art aesthetic."
      category="Background"
      hooks={["usePerlinNoise"]}
      controls={NOISE_FLOW_CONTROLS}
      values={values}
      defaultValues={NOISE_FLOW_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2", "color3"] }}
    >
      <NoiseFlowField
        count={values.count as number}
        noiseScale={values.noiseScale as number}
        speed={values.speed as number}
        turbulence={values.turbulence as number}
        colors={[
          hexToRgb(values.color0 as string),
          hexToRgb(values.color1 as string),
          hexToRgb(values.color2 as string),
          hexToRgb(values.color3 as string),
        ]}
      />
    </EffectSection>
  );
}

/* ─── Silk Waves ─── */

const SILK_WAVES_CONTROLS: ControlDef[] = [
  { key: "strandCount", label: "Strands", type: "slider", min: 1, max: 5, step: 1, default: 5 },
  { key: "amplitude", label: "Amplitude", type: "slider", min: 10, max: 100, step: 5, default: 50 },
  { key: "mouseReactive", label: "Mouse", type: "toggle", default: true },
  { key: "color0", label: "Color 1", type: "color", default: rgbToHex([99, 102, 241]) },
  { key: "color1", label: "Color 2", type: "color", default: rgbToHex([139, 92, 246]) },
  { key: "color2", label: "Color 3", type: "color", default: rgbToHex([34, 211, 238]) },
  { key: "color3", label: "Color 4", type: "color", default: rgbToHex([167, 139, 250]) },
  { key: "color4", label: "Color 5", type: "color", default: rgbToHex([244, 114, 182]) },
];
const SILK_WAVES_DEFAULTS = buildDefaults(SILK_WAVES_CONTROLS);

export function SilkWavesSection() {
  const [values, setValues] = useState(SILK_WAVES_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="silk-waves"
      title="Silk Waves"
      description="Fluid, silk-like wave animation with soft gradient colors."
      category="Background"
      controls={SILK_WAVES_CONTROLS}
      values={values}
      defaultValues={SILK_WAVES_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2", "color3", "color4"] }}
    >
      <SilkWaves
        strandCount={values.strandCount as number}
        amplitude={values.amplitude as number}
        mouseReactive={values.mouseReactive as boolean}
        colors={[
          hexToRgb(values.color0 as string),
          hexToRgb(values.color1 as string),
          hexToRgb(values.color2 as string),
          hexToRgb(values.color3 as string),
          hexToRgb(values.color4 as string),
        ]}
      />
    </EffectSection>
  );
}

/* ─── Plasma Shader ─── */

const PLASMA_CONTROLS: ControlDef[] = [
  { key: "speed", label: "Speed", type: "slider", min: 0.5, max: 5, step: 0.5, default: 1 },
  { key: "intensity", label: "Intensity", type: "slider", min: 0.1, max: 3, step: 0.1, default: 1 },
  { key: "color0", label: "Color 1", type: "color", default: "#6366f1" },
  { key: "color1", label: "Color 2", type: "color", default: "#8b5cf6" },
  { key: "color2", label: "Color 3", type: "color", default: "#22d3ee" },
];
const PLASMA_DEFAULTS = buildDefaults(PLASMA_CONTROLS);

export function PlasmaShaderSection() {
  const [values, setValues] = useState(PLASMA_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="plasma-shader"
      title="Plasma Shader"
      description="WebGL plasma effect with sinusoidal color mixing."
      category="Background"
      hooks={["useWebGL"]}
      controls={PLASMA_CONTROLS}
      values={values}
      defaultValues={PLASMA_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2"] }}
    >
      <PlasmaShader
        speed={values.speed as number}
        intensity={values.intensity as number}
        colors={[
          hexToRgb(values.color0 as string),
          hexToRgb(values.color1 as string),
          hexToRgb(values.color2 as string),
        ]}
      />
    </EffectSection>
  );
}

/* ─── Lightning Bolts ─── */

const LIGHTNING_CONTROLS: ControlDef[] = [
  { key: "interval", label: "Interval (ms)", type: "slider", min: 500, max: 8000, step: 250, default: 3000 },
  { key: "branchChance", label: "Branch Chance", type: "slider", min: 0, max: 0.8, step: 0.05, default: 0.3 },
  { key: "glowIntensity", label: "Glow", type: "slider", min: 0.2, max: 3, step: 0.1, default: 1 },
  { key: "color0", label: "Color", type: "color", default: rgbToHex([34, 211, 238]) },
];
const LIGHTNING_DEFAULTS = buildDefaults(LIGHTNING_CONTROLS);

export function LightningBoltsSection() {
  const [values, setValues] = useState(LIGHTNING_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="lightning-bolts"
      title="Lightning Bolts"
      description="Recursive fractal lightning bolts with glow and branching."
      category="Background"
      controls={LIGHTNING_CONTROLS}
      values={values}
      defaultValues={LIGHTNING_DEFAULTS}
      onChange={onChange}
    >
      <LightningBolts
        interval={values.interval as number}
        branchChance={values.branchChance as number}
        glowIntensity={values.glowIntensity as number}
        color={hexToRgb(values.color0 as string)}
      />
    </EffectSection>
  );
}

/* ─── Light Rays ─── */

const LIGHT_RAYS_CONTROLS: ControlDef[] = [
  { key: "rayCount", label: "Ray Count", type: "slider", min: 2, max: 24, step: 1, default: 12 },
  { key: "mouseReactive", label: "Mouse", type: "toggle", default: true },
  { key: "color0", label: "Color", type: "color", default: rgbToHex([255, 240, 200]) },
];
const LIGHT_RAYS_DEFAULTS = buildDefaults(LIGHT_RAYS_CONTROLS);

export function LightRaysSection() {
  const [values, setValues] = useState(LIGHT_RAYS_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="light-rays"
      title="Light Rays"
      description="Volumetric god-rays emanating from a central light source."
      category="Background"
      hooks={["useWebGL"]}
      controls={LIGHT_RAYS_CONTROLS}
      values={values}
      defaultValues={LIGHT_RAYS_DEFAULTS}
      onChange={onChange}
    >
      <LightRays
        rayCount={values.rayCount as number}
        mouseReactive={values.mouseReactive as boolean}
        color={hexToRgb(values.color0 as string)}
      />
    </EffectSection>
  );
}

/* ─── Grid Distortion ─── */

const GRID_DISTORTION_CONTROLS: ControlDef[] = [
  { key: "gridSize", label: "Grid Size", type: "slider", min: 8, max: 50, step: 2, default: 20 },
  { key: "radius", label: "Radius", type: "slider", min: 50, max: 400, step: 10, default: 150 },
  { key: "strength", label: "Strength", type: "slider", min: 5, max: 80, step: 5, default: 30 },
  { key: "color0", label: "Color", type: "color", default: rgbToHex([255, 255, 255]) },
];
const GRID_DISTORTION_DEFAULTS = buildDefaults(GRID_DISTORTION_CONTROLS);

export function GridDistortionSection() {
  const [values, setValues] = useState(GRID_DISTORTION_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="grid-distortion"
      title="Grid Distortion"
      description="Mouse-reactive grid mesh with spring-based point distortion."
      category="Background"
      controls={GRID_DISTORTION_CONTROLS}
      values={values}
      defaultValues={GRID_DISTORTION_DEFAULTS}
      onChange={onChange}
    >
      <GridDistortion
        gridSize={values.gridSize as number}
        radius={values.radius as number}
        strength={values.strength as number}
        color={hexToRgb(values.color0 as string)}
      />
    </EffectSection>
  );
}

/* ─── Liquid Chrome ─── */

const LIQUID_CHROME_CONTROLS: ControlDef[] = [
  { key: "speed", label: "Speed", type: "slider", min: 0.1, max: 2, step: 0.05, default: 0.5 },
  { key: "mouseStrength", label: "Mouse Strength", type: "slider", min: 0, max: 1, step: 0.05, default: 0.3 },
];
const LIQUID_CHROME_DEFAULTS = buildDefaults(LIQUID_CHROME_CONTROLS);

export function LiquidChromeSection() {
  const [values, setValues] = useState(LIQUID_CHROME_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="liquid-chrome"
      title="Liquid Chrome"
      description="Reflective liquid metal surface with WebGL shading."
      category="Background"
      hooks={["useWebGL"]}
      controls={LIQUID_CHROME_CONTROLS}
      values={values}
      defaultValues={LIQUID_CHROME_DEFAULTS}
      onChange={onChange}
    >
      <LiquidChrome
        speed={values.speed as number}
        mouseStrength={values.mouseStrength as number}
      />
    </EffectSection>
  );
}
