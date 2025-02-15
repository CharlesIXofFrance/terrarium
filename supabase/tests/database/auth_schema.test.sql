begin;
select plan(16);

-- Test auth schema and tables
select has_schema('auth', 'Auth schema should exist');
select has_table('auth', 'users', 'Auth users table should exist');
select has_column('auth', 'users', 'id', 'Users should have id column');
select has_column('auth', 'users', 'email', 'Users should have email column');
select has_column('auth', 'users', 'raw_user_meta_data', 'Users should have raw_user_meta_data column');

-- Test public schema and tables
select has_schema('public', 'Public schema should exist');
select has_table('public', 'profiles', 'Profiles table should exist');
select has_table('public', 'communities', 'Communities table should exist');
select has_table('public', 'community_members', 'Community members table should exist');

-- Test RLS policies
select policies_are('public', 'profiles',
    ARRAY['Users can view their own profile',
          'Users can update their own profile',
          'Service role can manage all profiles'],
    'Profiles table should have expected policies');

select policies_are('public', 'communities',
    ARRAY[
        'service_role_can_manage_communities',
        'authenticated_can_view_communities',
        'owners_can_create_communities',
        'owners_can_update_communities',
        'owners_can_delete_communities'
    ],
    'Communities table should have expected policies');

select policies_are('public', 'community_members',
    ARRAY[
        'service_role_can_manage_memberships',
        'members_can_view_memberships',
        'members_can_join_communities',
        'members_can_update_own_membership',
        'members_can_delete_own_membership',
        'owners_can_create_members',
        'owners_can_update_members',
        'owners_can_delete_members'
    ],
    'Community members table should have expected policies');

-- Test foreign key constraints
select col_is_fk('public', 'profiles', 'id',
    'Profiles id should reference auth.users(id)');

select col_is_fk('public', 'communities', 'owner_id',
    'Communities owner_id should reference profiles(id)');

select col_is_fk('public', 'community_members', 'profile_id',
    'Community members profile_id should reference profiles(id)');

select col_is_fk('public', 'community_members', 'community_id',
    'Community members community_id should reference communities(id)');

select * from finish();
rollback;
