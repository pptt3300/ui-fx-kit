"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toEffectName } from "@demo/lib/toEffectName";
import { hexToRgb } from "@demo/lib/colorUtils";
import { useI18n } from "@demo/lib/i18n";

export interface ControlDef {
  key: string;
  label: string;
  type: "slider" | "select" | "toggle" | "color";
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  default: number | string | boolean;
}

export function buildDefaults(controls: ControlDef[]): Record<string, number | string | boolean> {
  const d: Record<string, number | string | boolean> = {};
  for (const c of controls) d[c.key] = c.default;
  return d;
}

interface PlaygroundDrawerProps {
  effectId: string;
  /** Whether this section is the currently visible one */
  active?: boolean;
  controls?: ControlDef[];
  values?: Record<string, number | string | boolean>;
  defaultValues?: Record<string, number | string | boolean>;
  onChange?: (key: string, value: number | string | boolean) => void;
  /** Maps display prop name to control keys for Usage generation.
   *  e.g. { colors: ["color0", "color1", "color2"] } */
  propGroups?: Record<string, string[]>;
}

const COLOR_SWATCHES = [
  { label: "indigo", value: "#6366f1" },
  { label: "violet", value: "#8b5cf6" },
  { label: "cyan", value: "#06b6d4" },
  { label: "pink", value: "#ec4899" },
  { label: "green", value: "#22c55e" },
  { label: "white", value: "#ffffff" },
];

type Tab = "Playground" | "Install";

function buildUsageSnippet(
  effectId: string,
  values: Record<string, number | string | boolean>,
  defaultValues: Record<string, number | string | boolean>,
  propGroups?: Record<string, string[]>,
): string {
  const name = toEffectName(effectId);

  // Collect grouped keys so we skip them from individual props
  const groupedKeys = new Set<string>();
  if (propGroups) {
    for (const keys of Object.values(propGroups)) {
      for (const k of keys) groupedKeys.add(k);
    }
  }

  const props: string[] = [];

  // Individual (non-grouped) props
  for (const [key, val] of Object.entries(values)) {
    if (groupedKeys.has(key)) continue;
    if (val === defaultValues[key]) continue;

    if (typeof val === "boolean") {
      props.push(val ? key : `${key}={false}`);
    } else if (typeof val === "number") {
      props.push(`${key}={${val}}`);
    } else {
      props.push(`${key}="${val}"`);
    }
  }

  // Grouped props (e.g. colors)
  if (propGroups) {
    for (const [propName, keys] of Object.entries(propGroups)) {
      const anyChanged = keys.some((k) => values[k] !== defaultValues[k]);
      if (!anyChanged) continue;

      const tuples = keys.map((k) => {
        const hex = values[k] as string;
        const [r, g, b] = hexToRgb(hex);
        return `[${r},${g},${b}]`;
      });
      props.push(`${propName}={[${tuples.join(",")}]}`);
    }
  }

  if (props.length === 0) return `<${name} />`;
  return `<${name}\n  ${props.join("\n  ")}\n/>`;
}

