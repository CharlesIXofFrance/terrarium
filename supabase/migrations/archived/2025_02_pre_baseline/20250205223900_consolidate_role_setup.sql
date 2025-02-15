/*
---
id: "20250205223900"
title: "Consolidate role setup and profiles schema"
description: >
  This migration consolidates the role setup and profiles schema. It:
  - Drops and recreates the app_role enum type with all required roles
  - Recreates the profiles table with first_name and last_name fields
  - Simplifies RLS policies to avoid duplication
  - Adds proper cleanup of dependent objects
affected_tables:
  - "public.profiles"
dependencies: []
rollback: |
  DROP TABLE IF EXISTS public.profiles CASCADE;
  DROP TYPE IF EXISTS public.app_role CASCADE;
---
*/

-- Drop dependent objects first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auth_user_created();
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow auth admin to manage profiles" ON public.profiles;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- First ensure we have our app_role type
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        DROP TYPE public.app_role CASCADE;
    END IF;
    
    CREATE TYPE public.app_role AS ENUM (
        'owner',
        'admin',
        'member',
        'employer'
    );
END $$;

-- Recreate profiles table with correct schema
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email text UNIQUE NOT NULL,
    first_name text,
    last_name text,
    role public.app_role NOT NULL DEFAULT 'member'::public.app_role,
    onboarding_complete boolean NOT NULL DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role can manage all profiles"
    ON public.profiles
    FOR ALL
    USING (auth.role() = 'service_role');

-- Create or replace the setup_test_user function with proper role handling
CREATE OR REPLACE FUNCTION public.setup_test_user(
    p_user_id uuid,
    p_user_email text,
    p_user_role text,
    p_is_platform_user boolean DEFAULT false
)
RETURNS void
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    v_role public.app_role;
BEGIN
    -- Cast the role string to enum
    BEGIN
        v_role := p_user_role::public.app_role;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid role: %. Must be one of: owner, admin, member, employer', p_user_role;
    END;

    -- Update auth.users role
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        to_jsonb(p_user_role)
    )
    WHERE id = p_user_id;

    -- Delete existing profile if it exists
    DELETE FROM public.profiles WHERE id = p_user_id;

    -- Insert new profile
    INSERT INTO public.profiles (
        id,
        email,
        role,
        full_name,
        onboarding_complete,
        metadata
    )
    VALUES (
        p_user_id,
        p_user_email,
        v_role,
        CASE 
            WHEN v_role = 'owner'::public.app_role THEN 'Test Owner'
            ELSE 'Test Member'
        END,
        true,
        CASE 
            WHEN p_is_platform_user THEN '{"is_platform_user": true}'::jsonb 
            ELSE '{}'::jsonb 
        END
    );

    -- Delete any existing roles for this user
    DELETE FROM public.user_roles WHERE user_id = p_user_id;

    -- Insert new role
    INSERT INTO public.user_roles (
        user_id,
        email,
        role
    )
    VALUES (
        p_user_id,
        p_user_email,
        v_role
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO service_role;
GRANT EXECUTE ON FUNCTION public.setup_test_user(uuid, text, text, boolean) TO postgres;
