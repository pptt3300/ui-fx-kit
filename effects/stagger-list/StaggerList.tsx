import { useEffect, useRef, useState } from "react";
import { useStagger, useInView } from "../../hooks";
import "../../css/stagger-presets.css";

type Variant = "slide-up" | "scale-in" | "blur-in" | "flip-in";
type Pattern = "linear" | "center-out" | "edges-in" | "random";
type Trigger = "mount" | "inView";

interface StaggerListProps {
  children: React.ReactNode[];
  variant?: Variant;
  pattern?: Pattern;
  duration?: number;
  trigger?: Trigger;
  className?: string;
}

const VARIANT_CLASS: Record<Variant, string> = {
  "slide-up": "fx-stagger-slide-up",
  "scale-in": "fx-stagger-scale",
  "blur-in": "fx-stagger-blur",
  "flip-in": "fx-stagger-flip",
};

export default function StaggerList({
  children,
  variant = "slide-up",
  pattern = "linear",
  duration = 400,
  trigger = "inView",
  className = "",
}: StaggerListProps) {
  const { ref, inView } = useInView({ threshold: 0.1, once: true });
  const stagger = useStagger({ count: children.length, duration, pattern });
  const [activeItems, setActiveItems] = useState<boolean[]>(() =>
    Array(children.length).fill(false),
  );
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const shouldTrigger = trigger === "mount" || inView;

  useEffect(() => {
    if (!shouldTrigger) return;

    stagger.start();

    // Schedule each item activation
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    for (let i = 0; i < children.length; i++) {
      const delay = stagger.getDelay(i);
      const timer = setTimeout(() => {
        setActiveItems((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, delay);
      timersRef.current.push(timer);
    }

    return () => timersRef.current.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldTrigger]);

  const variantClass = VARIANT_CLASS[variant];

  return (
    <div ref={trigger === "inView" ? ref : undefined} className={className}>
      {children.map((child, i) => (
        <div
          key={i}
          className={`fx-stagger-item ${variantClass} ${activeItems[i] ? "fx-active" : ""}`}
          style={
            activeItems[i]
              ? { animationDuration: `${duration}ms` }
              : undefined
          }
        >
          {child}
        </div>
      ))}
    </div>
  );
}
