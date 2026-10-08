import React, { useState } from 'react';
import { ShieldCheck, Copy, Check, AlertTriangle, Database, Key, Server, ExternalLink } from 'lucide-react';
import { getSupabaseConfig } from '../lib/supabase/client.ts';
import { db } from '../lib/supabase/db.ts';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { isConfigured, url } = getSupabaseConfig();
  const schemaStatus = db.getSchemaStatus();

  if (!isOpen) return null;

  const sqlMigration = `-- ==============================================================================
-- ORFILO PRODUCTION DATABASE SCHEMA & ROW LEVEL SECURITY
-- Supabase PostgreSQL Migration
-- Everything your AI creates. Organized.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROJECTS TABLE
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

-- 3. STORAGE CONNECTIONS TABLE
CREATE TABLE IF NOT EXISTS public.storage_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  account_name TEXT,
  provider_account_id TEXT,
  status TEXT NOT NULL DEFAULT 'connected',
  credential_reference TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ARTIFACTS TABLE
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
  source_type TEXT DEFAULT 'ai_export',
  source_name TEXT DEFAULT 'Gemini',
  ai_confidence NUMERIC(4, 3) DEFAULT 0.900,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. FILE EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.file_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  artifact_id UUID REFERENCES public.artifacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL DEFAULT 'human',
  actor_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.storage_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own projects" ON public.projects
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own artifacts" ON public.artifacts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own file events" ON public.file_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage own storage connections" ON public.storage_connections
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlMigration);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FAFAF8] border border-[#E7E7E4] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E7E7E4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isConfigured ? 'bg-[#E8F7F0] text-[#19A974]' : 'bg-amber-50 text-amber-600'}`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#111111]">Supabase Project Connection</h2>
              <p className="text-xs text-[#6B6B6B]">Production PostgreSQL & Row Level Security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-[#111111] transition-colors p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-[#111111]">
          {/* Status Alert */}
          {!isConfigured ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-amber-950">Supabase Credentials Not Yet Detected</div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  To connect your real production database, configure the required environment variables in your project settings. Orfilo is currently running with an in-memory development state so you can test all workflows immediately.
                </p>
              </div>
            </div>
          ) : !schemaStatus.tablesCreated ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-950">
              <Database className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-blue-950">Credentials Detected ({url}) — Migration Pending</div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Your project URL and API keys are configured, but the database tables (<code>projects</code>, <code>artifacts</code>, <code>file_events</code>) have not been created yet in PostgreSQL. Copy the SQL script below and execute it in your Supabase SQL Editor.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#E8F7F0] border border-[#19A974]/30 rounded-xl p-4 flex gap-3 text-emerald-950">
              <ShieldCheck className="w-5 h-5 shrink-0 text-[#19A974] mt-0.5" />
              <div className="space-y-1">
                <div className="font-medium text-emerald-950">Supabase Connected &amp; Tables Active</div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Row Level Security and real PostgreSQL database persistence are active on your Supabase project.
                </p>
              </div>
            </div>
          )}

          {/* Required Secrets Table */}
          <div>
            <h3 className="font-semibold text-xs tracking-wider uppercase text-[#6B6B6B] mb-2 flex items-center gap-2">
              <Key className="w-3.5 h-3.5" /> Required Environment Variables
            </h3>
            <div className="border border-[#E7E7E4] rounded-xl overflow-hidden bg-white">
              <div className="p-3 border-b border-[#E7E7E4] flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">NEXT_PUBLIC_SUPABASE_URL</div>
                  <div className="text-[11px] text-[#6B6B6B]">Project URL from Supabase Project Settings &gt; API</div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">Client / Server</span>
              </div>
              <div className="p-3 border-b border-[#E7E7E4] flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                  <div className="text-[11px] text-[#6B6B6B]">Public anon JWT key for browser client &amp; auth queries</div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">Client / Server</span>
              </div>
              <div className="p-3 flex items-center justify-between bg-neutral-50/50">
                <div>
                  <div className="font-mono text-xs font-semibold text-[#111111]">SUPABASE_SERVICE_ROLE_KEY</div>
                  <div className="text-[11px] text-[#6B6B6B]">Secret service role key for privileged server operations (never exposed to browser)</div>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800">Server Only</span>
              </div>
            </div>
          </div>

          {/* Database Schema & Migration SQL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-xs tracking-wider uppercase text-[#6B6B6B] flex items-center gap-2">
                <Server className="w-3.5 h-3.5" /> Supabase Migration SQL
              </h3>
              <button
                onClick={copySql}
                className="inline-flex items-center gap-1.5 text-xs text-[#19A974] font-medium hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#19A974]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to clipboard' : 'Copy SQL Script'}
              </button>
            </div>
            <div className="bg-[#111111] text-neutral-200 rounded-xl p-3.5 font-mono text-[11px] max-h-44 overflow-y-auto leading-relaxed border border-neutral-800">
              <pre>{sqlMigration}</pre>
            </div>
            <p className="text-[11px] text-[#6B6B6B] mt-2">
              Run this SQL script inside your Supabase dashboard at <strong>SQL Editor &gt; New Query</strong> to provision all tables, indexes, triggers, and Row Level Security policies.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7E7E4] bg-white flex items-center justify-between">
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] hover:text-[#111111]"
          >
            Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#111111] text-white rounded-xl text-xs font-medium hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
