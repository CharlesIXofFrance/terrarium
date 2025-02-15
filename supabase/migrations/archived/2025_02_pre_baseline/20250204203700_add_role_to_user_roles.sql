-- Add role column to user_roles table
ALTER TABLE public.user_roles ADD COLUMN role app_role NOT NULL DEFAULT 'member';

-- Add index for role column
CREATE INDEX user_roles_role_idx ON public.user_roles(role);

-- Add policy for platform admins to manage roles
CREATE POLICY "Platform admins can manage user roles"
    ON public.user_roles
    TO authenticated
    USING (auth.jwt()->>'role' = 'admin')
    WITH CHECK (auth.jwt()->>'role' = 'admin');
