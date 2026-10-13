import React from 'react';
import {
  Lock,
  Cpu,
  Cloud,
  Activity,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Code2,
  Sun,
  Moon,
  Play,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  onEnterDemo: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenAuth,
  onEnterDemo,
  isDarkMode,
  setIsDarkMode,
}) => {
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
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono border border-blue-500/20 font-bold uppercase">
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
            onClick={() => onOpenAuth('signin')}
            className={`px-3.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isDarkMode
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
            }`}
          >
            Sign In
          </button>

          <button
            onClick={() => onOpenAuth('signup')}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
          >
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20 text-center relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Security / Login Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-6">
          <Lock className="w-3.5 h-3.5" />
          <span>Login Required to Construct & Save Circuits</span>
        </div>

        {/* Main Headings */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-4xl leading-tight sm:leading-tight">
          Next-Generation Digital Logic & Electronics Studio
        </h1>

        <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
          Simulate circuits in real time, generate truth tables and waveforms, and save your work securely to the Supabase cloud. Every engineer receives a <strong className="text-slate-200">unique user ID</strong> with full activity tracking.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => onOpenAuth('signin')}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Sign In to Access ConstructLab</span>
          </button>

          <button
            onClick={() => onOpenAuth('signup')}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl border font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              isDarkMode
                ? 'border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200'
                : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
            }`}
          >
            <span>Register as Engineer</span>
          </button>

          <button
            onClick={onEnterDemo}
            className="w-full sm:w-auto px-4 py-3 text-xs font-semibold text-slate-400 hover:text-blue-400 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Try Quick Demo Mode</span>
          </button>
        </div>

        {/* 4 Feature Value Pillars */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full text-left">
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3 border border-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">Real-Time Simulation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Interactive gates, flip-flops, clocks, and displays running up to 20Hz continuous clocking with instant propagation.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 border border-emerald-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">Unique User ID & Cloud Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every save is permanently linked to your personal Supabase account and unique ID with full version snapshots.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 border border-amber-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">Logic Analyzer & Truth Tables</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inspect multi-channel waveforms and auto-generate exhaustive truth tables for any combinational circuit.
            </p>
          </div>

          <div
            className={`p-5 rounded-2xl border transition-all ${
              isDarkMode ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm mb-1">AI Tutor & HDL Synthesis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ask AI to analyze logic bugs or generate synthesis ready Verilog HDL code exportable for FPGA implementation.
            </p>
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
          <span>Supabase PostgreSQL Cloud Active</span>
        </div>
        <span>ConstructLab v2.4</span>
      </footer>
    </div>
  );
};
