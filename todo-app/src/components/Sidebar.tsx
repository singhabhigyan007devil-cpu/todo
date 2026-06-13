import { useState } from 'react';
import { ListTodo, CheckCircle2, Circle, Search, Plus, X, Layers, FolderKanban } from 'lucide-react';
import type { Category, FilterType, TodoStats } from '../types/todo';
import { cn } from '../lib/utils';

interface SidebarProps {
  categories: Category[];
  filter: FilterType;
  selectedCategory: string | null;
  searchQuery: string;
  stats: TodoStats;
  onFilterChange: (filter: FilterType) => void;
  onCategorySelect: (categoryId: string | null) => void;
  onSearchChange: (query: string) => void;
  onAddCategory: (name: string, color: string) => void;
  onDeleteCategory: (id: string) => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export function Sidebar({
  categories,
  filter,
  selectedCategory,
  searchQuery,
  stats,
  onFilterChange,
  onCategorySelect,
  onSearchChange,
  onAddCategory,
  onDeleteCategory,
}: SidebarProps) {
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(COLORS[0]);

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim(), newCategoryColor);
      setNewCategoryName('');
      setNewCategoryColor(COLORS[0]);
      setShowAddCategory(false);
    }
  };

  const filters: { id: FilterType; label: string; icon: typeof ListTodo; count: number }[] = [
    { id: 'all', label: 'All Tasks', icon: ListTodo, count: stats.total },
    { id: 'active', label: 'Active', icon: Circle, count: stats.active },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: stats.completed },
  ];

  return (
    <aside className="w-full lg:w-72 flex-shrink-0">
      <div className="lg:sticky lg:top-4 space-y-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-700/60 rounded-xl bg-slate-800/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent backdrop-blur-sm"
          />
        </div>

        <nav className="space-y-1">
          {filters.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.id}
                onClick={() => onFilterChange(f.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all',
                  filter === f.id
                    ? 'bg-primary-500/10 text-primary-400 font-medium'
                    : 'text-slate-400 hover:bg-slate-800/50'
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon size={16} />
                  {f.label}
                </span>
                <span className={cn('text-xs px-1.5 py-0.5 rounded-full', filter === f.id ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-800 text-slate-500')}>
                  {f.count}
                </span>
              </button>
            );
          })}
        </nav>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <FolderKanban size={14} />
              Categories
            </h3>
            <button
              onClick={() => setShowAddCategory(!showAddCategory)}
              className="p-1 text-slate-500 hover:text-primary-400 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>

          {showAddCategory && (
            <div className="mb-2 p-2 bg-slate-800/50 rounded-xl space-y-2 animate-scale-in">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="w-full px-2 py-1 text-xs border border-slate-600 rounded-lg bg-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCategory();
                  if (e.key === 'Escape') setShowAddCategory(false);
                }}
              />
              <div className="flex gap-1 flex-wrap">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    className={cn('w-5 h-5 rounded-full transition-all', newCategoryColor === color && 'ring-2 ring-offset-2 ring-offset-slate-900 ring-primary-400')}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                onClick={handleAddCategory}
                className="w-full px-2 py-1 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-500 transition-colors"
              >
                Add
              </button>
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={() => onCategorySelect(null)}
              className={cn(
                'w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-all',
                selectedCategory === null
                  ? 'bg-slate-800/80 text-slate-200 font-medium'
                  : 'text-slate-400 hover:bg-slate-800/30'
              )}
            >
              <span className="flex items-center gap-2">
                <Layers size={14} />
                All categories
              </span>
              <span className="text-xs text-slate-500">{stats.total}</span>
            </button>
            {categories.map((cat) => (
              <div key={cat.id} className="group flex items-center">
                <button
                  onClick={() => onCategorySelect(cat.id)}
                  className={cn(
                    'flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl text-sm transition-all',
                    selectedCategory === cat.id
                      ? 'bg-slate-800/80 text-slate-200 font-medium'
                      : 'text-slate-400 hover:bg-slate-800/30'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="text-xs text-slate-500">{stats.byCategory[cat.id] || 0}</span>
                </button>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
