import { ChevronRight, Dumbbell, Heart } from 'lucide-react';

interface SessionCardProps {
  type: 'strength' | 'cardio';
  date: string;
  summary: string;
}

export function SessionCard({ type, date, summary }: SessionCardProps) {
  const Icon = type === 'strength' ? Dumbbell : Heart;
  
  return (
    <div className="bg-[#151923] rounded-xl p-6 border border-[#151923] hover:border-[#22C55E]/30 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            type === 'strength' ? 'bg-[#22C55E]/10' : 'bg-[#00D1FF]/10'
          }`}>
            <Icon className={`w-6 h-6 ${
              type === 'strength' ? 'text-[#22C55E]' : 'text-[#00D1FF]'
            }`} />
          </div>
          <div className="flex-1">
            <p className="mb-1">{summary}</p>
            <p className="text-[#FFFFFF]/60">{date}</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#FFFFFF]/40" />
      </div>
    </div>
  );
}
