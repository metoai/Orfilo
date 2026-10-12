import React, { useState } from 'react';
import { ArrowRight, Zap, Workflow, Check, Search, Folder, ShieldCheck, Lock, HardDrive, Sparkles } from 'lucide-react';
import { OrfiloBrand } from './OrfiloBrand.tsx';

interface LandingPageViewProps {
  onSignIn: () => void;
  onSignUp: () => void;
  isLoggedIn?: boolean;
  onReturnToDashboard?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSignIn,
  onSignUp,
  isLoggedIn = false,
  onReturnToDashboard,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col antialiased selection:bg-[#E8F7F0] selection:text-[#19A974]">
      {/* Top Bar */}
      <header className="px-6 md:px-12 py-4 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrfiloBrand variant="horizontal" size="md" showTagline={false} />
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 hidden sm:inline-block">
            v2.0
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {isLoggedIn ? (
            <button
              onClick={onReturnToDashboard}
              className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={onSignIn}
                className="px-3.5 py-1.5 border border-neutral-200/80 hover:border-neutral-400 rounded-xl text-xs font-medium text-neutral-800 transition-colors cursor-pointer bg-white"
              >
                Sign in
              </button>
              <button
                onClick={onSignUp}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              >
                Get started
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 text-center flex flex-col items-center">
        {/* Micro-badge pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-neutral-200/80 bg-neutral-50 text-neutral-700 mb-8 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#19A974]" />
          <span>The intelligent deliverable layer for AI</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-950 max-w-3xl leading-[1.12]">
          Everything your AI creates. <span className="text-[#19A974]">Organized.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base md:text-lg text-neutral-500 max-w-2xl font-normal leading-relaxed">
          Orfilo captures, understands, and organizes images, documents, and code from ChatGPT, Claude, and Gemini — automatically filed into structured project folders.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onSignUp}
            className="w-full sm:w-auto px-6 py-3 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-sm font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Start free workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            onClick={() => {
              const el = document.getElementById('interactive-demo');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            See interactive demo
          </button>
        </div>

        {/* Interactive Engine Visualizer */}
        <section id="interactive-demo" className="mt-16 w-full text-left">
          <div className="border border-neutral-200/80 rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* Window bar */}
            <div className="px-5 py-3.5 border-b border-neutral-200/80 bg-neutral-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <span className="ml-2 font-mono text-[11px] text-neutral-500">Orfilo Ingestion Pipeline</span>
              </div>

              {/* Segmented Step Switcher */}
              <div className="p-1 bg-neutral-200/70 rounded-xl flex items-center gap-1 text-xs">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                      activeStep === step
                        ? 'bg-white text-neutral-900 shadow-xs'
                        : 'text-neutral-500 hover:text-neutral-900'
                    }`}
                  >
                    Step {step}
                  </button>
                ))}
              </div>
            </div>

            {/* Steps Visualizer */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Step 1 */}
              <div
                onClick={() => setActiveStep(1)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 1
                    ? 'border-[#19A974] bg-[#E8F7F0]/20 shadow-2xs'
                    : 'border-neutral-200/80 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
                  1. AI Generates
                </div>
                <div className="font-mono text-xs font-semibold text-neutral-800 break-all bg-neutral-100 p-2 rounded-lg">
                  image_847392_final2.png
                </div>
                <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed">
                  Exported with opaque names and scattered across downloads.
                </p>
              </div>

              {/* Step 2 */}
              <div
                onClick={() => setActiveStep(2)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 2
                    ? 'border-[#19A974] bg-[#E8F7F0]/20 shadow-2xs'
                    : 'border-neutral-200/80 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
                  2. Understands
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Project:</span>
                    <span className="font-medium text-neutral-900">Habesha Model</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subfolder:</span>
                    <span className="font-medium text-neutral-900">Marketing</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed">
                  Gemini Flash inspects context and extracts deliverable metadata.
                </p>
              </div>

              {/* Step 3 */}
              <div
                onClick={() => setActiveStep(3)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 3
                    ? 'border-[#19A974] bg-[#E8F7F0]/20 shadow-2xs'
                    : 'border-neutral-200/80 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
                  3. Organizes
                </div>
                <div className="space-y-1.5">
                  <div className="font-mono text-xs text-[#19A974] font-medium truncate">
                    habesha-hero-concept.png
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 truncate bg-neutral-50 p-1.5 rounded border border-neutral-100">
                    Habesha Model / Marketing
                  </div>
                </div>
                <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed">
                  Deterministic project filing and clean subfolder routing.
                </p>
              </div>

              {/* Step 4 */}
              <div
                onClick={() => setActiveStep(4)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 4
                    ? 'border-[#19A974] bg-[#E8F7F0]/20 shadow-2xs'
                    : 'border-neutral-200/80 hover:border-neutral-300 bg-white'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-neutral-400 mb-2 font-semibold">
                  4. Retrieve Instantly
                </div>
                <div className="text-xs italic text-neutral-800 bg-neutral-100 p-2 rounded-lg font-mono">
                  &quot;hero concept for Habesha&quot;
                </div>
                <p className="text-xs text-neutral-500 mt-2.5 leading-relaxed">
                  Fast search across topics, subfolders, and models.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 text-left w-full">
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-2.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
              <Workflow className="w-5 h-5 text-[#19A974]" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">Companion Extension</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Hover over images and code in ChatGPT, Claude, and Gemini to capture directly into subfolders.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-2.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
              <Lock className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">Row-Level Security</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Every deliverable is isolated to your Supabase authenticated identity with zero shared access.
            </p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-2.5 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center">
              <Folder className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-sm font-semibold text-neutral-900">Project & Subfolder Hierarchy</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Drag-and-drop between project folders with live counts and subfolder categorization.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200/80 py-8 px-6 md:px-12 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-3">
          <OrfiloBrand variant="icon-only" size="sm" />
          <span>&copy; 2026 Orfilo. Everything your AI creates. Organized.</span>
        </div>
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <button onClick={onReturnToDashboard} className="hover:text-neutral-900 cursor-pointer font-medium">
              Open Workspace
            </button>
          ) : (
            <>
              <button onClick={onSignIn} className="hover:text-neutral-900 cursor-pointer">
                Sign in
              </button>
              <button onClick={onSignUp} className="hover:text-[#19A974] cursor-pointer font-medium text-neutral-900">
                Get started
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};
