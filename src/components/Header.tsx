import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Undo2,
  Redo2,
  Table,
  Activity,
  Sparkles,
  Download,
  Code2,
  Plus,
  FolderOpen,
  Sun,
  Moon,
  Cloud,
  Share2,
  GraduationCap,
  User as UserIcon,
  Folder,
  Check,
  LayoutDashboard,
  Cpu,
  ChevronDown,
  Copy,
  LogOut,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { PREBUILT_CIRCUITS } from '../data/prebuiltCircuits';
import { PrebuiltTemplate } from '../types/circuit';
import { NotificationDropdown } from './notifications/NotificationDropdown';

interface HeaderProps {
  title: string;
  setTitle: (t: string) => void;
  isRunning: boolean;
  setIsRunning: React.Dispatch<React.SetStateAction<boolean>>;
  simSpeedHz: number;
  setSimSpeedHz: (hz: number) => void;
  onNewCircuit: () => void;
  onLoadTemplate: (template: PrebuiltTemplate) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenTruthTable: () => void;
  onOpenWaveform: () => void;
  onOpenAI: () => void;
  onOpenVerilog: () => void;
  onOpenExport: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  // Backend & Cloud Props
  onSaveCircuit: () => void;
  isSaving?: boolean;
  lastSavedAt?: Date | null;
  onOpenCircuitManager: () => void;
  onOpenShare: () => void;
  onOpenLearning: () => void;
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
  user?: any;
  currentView?: 'dashboard' | 'studio';
  onChangeView?: (view: 'dashboard' | 'studio') => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  setTitle,
  isRunning,
  setIsRunning,
  simSpeedHz,
  setSimSpeedHz,
  onNewCircuit,
  onLoadTemplate,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenTruthTable,
  onOpenWaveform,
  onOpenAI,
  onOpenVerilog,
  onOpenExport,
  isDarkMode,
  setIsDarkMode,
  onSaveCircuit,
  isSaving = false,
  lastSavedAt = null,
  onOpenCircuitManager,
  onOpenShare,
  onOpenLearning,
  onOpenAuth,
  user,
  currentView = 'studio',
  onChangeView,
  onSignOut,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [profileDropdownOpen]);

  const handleCopyUserId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const userName =
    user?.user_metadata?.display_name ||
    user?.email?.split('@')[0] ||
    'Engineer';

  return (
    <header
      className={`h-16 px-2.5 sm:px-4 border-b flex items-center justify-between gap-1.5 sm:gap-2.5 select-none w-full overflow-x-auto no-scrollbar shrink-0 ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Brand & Project Title / View Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          className="flex items-center gap-2 font-bold text-base cursor-pointer"
          onClick={() => onChangeView && onChangeView('dashboard')}
          title="Return to Dashboard"
        >
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-sm sm:text-base shadow-lg shadow-blue-500/20 shrink-0">
            &Omega;
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 leading-none">
              <span className={`text-xs sm:text-sm font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                ConstructLab
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-blue-500/10 text-blue-500 font-mono border border-blue-500/20 uppercase font-bold hidden xs:inline-block">
                PRO
              </span>
            </div>
            <span className={`text-[8px] sm:text-[9px] uppercase tracking-widest mt-0.5 font-mono hidden md:block ${isDarkMode ? 'text-slate-500' : 'text-slate-600 font-semibold'}`}>
              ELECTRONICS STUDIO
            </span>
          </div>
        </div>

        {/* View Switcher Pills (Dashboard vs Studio) */}
        {user && onChangeView && (
          <div className={`flex items-center p-0.5 rounded-xl border text-xs font-semibold ${
            isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => onChangeView('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                currentView === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Open User Dashboard"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <button
              onClick={() => onChangeView('studio')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                currentView === 'studio'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Launch ConstructLab Studio"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ConstructLab</span>
            </button>
          </div>
        )}

        <div className="h-5 w-px bg-slate-700/50 hidden lg:block mx-0.5" />

        {/* Editable Title (Only when in Studio) */}
        {currentView === 'studio' && (
          <div className="hidden sm:flex flex-col">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Circuit Title..."
              className={`font-semibold text-xs px-2 py-1 rounded border transition-colors outline-none w-28 sm:w-32 md:w-40 lg:w-44 ${
                isDarkMode
                  ? 'bg-slate-800/60 border-slate-700 text-slate-200 focus:border-blue-500'
                  : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>
        )}
      </div>

      {/* Center Controls: Only in Studio mode */}
      {currentView === 'studio' ? (
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Play/Pause */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 ${
              isRunning
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
            }`}
            title={isRunning ? 'Pause Engine Simulation' : 'Run Engine Simulation'}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-amber-400" />
                <span className="hidden md:inline uppercase tracking-wider text-[11px]">PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span className="hidden md:inline uppercase tracking-wider text-[11px]">RUN</span>
              </>
            )}
          </button>

          {/* Simulation Speed Selector */}
          <div className={`hidden 2xl:flex items-center gap-1 text-xs px-2 py-1 rounded border shrink-0 ${
            isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
          }`}>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">CLK:</span>
            {[1, 2, 5, 10, 20].map((hz) => (
              <button
                key={hz}
                onClick={() => setSimSpeedHz(hz)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  simSpeedHz === hz
                    ? 'bg-blue-600 text-white font-bold'
                    : 'hover:bg-slate-700/50'
                }`}
              >
                {hz}Hz
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-slate-700 mx-0.5 hidden md:block" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded border transition-colors ${
                canUndo
                  ? isDarkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                  : 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded border transition-colors ${
                canRedo
                  ? isDarkMode
                    ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                    : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                  : 'opacity-40 cursor-not-allowed border-transparent text-slate-500'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* When in Dashboard mode, show a small quick link */
        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400">
          <span>ConstructLab Workspace Dashboard</span>
        </div>
      )}

      {/* Right Controls: Studio tools (when in Studio), Notifications, User Profile on right */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {currentView === 'studio' && (
          <>
            {/* Cloud Save Button */}
            <button
              onClick={onSaveCircuit}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold transition-all shrink-0 ${
                lastSavedAt
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20'
              }`}
              title="Save Circuit to Supabase Cloud"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : lastSavedAt ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Cloud className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isSaving ? 'Saving...' : lastSavedAt ? 'Saved' : 'Save'}</span>
            </button>

            {/* My Circuits Repository Button */}
            <button
              onClick={onOpenCircuitManager}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded border text-xs font-medium transition-colors shrink-0 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="My Cloud Circuits & Community"
            >
              <Folder className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xl:inline">Circuits</span>
            </button>

            {/* Share Button */}
            <button
              onClick={onOpenShare}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded border text-xs font-medium transition-colors shrink-0 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="Create Secure Share Link"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden xl:inline">Share</span>
            </button>

            {/* Learning Lab Challenges */}
            <button
              onClick={onOpenLearning}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded border text-xs font-medium transition-colors shrink-0 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-amber-600'
              }`}
              title="Interactive Logic Lab Challenges"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden 2xl:inline">Lab</span>
            </button>

            {/* Prebuilt Templates Dropdown */}
            <div className="relative group shrink-0">
              <button
                className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded border text-xs font-medium transition-colors ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
                }`}
                title="Prebuilt Circuits & Templates"
              >
                <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden 2xl:inline">Templates</span>
              </button>

              <div
                className={`absolute right-0 top-full mt-1 w-64 rounded-lg border shadow-xl p-2 hidden group-hover:block z-50 ${
                  isDarkMode ? 'bg-[#1E293B] border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}>
                  Educational Templates
                </div>
                {PREBUILT_CIRCUITS.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => onLoadTemplate(tmpl)}
                    className={`w-full text-left p-2 rounded transition-colors block text-xs ${
                      isDarkMode
                        ? 'hover:bg-blue-500/10 hover:text-blue-400 text-slate-200'
                        : 'hover:bg-blue-50 hover:text-blue-600 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold">{tmpl.name}</div>
                    <div className={`text-[10px] line-clamp-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{tmpl.description}</div>
                  </button>
                ))}
                <div className={`border-t my-1 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`} />
                <button
                  onClick={onNewCircuit}
                  className={`w-full text-left p-2 rounded transition-colors flex items-center gap-2 text-xs text-rose-500 font-semibold ${
                    isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-rose-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Blank Canvas
                </button>
              </div>
            </div>

            {/* Truth Table */}
            <button
              onClick={onOpenTruthTable}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded border text-xs font-medium transition-colors shrink-0 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="Auto-Generate Truth Table"
            >
              <Table className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden 2xl:inline">Table</span>
            </button>

            {/* Waveform Scope */}
            <button
              onClick={onOpenWaveform}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded border text-xs font-medium transition-colors shrink-0 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="Digital Logic Analyzer / Waveforms"
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden 2xl:inline">Scope</span>
            </button>

            {/* AI Assistant */}
            <button
              onClick={onOpenAI}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 border border-blue-500/30 text-xs font-semibold transition-all shrink-0"
              title="AI Circuit Tutor & Synthesizer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-blue-400" />
              <span className="hidden xl:inline">AI Tutor</span>
            </button>

            {/* Verilog Code */}
            <button
              onClick={onOpenVerilog}
              className={`p-1.5 rounded border text-xs font-medium transition-colors shrink-0 ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-700'
              }`}
              title="Generate Verilog HDL Code"
            >
              <Code2 className="w-4 h-4 text-blue-400" />
            </button>

            {/* Export Button */}
            <button
              onClick={onOpenExport}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all shrink-0"
              title="Export Circuit Diagram (PNG, SVG, PDF, JSON)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Export</span>
            </button>
          </>
        )}

        {/* Notifications Bell Dropdown */}
        <NotificationDropdown userId={user?.id} isDarkMode={isDarkMode} />

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-lg border transition-colors shrink-0 ${
            isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-400 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
          }`}
          title="Toggle Dark / Light Theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Profile on the Right Side ("and on the right side, the name of the user is open") */}
        {!user ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onOpenAuth('signin')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all shrink-0 ${
                isDarkMode
                  ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
              title="Sign in to your ConstructLab account"
            >
              <UserIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Sign In</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shrink-0 shadow-md shadow-blue-600/20"
              title="Create a free engineer account"
            >
              <span>Sign Up</span>
            </button>
          </div>
        ) : (
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-bold transition-all"
              title={`Engineer Profile: ${userName} (Click to open menu)`}
            >
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                {userName.charAt(0)}
              </div>
              <span className="truncate max-w-[110px] font-bold text-slate-100 hidden sm:inline">
                {userName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Profile Popover / Card on the Right Side */}
            {profileDropdownOpen && (
              <div
                className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {/* Profile Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-inherit">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md">
                    {userName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-extrabold text-sm truncate">{userName}</h4>
                    <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[9px] font-bold uppercase tracking-wider border border-blue-500/20">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Verified Engineer
                    </div>
                  </div>
                </div>

                {/* Unique ID Badge */}
                <div className={`mt-3 p-2.5 rounded-xl border text-xs space-y-1 ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase">
                    <span>Unique User ID</span>
                    <button
                      onClick={handleCopyUserId}
                      className="text-blue-400 hover:underline flex items-center gap-0.5"
                    >
                      {copiedId ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>{copiedId ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-slate-300 break-all select-all">
                    {user.id}
                  </div>
                </div>

                {/* Quick Navigation Links */}
                <div className="mt-3 space-y-1">
                  {onChangeView && (
                    <>
                      <button
                        onClick={() => {
                          onChangeView('dashboard');
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                          currentView === 'dashboard'
                            ? 'bg-blue-600 text-white'
                            : isDarkMode
                            ? 'hover:bg-slate-800 text-slate-300'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>User Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          onChangeView('studio');
                          setProfileDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                          currentView === 'studio'
                            ? 'bg-blue-600 text-white'
                            : isDarkMode
                            ? 'hover:bg-slate-800 text-slate-300'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>ConstructLab Studio</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Sign Out */}
                <div className="mt-3 pt-3 border-t border-inherit">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (onSignOut) onSignOut();
                      else onOpenAuth('signin');
                    }}
                    className="w-full py-2 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
