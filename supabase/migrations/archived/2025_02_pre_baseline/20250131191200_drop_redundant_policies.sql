-- Drop redundant policies that are already covered by other policies
DROP POLICY IF EXISTS "Allow member insert with community context" ON public.community_members;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
