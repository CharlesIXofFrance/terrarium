import { z } from 'zod';

const envSchema = z.object({
  RECRUITCRM_API_KEY: z.string().min(1, 'RecruitCRM API key is required'),
});

// Load and validate environment variables
const processEnv = {
  RECRUITCRM_API_KEY: import.meta.env.VITE_RECRUITCRM_KEY || process.env.RECRUITCRM_KEY,
};

// Validate environment variables
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;