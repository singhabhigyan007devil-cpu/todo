import { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Plus, Trash2, Presentation, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import type { Meeting, Todo } from '../types/todo';
import { cn } from '../lib/utils';

interface MeetingWorkspaceProps {
  meetings: Meeting[];
  todos: Todo[];
  onAddMeeting: (title: string, date: string, time: string, attendees: string, notes: string) => void;
  onUpdateMeeting: (id: string, updates: Partial<Meeting>) => void;
  onDeleteMeeting: (id: string) => void;
  onAddTodo: (title: string, description: string, priority: 'low' | 'medium' | 'high', categoryId: string | null, dueDate: number | null) => void;
  onLaunchPresentation: (title: string, notes: string) => void;
}

export function MeetingWorkspace({
  meetings,
  todos,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onAddTodo,
  onLaunchPresentation,
}: MeetingWorkspaceProps) {
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>('');
  
  // New Meeting form states
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00');
  const [newAttendees, setNewAttendees] = useState('');

  // Active meeting states
  const activeMeeting = meetings.find((m) => m.id === selectedMeetingId);

  // Set default selected meeting
  useEffect(() => {
    if (!selectedMeetingId && meetings.length > 0) {
      setSelectedMeetingId(meetings[0].id);
    }
  }, [meetings, selectedMeetingId]);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddMeeting(
      newTitle,
      newDate,
      newTime,
      newAttendees,
      "# Agenda\n- Discuss project requirements\n- Formulate timelines\n\n# Action Items\n- [ ] Assign development tasks\n- [ ] Establish compiler gates\n- [ ] Design high-fidelity layout assets"
    );

    setNewTitle('');
    setNewAttendees('');
    setIsCreating(false);
  };

  // Extract action items from notes (lines matching - [ ] or - [x])
  const getParsedActions = (notesText: string) => {
    if (!notesText) return [];
    const lines = notesText.split('\n');
    const actions: { text: string; completed: boolean; isSynced: boolean }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^-\s*\[\s*([xX ]?)\s*\]\s*(.*)$/);
      if (match) {
        const completed = match[1].trim().toLowerCase() === 'x';
        const text = match[2].trim();
        if (text) {
          // Check if this task is already synced in the global todo list
          const isSynced = todos.some((t) => t.title.toLowerCase() === text.toLowerCase());
          actions.push({ text, completed, isSynced });
        }
      }
    });

    return actions;
  };

  const activeActions = activeMeeting ? getParsedActions(activeMeeting.notes) : [];

  const handleSyncTask = (title: string) => {
    // Add task to main board
    onAddTodo(title, `Extracted from Meeting: ${activeMeeting?.title}`, 'medium', null, null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-scale-in">
      {/* Sidebar: Meetings Browser (col-span-4) */}
      <div className="lg:col-span-4 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[13px] font-bold uppercase tracking-wider text-[var(--muted-text)]">Scheduled Meetings</h4>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1.5 rounded-full bg-[var(--accent)] text-white hover:bg-[var(--accent-focus)] btn-pressable cursor-pointer"
            title="Create new meeting agenda"
          >
            <Plus size={14} />
          </button>
        </div>

        {isCreating ? (
          <form onSubmit={handleCreateMeeting} className="space-y-3 p-3 border border-[var(--border-color)]/60 rounded-xl bg-[var(--background)]/35 animate-slide-in">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="weekly sync, roadmap launch..."
                className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Attendees</label>
              <input
                type="text"
                value={newAttendees}
                onChange={(e) => setNewAttendees(e.target.value)}
                placeholder="Elena, Marcus, Devon"
                className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-1.5 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-lg transition-colors cursor-pointer"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-1.5 text-xs font-semibold text-[var(--foreground)] bg-black/5 dark:bg-white/5 border border-[var(--border-color)] hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
          {meetings.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[var(--border-color)]/40 rounded-xl">
              <p className="text-[12px] text-[var(--muted-text)]">No meetings scheduled.</p>
            </div>
          ) : (
            meetings.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMeetingId(m.id)}
                className={cn(
                  "p-3 rounded-xl border transition-all cursor-pointer flex justify-between items-center group",
                  m.id === selectedMeetingId
                    ? "bg-[var(--accent)]/10 border-[var(--accent)]/30 text-[var(--accent)]"
                    : "bg-black/5 dark:bg-white/5 border-[var(--border-color)]/60 text-[var(--foreground)] hover:border-[var(--border-color)]"
                )}
              >
                <div className="space-y-1 truncate pr-2">
                  <h5 className="text-[12px] font-bold truncate">{m.title}</h5>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--muted-text)]">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {m.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={10} />
                      {m.time}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMeeting(m.id);
                    if (selectedMeetingId === m.id) {
                      setSelectedMeetingId('');
                    }
                  }}
                  className="text-[var(--muted-text)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor & Action items board (col-span-8) */}
      <div className="lg:col-span-8 space-y-6">
        {activeMeeting ? (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-5 space-y-5">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[var(--border-color)]/30 pb-4 gap-3">
              <div className="space-y-1">
                <h3 className="text-[16px] font-bold text-[var(--foreground)]">{activeMeeting.title}</h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted-text)]">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {activeMeeting.date} at {activeMeeting.time}
                  </span>
                  {activeMeeting.attendees && (
                    <span className="flex items-center gap-1">
                      <Users size={13} />
                      {activeMeeting.attendees}
                    </span>
                  )}
                </div>
              </div>

              {/* PPT Launcher Button */}
              <button
                onClick={() => onLaunchPresentation(activeMeeting.title, activeMeeting.notes)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-full transition-colors cursor-pointer self-start md:self-auto"
              >
                <Presentation size={13} />
                <span>Run Presentation Slides</span>
              </button>
            </div>

            {/* Split notes and parse check columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Note Editor */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[var(--muted-text)] font-semibold">
                  <FileText size={13} />
                  <span className="text-[10px] uppercase tracking-wider">Minutes & Agendas</span>
                </div>
                <textarea
                  value={activeMeeting.notes}
                  onChange={(e) => onUpdateMeeting(activeMeeting.id, { notes: e.target.value })}
                  placeholder="Record meeting logs here..."
                  className="w-full h-80 text-xs p-3.5 border border-[var(--border-color)]/60 rounded-xl bg-[var(--background)]/35 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 resize-none font-mono"
                />
              </div>

              {/* Action Item parsing board */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[var(--muted-text)] font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-green-500" />
                    <span className="text-[10px] uppercase tracking-wider">Real-time Task Extractor</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--muted-text)] bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
                    {activeActions.length} actions
                  </span>
                </div>

                <div className="border border-[var(--border-color)]/60 rounded-xl p-4 h-80 bg-[var(--background)]/35 overflow-y-auto space-y-2.5">
                  {activeActions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-65 p-4">
                      <AlertCircle size={18} className="text-[var(--muted-text)]" />
                      <p className="text-[11px] text-[var(--muted-text)] max-w-[30ch] leading-relaxed">
                        No active checklist items found. Type <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">- [ ] task title</code> in your notes to parse one!
                      </p>
                    </div>
                  ) : (
                    activeActions.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2.5 bg-[var(--card-bg)] border border-[var(--border-color)]/50 rounded-xl transition-colors hover:border-[var(--border-color)]"
                      >
                        <div className="flex items-center gap-2 truncate">
                          {action.completed ? (
                            <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                          ) : (
                            <Circle size={13} className="text-[var(--muted-text)] flex-shrink-0" />
                          )}
                          <span className={cn(
                            "text-[11px] font-medium leading-normal truncate",
                            action.completed && "line-through text-[var(--muted-text)]"
                          )}>
                            {action.text}
                          </span>
                        </div>
                        {action.isSynced ? (
                          <span className="text-[9px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                            Synced
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSyncTask(action.text)}
                            className="text-[9px] font-bold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] px-2 py-0.5 rounded-full transition-colors cursor-pointer flex-shrink-0"
                          >
                            Sync to Board
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-20 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--background)]">
              <Users size={20} className="text-[var(--muted-text)]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[15px] font-bold text-[var(--foreground)]">No meeting selected</h4>
              <p className="text-[12px] text-[var(--muted-text)] max-w-sm mx-auto">
                Schedule a new meeting agenda or select an active session in the sidebar to review details and parse notes.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
