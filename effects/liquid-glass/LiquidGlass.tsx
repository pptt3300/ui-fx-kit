import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-2xl border border-white/20 backdrop-blur-xl bg-white/10 shadow-xl ${className}`}
    >
      {/* inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

function AnimatedBlob({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-60 ${className}`}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 15, -10, 0],
        scale: [1, 1.1, 0.95, 1.05, 1],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function MorphingShape() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [hue, setHue] = useState(250);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
    };
    resize();

    let t = 0;
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const r = Math.min(cx, cy) * 0.6;

      ctx.beginPath();
      const points = 6;
      for (let i = 0; i <= 360; i += 1) {
        const angle = (i * Math.PI) / 180;
        const noise = Math.sin(angle * points + t * 2) * 0.15 +
                      Math.sin(angle * (points + 2) + t * 1.5) * 0.1 +
                      Math.cos(angle * (points - 1) + t * 0.8) * 0.08;
        const radius = r * (1 + noise);
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3);
      gradient.addColorStop(0, `hsla(${hue}, 80%, 65%, 0.8)`);
      gradient.addColorStop(0.5, `hsla(${hue + 30}, 70%, 55%, 0.5)`);
      gradient.addColorStop(1, `hsla(${hue + 60}, 60%, 45%, 0.1)`);
      ctx.fillStyle = gradient;
      ctx.fill();

      t += 0.008;
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [hue]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full cursor-pointer"
        style={{ height: 280 }}
        onClick={() => setHue((h) => (h + 50) % 360)}
      />
      <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-white/40">
        Click to shift hue
      </p>
    </div>
  );
}

export default function LiquidGlass() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900" />

      {/* Animated blobs */}
      <AnimatedBlob className="w-96 h-96 bg-indigo-500 -top-20 -left-20" />
      <AnimatedBlob className="w-80 h-80 bg-purple-500 top-1/3 right-0" delay={3} />
      <AnimatedBlob className="w-72 h-72 bg-pink-500 bottom-0 left-1/3" delay={6} />
      <AnimatedBlob className="w-64 h-64 bg-cyan-500 top-0 right-1/3" delay={9} />

      <div className="relative z-10 max-w-5xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-300 mb-2 tracking-widest uppercase">07 / Liquid Glass</h2>
        <p className="text-indigo-200/60 mb-12 max-w-lg">
          Glassmorphism with animated gradient blobs, morphing organic shapes, and frosted glass cards. Click the shape to shift its color palette.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard className="p-6 md:col-span-2">
            <MorphingShape />
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="text-4xl mb-3">🌈</div>
              <h3 className="text-white font-semibold mb-1">Dynamic Backdrop</h3>
              <p className="text-sm text-white/50">Animated gradient blobs create an ever-shifting background that the glass cards blur and refract.</p>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="text-4xl mb-3">🫧</div>
              <h3 className="text-white font-semibold mb-1">Organic Morphing</h3>
              <p className="text-sm text-white/50">Superimposed sine waves create smooth, organic shape deformation at 60fps on canvas.</p>
            </GlassCard>
          </div>
        </div>

        {/* Mini glass cards row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {["backdrop-blur", "border-glow", "inner-shadow", "refraction"].map((label, i) => (
            <GlassCard key={i} className="p-4 text-center">
              <div className="text-2xl mb-2">{["🔮", "💎", "🌟", "🪩"][i]}</div>
              <span className="text-xs text-white/60 font-mono">{label}</span>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
