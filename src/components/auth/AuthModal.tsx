import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  X,
  Lock,
  Mail,
  User,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  isDarkMode: boolean;
  initialMode?: 'signin' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, isDarkMode, initialMode = 'signin' }) => {
  const { user, profile, signIn, signUp, demoLogin, signOut, resetPassword } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        setSuccessMsg('Signed in successfully! Loading your dashboard...');
        setTimeout(() => onClose(), 500);
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
        setSuccessMsg('Account created successfully! Loading your dashboard...');
        setTimeout(() => onClose(), 600);
      } else if (mode === 'reset') {
        await resetPassword(email);
        setSuccessMsg('Password reset link sent to your email.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials or use 1-Click Demo Login.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      await demoLogin('Prasad (Lead Engineer)', 'engineer.prasad@constructlab.io');
      setSuccessMsg('Logged in as Lead Engineer! Opening dashboard...');
      setTimeout(() => onClose(), 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all my-auto ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Signed In State */}
        {user ? (
          <div className="space-y-5 text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <div className="w-full h-full rounded-2xl bg-slate-800 flex items-center justify-center text-white font-black text-xl">
                {(profile?.display_name || user.email || 'E').charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <h3 className="font-extrabold text-lg">{profile?.display_name || user.email?.split('@')[0]}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                {profile?.role === 'admin' ? 'Administrator' : 'Verified Engineer'}
              </div>
            </div>

            <div className={`p-4 rounded-2xl text-left text-xs space-y-2 border ${
              isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Engineer ID:</span>
                <span className="font-mono text-[11px] truncate max-w-[180px] text-blue-400 font-bold">{user.id}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-semibold">Workspace Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active & Synced
                </span>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="w-full py-2.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        ) : (
          /* Sign In / Sign Up Forms */
          <div className="space-y-4">
            {/* Header Icon & Title */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2.5 border border-blue-500/20 shadow-md shadow-blue-500/10">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-black text-xl tracking-tight">
                {mode === 'signin' && 'Sign in to ConstructLab'}
                {mode === 'signup' && 'Create Engineer Account'}
                {mode === 'reset' && 'Reset your Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                {mode === 'signin' && 'Access your digital circuits and sync to cloud under your unique ID.'}
                {mode === 'signup' && 'Join the digital electronics studio and receive your unique Engineer ID.'}
                {mode === 'reset' && 'Enter your email to receive recovery instructions.'}
              </p>
            </div>

            {/* 1-Click Instant Demo Login Banner */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border border-amber-500/30 hover:border-amber-500/50 text-amber-400 font-bold text-xs transition-all flex items-center justify-center gap-2 group shadow-sm"
              >
                <Zap className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>⚡ 1-Click Instant Engineer Login (No Password)</span>
              </button>
            </div>

            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] text-slate-500 uppercase font-mono">or continue with email</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Mode Switcher Tabs */}
            {mode !== 'reset' && (
              <div className={`p-1 rounded-xl border grid grid-cols-2 gap-1 text-xs font-bold ${
                isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(null); }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'signin'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(null); }}
                  className={`py-2 rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Prasad Patil"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-200 focus:border-blue-500'
                          : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border outline-none transition-colors ${
                      isDarkMode
                        ? 'bg-slate-800/80 border-slate-700 text-slate-200 focus:border-blue-500'
                        : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500'
                    }`}
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 font-semibold">Password</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={() => setMode('reset')}
                        className="text-[11px] text-blue-400 hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border outline-none transition-colors ${
                        isDarkMode
                          ? 'bg-slate-800/80 border-slate-700 text-slate-200 focus:border-blue-500'
                          : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl font-extrabold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {mode === 'signin' && 'Sign In to Workspace'}
                      {mode === 'signup' && 'Create Account & Start Constructing'}
                      {mode === 'reset' && 'Send Password Recovery Email'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom helper */}
            <div className="pt-2 text-center text-xs text-slate-400 space-y-1">
              {mode === 'signin' && (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setErrorMsg(null); }}
                    className="text-blue-400 font-bold hover:underline ml-1"
                  >
                    Sign up free
                  </button>
                </p>
              )}
              {mode === 'signup' && (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setMode('signin'); setErrorMsg(null); }}
                    className="text-blue-400 font-bold hover:underline ml-1"
                  >
                    Sign in
                  </button>
                </p>
              )}
              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setErrorMsg(null); }}
                  className="text-blue-400 font-bold hover:underline"
                >
                  &larr; Back to Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
