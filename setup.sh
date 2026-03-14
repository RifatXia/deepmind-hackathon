#!/bin/bash
set -e

echo "🍀 ChiQuest Setup Script"
echo "========================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node.js 20+ first."
    echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "   nvm install 20"
    exit 1
fi

NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VER" -lt 18 ]; then
    echo "❌ Node.js $NODE_VER found, but 18+ required."
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check for .env.local
if [ ! -f .env.local ] || grep -q "your_gemini_api_key_here" .env.local 2>/dev/null; then
    echo ""
    echo "⚠️  Gemini API key not configured!"
    echo ""
    read -p "Enter your Gemini API key (from aistudio.google.com): " API_KEY
    if [ -n "$API_KEY" ]; then
        cat > .env.local << EOF
GEMINI_API_KEY=$API_KEY
NEXT_PUBLIC_APP_URL=https://chiquest.vercel.app
EOF
        echo "✅ API key saved to .env.local"
    else
        echo "⏭️  Skipping — app will work but AI postcards won't generate."
        echo "   Edit .env.local later with your key."
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start development:"
echo "   npm run dev"
echo ""
echo "🌐 To deploy to Vercel:"
echo "   npx vercel --prod"
echo ""
echo "🎭 Pro tip: Enable Demo Mode in the app header to"
echo "   simulate visits without being at the actual location."
echo ""
