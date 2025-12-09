import { useState, useEffect, useRef } from 'react';
import { Dumbbell, Heart, Plus, Play, Pause, Check, X, Clock, Search, ChevronRight, Trash2, Timer } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Header } from './Header';
import { Footer } from './Footer';
import { useWorkouts } from '../hooks/useWorkouts';
import { toast } from 'sonner@2.0.3';
import { Label } from './ui/label';
import { Timestamp } from 'firebase/firestore';

const workoutTemplates = [
  {
    id: 1,
    name: 'Upper Body Power',
    type: 'strength',
    exercises: ['Bench Press', 'Overhead Press', 'Barbell Row', 'Pull-ups', 'Tricep Pushdowns'],
    duration: '45-60 min',
  },
  {
    id: 2,
    name: 'Leg Day',
    type: 'strength',
    exercises: ['Back Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises'],
    duration: '50-65 min',
  },
  {
    id: 3,
    name: 'Push Day',
    type: 'strength',
    exercises: ['Bench Press', 'Incline Dumbbell Press', 'Overhead Press', 'Lateral Raises', 'Tricep Extensions'],
    duration: '40-55 min',
  },
  {
    id: 4,
    name: 'Pull Day',
    type: 'strength',
    exercises: ['Deadlift', 'Pull-ups', 'Barbell Rows', 'Lat Pulldowns', 'Bicep Curls'],
    duration: '45-60 min',
  },
  {
    id: 5,
    name: 'Cardio Session',
    type: 'cardio',
    exercises: ['Running', 'Cycling'],
    duration: '30-45 min',
  },
];

const exerciseLibrary = [
  { name: 'Bench Press', category: 'Chest', type: 'Compound' },
  { name: 'Incline Dumbbell Press', category: 'Chest', type: 'Compound' },
  { name: 'Cable Flyes', category: 'Chest', type: 'Isolation' },
  { name: 'Dumbbell Press', category: 'Chest', type: 'Compound' },
  { name: 'Push-ups', category: 'Chest', type: 'Bodyweight' },
  { name: 'Back Squat', category: 'Legs', type: 'Compound' },
  { name: 'Front Squat', category: 'Legs', type: 'Compound' },
  { name: 'Romanian Deadlift', category: 'Legs', type: 'Compound' },
  { name: 'Leg Press', category: 'Legs', type: 'Compound' },
  { name: 'Leg Curls', category: 'Legs', type: 'Isolation' },
  { name: 'Leg Extensions', category: 'Legs', type: 'Isolation' },
  { name: 'Calf Raises', category: 'Legs', type: 'Isolation' },
  { name: 'Deadlift', category: 'Back', type: 'Compound' },
  { name: 'Pull-ups', category: 'Back', type: 'Compound' },
  { name: 'Barbell Row', category: 'Back', type: 'Compound' },
  { name: 'Lat Pulldowns', category: 'Back', type: 'Compound' },
  { name: 'Seated Cable Rows', category: 'Back', type: 'Compound' },
  { name: 'T-Bar Rows', category: 'Back', type: 'Compound' },
  { name: 'Overhead Press', category: 'Shoulders', type: 'Compound' },
  { name: 'Lateral Raises', category: 'Shoulders', type: 'Isolation' },
  { name: 'Front Raises', category: 'Shoulders', type: 'Isolation' },
  { name: 'Face Pulls', category: 'Shoulders', type: 'Isolation' },
  { name: 'Tricep Pushdowns', category: 'Arms', type: 'Isolation' },
  { name: 'Tricep Extensions', category: 'Arms', type: 'Isolation' },
  { name: 'Bicep Curls', category: 'Arms', type: 'Isolation' },
  { name: 'Hammer Curls', category: 'Arms', type: 'Isolation' },
  { name: 'Preacher Curls', category: 'Arms', type: 'Isolation' },
  { name: 'Running', category: 'Cardio', type: 'Cardio' },
  { name: 'Cycling', category: 'Cardio', type: 'Cardio' },
  { name: 'Rowing', category: 'Cardio', type: 'Cardio' },
  { name: 'Swimming', category: 'Cardio', type: 'Cardio' },
];

