-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at,
    profile_complete
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member'::user_role),
    NOW(),
    NOW(),
    0
  );
  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users who don't have one
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at,
  profile_complete
)
SELECT 
  users.id,
  users.email,
  COALESCE(users.raw_user_meta_data->>'name', users.email),
  COALESCE((users.raw_user_meta_data->>'role')::user_role, 'member'::user_role),
  users.created_at,
  users.created_at,
  0
FROM auth.users
LEFT JOIN public.profiles ON users.id = profiles.id
WHERE profiles.id IS NULL;
