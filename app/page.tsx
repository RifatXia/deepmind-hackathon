"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { SPOTS } from "@/lib/spots";
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state";
import { getTierForPoints } from "@/lib/badges";
import XPBar from "@/components/XPBar";
import BottomNav from "@/components/BottomNav";
import ShamrockRain from "@/components/ShamrockRain";
import DemoToggle from "@/components/DemoToggle";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a1a0a] flex items-center justify-center">
      <div className="animate-pulse text-stpat-green/40">Loading map...</div>
    </div>
  ),
});

export default function HomePage() {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    setState(loadGameState());
  }, []);

  if (!state) {
    return (
      <div className="min-h-screen bg-[#0a1a0a] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🍀</div>
          <h1 className="text-2xl font-black text-stpat-shamrock">ChiQuest</h1>
          <p className="text-xs text-stpat-green/40 mt-1">Loading...</p>
        </motion.div>
      </div>
    );
  }

  const tier = getTierForPoints(state.points);
  const spotsCollected = state.unlockedSpots.length;

  const toggleDemoMode = () => {
    const newState = { ...state, demoMode: !state.demoMode };
    setState(newState);
    saveGameState(newState);
  };

  return (
    <div className="min-h-screen bg-[#0a1a0a] flex flex-col">
      <ShamrockRain />

      {/* Header */}
      <header className="relative z-10 px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍀</span>
            <div>
              <h1 className="text-lg font-black text-stpat-cream leading-tight">
                ChiQuest
              </h1>
              <p className="text-[10px] text-stpat-green/50">
                St. Patrick&apos;s Day Edition
              </p>
            </div>
          </div>
          <DemoToggle enabled={state.demoMode} onToggle={toggleDemoMode} />
        </div>

        <motion.div
          className="rounded-2xl bg-[#0f2b0f]/80 backdrop-blur border border-stpat-green/20 p-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <XPBar points={state.points} />
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
              <span>of {SPOTS.length} collected</span>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Map */}
      <div className="flex-1 relative z-[1] min-h-[300px]">
        <MapView unlockedSpots={state.unlockedSpots} />
      </div>

      <BottomNav />
    </div>
  );
}
