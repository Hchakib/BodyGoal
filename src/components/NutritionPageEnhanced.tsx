import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Apple, 
  Target,
  Plus,
  Trash2,
  Settings,
  Beef,
  Wheat,
  Droplet,
  Activity,
  Sunrise,
  Sun,
  Moon as MoonIcon,
  Coffee,
  ChevronLeft,
  ChevronRight,
  CalendarDays
} from 'lucide-react';
import { useNutrition } from '../hooks/useNutrition';
import { useWorkouts } from '../hooks/useWorkouts';
import { useUserProfile } from '../hooks/useUserProfile';
import { MacroGoals, NutritionEntry } from '../firebase/nutrition';
import { AddMealDialog } from './AddMealDialog';
import { SetMacroGoalsDialog } from './SetMacroGoalsDialog';
import { NutritionCalendar } from './NutritionCalendar';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, Legend } from 'recharts';

interface NutritionPageEnhancedProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export default function NutritionPageEnhanced({ onNavigate, onLogout }: NutritionPageEnhancedProps) {
  const { 
    entries,
    todayEntries, 
    todayCalories, 
    todayMacros,
    dailyCalories,
    loading,
    addEntry,
    removeEntry 
  } = useNutrition(7);
  
  const { workouts } = useWorkouts(30);
  const { profile, updateProfile } = useUserProfile();

  const [addMealOpen, setAddMealOpen] = useState(false);
  const [goalsDialogOpen, setGoalsDialogOpen] = useState(false);
  
  // Use nutritionGoals from user profile (backend) with localStorage fallback
  const [macroGoals, setMacroGoals] = useState<MacroGoals>(() => {
    const saved = localStorage.getItem('macroGoals');
    return saved ? JSON.parse(saved) : {
      calories: 2500,
      protein: 150,
      carbs: 280,
      fats: 83,
      fiber: 30
    };
  });

  // Sync macroGoals with profile.nutritionGoals from backend
  useEffect(() => {
    if (profile?.nutritionGoals) {
      console.log('🔄 Syncing nutrition goals from backend:', profile.nutritionGoals);
      setMacroGoals(prev => ({
        calories: profile.nutritionGoals.calories,
        protein: profile.nutritionGoals.protein,
        carbs: profile.nutritionGoals.carbs,
        fats: profile.nutritionGoals.fats,
        fiber: prev.fiber // Keep fiber from previous state
      }));
    }
  }, [profile?.nutritionGoals?.calories, profile?.nutritionGoals?.protein, profile?.nutritionGoals?.carbs, profile?.nutritionGoals?.fats]);

  // Save goals to localStorage for backup
  useEffect(() => {
    localStorage.setItem('macroGoals', JSON.stringify(macroGoals));
  }, [macroGoals]);

  // Calculate burned calories from today's workouts
  const todayBurnedCalories = workouts
    .filter(w => {
      const wDate = w.date.toDate();
      const today = new Date();
      return wDate.toDateString() === today.toDateString();
    })
    .reduce((sum, w) => {
      const rate = w.type === 'cardio' ? 11 : 6.5;
      return sum + (w.duration * rate);
    }, 0);

  const netCalories = todayCalories - todayBurnedCalories;

  const getMealIcon = (type: MealType) => {
    switch (type) {
      case 'breakfast': return Sunrise;
      case 'lunch': return Sun;
      case 'dinner': return MoonIcon;
      case 'snack': return Coffee;
    }
  };

  const getMealColor = (type: MealType) => {
    switch (type) {
      case 'breakfast': return 'from-orange-500 to-yellow-500';
      case 'lunch': return 'from-[#22C55E] to-[#00D1FF]';
      case 'dinner': return 'from-purple-500 to-blue-500';
      case 'snack': return 'from-pink-500 to-rose-500';
    }
  };

  const handleDelete = async (entryId: string) => {
    if (confirm('Delete this entry?')) {
      await removeEntry(entryId);
    }
  };

  // Handle saving macro goals to backend
  const handleSaveGoals = async (newGoals: MacroGoals) => {
    setMacroGoals(newGoals);
    
    // Save to backend (profile.nutritionGoals)
    try {
      await updateProfile({
        nutritionGoals: {
          calories: newGoals.calories,
          protein: newGoals.protein,
          carbs: newGoals.carbs,
          fats: newGoals.fats,
        }
      });
    } catch (error) {
      console.error('Error saving nutrition goals:', error);
    }
  };

