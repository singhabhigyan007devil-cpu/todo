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
    <div className="flex items-center gap-2.5 group py-1.5 px-2 -mx-2 rounded-lg hover:bg-white/[0.03] transition-colors">
      <button 
        onClick={onToggle} 
        className={cn(
          'flex-shrink-0 transition-all duration-200 btn-pressable cursor-pointer relative', 
          subtask.completed 
            ? 'text-[var(--accent)]' 
            : 'text-white/25 hover:text-[var(--accent)]'
        )}
      >
        {subtask.completed && (
          <div className="absolute inset-0 rounded-full blur-sm opacity-60 bg-[var(--accent)]" />
        )}
        {subtask.completed ? <CheckCircle2 size={15} className="relative" /> : <Circle size={15} strokeWidth={1.5} className="relative" />}
      </button>
      <span className={cn(
        'text-[13px] flex-1 transition-colors',
        subtask.completed ? 'line-through text-white/20' : 'text-white/60 group-hover:text-white/80'
      )}>
        {subtask.title}
      </span>
      <button 
        onClick={onDelete} 
        className="p-0.5 text-white/15 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all btn-pressable cursor-pointer"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
