"use client";

export interface PostcardMeta {
  caption: string;
  styleName?: string;
  hasImage: boolean;
}
import type { Spot } from "@/lib/spots";

export interface GameState {
  version: number;
  points: number;
  unlockedSpots: string[];
  postcards: Record<string, PostcardMeta>;
  redeemedRewards: string[];
  playerName: string;
  demoMode: boolean;
}

const STORAGE_KEY = "chiquest-state";
const GAME_STATE_VERSION = 2;

function getDefaultState(): GameState {
  return {
    version: GAME_STATE_VERSION,
    points: 0,
    unlockedSpots: [],
    postcards: {},
    redeemedRewards: [],
    playerName: "Explorer",
    demoMode: false,
  };
}

export function loadGameState(): GameState {
  if (typeof window === "undefined") return getDefaultState();
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
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (parsed.version !== GAME_STATE_VERSION) {
      const resetState = getDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resetState));
      return resetState;
    }

    return { ...getDefaultState(), ...parsed, version: GAME_STATE_VERSION };
  } catch {
    return getDefaultState();
  }
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save game state:", e);
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, version: GAME_STATE_VERSION })
  );
}

export function resetGameState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function reconcileGameStateWithSpots(
  state: GameState,
  spots: Spot[]
): GameState {
  const validSpotIds = new Set(spots.map((spot) => spot.id));
  const unlockedSpots = state.unlockedSpots.filter((id) => validSpotIds.has(id));

  const postcards: GameState["postcards"] = {};
  for (const [spotId, postcard] of Object.entries(state.postcards)) {
    if (validSpotIds.has(spotId)) {
      postcards[spotId] = postcard;
    }
  }

  const unlockedChanged = unlockedSpots.length !== state.unlockedSpots.length;
  const postcardsChanged =
    Object.keys(postcards).length !== Object.keys(state.postcards).length;

  if (!unlockedChanged && !postcardsChanged) return state;
  return { ...state, unlockedSpots, postcards };
}
