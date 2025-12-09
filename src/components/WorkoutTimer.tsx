import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import { Button } from './ui/button';

interface WorkoutTimerProps {
  elapsedTime: number;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function WorkoutTimer({ elapsedTime, isRunning, onToggle, onReset }: WorkoutTimerProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#22C55E]/20 via-[#151923] to-[#00D1FF]/20 border border-[#22C55E]/30 p-6">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#22C55E]/5 to-[#00D1FF]/5 animate-pulse" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-[#22C55E]/20">
              <Clock className="w-5 h-5 text-[#22C55E]" />
            </div>
            <div>
              <div className="text-sm text-gray-400">Workout Duration</div>
              <div className={`text-3xl font-mono transition-colors ${isRunning ? 'text-[#22C55E]' : 'text-white'}`}>
                {formatTime(elapsedTime)}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onToggle}
              size="lg"
              className={`${
                isRunning 
                  ? 'bg-[#F59E0B] hover:bg-[#F59E0B]/90' 
                  : 'bg-[#22C55E] hover:bg-[#22C55E]/90'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </>
              )}
            </Button>

            {!isRunning && elapsedTime > 0 && (
              <Button
                onClick={onReset}
                size="lg"
                variant="outline"
                className="bg-transparent border-gray-700 hover:bg-[#0B0B0F]"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#22C55E] animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-xs text-gray-500">
            {isRunning ? 'Recording...' : 'Paused'}
          </span>
        </div>
      </div>
    </div>
  );
}
