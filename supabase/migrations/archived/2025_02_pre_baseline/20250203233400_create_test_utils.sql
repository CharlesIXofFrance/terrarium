-- Create function to reset test database
create or replace function reset_test_db()
returns void
language plpgsql
security definer
as $$
begin
  -- Delete test data
  delete from auth.users where email like '%@example.com';
  delete from public.communities where slug = 'test-community';
  delete from public.profiles where email like '%@example.com';
  delete from public.auth_rate_limits where true;
  delete from public.auth_logs where true;
  
  -- Reset sequences
  alter sequence if exists public.communities_id_seq restart with 1;
  alter sequence if exists public.auth_rate_limits_id_seq restart with 1;
  alter sequence if exists public.auth_logs_id_seq restart with 1;
end;
$$;
