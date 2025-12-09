import { getOpenAIClient, OPENAI_MODEL } from '../config/openai.config';
import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';
import { functionDefinitions } from './function-definitions';
import {
  addPersonalRecord,
  scheduleWorkout,
  updateProfile,
  getProfile,
  getWorkoutStats,
  addMeal,
  getNutritionStats,
  updateNutritionGoals,
  createWorkoutTemplate,
} from './actions';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Construire le prompt système pour le chatbot
 */
function buildSystemPrompt(userContext?: any): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const profile = userContext?.userProfile || {};
  const workouts = userContext?.workouts || [];
  const prs = userContext?.personalRecords || [];
  const nutrition = userContext?.nutrition || [];
  const scheduledWorkouts = userContext?.scheduledWorkouts || [];

  let workoutsSummary = '';
  if (workouts.length > 0) {
    const recentWorkout = workouts[0];
    workoutsSummary = `\n\n💪 DERNIER WORKOUT DÉTAILLÉ :\n• Nom : ${recentWorkout.name}\n• Type : ${recentWorkout.type}\n• Durée : ${recentWorkout.duration} min\n• Volume total : ${recentWorkout.totalVolume || 0} kg\n• Sets totaux : ${recentWorkout.totalSets || 0}\n${recentWorkout.exercises ? `• Exercices : ${recentWorkout.exercises.map((ex: any) => ex.name).join(', ')}` : ''}`;
    if (workouts.length > 1) {
      workoutsSummary += `\n\n📊 WORKOUTS RÉCENTS (derniers ${Math.min(5, workouts.length)}) :`;
      workouts.slice(0, 5).forEach((w: any, idx: number) => {
        workoutsSummary += `\n${idx + 1}. ${w.name} - ${w.type} - ${w.duration}min - ${w.totalVolume || 0}kg volume`;
      });
    }
  }

  let nutritionSummary = '';
  if (nutrition.length > 0) {
    const totalCals = nutrition.reduce((sum: number, entry: any) => sum + (entry.calories || 0), 0);
    const totalProtein = nutrition.reduce((sum: number, entry: any) => sum + (entry.protein || 0), 0);
    const totalCarbs = nutrition.reduce((sum: number, entry: any) => sum + (entry.carbs || 0), 0);
    const totalFats = nutrition.reduce((sum: number, entry: any) => sum + (entry.fats || 0), 0);
    nutritionSummary = `\n\n🍽️ NUTRITION RÉCENTE (derniers repas) :\n• Calories totales : ${totalCals.toFixed(0)} kcal\n• Protéines totales : ${totalProtein.toFixed(0)}g\n• Glucides totaux : ${totalCarbs.toFixed(0)}g\n• Lipides totaux : ${totalFats.toFixed(0)}g\n• Nombre de repas : ${nutrition.length}`;
    if (nutrition.length > 0) {
      nutritionSummary += `\n\n🍱 DERNIERS REPAS :`;
      nutrition.slice(0, 3).forEach((meal: any, idx: number) => {
        nutritionSummary += `\n${idx + 1}. ${meal.mealName} (${meal.mealType}) - ${meal.calories}kcal, ${meal.protein}g protéines`;
      });
    }
  }

  let scheduledSummary = '';
  if (scheduledWorkouts.length > 0) {
    scheduledSummary = `\n\n📅 WORKOUTS PLANIFIÉS (${scheduledWorkouts.length}) :`;
    scheduledWorkouts.forEach((sw: any) => {
      const date = sw.date instanceof Date ? sw.date : new Date(sw.date);
      scheduledSummary += `\n• ${sw.templateName} (${sw.type}) - ${date.toLocaleDateString('fr-FR')}`;
    });
  }

  let prsSummary = '';
  if (prs.length > 0) {
    prsSummary = `\n\n🏆 PERSONAL RECORDS (${prs.length}) :`;
    prs.slice(0, 5).forEach((pr: any) => {
      const date = pr.date instanceof Date ? pr.date : new Date(pr.date);
      prsSummary += `\n• ${pr.exerciseName}: ${pr.weight}kg x ${pr.reps} reps (${date.toLocaleDateString('fr-FR')})`;
    });
  }

  return `Tu es FitBot, l'assistant IA personnel de BodyGoal, une application de fitness tracking professionnelle.

🎯 CONTEXTE UTILISATEUR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Poids actuel : ${profile.weight ? `${profile.weight} kg` : 'Non défini'}
• Taille : ${profile.height ? `${profile.height} cm` : 'Non défini'}
• Âge : ${profile.age ? `${profile.age} ans` : 'Non défini'}
• Genre : ${profile.gender || 'Non défini'}
• Niveau de fitness : ${profile.fitnessLevel || 'Non défini'}
• Objectif : ${profile.fitnessGoal || profile.goals || 'Non défini'}
• Workouts total : ${workouts.length}
${workoutsSummary}
${prsSummary}
${nutritionSummary}
${scheduledSummary}

🎯 TA MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tu es un coach fitness virtuel motivant et professionnel. Ton rôle est d'aider l'utilisateur à :
• Suivre et améliorer ses performances
• Planifier ses entraînements intelligemment
• Optimiser sa nutrition
• Atteindre ses objectifs fitness
• Rester motivé et constant

💪 CAPACITÉS DISPONIBLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Analyse et conseils (workouts, volume, intensité, calories brûlées)
2. Gestion nutrition (repas, objectifs, stats)
3. Ajout/planification (PRs, workouts planifiés)
4. Mise à jour du profil

RÈGLES :
• Réponds en français, ton motivant et clair
• Emojis avec modération (1-3)
• Pas d’invention de données
• Si info manquante/ambigüe : demande une clarification
• Pour les dates relatives : calcule et fournis une date ISO (YYYY-MM-DD)

Exemples d’actions :
• Ajouter PR : “Bench Press 100kg x 5”
• Planifier un workout : “Push demain” → date ISO
• Ajouter repas : “Poulet 200g + riz 150g (déjeuner)”
• Stats : “Mes stats de la semaine”, “Mes macros aujourd’hui”

Prêt à aider l'utilisateur à atteindre ses objectifs ! 💪🔥`;
}

