import React, { useState } from 'react';
import { CircuitData } from '../types/circuit';
import {
  downloadPNG,
  downloadSVG,
  downloadJSON,
  downloadVerilog,
  downloadPDFReport,
  ExportOptions,
} from '../utils/exportUtils';
import { X, Image, FileCode, FileText, Download, Code } from 'lucide-react';

interface ExportModalProps {
  circuit: CircuitData;
  onClose: () => void;
  isDarkMode: boolean;
}

export const ExportModal: React.FC<ExportModalProps> = ({ circuit, onClose, isDarkMode }) => {
  const [filename, setFilename] = useState(
    (circuit.title || 'circuit_diagram').toLowerCase().replace(/[^a-z0-9_]/g, '_')
  );
  const [includeTitle, setIncludeTitle] = useState(true);
  const [watermark, setWatermark] = useState(true);
  const [dpiScale, setDpiScale] = useState(2);

  const options: ExportOptions = {
    includeTitle,
    watermark,
    dpiMultiplier: dpiScale,
    backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
  };

  const getSvgElement = (): SVGSVGElement | null => {
    return document.getElementById('circuit-canvas-svg') as unknown as SVGSVGElement;
  };

  const handleExportPNG = () => {
    const svgEl = getSvgElement();
    if (svgEl) {
      downloadPNG(svgEl, filename, options);
    }
  };

  const handleExportSVG = () => {
    const svgEl = getSvgElement();
    if (svgEl) {
      downloadSVG(svgEl, filename, options);
    }
  };

  const handleExportJSON = () => {
    downloadJSON(circuit, filename);
  };

  const handleExportVerilog = () => {
    downloadVerilog(circuit, filename);
  };

  const handleExportPDF = () => {
    downloadPDFReport(circuit, filename);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-5 sm:p-6 space-y-5 sm:space-y-6 ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">Export Circuit Diagram</h2>
              <p className="text-xs text-slate-400">
                Choose format for homework submissions, papers, or digital preservation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filename & Config */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-400 block mb-1">Export File Name</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border outline-none font-mono ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-emerald-500'
                  : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-emerald-500'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTitle}
                onChange={(e) => setIncludeTitle(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>Include Diagram Title Header</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={watermark}
                onChange={(e) => setWatermark(e.target.checked)}
                className="accent-emerald-500 rounded"
              />
              <span>Include Studio Watermark</span>
            </label>
          </div>
        </div>

        {/* Export Formats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* PNG Image */}
          <button
            onClick={handleExportPNG}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all group ${
              isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-emerald-500/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">PNG Image (.png)</div>
              <div className="text-[11px] text-slate-400">High resolution raster graphic</div>
            </div>
          </button>

          {/* SVG Vector */}
          <button
            onClick={handleExportSVG}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all group ${
              isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-sky-500/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-slate-950 transition-colors">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">SVG Vector (.svg)</div>
              <div className="text-[11px] text-slate-400">Scalable vector for publications</div>
            </div>
          </button>

          {/* JSON File */}
          <button
            onClick={handleExportJSON}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all group ${
              isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-teal-500/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">JSON Workspace (.json)</div>
              <div className="text-[11px] text-slate-400">Save project to reload later</div>
            </div>
          </button>

          {/* PDF Report */}
          <button
            onClick={handleExportPDF}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all group ${
              isDarkMode ? 'bg-slate-800/40 border-slate-800 hover:bg-slate-800 hover:border-purple-500/50' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-slate-950 transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs">PDF Report Sheet</div>
              <div className="text-[11px] text-slate-400">Printable truth table report</div>
            </div>
          </button>
        </div>

        {/* Verilog HDL Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-emerald-400">Hardware Description Language</div>
            <div className="text-[11px] text-slate-400">Export synthesizable Verilog module (.v)</div>
          </div>
          <button
            onClick={handleExportVerilog}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Export Verilog
          </button>
        </div>
      </div>
    </div>
  );
};
