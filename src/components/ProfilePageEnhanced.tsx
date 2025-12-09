import { User, Mail, Calendar, Ruler, Weight, Target, Trophy, Settings, Bell, Lock, LogOut, Edit2, Camera, Share2, Download, TrendingUp, Award, Flame, Scale, Plus, Smartphone, Zap, Star, Crown, Shield } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { Progress } from './ui/progress';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useUserProfile } from '../hooks/useUserProfile';
import { useWorkouts } from '../hooks/useWorkouts';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { useWeightTracking } from '../hooks/useWeightTracking';
import { useGoals } from '../hooks/useGoals';
import { useAchievements } from '../hooks/useAchievements';
import { EditProfileDialog } from './EditProfileDialog';
import { AddWeightDialog } from './AddWeightDialog';
import { AddGoalDialog } from './AddGoalDialog';
import { ChangeCoverDialog } from './ChangeCoverDialog';
import { ChangeAvatarDialog } from './ChangeAvatarDialog';
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { ConnectedDevicesDialog } from './ConnectedDevicesDialog';
import { ActivityHeatmap } from './ActivityHeatmap';
import { QuickActions } from './QuickActions';
import { ActivityTimeline } from './ActivityTimeline';
import { useState, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ProfilePageEnhanced({ onNavigate, onLogout }: ProfilePageProps) {
  const { currentUser } = useAuth();
  const { profile, updateProfile, refresh: refreshProfile } = useUserProfile();
  const { workouts, stats } = useWorkouts(100);
  const { records } = usePersonalRecords();
  const { preferences, updatePreferences } = useUserPreferences();
  const { entries: weightEntries, addEntry: addWeightEntry } = useWeightTracking();
  const { goals: userGoals, addGoal: addUserGoal } = useGoals();
  const { achievements, earnedCount, totalCount } = useAchievements();
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [coverDialogOpen, setCoverDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [devicesDialogOpen, setDevicesDialogOpen] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    height: '',
    weight: '',
    fitnessGoal: ''
  });

  const userName = profile?.displayName || currentUser?.displayName || 'Athlete';
  const userEmail = currentUser?.email || 'user@example.com';
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Calculate level based on total workouts
  const userLevel = useMemo(() => {
    const totalWorkouts = stats.totalWorkouts;
    return Math.floor(totalWorkouts / 10) + 1;
  }, [stats.totalWorkouts]);

  const xpProgress = useMemo(() => {
    const totalWorkouts = stats.totalWorkouts;
    const currentLevelWorkouts = totalWorkouts % 10;
    return (currentLevelWorkouts / 10) * 100;
  }, [stats.totalWorkouts]);

  // Calculate current streak
  const currentStreak = useMemo(() => {
    if (workouts.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < workouts.length; i++) {
      const workoutDate = workouts[i].date.toDate();
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

  // PRs this month
  const prsThisMonth = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return records.filter(r => r.date.toDate() > thirtyDaysAgo).length;
  }, [records]);

  // Calculate monthly activity data
  const activityData = useMemo(() => {
    const now = new Date();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const workoutsInMonth = workouts.filter(w => {
        const wDate = w.date.toDate();
        return wDate >= monthDate && wDate < nextMonth;
      });

      const totalDuration = workoutsInMonth.reduce((sum, w) => sum + w.duration, 0);
      
      data.push({
        month: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        workouts: workoutsInMonth.length,
        duration: totalDuration,
        avgDuration: workoutsInMonth.length > 0 ? Math.round(totalDuration / workoutsInMonth.length) : 0,
      });
    }
    
    return data;
  }, [workouts]);

  // Weekly goal progress
  const weeklyProgress = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const workoutsThisWeek = workouts.filter(w => {
      const wDate = w.date.toDate();
      return wDate >= startOfWeek;
    }).length;

    const weeklyGoal = 5; // Default goal
    return Math.min((workoutsThisWeek / weeklyGoal) * 100, 100);
  }, [workouts]);

  const handleSavePersonalInfo = async () => {
    if (!currentUser) return;

    try {
      await updateProfile({
        displayName: formData.displayName || userName,
        age: formData.age ? parseInt(formData.age) : profile?.age,
        height: formData.height ? parseInt(formData.height) : profile?.height,
        weight: formData.weight ? parseInt(formData.weight) : profile?.weight,
        fitnessGoal: formData.fitnessGoal || profile?.fitnessGoal,
      });

      setEditingInfo(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleStartEdit = () => {
    setFormData({
      displayName: profile?.displayName || userName,
      age: profile?.age?.toString() || '',
      height: profile?.height?.toString() || '',
      weight: profile?.weight?.toString() || '',
      fitnessGoal: profile?.fitnessGoal || '',
    });
    setEditingInfo(true);
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!preferences) return;

    try {
      await updatePreferences({
        notifications: {
          ...preferences.notifications,
          [key]: value,
        },
      });
      toast.success('Notification settings updated');
    } catch (error) {
      console.error('Error updating notifications:', error);
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white flex flex-col">
      <Header onNavigate={onNavigate} currentPage="profile" />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        {/* Hero Header with Cover Photo */}
        <div className="relative mb-8">
          {/* Cover Photo */}
          <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-br from-[#22C55E]/20 via-[#151923] to-[#00D1FF]/20">
            {profile?.coverPhoto && (
              <img 
                src={profile.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/50 to-transparent" />
            
            {/* Edit Cover Button */}
            <button
              onClick={() => setCoverDialogOpen(true)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-[#0B0B0F]/80 backdrop-blur-sm hover:bg-[#0B0B0F] transition-all border border-[#151923] hover:border-[#22C55E]/30"
            >
              <Camera className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="relative px-6 -mt-20">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-[#0B0B0F] bg-[#151923] shadow-2xl">
                  <Avatar className="w-full h-full">
                    <AvatarImage src={profile?.photoURL || currentUser?.photoURL || undefined} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Edit Avatar Button */}
                <button
                  onClick={() => setAvatarDialogOpen(true)}
                  className="absolute bottom-2 right-2 p-2 rounded-lg bg-[#22C55E] hover:bg-[#22C55E]/90 transition-all shadow-lg opacity-0 group-hover:opacity-100"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>

                {/* Level Badge */}
                <div className="absolute -top-2 -right-2 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl px-3 py-1 shadow-lg border-2 border-[#0B0B0F]">
                  <div className="flex items-center gap-1">
                    <Crown className="w-3 h-3 text-white" />
                    <span className="text-xs text-white">Lvl {userLevel}</span>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl">{userName}</h1>
                  <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30">
                    <Zap className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
                
                <p className="text-gray-400 mb-3">{userEmail}</p>

                {/* Level Progress */}
                <div className="max-w-md">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Level {userLevel}</span>
                    <span>{stats.totalWorkouts % 10}/10 workouts</span>
                  </div>
                  <div className="h-2 bg-[#151923] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#22C55E] to-[#00D1FF] transition-all duration-500 rounded-full"
                      style={{ width: `${xpProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pb-4">
                <Button
                  onClick={() => setEditDialogOpen(true)}
                  className="bg-[#22C55E] hover:bg-[#22C55E]/90"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent border-gray-700 hover:bg-[#151923]"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Total Workouts */}
          <div className="group relative overflow-hidden rounded-xl bg-[#151923] border border-[#151923] p-6 hover:border-[#22C55E]/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#22C55E]/10 rounded-full blur-3xl group-hover:bg-[#22C55E]/20 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#22C55E]/10">
                  <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                </div>
                <span className="text-xs text-gray-500">All Time</span>
              </div>
              <div className="text-3xl mb-1">{stats.totalWorkouts}</div>
              <div className="text-sm text-gray-400">Total Workouts</div>
            </div>
          </div>

          {/* Current Streak */}
          <div className="group relative overflow-hidden rounded-xl bg-[#151923] border border-[#151923] p-6 hover:border-[#F59E0B]/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B]/10 rounded-full blur-3xl group-hover:bg-[#F59E0B]/20 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#F59E0B]/10">
                  <Flame className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <span className="text-xs text-gray-500">Days</span>
              </div>
              <div className="text-3xl mb-1">{currentStreak}</div>
              <div className="text-sm text-gray-400">Current Streak</div>
            </div>
          </div>

          {/* PRs This Month */}
          <div className="group relative overflow-hidden rounded-xl bg-[#151923] border border-[#151923] p-6 hover:border-[#00D1FF]/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00D1FF]/10 rounded-full blur-3xl group-hover:bg-[#00D1FF]/20 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#00D1FF]/10">
                  <Trophy className="w-5 h-5 text-[#00D1FF]" />
                </div>
                <span className="text-xs text-gray-500">30 Days</span>
              </div>
              <div className="text-3xl mb-1">{prsThisMonth}</div>
              <div className="text-sm text-gray-400">New Records</div>
            </div>
          </div>

          {/* Avg Duration */}
          <div className="group relative overflow-hidden rounded-xl bg-[#151923] border border-[#151923] p-6 hover:border-[#8B5CF6]/30 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/10 rounded-full blur-3xl group-hover:bg-[#8B5CF6]/20 transition-all" />
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-[#8B5CF6]/10">
                  <Target className="w-5 h-5 text-[#8B5CF6]" />
                </div>
                <span className="text-xs text-gray-500">Minutes</span>
              </div>
              <div className="text-3xl mb-1">{stats.avgDuration}</div>
              <div className="text-sm text-gray-400">Avg Duration</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
              <h2 className="text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#22C55E]" />
                Quick Actions
              </h2>
              <QuickActions
                onStartWorkout={() => onNavigate('home')}
                onAddPR={() => onNavigate('pr')}
                onAddWeight={() => setWeightDialogOpen(true)}
                onAddGoal={() => setGoalDialogOpen(true)}
              />
            </div>

            {/* Activity Chart */}
            <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                  Monthly Activity
                </h2>
                <div className="flex gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#22C55E]" />
                    <span className="text-gray-400">Workouts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#00D1FF]" />
                    <span className="text-gray-400">Duration</span>
                  </div>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D1FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00D1FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#151923" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#151923', 
                      border: '1px solid #22C55E20',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="workouts" 
                    stroke="#22C55E" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorWorkouts)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avgDuration" 
                    stroke="#00D1FF" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorDuration)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Activity Heatmap */}
            <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
              <ActivityHeatmap workouts={workouts} />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full bg-[#151923] border border-[#151923] p-1 rounded-lg">
                <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-[#22C55E] data-[state=active]:text-white">
                  <User className="w-4 h-4 mr-2" />
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="goals" className="flex-1 data-[state=active]:bg-[#22C55E] data-[state=active]:text-white">
                  <Target className="w-4 h-4 mr-2" />
                  Goals
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex-1 data-[state=active]:bg-[#22C55E] data-[state=active]:text-white">
                  <Trophy className="w-4 h-4 mr-2" />
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-[#22C55E] data-[state=active]:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="info" className="mt-6">
                <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg">Personal Information</h3>
                    {!editingInfo ? (
                      <Button
                        onClick={handleStartEdit}
                        variant="outline"
                        className="bg-transparent border-gray-700"
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingInfo(false)}
                          variant="outline"
                          className="bg-transparent border-gray-700"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSavePersonalInfo}
                          className="bg-[#22C55E] hover:bg-[#22C55E]/90"
                        >
                          Save
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 mb-2 block">Full Name</Label>
                      {editingInfo ? (
                        <Input
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="bg-[#0B0B0F] border-[#151923]"
                        />
                      ) : (
                        <div className="p-3 bg-[#0B0B0F] rounded-lg">{profile?.displayName || userName}</div>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-400 mb-2 block">Age</Label>
                      {editingInfo ? (
                        <Input
                          type="number"
                          value={formData.age}
                          onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                          className="bg-[#0B0B0F] border-[#151923]"
                        />
                      ) : (
                        <div className="p-3 bg-[#0B0B0F] rounded-lg">{profile?.age || '—'} years</div>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-400 mb-2 block">Height</Label>
                      {editingInfo ? (
                        <Input
                          type="number"
                          value={formData.height}
                          onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                          className="bg-[#0B0B0F] border-[#151923]"
                        />
                      ) : (
                        <div className="p-3 bg-[#0B0B0F] rounded-lg">{profile?.height || '—'} cm</div>
                      )}
                    </div>

                    <div>
                      <Label className="text-gray-400 mb-2 block">Weight</Label>
                      {editingInfo ? (
                        <Input
                          type="number"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          className="bg-[#0B0B0F] border-[#151923]"
                        />
                      ) : (
                        <div className="p-3 bg-[#0B0B0F] rounded-lg">{profile?.weight || '—'} kg</div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <Label className="text-gray-400 mb-2 block">Fitness Goal</Label>
                      {editingInfo ? (
                        <Input
                          value={formData.fitnessGoal}
                          onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                          className="bg-[#0B0B0F] border-[#151923]"
                          placeholder="e.g., Build muscle, Lose weight, Improve endurance..."
                        />
                      ) : (
                        <div className="p-3 bg-[#0B0B0F] rounded-lg">{profile?.fitnessGoal || '—'}</div>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Goals Tab */}
              <TabsContent value="goals" className="mt-6">
                <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg">My Goals</h3>
                    <Button
                      onClick={() => setGoalDialogOpen(true)}
                      className="bg-[#22C55E] hover:bg-[#22C55E]/90"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>

                  {/* Weekly Goal */}
                  <div className="p-4 rounded-lg bg-[#0B0B0F] mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#22C55E]" />
                        <span className="text-sm">Weekly Workout Goal</span>
                      </div>
                      <span className="text-sm text-gray-400">{Math.round(weeklyProgress)}%</span>
                    </div>
                    <Progress value={weeklyProgress} className="h-2" />
                  </div>

                  {/* Goals List */}
                  <div className="space-y-3">
                    {userGoals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-sm">No goals set yet</p>
                        <p className="text-xs mt-1">Create your first goal to start tracking progress</p>
                      </div>
                    ) : (
                      userGoals.map(goal => (
                        <div key={goal.id} className="p-4 rounded-lg bg-[#0B0B0F] hover:bg-[#0B0B0F]/80 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm">{goal.title}</span>
                            {goal.completed && (
                              <Badge className="bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <Progress 
                            value={(goal.currentValue / goal.targetValue) * 100} 
                            className="h-2 mb-2" 
                          />
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                            {goal.deadline && (
                              <span>Due: {goal.deadline.toDate().toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Current Weight */}
                  {profile?.weight && (
                    <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-[#00D1FF]/10 to-[#0EA5E9]/10 border border-[#00D1FF]/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-[#00D1FF]/20">
                            <Scale className="w-5 h-5 text-[#00D1FF]" />
                          </div>
                          <div>
                            <div className="text-sm text-gray-400">Current Weight</div>
                            <div className="text-2xl">{profile.weight} kg</div>
                          </div>
                        </div>
                        <Button
                          onClick={() => setWeightDialogOpen(true)}
                          size="sm"
                          className="bg-[#00D1FF] hover:bg-[#00D1FF]/90"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="achievements" className="mt-6">
                <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg">Achievements</h3>
                    <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30">
                      {earnedCount} / {totalCount}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((achievement) => {
                      const Icon = achievement.icon;
                      const rarityColors = {
                        common: 'from-gray-500 to-gray-600',
                        rare: 'from-blue-500 to-blue-600',
                        epic: 'from-purple-500 to-purple-600',
                        legendary: 'from-amber-500 to-amber-600',
                      };

                      return (
                        <div
                          key={achievement.id}
                          className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 ${
                            achievement.unlocked
                              ? 'bg-[#0B0B0F] border-[#22C55E]/30 hover:border-[#22C55E]/50'
                              : 'bg-[#0B0B0F]/50 border-[#151923] opacity-60'
                          }`}
                        >
                          {/* Glow effect for unlocked achievements */}
                          {achievement.unlocked && (
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${rarityColors[achievement.rarity]} opacity-10 rounded-full blur-3xl`} />
                          )}

                          <div className="relative flex items-start gap-4">
                            {/* Icon */}
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${rarityColors[achievement.rarity]} ${!achievement.unlocked && 'grayscale'}`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm">{achievement.title}</h4>
                                <Badge 
                                  className={`text-xs ${
                                    achievement.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30' :
                                    achievement.rarity === 'epic' ? 'bg-purple-500/20 text-purple-500 border-purple-500/30' :
                                    achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' :
                                    'bg-gray-500/20 text-gray-500 border-gray-500/30'
                                  }`}
                                >
                                  {achievement.rarity}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>

                              {/* Progress */}
                              {!achievement.unlocked && (
                                <div>
                                  <Progress value={achievement.progress} className="h-1.5 mb-1" />
                                  <p className="text-xs text-gray-500">{Math.round(achievement.progress)}% complete</p>
                                </div>
                              )}

                              {/* Unlocked date */}
                              {achievement.unlocked && achievement.unlockedDate && (
                                <p className="text-xs text-[#22C55E]">
                                  Unlocked {achievement.unlockedDate.toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-6 space-y-4">
                {/* Notifications */}
                <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
                  <h3 className="text-lg mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#22C55E]" />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Workout Reminders</div>
                        <div className="text-xs text-gray-500">Get notified about your workout schedule</div>
                      </div>
                      <Switch
                        checked={preferences?.notifications.workoutReminders ?? true}
                        onCheckedChange={(checked) => handleNotificationChange('workoutReminders', checked)}
                      />
                    </div>

                    <Separator className="bg-[#0B0B0F]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Achievement Alerts</div>
                        <div className="text-xs text-gray-500">Celebrate your milestones</div>
                      </div>
                      <Switch
                        checked={preferences?.notifications.achievementAlerts ?? true}
                        onCheckedChange={(checked) => handleNotificationChange('achievementAlerts', checked)}
                      />
                    </div>

                    <Separator className="bg-[#0B0B0F]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">Weekly Reports</div>
                        <div className="text-xs text-gray-500">Receive weekly progress summaries</div>
                      </div>
                      <Switch
                        checked={preferences?.notifications.weeklyReports ?? false}
                        onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                      />
                    </div>

                    <Separator className="bg-[#0B0B0F]" />

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm">PR Alerts</div>
                        <div className="text-xs text-gray-500">Get notified when you break records</div>
                      </div>
                      <Switch
                        checked={preferences?.notifications.prAlerts ?? true}
                        onCheckedChange={(checked) => handleNotificationChange('prAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
                  <h3 className="text-lg mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#22C55E]" />
                    Security
                  </h3>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setPasswordDialogOpen(true)}
                      variant="outline"
                      className="w-full justify-start bg-[#0B0B0F] border-[#151923] hover:bg-[#0B0B0F]/80 hover:border-[#22C55E]/30"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>

                    <Button
                      onClick={() => setDevicesDialogOpen(true)}
                      variant="outline"
                      className="w-full justify-start bg-[#0B0B0F] border-[#151923] hover:bg-[#0B0B0F]/80 hover:border-[#22C55E]/30"
                    >
                      <Smartphone className="w-4 h-4 mr-2" />
                      Connected Devices
                    </Button>
                  </div>
                </div>

                {/* Data & Privacy */}
                <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
                  <h3 className="text-lg mb-4 flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#22C55E]" />
                    Data & Privacy
                  </h3>
                  <Button
                    variant="outline"
                    className="w-full justify-start bg-[#0B0B0F] border-[#151923] hover:bg-[#0B0B0F]/80"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                </div>

                {/* Danger Zone */}
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6">
                  <h3 className="text-lg mb-4 text-red-400">Danger Zone</h3>
                  <div className="space-y-3">
                    <Button
                      onClick={onLogout}
                      variant="outline"
                      className="w-full justify-start bg-[#0B0B0F] border-red-500/30 hover:bg-red-500/10 text-red-400"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Activity Timeline */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="rounded-xl bg-[#151923] border border-[#151923] p-6">
              <h2 className="text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#22C55E]" />
                Recent Activity
              </h2>
              <ActivityTimeline
                workouts={workouts}
                records={records}
                weightEntries={weightEntries}
                goals={userGoals}
              />
            </div>

            {/* Achievement Progress */}
            <div className="rounded-xl bg-gradient-to-br from-[#F59E0B]/10 to-[#D97706]/10 border border-[#F59E0B]/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-[#F59E0B]/20">
                  <Award className="w-5 h-5 text-[#F59E0B]" />
                </div>
                <div>
                  <h3 className="text-sm text-gray-400">Achievement Progress</h3>
                  <div className="text-2xl">{earnedCount}/{totalCount}</div>
                </div>
              </div>
              <Progress value={(earnedCount / totalCount) * 100} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {totalCount - earnedCount} more to unlock
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Dialogs */}
      <EditProfileDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        profile={profile}
        onUpdate={updateProfile}
      />

      <AddWeightDialog
        open={weightDialogOpen}
        onOpenChange={setWeightDialogOpen}
        onAdd={async (weight, date, notes) => {
          await addWeightEntry(weight, date, notes);
          setWeightDialogOpen(false);
        }}
      />

      <AddGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        onAdd={async (goalData) => {
          await addUserGoal(goalData);
          setGoalDialogOpen(false);
        }}
      />

      <ChangeCoverDialog
        open={coverDialogOpen}
        onOpenChange={setCoverDialogOpen}
        currentCover={profile?.coverPhoto}
        onUpdate={(coverUrl) => {
          refreshProfile();
          toast.success('Cover photo updated!');
        }}
      />

      <ChangeAvatarDialog
        open={avatarDialogOpen}
        onOpenChange={setAvatarDialogOpen}
        currentPhotoURL={profile?.photoURL || currentUser?.photoURL || undefined}
        onSuccess={refreshProfile}
      />

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
      />

      <ConnectedDevicesDialog
        open={devicesDialogOpen}
        onOpenChange={setDevicesDialogOpen}
      />
    </div>
  );
}