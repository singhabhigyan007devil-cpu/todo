import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Calendar, Users, FileText, Plus, Trash2, Presentation, Clock, 
  CheckCircle2, Circle, AlertCircle, Link2, ExternalLink, Copy, 
  Check, Upload, RefreshCw, Brain, Settings, AlertTriangle 
} from 'lucide-react';
import type { Meeting, Todo } from '../types/todo';
import { cn } from '../lib/utils';
import { extractTextFromPptx, generateMeetingIntelligence } from '../lib/pptxParser';

interface MeetingWorkspaceProps {
  meetings: Meeting[];
  todos: Todo[];
  onAddMeeting: (title: string, date: string, time: string, attendees: string, notes: string, meetingLink?: string) => void;
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
  const [linkCopied, setLinkCopied] = useState(false);
  const [localNotes, setLocalNotes] = useState<string>('');

  // New Meeting form states
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00');
  const [newAttendees, setNewAttendees] = useState('');
  const [newMeetingLink, setNewMeetingLink] = useState('');

  // Gemini API Key config state
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('taskflow-gemini-key') || '');
  const [showKeySetup, setShowKeySetup] = useState(false);

  const handleSaveKey = (val: string) => {
    setGeminiKey(val);
    localStorage.setItem('taskflow-gemini-key', val);
  };

  // PPTX extraction state
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [intelligenceTab, setIntelligenceTab] = useState<'minutes' | 'tasks' | 'slides'>('minutes');
  const [showSlidesContent, setShowSlidesContent] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active meeting - find directly from meetings array
  const activeMeeting = meetings.find((m) => m.id === selectedMeetingId);

  // Sync localNotes when meeting selection changes or meetings update externally
  useEffect(() => {
    if (activeMeeting) {
      setLocalNotes(activeMeeting.notes);
    }
  }, [selectedMeetingId, activeMeeting?.id, activeMeeting?.notes]);

  useEffect(() => {
    if (!selectedMeetingId && meetings.length > 0) {
      setSelectedMeetingId(meetings[0].id);
    }
  }, [meetings, selectedMeetingId]);

  // Parse actions directly from localNotes for real-time sync
  const activeActions = useMemo(() => {
    if (!localNotes) return [];
    const lines = localNotes.split('\n');
    const actions: { text: string; completed: boolean; isSynced: boolean }[] = [];

    lines.forEach((line) => {
      const match = line.match(/^-\s*\[\s*([xX ]?)\s*\]\s*(.*)$/);
      if (match) {
        const noteCompleted = match[1].trim().toLowerCase() === 'x';
        const text = match[2].trim();
        if (text) {
          const syncedTodo = todos.find((t) => t.title.toLowerCase() === text.toLowerCase());
          const isSynced = !!syncedTodo;
          const completed = isSynced ? syncedTodo!.completed : noteCompleted;
          actions.push({ text, completed, isSynced });
        }
      }
    });

    return actions;
  }, [localNotes, todos]);

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddMeeting(
      newTitle,
      newDate,
      newTime,
      newAttendees,
      "# Agenda\n- Discuss project requirements\n- Formulate timelines\n\n# Action Items\n- [ ] Assign development tasks\n- [ ] Establish compiler gates\n- [ ] Design high-fidelity layout assets",
      newMeetingLink
    );

    setNewTitle('');
    setNewAttendees('');
    setNewMeetingLink('');
    setIsCreating(false);
  };

  const handleSyncTask = (title: string) => {
    onAddTodo(title, `Extracted from Meeting: ${activeMeeting?.title}`, 'medium', null, null);
  };

  const handleCopyLink = () => {
    if (activeMeeting?.meetingLink) {
      navigator.clipboard.writeText(activeMeeting.meetingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleNotesChange = (value: string) => {
    setLocalNotes(value);
    if (activeMeeting) {
      onUpdateMeeting(activeMeeting.id, { notes: value });
    }
  };

  // PPTX File Upload and Extraction
  const handlePptxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeMeeting) return;

    setIsParsing(true);
    setParseError(null);

    try {
      // 1. Extract slides text
      const { pptxText, pptxName } = await extractTextFromPptx(file);
      
      // 2. Generate summary, minutes, agendas, and extract action tasks
      const intelligence = await generateMeetingIntelligence(activeMeeting.title, pptxText, geminiKey);
      
      // 3. Update meeting states
      onUpdateMeeting(activeMeeting.id, {
        pptxName,
        pptxText,
        minutes: intelligence.minutes,
        extractedTasks: intelligence.tasks
      });
      
      setIntelligenceTab('minutes');
    } catch (err: any) {
      console.error(err);
      setParseError(err.message || 'Failed to process presentation.');
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePptx = () => {
    if (!activeMeeting) return;
    onUpdateMeeting(activeMeeting.id, {
      pptxName: undefined,
      pptxText: undefined,
      minutes: undefined,
      extractedTasks: []
    });
  };

  const handleSyncExtractedTask = (taskId: string, title: string, priority: 'low' | 'medium' | 'high') => {
    if (!activeMeeting) return;
    
    // Add to main Todo Board
    onAddTodo(title, `Action item extracted from: ${activeMeeting.title} presentation`, priority, null, null);
    
    // Mark as synced locally
    const updatedTasks = (activeMeeting.extractedTasks || []).map(t => 
      t.id === taskId ? { ...t, synced: true } : t
    );
    onUpdateMeeting(activeMeeting.id, {
      extractedTasks: updatedTasks
    });
  };

  const handleSyncAllExtractedTasks = () => {
    if (!activeMeeting || !activeMeeting.extractedTasks) return;
    
    let count = 0;
    const updatedTasks = activeMeeting.extractedTasks.map(task => {
      if (!task.synced) {
        onAddTodo(task.title, `Action item extracted from: ${activeMeeting.title} presentation`, task.priority, null, null);
        count++;
        return { ...task, synced: true };
      }
      return task;
    });

    if (count > 0) {
      onUpdateMeeting(activeMeeting.id, {
        extractedTasks: updatedTasks
      });
    }
  };

  // Simple Markdown to HTML formatter for the report overview
  const renderMarkdown = (md?: string) => {
    if (!md) return null;
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h3 key={idx} className="text-sm font-bold text-white border-b border-white/10 pb-1 mt-4 mb-2">{line.replace('# ', '')}</h3>;
      }
      if (line.startsWith('## ')) {
        return <h4 key={idx} className="text-[13px] font-bold text-white/95 mt-3 mb-1.5">{line.replace('## ', '')}</h4>;
      }
      if (line.startsWith('### ')) {
        return <h5 key={idx} className="text-xs font-semibold text-white/80 mt-2 mb-1">{line.replace('### ', '')}</h5>;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return <li key={idx} className="text-[11px] text-[#86868b] ml-4 list-disc leading-relaxed mb-0.5">{line.substring(2)}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-1.5" />;
      }
      return <p key={idx} className="text-[11.5px] text-[#86868b] leading-relaxed mb-1">{line}</p>;
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-scale-in">
      
      {/* Sidebar: Meetings Browser & API Setup */}
      <div className="lg:col-span-4 space-y-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-5 space-y-4">
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

          {isCreating && (
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
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[var(--muted-text)]">Meeting Link</label>
                <input
                  type="url"
                  value={newMeetingLink}
                  onChange={(e) => setNewMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  className="w-full text-xs p-2 border border-[var(--border-color)]/60 rounded-lg bg-[var(--card-bg)] text-[var(--foreground)] placeholder-[var(--muted-text)]/40 focus:outline-none"
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
          )}

          {/* Scheduled meetings listing */}
          <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-hide">
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
                    className="text-[var(--muted-text)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex-shrink-0 animate-fadeIn"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Gemini API Key Configuration widget */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-4 space-y-3">
          <button 
            onClick={() => setShowKeySetup(!showKeySetup)}
            className="w-full flex items-center justify-between text-xs text-[#86868b] hover:text-white transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Brain size={13} className="text-[#2997ff]" />
              AI Intelligence setup
            </span>
            <Settings size={12} className={cn("transition-transform", showKeySetup && "rotate-45")} />
          </button>
          
          {showKeySetup && (
            <div className="space-y-2.5 pt-1.5 border-t border-white/5 animate-slide-in">
              <p className="text-[10.5px] text-[#86868b] leading-relaxed">
                Connect your Gemini Key to generate premium, context-rich notes and summaries. Leave empty to run the offline rule engine.
              </p>
              <div className="relative">
                <input
                  type="password"
                  value={geminiKey}
                  onChange={(e) => handleSaveKey(e.target.value)}
                  placeholder="Paste Gemini API Key..."
                  className="w-full h-8 px-2.5 rounded-lg border border-white/5 bg-[#141a24] text-[11px] text-white placeholder-white/20 focus:outline-none focus:border-[#2997ff]/40"
                />
              </div>
              {geminiKey ? (
                <span className="text-[10px] text-green-400 flex items-center gap-1">
                  <Check size={10} />
                  Gemini API Connected
                </span>
              ) : (
                <span className="text-[10px] text-amber-400 flex items-center gap-1">
                  <AlertTriangle size={10} />
                  Offline Heuristics Enabled
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor, Task Extractor, & PPTX Intelligence */}
      <div className="lg:col-span-8 space-y-4">
        {activeMeeting ? (
          <>
            {/* Meeting Link Taskbar */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-2xl p-3 flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex-shrink-0">
                  <Link2 size={14} className="text-[var(--accent)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <input
                    type="url"
                    value={activeMeeting.meetingLink || ''}
                    onChange={(e) => onUpdateMeeting(activeMeeting.id, { meetingLink: e.target.value })}
                    placeholder="Paste meeting link (Google Meet, Zoom, Teams...)"
                    className="w-full text-[13px] bg-transparent text-[var(--foreground)] placeholder-[var(--muted-text)]/40 focus:outline-none truncate"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {activeMeeting.meetingLink && (
                  <>
                    <button
                      onClick={handleCopyLink}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-xl transition-all btn-pressable cursor-pointer",
                        linkCopied 
                          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                          : "bg-white/5 text-white/50 border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/70"
                      )}
                    >
                      {linkCopied ? <Check size={12} /> : <Copy size={12} />}
                      {linkCopied ? 'Copied' : 'Copy'}
                    </button>
                    <a
                      href={activeMeeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-xl transition-colors cursor-pointer"
                    >
                      <ExternalLink size={12} />
                      Join
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Main meeting content (Notes and Checklist extraction) */}
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

                <button
                  onClick={() => onLaunchPresentation(activeMeeting.title, localNotes)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[var(--accent)] hover:bg-[var(--accent-focus)] rounded-full transition-colors cursor-pointer self-start md:self-auto btn-pressable"
                >
                  <Presentation size={13} />
                  <span>Run Presentation Slides</span>
                </button>
              </div>

              {/* Notes and action items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Note Editor */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[var(--muted-text)] font-semibold">
                    <FileText size={13} />
                    <span className="text-[10px] uppercase tracking-wider">Minutes & Agendas</span>
                  </div>
                  <textarea
                    value={localNotes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Record meeting logs here...&#10;&#10;Use - [ ] task name to create actionable items"
                    className="w-full h-72 text-xs p-3.5 border border-[var(--border-color)]/60 rounded-xl bg-[var(--background)]/35 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/30 resize-none font-mono"
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

                  <div className="border border-[var(--border-color)]/60 rounded-xl p-4 h-72 bg-[var(--background)]/35 overflow-y-auto space-y-2.5">
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
                          key={`${action.text}-${idx}`}
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

            {/* AI PRESENTATION INTELLIGENCE DASHBOARD */}
            <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-3">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                  <Brain size={14} className="text-[#2997ff]" />
                  AI Presentation Intelligence (PPTX)
                </span>
                
                {activeMeeting.pptxName && (
                  <div className="flex items-center gap-2 text-xs text-[var(--muted-text)]">
                    <span className="font-mono text-[10.5px] truncate max-w-[180px] bg-white/[0.04] px-2.5 py-1 border border-white/5 rounded-lg">
                      {activeMeeting.pptxName}
                    </span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors cursor-pointer"
                      title="Re-upload and analyze presentation"
                    >
                      <RefreshCw size={12} />
                    </button>
                    <button
                      onClick={handleRemovePptx}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                      title="Remove presentation details"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {parseError && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-900/10 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Upload presentation state */}
              {!activeMeeting.pptxName && !isParsing && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/[0.02] hover:border-[#2997ff]/30 transition-all duration-300 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePptxUpload}
                    accept=".pptx"
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-[#2997ff]/5 text-[#2997ff] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload size={18} />
                  </div>
                  <h5 className="text-[12.5px] font-semibold text-white">Upload PPTX Presentation</h5>
                  <p className="text-[10.5px] text-[#86868b] mt-1 max-w-[280px]">
                    Drag or click to analyze slides. We'll parse the text content to automatically synthesize agendas, minutes, and task checklists.
                  </p>
                </div>
              )}

              {/* Parsing spinner */}
              {isParsing && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <RefreshCw size={28} className="text-[#2997ff] animate-spin mb-3" />
                  <h5 className="text-xs font-semibold text-white">Parsing and analyzing presentation...</h5>
                  <p className="text-[10px] text-[#86868b] mt-0.5">Extracting slides structures and generating agendas.</p>
                </div>
              )}

              {/* Extracted Intelligence Details Dashboard */}
              {activeMeeting.pptxName && !isParsing && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* Dashboard Tab Buttons */}
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <button
                      onClick={() => setIntelligenceTab('minutes')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                        intelligenceTab === 'minutes' 
                          ? "bg-[#2997ff]/10 text-[#2997ff]" 
                          : "text-[#86868b] hover:text-white"
                      )}
                    >
                      Minutes & Agendas
                    </button>
                    <button
                      onClick={() => setIntelligenceTab('tasks')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5",
                        intelligenceTab === 'tasks' 
                          ? "bg-[#2997ff]/10 text-[#2997ff]" 
                          : "text-[#86868b] hover:text-white"
                      )}
                    >
                      Extracted Tasks
                      {(activeMeeting.extractedTasks || []).filter(t => !t.synced).length > 0 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      )}
                    </button>
                    <button
                      onClick={() => setIntelligenceTab('slides')}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                        intelligenceTab === 'slides' 
                          ? "bg-[#2997ff]/10 text-[#2997ff]" 
                          : "text-[#86868b] hover:text-white"
                      )}
                    >
                      Raw Slides Text
                    </button>
                  </div>

                  {/* Tab Contents: Minutes */}
                  {intelligenceTab === 'minutes' && (
                    <div className="p-4 border border-white/5 rounded-xl bg-white/[0.01] max-h-72 overflow-y-auto space-y-2 scrollbar-hide font-sans">
                      {activeMeeting.minutes ? (
                        renderMarkdown(activeMeeting.minutes)
                      ) : (
                        <p className="text-xs text-[#86868b] italic">No structured minutes generated.</p>
                      )}
                    </div>
                  )}

                  {/* Tab Contents: Tasks */}
                  {intelligenceTab === 'tasks' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10.5px] text-[#86868b]">
                        <span>We parsed slides bullet items to extract these action checklists.</span>
                        {(activeMeeting.extractedTasks || []).some(t => !t.synced) && (
                          <button
                            onClick={handleSyncAllExtractedTasks}
                            className="text-[#2997ff] hover:underline font-bold cursor-pointer"
                          >
                            Sync all items to Board
                          </button>
                        )}
                      </div>

                      <div className="border border-white/5 rounded-xl p-3.5 bg-white/[0.01] max-h-72 overflow-y-auto space-y-2 scrollbar-hide">
                        {(!activeMeeting.extractedTasks || activeMeeting.extractedTasks.length === 0) ? (
                          <div className="text-center py-6 opacity-65 flex flex-col items-center justify-center gap-1.5">
                            <AlertCircle size={15} />
                            <p className="text-[10.5px] text-[#86868b]">No actionable tasks could be extracted from these slides.</p>
                          </div>
                        ) : (
                          activeMeeting.extractedTasks.map((task) => (
                            <div 
                              key={task.id}
                              className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-white/5 bg-[#0f141c]/55 hover:border-white/10 transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {task.synced ? (
                                  <CheckCircle2 size={13} className="text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle size={13} className="text-white/20 flex-shrink-0" />
                                )}
                                <span className={cn(
                                  "text-[11.5px] font-medium leading-normal truncate text-white/90",
                                  task.synced && "line-through text-[#86868b]"
                                )}>
                                  {task.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={cn(
                                  "text-[8.5px] uppercase tracking-wide font-bold px-1.5 py-0.5 rounded border",
                                  task.priority === 'high' && "bg-red-500/10 text-red-400 border-red-500/20",
                                  task.priority === 'medium' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                                  task.priority === 'low' && "bg-green-500/10 text-green-400 border-green-500/20"
                                )}>
                                  {task.priority}
                                </span>
                                
                                {task.synced ? (
                                  <span className="text-[9.5px] font-bold text-green-500 bg-green-500/10 px-2.5 py-0.5 border border-green-500/20 rounded-lg">
                                    Synced
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSyncExtractedTask(task.id, task.title, task.priority)}
                                    className="text-[9.5px] font-bold text-white bg-[#2997ff] hover:bg-[#1a85ec] px-2.5 py-0.5 rounded-lg transition-colors cursor-pointer btn-pressable"
                                  >
                                    Sync
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab Contents: Raw Slides Text */}
                  {intelligenceTab === 'slides' && (
                    <div className="space-y-2.5">
                      <button
                        onClick={() => setShowSlidesContent(!showSlidesContent)}
                        className="text-[11px] text-[#2997ff] hover:underline cursor-pointer"
                      >
                        {showSlidesContent ? 'Collapse raw slides contents' : 'Review slide-by-slide parsed text'}
                      </button>

                      {showSlidesContent && (
                        <div className="p-4 border border-white/5 rounded-xl bg-black/40 text-[11px] text-[#86868b] leading-relaxed max-h-72 overflow-y-auto scrollbar-hide font-mono whitespace-pre-wrap animate-slide-in">
                          {activeMeeting.pptxText || 'No text found.'}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </>
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
