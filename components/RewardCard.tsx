"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Gift, Copy, Clock } from "lucide-react";
import { useState } from "react";

interface RewardCardProps {
  emoji: string;
  name: string;
  pointsRequired: number;
  userPoints: number;
  redeemed: boolean;
  onRedeem: () => void;
  index: number;
}

function hashString(value: string): number {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9000;
  }
  return hash;
}

export default function RewardCard({
  emoji,
  name,
  pointsRequired,
  userPoints,
  redeemed,
  onRedeem,
  index,
}: RewardCardProps) {
  const [showVoucher, setShowVoucher] = useState(false);
  const canRedeem = userPoints >= pointsRequired && !redeemed;
  const voucherSuffix = 1000 + hashString(`${name}-${pointsRequired}`);
  const voucherCode = `CHIQUEST-${name
    .split(" ")[0]
    .toUpperCase()
    .slice(0, 4)}-${voucherSuffix}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`rounded-2xl border-2 p-4 transition-all ${
        redeemed
          ? "border-stpat-gold/40 bg-stpat-gold/5"
          : canRedeem
          ? "border-stpat-shamrock/40 bg-stpat-green/5 hover:border-stpat-shamrock/60"
          : "border-stpat-green/10 bg-[#0f2b0f] opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-[#1a3a1a] flex items-center justify-center text-2xl shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm text-stpat-cream truncate">
            {name}
          </h3>
          <p className="text-xs text-stpat-gold font-bold">
            {pointsRequired} pts
          </p>
        </div>
        {redeemed ? (
          <span className="text-xs text-stpat-gold font-bold px-3 py-1.5 rounded-full bg-stpat-gold/10 border border-stpat-gold/30">
            Redeemed ✓
          </span>
        ) : (
          <Button
            size="sm"
            disabled={!canRedeem}
            onClick={() => {
              setShowVoucher(true);
              onRedeem();
            }}
            className={`text-xs font-bold ${
              canRedeem
                ? "bg-stpat-green hover:bg-stpat-emerald text-white"
                : "bg-[#1a3a1a] text-stpat-green/30"
            }`}
          >
            <Gift size={14} className="mr-1" /> Redeem
          </Button>
        )}
      </div>

      {/* Voucher */}
      {showVoucher && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="mt-3 p-3 rounded-xl bg-[#1a3a1a] border border-stpat-gold/20"
        >
          <p className="text-[10px] text-stpat-green/60 uppercase tracking-wider mb-1">
            Voucher Code
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono text-stpat-gold font-bold">
              {voucherCode}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(voucherCode)}
              className="p-1.5 rounded-lg bg-stpat-green/10 text-stpat-green hover:bg-stpat-green/20 transition-colors"
            >
              <Copy size={14} />
            </button>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-stpat-green/40">
            <Clock size={10} /> Expires in 30 minutes
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
