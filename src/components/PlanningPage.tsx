import { useState, useMemo } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ChevronLeft, ChevronRight, Dumbbell, Heart, Flame, Moon, Calendar as CalendarIcon, TrendingUp, Filter, Check, X, Trash2, Play } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import { useScheduledWorkouts } from '../hooks/useScheduledWorkouts';
import { useAuth } from '../contexts/AuthContext';
import { PlanWorkoutDialog } from './PlanWorkoutDialog';
import { FirebasePermissionsAlert } from './FirebasePermissionsAlert';
import { ScheduledWorkoutsDebug } from './ScheduledWorkoutsDebug';

interface PlanningPageProps {
  onNavigate: (page: string, data?: any) => void;
  onLogout: () => void;
}

type DayStatus = 'completed' | 'planned' | 'rest' | 'empty';
type WorkoutType = 'strength' | 'cardio' | 'rest' | null;

interface DayData {
  date: Date;
  workouts: any[]; // Completed workouts
  scheduledWorkouts: any[]; // Planned workouts
  prs: any[];
  status: DayStatus;
  isRecommended?: boolean;
  isRestDay?: boolean;
}

export default function PlanningPage({ onNavigate, onLogout }: PlanningPageProps) {
  const { currentUser } = useAuth();
  const { workouts } = useWorkouts(100);
  const { records } = usePersonalRecords();
  const { scheduledWorkouts, scheduleWorkout, removeScheduledWorkout, permissionError } = useScheduledWorkouts();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'strength' | 'cardio'>('all');
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  // Generate dynamic weekly plan based on scheduled and completed workouts
  const weeklyPlan = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday start
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const days = [];
    const weekDayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toDateString();

      // Find completed workouts for this day
      const completedWorkouts = workouts.filter(w => 
        w.date.toDate().toDateString() === dateStr
      );

      // Find scheduled workouts for this day
      const scheduledForDay = scheduledWorkouts.filter(sw => 
        sw.date.toDate().toDateString() === dateStr
      );

      let status: DayStatus = 'empty';
      let name = 'Free';
      let type: WorkoutType = null;

      if (completedWorkouts.length > 0) {
        status = 'completed';
        const workout = completedWorkouts[0];
        name = workout.name;
        type = workout.type;
      } else if (scheduledForDay.length > 0) {
        status = 'planned';
        const scheduled = scheduledForDay[0];
        name = scheduled.templateName;
        type = scheduled.type;
      } else {
        // Check if it's a rest day (e.g., Thursday and Sunday)
        if (i === 3 || i === 6) {
          status = 'rest';
          name = 'Rest';
          type = 'rest';
        }
      }

      days.push({
        day: weekDayNames[i],
        date,
        name,
        type,
        status,
        completedWorkouts,
        scheduledWorkouts: scheduledForDay,
      });
    }

    return days;
  }, [workouts, scheduledWorkouts]);

  // Find next scheduled workout
  const nextScheduledWorkout = useMemo(() => {
    const now = new Date();
    const upcoming = scheduledWorkouts
      .filter(sw => sw.date.toDate() > now)
      .sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
    
    return upcoming.length > 0 ? upcoming[0] : null;
  }, [scheduledWorkouts]);

  // Calculate days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startDayOfWeek, year, month };
  };

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentDate);

  // Get workouts and PRs for a specific day
  const getDayData = (date: Date): DayData => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const dayWorkouts = workouts.filter(w => {
      const wDate = w.date.toDate();
      return wDate >= dayStart && wDate <= dayEnd;
    });

    const dayPRs = records.filter(r => {
      const rDate = r.date.toDate();
      return rDate >= dayStart && rDate <= dayEnd;
    });

    // Filter by type
    const filteredWorkouts = filterType === 'all' 
      ? dayWorkouts 
      : dayWorkouts.filter(w => w.type === filterType);

    let status: DayStatus = 'empty';
    if (filteredWorkouts.length > 0) {
      status = 'completed';
    }

    // Determine if it's a recommended workout day (Mon, Wed, Fri)
    const dayOfWeek = date.getDay();
    const isRecommended = [1, 3, 5].includes(dayOfWeek);
    const isRestDay = [0, 4].includes(dayOfWeek); // Sun, Thu

    return {
      date,
      workouts: filteredWorkouts,
      scheduledWorkouts: scheduledWorkouts.filter(sw => sw.date.toDate().toDateString() === date.toDateString()),
      prs: dayPRs,
      status,
      isRecommended,
      isRestDay
    };
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: (DayData | null)[] = [];
    
    // Add empty cells for days before the first day of month
    const startDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1; // Adjust for Monday start
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(getDayData(date));
    }
    
    return days;
  }, [currentDate, workouts, records, scheduledWorkouts, filterType]);

  // Calculate weekly progress
  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weekWorkouts = workouts.filter(w => {
      const wDate = w.date.toDate();
      return wDate >= startOfWeek && wDate < endOfWeek;
    });

    const completed = weekWorkouts.length;
    const target = 5;
    const percentage = Math.min((completed / target) * 100, 100);

    return { completed, target, percentage };
  }, [workouts]);

  // Navigation functions
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="planning" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-white text-4xl mb-2">Planning & Agenda</h1>
              <p className="text-gray-400 text-lg">Plan your workouts and track your progress</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30 px-4 py-2">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {weeklyProgress.completed}/{weeklyProgress.target} this week
              </Badge>
              <Button
                onClick={() => {
                  // Auto-select today if no day is selected
                  if (!selectedDay) {
                    setSelectedDay(getDayData(new Date()));
                  }
                  setShowPlanDialog(true);
                }}
                className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                Plan Workout
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Main Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousMonth}
                    className="hover:bg-white/5"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-2xl text-white min-w-[200px] text-center">
                    {monthNames[month]} {year}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextMonth}
                    className="hover:bg-white/5"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-[#0B0B0F] text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#22C55E]/30"
                  >
                    <option value="all">All Workouts</option>
                    <option value="strength">Strength Only</option>
                    <option value="cardio">Cardio Only</option>
                  </select>
                </div>
              </div>

              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm text-gray-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((dayData, index) => {
                  if (!dayData) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const isToday = dayData.date.toDateString() === new Date().toDateString();
                  const isSelected = selectedDay?.date.toDateString() === dayData.date.toDateString();
                  const hasWorkouts = dayData.workouts.length > 0;
                  const hasScheduled = dayData.scheduledWorkouts.length > 0;
                  const hasPRs = dayData.prs.length > 0;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDay(dayData)}
                      className={`aspect-square rounded-xl p-2 transition-all duration-300 hover:scale-105 relative ${
                        isSelected
                          ? 'bg-gradient-to-br from-[#22C55E]/30 to-[#00D1FF]/30 border-2 border-[#22C55E]'
                          : isToday
                          ? 'bg-[#0B0B0F] border-2 border-[#00D1FF]'
                          : 'bg-[#0B0B0F] border border-white/5 hover:border-[#22C55E]/30'
                      }`}
                    >
                      {/* Day Number */}
                      <div className={`text-sm mb-1 ${isToday ? 'text-[#00D1FF]' : 'text-white'}`}>
                        {dayData.date.getDate()}
                      </div>

                      {/* Indicators */}
                      <div className="flex flex-col gap-1 items-center">
                        {hasWorkouts && (
                          <div className="w-2 h-2 rounded-full bg-[#22C55E]" title="Completed workout" />
                        )}
                        {hasScheduled && (
                          <div className="w-2 h-2 rounded-full bg-orange-500" title="Planned workout" />
                        )}
                        {hasPRs && (
                          <div className="w-2 h-2 rounded-full bg-[#00D1FF]" title="PR achieved" />
                        )}
                      </div>

                      {/* Badges */}
                      {dayData.isRecommended && !hasWorkouts && !hasScheduled && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#22C55E]/50" />
                      )}
                      {dayData.isRestDay && !hasWorkouts && !hasScheduled && (
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gray-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                  <span>Workout completed</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span>Workout planned</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-[#00D1FF]" />
                  <span>PR achieved</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-[#22C55E]/50" />
                  <span>Recommended day</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-3 h-3 rounded-full bg-gray-500" />
                  <span>Rest day</span>
                </div>
              </div>
            </div>
          </div>

          {/* Day Details Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl sticky top-24">
              {selectedDay ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl text-white">
                      {selectedDay.date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h3>
                    {selectedDay.workouts.length > 0 && (
                      <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30">
                        <Check className="w-3 h-3 mr-1" />
                        Done
                      </Badge>
                    )}
                  </div>

                  {(selectedDay.workouts.length > 0 || selectedDay.scheduledWorkouts.length > 0) ? (
                    <div className="space-y-4">
                      {/* Completed Workouts */}
                      {selectedDay.workouts.map((workout, idx) => (
                        <div key={`completed-${idx}`} className="bg-[#0B0B0F] rounded-xl p-4 border border-[#22C55E]/30">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              workout.type === 'strength'
                                ? 'bg-[#22C55E]/20'
                                : 'bg-[#00D1FF]/20'
                            }`}>
                              {workout.type === 'strength' ? (
                                <Dumbbell className="w-5 h-5 text-[#22C55E]" />
                              ) : (
                                <Heart className="w-5 h-5 text-[#00D1FF]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white">{workout.name}</h4>
                                <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30 text-xs">
                                  ✓ Done
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">
                                {workout.exercises.length} exercises • {formatDuration(workout.duration)}
                              </p>
                            </div>
                          </div>

                          {/* Volume */}
                          <div className="text-sm text-gray-400">
                            <span className="text-[#22C55E]">
                              {workout.exercises.reduce((total: number, ex: any) => 
                                total + ex.sets.reduce((sum: number, set: any) => 
                                  sum + (set.weight * set.reps), 0
                                ), 0
                              ).toLocaleString()} kg
                            </span>
                            {' '}total volume
                          </div>
                        </div>
                      ))}

                      {/* Scheduled Workouts */}
                      {selectedDay.scheduledWorkouts.map((scheduled, idx) => (
                        <div key={`scheduled-${idx}`} className="bg-[#0B0B0F] rounded-xl p-4 border border-orange-500/30">
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              scheduled.type === 'strength'
                                ? 'bg-orange-500/20'
                                : 'bg-orange-500/20'
                            }`}>
                              {scheduled.type === 'strength' ? (
                                <Dumbbell className="w-5 h-5 text-orange-500" />
                              ) : (
                                <Heart className="w-5 h-5 text-orange-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white">{scheduled.templateName}</h4>
                                <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30 text-xs">
                                  Planned
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-400">
                                {scheduled.exercises.length} exercises
                              </p>
                              {scheduled.notes && (
                                <p className="text-xs text-gray-500 mt-1">{scheduled.notes}</p>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => {
                                // Navigate to start session with scheduled workout
                                onNavigate('start-session', { scheduledWorkout: scheduled });
                              }}
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF] text-sm"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              Start
                            </Button>
                            <Button
                              onClick={() => removeScheduledWorkout(scheduled.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* PRs */}
                      {selectedDay.prs.length > 0 && (
                        <div className="bg-gradient-to-br from-[#22C55E]/10 to-[#00D1FF]/10 rounded-xl p-4 border border-[#22C55E]/30">
                          <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-[#22C55E]" />
                            <h4 className="text-white">Personal Records</h4>
                          </div>
                          <div className="space-y-2">
                            {selectedDay.prs.map((pr, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="text-white">{pr.exerciseName}</span>
                                {' '}
                                <span className="text-[#22C55E]">{pr.weight} kg</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CalendarIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 mb-4">No workouts on this day</p>
                      <Button
                        onClick={() => {
                          setShowPlanDialog(true);
                        }}
                        className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Plan Workout
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <CalendarIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Select a day to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Plan Section */}
        <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl text-white mb-2">Weekly Plan</h2>
              <p className="text-gray-400">Your scheduled workouts for this week</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400 mb-1">Weekly Goal Progress</p>
              <p className="text-xl">
                <span className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] bg-clip-text text-transparent">
                  {weeklyProgress.completed}
                </span>
                <span className="text-gray-400">/{weeklyProgress.target}</span>
                {' '}
                <span className="text-sm text-gray-500">workouts</span>
              </p>
            </div>
          </div>

          <Progress value={weeklyProgress.percentage} className="h-3 mb-8 bg-[#0B0B0F]" />

          {/* Weekly Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {weeklyPlan.map((day, index) => {
              const Icon = day.type === 'strength' ? Dumbbell : day.type === 'cardio' ? Heart : Moon;
              
              return (
                <div
                  key={index}
                  className={`relative rounded-2xl p-5 border transition-all duration-300 hover:scale-105 ${
                    day.status === 'rest'
                      ? 'bg-[#0B0B0F] border-gray-700'
                      : day.status === 'completed'
                      ? 'bg-gradient-to-br from-[#22C55E]/10 to-[#00D1FF]/10 border-[#22C55E]/30'
                      : 'bg-[#0B0B0F] border-white/10 hover:border-[#22C55E]/30'
                  }`}
                >
                  {/* Day Label */}
                  <div className="text-center mb-4">
                    <p className="text-xs text-gray-400 mb-1">{day.day}</p>
                    <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center ${
                      day.status === 'rest'
                        ? 'bg-gray-800'
                        : day.type === 'strength'
                        ? 'bg-gradient-to-br from-[#22C55E]/20 to-[#22C55E]/10'
                        : 'bg-gradient-to-br from-[#00D1FF]/20 to-[#00D1FF]/10'
                    }`}>
                      <Icon className={`w-7 h-7 ${
                        day.status === 'rest'
                          ? 'text-gray-500'
                          : day.type === 'strength'
                          ? 'text-[#22C55E]'
                          : 'text-[#00D1FF]'
                      }`} />
                    </div>
                  </div>

                  {/* Workout Name */}
                  <div className="text-center">
                    <p className="text-white text-sm mb-2">{day.name}</p>
                    <Badge className={`text-xs ${
                      day.status === 'completed'
                        ? 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30'
                        : day.status === 'rest'
                        ? 'bg-gray-800 text-gray-400 border-gray-700'
                        : 'bg-[#00D1FF]/20 text-[#00D1FF] border-[#00D1FF]/30'
                    }`}>
                      {day.status === 'completed' ? 'Done' : day.status === 'rest' ? 'Rest' : 'Planned'}
                    </Badge>
                  </div>

                  {/* Checkmark for completed */}
                  {day.status === 'completed' && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#22C55E] flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next Reminder */}
          <div className="mt-8 p-4 bg-[#0B0B0F] rounded-xl border border-white/5 flex items-center justify-between">
            {nextScheduledWorkout ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-white text-sm">Next workout: {nextScheduledWorkout.templateName}</p>
                    <p className="text-gray-400 text-xs">
                      {nextScheduledWorkout.date.toDate().toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate('start-session', { scheduledWorkout: nextScheduledWorkout })}
                  size="sm"
                  className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]">
                  <Play className="w-3 h-3 mr-1" />
                  Start
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <div>
                    <p className="text-white text-sm">No upcoming workouts</p>
                    <p className="text-gray-400 text-xs">Plan your next session</p>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setSelectedDay(getDayData(new Date()));
                    setShowPlanDialog(true);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-[#00D1FF] hover:text-[#00D1FF]/80 hover:bg-[#00D1FF]/10">
                  Plan Now
                </Button>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Plan Workout Dialog */}
      <PlanWorkoutDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        selectedDate={selectedDay?.date || null}
        onSchedule={scheduleWorkout}
      />

      {/* Firebase Permissions Alert */}
      {permissionError && <FirebasePermissionsAlert />}

      {/* Debugging Scheduled Workouts */}
      <ScheduledWorkoutsDebug />

      <Footer />
    </div>
  );
}