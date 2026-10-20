import React, { useState } from 'react';
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
} from 'lucide-react';

/**
 * Launchdir Showcase Component
 * Pixel-perfect recreation of the launchdir landing interface.
 * Adheres strictly to design rules:
 * - No space-x-* or space-y-*; all flex/grid with gap-*
 * - size-* utility for equal dimensions
 * - cubic-bezier(0.23, 1, 0.32, 1) physical easing curve
 * - Micro-interactions with tactile active:scale-[0.97]
 * - Warm radiant ambient orange glow canvas (#FF5A26)
 */

// Brand Rocket Glyph Icon (exact geometry of launchdir logo)
export const LaunchdirRocketIcon: React.FC<{ className?: string }> = ({ className = 'size-6' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Dual angled aerodynamic lozenges forming the launch rocket mark */}
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

// 5x5 Matrix Directory Tile Definition
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

export const LaunchdirShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Tous' | 'Images' | 'Video' | 'Shopping' | 'Maps'>('Tous');
  const [hoveredTooltip, setHoveredTooltip] = useState<'moderate' | 'high' | null>(null);

  return (
    <div className="relative min-h-screen w-full bg-[#FF5A26] p-4 sm:p-6 md:p-8 lg:p-12 font-sans selection:bg-[#FF5A26]/20 selection:text-[#FF5A26] flex items-center justify-center">
      {/* Warm Ambient Canvas Lighting / Glowing Orbs */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-gradient-to-b from-[#FFA066]/35 to-transparent blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-32 right-10 size-[500px] rounded-full bg-gradient-to-t from-[#FF7A42]/30 to-transparent blur-[100px]"
        aria-hidden="true"
      />

      {/* Main Container Frame */}
      <main className="relative w-full max-w-6xl rounded-[32px] bg-[#FAF8F5] border border-white/60 shadow-[0_30px_90px_-20px_rgba(180,45,10,0.38),0_0_0_1px_rgba(255,255,255,0.7)_inset] overflow-hidden">
        {/* Subtle Ambient Mesh Inside Canvas */}
        <div
          className="pointer-events-none absolute top-40 right-10 size-[550px] rounded-full bg-[radial-gradient(circle,_rgba(255,90,38,0.18)_0%,_rgba(255,160,100,0.08)_40%,_transparent_70%)] blur-[75px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_bottom,_rgba(255,90,38,0.30)_0%,_rgba(255,140,80,0.12)_40%,_transparent_75%)]"
          aria-hidden="true"
        />

        {/* 1. Header Navigation */}
        <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 lg:px-14 py-6">
          {/* Logo */}
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

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10 text-[13.5px] font-medium text-[#4D4D4D]">
            <a
              href="#how-it-works"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              How it works
            </a>
            <a
              href="#faq"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              FAQ
            </a>
            <a
              href="#merchants"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              For Merchants
            </a>
            <a
              href="#pricing"
              className="transition-colors duration-150 hover:text-black ease-[cubic-bezier(0.23,1,0.32,1)]"
            >
              Pricing
            </a>
          </nav>

          {/* Header CTA Pill */}
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-[#121212] px-5 py-2.5 text-[13.5px] font-medium text-white shadow-[0_2px_10px_rgba(0,0,0,0.14)] transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-[0_4px_16px_rgba(0,0,0,0.22)] active:scale-[0.97]"
          >
            <span>Get started</span>
            <ArrowRight className="size-3.5 stroke-[2.2]" />
          </button>
        </header>

        {/* 2. Hero Section */}
        <section className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center px-6 sm:px-10 lg:px-14 pt-6 pb-20">
          {/* Hero Left: Typography & Value Props */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start gap-7 max-w-xl">
            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 text-[13px] font-medium text-[#6B6B6B]">
              <Sparkles className="size-3.5 text-[#FF5A26] fill-[#FF5A26]" />
              <span>256 Startups successfully boosted</span>
            </div>

            {/* Main Headline */}
            <div className="flex flex-col gap-1 tracking-tight">
              <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-medium text-[#1A1A1A] tracking-[-0.02em]">
                Submit once and
              </h2>
              <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-bold text-[#121212] tracking-[-0.035em] leading-[1.08]">
                List your startup <br />
                <span className="text-[#FF5A26]">everywhere</span>
              </h1>
            </div>

            {/* Value Proposition Micro-Row */}
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

            {/* Hero Main CTA Button */}
            <button
              type="button"
              className="inline-flex items-center gap-2.5 rounded-full bg-[#121212] px-7 py-3.5 text-[14.5px] font-medium text-white shadow-[0_4px_18px_rgba(0,0,0,0.18)] transition-all duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-black hover:shadow-[0_6px_22px_rgba(0,0,0,0.26)] active:scale-[0.97]"
            >
              <span>Get listed on 100+ directories</span>
              <ArrowRight className="size-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Hero Right: 5x5 Directory Matrix with Center Elevated Card */}
          <div className="lg:col-span-6 xl:col-span-5 relative flex items-center justify-center">
            {/* Radiant Orange Aura Behind Matrix */}
            <div
              className="pointer-events-none absolute size-80 sm:size-96 rounded-full bg-gradient-to-tr from-[#FF5A26]/40 via-[#FF8F52]/25 to-transparent blur-[65px]"
              aria-hidden="true"
            />

            {/* The 5x5 Grid Container */}
            <div className="relative grid grid-cols-5 gap-3 sm:gap-3.5 p-4 rounded-3xl">
              {DIRECTORY_TILES.map((tile, idx) => {
                if (tile.isSpecial) {
                  return (
                    <div
                      key={tile.id}
                      className="relative size-12 sm:size-14 flex items-center justify-center"
                    >
                      {/* Floating Elevated Center Rocket Card */}
                      <div className="absolute z-20 size-20 sm:size-24 rounded-[22px] bg-white border border-white/80 shadow-[0_20px_45px_-8px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)] flex items-center justify-center text-[#FF5A26] transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 hover:shadow-[0_25px_50px_-6px_rgba(255,90,38,0.24)] cursor-pointer">
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

        {/* 3. Bento Section: Card 1 - Boost Online Presence */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-14 pb-10">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-[28px] bg-white/95 border border-[#ECE7E1] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.04)] p-8 sm:p-12 overflow-hidden">
            {/* Ambient Peach Glow on Card Bottom Right */}
            <div
              className="pointer-events-none absolute -bottom-20 -right-20 size-80 rounded-full bg-gradient-to-tl from-[#FF5A26]/20 via-[#FFB085]/15 to-transparent blur-[70px]"
              aria-hidden="true"
            />

            {/* Left Column: Heading & Value List */}
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

            {/* Right Column: Google Search Result Mockup */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Soft Gradient Aura */}
              <div
                className="pointer-events-none absolute size-72 rounded-full bg-gradient-to-br from-[#FF9860]/25 via-[#FFA873]/15 to-transparent blur-[60px]"
                aria-hidden="true"
              />

              <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8E3DD] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] p-5 sm:p-6 flex flex-col gap-4">
                {/* Search Input Bar */}
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

                {/* Filter Navigation Row */}
                <div className="flex items-center gap-4 border-b border-[#F0ECE6] pb-2.5 text-[11px] font-medium text-[#6B6B6B]">
                  <button
                    type="button"
                    onClick={() => setActiveTab('Tous')}
                    className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                      activeTab === 'Tous'
                        ? 'border-[#4285F4] text-[#1A73E8]'
                        : 'border-transparent text-[#6B6B6B] hover:text-black'
                    }`}
                  >
                    <Search className="size-3" />
                    <span>Tous</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Images')}
                    className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                      activeTab === 'Images'
                        ? 'border-[#4285F4] text-[#1A73E8]'
                        : 'border-transparent text-[#6B6B6B] hover:text-black'
                    }`}
                  >
                    <ImageIcon className="size-3" />
                    <span>Images</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Video')}
                    className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                      activeTab === 'Video'
                        ? 'border-[#4285F4] text-[#1A73E8]'
                        : 'border-transparent text-[#6B6B6B] hover:text-black'
                    }`}
                  >
                    <Video className="size-3" />
                    <span>Vidéo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Shopping')}
                    className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                      activeTab === 'Shopping'
                        ? 'border-[#4285F4] text-[#1A73E8]'
                        : 'border-transparent text-[#6B6B6B] hover:text-black'
                    }`}
                  >
                    <ShoppingBag className="size-3" />
                    <span>Shopping</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('Maps')}
                    className={`flex items-center gap-1.5 pb-1 border-b-2 transition-all ${
                      activeTab === 'Maps'
                        ? 'border-[#4285F4] text-[#1A73E8]'
                        : 'border-transparent text-[#6B6B6B] hover:text-black'
                    }`}
                  >
                    <MapPin className="size-3" />
                    <span>Maps</span>
                  </button>
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

        {/* 4. Bento Section: Card 2 - Build Trust and Credibility */}
        <section className="relative z-10 px-6 sm:px-10 lg:px-14 pb-16">
          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center rounded-[28px] bg-white/95 border border-[#ECE7E1] shadow-[0_10px_35px_-10px_rgba(0,0,0,0.04)] p-8 sm:p-12 overflow-hidden">
            {/* Ambient Peach Glow on Card Top Left */}
            <div
              className="pointer-events-none absolute -top-16 -left-16 size-72 rounded-full bg-gradient-to-br from-[#FF5A26]/18 via-[#FF9E66]/12 to-transparent blur-[65px]"
              aria-hidden="true"
            />

            {/* Left Column: Domain Authority Chart Card */}
            <div className="lg:col-span-6 relative flex items-center justify-center order-2 lg:order-1">
              <div className="relative w-full max-w-md rounded-2xl bg-white border border-[#E8E3DD] shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-5">
                {/* Chart Title */}
                <div className="flex items-center justify-between">
                  <span className="text-[11.5px] font-medium text-[#888888] tracking-tight">
                    Domain authority over time
                  </span>
                  <div className="size-2 rounded-full bg-[#FF5A26]" />
                </div>

                {/* Ascending Smooth SVG Curve */}
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

                    {/* Subtle Horizontal Reference Grid Lines */}
                    <line
                      x1="10"
                      y1="40"
                      x2="330"
                      y2="40"
                      stroke="#F0EBE5"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="10"
                      y1="85"
                      x2="330"
                      y2="85"
                      stroke="#F0EBE5"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <line
                      x1="10"
                      y1="130"
                      x2="330"
                      y2="130"
                      stroke="#F0EBE5"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />

                    {/* Area Fill */}
                    <path
                      d="M 15 145 C 80 142, 130 115, 185 80 C 235 48, 265 32, 320 20 L 320 155 L 15 155 Z"
                      fill="url(#daAreaGradient)"
                    />

                    {/* Smooth Ascending Line */}
                    <path
                      d="M 15 145 C 80 142, 130 115, 185 80 C 235 48, 265 32, 320 20"
                      stroke="#FF5A26"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                    />

                    {/* Marker 1: Moderate (x: 185, y: 80) */}
                    <circle
                      cx="185"
                      cy="80"
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#FF5A26"
                      strokeWidth="2.5"
                    />

                    {/* Marker 2: High (x: 275, y: 35) */}
                    <circle
                      cx="275"
                      cy="35"
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#FF5A26"
                      strokeWidth="2.5"
                    />
                  </svg>

                  {/* Tooltip 1: 21-40 Moderate (Pinned above x: 185, y: 80) */}
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

                  {/* Tooltip 2: 41-60 High (Pinned above x: 275, y: 35) */}
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

            {/* Right Column: Copy & Value Proposition */}
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
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LaunchdirShowcase;
