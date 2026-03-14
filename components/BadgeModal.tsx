"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotName: string;
  badge: string;
  points: number;
  caption: string;
  imageBase64?: string | null;
}

export default function BadgeModal({
  isOpen,
  onClose,
  spotName,
  badge,
  points,
  caption,
  imageBase64,
}: BadgeModalProps) {
  const handleShare = async () => {
    const text = `I just visited ${spotName}! ${badge} +${points} XP on ChiQuest 🍀\nPlay at: chiquest.vercel.app`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-sm bg-gradient-to-b from-[#0f2b0f] to-[#0a1a0a] rounded-3xl border-2 border-stpat-gold/40 overflow-hidden"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
          >
            {/* Gold shimmer top */}
            <div className="h-1 shimmer-gold" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/40 text-white/60 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div className="p-6 text-center space-y-4">
              {/* Victory text */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 10 }}
              >
                <p className="text-stpat-gold text-xs uppercase tracking-[0.2em] font-bold mb-1">
                  You Unlocked
                </p>
                <h2 className="text-2xl font-black text-stpat-cream">
                  {spotName}
                </h2>
              </motion.div>

              {/* Postcard */}
              {imageBase64 && (
                <motion.div
                  className="relative rounded-2xl overflow-hidden border-2 border-stpat-gold/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <img
                    src={`data:image/png;base64,${imageBase64}`}
                    alt={`AI Postcard: ${spotName}`}
                    className="w-full aspect-square object-cover"
                  />
                </motion.div>
              )}

              {/* Caption */}
              <motion.p
                className="text-sm text-stpat-green/80 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                &ldquo;{caption}&rdquo;
              </motion.p>

              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stpat-gold/10 border border-stpat-gold/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <span className="text-lg">{badge.split(" ").pop()}</span>
                <span className="text-sm font-bold text-stpat-gold">
                  {badge}
                </span>
              </motion.div>

              {/* Points */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, type: "spring" }}
              >
                <p className="text-3xl font-black text-stpat-shamrock">
                  +{points} XP
                </p>
              </motion.div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-stpat-green hover:bg-stpat-emerald text-white font-bold"
                >
                  <Share2 size={16} className="mr-1" /> Share
                </Button>
                {imageBase64 && (
                  <Button
                    variant="outline"
                    className="border-stpat-green/30 text-stpat-green hover:bg-stpat-green/10"
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = `data:image/png;base64,${imageBase64}`;
                      link.download = `chiquest-${spotName
                        .toLowerCase()
                        .replace(/\s/g, "-")}.png`;
                      link.click();
                    }}
                  >
                    <Download size={16} />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
