-- Add insert policy for profiles
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

-- Create function to handle new user creation
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when new.email like '%@terrarium.dev' then 'admin'::public.app_role
      else 'owner'::public.app_role
    end
  );
  return new;
end;
$$;

-- Create trigger to handle new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user_created();
