# 🍀 ChiQuest: Gamified Chicago Explorer
### St. Patrick's Day Edition — Vibecoding Hackathon Build Plan
> **Give this entire file to Claude Code and say: "Build this project exactly as described."**

---

## 🎯 Project Overview

**ChiQuest** is a St. Patrick's Day–themed gamified PWA (Progressive Web App) where tourists visit iconic Chicago landmarks, get AI-generated postcards powered by **Gemini 2.0 Flash / Imagen 3** on Google Cloud, earn points, and redeem them for dummy rewards (Starbucks, Burger King). Built with Next.js, deployed on Vercel, works on any phone like a native app.

**Target Hackathon Categories:**
- ✅ Best Chicago Energy
- ✅ Crowd Favorite
- ✅ Most Unexpected Use of Gemini
- ✅ Ready to Ship

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v3
- **Animations:** Framer Motion (formerly Framer Motion)
- **Confetti:** `canvas-confetti`
- **Icons:** `lucide-react`
- **Map:** `leaflet` + `react-leaflet` (dark themed)
- **UI Components:** `shadcn/ui`
- **PWA:** `next-pwa`

### Backend / AI
- **AI Image Generation:** Google Gemini 2.0 Flash (`gemini-2.0-flash-exp`) via Google AI SDK
  - Fallback: Imagen 3 via Vertex AI (GCP credits)
- **API Routes:** Next.js API Routes (`/app/api/`)
- **State:** React `useState` + `localStorage` (no DB needed for hackathon)

### Deployment
- **Hosting:** Vercel (free tier, instant deploy)
- **Environment:** `.env.local` → Vercel Dashboard env vars

---

## 📁 Folder Structure

```
chiquest/
├── app/
│   ├── layout.tsx              # Root layout with St. Patricks theme + PWA meta
│   ├── page.tsx                # Home / Map screen
│   ├── spot/[id]/page.tsx      # Individual spot detail + "I'm Here" button
│   ├── rewards/page.tsx        # Points → Rewards redemption screen
│   ├── leaderboard/page.tsx    # Global leaderboard (mock data)
│   └── api/
│       └── generate-postcard/
│           └── route.ts        # Gemini image + caption generation endpoint
├── components/
│   ├── SpotCard.tsx            # Location card with lock/unlock state
│   ├── XPBar.tsx               # Animated XP progress bar
│   ├── BadgeModal.tsx          # Pop-up badge award modal
│   ├── PostcardDisplay.tsx     # Generated AI postcard viewer
│   ├── BottomNav.tsx           # Mobile bottom navigation
│   ├── ShamrockRain.tsx        # Falling shamrock background animation
│   └── RewardCard.tsx          # Reward redemption card UI
├── lib/
│   ├── spots.ts                # Chicago POI data (coords, names, points)
│   ├── badges.ts               # Badge definitions and unlock conditions
│   ├── gemini.ts               # Gemini API helper functions
│   └── geo.ts                  # Geolocation + distance calculation utils
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── icons/                  # App icons (192x192, 512x512) — shamrock themed
│   └── sounds/
│       └── unlock.mp3          # Satisfying unlock sound (optional)
├── styles/
│   └── globals.css             # St. Patricks green theme variables
├── .env.local                  # API keys (never commit)
├── next.config.mjs             # Next.js + PWA config
└── tailwind.config.ts          # Custom St. Patricks color palette
```

---

## 🗺️ Chicago POI Data

Hard-code these 6 spots in `lib/spots.ts`:

