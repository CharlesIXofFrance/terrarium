-- Drop the old trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_auth_user_created();

-- Update profiles table
alter table public.profiles 
  add column if not exists first_name text,
  add column if not exists last_name text;

-- Copy data from full_name to first_name and last_name
update public.profiles
set 
  first_name = split_part(full_name, ' ', 1),
  last_name = split_part(full_name, ' ', 2)
where full_name is not null;

-- Drop full_name column
alter table public.profiles
  drop column if exists full_name;

-- Create function to handle new user creation
create or replace function public.handle_auth_user_created()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
declare
  first_name text;
  last_name text;
begin
  -- Extract first and last name from metadata
  first_name := new.raw_user_meta_data->>'first_name';
  last_name := new.raw_user_meta_data->>'last_name';

  -- Create profile
  insert into public.profiles (
    id,
    email,
    first_name,
    last_name,
    role,
    onboarding_complete,
    metadata
  )
  values (
    new.id,
    new.email,
    first_name,
    last_name,
    (new.raw_user_meta_data->>'role')::public.app_role,
    false,
    '{}'::jsonb
  );

  return new;
end;
$$;

-- Create trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_auth_user_created();
