import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, ChevronDown, ChevronRight, GripVertical, Plus, Trash2, CheckCircle2, Circle, X } from 'lucide-react';
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

  const priorityStyles = {
    high: { stripe: 'from-red-500 via-red-400 to-red-600', glow: 'shadow-[inset_0_0_20px_-8px_rgba(239,68,68,0.3)]', hoverGlow: 'hover:shadow-[0_0_30px_-6px_rgba(239,68,68,0.25)]', dot: 'bg-red-500', badge: 'bg-red-500/8 text-red-400 border-red-500/20', ring: 'ring-red-500/30' },
    medium: { stripe: 'from-amber-500 via-amber-400 to-amber-600', glow: 'shadow-[inset_0_0_20px_-8px_rgba(245,158,11,0.3)]', hoverGlow: 'hover:shadow-[0_0_30px_-6px_rgba(245,158,11,0.25)]', dot: 'bg-amber-500', badge: 'bg-amber-500/8 text-amber-400 border-amber-500/20', ring: 'ring-amber-500/30' },
    low: { stripe: 'from-green-500 via-green-400 to-green-600', glow: 'shadow-[inset_0_0_20px_-8px_rgba(34,197,94,0.3)]', hoverGlow: 'hover:shadow-[0_0_30px_-6px_rgba(34,197,94,0.25)]', dot: 'bg-green-500', badge: 'bg-green-500/8 text-green-400 border-green-500/20', ring: 'ring-green-500/30' },
  };

  const p = priorityStyles[todo.priority];

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        'group relative rounded-2xl transition-all duration-500 overflow-hidden',
        'bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
        'border border-white/[0.06]',
        'backdrop-blur-xl',
        p.glow,
        'hover:border-white/[0.12]',
        p.hoverGlow,
        isDragging ? 'opacity-40 scale-[1.03] z-50 ring-2 ' + p.ring : '', 
        todo.completed && 'opacity-50'
      )}
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className={cn('absolute inset-[-1px] rounded-2xl bg-gradient-to-r', p.stripe, 'opacity-[0.15]')} />
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scanline" />
        </div>
      </div>

      {/* Dot grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 0.5px, transparent 0)', backgroundSize: '16px 16px' }} />
      </div>

      {/* Priority stripe */}
      <div className={cn('absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b', p.stripe)} />

      <div className="relative pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <button 
            {...attributes} 
            {...listeners} 
            className="mt-1 cursor-grab active:cursor-grabbing text-white/15 hover:text-white/40 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
          >
            <GripVertical size={16} />
          </button>

          {/* Toggle */}
          <button 
            onClick={() => onToggle(todo.id)} 
            className={cn(
              'mt-0.5 transition-all duration-300 flex-shrink-0 btn-pressable cursor-pointer relative', 
              todo.completed ? 'text-[var(--accent)]' : 'text-white/30 hover:text-[var(--accent)]'
            )}
          >
            <div className={cn(
              'absolute inset-0 rounded-full blur-md transition-opacity duration-300',
              todo.completed ? 'opacity-60 bg-[var(--accent)]' : 'opacity-0 group-hover:opacity-40 bg-[var(--accent)]'
            )} />
            {todo.completed ? <CheckCircle2 size={20} className="relative" /> : <Circle size={20} strokeWidth={1.5} className="relative" />}
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
                  className="w-full px-3 py-2 text-[14px] font-medium border border-white/10 rounded-xl bg-white/[0.03] text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/40" 
                  autoFocus 
                />
                <textarea 
                  value={editDescription} 
                  onChange={(e) => setEditDescription(e.target.value)} 
                  onKeyDown={handleKeyDown} 
                  onBlur={handleSaveEdit} 
                  rows={2} 
                  className="w-full px-3 py-2 text-[12px] border border-white/10 rounded-xl bg-white/[0.03] text-white/70 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 resize-none" 
                />
              </div>
            ) : (
              <div className="cursor-pointer" onClick={() => { setEditTitle(todo.title); setEditDescription(todo.description); setIsEditing(true); }}>
                <h3 className={cn(
                  'text-[15px] font-semibold tracking-tight-display transition-all duration-300',
                  todo.completed ? 'line-through text-white/30' : 'text-white/90 group-hover:text-white'
                )}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className={cn(
                    'text-[13px] mt-1 line-clamp-2 transition-colors',
                    todo.completed ? 'text-white/20' : 'text-white/35 group-hover:text-white/50'
                  )}>
                    {todo.description}
                  </p>
                )}
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority */}
              <span className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-lg text-[10px] font-semibold border backdrop-blur-sm',
                p.badge
              )}>
                <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse', p.dot)} />
                {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
              </span>
              
              {/* Category */}
              {category && (
                <span 
                  className="inline-flex items-center px-2.5 py-[3px] rounded-lg text-[10px] font-semibold text-white border border-white/10 backdrop-blur-sm" 
                  style={{ backgroundColor: `${category.color}15`, borderColor: `${category.color}30` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: category.color }} />
                  {category.name}
                </span>
              )}
              
              {/* Due date */}
              {todo.dueDate && (
                <span className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-lg text-[10px] font-semibold border backdrop-blur-sm', 
                  isOverdue(todo.dueDate) 
                    ? 'bg-red-500/8 text-red-400 border-red-500/20' 
                    : isDueToday(todo.dueDate) 
                      ? 'bg-amber-500/8 text-amber-400 border-amber-500/20' 
                      : 'bg-white/[0.04] text-white/40 border-white/[0.06]'
                )}>
                  <Calendar size={10} />
                  {formatDate(todo.dueDate)}
                </span>
              )}
              
              {/* Subtask count */}
              {hasSubtasks && (
                <span className="inline-flex items-center gap-2 px-2.5 py-[3px] rounded-lg text-[10px] font-semibold bg-white/[0.04] text-white/40 border border-white/[0.06] backdrop-blur-sm">
                  <svg className="w-4 h-4 flex-shrink-0 -rotate-90" viewBox="0 0 16 16">
                    <circle className="text-white/8" strokeWidth="2" stroke="currentColor" fill="transparent" r="6" cx="8" cy="8" />
                    <circle
                      className="text-[var(--accent)] drop-shadow-[0_0_4px_rgba(0,102,204,0.5)]"
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

            {/* Progress bar */}
            {hasSubtasks && subtaskProgress < 100 && (
              <div className="mt-3 h-[3px] w-full bg-white/[0.04] rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r',
                    todo.priority === 'high' ? 'from-red-500 to-red-400' : todo.priority === 'medium' ? 'from-amber-500 to-amber-400' : 'from-green-500 to-green-400'
                  )} 
                  style={{ width: `${subtaskProgress}%`, boxShadow: `0 0 8px ${todo.priority === 'high' ? 'rgba(239,68,68,0.4)' : todo.priority === 'medium' ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)'}` }} 
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
                  'p-1.5 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/[0.05] transition-all btn-pressable cursor-pointer',
                  expanded && 'bg-white/[0.06] text-white/60'
                )}
              >
                {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            )}
            <button 
              onClick={() => onDelete(todo.id)} 
              className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all btn-pressable cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Expanded subtasks */}
        {expanded && hasSubtasks && (
          <div className="mt-4 ml-8 pl-4 border-l border-white/[0.06] space-y-1 animate-scale-in">
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
                className="flex-1 px-3 py-1.5 text-xs border border-white/10 rounded-xl bg-white/[0.03] text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]/40" 
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
                className="p-1.5 rounded-lg text-white/25 hover:bg-white/[0.05] transition-colors btn-pressable cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowSubtaskInput(true)} 
              className="flex items-center gap-1.5 text-[11px] font-medium text-white/25 hover:text-[var(--accent)] transition-colors cursor-pointer group/subtask"
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
