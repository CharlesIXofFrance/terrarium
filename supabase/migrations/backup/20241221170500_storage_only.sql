-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Community assets are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload community assets" ON storage.objects;
DROP POLICY IF EXISTS "Community owners can update their assets" ON storage.objects;

-- Create storage bucket for community assets if it doesn't exist
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('community-assets', 'community-assets', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up storage policies
CREATE POLICY "Community assets are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'community-assets');

CREATE POLICY "Authenticated users can upload community assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'community-assets'
    AND (storage.foldername(name))[1] = (
        SELECT slug FROM communities
        WHERE owner_id = auth.uid()
        LIMIT 1
    )
);

CREATE POLICY "Community owners can update their assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'community-assets'
    AND (storage.foldername(name))[1] = (
        SELECT slug FROM communities
        WHERE owner_id = auth.uid()
        LIMIT 1
    )
);
