import { Dumbbell, Zap, TrendingUp, Target } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  sets: {
    id: string;
    reps: string;
    weight: string;
    completed: boolean;
  }[];
}

interface WorkoutStatsProps {
  exercises: Exercise[];
}

export function WorkoutStats({ exercises }: WorkoutStatsProps) {
  // Calculate total volume (weight × reps)
  const totalVolume = exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((setSum, set) => {
      if (set.completed && set.weight && set.reps) {
        return setSum + (parseFloat(set.weight) * parseFloat(set.reps));
      }
      return setSum;
    }, 0);
  }, 0);

  // Calculate total sets
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = exercises.reduce((sum, ex) => {
    return sum + ex.sets.filter(s => s.completed).length;
  }, 0);

  // Calculate total reps
  const totalReps = exercises.reduce((sum, ex) => {
    return sum + ex.sets.reduce((setSum, set) => {
      if (set.completed && set.reps) {
        return setSum + parseFloat(set.reps);
      }
      return setSum;
    }, 0);
  }, 0);

  // Estimate calories (rough estimate: 1 calorie per kg lifted)
  const estimatedCalories = Math.round(totalVolume);

  const stats = [
    {
      label: 'Total Volume',
      value: `${totalVolume.toFixed(0)} kg`,
      icon: Dumbbell,
      color: 'text-[#22C55E]',
      bgColor: 'bg-[#22C55E]/10',
    },
    {
      label: 'Sets Completed',
      value: `${completedSets}/${totalSets}`,
      icon: Target,
      color: 'text-[#00D1FF]',
      bgColor: 'bg-[#00D1FF]/10',
    },
    {
      label: 'Total Reps',
      value: totalReps.toString(),
      icon: TrendingUp,
      color: 'text-[#F59E0B]',
      bgColor: 'bg-[#F59E0B]/10',
    },
    {
      label: 'Est. Calories',
      value: `${estimatedCalories} kcal`,
      icon: Zap,
      color: 'text-[#8B5CF6]',
      bgColor: 'bg-[#8B5CF6]/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-xl bg-[#151923] border border-[#151923] p-4 hover:border-[#22C55E]/20 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xs text-gray-500">{stat.label}</div>
                <div className="text-lg font-medium">{stat.value}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
