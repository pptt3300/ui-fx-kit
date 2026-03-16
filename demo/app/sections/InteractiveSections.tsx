"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";
import { buildDefaults, type ControlDef } from "@demo/components/PlaygroundDrawer";
import { hexToRgb } from "@demo/lib/colorUtils";

const MagneticButton = dynamic(() => import("@effects/magnetic-button/MagneticButton"), { ssr: false });
const SpotlightInput = dynamic(() => import("@effects/spotlight-input/SpotlightInput"), { ssr: false });
const InteractiveDotGrid = dynamic(() => import("@effects/interactive-dot-grid/InteractiveDotGrid"), { ssr: false });
const ScrollVelocity = dynamic(() => import("@effects/scroll-velocity/ScrollVelocity"), { ssr: false });
const ParticleTitle = dynamic(() => import("@effects/particle-text/ParticleText"), { ssr: false });
const DockMagnify = dynamic(() => import("@effects/dock-magnify/DockMagnify"), { ssr: false });
const ConfettiBurst = dynamic(() => import("@effects/confetti-burst/ConfettiBurst"), { ssr: false });
const RippleButton = dynamic(() => import("@effects/ripple-button/RippleButton"), { ssr: false });
const DragReorder = dynamic(() => import("@effects/drag-reorder/DragReorder"), { ssr: false });
const ClickSpark = dynamic(() => import("@effects/click-spark/ClickSpark"), { ssr: false });
const ParallaxHero = dynamic(() => import("@effects/parallax-hero/ParallaxHero"), { ssr: false });
const HorizontalScroll = dynamic(() => import("@effects/horizontal-scroll/HorizontalScroll"), { ssr: false });
const CounterTicker = dynamic(() => import("@effects/counter-ticker/CounterTicker"), { ssr: false });
const CircularGallery = dynamic(() => import("@effects/circular-gallery/CircularGallery"), { ssr: false });
const ShimmerSkeleton = dynamic(() => import("@effects/shimmer-skeleton/ShimmerSkeleton"), { ssr: false });
const PageTransition = dynamic(() => import("@effects/page-transition/PageTransition"), { ssr: false });
const StaggerList = dynamic(() => import("@effects/stagger-list/StaggerList"), { ssr: false });

/* ── MagneticButton (demo wrapper, no tunable props) ───── */

export function MagneticButtonSection() {
  return (
    <EffectSection
      id="magnetic-button"
      title="Magnetic Button"
      description="Button that attracts the cursor within a proximity radius — spring physics."
      category="Interactive"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <MagneticButton />
      </div>
    </EffectSection>
  );
}

/* ── SpotlightInput (functional props only) ────────────── */

export function SpotlightInputSection() {
  return (
    <EffectSection
      id="spotlight-input"
      title="Spotlight Input"
      description="Input with spotlight glow, sparkle particles on focus, and shockwave on submit."
      category="Interactive"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <SpotlightInput
          onSubmit={() => {}}
          placeholder="Type something..."
          buttonLabel="Submit"
        />
      </div>
    </EffectSection>
  );
}

/* ── InteractiveDotGrid ────────────────────────────────── */

const DOTGRID_CONTROLS: ControlDef[] = [
  { key: "gap", label: "Gap", type: "slider", min: 12, max: 50, step: 2, default: 28 },
  { key: "influenceRadius", label: "Radius", type: "slider", min: 40, max: 250, step: 10, default: 120 },
  { key: "maxDisplacement", label: "Displacement", type: "slider", min: 4, max: 40, step: 2, default: 14 },
];
const DOTGRID_DEFAULTS = buildDefaults(DOTGRID_CONTROLS);

export function InteractiveDotGridSection() {
  const [values, setValues] = useState(DOTGRID_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="interactive-dot-grid"
      title="Interactive Dot Grid"
      description="A grid of dots that reacts to cursor proximity with displacement and connecting lines."
      category="Interactive"
      hooks={["useCanvasSetup", "useMousePosition"]}
      controls={DOTGRID_CONTROLS}
      values={values}
      defaultValues={DOTGRID_DEFAULTS}
      onChange={onChange}
    >
      <InteractiveDotGrid
        gap={values.gap as number}
        influenceRadius={values.influenceRadius as number}
        maxDisplacement={values.maxDisplacement as number}
      />
    </EffectSection>
  );
}

