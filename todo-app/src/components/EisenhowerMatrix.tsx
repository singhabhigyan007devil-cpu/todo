import { Calendar, AlertCircle, Trash2, Circle, CheckCircle2 } from 'lucide-react';
import type { Todo, Category } from '../types/todo';
import { formatDate, isOverdue, isDueToday } from '../lib/utils';
import { cn } from '../lib/utils';

interface EisenhowerMatrixProps {
  todos: Todo[];
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function EisenhowerMatrix({ todos, categories, onToggle, onDelete }: EisenhowerMatrixProps) {
  const isDueTomorrow = (date: number | null): boolean => {
    if (!date) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(date).toDateString() === tomorrow.toDateString();
  };

  const getCategory = (id: string | null) => categories.find((c) => c.id === id);

  const q1 = todos.filter(
    (t) => !t.completed && t.priority === 'high' && (isDueToday(t.dueDate) || isOverdue(t.dueDate) || isDueTomorrow(t.dueDate))
  );
  const q2 = todos.filter(
    (t) =>
      !t.completed &&
      ((t.priority === 'high' && !(isDueToday(t.dueDate) || isOverdue(t.dueDate) || isDueTomorrow(t.dueDate))) ||
        (t.priority === 'medium' && !t.dueDate))
  );
  const q3 = todos.filter(
    (t) =>
      !t.completed &&
      (t.priority === 'medium' || t.priority === 'low') &&
      (isDueToday(t.dueDate) || isOverdue(t.dueDate) || isDueTomorrow(t.dueDate))
  );
  const q4 = todos.filter(
    (t) => !t.completed && t.priority === 'low' && !(isDueToday(t.dueDate) || isOverdue(t.dueDate) || isDueTomorrow(t.dueDate))
  );

  const quadrants = [
    {
      id: 'q1',
      title: 'Do First',
      subtitle: 'Urgent & Important',
      tasks: q1,
      gradient: 'from-red-500/20 via-red-500/5 to-transparent',
      stripeGradient: 'from-red-500 via-red-400 to-red-600',
      glowColor: 'rgba(239,68,68,0.15)',
      hoverGlow: 'hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]',
      badgeBg: 'bg-red-500/10',
      badgeText: 'text-red-400',
      badgeBorder: 'border-red-500/20',
      dotColor: 'bg-red-500',
      taskBorder: 'border-red-500/10',
      taskHoverBg: 'hover:bg-red-500/[0.04]',
    },
    {
      id: 'q2',
      title: 'Schedule',
      subtitle: 'Important, Not Urgent',
      tasks: q2,
      gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
      stripeGradient: 'from-amber-500 via-amber-400 to-amber-600',
      glowColor: 'rgba(245,158,11,0.15)',
      hoverGlow: 'hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]',
      badgeBg: 'bg-amber-500/10',
      badgeText: 'text-amber-400',
      badgeBorder: 'border-amber-500/20',
      dotColor: 'bg-amber-500',
      taskBorder: 'border-amber-500/10',
      taskHoverBg: 'hover:bg-amber-500/[0.04]',
    },
    {
      id: 'q3',
      title: 'Delegate',
      subtitle: 'Urgent, Not Important',
      tasks: q3,
      gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
      stripeGradient: 'from-blue-500 via-blue-400 to-blue-600',
      glowColor: 'rgba(59,130,246,0.15)',
      hoverGlow: 'hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]',
      badgeBg: 'bg-blue-500/10',
      badgeText: 'text-blue-400',
      badgeBorder: 'border-blue-500/20',
      dotColor: 'bg-blue-500',
      taskBorder: 'border-blue-500/10',
      taskHoverBg: 'hover:bg-blue-500/[0.04]',
    },
    {
      id: 'q4',
      title: 'Eliminate',
      subtitle: 'Not Urgent & Not Important',
      tasks: q4,
      gradient: 'from-white/10 via-white/[0.02] to-transparent',
      stripeGradient: 'from-white/40 via-white/20 to-white/40',
      glowColor: 'rgba(255,255,255,0.05)',
      hoverGlow: 'hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.06)]',
      badgeBg: 'bg-white/[0.04]',
      badgeText: 'text-white/40',
      badgeBorder: 'border-white/[0.06]',
      dotColor: 'bg-white/30',
      taskBorder: 'border-white/[0.04]',
      taskHoverBg: 'hover:bg-white/[0.02]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-in">
      {quadrants.map((q) => (
        <div 
          key={q.id} 
          className={cn(
            'relative rounded-2xl overflow-hidden transition-all duration-500',
            'bg-gradient-to-br from-white/[0.03] to-white/[0.005]',
            'border border-white/[0.06]',
            'backdrop-blur-xl',
            q.hoverGlow,
            'hover:border-white/[0.1]',
            'flex flex-col min-h-[300px] max-h-[420px]'
          )}
        >
          {/* Gradient corner glow */}
          <div className={cn('absolute top-0 left-0 w-32 h-32 bg-gradient-to-br blur-2xl opacity-40 pointer-events-none', q.gradient)} />

          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '20px 20px' }} />
          </div>

          {/* Priority stripe */}
          <div className={cn('absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b', q.stripeGradient)} />

          {/* Header */}
          <div className="relative flex items-start justify-between p-4 pb-3 border-b border-white/[0.05] flex-shrink-0">
            <div>
              <h4 className="text-[14px] font-bold tracking-tight-display text-white/80">{q.title}</h4>
              <p className="text-[11px] text-white/30 mt-0.5">{q.subtitle}</p>
            </div>
            <span className={cn(
              'inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-[3px] rounded-lg border backdrop-blur-sm',
              q.badgeBg, q.badgeText, q.badgeBorder
            )}>
              <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', q.dotColor)} />
              {q.tasks.length}
            </span>
          </div>

          {/* Task List */}
          <div className="relative flex-1 overflow-y-auto space-y-2 p-3 pr-2 scrollbar-hide">
            {q.tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-2">
                  <AlertCircle size={16} className="text-white/15" />
                </div>
                <span className="text-[12px] text-white/20 font-medium">Quadrant clear</span>
              </div>
            ) : (
              q.tasks.map((todo) => {
                const cat = getCategory(todo.categoryId);
                return (
                  <div 
                    key={todo.id} 
                    className={cn(
                      'group relative flex items-start gap-2.5 p-2.5 rounded-xl transition-all duration-300',
                      'bg-white/[0.02] border border-white/[0.04]',
                      q.taskHoverBg,
                      'hover:border-white/[0.08]',
                      'hover:shadow-[0_4px_20px_-8px_rgba(0,0,0,0.3)]'
                    )}
                  >
                    {/* Mini dot grid on hover */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.3px, transparent 0)', backgroundSize: '10px 10px' }} />
                    </div>

                    <button 
                      onClick={() => onToggle(todo.id)} 
                      className="mt-0.5 text-white/20 hover:text-[var(--accent)] transition-all duration-200 flex-shrink-0 btn-pressable cursor-pointer relative"
                    >
                      <div className="absolute inset-0 rounded-full blur-sm opacity-0 hover:opacity-40 bg-[var(--accent)] transition-opacity" />
                      <Circle size={16} strokeWidth={1.5} className="relative" />
                    </button>
                    
                    <div className="flex-1 min-w-0 relative">
                      <h5 className="text-[13px] font-semibold text-white/70 group-hover:text-white/90 truncate leading-snug transition-colors">
                        {todo.title}
                      </h5>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {cat && (
                          <span 
                            className="text-[9px] font-semibold px-1.5 py-0.2 rounded-md text-white/80 border border-white/10" 
                            style={{ backgroundColor: `${cat.color}15` }}
                          >
                            {cat.name}
                          </span>
                        )}
                        {todo.dueDate && (
                          <span className={cn(
                            'text-[9.5px] font-medium flex items-center gap-0.5', 
                            isOverdue(todo.dueDate) ? 'text-red-400' : isDueToday(todo.dueDate) ? 'text-amber-400' : 'text-white/30'
                          )}>
                            <Calendar size={8.5} />
                            {formatDate(todo.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => onDelete(todo.id)} 
                      className="p-1 rounded-lg text-white/15 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all btn-pressable cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
