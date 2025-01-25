

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






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "citext" WITH SCHEMA "public";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."attendance_model" AS ENUM (
    'office',
    'hybrid',
    'remote'
);


ALTER TYPE "public"."attendance_model" OWNER TO "postgres";


CREATE TYPE "public"."custom_field_type" AS ENUM (
    'text',
    'number',
    'date',
    'dropdown',
    'multi_select',
    'boolean'
);


ALTER TYPE "public"."custom_field_type" OWNER TO "postgres";


CREATE TYPE "public"."job_satisfaction" AS ENUM (
    'very_satisfied',
    'satisfied',
    'neutral',
    'not_satisfied',
    'very_not_satisfied'
);


ALTER TYPE "public"."job_satisfaction" OWNER TO "postgres";


CREATE TYPE "public"."opportunity_status" AS ENUM (
    'looking_actively',
    'open_to_opportunities',
    'not_open'
);


ALTER TYPE "public"."opportunity_status" OWNER TO "postgres";


CREATE TYPE "public"."salary_interval" AS ENUM (
    'yearly',
    'monthly'
);


ALTER TYPE "public"."salary_interval" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'owner',
    'admin',
    'member',
    'employer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_community_membership"("file_path" "text", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    community_slug TEXT;
    is_member BOOLEAN;
BEGIN
    community_slug := split_part(file_path, '/', 1);
    SELECT EXISTS (
        SELECT 1 FROM public.community_members cm
        JOIN public.communities c ON c.id = cm.community_id
        WHERE c.slug = community_slug
        AND cm.profile_id = user_id
    ) INTO is_member;
    RETURN is_member;
END;
$$;


ALTER FUNCTION "public"."check_community_membership"("file_path" "text", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_community_ownership"("file_path" "text", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    community_slug TEXT;
    is_owner BOOLEAN;
BEGIN
    community_slug := split_part(file_path, '/', 1);
    SELECT EXISTS (
        SELECT 1 FROM public.communities
        WHERE slug = community_slug
        AND owner_id = user_id
    ) INTO is_owner;
    RETURN is_owner;
END;
$$;


ALTER FUNCTION "public"."check_community_ownership"("file_path" "text", "user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clean_old_rate_limits"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  -- Delete entries older than 24 hours
  delete from public.rate_limits
  where timestamp < (extract(epoch from now()) * 1000)::bigint - (24 * 60 * 60 * 1000);
end;
$$;


ALTER FUNCTION "public"."clean_old_rate_limits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_auth_user_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
  community_data RECORD;
  now_timestamp timestamp with time zone;
  user_metadata jsonb;
  user_role_val text;
BEGIN
  -- Log all state changes for debugging
  RAISE LOG 'Auth trigger fired for user %: OLD(last_sign_in_at=%, confirmed_at=%), NEW(last_sign_in_at=%, confirmed_at=%)',
    NEW.id,
    OLD.last_sign_in_at,
    OLD.confirmed_at,
    NEW.last_sign_in_at,
    NEW.confirmed_at;

  -- Only run when email is verified (confirmed_at changes from null)
  IF (OLD.confirmed_at IS NOT NULL) OR (NEW.confirmed_at IS NULL) THEN
    RAISE LOG 'Skipping trigger for user % - already processed', NEW.id;
    RETURN NEW;
  END IF;

  -- Get current timestamp
  now_timestamp := timezone('utc'::text, now());

  -- Get user metadata from auth.users
  user_metadata := NEW.raw_user_meta_data;

  -- Log metadata for debugging
  RAISE LOG 'Processing user creation with metadata: %', user_metadata;

  -- Validate metadata
  IF user_metadata IS NULL OR user_metadata = '{}'::jsonb THEN
    RAISE LOG 'No metadata found for user %, skipping profile creation', NEW.id;
    RETURN NEW;
  END IF;

  -- Get and validate role
  user_role_val := user_metadata->>'role';
  IF user_role_val IS NULL THEN
    RAISE LOG 'No role specified in metadata for user %', NEW.id;
    RETURN NEW;
  END IF;

  -- Get and validate community
  IF user_metadata->>'communityId' IS NOT NULL THEN
    SELECT *
    INTO community_data
    FROM communities
    WHERE id = (user_metadata->>'communityId')::uuid;

    IF community_data IS NULL THEN
      RAISE LOG 'Community not found for user %: %', NEW.id, user_metadata->>'communityId';
      RETURN NEW;
    END IF;
  END IF;

  -- Create profile from metadata
  BEGIN
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      role,
      profile_complete,
      created_at,
      updated_at,
      onboarding_step,
      community_metadata,
      metadata
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(user_metadata->>'firstName', 'Unknown'),
      COALESCE(user_metadata->>'lastName', 'User'),
      user_role_val::user_role,
      false,
      now_timestamp,
      now_timestamp,
      1,
      '{}',
      '{}'
    );
    RAISE LOG 'Created profile for user %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;

  -- Create community membership if community exists
  IF community_data IS NOT NULL THEN
    BEGIN
      INSERT INTO community_members (
        profile_id,
        community_id,
        role,
        status,
        onboarding_completed,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        community_data.id,
        user_role_val::user_role,
        'active',
        false,
        now_timestamp,
        now_timestamp
      );
      RAISE LOG 'Created community membership for user % in community %', NEW.id, community_data.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error creating community membership for user %: %', NEW.id, SQLERRM;
      RETURN NEW;
    END;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_auth_user_created"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'member'
    );
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = uid) THEN
    RETURN 'User not found';
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data =
    raw_app_meta_data ||
    json_build_object(claim, value)::jsonb
  WHERE id = uid;

  RETURN 'OK';
