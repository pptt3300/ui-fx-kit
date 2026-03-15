"use client";

import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";

const LiquidGlass = dynamic(() => import("@effects/liquid-glass/LiquidGlass"), { ssr: false });
const HeroScene = dynamic(() => import("@effects/3d-hero/HeroScene"), { ssr: false });
const MetallicPaint = dynamic(() => import("@effects/metallic-paint/MetallicPaint"), { ssr: false });
const Iridescence = dynamic(() => import("@effects/iridescence/Iridescence"), { ssr: false });
const LiquidEther = dynamic(() => import("@effects/liquid-ether/LiquidEther"), { ssr: false });
const PrismRefraction = dynamic(() => import("@effects/prism-refraction/PrismRefraction"), { ssr: false });
const MetaBalls = dynamic(() => import("@effects/metaballs/MetaBalls"), { ssr: false });
const NoiseGrain = dynamic(() => import("@effects/noise-grain/NoiseGrain"), { ssr: false });

export function LiquidGlassSection() {
  return (
    <section id="liquid-glass" className="relative w-full">
      <LiquidGlass />
    </section>
  );
}

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

export function MetallicPaintSection() {
  return (
    <EffectSection
      id="metallic-paint"
      title="Metallic Paint"
      description="WebGL brushed-metal surface with directional specular highlights."
      category="Shader"
      hooks={["useWebGL"]}
    >
      <div className="w-full h-full min-h-screen">
        <MetallicPaint />
      </div>
    </EffectSection>
  );
}

export function IridescenceSection() {
  return (
    <EffectSection
      id="iridescence"
      title="Iridescence"
      description="WebGL rainbow sheen that shifts with mouse position — oil-slick effect."
      category="Shader"
      hooks={["useWebGL"]}
      css={["iridescent.css"]}
    >
      <div className="w-full h-full min-h-screen relative">
        <Iridescence intensity={1.2}>
          <div className="flex items-center justify-center w-full h-full min-h-screen">
            <p className="text-white/60 text-sm font-mono">move your cursor</p>
          </div>
        </Iridescence>
      </div>
    </EffectSection>
  );
}

export function LiquidEtherSection() {
  return (
    <EffectSection
      id="liquid-ether"
      title="Liquid Ether"
      description="Swirling plasma field with mouse-reactive fluid dynamics."
      category="Shader"
      hooks={["useWebGL"]}
    >
      <div className="w-full h-full min-h-screen">
        <LiquidEther />
      </div>
    </EffectSection>
  );
}

export function PrismRefractionSection() {
  return (
    <EffectSection
      id="prism-refraction"
      title="Prism Refraction"
      description="WebGL chromatic aberration and RGB dispersion lens effect."
      category="Shader"
      hooks={["useWebGL"]}
    >
      <div className="w-full h-full min-h-screen relative bg-zinc-950 flex items-center justify-center">
        <PrismRefraction strength={0.03} dispersion={0.015}>
          <div className="text-center p-12 rounded-3xl bg-gradient-to-br from-indigo-900/50 to-violet-900/50 border border-white/10">
            <p className="text-white font-bold text-3xl mb-2">Prism</p>
            <p className="text-white/50 text-sm">Chromatic aberration on hover</p>
          </div>
        </PrismRefraction>
      </div>
    </EffectSection>
  );
}

export function MetaBallsSection() {
  return (
    <EffectSection
      id="metaballs"
      title="Metaballs"
      description="WebGL metaball simulation — organic blobs that merge and separate."
      category="Shader"
      hooks={["useWebGL"]}
    >
      <div className="w-full h-full min-h-screen">
        <MetaBalls />
      </div>
    </EffectSection>
  );
}

export function NoiseGrainSection() {
  return (
    <EffectSection
      id="noise-grain"
      title="Noise Grain"
      description="Animated film grain overlay with mouse proximity clear-zone."
      category="Shader"
    >
      <div className="w-full h-full min-h-screen relative bg-gradient-to-br from-indigo-950 to-zinc-950 flex items-center justify-center">
        <NoiseGrain intensity={0.2} animated clearRadius={120} />
        <div className="relative z-10 text-center pointer-events-none">
          <p className="text-white font-bold text-3xl mb-2">Film Grain</p>
          <p className="text-white/40 text-sm">Move cursor to clear the grain</p>
        </div>
      </div>
    </EffectSection>
  );
}
