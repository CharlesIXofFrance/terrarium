-- Create auth schema
CREATE SCHEMA IF NOT EXISTS auth;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA public;

-- Set search path
ALTER DATABASE postgres SET search_path TO public, auth;