END;
$$;


ALTER FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_community_settings"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Initialize settings if null
  IF NEW.settings IS NULL THEN
    NEW.settings = '{}'::jsonb;
  END IF;

  -- Ensure settings is a JSONB object
  IF NOT jsonb_typeof(NEW.settings) = 'object' THEN
    NEW.settings = '{}'::jsonb;
  END IF;

  -- Initialize branding if it doesn't exist
  IF NOT (NEW.settings ? 'branding') THEN
    NEW.settings = jsonb_set(
      NEW.settings,
      '{branding}',
      '{
        "primaryColor": "#4F46E5",
        "secondaryColor": "#818CF8"
      }'::jsonb
    );
  END IF;

  -- Ensure branding is an object
  IF NOT jsonb_typeof(NEW.settings->'branding') = 'object' THEN
    NEW.settings = jsonb_set(
      NEW.settings,
      '{branding}',
      '{
        "primaryColor": "#4F46E5",
        "secondaryColor": "#818CF8"
      }'::jsonb
    );
  END IF;

  -- Initialize login object if it doesn't exist
  IF NOT (NEW.settings->'branding' ? 'login') THEN
    NEW.settings = jsonb_set(
      NEW.settings,
      '{branding,login}',
      '{
        "title": "",
        "subtitle": "",
        "welcomeMessage": "",
        "buttonText": "Sign In",
        "backgroundColor": "#FFFFFF",
        "textColor": "#000000"
      }'::jsonb
    );
  END IF;

  -- Initialize member naming if it doesn't exist
  IF NOT (NEW.settings->'branding' ? 'memberNaming') THEN
    NEW.settings = jsonb_set(
      NEW.settings,
      '{branding,memberNaming}',
      '{
        "singular": "Member",
        "plural": "Members"
      }'::jsonb
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."validate_community_settings"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_custom_domain"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
BEGIN
  -- Allow null values
  IF NEW.custom_domain IS NULL THEN
    RETURN NEW;
  END IF;

  -- Basic domain format validation
  IF NOT NEW.custom_domain ~ '^[a-zA-Z0-9][a-zA-Z0-9-\.]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid custom domain format. Must be a valid domain name (e.g., community.example.com)';
  END IF;

  RETURN NEW;
END;
$_$;


ALTER FUNCTION "public"."validate_custom_domain"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."career_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "openness_to_opportunities" "public"."opportunity_status" DEFAULT 'not_open'::"public"."opportunity_status",
    "desired_salary" numeric,
    "desired_salary_currency" "text",
    "desired_salary_interval" "public"."salary_interval",
    "desired_roles" "text"[],
    "desired_attendance_models" "public"."attendance_model"[],
    "desired_locations" "text"[],
    "desired_company_types" "text"[],
    "desired_industry_types" "text"[],
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "community_metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."career_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."communities" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "owner_id" "uuid" NOT NULL,
    "logo_url" "text",
    "slug" "text" NOT NULL,
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "banner_url" "text",
    "favicon_url" "text",
    "custom_domain" "text",
    "onboarding_completed" boolean DEFAULT false
);


ALTER TABLE "public"."communities" OWNER TO "postgres";


COMMENT ON COLUMN "public"."communities"."settings" IS 'Community settings including branding, login customization, and member naming';



COMMENT ON COLUMN "public"."communities"."custom_domain" IS 'Optional custom domain for the community. Must be unique across all communities.';



