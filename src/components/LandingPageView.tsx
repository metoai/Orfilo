import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Zap,
  Check,
  Search,
  Folder,
  FolderOpen,
  ShieldCheck,
  Sparkles,
  Copy,
  CheckCircle2,
  ChevronDown,
  Layers,
  Puzzle,
  Lock,
  Terminal,
  FileCode,
  FileImage,
  Code2,
  Clock,
  Database,
  ExternalLink,
  Bot,
  Cpu,
  TrendingUp,
  Sliders,
  CheckCheck,
} from 'lucide-react';
import { OrfiloBrand, OrfiloIcon } from './OrfiloBrand.tsx';

interface LandingPageViewProps {
  onSignIn: () => void;
  onSignUp: () => void;
  isLoggedIn?: boolean;
  onReturnToDashboard?: () => void;
}

const FAQ_ITEMS = [
  {
    question: 'How does the Orfilo Chrome Extension capture deliverables?',
    answer:
      'The companion extension embeds a persistent, non-intrusive "Save to Orfilo" button on code blocks, images, and document chips in ChatGPT, Claude, Gemini, and Cursor. It captures the generated payload alongside prompt context and routes it securely into your workspace without manual downloading.',
  },
  {
    question: 'How does Orfilo generate clean names instead of random hashes?',
    answer:
      'Instead of saving arbitrary filenames like "image_892348_final.png", Orfilo parses the prompt semantics with Gemini 2.5 Flash. The engine identifies the core subject and context, creating clean, standardized kebab-case names like "habesha-hero-character-3d.png".',
  },
  {
    question: 'Does Orfilo support deep project subfolders?',
    answer:
      'Yes. Every project supports unlimited subfolders (e.g. "Habesha Model / Marketing / 3D Renders"). You can drag and drop artifacts between subfolders, rename paths in real time, and filter assets with live item counters.',
  },
  {
    question: 'Is my data secure and isolated?',
    answer:
      'Completely. Orfilo is built on Supabase with PostgreSQL Row-Level Security (RLS) enforced on every table. Every query is strictly authenticated via your JWT or cryptographically hashed extension token. No other user can ever access your deliverables.',
  },
  {
    question: 'Can I use Orfilo without the Chrome Extension?',
    answer:
      'Yes. You can manually drag and drop or upload files, paste code snippets directly, and organize assets via the web dashboard. The Chrome extension simply automates the capture step directly from your active AI conversation tabs.',
  },
];

// Interactive Prompt Simulation Data
const PLAYGROUND_PROMPTS = [
  {
    id: 'render',
    title: '3D Character Render',
    platform: 'Gemini 2.5 Flash',
    prompt:
      'Generate a photorealistic 3D Habesha character wearing traditional woven clothing with golden embroidery standing against a warm minimal studio background.',
    targetFile: 'habesha-hero-character-3d.png',
    project: 'Habesha Model',
    subfolder: 'Marketing / 3D Renders',
    mime: 'image/png',
    size: '2.4 MB',
    type: 'image',
  },
  {
    id: 'code',
    title: 'Next.js Auth Hook',
    platform: 'Claude 3.7 Sonnet',
    prompt:
      'Write a production-ready useSession hook in TypeScript with automatic token refresh, SWR revalidation, and strict Supabase session validation.',
    targetFile: 'use-session-auth.ts',
    project: 'SaaS Platform',
    subfolder: 'Frontend / Hooks',
    mime: 'text/typescript',
    size: '14.2 KB',
    type: 'code',
  },
  {
    id: 'doc',
    title: 'Brand Pitch Deck',
    platform: 'ChatGPT 4o',
    prompt:
      'Create an executive 10-slide startup pitch deck outline for an enterprise AI deliverable organizer targeting seed investors.',
    targetFile: 'executive-pitch-deck-outline.docx',
    project: 'Fundraising 2026',
    subfolder: 'Investor Relations',
    mime: 'application/docx',
    size: '88.5 KB',
    type: 'doc',
  },
  {
    id: 'schema',
    title: 'Drizzle Schema Migration',
    platform: 'Cursor AI',
    prompt:
      'Generate a safe Drizzle ORM migration adding a jsonb metadata column to the integration_connections table with backward-compatible defaults.',
    targetFile: '0024-add-connection-metadata.sql',
    project: 'Infrastructure Core',
    subfolder: 'Database / Migrations',
    mime: 'application/sql',
    size: '4.8 KB',
    type: 'code',
  },
];

