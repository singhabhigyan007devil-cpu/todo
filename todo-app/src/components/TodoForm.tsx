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
    onAdd(title.trim(), description.trim(), priority, categoryId, dueDate ? new Date(dueDate).getTime() : null);
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
    <div className="animate-fade-in w-full">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)} 
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border border-dashed border-[var(--border-color)] text-[var(--muted-text)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all duration-200 btn-pressable cursor-pointer"
        >
          <Plus size={16} />
          <span className="text-[14px] font-normal">Add a new task</span>
        </button>
      ) : (
        <form 
          onSubmit={handleSubmit} 
          onKeyDown={handleKeyDown} 
          className="bg-[var(--card-bg)] rounded-[18px] border border-[var(--border-color)] p-5 space-y-4 animate-scale-in"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[var(--foreground)]">New Task</h3>
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="p-1 rounded-full text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-all btn-pressable"
            >
              <X size={15} />
            </button>
          </div>

          <div className="space-y-3">
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="What needs to be done?" 
              className="w-full px-4 py-2.5 text-[15px] border border-[var(--border-color)] rounded-xl bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all" 
              autoFocus 
              required 
            />
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Add a description (optional)" 
              rows={2} 
              className="w-full px-4 py-2.5 text-[13px] border border-[var(--border-color)] rounded-xl bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-text)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] resize-none transition-all" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)] mb-2">Priority</label>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const isSelected = priority === p;
                  return (
                    <button 
                      key={p} 
                      type="button" 
                      onClick={() => setPriority(p)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-[12px] font-normal border transition-all btn-pressable cursor-pointer', 
                        isSelected
                          ? p === 'high' 
                            ? 'bg-red-500/10 text-red-500 border-red-500/20 font-semibold' 
                            : p === 'medium' 
                              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold' 
                              : 'bg-green-500/10 text-green-500 border-green-500/20 font-semibold'
                          : 'bg-black/5 dark:bg-white/5 text-[var(--muted-text)] border-transparent hover:bg-black/10 dark:hover:bg-white/10'
                      )}
                    >
                      <AlertCircle size={11} />
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)] mb-2">Category</label>
              <select 
                value={categoryId || ''} 
                onChange={(e) => setCategoryId(e.target.value || null)} 
                className="w-full px-3 py-1.5 text-[12px] border border-[var(--border-color)] rounded-full bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 cursor-pointer"
              >
                <option value="">No category</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)] mb-2">Due Date</label>
              <div className="relative">
                <Calendar size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
                <input 
                  type="date" 
                  value={dueDate} 
                  onChange={(e) => setDueDate(e.target.value)} 
                  className="w-full pl-9 pr-3.5 py-1.5 text-[12px] border border-[var(--border-color)] rounded-full bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border-color)]/30">
            <button 
              type="button" 
              onClick={() => setIsOpen(false)} 
              className="px-4 py-1.5 text-xs font-normal text-[var(--foreground)] bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors btn-pressable cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-1.5 text-xs font-medium text-white bg-[var(--accent)] rounded-full hover:bg-[var(--accent-focus)] transition-all btn-pressable cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
