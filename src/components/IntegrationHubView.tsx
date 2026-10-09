import React, { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Plus,
  RefreshCw,
  Zap,
  Puzzle,
  HardDrive,
  Terminal,
  Key,
  Activity,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Trash2,
  Bot,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Lock,
} from 'lucide-react';
import { Project, Artifact, ScopedApiKey } from '../types/index.ts';

export interface IntegrationHubViewProps {
  projects: Project[];
  onArtifactCreated?: (artifact: Artifact) => void;
  onOpenUpload?: () => void;
  onOpenExtensionModal?: () => void;
  onOpenStorage?: () => void;
}

interface InboundLog {
  id: string;
  timestamp: string;
  endpoint: string;
  method: string;
  source_ai: string;
  status_code: number;
  client_ip: string;
  token_verified: boolean;
  summary: string;
}

export function IntegrationHubView({
  projects,
  onArtifactCreated,
  onOpenExtensionModal,
  onOpenStorage,
}: IntegrationHubViewProps) {
  // Live companion extension status
  const [extensionStatus, setExtensionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [extensionDetails, setExtensionDetails] = useState<{
    version?: string;
    storage_provider?: string;
    account?: string;
    connected_at?: string;
    last_seen_at?: string;
  } | null>(null);

  // Live telemetry logs
  const [inboundLogs, setInboundLogs] = useState<InboundLog[]>([]);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);

  // Developer API keys
  const [apiKeys, setApiKeys] = useState<ScopedApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(null);

  // Active developer tab
  const [activeTab, setActiveTab] = useState<'mcp' | 'api' | 'telemetry'>('mcp');

  // UI state
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isTestingCapture, setIsTestingCapture] = useState(false);
  const [captureNotice, setCaptureNotice] = useState<{
    success: boolean;
    message: string;
    artifactName?: string;
    location?: string;
  } | null>(null);

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch extension status
  const loadExtensionStatus = async () => {
    try {
      const res = await fetch('/api/v1/extension/status');
      if (res.ok) {
        const json = await res.json();
        setExtensionStatus(json.status === 'connected' ? 'connected' : 'disconnected');
        setExtensionDetails({
          version: json.version || '1.1.0',
          storage_provider: json.storage_provider || 'Google Drive',
          account: json.account || 'Active Workspace',
          connected_at: json.connected_at,
          last_seen_at: json.last_seen_at,
        });
      } else {
        setExtensionStatus('disconnected');
      }
    } catch {
      setExtensionStatus('disconnected');
    }
  };

  // Fetch telemetry logs
  const loadTelemetry = async () => {
    setIsLoadingTelemetry(true);
    try {
      const res = await fetch('/api/v1/inbound-requests');
      if (res.ok) {
        const json = await res.json();
        setInboundLogs(json.data || []);
      }
    } catch {
      // silent fallback
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  // Fetch API keys
  const loadApiKeys = async () => {
    try {
      const res = await fetch('/api/v1/api-keys');
      if (res.ok) {
        const json = await res.json();
        setApiKeys(json.data || []);
      }
    } catch {
      // fallback
    }
  };

  // Initial load and live telemetry polling
  useEffect(() => {
    loadExtensionStatus();
    loadTelemetry();
    loadApiKeys();

    const interval = setInterval(() => {
      loadExtensionStatus();
      loadTelemetry();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Send a real test capture through the ingestion pipeline
  const handleTestInboundCapture = async (provider: 'extension' | 'claude' | 'chatgpt' = 'extension') => {
    setIsTestingCapture(true);
    setCaptureNotice(null);
    try {
      const res = await fetch('/api/v1/debug/send-test-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });
      if (res.ok) {
        const json = await res.json();
        setCaptureNotice({
          success: true,
          message: json.message || 'Deliverable successfully captured!',
          artifactName: json.artifact?.display_name,
          location: json.artifact?.provider_path,
        });
        if (json.artifact && onArtifactCreated) {
          onArtifactCreated(json.artifact);
        }
        await loadExtensionStatus();
        await loadTelemetry();
      } else {
        setCaptureNotice({
          success: false,
          message: 'Inbound test call failed with status ' + res.status,
        });
      }
    } catch (err: any) {
      setCaptureNotice({
        success: false,
        message: err.message || 'Network error executing inbound test',
      });
    } finally {
      setIsTestingCapture(false);
    }
  };

  // Create scoped API key
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsGeneratingKey(true);
    try {
      const res = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          permissions: ['artifacts:read', 'artifacts:create', 'projects:read', 'search:read'],
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setNewlyCreatedSecret(json.secret_key);
        setNewKeyName('');
        await loadApiKeys();
      }
    } catch {
      //
    } finally {
      setIsGeneratingKey(false);
    }
  };

  // Delete API key
  const handleDeleteApiKey = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApiKeys((prev) => prev.filter((k) => k.id !== id));
      }
    } catch {
      //
    }
  };

  // Snippets
  const mcpConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        orfilo: {
          command: 'npx',
          args: ['-y', '@orfilo/mcp-server', '--url', originUrl],
        },
      },
    },
    null,
    2
  );

  const curlSnippet = `curl -X POST ${originUrl}/api/v1/artifacts \\
  -H "Authorization: Bearer orf_live_demo_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "display_name": "q4-strategic-deliverable.md",
    "content": "# Strategic Blueprint\\nGenerated by external agent pipeline.",
    "project_hint": "${projects[0]?.name || 'Orfilo'}"
  }'`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E7E7E4] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F7F0] text-[#19A974] font-semibold">
              Deliverable Ingestion & Pipeline
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#111111]">Integrations & Ingestion</h1>
          <p className="text-xs text-[#6B6B6B] mt-1 max-w-2xl">
            Automatically capture AI deliverables from ChatGPT, Claude, Gemini, Midjourney, and v0 into clean projects with sovereign Google Drive storage.
          </p>
        </div>

        {/* Header Status & Primary Action */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E7E7E4] bg-white text-xs font-mono shadow-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                extensionStatus === 'connected' ? 'bg-[#19A974] animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="text-neutral-700 font-medium">
              {extensionStatus === 'connected' ? 'Companion Active' : 'Companion Ready'}
            </span>
          </div>

          <button
            onClick={() => {
              if (onOpenExtensionModal) {
                onOpenExtensionModal();
              } else {
                window.location.search = '?action=pair-extension';
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Puzzle className="w-4 h-4" />
            <span>Pair Extension</span>
          </button>
        </div>
      </div>

      {/* Real-time Inbound Test Notification Toast */}
      {captureNotice && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between transition-all ${
            captureNotice.success
              ? 'bg-[#E8F7F0] border-[#19A974]/30 text-[#0e6243]'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {captureNotice.success ? (
              <CheckCircle2 className="w-4 h-4 text-[#19A974] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <div>
              <span className="font-semibold">{captureNotice.message}</span>
              {captureNotice.artifactName && (
                <span className="ml-2 font-mono text-[11px] opacity-90">
                  [{captureNotice.artifactName}] → {captureNotice.location}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setCaptureNotice(null)}
            className="text-[11px] font-medium underline opacity-80 hover:opacity-100 cursor-pointer ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: HERO FEATURE CARD - BROWSER COMPANION */}
      <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 lg:p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#19A974] to-emerald-400 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Puzzle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-lg font-bold text-[#111111]">Orfilo Smart Capture Companion</h2>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 border border-neutral-200">
                  Manifest V3
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#E8F7F0] text-[#19A974]">
                  Zero-Config Ingestion
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-1.5 max-w-2xl leading-relaxed">
                Floating 1-click capture companion injected directly into your daily AI chat interfaces. Captures files, applies kebab-case naming, categorizes deliverables, and syncs directly into your Google Drive.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
                extensionStatus === 'connected'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-neutral-50 border-neutral-200 text-neutral-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  extensionStatus === 'connected' ? 'bg-[#19A974]' : 'bg-neutral-400'
                }`}
              />
              <span className="font-medium">
                {extensionStatus === 'connected' ? 'Connected & Listening' : 'Awaiting Connection'}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Left Column: Supported Platforms & Value Props */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-3">
                Supported AI Workspaces
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {[
                  { name: 'ChatGPT', tag: 'GPT-4o & Canvas', color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900' },
                  { name: 'Claude', tag: 'Artifacts & Code', color: 'border-indigo-200 bg-indigo-50/50 text-indigo-900' },
                  { name: 'Gemini', tag: 'Docs & Research', color: 'border-blue-200 bg-blue-50/50 text-blue-900' },
                  { name: 'Midjourney', tag: 'Asset Downloads', color: 'border-purple-200 bg-purple-50/50 text-purple-900' },
                  { name: 'v0.dev', tag: 'React UI Blocks', color: 'border-neutral-200 bg-neutral-50 text-neutral-900' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className={`p-2.5 rounded-xl border ${item.color} flex flex-col justify-between transition-all`}
                  >
                    <span className="text-xs font-bold">{item.name}</span>
                    <span className="text-[10px] font-mono opacity-70 mt-1">{item.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Capabilities */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                Key Automated Capabilities
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 text-neutral-700">
                  <div className="w-4 h-4 rounded-full bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-neutral-900">In-Chat Floating Button:</strong> Automatically attaches a clean capture button to assistant outputs without leaving your conversation.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-neutral-700">
                  <div className="w-4 h-4 rounded-full bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-neutral-900">Automatic Kebab-Case Naming:</strong> Sanitizes messy file names into clean, project-ready deliverables (e.g., <code className="font-mono text-[11px] bg-neutral-100 px-1 py-0.5 rounded">acme-q4-strategy.pdf</code>).
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-neutral-700">
                  <div className="w-4 h-4 rounded-full bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <div>
                    <strong className="text-neutral-900">Zero Server File Retention:</strong> File bytes stream directly into your personal Google Drive; Orfilo hosts 0% of your proprietary files.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Connection Box & Quick Diagnostics */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-[#FAFAF8] border border-[#E7E7E4] rounded-xl p-5 space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E7E4]">
                <span className="text-xs font-semibold text-[#111111]">Live Companion Status</span>
                <span className="text-[10px] font-mono text-[#6B6B6B]">
                  {extensionDetails?.version ? `v${extensionDetails.version}` : 'v1.1.0'}
                </span>
              </div>

              <div className="space-y-2.5 py-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6B6B]">Protocol</span>
                  <span className="font-mono text-[11px] font-medium text-neutral-800">Manifest V3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6B6B]">Storage Provider</span>
                  <span className="font-medium text-neutral-800">
                    {extensionDetails?.storage_provider || 'Google Drive'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6B6B]">Handshake Mode</span>
                  <span className="font-mono text-[11px] text-[#19A974] font-medium">1-Click Local Token</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6B6B]">Inbound Telemetry</span>
                  <span className="font-mono text-[11px] text-neutral-800 font-medium">
                    {inboundLogs.length} events logged
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t border-[#E7E7E4]">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onOpenExtensionModal) {
                      onOpenExtensionModal();
                    } else {
                      window.location.search = '?action=pair-extension';
                    }
                  }}
                  className="flex-1 py-2 px-3 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Puzzle className="w-3.5 h-3.5" />
                  <span>Pair Extension</span>
                </button>

                <button
                  onClick={() => handleTestInboundCapture('extension')}
                  disabled={isTestingCapture}
                  className="py-2 px-3 bg-white hover:bg-neutral-50 border border-[#E7E7E4] text-[#111111] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  title="Executes an authentic inbound capture verification call"
                >
                  {isTestingCapture ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#19A974]" />
                  ) : (
                    <Zap className="w-3.5 h-3.5 text-[#19A974]" />
                  )}
                  <span>Test Inbound</span>
                </button>
              </div>

              {/* Collapsible Manual Install Guide */}
              <button
                onClick={() => setIsGuideOpen(!isGuideOpen)}
                className="w-full flex items-center justify-between text-[11px] text-[#6B6B6B] hover:text-[#111111] pt-1 px-1 transition-colors cursor-pointer"
              >
                <span>How to load unpacked in Chrome / Brave</span>
                {isGuideOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {isGuideOpen && (
                <div className="p-3 bg-white rounded-xl border border-[#E7E7E4] text-[11px] text-neutral-700 space-y-1.5 animate-fade-in font-mono">
                  <p>1. Open <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900">chrome://extensions</code></p>
                  <p>2. Enable <strong>Developer mode</strong> (top right)</p>
                  <p>3. Click <strong>Load unpacked</strong> and select the <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-900">extension</code> folder</p>
                  <p>4. Open the extension popup to 1-click pair!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: SOVEREIGN CLOUD STORAGE (BYOS) */}
      <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0 border border-[#19A974]/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#111111]">Sovereign Cloud Storage (BYOS)</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
                0% Server Retention
              </span>
            </div>
            <p className="text-xs text-[#6B6B6B] mt-1 max-w-2xl leading-relaxed">
              Every deliverable captured from ChatGPT, Claude, or developer agents is written straight to your personal Google Drive via direct OAuth 2.0. You maintain 100% sovereign file ownership.
            </p>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-600 font-mono">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#19A974]" /> Direct User Drive Token
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#19A974]" /> AES-256 Google Encryption
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            if (onOpenStorage) {
              onOpenStorage();
            }
          }}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 border border-[#E7E7E4] text-[#111111] rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
        >
          <span>Manage Storage Settings</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#6B6B6B]" />
        </button>
      </div>

      {/* SECTION 3: DEVELOPER & AGENT TOOLING (TABS) */}
      <div className="bg-white border border-[#E7E7E4] rounded-2xl shadow-xs overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center border-b border-[#E7E7E4] px-6 bg-[#FAFAF8]">
          {[
            { id: 'mcp', label: 'Model Context Protocol (MCP)', icon: Terminal },
            { id: 'api', label: 'REST API & Scoped Keys', icon: Key },
            {
              id: 'telemetry',
              label: `Live Telemetry (${inboundLogs.length})`,
              icon: Activity,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#19A974] text-[#19A974] bg-white -mb-px'
                    : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: MODEL CONTEXT PROTOCOL (MCP) */}
          {activeTab === 'mcp' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Cursor & Claude Desktop MCP Configuration</h3>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Connect autonomous agents like Cursor Composer or Claude Desktop to inspect projects and ingest artifacts.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(mcpConfigSnippet, 'mcp_snippet')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E7E4] bg-neutral-50 hover:bg-neutral-100 text-xs font-medium text-neutral-800 transition-colors cursor-pointer self-start"
                >
                  {copiedId === 'mcp_snippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#19A974]" />
                      <span className="text-[#19A974]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-[#6B6B6B]" />
                      <span>Copy MCP JSON</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Snippet */}
              <div className="bg-[#111111] rounded-xl p-4 font-mono text-xs text-neutral-200 overflow-x-auto shadow-inner">
                <pre>{mcpConfigSnippet}</pre>
              </div>

              {/* Available MCP Tools */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B] mb-3">
                  Exposed Agent Tools
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-[#E7E7E4] bg-[#FAFAF8] space-y-1">
                    <span className="font-mono text-xs font-bold text-[#111111]">orfilo_save_artifact</span>
                    <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      Saves deliverables, code files, and documents directly into the user's Google Drive.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#E7E7E4] bg-[#FAFAF8] space-y-1">
                    <span className="font-mono text-xs font-bold text-[#111111]">orfilo_search_deliverables</span>
                    <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      Queries existing workspace files by keyword, topic, or semantic embedding.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-[#E7E7E4] bg-[#FAFAF8] space-y-1">
                    <span className="font-mono text-xs font-bold text-[#111111]">orfilo_list_projects</span>
                    <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                      Lists active workspace projects, deliverable counts, and folder trees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REST API & SCOPED KEYS */}
          {activeTab === 'api' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Programmable Ingestion API</h3>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Generate scoped API keys to save deliverables from CLI scripts, CI pipelines, or internal tools.
                  </p>
                </div>
              </div>

              {/* Newly created secret key alert */}
              {newlyCreatedSecret && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">
                      ✓ API Key Generated Successfully
                    </span>
                    <button
                      onClick={() => setNewlyCreatedSecret(null)}
                      className="text-[11px] text-emerald-800 hover:underline cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Make sure to copy your key now. For your security, it will not be shown again!
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 font-mono text-xs text-emerald-950 font-bold select-all">
                      {newlyCreatedSecret}
                    </code>
                    <button
                      onClick={() => handleCopy(newlyCreatedSecret, 'new_secret')}
                      className="px-3 py-1.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      {copiedId === 'new_secret' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              )}

              {/* Create Key Form */}
              <form onSubmit={handleCreateApiKey} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key description (e.g., Python Research Pipeline)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#FAFAF8] border border-[#E7E7E4] rounded-xl text-xs text-[#111111] placeholder-[#6B6B6B] focus:outline-hidden focus:border-[#19A974]"
                />
                <button
                  type="submit"
                  disabled={isGeneratingKey || !newKeyName.trim()}
                  className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Generate Key</span>
                </button>
              </form>

              {/* API Keys Table */}
              <div className="border border-[#E7E7E4] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] border-b border-[#E7E7E4] text-[#6B6B6B] font-mono text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Name</th>
                      <th className="px-4 py-2.5 font-medium">Key Prefix</th>
                      <th className="px-4 py-2.5 font-medium">Permissions</th>
                      <th className="px-4 py-2.5 font-medium">Created</th>
                      <th className="px-4 py-2.5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E4]">
                    {apiKeys.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-[#6B6B6B]">
                          No API keys generated yet.
                        </td>
                      </tr>
                    ) : (
                      apiKeys.map((k) => (
                        <tr key={k.id} className="hover:bg-neutral-50/50">
                          <td className="px-4 py-3 font-medium text-[#111111]">{k.name}</td>
                          <td className="px-4 py-3 font-mono text-neutral-600">{k.key_preview}</td>
                          <td className="px-4 py-3">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                              {k.permissions.join(', ')}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[#6B6B6B] font-mono text-[11px]">
                            {new Date(k.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteApiKey(k.id)}
                              className="p-1 hover:bg-red-50 text-neutral-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                              title="Revoke key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* cURL Example */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#6B6B6B]">
                    cURL Ingestion Snippet
                  </h4>
                  <button
                    onClick={() => handleCopy(curlSnippet, 'curl_snippet')}
                    className="flex items-center gap-1 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 cursor-pointer"
                  >
                    {copiedId === 'curl_snippet' ? (
                      <span className="text-[#19A974]">Copied!</span>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy cURL</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-[#111111] rounded-xl p-4 font-mono text-xs text-neutral-200 overflow-x-auto shadow-inner">
                  <pre>{curlSnippet}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE TELEMETRY LOGS */}
          {activeTab === 'telemetry' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Real-Time Inbound Telemetry</h3>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Live stream of deliverable captures and agent requests hitting your workspace.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={loadTelemetry}
                    disabled={isLoadingTelemetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E7E7E4] bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTelemetry ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={() => handleTestInboundCapture('chatgpt')}
                    disabled={isTestingCapture}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Send Test Event</span>
                  </button>
                </div>
              </div>

              {/* Logs Table */}
              <div className="border border-[#E7E7E4] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFAF8] border-b border-[#E7E7E4] text-[#6B6B6B] font-mono text-[11px]">
                    <tr>
                      <th className="px-4 py-2.5 font-medium">Time</th>
                      <th className="px-4 py-2.5 font-medium">Method & Endpoint</th>
                      <th className="px-4 py-2.5 font-medium">Source AI</th>
                      <th className="px-4 py-2.5 font-medium">Status</th>
                      <th className="px-4 py-2.5 font-medium">Security</th>
                      <th className="px-4 py-2.5 font-medium">Payload Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E7E4]">
                    {inboundLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-[#6B6B6B]">
                          No inbound telemetry requests recorded yet.
                        </td>
                      </tr>
                    ) : (
                      inboundLogs.slice(0, 15).map((log) => (
                        <tr key={log.id} className="hover:bg-neutral-50/50">
                          <td className="px-4 py-3 font-mono text-[#6B6B6B] text-[11px]">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-4 py-3 font-mono">
                            <span className="font-bold text-[#111111]">{log.method}</span>{' '}
                            <span className="text-neutral-500">{log.endpoint}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-neutral-800">{log.source_ai}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`font-mono text-[10px] px-2 py-0.5 rounded font-semibold ${
                                log.status_code < 400
                                  ? 'bg-[#E8F7F0] text-[#19A974]'
                                  : 'bg-red-50 text-red-600'
                              }`}
                            >
                              {log.status_code}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {log.token_verified ? (
                              <span className="flex items-center gap-1 text-[11px] text-[#19A974]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-neutral-400">Anonymous</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-neutral-700 max-w-xs truncate" title={log.summary}>
                            {log.summary}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
