/*
---
affected_tables: []
dependencies: []
description: 'Fix auth schema grants

  Migrated from legacy format.'
id: 20250204100600_fix_auth_schema_grants
rollback: '-- To be added

  DROP FUNCTION IF EXISTS function_name CASCADE;'
title: Fix auth schema grants

---
*/

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO anon;

-- Grant access to rate_limits sequence
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA auth TO anon;

-- Grant access to rate_limits table
GRANT SELECT, INSERT, UPDATE ON auth.rate_limits TO authenticated;
GRANT SELECT, INSERT, UPDATE ON auth.rate_limits TO anon;

-- Enable RLS
ALTER TABLE auth.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read rate limits"
    ON auth.rate_limits FOR SELECT
    USING (true);

CREATE POLICY "Anyone can insert rate limits"
    ON auth.rate_limits FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Anyone can update rate limits"
    ON auth.rate_limits FOR UPDATE
    USING (true);
