"use client";

import { useEffect, useRef, useState } from "react";
import PlaygroundDrawer from "./PlaygroundDrawer";
import type { ControlDef } from "./PlaygroundDrawer";

interface EffectSectionProps {
  id: string;
  title: string;
  description: string;
  category: string;
  hooks?: string[];
  css?: string[];
  children: React.ReactNode;
  // Playground props
  controls?: ControlDef[];
  values?: Record<string, number | string | boolean>;
  defaultValues?: Record<string, number | string | boolean>;
  onChange?: (key: string, value: number | string | boolean) => void;
  propGroups?: Record<string, string[]>;
}

const CATEGORY_COLORS: Record<string, string> = {
  Background: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Text: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Card: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Cursor: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Shader: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Interactive: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Scroll: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Loading: "bg-red-500/20 text-red-300 border-red-500/30",
  Palettes: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
};

export default function EffectSection({
  id,
  title,
  description,
  category,
  hooks = [],
  css = [],
  children,
  controls,
  values,
  defaultValues,
  onChange,
  propGroups,
}: EffectSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Mount effect when near viewport (1 screen ahead), unmount when far away
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const mountObserver = new IntersectionObserver(
      ([entry]) => setMounted(entry.isIntersecting),
      { rootMargin: "100% 0px 100% 0px" }, // 1 viewport above and below
    );

    const visibleObserver = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          window.dispatchEvent(
            new CustomEvent("fx-section-visible", { detail: { id } }),
          );
        }
      },
      { threshold: 0.3 },
    );

    mountObserver.observe(el);
    visibleObserver.observe(el);
    return () => {
      mountObserver.disconnect();
      visibleObserver.disconnect();
    };
  }, [id]);

  const categoryClass =
    CATEGORY_COLORS[category] ??
    "bg-white/10 text-white/60 border-white/20";

  return (
    <>
      <section
        id={id}
        ref={sectionRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Effect content — only mounted when near viewport */}
        <div className="absolute inset-0">
          {mounted ? children : (
            <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Category badge */}
        <div className="absolute top-5 left-5 z-10">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${categoryClass}`}
          >
            {category}
          </span>
        </div>

        {/* Title + description */}
        <div
          className="absolute bottom-8 left-6 z-10 max-w-sm"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <h2 className="text-2xl font-bold text-white mb-1">{title}</h2>
          <p className="text-sm text-white/50 leading-relaxed">{description}</p>
        </div>
      </section>

      {mounted && (
        <PlaygroundDrawer
          effectId={id}
          active={isVisible}
          controls={controls}
          values={values}
          defaultValues={defaultValues}
          onChange={onChange}
          propGroups={propGroups}
        />
      )}
    </>
  );
}
