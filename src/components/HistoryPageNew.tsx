import { Calendar, Filter, Search, Dumbbell, Heart, ChevronDown, TrendingUp, Activity, Clock, Award, Download, Share2, Trash2, Eye, CalendarDays, BarChart3, List, Zap, Target, Flame } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, ComposedChart } from 'recharts';
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

export function HistoryPage({ onNavigate, onLogout }: HistoryPageProps) {
  const { workouts, stats, deleteWorkout } = useWorkouts(100);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [timeFilter, setTimeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [chartView, setChartView] = useState<'volume' | 'workouts'>('volume');

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthWorkouts = workouts.filter(w => {
      const workoutDate = w.date.toDate();
      return workoutDate >= firstDayOfMonth;
    });

    const totalVolume = monthWorkouts.reduce((sum, w) => 
      sum + w.exercises.reduce((total, ex) => 
        total + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
      ), 0
    );

    const avgDuration = monthWorkouts.length > 0
      ? Math.round(monthWorkouts.reduce((sum, w) => sum + w.duration, 0) / monthWorkouts.length)
      : 0;

    return {
      totalWorkouts: monthWorkouts.length,
      totalVolume: `${(totalVolume / 1000).toFixed(1)}k kg`,
      avgDuration: `${avgDuration} min`,
      caloriesBurned: `${Math.round(monthWorkouts.length * 250)} kcal`, // Estimation
      prCount: 0, // Could be calculated from PR records
    };
  }, [workouts]);

  // Calculate volume data for chart
  const volumeData = useMemo(() => {
    const last14Days = [];
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
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

      last14Days.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: Math.round(volume),
        workouts: dayWorkouts.length,
      });
    }
    
    return last14Days;
  }, [workouts]);

  // Group workouts by week
  const groupedWorkouts = useMemo(() => {
    const groups: { [key: string]: any[] } = {
      'This Week': [],
      'Last Week': [],
      'Earlier': [],
    };

    const now = new Date();
    const dayOfWeek = now.getDay();
    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    thisMonday.setHours(0, 0, 0, 0);

    const lastMonday = new Date(thisMonday);
    lastMonday.setDate(thisMonday.getDate() - 7);

    workouts.forEach(workout => {
      const workoutDate = workout.date.toDate();
      
      if (workoutDate >= thisMonday) {
        groups['This Week'].push(workout);
      } else if (workoutDate >= lastMonday) {
        groups['Last Week'].push(workout);
      } else {
        groups['Earlier'].push(workout);
      }
    });

    return groups;
  }, [workouts]);

  // Filter workouts by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedWorkouts;

    const query = searchQuery.toLowerCase();
    const filtered: { [key: string]: any[] } = {};

    Object.entries(groupedWorkouts).forEach(([week, workouts]) => {
      const matchingWorkouts = workouts.filter(w => 
        w.name.toLowerCase().includes(query) ||
        w.type.toLowerCase().includes(query) ||
        w.exercises.some((ex: any) => ex.name.toLowerCase().includes(query))
      );

      if (matchingWorkouts.length > 0) {
        filtered[week] = matchingWorkouts;
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const calculateVolume = (workout: any) => {
    const volume = workout.exercises.reduce((total: number, ex: any) => 
      total + ex.sets.reduce((sum: number, set: any) => sum + (set.weight * set.reps), 0), 0
    );
    return `${(volume / 1000).toFixed(1)}k kg`;
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="history" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="mb-2">Workout History</h1>
          <p className="text-[#FFFFFF]/60">Track your progress and review past sessions</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#22C55E]" />
              </div>
              <p className="text-sm text-gray-400">Workouts</p>
            </div>
            <p className="text-2xl text-white">{monthlyStats.totalWorkouts}</p>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </div>

          <div className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#00D1FF]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#00D1FF]" />
              </div>
              <p className="text-sm text-gray-400">Volume</p>
            </div>
            <p className="text-2xl text-white">{monthlyStats.totalVolume}</p>
            <p className="text-xs text-gray-500 mt-1">Total lifted</p>
          </div>

          <div className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#22C55E]" />
              </div>
              <p className="text-sm text-gray-400">Avg Time</p>
            </div>
            <p className="text-2xl text-white">{monthlyStats.avgDuration}</p>
            <p className="text-xs text-gray-500 mt-1">Per workout</p>
          </div>

          <div className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#00D1FF]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#00D1FF]" />
              </div>
              <p className="text-sm text-gray-400">Calories</p>
            </div>
            <p className="text-2xl text-white">{monthlyStats.caloriesBurned}</p>
            <p className="text-xs text-gray-500 mt-1">Estimated</p>
          </div>

          <div className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-[#22C55E]" />
              </div>
              <p className="text-sm text-gray-400">All Time</p>
            </div>
            <p className="text-2xl text-white">{stats.totalWorkouts}</p>
            <p className="text-xs text-gray-500 mt-1">Total workouts</p>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="bg-[#151923] rounded-xl p-6 border border-white/5 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-white mb-1">Training Volume</h3>
              <p className="text-sm text-gray-400">Last 14 days</p>
            </div>
            <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              Progress
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#00D1FF" stopOpacity={0.8} />
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
                    backgroundColor: '#151923',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                  }}
                  formatter={(value: any) => [`${value} kg`, 'Volume']}
                />
                <Bar
                  dataKey="volume"
                  fill="url(#volumeGradient)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFFFFF]/40" />
            <Input
              placeholder="Search workouts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#151923] border-white/10 text-white"
            />
          </div>
          <Button
            variant="outline"
            className="bg-[#151923] border-white/10 text-white hover:bg-[#151923]/80"
            onClick={() => toast.info('Export feature coming soon!')}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Workout History */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-[#151923] border border-white/10 mb-6">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#0B0B0F]">
              All Workouts
            </TabsTrigger>
            <TabsTrigger value="strength" className="data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#0B0B0F]">
              <Dumbbell className="w-4 h-4 mr-2" />
              Strength
            </TabsTrigger>
            <TabsTrigger value="cardio" className="data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#0B0B0F]">
              <Heart className="w-4 h-4 mr-2" />
              Cardio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {Object.entries(filteredGroups).map(([week, weekWorkouts]) => (
              <div key={week} className="mb-8">
                <h3 className="text-white mb-4">{week}</h3>
                <div className="space-y-4">
                  {weekWorkouts.map((workout: any) => (
                    <div
                      key={workout.id}
                      className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            workout.type === 'strength' 
                              ? 'bg-[#22C55E]/10' 
                              : 'bg-[#00D1FF]/10'
                          }`}>
                            {workout.type === 'strength' ? (
                              <Dumbbell className="w-6 h-6 text-[#22C55E]" />
                            ) : (
                              <Heart className="w-6 h-6 text-[#00D1FF]" />
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white">{workout.name}</h4>
                              <Badge className={`${
                                workout.type === 'strength'
                                  ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                                  : 'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30'
                              }`}>
                                {workout.type}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(workout.date.toDate())}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {workout.duration} min
                              </span>
                              <span>•</span>
                              <span>{workout.exercises.length} exercises</span>
                              <span>•</span>
                              <span className="text-[#22C55E]">{calculateVolume(workout)} volume</span>
                            </div>

                            {workout.notes && (
                              <p className="text-sm text-gray-400 italic">"{workout.notes}"</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewWorkout(workout)}
                            className="text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWorkout(workout.id)}
                            className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {Object.keys(filteredGroups).length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#151923] flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-600" />
                </div>
                <p className="text-gray-400 mb-2">No workouts found</p>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Try a different search term' : 'Start your first workout to see it here'}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="strength">
            {/* Similar structure but filtered for strength workouts */}
            <div className="space-y-4">
              {workouts.filter(w => w.type === 'strength').slice(0, 10).map((workout: any) => (
                <div
                  key={workout.id}
                  className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-[#22C55E]/10 flex items-center justify-center">
                        <Dumbbell className="w-6 h-6 text-[#22C55E]" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-white mb-2">{workout.name}</h4>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{formatDate(workout.date.toDate())}</span>
                          <span>•</span>
                          <span>{workout.duration} min</span>
                          <span>•</span>
                          <span className="text-[#22C55E]">{calculateVolume(workout)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewWorkout(workout)}
                        className="text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cardio">
            {/* Similar structure but filtered for cardio workouts */}
            <div className="space-y-4">
              {workouts.filter(w => w.type === 'cardio').slice(0, 10).map((workout: any) => (
                <div
                  key={workout.id}
                  className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#00D1FF]/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-[#00D1FF]" />
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-white mb-2">{workout.name}</h4>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>{formatDate(workout.date.toDate())}</span>
                          <span>•</span>
                          <span>{workout.duration} min</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewWorkout(workout)}
                        className="text-[#00D1FF] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteWorkout(workout.id)}
                        className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
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