```typescript
export const SPOTS = [
  {
    id: "bean",
    name: "Cloud Gate (The Bean)",
    emoji: "🫘",
    description: "Chicago's most iconic landmark — the mirrored bean in Millennium Park.",
    lat: 41.8827,
    lng: -87.6233,
    points: 200,
    radius: 150, // meters
    badge: "Bean Seeker 🫘",
    tier: "bronze",
    geminiPrompt: "Create a vibrant St. Patrick's Day postcard of Cloud Gate (The Bean) in Chicago's Millennium Park, with green shamrocks, festive lighting, and a tourist celebrating. Watercolor style, joyful."
  },
  {
    id: "riverwalk",
    name: "Chicago Riverwalk",
    emoji: "🌊",
    description: "The famous river dyed green every St. Patrick's Day.",
    lat: 41.8876,
    lng: -87.6270,
    points: 150,
    radius: 200,
    badge: "River Walker 🌊",
    tier: "bronze",
    geminiPrompt: "A St. Patrick's Day postcard of the Chicago River dyed bright green, with boats and cheering crowds, shamrocks floating. Vibrant digital art style."
  },
  {
    id: "wrigley-field",
    name: "Wrigley Field",
    emoji: "⚾",
    description: "Home of the Chicago Cubs — a shrine for sports lovers.",
    lat: 41.9484,
    lng: -87.6553,
    points: 250,
    radius: 200,
    badge: "Cubbie Fan ⚾",
    tier: "silver",
    geminiPrompt: "A whimsical St. Patrick's Day postcard of Wrigley Field in Chicago at sunset, with green ivy on the brick walls, shamrocks everywhere, leprechaun in a Cubs hat. Illustrated style."
  },
  {
    id: "navy-pier",
    name: "Navy Pier",
    emoji: "🎡",
    description: "The iconic Ferris wheel on Lake Michigan.",
    lat: 41.8919,
    lng: -87.6051,
    points: 200,
    radius: 200,
    badge: "Pier Pioneer 🎡",
    tier: "silver",
    geminiPrompt: "Festive St. Patrick's Day postcard of Navy Pier Chicago with a Ferris wheel glowing green against twilight, fireworks, Lake Michigan shimmering. Dreamy illustration."
  },
  {
    id: "willis-tower",
    name: "Willis Tower Skydeck",
    emoji: "🏙️",
    description: "Stand 1,353 feet above the city in the glass ledge.",
    lat: 41.8789,
    lng: -87.6359,
    points: 300,
    radius: 150,
    badge: "Sky Conqueror 🏙️",
    tier: "gold",
    geminiPrompt: "An epic St. Patrick's Day postcard from the top of Willis Tower Chicago — green shamrock confetti falling over the skyline at dusk. Cinematic, awe-inspiring."
  },
  {
    id: "art-institute",
    name: "Art Institute of Chicago",
    emoji: "🎨",
    description: "World-class art museum on Michigan Avenue.",
    lat: 41.8796,
    lng: -87.6237,
    points: 200,
    radius: 150,
    badge: "Culture Vulture 🎨",
    tier: "silver",
    geminiPrompt: "A charming St. Patrick's Day postcard of the Art Institute of Chicago lion statues wearing tiny green hats, shamrocks around the entrance. Playful watercolor."
  }
]
```

---

## 🌿 St. Patrick's Day Theme

### Tailwind Config (`tailwind.config.ts`)
```typescript
colors: {
  stpat: {
    green: "#16a34a",       // Primary green
    darkgreen: "#14532d",   // Dark green (backgrounds)
    gold: "#ca8a04",        // Gold accents (XP bar, badges)
    cream: "#fefce8",       // Light background
    emerald: "#059669",     // Button hover states
    shamrock: "#22c55e",    // Bright shamrock green
  }
}
```

### Global CSS Variables (`styles/globals.css`)
```css
:root {
  --background: #0f1f0f;        /* Deep dark green */
  --foreground: #f0fdf4;        /* Soft white */
  --card: #1a2e1a;              /* Card background */
  --border: #16a34a;            /* Borders */
  --accent: #ca8a04;            /* Gold accents */
}
```

### ShamrockRain Component
Create an animated background with falling shamrock emojis using CSS keyframes — 15–20 shamrocks at random positions with random fall speeds. Use `position: fixed`, `pointer-events: none`, `z-index: 0` so it never interferes with UI. This runs on every screen for immersive atmosphere.

---

## 🎮 Gamification System

