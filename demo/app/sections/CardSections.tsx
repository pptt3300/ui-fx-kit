"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";
import { buildDefaults, type ControlDef } from "@demo/components/PlaygroundDrawer";

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
      <div className="flex items-center justify-center w-full h-full bg-slate-950 p-8">
        <div className="max-w-5xl w-full">
          <SpotlightCards embedded />
        </div>
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
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 p-8">
        <div className="max-w-5xl w-full">
          <PhysicsCards embedded />
        </div>
      </div>
    </EffectSection>
  );
}

const HOLO_CONTROLS: ControlDef[] = [
  { key: "tiltMax", label: "Tilt Max", type: "slider", min: 5, max: 30, step: 1, default: 15 },
  { key: "sparkles", label: "Sparkles", type: "toggle", default: true },
];
const HOLO_DEFAULTS = buildDefaults(HOLO_CONTROLS);

export function HolographicCardSection() {
  const [values, setValues] = useState(HOLO_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="holographic-card"
      title="Holographic Card"
      description="Foil shimmer with sparkle particles and dynamic 3D tilt."
      category="Card"
      hooks={["useTilt3D"]}
      css={["holographic.css"]}
      controls={HOLO_CONTROLS}
      values={values}
      defaultValues={HOLO_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <HolographicCard
          className="w-64 h-96"
          tiltMax={values.tiltMax as number}
          sparkles={values.sparkles as boolean}
        >
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

const FLIP_CONTROLS: ControlDef[] = [
  { key: "trigger", label: "Trigger", type: "select", options: ["hover", "click"], default: "hover" },
  { key: "direction", label: "Direction", type: "select", options: ["horizontal", "vertical"], default: "horizontal" },
];
const FLIP_DEFAULTS = buildDefaults(FLIP_CONTROLS);

export function FlipCardSection() {
  const [values, setValues] = useState(FLIP_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="flip-card"
      title="Flip Card"
      description="3D card flip with spring physics. Supports hover and click triggers."
      category="Card"
      hooks={["useSpring"]}
      controls={FLIP_CONTROLS}
      values={values}
      defaultValues={FLIP_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <FlipCard
          className="w-64 h-40"
          trigger={values.trigger as "hover" | "click"}
          direction={values.direction as "horizontal" | "vertical"}
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

const STACK_CONTROLS: ControlDef[] = [
  { key: "stackDepth", label: "Stack Depth", type: "slider", min: 1, max: 5, step: 1, default: 3 },
];
const STACK_DEFAULTS = buildDefaults(STACK_CONTROLS);

export function StackSwipeSection() {
  const [values, setValues] = useState(STACK_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

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
      controls={STACK_CONTROLS}
      values={values}
      defaultValues={STACK_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <StackSwipe items={cards} className="w-72 h-96" stackDepth={values.stackDepth as number} />
      </div>
    </EffectSection>
  );
}

const BENTO_CONTROLS: ControlDef[] = [
  { key: "columns", label: "Columns", type: "slider", min: 1, max: 6, step: 1, default: 3 },
  { key: "gap", label: "Gap", type: "slider", min: 4, max: 32, step: 2, default: 16 },
];
const BENTO_DEFAULTS = buildDefaults(BENTO_CONTROLS);

export function BentoGridSection() {
  const [values, setValues] = useState(BENTO_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

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
      controls={BENTO_CONTROLS}
      values={values}
      defaultValues={BENTO_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen p-8">
        <BentoGrid items={items} columns={values.columns as number} gap={values.gap as number} className="max-w-xl w-full" />
      </div>
    </EffectSection>
  );
}

const PARALLAX_CONTROLS: ControlDef[] = [
  { key: "depthScale", label: "Depth Scale", type: "slider", min: 1, max: 30, step: 1, default: 10 },
  { key: "tilt", label: "Tilt", type: "toggle", default: true },
];
const PARALLAX_DEFAULTS = buildDefaults(PARALLAX_CONTROLS);

export function ParallaxDepthCardSection() {
  const [values, setValues] = useState(PARALLAX_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="parallax-depth-card"
      title="Parallax Depth Card"
      description="Multi-layer card with per-layer parallax depth on hover. 3D immersion effect."
      category="Card"
      hooks={["useTilt3D"]}
      controls={PARALLAX_CONTROLS}
      values={values}
      defaultValues={PARALLAX_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <ParallaxDepthCard
          className="w-72 h-48"
          depthScale={values.depthScale as number}
          tilt={values.tilt as boolean}
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

const STICKER_CONTROLS: ControlDef[] = [
  { key: "corner", label: "Corner", type: "select", options: ["bottom-right", "bottom-left", "top-right", "top-left"], default: "bottom-right" },
];
const STICKER_DEFAULTS = buildDefaults(STICKER_CONTROLS);

export function StickerPeelSection() {
  const [values, setValues] = useState(STICKER_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="sticker-peel"
      title="Sticker Peel"
      description="Corner-peel effect that reveals content beneath, triggered by mouse proximity."
      category="Card"
      css={["sticker-peel.css"]}
      controls={STICKER_CONTROLS}
      values={values}
      defaultValues={STICKER_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <StickerPeel
          className="w-64 h-64"
          corner={values.corner as "bottom-right" | "bottom-left" | "top-right" | "top-left"}
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

const REFLECTIVE_CONTROLS: ControlDef[] = [
  { key: "type", label: "Type", type: "select", options: ["glass", "metallic"], default: "glass" },
  { key: "tiltMax", label: "Tilt Max", type: "slider", min: 2, max: 25, step: 1, default: 10 },
];
const REFLECTIVE_DEFAULTS = buildDefaults(REFLECTIVE_CONTROLS);

export function ReflectiveCardSection() {
  const [values, setValues] = useState(REFLECTIVE_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="reflective-card"
      title="Reflective Card"
      description="Glass or metallic card surface with dynamic light reflection on tilt."
      category="Card"
      hooks={["useTilt3D"]}
      css={["iridescent.css"]}
      controls={REFLECTIVE_CONTROLS}
      values={values}
      defaultValues={REFLECTIVE_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <ReflectiveCard type={values.type as "glass" | "metallic"} tiltMax={values.tiltMax as number} className="w-64 h-40">
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <p className="text-white/90 font-bold text-lg">Reflective</p>
            <p className="text-white/40 text-xs">Move your mouse over the card</p>
          </div>
        </ReflectiveCard>
      </div>
    </EffectSection>
  );
}
