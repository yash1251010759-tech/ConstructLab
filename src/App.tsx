import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CircuitData,
  ComponentItem,
  ComponentType,
  PrebuiltTemplate,
  WaveformSample,
  Wire,
} from './types/circuit';
import {
  createComponentInstance,
  evaluateCircuit,
} from './utils/circuitEngine';
import { PREBUILT_CIRCUITS } from './data/prebuiltCircuits';
import { generateUUID } from './utils/uuid';

import { Header } from './components/Header';
import { ComponentPalette } from './components/ComponentPalette';
import { CircuitCanvas } from './components/CircuitCanvas';
import { PropertyPanel } from './components/PropertyPanel';
import { TruthTableModal } from './components/TruthTableModal';
import { WaveformScope } from './components/WaveformScope';
import { ExportModal } from './components/ExportModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { VerilogViewerModal } from './components/VerilogViewerModal';

// Supabase Cloud & Backend Integration
import { useAuth } from './hooks/useAuth';
import { circuitService } from './services/circuitService';
import { sharingService } from './services/sharingService';
import { notificationService } from './services/notificationService';
import { AuthModal } from './components/auth/AuthModal';
import { CircuitManagerModal } from './components/circuits/CircuitManagerModal';
import { CircuitVersionsModal } from './components/circuits/CircuitVersionsModal';
import { ShareCircuitModal } from './components/circuits/ShareCircuitModal';
import { LearningModal } from './components/learning/LearningModal';
import { LoginPage } from './components/auth/LoginPage';
import { UserDashboard } from './components/dashboard/UserDashboard';
import { NotificationToasts } from './components/notifications/NotificationToasts';
import { Globe, Copy } from 'lucide-react';

