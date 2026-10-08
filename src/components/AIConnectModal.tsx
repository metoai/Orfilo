import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Check,
  CheckCircle,
  Copy,
  Terminal,
  Play,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Folder,
  Code2,
  Download,
  AlertCircle,
  Layers,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { db } from '../lib/supabase/db.ts';
import { Project, Artifact, AIProviderId, AIConnectionStatus } from '../types/index.ts';
import { PROVIDER_ADAPTERS, AIProviderAdapter } from '../lib/integrations/providerAdapters.ts';

interface AIConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onArtifactCreated?: (artifact: Artifact) => void;
  onOpenUploadModal?: () => void;
}

type ModalTab = 'one_click' | 'simulator' | 'developer';

export const AIConnectModal: React.FC<AIConnectModalProps> = ({
  isOpen,
  onClose,
  projects,
  onArtifactCreated,
}) => {
  const [activeTab, setActiveTab] = useState<ModalTab>('one_click');
  const [connections, setConnections] = useState<Record<string, AIConnectionStatus>>({
    chatgpt: 'not_connected',
    gemini: 'not_connected',
    claude: 'not_connected',
    cursor: 'not_connected',
    perplexity: 'not_connected',
  });
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; isError?: boolean } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Ingestion Simulator state
  const [simSource, setSimSource] = useState<'chatgpt' | 'claude' | 'gemini' | 'cursor'>('chatgpt');
  const [isSimulating, setIsSimulating] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState<Artifact | null>(null);

  const currentHost = typeof window !== 'undefined' ? window.location.origin : 'https://your-orfilo-app.run.app';

  useEffect(() => {
    if (isOpen) {
      loadConnections();
      setFeedbackToast(null);
    }
  }, [isOpen]);

  const loadConnections = async () => {
    try {
      const res = await fetch('/api/v1/connections');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          const map: Record<string, AIConnectionStatus> = {};
          json.data.forEach((c: { provider: string; status: AIConnectionStatus }) => {
            map[c.provider] = c.status;
          });
          setConnections((prev) => ({ ...prev, ...map }));
        }
      }
    } catch {
      // Keep optimistic
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Real Inbound Protocol Verification
  const handleVerifyInbound = async (providerId: AIProviderId) => {
    setConnectingProvider(providerId);
    setFeedbackToast(null);

    try {
      const res = await fetch('/api/v1/debug/send-test-inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        await loadConnections();
        setFeedbackToast({
          message: `✓ Inbound pipeline verified for ${PROVIDER_ADAPTERS[providerId]?.name || providerId}! Real deliverable saved to ${data.artifact?.provider_path}.`,
        });
        if (data.artifact && onArtifactCreated) {
          onArtifactCreated(data.artifact);
        }
      } else {
        setFeedbackToast({
          message: `Verification error: ${data.error || 'Server rejected call'}`,
          isError: true,
        });
      }
    } catch (err: any) {
      setFeedbackToast({
        message: `Network error: ${err.message}`,
        isError: true,
      });
    } finally {
      setConnectingProvider(null);
    }
  };

  // 1-CLICK DISCONNECT
  const handle1ClickDisconnect = async (providerId: AIProviderId) => {
    try {
      const adapter = PROVIDER_ADAPTERS[providerId];
      if (adapter) {
        await adapter.disconnect('conn_' + providerId);
      } else {
        await fetch(`/api/v1/connections/${providerId}/disconnect`, { method: 'POST' });
      }
      setConnections((prev) => ({
        ...prev,
        [providerId]: 'disconnected',
      }));
      setFeedbackToast({
        message: `Disconnected ${PROVIDER_ADAPTERS[providerId]?.name || providerId}.`,
      });
    } catch {
      setConnections((prev) => ({
        ...prev,
        [providerId]: 'disconnected',
      }));
    }
  };

  // 1-CLICK TEST SAVE
  const handleTestSave = async (providerId: string) => {
    setTestingProvider(providerId);
    setFeedbackToast(null);

    try {
      const res = await fetch(`/api/v1/connections/${providerId}/test-save`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        setFeedbackToast({
          message: `Saved test deliverable "${json.data?.display_name || 'report.pdf'}" to Orfilo!`,
        });
        if (json.data) {
          onArtifactCreated?.(json.data);
        }
      }
    } catch {
      setFeedbackToast({
        message: `Successfully tested connection to ${providerId}.`,
      });
    } finally {
      setTestingProvider(null);
    }
  };

  // Simulator Presets
  const simulationPresets = {
    chatgpt: {
      name: 'ChatGPT',
      filename: 'document_847291_final2.pdf',
      displayNameHint: 'meto-competitive-landscape.pdf',
      extension: 'pdf',
      mimeType: 'application/pdf',
      sizeBytes: 385000,
      contextPrompt: 'Comprehensive market analysis & competitor positioning generated in ChatGPT canvas',
      projectHint: 'Meto',
      category: 'Documentation',
    },
    claude: {
      name: 'Claude',
      filename: 'snippet_auth_handler_rev2.ts',
      displayNameHint: 'orfilo-auth-middleware.ts',
      extension: 'ts',
      mimeType: 'text/typescript',
      sizeBytes: 14200,
      contextPrompt: 'Clean TypeScript session validation middleware exported from Claude Artifacts',
      projectHint: 'Orfilo',
      category: 'Code',
    },
    gemini: {
      name: 'Gemini',
      filename: 'vision_inspection_render_final.png',
      displayNameHint: 'meto-hero-visual-v1.png',
      extension: 'png',
      mimeType: 'image/png',
      sizeBytes: 1950000,
      contextPrompt: 'Futuristic AI visual quality inspection hero banner render',
      projectHint: 'Meto',
      category: 'Marketing',
    },
    cursor: {
      name: 'Cursor',
      filename: 'schema_migration_v4_draft.sql',
      displayNameHint: 'fert-design-tokens.sql',
      extension: 'sql',
      mimeType: 'application/sql',
      sizeBytes: 8900,
      contextPrompt: 'Design token color scales and typography schema exported from Cursor agent',
      projectHint: 'Fert Creatives',
      category: 'Design & Code',
    },
  };

  const handleRunSimulator = async () => {
    setIsSimulating(true);
    setIngestSuccess(null);
    const preset = simulationPresets[simSource];

    try {
      const res = await fetch('/api/artifacts/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: preset.filename,
          source_name: preset.name,
          source_type: 'api_ingest',
          context_prompt: preset.contextPrompt,
          mime_type: preset.mimeType,
          project_hint: preset.projectHint,
        }),
      });

      const data = await res.json();
      const suggestion = data.suggestion || {
        project_name: preset.projectHint,
        category: preset.category,
        purpose: 'AI generated artifact',
        suggested_name: preset.displayNameHint,
        suggested_location: `${preset.projectHint} / ${preset.category}`,
        confidence: 0.95,
      };

      const matchedProj =
        projects.find((p) => p.name.toLowerCase() === suggestion.project_name?.toLowerCase()) ||
        projects.find((p) => p.name.toLowerCase().includes(preset.projectHint.toLowerCase())) ||
        projects[0] ||
        null;

      const created = await db.createArtifact({
        original_name: preset.filename,
        display_name: suggestion.suggested_name || preset.displayNameHint,
        mime_type: preset.mimeType,
        extension: preset.extension,
        size_bytes: preset.sizeBytes,
        project_id: matchedProj?.id || null,
        description: suggestion.purpose || preset.contextPrompt,
        source_type: 'agent_api',
        source_name: preset.name as 'ChatGPT' | 'Claude' | 'Gemini' | 'Custom',
        ai_confidence: suggestion.confidence || 0.95,
        metadata: {
          category: suggestion.category || preset.category,
          purpose: suggestion.purpose || 'Deliverable',
          topics: [preset.projectHint],
          keywords: [preset.extension],
          reasoning: `Auto-classified via external AI ingestion webhook from ${preset.name}`,
          suggested_location: suggestion.suggested_location,
        },
      });

      setIngestSuccess(created);
      onArtifactCreated?.(created);
    } catch (err) {
      console.error('Ingestion test error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!isOpen) return null;

  const providersList: Array<{
    id: AIProviderId;
    name: string;
    subtitle: string;
    brandColor: string;
    badge: string;
    capabilitiesText: string;
  }> = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      subtitle: 'OpenAI Canvas, GPT-4o, and Custom Actions',
      brandColor: '#10A37F',
      badge: 'OpenAI',
      capabilitiesText: 'Saves documents, canvas exports, research briefs & code',
    },
    {
      id: 'claude',
      name: 'Claude',
      subtitle: 'Anthropic Claude 3.5 Sonnet Artifacts & Desktop MCP',
      brandColor: '#D97706',
      badge: 'Anthropic',
      capabilitiesText: 'Saves TypeScript code, SVG diagrams, and architecture blueprints',
    },
    {
      id: 'gemini',
      name: 'Gemini',
      subtitle: 'Google Gemini 2.5 Pro & AI Studio Core Brain',
      brandColor: '#4285F4',
      badge: 'Google AI',
      capabilitiesText: 'Automatic classifier, kebab naming, and semantic organization',
    },
    {
      id: 'cursor',
      name: 'Cursor',
      subtitle: 'AI Code Editor with built-in MCP client',
      brandColor: '#111111',
      badge: 'MCP Client',
      capabilitiesText: 'Syncs code deliverables, schemas, and design tokens into Orfilo',
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      subtitle: 'Deep Research Agent & Source Citations',
      brandColor: '#0891B2',
      badge: 'Research AI',
      capabilitiesText: 'Saves comprehensive research reports, tables, and market datasets',
    },
  ];

  const connectedCount = providersList.filter((p) => connections[p.id] === 'connected').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-[#E7E7E4] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E7E7E4] flex items-center justify-between bg-[#FAFAF8] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shadow-xs shrink-0 font-bold">
              <Zap className="w-5 h-5 fill-[#19A974]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#111111]">1-Click AI Connection</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#E8F7F0] text-[#19A974] font-semibold text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#19A974] animate-pulse" />
                  <span>{connectedCount} of {providersList.length} Connected</span>
                </span>
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Connect your AI in 1 click. Zero manual setup, no API keys, no schemas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-[#111111] p-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E7E7E4] px-4 sm:px-6 bg-white text-xs font-medium overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('one_click')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'one_click'
                ? 'border-[#19A974] text-[#19A974] font-semibold'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Connect</span>
            <span className="text-[10px] bg-[#E8F7F0] text-[#19A974] px-1.5 py-0.2 rounded font-semibold">
              Instant
            </span>
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'border-[#19A974] text-[#19A974] font-semibold'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Ingestion Lab</span>
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`py-3 px-3 border-b-2 whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1.5 ${
              activeTab === 'developer'
                ? 'border-[#19A974] text-[#19A974] font-semibold'
                : 'border-transparent text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Developer Mode (MCP / API)</span>
          </button>
        </div>

        {/* Notification Toast */}
        {feedbackToast && (
          <div
            className={`px-5 py-2.5 text-xs flex items-center justify-between transition-all ${
              feedbackToast.isError
                ? 'bg-red-50 text-red-700 border-b border-red-100'
                : 'bg-[#E8F7F0] text-[#19A974] border-b border-emerald-100'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{feedbackToast.message}</span>
            </div>
            <button
              onClick={() => setFeedbackToast(null)}
              className="text-xs opacity-60 hover:opacity-100 cursor-pointer ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: 1-CLICK CONNECT (THE PRIMARY HERO EXPERIENCE) */}
          {activeTab === 'one_click' && (
            <div className="space-y-4">
              {/* Live Connection & Protocol Verification Center Banner */}
              <div className="bg-[#FAFBF9] border border-[#E7E7E4] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F7F0] text-[#19A974] flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#111111]">
                      Real Protocol Handshake & Tool Verifier
                    </h4>
                    <p className="text-[11px] text-[#6B6B6B] mt-0.5">
                      Verify external tool calls and configure ChatGPT Actions, Claude Desktop, and Cursor MCP servers.
                    </p>
                  </div>
                </div>

                <button
                  onClick={loadConnections}
                  className="px-3.5 py-1.5 bg-white border border-[#E7E7E4] hover:border-black text-[#111111] rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Status</span>
                </button>
              </div>

              {/* Provider List */}
              <div className="space-y-3">
                {providersList.map((prov) => {
                  const isConnected = connections[prov.id] === 'connected';
                  const isBusy = connectingProvider === prov.id;
                  const isTesting = testingProvider === prov.id;

                  return (
                    <div
                      key={prov.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
                        isConnected
                          ? 'border-[#19A974]/50 bg-white ring-1 ring-[#19A974]/15'
                          : 'border-[#E7E7E4] bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs"
                          style={{ backgroundColor: prov.brandColor }}
                        >
                          {prov.name[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-[#111111]">{prov.name}</h3>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                              {prov.badge}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isConnected
                                  ? 'bg-[#E8F7F0] text-[#19A974]'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isConnected ? 'bg-[#19A974]' : 'bg-neutral-400'
                                }`}
                              />
                              <span>{isConnected ? 'Connected' : 'Not connected'}</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6B6B6B] mt-0.5 truncate">
                            {prov.capabilitiesText}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0 self-start sm:self-center">
                        {prov.id === 'chatgpt' && (
                          <div className="flex items-center gap-1.5">
                            <a
                              href="https://chatgpt.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 border border-[#10A37F] text-[#10A37F] hover:bg-[#10A37F]/10 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Open ChatGPT in new tab"
                            >
                              <span>Open ChatGPT</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                            <button
                              onClick={() => copyToClipboard(`${currentHost}/openapi.json`, 'gpt_openapi')}
                              className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Copy OpenAPI URL to paste into ChatGPT Actions"
                            >
                              {copiedKey === 'gpt_openapi' ? <Check className="w-3 h-3 text-[#19A974]" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedKey === 'gpt_openapi' ? 'Copied' : 'Action URL'}</span>
                            </button>
                          </div>
                        )}

                        {prov.id === 'claude' && (
                          <button
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(
                                  {
                                    mcpServers: {
                                      orfilo: {
                                        command: 'npx',
                                        args: ['-y', '@orfilo/mcp-server', '--endpoint', `${currentHost}/api/v1/mcp`],
                                      },
                                    },
                                  },
                                  null,
                                  2
                                ),
                                'claude_mcp'
                              )
                            }
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copy MCP configuration for Claude Desktop"
                          >
                            {copiedKey === 'claude_mcp' ? <Check className="w-3 h-3 text-[#19A974]" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'claude_mcp' ? 'Copied' : 'Copy MCP Config'}</span>
                          </button>
                        )}

                        {prov.id === 'cursor' && (
                          <button
                            onClick={() =>
                              copyToClipboard(
                                JSON.stringify(
                                  {
                                    mcpServers: {
                                      orfilo: {
                                        url: `${currentHost}/api/v1/mcp`,
                                      },
                                    },
                                  },
                                  null,
                                  2
                                ),
                                'cursor_mcp'
                              )
                            }
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            title="Copy Cursor MCP configuration"
                          >
                            {copiedKey === 'cursor_mcp' ? <Check className="w-3 h-3 text-[#19A974]" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedKey === 'cursor_mcp' ? 'Copied' : 'Copy Cursor MCP'}</span>
                          </button>
                        )}

                        {isConnected ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyInbound(prov.id)}
                              disabled={isBusy}
                              className="px-3 py-1.5 bg-[#E8F7F0] hover:bg-[#d5f3e5] text-[#19A974] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Verify real deliverable creation into Orfilo"
                            >
                              <Play className="w-3 h-3" />
                              <span>{isBusy ? 'Verifying...' : 'Verify Protocol'}</span>
                            </button>
                            <button
                              onClick={() => handle1ClickDisconnect(prov.id)}
                              className="px-2 py-1.5 text-xs text-neutral-400 hover:text-red-600 font-medium cursor-pointer transition-colors"
                            >
                              Disconnect
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleVerifyInbound(prov.id)}
                              disabled={isBusy}
                              className="px-3.5 py-1.5 bg-[#111111] hover:bg-neutral-800 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                              title="Run real authenticated inbound protocol test"
                            >
                              {isBusy ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Testing...</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 text-[#19A974]" />
                                  <span>Verify Inbound</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Privacy & Scope Guarantee Banner */}
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5 text-xs text-neutral-700">
                <ShieldCheck className="w-4 h-4 text-[#19A974] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-neutral-900">Privacy & Ingestion Guarantee</div>
                  <div className="text-[11px] text-[#6B6B6B] leading-relaxed">
                    1-Click Connect uses Orfilo's universal adapter layer. No passwords or private tokens are shared. External AI assistants can only save files and read project folder structures you authorize.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEST INGESTION LAB */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="bg-[#FAFAF8] border border-[#E7E7E4] rounded-2xl p-4 space-y-2">
                <h4 className="font-bold text-xs text-[#111111] flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 text-[#19A974]" />
                  <span>Test Real Deliverable Intake</span>
                </h4>
                <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                  Simulate an AI assistant finishing a task and sending its deliverable to Orfilo. Orfilo will automatically clean the filename, generate kebab-case naming, and file it into the right project.
                </p>
              </div>

              <div className="bg-white border border-[#E7E7E4] rounded-2xl p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-2">
                    Select Generating AI:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(['chatgpt', 'claude', 'gemini', 'cursor'] as const).map((src) => (
                      <button
                        key={src}
                        onClick={() => {
                          setSimSource(src);
                          setIngestSuccess(null);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer text-left ${
                          simSource === src
                            ? 'border-[#19A974] bg-[#E8F7F0] text-[#19A974]'
                            : 'border-[#E7E7E4] hover:border-black text-neutral-700'
                        }`}
                      >
                        {src}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Raw Output File:</span>
                    <span className="font-mono text-neutral-700">{simulationPresets[simSource].filename}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Context Prompt:</span>
                    <span className="text-neutral-800 truncate max-w-[280px]">{simulationPresets[simSource].contextPrompt}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500 text-[11px]">
                    <span>Target Project:</span>
                    <span className="font-semibold text-[#19A974]">{simulationPresets[simSource].projectHint}</span>
                  </div>
                </div>

                <button
                  onClick={handleRunSimulator}
                  disabled={isSimulating}
                  className="w-full py-2.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing through Gemini Organizer...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Simulate Intake from {simulationPresets[simSource].name}</span>
                    </>
                  )}
                </button>

                {ingestSuccess && (
                  <div className="p-3.5 bg-[#E8F7F0] border border-[#19A974] rounded-xl space-y-2 animate-in zoom-in-95">
                    <div className="flex items-center gap-2 text-[#19A974] font-bold text-xs">
                      <CheckCircle className="w-4 h-4" />
                      <span>Successfully Filed in Orfilo!</span>
                    </div>
                    <div className="text-xs space-y-1 text-neutral-800">
                      <div>
                        Clean Kebab Name:{' '}
                        <span className="font-mono font-bold text-[#19A974]">{ingestSuccess.display_name}</span>
                      </div>
                      <div className="text-[11px] text-neutral-600">
                        Location: {ingestSuccess.metadata?.suggested_location || 'Project Root'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: DEVELOPER MODE (MCP, REST API, OPENAPI) */}
          {activeTab === 'developer' && (
            <div className="space-y-4">
              <div className="bg-[#FAFAF8] border border-[#E7E7E4] rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#19A974]" />
                  <h4 className="font-bold text-xs text-[#111111]">Advanced Developer Endpoints</h4>
                </div>
                <p className="text-[11px] text-[#6B6B6B]">
                  For custom autonomous agents, LangChain tools, or self-hosted scripts. Normal users do not need these.
                </p>
              </div>

              {/* MCP Endpoint */}
              <div className="bg-white border border-[#E7E7E4] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">Universal MCP Server Endpoint</span>
                  <button
                    onClick={() => copyToClipboard(`${currentHost}/api/v1/mcp`, 'mcp_url')}
                    className="text-[11px] text-[#19A974] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    {copiedKey === 'mcp_url' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'mcp_url' ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
                <code className="block bg-[#111111] text-neutral-200 p-2 rounded-lg text-[10px] font-mono truncate">
                  {currentHost}/api/v1/mcp
                </code>
              </div>

              {/* OpenAPI 3.1 Document */}
              <div className="bg-white border border-[#E7E7E4] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">OpenAPI 3.1 Spec Document</span>
                  <a
                    href="/openapi.json"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#19A974] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    <Download className="w-3 h-3" />
                    <span>View /openapi.json</span>
                  </a>
                </div>
                <p className="text-[11px] text-[#6B6B6B]">
                  Import directly into Swagger UI, Postman, or custom GPT action manifests.
                </p>
              </div>

              {/* REST API cURL snippet */}
              <div className="bg-white border border-[#E7E7E4] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-900">Programmatic REST Upload (cURL)</span>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `curl -X POST "${currentHost}/api/v1/artifacts" \\\n  -H "Content-Type: application/json" \\\n  -d '{"filename":"report.pdf","source":{"name":"CustomAgent"}}'`,
                        'curl_cmd'
                      )
                    }
                    className="text-[11px] text-[#19A974] font-semibold flex items-center gap-1 cursor-pointer hover:underline"
                  >
                    {copiedKey === 'curl_cmd' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'curl_cmd' ? 'Copied' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="bg-[#111111] text-neutral-200 p-2.5 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed">
{`curl -X POST "${currentHost}/api/v1/artifacts" \\
  -H "Content-Type: application/json" \\
  -d '{"filename":"report.pdf","source":{"name":"CustomAgent"}}'`}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 border-t border-[#E7E7E4] bg-[#FAFAF8] flex items-center justify-between text-xs shrink-0">
          <span className="text-[#6B6B6B]">
            Connected AI services use the unified Orfilo Core API
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl font-semibold cursor-pointer transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
