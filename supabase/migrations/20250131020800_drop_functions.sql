-- Drop existing functions
DROP FUNCTION IF EXISTS public.create_or_update_membership(uuid, uuid, text, text);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_delete();
