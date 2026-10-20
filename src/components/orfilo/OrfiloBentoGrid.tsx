import React, { useState } from 'react';
import {
  CheckCircle2,
  FolderOpen,
  Sparkles,
  FileCode,
  FileImage,
  FileText,
  Search,
  Check,
  ShieldCheck,
  Zap,
  ArrowRight,
  Terminal,
  Lock,
  Copy,
} from 'lucide-react';
import { Icon } from '@iconify/react';

const CAPTURE_SAMPLES = [
  {
    id: 'ts',
    label: 'TypeScript Hook',
    model: 'Claude 3.7 Sonnet',
    icon: 'logos:anthropic-icon',
    prompt: 'Write a production useSession hook in TypeScript with token refresh & Supabase validation',
    targetFile: 'use-session-auth.ts',
    project: 'SaaS Platform',
    subfolder: 'Frontend / Hooks',
    size: '14.2 KB',
    badge: 'TS',
    badgeColor: '#3178C6',
    confidence: '99.2%',
  },
  {
    id: '3d',
    label: '3D Render',
    model: 'Gemini 2.5 Flash',
    icon: 'logos:google-gemini',
    prompt: 'Generate a photorealistic 3D Habesha character wearing traditional woven clothing in studio lighting',
    targetFile: 'habesha-hero-character-3d.png',
    project: 'Habesha Model',
    subfolder: 'Marketing / 3D Renders',
    size: '2.4 MB',
    badge: 'PNG',
    badgeColor: '#10B981',
    confidence: '98.8%',
  },
  {
    id: 'sql',
    label: 'SQL Migration',
    model: 'Cursor AI',
    icon: 'simple-icons:cursor',
    prompt: 'Generate a safe Drizzle ORM migration adding jsonb metadata to integration_connections table',
    targetFile: '0024-add-connection-metadata.sql',
    project: 'Infrastructure Core',
    subfolder: 'Database / Migrations',
    size: '4.8 KB',
    badge: 'SQL',
    badgeColor: '#8B5CF6',
    confidence: '99.6%',
  },
];

