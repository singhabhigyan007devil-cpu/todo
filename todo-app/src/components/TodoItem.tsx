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

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        'group rounded-xl border p-4.5 transition-all duration-200 bg-[var(--card-bg)] border-[var(--border-color)]/60', 
        isDragging ? 'opacity-50 ring-2 ring-[var(--accent)]/20 border-[var(--accent)]/30' : '', 
        todo.completed && 'opacity-65'
      )}
    >
      <div className="flex items-start gap-3">
        <button 
          {...attributes} 
          {...listeners} 
          className="mt-1 cursor-grab active:cursor-grabbing text-[var(--muted-text)]/40 hover:text-[var(--muted-text)] opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={16} />
        </button>

        <button 
          onClick={() => onToggle(todo.id)} 
          className={cn(
            'mt-0.5 transition-all flex-shrink-0 btn-pressable cursor-pointer', 
            todo.completed ? 'text-[var(--accent)]' : 'text-[var(--muted-text)] hover:text-[var(--accent)]'
          )}
        >
          {todo.completed ? <CheckCircle2 size={19} /> : <Circle size={19} />}
        </button>

        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-2">
              <input 
                type="text" 
                value={editTitle} 
                onChange={(e) => setEditTitle(e.target.value)} 
                onKeyDown={handleKeyDown} 
                onBlur={handleSaveEdit} 
                className="w-full px-2.5 py-1.5 text-[14px] border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)]" 
                autoFocus 
              />
              <textarea 
                value={editDescription} 
                onChange={(e) => setEditDescription(e.target.value)} 
                onKeyDown={handleKeyDown} 
                onBlur={handleSaveEdit} 
                rows={2} 
                className="w-full px-2.5 py-1.5 text-[12px] border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] resize-none" 
              />
            </div>
          ) : (
            <div className="cursor-pointer" onClick={() => { setEditTitle(todo.title); setEditDescription(todo.description); setIsEditing(true); }}>
              <h3 className={cn('text-[15px] font-semibold text-[var(--foreground)] tracking-tight-display transition-colors', todo.completed && 'line-through text-[var(--muted-text)]')}>{todo.title}</h3>
              {todo.description && <p className="text-[13px] text-[var(--muted-text)] mt-1 line-clamp-2">{todo.description}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-transparent', 
              todo.priority === 'high' 
                ? 'bg-red-500/10 text-red-500 border-red-500/10' 
                : todo.priority === 'medium' 
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' 
                  : 'bg-green-500/10 text-green-500 border-green-500/10'
            )}>
              <AlertCircle size={10} className="mr-1" />
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </span>
            
            {category && (
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium text-white border border-transparent" 
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
            
            {todo.dueDate && (
              <span className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border', 
                isOverdue(todo.dueDate) 
                  ? 'bg-red-500/10 text-red-500 border-red-500/10' 
                  : isDueToday(todo.dueDate) 
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' 
                    : 'bg-black/5 dark:bg-white/5 text-[var(--muted-text)] border-transparent'
              )}>
                <Calendar size={10} />
                {formatDate(todo.dueDate)}
              </span>
            )}
            
            {todo.subtasks.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-medium bg-black/5 dark:bg-white/5 text-[var(--muted-text)] border border-transparent">
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16">
                  <circle
                    className="text-black/10 dark:text-white/10"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    fill="transparent"
                    r="6"
                    cx="8"
                    cy="8"
                  />
                  <circle
                    className="progress-ring-circle text-[var(--accent)]"
                    strokeWidth="1.5"
                    strokeDasharray={37.7}
                    strokeDashoffset={37.7 - (completedSubtasks / todo.subtasks.length) * 37.7}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="6"
                    cx="8"
                    cy="8"
                  />
                </svg>
                <span>{completedSubtasks}/{todo.subtasks.length} subtasks</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {todo.subtasks.length > 0 && (
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="p-1.5 rounded-full text-[var(--muted-text)] hover:text-[var(--foreground)] hover:bg-black/5 dark:hover:bg-white/5 transition-all btn-pressable cursor-pointer"
            >
              {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          )}
          <button 
            onClick={() => onDelete(todo.id)} 
            className="p-1.5 rounded-full text-[var(--muted-text)] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all btn-pressable cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && todo.subtasks.length > 0 && (
        <div className="mt-3 ml-7 pl-4.5 border-l border-[var(--border-color)]/60 space-y-1.5 animate-scale-in">
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

      <div className="mt-3.5 ml-7">
        {showSubtaskInput ? (
          <div className="flex items-center gap-2 max-w-sm">
            <input 
              type="text" 
              value={subtaskTitle} 
              onChange={(e) => setSubtaskTitle(e.target.value)} 
              onKeyDown={handleKeyDown} 
              placeholder="Add a subtask..." 
              className="flex-1 px-2.5 py-1 text-xs border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--muted-text)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30" 
              autoFocus 
            />
            <button 
              onClick={handleAddSubtask} 
              className="p-1 rounded-md text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors btn-pressable cursor-pointer"
            >
              <Plus size={14} />
            </button>
            <button 
              onClick={() => setShowSubtaskInput(false)} 
              className="p-1 rounded-md text-[var(--muted-text)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors btn-pressable cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowSubtaskInput(true)} 
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--muted-text)] hover:text-[var(--accent)] transition-colors cursor-pointer"
          >
            <Plus size={11} />
            Add subtask
          </button>
        )}
      </div>
    </div>
  );
}
