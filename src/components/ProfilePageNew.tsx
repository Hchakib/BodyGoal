import { User, Mail, Calendar, Ruler, Weight, Target, Trophy, Settings, Bell, Lock, CreditCard, LogOut, Edit2, Camera, Share2, Download, TrendingUp, Award, Flame, Scale, Plus, Smartphone } from 'lucide-react';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
import { ChangePasswordDialog } from './ChangePasswordDialog';
import { ConnectedDevicesDialog } from './ConnectedDevicesDialog';
import { useState, useMemo } from 'react';
import { toast } from 'sonner@2.0.3';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function ProfilePage({ onNavigate, onLogout }: ProfilePageProps) {
  const { currentUser } = useAuth();
  const { profile, updateProfile } = useUserProfile();
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

  // Calculate monthly activity data
  const activityData = useMemo(() => {
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const now = new Date();
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const workoutsInMonth = workouts.filter(w => {
        const wDate = w.date.toDate();
        return wDate >= monthDate && wDate < nextMonth;
      }).length;
      
      data.push({
        month: months[5 - i],
        workouts: workoutsInMonth
      });
    }
    
    return data;
  }, [workouts]);

  // Calculate weekly goals
  const weeklyGoals = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const weekWorkouts = workouts.filter(w => w.date.toDate() >= monday);
    const weekVolume = weekWorkouts.reduce((total, w) => 
      total + w.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((s, set) => s + (set.weight * set.reps), 0), 0
      ), 0
    );
    
    return [
      { name: 'Workout Frequency', current: weekWorkouts.length, target: 5, percentage: Math.min((weekWorkouts.length / 5) * 100, 100) },
      { name: 'Volume Target', current: weekVolume, target: 50000, percentage: Math.min((weekVolume / 50000) * 100, 100) },
      { name: 'Cardio Minutes', current: 0, target: 150, percentage: 0 },
    ];
  }, [workouts]);

  // Calculate PRs in last 30 days
  const recentPRCount = useMemo(() => {
    if (!records || records.length === 0) return 0;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return records.filter(r => {
      try {
        if (!r.date) return false;
        const recordDate = r.date.toDate ? r.date.toDate() : new Date(r.date);
        return recordDate >= thirtyDaysAgo;
      } catch (error) {
        console.error('Error parsing PR date:', error);
        return false;
      }
    }).length;
  }, [records]);

  const handleSavePersonalInfo = async () => {
    try {
      await updateProfile({
        displayName: formData.displayName || profile?.displayName,
        age: formData.age ? parseInt(formData.age) : profile?.age,
        height: formData.height ? parseFloat(formData.height) : profile?.height,
        weight: formData.weight ? parseFloat(formData.weight) : profile?.weight,
        fitnessGoal: formData.fitnessGoal || profile?.fitnessGoal,
      });
      toast.success('Profile updated successfully!');
      setEditingInfo(false);
      setFormData({ displayName: '', age: '', height: '', weight: '', fitnessGoal: '' });
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${userName}'s Fitness Profile`,
        text: `Check out my progress: ${stats.totalWorkouts} workouts, ${records.length} PRs!`,
      }).catch(() => toast.info('Sharing cancelled'));
    } else {
      toast.info('Sharing not supported on this device');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is not available in this demo');
    }
  };

  const handleCoverUpdate = (coverUrl: string) => {
    // Profile will be updated automatically via the dialog
    toast.success('Cover photo updated!');
  };

  const handleNotificationToggle = async (type: string, enabled: boolean) => {
    try {
      await updatePreferences({
        notifications: {
          ...preferences?.notifications,
          [type]: enabled
        }
      });
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Profile Header with Cover */}
        <div className="relative mb-8">
          {/* Cover Image */}
          <div className="relative h-48 rounded-t-2xl overflow-hidden">
            {profile?.coverPhoto ? (
              <img 
                src={profile.coverPhoto} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#22C55E]/20 via-[#151923] to-[#00D1FF]/20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-50"></div>
              </div>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-4 right-4 bg-[#151923]/80 backdrop-blur-sm text-white hover:bg-[#151923]"
              onClick={() => setCoverDialogOpen(true)}
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Cover
            </Button>
          </div>

          {/* Profile Info */}
          <div className="bg-[#151923] rounded-b-2xl border border-white/5 border-t-0 p-8">
            <div className="flex items-start gap-6 -mt-20">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-[#151923] shadow-xl">
                  <AvatarImage src={currentUser?.photoURL || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-[#22C55E] to-[#00D1FF] text-white text-3xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-[#22C55E] hover:bg-[#22C55E]/90 p-0"
                  onClick={() => toast.info('Photo upload coming soon!')}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex-1 mt-12">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-white">{userName}</h2>
                  <Badge className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] text-white border-0">
                    <Trophy className="w-3 h-3 mr-1" />
                    Active Member
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <Mail className="w-4 h-4" />
                  <span>{userEmail}</span>
                </div>
                {profile?.bio && (
                  <p className="text-gray-300 mb-4 max-w-xl">{profile.bio}</p>
                )}
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Workouts</p>
                    <p className="text-2xl text-white">{stats.totalWorkouts}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Streak</p>
                    <div className="flex items-center gap-1">
                      <Flame className="w-5 h-5 text-[#22C55E]" />
                      <p className="text-2xl text-[#22C55E]">{currentStreak} days</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">PRs</p>
                    <p className="text-2xl text-white">{records.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Achievements</p>
                    <p className="text-2xl text-white">{earnedCount}/{totalCount}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-transparent border-white/10 text-white hover:bg-[#151923]/80"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] text-white hover:opacity-90"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Workouts', value: stats.totalWorkouts.toString(), icon: Target, change: 'All time', trend: 'up' },
            { label: 'Current Streak', value: currentStreak.toString(), unit: 'days', icon: Flame, change: currentStreak > 0 ? 'Active' : 'Start today!', trend: 'up' },
            { label: 'PRs This Month', value: recentPRCount.toString(), icon: Trophy, change: 'Last 30 days', trend: 'up' },
            { label: 'Avg Duration', value: stats.avgDuration.toString(), unit: 'min', icon: Calendar, change: 'Per workout', trend: 'up' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-[#151923] rounded-xl p-6 border border-white/5 hover:border-[#22C55E]/30 transition-all duration-300 group hover:scale-105">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-[#22C55E]" />
                  </div>
                  <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-0 text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl text-white">{stat.value}</p>
                  {stat.unit && (
                    <span className="text-sm text-gray-400">{stat.unit}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Activity Chart and Goals */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Activity */}
          <div className="lg:col-span-2 bg-[#151923] rounded-xl p-6 border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white mb-1">Activity Overview</h3>
                <p className="text-sm text-gray-400">Monthly workout frequency</p>
              </div>
              <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-0">
                <TrendingUp className="w-3 h-3 mr-1" />
                Progress
              </Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <defs>
                    <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                  <XAxis
                    dataKey="month"
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
                  />
                  <Line
                    type="monotone"
                    dataKey="workouts"
                    stroke="#22C55E"
                    strokeWidth={3}
                    dot={{ fill: '#22C55E', r: 6, strokeWidth: 2, stroke: '#151923' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="bg-[#151923] rounded-xl p-6 border border-white/5">
            <h3 className="text-white mb-4">Weekly Goals</h3>
            <div className="space-y-6">
              {weeklyGoals.map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">{goal.name}</span>
                    <span className="text-[#22C55E]">
                      {goal.name === 'Volume Target' 
                        ? `${(goal.current / 1000).toFixed(1)}k / ${(goal.target / 1000).toFixed(1)}k kg`
                        : `${goal.current} / ${goal.target}`
                      }
                    </span>
                  </div>
                  <Progress value={goal.percentage} className="h-2" />
                  <p className="text-xs text-gray-500">{Math.round(goal.percentage)}% complete</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="bg-[#151923] border border-white/10 mb-6">
            <TabsTrigger value="info" className="data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#0B0B0F]">
              <User className="w-4 h-4 mr-2" />
              Personal Info
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#0B0B0F]">
              <Target className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#0B0B0F]">
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[#22C55E] data-[state=active]:text-[#0B0B0F]">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="info">
            <div className="bg-[#151923] rounded-xl p-8 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white">Personal Information</h3>
                {!editingInfo && (
                  <Button
                    onClick={() => {
                      setEditingInfo(true);
                      setFormData({
                        displayName: profile?.displayName || '',
                        age: profile?.age?.toString() || '',
                        height: profile?.height?.toString() || '',
                        weight: profile?.weight?.toString() || '',
                        fitnessGoal: profile?.fitnessGoal || '',
                      });
                    }}
                    variant="outline"
                    size="sm"
                    className="border-white/10"
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-400">Full Name</Label>
                  <Input
                    id="name"
                    value={editingInfo ? formData.displayName : (profile?.displayName || userName)}
                    onChange={(e) => editingInfo && setFormData({...formData, displayName: e.target.value})}
                    className="bg-[#0B0B0F] border-white/10 text-white"
                    disabled={!editingInfo}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-400">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userEmail}
                    className="bg-[#0B0B0F] border-white/10 text-white"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-gray-400">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={editingInfo ? formData.age : (profile?.age || '')}
                    onChange={(e) => editingInfo && setFormData({...formData, age: e.target.value})}
                    placeholder="28"
                    className="bg-[#0B0B0F] border-white/10 text-white"
                    disabled={!editingInfo}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-gray-400">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={editingInfo ? formData.height : (profile?.height || '')}
                    onChange={(e) => editingInfo && setFormData({...formData, height: e.target.value})}
                    placeholder="178"
                    className="bg-[#0B0B0F] border-white/10 text-white"
                    disabled={!editingInfo}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-gray-400">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={editingInfo ? formData.weight : (profile?.weight || '')}
                    onChange={(e) => editingInfo && setFormData({...formData, weight: e.target.value})}
                    placeholder="82"
                    className="bg-[#0B0B0F] border-white/10 text-white"
                    disabled={!editingInfo}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fitnessGoal" className="text-gray-400">Fitness Goal</Label>
                  <Input
                    id="fitnessGoal"
                    value={editingInfo ? formData.fitnessGoal : (profile?.fitnessGoal || '')}
                    onChange={(e) => editingInfo && setFormData({...formData, fitnessGoal: e.target.value})}
                    placeholder="e.g., Build muscle"
                    className="bg-[#0B0B0F] border-white/10 text-white"
                    disabled={!editingInfo}
                  />
                </div>
                {editingInfo && (
                  <div className="md:col-span-2 flex gap-3">
                    <Button
                      onClick={() => {
                        setEditingInfo(false);
                        setFormData({ displayName: '', age: '', height: '', weight: '', fitnessGoal: '' });
                      }}
                      variant="outline"
                      className="border-white/10"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSavePersonalInfo}
                      className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] text-white hover:opacity-90"
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals">
            <div className="bg-[#151923] rounded-xl p-8 border border-white/5">
              <h3 className="text-white mb-6">Fitness Goals</h3>
              <div className="space-y-6">
                <div className="p-6 bg-[#0B0B0F] rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                        <Target className="w-5 h-5 text-[#22C55E]" />
                      </div>
                      <h4 className="text-white">Weekly Workout Target</h4>
                    </div>
                    <span className="text-[#22C55E]">{weeklyGoals[0].current}/{weeklyGoals[0].target} workouts</span>
                  </div>
                  <Progress value={weeklyGoals[0].percentage} className="mb-2" />
                  <p className="text-sm text-gray-400">{Math.max(0, weeklyGoals[0].target - weeklyGoals[0].current)} more workout{weeklyGoals[0].target - weeklyGoals[0].current !== 1 ? 's' : ''} to reach your goal</p>
                </div>

                {profile?.weight && (
                  <div className="p-6 bg-[#0B0B0F] rounded-xl border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/20 flex items-center justify-center">
                          <Weight className="w-5 h-5 text-[#00D1FF]" />
                        </div>
                        <h4 className="text-white">Current Body Weight</h4>
                      </div>
                      <span className="text-[#00D1FF]">{profile.weight} kg</span>
                    </div>
                    <p className="text-sm text-gray-400">Track your weight to monitor progress</p>
                  </div>
                )}

                <div className="p-6 bg-[#0B0B0F] rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-[#22C55E]" />
                      </div>
                      <h4 className="text-white">Personal Records</h4>
                    </div>
                    <span className="text-[#22C55E]">{records.length} PRs</span>
                  </div>
                  <p className="text-sm text-gray-400">Keep pushing your limits!</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <div className="bg-[#151923] rounded-xl p-8 border border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white mb-1">Achievements</h3>
                  <p className="text-sm text-gray-400">Unlock badges by reaching milestones</p>
                </div>
                <Badge className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF] text-white border-0">
                  {earnedCount}/{totalCount} Earned
                </Badge>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  const rarityColors = {
                    common: 'from-gray-500/20 to-gray-400/10 border-gray-500/30',
                    rare: 'from-blue-500/20 to-blue-400/10 border-blue-500/30',
                    epic: 'from-purple-500/20 to-purple-400/10 border-purple-500/30',
                    legendary: 'from-amber-500/20 to-amber-400/10 border-amber-500/30',
                  };
                  
                  return (
                    <div
                      key={achievement.id}
                      className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
                        achievement.earned
                          ? `bg-gradient-to-br ${rarityColors[achievement.rarity]}`
                          : 'bg-[#0B0B0F] border-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                          achievement.earned 
                            ? 'bg-gradient-to-br from-[#22C55E]/30 to-[#00D1FF]/30' 
                            : 'bg-white/5'
                        }`}>
                          <Icon className={`w-7 h-7 ${
                            achievement.earned ? 'text-[#22C55E]' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={achievement.earned ? 'text-white' : 'text-gray-500'}>
                              {achievement.title}
                            </h4>
                            {achievement.earned && (
                              <Badge className="bg-[#22C55E] text-white border-0 text-xs">
                                Earned
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                          {achievement.earned ? (
                            achievement.date && (
                              <div className="flex items-center gap-1 text-xs text-[#22C55E]">
                                <Calendar className="w-3 h-3" />
                                {achievement.date}
                              </div>
                            )
                          ) : (
                            <div>
                              <Progress value={achievement.progress} className="h-2 mb-1" />
                              <p className="text-xs text-gray-500">{achievement.progress}% complete</p>
                            </div>
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
          <TabsContent value="settings">
            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-[#151923] rounded-xl p-8 border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/20 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-[#00D1FF]" />
                  </div>
                  <h3 className="text-white">Notifications</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 px-4 bg-[#0B0B0F] rounded-lg">
                    <div>
                      <p className="text-white mb-1">Workout Reminders</p>
                      <p className="text-sm text-gray-400">Get notified to stay on track</p>
                    </div>
                    <Switch 
                      checked={preferences?.notifications?.workoutReminders ?? true}
                      onCheckedChange={(checked) => handleNotificationToggle('workoutReminders', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-[#0B0B0F] rounded-lg">
                    <div>
                      <p className="text-white mb-1">Achievement Alerts</p>
                      <p className="text-sm text-gray-400">Celebrate your milestones</p>
                    </div>
                    <Switch 
                      checked={preferences?.notifications?.achievementAlerts ?? true}
                      onCheckedChange={(checked) => handleNotificationToggle('achievementAlerts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between py-3 px-4 bg-[#0B0B0F] rounded-lg">
                    <div>
                      <p className="text-white mb-1">Weekly Reports</p>
                      <p className="text-sm text-gray-400">Summary of your progress</p>
                    </div>
                    <Switch 
                      checked={preferences?.notifications?.weeklyReports ?? false}
                      onCheckedChange={(checked) => handleNotificationToggle('weeklyReports', checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-[#151923] rounded-xl p-8 border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#00D1FF]/20 flex items-center justify-center">
                    <Lock className="w-5 h-5 text-[#00D1FF]" />
                  </div>
                  <h3 className="text-white">Security</h3>
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-[#0B0B0F] border-white/10 text-white hover:bg-[#0B0B0F]/80 hover:border-[#22C55E]/30"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-[#0B0B0F] border-white/10 text-white hover:bg-[#0B0B0F]/80 hover:border-[#22C55E]/30"
                    onClick={() => toast.info('2FA coming soon!')}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Two-Factor Authentication
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-[#0B0B0F] border-white/10 text-white hover:bg-[#0B0B0F]/80 hover:border-[#22C55E]/30"
                    onClick={() => setDevicesDialogOpen(true)}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Connected Devices
                  </Button>
                </div>
              </div>

              {/* Data & Privacy */}
              <div className="bg-[#151923] rounded-xl p-8 border border-white/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 flex items-center justify-center">
                    <Download className="w-5 h-5 text-[#22C55E]" />
                  </div>
                  <h3 className="text-white">Data & Privacy</h3>
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-[#0B0B0F] border-white/10 text-white hover:bg-[#0B0B0F]/80 hover:border-[#22C55E]/30"
                    onClick={() => toast.success('Export initiated! Check your email.')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#151923] rounded-xl p-8 border border-red-500/20">
                <h3 className="text-red-500 mb-6">Danger Zone</h3>
                <div className="space-y-3">
                  <Button 
                    onClick={onLogout}
                    variant="outline" 
                    className="w-full justify-start bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-transparent border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
        onAdd={addWeightEntry}
      />
      
      <AddGoalDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        onAdd={addUserGoal}
      />

      <ChangeCoverDialog
        open={coverDialogOpen}
        onOpenChange={setCoverDialogOpen}
        currentCover={profile?.coverPhoto}
        onUpdate={handleCoverUpdate}
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