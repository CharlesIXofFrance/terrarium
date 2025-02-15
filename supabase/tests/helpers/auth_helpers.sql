create schema if not exists tests;

create or replace function tests.create_supabase_user(
  email text,
  password text
) returns uuid as $$
declare
  uid uuid;
begin
  uid := gen_random_uuid();

  insert into auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_sent_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    role,
    aud
  )
  values (
    uid,
    '00000000-0000-0000-0000-000000000000',
    email,
    crypt(password, gen_salt('bf')),
    now(),
    now(),
    '{"provider": "email"}',
    '{"role": "member"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  return uid;
end;
$$ language plpgsql security definer;

create or replace function tests.verify_email(
  user_email text
) returns void as $$
begin
  update auth.users
  set email_confirmed_at = now()
  where email = user_email;
end;
$$ language plpgsql security definer;

create or replace function tests.request_password_reset(
  user_email text
) returns void as $$
begin
  update auth.users
  set last_password_reset_at = now()
  where email = user_email;
end;
$$ language plpgsql security definer;

create or replace function tests.authenticate_as(
  user_email text
) returns void as $$
declare
  uid uuid;
begin
  select id into uid
  from auth.users
  where email = user_email;

  perform set_config('request.jwt.claim.sub', uid::text, true);
  perform set_config('request.jwt.claim.role', 'authenticated', true);
  perform set_config('request.jwt.claim.email', user_email, true);
end;
$$ language plpgsql security definer;

create or replace function tests.clear_supabase_users() returns void as $$
begin
  delete from auth.users where email like 'test%@example.com';
end;
$$ language plpgsql security definer;