/* ── ScrollVelocity (demo wrapper, complex) ────────────── */

export function ScrollVelocitySection() {
  return (
    <EffectSection
      id="scroll-velocity"
      title="Scroll Velocity"
      description="Marquee text that speeds up and slows down based on scroll velocity."
      category="Interactive"
    >
      <div className="w-full h-full min-h-screen bg-zinc-950 flex items-center">
        <ScrollVelocity />
      </div>
    </EffectSection>
  );
}

/* ── ParticleText (state-driven toggle, not tunable) ───── */

export function ParticleTextSection() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <EffectSection
      id="particle-text"
      title="Particle Text"
      description="Text built from particles that explode and reform on toggle."
      category="Interactive"
    >
      <div
        className="flex flex-col items-center justify-center w-full h-full bg-zinc-950 min-h-screen gap-8 cursor-pointer"
        onClick={() => setCollapsed((c) => !c)}
      >
        <ParticleTitle text="ui-fx-kit" collapsed={collapsed} />
        <p className="text-white/20 text-xs font-mono pointer-events-none">click to toggle</p>
      </div>
    </EffectSection>
  );
}

/* ── DockMagnify ───────────────────────────────────────── */

const DOCK_CONTROLS: ControlDef[] = [
  { key: "baseSize", label: "Base Size", type: "slider", min: 32, max: 80, step: 4, default: 56 },
  { key: "maxSize", label: "Max Size", type: "slider", min: 64, max: 140, step: 4, default: 96 },
  { key: "radius", label: "Radius", type: "slider", min: 1, max: 6, step: 1, default: 3 },
];
const DOCK_DEFAULTS = buildDefaults(DOCK_CONTROLS);

