drop policy "Community settings read access for all users" on "public"."community_settings";

drop policy "Community settings update for community owners" on "public"."community_settings";

revoke delete on table "public"."community_settings" from "anon";

revoke insert on table "public"."community_settings" from "anon";

revoke references on table "public"."community_settings" from "anon";

revoke select on table "public"."community_settings" from "anon";

revoke trigger on table "public"."community_settings" from "anon";

revoke truncate on table "public"."community_settings" from "anon";

revoke update on table "public"."community_settings" from "anon";

revoke delete on table "public"."community_settings" from "authenticated";

revoke insert on table "public"."community_settings" from "authenticated";

revoke references on table "public"."community_settings" from "authenticated";

revoke select on table "public"."community_settings" from "authenticated";

revoke trigger on table "public"."community_settings" from "authenticated";

revoke truncate on table "public"."community_settings" from "authenticated";

revoke update on table "public"."community_settings" from "authenticated";

revoke delete on table "public"."community_settings" from "service_role";

revoke insert on table "public"."community_settings" from "service_role";

revoke references on table "public"."community_settings" from "service_role";

revoke select on table "public"."community_settings" from "service_role";

revoke trigger on table "public"."community_settings" from "service_role";

revoke truncate on table "public"."community_settings" from "service_role";

revoke update on table "public"."community_settings" from "service_role";

alter table "public"."community_settings" drop constraint "community_settings_community_id_fkey";

alter table "public"."community_settings" drop constraint "unique_community_settings";

alter table "public"."community_settings" drop constraint "community_settings_pkey";

drop index if exists "public"."community_settings_pkey";

drop index if exists "public"."unique_community_settings";

drop table "public"."community_settings";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.cleanup_expired_temporary_profiles()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM temporary_profiles WHERE expires_at < now();
END;
$function$
;

CREATE OR REPLACE FUNCTION public.ensure_profile_required_fields()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.first_name := COALESCE(NEW.first_name, 'Unknown');
  NEW.last_name := COALESCE(NEW.last_name, 'User');
  NEW.email := COALESCE(NEW.email, (SELECT email FROM auth.users WHERE id = NEW.id));
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_temporary_profile_conversion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  temp_profile_id uuid;
BEGIN
  -- Get the temporary profile ID from user metadata
  temp_profile_id := (NEW.raw_user_meta_data->>'temp_profile_id')::uuid;
  
  IF temp_profile_id IS NOT NULL THEN
    -- Insert into profiles using data from temporary_profiles
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      onboarding_completed
    )
    SELECT
      NEW.id, -- Use the actual user ID
      email,
      first_name,
      last_name,
      role,
      false
    FROM temporary_profiles
    WHERE id = temp_profile_id;
    
    -- Delete the temporary profile
    DELETE FROM temporary_profiles WHERE id = temp_profile_id;
  ELSE
    -- Create a new profile directly
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      onboarding_completed
    ) VALUES (
      NEW.id,
      NEW.email,
      split_part(NEW.email, '@', 1),
      '',
      'member',
      false
    );
  END IF;
  
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.maintain_profile_complete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Only try to update profile_complete if the column exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'profiles'
        AND column_name = 'profile_complete'
    ) THEN
        IF NEW.onboarding_completed IS TRUE THEN
            NEW.profile_complete := TRUE;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_or_update_membership(p_profile_id uuid, p_community_id uuid, p_role text, p_status text)
 RETURNS json
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

  return json_build_object(
    'id', v_membership_id,
    'profile_id', p_profile_id,
    'community_id', p_community_id,
    'role', p_role,
    'status', p_status
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    profile_complete
  ) VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'community_admin'),
    false
  );
  RETURN NEW;
END;
$function$
;


