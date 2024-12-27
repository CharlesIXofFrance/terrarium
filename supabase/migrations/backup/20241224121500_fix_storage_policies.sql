-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Community owners can manage their assets" ON storage.objects;
DROP POLICY IF EXISTS "Community members can view assets" ON storage.objects;
DROP POLICY IF EXISTS "Service role bypass" ON storage.objects;

-- Drop existing bucket policies
DROP POLICY IF EXISTS "Community owners can manage their assets" ON storage.buckets;
DROP POLICY IF EXISTS "Community members can view assets" ON storage.buckets;
DROP POLICY IF EXISTS "Service role bypass" ON storage.buckets;
DROP POLICY IF EXISTS "Allow service role for buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Allow authenticated users to access buckets" ON storage.buckets;

-- Ensure storage schema exists and RLS is enabled
CREATE SCHEMA IF NOT EXISTS storage;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create service role bypass policy for objects
CREATE POLICY "Service role bypass"
    ON storage.objects FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create service role bypass policy for buckets
CREATE POLICY "Service role bypass"
    ON storage.buckets FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create community-assets bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'community-assets') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('community-assets', 'community-assets', false);
    END IF;
END $$;

-- Create bucket policies
CREATE POLICY "Allow service role for buckets"
    ON storage.buckets FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Allow authenticated users to access buckets"
    ON storage.buckets FOR ALL
    TO authenticated
    USING (name = 'community-assets');

-- Create policy for community owners on buckets
CREATE POLICY "Community owners can manage their assets"
    ON storage.buckets FOR ALL
    TO authenticated
    USING (
        id = 'community-assets'
        AND EXISTS (
            SELECT 1 FROM auth.users u
            JOIN profiles p ON p.id = u.id
            WHERE u.id = auth.uid()
            AND (
                (u.raw_app_meta_data->>'role' = 'community_admin')
                OR p.role = 'community_admin'
            )
        )
    )
    WITH CHECK (
        id = 'community-assets'
        AND EXISTS (
            SELECT 1 FROM auth.users u
            JOIN profiles p ON p.id = u.id
            WHERE u.id = auth.uid()
            AND (
                (u.raw_app_meta_data->>'role' = 'community_admin')
                OR p.role = 'community_admin'
            )
        )
    );

-- Create policy for community owners on objects
CREATE POLICY "Community owners can manage their assets"
    ON storage.objects FOR ALL
    TO authenticated
    USING (
        bucket_id = 'community-assets'
        AND (
            -- Allow service role full access
            current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
            OR
            -- Check if user is the community owner
            EXISTS (
                SELECT 1 FROM public.communities c
                WHERE c.owner_id = auth.uid()
                AND split_part(name, '/', 1) = c.slug
            )
        )
    )
    WITH CHECK (
        bucket_id = 'community-assets'
        AND (
            -- Allow service role full access
            current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
            OR
            -- Check if user is the community owner
            EXISTS (
                SELECT 1 FROM public.communities c
                WHERE c.owner_id = auth.uid()
                AND split_part(name, '/', 1) = c.slug
            )
        )
    );

-- Create policy for community members to view assets
CREATE POLICY "Community members can view assets"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'community-assets'
        AND (
            -- Allow service role full access
            current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
            OR
            -- Check if user is a member of the community
            EXISTS (
                SELECT 1 FROM public.community_members cm
                JOIN public.communities c ON c.id = cm.community_id
                WHERE cm.profile_id = auth.uid()
                AND split_part(name, '/', 1) = c.slug
            )
            OR
            -- Check if user is the community owner
            EXISTS (
                SELECT 1 FROM public.communities c
                WHERE c.owner_id = auth.uid()
                AND split_part(name, '/', 1) = c.slug
            )
        )
    );

-- Enable RLS on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT ALL ON SCHEMA storage TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO service_role;

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT SELECT ON storage.objects TO authenticated;
GRANT INSERT ON storage.objects TO authenticated;
GRANT UPDATE ON storage.objects TO authenticated;
GRANT DELETE ON storage.objects TO authenticated;
GRANT SELECT ON storage.buckets TO authenticated;

-- Grant access to auth schema
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;
