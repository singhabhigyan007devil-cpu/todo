import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or localStorage
export function getSupabaseKeys() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem('taskflow-supabase-url');
  const localKey = localStorage.getItem('taskflow-supabase-key');

  return {
    url: envUrl || localUrl || '',
    key: envKey || localKey || '',
    isEnv: !!(envUrl && envKey)
  };
}

const keys = getSupabaseKeys();

// Export client instance (can be null if configuration is incomplete)
export let supabase: SupabaseClient | null = 
  keys.url && keys.key ? createClient(keys.url, keys.key) : null;

// Allow dynamic client update at runtime
export function updateSupabaseConfig(url: string, key: string): boolean {
  if (!url || !key) return false;
  try {
    localStorage.setItem('taskflow-supabase-url', url);
    localStorage.setItem('taskflow-supabase-key', key);
    supabase = createClient(url, key);
    return true;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return false;
  }
}

// Reset credentials to original state (clearing manual overrides)
export function resetSupabaseConfig(): void {
  localStorage.removeItem('taskflow-supabase-url');
  localStorage.removeItem('taskflow-supabase-key');
  const originalKeys = getSupabaseKeys();
  if (originalKeys.url && originalKeys.key) {
    supabase = createClient(originalKeys.url, originalKeys.key);
  } else {
    supabase = null;
  }
}
