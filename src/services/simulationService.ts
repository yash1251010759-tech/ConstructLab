import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database, Json } from '../lib/database.types';
import { authService } from './authService';

export type SimulationRunRecord = Database['public']['Tables']['simulation_runs']['Row'];

export const simulationService = {
  // Record simulation evaluation diagnostics or test vector run
  recordSimulationRun: async (
    circuitId?: string,
    inputs: Record<string, any> = {},
    outputs: Record<string, any> = {},
    durationMs: number = 0,
    status: 'running' | 'completed' | 'error' = 'completed',
    errorMessage?: string
  ): Promise<SimulationRunRecord | null> => {
    if (!isSupabaseConfigured) return null;

    const user = await authService.getCurrentUser();

    const { data, error } = await supabase
      .from('simulation_runs')
      .insert({
        circuit_id: circuitId || null,
        user_id: user?.id || null,
        input_values: inputs as Json,
        output_values: outputs as Json,
        execution_duration_ms: durationMs,
        status,
        error_message: errorMessage || null,
      })
      .select()
      .single();

    if (error) {
      console.warn('Could not record simulation run:', error.message);
      return null;
    }

    return data as SimulationRunRecord;
  },

  // Get user simulation history
  getSimulationHistory: async (circuitId?: string, limit: number = 20): Promise<SimulationRunRecord[]> => {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('simulation_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (circuitId) {
      query = query.eq('circuit_id', circuitId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching simulation history:', error);
      throw error;
    }

    return (data || []) as SimulationRunRecord[];
  },
};
