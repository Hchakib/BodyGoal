import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Check, Edit2, Grip, Timer, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface CardioSet {
  id: string;
  duration: string; // in minutes
  distance?: string; // in km
  calories?: string;
  intensity?: 'low' | 'moderate' | 'high';
  completed: boolean;
  heartRate?: string; // BPM
}

interface CardioExercise {
  id: string;
  name: string;
  sets: CardioSet[];
  notes?: string;
}

interface CardioExerciseCardProps {
  exercise: CardioExercise;
  onUpdateSet: (exerciseId: string, setId: string, field: keyof CardioSet, value: string) => void;
  onToggleSet: (exerciseId: string, setId: string) => void;
  onAddSet: (exerciseId: string) => void;
  onRemoveSet: (exerciseId: string, setId: string) => void;
  onRemoveExercise: (exerciseId: string) => void;
  onUpdateNotes: (exerciseId: string, notes: string) => void;
}

export function CardioExerciseCard({
  exercise,
  onUpdateSet,
  onToggleSet,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onUpdateNotes,
}: CardioExerciseCardProps) {
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

  const getIntensityColor = (intensity?: 'low' | 'moderate' | 'high') => {
    switch (intensity) {
      case 'low':
        return 'bg-[#22C55E]';
      case 'moderate':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-600';
    }
  };

  const getIntensityLabel = (intensity?: 'low' | 'moderate' | 'high') => {
    switch (intensity) {
      case 'low':
        return 'Low';
      case 'moderate':
        return 'Mod';
      case 'high':
        return 'High';
      default:
        return '—';
    }
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
                    {completedSets}/{totalSets} intervals
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
                className="h-full bg-[#00D1FF] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expandable content */}
      {isExpanded && (
        <div className="p-4 space-y-3">
          {/* Cardio Info */}
          <div className="bg-gradient-to-r from-[#00D1FF]/10 to-[#22C55E]/10 border border-[#00D1FF]/20 rounded-lg p-3 mb-2">
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-[#00D1FF] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-300 leading-relaxed">
                  <span className="text-[#00D1FF] font-medium">Cardio Tracking:</span>{' '}
                  Track duration, distance, calories and heart rate for each interval
                </p>
              </div>
            </div>
          </div>

          {/* Sets header */}
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 px-2">
            <div className="col-span-1">✓</div>
            <div className="col-span-1">#</div>
            <div className="col-span-2">Time</div>
            <div className="col-span-2">Dist.</div>
            <div className="col-span-2">Cal</div>
            <div className="col-span-3">Intensity</div>
            <div className="col-span-1"></div>
          </div>

          {/* Sets */}
          {exercise.sets.map((set, index) => (
            <div key={set.id} className="space-y-2">
              <div
                className={`grid grid-cols-12 gap-2 items-center p-2 rounded-lg transition-colors ${
                  set.completed
                    ? 'bg-[#00D1FF]/10 border border-[#00D1FF]/30'
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
                <div className="col-span-1">
                  <span className="text-sm text-gray-400">{index + 1}</span>
                </div>

                {/* Duration input (minutes) */}
                <div className="col-span-2">
                  <div className="relative">
                    <Input
                      type="number"
                      value={set.duration || ''}
                      onChange={(e) => onUpdateSet(exercise.id, set.id, 'duration', e.target.value)}
                      placeholder="30"
                      disabled={set.completed}
                      className="h-8 bg-[#151923] border-[#151923] text-sm pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      min
                    </span>
                  </div>
                </div>

                {/* Distance input (km) */}
                <div className="col-span-2">
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={set.distance || ''}
                      onChange={(e) => onUpdateSet(exercise.id, set.id, 'distance', e.target.value)}
                      placeholder="5"
                      disabled={set.completed}
                      className="h-8 bg-[#151923] border-[#151923] text-sm pr-8"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                      km
                    </span>
                  </div>
                </div>

                {/* Calories input */}
                <div className="col-span-2">
                  <Input
                    type="number"
                    value={set.calories || ''}
                    onChange={(e) => onUpdateSet(exercise.id, set.id, 'calories', e.target.value)}
                    placeholder="300"
                    disabled={set.completed}
                    className="h-8 bg-[#151923] border-[#151923] text-sm"
                  />
                </div>

                {/* Intensity Selector */}
                <div className="col-span-3">
                  <div className="flex gap-1">
                    {(['low', 'moderate', 'high'] as const).map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => onUpdateSet(exercise.id, set.id, 'intensity', intensity)}
                        disabled={set.completed}
                        className={`flex-1 h-8 rounded text-xs font-medium transition-all ${
                          set.intensity === intensity
                            ? `${getIntensityColor(intensity)} text-white`
                            : 'bg-[#151923] text-gray-500 hover:bg-[#1a1f2e]'
                        } ${set.completed ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {getIntensityLabel(intensity)}
                      </button>
                    ))}
                  </div>
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

              {/* Optional Heart Rate */}
              {set.completed && (
                <div className="ml-14 flex items-center gap-2">
                  <Timer className="w-3 h-3 text-gray-500" />
                  <Input
                    type="number"
                    value={set.heartRate || ''}
                    onChange={(e) => onUpdateSet(exercise.id, set.id, 'heartRate', e.target.value)}
                    placeholder="Heart rate (BPM)"
                    className="h-7 bg-[#0B0B0F] border-[#151923] text-xs flex-1"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Add interval button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddSet(exercise.id)}
            className="w-full bg-transparent border-dashed border-gray-700 hover:border-[#00D1FF] hover:bg-[#00D1FF]/10"
          >
            <Timer className="w-4 h-4 mr-2" />
            Add Interval
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