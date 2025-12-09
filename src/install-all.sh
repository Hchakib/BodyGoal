#!/bin/bash

# Script d'installation automatique de tous les packages
# Usage: chmod +x install-all.sh && ./install-all.sh

echo "🚀 Installation de toutes les dépendances BodyGoal..."

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour installer dans un dossier
install_in_folder() {
    FOLDER=$1
    echo -e "${BLUE}📦 Installation dans $FOLDER...${NC}"
    cd $FOLDER
    npm install
    cd - > /dev/null
    echo -e "${GREEN}✅ $FOLDER installé${NC}\n"
}

# API Gateway
install_in_folder "api-gateway"

# Services
install_in_folder "services/auth-service"
install_in_folder "services/workouts-service"
install_in_folder "services/nutrition-service"
install_in_folder "services/pr-service"
install_in_folder "services/templates-service"
install_in_folder "services/chatbot-service"

echo -e "${GREEN}✅ Toutes les dépendances sont installées !${NC}"
echo -e "\n${YELLOW}📝 Prochaines étapes :${NC}"
echo -e "   1. Configure les fichiers .env dans chaque service"
echo -e "   2. Lance les services avec: docker-compose up --build"
echo -e "   OU lance en mode dev: ./start-dev.sh"
