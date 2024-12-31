/**
 * AI Context:
 * This migration adds support for community-specific login page customization. It's located in the
 * migrations directory as it defines the database schema changes needed for this feature.
 *
 * The migration:
 * 1. Creates community_settings table if it doesn't exist
 * 2. Adds a login_customization JSONB column to community_settings for storing branding options
 * 3. Creates RLS policies to:
 *    - Allow public read access (needed for the login page)
 *    - Restrict write access to community owners only
 *
 * Using JSONB allows for flexible customization options without needing additional schema changes.
 * The RLS policies ensure proper access control while still allowing the login page to work for
 * unauthenticated users.
 */

-- Create community_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS community_settings (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    community_id uuid REFERENCES communities(id) ON DELETE CASCADE NOT NULL,
    login_customization JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT unique_community_settings UNIQUE (community_id)
);

-- Enable RLS on community_settings
ALTER TABLE community_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for community_settings table
DROP POLICY IF EXISTS "Community settings read access for all users" ON community_settings;
DROP POLICY IF EXISTS "Community settings update for community owners" ON community_settings;

CREATE POLICY "Community settings read access for all users"
    ON community_settings FOR SELECT
    USING (true);

CREATE POLICY "Community settings update for community owners"
    ON community_settings FOR UPDATE
    TO authenticated
    USING (EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_settings.community_id
        AND c.owner_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM communities c
        WHERE c.id = community_settings.community_id
        AND c.owner_id = auth.uid()
    ));