export const OrfiloBentoGrid: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  const [activeSampleIdx, setActiveSampleIdx] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('session');

  const currentSample = CAPTURE_SAMPLES[activeSampleIdx];

  const handleSimulateCapture = () => {
    setIsCapturing(true);
    setTimeout(() => {
      setIsCapturing(false);
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSample.targetFile);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 1600);
  };

  return (
    <div className="flex flex-col gap-10 lg:gap-14">
      {/* =============================================================== */}
      {/* BENTO CARD 1: SMART SEMANTIC AUTO-NAMING & ROUTING              */}
      {/* =============================================================== */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-[32px] bg-white border border-[#E8E3DD] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.05)] p-8 sm:p-12 overflow-hidden">
        {/* Soft Ambient Radial Bloom */}
        <div
          className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-gradient-to-tl from-[#19A974]/20 via-[#2CD59B]/10 to-transparent blur-[80px]"
          aria-hidden="true"
        />

        {/* Left Column: Technical Narrative */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#E8F7F0] border border-[#BCEBD7] px-3 py-1 text-[11px] font-mono font-semibold text-[#19A974] tracking-wider uppercase">
              01 • Semantic Ingestion
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-[1.12]">
              Never lose an AI deliverable <br />
              to hash filenames
            </h3>
            <p className="text-[14.5px] text-[#636363] leading-relaxed max-w-md pt-1">
              Stop digging through messy Downloads folders and random hashes.
              Orfilo&apos;s Gemini 2.5 Flash pipeline extracts semantic intent to generate
              standardized kebab-case filenames and routes them into your project subfolders in under 200ms.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 pt-1">
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <CheckCircle2 className="size-4 stroke-[2.2]" />
              </div>
              <span>Sub-200ms Gemini 2.5 Flash prompt token analysis</span>
            </div>
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <CheckCircle2 className="size-4 stroke-[2.2]" />
              </div>
              <span>Context-aware kebab-case standardization with extension preservation</span>
            </div>
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <CheckCircle2 className="size-4 stroke-[2.2]" />
              </div>
              <span>Automatic multi-level project and subfolder hierarchy routing</span>
            </div>
          </div>
        </div>

        {/* Right Column: Modern SaaS Interactive Terminal & Capture Simulator */}
        <div className="lg:col-span-6 relative flex flex-col gap-3.5">
          {/* Sample Switcher Pills */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-[#FAF8F5] border border-[#E8E3DD]">
              {CAPTURE_SAMPLES.map((sample, idx) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => setActiveSampleIdx(idx)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] cursor-pointer ${
                    activeSampleIdx === idx
                      ? 'bg-[#121212] text-white shadow-xs'
                      : 'text-[#666666] hover:text-black'
                  }`}
                >
                  {sample.label}
                </button>
              ))}
            </div>

            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-[#19A974]">
              <span className="size-1.5 rounded-full bg-[#19A974] animate-pulse" />
              <span>Real-Time Ingestion</span>
            </span>
          </div>

          {/* SaaS Terminal Interface Card */}
          <div className="relative w-full rounded-2xl bg-[#0B1320] border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] p-5 sm:p-6 flex flex-col gap-4 text-white">
            {/* macOS Chrome Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-[#FF5F56]" />
                <div className="size-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="size-2.5 rounded-full bg-[#27C93F]" />
                <span className="text-[11px] font-mono text-neutral-400 pl-2">
                  orfilo://companion-capture
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 bg-white/5 px-2.5 py-0.5 rounded-full border border-white/5">
                <Icon icon={currentSample.icon} className="size-3.5" />
                <span>{currentSample.model}</span>
              </div>
            </div>

            {/* Prompt Input Bubble */}
            <div className="flex flex-col gap-1.5 rounded-xl bg-white/5 border border-white/10 p-3.5">
              <span className="text-[10.5px] font-mono uppercase tracking-wider text-emerald-400">
                AI Generation Prompt
              </span>
              <p className="text-[12.5px] text-neutral-200 font-sans leading-relaxed">
                &ldquo;{currentSample.prompt}&rdquo;
              </p>
            </div>

            {/* Ingestion Beam / Processing Trigger */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                <Zap className="size-3.5 text-[#19A974]" />
                <span>Pipeline: Gemini 2.5 Flash Parse</span>
              </div>
              <button
                type="button"
                onClick={handleSimulateCapture}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#19A974] hover:bg-[#158C60] text-white px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.97] cursor-pointer shadow-xs"
              >
                <span>{isCapturing ? 'Processing...' : 'Simulate Capture'}</span>
                <ArrowRight className="size-3" />
              </button>
            </div>

            {/* Transformed Result Card */}
            <div className={`relative flex items-center justify-between gap-3.5 rounded-xl bg-white/10 border p-3.5 transition-all duration-300 ${
              isCapturing ? 'border-[#19A974] scale-[1.02] bg-white/15' : 'border-white/10'
            }`}>
              <div className="flex items-center gap-3 min-w-0">
                <span
                  style={{ backgroundColor: currentSample.badgeColor }}
                  className="size-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white shrink-0 shadow-xs"
                >
                  {currentSample.badge}
                </span>

                <div className="flex flex-col min-w-0">
                  <span className="text-[13px] font-mono font-bold text-white truncate">
                    {currentSample.targetFile}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                    <FolderOpen className="size-3 text-[#19A974]" />
                    <span className="truncate">{currentSample.project} / {currentSample.subfolder}</span>
                    <span>•</span>
                    <span>{currentSample.size}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {currentSample.confidence}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy Name"
                  className="size-7 rounded-lg bg-white/5 hover:bg-white/15 flex items-center justify-center text-neutral-300 transition-colors cursor-pointer"
                >
                  {copiedFile ? (
                    <Check className="size-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* BENTO CARD 2: PRIVATE CLOUD VAULT & SUBSECOND SEARCH            */}
      {/* =============================================================== */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-[32px] bg-white border border-[#E8E3DD] shadow-[0_16px_40px_-12px_rgba(0,0,0,0.05)] p-8 sm:p-12 overflow-hidden">
        {/* Soft Ambient Radial Bloom */}
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 size-96 rounded-full bg-gradient-to-tr from-[#19A974]/20 via-[#2CD59B]/10 to-transparent blur-[80px]"
          aria-hidden="true"
        />

        {/* Left Column: Technical Narrative */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#E8F7F0] border border-[#BCEBD7] px-3 py-1 text-[11px] font-mono font-semibold text-[#19A974] tracking-wider uppercase">
              02 • Vault & Security
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-[1.12]">
              Search your entire AI history <br />
              in under 12 milliseconds
            </h3>
            <p className="text-[14.5px] text-[#636363] leading-relaxed max-w-md pt-1">
              Every code snippet, 3D render, and architectural schema is stored in
              PostgreSQL Supabase with Row-Level Security (RLS). Search across prompt
              context, file types, or project tags with zero latency.
            </p>
          </div>

          <div className="flex flex-col gap-3.5 pt-1">
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <ShieldCheck className="size-4 stroke-[2.2]" />
              </div>
              <span>Database-enforced PostgreSQL Row-Level Security (RLS)</span>
            </div>
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <Zap className="size-4 stroke-[2.2]" />
              </div>
              <span>Subsecond full-text indexing across prompts and code metadata</span>
            </div>
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <Lock className="size-4 stroke-[2.2]" />
              </div>
              <span>Zero model training: your code and IP stay 100% private to you</span>
            </div>
          </div>
        </div>

        {/* Right Column: Modern Raycast / Linear Command Palette Interface */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div className="relative w-full rounded-2xl bg-[#0B1320] border border-white/10 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] p-5 sm:p-6 flex flex-col gap-4 text-white">
            {/* Command Palette Search Header */}
            <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5">
              <div className="flex items-center gap-2.5 flex-1">
                <Search className="size-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter deliverables by prompt, file, or tag..."
                  className="bg-transparent text-xs text-white placeholder:text-neutral-500 focus:outline-none w-full font-mono"
                />
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  ⚡ 8ms query
                </span>
                <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white/10 rounded">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Filtered Result Rows */}
            <div className="flex flex-col gap-2">
              {[
                {
                  id: '1',
                  name: 'use-session-auth.ts',
                  path: 'SaaS Platform / Frontend / Hooks',
                  badge: 'TS',
                  badgeColor: '#3178C6',
                  size: '14.2 KB',
                  source: 'Claude 3.7',
                },
                {
                  id: '2',
                  name: 'session-storage-provider.ts',
                  path: 'Core / Authentication / Vault',
                  badge: 'TS',
                  badgeColor: '#3178C6',
                  size: '8.4 KB',
                  source: 'ChatGPT 4o',
                },
                {
                  id: '3',
                  name: '0024-session-tokens.sql',
                  path: 'Infrastructure Core / Migrations',
                  badge: 'SQL',
                  badgeColor: '#8B5CF6',
                  size: '3.1 KB',
                  source: 'Cursor AI',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="group/row flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      style={{ backgroundColor: item.badgeColor }}
                      className="size-7 rounded-md flex items-center justify-center font-mono font-bold text-[11px] text-white shrink-0"
                    >
                      {item.badge}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-mono font-semibold text-neutral-200 group-hover/row:text-white truncate">
                        {item.name}
                      </span>
                      <span className="text-[10.5px] text-neutral-400 truncate">
                        {item.path}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-[11px] text-neutral-400">
                    <span className="hidden sm:inline">{item.source}</span>
                    <span>•</span>
                    <span className="font-mono text-neutral-300">{item.size}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Security RLS Status Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#19A974] animate-pulse" />
                <span className="font-mono text-neutral-300">
                  RLS Policy: auth.uid() = user_id
                </span>
              </div>
              <span className="text-emerald-400 font-medium">100% Isolated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
