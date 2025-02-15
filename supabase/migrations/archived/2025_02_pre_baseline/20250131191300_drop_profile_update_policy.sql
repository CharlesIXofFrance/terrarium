-- Drop redundant profile update policy as it's already covered by the Profile access policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
