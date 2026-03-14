"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Loader2 } from "lucide-react";
import {
  loadLuckyQuest,
  saveLuckyQuest,
  type LuckyQuestData,
} from "@/lib/lucky-quest";
import { loadGameState, saveGameState } from "@/lib/game-state";
import LuckyQuestCard from "@/components/LuckyQuestCard";

interface LuckyQuestModalProps {
  open: boolean;
  onClose: () => void;
  demoMode?: boolean;
  onXPEarned?: (xp: number) => void;
}

type ModalState = "empty" | "generating" | "quest";

export default function LuckyQuestModal({
  open,
  onClose,
  demoMode = false,
  onXPEarned,
}: LuckyQuestModalProps) {
  const [quest, setQuest] = useState<LuckyQuestData | null>(null);
  const [modalState, setModalState] = useState<ModalState>("empty");
  const [generateError, setGenerateError] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load quest from localStorage when modal opens
  useEffect(() => {
    if (!open) return;
    const saved = loadLuckyQuest();
    if (saved) {
      setQuest(saved);
      setModalState("quest");
    } else {
      setModalState("empty");
    }
    setGenerateError(false);
  }, [open]);

  const handleGenerate = async () => {
    setModalState("generating");
    setGenerateError(false);

    try {
      const res = await fetch("/api/generate-lucky-quest");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Omit<LuckyQuestData, "completed">;

      const newQuest: LuckyQuestData = { ...data, completed: false };
      setQuest(newQuest);
      saveLuckyQuest(newQuest);
      setModalState("quest");
    } catch (err) {
      console.error("Lucky Quest error:", err);
      setGenerateError(true);
      setModalState("empty");
    }
  };

  const handleRegenerate = () => {
    setQuest(null);
    setIsRegenerating(true);
    handleGenerate().finally(() => setIsRegenerating(false));
  };

  const handleComplete = (xp: number) => {
    if (!quest) return;

    // Award XP to game state
    const gs = loadGameState();
    const updated = { ...gs, points: gs.points + xp };
    saveGameState(updated);
    onXPEarned?.(xp);

    // Mark quest completed
    const completedQuest: LuckyQuestData = { ...quest, completed: true };
    setQuest(completedQuest);
    saveLuckyQuest(completedQuest);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="lqm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="lqm-sheet"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", bounce: 0.22, duration: 0.5 }}
            className="fixed bottom-0 left-0 right-0 z-[101] rounded-t-3xl"
            style={{
              background: "linear-gradient(180deg, #0f2b0f 0%, #0a1a0a 100%)",
              borderTop: "1.5px solid rgba(202,138,4,0.35)",
              boxShadow: "0 -12px 48px rgba(0,0,0,0.7), 0 -4px 24px rgba(202,138,4,0.08)",
              maxHeight: "88vh",
              overflowY: "auto",
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-stpat-green/20" />
            </div>

            <div className="px-5 pb-10 pt-2">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <motion.span
                    animate={{ rotate: [0, -12, 12, -8, 8, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 3.5,
                      ease: "easeInOut",
                    }}
                    className="text-2xl leading-none"
                  >
                    🍀
                  </motion.span>
                  <div>
                    <h2 className="text-lg font-black text-stpat-gold leading-none">
                      Lucky Quest
                    </h2>
                    <p className="text-[10px] text-stpat-green/50 mt-0.5">
                      Powered by Google Vertex AI
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-[#1a3a1a]/80 flex items-center
                    justify-center text-stpat-green/50 hover:text-stpat-cream transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {/* ── Content area ─────────────────────────────────────── */}
              <AnimatePresence mode="wait">

                {/* Empty state — no quest yet */}
                {modalState === "empty" && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-center py-4"
                  >
                    <p className="text-sm text-stpat-cream/60 mb-6 leading-relaxed">
                      Let AI craft a unique Chicago St.&nbsp;Patrick&apos;s Day
                      micro-quest just for you.
                    </p>

                    {generateError && (
                      <p className="text-xs text-red-400/80 mb-3">
                        Something went wrong — try again?
                      </p>
                    )}

                    <button
                      onClick={handleGenerate}
                      className="w-full flex items-center justify-center gap-2.5
                        py-4 rounded-2xl font-bold text-sm text-white"
                      style={{
                        background:
                          "linear-gradient(135deg, #15803d 0%, #22c55e 60%, #16a34a 100%)",
                        boxShadow:
                          "0 4px 24px rgba(34,197,94,0.35), 0 0 0 1px rgba(34,197,94,0.2)",
                      }}
                    >
                      <motion.span
                        animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 3.5,
                          ease: "easeInOut",
                        }}
                        className="text-lg leading-none"
                      >
                        🍀
                      </motion.span>
                      Generate Lucky Quest
                      <Sparkles size={14} className="text-white/80" />
                    </button>
                  </motion.div>
                )}

                {/* Generating — spinner */}
                {modalState === "generating" && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-3 py-10"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 2,
                        ease: "linear",
                      }}
                      className="text-4xl leading-none"
                    >
                      🍀
                    </motion.div>
                    <Loader2
                      size={20}
                      className="animate-spin text-stpat-shamrock"
                    />
                    <p className="text-sm font-bold text-stpat-shamrock">
                      Generating your quest…
                    </p>
                    <p className="text-xs text-stpat-green/40">
                      Powered by Gemini 2.0 Flash
                    </p>
                  </motion.div>
                )}

                {/* Quest ready */}
                {modalState === "quest" && quest && (
                  <motion.div
                    key="quest"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <LuckyQuestCard
                      quest={quest}
                      onComplete={handleComplete}
                      onRegenerate={handleRegenerate}
                      isRegenerating={isRegenerating}
                      demoMode={demoMode}
                    />
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
