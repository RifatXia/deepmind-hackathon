"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Trophy, Gift, Compass } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Map", icon: Map },
  { href: "/quests", label: "Quests", icon: Compass },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/leaderboard", label: "Board", icon: Trophy },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0a1a0a]/95 backdrop-blur-lg border-t border-stpat-green/20">
      <div className="flex items-center justify-around max-w-lg mx-auto py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px] ${
                isActive
                  ? "text-stpat-shamrock bg-stpat-green/10 scale-105"
                  : "text-stpat-green/50 hover:text-stpat-green/80"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for mobile */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
