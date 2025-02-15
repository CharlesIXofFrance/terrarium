

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";








ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'owner',
    'admin',
    'member',
    'employer'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


COMMENT ON TYPE "public"."app_role" IS 'Enum type for user roles in the application: owner, admin, member, employer';



CREATE TYPE "public"."user_role" AS ENUM (
    'owner',
    'admin',
    'member',
    'employer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."custom_access_token_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  claims jsonb;
  user_role public.app_role;
begin
  -- Fetch the user role in the user_roles table
  select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if user_role is not null then
    -- Set the claim
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  else
    -- Default to member if no role is set
    claims := jsonb_set(claims, '{role}', '"member"');
  end if;

  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims);

  -- Return the modified event
  return event;
end;
$$;


ALTER FUNCTION "public"."custom_access_token_hook"("event" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"("user_email" "text") RETURNS TABLE("role" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- First try user_roles table
    RETURN QUERY
    SELECT ur.role::text
    FROM public.user_roles ur
    WHERE ur.email = user_email
    LIMIT 1;

    -- If no result, try profiles
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT p.role::text
        FROM public.profiles p
        WHERE p.email = user_email
        LIMIT 1;
    END IF;

    -- If still no result, try auth.users metadata
    IF NOT FOUND THEN
        RETURN QUERY
        SELECT (u.raw_user_meta_data->>'role')::text
        FROM auth.users u
        WHERE u.email = user_email
        AND u.raw_user_meta_data->>'role' IS NOT NULL
        LIMIT 1;
    END IF;
END;
$$;


ALTER FUNCTION "public"."get_user_role"("user_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_community_access"("community_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $_$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM profiles p
        WHERE p.id = auth.uid()
        AND (
            p.role = 'admin'::user_role
            OR EXISTS (
                SELECT 1
                FROM community_members cm
                WHERE cm.profile_id = auth.uid()
                AND cm.community_id = $1
            )
        )
    );
END;
$_$;


ALTER FUNCTION "public"."has_community_access"("community_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Check service_role first
    IF auth.role() = 'service_role' THEN
        RETURN true;
    END IF;

    -- Check if user is authenticated
    IF auth.role() != 'authenticated' THEN
        RETURN false;
    END IF;

    -- Check admin role
    RETURN EXISTS (
        SELECT 1
        FROM profiles
        WHERE id = auth.uid()
            AND role = 'admin'::user_role
    );
END $$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_owner"("community_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Check service_role first
    IF auth.role() = 'service_role' THEN
        RETURN true;
    END IF;

    -- Check if user is authenticated
    IF auth.role() != 'authenticated' THEN
        RETURN false;
    END IF;

    -- Check platform admin
    IF public.is_admin() THEN
        RETURN true;
    END IF;

    -- Check community owner role
    RETURN EXISTS (
        SELECT 1
        FROM community_members cm
        WHERE cm.profile_id = auth.uid()
            AND cm.community_id = community_id
            AND cm.role = 'owner'::user_role
    );
END $$;


ALTER FUNCTION "public"."is_owner"("community_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_debug"("message" "text") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RAISE NOTICE 'DEBUG: %', message;
END;
$$;


ALTER FUNCTION "public"."log_debug"("message" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_test_db"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Delete test data from all tables
    TRUNCATE public.community_members CASCADE;
    TRUNCATE public.communities CASCADE;
    TRUNCATE public.user_roles CASCADE;
    TRUNCATE public.profiles CASCADE;
    
    -- Delete test users from auth schema
    DELETE FROM auth.users WHERE email LIKE '%@example.com';
    DELETE FROM auth.identities WHERE email LIKE '%@example.com';
END;
$$;


ALTER FUNCTION "public"."reset_test_db"() OWNER TO "postgres";


CREATE PROCEDURE "public"."rollback_auth_schema"()
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Drop application tables
    DROP TABLE IF EXISTS public.community_members CASCADE;
    DROP TABLE IF EXISTS public.communities CASCADE;
    DROP TABLE IF EXISTS public.profiles CASCADE;

    -- Drop application functions
    DROP FUNCTION IF EXISTS public.is_platform_admin CASCADE;
    DROP FUNCTION IF EXISTS public.is_owner CASCADE;
    DROP FUNCTION IF EXISTS public.handle_auth_user_created CASCADE;
    DROP FUNCTION IF EXISTS public.handle_updated_at CASCADE;

    -- Drop application types
    DROP TYPE IF EXISTS public.user_role CASCADE;

    RAISE NOTICE 'Application schema rollback complete';
END;
$$;


ALTER PROCEDURE "public"."rollback_auth_schema"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."setup_test_user"("p_user_id" "uuid", "p_user_email" "text", "p_user_role" "text", "p_is_platform_user" boolean DEFAULT false) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_role public.app_role;
BEGIN
    -- Cast the role string to enum
    BEGIN
        v_role := p_user_role::public.app_role;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid role: %. Must be one of: owner, admin, member, employer', p_user_role;
    END;

    -- Update auth.users role
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
        COALESCE(raw_user_meta_data, '{}'::jsonb),
        '{role}',
        to_jsonb(p_user_role)
    )
    WHERE id = p_user_id;

    -- Delete existing profile if it exists
    DELETE FROM public.profiles WHERE id = p_user_id;

    -- Insert new profile with platform user metadata if needed
    INSERT INTO public.profiles (
        id,
        email,
        first_name,
        last_name,
        role,
        onboarding_complete,
        metadata
    )
    VALUES (
        p_user_id,
        p_user_email,
        split_part(p_user_email, '@', 1),  -- Use email prefix as first name for test users
        'Test User',  -- Default last name for test users
        v_role,
        true,
        CASE 
            WHEN p_is_platform_user THEN '{"is_platform_user": true}'::jsonb 
            ELSE '{}'::jsonb 
        END
    );

    -- Delete any existing roles for this user
    DELETE FROM public.user_roles WHERE user_id = p_user_id;

    -- Insert new role
    INSERT INTO public.user_roles (
        user_id,
        email,
        role
    )
    VALUES (
        p_user_id,
        p_user_email,
        v_role
    );
END;
$$;


ALTER FUNCTION "public"."setup_test_user"("p_user_id" "uuid", "p_user_email" "text", "p_user_role" "text", "p_is_platform_user" boolean) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."setup_test_user"("p_user_id" "uuid", "p_user_email" "text", "p_user_role" "text", "p_is_platform_user" boolean) IS 'Creates or updates a test user with specified role and platform access';



CREATE OR REPLACE FUNCTION "public"."sync_user_role_email"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  NEW.email = (SELECT email FROM auth.users WHERE id = NEW.user_id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_user_role_email"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."test_auth"() RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  return jsonb_build_object(
    'authenticated_user', auth.uid(),
    'timestamp', now()
  );
end;
$$;


ALTER FUNCTION "public"."test_auth"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."auth_logs" (
    "id" bigint NOT NULL,
    "user_id" "uuid",
    "event_type" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."auth_logs" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."auth_logs_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."auth_logs_id_seq" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."auth_logs_id_seq1"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."auth_logs_id_seq1" OWNER TO "postgres";


ALTER SEQUENCE "public"."auth_logs_id_seq1" OWNED BY "public"."auth_logs"."id";



CREATE TABLE IF NOT EXISTS "public"."auth_rate_limits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "email" "text" NOT NULL,
    "attempts" integer DEFAULT 0,
    "last_attempt" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."auth_rate_limits" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."auth_rate_limits_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."auth_rate_limits_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "logo_url" "text",
    "owner_id" "uuid" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "branding" "jsonb" DEFAULT '{}'::"jsonb",
    "onboarding_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."communities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "community_id" "uuid",
    "profile_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "onboarding_step" integer DEFAULT 1,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "role" "text" DEFAULT 'member'::"text" NOT NULL
);


ALTER TABLE "public"."community_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "role" "public"."app_role" DEFAULT 'member'::"public"."app_role" NOT NULL,
    "onboarding_complete" boolean DEFAULT false NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."profiles" IS 'User profiles with role-based access control and metadata';



COMMENT ON COLUMN "public"."profiles"."id" IS 'Primary key, references auth.users';



COMMENT ON COLUMN "public"."profiles"."email" IS 'User email, must be unique';



COMMENT ON COLUMN "public"."profiles"."first_name" IS 'User first name';



COMMENT ON COLUMN "public"."profiles"."last_name" IS 'User last name';



COMMENT ON COLUMN "public"."profiles"."role" IS 'User role from app_role enum';



COMMENT ON COLUMN "public"."profiles"."onboarding_complete" IS 'Flag indicating if user has completed onboarding';



COMMENT ON COLUMN "public"."profiles"."metadata" IS 'JSON metadata for extensibility';



COMMENT ON COLUMN "public"."profiles"."created_at" IS 'Timestamp of profile creation';



COMMENT ON COLUMN "public"."profiles"."updated_at" IS 'Timestamp of last profile update';



CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "email" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_roles" IS 'Application roles for each user.';



ALTER TABLE "public"."user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."auth_logs" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."auth_logs_id_seq1"'::"regclass");



ALTER TABLE ONLY "public"."auth_logs"
    ADD CONSTRAINT "auth_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."auth_rate_limits"
    ADD CONSTRAINT "auth_rate_limits_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."auth_rate_limits"
    ADD CONSTRAINT "auth_rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_community_id_profile_id_key" UNIQUE ("community_id", "profile_id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



CREATE INDEX "communities_owner_id_idx" ON "public"."communities" USING "btree" ("owner_id");



CREATE INDEX "communities_slug_idx" ON "public"."communities" USING "btree" ("slug");



CREATE INDEX "community_members_community_id_idx" ON "public"."community_members" USING "btree" ("community_id");



CREATE INDEX "community_members_profile_id_idx" ON "public"."community_members" USING "btree" ("profile_id");



CREATE INDEX "community_members_status_idx" ON "public"."community_members" USING "btree" ("status");



CREATE INDEX "idx_auth_rate_limits_email" ON "public"."auth_rate_limits" USING "btree" ("email");



CREATE INDEX "user_roles_email_idx" ON "public"."user_roles" USING "btree" ("email");



CREATE OR REPLACE TRIGGER "handle_communities_updated_at" BEFORE UPDATE ON "public"."communities" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "sync_user_role_email_trigger" BEFORE INSERT OR UPDATE ON "public"."user_roles" FOR EACH ROW EXECUTE FUNCTION "public"."sync_user_role_email"();



CREATE OR REPLACE TRIGGER "update_auth_rate_limits_updated_at" BEFORE UPDATE ON "public"."auth_rate_limits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."auth_logs"
    ADD CONSTRAINT "auth_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can update any community" ON "public"."communities" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Admins can update any community." ON "public"."communities" FOR UPDATE USING ("public"."is_admin"());



CREATE POLICY "Allow auth admin to read user roles" ON "public"."user_roles" FOR SELECT TO "supabase_auth_admin" USING (true);



CREATE POLICY "Communities are viewable by everyone." ON "public"."communities" FOR SELECT USING (true);



CREATE POLICY "Community owners can update their communities." ON "public"."communities" FOR UPDATE USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Platform admins can manage user roles" ON "public"."user_roles" TO "authenticated" USING ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text")) WITH CHECK ((("auth"."jwt"() ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Service role can manage all profiles" ON "public"."profiles" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "System can manage rate limits" ON "public"."auth_rate_limits" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can read their own community memberships" ON "public"."community_members" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Users can update their own community memberships" ON "public"."community_members" FOR UPDATE USING (("auth"."uid"() = "profile_id")) WITH CHECK (("auth"."uid"() = "profile_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."auth_rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";
GRANT ALL ON SCHEMA "public" TO "service_role";
























SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;





















REVOKE ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "supabase_auth_admin";
GRANT ALL ON FUNCTION "public"."custom_access_token_hook"("event" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"("user_email" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"("user_email" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."has_community_access"("community_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."has_community_access"("community_id" "uuid") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."is_owner"("community_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_owner"("community_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_owner"("community_id" "uuid") TO "service_role";
GRANT ALL ON FUNCTION "public"."is_owner"("community_id" "uuid") TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."log_debug"("message" "text") TO "service_role";
GRANT ALL ON FUNCTION "public"."log_debug"("message" "text") TO "supabase_auth_admin";



REVOKE ALL ON FUNCTION "public"."reset_test_db"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."reset_test_db"() TO "service_role";
GRANT ALL ON FUNCTION "public"."reset_test_db"() TO "authenticated";



GRANT ALL ON PROCEDURE "public"."rollback_auth_schema"() TO "service_role";
GRANT ALL ON PROCEDURE "public"."rollback_auth_schema"() TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."setup_test_user"("p_user_id" "uuid", "p_user_email" "text", "p_user_role" "text", "p_is_platform_user" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."setup_test_user"("p_user_id" "uuid", "p_user_email" "text", "p_user_role" "text", "p_is_platform_user" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."test_auth"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."test_auth"() TO "service_role";
GRANT ALL ON FUNCTION "public"."test_auth"() TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "supabase_auth_admin";









SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;












GRANT ALL ON TABLE "public"."auth_logs" TO "service_role";
GRANT ALL ON TABLE "public"."auth_logs" TO "supabase_auth_admin";



GRANT ALL ON SEQUENCE "public"."auth_logs_id_seq" TO "service_role";
GRANT ALL ON SEQUENCE "public"."auth_logs_id_seq" TO "supabase_auth_admin";



GRANT ALL ON SEQUENCE "public"."auth_logs_id_seq1" TO "supabase_auth_admin";
GRANT ALL ON SEQUENCE "public"."auth_logs_id_seq1" TO "service_role";



GRANT ALL ON TABLE "public"."auth_rate_limits" TO "service_role";
GRANT ALL ON TABLE "public"."auth_rate_limits" TO "supabase_auth_admin";



GRANT ALL ON SEQUENCE "public"."auth_rate_limits_id_seq" TO "service_role";
GRANT ALL ON SEQUENCE "public"."auth_rate_limits_id_seq" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."communities" TO "anon";
GRANT ALL ON TABLE "public"."communities" TO "authenticated";
GRANT ALL ON TABLE "public"."communities" TO "service_role";
GRANT ALL ON TABLE "public"."communities" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."community_members" TO "authenticated";
GRANT ALL ON TABLE "public"."community_members" TO "anon";
GRANT ALL ON TABLE "public"."community_members" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "supabase_auth_admin";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "service_role";
GRANT ALL ON SEQUENCE "public"."user_roles_id_seq" TO "supabase_auth_admin";



























RESET ALL;
