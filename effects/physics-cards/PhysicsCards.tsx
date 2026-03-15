import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), { stiffness: 300, damping: 30 });
  const shine = useTransform(
    [x, y] as never,
    ([latestX, latestY]: number[]) =>
      `radial-gradient(circle at ${(latestX + 0.5) * 100}% ${(latestY + 0.5) * 100}%, rgba(255,255,255,0.25) 0%, transparent 60%)`
  );

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative group ${className}`}
    >
      <div className="relative z-10">{children}</div>
      <motion.div
        className="absolute inset-0 rounded-2xl z-20 pointer-events-none"
        style={{ background: shine }}
      />
    </motion.div>
  );
}

function DraggableCard({ color, title, desc, icon }: {
  color: string; title: string; desc: string; icon: string;
}) {
  return (
    <motion.div
      drag
      dragElastic={0.2}
      dragConstraints={{ top: -100, bottom: 100, left: -100, right: 100 }}
      whileDrag={{ scale: 1.08, zIndex: 50, cursor: "grabbing" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="cursor-grab active:cursor-grabbing select-none"
    >
      <TiltCard>
        <div className={`rounded-2xl p-6 ${color} shadow-lg border border-white/20`}>
          <span className="text-3xl mb-3 block">{icon}</span>
          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          <p className="text-sm text-white/70">{desc}</p>
        </div>
      </TiltCard>
    </motion.div>
  );
}

export default function PhysicsCards() {
  const cards = [
    { color: "bg-gradient-to-br from-violet-600 to-indigo-700", title: "Spring Physics", desc: "Drag me around! I'll spring back with natural momentum.", icon: "🌀" },
    { color: "bg-gradient-to-br from-rose-500 to-pink-600", title: "3D Tilt", desc: "Move your cursor over me to see the perspective shift.", icon: "💎" },
    { color: "bg-gradient-to-br from-amber-500 to-orange-600", title: "Elastic Drag", desc: "Feel the resistance as you pull me from my origin.", icon: "🔥" },
    { color: "bg-gradient-to-br from-emerald-500 to-teal-600", title: "Smooth Motion", desc: "60fps animations powered by hardware acceleration.", icon: "⚡" },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-500 mb-2 tracking-widest uppercase">02 / Physics & Gestures</h2>
        <p className="text-slate-500 mb-12 max-w-lg">
          Cards with spring-based drag physics and 3D perspective tilt. Drag them around, hover to see the light reflection shift in real-time.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card) => (
            <DraggableCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
