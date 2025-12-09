import { useScheduledWorkouts } from '../hooks/useScheduledWorkouts';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Calendar, Database, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export function ScheduledWorkoutsDebug() {
  const { currentUser } = useAuth();
  const { scheduledWorkouts, loading, error, refreshScheduledWorkouts } = useScheduledWorkouts();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!currentUser) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-[#151923] border border-white/10 rounded-xl shadow-2xl max-w-md">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors rounded-t-xl"
        >
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#22C55E]" />
            <span className="text-white text-sm font-medium">
              Scheduled Workouts Debug
            </span>
            <span className="bg-[#22C55E]/20 text-[#22C55E] text-xs px-2 py-0.5 rounded-full">
              {scheduledWorkouts.length}
            </span>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 border-t border-white/10 max-h-[400px] overflow-y-auto">
            {/* User Info */}
            <div className="mb-3 p-2 bg-[#0B0B0F] rounded text-xs">
              <p className="text-gray-400">User ID:</p>
              <p className="text-white font-mono break-all">{currentUser.uid}</p>
            </div>

            {/* Status */}
            <div className="mb-3 flex items-center gap-2">
              {loading && (
                <div className="flex items-center gap-2 text-yellow-500 text-sm">
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  Loading...
                </div>
              )}
              {error && (
                <div className="text-red-400 text-sm">
                  ❌ {error}
                </div>
              )}
              {!loading && !error && scheduledWorkouts.length === 0 && (
                <div className="text-gray-400 text-sm">
                  No scheduled workouts found
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <Button
              onClick={refreshScheduledWorkouts}
              size="sm"
              className="w-full mb-3 bg-[#22C55E]/20 text-[#22C55E] hover:bg-[#22C55E]/30"
              disabled={loading}
            >
              <RefreshCcw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>

            {/* Workouts List */}
            {scheduledWorkouts.length > 0 && (
              <div className="space-y-2">
                {scheduledWorkouts.map((workout, index) => (
                  <div
                    key={workout.id}
                    className="p-3 bg-[#0B0B0F] rounded-lg border border-white/5"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-[#00D1FF]" />
                        <span className="text-white text-sm font-medium">
                          {workout.templateName}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        workout.completed
                          ? 'bg-[#22C55E]/20 text-[#22C55E]'
                          : 'bg-orange-500/20 text-orange-500'
                      }`}>
                        {workout.completed ? 'Done' : 'Planned'}
                      </span>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-400">
                      <p>📅 {workout.date.toDate().toLocaleDateString()}</p>
                      <p>🏋️ {workout.type.toUpperCase()}</p>
                      <p>💪 {workout.exercises.length} exercises</p>
                      {workout.notes && (
                        <p className="text-gray-500 italic">"{workout.notes}"</p>
                      )}
                    </div>

                    {/* Exercises Details */}
                    <details className="mt-2">
                      <summary className="text-xs text-[#22C55E] cursor-pointer hover:text-[#00D1FF]">
                        View exercises
                      </summary>
                      <div className="mt-2 space-y-1 pl-2 border-l-2 border-[#22C55E]/30">
                        {workout.exercises.map((ex, idx) => (
                          <div key={idx} className="text-xs text-gray-400">
                            <span className="text-white">{ex.name}</span>
                            {ex.type === 'strength' && ex.sets && (
                              <span className="text-gray-500">
                                {' '}• {ex.sets}×{ex.reps} @ {ex.weight}kg
                              </span>
                            )}
                            {ex.type === 'cardio' && ex.duration && (
                              <span className="text-gray-500">
                                {' '}• {ex.duration} min
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>

                    <div className="mt-2 pt-2 border-t border-white/5 text-xs text-gray-500">
                      ID: {workout.id}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Firestore Path */}
            <div className="mt-4 p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs">
              <p className="text-blue-400 font-medium mb-1">Firestore Path:</p>
              <code className="text-blue-300 break-all">
                users/{currentUser.uid}/scheduledWorkouts
              </code>
            </div>

            {/* Help Text */}
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-400">
              💡 Si vous ne voyez rien, consultez /FIREBASE_SCHEDULED_WORKOUTS_GUIDE.md
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
