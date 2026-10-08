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