  // Calculate progress percentages
  const caloriesProgress = (todayCalories / macroGoals.calories) * 100;
  const proteinProgress = (todayMacros.protein / macroGoals.protein) * 100;
  const carbsProgress = (todayMacros.carbs / macroGoals.carbs) * 100;
  const fatsProgress = (todayMacros.fats / macroGoals.fats) * 100;

  // Macro distribution chart data
  const macroDistribution = [
    { 
      name: 'Protein', 
      current: todayMacros.protein, 
      goal: macroGoals.protein,
      calories: todayMacros.protein * 4,
      color: '#ef4444'
    },
    { 
      name: 'Carbs', 
      current: todayMacros.carbs, 
      goal: macroGoals.carbs,
      calories: todayMacros.carbs * 4,
      color: '#eab308'
    },
    { 
      name: 'Fats', 
      current: todayMacros.fats, 
      goal: macroGoals.fats,
      calories: todayMacros.fats * 9,
      color: '#3b82f6'
    }
  ];

  // Progress Ring Component
  const ProgressRing = ({ 
    progress, 
    size = 120, 
    strokeWidth = 10, 
    color = '#22C55E',
    children 
  }: { 
    progress: number; 
    size?: number; 
    strokeWidth?: number; 
    color?: string;
    children: React.ReactNode;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1a1a1a"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="nutrition" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-white mb-2">Nutrition & Macros</h1>
              <p className="text-gray-400 text-lg">Track your daily macronutrients and calorie intake</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setGoalsDialogOpen(true)}
                variant="outline"
                className="border-white/10 text-white hover:border-[#22C55E]/30"
              >
                <Settings className="w-4 h-4 mr-2" />
                Set Goals
              </Button>
              <Button
                onClick={() => setAddMealOpen(true)}
                className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Meal
              </Button>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Calories Card */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/30">
                {caloriesProgress.toFixed(0)}%
              </Badge>
            </div>
            <p className="text-gray-400 text-sm mb-2">Calories</p>
            <div className="flex items-baseline gap-2 mb-1">
              <p className="text-3xl bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                {todayCalories}
              </p>
              <span className="text-gray-500">/ {macroGoals.calories}</span>
            </div>
            <div className="w-full bg-[#0B0B0F] rounded-full h-2 mt-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(caloriesProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {macroGoals.calories - todayCalories > 0 
                ? `${macroGoals.calories - todayCalories} kcal remaining`
                : `+${todayCalories - macroGoals.calories} kcal over`
              }
            </p>
          </div>

