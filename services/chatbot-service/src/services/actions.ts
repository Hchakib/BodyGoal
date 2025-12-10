import { db } from '../config/firebase.config';
import { FieldValue } from 'firebase-admin/firestore';

export interface ActionResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Action 1: Add Personal Record
 */
export async function addPersonalRecord(
  userId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  date?: string
): Promise<ActionResult> {
  try {
    const prDate = date ? new Date(date) : new Date();
    
    const prData = {
      userId,
      exerciseName,
      weight,
      reps,
      date: prDate,
      createdAt: FieldValue.serverTimestamp(),
    };
    
    // Use root collection 'personalRecords' with userId field
    await db.collection('personalRecords').add(prData);
    
    return {
      success: true,
      message: `✅ PR ajouté avec succès !\n\n🏆 ${exerciseName}\n💪 ${weight} kg × ${reps} reps\n📅 ${prDate.toLocaleDateString('fr-FR')}\n\nBravo pour ce nouveau record ! 🎉`,
      data: prData,
    };
  } catch (error) {
    console.error('Error adding PR:', error);
    return {
      success: false,
      message: '❌ Erreur lors de l\'ajout du PR. Réessaye dans quelques instants.',
    };
  }
}

/**
 * Action 2: Add Meal (NUTRITION)
 */
export async function addMeal(
  userId: string,
  mealName: string,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  calories: number,
  protein: number,
  carbs: number,
  fats: number,
  fiber?: number
): Promise<ActionResult> {
  try {
    // Validate required parameters
    if (!mealName || !mealType) {
      return {
        success: false,
        message: '❌ Nom du repas et type manquants. Peux-tu me donner plus de détails ?',
      };
    }

    if (typeof calories !== 'number' || typeof protein !== 'number' || 
        typeof carbs !== 'number' || typeof fats !== 'number') {
      return {
        success: false,
        message: '❌ Les valeurs nutritionnelles doivent être des nombres. Réessaye avec des valeurs valides.',
      };
    }
    
    const mealData = {
      mealName: String(mealName),
      mealType: String(mealType),
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fats: Number(fats),
      fiber: fiber ? Number(fiber) : 0,
      date: new Date(),
      createdAt: FieldValue.serverTimestamp(),
    };
    
    await db
      .collection('users')
      .doc(userId)
      .collection('nutrition')
      .add(mealData);
    
    const mealTypeLabels: Record<string, string> = {
      breakfast: 'Petit-déjeuner',
      lunch: 'Déjeuner',
      dinner: 'Dîner',
      snack: 'Snack',
    };
    
    return {
      success: true,
      message: `✅ Repas ajouté avec succès ! 🍽️\n\n${mealTypeLabels[mealType]}: ${mealName}\n📊 ${calories} kcal | P: ${protein}g | C: ${carbs}g | L: ${fats}g\n\nBon appétit ! 🔥`,
      data: mealData,
    };
  } catch (error) {
    console.error('Error adding meal:', error);
    return {
      success: false,
      message: '❌ Erreur lors de l\'ajout du repas. Réessaye dans quelques instants.',
    };
  }
}

/**
 * Action 3: Schedule Workout
 */
