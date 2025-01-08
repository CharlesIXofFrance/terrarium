-- Drop the previous custom fields tables if they exist
DROP TABLE IF EXISTS custom_field_values;
DROP TABLE IF EXISTS custom_fields;

-- Update profiles table to include metadata
ALTER TABLE profiles
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN community_metadata JSONB DEFAULT '{}'::jsonb;

-- Update current_status table to include metadata
ALTER TABLE current_status
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN community_metadata JSONB DEFAULT '{}'::jsonb;

-- Update career_settings table to include metadata
ALTER TABLE career_settings
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN community_metadata JSONB DEFAULT '{}'::jsonb;

-- Create community profile settings table for field definitions
CREATE TABLE community_profile_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    section TEXT NOT NULL, -- 'profile', 'current_status', or 'career_settings'
    field_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(community_id, section)
);

-- Add RLS policies
ALTER TABLE community_profile_settings ENABLE ROW LEVEL SECURITY;

-- Community owners can manage their profile settings
CREATE POLICY "Community owners can manage their profile settings"
    ON community_profile_settings
    FOR ALL
    USING (community_id IN (
        SELECT id FROM communities WHERE owner_id = auth.uid()
    ));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updating timestamps
CREATE TRIGGER update_community_profile_settings_updated_at
    BEFORE UPDATE ON community_profile_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_profiles_metadata ON profiles USING GIN (metadata);
CREATE INDEX idx_profiles_community_metadata ON profiles USING GIN (community_metadata);
CREATE INDEX idx_current_status_metadata ON current_status USING GIN (metadata);
CREATE INDEX idx_current_status_community_metadata ON current_status USING GIN (community_metadata);
CREATE INDEX idx_career_settings_metadata ON career_settings USING GIN (metadata);
CREATE INDEX idx_career_settings_community_metadata ON career_settings USING GIN (community_metadata);

COMMENT ON TABLE community_profile_settings IS 'Stores community-specific profile field definitions';
COMMENT ON COLUMN community_profile_settings.field_definitions IS 'Array of field definitions with structure: [{name, type, required, options, help_text, display_order}]';
