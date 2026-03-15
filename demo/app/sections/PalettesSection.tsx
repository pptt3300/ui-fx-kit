"use client";

import { useState } from "react";

const PALETTES: Record<string, { particles: number[][]; background: number[][]; glow: number[]; primary: number[]; secondary: number[]; accent: number[]; surface: number[]; text: number[]; muted: number[] }> = {
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

function PaletteCard({ name, palette }: { name: string; palette: typeof PALETTES["default"] }) {
  const colors = [palette.primary, palette.secondary, palette.accent, palette.glow, ...palette.particles];

  return (
    <div
      className="rounded-2xl p-4 border border-white/10 transition-transform hover:scale-[1.03]"
      style={{ background: rgb(palette.surface) }}
    >
      <div className="flex gap-1.5 mb-3">
        {colors.slice(0, 6).map((c, i) => (
          <div
            key={i}
            className="w-6 h-6 rounded-full"
            style={{ background: rgb(c), boxShadow: `0 0 8px ${rgb(c)}40` }}
          />
        ))}
      </div>
      <p className="text-sm font-semibold mb-0.5" style={{ color: rgb(palette.text) }}>
        {name}
      </p>
      <p className="text-[10px] font-mono" style={{ color: rgb(palette.muted) }}>
        {colors.slice(0, 3).map(c => `rgb(${c.join(",")})`).join(" · ")}
      </p>
    </div>
  );
}

function PalettePreview({ palette }: { palette: typeof PALETTES["default"] }) {
  return (
    <div className="flex gap-3 items-center">
      {/* Simulated effect preview using palette colors */}
      <div
        className="w-32 h-32 rounded-2xl relative overflow-hidden flex-shrink-0"
        style={{ background: rgb(palette.surface) }}
      >
        {/* Floating gradient blobs */}
        <div
          className="absolute w-16 h-16 rounded-full blur-xl opacity-60 top-2 left-2"
          style={{ background: rgb(palette.primary) }}
        />
        <div
          className="absolute w-12 h-12 rounded-full blur-xl opacity-50 bottom-4 right-2"
          style={{ background: rgb(palette.secondary) }}
        />
        <div
          className="absolute w-8 h-8 rounded-full blur-lg opacity-40 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ background: rgb(palette.accent) }}
        />
        {/* Particles */}
        {palette.particles.slice(0, 5).map((c, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              background: rgb(c),
              top: `${20 + i * 15}%`,
              left: `${15 + i * 18}%`,
              boxShadow: `0 0 4px ${rgb(c)}`,
            }}
          />
        ))}
      </div>
      <div>
        <div className="flex gap-1 mb-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: `${rgb(palette.primary)}20`, color: rgb(palette.primary) }}>
            primary
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ background: `${rgb(palette.accent)}20`, color: rgb(palette.accent) }}>
            accent
          </span>
        </div>
        <p className="text-white/30 text-xs leading-relaxed">
          Use these colors as props:<br />
          <code className="text-white/50">colors={`{[${palette.primary.join(",")}]}`}</code>
        </p>
      </div>
    </div>
  );
}

export default function PalettesSection() {
  const [selected, setSelected] = useState<string>("default");
  const paletteNames = Object.keys(PALETTES);

  return (
    <section id="palettes" className="py-24 px-6 bg-zinc-950">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-400 mb-2 tracking-widest uppercase">
          Color Palettes
        </h2>
        <p className="text-white/50 mb-4 max-w-lg text-sm">
          13 curated color palettes. Pick one and pass its colors as props to any effect.
        </p>
        <p className="text-white/30 mb-12 max-w-lg text-xs font-mono">
          Not a runtime theme — just a reference. Copy the RGB values you like.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {paletteNames.map((name) => (
            <button
              key={name}
              onClick={() => setSelected(name)}
              className={`text-left transition-all ${selected === name ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950 rounded-2xl" : ""}`}
            >
              <PaletteCard name={name} palette={PALETTES[name]} />
            </button>
          ))}
        </div>

        {/* Selected palette detail */}
        <div className="rounded-2xl border border-white/10 p-8 bg-white/[0.02]">
          <div className="flex items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-white capitalize">{selected}</h3>
            <div className="h-px flex-1 bg-white/10" />
          </div>
          <PalettePreview palette={PALETTES[selected]} />

          {/* Full color table */}
          <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 gap-3">
            {Object.entries(PALETTES[selected]).map(([key, value]) => {
              if (Array.isArray(value[0])) {
                // Array of colors (particles, background)
                return (
                  <div key={key}>
                    <p className="text-[10px] text-white/30 font-mono mb-1">{key}</p>
                    <div className="flex gap-1">
                      {(value as number[][]).map((c, i) => (
                        <div key={i} className="w-5 h-5 rounded" style={{ background: rgb(c) }} title={`[${c.join(",")}]`} />
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <div key={key}>
                  <p className="text-[10px] text-white/30 font-mono mb-1">{key}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded" style={{ background: rgb(value as number[]) }} />
                    <span className="text-[10px] text-white/20 font-mono">[{(value as number[]).join(",")}]</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
