import { useState, useMemo } from 'react';
import { Search, Filter, X, Dumbbell, Heart, Zap, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const exerciseLibrary = [
  { name: 'Bench Press', category: 'Chest', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Incline Dumbbell Press', category: 'Chest', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Cable Flyes', category: 'Chest', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Dumbbell Press', category: 'Chest', type: 'Compound', difficulty: 'Beginner' },
  { name: 'Push-ups', category: 'Chest', type: 'Bodyweight', difficulty: 'Beginner' },
  { name: 'Back Squat', category: 'Legs', type: 'Compound', difficulty: 'Advanced' },
  { name: 'Front Squat', category: 'Legs', type: 'Compound', difficulty: 'Advanced' },
  { name: 'Romanian Deadlift', category: 'Legs', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Leg Press', category: 'Legs', type: 'Compound', difficulty: 'Beginner' },
  { name: 'Leg Curls', category: 'Legs', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Leg Extensions', category: 'Legs', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Calf Raises', category: 'Legs', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Bulgarian Split Squats', category: 'Legs', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Deadlift', category: 'Back', type: 'Compound', difficulty: 'Advanced' },
  { name: 'Pull-ups', category: 'Back', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Barbell Row', category: 'Back', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Lat Pulldowns', category: 'Back', type: 'Compound', difficulty: 'Beginner' },
  { name: 'Seated Cable Rows', category: 'Back', type: 'Compound', difficulty: 'Beginner' },
  { name: 'T-Bar Rows', category: 'Back', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Face Pulls', category: 'Back', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Overhead Press', category: 'Shoulders', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Lateral Raises', category: 'Shoulders', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Front Raises', category: 'Shoulders', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Arnold Press', category: 'Shoulders', type: 'Compound', difficulty: 'Intermediate' },
  { name: 'Shrugs', category: 'Shoulders', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Tricep Pushdowns', category: 'Arms', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Tricep Extensions', category: 'Arms', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Skull Crushers', category: 'Arms', type: 'Isolation', difficulty: 'Intermediate' },
  { name: 'Bicep Curls', category: 'Arms', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Hammer Curls', category: 'Arms', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Preacher Curls', category: 'Arms', type: 'Isolation', difficulty: 'Intermediate' },
  { name: 'Concentration Curls', category: 'Arms', type: 'Isolation', difficulty: 'Beginner' },
  { name: 'Running', category: 'Cardio', type: 'Cardio', difficulty: 'Beginner' },
  { name: 'Cycling', category: 'Cardio', type: 'Cardio', difficulty: 'Beginner' },
  { name: 'Rowing', category: 'Cardio', type: 'Cardio', difficulty: 'Intermediate' },
  { name: 'Swimming', category: 'Cardio', type: 'Cardio', difficulty: 'Intermediate' },
  { name: 'Jump Rope', category: 'Cardio', type: 'Cardio', difficulty: 'Beginner' },
  { name: 'Burpees', category: 'Cardio', type: 'Bodyweight', difficulty: 'Intermediate' },
  { name: 'Mountain Climbers', category: 'Cardio', type: 'Bodyweight', difficulty: 'Beginner' },
  { name: 'Plank', category: 'Core', type: 'Bodyweight', difficulty: 'Beginner' },
  { name: 'Russian Twists', category: 'Core', type: 'Bodyweight', difficulty: 'Beginner' },
  { name: 'Hanging Leg Raises', category: 'Core', type: 'Bodyweight', difficulty: 'Advanced' },
  { name: 'Ab Wheel Rollout', category: 'Core', type: 'Equipment', difficulty: 'Advanced' },
  { name: 'Cable Crunches', category: 'Core', type: 'Isolation', difficulty: 'Intermediate' },
];

interface ExerciseLibraryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exerciseName: string) => void;
}

export function ExerciseLibraryDialog({ open, onOpenChange, onSelectExercise }: ExerciseLibraryDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

  const filteredExercises = useMemo(() => {
    return exerciseLibrary.filter(exercise => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleSelectExercise = (exerciseName: string) => {
    onSelectExercise(exerciseName);
    setSearchQuery('');
    setSelectedCategory('all');
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Cardio':
        return Heart;
      case 'Core':
        return Zap;
      default:
        return Dumbbell;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-[#151923] border-[#151923]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5 text-[#22C55E]" />
            Exercise Library
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Browse and select exercises for your workout
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises..."
            className="pl-10 bg-[#0B0B0F] border-[#151923]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedCategory === category
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#0B0B0F] text-gray-400 hover:bg-[#0B0B0F]/80 border border-[#151923]'
              }`}
            >
              {category === 'all' ? 'All' : category}
            </button>
          ))}
        </div>

        {/* Exercise list */}
        <div className="overflow-y-auto max-h-[400px] -mx-6 px-6 space-y-2">
          {filteredExercises.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No exercises found</p>
              <p className="text-xs mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredExercises.map((exercise, index) => {
              const Icon = getCategoryIcon(exercise.category);
              return (
                <button
                  key={index}
                  onClick={() => handleSelectExercise(exercise.name)}
                  className="w-full p-4 rounded-lg bg-[#0B0B0F] hover:bg-[#0B0B0F]/80 border border-transparent hover:border-[#22C55E]/30 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-[#151923] group-hover:bg-[#22C55E]/10 transition-colors">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-[#22C55E] transition-colors" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="font-medium mb-1 group-hover:text-[#22C55E] transition-colors">
                          {exercise.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-[#151923] text-gray-400 border-[#151923] text-xs">
                            {exercise.category}
                          </Badge>
                          <Badge className="bg-[#151923] text-gray-400 border-[#151923] text-xs">
                            {exercise.type}
                          </Badge>
                          <Badge className={`text-xs ${getDifficultyColor(exercise.difficulty)}`}>
                            {exercise.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="text-gray-600 group-hover:text-[#22C55E] transition-colors">
                      <Plus className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#0B0B0F]">
          <span className="text-xs text-gray-500">
            {filteredExercises.length} exercise{filteredExercises.length !== 1 ? 's' : ''} available
          </span>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-gray-700"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}