"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import {
  loadGameState,
  reconcileGameStateWithSpots,
  saveGameState,
  type GameState,
} from "@/lib/game-state";
import { requestLocation, getDistanceMeters, metersToMiles } from "@/lib/geo";
import { useLandmarks } from "@/lib/use-landmarks";
import SpotCard from "@/components/SpotCard";
import XPBar from "@/components/XPBar";
import BottomNav from "@/components/BottomNav";
import ShamrockRain from "@/components/ShamrockRain";
import DemoToggle from "@/components/DemoToggle";
import LuckyQuestCard from "@/components/LuckyQuestCard";
import {
  loadLuckyQuest,
  saveLuckyQuest,
  type LuckyQuestData,
} from "@/lib/lucky-quest";

export default function QuestsPage() {
  const [state, setState] = useState<GameState>(() => loadGameState());
  const [distances, setDistances] = useState<Record<string, string>>({});
  const [luckyQuest, setLuckyQuest] = useState<LuckyQuestData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(false);

  const { spots, loading, refreshing, error, refresh } = useLandmarks();
  const effectiveState =
    spots.length > 0 ? reconcileGameStateWithSpots(state, spots) : state;

  useEffect(() => {
    setLuckyQuest(loadLuckyQuest());
  }, []);

  useEffect(() => {
    if (spots.length === 0) return;
    requestLocation()
      .then((loc) => {
        const dists: Record<string, string> = {};
        for (const spot of spots) {
          const meters = getDistanceMeters(loc.lat, loc.lng, spot.lat, spot.lng);
          dists[spot.id] = metersToMiles(meters);
        }
        setDistances(dists);
      })
      .catch(() => {
        // No location access
      });
  }, [spots]);

  useEffect(() => {
    if (effectiveState !== state) {
      saveGameState(effectiveState);
    }
  }, [effectiveState, state]);

  const toggleDemoMode = () => {
    const newState = {
      ...effectiveState,
      demoMode: !effectiveState.demoMode,
    };
    setState(newState);
    saveGameState(newState);
  };

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setGenerateError(false);

    try {
      const res = await fetch("/api/generate-lucky-quest");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Omit<LuckyQuestData, "completed">;

      const quest: LuckyQuestData = { ...data, completed: false };
      setLuckyQuest(quest);
      saveLuckyQuest(quest);
    } catch (err) {
      console.error("Lucky Quest error:", err);
      setGenerateError(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = (xp: number) => {
    if (!luckyQuest) return;

    const newGameState = { ...effectiveState, points: effectiveState.points + xp };
    setState(newGameState);
    saveGameState(newGameState);

    const completedQuest: LuckyQuestData = { ...luckyQuest, completed: true };
    setLuckyQuest(completedQuest);
    saveLuckyQuest(completedQuest);
  };

  const handleRegenerate = () => {
    setLuckyQuest(null);
    handleGenerate();
  };

  return (
    <div className="min-h-screen bg-[#0a1a0a] pb-28">
      <ShamrockRain />

      <header className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-black text-stpat-cream">
              🗺️ Chicago Quests
            </h1>
            <p className="text-xs text-stpat-green/50">
              Visit landmarks to unlock AI postcards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                void refresh();
              }}
              disabled={refreshing}
              className="h-8 px-2.5 rounded-lg border border-stpat-green/30 text-[10px] font-bold text-stpat-green/80 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <DemoToggle
              enabled={effectiveState.demoMode}
              onToggle={toggleDemoMode}
            />
          </div>
        </div>

        <motion.div
          className="rounded-xl bg-[#0f2b0f]/80 backdrop-blur border border-stpat-green/20 p-3"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <XPBar points={effectiveState.points} compact />
        </motion.div>
      </header>

      {/* Generate Lucky Quest button */}
      <div className="relative z-10 px-4 mt-4">
        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={handleGenerate}
          disabled={generating}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl
            font-bold text-sm transition-opacity disabled:opacity-60"
          style={{
            background: "linear-gradient(135deg, #15803d 0%, #22c55e 60%, #16a34a 100%)",
            boxShadow:
              "0 4px 24px rgba(34,197,94,0.35), 0 0 0 1px rgba(34,197,94,0.2)",
          }}
        >
          {generating ? (
            <>
              <Loader2 size={16} className="animate-spin text-white" />
              <span className="text-white">Generating quest…</span>
            </>
          ) : (
            <>
              <motion.span
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="text-lg leading-none"
              >
                🍀
              </motion.span>
              <span className="text-white">Generate Lucky Quest</span>
              <Sparkles size={14} className="text-white/80" />
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {generateError && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-red-400/80 mt-2"
            >
              Something went wrong. Try again?
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Quest list */}
      <div className="relative z-10 px-4 mt-4 space-y-3">
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}
        {loading && spots.length === 0 ? (
          <div className="rounded-xl bg-[#0f2b0f] border border-stpat-green/20 p-4 text-sm text-stpat-green/60">
            Loading Chicago landmarks...
          </div>
        ) : spots.length === 0 ? (
          <div className="rounded-xl bg-[#0f2b0f] border border-stpat-green/20 p-4">
            <p className="text-sm text-stpat-cream">No landmarks available right now.</p>
            <button
              onClick={() => {
                void refresh();
              }}
              className="mt-3 h-9 px-3 rounded-lg border border-stpat-green/30 text-xs font-bold text-stpat-green"
            >
              Retry
            </button>
          </div>
        ) : (
          spots.map((spot, i) => (
            <SpotCard
              key={spot.id}
              id={spot.id}
              name={spot.name}
              emoji={spot.emoji}
              description={spot.description}
              points={spot.points}
              tier={spot.tier}
              unlocked={effectiveState.unlockedSpots.includes(spot.id)}
              distance={distances[spot.id]}
              index={i}
            />
          ))
        )}
      </div>

      {/* Lucky Quest card */}
      <AnimatePresence>
        {luckyQuest && (
          <motion.div
            key="lucky-quest-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 px-4 mt-4"
          >
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex items-center gap-2 mb-3"
            >
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, rgba(202,138,4,0.4), transparent)",
                }}
              />
              <span className="text-[10px] font-bold text-stpat-gold/70 uppercase tracking-widest">
                ✦ AI Mission ✦
              </span>
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(270deg, rgba(202,138,4,0.4), transparent)",
                }}
              />
            </motion.div>

            <LuckyQuestCard
              quest={luckyQuest}
              onComplete={handleComplete}
              onRegenerate={handleRegenerate}
              isRegenerating={generating}
              demoMode={effectiveState.demoMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
