import { useEffect } from 'react';
import { X, Printer, Target, Calendar, CheckCircle2 } from 'lucide-react';
import type { Todo, Category } from '../types/todo';
import { formatDate, isOverdue, isDueToday, cn } from '../lib/utils';

interface TargetBoardProps { todos: Todo[]; categories: Category[]; onClose: () => void }

export function TargetBoard({ todos, categories, onClose }: TargetBoardProps) {
  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const getCategory = (id: string | null) => categories.find((c) => c.id === id);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-amber-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-[var(--border-color)]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/45 dark:bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col apple-product-shadow">
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)]/30">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-[var(--accent)]" />
            <h2 className="text-base font-semibold tracking-tight-display text-[var(--foreground)]">Target Board</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[var(--accent)] rounded-full hover:bg-[var(--accent-focus)] transition-colors btn-pressable cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Board</span>
            </button>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-full text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors btn-pressable cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="text-center pb-4 border-b border-[var(--border-color)]/20">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight-hero text-[var(--foreground)] mb-1">My Mission Board</h1>
            <p className="text-[14px] text-[var(--muted-text)]">{activeTodos.length} active target{activeTodos.length !== 1 ? 's' : ''} &bull; {completedTodos.length} completed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTodos.map((todo) => {
              const cat = getCategory(todo.categoryId);
              return (
                <div 
                  key={todo.id} 
                  className={cn(
                    'border-l-4 bg-[var(--background)] rounded-xl p-4 border border-[var(--border-color)]/50', 
                    getPriorityBorder(todo.priority)
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-[var(--foreground)] text-[14px] tracking-tight-display leading-tight">{todo.title}</h3>
                    <span className={cn(
                      'text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border', 
                      todo.priority === 'high' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/10' 
                        : todo.priority === 'medium' 
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' 
                          : 'bg-green-500/10 text-green-500 border-green-500/10'
                    )}>
                      {todo.priority}
                    </span>
                  </div>
                  {todo.description && <p className="text-[12px] text-[var(--muted-text)] mt-1.5 line-clamp-3">{todo.description}</p>}
                  <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2.5 border-t border-[var(--border-color)]/10">
                    {cat && (
                      <span 
                        className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-white" 
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.name}
                      </span>
                    )}
                    {todo.dueDate && (
                      <span className={cn(
                        'text-[11px] font-medium flex items-center gap-1', 
                        isOverdue(todo.dueDate) ? 'text-red-500' : isDueToday(todo.dueDate) ? 'text-amber-500' : 'text-[var(--muted-text)]'
                      )}>
                        <Calendar size={10} />
                        {formatDate(todo.dueDate)}
                      </span>
                    )}
                    {todo.subtasks.length > 0 && (
                      <span className="text-[11px] text-[var(--muted-text)] font-medium">
                        {todo.subtasks.filter((s) => s.completed).length}/{todo.subtasks.length} subtasks
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {completedTodos.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-3.5">
                <CheckCircle2 size={16} className="text-[var(--accent)]" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-text)]">Achieved Targets</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {completedTodos.map((todo) => (
                  <div key={todo.id} className="bg-[var(--background)] border border-[var(--border-color)]/50 rounded-xl p-3 flex items-center gap-2.5">
                    <CheckCircle2 size={14} className="text-[var(--accent)] flex-shrink-0" />
                    <span className="text-[13px] text-[var(--muted-text)] line-through truncate">{todo.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {todos.length === 0 && (
            <div className="text-center py-12">
              <Target size={44} className="mx-auto mb-3 text-[var(--muted-text)]/40" />
              <p className="text-[15px] font-semibold text-[var(--foreground)]">No targets yet</p>
              <p className="text-[13px] text-[var(--muted-text)] mt-0.5">Add tasks to build your mission board</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
