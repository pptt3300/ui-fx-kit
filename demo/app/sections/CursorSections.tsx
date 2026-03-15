"use client";

import dynamic from "next/dynamic";
import EffectSection from "@demo/components/EffectSection";

const CursorGlow = dynamic(() => import("@effects/cursor-glow/CursorGlow"), { ssr: false });
const BlobCursor = dynamic(() => import("@effects/blob-cursor/BlobCursor"), { ssr: false });
const SplashCursor = dynamic(() => import("@effects/splash-cursor/SplashCursor"), { ssr: false });
const PixelTrail = dynamic(() => import("@effects/pixel-trail/PixelTrail"), { ssr: false });
const ImageTrail = dynamic(() => import("@effects/image-trail/ImageTrail"), { ssr: false });
const GhostCursor = dynamic(() => import("@effects/ghost-cursor/GhostCursor"), { ssr: false });

export function CursorGlowSection() {
  return (
    <EffectSection
      id="cursor-glow"
      title="Cursor Glow"
      description="Colorful glowing trail particles that follow the cursor with fade-out."
      category="Cursor"
    >
      <div className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
        <CursorGlow />
        <p className="text-white/20 text-sm font-mono pointer-events-none select-none">move your cursor</p>
      </div>
    </EffectSection>
  );
}

export function BlobCursorSection() {
  return (
    <EffectSection
      id="blob-cursor"
      title="Blob Cursor"
      description="WebGL metaball cursor — a liquid blob that morphs around the pointer."
      category="Cursor"
      hooks={["useWebGL"]}
    >
      <div className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
        <BlobCursor />
        <p className="text-white/20 text-sm font-mono pointer-events-none select-none">move your cursor</p>
      </div>
    </EffectSection>
  );
}

export function SplashCursorSection() {
  return (
    <EffectSection
      id="splash-cursor"
      title="Splash Cursor"
      description="Particle splash burst on click with physics-based scatter and gravity."
      category="Cursor"
    >
      <div className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
        <SplashCursor />
        <p className="text-white/20 text-sm font-mono pointer-events-none select-none">click anywhere</p>
      </div>
    </EffectSection>
  );
}

export function PixelTrailSection() {
  return (
    <EffectSection
      id="pixel-trail"
      title="Pixel Trail"
      description="Colored pixel squares trail behind the cursor with configurable fade."
      category="Cursor"
    >
      <div className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
        <PixelTrail />
        <p className="text-white/20 text-sm font-mono pointer-events-none select-none">move your cursor</p>
      </div>
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
    <EffectSection
      id="image-trail"
      title="Image Trail"
      description="Images appear and fade along the cursor path — editorial magazine effect."
      category="Cursor"
    >
      <div className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
        <ImageTrail images={images} />
        <p className="text-white/20 text-sm font-mono pointer-events-none select-none">move your cursor</p>
      </div>
    </EffectSection>
  );
}

export function GhostCursorSection() {
  return (
    <EffectSection
      id="ghost-cursor"
      title="Ghost Cursor"
      description="Chain of ghost dots that follow the cursor with spring-damped lag."
      category="Cursor"
      hooks={["useSpring"]}
    >
      <div className="relative w-full h-full bg-zinc-950 min-h-screen flex items-center justify-center">
        <GhostCursor count={8} />
        <p className="text-white/20 text-sm font-mono pointer-events-none select-none">move your cursor</p>
      </div>
    </EffectSection>
  );
}
