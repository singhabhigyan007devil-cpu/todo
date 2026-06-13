export type Priority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'active' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  createdAt: number;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  categoryId: string | null;
  dueDate: number | null;
  subtasks: Subtask[];
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
  order: number;
}

export interface TodoStats {
  total: number;
  completed: number;
  active: number;
  completionRate: number;
  overdue: number;
  dueToday: number;
  byPriority: Record<Priority, number>;
  byCategory: Record<string, number>;
  streak: number;
}

export interface AppState {
  todos: Todo[];
  categories: Category[];
  filter: FilterType;
  selectedCategory: string | null;
  searchQuery: string;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'order';
  sortOrder: 'asc' | 'desc';
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-green-900/40 text-green-400',
  medium: 'bg-yellow-900/40 text-yellow-400',
  high: 'bg-red-900/40 text-red-400',
};

export const PRIORITY_ICON_COLORS: Record<Priority, string> = {
  low: 'text-green-500',
  medium: 'text-yellow-500',
  high: 'text-red-500',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'personal', name: 'Personal', color: '#3b82f6', createdAt: Date.now() },
  { id: 'work', name: 'Work', color: '#8b5cf6', createdAt: Date.now() },
  { id: 'shopping', name: 'Shopping', color: '#f59e0b', createdAt: Date.now() },
  { id: 'health', name: 'Health', color: '#10b981', createdAt: Date.now() },
];