export function DockMagnifySection() {
  const [values, setValues] = useState(DOCK_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  const items = [
    { icon: <span className="text-3xl">🎨</span>, label: "Design" },
    { icon: <span className="text-3xl">⚡</span>, label: "Build" },
    { icon: <span className="text-3xl">🚀</span>, label: "Ship" },
    { icon: <span className="text-3xl">📦</span>, label: "Package" },
    { icon: <span className="text-3xl">🔧</span>, label: "Config" },
    { icon: <span className="text-3xl">✨</span>, label: "Effects" },
  ];

  return (
    <EffectSection
      id="dock-magnify"
      title="Dock Magnify"
      description="macOS-style dock with Gaussian magnification based on cursor proximity."
      category="Interactive"
      controls={DOCK_CONTROLS}
      values={values}
      defaultValues={DOCK_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <DockMagnify
          items={items}
          baseSize={values.baseSize as number}
          maxSize={values.maxSize as number}
          radius={values.radius as number}
        />
      </div>
    </EffectSection>
  );
}

/* ── ConfettiBurst ─────────────────────────────────────── */

const CONFETTI_CONTROLS: ControlDef[] = [
  { key: "count", label: "Count", type: "slider", min: 20, max: 300, step: 10, default: 100 },
  { key: "spread", label: "Spread", type: "slider", min: 20, max: 360, step: 10, default: 90 },
  { key: "color0", label: "Color 1", type: "color", default: "#ff3b5c" },
  { key: "color1", label: "Color 2", type: "color", default: "#ffc107" },
  { key: "color2", label: "Color 3", type: "color", default: "#64dc78" },
];
const CONFETTI_DEFAULTS = buildDefaults(CONFETTI_CONTROLS);

export function ConfettiBurstSection() {
  const [values, setValues] = useState(CONFETTI_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  const colors = [
    hexToRgb(values.color0 as string),
    hexToRgb(values.color1 as string),
    hexToRgb(values.color2 as string),
  ];

  return (
    <EffectSection
      id="confetti-burst"
      title="Confetti Burst"
      description="Physics-based confetti explosion with gravity and rotation."
      category="Interactive"
      controls={CONFETTI_CONTROLS}
      values={values}
      defaultValues={CONFETTI_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <ConfettiBurst
          autoTrigger
          count={values.count as number}
          spread={values.spread as number}
          colors={colors}
        />
      </div>
    </EffectSection>
  );
}

/* ── RippleButton ──────────────────────────────────────── */

const RIPPLE_CONTROLS: ControlDef[] = [
  { key: "rippleColor", label: "Ripple Color", type: "color", default: "#ffffff" },
];
const RIPPLE_DEFAULTS = buildDefaults(RIPPLE_CONTROLS);

export function RippleButtonSection() {
  const [values, setValues] = useState(RIPPLE_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  const rippleColor = hexToRgb(values.rippleColor as string);

  return (
    <EffectSection
      id="ripple-button"
      title="Ripple Button"
      description="Material Design-style ripple emanating from the click point."
      category="Interactive"
      controls={RIPPLE_CONTROLS}
      values={values}
      defaultValues={RIPPLE_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen gap-6">
        <RippleButton
          className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
          rippleColor={rippleColor}
        >
          Click me
        </RippleButton>
        <RippleButton
          className="px-8 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm"
          rippleColor={rippleColor}
        >
          Or me
        </RippleButton>
      </div>
    </EffectSection>
  );
}

/* ── DragReorder ───────────────────────────────────────── */

const DRAG_CONTROLS: ControlDef[] = [
  { key: "itemHeight", label: "Item Height", type: "slider", min: 40, max: 80, step: 4, default: 56 },
];
const DRAG_DEFAULTS = buildDefaults(DRAG_CONTROLS);

function DragReorderDemo({ itemHeight }: { itemHeight: number }) {
  const initialItems = [
    { id: "1", label: "Aurora Background" },
    { id: "2", label: "Gradient Mesh" },
    { id: "3", label: "Matrix Rain" },
    { id: "4", label: "Noise Flow Field" },
    { id: "5", label: "Silk Waves" },
  ];

  type Item = typeof initialItems[number];
  const [items, setItems] = useState<Item[]>(initialItems);

  return (
    <DragReorder
      items={items}
      onReorder={(newItems) => setItems(newItems as Item[])}
      itemHeight={itemHeight}
      renderItem={(item) => {
        const it = item as Item;
        return (
          <div
            className="flex items-center gap-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm font-medium cursor-grab active:cursor-grabbing select-none"
            style={{ height: itemHeight }}
          >
            <span className="text-white/20">&gt;</span>
            {it.label}
          </div>
        );
      }}
      className="w-72"
    />
  );
}

export function DragReorderSection() {
  const [values, setValues] = useState(DRAG_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="drag-reorder"
      title="Drag Reorder"
      description="Smooth drag-to-reorder list with spring animation and live index tracking."
      category="Interactive"
      controls={DRAG_CONTROLS}
      values={values}
      defaultValues={DRAG_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <DragReorderDemo itemHeight={values.itemHeight as number} />
      </div>
    </EffectSection>
  );
}

/* ── ClickSpark ────────────────────────────────────────── */

const SPARK_CONTROLS: ControlDef[] = [
  { key: "count", label: "Count", type: "slider", min: 4, max: 24, step: 2, default: 10 },
  { key: "length", label: "Length", type: "slider", min: 6, max: 40, step: 2, default: 18 },
  { key: "color", label: "Color", type: "color", default: "#fbbf24" },
];
const SPARK_DEFAULTS = buildDefaults(SPARK_CONTROLS);

export function ClickSparkSection() {
  const [values, setValues] = useState(SPARK_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  const color = hexToRgb(values.color as string);

  return (
    <EffectSection
      id="click-spark"
      title="Click Spark"
      description="Burst of spark lines radiating from each click point."
      category="Interactive"
      controls={SPARK_CONTROLS}
      values={values}
      defaultValues={SPARK_DEFAULTS}
      onChange={onChange}
    >
      <div className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
        <ClickSpark
          count={values.count as number}
          color={color}
          length={values.length as number}
          className="absolute inset-0"
        />
        <p className="text-white/20 text-sm font-mono pointer-events-none select-none">click anywhere</p>
      </div>
    </EffectSection>
  );
}

/* ── ParallaxHero (content-heavy, skip) ────────────────── */

export function ParallaxHeroSection() {
  return (
    <section id="parallax-hero" className="relative">
      <div className="absolute top-4 left-4 z-20">
        <span className="text-xs border rounded-full px-3 py-1 bg-orange-500/20 text-orange-300 border-orange-500/30">
          Interactive
        </span>
      </div>
      <ParallaxHero
        height="250vh"
        layers={[
          {
            speed: 0.2,
            content: (
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-violet-950 to-zinc-950" />
            ),
          },
          {
            speed: 0.5,
            content: (
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="w-[500px] h-[500px] rounded-full bg-indigo-500 blur-[120px]" />
              </div>
            ),
          },
          {
            speed: 0.8,
            content: (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white/10 font-black text-[12rem] leading-none select-none">FX</p>
                </div>
              </div>
            ),
          },
          {
            speed: 1,
            content: (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-white font-black text-6xl mb-4">Parallax Hero</p>
                  <p className="text-white/40 text-sm font-mono">scroll through this section</p>
                </div>
              </div>
            ),
          },
        ]}
      />
    </section>
  );
}

/* ── HorizontalScroll ──────────────────────────────────── */

const HSCROLL_CONTROLS: ControlDef[] = [
  { key: "cardWidth", label: "Card Width", type: "slider", min: 180, max: 500, step: 20, default: 280 },
  { key: "gap", label: "Gap", type: "slider", min: 8, max: 48, step: 4, default: 20 },
];
const HSCROLL_DEFAULTS = buildDefaults(HSCROLL_CONTROLS);

export function HorizontalScrollSection() {
  const [values, setValues] = useState(HSCROLL_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  const items = Array.from({ length: 8 }, (_, i) => (
    <div
      key={i}
      className="w-full h-full rounded-2xl flex items-center justify-center text-white font-bold text-lg"
      style={{
        background: `hsl(${220 + i * 20}, 70%, 25%)`,
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      Panel {i + 1}
    </div>
  ));

  return (
    <EffectSection
      id="horizontal-scroll"
      title="Horizontal Scroll"
      description="Vertical scroll converted to horizontal movement — magazine scroll pattern."
      category="Interactive"
      controls={HSCROLL_CONTROLS}
      values={values}
      defaultValues={HSCROLL_DEFAULTS}
      onChange={onChange}
    >
      <div className="w-full">
        <HorizontalScroll
          items={items}
          cardWidth={values.cardWidth as number}
          gap={values.gap as number}
        />
      </div>
    </EffectSection>
  );
}

/* ── CounterTicker ─────────────────────────────────────── */

const COUNTER_CONTROLS: ControlDef[] = [
  { key: "value", label: "Value", type: "slider", min: 0, max: 99999, step: 100, default: 42850 },
];
const COUNTER_DEFAULTS = buildDefaults(COUNTER_CONTROLS);

export function CounterTickerSection() {
  const [values, setValues] = useState(COUNTER_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="counter-ticker"
      title="Counter Ticker"
      description="Slot-machine digit scroll to animate numbers on scroll into view."
      category="Interactive"
      hooks={["useSpring", "useInView"]}
      controls={COUNTER_CONTROLS}
      values={values}
      defaultValues={COUNTER_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex flex-col items-center justify-center gap-12 w-full h-full bg-zinc-950 min-h-screen">
        <div className="text-center">
          <CounterTicker value={values.value as number} className="text-6xl font-black text-white" />
          <p className="text-white/30 text-xs mt-2 font-mono">downloads</p>
        </div>
      </div>
    </EffectSection>
  );
}

/* ── CircularGallery ───────────────────────────────────── */

const GALLERY_CONTROLS: ControlDef[] = [
  { key: "radius", label: "Radius", type: "slider", min: 150, max: 500, step: 10, default: 260 },
  { key: "autoSpeed", label: "Auto Speed", type: "slider", min: 0, max: 2, step: 0.1, default: 0.4 },
  { key: "draggable", label: "Draggable", type: "toggle", default: true },
];
const GALLERY_DEFAULTS = buildDefaults(GALLERY_CONTROLS);

export function CircularGallerySection() {
  const [values, setValues] = useState(GALLERY_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  const items = Array.from({ length: 8 }, (_, i) => (
    <div
      key={i}
      className="w-32 h-32 rounded-2xl flex items-center justify-center text-white font-bold"
      style={{
        background: `hsl(${220 + i * 25}, 65%, 30%)`,
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      {i + 1}
    </div>
  ));

  return (
    <EffectSection
      id="circular-gallery"
      title="Circular Gallery"
      description="Draggable items arranged on a 3D circular carousel with momentum."
      category="Interactive"
      hooks={["useGesture", "useSpring"]}
      controls={GALLERY_CONTROLS}
      values={values}
      defaultValues={GALLERY_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <CircularGallery
          items={items}
          radius={values.radius as number}
          autoSpeed={values.autoSpeed as number}
          draggable={values.draggable as boolean}
        />
      </div>
    </EffectSection>
  );
}

/* ── ShimmerSkeleton ───────────────────────────────────── */

const SHIMMER_CONTROLS: ControlDef[] = [
  { key: "preset", label: "Preset", type: "select", options: ["card", "list-item", "profile", "paragraph"], default: "card" },
  { key: "dark", label: "Dark Mode", type: "toggle", default: true },
];
const SHIMMER_DEFAULTS = buildDefaults(SHIMMER_CONTROLS);

export function ShimmerSkeletonSection() {
  const [values, setValues] = useState(SHIMMER_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="shimmer-skeleton"
      title="Shimmer Skeleton"
      description="Animated loading skeleton with shimmer sweep and preset shapes."
      category="Interactive"
      css={["shimmer.css"]}
      controls={SHIMMER_CONTROLS}
      values={values}
      defaultValues={SHIMMER_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen gap-8 flex-wrap p-8">
        <ShimmerSkeleton
          preset={values.preset as "card" | "list-item" | "profile" | "paragraph"}
          dark={values.dark as boolean}
          className="w-64"
        />
      </div>
    </EffectSection>
  );
}

/* ── PageTransition ────────────────────────────────────── */

const PAGETRANS_CONTROLS: ControlDef[] = [
  { key: "type", label: "Type", type: "select", options: ["morph", "fade", "slide"], default: "morph" },
];
const PAGETRANS_DEFAULTS = buildDefaults(PAGETRANS_CONTROLS);

function PageTransitionDemo({ type }: { type: "morph" | "fade" | "slide" }) {
  const [page, setPage] = useState<"a" | "b">("a");

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="relative w-80 h-48 overflow-hidden rounded-2xl">
        <PageTransition activeKey={page} type={type} className="w-full h-full">
          {page === "a" ? (
            <div className="w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-700 to-violet-800">
              <p className="text-white font-bold text-2xl">Page A</p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-700 to-rose-800">
              <p className="text-white font-bold text-2xl">Page B</p>
            </div>
          )}
        </PageTransition>
      </div>
      <button
        onClick={() => setPage((p) => (p === "a" ? "b" : "a"))}
        className="px-6 py-2 rounded-xl text-sm font-semibold text-white bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
      >
        Toggle Page
      </button>
    </div>
  );
}

export function PageTransitionSection() {
  const [values, setValues] = useState(PAGETRANS_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="page-transition"
      title="Page Transition"
      description="Morph, fade, or slide transitions between content slots — router-ready."
      category="Interactive"
      controls={PAGETRANS_CONTROLS}
      values={values}
      defaultValues={PAGETRANS_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <PageTransitionDemo type={values.type as "morph" | "fade" | "slide"} />
      </div>
    </EffectSection>
  );
}

/* ── StaggerList ───────────────────────────────────────── */

const STAGGER_CONTROLS: ControlDef[] = [
  { key: "variant", label: "Variant", type: "select", options: ["slide-up", "scale-in", "blur-in", "flip-in"], default: "slide-up" },
  { key: "duration", label: "Duration", type: "slider", min: 100, max: 1000, step: 50, default: 400 },
];
const STAGGER_DEFAULTS = buildDefaults(STAGGER_CONTROLS);

export function StaggerListSection() {
  const [values, setValues] = useState(STAGGER_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="stagger-list"
      title="Stagger List"
      description="List items animate in with configurable stagger patterns and variants."
      category="Interactive"
      hooks={["useStagger", "useInView"]}
      css={["stagger-presets.css"]}
      controls={STAGGER_CONTROLS}
      values={values}
      defaultValues={STAGGER_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <StaggerList
          variant={values.variant as "slide-up" | "scale-in" | "blur-in" | "flip-in"}
          duration={values.duration as number}
          trigger="inView"
          className="w-64 flex flex-col gap-2"
        >
          {[
            "Aurora Background",
            "Gradient Mesh",
            "Typewriter Text",
            "Holographic Card",
            "Cursor Glow",
            "Liquid Glass",
          ].map((name) => (
            <div
              key={name}
              className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm"
            >
              {name}
            </div>
          ))}
        </StaggerList>
      </div>
    </EffectSection>
  );
}
