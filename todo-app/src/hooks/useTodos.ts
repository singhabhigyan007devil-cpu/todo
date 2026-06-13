import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../lib/utils';
import type { Todo, Category, Subtask, Priority, FilterType, TodoStats, AppState } from '../types/todo';
import { DEFAULT_CATEGORIES } from '../types/todo';

const initialState: AppState = {
  todos: [],
  categories: DEFAULT_CATEGORIES,
  filter: 'all',
  selectedCategory: null,
  searchQuery: '',
  sortBy: 'order',
  sortOrder: 'asc',
};

export function useTodos() {
  const [state, setState] = useLocalStorage<AppState>('todo-app-state', initialState);

  const todos = state.todos;
  const categories = state.categories;

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
  }, [todos.length, setState]);

  const updateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t
      ),
    }));
  }, [setState]);

  const deleteTodo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.filter((t) => t.id !== id),
    }));
  }, [setState]);

  const toggleTodo = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === id
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? Date.now() : null,
              updatedAt: Date.now(),
            }
          : t
      ),
    }));
  }, [setState]);

  const addSubtask = useCallback((todoId: string, title: string) => {
    const subtask: Subtask = {
      id: generateId(),
      title,
      completed: false,
      createdAt: Date.now(),
    };
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: [...t.subtasks, subtask], updatedAt: Date.now() }
          : t
      ),
    }));
  }, [setState]);

  const toggleSubtask = useCallback((todoId: string, subtaskId: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === todoId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
              updatedAt: Date.now(),
            }
          : t
      ),
    }));
  }, [setState]);

  const deleteSubtask = useCallback((todoId: string, subtaskId: string) => {
    setState((prev) => ({
      ...prev,
      todos: prev.todos.map((t) =>
        t.id === todoId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId), updatedAt: Date.now() }
          : t
      ),
    }));
  }, [setState]);

  const reorderTodos = useCallback((reorderedTodos: Todo[]) => {
    setState((prev) => ({
      ...prev,
      todos: reorderedTodos.map((t, i) => ({ ...t, order: i })),
    }));
  }, [setState]);

  const addCategory = useCallback((name: string, color: string) => {
    const category: Category = {
      id: generateId(),
      name,
      color,
      createdAt: Date.now(),
    };
    setState((prev) => ({ ...prev, categories: [...prev.categories, category] }));
  }, [setState]);

  const deleteCategory = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c.id !== id),
      todos: prev.todos.map((t) =>
        t.categoryId === id ? { ...t, categoryId: null } : t
      ),
    }));
  }, [setState]);

  const setFilter = useCallback((filter: FilterType) => {
    setState((prev) => ({ ...prev, filter }));
  }, [setState]);

  const setSelectedCategory = useCallback((categoryId: string | null) => {
    setState((prev) => ({ ...prev, selectedCategory: categoryId }));
  }, [setState]);

  const setSearchQuery = useCallback((query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  }, [setState]);

  const setSortBy = useCallback((sortBy: AppState['sortBy']) => {
    setState((prev) => ({ ...prev, sortBy }));
  }, [setState]);

  const setSortOrder = useCallback((sortOrder: 'asc' | 'desc') => {
    setState((prev) => ({ ...prev, sortOrder }));
  }, [setState]);

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

  return {
    todos: filteredTodos,
    allTodos: todos,
    categories,
    stats,
    filter: state.filter,
    selectedCategory: state.selectedCategory,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
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
  };
}