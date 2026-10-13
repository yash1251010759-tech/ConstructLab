import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database } from '../lib/database.types';
import { CircuitData } from '../types/circuit';

export type CircuitVersionRecord = Database['public']['Tables']['circuit_versions']['Row'];

export const versionService = {
  // Get all versions for a circuit
  getVersions: async (circuitId: string): Promise<CircuitVersionRecord[]> => {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('circuit_versions')
      .select('*')
      .eq('circuit_id', circuitId)
      .order('version_number', { ascending: false });

    if (error) {
      console.error('Error fetching circuit versions:', error);
      throw error;
    }
    return (data || []) as CircuitVersionRecord[];
  },

  // Restore previous circuit version via RPC
  restoreVersion: async (circuitId: string, versionNumber: number): Promise<CircuitData> => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    // We can call the SQL function restore_circuit_version
    const { data, error } = await supabase.rpc('restore_circuit_version', {
      p_circuit_id: circuitId,
      p_version_number: versionNumber,
    });

    if (error) {
      console.error('Error restoring circuit version:', error);
      throw error;
    }

    return data as CircuitData;
  },
};
