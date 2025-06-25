#!/bin/bash

# ═══════════════════════════════════════════════════════
# 🧪 Script de simulation mode offline - iOS Simulator
# ═══════════════════════════════════════════════════════
# Usage: ./offline-simulator.sh [on|off|auto]
# Version: 1.0 - 2025-01-21
# ═══════════════════════════════════════════════════════

set -e

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher avec couleur
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Détecter l'ID du simulateur booted
get_device_id() {
    local device_id=$(xcrun simctl list devices | grep "Booted" | head -1 | grep -o '\([A-F0-9-]*\)')
    if [ -z "$device_id" ]; then
        error "Aucun simulateur iOS en cours d'exécution. Lancez d'abord un simulateur."
    fi
    echo "$device_id"
}

# Activer mode offline
enable_offline() {
    local device_id=$1
    log "Activation du mode offline..."
    
    xcrun simctl status_bar "$device_id" override \
        --wifiMode "failed" \
        --wifiBars 0 \
        --cellularMode "failed" \
        --cellularBars 0 \
        --dataNetwork "hide"
    
    success "Mode offline activé sur $device_id"
    echo
    warning "🧪 Maintenant vous pouvez :"
    echo "   1. Lancer vos tests NetworkQueue"
    echo "   2. Tester les messages chat offline" 
    echo "   3. Observer la mise en queue"
    echo
    echo "📋 Pour désactiver: $0 off"
}

# Désactiver mode offline
disable_offline() {
    local device_id=$1
    log "Désactivation du mode offline..."
    
    xcrun simctl status_bar "$device_id" clear
    
    success "Mode offline désactivé sur $device_id"
    echo
    success "🔄 La synchronisation automatique devrait commencer"
    echo "📊 Observez les logs pour confirmer l'envoi des messages"
}

# Mode automatique avec prompt
auto_mode() {
    local device_id=$1
    
    echo
    log "🧪 Mode de test automatique NetworkQueue"
    echo "════════════════════════════════════════"
    echo
    
    # Étape 1: Activer offline
    log "Étape 1/4: Activation mode offline"
    enable_offline "$device_id"
    
    echo "📱 Appuyez sur ENTRÉE quand vous avez lancé vos tests..."
    read -r
    
    # Étape 2: Attendre tests
    log "Étape 2/4: Tests en cours..."
    echo "⏳ Laissez le temps aux tests de s'exécuter"
    echo "📊 Vérifiez que les messages sont bien mis en queue"
    echo
    echo "📱 Appuyez sur ENTRÉE pour rétablir la connexion..."
    read -r
    
    # Étape 3: Rétablir connexion
    log "Étape 3/4: Rétablissement de la connexion"
    disable_offline "$device_id"
    
    # Étape 4: Observer sync
    log "Étape 4/4: Observation de la synchronisation"
    echo "🔍 Surveillez les logs pour confirmer:"
    echo "   - 📤 Envoi automatique des messages"
    echo "   - ✅ Réponses de l'API" 
    echo "   - 📊 Queue vidée"
    echo
    success "🎉 Test automatique terminé !"
}

# Afficher l'aide
show_help() {
    echo
    echo "🧪 Script de simulation mode offline"
    echo "════════════════════════════════════════"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  on      Activer le mode offline"
    echo "  off     Désactiver le mode offline"  
    echo "  auto    Mode automatique avec guide"
    echo "  help    Afficher cette aide"
    echo
    echo "Examples:"
    echo "  $0 on        # Active le mode offline"
    echo "  $0 auto      # Guide complet de test"
    echo "  $0 off       # Désactive le mode offline"
    echo
}

# Main
main() {
    local command=${1:-help}
    
    case $command in
        "on")
            local device_id=$(get_device_id)
            enable_offline "$device_id"
            ;;
        "off") 
            local device_id=$(get_device_id)
            disable_offline "$device_id"
            ;;
        "auto")
            local device_id=$(get_device_id)
            auto_mode "$device_id"
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Vérifier dépendances
if ! command -v xcrun &> /dev/null; then
    error "xcrun non trouvé. Ce script nécessite Xcode."
fi

# Lancer le script
main "$@"