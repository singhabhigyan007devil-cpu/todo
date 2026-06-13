import { useEffect, useRef } from 'react';
import { X, Printer, Target, Calendar, CheckCircle2 } from 'lucide-react';
import type { Todo, Category } from '../types/todo';
import { formatDate, isOverdue, isDueToday, cn } from '../lib/utils';

interface TargetBoardProps {
  todos: Todo[];
  categories: Category[];
  onClose: () => void;
}

export function TargetBoard({ todos, categories, onClose }: TargetBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);
  const getCategory = (id: string | null) => categories.find((c) => c.id === id);

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-slate-600';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div ref={boardRef} className="bg-slate-900 rounded-2xl shadow-2xl border border-slate-700/60 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-primary-400" />
            <h2 className="text-lg font-bold text-slate-200">Target Board</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-500 transition-colors"
            >
              <Printer size={16} />
              Print
            </button>
            <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">My Mission Board</h1>
            <p className="text-slate-400">{activeTodos.length} active target{activeTodos.length !== 1 ? 's' : ''} &bull; {completedTodos.length} completed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTodos.map((todo) => {
              const cat = getCategory(todo.categoryId);
              return (
                <div key={todo.id} className={cn('border-l-4 bg-slate-800/60 rounded-xl p-4 border border-slate-700/60', getPriorityBorder(todo.priority))}>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-200 text-sm">{todo.title}</h3>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded whitespace-nowrap', todo.priority === 'high' ? 'bg-red-900/30 text-red-400' : todo.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' : 'bg-green-900/30 text-green-400')}>
                      {todo.priority}
                    </span>
                  </div>
                  {todo.description && <p className="text-xs text-slate-500 mt-1">{todo.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {cat && <span className="text-xs px-2 py-0.5 rounded text-white" style={{ backgroundColor: cat.color }}>{cat.name}</span>}
                    {todo.dueDate && (
                      <span className={cn('text-xs flex items-center gap-1', isOverdue(todo.dueDate) ? 'text-red-400' : isDueToday(todo.dueDate) ? 'text-yellow-400' : 'text-slate-500')}>
                        <Calendar size={10} />
                        {formatDate(todo.dueDate)}
                      </span>
                    )}
                    {todo.subtasks.length > 0 && (
                      <span className="text-xs text-slate-500">{todo.subtasks.filter((s) => s.completed).length}/{todo.subtasks.length} subtasks</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {completedTodos.length > 0 && (
            <>
              <div className="flex items-center gap-2 mt-8 mb-4">
                <CheckCircle2 size={18} className="text-green-400" />
                <h3 className="font-bold text-slate-300">Achieved Targets</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {completedTodos.map((todo) => (
                  <div key={todo.id} className="bg-green-900/20 border border-green-800/30 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-400 flex-shrink-0" />
                    <span className="text-sm text-slate-400 line-through">{todo.title}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {todos.length === 0 && (
            <div className="text-center py-16 text-slate-600">
              <Target size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium text-slate-500">No targets yet</p>
              <p className="text-sm text-slate-600">Add tasks to build your mission board</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