export async function scheduleWorkout(
  userId: string,
  templateName: string,
  date: string,
  type: 'strength' | 'cardio',
  exercises?: Array<{
    name: string;
    sets?: number;
    reps?: number;
    duration?: number;
    weight?: number;
  }>,
  notes?: string,
  templateId?: string
): Promise<ActionResult> {
  try {
    // Parse date correctly to avoid timezone issues
    let workoutDate: Date;
    if (date.includes('T')) {
      workoutDate = new Date(date);
    } else {
      // Date only (YYYY-MM-DD) - parse at noon local time
      const [year, month, day] = date.split('-').map(Number);
      workoutDate = new Date(year, month - 1, day, 12, 0, 0);
    }
    
    // If no exercises provided, suggest some based on template name
    let exercisesList = exercises || [];
    
    if (exercisesList.length === 0) {
      const suggestions = getSuggestedExercises(templateName, type);
      exercisesList = suggestions;
    }
    
    // Build exercises with proper structure
    const formattedExercises = exercisesList.map(ex => {
      const exercise: any = {
        name: ex.name,
        type,
        muscleGroup: [],
        category: 'Compound',
      };
      
      if (type === 'strength') {
        exercise.sets = ex.sets || 3;
        exercise.reps = ex.reps || 10;
        exercise.weight = 0;
      } else {
        exercise.duration = ex.duration || 30;
      }
      
      return exercise;
    });
    
    const workoutData = {
      userId,
      templateId: templateId || null,
      templateName,
      type,
      date: workoutDate,
      exercises: formattedExercises,
      notes: notes || '',
      completed: false,
      createdAt: FieldValue.serverTimestamp(),
    };
    
    const docRef = await db
      .collection('scheduledWorkouts')
      .add(workoutData);
    
    return {
      success: true,
      message: `✅ Workout planifié avec succès ! 📅\n\n🏋️ ${templateName}\n📅 ${workoutDate.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}\n💪 ${formattedExercises.length} exercice(s)\n\nTu peux le retrouver sur ton calendrier ! 🎯`,
      data: { id: docRef.id, ...workoutData },
    };
  } catch (error) {
    console.error('Error scheduling workout:', error);
    return {
      success: false,
      message: '❌ Erreur lors de la planification du workout. Réessaye dans quelques instants.',
    };
  }
}

/**
 * Action 4: Update Profile
 */
export async function updateProfile(
  userId: string,
  updates: {
    weight?: number;
    height?: number;
    age?: number;
    fitnessGoal?: string;
    displayName?: string;
    bio?: string;
    weeklyGoal?: number;
  }
): Promise<ActionResult> {
  try {
    const userRef = db.collection('users').doc(userId);
    
    const updateData: any = {};
    
    if (updates.weight !== undefined) {
      updateData.weight = updates.weight;
      updateData.lastWeightUpdate = FieldValue.serverTimestamp();
    }
    
    if (updates.height !== undefined) {
      updateData.height = updates.height;
    }
    
    if (updates.age !== undefined) {
      updateData.age = updates.age;
    }
    
    if (updates.fitnessGoal) {
      updateData.fitnessGoal = updates.fitnessGoal;
    }
    
    if (updates.displayName) {
      updateData.displayName = updates.displayName;
    }
    
    if (updates.bio !== undefined) {
      updateData.bio = updates.bio;
    }
    
    if (updates.weeklyGoal !== undefined) {
      updateData.weeklyGoal = updates.weeklyGoal;
    }
    
    updateData.updatedAt = FieldValue.serverTimestamp();
    
    await userRef.set(updateData, { merge: true });
    
    let message = '✅ Profil mis à jour avec succès !\n\n';
    
    if (updates.weight) {
      message += `⚖️ Nouveau poids : ${updates.weight} kg\n`;
    }
    
    if (updates.height) {
      message += `📏 Nouvelle taille : ${updates.height} cm\n`;
    }
    
    if (updates.age) {
      message += `🎂 Âge : ${updates.age} ans\n`;
    }
    
    if (updates.fitnessGoal) {
      const goalNames: Record<string, string> = {
        weight_loss: 'Perte de poids',
        muscle_gain: 'Prise de muscle',
        maintenance: 'Maintien',
        endurance: 'Endurance',
      };
      message += `🎯 Nouvel objectif : ${goalNames[updates.fitnessGoal] || updates.fitnessGoal}\n`;
    }
    
    if (updates.displayName) {
      message += `👤 Nouveau nom : ${updates.displayName}\n`;
    }
    
    if (updates.bio) {
      message += `📝 Bio mise à jour\n`;
    }
    
    if (updates.weeklyGoal) {
      message += `📅 Objectif hebdomadaire : ${updates.weeklyGoal} workouts/semaine\n`;
    }
    
    message += '\nContinue comme ça ! 💪';
    
    return {
      success: true,
      message,
      data: updateData,
    };
  } catch (error) {
    console.error('Error updating profile:', error);
    return {
      success: false,
      message: '❌ Erreur lors de la mise à jour du profil. Réessaye dans quelques instants.',
    };
  }
}

/**
 * Action 5: Get Profile
 */
