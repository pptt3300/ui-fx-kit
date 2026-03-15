"use client";

import { useState } from "react";

const PALETTE_NAMES = [
  "default", "neon", "pastel", "warm", "arctic", "mono",
  "stripe", "vercel", "linear", "supabase", "figma", "discord", "spotify",
] as const;

const PALETTE_COLORS: Record<string, string> = {
  default: "#6366f1",
  neon: "#ff2d95",
  pastel: "#c4b5fd",
  warm: "#f59e0b",
  arctic: "#7dd3fc",
  mono: "#a1a1aa",
  stripe: "#635bff",
  vercel: "#ffffff",
  linear: "#5e6ad2",
  supabase: "#3ecf8e",
  figma: "#f24e1e",
  discord: "#5865f2",
  spotify: "#1db954",
};

interface ThemeSwitcherProps {
  current: string;
  onChange: (palette: string) => void;
}

export default function ThemeSwitcher({ current, onChange }: ThemeSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div
          className="absolute bottom-14 right-0 p-3 rounded-2xl grid grid-cols-4 gap-2 w-56"
          style={{
            background: "rgba(10,10,20,0.9)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="col-span-4 text-[10px] text-white/40 font-mono uppercase tracking-wider mb-1 px-1">
            Theme
          </div>
          {PALETTE_NAMES.map((name) => (
            <button
              key={name}
              onClick={() => { onChange(name); setOpen(false); }}
              className="group flex flex-col items-center gap-1"
              title={name}
            >
              <div
                className="w-8 h-8 rounded-lg transition-all"
                style={{
                  background: PALETTE_COLORS[name],
                  boxShadow: current === name
                    ? `0 0 0 2px #0a0a14, 0 0 0 4px ${PALETTE_COLORS[name]}`
                    : "none",
                  transform: current === name ? "scale(1.1)" : "scale(1)",
                }}
              />
              <span className="text-[9px] text-white/30 group-hover:text-white/60 transition-colors truncate w-full text-center">
                {name}
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-110"
        style={{
          background: PALETTE_COLORS[current] || "#6366f1",
          boxShadow: `0 4px 20px ${PALETTE_COLORS[current] || "#6366f1"}40`,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>
    </div>
  );
}
