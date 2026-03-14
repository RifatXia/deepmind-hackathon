"use client";

export interface PostcardMeta {
  caption: string;
  styleName?: string;
  hasImage: boolean;
}

export interface GameState {
  points: number;
  unlockedSpots: string[];
  postcards: Record<string, PostcardMeta>;
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
    const parsed = JSON.parse(raw);

    // Migrate old format: if postcards have imageBase64, strip it out
    if (parsed.postcards) {
      for (const key of Object.keys(parsed.postcards)) {
        const p = parsed.postcards[key];
        if ("imageBase64" in p) {
          parsed.postcards[key] = {
            caption: p.caption || "",
            styleName: p.styleName,
            hasImage: !!p.imageBase64,
          };
        }
      }
    }

    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save game state:", e);
  }
}

export function resetGameState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
