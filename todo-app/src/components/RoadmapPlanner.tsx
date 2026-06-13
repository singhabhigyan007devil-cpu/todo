import { useState } from 'react';
import { Map, Calendar, CheckCircle2, Circle, TrendingUp, Plus, Trash2 } from 'lucide-react';
import type { Todo, RoadmapPhase } from '../types/todo';
import { cn } from '../lib/utils';

interface RoadmapPlannerProps {
  todos: Todo[];
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
}

const PHASES: { id: RoadmapPhase; name: string; description: string; color: string }[] = [
  { id: 'q1', name: 'Q1: Strategy & Alignment', description: 'User research, specs definition, design approvals.', color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
  { id: 'q2', name: 'Q2: Design & Prototype', description: 'Wireframing, high-fidelity mockups, local sandboxing.', color: 'text-purple-400 border-purple-500/30 bg-purple-500/5' },
  { id: 'q3', name: 'Q3: Core Development', description: 'Database integrations, components build, logic testing.', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5' },
  { id: 'q4', name: 'Q4: Optimization & Ship', description: 'SEO adjustments, build compiles, server deploy.', color: 'text-green-400 border-green-500/30 bg-green-500/5' },
];

export function RoadmapPlanner({ todos, onUpdateTodo }: RoadmapPlannerProps) {
  const [selectedTodoMap, setSelectedTodoMap] = useState<Record<string, string>>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });

  const getPhaseTasks = (phase: RoadmapPhase) => {
    return todos.filter((t) => t.roadmapPhase === phase);
  };

  const getPhaseProgress = (phase: RoadmapPhase) => {
    const phaseTasks = getPhaseTasks(phase);
    if (phaseTasks.length === 0) return 0;
    const completed = phaseTasks.filter((t) => t.completed).length;
    return Math.round((completed / phaseTasks.length) * 100);
  };

  const unassignedTodos = todos.filter((t) => !t.roadmapPhase && !t.completed);

  const handleAssignTodo = (phase: RoadmapPhase) => {
    if (!phase) return;
    const todoId = selectedTodoMap[phase as string];
    if (!todoId) return;

    onUpdateTodo(todoId, { roadmapPhase: phase });
    setSelectedTodoMap((prev) => ({ ...prev, [phase as string]: '' }));
  };

  const handleRemoveFromRoadmap = (todoId: string) => {
    onUpdateTodo(todoId, { roadmapPhase: undefined });
  };

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Title & Introduction */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Map size={18} className="text-[var(--accent)]" />
            <h3 className="text-[17px] font-bold text-[var(--foreground)] tracking-tight-display">Quarterly Project Roadmap</h3>
          </div>
          <p className="text-[13px] text-[var(--muted-text)] leading-relaxed max-w-2xl">
            Map task items to quarterly timelines to coordinate goals, align sprints, and monitor progress metrics across major phases.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[var(--border-color)]/60 bg-[var(--background)]/35 text-[11px] text-[var(--muted-text)] font-semibold uppercase tracking-wider self-start md:self-auto">
          <Calendar size={13} className="text-[var(--accent)]" />
          <span>Active Timeline</span>
        </div>
      </div>

      {/* Main Roadmap Phase Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {PHASES.map((p) => {
          const phaseTasks = getPhaseTasks(p.id);
          const progress = getPhaseProgress(p.id);
          const completedCount = phaseTasks.filter((t) => t.completed).length;

          return (
            <div 
              key={p.id as string} 
              className={cn(
                "border rounded-[20px] p-5 flex flex-col justify-between space-y-4 transition-all hover:border-[var(--border-color)]/80 hover:shadow-lg dark:hover:shadow-black/30 card-3d",
                p.color
              )}
            >
              {/* Top Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[13px] font-bold uppercase tracking-wider text-[var(--foreground)]">{p.name}</h4>
                  <span className="text-[10px] font-bold text-[var(--muted-text)] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {completedCount}/{phaseTasks.length} items
                  </span>
                </div>
                <p className="text-[11px] text-[var(--muted-text)] leading-relaxed">{p.description}</p>
                
                {/* Progress bar */}
                {phaseTasks.length > 0 && (
                  <div className="space-y-1 pt-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-[var(--muted-text)]">Phase progress</span>
                      <span className="text-[var(--foreground)]">{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Task Items List */}
              <div className="flex-1 space-y-2 min-h-[120px] overflow-y-auto max-h-56 scrollbar-hide py-1">
                {phaseTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full border border-dashed border-[var(--border-color)]/40 rounded-xl p-4 text-center opacity-65">
                    <span className="text-[10px] text-[var(--muted-text)]">No tasks mapped</span>
                  </div>
                ) : (
                  phaseTasks.map((t) => (
                    <div 
                      key={t.id} 
                      className="group flex items-center justify-between gap-2 p-2 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-xl transition-colors hover:border-[var(--border-color)]"
                    >
                      <button 
                        onClick={() => onUpdateTodo(t.id, { completed: !t.completed })}
                        className="text-[var(--muted-text)] hover:text-[var(--accent)] transition-colors cursor-pointer flex-shrink-0"
                      >
                        {t.completed ? <CheckCircle2 size={13} className="text-green-500" /> : <Circle size={13} />}
                      </button>
                      <span className={cn(
                        "text-[11px] font-medium text-[var(--foreground)] truncate flex-1 leading-normal",
                        t.completed && "line-through text-[var(--muted-text)]"
                      )}>
                        {t.title}
                      </span>
                      <button 
                        onClick={() => handleRemoveFromRoadmap(t.id)}
                        className="text-[var(--muted-text)] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer flex-shrink-0"
                        title="Remove from Roadmap"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Assign selector */}
              <div className="pt-2 border-t border-[var(--border-color)]/30 space-y-2">
                <div className="flex gap-1.5">
                  <select
                    value={selectedTodoMap[p.id as string]}
                    onChange={(e) => setSelectedTodoMap((prev) => ({ ...prev, [p.id as string]: e.target.value }))}
                    className="flex-1 text-[10px] border border-[var(--border-color)]/60 rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] p-1 focus:outline-none cursor-pointer"
                  >
                    <option value="">Map active task...</option>
                    {unassignedTodos.map((ut) => (
                      <option key={ut.id} value={ut.id}>{ut.title}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignTodo(p.id)}
                    disabled={!selectedTodoMap[p.id as string]}
                    className="p-1 rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-focus)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Timeline Milestones */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-5 space-y-4">
        <h4 className="text-[13px] font-bold uppercase tracking-wider text-[var(--muted-text)] flex items-center gap-1.5">
          <TrendingUp size={14} className="text-[var(--accent)]" />
          <span>Timeline Milestones & Gates</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[var(--background)]/40 border border-[var(--border-color)]/50 rounded-xl space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-blue-400 font-bold">Milestone 1</span>
            <h5 className="text-[12px] font-bold text-[var(--foreground)]">Gate 1: Product Specifications</h5>
            <p className="text-[11px] text-[var(--muted-text)] leading-relaxed">Scope validation, feature outlines, and user alignment checklist.</p>
          </div>
          <div className="p-4 bg-[var(--background)]/40 border border-[var(--border-color)]/50 rounded-xl space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold">Milestone 2</span>
            <h5 className="text-[12px] font-bold text-[var(--foreground)]">Gate 2: MVP Interactive Build</h5>
            <p className="text-[11px] text-[var(--muted-text)] leading-relaxed">Frontend systems complete, core state logic working, database mapped.</p>
          </div>
          <div className="p-4 bg-[var(--background)]/40 border border-[var(--border-color)]/50 rounded-xl space-y-1">
            <span className="text-[9px] uppercase tracking-wider text-green-400 font-bold">Milestone 3</span>
            <h5 className="text-[12px] font-bold text-[var(--foreground)]">Gate 3: Production Rollout</h5>
            <p className="text-[11px] text-[var(--muted-text)] leading-relaxed">Compilation builds passed, search indexing ready, vercel deployment live.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
