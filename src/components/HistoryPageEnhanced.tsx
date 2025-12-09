import { Calendar, Filter, Search, Dumbbell, Heart, TrendingUp, Activity, Clock, Award, Download, Trash2, Eye, Zap, Target, Flame, BarChart3, ChevronRight, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';
import { Header } from './Header';
import { Footer } from './Footer';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useWorkouts } from '../hooks/useWorkouts';
import { WorkoutDetailsDialog } from './WorkoutDetailsDialog';
import { toast } from 'sonner@2.0.3';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface HistoryPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function HistoryPageEnhanced({ onNavigate, onLogout }: HistoryPageProps) {
  const { workouts, stats, deleteWorkout } = useWorkouts(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [periodFilter, setPeriodFilter] = useState('month');
  const [chartType, setChartType] = useState<'volume' | 'frequency'>('volume');

  // Calculate stats based on period
  const periodStats = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (periodFilter) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(0);
    }

    const filteredWorkouts = workouts.filter(w => w.date.toDate() >= startDate);

    const totalVolume = filteredWorkouts.reduce((sum, w) => 
      sum + w.exercises.reduce((total, ex) => 
        total + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
      ), 0
    );

    const totalTime = filteredWorkouts.reduce((sum, w) => sum + w.duration, 0);
    const avgDuration = filteredWorkouts.length > 0 ? Math.round(totalTime / filteredWorkouts.length) : 0;
    const totalSets = filteredWorkouts.reduce((sum, w) => 
      sum + w.exercises.reduce((total, ex) => total + ex.sets.length, 0), 0
    );

    // Calculate streak
    const sortedDates = filteredWorkouts
      .map(w => w.date.toDate())
      .sort((a, b) => b.getTime() - a.getTime());
    
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    for (let date of sortedDates) {
      const workoutDate = new Date(date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((checkDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === currentStreak || (currentStreak === 0 && diffDays === 0)) {
        currentStreak++;
        checkDate = workoutDate;
      } else {
        break;
      }
    }

    return {
      totalWorkouts: filteredWorkouts.length,
      totalVolume: Math.round(totalVolume),
      totalVolumeFormatted: `${(totalVolume / 1000).toFixed(1)}k`,
      avgDuration,
      totalTime,
      totalSets,
      caloriesBurned: Math.round(filteredWorkouts.length * 250),
      currentStreak,
    };
  }, [workouts, periodFilter]);

  // Calculate chart data
  const chartData = useMemo(() => {
    const days = periodFilter === 'week' ? 7 : periodFilter === 'month' ? 30 : 90;
    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      const dayWorkouts = workouts.filter(w => {
        const wDate = w.date.toDate();
        return wDate >= date && wDate < nextDay;
      });

      const volume = dayWorkouts.reduce((sum, w) => 
        sum + w.exercises.reduce((total, ex) => 
          total + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
        ), 0
      );

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: Math.round(volume / 1000),
        workouts: dayWorkouts.length,
        sets: dayWorkouts.reduce((sum, w) => sum + w.exercises.reduce((t, ex) => t + ex.sets.length, 0), 0),
      });
    }

    return data;
  }, [workouts, periodFilter]);

  // Group workouts by date
  const groupedWorkouts = useMemo(() => {
    const groups: { [key: string]: any[] } = {};

    workouts.forEach(workout => {
      const date = workout.date.toDate();
      const key = date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric',
        year: 'numeric' 
      });
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(workout);
    });

    return groups;
  }, [workouts]);

  // Filter workouts by search
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedWorkouts;

    const query = searchQuery.toLowerCase();
    const filtered: { [key: string]: any[] } = {};

    Object.entries(groupedWorkouts).forEach(([date, workouts]) => {
      const matchingWorkouts = workouts.filter(w => 
        w.name.toLowerCase().includes(query) ||
        w.type.toLowerCase().includes(query) ||
        w.exercises.some((ex: any) => ex.name.toLowerCase().includes(query))
      );

      if (matchingWorkouts.length > 0) {
        filtered[date] = matchingWorkouts;
      }
    });

    return filtered;
  }, [groupedWorkouts, searchQuery]);

  const handleViewWorkout = (workout: any) => {
    setSelectedWorkout(workout);
    setDetailsOpen(true);
  };

  const handleDeleteWorkout = async (workoutId: string) => {
    if (confirm('Are you sure you want to delete this workout? This action cannot be undone.')) {
      try {
        await deleteWorkout(workoutId);
        toast.success('Workout deleted successfully');
        if (selectedWorkout?.id === workoutId) {
          setDetailsOpen(false);
          setSelectedWorkout(null);
        }
      } catch (error) {
        toast.error('Failed to delete workout');
      }
    }
  };

  const calculateVolume = (workout: any) => {
    const volume = workout.exercises.reduce((total: number, ex: any) => 
      total + ex.sets.reduce((sum: number, set: any) => sum + (set.weight * set.reps), 0), 0
    );
    return Math.round(volume);
  };

  const getTotalSets = (workout: any) => {
    return workout.exercises.reduce((total: number, ex: any) => total + ex.sets.length, 0);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="history" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Page Header with Filter */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2">Workout History</h1>
            <p className="text-[#FFFFFF]/60">Track your progress and analyze your training</p>
          </div>
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[180px] bg-[#151923] border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#151923] border-white/10">
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Workouts */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#22C55E]/20 to-[#151923] rounded-2xl p-6 border border-[#22C55E]/20 group hover:border-[#22C55E]/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-3xl group-hover:bg-[#22C55E]/20 transition-all duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
                  <Dumbbell className="w-6 h-6 text-[#22C55E]" />
                </div>
                <TrendingUp className="w-5 h-5 text-[#22C55E]" />
              </div>
              <p className="text-3xl text-white mb-1">{periodStats.totalWorkouts}</p>
              <p className="text-sm text-gray-400">Total Workouts</p>
            </div>
          </div>

          {/* Total Volume */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#00D1FF]/20 to-[#151923] rounded-2xl p-6 border border-[#00D1FF]/20 group hover:border-[#00D1FF]/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00D1FF]/10 rounded-full blur-3xl group-hover:bg-[#00D1FF]/20 transition-all duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#00D1FF]/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#00D1FF]" />
                </div>
                <BarChart3 className="w-5 h-5 text-[#00D1FF]" />
              </div>
              <p className="text-3xl text-white mb-1">{periodStats.totalVolumeFormatted} kg</p>
              <p className="text-sm text-gray-400">Total Volume</p>
            </div>
          </div>

          {/* Current Streak */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FF6B6B]/20 to-[#151923] rounded-2xl p-6 border border-[#FF6B6B]/20 group hover:border-[#FF6B6B]/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6B6B]/10 rounded-full blur-3xl group-hover:bg-[#FF6B6B]/20 transition-all duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#FF6B6B]/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[#FF6B6B]" />
                </div>
                <Zap className="w-5 h-5 text-[#FF6B6B]" />
              </div>
              <p className="text-3xl text-white mb-1">{periodStats.currentStreak} days</p>
              <p className="text-sm text-gray-400">Current Streak</p>
            </div>
          </div>

          {/* Avg Duration */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#A78BFA]/20 to-[#151923] rounded-2xl p-6 border border-[#A78BFA]/20 group hover:border-[#A78BFA]/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#A78BFA]/10 rounded-full blur-3xl group-hover:bg-[#A78BFA]/20 transition-all duration-300" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#A78BFA]/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#A78BFA]" />
                </div>
                <Activity className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <p className="text-3xl text-white mb-1">{periodStats.avgDuration} min</p>
              <p className="text-sm text-gray-400">Avg Duration</p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-[#151923] rounded-2xl p-6 border border-white/5 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white mb-1">Training Analytics</h3>
              <p className="text-sm text-gray-400">
                {periodFilter === 'week' ? 'Last 7 days' : periodFilter === 'month' ? 'Last 30 days' : 'Last 90 days'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType('volume')}
                className={chartType === 'volume' ? 'bg-[#22C55E]/20 text-[#22C55E]' : 'text-gray-400'}
              >
                Volume
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setChartType('frequency')}
                className={chartType === 'frequency' ? 'bg-[#00D1FF]/20 text-[#00D1FF]' : 'text-gray-400'}
              >
                Frequency
              </Button>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'volume' ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0B0F',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      padding: '12px',
                    }}
                    formatter={(value: any) => [`${value}k kg`, 'Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#22C55E"
                    strokeWidth={2}
                    fill="url(#volumeGradient)"
                  />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <defs>
                    <linearGradient id="frequencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D1FF" stopOpacity={1} />
                      <stop offset="95%" stopColor="#00D1FF" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#666"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0B0F',
                      border: '1px solid rgba(0, 209, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#FFFFFF',
                      padding: '12px',
                    }}
                    formatter={(value: any) => [`${value}`, 'Workouts']}
                  />
                  <Bar
                    dataKey="workouts"
                    fill="url(#frequencyGradient)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFFFFF]/40" />
            <Input
              placeholder="Search workouts by name, type, or exercise..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-[#151923] border-white/10 text-white rounded-xl"
            />
          </div>
          <Button
            variant="outline"
            className="h-12 bg-[#151923] border-white/10 text-white hover:bg-[#151923]/80 rounded-xl"
            onClick={() => toast.info('Export feature coming soon!')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Workout List */}
        <div className="space-y-6">
          {Object.entries(filteredGroups).length > 0 ? (
            Object.entries(filteredGroups).map(([date, dayWorkouts]) => (
              <div key={date}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <p className="text-sm text-gray-400">{date}</p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>

                <div className="space-y-3">
                  {dayWorkouts.map((workout: any) => {
                    const volume = calculateVolume(workout);
                    const totalSets = getTotalSets(workout);

                    return (
                      <div
                        key={workout.id}
                        className="group relative overflow-hidden bg-[#151923] rounded-2xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 cursor-pointer"
                        onClick={() => handleViewWorkout(workout)}
                      >
                        {/* Background gradient on hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/0 to-[#00D1FF]/0 group-hover:from-[#22C55E]/5 group-hover:to-[#00D1FF]/5 transition-all duration-300" />

                        <div className="relative flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                            workout.type === 'strength'
                              ? 'bg-[#22C55E]/10 border border-[#22C55E]/20'
                              : 'bg-[#00D1FF]/10 border border-[#00D1FF]/20'
                          }`}>
                            {workout.type === 'strength' ? (
                              <Dumbbell className="w-7 h-7 text-[#22C55E]" />
                            ) : (
                              <Heart className="w-7 h-7 text-[#00D1FF]" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-white mb-2">{workout.name}</h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`${
                                    workout.type === 'strength'
                                      ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                                      : 'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30'
                                  }`}>
                                    {workout.type}
                                  </Badge>
                                  <span className="text-sm text-gray-500">
                                    {workout.date.toDate().toLocaleTimeString('en-US', { 
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true 
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-4 mb-3">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Duration</p>
                                <p className="text-sm text-white">{workout.duration} min</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Exercises</p>
                                <p className="text-sm text-white">{workout.exercises.length}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Total Sets</p>
                                <p className="text-sm text-white">{totalSets}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Volume</p>
                                <p className="text-sm text-[#22C55E]">{(volume / 1000).toFixed(1)}k kg</p>
                              </div>
                            </div>

                            {/* Notes */}
                            {workout.notes && (
                              <p className="text-sm text-gray-400 italic border-l-2 border-[#22C55E]/30 pl-3">
                                "{workout.notes}"
                              </p>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewWorkout(workout);
                              }}
                              className="text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteWorkout(workout.id);
                              }}
                              className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-[#151923] border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-gray-600" />
              </div>
              <p className="text-xl text-gray-400 mb-2">No workouts found</p>
              <p className="text-sm text-gray-500 mb-6">
                {searchQuery ? 'Try a different search term' : 'Start your fitness journey today'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {selectedWorkout && (
        <WorkoutDetailsDialog
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          workout={selectedWorkout}
          onDelete={handleDeleteWorkout}
        />
      )}
    </div>
  );
}