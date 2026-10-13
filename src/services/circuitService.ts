import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database, CircuitVisibility } from '../lib/database.types';
import { CircuitData } from '../types/circuit';
import { authService } from './authService';
import { ensureUUID } from '../utils/uuid';
import { notificationService } from './notificationService';

export type CircuitRecord = Database['public']['Tables']['circuits']['Row'];
export type ActivityLogRecord = Database['public']['Tables']['activity_logs']['Row'];

export const circuitService = {
  // Helper to get local circuits key
  getLocalCircuitsKey: (userId: string) => `constructlab_circuits_${userId}`,
  getLocalLogsKey: (userId: string) => `constructlab_activities_${userId}`,

  // Save to local cache
  saveToLocalCache: (userId: string, circuit: CircuitRecord) => {
    try {
      const key = circuitService.getLocalCircuitsKey(userId);
      const stored = localStorage.getItem(key);
      const list: CircuitRecord[] = stored ? JSON.parse(stored) : [];
      const updated = [circuit, ...list.filter((c) => c.id !== circuit.id)];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local cache save warning:', e);
    }
  },

  // Save local activity log
  saveLocalActivityLog: (userId: string, log: ActivityLogRecord) => {
    try {
      const key = circuitService.getLocalLogsKey(userId);
      const stored = localStorage.getItem(key);
      const list: ActivityLogRecord[] = stored ? JSON.parse(stored) : [];
      const updated = [log, ...list.slice(0, 49)];
      localStorage.setItem(key, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local log save warning:', e);
    }
  },

  // Fetch circuits belonging to current user
  getMyCircuits: async (): Promise<CircuitRecord[]> => {
    const user = await authService.getCurrentUser();
    if (!user) return [];

    let supaCircuits: CircuitRecord[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('circuits')
          .select('*')
          .eq('owner_id', user.id)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          supaCircuits = data as CircuitRecord[];
        }
      } catch (error) {
        console.warn('Error fetching Supabase user circuits:', error);
      }
    }

    // Load local storage circuits
    let localCircuits: CircuitRecord[] = [];
    try {
      const stored = localStorage.getItem(circuitService.getLocalCircuitsKey(user.id));
      if (stored) {
        localCircuits = JSON.parse(stored) as CircuitRecord[];
      }
    } catch (e) {
      console.warn(e);
    }

    const map = new Map<string, CircuitRecord>();
    localCircuits.forEach((c) => map.set(c.id, c));
    supaCircuits.forEach((c) => map.set(c.id, c));

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  // Fetch community / public circuits
  getPublicCircuits: async (category?: string, searchTerm?: string): Promise<CircuitRecord[]> => {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('circuits')
      .select('*, profiles:owner_id(display_name, username, avatar_url)')
      .eq('visibility', 'public')
      .order('updated_at', { ascending: false })
      .limit(30);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    if (searchTerm) {
      query = query.ilike('title', `%${searchTerm}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching public circuits:', error);
      return [];
    }
    return (data || []) as CircuitRecord[];
  },

  // Load a single circuit by ID
  getCircuitById: async (circuitId: string): Promise<CircuitRecord | null> => {
    const user = await authService.getCurrentUser();

    // Check local storage first
    if (user) {
      try {
        const stored = localStorage.getItem(circuitService.getLocalCircuitsKey(user.id));
        if (stored) {
          const list: CircuitRecord[] = JSON.parse(stored);
          const found = list.find((c) => c.id === circuitId);
          if (found) return found;
        }
      } catch {}
    }

    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('circuits')
        .select('*')
        .eq('id', circuitId)
        .maybeSingle();

      if (error) {
        console.error('Error loading circuit:', error);
        return null;
      }

      if (data) {
        supabase
          .from('circuits')
          .update({ last_opened_at: new Date().toISOString() })
          .eq('id', circuitId)
          .then();
      }

      return data as CircuitRecord;
    } catch {
      return null;
    }
  },

  // Save or update circuit
  saveCircuit: async (
    circuit: CircuitData,
    options?: {
      visibility?: CircuitVisibility;
      category?: string;
      createSnapshot?: boolean;
      changeSummary?: string;
    }
  ): Promise<CircuitRecord> => {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('You must be signed in to save circuits.');

    const circuitUUID = ensureUUID(circuit.id);
    circuit.id = circuitUUID;

    const serializedCircuit: CircuitData = {
      id: circuitUUID,
      title: circuit.title || 'Untitled Circuit',
      description: circuit.description || '',
      components: circuit.components || [],
      wires: circuit.wires || [],
      zoom: circuit.zoom ?? 1,
      pan: circuit.pan || { x: 0, y: 0 },
    };

    let result: CircuitRecord | null = null;
    let isUpdate = false;
    let versionNum = 1;

    // 1. Try Supabase save
    if (isSupabaseConfigured) {
      try {
        const { data: existing } = await supabase
          .from('circuits')
          .select('id, version_number')
          .eq('id', circuitUUID)
          .eq('owner_id', user.id)
          .maybeSingle();

        if (existing) {
          isUpdate = true;
          versionNum = (existing.version_number || 1) + 1;
          const { data, error } = await supabase
            .from('circuits')
            .update({
              title: serializedCircuit.title,
              description: serializedCircuit.description,
              circuit_data: serializedCircuit,
              visibility: options?.visibility ?? 'private',
              category: options?.category ?? 'general',
              version_number: versionNum,
              updated_at: new Date().toISOString(),
            })
            .eq('id', circuitUUID)
            .eq('owner_id', user.id)
            .select()
            .single();

          if (!error && data) {
            result = data as CircuitRecord;
          }
        } else {
          const { data, error } = await supabase
            .from('circuits')
            .insert({
              id: circuitUUID,
              owner_id: user.id,
              title: serializedCircuit.title,
              description: serializedCircuit.description,
              circuit_data: serializedCircuit,
              visibility: options?.visibility ?? 'private',
              category: options?.category ?? 'general',
              version_number: 1,
            })
            .select()
            .single();

          if (!error && data) {
            result = data as CircuitRecord;
          }
        }
      } catch (err: any) {
        console.warn('Supabase save error (falling back to local cloud cache):', err.message);
      }
    }

    // 2. If Supabase insert/update did not set result, construct record
    if (!result) {
      // Check local cache for existing version
      try {
        const stored = localStorage.getItem(circuitService.getLocalCircuitsKey(user.id));
        if (stored) {
          const list: CircuitRecord[] = JSON.parse(stored);
          const found = list.find((c) => c.id === circuitUUID);
          if (found) {
            isUpdate = true;
            versionNum = (found.version_number || 1) + 1;
          }
        }
      } catch {}

      result = {
        id: circuitUUID,
        owner_id: user.id,
        title: serializedCircuit.title,
        description: serializedCircuit.description,
        circuit_data: serializedCircuit,
        visibility: options?.visibility ?? 'private',
        category: options?.category ?? 'general',
        thumbnail_url: null,
        share_token: null,
        version_number: versionNum,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        last_opened_at: new Date().toISOString(),
      };
    }

    // 3. Mirror into local storage cache
    circuitService.saveToLocalCache(user.id, result);

    // 4. Record Activity Log
    const actionName = isUpdate ? 'CIRCUIT_SAVED' : 'CIRCUIT_CREATED';
    const logRecord: ActivityLogRecord = {
      id: ensureUUID(),
      user_id: user.id,
      action: actionName,
      entity_type: 'circuit',
      entity_id: circuitUUID,
      metadata: {
        title: serializedCircuit.title,
        components_count: serializedCircuit.components.length,
        wires_count: serializedCircuit.wires.length,
        version_number: versionNum,
      },
      created_at: new Date().toISOString(),
    };

    circuitService.saveLocalActivityLog(user.id, logRecord);

    if (isSupabaseConfigured) {
      supabase.from('activity_logs').insert(logRecord).then();
    }

    // 5. Trigger notification
    notificationService.addNotification(user.id, {
      title: isUpdate ? 'Circuit Saved' : 'Circuit Created',
      message: `"${serializedCircuit.title}" saved successfully (v${versionNum}, User ID: ${user.id.slice(0, 8)}...).`,
      type: 'circuit',
      metadata: { circuitId: circuitUUID },
    });

    return result;
  },

  // Duplicate an existing circuit into a new user circuit
  duplicateCircuit: async (sourceCircuit: CircuitData, newTitle?: string): Promise<CircuitRecord> => {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Authentication required to duplicate circuits.');

    const newId = ensureUUID();
    const clonedCircuit: CircuitData = {
      ...sourceCircuit,
      id: newId,
      title: newTitle || `${sourceCircuit.title || 'Circuit'} (Copy)`,
    };

    const saved = await circuitService.saveCircuit(clonedCircuit, {
      visibility: 'private',
      category: 'general',
      createSnapshot: true,
      changeSummary: 'Duplicated from existing workspace',
    });

    notificationService.addNotification(user.id, {
      title: 'Circuit Cloned',
      message: `"${clonedCircuit.title}" duplicated into your cloud repository.`,
      type: 'success',
      metadata: { circuitId: newId },
    });

    return saved;
  },

  // Delete circuit
  deleteCircuit: async (circuitId: string): Promise<void> => {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Authentication required.');

    // Remove from local storage cache
    try {
      const key = circuitService.getLocalCircuitsKey(user.id);
      const stored = localStorage.getItem(key);
      if (stored) {
        const list: CircuitRecord[] = JSON.parse(stored);
        localStorage.setItem(key, JSON.stringify(list.filter((c) => c.id !== circuitId)));
      }
    } catch {}

    // Remove from Supabase
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('circuits')
          .delete()
          .eq('id', circuitId)
          .eq('owner_id', user.id);
      } catch (e) {
        console.warn('Supabase delete warning:', e);
      }
    }

    await circuitService.logActivity('CIRCUIT_DELETED', 'circuit', circuitId);

    notificationService.addNotification(user.id, {
      title: 'Circuit Removed',
      message: `Circuit was permanently removed from your account.`,
      type: 'warning',
    });
  },

  // Fetch recent user activity logs
  getUserActivity: async (limit: number = 20): Promise<ActivityLogRecord[]> => {
    const user = await authService.getCurrentUser();
    if (!user) return [];

    let supaLogs: ActivityLogRecord[] = [];
    if (isSupabaseConfigured) {
      try {
        const { data } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (data) supaLogs = data as ActivityLogRecord[];
      } catch (e) {
        console.warn('Supabase activity logs error:', e);
      }
    }

    let localLogs: ActivityLogRecord[] = [];
    try {
      const stored = localStorage.getItem(circuitService.getLocalLogsKey(user.id));
      if (stored) localLogs = JSON.parse(stored);
    } catch {}

    const map = new Map<string, ActivityLogRecord>();
    localLogs.forEach((l) => map.set(l.id, l));
    supaLogs.forEach((l) => map.set(l.id, l));

    return Array.from(map.values())
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  },

  // Log arbitrary action
  logActivity: async (
    action: string,
    entityType: string,
    entityId?: string | null,
    metadata?: Record<string, any>
  ): Promise<void> => {
    const user = await authService.getCurrentUser();
    if (!user) return;

    const logRecord: ActivityLogRecord = {
      id: ensureUUID(),
      user_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      metadata: metadata || {},
      created_at: new Date().toISOString(),
    };

    circuitService.saveLocalActivityLog(user.id, logRecord);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('activity_logs').insert(logRecord);
      } catch (err) {
        console.warn('Could not log activity to Supabase:', err);
      }
    }
  },
};
