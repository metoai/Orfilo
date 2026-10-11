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
 * Server-side privileged Supabase client using the service role key.
 * Used for admin operations, verifying JWTs, and extension API token lookup.
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

/**
 * User-scoped Supabase client preserving Row Level Security (RLS) policies.
 * Uses anon key (or service key fallback) and passes the user's JWT in the Authorization header.
 */
export function createUserClient(token: string): SupabaseClient | null {
  const config = getServerSupabaseConfig();
  const keyToUse = config.anonKey || config.serviceRoleKey;
  if (!config.url || !keyToUse) {
    return null;
  }

  return createClient(config.url, keyToUse, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
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
