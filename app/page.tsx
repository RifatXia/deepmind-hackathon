"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  loadGameState,
  reconcileGameStateWithSpots,
  saveGameState,
  type GameState,
} from "@/lib/game-state";
import { getTierForPoints } from "@/lib/badges";
import { useLandmarks } from "@/lib/use-landmarks";
import XPBar from "@/components/XPBar";
import BottomNav from "@/components/BottomNav";
import ShamrockRain from "@/components/ShamrockRain";
import DemoToggle from "@/components/DemoToggle";
import LuckyQuestModal from "@/components/LuckyQuestModal";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a1a0a] flex items-center justify-center">
      <div className="text-center space-y-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="text-5xl"
        >
          🗺️
        </motion.div>
        <p className="text-stpat-green/40 text-sm font-medium">
          Loading Chicago…
        </p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [state, setState] = useState<GameState>(() => loadGameState());
  const [showLuckyModal, setShowLuckyModal] = useState(false);
  const { spots, loading, refreshing, error, refresh } = useLandmarks();
  const effectiveState =
    spots.length > 0 ? reconcileGameStateWithSpots(state, spots) : state;

  useEffect(() => {
    if (effectiveState !== state) {
      saveGameState(effectiveState);
    }
  }, [effectiveState, state]);

  const tier = getTierForPoints(effectiveState.points);
  const spotsCollected = effectiveState.unlockedSpots.length;

  const toggleDemoMode = () => {
    const newState = {
      ...effectiveState,
      demoMode: !effectiveState.demoMode,
    };
    setState(newState);
    saveGameState(newState);
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#0a1a0a]">
      <ShamrockRain />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex-shrink-0 px-4 pt-3 pb-2"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍀</span>
            <div>
              <h1 className="text-base font-black text-stpat-cream leading-tight tracking-tight">
                ChiQuest
              </h1>
              <p className="text-[9px] text-stpat-green/45 leading-tight">
                St. Patrick&apos;s Day Edition
              </p>
            </div>
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
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-[#0f2b0f]/85 backdrop-blur border border-stpat-green/20 px-4 py-3"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
        >
          <XPBar points={effectiveState.points} />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stpat-green/10">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{tier.emoji}</span>
              <span className="text-xs font-bold text-stpat-cream">
                {tier.name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stpat-green/60">
              <span className="font-bold text-stpat-shamrock">
                {spotsCollected}
              </span>
              <span>of {spots.length} collected</span>
            </div>
          </div>
        </motion.div>
        {error && (
          <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
            {error}
          </div>
        )}
      </motion.header>

      {/* Map */}
      <div className="flex-1 relative z-[1] min-h-[300px]">
        {loading && spots.length === 0 ? (
          <div className="w-full h-full bg-[#0a1a0a] flex items-center justify-center">
            <div className="animate-pulse text-stpat-green/40">Loading landmarks...</div>
          </div>
        ) : spots.length === 0 ? (
          <div className="w-full h-full bg-[#0a1a0a] flex items-center justify-center px-6 text-center">
            <div>
              <p className="text-stpat-cream text-sm">No landmarks available right now.</p>
              <button
                onClick={() => {
                  void refresh();
                }}
                className="mt-3 h-9 px-3 rounded-lg border border-stpat-green/30 text-xs font-bold text-stpat-green"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <MapView spots={spots} unlockedSpots={effectiveState.unlockedSpots} />
        )}
      </div>

      <div className="h-16 flex-shrink-0" />

      <BottomNav />

      <LuckyQuestModal
        open={showLuckyModal}
        onClose={() => setShowLuckyModal(false)}
        demoMode={state.demoMode}
        onXPEarned={(xp) => {
          setState((prev) =>
            prev ? { ...prev, points: prev.points + xp } : prev
          );
        }}
      />
    </div>
  );
}
