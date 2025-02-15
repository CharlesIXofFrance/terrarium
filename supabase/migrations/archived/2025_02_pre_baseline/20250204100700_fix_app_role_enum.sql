/*
---
affected_tables: []
dependencies: []
description: 'Fix user_role enum to include platform_admin

  Migrated from legacy format.'
id: 20250204100700_fix_app_role_enum
rollback: '-- To be added

  DROP FUNCTION IF EXISTS function_name CASCADE;'
title: Fix user_role enum to include platform_admin

---
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Platform admins can update all profiles" ON public.profiles;

-- Drop existing enum type if it exists (this will cascade to dependent objects)
DROP TYPE IF EXISTS public.user_role CASCADE;

-- Recreate the enum type with all necessary roles
CREATE TYPE public.user_role AS ENUM (
    'owner',
    'admin',
    'member',
    'employer'
);

-- Recreate the profiles table with the updated enum type
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email text,
    first_name text,
    last_name text,
    avatar_url text,
    role public.user_role NOT NULL DEFAULT 'member',
    profile_complete boolean DEFAULT false,
    onboarding_step integer DEFAULT 1,
    community_metadata jsonb DEFAULT '{}'::jsonb,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Grant access to profiles
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO anon;

-- Create policies
CREATE POLICY "Users can read their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Platform admins can read all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "Platform admins can update all profiles"
    ON public.profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );
