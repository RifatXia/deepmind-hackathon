"use client";

import { motion } from "framer-motion";

export default function MapLegend() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.4 }}
      className="flex items-center gap-3 bg-[#0a1a0a]/85 backdrop-blur-md
        border border-stpat-green/20 rounded-2xl px-3 py-2 shadow-lg"
    >
      {/* Unlocked */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{
            background: "rgba(22,163,74,0.3)",
            border: "2px solid #22c55e",
            boxShadow: "0 0 6px rgba(34,197,94,0.5)",
          }}
        />
        <span className="text-[9px] font-medium text-stpat-cream/70">Unlocked</span>
      </div>

      <div className="w-px h-3 bg-stpat-green/20 flex-shrink-0" />

      {/* Locked */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0 opacity-40"
          style={{
            background: "rgba(40,40,40,0.8)",
            border: "2px solid #555",
          }}
        />
        <span className="text-[9px] font-medium text-stpat-cream/70">Locked</span>
      </div>

      <div className="w-px h-3 bg-stpat-green/20 flex-shrink-0" />

      {/* You */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{
            background: "#3b82f6",
            border: "2.5px solid white",
            boxShadow: "0 0 8px rgba(59,130,246,0.6)",
          }}
        />
        <span className="text-[9px] font-medium text-stpat-cream/70">You</span>
      </div>
    </motion.div>
  );
}
