"use client";

import { useEffect, useState } from "react";
import Navigation from "@demo/components/Navigation";
import HeroSection from "./sections/HeroSection";
import { SECTION_REGISTRY } from "./sections/index";

import {
  AuroraBgSection,
  ConstellationBgSection,
  GradientMeshSection,
  MatrixRainSection,
  RippleWaveSection,
  StarfieldWarpSection,
  GeometricMorphSection,
  NoiseFlowFieldSection,
  SilkWavesSection,
  PlasmaShaderSection,
  LightningBoltsSection,
  LightRaysSection,
  GridDistortionSection,
  LiquidChromeSection,
} from "./sections/BackgroundSections";

import {
  TypewriterTextSection,
  TextRevealSection,
  ScrambleTextSection,
  SplitFlapSection,
  MorphingTextSection,
  StaggeredCharsSection,
  GlitchTextSection,
  ASCIITextSection,
  TextPressureSection,
  CircularTextSection,
} from "./sections/TextSections";

import {
  SpotlightCardsSection,
  PhysicsCardsSection,
  HolographicCardSection,
  FlipCardSection,
  StackSwipeSection,
  BentoGridSection,
  ParallaxDepthCardSection,
  StickerPeelSection,
  ReflectiveCardSection,
} from "./sections/CardSections";

import {
  CursorGlowSection,
  BlobCursorSection,
  SplashCursorSection,
  PixelTrailSection,
  ImageTrailSection,
  GhostCursorSection,
} from "./sections/CursorSections";

import {
  LiquidGlassSection,
  HeroSceneSection,
  MetallicPaintSection,
  IridescenceSection,
  LiquidEtherSection,
  PrismRefractionSection,
  MetaBallsSection,
  NoiseGrainSection,
} from "./sections/ShaderSections";

import {
  MagneticButtonSection,
  SpotlightInputSection,
  InteractiveDotGridSection,
  ScrollVelocitySection,
  ParticleTextSection,
  DockMagnifySection,
  ConfettiBurstSection,
  RippleButtonSection,
  DragReorderSection,
  ClickSparkSection,
  ParallaxHeroSection,
  HorizontalScrollSection,
  CounterTickerSection,
  CircularGallerySection,
  ShimmerSkeletonSection,
  PageTransitionSection,
  StaggerListSection,
} from "./sections/InteractiveSections";

import PalettesSection from "./sections/PalettesSection";

function CategoryDivider({ name, count }: { name: string; count: number }) {
  return (
    <div className="py-20 px-8 flex items-center gap-6">
      <h2 className="text-4xl font-bold text-white/90">{name}</h2>
      <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
      <span className="text-sm text-white/40 font-mono">{count} effects</span>
    </div>
  );
}

export default function Home() {
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string }>).detail;
      setActiveId(detail.id);
    };
    window.addEventListener("fx-section-visible", handler);
    return () => window.removeEventListener("fx-section-visible", handler);
  }, []);

  const handleNavSelect = (id: string) => {
    setActiveId(id);
  };

  return (
    <div className="bg-zinc-950 min-h-screen">
      <Navigation
        items={SECTION_REGISTRY}
        activeId={activeId}
        onSelect={handleNavSelect}
      />

      {/* Main content — offset from left nav on desktop */}
      <main className="lg:pl-[60px]">
        <HeroSection />

        {/* Background */}
        <CategoryDivider name="Background" count={14} />
        <AuroraBgSection />
        <ConstellationBgSection />
        <GradientMeshSection />
        <MatrixRainSection />
        <RippleWaveSection />
        <StarfieldWarpSection />
        <GeometricMorphSection />
        <NoiseFlowFieldSection />
        <SilkWavesSection />
        <PlasmaShaderSection />
        <LightningBoltsSection />
        <LightRaysSection />
        <GridDistortionSection />
        <LiquidChromeSection />

        {/* Text */}
        <CategoryDivider name="Text" count={10} />
        <TypewriterTextSection />
        <TextRevealSection />
        <ScrambleTextSection />
        <SplitFlapSection />
        <MorphingTextSection />
        <StaggeredCharsSection />
        <GlitchTextSection />
        <ASCIITextSection />
        <TextPressureSection />
        <CircularTextSection />

        {/* Card */}
        <CategoryDivider name="Card" count={9} />
        <SpotlightCardsSection />
        <PhysicsCardsSection />
        <HolographicCardSection />
        <FlipCardSection />
        <StackSwipeSection />
        <BentoGridSection />
        <ParallaxDepthCardSection />
        <StickerPeelSection />
        <ReflectiveCardSection />

        {/* Cursor */}
        <CategoryDivider name="Cursor" count={6} />
        <CursorGlowSection />
        <BlobCursorSection />
        <SplashCursorSection />
        <PixelTrailSection />
        <ImageTrailSection />
        <GhostCursorSection />

        {/* Shader */}
        <CategoryDivider name="Shader" count={8} />
        <LiquidGlassSection />
        <HeroSceneSection />
        <MetallicPaintSection />
        <IridescenceSection />
        <LiquidEtherSection />
        <PrismRefractionSection />
        <MetaBallsSection />
        <NoiseGrainSection />

        {/* Interactive */}
        <CategoryDivider name="Interactive" count={17} />
        <MagneticButtonSection />
        <SpotlightInputSection />
        <InteractiveDotGridSection />
        <ScrollVelocitySection />
        <ParticleTextSection />
        <DockMagnifySection />
        <ConfettiBurstSection />
        <RippleButtonSection />
        <DragReorderSection />
        <ClickSparkSection />
        <ParallaxHeroSection />
        <HorizontalScrollSection />
        <CounterTickerSection />
        <CircularGallerySection />
        <ShimmerSkeletonSection />
        <PageTransitionSection />
        <StaggerListSection />

        {/* Palettes */}
        <PalettesSection />
      </main>
    </div>
  );
}
