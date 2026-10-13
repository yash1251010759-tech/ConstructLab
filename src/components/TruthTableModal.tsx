import React, { useState } from 'react';
import { ComponentItem, Wire } from '../types/circuit';
import { generateTruthTable } from '../utils/circuitEngine';
import { X, Table, Download, Copy, Check, Search } from 'lucide-react';

interface TruthTableModalProps {
  components: ComponentItem[];
  wires: Wire[];
  onClose: () => void;
  isDarkMode: boolean;
}

export const TruthTableModal: React.FC<TruthTableModalProps> = ({
  components,
  wires,
  onClose,
  isDarkMode,
}) => {
  const [copied, setCopied] = useState(false);
  const [filterText, setFilterText] = useState('');

  const tableData = generateTruthTable(components, wires);

  const handleCopy = () => {
    if (tableData.rows.length === 0) return;

    let csv = [...tableData.inputNames, ...tableData.outputNames].join(',') + '\n';
    tableData.rows.forEach((r) => {
      const rowVals = [
        ...tableData.inputNames.map((i) => r.inputs[i]),
        ...tableData.outputNames.map((o) => r.outputs[o]),
      ];
      csv += rowVals.join(',') + '\n';
    });

    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCSV = () => {
    if (tableData.rows.length === 0) return;

    let csv = [...tableData.inputNames, ...tableData.outputNames].join(',') + '\n';
    tableData.rows.forEach((r) => {
      const rowVals = [
        ...tableData.inputNames.map((i) => r.inputs[i]),
        ...tableData.outputNames.map((o) => r.outputs[o]),
      ];
      csv += rowVals.join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'truth_table.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredRows = tableData.rows.filter((r) => {
    if (!filterText) return true;
    const str = [
      ...tableData.inputNames.map((i) => r.inputs[i]),
      ...tableData.outputNames.map((o) => r.outputs[o]),
    ].join('');
    return str.includes(filterText);
  });

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl flex flex-col max-h-[85vh] ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base">Combinational Truth Table</h2>
              <p className="text-xs text-slate-400">
                Auto-evaluating input vs output logic vector state space ({tableData.rows.length} combinations)
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-800/30">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Filter state (e.g. 101)..."
              className={`w-full pl-8 pr-3 py-1.5 rounded-lg text-xs border outline-none ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-teal-500'
                  : 'bg-slate-100 border-slate-300 text-slate-800 focus:border-teal-500'
              }`}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
                isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied CSV' : 'Copy CSV'}</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {tableData.rows.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No input/output pairs found on canvas. Add an Input Switch/Clock and an LED Output to generate a Truth Table.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={isDarkMode ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                    <th className="p-2.5 font-bold uppercase text-[10px] tracking-wider text-slate-400 w-12 text-center">#</th>
                    {tableData.inputNames.map((name) => (
                      <th key={name} className="p-2.5 font-bold text-emerald-400 border-l border-slate-800 text-center">
                        IN: {name}
                      </th>
                    ))}
                    {tableData.outputNames.map((name) => (
                      <th key={name} className="p-2.5 font-bold text-teal-400 border-l border-slate-800 text-center">
                        OUT: {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {filteredRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`hover:bg-teal-500/5 transition-colors ${
                        idx % 2 === 0 ? (isDarkMode ? 'bg-slate-900' : 'bg-white') : (isDarkMode ? 'bg-slate-900/40' : 'bg-slate-50')
                      }`}
                    >
                      <td className="p-2 text-center text-slate-500 font-sans">{idx + 1}</td>
                      {tableData.inputNames.map((iName) => (
                        <td key={iName} className="p-2 border-l border-slate-800 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold ${
                              row.inputs[iName] === 1
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {row.inputs[iName]}
                          </span>
                        </td>
                      ))}
                      {tableData.outputNames.map((oName) => (
                        <td key={oName} className="p-2 border-l border-slate-800 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold ${
                              row.outputs[oName] === 1
                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {row.outputs[oName]}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
