import { supabase } from '../../lib/supabase';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

export class RateLimitError extends Error {
  constructor(
    public retryAfterMs: number,
    message: string = 'Too many attempts. Please try again later.'
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class RateLimiter {
  private readonly tableName = 'rate_limits';

  constructor(private config: RateLimitConfig) {}

  async checkLimit(key: string): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Clean up old entries and get attempt count
    const { count, error: countError } = await supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })
      .eq('key', key)
      .gte('timestamp', windowStart);

    if (countError) {
      console.error('Error checking rate limit:', countError);
      return; // Fail open if we can't check the rate limit
    }

    if (count && count >= this.config.maxAttempts) {
      // Check if user is blocked
      const { data: blockData } = await supabase
        .from(this.tableName)
        .select('timestamp')
        .eq('key', key)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (blockData) {
        const blockEnd = blockData.timestamp + this.config.blockDurationMs;
        if (now < blockEnd) {
          throw new RateLimitError(blockEnd - now);
        }
      }

      // Clean up old attempts
      await supabase
        .from(this.tableName)
        .delete()
        .eq('key', key)
        .lt('timestamp', windowStart);
    }

    // Record this attempt
    await supabase.from(this.tableName).insert({
      key,
      timestamp: now,
    });
  }
}

// Default configurations for different actions
export const rateLimitConfigs = {
  login: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  register: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  resetPassword: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;
