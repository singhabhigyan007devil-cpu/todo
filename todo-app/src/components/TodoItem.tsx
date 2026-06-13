import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, ChevronDown, ChevronRight, GripVertical, Plus, Trash2, CheckCircle2, Circle, AlertCircle, X } from 'lucide-react';
import type { Todo, Category } from '../types/todo';
import { cn, formatDate, isOverdue, isDueToday } from '../lib/utils';
import { SubtaskItem } from './SubtaskItem';

interface TodoItemProps {
  todo: Todo;
  categories: Category[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onAddSubtask: (todoId: string, title: string) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onDeleteSubtask: (todoId: string, subtaskId: string) => void;
}

export function TodoItem({ todo, categories, onToggle, onDelete, onUpdate, onAddSubtask, onToggleSubtask, onDeleteSubtask }: TodoItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const category = categories.find((c) => c.id === todo.categoryId);
  const completedSubtasks = todo.subtasks.filter((s) => s.completed).length;
  const subtaskProgress = todo.subtasks.length > 0 ? (completedSubtasks / todo.subtasks.length) * 100 : 0;
  const hasSubtasks = todo.subtasks.length > 0;

  const handleSaveEdit = () => { 
    if (editTitle.trim()) { 
      onUpdate(todo.id, { title: editTitle.trim(), description: editDescription.trim() }); 
      setIsEditing(false); 
    } 
  };
  
  const handleAddSubtask = () => { 
    if (subtaskTitle.trim()) { 
      onAddSubtask(todo.id, subtaskTitle.trim()); 
      setSubtaskTitle(''); 
      setShowSubtaskInput(false); 
    } 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { 
      if (isEditing) handleSaveEdit(); 
      if (showSubtaskInput) handleAddSubtask(); 
    }
    if (e.key === 'Escape') { 
      setIsEditing(false);
      setShowSubtaskInput(false);
    }
  };

  const priorityConfig = {
    high: { color: 'bg-red-500', ring: 'ring-red-500/20', text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/15', label: 'High' },
    medium: { color: 'bg-amber-500', ring: 'ring-amber-500/20', text: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/15', label: 'Medium' },
    low: { color: 'bg-green-500', ring: 'ring-green-500/20', text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/15', label: 'Low' },
  };

  const p = priorityConfig[todo.priority];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        'group relative rounded-2xl border transition-all duration-300 overflow-hidden',
        'bg-[var(--card-bg)] border-[var(--border-color)]/40',
        'hover:border-[var(--border-color)] hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.3)]',
        isDragging ? 'opacity-40 scale-[1.02] ring-2 ring-[var(--accent)]/30 z-50' : '', 
        todo.completed && 'opacity-55'
      )}
    >
      {/* Priority accent stripe */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl', p.color)} />

      {/* Hover shimmer overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-white/[0.02] to-transparent" />

      <div className="relative pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button 
            {...attributes} 
            {...listeners} 
            className="mt-1 cursor-grab active:cursor-grabbing text-[var(--muted-text)]/30 hover:text-[var(--muted-text)] opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          >
            <GripVertical size={16} />
          </button>

          {/* Toggle button */}
          <button 
            onClick={() => onToggle(todo.id)} 
            className={cn(
              'mt-0.5 transition-all duration-300 flex-shrink-0 btn-pressable cursor-pointer rounded-full', 
              todo.completed 
                ? 'text-[var(--accent)] scale-110' 
                : 'text-[var(--muted-text)] hover:text-[var(--accent)] hover:scale-110 hover:drop-shadow-[0_0_8px_rgba(0,102,204,0.4)]'
            )}
          >
            {todo.completed ? <CheckCircle2 size={20} /> : <Circle size={20} strokeWidth={1.5} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input 
                  type="text" 
                  value={editTitle} 
                  onChange={(e) => setEditTitle(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  onBlur={handleSaveEdit} 
                  className="w-full px-3 py-2 text-[14px] font-medium border border-[var(--accent)]/30 rounded-xl bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20" 
                  autoFocus 
                />
                <textarea 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  onBlur={handleSaveEdit} 
                  rows={2} 
                  className="w-full px-3 py-2 text-[12px] border border-[var(--border-color)] rounded-xl bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 resize-none" 
                />
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => { setEditTitle(todo.title); setEditDescription(todo.description); setIsEditing(true); }}>
                <h3 className={cn(
                  'text-[15px] font-semibold tracking-tight-display transition-all duration-300',
                  todo.completed ? 'line-through text-[var(--muted-text)]' : 'text-[var(--foreground)]'
                )}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={cn(
                    'text-[13px] mt-1 line-clamp-2 transition-colors',
                    todo.completed ? 'text-[var(--muted-text)]/60' : 'text-[var(--muted-text)]'
                  )}>
                    {todo.description}
                  </p>
                )}
              </div>
            )}

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority badge */}
              <span className={cn(
                'inline-flex items-center gap-1 px-2.5 py-[3px] rounded-lg text-[10px] font-semibold border',
                p.bg, p.text, p.border
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full', p.color)} />
                {p.label}
              </span>
              
              {/* Category badge */}
              {category && (
                <span 
                  className="inline-flex items-center px-2.5 py-[3px] rounded-lg text-[10px] font-semibold text-white border border-transparent" 
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              )}
              
              {/* Due date badge */}
              {todo.dueDate && (
                <span className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-[3px] rounded-lg text-[10px] font-semibold border', 
                  isOverdue(todo.dueDate) 
                    ? 'bg-red-500/10 text-red-500 border-red-500/15' 
                    : isDueToday(todo.dueDate) 
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/15' 
                      : 'bg-black/5 dark:bg-white/5 text-[var(--muted-text)] border-transparent'
                )}>
                  <Calendar size={10} />
                  {formatDate(todo.dueDate)}
                </span>
              )}
              
