"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const GradientMesh = dynamic(() => import("@effects/gradient-mesh/GradientMesh"), { ssr: false });

type Pal = { particles: number[][]; background: number[][]; glow: number[]; primary: number[]; secondary: number[]; accent: number[]; surface: number[]; text: number[]; muted: number[] };

const PALETTES: Record<string, Pal> = {
  default: { particles: [[99,102,241],[139,92,246],[34,211,238]], background: [[34,197,94],[139,92,246]], glow: [99,102,241], primary: [99,102,241], secondary: [139,92,246], accent: [34,211,238], surface: [15,15,25], text: [240,240,255], muted: [128,128,168] },
  neon: { particles: [[255,45,149],[0,245,212],[191,255,0]], background: [[255,0,128],[0,200,255]], glow: [255,45,149], primary: [255,45,149], secondary: [0,245,212], accent: [191,255,0], surface: [10,5,15], text: [255,255,255], muted: [180,120,200] },
  pastel: { particles: [[196,181,253],[251,191,214],[167,243,208]], background: [[221,214,254],[254,202,202]], glow: [196,181,253], primary: [196,181,253], secondary: [251,191,214], accent: [167,243,208], surface: [250,250,255], text: [60,50,80], muted: [160,150,180] },
  warm: { particles: [[245,158,11],[239,68,68],[180,83,9]], background: [[245,158,11],[239,68,68]], glow: [245,158,11], primary: [245,158,11], secondary: [239,68,68], accent: [180,83,9], surface: [25,15,10], text: [255,240,220], muted: [168,128,100] },
  arctic: { particles: [[125,211,252],[186,230,253],[224,242,254]], background: [[56,189,248],[186,230,253]], glow: [125,211,252], primary: [125,211,252], secondary: [186,230,253], accent: [224,242,254], surface: [10,20,35], text: [220,240,255], muted: [100,140,180] },
  mono: { particles: [[255,255,255],[161,161,170],[82,82,91]], background: [[161,161,170],[82,82,91]], glow: [161,161,170], primary: [255,255,255], secondary: [161,161,170], accent: [212,212,216], surface: [0,0,0], text: [255,255,255], muted: [113,113,122] },
  stripe: { particles: [[99,91,255],[130,71,255],[0,187,249]], background: [[99,91,255],[130,71,255]], glow: [99,91,255], primary: [99,91,255], secondary: [130,71,255], accent: [0,187,249], surface: [15,13,35], text: [245,245,255], muted: [130,120,170] },
  vercel: { particles: [[255,255,255],[170,170,170],[100,100,100]], background: [[30,30,30],[0,0,0]], glow: [255,255,255], primary: [255,255,255], secondary: [170,170,170], accent: [0,112,243], surface: [0,0,0], text: [255,255,255], muted: [102,102,102] },
  supabase: { particles: [[62,207,142],[36,180,126],[20,140,100]], background: [[62,207,142],[36,180,126]], glow: [62,207,142], primary: [62,207,142], secondary: [36,180,126], accent: [100,220,160], surface: [12,20,18], text: [230,255,245], muted: [100,160,140] },
  discord: { particles: [[88,101,242],[114,137,218],[78,84,200]], background: [[88,101,242],[114,137,218]], glow: [88,101,242], primary: [88,101,242], secondary: [114,137,218], accent: [87,242,135], surface: [30,31,34], text: [255,255,255], muted: [148,155,164] },
  spotify: { particles: [[29,185,84],[30,215,96],[25,150,70]], background: [[29,185,84],[25,20,20]], glow: [29,185,84], primary: [29,185,84], secondary: [30,215,96], accent: [255,255,255], surface: [18,18,18], text: [255,255,255], muted: [179,179,179] },
};

function rgb(c: number[]) {
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1200); }}
      className="text-[10px] font-mono px-2 py-0.5 rounded transition-colors"
      style={{
        background: copied ? "rgba(34,211,153,0.15)" : "rgba(255,255,255,0.05)",
        color: copied ? "rgb(34,211,153)" : "rgba(255,255,255,0.35)",
      }}
      title={`Copy ${value}`}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}

