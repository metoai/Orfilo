import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  X,
  ShieldCheck,
  Puzzle,
  FolderArchive,
  ToggleRight,
  CheckCircle2,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { createBrowserClient } from '../lib/supabase/client.ts';

interface ExtensionPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects?: any[];
  onArtifactCreated?: (artifact: any) => void;
}

export const ExtensionPairModal: React.FC<ExtensionPairModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [token, setToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'install' | 'token'>('install');

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'ORFILO_PAIR_CONFIRMED') {
        setIsConnected(true);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setToken(null);
      setError(null);
      setCopiedToken(false);
      setCopiedUrl(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const client = createBrowserClient();
        if (!client) return;
        const { data: { session } } = await client.auth.getSession();
        if (session?.user?.email) {
          setUserEmail(session.user.email);
        }
        if (!session?.access_token) return;

        const res = await fetch('/api/v1/extension/status', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setIsConnected(true);
            if (data.user_email) setUserEmail(data.user_email);
          }
        }
      } catch (_) {}
    };

    checkStatus();
  }, [isOpen]);

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const client = createBrowserClient();
      if (!client) throw new Error('Supabase client not initialized');
      let session = (await client.auth.getSession()).data.session;
      if (!session?.access_token) throw new Error('You must be signed in to pair an extension');

      let tokenToUse = session.access_token;
      if (session.expires_at && session.expires_at < Math.floor(Date.now() / 1000)) {
        const { data: refreshed } = await client.auth.refreshSession();
        if (refreshed.session) {
          session = refreshed.session;
          tokenToUse = session.access_token;
        }
      }

      let res = await fetch('/api/v1/extension/pair', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401) {
        const { data: refreshed } = await client.auth.refreshSession();
        if (refreshed.session) {
          tokenToUse = refreshed.session.access_token;
          res = await fetch('/api/v1/extension/pair', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${tokenToUse}`,
              'Content-Type': 'application/json',
            },
          });
        }
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate pairing token');
      }

      setToken(data.token);
      setIsConnected(true);

      window.postMessage(
        {
          type: 'ORFILO_PAIR_EXTENSION',
          token: data.token,
          userEmail: session.user?.email,
        },
        '*'
      );
    } catch (err: any) {
      setError(err.message || 'Error generating token');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleCopyChromeUrl = () => {
    navigator.clipboard.writeText('chrome://extensions');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200/80 rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#19A974]">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-neutral-900">Chrome Companion Extension</h2>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                  v2.0.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-500">
                1-click capture from ChatGPT, Claude, and Gemini
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Better Auth Segmented Navigation Tabs */}
        <div className="px-6 py-2.5 bg-neutral-50/50 border-b border-neutral-100 flex shrink-0">
          <div className="p-1 bg-neutral-200/60 rounded-xl flex items-center gap-1 w-full max-w-xs text-xs">
            <button
              onClick={() => setActiveTab('install')}
              className={`flex-1 py-1.5 px-3 font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'install'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install Guide</span>
            </button>

            <button
              onClick={() => setActiveTab('token')}
              className={`flex-1 py-1.5 px-3 font-medium rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'token'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Pairing Token</span>
              {isConnected && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {isConnected && (
            <div className="bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">Extension Connected</span>
                {userEmail && <span className="text-emerald-700 font-mono text-[11px]">({userEmail})</span>}
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50/80 border border-red-200/80 text-red-800 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'install' ? (
            <div className="space-y-4">
              {/* Primary Download Card */}
              <div className="bg-neutral-900 text-white rounded-2xl p-5 border border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-[#19A974]" />
                    <span className="font-semibold text-sm">Download Extension Bundle</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Chrome, Brave, Edge, and Arc browser extension package.
                  </p>
                  <div className="flex items-center gap-2.5 text-[11px] text-neutral-400 pt-1 font-mono">
                    <span>Manifest V3</span>
                    <span>&bull;</span>
                    <span className="text-emerald-400">Production Ready</span>
                  </div>
                </div>

                <a
                  href="/api/v1/extension/download"
                  download="orfilo-extension.zip"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .zip</span>
                </a>
              </div>

              {/* 4 Steps Guide */}
              <div className="space-y-2.5 pt-1">
                <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#19A974]" />
                  <span>4-Step Quick Setup</span>
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-3 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 text-neutral-900 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">Extract ZIP</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Unzip <code className="px-1 py-0.5 rounded bg-neutral-100 font-mono text-neutral-700">orfilo-extension.zip</code> onto your computer.
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-3 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 text-neutral-900 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <h4 className="font-semibold text-neutral-900">Open Extensions Tab</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-2.5 py-1 bg-white border border-neutral-200 rounded-lg font-mono text-[11px] text-neutral-800 select-all">
                          chrome://extensions
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyChromeUrl}
                          className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-3 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 text-neutral-900 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-semibold text-neutral-900">Enable Developer Mode</h4>
                        <ToggleRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Toggle the Developer mode switch in the top-right corner to ON.
                      </p>
                    </div>
                  </div>

                  <div className="bg-neutral-50/80 border border-neutral-200/80 rounded-xl p-3 flex items-start gap-3">
                    <span className="w-5 h-5 rounded-md bg-white border border-neutral-200 text-neutral-900 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-neutral-900">Load Unpacked</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Click <strong>Load unpacked</strong> and select the extracted folder.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <p className="text-xs text-neutral-500 leading-relaxed">
                If you need to connect manually, generate a secure extension API token:
              </p>

              {!token ? (
                <div>
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGenerateToken}
                    className="w-full py-2.5 px-4 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Secure Token...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Generate Pairing Token</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider font-mono">
                    Extension Pairing Token
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={token}
                      className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-mono text-xs text-neutral-900 select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="px-3.5 py-2 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between shrink-0">
          <a
            href="/api/v1/extension/download"
            download="orfilo-extension.zip"
            className="text-xs font-medium text-[#19A974] hover:underline flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .zip</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
