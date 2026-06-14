import { useState, useRef, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BarChart3, ListTodo, ChevronDown, Target, ArrowLeft, Clock, Grid, List, Award, Users2, Sparkles, TrendingUp, Presentation, Palette, Heart, Database, Loader2 } from 'lucide-react';
import gsap from 'gsap';
import { useTodos } from './hooks/useTodos';
import { TodoItem } from './components/TodoItem';
import { TodoForm } from './components/TodoForm';
import { Sidebar } from './components/Sidebar';
import { StatsDashboard } from './components/StatsDashboard';
import { MotivationalQuote } from './components/MotivationalQuote';
import { TargetBoard } from './components/TargetBoard';
import { Confetti } from './components/Confetti';
import { LogoWall } from './components/LogoWall';
import { PomodoroTimer } from './components/PomodoroTimer';
import { EisenhowerMatrix } from './components/EisenhowerMatrix';
import { RoadmapPlanner } from './components/RoadmapPlanner';
import { MeetingWorkspace } from './components/MeetingWorkspace';
import { PresentationExporter } from './components/PresentationExporter';
import { CreativeWorkspace } from './components/CreativeWorkspace';
import { LifestyleWorkspace } from './components/LifestyleWorkspace';
import { cn } from './lib/utils';
import { supabase, getSupabaseKeys, updateSupabaseConfig, resetSupabaseConfig } from './lib/supabaseClient';
import type { User } from '@supabase/supabase-js';
import { AuthScreen } from './components/AuthScreen';

