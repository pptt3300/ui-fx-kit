"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";
import { buildDefaults, type ControlDef } from "@demo/components/PlaygroundDrawer";

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

const TYPEWRITER_CONTROLS: ControlDef[] = [
  { key: "typingSpeed", label: "Type Speed", type: "slider", min: 20, max: 150, step: 10, default: 60 },
  { key: "deletingSpeed", label: "Delete Speed", type: "slider", min: 10, max: 100, step: 5, default: 35 },
  { key: "pauseDuration", label: "Pause (ms)", type: "slider", min: 500, max: 5000, step: 250, default: 2000 },
];
const TYPEWRITER_DEFAULTS = buildDefaults(TYPEWRITER_CONTROLS);

export function TypewriterTextSection() {
  const [values, setValues] = useState(TYPEWRITER_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="typewriter-text"
      title="Typewriter Text"
      description="Realistic keystroke simulation with cursor blink and multi-phrase cycling."
      category="Text"
      hooks={["useTypewriter"]}
      controls={TYPEWRITER_CONTROLS}
      values={values}
      defaultValues={TYPEWRITER_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <div className="text-center">
          <TypewriterText
            phrases={["Build fast.", "Ship with confidence.", "Scale effortlessly."]}
            typingSpeed={values.typingSpeed as number}
            deletingSpeed={values.deletingSpeed as number}
            pauseDuration={values.pauseDuration as number}
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

const SCRAMBLE_CONTROLS: ControlDef[] = [
  { key: "speed", label: "Speed (ms)", type: "slider", min: 10, max: 150, step: 5, default: 50 },
];
const SCRAMBLE_DEFAULTS = buildDefaults(SCRAMBLE_CONTROLS);

export function ScrambleTextSection() {
  const [values, setValues] = useState(SCRAMBLE_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="scramble-text"
      title="Scramble Text"
      description="Matrix-style character scramble that resolves to the target string."
      category="Text"
      hooks={["useScramble"]}
      controls={SCRAMBLE_CONTROLS}
      values={values}
      defaultValues={SCRAMBLE_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <ScrambleText
          text="ui-fx-kit"
          trigger="inView"
          speed={values.speed as number}
          className="text-6xl font-black tracking-tight text-white font-mono"
        />
      </div>
    </EffectSection>
  );
}

const SPLITFLAP_CONTROLS: ControlDef[] = [
  { key: "flipSpeed", label: "Flip Speed (ms)", type: "slider", min: 20, max: 200, step: 10, default: 60 },
  { key: "stagger", label: "Stagger (ms)", type: "slider", min: 0, max: 100, step: 5, default: 30 },
  { key: "dark", label: "Dark Mode", type: "toggle", default: true },
];
const SPLITFLAP_DEFAULTS = buildDefaults(SPLITFLAP_CONTROLS);

export function SplitFlapSection() {
  const [values, setValues] = useState(SPLITFLAP_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="split-flap"
      title="Split Flap"
      description="Airport departure board flip animation — each character flips through the alphabet."
      category="Text"
      hooks={["useSplitFlap"]}
      css={["split-flap.css"]}
      controls={SPLITFLAP_CONTROLS}
      values={values}
      defaultValues={SPLITFLAP_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <SplitFlap
          text="UI FX KIT"
          flipSpeed={values.flipSpeed as number}
          stagger={values.stagger as number}
          dark={values.dark as boolean}
        />
      </div>
    </EffectSection>
  );
}

const MORPHING_CONTROLS: ControlDef[] = [
  { key: "holdDuration", label: "Hold (ms)", type: "slider", min: 500, max: 5000, step: 250, default: 2000 },
  { key: "morphDuration", label: "Morph (ms)", type: "slider", min: 200, max: 2000, step: 100, default: 600 },
];
const MORPHING_DEFAULTS = buildDefaults(MORPHING_CONTROLS);

export function MorphingTextSection() {
  const [values, setValues] = useState(MORPHING_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="morphing-text"
      title="Morphing Text"
      description="Smooth blur-morph transition between words. Google Fonts style."
      category="Text"
      hooks={["useMorphText"]}
      controls={MORPHING_CONTROLS}
      values={values}
      defaultValues={MORPHING_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <MorphingText
          texts={["Build", "Ship", "Scale", "Iterate"]}
          holdDuration={values.holdDuration as number}
          morphDuration={values.morphDuration as number}
          className="text-7xl font-black text-white tracking-tight"
        />
      </div>
    </EffectSection>
  );
}

const STAGGERED_CONTROLS: ControlDef[] = [
  { key: "variant", label: "Variant", type: "select", options: ["wave", "bounce", "rotate", "fade", "scale"], default: "wave" },
  { key: "duration", label: "Duration (ms)", type: "slider", min: 200, max: 2000, step: 50, default: 500 },
];
const STAGGERED_DEFAULTS = buildDefaults(STAGGERED_CONTROLS);

export function StaggeredCharsSection() {
  const [values, setValues] = useState(STAGGERED_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="staggered-chars"
      title="Staggered Chars"
      description="Per-character entrance animation with wave, bounce, rotate, and more variants."
      category="Text"
      hooks={["useStagger"]}
      css={["stagger-presets.css"]}
      controls={STAGGERED_CONTROLS}
      values={values}
      defaultValues={STAGGERED_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <StaggeredChars
          text="effects"
          variant={values.variant as string}
          duration={values.duration as number}
          trigger="inView"
          className="text-7xl font-black text-white tracking-tight"
        />
      </div>
    </EffectSection>
  );
}

const GLITCH_CONTROLS: ControlDef[] = [
  { key: "intensity", label: "Intensity", type: "slider", min: 0.1, max: 1, step: 0.1, default: 0.6 },
  { key: "mode", label: "Mode", type: "select", options: ["continuous", "hover"], default: "continuous" },
];
const GLITCH_DEFAULTS = buildDefaults(GLITCH_CONTROLS);

export function GlitchTextSection() {
  const [values, setValues] = useState(GLITCH_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="glitch-text"
      title="Glitch Text"
      description="CSS glitch effect with RGB split and scanline artifacts. Mouse-reactive."
      category="Text"
      css={["glitch-effect.css"]}
      controls={GLITCH_CONTROLS}
      values={values}
      defaultValues={GLITCH_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <GlitchText
          text="GLITCH EFFECT"
          intensity={values.intensity as number}
          mode={values.mode as "continuous" | "hover"}
          className="text-7xl font-black tracking-tight"
        />
      </div>
    </EffectSection>
  );
}

const ASCII_CONTROLS: ControlDef[] = [
  { key: "fontSize", label: "Font Size", type: "slider", min: 4, max: 20, step: 1, default: 12 },
  { key: "revealRadius", label: "Reveal Radius", type: "slider", min: 20, max: 200, step: 10, default: 80 },
];
const ASCII_DEFAULTS = buildDefaults(ASCII_CONTROLS);

export function ASCIITextSection() {
  const [values, setValues] = useState(ASCII_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="ascii-text"
      title="ASCII Text"
      description="Canvas-rendered ASCII art text with mouse proximity reveal."
      category="Text"
      controls={ASCII_CONTROLS}
      values={values}
      defaultValues={ASCII_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-black min-h-screen">
        <ASCIIText
          text="ASCII"
          fontSize={values.fontSize as number}
          revealRadius={values.revealRadius as number}
        />
      </div>
    </EffectSection>
  );
}

const PRESSURE_CONTROLS: ControlDef[] = [
  { key: "radius", label: "Radius", type: "slider", min: 50, max: 400, step: 10, default: 150 },
  { key: "minWeight", label: "Min Weight", type: "slider", min: 100, max: 400, step: 50, default: 100 },
  { key: "maxWeight", label: "Max Weight", type: "slider", min: 500, max: 900, step: 50, default: 900 },
];
const PRESSURE_DEFAULTS = buildDefaults(PRESSURE_CONTROLS);

export function TextPressureSection() {
  const [values, setValues] = useState(PRESSURE_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="text-pressure"
      title="Text Pressure"
      description="Variable-font weight morphs based on mouse proximity to each character."
      category="Text"
      controls={PRESSURE_CONTROLS}
      values={values}
      defaultValues={PRESSURE_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <TextPressure
          text="PRESSURE"
          radius={values.radius as number}
          minWeight={values.minWeight as number}
          maxWeight={values.maxWeight as number}
          className="text-6xl font-black text-white tracking-tight select-none"
        />
      </div>
    </EffectSection>
  );
}

const CIRCULAR_CONTROLS: ControlDef[] = [
  { key: "radius", label: "Radius", type: "slider", min: 60, max: 250, step: 10, default: 120 },
  { key: "speed", label: "Speed (deg/s)", type: "slider", min: 5, max: 120, step: 5, default: 30 },
  { key: "reverseOnHover", label: "Reverse on Hover", type: "toggle", default: true },
];
const CIRCULAR_DEFAULTS = buildDefaults(CIRCULAR_CONTROLS);

export function CircularTextSection() {
  const [values, setValues] = useState(CIRCULAR_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="circular-text"
      title="Circular Text"
      description="Text arranged on a circle path with auto-rotate and hover-reverse."
      category="Text"
      controls={CIRCULAR_CONTROLS}
      values={values}
      defaultValues={CIRCULAR_DEFAULTS}
      onChange={onChange}
    >
      <div className="flex items-center justify-center w-full h-full bg-zinc-950 min-h-screen">
        <CircularText
          text="ui-fx-kit · composable effects · "
          radius={values.radius as number}
          speed={values.speed as number}
          reverseOnHover={values.reverseOnHover as boolean}
        />
      </div>
    </EffectSection>
  );
}
