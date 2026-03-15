import { useState, useEffect, useRef } from "react";

type TransitionType = "morph" | "fade" | "slide";

interface PageTransitionProps {
  activeKey: string;
  children: React.ReactNode;
  type?: TransitionType;
  className?: string;
}

interface Slot {
  key: string;
  node: React.ReactNode;
  phase: "enter" | "active" | "exit";
}

const DURATION = 300;

const getEnterStyle = (type: TransitionType, phase: "enter" | "active" | "exit"): React.CSSProperties => {
  if (phase === "active") {
    return { opacity: 1, transform: "none", filter: "none", transition: `all ${DURATION}ms ease` };
  }
  if (phase === "enter") {
    switch (type) {
      case "morph":
        return { opacity: 0, transform: "scale(0.95)", transition: "none" };
      case "fade":
        return { opacity: 0, transition: "none" };
      case "slide":
        return { opacity: 0, transform: "translateX(40px)", transition: "none" };
    }
  }
  // exit
  switch (type) {
    case "morph":
      return { opacity: 0, transform: "scale(1.02)", transition: `all ${DURATION}ms ease` };
    case "fade":
      return { opacity: 0, transition: `opacity ${DURATION}ms ease` };
    case "slide":
      return { opacity: 0, transform: "translateX(-40px)", transition: `all ${DURATION}ms ease` };
  }
};

export default function PageTransition({
  activeKey,
  children,
  type = "morph",
  className = "",
}: PageTransitionProps) {
  const [slots, setSlots] = useState<Slot[]>([
    { key: activeKey, node: children, phase: "active" },
  ]);
  const prevKeyRef = useRef(activeKey);
  const prevChildrenRef = useRef(children);

  useEffect(() => {
    if (activeKey === prevKeyRef.current) {
      // same key, just update node
      prevChildrenRef.current = children;
      setSlots((prev) =>
        prev.map((s) => (s.key === activeKey ? { ...s, node: children } : s)),
      );
      return;
    }

    const incomingKey = activeKey;
    const incomingNode = children;

    // 1. Start exit on current active slot
    setSlots((prev) =>
      prev.map((s) =>
        s.phase === "active" ? { ...s, phase: "exit" as const } : s,
      ).concat([{ key: incomingKey, node: incomingNode, phase: "enter" as const }]),
    );

    // 2. Activate incoming on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSlots((prev) =>
          prev.map((s) =>
            s.key === incomingKey ? { ...s, phase: "active" as const } : s,
          ),
        );
      });
    });

    // 3. Remove exited slot after transition
    const timer = setTimeout(() => {
      setSlots((prev) => prev.filter((s) => s.key !== prevKeyRef.current));
    }, DURATION + 50);

    prevKeyRef.current = activeKey;
    prevChildrenRef.current = children;

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);

  return (
    <div className={`relative ${className}`} style={{ isolation: "isolate" }}>
      {slots.map((slot) => (
        <div
          key={slot.key}
          style={{
            position: slot.phase !== "active" ? "absolute" : "relative",
            inset: 0,
            ...getEnterStyle(type, slot.phase),
          }}
        >
          {slot.node}
        </div>
      ))}
    </div>
  );
}
