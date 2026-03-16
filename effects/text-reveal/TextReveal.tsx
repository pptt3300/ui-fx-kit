import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

function RevealWord({ children, progress, range }: {
  children: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.1, 1]);
  const y = useTransform(progress, range, [8, 0]);
  const blur = useTransform(progress, range, [4, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.span
      style={{ opacity, y, filter }}
      className="inline-block mr-[0.3em]"
    >
      {children}
    </motion.span>
  );
}

function RevealChar({ char, progress, range }: { char: string; progress: ReturnType<typeof useScroll>["scrollYProgress"]; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0, 1]);
  const color = useTransform(
    progress,
    range,
    ["rgb(203 213 225)", "rgb(99 102 241)"]
  );

  return (
    <motion.span style={{ opacity, color }} className="inline-block">
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

function CharacterReveal({ text, progress, startRange }: {
  text: string;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  startRange: [number, number];
}) {
  const chars = text.split("");
  return (
    <span className="inline-block">
      {chars.map((char, i) => {
        const start = startRange[0] + (i / chars.length) * (startRange[1] - startRange[0]) * 0.5;
        const end = start + (startRange[1] - startRange[0]) * 0.5;
        return <RevealChar key={i} char={char} progress={progress} range={[start, end]} />;
      })}
    </span>
  );
}

export default function TextReveal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const paragraph = "Every pixel is intentional. Every animation tells a story. This playground demonstrates what's possible when you push the boundaries of web interactions beyond conventional templates.";
  const words = paragraph.split(" ");

  return (
    <section ref={containerRef} className="py-40 px-6 bg-white min-h-[60vh]">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-500 mb-2 tracking-widest uppercase">08 / Scroll Reveal</h2>
        <p className="text-slate-400 mb-16 max-w-lg text-sm">
          Text that progressively reveals as you scroll. Each word fades in and deblurs independently based on scroll position.
        </p>

        {/* Word-by-word reveal */}
        <p className="text-3xl md:text-4xl font-semibold text-slate-800 leading-relaxed mb-20">
          {words.map((word, i) => {
            const start = 0.1 + (i / words.length) * 0.6;
            const end = start + 0.08;
            return <RevealWord key={i} progress={scrollYProgress} range={[start, end]}>{word}</RevealWord>;
          })}
        </p>

        {/* Character-by-character color reveal */}
        <div className="text-5xl md:text-7xl font-black tracking-tight">
          <CharacterReveal
            text="BUILT DIFFERENT"
            progress={scrollYProgress}
            startRange={[0.5, 0.9]}
          />
        </div>
      </div>
    </section>
  );
}
