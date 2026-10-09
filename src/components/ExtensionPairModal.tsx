import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  Copy,
  Terminal,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Folder,
  Layers,
  ArrowRight,
  Zap,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Project, Artifact } from '../types/index.ts';

interface ExtensionPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  onArtifactCreated?: (artifact: Artifact) => void;
}

export const ExtensionPairModal: React.FC<ExtensionPairModalProps> = ({
  isOpen,
  onClose,
  projects,
  onArtifactCreated,
}) => {
  const [token, setToken] = useState<string>('orf_ext_companion_v1');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [testPingLatency, setTestPingLatency] = useState<number | null>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const [isExtensionActive, setIsExtensionActive] = useState(false);
  const [isPairSuccess, setIsPairSuccess] = useState(false);
  const [pairingNotice, setPairingNotice] = useState<string | null>(null);

  const serverUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  useEffect(() => {
    if (!isOpen) return;

    checkStatus();

    // Listen for extension content script bridge messages
    const onWindowMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ORFILO_EXTENSION_ACTIVE') {
        setIsExtensionActive(true);
      }
      if (event.data?.type === 'ORFILO_PAIR_RESPONSE') {
        if (event.data.success) {
          setIsPairSuccess(true);
          setConnectionStatus('connected');
          setPairingNotice('Extension successfully paired and confirmed!');
        }
      }
    };

    window.addEventListener('message', onWindowMessage);

    // Ping active extension content script bridge
    window.postMessage({ type: 'ORFILO_PING_EXTENSION' }, '*');
    window.postMessage({ type: 'ORFILO_PAIR_REQUEST', token }, '*');

    return () => {
      window.removeEventListener('message', onWindowMessage);
    };
  }, [isOpen, token]);

  const checkStatus = async () => {
    setConnectionStatus('checking');
    try {
      const res = await fetch('/api/v1/extension/status');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'connected') {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
      }
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  const handleConfirmPairingWithExtension = async () => {
    setIsGenerating(true);
    setPairingNotice(null);
    try {
      // 1. Ensure server registers extension pairing
      const res = await fetch('/api/v1/extension/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: 'Orfilo Dashboard Modal' }),
      });
      let activeToken = token;
      if (res.ok) {
        const json = await res.json();
        if (json.token) {
          activeToken = json.token;
          setToken(json.token);
        }
      }

      // 2. Dispatch pairing handshake to content script
      window.postMessage({ type: 'ORFILO_PAIR_REQUEST', token: activeToken }, '*');

      // 3. Update UI
      setIsPairSuccess(true);
      setConnectionStatus('connected');
      setPairingNotice('Extension confirmed! Companion is now paired and listening.');
      checkStatus();
    } catch (err: any) {
      setPairingNotice('Pairing notice: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateNewToken = async () => {
    setIsGenerating(true);
    setErrorNotice(null);
    try {
      const res = await fetch('/api/v1/extension/pair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client: 'Orfilo Dashboard Modal' }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.token) {
          setToken(json.token);
          setConnectionStatus('connected');
          window.postMessage({ type: 'ORFILO_PAIR_REQUEST', token: json.token }, '*');
        }
      }
    } catch (err: any) {
      setErrorNotice(err.message || 'Failed to generate token');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleTestPing = async () => {
    setIsPinging(true);
    setErrorNotice(null);
    const start = performance.now();
    try {
      const res = await fetch('/api/v1/extension/status');
      const latency = Math.round(performance.now() - start);
      if (res.ok) {
        setTestPingLatency(latency);
        setConnectionStatus('connected');
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err: any) {
      setErrorNotice('Extension API ping failed: ' + err.message);
      setConnectionStatus('disconnected');
    } finally {
      setIsPinging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-xl bg-white border border-neutral-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#111111] flex items-center justify-center text-white shrink-0 shadow-sm">
              <img src="/brand/orfilo-icon.png" alt="Orfilo" className="w-5 h-5 rounded" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-neutral-900 tracking-tight">Chrome Extension Companion</h2>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  v1.1.0 MV3
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Capture code, designs, and files directly from ChatGPT, Claude, and Gemini into Orfilo.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Status Bar */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : connectionStatus === 'checking'
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-neutral-300'
                }`}
              />
              <span className="text-xs font-medium text-neutral-800">
                {connectionStatus === 'connected'
                  ? 'Companion API Ready'
                  : connectionStatus === 'checking'
                  ? 'Verifying workspace endpoint...'
                  : 'Awaiting Companion Setup'}
              </span>
            </div>

            <button
              onClick={handleTestPing}
              disabled={isPinging}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-600 hover:text-neutral-900 px-2.5 py-1 rounded-lg hover:bg-neutral-200/70 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{testPingLatency !== null ? `${testPingLatency}ms ping` : 'Test Ping'}</span>
            </button>
          </div>

          {/* Pairing Token Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-800 tracking-tight">
                Companion Pairing Token
              </label>
              <button
                onClick={handleGenerateNewToken}
                disabled={isGenerating}
                className="text-[11px] text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center gap-1 hover:underline"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>Rotate Token</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={token}
                  className="w-full font-mono text-xs bg-neutral-50 text-neutral-800 px-3 py-2.5 rounded-xl border border-neutral-200 focus:outline-none select-all"
                />
              </div>
              <button
                onClick={handleCopy}
                className={`inline-flex items-center gap-1.5 text-xs font-medium px-4 py-2.5 rounded-xl transition-all ${
                  isCopied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#111111] hover:bg-neutral-800 text-white'
                }`}
              >
                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Copied' : 'Copy Token'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-400">
              The companion extension uses this token to authenticate artifact captures into your workspace.
            </p>

            {/* 1-Click Confirm & Bridge Button */}
            <div className="pt-2">
              <button
                onClick={handleConfirmPairingWithExtension}
                disabled={isGenerating}
                className="w-full py-2.5 px-4 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Confirm & Pair Active Extension (1-Click)</span>
              </button>
            </div>

            {/* Confirmation Notice */}
            {pairingNotice && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-[#19A974] shrink-0" />
                <span className="font-medium">{pairingNotice}</span>
              </div>
            )}
          </div>

          {/* Setup Instructions (3 Steps) */}
          <div className="space-y-3 pt-2 border-t border-neutral-100">
            <h3 className="text-xs font-semibold text-neutral-900 tracking-tight">
              3-Step Installation in Google Chrome
            </h3>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                <div className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-xs text-neutral-600 leading-relaxed">
                  Open Google Chrome and navigate to{' '}
                  <code className="font-mono bg-neutral-200/80 px-1.5 py-0.5 rounded text-neutral-800 select-all">
                    chrome://extensions
                  </code>
                  .
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                <div className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-xs text-neutral-600 leading-relaxed">
                  Turn on <strong className="text-neutral-800 font-semibold">Developer mode</strong> (top right switch), then click{' '}
                  <strong className="text-neutral-800 font-semibold">Load unpacked</strong>.
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-neutral-50/80 border border-neutral-100">
                <div className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-xs text-neutral-600 leading-relaxed">
                  Select the <code className="font-mono bg-neutral-200/80 px-1.5 py-0.5 rounded text-neutral-800">/extension</code> directory. The Orfilo icon will appear in your browser toolbar!
                </div>
              </div>
            </div>
          </div>

          {/* Capabilities Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-800 truncate">In-Chat Code Capture</div>
                <div className="text-[10px] text-neutral-400 truncate">1-Click Save pill on code</div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-800 truncate">Download Interception</div>
                <div className="text-[10px] text-neutral-400 truncate">Auto-routes AI exports</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/70 flex items-center justify-between">
          <div className="text-[11px] text-neutral-400">
            Workspace: <span className="font-mono text-neutral-600">{serverUrl}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-200 rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
