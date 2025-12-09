import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus, Sunrise, Sun, Moon as MoonIcon, Coffee, Flame, Beef, Wheat, Droplet } from 'lucide-react';
import { NutritionData } from '../firebase/nutrition';

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: NutritionData) => Promise<void>;
}

export function AddMealDialog({ open, onOpenChange, onAdd }: AddMealDialogProps) {
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [fiber, setFiber] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mealName.trim() || !calories || Number(calories) <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({
        mealName: mealName.trim(),
        calories: Number(calories),
        protein: Number(protein) || 0,
        carbs: Number(carbs) || 0,
        fats: Number(fats) || 0,
        fiber: fiber ? Number(fiber) : undefined,
        mealType,
        // Enregistre le repas pour la date/heure actuelle afin qu'il apparaisse immédiatement dans le journal
        date: new Date()
      });
      
      // Reset form
      setMealName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFats('');
      setFiber('');
      setMealType('breakfast');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding meal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMealIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return Sunrise;
      case 'lunch':
        return Sun;
      case 'dinner':
        return MoonIcon;
      case 'snack':
        return Coffee;
    }
  };

  const Icon = getMealIcon(mealType);

  // Calculate calories from macros
  const calculatedCalories = (Number(protein) || 0) * 4 + (Number(carbs) || 0) * 4 + (Number(fats) || 0) * 9;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151923] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#22C55E]" />
            Add Meal
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Log a new meal with its nutritional information
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Meal Name */}
          <div>
            <Label htmlFor="meal-name" className="text-gray-300 mb-2 block">
              Meal Name *
            </Label>
            <Input
              id="meal-name"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="e.g. Grilled Chicken with Rice"
              className="bg-[#0B0B0F] border-white/10 text-white"
              required
            />
          </div>

          {/* Meal Type */}
          <div>
            <Label htmlFor="meal-type" className="text-gray-300 mb-2 block">
              Meal Type *
            </Label>
            <select
              id="meal-type"
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full bg-[#0B0B0F] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#22C55E]/30"
            >
              <option value="breakfast">🌅 Breakfast</option>
              <option value="lunch">☀️ Lunch</option>
              <option value="dinner">🌙 Dinner</option>
              <option value="snack">☕ Snack</option>
            </select>
          </div>

          {/* Calories */}
          <div>
            <Label htmlFor="calories" className="text-gray-300 mb-2 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Calories (kcal) *
            </Label>
            <Input
              id="calories"
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="e.g. 450"
              min="0"
              className="bg-[#0B0B0F] border-white/10 text-white"
              required
            />
            {calculatedCalories > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Calculated from macros: {calculatedCalories} kcal
                {Math.abs(calculatedCalories - Number(calories)) > 10 && calories && (
                  <span className="text-yellow-500 ml-1">
                    (difference: {Math.abs(calculatedCalories - Number(calories)).toFixed(0)} kcal)
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Macros Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Protein */}
            <div>
              <Label htmlFor="protein" className="text-gray-300 mb-2 flex items-center gap-2">
                <Beef className="w-4 h-4 text-red-500" />
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="bg-[#0B0B0F] border-white/10 text-white"
              />
              {protein && (
                <p className="text-xs text-gray-500 mt-1">
                  {(Number(protein) * 4).toFixed(0)} kcal
                </p>
              )}
            </div>

            {/* Carbs */}
            <div>
              <Label htmlFor="carbs" className="text-gray-300 mb-2 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-yellow-500" />
                Carbs (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="bg-[#0B0B0F] border-white/10 text-white"
              />
              {carbs && (
                <p className="text-xs text-gray-500 mt-1">
                  {(Number(carbs) * 4).toFixed(0)} kcal
                </p>
              )}
            </div>

            {/* Fats */}
            <div>
              <Label htmlFor="fats" className="text-gray-300 mb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-500" />
                Fats (g)
              </Label>
              <Input
                id="fats"
                type="number"
                value={fats}
                onChange={(e) => setFats(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="bg-[#0B0B0F] border-white/10 text-white"
              />
              {fats && (
                <p className="text-xs text-gray-500 mt-1">
                  {(Number(fats) * 9).toFixed(0)} kcal
                </p>
              )}
            </div>

            {/* Fiber */}
            <div>
              <Label htmlFor="fiber" className="text-gray-300 mb-2 flex items-center gap-2">
                Fiber (g) - Optional
              </Label>
              <Input
                id="fiber"
                type="number"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                placeholder="0"
                min="0"
                step="0.1"
                className="bg-[#0B0B0F] border-white/10 text-white"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#0B0B0F] border border-[#22C55E]/20 rounded-lg p-4">
            <h4 className="text-sm text-gray-300 mb-2">💡 Quick Tips</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Protein & Carbs: 4 calories per gram</li>
              <li>• Fats: 9 calories per gram</li>
              <li>• Use nutrition labels or apps like MyFitnessPal for accuracy</li>
              <li>• Fiber is optional but recommended for health tracking</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 border-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90"
            >
              {isSubmitting ? 'Adding...' : 'Add Meal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
