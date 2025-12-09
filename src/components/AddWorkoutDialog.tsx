import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Timestamp } from 'firebase/firestore';
import { Exercise } from '../firebase/firestore';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface AddWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (workout: any) => Promise<void>;
}

export function AddWorkoutDialog({ open, onOpenChange, onAdd }: AddWorkoutDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('strength');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddExercise = () => {
    setExercises([...exercises, { name: '', sets: [{ reps: 0, weight: 0, completed: true }], notes: '' }]);
  };

  const handleRemoveExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseNameChange = (index: number, value: string) => {
    const newExercises = [...exercises];
    newExercises[index].name = value;
    setExercises(newExercises);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ reps: 0, weight: 0, completed: true });
    setExercises(newExercises);
  };

  const handleSetChange = (exerciseIndex: number, setIndex: number, field: 'reps' | 'weight', value: number) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !duration) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await onAdd({
        name,
        type,
        duration: parseInt(duration),
        exercises,
        notes,
        date: Timestamp.fromDate(new Date(date))
      });
      
      // Reset form
      setName('');
      setType('strength');
      setDuration('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setExercises([]);
      
      toast.success('Workout added successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding workout:', error);
      toast.error('Failed to add workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151923] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Workout</DialogTitle>
          <DialogDescription className="text-gray-400">
            Record your workout session details
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Upper Body Strength"
                className="bg-[#0B0B0F] border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="bg-[#0B0B0F] border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151923] border-white/10">
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="hiit">HIIT</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
                className="bg-[#0B0B0F] border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-[#0B0B0F] border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did you feel? Any observations?"
              className="bg-[#0B0B0F] border-white/10"
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Exercises</Label>
              <Button
                type="button"
                onClick={handleAddExercise}
                size="sm"
                className="bg-[#22C55E] hover:bg-[#22C55E]/80"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Exercise
              </Button>
            </div>

            {exercises.map((exercise, exerciseIndex) => (
              <div key={exerciseIndex} className="bg-[#0B0B0F] rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={exercise.name}
                    onChange={(e) => handleExerciseNameChange(exerciseIndex, e.target.value)}
                    placeholder="Exercise name"
                    className="bg-[#151923] border-white/10 flex-1"
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemoveExercise(exerciseIndex)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div key={setIndex} className="flex items-center gap-2">
                      <span className="text-sm text-gray-400 w-16">Set {setIndex + 1}</span>
                      <Input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || 0)}
                        placeholder="Reps"
                        className="bg-[#151923] border-white/10 w-24"
                      />
                      <Input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => handleSetChange(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || 0)}
                        placeholder="Weight (kg)"
                        className="bg-[#151923] border-white/10 flex-1"
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={() => handleAddSet(exerciseIndex)}
                    size="sm"
                    variant="outline"
                    className="w-full border-white/10"
                  >
                    Add Set
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-white/10"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Workout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
