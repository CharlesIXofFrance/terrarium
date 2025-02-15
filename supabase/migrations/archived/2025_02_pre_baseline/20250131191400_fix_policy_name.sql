-- Drop the policy with exact name matching
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
