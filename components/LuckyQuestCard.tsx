"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  MapPin,
  Zap,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Navigation,
  AlertCircle,
} from "lucide-react";
import confetti from "canvas-confetti";
import { requestLocation, getDistanceMeters } from "@/lib/geo";
import { findQuestTarget, type LuckyQuestData } from "@/lib/lucky-quest";

export type { LuckyQuestData };

type CardPhase = "idle" | "checking" | "too_far" | "error";

interface LuckyQuestCardProps {
  quest: LuckyQuestData;
  onComplete: (xp: number) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  demoMode?: boolean;
}

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 65,
    origin: { y: 0.65 },
    colors: ["#22c55e", "#16a34a", "#ca8a04", "#fbbf24", "#ffffff", "#86efac"],
  });
  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 60,
      spread: 50,
      origin: { x: 0, y: 0.6 },
      colors: ["#22c55e", "#ca8a04"],
    });
    confetti({
      particleCount: 40,
      angle: 120,
      spread: 50,
      origin: { x: 1, y: 0.6 },
      colors: ["#22c55e", "#ca8a04"],
    });
  }, 150);
}

export default function LuckyQuestCard({
  quest,
  onComplete,
  onRegenerate,
  isRegenerating,
  demoMode = false,
}: LuckyQuestCardProps) {
  const [phase, setPhase] = useState<CardPhase>("idle");
  const [distanceMsg, setDistanceMsg] = useState("");

  const handleComplete = async (bypass = false) => {
    if (quest.completed || phase === "checking") return;
    setPhase("checking");
    setDistanceMsg("");

    if (!bypass) {
      try {
        const loc = await requestLocation();
        const target = findQuestTarget(quest.locationHint);
        const dist = getDistanceMeters(loc.lat, loc.lng, target.lat, target.lng);

        if (dist > target.radius) {
          setDistanceMsg(
            `You're ${Math.round(dist)}m away. Get within ${target.radius}m of ${target.name}!`
          );
          setPhase("too_far");
          return;
        }
      } catch {
        setDistanceMsg("Could not read your location. Try demo mode!");
        setPhase("error");
        return;
      }
    }

    // Passed — complete the quest
    setPhase("idle");
    fireConfetti();
    await new Promise((r) => setTimeout(r, 350));
    onComplete(quest.rewardXP);
  };

  const reset = () => {
    setPhase("idle");
    setDistanceMsg("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", bounce: 0.3, duration: 0.65, delay: 0.1 }}
    >
      {/* Gradient border wrapper */}
      <motion.div
        className="p-[2px] rounded-2xl"
        animate={{
          boxShadow: quest.completed
            ? "0 0 20px rgba(34,197,94,0.25), 0 4px 24px rgba(0,0,0,0.5)"
            : [
                "0 0 16px rgba(34,197,94,0.18), 0 0 32px rgba(202,138,4,0.08), 0 4px 24px rgba(0,0,0,0.5)",
                "0 0 28px rgba(34,197,94,0.35), 0 0 56px rgba(202,138,4,0.18), 0 4px 24px rgba(0,0,0,0.5)",
                "0 0 16px rgba(34,197,94,0.18), 0 0 32px rgba(202,138,4,0.08), 0 4px 24px rgba(0,0,0,0.5)",
              ],
        }}
        transition={
          quest.completed
            ? { duration: 0.4 }
            : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
        }
        style={{
          background: quest.completed
            ? "linear-gradient(135deg, rgba(34,197,94,0.6), rgba(22,163,74,0.4))"
            : "linear-gradient(135deg, rgba(202,138,4,0.65), rgba(34,197,94,0.65))",
        }}
      >
        <div
          className="rounded-[14px] p-4"
          style={{
            background:
              "linear-gradient(160deg, #0f2b0f 0%, #0d1f0d 60%, #0a1a08 100%)",
          }}
        >
          {/* ── Header ───────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(202,138,4,0.18), rgba(234,179,8,0.12))",
                  border: "1px solid rgba(202,138,4,0.45)",
                  color: "#ca8a04",
                }}
              >
                🍀 Lucky Quest
              </span>
              <span
                className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.28)",
                  color: "#22c55e",
                }}
              >
                ✦ AI Generated
              </span>
            </div>

            {!quest.completed && (
              <button
                onClick={onRegenerate}
                disabled={isRegenerating || phase === "checking"}
                title="Generate a new quest"
                className="w-7 h-7 rounded-lg flex items-center justify-center
                  transition-all active:scale-90 disabled:opacity-40 hover:bg-stpat-green/20"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  border: "1px solid rgba(34,197,94,0.22)",
                }}
              >
                <RefreshCw
                  size={12}
                  className={`text-stpat-shamrock ${isRegenerating ? "animate-spin" : ""}`}
                />
              </button>
            )}
          </div>

          {/* ── Title + description ───────────────────────────────── */}
          <h3 className="text-base font-black text-stpat-cream mb-1 leading-snug">
            {quest.title}
          </h3>
          <p className="text-sm text-stpat-cream/60 leading-relaxed mb-4">
            {quest.description}
          </p>

          {/* ── Meta pills ───────────────────────────────────────── */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold"
              style={{
                background: "rgba(202,138,4,0.12)",
                border: "1px solid rgba(202,138,4,0.3)",
                color: "#ca8a04",
              }}
            >
              <Zap size={11} className="fill-stpat-gold text-stpat-gold" />
              +{quest.rewardXP} XP
            </div>
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "rgba(34,197,94,0.85)",
              }}
            >
              <MapPin size={11} />
              {quest.locationHint}
            </div>
          </div>

          {/* ── Action area (phase-driven) ────────────────────────── */}
          <AnimatePresence mode="wait">
            {/* Completed */}
            {quest.completed && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", bounce: 0.45 }}
                className="flex items-center justify-center gap-2 py-3.5 rounded-xl"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1.5px solid rgba(34,197,94,0.4)",
                }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", bounce: 0.6, delay: 0.1 }}
                >
                  <CheckCircle2 size={18} className="text-stpat-shamrock" />
                </motion.div>
                <span className="text-sm font-bold text-stpat-shamrock">
                  Completed · +{quest.rewardXP} XP earned
                </span>
              </motion.div>
            )}

            {/* Checking GPS */}
            {!quest.completed && phase === "checking" && (
              <motion.div
                key="checking"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2 py-4"
              >
                <Loader2 size={24} className="animate-spin text-stpat-shamrock" />
                <p className="text-sm text-stpat-green/60">
                  📍 Checking your location…
                </p>
              </motion.div>
            )}

            {/* Too far */}
            {!quest.completed && phase === "too_far" && (
              <motion.div
                key="too_far"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div
                  className="flex items-start gap-2 p-3 rounded-xl"
                  style={{
                    background: "rgba(202,138,4,0.08)",
                    border: "1px solid rgba(202,138,4,0.3)",
                  }}
                >
                  <Navigation size={14} className="text-stpat-gold mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-stpat-gold leading-relaxed">
                    {distanceMsg}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold
                      text-stpat-green/70 transition-all active:scale-95"
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    Try Again
                  </button>
                  {demoMode && (
                    <button
                      onClick={() => handleComplete(true)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold
                        text-stpat-gold transition-all active:scale-95"
                      style={{
                        background: "rgba(202,138,4,0.1)",
                        border: "1px solid rgba(202,138,4,0.3)",
                      }}
                    >
                      🎭 Demo Complete
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* GPS error */}
            {!quest.completed && phase === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div
                  className="flex items-start gap-2 p-3 rounded-xl"
                  style={{
                    background: "rgba(239,68,68,0.08)",
                    border: "1px solid rgba(239,68,68,0.25)",
                  }}
                >
                  <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-400 leading-relaxed">{distanceMsg}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={reset}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold
                      text-stpat-green/70 transition-all active:scale-95"
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    Try Again
                  </button>
                  {demoMode && (
                    <button
                      onClick={() => handleComplete(true)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold
                        text-stpat-gold transition-all active:scale-95"
                      style={{
                        background: "rgba(202,138,4,0.1)",
                        border: "1px solid rgba(202,138,4,0.3)",
                      }}
                    >
                      🎭 Demo Complete
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Idle CTA */}
            {!quest.completed && phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <motion.button
                  onClick={() => handleComplete(false)}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center
                    justify-center gap-2 text-white"
                  style={{
                    background: "linear-gradient(135deg, #15803d, #22c55e)",
                    boxShadow: "0 4px 20px rgba(34,197,94,0.35)",
                  }}
                >
                  <MapPin size={15} />
                  I&apos;m Here! Complete Quest
                </motion.button>

                {demoMode && (
                  <button
                    onClick={() => handleComplete(true)}
                    className="w-full py-2 rounded-xl text-xs font-bold
                      text-stpat-gold/70 hover:text-stpat-gold transition-all"
                    style={{
                      background: "rgba(202,138,4,0.05)",
                      border: "1px solid rgba(202,138,4,0.15)",
                    }}
                  >
                    🎭 Demo: Simulate Visit
                  </button>
                )}

                <p className="text-center text-[10px] text-stpat-green/35 flex items-center justify-center gap-1">
                  <Navigation size={9} />
                  Visit {quest.locationHint} to complete
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
