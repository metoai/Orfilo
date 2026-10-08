-- ==============================================================================
-- ORFILO PRODUCTION DATABASE MIGRATION: AI CONNECTIONS & OAUTH TOKENS
-- Supabase PostgreSQL Migration
-- Enables multi-tenant, secure AI platform integration (ChatGPT, Claude, Cursor)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INTEGRATION CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.integration_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'chatgpt', 'claude', 'cursor', 'gemini', 'custom'
  provider_account_id TEXT,
  client_id TEXT,
  access_token_hash TEXT NOT NULL, -- SHA-256 hash of token for instant lookup
  access_token_encrypted TEXT, -- AES-256-GCM encrypted token for two-way storage
  refresh_token_hash TEXT,
  expires_at TIMESTAMPTZ,
  scopes TEXT[] NOT NULL DEFAULT ARRAY['artifacts:read', 'artifacts:write', 'projects:read', 'search:read'],
  status TEXT NOT NULL DEFAULT 'connected', -- 'connected', 'revoked', 'expired'
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ
);

-- Index for fast token authentication lookup on incoming AI tool requests
CREATE INDEX IF NOT EXISTS idx_integration_connections_token_hash 
  ON public.integration_connections (access_token_hash) 
  WHERE status = 'connected';

-- Index for querying a user's active connections
CREATE INDEX IF NOT EXISTS idx_integration_connections_user_provider 
  ON public.integration_connections (user_id, provider, status);

-- 2. OAUTH AUTHORIZATION CODES TABLE (Temporary PKCE & auth code exchange)
CREATE TABLE IF NOT EXISTS public.oauth_authorization_codes (
  code TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  client_id TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  code_challenge TEXT,
  code_challenge_method TEXT,
  scopes TEXT[] NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oauth_codes_expires 
  ON public.oauth_authorization_codes (expires_at);

-- 3. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_authorization_codes ENABLE ROW LEVEL SECURITY;

-- Users can only see and manage their own AI connections
CREATE POLICY "Users can view own integration connections"
  ON public.integration_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own integration connections"
  ON public.integration_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integration connections"
  ON public.integration_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integration connections"
  ON public.integration_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Backend Service Role has full access for OAuth exchange & MCP verification
GRANT ALL ON public.integration_connections TO service_role;
GRANT ALL ON public.oauth_authorization_codes TO service_role;
