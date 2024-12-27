-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Community owners can upload assets" ON storage.objects;
DROP POLICY IF EXISTS "Community owners can update assets" ON storage.objects;
DROP POLICY IF EXISTS "Community owners can delete assets" ON storage.objects;
DROP POLICY IF EXISTS "Community members can view assets" ON storage.objects;

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'community-assets',
  'community-assets',
  false,
  5242880, -- 5MB limit
  array['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Revoke public access
REVOKE ALL ON storage.objects FROM anon, authenticated;
REVOKE ALL ON storage.buckets FROM anon, authenticated;

-- Grant basic access to authenticated users
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Create policies for community-assets bucket
CREATE POLICY "Community owners can upload assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'community-assets' AND
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = (storage.foldername(name))[1]::uuid
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Community owners can update assets"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'community-assets' AND
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = (storage.foldername(name))[1]::uuid
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Community owners can delete assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'community-assets' AND
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = (storage.foldername(name))[1]::uuid
      AND c.owner_id = auth.uid()
    )
  );

CREATE POLICY "Community members can view assets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'community-assets' AND
    (
      EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = (storage.foldername(name))[1]::uuid
        AND c.owner_id = auth.uid()
      ) OR
      EXISTS (
        SELECT 1 FROM community_members cm
        WHERE cm.community_id = (storage.foldername(name))[1]::uuid
        AND cm.profile_id = auth.uid()
        AND cm.role = 'member'
      )
    )
  );

-- Create triggers for file size and upload rate checks
CREATE OR REPLACE FUNCTION storage.check_file_size()
RETURNS trigger AS $$
BEGIN
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'File size exceeds limit of 5MB';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS check_file_size_trigger ON storage.objects;
CREATE TRIGGER check_file_size_trigger
  BEFORE INSERT ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.check_file_size();
