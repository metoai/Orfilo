import React, { useState } from 'react';
import {
  CheckCircle2,
  FolderOpen,
  Sparkles,
  FileCode,
  FileImage,
  FileText,
  ArrowDown,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const PROMPT_EXAMPLES = [
  {
    id: 'character',
    label: '3D Render',
    model: 'Gemini 2.5 Flash',
    prompt:
      'Generate a photorealistic 3D Habesha character wearing traditional woven clothing with golden embroidery in studio light',
    targetFile: 'habesha-hero-character-3d.png',
    project: 'Habesha Model',
    subfolder: 'Marketing / 3D Renders',
    size: '2.4 MB',
    type: 'image',
    confidence: '99%',
    icon: FileImage,
  },
  {
    id: 'auth',
    label: 'Next.js Hook',
    model: 'Claude 3.7 Sonnet',
    prompt:
      'Write a production-ready useSession hook in TypeScript with automatic token refresh and Supabase session validation',
    targetFile: 'use-session-auth.ts',
    project: 'SaaS Platform',
    subfolder: 'Frontend / Hooks',
    size: '14.2 KB',
    type: 'code',
    confidence: '98%',
    icon: FileCode,
  },
  {
    id: 'pitch',
    label: 'Pitch Deck',
    model: 'ChatGPT 4o',
    prompt:
      'Create an executive 10-slide startup pitch deck outline for an enterprise AI deliverable organizer targeting seed investors',
    targetFile: 'executive-pitch-deck-outline.docx',
    project: 'Fundraising 2026',
    subfolder: 'Investor Relations',
    size: '88.5 KB',
    type: 'doc',
    confidence: '96%',
    icon: FileText,
  },
];

export const OrfiloBentoGrid: React.FC<{ onCtaClick: () => void }> = ({ onCtaClick }) => {
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const [hoveredTooltip, setHoveredTooltip] = useState<'moderate' | 'high' | null>(null);

  const activePrompt = PROMPT_EXAMPLES[activePromptIndex];
  const IconComponent = activePrompt.icon;

  return (
    <div className="flex flex-col gap-10">
      {/* =============================================================== */}
      {/* BENTO 1: NEVER LOSE AN AI DELIVERABLE (PROMPT TRANSFORMER)     */}
      {/* =============================================================== */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-[28px] bg-white/95 border border-[#ECE7E1] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.04)] p-8 sm:p-12 overflow-hidden">
        {/* Soft Ambient Glow */}
        <div
          className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-gradient-to-tl from-[#19A974]/20 via-[#2CD59B]/10 to-transparent blur-[70px]"
          aria-hidden="true"
        />

        {/* Left Copy Column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1 tracking-tight">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-[1.12]">
              Never lose an <br />
              AI Deliverable
            </h3>
          </div>

          <p className="text-[14px] sm:text-[14.5px] text-[#636363] leading-relaxed max-w-md">
            Stop digging through messy Downloads folders and random hashes. Orfilo
            analyzes your prompt with Gemini AI to generate clean, human-readable
            kebab filenames and routes them to your project subfolders.
          </p>

          <div className="flex flex-col gap-3.5 pt-2">
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <CheckCircle2 className="size-4 stroke-[2.2]" />
              </div>
              <span>Automatic Gemini 2.5 Flash semantic classification</span>
            </div>
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <CheckCircle2 className="size-4 stroke-[2.2]" />
              </div>
              <span>Context-aware kebab-case filenames without manual renaming</span>
            </div>
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <CheckCircle2 className="size-4 stroke-[2.2]" />
              </div>
              <span>Full prompt history & generation parameters preserved</span>
            </div>
          </div>
        </div>

        {/* Right Mockup Column (Interactive Prompt Transformer) */}
        <div className="lg:col-span-6 relative flex flex-col items-center justify-center gap-3">
          <div
            className="pointer-events-none absolute size-72 rounded-full bg-gradient-to-br from-[#19A974]/20 via-[#2CD59B]/10 to-transparent blur-[60px]"
            aria-hidden="true"
          />

          {/* Example Selector Tabs */}
          <div className="relative z-10 flex items-center gap-1.5 p-1 rounded-full bg-[#FAF8F5] border border-[#E8E3DD] shadow-xs">
            {PROMPT_EXAMPLES.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivePromptIndex(idx)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] cursor-pointer ${
                  activePromptIndex === idx
                    ? 'bg-[#121212] text-white shadow-xs'
                    : 'text-[#666666] hover:text-black'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Transformer Container */}
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white border border-[#E8E3DD] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] p-5 sm:p-6 flex flex-col gap-4">
            {/* Input Prompt Box */}
            <div className="flex flex-col gap-2 rounded-xl bg-[#FAF8F5] border border-[#EFEBE4] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#19A974] uppercase tracking-wider">
                  Prompt Input ({activePrompt.model})
                </span>
                <span className="text-[10px] text-[#888888]">Direct from Chat</span>
              </div>
              <p className="text-[12.5px] text-[#2E2E2E] leading-relaxed italic line-clamp-2">
                &ldquo;{activePrompt.prompt}&rdquo;
              </p>
            </div>

            {/* Transform Arrow */}
            <div className="flex items-center justify-center -my-1 text-[#19A974]">
              <div className="flex size-7 items-center justify-center rounded-full bg-[#E8F7F0] border border-[#BCEBD7]">
                <ArrowDown className="size-3.5 stroke-[2.5]" />
              </div>
            </div>

            {/* Transformed Result Card */}
            <div className="flex items-start gap-3.5 rounded-xl bg-white border border-[#E2DBD1] p-3.5 shadow-xs">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#E8F7F0] text-[#19A974]">
                <IconComponent className="size-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-bold text-[#141414] truncate font-mono">
                    {activePrompt.targetFile}
                  </span>
                  <span className="shrink-0 text-[10.5px] font-semibold text-[#19A974] bg-[#E8F7F0] px-2 py-0.5 rounded-full">
                    {activePrompt.confidence} match
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B]">
                  <FolderOpen className="size-3 text-[#19A974]" />
                  <span className="truncate">{activePrompt.subfolder}</span>
                  <span>•</span>
                  <span>{activePrompt.size}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =============================================================== */}
      {/* BENTO 2: DELIVERABLE VELOCITY OVER TIME (SPLINE METRICS)       */}
      {/* =============================================================== */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-[28px] bg-white/95 border border-[#ECE7E1] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.04)] p-8 sm:p-12 overflow-hidden">
        <div
          className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-gradient-to-tr from-[#19A974]/20 via-[#2CD59B]/10 to-transparent blur-[70px]"
          aria-hidden="true"
        />

        {/* Left Copy Column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <div className="flex flex-col gap-1 tracking-tight">
            <h3 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-[1.12]">
              Deliverable Velocity <br />
              over time
            </h3>
          </div>

          <p className="text-[14px] sm:text-[14.5px] text-[#636363] leading-relaxed max-w-md">
            Gain total visibility into your creative & engineering output across all
            AI models. Every file is protected by PostgreSQL Supabase Row-Level
            Security and instantly searchable.
          </p>

          <div className="flex flex-col gap-3.5 pt-2">
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <ShieldCheck className="size-4 stroke-[2.2]" />
              </div>
              <span>PostgreSQL Supabase vault with strict RLS isolation</span>
            </div>
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <Zap className="size-4 stroke-[2.2]" />
              </div>
              <span>Subsecond instant search across prompts and metadata</span>
            </div>
            <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
              <div className="flex size-5 items-center justify-center rounded-md text-[#19A974]">
                <Layers className="size-4 stroke-[2.2]" />
              </div>
              <span>Multi-device sync & 1-click Chrome Extension capture</span>
            </div>
          </div>
        </div>

        {/* Right Mockup Column (Chart Spline) */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div
            className="pointer-events-none absolute size-72 rounded-full bg-gradient-to-br from-[#19A974]/20 via-[#2CD59B]/15 to-transparent blur-[60px]"
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8E3DD] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] font-medium text-[#888888] tracking-tight">
                Deliverables organized over time
              </span>
              <div className="flex items-center gap-1.5">
                <div className="size-2 rounded-full bg-[#19A974] animate-pulse" />
                <span className="text-[10px] font-medium text-[#19A974]">Active Vault</span>
              </div>
            </div>

            <div className="relative w-full h-44 flex items-center justify-center">
              <svg
                viewBox="0 0 340 160"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient
                    id="orfiloAreaGradient"
                    x1="170"
                    y1="15"
                    x2="170"
                    y2="155"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#19A974" stopOpacity="0.32" />
                    <stop offset="0.6" stopColor="#2CD59B" stopOpacity="0.12" />
                    <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Reference Grids */}
                <line x1="10" y1="40" x2="330" y2="40" stroke="#F0EBE5" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="10" y1="85" x2="330" y2="85" stroke="#F0EBE5" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="10" y1="130" x2="330" y2="130" stroke="#F0EBE5" strokeWidth="1" strokeDasharray="4 4" />

                {/* Area Fill */}
                <path
                  d="M 15 145 C 80 142, 130 115, 185 80 C 235 48, 265 32, 320 20 L 320 155 L 15 155 Z"
                  fill="url(#orfiloAreaGradient)"
                />

                {/* Spline */}
                <path
                  d="M 15 145 C 80 142, 130 115, 185 80 C 235 48, 265 32, 320 20"
                  stroke="#19A974"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />

                <circle cx="185" cy="80" r="4.5" fill="#FFFFFF" stroke="#19A974" strokeWidth="2.5" />
                <circle cx="275" cy="35" r="4.5" fill="#FFFFFF" stroke="#19A974" strokeWidth="2.5" />
              </svg>

              {/* Tooltip 1 */}
              <div
                onMouseEnter={() => setHoveredTooltip('moderate')}
                onMouseLeave={() => setHoveredTooltip(null)}
                style={{ left: '53%', top: '38%' }}
                className="absolute -translate-x-1/2 -translate-y-full mb-2 cursor-pointer z-10"
              >
                <div
                  className={`flex flex-col items-center rounded-xl bg-white border border-[#E6E1DA] px-3 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    hoveredTooltip === 'moderate' ? 'scale-105 -translate-y-0.5' : ''
                  }`}
                >
                  <span className="text-[11px] font-bold text-[#1F1F1F] whitespace-nowrap">Zero-Lag Full-Text Search</span>
                  <span className="text-[9.5px] font-medium text-[#777777]">Subsecond Indexing</span>
                </div>
              </div>

              {/* Tooltip 2 */}
              <div
                onMouseEnter={() => setHoveredTooltip('high')}
                onMouseLeave={() => setHoveredTooltip(null)}
                style={{ left: '79%', top: '15%' }}
                className="absolute -translate-x-1/2 -translate-y-full mb-2 cursor-pointer z-10"
              >
                <div
                  className={`flex flex-col items-center rounded-xl bg-white border border-[#E6E1DA] px-3 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                    hoveredTooltip === 'high' ? 'scale-105 -translate-y-0.5' : ''
                  }`}
                >
                  <span className="text-[11px] font-bold text-[#1F1F1F] whitespace-nowrap">Automated Vault Sync</span>
                  <span className="text-[9.5px] font-medium text-[#19A974]">All AI Models</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
