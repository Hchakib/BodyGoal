import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner@2.0.3';
import { Trophy, Dumbbell } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const POPULAR_EXERCISES = [
  'Bench Press',
  'Squat',
  'Deadlift',
  'Overhead Press',
  'Barbell Row',
  'Pull-ups',
  'Dips',
  'Leg Press',
  'Incline Bench Press',
  'Romanian Deadlift',
  'Custom',
];

interface AddPRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (record: any) => Promise<void>;
}

export function AddPRDialog({ open, onOpenChange, onAdd }: AddPRDialogProps) {
  const [exerciseSelect, setExerciseSelect] = useState('Custom');
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalExerciseName = exerciseSelect === 'Custom' ? exerciseName : exerciseSelect;
    
    if (!finalExerciseName || !weight || !reps) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        exerciseName: finalExerciseName,
        weight: parseFloat(weight),
        reps: parseInt(reps),
        date: Timestamp.fromDate(new Date(date))
      });
      
      // Reset form
      setExerciseSelect('Custom');
      setExerciseName('');
      setWeight('');
      setReps('');
      setDate(new Date().toISOString().split('T')[0]);
      
      toast.success('Personal record added successfully! 🏆');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding PR:', error);
      toast.error('Failed to add personal record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0B0B0F] border border-white/10 text-white sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#22C55E]" />
            </div>
            <div>
              <DialogTitle className="text-xl">Add Personal Record</DialogTitle>
              <DialogDescription className="text-gray-400">
                Record a new personal best
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="exerciseSelect" className="text-gray-300">Exercise *</Label>
            <Select value={exerciseSelect} onValueChange={setExerciseSelect}>
              <SelectTrigger className="bg-[#151923] border-white/10 text-white h-11">
                <Dumbbell className="w-4 h-4 mr-2 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#151923] border-white/10">
                {POPULAR_EXERCISES.map(exercise => (
                  <SelectItem key={exercise} value={exercise}>
                    {exercise}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {exerciseSelect === 'Custom' && (
            <div className="space-y-2">
              <Label htmlFor="exerciseName" className="text-gray-300">Custom Exercise Name *</Label>
              <Input
                id="exerciseName"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g., Hammer Curl"
                className="bg-[#151923] border-white/10 h-11 text-white placeholder:text-gray-500"
                required={exerciseSelect === 'Custom'}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-gray-300">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="100"
                className="bg-[#151923] border-white/10 h-11 text-white placeholder:text-gray-500"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reps" className="text-gray-300">Reps *</Label>
              <Input
                id="reps"
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="5"
                className="bg-[#151923] border-white/10 h-11 text-white placeholder:text-gray-500"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-gray-300">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#151923] border-white/10 h-11 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/10 bg-[#151923] hover:bg-[#151923]/80 h-11"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90 h-11"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}