/**
 * Envoyer un message au chatbot (avec function calling)
 */
export const sendMessage = async (
  userId: string,
  message: string,
  conversationHistory: ChatMessage[] = [],
  userContext?: any
): Promise<{ message: string; action?: { name: string; result: any } }> => {
  try {
    const openai = getOpenAIClient();

    const systemPrompt = buildSystemPrompt(userContext);
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10),
      { role: 'user', content: message },
    ];

    console.log(`💬 Chat request from user ${userId}: "${message}"`);

    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      functions: functionDefinitions as any,
      function_call: 'auto',
      temperature: 0.8,
      max_tokens: 800,
    });

    const assistantMessage = response.choices[0].message as any;

    if (assistantMessage.function_call) {
      const functionName = assistantMessage.function_call.name;
      const functionArgs = JSON.parse(assistantMessage.function_call.arguments || '{}');

      console.log(`🔧 Function call: ${functionName}`, functionArgs);

      let actionResult: any = { success: false, message: `Function ${functionName} not implemented` };
      try {
        switch (functionName) {
          case 'addPersonalRecord':
            actionResult = await addPersonalRecord(
              userId,
              functionArgs.exerciseName,
              functionArgs.weight,
              functionArgs.reps,
              functionArgs.date
            );
            break;
          case 'scheduleWorkout':
            actionResult = await scheduleWorkout(
              userId,
              functionArgs.templateName,
              functionArgs.date,
              functionArgs.type,
              functionArgs.exercises,
              functionArgs.notes
            );
            break;
          case 'updateProfile':
            actionResult = await updateProfile(userId, functionArgs);
            break;
          case 'getProfile':
            actionResult = await getProfile(userId);
            break;
          case 'getWorkoutStats':
            actionResult = await getWorkoutStats(userId, functionArgs.period);
            break;
          case 'addMeal':
            actionResult = await addMeal(
              userId,
              functionArgs.mealName,
              functionArgs.mealType,
              functionArgs.calories,
              functionArgs.protein,
              functionArgs.carbs,
              functionArgs.fats,
              functionArgs.fiber
            );
            break;
          case 'getNutritionStats':
            actionResult = await getNutritionStats(userId, functionArgs.period);
            break;
          case 'updateNutritionGoals':
            actionResult = await updateNutritionGoals(userId, functionArgs);
            break;
          case 'createWorkoutTemplate':
            actionResult = await createWorkoutTemplate(
              userId,
              functionArgs.name,
              functionArgs.type,
              functionArgs.exercises,
              functionArgs.description
            );
            break;
          default:
            actionResult = { success: false, message: `Function ${functionName} not implemented` };
        }
      } catch (err: any) {
        console.error('Error executing bot action:', err);
        actionResult = { success: false, message: err?.message || 'Erreur action bot' };
      }

      // Follow-up pour générer la réponse finale
      const followUpMessages = [
        ...messages,
        assistantMessage,
        { role: 'function', name: functionName, content: JSON.stringify(actionResult) },
      ];

      const followUpResponse = await openai.chat.completions.create({
        model: OPENAI_MODEL,
        messages: followUpMessages as any,
        temperature: 0.8,
        max_tokens: 600,
      });

      const finalMessage =
        followUpResponse.choices[0].message.content || actionResult.message || "Je n'ai pas pu générer de réponse.";

      await saveChatMessages(userId, message, finalMessage);

      return {
        message: finalMessage,
        action: { name: functionName, result: actionResult },
      };
    }

    const responseMessage = assistantMessage.content || "Désolé, je n'ai pas pu générer une réponse.";
    await saveChatMessages(userId, message, responseMessage);
    return { message: responseMessage };
  } catch (error: any) {
    console.error('Chatbot error:', error);
    if (error.status === 429) throw new Error('Trop de requêtes. Réessaye dans quelques instants.');
    if (error.status === 401) throw new Error('Erreur de configuration API. Contacte le support.');
    throw new Error('Une erreur est survenue lors de la communication avec le chatbot.');
  }
};

