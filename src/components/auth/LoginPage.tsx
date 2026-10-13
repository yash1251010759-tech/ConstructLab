import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  Cpu,
  Cloud,
  Activity,
  Sparkles,
  Sun,
  Moon,
  Play,
} from 'lucide-react';

interface LoginPageProps {
  onEnterDemo: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  initialMode?: 'signin' | 'signup';
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onEnterDemo,
  isDarkMode,
  setIsDarkMode,
  initialMode = 'signin',
}) => {
  const { signIn, signUp, demoLogin } = useAuth();

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
      } else if (mode === 'signup') {
        await signUp(email, password, displayName);
        setSuccessMsg('Account created successfully! Loading your dashboard...');
      } else if (mode === 'reset') {
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
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('engineer.prasad@constructlab.io');
    setPassword('ConstructLab2026!');
    setErrorMsg(null);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-blue-500 selection:text-white ${
        isDarkMode ? 'bg-[#0B0F17] text-slate-100' : 'bg-slate-50 text-slate-800'
      }`}
    >
      {/* Top Navbar */}
      <nav
        className={`h-16 px-4 sm:px-8 border-b flex items-center justify-between shrink-0 ${
          isDarkMode ? 'bg-slate-900/80 border-slate-800 backdrop-blur-md' : 'bg-white/80 border-slate-200 backdrop-blur-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-base shadow-lg shadow-blue-500/30">
            &Omega;
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight">ConstructLab</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20 font-bold uppercase">
              PRO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onEnterDemo}
            className="px-3.5 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Play className="w-3 h-3 text-blue-400 fill-current" />
            <span>Try Demo Canvas</span>
          </button>
        </div>
      </nav>

      {/* Main Split Section: Left Brand/Features, Right Live Login Form */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        {/* Glow background ambient lights */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Studio Value Props */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Lock className="w-3.5 h-3.5" />
              <span>Authentication Gateway</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Design & Simulate <span className="text-blue-500">Digital Logic</span> in the Cloud.
            </h1>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Before starting constructing or simulating, log in to your engineer account. Every user receives a <strong className="text-slate-200">unique ID</strong>, and all circuits, version snapshots, and actions are permanently saved to Supabase.
            </p>

            {/* 4 Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div
                className={`p-3.5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  <span className="font-bold text-xs">Real-Time Engine</span>
                </div>
                <p className="text-[11px] text-slate-400">Logic gates, flip-flops, adders, and clocks up to 20Hz.</p>
              </div>

              <div
                className={`p-3.5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-xs">Unique User ID</span>
                </div>
                <p className="text-[11px] text-slate-400">Every circuit and action saved under your specific ID.</p>
              </div>

              <div
                className={`p-3.5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-xs">Waveform Scope</span>
                </div>
                <p className="text-[11px] text-slate-400">Digital timing diagrams and automatic truth tables.</p>
              </div>

              <div
                className={`p-3.5 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-xs">AI Tutor & HDL</span>
                </div>
                <p className="text-[11px] text-slate-400">AI circuit assistant and synthesis ready Verilog code.</p>
              </div>
            </div>
          </div>

          {/* Right Column: The Login Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div
              className={`rounded-3xl border shadow-2xl p-6 sm:p-8 transition-all ${
                isDarkMode ? 'bg-slate-900/90 border-slate-800/90 text-slate-100 backdrop-blur-md' : 'bg-white border-slate-200 text-slate-900 shadow-xl'
              }`}
            >
              {/* Card Header */}
              <div className="text-center mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center mx-auto mb-2.5 border border-blue-500/20 shadow-md shadow-blue-500/10">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="font-black text-xl tracking-tight">
                  {mode === 'signin' && 'Sign in to ConstructLab'}
                  {mode === 'signup' && 'Create Engineer Account'}
                  {mode === 'reset' && 'Reset your Password'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'signin' && 'Enter your credentials to access your dashboard & studio.'}
                  {mode === 'signup' && 'Create your account to get your unique Engineer ID.'}
                  {mode === 'reset' && 'Enter your email to receive recovery instructions.'}
                </p>
              </div>

              {/* 1-Click Instant Demo Login Button */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/40 hover:border-amber-500/60 text-amber-400 font-extrabold text-xs transition-all flex items-center justify-center gap-2 group shadow-md"
                >
                  <Zap className="w-4 h-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>⚡ 1-Click Instant Engineer Login (No Password)</span>
                </button>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[10px] text-slate-500 uppercase font-mono">or login with email</span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>

              {/* Mode Switcher Tabs */}
              {mode !== 'reset' && (
                <div className={`p-1 rounded-xl border grid grid-cols-2 gap-1 text-xs font-bold mb-4 ${
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
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-snug">{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs text-left">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Your Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Prasad Patil"
                        className={`w-full pl-10 pr-3 py-2.5 rounded-xl border outline-none transition-colors ${
                          isDarkMode
                            ? 'bg-slate-800/80 border-slate-700 text-slate-200 focus:border-blue-500'
                            : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 font-semibold">Email Address</label>
                    {mode === 'signin' && (
                      <button
                        type="button"
                        onClick={fillDemoCredentials}
                        className="text-[10px] text-blue-400 hover:underline font-mono"
                      >
                        Auto-fill demo
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="engineer@constructlab.io"
                      className={`w-full pl-10 pr-3 py-2.5 rounded-xl border outline-none transition-colors ${
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
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className={`w-full pl-10 pr-10 py-2.5 rounded-xl border outline-none transition-colors ${
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
                  className="w-full mt-3 py-3 rounded-xl font-extrabold text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 text-sm"
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

              {/* Bottom Mode Switch Links */}
              <div className="mt-4 pt-3 border-t border-slate-800/60 text-center text-xs text-slate-400 space-y-1">
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
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`h-12 border-t flex items-center justify-between px-6 text-xs text-slate-500 font-mono shrink-0 ${
          isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Supabase PostgreSQL Cloud Ready</span>
        </div>
        <span>ConstructLab v2.4</span>
      </footer>
    </div>
  );
};
