import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  RECRUITCRM_API_KEY: z.string().optional(),
  RECRUITCRM_API_URL: z.string().url().default('https://api.recruitcrm.io/v1'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

// Load environment variables
const loadedEnv = {
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RECRUITCRM_API_KEY: process.env.RECRUITCRM_API_KEY,
  RECRUITCRM_API_URL: process.env.RECRUITCRM_API_URL,
  NODE_ENV: process.env.NODE_ENV,
};

// Parse and validate environment variables
export const env = envSchema.parse(loadedEnv);

// Type definition for the validated environment
export type Env = z.infer<typeof envSchema>;
