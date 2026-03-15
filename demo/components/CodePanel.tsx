"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CodePanelProps {
  effectId: string;
  hooks?: string[];
  css?: string[];
  installCmd?: string;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = "Component" | "Hooks" | "CSS";

function toEffectName(id: string): string {
  return id
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

export default function CodePanel({
  effectId,
  hooks = [],
  css = [],
  installCmd,
  isOpen,
  onClose,
}: CodePanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("Component");
  const effectName = toEffectName(effectId);

  const tabs: Tab[] = ["Component", "Hooks", "CSS"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ background: "rgba(0,0,0,0.4)" }}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 h-full z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            style={{
              width: "min(40vw, 560px)",
              minWidth: 320,
              background: "rgba(10,10,15,0.95)",
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="text-sm font-semibold text-white/80 font-mono">
                {effectName}
              </span>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex px-5 gap-1 pt-3 pb-0 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
            >
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 pb-2.5 text-xs font-medium transition-colors relative ${
                    activeTab === tab
                      ? "text-indigo-400"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 font-mono text-xs">
              {activeTab === "Component" && (
                <div>
                  <p className="text-white/40 mb-3 text-[11px]">File path</p>
                  <div
                    className="rounded p-3 text-indigo-300"
                    style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}
                  >
                    effects/{effectId}/{effectName}.tsx
                  </div>

                  {installCmd && (
                    <>
                      <p className="text-white/40 mt-5 mb-3 text-[11px]">Install</p>
                      <div
                        className="rounded p-3 text-emerald-300"
                        style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}
                      >
                        {installCmd}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "Hooks" && (
                <div>
                  <p className="text-white/40 mb-3 text-[11px]">
                    {hooks.length ? "Hooks used" : "No hooks for this effect"}
                  </p>
                  {hooks.map((h) => (
                    <div
                      key={h}
                      className="rounded p-3 mb-2 text-cyan-300"
                      style={{ background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.15)" }}
                    >
                      src/hooks/{h}.ts
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "CSS" && (
                <div>
                  <p className="text-white/40 mb-3 text-[11px]">
                    {css.length ? "CSS snippets used" : "No CSS snippets for this effect"}
                  </p>
                  {css.map((c) => (
                    <div
                      key={c}
                      className="rounded p-3 mb-2 text-pink-300"
                      style={{ background: "rgba(236,72,153,0.07)", border: "1px solid rgba(236,72,153,0.15)" }}
                    >
                      src/css/{c}.css
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* MCP CTA */}
            <div
              className="shrink-0 mx-5 mb-5 rounded-xl p-4"
              style={{
                background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
                border: "1px solid rgba(99,102,241,0.25)",
              }}
            >
              <p className="text-xs font-semibold text-indigo-300 mb-1">Use with Claude Code</p>
              <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
                Install this effect directly from your terminal via MCP.
              </p>
              <div
                className="rounded p-2.5 font-mono text-[11px] text-white/70 leading-relaxed"
                style={{ background: "rgba(0,0,0,0.4)" }}
              >
                <span className="text-white/30">$</span>{" "}
                <span className="text-emerald-400">install</span>{" "}
                <span className="text-white/60">ui-fx-kit/{effectId}</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
