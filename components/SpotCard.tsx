"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, MapPin, ChevronRight } from "lucide-react";

interface SpotCardProps {
  id: string;
  name: string;
  emoji: string;
  description: string;
  points: number;
  tier: "bronze" | "silver" | "gold";
  unlocked: boolean;
  distance?: string;
  index: number;
}

const TIER_STYLES = {
  bronze: "border-[#cd7f32]/40 bg-[#cd7f32]/5",
  silver: "border-[#c0c0c0]/40 bg-[#c0c0c0]/5",
  gold: "border-[#ffd700]/40 bg-[#ffd700]/5",
};

const TIER_BADGE_STYLES = {
  bronze: "bg-[#cd7f32]/20 text-[#cd7f32]",
  silver: "bg-[#c0c0c0]/20 text-[#c0c0c0]",
  gold: "bg-[#ffd700]/20 text-[#ffd700]",
};

export default function SpotCard({
  id,
  name,
  emoji,
  description,
  points,
  tier,
  unlocked,
  distance,
  index,
}: SpotCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link href={`/spot/${id}`}>
        <div
          className={`relative rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
            unlocked
              ? "border-stpat-shamrock/60 bg-stpat-green/10 glow-green"
              : TIER_STYLES[tier]
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Emoji / Lock */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                unlocked
                  ? "bg-stpat-green/20"
                  : "bg-[#1a2e1a] grayscale opacity-60"
              }`}
            >
              {unlocked ? emoji : <Lock size={20} className="text-stpat-green/40" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3
                  className={`font-bold text-sm truncate ${
                    unlocked ? "text-stpat-cream" : "text-stpat-green/50"
                  }`}
                >
                  {name}
                </h3>
                {unlocked && (
                  <span className="text-stpat-shamrock text-xs">✓</span>
                )}
              </div>
              <p
                className={`text-xs line-clamp-1 ${
                  unlocked ? "text-stpat-green/70" : "text-stpat-green/40"
                }`}
              >
                {description}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TIER_BADGE_STYLES[tier]}`}
                >
                  {tier.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-stpat-gold">
                  +{points} XP
                </span>
                {distance && (
                  <span className="text-[10px] text-stpat-green/50 flex items-center gap-0.5">
                    <MapPin size={10} /> {distance}
                  </span>
                )}
              </div>
            </div>

            {/* Arrow */}
            <ChevronRight
              size={16}
              className="text-stpat-green/30 mt-3 shrink-0"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
