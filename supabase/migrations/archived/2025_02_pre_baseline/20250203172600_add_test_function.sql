-- Create a test function that requires authentication
create or replace function public.test_auth()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return jsonb_build_object(
    'authenticated_user', auth.uid(),
    'timestamp', now()
  );
end;
$$;

-- Grant access to authenticated users
grant execute on function public.test_auth to authenticated;
