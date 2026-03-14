# ChiQuest 🍀 — Gamified Chicago Explorer

**St. Patrick's Day Edition** | DeepMind x Vibecoding Hackathon

A gamified PWA where tourists visit iconic Chicago landmarks, get AI-generated postcards powered by **Gemini 2.0 Flash**, earn XP, and redeem rewards.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API key
cp .env.local.example .env.local
# Edit .env.local and add your key from https://aistudio.google.com

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

Or use the setup script:
```bash
chmod +x setup.sh && ./setup.sh
```

## Setup From Scratch

### Prerequisites
- Node.js 20+ (`node -v`)
- npm 9+ (`npm -v`)

### Get Gemini API Key
1. Go to https://aistudio.google.com
2. Click "Get API Key" → "Create API Key"
3. Copy key into `.env.local` as `GEMINI_API_KEY`

### Environment Variables
Create `.env.local`:
```
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=https://chiquest.vercel.app
```

## Deploy to Vercel

### Option A: CLI (fastest)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B: GitHub → Vercel
```bash
git add . && git commit -m "ChiQuest build"
gh repo create chiquest --public --push
```
Then import at https://vercel.com/new

### After Deploying
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `GEMINI_API_KEY` = your key
3. Redeploy

## Prize Categories Targeted

| Category | How We Hit It |
|----------|--------------|
| **Best for Chicago** | 6 real Chicago landmarks, local culture, St. Patrick's Day tradition |
| **Most Unexpected** | AI-generated postcards at each landmark via Gemini 2.0 Flash |
| **Most Artistic** | Unique AI art per visit, shamrock animations, gold shimmer effects |
| **Crowd Favorite** | Confetti, gamification, sharable postcards, satisfying unlock flow |
| **Ship Ready** | PWA, Vercel deploy, real GPS, demo mode for judges |

## Features

- 🗺️ Dark-themed interactive map with all 6 Chicago spots
- 📍 GPS-verified location check-ins (with demo mode override)
- 🤖 AI-generated postcards via Gemini 2.0 Flash
- 🎊 Confetti + badge animations on unlock
- 📊 XP system with 5 tiers (Tourist → 312 Legend)
- 🎁 Reward redemption with voucher codes
- 🏆 Leaderboard with mock players
- 📱 PWA — installable on any phone
- 🎭 Demo mode for judges not physically at locations

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS** + shadcn/ui
- **Framer Motion** for animations
- **Leaflet** for maps
- **Gemini 2.0 Flash** for AI postcard generation
- **canvas-confetti** for celebration effects
- **localStorage** for game state (no DB needed)

## Project Structure

```
├── app/
│   ├── page.tsx              # Map home screen
│   ├── quests/page.tsx       # Quest list
│   ├── spot/[id]/page.tsx    # Spot detail + unlock flow
│   ├── rewards/page.tsx      # XP redemption
│   ├── leaderboard/page.tsx  # Top players
│   └── api/generate-postcard/route.ts
├── components/               # UI components
├── lib/                      # Data, helpers, game state
└── public/                   # Icons, manifest
```

---

*Built for Chicago's Vibecoding Hackathon | Google DeepMind x Forever22 x Outbound Collective x Drive Capital*
*St. Patrick's Day, March 2026 🍀*