export async function getProfile(userId: string): Promise<ActionResult> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    
    const goalNames: Record<string, string> = {
      weight_loss: 'Perte de poids',
      muscle_gain: 'Prise de muscle',
      maintenance: 'Maintien',
      endurance: 'Endurance',
    };
    
    let message = '👤 TON PROFIL\n\n';
    
    if (userData.email) {
      message += `📧 Email : ${userData.email}\n`;
    }
    
    if (userData.displayName) {
      message += `👤 Nom : ${userData.displayName}\n`;
    }
    
    if (userData.age) {
      message += `🎂 Âge : ${userData.age} ans\n`;
    }
    
    if (userData.weight) {
      message += `⚖️ Poids : ${userData.weight} kg\n`;
    }
    
    if (userData.height) {
      message += `📏 Taille : ${userData.height} cm\n`;
    }
    
    if (userData.weight && userData.height) {
      const heightM = userData.height / 100;
      const bmi = (userData.weight / (heightM * heightM)).toFixed(1);
      message += `📊 IMC : ${bmi}\n`;
    }
    
    if (userData.fitnessGoal) {
      message += `🎯 Objectif : ${goalNames[userData.fitnessGoal] || userData.fitnessGoal}\n`;
    }
    
    if (userData.weeklyGoal) {
      message += `📅 Objectif hebdo : ${userData.weeklyGoal} workouts/semaine\n`;
    }
    
    if (userData.bio) {
      message += `\n📝 Bio :\n${userData.bio}\n`;
    }
    
    return {
      success: true,
      message,
      data: userData,
    };
  } catch (error) {
    console.error('Error getting profile:', error);
    return {
      success: false,
      message: '❌ Erreur lors de la récupération du profil.',
    };
  }
}

/**
 * Action 6: Get Workout Stats
 */
