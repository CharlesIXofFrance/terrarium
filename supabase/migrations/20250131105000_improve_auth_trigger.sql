-- Drop existing function
DROP FUNCTION IF EXISTS handle_auth_user_created CASCADE;

-- Recreate auth trigger with better logging and error handling
CREATE OR REPLACE FUNCTION handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  community_data RECORD;
  now_timestamp timestamp with time zone;
  user_metadata jsonb;
BEGIN
  -- Only run on email confirmation
  IF NEW.email_confirmed_at IS NULL THEN
    RAISE LOG 'User % not confirmed yet, skipping', NEW.id;
    RETURN NEW;
  END IF;

  -- Log all metadata for debugging
  RAISE LOG 'Processing user %: metadata=%', NEW.id, NEW.raw_user_meta_data;
  
  -- Get current timestamp and metadata
  now_timestamp := timezone('utc'::text, now());
  user_metadata := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  
  -- Create profile
  BEGIN
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      profile_complete,
      created_at,
      updated_at,
      onboarding_step,
      community_metadata,
      metadata
    ) VALUES (
      NEW.id,
      NEW.email,
      user_metadata->>'first_name',
      user_metadata->>'last_name',
      (user_metadata->>'role')::user_role,
      false,
      now_timestamp,
      now_timestamp,
      1,
      jsonb_build_object(
        'community_id', user_metadata->>'community_id',
        'community_slug', user_metadata->>'community_slug'
      ),
      '{}'::jsonb
    );
    RAISE LOG 'Created profile for user %', NEW.id;
  EXCEPTION WHEN unique_violation THEN
    RAISE LOG 'Profile already exists for user %, skipping', NEW.id;
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;

  -- Create community membership if community exists
  IF user_metadata->>'community_id' IS NOT NULL AND user_metadata->>'community_slug' IS NOT NULL THEN
    BEGIN
      INSERT INTO community_members (
        profile_id,
        community_id,
        role,
        status,
        onboarding_completed,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        (user_metadata->>'community_id')::uuid,
        (user_metadata->>'role')::user_role,
        'active',
        false,
        now_timestamp,
        now_timestamp
      );
      RAISE LOG 'Created community membership for user % in community %', 
        NEW.id, user_metadata->>'community_id';
    EXCEPTION WHEN unique_violation THEN
      RAISE LOG 'Membership already exists for user % in community %, skipping',
        NEW.id, user_metadata->>'community_id';
    WHEN OTHERS THEN
      RAISE LOG 'Error creating community membership for user %: %', NEW.id, SQLERRM;
    END;
  ELSE
    RAISE LOG 'No community data found in metadata for user %', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_auth_user_created();

-- Update RLS policies for community members
DROP POLICY IF EXISTS "Allow member insert with community context" ON public.community_members;
CREATE POLICY "Allow member insert with community context"
ON public.community_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.raw_user_meta_data->>'community_id' = community_id::text
  )
);
