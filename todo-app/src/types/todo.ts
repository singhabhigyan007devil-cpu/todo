export type Priority = 'low' | 'medium' | 'high';
export type FilterType = 'all' | 'active' | 'completed';

export type UserPersona = 'student' | 'professional' | 'business' | 'creative' | 'personal';
export type RoadmapPhase = 'q1' | 'q2' | 'q3' | 'q4' | null;

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  completedDays: string[]; // List of YYYY-MM-DD strings
  createdAt: number;
}

export interface Inspiration {
  id: string;
  title: string;
  type: 'image' | 'color' | 'quote' | 'link';
  content: string;
  notes: string;
  linkedTodoId: string | null;
  createdAt: number;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string;
  notes: string;
  meetingLink: string;
  createdAt: number;
  pptxName?: string;
  pptxText?: string;
  minutes?: string;
  extractedTasks?: Array<{ id: string; title: string; priority: 'low' | 'medium' | 'high' }>;
}

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
  roadmapPhase?: RoadmapPhase;
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
  userPersona: UserPersona;
  meetings?: Meeting[];
  habits?: Habit[];
  inspirations?: Inspiration[];
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  low: 'bg-green-900/40 text-green-400 ring-1 ring-green-700/30',
  medium: 'bg-amber-900/40 text-amber-400 ring-1 ring-amber-700/30',
  high: 'bg-red-900/40 text-red-400 ring-1 ring-red-700/30',
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
