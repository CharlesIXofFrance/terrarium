-- Fix RLS policies for user_roles table to allow users to read their own roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own roles
CREATE POLICY "Users can read their own roles"
    ON public.user_roles
    FOR SELECT
    TO authenticated
    USING (
        -- Allow if the role is for the current user
        user_id = auth.uid()
        OR
        -- Or if the user is a platform admin
        auth.jwt()->>'role' = 'admin'
        OR
        -- Or if user has the owner role
        auth.jwt()->>'role' = 'owner'
    );

-- Create function to get user role that properly handles RLS
CREATE OR REPLACE FUNCTION public.get_user_role(user_email text)
RETURNS TABLE (role text)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- First try user_roles table
    RETURN QUERY
    SELECT ur.role::text
    FROM public.user_roles ur
    WHERE ur.email = user_email
    LIMIT 1;

    -- If no result, fallback to profiles
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT p.role::text
        FROM public.profiles p
        WHERE p.email = user_email
        LIMIT 1;
    END IF;
END;
$$ LANGUAGE plpgsql;
