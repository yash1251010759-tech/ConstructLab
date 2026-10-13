import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Read environment variables with your production Supabase project defaults
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_PROJECT_URL ||
  'https://gjnaovvwwpchoeupaeia.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqbmFvdnZ3d3BjaG9ldXBhZWlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3OTg0NDcsImV4cCI6MjEwNzM3NDQ0N30.u81NB_t5zww_DFidJQ5zMURPWTMMiQRDWHvxq0Y6E00';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
