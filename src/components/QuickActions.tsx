import { Dumbbell, Trophy, Scale, Target, TrendingUp, Calendar } from 'lucide-react';

interface QuickActionsProps {
  onStartWorkout: () => void;
  onAddPR: () => void;
  onAddWeight: () => void;
  onAddGoal: () => void;
}

export function QuickActions({ onStartWorkout, onAddPR, onAddWeight, onAddGoal }: QuickActionsProps) {
  const actions = [
    {
      icon: Dumbbell,
      label: 'Start Workout',
      description: 'Begin a new session',
      color: 'from-[#22C55E] to-[#16A34A]',
      onClick: onStartWorkout,
    },
    {
      icon: Trophy,
      label: 'Log PR',
      description: 'Record personal best',
      color: 'from-[#F59E0B] to-[#D97706]',
      onClick: onAddPR,
    },
    {
      icon: Scale,
      label: 'Track Weight',
      description: 'Update your weight',
      color: 'from-[#00D1FF] to-[#0EA5E9]',
      onClick: onAddWeight,
    },
    {
      icon: Target,
      label: 'Set Goal',
      description: 'Create new target',
      color: 'from-[#8B5CF6] to-[#7C3AED]',
      onClick: onAddGoal,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className="group relative overflow-hidden rounded-xl bg-[#151923] border border-[#151923] p-4 hover:border-[#22C55E]/30 transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Gradient background on hover */}
          <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
          
          <div className="relative flex items-start gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} shadow-lg`}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 text-left">
              <h4 className="text-sm text-white group-hover:text-[#22C55E] transition-colors">
                {action.label}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {action.description}
              </p>
            </div>
          </div>

          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </div>
        </button>
      ))}
    </div>
  );
}
