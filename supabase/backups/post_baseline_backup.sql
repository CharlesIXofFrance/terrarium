

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


CREATE OR REPLACE FUNCTION "public"."handle_auth_user_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_role public.app_role;
    v_raw_user_meta_data jsonb;
BEGIN
    -- Get role from metadata or default to member
    v_raw_user_meta_data := NEW.raw_user_meta_data;
    v_role := COALESCE(
        (v_raw_user_meta_data->>'role')::public.app_role,
        'member'::public.app_role
    );

    -- Create profile
    INSERT INTO public.profiles (id, email, role)
    VALUES (NEW.id, NEW.email, v_role);

    -- Create user role entry
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (NEW.id, NEW.email, v_role);

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_auth_user_created"() OWNER TO "postgres";


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

    -- Insert new profile
    INSERT INTO public.profiles (
        id,
        email,
        role,
        first_name,
        last_name,
        onboarding_complete,
        metadata
    )
    VALUES (
        p_user_id,
        p_user_email,
        v_role,
        CASE WHEN v_role = 'owner'::public.app_role THEN 'Test' ELSE 'Test' END,
        CASE WHEN v_role = 'owner'::public.app_role THEN 'Owner' ELSE 'User' END,
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

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."communities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "owner_id" "uuid",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "branding" "jsonb" DEFAULT '{}'::"jsonb",
    "onboarding_completed" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."communities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_members" (
    "id" integer NOT NULL,
    "profile_id" "uuid",
    "community_id" "uuid",
    "role" "public"."app_role" DEFAULT 'member'::"public"."app_role" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "onboarding_step" integer DEFAULT 0,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."community_members" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."community_members_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE "public"."community_members_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."community_members_id_seq" OWNED BY "public"."community_members"."id";



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


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."community_members" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."community_members_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_profile_id_community_id_key" UNIQUE ("profile_id", "community_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Service role can manage all communities" ON "public"."communities" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage all memberships" ON "public"."community_members" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage all profiles" ON "public"."profiles" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Service role can manage all roles" ON "public"."user_roles" USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own memberships" ON "public"."community_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "community_members"."profile_id") AND ("profiles"."id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO "authenticated";
GRANT ALL ON SCHEMA "public" TO "service_role";


























































































































































































GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "service_role";



GRANT ALL ON FUNCTION "public"."setup_test_user"("p_user_id" "uuid", "p_user_email" "text", "p_user_role" "text", "p_is_platform_user" boolean) TO "service_role";
GRANT ALL ON FUNCTION "public"."setup_test_user"("p_user_id" "uuid", "p_user_email" "text", "p_user_role" "text", "p_is_platform_user" boolean) TO "authenticated";


















GRANT ALL ON TABLE "public"."communities" TO "service_role";
GRANT SELECT ON TABLE "public"."communities" TO "authenticated";



GRANT ALL ON TABLE "public"."community_members" TO "service_role";
GRANT SELECT ON TABLE "public"."community_members" TO "authenticated";



GRANT ALL ON SEQUENCE "public"."community_members_id_seq" TO "service_role";
GRANT USAGE ON SEQUENCE "public"."community_members_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."profiles" TO "authenticated";



GRANT ALL ON TABLE "public"."user_roles" TO "service_role";
GRANT SELECT ON TABLE "public"."user_roles" TO "authenticated";



























RESET ALL;