interface ExerciseSet {
  id: string;
  reps: string;
  weight: string;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

interface StartSessionPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function StartSessionPage({ onNavigate, onLogout }: StartSessionPageProps) {
  const { addWorkout } = useWorkouts();
  const [step, setStep] = useState<'select' | 'active'>('select');
  const [sessionType, setSessionType] = useState<'strength' | 'cardio' | null>(null);
  const [sessionName, setSessionName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [notes, setNotes] = useState('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const restTimerRef = useRef<NodeJS.Timeout | null>(null);

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
      restTimerRef.current = setInterval(() => {
        setRestTimer(prev => {
          if (prev === null || prev <= 1) {
            setRestTimerActive(false);
            toast.success('Rest time complete!', {
              description: 'Ready for your next set',
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    }
    
    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
      }
    };
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
    toast.success('Workout started!', {
      description: `${template.name} session in progress`,
    });
  };

  const startBlank = (type: 'strength' | 'cardio') => {
    setSessionType(type);
    setSessionName(type === 'strength' ? 'Strength Training' : 'Cardio Session');
    setStep('active');
    setIsTimerRunning(true);
    toast.success('Workout started!', {
      description: 'Add exercises to begin',
    });
  };

  const addExercise = (exerciseName: string) => {
    const newExercise: Exercise = {
      id: `ex-${Date.now()}`,
      name: exerciseName,
      sets: [
        { id: `set-${Date.now()}-0`, reps: '', weight: '', completed: false },
      ],
    };
    setExercises([...exercises, newExercise]);
    setIsAddExerciseOpen(false);
    setExerciseSearch('');
    toast.success(`${exerciseName} added!`);
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        // Copy values from previous set
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
                startRestTimer(90); // 90 seconds default
                toast.success('Set completed!', {
                  description: '90 second rest started',
                });
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

  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s),
        };
      }
      return ex;
    }));
  };

