"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";
import { buildDefaults, type ControlDef } from "@demo/components/PlaygroundDrawer";
import { hexToRgb } from "@demo/lib/colorUtils";

const LiquidGlass = dynamic(() => import("@effects/liquid-glass/LiquidGlass"), { ssr: false });
const HeroScene = dynamic(() => import("@effects/3d-hero/HeroScene"), { ssr: false });
const MetallicPaint = dynamic(() => import("@effects/metallic-paint/MetallicPaint"), { ssr: false });
const Iridescence = dynamic(() => import("@effects/iridescence/Iridescence"), { ssr: false });
const LiquidEther = dynamic(() => import("@effects/liquid-ether/LiquidEther"), { ssr: false });
const PrismRefraction = dynamic(() => import("@effects/prism-refraction/PrismRefraction"), { ssr: false });
const MetaBalls = dynamic(() => import("@effects/metaballs/MetaBalls"), { ssr: false });
const NoiseGrain = dynamic(() => import("@effects/noise-grain/NoiseGrain"), { ssr: false });

/* ── Liquid Glass (demo wrapper, no tunable props) ── */

export function LiquidGlassSection() {
  return (
    <section id="liquid-glass" className="relative w-full">
      <LiquidGlass />
    </section>
  );
}

/* ── 3D Hero (demo scene, no tunable props) ── */

export function HeroSceneSection() {
  return (
    <section id="3d-hero" className="relative h-screen w-full overflow-hidden">
      <div className="absolute top-4 left-4 z-20">
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
          Shader
        </span>
      </div>
      <div className="absolute inset-0 [&_section]:!h-full [&_section]:!min-h-0 [&_.absolute.bottom-0]:!hidden">
        <HeroScene />
      </div>
      <div className="absolute bottom-8 left-6 z-20 max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-1">3D Hero</h2>
        <p className="text-sm text-white/50">Three.js scene with floating geometry, particles, and mouse interaction.</p>
      </div>
    </section>
  );
}

/* ── Metallic Paint ── */

const METALLIC_CONTROLS: ControlDef[] = [
  { key: "brushAngle", label: "Brush Angle", type: "slider", min: 0, max: 6.28, step: 0.1, default: 0 },
  { key: "specular", label: "Specular", type: "slider", min: 0, max: 2, step: 0.1, default: 0.8 },
  { key: "color0", label: "Color", type: "color", default: "#c0c0c8" },
];
const METALLIC_DEFAULTS = buildDefaults(METALLIC_CONTROLS);

export function MetallicPaintSection() {
  const [values, setValues] = useState(METALLIC_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="metallic-paint"
      title="Metallic Paint"
      description="WebGL brushed-metal surface with directional specular highlights."
      category="Shader"
      hooks={["useWebGL"]}
      controls={METALLIC_CONTROLS}
      values={values}
      defaultValues={METALLIC_DEFAULTS}
      onChange={onChange}
    >
      <div className="w-full h-full min-h-screen">
        <MetallicPaint
          color={hexToRgb(values.color0 as string)}
          brushAngle={values.brushAngle as number}
          specular={values.specular as number}
        />
      </div>
    </EffectSection>
  );
}

/* ── Iridescence ── */

const IRIDESCENCE_CONTROLS: ControlDef[] = [
  { key: "intensity", label: "Intensity", type: "slider", min: 0.1, max: 3, step: 0.1, default: 1.2 },
];
const IRIDESCENCE_DEFAULTS = buildDefaults(IRIDESCENCE_CONTROLS);

export function IridescenceSection() {
  const [values, setValues] = useState(IRIDESCENCE_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="iridescence"
      title="Iridescence"
      description="WebGL rainbow sheen that shifts with mouse position — oil-slick effect."
      category="Shader"
      hooks={["useWebGL"]}
      css={["iridescent.css"]}
      controls={IRIDESCENCE_CONTROLS}
      values={values}
      defaultValues={IRIDESCENCE_DEFAULTS}
      onChange={onChange}
    >
      <div className="w-full h-full min-h-screen relative">
        <Iridescence intensity={values.intensity as number}>
          <div className="flex items-center justify-center w-full h-full min-h-screen">
            <p className="text-white/60 text-sm font-mono">move your cursor</p>
          </div>
        </Iridescence>
      </div>
    </EffectSection>
  );
}

/* ── Liquid Ether ── */

const ETHER_CONTROLS: ControlDef[] = [
  { key: "speed", label: "Speed", type: "slider", min: 0.05, max: 1, step: 0.05, default: 0.3 },
  { key: "mouseStrength", label: "Mouse Strength", type: "slider", min: 0, max: 2, step: 0.1, default: 0.5 },
  { key: "color0", label: "Color 1", type: "color", default: "#1e0a3c" },
  { key: "color1", label: "Color 2", type: "color", default: "#501478" },
  { key: "color2", label: "Color 3", type: "color", default: "#143c64" },
];
const ETHER_DEFAULTS = buildDefaults(ETHER_CONTROLS);

