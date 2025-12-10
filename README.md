
# Bodygoal – Monorepo (Frontend + Gateway + Microservices)

## Structure
- `src/` : app React/Vite (frontend).
- `gateway/` : API Gateway Express (proxy vers les services).
- `services/` : microservices Node/Express (`auth`, `workouts`, `nutrition`, `pr`, `templates`, `chatbot`).
- `infra/` : `docker-compose.yml` (orchestration locale).
- `shared/` : (réservé pour types/helpers communs si besoin).

## Démarrage local
1. **Frontend** :  
   ```bash
   npm install
   npm run dev
   ```  
   (depuis la racine du repo ; Vite sert l’app depuis `frontend/src`).

2. **Stack Docker (gateway + services)** :  
   ```bash
   cd infra
   docker compose up --build
   ```  
   Services exposés via l’API Gateway : `http://localhost:3000`.

## Notes
- Chaque service possède son propre `Dockerfile.prod` et `.env` dans `services/<nom>/.env`.
- L’API Gateway route :
  - `/api/auth` -> auth-service (3001)
  - `/api/workouts` -> workouts-service (3002)
  - `/api/nutrition` -> nutrition-service (3003)
  - `/api/pr` -> pr-service (3004)
  - `/api/templates` -> templates-service (3005)
  - `/api/chatbot` -> chatbot-service (3006)
