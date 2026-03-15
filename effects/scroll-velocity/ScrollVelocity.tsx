import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from "framer-motion";

function VelocityText({ text, baseVelocity = 1 }: { text: string; baseVelocity: number }) {
  const velocityRef = useRef(0);
  const { scrollY } = useScroll();
  const prevScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const delta = latest - prevScrollY.current;
    prevScrollY.current = latest;
    velocityRef.current = delta;
  });

  const x = useSpring(
    useTransform(scrollY, (v) => {
      // infinite marquee effect influenced by scroll velocity
      return -(((v * baseVelocity * 0.5) % (text.length * 60)) + text.length * 60) % (text.length * 60);
    }),
    { stiffness: 100, damping: 30 }
  );

  // repeat text enough times to fill viewport
  const repeated = Array.from({ length: 8 }, (_, i) => (
    <span key={i} className="mx-4 whitespace-nowrap">{text}</span>
  ));

  return (
    <motion.div style={{ x }} className="flex whitespace-nowrap">
      {repeated}
    </motion.div>
  );
}

function CounterSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const nums = [
    { label: "FPS Target", end: 60, suffix: "" },
    { label: "Components", end: 8, suffix: "+" },
    { label: "Lines of Code", end: 1200, suffix: "+" },
    { label: "Dependencies", end: 3, suffix: "" },
  ];

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16">
      {nums.map((item, i) => {
        const value = useTransform(scrollYProgress, [0.1, 0.5], [0, item.end]);
        const rounded = useSpring(value, { stiffness: 50, damping: 20 });

        return (
          <div key={i} className="text-center">
            <motion.span className="text-5xl font-black text-indigo-600 tabular-nums block">
              {/* We need to render the spring value */}
              <AnimatedNumber value={rounded} />
              {item.suffix}
            </motion.span>
            <span className="text-sm text-slate-500 mt-2 block">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function AnimatedNumber({ value }: { value: ReturnType<typeof useSpring> }) {
  const ref = useRef<HTMLSpanElement>(null);

  useMotionValueEvent(value, "change", (latest) => {
    if (ref.current) {
      ref.current.textContent = Math.round(latest).toString();
    }
  });

  return <span ref={ref}>0</span>;
}

export default function ScrollVelocity() {
  return (
    <section className="py-24 overflow-hidden bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <h2 className="text-sm font-mono text-indigo-500 mb-2 tracking-widest uppercase">06 / Scroll-Driven</h2>
        <p className="text-slate-500 max-w-lg">
          Text that accelerates with scroll velocity, and counters that animate into view as you scroll. The scroll position drives the animation timeline.
        </p>
      </div>

      <div className="space-y-3 select-none">
        <div className="text-6xl md:text-8xl font-black text-slate-200 overflow-hidden">
          <VelocityText text="INTERACTIVE  DESIGN  " baseVelocity={1} />
        </div>
        <div className="text-6xl md:text-8xl font-black text-indigo-100 overflow-hidden">
          <VelocityText text="CREATIVE  FRONTEND  " baseVelocity={-0.7} />
        </div>
        <div className="text-6xl md:text-8xl font-black text-slate-200 overflow-hidden">
          <VelocityText text="MOTION  PHYSICS  " baseVelocity={1.3} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        <CounterSection />
      </div>
    </section>
  );
}
