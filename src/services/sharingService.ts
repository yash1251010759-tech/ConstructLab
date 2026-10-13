import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database, SharePermission } from '../lib/database.types';
import { CircuitData } from '../types/circuit';
import { authService } from './authService';

export type CircuitShareRecord = Database['public']['Tables']['circuit_shares']['Row'];

export interface SharedCircuitResponse {
  id: string;
  title: string;
  description: string | null;
  circuit_data: CircuitData;
  category: string | null;
  owner_name: string;
  created_at: string;
  updated_at: string;
  permission: SharePermission;
}

export const sharingService = {
  // Create or refresh a secure share token
  createShareLink: async (
    circuitId: string,
    permission: SharePermission = 'read_only',
    expiresInDays?: number
  ): Promise<CircuitShareRecord> => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    // Calculate expiry timestamp if specified
    let expiresAt: string | null = null;
    if (expiresInDays && expiresInDays > 0) {
      const d = new Date();
      d.setDate(d.getDate() + expiresInDays);
      expiresAt = d.toISOString();
    }

    // Generate random 32-char token
    const token = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const { data, error } = await supabase
      .from('circuit_shares')
      .insert({
        circuit_id: circuitId,
        owner_id: user.id,
        share_token: token,
        permission,
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) throw error;

    // Also update circuit share_token for primary lookup
    await supabase
      .from('circuits')
      .update({ share_token: token })
      .eq('id', circuitId);

    return data as CircuitShareRecord;
  },

  // Get active shares for circuit
  getCircuitShares: async (circuitId: string): Promise<CircuitShareRecord[]> => {
    if (!isSupabaseConfigured) return [];

    const { data, error } = await supabase
      .from('circuit_shares')
      .select('*')
      .eq('circuit_id', circuitId)
      .is('revoked_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching circuit shares:', error);
      throw error;
    }
    return (data || []) as CircuitShareRecord[];
  },

  // Revoke share token
  revokeShare: async (shareId: string): Promise<void> => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { error } = await supabase
      .from('circuit_shares')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', shareId);

    if (error) throw error;
  },

  // Load shared circuit via public unguessable token
  getSharedCircuit: async (shareToken: string): Promise<SharedCircuitResponse> => {
    if (!isSupabaseConfigured) throw new Error('Supabase is not configured.');

    const { data, error } = await supabase.rpc('get_shared_circuit', {
      p_share_token: shareToken,
    });

    if (error) {
      console.error('Error resolving shared circuit token:', error);
      throw error;
    }

    return data as unknown as SharedCircuitResponse;
  },
};
