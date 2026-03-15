"use client";

import { useEffect, useRef, useState } from "react";
import { useState as useCodeState } from "react";
import CodePanel from "./CodePanel";

interface EffectSectionProps {
  id: string;
  title: string;
  description: string;
  category: string;
  hooks?: string[];
  css?: string[];
  children: React.ReactNode;
  showCode?: boolean;
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
};

export default function EffectSection({
  id,
  title,
  description,
  category,
  hooks = [],
  css = [],
  children,
  showCode = true,
}: EffectSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [codePanelOpen, setCodePanelOpen] = useCodeState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Dispatch custom event so parent can track active section
          window.dispatchEvent(
            new CustomEvent("fx-section-visible", { detail: { id } })
          );
        } else {
          setIsVisible(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
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
        {/* Effect content fills the section */}
        <div className="absolute inset-0">{children}</div>

        {/* Category badge — top-left */}
        <div className="absolute top-5 left-5 z-10">
          <span
            className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${categoryClass}`}
          >
            {category}
          </span>
        </div>

        {/* Title + description — bottom-left */}
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

        {/* View Code button — bottom-right */}
        {showCode && (
          <button
            onClick={() => setCodePanelOpen(true)}
            className="absolute bottom-8 right-6 z-10 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span
              style={{
                width: 14,
                height: 14,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {"</>"}
            </span>
            View Code
          </button>
        )}
      </section>

      {/* Code panel rendered outside the section to avoid stacking-context issues */}
      <CodePanel
        effectId={id}
        hooks={hooks}
        css={css}
        isOpen={codePanelOpen}
        onClose={() => setCodePanelOpen(false)}
      />
    </>
  );
}
