import { useState, useEffect, useRef } from 'react';
import { Dumbbell, Plus, Check, X, Save, Zap, Trophy, BookOpen, LayoutGrid } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Header } from './Header';
import { Footer } from './Footer';
import { ExerciseCardEnhanced } from './ExerciseCardEnhanced';
import { CardioExerciseCard } from './CardioExerciseCard';
import { WorkoutTimer } from './WorkoutTimer';
import { RestTimer } from './RestTimer';
import { WorkoutStats } from './WorkoutStats';
import { ExerciseLibraryDialog } from './ExerciseLibraryDialog';
import { useWorkouts } from '../hooks/useWorkouts';
import { toast } from 'sonner@2.0.3';
import { Timestamp } from 'firebase/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

const workoutTemplates = [
  {
    id: 1,
    name: 'Upper Body Power',
    type: 'strength',
    icon: '💪',
    exercises: ['Bench Press', 'Overhead Press', 'Barbell Row', 'Pull-ups', 'Tricep Pushdowns'],
    duration: '45-60 min',
    difficulty: 'Intermediate',
  },
  {
    id: 2,
    name: 'Leg Day',
    type: 'strength',
    icon: '🦵',
    exercises: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises'],
    duration: '50-65 min',
    difficulty: 'Advanced',
  },
  {
    id: 3,
    name: 'Push Day',
    type: 'strength',
    icon: '🏋️',
    exercises: ['Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Lateral Raises', 'Tricep Extensions'],
    duration: '40-55 min',
    difficulty: 'Intermediate',
  },
  {
    id: 4,
    name: 'Pull Day',
    type: 'strength',
    icon: '🎯',
    exercises: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Lat Pulldowns', 'Bicep Curls'],
    duration: '45-60 min',
    difficulty: 'Advanced',
  },
  {
    id: 5,
    name: 'Full Body',
    type: 'strength',
    icon: '🔥',
    exercises: ['Back Squat', 'Bench Press', 'Deadlift', 'Overhead Press', 'Barbell Row'],
    duration: '60-75 min',
    difficulty: 'Advanced',
  },
  {
    id: 6,
    name: 'Cardio Blast',
    type: 'cardio',
    icon: '❤️',
    exercises: ['Running', 'Cycling', 'Jump Rope', 'Burpees', 'Mountain Climbers'],
    duration: '30-45 min',
    difficulty: 'Beginner',
  },
];

interface ExerciseSet {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
  intensity?: 'easy' | 'medium' | 'hard';
  // Cardio fields
  duration?: string;
  distance?: string;
  calories?: string;
  heartRate?: string;
}

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
  exerciseType?: 'strength' | 'cardio'; // Track individual exercise type
}

interface StartSessionPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
  scheduledWorkout?: any;
}

