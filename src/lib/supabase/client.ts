import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types.ts';

// Retrieve credentials safely from Vite import.meta.env (browser code)
export const getSupabaseConfig = () => {
  const url =
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_URL || import.meta.env?.NEXT_PUBLIC_SUPABASE_URL)) ||
    '';

  const anonKey =
    (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY)) ||
    '';

  const isConfigured = Boolean(
    url &&
    anonKey &&
    !url.includes('your-project-ref') &&
    !anonKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  );

  return { url, anonKey, isConfigured };
};

let supabaseBrowserClient: SupabaseClient<Database> | null = null;

/**
 * Creates or returns the browser Supabase client using public anon key.
 * Only authenticated client-safe operations and RLS-protected queries should use this.
 */
export function createBrowserClient(): SupabaseClient<Database> | null {
  if (supabaseBrowserClient) {
    return supabaseBrowserClient;
  }

  const { url, anonKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return null;
  }

  supabaseBrowserClient = createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'orfilo_auth_token',
    },
  });

  return supabaseBrowserClient;
}

export const supabase = createBrowserClient();
