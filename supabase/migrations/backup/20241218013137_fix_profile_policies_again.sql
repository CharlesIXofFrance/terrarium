-- Drop existing policies
drop policy if exists "Users can create their own profile" on "public"."profiles";
drop policy if exists "Users can read their own profile" on "public"."profiles";
drop policy if exists "Users can update their own profile" on "public"."profiles";
drop policy if exists "Service role can manage profiles" on "public"."profiles";
drop policy if exists "Enable read access for all users" on "public"."profiles";

-- Enable RLS
alter table "public"."profiles" enable row level security;

-- Allow the trigger function to create profiles
create policy "Service role can manage profiles"
on "public"."profiles"
as permissive
for all
to service_role
using (true)
with check (true);

-- Allow users to read their own profile and profiles they have access to
create policy "Users can read profiles"
on "public"."profiles"
as permissive
for select
to authenticated
using (true);  -- Allow reading all profiles for now, we can restrict this later

-- Allow users to update their own profile
create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Allow users to create their own profile (as a fallback)
create policy "Users can create own profile"
on "public"."profiles"
as permissive
for insert
to authenticated
with check (auth.uid() = id);
