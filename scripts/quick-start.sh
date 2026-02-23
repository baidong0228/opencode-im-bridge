#!/bin/bash
# ===========================================
# Quick start for opencode-im-bridge
# Usage: ./quick-start.sh [mode]
#   mode: official (default) | onebot
# ===========================================

set -e

MODE=${1:-official}

echo "🚀 Quick Start: opencode-im-bridge ($MODE mode)"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Install pnpm if needed
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build
echo "🔨 Building..."
pnpm build

# Create .env if not exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo ""
    echo "⚠️  Please edit .env and add your credentials:"
    echo ""
    if [ "$MODE" = "official" ]; then
        echo "   QQ_APP_ID=your_app_id"
        echo "   QQ_APP_SECRET=your_app_secret"
    else
        echo "   QQ_WS_URL=ws://localhost:3001"
    fi
    echo ""
    echo "Then run: pnpm start"
    exit 0
fi

# Start
echo "🎯 Starting opencode-im-bridge..."
pnpm start
