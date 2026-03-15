"use client";

export default function FooterSection() {
  return (
    <footer
      style={{
        background: "#050508",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "80px 24px 48px",
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Architecture diagram */}
        <div style={{ marginBottom: 72 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            Architecture
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0,
            }}
          >
            {/* Layer 3: Effects */}
            <div
              style={{
                width: "100%",
                maxWidth: 640,
                border: "1px solid rgba(99,102,241,0.4)",
                borderRadius: 12,
                padding: "20px 24px",
                background: "rgba(99,102,241,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "rgba(165,180,252,0.95)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Effects (64)
                </span>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 2,
                  }}
                >
                  Complete React components
                </p>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(99,102,241,0.5)",
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                  borderRadius: 6,
                  padding: "4px 10px",
                }}
              >
                Layer 3
              </span>
            </div>

            {/* Arrow down */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "6px 0",
                color: "rgba(255,255,255,0.15)",
              }}
            >
              <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.12)" }} />
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.18)", marginTop: 2, letterSpacing: "0.05em" }}>
                composes
              </p>
            </div>

            {/* Layer 2: CSS */}
            <div
              style={{
                width: "100%",
                maxWidth: 540,
                border: "1px solid rgba(139,92,246,0.4)",
                borderRadius: 12,
                padding: "20px 24px",
                background: "rgba(139,92,246,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "rgba(196,181,253,0.95)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  CSS (13)
                </span>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 2,
                  }}
                >
                  Animations, glass, glow, shimmer, glitch
                </p>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(139,92,246,0.5)",
                  background: "rgba(139,92,246,0.1)",
                  border: "1px solid rgba(139,92,246,0.2)",
                  borderRadius: 6,
                  padding: "4px 10px",
                }}
              >
                Layer 2
              </span>
            </div>

            {/* Arrow down */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "6px 0",
              }}
            >
              <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.12)" }} />
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none">
                <path d="M1 1L5 5L9 1" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.18)", marginTop: 2, letterSpacing: "0.05em" }}>
                composes
              </p>
            </div>

            {/* Layer 1: Hooks */}
            <div
              style={{
                width: "100%",
                maxWidth: 440,
                border: "1px solid rgba(236,72,153,0.4)",
                borderRadius: 12,
                padding: "20px 24px",
                background: "rgba(236,72,153,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "rgba(249,168,212,0.95)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  Hooks (19)
                </span>
                <p
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.35)",
                    marginTop: 2,
                  }}
                >
                  Physics, gestures, noise, WebGL, particles
                </p>
              </div>
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(236,72,153,0.5)",
                  background: "rgba(236,72,153,0.1)",
                  border: "1px solid rgba(236,72,153,0.2)",
                  borderRadius: 6,
                  padding: "4px 10px",
                }}
              >
                Layer 1
              </span>
            </div>
          </div>
        </div>

        {/* Get Started */}
        <div style={{ marginBottom: 72 }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            Get Started
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
            }}
          >
            {/* Claude Code method */}
            <div
              style={{
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 12,
                padding: "24px",
                background: "rgba(99,102,241,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "monospace",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "rgba(99,102,241,0.7)",
                    background: "rgba(99,102,241,0.12)",
                    border: "1px solid rgba(99,102,241,0.25)",
                    borderRadius: 4,
                    padding: "3px 8px",
                  }}
                >
                  Recommended
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                  With Claude Code
                </span>
              </div>

              {/* Step 1 */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "monospace" }}>
                  Step 1 — Add MCP server to Claude settings
                </p>
                <div
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    fontFamily: "monospace",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.6,
                    overflowX: "auto",
                    whiteSpace: "pre",
                  }}
                >
                  {`{\n  "mcpServers": {\n    "ui-fx-kit": {\n      "command": "npx",\n      "args": ["ui-fx-kit-mcp"]\n    }\n  }\n}`}
                </div>
              </div>

              {/* Step 2 */}
              <div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "monospace" }}>
                  Step 2 — Ask Claude
                </p>
                <div
                  style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(99,102,241,0.2)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "rgba(165,180,252,0.8)",
                    lineHeight: 1.5,
                  }}
                >
                  Add holographic-card to my project
                </div>
              </div>
            </div>

            {/* Manual method */}
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "24px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>
                  Manual
                </span>
              </div>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16, lineHeight: 1.6 }}>
                Copy any effect directory into your project. Each effect is self-contained with no hidden dependencies.
              </p>

              <div
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                }}
              >
                <span style={{ color: "rgba(99,102,241,0.7)" }}>effects/</span>
                <br />
                &nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.4)" }}>holographic-card/</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.3)" }}>index.tsx</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.3)" }}>styles.css</span>
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "rgba(255,255,255,0.3)" }}>meta.json</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: 28 }} />

        {/* Stats row */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              letterSpacing: "0.08em",
            }}
          >
            64 effects · 19 hooks · 13 CSS · 13 palettes
          </p>
        </div>

        {/* MIT License */}
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "rgba(255,255,255,0.15)",
              letterSpacing: "0.08em",
            }}
          >
            MIT License
          </p>
        </div>

      </div>
    </footer>
  );
}
