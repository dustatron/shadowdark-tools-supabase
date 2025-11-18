-- Migration: Create official_magic_items table
-- Feature: 011-i-would-to
-- Date: 2025-11-17

-- Ensure pg_trgm extension is enabled for fuzzy search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create official_magic_items table
CREATE TABLE IF NOT EXISTS public.official_magic_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  traits JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT magic_item_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT magic_item_slug_format CHECK (slug ~ '^[a-z0-9_-]+$'),
  CONSTRAINT magic_item_description_not_empty CHECK (LENGTH(TRIM(description)) > 0),
  CONSTRAINT magic_item_traits_is_array CHECK (jsonb_typeof(traits) = 'array')
);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at_official_magic_items
  BEFORE UPDATE ON public.official_magic_items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE UNIQUE INDEX idx_magic_items_slug ON public.official_magic_items(slug);
CREATE INDEX idx_magic_items_name_trgm ON public.official_magic_items USING GIN (name gin_trgm_ops);

-- Full-text search index
CREATE INDEX idx_magic_items_search ON public.official_magic_items USING GIN (
  to_tsvector('english',
    COALESCE(name, '') || ' ' ||
    COALESCE(description, '')
  )
);

-- Enable Row Level Security
ALTER TABLE public.official_magic_items ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public read access
CREATE POLICY "Public read access" ON public.official_magic_items
  FOR SELECT
  USING (true);

-- Comments
COMMENT ON TABLE public.official_magic_items IS 'Official Shadowdark magic items';
COMMENT ON COLUMN public.official_magic_items.id IS 'Unique magic item identifier';
COMMENT ON COLUMN public.official_magic_items.name IS 'Display name of the magic item';
COMMENT ON COLUMN public.official_magic_items.slug IS 'URL-safe unique identifier';
COMMENT ON COLUMN public.official_magic_items.description IS 'Detailed description of the magic item';
COMMENT ON COLUMN public.official_magic_items.traits IS 'Array of trait objects (e.g., rarity, attunement)';
COMMENT ON COLUMN public.official_magic_items.created_at IS 'Record creation timestamp';
COMMENT ON COLUMN public.official_magic_items.updated_at IS 'Last modification timestamp';
