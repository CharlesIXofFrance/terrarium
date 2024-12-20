-- Drop all policies from all relevant tables
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('profiles', 'community_admins', 'communities', 'community_members')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Disable RLS on all tables temporarily
ALTER TABLE IF EXISTS "public"."profiles" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."community_admins" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."communities" DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS "public"."community_members" DISABLE ROW LEVEL SECURITY;

-- Drop and recreate community_admins table to remove any problematic triggers or dependencies
DROP TABLE IF EXISTS "public"."community_admins" CASCADE;

CREATE TABLE "public"."community_admins" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" uuid NOT NULL REFERENCES "public"."profiles"(id) ON DELETE CASCADE,
    "community_id" uuid NOT NULL REFERENCES "public"."communities"(id) ON DELETE CASCADE,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    UNIQUE ("admin_id", "community_id")
);

-- Create simple non-recursive policies
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_policy" 
ON "public"."profiles" 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "profiles_update_policy" 
ON "public"."profiles" 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role full access for auth hooks
CREATE POLICY "profiles_service_role_policy" 
ON "public"."profiles" 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);
