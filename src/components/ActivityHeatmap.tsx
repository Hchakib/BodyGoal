import { useMemo } from 'react';
import { WorkoutSession } from '../firebase/firestore';

interface ActivityHeatmapProps {
  workouts: WorkoutSession[];
}

export function ActivityHeatmap({ workouts }: ActivityHeatmapProps) {
  const heatmapData = useMemo(() => {
    // Get last 12 weeks
    const weeks = 12;
    const data: { date: Date; count: number; level: number }[] = [];
    const today = new Date();
    
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const count = workouts.filter(w => {
        const wDate = w.date.toDate();
        wDate.setHours(0, 0, 0, 0);
        return wDate.getTime() === date.getTime();
      }).length;
      
      // Level: 0 (none), 1 (1 workout), 2 (2 workouts), 3 (3+ workouts)
      const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
      
      data.push({ date, count, level });
    }
    
    return data;
  }, [workouts]);

  const getColorClass = (level: number) => {
    switch (level) {
      case 0:
        return 'bg-[#0B0B0F] border-[#151923]';
      case 1:
        return 'bg-[#22C55E]/30 border-[#22C55E]/50';
      case 2:
        return 'bg-[#22C55E]/60 border-[#22C55E]/80';
      case 3:
        return 'bg-[#22C55E] border-[#22C55E]';
      default:
        return 'bg-[#0B0B0F] border-[#151923]';
    }
  };

  const getDayLabel = (index: number) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[index];
  };

  const getMonthLabel = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[date.getMonth()];
  };

  // Group by weeks
  const weeks: typeof heatmapData[] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  // Get unique months for labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; week: number }[] = [];
    let currentMonth = -1;
    
    weeks.forEach((week, weekIndex) => {
      const firstDay = week[0];
      const month = firstDay.date.getMonth();
      
      if (month !== currentMonth) {
        labels.push({ month: getMonthLabel(firstDay.date), week: weekIndex });
        currentMonth = month;
      }
    });
    
    return labels;
  }, [weeks]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-gray-400">Activity This Year</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#0B0B0F] border border-[#151923]" />
            <div className="w-3 h-3 rounded-sm bg-[#22C55E]/30 border border-[#22C55E]/50" />
            <div className="w-3 h-3 rounded-sm bg-[#22C55E]/60 border border-[#22C55E]/80" />
            <div className="w-3 h-3 rounded-sm bg-[#22C55E] border border-[#22C55E]" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 pl-6">
          {monthLabels.map((label, index) => (
            <div
              key={index}
              className="text-[10px] text-gray-500"
              style={{ marginLeft: index === 0 ? 0 : `${(label.week - (monthLabels[index - 1]?.week || 0)) * 15}px` }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] justify-around text-[10px] text-gray-500 pr-1">
            <span className="h-3 flex items-center">Mon</span>
            <span className="h-3 flex items-center opacity-0">Tue</span>
            <span className="h-3 flex items-center">Wed</span>
            <span className="h-3 flex items-center opacity-0">Thu</span>
            <span className="h-3 flex items-center">Fri</span>
            <span className="h-3 flex items-center opacity-0">Sat</span>
            <span className="h-3 flex items-center opacity-0">Sun</span>
          </div>

          {/* Week columns */}
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm border transition-all duration-200 hover:scale-110 hover:ring-1 hover:ring-[#22C55E] cursor-pointer ${getColorClass(day.level)}`}
                  title={`${day.date.toLocaleDateString()}: ${day.count} workout${day.count !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
