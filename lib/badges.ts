export interface Tier {
  name: string;
  min: number;
  emoji: string;
  color: string;
}

export const TIERS: Tier[] = [
  { name: "Tourist", min: 0, emoji: "🗺️", color: "gray" },
  { name: "Explorer", min: 200, emoji: "🧭", color: "green" },
  { name: "Local", min: 500, emoji: "🏙️", color: "blue" },
  { name: "Chi-Insider", min: 900, emoji: "⭐", color: "purple" },
  { name: "312 Legend", min: 1300, emoji: "👑", color: "gold" },
];

export function getTierForPoints(points: number): Tier {
  let current = TIERS[0];
  for (const tier of TIERS) {
    if (points >= tier.min) current = tier;
  }
  return current;
}

export function getNextTier(points: number): Tier | null {
  for (const tier of TIERS) {
    if (points < tier.min) return tier;
  }
  return null;
}

export function getProgressToNextTier(points: number): number {
  const current = getTierForPoints(points);
  const next = getNextTier(points);
  if (!next) return 100;
  const range = next.min - current.min;
  const progress = points - current.min;
  return Math.min(100, Math.round((progress / range) * 100));
}
