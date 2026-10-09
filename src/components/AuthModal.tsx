import React, { useState } from 'react';
import { LogIn, UserPlus, AlertCircle, Loader2, ShieldCheck, Mail, Lock } from 'lucide-react';
import { createBrowserClient, getSupabaseConfig } from '../lib/supabase/client.ts';
import { OrfiloBrand } from './OrfiloBrand.tsx';
import { User } from '../types/index.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signin', onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  React.useEffect(() => {
    setIsSignUp(initialMode === 'signup');
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
      // In development sandbox mode without external credentials
      const mockUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: email || 'metoaipr@gmail.com',
        name: fullName || (email ? email.split('@')[0] : 'Meto User'),
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(mockUser);
        onClose();
      }, 500);
      return;
    }

    try {
      if (isSignUp) {
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
            setSuccessNotice('Account created! Please check your email to verify your address before signing in.');
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

  const handleQuickSignIn = async () => {
    setIsSignUp(false);
    setEmail('metoaipr@gmail.com');
    setPassword('Orfilo2026!Secure');
    setErrorMsg(null);
    setSuccessNotice(null);
    setIsLoading(true);

    const client = createBrowserClient();
    if (!isConfigured || !client) {
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess({
          id: 'usr_meto_preview',
          email: 'metoaipr@gmail.com',
          name: 'Meto User',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        onClose();
      }, 300);
      return;
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: 'metoaipr@gmail.com',
        password: 'Orfilo2026!Secure',
      });
      if (error) throw error;
      if (data.user) {
        onAuthSuccess({
          id: data.user.id,
          email: data.user.email || 'metoaipr@gmail.com',
          name: data.user.user_metadata?.full_name || 'Meto User',
          created_at: data.user.created_at,
          updated_at: new Date().toISOString(),
        });
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Quick sign in failed');
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
          id: 'usr_meto_preview',
          email: 'metoaipr@gmail.com',
          name: 'Meto User',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        onClose();
      }, 400);
      return;
    }

    try {
      const { data, error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-[#FAFAF8] border border-[#E7E7E4] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 text-center border-b border-[#E7E7E4] bg-white shrink-0">
          <OrfiloBrand variant="stacked" size="md" showTagline={false} className="mx-auto mb-2" />
          <h2 className="text-sm font-semibold text-[#111111] mt-2">
            {isSignUp ? 'Create your Orfilo account' : 'Welcome back'}
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            {isSignUp ? 'Start organizing everything your AI creates' : 'Sign in to access your workspace'}
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="bg-[#E8F7F0] border border-[#19A974]/30 text-emerald-950 rounded-xl p-3 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#19A974]" />
              <span>{successNotice}</span>
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-[11px] font-medium text-[#6B6B6B] mb-1">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Meto Founder"
                className="w-full px-3 py-2 border border-[#E7E7E4] rounded-xl bg-white text-xs focus:outline-none focus:border-[#19A974]"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#6B6B6B] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 border border-[#E7E7E4] rounded-xl bg-white text-xs focus:outline-none focus:border-[#19A974]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#6B6B6B] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 border border-[#E7E7E4] rounded-xl bg-white text-xs focus:outline-none focus:border-[#19A974]"
                required
                minLength={6}
              />
            </div>
          </div>

          {/* Quick-fill button for created real test user */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleQuickSignIn}
              disabled={isLoading}
              className="w-full py-1.5 px-2 bg-[#E8F7F0] hover:bg-[#d6f2e4] text-[#19A974] rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#19A974]/20 disabled:opacity-50"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>One-click sign in (metoaipr@gmail.com)</span>
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...
              </>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-3.5 h-3.5" /> Create Account
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </>
            )}
          </button>

          <div className="relative my-3 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E7E7E4]" />
            </div>
            <span className="relative bg-[#FAFAF8] px-2 text-[10px] text-[#8F8F8F] uppercase tracking-wider font-medium">
              Or
            </span>
          </div>

          <button
            type="button"
            onClick={handleGoogleOAuth}
            disabled={isLoading}
            className="w-full py-2.5 bg-white hover:bg-neutral-50 text-[#3c4043] border border-[#dadce0] rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Continue with Google (Supabase Auth)</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMsg(null);
                setSuccessNotice(null);
              }}
              className="text-xs text-[#6B6B6B] hover:text-[#111111] underline cursor-pointer"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>

        <div className="px-6 py-3 border-t border-[#E7E7E4] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="text-xs text-[#6B6B6B] hover:text-[#111111] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
