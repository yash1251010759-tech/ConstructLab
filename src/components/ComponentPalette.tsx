import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, ToggleLeft, Cpu, Radio, Layers, RefreshCw, Box } from 'lucide-react';
import { COMPONENT_CATALOG } from '../utils/circuitEngine';
import { ComponentCategory, ComponentType } from '../types/circuit';

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void;
  isDarkMode: boolean;
}

const CATEGORY_META: Record<ComponentCategory, { label: string; icon: React.ReactNode }> = {
  inputs: { label: 'Input Controls', icon: <ToggleLeft className="w-4 h-4 text-emerald-400" /> },
  outputs: { label: 'Outputs & Displays', icon: <Radio className="w-4 h-4 text-amber-400" /> },
  gates: { label: 'Logic Gates', icon: <Cpu className="w-4 h-4 text-sky-400" /> },
  combinational: { label: 'Combinational Logic', icon: <Layers className="w-4 h-4 text-purple-400" /> },
  sequential: { label: 'Sequential & Memory', icon: <RefreshCw className="w-4 h-4 text-rose-400" /> },
  misc: { label: 'Labels & Wiring', icon: <Box className="w-4 h-4 text-slate-400" /> },
};

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddComponent, isDarkMode }) => {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const catalogList = Object.values(COMPONENT_CATALOG);

  const filteredList = catalogList.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
  );

  const categories: ComponentCategory[] = ['inputs', 'outputs', 'gates', 'combinational', 'sequential', 'misc'];

  return (
    <aside
      className={`w-64 border-r flex flex-col h-[calc(100vh-4rem)] select-none shrink-0 ${
        isDarkMode ? 'bg-[#111827] border-slate-800 text-slate-200' : 'bg-slate-100/80 border-slate-200 text-slate-900'
      }`}
    >
      {/* Header & Search */}
      <div className={`p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <span className={`text-[10px] font-extrabold uppercase tracking-widest block mb-2.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`}>
          Components Library
        </span>
        <div className="relative">
          <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className={`w-full pl-8 pr-3 py-1.5 rounded text-xs border outline-none font-medium transition-colors ${
              isDarkMode
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 placeholder-slate-500 focus:border-blue-500'
                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500 focus:border-blue-600 shadow-2xs'
            }`}
          />
        </div>
      </div>

      {/* Accordion Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {categories.map((cat) => {
          const items = filteredList.filter((item) => item.category === cat);
          if (items.length === 0) return null;

          const isCollapsed = collapsed[cat];

          return (
            <div
              key={cat}
              className={`rounded border overflow-hidden transition-all ${
                isDarkMode ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-white shadow-2xs'
              }`}
            >
              <button
                onClick={() => toggleCategory(cat)}
                className={`w-full px-3 py-2 flex items-center justify-between text-xs font-semibold text-left transition-colors ${
                  isDarkMode
                    ? 'bg-slate-800/40 hover:bg-slate-800/80 text-slate-200'
                    : 'bg-slate-200/70 hover:bg-slate-200 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {CATEGORY_META[cat].icon}
                  <span
                    className={`text-[11px] font-bold tracking-wide uppercase ${
                      isDarkMode ? 'text-slate-300' : 'text-slate-900'
                    }`}
                  >
                    {CATEGORY_META[cat].label}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                      isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-300 text-slate-800'
                    }`}
                  >
                    {items.length}
                  </span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`} />
                ) : (
                  <ChevronDown className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-700'}`} />
                )}
              </button>

              {!isCollapsed && (
                <div className="p-2 grid grid-cols-1 gap-1.5">
                  {items.map((item) => (
                    <div
                      key={item.type}
                      onClick={() => onAddComponent(item.type)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('componentType', item.type);
                      }}
                      className={`p-2.5 rounded border transition-all cursor-move flex items-center justify-between group ${
                        isDarkMode
                          ? 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-blue-500'
                          : 'bg-slate-50 border-slate-200 hover:bg-blue-50/60 hover:border-blue-500 text-slate-900'
                      }`}
                    >
                      <div className="flex-1">
                        <div
                          className={`text-[11px] uppercase font-bold transition-colors ${
                            isDarkMode
                              ? 'text-slate-300 group-hover:text-blue-400'
                              : 'text-slate-900 group-hover:text-blue-600'
                          }`}
                        >
                          {item.name}
                        </div>
                        <div
                          className={`text-[10px] line-clamp-1 ${
                            isDarkMode ? 'text-slate-500' : 'text-slate-600 font-medium'
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>
                      <div
                        className={`text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity ml-1 ${
                          isDarkMode ? 'text-blue-400' : 'text-blue-600'
                        }`}
                      >
                        +
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};
