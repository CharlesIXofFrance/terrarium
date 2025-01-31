-- Create enum types for common fields
CREATE TYPE job_satisfaction AS ENUM ('very_satisfied', 'satisfied', 'neutral', 'not_satisfied', 'very_not_satisfied');
CREATE TYPE opportunity_status AS ENUM ('looking_actively', 'open_to_opportunities', 'not_open');
CREATE TYPE attendance_model AS ENUM ('office', 'hybrid', 'remote');
CREATE TYPE salary_interval AS ENUM ('yearly', 'monthly');
CREATE TYPE custom_field_type AS ENUM ('text', 'number', 'date', 'dropdown', 'multi_select', 'boolean');

-- Add new columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS birthdate DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

-- Create current_status table
CREATE TABLE IF NOT EXISTS current_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_satisfaction job_satisfaction,
  current_job_title TEXT,
  employer TEXT,
  gross_salary NUMERIC,
  salary_currency TEXT,
  salary_interval salary_interval,
  perks JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create career_settings table
CREATE TABLE IF NOT EXISTS career_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  openness_to_opportunities opportunity_status DEFAULT 'not_open',
  desired_salary NUMERIC,
  desired_salary_currency TEXT,
  desired_salary_interval salary_interval,
  desired_roles TEXT[],
  desired_attendance_models attendance_model[],
  desired_locations TEXT[],
  desired_company_types TEXT[],
  desired_industry_types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create custom_fields table
CREATE TABLE IF NOT EXISTS custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  field_type custom_field_type NOT NULL,
  field_options JSONB,
  is_required BOOLEAN DEFAULT FALSE,
  section TEXT NOT NULL, -- 'background', 'current_status', 'career_settings'
  display_order INTEGER NOT NULL,
  icon TEXT,
  help_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE (community_id, field_name)
);

-- Create custom_field_values table
CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  custom_field_id UUID REFERENCES custom_fields(id) ON DELETE CASCADE,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE (profile_id, custom_field_id)
);

-- Add RLS policies
ALTER TABLE current_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_field_values ENABLE ROW LEVEL SECURITY;

-- Current status policies
CREATE POLICY "Users can view their own current status"
  ON current_status FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own current status"
  ON current_status FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own current status"
  ON current_status FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete their own current status"
  ON current_status FOR DELETE
  USING (profile_id = auth.uid());

-- Career settings policies
CREATE POLICY "Users can view their own career settings"
  ON career_settings FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own career settings"
  ON career_settings FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own career settings"
  ON career_settings FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete their own career settings"
  ON career_settings FOR DELETE
  USING (profile_id = auth.uid());

-- Custom fields policies
CREATE POLICY "Anyone can view custom fields"
  ON custom_fields FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Community owners can manage custom fields"
  ON custom_fields FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM communities c
      WHERE c.id = custom_fields.community_id
      AND c.owner_id = auth.uid()
    )
  );

-- Custom field values policies
CREATE POLICY "Users can view their own custom field values"
  ON custom_field_values FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can update their own custom field values"
  ON custom_field_values FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own custom field values"
  ON custom_field_values FOR INSERT
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete their own custom field values"
  ON custom_field_values FOR DELETE
  USING (profile_id = auth.uid());

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_current_status_updated_at
  BEFORE UPDATE ON current_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_settings_updated_at
  BEFORE UPDATE ON career_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_fields_updated_at
  BEFORE UPDATE ON custom_fields
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_field_values_updated_at
  BEFORE UPDATE ON custom_field_values
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
