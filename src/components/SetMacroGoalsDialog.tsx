import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Target, Flame, Beef, Wheat, Droplet } from 'lucide-react';
import { MacroGoals } from '../firebase/nutrition';
import { useUserProfile } from '../hooks/useUserProfile';
import { toast } from 'sonner';

interface SetMacroGoalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentGoals: MacroGoals;
  onSave: (goals: MacroGoals) => void;
}

const PRESET_GOALS = {
  bulking: {
    name: 'Prise de masse',
    description: 'Surplus calorique pour la croissance musculaire',
    calories: 3000,
    protein: 180,
    carbs: 375,
    fats: 83,
    fiber: 35
  },
  cutting: {
    name: 'Sèche',
    description: 'Déficit calorique pour la perte de graisse',
    calories: 2000,
    protein: 180,
    carbs: 150,
    fats: 67,
    fiber: 30
  },
  maintenance: {
    name: 'Maintenance',
    description: 'Maintien du poids actuel',
    calories: 2500,
    protein: 150,
    carbs: 280,
    fats: 83,
    fiber: 30
  },
  athlete: {
    name: 'Athlète',
    description: 'Performance sportive optimale',
    calories: 3200,
    protein: 200,
    carbs: 400,
    fats: 89,
    fiber: 40
  }
};

export function SetMacroGoalsDialog({ open, onOpenChange, currentGoals, onSave }: SetMacroGoalsDialogProps) {
  const [goals, setGoals] = useState<MacroGoals>(currentGoals);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (preset: typeof PRESET_GOALS.bulking) => {
    setGoals({
      calories: preset.calories,
      protein: preset.protein,
      carbs: preset.carbs,
      fats: preset.fats,
      fiber: preset.fiber
    });
  };

  const handleSave = () => {
    onSave(goals);
    onOpenChange(false);
    toast.success('Macro goals saved successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151923] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#22C55E]" />
            Set Macro Goals
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Configure your daily nutrition targets based on your fitness goals
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Presets */}
          <div>
            <Label className="text-gray-300 mb-3 block">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(PRESET_GOALS).map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => handlePresetClick(preset)}
                  className="bg-[#0B0B0F] border border-white/10 rounded-xl p-4 text-left hover:border-[#22C55E]/50 transition-all group"
                >
                  <h4 className="text-white mb-1 group-hover:text-[#22C55E] transition-colors">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-gray-400 mb-2">{preset.description}</p>
                  <div className="flex gap-2 text-xs text-gray-500">
                    <span>{preset.calories} cal</span>
                    <span>•</span>
                    <span>P: {preset.protein}g</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input */}
          <div className="space-y-4">
            <Label className="text-gray-300">Custom Goals</Label>
            
            {/* Calories */}
            <div>
              <Label htmlFor="calories" className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                Calories (kcal)
              </Label>
              <Input
                id="calories"
                type="number"
                value={goals.calories}
                onChange={(e) => setGoals({ ...goals, calories: Number(e.target.value) })}
                className="bg-[#0B0B0F] border-white/10 text-white"
                min="0"
              />
            </div>

            {/* Protein */}
            <div>
              <Label htmlFor="protein" className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Beef className="w-4 h-4 text-red-500" />
                Protein (g)
              </Label>
              <Input
                id="protein"
                type="number"
                value={goals.protein}
                onChange={(e) => setGoals({ ...goals, protein: Number(e.target.value) })}
                className="bg-[#0B0B0F] border-white/10 text-white"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                4 calories per gram • {(goals.protein * 4)} kcal ({((goals.protein * 4 / goals.calories) * 100).toFixed(0)}%)
              </p>
            </div>

            {/* Carbs */}
            <div>
              <Label htmlFor="carbs" className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Wheat className="w-4 h-4 text-yellow-500" />
                Carbohydrates (g)
              </Label>
              <Input
                id="carbs"
                type="number"
                value={goals.carbs}
                onChange={(e) => setGoals({ ...goals, carbs: Number(e.target.value) })}
                className="bg-[#0B0B0F] border-white/10 text-white"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                4 calories per gram • {(goals.carbs * 4)} kcal ({((goals.carbs * 4 / goals.calories) * 100).toFixed(0)}%)
              </p>
            </div>

            {/* Fats */}
            <div>
              <Label htmlFor="fats" className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-blue-500" />
                Fats (g)
              </Label>
              <Input
                id="fats"
                type="number"
                value={goals.fats}
                onChange={(e) => setGoals({ ...goals, fats: Number(e.target.value) })}
                className="bg-[#0B0B0F] border-white/10 text-white"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                9 calories per gram • {(goals.fats * 9)} kcal ({((goals.fats * 9 / goals.calories) * 100).toFixed(0)}%)
              </p>
            </div>

            {/* Fiber */}
            <div>
              <Label htmlFor="fiber" className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                Fiber (g) - Optional
              </Label>
              <Input
                id="fiber"
                type="number"
                value={goals.fiber || 0}
                onChange={(e) => setGoals({ ...goals, fiber: Number(e.target.value) })}
                className="bg-[#0B0B0F] border-white/10 text-white"
                min="0"
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-[#0B0B0F] rounded-xl p-4 border border-white/10">
            <h4 className="text-white mb-3">Macro Distribution</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Protein</span>
                <span className="text-[#22C55E]">
                  {((goals.protein * 4 / goals.calories) * 100).toFixed(0)}% ({goals.protein}g)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Carbs</span>
                <span className="text-yellow-500">
                  {((goals.carbs * 4 / goals.calories) * 100).toFixed(0)}% ({goals.carbs}g)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fats</span>
                <span className="text-blue-500">
                  {((goals.fats * 9 / goals.calories) * 100).toFixed(0)}% ({goals.fats}g)
                </span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between">
                <span className="text-white">Total</span>
                <span className="text-white">
                  {goals.protein * 4 + goals.carbs * 4 + goals.fats * 9} kcal
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90"
          >
            Save Goals
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}