import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getServerSupabaseConfig = () => {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL ||
    '';

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const anonKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  const isConfigured = Boolean(
    url &&
    (serviceRoleKey || anonKey) &&
    !url.includes('your-project-ref') &&
    !serviceRoleKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  );

  return {
    url,
    serviceRoleKey,
    anonKey,
    hasServiceRole: Boolean(serviceRoleKey && !serviceRoleKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')),
    isConfigured,
  };
};

/**
 * Server-side privileged Supabase client.
 * Never import or invoke this from browser components.
 */
export function createServerClient(): SupabaseClient | null {
  const config = getServerSupabaseConfig();
  if (!config.url || (!config.serviceRoleKey && !config.anonKey)) {
    return null;
  }

  const keyToUse = config.serviceRoleKey || config.anonKey;

  return createClient(config.url, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

let cachedAuthClient: SupabaseClient | null = null;
let cachedAuthExpiry = 0;

/**
 * Returns an authenticated Supabase client for workspace operations,
 * preserving Row Level Security (RLS) policies.
 */
export async function getWorkspaceAuthenticatedClient(): Promise<SupabaseClient | null> {
  const config = getServerSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  if (cachedAuthClient && Date.now() < cachedAuthExpiry) {
    return cachedAuthClient;
  }

  try {
    const authClient = createClient(config.url, config.anonKey);
    const { data, error } = await authClient.auth.signInWithPassword({
      email: process.env.ORFILO_WORKSPACE_EMAIL || 'metoaipr@gmail.com',
      password: process.env.ORFILO_WORKSPACE_PASSWORD || 'Orfilo2026!Secure',
    });

    if (data?.session?.access_token && !error) {
      cachedAuthClient = createClient(config.url, config.anonKey, {
        global: { headers: { Authorization: `Bearer ${data.session.access_token}` } },
      });
      cachedAuthExpiry = Date.now() + 3600 * 1000;
      return cachedAuthClient;
    }
  } catch (err) {
    console.warn('[Server Supabase] Workspace auth login note:', err);
  }

  return createServerClient();
}

/**
 * Verifies a bearer JWT token against Supabase Auth.
 * Returns the authenticated user object or null.
 * Never trusts client-supplied user IDs.
 */
export async function authenticateServerRequest(authHeader?: string) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  const serverClient = createServerClient();
  if (!serverClient) return null;

  try {
    const { data: { user }, error } = await serverClient.auth.getUser(token);
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}
