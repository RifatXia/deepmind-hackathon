"use client";

import { motion } from "framer-motion";

interface DemoToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export default function DemoToggle({ enabled, onToggle }: DemoToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
        enabled
          ? "bg-stpat-gold/20 text-stpat-gold border border-stpat-gold/40"
          : "bg-[#1a3a1a] text-stpat-green/40 border border-stpat-green/10 hover:border-stpat-green/30"
      }`}
    >
      <motion.span
        animate={{ rotate: enabled ? 360 : 0 }}
        transition={{ duration: 0.5 }}
      >
        🎭
      </motion.span>
      Demo {enabled ? "ON" : "OFF"}
    </button>
  );
}
