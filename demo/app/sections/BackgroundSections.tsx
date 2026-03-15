"use client";

import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";

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

export function AuroraBgSection() {
  return (
    <EffectSection
      id="aurora-bg"
      title="Aurora Background"
      description="Soft flowing aurora bands in indigo, violet, and cyan. Minimal canvas animation."
      category="Background"
    >
      <AuroraBg />
    </EffectSection>
  );
}

export function ConstellationBgSection() {
  return (
    <EffectSection
      id="constellation-bg"
      title="Constellation"
      description="Interactive star field with proximity-based constellation lines."
      category="Background"
    >
      <ConstellationBg />
    </EffectSection>
  );
}

export function GradientMeshSection() {
  return (
    <EffectSection
      id="gradient-mesh"
      title="Gradient Mesh"
      description="Drifting radial gradient blobs. Stripe/iOS wallpaper style."
      category="Background"
      hooks={["useGradientMesh"]}
    >
      <GradientMesh />
    </EffectSection>
  );
}

export function MatrixRainSection() {
  return (
    <EffectSection
      id="matrix-rain"
      title="Matrix Rain"
      description="Classic digital rain with falling katakana and latin characters."
      category="Background"
    >
      <MatrixRain />
    </EffectSection>
  );
}

export function RippleWaveSection() {
  return (
    <EffectSection
      id="ripple-wave"
      title="Ripple Wave"
      description="Mouse-triggered ripple waves propagating across the canvas."
      category="Background"
    >
      <RippleWave />
    </EffectSection>
  );
}

export function StarfieldWarpSection() {
  return (
    <EffectSection
      id="starfield-warp"
      title="Starfield Warp"
      description="Warp-speed star tunnel with dynamic speed and color controls."
      category="Background"
    >
      <StarfieldWarp />
    </EffectSection>
  );
}

export function GeometricMorphSection() {
  return (
    <EffectSection
      id="geometric-morph"
      title="Geometric Morph"
      description="SVG polygon morphing between shapes with smooth interpolation."
      category="Background"
    >
      <GeometricMorph />
    </EffectSection>
  );
}

export function NoiseFlowFieldSection() {
  return (
    <EffectSection
      id="noise-flow-field"
      title="Noise Flow Field"
      description="Perlin noise-driven particle flow field — generative art aesthetic."
      category="Background"
      hooks={["usePerlinNoise"]}
    >
      <NoiseFlowField />
    </EffectSection>
  );
}

export function SilkWavesSection() {
  return (
    <EffectSection
      id="silk-waves"
      title="Silk Waves"
      description="Fluid, silk-like wave animation with soft gradient colors."
      category="Background"
    >
      <SilkWaves />
    </EffectSection>
  );
}

export function PlasmaShaderSection() {
  return (
    <EffectSection
      id="plasma-shader"
      title="Plasma Shader"
      description="WebGL plasma effect with sinusoidal color mixing."
      category="Background"
      hooks={["useWebGL"]}
    >
      <PlasmaShader />
    </EffectSection>
  );
}

export function LightningBoltsSection() {
  return (
    <EffectSection
      id="lightning-bolts"
      title="Lightning Bolts"
      description="Recursive fractal lightning bolts with glow and branching."
      category="Background"
    >
      <LightningBolts />
    </EffectSection>
  );
}

export function LightRaysSection() {
  return (
    <EffectSection
      id="light-rays"
      title="Light Rays"
      description="Volumetric god-rays emanating from a central light source."
      category="Background"
    >
      <LightRays />
    </EffectSection>
  );
}

export function GridDistortionSection() {
  return (
    <EffectSection
      id="grid-distortion"
      title="Grid Distortion"
      description="Mouse-reactive grid mesh with spring-based point distortion."
      category="Background"
    >
      <GridDistortion />
    </EffectSection>
  );
}

export function LiquidChromeSection() {
  return (
    <EffectSection
      id="liquid-chrome"
      title="Liquid Chrome"
      description="Reflective liquid metal surface with WebGL shading."
      category="Background"
      hooks={["useWebGL"]}
    >
      <LiquidChrome />
    </EffectSection>
  );
}
