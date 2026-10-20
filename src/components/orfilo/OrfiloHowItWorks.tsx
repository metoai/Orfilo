import React, { useState } from 'react';
import {
  Sparkles,
  Chrome,
  FolderOpen,
  ArrowRight,
  CheckCircle2,
  FileCode,
  FileImage,
  Layers,
  Terminal,
  Bot,
} from 'lucide-react';

interface OrfiloHowItWorksProps {
  onCtaClick: () => void;
}

const AI_TOOLS = [
  { id: 'chatgpt', name: 'ChatGPT', tag: 'OpenAI 4o' },
  { id: 'claude', name: 'Claude', tag: 'Sonnet 3.7' },
  { id: 'gemini', name: 'Gemini', tag: '2.5 Flash' },
  { id: 'cursor', name: 'Cursor', tag: 'AI IDE' },
];

export const OrfiloHowItWorks: React.FC<OrfiloHowItWorksProps> = ({ onCtaClick }) => {
  const [selectedTool, setSelectedTool] = useState(0);
  const [isSimulatedCapture, setIsSimulatedCapture] = useState(false);

  const handleSimulateCapture = () => {
    setIsSimulatedCapture(true);
    setTimeout(() => setIsSimulatedCapture(false), 2400);
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F7F0] border border-[#BCEBD7] px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#19A974]">
          <Sparkles className="size-3.5 fill-[#19A974]" />
          <span>Frictionless 3-Step Workflow</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#141414] tracking-[-0.03em] leading-tight">
          How Orfilo Works
        </h2>
        <p className="text-[14px] sm:text-[15px] text-[#636363] leading-relaxed">
          From an active chat tab to a beautifully organized, searchable project vault in under 2 seconds.
          No more renaming files or losing context.
        </p>
      </div>

      {/* 3 Step Walkthrough Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* =============================================================== */}
        {/* STEP 1: PROMPT IN YOUR FAVORITE AI TOOLS                        */}
        {/* =============================================================== */}
        <div className="relative flex flex-col justify-between rounded-3xl bg-white border border-[#ECE7E1] p-7 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-[#D5CFCE] transition-all duration-200">
          <div className="flex flex-col gap-6">
            {/* Step Number Badge */}
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#ECE7E1] font-mono text-sm font-bold text-[#141414]">
                01
              </span>
              <span className="text-xs font-semibold text-[#19A974] uppercase tracking-wider">
                Step 1
              </span>
            </div>

            {/* Title & Copy */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-[#141414] tracking-tight">
                Prompt In Your Daily AI Tools
              </h3>
              <p className="text-xs sm:text-[13px] text-[#6B6B6B] leading-relaxed">
                Work naturally inside ChatGPT, Claude, Gemini, Cursor, or v0. 
                Whether you generate production code, 3D assets, or technical docs, your workflow stays identical.
              </p>
            </div>

            {/* Interactive Model Selector Pill */}
            <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-[#FAF8F5] border border-[#ECE7E1]">
              {AI_TOOLS.map((tool, idx) => (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setSelectedTool(idx)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer ${
                    selectedTool === idx
                      ? 'bg-[#121212] text-white shadow-xs'
                      : 'text-[#666666] hover:text-black'
                  }`}
                >
                  {tool.name}
                </button>
              ))}
            </div>

            {/* Visual Chat Mockup */}
            <div className="flex flex-col gap-2.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DD] p-3.5 sm:p-4 text-xs font-mono">
              <div className="flex items-center justify-between text-[10.5px] text-[#888888]">
                <div className="flex items-center gap-1.5">
                  <Bot className="size-3 text-[#19A974]" />
                  <span>{AI_TOOLS[selectedTool].name}</span>
                </div>
                <span className="text-[#19A974]">{AI_TOOLS[selectedTool].tag}</span>
              </div>
              <p className="text-[#2E2E2E] font-sans text-xs bg-white p-2.5 rounded-xl border border-[#ECE7E1] leading-relaxed">
                &ldquo;Create a secure JWT session validator for Supabase authentication in TypeScript...&rdquo;
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-[#F2ECE4] mt-6 flex items-center gap-2 text-xs text-[#555555]">
            <CheckCircle2 className="size-4 text-[#19A974] shrink-0" />
            <span>Zero context switching required</span>
          </div>
        </div>

        {/* =============================================================== */}
        {/* STEP 2: 1-CLICK CAPTURE VIA CHROME EXTENSION                    */}
        {/* =============================================================== */}
        <div className="relative flex flex-col justify-between rounded-3xl bg-white border border-[#ECE7E1] p-7 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-[#D5CFCE] transition-all duration-200">
          <div className="flex flex-col gap-6">
            {/* Step Number Badge */}
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-[#E8F7F0] border border-[#BCEBD7] font-mono text-sm font-bold text-[#19A974]">
                02
              </span>
              <span className="text-xs font-semibold text-[#19A974] uppercase tracking-wider">
                Step 2
              </span>
            </div>

            {/* Title & Copy */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-[#141414] tracking-tight">
                1-Click Capture Companion
              </h3>
              <p className="text-xs sm:text-[13px] text-[#6B6B6B] leading-relaxed">
                A non-intrusive &ldquo;Save to Orfilo&rdquo; button appears right beside code blocks,
                images, and documents in your chat. One tap captures raw assets and full generation prompts.
              </p>
            </div>

            {/* Interactive Extension Button Demo */}
            <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DD]">
              <div className="flex items-center gap-2 text-xs text-[#777777]">
                <Chrome className="size-4 text-[#19A974]" />
                <span className="font-sans">Companion Action Injection</span>
              </div>

              <button
                type="button"
                onClick={handleSimulateCapture}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] cursor-pointer ${
                  isSimulatedCapture
                    ? 'bg-[#19A974] text-white shadow-sm scale-105'
                    : 'bg-white border border-[#BCEBD7] text-[#19A974] hover:bg-[#E8F7F0]'
                }`}
              >
                {isSimulatedCapture ? (
                  <>
                    <CheckCircle2 className="size-3.5 text-white" />
                    <span>Transmitted to Orfilo ✓</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5 fill-[#19A974]" />
                    <span>Save to Orfilo</span>
                  </>
                )}
              </button>

              <span className="text-[10.5px] text-[#888888]">
                {isSimulatedCapture ? 'Captured with prompt metadata' : 'Click button above to simulate 1-tap capture'}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#F2ECE4] mt-6 flex items-center gap-2 text-xs text-[#555555]">
            <CheckCircle2 className="size-4 text-[#19A974] shrink-0" />
            <span>Preserves exact prompt & parameters</span>
          </div>
        </div>

        {/* =============================================================== */}
        {/* STEP 3: GEMINI AUTO-NAMING & SUBFOLDER ROUTING                   */}
        {/* =============================================================== */}
        <div className="relative flex flex-col justify-between rounded-3xl bg-white border border-[#ECE7E1] p-7 sm:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:border-[#D5CFCE] transition-all duration-200">
          <div className="flex flex-col gap-6">
            {/* Step Number Badge */}
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-2xl bg-[#FAF8F5] border border-[#ECE7E1] font-mono text-sm font-bold text-[#141414]">
                03
              </span>
              <span className="text-xs font-semibold text-[#19A974] uppercase tracking-wider">
                Step 3
              </span>
            </div>

            {/* Title & Copy */}
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-[#141414] tracking-tight">
                Gemini Auto-Naming & Filing
              </h3>
              <p className="text-xs sm:text-[13px] text-[#6B6B6B] leading-relaxed">
                Gemini 2.5 Flash analyzes prompt semantics in under 200ms, transforms random hashes into 
                clean kebab-case names, and files assets into your project subfolder.
              </p>
            </div>

            {/* Resulting File Routing Badge */}
            <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DD]">
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-[#19A974] font-medium">
                  <FolderOpen className="size-3.5" />
                  <span>SaaS Platform / Frontend / Hooks</span>
                </div>
                <span className="text-[10px] font-semibold text-[#19A974] bg-[#E8F7F0] px-1.5 py-0.5 rounded">
                  99% match
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-[#ECE7E1]">
                <FileCode className="size-4 text-[#19A974] shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-mono font-bold text-[#141414] truncate">
                    use-session-auth.ts
                  </span>
                  <span className="text-[10px] text-[#888888]">
                    14.2 KB • TypeScript Hook
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#F2ECE4] mt-6 flex items-center gap-2 text-xs text-[#555555]">
            <CheckCircle2 className="size-4 text-[#19A974] shrink-0" />
            <span>Searchable instantly by prompt or name</span>
          </div>
        </div>
      </div>

      {/* Bottom Conversion Prompt Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FAF8F5] via-white to-[#E8F7F0]/40 border border-[#ECE7E1] shadow-xs">
        <div className="flex flex-col gap-1 max-w-xl text-center sm:text-left">
          <h4 className="text-base sm:text-lg font-bold text-[#141414]">
            Ready to end messy Downloads folder chaos?
          </h4>
          <p className="text-xs sm:text-sm text-[#666666]">
            Start free with our companion Chrome extension and organize your first 100 AI deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={onCtaClick}
          className="inline-flex items-center gap-2.5 rounded-full bg-[#121212] px-6 py-3.5 text-xs sm:text-[13.5px] font-semibold text-white shadow-sm transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black active:scale-[0.97] cursor-pointer whitespace-nowrap"
        >
          <span>Get Started Free</span>
          <ArrowRight className="size-3.5 stroke-[2.2]" />
        </button>
      </div>
    </div>
  );
};
