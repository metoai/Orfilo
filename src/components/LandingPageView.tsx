import React, { useState } from 'react';
import { ArrowRight, Sparkles, Check, Search, Folder, ShieldCheck, Database, HardDrive, Lock } from 'lucide-react';
import { OrfiloBrand } from './OrfiloBrand.tsx';

interface LandingPageViewProps {
  onSignIn: () => void;
  onSignUp: () => void;
  onExploreDemo?: () => void;
  isLoggedIn?: boolean;
  onReturnToDashboard?: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSignIn,
  onSignUp,
  onExploreDemo,
  isLoggedIn = false,
  onReturnToDashboard,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col selection:bg-[#E8F7F0] selection:text-[#19A974]">
      {/* Navigation */}
      <header className="px-6 md:px-12 py-5 border-b border-[#E7E7E4] bg-white flex items-center justify-between">
        <OrfiloBrand variant="horizontal" size="md" showTagline={false} />

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={onReturnToDashboard}
              className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={onSignIn}
                className="px-4 py-2 border border-[#E7E7E4] hover:border-[#111111] rounded-xl text-xs font-semibold text-[#111111] transition-colors cursor-pointer bg-white"
              >
                Sign in
              </button>
              <button
                onClick={onSignUp}
                className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Get started free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 md:py-24 text-center flex flex-col items-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F7F0] text-[#19A974] text-xs font-medium mb-8 border border-[#19A974]/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Everything your AI creates. Organized.</span>
        </div>

        {/* Main Title */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#111111] max-w-3xl leading-[1.12]">
          Everything your AI creates. Organized.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base md:text-lg text-[#6B6B6B] max-w-2xl font-normal leading-relaxed">
          Orfilo captures, understands, and organizes the files your AI creates — across your projects and storage.
        </p>

        {/* Call to Actions */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onSignUp}
            className="w-full sm:w-auto px-6 py-3 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-sm font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Get started free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {onExploreDemo && (
            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-5 py-3 border border-[#E7E7E4] hover:border-[#111111] bg-white rounded-xl text-sm font-medium text-[#111111] transition-colors cursor-pointer"
            >
              Explore workspace
            </button>
          )}

          <button
            onClick={() => {
              const el = document.getElementById('interactive-demo');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-4 py-3 text-sm font-medium text-[#6B6B6B] hover:text-[#111111] transition-colors cursor-pointer"
          >
            See how it works
          </button>
        </div>

        {/* Interactive Product Demonstration */}
        <section id="interactive-demo" className="mt-16 w-full text-left">
          <div className="border border-[#E7E7E4] rounded-2xl bg-white shadow-xl overflow-hidden">
            {/* Window bar */}
            <div className="px-5 py-3.5 border-b border-[#E7E7E4] bg-neutral-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-neutral-300" />
                <span className="w-3 h-3 rounded-full bg-neutral-300" />
                <span className="w-3 h-3 rounded-full bg-neutral-300" />
                <span className="ml-3 font-mono text-[11px] text-[#6B6B6B]">Orfilo Artifact Engine</span>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((step) => (
                  <button
                    key={step}
                    onClick={() => setActiveStep(step)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                      activeStep === step
                        ? 'bg-[#19A974] text-white'
                        : 'bg-white border border-[#E7E7E4] text-[#6B6B6B] hover:text-[#111111]'
                    }`}
                  >
                    Step {step}
                  </button>
                ))}
              </div>
            </div>

            {/* Demonstration steps */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1: AI Creates */}
              <div
                onClick={() => setActiveStep(1)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 1
                    ? 'border-[#19A974] bg-[#E8F7F0]/30 shadow-xs'
                    : 'border-[#E7E7E4] hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#6B6B6B] mb-2">1. AI Creates</div>
                <div className="font-mono text-xs font-semibold text-[#111111] break-all bg-neutral-100 p-2 rounded-lg">
                  image_847392_final2.png
                </div>
                <p className="text-xs text-[#6B6B6B] mt-3">
                  ChatGPT or Gemini produces an export with arbitrary filenames.
                </p>
              </div>

              {/* Step 2: Orfilo Understands */}
              <div
                onClick={() => setActiveStep(2)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 2
                    ? 'border-[#19A974] bg-[#E8F7F0]/30 shadow-xs'
                    : 'border-[#E7E7E4] hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#6B6B6B] mb-2">2. Orfilo Understands</div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B]">Project:</span>
                    <span className="font-semibold text-[#111111]">Meto</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B]">Category:</span>
                    <span className="font-semibold text-[#111111]">Marketing</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B6B6B]">Purpose:</span>
                    <span className="font-semibold text-[#111111]">Hero image</span>
                  </div>
                </div>
                <p className="text-xs text-[#6B6B6B] mt-3">
                  Understands without interrogating you with a 5-step form.
                </p>
              </div>

              {/* Step 3: Orfilo Organizes */}
              <div
                onClick={() => setActiveStep(3)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 3
                    ? 'border-[#19A974] bg-[#E8F7F0]/30 shadow-xs'
                    : 'border-[#E7E7E4] hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#6B6B6B] mb-2">3. Orfilo Organizes</div>
                <div className="space-y-2">
                  <div className="font-mono text-xs text-[#19A974] font-medium truncate">
                    meto-hero-v1.png
                  </div>
                  <div className="text-[11px] font-mono text-[#6B6B6B] truncate bg-neutral-50 p-1.5 rounded">
                    Meto / Marketing / Images
                  </div>
                </div>
                <p className="text-xs text-[#6B6B6B] mt-3">
                  Filed deterministically to your storage and searchable index.
                </p>
              </div>

              {/* Step 4: Find it later */}
              <div
                onClick={() => setActiveStep(4)}
                className={`p-5 rounded-xl border transition-all cursor-pointer ${
                  activeStep === 4
                    ? 'border-[#19A974] bg-[#E8F7F0]/30 shadow-xs'
                    : 'border-[#E7E7E4] hover:border-neutral-400 bg-white'
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-[#6B6B6B] mb-2">4. Find It Later</div>
                <div className="text-xs italic text-[#111111] bg-neutral-100 p-2 rounded-lg">
                  "Find the hero image I made for Meto"
                </div>
                <p className="text-xs text-[#6B6B6B] mt-3">
                  Retrieved instantly even if you don't remember the original name.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#E8F7F0] text-[#19A974] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#111111]">Quiet Intelligence</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Orfilo interrupts only when human input materially improves the result. Otherwise, it quietly does the work.
            </p>
          </div>

          <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#111111]">Secure Data Isolation</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Every artifact is private to your authenticated account with row-level security guaranteeing zero cross-user access.
            </p>
          </div>

          <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-[#111111] flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#111111]">User-Owned Storage</h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              Orfilo is not a closed silo. Pluggable storage architecture connects directly with your personal Google Drive or cloud storage.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E7E4] py-8 px-6 md:px-12 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6B6B6B]">
        <div className="flex items-center gap-3">
          <OrfiloBrand variant="icon-only" size="sm" />
          <span>© 2026 Orfilo. Everything your AI creates. Organized.</span>
        </div>
        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <button onClick={onReturnToDashboard} className="hover:text-[#19A974] cursor-pointer font-medium">
              Go to Dashboard
            </button>
          ) : (
            <>
              <button onClick={onSignIn} className="hover:text-[#111111] cursor-pointer">
                Sign in
              </button>
              <button onClick={onSignUp} className="hover:text-[#111111] cursor-pointer font-medium text-[#19A974]">
                Get started
              </button>
            </>
          )}
        </div>
      </footer>
    </div>
  );
};