const HERO_WORDS = ['The', 'interface', 'for', 'clear', 'minds.'];

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [showAuthScreen, setShowAuthScreen] = useState(false);
  const [showImportPrompt, setShowImportPrompt] = useState(false);
  const [importing, setImporting] = useState(false);

  // DB credentials setup
  const keys = getSupabaseKeys();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configUrl, setConfigUrl] = useState(keys.url);
  const [configKey, setConfigKey] = useState(keys.key);

  const {
    todos, allTodos, categories, stats, isLoading, filter, selectedCategory, searchQuery, sortBy, sortOrder,
    userPersona, meetings, habits, inspirations,
    addTodo, updateTodo, deleteTodo, toggleTodo, addSubtask, toggleSubtask, deleteSubtask,
    reorderTodos, addCategory, deleteCategory, setFilter, setSelectedCategory, setSearchQuery,
    setSortBy, setSortOrder, setPersona, addMeeting, updateMeeting, deleteMeeting,
    addHabit, toggleHabitDay, deleteHabit, addInspiration, deleteInspiration,
    importLocalStorageData,
  } = useTodos(user);

  const [showStats, setShowStats] = useState(false);
  const [showTargetBoard, setShowTargetBoard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [workspaceActive, setWorkspaceActive] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'matrix' | 'roadmap' | 'meetings' | 'creative' | 'personal'>('list');
  
  // Slide Exporter states
  const [showExporter, setShowExporter] = useState(false);
  const [exporterTitle, setExporterTitle] = useState('');
  const [exporterNotes, setExporterNotes] = useState('');

  // View safety constraint effect
  useEffect(() => {
    if (userPersona === 'student' && viewMode !== 'list') {
      setViewMode('list');
    } else if (userPersona === 'professional' && !['list', 'matrix', 'roadmap'].includes(viewMode)) {
      setViewMode('list');
    } else if (userPersona === 'business' && !['list', 'matrix', 'roadmap', 'meetings'].includes(viewMode)) {
      setViewMode('list');
    } else if (userPersona === 'creative' && !['list', 'creative'].includes(viewMode)) {
      setViewMode('list');
    } else if (userPersona === 'personal' && !['list', 'personal'].includes(viewMode)) {
      setViewMode('list');
    }
  }, [userPersona, viewMode]);

  const prevCompletedRef = useRef(stats.completed);
  const landingHeroRef = useRef<HTMLDivElement>(null);
  const mainWorkspaceRef = useRef<HTMLDivElement>(null);

  // Hero animation refs
  const heroBadgeRef = useRef<HTMLSpanElement>(null);
  const heroWordRefs = useRef<HTMLSpanElement[]>([]);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const heroMeshRef = useRef<HTMLDivElement>(null);
  const heroScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // Initialize auth session and listen to state changes
  useEffect(() => {
    if (!supabase) {
      setAuthInitialized(true);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthInitialized(true);
      if (session?.user) {
        const localData = localStorage.getItem('todo-app-state-v2');
        if (localData) {
          setShowImportPrompt(true);
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const localData = localStorage.getItem('todo-app-state-v2');
        if (localData) {
          setShowImportPrompt(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleImportData = async () => {
    if (!user) return;
    setImporting(true);
    await importLocalStorageData(user.id);
    setImporting(false);
    setShowImportPrompt(false);
  };

  useEffect(() => {
    if (stats.completed > prevCompletedRef.current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    prevCompletedRef.current = stats.completed;
  }, [stats.completed]);

  useEffect(() => {
    if (!workspaceActive && landingHeroRef.current) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        // Mesh gradient entrance
        if (heroMeshRef.current) {
          tl.fromTo(heroMeshRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.4 }, 0);
          // Slow continuous rotation for mesh blobs
          gsap.to(heroMeshRef.current, { rotation: 360, duration: 80, repeat: -1, ease: 'none' });
        }

        // Badge
        if (heroBadgeRef.current) {
          tl.fromTo(heroBadgeRef.current, { y: 12, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.5 }, 0.3);
        }

        // Headline words stagger
        tl.fromTo(heroWordRefs.current, 
          { y: 40, opacity: 0, rotateX: 20, filter: 'blur(8px)' }, 
          { y: 0, opacity: 1, rotateX: 0, filter: 'blur(0px)', stagger: 0.1, duration: 0.7 }, 
          0.5
        );

        // Subtitle
        if (heroSubtitleRef.current) {
          tl.fromTo(heroSubtitleRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.1);
        }

        // CTA buttons
        if (heroCtaRef.current) {
          tl.fromTo(heroCtaRef.current, { y: 14, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, duration: 0.45 }, 1.3);
        }

        // Product preview card
        if (heroCardRef.current) {
          tl.fromTo(heroCardRef.current, { x: 40, opacity: 0, rotateY: 8 }, { x: 0, opacity: 1, rotateY: 0, duration: 0.7 }, 0.6);
        }

        // Scroll indicator
        if (heroScrollRef.current) {
          tl.fromTo(heroScrollRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.6);
        }

        // Word hover interactions
        heroWordRefs.current.forEach((el) => {
          if (!el) return;
          el.addEventListener('mouseenter', () => {
            gsap.to(el, { y: -3, color: 'var(--accent)', textShadow: '0 0 40px rgba(0,102,204,0.4)', duration: 0.25, ease: 'power2.out' });
          });
          el.addEventListener('mouseleave', () => {
            gsap.to(el, { y: 0, color: 'var(--foreground)', textShadow: 'none', duration: 0.35, ease: 'power2.inOut' });
          });
        });
      }, landingHeroRef);

      return () => ctx.revert();
    } else if (workspaceActive && mainWorkspaceRef.current) {
      gsap.fromTo(mainWorkspaceRef.current, 
        { opacity: 0, y: 25 }, 
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, [workspaceActive, authInitialized]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = [...todos];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    const allTodoIds = new Set(allTodos.map((t) => t.id));
    const reorderedWithRest = reordered.filter((t) => allTodoIds.has(t.id));
    const rest = allTodos.filter((t) => !reorderedWithRest.some((r) => r.id === t.id));
    reorderTodos([...reorderedWithRest, ...rest]);
  };

  const handleLaunchWorkspace = () => {
    if (!user && !guestMode) {
      setShowAuthScreen(true);
    } else {
      setWorkspaceActive(true);
    }
  };

  const sortOptions: { value: typeof sortBy; label: string }[] = [
    { value: 'order', label: 'Custom order' }, 
    { value: 'createdAt', label: 'Date created' },
    { value: 'dueDate', label: 'Due date' }, 
    { value: 'priority', label: 'Priority' }, 
    { value: 'title', label: 'Title' },
  ];

  if (!authInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#07090e]">
        <Loader2 size={40} className="text-[#2997ff] animate-spin" />
      </div>
    );
  }

  if (showAuthScreen && !user && !guestMode) {
    return (
      <AuthScreen
        onAuthSuccess={() => {
          setShowAuthScreen(false);
          setWorkspaceActive(true);
        }}
        onContinueAsGuest={() => {
          setGuestMode(true);
          setShowAuthScreen(false);
          setWorkspaceActive(true);
        }}
      />
    );
  }

  return (
    <>
      <Confetti active={showConfetti} />
      {showTargetBoard && <TargetBoard todos={allTodos} categories={categories} onClose={() => setShowTargetBoard(false)} />}
      {showExporter && (
        <PresentationExporter 
          todos={allTodos} 
          meetingTitle={exporterTitle} 
          meetingNotes={exporterNotes} 
          onClose={() => setShowExporter(false)} 
        />
      )}

      {/* Database Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 mx-4 border border-white/5 rounded-2xl bg-[#0c1017] text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Database className="text-amber-400" size={20} />
              Connect Supabase Database
            </h3>
            <p className="text-xs text-[#86868b] mt-2">
              Paste your Supabase credentials here. They will be saved in your browser's local storage for this project.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Supabase URL</label>
                <input
                  type="text"
                  value={configUrl}
                  onChange={(e) => setConfigUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full h-10 px-3 mt-1 rounded-xl border border-white/5 bg-[#141a24] text-xs focus:outline-none focus:border-[#2997ff]/50"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">Anon Public Key</label>
                <input
                  type="text"
                  value={configKey}
                  onChange={(e) => setConfigKey(e.target.value)}
                  placeholder="eyJhbGciOi..."
                  className="w-full h-10 px-3 mt-1 rounded-xl border border-white/5 bg-[#141a24] text-xs focus:outline-none focus:border-[#2997ff]/50"
                />
              </div>
            </div>
            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => {
                  if (updateSupabaseConfig(configUrl, configKey)) {
                    window.location.reload();
                  }
                }}
                className="flex-1 h-10 text-xs font-semibold text-white bg-[#2997ff] rounded-xl hover:bg-[#1a85ec] btn-pressable transition-all cursor-pointer"
              >
                Save Connection
              </button>
              <button
                onClick={() => {
                  resetSupabaseConfig();
                  window.location.reload();
                }}
                className="px-3 h-10 text-xs font-normal text-red-400 border border-red-950/20 bg-red-950/5 rounded-xl hover:bg-red-950/15 transition-all cursor-pointer"
                title="Reset to defaults"
              >
                Reset
              </button>
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 h-10 text-xs font-normal text-[#86868b] border border-white/5 bg-transparent rounded-xl hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Local Data Modal */}
      {showImportPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm p-6 mx-4 border border-white/5 rounded-2xl bg-[#0c1017] text-white text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#2997ff]/10 text-[#2997ff]">
              <Sparkles size={22} />
            </div>
            <h3 className="text-md font-bold">Import Local Tasks?</h3>
            <p className="text-xs text-[#86868b] mt-2 max-w-xs mx-auto">
              We detected existing tasks saved on this browser. Would you like to sync them to your cloud account?
            </p>
            <div className="flex flex-col gap-2 mt-6">
              <button
                onClick={handleImportData}
                disabled={importing}
                className="w-full h-10 text-xs font-semibold text-white bg-[#2997ff] rounded-xl hover:bg-[#1a85ec] disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {importing ? <Loader2 size={13} className="animate-spin" /> : null}
                <span>Import Tasks to Cloud</span>
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('todo-app-state-v2');
                  setShowImportPrompt(false);
                }}
                disabled={importing}
                className="w-full h-10 text-xs font-normal text-[#86868b] border border-white/5 bg-transparent rounded-xl hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                Keep Separated (Clear Local)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen pb-12 transition-colors duration-300">
        
        {/* Navigation Header */}
        <header className="sticky top-0 z-40 w-full frosted-nav border-b border-[var(--border-color)]/30 backdrop-blur-md">
          <div className="max-w-full mx-auto px-6 lg:px-12 h-14 flex items-center justify-between">
            <div 
              onClick={() => setWorkspaceActive(false)} 
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent)] text-white">
                <ListTodo size={16} />
              </div>
              <h1 className="text-lg font-semibold tracking-tight-display text-[var(--foreground)]">TaskFlow</h1>
            </div>

            <div className="flex items-center gap-2">
              {!keys.isEnv && (
                <button
                  onClick={() => setShowConfigModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-amber-400 bg-amber-950/10 border border-amber-900/20 rounded-full hover:bg-amber-950/20 btn-pressable transition-colors cursor-pointer"
                  title="Configure Supabase Database"
                >
                  <Database size={13} />
                  <span className="hidden sm:inline">DB Setup</span>
                </button>
              )}

              {user ? (
                <>
                  <span className="text-xs text-[var(--muted-text)] font-mono hidden md:inline max-w-[150px] truncate mr-2">
                    {user.email}
                  </span>
                  
                  {workspaceActive ? (
                    <>
                      <button 
                        onClick={() => setWorkspaceActive(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-[var(--foreground)] bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 btn-pressable transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        <span className="hidden sm:inline">Landing Page</span>
                      </button>
                      <button 
                        onClick={() => setShowTargetBoard(true)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-white bg-[var(--accent)] rounded-full hover:bg-[var(--accent-focus)] btn-pressable transition-colors cursor-pointer"
                      >
                        <Target size={13} />
                        <span>Target Board</span>
                      </button>
                      <button 
                        onClick={() => setShowStats(!showStats)} 
                        className={cn(
                          'p-2 rounded-full transition-all btn-pressable cursor-pointer', 
                          showStats ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--muted-text)] hover:bg-black/5 dark:hover:bg-white/5'
                        )} 
                        title="Statistics"
                      >
                        <BarChart3 size={18} />
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={handleLaunchWorkspace}
                      className="px-4 py-1.5 text-xs font-medium text-white bg-[var(--accent)] rounded-full hover:bg-[var(--accent-focus)] btn-pressable transition-colors cursor-pointer"
                    >
                      Launch App
                    </button>
                  )}

                  <button
                    onClick={async () => {
                      if (supabase) {
                        await supabase.auth.signOut();
                        setGuestMode(false);
                        setWorkspaceActive(false);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-normal text-red-400 bg-red-950/10 border border-red-900/20 rounded-full hover:bg-red-950/20 btn-pressable transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  {workspaceActive ? (
                    <>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                        Guest Mode
                      </span>
                      <button 
                        onClick={() => {
                          setGuestMode(false);
                          setWorkspaceActive(false);
                          setShowAuthScreen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-[#2997ff] bg-[#2997ff]/10 rounded-full hover:bg-[#2997ff]/20 btn-pressable transition-colors cursor-pointer"
                      >
                        Cloud Sync
                      </button>
                      <button 
                        onClick={() => setWorkspaceActive(false)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-[var(--foreground)] bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 btn-pressable transition-colors cursor-pointer"
                      >
                        <ArrowLeft size={13} />
                        <span className="hidden sm:inline">Landing Page</span>
                      </button>
                      <button 
                        onClick={() => setShowTargetBoard(true)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-normal text-white bg-[var(--accent)] rounded-full hover:bg-[var(--accent-focus)] btn-pressable transition-colors cursor-pointer"
                      >
                        <Target size={13} />
                        <span>Target Board</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => {
                          setGuestMode(false);
                          setShowAuthScreen(true);
                        }}
                        className="px-4 py-1.5 text-xs font-medium text-[var(--muted-text)] hover:text-white transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                      <button 
                        onClick={handleLaunchWorkspace}
                        className="px-4 py-1.5 text-xs font-medium text-white bg-[var(--accent)] rounded-full hover:bg-[var(--accent-focus)] btn-pressable transition-colors cursor-pointer"
                      >
                        Launch App
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Screen View */}
        {!workspaceActive ? (
          /* Public Marketing Landing Page */
          <div ref={landingHeroRef} className="space-y-16 mt-8">
            
            {/* Hero Section */}
            <section className="relative max-w-full mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 md:pt-16 overflow-hidden">
              
              {/* Mesh Gradient Blobs */}
              <div ref={heroMeshRef} className="absolute inset-0 pointer-events-none opacity-0" aria-hidden="true">
                <div className="mesh-blob absolute top-1/4 left-[10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-25" style={{ background: 'radial-gradient(circle, var(--accent), transparent)' }} />
                <div className="mesh-blob absolute bottom-1/4 right-[15%] w-[400px] h-[400px] rounded-full blur-[100px] opacity-20" style={{ background: 'radial-gradient(circle, #7928ca, transparent)' }} />
                <div className="mesh-blob absolute top-[60%] left-[40%] w-[350px] h-[350px] rounded-full blur-[90px] opacity-15" style={{ background: 'radial-gradient(circle, #50e3c2, transparent)' }} />
              </div>

              <div className="lg:col-span-7 space-y-5 relative z-10">
                <span 
                  ref={heroBadgeRef}
                  className="inline-block text-[11px] font-semibold uppercase tracking-wider text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full opacity-0"
                >
                  Minimalist Workspace
                </span>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight-hero leading-tight text-[var(--foreground)]" style={{ perspective: '600px' }}>
                  {HERO_WORDS.map((word, i) => (
                    <span
                      key={word}
                      ref={(el) => { if (el) heroWordRefs.current[i] = el; }}
                      className="inline-block mr-[0.3em] cursor-default opacity-0"
                      style={{ transformOrigin: 'bottom center' }}
                    >
                      {word}
                    </span>
                  ))}
                </h2>
                
                <p 
                  ref={heroSubtitleRef}
                  className="text-[17px] text-[var(--muted-text)] leading-relaxed max-w-[50ch] opacity-0"
                >
                  TaskFlow combines the Eisenhower priority matrix, intent-driven focus timers, and bento-grid analytics to clear your schedule and boost daily consistency.
                </p>
                
                <div ref={heroCtaRef} className="flex flex-wrap items-center gap-3 pt-2 opacity-0">
                  <button 
                    onClick={handleLaunchWorkspace}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-[var(--accent)] rounded-full hover:bg-[var(--accent-focus)] btn-pressable transition-colors cursor-pointer"
                  >
                    Launch Workspace
                  </button>
                  <a 
                    href="#features"
                    className="px-4 py-2.5 text-sm font-normal text-[var(--foreground)] bg-black/5 dark:bg-white/5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 btn-pressable transition-colors flex items-center gap-1"
                  >
                    Read Methodology
                  </a>
                </div>
              </div>
              
              {/* Product Preview Card */}
              <div 
                ref={heroCardRef}
                className="lg:col-span-5 bg-[var(--card-bg)] border border-[var(--border-color)] p-6 rounded-[24px] space-y-4 apple-product-shadow select-none card-3d float-3d relative z-10 opacity-0"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-color)]/30 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--muted-text)] font-semibold">Priority Board</span>
                </div>
                <div className="space-y-2.5">
                  <div className="p-3 bg-[var(--background)]/60 rounded-xl border border-[var(--border-color)]/30 flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border-2 border-red-500 flex-shrink-0" />
                    <div className="flex-1 h-3.5 bg-[var(--foreground)]/10 rounded-md w-3/4" />
                  </div>
                  <div className="p-3 bg-[var(--background)]/60 rounded-xl border border-[var(--border-color)]/30 flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex-shrink-0" />
                    <div className="flex-1 h-3.5 bg-[var(--foreground)]/10 rounded-md w-2/3" />
                  </div>
                  <div className="p-3 bg-[var(--background)]/60 rounded-xl border border-[var(--border-color)]/30 flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full border-2 border-green-500 flex-shrink-0" />
                    <div className="flex-1 h-3.5 bg-[var(--foreground)]/10 rounded-md w-1/2" />
                  </div>
                </div>
              </div>

              {/* Scroll indicator */}
              <div 
                ref={heroScrollRef}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0"
              >
                <span className="text-[10px] uppercase tracking-widest text-[var(--muted-text)] font-mono">Scroll</span>
                <div className="w-px h-8 bg-gradient-to-b from-[var(--muted-text)] to-transparent" />
              </div>
            </section>

            {/* Logo Wall component */}
            <LogoWall />

            {/* Corporate Stats and Impact Grid */}
            <section className="max-w-full mx-auto px-6 lg:px-12 pt-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 border border-[var(--border-color)]/60 rounded-[24px] bg-[var(--card-bg)]/20 backdrop-blur-sm">
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[var(--accent)] mb-1">
                    <TrendingUp size={18} />
                    <h4 className="text-3xl font-extrabold tracking-tight-display">4.8M+</h4>
                  </div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted-text)]">Focus Hours Logged</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[var(--accent)] mb-1">
                    <Sparkles size={18} />
                    <h4 className="text-3xl font-extrabold tracking-tight-display">99.4%</h4>
                  </div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted-text)]">Task Focus Peak</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[var(--accent)] mb-1">
                    <Users2 size={18} />
                    <h4 className="text-3xl font-extrabold tracking-tight-display">150k+</h4>
                  </div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted-text)]">Active Builders</p>
                </div>
                <div className="text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-[var(--accent)] mb-1">
                    <Award size={18} />
                    <h4 className="text-3xl font-extrabold tracking-tight-display">25h+</h4>
                  </div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-[var(--muted-text)]">Weekly Hours Saved</p>
                </div>
              </div>
            </section>

            {/* Corporate Integration Details (Case Studies/Use Cases) */}
            <section className="max-w-full mx-auto px-6 lg:px-12 space-y-8 pt-4">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Enterprise Success</span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight-display text-[var(--foreground)] mt-1">
                  How high-growth teams execute
                </h3>
                <p className="text-[14px] text-[var(--muted-text)] mt-1.5">
                  TaskFlow is integrated into the daily sprint layouts of lead engineers, designers, and managers worldwide.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="p-6 border border-[var(--border-color)]/60 rounded-[20px] bg-[var(--card-bg)] space-y-4 hover:border-[var(--accent)]/50 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <img src="https://cdn.simpleicons.org/stripe/2997ff" alt="Stripe" className="w-5 h-5 object-contain select-none opacity-85" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">Engineering at Stripe</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight-display">Backlog Optimization</h4>
                  <p className="text-[13px] text-[var(--muted-text)] leading-relaxed">
                    "Our developers map security releases to Q1 (Urgent/Important), schedule code audits to Q2, and run customizable Pomodoro focus blocks to target deep work intervals."
                  </p>
                </div>

                <div className="p-6 border border-[var(--border-color)]/60 rounded-[20px] bg-[var(--card-bg)] space-y-4 hover:border-[var(--accent)]/50 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <img src="https://cdn.simpleicons.org/figma/2997ff" alt="Figma" className="w-5 h-5 object-contain select-none opacity-85" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">Product Design at Figma</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight-display">Design Sprints & Time-boxing</h4>
                  <p className="text-[13px] text-[var(--muted-text)] leading-relaxed">
                    "Design systems teams time-box design reviews and component audits with focus alarms, monitoring streak metrics in their dashboards to hit product ship targets."
                  </p>
                </div>

                <div className="p-6 border border-[var(--border-color)]/60 rounded-[20px] bg-[var(--card-bg)] space-y-4 hover:border-[var(--accent)]/50 transition-all duration-300">
                  <div className="flex items-center gap-2">
                    <img src="https://cdn.simpleicons.org/airbnb/2997ff" alt="Airbnb" className="w-5 h-5 object-contain select-none opacity-85" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-text)]">Operations at Airbnb</span>
                  </div>
                  <h4 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight-display">Strategic Delegation</h4>
                  <p className="text-[13px] text-[var(--muted-text)] leading-relaxed">
                    "Using the Eisenhower quadrant split, team leads easily identify operational tasks to delegate in Q3 or eliminate completely in Q4, reducing administrative overhead by 20%."
                  </p>
                </div>
              </div>
            </section>

            {/* Features Bento Grid */}
            <section id="features" className="max-w-full mx-auto px-6 lg:px-12 space-y-8 pt-4">
              <div className="text-center max-w-xl mx-auto">
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight-display text-[var(--foreground)]">
                  Designed for execution
                </h3>
                <p className="text-[14px] text-[var(--muted-text)] mt-1.5">
                  Scientific methods paired with an elegant, responsive interface.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-6 rounded-[18px] flex flex-col justify-between h-56 transition-all hover:border-[var(--border-color)]">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight-display">Focus Timer</h4>
                    <p className="text-[13px] text-[var(--muted-text)] mt-1">
                      Target specific items with integrated Pomodoro sessions and custom Web Audio alarms.
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-6 rounded-[18px] flex flex-col justify-between h-56 transition-all hover:border-[var(--border-color)]">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Target size={16} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight-display">Eisenhower Method</h4>
                    <p className="text-[13px] text-[var(--muted-text)] mt-1">
                      Categorize targets dynamically into Urgent and Important quadrants to prevent clutter.
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--card-bg)] border border-[var(--border-color)]/60 p-6 rounded-[18px] flex flex-col justify-between h-56 transition-all hover:border-[var(--border-color)]">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-[var(--foreground)] tracking-tight-display">Bento Analytics</h4>
                    <p className="text-[13px] text-[var(--muted-text)] mt-1">
                      Monitor completion velocity, active streaks, and priority distributions in real-time.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials Grid */}
            <section className="max-w-full mx-auto px-6 lg:px-12 space-y-8 pt-4">
              <div className="text-center max-w-xl mx-auto">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Social Proof</span>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight-display text-[var(--foreground)] mt-1">
                  What builders are saying
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-5 border border-[var(--border-color)]/60 rounded-[18px] bg-[var(--card-bg)]/40 backdrop-blur-sm flex flex-col justify-between space-y-4">
                  <p className="text-[13px] italic text-[var(--muted-text)] leading-relaxed">
                    "TaskFlow completely simplified our engineering workflows. Keeping our backlog mapped to Eisenhower priority quadrants helped us ship our v2 product 3 weeks ahead of schedule."
                  </p>
                  <div>
                    <h5 className="text-[12px] font-bold text-[var(--foreground)]">Marcus Aurelius</h5>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-text)]">Senior Lead Engineer, Stripe</p>
                  </div>
                </div>

                <div className="p-5 border border-[var(--border-color)]/60 rounded-[18px] bg-[var(--card-bg)]/40 backdrop-blur-sm flex flex-col justify-between space-y-4">
                  <p className="text-[13px] italic text-[var(--muted-text)] leading-relaxed">
                    "I've tried every planner out there. TaskFlow's combination of local target timing and minimalist aesthetics is the only interface that keeps me focused for long stretches without clutter."
                  </p>
                  <div>
                    <h5 className="text-[12px] font-bold text-[var(--foreground)]">Elena Rostova</h5>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-text)]">Principal Designer, Airbnb</p>
                  </div>
                </div>

                <div className="p-5 border border-[var(--border-color)]/60 rounded-[18px] bg-[var(--card-bg)]/40 backdrop-blur-sm flex flex-col justify-between space-y-4">
                  <p className="text-[13px] italic text-[var(--muted-text)] leading-relaxed">
                    "Having custom Pomodoro controls embedded right alongside task lists has boosted our team's daily consistency by over 40%."
                  </p>
                  <div>
                    <h5 className="text-[12px] font-bold text-[var(--foreground)]">Devon Webb</h5>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[var(--muted-text)]">Product Manager, Linear</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Call to Action Footer CTA */}
            <section className="max-w-xl mx-auto px-6 text-center py-8">
              <h3 className="text-2xl font-bold tracking-tight-hero text-[var(--foreground)] mb-3">
                Experience intent-driven productivity.
              </h3>
              <button 
                onClick={handleLaunchWorkspace}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-[var(--accent)] rounded-full hover:bg-[var(--accent-focus)] btn-pressable transition-colors cursor-pointer"
              >
                Launch Workspace
              </button>
            </section>

          </div>
        ) : (
          /* Main Workspace Dashboard */
          <div ref={mainWorkspaceRef} className="max-w-full mx-auto px-6 lg:px-12 mt-8">
            <MotivationalQuote />

            {/* Stats section toggle */}
            {showStats && <div className="mb-8 mt-2"><StatsDashboard stats={stats} /></div>}

            <div className="flex flex-col lg:flex-row gap-8 items-start mt-6 w-full">
              
              {/* Left Column: Pomodoro & Workspace Navigation */}
              <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
                <PomodoroTimer todos={allTodos} />
                <Sidebar 
                  categories={categories} 
                  filter={filter} 
                  selectedCategory={selectedCategory} 
                  searchQuery={searchQuery} 
                  stats={stats} 
                  onFilterChange={setFilter} 
                  onCategorySelect={setSelectedCategory} 
                  onSearchChange={setSearchQuery} 
                  onAddCategory={addCategory} 
                  onDeleteCategory={deleteCategory} 
                  userPersona={userPersona}
                  onPersonaChange={setPersona}
                />
              </div>

              {/* Right Column: Board Workspace */}
              <main className="flex-1 min-w-0 w-full space-y-6">
                
                {/* Form entry */}
                <TodoForm categories={categories} onAdd={addTodo} />

                {/* Switch list controls */}
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-normal text-[var(--muted-text)]">
                    {todos.length} task{todos.length !== 1 ? 's' : ''}
                    {filter !== 'all' && ` (${filter})`}{selectedCategory && ` in category`}
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {/* View Switcher: List vs Matrix vs Roadmap vs Meetings */}
                    {/* View Switcher dynamically rendered per persona */}
                    {userPersona !== 'student' && (
                      <div className="flex items-center gap-1 border border-[var(--border-color)]/60 p-0.5 rounded-full bg-[var(--card-bg)]">
                        <button
                          onClick={() => setViewMode('list')}
                          className={cn(
                            'p-1.5 rounded-full transition-colors cursor-pointer btn-pressable',
                            viewMode === 'list' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                          )}
                          title="List View"
                        >
                          <List size={13} />
                        </button>

                        {['professional', 'business'].includes(userPersona) && (
                          <>
                            <button
                              onClick={() => setViewMode('matrix')}
                              className={cn(
                                'p-1.5 rounded-full transition-colors cursor-pointer btn-pressable',
                                viewMode === 'matrix' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                              )}
                              title="Eisenhower Matrix View"
                            >
                              <Grid size={13} />
                            </button>
                            <button
                              onClick={() => setViewMode('roadmap')}
                              className={cn(
                                'p-1.5 rounded-full transition-colors cursor-pointer btn-pressable',
                                viewMode === 'roadmap' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                              )}
                              title="Quarterly Project Roadmap"
                            >
                              <TrendingUp size={13} />
                            </button>
                          </>
                        )}

                        {userPersona === 'business' && (
                          <button
                            onClick={() => setViewMode('meetings')}
                            className={cn(
                              'p-1.5 rounded-full transition-colors cursor-pointer btn-pressable',
                              viewMode === 'meetings' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                            )}
                            title="Meeting Notes & Action Items"
                          >
                            <Presentation size={13} />
                          </button>
                        )}

                        {userPersona === 'creative' && (
                          <button
                            onClick={() => setViewMode('creative')}
                            className={cn(
                              'p-1.5 rounded-full transition-colors cursor-pointer btn-pressable',
                              viewMode === 'creative' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                            )}
                            title="Inspiration Moodboard"
                          >
                            <Palette size={13} />
                          </button>
                        )}

                        {userPersona === 'personal' && (
                          <button
                            onClick={() => setViewMode('personal')}
                            className={cn(
                              'p-1.5 rounded-full transition-colors cursor-pointer btn-pressable',
                              viewMode === 'personal' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted-text)] hover:text-[var(--foreground)]'
                            )}
                            title="Habits Tracker"
                          >
                            <Heart size={13} />
                          </button>
                        )}
                      </div>
                    )}

                    {/* Sorting option (list view only) */}
                    {viewMode === 'list' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[12px] font-normal text-[var(--muted-text)]">Sort:</span>
                        <select 
                          value={sortBy} 
                          onChange={(e) => setSortBy(e.target.value as typeof sortBy)} 
                          className="text-[12px] font-normal border border-[var(--border-color)] rounded-full bg-[var(--card-bg)] text-[var(--foreground)] px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 cursor-pointer"
                        >
                          {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                        </select>
                        <button 
                          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} 
                          className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[var(--muted-text)] hover:text-[var(--foreground)] transition-colors btn-pressable cursor-pointer" 
                          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                        >
                          <ChevronDown size={14} className={cn('transition-transform duration-250', sortOrder === 'desc' && 'rotate-180')} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Content Window */}
                {isLoading ? (
                  <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px] flex flex-col items-center justify-center">
                    <Loader2 size={36} className="text-[#2997ff] animate-spin mb-4" />
                    <h3 className="text-sm font-semibold tracking-tight text-white mb-1">Syncing with database...</h3>
                    <p className="text-xs text-[var(--muted-text)]">Retrieving your latest workspace setup.</p>
                  </div>
                ) : viewMode === 'list' ? (
                  /* Standard List view */
                  todos.length === 0 ? (
                    <div className="text-center py-20 bg-[var(--card-bg)] border border-[var(--border-color)]/60 rounded-[18px]">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--background)] mb-4">
                        <ListTodo size={22} className="text-[var(--muted-text)]" />
                      </div>
                      <h3 className="text-[17px] font-semibold tracking-tight-display text-[var(--foreground)] mb-1">No tasks yet</h3>
                      <p className="text-[14px] text-[var(--muted-text)] max-w-sm mx-auto">
                        {searchQuery ? 'Try a different search term' : filter === 'completed' ? 'No completed tasks yet' : filter === 'active' ? 'All tasks are completed!' : 'Add your first task above to get started.'}
                      </p>
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {todos.map((todo) => (
                            <TodoItem 
                              key={todo.id} 
                              todo={todo} 
                              categories={categories} 
                              onToggle={toggleTodo} 
                              onDelete={deleteTodo} 
                              onUpdate={updateTodo} 
                              onAddSubtask={addSubtask} 
                              onToggleSubtask={toggleSubtask} 
                              onDeleteSubtask={deleteSubtask} 
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  )
                ) : viewMode === 'matrix' ? (
                  /* Dynamic Eisenhower Quadrants */
                  <EisenhowerMatrix 
                    todos={todos} 
                    categories={categories} 
                    onToggle={toggleTodo} 
                    onDelete={deleteTodo} 
                  />
                ) : viewMode === 'roadmap' ? (
                  /* Quarterly Project Roadmap Timeline */
                  <RoadmapPlanner 
                    todos={allTodos} 
                    onUpdateTodo={updateTodo} 
                  />
                ) : viewMode === 'meetings' ? (
                  /* Meeting notes Action Item compiler workspace */
                  <MeetingWorkspace 
                    meetings={meetings} 
                    todos={allTodos} 
                    onAddMeeting={addMeeting} 
                    onUpdateMeeting={updateMeeting} 
                    onDeleteMeeting={deleteMeeting} 
                    onAddTodo={addTodo} 
                    onLaunchPresentation={(title, notes) => {
                      setExporterTitle(title);
                      setExporterNotes(notes);
                      setShowExporter(true);
                    }}
                  />
                ) : viewMode === 'creative' ? (
                  /* Creative Workspace Moodboard */
                  <CreativeWorkspace
                    inspirations={inspirations}
                    todos={allTodos}
                    onAddInspiration={addInspiration}
                    onDeleteInspiration={deleteInspiration}
                  />
                ) : (
                  /* Personal Workspace Habits tracker */
                  <LifestyleWorkspace
                    habits={habits}
                    onAddHabit={addHabit}
                    onToggleHabitDay={toggleHabitDay}
                    onDeleteHabit={deleteHabit}
                  />
                )}
              </main>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