export function LiquidEtherSection() {
  const [values, setValues] = useState(ETHER_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="liquid-ether"
      title="Liquid Ether"
      description="Swirling plasma field with mouse-reactive fluid dynamics."
      category="Shader"
      hooks={["useWebGL"]}
      controls={ETHER_CONTROLS}
      values={values}
      defaultValues={ETHER_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2"] }}
    >
      <div className="w-full h-full min-h-screen">
        <LiquidEther
          speed={values.speed as number}
          mouseStrength={values.mouseStrength as number}
          colors={[
            hexToRgb(values.color0 as string),
            hexToRgb(values.color1 as string),
            hexToRgb(values.color2 as string),
          ]}
        />
      </div>
    </EffectSection>
  );
}

/* ── Prism Refraction ── */

const PRISM_CONTROLS: ControlDef[] = [
  { key: "strength", label: "Strength", type: "slider", min: 0.01, max: 0.2, step: 0.005, default: 0.03 },
  { key: "dispersion", label: "Dispersion", type: "slider", min: 0.001, max: 0.1, step: 0.002, default: 0.015 },
];
const PRISM_DEFAULTS = buildDefaults(PRISM_CONTROLS);

export function PrismRefractionSection() {
  const [values, setValues] = useState(PRISM_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="prism-refraction"
      title="Prism Refraction"
      description="WebGL chromatic aberration and RGB dispersion lens effect."
      category="Shader"
      hooks={["useWebGL"]}
      controls={PRISM_CONTROLS}
      values={values}
      defaultValues={PRISM_DEFAULTS}
      onChange={onChange}
    >
      <div className="w-full h-full min-h-screen relative bg-zinc-950 flex items-center justify-center">
        <PrismRefraction
          strength={values.strength as number}
          dispersion={values.dispersion as number}
        >
          <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-indigo-900/50 to-violet-900/50 border border-white/10">
            <p className="text-white font-bold text-3xl mb-2">Prism</p>
            <p className="text-white/50 text-sm">Chromatic aberration on hover</p>
          </div>
        </PrismRefraction>
      </div>
    </EffectSection>
  );
}

/* ── MetaBalls ── */

const METABALLS_CONTROLS: ControlDef[] = [
  { key: "count", label: "Count", type: "slider", min: 2, max: 12, step: 1, default: 6 },
  { key: "mouseMode", label: "Mouse Mode", type: "select", options: ["attract", "repel"], default: "attract" },
  { key: "color0", label: "Color 1", type: "color", default: "#6366f1" },
  { key: "color1", label: "Color 2", type: "color", default: "#8b5cf6" },
  { key: "color2", label: "Color 3", type: "color", default: "#ec4899" },
];
const METABALLS_DEFAULTS = buildDefaults(METABALLS_CONTROLS);

export function MetaBallsSection() {
  const [values, setValues] = useState(METABALLS_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="metaballs"
      title="Metaballs"
      description="WebGL metaball simulation — organic blobs that merge and separate."
      category="Shader"
      hooks={["useWebGL"]}
      controls={METABALLS_CONTROLS}
      values={values}
      defaultValues={METABALLS_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2"] }}
    >
      <div className="w-full h-full min-h-screen">
        <MetaBalls
          count={values.count as number}
          mouseMode={values.mouseMode as "attract" | "repel"}
          colors={[
            hexToRgb(values.color0 as string),
            hexToRgb(values.color1 as string),
            hexToRgb(values.color2 as string),
          ]}
        />
      </div>
    </EffectSection>
  );
}

/* ── Noise Grain ── */

const GRAIN_CONTROLS: ControlDef[] = [
  { key: "intensity", label: "Intensity", type: "slider", min: 0.01, max: 0.5, step: 0.01, default: 0.2 },
  { key: "clearRadius", label: "Clear Radius", type: "slider", min: 0, max: 300, step: 10, default: 120 },
  { key: "animated", label: "Animated", type: "toggle", default: true },
];
const GRAIN_DEFAULTS = buildDefaults(GRAIN_CONTROLS);

export function NoiseGrainSection() {
  const [values, setValues] = useState(GRAIN_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="noise-grain"
      title="Noise Grain"
      description="Animated film grain overlay with mouse proximity clear-zone."
      category="Shader"
      controls={GRAIN_CONTROLS}
      values={values}
      defaultValues={GRAIN_DEFAULTS}
      onChange={onChange}
    >
      <div className="w-full h-full min-h-screen relative bg-gradient-to-br from-indigo-950 to-zinc-950 flex items-center justify-center">
        <NoiseGrain
          intensity={values.intensity as number}
          animated={values.animated as boolean}
          clearRadius={values.clearRadius as number}
        />
        <div className="relative z-10 text-center pointer-events-none">
          <p className="text-white font-bold text-3xl mb-2">Film Grain</p>
          <p className="text-white/40 text-sm">Move cursor to clear the grain</p>
        </div>
      </div>
    </EffectSection>
  );
}
