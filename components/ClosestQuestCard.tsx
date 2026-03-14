"use client";

import { motion } from "framer-motion";
import { Navigation2, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Spot } from "@/lib/spots";
import { metersToMiles } from "@/lib/geo";

interface ClosestQuestCardProps {
  spot: Spot;
  distanceMeters: number;
  unlocked: boolean;
  onCardClick: () => void;
}

export default function ClosestQuestCard({
  spot,
  distanceMeters,
  unlocked,
  onCardClick,
}: ClosestQuestCardProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: -16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35, type: "spring", bounce: 0.3, duration: 0.6 }}
      className="absolute top-3 left-3 right-3 cursor-pointer"
      onClick={onCardClick}
    >
      <div
        className="bg-[#0f2b0f]/92 backdrop-blur-lg rounded-2xl p-3 flex items-center gap-3"
        style={{
          border: "1px solid rgba(202,138,4,0.45)",
          boxShadow:
            "0 0 24px rgba(202,138,4,0.12), 0 4px 24px rgba(0,0,0,0.65)",
        }}
      >
        {/* Emoji icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: "rgba(202,138,4,0.1)",
            border: "1.5px solid rgba(202,138,4,0.35)",
          }}
        >
          {spot.emoji}
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="text-[9px] font-bold text-stpat-gold uppercase tracking-wider">
              ⭐ Closest Quest
            </span>
            {unlocked && (
              <span className="text-[8px] font-bold text-stpat-shamrock bg-stpat-shamrock/10 rounded px-1">
                ✓ Done
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-stpat-cream leading-tight truncate">
            {spot.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-stpat-green/70 flex items-center gap-0.5">
              <Navigation2 size={9} />
              {metersToMiles(distanceMeters)}
            </span>
            <span className="text-[10px] font-bold text-stpat-gold">
              +{spot.points} XP
            </span>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/spot/${spot.id}`);
          }}
          className="flex-shrink-0 flex items-center gap-0.5 px-3 py-1.5 rounded-xl
            text-[11px] font-bold bg-stpat-gold text-black
            hover:bg-stpat-gold/90 active:scale-95 transition-all"
        >
          Go <ChevronRight size={11} />
        </button>
      </div>
    </motion.div>
  );
}
