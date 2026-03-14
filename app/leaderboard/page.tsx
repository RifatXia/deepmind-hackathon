"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { loadGameState, type GameState } from "@/lib/game-state";
import { getTierForPoints } from "@/lib/badges";
import BottomNav from "@/components/BottomNav";
import ShamrockRain from "@/components/ShamrockRain";

const MOCK_PLAYERS = [
  { name: "ShamrockSally", points: 1300, spots: 6 },
  { name: "WindyCityWes", points: 1100, spots: 5 },
  { name: "LakefrontLisa", points: 900, spots: 4 },
  { name: "DeepDishDan", points: 750, spots: 4 },
  { name: "ChiTownChris", points: 650, spots: 3 },
  { name: "BeanBoyBen", points: 500, spots: 3 },
  { name: "RiverRunRay", points: 400, spots: 2 },
  { name: "NavyNina", points: 350, spots: 2 },
  { name: "WrigleyWilma", points: 200, spots: 1 },
];

const RANK_BADGES = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    setState(loadGameState());
  }, []);

  if (!state) return null;

  // Insert current user into mock leaderboard
  const currentUser = {
    name: state.playerName || "You",
    points: state.points,
    spots: state.unlockedSpots.length,
    isUser: true,
  };

  const allPlayers = [
    ...MOCK_PLAYERS.map((p) => ({ ...p, isUser: false })),
    currentUser,
  ]
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-[#0a1a0a] pb-24">
      <ShamrockRain />

      <header className="relative z-10 px-4 pt-4 pb-4">
        <h1 className="text-xl font-black text-stpat-cream mb-1">
          🏆 Leaderboard
        </h1>
        <p className="text-xs text-stpat-green/50">
          Top explorers in Chicago
        </p>
      </header>

      <div className="relative z-10 px-4 space-y-2">
        {allPlayers.map((player, i) => {
          const tier = getTierForPoints(player.points);
          return (
            <motion.div
              key={player.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`rounded-2xl border-2 p-3 flex items-center gap-3 ${
                player.isUser
                  ? "border-stpat-shamrock/60 bg-stpat-green/10"
                  : "border-stpat-green/10 bg-[#0f2b0f]"
              }`}
            >
              {/* Rank */}
              <div className="w-8 text-center shrink-0">
                {i < 3 ? (
                  <span className="text-2xl">{RANK_BADGES[i]}</span>
                ) : (
                  <span className="text-sm font-bold text-stpat-green/40">
                    #{i + 1}
                  </span>
                )}
              </div>

              {/* Player info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{tier.emoji}</span>
                  <span
                    className={`text-sm font-bold truncate ${
                      player.isUser ? "text-stpat-shamrock" : "text-stpat-cream"
                    }`}
                  >
                    {player.name}
                    {player.isUser && " (You)"}
                  </span>
                </div>
                <p className="text-[10px] text-stpat-green/40">
                  {player.spots} spots collected · {tier.name}
                </p>
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <p className="text-sm font-black text-stpat-gold">
                  {player.points}
                </p>
                <p className="text-[10px] text-stpat-green/40">XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
