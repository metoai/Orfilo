import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { OrfiloBrand } from './OrfiloBrand.tsx';
import { createBrowserClient, getSupabaseConfig } from '../lib/supabase/client.ts';
import type { User as UserType } from '../types/index.ts';

interface AuthPageViewProps {
  initialMode?: 'signin' | 'signup';
  onAuthSuccess: (user: UserType) => void;
  onBackToHome: () => void;
}

export const AuthPageView: React.FC<AuthPageViewProps> = ({
  initialMode = 'signin',
  onAuthSuccess,
  onBackToHome,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const { isConfigured } = getSupabaseConfig();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);
    setIsLoading(true);

    const client = createBrowserClient();

    if (!isConfigured || !client) {
      // Local fallback
      const mockUser: UserType = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email: email.trim() || 'user@example.com',
        name: fullName.trim() || (email ? email.split('@')[0] : 'Workspace Member'),
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setTimeout(() => {
        setIsLoading(false);
        onAuthSuccess(mockUser);
      }, 350);
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
            await client.from('users').upsert(
              {
                id: data.user.id,
                email: data.user.email || email.trim(),
                name: fullName.trim() || email.trim().split('@')[0],
                updated_at: new Date().toISOString(),
              },
              { onConflict: 'id' }
            );
          } catch (_) {}

          if (data.session) {
            onAuthSuccess({
              id: data.user.id,
              email: data.user.email || email.trim(),
              name: fullName.trim() || email.split('@')[0],
              created_at: data.user.created_at,
              updated_at: new Date().toISOString(),
            });
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
            email: data.user.email || email.trim(),
            name: data.user.user_metadata?.full_name || email.split('@')[0],
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          });
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
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
      }, 350);
      return;
    }

    try {
      const isPairing = window.location.search.includes('action=pair-extension');
      const redirectTarget = isPairing
        ? `${window.location.origin}/?action=pair-extension`
        : window.location.origin;

      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTarget,
        },
      });

      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Google OAuth connection failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex flex-col justify-between antialiased selection:bg-[#E8F7F0] selection:text-[#19A974] relative overflow-hidden font-sans">
      {/* Ambient Radial Illumination */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(25,169,116,0.12),rgba(255,255,255,0))] -z-10" />

      {/* Top Navbar */}
      <header className="px-6 md:px-12 py-4 flex items-center justify-between">
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to home</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
            v2.0
          </span>
        </div>
      </header>

      {/* Centered Auth Box */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="w-full max-w-[420px] bg-white border border-neutral-200/90 rounded-2xl shadow-xl shadow-neutral-200/40 p-7 sm:p-8 space-y-6"
        >
          {/* Brand & Heading */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <OrfiloBrand variant="icon-only" size="md" />
            </div>

            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-950">
                {mode === 'signin' ? 'Welcome back' : 'Create your account'}
              </h1>
              <p className="text-xs text-neutral-500 mt-1">
                {mode === 'signin'
                  ? 'Sign in to access your projects and deliverables.'
                  : 'Start organizing everything your AI creates in clean subfolders.'}
              </p>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="p-1 bg-neutral-100 rounded-xl flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessNotice(null);
                }}
                className={`relative flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'signin'
                    ? 'text-neutral-950 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {mode === 'signin' && (
                  <motion.div
                    layoutId="authPageTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-neutral-200/60 -z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessNotice(null);
                }}
                className={`relative flex-1 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  mode === 'signup'
                    ? 'text-neutral-950 font-semibold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {mode === 'signup' && (
                  <motion.div
                    layoutId="authPageTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-2xs border border-neutral-200/60 -z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">Sign Up</span>
              </button>
            </div>
          </div>

          {/* Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleOAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-neutral-50 border border-neutral-200/90 rounded-xl text-xs font-semibold text-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs disabled:opacity-60"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-neutral-200/80 w-full" />
            <span className="bg-white px-2.5 text-[11px] text-neutral-400 font-medium select-none absolute">
              or continue with email
            </span>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#19A974] shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 block">Full Name</label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alazar Tesema"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-200/80 focus:border-[#19A974] rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#19A974] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 block">Email Address</label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-200/80 focus:border-[#19A974] rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#19A974] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-neutral-700 block">Password</label>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-neutral-50/70 hover:bg-neutral-50 focus:bg-white border border-neutral-200/80 focus:border-[#19A974] rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#19A974] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-neutral-400 hover:text-neutral-700 p-0.5 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : mode === 'signin' ? (
                <>
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Toggle Text */}
          <div className="text-center text-xs text-neutral-500 pt-1">
            {mode === 'signin' ? (
              <span>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessNotice(null);
                  }}
                  className="text-[#19A974] hover:underline font-semibold cursor-pointer"
                >
                  Sign up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessNotice(null);
                  }}
                  className="text-[#19A974] hover:underline font-semibold cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>
        </motion.div>
      </main>

      {/* Subtle Security Footer */}
      <footer className="py-6 text-center text-xs text-neutral-400 font-mono">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>PostgreSQL Row-Level Security Enforced</span>
        </div>
      </footer>
    </div>
  );
};
