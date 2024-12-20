-- Enable RLS
alter table "public"."profiles" enable row level security;

-- Allow users to create their own profile
create policy "Users can create their own profile"
on "public"."profiles"
as permissive
for insert
to authenticated
with check (auth.uid() = id);

-- Allow users to read their own profile
create policy "Users can read their own profile"
on "public"."profiles"
as permissive
for select
to authenticated
using (auth.uid() = id);

-- Allow users to update their own profile
create policy "Users can update their own profile"
on "public"."profiles"
as permissive
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Allow the trigger function to create profiles
create policy "Service role can manage profiles"
on "public"."profiles"
as permissive
for all
to service_role
using (true)
with check (true);