export async function getWorkoutStats(
  userId: string,
  period: 'week' | 'month' | 'all'
): Promise<ActionResult> {
  try {
    let startDate: Date | null = null;
    
    if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    
    // Use root collection 'workoutSessions' with userId filter
    let queryRef = db.collection('workoutSessions').where('userId', '==', userId);
    
    if (startDate) {
      queryRef = queryRef.where('date', '>=', startDate) as any;
    }
    
    const snapshot = await queryRef.get();
    const workouts = snapshot.docs.map(doc => doc.data());
    const totalWorkouts = workouts.length;
    
    // Calculate total volume (kg)
    let totalVolume = 0;
    let totalDuration = 0;
    const exerciseCount: Record<string, number> = {};
    
    workouts.forEach(workout => {
      totalDuration += workout.duration || 0;
      
      workout.exercises?.forEach((ex: any) => {
        exerciseCount[ex.name] = (exerciseCount[ex.name] || 0) + 1;
        
        if (ex.sets && Array.isArray(ex.sets)) {
          ex.sets.forEach((set: any) => {
            totalVolume += (set.weight || 0) * (set.reps || 0);
          });
        }
      });
    });
    
    const topExercises = Object.entries(exerciseCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    const periodLabel = period === 'week' ? '7 derniers jours' : period === 'month' ? '30 derniers jours' : 'Tout le temps';
    
    let message = `📊 Statistiques - ${periodLabel}\n\n`;
    message += `💪 Total workouts : ${totalWorkouts}\n`;
    message += `⏱️ Durée totale : ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}min\n`;
    message += `🏋️ Volume total : ${totalVolume.toLocaleString()} kg\n`;
    
    if (topExercises.length > 0) {
      message += `\n🔥 Top exercices :\n`;
      topExercises.forEach(([name, count], idx) => {
        message += `${idx + 1}. ${name} (${count}×)\n`;
      });
    }
    
    message += `\n${totalWorkouts > 0 ? 'Continue sur cette lancée ! 🚀' : 'Il est temps de commencer ! 💪'}`;
    
    return {
      success: true,
      message,
      data: {
        totalWorkouts,
        totalDuration,
        totalVolume,
        topExercises,
      },
    };
  } catch (error) {
    console.error('Error getting workout stats:', error);
    return {
      success: false,
      message: '❌ Erreur lors de la récupération des statistiques.',
    };
  }
}

/**
 * Action 7: Get Nutrition Stats
 */
export async function getNutritionStats(
  userId: string,
  period: 'today' | 'week' | 'month'
): Promise<ActionResult> {
  try {
    let startDate: Date;
    const now = new Date();
    
    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    } else if (period === 'week') {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    } else {
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }
    
    // Get nutrition entries
    const entriesSnapshot = await db
      .collection('users')
      .doc(userId)
      .collection('nutrition')
      .where('date', '>=', startDate)
      .get();
    
    // Get nutrition goals
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data() || {};
    const goals = userData.nutritionGoals || {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fats: 65,
    };
    
    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFats = 0;
    let totalFiber = 0;
    
    entriesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalCalories += data.calories || 0;
      totalProtein += data.protein || 0;
      totalCarbs += data.carbs || 0;
      totalFats += data.fats || 0;
      totalFiber += data.fiber || 0;
    });
    
    const periodLabel = period === 'today' ? "Aujourd'hui" : period === 'week' ? '7 derniers jours' : '30 derniers jours';
    
    // Calculate percentages
    const caloriesPercent = ((totalCalories / goals.calories) * 100).toFixed(0);
    const proteinPercent = ((totalProtein / goals.protein) * 100).toFixed(0);
    const carbsPercent = ((totalCarbs / goals.carbs) * 100).toFixed(0);
    const fatsPercent = ((totalFats / goals.fats) * 100).toFixed(0);
    
    let message = `🍽️ NUTRITION - ${periodLabel}\n\n`;
    message += `📊 CONSOMMATION :\n`;
    message += `• Calories : ${Math.round(totalCalories)} / ${goals.calories} kcal (${caloriesPercent}%)\n`;
    message += `• Protéines : ${Math.round(totalProtein)}g / ${goals.protein}g (${proteinPercent}%)\n`;
    message += `• Glucides : ${Math.round(totalCarbs)}g / ${goals.carbs}g (${carbsPercent}%)\n`;
    message += `• Lipides : ${Math.round(totalFats)}g / ${goals.fats}g (${fatsPercent}%)\n`;
    
    if (totalFiber > 0) {
      message += `• Fibres : ${Math.round(totalFiber)}g\n`;
    }
    
    const totalMeals = entriesSnapshot.size;
    if (totalMeals > 0) {
      message += `\n🍴 Nombre de repas : ${totalMeals}\n`;
    }
    
    // Add motivational message
    if (period === 'today') {
      const remaining = goals.calories - totalCalories;
      if (remaining > 0) {
        message += `\n💡 Il te reste ${Math.round(remaining)} kcal pour aujourd'hui !`;
      } else if (remaining < -500) {
        message += `\n⚠️ Tu as dépassé ton objectif de ${Math.abs(Math.round(remaining))} kcal.`;
      } else {
        message += `\n✅ Objectif atteint pour aujourd'hui ! 🎉`;
      }
    }
    
    return {
      success: true,
      message,
      data: {
        consumed: {
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fats: totalFats,
          fiber: totalFiber,
        },
        goals,
        totalMeals,
      },
    };
  } catch (error) {
    console.error('Error getting nutrition stats:', error);
    return {
      success: false,
      message: '❌ Erreur lors de la récupération des stats nutrition.',
    };
  }
}

/**
 * Action 8: Update Nutrition Goals
 */
