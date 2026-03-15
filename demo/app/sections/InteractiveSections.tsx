"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";

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

export function InteractiveDotGridSection() {
  return (
    <EffectSection
      id="interactive-dot-grid"
      title="Interactive Dot Grid"
      description="Dot grid that reacts to mouse proximity with spring-based displacement."
      category="Interactive"
    >
      <div className="w-full h-full min-h-screen">
        <InteractiveDotGrid />
      </div>
    </EffectSection>
  );
}

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

export function DockMagnifySection() {
  const items = [
    { icon: <span className="text-2xl">🎨</span>, label: "Design" },
    { icon: <span className="text-2xl">⚡</span>, label: "Build" },
    { icon: <span className="text-2xl">🚀</span>, label: "Ship" },
    { icon: <span className="text-2xl">📦</span>, label: "Package" },
    { icon: <span className="text-2xl">🔧</span>, label: "Config" },
    { icon: <span className="text-2xl">✨</span>, label: "Effects" },
  ];

  return (
    <EffectSection
      id="dock-magnify"
      title="Dock Magnify"
      description="macOS-style dock with Gaussian magnification based on cursor proximity."
      category="Interactive"
    >
      <div className="flex items-end justify-center w-full h-full bg-zinc-950 min-h-screen pb-16">
        <DockMagnify items={items} baseSize={52} maxSize={88} />
      </div>
    </EffectSection>
  );
}

export function ConfettiBurstSection() {
  return (
    <EffectSection
      id="confetti-burst"
      title="Confetti Burst"
      description="Physics-based confetti explosion with gravity and rotation."
      category="Interactive"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <ConfettiBurst autoTrigger />
      </div>
    </EffectSection>
  );
}

export function RippleButtonSection() {
  return (
    <EffectSection
      id="ripple-button"
      title="Ripple Button"
      description="Material Design-style ripple emanating from the click point."
      category="Interactive"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen gap-6">
        <RippleButton
          className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm"
          rippleColor={[255, 255, 255]}
        >
          Click me
        </RippleButton>
        <RippleButton
          className="px-8 py-3 rounded-xl bg-violet-600 text-white font-semibold text-sm"
          rippleColor={[255, 255, 255]}
        >
          Or me
        </RippleButton>
      </div>
    </EffectSection>
  );
}

function DragReorderDemo() {
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
      itemHeight={56}
      renderItem={(item) => {
        const it = item as Item;
        return (
          <div className="flex items-center gap-3 px-4 h-14 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm font-medium cursor-grab active:cursor-grabbing select-none">
            <span className="text-white/20">⠿</span>
            {it.label}
          </div>
        );
      }}
      className="w-72"
    />
  );
}

export function DragReorderSection() {
  return (
    <EffectSection
      id="drag-reorder"
      title="Drag Reorder"
      description="Smooth drag-to-reorder list with spring animation and live index tracking."
      category="Interactive"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <DragReorderDemo />
      </div>
    </EffectSection>
  );
}

export function ClickSparkSection() {
  return (
    <EffectSection
      id="click-spark"
      title="Click Spark"
      description="Burst of spark lines radiating from each click point."
      category="Interactive"
    >
      <div className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
        <ClickSpark count={10} color={[251, 191, 36]} length={18} className="absolute inset-0" />
        <p className="text-white/20 text-sm font-mono pointer-events-none select-none">click anywhere</p>
      </div>
    </EffectSection>
  );
}

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

export function HorizontalScrollSection() {
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
    >
      <div className="w-full">
        <HorizontalScroll items={items} cardWidth={280} gap={20} />
      </div>
    </EffectSection>
  );
}

export function CounterTickerSection() {
  return (
    <EffectSection
      id="counter-ticker"
      title="Counter Ticker"
      description="Slot-machine digit scroll to animate numbers on scroll into view."
      category="Interactive"
      hooks={["useSpring", "useInView"]}
    >
      <div className="flex flex-col items-center justify-center gap-12 w-full h-full bg-zinc-950 min-h-screen">
        <div className="text-center">
          <CounterTicker value={42850} className="text-6xl font-black text-white" />
          <p className="text-white/30 text-xs mt-2 font-mono">downloads</p>
        </div>
        <div className="text-center">
          <CounterTicker value={64} className="text-6xl font-black text-indigo-400" />
          <p className="text-white/30 text-xs mt-2 font-mono">effects</p>
        </div>
      </div>
    </EffectSection>
  );
}

export function CircularGallerySection() {
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
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <CircularGallery items={items} radius={260} autoSpeed={0.4} />
      </div>
    </EffectSection>
  );
}

export function ShimmerSkeletonSection() {
  return (
    <EffectSection
      id="shimmer-skeleton"
      title="Shimmer Skeleton"
      description="Animated loading skeleton with shimmer sweep and preset shapes."
      category="Interactive"
      css={["shimmer.css"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen gap-8 flex-wrap p-8">
        <ShimmerSkeleton preset="card" className="w-64" />
        <ShimmerSkeleton preset="profile" className="w-48" />
      </div>
    </EffectSection>
  );
}

function PageTransitionDemo() {
  const [page, setPage] = useState<"a" | "b">("a");

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="relative w-80 h-48 overflow-hidden rounded-2xl">
        <PageTransition activeKey={page} type="morph" className="w-full h-full">
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
  return (
    <EffectSection
      id="page-transition"
      title="Page Transition"
      description="Morph, fade, or slide transitions between content slots — router-ready."
      category="Interactive"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <PageTransitionDemo />
      </div>
    </EffectSection>
  );
}

export function StaggerListSection() {
  return (
    <EffectSection
      id="stagger-list"
      title="Stagger List"
      description="List items animate in with configurable stagger patterns and variants."
      category="Interactive"
      hooks={["useStagger", "useInView"]}
      css={["stagger-presets.css"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <StaggerList variant="slide-up" trigger="inView" className="w-64 flex flex-col gap-2">
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
