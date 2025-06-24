#!/bin/bash

# ─────────────────────────────────────────────
# Script : restart-metro.sh
# 📚 Description : Kill + relance Metro Bundler (React Native)
# 🖥️ Usage : ./restart-metro.sh
# ─────────────────────────────────────────────

# 1. Kill tous les process Metro
echo "🔪 Arrêt de tous les serveurs Metro (node)..."
killall -9 node 2>/dev/null

# 2. Petite pause
sleep 1

# 3. Relance Metro
echo "🚀 Redémarrage de Metro Bundler..."
npx expo start 