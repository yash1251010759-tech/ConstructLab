import React from 'react';
import { ComponentItem, WaveformSample } from '../types/circuit';
import { X, Activity, Trash2, Pause, Play } from 'lucide-react';

interface WaveformScopeProps {
  components: ComponentItem[];
  history: WaveformSample[];
  isRecording: boolean;
  setIsRecording: (rec: boolean) => void;
  onClearHistory: () => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const WaveformScope: React.FC<WaveformScopeProps> = ({
  components,
  history,
  isRecording,
  setIsRecording,
  onClearHistory,
  onClose,
  isDarkMode,
}) => {
  // Trackable components (inputs, clocks, LEDs, FlipFlops)
  const trackedComps = components.filter((c) =>
    ['INPUT_SWITCH', 'CLOCK', 'LED', 'D_FLIP_FLOP', 'JK_FLIP_FLOP', 'COUNTER_4BIT'].includes(c.type)
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 h-64 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md z-40 flex flex-col select-none">
      {/* Scope Toolbar */}
      <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h3 className="font-bold text-xs text-slate-200">Digital Logic Analyzer Waveform Scope</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
            {history.length} samples
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
              isRecording ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-600 text-white'
            }`}
          >
            {isRecording ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRecording ? 'Pause Scope' : 'Resume Scope'}</span>
          </button>

          <button
            onClick={onClearHistory}
            className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-rose-400 transition-colors"
            title="Clear Waveform History"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Waveform Channels List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono">
        {trackedComps.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">
            No active signals to display. Add switches, clock generators, or LEDs to visualize live waveforms.
          </div>
        ) : (
          trackedComps.map((comp, idx) => {
            const color = ['#10B981', '#38BDF8', '#F59E0B', '#EC4899', '#A855F7'][idx % 5];
            const maxSamples = 60;
            const recentSamples = history.slice(-maxSamples);

            return (
              <div key={comp.id} className="flex items-center gap-3">
                {/* Channel Label */}
                <div className="w-32 shrink-0">
                  <div className="text-xs font-bold truncate text-slate-200">{comp.label || comp.type}</div>
                  <div className="text-[10px] text-slate-500 uppercase">{comp.type}</div>
                </div>

                {/* SVG Digital Waveform Plotter */}
                <div className="flex-1 h-10 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden">
                  <svg className="w-full h-full block">
                    {/* Grid line */}
                    <line x1="0" y1="20" x2="100%" y2="20" stroke="#1E293B" strokeDasharray="2 2" />

                    {/* Digital Square Signal Line */}
                    {recentSamples.length > 1 && (
                      <path
                        d={buildSquareWavePath(recentSamples, comp.id)}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                      />
                    )}
                  </svg>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Generate Step/Square Path string from signal history
function buildSquareWavePath(samples: WaveformSample[], compId: string): string {
  const width = 800;
  const height = 40;
  const highY = 8;
  const lowY = 32;

  const stepX = width / (samples.length - 1 || 1);
  let path = '';

  samples.forEach((sample, idx) => {
    const val = sample.signals[compId] === 1 ? 1 : 0;
    const x = idx * stepX;
    const y = val === 1 ? highY : lowY;

    if (idx === 0) {
      path += `M ${x} ${y}`;
    } else {
      const prevVal = samples[idx - 1].signals[compId] === 1 ? 1 : 0;
      const prevY = prevVal === 1 ? highY : lowY;
      // Step transition
      path += ` L ${x} ${prevY} L ${x} ${y}`;
    }
  });

  return path;
}
