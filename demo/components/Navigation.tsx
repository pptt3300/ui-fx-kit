"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  id: string;
  label: string;
  category: string;
}

interface NavigationProps {
  items: NavItem[];
  activeId: string;
  onSelect: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Background: "bg-violet-500",
  Text: "bg-cyan-500",
  Card: "bg-pink-500",
  Cursor: "bg-yellow-500",
  Shader: "bg-emerald-500",
  Interactive: "bg-orange-500",
  Scroll: "bg-blue-500",
  Loading: "bg-red-500",
};

export default function Navigation({ items, activeId, onSelect }: NavigationProps) {
  const [expanded, setExpanded] = useState(false);

  const grouped = items.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleSelect = (id: string) => {
    onSelect(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      className="hidden lg:flex fixed left-0 top-0 h-full z-50 flex-col"
      animate={{ width: expanded ? 240 : 60 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Logo dot */}
      <div className="flex items-center h-16 px-4 shrink-0">
        <div className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
        <AnimatePresence>
          {expanded && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="ml-3 text-sm font-semibold text-white whitespace-nowrap overflow-hidden"
            >
              ui-fx-kit
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2">
        {Object.entries(grouped).map(([category, catItems]) => (
          <div key={category} className="mb-4">
            {/* Category header */}
            <div className="flex items-center h-7 px-4">
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${CATEGORY_COLORS[category] ?? "bg-gray-500"}`}
              />
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="ml-3 text-[10px] font-bold uppercase tracking-widest text-white/40 whitespace-nowrap"
                  >
                    {category}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Items */}
            {catItems.map((item) => {
              const isActive = item.id === activeId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className="w-full flex items-center h-8 px-4 text-left group"
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
                      isActive
                        ? "bg-indigo-400"
                        : "bg-white/20 group-hover:bg-white/50"
                    }`}
                  />
                  <AnimatePresence>
                    {expanded && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className={`ml-3 text-xs whitespace-nowrap transition-colors ${
                          isActive
                            ? "text-indigo-300 font-medium"
                            : "text-white/50 group-hover:text-white/80"
                        }`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </motion.nav>
  );
}
