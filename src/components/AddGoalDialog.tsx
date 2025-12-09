import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { Target } from 'lucide-react';
import { Goal } from '../firebase/firestore';

interface AddGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (goalData: Omit<Goal, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

export function AddGoalDialog({ open, onOpenChange, onAdd }: AddGoalDialogProps) {
  const [type, setType] = useState<Goal['type']>('workout_frequency');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('workouts');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const goalTypes = [
    { value: 'workout_frequency', label: 'Workout Frequency', unit: 'workouts' },
    { value: 'weight', label: 'Body Weight', unit: 'kg' },
    { value: 'volume', label: 'Total Volume', unit: 'kg' },
    { value: 'cardio', label: 'Cardio Minutes', unit: 'minutes' },
    { value: 'custom', label: 'Custom Goal', unit: '' },
  ];

  const handleTypeChange = (value: string) => {
    const selectedType = value as Goal['type'];
    setType(selectedType);
    const goalType = goalTypes.find(g => g.value === selectedType);
    if (goalType && goalType.unit) {
      setUnit(goalType.unit);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !targetValue || parseFloat(targetValue) <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const goalData: any = {
        type,
        title: title.trim(),
        targetValue: parseFloat(targetValue),
        currentValue: 0,
        unit: unit || 'units',
        completed: false,
      };

      // Only add optional fields if they have values
      if (description.trim()) {
        goalData.description = description.trim();
      }
      
      if (deadline) {
        goalData.deadline = new Date(deadline);
      }

      await onAdd(goalData);
      toast.success('Goal created successfully!');
      onOpenChange(false);
      
      // Reset form
      setType('workout_frequency');
      setTitle('');
      setDescription('');
      setTargetValue('');
      setUnit('workouts');
      setDeadline('');
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error('Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#151923] border-white/10 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-[#22C55E]" />
            </div>
            Create New Goal
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Set a new fitness goal to track your progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Goal Type *</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="w-full px-3 py-2 bg-[#0B0B0F] border border-white/10 rounded-lg text-white"
            >
              {goalTypes.map((gt) => (
                <option key={gt.value} value={gt.value}>
                  {gt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Complete 20 workouts this month"
              className="bg-[#0B0B0F] border-white/10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about your goal..."
              className="bg-[#0B0B0F] border-white/10"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value *</Label>
              <Input
                id="targetValue"
                type="number"
                step="0.1"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="20"
                className="bg-[#0B0B0F] border-white/10"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="workouts"
                className="bg-[#0B0B0F] border-white/10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-[#0B0B0F] border-white/10"
            />
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
              {loading ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}