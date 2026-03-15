"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";

const SpotlightCards = dynamic(() => import("@effects/spotlight-cards/SpotlightCards"), { ssr: false });
const PhysicsCards = dynamic(() => import("@effects/physics-cards/PhysicsCards"), { ssr: false });
const HolographicCard = dynamic(() => import("@effects/holographic-card/HolographicCard"), { ssr: false });
const FlipCard = dynamic(() => import("@effects/flip-card/FlipCard"), { ssr: false });
const StackSwipe = dynamic(() => import("@effects/stack-swipe/StackSwipe"), { ssr: false });
const BentoGrid = dynamic(() => import("@effects/bento-grid/BentoGrid"), { ssr: false });
const ParallaxDepthCard = dynamic(() => import("@effects/parallax-depth-card/ParallaxDepthCard"), { ssr: false });
const StickerPeel = dynamic(() => import("@effects/sticker-peel/StickerPeel"), { ssr: false });
const ReflectiveCard = dynamic(() => import("@effects/reflective-card/ReflectiveCard"), { ssr: false });

export function SpotlightCardsSection() {
  return (
    <EffectSection
      id="spotlight-cards"
      title="Spotlight Cards"
      description="Mouse-tracking spotlight that illuminates cards from within. Dark glassmorphism."
      category="Card"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <SpotlightCards />
      </div>
    </EffectSection>
  );
}

export function PhysicsCardsSection() {
  return (
    <EffectSection
      id="physics-cards"
      title="Physics Cards"
      description="Draggable cards with spring physics, tilt on hover, and collision stacking."
      category="Card"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <PhysicsCards />
      </div>
    </EffectSection>
  );
}

export function HolographicCardSection() {
  return (
    <EffectSection
      id="holographic-card"
      title="Holographic Card"
      description="Foil shimmer with sparkle particles and dynamic 3D tilt."
      category="Card"
      hooks={["useTilt3D"]}
      css={["holographic.css"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <HolographicCard className="w-64 h-96">
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center">
              <span className="text-2xl">✦</span>
            </div>
            <p className="text-white font-bold text-lg">Holographic</p>
            <p className="text-white/50 text-xs text-center">Hover to see the shimmer effect</p>
          </div>
        </HolographicCard>
      </div>
    </EffectSection>
  );
}

export function FlipCardSection() {
  return (
    <EffectSection
      id="flip-card"
      title="Flip Card"
      description="3D card flip with spring physics. Supports hover and click triggers."
      category="Card"
      hooks={["useSpring"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <FlipCard
          className="w-64 h-40"
          front={
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center">
              <p className="text-white font-bold text-lg">Front</p>
            </div>
          }
          back={
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-cyan-600 to-indigo-700 flex items-center justify-center">
              <p className="text-white font-bold text-lg">Back</p>
            </div>
          }
        />
      </div>
    </EffectSection>
  );
}

export function StackSwipeSection() {
  const cards = [
    <div key="1" className="w-full h-full rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center"><p className="text-white text-2xl font-bold">Card 1</p></div>,
    <div key="2" className="w-full h-full rounded-3xl bg-gradient-to-br from-pink-600 to-rose-700 flex items-center justify-center"><p className="text-white text-2xl font-bold">Card 2</p></div>,
    <div key="3" className="w-full h-full rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center"><p className="text-white text-2xl font-bold">Card 3</p></div>,
    <div key="4" className="w-full h-full rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center"><p className="text-white text-2xl font-bold">Card 4</p></div>,
  ];

  return (
    <EffectSection
      id="stack-swipe"
      title="Stack Swipe"
      description="Tinder-style swipeable card stack with spring physics and velocity detection."
      category="Card"
      hooks={["useGesture", "useSpring"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <StackSwipe items={cards} className="w-72 h-96" />
      </div>
    </EffectSection>
  );
}

export function BentoGridSection() {
  const items = [
    {
      content: (
        <div className="flex flex-col gap-2 p-4 h-full">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/30 flex items-center justify-center text-indigo-400 text-lg">⚡</div>
          <p className="text-white font-semibold text-sm">Fast</p>
          <p className="text-white/40 text-xs">Zero-dep hooks</p>
        </div>
      ),
      colSpan: 1,
    },
    {
      content: (
        <div className="flex flex-col gap-2 p-4 h-full">
          <div className="w-8 h-8 rounded-lg bg-violet-500/30 flex items-center justify-center text-violet-400 text-lg">🎨</div>
          <p className="text-white font-semibold text-sm">Composable</p>
          <p className="text-white/40 text-xs">Mix and match effects</p>
        </div>
      ),
      colSpan: 2,
    },
    {
      content: (
        <div className="flex flex-col gap-2 p-4 h-full">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg">📦</div>
          <p className="text-white font-semibold text-sm">64 Effects</p>
          <p className="text-white/40 text-xs">Hooks, CSS, Components</p>
        </div>
      ),
      colSpan: 2,
    },
    {
      content: (
        <div className="flex flex-col gap-2 p-4 h-full">
          <div className="w-8 h-8 rounded-lg bg-pink-500/30 flex items-center justify-center text-pink-400 text-lg">✦</div>
          <p className="text-white font-semibold text-sm">Open Source</p>
          <p className="text-white/40 text-xs">MIT License</p>
        </div>
      ),
      colSpan: 1,
    },
  ];

  return (
    <EffectSection
      id="bento-grid"
      title="Bento Grid"
      description="Apple-inspired bento layout with per-cell 3D tilt and staggered entrance."
      category="Card"
      hooks={["useTilt3D", "useStagger", "useInView"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen p-8">
        <BentoGrid items={items} columns={3} className="max-w-xl w-full" />
      </div>
    </EffectSection>
  );
}

export function ParallaxDepthCardSection() {
  return (
    <EffectSection
      id="parallax-depth-card"
      title="Parallax Depth Card"
      description="Multi-layer card with per-layer parallax depth on hover. 3D immersion effect."
      category="Card"
      hooks={["useTilt3D"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <ParallaxDepthCard
          className="w-72 h-48"
          layers={[
            <div key="bg" className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-900 to-zinc-900" />,
            <div key="mid" className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/20 blur-2xl" />
            </div>,
            <div key="fg" className="absolute inset-0 flex items-center justify-center">
              <p className="text-white font-bold text-xl">Depth</p>
            </div>,
          ]}
        />
      </div>
    </EffectSection>
  );
}

export function StickerPeelSection() {
  return (
    <EffectSection
      id="sticker-peel"
      title="Sticker Peel"
      description="Corner-peel effect that reveals content beneath, triggered by mouse proximity."
      category="Card"
      css={["sticker-peel.css"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <StickerPeel
          className="w-64 h-64"
          front={
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center">
              <p className="text-white font-bold text-lg">Hover corner</p>
            </div>
          }
          behind={
            <div className="w-full h-full rounded-2xl bg-zinc-800 flex items-center justify-center">
              <p className="text-white/50 text-sm">underneath</p>
            </div>
          }
        />
      </div>
    </EffectSection>
  );
}

export function ReflectiveCardSection() {
  return (
    <EffectSection
      id="reflective-card"
      title="Reflective Card"
      description="Glass or metallic card surface with dynamic light reflection on tilt."
      category="Card"
      hooks={["useTilt3D"]}
      css={["iridescent.css"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <ReflectiveCard type="metallic" className="w-64 h-40">
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-white/90 font-bold text-lg">Reflective</p>
            <p className="text-white/40 text-xs">Move your mouse over the card</p>
          </div>
        </ReflectiveCard>
      </div>
    </EffectSection>
  );
}
