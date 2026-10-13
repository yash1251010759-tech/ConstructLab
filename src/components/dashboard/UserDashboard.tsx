import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Profile } from '../../services/authService';
import { circuitService, CircuitRecord, ActivityLogRecord } from '../../services/circuitService';
import { CircuitData, PrebuiltTemplate } from '../../types/circuit';
import { PREBUILT_CIRCUITS } from '../../data/prebuiltCircuits';
import {
  Play,
  Plus,
  Copy,
  Check,
  Folder,
  Trash2,
  Clock,
  Layers,
  Database,
  ShieldCheck,
  ExternalLink,
  Cpu,
  Activity,
  History,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Share2,
  Calendar,
} from 'lucide-react';

interface UserDashboardProps {
  user: User;
  profile: Profile | null;
  onLaunchStudio: (circuitToLoad?: CircuitData) => void;
  onOpenVersions: (circuitId: string) => void;
  onOpenShare: (circuitId: string) => void;
  onOpenLearning: () => void;
  onSignOut: () => void;
  isDarkMode: boolean;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  user,
  profile,
  onLaunchStudio,
  onOpenVersions,
  onOpenShare,
  onOpenLearning,
  onSignOut,
  isDarkMode,
}) => {
  const [circuits, setCircuits] = useState<CircuitRecord[]>([]);
  const [activities, setActivities] = useState<ActivityLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const displayName =
    profile?.display_name ||
    user.user_metadata?.display_name ||
    user.email?.split('@')[0] ||
    'Engineer';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [userCircuits, userLogs] = await Promise.all([
        circuitService.getMyCircuits(),
        circuitService.getUserActivity(15),
      ]);
      setCircuits(userCircuits);
      setActivities(userLogs);
    } catch (err) {
      console.warn('Dashboard data fetch warning:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user.id]);

  const handleCopyUserId = () => {
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleDeleteCircuit = async (id: string, title: string) => {
    if (!window.confirm(`Permanently delete "${title}" from your cloud account?`)) return;
    try {
      await circuitService.deleteCircuit(id);
      setCircuits((prev) => prev.filter((c) => c.id !== id));
      const updatedLogs = await circuitService.getUserActivity(15);
      setActivities(updatedLogs);
    } catch (err: any) {
      alert(`Delete error: ${err.message}`);
    }
  };

  const handleDuplicate = async (circuit: CircuitRecord) => {
    try {
      const dup = await circuitService.duplicateCircuit(circuit.circuit_data, `${circuit.title} (Copy)`);
      setCircuits((prev) => [dup, ...prev]);
      const updatedLogs = await circuitService.getUserActivity(15);
      setActivities(updatedLogs);
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  // Calculate total components placed across all user circuits
  const totalComponents = circuits.reduce((acc, c) => {
    const comps = c.circuit_data?.components?.length || 0;
    return acc + comps;
  }, 0);

  return (
    <div
      className={`flex-1 overflow-y-auto px-4 sm:px-8 py-6 font-sans ${
        isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Hero Banner & Quick Launch ConstructLab */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden shadow-xl transition-all ${
            isDarkMode
              ? 'bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900 border-blue-500/30'
              : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-white border-blue-200'
          }`}
        >
          {/* Subtle circuit backdrop pattern */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
            <Cpu className="w-64 h-64 text-blue-400 stroke-1" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Engineer Workspace Active
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Supabase Synced
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Welcome back, <span className="text-blue-500">{displayName}</span>! 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                Design and simulate digital logic circuits in real time. Everything you build and save is automatically linked to your personal account in Supabase.
              </p>

              {/* User Unique ID Display Badge */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono select-all ${
                    isDarkMode
                      ? 'bg-slate-900/80 border-slate-700/80 text-slate-300'
                      : 'bg-white border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    Your Unique User ID:
                  </span>
                  <span className="font-semibold text-blue-400">{user.id}</span>
                </div>

                <button
                  onClick={handleCopyUserId}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                    copiedId
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : isDarkMode
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100'
                  }`}
                  title="Copy your unique ID to clipboard"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Prominent ConstructLab Launcher CTA */}
            <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
              <button
                onClick={() => onLaunchStudio()}
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 group"
                title="Launch ConstructLab Studio"
              >
                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                <span>Launch ConstructLab Studio</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onLaunchStudio()}
                className={`px-4 py-3.5 rounded-2xl border font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isDarkMode
                    ? 'border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200'
                    : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
                }`}
                title="Create a new blank canvas"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>New Blank Circuit</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div
            className={`p-4.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Saved Circuits</span>
              <Folder className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-blue-400">{circuits.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Stored in Supabase cloud</p>
          </div>

          <div
            className={`p-4.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Active Components</span>
              <Cpu className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{totalComponents}</div>
            <p className="text-[11px] text-slate-500 mt-1">Across your cloud circuits</p>
          </div>

          <div
            className={`p-4.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Cloud Activity Logs</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400">{activities.length}</div>
            <p className="text-[11px] text-slate-500 mt-1">Recorded audit trail events</p>
          </div>

          <div
            className={`p-4.5 rounded-2xl border ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-semibold">Engineer Status</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-sm font-bold text-amber-400 truncate mt-1">
              {profile?.role === 'admin' ? 'Administrator' : 'Verified Engineer'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">UID: {user.id.slice(0, 8)}...</p>
          </div>
        </div>

        {/* Main Content Layout: Left (Circuits & Templates) + Right (User Profile & Audit Log) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 cols): My Circuits & Starter Templates */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Circuits Section */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Folder className="w-4 h-4 text-blue-400" />
                  <h2 className="font-extrabold text-sm sm:text-base">My Saved Circuits</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-bold">
                    {circuits.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setRefreshing(true);
                      loadDashboardData();
                    }}
                    className={`p-1.5 rounded-lg border text-slate-400 hover:text-blue-400 transition-colors ${
                      isDarkMode ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Refresh from Supabase"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => onLaunchStudio()}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-blue-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Circuit</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin text-blue-400" />
                  <p className="text-xs font-semibold">Loading circuits from Supabase...</p>
                </div>
              ) : circuits.length === 0 ? (
                <div
                  className={`py-12 text-center rounded-xl border border-dashed p-6 ${
                    isDarkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <Cpu className="w-10 h-10 mx-auto text-slate-500 stroke-1 mb-2" />
                  <h3 className="font-bold text-sm">No saved circuits yet</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Launch ConstructLab to design your first logic diagram. When you save it, it will appear here under your unique User ID!
                  </p>
                  <button
                    onClick={() => onLaunchStudio()}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20"
                  >
                    Open ConstructLab Studio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {circuits.map((circ) => {
                    const compCount = circ.circuit_data?.components?.length || 0;
                    const wireCount = circ.circuit_data?.wires?.length || 0;

                    return (
                      <div
                        key={circ.id}
                        className={`p-4 rounded-xl border transition-all flex flex-col justify-between group ${
                          isDarkMode
                            ? 'bg-slate-900/80 border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60'
                            : 'bg-slate-50/80 border-slate-200 hover:border-blue-400 hover:bg-white'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-blue-400 transition-colors">
                              {circ.title || 'Untitled Circuit'}
                            </h3>
                            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                              v{circ.version_number}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {circ.description || 'Digital logic circuit schematic workspace.'}
                          </p>

                          {/* Circuit Metadata */}
                          <div className="mt-3 flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                            <div className="flex items-center gap-1">
                              <Cpu className="w-3 h-3 text-slate-400" />
                              <span>{compCount} comps</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Layers className="w-3 h-3 text-slate-400" />
                              <span>{wireCount} wires</span>
                            </div>
                            <div className="flex items-center gap-1 ml-auto">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{formatDate(circ.updated_at)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Card Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between gap-2">
                          <button
                            onClick={() => onLaunchStudio(circ.circuit_data)}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                            title="Open this circuit in ConstructLab"
                          >
                            <Play className="w-3 h-3 fill-white" />
                            <span>Open in Studio</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDuplicate(circ)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                              title="Duplicate circuit"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenShare(circ.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                              title="Share circuit link"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onOpenVersions(circ.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-colors"
                              title="View version history snapshots"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCircuit(circ.id, circ.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="Delete circuit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Starter Templates Grid */}
            <div
              className={`p-5 sm:p-6 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/50 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h2 className="font-extrabold text-sm sm:text-base">Prebuilt Logic Templates</h2>
                </div>
                <span className="text-[11px] text-slate-400">1-click launch into ConstructLab</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PREBUILT_CIRCUITS.slice(0, 3).map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      isDarkMode
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">
                          {tmpl.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {tmpl.circuit.components.length} gates
                        </span>
                      </div>
                      <h4 className="font-bold text-xs line-clamp-1">{tmpl.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {tmpl.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onLaunchStudio(tmpl.circuit)}
                      className="mt-3 w-full py-1.5 rounded-lg border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Open in Studio</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 col): User Identity Profile & Supabase Audit Activity Log */}
          <div className="space-y-6">
            {/* User Profile Card ("on the right side, the name of the user is open") */}
            <div
              className={`p-5 rounded-2xl border space-y-4 ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between border-b border-inherit pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Profile Details
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  ONLINE
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
                  <img
                    src={profile?.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.id}`}
                    alt="Avatar"
                    className="w-full h-full rounded-2xl object-cover bg-slate-800"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-sm truncate">{displayName}</h3>
                  <p className="text-xs text-slate-400 truncate font-mono mt-0.5">{user.email}</p>
                  <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    {profile?.role === 'admin' ? 'Administrator' : 'Verified Engineer'}
                  </div>
                </div>
              </div>

              {/* Unique ID Card */}
              <div
                className={`p-3 rounded-xl border text-xs space-y-2 ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Supabase Engineer ID
                  </span>
                  <button
                    onClick={handleCopyUserId}
                    className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-300 break-all select-all bg-slate-800/40 p-2 rounded border border-slate-700/50">
                  {user.id}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Every circuit, version snapshot, and action you perform is tagged with this unique ID in Supabase.
                </p>
              </div>

              <button
                onClick={onSignOut}
                className="w-full py-2 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 font-bold text-xs transition-colors"
              >
                Sign Out
              </button>
            </div>

            {/* Supabase Cloud Activity Audit Trail */}
            <div
              className={`p-5 rounded-2xl border ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between mb-3 border-b border-inherit pb-2">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <h3 className="font-extrabold text-xs uppercase tracking-wider">
                    Supabase Cloud Audit Log
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">
                  {activities.length} entries
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-3">
                Live activity record saved under your specific User ID ({user.id.slice(0, 8)}...):
              </p>

              {activities.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No activity entries recorded yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
                        isDarkMode
                          ? 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/30'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="p-1 rounded bg-blue-500/10 text-blue-400 mt-0.5 shrink-0">
                        <Database className="w-3 h-3" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-[11px] text-blue-400 font-mono truncate">
                            {act.action}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono shrink-0">
                            {formatDate(act.created_at)}
                          </span>
                        </div>
                        {act.metadata && typeof act.metadata === 'object' && (act.metadata as any).title && (
                          <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                            {(act.metadata as any).title}
                          </p>
                        )}
                        <p className="text-[9px] text-slate-500 font-mono truncate mt-0.5">
                          UID: {act.user_id ? `${act.user_id.slice(0, 12)}...` : 'Anonymous'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
