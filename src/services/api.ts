/**
 * Service API pour communiquer avec l'API Gateway des microservices
 */

import { auth } from '../firebase/config';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Récupérer le token Firebase de l'utilisateur connecté
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return await user.getIdToken();
}

/**
 * Faire une requête authentifiée vers l'API
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return await response.json();
}

// ==================== AUTH SERVICE ====================

export const authApi = {
  /**
   * Créer ou mettre à jour le profil utilisateur
   */
  async registerProfile(data: {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
  }) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupérer le profil utilisateur
   */
  async getProfile() {
    return apiRequest('/api/auth/profile', {
      method: 'GET',
    });
  },

  /**
   * Mettre à jour le profil utilisateur
   */
  async updateProfile(data: any) {
    return apiRequest('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Vérifier le token
   */
  async verifyToken() {
    return apiRequest('/api/auth/verify', {
      method: 'GET',
    });
  },
};

// ==================== WORKOUTS SERVICE ====================

export const workoutsApi = {
  /**
   * Récupérer les workouts
   */
  async getWorkouts(limit: number = 10) {
    return apiRequest(`/api/workouts/workouts?limit=${limit}`, {
      method: 'GET',
    });
  },

  /**
   * Créer un nouveau workout
   */
  async createWorkout(data: any) {
    return apiRequest('/api/workouts/workouts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupérer un workout par ID
   */
  async getWorkoutById(id: string) {
    return apiRequest(`/api/workouts/workouts/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Mettre à jour un workout
   */
  async updateWorkout(id: string, data: any) {
    return apiRequest(`/api/workouts/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Supprimer un workout
   */
  async deleteWorkout(id: string) {
    return apiRequest(`/api/workouts/workouts/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Récupérer les statistiques
   */
  async getStats() {
    return apiRequest('/api/workouts/workouts/stats', {
      method: 'GET',
    });
  },
};

// ==================== NUTRITION SERVICE ====================

export const nutritionApi = {
  /**
   * Récupérer les repas
   */
  async getMeals(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest(`/api/nutrition/meals?${params.toString()}`, {
      method: 'GET',
    });
  },

  /**
   * Ajouter un repas
   */
  async addMeal(data: any) {
    return apiRequest('/api/nutrition/meals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Supprimer un repas
   */
  async deleteMeal(id: string) {
    return apiRequest(`/api/nutrition/meals/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Récupérer les objectifs nutritionnels
   */
  async getGoals() {
    return apiRequest('/api/nutrition/goals', {
      method: 'GET',
    });
  },

  /**
   * Mettre à jour les objectifs
   */
  async updateGoals(data: any) {
    return apiRequest('/api/nutrition/goals', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupérer les statistiques
   */
  async getStats(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return apiRequest(`/api/nutrition/stats?${params.toString()}`, {
      method: 'GET',
    });
  },
};

// ==================== PR SERVICE ====================

export const prApi = {
  /**
   * Récupérer les PRs
   */
  async getPRs(exerciseName?: string) {
    const params = exerciseName ? `?exerciseName=${exerciseName}` : '';
    return apiRequest(`/api/pr/pr${params}`, {
      method: 'GET',
    });
  },

  /**
   * Créer un PR
   */
  async createPR(data: any) {
    return apiRequest('/api/pr/pr', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupérer un PR par ID
   */
  async getPRById(id: string) {
    return apiRequest(`/api/pr/pr/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Mettre à jour un PR
   */
  async updatePR(id: string, data: any) {
    return apiRequest(`/api/pr/pr/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Supprimer un PR
   */
  async deletePR(id: string) {
    return apiRequest(`/api/pr/pr/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== TEMPLATES SERVICE ====================

export const templatesApi = {
  /**
   * Récupérer les templates
   */
  async getTemplates() {
    return apiRequest('/api/templates/templates', {
      method: 'GET',
    });
  },

  /**
   * Créer un template
   */
  async createTemplate(data: any) {
    return apiRequest('/api/templates/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupérer un template par ID
   */
  async getTemplateById(id: string) {
    return apiRequest(`/api/templates/templates/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Mettre à jour un template
   */
  async updateTemplate(id: string, data: any) {
    return apiRequest(`/api/templates/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Supprimer un template
   */
  async deleteTemplate(id: string) {
    return apiRequest(`/api/templates/templates/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Récupérer les workouts planifiés
   */
  async getScheduledWorkouts() {
    return apiRequest('/api/templates/scheduled', {
      method: 'GET',
    });
  },

  /**
   * Planifier un workout
   */
  async scheduleWorkout(data: any) {
    return apiRequest('/api/templates/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Marquer un workout comme complété
   */
  async completeWorkout(id: string) {
    return apiRequest(`/api/templates/scheduled/${id}/complete`, {
      method: 'PUT',
    });
  },

  /**
   * Supprimer un workout planifié
   */
  async deleteScheduledWorkout(id: string) {
    return apiRequest(`/api/templates/scheduled/${id}`, {
      method: 'DELETE',
    });
  },
};

// ==================== CHATBOT SERVICE ====================

export const chatbotApi = {
  /**
   * Envoyer un message au chatbot
   */
  async sendMessage(data: {
    message: string;
    history?: any[];
    userContext?: any;
  }) {
    return apiRequest('/api/chatbot/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupérer l'historique de conversation
   */
  async getHistory(limit: number = 20) {
    return apiRequest(`/api/chatbot/history?limit=${limit}`, {
      method: 'GET',
    });
  },

  /**
   * Supprimer l'historique
   */
  async clearHistory() {
    return apiRequest('/api/chatbot/history', {
      method: 'DELETE',
    });
  },
};