export async function updateNutritionGoals(
  userId: string,
  goals: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  }
): Promise<ActionResult> {
  try {
    const userRef = db.collection('users').doc(userId);
    
    // Get current goals
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};
    const currentGoals = userData.nutritionGoals || {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fats: 65,
    };
    
    // Merge with new goals
    const updatedGoals = {
      ...currentGoals,
      ...goals,
    };
    
    await userRef.set(
      {
        nutritionGoals: updatedGoals,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    
    let message = '✅ Objectifs nutritionnels mis à jour !\n\n';
    message += '🎯 NOUVEAUX OBJECTIFS :\n';
    message += `• Calories : ${updatedGoals.calories} kcal/jour\n`;
    message += `• Protéines : ${updatedGoals.protein}g/jour\n`;
    message += `• Glucides : ${updatedGoals.carbs}g/jour\n`;
    message += `• Lipides : ${updatedGoals.fats}g/jour\n`;
    message += '\nContinue à bien manger ! 🔥';
    
    return {
      success: true,
      message,
      data: updatedGoals,
    };
  } catch (error) {
    console.error('Error updating nutrition goals:', error);
    return {
      success: false,
      message: '❌ Erreur lors de la mise à jour des objectifs nutrition.',
    };
  }
}


/**
 * Action: Créer un template personnalisé
 */
export async function createWorkoutTemplate(
  userId: string,
  name: string,
  type: 'strength' | 'cardio',
  exercises: Array<{
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
    notes?: string;
  }>,
  description?: string
): Promise<ActionResult> {
  try {
    if (!name || !type || !exercises || exercises.length === 0) {
      return { success: false, message: '❌ Nom, type ou exercices manquants pour créer le template.' };
    }

    const templateData = {
      userId,
      name,
      type,
      focus: type === 'cardio' ? 'endurance' : 'strength',
      daysPerWeek: 1,
      description: description || '',
      exercises: exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || 10,
        weight: ex.weight || 0,
        duration: ex.duration || 0,
        notes: ex.notes || '',
      })),
      workouts: [{
        dayNumber: 1,
        dayName: name,
        exercises: exercises.map((ex, i) => ({
          id: ex.name?.toLowerCase().replace(/\s+/g, '-') || `ex-${i}`,
          name: ex.name,
          sets: ex.sets || 3,
          reps: `${ex.reps || 10}`,
          notes: ex.notes || '',
        })),
      }],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('workoutTemplates').add(templateData);

    return {
      success: true,
      message: `✅ Template "${name}" créé avec succès !`,
      data: { id: docRef.id, ...templateData },
    };
  } catch (error) {
    console.error('Error creating template:', error);
    return {
      success: false,
      message: '❌ Erreur lors de la création du template. Réessaye dans quelques instants.',
    };
  }
}
/**
 * Helper: Suggest exercises based on workout name
 */
function getSuggestedExercises(
  templateName: string,
  type: 'strength' | 'cardio'
): Array<{ name: string; sets?: number; reps?: number; duration?: number }> {
  const nameLower = templateName.toLowerCase();
  
  if (type === 'cardio') {
    return [
      { name: 'Running', duration: 30 },
      { name: 'Cycling', duration: 30 },
    ];
  }
  
  // Strength exercises suggestions
  if (nameLower.includes('push') || nameLower.includes('chest') || nameLower.includes('pecs')) {
    return [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
      { name: 'Shoulder Press', sets: 3, reps: 10 },
      { name: 'Tricep Dips', sets: 3, reps: 12 },
    ];
  }
  
  if (nameLower.includes('pull') || nameLower.includes('back') || nameLower.includes('dos')) {
    return [
      { name: 'Pull-ups', sets: 4, reps: 8 },
      { name: 'Barbell Rows', sets: 4, reps: 8 },
      { name: 'Lat Pulldown', sets: 3, reps: 10 },
      { name: 'Bicep Curls', sets: 3, reps: 12 },
    ];
  }
  
  if (nameLower.includes('leg') || nameLower.includes('jamb') || nameLower.includes('squat')) {
    return [
      { name: 'Squat', sets: 4, reps: 8 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Leg Curl', sets: 3, reps: 12 },
    ];
  }
  
  if (nameLower.includes('upper') || nameLower.includes('haut')) {
    return [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Pull-ups', sets: 3, reps: 10 },
      { name: 'Shoulder Press', sets: 3, reps: 10 },
      { name: 'Barbell Rows', sets: 3, reps: 10 },
    ];
  }
  
  if (nameLower.includes('full') || nameLower.includes('complet') || nameLower.includes('total')) {
    return [
      { name: 'Squat', sets: 3, reps: 10 },
      { name: 'Bench Press', sets: 3, reps: 10 },
      { name: 'Deadlift', sets: 3, reps: 8 },
      { name: 'Pull-ups', sets: 3, reps: 10 },
    ];
  }
  
  // Default exercises
  return [
    { name: 'Bench Press', sets: 3, reps: 10 },
    { name: 'Squat', sets: 3, reps: 10 },
    { name: 'Deadlift', sets: 3, reps: 8 },
  ];
}