export default function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();

  // Navigation View State: 'dashboard' is primary view after login
  const [currentView, setCurrentView] = useState<'dashboard' | 'studio'>('dashboard');
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initial default circuit workspace
  const defaultCircuit: CircuitData = PREBUILT_CIRCUITS[0].circuit;

  const [circuit, setCircuit] = useState<CircuitData>(defaultCircuit);

  // History stack for Undo/Redo
  const [history, setHistory] = useState<CircuitData[]>([defaultCircuit]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Selection
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  // Simulation engine settings
  const [isRunning, setIsRunning] = useState(true);
  const [simSpeedHz, setSimSpeedHz] = useState(2);
  const [tickCount, setTickCount] = useState(0);

  // Waveform scope history
  const [waveformHistory, setWaveformHistory] = useState<WaveformSample[]>([]);
  const [isRecordingScope, setIsRecordingScope] = useState(true);

  // Canvas Viewport (Zoom & Pan)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Original Modals
  const [showTruthTable, setShowTruthTable] = useState(false);
  const [showWaveform, setShowWaveform] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showVerilog, setShowVerilog] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Supabase Backend Modals & State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [showCircuitManager, setShowCircuitManager] = useState(false);
  const [activeVersionCircuitId, setActiveVersionCircuitId] = useState<string | null>(null);
  const [activeShareCircuitId, setActiveShareCircuitId] = useState<string | null>(null);
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Shared Link Banner State
  const [sharedBanner, setSharedBanner] = useState<{
    active: boolean;
    ownerName: string;
    permission: string;
  } | null>(null);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Send Welcome Notification & reset demo state when user logs in
  useEffect(() => {
    if (user) {
      setIsDemoMode(false);
      notificationService.sendWelcomeNotification(
        user.id,
        profile?.display_name || user.user_metadata?.display_name || user.email?.split('@')[0]
      );
    }
  }, [user, profile]);

  // Check URL query parameters and routes on startup (?share=<token>, /login, /signup, etc.)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareToken = params.get('share');
    const circuitId = params.get('circuit');
    const path = window.location.pathname.toLowerCase();
    const authParam = params.get('auth')?.toLowerCase();

    // Check auth deep-linking routes
    if (path.includes('signup') || path.includes('register') || authParam === 'signup' || authParam === 'register') {
      setAuthInitialMode('signup');
      setShowAuthModal(true);
    } else if (path.includes('login') || path.includes('signin') || authParam === 'login' || authParam === 'signin') {
      setAuthInitialMode('signin');
      setShowAuthModal(true);
    }

    if (shareToken) {
      sharingService
        .getSharedCircuit(shareToken)
        .then((res) => {
          if (res && res.circuit_data) {
            setCircuit(res.circuit_data);
            setHistory([res.circuit_data]);
            setHistoryIndex(0);
            setSharedBanner({
              active: true,
              ownerName: res.owner_name || 'Anonymous Engineer',
              permission: res.permission || 'read_only',
            });
            setCurrentView('studio');
          }
        })
        .catch((err) => {
          console.warn('Failed to load shared circuit:', err);
        });
    } else if (circuitId) {
      circuitService
        .getCircuitById(circuitId)
        .then((res) => {
          if (res && res.circuit_data) {
            setCircuit(res.circuit_data);
            setHistory([res.circuit_data]);
            setHistoryIndex(0);
            setCurrentView('studio');
          }
        })
        .catch((err) => {
          console.warn('Failed to load circuit ID:', err);
        });
    }
  }, []);

  // Push new state to Undo/Redo history
  const pushHistory = useCallback(
    (newCircuit: CircuitData) => {
      const updatedHistory = history.slice(0, historyIndex + 1);
      updatedHistory.push(JSON.parse(JSON.stringify(newCircuit)));
      setHistory(updatedHistory);
      setHistoryIndex(updatedHistory.length - 1);
      setCircuit(newCircuit);
    },
    [history, historyIndex]
  );

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCircuit(JSON.parse(JSON.stringify(prev)));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCircuit(JSON.parse(JSON.stringify(next)));
    }
  };

  // Continuous Simulation Tick Engine Loop
  useEffect(() => {
    if (!isRunning) return;

    const intervalMs = Math.max(20, Math.floor(1000 / simSpeedHz));
    const timer = setInterval(() => {
      setTickCount((prev) => prev + 1);

      setCircuit((prevCircuit) => {
        const evaluated = evaluateCircuit(prevCircuit.components, prevCircuit.wires, tickCount);

        // Record Waveform Sample if scope recording
        if (isRecordingScope) {
          const signals: Record<string, any> = {};
          evaluated.components.forEach((c) => {
            if (c.ports[0]) signals[c.id] = c.ports[0].value;
          });

          setWaveformHistory((prev) => [
            ...prev.slice(-100),
            { timestamp: Date.now(), signals },
          ]);
        }

        return {
          ...prevCircuit,
          components: evaluated.components,
          wires: evaluated.wires,
        };
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, simSpeedHz, tickCount, isRecordingScope]);

  // Component Palette Actions
  const handleAddComponent = (type: ComponentType) => {
    const newComp = createComponentInstance(type, 300, 200);
    const updated: CircuitData = {
      ...circuit,
      components: [...circuit.components, newComp],
    };
    pushHistory(updated);
    setSelectedCompId(newComp.id);
    setSelectedWireId(null);
  };

  const handleDropComponent = (type: ComponentType, x: number, y: number) => {
    const newComp = createComponentInstance(type, x, y);
    const updated: CircuitData = {
      ...circuit,
      components: [...circuit.components, newComp],
    };
    pushHistory(updated);
    setSelectedCompId(newComp.id);
    setSelectedWireId(null);
  };

  const handleUpdateComponentPosition = (id: string, x: number, y: number) => {
    setCircuit((prev) => ({
      ...prev,
      components: prev.components.map((c) => (c.id === id ? { ...c, x, y } : c)),
    }));
  };

  const handleUpdateComponent = (updatedComp: ComponentItem) => {
    const updated: CircuitData = {
      ...circuit,
      components: circuit.components.map((c) => (c.id === updatedComp.id ? updatedComp : c)),
    };
    pushHistory(updated);
  };

  const handleDeleteComponent = (id: string) => {
    const updated: CircuitData = {
      ...circuit,
      components: circuit.components.filter((c) => c.id !== id),
      wires: circuit.wires.filter((w) => w.fromCompId !== id && w.toCompId !== id),
    };
    pushHistory(updated);
    setSelectedCompId(null);
  };

  const handleDuplicateComponent = (comp: ComponentItem) => {
    const dup = createComponentInstance(comp.type, comp.x + 40, comp.y + 40);
    dup.label = `${comp.label} Copy`;
    dup.rotation = comp.rotation;
    dup.state = { ...comp.state };

    const updated: CircuitData = {
      ...circuit,
      components: [...circuit.components, dup],
    };
    pushHistory(updated);
    setSelectedCompId(dup.id);
  };

  const handleRotateComponent = (comp: ComponentItem) => {
    const newRot = ((comp.rotation + 90) % 360) as 0 | 90 | 180 | 270;
    handleUpdateComponent({ ...comp, rotation: newRot });
  };

  const handleToggleSwitch = (id: string) => {
    const target = circuit.components.find((c) => c.id === id);
    if (!target) return;

    const updatedComp = {
      ...target,
      state: { ...target.state, isOn: !target.state.isOn },
    };
    handleUpdateComponent(updatedComp);
  };

  const handlePressButton = (id: string, isDown: boolean) => {
    setCircuit((prev) => ({
      ...prev,
      components: prev.components.map((c) =>
        c.id === id ? { ...c, state: { ...c.state, isOn: isDown } } : c
      ),
    }));
  };

  // Wiring Actions
  const handleAddWire = (
    fromCompId: string,
    fromPortId: string,
    toCompId: string,
    toPortId: string
  ) => {
    // Check duplicate wire
    const exists = circuit.wires.some(
      (w) =>
        w.fromCompId === fromCompId &&
        w.fromPortId === fromPortId &&
        w.toCompId === toCompId &&
        w.toPortId === toPortId
    );
    if (exists) return;

    const newWire: Wire = {
      id: `wire_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fromCompId,
      fromPortId,
      toCompId,
      toPortId,
      value: 0,
    };

    const updated: CircuitData = {
      ...circuit,
      wires: [...circuit.wires, newWire],
    };
    pushHistory(updated);
  };

  const handleDeleteWire = (id: string) => {
    const updated: CircuitData = {
      ...circuit,
      wires: circuit.wires.filter((w) => w.id !== id),
    };
    pushHistory(updated);
    setSelectedWireId(null);
  };

  // Keyboard Shortcuts (Delete, Backspace, Ctrl+Z, Escape)
  useEffect(() => {
    if (currentView !== 'studio') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedCompId) handleDeleteComponent(selectedCompId);
        else if (selectedWireId) handleDeleteWire(selectedWireId);
      } else if (e.key === 'Escape') {
        setSelectedCompId(null);
        setSelectedWireId(null);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCompId, selectedWireId, historyIndex, history, currentView]);

  // Load Template
  const handleLoadTemplate = (tmpl: PrebuiltTemplate) => {
    pushHistory(tmpl.circuit);
    setSelectedCompId(null);
    setSelectedWireId(null);
    setSharedBanner(null);
    setCurrentView('studio');
  };

  const handleNewCircuit = () => {
    const blank: CircuitData = {
      id: generateUUID(),
      title: 'Untitled Circuit',
      description: 'Blank circuit diagram workspace',
      components: [],
      wires: [],
      zoom: 1,
      pan: { x: 0, y: 0 },
    };
    pushHistory(blank);
    setSelectedCompId(null);
    setSelectedWireId(null);
    setSharedBanner(null);
    setCurrentView('studio');
  };

  // Launch ConstructLab Studio from Dashboard or Templates
  const handleLaunchStudio = (circuitToLoad?: CircuitData) => {
    if (circuitToLoad) {
      pushHistory(circuitToLoad);
      setSelectedCompId(null);
      setSelectedWireId(null);
      setSharedBanner(null);
    }
    setCurrentView('studio');
  };

  // Cloud Save Action
  const handleSaveCircuit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsSaving(true);
    try {
      const saved = await circuitService.saveCircuit(circuit, {
        createSnapshot: true,
        changeSummary: `Manual snapshot at ${new Date().toLocaleTimeString()}`,
      });
      if (saved && saved.circuit_data) {
        setCircuit(saved.circuit_data);
      }
      setLastSavedAt(new Date());
      setTimeout(() => setLastSavedAt(null), 3000);
    } catch (err: any) {
      alert(`Save error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Fork Shared Circuit
  const handleForkSharedCircuit = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      const dup = await circuitService.duplicateCircuit(circuit, `${circuit.title} (Forked)`);
      pushHistory(dup.circuit_data);
      setSharedBanner(null);
    } catch (err: any) {
      alert(`Fork failed: ${err.message}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setIsDemoMode(false);
    setCurrentView('dashboard');
  };

  // Unauthenticated Gateway: If user is not logged in and not in demo mode, show the dedicated Login Page
  if (!user && !isDemoMode && !authLoading) {
    return (
      <>
        <LoginPage
          onEnterDemo={() => {
            setIsDemoMode(true);
            setCurrentView('studio');
          }}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          initialMode={authInitialMode === 'reset' ? 'signin' : authInitialMode}
        />

        {/* Supabase Auth Modal */}
        {showAuthModal && (
          <AuthModal
            initialMode={authInitialMode}
            onClose={() => {
              setShowAuthModal(false);
              if (['/login', '/signin', '/signup', '/register'].some((p) => window.location.pathname.toLowerCase().includes(p))) {
                window.history.replaceState({}, '', '/');
              }
            }}
            isDarkMode={isDarkMode}
          />
        )}
      </>
    );
  }

  const selectedComp = circuit.components.find((c) => c.id === selectedCompId) || null;
  const selectedWire = circuit.wires.find((w) => w.id === selectedWireId) || null;

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-800'}`}>
      {/* Top Header */}
      <Header
        title={circuit.title}
        setTitle={(t) => setCircuit((prev) => ({ ...prev, title: t }))}
        isRunning={isRunning}
        setIsRunning={setIsRunning}
        simSpeedHz={simSpeedHz}
        setSimSpeedHz={setSimSpeedHz}
        onNewCircuit={handleNewCircuit}
        onLoadTemplate={handleLoadTemplate}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenTruthTable={() => setShowTruthTable(true)}
        onOpenWaveform={() => setShowWaveform(true)}
        onOpenAI={() => setShowAIModal(true)}
        onOpenVerilog={() => setShowVerilog(true)}
        onOpenExport={() => setShowExport(true)}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        // Supabase Props
        onSaveCircuit={handleSaveCircuit}
        isSaving={isSaving}
        lastSavedAt={lastSavedAt}
        onOpenCircuitManager={() => setShowCircuitManager(true)}
        onOpenShare={() => setActiveShareCircuitId(circuit.id)}
        onOpenLearning={() => setShowLearningModal(true)}
        onOpenAuth={(mode = 'signin') => {
          setAuthInitialMode(mode);
          setShowAuthModal(true);
        }}
        user={user}
        currentView={currentView}
        onChangeView={(view) => setCurrentView(view)}
        onSignOut={handleSignOut}
      />

      {/* Demo Mode Notice Banner */}
      {isDemoMode && !user && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold shadow-md">
          <div className="flex items-center gap-2">
            <span>⚠️ You are exploring ConstructLab in Demo Mode. To save circuits and link them to your unique ID, please sign in.</span>
          </div>
          <button
            onClick={() => {
              setAuthInitialMode('signin');
              setShowAuthModal(true);
            }}
            className="px-3 py-1 rounded-md bg-white text-amber-800 font-bold hover:bg-amber-50 transition-colors shadow-sm"
          >
            Sign In Now
          </button>
        </div>
      )}

      {/* Shared Read-Only Notification Banner */}
      {sharedBanner && currentView === 'studio' && (
        <div className="bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-b border-blue-500/30 px-4 py-2 flex items-center justify-between text-xs text-blue-100">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>
              Viewing Shared Circuit: <strong>"{circuit.title}"</strong> created by <strong>{sharedBanner.ownerName}</strong> (Read-Only)
            </span>
          </div>
          <button
            onClick={handleForkSharedCircuit}
            className="px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-400 text-white font-bold flex items-center gap-1.5 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Fork to My Account
          </button>
        </div>
      )}

      {/* Conditional View: User Dashboard vs ConstructLab Studio */}
      {currentView === 'dashboard' && user ? (
        <UserDashboard
          user={user}
          profile={profile}
          onLaunchStudio={handleLaunchStudio}
          onOpenVersions={(cId) => setActiveVersionCircuitId(cId)}
          onOpenShare={(cId) => setActiveShareCircuitId(cId)}
          onOpenLearning={() => setShowLearningModal(true)}
          onSignOut={handleSignOut}
          isDarkMode={isDarkMode}
        />
      ) : (
        /* ConstructLab Studio Canvas Workspace */
        <div className="flex-1 flex overflow-hidden relative">
          {/* Left Component Library Palette */}
          <ComponentPalette
            onAddComponent={handleAddComponent}
            isDarkMode={isDarkMode}
          />

          {/* Center Canvas */}
          <CircuitCanvas
            components={circuit.components}
            wires={circuit.wires}
            selectedCompId={selectedCompId}
            selectedWireId={selectedWireId}
            onSelectComponent={(id) => {
              setSelectedCompId(id);
              setSelectedWireId(null);
            }}
            onSelectWire={(id) => {
              setSelectedWireId(id);
              setSelectedCompId(null);
            }}
            onUpdateComponentPosition={handleUpdateComponentPosition}
            onToggleSwitch={handleToggleSwitch}
            onPressButton={handlePressButton}
            onAddWire={handleAddWire}
            onDropComponentFromPalette={handleDropComponent}
            onDeleteComponent={handleDeleteComponent}
            onDuplicateComponent={handleDuplicateComponent}
            onRotateComponent={handleRotateComponent}
            onDeleteWire={handleDeleteWire}
            zoom={zoom}
            setZoom={setZoom}
            pan={pan}
            setPan={setPan}
            isDarkMode={isDarkMode}
          />

          {/* Right Property Inspector Panel */}
          <PropertyPanel
            selectedComponent={selectedComp}
            selectedWire={selectedWire}
            onUpdateComponent={handleUpdateComponent}
            onDeleteComponent={handleDeleteComponent}
            onDuplicateComponent={handleDuplicateComponent}
            onDeleteWire={handleDeleteWire}
            onClose={() => {
              setSelectedCompId(null);
              setSelectedWireId(null);
            }}
            isDarkMode={isDarkMode}
          />
        </div>
      )}

      {/* Bottom Status Footer Bar (Shown in Studio View) */}
      {currentView === 'studio' && (
        <footer className={`h-9 border-t flex items-center justify-between px-4 select-none shrink-0 text-[10px] font-mono ${
          isDarkMode ? 'bg-[#0F172A] border-slate-800 text-slate-500' : 'bg-slate-200 border-slate-300 text-slate-600'
        }`}>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold">COMPONENTS:</span>
              <span className="text-blue-400 font-bold">{circuit.components.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold">CONNECTIONS:</span>
              <span className="text-blue-400 font-bold">{circuit.wires.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold">ZOOM:</span>
              <span className="text-blue-400 font-bold">{Math.round(zoom * 100)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold">SIM SPEED:</span>
              <span className="text-blue-400 font-bold">{simSpeedHz} Hz</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-slate-400 hidden md:inline">
                USER ID: <strong className="text-blue-400">{user.id.slice(0, 8)}...</strong>
              </span>
            )}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-sans">
                PostgreSQL Cloud Sync Enabled
              </span>
            </div>
          </div>
        </footer>
      )}

      {/* Real-time Toast Notifications */}
      <NotificationToasts isDarkMode={isDarkMode} />

      {/* Bottom Floating Waveform Analyzer */}
      {showWaveform && (
        <WaveformScope
          components={circuit.components}
          history={waveformHistory}
          isRecording={isRecordingScope}
          setIsRecording={setIsRecordingScope}
          onClearHistory={() => setWaveformHistory([])}
          onClose={() => setShowWaveform(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Truth Table Modal */}
      {showTruthTable && (
        <TruthTableModal
          components={circuit.components}
          wires={circuit.wires}
          onClose={() => setShowTruthTable(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Export Modal */}
      {showExport && (
        <ExportModal
          circuit={circuit}
          onClose={() => setShowExport(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* AI Tutor Assistant Modal */}
      {showAIModal && (
        <AIAssistantModal
          circuit={circuit}
          onSynthesizeCircuit={(newCirc) => {
            pushHistory(newCirc);
            setCurrentView('studio');
          }}
          onClose={() => setShowAIModal(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Verilog Viewer Modal */}
      {showVerilog && (
        <VerilogViewerModal
          circuit={circuit}
          onClose={() => setShowVerilog(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Supabase Auth Modal */}
      {showAuthModal && (
        <AuthModal
          initialMode={authInitialMode}
          onClose={() => {
            setShowAuthModal(false);
            if (['/login', '/signin', '/signup', '/register'].some((p) => window.location.pathname.toLowerCase().includes(p))) {
              window.history.replaceState({}, '', '/');
            }
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Supabase Circuit Cloud Repository Modal */}
      {showCircuitManager && (
        <CircuitManagerModal
          currentCircuit={circuit}
          onLoadCircuit={(loadedCirc) => {
            pushHistory(loadedCirc);
            setSharedBanner(null);
            setCurrentView('studio');
          }}
          onOpenVersions={(cId) => setActiveVersionCircuitId(cId)}
          onOpenShare={(cId) => setActiveShareCircuitId(cId)}
          onOpenAuth={(mode = 'signin') => {
            setAuthInitialMode(mode);
            setShowAuthModal(true);
          }}
          onClose={() => setShowCircuitManager(false)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Circuit Version Snapshots Modal */}
      {activeVersionCircuitId && (
        <CircuitVersionsModal
          circuitId={activeVersionCircuitId}
          onRestoreVersion={(restoredCirc) => {
            pushHistory(restoredCirc);
            setCurrentView('studio');
          }}
          onClose={() => setActiveVersionCircuitId(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Circuit Sharing Modal */}
      {activeShareCircuitId && (
        <ShareCircuitModal
          circuitId={activeShareCircuitId}
          circuitTitle={circuit.title}
          onClose={() => setActiveShareCircuitId(null)}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Learning Lab Modal */}
      {showLearningModal && (
        <LearningModal
          currentCircuit={circuit}
          onLoadExerciseCircuit={(starterCirc) => {
            pushHistory(starterCirc);
            setSharedBanner(null);
            setCurrentView('studio');
          }}
          onOpenAuth={(mode: 'signin' | 'signup' = 'signin') => {
            setAuthInitialMode(mode);
            setShowAuthModal(true);
          }}
          onClose={() => setShowLearningModal(false)}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
}
