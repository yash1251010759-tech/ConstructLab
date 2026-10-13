import { useState, useEffect, useCallback } from 'react';
import { authService, Profile } from '../services/authService';
import { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = authService.isConfigured();

  const refreshProfile = useCallback(async (userId?: string) => {
    try {
      const p = await authService.getProfile(userId);
      setProfile(p);
    } catch (e) {
      console.warn('Failed to load profile:', e);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Check initial session
    authService.getSession().then((session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        refreshProfile(currentUser.id).finally(() => {
          if (mounted) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen to changes (from Supabase or local session updates)
    const { data: { subscription } } = authService.onAuthStateChange(async (session) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await refreshProfile(currentUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [refreshProfile]);

  return {
    user,
    profile,
    loading,
    isConfigured,
    refreshProfile,
    signIn: authService.signIn.bind(authService),
    signUp: authService.signUp.bind(authService),
    demoLogin: authService.demoLogin.bind(authService),
    signOut: authService.signOut.bind(authService),
    updateProfile: authService.updateProfile.bind(authService),
    resetPassword: authService.resetPassword.bind(authService),
  };
}
