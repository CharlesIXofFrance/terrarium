begin;

-- Plan the tests
select plan(6);

-- Test 1: Verify auth schema exists
select has_schema('auth', 'Auth schema should exist');

-- Test 2: Verify required auth tables exist
select has_table('auth', 'users', 'auth.users table should exist');
select has_table('auth', 'identities', 'auth.identities table should exist');
select has_table('auth', 'sessions', 'auth.sessions table should exist');

-- Test 3: Verify user table structure
select has_column('auth', 'users', 'id', 'users.id should exist');
select has_column('auth', 'users', 'email', 'users.email should exist');

-- Finish the tests
select * from finish();
rollback;