export default function PalettesSection() {
  const [selected, setSelected] = useState<string>("default");
  const pal = PALETTES[selected];
  const [codeCopied, setCodeCopied] = useState(false);

  const codeSnippet = `<GradientMesh colors={[${pal.particles.map(c => `[${c.join(",")}]`).join(", ")}]} />`;

  return (
    <section id="palettes" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-400 mb-2 tracking-widest uppercase">
          Color Palettes
        </h2>
        <p className="text-white/50 mb-8 max-w-xl text-sm">
          Pick a palette, see it applied live below. Then copy the colors into your effect props.
        </p>

        {/* Palette picker strip */}
        <div className="flex gap-2 flex-wrap mb-10">
          {Object.keys(PALETTES).map((name) => {
            const p = PALETTES[name];
            const isActive = selected === name;
            return (
              <button
                key={name}
                onClick={() => setSelected(name)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
                style={{
                  background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                  borderColor: isActive ? rgb(p.primary) : "rgba(255,255,255,0.08)",
                  boxShadow: isActive ? `0 0 12px ${rgb(p.primary)}30` : "none",
                }}
              >
                <div className="flex gap-0.5">
                  {[p.primary, p.secondary, p.accent].map((c, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ background: rgb(c) }} />
                  ))}
                </div>
                <span className="text-xs font-medium" style={{ color: isActive ? "white" : "rgba(255,255,255,0.4)" }}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live preview grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

          {/* Background preview */}
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <div className="h-64 relative" style={{ background: rgb(pal.surface) }}>
              <GradientMesh
                key={selected}
                colors={pal.particles as [number, number, number][]}
                speed={0.4}
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-lg font-bold" style={{ color: rgb(pal.text), textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
                  Background
                </p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span className="text-[11px] text-white/40 font-mono">GradientMesh + particles colors</span>
              <CopyValue value={`colors={[${pal.particles.map(c => `[${c.join(",")}]`).join(", ")}]}`} label="Copy props" />
            </div>
          </div>

          {/* Card / UI preview */}
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <div className="h-64 p-6 flex flex-col justify-between" style={{ background: rgb(pal.surface) }}>
              <div>
                <h3 className="text-xl font-bold mb-1" style={{ color: rgb(pal.text) }}>Card Title</h3>
                <p className="text-sm" style={{ color: rgb(pal.muted) }}>A description using the muted color from this palette.</p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold transition-transform hover:scale-105" style={{ background: rgb(pal.primary), color: rgb(pal.surface) }}>
                  Primary
                </button>
                <button className="px-4 py-2 rounded-lg text-sm font-semibold border transition-transform hover:scale-105" style={{ borderColor: rgb(pal.accent), color: rgb(pal.accent) }}>
                  Accent
                </button>
                <div className="flex items-center gap-2 ml-auto">
                  <div className="w-3 h-3 rounded-full" style={{ background: rgb(pal.glow), boxShadow: `0 0 8px ${rgb(pal.glow)}` }} />
                  <span className="text-xs" style={{ color: rgb(pal.muted) }}>glow</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span className="text-[11px] text-white/40 font-mono">UI colors: primary, accent, surface, text</span>
              <CopyValue value={`primary={[${pal.primary.join(",")}]} accent={[${pal.accent.join(",")}]}`} label="Copy props" />
            </div>
          </div>

          {/* Text preview */}
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <div className="h-64 flex items-center justify-center" style={{ background: rgb(pal.surface) }}>
              <div className="text-center">
                <p className="text-4xl font-black mb-2 tracking-tight" style={{ color: rgb(pal.primary) }}>
                  Heading
                </p>
                <p className="text-lg" style={{
                  background: `linear-gradient(135deg, ${rgb(pal.primary)}, ${rgb(pal.secondary)}, ${rgb(pal.accent)})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                }}>
                  Gradient Text
                </p>
                <p className="text-sm mt-2" style={{ color: rgb(pal.muted) }}>
                  Body text in muted
                </p>
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span className="text-[11px] text-white/40 font-mono">Text colors: primary → secondary → accent gradient</span>
              <CopyValue value={`color={[${pal.primary.join(",")}]}`} label="Copy color" />
            </div>
          </div>

          {/* Full color table */}
          <div className="rounded-2xl overflow-hidden border border-white/10">
            <div className="h-64 p-5 overflow-y-auto" style={{ background: "rgba(0,0,0,0.2)" }}>
              <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider mb-3">All colors — click to copy</p>
              <div className="space-y-2">
                {Object.entries(pal).map(([key, value]) => {
                  const isArray = Array.isArray(value[0]);
                  const copyStr = isArray
                    ? `[${(value as number[][]).map(c => `[${c.join(",")}]`).join(", ")}]`
                    : `[${(value as number[]).join(", ")}]`;
                  return (
                    <button
                      key={key}
                      onClick={() => { navigator.clipboard.writeText(copyStr); }}
                      className="flex items-center gap-3 w-full text-left hover:bg-white/5 rounded-lg px-2 py-1 -mx-2 transition-colors group"
                    >
                      <div className="flex gap-1 flex-shrink-0">
                        {isArray
                          ? (value as number[][]).map((c, i) => <div key={i} className="w-4 h-4 rounded" style={{ background: rgb(c) }} />)
                          : <div className="w-4 h-4 rounded" style={{ background: rgb(value as number[]) }} />
                        }
                      </div>
                      <span className="text-[11px] text-white/40 font-mono w-20 flex-shrink-0">{key}</span>
                      <span className="text-[10px] text-white/15 font-mono group-hover:text-white/40 truncate flex-1 transition-colors">{copyStr}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: "rgba(0,0,0,0.3)" }}>
              <span className="text-[11px] text-white/40 font-mono">9 colors per palette</span>
              <CopyValue
                value={codeSnippet}
                label="Copy usage"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
