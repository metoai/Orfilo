import React, { useState, useEffect } from 'react';
import { Zap, Copy, Check, AlertCircle, Loader2, X, ShieldCheck } from 'lucide-react';
import { createBrowserClient } from '../lib/supabase/client.ts';

interface ExtensionPairModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Optional backwards-compatible props
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
  const [copied, setCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check extension pairing status when opened
  useEffect(() => {
    if (!isOpen) {
      setToken(null);
      setError(null);
      setCopied(false);
      return;
    }

    const checkStatus = async () => {
      setIsCheckingStatus(true);
      try {
        const client = createBrowserClient();
        if (!client) return;
        const { data: { session } } = await client.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch('/api/v1/extension/status', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.paired || data.connected) {
            setIsConnected(true);
          }
        }
      } catch (e) {
        // Status check error ignored
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateToken = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const client = createBrowserClient();
      if (!client) throw new Error('Supabase client not initialized');
      const { data: { session } } = await client.auth.getSession();
      if (!session?.access_token) throw new Error('You must be signed in to pair an extension');

      const res = await fetch('/api/v1/extension/pair', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate pairing token');
      }

      setToken(data.token);
      setIsConnected(true);
    } catch (err: any) {
      setError(err.message || 'Error generating token');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-[#FAFAF8] border border-[#E7E7E4] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E7E7E4] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F7F0] text-[#19A974] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111111]">Pair Chrome Extension</h2>
              <p className="text-[11px] text-[#6B6B6B]">Connect Orfilo with your browser</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-[#111111] p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {isConnected && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium">Extension Paired & Connected</span>
            </div>
          )}

          <p className="text-xs text-[#6B6B6B] leading-relaxed">
            The Orfilo Companion extension enables one-click artifact capture directly from AI tools. Pair your extension by generating a secure pairing token below.
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
                    <span>Generating Token...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Generate Pairing Token</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <label className="block text-[11px] font-semibold text-[#111111] uppercase tracking-wider">
                Pairing Token
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
                  onClick={handleCopy}
                  className="px-3 py-2 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl text-xs font-medium cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  {copied ? (
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
                Copy and paste this token into the Orfilo Extension popup settings to complete pairing.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7E7E4] bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#E7E7E4] hover:border-[#111111] text-[#111111] rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
