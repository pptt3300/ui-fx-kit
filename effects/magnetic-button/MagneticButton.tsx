import { motion } from "framer-motion";
import { useMagnetic } from "../../hooks";

function Magnetic({ children, className = "", strength = 40 }: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}) {
  const { ref, handlers } = useMagnetic({ strength });

  return (
    <div
      ref={ref}
      {...handlers}
      className={className}
    >
      {children}
    </div>
  );
}

function RippleButton({ label, variant }: { label: string; variant: "primary" | "outline" | "ghost" }) {
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-slate-600 hover:bg-slate-100",
  };

  return (
    <Magnetic strength={30}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`relative overflow-hidden rounded-full px-8 py-3.5 font-semibold text-sm tracking-wide transition-colors ${styles[variant]}`}
      >
        <span className="relative z-10">{label}</span>
      </motion.button>
    </Magnetic>
  );
}

function MagneticIcon({ icon, color }: { icon: string; color: string }) {
  return (
    <Magnetic strength={50}>
      <motion.div
        whileHover={{ scale: 1.2, rotate: 10 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`w-16 h-16 rounded-2xl ${color} flex items-center justify-center text-2xl cursor-pointer shadow-lg`}
      >
        {icon}
      </motion.div>
    </Magnetic>
  );
}

export default function MagneticButtons() {
  return (
    <section className="py-24 px-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-mono text-indigo-500 mb-2 tracking-widest uppercase">03 / Magnetic Interactions</h2>
        <p className="text-slate-500 mb-12 max-w-lg">
          Elements that are magnetically attracted to your cursor. The displacement follows a spring-damped system — move slowly for smooth tracking, fast for elastic snap-back.
        </p>

        <div className="space-y-12">
          {/* Buttons */}
          <div className="flex flex-wrap gap-6 items-center justify-center">
            <RippleButton label="Get Started" variant="primary" />
            <RippleButton label="Learn More" variant="outline" />
            <RippleButton label="Contact Us" variant="ghost" />
          </div>

          {/* Icons */}
          <div className="flex gap-6 items-center justify-center">
            <MagneticIcon icon="🎨" color="bg-gradient-to-br from-pink-400 to-rose-500" />
            <MagneticIcon icon="🚀" color="bg-gradient-to-br from-violet-400 to-purple-500" />
            <MagneticIcon icon="✨" color="bg-gradient-to-br from-amber-400 to-orange-500" />
            <MagneticIcon icon="🎯" color="bg-gradient-to-br from-emerald-400 to-teal-500" />
            <MagneticIcon icon="💡" color="bg-gradient-to-br from-sky-400 to-blue-500" />
          </div>
        </div>
      </div>
    </section>
  );
}
