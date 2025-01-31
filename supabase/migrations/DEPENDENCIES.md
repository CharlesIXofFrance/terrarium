# Migration Dependencies

## Core Dependencies

1. **Extensions**

   - uuid-ossp
   - pgcrypto
   - citext

2. **Schemas**

   - public
   - auth
   - storage

3. **Types**
   - public.user_role
   - auth.auth_factor_type
   - auth.auth_factor_status
   - auth.aal_level

## Table Dependencies

1. **auth.users** (PRIMARY)

   - No dependencies
   - Required by: all other tables

2. **public.profiles**

   - Depends on: auth.users
   - Required by: community_members

3. **auth.identities**

   - Depends on: auth.users
   - Required by: none

4. **auth.sessions**

   - Depends on: auth.users
   - Required by: refresh_tokens

5. **auth.refresh_tokens**
   - Depends on: auth.sessions
   - Required by: none

## Function Dependencies

1. **public.is_platform_admin()**

   - Depends on: profiles table
   - Required by: RLS policies

2. **public.is_community_owner()**

   - Depends on: community_members table
   - Required by: RLS policies

3. **public.handle_auth_user_created()**
   - Depends on: all core tables
   - Required by: user creation trigger

## Migration Order

1. Extensions
2. Schemas
3. Types
4. Core Tables
5. Helper Functions
6. Triggers
7. Policies
8. Indexes
