"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation2, Sparkles } from "lucide-react";
import { SPOTS } from "@/lib/spots";
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state";
import { getTierForPoints, getNextTier, getProgressToNextTier } from "@/lib/badges";
import { getDistanceMeters } from "@/lib/geo";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  loadGameState,
  reconcileGameStateWithSpots,
  saveGameState,
  type GameState,
} from "@/lib/game-state";
import { getTierForPoints } from "@/lib/badges";
import { useLandmarks } from "@/lib/use-landmarks";
import XPBar from "@/components/XPBar";
import BottomNav from "@/components/BottomNav";
import ShamrockRain from "@/components/ShamrockRain";
import DemoToggle from "@/components/DemoToggle";
import UserLocationBadge, { type LocationStatus } from "@/components/UserLocationBadge";
import ClosestQuestCard from "@/components/ClosestQuestCard";
import MapLegend from "@/components/MapLegend";
import QuestMarkerPopup from "@/components/QuestMarkerPopup";
import LuckyQuestModal from "@/components/LuckyQuestModal";

// Dynamically import MapView (Leaflet requires browser APIs)
const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0a1a0a] flex items-center justify-center">
      <div className="text-center space-y-3">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="text-5xl"
        >
          🗺️
        </motion.div>
        <p className="text-stpat-green/40 text-sm font-medium">
          Loading Chicago…
        </p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const [state, setState] = useState<GameState | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("locating");
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const [showLuckyModal, setShowLuckyModal] = useState(false);
  const [state, setState] = useState<GameState>(() => loadGameState());
  const { spots, loading, refreshing, error, refresh } = useLandmarks();
  const effectiveState =
    spots.length > 0 ? reconcileGameStateWithSpots(state, spots) : state;

  useEffect(() => {
    if (effectiveState !== state) {
      saveGameState(effectiveState);
    }
  }, [effectiveState, state]);

  // Stable callback so MapView doesn't remount on every location update
  const handleLocationUpdate = useCallback(
    (loc: [number, number] | null, status: LocationStatus) => {
      setUserLocation(loc);
      setLocationStatus(status);
    },
    []
  );

  const handleMarkerClick = useCallback((spotId: string) => {
    setSelectedSpotId((prev) => (prev === spotId ? null : spotId));
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedSpotId(null);
  }, []);

  const toggleDemoMode = () => {
    if (!state) return;
    const newState = { ...state, demoMode: !state.demoMode };
  const tier = getTierForPoints(effectiveState.points);
  const spotsCollected = effectiveState.unlockedSpots.length;

  const toggleDemoMode = () => {
    const newState = {
      ...effectiveState,
      demoMode: !effectiveState.demoMode,
    };
    setState(newState);
    saveGameState(newState);
  };

  // Derived values
  const tier = state ? getTierForPoints(state.points) : null;
  const nextTier = state ? getNextTier(state.points) : null;
  const progress = state ? getProgressToNextTier(state.points) : 0;
  const spotsCollected = state?.unlockedSpots.length ?? 0;

  // Closest quest when location is known
  const closestSpotData = useMemo(() => {
    if (!userLocation || !state) return null;
    let closest: { spot: (typeof SPOTS)[0]; dist: number } | null = null;
    for (const spot of SPOTS) {
      const dist = getDistanceMeters(
        userLocation[0],
        userLocation[1],
        spot.lat,
        spot.lng
      );
      if (!closest || dist < closest.dist) {
        closest = { spot, dist };
      }
    }
    return closest;
  }, [userLocation, state]);

  // Distance to selected spot
  const selectedSpot = selectedSpotId
    ? SPOTS.find((s) => s.id === selectedSpotId) ?? null
    : null;
  const selectedSpotDistance =
    selectedSpot && userLocation
      ? getDistanceMeters(
          userLocation[0],
          userLocation[1],
          selectedSpot.lat,
          selectedSpot.lng
        )
      : undefined;

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (!state) {
    return (
      <div className="h-[100dvh] bg-[#0a1a0a] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-3"
        >
          <div className="text-6xl">🍀</div>
          <h1 className="text-2xl font-black text-stpat-shamrock">ChiQuest</h1>
          <p className="text-xs text-stpat-green/40">Loading your adventure…</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#0a1a0a]">
      <ShamrockRain />

      {/* ── Compact header ─────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex-shrink-0 px-4 pt-3 pb-2"
      >
        {/* Title row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍀</span>
            <div>
              <h1 className="text-base font-black text-stpat-cream leading-tight tracking-tight">
                ChiQuest
              </h1>
              <p className="text-[9px] text-stpat-green/45 leading-tight">
                St. Patrick&apos;s Day Edition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo mode badge */}
            <AnimatePresence>
              {state.demoMode && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-[9px] font-bold text-stpat-gold border border-stpat-gold/35
                    bg-stpat-gold/10 px-2 py-0.5 rounded-full"
                >
                  🎭 Demo
                </motion.span>
              )}
            </AnimatePresence>

            {/* Location badge */}
            <AnimatePresence mode="wait">
              <UserLocationBadge key={locationStatus} status={locationStatus} />
            </AnimatePresence>

            <DemoToggle enabled={state.demoMode} onToggle={toggleDemoMode} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                void refresh();
              }}
              disabled={refreshing}
              className="h-8 px-2.5 rounded-lg border border-stpat-green/30 text-[10px] font-bold text-stpat-green/80 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh Landmarks"}
            </button>
            <DemoToggle
              enabled={effectiveState.demoMode}
              onToggle={toggleDemoMode}
            />
          </div>
        </div>

        {/* Stat card */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl bg-[#0f2b0f]/85 backdrop-blur border border-stpat-green/20 px-4 py-3"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
        >
          <div className="flex items-center gap-3">
            {/* Tier */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xl">{tier?.emoji}</span>
              <div>
                <p className="text-xs font-black text-stpat-shamrock leading-none">
                  {tier?.name}
                </p>
                {nextTier && (
                  <p className="text-[9px] text-stpat-green/50 leading-none mt-0.5">
                    {nextTier.min - (state.points)} XP to {nextTier.name}
                  </p>
                )}
              </div>
            </div>

            {/* XP progress bar */}
            <div className="flex-1 mx-1">
              <div className="h-2 bg-[#1a3a1a] rounded-full overflow-hidden border border-stpat-green/15">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-stpat-green via-stpat-shamrock to-stpat-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </div>

            {/* XP value */}
            <div className="text-right flex-shrink-0">
              <p className="text-base font-black text-stpat-gold leading-none">
                {state.points}
              </p>
              <p className="text-[9px] text-stpat-green/50 leading-none mt-0.5 uppercase tracking-wide">
                XP
              </p>
            </div>

            {/* Separator */}
            <div className="w-px h-8 bg-stpat-green/15 flex-shrink-0" />

            {/* Spots collected */}
            <div className="text-center flex-shrink-0">
              <p className="text-base font-black text-stpat-cream leading-none">
                <span className="text-stpat-shamrock">{spotsCollected}</span>
                <span className="text-stpat-green/30 text-sm">/{SPOTS.length}</span>
              </p>
              <p className="text-[9px] text-stpat-green/50 leading-none mt-0.5 uppercase tracking-wide">
                Spots
              </p>
            </div>
          </div>
        </motion.div>
      </motion.header>

      {/* ── Map area ───────────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        {/* Leaflet map — explicit z-[1] so the overlay layer can sit above it */}
        <div className="absolute inset-0" style={{ zIndex: 1 }}>
          <MapView
            unlockedSpots={state.unlockedSpots}
            userLocation={userLocation}
            selectedSpotId={selectedSpotId}
            recenterTrigger={recenterTrigger}
            onMarkerClick={handleMarkerClick}
            onMapClick={handleMapClick}
            onLocationUpdate={handleLocationUpdate}
          />
        </div>

        {/* ── Overlay layer — sits above the Leaflet map ────────────────────── */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 50 }}>

          {/* Closest quest card (top of map) */}
          <AnimatePresence>
            {closestSpotData && !selectedSpotId && (
              <div className="pointer-events-auto">
                <ClosestQuestCard
                  key="closest-quest"
                  spot={closestSpotData.spot}
                  distanceMeters={closestSpotData.dist}
                  unlocked={state.unlockedSpots.includes(closestSpotData.spot.id)}
                  onCardClick={() => setSelectedSpotId(closestSpotData.spot.id)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Recenter button (right-center) */}
          <AnimatePresence>
            {userLocation && (
              <motion.button
                key="recenter-btn"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.6 }}
                onClick={() => setRecenterTrigger((t) => t + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-auto
                  w-11 h-11 rounded-xl flex items-center justify-center
                  bg-[#0f2b0f]/90 backdrop-blur-md border border-stpat-green/30
                  text-stpat-shamrock shadow-xl hover:bg-stpat-green/20
                  active:scale-90 transition-all"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
              >
                <Navigation2 size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Bottom row: legend + lucky quest FAB */}
          <div className="absolute bottom-4 left-0 right-0 px-3 flex items-end justify-between">
            <div className="pointer-events-auto">
              <MapLegend />
            </div>

            {/* Lucky Quest FAB */}
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, type: "spring", bounce: 0.4 }}
              onClick={() => setShowLuckyModal(true)}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl
                font-bold text-xs transition-all active:scale-95 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, rgba(202,138,4,0.85), rgba(234,179,8,0.85))",
                border: "1.5px solid rgba(202,138,4,0.5)",
                boxShadow: "0 4px 20px rgba(202,138,4,0.3), 0 0 40px rgba(202,138,4,0.1)",
                color: "#0a1a0a",
                backdropFilter: "blur(8px)",
              }}
            >
              <motion.span
                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                🍀
              </motion.span>
              <span>Lucky Quest</span>
              <Sparkles size={11} />
            </motion.button>
          </div>

        </div>{/* /overlay layer */}

        {/* Quest marker popup bottom sheet (fixed, always above everything) */}
        <QuestMarkerPopup
          spot={selectedSpot}
          distanceMeters={selectedSpotDistance}
          unlocked={selectedSpot ? state.unlockedSpots.includes(selectedSpot.id) : false}
          onClose={() => setSelectedSpotId(null)}
        />
          <XPBar points={effectiveState.points} />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stpat-green/10">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{tier.emoji}</span>
              <span className="text-xs font-bold text-stpat-cream">
                {tier.name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-stpat-green/60">
              <span className="font-bold text-stpat-shamrock">
                {spotsCollected}
              </span>
              <span>of {spots.length} collected</span>
            </div>
          </div>
        </motion.div>
        {error && (
          <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[11px] text-red-300">
            {error}
          </div>
        )}
      </header>

      {/* Map */}
      <div className="flex-1 relative z-[1] min-h-[300px]">
        {loading && spots.length === 0 ? (
          <div className="w-full h-full bg-[#0a1a0a] flex items-center justify-center">
            <div className="animate-pulse text-stpat-green/40">Loading landmarks...</div>
          </div>
        ) : spots.length === 0 ? (
          <div className="w-full h-full bg-[#0a1a0a] flex items-center justify-center px-6 text-center">
            <div>
              <p className="text-stpat-cream text-sm">No landmarks available right now.</p>
              <button
                onClick={() => {
                  void refresh();
                }}
                className="mt-3 h-9 px-3 rounded-lg border border-stpat-green/30 text-xs font-bold text-stpat-green"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <MapView spots={spots} unlockedSpots={effectiveState.unlockedSpots} />
        )}
      </div>

      {/* Bottom nav spacer (nav is fixed) */}
      <div className="h-16 flex-shrink-0" />

      {/* Bottom navigation */}
      <BottomNav />

      {/* Lucky Quest modal */}
      <LuckyQuestModal
        open={showLuckyModal}
        onClose={() => setShowLuckyModal(false)}
        demoMode={state.demoMode}
        onXPEarned={(xp) => {
          // Update the header stat card live when XP is earned in the modal
          setState((prev) =>
            prev ? { ...prev, points: prev.points + xp } : prev
          );
        }}
      />
    </div>
  );
}
