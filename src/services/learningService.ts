import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Database, ExerciseCategory, ExerciseDifficulty } from '../lib/database.types';
import { authService } from './authService';

export type LearningExercise = Database['public']['Views']['view_published_exercises']['Row'];
export type ExerciseAttempt = Database['public']['Tables']['exercise_attempts']['Row'];

export interface SubmissionResult {
  attempt_id: string;
  is_correct: boolean;
  score: number;
  attempt_number: number;
  explanation: string;
}

export const learningService = {
  // Fetch published learning exercises (without leaking answers)
  getExercises: async (category?: ExerciseCategory, difficulty?: ExerciseDifficulty): Promise<LearningExercise[]> => {
    if (!isSupabaseConfigured) return [];

    let query = supabase
      .from('view_published_exercises')
      .select('*')
      .order('created_at', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching learning exercises:', error);
      throw error;
    }

    return (data || []) as LearningExercise[];
  },

  // Submit exercise attempt for server-side grading
  submitAttempt: async (exerciseId: string, submittedAnswer: any): Promise<SubmissionResult> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Please sign in to submit learning exercises and track progress.');

    const { data, error } = await supabase.rpc('submit_exercise_attempt', {
      p_exercise_id: exerciseId,
      p_submitted_answer: submittedAnswer,
    });

    if (error) {
      console.error('Error submitting exercise attempt:', error);
      throw error;
    }

    return data as unknown as SubmissionResult;
  },

  // Get user attempts
  getUserAttempts: async (exerciseId?: string): Promise<ExerciseAttempt[]> => {
    if (!isSupabaseConfigured) return [];

    const user = await authService.getCurrentUser();
    if (!user) return [];

    let query = supabase
      .from('exercise_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false });

    if (exerciseId) {
      query = query.eq('exercise_id', exerciseId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching attempts:', error);
      throw error;
    }
    return (data || []) as ExerciseAttempt[];
  },
};
