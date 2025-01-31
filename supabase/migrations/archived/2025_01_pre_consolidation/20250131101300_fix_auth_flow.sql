-- Drop existing functions and policies
DROP FUNCTION IF EXISTS handle_auth_user_created CASCADE;
DROP POLICY IF EXISTS "Allow member insert with community context" ON public.community_members;

-- Recreate auth trigger function with better community handling
CREATE OR REPLACE FUNCTION handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  community_data RECORD;
  now_timestamp timestamp with time zone;
  user_metadata jsonb;
  user_role_val text;
  community_slug text;
BEGIN
  -- Log all state changes for debugging
  RAISE LOG 'Auth trigger fired for user %: metadata=%', NEW.id, NEW.raw_user_meta_data;

  -- Only run when email is verified
  IF (OLD.confirmed_at IS NOT NULL) OR (NEW.confirmed_at IS NULL) THEN
    RAISE LOG 'Skipping trigger for user % - already processed', NEW.id;
    RETURN NEW;
  END IF;

  -- Get current timestamp and metadata
  now_timestamp := timezone('utc'::text, now());
  user_metadata := NEW.raw_user_meta_data;

  -- Validate metadata
  IF user_metadata IS NULL OR user_metadata = '{}'::jsonb THEN
    RAISE LOG 'No metadata found for user %, skipping profile creation', NEW.id;
    RETURN NEW;
  END IF;

  -- Get and validate role and community
  user_role_val := COALESCE(user_metadata->>'role', 'member');
  community_slug := user_metadata->>'community_slug';

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
      COALESCE(user_metadata->>'firstName', 'Unknown'),
      COALESCE(user_metadata->>'lastName', 'User'),
      user_role_val::user_role,
      false,
      now_timestamp,
      now_timestamp,
      1,
      '{}',
      '{}'
    );
    RAISE LOG 'Created profile for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;

  -- Create community membership if community exists
  IF community_slug IS NOT NULL THEN
    SELECT * INTO community_data
    FROM communities
    WHERE slug = community_slug;

    IF community_data IS NOT NULL THEN
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
          community_data.id,
          user_role_val::user_role,
          'active',
          false,
          now_timestamp,
          now_timestamp
        );
        RAISE LOG 'Created community membership for user % in community %', NEW.id, community_data.id;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error creating community membership for user %: %', NEW.id, SQLERRM;
      END;
    ELSE
      RAISE LOG 'Community not found for slug: %', community_slug;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_user_created();

-- Update RLS policies for community members
CREATE POLICY "Allow member insert with community context"
ON public.community_members
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM communities c
    WHERE c.id = community_id
    AND c.slug = current_setting('request.headers'::text, true)::json->>'x-community-slug'
  )
);

-- Allow authenticated users to view their own memberships
CREATE POLICY "Users can view their own memberships"
ON public.community_members
FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
);
