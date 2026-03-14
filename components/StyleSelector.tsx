"use client";

import { motion } from "framer-motion";
import { ART_STYLES, type ArtStyle } from "@/lib/art-styles";

interface StyleSelectorProps {
  selectedStyle: string | null;
  onSelect: (style: ArtStyle) => void;
}

export default function StyleSelector({
  selectedStyle,
  onSelect,
}: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-bold text-stpat-cream mb-1">
          Choose Your Art Style
        </p>
        <p className="text-xs text-stpat-green/50">
          AI will reimagine your photo in this style
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {ART_STYLES.map((style, i) => {
          const isSelected = selectedStyle === style.id;
          return (
            <motion.button
              key={style.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onSelect(style)}
              className={`relative rounded-xl p-3 text-left transition-all active:scale-95 ${
                isSelected
                  ? "border-2 border-stpat-gold bg-stpat-gold/10 ring-1 ring-stpat-gold/30"
                  : "border-2 border-stpat-green/15 bg-[#0f2b0f] hover:border-stpat-green/30"
              }`}
            >
              {/* Style preview gradient */}
              <div
                className="w-full h-12 rounded-lg mb-2"
                style={{ background: style.preview }}
              />

              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-base">{style.emoji}</span>
                <span
                  className={`text-xs font-bold ${
                    isSelected ? "text-stpat-gold" : "text-stpat-cream"
                  }`}
                >
                  {style.name}
                </span>
              </div>
              <p className="text-[10px] text-stpat-green/50 leading-tight">
                {style.description}
              </p>

              {/* Selected check */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-stpat-gold flex items-center justify-center"
                >
                  <span className="text-black text-xs font-bold">✓</span>
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
