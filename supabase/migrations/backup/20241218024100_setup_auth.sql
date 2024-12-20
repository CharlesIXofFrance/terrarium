-- Drop all existing policies
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

-- Drop and recreate the trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at,
    profile_complete
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member'::user_role),
    NOW(),
    NOW(),
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
