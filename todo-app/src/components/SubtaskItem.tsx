import { CheckCircle2, Circle, Trash2 } from 'lucide-react';
import type { Subtask } from '../types/todo';
import { cn } from '../lib/utils';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
  onDelete: () => void;
}

export function SubtaskItem({ subtask, onToggle, onDelete }: SubtaskItemProps) {
  return (
    <div className="flex items-center gap-2 group py-0.5">
      <button
        onClick={onToggle}
        className={cn('flex-shrink-0 transition-colors', subtask.completed ? 'text-green-400' : 'text-slate-500 hover:text-green-400')}
      >
        {subtask.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      </button>
      <span className={cn('text-xs flex-1', subtask.completed ? 'line-through text-slate-500' : 'text-slate-300')}>
        {subtask.title}
      </span>
      <button onClick={onDelete} className="p-0.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
