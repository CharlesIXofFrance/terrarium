drop policy "App admins have full access" on "public"."profiles";

drop policy "Community admins can read all profiles" on "public"."profiles";

drop policy "Community admins can update community profiles" on "public"."profiles";

drop policy "Public profiles are viewable by everyone" on "public"."profiles";

drop policy "Users can insert their own profile" on "public"."profiles";

drop policy "Users can read all profiles" on "public"."profiles";

drop policy "Users can update own profile" on "public"."profiles";

drop policy "Users can update their own profile" on "public"."profiles";

alter table "public"."community_members" drop constraint "community_members_community_id_user_id_key";

alter table "public"."community_members" drop constraint "community_members_user_id_fkey";

drop index if exists "public"."community_members_community_id_user_id_key";

alter table "public"."communities" add column "banner_url" text;

alter table "public"."communities" add column "description" text;

alter table "public"."communities" add column "logo_url" text;

alter table "public"."communities" add column "owner_id" uuid not null;

alter table "public"."communities" add column "settings" jsonb default '{}'::jsonb;

alter table "public"."communities" add column "slug" text not null;

alter table "public"."communities" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."communities" alter column "updated_at" set default timezone('utc'::text, now());

alter table "public"."community_members" drop column "user_id";

alter table "public"."community_members" add column "profile_id" uuid not null;

alter table "public"."community_members" add column "role" text not null default 'member'::text;

alter table "public"."community_members" add column "updated_at" timestamp with time zone not null default timezone('utc'::text, now());

alter table "public"."community_members" alter column "community_id" set not null;

alter table "public"."community_members" alter column "created_at" set default timezone('utc'::text, now());

alter table "public"."profiles" add column "profile_complete" integer not null default 0;

alter table "public"."profiles" alter column "email" set not null;

alter table "public"."profiles" alter column "full_name" set not null;

CREATE UNIQUE INDEX communities_slug_key ON public.communities USING btree (slug);

CREATE UNIQUE INDEX community_members_community_id_profile_id_key ON public.community_members USING btree (community_id, profile_id);

CREATE INDEX profiles_email_idx ON public.profiles USING btree (email);

CREATE UNIQUE INDEX profiles_email_key ON public.profiles USING btree (email);

alter table "public"."communities" add constraint "communities_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."communities" validate constraint "communities_owner_id_fkey";

alter table "public"."communities" add constraint "communities_slug_key" UNIQUE using index "communities_slug_key";

alter table "public"."community_members" add constraint "community_members_community_id_profile_id_key" UNIQUE using index "community_members_community_id_profile_id_key";

alter table "public"."community_members" add constraint "community_members_profile_id_fkey" FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."community_members" validate constraint "community_members_profile_id_fkey";

alter table "public"."community_members" add constraint "community_members_role_check" CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text]))) not valid;

alter table "public"."community_members" validate constraint "community_members_role_check";

alter table "public"."profiles" add constraint "profiles_email_key" UNIQUE using index "profiles_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at, profile_complete)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member'),
    NOW(),
    NOW(),
    0
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log other errors but don't fail
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$function$
;

create policy "Authenticated users can create communities"
on "public"."communities"
as permissive
for insert
to public
with check ((auth.role() = 'authenticated'::text));


create policy "Communities are viewable by everyone"
on "public"."communities"
as permissive
for select
to public
using (true);


create policy "Community owners can update their communities"
on "public"."communities"
as permissive
for update
to public
using ((auth.uid() = owner_id));


create policy "Community members are viewable by everyone"
on "public"."community_members"
as permissive
for select
to public
using (true);


create policy "Community owners can manage members"
on "public"."community_members"
as permissive
for all
to public
using ((auth.uid() IN ( SELECT communities.owner_id
   FROM communities
  WHERE (communities.id = community_members.community_id))));


create policy "Enable admin access"
on "public"."profiles"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM auth.users
  WHERE ((users.id = auth.uid()) AND ((users.raw_user_meta_data ->> 'role'::text) = 'app_admin'::text)))));


create policy "Enable community admin read access"
on "public"."profiles"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM community_admins
  WHERE (community_admins.admin_id = auth.uid()))));


create policy "Enable community admin update access"
on "public"."profiles"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM community_admins
  WHERE (community_admins.admin_id = auth.uid()))))
with check ((EXISTS ( SELECT 1
   FROM community_admins
  WHERE (community_admins.admin_id = auth.uid()))));


create policy "Enable insert for authenticated users"
on "public"."profiles"
as permissive
for insert
to public
with check (((auth.uid() = id) OR (auth.role() = 'service_role'::text)));


create policy "Enable read access for all users"
on "public"."profiles"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on id"
on "public"."profiles"
as permissive
for update
to public
using (((auth.uid() = id) OR (auth.role() = 'service_role'::text)))
with check (((auth.uid() = id) OR (auth.role() = 'service_role'::text)));



