import { Trophy, TrendingUp, Calendar, Filter, Search, ChevronRight, Medal, Award, Target, Flame, Zap, Plus, Trash2, Eye, BarChart3, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area } from 'recharts';
import { Header } from './Header';
import { Footer } from './Footer';
import { Progress } from './ui/progress';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import { AddPRDialog } from './AddPRDialog';
import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { toDate } from '../utils/dateUtils';

interface PRPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

// Exercise categories
const CATEGORIES = {
  chest: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Press', 'Incline Dumbbell Press', 'Chest Fly'],
  back: ['Deadlift', 'Barbell Row', 'Bent Over Row', 'Pull-ups', 'Chin-ups', 'Lat Pulldown', 'T-Bar Row', 'Cable Row'],
  legs: ['Squat', 'Front Squat', 'Back Squat', 'Leg Press', 'Romanian Deadlift', 'Lunges', 'Leg Extension', 'Leg Curl'],
  shoulders: ['Overhead Press', 'Military Press', 'Shoulder Press', 'Lateral Raise', 'Front Raise', 'Rear Delt Fly'],
  arms: ['Barbell Curl', 'Dumbbell Curl', 'Hammer Curl', 'Tricep Extension', 'Skull Crushers', 'Dips', 'Close Grip Bench'],
};

const COMPOUND_EXERCISES = [
  'Bench Press', 'Deadlift', 'Squat', 'Back Squat', 'Front Squat', 
  'Overhead Press', 'Military Press', 'Barbell Row'
];

