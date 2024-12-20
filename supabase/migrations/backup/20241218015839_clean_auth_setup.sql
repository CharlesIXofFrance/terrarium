-- Start fresh by dropping all policies
DO $$ 
BEGIN
  -- Drop policies on profiles
  DROP POLICY IF EXISTS "Users can update own profile" ON "public"."profiles";
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."profiles";
  DROP POLICY IF EXISTS "Service role can manage profiles" ON "public"."profiles";
  DROP POLICY IF EXISTS "Community admins can read all profiles" ON "public"."profiles";
  DROP POLICY IF EXISTS "Community admins can update community profiles" ON "public"."profiles";
  DROP POLICY IF EXISTS "Users can read profiles" ON "public"."profiles";
  
  -- Drop policies on community_admins
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."community_admins";
  DROP POLICY IF EXISTS "Enable community admins to manage their communities" ON "public"."community_admins";
  DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."community_admins";
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "public"."community_admins";
  DROP POLICY IF EXISTS "Enable update for users based on email" ON "public"."community_admins";
  DROP POLICY IF EXISTS "Enable delete for users based on email" ON "public"."community_admins";
END $$;

-- Temporarily disable RLS
ALTER TABLE "public"."profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_admins" DISABLE ROW LEVEL SECURITY;

-- Ensure your profile exists
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