COMMENT ON COLUMN "public"."communities"."onboarding_completed" IS 'Indicates whether the community setup/onboarding process has been completed';



CREATE TABLE IF NOT EXISTS "public"."community_login_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "community_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "title" "text" DEFAULT 'Welcome Back'::"text" NOT NULL,
    "subtitle" "text" DEFAULT 'Sign in to your account'::"text" NOT NULL,
    "welcome_message" "text",
    "button_text" "text" DEFAULT 'Sign In'::"text" NOT NULL,
    "background_color" "text" DEFAULT '#FFFFFF'::"text" NOT NULL,
    "text_color" "text" DEFAULT '#000000'::"text" NOT NULL,
    "side_image_url" "text"
);


ALTER TABLE "public"."community_login_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_members" (
    "profile_id" "uuid" NOT NULL,
    "community_id" "uuid" NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "onboarding_completed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."community_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."community_profile_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "community_id" "uuid",
    "section" "text" NOT NULL,
    "field_definitions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."community_profile_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."community_profile_settings" IS 'Stores community-specific profile field definitions';



COMMENT ON COLUMN "public"."community_profile_settings"."field_definitions" IS 'Array of field definitions with structure: [{name, type, required, options, help_text, display_order}]';



CREATE TABLE IF NOT EXISTS "public"."community_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "community_id" "uuid" NOT NULL,
    "login_customization" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."community_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."current_status" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "profile_id" "uuid",
    "job_satisfaction" "public"."job_satisfaction",
    "current_job_title" "text",
    "employer" "text",
    "gross_salary" numeric,
    "salary_currency" "text",
    "salary_interval" "public"."salary_interval",
    "perks" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "community_metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."current_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "role" "public"."user_role" NOT NULL,
    "profile_complete" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "onboarding_step" integer DEFAULT 1 NOT NULL,
    "community_metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "timestamp" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


ALTER TABLE ONLY "public"."career_settings"
    ADD CONSTRAINT "career_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_custom_domain_key" UNIQUE ("custom_domain");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_login_settings"
    ADD CONSTRAINT "community_login_settings_community_id_key" UNIQUE ("community_id");



ALTER TABLE ONLY "public"."community_login_settings"
    ADD CONSTRAINT "community_login_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_pkey" PRIMARY KEY ("profile_id", "community_id");



ALTER TABLE ONLY "public"."community_profile_settings"
    ADD CONSTRAINT "community_profile_settings_community_id_section_key" UNIQUE ("community_id", "section");



ALTER TABLE ONLY "public"."community_profile_settings"
    ADD CONSTRAINT "community_profile_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_settings"
    ADD CONSTRAINT "community_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."current_status"
    ADD CONSTRAINT "current_status_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."community_settings"
    ADD CONSTRAINT "unique_community_settings" UNIQUE ("community_id");



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "unique_slug" UNIQUE ("slug");



CREATE INDEX "idx_career_settings_community_metadata" ON "public"."career_settings" USING "gin" ("community_metadata");



CREATE INDEX "idx_career_settings_metadata" ON "public"."career_settings" USING "gin" ("metadata");



CREATE INDEX "idx_communities_custom_domain" ON "public"."communities" USING "btree" ("custom_domain");



CREATE INDEX "idx_current_status_community_metadata" ON "public"."current_status" USING "gin" ("community_metadata");



CREATE INDEX "idx_current_status_metadata" ON "public"."current_status" USING "gin" ("metadata");



CREATE INDEX "rate_limits_key_timestamp_idx" ON "public"."rate_limits" USING "btree" ("key", "timestamp");



CREATE OR REPLACE TRIGGER "update_career_settings_updated_at" BEFORE UPDATE ON "public"."career_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_communities_updated_at" BEFORE UPDATE ON "public"."communities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_community_login_settings_updated_at" BEFORE UPDATE ON "public"."community_login_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_community_profile_settings_updated_at" BEFORE UPDATE ON "public"."community_profile_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_current_status_updated_at" BEFORE UPDATE ON "public"."current_status" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "validate_community_settings_trigger" BEFORE INSERT OR UPDATE ON "public"."communities" FOR EACH ROW EXECUTE FUNCTION "public"."validate_community_settings"();



CREATE OR REPLACE TRIGGER "validate_custom_domain_trigger" BEFORE INSERT OR UPDATE OF "custom_domain" ON "public"."communities" FOR EACH ROW EXECUTE FUNCTION "public"."validate_custom_domain"();



ALTER TABLE ONLY "public"."communities"
    ADD CONSTRAINT "communities_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_login_settings"
    ADD CONSTRAINT "community_login_settings_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_members"
    ADD CONSTRAINT "community_members_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_profile_settings"
    ADD CONSTRAINT "community_profile_settings_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."community_settings"
    ADD CONSTRAINT "community_settings_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Allow community owners to update their login settings" ON "public"."community_login_settings" TO "authenticated" USING (("community_id" IN ( SELECT "communities"."id"
   FROM "public"."communities"
  WHERE ("communities"."owner_id" = "auth"."uid"())))) WITH CHECK (("community_id" IN ( SELECT "communities"."id"
   FROM "public"."communities"
  WHERE ("communities"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Allow public read access to login settings" ON "public"."community_login_settings" FOR SELECT USING (true);



CREATE POLICY "Communities delete for community owners" ON "public"."communities" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "owner_id"));



CREATE POLICY "Communities insert for authenticated users" ON "public"."communities" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Communities read access for all users" ON "public"."communities" FOR SELECT USING (true);



CREATE POLICY "Communities update for community owners" ON "public"."communities" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "owner_id")) WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Community owners can manage their profile settings" ON "public"."community_profile_settings" USING (("community_id" IN ( SELECT "communities"."id"
   FROM "public"."communities"
  WHERE ("communities"."owner_id" = "auth"."uid"()))));



