import { Calendar, AlertCircle, Trash2, Circle } from 'lucide-react';
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
  // Simple check for due tomorrow
  const isDueTomorrow = (date: number | null): boolean => {
    if (!date) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return new Date(date).toDateString() === tomorrow.toDateString();
  };

  const getCategory = (id: string | null) => categories.find((c) => c.id === id);

  // Categorize active tasks
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
      borderColor: 'border-l-red-500',
      badgeColor: 'bg-red-500/10 text-red-500 border-red-500/10',
    },
    {
      id: 'q2',
      title: 'Schedule',
      subtitle: 'Important, Not Urgent',
      tasks: q2,
      borderColor: 'border-l-amber-500',
      badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/10',
    },
    {
      id: 'q3',
      title: 'Delegate / Action',
      subtitle: 'Urgent, Not Important',
      tasks: q3,
      borderColor: 'border-l-blue-500',
      badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/10',
    },
    {
      id: 'q4',
      title: 'Eliminate',
      subtitle: 'Not Urgent & Not Important',
      tasks: q4,
      borderColor: 'border-l-[var(--border-color)]',
      badgeColor: 'bg-black/5 dark:bg-white/5 text-[var(--muted-text)]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 animate-scale-in">
      {quadrants.map((q) => (
        <div 
          key={q.id} 
          className={cn(
            'bg-[var(--card-bg)] rounded-[18px] border border-[var(--border-color)]/60 p-4 flex flex-col min-h-[300px] max-h-[420px] overflow-hidden',
            'border-l-4',
            q.borderColor
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-[var(--border-color)]/20 mb-3 flex-shrink-0">
            <div>
              <h4 className="text-[14px] font-bold tracking-tight-display text-[var(--foreground)]">{q.title}</h4>
              <p className="text-[11px] text-[var(--muted-text)] mt-0.5">{q.subtitle}</p>
            </div>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', q.badgeColor)}>
              {q.tasks.length}
            </span>
          </div>

          {/* Task List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-hide">
            {q.tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 opacity-40">
                <AlertCircle size={18} className="text-[var(--muted-text)] mb-1.5" />
                <span className="text-[12px] text-[var(--muted-text)]">Quadrant clear</span>
              </div>
            ) : (
              q.tasks.map((todo) => {
                const cat = getCategory(todo.categoryId);
                return (
                  <div 
                    key={todo.id} 
                    className="group flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--background)]/40 hover:bg-[var(--background)] border border-[var(--border-color)]/20 transition-all"
                  >
                    <button 
                      onClick={() => onToggle(todo.id)} 
                      className="mt-0.5 text-[var(--muted-text)] hover:text-[var(--accent)] transition-colors flex-shrink-0 btn-pressable cursor-pointer"
                    >
                      <Circle size={16} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[13px] font-semibold text-[var(--foreground)] truncate leading-snug">
                        {todo.title}
                      </h5>
                      
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {cat && (
                          <span 
                            className="text-[9px] font-semibold px-1.5 py-0.2 rounded-full text-white" 
                            style={{ backgroundColor: cat.color }}
                          >
                            {cat.name}
                          </span>
                        )}
                        {todo.dueDate && (
                          <span className={cn(
                            'text-[9.5px] font-medium flex items-center gap-0.5', 
                            isOverdue(todo.dueDate) ? 'text-red-500' : isDueToday(todo.dueDate) ? 'text-amber-500' : 'text-[var(--muted-text)]'
                          )}>
                            <Calendar size={8.5} />
                            {formatDate(todo.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button 
                      onClick={() => onDelete(todo.id)} 
                      className="p-1 rounded-full text-[var(--muted-text)] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all btn-pressable cursor-pointer"
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
