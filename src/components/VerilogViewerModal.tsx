import React, { useState } from 'react';
import { CircuitData } from '../types/circuit';
import { generateVerilogHDL } from '../utils/circuitEngine';
import { downloadVerilog } from '../utils/exportUtils';
import { X, Code2, Copy, Check, Download } from 'lucide-react';

interface VerilogViewerModalProps {
  circuit: CircuitData;
  onClose: () => void;
  isDarkMode: boolean;
}

export const VerilogViewerModal: React.FC<VerilogViewerModalProps> = ({
  circuit,
  onClose,
  isDarkMode,
}) => {
  const [copied, setCopied] = useState(false);
  const verilogCode = generateVerilogHDL(circuit.title, circuit.components, circuit.wires);

  const handleCopy = () => {
    navigator.clipboard.writeText(verilogCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = (circuit.title || 'digital_circuit').toLowerCase().replace(/[^a-z0-9_]/g, '_');
    downloadVerilog(circuit, filename);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[85vh] ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">Verilog HDL Hardware Description</h2>
              <p className="text-xs text-slate-400">Synthesizable Verilog module for FPGA/ASIC logic design</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-end gap-2 bg-slate-800/30">
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Code' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .v File</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs">
          <pre className="p-4 rounded-xl border border-slate-800 bg-slate-950 text-emerald-400 overflow-x-auto leading-relaxed">
            {verilogCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
