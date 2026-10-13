import React, { useState, useRef, useEffect } from 'react';
import { ComponentItem, ComponentType, Port, SignalState, Wire } from '../types/circuit';
import { COMPONENT_CATALOG } from '../utils/circuitEngine';
import { Trash2, Copy, RotateCw, X, Zap, Plus, Sliders, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface CircuitCanvasProps {
  components: ComponentItem[];
  wires: Wire[];
  selectedCompId: string | null;
  selectedWireId: string | null;
  onSelectComponent: (id: string | null) => void;
  onSelectWire: (id: string | null) => void;
  onUpdateComponentPosition: (id: string, x: number, y: number) => void;
  onToggleSwitch: (id: string) => void;
  onPressButton: (id: string, isDown: boolean) => void;
  onAddWire: (fromCompId: string, fromPortId: string, toCompId: string, toPortId: string) => void;
  onDropComponentFromPalette: (type: ComponentType, x: number, y: number) => void;
  onDeleteComponent?: (id: string) => void;
  onDuplicateComponent?: (comp: ComponentItem) => void;
  onRotateComponent?: (comp: ComponentItem) => void;
  onDeleteWire?: (id: string) => void;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  isDarkMode: boolean;
}

interface ContextMenuInfo {
  x: number;
  y: number;
  type: 'component' | 'wire' | 'canvas';
  comp?: ComponentItem;
  wire?: Wire;
  canvasCoords?: { x: number; y: number };
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  components,
  wires,
  selectedCompId,
  selectedWireId,
  onSelectComponent,
  onSelectWire,
  onUpdateComponentPosition,
  onToggleSwitch,
  onPressButton,
  onAddWire,
  onDropComponentFromPalette,
  onDeleteComponent,
  onDuplicateComponent,
  onRotateComponent,
  onDeleteWire,
  zoom,
  setZoom,
  pan,
  setPan,
  isDarkMode,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Wire drawing state
  const [wireDraft, setWireDraft] = useState<{
    fromCompId: string;
    fromPortId: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  // Component Drag state
  const [dragState, setDragState] = useState<{
    compId: string;
    startX: number;
    startY: number;
    initialCompX: number;
    initialCompY: number;
  } | null>(null);

  // Canvas Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Context Menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuInfo | null>(null);

  // Close context menu on window click
  useEffect(() => {
    const handleOutsideClick = () => setContextMenu(null);
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Convert mouse screen position to Canvas SVG coordinates
  const getCanvasCoords = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  // Absolute Port Position on Canvas
  const getPortAbsoluteCoords = (comp: ComponentItem, port: Port) => {
    const angleRad = (comp.rotation * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const relX = port.relX;
    const relY = port.relY;

    const rotX = relX * cos - relY * sin;
    const rotY = relX * sin + relY * cos;

    return {
      x: comp.x + rotX,
      y: comp.y + rotY,
    };
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom((prev) => Math.min(Math.max(prev * zoomFactor, 0.4), 3.0));
  };

  // Mouse Down handler for Canvas (Pan, Deselect, etc)
  const handleMouseDown = (e: React.MouseEvent) => {
    setContextMenu(null);

    if (e.button === 1 || e.shiftKey) {
      // Middle click or Shift pan
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (e.target === svgRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectComponent(null);
      onSelectWire(null);
      if (wireDraft) setWireDraft(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e);

    // Update canvas pan
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    // Update dragging component
    if (dragState) {
      const dx = coords.x - dragState.startX;
      const dy = coords.y - dragState.startY;

      // Snap to 10px grid
      const newX = Math.round((dragState.initialCompX + dx) / 10) * 10;
      const newY = Math.round((dragState.initialCompY + dy) / 10) * 10;

      onUpdateComponentPosition(dragState.compId, newX, newY);
      return;
    }

    // Update wire drafting rubber-band line
    if (wireDraft) {
      setWireDraft((prev) => (prev ? { ...prev, x2: coords.x, y2: coords.y } : null));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragState(null);
  };

  // Port click handler for wiring
  const handlePortClick = (e: React.MouseEvent, comp: ComponentItem, port: Port) => {
    e.stopPropagation();
    const portCoords = getPortAbsoluteCoords(comp, port);

    if (!wireDraft) {
      // Start wire
      setWireDraft({
        fromCompId: comp.id,
        fromPortId: port.id,
        x1: portCoords.x,
        y1: portCoords.y,
        x2: portCoords.x,
        y2: portCoords.y,
      });
    } else {
      // Complete wire
      if (wireDraft.fromCompId !== comp.id) {
        onAddWire(wireDraft.fromCompId, wireDraft.fromPortId, comp.id, port.id);
      }
      setWireDraft(null);
    }
  };

  // Drag and Drop from Component Palette
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('componentType') as ComponentType;
    if (type) {
      const coords = getCanvasCoords(e as unknown as React.MouseEvent);
      onDropComponentFromPalette(type, Math.round(coords.x / 10) * 10, Math.round(coords.y / 10) * 10);
    }
  };

  // Context Menu Handlers
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const canvasCoords = getCanvasCoords(e);
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      type: 'canvas',
      canvasCoords,
    });
  };

  const handleComponentContextMenu = (e: React.MouseEvent, comp: ComponentItem) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectComponent(comp.id);
    onSelectWire(null);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      type: 'component',
      comp,
    });
  };

  const handleWireContextMenu = (e: React.MouseEvent, wire: Wire) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectWire(wire.id);
    onSelectComponent(null);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setContextMenu({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      type: 'wire',
      wire,
    });
  };

  // Get wire stroke color based on signal state
  const getSignalColor = (val: SignalState) => {
    if (val === 1) return '#60A5FA'; // Glowing Electric Blue High
    if (val === 'Z') return '#F59E0B'; // High Impedance Amber
    if (val === 'X') return '#EF4444'; // Error Red
    return isDarkMode ? '#475569' : '#94A3B8'; // Dark/Light Low Slate
  };

  // Find currently selected items for floating action bar
  const selectedComp = components.find((c) => c.id === selectedCompId) || null;
  const selectedWire = wires.find((w) => w.id === selectedWireId) || null;

  return (
    <div
      ref={containerRef}
      className={`flex-1 h-[calc(100vh-4rem)] relative overflow-hidden select-none cursor-crosshair ${
        isDarkMode ? 'bg-[#0F172A] text-slate-200' : 'bg-slate-100 text-slate-800'
      }`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onContextMenu={handleCanvasContextMenu}
    >
      <svg
        ref={svgRef}
        id="circuit-canvas-svg"
        className="w-full h-full block"
      >
        <defs>
          {/* Grid Background Pattern */}
          <pattern
            id="canvas-grid"
            width={24 * zoom}
            height={24 * zoom}
            patternUnits="userSpaceOnUse"
            x={pan.x % (24 * zoom)}
            y={pan.y % (24 * zoom)}
          >
            <circle
              cx={2 * zoom}
              cy={2 * zoom}
              r={1.5 * zoom}
              fill={isDarkMode ? '#1E293B' : '#CBD5E1'}
            />
          </pattern>

          {/* Wire Glow Filter */}
          <filter id="glow-high" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Grid */}
        <rect width="100%" height="100%" fill="url(#canvas-grid)" />

        {/* Main Canvas Transform Layer */}
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* 1. RENDER WIRES */}
          {wires.map((wire) => {
            const fromComp = components.find((c) => c.id === wire.fromCompId);
            const toComp = components.find((c) => c.id === wire.toCompId);
            if (!fromComp || !toComp) return null;

            const fromPort = fromComp.ports.find((p) => p.id === wire.fromPortId);
            const toPort = toComp.ports.find((p) => p.id === wire.toPortId);
            if (!fromPort || !toPort) return null;

            const p1 = getPortAbsoluteCoords(fromComp, fromPort);
            const p2 = getPortAbsoluteCoords(toComp, toPort);

            // Orthogonal Bezier wire routing
            const dx = Math.abs(p2.x - p1.x) * 0.5;
            const pathData = `M ${p1.x} ${p1.y} C ${p1.x + dx} ${p1.y}, ${p2.x - dx} ${p2.y}, ${p2.x} ${p2.y}`;

            const isSelected = selectedWireId === wire.id;
            const signalColor = getSignalColor(wire.value);

            return (
              <g
                key={wire.id}
                onClick={(e) => { e.stopPropagation(); onSelectWire(wire.id); }}
                onContextMenu={(e) => handleWireContextMenu(e, wire)}
              >
                {/* Click target hit area */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                  className="cursor-pointer"
                />

                {/* Wire Shadow / Selected halo */}
                {isSelected && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#60A5FA"
                    strokeWidth="6"
                    opacity="0.8"
                  />
                )}

                {/* Main Wire line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={signalColor}
                  strokeWidth={wire.value === 1 ? '3' : '2'}
                  strokeDasharray={wire.value === 'Z' ? '4 4' : 'none'}
                  filter={wire.value === 1 ? 'url(#glow-high)' : undefined}
                />
              </g>
            );
          })}

          {/* Rubberband Wire Draft */}
          {wireDraft && (
            <line
              x1={wireDraft.x1}
              y1={wireDraft.y1}
              x2={wireDraft.x2}
              y2={wireDraft.y2}
              stroke="#60A5FA"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* 2. RENDER COMPONENTS */}
          {components.map((comp) => {
            const isSelected = selectedCompId === comp.id;
            const meta = COMPONENT_CATALOG[comp.type];

            return (
              <g
                key={comp.id}
                transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation})`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(comp.id);
                }}
                onContextMenu={(e) => handleComponentContextMenu(e, comp)}
                onMouseDown={(e) => {
                  if (e.button === 0) {
                    const coords = getCanvasCoords(e);
                    setDragState({
                      compId: comp.id,
                      startX: coords.x,
                      startY: coords.y,
                      initialCompX: comp.x,
                      initialCompY: comp.y,
                    });
                  }
                }}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Selection Halo */}
                {isSelected && (
                  <rect
                    x="-6"
                    y="-6"
                    width={meta.width + 12}
                    height={meta.height + 12}
                    rx="8"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                )}

                {/* Render Component Body Vector */}
                {renderComponentSvgBody(comp, isDarkMode, onToggleSwitch, onPressButton)}

                {/* Component Label */}
                {comp.label && (
                  <text
                    x={meta.width / 2}
                    y={meta.height + 16}
                    textAnchor="middle"
                    fill={isDarkMode ? '#94A3B8' : '#475569'}
                    fontSize="10"
                    fontWeight="600"
                    className="pointer-events-none select-none font-mono"
                  >
                    {comp.label}
                  </text>
                )}

                {/* Render Component Ports */}
                {comp.ports.map((port) => {
                  const portVal = port.value;
                  const portColor = getSignalColor(portVal);

                  return (
                    <g
                      key={port.id}
                      transform={`translate(${port.relX}, ${port.relY})`}
                      onClick={(e) => handlePortClick(e, comp, port)}
                      className="cursor-pointer group"
                    >
                      {/* Hover ring */}
                      <circle
                        r="8"
                        fill="transparent"
                        className="group-hover:fill-blue-500/30 transition-all"
                      />
                      {/* Port Pin Dot */}
                      <circle
                        r="4"
                        fill={portColor}
                        stroke={isDarkMode ? '#0F172A' : '#FFFFFF'}
                        strokeWidth="1.5"
                      />
                      {/* Port Name Tooltip */}
                      <title>{`${port.name} (${port.type.toUpperCase()}): ${portVal}`}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>

      {/* 3. FLOATING ACTION TOOLBAR ON SELECTED COMPONENT (Inputs, Gates, etc.) */}
      {selectedComp && !dragState && (
        (() => {
          const meta = COMPONENT_CATALOG[selectedComp.type];
          const screenX = selectedComp.x * zoom + pan.x + ((meta?.width || 60) * zoom) / 2;
          const screenY = selectedComp.y * zoom + pan.y - 10;

          return (
            <div
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className={`absolute z-30 flex items-center gap-1.5 p-1.5 rounded-lg shadow-2xl border backdrop-blur-md transition-all ${
                isDarkMode
                  ? 'bg-slate-900/95 border-slate-700 text-slate-200'
                  : 'bg-white/95 border-slate-300 text-slate-800'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Quick Input Toggle for Switches */}
              {selectedComp.type === 'INPUT_SWITCH' && (
                <button
                  onClick={() => onToggleSwitch(selectedComp.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold font-mono transition-colors ${
                    selectedComp.state.isOn
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Toggle Input Value (0 ↔ 1)"
                >
                  <Zap className="w-3 h-3" />
                  <span>{selectedComp.state.isOn ? 'HIGH (1)' : 'LOW (0)'}</span>
                </button>
              )}

              {/* Rotate Button */}
              {onRotateComponent && (
                <button
                  onClick={() => onRotateComponent(selectedComp)}
                  className={`p-1.5 rounded hover:bg-slate-800 hover:text-blue-400 text-slate-400 transition-colors`}
                  title="Rotate (90°)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Duplicate Button */}
              {onDuplicateComponent && (
                <button
                  onClick={() => onDuplicateComponent(selectedComp)}
                  className={`p-1.5 rounded hover:bg-slate-800 hover:text-blue-400 text-slate-400 transition-colors`}
                  title="Duplicate Input/Component"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}

              {/* DELETE BUTTON (Direct on-canvas delete) */}
              {onDeleteComponent && (
                <button
                  onClick={() => onDeleteComponent(selectedComp.id)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 text-xs font-bold transition-all shadow-sm group"
                  title="Delete this input/component (Delete or Backspace key)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="tracking-wide">DELETE</span>
                </button>
              )}

              {/* Close / Deselect */}
              <button
                onClick={() => onSelectComponent(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                title="Deselect"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()
      )}

      {/* 4. FLOATING ACTION TOOLBAR ON SELECTED WIRE */}
      {selectedWire && !dragState && onDeleteWire && (
        (() => {
          const fromComp = components.find((c) => c.id === selectedWire.fromCompId);
          const toComp = components.find((c) => c.id === selectedWire.toCompId);
          const fromPort = fromComp?.ports.find((p) => p.id === selectedWire.fromPortId);
          const toPort = toComp?.ports.find((p) => p.id === selectedWire.toPortId);

          let screenX = 100;
          let screenY = 100;

          if (fromComp && toComp && fromPort && toPort) {
            const p1 = getPortAbsoluteCoords(fromComp, fromPort);
            const p2 = getPortAbsoluteCoords(toComp, toPort);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            screenX = midX * zoom + pan.x;
            screenY = midY * zoom + pan.y - 12;
          }

          return (
            <div
              style={{
                left: `${screenX}px`,
                top: `${screenY}px`,
                transform: 'translate(-50%, -100%)',
              }}
              className={`absolute z-30 flex items-center gap-1.5 p-1.5 rounded-lg shadow-2xl border backdrop-blur-md ${
                isDarkMode
                  ? 'bg-slate-900/95 border-slate-700 text-slate-200'
                  : 'bg-white/95 border-slate-300 text-slate-800'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onDeleteWire(selectedWire.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/15 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 text-xs font-bold transition-all shadow-sm"
                title="Delete Connection Wire (Del key)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="tracking-wide">DELETE WIRE</span>
              </button>
              <button
                onClick={() => onSelectWire(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })()
      )}

      {/* 5. RIGHT-CLICK CONTEXT MENU */}
      {contextMenu && (
        <div
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
          className={`absolute z-50 min-w-[190px] rounded-lg shadow-2xl border py-1.5 text-xs font-medium animate-in fade-in zoom-in-95 duration-100 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'component' && contextMenu.comp && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                {contextMenu.comp.label || contextMenu.comp.type}
              </div>

              {contextMenu.comp.type === 'INPUT_SWITCH' && (
                <button
                  onClick={() => {
                    onToggleSwitch(contextMenu.comp!.id);
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-blue-600/20 hover:text-blue-400 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    Toggle State (0 ↔ 1)
                  </span>
                  <span className="text-[10px] font-mono font-bold text-blue-400">
                    {contextMenu.comp.state.isOn ? 'HIGH' : 'LOW'}
                  </span>
                </button>
              )}

              {onDuplicateComponent && (
                <button
                  onClick={() => {
                    onDuplicateComponent(contextMenu.comp!);
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  Duplicate
                </button>
              )}

              {onRotateComponent && (
                <button
                  onClick={() => {
                    onRotateComponent(contextMenu.comp!);
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-blue-400 transition-colors"
                >
                  <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                  Rotate 90°
                </button>
              )}

              <div className="border-t border-slate-800 my-1" />

              {/* DELETE OPTION IN CONTEXT MENU */}
              {onDeleteComponent && (
                <button
                  onClick={() => {
                    onDeleteComponent(contextMenu.comp!.id);
                    setContextMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left flex items-center justify-between text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Component
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Del</span>
                </button>
              )}
            </>
          )}

          {contextMenu.type === 'wire' && contextMenu.wire && onDeleteWire && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                Wire Connection
              </div>
              <button
                onClick={() => {
                  onDeleteWire(contextMenu.wire!.id);
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center justify-between text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 font-semibold transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Wire
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Del</span>
              </button>
            </>
          )}

          {contextMenu.type === 'canvas' && contextMenu.canvasCoords && (
            <>
              <div className="px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">
                Quick Add Component
              </div>
              <button
                onClick={() => {
                  onDropComponentFromPalette(
                    'INPUT_SWITCH',
                    Math.round(contextMenu.canvasCoords!.x / 10) * 10,
                    Math.round(contextMenu.canvasCoords!.y / 10) * 10
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-blue-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                Add Input Switch
              </button>
              <button
                onClick={() => {
                  onDropComponentFromPalette(
                    'LED',
                    Math.round(contextMenu.canvasCoords!.x / 10) * 10,
                    Math.round(contextMenu.canvasCoords!.y / 10) * 10
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-blue-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-400" />
                Add LED Output
              </button>
              <button
                onClick={() => {
                  onDropComponentFromPalette(
                    'AND',
                    Math.round(contextMenu.canvasCoords!.x / 10) * 10,
                    Math.round(contextMenu.canvasCoords!.y / 10) * 10
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-blue-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                Add AND Gate
              </button>
              <button
                onClick={() => {
                  onDropComponentFromPalette(
                    'OR',
                    Math.round(contextMenu.canvasCoords!.x / 10) * 10,
                    Math.round(contextMenu.canvasCoords!.y / 10) * 10
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-blue-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                Add OR Gate
              </button>
              <button
                onClick={() => {
                  onDropComponentFromPalette(
                    'NOT',
                    Math.round(contextMenu.canvasCoords!.x / 10) * 10,
                    Math.round(contextMenu.canvasCoords!.y / 10) * 10
                  );
                  setContextMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-slate-800 hover:text-blue-400 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                Add NOT Gate
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// SVG Vector Rendering Helper for All Logic Components
function renderComponentSvgBody(
  comp: ComponentItem,
  isDarkMode: boolean,
  onToggleSwitch: (id: string) => void,
  onPressButton: (id: string, isDown: boolean) => void
) {
  const meta = COMPONENT_CATALOG[comp.type];
  const bgFill = isDarkMode ? '#1E293B' : '#FFFFFF';
  const strokeColor = isDarkMode ? '#64748B' : '#334155';

  switch (comp.type) {
    case 'INPUT_SWITCH': {
      const isOn = comp.state.isOn;
      return (
        <g>
          {/* Main switch chassis */}
          <rect
            x="0"
            y="0"
            width="60"
            height="40"
            rx="8"
            fill={bgFill}
            stroke={isOn ? '#3B82F6' : strokeColor}
            strokeWidth="2"
            className="cursor-pointer"
          />
          {/* Interactive Toggle Slider Knob */}
          <rect
            x={isOn ? "32" : "6"}
            y="6"
            width="22"
            height="28"
            rx="6"
            fill={isOn ? '#3B82F6' : '#64748B'}
            className="transition-all cursor-pointer hover:brightness-125"
            onClick={(e) => {
              // Toggle state when clicking knob
              onToggleSwitch(comp.id);
            }}
          />
          {/* Value Display (0 or 1) */}
          <text
            x={isOn ? "16" : "42"}
            y="24"
            textAnchor="middle"
            fill={isOn ? '#60A5FA' : '#94A3B8'}
            fontSize="12"
            fontWeight="bold"
            className="pointer-events-none select-none font-mono"
          >
            {isOn ? '1' : '0'}
          </text>
        </g>
      );
    }

    case 'PUSH_BUTTON': {
      const isOn = comp.state.isOn;
      return (
        <g>
          <rect x="0" y="0" width="60" height="40" rx="8" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <circle
            cx="30"
            cy="20"
            r="12"
            fill={isOn ? '#3B82F6' : '#EF4444'}
            className="transition-all cursor-pointer hover:brightness-110"
            onMouseDown={() => onPressButton(comp.id, true)}
            onMouseUp={() => onPressButton(comp.id, false)}
          />
          <text x="30" y="24" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" className="pointer-events-none">
            BTN
          </text>
        </g>
      );
    }

    case 'CLOCK': {
      return (
        <g>
          <rect x="0" y="0" width="60" height="40" rx="8" fill={bgFill} stroke="#38BDF8" strokeWidth="2" />
          <path d="M 15 26 L 15 14 L 30 14 L 30 26 L 45 26 L 45 14" fill="none" stroke="#38BDF8" strokeWidth="2" />
        </g>
      );
    }

    case 'CONST_HIGH': {
      return (
        <g>
          <rect x="0" y="0" width="50" height="40" rx="6" fill="#3B82F6/10" stroke="#3B82F6" strokeWidth="2" />
          <text x="25" y="25" textAnchor="middle" fill="#3B82F6" fontSize="16" fontWeight="bold">VCC</text>
        </g>
      );
    }

    case 'CONST_LOW': {
      return (
        <g>
          <rect x="0" y="0" width="50" height="40" rx="6" fill="#64748B/10" stroke="#64748B" strokeWidth="2" />
          <text x="25" y="25" textAnchor="middle" fill="#64748B" fontSize="16" fontWeight="bold">GND</text>
        </g>
      );
    }

    case 'LED': {
      const isLit = comp.ports[0]?.value === 1;
      const ledColor = comp.state.color || '#3B82F6';
      return (
        <g>
          <circle cx="25" cy="25" r="18" fill={isLit ? ledColor : '#334155'} stroke={isLit ? ledColor : strokeColor} strokeWidth="2" />
          {isLit && <circle cx="25" cy="25" r="22" fill={ledColor} opacity="0.3" filter="url(#glow-high)" />}
          <text x="25" y="29" textAnchor="middle" fill={isLit ? '#FFFFFF' : '#94A3B8'} fontSize="10" fontWeight="bold">
            {isLit ? 'ON' : 'OFF'}
          </text>
        </g>
      );
    }

    case '7_SEGMENT': {
      const ports = comp.ports;
      const sa = ports.find((p) => p.id === 'a')?.value === 1;
      const sb = ports.find((p) => p.id === 'b')?.value === 1;
      const sc = ports.find((p) => p.id === 'c')?.value === 1;
      const sd = ports.find((p) => p.id === 'd')?.value === 1;
      const se = ports.find((p) => p.id === 'e')?.value === 1;
      const sf = ports.find((p) => p.id === 'f')?.value === 1;
      const sg = ports.find((p) => p.id === 'g')?.value === 1;

      const segOn = '#3B82F6';
      const segOff = isDarkMode ? '#1E293B' : '#E2E8F0';

      return (
        <g>
          <rect x="0" y="0" width="70" height="100" rx="8" fill={isDarkMode ? '#090D16' : '#1E293B'} stroke={strokeColor} strokeWidth="2" />
          {/* Seg a */}
          <line x1="22" y1="18" x2="48" y2="18" stroke={sa ? segOn : segOff} strokeWidth="5" strokeLinecap="round" />
          {/* Seg b */}
          <line x1="50" y1="20" x2="50" y2="46" stroke={sb ? segOn : segOff} strokeWidth="5" strokeLinecap="round" />
          {/* Seg c */}
          <line x1="50" y1="52" x2="50" y2="78" stroke={sc ? segOn : segOff} strokeWidth="5" strokeLinecap="round" />
          {/* Seg d */}
          <line x1="22" y1="80" x2="48" y2="80" stroke={sd ? segOn : segOff} strokeWidth="5" strokeLinecap="round" />
          {/* Seg e */}
          <line x1="20" y1="52" x2="20" y2="78" stroke={se ? segOn : segOff} strokeWidth="5" strokeLinecap="round" />
          {/* Seg f */}
          <line x1="20" y1="20" x2="20" y2="46" stroke={sf ? segOn : segOff} strokeWidth="5" strokeLinecap="round" />
          {/* Seg g */}
          <line x1="22" y1="49" x2="48" y2="49" stroke={sg ? segOn : segOff} strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    }

    case 'HEX_DISPLAY': {
      const d0 = comp.ports.find((p) => p.id === 'in0')?.value === 1 ? 1 : 0;
      const d1 = comp.ports.find((p) => p.id === 'in1')?.value === 1 ? 1 : 0;
      const d2 = comp.ports.find((p) => p.id === 'in2')?.value === 1 ? 1 : 0;
      const d3 = comp.ports.find((p) => p.id === 'in3')?.value === 1 ? 1 : 0;
      const val = d0 | (d1 << 1) | (d2 << 2) | (d3 << 3);

      return (
        <g>
          <rect x="0" y="0" width="70" height="90" rx="8" fill={isDarkMode ? '#090D16' : '#0F172A'} stroke="#3B82F6" strokeWidth="2" />
          <text x="35" y="55" textAnchor="middle" fill="#60A5FA" fontSize="36" fontFamily="monospace" fontWeight="bold">
            {val.toString(16).toUpperCase()}
          </text>
        </g>
      );
    }

    // LOGIC GATES
    case 'AND': {
      return (
        <g>
          <path d="M 0 0 H 30 A 25 25 0 0 1 30 50 H 0 Z" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <text x="20" y="30" textAnchor="middle" fill={isDarkMode ? '#94A3B8' : '#475569'} fontSize="11" fontWeight="bold">AND</text>
        </g>
      );
    }

    case 'OR': {
      return (
        <g>
          <path d="M 0 0 C 15 0 30 10 60 25 C 30 40 15 50 0 50 C 12 35 12 15 0 0 Z" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <text x="24" y="30" textAnchor="middle" fill={isDarkMode ? '#94A3B8' : '#475569'} fontSize="11" fontWeight="bold">OR</text>
        </g>
      );
    }

    case 'NOT': {
      return (
        <g>
          <path d="M 0 0 L 45 20 L 0 40 Z" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <circle cx="52" cy="20" r="5" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
        </g>
      );
    }

    case 'NAND': {
      return (
        <g>
          <path d="M 0 0 H 30 A 25 25 0 0 1 30 50 H 0 Z" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <circle cx="58" cy="25" r="5" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <text x="20" y="30" textAnchor="middle" fill={isDarkMode ? '#94A3B8' : '#475569'} fontSize="10" fontWeight="bold">NAND</text>
        </g>
      );
    }

    case 'NOR': {
      return (
        <g>
          <path d="M 0 0 C 15 0 30 10 55 25 C 30 40 15 50 0 50 C 12 35 12 15 0 0 Z" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <circle cx="58" cy="25" r="5" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <text x="24" y="30" textAnchor="middle" fill={isDarkMode ? '#94A3B8' : '#475569'} fontSize="10" fontWeight="bold">NOR</text>
        </g>
      );
    }

    case 'XOR': {
      return (
        <g>
          <path d="M -6 0 C 6 15 6 35 -6 50" fill="none" stroke={strokeColor} strokeWidth="2" />
          <path d="M 0 0 C 15 0 30 10 60 25 C 30 40 15 50 0 50 C 12 35 12 15 0 0 Z" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <text x="24" y="30" textAnchor="middle" fill={isDarkMode ? '#94A3B8' : '#475569'} fontSize="10" fontWeight="bold">XOR</text>
        </g>
      );
    }

    case 'XNOR': {
      return (
        <g>
          <path d="M -6 0 C 6 15 6 35 -6 50" fill="none" stroke={strokeColor} strokeWidth="2" />
          <path d="M 0 0 C 15 0 30 10 55 25 C 30 40 15 50 0 50 C 12 35 12 15 0 0 Z" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <circle cx="58" cy="25" r="5" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <text x="22" y="30" textAnchor="middle" fill={isDarkMode ? '#94A3B8' : '#475569'} fontSize="9" fontWeight="bold">XNOR</text>
        </g>
      );
    }

    // Default Box Layout for Complex IC Blocks
    default: {
      return (
        <g>
          <rect x="0" y="0" width={meta.width} height={meta.height} rx="8" fill={bgFill} stroke={strokeColor} strokeWidth="2" />
          <text
            x={meta.width / 2}
            y={meta.height / 2 + 4}
            textAnchor="middle"
            fill={isDarkMode ? '#38BDF8' : '#0284C7'}
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            {comp.type}
          </text>
        </g>
      );
    }
  }
}