export function PRPageEnhanced({ onNavigate, onLogout }: PRPageProps) {
  const { records, addRecord, deleteRecord } = usePersonalRecords();
  const [addPROpen, setAddPROpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedPR, setSelectedPR] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Group records by exercise name and get history
  const exercisePRs = useMemo(() => {
    if (!records || records.length === 0) return [];
    
    const grouped = new Map<string, typeof records>();
    
    records.forEach(record => {
      if (!record || !record.exerciseName) return; // Skip invalid records
      
      const existing = grouped.get(record.exerciseName);
      if (existing) {
        existing.push(record);
      } else {
        grouped.set(record.exerciseName, [record]);
      }
    });

    // Sort each exercise's records by weight (descending) and date
    const result = Array.from(grouped.entries()).map(([exercise, records]) => {
      if (!exercise || !records || records.length === 0) return null; // Safety check
      
      const sortedRecords = records.sort((a, b) => {
        if (!a || !b) return 0;
        if (b.weight !== a.weight) return b.weight - a.weight;
        try {
          const dateA = a?.date ? toDate(a.date).getTime() : 0;
          const dateB = b?.date ? toDate(b.date).getTime() : 0;
          return dateB - dateA;
        } catch (error) {
          return 0;
        }
      });

      const bestRecord = sortedRecords[0];
      if (!bestRecord) return null;
      
      const history = sortedRecords
        .sort((a, b) => {
          try {
            const dateA = a?.date ? toDate(a.date).getTime() : 0;
            const dateB = b?.date ? toDate(b.date).getTime() : 0;
            return dateA - dateB;
          } catch (error) {
            return 0;
          }
        })
        .map(r => {
          try {
            const recordDate = r?.date ? toDate(r.date) : new Date();
            return {
              date: recordDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              weight: r.weight || 0,
              reps: r.reps || 0,
              fullDate: recordDate,
            };
          } catch (error) {
            console.error('Error parsing record date:', error);
            return {
              date: 'Unknown',
              weight: r.weight || 0,
              reps: r.reps || 0,
              fullDate: new Date(),
            };
          }
        });

      // Calculate improvement from first to best
      const firstRecord = history[0];
      const improvement = firstRecord && firstRecord.weight > 0
        ? ((bestRecord.weight - firstRecord.weight) / firstRecord.weight) * 100 
        : 0;

      // Check if it's a compound lift
      const exerciseLower = (exercise || '').toLowerCase();
      const isCompound = COMPOUND_EXERCISES.some(comp => 
        exerciseLower.includes(comp.toLowerCase())
      );

      // Determine category
      let category = 'other';
      for (const [cat, exercises] of Object.entries(CATEGORIES)) {
        if (exercises.some(ex => exerciseLower.includes(ex.toLowerCase()))) {
          category = cat;
          break;
        }
      }

      return {
        exercise,
        bestRecord,
        history,
        improvement,
        isCompound,
        category,
        previousBest: history.length > 1 ? history[history.length - 2].weight : null,
        allRecords: sortedRecords,
      };
    }).filter(Boolean); // Remove null entries

    return result;
  }, [records]);

  // Filter PRs
  const filteredPRs = useMemo(() => {
    let filtered = exercisePRs;

    // Category filter
    if (categoryFilter !== 'all') {
      if (categoryFilter === 'compound') {
        filtered = filtered.filter(pr => pr.isCompound);
      } else {
        filtered = filtered.filter(pr => pr.category === categoryFilter);
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(pr => pr.exercise && pr.exercise.toLowerCase().includes(query));
    }

    return filtered.sort((a, b) => {
      // Sort compound lifts first, then by weight
      if (a.isCompound && !b.isCompound) return -1;
      if (!a.isCompound && b.isCompound) return 1;
      return b.bestRecord.weight - a.bestRecord.weight;
    });
  }, [exercisePRs, categoryFilter, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalPRs = exercisePRs.length;
    
    // Recent PRs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentPRs = records.filter(r => {
      try {
        if (!r?.date) return false;
        const recordDate = toDate(r.date);
        return recordDate >= thirtyDaysAgo;
      } catch (error) {
        console.error('Error parsing PR date in stats:', error);
        return false;
      }
    }).length;

    // Calculate big 3 total (if available)
    const bench = exercisePRs.find(pr => pr.exercise && pr.exercise.toLowerCase().includes('bench press'))?.bestRecord.weight || 0;
    const squat = exercisePRs.find(pr => pr.exercise && pr.exercise.toLowerCase().includes('squat'))?.bestRecord.weight || 0;
    const deadlift = exercisePRs.find(pr => pr.exercise && pr.exercise.toLowerCase().includes('deadlift'))?.bestRecord.weight || 0;
    const big3Total = bench + squat + deadlift;

    // Calculate strength score (average improvement)
    const avgImprovement = exercisePRs.length > 0
      ? exercisePRs.reduce((sum, pr) => sum + pr.improvement, 0) / exercisePRs.length
      : 0;

    return {
      totalPRs,
      recentPRs,
      big3Total,
      avgImprovement,
    };
  }, [exercisePRs, records]);

  // Strength profile data
  const strengthProfile = useMemo(() => {
    const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms'];
    
    return categories.map(cat => {
      const catPRs = exercisePRs.filter(pr => pr.category === cat.toLowerCase());
      const avgWeight = catPRs.length > 0
        ? catPRs.reduce((sum, pr) => sum + pr.bestRecord.weight, 0) / catPRs.length
        : 0;
      
      // Normalize to 0-100 scale (assuming max average is 150kg)
      const value = Math.min((avgWeight / 150) * 100, 100);
      
      return {
        category: cat,
        value: Math.round(value),
        count: catPRs.length,
      };
    });
  }, [exercisePRs]);

  const handleDeletePR = async (exerciseName: string, recordId: string) => {
    if (confirm(`Are you sure you want to delete this PR for ${exerciseName}?`)) {
      try {
        await deleteRecord(recordId);
        toast.success('PR deleted successfully');
        if (selectedPR && selectedPR.exercise === exerciseName) {
          setDetailsOpen(false);
          setSelectedPR(null);
        }
      } catch (error) {
        toast.error('Failed to delete PR');
      }
    }
  };

  const handleViewDetails = (pr: typeof exercisePRs[0]) => {
    setSelectedPR(pr);
    setDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="pr" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#22C55E]/10 via-[#151923] to-[#00D1FF]/10 p-8 mb-8 border border-white/5">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D1FF]/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center shadow-2xl">
                  <Trophy className="w-9 h-9 text-white" />
                </div>
                <div>
                  <h1 className="text-white mb-1">Personal Records</h1>
                  <p className="text-gray-400">Track and celebrate your strength milestones</p>
                </div>
              </div>

              <Button 
                onClick={() => setAddPROpen(true)}
                className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New PR
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0B0B0F]/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-[#22C55E]" />
                  <p className="text-sm text-gray-400">Total PRs</p>
                </div>
                <p className="text-3xl text-white">{stats.totalPRs}</p>
              </div>

              <div className="bg-[#0B0B0F]/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-[#00D1FF]" />
                  <p className="text-sm text-gray-400">This Month</p>
                </div>
                <p className="text-3xl text-[#00D1FF]">{stats.recentPRs}</p>
              </div>

              <div className="bg-[#0B0B0F]/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-[#FF6B6B]" />
                  <p className="text-sm text-gray-400">Big 3 Total</p>
                </div>
                <p className="text-3xl text-white">{stats.big3Total} kg</p>
              </div>

              <div className="bg-[#0B0B0F]/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-[#A78BFA]" />
                  <p className="text-sm text-gray-400">Avg Growth</p>
                </div>
                <p className="text-3xl text-[#A78BFA]">+{stats.avgImprovement.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFFFFF]/40" />
            <Input
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-[#151923] border-white/10 text-white rounded-xl"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[200px] h-12 bg-[#151923] border-white/10 text-white rounded-xl">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#151923] border-white/10">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="compound">Compound Lifts</SelectItem>
              <SelectItem value="chest">Chest</SelectItem>
              <SelectItem value="back">Back</SelectItem>
              <SelectItem value="legs">Legs</SelectItem>
              <SelectItem value="shoulders">Shoulders</SelectItem>
              <SelectItem value="arms">Arms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* PR List - 2/3 width */}
          <div className="lg:col-span-2 space-y-4">
            {filteredPRs.length > 0 ? (
              filteredPRs.map((pr) => {
                const trend = pr.previousBest 
                  ? pr.bestRecord.weight > pr.previousBest 
                    ? 'up' 
                    : pr.bestRecord.weight < pr.previousBest 
                    ? 'down' 
                    : 'same'
                  : null;

                return (
                  <div
                    key={pr.exercise}
                    className="group relative overflow-hidden bg-[#151923] rounded-2xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 cursor-pointer"
                    onClick={() => handleViewDetails(pr)}
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/0 to-[#00D1FF]/0 group-hover:from-[#22C55E]/5 group-hover:to-[#00D1FF]/5 transition-all duration-300" />

                    <div className="relative flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                        pr.isCompound
                          ? 'bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 border border-[#22C55E]/30'
                          : 'bg-[#00D1FF]/10 border border-[#00D1FF]/20'
                      }`}>
                        {pr.isCompound ? (
                          <Trophy className="w-7 h-7 text-[#22C55E]" />
                        ) : (
                          <Award className="w-7 h-7 text-[#00D1FF]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-white">{pr.exercise}</h4>
                              {pr.isCompound && (
                                <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30">
                                  Compound
                                </Badge>
                              )}
                              <Badge className="bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30 capitalize">
                                {pr.category}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Current PR</p>
                            <p className="text-2xl text-[#22C55E]">{pr.bestRecord.weight} kg</p>
                            <p className="text-xs text-gray-400">{pr.bestRecord.reps} reps</p>
                          </div>
                          
                          {pr.previousBest && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Previous</p>
                              <p className="text-lg text-gray-400">{pr.previousBest} kg</p>
                              <div className={`flex items-center gap-1 text-xs ${
                                trend === 'up' ? 'text-[#22C55E]' : trend === 'down' ? 'text-red-500' : 'text-gray-500'
                              }`}>
                                {trend === 'up' && <ArrowUp className="w-3 h-3" />}
                                {trend === 'down' && <ArrowDown className="w-3 h-3" />}
                                {trend === 'same' && <Minus className="w-3 h-3" />}
                                {Math.abs(pr.bestRecord.weight - pr.previousBest).toFixed(1)} kg
                              </div>
                            </div>
                          )}

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Improvement</p>
                            <p className="text-lg text-[#00D1FF]">+{pr.improvement.toFixed(1)}%</p>
                            <p className="text-xs text-gray-400">{pr.history.length} records</p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-1">Date</p>
                            <p className="text-sm text-white">
                              {toDate(pr.bestRecord.date).toLocaleDateString('en-US', { 
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {toDate(pr.bestRecord.date).getFullYear()}
                            </p>
                          </div>
                        </div>

                        {/* Mini Chart */}
                        {pr.history.length > 1 && (
                          <div className="h-16 mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={pr.history}>
                                <defs>
                                  <linearGradient id={`gradient-${pr.exercise}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                                  </linearGradient>
                                </defs>
                                <Area
                                  type="monotone"
                                  dataKey="weight"
                                  stroke="#22C55E"
                                  strokeWidth={2}
                                  fill={`url(#gradient-${pr.exercise})`}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(pr);
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
                            handleDeletePR(pr.exercise, pr.bestRecord.id);
                          }}
                          className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-[#151923] rounded-2xl border border-white/5">
                <div className="w-20 h-20 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-[#22C55E]" />
                </div>
                <p className="text-xl text-gray-400 mb-2">No personal records yet</p>
                <p className="text-sm text-gray-500 mb-6">
                  {searchQuery ? 'Try a different search term' : 'Start tracking your strength gains today'}
                </p>
                <Button
                  onClick={() => setAddPROpen(true)}
                  className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First PR
                </Button>
              </div>
            )}
          </div>

          {/* Strength Profile - 1/3 width */}
          <div className="space-y-6">
            {/* Strength Radar */}
            <div className="bg-[#151923] rounded-2xl p-6 border border-white/5">
              <h3 className="text-white mb-2">Strength Profile</h3>
              <p className="text-sm text-gray-400 mb-4">Your relative strength across muscle groups</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={strengthProfile}>
                    <PolarGrid stroke="#333" />
                    <PolarAngleAxis 
                      dataKey="category" 
                      stroke="#666"
                      style={{ fontSize: '12px' }}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      stroke="#666"
                    />
                    <Radar 
                      name="Strength" 
                      dataKey="value" 
                      stroke="#22C55E" 
                      fill="#22C55E" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Category breakdown */}
              <div className="mt-4 space-y-2">
                {strengthProfile.map(cat => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{cat.category}</span>
                    <span className="text-[#22C55E]">{cat.count} PRs</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-[#22C55E]/10 to-[#00D1FF]/10 rounded-2xl p-6 border border-[#22C55E]/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-[#22C55E]" />
                </div>
                <div>
                  <h3 className="text-white">Keep Pushing!</h3>
                  <p className="text-sm text-gray-400">You're getting stronger</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Average Improvement</p>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.min(stats.avgImprovement, 100)} className="flex-1 h-2" />
                    <span className="text-sm text-[#22C55E]">+{stats.avgImprovement.toFixed(1)}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Recent Activity</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(stats.recentPRs / Math.max(stats.totalPRs, 1)) * 100} className="flex-1 h-2" />
                    <span className="text-sm text-[#00D1FF]">{stats.recentPRs} new</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Add PR Dialog */}
      <AddPRDialog
        open={addPROpen}
        onOpenChange={setAddPROpen}
        onAdd={addRecord}
      />

      {/* PR Details Dialog */}
      {selectedPR && (
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-[#0B0B0F] border border-white/10 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-[#22C55E]" />
                </div>
                {selectedPR.exercise}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Complete history and progression
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Current PR */}
              <div className="bg-[#151923] rounded-xl p-6 border border-[#22C55E]/30">
                <p className="text-sm text-gray-400 mb-2">Current Personal Record</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl text-[#22C55E]">{selectedPR.bestRecord.weight}</p>
                  <p className="text-2xl text-gray-400">kg</p>
                  <p className="text-lg text-gray-500">× {selectedPR.bestRecord.reps}</p>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Set on {toDate(selectedPR.bestRecord.date).toLocaleDateString('en-US', { 
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              {/* Progress Chart */}
              {selectedPR.history.length > 1 && (
                <div className="bg-[#151923] rounded-xl p-6 border border-white/10">
                  <h4 className="text-white mb-4">Progress Over Time</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedPR.history}>
                        <defs>
                          <linearGradient id="detailGradient" x1="0" y1="0" x2="0" y2="1">
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
                          }}
                          formatter={(value: any, name: string) => {
                            if (name === 'weight') return [`${value} kg`, 'Weight'];
                            if (name === 'reps') return [`${value} reps`, 'Reps'];
                            return [value, name];
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="weight"
                          stroke="#22C55E"
                          strokeWidth={3}
                          dot={{ fill: '#22C55E', r: 5, strokeWidth: 2, stroke: '#0B0B0F' }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* All Records */}
              <div className="bg-[#151923] rounded-xl p-6 border border-white/10">
                <h4 className="text-white mb-4">All Records ({selectedPR.allRecords.length})</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedPR.allRecords.map((record: any, index: number) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-[#0B0B0F] rounded-lg border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        {index === 0 && (
                          <div className="w-8 h-8 rounded-full bg-[#22C55E]/20 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-[#22C55E]" />
                          </div>
                        )}
                        <div>
                          <p className="text-white">
                            {record.weight} kg × {record.reps}
                          </p>
                          <p className="text-xs text-gray-400">
                            {toDate(record.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePR(selectedPR.exercise, record.id)}
                        className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
