import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, AlertCircle, Loader2, ShieldCheck, Mail, Lock, User, ArrowRight, X } from 'lucide-react';
import { createBrowserClient, getSupabaseConfig } from '../lib/supabase/client.ts';
import { OrfiloIcon } from './OrfiloBrand.tsx';
import { User as UserType } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess: (user: UserType) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    setErrorMsg(null);
    setSuccessNotice(null);
  }, [initialMode, isOpen]);

  const { isConfigured } = getSupabaseConfig();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    setIsLoading(true);

    const client = createBrowserClient();

    if (!isConfigured || !client) {
      const mockUser: UserType = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: email || 'user@example.com',
        name: fullName || (email ? email.split('@')[0] : 'User'),
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(mockUser);
        onClose();
      }, 400);
      return;
    }

    try {
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (data.user) {
          try {
            await client.from('users').upsert({
              id: data.user.id,
              email: data.user.email || email.trim(),
              name: fullName.trim() || email.trim().split('@')[0],
              updated_at: new Date().toISOString(),
            }, { onConflict: 'id' });
          } catch (_) {}

          if (data.session) {
            onAuthSuccess({
              id: data.user.id,
              email: data.user.email || email,
              name: fullName.trim() || email.split('@')[0],
              created_at: data.user.created_at,
              updated_at: new Date().toISOString(),
            });
            onClose();
          } else {
            setSuccessNotice('Account created. Check your email to verify before signing in.');
          }
        }
      } else {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.user) {
          onAuthSuccess({
            id: data.user.id,
            email: data.user.email || email,
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          });
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    const client = createBrowserClient();
    if (!isConfigured || !client) {
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess({
          id: 'usr_oauth_demo',
          email: 'demo@example.com',
          name: 'Demo User',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        onClose();
      }, 400);
      return;
    }

    try {
      const isPairing = window.location.search.includes('action=pair-extension');
      const redirectTarget = isPairing
        ? `${window.location.origin}/?action=pair-extension`
        : window.location.origin;

      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTarget,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OAuth failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-neutral-200/80 rounded-2xl w-full max-w-sm shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header & Brand */}
        <div className="p-6 pb-4 flex flex-col items-center text-center relative border-b border-neutral-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-center mb-3 shadow-2xs">
            <OrfiloIcon size={26} />
          </div>

          <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
            {mode === 'signup' ? 'Create your account' : 'Sign in to Orfilo'}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            {mode === 'signup'
              ? 'Organize every artifact your AI creates'
              : 'Enter your credentials to access your workspace'}
          </p>

          {/* Better Auth Segmented Switcher Pill */}
          <div className="mt-4 w-full p-1 bg-neutral-100/80 border border-neutral-200/60 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
                setSuccessNotice(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setSuccessNotice(null);
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Content & Form */}
        <div className="p-6 pt-4 space-y-4 text-xs overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50/80 border border-red-200/80 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 rounded-xl p-3 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Social Provider OAuth */}
          <button
            type="button"
            onClick={handleGoogleOAuth}
            disabled={isLoading}
            className="w-full py-2.5 px-3 bg-white hover:bg-neutral-50 active:bg-neutral-100 text-neutral-800 border border-neutral-200/80 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200/80" />
            </div>
            <span className="relative bg-white px-2 text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
              or continue with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-9 pr-3 py-2 border border-neutral-200/80 rounded-xl bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#19A974] focus:ring-1 focus:ring-[#19A974] transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 border border-neutral-200/80 rounded-xl bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#19A974] focus:ring-1 focus:ring-[#19A974] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-neutral-200/80 rounded-xl bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#19A974] focus:ring-1 focus:ring-[#19A974] transition-all"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 active:bg-black text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'signup' ? (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-center text-[11px] text-neutral-400">
          <span>Protected by Supabase Row-Level Security</span>
        </div>
      </div>
    </div>
  );
};
