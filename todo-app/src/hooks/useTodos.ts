import { useMemo, useCallback, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { generateId } from '../lib/utils';
import type { User } from '@supabase/supabase-js';
import type { Todo, Category, Subtask, Priority, FilterType, TodoStats, AppState, UserPersona, Meeting, Habit, Inspiration } from '../types/todo';
import { DEFAULT_CATEGORIES } from '../types/todo';

export const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', name: 'Daily Hydration (8 glasses)', frequency: 'daily', streak: 0, completedDays: [], createdAt: Date.now() },
  { id: 'h2', name: '30-Minute Exercise', frequency: 'daily', streak: 0, completedDays: [], createdAt: Date.now() },
  { id: 'h3', name: 'Read 10 Pages of a Book', frequency: 'daily', streak: 0, completedDays: [], createdAt: Date.now() },
  { id: 'h4', name: 'Mindful Meditation', frequency: 'daily', streak: 0, completedDays: [], createdAt: Date.now() },
];

export const DEFAULT_INSPIRATIONS: Inspiration[] = [
  {
    id: 'i1',
    title: 'Clean Minimalist UI Style',
    type: 'image',
    content: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    notes: 'Reference layout for dark interface cards, glassmorphic filters, and neon-themed focus lines.',
    linkedTodoId: null,
    createdAt: Date.now()
  },
  {
    id: 'i2',
    title: 'Primary Accent Color Swatch',
    type: 'color',
    content: '#2997ff',
    notes: 'Premium Apple-inspired blue accent color. Use with HSL opacity modifiers for active states.',
    linkedTodoId: null,
    createdAt: Date.now()
  },
  {
    id: 'i3',
    title: 'Dieter Rams Quote',
    type: 'quote',
    content: 'Good design is as little design as possible. Less, but better – because it concentrates on the essential aspects.',
    notes: 'Core creative design methodology to follow across all features.',
    linkedTodoId: null,
    createdAt: Date.now()
  }
];

const initialState: AppState = {
  todos: [],
  categories: DEFAULT_CATEGORIES,
  filter: 'all',
  selectedCategory: null,
  searchQuery: '',
  sortBy: 'order',
  sortOrder: 'asc',
  userPersona: 'professional',
  meetings: [],
  habits: DEFAULT_HABITS,
  inspirations: DEFAULT_INSPIRATIONS,
};

