"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

export default function QuestsPage() {
  const [state, setState] = useState<GameState>(() => loadGameState());
  const [distances, setDistances] = useState<Record<string, string>>({});
  const { spots, loading, refreshing, error, refresh } = useLandmarks();
  const effectiveState =
    spots.length > 0 ? reconcileGameStateWithSpots(state, spots) : state;

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

  return (
    <div className="min-h-screen bg-[#0a1a0a] pb-24">
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
              {refreshing ? "Refreshing..." : "Refresh Landmarks"}
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

      <BottomNav />
    </div>
  );
}
