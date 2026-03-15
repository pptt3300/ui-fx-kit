import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SpotlightCard({ title, description, icon, gradient }: {
  title: string;
  description: string;
  icon: string;
  gradient: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group cursor-default"
    >
      {/* Spotlight effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{
              background: `radial-gradient(300px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.15), transparent 60%)`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Border glow */}
      {isHovered && (
        <div
          className="absolute inset-0 z-0 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99,102,241,0.3), transparent 60%)`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />
      )}

      <div className="relative z-10 p-6">
        <div className={`w-12 h-12 rounded-xl ${gradient} flex items-center justify-center text-xl mb-4 shadow-lg`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>

      {/* Bottom gradient line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[2px]"
        style={{
          background: isHovered
            ? `linear-gradient(90deg, transparent, ${gradient.includes("violet") ? "#8b5cf6" : gradient.includes("rose") ? "#f43f5e" : gradient.includes("amber") ? "#f59e0b" : "#6366f1"}, transparent)`
            : "transparent",
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
}

export default function SpotlightCards() {
  const cards = [
    {
      title: "Cursor Tracking",
      description: "The spotlight follows your cursor precisely, creating a flashlight-like exploration effect across the card surface.",
      icon: "🔦",
      gradient: "bg-gradient-to-br from-violet-500 to-purple-600",
    },
    {
      title: "Border Glow",
      description: "A subtle border illumination radiates from the cursor position using CSS mask compositing for the cutout effect.",
      icon: "✨",
      gradient: "bg-gradient-to-br from-rose-500 to-pink-600",
    },
    {
      title: "Ambient Lighting",
      description: "Multiple radial gradients layer together to simulate ambient light scattering across the dark surface.",
      icon: "💡",
      gradient: "bg-gradient-to-br from-amber-500 to-orange-600",
    },
    {
      title: "Scroll Reveal",
      description: "Cards animate into view as you scroll, using Intersection Observer to trigger entrance animations efficiently.",
      icon: "👁️",
      gradient: "bg-gradient-to-br from-indigo-500 to-blue-600",
    },
    {
      title: "Spring Physics",
      description: "All animations use spring-based easing for natural, organic motion that mimics real-world physical behavior.",
      icon: "🌊",
      gradient: "bg-gradient-to-br from-emerald-500 to-teal-600",
    },
    {
      title: "GPU Accelerated",
      description: "Transform and opacity animations are composited on the GPU, ensuring smooth 60fps performance even on complex layouts.",
      icon: "⚡",
      gradient: "bg-gradient-to-br from-cyan-500 to-sky-600",
    },
  ];

  return (
    <section className="py-24 px-6 bg-slate-950">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-400 mb-2 tracking-widest uppercase">04 / Spotlight Cards</h2>
        <p className="text-slate-500 mb-12 max-w-lg">
          Dark cards with cursor-tracking spotlight, border glow, and scroll-triggered entrance animations.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <SpotlightCard key={i} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
