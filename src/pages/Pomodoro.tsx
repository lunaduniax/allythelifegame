import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const MODE_CONFIG: Record<TimerMode, { label: string; minutes: number; color: string }> = {
  work: { label: 'FOCUS', minutes: 25, color: 'hsl(var(--primary))' },
  shortBreak: { label: 'REST', minutes: 5, color: '160 80% 55%' },
  longBreak: { label: 'LONG REST', minutes: 15, color: '190 80% 60%' },
};

const Pomodoro = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TimerMode>('work');
  const [secondsLeft, setSecondsLeft] = useState(MODE_CONFIG.work.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [round, setRound] = useState(1);
  const totalRounds = 4;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = MODE_CONFIG[mode].minutes * 60;
  const elapsed = totalSeconds - secondsLeft;
  const fillPercent = totalSeconds > 0 ? (elapsed / totalSeconds) * 100 : 0;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const getColor = useCallback(() => {
    if (mode === 'work') return 'hsl(var(--primary))';
    if (mode === 'shortBreak') return 'hsl(160, 80%, 55%)';
    return 'hsl(190, 80%, 60%)';
  }, [mode]);

  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsRunning(false);
      // Auto advance
      if (mode === 'work') {
        if (round % 4 === 0) {
          switchMode('longBreak');
        } else {
          switchMode('shortBreak');
        }
      } else {
        if (mode === 'longBreak') setRound(1);
        else setRound((r) => r + 1);
        switchMode('work');
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, secondsLeft]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setSecondsLeft(MODE_CONFIG[newMode].minutes * 60);
    setIsRunning(false);
  };

  const reset = () => {
    setSecondsLeft(totalSeconds);
    setIsRunning(false);
  };

  const skip = () => {
    if (mode === 'work') {
      if (round % 4 === 0) switchMode('longBreak');
      else switchMode('shortBreak');
    } else {
      if (mode === 'longBreak') setRound(1);
      else setRound((r) => r + 1);
      switchMode('work');
    }
  };

  const restMinutes = MODE_CONFIG.shortBreak.minutes;
  const restFormatted = `${String(restMinutes).padStart(2, '0')}:00`;
  const roundMinutes = MODE_CONFIG.work.minutes;
  const roundFormatted = `${String(roundMinutes).padStart(2, '0')}:00`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background overflow-hidden">
      {/* Rising color fill */}
      <div
        className="absolute bottom-0 left-0 right-0 z-0 transition-all duration-1000 ease-linear"
        style={{
          height: `${fillPercent}%`,
          backgroundColor: getColor(),
        }}
      />

      {/* Content on top */}
      <div className="relative z-10 flex flex-col flex-1 max-w-[480px] mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div className="flex gap-6 text-xs font-mono tracking-wider">
            <span className="text-foreground/60">REST {restFormatted}</span>
            <span className="text-foreground/60">ROUND {roundFormatted}</span>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex justify-center gap-2 px-6 mt-2">
          {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                mode === m
                  ? 'bg-foreground/10 text-foreground backdrop-blur-sm'
                  : 'text-foreground/40'
              }`}
            >
              {MODE_CONFIG[m].label}
            </button>
          ))}
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          {/* Round indicator */}
          <div className="flex items-center gap-2 mb-2">
            {mode !== 'work' && (
              <span className="text-xs font-mono tracking-widest text-foreground/50">
                ▸ {MODE_CONFIG[mode].label} ◂
              </span>
            )}
            <span className="text-sm font-mono tracking-widest text-foreground/60">
              ROUND {round}/{totalRounds}
            </span>
          </div>

          {/* Timer display */}
          <div className="text-[120px] leading-none font-bold tracking-tight text-foreground font-mono tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 pb-16">
          <button
            onClick={reset}
            className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center"
          >
            <RotateCcw size={20} className="text-foreground/70" />
          </button>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-20 h-20 rounded-full bg-foreground/10 backdrop-blur-md flex items-center justify-center border border-foreground/10"
          >
            {isRunning ? (
              <Pause size={36} className="text-foreground" fill="currentColor" />
            ) : (
              <Play size={36} className="text-foreground ml-1" fill="currentColor" />
            )}
          </button>

          <button
            onClick={skip}
            className="w-12 h-12 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center"
          >
            <SkipForward size={20} className="text-foreground/70" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pomodoro;