### Points & XP
```typescript
// lib/badges.ts
export const TIERS = [
  { name: "Tourist",        min: 0,    emoji: "🗺️",  color: "gray" },
  { name: "Explorer",       min: 200,  emoji: "🧭",  color: "green" },
  { name: "Local",          min: 500,  emoji: "🏙️",  color: "blue" },
  { name: "Chi-Insider",    min: 900,  emoji: "⭐",  color: "purple" },
  { name: "312 Legend",     min: 1300, emoji: "👑",  color: "gold" },
]
```

### Badges (awarded on spot unlock)
Each spot awards a unique badge. Show a full-screen BadgeModal with:
- Scale-up animation (Framer Motion spring)
- Gold shimmer border effect
- Badge name + description
- "Share" button (copy to clipboard)

### Confetti on Unlock
```typescript
// In spot unlock handler
import confetti from 'canvas-confetti'

// St. Patrick's Day green + gold confetti
confetti({
  particleCount: 120,
  spread: 90,
  colors: ['#16a34a', '#22c55e', '#ca8a04', '#fbbf24', '#ffffff'],
  origin: { y: 0.6 }
})
```

### XP Bar Animation
Use Framer Motion `animate={{ width: \`${percent}%\` }}` with `transition={{ duration: 0.8, ease: "easeOut" }}` for a satisfying fill animation after each point gain.

---

## 📱 Screen Designs

### 1. Home / Map Screen (`/`)
- Full-screen Leaflet map with dark green Chicago tile
- 6 location pins: 🔒 locked (gray) → ✅ unlocked (glowing green)
- Bottom card sheet showing:
  - User tier badge + name
  - Animated XP bar
  - "X of 6 collected" progress
- Bottom navigation: Map | Quests | Rewards | Profile

### 2. Quest List Screen (alternative view)
- Scrollable list of all 6 spots
- Each SpotCard shows:
  - Spot emoji + name
  - Points value badge
  - Lock state (grayed out if not visited)
  - Tier indicator (bronze/silver/gold border color)
  - Distance from current location (e.g., "0.3 mi away")

### 3. Spot Detail Screen (`/spot/[id]`)
- Hero image (AI-generated postcard if unlocked, stock Chicago photo if locked)
- Spot name, description, points value
- GPS status indicator: "📍 Checking your location..."
- **"I'm Here! 🍀"** — large green CTA button
  - On tap: request geolocation → check radius
  - If in range: trigger unlock flow
  - If out of range: show "You're X meters away — get closer!"
  - [DEMO MODE]: Add a small "🎭 Demo Unlock" button for judges not physically at the location

### 4. Unlock Flow (full screen takeover)
```
[Step 1] Loading animation: "🔮 Generating your AI Postcard..."
         Spinning shamrock + shimmer skeleton

[Step 2] Confetti burst 🎊
         "YOU UNLOCKED [SPOT NAME]!" in large text

[Step 3] AI Postcard displayed:
         - Generated image (Gemini 2.0 Flash)
         - Generated caption below
         - Tier badge animation

[Step 4] Points counter ticks up (+200 XP) with sound

[Step 5] Share Card option:
         "I just visited The Bean! 🫘 +200 XP on ChiQuest 🍀
          Play at: chiquest.vercel.app"
```

### 5. Rewards Screen (`/rewards`)
Display dummy rewards with a "Redeem" flow:

| Reward | Points Required |
|--------|----------------|
| ☕ Starbucks $5 Gift Card | 300 pts |
| 🍔 Burger King Free Whopper | 200 pts |
| 🍕 Lou Malnati's Deep Dish Slice | 400 pts |
| 🎟️ Navy Pier Ferris Wheel Ticket | 250 pts |
| 🏆 ChiQuest Champion Trophy NFT | 1300 pts |

On "Redeem": show a modal with a dummy voucher code (e.g., `CHIQUEST-STBX-4823`), countdown timer (expires in 30 min), and a "Copy Code" button. This is all fake for demo — pitch it as "next step: integrate Tango/Giftbit API for real gift card delivery."

