"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state";
import RewardCard from "@/components/RewardCard";
import XPBar from "@/components/XPBar";
import BottomNav from "@/components/BottomNav";
import ShamrockRain from "@/components/ShamrockRain";

const REWARDS = [
  { id: "starbucks", emoji: "☕", name: "Starbucks $5 Gift Card", pointsRequired: 300 },
  { id: "burger", emoji: "🍔", name: "Burger King Free Whopper", pointsRequired: 200 },
  { id: "pizza", emoji: "🍕", name: "Lou Malnati's Deep Dish Slice", pointsRequired: 400 },
  { id: "ferris", emoji: "🎟️", name: "Navy Pier Ferris Wheel Ticket", pointsRequired: 250 },
  { id: "trophy", emoji: "🏆", name: "ChiQuest Champion Trophy NFT", pointsRequired: 1300 },
];

export default function RewardsPage() {
  const [state, setState] = useState<GameState>(() => loadGameState());

  const handleRedeem = (rewardId: string, cost: number) => {
    const newState: GameState = {
      ...state,
      points: state.points - cost,
      redeemedRewards: [...state.redeemedRewards, rewardId],
    };
    saveGameState(newState);
    setState(newState);
  };

  return (
    <div className="min-h-screen bg-[#0a1a0a] pb-24">
      <ShamrockRain />

      <header className="relative z-10 px-4 pt-4 pb-2">
        <h1 className="text-xl font-black text-stpat-cream mb-1">
          🎁 Rewards
        </h1>
        <p className="text-xs text-stpat-green/50 mb-3">
          Redeem your XP for Chicago treats
        </p>

        <motion.div
          className="rounded-xl bg-[#0f2b0f]/80 backdrop-blur border border-stpat-green/20 p-3"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <XPBar points={state.points} compact />
        </motion.div>
      </header>

      <div className="relative z-10 px-4 mt-4 space-y-3">
        {REWARDS.map((reward, i) => (
          <RewardCard
            key={reward.id}
            emoji={reward.emoji}
            name={reward.name}
            pointsRequired={reward.pointsRequired}
            userPoints={state.points}
            redeemed={state.redeemedRewards.includes(reward.id)}
            onRedeem={() => handleRedeem(reward.id, reward.pointsRequired)}
            index={i}
          />
        ))}

        <motion.div
          className="rounded-xl bg-[#0f2b0f] border border-stpat-green/10 p-4 text-center mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-stpat-green/40">
            🔮 Coming soon: Real gift card delivery via Tango Card API
          </p>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
