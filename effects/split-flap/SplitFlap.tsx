import "../../css/split-flap.css";
import { useSplitFlap } from "../../hooks";
import type { FlapChar } from "../../hooks";

interface SplitFlapProps {
  text: string;
  flipSpeed?: number;
  stagger?: number;
  dark?: boolean;
  className?: string;
}

export default function SplitFlap({
  text,
  flipSpeed = 60,
  stagger = 30,
  dark = true,
  className,
}: SplitFlapProps) {
  const { chars } = useSplitFlap({ text, flipSpeed, stagger, autoStart: true });

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        gap: "2px",
        fontFamily: "monospace",
        fontSize: "2rem",
        lineHeight: 1,
      }}
    >
      {chars.map((c: FlapChar, i: number) => {
        const rotateTop = c.flipping ? c.flipProgress * -90 : 0;
        return (
          <div
            key={i}
            className="fx-flap-char"
            style={{
              background: dark ? "#1a1a1a" : "#f0f0f0",
              color: dark ? "#e0e0e0" : "#111111",
            }}
          >
            {/* Top half — current char */}
            <div
              className="fx-flap-top"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: "2px",
                borderBottom: `1px solid ${dark ? "rgba(0,0,0,0.4)" : "rgba(200,200,200,0.8)"}`,
                color: dark ? "#e0e0e0" : "#111111",
                fontWeight: 700,
              }}
            >
              {c.current}
            </div>

            {/* Flipping flap (top half rotating down) */}
            {c.flipping && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  paddingBottom: "2px",
                  background: dark ? "#222" : "#e8e8e8",
                  color: dark ? "#e0e0e0" : "#111111",
                  fontWeight: 700,
                  transformOrigin: "bottom center",
                  transform: `rotateX(${rotateTop}deg)`,
                  zIndex: 2,
                }}
              >
                {c.current}
              </div>
            )}

            {/* Bottom half — current char */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                paddingTop: "2px",
                color: dark ? "#b0b0b0" : "#333333",
                fontWeight: 700,
              }}
            >
              {c.current}
            </div>
          </div>
        );
      })}
    </div>
  );
}
