import { useEffect, useRef, useState } from "react";
import { useSpring, useInView } from "../hooks";

type FormatType = "integer" | "decimal" | "currency" | "percent";

interface CounterTickerProps {
  value: number;
  format?: FormatType;
  prefix?: string;
  suffix?: string;
  scrollTrigger?: boolean;
  className?: string;
}

function formatNumber(val: number, format: FormatType): string {
  switch (format) {
    case "decimal":
      return val.toFixed(2);
    case "currency":
      return val.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    case "percent":
      return val.toFixed(1);
    case "integer":
    default:
      return Math.round(val).toLocaleString();
  }
}

interface DigitColumnProps {
  digit: string;
  prevDigit: string;
}

function DigitColumn({ digit, prevDigit }: DigitColumnProps) {
  const isNumeric = /\d/.test(digit);
  if (!isNumeric) {
    return (
      <span style={{ display: "inline-block", overflow: "hidden" }}>{digit}</span>
    );
  }

  const numDigit = parseInt(digit, 10);
  const numPrev = parseInt(prevDigit, 10);
  const changed = numDigit !== numPrev;

  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "top",
        height: "1.2em",
        lineHeight: "1.2em",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          transform: `translateY(-${numDigit * 1.2}em)`,
          transition: changed ? "transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)" : "none",
        }}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i} style={{ height: "1.2em", lineHeight: "1.2em" }}>
            {i}
          </span>
        ))}
      </span>
    </span>
  );
}

export default function CounterTicker({
  value,
  format = "integer",
  prefix = "",
  suffix = "",
  scrollTrigger = true,
  className = "",
}: CounterTickerProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 18 });
  const { ref, inView } = useInView({ threshold: 0.3, once: true });
  const rafRef = useRef<number>(0);
  const lastTime = useRef<number>(0);
  const [displayVal, setDisplayVal] = useState(0);
  const prevDisplayStr = useRef("");

  const shouldStart = scrollTrigger ? inView : true;

  useEffect(() => {
    if (!shouldStart) return;
    spring.target.current = value;

    let running = true;
    const loop = (now: number) => {
      if (!running) return;
      const dt = lastTime.current ? Math.min((now - lastTime.current) / 1000, 0.05) : 0.016;
      lastTime.current = now;
      const current = spring.tick(dt);
      setDisplayVal(current);
      if (!spring.settled()) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [shouldStart, value, spring]);

  const displayStr = formatNumber(displayVal, format);
  const prevStr = prevDisplayStr.current.padStart(displayStr.length, " ");
  prevDisplayStr.current = displayStr;

  return (
    <div ref={ref} className={`inline-flex items-baseline font-mono tabular-nums ${className}`}>
      {prefix && <span>{prefix}</span>}
      <span style={{ display: "inline-flex" }}>
        {displayStr.split("").map((char, i) => (
          <DigitColumn
            key={i}
            digit={char}
            prevDigit={prevStr[i] ?? char}
          />
        ))}
      </span>
      {suffix && <span>{suffix}</span>}
    </div>
  );
}
