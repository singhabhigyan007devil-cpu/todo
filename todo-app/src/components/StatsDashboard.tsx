import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ListTodo, CheckCircle2, AlertTriangle, Flame, TrendingUp, BarChart3, Clock, Target } from 'lucide-react';
import type { TodoStats } from '../types/todo';
import { cn } from '../lib/utils';

interface StatsDashboardProps { stats: TodoStats }

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.stat-card');
    gsap.fromTo(cards, 
      { y: 15, opacity: 0 }, 
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: 'power2.out' }
    );
  }, [stats]);

  useEffect(() => {
    if (streakRef.current && stats.streak > 0) {
      gsap.fromTo(streakRef.current, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.5)' });
    }
  }, [stats.streak]);

  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(progressRef.current, { width: '0%' }, { width: `${stats.completionRate}%`, duration: 0.8, ease: 'power2.out', delay: 0.15 });
    }
  }, [stats.completionRate]);

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/10' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Active', value: stats.active, icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div ref={containerRef} className="space-y-4">
      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card bg-[var(--card-bg)] rounded-[18px] border border-[var(--border-color)]/60 p-4 transition-colors">
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded-full', card.bg)}>
                  <Icon size={14} className={card.color} />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)]">{card.label}</span>
              </div>
              <p className="mt-2.5 text-2xl font-bold tracking-tight-display text-[var(--foreground)]">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion Rate */}
        <div className="stat-card bg-[var(--card-bg)] rounded-[18px] border border-[var(--border-color)]/60 p-4.5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 size={14} className="text-[var(--accent)]" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)]">Completion Rate</h4>
          </div>
          <p className="text-2xl font-bold tracking-tight-display text-[var(--foreground)]">{stats.completionRate}%</p>
          
          <div className="mt-3.5 h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div ref={progressRef} className="h-full bg-[var(--accent)] rounded-full transition-all duration-300" style={{ width: '0%' }} />
          </div>
        </div>

        {/* Streak */}
        <div className="stat-card bg-[var(--card-bg)] rounded-[18px] border border-[var(--border-color)]/60 p-4.5">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-orange-500" />
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)]">Current Streak</h4>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span ref={streakRef} className="text-2xl font-bold tracking-tight-display text-[var(--foreground)]">{stats.streak}</span>
            <span className="text-xs text-[var(--muted-text)]">days</span>
          </div>
          
          <div className="flex items-center gap-1.5 mt-3 text-[12px] text-[var(--muted-text)]">
            <TrendingUp size={13} className={cn(stats.streak > 0 ? 'text-green-500' : 'text-[var(--muted-text)]')} />
            <span>{stats.streak > 0 ? `Consistent daily completions!` : 'Complete tasks to build a streak'}</span>
          </div>
        </div>

        {/* Due Today & Priority */}
        <div className="stat-card bg-[var(--card-bg)] rounded-[18px] border border-[var(--border-color)]/60 p-4.5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-500" />
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)]">Due Today</h4>
            </div>
            <span className="text-[14px] font-bold text-amber-500">{stats.dueToday} tasks</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {([
              { label: 'High', value: stats.byPriority.high, color: 'bg-red-500' },
              { label: 'Medium', value: stats.byPriority.medium, color: 'bg-amber-500' },
              { label: 'Low', value: stats.byPriority.low, color: 'bg-green-500' },
            ] as const).map((p) => (
              <div key={p.label} className="flex items-center gap-2 text-xs">
                <span className="text-[var(--muted-text)] w-12">{p.label}</span>
                <div className="flex-1 h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-300', p.color)} style={{ width: `${stats.total > 0 ? (p.value / stats.total) * 100 : 0}%` }} />
                </div>
                <span className="text-[var(--muted-text)] w-4 text-right font-medium">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
