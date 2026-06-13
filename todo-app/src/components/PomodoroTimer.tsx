import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle } from 'lucide-react';
import type { Todo } from '../types/todo';
import { cn } from '../lib/utils';

interface PomodoroTimerProps {
  todos: Todo[];
}

type TimerMode = 'focus' | 'short' | 'long';

export function PomodoroTimer({ todos }: PomodoroTimerProps) {
  const [focusMinutes, setFocusMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoro_focus');
    return saved ? Math.max(1, Math.min(180, parseInt(saved, 10))) : 25;
  });
  const [shortMinutes, setShortMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoro_short');
    return saved ? Math.max(1, Math.min(180, parseInt(saved, 10))) : 5;
  });
  const [longMinutes, setLongMinutes] = useState(() => {
    const saved = localStorage.getItem('pomodoro_long');
    return saved ? Math.max(1, Math.min(180, parseInt(saved, 10))) : 15;
  });

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('pomodoro_focus');
    const mins = saved ? Math.max(1, Math.min(180, parseInt(saved, 10))) : 25;
    return mins * 60;
  });
  const [isActive, setIsActive] = useState(false);
  const [selectedTodoId, setSelectedTodoId] = useState<string>('');
  
  const timerRef = useRef<any>(null);

  const activeTodo = todos.find((t) => t.id === selectedTodoId);

  // Circle path math for SVG progress ring
  const radius = 54;
  const strokeWidth = 3.5;
  const circumference = 2 * Math.PI * radius;
  
  const activeMinutes = mode === 'focus' ? focusMinutes : mode === 'short' ? shortMinutes : longMinutes;
  const totalDuration = activeMinutes * 60;
  const strokeDashoffset = circumference - (totalDuration > 0 ? (timeLeft / totalDuration) * circumference : circumference);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(activeMinutes * 60);
    }
  }, [mode, focusMinutes, shortMinutes, longMinutes, isActive]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            playChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const playNote = (time: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gain.gain.setValueAtTime(0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
        
        osc.start(time);
        osc.stop(time + duration);
      };
      
      const now = ctx.currentTime;
      // Warm chime: two quick, pure notes
      playNote(now, 523.25, 0.4); // C5
      playNote(now + 0.18, 659.25, 0.55); // E5
    } catch (e) {
      console.warn("Audio Context blocked or failed to initialize:", e);
    }
  };

  const handleDurationChange = (newMins: number) => {
    const mins = Math.max(1, Math.min(180, newMins));
    if (mode === 'focus') {
      setFocusMinutes(mins);
      localStorage.setItem('pomodoro_focus', mins.toString());
    } else if (mode === 'short') {
      setShortMinutes(mins);
      localStorage.setItem('pomodoro_short', mins.toString());
    } else if (mode === 'long') {
      setLongMinutes(mins);
      localStorage.setItem('pomodoro_long', mins.toString());
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(activeMinutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-5 w-full space-y-4 animate-scale-in">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Clock size={15} className="text-[var(--accent)]" />
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)]">Focus Timer</h4>
      </div>

      <div className="flex flex-col items-center gap-5 w-full">
        {/* Circular SVG Timer */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              className="text-black/5 dark:text-white/5"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
            {/* Progress circle */}
            <circle
              className="progress-ring-circle text-[var(--accent)]"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="60"
              cy="60"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-bold text-[var(--foreground)] tracking-tight-display">
              {formatTime(timeLeft)}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-[var(--muted-text)]">
              {mode === 'focus' ? 'Focus' : mode === 'short' ? 'Break' : 'Long'}
            </span>
          </div>
        </div>

        {/* Controls and Task targeting */}
        <div className="flex-1 w-full space-y-3">
          {/* Mode Selector stacked vertically as a 3-column grid */}
          <div className="grid grid-cols-3 gap-1.5">
            {(['focus', 'short', 'long'] as TimerMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={cn(
                  'text-[9px] font-semibold uppercase tracking-wider py-1.5 rounded-full border transition-all btn-pressable cursor-pointer text-center',
                  mode === m 
                    ? 'bg-[var(--accent)] text-white border-transparent' 
                    : 'bg-black/5 dark:bg-white/5 border-[var(--border-color)] text-[var(--muted-text)] hover:text-[var(--foreground)]'
                )}
              >
                {m === 'focus' ? 'Focus' : m === 'short' ? 'Break' : 'Long'}
              </button>
            ))}
          </div>

          {/* Stepper Duration Input */}
          <div className="flex items-center justify-between gap-2 p-2 border border-[var(--border-color)]/50 rounded-xl bg-[var(--background)]/30">
            <span className="text-[10px] font-semibold text-[var(--muted-text)] pl-1">Duration:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleDurationChange(activeMinutes - 1)}
                disabled={isActive || activeMinutes <= 1}
                className="w-5 h-5 flex items-center justify-center rounded-md border border-[var(--border-color)]/60 text-[12px] font-bold hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-[var(--foreground)]"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max="180"
                value={activeMinutes === 0 ? '' : activeMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (isNaN(val)) {
                    if (mode === 'focus') setFocusMinutes(0);
                    else if (mode === 'short') setShortMinutes(0);
                    else if (mode === 'long') setLongMinutes(0);
                  } else {
                    const clamped = Math.max(0, Math.min(180, val));
                    if (mode === 'focus') {
                      setFocusMinutes(clamped);
                      if (clamped > 0) localStorage.setItem('pomodoro_focus', clamped.toString());
                    } else if (mode === 'short') {
                      setShortMinutes(clamped);
                      if (clamped > 0) localStorage.setItem('pomodoro_short', clamped.toString());
                    } else if (mode === 'long') {
                      setLongMinutes(clamped);
                      if (clamped > 0) localStorage.setItem('pomodoro_long', clamped.toString());
                    }
                  }
                }}
                onBlur={() => {
                  if (activeMinutes < 1) {
                    handleDurationChange(1);
                  }
                }}
                disabled={isActive}
                className="w-10 text-center text-xs font-semibold border-0 bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-0 p-0"
              />
              <span className="text-[10px] font-semibold text-[var(--muted-text)]">min</span>
              <button
                type="button"
                onClick={() => handleDurationChange(activeMinutes + 1)}
                disabled={isActive || activeMinutes >= 180}
                className="w-5 h-5 flex items-center justify-center rounded-md border border-[var(--border-color)]/60 text-[12px] font-bold hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-[var(--foreground)]"
              >
                +
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-2 pt-1">
            <button
              onClick={toggleTimer}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-full text-white btn-pressable cursor-pointer transition-colors',
                isActive ? 'bg-amber-600 hover:bg-amber-500' : 'bg-[var(--accent)] hover:bg-[var(--accent-focus)]'
              )}
            >
              {isActive ? <Pause size={12} /> : <Play size={12} />}
              <span>{isActive ? 'Pause' : 'Start'}</span>
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-normal text-[var(--foreground)] bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 btn-pressable cursor-pointer transition-colors"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          </div>

          {/* Task Link selector */}
          <div className="pt-2 border-t border-[var(--border-color)]/20">
            <select
              value={selectedTodoId}
              onChange={(e) => setSelectedTodoId(e.target.value)}
              className="w-full text-xs border border-[var(--border-color)]/60 rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] p-1.5 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 cursor-pointer"
            >
              <option value="">Target a task to focus on</option>
              {todos.filter((t) => !t.completed).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Target Focus Banner */}
      {activeTodo && (
        <div className="flex items-center gap-2 p-2 bg-[var(--accent)]/5 rounded-lg border border-[var(--accent)]/10 animate-fade-in">
          <CheckCircle size={13} className="text-[var(--accent)] flex-shrink-0 animate-pulse" />
          <span className="text-[12px] text-[var(--foreground)] truncate font-medium">
            Focus Session: <span className="font-semibold">{activeTodo.title}</span>
          </span>
        </div>
      )}
    </div>
  );
}