### 6. Leaderboard Screen (`/leaderboard`)
- Show top 10 players (use hardcoded mock data + current user)
- Rank badges: 🥇🥈🥉
- Current user row highlighted in green
- Animated entry when page loads (staggered Framer Motion list)

---

## 🤖 Gemini API Integration

### API Route (`/app/api/generate-postcard/route.ts`)
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(req: Request) {
  const { spotId, prompt } = await req.json()

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

  // Use gemini-2.0-flash-exp for image generation
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
    generationConfig: {
      responseModalities: ["Text", "Image"],
    } as any,
  })

  const result = await model.generateContent([
    prompt + " High quality, festive, shareable postcard format. 1:1 ratio."
  ])

  // Extract image and text from response
  let imageBase64 = null
  let caption = ""

  for (const part of result.response.candidates[0].content.parts) {
    if (part.inlineData) {
      imageBase64 = part.inlineData.data  // base64 PNG
    } else if (part.text) {
      caption = part.text
    }
  }

  // Fallback caption if none generated
  if (!caption) {
    caption = getCaptionForSpot(spotId)
  }

  return Response.json({ imageBase64, caption })
}

function getCaptionForSpot(spotId: string): string {
  const captions: Record<string, string> = {
    bean: "You stood beneath the silver orb — Chicago salutes you! 🫘🍀",
    riverwalk: "You walked the green river — a St. Pat's legend is born! 🌊☘️",
    "wrigley-field": "Wrigley's brick walls whispered your name. Cubs fan forever! ⚾🍀",
    "navy-pier": "The Ferris wheel spun just for you, explorer! 🎡✨",
    "willis-tower": "You touched the sky. Chicago is yours. 🏙️👑",
    "art-institute": "Culture unlocked. The lions bow to thee! 🎨🦁",
  }
  return captions[spotId] || "Chicago welcomes its newest legend! 🍀"
}
```

### Fallback Strategy
If Gemini image generation fails or is slow:
1. First: Try `gemini-2.0-flash-exp` with image modality
2. Fallback: Call Imagen 3 on Vertex AI (GCP credits)
3. Last resort: Show a beautiful styled text-only postcard card with CSS gradients + spot emoji — still looks polished

---

## ⚙️ Environment Setup (Ubuntu)

### 1. Prerequisites
```bash
# Install Node.js 20+ via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# Verify
node -v   # should be v20.x.x
npm -v
```

### 2. Create Project
```bash
npx create-next-app@latest chiquest \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias "@/*"

cd chiquest
```

### 3. Install All Dependencies
```bash
# Core UI & animation
npm install framer-motion canvas-confetti lucide-react

# shadcn/ui setup
npx shadcn@latest init
npx shadcn@latest add button card badge progress dialog sheet

# Map
npm install leaflet react-leaflet
npm install --save-dev @types/leaflet

# PWA
npm install next-pwa
npm install --save-dev @types/next-pwa

# Google AI
npm install @google/generative-ai

# Utilities
npm install clsx tailwind-merge
```

### 4. Environment Variables
Create `.env.local` in project root:
```env
# Gemini API Key (from Google AI Studio: aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Maps (optional, for accurate map tiles)
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_maps_key_here

# App URL (update after Vercel deploy)
NEXT_PUBLIC_APP_URL=https://chiquest.vercel.app
```

To get your Gemini API key:
1. Go to https://aistudio.google.com
2. Click "Get API Key" → "Create API Key"
3. Select your GCP project (use the one with credits)
4. Copy key into `.env.local`

### 5. PWA Configuration (`next.config.mjs`)
```javascript
import withPWAInit from "next-pwa"

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
}

