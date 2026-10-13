import { useState, useEffect, useCallback } from 'react';
import { circuitService, CircuitRecord } from '../services/circuitService';
import { CircuitData } from '../types/circuit';
import { CircuitVisibility } from '../lib/database.types';

export function useCircuits(userId?: string | null) {
  const [circuits, setCircuits] = useState<CircuitRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCircuits = useCallback(async () => {
    if (!userId) {
      setCircuits([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await circuitService.getMyCircuits();
      setCircuits(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load circuits');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCircuits();
  }, [fetchCircuits]);

  const saveCircuit = async (
    circuit: CircuitData,
    options?: {
      visibility?: CircuitVisibility;
      category?: string;
      createSnapshot?: boolean;
      changeSummary?: string;
    }
  ) => {
    const saved = await circuitService.saveCircuit(circuit, options);
    await fetchCircuits();
    return saved;
  };

  const deleteCircuit = async (circuitId: string) => {
    await circuitService.deleteCircuit(circuitId);
    setCircuits((prev) => prev.filter((c) => c.id !== circuitId));
  };

  const duplicateCircuit = async (circuit: CircuitData) => {
    const dup = await circuitService.duplicateCircuit(circuit);
    await fetchCircuits();
    return dup;
  };

  return {
    circuits,
    loading,
    error,
    refreshCircuits: fetchCircuits,
    saveCircuit,
    deleteCircuit,
    duplicateCircuit,
  };
}
