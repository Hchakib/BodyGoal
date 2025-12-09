#!/bin/bash

# Script pour vérifier que tous les fichiers .env existent et sont configurés
# Usage: chmod +x check-env.sh && ./check-env.sh

echo "🔍 Vérification des fichiers .env..."
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

MISSING=0
INCOMPLETE=0

# Fonction pour vérifier un .env
check_env() {
    FILE=$1
    REQUIRED_VARS=$2
    
    if [ ! -f "$FILE" ]; then
        echo -e "${RED}❌ $FILE - MANQUANT${NC}"
        ((MISSING++))
        return
    fi
    
    # Vérifier les variables requises
    INCOMPLETE_VARS=""
    for VAR in $REQUIRED_VARS; do
        if ! grep -q "^$VAR=" "$FILE" 2>/dev/null; then
            INCOMPLETE_VARS="$INCOMPLETE_VARS $VAR"
        elif grep -q "^$VAR=.*VOTRE.*ICI" "$FILE" 2>/dev/null; then
            INCOMPLETE_VARS="$INCOMPLETE_VARS $VAR"
        fi
    done
    
    if [ -n "$INCOMPLETE_VARS" ]; then
        echo -e "${YELLOW}⚠️  $FILE - INCOMPLET (manque:$INCOMPLETE_VARS)${NC}"
        ((INCOMPLETE++))
    else
        echo -e "${GREEN}✅ $FILE - OK${NC}"
    fi
}

# Vérifier .env racine
check_env ".env" "VITE_API_BASE_URL VITE_FIREBASE_API_KEY VITE_FIREBASE_PROJECT_ID"

# Vérifier API Gateway
check_env "api-gateway/.env" "PORT AUTH_SERVICE_URL WORKOUTS_SERVICE_URL"

# Vérifier les services
check_env "services/auth-service/.env" "PORT FIREBASE_PROJECT_ID FIREBASE_PRIVATE_KEY FIREBASE_CLIENT_EMAIL"
check_env "services/workouts-service/.env" "PORT FIREBASE_PROJECT_ID FIREBASE_PRIVATE_KEY FIREBASE_CLIENT_EMAIL"
check_env "services/nutrition-service/.env" "PORT FIREBASE_PROJECT_ID FIREBASE_PRIVATE_KEY FIREBASE_CLIENT_EMAIL"
check_env "services/pr-service/.env" "PORT FIREBASE_PROJECT_ID FIREBASE_PRIVATE_KEY FIREBASE_CLIENT_EMAIL"
check_env "services/templates-service/.env" "PORT FIREBASE_PROJECT_ID FIREBASE_PRIVATE_KEY FIREBASE_CLIENT_EMAIL"
check_env "services/chatbot-service/.env" "PORT FIREBASE_PROJECT_ID FIREBASE_PRIVATE_KEY FIREBASE_CLIENT_EMAIL OPENAI_API_KEY"

echo ""
echo "📊 Résumé :"
echo "=========="

if [ $MISSING -eq 0 ] && [ $INCOMPLETE -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les fichiers .env sont OK !${NC}"
    echo ""
    echo "🚀 Tu peux lancer : docker-compose up --build"
elif [ $MISSING -gt 0 ]; then
    echo -e "${RED}❌ $MISSING fichier(s) .env manquant(s)${NC}"
    echo ""
    echo "💡 Lance : chmod +x setup-env-simple.sh && ./setup-env-simple.sh"
elif [ $INCOMPLETE -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $INCOMPLETE fichier(s) .env incomplet(s)${NC}"
    echo ""
    echo "💡 Édite les fichiers marqués ⚠️  et remplace les valeurs par défaut"
    echo "📖 Voir OBTENIR_CLES_FIREBASE.md pour plus d'infos"
fi

echo ""
