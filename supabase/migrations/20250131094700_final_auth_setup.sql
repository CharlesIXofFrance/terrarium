-- Drop existing functions to avoid conflicts
DROP FUNCTION IF EXISTS public.create_or_update_membership;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP FUNCTION IF EXISTS public.handle_user_delete;

-- Create updated functions with proper return types
CREATE OR REPLACE FUNCTION public.create_or_update_membership(
  p_profile_id uuid,
  p_community_id uuid,
  p_role text DEFAULT 'member'::text,
  p_status text DEFAULT 'active'::text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_membership_id uuid;
BEGIN
  INSERT INTO community_members (
    profile_id,
    community_id,
    role,
    status,
    onboarding_completed
  )
  VALUES (
    p_profile_id,
    p_community_id,
    p_role,
    p_status,
    false
  )
  ON CONFLICT (profile_id, community_id) DO UPDATE
  SET
    role = excluded.role,
    status = excluded.status
  RETURNING id INTO v_membership_id;

  RETURN jsonb_build_object(
    'id', v_membership_id,
    'profile_id', p_profile_id,
    'community_id', p_community_id,
    'role', p_role,
    'status', p_status
  );
EXCEPTION WHEN others THEN
  RAISE LOG 'Error in create_or_update_membership: %', SQLERRM;
  RETURN NULL;
END;
$$;

-- Add other consolidated auth functions here...
