export interface NutritionEntry {
  id?: string;
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: any;
  createdAt: any;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
}
