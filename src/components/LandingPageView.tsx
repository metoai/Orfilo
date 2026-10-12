import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Zap,
  Check,
  Search,
  Folder,
  FolderOpen,
  FolderPlus,
  ShieldCheck,
  Sparkles,
  Copy,
  CheckCircle2,
  ChevronDown,
  Layers,
  FileCode,
  FileImage,
  FileSpreadsheet,
  Cpu,
  Sliders,
  Workflow,
  Puzzle,
  Download,
  Terminal,
  MousePointerClick,
  Lock,
  ArrowUpRight,
  RefreshCw,
  Eye,
  FileText,
  CornerDownRight,
} from 'lucide-react';
import { OrfiloBrand, OrfiloIcon } from './OrfiloBrand.tsx';

interface LandingPageViewProps {
  onSignIn: () => void;
  onSignUp: () => void;
  isLoggedIn?: boolean;
  onReturnToDashboard?: () => void;
}

interface PlaygroundScenario {
  id: string;
  source: 'ChatGPT' | 'Claude' | 'Midjourney / Flux';
  sourceColor: string;
  sourceIcon: typeof FileImage;
  promptTitle: string;
  promptSnippet: string;
  generatedFileName: string;
  targetProject: string;
  targetSubfolder: string;
  tags: string[];
  fileSize: string;
  confidence: string;
  previewType: 'image' | 'code' | 'sheet';
  previewDetails: string;
  codeSnippet?: string;
}

const PLAYGROUND_SCENARIOS: PlaygroundScenario[] = [
  {
    id: 'fashion',
    source: 'Midjourney / Flux',
    sourceColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
    sourceIcon: FileImage,
    promptTitle: 'Fashion Brand Hero Asset',
    promptSnippet: 'Hyperrealistic editorial portrait for Ethiopian Habesha haute couture line, golden hour sunlight, traditional woven details, 8k resolution, cinematic raw style',
    generatedFileName: 'habesha-editorial-golden-hour.png',
    targetProject: 'Habesha Model',
    targetSubfolder: 'Marketing / 3D Renders',
    tags: ['editorial', 'fashion', 'hero-asset'],
    fileSize: '4.2 MB',
    confidence: '99.4%',
    previewType: 'image',
    previewDetails: 'PNG Image • 3840x2160 • Color Profile Display P3',
  },
  {
    id: 'auth-code',
    source: 'Claude',
    sourceColor: 'bg-amber-50 text-amber-700 border-amber-200/80',
    sourceIcon: FileCode,
    promptTitle: 'Supabase JWT Auth Middleware',
    promptSnippet: 'Write a hardened Express TypeScript middleware that validates Supabase JWT, resolves user identity, and verifies extension API keys against SHA-256 hash',
    generatedFileName: 'supabase-jwt-auth-middleware.ts',
    targetProject: 'Core Platform',
    targetSubfolder: 'Auth / Backend',
    tags: ['middleware', 'jwt', 'express-ts'],
    fileSize: '8.4 KB',
    confidence: '98.8%',
    previewType: 'code',
    previewDetails: 'TypeScript • 142 lines • Zero dependencies',
    codeSnippet: `export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing auth token' });
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });
  req.user = user;
  next();
}`,
  },
  {
    id: 'retention-model',
    source: 'ChatGPT',
    sourceColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    sourceIcon: FileSpreadsheet,
    promptTitle: 'Q4 SaaS Retention & Cohort Model',
    promptSnippet: 'Build a financial model projecting net revenue retention, monthly active cohorts, and churn elasticity across starter and enterprise tiers',
    generatedFileName: 'q4-saas-cohort-retention-model.xlsx',
    targetProject: 'Operations',
    targetSubfolder: 'Finance / Forecasts',
    tags: ['finance', 'cohorts', 'projections'],
    fileSize: '1.1 MB',
    confidence: '97.9%',
    previewType: 'sheet',
    previewDetails: 'Excel Workbook • 4 Sheets • Interactive Formulas',
  },
];