  const removeExercise = (exerciseId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
    toast.info(`${exercise?.name} removed`);
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId && ex.sets.length > 1) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId),
        };
      }
      return ex;
    }));
  };

  const startRestTimer = (seconds: number) => {
    setRestTimer(seconds);
    setRestTimerActive(true);
  };

  const skipRest = () => {
    setRestTimer(null);
    setRestTimerActive(false);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const completeSession = async () => {
    if (exercises.length === 0) {
      toast.error('Cannot save empty workout', {
        description: 'Add at least one exercise',
      });
      return;
    }

    // Check if all exercises have at least one completed set
    const hasCompletedSets = exercises.some(ex => ex.sets.some(set => set.completed));
    if (!hasCompletedSets) {
      toast.error('No sets completed', {
        description: 'Complete at least one set to save workout',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Prepare workout data
      const workoutExercises = exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets
          .filter(set => set.completed && set.reps && set.weight)
          .map(set => ({
            reps: parseInt(set.reps) || 0,
            weight: parseFloat(set.weight) || 0,
          })),
      })).filter(ex => ex.sets.length > 0); // Only include exercises with completed sets

      if (workoutExercises.length === 0) {
        toast.error('No completed sets to save');
        setIsSaving(false);
        return;
      }

      // Calculate duration in minutes (minimum 1 minute)
      const durationInMinutes = Math.max(1, Math.floor(elapsedTime / 60));

      const workoutData: any = {
        name: sessionName,
        type: sessionType || 'strength',
        exercises: workoutExercises,
        duration: durationInMinutes,
        date: Timestamp.now(),
      };

      // Only add notes if they exist
      if (notes.trim()) {
        workoutData.notes = notes.trim();
      }

      console.log('Saving workout data:', workoutData); // Debug log

      await addWorkout(workoutData);
      
      toast.success('Workout saved successfully! 🎉', {
        description: `${workoutExercises.length} exercises completed in ${formatTime(elapsedTime)}`,
      });

      // Reset state
      setStep('select');
      setExercises([]);
      setElapsedTime(0);
      setIsTimerRunning(false);
      setSessionName('');
      setSessionType(null);
      setNotes('');
      setRestTimer(null);
      setRestTimerActive(false);

      // Navigate to home after short delay
      setTimeout(() => {
        onNavigate('home');
      }, 1500);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const cancelSession = () => {
    if (exercises.length > 0 || elapsedTime > 0) {
      if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
        setStep('select');
        setExercises([]);
        setElapsedTime(0);
        setIsTimerRunning(false);
        setSessionName('');
        setSessionType(null);
        setNotes('');
        setRestTimer(null);
        setRestTimerActive(false);
        toast.info('Workout cancelled');
      }
    } else {
      setStep('select');
    }
  };

  const filteredExercises = exerciseLibrary.filter(ex =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning) {
      toast.info('Timer resumed');
    } else {
      toast.info('Timer paused');
    }
  };

  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0);

  if (step === 'select') {
    return (
      <div className="min-h-screen bg-[#0B0B0F]">
        <Header onNavigate={onNavigate} onLogout={onLogout} />
        <main className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2">Start New Session</h1>
          <p className="text-[#FFFFFF]/60">Choose a template or start from scratch</p>
        </div>

        {/* Quick Start */}
        <div className="mb-12">
          <h3 className="mb-6">Quick Start</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              onClick={() => startBlank('strength')}
              className="bg-[#151923] rounded-xl p-8 border border-[#151923] hover:border-[#22C55E]/30 transition-all duration-300 cursor-pointer group hover:scale-105"
            >
              <div className="w-12 h-12 rounded-lg bg-[#22C55E]/10 flex items-center justify-center mb-4 group-hover:bg-[#22C55E]/20 transition-colors">
                <Dumbbell className="w-6 h-6 text-[#22C55E]" />
              </div>
              <h4 className="mb-2">Strength Training</h4>
              <p className="text-[#FFFFFF]/60">Start a blank strength workout</p>
            </div>
            <div
              onClick={() => startBlank('cardio')}
              className="bg-[#151923] rounded-xl p-8 border border-[#151923] hover:border-[#00D1FF]/30 transition-all duration-300 cursor-pointer group hover:scale-105"
            >
              <div className="w-12 h-12 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center mb-4 group-hover:bg-[#00D1FF]/20 transition-colors">
                <Heart className="w-6 h-6 text-[#00D1FF]" />
              </div>
              <h4 className="mb-2">Cardio Session</h4>
              <p className="text-[#FFFFFF]/60">Start a blank cardio workout</p>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div>
          <h3 className="mb-6">Workout Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workoutTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => startFromTemplate(template)}
                className="bg-[#151923] rounded-xl p-6 border border-[#151923] hover:border-[#22C55E]/30 transition-all duration-300 cursor-pointer group hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      template.type === 'strength' ? 'bg-[#22C55E]/10 group-hover:bg-[#22C55E]/20' : 'bg-[#00D1FF]/10 group-hover:bg-[#00D1FF]/20'
                    }`}>
                      {template.type === 'strength' ? (
                        <Dumbbell className="w-5 h-5 text-[#22C55E]" />
                      ) : (
                        <Heart className="w-5 h-5 text-[#00D1FF]" />
                      )}
                    </div>
                    <div>
                      <h4 className="mb-1">{template.name}</h4>
                      <p className="text-sm text-[#FFFFFF]/60">{template.duration}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#FFFFFF]/40 group-hover:text-[#22C55E] transition-colors" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {template.exercises.slice(0, 3).map((ex) => (
                    <Badge key={ex} className="bg-[#FFFFFF]/5 text-[#FFFFFF]/60 border-0">
                      {ex}
                    </Badge>
                  ))}
                  {template.exercises.length > 3 && (
                    <Badge className="bg-[#FFFFFF]/5 text-[#FFFFFF]/60 border-0">
                      +{template.exercises.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header onNavigate={onNavigate} onLogout={onLogout} />
      <main className="max-w-[1200px] mx-auto px-6 py-12">
      {/* Session Header */}
      <div className="bg-[#151923] rounded-xl p-6 border border-[#151923] mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              sessionType === 'strength' ? 'bg-[#22C55E]/10' : 'bg-[#00D1FF]/10'
            }`}>
              {sessionType === 'strength' ? (
                <Dumbbell className="w-6 h-6 text-[#22C55E]" />
              ) : (
                <Heart className="w-6 h-6 text-[#00D1FF]" />
              )}
            </div>
            <div>
              <h2>{sessionName}</h2>
              <p className="text-[#FFFFFF]/60">
                {exercises.length} exercise{exercises.length !== 1 ? 's' : ''} • {formatTime(elapsedTime)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTimer}
              className="bg-transparent border-[#0B0B0F] text-[#FFFFFF] hover:bg-[#0B0B0F] hover:text-[#FFFFFF]"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              onClick={cancelSession}
              className="bg-transparent border-[#0B0B0F] text-[#FFFFFF] hover:bg-[#0B0B0F] hover:text-[#FFFFFF]"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={completeSession}
              disabled={isSaving}
              className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-[#0B0B0F]"
            >
              <Check className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Complete'}
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {totalSets > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{completedSets}/{totalSets} sets completed</span>
            </div>
            <div className="h-2 bg-[#0B0B0F] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#22C55E] to-[#00D1FF] transition-all duration-300"
                style={{ width: `${(completedSets / totalSets) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Rest Timer Banner */}
      {restTimerActive && restTimer !== null && (
        <div className="bg-gradient-to-r from-[#00D1FF]/20 to-[#22C55E]/20 rounded-xl p-6 border border-[#00D1FF]/30 mb-8 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#00D1FF]/20 flex items-center justify-center">
                <Timer className="w-6 h-6 text-[#00D1FF]" />
              </div>
              <div>
                <h3 className="text-white mb-1">Rest Timer</h3>
                <p className="text-2xl text-[#00D1FF]">{formatTime(restTimer)}</p>
              </div>
            </div>
            <Button
              onClick={skipRest}
              variant="outline"
              className="border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10"
            >
              Skip Rest
            </Button>
          </div>
        </div>
      )}

      {/* Exercises */}
      <div className="space-y-6 mb-8">
        {exercises.map((exercise, exIdx) => (
          <div key={exercise.id} className="bg-[#151923] rounded-xl border border-[#151923] overflow-hidden">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h4>{exercise.name}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExercise(exercise.id)}
                  className="text-[#FFFFFF]/40 hover:text-red-500 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Sets Header */}
              <div className="grid grid-cols-12 gap-4 mb-2 text-sm text-[#FFFFFF]/60">
                <div className="col-span-2 text-center">Set</div>
                <div className="col-span-3 text-center">Reps</div>
                <div className="col-span-3 text-center">Weight (kg)</div>
                <div className="col-span-2 text-center">Rest</div>
                <div className="col-span-2"></div>
              </div>

              {/* Sets */}
              <div className="space-y-3">
                {exercise.sets.map((set, setIdx) => (
                  <div key={set.id} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-2 text-center">
                      <Badge className="bg-[#FFFFFF]/5 text-[#FFFFFF] border-0">
                        {setIdx + 1}
                      </Badge>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="0"
                        value={set.reps}
                        onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                        className="bg-[#0B0B0F] border-[#0B0B0F] text-[#FFFFFF] text-center"
                        disabled={set.completed}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="0"
                        value={set.weight}
                        onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                        className="bg-[#0B0B0F] border-[#0B0B0F] text-[#FFFFFF] text-center"
                        disabled={set.completed}
                      />
                    </div>
                    <div className="col-span-2 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startRestTimer(90)}
                        className="text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
                        disabled={!set.completed}
                      >
                        <Timer className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="col-span-2 flex items-center gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSetComplete(exercise.id, set.id)}
                        disabled={!set.reps || !set.weight}
                        className={set.completed ? 'bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 hover:text-[#22C55E]' : 'text-[#FFFFFF]/40 hover:text-[#FFFFFF] hover:bg-[#FFFFFF]/5'}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      {exercise.sets.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSet(exercise.id, set.id)}
                          className="text-[#FFFFFF]/40 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="ghost"
                onClick={() => addSet(exercise.id)}
                className="w-full mt-4 text-[#22C55E] hover:text-[#22C55E] hover:bg-[#22C55E]/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Set
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes Section */}
      {exercises.length > 0 && (
        <div className="bg-[#151923] rounded-xl p-6 border border-[#151923] mb-8">
          <Label className="text-white mb-2">Workout Notes (Optional)</Label>
          <Input
            placeholder="How did this workout feel? Any observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-[#0B0B0F] border-[#0B0B0F] text-white"
          />
        </div>
      )}

      {/* Add Exercise */}
      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogTrigger asChild>
          <Button className="w-full bg-[#151923] border border-[#151923] text-[#FFFFFF] hover:bg-[#151923]/80 hover:text-[#FFFFFF] hover:border-[#22C55E]/30">
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#151923] border-[#151923] text-[#FFFFFF] max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFFFFF]/40" />
              <Input
                placeholder="Search exercises..."
                value={exerciseSearch}
                onChange={(e) => setExerciseSearch(e.target.value)}
                className="pl-10 bg-[#0B0B0F] border-[#0B0B0F] text-[#FFFFFF]"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.name}
                  onClick={() => addExercise(ex.name)}
                  className="p-4 bg-[#0B0B0F] rounded-lg hover:bg-[#0B0B0F]/60 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="mb-1">{ex.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-0 text-xs">
                          {ex.category}
                        </Badge>
                        <Badge className="bg-[#00D1FF]/10 text-[#00D1FF] border-0 text-xs">
                          {ex.type}
                        </Badge>
                      </div>
                    </div>
                    <Plus className="w-5 h-5 text-[#FFFFFF]/40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
    <Footer />
    </div>
  );
}