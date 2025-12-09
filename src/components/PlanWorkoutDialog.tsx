import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Calendar, Dumbbell, Heart, Loader2, Plus, X, Search } from 'lucide-react';
import { getExercisesByType, Exercise } from '../data/exerciseLibrary';

interface ExerciseConfig {
  exercise: Exercise;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
}

interface PlanWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  onSchedule: (data: {
    date: Date;
    templateName: string;
    type: 'strength' | 'cardio';
    exercises: any[];
    notes?: string;
  }) => Promise<void>;
}

const workoutTypes = [
  { value: 'strength', label: 'Strength Training', icon: Dumbbell, color: 'from-[#22C55E] to-[#00D1FF]' },
  { value: 'cardio', label: 'Cardio', icon: Heart, color: 'from-red-500 to-pink-500' },
];

export function PlanWorkoutDialog({
  open,
  onOpenChange,
  selectedDate,
  onSchedule
}: PlanWorkoutDialogProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState<'strength' | 'cardio'>('strength');
  const [selectedExercises, setSelectedExercises] = useState<ExerciseConfig[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showExerciseLibrary, setShowExerciseLibrary] = useState(false);

  const availableExercises = useMemo(() => {
    const exercises = getExercisesByType(workoutType);
    if (!searchQuery.trim()) return exercises;
    
    return exercises.filter(ex =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscleGroup.some(mg => mg.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [workoutType, searchQuery]);

  const addExercise = (exercise: Exercise) => {
    const newConfig: ExerciseConfig = {
      exercise,
      sets: exercise.defaultSets,
      reps: exercise.defaultReps,
      duration: exercise.defaultDuration,
    };
    setSelectedExercises([...selectedExercises, newConfig]);
  };

  const removeExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const updateExerciseConfig = (index: number, field: keyof ExerciseConfig, value: number) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !workoutName.trim()) {
      console.log('⚠️ Missing data - selectedDate:', selectedDate, 'workoutName:', workoutName);
      return;
    }

    // Convert exercises to the format expected by Firebase, filtering out undefined values
    const exercisesData = selectedExercises.map(config => {
      const exerciseData: any = {
        name: config.exercise.name,
        type: config.exercise.type,
        sets: config.sets ?? config.exercise.defaultSets ?? 3,
        muscleGroup: config.exercise.muscleGroup,
        category: config.exercise.category,
      };

      // Only add fields that have values
      if (config.exercise.type === 'strength') {
        exerciseData.reps = config.reps ?? config.exercise.defaultReps ?? 10;
        exerciseData.weight = config.weight ?? 0;
      } else if (config.exercise.type === 'cardio') {
        exerciseData.duration = config.duration ?? config.exercise.defaultDuration ?? 30;
      }

      return exerciseData;
    });

    const workoutData: any = {
      date: selectedDate,
      templateName: workoutName,
      type: workoutType,
      exercises: exercisesData,
    };

    // Only add notes if they exist
    if (notes && notes.trim()) {
      workoutData.notes = notes.trim();
    }
    
    console.log('📝 PlanWorkoutDialog submitting:', workoutData);

    try {
      setIsLoading(true);
      await onSchedule(workoutData);
      console.log('✅ PlanWorkoutDialog: onSchedule completed');
      
      // Reset form
      setWorkoutName('');
      setSelectedExercises([]);
      setNotes('');
      setSearchQuery('');
      setShowExerciseLibrary(false);
      onOpenChange(false);
    } catch (error) {
      console.error('❌ PlanWorkoutDialog error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formattedDate = selectedDate?.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    availableExercises.forEach(ex => {
      if (!groups[ex.category]) {
        groups[ex.category] = [];
      }
      groups[ex.category].push(ex);
    });
    return groups;
  }, [availableExercises]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-[#22C55E]" />
            Plan Workout
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {formattedDate}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          {/* Workout Name */}
          <div className="space-y-2">
            <Label className="text-gray-300">Workout Name *</Label>
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              placeholder="e.g., Upper Body, Leg Day, Morning Run"
              className="bg-[#0B0B0F] border-white/10 text-white"
              required
            />
          </div>

          {/* Workout Type */}
          <div className="space-y-2">
            <Label className="text-gray-300">Workout Type</Label>
            <div className="grid grid-cols-2 gap-3">
              {workoutTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = workoutType === type.value;
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setWorkoutType(type.value as 'strength' | 'cardio');
                      setSelectedExercises([]);
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isSelected
                        ? `border-[#22C55E] bg-gradient-to-br ${type.color} bg-opacity-10`
                        : 'border-white/10 hover:border-white/20 bg-[#0B0B0F]'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${
                      isSelected ? 'text-[#22C55E]' : 'text-gray-400'
                    }`} />
                    <p className={`text-sm ${
                      isSelected ? 'text-white font-medium' : 'text-gray-400'
                    }`}>
                      {type.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Exercises */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">
                Exercises <span className="text-gray-500 text-xs">({selectedExercises.length} selected)</span>
              </Label>
              <Button
                type="button"
                size="sm"
                onClick={() => setShowExerciseLibrary(!showExerciseLibrary)}
                className="bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Exercises
              </Button>
            </div>

            {/* Selected exercises list */}
            {selectedExercises.length > 0 && (
              <div className="space-y-2 p-3 bg-[#0B0B0F] rounded-lg border border-white/5">
                {selectedExercises.map((config, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-[#151923] rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white text-sm font-medium">{config.exercise.name}</h4>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeExercise(index)}
                          className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <Badge className="bg-gray-700 text-gray-300">{config.exercise.category}</Badge>
                        <Badge className="bg-gray-700 text-gray-300">{config.exercise.muscleGroup.join(', ')}</Badge>
                      </div>
                      
                      {/* Optional configuration */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {config.exercise.type === 'strength' ? (
                          <>
                            <div>
                              <label className="text-xs text-gray-400">Sets</label>
                              <Input
                                type="number"
                                value={config.sets || ''}
                                onChange={(e) => updateExerciseConfig(index, 'sets', parseInt(e.target.value) || 0)}
                                placeholder="3"
                                className="h-8 bg-[#0B0B0F] border-white/10 text-white text-sm mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Reps</label>
                              <Input
                                type="number"
                                value={config.reps || ''}
                                onChange={(e) => updateExerciseConfig(index, 'reps', parseInt(e.target.value) || 0)}
                                placeholder="10"
                                className="h-8 bg-[#0B0B0F] border-white/10 text-white text-sm mt-1"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-400">Weight (kg)</label>
                              <Input
                                type="number"
                                value={config.weight || ''}
                                onChange={(e) => updateExerciseConfig(index, 'weight', parseInt(e.target.value) || 0)}
                                placeholder="0"
                                className="h-8 bg-[#0B0B0F] border-white/10 text-white text-sm mt-1"
                              />
                            </div>
                          </>
                        ) : (
                          <div>
                            <label className="text-xs text-gray-400">Duration (min)</label>
                            <Input
                              type="number"
                              value={config.duration || ''}
                              onChange={(e) => updateExerciseConfig(index, 'duration', parseInt(e.target.value) || 0)}
                              placeholder="30"
                              className="h-8 bg-[#0B0B0F] border-white/10 text-white text-sm mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exercise Library */}
            {showExerciseLibrary && (
              <div className="p-3 bg-[#0B0B0F] rounded-lg border border-white/5 max-h-[300px] overflow-y-auto">
                {/* Search */}
                <div className="mb-3 sticky top-0 bg-[#0B0B0F] pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search exercises..."
                      className="pl-10 bg-[#151923] border-white/10 text-white"
                    />
                  </div>
                </div>

                {/* Exercises by category */}
                {Object.entries(groupedExercises).map(([category, exercises]) => (
                  <div key={category} className="mb-3">
                    <h5 className="text-xs text-gray-400 uppercase font-medium mb-2">{category}</h5>
                    <div className="space-y-1">
                      {exercises.map((exercise) => {
                        const isAdded = selectedExercises.some(e => e.exercise.id === exercise.id);
                        return (
                          <button
                            key={exercise.id}
                            type="button"
                            onClick={() => !isAdded && addExercise(exercise)}
                            disabled={isAdded}
                            className={`w-full text-left p-2 rounded text-sm transition-colors ${
                              isAdded
                                ? 'bg-[#22C55E]/10 text-[#22C55E] cursor-not-allowed'
                                : 'hover:bg-[#151923] text-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span>{exercise.name}</span>
                              {isAdded && (
                                <Badge className="bg-[#22C55E]/20 text-[#22C55E] text-xs">Added</Badge>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {exercise.muscleGroup.join(', ')}
                              {exercise.defaultSets && ` • ${exercise.defaultSets}×${exercise.defaultReps}`}
                              {exercise.defaultDuration && ` • ${exercise.defaultDuration} min`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label className="text-gray-300">
              Notes <span className="text-gray-500 text-xs">(optional)</span>
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Focus on form, increase weight on squats..."
              className="bg-[#0B0B0F] border-white/10 text-white resize-none"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 hover:bg-white/5"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
              disabled={!workoutName.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Workout
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}