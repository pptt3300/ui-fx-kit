"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";

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
        {visible ? "move your cursor" : "scroll here to activate"}
      </p>
    </div>
  );
}

export function CursorGlowSection() {
  return (
    <EffectSection id="cursor-glow" title="Cursor Glow" description="Glowing trail particles that follow the cursor." category="Cursor">
      <MountWhenVisible><CursorGlow /></MountWhenVisible>
    </EffectSection>
  );
}

export function BlobCursorSection() {
  return (
    <EffectSection id="blob-cursor" title="Blob Cursor" description="WebGL metaball cursor — a liquid blob that morphs around the pointer." category="Cursor" hooks={["useWebGL"]}>
      <MountWhenVisible><BlobCursor /></MountWhenVisible>
    </EffectSection>
  );
}

export function SplashCursorSection() {
  return (
    <EffectSection id="splash-cursor" title="Splash Cursor" description="Particle splash burst that follows cursor movement." category="Cursor">
      <MountWhenVisible><SplashCursor /></MountWhenVisible>
    </EffectSection>
  );
}

export function PixelTrailSection() {
  return (
    <EffectSection id="pixel-trail" title="Pixel Trail" description="Colored pixel squares trail behind the cursor." category="Cursor">
      <MountWhenVisible><PixelTrail /></MountWhenVisible>
    </EffectSection>
  );
}

export function ImageTrailSection() {
  const images = [
    "https://picsum.photos/seed/a1/200/200",
    "https://picsum.photos/seed/b2/200/200",
    "https://picsum.photos/seed/c3/200/200",
    "https://picsum.photos/seed/d4/200/200",
    "https://picsum.photos/seed/e5/200/200",
    "https://picsum.photos/seed/f6/200/200",
  ];

  return (
    <EffectSection id="image-trail" title="Image Trail" description="Images appear and fade along the cursor path." category="Cursor">
      <MountWhenVisible><ImageTrail images={images} /></MountWhenVisible>
    </EffectSection>
  );
}

export function GhostCursorSection() {
  return (
    <EffectSection id="ghost-cursor" title="Ghost Cursor" description="Chain of ghost dots that follow the cursor with spring lag." category="Cursor" hooks={["useSpring"]}>
      <MountWhenVisible><GhostCursor count={8} /></MountWhenVisible>
    </EffectSection>
  );
}
