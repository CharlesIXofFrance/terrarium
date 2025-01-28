import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Initialize session
supabase.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    console.log('Initial session loaded');
  }
});

// Subscribe to auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state change:', { event, hasSession: !!session });
});
