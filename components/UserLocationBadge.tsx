"use client";

import { motion } from "framer-motion";
import { MapPin, Loader2, MapPinOff } from "lucide-react";

export type LocationStatus = "locating" | "found" | "unavailable";

interface UserLocationBadgeProps {
  status: LocationStatus;
}

const CONFIG = {
  locating: {
    icon: Loader2,
    spin: true,
    text: "Locating you…",
    className: "text-stpat-gold border-stpat-gold/30 bg-stpat-gold/10",
  },
  found: {
    icon: MapPin,
    spin: false,
    text: "Location found",
    className: "text-stpat-shamrock border-stpat-shamrock/30 bg-stpat-shamrock/10",
  },
  unavailable: {
    icon: MapPinOff,
    spin: false,
    text: "Location unavailable",
    className: "text-gray-400 border-gray-600/30 bg-gray-800/40",
  },
};

export default function UserLocationBadge({ status }: UserLocationBadgeProps) {
  const { icon: Icon, spin, text, className } = CONFIG[status];

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold
        px-2.5 py-1 rounded-full border backdrop-blur-sm ${className}`}
    >
      <Icon size={10} className={spin ? "animate-spin" : ""} />
      {text}
    </motion.div>
  );
}
