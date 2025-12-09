import { Header } from './Header';
import { Footer } from './Footer';
import { KPICard } from './KPICard';
import { HeroPRCard } from './HeroPRCard';
import { SessionCard } from './SessionCard';
import { GuideCard } from './GuideCard';
import { FirebaseIndexError } from './FirebaseIndexError';
import { Activity, TrendingUp, Calendar, Zap, ChevronRight, Flame, Award, Dumbbell, Clock, Plus, Trophy, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useWorkouts } from '../hooks/useWorkouts';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import { useState, useMemo } from 'react';
import { AddWorkoutDialog } from './AddWorkoutDialog';
import { toDate } from '../utils/dateUtils';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function HomePage({ onNavigate, onLogout }: HomePageProps) {
  const { currentUser, userProfile } = useAuth();
  const { workouts, stats, addWorkout, loading, error } = useWorkouts(10);
  const { records } = usePersonalRecords();
  const [addWorkoutOpen, setAddWorkoutOpen] = useState(false);
  
  const userName = userProfile?.displayName || currentUser?.displayName || 'Athlete';
  const firstName = userName.split(' ')[0];

  // Debug log
  console.log('HomePage - Workouts:', workouts.length, 'Stats:', stats, 'Loading:', loading);

  // Calculate current streak from workouts
  const currentStreak = useMemo(() => {
    if (workouts.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < workouts.length; i++) {
      const workoutDate = toDate(workouts[i].date);
      workoutDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else if (daysDiff > streak) {
        break;
      }
    }
    
    return streak;
  }, [workouts]);

  // Calculate weekly activity
  const weeklyActivity = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const activity = days.map((day, index) => {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + index);
      const nextDay = new Date(currentDay);
      nextDay.setDate(currentDay.getDate() + 1);
      
      const workoutsOnDay = workouts.filter(w => {
        const wDate = toDate(w.date);
        return wDate >= currentDay && wDate < nextDay;
      }).length;
      
      return { day, workouts: workoutsOnDay };
    });
    
    return activity;
  }, [workouts]);

  const weeklyWorkoutCount = weeklyActivity.reduce((sum, day) => sum + day.workouts, 0);
  const weeklyGoal = { current: weeklyWorkoutCount, target: 5, percentage: Math.min((weeklyWorkoutCount / 5) * 100, 100) };

  // Get recent PRs (last 3)
  const recentPRs = useMemo(() => {
    return records.slice(0, 3).map(record => ({
      exercise: record.exerciseName,
      weight: `${record.weight} kg`,
      improvement: '+New',
      date: formatRelativeDate(toDate(record.date))
    }));
  }, [records]);

  function formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  const kpiData = [
    {
      label: 'Total Workouts',
      value: stats.totalWorkouts.toString(),
      subtitle: 'All time',
      icon: Activity,
      trend: 'up',
    },
    {
      label: 'Active Days',
      value: weeklyWorkoutCount.toString(),
      subtitle: 'This week',
      icon: Calendar,
      trend: 'up',
    },
    {
      label: 'Personal Records',
      value: records.length.toString(),
      subtitle: `${recentPRs.length} recent`,
      icon: TrendingUp,
      trend: 'up',
    },
    {
      label: 'Current Streak',
      value: currentStreak.toString(),
      subtitle: currentStreak > 0 ? 'Keep it up!' : 'Start today!',
      icon: Zap,
      trend: 'up',
    },
  ];

  const recentSessions = workouts.slice(0, 3).map(workout => {
    const wDate = toDate(workout.date);
    return {
      title: workout.name,
      date: wDate.toLocaleDateString(),
      duration: formatDuration(workout.duration),
      exercises: workout.exercises.length,
      volume: workout.exercises.reduce((total, ex) => 
        total + ex.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0), 0
      ).toLocaleString() + ' kg',
      type: workout.type as 'strength' | 'cardio',
    };
  });

  // Get top PR
  const topPR = records.length > 0 ? records[0] : null;
  
  const quickGuides = [
    {
      title: 'Start a Workout',
      description: 'Begin tracking your session',
      icon: Zap,
      color: 'from-[#22C55E] to-[#00D1FF]',
    },
    {
      title: 'View History',
      description: 'Review past workouts',
      icon: Calendar,
      color: 'from-[#00D1FF] to-[#22C55E]',
    },
    {
      title: 'Check PRs',
      description: 'See your personal records',
      icon: TrendingUp,
      color: 'from-[#22C55E] to-[#00D1FF]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="home" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Firebase Index Error Alert */}
        <FirebaseIndexError error={error} />
        
        {/* Welcome Section - Enhanced Modern Design */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#22C55E]/10 via-[#151923] to-[#00D1FF]/10 p-10 mb-8 border border-white/10 shadow-2xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00D1FF]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-white text-4xl">Welcome back, {firstName}! 👋</h1>
                {currentStreak > 0 && (
                  <Badge className="bg-gradient-to-r from-[#22C55E]/20 to-[#00D1FF]/20 text-white border-[#22C55E]/30 px-4 py-1">
                    <Flame className="w-4 h-4 mr-1 text-[#22C55E]" />
                    {currentStreak} day streak
                  </Badge>
                )}
              </div>
              <p className="text-gray-400 text-lg mb-6 max-w-2xl">Ready to crush your fitness goals today? Let's make it count!</p>
              
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() => onNavigate('start-session')}
                  size="lg"
                  className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] hover:opacity-90 transition-all duration-300 hover:scale-105 h-14 px-8 shadow-2xl shadow-[#22C55E]/30"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Start New Workout
                </Button>
                <Button
                  onClick={() => setAddWorkoutOpen(true)}
                  size="lg"
                  variant="outline"
                  className="border-white/10 hover:bg-white/5 h-14 px-8"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Log Past Workout
                </Button>
              </div>
            </div>

            {/* Enhanced Weekly Progress Circle */}
            <div className="hidden lg:flex items-center gap-6 bg-[#0B0B0F]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div>
                <p className="text-sm text-gray-400 mb-1">Weekly Goal</p>
                <p className="text-4xl mb-1">
                  <span className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">{weeklyGoal.current}</span>
                  <span className="text-gray-600 text-2xl">/{weeklyGoal.target}</span>
                </p>
                <p className="text-sm text-[#22C55E]">workouts</p>
              </div>
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    stroke="url(#gradient)"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray={`${weeklyGoal.percentage * 2.51} 251`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22C55E" />
                      <stop offset="100%" stopColor="#00D1FF" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">{Math.round(weeklyGoal.percentage)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiData.map((kpi, index) => (
            <div
              key={index}
              className="relative group bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#22C55E]/10 overflow-hidden"
            >
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/0 to-[#00D1FF]/0 group-hover:from-[#22C55E]/5 group-hover:to-[#00D1FF]/5 transition-all duration-300"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <kpi.icon className="w-7 h-7 text-[#22C55E]" />
                  </div>
                  {kpi.trend === 'up' && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#22C55E]/10">
                      <TrendingUp className="w-3 h-3 text-[#22C55E]" />
                    </div>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-2">{kpi.label}</p>
                <div className="flex items-baseline gap-2 mb-2">
                  <p className="text-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{kpi.value}</p>
                  {kpi.label === 'Current Streak' && (
                    <span className="text-sm text-gray-400">days</span>
                  )}
                </div>
                <p className="text-sm text-[#22C55E]">{kpi.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Stats & PRs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Top PR Card */}
            {topPR && (
              <div className="relative overflow-hidden bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#00D1FF] flex items-center justify-center">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <span className="text-sm text-gray-400">Top Personal Record</span>
                  </div>
                  <h3 className="text-2xl mb-2">{topPR.exerciseName}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">{topPR.weight}</span>
                    <span className="text-2xl text-gray-400">kg</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{formatRelativeDate(toDate(topPR.date))}</p>
                </div>
              </div>
            )}

            {/* Weekly Activity Chart - Enhanced */}
            <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white mb-1">Weekly Activity</h3>
                  <p className="text-sm text-gray-400">{weeklyGoal.current}/{weeklyGoal.target} workouts completed</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#00D1FF]" />
                </div>
              </div>
              <div className="flex items-end justify-between h-40 gap-2 mb-4">
                {weeklyActivity.map((day, index) => {
                  const height = day.workouts > 0 ? Math.max((day.workouts / Math.max(...weeklyActivity.map(d => d.workouts))) * 100, 30) : 20;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-3">
                      <div className="flex-1 w-full flex items-end">
                        <div
                          className={`w-full rounded-lg transition-all duration-500 hover:scale-105 ${
                            day.workouts > 0
                              ? 'bg-gradient-to-t from-[#22C55E] to-[#00D1FF] shadow-lg shadow-[#22C55E]/20'
                              : 'bg-[#0B0B0F] border border-white/5'
                          }`}
                          style={{ height: `${height}%` }}
                        >
                          {day.workouts > 0 && (
                            <div className="flex items-center justify-center h-full text-white text-xs">
                              {day.workouts}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{day.day}</span>
                    </div>
                  );
                })}
              </div>
              <Progress value={weeklyGoal.percentage} className="h-2 bg-[#0B0B0F]" />
            </div>

            {/* Recent PRs Mini List - Enhanced */}
            <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                  </div>
                  <h3 className="text-white">Recent PRs</h3>
                </div>
                <Button
                  onClick={() => onNavigate('pr')}
                  variant="ghost"
                  size="sm"
                  className="text-[#00D1FF] hover:text-[#00D1FF]/80 h-auto p-0"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {recentPRs.length > 0 ? (
                  recentPRs.map((pr, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#0B0B0F] rounded-xl hover:bg-[#0B0B0F]/80 transition-all cursor-pointer group border border-white/5 hover:border-[#22C55E]/30">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Award className="w-5 h-5 text-[#22C55E]" />
                        </div>
                        <div>
                          <p className="text-sm text-white mb-1">{pr.exercise}</p>
                          <p className="text-xs text-gray-400">{pr.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-base text-[#22C55E] mb-1">{pr.weight}</p>
                        <p className="text-xs text-[#22C55E]/70">{pr.improvement}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No PRs yet. Start tracking!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Sessions Enhanced */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white mb-1 text-2xl">Recent Sessions</h3>
                  <p className="text-sm text-gray-400">Your latest workout activity</p>
                </div>
                <Button
                  onClick={() => onNavigate('history')}
                  variant="ghost"
                  className="text-[#00D1FF] hover:text-[#00D1FF]/80 hover:bg-[#00D1FF]/10"
                >
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-4">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session, index) => (
                    <div
                      key={index}
                      className="relative group bg-[#0B0B0F] rounded-xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 cursor-pointer hover:scale-[1.02] overflow-hidden"
                    >
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/0 to-[#00D1FF]/0 group-hover:from-[#22C55E]/5 group-hover:to-[#00D1FF]/5 transition-all duration-300"></div>
                      
                      <div className="relative flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 ${
                          session.type === 'strength' 
                            ? 'bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/10 group-hover:from-[#22C55E]/30 group-hover:to-[#22C55E]/20' 
                            : 'bg-gradient-to-br from-[#00D1FF]/20 to-[#00D1FF]/10 group-hover:from-[#00D1FF]/30 group-hover:to-[#00D1FF]/20'
                        } group-hover:scale-110`}>
                          {session.type === 'strength' ? (
                            <Dumbbell className="w-7 h-7 text-[#22C55E]" />
                          ) : (
                            <Activity className="w-7 h-7 text-[#00D1FF]" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-white text-lg mb-2">{session.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span className="flex items-center gap-1.5">
                                  <Calendar className="w-4 h-4" />
                                  {session.date}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  {session.duration}
                                </span>
                              </div>
                            </div>
                            <Badge className={`${
                              session.type === 'strength'
                                ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                                : 'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30'
                            }`}>
                              {session.type === 'strength' ? 'Strength' : 'Cardio'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-6 pt-3 border-t border-white/5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-[#151923] flex items-center justify-center">
                                <Dumbbell className="w-4 h-4 text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-300">{session.exercises} exercises</span>
                            </div>
                            {session.volume && (
                              <>
                                <span className="text-gray-600">•</span>
                                <span className="text-sm text-[#22C55E]">
                                  {session.volume} volume
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[#22C55E] group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16">
                    <Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg mb-2">No workouts yet</p>
                    <p className="text-gray-500 text-sm mb-6">Start your first session to see it here</p>
                    <Button
                      onClick={() => onNavigate('start-session')}
                      className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Start Workout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Enhanced */}
        <div className="mb-8">
          <h3 className="text-white mb-6 text-2xl">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {quickGuides.map((guide, index) => (
              <div
                key={index}
                onClick={() => {
                  if (index === 0) onNavigate('start-session');
                  if (index === 1) onNavigate('history');
                  if (index === 2) onNavigate('pr');
                }}
                className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-[#151923] to-[#0B0B0F] p-8 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#22C55E]/10"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${guide.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${guide.color} flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-2xl`}>
                    <guide.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h4 className="text-white mb-2 text-xl">{guide.title}</h4>
                  <p className="text-gray-400 text-sm mb-5">{guide.description}</p>
                  
                  <div className="flex items-center text-[#22C55E] text-sm group-hover:gap-2 gap-1 transition-all">
                    <span>Get started</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Motivational Quote - Enhanced */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#22C55E]/10 via-[#151923] to-[#00D1FF]/10 p-10 border border-white/10 shadow-xl">
          <div className="absolute top-0 left-0 w-40 h-40 bg-[#22C55E]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#00D1FF]/10 rounded-full blur-3xl"></div>
          
          <div className="relative text-center max-w-3xl mx-auto">
            <p className="text-2xl text-gray-200 italic mb-4 leading-relaxed">
              "The only bad workout is the one that didn't happen."
            </p>
            <p className="text-sm text-gray-500">Stay consistent, stay strong 💪</p>
          </div>
        </div>
      </main>

      <Footer />
      
      <AddWorkoutDialog
        open={addWorkoutOpen}
        onOpenChange={setAddWorkoutOpen}
        onAdd={addWorkout}
      />
    </div>
  );
}
