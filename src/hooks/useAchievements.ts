import { useMemo } from 'react';
import { useWorkouts } from './useWorkouts';
import { usePersonalRecords } from './usePersonalRecords';
import { useAuth } from '../contexts/AuthContext';
import { Flame, Target, Trophy, Weight, Calendar } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  earned: boolean;
  progress: number;
  date?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export function useAchievements() {
  const { currentUser } = useAuth();
  const { workouts } = useWorkouts(1000);
  const { records } = usePersonalRecords();

  const achievements = useMemo(() => {
    // Calculate current streak
    let currentStreak = 0;
    if (workouts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < workouts.length; i++) {
        const workoutDate = workouts[i].date.toDate();
        workoutDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === currentStreak) {
          currentStreak++;
        } else if (daysDiff > currentStreak) {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    const sortedWorkouts = [...workouts].sort((a, b) => 
      b.date.toDate().getTime() - a.date.toDate().getTime()
    );

    for (const workout of sortedWorkouts) {
      const workoutDate = workout.date.toDate();
      workoutDate.setHours(0, 0, 0, 0);

      if (!lastDate) {
        tempStreak = 1;
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }

      lastDate = workoutDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate total weight for compound lifts (Squat, Bench Press, Deadlift)
    const compoundLifts = ['squat', 'bench press', 'deadlift', 'overhead press'];
    let totalCompoundWeight = 0;

    records.forEach(record => {
      if (record.exerciseName && compoundLifts.some(lift => record.exerciseName.toLowerCase().includes(lift))) {
        totalCompoundWeight += record.weight;
      }
    });

    // Calculate account age in months
    const accountCreatedAt = currentUser?.metadata?.creationTime 
      ? new Date(currentUser.metadata.creationTime) 
      : new Date();
    const monthsActive = Math.floor(
      (new Date().getTime() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    // Find achievement dates from actual data
    const get30DayStreakDate = () => {
      if (longestStreak >= 30) {
        // Find when the user hit 30 days
        const thirtyWorkoutsAgo = workouts[Math.min(29, workouts.length - 1)];
        return thirtyWorkoutsAgo ? thirtyWorkoutsAgo.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined;
      }
      return undefined;
    };

    const get100WorkoutsDate = () => {
      if (workouts.length >= 100) {
        const workout100 = workouts[Math.min(99, workouts.length - 1)];
        return workout100 ? workout100.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined;
      }
      return undefined;
    };

    const get10PRsDate = () => {
      if (records.length >= 10) {
        const sortedRecords = [...records].sort((a, b) => 
          b.date.toDate().getTime() - a.date.toDate().getTime()
        );
        const pr10 = sortedRecords[Math.min(9, sortedRecords.length - 1)];
        return pr10 ? pr10.date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined;
      }
      return undefined;
    };

    const achievementsList: Achievement[] = [
      {
        id: '30-day-streak',
        title: '30 Day Streak',
        description: 'Completed 30 consecutive days',
        icon: Flame,
        earned: longestStreak >= 30,
        progress: Math.min(Math.round((longestStreak / 30) * 100), 100),
        date: get30DayStreakDate(),
        rarity: 'rare'
      },
      {
        id: '100-workouts',
        title: '100 Workouts',
        description: 'Completed 100 total workouts',
        icon: Target,
        earned: workouts.length >= 100,
        progress: Math.min(Math.round((workouts.length / 100) * 100), 100),
        date: get100WorkoutsDate(),
        rarity: 'epic'
      },
      {
        id: 'pr-master',
        title: 'PR Master',
        description: 'Set 10 personal records',
        icon: Trophy,
        earned: records.length >= 10,
        progress: Math.min(Math.round((records.length / 10) * 100), 100),
        date: get10PRsDate(),
        rarity: 'legendary'
      },
      {
        id: '500kg-club',
        title: '500kg Club',
        description: 'Total 500kg in compound lifts',
        icon: Weight,
        earned: totalCompoundWeight >= 500,
        progress: Math.min(Math.round((totalCompoundWeight / 500) * 100), 100),
        rarity: 'legendary'
      },
      {
        id: '6-month-warrior',
        title: '6 Month Warrior',
        description: 'Active for 6 months',
        icon: Calendar,
        earned: monthsActive >= 6,
        progress: Math.min(Math.round((monthsActive / 6) * 100), 100),
        rarity: 'epic'
      },
      {
        id: 'consistency-king',
        title: 'Consistency King',
        description: '90 day streak',
        icon: Trophy,
        earned: longestStreak >= 90,
        progress: Math.min(Math.round((longestStreak / 90) * 100), 100),
        rarity: 'legendary'
      },
      {
        id: 'first-workout',
        title: 'First Workout',
        description: 'Completed your first workout',
        icon: Target,
        earned: workouts.length >= 1,
        progress: workouts.length >= 1 ? 100 : 0,
        date: workouts.length >= 1 ? workouts[workouts.length - 1].date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
        rarity: 'common'
      },
      {
        id: 'first-pr',
        title: 'First PR',
        description: 'Set your first personal record',
        icon: Trophy,
        earned: records.length >= 1,
        progress: records.length >= 1 ? 100 : 0,
        date: records.length >= 1 ? records[records.length - 1].date.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : undefined,
        rarity: 'common'
      },
      {
        id: '7-day-streak',
        title: '7 Day Streak',
        description: 'Completed 7 consecutive days',
        icon: Flame,
        earned: longestStreak >= 7,
        progress: Math.min(Math.round((longestStreak / 7) * 100), 100),
        rarity: 'common'
      },
      {
        id: '50-workouts',
        title: '50 Workouts',
        description: 'Completed 50 total workouts',
        icon: Target,
        earned: workouts.length >= 50,
        progress: Math.min(Math.round((workouts.length / 50) * 100), 100),
        rarity: 'rare'
      }
    ];

    return achievementsList.sort((a, b) => {
      // Sort by earned first, then by progress
      if (a.earned && !b.earned) return -1;
      if (!a.earned && b.earned) return 1;
      if (a.earned && b.earned) {
        // Both earned, sort by date
        if (a.date && b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
      }
      return b.progress - a.progress;
    });
  }, [workouts, records, currentUser]);

  const earnedCount = achievements.filter(a => a.earned).length;

  return {
    achievements,
    earnedCount,
    totalCount: achievements.length
  };
}