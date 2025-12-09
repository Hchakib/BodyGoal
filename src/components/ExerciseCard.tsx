import { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Check, Edit2, Grip } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface ExerciseSet {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
  intensity?: 'easy' | 'medium' | 'hard';
}

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

interface ExerciseCardProps {
  exercise: Exercise;
  onUpdateSet: (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => void;
  onToggleSet: (exerciseId: string, setId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateNotes: (exerciseId: string, notes: string) => void;
}

export function ExerciseCard({
  exercise,
  onUpdateSet,
  onToggleSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onUpdateNotes,
}: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [localNotes, setLocalNotes] = useState(exercise.notes || '');

  const completedSets = exercise.sets.filter(s => s.completed).length;
  const totalSets = exercise.sets.length;
  const progressPercent = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const handleSaveNotes = () => {
    onUpdateNotes(exercise.id, localNotes);
    setIsEditingNotes(false);
  };

  return (
    <div className="rounded-xl bg-[#151923] border border-[#151923] overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-[#0B0B0F]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <button className="cursor-grab text-gray-500 hover:text-gray-400">
              <Grip className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-1 flex items-center gap-3 text-left"
            >
              <div className="flex-1">
                <h3 className="font-medium">{exercise.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {completedSets}/{totalSets} sets
                  </span>
                  {completedSets === totalSets && totalSets > 0 && (
                    <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30 text-xs">
                      Complete
                    </Badge>
                  )}
                </div>
              </div>
              
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveExercise(exercise.id)}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {!isExpanded && (
          <div className="mt-3">
            <div className="h-1.5 bg-[#0B0B0F] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#22C55E] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Sets header */}
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-2">
            <div className="col-span-1">✓</div>
            <div className="col-span-2">Set</div>
            <div className="col-span-3">Weight (kg)</div>
            <div className="col-span-3">Reps</div>
            <div className="col-span-2">Previous</div>
            <div className="col-span-1"></div>
          </div>

          {/* Sets */}
          {exercise.sets.map((set, index) => (
            <div
              key={set.id}
              className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-colors ${
                set.completed
                  ? 'bg-[#22C55E]/10 border border-[#22C55E]/30'
                  : 'bg-[#0B0B0F] border border-transparent hover:border-[#151923]'
              }`}
            >
              {/* Checkbox */}
              <div className="col-span-1 flex items-center justify-center">
                <Checkbox
                  checked={set.completed}
                  onCheckedChange={() => onToggleSet(exercise.id, set.id)}
                  className="border-gray-600"
                />
              </div>

              {/* Set number */}
              <div className="col-span-2">
                <span className="text-sm text-gray-400">{index + 1}</span>
              </div>

              {/* Weight input */}
              <div className="col-span-3">
                <Input
                  type="number"
                  value={set.weight}
                  onChange={(e) => onUpdateSet(exercise.id, set.id, 'weight', e.target.value)}
                  placeholder="0"
                  disabled={set.completed}
                  className="h-8 bg-[#151923] border-[#151923] text-sm"
                />
              </div>

              {/* Reps input */}
              <div className="col-span-3">
                <Input
                  type="number"
                  value={set.reps}
                  onChange={(e) => onUpdateSet(exercise.id, set.id, 'reps', e.target.value)}
                  placeholder="0"
                  disabled={set.completed}
                  className="h-8 bg-[#151923] border-[#151923] text-sm"
                />
              </div>

              {/* Previous data */}
              <div className="col-span-2">
                <span className="text-xs text-gray-600">—</span>
              </div>

              {/* Remove button */}
              <div className="col-span-1 flex items-center justify-center">
                {exercise.sets.length > 1 && (
                  <button
                    onClick={() => onRemoveSet(exercise.id, set.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add set button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddSet(exercise.id)}
            className="w-full bg-transparent border-dashed border-gray-700 hover:border-[#22C55E] hover:bg-[#22C55E]/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Set
          </Button>

          {/* Notes section */}
          <div className="pt-2 border-t border-[#0B0B0F]">
            {isEditingNotes ? (
              <div className="space-y-2">
                <Input
                  value={localNotes}
                  onChange={(e) => setLocalNotes(e.target.value)}
                  placeholder="Add notes for this exercise..."
                  className="bg-[#0B0B0F] border-[#151923] text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNotes}
                    className="bg-[#22C55E] hover:bg-[#22C55E]/90"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setIsEditingNotes(false);
                      setLocalNotes(exercise.notes || '');
                    }}
                    className="bg-transparent border-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingNotes(true)}
                className="text-xs text-gray-500 hover:text-gray-400 flex items-center gap-1"
              >
                <Edit2 className="w-3 h-3" />
                {exercise.notes ? exercise.notes : 'Add notes...'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}