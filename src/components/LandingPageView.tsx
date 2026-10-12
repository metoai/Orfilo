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
  CornerDownRight,
  FileCode,
  FileImage,
  Code2,
} from 'lucide-react';
import { OrfiloBrand } from './OrfiloBrand.tsx';

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
      'The companion extension listens for deliverable exports, code copy events, and right-click actions on AI interfaces (ChatGPT, Claude, Gemini, Cursor). It extracts the generated payload along with prompt context and transfers it securely to your Orfilo workspace.',
  },
  {
    question: 'How does Orfilo generate meaningful names instead of random hashes?',
    answer:
      'Rather than relying on default filenames like "image_892348_final.png", Orfilo feeds prompt semantics and deliverable context to Gemini 2.5 Flash. The engine deterministically extracts the core subject and context, creating clean, descriptive kebab-case names.',
  },
  {
    question: 'Does Orfilo support deep project subfolders?',
    answer:
      'Yes! Every project workspace supports unlimited subfolders (e.g. "Habesha Model / Marketing / 3D Renders"). You can drag and drop artifacts between folders, rename subfolders, and filter deliverables with live counters.',
  },
  {
    question: 'Is my data secure and isolated?',
    answer:
      'Completely. Orfilo uses Supabase with PostgreSQL Row-Level Security (RLS) enabled on every single table. Every query is strictly authenticated via your Supabase JWT or cryptographically hashed extension token. No other user can ever access your deliverables.',
  },
  {
    question: 'Can I use Orfilo without the Chrome Extension?',
    answer:
      'Yes. You can manually drag and drop or upload files into any project, paste code directly, and organize deliverables via the web dashboard. The Chrome extension simply automates the capture step directly from AI chat tabs.',
  },
];

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onSignIn,
  onSignUp,
  isLoggedIn = false,
  onReturnToDashboard,
}) => {
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleCopyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(true);
    setTimeout(() => setCopiedCommand(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col antialiased selection:bg-[#E8F7F0] selection:text-[#19A974] relative overflow-x-hidden font-sans">
      {/* Clean Ambient Radial Illumination (NO DOTS) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] pointer-events-none bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(25,169,116,0.12),rgba(255,255,255,0))] -z-10" />

      {/* Sticky Top Navigation Bar (Better Auth Style) */}
      <header className="px-6 md:px-12 py-3.5 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrfiloBrand variant="horizontal" size="md" showTagline={false} />
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60 hidden sm:inline-block">
            v2.0
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-neutral-600">
          <a href="#features" className="hover:text-neutral-950 transition-colors">
            Features
          </a>
          <a href="#comparison" className="hover:text-neutral-950 transition-colors">
            Why Orfilo
          </a>
          <a href="#faq" className="hover:text-neutral-950 transition-colors">
            FAQ
          </a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          {isLoggedIn ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReturnToDashboard}
              className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          ) : (
            <>
              <button
                onClick={onSignIn}
                className="px-3.5 py-1.5 border border-neutral-200/80 hover:border-neutral-400 rounded-xl text-xs font-medium text-neutral-800 transition-colors cursor-pointer bg-white"
              >
                Sign in
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSignUp}
                className="px-4 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Get started</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
              </motion.button>
            </>
          )}
        </div>
      </header>

      {/* ================================================================= */}
      {/* HERO SECTION (CLEAN, BOLD BETTER AUTH STYLE)                      */}
      {/* ================================================================= */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-20 flex flex-col items-center text-center">
        {/* Animated Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-medium border border-neutral-200/90 bg-white text-neutral-700 mb-6 shadow-2xs hover:border-neutral-300 transition-all cursor-default"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#19A974]" />
          </span>
          <span className="font-semibold text-neutral-900">Orfilo 2.0</span>
          <span className="text-neutral-300">•</span>
          <span className="text-neutral-600">The intelligent deliverable layer for AI</span>
          <ArrowRight className="w-3 h-3 text-neutral-400" />
        </motion.div>

        {/* Hero Title with Better Auth Contrast */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-950 max-w-4xl leading-[1.08]"
        >
          Everything your AI creates.{' '}
          <span className="text-[#19A974] bg-clip-text text-transparent bg-gradient-to-r from-[#19A974] via-[#2CD59B] to-[#158f62]">
            Organized with precision.
          </span>
        </motion.h1>

        {/* Hero Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="mt-6 text-base sm:text-lg md:text-xl text-neutral-500 max-w-2xl font-normal leading-relaxed"
        >
          Capture, classify, and organize diagrams, code files, and mockups from ChatGPT, Claude, and Gemini — automatically routed into clean project subfolders using Gemini intelligence.
        </motion.p>

        {/* Hero Action CTA Buttons & Quick Command Pill */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="mt-9 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSignUp}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Start free workspace</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          {/* Better Auth Quick Command Copy Pill */}
          <div className="w-full sm:w-auto flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200/90 bg-neutral-50/80 hover:bg-neutral-100/80 text-xs font-mono text-neutral-700 transition-colors cursor-pointer group">
            <span className="text-neutral-400 select-none">$</span>
            <span className="font-semibold text-neutral-800">npx orfilo pair</span>
            <button
              onClick={() => handleCopyCommand('npx orfilo pair')}
              className="p-1 text-neutral-400 group-hover:text-neutral-900 transition-colors ml-1 cursor-pointer"
              title="Copy pairing command"
            >
              {copiedCommand ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Micro-Trust Signals directly under Hero CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-neutral-400 font-mono"
        >
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded text-[10px]">
              ⌘K
            </kbd>
            <span>Instant Search</span>
          </span>
          <span>•</span>
          <span>Chrome Companion Sync</span>
          <span>•</span>
          <span>PostgreSQL Row-Level Security</span>
        </motion.div>

        {/* ================================================================= */}
        {/* STATS & METRICS HIGHLIGHT BAR (BETTER AUTH STYLE)                 */}
        {/* ================================================================= */}
        <section className="mt-20 w-full grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-5 rounded-2xl border border-neutral-200/80 bg-white/70 shadow-2xs">
            <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              &lt; 120ms
            </div>
            <div className="text-xs font-semibold text-neutral-800 mt-1">Ingestion Latency</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Direct from AI tab to Supabase database</p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200/80 bg-white/70 shadow-2xs">
            <div className="text-2xl md:text-3xl font-extrabold text-[#19A974] font-mono tracking-tight">
              100%
            </div>
            <div className="text-xs font-semibold text-neutral-800 mt-1">Row-Level Security</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Strict user-scoped PostgreSQL policies</p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200/80 bg-white/70 shadow-2xs">
            <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              0
            </div>
            <div className="text-xs font-semibold text-neutral-800 mt-1">Manual File Renaming</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">Gemini converts prompts into filenames</p>
          </div>

          <div className="p-5 rounded-2xl border border-neutral-200/80 bg-white/70 shadow-2xs">
            <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
              Universal
            </div>
            <div className="text-xs font-semibold text-neutral-800 mt-1">AI Tool Support</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">ChatGPT, Claude, Gemini, Cursor, Flux</p>
          </div>
        </section>

        {/* ================================================================= */}
        {/* HIGH-CLASS ASYMMETRIC BENTO GRID (BETTER AUTH / LINEAR STYLE)     */}
        {/* ================================================================= */}
        <section id="features" className="mt-28 w-full text-left space-y-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/60 font-mono">
              ENGINEERING ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
              Built for speed, clarity, and security.
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Every component is crafted to give builders effortless control over their expanding library of AI deliverables.
            </p>
          </div>

          {/* 4 High-Class Architecture Cards in a 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ------------------------------------------------------------- */}
            {/* CARD 01: CHROME COMPANION EXTENSION                           */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-7 shadow-xs hover:shadow-lg hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#19A974] flex items-center justify-center border border-emerald-100 shadow-2xs">
                    <Puzzle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200/60">
                    01 / COMPANION EXTENSION
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                    Silent Ingestion at the Source
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Hover directly over code blocks, SVG diagrams, and generated images in ChatGPT, Claude, and Gemini. One click quietly routes deliverables into your workspace without leaving your AI tab.
                  </p>
                </div>
              </div>

              {/* Floating Companion Capture Pill over AI Mockup */}
              <div className="mt-6 pt-5 border-t border-neutral-100">
                <div className="bg-neutral-900 text-neutral-100 rounded-xl p-4 font-mono text-xs shadow-md border border-neutral-800 relative overflow-hidden">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-800 text-[11px] text-neutral-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-neutral-200 font-semibold">Claude 3.7 Sonnet</span>
                      <span>•</span>
                      <span>deliverable_export.ts</span>
                    </div>
                    <span className="text-neutral-500 text-[10px]">95ms latency</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-neutral-300 opacity-90 select-none">
                    <div><span className="text-purple-400">export const</span> <span className="text-blue-400">campaignDeliverable</span> = {'{'}</div>
                    <div className="pl-4 text-emerald-300">project: <span className="text-amber-300">&quot;Habesha Model&quot;</span>,</div>
                    <div className="pl-4 text-emerald-300">subfolder: <span className="text-amber-300">&quot;Marketing / 3D Renders&quot;</span>,</div>
                    <div className="pl-4 text-emerald-300">status: <span className="text-blue-300">&quot;final_approved&quot;</span></div>
                    <div>{'}'};</div>
                  </div>

                  <div className="absolute right-4 bottom-3 sm:bottom-4 flex items-center gap-2 bg-white text-neutral-900 px-3.5 py-1.5 rounded-xl shadow-xl border border-neutral-200 text-xs font-sans font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[#19A974]">Save to Orfilo</span>
                    <span className="text-neutral-300">↳</span>
                    <span className="text-neutral-700 font-mono text-[11px]">Habesha Model</span>
                    <Check className="w-3.5 h-3.5 text-[#19A974] ml-1" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 02: GEMINI PROMPT-TO-NAME CLASSIFIER                     */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-7 shadow-xs hover:shadow-lg hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200/60">
                    02 / AUTO-NAMING
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                    Prompt-to-Filename Engine
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Gemini 2.5 Flash analyzes prompt context to convert meaningless download hashes into standardized kebab-case filenames based on intent.
                  </p>
                </div>
              </div>

              {/* Visual Transformation Box */}
              <div className="mt-6 pt-5 border-t border-neutral-100 space-y-2.5 font-mono text-xs">
                <div className="p-2.5 bg-red-50/80 border border-red-200/70 rounded-xl text-red-700 flex items-center justify-between">
                  <span className="line-through truncate text-[11px]">export_849202_v2.tmp</span>
                  <span className="text-[10px] bg-red-100 px-1.5 py-0.5 rounded text-red-800">Raw AI Export</span>
                </div>

                <div className="flex justify-center text-neutral-400 text-xs">
                  <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded-full border border-neutral-200 font-semibold text-neutral-600">
                    Gemini 2.5 Flash Context Parsing
                  </span>
                </div>

                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between shadow-2xs">
                  <span className="font-semibold truncate text-[11px]">habesha-hero-concept.png</span>
                  <span className="text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800 font-semibold">99.4% Match</span>
                </div>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 03: PROJECT & NESTED SUBFOLDER ROUTING                   */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-7 shadow-xs hover:shadow-lg hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-2xs">
                    <Folder className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200/60">
                    03 / SUBFOLDERS & DRAG & DROP
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                    Multi-Level Subfolder Architecture
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Move beyond flat lists. Organize deliverables into intuitive nested project subfolders with live artifact counts, drag-and-drop reorganization, and 1-click Undo.
                  </p>
                </div>
              </div>

              {/* Nested Tree Visual + Drag Feedback */}
              <div className="mt-6 pt-5 border-t border-neutral-100 space-y-3">
                <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-3.5 font-mono text-xs space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between font-semibold text-neutral-900 pb-1 border-b border-neutral-200/60">
                    <span className="flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-[#19A974]" />
                      <span>Habesha Model</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-200 text-neutral-700">24 items</span>
                  </div>
                  <div className="pl-3 space-y-1 text-neutral-600 text-[11px]">
                    <div className="flex items-center gap-1 text-neutral-800 font-medium">
                      <CornerDownRight className="w-3 h-3 text-neutral-400" />
                      <span>📁 Marketing</span>
                      <span className="text-[10px] text-neutral-400">(14)</span>
                    </div>
                    <div className="pl-5 text-emerald-700 font-medium flex items-center gap-1">
                      <CornerDownRight className="w-2.5 h-2.5 text-neutral-300" />
                      <span>↳ 📁 3D Renders</span>
                      <span className="text-[10px] text-neutral-400">(6)</span>
                    </div>
                    <div className="pl-9 text-neutral-500 text-[10px] truncate">
                      ↳ habesha-editorial-golden-hour.png
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-medium truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="truncate">Moved &rarr; 3D Renders</span>
                  </div>
                  <span className="px-2 py-0.5 bg-white border border-emerald-200 rounded text-emerald-800 font-semibold text-[11px] shadow-2xs">
                    Undo Move
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ------------------------------------------------------------- */}
            {/* CARD 04: LIGHTNING ⌘K COMMAND PALETTE                         */}
            {/* ------------------------------------------------------------- */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-7 shadow-xs hover:shadow-lg hover:border-neutral-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-2xs">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-500 border border-neutral-200/60">
                    04 / COMMAND PALETTE
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
                    Sub-15ms ⌘K Workspace Search
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    Instantly search across project deliverables, tags, file formats, and subfolders. Zero mouse required — complete keyboard-first navigation.
                  </p>
                </div>
              </div>

              {/* Floating ⌘K Command Palette Visual */}
              <div className="mt-6 pt-5 border-t border-neutral-100">
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3 space-y-2 shadow-sm font-mono text-xs">
                  <div className="bg-white border border-neutral-200/80 rounded-lg px-3 py-2 flex items-center justify-between text-xs text-neutral-900 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <Search className="w-3.5 h-3.5 text-[#19A974]" />
                      <span className="font-semibold text-neutral-900">habesha renders</span>
                      <span className="w-1.5 h-4 bg-[#19A974] animate-pulse" />
                    </div>
                    <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-100 border border-neutral-200 rounded text-neutral-500">
                      ESC
                    </kbd>
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="p-2 bg-white rounded-lg border border-emerald-200/70 flex items-center justify-between text-neutral-800">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#19A974]" />
                        <span className="font-semibold truncate">habesha-editorial-golden-hour.png</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-sans">Marketing</span>
                    </div>

                    <div className="p-2 bg-neutral-100/60 rounded-lg flex items-center justify-between text-neutral-600">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                        <span className="truncate">couture-garment-wireframe.blend</span>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-sans">3D Renders</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* WITHOUT VS WITH ORFILO (COMPARISON SECTION)                       */}
        {/* ================================================================= */}
        <section id="comparison" className="mt-28 w-full text-left space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/60 font-mono">
              THE WORKFLOW DIFFERENCE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
              The end of the downloads folder graveyard.
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Compare the standard AI export workflow with the Orfilo intelligence layer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Without Orfilo */}
            <div className="p-6 md:p-8 rounded-2xl border border-red-200/70 bg-red-50/20 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-red-600 uppercase tracking-wider">
                  Without Orfilo
                </span>
                <span className="text-xs text-neutral-400">Chaos & Lost Context</span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 bg-white/80 border border-red-200/60 rounded-xl text-neutral-700 flex items-center gap-2">
                  <span className="text-red-500">✕</span>
                  <span className="truncate">Downloads/image_7392_final.png</span>
                </div>
                <div className="p-2.5 bg-white/80 border border-red-200/60 rounded-xl text-neutral-700 flex items-center gap-2">
                  <span className="text-red-500">✕</span>
                  <span className="truncate">Downloads/snippet (4).ts</span>
                </div>
                <div className="p-2.5 bg-white/80 border border-red-200/60 rounded-xl text-neutral-700 flex items-center gap-2">
                  <span className="text-red-500">✕</span>
                  <span className="truncate">Downloads/data_model_v2_really_final.csv</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-red-100">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Scattered across browser tabs, downloads, and chat history</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Zero record of which AI prompt or model created which file</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Manual renaming and manual dragging into folders every time</span>
                </li>
              </ul>
            </div>

            {/* With Orfilo */}
            <div className="p-6 md:p-8 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-[#19A974] uppercase tracking-wider">
                  With Orfilo
                </span>
                <span className="text-xs text-emerald-700 font-medium">Automatic & Structured</span>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-3.5 h-3.5 text-[#19A974] shrink-0" />
                    <span className="truncate font-semibold">habesha-editorial-golden-hour.png</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0">Habesha / Marketing</span>
                </div>
                <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-3.5 h-3.5 text-[#19A974] shrink-0" />
                    <span className="truncate font-semibold">supabase-jwt-auth-middleware.ts</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0">Core / Auth</span>
                </div>
                <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-3.5 h-3.5 text-[#19A974] shrink-0" />
                    <span className="truncate font-semibold">q4-saas-cohort-retention-model.xlsx</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0">Finance</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-neutral-700 pt-2 border-t border-emerald-100">
                <li className="flex items-start gap-2">
                  <span className="text-[#19A974] font-bold">✓</span>
                  <span>Auto-filed into project subfolders using Gemini semantic matching</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#19A974] font-bold">✓</span>
                  <span>Preserves original prompts, timestamps, model tags, and links</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#19A974] font-bold">✓</span>
                  <span>Instant ⌘K search, preview drawer, and 1-click downloads</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* INTERACTIVE FAQ ACCORDION                                         */}
        {/* ================================================================= */}
        <section id="faq" className="mt-28 w-full max-w-3xl text-left space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-950">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-neutral-500">Everything you need to know about the Orfilo platform.</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className="border border-neutral-200/80 rounded-2xl bg-white overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-5 text-left text-xs sm:text-sm font-semibold text-neutral-900 flex items-center justify-between cursor-pointer hover:bg-neutral-50/50"
                  >
                    <span>{item.question}</span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 ml-3 text-neutral-400"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs text-neutral-500 leading-relaxed border-t border-neutral-100">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ================================================================= */}
        {/* BOTTOM CALL TO ACTION BANNER (BETTER AUTH STYLE)                  */}
        {/* ================================================================= */}
        <section className="mt-28 w-full">
          <div className="relative rounded-3xl bg-neutral-950 text-white p-8 md:p-14 overflow-hidden border border-neutral-800 shadow-2xl text-center flex flex-col items-center">
            {/* Subtle Glowing Background Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#19A974]/20 blur-3xl pointer-events-none rounded-full" />

            <div className="relative z-10 max-w-2xl space-y-5">
              <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-white/10 text-emerald-400 border border-white/10 uppercase tracking-wider font-semibold">
                Instant Developer Workspace
              </span>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.12]">
                Ready to organize everything your AI creates?
              </h2>

              <p className="text-neutral-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                Connect your account in seconds. Capture deliverables directly from ChatGPT, Claude, and Gemini into clean project workspaces.
              </p>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSignUp}
                  className="w-full sm:w-auto px-7 py-3.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer group"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <button
                  onClick={onSignIn}
                  className="w-full sm:w-auto px-6 py-3.5 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white rounded-xl text-xs sm:text-sm font-medium transition-colors cursor-pointer bg-white/5"
                >
                  Sign In to Workspace
                </button>
              </div>

              <div className="text-[11px] text-neutral-500 font-mono pt-2">
                Free for individual developers • No credit card required • Instant setup
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-200/80 py-10 px-6 md:px-12 bg-neutral-50/50 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <OrfiloBrand variant="horizontal" size="sm" showTagline={false} />
          <span className="hidden sm:inline text-neutral-300">|</span>
          <span className="text-[11px] text-neutral-400">&copy; 2026 Orfilo Inc. The intelligent deliverable layer for AI.</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono">Systems Operational</span>
          </div>

          {isLoggedIn ? (
            <button onClick={onReturnToDashboard} className="hover:text-neutral-900 cursor-pointer font-semibold text-neutral-800">
              Open Workspace &rarr;
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <button onClick={onSignIn} className="hover:text-neutral-900 cursor-pointer">
                Sign in
              </button>
              <button onClick={onSignUp} className="hover:text-[#19A974] cursor-pointer font-semibold text-neutral-900">
                Get started
              </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
