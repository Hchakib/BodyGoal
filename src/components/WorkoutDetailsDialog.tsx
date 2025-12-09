import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { WorkoutSession } from '../firebase/firestore';
import { Calendar, Clock, Dumbbell, Trash2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { toast } from 'sonner@2.0.3';

interface WorkoutDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workout: WorkoutSession | null;
  onDelete?: (workoutId: string) => Promise<void>;
}

export function WorkoutDetailsDialog({ open, onOpenChange, workout, onDelete }: WorkoutDetailsDialogProps) {
  if (!workout) return null;

  const handleDelete = async () => {
    if (!workout.id) return;
    
    if (confirm('Are you sure you want to delete this workout?')) {
      try {
        await onDelete?.(workout.id);
        toast.success('Workout deleted successfully');
        onOpenChange(false);
      } catch (error) {
        toast.error('Failed to delete workout');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151923] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{workout.name}</span>
            <Badge className={`${
              workout.type === 'strength'
                ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                : 'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30'
            }`}>
              {workout.type}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Detailed view of your workout session
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {workout.date.toDate().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {workout.duration} min
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4" />
              {workout.exercises.length} exercises
            </div>
          </div>

          {workout.notes && (
            <div className="bg-[#0B0B0F] rounded-lg p-4">
              <p className="text-sm text-gray-400">Notes:</p>
              <p className="text-white mt-1">{workout.notes}</p>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-white">Exercises</h4>
            {workout.exercises.map((exercise, index) => (
              <div key={index} className="bg-[#0B0B0F] rounded-lg p-4">
                <h5 className="text-white mb-3">{exercise.name}</h5>
                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400 w-16">Set {setIndex + 1}</span>
                      <span className="text-white">{set.reps} reps</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-[#22C55E]">{set.weight} kg</span>
                    </div>
                  ))}
                </div>
                {exercise.notes && (
                  <p className="text-sm text-gray-400 mt-2 italic">{exercise.notes}</p>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            {onDelete && (
              <Button
                onClick={handleDelete}
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Workout
              </Button>
            )}
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}