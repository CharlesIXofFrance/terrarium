-- Create sequences first
CREATE SEQUENCE IF NOT EXISTS public.auth_logs_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.auth_rate_limits_id_seq;

-- Create auth_logs table
CREATE TABLE IF NOT EXISTS public.auth_logs (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    event_type text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create auth_rate_limits table
CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
    id bigserial PRIMARY KEY,
    ip_address inet NOT NULL,
    event_type text NOT NULL,
    attempts integer DEFAULT 1,
    last_attempt_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE (ip_address, event_type)
);

-- Grant access to service role
GRANT ALL ON public.auth_logs TO service_role;
GRANT ALL ON public.auth_rate_limits TO service_role;
GRANT ALL ON SEQUENCE public.auth_logs_id_seq TO service_role;
GRANT ALL ON SEQUENCE public.auth_rate_limits_id_seq TO service_role;
