-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.get_user_role(text);

-- Create function to get user role that properly handles RLS and auth.users
CREATE OR REPLACE FUNCTION public.get_user_role(user_email text)
RETURNS TABLE (role text)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- First try user_roles table
    RETURN QUERY
    SELECT ur.role::text
    FROM public.user_roles ur
    WHERE ur.email = user_email
    LIMIT 1;

    -- If no result, try profiles
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT p.role::text
        FROM public.profiles p
        WHERE p.email = user_email
        LIMIT 1;
    END IF;

    -- If still no result, try auth.users metadata
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT (u.raw_user_meta_data->>'role')::text
        FROM auth.users u
        WHERE u.email = user_email
        AND u.raw_user_meta_data->>'role' IS NOT NULL
        LIMIT 1;
    END IF;
END;
$$;

-- Update RLS policy for user_roles
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;

CREATE POLICY "Users can read their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (
    -- Allow if the role is for the current user
    user_id = auth.uid()
    OR
    -- Or if the user is a platform admin
    EXISTS (
        SELECT 1 
        FROM auth.users u 
        WHERE u.id = auth.uid() 
        AND (
            -- Check both metadata and profiles for platform roles
            (u.raw_user_meta_data->>'role' IN ('admin', 'owner'))
            OR EXISTS (
                SELECT 1 
                FROM public.profiles p 
                WHERE p.id = auth.uid() 
                AND p.role IN ('admin', 'owner')
            )
        )
    )
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_user_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_user_role(text) TO postgres;
