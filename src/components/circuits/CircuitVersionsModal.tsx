import React, { useState, useEffect } from 'react';
import { versionService, CircuitVersionRecord } from '../../services/versionService';
import { CircuitData } from '../../types/circuit';
import { X, History, RotateCcw, Calendar, Cpu, AlertCircle } from 'lucide-react';

interface CircuitVersionsModalProps {
  circuitId: string;
  onRestoreVersion: (circuit: CircuitData) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const CircuitVersionsModal: React.FC<CircuitVersionsModalProps> = ({
  circuitId,
  onRestoreVersion,
  onClose,
  isDarkMode,
}) => {
  const [versions, setVersions] = useState<CircuitVersionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    versionService
      .getVersions(circuitId)
      .then((data) => {
        if (mounted) setVersions(data);
      })
      .catch((err) => {
        if (mounted) setErrorMsg(err.message || 'Failed to load versions');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [circuitId]);

  const handleRestore = async (v: CircuitVersionRecord) => {
    if (
      !window.confirm(
        `Are you sure you want to restore Version ${v.version_number}? Current unsaved edits will be replaced.`
      )
    ) {
      return;
    }

    try {
      const restored = await versionService.restoreVersion(circuitId, v.version_number);
      onRestoreVersion(restored);
      onClose();
    } catch (err: any) {
      alert(`Failed to restore version: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className={`w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Circuit Revision History</h3>
              <p className="text-xs text-slate-400">Restore previous logic states and milestones</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400 text-xs">
              <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading historical snapshots...</span>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No historical revisions available for this circuit yet.
            </div>
          ) : (
            versions.map((v, index) => {
              const compCount = v.circuit_data?.components?.length || 0;
              const isLatest = index === 0;

              return (
                <div
                  key={v.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                    isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        v{v.version_number}
                      </span>
                      {isLatest && (
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                          (Current Active)
                        </span>
                      )}
                      <span className="text-xs font-semibold text-slate-300">
                        {v.change_summary || 'Saved revision'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(v.created_at).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-purple-400" />
                        {compCount} components
                      </span>
                    </div>
                  </div>

                  {!isLatest && (
                    <button
                      onClick={() => handleRestore(v)}
                      className="px-3 py-1.5 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restore
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
