# ChiQuest 🍀 — Gamified Chicago Explorer

**St. Patrick's Day Edition** | DeepMind x Vibecoding Hackathon

A gamified PWA where tourists explore 12 iconic Chicago landmarks, take photos, get AI-generated art souvenirs powered by **Google Gemini**, earn XP, and collect badges.

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

## How It Works

### Game Flow
1. **Map View** — 12 curated Chicago landmarks displayed on a dark-themed interactive map
2. **Check In** — Visit a landmark and verify via GPS (or use Demo Mode for testing)
3. **Capture** — Take a photo using your phone camera or webcam
4. **Style Transfer** — Choose an art style (Picasso, Van Gogh, Cyberpunk, Art Deco, Cartoon, St. Pat's Magic)
5. **AI Souvenir** — Gemini transforms your photo into a unique AI art souvenir
6. **Collect** — Earn XP, unlock badges, climb tiers, and build your gallery

### Art Styles
| Style | Description |
|-------|-------------|
| 🎨 Picasso Cubism | Bold geometric cubist reimagining |
| 🌀 Van Gogh Swirls | Impressionist swirling brushstrokes |
| 🌆 Cyberpunk Neon | Futuristic neon-lit dystopia |
| ✨ Art Deco Gold | 1920s golden geometric elegance |
| 🎪 Chicago Cartoon | Fun illustrated cartoon style |
| 🍀 St. Pat's Magic | Festive green shamrock transformation |

### Landmarks (12 Curated)
- 🫘 Cloud Gate (The Bean) — Gold tier, 300 XP
- 🏙️ Willis Tower — Gold tier, 300 XP
- 🎡 Navy Pier — Silver tier, 220 XP
- 🎨 Art Institute of Chicago — Silver tier, 220 XP
- 🌳 Millennium Park — Silver tier, 220 XP
- 🌊 Chicago Riverwalk — Silver tier, 220 XP
- ⚾ Wrigley Field — Silver tier, 220 XP
- 🛍️ Magnificent Mile — Bronze tier, 150 XP
- ⛲ Buckingham Fountain — Bronze tier, 150 XP
- 🦕 Field Museum — Bronze tier, 150 XP
- 🐠 Shedd Aquarium — Bronze tier, 150 XP
- 🦁 Lincoln Park Zoo — Bronze tier, 150 XP

### XP Tiers
| Tier | XP Required | Badge |
|------|------------|-------|
| 🌱 Tourist | 0 | Starting tier |
| ☘️ Explorer | 300 | 2 spots visited |
| 🍀 Local | 800 | Half the landmarks |
| 💚 Native | 1500 | Most landmarks |
| 🏆 312 Legend | 2500 | Chicago master |

## Deploy to Vercel

### Option A: CLI (fastest)
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Option B: GitHub → Vercel
1. Push your repo to GitHub
2. Import at https://vercel.com/new
3. Add `GEMINI_API_KEY` in Vercel Dashboard → Settings → Environment Variables
4. Redeploy

## Prize Categories Targeted

| Category | How We Hit It |
|----------|--------------|
| **Best for Chicago** | 12 real iconic Chicago landmarks with fun facts, St. Patrick's Day river dyeing tradition |
| **Most Unexpected** | Multimodal AI: user photos + Gemini style transfer = unique art souvenirs |
| **Most Artistic** | 6 distinct art styles, shamrock animations, gold shimmer effects, dark-themed UI |
| **Crowd Favorite** | Confetti celebrations, gamification, sharable postcards, satisfying unlock flow |
| **Ship Ready** | PWA installable, Vercel deploy, real GPS, demo mode for judges, IndexedDB storage |

## Features

- 🗺️ Dark-themed interactive Leaflet map with 12 Chicago landmarks
- 📍 GPS-verified location check-ins (with demo mode override)
- 📸 Live camera capture (webcam + phone camera via getUserMedia)
- 🎨 6 AI art styles powered by Gemini multimodal (`gemini-2.5-flash-image`)
- 🤖 Style transfer: your photo → AI-generated art souvenir
- 🖼️ Profile gallery with all souvenirs (stored in IndexedDB)
- 🎊 Confetti + badge animations on unlock
- 📊 XP system with 5 tiers (Tourist → 312 Legend)
- 🍀 Lucky Quest: AI-generated bonus challenges
- 🎁 Reward redemption system
- 🏆 Leaderboard
- 📱 PWA — installable on any phone
- 🎭 Demo mode for testing without physical location

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS v4** + shadcn/ui
- **Framer Motion** for animations
- **Leaflet + react-leaflet** for dark-themed maps
- **Google Gemini** (`gemini-2.5-flash-image`) for multimodal AI image generation
- **IndexedDB** for large image storage (via `idb` library)
- **localStorage** for game state metadata
- **canvas-confetti** for celebration effects
- **getUserMedia API** for live camera capture

## Project Structure

```
├── app/
│   ├── page.tsx                    # Map home screen
│   ├── quests/page.tsx             # Quest list with all 12 landmarks
│   ├── spot/[id]/page.tsx          # Spot detail: check-in → camera → style → AI souvenir
│   ├── profile/page.tsx            # Player profile + souvenir gallery
│   ├── rewards/page.tsx            # XP redemption
│   ├── leaderboard/page.tsx        # Top players
│   └── api/
│       ├── landmarks/route.ts      # Serves curated Chicago landmarks
│       ├── generate-postcard/route.ts  # Basic Gemini postcard generation
│       ├── style-transfer/route.ts     # Multimodal: photo + style → AI art
│       └── generate-lucky-quest/route.ts # AI-generated bonus quests
├── components/
│   ├── MapView.tsx                 # Leaflet map with spot markers
│   ├── CameraCapture.tsx           # Live webcam/camera capture
│   ├── StyleSelector.tsx           # Art style picker (6 styles)
│   ├── PostcardDisplay.tsx         # AI souvenir display + download
│   ├── BottomNav.tsx               # 5-tab navigation
│   ├── BadgeModal.tsx              # Unlock celebration modal
│   ├── ShamrockRain.tsx            # Ambient shamrock particle effect
│   ├── XPBar.tsx                   # XP progress bar
│   ├── SpotCard.tsx                # Quest list card
│   ├── DemoToggle.tsx              # Demo mode switch
│   └── LuckyQuestCard.tsx          # AI quest card
├── lib/
│   ├── spots.ts                    # 12 curated landmarks + Spot types
│   ├── game-state.ts               # Game state (localStorage)
│   ├── image-store.ts              # Image storage (IndexedDB)
│   ├── art-styles.ts               # 6 art style definitions
│   ├── use-landmarks.ts            # React hook for landmark data
│   ├── lucky-quest.ts              # Lucky quest persistence
│   ├── badges.ts                   # Tier/badge system
│   ├── geo.ts                      # Geolocation helpers
│   └── gemini.ts                   # Gemini prompt helpers
└── public/
    ├── manifest.json               # PWA manifest
    └── icons/                      # App icons
```

---

*Built for Chicago's Vibecoding Hackathon | Google DeepMind x Forever22 x Outbound Collective x Drive Capital*
*St. Patrick's Day, March 2026 🍀*
