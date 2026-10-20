import React, { useState } from 'react';
import { DirectoryExplorer } from './DirectoryExplorer';
import { PricingTiers } from './PricingTiers';
import { FounderTestimonials } from './FounderTestimonials';
import { ConversionFaq } from './ConversionFaq';
import { RoiCalculator } from './RoiCalculator';

export const LaunchdirLandingView: React.FC = () => {
  const [selectedPlanForModal, setSelectedPlanForModal] = useState<string | null>(null);

  const handleSelectTier = (tier: string) => {
    setSelectedPlanForModal(tier.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Scarcity / Announcement Notification Bar */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 py-2.5 px-4 text-center text-xs text-indigo-100 border-b border-indigo-500/20 sticky top-0 z-50 backdrop-blur-md">
        <span className="font-semibold text-white">⚡ October Launch Sprint:</span> Due to high manual submission volume, only{' '}
        <span className="font-bold underline text-emerald-300">4 spots remaining</span> in today's submission queue.{' '}
        <a href="#pricing" className="underline hover:text-white font-bold ml-1">
          Lock in your spot →
        </a>
      </div>

      {/* Navigation Header */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
            L
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            Launch<span className="text-indigo-400">dir</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#directory-database" className="hover:text-white transition-colors">
            Directories Index
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#testimonials" className="hover:text-white transition-colors">
            Case Studies
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white text-zinc-950 font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-all shadow-md shadow-white/5"
          >
            Get Listed Now
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Hero glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium mb-8 shadow-xl">
            <span className="flex -space-x-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-black">✓</span>
              <span className="w-5 h-5 rounded-full bg-indigo-500 border border-zinc-900 flex items-center justify-center text-[10px] font-bold text-white">★</span>
            </span>
            <span>Over <strong>1,420+ founders</strong> boosted their domain rating</span>
            <span className="text-zinc-600">•</span>
            <span className="text-emerald-400 font-semibold">Avg. +24 DR in 30 days</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
            Submit Your Startup To <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              150+ High-Authority Directories
            </span>{' '}
            in 48 Hours.
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-xl text-zinc-300 mb-10 leading-relaxed font-normal">
            Skip 60+ hours of tedious manual submissions. We hand-submit your startup to 
            Product Hunt, AlternativeTo, Indie Hackers, and 150+ top directories to ignite your 
            Domain Rating (DR), capture early paying users, and dominate Google search rankings.
          </p>

          {/* Primary Conversion CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-extrabold rounded-2xl shadow-xl shadow-indigo-500/25 transition-all text-base hover:scale-[1.02] flex items-center justify-center gap-2 group"
            >
              <span>Boost My Domain Rating ($49+)</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>

            <a
              href="#directory-database"
              className="w-full sm:w-auto px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-semibold rounded-2xl border border-zinc-800 transition-colors text-base flex items-center justify-center gap-2"
            >
              <span>Explore 150+ Directories</span>
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Micro-Risk Reversal Bullets */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              100% Manual Human Submissions
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Live Google Sheets Proof Tracker
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              30-Day Full Index Guarantee
            </span>
          </div>

          {/* Directory Brand Authority Strip */}
          <div className="mt-16 pt-10 border-t border-zinc-900">
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-6">
              Guaranteed Direct Submissions To Elite Authority Platforms
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-zinc-300">PRODUCT HUNT (DR 91)</span>
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-zinc-300">INDIE HACKERS (DR 88)</span>
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-zinc-300">ALTERNATIVETO (DR 85)</span>
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-zinc-300">BETALIST (DR 78)</span>
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-zinc-300">TOOLIFY.AI (DR 76)</span>
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-zinc-300">UNEED (DR 72)</span>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Interactive Directory Explorer */}
      <DirectoryExplorer onSelectTier={handleSelectTier} />

      {/* Section 2: Interactive ROI Calculator */}
      <RoiCalculator />

      {/* Section 3: Pricing Packages */}
      <PricingTiers onSelectTier={handleSelectTier} />

      {/* Section 4: Verified Founder Testimonials */}
      <FounderTestimonials />

      {/* Section 5: Objection Handling Conversion FAQ */}
      <ConversionFaq />

      {/* Final High-Converting Conversion Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-zinc-950 border-t border-zinc-900">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-zinc-900 p-8 sm:p-14 border border-indigo-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 tracking-tight">
            Ready to Skyrocket Your Domain Authority?
          </h2>
          <p className="text-zinc-300 text-sm sm:text-lg max-w-2xl mx-auto mb-8">
            Stop letting competitor startups outrank you on Google. Hand off the tedious 
            directory submissions to our team today and get live links in your inbox this week.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#pricing"
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold rounded-2xl shadow-xl transition-transform hover:scale-105 text-sm sm:text-base"
            >
              Choose Your Directory Package →
            </a>
          </div>

          <p className="text-xs text-zinc-400 mt-4">
            Takes 3 minutes • 100% Manual • 30-Day Money-Back Guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-900 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Launchdir</span>
            <span>© {new Date().getFullYear()} Launchdir Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#directory-database" className="hover:text-zinc-300">Directories</a>
            <a href="#pricing" className="hover:text-zinc-300">Pricing</a>
            <a href="#testimonials" className="hover:text-zinc-300">Case Studies</a>
            <a href="#faq" className="hover:text-zinc-300">FAQ</a>
            <a href="mailto:support@launchdir.com" className="hover:text-zinc-300">Contact</a>
          </div>
        </div>
      </footer>

      {/* Quick Intake Modal Preview if user clicks a package */}
      {selectedPlanForModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedPlanForModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Instant Checkout
              </span>
              <h3 className="text-xl font-bold text-white mt-1 capitalize">
                {selectedPlanForModal} Package Selected
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                You will be redirected to the secure Stripe checkout. After payment, you will immediately fill out your 3-minute product intake form.
              </p>
            </div>

            <div className="space-y-3 mb-6 text-xs text-zinc-300">
              <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-emerald-400">✓</span>
                <span>Immediate placement in the active submission queue</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-emerald-400">✓</span>
                <span>Live Google Sheet tracker link generated instantly</span>
              </div>
              <div className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <span className="text-emerald-400">✓</span>
                <span>Backed by 30-Day Money-Back Guarantee</span>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Proceeding to secure checkout for ${selectedPlanForModal} plan...`);
                setSelectedPlanForModal(null);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 text-sm"
            >
              Proceed to Secure Stripe Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
