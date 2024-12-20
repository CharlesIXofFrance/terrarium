-- Drop existing policies first
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

-- Enable RLS on all tables
ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."community_admins" ENABLE ROW LEVEL SECURITY;

-- Profiles policies
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

CREATE POLICY "profiles_service_role_policy" 
ON "public"."profiles" 
FOR ALL 
TO service_role 
USING (true)
WITH CHECK (true);

-- Communities policies
CREATE POLICY "communities_select_policy" 
ON "public"."communities" 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "communities_insert_policy" 
ON "public"."communities" 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "communities_update_policy" 
ON "public"."communities" 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "communities_delete_policy" 
ON "public"."communities" 
FOR DELETE 
TO authenticated 
USING (auth.uid() = owner_id);

-- Community members policies
CREATE POLICY "community_members_select_policy" 
ON "public"."community_members" 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "community_members_insert_policy" 
ON "public"."community_members" 
FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_id 
    AND (c.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM community_admins ca 
        WHERE ca.community_id = c.id 
        AND ca.admin_id = auth.uid()
    ))
));

CREATE POLICY "community_members_update_policy" 
ON "public"."community_members" 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_id 
    AND (c.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM community_admins ca 
        WHERE ca.community_id = c.id 
        AND ca.admin_id = auth.uid()
    ))
));

CREATE POLICY "community_members_delete_policy" 
ON "public"."community_members" 
FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_id 
    AND (c.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM community_admins ca 
        WHERE ca.community_id = c.id 
        AND ca.admin_id = auth.uid()
    ))
));

-- Community admins policies
CREATE POLICY "community_admins_select_policy" 
ON "public"."community_admins" 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "community_admins_insert_policy" 
ON "public"."community_admins" 
FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_id 
    AND c.owner_id = auth.uid()
));

CREATE POLICY "community_admins_update_policy" 
ON "public"."community_admins" 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_id 
    AND c.owner_id = auth.uid()
));

CREATE POLICY "community_admins_delete_policy" 
ON "public"."community_admins" 
FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM communities c 
    WHERE c.id = community_id 
    AND c.owner_id = auth.uid()
));
