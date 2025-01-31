-- Enable the pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable the cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create rate limits table
create table if not exists public.rate_limits (
  id uuid default gen_random_uuid() primary key,
  key text not null,
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for faster lookups
create index if not exists rate_limits_key_timestamp_idx on public.rate_limits (key, timestamp);

-- Add RLS policies
alter table public.rate_limits enable row level security;

-- Only allow system to access rate limits
create policy "System access only"
  on public.rate_limits
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Add function to clean up old rate limits
create or replace function clean_old_rate_limits()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete entries older than 24 hours
  delete from public.rate_limits
  where timestamp < (extract(epoch from now()) * 1000)::bigint - (24 * 60 * 60 * 1000);
end;
$$;

-- Create a scheduled job to clean up old rate limits
select
  cron.schedule(
    'clean_old_rate_limits_job',
    '0 0 * * *', -- Run at midnight every day
    'select clean_old_rate_limits();'
  );
