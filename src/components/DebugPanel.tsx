import { useState } from 'react';
import { useWorkouts } from '../hooks/useWorkouts';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { RefreshCw, Eye, EyeOff } from 'lucide-react';

export function DebugPanel() {
  const [show, setShow] = useState(false);
  const { currentUser } = useAuth();
  const { workouts, stats, loading, error, refresh } = useWorkouts(100);
  const { records, loading: recordsLoading } = usePersonalRecords();

  if (!show) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setShow(true)}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 bg-gray-900 border border-gray-700 rounded-lg p-4 max-h-[600px] overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Debug Panel</h3>
        <div className="flex gap-2">
          <Button
            onClick={refresh}
            size="sm"
            variant="outline"
            className="bg-transparent border-gray-700"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShow(false)}
            size="sm"
            variant="outline"
            className="bg-transparent border-gray-700"
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {/* User Info */}
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-purple-400 font-semibold mb-2">User Info</p>
          <p className="text-gray-300">UID: {currentUser?.uid?.slice(0, 20)}...</p>
          <p className="text-gray-300">Email: {currentUser?.email}</p>
        </div>

        {/* Workouts */}
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-green-400 font-semibold mb-2">Workouts</p>
          <p className="text-gray-300">Loading: {loading ? 'Yes' : 'No'}</p>
          <p className="text-gray-300">Count: {workouts.length}</p>
          <p className="text-gray-300">Total: {stats.totalWorkouts}</p>
          {error && <p className="text-red-400">Error: {error}</p>}
          
          {workouts.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-gray-400 font-semibold">Last 3 workouts:</p>
              {workouts.slice(0, 3).map((w, i) => (
                <div key={i} className="text-xs text-gray-400 pl-2">
                  • {w.name} - {w.exercises?.length || 0} ex - {w.duration}min
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personal Records */}
        <div className="bg-gray-800 p-3 rounded">
          <p className="text-blue-400 font-semibold mb-2">Personal Records</p>
          <p className="text-gray-300">Loading: {recordsLoading ? 'Yes' : 'No'}</p>
          <p className="text-gray-300">Count: {records.length}</p>
          
          {records.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-gray-400 font-semibold">Last 3 PRs:</p>
              {records.slice(0, 3).map((r, i) => (
                <div key={i} className="text-xs text-gray-400 pl-2">
                  • {r.exerciseName} - {r.weight}kg x {r.reps}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Raw Data */}
        <details className="bg-gray-800 p-3 rounded">
          <summary className="text-yellow-400 font-semibold cursor-pointer">
            Raw Workout Data
          </summary>
          <pre className="text-xs text-gray-400 mt-2 overflow-x-auto">
            {JSON.stringify(workouts, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