export default function PlaygroundDrawer({
  effectId,
  active = true,
  controls,
  values = {},
  defaultValues = {},
  onChange,
  propGroups,
}: PlaygroundDrawerProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  // Auto-close when section scrolls out of view
  useEffect(() => {
    if (!active && open) setOpen(false);
  }, [active, open]);

  const hasControls = controls && controls.length > 0;
  const [activeTab, setActiveTab] = useState<Tab>(
    hasControls ? "Playground" : "Install",
  );

  const hasChanges = useMemo(() => {
    if (!hasControls) return false;
    return Object.keys(defaultValues).some(
      (k) => values[k] !== defaultValues[k],
    );
  }, [hasControls, values, defaultValues]);

  const usageSnippet = useMemo(
    () => buildUsageSnippet(effectId, values, defaultValues, propGroups),
    [effectId, values, defaultValues, propGroups],
  );

  const handleReset = () => {
    if (!onChange) return;
    for (const [key, val] of Object.entries(defaultValues)) {
      onChange(key, val);
    }
  };

  return (
    <>
      {/* Collapsed trigger — only show for the active section */}
      <AnimatePresence>
        {!open && active && (
          <motion.div
            key="trigger"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="fixed bottom-8 right-6 z-[60]"
          >
            <button
              onClick={() => setOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                hasControls
                  ? "text-white/70 hover:text-white"
                  : "text-white/50 hover:text-white/80"
              }`}
              style={{
                background: hasControls
                  ? "rgba(99,102,241,0.15)"
                  : "rgba(0,0,0,0.6)",
                border: hasControls
                  ? "1px solid rgba(99,102,241,0.3)"
                  : "1px solid rgba(255,255,255,0.12)",
                backdropFilter: "blur(12px)",
              }}
            >
              {hasControls ? (
                <>
                  <span className="flex gap-0.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-400/80" />
                    <span className="w-2 h-2 rounded-full bg-violet-400/80" />
                    <span className="w-2 h-2 rounded-full bg-cyan-400/80" />
                  </span>
                  {t("pg.playground")}
                </>
              ) : (
                t("pg.triggerInstall")
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[60] lg:left-[60px] max-h-[40vh] flex flex-col"
            style={{
              background: "rgba(8,8,12,0.85)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                  {hasControls ? t("pg.controls") : t("pg.install")}
                </span>

                {/* Tab bar — full mode only */}
                {hasControls && (
                  <div className="flex gap-1">
                    {(["Playground", "Install"] as Tab[]).map((tab) => {
                      const label = tab === "Playground" ? t("pg.playground") : t("pg.install");
                      return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 pb-1.5 pt-0.5 text-xs font-medium transition-colors relative ${
                          activeTab === tab
                            ? "text-indigo-400"
                            : "text-white/40 hover:text-white/70"
                        }`}
                      >
                        {label}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="drawer-tab-indicator"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t"
                          />
                        )}
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-5 h-5 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors text-xs"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-5 pb-5">
              {/* Playground tab */}
              {hasControls && activeTab === "Playground" && (
                <div>
                  {/* Reset button */}
                  {hasChanges && (
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={handleReset}
                        className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
                      >
                        {t("pg.reset")}
                      </button>
                    </div>
                  )}

                  {/* Controls grid */}
                  <div className="flex flex-wrap gap-4">
                    {controls!.map((ctrl) => (
                      <div
                        key={ctrl.key}
                        className="flex flex-col gap-1.5 min-w-[100px]"
                      >
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
                                onChange?.(
                                  ctrl.key,
                                  parseFloat(e.target.value),
                                )
                              }
                              className="w-24 accent-indigo-500 cursor-pointer"
                              style={{ accentColor: "#6366f1" }}
                            />
                            <span className="text-[11px] text-white/50 tabular-nums w-8 text-right">
                              {typeof values[ctrl.key] === "number"
                                ? (values[ctrl.key] as number).toFixed(
                                    ctrl.step && ctrl.step < 1 ? 2 : 0,
                                  )
                                : values[ctrl.key]?.toString()}
                            </span>
                          </div>
                        )}

                        {ctrl.type === "select" && (
                          <select
                            value={values[ctrl.key] as string}
                            onChange={(e) =>
                              onChange?.(ctrl.key, e.target.value)
                            }
                            className="text-xs text-white/70 rounded px-2 py-1 outline-none cursor-pointer"
                            style={{
                              background: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(255,255,255,0.12)",
                            }}
                          >
                            {(ctrl.options ?? []).map((opt) => (
                              <option
                                key={opt}
                                value={opt}
                                style={{ background: "#111" }}
                              >
                                {opt}
                              </option>
                            ))}
                          </select>
                        )}

                        {ctrl.type === "toggle" && (
                          <button
                            role="switch"
                            aria-checked={values[ctrl.key] as boolean}
                            onClick={() =>
                              onChange?.(
                                ctrl.key,
                                !(values[ctrl.key] as boolean),
                              )
                            }
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
                                onClick={() =>
                                  onChange?.(ctrl.key, swatch.value)
                                }
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
                </div>
              )}

              {/* Install tab */}
              {(activeTab === "Install" || !hasControls) && (
                <div className="space-y-4">
                  {/* CLI command */}
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                      {t("pg.cli")}
                    </p>
                    <div
                      className="rounded p-3 font-mono text-xs leading-relaxed"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <span className="text-white/30">$</span>{" "}
                      <span className="text-emerald-400">
                        npx ui-fx-kit add {effectId} --target ./src
                      </span>
                    </div>
                  </div>

                  {/* Usage snippet */}
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
                      {t("pg.usage")}
                    </p>
                    <pre
                      className="rounded p-3 font-mono text-xs text-cyan-300 leading-relaxed whitespace-pre-wrap"
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {usageSnippet}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
