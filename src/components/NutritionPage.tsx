import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Apple, 
  Zap,
  Target,
  Plus,
  Trash2,
  Coffee,
  Sunrise,
  Sun,
  Moon as MoonIcon
} from 'lucide-react';
import { useNutrition } from '../hooks/useNutrition';
import { useWorkouts } from '../hooks/useWorkouts';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface NutritionPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function NutritionPage({ onNavigate, onLogout }: NutritionPageProps) {
  const { 
    todayEntries, 
    todayCalories, 
    yesterdayCalories, 
    dailyCalories,
    loading,
    addEntry,
    removeEntry 
  } = useNutrition(7);
  
  const { workouts } = useWorkouts(30);

  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate burned calories from today's workouts
  const todayBurnedCalories = workouts
    .filter(w => {
      const wDate = w.date.toDate();
      const today = new Date();
      return wDate.toDateString() === today.toDateString();
    })
    .reduce((sum, w) => {
      // Estimate: ~5-8 calories per minute for strength, ~10-12 for cardio
      const rate = w.type === 'cardio' ? 11 : 6.5;
      return sum + (w.duration * rate);
    }, 0);

  const netCalories = todayCalories - todayBurnedCalories;
  const targetCalories = 2000; // Default target, could be personalized later

  const caloriesTrend = todayCalories > yesterdayCalories ? 'up' : 'down';
  const trendPercentage = yesterdayCalories > 0 
    ? Math.abs(((todayCalories - yesterdayCalories) / yesterdayCalories) * 100).toFixed(0)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mealName.trim() || !calories || Number(calories) <= 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addEntry({
        mealName: mealName.trim(),
        calories: Number(calories),
        mealType
      });
      
      // Reset form
      setMealName('');
      setCalories('');
      setMealType('breakfast');
    } catch (error) {
      console.error('Error adding entry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Delete this entry?')) {
      await removeEntry(entryId);
    }
  };

  const getMealIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return Sunrise;
      case 'lunch':
        return Sun;
      case 'dinner':
        return MoonIcon;
      case 'snack':
        return Coffee;
    }
  };

  const getMealColor = (type: MealType) => {
    switch (type) {
      case 'breakfast':
        return 'from-orange-500 to-yellow-500';
      case 'lunch':
        return 'from-[#22C55E] to-[#00D1FF]';
      case 'dinner':
        return 'from-purple-500 to-blue-500';
      case 'snack':
        return 'from-pink-500 to-rose-500';
    }
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#151923] border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-white text-sm mb-1">{payload[0].payload.date}</p>
          <p className="text-[#22C55E]">
            {payload[0].value} calories
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="nutrition" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-white text-4xl mb-2">Nutrition & Calories</h1>
              <p className="text-gray-400 text-lg">Track your daily calorie intake and expenditure</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30 px-4 py-2">
                <Apple className="w-4 h-4 mr-2" />
                {todayEntries.length} meals today
              </Badge>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Calories Consumed */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/10 flex items-center justify-center">
                <Apple className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div className="flex items-center gap-1 text-xs">
                {caloriesTrend === 'up' ? (
                  <TrendingUp className="w-3 h-3 text-[#22C55E]" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={caloriesTrend === 'up' ? 'text-[#22C55E]' : 'text-red-500'}>
                  {trendPercentage}%
                </span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Consumed Today</p>
            <p className="text-3xl bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
              {todayCalories.toLocaleString()}
            </p>
            <p className="text-gray-500 text-xs mt-1">calories</p>
          </div>

          {/* Calories Burned */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Burned Today</p>
            <p className="text-3xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              {Math.round(todayBurnedCalories).toLocaleString()}
            </p>
            <p className="text-gray-500 text-xs mt-1">calories (from workouts)</p>
          </div>

          {/* Net Calories */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00D1FF]/20 to-[#00D1FF]/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#00D1FF]" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Net Calories</p>
            <p className="text-3xl bg-gradient-to-r from-[#00D1FF] to-purple-500 bg-clip-text text-transparent">
              {Math.round(netCalories).toLocaleString()}
            </p>
            <p className="text-gray-500 text-xs mt-1">consumed - burned</p>
          </div>

          {/* Target */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-1">Daily Target</p>
            <p className="text-3xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
              {targetCalories.toLocaleString()}
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {todayCalories > targetCalories ? '+' : ''}{todayCalories - targetCalories} cal
            </p>
          </div>
        </div>

        {/* Daily Calories Chart */}
        <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl text-white mb-2">Daily Calories</h2>
              <p className="text-gray-400">Last 7 days calorie intake</p>
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCalories}>
                <CartesianGrid strokeDasharray="3 3" stroke="#151923" />
                <XAxis 
                  dataKey="date" 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#666"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="calories" 
                  fill="url(#colorCalories)"
                  radius={[8, 8, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="#00D1FF" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Input & Log Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left - Add Entry Form */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-[#22C55E]" />
              </div>
              <div>
                <h2 className="text-xl text-white">Log Food / Calories</h2>
                <p className="text-sm text-gray-400">Add a new meal entry</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Meal Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Meal Name</label>
                <Input
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. Grilled Chicken Salad"
                  className="bg-[#0B0B0F] border-white/10 text-white"
                  required
                />
              </div>

              {/* Calories */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Calories</label>
                <Input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="e.g. 450"
                  min="0"
                  className="bg-[#0B0B0F] border-white/10 text-white"
                  required
                />
              </div>

              {/* Meal Type */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value as MealType)}
                  className="w-full bg-[#0B0B0F] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#22C55E]/30"
                >
                  <option value="breakfast">🌅 Breakfast</option>
                  <option value="lunch">☀️ Lunch</option>
                  <option value="dinner">🌙 Dinner</option>
                  <option value="snack">☕ Snack</option>
                </select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? 'Adding...' : 'Add Entry'}
              </Button>
            </form>
          </div>

          {/* Right - Today's Entries */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl text-white">Today's Entries</h2>
                <p className="text-sm text-gray-400">
                  {todayEntries.length} meal{todayEntries.length !== 1 ? 's' : ''} logged
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                  {todayCalories}
                </p>
                <p className="text-xs text-gray-400">total calories</p>
              </div>
            </div>

            {todayEntries.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {todayEntries.map((entry) => {
                  const Icon = getMealIcon(entry.mealType);
                  const time = entry.createdAt.toDate().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={entry.id}
                      className="bg-[#0B0B0F] rounded-xl p-4 border border-white/5 hover:border-[#22C55E]/30 transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getMealColor(entry.mealType)} opacity-20 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`w-5 h-5 text-white`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white mb-1">{entry.mealName}</h4>
                            <div className="flex items-center gap-3 text-sm">
                              <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30 text-xs">
                                {entry.calories} cal
                              </Badge>
                              <span className="text-gray-500 capitalize">{entry.mealType}</span>
                              <span className="text-gray-500">{time}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Apple className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No meals logged today</p>
                <p className="text-gray-500 text-sm">Start tracking your nutrition</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0B0B0F;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #22C55E;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00D1FF;
        }
      `}</style>
    </div>
  );
}