const SUPPORTED_MODELS = [
  { name: 'ChatGPT', provider: 'OpenAI (GPT-4o & o3)' },
  { name: 'Claude 3.7', provider: 'Anthropic (Sonnet & Opus)' },
  { name: 'Gemini 2.5', provider: 'Google DeepMind (Flash)' },
  { name: 'Cursor & Copilot', provider: 'Anysphere / GitHub' },
  { name: 'Midjourney & Flux', provider: 'Black Forest Labs' },
  { name: 'v0 by Vercel', provider: 'Frontend UI Generation' },
];

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
  // Hero Showcase States
  const [activeHeroTab, setActiveHeroTab] = useState<'pipeline' | 'naming' | 'tree' | 'security'>('pipeline');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('fashion');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStage, setSimulationStage] = useState<number>(3); // 1: Capturing, 2: Analyzing, 3: Completed
  const [copiedFileName, setCopiedFileName] = useState<boolean>(false);
  const [copiedCommand, setCopiedCommand] = useState<boolean>(false);
  const [customPromptInput, setCustomPromptInput] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeScenario =
    PLAYGROUND_SCENARIOS.find((s) => s.id === selectedScenarioId) || PLAYGROUND_SCENARIOS[0];

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setSimulationStage(1);
    setTimeout(() => {
      setSimulationStage(2);
      setTimeout(() => {
        setSimulationStage(3);
        setIsSimulating(false);
      }, 650);
    }, 550);
  };

  const handleCopyFileName = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFileName(true);
    setTimeout(() => setCopiedFileName(false), 2000);
  };

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
          <a href="#interactive-showcase" className="hover:text-neutral-950 transition-colors">
            Interactive Hero
          </a>
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
      {/* HERO SECTION (FOCUSED & ELEVATED BETTER AUTH STYLE)               */}
      {/* ================================================================= */}
      <main className="flex-1 max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-20 flex flex-col items-center text-center">
        {/* Animated Badge Pill */}
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

        {/* Interactive Feature View Tabs in Hero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-1.5 p-1 bg-neutral-100/80 border border-neutral-200/70 rounded-2xl text-xs max-w-xl mx-auto"
        >
          {[
            { id: 'pipeline', label: '⚡️ Live Ingestion', icon: Zap },
            { id: 'naming', label: '🪄 Prompt-to-Name', icon: Sparkles },
            { id: 'tree', label: '📁 Subfolder Hierarchy', icon: Folder },
            { id: 'security', label: '🔒 Row-Level Security', icon: ShieldCheck },
          ].map((tab) => {
            const isTabActive = activeHeroTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveHeroTab(tab.id as any)}
                className={`relative px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                  isTabActive
                    ? 'text-neutral-900 font-semibold shadow-2xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {isTabActive && (
                  <motion.div
                    layoutId="heroTabHighlight"
                    className="absolute inset-0 bg-white rounded-xl -z-0 shadow-2xs border border-neutral-200/60"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <tab.icon className={`w-3.5 h-3.5 ${isTabActive ? 'text-[#19A974]' : 'text-neutral-400'}`} />
                  <span>{tab.label}</span>
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* ================================================================= */}
        {/* HERO INTERACTIVE SHOWCASE CONTAINER (BETTER AUTH HERO CARD)      */}
        {/* ================================================================= */}
        <motion.section
          id="interactive-showcase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
          className="mt-6 w-full text-left"
        >
          <div className="border border-neutral-200/90 rounded-2xl bg-white shadow-xl shadow-neutral-200/40 overflow-hidden">
            {/* Top Showcase Window Header */}
            <div className="px-5 py-3.5 border-b border-neutral-200/80 bg-neutral-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                <span className="ml-2 font-mono text-[11px] text-neutral-500 font-medium">
                  orfilo.workspace.v2 / {activeHeroTab}
                </span>
              </div>

              {/* Scenario Quick Selector (when on pipeline tab) */}
              {activeHeroTab === 'pipeline' && (
                <div className="inline-flex p-1 bg-neutral-200/60 rounded-xl items-center gap-1 text-xs self-start sm:self-auto">
                  {PLAYGROUND_SCENARIOS.map((scenario) => {
                    const isSelected = selectedScenarioId === scenario.id;
                    return (
                      <button
                        key={scenario.id}
                        onClick={() => {
                          setSelectedScenarioId(scenario.id);
                          setSimulationStage(3);
                        }}
                        className={`relative px-3 py-1 text-xs rounded-lg font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'text-neutral-900 font-semibold shadow-2xs'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="scenarioHighlight"
                            className="absolute inset-0 bg-white rounded-lg -z-0"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <span>{scenario.promptTitle}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TAB CONTENT 1: LIVE INGESTION PIPELINE */}
            {activeHeroTab === 'pipeline' && (
              <div className="p-6 md:p-8 space-y-6">
                {/* 3-Stage Progress Timeline */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-2 border-b border-neutral-100">
                  <div
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      simulationStage >= 1
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                        : 'border-neutral-200/70 bg-neutral-50/40 text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 mb-1">
                      <span>STAGE 01</span>
                      {simulationStage >= 1 && <Check className="w-3 h-3 text-[#19A974]" />}
                    </div>
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <MousePointerClick className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Export Intercepted</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1 truncate">
                      Captured via Chrome Extension from {activeScenario.source}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      simulationStage >= 2
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                        : 'border-neutral-200/70 bg-neutral-50/40 text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 mb-1">
                      <span>STAGE 02</span>
                      {simulationStage >= 2 && <Check className="w-3 h-3 text-[#19A974]" />}
                    </div>
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Gemini 2.5 Flash Classification</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1 truncate">
                      Confidence score: {activeScenario.confidence}
                    </div>
                  </div>

                  <div
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      simulationStage >= 3
                        ? 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
                        : 'border-neutral-200/70 bg-neutral-50/40 text-neutral-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-neutral-400 mb-1">
                      <span>STAGE 03</span>
                      {simulationStage >= 3 && <Check className="w-3 h-3 text-[#19A974]" />}
                    </div>
                    <div className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <Folder className="w-3.5 h-3.5 text-[#19A974]" />
                      <span>Subfolder Routing</span>
                    </div>
                    <div className="text-[11px] text-neutral-500 mt-1 truncate">
                      {activeScenario.targetProject} / {activeScenario.targetSubfolder}
                    </div>
                  </div>
                </div>

                {/* Left (Raw AI Prompt) + Right (Structured Orfilo Deliverable Card) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  {/* Left: Raw Prompt Capture */}
                  <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-5 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${activeScenario.sourceColor}`}>
                            {activeScenario.source}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">Prompt Context</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono">Unstructured</span>
                      </div>

                      <div className="bg-white border border-neutral-200/80 rounded-lg p-3 text-xs text-neutral-800 font-mono leading-relaxed shadow-2xs">
                        &quot;{activeScenario.promptSnippet}&quot;
                      </div>

                      <div className="space-y-1.5 text-xs text-neutral-500">
                        <div className="flex items-center gap-1.5 text-red-500/90 font-medium text-[11px]">
                          <span>✕ Messy browser export:</span>
                          <code className="text-neutral-600 bg-neutral-200/60 px-1.5 py-0.5 rounded text-[10px]">
                            export_9381029_untitled_final(2).tmp
                          </code>
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          Without Orfilo: dumped into your cluttered downloads folder with lost context.
                        </div>
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRunSimulation}
                      disabled={isSimulating}
                      className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                    >
                      {isSimulating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>Gemini analyzing prompt...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Simulate Live Ingestion</span>
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Right: The Orfilo Organized Deliverable */}
                  <div className="bg-white border-2 border-[#19A974]/40 rounded-xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-bold text-neutral-900">Orfilo Organized Deliverable</span>
                        </div>
                        <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {activeScenario.confidence} Match
                        </span>
                      </div>

                      {/* Clean Filename with Copy Action */}
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
                          Standardized Deliverable Name
                        </div>
                        <div className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg">
                          <div className="flex items-center gap-2 min-w-0">
                            <activeScenario.sourceIcon className="w-4 h-4 text-[#19A974] shrink-0" />
                            <span className="font-mono text-xs font-semibold text-neutral-900 truncate">
                              {activeScenario.generatedFileName}
                            </span>
                          </div>
                          <button
                            onClick={() => handleCopyFileName(activeScenario.generatedFileName)}
                            className="p-1 text-neutral-400 hover:text-neutral-900 rounded hover:bg-neutral-200/50 transition-colors cursor-pointer shrink-0"
                            title="Copy filename"
                          >
                            {copiedFileName ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Folder Routing Tree */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="p-2.5 bg-neutral-50/70 border border-neutral-200/70 rounded-lg">
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">Target Project</div>
                          <div className="font-semibold text-neutral-900 mt-0.5 flex items-center gap-1.5 truncate">
                            <Folder className="w-3.5 h-3.5 text-[#19A974]" />
                            <span className="truncate">{activeScenario.targetProject}</span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-neutral-50/70 border border-neutral-200/70 rounded-lg">
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">Subfolder Route</div>
                          <div className="font-semibold text-neutral-900 mt-0.5 truncate font-mono text-[11px]">
                            {activeScenario.targetSubfolder}
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {activeScenario.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60"
                          >
                            #{tag}
                          </span>
                        ))}
                        <span className="text-[10px] font-mono text-neutral-400 ml-auto">
                          {activeScenario.fileSize}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                      <span className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#19A974]" />
                        <span>Ready in your workspace tree</span>
                      </span>
                      <button
                        onClick={onSignUp}
                        className="text-xs text-[#19A974] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Try with your AI</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: PROMPT-TO-NAME (SIDE BY SIDE TRANSFORMATION) */}
            {activeHeroTab === 'naming' && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="max-w-2xl">
                  <h3 className="text-base font-bold text-neutral-900">Intelligent Prompt Extraction</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Orfilo inspects the user prompt and AI response to extract concise, descriptive filenames instead of messy random hashes.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      tool: 'ChatGPT',
                      raw: 'image_940182_concept_v2(3).png',
                      prompt: 'A sleek minimal UI mockup for an analytics dashboard with dark theme and emerald accent lines',
                      clean: 'analytics-dashboard-dark-ui-mockup.png',
                      folder: 'Orfilo Web / UI Concepts',
                    },
                    {
                      tool: 'Claude',
                      raw: 'code_snippet_auth_handler_final.ts',
                      prompt: 'Create a Next.js server action to refresh Google OAuth tokens with automatic retry',
                      clean: 'google-oauth-token-refresh-action.ts',
                      folder: 'Core Platform / Auth',
                    },
                    {
                      tool: 'Midjourney',
                      raw: 'ethiopian_model_847192.png',
                      prompt: 'High fashion editorial photo for Habesha cultural dress, modern minimalist styling, studio lighting',
                      clean: 'habesha-editorial-studio-portrait.png',
                      folder: 'Habesha Model / Marketing',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-center text-xs"
                    >
                      <div className="md:col-span-5 space-y-1">
                        <div className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                          Prompt ({item.tool})
                        </div>
                        <div className="text-neutral-700 italic font-medium line-clamp-2">
                          &quot;{item.prompt}&quot;
                        </div>
                      </div>

                      <div className="md:col-span-3 space-y-1">
                        <div className="text-[10px] font-mono text-red-500 uppercase font-semibold">
                          Raw AI Export
                        </div>
                        <div className="font-mono text-red-600 line-through truncate bg-red-50/80 px-2 py-1 rounded border border-red-200/60">
                          {item.raw}
                        </div>
                      </div>

                      <div className="md:col-span-4 space-y-1">
                        <div className="text-[10px] font-mono text-[#19A974] uppercase font-semibold">
                          Orfilo Standardized Name
                        </div>
                        <div className="font-mono text-neutral-900 font-semibold truncate bg-emerald-50 px-2 py-1 rounded border border-emerald-200/60 flex items-center justify-between">
                          <span className="truncate">{item.clean}</span>
                          <Check className="w-3.5 h-3.5 text-[#19A974] shrink-0 ml-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: SUBFOLDER TREE HIERARCHY */}
            {activeHeroTab === 'tree' && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="max-w-2xl">
                  <h3 className="text-base font-bold text-neutral-900">Multi-Level Subfolder Hierarchy</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Projects are organized like a real developer workspace. Deliverables are filed cleanly with drag-and-drop support.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Interactive Tree Visual */}
                  <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50 font-mono text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-neutral-200 font-semibold text-neutral-900">
                      <span className="flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-[#19A974]" />
                        <span>Habesha Model Workspace</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-700">
                        24 artifacts
                      </span>
                    </div>

                    <div className="pl-3 space-y-1.5 text-neutral-700">
                      <div className="flex items-center gap-1.5 text-neutral-900 font-medium">
                        <CornerDownRight className="w-3.5 h-3.5 text-neutral-400" />
                        <Folder className="w-3.5 h-3.5 text-blue-500" />
                        <span>Marketing</span>
                        <span className="text-[10px] text-neutral-400">(14)</span>
                      </div>

                      <div className="pl-6 space-y-1 text-neutral-600 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                          <CornerDownRight className="w-3 h-3 text-neutral-300" />
                          <Folder className="w-3.5 h-3.5 text-[#19A974]" />
                          <span>3D-Renders</span>
                          <span className="text-[10px] text-neutral-400">(6)</span>
                        </div>
                        <div className="pl-8 text-neutral-500 truncate">
                          ↳ habesha-editorial-golden-hour.png
                        </div>
                        <div className="pl-8 text-neutral-500 truncate">
                          ↳ couture-garment-wireframe.blend
                        </div>

                        <div className="flex items-center gap-1.5 pt-1">
                          <CornerDownRight className="w-3 h-3 text-neutral-300" />
                          <Folder className="w-3.5 h-3.5 text-amber-500" />
                          <span>Social-Assets</span>
                          <span className="text-[10px] text-neutral-400">(8)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-neutral-900 font-medium pt-1">
                        <CornerDownRight className="w-3.5 h-3.5 text-neutral-400" />
                        <Folder className="w-3.5 h-3.5 text-purple-500" />
                        <span>Brand-Identity</span>
                        <span className="text-[10px] text-neutral-400">(10)</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: How Drag & Drop works */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-neutral-900">Deterministic Folder Routing</h4>
                      <p className="text-xs text-neutral-500 leading-relaxed">
                        Whenever your AI exports an asset, Orfilo maps the deliverable directly to the corresponding project and subfolder. You can also drag and drop items anytime to reorganize.
                      </p>

                      <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-1.5 text-xs text-emerald-900">
                        <div className="font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#19A974]" />
                          <span>1-Click Subfolder Creation</span>
                        </div>
                        <p className="text-[11px] text-emerald-800">
                          Create nested subfolders on the fly. Live artifact counts and filter pills automatically update across your workspace.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onSignUp}
                      className="w-full py-2.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                    >
                      Organize your projects now &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: ROW LEVEL SECURITY */}
            {activeHeroTab === 'security' && (
              <div className="p-6 md:p-8 space-y-6">
                <div className="max-w-2xl">
                  <h3 className="text-base font-bold text-neutral-900">Enterprise PostgreSQL Row-Level Security</h3>
                  <p className="text-xs text-neutral-500 mt-1">
                    Every database query is gated at the database layer. No unauthenticated client can ever view or leak another user&apos;s deliverables.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left: Code Snippet */}
                  <div className="p-4 rounded-xl bg-neutral-900 text-neutral-200 font-mono text-[11px] space-y-2 border border-neutral-800">
                    <div className="flex items-center justify-between text-neutral-500 border-b border-neutral-800 pb-2">
                      <span>supabase/migrations/rls_policies.sql</span>
                      <span className="text-emerald-400">ENFORCED</span>
                    </div>
                    <pre className="text-neutral-300 leading-relaxed overflow-x-auto">
{`-- Enforce strict user isolation
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_isolated_artifacts"
  ON artifacts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Cryptographically hashed companion keys
CREATE INDEX idx_companion_tokens
  ON integration_connections (access_token_hash);`}
                    </pre>
                  </div>

                  {/* Right: Security Guarantees */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-[#19A974]" />
                          <span>Cryptographic SHA-256 Hashing</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          Chrome extension pairing tokens are never stored in plaintext. They are hashed using SHA-256 before storage in Supabase.
                        </p>
                      </div>

                      <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl space-y-1">
                        <div className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                          <span>JWT Per-Request Context</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 leading-relaxed">
                          Every API request extracts and validates the Supabase session token via <code className="bg-neutral-100 px-1 rounded text-neutral-800">getUser(token)</code>.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={onSignUp}
                      className="w-full py-2.5 px-4 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-2xs"
                    >
                      Start Secure Workspace &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.section>

        {/* ================================================================= */}
        {/* COMPATIBLE AI PLATFORMS BAR (HERO TRUST SIGNALS)                  */}
        {/* ================================================================= */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-14 w-full text-center space-y-3.5"
        >
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
            Universal Companion Sync Across Major AI Environments
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {SUPPORTED_MODELS.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ y: -2 }}
                className="px-3.5 py-1.5 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 text-xs text-neutral-700 shadow-2xs flex items-center gap-2 transition-all cursor-default"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#19A974]" />
                <span className="font-semibold text-neutral-900">{item.name}</span>
                <span className="text-[10px] text-neutral-400 hidden sm:inline">({item.provider})</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

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
        {/* BENTO GRID FEATURES                                               */}
        {/* ================================================================= */}
        <section id="features" className="mt-28 w-full text-left space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200/60 font-mono">
              ENGINEERING ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-950">
              Built for speed, clarity, and security.
            </h2>
            <p className="text-sm text-neutral-500 leading-relaxed">
              Every detail is engineered to give builders instant clarity over their growing collection of AI deliverables.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento Card 1: Companion Chrome Extension */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#19A974] flex items-center justify-center border border-emerald-100">
                  <Puzzle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Chrome Companion Extension</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Hover directly over code blocks, SVG diagrams, and generated images in ChatGPT or Claude. Save with a single click without opening Orfilo.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-[11px] font-mono text-neutral-600 space-y-1">
                <div className="flex items-center justify-between text-neutral-400">
                  <span>Companion Pairing</span>
                  <span className="text-emerald-600 font-semibold">Active</span>
                </div>
                <div className="text-neutral-800 font-semibold truncate">POST /api/v1/extension/pair</div>
              </div>
            </motion.div>

            {/* Bento Card 2: Multi-Level Subfolder Hierarchy */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <Folder className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Project & Subfolder Hierarchy</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Move beyond flat lists. Organize deliverables into intuitive nested folders like <code className="bg-neutral-100 px-1 rounded text-neutral-700">Habesha Model / Marketing / 3D Renders</code>.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 text-[11px] space-y-1.5 font-mono">
                <div className="flex items-center gap-1.5 text-neutral-700 font-medium">
                  <Folder className="w-3.5 h-3.5 text-[#19A974]" />
                  <span>Habesha Model (24)</span>
                </div>
                <div className="pl-4 flex items-center gap-1.5 text-neutral-500">
                  <span>↳ Marketing (14)</span>
                </div>
                <div className="pl-8 flex items-center gap-1.5 text-neutral-400">
                  <span>↳ 3D-Renders (6)</span>
                </div>
              </div>
            </motion.div>

            {/* Bento Card 3: Semantic Auto-Naming */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Gemini Prompt Classification</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Extracts true user intent from AI chat prompts to generate clean, readable filenames instead of unidentifiable download hashes.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-1 text-[11px]">
                <div className="text-neutral-400 line-through truncate font-mono">export_28192_v2_really_final.png</div>
                <div className="text-[#19A974] font-mono font-semibold truncate">&rarr; habesha-editorial-concept.png</div>
              </div>
            </motion.div>

            {/* Bento Card 4: Drag & Drop Reorganization */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Drag & Drop Move with Undo</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Pick up any artifact card and drop it onto sidebar project folders. Includes instant move confirmation toasts with 1-click Undo.
                </p>
              </div>

              <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <span className="font-medium text-[11px]">Artifact Moved &rarr; Habesha Model</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-200 font-semibold">Undo</span>
              </div>
            </motion.div>

            {/* Bento Card 5: Row-Level Security */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-900 flex items-center justify-center border border-neutral-200/80">
                  <Lock className="w-5 h-5 text-neutral-800" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">PostgreSQL Row-Level Security</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  100% database-level isolation. Every table enforces <code className="bg-neutral-100 px-1 rounded text-neutral-700">auth.uid() = user_id</code> policies. No shared or insecure multi-tenant leakage.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 font-mono text-[10px] text-neutral-600">
                CREATE POLICY user_isolation ON artifacts USING (auth.uid() = user_id);
              </div>
            </motion.div>

            {/* Bento Card 6: Lightning Fast ⌘K Search */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Lightning Fast ⌘K Search</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  Type ⌘K anywhere in your workspace to fuzzy-search across project titles, tags, file extensions, and subfolder paths in under 15 milliseconds.
                </p>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70 flex items-center justify-between text-xs text-neutral-400 font-mono">
                <span>&quot;habesha 3d renders&quot;</span>
                <span className="text-[#19A974] font-semibold text-[11px]">8 matches</span>
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
                    <Check className="w-3.5 h-3.5 text-[#19A974]" />
                    <span className="truncate font-semibold">habesha-editorial-golden-hour.png</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0">Habesha / Marketing</span>
                </div>
                <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-3.5 h-3.5 text-[#19A974]" />
                    <span className="truncate font-semibold">supabase-jwt-auth-middleware.ts</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0">Core / Auth</span>
                </div>
                <div className="p-2.5 bg-white border border-emerald-200 rounded-xl text-neutral-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Check className="w-3.5 h-3.5 text-[#19A974]" />
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
