import React, { useState, useEffect } from 'react';
import { sharingService, CircuitShareRecord } from '../../services/sharingService';
import { X, Share2, Copy, Check, ShieldAlert, Link as LinkIcon, Trash2, Clock } from 'lucide-react';

interface ShareCircuitModalProps {
  circuitId: string;
  circuitTitle: string;
  onClose: () => void;
  isDarkMode: boolean;
}

export const ShareCircuitModal: React.FC<ShareCircuitModalProps> = ({
  circuitId,
  circuitTitle,
  onClose,
  isDarkMode,
}) => {
  const [shares, setShares] = useState<CircuitShareRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [expiryDays, setExpiryDays] = useState<number>(0);
  const [generating, setGenerating] = useState(false);

  const fetchShares = async () => {
    try {
      const data = await sharingService.getCircuitShares(circuitId);
      setShares(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
  }, [circuitId]);

  const handleCreateShare = async () => {
    setGenerating(true);
    try {
      const newShare = await sharingService.createShareLink(circuitId, 'read_only', expiryDays);
      setShares((prev) => [newShare, ...prev]);
      handleCopy(newShare.share_token);
    } catch (err: any) {
      alert(`Failed to create share link: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (token: string) => {
    const url = `${window.location.origin}?share=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleRevoke = async (shareId: string) => {
    if (!window.confirm('Revoke this share link? Anyone using it will immediately lose access.')) return;
    try {
      await sharingService.revokeShare(shareId);
      setShares((prev) => prev.filter((s) => s.id !== shareId));
    } catch (err: any) {
      alert(`Revoke failed: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl p-5 sm:p-6 space-y-5 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Share "{circuitTitle}"</h3>
              <p className="text-xs text-slate-400">Create read-only links for students, professors, or collaborators</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Generate Link Control */}
        <div className={`p-4 rounded-xl border space-y-3 ${
          isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Link Expiration:</span>
            <select
              value={expiryDays}
              onChange={(e) => setExpiryDays(Number(e.target.value))}
              className={`px-2.5 py-1 rounded-lg border text-xs outline-none ${
                isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value={0}>Never expires</option>
              <option value={7}>Expires in 7 days</option>
              <option value={30}>Expires in 30 days</option>
            </select>
          </div>

          <button
            onClick={handleCreateShare}
            disabled={generating}
            className="w-full py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <LinkIcon className="w-4 h-4" />
            {generating ? 'Generating Secure Token...' : 'Generate New Share Link'}
          </button>
        </div>

        {/* Existing Active Links */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Share Links</h4>
          {loading ? (
            <div className="text-center py-6 text-xs text-slate-400">Loading links...</div>
          ) : shares.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              No active share links. Click above to generate one.
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {shares.map((s) => {
                const shareUrl = `${window.location.origin}?share=${s.share_token}`;
                const isCopied = copiedToken === s.share_token;

                return (
                  <div
                    key={s.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-2 text-xs ${
                      isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="truncate flex-1">
                      <div className="font-mono text-[11px] text-blue-400 truncate">{shareUrl}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-semibold text-emerald-400">Read-Only</span>
                        {s.expires_at ? (
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Expires {new Date(s.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span>Never expires</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleCopy(s.share_token)}
                        className={`px-2.5 py-1.5 rounded-lg font-bold flex items-center gap-1 text-[11px] transition-colors ${
                          isCopied
                            ? 'bg-emerald-500 text-white'
                            : isDarkMode
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-white hover:bg-slate-200 text-slate-800 border'
                        }`}
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>

                      <button
                        onClick={() => handleRevoke(s.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                        title="Revoke Share Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
