"use client";

import { useState, useEffect, useCallback, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Navigation,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loadGameState,
  reconcileGameStateWithSpots,
  saveGameState,
  type GameState,
} from "@/lib/game-state";
import { requestLocation, getDistanceMeters } from "@/lib/geo";
import { useLandmarks } from "@/lib/use-landmarks";
import BadgeModal from "@/components/BadgeModal";
import PostcardDisplay from "@/components/PostcardDisplay";
import ShamrockRain from "@/components/ShamrockRain";
import Link from "next/link";

type UnlockPhase =
  | "idle"
  | "checking"
  | "generating"
  | "confetti"
  | "done"
  | "error";

export default function SpotPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { spots, loading, error, refresh, refreshing } = useLandmarks();
  const spot = spots.find((candidate) => candidate.id === id) || null;
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<UnlockPhase>("idle");
  const [distanceMsg, setDistanceMsg] = useState<string>("");
  const [showBadge, setShowBadge] = useState(false);
  const [postcard, setPostcard] = useState<{
    imageBase64: string | null;
    caption: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const gs = loadGameState();
    setState(gs);
    setDistanceMsg("");
    setErrorMsg("");
    setShowBadge(false);

    // Load existing postcard if already unlocked
    if (gs.postcards[id]) {
      setPostcard(gs.postcards[id]);
      setPhase("done");
    } else {
      setPostcard(null);
      setPhase("idle");
    }
  }, [id]);

  useEffect(() => {
    if (!state || spots.length === 0) return;
    const reconciled = reconcileGameStateWithSpots(state, spots);
    if (reconciled !== state) {
      setState(reconciled);
      saveGameState(reconciled);
    }
  }, [state, spots]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      colors: ["#16a34a", "#22c55e", "#ca8a04", "#fbbf24", "#ffffff"],
      origin: { y: 0.6 },
    });
    // Second burst
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 120,
        colors: ["#16a34a", "#22c55e", "#ca8a04"],
        origin: { y: 0.4 },
      });
    }, 300);
  }, []);

  const handleUnlock = async (bypassGPS: boolean = false) => {
    if (!spot || !state) return;
    setPhase("checking");
    setErrorMsg("");

    try {
      // Check location unless demo/bypass
      if (!bypassGPS) {
        const loc = await requestLocation();
        const dist = getDistanceMeters(loc.lat, loc.lng, spot.lat, spot.lng);
        if (dist > spot.radius) {
          setDistanceMsg(
            `You're ${Math.round(dist)}m away — get within ${spot.radius}m!`
          );
          setPhase("idle");
          return;
        }
      }

      // Generate postcard
      setPhase("generating");
      const prompt = spot.geminiPrompt;

      const res = await fetch("/api/generate-postcard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId: spot.id, spotName: spot.name, prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate postcard.");
      }

      const alreadyUnlocked = state.unlockedSpots.includes(spot.id);

      // Save to state
      const newState: GameState = {
        ...state,
        points: alreadyUnlocked ? state.points : state.points + spot.points,
        unlockedSpots: alreadyUnlocked
          ? state.unlockedSpots
          : [...state.unlockedSpots, spot.id],
        postcards: {
          ...state.postcards,
          [spot.id]: { imageBase64: data.imageBase64, caption: data.caption },
        },
      };
      saveGameState(newState);
      setState(newState);
      setPostcard(data);

      // Confetti phase
      setPhase("confetti");
      fireConfetti();

      // Show badge after a moment
      setTimeout(() => {
        setShowBadge(true);
        setPhase("done");
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not unlock this landmark right now. Try again.");
      setPhase("error");
    }
  };

  if (!state) {
    return (
      <div className="min-h-screen bg-[#0a1a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-stpat-green" size={32} />
      </div>
    );
  }

  if (loading && spots.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a1a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-stpat-green mx-auto" size={32} />
          <p className="text-xs text-stpat-green/50 mt-2">
            Loading Chicago landmarks...
          </p>
        </div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-[#0a1a0a] px-4 py-8">
        <ShamrockRain />
        <div className="max-w-md mx-auto rounded-2xl border border-stpat-green/20 bg-[#0f2b0f] p-5 text-center space-y-3">
          <h1 className="text-lg font-black text-stpat-cream">Landmark unavailable</h1>
          <p className="text-sm text-stpat-green/60">
            {error || "This landmark is not in the current Chicago list."}
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                void refresh();
              }}
              disabled={refreshing}
              className="h-9 px-3 rounded-lg border border-stpat-green/30 text-xs font-bold text-stpat-green disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Retry Landmarks"}
            </button>
            <Link
              href="/quests"
              className="h-9 px-3 rounded-lg border border-stpat-gold/30 text-xs font-bold text-stpat-gold inline-flex items-center"
            >
              Back to Quests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isUnlocked = state.unlockedSpots.includes(spot.id);

  return (
    <div className="min-h-screen bg-[#0a1a0a] pb-8">
      <ShamrockRain />

      {/* Top bar */}
      <div className="relative z-10 flex items-center gap-3 px-4 pt-4 pb-2">
        <Link
          href="/quests"
          className="p-2 rounded-xl bg-[#1a3a1a] text-stpat-green hover:bg-stpat-green/20 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-black text-stpat-cream truncate">
            {spot.emoji} {spot.name}
          </h1>
          <p className="text-[10px] text-stpat-green/50 uppercase tracking-wider">
            {spot.tier} tier · +{spot.points} XP
          </p>
        </div>
      </div>

      <div className="relative z-10 px-4 space-y-4">
        {/* Hero area */}
        <motion.div
          className="rounded-2xl overflow-hidden border-2 border-stpat-green/20 bg-[#0f2b0f]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* If we have a postcard, show it */}
          {postcard?.imageBase64 ? (
            <PostcardDisplay
              imageBase64={postcard.imageBase64}
              caption={postcard.caption}
              spotName={spot.name}
            />
          ) : (
            /* Placeholder */
            <div className="aspect-video flex flex-col items-center justify-center bg-gradient-to-br from-[#0f2b0f] to-[#1a3a1a] p-6 text-center">
              <span className="text-6xl mb-3">{spot.emoji}</span>
              <h2 className="text-lg font-bold text-stpat-cream">
                {spot.name}
              </h2>
              <p className="text-xs text-stpat-green/60 mt-2 max-w-xs">
                {spot.description}
              </p>
            </div>
          )}
        </motion.div>

        {/* Fun fact */}
        <motion.div
          className="rounded-xl bg-stpat-gold/5 border border-stpat-gold/20 p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-[10px] text-stpat-gold uppercase tracking-wider font-bold mb-1">
            Fun Fact
          </p>
          <p className="text-xs text-stpat-cream/80">{spot.funFact}</p>
        </motion.div>

        {/* Action area */}
        <AnimatePresence mode="wait">
          {!isUnlocked && phase === "idle" && (
            <motion.div
              key="idle"
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Distance message */}
              {distanceMsg && (
                <div className="rounded-xl bg-stpat-gold/10 border border-stpat-gold/30 p-3 text-center">
                  <p className="text-xs text-stpat-gold">
                    <Navigation size={12} className="inline mr-1" />
                    {distanceMsg}
                  </p>
                </div>
              )}

              {/* Main CTA */}
              <Button
                onClick={() => handleUnlock(false)}
                className="w-full h-14 text-lg font-black bg-gradient-to-r from-stpat-green to-stpat-emerald hover:from-stpat-emerald hover:to-stpat-green text-white rounded-2xl glow-green transition-all"
              >
                <MapPin size={22} className="mr-2" /> I&apos;m Here! 🍀
              </Button>

              {/* Demo button */}
              {state.demoMode && (
                <Button
                  onClick={() => handleUnlock(true)}
                  variant="ghost"
                  className="w-full text-xs text-stpat-gold/60 hover:text-stpat-gold hover:bg-stpat-gold/5"
                >
                  🎭 Demo: Simulate Visit
                </Button>
              )}
            </motion.div>
          )}

          {phase === "checking" && (
            <motion.div
              key="checking"
              className="text-center py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Loader2
                size={32}
                className="animate-spin text-stpat-green mx-auto mb-2"
              />
              <p className="text-sm text-stpat-green/60">
                📍 Checking your location...
              </p>
            </motion.div>
          )}

          {phase === "generating" && (
            <motion.div
              key="generating"
              className="text-center py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="text-5xl inline-block mb-3"
              >
                🍀
              </motion.div>
              <p className="text-sm font-bold text-stpat-shamrock">
                🔮 Generating your AI Postcard...
              </p>
              <p className="text-xs text-stpat-green/40 mt-1">
                Powered by Gemini 2.0 Flash
              </p>
              <div className="mt-3 h-2 bg-[#1a3a1a] rounded-full overflow-hidden max-w-xs mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-stpat-green to-stpat-gold rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "90%" }}
                  transition={{ duration: 8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {phase === "confetti" && (
            <motion.div
              key="confetti"
              className="text-center py-8"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <p className="text-3xl font-black text-stpat-cream mb-2">
                🎊 UNLOCKED!
              </p>
              <p className="text-lg font-bold text-stpat-shamrock">
                {spot.name}
              </p>
              <motion.p
                className="text-2xl font-black text-stpat-gold mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
              >
                +{spot.points} XP
              </motion.p>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div
              key="error"
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center">
                <p className="text-xs text-red-400">{errorMsg}</p>
              </div>
              <Button
                onClick={() => {
                  setPhase("idle");
                  setErrorMsg("");
                }}
                variant="outline"
                className="w-full border-stpat-green/30 text-stpat-green"
              >
                Try Again
              </Button>
              {state.demoMode && (
                <Button
                  onClick={() => handleUnlock(true)}
                  className="w-full bg-stpat-gold/20 text-stpat-gold hover:bg-stpat-gold/30"
                >
                  🎭 Demo: Simulate Visit
                </Button>
              )}
            </motion.div>
          )}

          {isUnlocked && phase === "done" && postcard && (
            <motion.div
              key="done"
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Caption if no image */}
              {!postcard.imageBase64 && (
                <div className="rounded-2xl bg-gradient-to-br from-stpat-green/20 to-stpat-gold/10 border-2 border-stpat-gold/30 p-6 text-center">
                  <span className="text-5xl mb-3 block">{spot.emoji}</span>
                  <p className="text-sm text-stpat-cream italic">
                    &ldquo;{postcard.caption}&rdquo;
                  </p>
                  <p className="text-[10px] text-stpat-green/40 mt-2">
                    <Sparkles size={10} className="inline mr-1" />
                    Generated by Gemini
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-stpat-shamrock text-sm font-bold">
                  ✅ Collected
                </span>
                <span className="text-xs text-stpat-green/40">
                  · {spot.badge}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Badge Modal */}
      <BadgeModal
        isOpen={showBadge}
        onClose={() => setShowBadge(false)}
        spotName={spot.name}
        badge={spot.badge}
        points={spot.points}
        caption={postcard?.caption || ""}
        imageBase64={postcard?.imageBase64}
      />
    </div>
  );
}
