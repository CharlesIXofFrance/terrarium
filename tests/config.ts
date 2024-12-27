import { createClient } from '@supabase/supabase-js';

// Development environment Supabase client
// Uses environment variables from .env file
export const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,     // https://terrarium.supabase.co
  process.env.VITE_SUPABASE_ANON_KEY!      // Development environment anon key
);

// Admin client for test setup/cleanup
// Uses service role key for administrative actions
export const adminClient = createClient(
  process.env.VITE_SUPABASE_URL!,     // Same URL as above
  process.env.VITE_SUPABASE_SERVICE_ROLE!  // Development environment service role key
);