export function StartSessionPageEnhanced({ onNavigate, onLogout, scheduledWorkout }: StartSessionPageProps) {
  const { addWorkout } = useWorkouts();
  const [step, setStep] = useState<'select' | 'active'>('select');
  const [sessionType, setSessionType] = useState<'strength' | 'cardio' | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
  const [workoutNotes, setWorkoutNotes] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize from scheduled workout if provided
  useEffect(() => {
    if (scheduledWorkout) {
      console.log('🎯 Starting scheduled workout:', scheduledWorkout);
      setSessionType(scheduledWorkout.type);
      setSessionName(scheduledWorkout.templateName);
      
      // Convert scheduled exercises to Exercise format
      const exercisesList: Exercise[] = scheduledWorkout.exercises.map((ex: any, index: number) => ({
        id: `ex-${Date.now()}-${index}`,
        name: ex.name,
        sets: ex.sets ? Array.from({ length: ex.sets }, (_, i) => ({
          id: `set-${Date.now()}-${index}-${i}`,
          reps: String(ex.reps || 0),
          weight: String(ex.weight || 0),
          duration: String(ex.duration || ''),
          distance: String(ex.distance || ''),
          calories: String(ex.calories || ''),
          heartRate: '',
          completed: false,
        })) : [],
        notes: ex.notes || '',
        exerciseType: scheduledWorkout.type // Use workout type as exercise type
      }));
      
      setExercises(exercisesList);
      setWorkoutNotes(scheduledWorkout.notes || '');
      
      // Auto-start the session
      setStep('active');
      setIsTimerRunning(true);
      
      toast.success(`Starting ${scheduledWorkout.templateName}! 💪`);
    }
  }, [scheduledWorkout]);

  // Main timer effect
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  // Rest timer effect
  useEffect(() => {
    if (restTimerActive && restTimer !== null && restTimer > 0) {
      const restTimerRef = setInterval(() => {
        setRestTimer(prev => {
          if (prev === null || prev <= 1) {
            setRestTimerActive(false);
            toast.success('Rest complete! 💪', {
              description: 'Ready for your next set',
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(restTimerRef);
    }
  }, [restTimerActive, restTimer]);

  const startFromTemplate = (template: typeof workoutTemplates[0]) => {
    const newExercises: Exercise[] = template.exercises.map((name, idx) => ({
      id: `ex-${Date.now()}-${idx}`,
      name,
      sets: [
        { id: `set-${Date.now()}-${idx}-0`, reps: '', weight: '', completed: false },
      ],
    }));
    setExercises(newExercises);
    setSessionType(template.type as 'strength' | 'cardio');
    setSessionName(template.name);
    setStep('active');
    setIsTimerRunning(true);
    toast.success('Workout started! 🔥', {
      description: `${template.name} session in progress`,
    });
  };

  const startBlank = (type: 'strength' | 'cardio') => {
    setSessionType(type);
    setSessionName(type === 'strength' ? 'Strength Training' : 'Cardio Session');
    setStep('active');
    setIsTimerRunning(true);
    toast.success('Workout started! 💪', {
      description: 'Add exercises to begin',
    });
  };

  const addExerciseFromLibrary = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: exerciseName,
      sets: [
        { id: `set-${Date.now()}-0`, reps: '', weight: '', completed: false },
      ],
    };
    setExercises([...exercises, newExercise]);
    toast.success(`${exerciseName} added! ✅`);
  };

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              return { ...s, [field]: value };
            }
            return s;
          }),
        };
      }
      return ex;
    }));
  };

  const updateIntensity = (exerciseId: string, setId: string, intensity: 'easy' | 'medium' | 'hard') => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              return { ...s, intensity };
            }
            return s;
          }),
        };
      }
      return ex;
    }));
    
    // Show feedback based on intensity
    const intensityMessages = {
      easy: 'Easy set! 💪 Weight will increase next time (+2.5kg)',
      medium: 'Good effort! 👍 Keep this weight for next session',
      hard: 'Tough set! 😤 Weight will decrease next time (-2.5kg)'
    };
    toast.success(intensityMessages[intensity]);
  };

  const toggleSetComplete = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => {
            if (s.id === setId) {
              const newCompleted = !s.completed;
              if (newCompleted) {
                // Start rest timer when completing a set
                startRestTimer(90);
                toast.success('Set completed! 💯');
              }
              return { ...s, completed: newCompleted };
            }
            return s;
          }),
        };
      }
      return ex;
    }));
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return {
          ...ex,
          sets: [...ex.sets, { 
            id: `set-${Date.now()}`, 
            reps: lastSet.reps, 
            weight: lastSet.weight, 
            completed: false 
          }],
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId),
        };
      }
      return ex;
    }));
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
    toast.success('Exercise removed');
  };

  const updateExerciseNotes = (exerciseId: string, notes: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, notes };
      }
      return ex;
    }));
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    setRestTimerActive(true);
  };

  const stopRestTimer = () => {
    setRestTimer(null);
    setRestTimerActive(false);
  };

  const adjustRestTimer = (adjustment: number) => {
    setRestTimer(prev => {
      if (prev === null) return null;
      return Math.max(0, prev + adjustment);
    });
  };

  const handleFinishWorkout = () => {
    if (exercises.length === 0) {
      toast.error('Add at least one exercise to save the workout');
      return;
    }

    const hasCompletedSets = exercises.some(ex => ex.sets.some(s => s.completed));
    if (!hasCompletedSets) {
      toast.error('Complete at least one set to save the workout');
      return;
    }

    setIsFinishDialogOpen(true);
  };

  const saveWorkout = async () => {
    setIsSaving(true);
    
    try {
      const workoutData = {
        name: sessionName,
        date: Timestamp.now(),
        duration: Math.round(elapsedTime / 60),
        type: sessionType || 'strength',
        exercises: exercises.map(ex => {
          const exerciseData: any = {
            name: ex.name,
            sets: ex.sets
              .filter(s => s.completed)
              .map(s => ({
                reps: parseInt(s.reps) || 0,
                weight: parseFloat(s.weight) || 0,
              })),
          };
          
          // Only add notes if they exist
          if (ex.notes && ex.notes.trim() !== '') {
            exerciseData.notes = ex.notes;
          }
          
          return exerciseData;
        }).filter(ex => ex.sets.length > 0),
        ...(workoutNotes && workoutNotes.trim() !== '' ? { notes: workoutNotes } : {}),
      };

      await addWorkout(workoutData);
      
      toast.success('Workout saved! 🎉', {
        description: 'Great job on your session!',
      });
      
      // Reset and navigate
      setTimeout(() => {
        onNavigate('home');
      }, 500);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelWorkout = () => {
    if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
      onNavigate('home');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30';
      case 'Intermediate':
        return 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30';
      case 'Advanced':
        return 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col">
      <Header onNavigate={onNavigate} currentPage="start-session" />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {step === 'select' ? (
          // Template Selection
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] mb-4">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl mb-2">Start a Workout</h1>
              <p className="text-gray-400">Choose a template or start from scratch</p>
            </div>

            {/* Quick Start */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => startBlank('strength')}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#22C55E]/20 via-[#151923] to-[#00D1FF]/20 border border-[#22C55E]/30 p-8 hover:border-[#22C55E]/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/5 to-[#00D1FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-center">
                  <div className="text-4xl mb-3">💪</div>
                  <h3 className="text-xl mb-2">Strength Training</h3>
                  <p className="text-sm text-gray-400">Start a blank strength workout</p>
                </div>
              </button>

              <button
                onClick={() => startBlank('cardio')}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F59E0B]/20 via-[#151923] to-[#EF4444]/20 border border-[#F59E0B]/30 p-8 hover:border-[#F59E0B]/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/5 to-[#EF4444]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative text-center">
                  <div className="text-4xl mb-3">❤️</div>
                  <h3 className="text-xl mb-2">Cardio Session</h3>
                  <p className="text-sm text-gray-400">Start a blank cardio workout</p>
                </div>
              </button>
            </div>

            {/* Templates */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#22C55E]" />
                  Workout Templates
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workoutTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => startFromTemplate(template)}
                    className="group text-left rounded-xl bg-[#151923] border border-[#151923] p-6 hover:border-[#22C55E]/30 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-3xl">{template.icon}</div>
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>

                    <h3 className="text-lg mb-2 group-hover:text-[#22C55E] transition-colors">
                      {template.name}
                    </h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="text-xs text-gray-500">{template.duration}</div>
                      <div className="text-xs text-gray-400">
                        {template.exercises.length} exercises
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.exercises.slice(0, 3).map((exercise, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 rounded bg-[#0B0B0F] text-gray-500">
                          {exercise}
                        </span>
                      ))}
                      {template.exercises.length > 3 && (
                        <span className="text-xs px-2 py-1 rounded bg-[#0B0B0F] text-gray-500">
                          +{template.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Active Workout
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl mb-1">{sessionName}</h1>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30">
                    {sessionType === 'strength' ? 'Strength' : 'Cardio'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelWorkout}
                  className="bg-transparent border-gray-700 hover:bg-red-500/10 hover:border-red-500/30 text-red-400"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleFinishWorkout}
                  className="bg-[#22C55E] hover:bg-[#22C55E]/90"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Finish
                </Button>
              </div>
            </div>

            {/* Timer */}
            <WorkoutTimer
              elapsedTime={elapsedTime}
              isRunning={isTimerRunning}
              onToggle={() => setIsTimerRunning(!isTimerRunning)}
              onReset={() => setElapsedTime(0)}
            />

            {/* Stats */}
            <WorkoutStats exercises={exercises} />

            {/* Exercises */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-[#22C55E]" />
                  Exercises
                </h2>
                <Button
                  onClick={() => setIsLibraryOpen(true)}
                  className="bg-[#22C55E] hover:bg-[#22C55E]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>
              </div>

              {exercises.length === 0 ? (
                <div className="text-center py-16 rounded-xl bg-[#151923] border border-[#151923] border-dashed">
                  <Dumbbell className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">No exercises added yet</p>
                  <Button
                    onClick={() => setIsLibraryOpen(true)}
                    className="bg-[#22C55E] hover:bg-[#22C55E]/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Exercise
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map(exercise => {
                    // Determine if this is a cardio exercise
                    const isCardio = exercise.exerciseType === 'cardio' || sessionType === 'cardio';
                    
                    return isCardio ? (
                      <CardioExerciseCard
                        key={exercise.id}
                        exercise={exercise as any}
                        onUpdateSet={(exerciseId, setId, field, value) => {
                          setExercises(exercises.map(ex => {
                            if (ex.id === exerciseId) {
                              return {
                                ...ex,
                                sets: ex.sets.map(s => {
                                  if (s.id === setId) {
                                    return { ...s, [field]: value };
                                  }
                                  return s;
                                }),
                              };
                            }
                            return ex;
                          }));
                        }}
                        onToggleSet={toggleSetComplete}
                        onAddSet={(exerciseId) => {
                          setExercises(exercises.map(ex => {
                            if (ex.id === exerciseId) {
                              const lastSet = ex.sets[ex.sets.length - 1];
                              return {
                                ...ex,
                                sets: [...ex.sets, { 
                                  id: `set-${Date.now()}`, 
                                  duration: lastSet.duration || '',
                                  distance: lastSet.distance || '',
                                  calories: lastSet.calories || '',
                                  reps: '',
                                  weight: '',
                                  completed: false 
                                }],
                              };
                            }
                            return ex;
                          }));
                        }}
                        onRemoveSet={removeSet}
                        onRemoveExercise={removeExercise}
                        onUpdateNotes={updateExerciseNotes}
                      />
                    ) : (
                      <ExerciseCardEnhanced
                        key={exercise.id}
                        exercise={exercise}
                        onUpdateSet={updateSet}
                        onUpdateIntensity={updateIntensity}
                        onToggleSet={toggleSetComplete}
                        onAddSet={addSet}
                        onRemoveSet={removeSet}
                        onRemoveExercise={removeExercise}
                        onUpdateNotes={updateExerciseNotes}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* Rest Timer */}
      <RestTimer
        seconds={restTimer || 0}
        isActive={restTimerActive}
        onStop={stopRestTimer}
        onAdjust={adjustRestTimer}
      />

      {/* Exercise Library Dialog */}
      <ExerciseLibraryDialog
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onSelectExercise={addExerciseFromLibrary}
      />

      {/* Finish Workout Dialog */}
      <Dialog open={isFinishDialogOpen} onOpenChange={setIsFinishDialogOpen}>
        <DialogContent className="bg-[#151923] border-[#151923]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#22C55E]" />
              Finish Workout
            </DialogTitle>
            <DialogDescription>
              Great job! Add any notes about your session.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-gray-400 mb-2 block">Workout Notes (Optional)</Label>
              <Textarea
                value={workoutNotes}
                onChange={(e) => setWorkoutNotes(e.target.value)}
                placeholder="How did you feel? Any achievements or observations..."
                className="bg-[#0B0B0F] border-[#151923] min-h-[100px]"
              />
            </div>

            {/* Summary */}
            <div className="p-4 rounded-lg bg-[#0B0B0F] space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Duration</span>
                <span>{Math.round(elapsedTime / 60)} minutes</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Exercises</span>
                <span>{exercises.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Completed Sets</span>
                <span>
                  {exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFinishDialogOpen(false)}
              disabled={isSaving}
              className="bg-transparent border-gray-700"
            >
              Back to Workout
            </Button>
            <Button
              onClick={saveWorkout}
              disabled={isSaving}
              className="bg-[#22C55E] hover:bg-[#22C55E]/90"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Workout'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}