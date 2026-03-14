"use client";

import { motion } from "framer-motion";
import { getTierForPoints, getNextTier, getProgressToNextTier } from "@/lib/badges";

interface XPBarProps {
  points: number;
  compact?: boolean;
}

export default function XPBar({ points, compact = false }: XPBarProps) {
  const tier = getTierForPoints(points);
  const next = getNextTier(points);
  const progress = getProgressToNextTier(points);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{tier.emoji}</span>
        <div className="flex-1 h-2 bg-[#1a3a1a] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-stpat-green to-stpat-shamrock"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <span className="text-xs text-stpat-gold font-bold">{points} XP</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{tier.emoji}</span>
          <div>
            <p className="text-sm font-bold text-stpat-shamrock">{tier.name}</p>
            {next && (
              <p className="text-[10px] text-stpat-green/60">
                {next.min - points} XP to {next.name} {next.emoji}
              </p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-stpat-gold">{points}</p>
          <p className="text-[10px] text-stpat-green/60 uppercase tracking-wider">
            Total XP
          </p>
        </div>
      </div>
      <div className="h-3 bg-[#1a3a1a] rounded-full overflow-hidden border border-stpat-green/20">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-stpat-green via-stpat-shamrock to-stpat-gold"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
