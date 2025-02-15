-- Create app_role type if it doesn't exist
DO $$ BEGIN
    -- Create app_role type if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('admin', 'owner', 'employer', 'member');
    END IF;

    -- Create profiles table if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL DEFAULT '',
            full_name TEXT,
            avatar_url TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            role app_role NOT NULL DEFAULT 'member'::app_role,
            metadata JSONB DEFAULT '{}'::jsonb
        );

        -- Add indexes
        CREATE INDEX profiles_email_idx ON public.profiles(email);
        CREATE INDEX profiles_role_idx ON public.profiles(role);

        -- Add RLS policies
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

        -- Allow users to read their own profile
        CREATE POLICY "Users can read own profile"
            ON public.profiles FOR SELECT
            USING (auth.uid() = id);

        -- Allow users to update their own profile
        CREATE POLICY "Users can update own profile"
            ON public.profiles FOR UPDATE
            USING (auth.uid() = id);
    END IF;
END $$;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate function with proper platform_admin handling
CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    default_role app_role;
    user_id uuid;
    max_retries constant int := 3;
    current_try int := 0;
    last_error text;
BEGIN
    -- Set transaction isolation level to serializable to prevent race conditions
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;

    -- Wrap entire operation in transaction with serializable isolation
    <<retry_block>>
    WHILE current_try < max_retries LOOP
        BEGIN
            current_try := current_try + 1;
            
            -- Log attempt number and user details
            RAISE LOG 'Attempt % of % for user creation. ID: %, Metadata: %',
                current_try, max_retries, NEW.id, NEW.raw_user_meta_data;
            
            -- Get the user ID with error handling
            BEGIN
                user_id := NEW.id::uuid;
            EXCEPTION WHEN OTHERS THEN
                RAISE LOG 'Invalid UUID format: % (Error: %)', NEW.id, SQLERRM;
                RAISE EXCEPTION 'Invalid user ID format: %', NEW.id;
            END;
            
            -- Set default role based on registration source and metadata
            -- Case-insensitive role conversion with explicit COALESCE handling
            default_role := CASE
                WHEN LOWER(COALESCE(NEW.raw_user_meta_data->>'role', '')) = 'platform_admin' THEN 'admin'::app_role
                WHEN LOWER(COALESCE(NEW.raw_user_meta_data->>'role', '')) = 'admin' THEN 'admin'::app_role
                WHEN LOWER(COALESCE(NEW.raw_user_meta_data->>'role', '')) = 'owner' THEN 'owner'::app_role
                WHEN LOWER(COALESCE(NEW.raw_user_meta_data->>'role', '')) = 'employer' THEN 'employer'::app_role
                ELSE 'member'::app_role
            END;

            -- Validate role enum
            IF NOT EXISTS (
                SELECT 1 
                FROM pg_enum 
                WHERE enumtypid = 'app_role'::regtype
                AND enumlabel = LOWER(default_role::text)
            ) THEN
                RAISE EXCEPTION 'Invalid role assignment: %', default_role;
            END IF;

            -- Create profile and update user role
            WITH insert_profile AS (
                INSERT INTO public.profiles (
                    id,
                    email,
                    full_name,
                    avatar_url,
                    created_at,
                    updated_at,
                    role
                ) VALUES (
                    user_id,
                    NEW.email,
                    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
                    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
                    NOW(),
                    NOW(),
                    default_role
                )
                ON CONFLICT (id) DO UPDATE
                SET role = EXCLUDED.role,
                    updated_at = NOW(),
                    email = EXCLUDED.email,
                    full_name = EXCLUDED.full_name,
                    avatar_url = EXCLUDED.avatar_url
                RETURNING *
            )
            UPDATE auth.users 
            SET role = default_role::text,
                updated_at = NOW(),
                raw_user_meta_data = jsonb_set(
                    COALESCE(raw_user_meta_data, '{}'::jsonb),
                    '{role}',
                    to_jsonb(default_role::text)
                )
            FROM insert_profile
            WHERE auth.users.id = user_id;

            -- If update was successful, exit the retry loop
            IF FOUND THEN
                EXIT retry_block;
            END IF;

            -- If we get here, the update failed but didn't raise an exception
            RAISE EXCEPTION 'Could not update role for user %', user_id;

        EXCEPTION WHEN OTHERS THEN
            -- Store the error for potential retry
            last_error := SQLERRM;
            
            -- Log the error with attempt number
            RAISE LOG 'Error in profile creation/update (Attempt %/%): % (State: %)',
                current_try, max_retries, SQLERRM, SQLSTATE;
            
            -- If we haven't exhausted retries, continue to next iteration
            IF current_try < max_retries THEN
                -- Wait for a short time before retrying (exponential backoff)
                PERFORM pg_sleep(power(2, current_try - 1) * 0.1);
                CONTINUE;
            END IF;
            
            -- If we've exhausted retries, raise the last error
            RAISE EXCEPTION 'Failed to create/update user after % attempts. Last error: %',
                max_retries, last_error;
        END;
    END LOOP;

    -- Log successful completion
    RAISE LOG 'Successfully created/updated user % with role %',
        user_id, default_role;

    RETURN NEW;
END;
$$;

-- Recreate trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_auth_user_created();

