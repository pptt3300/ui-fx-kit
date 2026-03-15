"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ControlDef {
  key: string;
  label: string;
  type: "slider" | "select" | "toggle" | "color";
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: number | string | boolean;
}

interface EffectControlsProps {
  controls: ControlDef[];
  values: Record<string, number | string | boolean>;
  onChange: (key: string, value: number | string | boolean) => void;
}

const COLOR_SWATCHES = [
  { label: "indigo", value: "#6366f1" },
  { label: "violet", value: "#8b5cf6" },
  { label: "cyan", value: "#06b6d4" },
  { label: "pink", value: "#ec4899" },
  { label: "green", value: "#22c55e" },
  { label: "white", value: "#ffffff" },
];

export default function EffectControls({
  controls,
  values,
  onChange,
}: EffectControlsProps) {
  const [open, setOpen] = useState(false);

  if (controls.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
      {/* Toggle button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="toggle"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            onClick={() => setOpen(true)}
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/60 hover:text-white transition-colors"
            style={{
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
            }}
          >
            ⚙ Controls
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="rounded-xl px-4 py-3"
            style={{
              background: "rgba(8,8,12,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(20px)",
              maxWidth: "min(90vw, 680px)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                Controls
              </span>
              <button
                onClick={() => setOpen(false)}
                className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Controls grid */}
            <div className="flex flex-wrap gap-4">
              {controls.map((ctrl) => (
                <div key={ctrl.key} className="flex flex-col gap-1.5 min-w-[100px]">
                  <label className="text-[10px] text-white/40 uppercase tracking-wider">
                    {ctrl.label}
                  </label>

                  {ctrl.type === "slider" && (
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={ctrl.min ?? 0}
                        max={ctrl.max ?? 100}
                        step={ctrl.step ?? 1}
                        value={values[ctrl.key] as number}
                        onChange={(e) =>
                          onChange(ctrl.key, parseFloat(e.target.value))
                        }
                        className="w-24 accent-indigo-500 cursor-pointer"
                        style={{ accentColor: "#6366f1" }}
                      />
                      <span className="text-[11px] text-white/50 tabular-nums w-8 text-right">
                        {typeof values[ctrl.key] === "number"
                          ? (values[ctrl.key] as number).toFixed(
                              ctrl.step && ctrl.step < 1 ? 2 : 0
                            )
                          : values[ctrl.key]}
                      </span>
                    </div>
                  )}

                  {ctrl.type === "select" && (
                    <select
                      value={values[ctrl.key] as string}
                      onChange={(e) => onChange(ctrl.key, e.target.value)}
                      className="text-xs text-white/70 rounded px-2 py-1 outline-none cursor-pointer"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      {(ctrl.options ?? []).map((opt) => (
                        <option key={opt} value={opt} style={{ background: "#111" }}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {ctrl.type === "toggle" && (
                    <button
                      role="switch"
                      aria-checked={values[ctrl.key] as boolean}
                      onClick={() => onChange(ctrl.key, !(values[ctrl.key] as boolean))}
                      className="relative w-9 h-5 rounded-full transition-colors"
                      style={{
                        background: values[ctrl.key]
                          ? "rgba(99,102,241,0.8)"
                          : "rgba(255,255,255,0.12)",
                      }}
                    >
                      <span
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                        style={{
                          transform: values[ctrl.key]
                            ? "translateX(19px)"
                            : "translateX(2px)",
                        }}
                      />
                    </button>
                  )}

                  {ctrl.type === "color" && (
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.value}
                          onClick={() => onChange(ctrl.key, swatch.value)}
                          title={swatch.label}
                          className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                          style={{
                            background: swatch.value,
                            outline:
                              values[ctrl.key] === swatch.value
                                ? "2px solid rgba(255,255,255,0.7)"
                                : "2px solid transparent",
                            outlineOffset: "2px",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
