import { SPOTS } from "@/lib/spots";

export const LUCKY_QUEST_KEY = "chiquest-lucky-quest";

export interface LuckyQuestData {
  title: string;
  description: string;
  rewardXP: number;
  locationHint: string;
  completed: boolean;
}

export function loadLuckyQuest(): LuckyQuestData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LUCKY_QUEST_KEY);
    return raw ? (JSON.parse(raw) as LuckyQuestData) : null;
  } catch {
    return null;
  }
}

export function saveLuckyQuest(quest: LuckyQuestData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LUCKY_QUEST_KEY, JSON.stringify(quest));
}

export function clearLuckyQuest(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LUCKY_QUEST_KEY);
}

/**
 * Maps a free-text locationHint from the AI to real coordinates.
 * Tries to fuzzy-match against our 6 known SPOTS first.
 * Falls back to downtown Chicago with a generous 3 km radius.
 */
export function findQuestTarget(locationHint: string): {
  lat: number;
  lng: number;
  radius: number;
  name: string;
} {
  const hint = locationHint.toLowerCase();

  const match = SPOTS.find((spot) => {
    const spotWords = spot.name
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    return (
      hint.includes(spot.name.toLowerCase()) ||
      spotWords.some((word) => hint.includes(word))
    );
  });

  if (match) {
    return {
      lat: match.lat,
      lng: match.lng,
      radius: 500, // more lenient than regular quests
      name: match.name,
    };
  }

  // Fallback: anywhere in Chicago's downtown loop (≤3 km from The Bean)
  return {
    lat: 41.8827,
    lng: -87.6233,
    radius: 3000,
    name: "downtown Chicago",
  };
}
