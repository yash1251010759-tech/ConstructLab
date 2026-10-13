import React, { useState, useEffect } from 'react';
import { circuitService, CircuitRecord } from '../../services/circuitService';
import { CircuitData } from '../../types/circuit';
import { useAuth } from '../../hooks/useAuth';
import {
  X,
  Folder,
  Search,
  Plus,
  Trash2,
  Copy,
  History,
  Share2,
  Globe,
  Lock,
  Cpu,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface CircuitManagerModalProps {
  currentCircuit: CircuitData;
  onLoadCircuit: (circuit: CircuitData) => void;
  onOpenVersions: (circuitId: string) => void;
  onOpenShare: (circuitId: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const CircuitManagerModal: React.FC<CircuitManagerModalProps> = ({
  currentCircuit,
  onLoadCircuit,
  onOpenVersions,
  onOpenShare,
  onClose,
  isDarkMode,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'mine' | 'community'>('mine');
  const [myCircuits, setMyCircuits] = useState<CircuitRecord[]>([]);
  const [communityCircuits, setCommunityCircuits] = useState<CircuitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCircuits = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === 'mine' && user) {
        const data = await circuitService.getMyCircuits();
        setMyCircuits(data);
      } else if (activeTab === 'community') {
        const data = await circuitService.getPublicCircuits(undefined, search);
        setCommunityCircuits(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch circuits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircuits();
  }, [activeTab, user]);

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      await circuitService.deleteCircuit(id);
      setMyCircuits((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const handleDuplicate = async (circ: CircuitRecord) => {
    try {
      const dup = await circuitService.duplicateCircuit(circ.circuit_data, `${circ.title} (Copy)`);
      setMyCircuits((prev) => [dup, ...prev]);
    } catch (err: any) {
      alert(`Duplicate failed: ${err.message}`);
    }
  };

  const filteredMy = myCircuits.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">Circuit Cloud Repository</h2>
              <p className="text-xs text-slate-400">
                Manage, load, restore versions, and explore digital circuits
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar & Search */}
        <div className="px-4 sm:px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'mine'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              My Circuits ({myCircuits.length})
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === 'community'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:bg-slate-800/60'
              }`}
            >
              Community Gallery
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search circuits..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg border outline-none text-xs ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                  : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-blue-500'
              }`}
            />
          </div>
        </div>

        {/* Body / List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!user && activeTab === 'mine' ? (
            <div className="text-center py-12 space-y-3">
              <Lock className="w-10 h-10 mx-auto text-slate-500" />
              <h3 className="font-bold text-sm">Sign in to access your cloud circuits</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Authenticate with Supabase to save unlimited circuits, access revision history, and share links.
              </p>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('signin');
                  }}
                  className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                >
                  Sign In / Sign Up
                </button>
              )}
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-slate-400 text-xs">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading circuit repositories...</span>
            </div>
          ) : activeTab === 'mine' && filteredMy.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Cpu className="w-10 h-10 mx-auto text-slate-500" />
              <h3 className="font-bold text-sm">No saved circuits found</h3>
              <p className="text-xs text-slate-400">
                You haven't saved any circuits yet. Click "Save to Cloud" in the top bar to save your current canvas!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {(activeTab === 'mine' ? filteredMy : communityCircuits).map((circ) => {
                const compCount = circ.circuit_data?.components?.length || 0;
                const wireCount = circ.circuit_data?.wires?.length || 0;
                const isCurrent = currentCircuit.id === circ.id;

                return (
                  <div
                    key={circ.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                      isCurrent
                        ? 'border-blue-500/60 bg-blue-500/5'
                        : isDarkMode
                        ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm line-clamp-1">{circ.title}</h4>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-mono uppercase font-bold shrink-0">
                              Active
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 shrink-0 ${
                          circ.visibility === 'public'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-700/50 text-slate-400'
                        }`}>
                          {circ.visibility === 'public' ? <Globe className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
                          {circ.visibility}
                        </span>
                      </div>

                      {circ.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                          {circ.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-3 text-[11px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-blue-400" /> {compCount} gates
                        </span>
                        <span className="flex items-center gap-1">
                          &bull; {wireCount} wires
                        </span>
                        <span className="flex items-center gap-1 ml-auto">
                          <Calendar className="w-3 h-3" /> {new Date(circ.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          onLoadCircuit(circ.circuit_data);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Load to Canvas
                      </button>

                      <div className="flex items-center gap-1">
                        {activeTab === 'mine' && (
                          <>
                            <button
                              onClick={() => {
                                onOpenShare(circ.id);
                                onClose();
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-blue-400 transition-colors"
                              title="Share Circuit"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                onOpenVersions(circ.id);
                                onClose();
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-blue-400 transition-colors"
                              title="Version History"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDuplicate(circ)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-blue-400 transition-colors"
                              title="Duplicate Circuit"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(circ.id, circ.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                              title="Delete Circuit"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {activeTab === 'community' && user && (
                          <button
                            onClick={() => handleDuplicate(circ)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700/50 text-slate-300 font-semibold text-xs flex items-center gap-1"
                            title="Fork circuit to your workspace"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Fork
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
