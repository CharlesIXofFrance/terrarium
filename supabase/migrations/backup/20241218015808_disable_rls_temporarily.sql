-- Temporarily disable RLS on both tables
alter table "public"."profiles" disable row level security;
alter table "public"."community_admins" disable row level security;

-- Drop all policies to start fresh
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

-- Let's check if your profile exists and create it if not
INSERT INTO profiles (id, email, full_name, role, created_at, updated_at, profile_complete)
SELECT 
  id,
  email,
  email as full_name,
  'member'::user_role as role,
  created_at,
  created_at,
  0
FROM auth.users
WHERE id = 'bd21a01c-606a-4227-9ba3-3d146d194b91'
AND NOT EXISTS (
  SELECT 1 FROM profiles WHERE id = 'bd21a01c-606a-4227-9ba3-3d146d194b91'
);
