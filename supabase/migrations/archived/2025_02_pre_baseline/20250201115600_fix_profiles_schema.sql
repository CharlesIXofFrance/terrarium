-- Drop dependent objects first
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_auth_user_created();

-- Drop existing profiles table and its policies
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Allow auth admin to manage profiles" on public.profiles;
drop table if exists public.profiles cascade;

-- Recreate profiles table with correct schema
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  role public.app_role not null default 'member'::public.app_role,
  onboarding_complete boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
  ON public.profiles
  FOR ALL
  USING (auth.role() = 'service_role');
alter table public.profiles enable row level security;

-- Allow users to view their own profile
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Allow supabase_auth_admin to manage all profiles
create policy "Allow auth admin to manage profiles"
on public.profiles
to supabase_auth_admin
using (true)
with check (true);

-- Grant necessary permissions
grant all on public.profiles to supabase_auth_admin;
grant select, update on public.profiles to authenticated;
