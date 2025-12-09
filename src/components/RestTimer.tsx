import { useEffect, useState } from 'react';
import { Timer, X, Plus, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface RestTimerProps {
  seconds: number;
  isActive: boolean;
  onStop: () => void;
  onAdjust: (seconds: number) => void;
}

export function RestTimer({ seconds, isActive, onStop, onAdjust }: RestTimerProps) {
  const [initialSeconds] = useState(seconds);
  const progressPercent = ((initialSeconds - seconds) / initialSeconds) * 100;

  const formatTime = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!isActive || seconds <= 0) return null;

  return (
    <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-[#151923] border-2 border-[#F59E0B] shadow-2xl w-80">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B0B0F]">
          <div 
            className="h-full bg-[#F59E0B] transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[#F59E0B]/20 animate-pulse">
                <Timer className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <span className="text-sm text-gray-400">Rest Timer</span>
            </div>
            <button
              onClick={onStop}
              className="p-1 rounded-lg hover:bg-[#0B0B0F] transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Timer display */}
          <div className="text-center mb-4">
            <div className={`text-5xl font-mono font-bold ${
              seconds <= 10 ? 'text-red-500 animate-pulse' : 'text-[#F59E0B]'
            }`}>
              {formatTime(seconds)}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {seconds <= 10 ? 'Almost ready!' : 'Take your time'}
            </p>
          </div>

          {/* Adjust buttons */}
          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAdjust(-15)}
              disabled={seconds <= 15}
              className="bg-transparent border-gray-700 hover:bg-[#0B0B0F]"
            >
              <Minus className="w-3 h-3 mr-1" />
              15s
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAdjust(15)}
              className="bg-transparent border-gray-700 hover:bg-[#0B0B0F]"
            >
              <Plus className="w-3 h-3 mr-1" />
              15s
            </Button>
            <Button
              size="sm"
              onClick={onStop}
              className="bg-[#22C55E] hover:bg-[#22C55E]/90"
            >
              Skip Rest
            </Button>
          </div>
        </div>

        {/* Pulse effect */}
        {seconds <= 10 && (
          <div className="absolute inset-0 border-2 border-red-500 rounded-2xl animate-ping opacity-20" />
        )}
      </div>
    </div>
  );
}
