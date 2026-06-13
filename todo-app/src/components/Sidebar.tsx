import { useState } from 'react';
import { ListTodo, CheckCircle2, Circle, Search, Plus, X, Layers, FolderKanban, GraduationCap, Briefcase, Building2, Palette, Heart } from 'lucide-react';
import type { Category, FilterType, TodoStats, UserPersona } from '../types/todo';
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
  userPersona: UserPersona;
  onPersonaChange: (persona: UserPersona) => void;
}

const COLORS = ['#0066cc', '#7928ca', '#f5a623', '#50e3c2', '#ee0000', '#eb367f', '#2997ff', '#29bc9b'];

export function Sidebar({ categories, filter, selectedCategory, searchQuery, stats, onFilterChange, onCategorySelect, onSearchChange, onAddCategory, onDeleteCategory, userPersona, onPersonaChange }: SidebarProps) {
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

  const categoryHeader = 
    userPersona === 'student' ? 'Subjects & Courses' : 
    userPersona === 'creative' ? 'Creative Channels' :
    userPersona === 'personal' ? 'Life Domains' :
    'Categories';

  const addCategoryPlaceholder = 
    userPersona === 'student' ? 'Subject name' : 
    userPersona === 'creative' ? 'Channel name' :
    userPersona === 'personal' ? 'Domain name' :
    'Category name';

  const allCategoriesLabel = 
    userPersona === 'student' ? 'All subjects' : 
    userPersona === 'creative' ? 'All channels' :
    userPersona === 'personal' ? 'All domains' :
    'All categories';

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
      {/* Workspace Profile Selector Switcher */}
      <div className="space-y-1.5 p-3.5 border border-[var(--border-color)]/60 rounded-xl bg-[var(--card-bg)]/40 backdrop-blur-sm">
        <label className="text-[9px] font-bold uppercase tracking-wider text-[var(--muted-text)] block">Workspace Mode</label>
        <div className="flex items-center gap-2">
          {userPersona === 'student' ? (
            <GraduationCap size={15} className="text-blue-400" />
          ) : userPersona === 'business' ? (
            <Building2 size={15} className="text-purple-400" />
          ) : userPersona === 'creative' ? (
            <Palette size={15} className="text-pink-400" />
          ) : userPersona === 'personal' ? (
            <Heart size={15} className="text-emerald-400" />
          ) : (
            <Briefcase size={15} className="text-amber-400" />
          )}
          <select
            value={userPersona}
            onChange={(e) => onPersonaChange(e.target.value as UserPersona)}
            className="flex-1 text-[11px] font-semibold border-0 bg-transparent text-[var(--foreground)] focus:outline-none focus:ring-0 p-0 cursor-pointer"
          >
            <option value="student">Student Mode</option>
            <option value="professional">Professional Mode</option>
            <option value="business">Business / Enterprise</option>
            <option value="creative">Creative / Designer</option>
            <option value="personal">Personal / Lifestyle</option>
          </select>
        </div>
      </div>

      {/* Search Input styled as a full pill */}
      <div className="relative">
        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted-text)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2.5 text-[14px] border border-[var(--border-color)] rounded-full bg-[var(--card-bg)] text-[var(--foreground)] placeholder-[var(--muted-text)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
        />
      </div>

      {/* Filter items */}
      <nav className="space-y-1">
        {filters.map((f) => {
          const Icon = f.icon;
          const isActive = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={cn(
                'w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-[14px] font-normal transition-all btn-pressable', 
                isActive 
                  ? 'bg-[var(--accent)]/15 text-[var(--accent)] font-semibold' 
                  : 'text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5'
              )}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={15} className={cn(isActive ? 'text-[var(--accent)]' : 'text-[var(--muted-text)]')} />
                {f.label}
              </span>
              <span className={cn('text-[11px] px-1.5 py-0.5 rounded-full', isActive ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-black/5 dark:bg-white/5 text-[var(--muted-text)]')}>
                {f.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Categories section */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1.5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted-text)] flex items-center gap-1.5">
            <FolderKanban size={13} />
            {categoryHeader}
          </h3>
          <button 
            onClick={() => setShowAddCategory(!showAddCategory)} 
            className="p-1 rounded-full text-[var(--muted-text)] hover:text-[var(--accent)] hover:bg-black/5 dark:hover:bg-white/5 transition-all btn-pressable"
          >
            <Plus size={13} />
          </button>
        </div>

        {showAddCategory && (
          <div className="mb-3 p-3 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] space-y-3 animate-scale-in">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={addCategoryPlaceholder}
              className="w-full px-2.5 py-1.5 text-xs border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-text)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); if (e.key === 'Escape') setShowAddCategory(false); }}
            />
            <div className="flex gap-1.5 flex-wrap">
              {COLORS.map((color) => (
                <button 
                  key={color} 
                  type="button" 
                  onClick={() => setNewCategoryColor(color)} 
                  className={cn(
                    'w-5 h-5 rounded-full transition-all border border-black/10 dark:border-white/10 btn-pressable', 
                    newCategoryColor === color && 'ring-2 ring-offset-2 ring-offset-[var(--background)] ring-[var(--accent)]'
                  )} 
                  style={{ backgroundColor: color }} 
                />
              ))}
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => setShowAddCategory(false)} 
                className="flex-1 px-2.5 py-1.5 text-xs text-[var(--muted-text)] bg-black/5 dark:bg-white/5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors btn-pressable"
              >
                Cancel
              </button>
              <button 
                onClick={handleAddCategory} 
                className="flex-1 px-2.5 py-1.5 text-xs font-medium text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-focus)] transition-colors btn-pressable"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <button 
            onClick={() => onCategorySelect(null)} 
            className={cn(
              'w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-[14px] font-normal transition-all btn-pressable', 
              selectedCategory === null 
                ? 'bg-black/5 dark:bg-white/5 text-[var(--foreground)] font-semibold' 
                : 'text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5'
            )}
          >
            <span className="flex items-center gap-2.5"><Layers size={14} className="text-[var(--muted-text)]" />{allCategoriesLabel}</span>
            <span className="text-[11px] text-[var(--muted-text)]">{stats.total}</span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <div key={cat.id} className="group flex items-center gap-0.5">
                <button 
                  onClick={() => onCategorySelect(cat.id)} 
                  className={cn(
                    'flex-1 flex items-center justify-between px-3.5 py-2 rounded-lg text-[14px] font-normal transition-all btn-pressable', 
                    isSelected 
                      ? 'bg-black/5 dark:bg-white/5 text-[var(--foreground)] font-semibold' 
                      : 'text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="text-[11px] text-[var(--muted-text)]">{stats.byCategory[cat.id] || 0}</span>
                </button>
                <button 
                  onClick={() => onDeleteCategory(cat.id)} 
                  className="p-1.5 text-[var(--muted-text)] hover:text-red-500 rounded-full hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all btn-pressable"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
