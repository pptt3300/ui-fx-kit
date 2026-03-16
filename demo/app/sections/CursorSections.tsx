"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";
import { buildDefaults, type ControlDef } from "@demo/components/PlaygroundDrawer";
import { hexToRgb } from "@demo/lib/colorUtils";
import { useI18n } from "@demo/lib/i18n";

const CursorGlow = dynamic(() => import("@effects/cursor-glow/CursorGlow"), { ssr: false });
const BlobCursor = dynamic(() => import("@effects/blob-cursor/BlobCursor"), { ssr: false });
const SplashCursor = dynamic(() => import("@effects/splash-cursor/SplashCursor"), { ssr: false });
const PixelTrail = dynamic(() => import("@effects/pixel-trail/PixelTrail"), { ssr: false });
const ImageTrail = dynamic(() => import("@effects/image-trail/ImageTrail"), { ssr: false });
const GhostCursor = dynamic(() => import("@effects/ghost-cursor/GhostCursor"), { ssr: false });

/** Only mount children when the section is visible in viewport */
function MountWhenVisible({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
      {visible && children}
      <p className="text-white/20 text-sm font-mono pointer-events-none select-none">
        {visible ? t("effect.moveCursor") : t("effect.scrollHere")}
      </p>
    </div>
  );
}

const CURSORGLOW_CONTROLS: ControlDef[] = [
  { key: "maxParticles", label: "Particles", type: "slider", min: 100, max: 1000, step: 50, default: 500 },
  { key: "color0", label: "Color 1", type: "color", default: "#6366f1" },
  { key: "color1", label: "Color 2", type: "color", default: "#8b5cf6" },
  { key: "color2", label: "Color 3", type: "color", default: "#22d3ee" },
  { key: "color3", label: "Color 4", type: "color", default: "#a78bfa" },
  { key: "color4", label: "Color 5", type: "color", default: "#818cf8" },
];
const CURSORGLOW_DEFAULTS = buildDefaults(CURSORGLOW_CONTROLS);

