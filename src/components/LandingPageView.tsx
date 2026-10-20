import React from 'react';
import {
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Chrome,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { OrfiloBrand, OrfiloIcon } from './OrfiloBrand.tsx';
import { OrfiloHeroMatrix } from './orfilo/OrfiloHeroMatrix.tsx';
import { OrfiloBentoGrid } from './orfilo/OrfiloBentoGrid.tsx';
import { OrfiloExplorer } from './orfilo/OrfiloExplorer.tsx';
import { OrfiloRoiCalculator } from './orfilo/OrfiloRoiCalculator.tsx';
import { OrfiloPricing } from './orfilo/OrfiloPricing.tsx';
import { OrfiloTestimonials } from './orfilo/OrfiloTestimonials.tsx';
import { OrfiloFaq } from './orfilo/OrfiloFaq.tsx';

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
  const handlePrimaryCta = () => {
    if (isLoggedIn && onReturnToDashboard) {
      onReturnToDashboard();
    } else {
      onSignUp();
    }
  };

  const handleSelectPricingTier = (_tierId: string) => {
    handlePrimaryCta();
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF9F5] text-[#121212] font-sans selection:bg-[#19A974]/20 selection:text-[#19A974] flex flex-col">
      {/* Delicate Ambient Page Illumination Blooms */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[800px] rounded-full bg-gradient-to-b from-[#19A974]/12 via-[#2CD59B]/6 to-transparent blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-[900px] right-0 size-[600px] rounded-full bg-gradient-to-bl from-[#19A974]/8 via-[#E8F7F0]/30 to-transparent blur-[120px]"
        aria-hidden="true"
      />

      {/* =============================================================== */}
      {/* 1. STICKY FULL-PAGE HEADER NAVIGATION                            */}
      {/* =============================================================== */}
      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-[#FAF9F5]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <a
            href="#hero"
            className="group flex items-center transition-transform duration-150 active:scale-[0.97]"
          >
            <OrfiloBrand variant="horizontal" size="md" />
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[13.5px] font-medium text-[#4D4D4D]">
            <a
              href="#features"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              Features
            </a>
            <a
              href="#explorer"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              Vault Explorer
            </a>
            <a
              href="#calculator"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              ROI Calculator
            </a>
            <a
              href="#pricing"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              FAQ
            </a>
          </nav>

          {/* Header Action CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onReturnToDashboard}
                className="inline-flex items-center gap-2 rounded-full bg-[#121212] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-[0_4px_16px_rgba(0,0,0,0.22)] active:scale-[0.97] cursor-pointer"
              >
                <span>Dashboard</span>
                <ArrowRight className="size-3.5 stroke-[2.2]" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="hidden sm:inline-block text-[13px] font-medium text-[#4D4D4D] hover:text-black px-2 py-1 transition-colors cursor-pointer"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={onSignUp}
                  className="inline-flex items-center gap-2 rounded-full bg-[#121212] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-[0_4px_16px_rgba(0,0,0,0.22)] active:scale-[0.97] cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="size-3.5 stroke-[2.2]" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Full-Page Content */}
      <main className="flex-1 w-full flex flex-col">
        {/* =============================================================== */}
        {/* 2. HERO SECTION                                                 */}
        {/* =============================================================== */}
        <section
          id="hero"
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-20 sm:pb-28"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start gap-7 max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[#E8F7F0] border border-[#BCEBD7] px-3.5 py-1.5 text-[13px] font-medium text-[#19A974]">
                <Sparkles className="size-3.5 fill-[#19A974]" />
                <span>Over 18,400+ AI deliverables organized</span>
              </div>

              {/* Exact Hero Typographic Hierarchy */}
              <div className="flex flex-col gap-1 tracking-tight">
                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-[#4D4D4D] tracking-[-0.02em]">
                  Capture once and
                </h2>
                <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-bold text-[#121212] tracking-[-0.035em] leading-[1.08]">
                  Organize your AI files <br />
                  <span className="text-[#19A974]">everywhere</span>
                </h1>
              </div>

              {/* Tagline */}
              <p className="text-[15px] sm:text-base text-[#616161] leading-relaxed max-w-xl">
                Everything your AI creates. Organized. Automatically capture code,
                images, and documents from ChatGPT, Claude, Gemini, and Cursor into
                clean project subfolders with AI semantic naming.
              </p>

              {/* 3 Value Prop Checkmarks */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1 text-[13px] font-medium text-[#4D4D4D]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#19A974] stroke-[2.2]" />
                  <span>Auto-named by Gemini AI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#19A974] stroke-[2.2]" />
                  <span>1-Click Chrome Extension</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#19A974] stroke-[2.2]" />
                  <span>Zero Lost AI Deliverables</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  className="inline-flex items-center gap-2.5 rounded-full bg-[#121212] px-7 py-3.5 text-[14.5px] font-medium text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-[0_6px_22px_rgba(0,0,0,0.26)] active:scale-[0.97] cursor-pointer"
                >
                  <span>Start Free with Orfilo</span>
                  <ArrowRight className="size-4 stroke-[2.2]" />
                </button>

                <a
                  href="#explorer"
                  className="inline-flex items-center gap-2 rounded-full bg-white border border-[#DFD9D1] px-5 py-3.5 text-[13.5px] font-medium text-[#2E2E2E] shadow-xs transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-[#FAF8F5] active:scale-[0.97]"
                >
                  <Chrome className="size-4 text-[#19A974]" />
                  <span>Chrome Extension • Free</span>
                </a>
              </div>
            </div>

            {/* Right Column: 5x5 AI Models Matrix with Floating Orfilo Tile */}
            <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center">
              <OrfiloHeroMatrix onCtaClick={handlePrimaryCta} />
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 3. BENTO GRID FEATURES (TRANSFORMER + VELOCITY SPLINE)          */}
        {/* =============================================================== */}
        <section
          id="features"
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24"
        >
          <OrfiloBentoGrid onCtaClick={handlePrimaryCta} />
        </section>

        {/* =============================================================== */}
        {/* 4. INTERACTIVE VAULT EXPLORER                                   */}
        {/* =============================================================== */}
        <section
          id="explorer"
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-black/5"
        >
          <OrfiloExplorer onCtaClick={handlePrimaryCta} />
        </section>

        {/* =============================================================== */}
        {/* 5. TIME & FOCUS ROI CALCULATOR                                  */}
        {/* =============================================================== */}
        <section
          id="calculator"
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-black/5"
        >
          <OrfiloRoiCalculator onCtaClick={handlePrimaryCta} />
        </section>

        {/* =============================================================== */}
        {/* 6. TRANSPARENT PRICING TIERS                                    */}
        {/* =============================================================== */}
        <section
          id="pricing"
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-black/5"
        >
          <OrfiloPricing onSelectTier={handleSelectPricingTier} />
        </section>

        {/* =============================================================== */}
        {/* 7. FOUNDER & BUILDER TESTIMONIALS                               */}
        {/* =============================================================== */}
        <section
          id="testimonials"
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-black/5"
        >
          <OrfiloTestimonials />
        </section>

        {/* =============================================================== */}
        {/* 8. FAQ ACCORDION                                                */}
        {/* =============================================================== */}
        <section
          id="faq"
          className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-black/5"
        >
          <OrfiloFaq />
        </section>
      </main>

      {/* =============================================================== */}
      {/* 9. FULL-PAGE MODERN FOOTER                                       */}
      {/* =============================================================== */}
      <footer className="w-full border-t border-black/5 bg-[#F4F1EB] py-16 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start justify-between">
            {/* Brand column */}
            <div className="md:col-span-5 flex flex-col gap-4">
              <OrfiloBrand variant="horizontal" size="md" />
              <p className="text-[13.5px] text-[#6B6B6B] leading-relaxed max-w-sm">
                Everything your AI creates. Organized. The dedicated vault for
                engineers, designers, and founders using ChatGPT, Claude, Gemini,
                and Cursor.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-[#19A974] font-medium">
                <Lock className="size-3.5 stroke-[2.2]" />
                <span>Protected by PostgreSQL Supabase Row-Level Security</span>
              </div>
            </div>

            {/* Navigation Columns */}
            <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
                  Product
                </span>
                <a href="#features" className="text-xs text-[#666666] hover:text-black transition-colors">
                  Semantic Naming
                </a>
                <a href="#explorer" className="text-xs text-[#666666] hover:text-black transition-colors">
                  Vault Explorer
                </a>
                <a href="#calculator" className="text-xs text-[#666666] hover:text-black transition-colors">
                  ROI Calculator
                </a>
                <a href="#pricing" className="text-xs text-[#666666] hover:text-black transition-colors">
                  Pricing Plans
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
                  Extension
                </span>
                <a href="#hero" className="text-xs text-[#666666] hover:text-black transition-colors">
                  Chrome Extension
                </a>
                <a href="#hero" className="text-xs text-[#666666] hover:text-black transition-colors">
                  Supported AI Models
                </a>
                <a href="#faq" className="text-xs text-[#666666] hover:text-black transition-colors">
                  Security & RLS
                </a>
                <a href="#faq" className="text-xs text-[#666666] hover:text-black transition-colors">
                  FAQ
                </a>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-[#1F1F1F] uppercase tracking-wider">
                  Account
                </span>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="text-left text-xs text-[#666666] hover:text-black transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onSignUp}
                  className="text-left text-xs text-[#666666] hover:text-black transition-colors cursor-pointer"
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={handlePrimaryCta}
                  className="text-left text-xs text-[#19A974] font-semibold hover:underline transition-colors cursor-pointer"
                >
                  Pro Lifetime Deal
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Status Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#EAE5DC] text-xs text-[#7A7A7A]">
            <span>&copy; {new Date().getFullYear()} Orfilo Inc. All rights reserved.</span>
            <div className="flex items-center gap-6">
              <span>All Systems Operational</span>
              <span>•</span>
              <span>PostgreSQL RLS Active</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
