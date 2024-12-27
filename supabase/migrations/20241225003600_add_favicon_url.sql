-- Add favicon_url column to communities table
ALTER TABLE public.communities ADD COLUMN IF NOT EXISTS favicon_url text;
