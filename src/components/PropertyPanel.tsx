import React from 'react';
import { ComponentItem, Wire } from '../types/circuit';
import { RotateCw, Copy, Trash2, X, Activity } from 'lucide-react';

interface PropertyPanelProps {
  selectedComponent: ComponentItem | null;
  selectedWire: Wire | null;
  onUpdateComponent: (comp: ComponentItem) => void;
  onDeleteComponent: (id: string) => void;
  onDuplicateComponent: (comp: ComponentItem) => void;
  onDeleteWire: (id: string) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedComponent,
  selectedWire,
  onUpdateComponent,
  onDeleteComponent,
  onDuplicateComponent,
  onDeleteWire,
  onClose,
  isDarkMode,
}) => {
  if (!selectedComponent && !selectedWire) {
    return (
      <aside
        className={`w-72 border-l flex flex-col h-[calc(100vh-4rem)] select-none shrink-0 ${
          isDarkMode ? 'bg-[#1E293B] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}
      >
        <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}>
            Properties
          </span>
        </div>
        <div className={`p-6 text-xs flex-1 flex flex-col items-center justify-center text-center ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
          <div className={`p-3 rounded-full mb-3 font-mono text-sm ${isDarkMode ? 'bg-slate-800/60 text-slate-400' : 'bg-slate-200 text-slate-700'}`}>
            &Omega;
          </div>
          <p className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>No element selected</p>
          <p className={`text-[11px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
            Select any gate, switch, or wire on the canvas to inspect and modify properties.
          </p>
        </div>
        <div className={`p-4 mt-auto border-t ${isDarkMode ? 'bg-blue-600/5 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Live Simulation Active
            </span>
          </div>
        </div>
      </aside>
    );
  }

  if (selectedWire) {
    return (
      <aside
        className={`w-72 border-l flex flex-col justify-between h-[calc(100vh-4rem)] select-none shrink-0 ${
          isDarkMode ? 'bg-[#1E293B] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}
      >
        <div className="p-4 space-y-4 flex-1">
          <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
              <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}>
                Properties
              </span>
              <h3 className={`font-bold text-base mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                Wire Connection
              </h3>
            </div>
            <button onClick={onClose} className={`p-1 rounded ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}>
              <X className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className={isDarkMode ? 'text-slate-400' : 'text-slate-700 font-medium'}>Signal Value</span>
              <span
                className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  selectedWire.value === 1
                    ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-400'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                LOGIC {selectedWire.value}
              </span>
            </div>

            <div className={`p-3 rounded border ${isDarkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-white border-slate-200'}`}>
              <span className={`text-[10px] uppercase font-mono block mb-1 font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                Connection Identifier
              </span>
              <span className={`font-mono text-xs break-all ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
                {selectedWire.id}
              </span>
            </div>
          </div>
        </div>

        <div className={`p-4 border-t space-y-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => onDeleteWire(selectedWire.id)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold border border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Wire Connection
          </button>
          <div className={`p-3 rounded border flex items-center gap-2.5 ${isDarkMode ? 'bg-blue-600/5 border-blue-500/20' : 'bg-slate-100 border-slate-200'}`}>
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
              Live Simulation Active
            </span>
          </div>
        </div>
      </aside>
    );
  }

  const comp = selectedComponent!;

  const handleLabelChange = (newLabel: string) => {
    onUpdateComponent({ ...comp, label: newLabel });
  };

  const handleRotate = () => {
    const nextRot = ((comp.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    onUpdateComponent({ ...comp, rotation: nextRot });
  };

  return (
    <aside
      className={`w-72 border-l flex flex-col justify-between h-[calc(100vh-4rem)] select-none shrink-0 ${
        isDarkMode ? 'bg-[#1E293B] border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}
    >
      <div className="p-4 space-y-5 overflow-y-auto flex-1">
        <div className={`flex items-center justify-between pb-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <div>
            <span className={`text-[10px] font-extrabold uppercase tracking-widest block ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}>
              Selected Element
            </span>
            <h3 className={`font-bold text-base mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {comp.label || comp.type}
            </h3>
          </div>
          <button onClick={onClose} className={`p-1 rounded ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}>
            <X className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
          </button>
        </div>

        {/* Component Label */}
        <div className="space-y-1.5">
          <label className={`text-[10px] uppercase font-bold block ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
            Label Text
          </label>
          <input
            type="text"
            value={comp.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            className={`w-full px-2.5 py-1.5 rounded text-xs border outline-none font-medium ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-2xs'
            }`}
          />
        </div>

        {/* Quick Actions: Rotate & Duplicate */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRotate}
            className={`flex items-center justify-center gap-1.5 py-2 rounded border text-xs font-bold transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800 shadow-2xs'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-500" />
            <span>Rotate {comp.rotation}°</span>
          </button>

          <button
            onClick={() => onDuplicateComponent(comp)}
            className={`flex items-center justify-center gap-1.5 py-2 rounded border text-xs font-bold transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200'
                : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-800 shadow-2xs'
            }`}
          >
            <Copy className="w-3.5 h-3.5 text-blue-500" />
            <span>Duplicate</span>
          </button>
        </div>

        {/* Type Specific State Editors */}
        {comp.type === 'INPUT_SWITCH' && (
          <div className={`p-3 rounded border space-y-2 ${isDarkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
            <div className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              Switch Initial State
            </div>
            <button
              onClick={() =>
                onUpdateComponent({
                  ...comp,
                  state: { ...comp.state, isOn: !comp.state.isOn },
                })
              }
              className={`w-full py-2 rounded font-bold text-xs transition-colors ${
                comp.state.isOn
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : isDarkMode
                  ? 'bg-slate-700 text-slate-300'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {comp.state.isOn ? 'HIGH (Logic 1)' : 'LOW (Logic 0)'}
            </button>
          </div>
        )}

        {comp.type === 'CLOCK' && (
          <div className={`p-3 rounded border space-y-2 ${isDarkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
            <div className={`flex justify-between text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              <span>Clock Frequency</span>
              <span className="text-blue-500 font-mono font-bold">{comp.state.clockFreqHz || 2} Hz</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={comp.state.clockFreqHz || 2}
              onChange={(e) =>
                onUpdateComponent({
                  ...comp,
                  state: { ...comp.state, clockFreqHz: Number(e.target.value) },
                })
              }
              className="w-full accent-blue-600"
            />
          </div>
        )}

        {comp.type === 'HEX_INPUT' && (
          <div className={`p-3 rounded border space-y-2 ${isDarkMode ? 'border-slate-800 bg-slate-800/40' : 'border-slate-200 bg-white'}`}>
            <div className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              Hex Value (0 - F)
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((val) => (
                <button
                  key={val}
                  onClick={() =>
                    onUpdateComponent({
                      ...comp,
                      state: { ...comp.state, hexVal: val },
                    })
                  }
                  className={`py-1 rounded text-xs font-mono font-bold transition-colors ${
                    comp.state.hexVal === val
                      ? 'bg-blue-600 text-white'
                      : isDarkMode
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  {val.toString(16).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {comp.type === 'LABEL_TEXT' && (
          <div className="space-y-1">
            <label className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              Annotation Text
            </label>
            <textarea
              rows={3}
              value={comp.state.customText || ''}
              onChange={(e) =>
                onUpdateComponent({
                  ...comp,
                  state: { ...comp.state, customText: e.target.value },
                })
              }
              className={`w-full p-2 rounded text-xs border outline-none font-medium ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-2xs'
              }`}
            />
          </div>
        )}

        {/* Ports Signal Inspection Table */}
        <div className="space-y-2">
          <div className={`text-[10px] font-bold uppercase flex items-center gap-1 tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Port Signals</span>
          </div>
          <div className={`rounded border overflow-hidden divide-y text-xs ${
            isDarkMode ? 'border-slate-800 divide-slate-800 bg-slate-900/40' : 'border-slate-200 divide-slate-200 bg-white'
          }`}>
            {comp.ports.map((p) => (
              <div key={p.id} className="p-2 flex items-center justify-between">
                <div>
                  <span className={`font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-900'}`}>{p.name}</span>
                  <span className={`text-[10px] ml-1 font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>({p.type})</span>
                </div>
                <span
                  className={`font-mono font-bold px-1.5 py-0.5 rounded text-[11px] ${
                    p.value === 1
                      ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30'
                      : p.value === 'Z'
                      ? 'bg-amber-500/20 text-amber-500'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-400'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {p.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`p-4 border-t space-y-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <button
          onClick={() => onDeleteComponent(comp.id)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-xs font-semibold border border-rose-500/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Component
        </button>

        <div className={`p-3 rounded border flex items-center gap-2.5 ${isDarkMode ? 'bg-blue-600/5 border-blue-500/20' : 'bg-slate-100 border-slate-200'}`}>
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)] animate-pulse"></div>
          <span className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
            Live Simulation Active
          </span>
        </div>
      </div>
    </aside>
  );
};