              {/* Subtask progress badge */}
              {hasSubtasks && (
                <span className="inline-flex items-center gap-2 px-2.5 py-[3px] rounded-lg text-[10px] font-semibold bg-black/5 dark:bg-white/5 text-[var(--muted-text)] border border-transparent">
                  <svg className="w-4 h-4 flex-shrink-0 -rotate-90" viewBox="0 0 16 16">
                    <circle className="text-black/10 dark:text-white/8" strokeWidth="2" stroke="currentColor" fill="transparent" r="6" cx="8" cy="8" />
                    <circle
                      className="text-[var(--accent)]"
                      strokeWidth="2"
                      strokeDasharray={37.7}
                      strokeDashoffset={37.7 - (subtaskProgress / 100) * 37.7}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="6"
                      cx="8"
                      cy="8"
                    />
                  </svg>
                  <span>{completedSubtasks}/{todo.subtasks.length}</span>
                </span>
              )}
            </div>

            {/* Progress bar (shown when subtasks exist) */}
            {hasSubtasks && subtaskProgress < 100 && (
              <div className="mt-3 h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent)] rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${subtaskProgress}%` }} 
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {hasSubtasks && (
              <button 
                onClick={() => setExpanded(!expanded)} 
                className={cn(
                  'p-1.5 rounded-lg text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-all btn-pressable cursor-pointer',
                  expanded && 'bg-black/5 dark:bg-white/5 text-[var(--foreground)]'
                )}
              >
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
            <button 
              onClick={() => onDelete(todo.id)} 
              className="p-1.5 rounded-lg text-[var(--muted-text)] hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all btn-pressable cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Expanded subtasks */}
        {expanded && hasSubtasks && (
          <div className="mt-4 ml-8 pl-4 border-l-2 border-[var(--border-color)]/40 space-y-2 animate-scale-in">
            {todo.subtasks.map((subtask) => (
              <SubtaskItem 
                key={subtask.id} 
                subtask={subtask} 
                onToggle={() => onToggleSubtask(todo.id, subtask.id)} 
                onDelete={() => onDeleteSubtask(todo.id, subtask.id)} 
              />
            ))}
          </div>
        )}

        {/* Add subtask */}
        <div className="mt-3 ml-8">
          {showSubtaskInput ? (
            <div className="flex items-center gap-2 max-w-sm">
              <input 
                type="text" 
                value={subtaskTitle} 
                onChange={(e) => setSubtaskTitle(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder="Add a subtask..." 
                className="flex-1 px-3 py-1.5 text-xs border border-[var(--border-color)] rounded-xl bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-text)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]/30" 
                autoFocus 
              />
              <button 
                onClick={handleAddSubtask} 
                className="p-1.5 rounded-lg text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors btn-pressable cursor-pointer"
              >
                <Plus size={14} />
              </button>
              <button 
                onClick={() => setShowSubtaskInput(false)} 
                className="p-1.5 rounded-lg text-[var(--muted-text)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors btn-pressable cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowSubtaskInput(true)} 
              className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted-text)]/60 hover:text-[var(--accent)] transition-colors cursor-pointer group/subtask"
            >
              <Plus size={11} className="group-hover/subtask:rotate-90 transition-transform duration-200" />
              Add subtask
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
