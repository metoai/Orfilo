-- ==============================================================================
-- ORFILO PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY
-- Supabase PostgreSQL Migration
-- Everything your AI creates. Organized.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Enable pgvector if available for future semantic search
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. USERS TABLE
-- Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for users.updated_at
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'folder',
  color TEXT DEFAULT '#19A974',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. STORAGE CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.storage_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'google_drive', 'supabase', etc.
  account_name TEXT,
  provider_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'connected', -- 'connected', 'pending', 'disconnected', 'error'
  credential_reference TEXT, -- server-side secure reference/token key ID (never raw secrets)
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_storage_connections_updated_at ON public.storage_connections;
CREATE TRIGGER trigger_storage_connections_updated_at
  BEFORE UPDATE ON public.storage_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 6. ARTIFACTS TABLE
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  storage_connection_id UUID REFERENCES public.storage_connections(id) ON DELETE SET NULL,
  original_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  extension TEXT NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  provider_file_id TEXT,
  provider_path TEXT,
  description TEXT,
  source_type TEXT DEFAULT 'ai_export', -- 'download_capture', 'manual_upload', 'agent_api'
  source_name TEXT DEFAULT 'Gemini',    -- 'Gemini', 'ChatGPT', 'Claude', 'Midjourney', 'Custom'
  ai_confidence NUMERIC(4, 3) DEFAULT 0.900,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trigger_artifacts_updated_at ON public.artifacts;
CREATE TRIGGER trigger_artifacts_updated_at
  BEFORE UPDATE ON public.artifacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. ARTIFACT EMBEDDINGS TABLE
-- For future semantic vector search
CREATE TABLE IF NOT EXISTS public.artifact_embeddings (
  artifact_id UUID PRIMARY KEY REFERENCES public.artifacts(id) ON DELETE CASCADE,
  embedding vector(768), -- Gemini text-embedding-004 default dimension is 768
  model TEXT NOT NULL DEFAULT 'text-embedding-004',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. FILE EVENTS TABLE (Activity audit trail)
CREATE TABLE IF NOT EXISTS public.file_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  artifact_id UUID REFERENCES public.artifacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'saved', 'organized', 'renamed', 'moved', 'downloaded', 'deleted', 'imported'
  actor_type TEXT NOT NULL DEFAULT 'human', -- 'human', 'ai_system', 'integration'
  actor_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_storage_connections_user_id ON public.storage_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_user_id ON public.artifacts(user_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_project_id ON public.artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_created_at ON public.artifacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_file_events_user_id ON public.file_events(user_id);
CREATE INDEX IF NOT EXISTS idx_file_events_artifact_id ON public.file_events(artifact_id);
CREATE INDEX IF NOT EXISTS idx_file_events_created_at ON public.file_events(created_at DESC);

-- Text search index on artifacts
CREATE INDEX IF NOT EXISTS idx_artifacts_search ON public.artifacts
  USING gin(to_tsvector('english', display_name || ' ' || original_name || ' ' || COALESCE(description, '')));

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Zero cross-user access: Users can only select, insert, update, delete their own data
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifact_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_events ENABLE ROW LEVEL SECURITY;

-- 1. USERS RLS
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 2. PROJECTS RLS
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- 3. STORAGE CONNECTIONS RLS
CREATE POLICY "Users can view own storage connections"
  ON public.storage_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own storage connections"
  ON public.storage_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage connections"
  ON public.storage_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage connections"
  ON public.storage_connections FOR DELETE
  USING (auth.uid() = user_id);

-- 4. ARTIFACTS RLS
CREATE POLICY "Users can view own artifacts"
  ON public.artifacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own artifacts"
  ON public.artifacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own artifacts"
  ON public.artifacts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own artifacts"
  ON public.artifacts FOR DELETE
  USING (auth.uid() = user_id);

-- 5. ARTIFACT EMBEDDINGS RLS (Joined via artifacts ownership)
CREATE POLICY "Users can view own artifact embeddings"
  ON public.artifact_embeddings FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.artifacts
    WHERE artifacts.id = artifact_embeddings.artifact_id
    AND artifacts.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own artifact embeddings"
  ON public.artifact_embeddings FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.artifacts
    WHERE artifacts.id = artifact_embeddings.artifact_id
    AND artifacts.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own artifact embeddings"
  ON public.artifact_embeddings FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.artifacts
    WHERE artifacts.id = artifact_embeddings.artifact_id
    AND artifacts.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own artifact embeddings"
  ON public.artifact_embeddings FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.artifacts
    WHERE artifacts.id = artifact_embeddings.artifact_id
    AND artifacts.user_id = auth.uid()
  ));

-- 6. FILE EVENTS RLS
CREATE POLICY "Users can view own file events"
  ON public.file_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own file events"
  ON public.file_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own file events"
  ON public.file_events FOR DELETE
  USING (auth.uid() = user_id);
