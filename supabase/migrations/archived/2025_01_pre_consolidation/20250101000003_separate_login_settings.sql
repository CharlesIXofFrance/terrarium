-- Create a new table for community login settings
CREATE TABLE community_login_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  title TEXT NOT NULL DEFAULT 'Welcome Back',
  subtitle TEXT NOT NULL DEFAULT 'Sign in to your account',
  welcome_message TEXT,
  button_text TEXT NOT NULL DEFAULT 'Sign In',
  background_color TEXT NOT NULL DEFAULT '#FFFFFF',
  text_color TEXT NOT NULL DEFAULT '#000000',
  side_image_url TEXT,
  UNIQUE(community_id)
);

-- Add RLS policies for the new table
ALTER TABLE community_login_settings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read login settings (they need to be public for the login page)
CREATE POLICY "Allow public read access to login settings" 
  ON community_login_settings
  FOR SELECT
  TO public
  USING (true);

-- Allow community owners to update their own login settings
CREATE POLICY "Allow community owners to update their login settings" 
  ON community_login_settings
  FOR ALL
  TO authenticated
  USING (
    community_id IN (
      SELECT id FROM communities 
      WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    community_id IN (
      SELECT id FROM communities 
      WHERE owner_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for updating the updated_at column
CREATE TRIGGER update_community_login_settings_updated_at
    BEFORE UPDATE ON community_login_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing login settings to the new table
INSERT INTO community_login_settings (
  community_id,
  title,
  subtitle,
  welcome_message,
  button_text,
  background_color,
  text_color
)
SELECT 
  id as community_id,
  COALESCE((settings->'branding'->'login'->>'title')::TEXT, 'Welcome Back'),
  COALESCE((settings->'branding'->'login'->>'subtitle')::TEXT, 'Sign in to your account'),
  (settings->'branding'->'login'->>'welcomeMessage')::TEXT,
  COALESCE((settings->'branding'->'login'->>'buttonText')::TEXT, 'Sign In'),
  COALESCE((settings->'branding'->'login'->>'backgroundColor')::TEXT, '#FFFFFF'),
  COALESCE((settings->'branding'->'login'->>'textColor')::TEXT, '#000000')
FROM communities;

-- Remove login settings from communities table
UPDATE communities
SET settings = settings #- '{branding,login}'
WHERE settings->'branding'->'login' IS NOT NULL;
