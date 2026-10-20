import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Search,
  Mic,
  X,
  Sparkles,
  BarChart3,
  Users2,
  Hourglass,
  CheckCircle2,
  Globe2,
  TrendingUp,
  Image as ImageIcon,
  Video,
  ShoppingBag,
  MapPin,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Check,
  Filter,
  DollarSign,
  Clock,
  Award,
  Zap,
} from 'lucide-react';
import { DIRECTORIES_DATA, Directory } from '../data/directories';
import { PRICING_TIERS, GUARANTEE_POINTS, PricingTier } from '../data/pricing';
import { FOUNDER_TESTIMONIALS, SOCIAL_PROOF_METRICS } from '../data/testimonials';
import { FAQ_ITEMS } from '../data/faqs';

interface LandingPageViewProps {
  onSignIn: () => void;
  onSignUp: () => void;
  isLoggedIn?: boolean;
  onReturnToDashboard?: () => void;
}

/**
 * Launchdir Rocket Icon
 * Exact aerodynamic lozenge rocket geometry from the reference screenshot
 */
export const LaunchdirRocketIcon: React.FC<{ className?: string }> = ({ className = 'size-6' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M29.5 8.5C24.8 13.2 21.2 20.4 19.5 25.5L22.5 28.5C27.6 26.8 34.8 23.2 39.5 18.5C41.2 16.8 41.5 13.9 40 12C38.5 10.1 35.6 9.8 33.5 10.5L29.5 8.5Z"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17 28L11 34C9.5 35.5 9.5 38 11 39.5C12.5 41 15 41 16.5 39.5L22.5 33.5"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 23.5L12 21C10.5 19.5 11 17 13 16.5L18 16"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M24.5 33L27 36C28.5 37.5 31 37 31.5 35L32 30"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="29" cy="19" r="2.5" fill="currentColor" />
  </svg>
);

interface DirectoryTile {
  id: string;
  name: string;
  glyph: string;
  opacity: string;
  isSpecial?: boolean;
}

const DIRECTORY_TILES: DirectoryTile[] = [
  // Row 1
  { id: '1-1', name: 'Product Hunt', glyph: 'P', opacity: 'opacity-40' },
  { id: '1-2', name: 'AppSumo', glyph: '≡', opacity: 'opacity-40' },
  { id: '1-3', name: 'G2', glyph: 'G2', opacity: 'opacity-30' },
  { id: '1-4', name: 'BetaList', glyph: 'B', opacity: 'opacity-25' },
  { id: '1-5', name: 'AlternativeTo', glyph: 'A', opacity: 'opacity-20' },
  // Row 2
  { id: '2-1', name: 'Trustpilot', glyph: '★', opacity: 'opacity-45' },
  { id: '2-2', name: 'Reddit', glyph: '●', opacity: 'opacity-65' },
  { id: '2-3', name: 'Product Hunt', glyph: 'P', opacity: 'opacity-70' },
  { id: '2-4', name: 'Capterra', glyph: 'C', opacity: 'opacity-60' },
  { id: '2-5', name: 'SoftwareAdvice', glyph: 'S', opacity: 'opacity-35' },
  // Row 3
  { id: '3-1', name: 'Telegram', glyph: '✈', opacity: 'opacity-55' },
  { id: '3-2', name: 'Product Hunt', glyph: 'P', opacity: 'opacity-75' },
  { id: '3-3', name: 'LAUNCHDIR_CENTER', glyph: 'ROCKET', opacity: 'opacity-100', isSpecial: true },
  { id: '3-4', name: 'Indie Hackers', glyph: 'IH', opacity: 'opacity-75' },
  { id: '3-5', name: 'Next30', glyph: 'Next', opacity: 'opacity-55' },
  // Row 4
  { id: '4-1', name: 'Crunchbase', glyph: 'C', opacity: 'opacity-50' },
  { id: '4-2', name: 'BetaPage', glyph: 'BetaPage', opacity: 'opacity-65' },
  { id: '4-3', name: 'StartupBase', glyph: 'SP', opacity: 'opacity-70' },
  { id: '4-4', name: 'Reddit', glyph: '●', opacity: 'opacity-65' },
  { id: '4-5', name: 'Product Hunt', glyph: 'P', opacity: 'opacity-45' },
  // Row 5
  { id: '5-1', name: 'F6S', glyph: 'F', opacity: 'opacity-25' },
  { id: '5-2', name: 'PitchBook', glyph: 'PB', opacity: 'opacity-30' },
  { id: '5-3', name: 'StartupBase', glyph: 'SB', opacity: 'opacity-55' },
  { id: '5-4', name: 'Product Hunt', glyph: '◉', opacity: 'opacity-40' },
  { id: '5-5', name: 'TechCrunch', glyph: 'TC', opacity: 'opacity-20' },
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSignIn,
  onSignUp,
  isLoggedIn = false,
  onReturnToDashboard,
}) => {
  // Mockup card active tab state
  const [googleTab, setGoogleTab] = useState<'Tous' | 'Images' | 'Video' | 'Shopping' | 'Maps'>('Tous');
  const [hoveredTooltip, setHoveredTooltip] = useState<'moderate' | 'high' | null>(null);

  // Directory explorer state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minDr, setMinDr] = useState<number>(0);
  const [dofollowOnly, setDofollowOnly] = useState<boolean>(false);

  // ROI Calculator state
  const [hourlyRate, setHourlyRate] = useState<number>(75);
  const [selectedDirsCount, setSelectedDirsCount] = useState<number>(90);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Primary Action Handler
  const handlePrimaryCta = () => {
    if (isLoggedIn && onReturnToDashboard) {
      onReturnToDashboard();
    } else {
      onSignUp();
    }
  };

  // Filtered directories calculation
  const filteredDirectories = useMemo(() => {
    return DIRECTORIES_DATA.filter((dir) => {
      const matchesSearch =
        dir.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dir.categories.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === 'All' || dir.categories.includes(selectedCategory as any);
      const matchesDr = dir.domainRating >= minDr;
      const matchesDoFollow = !dofollowOnly || dir.backlinkType === 'Do-Follow';
      return matchesSearch && matchesCategory && matchesDr && matchesDoFollow;
    });
  }, [searchTerm, selectedCategory, minDr, dofollowOnly]);

  // ROI Math: 35 mins per manual submission
  const hoursSpent = Math.round((selectedDirsCount * 35) / 60);
  const manualLaborCost = hoursSpent * hourlyRate;
  const launchdirCost = selectedDirsCount <= 40 ? 49 : selectedDirsCount <= 90 ? 99 : 199;
  const netSavings = Math.max(0, manualLaborCost - launchdirCost);

  return (
    <div className="relative min-h-screen w-full bg-[#FF5A26] p-3 sm:p-5 md:p-8 lg:p-12 font-sans selection:bg-[#FF5A26]/20 selection:text-[#FF5A26] flex items-center justify-center">
      {/* Radiant Orange Outer Ambient Lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[700px] rounded-full bg-gradient-to-b from-[#FFA066]/35 to-transparent blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-10 size-[550px] rounded-full bg-gradient-to-t from-[#FF7A42]/30 to-transparent blur-[110px]"
        aria-hidden="true"
      />

      {/* Main Luxury Frame (Direct Match to Reference Screenshot) */}
      <main className="relative w-full max-w-6xl rounded-[32px] bg-[#FAF8F5] border border-white/60 shadow-[0_30px_90px_-20px_rgba(180,45,10,0.38),0_0_0_1px_rgba(255,255,255,0.7)_inset] overflow-hidden">
        {/* Subtle Ambient Mesh Inside Canvas */}
        <div
          className="pointer-events-none absolute top-40 right-10 size-[550px] rounded-full bg-[radial-gradient(circle,_rgba(255,90,38,0.18)_0%,_rgba(255,160,100,0.08)_40%,_transparent_70%)] blur-[75px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_bottom,_rgba(255,90,38,0.30)_0%,_rgba(255,140,80,0.12)_40%,_transparent_75%)]"
          aria-hidden="true"
        />

        {/* =============================================================== */}
        {/* 1. HEADER NAVIGATION (PIXEL-PERFECT MATCH TO REFERENCE)          */}
        {/* =============================================================== */}
        <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 lg:px-14 py-6">
          <a
            href="#home"
            className="group flex items-center gap-2.5 transition-transform duration-150 active:scale-[0.97]"
          >
            <div className="flex size-8 items-center justify-center text-[#FF5A26] transition-transform duration-200 group-hover:rotate-6">
              <LaunchdirRocketIcon className="size-7" />
            </div>
            <span className="text-[19px] font-bold tracking-tight text-[#171717]">
              launchdir
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[13.5px] font-medium text-[#4D4D4D]">
            <a
              href="#how-it-works"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              How it works
            </a>
            <a
              href="#directories"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              Directories
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

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onReturnToDashboard}
                className="inline-flex items-center gap-2 rounded-full bg-[#121212] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-[0_4px_16px_rgba(0,0,0,0.22)] active:scale-[0.97]"
              >
                <span>Dashboard</span>
                <ArrowRight className="size-3.5 stroke-[2.2]" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="hidden sm:inline-block text-[13px] font-medium text-[#4D4D4D] hover:text-black px-2 py-1 transition-colors"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={onSignUp}
                  className="inline-flex items-center gap-2 rounded-full bg-[#121212] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-[0_4px_16px_rgba(0,0,0,0.22)] active:scale-[0.97]"
                >
                  <span>Get started</span>
                  <ArrowRight className="size-3.5 stroke-[2.2]" />
                </button>
              </>
            )}
          </div>
        </header>

        {/* =============================================================== */}
        {/* 2. HERO SECTION (EXACT ASYMMETRIC GRID & FLOATING ROCKET TILE)  */}
        {/* =============================================================== */}
        <section
          id="home"
          className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center px-6 sm:px-10 lg:px-14 pt-6 pb-20"
        >
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start gap-7 max-w-xl">
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6B6B6B]">
              <Sparkles className="size-3.5 text-[#FF5A26] fill-[#FF5A26]" />
              <span>256 Startups successfully boosted</span>
            </div>

            <div className="flex flex-col gap-1 tracking-tight">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-[#1A1A1A] tracking-[-0.02em]">
                Submit once and
              </h2>
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-bold text-[#121212] tracking-[-0.035em] leading-[1.08]">
                List your startup <br />
                <span className="text-[#FF5A26]">everywhere</span>
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-1 text-[13px] font-medium text-[#4D4D4D]">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-[#FF5A26] stroke-[2.2]" />
                <span>Instant SEO boost</span>
              </div>
              <div className="flex items-center gap-2">
                <Users2 className="size-4 text-[#FF5A26] stroke-[2.2]" />
                <span>Increase your audience</span>
              </div>
              <div className="flex items-center gap-2">
                <Hourglass className="size-4 text-[#FF5A26] stroke-[2.2]" />
                <span>Save time</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePrimaryCta}
              className="inline-flex items-center gap-2.5 rounded-full bg-[#121212] px-7 py-3.5 text-[14.5px] font-medium text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-[0_6px_22px_rgba(0,0,0,0.26)] active:scale-[0.97] cursor-pointer"
            >
              <span>Get listed on 100+ directories</span>
              <ArrowRight className="size-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Right Column: 5x5 Icon Matrix with Floating Center Tile */}
          <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center">
            {/* Soft Radiant Orange Aura */}
            <div
              className="pointer-events-none absolute size-80 sm:size-96 rounded-full bg-gradient-to-tr from-[#FF5A26]/40 via-[#FF8F52]/25 to-transparent blur-[65px]"
              aria-hidden="true"
            />

            <div className="relative grid grid-cols-5 gap-3 sm:gap-3.5 p-4 rounded-3xl">
              {DIRECTORY_TILES.map((tile) => {
                if (tile.isSpecial) {
                  return (
                    <div
                      key={tile.id}
                      className="relative size-12 sm:size-14 flex items-center justify-center"
                    >
                      <div
                        onClick={handlePrimaryCta}
                        className="absolute z-20 size-20 sm:size-24 rounded-[22px] bg-white border border-white/80 shadow-[0_20px_45px_-8px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#FF5A26] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-6px_rgba(255,90,38,0.24)] cursor-pointer"
                      >
                        <LaunchdirRocketIcon className="size-11 sm:size-13" />
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={tile.id}
                    title={tile.name}
                    className={`size-12 sm:size-14 rounded-2xl bg-[#ECE7E1]/80 backdrop-blur-xs border border-white/60 flex items-center justify-center text-[#2A2A2A] font-bold text-xs sm:text-sm select-none transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white hover:scale-105 hover:shadow-sm ${tile.opacity}`}
                  >
                    {tile.glyph === 'BetaPage' ? (
                      <span className="text-[9px] font-semibold tracking-tighter">
                        BetaPage
                      </span>
                    ) : tile.glyph === 'Next' ? (
                      <span className="text-[10px] font-semibold tracking-tighter">
                        Next
                      </span>
                    ) : (
                      <span>{tile.glyph}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 3. BENTO 1: BOOST ONLINE PRESENCE (GOOGLE SEARCH RESULT CARD)     */}
        {/* =============================================================== */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-14 pb-10">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-[28px] bg-white/95 border border-[#ECE7E1] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.04)] p-8 sm:p-12 overflow-hidden">
            <div
              className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-gradient-to-tl from-[#FF5A26]/20 via-[#FFB085]/15 to-transparent blur-[70px]"
              aria-hidden="true"
            />

            {/* Left Copy Column */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <div className="flex flex-col gap-1 tracking-tight">
                <h3 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-[1.12]">
                  Boost your <br />
                  Online Presence
                </h3>
              </div>

              <p className="text-[14px] sm:text-[14.5px] text-[#636363] leading-relaxed max-w-md">
                Make it easy for your audience to find you. We&apos;ll list your
                startup on trusted directories and platforms where your
                customers are already searching.
              </p>

              <div className="flex flex-col gap-3.5 pt-2">
                <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
                  <div className="flex size-5 items-center justify-center rounded-md text-[#FF5A26]">
                    <CheckCircle2 className="size-4 stroke-[2.2]" />
                  </div>
                  <span>Be visible where it matters most</span>
                </div>
                <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
                  <div className="flex size-5 items-center justify-center rounded-md text-[#FF5A26]">
                    <TrendingUp className="size-4 stroke-[2.2]" />
                  </div>
                  <span>Reach your target audience effortlessly</span>
                </div>
                <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
                  <div className="flex size-5 items-center justify-center rounded-md text-[#FF5A26]">
                    <Globe2 className="size-4 stroke-[2.2]" />
                  </div>
                  <span>Expand your online presence across trusted platforms</span>
                </div>
              </div>
            </div>

            {/* Right Mockup Column (Google Card) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div
                className="pointer-events-none absolute size-72 rounded-full bg-gradient-to-br from-[#FF9860]/25 via-[#FFA873]/15 to-transparent blur-[60px]"
                aria-hidden="true"
              />

              <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8E3DD] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] p-5 sm:p-6 flex flex-col gap-4">
                {/* Search Pill Input */}
                <div className="flex items-center justify-between rounded-full border border-[#DFD8D0] bg-[#FAF8F5] px-4 py-2.5 shadow-inner">
                  <span className="text-[12.5px] font-normal text-[#2A2A2A]">
                    Your Company
                  </span>
                  <div className="flex items-center gap-2.5 text-[#8A8A8A]">
                    <X className="size-3.5 cursor-pointer hover:text-black transition-colors" />
                    <Mic className="size-3.5 cursor-pointer text-[#4285F4]" />
                    <Search className="size-3.5 cursor-pointer text-[#8A8A8A]" />
                  </div>
                </div>

                {/* Search Category Tabs */}
                <div className="flex items-center gap-4 border-b border-[#F0ECE6] pb-2.5 text-[11px] font-medium text-[#6B6B6B]">
                  {(['Tous', 'Images', 'Video', 'Shopping', 'Maps'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setGoogleTab(tab)}
                      className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all cursor-pointer ${
                        googleTab === tab
                          ? 'border-[#4285F4] text-[#1A73E8]'
                          : 'border-transparent text-[#6B6B6B] hover:text-black'
                      }`}
                    >
                      {tab === 'Tous' && <Search className="size-3" />}
                      {tab === 'Images' && <ImageIcon className="size-3" />}
                      {tab === 'Video' && <Video className="size-3" />}
                      {tab === 'Shopping' && <ShoppingBag className="size-3" />}
                      {tab === 'Maps' && <MapPin className="size-3" />}
                      <span>{tab === 'Video' ? 'Vidéo' : tab}</span>
                    </button>
                  ))}
                </div>

                {/* Organic Search Result */}
                <div className="flex flex-col gap-1 pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#555555]">
                    <div className="size-3.5 rounded-full bg-[#FF5A26] flex items-center justify-center text-white text-[8px] font-bold">
                      Y
                    </div>
                    <span className="truncate">yourcompany.com</span>
                  </div>
                  <h4 className="text-[16px] font-medium text-[#1A0DAB] hover:underline cursor-pointer tracking-tight">
                    Your Company
                  </h4>
                  <p className="text-[12px] text-[#4D5156] leading-relaxed">
                    Most people click on one of the top few results when
                    searching, so if your website isn&apos;t there, you&apos;re
                    missing out on potential customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 4. BENTO 2: BUILD TRUST & CREDIBILITY (DA GRAPH & TOOLTIPS)      */}
        {/* =============================================================== */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-14 pb-16">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-[28px] bg-white/95 border border-[#ECE7E1] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.04)] p-8 sm:p-12 overflow-hidden">
            <div
              className="pointer-events-none absolute -top-16 -left-16 size-72 rounded-full bg-gradient-to-br from-[#FF5A26]/18 via-[#FF9E66]/12 to-transparent blur-[65px]"
              aria-hidden="true"
            />

            {/* Left Graphic: Domain Authority Over Time Area Curve */}
            <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8E3DD] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-[#888888] tracking-tight">
                    Domain authority over time
                  </span>
                  <div className="size-2 rounded-full bg-[#FF5A26]" />
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
                        id="daAreaGradient"
                        x1="170"
                        y1="15"
                        x2="170"
                        y2="155"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#FF5A26" stopOpacity="0.32" />
                        <stop offset="0.6" stopColor="#FFA066" stopOpacity="0.12" />
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
                      fill="url(#daAreaGradient)"
                    />

                    {/* High-tension Ascending Spline */}
                    <path
                      d="M 15 145 C 80 142, 130 115, 185 80 C 235 48, 265 32, 320 20"
                      stroke="#FF5A26"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />

                    <circle cx="185" cy="80" r="4.5" fill="#FFFFFF" stroke="#FF5A26" strokeWidth="2.5" />
                    <circle cx="275" cy="35" r="4.5" fill="#FFFFFF" stroke="#FF5A26" strokeWidth="2.5" />
                  </svg>

                  {/* Tooltip 1: 21-40 Moderate */}
                  <div
                    onMouseEnter={() => setHoveredTooltip('moderate')}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    style={{ left: '53%', top: '38%' }}
                    className="absolute -translate-x-1/2 -translate-y-full mb-2 cursor-pointer z-10"
                  >
                    <div
                      className={`flex flex-col items-center rounded-xl bg-white border border-[#E6E1DA] px-2.5 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        hoveredTooltip === 'moderate'
                          ? 'scale-105 -translate-y-0.5'
                          : ''
                      }`}
                    >
                      <span className="text-[11.5px] font-bold text-[#1F1F1F]">
                        21-40
                      </span>
                      <span className="text-[9.5px] font-medium text-[#777777]">
                        Moderate
                      </span>
                    </div>
                  </div>

                  {/* Tooltip 2: 41-60 High */}
                  <div
                    onMouseEnter={() => setHoveredTooltip('high')}
                    onMouseLeave={() => setHoveredTooltip(null)}
                    style={{ left: '79%', top: '15%' }}
                    className="absolute -translate-x-1/2 -translate-y-full mb-2 cursor-pointer z-10"
                  >
                    <div
                      className={`flex flex-col items-center rounded-xl bg-white border border-[#E6E1DA] px-2.5 py-1 shadow-[0_4px_14px_rgba(0,0,0,0.08)] transition-transform duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        hoveredTooltip === 'high'
                          ? 'scale-105 -translate-y-0.5'
                          : ''
                      }`}
                    >
                      <span className="text-[11.5px] font-bold text-[#1F1F1F]">
                        41-60
                      </span>
                      <span className="text-[9.5px] font-medium text-[#FF5A26]">
                        High
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Copy Column */}
            <div className="lg:col-span-6 flex flex-col gap-5 order-1 lg:order-2">
              <div className="flex flex-col gap-1 tracking-tight">
                <h3 className="text-3xl sm:text-4xl font-bold text-[#141414] tracking-[-0.03em] leading-[1.12]">
                  Build trust <br />
                  and credibility
                </h3>
              </div>

              <p className="text-[14px] sm:text-[14.5px] text-[#636363] leading-relaxed max-w-md">
                Reputable listings help your startup stand out as trustworthy and
                professional, building confidence with your audience.
              </p>

              <div className="flex flex-col gap-3.5 pt-2">
                <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
                  <div className="flex size-5 items-center justify-center rounded-md text-[#FF5A26]">
                    <CheckCircle2 className="size-4 stroke-[2.2]" />
                  </div>
                  <span>High-authority backlinks that search engines index faster</span>
                </div>
                <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
                  <div className="flex size-5 items-center justify-center rounded-md text-[#FF5A26]">
                    <CheckCircle2 className="size-4 stroke-[2.2]" />
                  </div>
                  <span>Instant founder credibility and referral discovery traffic</span>
                </div>
                <div className="flex items-center gap-3 text-[13.5px] font-medium text-[#2E2E2E]">
                  <div className="flex size-5 items-center justify-center rounded-md text-[#FF5A26]">
                    <CheckCircle2 className="size-4 stroke-[2.2]" />
                  </div>
                  <span>Full transparent spreadsheet report with live screenshot proof</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 5. INTERACTIVE DIRECTORY DATABASE EXPLORER                        */}
        {/* =============================================================== */}
        <section id="directories" className="relative z-10 px-6 sm:px-10 lg:px-14 py-12 border-t border-[#ECE7E1]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF5A26] uppercase tracking-wider mb-2">
                <Globe2 className="size-4" />
                <span>Transparent Authority Database</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#141414] tracking-tight">
                Explore the 150+ Vetted Directories
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] mt-1 max-w-xl">
                Inspect DR metrics, traffic, and backlink types before submitting. No spam networks, no PBNs.
              </p>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-3 bg-white border border-[#E8E3DD] rounded-2xl px-4 py-2.5 shadow-2xs">
              <div>
                <span className="text-[10px] font-mono text-[#888888] block uppercase">Avg Authority</span>
                <span className="text-base font-bold text-[#141414] font-mono">DR 78.4</span>
              </div>
              <div className="h-7 w-px bg-neutral-200" />
              <div>
                <span className="text-[10px] font-mono text-[#888888] block uppercase">Network Reach</span>
                <span className="text-base font-bold text-[#FF5A26] font-mono">42M+/mo</span>
              </div>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-[#E8E3DD] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search Product Hunt, Indie Hackers, G2, AI tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#FAF8F5] border border-[#E0D9D1] rounded-xl text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#FF5A26]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {['All', 'SaaS', 'AI', 'DevTools', 'Mobile'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#121212] text-white shadow-2xs'
                      : 'bg-[#FAF8F5] text-[#555555] hover:text-black hover:bg-[#F0ECE6]'
                  }`}
                >
                  {cat}
                </button>
              ))}

              <button
                onClick={() => setDofollowOnly(!dofollowOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  dofollowOnly
                    ? 'border-[#FF5A26] bg-[#FF5A26]/10 text-[#FF5A26]'
                    : 'border-[#E0D9D1] bg-[#FAF8F5] text-[#666666] hover:text-black'
                }`}
              >
                Do-Follow Only
              </button>
            </div>
          </div>

          {/* Directory Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredDirectories.slice(0, 9).map((dir) => (
              <div
                key={dir.id}
                className="p-4 rounded-2xl bg-white border border-[#E8E3DD] shadow-2xs hover:border-[#FF5A26]/50 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-[#FAF8F5] border border-[#E0D9D1] flex items-center justify-center font-bold text-xs text-[#FF5A26]">
                        {dir.logoText}
                      </div>
                      <span className="text-xs font-bold text-neutral-900 group-hover:text-[#FF5A26] transition-colors">
                        {dir.name}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E0D9D1] text-[10px] font-mono font-bold text-[#FF5A26]">
                      DR {dir.domainRating}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-mono mt-1">
                    <span>{dir.monthlyTraffic} visits/mo</span>
                    <span>•</span>
                    <span className={dir.backlinkType === 'Do-Follow' ? 'text-emerald-600 font-semibold' : ''}>
                      {dir.backlinkType}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#F0ECE6] flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400 font-mono">{dir.submissionSpeed} turnaround</span>
                  <span className="text-[#FF5A26] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>Included in {dir.tier}</span>
                    <ArrowRight className="size-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handlePrimaryCta}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Unlock all 150+ directories with one click</span>
              <ArrowRight className="size-3.5 stroke-[2.2]" />
            </button>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 6. FOUNDER ROI CALCULATOR                                         */}
        {/* =============================================================== */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-14 py-12 border-t border-[#ECE7E1]">
          <div className="p-8 sm:p-10 rounded-[28px] bg-white border border-[#ECE7E1] shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF5A26] uppercase tracking-wider">
                <DollarSign className="size-4" />
                <span>Opportunity Cost Calculator</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#141414] tracking-tight">
                How much is manual submission costing you?
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                Founders spend an average of 35 minutes per directory filling identical forms, uploading logos, and verifying emails. See what doing it yourself really costs.
              </p>

              {/* Slider 1: Hourly Rate */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs font-semibold text-neutral-800">
                  <span>Your Hourly Value:</span>
                  <span className="font-mono text-[#FF5A26]">${hourlyRate}/hr</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full accent-[#FF5A26] cursor-pointer"
                />
              </div>

              {/* Slider 2: Directory Count */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-neutral-800">
                  <span>Directories Target:</span>
                  <span className="font-mono text-[#FF5A26]">{selectedDirsCount} directories</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  step="10"
                  value={selectedDirsCount}
                  onChange={(e) => setSelectedDirsCount(Number(e.target.value))}
                  className="w-full accent-[#FF5A26] cursor-pointer"
                />
              </div>
            </div>

            {/* Right Card: Result Summary */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#FAF8F5] border border-[#E8E3DD] flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-white rounded-xl border border-[#E0D9D1]">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block">Hours Required</span>
                  <span className="text-2xl font-bold font-mono text-[#141414]">{hoursSpent} hrs</span>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E0D9D1]">
                  <span className="text-[10px] uppercase font-mono text-neutral-400 block">DIY Value Lost</span>
                  <span className="text-2xl font-bold font-mono text-red-500">${manualLaborCost}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#FF5A26]/30 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#FF5A26] font-bold block">Launchdir Done-For-You</span>
                  <span className="text-xl font-extrabold text-[#141414] font-mono">${launchdirCost} one-time</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-emerald-600 font-bold block">Net Founder Savings</span>
                  <span className="text-xl font-extrabold text-emerald-600 font-mono">+${netSavings}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePrimaryCta}
                className="w-full py-3 rounded-full bg-[#121212] hover:bg-black text-white text-xs font-semibold shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Save {hoursSpent} hours & start now</span>
                <ArrowRight className="size-3.5 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 7. ONE-TIME TRANSPARENT PRICING PLANS                             */}
        {/* =============================================================== */}
        <section id="pricing" className="relative z-10 px-6 sm:px-10 lg:px-14 py-16 border-t border-[#ECE7E1]">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-semibold font-mono uppercase text-[#FF5A26] tracking-wider block mb-2">
              Transparent One-Time Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141414] tracking-tight">
              Pay Once. Keep Your Backlinks Forever.
            </h2>
            <p className="text-xs sm:text-sm text-[#666666] mt-2">
              No monthly subscriptions. 100% manual human submission. Full live report.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
            {PRICING_TIERS.map((tier) => {
              const isPopular = tier.popular;
              return (
                <div
                  key={tier.id}
                  className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative ${
                    isPopular
                      ? 'bg-white border-2 border-[#FF5A26] shadow-xl shadow-orange-500/10'
                      : 'bg-white border border-[#E8E3DD] shadow-2xs hover:border-neutral-300'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[#FF5A26] text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                      Most Popular • 70% of Founders Choose
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-neutral-900">{tier.name}</h3>
                      <span className="text-xs font-mono text-[#888888] line-through">
                        ${tier.originalPrice}
                      </span>
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-3">
                      <span className="text-4xl font-extrabold font-mono text-[#141414]">
                        ${tier.price}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">one-time</span>
                    </div>

                    <p className="text-xs text-neutral-500 leading-relaxed mb-6">
                      {tier.tagline}
                    </p>

                    <div className="pt-4 border-t border-neutral-100 space-y-2.5">
                      {tier.features.slice(0, 6).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-neutral-700">
                          <Check className="size-4 text-[#FF5A26] shrink-0 mt-0.5 stroke-[2.5]" />
                          <span>{feat.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-neutral-100">
                    <button
                      type="button"
                      onClick={handlePrimaryCta}
                      className={`w-full py-3 rounded-full text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 ${
                        isPopular
                          ? 'bg-[#FF5A26] hover:bg-[#E54817] text-white shadow-orange-500/25'
                          : 'bg-[#121212] hover:bg-black text-white'
                      }`}
                    >
                      <span>{tier.ctaText}</span>
                      <ArrowRight className="size-3.5" />
                    </button>
                    <span className="text-[10px] text-center text-neutral-400 block mt-2">
                      {tier.turnaround} • 30-Day Index Guarantee
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =============================================================== */}
        {/* 8. FOUNDER REVIEWS & PROOF WALL                                  */}
        {/* =============================================================== */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-14 py-16 border-t border-[#ECE7E1]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold font-mono uppercase text-[#FF5A26] tracking-wider block mb-2">
              Verified Social Proof
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
              Real results from verified founders
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FOUNDER_TESTIMONIALS.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-[#E8E3DD] shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-[#FF5A26]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-xs">★</span>
                      ))}
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#E0D9D1] text-[10px] font-mono font-bold text-emerald-600">
                      DR {item.drBefore} → {item.drAfter}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 italic leading-relaxed mb-4">
                    "{item.quote}"
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">{item.name}</span>
                    <span className="text-[10px] text-neutral-400">{item.company}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#FF5A26] font-semibold">{item.trafficGrowth}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =============================================================== */}
        {/* 9. FAQ ACCORDION                                                 */}
        {/* =============================================================== */}
        <section id="faq" className="relative z-10 px-6 sm:px-10 lg:px-14 py-16 border-t border-[#ECE7E1]">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-semibold font-mono uppercase text-[#FF5A26] tracking-wider block mb-2">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#141414] tracking-tight">
              Everything you need to know
            </h2>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {FAQ_ITEMS.slice(0, 5).map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl border border-[#E8E3DD] bg-white overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-neutral-900 cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`size-4 text-neutral-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-[#FF5A26]' : ''
                      }`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-xs text-neutral-500 leading-relaxed border-t border-neutral-100 pt-3">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* =============================================================== */}
        {/* 10. FINAL BOTTOM CTA BANNER                                      */}
        {/* =============================================================== */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-14 py-16 border-t border-[#ECE7E1] text-center">
          <div className="max-w-2xl mx-auto flex flex-col items-center gap-5">
            <span className="text-xs font-semibold font-mono uppercase text-[#FF5A26] tracking-wider">
              Launch Once. Rank Forever.
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141414] tracking-tight leading-tight">
              List your startup everywhere in 48 hours.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-md">
              Skip 50+ hours of manual form submissions. Get your complete spreadsheet report with live backlinks and screenshots.
            </p>

            <button
              type="button"
              onClick={handlePrimaryCta}
              className="mt-3 inline-flex items-center gap-2.5 rounded-full bg-[#121212] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-black/15 transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              <span>Get listed on 100+ directories now</span>
              <ArrowRight className="size-4 stroke-[2.2]" />
            </button>
          </div>
        </section>

        {/* =============================================================== */}
        {/* 11. FOOTER                                                       */}
        {/* =============================================================== */}
        <footer className="relative z-10 border-t border-[#ECE7E1] px-6 sm:px-10 lg:px-14 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <LaunchdirRocketIcon className="size-5 text-[#FF5A26]" />
            <span className="font-bold text-neutral-900">launchdir</span>
            <span>© {new Date().getFullYear()} Launchdir Inc.</span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <a href="#how-it-works" className="hover:text-black transition-colors">
              How it works
            </a>
            <a href="#directories" className="hover:text-black transition-colors">
              Directories
            </a>
            <a href="#pricing" className="hover:text-black transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-black transition-colors">
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
            <span className="size-2 rounded-full bg-emerald-500" />
            <span>Submission queues open</span>
          </div>
        </footer>
      </main>
    </div>
  );
};
