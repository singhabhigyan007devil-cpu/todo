import { useState, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { BarChart3, ListTodo, ChevronDown, Target } from 'lucide-react';
import gsap from 'gsap';
import { useTodos } from './hooks/useTodos';
import { TodoItem } from './components/TodoItem';
import { TodoForm } from './components/TodoForm';
import { Sidebar } from './components/Sidebar';
import { StatsDashboard } from './components/StatsDashboard';
import { MotivationalQuote } from './components/MotivationalQuote';
import { TargetBoard } from './components/TargetBoard';
import { Confetti } from './components/Confetti';
import { cn } from './lib/utils';

function App() {
  const {
    todos,
    allTodos,
    categories,
    stats,
    filter,
    selectedCategory,
    searchQuery,
    sortBy,
    sortOrder,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    reorderTodos,
    addCategory,
    deleteCategory,
    setFilter,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    setSortOrder,
  } = useTodos();

  const [showStats, setShowStats] = useState(false);
  const [showTargetBoard, setShowTargetBoard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const prevCompletedRef = useRef(stats.completed);
  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stats.completed > prevCompletedRef.current) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }
    prevCompletedRef.current = stats.completed;
  }, [stats.completed]);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' });
    }
    if (mainRef.current) {
      gsap.fromTo(mainRef.current, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' });
    }
  }, []);

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
    const final = [...reorderedWithRest, ...rest];

    reorderTodos(final);
  };

  const sortOptions: { value: typeof sortBy; label: string }[] = [
    { value: 'order', label: 'Custom order' },
    { value: 'createdAt', label: 'Date created' },
    { value: 'dueDate', label: 'Due date' },
    { value: 'priority', label: 'Priority' },
    { value: 'title', label: 'Title' },
  ];

  return (
    <>
      <Confetti active={showConfetti} />

      {showTargetBoard && (
        <TargetBoard todos={allTodos} categories={categories} onClose={() => setShowTargetBoard(false)} />
      )}

      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <header ref={headerRef} className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl shadow-lg shadow-primary-500/20">
                <ListTodo size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-100">Focus Board</h1>
                <p className="text-xs sm:text-sm text-slate-400">{stats.active} active task{stats.active !== 1 ? 's' : ''} remaining</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTargetBoard(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-500 hover:to-primary-400 transition-all shadow-lg shadow-primary-500/20"
              >
                <Target size={16} />
                <span className="hidden sm:inline">Target Board</span>
              </button>
              <button
                onClick={() => setShowStats(!showStats)}
                className={cn('p-2 rounded-xl transition-all', showStats ? 'bg-primary-500/10 text-primary-400' : 'text-slate-400 hover:bg-slate-800/50')}
                title="Statistics"
              >
                <BarChart3 size={20} />
              </button>
            </div>
          </header>

          <MotivationalQuote />

          {showStats && (
            <div className="mb-6 animate-scale-in">
              <StatsDashboard stats={stats} />
            </div>
          )}

          <div ref={mainRef} className="flex flex-col lg:flex-row gap-6">
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
            />

            <main className="flex-1 min-w-0">
              <div className="space-y-4">
                <TodoForm categories={categories} onAdd={addTodo} />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    {todos.length} task{todos.length !== 1 ? 's' : ''}
                    {filter !== 'all' && ` (${filter})`}
                    {selectedCategory && ` in selected category`}
                  </p>

                  <div className="flex items-center gap-1">
                    <label className="text-xs text-slate-500">Sort by:</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="text-xs border border-slate-700/60 rounded-xl bg-slate-800/50 text-slate-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500/50"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                      title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    >
                      <ChevronDown size={16} className={cn('transition-transform', sortOrder === 'desc' && 'rotate-180')} />
                    </button>
                  </div>
                </div>

                {todos.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 mb-4">
                      <ListTodo size={32} className="text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-400 mb-1">No tasks yet</h3>
                    <p className="text-sm text-slate-500">
                      {searchQuery
                        ? 'Try a different search term'
                        : filter === 'completed'
                        ? 'No completed tasks yet'
                        : filter === 'active'
                        ? 'All tasks are completed!'
                        : 'Add your first task above and start crushing goals'}
                    </p>
                  </div>
                ) : (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-2">
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
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
