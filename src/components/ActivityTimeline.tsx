import { useMemo } from 'react';
import { Dumbbell, Trophy, Scale, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { WorkoutSession, PersonalRecord, WeightEntry, Goal } from '../firebase/firestore';

interface ActivityTimelineProps {
  workouts: WorkoutSession[];
  records: PersonalRecord[];
  weightEntries: WeightEntry[];
  goals: Goal[];
}

type TimelineItem = {
  type: 'workout' | 'pr' | 'weight' | 'goal';
  date: Date;
  title: string;
  description: string;
  icon: any;
  color: string;
  data: any;
};

export function ActivityTimeline({ workouts, records, weightEntries, goals }: ActivityTimelineProps) {
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // Add workouts
    workouts.slice(0, 5).forEach(workout => {
      items.push({
        type: 'workout',
        date: workout.date.toDate(),
        title: workout.name,
        description: `${workout.duration} min • ${workout.exercises.length} exercises`,
        icon: Dumbbell,
        color: 'text-[#22C55E]',
        data: workout,
      });
    });

    // Add PRs
    records.slice(0, 5).forEach(record => {
      items.push({
        type: 'pr',
        date: record.date.toDate(),
        title: `New PR: ${record.exerciseName}`,
        description: `${record.weight}kg × ${record.reps} reps`,
        icon: Trophy,
        color: 'text-[#F59E0B]',
        data: record,
      });
    });

    // Add weight entries
    weightEntries.slice(0, 3).forEach(entry => {
      items.push({
        type: 'weight',
        date: entry.date.toDate(),
        title: 'Weight Updated',
        description: `${entry.weight}kg`,
        icon: Scale,
        color: 'text-[#00D1FF]',
        data: entry,
      });
    });

    // Add completed goals
    goals.filter(g => g.completed).slice(0, 3).forEach(goal => {
      items.push({
        type: 'goal',
        date: new Date(goal.updatedAt?.seconds * 1000 || Date.now()),
        title: 'Goal Completed!',
        description: goal.title,
        icon: CheckCircle2,
        color: 'text-[#8B5CF6]',
        data: goal,
      });
    });

    // Sort by date (most recent first)
    items.sort((a, b) => b.date.getTime() - a.date.getTime());

    return items.slice(0, 10);
  }, [workouts, records, weightEntries, goals]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (timelineItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No recent activity</p>
        <p className="text-xs mt-1">Start working out to see your activity here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {timelineItems.map((item, index) => (
        <div key={index} className="flex gap-3 group">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full bg-[#151923] flex items-center justify-center border-2 border-[#151923] group-hover:border-[#22C55E]/30 transition-colors`}>
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
            {index < timelineItems.length - 1 && (
              <div className="w-[2px] flex-1 bg-[#151923] min-h-[20px]" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm text-white group-hover:text-[#22C55E] transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {item.description}
                </p>
              </div>
              <span className="text-xs text-gray-600 whitespace-nowrap ml-2">
                {formatDate(item.date)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
