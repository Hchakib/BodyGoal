import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { 
  X, 
  Plus, 
  Trash2, 
  GripVertical,
  Award,
  TrendingUp,
  Zap,
  Target,
  Dumbbell
} from 'lucide-react';
import { 
  WorkoutTemplateData, 
  TemplateFocus, 
  TemplateDayWorkout,
  TemplateExercise 
} from '../firebase/workoutTemplates';
import { EXERCISE_LIBRARY } from '../firebase/exerciseLibrary';
import { toast } from 'sonner@2.0.3';

interface CreateTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: WorkoutTemplateData) => Promise<void>;
}

export function CreateTemplateDialog({ open, onOpenChange, onSave }: CreateTemplateDialogProps) {
  const [step, setStep] = useState(1); // 1: Info, 2: Workouts, 3: Exercises
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [focus, setFocus] = useState<TemplateFocus>('hypertrophy');
  const [daysPerWeek, setDaysPerWeek] = useState(1);
  const [workouts, setWorkouts] = useState<TemplateDayWorkout[]>([]);
  const [currentWorkoutIndex, setCurrentWorkoutIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Exercise search
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'strength' | 'cardio'>('strength');

  const focusOptions = [
    { value: 'strength', label: 'Strength', icon: Award, color: 'from-red-500 to-orange-500' },
    { value: 'hypertrophy', label: 'Hypertrophy', icon: TrendingUp, color: 'from-[#22C55E] to-[#00D1FF]' },
    { value: 'mixed', label: 'Mixed', icon: Zap, color: 'from-purple-500 to-pink-500' },
    { value: 'endurance', label: 'Endurance', icon: Target, color: 'from-blue-500 to-cyan-500' },
  ] as const;

  const handleCreateWorkouts = () => {
    const newWorkouts: TemplateDayWorkout[] = Array.from({ length: daysPerWeek }, (_, i) => ({
      dayNumber: i + 1,
      dayName: `Day ${i + 1}`,
      exercises: []
    }));
    setWorkouts(newWorkouts);
    setStep(2);
  };

  const handleUpdateWorkoutName = (index: number, newName: string) => {
    const updated = [...workouts];
    updated[index].dayName = newName;
    setWorkouts(updated);
  };

  const handleAddExercise = (workoutIndex: number, exerciseName: string) => {
    const newExercise: TemplateExercise = {
      id: `ex-${Date.now()}-${Math.random()}`,
      name: exerciseName,
      sets: 3,
      reps: '10',
      notes: ''
    };

    const updated = [...workouts];
    updated[workoutIndex].exercises.push(newExercise);
    setWorkouts(updated);
    setExerciseSearch('');
  };

  const handleRemoveExercise = (workoutIndex: number, exerciseId: string) => {
    const updated = [...workouts];
    updated[workoutIndex].exercises = updated[workoutIndex].exercises.filter(
      ex => ex.id !== exerciseId
    );
    setWorkouts(updated);
  };

  const handleUpdateExercise = (
    workoutIndex: number, 
    exerciseId: string, 
    field: keyof TemplateExercise, 
    value: any
  ) => {
    const updated = [...workouts];
    const exerciseIdx = updated[workoutIndex].exercises.findIndex(ex => ex.id === exerciseId);
    if (exerciseIdx !== -1) {
      updated[workoutIndex].exercises[exerciseIdx] = {
        ...updated[workoutIndex].exercises[exerciseIdx],
        [field]: value
      };
      setWorkouts(updated);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    if (workouts.length === 0) {
      toast.error('Please add at least one workout');
      return;
    }

    const hasExercises = workouts.some(w => w.exercises.length > 0);
    if (!hasExercises) {
      toast.error('Please add at least one exercise to your workouts');
      return;
    }

    setSaving(true);
    try {
      const data: WorkoutTemplateData = {
        name,
        description,
        focus,
        daysPerWeek,
        workouts
      };
      
      await onSave(data);
      toast.success('Template created successfully! 🎉');
      handleClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to create template');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setName('');
    setDescription('');
    setFocus('hypertrophy');
    setDaysPerWeek(1);
    setWorkouts([]);
    setCurrentWorkoutIndex(null);
    setExerciseSearch('');
    onOpenChange(false);
  };

  const filteredExercises = EXERCISE_LIBRARY
    .filter(ex => ex.type === selectedType)
    .filter(ex => 
      exerciseSearch === '' || 
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    )
    .slice(0, 10);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
      <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#151923] border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-white mb-1">Create Custom Template</h2>
            <p className="text-gray-400 text-sm">
              Step {step} of 2 - {step === 1 ? 'Template Info' : 'Add Workouts & Exercises'}
            </p>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Template Name */}
              <div>
                <Label htmlFor="name" className="text-white mb-2 block">
                  Template Name *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Upper/Lower Split"
                  className="bg-[#0B0B0F] border-white/10 text-white"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description" className="text-white mb-2 block">
                  Description (Optional)
                </Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the template..."
                  className="w-full h-24 bg-[#0B0B0F] border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-gray-500 resize-none"
                />
              </div>

              {/* Focus */}
              <div>
                <Label className="text-white mb-3 block">Focus Type *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {focusOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = focus === option.value;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => setFocus(option.value as TemplateFocus)}
                        className={`
                          p-4 rounded-xl border transition-all
                          ${isSelected 
                            ? `bg-gradient-to-r ${option.color} border-transparent` 
                            : 'bg-[#0B0B0F] border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                          <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {option.label}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Days Per Week */}
              <div>
                <Label className="text-white mb-3 block">
                  Number of Workouts * ({daysPerWeek} workout{daysPerWeek !== 1 ? 's' : ''})
                </Label>
                <p className="text-gray-400 text-sm mb-3">
                  Choose 1 for a single session template, or multiple workouts for a weekly program
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      onClick={() => setDaysPerWeek(num)}
                      className={`
                        flex-1 py-3 rounded-lg border transition-all
                        ${daysPerWeek === num 
                          ? 'bg-gradient-to-r from-[#22C55E] to-[#00D1FF] border-transparent text-white' 
                          : 'bg-[#0B0B0F] border-white/10 text-gray-400 hover:border-white/20'
                        }
                      `}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              {/* Workouts List */}
              <div className="space-y-4">
                {workouts.map((workout, idx) => (
                  <div
                    key={workout.dayNumber}
                    className="bg-[#0B0B0F] rounded-xl border border-white/10 p-5"
                  >
                    {/* Workout Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center shrink-0">
                        <span className="text-white font-semibold">{workout.dayNumber}</span>
                      </div>
                      <Input
                        value={workout.dayName}
                        onChange={(e) => handleUpdateWorkoutName(idx, e.target.value)}
                        placeholder="Workout name (e.g., Push, Pull, Legs)"
                        className="bg-[#151923] border-white/10 text-white"
                      />
                      <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30 shrink-0">
                        {workout.exercises.length} ex
                      </Badge>
                    </div>

                    {/* Exercise Search */}
                    <div className="mb-3">
                      <div className="flex gap-2 mb-2">
                        <button
                          onClick={() => setSelectedType('strength')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                            selectedType === 'strength'
                              ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30'
                              : 'bg-[#151923] text-gray-400 border border-white/5 hover:border-white/10'
                          }`}
                        >
                          Strength
                        </button>
                        <button
                          onClick={() => setSelectedType('cardio')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm transition-all ${
                            selectedType === 'cardio'
                              ? 'bg-[#00D1FF]/20 text-[#00D1FF] border border-[#00D1FF]/30'
                              : 'bg-[#151923] text-gray-400 border border-white/5 hover:border-white/10'
                          }`}
                        >
                          Cardio
                        </button>
                      </div>
                      <Input
                        value={currentWorkoutIndex === idx ? exerciseSearch : ''}
                        onChange={(e) => {
                          setCurrentWorkoutIndex(idx);
                          setExerciseSearch(e.target.value);
                        }}
                        onFocus={() => setCurrentWorkoutIndex(idx)}
                        placeholder="Search exercises to add..."
                        className="bg-[#151923] border-white/10 text-white"
                      />
                      
                      {/* Exercise Suggestions */}
                      {currentWorkoutIndex === idx && exerciseSearch && (
                        <div className="mt-2 bg-[#151923] border border-white/10 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                          {filteredExercises.map((exercise) => (
                            <button
                              key={exercise.id}
                              onClick={() => handleAddExercise(idx, exercise.name)}
                              className="w-full px-4 py-2 text-left text-white hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                              <Dumbbell className="w-4 h-4 text-[#22C55E]" />
                              {exercise.name}
                              <span className="ml-auto text-xs text-gray-500">
                                {exercise.muscleGroup.join(', ')}
                              </span>
                            </button>
                          ))}
                          {filteredExercises.length === 0 && (
                            <div className="px-4 py-3 text-gray-500 text-sm">
                              No exercises found
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Exercises List */}
                    {workout.exercises.length > 0 && (
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, exIdx) => (
                          <div
                            key={exercise.id}
                            className="flex items-center gap-3 bg-[#151923] rounded-lg p-3"
                          >
                            <GripVertical className="w-4 h-4 text-gray-600 shrink-0" />
                            <span className="text-gray-500 text-sm w-6 shrink-0">{exIdx + 1}.</span>
                            <span className="text-white flex-1">{exercise.name}</span>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              <Input
                                type="number"
                                value={exercise.sets}
                                onChange={(e) => handleUpdateExercise(idx, exercise.id, 'sets', parseInt(e.target.value) || 3)}
                                className="w-16 h-9 bg-[#0B0B0F] border-white/10 text-white text-center"
                                min="1"
                              />
                              <span className="text-gray-500">×</span>
                              <Input
                                value={exercise.reps}
                                onChange={(e) => handleUpdateExercise(idx, exercise.id, 'reps', e.target.value)}
                                placeholder="8-12"
                                className="w-20 h-9 bg-[#0B0B0F] border-white/10 text-white text-center"
                              />
                            </div>
                            
                            <Button
                              onClick={() => handleRemoveExercise(idx, exercise.id)}
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-red-500 hover:bg-red-500/10 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {workout.exercises.length === 0 && (
                      <div className="text-center py-6 text-gray-500 text-sm">
                        No exercises added yet. Search above to add exercises.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#151923] border-t border-white/10 p-6 flex items-center justify-between">
          <Button
            onClick={handleClose}
            variant="outline"
            className="border-white/10 hover:bg-white/5"
          >
            Cancel
          </Button>

          <div className="flex gap-3">
            {step === 2 && (
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="border-white/10 hover:bg-white/5"
              >
                Back
              </Button>
            )}
            
            {step === 1 ? (
              <Button
                onClick={handleCreateWorkouts}
                disabled={!name.trim()}
                className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
              >
                Next: Add Workouts
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                disabled={saving || workouts.every(w => w.exercises.length === 0)}
                className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
              >
                {saving ? 'Creating...' : 'Create Template'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}