"use client";

import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";

const TypewriterText = dynamic(() => import("@effects/typewriter-text/TypewriterText"), { ssr: false });
const TextReveal = dynamic(() => import("@effects/text-reveal/TextReveal"), { ssr: false });
const ScrambleText = dynamic(() => import("@effects/scramble-text/ScrambleText"), { ssr: false });
const SplitFlap = dynamic(() => import("@effects/split-flap/SplitFlap"), { ssr: false });
const MorphingText = dynamic(() => import("@effects/morphing-text/MorphingText"), { ssr: false });
const StaggeredChars = dynamic(() => import("@effects/staggered-chars/StaggeredChars"), { ssr: false });
const GlitchText = dynamic(() => import("@effects/glitch-text/GlitchText"), { ssr: false });
const ASCIIText = dynamic(() => import("@effects/ascii-text/ASCIIText"), { ssr: false });
const TextPressure = dynamic(() => import("@effects/text-pressure/TextPressure"), { ssr: false });
const CircularText = dynamic(() => import("@effects/circular-text/CircularText"), { ssr: false });

export function TypewriterTextSection() {
  return (
    <EffectSection
      id="typewriter-text"
      title="Typewriter Text"
      description="Realistic keystroke simulation with cursor blink and multi-phrase cycling."
      category="Text"
      hooks={["useTypewriter"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <div className="text-center">
          <TypewriterText
            phrases={["Build fast.", "Ship with confidence.", "Scale effortlessly."]}
          />
        </div>
      </div>
    </EffectSection>
  );
}

export function TextRevealSection() {
  return (
    <EffectSection
      id="text-reveal"
      title="Text Reveal"
      description="Scroll-driven word-by-word reveal with opacity and blur transitions."
      category="Text"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen overflow-y-auto">
        <TextReveal />
      </div>
    </EffectSection>
  );
}

export function ScrambleTextSection() {
  return (
    <EffectSection
      id="scramble-text"
      title="Scramble Text"
      description="Matrix-style character scramble that resolves to the target string."
      category="Text"
      hooks={["useScramble"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <ScrambleText
          text="ui-fx-kit"
          trigger="inView"
          className="text-6xl font-black tracking-tight text-white font-mono"
        />
      </div>
    </EffectSection>
  );
}

export function SplitFlapSection() {
  return (
    <EffectSection
      id="split-flap"
      title="Split Flap"
      description="Airport departure board flip animation — each character flips through the alphabet."
      category="Text"
      hooks={["useSplitFlap"]}
      css={["split-flap.css"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <SplitFlap text="UI FX KIT" />
      </div>
    </EffectSection>
  );
}

export function MorphingTextSection() {
  return (
    <EffectSection
      id="morphing-text"
      title="Morphing Text"
      description="Smooth blur-morph transition between words. Google Fonts style."
      category="Text"
      hooks={["useMorphText"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <MorphingText
          texts={["Build", "Ship", "Scale", "Iterate"]}
          className="text-7xl font-black text-white tracking-tight"
        />
      </div>
    </EffectSection>
  );
}

export function StaggeredCharsSection() {
  return (
    <EffectSection
      id="staggered-chars"
      title="Staggered Chars"
      description="Per-character entrance animation with wave, bounce, rotate, and more variants."
      category="Text"
      hooks={["useStagger"]}
      css={["stagger-presets.css"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <StaggeredChars
          text="effects"
          variant="wave"
          trigger="inView"
          className="text-7xl font-black text-white tracking-tight"
        />
      </div>
    </EffectSection>
  );
}

export function GlitchTextSection() {
  return (
    <EffectSection
      id="glitch-text"
      title="Glitch Text"
      description="CSS glitch effect with RGB split and scanline artifacts. Mouse-reactive."
      category="Text"
      css={["glitch-effect.css"]}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <GlitchText
          text="GLITCH"
          intensity={0.6}
          mode="continuous"
          className="text-7xl font-black tracking-tight"
        />
      </div>
    </EffectSection>
  );
}

export function ASCIITextSection() {
  return (
    <EffectSection
      id="ascii-text"
      title="ASCII Text"
      description="Canvas-rendered ASCII art text with mouse proximity reveal."
      category="Text"
    >
      <div className="flex items-center justify-center w-full h-full bg-black min-h-screen">
        <ASCIIText
          text="ASCII"
          fontSize={12}
        />
      </div>
    </EffectSection>
  );
}

export function TextPressureSection() {
  return (
    <EffectSection
      id="text-pressure"
      title="Text Pressure"
      description="Variable-font weight morphs based on mouse proximity to each character."
      category="Text"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <TextPressure
          text="PRESSURE"
          className="text-6xl font-black text-white tracking-tight select-none"
        />
      </div>
    </EffectSection>
  );
}

export function CircularTextSection() {
  return (
    <EffectSection
      id="circular-text"
      title="Circular Text"
      description="Text arranged on a circle path with auto-rotate and hover-reverse."
      category="Text"
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <CircularText
          text="ui-fx-kit · composable effects · "
          radius={120}
          speed={30}
        />
      </div>
    </EffectSection>
  );
}