// AI Platform Grid Icons for Hero Visual
const AI_TOOL_TILES = [
  { name: 'ChatGPT', label: 'GPT', color: '#10A37F' },
  { name: 'Claude', label: 'Anthropic', color: '#D97706' },
  { name: 'Gemini', label: 'Google', color: '#4285F4' },
  { name: 'Cursor', label: 'IDE', color: '#000000' },
  { name: 'Midjourney', label: 'MJ', color: '#6366F1' },
  { name: 'v0 by Vercel', label: 'v0', color: '#000000' },
  { name: 'Bolt.new', label: 'Bolt', color: '#E11D48' },
  { name: 'Lovable', label: 'Lovable', color: '#EC4899' },
  { name: 'Perplexity', label: 'PPLX', color: '#0EA5E9' },
  { name: 'Copilot', label: 'GitHub', color: '#24292F' },
  { name: 'Replit', label: 'Replit', color: '#F97316' },
  { name: 'Figma AI', label: 'Figma', color: '#A855F7' },
  { name: 'DALL-E 3', label: 'DALL-E', color: '#14B8A6' },
  { name: 'Google Docs', label: 'Docs', color: '#2563EB' },
  { name: 'Notion AI', label: 'Notion', color: '#000000' },
  { name: 'Suno AI', label: 'Suno', color: '#84CC16' },
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSignIn,
  onSignUp,
  isLoggedIn = false,
  onReturnToDashboard,
}) => {
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activePlaygroundIndex, setActivePlaygroundIndex] = useState<number>(0);

  const activePlayground = PLAYGROUND_PROMPTS[activePlaygroundIndex];

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-neutral-900 flex flex-col antialiased selection:bg-[#E8F7F0] selection:text-[#19A974] relative overflow-x-hidden font-sans">
      {/* Ambient Radial Aura Illumination (Orfilo Emerald glow) */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] pointer-events-none -z-10 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(25,169,116,0.14),rgba(250,249,246,0))]"
        aria-hidden="true"
      />

      {/* ================================================================= */}
      {/* 1. TOP NAVIGATION BAR (CLEAN, MINIMAL, MATCHING REFERENCE)        */}
      {/* ================================================================= */}
      <header className="px-6 md:px-12 py-4 border-b border-neutral-200/70 bg-[#FAF9F6]/85 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrfiloBrand variant="horizontal" size="md" showTagline={false} />
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 hidden sm:inline-block">
            v2.0
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-neutral-600">
          <a href="#how-it-works" className="hover:text-neutral-950 transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-neutral-950 transition-colors">
            Features
          </a>
          <a href="#playground" className="hover:text-neutral-950 transition-colors">
            Interactive Demo
          </a>
          <a href="#faq" className="hover:text-neutral-950 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={onReturnToDashboard}
              className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-full text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
            >
              <span>Workspace</span>
              <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={onSignIn}
                className="text-xs font-medium text-neutral-700 hover:text-neutral-950 px-2 py-1 transition-colors cursor-pointer"
              >
                Sign in
              </button>
              <button
                onClick={onSignUp}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold shadow-2xs transition-all active:scale-[0.98] cursor-pointer flex items-center gap-1.5"
              >
                <span>Get started</span>
                <ArrowRight className="size-3.5 text-neutral-400" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* ================================================================= */}
      {/* 2. HERO SECTION (SPLIT ASYMMETRIC 2-COLUMN MATCHING REFERENCE)   */}
      {/* ================================================================= */}
      <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy, Headlines & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Social Proof Badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-neutral-700 bg-white border border-neutral-200/80 shadow-2xs mb-5"
            >
              <span className="text-[#19A974] font-bold">✦</span>
              <span className="font-semibold text-neutral-900">14,200+</span>
              <span className="text-neutral-600">AI deliverables successfully organized</span>
            </motion.div>

            {/* Sub-heading kicker */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
              className="text-sm md:text-base font-semibold text-neutral-600 mb-1"
            >
              Capture once and
            </motion.p>

            {/* Massive Bold Headline matching Reference layout */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.08]"
            >
              List your deliverables{' '}
              <span className="text-[#19A974] block">everywhere</span>
            </motion.h1>

            {/* Value Props Row (Horizontal bullet pills matching reference) */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18, ease: [0.23, 1, 0.32, 1] }}
              className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-neutral-700"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#19A974]" />
                <span>Instant AI capture</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#19A974]" />
                <span>Auto-naming & folders</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-[#19A974]" />
                <span>Save 10+ hrs/wk</span>
              </span>
            </motion.div>

            {/* Primary Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
            >
              <button
                onClick={onSignUp}
                className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Start organizing on 10+ platforms</span>
                <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Quick CLI command copy */}
              <div
                onClick={() => handleCopyCommand('npx orfilo pair')}
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-full border border-neutral-200/90 bg-white hover:bg-neutral-50 text-xs font-mono text-neutral-700 transition-colors cursor-pointer"
                title="Copy pairing command"
              >
                <span className="text-neutral-400 select-none">$</span>
                <span className="font-semibold text-neutral-800">npx orfilo pair</span>
                {copiedCommand ? (
                  <CheckCircle2 className="size-3.5 text-emerald-600 ml-1" />
                ) : (
                  <Copy className="size-3.5 text-neutral-400 ml-1" />
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column: 4x4 Grid of Tool Tiles with Floating Center Logo (Direct match to reference image) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="lg:col-span-5 relative flex items-center justify-center"
          >
            {/* Luminous emerald aura behind the grid */}
            <div
              className="absolute size-72 rounded-full bg-[radial-gradient(circle,rgba(25,169,116,0.22),transparent_70%)] pointer-events-none -z-0 blur-xl"
              aria-hidden="true"
            />

            {/* The 4x4 Grid Container */}
            <div className="relative p-6 rounded-3xl bg-white/60 border border-neutral-200/80 shadow-md backdrop-blur-md">
              <div className="grid grid-cols-4 gap-3">
                {AI_TOOL_TILES.map((tile, i) => (
                  <div
                    key={tile.name}
                    className="size-16 sm:size-18 rounded-2xl bg-white border border-neutral-200/70 shadow-2xs flex flex-col items-center justify-center p-2 transition-transform hover:scale-105 select-none"
                  >
                    <span
                      className="size-2 rounded-full mb-1.5 opacity-80"
                      style={{ backgroundColor: tile.color }}
                    />
                    <span className="text-[11px] font-semibold text-neutral-800 truncate max-w-[54px]">
                      {tile.name}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400">{tile.label}</span>
                  </div>
                ))}
              </div>

              {/* Elevated Floating Center Card with Orfilo Icon (Exact match to reference center rocket) */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                className="absolute inset-0 m-auto size-24 sm:size-26 rounded-3xl bg-white border border-[#19A974]/30 shadow-2xl shadow-emerald-500/25 flex flex-col items-center justify-center z-10"
              >
                <div className="size-12 rounded-2xl bg-[#E8F7F0] flex items-center justify-center text-[#19A974] shadow-2xs">
                  <OrfiloIcon size={32} />
                </div>
                <span className="text-[10px] font-bold text-neutral-900 mt-1">Orfilo</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 3. SECTION 2: ASYMMETRIC CARD 1 (BOOST YOUR AI PRESENCE)          */}
      {/* ================================================================= */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-8 w-full">
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-8 sm:p-12 shadow-sm relative overflow-hidden">
          {/* Ambient emerald illumination in bottom right */}
          <div
            className="absolute -right-16 -bottom-16 size-96 bg-[radial-gradient(circle,rgba(25,169,116,0.18),transparent_70%)] pointer-events-none -z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Column: Heading, Subtitle & Checklist */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]">
                Boost your
                <span className="block text-neutral-900">AI Productivity</span>
              </h2>

              <p className="mt-4 text-sm text-neutral-500 leading-relaxed max-w-lg">
                Make it easy for your team to find every asset. We automatically capture, rename, and
                organize your deliverables from trusted AI platforms where you are already creating.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 w-full">
                <div className="flex items-start gap-3">
                  <div className="size-5 rounded-md bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">
                    Be organized where it matters most across ChatGPT, Claude, and Gemini
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-5 rounded-md bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">
                    Reach target deliverables effortlessly with smart kebab-case naming
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-5 rounded-md bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">
                    Expand your project organization with automated subfolder routing
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Search & Deliverable Inspection Card (Matching Search card in Reference) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border border-neutral-200/90 bg-[#FAF9F6] p-5 shadow-sm flex flex-col gap-4">
                {/* Search Bar Input Container */}
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-neutral-200/80 rounded-xl shadow-2xs">
                  <Search className="size-4 text-neutral-400" />
                  <span className="text-xs text-neutral-800 font-medium flex-1">
                    habesha hero character 3d
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded">
                    ⌘K
                  </span>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 border-b border-neutral-200/60 pb-2">
                  <span className="px-2.5 py-1 rounded-lg bg-neutral-900 text-white font-semibold">
                    All Files
                  </span>
                  <span className="px-2.5 py-1 rounded-lg hover:bg-neutral-200/60 transition-colors">
                    3D Images
                  </span>
                  <span className="px-2.5 py-1 rounded-lg hover:bg-neutral-200/60 transition-colors">
                    TypeScript
                  </span>
                  <span className="px-2.5 py-1 rounded-lg hover:bg-neutral-200/60 transition-colors">
                    Documents
                  </span>
                </div>

                {/* Realistic Deliverable Result Card */}
                <div className="p-4 rounded-xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#19A974] font-semibold flex items-center gap-1.5">
                      <Folder className="size-3.5" />
                      <span>Habesha Model / Marketing / 3D Renders</span>
                    </span>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Gemini 2.5 Flash
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-neutral-900">
                    habesha-hero-character-3d.png
                  </h3>

                  <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                    "Generate a photorealistic 3D Habesha character wearing traditional woven
                    clothing with golden embroidery standing against a warm minimal studio
                    background..."
                  </p>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                    <span>PNG • 2.4 MB</span>
                    <span className="text-[#19A974] font-semibold">98% AI Confidence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4. SECTION 3: ASYMMETRIC CARD 2 (BUILD TRUST & CREDIBILITY)       */}
      {/* ================================================================= */}
      <section className="max-w-6xl mx-auto px-6 py-8 w-full">
        <div className="rounded-3xl border border-neutral-200/80 bg-white p-8 sm:p-12 shadow-sm relative overflow-hidden">
          {/* Ambient emerald illumination in bottom left */}
          <div
            className="absolute -left-16 -bottom-16 size-96 bg-[radial-gradient(circle,rgba(25,169,116,0.18),transparent_70%)] pointer-events-none -z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Column: Analytics Chart & Subfolder Hierarchy Card (Matching Chart in Reference) */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-2xl border border-neutral-200/90 bg-[#FAF9F6] p-5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">
                      Deliverable Velocity & Structure
                    </span>
                    <span className="text-[11px] text-neutral-400">
                      Automated classification efficiency
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#19A974] text-white">
                    PostgreSQL RLS
                  </span>
                </div>

                {/* Subfolder Chips */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 bg-white border border-neutral-200/70 rounded-xl">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      Marketing / 3D
                    </span>
                    <span className="text-lg font-extrabold text-neutral-900 font-mono">
                      48 files
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-neutral-200/70 rounded-xl">
                    <span className="text-[10px] font-mono text-neutral-400 block uppercase">
                      Frontend / Auth
                    </span>
                    <span className="text-lg font-extrabold text-[#19A974] font-mono">
                      12 files
                    </span>
                  </div>
                </div>

                {/* SVG Area Chart matching Reference Graphic */}
                <div className="p-4 bg-white border border-neutral-200/70 rounded-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                    <span>Organized Output</span>
                    <span className="text-emerald-600 font-bold font-mono">+94% faster retrieval</span>
                  </div>

                  <svg viewBox="0 0 300 90" className="w-full h-24 overflow-visible">
                    <defs>
                      <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#19A974" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#19A974" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 0 75 Q 70 65 140 40 T 300 15 L 300 90 L 0 90 Z"
                      fill="url(#curveGrad)"
                    />
                    <path
                      d="M 0 75 Q 70 65 140 40 T 300 15"
                      fill="none"
                      stroke="#19A974"
                      strokeWidth="2.5"
                    />
                    <circle cx="140" cy="40" r="4" fill="#19A974" />
                    <circle cx="300" cy="15" r="4" fill="#19A974" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Right Column: Heading, Subtitle & Trust Points */}
            <div className="lg:col-span-6 flex flex-col items-start text-left order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-950 leading-[1.12]">
                Build trust
                <span className="block text-neutral-900">and credibility</span>
              </h2>

              <p className="mt-4 text-sm text-neutral-500 leading-relaxed max-w-lg">
                Reputable teams need clean, organized records. Orfilo ensures every generated asset
                is stored with prompt provenance, structured naming, and cryptographic PostgreSQL
                isolation.
              </p>

              <div className="mt-8 flex flex-col gap-3.5 w-full">
                <div className="flex items-start gap-3">
                  <div className="size-5 rounded-md bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">
                    Row-Level Security (RLS) guarantees complete workspace privacy
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-5 rounded-md bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">
                    Interactive subfolder explorer with instant drag-and-drop moving
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-5 rounded-md bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="size-3.5 stroke-[3]" />
                  </div>
                  <span className="text-xs font-semibold text-neutral-800">
                    One-click code copying and native file export without loss
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 5. SECTION 4: HOW IT WORKS BENTO GRID                             */}
      {/* ================================================================= */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-16 w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold font-mono uppercase text-[#19A974] tracking-wider block mb-2">
            Architecture & Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 tracking-tight">
            How Orfilo powers your pipeline
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-2">
            From the moment your AI finishes generating, Orfilo classifies and secures the asset.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4">
                <Puzzle className="size-5 text-[#19A974]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">1. Chrome Companion</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Persistent save button attaches to code blocks and images in ChatGPT, Claude, and
                Gemini.
              </p>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 mt-4 block">0 click exports</span>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4">
                <Sparkles className="size-5 text-[#19A974]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">2. Semantic Renaming</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Gemini 2.5 Flash extracts subject semantics from prompts to synthesize kebab-case
                names.
              </p>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 mt-4 block">No random hashes</span>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4">
                <FolderOpen className="size-5 text-[#19A974]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">3. Subfolder Routing</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Assets are matched to appropriate projects and subfolders automatically with live
                counts.
              </p>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 mt-4 block">Unlimited nesting</span>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="size-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-900 mb-4">
                <Lock className="size-5 text-[#19A974]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-900">4. Supabase & RLS</h3>
              <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
                Sub-120ms ingestion latency into PostgreSQL with cryptographic Row-Level Security.
              </p>
            </div>
            <span className="text-[10px] font-mono text-neutral-400 mt-4 block">100% private</span>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 6. SECTION 5: INTERACTIVE PROMPT PLAYGROUND                       */}
      {/* ================================================================= */}
      <section id="playground" className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900 text-white shadow-xl relative overflow-hidden">
          <div
            className="absolute top-0 right-0 size-80 bg-[radial-gradient(circle,rgba(25,169,116,0.35),transparent_70%)] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-xl">
            <span className="text-xs font-semibold font-mono uppercase text-[#19A974] tracking-wider block mb-2">
              Live Intelligence Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Test semantic name synthesis
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Select an AI prompt to see how Orfilo parses context and generates clean kebab-case names.
            </p>
          </div>

          {/* Segmented Mode Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 relative z-10">
            {PLAYGROUND_PROMPTS.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActivePlaygroundIndex(index)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePlaygroundIndex === index
                    ? 'bg-[#19A974] text-white shadow-sm'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>

          {/* Simulation Output Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePlayground.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="mt-6 p-6 rounded-2xl bg-neutral-950/80 border border-neutral-800 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative z-10"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    Source: {activePlayground.platform}
                  </span>
                  <span className="text-[10px] font-mono text-[#19A974]">
                    Target: {activePlayground.project} / {activePlayground.subfolder}
                  </span>
                </div>
                <p className="text-xs text-neutral-300 font-mono italic leading-relaxed">
                  "{activePlayground.prompt}"
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800/80 min-w-[260px] space-y-1.5 shrink-0">
                <span className="text-[10px] uppercase font-mono text-neutral-500 block">
                  Synthesized Deliverable
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400 block truncate">
                  {activePlayground.targetFile}
                </span>
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 pt-1 border-t border-neutral-800">
                  <span>{activePlayground.mime}</span>
                  <span>{activePlayground.size}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 7. SECTION 6: FAQ ACCORDION                                       */}
      {/* ================================================================= */}
      <section id="faq" className="max-w-4xl mx-auto px-6 py-16 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-semibold font-mono uppercase text-[#19A974] tracking-wider block mb-2">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
            Everything you need to know
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={item.question}
                className="rounded-2xl border border-neutral-200/80 bg-white overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-neutral-900 cursor-pointer"
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`size-4 text-neutral-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#19A974]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-xs text-neutral-500 leading-relaxed border-t border-neutral-100 pt-3">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 8. FINAL CALL TO ACTION (MATCHING PILL CTA IN REFERENCE)          */}
      {/* ================================================================= */}
      <section className="max-w-6xl mx-auto px-6 py-12 w-full">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#FAF9F6] border border-neutral-200/90 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div
            className="absolute size-96 bg-[radial-gradient(circle,rgba(25,169,116,0.16),transparent_70%)] pointer-events-none -z-0"
            aria-hidden="true"
          />

          <span className="text-xs font-semibold font-mono uppercase text-[#19A974] tracking-wider block mb-2 z-10">
            Start in 30 seconds
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-950 tracking-tight max-w-xl z-10 leading-[1.12]">
            List and organize your deliverables today
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-md mt-3 z-10">
            Free forever for individual creators. No credit card required.
          </p>

          <button
            onClick={onSignUp}
            className="mt-8 px-7 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-semibold shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center gap-2 group z-10"
          >
            <span>Get started with Orfilo for free</span>
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* ================================================================= */}
      {/* 9. FOOTER (CLEAN, MINIMALIST, HIGH-CLASS)                         */}
      {/* ================================================================= */}
      <footer className="border-t border-neutral-200/70 bg-[#FAF9F6] py-12 px-6 md:px-12 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <OrfiloBrand variant="horizontal" size="sm" showTagline={false} />
            <span className="text-xs text-neutral-400 font-mono">
              © {new Date().getFullYear()} Orfilo Inc.
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-neutral-500 font-medium">
            <a href="#how-it-works" className="hover:text-neutral-950 transition-colors">
              How it works
            </a>
            <a href="#features" className="hover:text-neutral-950 transition-colors">
              Features
            </a>
            <a href="#faq" className="hover:text-neutral-950 transition-colors">
              FAQ
            </a>
            <button
              onClick={onSignIn}
              className="hover:text-neutral-950 transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
            <span className="size-2 rounded-full bg-[#19A974]" />
            <span>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
