import { useState } from 'react';
import { Plus, X, Calendar, AlertCircle } from 'lucide-react';
import type { Priority, Category } from '../types/todo';
import { cn } from '../lib/utils';

interface TodoFormProps {
  categories: Category[];
  onAdd: (title: string, description: string, priority: Priority, categoryId: string | null, dueDate: number | null) => void;
}

export function TodoForm({ categories, onAdd }: TodoFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(
      title.trim(),
      description.trim(),
      priority,
      categoryId,
      dueDate ? new Date(dueDate).getTime() : null
    );
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategoryId(null);
    setDueDate('');
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div className="animate-fade-in">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-slate-600/50 text-slate-400 hover:border-primary-500/50 hover:text-primary-400 hover:bg-primary-500/5 transition-all duration-200"
        >
          <Plus size={20} />
          <span className="text-sm font-medium">Add a new task</span>
        </button>
      ) : (
        <form
          onSubmit={handleSubmit}
          onKeyDown={handleKeyDown}
          className="bg-slate-800/80 rounded-xl border border-slate-700/60 shadow-lg p-4 space-y-3 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200">New Task</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-3 py-2 text-sm border border-slate-600 rounded-xl bg-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent"
            autoFocus
            required
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description (optional)"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-slate-600 rounded-xl bg-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent resize-none"
          />

          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-slate-400 mb-1">Priority</label>
              <div className="flex gap-1">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all',
                      priority === p
                        ? p === 'high'
                          ? 'bg-red-900/30 text-red-400 ring-1 ring-red-500/50'
                          : p === 'medium'
                          ? 'bg-yellow-900/30 text-yellow-400 ring-1 ring-yellow-500/50'
                          : 'bg-green-900/30 text-green-400 ring-1 ring-green-500/50'
                        : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                    )}
                  >
                    <AlertCircle size={12} />
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={categoryId || ''}
                onChange={(e) => setCategoryId(e.target.value || null)}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-600 rounded-xl bg-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-medium text-slate-400 mb-1">Due Date</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs border border-slate-600 rounded-xl bg-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-sm"
            >
              Add Task
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
