"use client";

import { useState } from "react";

const SHAMROCKS = ["🍀", "☘️", "🌿", "✨"];

interface Particle {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  emoji: string;
  opacity: number;
}

export default function ShamrockRain() {
  const [particles] = useState<Particle[]>(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 12 + Math.random() * 20,
      duration: 8 + Math.random() * 12,
      delay: Math.random() * 10,
      emoji: SHAMROCKS[Math.floor(Math.random() * SHAMROCKS.length)],
      opacity: 0.15 + Math.random() * 0.25,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="shamrock-particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
