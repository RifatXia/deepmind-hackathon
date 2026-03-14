"use client";

import { motion } from "framer-motion";
import { Download } from "lucide-react";

interface PostcardDisplayProps {
  imageBase64: string;
  caption: string;
  spotName: string;
  styleName?: string;
}

export default function PostcardDisplay({
  imageBase64,
  caption,
  spotName,
  styleName,
}: PostcardDisplayProps) {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageBase64}`;
    link.download = `chiquest-${spotName.toLowerCase().replace(/\s/g, "-")}${styleName ? `-${styleName.toLowerCase().replace(/\s/g, "-")}` : ""}.png`;
    link.click();
  };

  return (
    <motion.div
      className="rounded-2xl overflow-hidden border-2 border-stpat-gold/30 bg-[#0f2b0f]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <img
          src={`data:image/png;base64,${imageBase64}`}
          alt={`AI Souvenir: ${spotName}`}
          className="w-full aspect-square object-cover"
        />
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-end justify-between">
          <div>
            <p className="text-white text-xs font-medium opacity-80">
              {styleName ? `${styleName} Style` : "AI-Generated"} Souvenir
            </p>
          </div>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-stpat-cream italic">
          &ldquo;{caption}&rdquo;
        </p>
        <p className="text-[10px] text-stpat-green/40 mt-2 uppercase tracking-wider">
          Powered by Gemini 2.0 Flash
          {styleName && ` · ${styleName}`}
        </p>
      </div>
    </motion.div>
  );
}
