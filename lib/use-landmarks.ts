"use client";

import { useCallback, useEffect, useState } from "react";
import type { LandmarksResponse, Spot } from "@/lib/spots";

const LANDMARKS_CACHE_KEY = "chiquest-landmarks-v1";

function isValidSpot(spot: unknown): spot is Spot {
  if (!spot || typeof spot !== "object") return false;
  const value = spot as Record<string, unknown>;
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.emoji === "string" &&
    typeof value.description === "string" &&
    typeof value.lat === "number" &&
    typeof value.lng === "number" &&
    typeof value.points === "number" &&
    typeof value.radius === "number" &&
    typeof value.badge === "string" &&
    typeof value.tier === "string" &&
    typeof value.geminiPrompt === "string" &&
    typeof value.funFact === "string"
  );
}

function readCache(): LandmarksResponse | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LANDMARKS_CACHE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<LandmarksResponse>;
    if (
      !parsed ||
      !Array.isArray(parsed.spots) ||
      typeof parsed.fetchedAt !== "string"
    ) {
      return null;
    }
    const spots = parsed.spots.filter(isValidSpot);
    if (spots.length !== parsed.spots.length) return null;
    return { spots, fetchedAt: parsed.fetchedAt };
  } catch {
    return null;
  }
}

function writeCache(payload: LandmarksResponse): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LANDMARKS_CACHE_KEY, JSON.stringify(payload));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Unable to load Chicago landmarks.";
}

export function useLandmarks() {
  const [spots, setSpots] = useState<Spot[]>([]);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const res = await fetch("/api/landmarks", { cache: "no-store" });
      const data = (await res.json()) as unknown;

      if (!res.ok) {
        const message =
          typeof data === "object" &&
          data &&
          "error" in data &&
          typeof (data as { error?: unknown }).error === "string"
            ? (data as { error: string }).error
            : "Unable to refresh landmarks.";
        throw new Error(message);
      }
      if (
        typeof data !== "object" ||
        !data ||
        !("spots" in data) ||
        !("fetchedAt" in data)
      ) {
        throw new Error("Invalid landmark response.");
      }
      const payload = data as LandmarksResponse;
      if (!Array.isArray(payload.spots) || typeof payload.fetchedAt !== "string") {
        throw new Error("Invalid landmark response.");
      }

      setSpots(payload.spots);
      setFetchedAt(payload.fetchedAt);
      writeCache({ spots: payload.spots, fetchedAt: payload.fetchedAt });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const cached = readCache();
    if (cached) {
      setSpots(cached.spots);
      setFetchedAt(cached.fetchedAt);
      setLoading(false);
      return;
    }

    void refresh();
  }, [refresh]);

  return {
    spots,
    fetchedAt,
    loading,
    refreshing,
    error,
    refresh,
  };
}
