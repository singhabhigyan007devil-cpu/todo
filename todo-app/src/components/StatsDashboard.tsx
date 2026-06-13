import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ListTodo, CheckCircle2, AlertTriangle, Flame, TrendingUp, BarChart3, Clock, Target } from 'lucide-react';
import type { TodoStats } from '../types/todo';
import { cn } from '../lib/utils';

interface StatsDashboardProps {
  stats: TodoStats;
}

export function StatsDashboard({ stats }: StatsDashboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const streakRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const cards = el.querySelectorAll('.stat-card');
    gsap.fromTo(cards, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.4, ease: 'power2.out' });
  }, [stats]);

  useEffect(() => {
    if (streakRef.current && stats.streak > 0) {
      gsap.fromTo(streakRef.current, { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' });
    }
  }, [stats.streak]);

  useEffect(() => {
    if (progressRef.current) {
      gsap.fromTo(progressRef.current, { width: '0%' }, { width: `${stats.completionRate}%`, duration: 1, ease: 'power3.out', delay: 0.3 });
    }
  }, [stats.completionRate]);

  const statCards = [
    { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: 'Active', value: stats.active, icon: Target, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card bg-slate-800/60 rounded-xl border border-slate-700/60 p-3 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded-lg', card.bg)}>
                  <Icon size={16} className={card.color} />
                </div>
                <span className="text-xs text-slate-400">{card.label}</span>
              </div>
              <p className="mt-1.5 text-xl font-bold text-slate-100">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card bg-slate-800/60 rounded-xl border border-slate-700/60 p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-primary-400" />
            <h4 className="text-xs font-medium text-slate-400">Completion Rate</h4>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-bold text-slate-100">{stats.completionRate}%</span>
          </div>
          <div className="mt-2 h-2 bg-slate-700/50 rounded-full overflow-hidden">
            <div ref={progressRef} className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full transition-all duration-500 ease-out" style={{ width: '0%' }} />
          </div>
        </div>

        <div className="stat-card bg-slate-800/60 rounded-xl border border-slate-700/60 p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={14} className="text-orange-400" />
            <h4 className="text-xs font-medium text-slate-400">Current Streak</h4>
          </div>
          <div className="flex items-end gap-2">
            <span ref={streakRef} className="text-2xl font-bold text-slate-100">{stats.streak}</span>
            <span className="text-xs text-slate-500 mb-1">days</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={12} className={cn(stats.streak > 0 ? 'text-green-400' : 'text-slate-600')} />
            <span className="text-xs text-slate-500">
              {stats.streak > 0 ? `Keep going! ${stats.streak} day streak` : 'Complete tasks daily to build a streak'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card bg-slate-800/60 rounded-xl border border-slate-700/60 p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <Clock size={14} className="text-yellow-400" />
            <h4 className="text-xs font-medium text-slate-400">Due Today</h4>
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats.dueToday}</p>
          <p className="text-xs text-slate-500 mt-0.5">tasks need attention</p>
        </div>

        <div className="stat-card bg-slate-800/60 rounded-xl border border-slate-700/60 p-3 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-purple-400" />
            <h4 className="text-xs font-medium text-slate-400">By Priority</h4>
          </div>
          <div className="space-y-1.5">
            {([
              { label: 'High', value: stats.byPriority.high, color: 'bg-red-500' },
              { label: 'Medium', value: stats.byPriority.medium, color: 'bg-yellow-500' },
              { label: 'Low', value: stats.byPriority.low, color: 'bg-green-500' },
            ] as const).map((p) => (
              <div key={p.label} className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-12">{p.label}</span>
                <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', p.color)} style={{ width: `${stats.total > 0 ? (p.value / stats.total) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-4 text-right">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
