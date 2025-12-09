#!/bin/bash

# Script interactif pour configurer tous les fichiers .env
# Usage: chmod +x setup-env.sh && ./setup-env.sh

echo "🔧 Configuration des fichiers .env pour BodyGoal"
echo "================================================"
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Demander les informations Firebase
echo -e "${BLUE}📝 Informations Firebase :${NC}"
echo ""
read -p "Firebase Project ID [bodygoal-4213e]: " FIREBASE_PROJECT_ID
FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID:-bodygoal-4213e}

read -p "Firebase Client Email: " FIREBASE_CLIENT_EMAIL

echo ""
echo -e "${YELLOW}⚠️  Pour la clé privée, copie TOUT le contenu entre guillemets depuis ton fichier JSON Firebase${NC}"
echo -e "${YELLOW}   Exemple: \"-----BEGIN PRIVATE KEY-----\\nMIIEvQ...\\n-----END PRIVATE KEY-----\\n\"${NC}"
echo ""
read -p "Firebase Private Key (avec guillemets): " FIREBASE_PRIVATE_KEY

# Demander la clé OpenAI
echo ""
echo -e "${BLUE}🤖 Clé OpenAI (pour le chatbot) :${NC}"
read -p "OpenAI API Key: " OPENAI_API_KEY

# Fonction pour créer un fichier .env
create_env_file() {
    SERVICE_PATH=$1
    SERVICE_PORT=$2
    SERVICE_NAME=$3
    
    ENV_FILE="$SERVICE_PATH/.env"
    
    echo "PORT=$SERVICE_PORT" > $ENV_FILE
    echo "NODE_ENV=development" >> $ENV_FILE
    echo "" >> $ENV_FILE
    echo "# Firebase Configuration" >> $ENV_FILE
    echo "FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID" >> $ENV_FILE
    echo "FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY" >> $ENV_FILE
    echo "FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL" >> $ENV_FILE
    
    # Ajouter OpenAI uniquement pour le chatbot
    if [ "$SERVICE_NAME" = "Chatbot" ]; then
        echo "" >> $ENV_FILE
        echo "# OpenAI Configuration" >> $ENV_FILE
        echo "OPENAI_API_KEY=$OPENAI_API_KEY" >> $ENV_FILE
        echo "OPENAI_MODEL=gpt-4o-mini" >> $ENV_FILE
    fi
    
    echo -e "${GREEN}✅ $SERVICE_NAME Service (.env créé)${NC}"
}

# Créer le .env de l'API Gateway
echo "" >> api-gateway/.env
echo "PORT=3000" > api-gateway/.env
echo "NODE_ENV=development" >> api-gateway/.env
echo "" >> api-gateway/.env
echo "# URLs des microservices (Docker)" >> api-gateway/.env
echo "AUTH_SERVICE_URL=http://auth-service:3001" >> api-gateway/.env
echo "WORKOUTS_SERVICE_URL=http://workouts-service:3002" >> api-gateway/.env
echo "NUTRITION_SERVICE_URL=http://nutrition-service:3003" >> api-gateway/.env
echo "PR_SERVICE_URL=http://pr-service:3004" >> api-gateway/.env
echo "TEMPLATES_SERVICE_URL=http://templates-service:3005" >> api-gateway/.env
echo "CHATBOT_SERVICE_URL=http://chatbot-service:3006" >> api-gateway/.env

echo ""
echo -e "${BLUE}🔧 Création des fichiers .env...${NC}"
echo ""

# Créer tous les fichiers .env des services
create_env_file "services/auth-service" 3001 "Auth"
create_env_file "services/workouts-service" 3002 "Workouts"
create_env_file "services/nutrition-service" 3003 "Nutrition"
create_env_file "services/pr-service" 3004 "PR"
create_env_file "services/templates-service" 3005 "Templates"
create_env_file "services/chatbot-service" 3006 "Chatbot"

echo -e "${GREEN}✅ API Gateway (.env créé)${NC}"

echo ""
echo -e "${GREEN}🎉 Tous les fichiers .env ont été créés avec succès !${NC}"
echo ""
echo -e "${YELLOW}📝 Prochaines étapes :${NC}"
echo -e "   1. Vérifie les fichiers .env créés"
echo -e "   2. Lance les services: ${BLUE}docker-compose up --build${NC}"
echo -e "   3. Teste les health checks: ${BLUE}node test-health.js${NC}"
