-- Create rate limiting table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  email text NOT NULL,
  attempts integer DEFAULT 0,
  last_attempt timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(email)
);

-- Add RLS policies
ALTER TABLE public.auth_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow system to read/write rate limits
CREATE POLICY "System can manage rate limits"
  ON public.auth_rate_limits
  USING (auth.role() = 'service_role');

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_email 
  ON public.auth_rate_limits(email);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_auth_rate_limits_updated_at 
  ON public.auth_rate_limits;

CREATE TRIGGER update_auth_rate_limits_updated_at
  BEFORE UPDATE ON public.auth_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