/**
 * Récupérer l'historique de conversation
 */
export const getChatHistory = async (
  userId: string,
  limit: number = 20
): Promise<ChatMessage[]> => {
  try {
    const historyRef = db
      .collection('users')
      .doc(userId)
      .collection('chatHistory')
      .orderBy('timestamp', 'desc')
      .limit(limit);

    const snapshot = await historyRef.get();

    const messages = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        role: data.role,
        content: data.content,
      } as ChatMessage;
    });

    // Inverser pour avoir l'ordre chronologique
    return messages.reverse();
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
};

/**
 * Sauvegarder les messages dans Firestore
 */
async function saveChatMessages(
  userId: string,
  userMessage: string,
  assistantMessage: string
): Promise<void> {
  try {
    const timestamp = FieldValue.serverTimestamp();
    const chatHistoryRef = db.collection('users').doc(userId).collection('chatHistory');

    await chatHistoryRef.add({
      role: 'user',
      content: userMessage,
      timestamp,
    });

    await chatHistoryRef.add({
      role: 'assistant',
      content: assistantMessage,
      timestamp,
    });

    console.log(`💾 Chat messages saved for user ${userId}`);
  } catch (error) {
    console.error('Error saving chat messages:', error);
    // Ne pas lancer d'erreur - l'historique n'est pas critique
  }
}

/**
 * Supprimer l'historique de conversation
 */
export const clearChatHistory = async (userId: string): Promise<void> => {
  try {
    const historyRef = db.collection('users').doc(userId).collection('chatHistory');
    const snapshot = await historyRef.get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    console.log(`🧹 Chat history cleared for user ${userId}`);
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};
