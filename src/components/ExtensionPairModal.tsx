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
  ExternalLink,
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
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isAutoPaired, setIsAutoPaired] = useState(false);
  const [activeTab, setActiveTab] = useState<'install' | 'token'>('install');

  // Listen for extension auto-pairing confirmation
  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data?.type === 'ORFILO_PAIR_CONFIRMED') {
        setIsAutoPaired(true);
        setIsConnected(true);
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  // Check extension pairing status when opened
  useEffect(() => {
    if (!isOpen) {
      setToken(null);
      setError(null);
      setCopiedToken(false);
      setCopiedUrl(false);
      return;
    }

    const checkStatus = async () => {
      setIsCheckingStatus(true);
      try {
        const client = createBrowserClient();
        if (!client) return;
        const {
          data: { session },
        } = await client.auth.getSession();
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
      } catch (_) {
        // Status check error ignored
      } finally {
        setIsCheckingStatus(false);
      }
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

      // Broadcast to extension content script if running
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAFAF8] border border-[#E7E7E4] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E7E4] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shadow-xs">
              <Puzzle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-[#111111]">Orfilo Companion Extension</h2>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  v2.0.0
                </span>
              </div>
              <p className="text-[11px] text-[#6B6B6B]">
                Capture AI images and code blocks into organized folders with 1 click
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-[#111111] p-1.5 rounded-lg cursor-pointer transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 pb-0 bg-white border-b border-[#E7E7E4] flex gap-4 shrink-0 text-xs">
          <button
            onClick={() => setActiveTab('install')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'install'
                ? 'border-[#19A974] text-[#19A974]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download & Install Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('token')}
            className={`pb-2.5 font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'token'
                ? 'border-[#19A974] text-[#19A974]'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Pairing Token</span>
            {isConnected && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Status Banner */}
          {isConnected && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-xs flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-semibold">Extension Connected</span>
                  {userEmail && <span className="text-emerald-700 ml-1.5 font-mono text-[11px]">({userEmail})</span>}
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {activeTab === 'install' ? (
            <div className="space-y-5">
              {/* Primary Download Card */}
              <div className="bg-gradient-to-br from-[#111111] to-[#1E1E1E] text-white rounded-2xl p-5 shadow-sm border border-neutral-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-[#19A974]" />
                    <span className="font-semibold text-sm">Download Orfilo Extension</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Pre-packaged zip file for Google Chrome, Brave, Microsoft Edge, and Arc.
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-neutral-400 pt-1">
                    <span>Manifest V3</span>
                    <span>•</span>
                    <span>Size: ~34 KB</span>
                    <span>•</span>
                    <span className="text-emerald-400">Production Ready</span>
                  </div>
                </div>

                <a
                  href="/api/v1/extension/download"
                  download="orfilo-extension.zip"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg cursor-pointer shrink-0 text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .ZIP</span>
                </a>
              </div>

              {/* Step-by-Step Installation Guide */}
              <div className="space-y-3 pt-1">
                <h3 className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#19A974]" />
                  <span>4-Step Quick Install Guide</span>
                </h3>

                <div className="grid grid-cols-1 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="bg-white border border-[#E7E7E4] rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-[#E8F7F0] text-[#19A974] font-bold text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold text-[#111111]">Unzip the Downloaded File</h4>
                      <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                        Extract <code className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-neutral-700">orfilo-extension.zip</code> to a folder on your computer (e.g., in your Documents or Developer folder).
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="bg-white border border-[#E7E7E4] rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-[#E8F7F0] text-[#19A974] font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div className="space-y-2 flex-1">
                      <h4 className="font-semibold text-[#111111]">Open Extensions Page in Chrome</h4>
                      <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                        Open a new browser tab and navigate to the Extensions management page:
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-[11px] text-neutral-800 select-all">
                          chrome://extensions
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyChromeUrl}
                          className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-lg text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedUrl ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="bg-white border border-[#E7E7E4] rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-[#E8F7F0] text-[#19A974] font-bold text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-[#111111]">Enable "Developer Mode"</h4>
                        <ToggleRight className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                        In the top-right corner of the Extensions page, toggle the <strong>Developer mode</strong> switch to <strong>ON</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="bg-white border border-[#E7E7E4] rounded-xl p-3.5 flex items-start gap-3 shadow-xs">
                    <span className="w-6 h-6 rounded-lg bg-[#E8F7F0] text-[#19A974] font-bold text-xs flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div className="space-y-1 flex-1">
                      <h4 className="font-semibold text-[#111111]">Click "Load Unpacked" & Select Folder</h4>
                      <p className="text-[11px] text-[#6B6B6B] leading-relaxed">
                        Click the <strong>Load unpacked</strong> button in the top-left toolbar, then select the extracted <code className="px-1.5 py-0.5 rounded bg-neutral-100 font-mono text-neutral-700">orfilo-extension</code> folder.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Tip */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3.5 text-[11px] text-[#6B6B6B] space-y-1.5">
                <span className="font-semibold text-[#111111] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  How capture works:
                </span>
                <p className="leading-relaxed">
                  Go to <strong>ChatGPT</strong>, <strong>Claude</strong>, or <strong>Gemini</strong>. Hover over any generated image or code snippet and click the floating <strong>"Save to Orfilo"</strong> button, or right-click to save. Orfilo will automatically rename the file and file it into:
                </p>
                <div className="font-mono text-[10px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200/60">
                  ChatGPT / &lt;Project Name&gt; / &lt;Subfolder&gt; / &lt;renamed-file&gt;.png
                </div>
              </div>
            </div>
          ) : (
            /* Pairing Token Tab */
            <div className="space-y-4 pt-1">
              <p className="text-xs text-[#6B6B6B] leading-relaxed">
                When you click <strong>Continue with Google</strong> in the extension popup on this web app, Orfilo pairs automatically. If you prefer to pair manually, generate a secure token below:
              </p>

              {!token ? (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGenerateToken}
                    className="w-full py-2.5 px-4 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
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
                <div className="space-y-3 pt-2">
                  <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
                    Extension Pairing Token
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={token}
                      className="flex-1 px-3 py-2 bg-white border border-[#E7E7E4] rounded-xl font-mono text-xs text-[#111111] select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyToken}
                      className="px-3.5 py-2 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
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
                  <p className="text-[11px] text-[#6B6B6B]">
                    Paste this token into the Orfilo Extension popup settings to complete pairing.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E7E7E4] bg-white flex items-center justify-between shrink-0">
          <a
            href="/api/v1/extension/download"
            download="orfilo-extension.zip"
            className="text-xs font-medium text-[#19A974] hover:text-[#158f62] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .zip</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#111111] rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
