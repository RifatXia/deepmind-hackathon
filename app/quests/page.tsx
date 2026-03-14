"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SPOTS } from "@/lib/spots";
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state";
import { requestLocation, getDistanceMeters, metersToMiles } from "@/lib/geo";
import SpotCard from "@/components/SpotCard";
import XPBar from "@/components/XPBar";
import BottomNav from "@/components/BottomNav";
import ShamrockRain from "@/components/ShamrockRain";
import DemoToggle from "@/components/DemoToggle";

export default function QuestsPage() {
  const [state, setState] = useState<GameState | null>(null);
  const [distances, setDistances] = useState<Record<string, string>>({});

  useEffect(() => {
    setState(loadGameState());

    // Get user location for distances
    requestLocation()
      .then((loc) => {
        const dists: Record<string, string> = {};
        for (const spot of SPOTS) {
          const meters = getDistanceMeters(loc.lat, loc.lng, spot.lat, spot.lng);
          dists[spot.id] = metersToMiles(meters);
        }
        setDistances(dists);
      })
      .catch(() => {
        // No location access
      });
  }, []);

  if (!state) return null;

  const toggleDemoMode = () => {
    const newState = { ...state, demoMode: !state.demoMode };
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
          <DemoToggle enabled={state.demoMode} onToggle={toggleDemoMode} />
        </div>

        <motion.div
          className="rounded-xl bg-[#0f2b0f]/80 backdrop-blur border border-stpat-green/20 p-3"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <XPBar points={state.points} compact />
        </motion.div>
      </header>

      <div className="relative z-10 px-4 mt-4 space-y-3">
        {SPOTS.map((spot, i) => (
          <SpotCard
            key={spot.id}
            id={spot.id}
            name={spot.name}
            emoji={spot.emoji}
            description={spot.description}
            points={spot.points}
            tier={spot.tier}
            unlocked={state.unlockedSpots.includes(spot.id)}
            distance={distances[spot.id]}
            index={i}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
