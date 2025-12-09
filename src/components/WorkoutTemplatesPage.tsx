import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Dumbbell, 
  Plus, 
  Eye,
  Trash2,
  Calendar,
  Target,
  TrendingUp,
  Zap,
  Award,
  ChevronRight,
  X,
  Clock
} from 'lucide-react';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { useScheduledWorkouts } from '../hooks/useScheduledWorkouts';
import { WorkoutTemplate, TemplateFocus } from '../firebase/workoutTemplates';
import { ScheduleWorkoutDialog } from './ScheduleWorkoutDialog';
import { CreateTemplateDialog } from './CreateTemplateDialog';

interface WorkoutTemplatesPageProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function WorkoutTemplatesPage({ onNavigate, onLogout }: WorkoutTemplatesPageProps) {
  const { allTemplates, presetTemplates, userTemplates, removeTemplate, addTemplate } = useWorkoutTemplates();
  const { scheduleWorkout, scheduleTemplate } = useScheduledWorkouts();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null);
  const [templateToSchedule, setTemplateToSchedule] = useState<WorkoutTemplate | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const getFocusColor = (focus: TemplateFocus) => {
    switch (focus) {
      case 'strength':
        return 'from-red-500 to-orange-500';
      case 'hypertrophy':
        return 'from-[#22C55E] to-[#00D1FF]';
      case 'mixed':
        return 'from-purple-500 to-pink-500';
      case 'endurance':
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getFocusIcon = (focus: TemplateFocus) => {
    switch (focus) {
      case 'strength':
        return Award;
      case 'hypertrophy':
        return TrendingUp;
      case 'mixed':
        return Zap;
      case 'endurance':
        return Target;
    }
  };

  const handleUseTemplate = (template: WorkoutTemplate) => {
    // Store template in localStorage to use in start-session
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    onNavigate('start-session');
  };

  const handleDelete = async (templateId: string) => {
    if (confirm('Delete this template?')) {
      await removeTemplate(templateId);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0F]">
      <Header currentPage="templates" onNavigate={onNavigate} onLogout={onLogout} />
      
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-white text-4xl mb-2">Workout Templates</h1>
              <p className="text-gray-400 text-lg">Choose from pre-made templates or create your own</p>
            </div>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Preset Templates */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Dumbbell className="w-6 h-6 text-[#22C55E]" />
            <h2 className="text-2xl text-white">Pre-made Templates</h2>
            <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30">
              {presetTemplates.length} templates
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presetTemplates.map((template) => {
              const FocusIcon = getFocusIcon(template.focus);
              
              return (
                <div
                  key={template.id}
                  className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 hover:border-[#22C55E]/30"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getFocusColor(template.focus)} opacity-20 flex items-center justify-center`}>
                      <FocusIcon className="w-7 h-7 text-white" />
                    </div>
                    <Badge className={`bg-gradient-to-r ${getFocusColor(template.focus)} text-white border-0`}>
                      {template.focus}
                    </Badge>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl text-white mb-2">{template.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#00D1FF]" />
                      <span className="text-gray-400">{template.daysPerWeek} days/week</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Dumbbell className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-gray-400">{template.workouts.length} workouts</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
                    >
                      Start Now
                    </Button>
                    <Button
                      onClick={() => {
                        setTemplateToSchedule(template);
                        setShowScheduleDialog(true);
                      }}
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setSelectedTemplate(template)}
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Templates */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-[#00D1FF]" />
            <h2 className="text-2xl text-white">My Templates</h2>
            <Badge className="bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/30">
              {userTemplates.length} templates
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Card */}
            <button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-8 border border-dashed border-white/20 hover:border-[#22C55E]/50 transition-all duration-300 hover:scale-105 min-h-[300px] flex flex-col items-center justify-center group"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-[#22C55E]" />
              </div>
              <h3 className="text-xl text-white mb-2">Create New Template</h3>
              <p className="text-gray-400 text-sm text-center">
                Build your own custom workout program
              </p>
            </button>

            {/* User Templates */}
            {userTemplates.map((template) => {
              const FocusIcon = getFocusIcon(template.focus);
              
              return (
                <div
                  key={template.id}
                  className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl p-6 border border-white/10 shadow-xl hover:scale-105 transition-all duration-300 hover:border-[#00D1FF]/30 group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getFocusColor(template.focus)} opacity-20 flex items-center justify-center`}>
                      <FocusIcon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`bg-gradient-to-r ${getFocusColor(template.focus)} text-white border-0`}>
                        {template.focus}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl text-white mb-2">{template.name}</h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {template.description || 'Custom workout template'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-[#00D1FF]" />
                      <span className="text-gray-400">{template.daysPerWeek} days/week</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Dumbbell className="w-4 h-4 text-[#22C55E]" />
                      <span className="text-gray-400">{template.workouts.length} workouts</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
                    >
                      Start Now
                    </Button>
                    <Button
                      onClick={() => {
                        setTemplateToSchedule(template);
                        setShowScheduleDialog(true);
                      }}
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                    >
                      <Clock className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setSelectedTemplate(template)}
                      variant="outline"
                      className="border-white/10 hover:bg-white/5"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(template.id)}
                      variant="outline"
                      className="border-red-500/20 hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {userTemplates.length === 0 && (
            <div className="text-center py-12 bg-[#151923]/30 rounded-2xl border border-white/5">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No custom templates yet</p>
              <p className="text-gray-500 text-sm mb-6">Create your first template to get started</p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
          <div className="bg-gradient-to-br from-[#151923] to-[#0B0B0F] rounded-2xl border border-white/10 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[#151923] border-b border-white/10 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl text-white mb-1">{selectedTemplate.name}</h2>
                <p className="text-gray-400">{selectedTemplate.description}</p>
              </div>
              <Button
                onClick={() => setSelectedTemplate(null)}
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#0B0B0F] rounded-xl p-4 border border-white/5">
                  <p className="text-gray-400 text-sm mb-1">Days per week</p>
                  <p className="text-2xl text-white">{selectedTemplate.daysPerWeek}</p>
                </div>
                <div className="bg-[#0B0B0F] rounded-xl p-4 border border-white/5">
                  <p className="text-gray-400 text-sm mb-1">Focus</p>
                  <p className="text-2xl text-white capitalize">{selectedTemplate.focus}</p>
                </div>
                <div className="bg-[#0B0B0F] rounded-xl p-4 border border-white/5">
                  <p className="text-gray-400 text-sm mb-1">Workouts</p>
                  <p className="text-2xl text-white">{selectedTemplate.workouts.length}</p>
                </div>
              </div>

              {/* Workouts */}
              <div className="space-y-6">
                <h3 className="text-xl text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#22C55E]" />
                  Workout Schedule
                </h3>
                
                {selectedTemplate.workouts.map((workout) => (
                  <div
                    key={workout.dayNumber}
                    className="bg-[#0B0B0F] rounded-xl p-5 border border-white/5"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#22C55E]/20 to-[#00D1FF]/20 flex items-center justify-center">
                        <span className="text-white">{workout.dayNumber}</span>
                      </div>
                      <h4 className="text-lg text-white">{workout.dayName}</h4>
                      <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30 ml-auto">
                        {workout.exercises.length} exercises
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      {workout.exercises.map((exercise, idx) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-gray-500 text-sm w-6">{idx + 1}.</span>
                            <span className="text-white">{exercise.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">
                              {exercise.sets} × {exercise.reps}
                            </span>
                            {exercise.notes && (
                              <span className="text-gray-500 text-xs italic">
                                {exercise.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-8 pt-6 border-t border-white/10 flex gap-3">
                <Button
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-[#22C55E] to-[#00D1FF]"
                >
                  Use This Template
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  onClick={() => setSelectedTemplate(null)}
                  variant="outline"
                  className="border-white/10 hover:bg-white/5"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Template Dialog */}
      {showCreateDialog && (
        <CreateTemplateDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSave={addTemplate}
        />
      )}

      {/* Schedule Workout Dialog */}
      {showScheduleDialog && templateToSchedule && (
        <ScheduleWorkoutDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          template={templateToSchedule}
          onSchedule={scheduleTemplate}
        />
      )}

      <Footer />
    </div>
  );
}