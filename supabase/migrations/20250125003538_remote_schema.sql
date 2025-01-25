set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_or_update_membership(p_profile_id uuid, p_community_id uuid, p_role text DEFAULT 'member'::text, p_status text DEFAULT 'active'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  v_membership_id uuid;
begin
  -- Try to insert first
  insert into community_members (
    profile_id,
    community_id,
    role,
    status,
    onboarding_completed
  )
  values (
    p_profile_id,
    p_community_id,
    p_role,
    p_status,
    false
  )
  on conflict (profile_id, community_id) do update
  set
    role = excluded.role,
    status = excluded.status
  returning id into v_membership_id;

  return jsonb_build_object(
    'id', v_membership_id,
    'profile_id', p_profile_id,
    'community_id', p_community_id,
    'role', p_role,
    'status', p_status
  );

exception when others then
  raise log 'Error in create_or_update_membership: %', SQLERRM;
  return null;
end;
$function$
;


