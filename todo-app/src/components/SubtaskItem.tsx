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
    <div className="flex items-center gap-2.5 group py-1.5 border-b border-[var(--border-color)]/20 last:border-b-0">
      <button 
        onClick={onToggle} 
        className={cn(
          'flex-shrink-0 transition-colors btn-pressable cursor-pointer', 
          subtask.completed ? 'text-[var(--accent)]' : 'text-[var(--muted-text)] hover:text-[var(--accent)]'
        )}
      >
        {subtask.completed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      </button>
      
      <span className={cn(
        'text-[13px] flex-1 font-normal tracking-tight-display transition-all duration-200', 
        subtask.completed ? 'line-through text-[var(--muted-text)]/60' : 'text-[var(--foreground)]'
      )}>
        {subtask.title}
      </span>
      
      <button 
        onClick={onDelete} 
        className="p-1 rounded-full text-[var(--muted-text)] hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all btn-pressable cursor-pointer"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
