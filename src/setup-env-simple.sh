#!/bin/bash

# Script simple pour copier tous les .env.example vers .env
# Usage: chmod +x setup-env-simple.sh && ./setup-env-simple.sh

echo "🔧 Copie des fichiers .env.example vers .env..."
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour copier un .env
copy_env() {
    SOURCE=$1
    DEST=$2
    
    if [ -f "$SOURCE" ]; then
        cp "$SOURCE" "$DEST"
        echo -e "${GREEN}✅ $DEST créé${NC}"
    else
        echo -e "${YELLOW}⚠️  $SOURCE n'existe pas - création ignorée${NC}"
    fi
}

# Root
copy_env ".env.example" ".env"

# API Gateway
copy_env "api-gateway/.env.example" "api-gateway/.env"

# Services
copy_env "services/auth-service/.env.example" "services/auth-service/.env"
copy_env "services/workouts-service/.env.example" "services/workouts-service/.env"
copy_env "services/nutrition-service/.env.example" "services/nutrition-service/.env"
copy_env "services/pr-service/.env.example" "services/pr-service/.env"
copy_env "services/templates-service/.env.example" "services/templates-service/.env"
copy_env "services/chatbot-service/.env.example" "services/chatbot-service/.env"

echo ""
echo -e "${GREEN}🎉 Tous les fichiers .env ont été créés !${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT : Tu dois maintenant éditer ces fichiers pour ajouter :${NC}"
echo "   1. Les clés Firebase (PROJECT_ID, PRIVATE_KEY, CLIENT_EMAIL)"
echo "      👉 Va sur https://console.firebase.google.com"
echo "      👉 Project Settings > Service Accounts > Generate new private key"
echo ""
echo "   2. La clé OpenAI (dans chatbot-service/.env)"
echo "      👉 Va sur https://platform.openai.com/api-keys"
echo ""
echo "📝 Fichiers à éditer :"
echo "   - .env (frontend - Firebase client config)"
echo "   - api-gateway/.env (URLs des services)"
echo "   - services/auth-service/.env (Firebase Admin)"
echo "   - services/workouts-service/.env (Firebase Admin)"
echo "   - services/nutrition-service/.env (Firebase Admin)"
echo "   - services/pr-service/.env (Firebase Admin)"
echo "   - services/templates-service/.env (Firebase Admin)"
echo "   - services/chatbot-service/.env (Firebase Admin + OpenAI)"
echo ""
echo "Voir START_HERE.md pour plus de détails."