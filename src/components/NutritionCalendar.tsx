import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Flame, Beef, Wheat, Droplet } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { NutritionEntry } from '../firebase/nutrition';

interface NutritionCalendarProps {
  entries: NutritionEntry[];
  macroGoals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export function NutritionCalendar({ entries, macroGoals }: NutritionCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Navigation
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get last 7 days from currentDate
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    return days;
  };

  const days = getLast7Days();

  // Calculate stats for a specific date
  const getStatsForDate = (date: Date) => {
    const dayEntries = entries.filter(entry => {
      const entryDate = entry.date.toDate();
      return entryDate.toDateString() === date.toDateString();
    });

    const totalCalories = dayEntries.reduce((sum, e) => sum + e.calories, 0);
    const totalProtein = dayEntries.reduce((sum, e) => sum + e.protein, 0);
    const totalCarbs = dayEntries.reduce((sum, e) => sum + e.carbs, 0);
    const totalFats = dayEntries.reduce((sum, e) => sum + e.fats, 0);

    return {
      entries: dayEntries,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFats,
      caloriesProgress: (totalCalories / macroGoals.calories) * 100
    };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'short' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/10 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <h2 className="text-2xl text-white">Nutrition History</h2>
            <p className="text-gray-400 text-sm">Weekly overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousWeek}
            className="border-white/10 text-white hover:border-[#22C55E]/30"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="border-white/10 text-white hover:border-[#22C55E]/30"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextWeek}
            className="border-white/10 text-white hover:border-[#22C55E]/30"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-3">
        {days.map((day, index) => {
          const stats = getStatsForDate(day);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={`
                bg-[#0B0B0F] rounded-xl p-3 border transition-all
                ${isTodayDate 
                  ? 'border-[#22C55E] shadow-lg shadow-[#22C55E]/20' 
                  : 'border-white/5 hover:border-white/10'
                }
              `}
            >
              {/* Day header */}
              <div className="text-center mb-3">
                <p className={`text-xs uppercase mb-1 ${isTodayDate ? 'text-[#22C55E]' : 'text-gray-500'}`}>
                  {formatDayName(day)}
                </p>
                <p className={`text-sm ${isTodayDate ? 'text-[#22C55E]' : 'text-white'}`}>
                  {formatDate(day)}
                </p>
              </div>

              {/* Stats */}
              {stats.entries.length > 0 ? (
                <div className="space-y-2">
                  {/* Calories with progress bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      <span className="text-xs text-gray-400">{stats.totalCalories}</span>
                    </div>
                    <div className="w-full bg-[#151923] rounded-full h-1">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full transition-all"
                        style={{ width: `${Math.min(stats.caloriesProgress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Macros */}
                  <div className="space-y-1">
                    {stats.totalProtein > 0 && (
                      <div className="flex items-center justify-between">
                        <Beef className="w-3 h-3 text-red-500" />
                        <span className="text-xs text-gray-400">{Math.round(stats.totalProtein)}g</span>
                      </div>
                    )}
                    {stats.totalCarbs > 0 && (
                      <div className="flex items-center justify-between">
                        <Wheat className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-gray-400">{Math.round(stats.totalCarbs)}g</span>
                      </div>
                    )}
                    {stats.totalFats > 0 && (
                      <div className="flex items-center justify-between">
                        <Droplet className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-gray-400">{Math.round(stats.totalFats)}g</span>
                      </div>
                    )}
                  </div>

                  {/* Meal count */}
                  <Badge className="w-full justify-center bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30 text-xs">
                    {stats.entries.length} meal{stats.entries.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-600">No data</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-gray-400">Calories</span>
          </div>
          <div className="flex items-center gap-2">
            <Beef className="w-4 h-4 text-red-500" />
            <span className="text-gray-400">Protein (g)</span>
          </div>
          <div className="flex items-center gap-2">
            <Wheat className="w-4 h-4 text-yellow-500" />
            <span className="text-gray-400">Carbs (g)</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplet className="w-4 h-4 text-blue-500" />
            <span className="text-gray-400">Fats (g)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