export function useTodos(user: User | null) {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  // Sync state to localStorage ONLY when in guest mode (user is null)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('todo-app-state-v2', JSON.stringify(state));
    }
  }, [state, user]);

  // Fetch initial data (Supabase or LocalStorage) when user session changes
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!supabase || !user) {
        // Guest mode: load from localStorage
        const localDataStr = localStorage.getItem('todo-app-state-v2');
        if (localDataStr) {
          try {
            const parsed = JSON.parse(localDataStr);
            setState({
              ...initialState,
              ...parsed,
              // Keep default categories/habits/inspirations if not defined in local storage
              categories: parsed.categories?.length ? parsed.categories : DEFAULT_CATEGORIES,
              habits: parsed.habits?.length ? parsed.habits : DEFAULT_HABITS,
              inspirations: parsed.inspirations?.length ? parsed.inspirations : DEFAULT_INSPIRATIONS,
            });
          } catch (e) {
            console.error('Failed to parse local state', e);
            setState(initialState);
          }
        } else {
          setState(initialState);
        }
        return;
      }

      setIsLoading(true);
      try {
        // 1. Fetch categories
        const { data: categoriesData, error: catErr } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true });
        if (catErr) throw catErr;

        // 2. Fetch todos
        const { data: todosData, error: todoErr } = await supabase
          .from('todos')
          .select('*');
        if (todoErr) throw todoErr;

        // 3. Fetch meetings
        const { data: meetingsData, error: meetErr } = await supabase
          .from('meetings')
          .select('*');
        if (meetErr) throw meetErr;

        // 4. Fetch habits
        const { data: habitsData, error: habitErr } = await supabase
          .from('habits')
          .select('*');
        if (habitErr) throw habitErr;

        // 5. Fetch inspirations
        const { data: inspData, error: inspErr } = await supabase
          .from('inspirations')
          .select('*');
        if (inspErr) throw inspErr;

        // 6. Fetch user profile settings
        let { data: profileData, error: profErr } = await supabase
          .from('user_profiles')
          .select('*')
          .single();

        if (profErr && profErr.code === 'PGRST116') {
          // Profile doesn't exist, create default
          const { data: newProfile, error: createProfErr } = await supabase
            .from('user_profiles')
            .insert({ user_id: user.id, user_persona: 'professional', updated_at: Date.now() })
            .select()
            .single();
          if (createProfErr) console.error('Error creating profile:', createProfErr);
          else profileData = newProfile;
        } else if (profErr) {
          throw profErr;
        }

        if (!isMounted) return;

        // Map DB schema back to frontend models
        const mappedCategories: Category[] = (categoriesData || []).map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          createdAt: Number(c.created_at)
        }));

        // If categories empty, seed defaults
        if (mappedCategories.length === 0) {
          const seedCats = DEFAULT_CATEGORIES.map((c) => ({
            id: c.id,
            user_id: user.id,
            name: c.name,
            color: c.color,
            created_at: c.createdAt
          }));
          await supabase.from('categories').insert(seedCats);
          mappedCategories.push(...DEFAULT_CATEGORIES);
        }

        const mappedTodos: Todo[] = (todosData || []).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          completed: t.completed,
          priority: t.priority as Priority,
          categoryId: t.category_id,
          dueDate: t.due_date ? Number(t.due_date) : null,
          subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
          createdAt: Number(t.created_at),
          updatedAt: Number(t.updated_at),
          completedAt: t.completed_at ? Number(t.completed_at) : null,
          order: t.order_index,
          roadmapPhase: t.roadmap_phase as any
        }));

        const mappedMeetings: Meeting[] = (meetingsData || []).map((m) => ({
          id: m.id,
          title: m.title,
          date: m.date,
          time: m.time,
          attendees: m.attendees || '',
          notes: m.notes || '',
          meetingLink: m.meeting_link || '',
          createdAt: Number(m.created_at),
          pptxName: m.pptx_name || undefined,
          pptxText: m.pptx_text || undefined,
          minutes: m.minutes || undefined,
          extractedTasks: Array.isArray(m.extracted_tasks) ? m.extracted_tasks : undefined
        }));

        const mappedHabits: Habit[] = (habitsData || []).map((h) => ({
          id: h.id,
          name: h.name,
          frequency: h.frequency as any,
          streak: h.streak,
          completedDays: Array.isArray(h.completed_days) ? h.completed_days : [],
          createdAt: Number(h.created_at)
        }));

        const mappedInspirations: Inspiration[] = (inspData || []).map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type as any,
          content: i.content,
          notes: i.notes || '',
          linkedTodoId: i.linked_todo_id,
          createdAt: Number(i.created_at)
        }));

        setState((prev) => ({
          ...prev,
          todos: mappedTodos,
          categories: mappedCategories,
          meetings: mappedMeetings,
          habits: mappedHabits.length > 0 ? mappedHabits : DEFAULT_HABITS,
          inspirations: mappedInspirations.length > 0 ? mappedInspirations : DEFAULT_INSPIRATIONS,
          userPersona: (profileData?.user_persona || 'professional') as UserPersona
        }));

      } catch (e) {
        console.error('Error fetching data from Supabase:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Migrate localStorage data to Supabase
  const importLocalStorageData = useCallback(async (userId: string) => {
    if (!supabase) return false;

    const localDataStr = localStorage.getItem('todo-app-state-v2');
    if (!localDataStr) return false;

    try {
      const localData: AppState = JSON.parse(localDataStr);

      // Import categories
      if (localData.categories && localData.categories.length > 0) {
        const dbCategories = localData.categories.map((c) => ({
          id: c.id,
          user_id: userId,
          name: c.name,
          color: c.color,
          created_at: c.createdAt
        }));
        await supabase.from('categories').upsert(dbCategories);
      }

      // Import todos
      if (localData.todos && localData.todos.length > 0) {
        const dbTodos = localData.todos.map((t) => ({
          id: t.id,
          user_id: userId,
          title: t.title,
          description: t.description || '',
          completed: t.completed,
          priority: t.priority,
          category_id: t.categoryId,
          due_date: t.dueDate,
          subtasks: t.subtasks || [],
          created_at: t.createdAt,
          updated_at: t.updatedAt,
          completed_at: t.completedAt,
          order_index: t.order,
          roadmap_phase: t.roadmapPhase
        }));
        await supabase.from('todos').upsert(dbTodos);
      }

      // Import meetings
      if (localData.meetings && localData.meetings.length > 0) {
        const dbMeetings = localData.meetings.map((m) => ({
          id: m.id,
          user_id: userId,
          title: m.title,
          date: m.date,
          time: m.time,
          attendees: m.attendees || '',
          notes: m.notes || '',
          meeting_link: m.meetingLink || '',
          created_at: m.createdAt,
          pptx_name: m.pptxName || null,
          pptx_text: m.pptxText || null,
          minutes: m.minutes || null,
          extracted_tasks: m.extractedTasks || []
        }));
        await supabase.from('meetings').upsert(dbMeetings);
      }

      // Import habits
      if (localData.habits && localData.habits.length > 0) {
        const dbHabits = localData.habits.map((h) => ({
          id: h.id,
          user_id: userId,
          name: h.name,
          frequency: h.frequency,
          streak: h.streak,
          completed_days: h.completedDays || [],
          created_at: h.createdAt
        }));
        await supabase.from('habits').upsert(dbHabits);
      }

      // Import inspirations
      if (localData.inspirations && localData.inspirations.length > 0) {
        const dbInspirations = localData.inspirations.map((i) => ({
          id: i.id,
          user_id: userId,
          title: i.title,
          type: i.type,
          content: i.content,
          notes: i.notes || '',
          linked_todo_id: i.linkedTodoId,
          created_at: i.createdAt
        }));
        await supabase.from('inspirations').upsert(dbInspirations);
      }

      // Import profile settings
      if (localData.userPersona) {
        await supabase.from('user_profiles').upsert({
          user_id: userId,
          user_persona: localData.userPersona,
          updated_at: Date.now()
        });
      }

      // Clear local storage to prevent prompt loop
      localStorage.removeItem('todo-app-state-v2');
      
      // Force reload database data
      const { data: updatedTodos } = await supabase.from('todos').select('*');
      const { data: updatedCategories } = await supabase.from('categories').select('*').order('created_at', { ascending: true });
      const { data: updatedMeetings } = await supabase.from('meetings').select('*');
      const { data: updatedHabits } = await supabase.from('habits').select('*');
      const { data: updatedInspirations } = await supabase.from('inspirations').select('*');
      const { data: profile } = await supabase.from('user_profiles').select('*').single();

      setState((prev) => ({
        ...prev,
        todos: (updatedTodos || []).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          completed: t.completed,
          priority: t.priority as Priority,
          categoryId: t.category_id,
          dueDate: t.due_date ? Number(t.due_date) : null,
          subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
          createdAt: Number(t.created_at),
          updatedAt: Number(t.updated_at),
          completedAt: t.completed_at ? Number(t.completed_at) : null,
          order: t.order_index,
          roadmapPhase: t.roadmap_phase as any
        })),
        categories: (updatedCategories || []).map((c) => ({
          id: c.id,
          name: c.name,
          color: c.color,
          createdAt: Number(c.created_at)
        })),
        meetings: (updatedMeetings || []).map((m) => ({
          id: m.id,
          title: m.title,
          date: m.date,
          time: m.time,
          attendees: m.attendees || '',
          notes: m.notes || '',
          meetingLink: m.meeting_link || '',
          createdAt: Number(m.created_at),
          pptxName: m.pptx_name || undefined,
          pptxText: m.pptx_text || undefined,
          minutes: m.minutes || undefined,
          extractedTasks: Array.isArray(m.extracted_tasks) ? m.extracted_tasks : undefined
        })),
        habits: (updatedHabits || []).map((h) => ({
          id: h.id,
          name: h.name,
          frequency: h.frequency as any,
          streak: h.streak,
          completedDays: Array.isArray(h.completed_days) ? h.completed_days : [],
          createdAt: Number(h.created_at)
        })),
        inspirations: (updatedInspirations || []).map((i) => ({
          id: i.id,
          title: i.title,
          type: i.type as any,
          content: i.content,
          notes: i.notes || '',
          linkedTodoId: i.linked_todo_id,
          createdAt: Number(i.created_at)
        })),
        userPersona: (profile?.user_persona || 'professional') as UserPersona
      }));

      return true;
    } catch (error) {
      console.error('Error migrating data to Supabase:', error);
      return false;
    }
  }, []);

  const todos = state.todos;
  const categories = state.categories;
  const userPersona = state.userPersona || 'professional';
  const meetings = state.meetings || [];
  const habits = state.habits || DEFAULT_HABITS;
  const inspirations = state.inspirations || DEFAULT_INSPIRATIONS;

  const addTodo = useCallback((title: string, description: string, priority: Priority, categoryId: string | null, dueDate: number | null) => {
    const newTodo: Todo = {
      id: generateId(),
      title,
      description,
      completed: false,
      priority,
      categoryId,
      dueDate,
      subtasks: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      completedAt: null,
      order: todos.length,
    };
    setState((prev) => ({ ...prev, todos: [...prev.todos, newTodo] }));

    if (supabase && user) {
      supabase.from('todos').insert({
        id: newTodo.id,
        user_id: user.id,
        title: newTodo.title,
        description: newTodo.description,
        completed: newTodo.completed,
        priority: newTodo.priority,
        category_id: newTodo.categoryId,
        due_date: newTodo.dueDate,
        subtasks: newTodo.subtasks,
        created_at: newTodo.createdAt,
        updated_at: newTodo.updatedAt,
        completed_at: newTodo.completedAt,
        order_index: newTodo.order,
        roadmap_phase: newTodo.roadmapPhase
      }).then(({ error }) => {
        if (error) console.error('Error inserting todo to Supabase:', error);
      });
    }
  }, [todos.length, user]);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
      ),
    }));

    if (supabase && user) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
      if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
      if (updates.order !== undefined) dbUpdates.order_index = updates.order;
      if (updates.roadmapPhase !== undefined) dbUpdates.roadmap_phase = updates.roadmapPhase;
      dbUpdates.updated_at = Date.now();

      supabase.from('todos')
        .update(dbUpdates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error updating todo in Supabase:', error);
        });
    }
  }, [user]);

  const deleteTodo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.id !== id),
    }));

    if (supabase && user) {
      supabase.from('todos')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting todo from Supabase:', error);
        });
    }
  }, [user]);

  const toggleTodo = useCallback((id: string) => {
    let completedState = false;
    let completedAtTime: number | null = null;

    setState((prev) => {
      const updatedTodos = prev.todos.map((t) => {
        if (t.id === id) {
          completedState = !t.completed;
          completedAtTime = !t.completed ? Date.now() : null;
          return {
            ...t,
            completed: completedState,
            completedAt: completedAtTime,
            updatedAt: Date.now(),
          };
        }
        return t;
      });
      return { ...prev, todos: updatedTodos };
    });

    if (supabase && user) {
      supabase.from('todos')
        .update({
          completed: completedState,
          completed_at: completedAtTime,
          updated_at: Date.now()
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error toggling todo in Supabase:', error);
        });
    }
  }, [user]);

  const addSubtask = useCallback((todoId: string, title: string) => {
    const subtask: Subtask = {
      id: generateId(),
      title,
      completed: false,
      createdAt: Date.now(),
    };

    let updatedSubtasks: Subtask[] = [];
    setState((prev) => {
      const updated = prev.todos.map((t) => {
        if (t.id === todoId) {
          updatedSubtasks = [...t.subtasks, subtask];
          return { ...t, subtasks: updatedSubtasks, updatedAt: Date.now() };
        }
        return t;
      });
      return { ...prev, todos: updated };
    });

    if (supabase && user) {
      supabase.from('todos')
        .update({
          subtasks: updatedSubtasks,
          updated_at: Date.now()
        })
        .eq('id', todoId)
        .then(({ error }) => {
          if (error) console.error('Error adding subtask in Supabase:', error);
        });
    }
  }, [user]);

  const toggleSubtask = useCallback((todoId: string, subtaskId: string) => {
    let updatedSubtasks: Subtask[] = [];
    setState((prev) => {
      const updated = prev.todos.map((t) => {
        if (t.id === todoId) {
          updatedSubtasks = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          );
          return {
            ...t,
            subtasks: updatedSubtasks,
            updatedAt: Date.now(),
          };
        }
        return t;
      });
      return { ...prev, todos: updated };
    });

    if (supabase && user) {
      supabase.from('todos')
        .update({
          subtasks: updatedSubtasks,
          updated_at: Date.now()
        })
        .eq('id', todoId)
        .then(({ error }) => {
          if (error) console.error('Error toggling subtask in Supabase:', error);
        });
    }
  }, [user]);

  const deleteSubtask = useCallback((todoId: string, subtaskId: string) => {
    let updatedSubtasks: Subtask[] = [];
    setState((prev) => {
      const updated = prev.todos.map((t) => {
        if (t.id === todoId) {
          updatedSubtasks = t.subtasks.filter((s) => s.id !== subtaskId);
          return { ...t, subtasks: updatedSubtasks, updatedAt: Date.now() };
        }
        return t;
      });
      return { ...prev, todos: updated };
    });

    if (supabase && user) {
      supabase.from('todos')
        .update({
          subtasks: updatedSubtasks,
          updated_at: Date.now()
        })
        .eq('id', todoId)
        .then(({ error }) => {
          if (error) console.error('Error deleting subtask in Supabase:', error);
        });
    }
  }, [user]);

  const reorderTodos = useCallback((reorderedTodos: Todo[]) => {
    const updated = reorderedTodos.map((t, i) => ({ ...t, order: i }));
    setState((prev) => ({ ...prev, todos: updated }));

    if (supabase && user) {
      const dbRows = updated.map((t) => ({
        id: t.id,
        user_id: user.id,
        title: t.title,
        description: t.description || '',
        completed: t.completed,
        priority: t.priority,
        category_id: t.categoryId,
        due_date: t.dueDate,
        subtasks: t.subtasks,
        created_at: t.createdAt,
        updated_at: Date.now(),
        completed_at: t.completedAt,
        order_index: t.order,
        roadmap_phase: t.roadmapPhase
      }));

      supabase.from('todos')
        .upsert(dbRows)
        .then(({ error }) => {
          if (error) console.error('Error reordering todos in Supabase:', error);
        });
    }
  }, [user]);

  const addCategory = useCallback((name: string, color: string) => {
    const category: Category = {
      id: generateId(),
      name,
      color,
      createdAt: Date.now(),
    };
    setState((prev) => ({ ...prev, categories: [...prev.categories, category] }));

    if (supabase && user) {
      supabase.from('categories').insert({
        id: category.id,
        user_id: user.id,
        name: category.name,
        color: category.color,
        created_at: category.createdAt
      }).then(({ error }) => {
        if (error) console.error('Error inserting category to Supabase:', error);
      });
    }
  }, [user]);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      todos: prev.todos.map((t) =>
        t.categoryId === id ? { ...t, categoryId: null } : t
      ),
    }));

    if (supabase && user) {
      supabase.from('categories')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting category from Supabase:', error);
        });
    }
  }, [user]);

  const setFilter = useCallback((filter: FilterType) => {
    setState((prev) => ({ ...prev, filter }));
  }, []);

  const setSelectedCategory = useCallback((categoryId: string | null) => {
    setState((prev) => ({ ...prev, selectedCategory: categoryId }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setSortBy = useCallback((sortBy: AppState['sortBy']) => {
    setState((prev) => ({ ...prev, sortBy }));
  }, []);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    setState((prev) => ({ ...prev, sortOrder }));
  }, []);

  const filteredTodos = useMemo(() => {
    let result = [...todos];

    switch (state.filter) {
      case 'active':
        result = result.filter((t) => !t.completed);
        break;
      case 'completed':
        result = result.filter((t) => t.completed);
        break;
    }

    if (state.selectedCategory) {
      result = result.filter((t) => t.categoryId === state.selectedCategory);
    }

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q)
      );
    }

    if (state.sortBy === 'order' && state.sortOrder === 'asc') {
      result.sort((a, b) => a.order - b.order);
    } else {
      result.sort((a, b) => {
        let comparison = 0;
        switch (state.sortBy) {
          case 'createdAt':
            comparison = a.createdAt - b.createdAt;
            break;
          case 'dueDate':
            comparison = (a.dueDate || 0) - (b.dueDate || 0);
            break;
          case 'priority':
            const p = { high: 3, medium: 2, low: 1 };
            comparison = p[a.priority] - p[b.priority];
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
        }
        return state.sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [todos, state.filter, state.selectedCategory, state.searchQuery, state.sortBy, state.sortOrder]);

  const stats = useMemo((): TodoStats => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const active = total - completed;
    const overdue = todos.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < new Date(new Date().setHours(0, 0, 0, 0))).length;
    const dueToday = todos.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;

    const byPriority = {
      low: todos.filter((t) => t.priority === 'low').length,
      medium: todos.filter((t) => t.priority === 'medium').length,
      high: todos.filter((t) => t.priority === 'high').length,
    };

    const byCategory: Record<string, number> = {};
    categories.forEach((c) => {
      byCategory[c.id] = todos.filter((t) => t.categoryId === c.id).length;
    });
    byCategory['uncategorized'] = todos.filter((t) => !t.categoryId).length;

    const recentCompleted = todos
      .filter((t) => t.completedAt)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

    let streak = 0;
    if (recentCompleted.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkDate = new Date(today);
      for (let i = 0; i < 365; i++) {
        const dayStart = new Date(checkDate);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);
        const completedOnDay = recentCompleted.some((t) => {
          const ca = new Date(t.completedAt!);
          return ca >= dayStart && ca < dayEnd;
        });
        if (completedOnDay) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return {
      total,
      completed,
      active,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      overdue,
      dueToday,
      byPriority,
      byCategory,
      streak,
    };
  }, [todos, categories]);

  const setPersona = useCallback((userPersona: UserPersona) => {
    setState((prev) => ({ ...prev, userPersona }));

    if (supabase && user) {
      supabase.from('user_profiles')
        .upsert({
          user_id: user.id,
          user_persona: userPersona,
          updated_at: Date.now()
        })
        .then(({ error }) => {
          if (error) console.error('Error updating persona in Supabase:', error);
        });
    }
  }, [user]);

  const addMeeting = useCallback((title: string, date: string, time: string, attendees: string, notes: string, meetingLink: string = '') => {
    const newMeeting: Meeting = {
      id: generateId(),
      title,
      date,
      time,
      attendees,
      notes,
      meetingLink,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      meetings: [...(prev.meetings || []), newMeeting],
    }));

    if (supabase && user) {
      supabase.from('meetings').insert({
        id: newMeeting.id,
        user_id: user.id,
        title: newMeeting.title,
        date: newMeeting.date,
        time: newMeeting.time,
        attendees: newMeeting.attendees,
        notes: newMeeting.notes,
        meeting_link: newMeeting.meetingLink,
        created_at: newMeeting.createdAt
      }).then(({ error }) => {
        if (error) console.error('Error inserting meeting to Supabase:', error);
      });
    }
  }, [user]);

  const updateMeeting = useCallback((id: string, updates: Partial<Meeting>) => {
    setState((prev) => ({
      ...prev,
      meetings: (prev.meetings || []).map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));

    if (supabase && user) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.attendees !== undefined) dbUpdates.attendees = updates.attendees;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.meetingLink !== undefined) dbUpdates.meeting_link = updates.meetingLink;
      if (updates.pptxName !== undefined) dbUpdates.pptx_name = updates.pptxName;
      if (updates.pptxText !== undefined) dbUpdates.pptx_text = updates.pptxText;
      if (updates.minutes !== undefined) dbUpdates.minutes = updates.minutes;
      if (updates.extractedTasks !== undefined) dbUpdates.extracted_tasks = updates.extractedTasks;

      supabase.from('meetings')
        .update(dbUpdates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error updating meeting in Supabase:', error);
        });
    }
  }, [user]);

  const deleteMeeting = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      meetings: (prev.meetings || []).filter((m) => m.id !== id),
    }));

    if (supabase && user) {
      supabase.from('meetings')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting meeting from Supabase:', error);
        });
    }
  }, [user]);

  const addHabit = useCallback((name: string, frequency: 'daily' | 'weekly' = 'daily') => {
    const newHabit: Habit = {
      id: generateId(),
      name,
      frequency,
      streak: 0,
      completedDays: [],
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      habits: [...(prev.habits || DEFAULT_HABITS), newHabit],
    }));

    if (supabase && user) {
      supabase.from('habits').insert({
        id: newHabit.id,
        user_id: user.id,
        name: newHabit.name,
        frequency: newHabit.frequency,
        streak: newHabit.streak,
        completed_days: newHabit.completedDays,
        created_at: newHabit.createdAt
      }).then(({ error }) => {
        if (error) console.error('Error inserting habit to Supabase:', error);
      });
    }
  }, [user]);

  const toggleHabitDay = useCallback((id: string, dateStr: string) => {
    let updatedHabit: Habit | null = null;
    setState((prev) => {
      const currentHabits = prev.habits || DEFAULT_HABITS;
      const updated = currentHabits.map((h) => {
        if (h.id !== id) return h;
        const exists = h.completedDays.includes(dateStr);
        const newCompleted = exists
          ? h.completedDays.filter((d) => d !== dateStr)
          : [...h.completedDays, dateStr].sort();

        let streak = 0;
        const sortedCompleted = [...newCompleted].sort();
        if (sortedCompleted.length > 0) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let checkDate = new Date(today);
          const hasToday = sortedCompleted.includes(checkDate.toISOString().split('T')[0]);
          if (!hasToday) {
            checkDate.setDate(checkDate.getDate() - 1);
          }

          while (true) {
            const dateKey = checkDate.toISOString().split('T')[0];
            if (sortedCompleted.includes(dateKey)) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
        }

        updatedHabit = {
          ...h,
          completedDays: newCompleted,
          streak,
        };
        return updatedHabit;
      });
      return { ...prev, habits: updated };
    });

    if (supabase && user && updatedHabit) {
      const target: Habit = updatedHabit;
      supabase.from('habits')
        .update({
          completed_days: target.completedDays,
          streak: target.streak
        })
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error updating habit streak in Supabase:', error);
        });
    }
  }, [user]);

  const deleteHabit = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      habits: (prev.habits || DEFAULT_HABITS).filter((h) => h.id !== id),
    }));

    if (supabase && user) {
      supabase.from('habits')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting habit from Supabase:', error);
        });
    }
  }, [user]);

  const addInspiration = useCallback((title: string, type: 'image' | 'color' | 'quote' | 'link', content: string, notes: string, linkedTodoId: string | null = null) => {
    const newInspiration: Inspiration = {
      id: generateId(),
      title,
      type,
      content,
      notes,
      linkedTodoId,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      inspirations: [...(prev.inspirations || DEFAULT_INSPIRATIONS), newInspiration],
    }));

    if (supabase && user) {
      supabase.from('inspirations').insert({
        id: newInspiration.id,
        user_id: user.id,
        title: newInspiration.title,
        type: newInspiration.type,
        content: newInspiration.content,
        notes: newInspiration.notes,
        linked_todo_id: newInspiration.linkedTodoId,
        created_at: newInspiration.createdAt
      }).then(({ error }) => {
        if (error) console.error('Error inserting inspiration to Supabase:', error);
      });
    }
  }, [user]);

  const deleteInspiration = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      inspirations: (prev.inspirations || DEFAULT_INSPIRATIONS).filter((i) => i.id !== id),
    }));

    if (supabase && user) {
      supabase.from('inspirations')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting inspiration from Supabase:', error);
        });
    }
  }, [user]);

  const updateInspiration = useCallback((id: string, updates: Partial<Inspiration>) => {
    setState((prev) => ({
      ...prev,
      inspirations: (prev.inspirations || DEFAULT_INSPIRATIONS).map((i) =>
        i.id === id ? { ...i, ...updates } : i
      ),
    }));

    if (supabase && user) {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.linkedTodoId !== undefined) dbUpdates.linked_todo_id = updates.linkedTodoId;

      supabase.from('inspirations')
        .update(dbUpdates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Error updating inspiration in Supabase:', error);
        });
    }
  }, [user]);

  return {
    todos: filteredTodos,
    allTodos: todos,
    categories,
    stats,
    isLoading,
    filter: state.filter,
    selectedCategory: state.selectedCategory,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    userPersona,
    meetings,
    habits,
    inspirations,
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
    setPersona,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    addHabit,
    toggleHabitDay,
    deleteHabit,
    addInspiration,
    deleteInspiration,
    updateInspiration,
    importLocalStorageData,
  };
}