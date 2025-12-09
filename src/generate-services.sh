#!/bin/bash

# Script pour générer automatiquement tous les fichiers des microservices
# Usage: chmod +x generate-services.sh && ./generate-services.sh

echo "🚀 Génération de la structure microservices BodyGoal..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour créer la structure d'un service
create_service_structure() {
    SERVICE_NAME=$1
    PORT=$2
    
    echo -e "${BLUE}📦 Création de ${SERVICE_NAME}...${NC}"
    
    mkdir -p services/${SERVICE_NAME}/src/{config,routes,controllers,services,middleware,types}
    
    echo -e "${GREEN}✅ Structure créée pour ${SERVICE_NAME}${NC}"
}

# Créer les structures de tous les services
create_service_structure "nutrition-service" 3003
create_service_structure "pr-service" 3004
create_service_structure "templates-service" 3005
create_service_structure "chatbot-service" 3006

echo -e "\n${GREEN}✅ Toutes les structures de services ont été créées !${NC}"
echo -e "\n📝 Prochaines étapes :"
echo -e "   1. Copier les .env.example vers .env dans chaque service"
echo -e "   2. Remplir les variables Firebase"
echo -e "   3. Lancer: docker-compose up --build"
