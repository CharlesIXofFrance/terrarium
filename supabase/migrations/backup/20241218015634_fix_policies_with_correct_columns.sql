-- Drop ALL existing policies first
drop policy if exists "Users can update own profile" on "public"."profiles";
drop policy if exists "Enable read access for authenticated users" on "public"."profiles";
drop policy if exists "Service role can manage profiles" on "public"."profiles";
drop policy if exists "Community admins can read all profiles" on "public"."profiles";
drop policy if exists "Community admins can update community profiles" on "public"."profiles";
drop policy if exists "Users can read profiles" on "public"."profiles";
drop policy if exists "Enable read access for authenticated users" on "public"."community_admins";
drop policy if exists "Enable community admins to manage their communities" on "public"."community_admins";
drop policy if exists "Enable read access for all users" on "public"."community_admins";
drop policy if exists "Enable insert for authenticated users" on "public"."community_admins";
drop policy if exists "Enable update for users based on email" on "public"."community_admins";
drop policy if exists "Enable delete for users based on email" on "public"."community_admins";

-- Enable RLS
alter table "public"."profiles" enable row level security;
alter table "public"."community_admins" enable row level security;

-- Create new policies for profiles
create policy "Enable read access for authenticated users"
on "public"."profiles"
as permissive
for select
to authenticated
using (true);

create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Service role can manage profiles"
on "public"."profiles"
as permissive
for all
to service_role
using (true)
with check (true);

-- Create new policies for community_admins
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
