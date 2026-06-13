import { useState } from 'react';
import { Plus, Trash2, Flame, TrendingUp, Target, Activity } from 'lucide-react';
import type { Habit } from '../types/todo';
import { cn } from '../lib/utils';

interface LifestyleWorkspaceProps {
  habits: Habit[];
  onAddHabit: (name: string, frequency: 'daily' | 'weekly') => void;
  onToggleHabitDay: (id: string, dateStr: string) => void;
  onDeleteHabit: (id: string) => void;
}

export function LifestyleWorkspace({
  habits,
  onAddHabit,
  onToggleHabitDay,
  onDeleteHabit,
}: LifestyleWorkspaceProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly'>('daily');

  // Generate last 7 days details (formatted as date string YYYY-MM-DD, label like 'Mon', and display day '12')
  const getLast7Days = () => {
    const days = [];
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = weekdays[d.getDay()];
      const dateNum = d.getDate().toString();
      days.push({ dateStr, dayLabel, dateNum });
    }
    return days;
  };

  const last7Days = getLast7Days();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAddHabit(newName.trim(), newFreq);
    setNewName('');
    setIsAdding(false);
  };

  // Compute overall stats
  const totalHabits = habits.length;
  const maxStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  
  // Calculate average completion rate for last 7 days
  const averageCompletionRate = () => {
    if (habits.length === 0) return 0;
    let totalPossible = habits.length * 7;
    let totalCompleted = 0;
    habits.forEach((h) => {
      last7Days.forEach((day) => {
        if (h.completedDays.includes(day.dateStr)) {
          totalCompleted++;
        }
      });
    });
    return Math.round((totalCompleted / totalPossible) * 100);
  };

  const avgCompletion = averageCompletionRate();

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-4">
        <div>
          <h2 className="text-[17px] font-bold text-[var(--foreground)]">Habits & Lifestyle Hub</h2>
          <p className="text-[12px] text-[var(--muted-text)]">
            Establish healthy routines, track active daily streaks, and organize life domains.
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-full transition-all btn-pressable cursor-pointer"
        >
          <Plus size={13} />
          <span>New Habit</span>
        </button>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-4 border border-[var(--border-color)]/60 rounded-2xl bg-[var(--card-bg)]/30 backdrop-blur-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center flex-shrink-0">
            <Target size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Active Habits</p>
            <p className="text-xl font-bold text-[var(--foreground)]">{totalHabits}</p>
          </div>
        </div>

        <div className="p-4 border border-[var(--border-color)]/60 rounded-2xl bg-[var(--card-bg)]/30 backdrop-blur-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0">
            <Flame size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Top Daily Streak</p>
            <p className="text-xl font-bold text-[var(--foreground)]">{maxStreak} days</p>
          </div>
        </div>

        <div className="p-4 border border-[var(--border-color)]/60 rounded-2xl bg-[var(--card-bg)]/30 backdrop-blur-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-[var(--muted-text)]">7-Day Completion Rate</p>
            <p className="text-xl font-bold text-[var(--foreground)]">{avgCompletion}%</p>
          </div>
        </div>
      </div>

      {/* Add Habit Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-5 border border-[var(--border-color)]/60 rounded-[18px] bg-[var(--card-bg)] space-y-4 max-w-md animate-slide-in"
        >
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">
            Track New Habit
          </h3>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Habit Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Drink 2L water, Stretch, Practice guitar..."
              className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--background)]/40 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Frequency</label>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setNewFreq('daily')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                  newFreq === 'daily'
                    ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]"
                    : "bg-black/5 dark:bg-white/5 border-[var(--border-color)]/60 text-[var(--foreground)]"
                )}
              >
                Daily Routine
              </button>
              <button
                type="button"
                onClick={() => setNewFreq('weekly')}
                className={cn(
                  "flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                  newFreq === 'weekly'
                    ? "bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)]"
                    : "bg-black/5 dark:bg-white/5 border-[var(--border-color)]/60 text-[var(--foreground)]"
                )}
              >
                Weekly Target
              </button>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-lg transition-colors cursor-pointer"
            >
              Start Tracking
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="flex-1 py-2 text-xs font-semibold text-[var(--foreground)] bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Habits List Grid */}
      {habits.length === 0 ? (
        <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px]">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--background)] mb-4">
            <Activity size={22} className="text-[var(--muted-text)]" />
          </div>
          <h3 className="text-[17px] font-semibold tracking-tight-display text-[var(--foreground)] mb-1">
            No habits configured
          </h3>
          <p className="text-[14px] text-[var(--muted-text)] max-w-sm mx-auto">
            Click the button above to define daily routines and begin recording streaks!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="p-5 border border-[var(--border-color)]/60 rounded-2xl bg-[var(--card-bg)] flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[var(--border-color)] transition-all apple-product-shadow card-3d"
            >
              {/* Habit Details */}
              <div className="space-y-2 max-w-xs">
                <div className="flex items-center gap-2">
                  <h4 className="text-[14px] font-bold text-[var(--foreground)] leading-tight">
                    {habit.name}
                  </h4>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[var(--muted-text)]">
                    {habit.frequency}
                  </span>
                </div>
                
                {/* Streak Indicators */}
                <div className="flex items-center gap-1.5 text-orange-400">
                  <Flame size={14} className={cn(habit.streak > 0 && "animate-pulse fill-orange-500/20")} />
                  <span className="text-xs font-bold font-mono">
                    {habit.streak} day streak
                  </span>
                </div>
              </div>

              {/* 7-Day Calendar Checklist bubbles */}
              <div className="flex items-center gap-3 select-none flex-wrap">
                {last7Days.map((day) => {
                  const isCompleted = habit.completedDays.includes(day.dateStr);
                  const isTodayStr = new Date().toISOString().split('T')[0] === day.dateStr;
                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => onToggleHabitDay(habit.id, day.dateStr)}
                      className={cn(
                        "w-11 h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all duration-200 btn-pressable",
                        isCompleted
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400 shadow-md shadow-emerald-500/5"
                          : isTodayStr
                          ? "bg-black/5 dark:bg-white/5 border-[var(--accent)] text-[var(--foreground)]"
                          : "bg-black/5 dark:bg-white/5 border-[var(--border-color)]/40 text-[var(--muted-text)] hover:border-[var(--border-color)]"
                      )}
                    >
                      <span className="text-[8px] uppercase font-bold tracking-wider opacity-65 mb-0.5">
                        {day.dayLabel}
                      </span>
                      <span className="text-xs font-extrabold font-mono">
                        {day.dateNum}
                      </span>
                      <div className="mt-1">
                        {isCompleted ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full border border-[var(--muted-text)]/40" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="p-2 rounded-full text-[var(--muted-text)] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
                  title="Delete habit"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
