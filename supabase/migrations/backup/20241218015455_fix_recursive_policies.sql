-- Drop any existing policies that might be causing recursion
drop policy if exists "Community admins can read all profiles" on "public"."profiles";
drop policy if exists "Community admins can update community profiles" on "public"."profiles";
drop policy if exists "Users can read profiles" on "public"."profiles";
drop policy if exists "Enable read access for authenticated users" on "public"."profiles";
drop policy if exists "Users can update own profile" on "public"."profiles";
drop policy if exists "Service role can manage profiles" on "public"."profiles";
drop policy if exists "profiles_select_policy" on "public"."profiles";
drop policy if exists "profiles_update_policy" on "public"."profiles";
drop policy if exists "profiles_service_role_policy" on "public"."profiles";
drop policy if exists "profiles_insert_policy" on "public"."profiles";

-- Enable RLS
alter table "public"."profiles" enable row level security;

-- Simple policy to allow authenticated users to read all profiles
create policy "Enable read access for authenticated users"
on "public"."profiles"
as permissive
for select
to authenticated
using (true);

-- Allow users to update their own profile
create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Allow service role to manage profiles (for trigger function)
create policy "Service role can manage profiles"
on "public"."profiles"
as permissive
for all
to service_role
using (true)
with check (true);

-- Drop any existing policies on community_admins table
drop policy if exists "Enable read access for all users" on "public"."community_admins";
drop policy if exists "Enable insert for authenticated users" on "public"."community_admins";
drop policy if exists "Enable update for users based on email" on "public"."community_admins";
drop policy if exists "Enable delete for users based on email" on "public"."community_admins";

-- Simple policies for community_admins table
create policy "Enable read access for authenticated users"
on "public"."community_admins"
as permissive
for select
to authenticated
using (true);

create policy "Enable community admins to manage their communities"
on "public"."community_admins"
as permissive
for all
to authenticated
using (auth.uid() = admin_id)
with check (auth.uid() = admin_id);