          {/* Burned & Net */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-[#00D1FF]" />
                  <p className="text-gray-400 text-sm">Burned (Workouts)</p>
                </div>
                <p className="text-2xl bg-gradient-to-r from-[#00D1FF] to-purple-500 bg-clip-text text-transparent">
                  {Math.round(todayBurnedCalories)} kcal
                </p>
              </div>
              <div className="h-px bg-white/10" />
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#22C55E]" />
                  <p className="text-gray-400 text-sm">Net Calories</p>
                </div>
                <p className="text-2xl bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                  {Math.round(netCalories)} kcal
                </p>
                <p className="text-xs text-gray-500 mt-1">consumed - burned</p>
              </div>
            </div>
          </div>

          {/* Daily Summary */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Apple className="w-5 h-5 text-[#22C55E]" />
              <h3 className="text-white">Today's Summary</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Meals logged</span>
                <span className="text-white">{todayEntries.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total protein</span>
                <span className="text-red-400">{todayMacros.protein.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total carbs</span>
                <span className="text-yellow-400">{todayMacros.carbs.toFixed(1)}g</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total fats</span>
                <span className="text-blue-400">{todayMacros.fats.toFixed(1)}g</span>
              </div>
              {todayMacros.fiber > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total fiber</span>
                  <span className="text-green-400">{todayMacros.fiber.toFixed(1)}g</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Macros Progress Rings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Protein */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex flex-col items-center">
              <ProgressRing progress={proteinProgress} color="#ef4444">
                <div className="text-center">
                  <p className="text-2xl text-white">{todayMacros.protein.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">/ {macroGoals.protein}g</p>
                </div>
              </ProgressRing>
              <div className="flex items-center gap-2 mt-4">
                <Beef className="w-5 h-5 text-red-500" />
                <h3 className="text-white">Protein</h3>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {(todayMacros.protein * 4).toFixed(0)} kcal ({((todayMacros.protein * 4 / todayCalories) * 100 || 0).toFixed(0)}%)
              </p>
              <Badge className={`mt-2 ${proteinProgress >= 100 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'} border-0`}>
                {proteinProgress >= 100 ? 'Goal reached!' : `${(macroGoals.protein - todayMacros.protein).toFixed(0)}g remaining`}
              </Badge>
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex flex-col items-center">
              <ProgressRing progress={carbsProgress} color="#eab308">
                <div className="text-center">
                  <p className="text-2xl text-white">{todayMacros.carbs.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">/ {macroGoals.carbs}g</p>
                </div>
              </ProgressRing>
              <div className="flex items-center gap-2 mt-4">
                <Wheat className="w-5 h-5 text-yellow-500" />
                <h3 className="text-white">Carbohydrates</h3>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {(todayMacros.carbs * 4).toFixed(0)} kcal ({((todayMacros.carbs * 4 / todayCalories) * 100 || 0).toFixed(0)}%)
              </p>
              <Badge className={`mt-2 ${carbsProgress >= 100 ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'} border-0`}>
                {carbsProgress >= 100 ? 'Goal reached!' : `${(macroGoals.carbs - todayMacros.carbs).toFixed(0)}g remaining`}
              </Badge>
            </div>
          </div>

          {/* Fats */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <div className="flex flex-col items-center">
              <ProgressRing progress={fatsProgress} color="#3b82f6">
                <div className="text-center">
                  <p className="text-2xl text-white">{todayMacros.fats.toFixed(0)}</p>
                  <p className="text-xs text-gray-400">/ {macroGoals.fats}g</p>
                </div>
              </ProgressRing>
              <div className="flex items-center gap-2 mt-4">
                <Droplet className="w-5 h-5 text-blue-500" />
                <h3 className="text-white">Fats</h3>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {(todayMacros.fats * 9).toFixed(0)} kcal ({((todayMacros.fats * 9 / todayCalories) * 100 || 0).toFixed(0)}%)
              </p>
              <Badge className={`mt-2 ${fatsProgress >= 100 ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'} border-0`}>
                {fatsProgress >= 100 ? 'Goal reached!' : `${(macroGoals.fats - todayMacros.fats).toFixed(0)}g remaining`}
              </Badge>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Macros Distribution */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-2xl text-white mb-4">Macro Distribution</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macroDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#151923" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151923',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="current" fill="#22C55E" radius={[8, 8, 0, 0]} name="Current (g)" />
                  <Bar dataKey="goal" fill="#666" radius={[8, 8, 0, 0]} name="Goal (g)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Calories */}
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-2xl text-white mb-4">Weekly Calories</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyCalories}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#151923" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151923',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#22C55E" 
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Today's Meals */}
        <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl text-white mb-1">Today's Meals</h2>
              <p className="text-gray-400">
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
            <div className="space-y-3">
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
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white mb-2">{entry.mealName}</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-xs">
                              <Flame className="w-3 h-3 mr-1" />
                              {entry.calories} cal
                            </Badge>
                            {entry.protein > 0 && (
                              <Badge className="bg-red-500/20 text-red-500 border-red-500/30 text-xs">
                                <Beef className="w-3 h-3 mr-1" />
                                P: {entry.protein}g
                              </Badge>
                            )}
                            {entry.carbs > 0 && (
                              <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30 text-xs">
                                <Wheat className="w-3 h-3 mr-1" />
                                C: {entry.carbs}g
                              </Badge>
                            )}
                            {entry.fats > 0 && (
                              <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30 text-xs">
                                <Droplet className="w-3 h-3 mr-1" />
                                F: {entry.fats}g
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="capitalize">{entry.mealType}</span>
                            <span>•</span>
                            <span>{time}</span>
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
              <p className="text-gray-500 text-sm mb-4">Start tracking your nutrition</p>
              <Button
                onClick={() => setAddMealOpen(true)}
                className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Meal
              </Button>
            </div>
          )}
        </div>

        {/* Nutrition Calendar */}
        <div className="mt-8">
          <NutritionCalendar 
            entries={entries} 
            macroGoals={macroGoals}
          />
        </div>
      </main>

      <Footer />

      {/* Dialogs */}
      <AddMealDialog
        open={addMealOpen}
        onOpenChange={setAddMealOpen}
        onAdd={addEntry}
      />

      <SetMacroGoalsDialog
        open={goalsDialogOpen}
        onOpenChange={setGoalsDialogOpen}
        currentGoals={macroGoals}
        onSave={handleSaveGoals}
      />
    </div>
  );
}