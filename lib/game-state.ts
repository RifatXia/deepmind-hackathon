"use client";

export interface GameState {
  points: number;
  unlockedSpots: string[];
  postcards: Record<string, { imageBase64: string; caption: string }>;
  redeemedRewards: string[];
  playerName: string;
  demoMode: boolean;
}

const STORAGE_KEY = "chiquest-state";

const DEFAULT_STATE: GameState = {
  points: 0,
  unlockedSpots: [],
  postcards: {},
  redeemedRewards: [],
  playerName: "Explorer",
  demoMode: false,
};

export function loadGameState(): GameState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetGameState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
