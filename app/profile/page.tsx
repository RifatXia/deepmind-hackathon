"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, Trash2, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadGameState, saveGameState, resetGameState, type GameState } from "@/lib/game-state";
import { loadAllImages, clearAllImages } from "@/lib/image-store";
import { useLandmarks } from "@/lib/use-landmarks";
import type { Spot } from "@/lib/spots";
import { getTierForPoints, getNextTier, TIERS } from "@/lib/badges";
import XPBar from "@/components/XPBar";
import BottomNav from "@/components/BottomNav";
import ShamrockRain from "@/components/ShamrockRain";

interface GalleryItem {
  key: string;
  spotId: string;
  spotName: string;
  spotEmoji: string;
  imageBase64: string;
  caption: string;
  styleName?: string;
}

export default function ProfilePage() {
  const [state, setState] = useState<GameState | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [lightboxImage, setLightboxImage] = useState<GalleryItem | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const { spots } = useLandmarks();

  // Build a lookup map from spot id -> Spot
  const spotMap = new Map<string, Spot>();
  for (const s of spots) spotMap.set(s.id, s);

  useEffect(() => {
    const gs = loadGameState();
    setState(gs);
    setNameInput(gs.playerName);

    // Load all images from IndexedDB
    loadAllImages().then((images) => {
      const items: GalleryItem[] = [];
      for (const [key, imageBase64] of Object.entries(images)) {
        // key is either "spotId" or "spotId-styleId"
        // For OSM-based IDs like "osm-node-123", we need to find the matching spot
        let spot: Spot | undefined;
        // Try full key match first
        spot = spotMap.get(key);
        if (!spot) {
          // Try matching by checking if key starts with a known spot id
          for (const [sid, s] of spotMap) {
            if (key === sid || key.startsWith(sid + "-")) {
              spot = s;
              break;
            }
          }
        }
        const spotId = spot?.id || key;
        // Check postcards metadata
        const meta = gs.postcards[spotId] || gs.postcards[key];

        items.push({
          key,
          spotId: spot?.id || key,
          spotName: spot?.name || key,
          spotEmoji: spot?.emoji || "📍",
          imageBase64,
          caption: meta?.caption || "Chicago souvenir 🍀",
          styleName: meta?.styleName,
        });
      }
      setGallery(items);
    });
  }, [spots]);

  if (!state) return null;

  const tier = getTierForPoints(state.points);
  const nextTier = getNextTier(state.points);

  const handleSaveName = () => {
    if (!state) return;
    const newState = { ...state, playerName: nameInput.trim() || "Explorer" };
    saveGameState(newState);
    setState(newState);
    setEditingName(false);
  };

  const handleDownload = (imageBase64: string, spotName: string) => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = `chiquest-${spotName.toLowerCase().replace(/\s/g, "-")}.png`;
    link.click();
  };

  const handleShare = async (spotName: string) => {
    const text = `Check out my AI souvenir from ${spotName}! 🍀 Made with ChiQuest\nchiquest.vercel.app`;
    if (navigator.share) {
      try { await navigator.share({ text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  const handleReset = async () => {
    if (confirm("Reset all progress? This cannot be undone.")) {
      resetGameState();
      await clearAllImages();
      setState(loadGameState());
      setGallery([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1a0a] pb-24">
      <ShamrockRain />

      <header className="relative z-10 px-4 pt-4 pb-2">
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-[#0f2b0f] to-[#1a3a1a] border-2 border-stpat-green/20 p-5 space-y-4"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-stpat-green/20 border-2 border-stpat-green/30 flex items-center justify-center text-3xl">
              {tier.emoji}
            </div>
            <div className="flex-1">
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                    className="bg-[#0a1a0a] border border-stpat-green/30 rounded-lg px-3 py-1.5 text-sm text-stpat-cream outline-none focus:border-stpat-shamrock w-full"
                    autoFocus
                    maxLength={20}
                  />
                  <Button size="sm" onClick={handleSaveName} className="bg-stpat-green text-white text-xs shrink-0">Save</Button>
                </div>
              ) : (
                <button onClick={() => setEditingName(true)} className="text-left group">
                  <h2 className="text-lg font-black text-stpat-cream group-hover:text-stpat-shamrock transition-colors">
                    {state.playerName}
                  </h2>
                  <p className="text-[10px] text-stpat-green/40 group-hover:text-stpat-green/60">Tap to edit name</p>
                </button>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-stpat-gold">{tier.name}</span>
                <span className="text-[10px] text-stpat-green/40">
                  · {state.unlockedSpots.length} spots · {gallery.length} souvenirs
                </span>
              </div>
            </div>
          </div>

          <XPBar points={state.points} />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-[#0a1a0a]/50 p-3 text-center">
              <p className="text-lg font-black text-stpat-gold">{state.points}</p>
              <p className="text-[10px] text-stpat-green/40">Total XP</p>
            </div>
            <div className="rounded-xl bg-[#0a1a0a]/50 p-3 text-center">
              <p className="text-lg font-black text-stpat-shamrock">{state.unlockedSpots.length}/{spots.length || 12}</p>
              <p className="text-[10px] text-stpat-green/40">Spots</p>
            </div>
            <div className="rounded-xl bg-[#0a1a0a]/50 p-3 text-center">
              <p className="text-lg font-black text-stpat-cream">{gallery.length}</p>
              <p className="text-[10px] text-stpat-green/40">Souvenirs</p>
            </div>
          </div>

          {/* Badges */}
          {state.unlockedSpots.length > 0 && (
            <div>
              <p className="text-[10px] text-stpat-green/40 uppercase tracking-wider mb-2">Badges Collected</p>
              <div className="flex flex-wrap gap-2">
                {state.unlockedSpots.map((spotId) => {
                  const spot = spotMap.get(spotId);
                  if (!spot) return null;
                  return (
                    <motion.div key={spotId} initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="px-2.5 py-1 rounded-full bg-stpat-gold/10 border border-stpat-gold/20 text-xs text-stpat-gold font-medium"
                    >
                      {spot.emoji} {spot.badge.split(" ")[0]}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tier progress */}
          {nextTier && (
            <div className="rounded-xl bg-[#0a1a0a]/50 p-3">
              <p className="text-[10px] text-stpat-green/40 mb-1">Next tier: {nextTier.emoji} {nextTier.name}</p>
              <div className="flex items-center gap-2">
                {TIERS.map((t) => (
                  <div key={t.name} className={`flex-1 h-1.5 rounded-full ${state.points >= t.min ? "bg-stpat-gold" : "bg-stpat-green/10"}`} />
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </header>

      {/* Gallery */}
      <div className="relative z-10 px-4 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <ImageIcon size={16} className="text-stpat-gold" />
          <h3 className="text-sm font-black text-stpat-cream">My Souvenir Gallery</h3>
        </div>

        {gallery.length === 0 ? (
          <motion.div className="rounded-2xl border-2 border-dashed border-stpat-green/15 bg-[#0f2b0f] p-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-4xl mb-3">🎨</div>
            <p className="text-sm font-bold text-stpat-cream mb-1">No souvenirs yet</p>
            <p className="text-xs text-stpat-green/40">Visit a spot and create your first AI art souvenir!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {gallery.map((item, i) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl overflow-hidden border-2 border-stpat-green/20 bg-[#0f2b0f] cursor-pointer hover:border-stpat-gold/40 transition-all active:scale-95"
                onClick={() => setLightboxImage(item)}
              >
                <img
                  src={`data:image/png;base64,${item.imageBase64}`}
                  alt={`Souvenir: ${item.spotName}`}
                  className="w-full aspect-square object-cover"
                />
                <div className="p-2">
                  <p className="text-[10px] font-bold text-stpat-cream truncate">{item.spotEmoji} {item.spotName}</p>
                  {item.styleName && <p className="text-[9px] text-stpat-gold/60">{item.styleName}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Reset */}
      <div className="relative z-10 px-4 mt-8">
        <button onClick={handleReset} className="w-full text-xs text-red-400/40 hover:text-red-400/70 py-2 transition-colors">
          <Trash2 size={12} className="inline mr-1" /> Reset All Progress
        </button>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setLightboxImage(null)} />
            <motion.div
              className="relative w-full max-w-sm bg-[#0f2b0f] rounded-3xl border-2 border-stpat-gold/30 overflow-hidden"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              <button onClick={() => setLightboxImage(null)} className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white/70 hover:text-white">
                <X size={18} />
              </button>
              <img src={`data:image/png;base64,${lightboxImage.imageBase64}`} alt={`Souvenir: ${lightboxImage.spotName}`} className="w-full aspect-square object-cover" />
              <div className="p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-stpat-cream">{lightboxImage.spotName}</h3>
                  {lightboxImage.styleName && <p className="text-[10px] text-stpat-gold">{lightboxImage.styleName} Style</p>}
                </div>
                <p className="text-xs text-stpat-green/70 italic">&ldquo;{lightboxImage.caption}&rdquo;</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleDownload(lightboxImage.imageBase64, lightboxImage.spotName)} className="flex-1 bg-stpat-green hover:bg-stpat-emerald text-white text-xs">
                    <Download size={14} className="mr-1" /> Download
                  </Button>
                  <Button size="sm" onClick={() => handleShare(lightboxImage.spotName)} variant="outline" className="flex-1 border-stpat-green/30 text-stpat-green text-xs">
                    <Share2 size={14} className="mr-1" /> Share
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