export default withPWA(nextConfig)
```

### 6. PWA Manifest (`public/manifest.json`)
```json
{
  "name": "ChiQuest 🍀",
  "short_name": "ChiQuest",
  "description": "Gamified Chicago exploration — St. Patrick's Day Edition",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f1f0f",
  "theme_color": "#16a34a",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Generate icons:** Use https://favicon.io — create a shamrock 🍀 emoji icon at 192px and 512px, save to `public/icons/`.

### 7. Run Locally
```bash
npm run dev
# App available at http://localhost:3000
# Open in phone browser via your local IP: http://192.168.x.x:3000
```

---

## 🚀 Deployment to Vercel

### Option A: CLI (Fastest — 2 minutes)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from project root
vercel --prod

# When prompted:
# - Link to existing project? No
# - Project name: chiquest
# - Which directory? ./
# - Override settings? No
```

### Option B: GitHub → Vercel (Recommended)
```bash
# Push to GitHub
git init
git add .
git commit -m "🍀 ChiQuest initial build"
gh repo create chiquest --public --push
```
Then:
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Click Deploy → Done!

### Add Environment Variables on Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these:
   - `GEMINI_API_KEY` = your key (Production + Preview + Development)
   - `NEXT_PUBLIC_APP_URL` = https://chiquest.vercel.app
3. Click Save → Redeploy

### Generate QR Code for Demo
After deploy, go to https://qr.io and generate a QR code for your Vercel URL. Print it or show on screen — judges scan and install as PWA instantly.

---

## 🎭 Demo Mode (CRITICAL for Hackathon)

Since judges won't physically be at Chicago landmarks, add a **Demo Mode toggle**:

```typescript
// In each spot page, add below the main CTA:
{isDemoMode && (
  <button
    onClick={handleDemoUnlock}
    className="text-xs text-green-400 underline mt-2"
  >
    🎭 Demo: Simulate Visit
  </button>
)}
```

Add a global demo mode toggle in the header (small shamrock button). When enabled, the "I'm Here" button works without GPS verification. This lets judges experience the full unlock → confetti → AI postcard flow from anywhere.

---

## ⏱️ 2-Hour Build Timeline

| Time | Task |
|------|------|
| 0–10 min | Create Next.js project, install all dependencies |
| 10–20 min | Set up Tailwind theme (green colors), global CSS, ShamrockRain component |
| 20–35 min | Build `lib/spots.ts`, `lib/geo.ts`, `lib/gemini.ts` |
| 35–55 min | Build Home screen with Leaflet map + spot pins |
| 55–75 min | Build Spot Detail page + geolocation check + Demo mode |
| 75–95 min | Build Gemini API route + PostcardDisplay + confetti + BadgeModal |
| 95–105 min | Build Rewards screen (static/dummy) + Bottom Nav |
| 105–115 min | PWA manifest + icons + next-pwa config |
| 115–120 min | Deploy to Vercel + add env vars + generate QR code |

---

## 🏆 Pitch Talking Points

1. **Best Chicago Energy:** "We turned Chicago's most iconic landmarks into a scavenger hunt — celebrating St. Patrick's Day, the city's biggest green moment."
2. **Most Unexpected Use of Gemini:** "Every location visit triggers a unique AI-generated postcard — Gemini 2.0 Flash creates a custom piece of art just for that tourist, at that moment."
3. **Crowd Favorite:** "It's sharable, it's beautiful, it has confetti. Everyone who plays wants to show their friends the postcard they got."
4. **Ready to Ship:** "Deploy to Vercel, works as a native app on any phone via PWA install. Real rewards integration takes one API call to Tango/Giftbit."
5. **Drive Capital Angle:** "This is a scalable tourism tech play — take the model to any city, any event. Built in Chicago, made for the Midwest."

---

## 🔮 Future Extensions (mention in pitch)

- Real reward integration via Tango Card API (supports Starbucks, BK, Amazon)
- AR overlay at each spot via WebXR
- Social feed: see other players' AI postcards
- Corporate sponsorship: "Visit Starbucks Michigan Ave → unlock exclusive reward"
- Multi-city expansion: NYC, LA, New Orleans

---

*Built for Chicago's first Vibecoding Hackathon | Google DeepMind × Forever22 × Outbound Collective × Drive Capital*
*St. Patrick's Day, March 2026 🍀*