CREATE POLICY "Community settings read access for all users" ON "public"."community_settings" FOR SELECT USING (true);



CREATE POLICY "Community settings update for community owners" ON "public"."community_settings" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."communities" "c"
  WHERE (("c"."id" = "community_settings"."community_id") AND ("c"."owner_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."communities" "c"
  WHERE (("c"."id" = "community_settings"."community_id") AND ("c"."owner_id" = "auth"."uid"())))));



CREATE POLICY "System access only" ON "public"."rate_limits" USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Users can delete their own career settings" ON "public"."career_settings" FOR DELETE USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can delete their own current status" ON "public"."current_status" FOR DELETE USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own career settings" ON "public"."career_settings" FOR INSERT WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can insert their own current status" ON "public"."current_status" FOR INSERT WITH CHECK (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own career settings" ON "public"."career_settings" FOR UPDATE USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own current status" ON "public"."current_status" FOR UPDATE USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own membership" ON "public"."community_members" FOR UPDATE USING (("auth"."uid"() = "profile_id")) WITH CHECK (("auth"."uid"() = "profile_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can view other members in their communities" ON "public"."community_members" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."community_members" "cm"
  WHERE (("cm"."community_id" = "community_members"."community_id") AND ("cm"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can view their own career settings" ON "public"."career_settings" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own current status" ON "public"."current_status" FOR SELECT USING (("profile_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own memberships" ON "public"."community_members" FOR SELECT USING (("auth"."uid"() = "profile_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."career_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."communities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_login_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_profile_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."community_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."current_status" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."citextin"("cstring") TO "postgres";
GRANT ALL ON FUNCTION "public"."citextin"("cstring") TO "anon";
GRANT ALL ON FUNCTION "public"."citextin"("cstring") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citextin"("cstring") TO "service_role";



GRANT ALL ON FUNCTION "public"."citextout"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citextout"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citextout"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citextout"("public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citextrecv"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."citextrecv"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."citextrecv"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citextrecv"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."citextsend"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citextsend"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citextsend"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citextsend"("public"."citext") TO "service_role";



GRANT ALL ON TYPE "public"."user_role" TO "anon";
GRANT ALL ON TYPE "public"."user_role" TO "authenticated";
GRANT ALL ON TYPE "public"."user_role" TO "service_role";
GRANT ALL ON TYPE "public"."user_role" TO "supabase_auth_admin";



GRANT ALL ON FUNCTION "public"."citext"(boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."citext"(boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."citext"(boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext"(boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."citext"(character) TO "postgres";
GRANT ALL ON FUNCTION "public"."citext"(character) TO "anon";
GRANT ALL ON FUNCTION "public"."citext"(character) TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext"(character) TO "service_role";



GRANT ALL ON FUNCTION "public"."citext"("inet") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext"("inet") TO "anon";
GRANT ALL ON FUNCTION "public"."citext"("inet") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext"("inet") TO "service_role";















































































































































































































GRANT ALL ON FUNCTION "public"."check_community_membership"("file_path" "text", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_community_membership"("file_path" "text", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_community_membership"("file_path" "text", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_community_ownership"("file_path" "text", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_community_ownership"("file_path" "text", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_community_ownership"("file_path" "text", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_cmp"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_cmp"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_cmp"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_cmp"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_eq"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_eq"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_eq"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_eq"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_ge"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_ge"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_ge"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_ge"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_gt"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_gt"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_gt"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_gt"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_hash"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_hash"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_hash"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_hash"("public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_hash_extended"("public"."citext", bigint) TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_hash_extended"("public"."citext", bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."citext_hash_extended"("public"."citext", bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_hash_extended"("public"."citext", bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_larger"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_larger"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_larger"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_larger"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_le"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_le"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_le"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_le"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_lt"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_lt"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_lt"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_lt"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_ne"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_ne"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_ne"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_ne"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_cmp"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_cmp"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_cmp"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_cmp"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_ge"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_ge"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_ge"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_ge"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_gt"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_gt"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_gt"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_gt"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_le"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_le"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_le"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_le"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_pattern_lt"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_pattern_lt"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_pattern_lt"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_pattern_lt"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."citext_smaller"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."citext_smaller"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."citext_smaller"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."citext_smaller"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."clean_old_rate_limits"() TO "anon";
GRANT ALL ON FUNCTION "public"."clean_old_rate_limits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."clean_old_rate_limits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_auth_user_created"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_match"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_matches"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_replace"("public"."citext", "public"."citext", "text", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_split_to_array"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."regexp_split_to_table"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."replace"("public"."citext", "public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."replace"("public"."citext", "public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."replace"("public"."citext", "public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."replace"("public"."citext", "public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_claim"("uid" "uuid", "claim" "text", "value" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."split_part"("public"."citext", "public"."citext", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."split_part"("public"."citext", "public"."citext", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."split_part"("public"."citext", "public"."citext", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."split_part"("public"."citext", "public"."citext", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."strpos"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."strpos"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."strpos"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."strpos"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticlike"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticnlike"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticregexeq"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."texticregexne"("public"."citext", "public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."translate"("public"."citext", "public"."citext", "text") TO "postgres";
GRANT ALL ON FUNCTION "public"."translate"("public"."citext", "public"."citext", "text") TO "anon";
GRANT ALL ON FUNCTION "public"."translate"("public"."citext", "public"."citext", "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."translate"("public"."citext", "public"."citext", "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_community_settings"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_community_settings"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_community_settings"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_custom_domain"() TO "anon";
GRANT ALL ON FUNCTION "public"."validate_custom_domain"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_custom_domain"() TO "service_role";



GRANT ALL ON FUNCTION "public"."max"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."max"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."max"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."max"("public"."citext") TO "service_role";



GRANT ALL ON FUNCTION "public"."min"("public"."citext") TO "postgres";
GRANT ALL ON FUNCTION "public"."min"("public"."citext") TO "anon";
GRANT ALL ON FUNCTION "public"."min"("public"."citext") TO "authenticated";
GRANT ALL ON FUNCTION "public"."min"("public"."citext") TO "service_role";
























GRANT ALL ON TABLE "public"."career_settings" TO "anon";
GRANT ALL ON TABLE "public"."career_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."career_settings" TO "service_role";



GRANT ALL ON TABLE "public"."communities" TO "anon";
GRANT ALL ON TABLE "public"."communities" TO "authenticated";
GRANT ALL ON TABLE "public"."communities" TO "service_role";



GRANT UPDATE("onboarding_completed") ON TABLE "public"."communities" TO "authenticated";



GRANT ALL ON TABLE "public"."community_login_settings" TO "anon";
GRANT ALL ON TABLE "public"."community_login_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."community_login_settings" TO "service_role";



GRANT ALL ON TABLE "public"."community_members" TO "anon";
GRANT ALL ON TABLE "public"."community_members" TO "authenticated";
GRANT ALL ON TABLE "public"."community_members" TO "service_role";
GRANT ALL ON TABLE "public"."community_members" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."community_profile_settings" TO "anon";
GRANT ALL ON TABLE "public"."community_profile_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."community_profile_settings" TO "service_role";



GRANT ALL ON TABLE "public"."community_settings" TO "anon";
GRANT ALL ON TABLE "public"."community_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."community_settings" TO "service_role";



GRANT ALL ON TABLE "public"."current_status" TO "anon";
GRANT ALL ON TABLE "public"."current_status" TO "authenticated";
GRANT ALL ON TABLE "public"."current_status" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";
GRANT ALL ON TABLE "public"."profiles" TO "supabase_auth_admin";



GRANT ALL ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
