import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().min(1, 'Supabase URL is required'),
  SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anonymous key is required'),
});

// Load and validate environment variables
const processEnv = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Validate environment variables
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error(
    '❌ Invalid environment variables:',
    parsed.error.flatten().fieldErrors
  );
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;
