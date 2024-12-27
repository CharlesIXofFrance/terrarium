-- Create function to check file size
CREATE OR REPLACE FUNCTION storage.check_file_size()
RETURNS trigger AS $$
BEGIN
  -- 5MB in bytes
  IF NEW.metadata->>'size' IS NOT NULL AND (NEW.metadata->>'size')::bigint > 5242880 THEN
    RAISE EXCEPTION 'File size exceeds 5MB limit';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for file size check
DROP TRIGGER IF EXISTS check_file_size_trigger ON storage.objects;
CREATE TRIGGER check_file_size_trigger
  BEFORE INSERT OR UPDATE
  ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.check_file_size();

-- Add rate limiting function
CREATE OR REPLACE FUNCTION storage.check_upload_rate()
RETURNS trigger AS $$
DECLARE
  upload_count INTEGER;
BEGIN
  -- Count uploads in the last hour for this user
  SELECT COUNT(*)
  INTO upload_count
  FROM storage.objects
  WHERE auth.uid() = owner
    AND created_at > NOW() - INTERVAL '1 hour';

  -- Limit to 100 uploads per hour
  IF upload_count >= 100 THEN
    RAISE EXCEPTION 'Upload rate limit exceeded (100 per hour)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS check_upload_rate_trigger ON storage.objects;
CREATE TRIGGER check_upload_rate_trigger
  BEFORE INSERT
  ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.check_upload_rate();

-- Create audit log table
CREATE TABLE IF NOT EXISTS storage.audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  object_path text NOT NULL,
  community_id uuid,
  metadata jsonb
);

-- Create audit log function
CREATE OR REPLACE FUNCTION storage.log_object_event()
RETURNS trigger AS $$
DECLARE
  community_id uuid;
  action_type text;
  object_name text;
  bucket_id text;
  size_value text;
  mimetype_value text;
BEGIN
  -- Set object name based on operation
  object_name := CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.name 
    ELSE NEW.name 
  END;

  -- Set bucket_id based on operation
  bucket_id := CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.bucket_id 
    ELSE NEW.bucket_id 
  END;

  -- Extract community ID from path
  SELECT id INTO community_id
  FROM communities
  WHERE position(slug in object_name) = 1
  LIMIT 1;

  -- Set action type
  action_type := CASE TG_OP
    WHEN 'INSERT' THEN 'upload'
    WHEN 'DELETE' THEN 'delete'
    WHEN 'UPDATE' THEN 'update'
  END;

  -- Get size and mimetype based on operation
  size_value := CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.metadata->>'size'
    ELSE NEW.metadata->>'size'
  END;

  mimetype_value := CASE 
    WHEN TG_OP = 'DELETE' THEN OLD.metadata->>'mimetype'
    ELSE NEW.metadata->>'mimetype'
  END;

  -- Insert audit log
  INSERT INTO storage.audit_logs (
    user_id,
    action,
    object_path,
    community_id,
    metadata
  ) VALUES (
    auth.uid(),
    action_type,
    object_name,
    community_id,
    jsonb_build_object(
      'bucket_id', bucket_id,
      'size', size_value,
      'mimetype', mimetype_value
    )
  );

  RETURN CASE 
    WHEN TG_OP = 'DELETE' THEN OLD 
    ELSE NEW 
  END;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS log_object_event_trigger ON storage.objects;
CREATE TRIGGER log_object_event_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON storage.objects
  FOR EACH ROW
  EXECUTE FUNCTION storage.log_object_event();

-- Create policy for audit logs
CREATE POLICY "Allow community owners to view their audit logs"
  ON storage.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM communities
      WHERE id = audit_logs.community_id
      AND owner_id = auth.uid()
    )
  );
