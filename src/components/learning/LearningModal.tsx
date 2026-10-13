import React, { useState, useEffect } from 'react';
import { learningService, LearningExercise, SubmissionResult } from '../../services/learningService';
import { CircuitData } from '../../types/circuit';
import { generateTruthTable } from '../../utils/circuitEngine';
import { useAuth } from '../../hooks/useAuth';
import {
  X,
  GraduationCap,
  Play,
  CheckCircle2,
  XCircle,
  Award,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface LearningModalProps {
  currentCircuit: CircuitData;
  onLoadExerciseCircuit: (circuit: CircuitData) => void;
  onClose: () => void;
  isDarkMode: boolean;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const LearningModal: React.FC<LearningModalProps> = ({
  currentCircuit,
  onLoadExerciseCircuit,
  onClose,
  isDarkMode,
  onOpenAuth,
}) => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<LearningExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEx, setSelectedEx] = useState<LearningExercise | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    let mounted = true;
    learningService
      .getExercises()
      .then((data) => {
        if (mounted) {
          setExercises(data);
          if (data.length > 0) setSelectedEx(data[0]);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleVerifySubmission = async () => {
    if (!selectedEx) return;
    if (!user) {
      if (confirm('Please sign in to submit exercise solutions and record scores. Would you like to sign in now?')) {
        onClose();
        onOpenAuth?.('signin');
      }
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      // Evaluate current canvas truth table
      const truthTable = generateTruthTable(currentCircuit.components, currentCircuit.wires);

      // Package submission
      const submission = {
        title: currentCircuit.title,
        component_count: currentCircuit.components.length,
        truth_table: truthTable.rows,
      };

      const res = await learningService.submitAttempt(selectedEx.id, submission);
      setResult(res);
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base">Digital Logic Learning Lab</h2>
              <p className="text-xs text-slate-400">
                Structured laboratory exercises with automated server-side verification
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Exercises List (Sidebar) */}
          <div className={`w-full md:w-80 border-r border-slate-800 p-3 overflow-y-auto space-y-2 ${
            isDarkMode ? 'bg-slate-950/50' : 'bg-slate-50'
          }`}>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Curriculum Modules ({exercises.length})
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-slate-400">Loading curriculum...</div>
            ) : (
              exercises.map((ex) => (
                <button
                  key={ex.id}
                  onClick={() => {
                    setSelectedEx(ex);
                    setResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex items-center justify-between ${
                    selectedEx?.id === ex.id
                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-300 font-bold'
                      : isDarkMode
                      ? 'border-slate-800/80 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <div className="space-y-1 truncate pr-2">
                    <div className="truncate">{ex.title}</div>
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                      <span className="capitalize">{ex.category}</span>
                      <span>&bull;</span>
                      <span className="capitalize">{ex.difficulty}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 text-slate-500" />
                </button>
              ))
            )}
          </div>

          {/* Exercise Detail & Verification Panel */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {selectedEx ? (
              <>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {selectedEx.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {selectedEx.difficulty}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg">{selectedEx.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{selectedEx.description}</p>
                </div>

                {/* Instructions Box */}
                <div className={`p-4 rounded-xl border text-xs space-y-2 ${
                  isDarkMode ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 text-slate-300">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Laboratory Objective
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    1. Click <strong>"Load Starter to Canvas"</strong> to populate the component layout.<br />
                    2. Wire the logic gates and outputs according to digital logic specifications.<br />
                    3. Toggle switches to test signals in real time.<br />
                    4. Click <strong>"Verify Solution"</strong> to trigger server-side automated grading.
                  </p>
                </div>

                {/* Results Card */}
                {result && (
                  <div className={`p-4 rounded-xl border transition-all ${
                    result.is_correct
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {result.is_correct ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>Solution Verified! Score: {result.score}/100</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-400" />
                          <span>Evaluation Failed (Attempt #{result.attempt_number})</span>
                        </>
                      )}
                    </div>
                    {result.explanation && (
                      <p className="text-xs mt-2 text-slate-300 leading-relaxed">
                        {result.explanation}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      if (selectedEx.exercise_data) {
                        onLoadExerciseCircuit(selectedEx.exercise_data);
                        onClose();
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Load Starter to Canvas
                  </button>

                  <button
                    onClick={handleVerifySubmission}
                    disabled={submitting}
                    className="px-4 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <Award className="w-4 h-4" />
                    {submitting ? 'Grading on Supabase...' : 'Verify Current Canvas'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select an exercise from the left to view details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
