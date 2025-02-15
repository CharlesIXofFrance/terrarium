-- Expose test utils to PostgREST
grant execute on function public.reset_test_db() to postgres, anon, authenticated, service_role;
