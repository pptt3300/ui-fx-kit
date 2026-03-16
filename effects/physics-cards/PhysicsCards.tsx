import { motion } from "framer-motion";
import { useTilt3D } from "../../hooks";

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, shineRef, handlers } = useTilt3D({ maxRotation: 15 });

  return (
    <div
      ref={ref}
      {...handlers}
      className={`relative group ${className}`}
    >
      <div className="relative z-10">{children}</div>
      <div
        ref={shineRef}
        className="absolute inset-0 rounded-2xl z-20 pointer-events-none"
      />
    </div>
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

export default function PhysicsCards({ embedded = false }: { embedded?: boolean } = {}) {
  const cards = [
    { color: "bg-gradient-to-br from-violet-600 to-indigo-700", title: "Spring Physics", desc: "Drag me around! I'll spring back with natural momentum.", icon: "🌀" },
    { color: "bg-gradient-to-br from-rose-500 to-pink-600", title: "3D Tilt", desc: "Move your cursor over me to see the perspective shift.", icon: "💎" },
    { color: "bg-gradient-to-br from-amber-500 to-orange-600", title: "Elastic Drag", desc: "Feel the resistance as you pull me from my origin.", icon: "🔥" },
    { color: "bg-gradient-to-br from-emerald-500 to-teal-600", title: "Smooth Motion", desc: "60fps animations powered by hardware acceleration.", icon: "⚡" },
  ];

  const grid = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {cards.map((card) => (
        <DraggableCard key={card.title} {...card} />
      ))}
    </div>
  );

  if (embedded) return grid;

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-500 mb-2 tracking-widest uppercase">02 / Physics & Gestures</h2>
        <p className="text-slate-500 mb-12 max-w-lg">
          Cards with spring-based drag physics and 3D perspective tilt. Drag them around, hover to see the light reflection shift in real-time.
        </p>
        {grid}
      </div>
    </section>
  );
}
