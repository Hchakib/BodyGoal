import { getOpenAIClient, OPENAI_MODEL } from '../config/openai.config';
import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Construire le prompt système pour le chatbot
 */
function buildSystemPrompt(userContext?: any): string {
  const basePrompt = `Tu es un coach fitness personnel expert pour l'application BodyGoal. Tu aides les utilisateurs avec :
- La création et optimisation de programmes d'entraînement
- Les conseils nutritionnels et plans de repas
- Le suivi de leurs progrès et records personnels
- La motivation et l'atteinte de leurs objectifs fitness

Réponds de manière concise, motivante et personnalisée. Utilise des emojis appropriés.`;

  if (userContext) {
    let contextInfo = '\n\nInformations sur l\'utilisateur :';
    if (userContext.weight) contextInfo += `\n- Poids : ${userContext.weight} kg`;
    if (userContext.height) contextInfo += `\n- Taille : ${userContext.height} cm`;
    if (userContext.age) contextInfo += `\n- Âge : ${userContext.age} ans`;
    if (userContext.fitnessGoal) contextInfo += `\n- Objectif : ${userContext.fitnessGoal}`;
    if (userContext.totalWorkouts) contextInfo += `\n- Workouts effectués : ${userContext.totalWorkouts}`;
    
    return basePrompt + contextInfo;
  }

  return basePrompt;
}

/**
 * Envoyer un message au chatbot
 */
export const sendMessage = async (
  userId: string,
  message: string,
  conversationHistory: ChatMessage[] = [],
  userContext?: any
): Promise<{ message: string }> => {
  try {
    const openai = getOpenAIClient();

    // Construire le prompt système avec contexte utilisateur
    const systemPrompt = buildSystemPrompt(userContext);

    // Préparer les messages pour OpenAI
    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Garder les 10 derniers messages
      { role: 'user', content: message },
    ];

    console.log(`💬 Chat request from user ${userId}: "${message}"`);

    // Appeler l'API OpenAI
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.8,
      max_tokens: 800,
    });

    const assistantMessage = response.choices[0].message.content || 
      "Désolé, je n'ai pas pu générer une réponse.";

    // Sauvegarder dans l'historique Firestore
    await saveChatMessages(userId, message, assistantMessage);

    return {
      message: assistantMessage,
    };
  } catch (error: any) {
    console.error('Chatbot error:', error);

    // Gérer les erreurs OpenAI
    if (error.status === 429) {
      throw new Error('Trop de requêtes. Réessaye dans quelques instants.');
    }

    if (error.status === 401) {
      throw new Error('Erreur de configuration API. Contacte le support.');
    }

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
    const chatHistoryRef = db
      .collection('users')
      .doc(userId)
      .collection('chatHistory');

    // Sauvegarder le message utilisateur
    await chatHistoryRef.add({
      role: 'user',
      content: userMessage,
      timestamp,
    });

    // Sauvegarder la réponse de l'assistant
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
    const historyRef = db
      .collection('users')
      .doc(userId)
      .collection('chatHistory');

    const snapshot = await historyRef.get();

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`🗑️ Chat history cleared for user ${userId}`);
  } catch (error) {
    console.error('Error clearing chat history:', error);
    throw error;
  }
};
