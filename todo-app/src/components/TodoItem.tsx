import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Calendar, ChevronDown, ChevronRight, GripVertical, Plus, Trash2, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import type { Todo, Category, Priority } from '../types/todo';
import { PRIORITY_COLORS, PRIORITY_ICON_COLORS } from '../types/todo';
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

export function TodoItem({
  todo,
  categories,
  onToggle,
  onDelete,
  onUpdate,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: TodoItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskTitle, setSubtaskTitle] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

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
        'group bg-slate-800/60 rounded-xl border border-slate-700/60 shadow-sm hover:shadow-md hover:border-slate-600/60 transition-all duration-200 backdrop-blur-sm',
        isDragging && 'opacity-50 shadow-lg ring-2 ring-primary-500/50',
        todo.completed && 'opacity-70'
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={18} />
        </button>

        <button
          onClick={() => onToggle(todo.id)}
          className={cn('mt-0.5 transition-all flex-shrink-0', todo.completed ? 'text-green-400' : 'text-slate-500 hover:text-green-400 hover:scale-110')}
        >
          {todo.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
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
                className="w-full px-2 py-1 text-sm border border-slate-600 rounded-lg bg-slate-700/50 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                autoFocus
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                rows={2}
                className="w-full px-2 py-1 text-xs border border-slate-600 rounded-lg bg-slate-700/50 text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
            </div>
          ) : (
            <div
              className="cursor-pointer"
              onClick={() => {
                setEditTitle(todo.title);
                setEditDescription(todo.description);
                setIsEditing(true);
              }}
            >
              <h3 className={cn('text-sm font-medium text-slate-200', todo.completed && 'line-through text-slate-500')}>
                {todo.title}
              </h3>
              {todo.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{todo.description}</p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', PRIORITY_COLORS[todo.priority as Priority])}>
              <AlertCircle size={10} className="mr-1" />
              {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
            </span>

            {category && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: category.color }}>
                {category.name}
              </span>
            )}

            {todo.dueDate && (
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', isOverdue(todo.dueDate) ? 'bg-red-900/30 text-red-400' : isDueToday(todo.dueDate) ? 'bg-yellow-900/30 text-yellow-400' : 'bg-slate-700/50 text-slate-400')}>
                <Calendar size={10} />
                {formatDate(todo.dueDate)}
              </span>
            )}

            {todo.subtasks.length > 0 && (
              <span className="text-xs text-slate-500">{completedSubtasks}/{todo.subtasks.length}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {todo.subtasks.length > 0 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <button
            onClick={() => onDelete(todo.id)}
            className="p-1 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && todo.subtasks.length > 0 && (
        <div className="px-4 pb-3 pl-14 space-y-1">
          {todo.subtasks.map((subtask) => (
            <SubtaskItem key={subtask.id} subtask={subtask} onToggle={() => onToggleSubtask(todo.id, subtask.id)} onDelete={() => onDeleteSubtask(todo.id, subtask.id)} />
          ))}
        </div>
      )}

      <div className="px-4 pb-3 pl-14">
        {showSubtaskInput ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={subtaskTitle}
              onChange={(e) => setSubtaskTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a subtask..."
              className="flex-1 px-2 py-1 text-xs border border-slate-600 rounded-lg bg-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
              autoFocus
            />
            <button onClick={handleAddSubtask} className="p-1 text-primary-400 hover:text-primary-300 transition-colors">
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowSubtaskInput(true)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-400 transition-colors"
          >
            <Plus size={12} />
            Add subtask
          </button>
        )}
      </div>
    </div>
  );
}