export function CursorGlowSection() {
  const [values, setValues] = useState(CURSORGLOW_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="cursor-glow"
      title="Cursor Glow"
      description="Glowing trail particles that follow the cursor."
      category="Cursor"
      hooks={["useMousePosition", "useCanvasSetup", "useParticles"]}
      controls={CURSORGLOW_CONTROLS}
      values={values}
      defaultValues={CURSORGLOW_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2", "color3", "color4"] }}
    >
      <MountWhenVisible>
        <CursorGlow
          maxParticles={values.maxParticles as number}
          colors={[
            hexToRgb(values.color0 as string),
            hexToRgb(values.color1 as string),
            hexToRgb(values.color2 as string),
            hexToRgb(values.color3 as string),
            hexToRgb(values.color4 as string),
          ]}
        />
      </MountWhenVisible>
    </EffectSection>
  );
}

/* ── Blob Cursor ─────────────────────────────────────────────── */

const BLOBCURSOR_CONTROLS: ControlDef[] = [
  { key: "radius", label: "Radius", type: "slider", min: 10, max: 100, step: 5, default: 40 },
  { key: "stiffness", label: "Stiffness", type: "slider", min: 20, max: 400, step: 10, default: 120 },
  { key: "color0", label: "Color", type: "color", default: "#6366f1" },
];
const BLOBCURSOR_DEFAULTS = buildDefaults(BLOBCURSOR_CONTROLS);

export function BlobCursorSection() {
  const [values, setValues] = useState(BLOBCURSOR_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="blob-cursor"
      title="Blob Cursor"
      description="WebGL metaball cursor — a liquid blob that morphs around the pointer."
      category="Cursor"
      hooks={["useWebGL"]}
      controls={BLOBCURSOR_CONTROLS}
      values={values}
      defaultValues={BLOBCURSOR_DEFAULTS}
      onChange={onChange}
    >
      <MountWhenVisible>
        <BlobCursor
          radius={values.radius as number}
          stiffness={values.stiffness as number}
          color={hexToRgb(values.color0 as string)}
        />
      </MountWhenVisible>
    </EffectSection>
  );
}

/* ── Splash Cursor ───────────────────────────────────────────── */

const SPLASHCURSOR_CONTROLS: ControlDef[] = [
  { key: "particleCount", label: "Particles", type: "slider", min: 1, max: 40, step: 1, default: 15 },
  { key: "spread", label: "Spread", type: "slider", min: 30, max: 360, step: 10, default: 360 },
  { key: "color0", label: "Color 1", type: "color", default: "#6366f1" },
  { key: "color1", label: "Color 2", type: "color", default: "#8b5cf6" },
  { key: "color2", label: "Color 3", type: "color", default: "#22d3ee" },
  { key: "color3", label: "Color 4", type: "color", default: "#f43f5e" },
  { key: "color4", label: "Color 5", type: "color", default: "#fbbf24" },
];
const SPLASHCURSOR_DEFAULTS = buildDefaults(SPLASHCURSOR_CONTROLS);

export function SplashCursorSection() {
  const [values, setValues] = useState(SPLASHCURSOR_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="splash-cursor"
      title="Splash Cursor"
      description="Particle splash burst that follows cursor movement."
      category="Cursor"
      controls={SPLASHCURSOR_CONTROLS}
      values={values}
      defaultValues={SPLASHCURSOR_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2", "color3", "color4"] }}
    >
      <MountWhenVisible>
        <SplashCursor
          particleCount={values.particleCount as number}
          spread={values.spread as number}
          colors={[
            hexToRgb(values.color0 as string),
            hexToRgb(values.color1 as string),
            hexToRgb(values.color2 as string),
            hexToRgb(values.color3 as string),
            hexToRgb(values.color4 as string),
          ]}
        />
      </MountWhenVisible>
    </EffectSection>
  );
}

/* ── Pixel Trail ─────────────────────────────────────────────── */

const PIXELTRAIL_CONTROLS: ControlDef[] = [
  { key: "pixelSize", label: "Pixel Size", type: "slider", min: 2, max: 24, step: 1, default: 8 },
  { key: "trailLength", label: "Trail Length", type: "slider", min: 10, max: 200, step: 5, default: 50 },
  { key: "fadeSpeed", label: "Fade Speed", type: "slider", min: 0.01, max: 0.2, step: 0.01, default: 0.05 },
  { key: "color0", label: "Color 1", type: "color", default: "#6366f1" },
  { key: "color1", label: "Color 2", type: "color", default: "#8b5cf6" },
  { key: "color2", label: "Color 3", type: "color", default: "#22d3ee" },
  { key: "color3", label: "Color 4", type: "color", default: "#f43f5e" },
  { key: "color4", label: "Color 5", type: "color", default: "#fbbf24" },
];
const PIXELTRAIL_DEFAULTS = buildDefaults(PIXELTRAIL_CONTROLS);

export function PixelTrailSection() {
  const [values, setValues] = useState(PIXELTRAIL_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="pixel-trail"
      title="Pixel Trail"
      description="Colored pixel squares trail behind the cursor."
      category="Cursor"
      controls={PIXELTRAIL_CONTROLS}
      values={values}
      defaultValues={PIXELTRAIL_DEFAULTS}
      onChange={onChange}
      propGroups={{ colors: ["color0", "color1", "color2", "color3", "color4"] }}
    >
      <MountWhenVisible>
        <PixelTrail
          pixelSize={values.pixelSize as number}
          trailLength={values.trailLength as number}
          fadeSpeed={values.fadeSpeed as number}
          colors={[
            hexToRgb(values.color0 as string),
            hexToRgb(values.color1 as string),
            hexToRgb(values.color2 as string),
            hexToRgb(values.color3 as string),
            hexToRgb(values.color4 as string),
          ]}
        />
      </MountWhenVisible>
    </EffectSection>
  );
}

/* ── Image Trail ─────────────────────────────────────────────── */

const IMAGETRAIL_CONTROLS: ControlDef[] = [
  { key: "trailLength", label: "Trail Length", type: "slider", min: 2, max: 20, step: 1, default: 8 },
  { key: "spawnDistance", label: "Spawn Distance", type: "slider", min: 10, max: 150, step: 5, default: 50 },
];
const IMAGETRAIL_DEFAULTS = buildDefaults(IMAGETRAIL_CONTROLS);

export function ImageTrailSection() {
  const [values, setValues] = useState(IMAGETRAIL_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  const images = [
    "https://picsum.photos/seed/a1/200/200",
    "https://picsum.photos/seed/b2/200/200",
    "https://picsum.photos/seed/c3/200/200",
    "https://picsum.photos/seed/d4/200/200",
    "https://picsum.photos/seed/e5/200/200",
    "https://picsum.photos/seed/f6/200/200",
  ];

  return (
    <EffectSection
      id="image-trail"
      title="Image Trail"
      description="Images appear and fade along the cursor path."
      category="Cursor"
      controls={IMAGETRAIL_CONTROLS}
      values={values}
      defaultValues={IMAGETRAIL_DEFAULTS}
      onChange={onChange}
    >
      <MountWhenVisible>
        <ImageTrail
          images={images}
          trailLength={values.trailLength as number}
          spawnDistance={values.spawnDistance as number}
        />
      </MountWhenVisible>
    </EffectSection>
  );
}

/* ── Ghost Cursor ────────────────────────────────────────────── */

const GHOSTCURSOR_CONTROLS: ControlDef[] = [
  { key: "count", label: "Count", type: "slider", min: 2, max: 20, step: 1, default: 5 },
  { key: "stiffness", label: "Stiffness", type: "slider", min: 20, max: 400, step: 10, default: 100 },
  { key: "size", label: "Size", type: "slider", min: 5, max: 60, step: 1, default: 20 },
  { key: "color0", label: "Color", type: "color", default: "#ffffff" },
];
const GHOSTCURSOR_DEFAULTS = buildDefaults(GHOSTCURSOR_CONTROLS);

export function GhostCursorSection() {
  const [values, setValues] = useState(GHOSTCURSOR_DEFAULTS);
  const onChange = useCallback((k: string, v: number | string | boolean) =>
    setValues((prev) => ({ ...prev, [k]: v })), []);

  return (
    <EffectSection
      id="ghost-cursor"
      title="Ghost Cursor"
      description="Chain of ghost dots that follow the cursor with spring lag."
      category="Cursor"
      hooks={["useSpring"]}
      controls={GHOSTCURSOR_CONTROLS}
      values={values}
      defaultValues={GHOSTCURSOR_DEFAULTS}
      onChange={onChange}
    >
      <MountWhenVisible>
        <GhostCursor
          count={values.count as number}
          stiffness={values.stiffness as number}
          size={values.size as number}
          color={hexToRgb(values.color0 as string)}
        />
      </MountWhenVisible>
    </EffectSection>
  );
}
