"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Navigation,
  Sparkles,
  Palette,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSpotById, type Spot } from "@/lib/spots";
import { loadGameState, saveGameState, type GameState } from "@/lib/game-state";
import { requestLocation, getDistanceMeters } from "@/lib/geo";
import { type ArtStyle } from "@/lib/art-styles";
import { saveImage, loadImage } from "@/lib/image-store";
import BadgeModal from "@/components/BadgeModal";
import PostcardDisplay from "@/components/PostcardDisplay";
import ShamrockRain from "@/components/ShamrockRain";
import CameraCapture from "@/components/CameraCapture";
import StyleSelector from "@/components/StyleSelector";
import Link from "next/link";

type UnlockPhase =
  | "idle"
  | "checking"
  | "capture"
  | "style-select"
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
  const router = useRouter();
  const [spot, setSpot] = useState<Spot | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [phase, setPhase] = useState<UnlockPhase>("idle");
  const [distanceMsg, setDistanceMsg] = useState<string>("");
  const [showBadge, setShowBadge] = useState(false);
  // Current image displayed in hero (loaded from IndexedDB)
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [heroCaption, setHeroCaption] = useState<string>("");
  const [heroStyleName, setHeroStyleName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState("");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ArtStyle | null>(null);
  const [isRestyling, setIsRestyling] = useState(false);
  const [restyleImage, setRestyleImage] = useState<string | null>(null);
  const [restyleCaption, setRestyleCaption] = useState("");
  const [restyleStyleName, setRestyleStyleName] = useState("");

  useEffect(() => {
    const s = getSpotById(id);
    if (!s) {
      router.push("/");
      return;
    }
    setSpot(s);
    const gs = loadGameState();
    setState(gs);

    // Load existing image from IndexedDB if unlocked
    if (gs.postcards[id]) {
      setHeroCaption(gs.postcards[id].caption);
      setHeroStyleName(gs.postcards[id].styleName || "");
      setPhase("done");
      loadImage(id).then((img) => {
        if (img) setHeroImage(img);
      });
    }
  }, [id, router]);

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      colors: ["#16a34a", "#22c55e", "#ca8a04", "#fbbf24", "#ffffff"],
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 120,
        colors: ["#16a34a", "#22c55e", "#ca8a04"],
        origin: { y: 0.4 },
      });
    }, 300);
  }, []);

  const handleCheckIn = async (bypassGPS: boolean = false) => {
    if (!spot || !state) return;
    setPhase("checking");
    setErrorMsg("");

    try {
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
      setPhase("capture");
    } catch (err) {
      console.error(err);
      setErrorMsg("Could not verify location. Try Demo mode!");
      setPhase("error");
    }
  };

  const handlePhotoCaptured = (base64: string) => {
    setUserPhoto(base64);
    setPhase("style-select");
  };

  const handleSkipPhoto = () => {
    setUserPhoto(null);
    setPhase("style-select");
  };

  const handleGenerateSouvenir = async (style: ArtStyle) => {
    if (!spot || !state) return;
    setSelectedStyle(style);
    setPhase("generating");

    try {
      const res = await fetch("/api/style-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: spot.id,
          spotName: spot.name,
          styleId: style.id,
          userImageBase64: userPhoto,
        }),
      });

      const data = await res.json();

      // Save image to IndexedDB (not localStorage)
      if (data.imageBase64) {
        await saveImage(id, data.imageBase64);
        setHeroImage(data.imageBase64);
      }

      const caption = data.caption || `Souvenir from ${spot.name}! 🍀`;
      const styleName = data.styleName || style.name;
      setHeroCaption(caption);
      setHeroStyleName(styleName);

      // Save metadata to localStorage (no image data)
      const newState: GameState = {
        ...state,
        points: state.points + spot.points,
        unlockedSpots: [...state.unlockedSpots, spot.id],
        postcards: {
          ...state.postcards,
          [spot.id]: {
            caption,
            styleName,
            hasImage: !!data.imageBase64,
          },
        },
      };
      saveGameState(newState);
      setState(newState);

      setPhase("confetti");
      fireConfetti();

      setTimeout(() => {
        setShowBadge(true);
        setPhase("done");
      }, 1500);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to generate souvenir. Please try again.");
      setPhase("error");
    }
  };

  const handleRestyle = async (style: ArtStyle) => {
    if (!spot || !state) return;
    setIsRestyling(true);
    setSelectedStyle(style);
    setRestyleImage(null);

    try {
      const res = await fetch("/api/style-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spotId: spot.id,
          spotName: spot.name,
          styleId: style.id,
          userImageBase64: userPhoto,
        }),
      });
      const data = await res.json();

      if (data.imageBase64) {
        // Save new style to IndexedDB with style suffix
        await saveImage(`${id}-${style.id}`, data.imageBase64);
        setRestyleImage(data.imageBase64);
        setRestyleCaption(data.caption || "");
        setRestyleStyleName(data.styleName || style.name);
        fireConfetti();
      }
    } catch {
      setRestyleImage(null);
    } finally {
      setIsRestyling(false);
    }
  };

  // Helper to create file input for restyle photo
  const openFilePicker = (capture?: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (capture) input.capture = capture;
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 1024;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
          setUserPhoto(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.src = ev.target?.result as string;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (!spot || !state) {
    return (
      <div className="min-h-screen bg-[#0a1a0a] flex items-center justify-center">
        <Loader2 className="animate-spin text-stpat-green" size={32} />
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
          {heroImage ? (
            <PostcardDisplay
              imageBase64={heroImage}
              caption={heroCaption}
              spotName={spot.name}
              styleName={heroStyleName}
            />
          ) : (
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

        <AnimatePresence mode="wait">
          {!isUnlocked && phase === "idle" && (
            <motion.div
              key="idle"
              className="space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {distanceMsg && (
                <div className="rounded-xl bg-stpat-gold/10 border border-stpat-gold/30 p-3 text-center">
                  <p className="text-xs text-stpat-gold">
                    <Navigation size={12} className="inline mr-1" />
                    {distanceMsg}
                  </p>
                </div>
              )}
              <Button
                onClick={() => handleCheckIn(false)}
                className="w-full h-14 text-lg font-black bg-gradient-to-r from-stpat-green to-stpat-emerald hover:from-stpat-emerald hover:to-stpat-green text-white rounded-2xl glow-green transition-all"
              >
                <MapPin size={22} className="mr-2" /> I&apos;m Here! 🍀
              </Button>
              {state.demoMode && (
                <Button
                  onClick={() => handleCheckIn(true)}
                  variant="ghost"
                  className="w-full text-xs text-stpat-gold/60 hover:text-stpat-gold hover:bg-stpat-gold/5"
                >
                  🎭 Demo: Simulate Visit
                </Button>
              )}
            </motion.div>
          )}

          {phase === "checking" && (
            <motion.div key="checking" className="text-center py-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Loader2 size={32} className="animate-spin text-stpat-green mx-auto mb-2" />
              <p className="text-sm text-stpat-green/60">📍 Checking your location...</p>
            </motion.div>
          )}

          {phase === "capture" && (
            <motion.div key="capture" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="rounded-xl bg-stpat-green/5 border border-stpat-green/20 p-3 mb-3 text-center">
                <p className="text-xs text-stpat-shamrock font-bold">
                  📍 Location verified! You&apos;re at {spot.name}!
                </p>
              </div>
              <CameraCapture onCapture={handlePhotoCaptured} onCancel={handleSkipPhoto} />
            </motion.div>
          )}

          {phase === "style-select" && (
            <motion.div key="style-select" className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {userPhoto && (
                <div className="flex items-center gap-3 rounded-xl bg-[#0f2b0f] border border-stpat-green/20 p-2">
                  <img src={userPhoto} alt="Your photo" className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="text-xs font-bold text-stpat-cream">Your photo is ready!</p>
                    <p className="text-[10px] text-stpat-green/50">Now pick how AI should transform it</p>
                  </div>
                </div>
              )}
              <StyleSelector selectedStyle={selectedStyle?.id || null} onSelect={(style) => setSelectedStyle(style)} />
              <Button
                onClick={() => { if (selectedStyle) handleGenerateSouvenir(selectedStyle); }}
                disabled={!selectedStyle}
                className="w-full h-12 font-black bg-gradient-to-r from-stpat-gold to-stpat-green hover:from-stpat-green hover:to-stpat-gold text-white rounded-2xl transition-all disabled:opacity-40"
              >
                <Palette size={18} className="mr-2" />
                {selectedStyle ? `Generate ${selectedStyle.name} Souvenir` : "Select a Style First"}
              </Button>
            </motion.div>
          )}

          {phase === "generating" && (
            <motion.div key="generating" className="text-center py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-5xl inline-block mb-3">
                {selectedStyle?.emoji || "🍀"}
              </motion.div>
              <p className="text-sm font-bold text-stpat-shamrock">
                🔮 Creating your {selectedStyle?.name || "AI"} souvenir...
              </p>
              <p className="text-xs text-stpat-green/40 mt-1">
                {userPhoto ? "Transforming your photo with Gemini" : "Generating with Gemini"}
              </p>
              <div className="mt-3 h-2 bg-[#1a3a1a] rounded-full overflow-hidden max-w-xs mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-stpat-green via-stpat-gold to-stpat-shamrock rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "90%" }}
                  transition={{ duration: 12, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          )}

          {phase === "confetti" && (
            <motion.div key="confetti" className="text-center py-8" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 10 }}>
              <p className="text-3xl font-black text-stpat-cream mb-2">🎊 UNLOCKED!</p>
              <p className="text-lg font-bold text-stpat-shamrock">{spot.name}</p>
              <motion.p className="text-2xl font-black text-stpat-gold mt-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
                +{spot.points} XP
              </motion.p>
            </motion.div>
          )}

          {phase === "error" && (
            <motion.div key="error" className="space-y-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-center">
                <p className="text-xs text-red-400">{errorMsg}</p>
              </div>
              <Button onClick={() => { setPhase("idle"); setErrorMsg(""); }} variant="outline" className="w-full border-stpat-green/30 text-stpat-green">
                Try Again
              </Button>
              {state.demoMode && (
                <Button onClick={() => handleCheckIn(true)} className="w-full bg-stpat-gold/20 text-stpat-gold hover:bg-stpat-gold/30">
                  🎭 Demo: Simulate Visit
                </Button>
              )}
            </motion.div>
          )}

          {isUnlocked && phase === "done" && (
            <motion.div key="done" className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {!heroImage && heroCaption && (
                <div className="rounded-2xl bg-gradient-to-br from-stpat-green/20 to-stpat-gold/10 border-2 border-stpat-gold/30 p-6 text-center">
                  <span className="text-5xl mb-3 block">{spot.emoji}</span>
                  <p className="text-sm text-stpat-cream italic">&ldquo;{heroCaption}&rdquo;</p>
                  <p className="text-[10px] text-stpat-green/40 mt-2">
                    <Sparkles size={10} className="inline mr-1" />Generated by Gemini
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 py-1">
                <span className="text-stpat-shamrock text-sm font-bold">✅ Collected</span>
                <span className="text-xs text-stpat-green/40">· {spot.badge}</span>
              </div>

              {/* Restyle section */}
              <div className="rounded-2xl border-2 border-stpat-green/15 bg-[#0f2b0f]/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Camera size={16} className="text-stpat-gold" />
                  <p className="text-sm font-bold text-stpat-cream">Create Another Souvenir</p>
                </div>
                <p className="text-xs text-stpat-green/50">Upload a photo and try a different art style!</p>

                {!userPhoto ? (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => openFilePicker("environment")} className="flex-1 bg-stpat-green/20 text-stpat-green hover:bg-stpat-green/30 text-xs">
                      <Camera size={14} className="mr-1" /> Camera
                    </Button>
                    <Button size="sm" onClick={() => openFilePicker()} variant="outline" className="flex-1 border-stpat-green/20 text-stpat-green text-xs">
                      Upload
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-[#1a3a1a]">
                    <img src={userPhoto} alt="Your photo" className="w-10 h-10 rounded-lg object-cover" />
                    <p className="text-xs text-stpat-cream flex-1">Photo ready</p>
                    <button onClick={() => setUserPhoto(null)} className="text-xs text-stpat-green/40 hover:text-stpat-green">Change</button>
                  </div>
                )}

                <StyleSelector selectedStyle={selectedStyle?.id || null} onSelect={handleRestyle} />

                {isRestyling && (
                  <div className="text-center py-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="text-3xl inline-block mb-2">
                      {selectedStyle?.emoji || "🎨"}
                    </motion.div>
                    <p className="text-xs text-stpat-green/60">Creating {selectedStyle?.name} souvenir...</p>
                  </div>
                )}

                {restyleImage && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <PostcardDisplay imageBase64={restyleImage} caption={restyleCaption} spotName={spot.name} styleName={restyleStyleName} />
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BadgeModal
        isOpen={showBadge}
        onClose={() => setShowBadge(false)}
        spotName={spot.name}
        badge={spot.badge}
        points={spot.points}
        caption={heroCaption}
        imageBase64={heroImage}
      />
    </div>
  );
}
