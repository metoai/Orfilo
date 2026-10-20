import React, { useState } from 'react';
import {
  CheckCircle2,
  FolderOpen,
  Zap,
  ArrowRight,
  Check,
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
    <div className="flex flex-col gap-10">
      {/* =============================================================== */}
      {/* SMART SEMANTIC AUTO-NAMING & ROUTING FEATURE SHOWCASE            */}
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
              Semantic Ingestion & Routing
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
    </div>
  );
};
