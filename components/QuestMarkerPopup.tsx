"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Navigation2, Lock, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Spot } from "@/lib/spots";
import { metersToMiles } from "@/lib/geo";

interface QuestMarkerPopupProps {
  spot: Spot | null;
  distanceMeters?: number;
  unlocked: boolean;
  onClose: () => void;
}

const TIER_STYLES: Record<string, string> = {
  gold: "bg-stpat-gold/10 border-stpat-gold/30 text-stpat-gold",
  silver: "bg-gray-500/10 border-gray-500/30 text-gray-400",
  bronze: "bg-amber-700/10 border-amber-700/30 text-amber-600",
};

export default function QuestMarkerPopup({
  spot,
  distanceMeters,
  unlocked,
  onClose,
}: QuestMarkerPopupProps) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {spot && (
        <>
          {/* Tap-outside backdrop */}
          <motion.div
            key="popup-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[59]"
            onClick={onClose}
          />

          {/* Bottom sheet card */}
          <motion.div
            key="popup-card"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 z-[60] rounded-t-3xl"
            style={{
              background: "linear-gradient(180deg, #0f2b0f 0%, #0a1a0a 100%)",
              borderTop: "1.5px solid rgba(34,197,94,0.25)",
              boxShadow: "0 -12px 48px rgba(0,0,0,0.7), 0 -4px 24px rgba(34,197,94,0.08)",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-stpat-green/20" />
            </div>

            <div className="px-5 pb-8 pt-2">
              {/* Header row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Emoji */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-all"
                    style={
                      unlocked
                        ? {
                            background: "rgba(22,163,74,0.18)",
                            border: "2px solid rgba(34,197,94,0.5)",
                            boxShadow: "0 0 20px rgba(34,197,94,0.3)",
                          }
                        : {
                            background: "rgba(30,30,30,0.7)",
                            border: "2px solid rgba(80,80,80,0.4)",
                            filter: "grayscale(0.3)",
                          }
                    }
                  >
                    {spot.emoji}
                  </div>

                  {/* Name + status */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      {unlocked ? (
                        <span className="text-[9px] font-bold text-stpat-shamrock uppercase tracking-wider">
                          ✅ Visited
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-stpat-gold uppercase tracking-wider flex items-center gap-1">
                          <Lock size={8} /> Quest Available
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-black text-stpat-cream leading-tight">
                      {spot.name}
                    </h3>
                  </div>
                </div>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#1a3a1a]/80 flex items-center justify-center
                    text-stpat-green/50 hover:text-stpat-cream transition-colors flex-shrink-0"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Description */}
              <p className="text-sm text-stpat-cream/60 leading-relaxed mb-4">
                {spot.description}
              </p>

              {/* Pills row */}
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 bg-stpat-gold/10 border border-stpat-gold/25 rounded-xl px-3 py-1.5">
                  <Star size={11} className="text-stpat-gold fill-stpat-gold" />
                  <span className="text-sm font-bold text-stpat-gold">
                    +{spot.points} XP
                  </span>
                </div>

                {distanceMeters !== undefined && (
                  <div className="flex items-center gap-1.5 bg-stpat-green/10 border border-stpat-green/20 rounded-xl px-3 py-1.5">
                    <Navigation2 size={11} className="text-stpat-shamrock" />
                    <span className="text-sm text-stpat-cream/80">
                      {metersToMiles(distanceMeters)}
                    </span>
                  </div>
                )}

                <div
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 border capitalize text-xs ${
                    TIER_STYLES[spot.tier] ?? TIER_STYLES.bronze
                  }`}
                >
                  {spot.tier}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => router.push(`/spot/${spot.id}`)}
                className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2
                  transition-all active:scale-[0.98] ${
                    unlocked
                      ? "bg-stpat-green/15 border border-stpat-shamrock/35 text-stpat-shamrock hover:bg-stpat-green/25"
                      : "bg-gradient-to-r from-stpat-green to-stpat-shamrock text-white"
                  }`}
                style={
                  !unlocked
                    ? {
                        boxShadow:
                          "0 4px 24px rgba(34,197,94,0.3), 0 2px 8px rgba(0,0,0,0.4)",
                      }
                    : {}
                }
              >
                {unlocked ? (
                  <>🎨 View Postcard</>
                ) : (
                  <>
                    🗺️ View Quest <ExternalLink size={14} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
