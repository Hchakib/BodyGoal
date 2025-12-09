import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Calendar, Clock } from 'lucide-react';
import { WorkoutTemplate } from '../firebase/workoutTemplates';

interface ScheduleWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: WorkoutTemplate;
  defaultDate?: Date;
  onSchedule: (template: WorkoutTemplate, date: Date) => void;
}

export function ScheduleWorkoutDialog({
  open,
  onOpenChange,
  template,
  defaultDate,
  onSchedule
}: ScheduleWorkoutDialogProps) {
  const [selectedDate, setSelectedDate] = useState<string>(
    defaultDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [scheduleWeek, setScheduleWeek] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const date = new Date(selectedDate);
    if (scheduleWeek && template) {
      onSchedule(template, date);
    } else if (template) {
      onSchedule(template, date);
    }
    onOpenChange(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-[#22C55E]" />
            Schedule Workout
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {template 
              ? `Plan "${template.name}" for your calendar` 
              : 'Choose when to do this workout'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Date Selection */}
          <div className="space-y-2">
            <Label className="text-gray-300">Select Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={today}
                className="bg-[#0B0B0F] border-white/10 text-white pl-10"
                required
              />
            </div>
          </div>

          {/* Template Info */}
          {template && (
            <div className="bg-[#0B0B0F] rounded-lg p-4 border border-white/5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-white mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-400 capitalize">{template.focus}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#22C55E]">{template.daysPerWeek} days/week</p>
                  <p className="text-xs text-gray-500">{template.workouts.length} workouts</p>
                </div>
              </div>

              {/* Schedule Week Option */}
              {template.workouts.length > 1 && (
                <div className="pt-3 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={scheduleWeek}
                      onChange={(e) => setScheduleWeek(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-[#151923] text-[#22C55E] focus:ring-[#22C55E] focus:ring-offset-0"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white group-hover:text-[#22C55E] transition-colors">
                        Schedule full week
                      </p>
                      <p className="text-xs text-gray-500">
                        Plan all {template.workouts.length} workouts starting from this date
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {/* Preview */}
              {scheduleWeek && (
                <div className="mt-3 p-3 bg-[#22C55E]/10 rounded-lg border border-[#22C55E]/20">
                  <p className="text-xs text-[#22C55E] mb-2 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Schedule preview:
                  </p>
                  <div className="space-y-1">
                    {template.workouts.slice(0, 3).map((workout, idx) => {
                      const date = new Date(selectedDate);
                      date.setDate(date.getDate() + idx);
                      return (
                        <p key={idx} className="text-xs text-gray-300">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {workout.dayName}
                        </p>
                      );
                    })}
                    {template.workouts.length > 3 && (
                      <p className="text-xs text-gray-400">
                        +{template.workouts.length - 3} more days...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
            >
              Schedule Workout
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}